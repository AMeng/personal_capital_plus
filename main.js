let OBSERVATIONS = { childList: true, subtree: true };
let OPTIONS = {};
let LOAD_TIMEOUT_MS = 5000;
let OPTIONS_URL = chrome.runtime.getURL('options.html');
chrome.storage.sync.get("options", function (obj) {
  if (obj.options) {
    OPTIONS = obj.options;
  }
});

// Get all the sections in the sidebar.
function getAccountSections(sidebarElement) {
  return sidebarElement.querySelectorAll('.transition-\\[height\\].ease-in-out');
}

// Get all the sections in the sidebar.
function getAccountSectionHeaders(sidebarElement) {
  
}

// Get all the accounts in a section of the sidebar
function getAccounts(sectionElement) {
  return sectionElement.querySelectorAll(':scope > div');
}

function getAccountValue(accountElement) {
  const valueText = accountElement.querySelector(".sr-only").textContent;
  return Number(valueText.replace(/[^-0-9\.]+/g, ""));
}

// Hide an element. Permanent unless temporary is specified.
function hideElement(element, { temporary = false } = {}) {
  if (element) {
    element.style.setProperty('display', 'none', temporary ? '' : 'important');
  }
}

// Show a hidden element.
function showElement(element) {
  if (element) {
    element.style.setProperty('display', 'block');
  }
}

function addOptionsLink(menuElement) {
  const ul = menuElement.querySelector('ul');
  if (!ul) return;
  if (ul.querySelector(`a[href="${OPTIONS_URL}"]`)) return;

  const optionsLi = ul.querySelector('li').cloneNode(true);
  const optionsA = optionsLi.querySelector('div a')
  optionsA.href = OPTIONS_URL;
  optionsA['aria-label'] = 'Extension';
  optionsA.textContent = 'Extension';
  optionsA.target = '_blank';

  ul.appendChild(optionsLi);
}

function sortBalances(sidebarElement) {
  getAccountSections(sidebarElement).forEach(function(sectionElement) {
    let accounts = Array.from(getAccounts(sectionElement));

    let accountData = accounts.map(accountElement => {
      const value = getAccountValue(accountElement);
      return { accountElement, value };
    });

    let sorted = accountData.every((item, idx, arr) => {
      return idx === 0 || arr[idx-1].value >= item.value;
    });
    if (sorted) return;

    accountData.sort((a, b) => b.value - a.value);
    accountData.forEach(({ accountElement }) => sectionElement.appendChild(accountElement));
  });
}

function condenseBalances(sidebarElement) {
  const OLD_HEIGHT = 68;
  const NEW_HEIGHT = 56;
  const SECTION_HEIGHT = 38;

  getAccountSections(sidebarElement).forEach(function(sectionElement) {
    if (sectionElement.style.height !== '0px') {
      let accounts = Array.from(getAccounts(sectionElement)).filter(div => getComputedStyle(div).display !== 'none');
      let height = accounts.length * NEW_HEIGHT;
      sectionElement.style.height = `${height}px`;
    }
  });

  sidebarElement.querySelectorAll(`span.h-\\[${OLD_HEIGHT}px\\]`).forEach(function(element) {
    element.classList.replace(`h-[${OLD_HEIGHT}px]`,`h-[${SECTION_HEIGHT}px]`);
    element.classList.replace('p-4','p-2');
  });

  sidebarElement.querySelectorAll(`div.h-\\[${OLD_HEIGHT}px\\]`).forEach(function(element) {
    element.classList.replace(`h-[${OLD_HEIGHT}px]`,`h-[${NEW_HEIGHT}px]`);
  });
}

function hideZeroBalances(sidebarElement) {
  getAccountSections(sidebarElement).forEach(function(sectionElement) {
    getAccounts(sectionElement).forEach(function(accountElement) {
      if (getAccountValue(accountElement) === 0) {
        hideElement(accountElement);
      }
    });
  });
}

function hideAccountChanges(sidebarElement) {
  // Hide net worth changes
  let netWorthChangeSymbold = sidebarElement.querySelector('svg')
  let netWorthChangeContainer = netWorthChangeSymbold.parentElement;
  let netWorthChangeButtons = netWorthChangeContainer.nextElementSibling;
  
  hideElement(netWorthChangeContainer);
  hideElement(netWorthChangeButtons);

  // Hide change arrows
  sidebarElement.querySelectorAll('svg[aria-label]:not([aria-label=""])').forEach(function(element) {
    hideElement(element);
  });

  getAccountSections(sidebarElement).forEach(function(sectionElement) {
    // Hide section changes
    let sectionChangeContainer = sectionElement.previousElementSibling.firstChild;
    if (sectionChangeContainer.childElementCount > 1) {
      let valuesContainer = sectionChangeContainer.lastChild;
      if (valuesContainer.childElementCount > 1) {
        let sectionChangeElement = valuesContainer.lastChild;
        hideElement(sectionChangeElement);
      }
    }

    // Hide account changes
    getAccounts(sectionElement).forEach(function(accountElement) {
      accountElement.querySelectorAll('[data-testid="performance-change-text"]').forEach(function(element) {
        hideElement(element);
      });
    });
  });
}

function hideNetWorth(sidebarElement) {
  let netWorthElement, netWorthBlockerElement;

  if (!sidebarElement.querySelector('#pcp_networth_blocker')) {
    netWorthElement = sidebarElement.querySelector('#networth-balance');
    netWorthBlockerElement = netWorthElement.cloneNode()
    netWorthBlockerElement.id = 'pcp_networth_blocker';
    netWorthBlockerElement.innerText = netWorthElement.innerText.replace(/\d/g, '*')
    netWorthElement.parentNode.insertBefore(netWorthBlockerElement, netWorthElement.nextSibling);
    hideElement(netWorthElement, { temporary: true });

    netWorthBlockerElement.onmouseover = function () {
      hideElement(netWorthBlockerElement, { temporary: true });
      showElement(netWorthElement);
    };

    netWorthElement.onmouseout = function () {
      hideElement(netWorthElement, { temporary: true });
      showElement(netWorthBlockerElement);
    };
  }
}

function handleSidebarChange(sidebarElement) {
  if (OPTIONS.hideNetWorth) {
    hideNetWorth(sidebarElement);
  }
  if (OPTIONS.hideZeroBalances) {
    hideZeroBalances(sidebarElement);
  }
  if (OPTIONS.sortBalances) {
    sortBalances(sidebarElement);
  }
  if (OPTIONS.condenseBalances) {
    condenseBalances(sidebarElement);
  }
  if (OPTIONS.hideAccountChanges) {
    hideAccountChanges(sidebarElement);
  }
}

/*
When an element matching the provided selector is loaded, add an observer to
it that runs the provided function every time the element changes. The
element may not exist even when the page is first loaded.

Waits up to $LOAD_TIMEOUT_MS milliseconds.
*/
async function addObserverToElement(selector, fn) {
  const element = await Promise.race([
    new Promise(resolve => {
      const element = document.querySelector(selector);
      if (element) return resolve(element);
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });
      observer.observe(document, OBSERVATIONS);
    }),
    new Promise(resolve => setTimeout(() => resolve(null), LOAD_TIMEOUT_MS)),
  ]);
  
  if (element) {
    const observer = new MutationObserver(() => {
      observer.disconnect();
      fn(element);
      observer.observe(element, OBSERVATIONS);
    });
    observer.observe(element, OBSERVATIONS);
  }
}

/*
Primary entry point when the page loads
*/
window.addEventListener('load', function() {
  addObserverToElement('#dropdown-menu-user-profile', addOptionsLink);
  addObserverToElement('#sidebar-container', handleSidebarChange);
});

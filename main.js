NodeList.prototype['forEach'] = HTMLCollection.prototype['forEach'] = Array.prototype['forEach'];

var OBSERVATIONS = { childList: true, subtree: true };
var OPTIONS = {};
chrome.storage.sync.get("options", function (obj) {
  if (obj.options) {
    OPTIONS = obj.options;
  }
});

var netWorthHidden = false;
var isObserving = true;
var sidebarChangeCount = 0;
var hasOptionsLink = document.querySelectorAll('a.pcplus-options').length > 0;
if (!hasOptionsLink) {
  var header, optionsUrl;

  optionsUrl = chrome.extension.getURL('options.html');
  header = document.querySelector('ul.submenu--settings');
  header.insertAdjacentHTML(
    'beforeend',
    "<li class='menu__item'><a href='" + optionsUrl + "' class='menu__action pcplus-options' target='_blank'>Extension</a></li>"
  );
}

function sortBalances(sortOrder, sortList) {
  var arr, accounts, parentNode, i;

  arr = [];
  parentNode = sortList || this.nextElementSibling;
  accounts = parentNode.querySelectorAll("li.sidebar-account");

  accounts.forEach(function(n) {
    arr.push(n)
  });
  arr.sort(function(a, b) {
    var result, keyA, keyB;
    var currencyA = a.querySelector(".sidebar-account__value").textContent;
    var currencyB = b.querySelector(".sidebar-account__value").textContent;
    keyA = Number(currencyA.replace(/[^-0-9\.]+/g, ""));
    keyB = Number(currencyB.replace(/[^-0-9\.]+/g, ""));
    result = (keyA - keyB) * sortOrder;
    return result;
  });

  i = 0;
  while (arr.length) {
    parentNode.insertBefore(arr.pop(), parentNode.childNodes[i++]);
  }
  arr = null;
}

function setupSidebarObserver() {
  var container, observer;

  container = document.querySelector('.sidebar__body')
  observer = new window.MutationObserver(function(mutations) {
    var observationDelay;

    observer.disconnect();
    sidebarChangeCount += 1;

    if (OPTIONS.hideZeroBalances) {
      hideAccounts();
    }
    if (OPTIONS.sortBalances) {
      document.querySelectorAll('.sidebar-account__group > div ul').forEach(function(element) {
        classList = element.parentElement.parentElement.classList
        if (classList.contains("CREDIT_CARD")) {
          sortBalances(-1, element);
        } else if (!classList.contains("NEEDS_ATTENTION") && !classList.contains("IN_PROGRESS")) {
          sortBalances(1, element);
        }
      });
    }
    if (OPTIONS.condenseBalances) {
      condenseBalances();
    }
    if (OPTIONS.hideBackgroundGraphs) {
      document.querySelectorAll('svg.js-acc-group-balances-chart').forEach(function(element) {
        element.remove();
      })
    }
    if (OPTIONS.hideNetWorth) {
      hideNetWorth();
    }
    if (sidebarChangeCount > 3) {
      observationDelay = 500;
    }
    // When the page first loads, there are a few quick successive changes to the sidebar.
    // We don't want to miss any of these, so we let the observer fire quickly at first.
    // After 5 observations, a delay of 500ms is added to the listener.
    // We do this because under some conditions (such as when updating accounts manually),
    // the observer will fire infinitley and freeze the tab.
    setTimeout(function(){observer.observe(container, OBSERVATIONS);}, observationDelay);
  });
  observer.observe(container, OBSERVATIONS);
}

function condenseBalances() {
  document.querySelectorAll('.sidebar-account__header').forEach(function(element) {
    element.style.padding = "4px 24px 4px 0px";
  });
  document.querySelectorAll('.sidebar-account__group-header').forEach(function(element) {
    element.style.padding = "6px 24px 6px 24px";
  });
}

function hideAccounts() {
  var accounts;

  accounts = document.querySelectorAll(".sidebar-account.normal");
  accounts.forEach(function(element) {
    if (!element.classList.contains('error')) {
      var balance = element.querySelector(".sidebar-account__value").textContent;
      if (balance.trim().replace("$", "") == "0.00") {
        element.parentElement.removeChild(element)
      }
    }
  });
}

function hideNetWorth() {
  var netWorthElement, netWorthBlockerElement;

  if (!netWorthHidden) {
    netWorthElement = document.querySelector('.sidebar__networth-amount');
    netWorthBlockerElement = netWorthElement.cloneNode()
    netWorthBlockerElement.className = "sidebar__networth-amount";
    netWorthBlockerElement.innerText = "$******"
    netWorthElement.parentNode.insertBefore(netWorthBlockerElement, netWorthElement.nextSibling);
    netWorthElement.style.display = "none";
    netWorthBlockerElement.onmouseover = function () {
      netWorthElement.style.display = "block";
      netWorthBlockerElement.style.display = "none";
    };
    netWorthElement.onmouseout = function () {
      netWorthElement.style.display = "none";
      netWorthBlockerElement.style.display = "block";
    };
    netWorthHidden = true;
  }
}

(function() {
  var observer, target;

  target = document.getElementsByTagName('body')[0];
  observer = new window.MutationObserver(function(mutations) {
    observer.disconnect();
    setupSidebarObserver();
  });
  observer.observe(target, OBSERVATIONS);
})();

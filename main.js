NodeList.prototype['forEach'] = HTMLCollection.prototype['forEach'] = Array.prototype['forEach'];

var OBSERVATIONS = { childList: true, subtree: true };
var OPTIONS = {};
chrome.storage.sync.get("options", function (obj) {
    if (obj.options) {
      OPTIONS = obj.options;
    }
});

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
    var currencyA = a.querySelector("h4.sidebar-account__value").textContent;
    var currencyB = b.querySelector("h4.sidebar-account__value").textContent;
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

function setupRefreshObserver() {
  var container, refreshObserver;

  container = document.querySelector('div#sidebarContent');
  refreshObserver = new window.MutationObserver(function(mutations) {
    refreshObserver.disconnect();
    if (OPTIONS.hideZeroBalances) {
      hideAccounts();
    }
    if (OPTIONS.hideHelpButton) {
      hideHelpButton();
    }
    if (OPTIONS.widescreenMode) {
      enabledWidescreen();
    }
    if (OPTIONS.sortBalances) {
      document.querySelectorAll('div.sidebar-account__group-header + div ul').forEach(function(element) {
        if (element.parentElement.parentElement.classList.contains("CREDIT_CARD")) {
          sortBalances(-1, element);
        } else {
          sortBalances(1, element);
        }
      });
    }
    if (OPTIONS.condenseBalances) {
      condenseBalances();
    }
    if (OPTIONS.hideBackgroundGraphs) {
      document.querySelectorAll('div.sidebar__balances-container').forEach(function(element) {
        element.remove();
      })
    }
    if (OPTIONS.hideNetWorth) {
      hiddenNetWorthValue = "$***.**";
      netWorthSpan = document.querySelector('span.sidebar__networth-amount');
      originalValue = netWorthSpan.innerText;
      netWorthSpan.innerText = hiddenNetWorthValue;
      netWorthSpan.onmouseover = function () {
        netWorthSpan.innerText = originalValue;
      };
      netWorthSpan.onmouseout = function () {
        netWorthSpan.innerText = hiddenNetWorthValue;
      };
    }
    refreshObserver.observe(container, OBSERVATIONS);
  });
  refreshObserver.observe(container, OBSERVATIONS);
}

function condenseBalances() {
  document.querySelectorAll('div.sidebar-account__header').forEach(function(element) {
    element.style.padding = "4px 24px 4px 0px";
  });
  document.querySelectorAll('div.sidebar-account__group-header').forEach(function(element) {
    element.style.padding = "6px 24px 6px 24px";
  });
  document.querySelectorAll('div.pc-toggle--caret-white').forEach(function(element) {
    element.style.top = "18px";
  });
}

function hideAccounts() {
  var accounts;

  accounts = document.querySelectorAll("li.sidebar-account");
  accounts.forEach(function(element) {
    if (!element.classList.contains('error')) {
      var balance = element.querySelector("h4.sidebar-account__value").textContent;
      if (balance.trim() == "0.00") {
        element.parentElement.removeChild(element)
      }
    }
  });
}

function hideHelpButton() {
  var button;

  button = document.querySelector(".custom-zendesk-help-button");
  if (button) {
    button.remove();
  }
}

function enabledWidescreen() {
  var style;

  style = document.createElement("style");
  style.appendChild(document.createTextNode(""));
  document.head.appendChild(style);
  style.sheet.insertRule("div.moduleFrame { width: auto!important; }", 0);
  style.sheet.insertRule("div.offset { width: auto!important; }", 1);
  style.sheet.insertRule("div.itemPreview { width: auto!important; }", 2);
  style.sheet.insertRule("div.component { width: auto!important; }", 3);
  style.sheet.insertRule("div.wrapper { display:flex; }", 4);
  style.sheet.insertRule("div#content { width: 70%!important; }", 5);
  style.sheet.insertRule("div#aside { width: 30%!important; padding-left: 25px; }", 6);
  style.sheet.insertRule("div.panel { display: flex; align-items: center; justify-content: center;}", 7);
  style.sheet.insertRule("table.labels { top: auto!important; left: auto!important}", 8);
}

(function() {
  var observer, target;

  target = document.getElementsByTagName('body')[0];
  observer = new window.MutationObserver(function(mutations) {
    observer.disconnect();
    setupRefreshObserver();
  });
  observer.observe(target, OBSERVATIONS);
})();

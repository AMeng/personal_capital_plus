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
  header = document.querySelector('div#userMenu ul li ul');
  header.insertAdjacentHTML(
    'beforeend',
    "<li><a href='" + optionsUrl + "' class='pcplus-options' target='_blank'>Extension</a></li>"
  );
}

function sortBalances(sortOrder, sortList) {
  var arr, accounts, parentNode, i;

  arr = [];
  parentNode = sortList || this.nextElementSibling;
  accounts = parentNode.querySelectorAll("li.account");

  accounts.forEach(function(n) {
    arr.push(n)
  });
  arr.sort(function(a, b) {
    var result, keyA, keyB;
    var currencyA = a.querySelector("div.balance").textContent;
    var currencyB = b.querySelector("div.balance").textContent;
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

  container = document.querySelector('div#sidebar');
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
      document.querySelectorAll('div.accountGroupHeader + ul').forEach(function(element) {
        sortBalances(1, element);
      });
    }
    if (OPTIONS.condenseBalances) {
      document.querySelectorAll('div.accountGroupHeader + ul li.account').forEach(function(element) {
        element.style.padding = "5px 10px 5px 20px";
      });
    }
    refreshObserver.observe(container, OBSERVATIONS);
  });
  refreshObserver.observe(container, OBSERVATIONS);
}

function hideAccounts() {
  var accounts;

  accounts = document.querySelectorAll("li.accountGroup ul li");
  accounts.forEach(function(n) {
    if (!n.classList.contains('error')) {
      var bal = n.querySelector("div.balance").textContent;
      if (bal.trim() == "0.00") {
        n.parentElement.removeChild(n)
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

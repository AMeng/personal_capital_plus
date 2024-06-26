let OPTIONS = {};

function save_options() {
  let status;

  OPTIONS.hideZeroBalances = document.getElementById('hideZeroBalances').checked;
  OPTIONS.sortBalances = document.getElementById('sortBalances').checked;
  OPTIONS.condenseBalances = document.getElementById('condenseBalances').checked;
  OPTIONS.hideBackgroundGraphs = document.getElementById('hideBackgroundGraphs').checked;
  OPTIONS.hideNetWorth = document.getElementById('hideNetWorth').checked;
  OPTIONS.replaceManualEntryText = document.getElementById('replaceManualEntryText').checked;

  chrome.storage.sync.set({ 'options': OPTIONS });
  status = document.getElementById('status');
  status.innerHTML = 'Options Saved.';
  setTimeout(function() {
    status.innerHTML = '';
  }, 750);
}

function restore_options() {
  chrome.storage.sync.get('options', function(obj) {
    if (obj.options == undefined) {
      obj.options = {
        hideZeroBalances: false,
        sortBalances: true,
        condenseBalances: true,
        hideBackgroundGraphs: false,
        hideNetWorth: false,
        replaceManualEntryText: false
      };
    }
    OPTIONS = obj.options;
    document.getElementById('hideZeroBalances').checked = obj.options.hideZeroBalances;
    document.getElementById('sortBalances').checked = obj.options.sortBalances;
    document.getElementById('condenseBalances').checked = obj.options.condenseBalances;
    document.getElementById('hideBackgroundGraphs').checked = obj.options.hideBackgroundGraphs;
    document.getElementById('hideNetWorth').checked = obj.options.hideNetWorth;
    document.getElementById('replaceManualEntryText').checked = obj.options.replaceManualEntryText;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);

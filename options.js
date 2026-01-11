let OPTIONS = {};

function save_options() {
  let status;

  OPTIONS.hideZeroBalances = document.getElementById('hideZeroBalances').checked;
  OPTIONS.sortBalances = document.getElementById('sortBalances').checked;
  OPTIONS.condenseBalances = document.getElementById('condenseBalances').checked;
  OPTIONS.hideAccountChanges = document.getElementById('hideAccountChanges').checked;
  OPTIONS.hideNetWorth = document.getElementById('hideNetWorth').checked;

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
        hideAccountChanges: false,
        hideNetWorth: false
      };
    }
    OPTIONS = obj.options;
    document.getElementById('hideZeroBalances').checked = obj.options.hideZeroBalances;
    document.getElementById('sortBalances').checked = obj.options.sortBalances;
    document.getElementById('condenseBalances').checked = obj.options.condenseBalances;
    document.getElementById('hideAccountChanges').checked = obj.options.hideAccountChanges;
    document.getElementById('hideNetWorth').checked = obj.options.hideNetWorth;
  });
}

function save_and_close() {
  save_options();
  window.close();
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
document.querySelector('#save_and_close').addEventListener('click', save_and_close);

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  chrome.scripting.executeScript({
    target: {tabId: details.tabId},
    files: ["main.js"]
  });
});

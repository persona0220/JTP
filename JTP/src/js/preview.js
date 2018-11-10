$(function () {
  showPreview();
});

function showPreview() {
  // update current preview list only when preview list is active
  var tabList = $('#tab-list');
  sortTabDiv(tabList);

  chrome.tabs.query({"currentWindow": true}, function (tabs) {
    tabList.empty();

    for (var i = 0; i < tabs.length; i++) {
      var newTab = createTabDiv(tabs[i]);
      tabList.append(newTab);
    }
  });
}

chrome.tabs.onCreated.addListener(function () {
  showPreview();
});

chrome.tabs.onHighlighted.addListener(function () {
  showPreview();
});

chrome.tabs.onRemoved.addListener(function () {
  showPreview();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.status == 'complete')
    showPreview();
});

chrome.tabs.onMoved.addListener(function () {
  showPreview();
});
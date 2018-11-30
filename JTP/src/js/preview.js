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

function showSearchPreview() {
    //var tabList = $('#search-tab-list');
    var tabList = $('#tab-list');
    sortTabDiv(tabList);

    chrome.storage.local.get('TabSearchResult', function (result) {
        tabList.empty();
        var tabs = result.TabSearchResult;
        if (tabs.length < 1) { } else {
            for (var i = 0; i < tabs.length; i++) {
                //var newTab = createSearchTabDiv(tabs[i]);
                var newTab = createTabDiv(tabs[i]);
                //alert(tabs[i].id);
                tabList.append(newTab);
            }
        }
    });
}

function clearSearchPreview() {
    var tabList = $('#search-tab-list');
    tabList.empty();
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
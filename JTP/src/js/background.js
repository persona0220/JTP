////////////////////////////////////////HANDLE FUNCTIONS////////////////////////////////////////

var CONST_URL = 'url';
var CONST_TITLE = 'title';
var CONST_SAVED = 'saved';
var CONST_ALL = 'all';
var CONST_CURRENT = 'current';
var CONST_TIME = 'time';
var CONST_OLDER = 'older';

/**
 * function for order
 */
function handleOrder(option) {
	if(option === CONST_TIME) {
    chrome.tabs.query({"currentWindow": true}, function(tabs) {
      var selectedTabs = [];

      for(var i = 0; i < tabs.length; i++) {
        if(parseInt(tabsCollection[tabs[i].id]) != 0) selectedTabs.push(tabs[i].id);
      }

      selectedTabs.sort(function(low, high) {
        if(parseInt(tabsCollection[low]) < parseInt(tabsCollection[high])) return -1;
        else if(parseInt(tabsCollection[low]) == parseInt(tabsCollection[high])) return 0;
        else return 1;
      });

      chrome.tabs.move(selectedTabs, {"index": -1});
    });
  } else if(option === CONST_TITLE) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      tabs.sort(function(low, high) {
        var lowLowerCase = low.title.toLowerCase();
        var highLowerCase = high.title.toLowerCase();

        if(lowLowerCase < highLowerCase) return -1;
        else if(lowLowerCase == highLowerCase) return 0;
        else return 1;
      });

      for(var i = 0; i < tabs.length; i++){
        chrome.tabs.move(tabs[i].id, {"index": i});
      }
    });
	} else if(option === CONST_URL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      tabs.sort(function (low, high){
        var lowLowerCase = low.url.toLowerCase();
        var highLowerCase = high.url.toLowerCase();

        if(lowLowerCase < highLowerCase) return -1;
        else if(lowLowerCase == highLowerCase) return 0;
        else return 1;
      });

      for(var i = 0; i < tabs.length; i++){
        chrome.tabs.move(tabs[i].id, {index: i});
      }
    });
	} else {
    insertErrorMessage("Invalid option");
  }
}

/**
 * function for open
 */
function handleOpen(option, keyword) {
  if (!keyword) {
    insertErrorMessage("input any keyword");
  	return;
	}
  if (option === CONST_URL) {
    if (!(keyword.substr(0, 8) === 'https://' || keyword.substr(0, 7) === 'http://')) {
      keyword = 'http://' + keyword;
    }
    chrome.tabs.create({"url": keyword, "selected": true});
  } else if (option === CONST_SAVED){
    var value = localStorage.getItem(keyword);
    if(value != null){
      var savedList = JSON.parse(value);
      for(var i in savedList) {
        chrome.tabs.create({"url":savedList[i].url, "selected": true});
      }
    } else{
      insertErrorMessage("no matched saved list");
    }
  } else {
    insertErrorMessage("Invalid option");
  }
}

/**
 * function for close
 */
function handleClose(option, keyword) {
  if (!keyword){
    insertErrorMessage("input any keyword");
    return;
  }
  keyword = keyword.toLowerCase();
  var selectedTabs = [];
  if(option === CONST_ALL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.toLowerCase().indexOf(keyword) > -1 || tabs[i].title.toLowerCase().indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if(selectedTabs.length === 0) {
        insertErrorMessage("no matched tabs");
      } else {
        chrome.tabs.remove(selectedTabs);
      }
    });
  } else if (option === CONST_URL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.toLowerCase().indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if(selectedTabs.length === 0){
        insertErrorMessage("no matched tabs");
      } else {
        chrome.tabs.remove(selectedTabs);
      }
    });
  } else if (option === CONST_TITLE) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].title.toLowerCase().indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if(selectedTabs.length === 0){
        insertErrorMessage("no matched tabs");
      } else {
        chrome.tabs.remove(selectedTabs);
      }
    });
  } else {
    insertErrorMessage("Invalid option");
  }
}

/**
 * function for window
 */
function handleWindow(option, keyword) {
  if (!keyword){
    insertErrorMessage("input any keyword");
    return;
  }
  keyword = keyword.toLowerCase();
  var selectedTabs = [];
  if(option === CONST_ALL){
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.toLowerCase().indexOf(keyword) > -1 || tabs[i].title.toLowerCase().indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if (selectedTabs.length != 0) {
        chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
          chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
        });
      } else {
        insertErrorMessage("no matched tabs");
      }
    })
  } else if (option === CONST_URL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.toLowerCase().indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if (selectedTabs.length != 0) {
        chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
          chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
        });
      } else {
        insertErrorMessage("no matched tabs");
      }
    });
  } else if (option === CONST_TITLE) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].title.toLowerCase().indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if (selectedTabs.length != 0) {
        chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
          chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
        });
      } else {
        insertErrorMessage("no matched tabs");
      }
    });
  } else {
    insertErrorMessage("Invalid option");
  }
}

/**
 * function for search
 */
function handleSearch(option, keyword) {
  if (!keyword){
    insertErrorMessage("input any keyword");
    return;
  }
  var tabsIndex = [];
  keyword = keyword.toLowerCase();

  chrome.tabs.query({currentWindow: true}, function (tabList) {
    if (option == CONST_ALL) {
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].url.toLowerCase().includes(keyword) || tabList[i].title.toLowerCase().includes(keyword)) {
          tabsIndex.push(i);
        }
      }
    } else if (option == CONST_URL) {
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].url.toLowerCase().includes(keyword)) {
          tabsIndex.push(i);
        }
      }
    } else if (option == CONST_TITLE) {
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].title.toLowerCase().includes(keyword)) {
          tabsIndex.push(i);
        }
      }
    } else {
      insertErrorMessage("Invalid option");
      return;
    }

    if (tabsIndex.length == 1) {
      chrome.tabs.highlight({'tabs': tabsIndex});
    } else if (tabsIndex.length == 0) {
      insertErrorMessage("no matched tabs");
    } else {
      handlePreview(tabsIndex);
    }
  });
}

/**
 * function for preview
 */
function handlePreview(indexArr) {
  var params = indexArr ? '?index=' + indexArr : '';
  var url = 'chrome-extension://' + chrome.runtime.id + '/src/html/preview.html' + params;
  var views = chrome.extension.getViews({type: "popup"});

  if(views.length > 0) {
    for(var i = 0; i < views.length; i++) {
      views[i].window.location.href = url;
    }
  } else {
    chrome.tabs.create({"url": url, "selected": true});
  }
}


/**
 * function to deal error-message
 */
function insertErrorMessage(message) {
  var views = chrome.extension.getViews({type: "popup"});

  if(views.length > 0) {
    for(var i = 0; i < views.length; i++){
      views[i].document.getElementById('error-message').innerHTML = message;
    }
  } else {
    chrome.tabs.executeScript({
      code: 'alert("' + message + '")'
    });
  }
}

////////////////////////////////////////TIME SETTING////////////////////////////////////////

var CONST_INT_MIN = 0;

var tabsCollection = {};
var tabsScreenShot = {};

chrome.tabs.query({}, function (tabs) {
  var currTime = CONST_INT_MIN;
  for(var i = 0; i < tabs.length; i++) {
    tabsCollection[tabs[i].id] = currTime;
  }
});

chrome.runtime.onInstalled.addListener(function () {
  tabsCollection = {};
  chrome.tabs.query({}, function (tabs) {
    var currTime = CONST_INT_MIN;
    for(var i = 0; i < tabs.length; i++){
      tabsCollection[tabs[i].id] = currTime;
    }
  });
});


function removeFromCollection(currTabId) {
  if(currTabId in tabsCollection){
    delete tabsCollection[currTabId];
  }

  if(currTabId in tabsScreenShot){
    delete tabsScreenShot[currTabId];
  }
}
//Add listeners to be notified when a tab is newly created or activated.

function addToCollection(currTabId, currTime) {
  tabsCollection[currTabId] = currTime;
}

chrome.tabs.onCreated.addListener(function(tab) {
  addToCollection(tab.id, Math.floor(Date.now()/10));
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  addToCollection(activeInfo.tabId, Math.floor(Date.now()/10));
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  removeFromCollection(tabId); 
});

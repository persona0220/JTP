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

function handleSearch(option, keyword) {
    var searchTabs = [];
    chrome.storage.local.remove('TabSearchResult');
    console.log("handele");
    search(keyword, function (searchTabList) {
        setTimeout(function () {
            searchTabs = [];
            if (searchTabList.length != 0) {
                loop = function (i, callback) {
                    setTimeout(function () {
                        chrome.tabs.get(searchTabList[i], function (tab) {
                            //var newTab = createSearchTabDiv(tab);
                            //tabList.append(newTab);
                            searchTabs.push(tab);
                        });
                        if (i >= searchTabList.length - 1) {
                            callback(searchTabs);
                        } else {
                            setTimeout(function () { loop(i + 1, callback); }, 20);
                            //loop(i + 1, callback);
                        }
                    }, 40);
                }

                loop(0, function (tabs) {
                    //localStorage.removeItem('TabSearchResult');
                    chrome.storage.local.remove('TabSearchResult');
                    setTimeout(function () {
                        var searchList = [];

                        for (var i = 0; i < tabs.length; i++) {
                            searchList.push({ id: tabs[i].id, url: tabs[i].url, title: tabs[i].title, favIconUrl: tabs[i].favIconUrl, keyword: keyword });

                        }
                        //localStorage.setItem('TabSearchResult', JSON.stringify(searchList), function () { });
                        
                        chrome.storage.local.set({ 'TabSearchResult': searchList });
                    }, 100);
                    
                })

                return searchTabs;
            } else {
                insertErrorMessage("no matched tabs");
                return -1;
            }
        }, 100);
        
    });
}

function search(keyword, callBackFunc) {
    if (!keyword) {
        insertErrorMessage("input any keyword");
        return;
    }
    console.log('search');
    keyword = keyword.toLowerCase();
    var selectedTabs = [];
    chrome.tabs.query({ "currentWindow": true }, function (tabs) {
        looper = function (i) {
            setTimeout(function () {
                if (tabs.length < 1) { }
                else if (tabs[i].url.indexOf("chrome://") > -1) {} else {
                    tabID = tabs[i].id;
                    tabTitle = tabs[i].title;
                    chrome.tabs.executeScript(tabs[i].id, { code: '(' + injectSearch + ')();' }, function (results) {
                        let innerText = results[0];
                        let e = chrome.runtime.lastError;
                        if (e !== undefined) {
                        }
                        else if (innerText.indexOf(keyword) > -1) { selectedTabs.push(tabID); }
                    });
                } if (i >= tabs.length - 1) {
                    callBackFunc(selectedTabs);
                } else {
                    setTimeout(function () { looper(i + 1); }, 40);
                    //looper(i + 1);
                }
            }, 0);            
        }
        looper(0);
    });
}

function injectSearch() { return document.body.innerHTML; }

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

/*
 * function that start with dom starting
 */

$(function () {
  $('#order').click(doOrder);
  $('#search').click(doSearch);
  $('#split').click(doSplit);
  $('#save').click(doSave);
  $('#open').click(doOpen);
});

// Order
function doOrder(){
  var background = chrome.extension.getBackgroundPage();

  showPreview();
  if($("#option-order").css("display") === "block") {
    $("#option-order").css("display", "none");
    $('#order').removeClass("active");
  } else {
    toggleOption('order');
  }

  $('.option-button').click(function () {
    switch($(this).text()){
      case 'URL':
        background.handleOrder('url');
        break;
      case 'TIME':
        background.handleOrder('time');
        break;
      case 'TITLE':
        background.handleOrder('title');
        break;
    }
    $("option-order").toggle();
    $("#option-order").css("display", "none");
    $('#order').removeClass("active");
  });
}

// Split
function doSplit(){
  var background = chrome.extension.getBackgroundPage();
  showPreview();
  if($("#option-split").css("display") === "block") {
    $("#option-split").css("display", "none");
    $('#split').removeClass("active");
  } else {
    toggleOption('split');
  }

  $('#split-button').click(function () {
    //TODO: 여러 탭에서 검색하는 기능 구현 --> 검색 일치하는 탭들만 색 변경해주기
    var keyword = $('#keyword').val();
    background.handleWindow('title', keyword);
    //위에서 생겨난 옵션들 파괴
    $("#option-split").css("display", "none");
    $('#split').removeClass("active");
  })
}

// Search
function doSearch() {
    var background = chrome.extension.getBackgroundPage();

    showPreview();
    if ($("#option-search").css("display") === "block") {
        $("#option-search").css("display", "none");
        $('#search').removeClass("active");
    } else {
        toggleOption('search');
    }

    $('#search-button').click(function () {
        //TODO: 여러 탭에서 검색하는 기능 구현 --> 검색 일치하는 탭들만 색 변경해주기
        //chrome.storage.sync.set({'TabSearchResult':""});
        var keyword = $('#search-keyword').val();
        //localStorage.removeItem('TabSearchResult');

        background.handleSearch('title', keyword, function (tabs) {
            //var searchTabs = tabs;
            //showSearchPreveiw();
            //showPreview();

        });
        setTimeout(function () {
            showSearchPreview();
        }, 200);

        chrome.storage.onChanged.addListener(function (changes, areaName) { if (areaName == 'local') { showSearchPreview(); } });

        //clearSearchPreview();
        chrome.storage.local.remove('TabSearchResult');
        //위에서 생겨난 옵션들 파괴
        $("#option-search").css("display", "none");
        $('#search').removeClass("active");
    });

    $('search-clear-button').click(function () {
        clearSearchPreview();
        chrome.storage.local.remove('TabSearchResult');
        $('#search-keyword').val('');
        //showSearchPreview();
    });
}

// Save
function doSave() {
    showPreview();
    if ($("#option-save").css("display") === "block") {
        $("#option-save").css("display", "none");
        $('#save').removeClass("active");
    } else {
        toggleOption('save');
    }

    //Get the list of saved names (for autocomplete)

    //TODO: 지금은 savelist 이름들을 그냥 자동완성에 넣어주는데, 버튼식으로 바꾸는 게 더 좋을 것 같음. 일단 현재 방식은 삭제가 안됨..
    chrome.storage.local.get('saveList', function (result) {
        if (result.saveList != null) {

            $('#savedList').autocomplete({
                source: result.saveList,
                minLength: 0,
                position: { my: "right top", at: "right bottom", collision: "fit" },
            }).on("focus", function () {
                $(this).autocomplete("search", '');
            });
        }
    });

    //submit
    $('#submit').click(function () {

        var listname = $('#savedList').val();
        var saveList = [];


        chrome.tabs.query({ "currentWindow": true }, function (tabs) {


            //TODO: 원하는 탭만 선택하는 기능 추가(원하지 않는 탭은 제거하는 기능). 지금은 모두 선택.
            for (var i = 0; i < tabs.length; i++) {
                saveList.push({ url: tabs[i].url, title: tabs[i].title, favIconUrl: tabs[i].favIconUrl });
            }

            if (!listname) {
                alert('name box is empty'); //TODO for Design: Alert 보단 예쁘게..
            } else if (localStorage.getItem(listname) != null) {
                // TODO: Already Exist 에러 대신 --> Append 하도록 구현
                alert('Already Exist!');
            } else {
                localStorage.setItem(listname, JSON.stringify(saveList));

                //Update the list of names
                chrome.storage.local.get('saveList', function (result) {
                    var KeyForSaveList = [];
                    if (result.saveList != null) {
                        KeyForSaveList = result.saveList;
                    }
                    KeyForSaveList.push(listname);
                    chrome.storage.local.set({ 'saveList': KeyForSaveList });
                });
                $("#option-save").css("display", "none");
                $('#save').removeClass("active");
            }
        });
    });
}

//Open
function doOpen(){
  if($("#option-open").css("display") === "block") {
    $("#option-open").css("display", "none");
    $('#open').removeClass("active");
    showPreview();
  } else {
    toggleOption('open');
  }

  $('#tab-list').empty();

  chrome.storage.local.get('saveList', function (result) {
    var KeyForSaveList = [];
    if(result.saveList != null){
      KeyForSaveList = result.saveList;
    }

    $('#selectlist').empty();
    $('#selectlist').append("<option>-----select-----</option>");
    for(var i = 0; i < KeyForSaveList.length; i++){
      var option = $("<option>"+KeyForSaveList[i]+"</option>");
      $('#selectlist').append(option);
    }
  });
  $("#selectlist").val("1").prop("selected", true);
  $('#selectlist').change(changeOption);

  $('#openall').click(function () {
    var savedTabs = [];
    $('.tab').find('.url').each(function() {
      savedTabs.push($(this).text());
    });
    chrome.windows.create({"url":savedTabs[0]}, function (window) {
      for(var i = 1; i < savedTabs.length; i++) {
        chrome.tabs.create({"windowId":window.id, "url":savedTabs[i]});
      }
    });
    $("#option-open").css("display", "none");
    $('#open').removeClass("active");
  })
}

function changeOption(){
  savedListName = $('#selectlist').val();
  tabList = $('#tab-list');

  var savedTabs = JSON.parse(localStorage.getItem(savedListName));
  sortStorageTabDiv(tabList, savedListName);

  tabList.empty();
  for (var i in savedTabs) {
    var newTab = createStorageTabDiv(savedTabs[i], savedListName);
    tabList.append(newTab);
  }
}


//Add option for each feature
function toggleOption(command) {
  switch (command) {
    case 'order':
      $("#option-order").css("display", "block");
      $('#order').addClass("active");

      $("#option-search").css("display", "none");
      $('#search').removeClass("active");

      $("#option-split").css("display", "none");
      $('#split').removeClass("active");

      $("#option-save").css("display", "none");
      $('#save').removeClass("active");

      $("#option-open").css("display", "none");
      $('#open').removeClass("active");
      break;
    case 'search':
      $("#option-order").css("display", "none");
      $('#order').removeClass("active");

      $("#option-search").css("display", "block");
      $('#search').addClass("active");

      $("#option-split").css("display", "none");
      $('#split').removeClass("active");

      $("#option-save").css("display", "none");
      $('#save').removeClass("active");

      $("#option-open").css("display", "none");
      $('#open').removeClass("active");
      break;
    case 'split':
      $("#option-order").css("display", "none");
      $('#order').removeClass("active");

      $("#option-search").css("display", "none");
      $('#search').removeClass("active");

      $("#option-split").css("display", "block");
      $('#split').addClass("active");

      $("#option-save").css("display", "none");
      $('#save').removeClass("active");

      $("#option-open").css("display", "none");
      $('#open').removeClass("active");
      break;
    case 'save':
      $("#option-order").css("display", "none");
      $('#order').removeClass("active");

      $("#option-search").css("display", "none");
      $('#search').removeClass("active");

      $("#option-split").css("display", "none");
      $('#split').removeClass("active");

      $("#option-save").css("display", "block");
      $('#save').addClass("active");

      $("#option-open").css("display", "none");
      $('#open').removeClass("active");
      break;
    case 'open':
      $("#option-order").css("display", "none");
      $('#order').removeClass("active");

      $("#option-search").css("display", "none");
      $('#search').removeClass("active");

      $("#option-split").css("display", "none");
      $('#split').removeClass("active");

      $("#option-save").css("display", "none");
      $('#save').removeClass("active");

      $("#option-open").css("display", "block");
      $('#open').addClass("active");
      break;
  }
}

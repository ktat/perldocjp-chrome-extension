var perldocjp_db;
var got_time = localStorage.perldocjp_got_time || 0;
var now = (new Date).getTime();

update_perldocjp_db();
setInterval(update_perldocjp_db, 10 * 1000);

chrome.browserAction.onClicked.addListener(to_perldocjp);

chrome.tabs.onActivated.addListener(function (activeinfo) {
  chrome.tabs.get(activeinfo.tabId, check_url);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeinfo, tag) {
  if (changeinfo.status === 'complete') {
    chrome.tabs.get(tabId, check_url);
  }
});

function update_perldocjp_db () {
  localStorage.perldocjp_got_time = now;
  var xhr = new XMLHttpRequest();
  // the following url is just for test.
  xhr.open("GET", "http://perldoc.jp/static/docs.json", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      perldocjp_db = JSON.parse(xhr.responseText);
      localStorage.perldocjp = xhr.responseText;
    }
  }
  xhr.send();
}

function perldocjp_url (tab) {
  if(tab.url.match(/^https?:\/\/search\.cpan\.org\/(.+)/)) {
    return get_module_path(tab.title);
  } else if(tab.url.match(/^https?:\/\/metacpan\.org\/module\/(perl.+)/)) {
    return get_module_path(RegExp.$1);
  } else if(tab.url.match(/^https?:\/\/metacpan\.org\/(.+)/)) {
    return get_module_path(tab.title);
  }
}

function get_module_path (title) {
  if (title.match(/^([\w:]+)/)) {
    var module = RegExp.$1;
    var perldocjp_path = perldocjp_db[module];
    if (perldocjp_path) {
      return 'http://perldoc.jp/docs/' + perldocjp_path;
    }
  }
}

function check_url (tab) {
  if (perldocjp_url(tab)) {
    chrome.browserAction.setIcon({"path": "perldocjp.ico", "tabId": tab.id});
  } else {
    chrome.browserAction.setIcon({"path": "icon.ico"});
  }
}

function to_perldocjp (tab) {
  var url = perldocjp_url(tab)
  if (url) {
    chrome.tabs.create({"url": url});
  }
}

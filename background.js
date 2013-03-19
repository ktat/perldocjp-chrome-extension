if (! localStorage.perldocjp_installed) {
  chrome.runtime.onInstalled.addListener(function (o) {
    localStorage.perldocjp_installed = true;
    chrome.tabs.create({"url": "options.html"});
  });
}

var perldocjp_db = {};
var got_time = localStorage.perldocjp_got_time || 0;
if (! localStorage.perldocjp_setting) {
  localStorage.perldocjp_setting = JSON.stringify({ "notification": 5, "auto_open": 0 });
}
var perldocjp_setting = JSON.parse(localStorage.perldocjp_setting);
var now = (new Date).getTime();
var notified = {};

update_perldocjp_db();
chrome.alarms.create('update_perldocjp_db', {"periodInMinutes": 360});
chrome.alarms.onAlarm.addListener(function (al) {
 if (al.name === 'update_perldocjp_db') {
    update_perldocjp_db();
 }
});

// chrome.browserAction.onClicked.addListener(to_perldocjp);
chrome.pageAction.onClicked.addListener(to_perldocjp);

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
  xhr.open("GET", "http://perldoc.jp/static/docs.json?time=" + now, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      perldocjp_db = JSON.parse(xhr.responseText);
      localStorage.perldocjp = xhr.responseText;
    }
  }
  xhr.send();
}

function get_doc_name (tab) {
  var doc_name = '';
  if(tab.url.match(/^https?:\/\/perldoc\.perl\.org\/search\.html\?q=(.+)/)) {
    var q = RegExp.$1;
    doc_name = q.replace(/\%3A/gi, ':');
  } else if(tab.url.match(/^https?:\/\/perldoc\.perl\.org\/.+/)) {
    doc_name = tab.title;
  } else if(tab.url.match(/^https?:\/\/(?:search\.|meta)cpan\.org\/search(\?.+)/)) {
    var q = RegExp.$1;
    if (q.match(/(?:&|\?)q=([^&]+)/) || q.match(/(?:&|\?)query=([^&]+)/)) {
      q = RegExp.$1;
      doc_name = q.replace(/\%3A/gi, ':');
    }
  } else if(tab.url.match(/^https?:\/\/search\.cpan\.org\/dist\/([^\/]+)/)) {
    var module = RegExp.$1;
    doc_name = module.replace(/[\/\-]/g, '::');
  } else if(tab.url.match(/^https?:\/\/search\.cpan\.org\/(.+)/)) {
    doc_name = tab.title;
  } else if(tab.url.match(/^https?:\/\/metacpan\.org\/module\/.+\/(perl.+)\.pod/)) {
    doc_name = RegExp.$1;
  } else if(tab.url.match(/^https?:\/\/metacpan\.org\/(.+)/)) {
    var path = RegExp.$1;
    if (tab.title.match(/^([\w:]+)/)) {
      doc_name = RegExp.$1;
    } else {
      doc_name = path.replace(/^.+\/(?:lib|pod)\/(.+)\.pod$/, "$1");
      if (! path.match('/' + new_path + '-')) {
        // like https://metacpan.org/module/GIULIENK/Audio-Beep-0.11/Beep.pod
        // doc_name is 'Beep'
        if (path.match(/module\/\w+\/([\w-]+)-[\d\.]+\//)) {
	  doc_name = RegExp.$1;
	}
      }
      doc_name = doc_name.replace(/[\/\-]/g, '::');
    }
  }
  if (doc_name.match(/^([\w:]+)/)) {
    return doc_name;
  }
}

function get_perldocjp_url (doc_name) {
  if (doc_name.match(/^([\w:]+)/)) {
    var module = RegExp.$1;
    var perldocjp_path = perldocjp_db[module];
    if (perldocjp_path) {
      return 'http://perldoc.jp/docs/' + perldocjp_path;
    }
  }
}

function check_url (tab) {
  var doc_name = get_doc_name(tab);
  var perldocjp_url = get_perldocjp_url(doc_name);
  if (perldocjp_url) {
    // chrome.browserAction.setIcon({"path": "perldocjp.ico", "tabId": tab.id});
    chrome.pageAction.show(tab.id);

    if (perldocjp_setting.auto_open === 1) {
       chrome.tabs.query({"url": perldocjp_url}, function (t) {
          if (t.length === 0) {
            chrome.tabs.create({"url": perldocjp_url, "active": false});
          }
       })
    }

    // if (perldocjp_setting.popup > 0) {
    //   chrome.tabs.executeScript(tab.id, {"file": "inject.js"});
    // }

    if (perldocjp_setting.notification > 0) {
      if (! notified[perldocjp_url]) {
        notified[perldocjp_url] = 1;
        var notification = webkitNotifications.createNotification(
          'http://perldoc.jp/favicon.ico',
          'perldoc.jp', 
          doc_name + 'は翻訳があります'
        );
        notification.show();
        setTimeout(function () { notification.cancel() }, perldocjp_setting.notification * 1000);
      }
    }

  } else {
    // chrome.browserAction.setIcon({"path": "icon.ico"});
    chrome.pageAction.hide(tab.id);
  }
}

function to_perldocjp (tab) {
  var doc = get_doc_name(tab);
  var url = get_perlodcjp_url(doc);
  if (url) {
    chrome.tabs.create({"url": url});
  } else {
    chrome.tabs.create({url: 'http://perldoc.jp/'})
  }
}

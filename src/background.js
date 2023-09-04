let perldocjp_setting;

// load perldocjp extension setting
chrome.storage.local.get(['perldocjp_setting'], (result) => {
  if (!result) {
    init_storage();
  } else {
    perldocjp_setting = JSON.parse(result.perldocjp_setting);
  }
});

// open options when first install
chrome.storage.local.get(['perldocjp_installed'], (v) => {
  if (!v.perldocjp_installed) {
    chrome.runtime.onInstalled.addListener(function () {
      chrome.storage.local.set({"perldocjp_installed": true});
      chrome.tabs.create({"url": "options.html"});
    });
  }
});

// to record notified perldoc.jp URL
const notified = {};
// perldocjp translation database
let perldocjp_db = {};

update_perldocjp_db();

// update perldocjp translation database per 6 hours
(async function () {
  await chrome.alarms.create('update_perldocjp_db', {"periodInMinutes": 360});
  await chrome.alarms.onAlarm.addListener(function (al) {
    if (al.name === 'update_perldocjp_db') {
      update_perldocjp_db();
    }
  });
})();

// open perldoc.jp when extension icon is clicked
chrome.action.onClicked.addListener(to_perldocjp);

// check tab URL
chrome.tabs.onActivated.addListener(function (activeinfo) {
  chrome.tabs.get(activeinfo.tabId, check_url);
});
chrome.tabs.onUpdated.addListener(function (tabId, changeinfo, tag) {
    if (changeinfo.status === 'complete') {
	chrome.tabs.get(tabId, check_url);
    }
});

// when desktop notification is clicked
chrome.notifications.onClicked.addListener(
  (doc_name) => {
    const perldocjp_url = get_perldocjp_url(doc_name);
    chrome.tabs.create({url: perldocjp_url});
  }
)

////////////////////
// fucntions
////////////////////

function init_storage () {
  chrome.storage.local.clear();
  chrome.storage.local.set({'perldocjp_setting': JSON.stringify({ "notification_second": 3, "auto_open": 0, "notification_type": 'browser', "notification_everytime": true })});
}

async function update_perldocjp_db () {
  const now = (new Date).getTime();
  const resp = await fetch("https://perldoc.jp/static/docs.json?time=" + now);
  if (resp.status === 200) {
    perldocjp_db = await resp.json();
    chrome.storage.local.set({'perldocjp': JSON.stringify(perldocjp_db)});
  }
}

function get_doc_name (tab) {
  let doc_name = '';
  if (! tab)  return;

  if(tab.url.match(/^https?:\/\/perldoc\.perl\.org\/search\?q=(.+)/)) {
    const q = RegExp.$1;
    doc_name = q.replace(/\%3A/gi, ':');
  } else if(tab.url.match(/^https?:\/\/perldoc\.perl\.org\/.+/)) {
    doc_name = tab.title;
  } else if(tab.url.match(/^https?:\/\/metacpan\.org\/search(\?.+)/)) {
    let q = RegExp.$1;
    if (q.match(/(?:&|\?)q=([^&]+)/) || q.match(/(?:&|\?)query=([^&]+)/)) {
      q = RegExp.$1;
      doc_name = q.replace(/\%3A/gi, ':');
    }
  } else if(tab.url.match(/^https?:\/\/metacpan\.org\/module\/.+\/(perl.+)\.pod/)) {
    doc_name = RegExp.$1;
  } else if(tab.url.match(/^https?:\/\/metacpan\.org\/pod\/(.+)$/)) {
    doc_name = RegExp.$1;
  } else if(tab.url.match(/^https?:\/\/metacpan\.org\/(.+)/)) {
    const path = RegExp.$1;
    if (tab.title.match(/^([\w:]+)/)) {
      doc_name = RegExp.$1;
    } else {
      if (path.match(/^module\/\w+\/[\w\-]+\/(.+)\.pod$/)) {
	doc_name = RegExp.$1;
      } else if (path.match(/^.+\/(?:lib|pod)\/(.+)\.pod$/)) {
	doc_name = RegExp.$1;
      }
      if (! path.match('/' + doc_name + '-') && ! doc_name.match('/')) {
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
    return RegExp.$1;
  }
}

function get_perldocjp_url (doc_name) {
  if (doc_name && doc_name.match(/^([\w:]+)/)) {
    const module = RegExp.$1;
    const perldocjp_path = perldocjp_db[module];
    if (perldocjp_path) {
      return 'http://perldoc.jp/docs/' + perldocjp_path;
    }
  }
}

async function check_url (tab) {
  const doc_name = get_doc_name(tab);
  const perldocjp_url = get_perldocjp_url(doc_name);
  if (perldocjp_url) {
    chrome.action.enable(tab.id);

    if (perldocjp_setting.auto_open) {
      chrome.tabs.query({"url": perldocjp_url}, function (t) {
	if (t.length === 0) {
	  chrome.tabs.create({"url": perldocjp_url, "active": false});
	}
      })
    }

    if ((perldocjp_setting.notification_everytime || ! notified[perldocjp_url]) && perldocjp_setting.notification_second > 0) {
      notified[perldocjp_url] = 1;

      if (perldocjp_setting.notification_type === 'browser') {
	await chrome.scripting.insertCSS({target: {tabId: tab.id}, "files": ["inject.css"]});
	await chrome.scripting.executeScript({target:{ tabId: tab.id}, "files": ["pre_inject.js"]});
	await chrome.scripting.executeScript({
	  target: {tabId: tab.id},
	  args: [doc_name, perldocjp_url, perldocjp_setting.notification_second],
	  func: (doc_name,perldocjp_url, second) => {
	    document.querySelector("#pjp_doc_name").innerTEXT = doc_name;
	    document.querySelector("#pjp_url").innerTEXT = perldocjp_url;
	    document.querySelector("#pjp_timeout").innerTEXT = second;
	  }
	});
	await chrome.scripting.executeScript({target: {tabId: tab.id}, "files": ["inject.js"]});
      } else if (perldocjp_setting.notification_type === 'desktop') {
	await chrome.notifications.create(
	  doc_name,
	  {
	    type: "basic",
	    title: 'perldoc.jp',
	    iconUrl: 'http://perldoc.jp/favicon.ico',
	    message: doc_name + 'は翻訳があります'
	  }
	);
      }
    }
  } else {
    chrome.action.disable(tab.id);
  }
}

function to_perldocjp (tab) {
  const doc = get_doc_name(tab);
  const url = get_perldocjp_url(doc);
  if (url) {
    chrome.tabs.create({"url": url});
  } else {
    chrome.tabs.create({url: 'http://perldoc.jp/'})
  }
}

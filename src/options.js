let perldocjp_setting = {};
chrome.storage.local.get(["perldocjp_setting"], (v) => {
    if (v.perldocjp_setting) {
	perldocjp_setting = JSON.parse(v.perldocjp_setting);
    }

    // embed settings in localStorage to form.
    if (perldocjp_setting.auto_open) {
	document.querySelector('#auto_open').checked = true;
    }

    if (perldocjp_setting.notification_everytime) {
	document.querySelector('#notification_everytime').checked = true;
    }

    if (perldocjp_setting.notification_type === 'browser') {
	document.querySelector('#browser_notification').checked = true;
    } else if (perldocjp_setting.notification_type === 'desktop') {
	document.querySelector('#desktop_notification').checked = true;
    }

    document.querySelector('#notification_second').value = perldocjp_setting.notification_second || 3;
    document.querySelector('#slider_number').innerHTML   = perldocjp_setting.notification_second || 3;

    // set listner
    document.querySelector('#auto_open').addEventListener('click', auto_open_saved);
    document.querySelector('#notification_second').addEventListener('change', notification_second_saved);
    document.querySelector('#desktop_notification').addEventListener('click', notification_saved);
    document.querySelector('#browser_notification').addEventListener('click', notification_saved);
    document.querySelector('#notification_everytime').addEventListener('click', notification_everytime_saved);
    document.querySelector('#reload').addEventListener('click', reload_extension);
});


function auto_open_saved () {
  perldocjp_setting.auto_open = document.getElementById('auto_open').checked;
  chrome.storage.local.set({"perldocjp_setting": JSON.stringify(perldocjp_setting)});
}

function notification_second_saved () {
  var sec = document.querySelector('#notification_second').value;
  perldocjp_setting.notification_second = sec;
  chrome.storage.local.set({"perldocjp_setting": JSON.stringify(perldocjp_setting)});
  document.querySelector('#slider_number').innerHTML = sec;
}

function notification_everytime_saved () {
  perldocjp_setting.notification_everytime = document.querySelector('#notification_everytime').checked;
  chrome.storage.local.set({"perldocjp_setting": JSON.stringify(perldocjp_setting)});
}

function notification_saved () {
  var browser = document.querySelector('#browser_notification');
  var desktop = document.querySelector('#desktop_notification');
  if (browser.checked) {
    perldocjp_setting.notification_type = 'browser';
  }else  if (desktop.checked) {
    perldocjp_setting.notification_type = 'desktop';
  }
  chrome.storage.local.set({"perldocjp_setting": JSON.stringify(perldocjp_setting)});
}

function reload_extension () {
  setTimeout( chrome.runtime.reload, 1 * 1000 );
}

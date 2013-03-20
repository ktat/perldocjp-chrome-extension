var perldocjp_setting = JSON.parse(localStorage.perldocjp_setting);

function auto_open_saved () {
  perldocjp_setting.auto_open = document.getElementById('auto_open').checked ? 1 : 0;
  localStorage.perldocjp_setting = JSON.stringify(perldocjp_setting);
}

function notification_second_saved () {
  var sec = document.querySelector('#notification_second').value;
  perldocjp_setting.notification_second = sec;
  localStorage.perldocjp_setting = JSON.stringify(perldocjp_setting);
  document.querySelector('#slider_number').innerHTML = sec;
}

function notification_saved () {
  var browser = document.querySelector('#browser_notification');
  var desktop = document.querySelector('#desktop_notification');
  if (browser.checked) {
    perldocjp_setting.notification_type = 'browser';
  }else  if (desktop.checked) {
    perldocjp_setting.notification_type = 'desktop';
  }
  localStorage.perldocjp_setting = JSON.stringify(perldocjp_setting);
}

function reload_extension () {
  setTimeout( chrome.runtime.reload, 1 * 1000 );
}

if (perldocjp_setting.auto_open === 1) {
  document.querySelector('#auto_open').checked = true;
}

if (perldocjp_setting.notification_type === 'browser') {
  document.querySelector('#browser_notification').checked = true;
} else if (perldocjp_setting.notification_type === 'desktop') {
  document.querySelector('#desktop_notification').checked = true;
}

document.querySelector('#notification_second').value = perldocjp_setting.notification_second || 5;
document.querySelector('#slider_number').innerHTML   = perldocjp_setting.notification_second || 5;

document.querySelector('#auto_open').addEventListener('click', auto_open_saved);
document.querySelector('#notification_second').addEventListener('change', notification_second_saved);
document.querySelector('#desktop_notification').addEventListener('click', notification_saved);
document.querySelector('#browser_notification').addEventListener('click', notification_saved);
document.querySelector('#reload').addEventListener('click', reload_extension);

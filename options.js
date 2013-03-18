var perldocjp_setting = JSON.parse(localStorage.perldocjp_setting);

function auto_open_saved () {
  perldocjp_setting.auto_open = document.getElementById('auto_open').checked ? 1 : 0;
  localStorage.perldocjp_setting = JSON.stringify(perldocjp_setting);
}

function notification_saved () {
  var sec = document.querySelector('#notification_second').value;
  perldocjp_setting.notification = sec;
  localStorage.perldocjp_setting = JSON.stringify(perldocjp_setting);
  document.querySelector('#slider_number').innerHTML = sec;
}

function reload_extension () {
  setTimeout( chrome.runtime.reload, 1 * 1000 );
}

if (perldocjp_setting.auto_open === 1) {
  document.getElementById('auto_open').checked = true;
}

document.querySelector('#notification_second').value = perldocjp_setting.notification || 5;
document.querySelector('#slider_number').innerHTML = perldocjp_setting.notification || 5;

document.querySelector('#auto_open').addEventListener('click', auto_open_saved);
document.querySelector('#notification_second').addEventListener('change', notification_saved);
document.querySelector('#reload').addEventListener('click', reload_extension);

if (!window.pjpPopUpFunc) {
  window.pjpPopUpFunc = () => {
    let pjp_doc_name = document.querySelector('#pjp_doc_name').innerTEXT;
    let pjp_url      = document.querySelector('#pjp_url').innerTEXT;
    let pjp_timeout  = document.querySelector("#pjp_timeout") || 5;

    if (pjp_timeout) {
      pjp_timeout = pjp_timeout.innerTEXT;
    } else {
      pjp_timeout = 5;
    }

    const pjp_link = document.createElement("a");
    pjp_link.href      = pjp_url;
    pjp_link.target    = "_blank";
    pjp_link.innerHTML = pjp_doc_name + ' の翻訳へ';

    let pjp_info = document.querySelector("#perldocjp_notification");
    if (! pjp_info) {
      pjp_info = document.createElement("div");
      pjp_info.innerHTML = 'perldoc.jp<br />';
      pjp_info.id = "perldocjp_notification";
      pjp_info.appendChild(pjp_link);
      document.querySelector("body").appendChild(pjp_info);
    } else {
      pjp_info.innerHTML = 'perldoc.jp<br />';
      pjp_info.appendChild(pjp_link);
    }

    window.setTimeout(function () {
      document.querySelector('body').removeChild(pjp_info);
    }, pjp_timeout * 1000);
  };
}

pjpPopUpFunc();

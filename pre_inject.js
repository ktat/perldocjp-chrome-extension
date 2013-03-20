var pjp_elements = ['pjp_doc_name' , 'pjp_url', 'pjp_timeout'];
for (var i in pjp_elements) {
  var pjp_element = document.querySelector('#' + pjp_elements[i]);
  if (! pjp_element) {
    pjp_element = document.createElement('div');
    pjp_element.style.display = 'none';
    pjp_element.id = pjp_elements[i];
    document.querySelector('body').appendChild(pjp_element);
  }
}

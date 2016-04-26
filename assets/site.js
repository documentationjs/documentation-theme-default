/* global anchors */

// add anchor links to headers
anchors.options.placement = 'left';
anchors.add('h3');

// Filter UI
var tocElements = document.getElementById('toc')
  .getElementsByTagName('li');

document.getElementById('filter-input')
  .addEventListener('keyup', function (e) {

    var i, element;

    // enter key
    if (e.keyCode === 13) {
      // go to the first displayed item in the toc
      for (i = 0; i < tocElements.length; i++) {
        element = tocElements[i];
        if (!element.classList.contains('display-none')) {
          location.replace(element.firstChild.href);
          return e.preventDefault();
        }
      }
    }

    var match = function () {
      return true;
    };

    var value = this.value.toLowerCase();

    if (!value.match(/^\s*$/)) {
      match = function (text) {
        return text.toLowerCase().indexOf(value) !== -1;
      };
    }

    for (i = 0; i < tocElements.length; i++) {
      element = tocElements[i];
      if (match(element.firstChild.innerHTML)) {
        element.classList.remove('display-none');
      } else {
        element.classList.add('display-none');
      }
    }
  });

var toggles = document.getElementsByClassName('toggle-step-sibling');
for (var i = 0; i < toggles.length; i++) {
  toggles[i].onclick = toggleStepSibling;
}

function toggleStepSibling() {
  var stepSibling = this.parentNode.parentNode.parentNode.getElementsByClassName('toggle-target')[0];
  if (stepSibling.classList.contains('hide')) {
    stepSibling.classList.remove('hide');
    this.innerHTML = '⤬';
  } else {
    stepSibling.classList.add('hide');
    this.innerHTML = '☰';
  }
}

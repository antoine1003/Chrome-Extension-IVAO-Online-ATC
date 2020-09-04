'use strict';

console.log('\'Allo \'Allo! Popup');

document.querySelector('#go-to-options').addEventListener("click", function() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });
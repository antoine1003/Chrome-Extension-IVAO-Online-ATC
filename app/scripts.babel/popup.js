'use strict';

console.log('\'Allo \'Allo! Popup');

document.querySelector('#go-to-options').addEventListener('click', function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});

function buildTable() {
  chrome.storage.sync.get(['listOfAtcOpenClosed','updatedAt'], function (result) {
    const listOfAtcOpenClosed = result.listOfAtcOpenClosed;
    const updatedAt = result.updatedAt;
    console.log(updatedAt);
    let tableSelector = document.getElementById('table-atc');
    document.getElementById('updated-at').innerText = updatedAt;
    for (let i = 0; i < listOfAtcOpenClosed.length; i++) {
      const el = listOfAtcOpenClosed[i];
      let trEl = document.createElement('tr');
      trEl.setAttribute('scope', 'row');
      let posTd = document.createElement('td');
      posTd.innerText = el.position;
      trEl.appendChild(posTd);
      let statusTd = document.createElement('td');
      statusTd.classList.add('text-center');
      if (el.isOpen === true) {
        statusTd.classList.add('table-success');
        statusTd.textContent = 'OK';
      } else {
        statusTd.classList.add('table-danger');
        statusTd.textContent = 'KO';
      }
      trEl.appendChild(statusTd);
      tableSelector.appendChild(trEl);
    }
  });
}


document.addEventListener('DOMContentLoaded', buildTable);

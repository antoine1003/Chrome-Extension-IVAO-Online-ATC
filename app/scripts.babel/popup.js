'use strict';

document.querySelector('#go-to-options').addEventListener('click', function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});

function initializeTranslations() {
  document.getElementById('go-to-options').innerText = chrome.i18n.getMessage('goToOptions');
  document.getElementById('col-position').innerText = chrome.i18n.getMessage('position');
  document.getElementById('col-grade').innerText = chrome.i18n.getMessage('grade');
}

function buildTable() {
  chrome.storage.sync.get(['listOfAtcOpenClosed','updatedAt'], function (result) {
    const listOfAtcOpenClosed = result.listOfAtcOpenClosed;
    const updatedAt = result.updatedAt ? result.updatedAt : '';
    let tableSelector = document.getElementById('table-atc');
    document.getElementById('updated-at').innerText = updatedAt;
    if (listOfAtcOpenClosed && listOfAtcOpenClosed.length > 0) {
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
          statusTd.innerHTML = '<img alt="Checked icon" src="images/check.svg" class="filter-green"/>';
        } else {
          statusTd.classList.add('table-danger');
          statusTd.innerHTML = '<img alt="Cross icon" src="images/cross.svg" class="filter-red"/>';
        }
        trEl.appendChild(statusTd);
        let img = null;
        let imgTd = document.createElement('td');
        if (el.grade !== null) {
          imgTd.classList.add('text-center');
          img = document.createElement('img');
          img.setAttribute('src', 'images/grades/' + el.grade + '.gif');
          imgTd.appendChild(img);
        }
        trEl.appendChild(imgTd);
        tableSelector.appendChild(trEl);
      }
    } else {
      let trEl = document.createElement('tr');
      trEl.setAttribute('scope', 'row');
      let spanTd = document.createElement('td');
      spanTd.setAttribute('colspan', '2');
      spanTd.classList.add('text-center');
      spanTd.innerText = chrome.i18n.getMessage('noData');
      tableSelector.appendChild(trEl);
    }
  });
}


document.addEventListener('DOMContentLoaded', buildTable);
document.addEventListener('DOMContentLoaded', initializeTranslations);

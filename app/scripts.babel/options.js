'use strict';

// Saves options to chrome.storage
function saveOptions() {
  const atcList = document.getElementById('atc-list').value;
  const notifications = document.getElementById('notifications').checked;
  chrome.storage.sync.set({
      atcList: atcList,
      notifications: notifications
    }, function () {
      // Update status to let user know options were saved.
      let status = document.getElementById('status');
      status.textContent = chrome.i18n.getMessage('parametersSaved');
      status.classList.remove('d-none');
      setTimeout(function () {
        status.classList.add('d-none');
      }, 1000);
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
      atcList: '',
      notifications: false
    }, function (items) {
      document.getElementById('atc-list').value = items.atcList;
      document.getElementById('notifications').checked = items.notifications;
    }
  );
}

function initializeTranslations() {
  document.getElementById('title').innerText = chrome.i18n.getMessage('optionsTitle');
  document.getElementById('atc-list-label').innerText = chrome.i18n.getMessage('optionsAtcListLabel');
  document.getElementById('atc-list-help').innerText = chrome.i18n.getMessage('optionsAtcListHelp');
  document.getElementById('save').innerText = chrome.i18n.getMessage('save');
}

document.addEventListener('DOMContentLoaded', initializeTranslations);
document.addEventListener('DOMContentLoaded', restoreOptions);

document.getElementById('save').addEventListener('click', saveOptions);

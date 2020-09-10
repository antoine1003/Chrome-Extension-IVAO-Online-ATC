'use strict';

// Saves options to chrome.storage
function saveOptions() {
  let atcListEl = document.getElementById('atc-list');
  let feedback = document.getElementById('atc-list-feedback-error');
  if (atcListValidation()) {
    const atcList = atcListEl.value;
    const notifications = document.getElementById('notifications').checked;
    if (atcListEl.classList.contains('is-invalid')) {
      atcListEl.classList.remove('is-invalid');
    }
    if (!feedback.classList.contains('d-none')) {
      feedback.classList.add('d-none');
    }
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
  } else {
    atcListEl.classList.add('is-invalid');
    feedback.classList.remove('d-none');
  }
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
  document.getElementById('atc-list-feedback-error').innerText = chrome.i18n.getMessage('optionsAtcListFeedbackError');
  document.getElementById('save').innerText = chrome.i18n.getMessage('save');
}

function atcListValidation() {
  const REGEX_ATC_LIST = /^([A-Z]{4}((_*[A-Z]{0,3}))_[A-Z]{3},*)+$/;
  let value = document.getElementById('atc-list').value;
  if(value.match(REGEX_ATC_LIST)) {
    return true;
  } else {
    return false;
  }
}

document.addEventListener('DOMContentLoaded', initializeTranslations);
document.addEventListener('DOMContentLoaded', restoreOptions);

document.getElementById('save').addEventListener('click', saveOptions);

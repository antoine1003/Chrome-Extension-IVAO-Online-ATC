'use strict';

/**
 * Save options to chrome storage
 */
function saveOptions() {
  if (checkAndDisplayError()) {
    const atcList = document.getElementById('atc-list').value;
    const fullstaffList = document.getElementById('fullstaff-list').value;
    const notifications = document.getElementById('notifications').checked;
    const notificationsFullstaff = document.getElementById('notifications-fullstaff').checked;

    chrome.storage.sync.set({
        atcList: atcList,
        notifications: notifications,
        fullstaffList: fullstaffList,
        notificationsFullstaff: notificationsFullstaff
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
}

/**
 * Check if all fields in parameters are well formatted.
 * If OK => clear error ui and return true
 * If KO => show error ui and return false
 * @returns {boolean}
 */
function checkAndDisplayError() {
  let atcListEl = document.getElementById('atc-list');
  let feedbackAtcList = document.getElementById('atc-list-feedback-error');
  let fullstaffListEl = document.getElementById('fullstaff-list');
  let fullstaffListFeedback = document.getElementById('fullstaff-list-feedback-error');
  if (atcListValidation()) {
    if (aiportFullstaffValidation()) {
      // ATC List Clear
      if (atcListEl.classList.contains('is-invalid')) {
        atcListEl.classList.remove('is-invalid');
      }
      if (!feedbackAtcList.classList.contains('d-none')) {
        feedbackAtcList.classList.add('d-none');
      }

      // Fullstaff Clear
      if (fullstaffListEl.classList.contains('is-invalid')) {
        fullstaffListEl.classList.remove('is-invalid');
      }
      if (!fullstaffListFeedback.classList.contains('d-none')) {
        fullstaffListFeedback.classList.add('d-none');
      }
      return true;
    } else {
      fullstaffListEl.classList.add('is-invalid');
      fullstaffListFeedback.classList.remove('d-none');
    }
  } else {
    atcListEl.classList.add('is-invalid');
    feedbackAtcList.classList.remove('d-none');
  }
  return false;
}

/**
 * Get stored value (or default) and display them on page loaded
 */
function restoreOptions() {
  chrome.storage.sync.get({
      atcList: '',
      notifications: false,
      fullstaffList: '',
      notificationsFullstaff: true
    }, function (items) {
      document.getElementById('atc-list').value = items.atcList;
      document.getElementById('notifications').checked = items.notifications;
      document.getElementById('fullstaff-list').value = items.fullstaffList;

      if (items.notificationsFullstaff === false) {
        let fullstaffListEl = document.getElementById('fullstaff-list');
        fullstaffListEl.readOnly = true;
      }
      document.getElementById('notifications-fullstaff').checked = items.notificationsFullstaff;
    }
  );
}

/**
 * Initialize page translation
 */
function initializeTranslations() {
  document.getElementById('title').innerText = chrome.i18n.getMessage('optionsTitle');
  document.getElementById('atc-list-label').innerText = chrome.i18n.getMessage('optionsAtcListLabel');
  document.getElementById('atc-list-help').innerText = chrome.i18n.getMessage('optionsAtcListHelp');
  document.getElementById('atc-list-feedback-error').innerText = chrome.i18n.getMessage('optionsAtcListFeedbackError');
  document.getElementById('fullstaff-list-label').innerText = chrome.i18n.getMessage('optionsFullstaffListLabel');
  document.getElementById('fullstaff-list-help').innerText = chrome.i18n.getMessage('optionsFullstaffListHelp');
  document.getElementById('fullstaff-list-feedback-error').innerText = chrome.i18n.getMessage('optionsFullstaffListFeedbackError');
  document.getElementById('notifications-fullstaff-label').innerText = chrome.i18n.getMessage('notificationsFullstaff');
  document.getElementById('notifications-label').innerText = chrome.i18n.getMessage('notifications');
  document.getElementById('save').innerText = chrome.i18n.getMessage('save');
}

/**
 * Verify if the atc input list is well formatted.
 * Accepted input AAAA_AA_AAA, BBBB_BBB, CCCC_CCC_CCC
 * @returns {boolean}
 */
function atcListValidation() {
  const REGEX_ATC_LIST = /^([A-Z]{4}(_*[A-Z]{0,3})_[A-Z]{3}){1}(,[A-Z]{4}(_*[A-Z]{0,3})_[A-Z]{3})*$/;
  const REGEX_NO_OBS = /^((?!OBS).)*$/;
  let value = document.getElementById('atc-list').value;
  if (value.match(REGEX_ATC_LIST) && value.match(REGEX_NO_OBS)) {
    return true;
  } else {
    return false;
  }
}

function aiportFullstaffValidation() {
  const REGEX_AIRPORT_LIST = /^([A-Z]){4}(,[A-Z]{4})*$/;
  let value = document.getElementById('fullstaff-list').value;
  if (value.match(REGEX_AIRPORT_LIST)) {
    return true;
  } else {
    return false;
  }
}

function handleChangeFullstaffNotification(e) {
  const isChecked = e.target.checked;
  let fullstaffListEl = document.getElementById('fullstaff-list');
  fullstaffListEl.readOnly = !isChecked;
}

document.addEventListener('DOMContentLoaded', initializeTranslations);
document.addEventListener('DOMContentLoaded', restoreOptions);

document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('notifications-fullstaff').addEventListener('change', handleChangeFullstaffNotification);

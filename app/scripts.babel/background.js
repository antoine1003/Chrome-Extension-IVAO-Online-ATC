'use strict';

chrome.runtime.onInstalled.addListener(() => {
    console.debug('onInstalled', getLocale());
    moment.locale(getLocale());
    chrome.alarms.create('refresh', { periodInMinutes: 15 });
    getStatusOfAtc();
});

chrome.runtime.onStartup.addListener(() => {
  console.debug('onStartup', getLocale());
  moment.locale(getLocale());
});


chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refresh') {
    getStatusOfAtc();
  }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.hasOwnProperty('atcList')) {
    getStatusOfAtc();
  }
});

/**
 * Retrieve locale of the browser
 * @returns {string}
 */
function getLocale() {
  let language;
  if (window.navigator.languages) {
    language = window.navigator.languages[0];
  } else {
    language = window.navigator.userLanguage || window.navigator.language;
  }
  return language;
}

/**
 * Main function that will fetch online people, set open ATC to an array and then compare it with the required watch ATC positions.
 */
function getStatusOfAtc() {
  const REGEX_NO_OBS = /^((?!OBS).)*$/;
  const WAZZUP_URL = 'https://api.ivao.aero/getdata/whazzup/whazzup.txt' + '?_='+ (new Date()).getTime();

  chrome.storage.sync.get(['atcList'], function (result) {
    const userAtcList = result.atcList;
    console.debug('userAtcList', userAtcList);
    if (userAtcList) {
      const userAtcArray = userAtcList.split(',');
      if (userAtcArray.length > 0) {
        Papa.parse(WAZZUP_URL, {
          download: true,
          delimiter: ':',
          complete: function (results) {
            const openAtc = [];
            for (let i = 8; i < results.data.length; i++) {
              const obj = results.data[i];
              const callsign = obj[0];
              if (obj[3] === 'ATC' && callsign.match(REGEX_NO_OBS)) {
                let objAtc = {
                  position: callsign,
                  grade: obj[41],
                  openAt: obj[37]
                };
                openAtc.push(objAtc);
              }
            }

            let listOfAtc = [];
            for (let j = 0; j < userAtcArray.length; j++) {
              const position = userAtcArray[j];
              let openPositionObj = {};
              openPositionObj = openAtc.filter(el => el.position === position);
              if (openPositionObj.length === 1) {
                openPositionObj = openPositionObj[0];
                openPositionObj.isOpen = true;
              } else {
                openPositionObj = {
                  position: position,
                  grade: null,
                  openAt: null,
                  isOpen: false
                };
              }
              listOfAtc.push(openPositionObj);
            }
            console.debug('listOfAtc', listOfAtc);
            handleResults(listOfAtc);
          },
        });
      }
    }
  });
}

/**
 * Update Ui if needed : Badge or notifications.
 * @param results Array of position
 */
function handleResults(results) {
  const nbAtcOnline = getNbOpenAtc(results);
  console.debug('nbAtcOnline', nbAtcOnline);
  if (nbAtcOnline > 0) {
    iconIsOnline();
    setBadge(nbAtcOnline);
    let openLessThanXMinutes = [];

    for (let i = 0; i < results.length; i++) {
      const obj = results[i];
      if (obj.openAt !== null) {

        const openAt = moment.utc(obj.openAt, 'YYYYMMDDhhmmss');
        const now = moment(new Date()); //todays date
        const duration = moment.duration(now.diff(openAt));
        const minutes = duration.asMinutes();
        console.debug(obj.position + ' open for ', minutes);
        if (minutes <= 15) {
          openLessThanXMinutes.push(obj);
        }
      }
    }
    console.debug('openLessThanXMinutes', openLessThanXMinutes);
    if (openLessThanXMinutes.length > 0) {
      chrome.storage.sync.get(['notifications'], function (result) {
        const notifications = result.notifications;
        if (notifications === true) {
          showNotification(openLessThanXMinutes);
        }
      });
    }

  } else {
    iconIsOffline();
    badgeReset();
  }

  chrome.storage.sync.set({
    listOfAtcOpenClosed: results,
    updatedAt: moment().calendar()
  }, function() {});
}

/**
 * TODO: Add functionality to spot full staff
 * @param results
 */
function getFullStaffPosition(results) {

}

function getNbOpenAtc(results) {
  return results.filter(el  => el.isOpen === true).length;
}

// -------------------------- BADGE --------------------------
function badgeFullStaff() {
  chrome.browserAction.setBadgeText({text: 'F'});
}

function setBadge(value) {
  chrome.browserAction.setBadgeText({text: value.toString()});
}

function badgeReset() {
  chrome.browserAction.setBadgeText({text: ''});
}

// -------------------------- ICON --------------------------

function iconIsOnline() {
  chrome.browserAction.setIcon({
    path: {
      19: 'images/online-19.png',
      38: 'images/online-38.png',
    },
  });
}

function iconIsOffline() {
  chrome.browserAction.setIcon({
    path: {
      19: 'images/offline-19.png',
      38: 'images/offline-38.png',
    },
  });
}

function showNotification(positionLists) {
  console.debug('positionLists', positionLists);
  const title = chrome.i18n.getMessage('notificationTitle');
  const positionsNameArray = positionLists.map(el => el.position);
  const positionsConcat = positionsNameArray.join(',');
  let body = '';
  if (positionLists.length === 1) {
    body = chrome.i18n.getMessage('notificationBody', [positionsConcat]);
  } else {
    body = chrome.i18n.getMessage('notificationBodyPlural', [positionsConcat]);
  }
  chrome.notifications.create('reminder', {
      type: 'basic',
      iconUrl: 'images/online-128.png',
      title: title,
      message: body
   }, function(notificationId) {});
}

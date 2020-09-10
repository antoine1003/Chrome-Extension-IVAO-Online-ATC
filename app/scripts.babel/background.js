'use strict';

moment.locale(getLocale());

chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('refresh', { periodInMinutes: 15 });
    getStatusOfAtc();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(alarm.name); // refresh
  if (alarm.name === 'refresh') {
    getStatusOfAtc();
  }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.hasOwnProperty('atcList')) {
    getStatusOfAtc();
  }
});

function getLocale() {
  let language;
  if (window.navigator.languages) {
    language = window.navigator.languages[0];
  } else {
    language = window.navigator.userLanguage || window.navigator.language;
  }
  return language;
}

function getStatusOfAtc() {
  const REGEX_NO_OBS = /^((?!OBS).)*$/;
  const WAZZUP_URL = 'http://api.ivao.aero/getdata/whazzup/whazzup.txt';

  chrome.storage.sync.get(['atcList'], function (result) {
    const userAtcList = result.atcList;
    if (userAtcList) {
      const userAtcArray = userAtcList.split(',');
      if (userAtcArray.length > 0) {
        Papa.parse(WAZZUP_URL, {
          download: true,
          delimiter: ':',
          complete: function (results) {
            const openAtc = [];
            const openAtcCallsign = [];
            for (let i = 8; i < results.data.length; i++) {
              const obj = results.data[i];
              const callsign = obj[0];
              if (obj[3] === 'ATC' && callsign.match(REGEX_NO_OBS)) {
                openAtcCallsign.push(callsign);
                let objAtc = {
                  position: callsign,
                  grade: obj[41]
                };
                openAtc.push(objAtc);
              }
            }

            let listOfAtc = [];
            for (let j = 0; j < userAtcArray.length; j++) {
              const position = userAtcArray[j];
              let openPositionObj = {};
              openPositionObj = openAtc.filter(el => el.position === position);
              console.log("obj", openPositionObj);
              if (openPositionObj.length === 1) {
                openPositionObj = openPositionObj[0];
                openPositionObj.isOpen = true;
              } else {
                openPositionObj = {
                  position: position,
                  grade: null,
                  isOpen: false
                };
              }
              listOfAtc.push(openPositionObj);
            }
            handleResults(listOfAtc);
          },
        });
      }
    }
  });
}

function handleResults(results) {
  const nbAtcOnline = getNbOpenAtc(results);
  if (nbAtcOnline > 0) {
    iconIsOnline();
    setBadge(nbAtcOnline);
  } else {
    iconIsOffline();
    badgeReset();
  }
  //moment().locale(getLocale());
  chrome.storage.sync.set({
    listOfAtcOpenClosed: results,
    updatedAt: moment().calendar()
  }, function() {});
}

function getFullStaffPosition(results) {

}

function getNbOpenAtc(results) {
  return results.filter(el  => el.isOpen === true).length;
}

function helloWorld() {
  let now = new Date();
  console.log(now.toString());
  iconIsOnline();
  showNotification();
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

function iconIsOnline() {
  chrome.browserAction.setIcon({
    path: {
      19: 'images/online-19.png',
      38: 'images/online-38.png',
    },
  });
}

// -------------------------- ICON --------------------------
function iconIsOffline() {
  chrome.browserAction.setIcon({
    path: {
      19: 'images/offline-19.png',
      38: 'images/offline-38.png',
    },
  });
}

function showNotification() {
    // Now create the notification
    // chrome.notifications.create('reminder', {
    //     type: 'basic',
    //     iconUrl: 'images/online-128.png',
    //     title: 'Don\'t forget!',
    //     message: 'You have '+openTodos+' things to do. Wake up, dude!'
    //  }, function(notificationId) {});
}

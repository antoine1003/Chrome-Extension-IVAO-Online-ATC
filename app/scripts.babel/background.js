'use strict';

chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('refresh', { periodInMinutes: 15 });
    getStatusOfAtc();
    moment.locale(getLocale());
});

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(alarm.name); // refresh
  if (alarm.name === 'refresh') {
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
    const atcList = result.atcList;
    const positionList = atcList.split(',');
    if (positionList.length > 0) {
      Papa.parse(WAZZUP_URL, {
        download: true,
        delimiter: ':',
        complete: function (results) {
          const openAtc = [];
          for (let i = 8; i < results.data.length; i++) {
            const obj = results.data[i];
            const callsign = obj[0];
            if (obj[3] === 'ATC' && callsign.match(REGEX_NO_OBS)) {
              openAtc.push(callsign);
            }
          }

          let listOfAtc = [];
          for (let j = 0; j < positionList.length; j++) {
            let obj = {};
            const position = positionList[j];
            obj.position = position;
            if (openAtc.includes(position)) {
              obj.isOpen = true;
            } else {
              obj.isOpen = false;
            }
            listOfAtc.push(obj);
          }
          handleResults(listOfAtc);
        },
      });
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

/**
 *
 * @param results
 * @returns integer
 */
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

// chrome.browserAction.setBadgeText({text: "BG"});

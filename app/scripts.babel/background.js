'use strict';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['interval'], function (result) {
    const intervalInt = parseInt(result.interval);
    // create alarm after extension is installed / upgraded
    chrome.alarms.create('refresh', { periodInMinutes: intervalInt });
  });
  getStatusOfAtc();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(alarm.name); // refresh
  if (alarm.name === 'refresh') {
    helloWorld();
  }
});

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
  if (getNbOpenAtc(results) > 0) {
    iconIsOnline();
  } else {
    iconIsOffline();
  }
}

function hasFullStaff(results) {

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

function badgeReset() {

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
  if (openTodos > 0) {
    // Now create the notification
    // chrome.notifications.create('reminder', {
    //     type: 'basic',
    //     iconUrl: 'images/online-128.png',
    //     title: 'Don\'t forget!',
    //     message: 'You have '+openTodos+' things to do. Wake up, dude!'
    //  }, function(notificationId) {});
  }
}

// chrome.browserAction.setBadgeText({text: "BG"});

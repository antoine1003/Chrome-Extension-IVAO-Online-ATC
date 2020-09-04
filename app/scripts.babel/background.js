"use strict";

chrome.runtime.onInstalled.addListener(() => {
  console.log("onInstalled...");
  chrome.browserAction.setTitle({ title: "My New Title" });
  // create alarm after extension is installed / upgraded
  chrome.alarms.create("refresh", { periodInMinutes: 1 });
  getStatusOfAtc();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(alarm.name); // refresh
  if (alarm.name === "refresh") {
    helloWorld();
  }
});

function getStatusOfAtc() {
  const positionList = ["LFRS_APP", "LFBD_TWR", "DTTA_TWR", "LFBB_CTR"];
  const REGEX_NO_OBS = /^((?!OBS).)*$/;
  const WAZZUP_URL = "http://api.ivao.aero/getdata/whazzup/whazzup.txt";
  Papa.parse(WAZZUP_URL, {
    download: true,
    delimiter: ":",
    complete: function (results) {
      const openAtc = [];
      for (let i = 8; i < results.data.length; i++) {
        const obj = results.data[i];
        const callsign = obj[0];
        if (obj[3] === "ATC" && callsign.match(REGEX_NO_OBS)) {
          openAtc.push(callsign);
        }
      }

      let result = {};
      for (let j = 0; j < positionList.length; j++) {
        const element = positionList[j];
        if (openAtc.includes(element)) {
          result[element] = true;
        } else {
          result[element] = false;
        }
      }
      console.log(result);
    },
  });
}

function name(params) {}

function helloWorld() {
  let now = new Date();
  console.log(now.toString());
  chrome.runtime.sendMessage({ msg: "hello there" });
  chrome.browserAction.setIcon({
    path: {
      19: "images/online-19.png",
      38: "images/online-38.png",
    },
  });
  showNotification();
}

function showNotification() {
  var openTodos = 3;

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

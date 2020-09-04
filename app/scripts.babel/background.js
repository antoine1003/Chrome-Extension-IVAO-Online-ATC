"use strict";



chrome.runtime.onInstalled.addListener(() => {
  console.log("onInstalled...");
  // create alarm after extension is installed / upgraded
  chrome.alarms.create("refresh", { periodInMinutes: 1 });

  chrome.storage.sync.set({ color: "#3aa757" }, function () {
    console.log("The color is green.");
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(alarm.name); // refresh
  if (alarm.name === "refresh") {
    helloWorld();
  }
});

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
}

// chrome.browserAction.setBadgeText({text: "BG"});

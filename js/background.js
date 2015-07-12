// on by default, use localstorage to keep state
var ambiEnabled;
chrome.storage.sync.get('ambiEnabled', function(data) {
	if (data.ambiEnabled === undefined) {
		chrome.storage.sync.set({ambiEnabled: 'on'});
		ambiEnabled = true;
	} else if (data.ambiEnabled === 'on') {
		ambiEnabled = true;
	} else {
		ambiEnabled = false;
	}
});
console.log("Default ambilight: "+ambiEnabled);

chrome.tabs.onUpdated.addListener(function(tab_id, change_info, updated_tab) {
	// onUpdated
	if (isYoutubeTab(updated_tab)) {
		showIcon(updated_tab.id);
		console.log("Ambilight: "+ambiEnabled);
		if (ambiEnabled) {
			console.log("Turning on");
			turnOn(tab_id);
		}
	}
});
chrome.pageAction.onClicked.addListener(function(tab) {
	ambiEnabled = !ambiEnabled;
	// use storage for persistence
	chrome.storage.sync.get('ambiEnabled', function(data) {
		if (data.ambiEnabled === 'on') {
			chrome.storage.sync.set({ambiEnabled: 'off'});
		} else {
			chrome.storage.sync.set({ambiEnabled: 'on'});
		}
	});
	
	// change icon
	icon_path = ambiEnabled ? "img/on.png" : "img/off.png";
	chrome.pageAction.setIcon({tabId: tab.id, path:icon_path});
	// turn on/off ambilight
	if (ambiEnabled) {
		turnOn(tab.id);
	} else {
		turnOff(tab.id);
	}
	console.log("Triggering ambilight: "+ambiEnabled);
});
function isYoutubeTab(tab) {
	return tab.url.match(/youtube/);
}
function turnOff(tab_id) {
	chrome.tabs.executeScript(tab_id, {file: "js/off.js"});
}
function turnOn(tab_id) {
	chrome.tabs.executeScript(tab_id, {file: "js/on.js"});
}
function showIcon(tab_id) {
	chrome.pageAction.show(tab_id);
	console.log("showing ambilight: "+ambiEnabled);
	icon_path = ambiEnabled ? "img/on.png" : "img/off.png";
	chrome.pageAction.setIcon({tabId: tab_id, path:icon_path});
}
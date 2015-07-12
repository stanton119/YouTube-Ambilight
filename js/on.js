////// sub functions //////
var r_avg = 0;
var g_avg = 0;
var b_avg = 0;
var canvas;
// setup ambilight
function setupAmbilight() {
	console.log("Ambilight: Setting up Ambilight");
	// ignore if already setup
	if (typeof setupCorrectly != 'undefined') {
	// if (setupCorrectly) {
		console.log("Ambilight: Already set up");
		return;
	}
	
	// get video (as global)
	videoAmbiPlayer = document.getElementsByClassName("html5-main-video")[0];
	videoAmbiPlayer.crossOrigin = 'anonymous';

	// create canvas (global)
	if (typeof canvas == 'undefined' || canvas.width==0) {
		console.log("Ambilight: Creating canvas");
		canvas = document.createElement("canvas");
		canvas.width = 80;//Math.round(videoAmbiPlayer.videoWidth/1);
		canvas.height = 60;//Math.round(videoAmbiPlayer.videoHeight/1);
		console.log("Width: " + canvas.width + ", Height: " + canvas.height);
	}

	// if no width, reload player
	if(canvas.width==0) {
		setTimeout(function () {
			setupAmbilight();
		}, 500);
	} else {
		setupCorrectly = true;
		// setup listener, remove excess
		videoAmbiPlayer.addEventListener("play", function() {
			console.log("Ambilight: Adding event listener");
			callBackOn = 1;
			timerCallback();
		}, false);
		
		callBackOn = 1;
		ambilightState = 1;
		timerCallback();
	}
	
	// initialise averages
	r_avg = 0;
	g_avg = 0;
	b_avg = 0;
}
// main looping callback
function timerCallback() {
	if (videoAmbiPlayer.paused || videoAmbiPlayer.ended || !ambilightState) {
		console.log("Ambilight: callBack off, ambilightState: " + ambilightState);
		callBackOn = 0;
		return;
	}
	// update canvas, at origin
	canvas.getContext('2d')
	      .drawImage(videoAmbiPlayer, 0, 0, canvas.width, canvas.height);

	// average colour
	try {
		var frame = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
	} catch (variable) {
		console.log("Ambilight: reseting after advert");
		ambilightState = 0;
		setupCorrectly = false;
		callBackOn = 0;
		setupAmbilight();
		return;
	}
	

	var l = frame.data.length / 4;

	var r = 0;
	var g = 0;
	var b = 0;
	// iterate pixels
	for (var i = 0; i < l; i++) {
		r = r+frame.data[i * 4 + 0];
		g = g+frame.data[i * 4 + 1];
		b = b+frame.data[i * 4 + 2];
	}
	// round to int, low-pass filter averages, moving average
	r_avg = Math.round(r/l*0.9 + r_avg*0.1);
	g_avg = Math.round(g/l*0.9 + g_avg*0.1);
	b_avg = Math.round(b/l*0.9 + b_avg*0.1);
	
	// truncate to 0-255

	// convert to hex
	var bgcolour = rgbToHex(r_avg, g_avg, b_avg);

	// colour background
	colourElements(bgcolour);
	
	// loop function
	setTimeout(function () {
		timerCallback();
	}, 40);	// 40: 25fps - less load
}
	
// convert to hex
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// colour elements
function colourElements(hexAvg) {
	// colour background
	document.body.style.backgroundColor= hexAvg;
	//document.getElementsByClassName("html5-video-container")[0].style.backgroundColor= hexAvg;
	//document.getElementById('theater-background').style.backgroundColor= hexAvg;
	document.getElementById('theater-background').style.backgroundColor= hexAvg;
}


setupAmbilight();
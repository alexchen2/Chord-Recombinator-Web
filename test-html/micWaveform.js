// webAudioTest.js - Test for microphone audio visualizer in microphone input

// Size of visualization in canvas
const WIDTH = 1500;
const HEIGHT = 1500;

// Separate demo canvas for webAudioTest.html
const canvas = document.querySelector(".waveform");

// Create analyzer (...to process time & freq. data in audio context for visualizations)
let analyzer;
let bufferLength;

//////// FUNCTIONS ////////

/** 
* Gets audio from the microphone in realtime and draws a waveform to the given canvas using drawTimeData().
* @param {Element | null} canvas - Canvas element from DOM to draw waveform to.
* @param {MediaStream} stream - Media stream from "navigator.mediaDevices.getUserMedia()" receiving microphone audio.
*/
function render(canvas, stream) {
    // Get canvas from DOM and create 2d canvas context (abbr. ctx)
    const canCtx = canvas.getContext("2d");

    // Set canvas dimensions
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const audioCtx = new AudioContext(); 
    analyzer = audioCtx.createAnalyser();

    // Create something similar to MediaRecorder obj from stream w/ audioCtx and hook up analyzer
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyzer);

    // In a nutshell: determines how much data should be collected
    // Note to self: refer to fast fourier transforms in the future for further reading
    analyzer.fftSize = 2 ** 13;  // experiment with 2**11 later; must be powers of 2
    bufferLength = analyzer.fftSize;
    
    // Create empty 8-bit unsigned int array for data on time
    const timeData = new Uint8Array(bufferLength);
    
    drawTimeData(canCtx, timeData);
}

function drawTimeData(canCtx, timeData) {
    // console.log(timeData instanceof Uint8Array)
    
    //fill timeData array with corresponding data from analyzer
    analyzer.getByteTimeDomainData(timeData);
    // debug test
    // console.log(timeData);

    // Clear canvas
    canCtx.clearRect(0, 0, WIDTH, HEIGHT);

    // Setup drawing on canvas
    const sliceWidth = WIDTH / bufferLength; // no need to round values, canvas already does that
    // console.log(sliceWidth);
    let x = 0;

    canCtx.lineWidth = 5;
    canCtx.strokeStyle = "#3E8DE3";
    canCtx.fillStyle = "#0C2D87";
    canCtx.beginPath();

    timeData.forEach((data, index) => {
        const v = data / 128;
        const y = (v * HEIGHT) / 2;

        if (index === 0) {
            canCtx.moveTo(x, y);
        } else {
            canCtx.lineTo(x, y);
        }

        x += sliceWidth;
    });

    // x = 0;
    // timeData.forEach((data, index) => {
    //     const v = data / 128;
    //     const y = -(v * HEIGHT) / 2;

    //     if (index === 0) {
    //         canCtx.moveTo(x, y);
    //     } else {
    //         canCtx.lineTo(x, y);
    //     }

    //     x += sliceWidth;
    // });

    // canCtx.closePath();
    // canCtx.fill();

    // canCtx.lineTo(x - sliceWidth, ((timeData.slice(-1) / 128) * HEIGHT) / 2);

    canCtx.stroke();

    // recursively calls itself on next drawn frame to screen
    requestAnimationFrame(() => drawTimeData(canCtx, timeData));
}

// Put check for getUserMedia support in main function, plus run getAudio from inside
function main() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;

    // Check if mediaRecorder is supported in the current browser
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia supported.')
        navigator.mediaDevices.getUserMedia({
            // constraints - only audio needed for this app
            audio: true
        })
        // Success callback
        .then((stream) => {
            render(canvas, stream); 
        })

        // Error callback
        .catch(err => {
            console.error(`The following getUserMedia error occurred: ${err}`)
        })
    } else {
        console.log('getUserMedia not supported on your browser!')
    }

}

// main();

export { render };
// External library imports
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import Hover from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/hover.esm.js'

// Module imports                
import { render } from "./micWaveform.js"

//////// VARIABLES ////////
let micFileName = ""; // filename for mic recorded files
let recFileName = ""; // filename for pre-recorded files

// Buttons
const recBtn = document.getElementById("btn-record");
const playBtn = document.getElementById("btn-play");
const muteBtn = document.getElementById("btn-mute");        // Note to self: use ws.setMuted(true or false)
const micFinishBtn = document.getElementById("btn-analyze-mic");
const fileFinishBtn = document.getElementById("btn-analyze-file");

// HTML elements for showing waveforms
const micWave = document.getElementById("mic-wave");         // use display: inline or block to show when needed
const fileWave = document.getElementById("recorded-wave");   

// Labels
const micNoteLbl = document.getElementById("show-notes-mic");
const fileNoteLbl = document.getElementById("show-notes-file");
const fileNameLbl = document.getElementById("filename");

let hasRecorded = false;

let rec;     // For recorder.js Recorder

// Recorded file waveform settings (using wavesurfer.js library)
let ws;
const wsSettings = {
    container: "#recorded-wave",
    height: "auto",
    waveColor: "#3E8DE3",
    progressColor: "#0C2D87",
    url: "",      // use ws.load() to load in another audio file later, or set to wsSettings before creating waveform
    plugins: [
        Hover.create({
            lineColor: "#ff0000",
            lineWidth: 2,
            labelBackground: "#555",
            labelColor: "#fff",
            labelSize: "14px",
        }),
    ],
}

//////// FUNCTIONS ////////

function record(stream) {
    // Create audio context and hook up to microphone stream
    let audioCtx = new AudioContext();
    let input = audioCtx.createMediaStreamSource(stream);

    // Initialize recorder.js Recorder
    rec = new Recorder(input, {numChannels : 1});

    // const record = new MediaRecorder(stream);

    recBtn.addEventListener("click", () => {
        if (rec.recording) {   // Stop recording
            hasRecorded = true;

            micWave.style.height = "0%";  
            micWave.style.display = "none";
            fileWave.style.height = "100%";
            fileWave.style.display = "block";

            // Enable buttons for audio playback
            playBtn.disabled = false;
            muteBtn.disabled = false;
            micFinishBtn.disabled = false; 
            // fileFinishBtn.disabled = false;

            // Stop recording and revert record btn colours back to normal
            rec.stop();
            stream.getAudioTracks()[0].stop();
            // console.log(record.state);
            console.log("recorder stopped");
            recBtn.style.background = "";
            recBtn.style.color = "";

            // Export .wav file
            rec.exportWAV(uploadRecording);

        } else {                             // Start recording
            // If there already exists another recording, first delete it and its HTML elements
            if (hasRecorded) {

                playBtn.removeEventListener("click", playRecording);
                recBtn.removeEventListener("click", muteRecording); 
                micFinishBtn.removeEventListener("click", getMicNotes);
                // fileFinishBtn.removeEventListener("click", getFileNotes);

                // Get rid of last recording's waveform & hide associated HTML element
                ws.destroy();
                fileWave.style.height = "0%";
                fileWave.style.display = "none";

                // Disable audio control buttons and analyze buttons
                playBtn.disabled = true;
                muteBtn.disabled = true;
                micFinishBtn.disabled = true;
                // fileFinishBtn.disabled = true;

                // Erase past note data, if any
                micNoteLbl.textContent = "Notes: ";
                fileNoteLbl.textContent = "Notes: ";

                // Clears past recording data in Recorder obj
                rec.clear(); 
                hasRecorded = false;
            }

            // Show microphone waveform HTML element and start waveform
            micWave.style.height = "100%";
            micWave.style.display = "block";
            render(micWave, stream);

            // Start recording
            rec.record();
            recBtn.style.background = "red";
            recBtn.style.color = "black";
        }

    });

    // Collect audio info into chunks array
    // let chunks = [];
    // record.ondataavailable = (e) => {
    //     chunks.push(e.data);
    // };

    // Upon stopping the recording:
    // record.onstop = (e) => {

    //   };
}

function uploadRecording(blob) {
    console.log("recorder stopped");

    micFileName = "audioClip" + getfileDate() + ".wav";
  
    // create new audio blob and formdata
    const data = new FormData();
    // const blob = new Blob(chunks, { type: "audio/wav "}); //; codecs=mp3" });

    // chunks = [];
    // const audioURL = window.URL.createObjectURL(blob);
    // audio.src = audioURL;
    // console.log("testing upload");
    // console.log(audio.src, audioURL);

    // Creates file from audio blob
    const file = new File( [ blob ], micFileName, { type: "audio/wav" } );
    // const file = new File( [ blob ], micFileName, { type: "audio/mpeg"} );
    data.append("file", file, micFileName);   // param: name of field entry in formData, actual data, and actual name of file/data

    uploadAudio(data);
    // testGet();

    wsSettings["url"] = "../audio/" + micFileName;
    ws = WaveSurfer.create(wsSettings);

    playBtn.addEventListener("click", playRecording);
    muteBtn.addEventListener("click", muteRecording);
    // fileFinishBtn.addEventListener("click", getFileNotes);
    micFinishBtn.addEventListener("click", getMicNotes);    // Modify getMicNotes() later in the future
}

// Might not use
function getfileDate() {
    const date = new Date();
    const output = ("-" + date.getDate().toString().padStart(2, 0) + "-" +
                    date.getHours().toString().padStart(2, 0) + "-" +
                    date.getMinutes().toString().padStart(2, 0) + "-" +
                    date.getSeconds().toString().padStart(2, 0));

    return output;
}

//////// BUTTON FUNCTIONS ////////
function playRecording() {
    if (ws instanceof WaveSurfer) {
        if (ws.isPlaying()) {
            playBtn.textContent = "Play";
            ws.pause();
        } else {
            playBtn.textContent = "Pause";
            ws.play();
        }
    }
}

function muteRecording() {
    if (ws instanceof WaveSurfer) {
        if (ws.getMuted()) {
            muteBtn.textContent = "Mute";
            ws.setMuted(false);
        } else {
            muteBtn.textContent = "Unmute";
            ws.setMuted(true);
        }
    }
}

function getFileNotes() {
    let notes = requestNotes(recFileName);

    fileNoteLbl.textContent = "Notes: " + notes;
}

// Unused WIP, implement later
function getMicNotes() {
    let notes = requestNotes(micFileName);

    micNoteLbl.textContent = "Notes: " + notes;
}

//////// BACK-END REQUESTS ////////

async function uploadAudio(formData) {
    fetch("http://localhost:5000/saveAudio", {
        method: "POST",
        body: formData
    })
    .then((response) => console.log(response.status))
    .catch((err) => console.error(err));

    return;
}

async function requestNotes(fileName) {
    let notes = "{}";

    fetch(`http://localhost:5000/prerecordNotes?file=${fileName}`) // add query of filename to url
    .then((response) => {
        // let output = JSON.parse(response);
        notes = response.text();
        // return response.json()
    })
    .catch((err) => {
        console.log("Error in fetching notes: " + err);
    })
    // .then((info) => {
    //     console.log(info);
    // })

    return notes;
}

function main() {
    // Mandatory stuff to work with Safari
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;

    // Check if mediaRecorder is supported in the current browser
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log("getUserMedia supported.");
        navigator.mediaDevices.getUserMedia({
            // constraints - only audio needed for this app
            audio: true
        })
        // Success callback
        .then((stream) => {
            record(stream); 
        })

        // Error callback
        .catch(err => {
            console.error(`The following getUserMedia error occurred: ${err}`);
        })
    } else {
        console.log("getUserMedia not supported on your browser!");
    }
}

// async function retrieveAudio(fileName) {
//     fetch("http://localhost:5000/receive/" + fileName)
// }

main();

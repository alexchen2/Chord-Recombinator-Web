// External library imports
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import Hover from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/hover.esm.js'
import { getWaveBlob } from "./webm-to-wav-converter/index.js" // From "https://www.npmjs.com/package/webm-to-wav-converter?activeTab=readme"

// // import { createFFmpeg } from "../node_modules/@ffmpeg/ffmpeg/src/browser/index.js";
// // import { FFmpeg } from "https://unpkg.com/@ffmpeg/ffmpeg@0.12.1/dist/esm/ffmpeg.js";
// import { FFmpeg, fetchFile } from "https://unpkg.com/@ffmpeg/util@0.12.0/dist/esm/index.js";

// Module imports                
import { render } from "./micWaveform.js"

//////// VARIABLES ////////
let micFileName = ""; // filename for mic recorded files
let prerecFileName = ""; // filename for pre-recorded files

// When pressing record button, keeps track of the audio file duration to be used in fix-webm-duration.js;
// this is part of an 6-year old issue with chrome not generating metadata from MediaRecorder audio and video files 
// Refer to: https://bugs.chromium.org/p/chromium/issues/detail?id=642012
let startTime;
let duration;

// Buttons
const recBtn = document.getElementById("btn-record");
const playBtn = document.getElementById("btn-play");
const muteBtn = document.getElementById("btn-mute");        // Note to self: use ws.setMuted(true or false)
const micFinishBtn = document.getElementById("btn-analyze-mic");
const uploadInput = document.getElementById("prerecordFile");
const fileFinishBtn = document.getElementById("btn-analyze-file");

// HTML elements for showing waveforms
const micWave = document.getElementById("mic-wave");         // use display: inline or block to show when needed
const fileWave = document.getElementById("recorded-wave");

// Labels
const micNoteLbl = document.getElementById("show-notes-mic");
const fileNoteLbl = document.getElementById("show-notes-file");
const fileNameLbl = document.getElementById("filename");

let hasRecorded = false;

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
    const rec = new MediaRecorder(stream);

    recBtn.addEventListener("click", () => {
        if (rec.state == "recording") {   // Stop recording
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

            // Stop recording and revert record btn colours back to nrmal
            rec.stop();

            recBtn.style.background = "";
            recBtn.style.color = "";

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

                hasRecorded = false;
            }

            // Show microphone waveform HTML element and start mic waveform
            micWave.style.height = "100%";
            micWave.style.display = "block";
            render(micWave, stream);

            // Start recording
            rec.start();
            startTime = Date.now()      // Starts keeping track of audio duration the moment the recording starts

            // Visually change appearance of record button to indicate audio being recorded
            recBtn.style.background = "red";
            recBtn.style.color = "black";
        }

    });

    // Collect audio info into chunks array
    let chunks = [];
    rec.ondataavailable = (e) => {
        chunks.push(e.data);
    };

    // Upon stopping the recording:
    rec.onstop = (e) => {
        // Calculates duration of audio file the moment the recording stops
        duration = Date.now() - startTime;
        console.log(duration)
        console.log("recorder stopped");

        // const blob = getWaveBlob(chunks);
        // uploadRecording(blob);

        // create new (buggy) audio blob and formdata
        const buggyBlob = new Blob(chunks, { type: "audio/webm" }); //; codecs=mp3" });
        chunks = [];

        ysFixWebmDuration(buggyBlob, duration, uploadRecording);

        // const audioURL = window.URL.createObjectURL(blob);
        // audio.src = audioURL;
        // console.log("testing upload");
        // console.log(audio.src, audioURL);

    };
}

async function uploadRecording(fixedBlob) {
    // Convert .webm blob to .wav using ffmpeg.wasm
    // let newBlob = convertWebmToMp3(fixedBlob);

    micFileName = "audioClip" + getfileDate() + ".webm";
    const data = new FormData();

    // Creates file from audio blob
    const file = new File([fixedBlob], micFileName, { type: "audio/webm" });
    // const file = new File( [ blob ], micFileName, { type: "audio/mpeg"} );
    data.append("file", file, micFileName);   // param: name of field entry in formData, actual data, and actual name of file/data

    clearFiles();
    let status = await uploadAudio(data);
    console.log("Awaited upload file status: " + status);
    // testGet();

    wsSettings["url"] = "../audio/" + micFileName;
    ws = WaveSurfer.create(wsSettings);
    // alert(`${duration}, ${ws.getDuration()} => ${duration - ws.getDuration()}`);

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

// function taking advantage of ffmpeg.wasm nodejs library; courtesy of Suro on stackexchange
// Link: https://stackoverflow.com/questions/57365486/converting-blob-webm-to-audio-file-wav-or-mp3 
// Used as part of the process of obtaining files with proper metadata from MediaRecorder on Chrome
// async function convertWebmToMp3(webmBlob) {
//     const ffmpeg = createFFmpeg({ log: false });
//     await ffmpeg.load();

//     const inputName = 'input.webm';
//     const outputName = 'output.mp3';

//     ffmpeg.FS('writeFile', inputName, await fetch(webmBlob).then((res) => res.arrayBuffer()));

//     await ffmpeg.run('-i', inputName, outputName);

//     const outputData = ffmpeg.FS('readFile', outputName);
//     const outputBlob = new Blob([outputData.buffer], { type: 'audio/mp3' });

//     return outputBlob;
// }

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

async function uploadFile() {
    // First check if file is of the correct format
    // alert(`${uploadInput.value.split(".").slice(-1).toString() === "webm"} ${typeof uploadInput.value.split(".").slice(-1)}, ${"webm"}`)
    if (!["wav", "ogg", "webm", "mp3"].includes(uploadInput.value.split(".").slice(-1).toString())) {
        alert("Please enter a file of one of these extension types: '.wav', '.ogg', '.mp3', or '.webm'.");
        uploadInput.value = null;
    } else {
        // Create new form data obj and add file
        prerecFileName = uploadInput.value.split("\\").slice(-1).toString();
        // alert(prerecFileName);
        const data = new FormData();
        data.append("file", uploadInput.files[0]);   // param: name of field entry in formData, actual data, and actual name of file/data

        // Clear excess files in server
        clearFiles();

        let status = await uploadAudio(data);
        console.log("Awaited upload file status: " + status);

        // Enable button for identifying buttons, if disabled, and clear btn label from past results
        fileFinishBtn.disabled = false;
        fileNoteLbl.textContent = "Notes: ";
    }

}

async function getFileNotes() {
    let notes = await requestNotes(prerecFileName);
    console.log("Received notes!");

    let notesStr = notes.toString();
    fileNoteLbl.textContent = "Notes: " + notesStr;
}

// Unused WIP, implement later
async function getMicNotes() {
    let notes = await requestNotes(micFileName);
    console.log("Received notes!");

    let notesStr = notes.toString();
    micNoteLbl.textContent = "Notes: " + notesStr;

    // requestNotes(micFileName)
    // .then((notes) => {
    //     return notes.toString();
    // })
    // .then((notesStr) => {
    //     micNoteLbl.textContent = "Notes: " + notesStr;
    // })
    // .catch((err) => {
    //     console.error(err);
    //     alert("Error reading file for notes: " + err);
    // })

}

//////// REQUESTS TO BACK-END ////////
function uploadAudio(formData) {
    return new Promise((resolve, reject) => {
        console.log("Uploading audio...");
        fetch("https://chordwizard.glitch.me/saveAudio", {
            method: "POST",
            body: formData
        })
            .then((response) => {
                console.log("Finished uploading audio!");
                resolve(response.status)
            })
            .catch((err) => {
                console.error(err);
                alert("Upload files error: " + err);
                console.log("Upload failed...");

                reject(err);
            });
    })
}

function clearFiles() {
    fetch("https://chordwizard.glitch.me/clearFiles", {
        method: "POST"
    })
        // .then((response) => {
        //     return(response.status)
        // })
        .catch((err) => {
            console.error(err);
            // alert("File deletion error: " + err);

            return ("File clearing failed...");
        });
}

function requestNotes(fileName) {
    let notes = "{}";

    return new Promise((resolve, reject) => {
        fetch(`https://chordwizard.glitch.me/prerecordNotes?file=${fileName}`) // add query of filename to url
            .then((response) => {
                // let output = JSON.parse(response);
                notes = response.text();
                console.log("Processing notes...");

                resolve(notes);
                // return response.json()
            })
            .catch((err) => {
                console.log("Error in fetching notes: " + err);
                reject(err);
            })
    })

    // .then((info) => {
    //     console.log(info);
    // })

}

function main() {
    // When file is manually dragged/dropped or saved via button, immediately upload file to server
    uploadInput.addEventListener("change", () => {
        uploadFile();
    })

    fileFinishBtn.addEventListener("click", () => {
        if (prerecFileName != "") {
            // console.log("test");
            getFileNotes();
        } else {
            // console.log("fail test");
        }
    })


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
//     fetch("https://chordwizard.glitch.me/receive/" + fileName)
// }

main();

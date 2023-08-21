// External library imports
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import Hover from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/hover.esm.js'

// // import { createFFmpeg } from "../node_modules/@ffmpeg/ffmpeg/src/browser/index.js";
// // import { FFmpeg } from "https://unpkg.com/@ffmpeg/ffmpeg@0.12.1/dist/esm/ffmpeg.js";
// import { FFmpeg, fetchFile } from "https://unpkg.com/@ffmpeg/util@0.12.0/dist/esm/index.js";

// Module imports                
import { render } from "./micWaveform.mjs"

//////// CONSTANTS & VARIABLES ////////
let micFileName = ""; // filename for mic recorded files
let prerecFileName = ""; // filename for pre-recorded files

// When pressing record button, keeps track of the audio file duration to be used in fix-webm-duration.js;
// this is part of an 6-year old issue with chrome not generating metadata from MediaRecorder audio and video files 
// Refer to: https://bugs.chromium.org/p/chromium/issues/detail?id=642012
let startTime; 
let duration;

// General area/wrappers
let micWrapper = document.querySelector(".mic-wrapper");
let wrapperDivide = document.querySelector(".wrapper-divider");
let fileWrapper = document.querySelector(".file-wrapper");

// Button HTML elements
const recBtn = document.querySelector("#btn-record");
const playBtn = document.querySelector("#btn-play");
const muteBtn = document.querySelector("#btn-mute");        // Note to self: use ws.setMuted(true or false)
const identifyMicBtn = document.querySelector("#mic-btn-identify");
const identifyFileBtn = document.querySelector("#file-btn-identify");

// Drag and drop area HTML elements
const dropArea = document.querySelector(".drop-box");
const uploadInput = document.getElementById("prerecordFile");
const errorInput = document.querySelector("#error-reupload strong");
const successInput = document.querySelector("#success-reupload strong");
const successFilename = document.getElementById("success-filename");
let droppedFile = null;

// HTML elements for showing waveforms
const micWave = document.getElementById("mic-wave");         // use display: inline or block to show when needed
const fileWave = document.getElementById("recorded-wave");

// Recording elements
const recIcon = document.getElementById("record-circle");
const recTimer = document.getElementById("record-timer");
let recInterval = null;

// Loading screen variables and elements
const loadScreen = document.querySelector(".loading-screen")
const note1 = document.querySelector("#note-1-inner");

// Various booleans
let loadClrSwitched = false;  // Checks if loading screen colours have been switched at end of previous animation iteration
let hasRecorded = false;      // Checks if a recording has been made with the mic functionality

// Will be implemented later...
let micNotes = "";
let fileNotes = "";

// Recorded file media player waveform settings (using wavesurfer.js library)
let ws;
const wsSettings = {
    container: "#recorded-wave",
    height: "auto",
    waveColor: "#3E8DE3",
    progressColor: "#0C2D87",
    url: "",      // use ws.load() to load in another audio file later, or set to wsSettings before creating waveform
    plugins: [
        Hover.create({
            lineColor: "#511bf5",
            lineWidth: 3,
            labelBackground: "#555",
            labelColor: "#fff",
            labelSize: "14px",
        }),
    ]

    // Note to self: Uncomment block below to visually adjust waveform into bars
    // barWidth: 4,
    // // Optionally, specify the spacing between bars
    // barGap: 1,
    // // And the bar radius
    // barRadius: 2,
}

//////// FUNCTIONS ////////
// Creates + returns a new getUserMedia audio stream and an associated mediaRecorder object with it
async function requestRecorder() {
    return new Promise(async (resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            window.localStream = stream;
            resolve([new MediaRecorder(stream), stream]);
        } catch (err) {
            alert(`Sorry, there was a problem with accessing the device's microphone: ${err}`);
            console.error(`The following getUserMedia error occurred: ${err}`);
            resolve([-1, -1]);
        }
    })
}

// General recording *functionality* (for during recording and after it is stopped; 
// Note that clickRecord takes care of starting the recording and the visuals when clicking record button)
function record(rec) {
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

        window.localStream.getTracks()[0].stop();
        // Imported from fix-webm-duration.js
        // ysFixWebmDuration runs and fixes buggy webm blob, then calls the callback function (uploadRecording) passing fixed blob as argument
        ysFixWebmDuration(buggyBlob, duration, uploadRecording);

        // const audioURL = window.URL.createObjectURL(blob);
        // audio.src = audioURL;
        // console.log("testing upload");
        // console.log(audio.src, audioURL);
    };
}

// Callback function to upload newly created mic recordings (given an audio blob)
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
    let statusUpload = await uploadAudio(data);
    console.log("Awaited upload file status: " + statusUpload);
    // testGet();
  
    let outputConvert = await convertAudio(micFileName);
    // alert("Awaited conversion new file name: " + outputConvert + " " + (typeof outputConvert));
    micFileName = outputConvert.replaceAll("\\", "/").split("/").slice(-1).toString();
    // alert(micFileName + " " + typeof micFileName)

    wsSettings["url"] = "../assets/vendor/audio/user/" + micFileName;
    ws = WaveSurfer.create(wsSettings);

    ws.on("finish", () => {
        playBtn.title = "Play recording";
        playBtn.querySelector("img").src = "../assets/vendor/img/btn/play.png"
    })
    // alert(`${duration}, ${ws.getDuration()} => ${duration - ws.getDuration()}`);

    // ws.on("ready", () => {
    //     alert("Test ready")
    // })
  
    // Add play btn listeners
    playBtn.addEventListener("click", clickPlay);

    playBtn.addEventListener("mousedown", () => {
        playBtn.classList.add("active");
    })

    "mouseup mouseleave".split(" ").forEach((event) => {
        playBtn.addEventListener(event, () => {
            playBtn.classList.remove("active");
        })
    })

    // Add mic identify btn listeners
    identifyMicBtn.addEventListener("click", clickIdentifyMic);

    identifyMicBtn.addEventListener("mousedown", () => {
        identifyMicBtn.classList.add("active");
    })

    "mouseup mouseleave".split(" ").forEach((event) => {
        identifyMicBtn.addEventListener(event, () => {
            identifyMicBtn.classList.remove("active");
        })
    })

    // Add mute btn listeners
    muteBtn.addEventListener("click", clickMute);
    // fileFinishBtn.addEventListener("click", getFileNotes);  // Change to be triggered by pressing identify button
    // micFinishBtn.addEventListener("click", getMicNotes);   

}

// Returns string for naming mic-recorded files
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

// Modifies mic section style to hide it (when other section is used instead); avoids confusion with two "identify buttons"
function rmMicWrapper() {
    // modify micWrapper style properties
    micWrapper.style.overflow = "hidden";
    micWrapper.style.height = "0px";
    micWrapper.style.opacity = "0";
    micWrapper.style.margin = "0px";
    micWrapper.style.padding = "0px";
}

// Modifies file section style to hide it (when other section is used instead)
function rmFileWrapper() {
    // modify micWrapper style properties (mainly spacing below wrapper)
    micWrapper.style.marginBottom = "0px";
    micWrapper.style.paddingBottom = "0px";
    micWrapper.style.borderBottom = "none";

    // modify wrapper divider style properties
    wrapperDivide.style.overflow = "hidden";
    wrapperDivide.style.height = "0px";
    wrapperDivide.style.opacity = "0";
    wrapperDivide.style.margin = "0px";
    wrapperDivide.style.padding = "0px";

    // modify fileWrapper style properties
    fileWrapper.style.overflow = "hidden";
    fileWrapper.style.height = "0";
    fileWrapper.style.opacity = "0";
    fileWrapper.style.margin = "0";
    fileWrapper.style.padding = "0";
}

//////// BUTTON FUNCTIONS ////////
// VIsually changes page when beginning to record, while actually starting the recording
function clickRecord(rec, stream) {
    if (rec.state == "recording") {   // If already recording, then stop audio stream and change style accordingly
        hasRecorded = true;

        // Hides real-time mic wave display and shows wavesurfer media player display
        micWave.style.height = "0%";
        micWave.style.display = "none";
        fileWave.style.height = "100%";
        fileWave.style.display = "block";

        // Enable buttons for audio playback
        playBtn.disabled = false;
        muteBtn.disabled = false;
        identifyMicBtn.disabled = false;

        recBtn.title = "Start recording";
        playBtn.title = "Play recording";
        muteBtn.title = "Mute audio";
        identifyMicBtn.title = "";

        // micFinishBtn.disabled = false;
        // fileFinishBtn.disabled = false;

        // Stop recording and revert record btn colours back to normal
        rec.stop();

        // Disables blinking red record button
        clearInterval(recInterval);
        recBtn.classList.remove("active");
        recIcon.classList.remove("recording");

    } else {                             // Start recording
        // If there already exists another recording, first delete it and its HTML elements
        if (hasRecorded) {

            playBtn.querySelector("img").src = "../assets/vendor/img/btn/play.png"
            muteBtn.querySelector("img").src = "../assets/vendor/img/btn/speaker-1.png";
            muteBtn.classList.remove("active");

            playBtn.removeEventListener("click", clickPlay);
            recBtn.removeEventListener("click", clickMute);
            identifyMicBtn.removeEventListener("click", clickIdentifyMic);
            // micFinishBtn.removeEventListener("click", getMicNotes);
            // fileFinishBtn.removeEventListener("click", getFileNotes);

            // Get rid of last recording's waveform & hide associated HTML element, as well as remove all associated listeners
            ws.unAll();
            ws.destroy();
            fileWave.style.height = "0%";
            fileWave.style.display = "none";

            // Disable audio control buttons and analyze buttons
            playBtn.disabled = true;
            muteBtn.disabled = true;
            identifyMicBtn.disabled = true;
            // micFinishBtn.disabled = true;
            // fileFinishBtn.disabled = true;

            playBtn.title = "Record using your microphone first.";
            muteBtn.title = "Record using your microphone first.";
            identifyFileBtn.title = "Record using your microphone first.";

            // Erase past note data, if any
            // micNotes = "";
            // fileNotes = "";

            hasRecorded = false;
        } else {    // If first time recording, then just hide file upload section instead
            rmFileWrapper();
        }

        // Show microphone waveform HTML element and start mic waveform
        micWave.style.height = "100%";
        micWave.style.display = "block";
        render(micWave, stream);

        // Start recording
        rec.start();
        startTime = Date.now();      // Starts keeping track of audio duration the moment the recording starts

        // Visually change appearance of record button to indicate audio being recorded & start timer
        recTimer.innerHTML = "00:00";
        recInterval = setInterval(updateTimer, 1000, startTime);

        recBtn.title = "Stop recording";
        recBtn.classList.add("active");
        recIcon.classList.add("recording");
    }
}

function clickPlay(event = null) {
    if (ws instanceof WaveSurfer) {
        if (ws.isPlaying()) {
            playBtn.querySelector("img").src = "../assets/vendor/img/btn/play.png";
            playBtn.title = "Play recording";

            ws.pause();
        } else {
            playBtn.querySelector("img").src = "../assets/vendor/img/btn/pause.png";
            playBtn.title = "Pause recording";

            ws.play();
        }
    }
}

function clickMute(event = null) {
    if (ws instanceof WaveSurfer) { // Unmute wavesurfer if muted
        if (ws.getMuted()) {
            muteBtn.querySelector("img").src = "../assets/vendor/img/btn/speaker-1.png";
            muteBtn.classList.remove("active");
            muteBtn.title = "Mute audio";

            ws.setMuted(false);
        } else {                    // Mute wavesurfer otherwise
            muteBtn.querySelector("img").src = "../assets/vendor/img/btn/speaker-muted-1.png";
            muteBtn.classList.add("active");
            muteBtn.title = "Unmute audio";

            ws.setMuted(true);
        }
    }
}

function updateTimer(startTime) {
    const newTime = Date.now();
    const diffTime = Math.abs(newTime - startTime);
    const diffSec = Math.floor((diffTime / 1000) % 60); 
    const diffMin = Math.floor(diffTime / (1000 * 60));
    // console.log(diffTime + " milliseconds");
    // console.log(diffDays + " days");
    recTimer.innerHTML = diffMin.toString().padStart(2, 0) + ":" + diffSec.toString().padStart(2, 0);
}

// WIP, collect notes and redirect to results page; maybe add loading screen?
function clickIdentifyMic(event = null) {
    loadScreen.classList.add("show-loading");
    identifyNotes("mic");
}

function clickIdentifyFile(event = null) {
    loadScreen.classList.add("show-loading");
    identifyNotes("file");
}

function identifyNotes(buttonType) {   // buttonType = string
    switch (buttonType) {
        case "mic":
            break;
        case "file":
            break;
        default:
            alert("[BTN_ASSIGN_ERROR] Sorry, something went wrong. Please try another time or use another input method.")
    }

    // window.location.href = "record.html";    // Redirect for now, until I've created a "results" webpage
}

//////// UPLOAD / DRAG AND DROP ////////

// Prevents default action from taking place when dragging & dropping file over browser (open file in new tab)
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Checks whether if drag and drop is supported through creating a random div container
function isAdvancedUpload() {
    const div = document.createElement('div');
    return ((('draggable' in div) || ('ondragstart' in div && 'ondrop' in div))
        && 'FormData' in window
        && 'FileReader' in window);
}

async function uploadFile() {
    // Information about file to be uploaded
    let fileExtension;
    let fileName;
    let file;

    // Related to HTTP request status codes
    let status;

    dropArea.classList.remove("is-success", "is-error")
    dropArea.classList.add("is-uploading");

    // Remove file identify btn listeners
    identifyFileBtn.disabled = true;
    identifyFileBtn.title = "Upload an audio file first.";
    identifyFileBtn.removeEventListener("click", clickIdentifyMic);

    if (droppedFile === null) {
        fileExtension = uploadInput.value.split(".").slice(-1).toString();
        fileName = uploadInput.value.split("\\").slice(-1).toString();
        file = uploadInput.files[0];
    } else {
        fileExtension = droppedFile.name.split(".").slice(-1).toString();
        fileName = droppedFile.name;
        file = droppedFile;
    }

    // First check if file is of the correct format
    if (!["wav", "ogg", "webm", "mp3"].includes(fileExtension)) {
        alert("Please enter a file of one of these extension types: '.wav', '.ogg', '.mp3', or '.webm'.");
        uploadInput.value = null;
        droppedFile = null;
        successFilename.innerText = "";

        // Let error msg appear in drop-box area
        dropArea.classList.remove("is-uploading");
        dropArea.classList.add("is-error");
    } else {
        // Create new form data obj and add file
        prerecFileName = fileName;
        // alert(prerecFileName);
        const data = new FormData();
        data.append("file", file);   // param: name of field entry in formData, actual data, and actual name of file/data

        // Clear excess files in server
        clearFiles();

        try {
            status = await uploadAudio(data);
            console.log("Awaited upload file status: " + status);
        } catch (err) {
            console.error(err);
            status = -1;    // Set status to anything but 200 to purposely show error msg
        }

        // If upload was successful with HTTP response status 200 (OK), then show success msg
        if (status === 200) {
            dropArea.classList.remove("is-uploading");
            dropArea.classList.add("is-success");

            // Add mic identify btn listeners
            identifyFileBtn.disabled = false;
            identifyFileBtn.title = "";

            identifyFileBtn.addEventListener("click", clickIdentifyFile);

            identifyFileBtn.addEventListener("mousedown", () => {
                identifyFileBtn.classList.add("active");
            })

            "mouseup mouseleave".split(" ").forEach((event) => {
                identifyFileBtn.addEventListener(event, () => {
                    identifyFileBtn.classList.remove("active");
                })
            })

            if (window.innerWidth > 575) {
                successFilename.innerText = " " + prerecFileName;
            }

        } else {
            if (status != -1) {
                alert("HTTP " + status + ": There was an error uploading your files. Please try again later or use other input methods." );
            }

            // No matter the reason/error, show error msg if not successful
            dropArea.classList.remove("is-uploading");
            dropArea.classList.add("is-error");
            successFilename.innerText = "";
        }

        // Clear all file-related variables
        uploadInput.value = null;
        droppedFile = null;

        // Enable button for identifying buttons, if disabled, and clear btn label from past results
        // fileFinishBtn.disabled = false;
        // fileNotes = "";
    }
}

async function getFileNotes() {
    let notes = await requestNotes(prerecFileName);
    console.log("Received notes!");

    fileNotes = notes.toString();
}

// Unused WIP, implement later
async function getMicNotes() {
    let notes = await requestNotes(micFileName);
    console.log("Received notes!");

    micNotes = notes.toString();
}

//////// REQUESTS TO BACK-END ////////
function uploadAudio(formData) {
    return new Promise((resolve, reject) => {
        console.log("Uploading audio...");
        fetch("https://chord-guru.vercel.app/saveAudio", { 
            method: "POST",
            body: formData
        })
            .then((response) => {
                console.log("Finished uploading audio!");
                resolve(response.status)
            })
            .catch((err) => {
                console.error(err);
                alert("Sorry, we were not able to successfully create your recording at this time. Please try file input or use another input method.");
                console.log("Upload failed: " + err);

                reject(err);
            });
    })
}

function convertAudio(fileName) {
    return new Promise((resolve, reject) => {
        fetch(`https://chord-guru.vercel.app/convertMicAudio?file=${fileName}`) // add query of filename to url
            .then((response) => {
                // let output = JSON.parse(response);
                let wavFileName = response.text();
                console.log("Converting .webm file to .wav...");

                resolve(wavFileName);
                // return response.json()
            })
            .catch((err) => {
                console.log("Error in converting audio: " + err);
                alert("Error in converting audio: " + err);
                reject(err);
            })
    })
}

function clearFiles() {
    fetch("https://chord-guru.vercel.app/clearFiles", {
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
    let notes = "[]";

    return new Promise((resolve, reject) => {
        fetch(`https://chord-guru.vercel.app/prerecordNotes?file=${fileName}`) // add query of filename to url
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
    note1.addEventListener("animationiteration", () => {
        console.log("run once");
        
        if (!loadClrSwitched) {
            loadScreen.style.setProperty("--colour-1", "#FFFFFF");
            loadScreen.style.setProperty("--colour-2", "#55A6FF");

            loadClrSwitched = true;
            console.log(loadClrSwitched);
        } else {
            loadScreen.style.setProperty("--colour-1", "#55A6FF");
            loadScreen.style.setProperty("--colour-2", "#FFFFFF");

            loadClrSwitched = false;
            console.log(loadClrSwitched);
        }

    })

    // onanimationiteration = () => {
    //     console.log("run")
    // }

    //////// DRAG AND DROP-RELATED CODE ////////
    let detectDrop = isAdvancedUpload();

    // No matter w/ or w/out drag and drop, any change to input field via clicking text uploads file to server
    uploadInput.addEventListener("change", () => {
        rmMicWrapper();
        uploadFile();
    })

    successInput.addEventListener("click", () => {
        uploadInput.click();
    })

    errorInput.addEventListener("click", () => {
        uploadInput.click();
    })

    // If drag and drop is supported:
    if (detectDrop) {
        // if (window.innerWidth >= 576) {     // a lot of phones actually support drag and drop, so i'm removing this restriction
        dropArea.classList.add("support-dragdrop");
        // }

        window.addEventListener("resize", () => {
            if (window.innerWidth >= 576) {
                successFilename.innerText = " " + prerecFileName;
            } else {
                successFilename.innerText = "";
            }
        })

        // Prevents default browser behaviour upon firing a drag-related event
        "dragenter dragover dragleave drop dragend".split(" ").forEach((event) => {
            dropArea.addEventListener(event, preventDefaults, false)
        })

        // When entering dragging area, visually change area appearance IF NOT IN UPLOADING STATE
        "dragenter dragover".split(" ").forEach(event => {
            dropArea.addEventListener(event, () => {
                if (!dropArea.classList.contains("is-uploading")) {
                    dropArea.classList.add("is-dragover");
                }
            }, false)
        })

        // Revert to original drag-drop-supported area appearance upon leaving dragged area or stopping the dragging
        "dragleave dragend drop".split(" ").forEach(event => {
            dropArea.addEventListener(event, () => {
                dropArea.classList.remove("is-dragover");
            }, false)
        })

        // When file is finally dropped, get the file from associated fileList obj. and upload it
        dropArea.addEventListener("drop", (event) => {
            if (!dropArea.classList.contains("is-uploading")) {
                rmMicWrapper();

                droppedFile = event.dataTransfer.files[0];
                uploadFile();
            }
        })
    }

    // fileFinishBtn.addEventListener("click", () => {
    //     if (prerecFileName != "") {
    //         // console.log("test");
    //         getFileNotes();
    //     } else {
    //         // console.log("fail test");
    //     }
    // })

    //////// MIC-RELATED CODE ////////
    // Check if mediaRecorder is supported in the current browser
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // alert("test1");
        console.log("getUserMedia supported.");
        let getRec = null;

        recBtn.addEventListener("click", async () => {
            if (getRec === null) {
                // Disables record button for a second to prevent errors from creating empty audio blobs (when clicking button too fast twice)
                recBtn.disabled = true;
                getRec = await requestRecorder();
                // alert(getRec)

                if (getRec != [-1, -1]) {
                    const rec = getRec[0];
                    const stream = getRec[1];
    
                    clickRecord(rec, stream);
                    record(rec);

                    // After about 0.75 seconds of recording, allows access to record button
                    setTimeout(() => {
                        recBtn.disabled = false;
                    }, 700);

                } else {
                    getRec = null;
                }

                // Reenables button after a second

            } else {
                const rec = getRec[0];
                const stream = getRec[1];

                // alert(getRec)
                clickRecord(rec, stream);

                getRec = null;
            }




        });



        // navigator.mediaDevices.getUserMedia({
        //     // constraints - only audio needed for this app
        //     audio: true
        // })
        //     // Success callback
        //     .then((stream) => {
        //         record(stream);
        //     })

        //     // Error callback
        //     .catch(err => {
        //         console.error(`The following getUserMedia error occurred: ${err}`);
        //     })
    } else {
        console.log("getUserMedia not supported on your browser!");

        recBtn.addEventListener("click", () => {
            alert("Sorry, your device does not support recording with a microphone. Try inputting a file or using our other input options.")
            // alert(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            // alert(true && navigator.mediaDevices.getUserMedia);
            
//             let test = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
//             let test2 = true
          
//             alert(test2);
        })
    }
}

main();

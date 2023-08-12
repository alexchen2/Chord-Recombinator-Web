const accSwitch = document.querySelector(".switch");
const pianoKeys = [...document.querySelectorAll(".piano-keys .key")];
const playBtn = document.querySelector("#btn-play");
const fastPlayBtn = document.querySelector("#btn-fast-play");
const muteBtn = document.querySelector("#btn-mute");
const identifyBtn = document.querySelector("#btn-identify");

let keyAudio = [];  // Array of objects containing audio files
let keyClass;
let playBtnDown = false;
let fastPlayBtnDown = false;
let muteBtnDown = false;

const playSpeed = 700;
const fastPlaySpeed = 1;
const ENHARMONICS = [
    ["D♭", "C♯"],
    ["E♭", "D♯"],
    ["G♭", "F♯"],
    ["A♭", "G♯"],
    ["B♭", "A♯"]
]

// Fill up keyAudio with objects for each note, containing HTMLAudioElements for every one
for (key of pianoKeys) {
    let filename = `../assets/vendor/audio/piano/Piano.${key.dataset.note}.mp3`

    keyAudio.push({
        note: key.dataset.note,
        audio: new Audio(filename),
        keyDown: false
    });
}

// Function for adding css classes to switch when toggled, changing appearance & accidentals on keys
function switchToggle(event = null) {
    // Filter all black keys from all piano keys into a separate array
    let blackKeys = pianoKeys.filter((key) => key.classList.contains("black"))

    if (this.classList.contains("active")) {
        this.classList.remove("active");
        this.querySelector("input[type=checkbox]").checked = false;

        // For each black key, change the inner text from sharp to its flat enharmonic equivalent
        for (const [index, key] of blackKeys.entries()) {        // Note to self, .entries <=> enumerate in python
            if (key.classList.contains("black")) {
                key.querySelector("div").querySelector("span").innerText = ENHARMONICS[index % 5][0];
            }
        }

    } else {
        this.classList.add("active");
        this.querySelector("input[type=checkbox]").checked = true;

        // For each black key, change the inner text from flat to its sharp enharmonic equivalent
        for (const [index, key] of blackKeys.entries()) {
            if (key.classList.contains("black")) {
                key.querySelector("div").querySelector("span").innerText = ENHARMONICS[index % 5][1];
            }
        }
    }
}

function clickPlay(event = null) {
    if (!playBtnDown) {
        if (fastPlayBtnDown) {
            fastPlayBtnDown = false;
            fastPlayBtn.classList.remove("active");
        }
        playNotes(playSpeed);
    }
}

function clickFastPlay(event = null) {
    if (!fastPlayBtnDown) {
        if (playBtnDown) {
            playBtnDown = false;
            playBtn.classList.remove("active");
        }
        playNotes(fastPlaySpeed);
    }
}

function playNotes(speed) {
    let notesIndex = [];      // Stores index of notes in keyAudio to play at normal speed

    // Temporarily disable toggling of play / fast-play buttons while sounds are playing 
    if (speed === playSpeed) {
        playBtnDown = true;
        playBtn.classList.add("active")
    } else if (speed === fastPlaySpeed) {
        fastPlayBtnDown = true;
        fastPlayBtn.classList.add("active")
    }

    for (key of keyAudio) {
        if (key.keyDown) {
            notesIndex.push(keyAudio.indexOf(key));
        }
    }

    // Disable all playing notes temporarily
    for (index of notesIndex) {
        // Assign this value to each pressed key HTML element
        keyAudio[index].audio.pause();
        keyAudio[index].audio.currentTime = 0;

        if (pianoKeys[index].classList.contains("white-down")) {
            pianoKeys[index].querySelector("div").style.height = "97%"
            pianoKeys[index].classList.remove("white-down");
        } else if (pianoKeys[index].classList.contains("black-down")) {
            pianoKeys[index].style.height = "129px";
            pianoKeys[index].classList.remove("black-down");
        }
    }

    setTimeout(() => {
        console.log(notesIndex)
        return playNotesAux(notesIndex, speed)
    }, 1000);
}

function playNotesAux(notesIndex, speed) {
    if (speed === playSpeed && !fastPlayBtnDown) {
        if (notesIndex.length > 0) {
            keyClick.call(pianoKeys[notesIndex[0]], null, true);
            setTimeout(() => {
                return playNotesAux(notesIndex.slice(1), speed);
            }, speed);
        } else {       // Reenable toggling of play / fast-play buttons
            playBtnDown = false;
            playBtn.classList.remove("active")
        }
    } else if (speed == fastPlaySpeed) {
        if (notesIndex.length > 0 && !playBtnDown) {
            keyClick.call(pianoKeys[notesIndex[0]], null, true);
            setTimeout(() => {
                return playNotesAux(notesIndex.slice(1), speed);
            }, speed);
        } else {       // Reenable toggling of play / fast-play buttons
            fastPlayBtnDown = false;
            fastPlayBtn.classList.remove("active")
        }
    }
}

// Function in charge of visually changing keys when pressed & playing audio
function keyClick(event = null, clickPlayBtn = false) {
    let keyClass = this.classList;

    // Add pressed-down classes to respective keys upon clicking/touching
    if (keyClass.contains("black")) {
        keyClass.toggle("black-down");

        // Visually change black key to be lowered & give impression of being pressed down
        if (this.style.height != "135px") {
            // Set to key down height
            this.style.height = "135px";
        } else {
            // Set to key up height
            this.style.height = "129px";
        }

    } else if (keyClass.contains("white")) {
        keyClass.toggle("white-down");

        // Visually change white key to cover bottom "edge" & give impression of being pressed down
        if (this.querySelector("div").style.height != "100%") {
            // Set to key down height
            this.querySelector("div").style.height = "100%";
        } else {
            // Set to key up height
            this.querySelector("div").style.height = "97%";
        }
    }

    // Play or stop audio based on click
    let index = keyAudio.findIndex((obj) => obj.note === this.dataset.note)
    // console.log(`${this.dataset.note}, ${index}`)

    // If audio is playing, or if audio is paused during middle of clip, then pause if necessary and reset back to beg. of clip
    if (!keyAudio[index].audio.paused || keyAudio[index].audio.currentTime) {
        keyAudio[index].audio.pause();
        keyAudio[index].audio.currentTime = 0;

        if (!clickPlayBtn) {
            keyAudio[index].keyDown = false;
        }

    } else {   // Otherwise, audio must be paused at beg. of clip; therefore, just plays clip
        keyAudio[index].audio.play();

        if (!clickPlayBtn) {
            keyAudio[index].keyDown = true;
        }
    }

    console.log(keyAudio[index].keyDown);
}

function clickMute(event = null) {
    // If not muted, then loop through every audio element in keyAudio and mute
    if (!muteBtnDown) {
        for (key of keyAudio) {
            key.audio.muted = true;
        }

        muteBtnDown = true;
        muteBtn.querySelector("img").src = "../assets/vendor/img/btn/speaker-muted-1.png"
        muteBtn.classList.add("active")
    } else {    // Unmute everything else otherwise
        for (key of keyAudio) {
            key.audio.muted = false;
        }
        muteBtnDown = false;
        muteBtn.querySelector("img").src = "../assets/vendor/img/btn/speaker-1.png"
        muteBtn.classList.remove("active")
    }
}

function clickIdentify(event = null) {
    let downKeys = keyAudio.filter((key) => key.keyDown);

    if (downKeys.length <= 2) {
        alert("Please select three or more notes on the keyboard before attempting to identify your chord.");
    } else {
        window.location.href = "keyboard.html";    // Redirect for now, until I've created a "results" webpage
    }
    
}

function main() {
    // iOS Switch Code
    accSwitch.addEventListener("click", switchToggle);

    // Piano Code
    playBtn.addEventListener("click", clickPlay);
    fastPlayBtn.addEventListener("click", clickFastPlay);
    muteBtn.addEventListener("click", clickMute);
    identifyBtn.addEventListener("click", clickIdentify);

    for (key of pianoKeys) {
        key.addEventListener("click", keyClick);
        // Strangely, touchcancel is the only event that actually functions as I intended the mobile interface to...
        key.addEventListener("touchcancel", keyClick);

        // These don't work; they act as a short down-and-up press than a toggle
        // key.addEventListener("touchstart", keyClick);
        // key.addEventListener("touchend", keyClick);
    }
}

main();
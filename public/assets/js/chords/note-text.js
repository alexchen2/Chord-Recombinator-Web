// Imports
import { Flow } from "https://cdn.jsdelivr.net/npm/vexflow@4.2.3/build/esm/entry/vexflow.js";

//////// CONSTANTS & VARIABLES ////////
const { Renderer, Stave, StaveNote, Accidental, Formatter, Voice, GhostNote } = Flow;    // Uses vexflow library to render music note staves

// Text input-related elements
const textDisplay = document.querySelector(".text-display");
const textPnlAdd = document.getElementById("text-panel-add");

// Staff input-related elements
const staffDisplay = document.getElementById("staff-display");
const staffAreas = document.querySelectorAll("#staff-display .staff-area");
const staffSVG = document.getElementById("staff-svg");

// Buttons
const btnAdd = document.getElementById("btn-add");
const btnRm = document.getElementById("btn-delete");
const btnRaise = document.getElementById("btn-raise");
const btnLower = document.getElementById("btn-lower");
const btnSharp = document.getElementById("btn-sharp");
const btnFlat = document.getElementById("btn-flat");

const btnIdentifyStaff = document.getElementById("staff-btn-identify");
const btnIdentifyText = document.getElementById("text-btn-identify");

// Loading screen elements
const loadScreen = document.querySelector(".loading-screen");

// Staff notes info
let notesStaff = [];
let noteHovered = "";
let noteSelected = "";

// Note colors
const DEFAULT_COLOUR = "black";
const HOVER_COLOUR_ADD = "#0388FF";
const HOVER_COLOUR_RM = "rgb(139, 8, 8)";
const HOVER_COLOUR_RM_BG = "rgb(203, 61, 61)"; // "rgb(248, 144, 144)";
const SELECT_COLOUR = "#0065BF";

// Button modes
let addNoteMode = false;
let rmNoteMode = false;

// 
const ENHARMONICS = [
    ["Db", "C#"],
    ["Eb", "D#"],
    ["Gb", "F#"],
    ["Ab", "G#"],
    ["Bb", "A#"]
]
const NOTE_ORDER_STAFF = [
    "c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4",
    "c/5", "d/5", "e/5", "f/5", "g/5", "a/5", "b/5"
];
const NOTE_ORDER_TEXT = [
    "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"
]

//////// FUNCTIONS ////////
function setStaff(notes, indexHover = -1, indexSelect = -1) {
    let staffNotes;
    let staffWidth = staffSVG.clientWidth - 40;                 // Subtract by a certain amt of px or so to prevent table content overflow
    // let accidentalInfo = []          // 2d array listing any accidentals in each note and what index in chord.note they appear at
    let context, stave, voice;

    // (When you spend ~1.5 hours reading through documentation and implementing addition of accidentals, then realize that there's a method that
    // does all of your work in just a single command... sadge)

    // Stores info on accidentals for each note in given notes array
    // for (let index = 0; index < notes.length; index++) {
    //     // alert(notes[index].slice(1))

    //     // Check note for accidental; if so, add note info to accidentalInfo array
    //     if (["#", "b", "x", "bb"].includes(notes[index][1])) {   // notes[index].slice(1)
    //         if (notes[index][1] === "x") {
    //             accidentalInfo.push(["##", index]);
    //         } else {
    //             accidentalInfo.push([notes[index][1], index]);
    //         }
    //     } else if (notes.slice(0, index).includes(notes[index])) {
    //         if (["#", "b", "x", "bb"].includes(notes[index][1])) {
    //             continue;
    //         }
    //     } else if (
    //         ["#", "b", "x", "bb"].map((acc) => { notes[index][0] + acc + notes[index].slice(1) })   // Creates note with all possible accidentals
    //             .some((note) => notes.slice(0, index).includes(note))                                 // Creates bool from checking if accidental notes with same base note were added before
    //     ) {
    //         accidentalInfo.push(["n", index]);
    //     }

    // }

    if (notes.length === 0) {
        staffNotes = [
            new GhostNote({ keys: ["c/5"], duration: "w", align_center: true })
        ]
    } else {
        staffNotes = [
            new StaveNote({ keys: notes, duration: "w", align_center: true })  // ["c/4", "e/4", "g/4"]
        ]
    }

    if (indexHover != -1) {
        switch (true) {
            case addNoteMode:
                staffNotes[0].setKeyStyle(indexHover, { fillStyle: HOVER_COLOUR_ADD, strokeStyle: HOVER_COLOUR_ADD })
                break;
            case rmNoteMode:
                staffNotes[0].setKeyStyle(indexHover, { fillStyle: HOVER_COLOUR_RM, strokeStyle: HOVER_COLOUR_RM })
                break;
            default:
                staffNotes[0].setKeyStyle(indexHover, { fillStyle: HOVER_COLOUR_ADD, strokeStyle: HOVER_COLOUR_ADD })
        }
    }

    if (indexSelect != -1) {
        staffNotes[0].setKeyStyle(indexSelect, { fillStyle: SELECT_COLOUR, strokeStyle: SELECT_COLOUR })
    }

    // Actually adds accidentals to notes from accidentals info array
    // for (let [accidental, index] of accidentalInfo) {
    //     // alert(accidental, index)
    //     staffNotes[0].addModifier(new Accidental(accidental), index);
    // }

    // Create an SVG renderer and attach it to the DIV element with id format of "staff-#"
    // const div = document.getElementById('staff-1');
    let renderer = new Renderer(staffSVG, Renderer.Backends.SVG);

    // context.setViewBox(-15, 20, 300 / 2, 50); //size

    if (screen.width >= 465) {
        // Configure the rendering context
        renderer.resize(staffWidth, 250);
        context = renderer.getContext();
        context.setFont('Arial', 10);
        context.setFillStyle(DEFAULT_COLOUR);
        context.setStrokeStyle(DEFAULT_COLOUR);

        context.scale(2.1, 2.1);
        // Create a stave at position (40, -10) and width of 80 px less than current unknown table width
        stave = new Stave(20, -10, (staffWidth - (40 * 2)) / 2, { fill_style: DEFAULT_COLOUR }); //(staffWidth / (staffWidthMult * (2.5))), { fill_style: DEFAULT_COLOUR });

        // Add a clef and time signature
        stave.addClef('treble');

        // Create a voice in 4/4 and add above notes
        voice = new Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables(staffNotes);

        // Automatically apply accidentals to all notes in chord
        Accidental.applyAccidentals([voice], `C`);

        // Format and justify the notes to 400 pixels.
        if (screen.width < 768) {
            new Formatter().joinVoices([voice]).format([voice], ((staffWidth - (40 * 2)) - (staffWidth - (40 * 2)) ** 0.8) / 3) // (staffWidth / (staffWidthMult * (2.5))) - ((staffWidth / (staffWidthMult * (2.5))) * 0.5));
        } else {
            new Formatter().joinVoices([voice]).format([voice], ((staffWidth - (40 * 2)) - (staffWidth - (40 * 2)) ** 0.8) / 2) // (staffWidth / (staffWidthMult * (2.5))) - ((staffWidth / (staffWidthMult * (2.5))) * 0.5));
        }


    } else {
        let notePlacement, svgWidth

        if (screen.width < 340) {
            svgWidth = (140 - (40 * 1.5));
            notePlacement = ((160 - (40 * 2)) - (160 - (40 * 2)) ** 2) / 1.1;
        } else if (screen.width < 395) {
            staffWidth += 20;
            svgWidth = (staffWidth - (40 * 2.1));
            notePlacement = ((staffWidth - (40 * 2)) - (staffWidth - (40 * 2)) ** 0.8) / 1.1;
        } else {
            staffWidth += 20;
            svgWidth = (staffWidth - (49 * 2.1));
            notePlacement = ((staffWidth - (49 * 2)) - (staffWidth - (49 * 2)) ** 0.8) / 1.1;
        }

        renderer.resize(staffWidth, 250);
        context = renderer.getContext();
        context.setFont('Arial', 10);
        context.setFillStyle(DEFAULT_COLOUR);
        context.setStrokeStyle(DEFAULT_COLOUR);

        context.scale(1.5, 1.5);

        // Create a stave at position (40, -10) and width of 80 px less than current unknown table width
        stave = new Stave(10, -10, svgWidth, { fill_style: DEFAULT_COLOUR }); //(staffWidth / (staffWidthMult * (2.5))), { fill_style: DEFAULT_COLOUR });

        // Add a clef and time signature
        stave.addClef('treble');

        // Create a voice in 4/4 and add above notes
        voice = new Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables(staffNotes);

        // Automatically apply accidentals to all notes in chord
        Accidental.applyAccidentals([voice], `C`);

        // Format and justify the notes to 400 pixels.
        new Formatter().joinVoices([voice]).format([voice], notePlacement) // (staffWidth / (staffWidthMult * (2.5))) - ((staffWidth / (staffWidthMult * (2.5))) * 0.5));
    }

    // Render voice
    voice.draw(context, stave);

    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();
}

function btnEvents() {
    btnAdd.addEventListener("click", () => {
        btnAdd.classList.toggle("btn-down");
        addNoteMode = !addNoteMode;

        if (!addNoteMode) {
            btnRaise.disabled = false;
            btnLower.disabled = false;
            btnSharp.disabled = false;
            btnFlat.disabled = false;
        } else {
            btnRaise.disabled = true;
            btnLower.disabled = true;
            btnSharp.disabled = true;
            btnFlat.disabled = true;
        }

        btnRm.classList.remove("btn-down");
        rmNoteMode = false;


        notesStaff = notesStaff.filter((note) => { return note != noteHovered });
        noteHovered = ""
        // noteSelected = "";
        staffSVG.innerHTML = "";
        setStaff(notesStaff, notesStaff.indexOf(noteHovered), notesStaff.indexOf(noteSelected))
    })

    btnRm.addEventListener("click", () => {
        btnRm.classList.toggle("btn-down");
        rmNoteMode = !rmNoteMode;

        if (!rmNoteMode) {
            btnRaise.disabled = false;
            btnLower.disabled = false;
            btnSharp.disabled = false;
            btnFlat.disabled = false;
        } else {
            btnRaise.disabled = true;
            btnLower.disabled = true;
            btnSharp.disabled = true;
            btnFlat.disabled = true;
        }

        btnAdd.classList.remove("btn-down");
        addNoteMode = false;

        notesStaff = notesStaff.filter((note) => { return note != noteHovered });
        noteHovered = ""
        noteSelected = "";
        staffSVG.innerHTML = "";
        setStaff(notesStaff)
    })

    btnRaise.addEventListener("click", () => {
        if (!(addNoteMode && rmNoteMode) && noteSelected != "") {
            let tempNote;

            if (noteSelected[0] === "b") {
                tempNote = "b" + noteSelected.replaceAll("#", "").replaceAll("b", "");
            } else {
                tempNote = noteSelected.replaceAll("#", "").replaceAll("b", "");
            }

            // If noteSelected without accidentals is not the highest possible placeable note, then move it up one note and rerender staff
            if (tempNote != NOTE_ORDER_STAFF.slice(-1)[0]) {
                tempNote = NOTE_ORDER_STAFF[NOTE_ORDER_STAFF.indexOf(tempNote) + 1];
                notesStaff[notesStaff.indexOf(noteSelected)] = tempNote;

                noteSelected = tempNote;
                staffSVG.innerHTML = "";
                setStaff(notesStaff, notesStaff.indexOf(noteHovered), notesStaff.indexOf(noteSelected))
            }

        }
    })

    btnLower.addEventListener("click", () => {
        if (!(addNoteMode && rmNoteMode) && noteSelected != "") {
            let tempNote;

            if (noteSelected[0] === "b") {
                tempNote = "b" + noteSelected.replaceAll("#", "").replaceAll("b", "");
            } else {
                tempNote = noteSelected.replaceAll("#", "").replaceAll("b", "");
            }

            // If noteSelected without accidentals is not the lowest possible placeable note, then move it down one note and rerender staff
            if (tempNote != NOTE_ORDER_STAFF[0]) {
                tempNote = NOTE_ORDER_STAFF[NOTE_ORDER_STAFF.indexOf(tempNote) - 1];
                notesStaff[notesStaff.indexOf(noteSelected)] = tempNote;

                noteSelected = tempNote;
                staffSVG.innerHTML = "";
                setStaff(notesStaff, notesStaff.indexOf(noteHovered), notesStaff.indexOf(noteSelected));
            }
        }
    })

    btnSharp.addEventListener("click", () => {
        if (!(addNoteMode && rmNoteMode) && noteSelected != "") {
            let tempNote = noteSelected;

            if (noteSelected[1] === "b") {
                tempNote = noteSelected[0] + noteSelected.slice(2);
            } else if (noteSelected[1] === "/") {
                tempNote = noteSelected[0] + "#" + noteSelected.slice(1);
            }

            notesStaff[notesStaff.indexOf(noteSelected)] = tempNote;
            noteSelected = tempNote;

            staffSVG.innerHTML = "";
            setStaff(notesStaff, notesStaff.indexOf(noteHovered), notesStaff.indexOf(noteSelected));
        }
    })

    btnFlat.addEventListener("click", () => {
        if (!(addNoteMode && rmNoteMode) && noteSelected != "") {
            let tempNote = noteSelected;

            if (noteSelected[1] === "#") {
                tempNote = noteSelected[0] + noteSelected.slice(2);
            } else if (noteSelected[1] === "/") {
                tempNote = noteSelected[0] + "b" + noteSelected.slice(1);
            }

            notesStaff[notesStaff.indexOf(noteSelected)] = tempNote;
            noteSelected = tempNote;

            staffSVG.innerHTML = "";
            setStaff(notesStaff, notesStaff.indexOf(noteHovered), notesStaff.indexOf(noteSelected));
        }
    })

    btnIdentifyStaff.addEventListener("click", () => {
        clickIdentify(notesStaff);
    })
  
    btnIdentifyStaff.addEventListener("pointerdown", () => {
        btnIdentifyStaff.classList.add("btn-down");
    })
  
    for (let event of ["pointerup", "pointerleave", "pointerout"]) {
        btnIdentifyStaff.addEventListener(event, () => {
            btnIdentifyStaff.classList.remove("btn-down");
        })
      
        btnIdentifyText.addEventListener(event, () => {
            btnIdentifyText.classList.remove("btn-down");
        })      
    }
  
    btnIdentifyText.addEventListener("pointerdown", () => {
        btnIdentifyText.classList.add("btn-down");
    })  

    btnIdentifyText.addEventListener("click", () => {
        let panelElem = textDisplay.querySelectorAll(".text-panel .text-note");
        let notesText = [];

        // Read all note text in every single panel
        panelElem.forEach((elem) => {
            notesText.push(elem.innerText);
        })

        // Get rid of duplicate panel notes
        notesText = [...new Set(notesText)];

        clickIdentify(notesText, false);
    })
}

function clickIdentify(notes, isStaff = true) {
    let noteQuery;

    if (isStaff) {
        // Remove pitch numbers from notes array and get rid of duplicate notes
        notes = notes.map((note) => note[0].toUpperCase() + note.slice(1, -2));    // e.g. "ab/4" => "Ab"; "g/5" => "G" 
        notes = [...new Set(notes)];
    }

    // If accidentals switch is on, then change all flat notes to sharps
    notes = notes.map((note) => {
        // If note contains a sharp, then replace it with string query equivalent symbol (%23) for proper parsing
        if (note.slice(-1) === "#") {
            return (note.slice(0, -1) + "%23");
        } else {
            return (note);
        }
    })

    // Begin showing loading screen
    loadScreen.classList.add("show-loading");

    setTimeout(() => {
        noteQuery = notes.toString().replaceAll(",", "_");
        loadScreen.classList.remove("show-loading");        // Remove, in case user alt-left arrows and goes back to this page
        window.location.assign(`/getResults?input=text&notes=${noteQuery}`)
        // window.location.href = "keyboard.html";    // Redirect for now, until I've created a "results" webpage
    }, 3500)
}

function clickAddPnl(note = "c") {
    let pnlHTML = `<button class="lower-note">
        <img src="../assets/vendor/img/btn/Minus-expand-2.png" alt="">
    </button>
    <span class="text-note">${note.toUpperCase()}</span>
    <button class="raise-note">
        <img src="../assets/vendor/img/btn/Plus-expand-2.png" alt="">
    </button>
    <div class="text-panel-delete">
        <img src="../assets/vendor/img/btn/garbage-panel.png" alt="">
        <span>Delete note...</span>
    </div>
    `

    let newPnl = document.createElement("div");

    if (note.slice(1).includes("#")) {
        for (noteSet of ENHARMONICS) {
            // Finds corresponding enharmonic and switches to sharp mode (%23 being sharp symbol for url query)
            if (noteSet.includes(note)) {
                newPnl.classList.add("text-panel", `panel-${noteSet[0]}`);
                break;
            }
        }
    } else {
        newPnl.classList.add("text-panel", `panel-${note}`);
    }

    newPnl.innerHTML = pnlHTML;

    let lowerPnl = newPnl.querySelector(".lower-note");
    let raisePnl = newPnl.querySelector(".raise-note");
    let deletePnl = newPnl.querySelector(".text-panel-delete");
    let pnlNote = newPnl.querySelector(".text-note");

    // Click minus button to lower pitch
    lowerPnl.addEventListener("click", () => {
        let prevNote = pnlNote.innerText;

        if (prevNote.slice(1).includes("#")) {
            for (let noteSet of ENHARMONICS) {
                // Finds corresponding enharmonic and switches to sharp mode (%23 being sharp symbol for url query)
                if (noteSet.includes(prevNote)) {
                    prevNote = noteSet[0];
                    break;
                }
            }
        }

        if (prevNote != NOTE_ORDER_TEXT[0]) {
            newPnl.classList.remove(`panel-${prevNote.toLowerCase()}`);
            prevNote = NOTE_ORDER_TEXT[NOTE_ORDER_TEXT.indexOf(prevNote) - 1];
            newPnl.classList.add(`panel-${prevNote.toLowerCase()}`);
            pnlNote.innerText = prevNote;
        }

        checkPnlNotes()
    })

    raisePnl.addEventListener("click", () => {
        let prevNote = pnlNote.innerText;

        if (prevNote.slice(1).includes("#")) {
            for (let noteSet of ENHARMONICS) {
                // Finds corresponding enharmonic and switches to sharp mode (%23 being sharp symbol for url query)
                if (noteSet.includes(prevNote)) {
                    prevNote = noteSet[0];
                    break;
                }
            }
        }

        if (prevNote != NOTE_ORDER_TEXT.slice(-1)[0]) {
            newPnl.classList.remove(`panel-${prevNote.toLowerCase()}`);

            if (NOTE_ORDER_TEXT[NOTE_ORDER_TEXT.indexOf(prevNote) + 1].slice(1).includes("b")) {
                for (let noteSet of ENHARMONICS) {
                    if (noteSet.includes(NOTE_ORDER_TEXT[NOTE_ORDER_TEXT.indexOf(prevNote) + 1])) {
                        pnlNote.innerText = noteSet[1];
                        break;
                    }
                }

                prevNote = NOTE_ORDER_TEXT[NOTE_ORDER_TEXT.indexOf(prevNote) + 1];
                newPnl.classList.add(`panel-${prevNote.toLowerCase()}`);
            } else {
                prevNote = NOTE_ORDER_TEXT[NOTE_ORDER_TEXT.indexOf(prevNote) + 1];
                newPnl.classList.add(`panel-${prevNote.toLowerCase()}`);
                pnlNote.innerText = prevNote;
            }
        }

        checkPnlNotes()

    })

    // Click delete button on panel popup to delete the panel
    deletePnl.addEventListener("click", () => {
        if (textDisplay.childElementCount > 1) {
            textDisplay.removeChild(newPnl);
        } else {
            alert("There is only one note panel left; you cannot delete the only note!")
        }

        checkPnlNotes();
    })

    textDisplay.appendChild(newPnl);
    checkPnlNotes();
}

// Used to check if there are enough different text panel notes to form a chord; if so, then enables identify button for text
function checkPnlNotes() {
    let panelElem = textDisplay.querySelectorAll(".text-panel .text-note");
    let notesText = [];

    // Read all note text in every single panel
    panelElem.forEach((elem) => {
        notesText.push(elem.innerText);
    })

    // Get rid of duplicate panel notes
    notesText = [...new Set(notesText)];

    if (notesText.length >= 3) {
        btnIdentifyText.disabled = false;
        btnIdentifyText.title = "";
    } else {
        btnIdentifyText.disabled = true;
        btnIdentifyText.title = "Create at least three different note panels above first.";
    }

}

function main() {
    //////// TEXT-RELATED CODE ////////
    clickAddPnl();
    clickAddPnl("e");
    clickAddPnl("g");

    textPnlAdd.addEventListener("click", () => {
        if (textDisplay.childElementCount < 12) {
            clickAddPnl()
        }
    });

    //////// STAFF-RELATED CODE ////////
    setStaff(notesStaff);
    btnEvents();

    staffDisplay.addEventListener("touchmove", function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
    })

    staffDisplay.addEventListener("mouseleave", function (evt) {
        if ((noteHovered != noteSelected && notesStaff.slice(-1)[0] === noteHovered)) {
            notesStaff = notesStaff.filter((note) => { return note != noteHovered });
        }

        noteHovered = "";

        staffSVG.innerHTML = "";
        setStaff(notesStaff, -1, notesStaff.indexOf(noteSelected));
    })

    staffAreas.forEach((area) => {
        ["pointerdown", "pointermove"].forEach((event) => {
            area.addEventListener(event, function (evt) {
                // Checks to see which staff note mode is active:
                switch (true) {
                    case addNoteMode:
                        // If hovered note does NOT match selected or previous hovered note, then remove selected note from staff
                        if (!([noteHovered, noteSelected].includes(this.dataset.note)) && !(notesStaff.includes(this.dataset.note))) {
                            notesStaff = notesStaff.filter((note) => { return note != noteHovered });

                            notesStaff.push(this.dataset.note);
                            noteHovered = this.dataset.note;
                            // alert("Note Selected:" + noteHovered)
                            // alert(notesStaff.indexOf(noteHovered))
                            // alert("Notes: " + notesStaff)

                            // Otherwise, if hovered note matches with any other previously inputted chord note, remove previous hovered note
                        } else if (notesStaff.includes(this.dataset.note) && this.dataset.note != noteHovered) {
                            notesStaff = notesStaff.filter((note) => { return note != noteHovered });
                            noteHovered = "";
                        }

                        console.log(notesStaff)
                        console.log(notesStaff.indexOf(noteHovered), notesStaff.indexOf(noteSelected))

                        staffSVG.innerHTML = "";
                        setStaff(notesStaff, notesStaff.indexOf(noteHovered), notesStaff.indexOf(noteSelected))

                        break;

                    case rmNoteMode:
                        // Check if hovered/dragged area has a note with an accidental; if so, prioritize selecting those notes (sharps -> flats -> no accidentals)
                        switch (true) {
                            case notesStaff.includes(this.dataset.note[0] + "#" + this.dataset.note.slice(1)):
                                noteHovered = this.dataset.note[0] + "#" + this.dataset.note.slice(1);
                                break;
                            case notesStaff.includes(this.dataset.note[0] + "b" + this.dataset.note.slice(1)):
                                noteHovered = this.dataset.note[0] + "b" + this.dataset.note.slice(1);
                                break;
                            default:
                                noteHovered = this.dataset.note;   // Set hovered note to current hovered area's assigned note data
                        }

                        area.style.backgroundColor = HOVER_COLOUR_RM_BG;

                        staffSVG.innerHTML = "";
                        setStaff(notesStaff, notesStaff.indexOf(noteHovered));

                        break;

                    default:
                        // Check if hovered/dragged area has a note with an accidental; if so, prioritize selecting those notes (sharps -> flats -> no accidentals)
                        switch (true) {
                            case notesStaff.includes(this.dataset.note[0] + "#" + this.dataset.note.slice(1)):
                                noteHovered = this.dataset.note[0] + "#" + this.dataset.note.slice(1);
                                break;
                            case notesStaff.includes(this.dataset.note[0] + "b" + this.dataset.note.slice(1)):
                                noteHovered = this.dataset.note[0] + "b" + this.dataset.note.slice(1);
                                break;
                            default:
                                noteHovered = this.dataset.note;   // Set hovered note to current hovered area's assigned note data
                        }

                        area.style.backgroundColor = HOVER_COLOUR_ADD;

                        staffSVG.innerHTML = "";
                        setStaff(notesStaff, notesStaff.indexOf(noteHovered), notesStaff.indexOf(noteSelected))
                }

                // Allows for detecting hover across multiple different area elements 
                if (event === "pointerdown") {
                    if (evt.target.hasPointerCapture(evt.pointerId)) {
                        evt.target.releasePointerCapture(evt.pointerId);
                    }
                }
            })
        });

        area.addEventListener("pointerleave", function (evt) {
            if (!addNoteMode) {
                area.style.backgroundColor = "transparent";
            }
        })

        area.addEventListener("pointerup", function (evt) {
            // Checks to see which mode is active:
            switch (true) {
                case addNoteMode:
                    // Mark hovered note into selected note
                    noteHovered = "";
                    noteSelected = this.dataset.note;
                    // alert("New selected note: " + noteSelected)

                    // At this point, selected note should already be in notesStaff, but if not, then add it anyways
                    if (!notesStaff.includes(noteSelected)) {
                        notesStaff.push(noteSelected)
                    }

                    // Render selected note onto staff
                    staffSVG.innerHTML = "";
                    setStaff(notesStaff, -1, notesStaff.indexOf(noteSelected))

                    break;
                case rmNoteMode:
                    area.style.backgroundColor = "transparent";

                    notesStaff = notesStaff.filter((note) => { return note != noteHovered });
                    noteHovered = "";

                    staffSVG.innerHTML = "";
                    setStaff(notesStaff)

                    break;

                default:
                    area.style.backgroundColor = "transparent";

                    if (notesStaff.includes(noteHovered)) {
                        noteSelected = noteHovered;
                    } else {
                        noteSelected = "";
                    }

                    noteHovered = "";
                    staffSVG.innerHTML = "";
                    setStaff(notesStaff, -1, notesStaff.indexOf(noteSelected))

                    break;
            }

            if (notesStaff.length >= 3) {
                btnIdentifyStaff.disabled = false;
                btnIdentifyStaff.title = "";
            } else {
                btnIdentifyStaff.disabled = true;
                btnIdentifyStaff.title = "Select at least three notes on the staff first.";
            }
        })
    })

    // If window is resized, then clear staff lines svg and rerender image from createStaffUnknown()
    window.addEventListener("resize", () => {
        staffSVG.innerHTML = "";

        // Note to self, indexOf returns -1 if not found, so no hover or selected notes will be rendered if none are registered in variables
        setStaff(notesStaff, notesStaff.indexOf(noteHovered), notesStaff.indexOf(noteSelected))

    })
  
    screen.orientation.addEventListener("change", () => {
        staffSVG.innerHTML = "";

        // Note to self, indexOf returns -1 if not found, so no hover or selected notes will be rendered if none are registered in variables
        setStaff(notesStaff, notesStaff.indexOf(noteHovered), notesStaff.indexOf(noteSelected))
    })
}


main()
import { Flow } from "https://cdn.jsdelivr.net/npm/vexflow@4.2.3/build/esm/entry/vexflow.js";

//////// CONSTANTS & VARIABLES ////////
const { Renderer, Stave, StaveNote, Accidental, Formatter, Voice } = Flow;    // Uses vexflow library to render music note staves

const faqBtns = document.querySelectorAll(".faq-accordion");
const noteDisplay = document.querySelector(".note-display");
const tableKnown = document.querySelector("#data-insert-known");
const tableUnknown = document.querySelector("#data-insert-unknown");
const wrapperKnown = document.querySelector("#data-wrapper-known");
const wrapperUnknown = document.querySelector("#data-wrapper-unknown");
const btnRetry = document.querySelector("#btn-retry");

let query, inputType, notes, notesArr;
let chords, chordsKnown, chordsUnknown;

const ENHARMONICS = [
    ["D♭", "C♯"],
    ["E♭", "D♯"],
    ["G♭", "F♯"],
    ["A♭", "G♯"],
    ["B♭", "A♯"]
]

// Used to determine whether if a chord spans more than one octave, and what octave to place it in on a generated SVG Vexflow staff
const NOTE_ORDER = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];

//////// FUNCTIONS ////////

async function getNotes(event = null) {
    const urlParams = window.location.search
    let test;

    // Thoroughly checks url query parameters for valid note query string; if not, then redirect to chords main page
    // (Prevents website from breaking if user visits it without the proper note info to parse for chords)
    try {
        if (urlParams === "") {
            throw new Error("Redirect to main page");        // If no query exists at all, then redirect
        } else {
            const getQuery = urlParams.split('?')[1]
            query = getQuery.split('&')
            let hasCorrectQuery = false;

            for (let str of query) {
                if (str.includes("notes=") || str.includes("input=")) {
                    hasCorrectQuery = true;
                } else {
                    hasCorrectQuery = false;
                }
            }

            if (!hasCorrectQuery) {      // If no notes query parameter exists, then redirect
                throw new Error("Redirect to main page");
            } else {
                // Extract value of note and input queries in query string
                notes = query[1].replaceAll("notes=", "");
                inputType = query[0].replaceAll("input=", "");

                // If query contains "__" or ends with "_", it is therefore invalid
                if (notes.includes("__") || notes.split("").slice(-1).toString() === "_") {
                    throw new Error("Redirect to main page");
                }

                // alert(notes);

                chords = await requestChords(notes) // test: ("A_C_E")
            }
        }
    } catch (err) {
        window.location.assign("/chords/index.html")
    }

    // Sort chords
    chordsKnown = chords.filter((chord) => (chord.name != "Unnamed chord") && (chord.root != null));
    chordsUnknown = chords.filter((chord) => (chord.name === "Unnamed chord") || (chord.root === null));
    notesArr = notes.split("_");  // notes.replaceAll("%23", "#")
    alert(notesArr)

    for (let note of notesArr) {
        addNote(note);
    }

    let knownIndex = 1;

    for (let chord of chordsKnown) {
        addChordKnown(chord, knownIndex);
        knownIndex++;
    }

    let unknownIndex = 1;

    for (let chord of chordsUnknown) {
        addChordUnknown(chord, unknownIndex);
        unknownIndex++;
    }

}

function addNote(note) {
    note = note.replaceAll("b", "♭");
    note = note.replaceAll("%23", "♯");

    for (let group of ENHARMONICS) {
        if (group.includes(note)) {
            switch (group.indexOf(note)) {
                case 0:
                    note += ` (${group[1]})`
                    break;
                case 1:
                    note += ` (${group[0]})`
                    break;
                default:     // Just for error handling
                    alert("Something went wrong with displaying your notes. Please reach out to us regarding the issue, and we will try to fix it as soon as possible.")
            }

            break;
        }
    }

    if (window.innerWidth < 1000) {
        note = note.replaceAll("♭", "b");
        note = note.replaceAll("♯", "#");
    }

    const newElem = document.createElement("span");
    newElem.appendChild(document.createElement("p"));
    newElem.classList.add("col");
    newElem.querySelector("p").innerText = note;

    noteDisplay.appendChild(newElem);
}

function addChordKnown(chord, idIndex) {
    let name, notes, notation, normalForm, sound, staff;
    let notationText = [];
    let notesDisplay = chord.notes;      // Store chord notes into separate var in order to modify for visual enharmonic note text output

    // Create new table row element and insert HTML
    const newRows = [document.createElement("tr"), document.createElement("tr"), document.createElement("tr")];

    // `<tr data-toggle="collapse" data-target="#accordion-1" class="clickable">
    newRows[0].innerHTML = `<td>
        <img class="data-arrow" src="../assets/vendor/img/btn/Nav-Arrow-Black.png" alt="">
    </td>
    <td class="data-chord"></td>
    <td class="data-notes"></td>
    <td class="data-notation"></td>
    <td class="data-normal"></td>
`  //    <tr class="color-spacing"></tr>

    newRows[0].setAttribute("data-toggle", "collapse");
    newRows[0].setAttribute("data-target", `#accordion-known-${idIndex}`);
    newRows[0].classList.add("clickable");

    newRows[0].addEventListener("click", function (event) {
        this.classList.toggle("active");
    })

    newRows[1].classList.add("color-spacing");

    // <tr class="data-expand">
    newRows[2].innerHTML = `<td colspan="6">
        <div id="accordion-known-${idIndex}" data-bs-parent="#data-table-unknown" class="collapse accordion-collapse container">
            <div class="staff-header">
                <span>Staff Representation:</span>
                <div class="staff-sound">
                    <button class="btn-sound" title="">
                        <img class="mx-auto d-block" src="../assets/vendor/img/btn/speaker-1.png"
                            alt="">
                    </button>
                </div>
            </div>
            <div class="staff-wrapper">
                <div id="staff-known-${idIndex}"></div>
            </div>
        </div>
    </td>
    `

    newRows[2].classList.add("data-expand");

    for (let note of notesDisplay) {
        note = note.replaceAll("b", "♭");
        note = note.replaceAll("%23", "♯");

        for (let group of ENHARMONICS) {
            if (group.includes(note)) {
                switch (group.indexOf(note)) {
                    case 0:
                        note += ` (${group[1]})`
                        break;
                    case 1:
                        note += ` (${group[0]})`
                        break;
                    default:     // Just for error handling
                        alert("Something went wrong with displaying your notes. Please reach out to us regarding the issue, and we will try to fix it as soon as possible.")
                }

                break;
            }
        }
    }

    // If "data-empty" row exists in table, get rid of it first
    if (tableKnown.querySelector("tr").classList.contains("data-empty")) {
        tableKnown.removeChild(tableKnown.querySelector("#data-empty-known"));
    }

    // Target specific child elements of row
    name = newRows[0].querySelector(".data-chord");
    notes = newRows[0].querySelector(".data-notes");
    notation = newRows[0].querySelector(".data-notation");
    normalForm = newRows[0].querySelector(".data-normal");
    sound = newRows[2].querySelector(".staff-sound button");
    staff = newRows[2].querySelector(`#staff-known-${idIndex}`);

    // Fill text of each element/"table field" with appropriate information from Chord object

    // Fill text of each element/"table field" with appropriate information from Chord object
    if (chord.name === "Sus or Quartal Chord") {          // Special formatting case for suspensions/quartal chords
        notationText = [
            chord.notation[0].replaceAll("_", `<span class="bold">${chord.root}</span>`),
            chord.notation[1].replaceAll("_", notesDisplay[2]),
            chord.notation[2].replaceAll("_", notesDisplay[1]),
        ]

        // Reorder notes array so that root is the first element
        while (notesDisplay[0] != chord.root) {
            let temp = notesDisplay[0]
            notesDisplay = notesDisplay.slice(1)
            notesDisplay.push(temp)
        }

        name.innerHTML = notationText[0];
        notes.innerText = notesDisplay.join(", ");
        notation.innerHTML = notationText.slice(1).join(",<br>");
        normalForm.innerText = `(${chord.pitchClass.join(", ")})`
    } else {
        console.log(chord.name)
        console.log(chord.notation);
        console.log(typeof chord.notation);

        for (let elem of chord.notation) {
            elem = elem.replaceAll("+", "<sup>+</sup>");
            elem = elem.replaceAll("ø", "<sup>ø</sup>");

            notationText.push(elem.replaceAll("_", chord.root));
        }

        // Reorder notes array so that root is the first element
        while (notesDisplay[0] != chord.root) {
            let temp = notesDisplay[0]
            notesDisplay = notesDisplay.slice(1)
            notesDisplay.push(temp)
        }

        name.innerHTML = `<span class="bold">${chord.root}</span> ${chord.name}`
        notes.innerText = notesDisplay.join(", ");
        notation.innerHTML = notationText.join(",<br>");
        normalForm.innerText = `(${chord.pitchClass.join(", ")})`
    }

    alert(chord.notes)
    // Reorganize for actual chord notes
    while (chord.notes[0] != chord.root) {
        let temp2 = chord.notes[0]
        chord.notes = chord.notes.slice(1)
        chord.notes.push(temp2)
        alert(chord.notes)
    }

    sound.addEventListener("click", () => {
        alert("Sorry, chord playback is not implemented yet as of this moment.")
    })

    // Add all rows to unknown table
    tableKnown.appendChild(newRows[0]);
    tableKnown.appendChild(newRows[1]);
    tableKnown.appendChild(newRows[2]);

    // Add unknown table staff chords
    let tempInput = chord.notes.filter((arg) => arg)      // Needed in order to not modify contents of chord.notes
    createStaffKnown(tempInput, staff);

    // If window is resized, then clear staff lines svg and rerender image from createStaffUnknown()
    window.addEventListener("resize", () => {
        staff.innerHTML = "";
        // alert("REsize test: " + chord.notes)
        let tempInput = chord.notes.filter((arg) => arg)  // Needed in order to not modify contents of chord.notes
        // alert(tempInput)
        createStaffKnown(tempInput, staff);
    })
}

function addChordUnknown(chord, idIndex) {
    let notes, normalForm, sound, staff;
    let notesDisplay = chord.notes;      // Store chord notes into separate var in order to modify for visual enharmonic note text output

    // Create new table row element and insert HTML
    const newRows = [document.createElement("tr"), document.createElement("tr"), document.createElement("tr")];

    // `<tr data-toggle="collapse" data-target="#accordion-1" class="clickable">
    newRows[0].innerHTML = `<td>
        <img class="data-arrow" src="../assets/vendor/img/btn/Nav-Arrow-Black.png" alt="">
    </td>
    <td class="data-notes"></td>
    <td class="data-normal"></td>
    `  //    <tr class="color-spacing"></tr>

    newRows[0].setAttribute("data-toggle", "collapse");
    newRows[0].setAttribute("data-target", `#accordion-unknown-${idIndex}`);
    newRows[0].classList.add("clickable");

    newRows[0].addEventListener("click", function (event) {
        this.classList.toggle("active");
    })

    newRows[1].classList.add("color-spacing");

    // <tr class="data-expand">
    newRows[2].innerHTML = `<td colspan="3">
        <div id="accordion-unknown-${idIndex}" data-bs-parent="#data-table-unknown" class="collapse accordion-collapse container">
            <div class="staff-header">
                <span>Staff Representation:</span>
                <div class="staff-sound">
                    <button class="btn-sound" title="">
                        <img class="mx-auto d-block" src="../assets/vendor/img/btn/speaker-1.png"
                            alt="">
                    </button>
                </div>
            </div>
            <div class="staff-wrapper">
                <div id="staff-unknown-${idIndex}"></div>
            </div>
        </div>
    </td>
    `

    newRows[2].classList.add("data-expand");

    for (let note of notesDisplay) {
        note = note.replaceAll("b", "♭");
        note = note.replaceAll("%23", "♯");

        for (let group of ENHARMONICS) {
            if (group.includes(note)) {
                switch (group.indexOf(note)) {
                    case 0:
                        note += ` (${group[1]})`
                        break;
                    case 1:
                        note += ` (${group[0]})`
                        break;
                    default:     // Just for error handling
                        alert("Something went wrong with displaying your notes. Please reach out to us regarding the issue, and we will try to fix it as soon as possible.")
                }

                break;
            }
        }
    }

    // If "data-empty" row exists in table, get rid of it first
    if (tableUnknown.querySelector("tr").classList.contains("data-empty")) {
        tableUnknown.removeChild(tableUnknown.querySelector("#data-empty-unknown"));
    }

    // Target specific child elements of row
    notes = newRows[0].querySelector(".data-notes");
    normalForm = newRows[0].querySelector(".data-normal");
    sound = newRows[2].querySelector(".staff-sound button");
    staff = newRows[2].querySelector(`#staff-unknown-${idIndex}`);

    // Fill text of each element/"table field" with appropriate information from Chord object
    notes.innerText = notesDisplay.join(", ");
    normalForm.innerText = `(${chord.pitchClass.join(", ")})`

    sound.addEventListener("click", () => {
        alert("Sorry, chord playback is not implemented yet as of this moment.")
    })

    // Add all rows to unknown table
    tableUnknown.appendChild(newRows[0]);
    tableUnknown.appendChild(newRows[1]);
    tableUnknown.appendChild(newRows[2]);

    // Add unknown table staff chords
    let tempInput = chord.notes.filter((arg) => arg)      // Needed in order to not modify contents of chord.notes
    createStaffUnknown(tempInput, staff);

    // If window is resized, then clear staff lines svg and rerender image from createStaffUnknown()
    window.addEventListener("resize", () => {
        staff.innerHTML = "";
        // alert("REsize test: " + chord.notes)
        let tempInput = chord.notes.filter((arg) => arg)  // Needed in order to not modify contents of chord.notes
        // alert(tempInput)
        createStaffUnknown(tempInput, staff);
    })
}

function createStaffKnown(notes, staffDiv) {
    const DEFAULT_COLOUR = "black";  // Sets general staff colour

    let staffWidth;
    let prevNoteOrder = -1;
    let raiseNote8ve = false;
    let raiseNoteIndex = 999;        // arbitrarily high number; no one is going to use more than 999 notes in a chord anyways
    let enharmonicIndex = 0;

    let accidentalInfo = []          // 2d array listing any accidentals in each note and what index in chord.note they appear at

    if (screen.innerWidth > 345) {
        staffWidth = wrapperKnown.clientWidth - 40;                 // Subtract by a certain amt of px or so to prevent table content overflow
    } else {
        staffWidth = wrapperKnown.scrollWidth - 40;
    }

    // Determines if chord will span across middle C (past C4); if so, then raiseNote8ve = true.
    for (let note of notes) {
        let isSharp = false;

        // If detected note is a sharp, then get index of flat enharmonic equiv. in ENHARMONICS constant
        if (note.slice(-1) === "3" || note.slice(-1) === "#") {
            isSharp = true;
            // note = note.replaceAll("%23", "#");

            for (let group of ENHARMONICS) {
                if (group.includes(note.replaceAll("%23", "♯")) || group.includes(note.replaceAll("#", "♯"))) {
                    enharmonicIndex = ENHARMONICS.indexOf(group);
                }
            }
        }

        if (isSharp) {
            // alert(prevNoteOrder + " " + ENHARMONICS[enharmonicIndex][0])
            // alert("Sharp Test: " + NOTE_ORDER.indexOf(ENHARMONICS[enharmonicIndex][0]))

            if (prevNoteOrder >= NOTE_ORDER.indexOf(ENHARMONICS[enharmonicIndex][0])) {
                raiseNote8ve = true;
                raiseNoteIndex = notes.indexOf(note);
                // alert("Detected 8ve change: " + raiseNoteIndex)
                break;
            } else {
                prevNoteOrder = NOTE_ORDER.indexOf(ENHARMONICS[enharmonicIndex][0])
            }
        } else {
            // alert(prevNoteOrder + " " + note.replaceAll("b", "♭"))
            // alert("No Sharp Test:" + NOTE_ORDER.indexOf(note.replaceAll("b", "♭")))

            if (prevNoteOrder >= NOTE_ORDER.indexOf(note.replaceAll("b", "♭"))) {
                raiseNote8ve = true;
                raiseNoteIndex = notes.indexOf(note);

                // alert("Detected 8ve change: " + raiseNoteIndex)
                break;
            } else {
                prevNoteOrder = NOTE_ORDER.indexOf(note.replaceAll("b", "♭"))
            }
        }
    }

    // Add 8ve range to each respective note, depending on results found in last for loop
    for (let index = 0; index < notes.length; index++) {
        notes[index] = notes[index].replaceAll("%23", "#");
        notes[index] = notes[index].toLowerCase();

        // alert(notes[index].slice(1))

        // Check note for accidental; if so, add note info to accidentalInfo array
        if (["#", "b", "x", "bb"].includes(notes[index].slice(1))) {
            if (notes[index].slice(1) === "x") {
                accidentalInfo.push(["##", index]);
            } else {
                accidentalInfo.push([notes[index].slice(1), index]);
            }
        }

        // Apply correct octave marking to note
        if (raiseNote8ve) {
            if (index < raiseNoteIndex) {
                notes[index] += "/4";
            } else {
                notes[index] += "/5";
            }
        } else {
            notes[index] += "/4";
        }
    }

    // alert("Placed notes: " + notes)
    // alert(accidentalInfo)

    const staffNotes = [
        new StaveNote({ keys: notes, duration: "w", align_center: true })  // ["c/4", "e/4", "g/4"]
    ]

    for (let [accidental, index] of accidentalInfo) {
        // alert(accidental, index)
        staffNotes[0].addModifier(new Accidental(accidental), index);
    }

    // Create an SVG renderer and attach it to the DIV element with id format of "staff-#"
    // const div = document.getElementById('staff-1');
    let renderer = new Renderer(staffDiv, Renderer.Backends.SVG);

    // Configure the rendering context
    renderer.resize(staffWidth, 120);
    const context = renderer.getContext();
    context.setFont('Arial', 10);
    context.setFillStyle(DEFAULT_COLOUR);
    context.setStrokeStyle(DEFAULT_COLOUR);

    // Create a stave at position (40, -10) and width of 80 px less than current unknown table width
    const stave = new Stave(40, -10, (staffWidth - (40 * 2)), 
        {fill_style: DEFAULT_COLOUR}
    );

    // Add a clef and time signature.
    stave.addClef('treble');

    // Create a voice in 4/4 and add above notes
    const voice = new Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables(staffNotes);

    // Format and justify the notes to 400 pixels.
    new Formatter().joinVoices([voice]).format([voice], (staffWidth - (40 * 2) - ((staffWidth - (40 * 2)) * 0.095)));

    // Render voice
    voice.draw(context, stave);

    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();
}

function createStaffUnknown(notes, staffDiv) {
    const DEFAULT_COLOUR = "black";  // Sets general staff colour

    let staffWidth;
    let prevNoteOrder = -1;
    let raiseNote8ve = false;
    let raiseNoteIndex = 999;        // arbitrarily high number; no one is going to use more than 999 notes in a chord anyways
    let enharmonicIndex = 0;

    let accidentalInfo = []          // 2d array listing any accidentals in each note and what index in chord.note they appear at

    if (screen.innerWidth > 345) {
        staffWidth = wrapperUnknown.clientWidth - 40;                 // Subtract by a certain amt of px or so to prevent table content overflow
    } else {
        staffWidth = wrapperUnknown.scrollWidth - 40;
    }


    // Determines if chord will span across middle C (past C4); if so, then raiseNote8ve = true.
    for (let note of notes) {
        let isSharp = false;

        // If detected note is a sharp, then get index of flat enharmonic equiv. in ENHARMONICS constant
        if (note.slice(-1) === "3" || note.slice(-1) === "#") {
            isSharp = true;
            // note = note.replaceAll("%23", "#");

            for (let group of ENHARMONICS) {
                if (group.includes(note.replaceAll("%23", "♯")) || group.includes(note.replaceAll("#", "♯"))) {
                    enharmonicIndex = ENHARMONICS.indexOf(group);
                }
            }
        }

        if (isSharp) {
            // alert(prevNoteOrder + " " + ENHARMONICS[enharmonicIndex][0])
            // alert("Test: " + NOTE_ORDER.indexOf(ENHARMONICS[enharmonicIndex][0]))

            if (prevNoteOrder >= NOTE_ORDER.indexOf(ENHARMONICS[enharmonicIndex][0])) {
                raiseNote8ve = true;
                raiseNoteIndex = notes.indexOf(note);
                // alert("Detected 8ve change: " + raiseNoteIndex)
                break;
            } else {
                prevNoteOrder = NOTE_ORDER.indexOf(ENHARMONICS[enharmonicIndex][0])
            }
        } else {
            // alert(prevNoteOrder + " " + note.replaceAll("b", "♭"))
            // alert("Test:" + NOTE_ORDER.indexOf(note.replaceAll("b", "♭")))

            if (prevNoteOrder >= NOTE_ORDER.indexOf(note.replaceAll("b", "♭"))) {
                raiseNote8ve = true;
                raiseNoteIndex = notes.indexOf(note);

                // alert("Detected 8ve change: " + raiseNoteIndex)
                break;
            } else {
                prevNoteOrder = NOTE_ORDER.indexOf(note.replaceAll("b", "♭"))
            }
        }
    }

    // Add 8ve range to each respective note, depending on results found in last for loop
    for (let index = 0; index < notes.length; index++) {
        notes[index] = notes[index].replaceAll("%23", "#");
        notes[index] = notes[index].toLowerCase();

        // alert(notes[index].slice(1))

        // Check note for accidental; if so, add note info to accidentalInfo array
        if (["#", "b", "x", "bb"].includes(notes[index].slice(1))) {
            if (notes[index].slice(1) === "x") {
                accidentalInfo.push(["##", index]);
            } else {
                accidentalInfo.push([notes[index].slice(1), index]);
            }
        }

        // Apply correct octave marking to note
        if (raiseNote8ve) {
            if (index < raiseNoteIndex) {
                notes[index] += "/4";
            } else {
                notes[index] += "/5";
            }
        } else {
            notes[index] += "/4";
        }
    }

    // alert(accidentalInfo)

    const staffNotes = [
        new StaveNote({ keys: notes, duration: "w", align_center: true })  // ["c/4", "e/4", "g/4"]
    ]

    for (let [accidental, index] of accidentalInfo) {
        // alert(accidental, index)
        staffNotes[0].addModifier(new Accidental(accidental), index);
    }

    // Create an SVG renderer and attach it to the DIV element with id format of "staff-#"
    // const div = document.getElementById('staff-1');
    let renderer = new Renderer(staffDiv, Renderer.Backends.SVG);

    // Configure the rendering context
    renderer.resize(staffWidth, 120);
    const context = renderer.getContext();
    context.setFont('Arial', 10);
    context.setFillStyle(DEFAULT_COLOUR);
    context.setStrokeStyle(DEFAULT_COLOUR);

    // Create a stave at position (40, -10) and width of 80 px less than current unknown table width
    const stave = new Stave(40, -10, (staffWidth - (40 * 2)),
        {fill_style: DEFAULT_COLOUR}
    );

    // Add a clef and time signature.
    stave.addClef('treble');

    // Create a voice in 4/4 and add above notes
    const voice = new Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables(staffNotes);

    // Format and justify the notes to 400 pixels.
    new Formatter().joinVoices([voice]).format([voice], (staffWidth - (40 * 2) - ((staffWidth - (40 * 2)) * 0.095)));

    // Render voice
    voice.draw(context, stave);

    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();
}

function faqToggle() {
    window.addEventListener("resize", () => {
        for (let btn of faqBtns) {
            const faqInfo = btn.nextElementSibling;

            if (btn.classList.contains("active")) {
                faqInfo.style.height = (faqInfo.querySelector("p").clientHeight + (23 * 2)) + "px";
            }
        }
    })

    for (let btn of faqBtns) {
        btn.addEventListener("click", () => {
            const faqInfo = btn.nextElementSibling;

            // btn.classList.toggle("active");     <-- doesn't work on first click
            if (btn.classList.contains("active")) {
                btn.classList.remove("active");
                faqInfo.style.height = 0;
            } else {
                btn.classList.add("active");
                faqInfo.style.height = (faqInfo.querySelector("p").clientHeight + (23 * 2)) + "px";
            }
        })
    }
}

//////// REQUESTS TO SERVER ////////
function requestChords(notes) {

    return new Promise(async (resolve, reject) => {
        fetch(`http://localhost:5000/analyzeNotes?notes=${notes}`) // add query of filename to url
            .then((response) => {
                let output = response.json();
                // alert(typeof output)
                console.log(output)
                console.log("Processing chords...");

                resolve(output);
                // return output
            })
            .catch((err) => {
                console.log("Error in fetching chords: " + err);
                reject(err);
            })
    })
}

//////// DEBUG + MAIN FUNC ////////
function main() {
    window.addEventListener("DOMContentLoaded", getNotes);

    btnRetry.addEventListener("click", () => {
        // Depending on input type query parameter in URL, button redirects user to a different page
        switch (inputType) {
            case "mic":           // If mic, then go to microphone input
                window.location.assign("/chords/record.html");
                break;
            case "text":          // If text, then go to text/staff input (still a WIP)
                window.location.assign("/chords/note-text.html");
                break;
            case "keyboard":      // If anything else including keyboard, then go to keyboard
            default:
                window.location.assign("/chords/keyboard.html")
        }
    })


    faqToggle();
}

main();
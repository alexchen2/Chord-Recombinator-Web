//////// CONSTANTS & VARIABLES ////////
const faqBtns = document.querySelectorAll(".faq-accordion");
const noteDisplay = document.querySelector(".note-display");
const tableKnown = document.querySelector("#data-insert-known");
const tableUnknown = document.querySelector("#data-insert-unknown");
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

    for (let note of notesArr) {
        addNote(note);
    }

    for (let chord of chordsKnown) {
        addChordKnown(chord);
    }

    for (let chord of chordsUnknown) {
        addChordUnknown(chord);
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

function addChordKnown(chord) {
    let name, notes, notation, sound;
    let notationText = [];

    for (let note of chord.notes) {
        for (let group of ENHARMONICS) {
            if (group.includes(note)) {
                alert("group.indexOf(note): " + group.indexOf(note))
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

    // Create new table row element and insert HTML
    const newRow = document.createElement("tr");
    newRow.innerHTML = `<tr>
        <td class="data-chord"></td>
        <td class="data-notes"></td>
        <td class="data-notation"></td>
        <td class="data-sound">
            <button class="btn-sound" title="">
                <img class="mx-auto d-block" src="../assets/vendor/img/btn/speaker-1.png" alt="">
            </button>
        </td>
    </tr>`

    // If "data-empty" row exists in table, get rid of it first
    if (tableKnown.querySelector("tr").classList.contains("data-empty")) {
        tableKnown.removeChild(tableKnown.querySelector("#data-empty-known"));
    }

    // Target specific child elements of row
    name = newRow.querySelector(".data-chord");
    notes = newRow.querySelector(".data-notes");
    notation = newRow.querySelector(".data-notation");
    sound = newRow.querySelector(".data-sound button");

    // Fill text of each element/"table field" with appropriate information from Chord object
    if (chord.name === "Sus or Quartal Chord") {          // Special formatting case for suspensions/quartal chords
        notationText = [
            chord.notation[0].replaceAll("_", `<span class="bold">${chord.root}</span>`),
            chord.notation[1].replaceAll("_", chord.notes[2]),
            chord.notation[2].replaceAll("_", chord.notes[1]),
        ]

        // Reorder notes array so that root is the first element
        while (chord.notes[0] != chord.root) {
            let temp = chord.notes[0]
            chord.notes = chord.notes.slice(1)
            chord.notes.push(temp)
        }

        name.innerHTML = notationText[0];
        notes.innerText = chord.notes.join(", ");
        notation.innerHTML = notationText.slice(1).join(",<br>");
    } else {
        console.log(chord.name)
        console.log(chord.notation);
        console.log(typeof chord.notation);

        for (let elem of chord.notation) {
            notationText.push(elem.replaceAll("_", chord.root));
        }

        // Reorder notes array so that root is the first element
        while (chord.notes[0] != chord.root) {
            let temp = chord.notes[0]
            chord.notes = chord.notes.slice(1)
            chord.notes.push(temp)
        }

        name.innerHTML = `<span class="bold">${chord.root}</span> ${chord.name}`
        notes.innerText = chord.notes.join(", ");
        notation.innerHTML = notationText.join(",<br>");
    }

    sound.addEventListener("click", () => {
        alert("Sorry, chord playback is not implemented yet as of this moment.")
    })

    tableKnown.appendChild(newRow);
}

function addChordUnknown(chord) {
    let notes, normalForm, sound;
    let notationText = [];

    // Create new table row element and insert HTML
    const newRow = document.createElement("tr");
    newRow.innerHTML = `<tr>
        <td class="data-notes"></td>
        <td class="data-normal"></td>
        <td class="data-sound">
            <button class="btn-sound" title="">
                <img class="mx-auto d-block" src="../assets/vendor/img/btn/speaker-1.png" alt="">
            </button>
        </td>
    </tr>`

    for (let note of chord.notes) {
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
    notes = newRow.querySelector(".data-notes");
    normalForm = newRow.querySelector(".data-normal");
    sound = newRow.querySelector(".data-sound button");

    // Fill text of each element/"table field" with appropriate information from Chord object
    notes.innerText = chord.notes.join(", ");
    normalForm.innerText = `(${chord.pitchClass.join(", ")})`

    sound.addEventListener("click", () => {
        alert("Sorry, chord playback is not implemented yet as of this moment.")
    })

    tableUnknown.appendChild(newRow);
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
const { NOTE_MAP, Chord, combination, getKeyFromValue } = require("./music.js");
const promptSync = require('prompt-sync');   // package for output

// for getting console input
const prompt = promptSync();

// Notes accepted in text-based input
const NOTES_ALLOWED = {
    "any" : [
        'C', 'D', 'E', 'F', 'G', 'A', 'B'
    ],
    "flats" : [
        'Dbb', 'Db', 'Ebb', 'Eb', 'Fbb', 'Fb', 'Gbb', 
        'Gb', 'Abb', 'Ab', 'Bbb', 'Bb', 'Cbb', 'Cb'
    ],
    "sharps" : [
        'B#', 'Bx', 'C#', 'Cx', 'D#', 'Dx', 'E#',
        'Ex', 'F#', 'Fx', 'G#', 'Gx', 'A#', 'Ax'
    ]
};

const NOTES_ALLOWED_ALL = [].concat(...(Object.values(NOTES_ALLOWED))) // Note to self: ... -> ES6 spread operator; expand all arrays as separate elements

// used in try/catch to detect end of program in main(); child of error class
class ExitProgramError extends Error {
    constructor(msg) {
        super(msg);
    }
}

function collectNotes() {
    let isDone = false;     // Boolean to end input while loop
    let sharpMode = false;  // False = flats only; True = sharps only
    let notesInput = new Set();
    let input = "";

    // Anonymous function to display sharps/flat mode appropriately
    const displaySharp = (isSharps) => {
        if (isSharps) {
            return "Sharps";
        } else {
            return "Flats";
        }
    }

    let welcome = ` 
///////////// CHORD RECOMBINATOR v0.1.0 \\\\\\\\\\\\\\\\\\\\\\\\\\
Please enter a note. Type 'done' once you are done.
Enter 's' or 'S' to start over.
Enter 'q' or 'Q' to quit the program.
Enter 'm' or 'M' if you've made a mistake.
Enter 'v' or 'V' to view the notes you've entered so far.
Enter 'n' or 'N' to see what notes are accepted as input. 
Enter 'h' or 'H' to view this message again for help.
-----------------------------------------------------
Accidental Mode: ${displaySharp(sharpMode)}
Enter 'sh' to switch to sharps mode, or 'fl' to switch to flats mode.
    `

    let displayValidNotes = `
~~~~~~ ACCEPTED NOTES ~~~~~~
No Accidentals: ${NOTES_ALLOWED["any"]}
Flats: ${NOTES_ALLOWED["flats"]}
Sharps: ${NOTES_ALLOWED["sharps"]}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `

    console.log(welcome);

    // Note: Only plan to support a max of 7 notes per combination for now
    while (!isDone) {
        console.log(`Enter note #${notesInput.size + 1} or a command:`);
        input = prompt(">> ");   //`Note #${notesInput.length + 1}: \n>> `

        // If a music note is detected:
        if (NOTES_ALLOWED_ALL.includes(input)) {
            switch (true) {
                // If a flat is entered in sharp mode, prints an error msg and prompts for note again
                case (NOTES_ALLOWED["flats"].includes(input) && sharpMode):
                    console.log("ERROR: You entered a note with a flat while in sharp mode. \
                        \nPlease use the enharmonic sharp equivalent of the note, or type 'fl' to switch to flat input mode.\n"
                    );
                    break;
                // Likewise, if a sharp is entered in flat mode, prints an error msg and prompts for note again
                case (NOTES_ALLOWED["sharps"].includes(input) && !(sharpMode)):
                    console.log("ERROR: You entered a note with a sharp while in flat mode. \
                        \nPlease use the enharmonic flat equivalent of the note, or type 'sh' to switch to sharp input mode.\n"
                    );
                    break;
                // If no issues, then registers the note                         
                default:
                    notesInput.add(input);
            }
            continue;

        } else {       // If anything other than a note is entered:
            switch (input.toLowerCase()) {
                case 's':
                    notesInput.clear();
                    console.log("All notes erased; starting over.\n");
                    break;
                case 'q':
                    throw new ExitProgramError("DEBUG: End of program\n");
                case 'm':
                    let noteToDelete = "";

                    if (notesInput.size === 0) {
                        console.log("ERROR: There are no notes to delete! Add a note first.\n");
                        continue;
                    }

                    console.log(`Remove which note?\nCurrent notes entered: ${Array.from(notesInput)}`);
                    noteToDelete = prompt(">> ");

                    if (notesInput.delete(noteToDelete) == false) {
                        console.log(`ERROR: The note ${noteToDelete} has not been added!`);
                    } else {
                        notesInput.delete(noteToDelete);
                        console.log(`Deleted the note: ${noteToDelete}`);
                    }

                    break;
                case 'v':
                    if (notesInput.size === 0) {
                        console.log("ERROR: There are no notes to view! Add a note first.\n");
                    } else {
                        console.log(`Current notes entered: ${Array.from(notesInput)}\n`);  
                    }
                    
                    break;
                case 'n':
                    console.log(displayValidNotes);
                    break;
                case 'h':
                    console.log(welcome);
                    break;
                case 'sh':
                    if (sharpMode) {
                        console.log("You're already in 'Sharps' mode!\n");
                    } else {
                        console.log("Changing to sharps mode will clear all inputted notes. Proceed? (Y/N)");

                        let confirm = prompt(">> ");
                        if (["y", "yes"].includes(confirm.toLowerCase())) {
                            sharpMode = true;
                            notesInput.clear();
                            console.log("~~ ACCIDENTAL MODE: Sharps ~~\n");
                        } else {
                            if (!(["n", "no"].includes(confirm.toLowerCase()))) {
                                console.log("Unrecognized input. Reverting back to flats mode.\n")
                            }
                        }

                    }

                    break;
                case 'fl':
                    if (!(sharpMode)) {
                        console.log("You're already in 'Flats' mode!\n");
                    } else {
                        console.log("Changing to flats mode will clear all inputted notes. Proceed? (Y/N)");

                        let confirm = prompt(">> ");
                        if (["y", "yes"].includes(confirm.toLowerCase())) {
                            sharpMode = false;
                            notesInput.clear();
                            console.log("~~ ACCIDENTAL MODE: Sharps ~~\n");
                        } else {
                            if (!(["n", "no"].includes(confirm.toLowerCase()))) {
                                console.log("Unrecognized input. Reverting back to flats mode.\n")
                            }
                        }

                    }

                    break;
                case 'done':     // If done is entered, then upon relooping, loop breaks. 
                    console.log("-----------------------------------------------------\n")
                    isDone = true;                 
                case '':         // If nothing entered, then will prompt the user again for same note #.
                    continue;
                default:         // If anything other than a valid command is entered, then error msg is brought up.
                    console.log("ERROR: Please enter a valid note name.");
                    console.log("Type 'n' to bring up a list of valid note names.");
                    console.log("Type 'h' to bring up a list of commands.\n");

            }    
        }
    }

    return Array.from(notesInput);
}

function generateChords(notes = []) {
    let chords = [];
    let iter, tempChords;

    if (notes.length > 7) {
        iter = 7;
    } else {
        iter = notes.length;
    }

    for (let numNotes = 3; numNotes <= iter; numNotes++) {
        // Finds all combinations of chords of numNotes elements as arrays (of 3 notes up to 7 or max notes entered), 
        // then maps each array into a Chord object (while sorting them in normal form and registering their name and root). 
        tempChords = (combination(numNotes, notes)).map((arg) => {
            let chord = new Chord(arg);
            chord.sortNormal();
            chord.identify();

            return chord;
        });

        chords = chords.concat(tempChords);        
    }

    return chords;
}

function showChords(chords) {
    // If there are no chords or the "chords" array is not made up of Chord objects, then
    // "no chords" msg will be shown.
    if (chords.length === 0 || !(chords.every((arg) => arg instanceof Chord))) {
        console.log("No chords were able to be created...");
    } else {
        let namedChords = chords.filter((arg) => (arg.name != "Unnamed chord") && (arg.root != null));
        let unknownChords = chords.filter((arg) => (arg.name == "Unnamed chord") || (arg.root == null));
        
        console.log("Chords Found:");
        console.log("~~~~~~~ NAMED CHORDS ~~~~~~~\n");

        // this for loop structure --> similar to Python's enumerate in for loops!
        for (let [index, chord] of namedChords.entries()) {
            console.log(`----- Chord #${index + 1} -----`);

            if (chord.name === "Sus or Quartal Chord") {
                console.log(`Name:               ${chord.root} Sus2 / ${chord.notes[2]} Sus4 / ${chord.notes[1]} Quartal Chord`);
            } else {
                console.log(`Name:               ${chord.root} ${chord.name}`);
            }
            console.log(`Notes:              ${chord.notes}`);
            // chord.notation = chord.notation.map((arg) => {arg})
            // console.log("Alternate Notation: " + chord.notation)
            console.log(`Normal Form #s:     [${chord.pitchClass}]\n`);
        }
                     
        console.log("~~~~~~ UNKNOWN CHORDS ~~~~~~\n");
        for (let [index, chord] of unknownChords.entries()) {
            console.log(`----- Group #${index + 1} -----`);
            console.log(`Notes:           ${chord.notes}`);
            console.log(`Normal Form #s:  [${chord.pitchClass}]\n`);
        }

        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
    }
}

//// MISC. FUNCTIONS ////

// Delay function; credits to Dan Dascalescu on Stack Overflow
// Credits: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep/39914235#39914235
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//// MAIN EXECUTION ////

async function main() {
    let notes;
    try {
        notes = collectNotes();
    }
    catch (err) {
        if (err instanceof ExitProgramError) {
            console.log("Quitting Program. Goodbye!");
            console.log("-----------------------------------------------------\n");
            sleep(1500);

            return 0;
        } else if (err instanceof Error){
            console.error(err.message);
            return 1;
        } else {
            console.log(`DEBUG: Some unknown object was thrown (${err})`);
            return 1;
        }
    }

    let chords = generateChords(notes);
    showChords(chords);

    return 0;
}

main();
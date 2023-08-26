//////// LIBRARY IMPORTS ////////
import fs from "fs";

import {Chord, combination} from "./music.js"

//////// GLOBAL VARIABLES & CONSTANTS ////////


//////// FUNCTIONS ////////
// Test #1: Analyze chords before page direct
function chordAnalyzeOld(notes, inputMethod = "") {
    return new Promise((resolve, reject) => {
        try {
            // To-be-JSON-stringified output
            let output = {
                chords: [],
                method: inputMethod
            };

            let outputJSON = "";
            let fileName = notes.replaceAll(",", "").replaceAll(" ", "_")  // Ideal filename format e.g.: "A_C_E_Gb.json"

            // Split notes into a separate array
            let notesArr = notes.split(",");
            output.chords = generateChords(notesArr);

            // Convert object to JSON format
            outputJSON = JSON.stringify(output);
            
            // Create new JSON with data associated with selected notes
            fs.writeFile(fileName + ".json", outputJSON, () => {
                resolve(fileName);
            })
        } catch (err) {
            console.log("Error analyzing chords or converting data to JSON: " + err);
            reject(err);
        }
    })
}

// Test: Analyze chords after page 
/**
 * Given an underscore-separated string of notes, returns an object with an array of associated 
 * music chords comprised of those given notes (also structured as separate Chord() objects).
 * @param {String[]} notes 
 * @param {String} inputMethod
 */
function chordAnalyze(notes, inputMethod = "") {
    return new Promise((resolve, reject) => {
        try {
            // To-be-JSON-stringified output
            let output = {
                chords: [],
                method: inputMethod
            };

            // Split notes into a separate array
            let notesArr = notes.split("_");
            let chordsArr = generateChords(notesArr);

            output.chords = chordsArr;
            resolve(output)

        } catch (err) {
            console.error(err);
            console.log("Error analyzing chords: " + err);
            reject(err);
        }
    })

}

/**
 * 
 * @param {String[]} notes 
 */
function generateChords(notes = []) {
    let chords = [];
    let iter, tempChords;

    // Determines maximum number of notes in combinations
    if (notes.length > 7) {
        iter = 7;
    } else {
        iter = notes.length;
    }

    // for (let note of notes) {

    // }

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


async function main() {
    let test = await chordAnalyze("A_C#_E_G_B")
    console.log(test);
    console.log(test.chords[0].notes)
}

// main();

//////// EXPORT STATEMENT ////////
export { chordAnalyze, generateChords};

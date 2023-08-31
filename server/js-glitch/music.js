/* Basic code for Chord Recombinator--in terminal  */

/** Finished!
 * Steps:
 * 1). IO for getting chord notes                                                     X
 * 2). Finding combinations of all chords                                             X
 * 3). Determining "normal" form for each chord                                       X
 * 4). Transpose normal form into C Major (pitch value of 0) while keeping the root   X
 * 5). Matching up transposed normal form with chord dictionary                       X
 * 6). Output of chord info                                                           X
 */

//// GLOBAL CONSTANTS + VARIABLES ////

/**
 * Object assigning each note a pitch class number from 0 to 11
 * with respect to a C Major scale. Enharmonic notes are
 * also grouped together under the same number.
 * For example: B#/C/Dbb is assigned 0, while F#/Gbb is assigned 6.
 */ 
const NOTE_MAP = {
    0: ['B#', 'C', 'Dbb'],
    1: ['Bx', 'C#', 'Db'],
    2: ['Cx', 'D', 'Ebb'],
    3: ['D#', 'Eb', 'Fbb'],
    4: ['Dx', 'E', 'Fb'],
    5: ['E#', 'F', 'Gbb'],
    6: ['Ex', 'F#', 'Gb'],
    7: ['Fx', 'G', 'Abb'],
    8: ['G#', 'Ab'],
    9: ['Gx', 'A', 'Bbb'],
    10: ['A#', 'Bb', 'Cbb'],
    11: ['Ax', 'B', 'Cb']
};

// List of chord types and their pitch class number normal forms; Array.values(Array.values(CHORD_LIST)) -> index of root note
const CHORD_LIST = {
    'Major Chord': { '[0,4,7]': 0 },
    'Major Seventh Chord': { '[0,1,5,8]': 1 },
    'Minor Major Seventh Chord': { '[0,1,4,8]': 1 },
    'Minor Chord': { '[0,3,7]': 0 },
    'Minor Seventh Chord': { '[0,3,5,8]': 2 },
    'Half Diminished Seventh': { '[0,2,5,8]': 1 },
    'Augmented Chord': { '[0,4,8]': 0 },
    'Diminished Chord': { '[0,3,6]': 0 },
    'Dominant Seventh Chord': { '[0,3,6,8]': 3 },
    'Dominant Ninth Chord': { '[0,2,4,6,9]': 1 },
    'Dominant Eleventh Chord': { '[0,2,4,6,7,9]': 1 },
    'Dominant Thirteenth Chord': {
        '[0,1,3,5,7,8,10]': 2,
        '[0,1,3,5,6,8,10]': 5,
        '[0,2,3,5,7,8,10]': 6
    },
    'Lydian Dominant/Acoustic Scale': {
        '[0,2,3,5,6,8,10]': 5,
        '[0,2,4,5,7,8,10]': 6,
        '[0,1,3,4,6,8,10]': 4
    },
    'Diminished Seventh Chord': { '[0,3,6,9]': 0 },
    'Quartal Chord': { '[0,2,5,7]': 1 },
    'Sus or Quartal Chord': { '[0,2,7]': 0 }
};

const CHORD_NOTATION = {
    'Major Chord': ['_', '_Maj'],
    'Major Seventh Chord': ['_M7', '_Maj7'],
    'Minor Major Seventh Chord': ['_mM7', '_min-Maj7'],
    'Minor Chord': ['_m', '_min'],
    'Minor Seventh Chord': ['_m7', '_min7'],
    'Half Diminished Seventh': ['_ø7', '_m7(b5)', '_min7(b5)'],
    'Augmented Chord': ['_+', '_aug'],
    'Diminished Chord': ['_°', '_dim'],
    'Dominant Seventh Chord': ['_7', '_dom7'],
    'Dominant Ninth Chord': ['_9', '_dom9'],
    'Dominant Eleventh Chord': ['_11', '_dom11'],
    'Dominant Thirteenth Chord': ['_13', '_dom13'],
    'Lydian Dominant Scale': [
        '_ Acoustic Scale',
        '_13(#11)',
        '_ Mixolydian #4 Scale',
        '_ Lydian b7 Scale'
    ],
    'Diminished Seventh Chord': ['_°7', '_dim7'],
    'Quartal Chord': [],
    'Sus or Quartal Chord': ['_Sus2', '_Sus4', '_ Quartal Chord']
};

//// CLASSES ////

class Chord {
    constructor(notes = []) {
        this.notes = notes;
        this.root = null;
        this.isNormal = false;   // shows if chord is in most COMPACT arrangement of notes
        this.pitchClass = [];
        this.name = "Unnamed chord";
        this.notation = [];

        if (this.notes != []) {       // if block might be unnecessary
            this.findPitchClass();
            this.sortAscending();
        }
    }
    
    // Can either add single notes or an array of notes; probably not going to use the latter functionality
    addNotes(note) {
        this.notes = this.notes.concat(note);
        this.findPitchClass();
        this.sortAscending();
        this.isNormal = false;
    }

    removeNotes(note) {
        const index = this.notes.indexOf(note);

        if (index < 0) {          // If index is not found (value of -1), then throw an error. Just futureproofing things for later
            throw new Error(`Cannot remove the note ${note}; it doesn't exist in the current chord!`)
        } else {
            this.notes.splice(index, 1);
            this.pitchClass.splice(index, 1);
            // Since both lists are already in order, no need to run sort() method      
        }
    }

    findPitchClass() {
        const noteMapNotes = Object.values(NOTE_MAP);
        let pitchNum = 0;
        // Reset pitchClass array; might be inefficient for large arr of notes, however...
        this.pitchClass = []   

        // Loop through each note and mapping and find the associated pitch class # for every note, then append to
        // this.pitchClass IN SAME ORDER as the notes in this.notes
        for (let note of this.notes) {
            for (let mapping of noteMapNotes) {
                if (mapping.includes(note)) {
                    pitchNum = getKeyFromValue(NOTE_MAP, mapping);
                    this.pitchClass.push(Number(pitchNum));
                    break;
                }
            }
        }
    }

    sortAscending() {
        // Note to self: Sorts using a specific function where elem a comes before elem b if a - b is neg.
        // Otherwise, would convert to string and sort lexicographically by UTF-16 order, which is NOT what we want. 
        // (e.g. '20' < '3' in UTF-16 order with Unicode characters)
        this.pitchClass.sort((a, b) => a - b);

        // a, b are any two arbitrary elements in the notes array that are to be sorted
        this.notes.sort((a, b) => {   
            const noteMapNotes = Object.values(NOTE_MAP);
            let pitchNums = [];

            // Gets the associated pitch class number for the two arbitrary notes being sorted
            for (let note of [a, b]) {
                for (let mapping of noteMapNotes) {
                    if (mapping.includes(note)) {
                        let pitchNum = getKeyFromValue(NOTE_MAP, mapping);
                        pitchNums.push(Number(pitchNum));     // A's PitchNum first; B's PitchNum last
                    }
                }
            }

            // If same pitch number, determine order by their indices in the NOTE_MAP mapping
            if (pitchNums[0] === pitchNums[1]) { 
                return(NOTE_MAP[pitchNums[0]].indexOf(a) - NOTE_MAP[pitchNums[1]].indexOf(b));
            } else {     // Otherwise, sort by pitch number (lower goes first)
                return(pitchNums[0] - pitchNums[1]);
            }
        });
    }

    sortNormal() {
        // If no notes in chord yet, then throw an error
        if (this.notes === [] || this.pitchClass === []) {
            throw new Error("No notes in chord yet!");
        }

        // Sorts by ascending in case if not sorted like so previously; might be redundant
        // this.sortAscending()

        // 2D Array of all possible inversions of the chord in pitch class numbers
        let inversions = this.pitchClass.map((arg) => {
            const index = this.pitchClass.indexOf(arg);      // Bottom pitch # of inversion
            const arrHead = this.pitchClass.slice(index);    // Pitch #s greater than pitch # at index
            const arrTail = this.pitchClass.slice(0, index);  // Pitch #s smaller than pitch # at index

            return(arrHead.concat(arrTail));
        });

        // Sort inversions by smallest pitch class # difference between lowest & highest notes of inversion (smallest first)
        inversions.sort((a, b) => comparePCDiff(a, b));
        // console.log(inversions);        

        // As a result of sorting, inv. in front of array is the most compact; therefore is normal form of chord
        this.pitchClass = inversions[0];  // Overwrite previous P.C. config. with normal form config.

        this.notes.sort((a, b) => {
            const noteMapNotes = Object.values(NOTE_MAP);
            let pitchNums = [];

            // Gets the associated pitch class number for the two arbitrary notes being sorted
            for (let note of [a, b]) {
                for (let mapping of noteMapNotes) {
                    if (mapping.includes(note)) {
                        let pitchNum = getKeyFromValue(NOTE_MAP, mapping);
                        pitchNums.push(Number(pitchNum));     // A's PitchNum first; B's PitchNum last
                    }
                }
            }

            // Maps each element by respective index as they appear in pitchNums
            pitchNums = pitchNums.map((arg) => {
                return(this.pitchClass.indexOf(arg));
            });

            // If a and b have same index in pitchNums, determine order by their indices in the NOTE_MAP mapping
            if (pitchNums[0] === pitchNums[1]) { 
                return(NOTE_MAP[pitchNums[0]].indexOf(a) - NOTE_MAP[pitchNums[1]].indexOf(b));
            } else {     // Otherwise, sort by index in pitchNums (lower goes first)
                return(pitchNums[0] - pitchNums[1]);
            }
        });
        
        this.isNormal = true;
    }

    identify() {
        if (!(this.isNormal)) {
            throw new Error("Chord not sorted into normal mode yet!");
        }

        // Step 1: Transpose chord's normal form to C Major
        let transPitchClass = []
        const distFromC = 12 - this.pitchClass[0];  // Distance of bottom normal form note from middle C (12 notes = 0 notes)

        transPitchClass = this.pitchClass.map((arg) => {
            return ((arg + distFromC) % 12);
        });

        // Step 2: Check against CHORD_LIST and get root and chord name accordingly
        let chordFound = false;

        for (let grouping of Object.values(CHORD_LIST)) {
            for (let code of Object.keys(grouping)) {
                
                // console.log(getKeyFromValue(CHORD_LIST, grouping) + ": " + code)
                if (code === "[" + transPitchClass.toString() + "]") {
                    this.root = this.notes[grouping[code]];
                    this.name = getKeyFromValue(CHORD_LIST, grouping);
                    this.notation = CHORD_NOTATION[this.name];
                    
                    // console.log(this.root, this.name, this.notation)
                    chordFound = true;
                    break;
                }                
            }

            if (chordFound) {
                break;
            }
        }

        if (!(chordFound)) {
            this.root = null;
            this.name = "Unnamed chord";
            this.notation = [];
        }
    }
}

//// MISC. FUNCTIONS ////

/** 
 * Recursively finds combinations of a specified number of elements in an array.
 * @param {Number} numElem - Number of elements per combination.
 * @param {Array} startArray - Initial array of elements of any type; when recursing, is the latter 
 *                             elements left over to add to a combination.
 * @param {Array} endArray - (Used when recursing) Array used to contain consecutive combinations per recursion, and 
 *                           is returned when all possible n-element combinations are stored.
 * @return {Array} Returns a 2-dimensional array containing every possible n-element combination.
 */
function combination(numElem, startArray, endArray = [], output = []) {
    if (numElem <= 0) {
        output.push(endArray);
    } else {
        // startArray.forEach(elem => {
        for (let index = 0; index < startArray.length - (numElem - 1); index++) {
            combination(numElem - 1, startArray.slice(index + 1), endArray.concat(startArray[index]), output);
        }
        
        return output;
    } 
}

function getKeyFromValue(obj, value) {
    const objKeys = Object.keys(obj);
    const output = objKeys.find((key) =>
        obj[key] === value
    )

    return(output);
}

/** 
 * @summary Recursively finds and compares the pitch class difference between two pitch class configurations of a chord, and 
 * returns the pitch class configuration that is the most compact. If given two pitch class sets of different chords, can also
 * compare and return the pitch class set that is more compact. 
 * 
 * Note that the function assumes both chords are sorted
 * in ascending order, and are not empty/have the same number of notes.
 * 
 * @param {Array} pitchA - 
 * @param {Array} pitchB - 
 * @return {number} Returns either 1, 0, or -1 to show result of comparison of pitchA compared to pitchB:
 *                    - +1 indicates pitchA is *larger* than pitchB;
 *                    - 0 indicates pitchA is *equal* to pitchB;
 *                    - -1 indicates pitchA is *smaller* than pitchB. 
 */
function comparePCDiff (pitchA, pitchB) {     // NOTE TO SELF: change return value to 1/-1/0 or true/false for recursion capabilities?
    // Check special conditions preventing proper pitch class set comparisons.
    switch (true) {
        // If one pitch class set has no numbers or sets are of different note lengths, then it cannot be compared; throw an error
        case ((pitchA === [] || pitchB === []) || (pitchA.length != pitchB.length)):
            throw new Error("Chords cannot be compared; they are either empty or of different sizes!");
            // return(pitchA.concat(pitchB));
        // If both pitch class sets have only 1 element, then return the pitch class set that begins with the lower number.
        case (pitchA.length === 1 && pitchB.length === 1):
            let lowerPitch = Math.min(pitchA[0], pitchB[0]);

            if (lowerPitch != pitchB) {
                return -1;
            } else if (lowerPitch != pitchA) {
                return 1;
            } else {
                return 0;
            }
    }

    // pcDiff -> pitch class difference between last and first note of a "chord" grouping (last # - first #)
    let pcDiffA = (12 + (pitchA.slice(-1) - pitchA[0])) % 12;  
    let pcDiffB = (12 + (pitchB.slice(-1) - pitchB[0])) % 12;
    /*
     * ^ Formula explanation: ^
     *   - If diff is negative, then takes its complement within interval distance of 12; since the complement is already less than 
     *     12 as a result, therefore nothing changes when taking modulo 12.
     *   - If diff is positive, the modulo 12 effectively cancels out adding 12 to the diff, so you get the 
     *     original positive diff between the pitches.
     *   In both cases above, you get the difference in pitch class numbers from the lowest-pitched note
     *   to the highest-pitched note as a positive number, wrapping around the number 12 per modulo-arithmetic style.
     */ 
    
    if (pcDiffA < pcDiffB) {
        return -1; // return pitchA;
    } else if (pcDiffA > pcDiffB) {
        return 1;  // return pitchB;
    } else {
        return comparePCDiff(pitchA.slice(0, -1), pitchB.slice(0, -1));
    }
}

// XOR boolean operator function, unused currently
function xOR (statement1, statement2) {
    return ((statement1 || statement2) && !(statement1 && statement2));
}

//// DEBUGGING ////
function main() {
    const chord = new Chord(['C', 'D', 'G']);
    chord.sortAscending();

    console.log(`Notes: ${chord.notes}`);
    console.log(`Pitch Class #s: ${chord.pitchClass}`);

    chord.sortNormal();

    console.log(`Normal Form Notes: ${chord.notes}`);
    console.log(`Normal Form Pitch Class #s: ${chord.pitchClass}`);

    chord.identify();
    console.log(chord)
    // let test = combination(3, ['Bb', 'D', 'F', 'A', 'C']);
    // console.log(test);
}

// main();

//// EXPORT STATEMENT ////
module.exports = {NOTE_MAP, Chord, combination, getKeyFromValue};

// Backend server test for "test-mediarecorder.js"
// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { spawnSync } from "child_process";

// import { chordAnalyze, generateChords } from "./js/chordAnalyze.js"

// Old CommonJS formatted imports
const express = require("express");
const cors = require("cors");
const multer = require("multer");
// const execSync = require('child_process').execSync();
const path = require("path");      // used for path.join
const fs = require('fs');
const { spawnSync } = require("child_process");
const url = require('url');

const { generateChords } = require("./js/chordAnalyze.js")

//////// APP-RELATED VAR + MIDDLEWARE ////////
// const __filename = url.fileURLToPath(import.meta.url);
// const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Multer middleware config for naming and storing during file creation using its disk storage engine
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    },
    destination: function (req, file, cb) {
        cb(null, __dirname + '/../public/assets/vendor/audio/user/')
    },
}) 
 
const upload = multer({ "storage": storage })

// Start up express app and set port
let app = express();
const port = 5000;

let filename = "";
const AUDIO_DIR = path.join(__dirname, "../public/assets/vendor/audio/user");

// Middleware being used in server
app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));            // Set main directory to "public" folder...?

//////// REQUESTS ////////

// For handling get requests to server: redirect to webpage (remove demo ones later)
app.get("/", (req, res) => {          // redirect to chords main page
    res.sendFile("/chords/index.html", { root: path.join(__dirname, "../public") });
});

app.get("/analyzeNotes", (req, res) => {
    let notes = req.query.notes
    let chords;

    // Replace all unicode sharp symbols (%23) with actual hashtags
    while (notes.includes("%23")) {
        notes = notes.replace("%23", "#");
    }

    notes = notes.split("_");          // formatted as "C_D_E_F" (etc...)    

    console.log(req.query, typeof req.query)
    console.log(notes)

    try {
        chords = generateChords(notes);
    } catch (err) {
        console.error(err);
        res.redirect("/chords/index.html");
    }

    res.send(chords)
})

app.get("/getResults", (req, res) => {
    res.redirect(url.format({
        pathname: "/chords/results.html",
        query: req.query
    }))
});

// For get requests of data (test)
let test = {title: "Hello Post", text: "Hello World! GET request successful!"}
app.get("/getHello", (req, res) => {
    res.send(test.text + " someufjdsjanklsfrgahhhh ");
});

app.get("/getNotes", async (req, res) => {
    // Get filename from query in request
    const fileName = path.join(AUDIO_DIR, req.query.file)
    console.log(fileName);

    const pyProgram = spawnSync("python3", ["/app/server/py/audioAnalyze.py", fileName]);
    // const output = execSync("python test-html/audioAnalyze.py audio/audioClip-11-18-39-34.webm").toString());

    let output = pyProgram.stdout.toString();
    console.log("audioAnalyze.py request content: " + output)
    res.send(output);

    // pyProgram.stdout.on("data", function(data) {
    //     let output = data.toString();
    //     alert("test");
    //     console.log("audioAnalyze.py request content: " + output);
    //     console.log(typeof data);
    //     res.send(output);
    //     // res.write(data);
    //     // res.end('end');
    // });
});

app.post("/clearFiles", (req, res) => {
    fs.readdir(AUDIO_DIR, (err, files) => {
        let audioFiles = [];

        if (err) {
            console.error("Error scanning and clearing files: " + err);
        } else {
            files.forEach((file) => {
                audioFiles.push(file);
            })

            if (audioFiles.length > 10) {
                audioFiles.forEach((file) => {
                    fs.unlink(path.join(AUDIO_DIR, file), (err) => {
                        if (err) {
                            console.error("Error deleting files: " + err);
                        } else {
                            console.log(`File "${file}" was deleted!`);
                        }
                    })
                });
            }
        }

    });
})

app.get("/convertMicAudio", (req, res) => {
    console.log("Attempting to convert microphone audio...");
    const fileName = path.join(AUDIO_DIR, req.query.file)
    console.log(fileName);

    const pyProgram = spawnSync("python3", ["/app/server/py/convertToWav.py", fileName]);
    let output = pyProgram.stdout.toString();
    console.log("convertToWav.py request content: " + output)
    res.send(output);
})

// For post requests to server (upload.single() = one file, upload.array() = many, upload.any() = zero to many files)
app.post("/saveAudio", upload.single("file"), (req, res) => {
    console.log("'saveAudio' called. Testing POST request: ");
    console.log(req.file, req.body);
    res.send(true);
});

// App listening at port 5000
app.listen(port, () => {
    // Prints out this message to console every time someone accesses server
    console.log(`Server listening at "http://localhost:${port}".`);
});

// Redirect to 404 page if unknown URL
app.use((req, res, next) => {
    res.status(404);
    res.redirect("/404.html");
});


// Backend server test for "test-mediarecorder.js"
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const spawn = require('child_process').spawn;
const path = require("path");      // used for path.join
const fs = require('fs');

// Multer middleware config for naming and storing during file creation using its disk storage engine
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    },
    destination: function (req, file, cb) {
        cb(null, __dirname + '/audio/')
    },
}) 

const upload = multer({ "storage": storage })

// Start up express app and set port
let app = express();
const port = 5000;

//////// APP-RELATED VARIABLES ////////
let filename = "";
const AUDIO_FILEPATH = path.join(__dirname, "audio");

//////// FUNCTIONS ////////

function main() {
    // Middleware being used in server
    app.use(cors());
    app.use(express.static(__dirname));
    // app.use(express.static(path.join(__dirname, "styles")));         // get app to recognize css and js folders
    // app.use(express.static(path.join(__dirname, "scripts")));
    // app.use(express.static(path.join(__dirname, "images")));

    // For handling get requests to server: redirect to webpage (remove demo ones later)
    app.get("/", (req, res) => {          // redirect to chords main page
        res.sendFile("chords/index.html", { root: __dirname });
    });

    app.get("/test-audio", (req, res) => {   // redirect to mediarecorder audio test page
        res.sendFile("test-html/test-mediarecorder.html", { root: __dirname });
    });

    app.get("/test-mic", (req, res) => {   // redirect to waveform mic test page
        res.sendFile("test-html/webAudioTest.html", { root: __dirname });
    });

    app.get("/test-wave", (req, res) => {   // redirect to waveform mic test page
        res.sendFile("test-html/test-wavesurfer.html", { root: __dirname });
    });

    app.get("/mic-demo", (req, res) => {    // Redirect to complete mic demo
        res.sendFile("test-html/micDemo.html", { root: __dirname });
    });

    // For get requests of data (test)
    let test = {title: "Hello Post", text: "Hello World! GET request successful!"}
    app.get("/getHello", (req, res) => {
        res.send(test.text + " someufjdsjanklsfrgahhhh ");
    });

    app.get("/prerecordNotes", (req, res) => {
        const fileName = req.query.file
        console.log(fileName);
        const pyProgram = spawn("python", ["test-html/audioAnalyze.py", fileName]);
    
        pyProgram.stdout.on("data", function(data) {
            let output = data.toString();
            alert("test");
            console.log("audioAnalyze.py request content: " + output);
            console.log(typeof data);
            res.send(output);
            // res.write(data);
            // res.end('end');
        });
    });

    app.post("/clearFiles", (req, res) => {
        fs.readdir(AUDIO_FILEPATH, (err, files) => {
            let audioFiles = [];

            if (err) {
                console.error("Error scanning and clearing files: " + err);
            } else {
                files.forEach((file) => {
                    audioFiles.push(file);
                })

                if (audioFiles.length > 3) {
                    audioFiles.forEach((file) => {
                        fs.unlink(path.join(AUDIO_FILEPATH, file), (err) => {
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

    // For post requests to server (upload.single() = one file, upload.array() = many, upload.any() = zero to many files)
    app.post("/saveAudio", upload.single("file"), (req, res) => {
        console.log("'saveAudio' called. Testing POST request: ");
        console.log(req.file, req.body);
    });

    // App listening at port 5000
    app.listen(port, () => {
        // Prints out this message to console every time someone accesses server
        console.log(`Server listening at "http://localhost:${port}".`);
    });
}

main();


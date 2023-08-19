// Buttons
const recBtn = document.querySelector('.record-btn')
const playBtn = document.querySelector('.play-btn')
const soundClips = document.querySelector('#visuals')

function main() {
    // Check if mediaRecorder is supported in the current browser
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia supported.')
        navigator.mediaDevices.getUserMedia({
            // constraints - only audio needed for this app
            audio: true
        })
        // Success callback
        .then((stream) => {
            record(stream); 
        })

        // Error callback
        .catch(err => {
            console.error(`The following getUserMedia error occurred: ${err}`)
        })
    } else {
        console.log('getUserMedia not supported on your browser!')
    }

}

function record(stream) {
    const record = new MediaRecorder(stream);

    recBtn.addEventListener("click", () => {
        if (record.state == "recording") {
            record.stop();
            console.log(record.state);
            console.log("recorder stopped");
            recBtn.style.background = "";
            recBtn.style.color = "";
        } else {
            record.start();
            recBtn.style.background = "red";
            recBtn.style.color = "black";
        }

    });

    let chunks = [];

    record.ondataavailable = (e) => {
        chunks.push(e.data);
    };

    record.onstop = (e) => {
        const fileName = "audioClip"; // not prompting user to enter filename, as we only want one at all times
        console.log("recorder stopped");
      
        // const fileName = prompt("Enter a name for your sound clip");
      
        // Create and add new HTML elements for audio recording
        const clipContainer = document.createElement("article");
        const clipLabel = document.createElement("p");
        const audio = document.createElement("audio");
        const deleteButton = document.createElement("button");
      
        clipContainer.classList.add("clip");
        audio.setAttribute("controls", "");
        deleteButton.innerHTML = "Delete";
        clipLabel.innerHTML = fileName;
      
        clipContainer.appendChild(audio);
        clipContainer.appendChild(clipLabel);
        clipContainer.appendChild(deleteButton);
        soundClips.appendChild(clipContainer);
      
        // create new audio blob and formdata
        const data = new FormData();
        const blob = new Blob(chunks, { type: "audio/wav "}); //; codecs=mp3" });
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        audio.src = audioURL;
        console.log("testing upload");
        console.log(audio.src, audioURL);

        // Creates file from audio blob
        const file = new File( [ blob ], fileName, { type: "audio/wav" } );
        // const file = new File( [ blob ], fileName, { type: "audio/mpeg"} );
        data.append("file", file, fileName);   // param: name of field entry in formData, actual data, and actual name of file/data

        uploadAudio(data);
        // testGet();
      
        deleteButton.onclick = (e) => {
          let evtTgt = e.target;
          evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
        };
      };
}

async function uploadAudio(formData) {
    fetch("http://localhost:5000/saveAudio", {
        method: "POST",
        body: formData
    })
    .then((response) => console.log(response.status))
    .catch((err) => console.error(err));

    return;
}

async function testGet() {
    fetch("http://localhost:5000/prerecordNotes")
    .then((response) => {
        // let output = JSON.parse(response);
        return response.text();
        // return response.json()
    })
    .then((info) => {
        console.log(info);
    })
}

// async function retrieveAudio(fileName) {
//     fetch("http://localhost:5000/receive/" + fileName)
// }

main();

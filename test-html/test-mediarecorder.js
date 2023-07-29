// Buttons
const recBtn = document.querySelector('.record-btn')
const playBtn = document.querySelector('.play-btn')
const soundClips = document.querySelector('.visuals')

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
            mediaRecorder.stop();
            console.log(mediaRecorder.state);
            console.log("recorder stopped");
            record.style.background = "";
            record.style.color = "";
        } else {
            record.start();
            record.style.background = "red";
            record.style.color = "black";
        }

    });

    mediaRecorder.onstop = (e) => {
        console.log("recorder stopped");
      
        const clipName = prompt("Enter a name for your sound clip");
      
        const clipContainer = document.createElement("article");
        const clipLabel = document.createElement("p");
        const audio = document.createElement("audio");
        const deleteButton = document.createElement("button");
      
        clipContainer.classList.add("clip");
        audio.setAttribute("controls", "");
        deleteButton.innerHTML = "Delete";
        clipLabel.innerHTML = clipName;
      
        clipContainer.appendChild(audio);
        clipContainer.appendChild(clipLabel);
        clipContainer.appendChild(deleteButton);
        soundClips.appendChild(clipContainer);
      
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        audio.src = audioURL;
      
        deleteButton.onclick = (e) => {
          let evtTgt = e.target;
          evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
        };
      };
}

main();
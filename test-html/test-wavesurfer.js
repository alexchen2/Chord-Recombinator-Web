// Wavesurfer.js docs: https://wavesurfer-js.org/docs/classes/wavesurfer.WaveSurfer
// Using hover plugin


import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import Hover from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/hover.esm.js'

// Create an instance of WaveSurfer
const ws = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#3E8DE3',
    progressColor: '#0C2D87',
    url: '../audio/Yoru_ni_kakeru.mp3',   // use ws.load() to load in another audio file later
    plugins: [
        Hover.create({
            lineColor: '#ff0000',
            lineWidth: 2,
            labelBackground: '#555',
            labelColor: '#fff',
            labelSize: '14px',
        }),
    ],
})

const playBtn = document.querySelector(".play-btn");
const destroyBtn = document.querySelector(".destroy-btn")

function main() {
    playBtn.addEventListener("click", () => {
        if (ws.isPlaying()) {
            playBtn.textContent = "Play";
            ws.pause();
        } else {
            playBtn.textContent = "Pause";
            ws.play();
        }
    });

    destroyBtn.addEventListener("click", () => {
        ws.destroy();
        // ws.empty();
    });

    ws.on('finish', () => {
        playBtn.textContent = "Play";
    })
}

main();
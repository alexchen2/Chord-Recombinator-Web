// Imports
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import RecordPlugin from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/record.esm.js'

// Create an instance of WaveSurfer
const wavesurfer = WaveSurfer.create({
    container: '#wavesurf-display',
    waveColor: '#3E8DE3',
    progressColor: '#0C2D87',
    // plugins: [
    //     RecordPlugin.create({})
    // ]
})

// Initialize the Record plugin
const record = wavesurfer.registerPlugin(RecordPlugin.create())
const recBtn = document.querySelector('.record-btn')
const playBtn = document.querySelector('.play-btn')

function main() {
    // Record button
    recBtn.addEventListener('click', () => {
        console.log('test')
        // If currently playing previous recording (if any), stop playback; also disable use of play button until end of recording
        if (wavesurfer.isPlaying) {
            wavesurfer.pause();
        }

        if (record.isRecording()) {
            record.stopRecording();
            recBtn.textContent = 'Record';
            playBtn.disabled = false;
            return
        } 
        
        playBtn.disabled = true;

        record.startRecording().then(() => {
            recButton.textContent = 'Stop';
        });
    })

    playBtn.addEventListener('click', () => { })

    // Play/pause
    wavesurfer.once('ready', () => {
        playBtn.onclick = () => {
            wavesurfer.playPause()
        }
        wavesurfer.on('play', () => {
            playBtn.textContent = 'Pause'
        })
        wavesurfer.on('pause', () => {
            playBtn.textContent = 'Play'
        })
    })
}

main();
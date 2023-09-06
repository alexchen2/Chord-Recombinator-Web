# ChordGuru: A Chord Recombinator Web Application
ChordGuru is a music chord identification/recombination web application for students learning about chords in music theory, as well as composers experimenting with various chord combinations given a group of notes for their compositions. The website functions by prompting the user to enter their desired notes through a multitude of input methods, then analyzing the given information through an Express.js backend server and sending chord combinations to the user through JS's Fetch API. Currently, the input methods supported include: interacting with an virtual piano keyboard; creating an audio recording on the website or drag-and-dropping a pre-recorded audio file; placing and modifying notes through a interactive staff builder; and standard text-like input. 

This project makes use of Node.js and Express.js for the back-end server, while Bootstrap was utilized in front-end to create a responsive webpage design for various devices and browsers. Requests between client-side and server-side are handled through the Fetch API, and audio note parsing is handled through an Yin-FFT pitch detection algorithm in python. The website design was created using Figma, an online interface design tool. 

Other technologies of note include:
- *Wavesurfer.js* & the *Web Audio API* to create waveform visualizations of audio recordings and live audio streams from the microphone,
- *Vexflow* to generate chord results on music staves and to create an interactive staff builder
- *aubio* and *pydub* python libraries for audio pitch detection and file conversion, respectively

The website, which is currently hosted on [glitch.com](https://glitch.com), can be accessed [here](https://chordguru.glitch.me) (updated as of 09/05/2023). Just keep in mind that it might take a bit of time for the page to load at first, if no one has visited it within the past five minutes (one of Glitch's free account limitations for hosting sites with back-end servers).

## How It Works
This is a WIP section for when I've got enough time to sit down and write a description. 

...BUT if you're interested, I would recommend you check the `schematics/` folder in the project root folder for a rough explanation of the logic behind the chord analysis (Scheme_1.png to Scheme_3.png). Further reading of music set theory can be pursued here: 
- [Music Set Theory Basics](https://musictheory.pugetsound.edu/mt21c/SetTheorySection.html)
- [Pitch Class Sets & Normal Form](https://viva.pressbooks.pub/openmusictheory/chapter/pc-sets-normal-order-and-transformations/)
  
Note that basic to moderate music theory knowledge is recommended (so at least RCM Basic Harmony/Level 9 Harmony levels of knowledge) for the above links.

## To-do:
- [x] ~~Create design and add implementation of interactive staff/text field input~~
- [ ] Reorganize/restructure code for certain CSS/JS files
- [ ] Hook up sound to results page in chord info row dropdown
- [ ] Optimize Text/Staff Line input page for mobile devices (specifically the interactive staff line, when changing device orientation from portrait to landscape)
- [ ] Add proper home page, instead of redirecting to chords main page (unlikely to accomplish)

## Run Locally:
Navigate to the root folder of the project and run:
```bash
npm install
npm run startLocal
```  

## Credits:
[Original project](https://github.com/Kchenforyou/Chord-Recominbinator) created by [Kevin Chen](https://github.com/Kchenforyou).

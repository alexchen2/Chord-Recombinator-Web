# Chord-Recombinator-Web
ChordGuru is a music chord identification web application aimed towards students learning about chords in music theory, as well as composers experimenting with various chord combinations given a group of notes for their compositions. The website functions by prompting the user to enter their desired notes through a multitude of input methods, then analyzing the given information through an Express.js backend server and sending chord combinations to the user through JS's Fetch API. Currently, the input methods supported include: interacting with an virtual piano keyboard; creating an audio recording on the website or drag-and-dropping a pre-recorded audio file; placing and modifying notes through a interactive staff builder; and standard text-like input. 

This project makes use of Node.js and Express.js for the backend server, while Bootstrap was utilized in front-end to create a responsive webpage design for various devices and browsers. Requests between client-side and server-side are handled through the Fetch API, and audio note parsing is handled through an Yin-FFT pitch detection algorithm in python. The website design was created using Figma, an online interface design tool.

The website, which is currently hosted on [glitch.com](https://glitch.com), can be accessed [here](https://chordguru.glitch.me) (updated as of 09/05/2023).

## To-do:
- ~~Create design and add implementation of interactive staff/text field input~~
- Hook up sound to results page in chord info row dropdown
- Add proper home page (instead of redirecting to chord subpage) -- unlikely to accomplish

## Credits:
[Original project](https://github.com/Kchenforyou/Chord-Recominbinator) created by [Kevin Chen](https://github.com/Kchenforyou).

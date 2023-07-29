"""
audioAnalyze.py - by Alex Chen

The idea around this is to use both the notes and pitch extractors from the aubio library
to narrow down midi notes values in audio file (using yinfft pitch detection algorithm),
then crosscheck between the results from both aubio.notes and aubio.pitch to find
the most 'prevalent' notes within the recording and hopefully eliminate any unwanted
'noise' or overtones.

The code is heavily based off of the sample code given in the aubio library python doc
example code, since the documentation is so sparse and I have very little knowledge on
pitch detection algorithms, let alone fast fourier transforms.
 
As I have almost no fucking clue on what's going on for at least 25% of the code,
this feature is therefore experimental and may remain as not working properly, as I wouldn't know
what to debug anything related to the aubio library.
"""

# Import sys for getting arg. from node.js backend, as well as needed aubio modules
import os, sys
import numpy as np
from aubio import source, pitch, notes, midi2note
import moviepy.editor as moviepy  # Library just to convert webm to wav

from ogg_to_wav import convert_ogg_to_wav, convert_webm_to_wav

# Detects pitches over entire audio recording INCLUDING silence (value of 0)


def getPitches(file):
    # Unlike sample, no downsampling value used (...it was a value of 1 in sample code anyways)
    # fft size (determines amount of data collected/analyzed in fft?), has to be power of 2
    fftSize = 2 ** 12
    # hop size, # of samples taken between two consecutive analysis.
    hopSize = 2 ** 9
    tolerance = 0.8    # not sure what this is for... maybe confidence/accuracy?

    # Stick to sampleRate = 0 to default to original sampling rate of source; best to prevent crashes...?
    src = source(file, 0, hopSize)
    sampleRate = src.samplerate

    # Using yinfft algorithm
    dataPitches = pitch("yinfft", fftSize, hopSize, sampleRate)
    dataPitches.set_unit("midi")
    dataPitches.set_tolerance(tolerance)

    # total number of frames read
    allPitches = set()
    # confidences = []      # Ignoring confidence values (probably not a good idea...)
    # total_frames = 0
    while True:
        samples, read = src()
        newPitch = dataPitches(samples)[0]

        if (newPitch != 0):
            pitchValue = round(newPitch)
            confidence = dataPitches.get_confidence()    # Not used
            # if confidence < 0.8: pitch = 0.
            # print("%f %f %f" % (total_frames / float(sampleRate), pitch, confidence))
            
            pitchName = midi2note(pitchValue)
            allPitches.add(pitchName)
            # confidences += [confidence]
        
        # totalFrames += read
        # Guessing that if no more samples can be taken (end of file), then break loop
        if (read < hopSize):
            break

    return allPitches

# Detects pitches associated with their musical onset (aka time when they occur) excluding silence (value fo 0)


def getNotes(file):
    # Unlike sample, no downsampling value used (...it was a value of 1 in sample code anyways)
    # fft size (determines amount of data collected/analyzed in fft?), has to be power of 2
    fftSize = 2 ** 9
    # hop size, # of samples taken between two consecutive analysis.
    hopSize = 2 ** 8
    velCutOff = 10

    # Stick to sampleRate = 0 to default to original sampling rate of source; best to prevent crashes...?
    src = source(file, 0, hopSize)
    sampleRate = src.samplerate
    dataNotes = notes("default", fftSize, hopSize, sampleRate)

    
    # totalFrames = 0    # "total number of frames read" ...they say
    allNotes = set()  # Set of all detected notes
    while True:
        samples, read = src()
        # newNote array format: [note midi #, velocity (volumn), previous note]
        newNote = dataNotes(samples)

        # Cut out "pitches" with pitch value of 0 and with a velocity under 10
        if (newNote[0] != 0 and newNote[1] > velCutOff):
            noteValue = newNote[0]
            # note_str = ' '.join(["%.2f" % i for i in newNote])
            # print("%.6f" % (totalFrames/float(sampleRate)), noteValue)

            # Convert midi value into note name and add to set of detected notes
            noteName = midi2note(round(noteValue))
            allNotes.add(noteName)

        # totalFrames += read
        # Guessing that if no more samples can be taken (end of file), then break loop
        if (read < hopSize):
            break

    return allNotes


def main():
    # Take first cmd line argument as audio filename
    if all([i not in sys.argv[1] for i in [".wav", ".ogg", ".webm"]]):    # (".wav" not in sys.argv[1]):
        # If detected filename is not a .wav/.ogg file, then returns -1 to the server to interpret as
        # a wrong file extension error
        print("-1")
        sys.exit()
    else:
        # If .ogg file extension, convert it to .wav
        if (".ogg" in sys.argv[1]):
            filename = convert_ogg_to_wav(sys.argv[1])
        elif (".webm" in sys.argv[1]):
            filename = convert_webm_to_wav(sys.argv[1])
            # filename = os.path.splitext(sys.argv[1])[0]+'.wav'
            
            # clip = moviepy.VideoFileClip(sys.argv[1])
            # clip.audio.write_audiofile(filename)
        else:
            filename = sys.argv[1]
        # print("Success reading .wav audio file!")

    dataNotes = getNotes(filename)
    dataPitches = getPitches(filename)

    dataFinal = dataNotes.intersection(dataPitches)

    # print(dataNotes)
    # print(dataPitches, "\n")
    # print("Final set of notes data: ", dataFinal)
    print(str(dataFinal))

    sys.stdout.flush()


main()

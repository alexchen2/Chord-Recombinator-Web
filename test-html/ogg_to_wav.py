#!/usr/bin/env python2
"""
Author        :Julio Sanz
Website       :www.elarraydejota.com
Email         :juliojosesb@gmail.com
Description   :Convert ogg audio file to wav
Dependencies  :This script has been written using Python 2.7.9
Usage         :python ogg_to_wav.py /path/to/file.ogg
Example       :python ogg_to_wav.py /home/bob/Music/mysong.ogg
License       :GPLv3
"""

import os, sys
from pydub import AudioSegment

orig_song_main = sys.argv[1]
# dest_song_main = os.path.splitext(sys.argv[1])[0]+'.wav'

def convert_ogg_to_wav(origSong):
    destSong = os.path.splitext(origSong)[0]+'.wav'
    song = AudioSegment.from_ogg(origSong)
    song.export(destSong, format="wav")

    return destSong
    
def convert_webm_to_wav(origSong):
    destSong = os.path.splitext(origSong)[0]+'.wav'
    song = AudioSegment.from_file(origSong)
    song.export(destSong, format="wav")

    return destSong

if __name__ == '__main__':
    convert_ogg_to_wav(orig_song_main)
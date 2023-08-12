import os, sys
from pydub import AudioSegment

origSongMain = sys.argv[1]
# destSongMain = os.path.splitext(sys.argv[1])[0]+'.wav'

def convertToWav(origSong):
    destSong = os.path.splitext(origSong)[0]+'.wav'

    match os.path.splitext(origSong)[-1]:
        case "ogg":
            song = AudioSegment.from_ogg(origSong)
        case "webm":
            song = AudioSegment.from_file(origSong)
        case "mp3":
            song = AudioSegment.from_mp3(origSong)

    song.export(destSong, format="wav")
    return destSong


# def convert_ogg_to_wav(origSong):
#     destSong = os.path.splitext(origSong)[0]+'.wav'
#     song = AudioSegment.from_ogg(origSong)
#     song.export(destSong, format="wav")

#     return destSong
    
# def convert_webm_to_wav(origSong):
#     destSong = os.path.splitext(origSong)[0]+'.wav'
#     song = AudioSegment.from_file(origSong)
#     song.export(destSong, format="wav")

#     return destSong

if __name__ == '__main__':
    convertToWav(origSongMain)
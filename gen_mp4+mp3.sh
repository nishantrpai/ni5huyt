# add input.mp4 to input.mp3, if input.mp4 is longer than input.mp3 crop input.mp4 to the length of input.mp3
ffmpeg -i input.mp4 -i input.mp3 -c copy -map 0:v:0 -map 1:a:0 -shortest -t $(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 input.mp3) output.mp4

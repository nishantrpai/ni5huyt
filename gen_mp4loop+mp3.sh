#!/bin/bash

# Usage:
# ./gen_mp4loop+mp3.sh

echo "Getting the duration of input.mp4..."
# Get the duration of input.mp4
video_duration=$(ffprobe -i input.mp4 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp4: $video_duration seconds"

echo "Getting the duration of input.mp3..."
# Get the duration of input.mp3
mp3_duration=$(ffprobe -i input.mp3 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp3: $mp3_duration seconds"

# Calculate the number of loops needed
loop_count=$(echo "($video_duration / $mp3_duration) + 1" | bc)

echo "Creating list file for seamless looping of MP3..."
echo "file 'input.mp3'" > list.txt
for ((i=1; i<$loop_count; i++)); do
    echo "file 'input.mp3'" >> list.txt
done

echo "Creating temporary looped MP3 to match the length of input.mp4..."
ffmpeg -f concat -safe 0 -i list.txt -t "$video_duration" -c copy temp_looped_mp3.mp3

echo "Concatenating temporary looped MP3 with original input.mp3..."
ffmpeg -i temp_looped_mp3.mp3 -i input.mp3 -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1[a]" -map "[a]" final_audio.mp3

echo "Merging input.mp4 with final_audio.mp3..."
ffmpeg -i input.mp4 -i final_audio.mp3 -c:v copy -c:a aac -strict experimental output.mp4

echo "Process completed. Output file: output.mp4"

# Cleanup
rm temp_looped_mp3.mp3
rm final_audio.mp3
rm list.txt

# Note: This script assumes that 'input.mp4' and 'input.mp3' are in the same directory as the script.
# The output will be 'output.mp4' in the same directory.
# The video will freeze on the last frame while the additional audio plays.

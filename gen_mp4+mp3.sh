#!/bin/bash

# Usage:
# ./gen_mp4+mp3.sh

echo "Getting the duration of input.mp3..."
# Get the duration of input.mp3
mp3_duration=$(ffprobe -i input.mp3 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp3: $mp3_duration seconds"

echo "Getting the duration of input.mp4..."
# Get the duration of input.mp4
mp4_duration=$(ffprobe -i input.mp4 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp4: $mp4_duration seconds"

# Calculate the number of loops needed
loop_count=$(echo "($mp3_duration / $mp4_duration) + 1" | bc)

echo "Creating list file for seamless looping..."
echo "file 'input.mp4'" > list.txt
for ((i=1; i<$loop_count; i++)); do
    echo "file 'input.mp4'" >> list.txt
done

echo "Creating temporary looped input video to match the length of input.mp3..."
ffmpeg -f concat -safe 0 -i list.txt -t "$mp3_duration" -vf "fps=60" -c:v libx264 -preset ultrafast -crf 18 temp_looped_input.mp4

echo "Merging temporary looped input video with input.mp3..."
ffmpeg -i temp_looped_input.mp4 -i input.mp3 -c:v copy -c:a aac -strict experimental output1.mp4

echo "Process completed. Output file: output.mp4"
echo "Temporary looped video file: temp_looped_input.mp4"

# Cleanup
rm temp_looped_input.mp4
rm list.txt

# Note: This script assumes that 'input.mp4' and 'input.mp3' are in the same directory as the script.
# The output will be 'output.mp4' in the same directory.
# The temporary looped video file 'temp_looped_input.mp4' is not deleted and can be used for further processing if needed.
# The video is now looped at 60 fps to match the framerate in tampura.js, with no pausing between loops.

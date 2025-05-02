#!/bin/bash

# ./gen_mp4+jpg.sh

echo "Getting the duration of input.mp4..."
# Get the duration of input.mp4
mp4_duration=$(ffprobe -i input.mp4 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp4: $mp4_duration seconds"

echo "Converting input.jpg to a video of the same duration as the audio..."
# Convert the JPG to a video with the same duration as the audio file
ffmpeg -loop 1 -i input.jpg -c:v libx264 -t "$mp4_duration" -vf "fps=30,format=yuv420p" -pix_fmt yuv420p -preset ultrafast -crf 18 temp_image_video.mp4

echo "Merging image video with input.mp4..."
# Merge the image video with the audio file
ffmpeg -i temp_image_video.mp4 -i input.mp4 -c:v copy -map 0:v:0 -map 1:a:0 -c:a aac -strict experimental output.mp4

echo "Process completed. Output file: output.mp4"

# Cleanup
echo "Cleaning up temporary files..."
rm temp_image_video.mp4

echo "Done!"

# Note: This script assumes that 'input.jpg' and 'input.mp4' are in the same directory as the script.
# The output will be 'output.mp4' in the same directory.

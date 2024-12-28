#!/bin/bash

echo "Getting the duration of input.mp3..."
# Get the duration of input.mp3
mp3_duration=$(ffprobe -i input.mp3 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp3: $mp3_duration seconds"

echo "Getting the duration of input.mp4..."
# Get the duration of input.mp4
mp4_duration=$(ffprobe -i input.mp4 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp4: $mp4_duration seconds"

# Calculate speed factor (mp3_duration/mp4_duration) - inverted from original
speed=$(echo "$mp3_duration/$mp4_duration" | bc -l)
echo "Adjusting video speed by factor: $speed"

# Adjust video speed and combine with audio
ffmpeg -i input.mp4 -i input.mp3 -filter:v "setpts=$speed*PTS" -c:a aac -strict experimental output.mp4

echo "Process completed. Output file: output.mp4"

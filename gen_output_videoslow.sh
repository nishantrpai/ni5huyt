#!/bin/bash

# Check if input files exist
if [ ! -f input.mp4 ] || [ ! -f input.mp3 ]; then
    echo "Error: input.mp4 or input.mp3 not found"
    exit 1
fi

# Get the duration of the input audio
audio_duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 input.mp3)

# Calculate the slowdown factor for the video
slowdown_factor=$(echo "scale=6; $audio_duration / $(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 input.mp4)" | bc)

# Create filter complex for slowing down video to match audio duration
filter_complex="[0:v]setpts=${slowdown_factor}*PTS[v]"

# Combine slowed down video and audio
ffmpeg -i input.mp4 -i input.mp3 \
    -filter_complex "$filter_complex" \
    -map "[v]" -map "1:a" \
    -c:v libx264 -crf 23 -preset medium \
    -c:a copy \
    output.mp4

echo "Processing complete. Output saved as output.mp4"
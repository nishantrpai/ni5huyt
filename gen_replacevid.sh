#!/bin/bash

echo "Getting the duration of output.mp4 audio..."
# Get the duration of output.mp4's audio
audio_duration=$(ffprobe -i output.mp4 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of output.mp4 audio: $audio_duration seconds"

echo "Getting the duration of input.mp4..."
# Get the duration of input.mp4
video_duration=$(ffprobe -i input.mp4 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp4: $video_duration seconds"

# Calculate speed factor
speed=$(echo "$audio_duration/$video_duration" | bc -l)
echo "Adjusting video speed by factor: $speed"

# Extract audio from output.mp4
ffmpeg -i output.mp4 -vn -acodec copy audio_temp.aac

# Adjust video speed with frame interpolation and combine with audio
ffmpeg -i input.mp4 -i audio_temp.aac \
-filter_complex "[0:v]setpts=$speed*PTS,fps=60[v]" -map "[v]" -map 1:a \
-c:v libx264 -preset slow -crf 18 -c:a aac outputfinal.mp4

# Clean up temporary file
rm audio_temp.aac

echo "Process completed. Output file: outputfinal.mp4"

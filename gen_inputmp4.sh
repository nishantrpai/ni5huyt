#!/bin/bash

# Check if input file exists
if [ ! -f input.webm ]; then
    echo "Error: input.webm not found"
    exit 1
fi

# Convert input.webm to input.mp4
ffmpeg -i input.webm -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 192k input.mp4

echo "Conversion complete. Output saved as input.mp4"

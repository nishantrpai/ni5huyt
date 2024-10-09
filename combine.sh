#!/bin/bash

# Set the count variable
count=16

# Find all output*.mp4 files and sort them numerically
files=$(ls output*.mp4 | sort -V)

# Create a temporary file list for ffmpeg
echo "$files" | sed 's/^/file /' > filelist.txt

# Combine all videos using ffmpeg
ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4

# Clean up the temporary file list
rm filelist.txt

echo "Combined $count videos into output.mp4"

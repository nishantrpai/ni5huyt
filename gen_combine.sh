#!/bin/bash

# Set the count variable
count=68

# Find all output*.mp4 files, sort them numerically, and limit to $count
files=$(ls output*.mp4 | sort -V | head -n $count)

# Create a temporary file list for ffmpeg
echo "$files" | sed 's/^/file /' > filelist.txt

# Combine videos using ffmpeg
ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4

# Clean up the temporary file list
rm filelist.txt

echo "Combined videos into output.mp4"

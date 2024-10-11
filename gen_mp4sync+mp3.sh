#!/bin/bash

echo "Getting the duration of input.mp3..."
# Get the duration of input.mp3
mp3_duration=$(ffprobe -i input.mp3 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp3: $mp3_duration seconds"

echo "Getting the duration of input.mp4..."
# Get the duration of input.mp4
mp4_duration=$(ffprobe -i input.mp4 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp4: $mp4_duration seconds"

# Analyze the audio frequency of input.mp3
echo "Analyzing the audio frequency of input.mp3..."
ffmpeg -i input.mp3 -filter_complex "showfreqs=s=640x480:mode=line:fscale=log" -frames:v 1 freq.png

# Generate a speed map based on the frequency analysis
echo "Generating speed map based on frequency analysis..."
ffmpeg -i input.mp3 -filter_complex "astats=metadata=1:reset=1,ametadata=print:file=freq.txt" -f null -

# Read the frequency data and adjust the speed of input.mp4 accordingly
echo "Adjusting the speed of input.mp4 based on frequency data..."
awk '/lavfi.astats.Overall.RMS_level/ {print $5}' freq.txt | while read -r level; do
  if (( $(echo "$level > -20" | bc -l) )); then
    speed="1.5"
  elif (( $(echo "$level > -40" | bc -l) )); then
    speed="1.2"
  else
    speed="0.8"
  fi
  echo "Applying speed $speed for frequency level $level..."
  ffmpeg -i input.mp4 -filter:v "setpts=$speed*PTS" -an -y temp.mp4
  mv temp.mp4 input.mp4
done

echo "Merging adjusted input.mp4 with input.mp3..."
ffmpeg -i input.mp4 -i input.mp3 -c:v copy -c:a aac -strict experimental output.mp4

echo "Cleaning up temporary files..."
rm freq.png freq.txt

echo "Process completed. Output file: output.mp4"

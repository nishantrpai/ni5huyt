#!/bin/bash

echo "Getting the duration of input.mp3..."
# Get the duration of input.mp3
mp3_duration=$(ffprobe -i input.mp3 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp3: $mp3_duration seconds"

echo "Getting the duration of input.mp4..."
# Get the duration of input.mp4
mp4_duration=$(ffprobe -i input.mp4 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp4: $mp4_duration seconds"

# If input.mp4 is longer than input.mp3, slow down input.mp4 to match the length of input.mp3
if (( $(echo "$mp4_duration > $mp3_duration" | bc -l) )); then
  echo "input.mp4 is longer than input.mp3. Slowing down input.mp4 to match the length of input.mp3..."
  ffmpeg -i input.mp4 -filter:v "setpts=$(echo "$mp4_duration / $mp3_duration" | bc -l)*PTS" -filter:v "minterpolate='mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=60'" slowed_input.mp4
  echo "Merging slowed input.mp4 with input.mp3..."
  ffmpeg -i slowed_input.mp4 -i input.mp3 -c:v copy -c:a aac -strict experimental output.mp4
  echo "Cleaning up temporary files..."
  rm slowed_input.mp4
else
  # If input.mp4 is shorter, slow down input.mp4 to match the length of input.mp3
  echo "input.mp4 is shorter than input.mp3. Slowing down input.mp4 to match the length of input.mp3..."
  ffmpeg -i input.mp4 -filter:v "setpts=$(echo "$mp3_duration / $mp4_duration" | bc -l)*PTS" -filter:v "minterpolate='mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=60'" slowed_input.mp4
  echo "Merging slowed input.mp4 with input.mp3..."
  ffmpeg -i slowed_input.mp4 -i input.mp3 -c:v copy -c:a aac -strict experimental output.mp4
  echo "Cleaning up temporary files..."
  rm slowed_input.mp4
fi

echo "Process completed. Output file: output.mp4"

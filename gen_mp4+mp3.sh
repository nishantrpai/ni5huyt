#!/bin/bash

echo "Getting the duration of input.mp3..."
# Get the duration of input.mp3
mp3_duration=$(ffprobe -i input.mp3 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp3: $mp3_duration seconds"

echo "Getting the duration of input.mp4..."
# Get the duration of input.mp4
mp4_duration=$(ffprobe -i input.mp4 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp4: $mp4_duration seconds"

# If input.mp4 is longer than input.mp3, crop input.mp4 to the length of input.mp3
if (( $(echo "$mp4_duration > $mp3_duration" | bc -l) )); then
  echo "input.mp4 is longer than input.mp3. Cropping input.mp4 to the length of input.mp3..."
  ffmpeg -i input.mp4 -t "$mp3_duration" -c copy cropped_input.mp4
  echo "Merging cropped input.mp4 with input.mp3..."
  ffmpeg -i cropped_input.mp4 -i input.mp3 -c:v copy -c:a aac -strict experimental output.mp4
  echo "Cleaning up temporary files..."
  rm cropped_input.mp4
else
  # If input.mp4 is shorter, loop input.mp4 to match the length of input.mp3
  echo "input.mp4 is shorter than input.mp3. Looping input.mp4 to match the length of input.mp3..."
  loop_count=$(echo "($mp3_duration / $mp4_duration) + 1" | bc)
  ffmpeg -stream_loop $loop_count -i input.mp4 -t "$mp3_duration" -c copy looped_input.mp4
  echo "Merging looped input.mp4 with input.mp3..."
  ffmpeg -i looped_input.mp4 -i input.mp3 -c:v copy -c:a aac -strict experimental output.mp4
  echo "Cleaning up temporary files..."
  rm looped_input.mp4
fi

echo "Process completed. Output file: output.mp4"

#!/bin/bash

echo "Getting the duration of input.mp3..."
# Get the duration of input.mp3
mp3_duration=$(ffprobe -i input.mp3 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp3: $mp3_duration seconds"

echo "Getting the duration of input.mp4..."
# Get the duration of input.mp4
mp4_duration=$(ffprobe -i input.mp4 -show_entries format=duration -v quiet -of csv="p=0")
echo "Duration of input.mp4: $mp4_duration seconds"

# If input.mp4 is longer than input.mp3, speed up input.mp4 to match the length of input.mp3
if (( $(echo "$mp4_duration > $mp3_duration" | bc -l) )); then
  echo "input.mp4 is longer than input.mp3. Speed up input.mp4 to match the length of input.mp3..."
  speed_factor=$(echo "scale=4; ($mp3_duration / $mp4_duration) * 0.95" | bc -l)
  echo "Speed factor: $speed_factor"
  ffmpeg -i input.mp4 -filter:v "setpts=$speed_factor*PTS" -c:v libx264 -preset ultrafast sped_up_input.mp4
  echo "Merging sped up input.mp4 with input.mp3..."
  ffmpeg -i sped_up_input.mp4 -i input.mp3 -c:v copy -c:a aac -strict experimental output.mp4
  echo "Cleaning up temporary files..."
  rm sped_up_input.mp4
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

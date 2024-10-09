#!/bin/bash

# re-encode both mp4 files to .ts format
ffmpeg -i input.mp4 -c copy -bsf:v h264_mp4toannexb -f mpegts input.ts
ffmpeg -i input2.mp4 -c copy -bsf:v h264_mp4toannexb -f mpegts input2.ts

# concatenate the .ts files and output as mp4
ffmpeg -i "concat:input.ts|input2.ts" -c copy -bsf:a aac_adtstoasc output.mp4

# clean up the intermediate .ts files
rm input.ts input2.ts

echo "Videos concatenated into output.mp4"

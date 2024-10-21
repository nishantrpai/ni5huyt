#!/bin/bash

# Set the count variable
count=$1

# Check if output1.mp4 exists
if [ ! -f output1.mp4 ]; then
    echo "Error: output1.mp4 not found"
    exit 1
fi

# Create $count copies of output1.mp4
for i in $(seq 2 $((count + 1))); do
    cp output1.mp4 "output${i}.mp4"
done

echo "Created $count copies of output1.mp4 (output2.mp4 to output$((count + 1)).mp4)"

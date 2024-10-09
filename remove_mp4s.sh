# remove all mp4 files in the current directory except output.mp4

for file in *.mp4; do
    if [ "$file" != "output.mp4" ]; then
        rm "$file"
    fi
done

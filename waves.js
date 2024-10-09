const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let waves = [];
const numWaves = 5;
let recording = false;
let recorder;
let chunks = [];
let loopDuration = 300; // 5 seconds at 60 fps
let frameCount = 0;
let startTime = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let i = 0; i < numWaves; i++) {
    waves.push({
      amplitude: random(20, 50),
      frequency: random(0.01, 0.01),
      speed: random(0.01, 0.02),
      offset: random(TWO_PI),
      color: color(255,255,255,i*30) // Add a grayscale color for each wave
    });
  }
  setupRecorder();
}

function draw() {
  background(0);
  
  for (let i = 0; i < waves.length; i++) {
    drawWave(i);
    waves[i].offset += waves[i].speed;
  }
  
  if (recording) {
    // Recording is now controlled manually
  }
}

function drawWave(index) {
  let wave = waves[index];
  let y1 = map(index, 0, waves.length - 1, 0, height);
  let y2 = map(index + 1, 0, waves.length - 1, 0, height);
  
  // Draw wave background
  noStroke();
  fill(wave.color);
  beginShape();
  vertex(0, height);
  for (let x = 0; x < width; x++) {
    let y = y2 - sin(x * wave.frequency + wave.offset) * wave.amplitude;
    vertex(x, y);
  }
  vertex(width, height);
  endShape(CLOSE);
  
  // Draw wave line
  noFill();
  // stroke(255, 50);
  beginShape();
  for (let x = 0; x < width; x++) {
    let y = y2 - sin(x * wave.frequency + wave.offset) * wave.amplitude;
    vertex(x, y);
  }
  endShape();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    if (!recording) {
      startRecording();
    } else {
      stopRecording();
    }
  }
}

function setupRecorder() {
  let stream = document.querySelector('canvas').captureStream(60);
  recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  
  recorder.ondataavailable = e => {
    if (e.data.size) {
      chunks.push(e.data);
    }
  };
  
  recorder.onstop = exportVideo;
}

function startRecording() {
  console.log("Recording started");
  chunks = [];
  recording = true;
  startTime = millis();
  
  // Reset wave offsets to create a seamless loop
  for (let wave of waves) {
    wave.offset = random(TWO_PI);
  }
  
  recorder.start();
}

function stopRecording() {
  console.log("Recording stopped");
  recording = false;
  recorder.stop();
}

function exportVideo() {
  let blob = new Blob(chunks, { 'type' : 'video/webm' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  a.download = 'waves_loop.webm';
  a.click();
  window.URL.revokeObjectURL(url);
}

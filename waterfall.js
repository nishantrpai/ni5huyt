const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let waves = [];
const numWaves = 10;
let recording = false;
let recorder;
let chunks = [];
let loopDuration = 300; // 5 seconds at 60 fps
let frameCount = 0;
let startTime = 0;
let inclination = 0.35; // Inclination factor

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let i = 0; i < numWaves; i++) {
    waves.push({
      amplitude: random(10, 15),
      frequency: random(0.01, 0.02),
      speed: -random(0.01, 0.02),
      offset: random(TWO_PI),
      color: color(200, 200, 200, i * 20) // Slightly blue tint for water effect
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
    y += x * inclination; // Add inclination
    vertex(x, y);
  }
  vertex(width, height);
  endShape(CLOSE);
  
  // Draw wave line
  noFill();
  stroke(0, 0);
  beginShape();
  for (let x = 0; x < width; x++) {
    let y = y2 - sin(x * wave.frequency + wave.offset) * wave.amplitude;
    y += x * inclination; // Add inclination
    vertex(x, y);
  }
  endShape();
}

function takeScreenshot() {
  let canvas = document.querySelector('canvas');
  let dataURL = canvas.toDataURL('image/png');
  let a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = dataURL;
  a.download = 'waterfall_screenshot.png';
  a.click();
  document.body.removeChild(a);
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    if (!recording) {
      startRecording();
    } else {
      stopRecording();
    }
  }
  if(key == 's' || key == 'S') {
    takeScreenshot();
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
  a.download = 'waterfall_loop.webm';
  a.click();
  window.URL.revokeObjectURL(url);
}

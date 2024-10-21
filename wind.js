const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let windWaves = [];
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
    windWaves.push({
      amplitude: random(10, 30),
      frequency: random(0.005, 0.015),
      speed: random(0.005, 0.015),
      offset: random(TWO_PI),
      color: color(200, 220, 255, i * 40) // Light blue color for wind
    });
  }
  setupRecorder();
}

function draw() {
  background(0); // Sky blue background
  
  for (let i = 0; i < windWaves.length; i++) {
    drawWindWave(i);
    windWaves[i].offset += windWaves[i].speed;
  }
  
  if (recording) {
    // Recording is now controlled manually
  }
}

function drawWindWave(index) {
  let wave = windWaves[index];
  let y = map(index, 0, windWaves.length - 1, height * 0.2, height * 0.8);
  
  noFill();
  stroke(wave.color);
  strokeWeight(2);
  beginShape();
  for (let x = 0; x < width; x += 5) {
    let windY = y + sin(x * wave.frequency + wave.offset) * wave.amplitude;
    vertex(x, windY);
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
  for (let wave of windWaves) {
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
  a.download = 'wind_waves_loop.webm';
  a.click();
  window.URL.revokeObjectURL(url);
}

// Screenshot functionality from waves.js
function takeScreenshot() {
  let screenshot = document.createElement('canvas');
  screenshot.width = width;
  screenshot.height = height;
  screenshot.getContext('2d').drawImage(canvas, 0, 0, width, height);
  let screenshotUrl = screenshot.toDataURL();
  let a = document.createElement('a');
  a.href = screenshotUrl;
  a.download = 'screenshot.png';
  a.click();
}

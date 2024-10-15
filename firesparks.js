const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let fireParticles = [];
const numFireParticles = 100;
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let i = 0; i < numFireParticles; i++) {
    fireParticles.push({
      x: random(width),
      y: random(height),
      size: random(5, 15),
      speed: random(1, 5),
      angle: random(TWO_PI),
      color: color(255, 165, 0, random(100, 255)) // Orange color for fire
    });
  }
  setupRecorder();
}

function draw() {
  background(0); // Dark background for contrast
  
  for (let fire of fireParticles) {
    drawFire(fire);
    updateFire(fire);
  }
  
  if (recording) {
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
    }
  }
}

function drawFire(fire) {
  fill(fire.color);
  noStroke();
  ellipse(fire.x, fire.y, fire.size);
}

function updateFire(fire) {
  fire.x += cos(fire.angle) * fire.speed;
  fire.y += sin(fire.angle) * fire.speed;
  fire.size *= 0.95; // Gradually shrink the fire particle
  if (fire.size < 0.5) {
    fire.size = random(5, 15);
    fire.x = random(width);
    fire.y = random(height);
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    if (!recording) {
      startRecording();
    } else {
      stopRecording();
    }
  } else if (key === 's' || key === 'S') {
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
  lastLogTime = startTime;
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
  a.download = 'firecrackling_loop.webm';
  a.click();
  window.URL.revokeObjectURL(url);
}

function takeScreenshot() {
  let canvas = document.querySelector('canvas');
  let dataURL = canvas.toDataURL('image/png');
  let a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = dataURL;
  a.download = 'firecrackling_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");

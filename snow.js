const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let snowflakes = [];
const numSnowflakes = 200;
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let i = 0; i < numSnowflakes; i++) {
    snowflakes.push({
      x: random(width),
      y: random(height),
      size: random(2, 8),
      speed: random(1, 3),
      angle: random(PI/4, PI/2),
      color: color(255, 255, 255, random(200, 255)) // White color for snow
    });
  }
  setupRecorder();
}

function draw() {
  background(0, 0, 50); // Dark blue background for night sky
  
  for (let snowflake of snowflakes) {
    drawSnowflake(snowflake);
    updateSnowflake(snowflake);
  }
  
  if (recording) {
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
    }
  }
}

function drawSnowflake(snowflake) {
  fill(snowflake.color);
  noStroke();
  ellipse(snowflake.x, snowflake.y, snowflake.size);
}

function updateSnowflake(snowflake) {
  snowflake.x += cos(snowflake.angle) * snowflake.speed;
  snowflake.y += sin(snowflake.angle) * snowflake.speed;
  
  // Wrap around the screen
  if (snowflake.y > height) {
    snowflake.y = 0;
    snowflake.x = random(width);
  }
  if (snowflake.x > width) {
    snowflake.x = 0;
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
  a.download = 'snowfall_loop.webm';
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
  a.download = 'snowfall_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}

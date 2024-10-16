let grassBlades = [];
let numBlades = 1500; // Reduced number of blades for better performance
let recording = false;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  
  // Initialize grass blades
  for (let i = 0; i < numBlades; i++) {
    grassBlades.push(new GrassBlade());
  }
  setupRecorder(); // Initialize recorder setup
}

function draw() {
  background(0); // Black background
  
  // Draw grass
  for (let blade of grassBlades) {
    blade.update(); // Combine show and wave into a single method
  }
  
  if (recording) {
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
    }
  }
}

class GrassBlade {
  constructor() {
    this.x = random(width);
    this.y = height;
    this.height = random(8, 300); // Reduced max height for performance
    this.controlPoint1 = random(0.3, 0.7);
    this.controlPoint2 = random(0.6, 0.9);
    this.width = random(1, 3); // Slightly narrower blades
    this.baseColor = color(0, 0, random(70, 100));
    this.tipColor = color(0, 0, random(80, 100));
    this.angle = 0;
    this.angleSpeed = random(0.005, 0.02);
  }
  
  update() {
    this.angle = sin(frameCount * this.angleSpeed) * 0.2;
    
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    noStroke();
    
    // Draw blade with gradient and curve (optimized)
    let steps = 10; // Reduced number of steps for drawing the blade
    for (let i = 0; i <= steps; i++) {
      let t = i / steps;
      let inter = lerpColor(this.baseColor, this.tipColor, t);
      fill(inter);
      let x = bezierPoint(0, this.width * this.controlPoint1, this.width * this.controlPoint2, 0, t);
      let y = -this.height * t;
      ellipse(x, y, this.width * (1 - t * 0.7), this.height * 0.1); // Increased height multiplier for fewer, larger ellipses
    }
    
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
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
  a.download = 'grass_effect.webm';
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
  a.download = 'grass_effect_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}

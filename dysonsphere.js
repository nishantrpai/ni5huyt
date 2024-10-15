const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

let spheres = [];
let numSpheres = 5;
let recording = false;
let recorder;
let chunks = [];
let startTime = 0;
let lastLogTime = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, WEBGL);
  colorMode(RGB, 255, 255, 255, 1);
  for (let i = 0; i < numSpheres; i++) {
    spheres.push(new Sphere(0, 0, 0, (i + 1) * 50));
  }
  setupRecorder();
}

function draw() {
  background(0); // Dark background for space
  
  // Set up 3D view
  orbitControl();
  rotateX(frameCount * 0.001);
  rotateY(frameCount * 0.001);
  
  // Update and display the spheres
  for (let sphere of spheres) {
    sphere.update();
    sphere.display();
  }

  if (recording) {
    let currentTime = millis();
    if (currentTime - lastLogTime >= 1000) {
      console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
      lastLogTime = currentTime;
    }
  }
}

class Sphere {
  constructor(x, y, z, radius) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.radius = radius;
    this.rotationX = TWO_PI;
    this.rotationY = random(TWO_PI);
    this.rotationZ = TWO_PI;
    this.speedX = 0;
    this.speedY = 0;
    this.speedZ = 0;
  }
  
  update() {
    this.rotationX += this.speedX;
    this.rotationY += this.speedY;
    this.rotationZ += this.speedZ;
  }
  
  display() {
    push();
    noFill();
    stroke(color(255,255,255,(1 - this.radius/300)));
    strokeWeight(0.25);
    rotateX(this.rotationX);
    rotateY(this.rotationY);
    rotateZ(this.rotationZ);
    sphere(this.radius, 24, 16);
    pop();
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
  recorder = new MediaRecorder(stream, { 
    mimeType: 'video/webm; codecs=vp9',
    videoBitsPerSecond: 16000000 // Increased bitrate for higher quality
  });
  
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
  a.download = 'dyson_sphere_3d.webm';
  a.click();
  window.URL.revokeObjectURL(url);
}

function takeScreenshot() {
  let canvas = document.querySelector('canvas');
  let dataURL = canvas.toDataURL('image/png', 1.0); // Added quality parameter for PNG
  let a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = dataURL;
  a.download = 'dyson_sphere_3d_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}

let rocks = [];
let core;
let gravityStrength = 0.01;
let maxGravity = 0.3;
let rotation = 0;
let recording = false;
let chunks = [];
let recorder;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  core = createVector(0, 0, 0); // In WEBGL mode, (0,0,0) is the center
  for (let i = 0; i < 100; i++) {
    rocks.push(new Rock());
  }
  angleMode(DEGREES);
  setupRecorder();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(10);
  
  // Add ambient light for better 3D visualization
  ambientLight(150);
  pointLight(255, 255, 255, 0, 0, 200);
  
  // Rotate the entire system
  rotateY(rotation);
  rotateX(60); // Tilt for isometric-like view
  rotation += 0.11;

  // Draw the core as a 3D sphere
  push();
  noStroke();
  fill(250,250, 250);
  sphere(20); // belief core
  pop();

  // ramp gravity up to max, then hold
  if (gravityStrength < maxGravity) {
    gravityStrength += 0.0005;
  }

  for (let r of rocks) {
    r.update();
    r.show();
  }
}

class Rock {
  constructor() {
    let angle = random(10);
    let angleY = random(10);
    let radius = random(100, 150);
    
    // Create position using spherical coordinates for true 3D distribution
    let x = radius * sin(angle) * cos(angleY);
    let y = radius * sin(angle) * sin(angleY);
    let z = radius * cos(angle);
    this.pos = createVector(x, y, z);
    
    // tangential velocity for orbit (calculate perpendicular vector)
    let toCenter = p5.Vector.sub(core, this.pos).normalize();
    let perpendicular = createVector(random(-1, 1), random(-1, 1), random(-1, 1));
    perpendicular.cross(toCenter);
    perpendicular.normalize();
    perpendicular.mult(sqrt(maxGravity * 1000 / radius));
    
    this.vel = perpendicular;
    this.acc = createVector(0, 0, 0);
    this.gray = random(10, 100);
    this.size = random(1, 3);
  }

  update() {
    let force = p5.Vector.sub(core, this.pos);
    let d = max(force.mag(), -50,-100); // Use max instead of constrain for proper behavior
    force.setMag((gravityStrength * 2000) / (d * d));
    this.acc = force;
    this.vel.add(this.acc);
    this.vel.limit(20); // prevent instability
    this.pos.add(this.vel);
    if(gravityStrength < 0.5)
      gravityStrength += 0.000001;
    // console.log(gravityStrength);
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();
    // fill(this.gray);
    sphere(this.size);
    pop();
  }
}

// Handle keyboard input for screenshots and recording
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
  a.download = '3d_orbit.webm';
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
  a.download = '3d_orbit_screenshot.png';
  a.click();
  document.body.removeChild(a);
  console.log("Screenshot saved");
}

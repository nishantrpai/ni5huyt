
let stars = [];
let angle = 0;
let orbitRadius = 150;
let coreSize = 120;
let recorder, chunks = [];
let recording = false;

function setup() {
  createCanvas(1280, 720, WEBGL);
  pixelDensity(1);

  for (let i = 0; i < 500; i++) {
    stars.push({
      x: random(-width, width),
      y: random(-height, height),
      z: random(-500, -100),
      size: random(1, 2.5),
      phase: random(TWO_PI),
      speed: random(0.02, 0.06)
    });
  }

  setupRecorder();
}

function draw() {
  background(5, 4, 18);

  // Distant twinkling stars
  push();
  resetMatrix();
  translate(-width / 2, -height / 2);

  noStroke();
  for (let s of stars) {
    let twinkle = map(
      sin(frameCount * s.speed + s.phase),
      -1, 1, 50, 220
    );

    fill(210, 220, 255, twinkle);
    circle(
      s.x + width / 2,
      s.y + height / 2,
      s.size
    );
  }
  pop();

  // Keep the orbit system centered
  push();
  rotateZ(-3);
  // rotateY(frameCount * 0.002);

  // Visible 3D orbital ring
  noFill();
  stroke(255, 255, 255, 25);
  strokeWeight(2);
  rotateY(frameCount * 0.002);
  // circle(0, 0, orbitRadius * 4);
  // rotateX(-PI / 2);

  // Central sphere
  noStroke();
  emissiveMaterial(255, 255, 250,250);
  sphere(coreSize);

  // Soft halo around the sphere
  push();
  noFill();
  stroke(250, 250, 250, 20);
  strokeWeight(.7);
  sphere(coreSize + 5);
  pop();

  // One particle in a circular orbit

  // Sphere orbiting the central planet
  angle += 0.025;

  let x = orbitRadius * cos(angle);
  let z = orbitRadius * sin(angle);

  push();
  translate(x, z, 0);

  noStroke();
  emissiveMaterial(250, 250, 255);
  sphere(8, 24, 16);

  pop();


  pop();

  if (recording && frameCount % 60 === 0) {
    console.log("Recording...");
  }
}

function setupRecorder() {
  let canvas = document.querySelector("canvas");
  if (!canvas || !canvas.captureStream || !window.MediaRecorder) return;

  try {
    let stream = canvas.captureStream(60);
    let options = {};

    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
      options.mimeType = "video/webm;codecs=vp9";
    }

    recorder = new MediaRecorder(stream, options);

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      let blob = new Blob(chunks, { type: "video/webm" });
      let url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = "night_orbit.webm";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  } catch (e) {
    console.warn("Recording unavailable", e);
  }
}

function keyPressed() {
  if (key === "r" || key === "R") {
    if (!recorder) return;

    if (!recording && recorder.state === "inactive") {
      chunks = [];
      recorder.start();
      recording = true;
    } else if (recording && recorder.state === "recording") {
      recorder.stop();
      recording = false;
    }
  }

  if (key === "s" || key === "S") {
    saveCanvas("night_orbit", "png");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

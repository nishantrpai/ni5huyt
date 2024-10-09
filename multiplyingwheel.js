const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 720

let r;
let n = 100;
let factor = -2;
let speed = 1;
let recording = false;
let recorder;
let chunks = [];


function coordinates(i){
  let theta = i * 2 * Math.PI / n;
  return [width/2 + r*Math.cos(theta), height/2 + r*Math.sin(theta)]
}


const fr = 60;

function record() {
  chunks.length = 0;
  
  let canvas = document.querySelector('canvas');
  if (!canvas) {
    console.error('Canvas not found');
    return;
  }
  
  let stream = canvas.captureStream(fr);
  
  recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  
  recorder.ondataavailable = e => {
    if (e.data.size) {
      chunks.push(e.data);
    }
  };
  
  recorder.onstop = exportVideo; 
}


function exportVideo(e) {
  var blob = new Blob(chunks, { 'type' : 'video/webm' });

  // Draw video to screen
  var videoElement = document.createElement('video');
  videoElement.setAttribute("id", Date.now().toString());
  videoElement.controls = true;
  document.body.appendChild(videoElement);
  videoElement.src = window.URL.createObjectURL(blob);
  
  // Download the video 
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  a.download = 'newVid_720p.webm';
  a.click();
  window.URL.revokeObjectURL(url);
}



function keyPressed() {
    
  // toggle recording true or false
  recording = !recording
  console.log(recording);
  
  // 82 is keyCode for r 
  // if recording now true, start recording 
  if (keyIsDown(82) && recording ) {
    
    console.log("recording started!");
    recorder.start();
  } 
  
  // if we are recording, stop recording 
  if (keyIsDown(82) && !recording) {  
    console.log("recording stopped!");
    recorder.stop();
  }
  
}


function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  frameRate(fr);
  r = 0.7 * min(width, height) / 2;
  record();
}

function draw() {
  background(0);
  let gap = factor - int(factor);
  factor += map(gap, 0, 1, speed/100, speed/1000);
  noFill();
  circle(width/2, height/2, 2 * r);
  for (let i=0; i<n; i++){
    let [x1,y1] = coordinates(i);
    //circle(x, y, 10);
    let [x2,y2] = coordinates((i * factor) % n);
    
    let dist = ((x2-x1)**2 + (y2-y1)**2)**0.5;
    let red = map(dist, 0, width, 0, 255);
    let green = 255 - red;
    let blue = 255;
    stroke(red, green, blue);
    strokeWeight(1);
    line(x1, y1, x2, y2);
  }
  speed += 0.00015;
  
  // text(int(factor * 10) / 10, 20, height - 20);
}

    // Start of Selection
    let raindrops = [];
    let recording = false;
    let recorder;
    let chunks = [];
    let startTime = 0;
    let lastLogTime = 0;
    
    function setup() {
      createCanvas(600, 700);
      setupRecorder();
    }
    
    function draw() {
      background("#bfa29c");
      
      // Randomly add new raindrops
      if (random(1) < 0.3) {
        raindrops.push(new Raindrop());
      }
      
      // Update and display raindrops
      for (let i = raindrops.length - 1; i >= 0; i--) {
        raindrops[i].update();
        raindrops[i].display();
        
        if (raindrops[i].isOffscreen()) {
          raindrops.splice(i, 1);
        }
      }
    
      drawWindowFrame();
    
      if (recording) {
        let currentTime = millis();
        if (currentTime - lastLogTime >= 1000) {
          console.log(`Recording time: ${(currentTime - startTime) / 1000} seconds`);
          lastLogTime = currentTime;
        }
      }
    }
    
    function drawWindowFrame() {
      // left wall
      fill("#926863");
      quad(0, 700, 0, 50, 600, 50, 600, 700);
      // window wall
      noStroke();
      fill("#6D494B");
      quad(375, 700, 375, 50, 600, 0, 600, 700);
      // window indent
      fill("#bfa29c");
      quad(400, 400, 400, 95, 550, 60, 550, 430);
      // window glass
      fill("#EAECF0");
      quad(420, 395, 420, 107, 550, 78, 550, 420);
      // window bars
      strokeWeight(10);
      stroke("#bfa29c");
      line(485, 410, 485, 83);
      strokeWeight(9);
      line(420, 255, 550, 245);
      // window indent shadow
      noStroke();
      fill("#a17772");
      quad(420, 107, 400, 95, 550, 60, 550, 78);
      // bar overflow cover
      fill("#6D494B");
      quad(550, 265, 550, 210, 555, 210, 555, 265);
      // window light
      fill("#F1C193");
      quad(150, 465, 150, 170, 350, 120, 350, 415);
      // window bar shadow
      strokeWeight(11);
      stroke("#926863");
      line(252, 440, 252, 140);
      strokeWeight(10);
      line(150, 320, 350, 270);
      // mirror shadow
      fill("#926863");
      push();
      rotate(-0.2);
      ellipse(80, 355, 65, 85);
      pop();
      strokeWeight(8);
      stroke("#926863");
      line(158, 400, 158, 350);
      // dresser shadow
      noStroke();
      fill("#765153");
      quad(0, 700, 0, 425, 75, 400, 75, 700);
      // dresser
      fill("#dabca9");
      quad(77, 700, 77, 400, 323, 400, 323, 700);
      fill("#f2dac0");
      quad(75, 500, 75, 400, 325, 400, 325, 500);
      quad(75, 610, 75, 510, 325, 510, 325, 610);
      quad(75, 700, 75, 620, 325, 620, 325, 700);
      // dresser light
      fill("#FAE7C7");
      quad(140, 480, 140, 400, 236, 400, 236, 455);
      quad(248, 450, 248, 400, 325, 400, 325, 430);
      // mirror frame
      strokeWeight(8);
      stroke("#e2dad0");
      line(175, 390, 175, 350);
      line(160, 396, 190, 396);
      noStroke();
      fill("#e2dad0");
      rotate(-0.2);
      ellipse(105, 350, 65, 85);
      // mirror
      fill("#fcf1de");
      ellipse(105, 350, 55, 75);
      // mirror reflection
      fill("#f7e3d9");
      rotate(-1.4);
      ellipse(-10, 410, 45, 90);
    }
    
    class Raindrop {
      constructor() {
        this.x = random(420, 550);
        this.y = random(-100, -10);
        this.size = random(2, 5);
        this.speed = map(this.size, 2, 5, 1, 3);
        this.length = map(this.size, 2, 5, 10, 20);
        this.opacity = map(this.size, 2, 5, 100, 200);
        this.sliding = false;
        this.slideSpeed = random(0.5, 1.5);
        this.slideAngle = 0;
        this.trailPoints = [];
        this.maxTrailLength = 10;
      }
      
      update() {
        if (!this.sliding) {
          this.y += this.speed;
          if (this.y > 420) {
            this.sliding = true;
            this.slideAngle = random(-PI/6, PI/6);
          }
        } else {
          this.y += this.slideSpeed; // Droplets slide down vertically
          this.trailPoints.unshift({x: this.x, y: this.y});
          
          if (this.trailPoints.length > this.maxTrailLength) {
            this.trailPoints.pop();
          }
        }
      }
      
      display() {
        if (this.sliding) {
          for (let i = 0; i < this.trailPoints.length; i++) {
            let alpha = map(i, 0, this.trailPoints.length - 1, this.opacity, 0);
            stroke(200, 200, 255, alpha);
            strokeWeight(this.size * map(i, 0, this.trailPoints.length - 1, 1, 0.2));
            if (i < this.trailPoints.length - 1) {
              line(this.trailPoints[i].x, this.trailPoints[i].y, 
                   this.trailPoints[i+1].x, this.trailPoints[i+1].y);
            }
          }
        } else {
          stroke(200, 200, 255, this.opacity);
          strokeWeight(this.size);
          line(this.x, this.y, this.x, this.y + this.length);
        }
      }
      
      isOffscreen() {
        return this.x < 420 || this.x > 550 || this.y > 700;
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
      a.download = 'rain_on_window.webm';
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
      a.download = 'rain_on_window_screenshot.png';
      a.click();
      document.body.removeChild(a);
      console.log("Screenshot saved");
    }

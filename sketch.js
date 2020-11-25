let handpose;
let video;
let predictions = [];
let keypoint;

function setup() {
  createCanvas(720, 540);
  video = createCapture(VIDEO);
  video.size(width, height);

  handpose = ml5.handpose(video, modelReady);

  handpose.on("predict", results => {
      //console.log(results);
      predictions = results;
  });

  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  console.log("Model ready!");
}

function draw() {
  image(video, 0, 0, width, height);

  drawCursor();
}

function drawCursor() {
    for (let i = 0; i < predictions.length; i += 1) {
    const prediction = predictions[i];
        for (let j = 0; j < prediction.landmarks.length; j += 1) {
            keypoint = prediction.landmarks[j];
            
            fill(0, 255, 0);
            noStroke();
            ellipse(keypoint[0], keypoint[1], 10, 10);
//            triangle(keypoint[0], keypoint[1], 
//                    keypoint[0]+10, keypoint[1]+30, 
//                    keypoint[0]+30, keypoint[1]+20);
    }
  }
}
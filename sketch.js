let handpose;
let video;
let predictions = [];
let keypoint;
let cx, cy;
let r = 20;

let selections = [];
let responses = [];

let speechInput;

function setup() {
    createCanvas(720, 540);
    let speechRec = new p5.SpeechRec('en-US', gotSpeech);
    
    let continuous = true;
    let interim = false;
    speechRec.start(continuous, interim);
    
    function gotSpeech() {
        speechInput = speechRec.resultString;
        console.log(speechInput);
    }
    
    video = createCapture(VIDEO);
    video.size(width, height);
    
    options = {
        flipHorizontal: true
    }
    
    handpose = ml5.handpose(video, options, modelReady);

    handpose.on("predict", results => {
        //console.log(results);
        predictions = results;
    });

    video.hide();
}

function modelReady() {
  console.log("Model ready!");
}
    
function draw() {
    background(220);
    
    image(video, width/2-120, 360, 240, 180);
    
    let initResponse = new Response('Want cash?', width/2, 150, genOptions);
    initResponse.runFunc();
    
    drawCursor();
}

let genOptions = function() {
    //generate selections
    selections.push(new Selection('No', width/2, height/2));
    selections.push(new Selection('Yes', width/2 - 200, height/2));
    selections.push(new Selection('Maybe', width/2 + 200, height/2));
    
    for (let i = 0; i < selections.length; i++) {
        selections[i].view();
    }
}

function drawCursor() {
    for (let i = 0; i < predictions.length; i += 1) {
    const prediction = predictions[i];
        for (let j = 0; j < prediction.landmarks.length; j += 1) {
            //keypoint1 = prediction.landmarks[5];
            keypoint = prediction.landmarks[8];
            cx = keypoint[0];
            cy = keypoint[1];
            //console.log(keypoint);
            
            fill(0, 255, 0, 126);
            noStroke();
            ellipse(cx, cy, r, r);
    }
  }
}

class Selection {
    constructor(optionText, xPos, yPos, runFunc) {
        this.optionText = optionText;
        this.xPos = xPos;
        this.yPos = yPos;
        this.runFunc = runFunc;
        this.isActive = false;
        this.isSelected = false;
    }
    
    view() {
        rectMode(CENTER);
        //detect hover
        if (handpose.modelReady) {
            if (cx > this.xPos - 50 && cx < this.xPos + 50 && cy > this.yPos - 20 && cy < this.yPos + 20) {
                noFill();
                stroke(0,0,255)
                rect(this.xPos, this.yPos, 110, 50, 5);
                fill(0, 0, 255);
                this.isSelected = true;
            } else {
                fill(0);
            }
        }
        rect(this.xPos, this.yPos, 100, 40, 5);
        fill(255);
        noStroke();
        textSize(12);
        textAlign(CENTER, CENTER);
        text(this.optionText, this.xPos, this.yPos, 100, 40);
    }
    
    select() {
        if (this.isSelected === true) {
            this.runFunc();
        }
    }
}

class Response {
    constructor(responseText, xPos, yPos, runFunc) {
        this.responseText = responseText;
        this.xPos = xPos;
        this.yPos = yPos;
        this.runFunc = runFunc;
        this.isState = false;
    }
    
    write() {
        textSize(50);
        fill(0);
        text(this.responseText, this.xPos, this.yPos);
        this.runFunc();
    }
}
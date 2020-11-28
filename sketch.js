let video;
let poseNet;
let poses = [];

let cx, cy;
let r = 20;

let selections = [];
let responses = [];

let speechRec;
let speechInput;

function setup() {
    createCanvas(720, 540);
    video = createCapture(VIDEO);
    video.hide();
    
    let options = {
        flipHorizontal: true
    }
    
    poseNet = ml5.poseNet(video, options, modelReady);
    
    poseNet.on('pose', (results) => {
        poses = results;
    });

    speechRec = new p5.SpeechRec('en-US', gotSpeech);
    let continuous = true;
    let interim = false;
    speechRec.start(continuous, interim);
    
}

function gotSpeech() {
        speechInput = speechRec.resultString;
        console.log(speechInput);
    }

function drawCursor() {
    if (poses.length > 0) {
        //console.log(poses);
        let mouthPos = poses[0].pose.nose;
        //console.log(mouthPos);
        cx = mouthPos.x;
        cy = mouthPos.y;
        noStroke();    
        fill(0, 255, 0, 126);
        ellipse(cx, cy, r, r);
    }
}

function modelReady() {
  console.log("Model ready!");
}
    
function draw() {
    background(220);
    
    image(video, width/2-120, 360, 240, 180);
    
    let initResponse = new Response('Want cash?', width/2, 150, genOptions);
    initResponse.write();
    initResponse.runFunc();
    
    let speechBox = new Selection('speak here', width/2, height/2 + 50);
    speechBox.view();
    
    drawCursor();
    
    if (speechInput === 'yes') {
        enterPin();
    }
}

let genOptions = function() {
    //generate selections
    selections.push(new Selection('No', width/2, height/2-50));
    selections.push(new Selection('Yes', width/2 - 200, height/2-50));
    selections.push(new Selection('Maybe', width/2 + 200, height/2-50));
    
    for (let i = 0; i < selections.length; i++) {
        selections[i].view();
        selections[i].select();
    }
}

function enterPin() {
    fill(220);
    rect(width/2, 100, width, 300);
    fill(0);
    textSize(50);
    text('Enter your PIN', width/2, 150);
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
        if (poses) {
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
        //console.log(this.optionText);
        //console.log(speechInput);
        if (this.optionText === speechInput) {
            console.log('speech is an option')
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
        //this.runFunc();
    }
}
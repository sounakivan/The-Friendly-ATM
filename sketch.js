let video;
let poseNet;
let poses = [];

let cx, cy;
let r = 20;

let speechRec;
let speechInput;

let ATMsays;
let options = [];
let currentOptions;

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
    
    ATMsays = 'Want Cash?'
    currentOptions = wantCash;

}

function gotSpeech() {
        speechInput = speechRec.resultString;
        console.log(speechInput);
    }

function modelReady() {
    console.log("Model ready!");
}

function drawCursor() {
    
    if (poses.length > 0) {
        //console.log(poses);
        let mouthPos = poses[0].pose.nose;
        //console.log(mouthPos);
        cx = mouthPos.x;
        cy = mouthPos.y + 50;
        noStroke();    
        fill(0, 255, 0, 126);
        ellipse(cx, cy, r, r);
    }
}
    
function draw() {
    background(220);
    //image(video, width/2-120, 360, 240, 180);
    
    let thisScreen = new ScreenState(ATMsays, width/2, 150, currentOptions);
    thisScreen.display();

    //ATM_start();
    //console.log(ATMsays);
    //console.log(newOptions);
    
    drawCursor();
}

//ATM RESPONSE FUNCTIONS

let enterPin = function() {
    ATMsays = 'Enter your PIN'
    currentOptions = pinPad;
}

let whyNot = function() {
    ATMsays = 'Why not?'
    currentOptions = whyNotOpts;
}

//USER SELECTION FUNCTIONS

let wantCash = function() {
    //generate selections
    options.push(new UserSelection('Yes', width/2 - 200, height/2-50, enterPin));
    options.push(new UserSelection('No', width/2, height/2-50, whyNot));
    options.push(new UserSelection('Maybe', width/2 + 200, height/2-50, whyNot));
    
    for (let i = 0; i < options.length; i++) {
        options[i].display();
        options[i].detectSelect();
    }
}

let pinPad = function() {
    //console.log('pin is 8787');
}

let whyNotOps = function() {
    
}

class ScreenState {
    constructor(screenText, xPos, yPos, genOptions) {
        this.screenText = screenText;
        this.xPos = xPos;
        this.yPos = yPos;
        this.genOptions = genOptions;
        this.isState = false;
    }
    
    display() {
        textSize(50);
        fill(0);
        text(this.screenText, this.xPos, this.yPos);
        this.genOptions();
    }
}

//CLASSES

class UserSelection {
    constructor(optionText, xPos, yPos, onSelect) {
        this.optionText = optionText;
        this.xPos = xPos;
        this.yPos = yPos;
        this.onSelect = onSelect;
        this.isActive = false;
        this.isSelected = false;
    }
    
    display() {
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
    
    detectSelect() {
        let lowercaseInput = this.optionText.toLowerCase();
        if (lowercaseInput === speechInput) {
            this.onSelect();
        }
    }
}
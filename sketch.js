let video;
let poseNet;
let poses = [];

let cx = 400, cy = 250;
let r = 20;

let speechRec;
let speechInput;

let ATMsays;
let options = [];
let currentOptions;
let ATMstart = false;

let openingView;
let atmScreen;
let micIcon;
let myFont;

function preload() {
    openingView = loadImage('assets/opening view.png');
    atmScreen = loadImage('assets/atm-screen-view.png');
    myFont = loadFont('assets/PressStart2P-Regular.ttf');
    micIcon = loadImage('assets/mic-icon.png');
}

function setup() {
    createCanvas(800, 500);
    video = createCapture(VIDEO);
    video.hide();
    pixelDensity(1);
    
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
    
    ATMsays = 'Hi there, welcome human. So you want cash?'
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
        fill(255, 150, 0, 126);
        ellipse(cx, cy, r, r);
    }
}
    
function draw() {
    background(220);
    //image(video, width/2-120, 360, 240, 180);
    
    if (ATMstart === false) {
        showBackAlley();
    } else {
        showATMscreen();
        ATMreact();
        drawCursor();
    }
}

function showBackAlley() {
    image(openingView, 0, 0, width, height);
    
    //UI
    push();
    fill(255, 180);
    stroke(0);
    strokeWeight(4);
    rect(40, 300, 300, 180, 10);
    
    fill(0);
    stroke(255);
    strokeWeight(2);
    textSize(18);
    textFont(myFont);
    text('THE LONELY ATM', 60, 340);
    textSize(10);
    text('Stop by for money, advice or just a chat.', 60, 355, 280, 100);
    
    //about button
    if (mouseX > 60 && mouseX < 120 && mouseY > 400 && mouseY < 460) {
        fill(255, 255, 50);
    } else {
        fill(0, 100, 255);
    }
    stroke(0);
    strokeWeight(3);
    rect(60, 400, 60, 60, 30);
    
    fill(255);
    textSize(24);
    text('?', 80, 445);
    
    //interact button
    if (mouseX > 140 && mouseX < 290 && mouseY > 400 && mouseY < 460) {
        fill(50, 255, 255);
    } else {
        fill(200, 100, 255);
    }
    stroke(0);
    strokeWeight(3);
    rect(140, 400, 150, 60, 10);
    
    fill(255);
    textSize(12);
    text('Interact ->', 150, 435);
    pop();
}

function mousePressed() {
    if (ATMstart === false) {
        if (mouseX > 150 && mouseX < 300 && mouseY > 380 && mouseY < 440) {
            ATMstart = true;
        }
    }
}

function showATMscreen() {
    image(atmScreen, 0, 0, width, height);
    
    //draw screen
    push();
    rectMode(CENTER);
    fill(0, 200, 255);
    stroke(0);
    strokeWeight(3);
    rect(width/2, height/2, 600, 350, 10);
    noFill();
    strokeWeight(2);
    rect(width/2, height/2, 620, 370, 10);
    
    rectMode(CORNER);
    noStroke();
    fill(0, 255, 100);
    rect(125, 100, 250, 150, 30);
    stroke(0, 255, 100);
    strokeWeight(2);
    line(175, 250, 175, 300);
    line(175, 300, 250, 350);
    
    if (poses.length > 0) {
        let d = dist(cx, cy, 250, 350);
        if (d < 50) {
            fill(255, 100, 0);
        } else {
            fill(200, 200, 0);
        }
    }
    noStroke();
    ellipse(250, 350, 75);
    image(micIcon, 225, 325, 50, 50);
    pop();
    
    fill(0, 101, 68);
    noStroke();
    textFont(myFont);
    textAlign(LEFT, CENTER);
    textSize(45);
    text('._.', 200, 175);
}

function ATMreact() {
    let thisScreen = new ScreenState(ATMsays, currentOptions);
    thisScreen.display();
}

//ATM RESPONSE FUNCTIONS

let enterPin = function() {
    
    ATMsays = 'Enter your PIN.'
    currentOptions = pinPad;
}

let whyNot = function() {
    ATMsays = 'Why not?'
    currentOptions = whyNotOpts;
}

//USER SELECTION FUNCTIONS

let wantCash = function() {
    //generate selections
    let optYes = new UserSelection('Yes', 550, 250, enterPin);
    let optNo = new UserSelection('No', 550, 300, whyNot);
    let optMaybe = new UserSelection('Maybe', 550, 350, whyNot);
    
    optYes.display();
    optNo.display();
    optMaybe.display();
}

let pinPad = function() {
    //console.log('pin is 8787');
}

let whyNotOps = function() {
    
}

class ScreenState {
    constructor(screenText, showOptions) {
        this.screenText = screenText;
        this.showOptions = showOptions;
        this.isState = false;
    }
    
    display() {
        textSize(20);
        fill(0);
        noStroke();
        textFont(myFont);
        textAlign(LEFT, TOP);
        text(this.screenText, 550, 160, 300, 100);
        this.showOptions();
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
//        if (poses) {
//            if (cx > this.xPos - 50 && cx < this.xPos + 50 && cy > this.yPos - 20 && cy < this.yPos + 20) {
//                noFill();
//                stroke(0,0,255)
//                rect(this.xPos, this.yPos, 210, 50, 5);
//                fill(0, 0, 255);
//                this.isSelected = true;
//            } else {
//                fill(0, o, 255);
//            }
//        }
        fill(0, 0, 255);
        rect(this.xPos, this.yPos, 200, 40, 5);
        fill(255);
        noStroke();
        textSize(12);
        textFont(myFont);
        textAlign(RIGHT, CENTER);
        text(this.optionText, this.xPos, this.yPos, 200, 40);
        
        this.detectSelect();
    }
    
    detectSelect() {
        let lowercaseInput = this.optionText.toLowerCase();
        if (lowercaseInput === speechInput) {
            
            this.onSelect();
        }
    }
}
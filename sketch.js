//posenet
let video;
let poseNet;
let poses = [];

//cursor
let cx = 400, cy = 250;
let r = 20;

//speech API
let speechRec;
let speechInput;

//Atm screen
let ATMsays;
let currentOptions;
let openingView;
let atmScreen;
let micIcon;
let myFont;

//scene transition
let fade;
let fadeAmt = 5;
let ATMstart = true;
let isTransitioning = false;

let pin = [];

function preload() {
    openingView = loadImage('assets/opening view.png');
    atmScreen = loadImage('assets/atm-screen-view.png');
    myFont = loadFont('assets/PressStart2P-Regular.ttf');
    micIcon = loadImage('assets/mic-icon.png');
}

function setup() {
    createCanvas(800, 500);
    pixelDensity(1);
    
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
    
    //intial variables
    fade = 0;
//    ATMsays = 'Hi there, welcome human. So you want cash?'
//    currentOptions = wantCash;
    
    //for testing
    ATMsays = 'Enter your PIN.';
    currentOptions = pinPad;

}

function gotSpeech() {
        speechInput = speechRec.resultString;
        console.log(speechInput);
//        console.log(typeof speechInput);
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

    //scene change
    if (ATMstart === false) {
        showStreetCorner();  
    } else {
        showATMscreen();
        interactWithATM();
        drawCursor();
    }
    //fade
    if (isTransitioning === true) {
        doFade();
    }
    
    //pin input on enter pin screen
    if (pin.length < 5 && ATMstart === true) {
        fill(80);
        noStroke();
        textSize(30);
        textAlign(LEFT, CENTER);
        
        for (let n = 0; n < pin.length; n++) {
            text(pin[n], 440 + 60*n, 120);
        }
    }
}

function showStreetCorner() {
    //reset to intial values
    ATMsays = 'Hi there, welcome human. So you want cash?'
    currentOptions = wantCash;
    speechInput = '';
    
    //BG image
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
    textAlign(LEFT);
    text('THE LONELY ATM', 60, 340);
    textSize(10);
    textAlign(LEFT, TOP);
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
    textAlign(LEFT, CENTER);
    text('?', 80, 435);
    
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
    textAlign(LEFT, CENTER);
    text('Interact ->', 150, 435);
    pop();
}

function mousePressed() {
    if (ATMstart === false) {
        if (mouseX > 150 && mouseX < 300 && mouseY > 380 && mouseY < 440) {
            isTransitioning = true;
        }
    }
}

function doFade() {
    fill(0, fade);
    noStroke();
    rect(0, 0, width, height);
    
    if (fade < 0) {
        fadeAmt = 5;
        isTransitioning = false;
    } 
    if (fade > 255) {
        fadeAmt = -5;
        ATMstart = !ATMstart;
    }
    fade += fadeAmt;
}

function showATMscreen() {
    image(atmScreen, 0, 0, width, height);
    
    //draw screen
    fill(0, 200, 255);
    stroke(0);
    strokeWeight(3);
    rect(100, 75, 600, 350, 10);
    noFill();
    strokeWeight(2);
    rect(90, 65, 620, 370, 10);
    
    //draw ATM face
    noStroke();
    fill(0, 255, 100);
    rect(125, 190, 250, 130, 30);
    
    //draw ATM's ASCI expression
    fill(0, 101, 68);
    noStroke();
    textFont(myFont);
    textAlign(LEFT, CENTER);
    textSize(45);
    text('._.', 200, 265);
    
    //draw mic
    stroke(0, 255, 100);
    strokeWeight(2);
    line(275, 320, 325, 370);
    line(325, 370, 450, 370);
    noStroke();
    strokeWeight(1);
    if (poses.length > 0) {
        let d = dist(cx, cy, 450, 370);
        if (d < 40) {
            fill(255, 255, 0);
            stroke(0, 255, 100);
        } else {
            fill(255, 100, 0);
        }
    }
    ellipse(450, 370, 65);
    image(micIcon, 425, 345, 50, 50);
    noFill();
    ellipse(450, 370, 60);
    ellipse(450, 370, 72);
    ellipse(450, 370, 80);
    
    //instructions
    fill(0, 0, 255);
    noStroke();
    textSize(8);
    textFont(myFont);
    text('Choose an option by reading it out aloud into the mic ->', 135, 315, 150, 100);
}

function interactWithATM() {
    let thisScreen = new ScreenState(ATMsays, 130, 100, 280, 100, currentOptions);
    thisScreen.display();
    
    let bye = new UserSelection('Goodbye', 560, 350, 110, 40, goBackToStreet);
    bye.display();
}

let goBackToStreet = function() {
    if (ATMstart === true) {
        isTransitioning = true;
    }
    //console.log(ATMstart);
}

let wantCash = function() {
    //generate selections
    let optYes = new UserSelection('Yes', 400, 110, 275, 60, enterPin);
    let optNo = new UserSelection('No', 400, 185, 275, 60, whyNot);
    let optMaybe = new UserSelection('Maybe', 400, 260, 275, 60, whyNot);
    
    optYes.display();
    optNo.display();
    optMaybe.display();
}

let enterPin = function() {
    ATMsays = 'Enter your PIN.'
    currentOptions = pinPad;
}

let whyNot = function() {
    ATMsays = 'Why not?'
    currentOptions = whyNotOpts;
}

let pinPad = function() {
    //input box
    fill(255);
    stroke(0, 0, 255);
    strokeWeight(2);
    rect(420, 90, 250, 60, 10);
    fill(0);
    noStroke();
    textSize(30);
    textAlign(LEFT, CENTER);
    text('_ _ _ _', 440, 125);
    
    //numbers
    for (let r = 0; r < 3; r++) {
        for (let i = 0; i < 3; i++) {
            let numCount = (i + 1) + (3 * r);
            let num = new UserSelection('' + numCount, 510 + 55*i, 160 + 55*r, 50, 50, inputNum);
            num.display();
        }
    }
    let num0 = new UserSelection('0', 455, 160, 50, 50, inputNum);
    num0.display();
    let enter = new UserSelection('Enter', 425, 215, 80, 50, enterNum);
    enter.display();
    let cancel = new UserSelection('Cancel', 415, 270, 90, 50, cancelNum);
    cancel.display();
    
    //console.log('entering pin...')
}

let whyNotOps = function() {
    
}

let inputNum = function() {
    
    if (pin.length < 4) {
        pin.push('*');
    }
    
    speechInput = '';
    console.log(pin);
    console.log('entering pin...')
}

let enterNum = function() {
    console.log('num input');
}

let cancelNum = function() {
    pin.length = 0;
}

//CLASSES
class ScreenState {
    constructor(screenText, x, y, wd, ht, showOptions) {
        this.screenText = screenText;
        this.x = x;
        this.y = y;
        this.wd = wd;
        this.ht = ht;
        this.showOptions = showOptions;
    }
    
    display() {
        textSize(16);
        fill(0);
        noStroke();
        textFont(myFont);
        textAlign(LEFT, TOP);
        text(this.screenText, this.x, this.y, this.wd, this.ht);
        this.showOptions();
    }
}

class UserSelection {
    constructor(optionText, xPos, yPos, wd, ht, onSelect) {
        this.optionText = optionText;
        this.xPos = xPos;
        this.yPos = yPos;
        this.wd = wd;
        this.ht = ht;
        this.onSelect = onSelect;
    }
    
    display() {
        fill(0, 0, 255);
        rect(this.xPos, this.yPos, this.wd, this.ht, 5);
        fill(255);
        noStroke();
        textSize(11);
        textFont(myFont);
        textAlign(RIGHT, CENTER);
        text(this.optionText, this.xPos, this.yPos, this.wd, this.ht);
        
        this.detectSelect();
    }
    
    detectSelect() {
        let textInput = this.optionText.toLowerCase(); //turn to lowercase to match speech rec
    
        if (textInput === speechInput) { 
            this.onSelect();
        }
    }
}
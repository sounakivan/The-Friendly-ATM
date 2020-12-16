//posenet
let video;
let poseNet;
let poses = [];

//cursor
let cx = 400, cy = 250;
let r = 40;

//speech API
let speechRec = new p5.SpeechRec();
//speechRec.continuous = false;
//speechRec.interimResults = true;
let speechInput;
let speechProxy;
let textP;

let advice_url = 'https://api.adviceslip.com/advice';
//let adviceSlip = '';

//preload
let openingView;
let atmScreen;
let micIcon;
let cursorIcon;
let myFont;
let glow;
let selectSound;
let checkMark;
let cnvHeight;
let cnvWidth;

//Atm screen
let ATMsays;
let currentOptions;
let asciEmoji = '._.';
let theta = 0;
let emojiY = 175;
let scanner = 0;
let scanY = 90;
let cActive = false;
let startCount = 0;
let count = 6;
let loader = 0;

//scene transition
let fade;
let fadeAmt = 5;
let ATMstart = false;
let isTransitioning = false;
let btnClr;

//cash
let pin = [];
let isPin = true;
let cash = [];
let printingCash = false;
let cashOutput = 0;
let printY = 250;

function preload() {
    openingView = loadImage('assets/opening view.png');
    atmScreen = loadImage('assets/atm-screen-view.png');
    myFont = loadFont('assets/PressStart2P-Regular.ttf');
    micIcon = loadImage('assets/mic-icon.png');
    cursorIcon = loadImage('assets/cursor.png');
    glow = loadImage('assets/glow.png');
    startSound = loadSound('assets/btnchime.mp3');
    selectSound = loadSound('assets/hint.mp3');
    checkMark = loadImage('assets/check.png');
}

function setup() {
    let yourInputHere = createP('What ATM hears: ');
//    yourInputHere.position(20, 10);
    textP = createP('Your speech input will show up here.');
//    textP.position(150, 10);
    
    cnvWidth = windowWidth;
    cnvHeight = 5 / 8 * windowWidth;
    if (windowWidth >= 800) {
        cnvWidth = windowWidth;
        cnvHeight = 5 / 8 * windowWidth;
    } else {
        cnvWidth = 800;
        cnvHeight = 500;
    }
    createCanvas(cnvWidth, cnvHeight);
    pixelDensity(1);
    
    video = createCapture(VIDEO);
    video.hide();
//    let options = {
//        flipHorizontal: true
//    }
    poseNet = ml5.poseNet(video, modelReady);
    poseNet.on('pose', (results) => {
        poses = results;
    });
    
    //speech recognition
    speechRec.start();
    speechRec.onResult = gotSpeech;
    speechRec.onEnd = restartSpeech;
    
    //intial variables
    fade = 0;
    btnClr = color(0, 0, 255);
    
    //for testing
//    ATMsays = 'How much cash you want?'
//    currentOptions = getCashAmt;
}

function windowResized() {
    cnvWidth = windowWidth;
    cnvHeight = 5 / 8 * windowWidth;
    if (windowWidth >= 800) {
        cnvWidth = windowWidth;
        cnvHeight = 5 / 8 * windowWidth;
    } else {
        cnvWidth = 800;
        cnvHeight = 500;
    }
    resizeCanvas(cnvWidth, cnvHeight);
    
}

function restartSpeech() {
    console.log('end');
    speechRec.start();
}

function gotSpeech() {
    let mySpeech = speechRec.resultString;
    speechInput = mySpeech.toLowerCase();
    speechProxy = speechInput;
    console.log(speechInput);
    
    //detect start command
    if (ATMstart === false) {
        if (speechInput === 'go') {
            startSound.amp(0.3);
            startSound.play();
            btnClr = color(0, 150, 0);
            isTransitioning = true;
            speechInput = '';
        }
    }
}

function modelReady() {
    console.log("Model ready!");
}

function drawCursor() {
    if (poses.length > 0) {
        //console.log(poses);
        let mouthPos = poses[0].pose.nose;
        //console.log(mouthPos);
        cx = constrain(mouthPos.x+50, 100, 670);
        cy = constrain(mouthPos.y-100, 65, 390);
        noStroke();    
        fill(255, 150, 0, 126);
        image(cursorIcon, cx, cy, r, r);
    }
}

function draw() {
    background(220);
    
    if (speechProxy === '' || speechProxy == undefined) {
        textP.html('Your speech input will show up here.');
    } else {
        textP.html(speechProxy);
    }

    //scene change
    if (ATMstart === false) {
        showStreetCorner();
    } else {
        showATMscreen();
        initializeATM();
        if (cActive) {
            drawCursor();
        }
        btnClr = color(0, 0, 255); //to reset 'interact' button
    }
    //fade
    if (isTransitioning === true) {
        doFade();
    }
    
    //pin input on enter pin screen
    if (pin.length < 5 && ATMstart === true) {
        fill(20);
        noStroke();
        textSize(30);
        textAlign(LEFT, CENTER);
        
        for (let n = 0; n < pin.length; n++) {
            text(pin[n], width/2+40 + 60*n, 120);
        }
    }
    
    //cash input
    if (cash.length < 9 && ATMstart === true) {
        fill(20);
        noStroke();
        textSize(18);
        textAlign(LEFT, CENTER);
        //console.log(cash)
        for (let n = 0; n < cash.length; n++) {
            push();
            translate(-20*cash.length, 0);
            fill(0);
            text(cash[n], width/2+260 + 20*n, 120);
            pop();
        }
    }
    //if max amt reached
    if (cash.length === 8) {
        fill(255, 0, 0);
        noStroke();
        textSize(18);
        textAlign(LEFT, CENTER);
        text('MAX', width/2+40, 120);
    }
}

function reset() {
    //reset to intial values
    ATMsays = 'Hi there! Smile for the camera as I verify your identity...'
    currentOptions = faceScan;
    asciEmoji = '._.';
    speechInput = '';
    pin = [];
    cash = [];
    cActive = false;
    startCount = 0;
    count = 6;
}

function showStreetCorner() {
    reset();
    
    //BG image and flickering glow
    image(openingView, 0, 0, width, height);
    tint(255,random(100,255))
    image(glow, 0, 0, width, height);
    noTint();
    
    //UI
    push();
    fill(0,150);
    stroke(50);
    strokeWeight(2);
    rect(40, 285, 330, 205, 10);
    fill(0);
    rect(40, 285, 330, 45, 10, 10, 0, 0)
    fill(255);
    noStroke();
    textSize(20);
    textFont(myFont);
    textAlign(LEFT, TOP);
    text('THE FRIENDLY ATM', 45, 300);
    
    fill(255, 100, 0);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);
    text('Get money, advice or just chat!', 60, 345, 300, 100);
    fill(255, 255, 0);
    textSize(9);
    text('Uses webcam and voice input.', 60, 395, 280, 100);
    //text('Read out the text in the button to start.', 60, 385, 260, 100);
    fill(0, 255, 0);
    textSize(12);
    text('To begin, say GO or click -->', 60, 435, 220, 100)
    
    //interact button
    if (mouseX > 280 && mouseX < 355 && mouseY > 425 && mouseY < 475) {
        fill(0, 200, 0);
        cursor(HAND)
    } else {
        fill(btnClr);
        cursor(ARROW)
    }
    stroke(255);
    strokeWeight(1);
    rect(280, 425, 75, 50, 10);
    
    fill(255);
    noStroke();
    textSize(12);
    textAlign(LEFT, CENTER);
    text('Go', 305, 450);
    pop();
}

function mousePressed() {
    if (ATMstart === false) {
        if (mouseX > 280 && mouseX < 355 && mouseY > 425 && mouseY < 475) {
            startSound.amp(0.3);
            startSound.play();
            btnClr = color(0, 150, 0);
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
    
    //rec
    fill(0);
    ellipse(width/2, 33, 50);
    fill(120);
    ellipse(width/2, 33, 20);
    fill(255, 0, 0);
    stroke(0);
    strokeWeight(1)
    ellipse(width/2, 50, 10);
    
    //animate cash output
    cashPrinter();
    
    //draw screen
    fill(0, 200, 255);
    stroke(0);
    strokeWeight(3);
    rect(width/2 - 300, 75, 600, 350, 10);
    noFill();
    strokeWeight(2);
    rect(width/2 - 310, 65, 620, 370, 10);
    
    //draw ATM face
    noStroke();
    fill(0, 255, 100);
    rect(width/2 - 250, 90, 200, 130, 30);
    
    drawEmoji();
    
    //draw mic
//    stroke(0, 255, 100);
//    strokeWeight(2);
//    line(275, 220, 275, 320);
//    line(275, 320, 325, 370);
//    line(325, 370, 450, 370);
//    noStroke();
//    strokeWeight(1);
//    if (poses.length > 0) {
//        let d = dist(cx, cy, 450-(r+10)/2, 370-r/2);
//        if (d < r) {
//            fill(255, 255, 0);
//            stroke(0, 255, 100);
//        } else {
//            fill(0, 255, 100);
//        }
//    }
//    ellipse(450, 370, 65);
//    image(micIcon, 425, 345, 50, 50);
//    noFill();
//    ellipse(450, 370, 60);
//    ellipse(450, 370, 72);
//    ellipse(450, 370, 80);
    
    //speechBubble
    fill(255);
    noStroke();
    rect(width/2 - 285, 230, 265, 180, 10);
    triangle(width/2 - 260, 230, width/2 - 250, 230, width/2 - 240, 200);
}

function cashPrinter() {
    //cash slot
    fill(40);
    stroke(0);
    strokeWeight(3)
    rect(width/2 - 150, 445, 300, 25, 20)
    
    if (printingCash) {
        //console.log('outputting cash...');
        if (cashOutput > 0) {
            fill(0, 101, 68)
            strokeWeight(2);
            rect(width/2-50, printY, 100, 150);
            fill(0, 101, 68)
            strokeWeight(1);
            rect(width/2 - 40, printY+15, 80, 120);
            fill(0, 255, 0);
            textSize(50);
            text('$', width/2 - 20, printY+75);
            printY += 3;
            console.log(cashOutput)
            if (printY >= height) {
                printY = 250;
                cashOutput -= 1;
            }
        }   
    }
    fill(145, 188, 230);
    noStroke();
    rect(width/2 - 200,427,400,15);
    fill(0);
    strokeWeight(3)
    rect(width/2 - 160, 440, 320, 18, 30, 30, 0, 0)
}

function drawEmoji() {
    //draw ATM's ASCI expression
    theta += 0.1;
    emojiY = map(sin(theta), -1, 1, 150, 160);
    fill(0, 101, 68);
    noStroke();
    textFont(myFont);
    textAlign(LEFT, CENTER);
    textSize(45);
    text(asciEmoji, width/2 - 200, emojiY);
}

function initializeATM() {
    let thisScreen = new ScreenState(ATMsays, width/2 - 270, 250, 260, 180, currentOptions);
    thisScreen.display();
    
    if (cActive) {
        let bye = new UserSelection('Goodbye', width/2 + 175, 350, 100, 40, goBackToStreet);
        bye.display();
    }
}

let goBackToStreet = function() {
    if (ATMstart === true) {
        isTransitioning = true;
    }
    //console.log(ATMstart);
}

let faceScan = function() {
    fill(0);
    rect(width/2, 90, 270, 195, 10);
    tint(200, 100, 255, 255);
    image(video, width/2 + 10, 100, 250, 175);
    noTint();
    
    if (!cActive) {
        //scanner
        scanner += 0.05;
        scanY = map(sin(scanner), -1, 1, 100, 275);
        stroke(0, 255, 255);
        strokeWeight(2);
        line(width/2 +10, scanY, width/2 + 250, scanY);
        //timer
        noStroke();
        if (millis() - startCount >= 1000) {
            count -= 1;
            startCount = millis();
        }
        textSize(50);
        fill(255, 255, 100);
        text(count, width/2 + 115, 170);
        setTimeout(cursorActivate, 5000);
//        console.log('scanning...')
    } else {
        //instructions
        textSize(10);
        fill(0,0,255);
        text('How to select:', width/2 -270, 250, 175, 100);
        fill(0);
        text('1. Read out the exact text of the button, OR', width/2 -270, 275, 250, 200);
        text('2. Move the cursor with your head to hover over your choice and say SELECT or CLICK.', width/2 -270, 320, 250, 200)
        ATMsays = '';
        image(checkMark, 490, 150, 100, 100);
        noStroke();
        let next = new UserSelection('Go', width/2 + 175, 300, 100, 40, interact);
        next.display();
    }
}

function cursorActivate() {
    cActive = true;
//    console.log('cursor activiating');
}

function interact() {
    //console.log('loading next');
    asciEmoji = '^_^';
    ATMsays = 'Welcome! Do you want to withdraw cash?';
    currentOptions = wantCash;
}

let wantCash = function() {
    //generate selections
    let optYes = new UserSelection('Yes', width/2, 110, 275, 60, enterPin);
    let optNo = new UserSelection('No', width/2, 185, 275, 60, whyNot);
    let optMaybe = new UserSelection('Maybe', width/2, 260, 275, 60, whyNot);
    
    optYes.display();
    optNo.display();
    optMaybe.display();
}

let whyNot = function() {
    asciEmoji = '`.`';
    ATMsays = 'Why not?';
    currentOptions = whyNotOpts;
}

let whyNotOpts = function() {
    let optSatisfy = new UserSelection('Because money cannot satisfy me', width/2, 110, 275, 60, wantAdvice);
    let optTalk = new UserSelection('Just wanted to talk', width/2, 185, 275, 60, letsTalk);
    let optCash = new UserSelection('Nevermind give me cash', width/2, 260, 275, 60, enterPin);
    optSatisfy.display();
    optTalk.display();
    optCash.display();
}

let wantAdvice = function() {
    asciEmoji = '~_~';
    ATMsays = 'That is true, but money is useful. Want some free advice instead?';
    currentOptions = toAdviceOrNotToAdvice;
}

let toAdviceOrNotToAdvice = function() {
    let optRefuse = new UserSelection('No just give me cash', width/2, 110, 275, 60, enterPin);
    let optAccept = new UserSelection('Okay give me advice', width/2, 185, 275, 60, getAdvice);
    optRefuse.display();
    optAccept.display();
}

let letsTalk = function() {
    asciEmoji = '^_^'
    ATMsays = 'Lets talk while you get cash, or do you want advice instead?';
    currentOptions = letsTalkOpts;
}

let letsTalkOpts = function() {
    let optAdvice = new UserSelection('Give me cash', width/2, 110, 275, 60, enterPin);
    let optTalk = new UserSelection('Give me advice', width/2, 185, 275, 60, getAdvice);
    optAdvice.display();
    optTalk.display();
}

let getAdvice = function() {
    speechInput = '';
    fetch(advice_url)
    .then(response => response.json())
        .then(advice => printAdvice(advice));
}

function printAdvice(advice) {
    let adviceSlip = '' + advice.slip.advice
    //console.log(adviceSlip)
    asciEmoji = '~_~';
    ATMsays = adviceSlip;
    currentOptions = thatHelps;
}

let thatHelps = function() {
    let optHelps = new UserSelection('Okay give me cash', width/2, 110, 275, 60, enterPin);
    let optMore = new UserSelection('Give me more advice', width/2, 185, 275, 60, getAdvice);
    optHelps.display();
    optMore.display();
}

let enterPin = function() {
    asciEmoji = '._.'
    ATMsays = 'Enter your PIN. Your secret is safe with me!'
    isPin = true;
    currentOptions = numPad;
}

let numPad = function() {
    //input box
    fill(255);
    stroke(0, 0, 255);
    strokeWeight(2);
    rect(width/2+20, 90, 250, 60, 10);
    
    if (isPin === true) {
        fill(0);
        noStroke();
        textSize(30);
        textAlign(LEFT, CENTER);
        text('_ _ _ _', width/2+40, 125);
    }
    
    //numbers
    for (let r = 0; r < 3; r++) {
        for (let i = 0; i < 3; i++) {
            let numCount = (i + 1) + (3 * r);
            let num = new UserSelection('' + numCount, width/2 + 110 + 55*i, 160 + 55*r, 50, 50, inputNum);
            num.display();
        }
    }
    let num0 = new UserSelection('0', width/2 +55, 160, 50, 50, inputNum);
    num0.display();
    let enter = new UserSelection('Go', width/2+25, 215, 80, 50, enterNum);
    enter.display();
    let cancel = new UserSelection('Cancel', width/2+15, 270, 90, 50, cancelNum);
    cancel.display();
    
    //cash printer conditions
    if (printingCash === true && cashOutput <= 0) {
        asciEmoji = '._.';
        ATMsays = 'What else can I do for you?'
        currentOptions = userOpts;
    }
}

let inputNum = function() {
    if (isPin === true) {
        if (pin.length < 4) {
            pin.push('*');
            speechInput = '';
        }
        //speechInput = '';
    } else {
        if (cash.length < 8) {
            if (speechProxy === '0','1','2','3','4','5','6','7','8','9') {
                cash.push(speechProxy);
//                console.log(cash);
                //speechInput = '';
            }
        }
    }
}

let enterNum = function() {
    if (isPin === true) {
        if (pin.length <= 3) {
            asciEmoji = '>.<';
            ATMsays = 'I think you are missing a number or two...';
        }
        else if (pin.length > 3 && pin.length < 5) {
            asciEmoji = '^_^';
            ATMsays = 'Good enough! What can I do for you?';
            currentOptions = userOpts;
            pin.length = 0;
        }
    } else {
        if (cash.length === 0) {
            asciEmoji = '~.~';
            ATMsays = 'Dont be shy! Just say a number...';
        }
        else if (cash.length > 0 && cash.length < 9) {
            asciEmoji = '$_$';
            ATMsays = 'Here you go!';
            //currentOptions = userOpts;
            printingCash = true;
            cashOutput = cash.length;
            cash.length = 0;
        }
    }
}

let cancelNum = function() {
    if (isPin === true) {
//        if (pin.length === 0) {
//            asciEmoji = '^_^';
//            ATMsays = 'Welcome! Do you want to withdraw cash?'
//            currentOptions = wantCash;
//        } else {
            pin.length = 0;
            speechInput = '';
//        }
    } else {
//        if (cash.length === 0) {
//            asciEmoji = '^_^';
//            ATMsays = 'What can I do for you?';
//            currentOptions = userOpts;
//        } else {
            cash.length = 0;
            speechInput = '';
//        }
    }
}

let userOpts = function() {
    printingCash = false;
    let optGiveCash = new UserSelection('Give me cash', width/2, 110, 275, 60, getCashAmt);
    let optMyBalance = new UserSelection('How much cash do I have', width/2, 185, 275, 60, notEnough);
    //let optGiveAdvice = new UserSelection('Give me advice', 400, 260, 275, 60, getAdvice);
    optGiveCash.display();
    optMyBalance.display();
    //optGiveAdvice.display();
}

let notEnough = function() {
    let bal = random(1,99999999).toFixed();
    asciEmoji = '$_$';
    ATMsays = 'You have $' + bal + ' but not enough to buy love & happiness.'
    currentOptions = loveAndHappiness;
}

let loveAndHappiness = function() {
    let optOkCash = new UserSelection('Whatever just give me cash', width/2, 110, 275, 60, getCashAmt);
    let optFindLove = new UserSelection('Will I ever find love and happiness', width/2, 185, 275, 60, letItGo);
    optOkCash.display();
    optFindLove.display();
}

let letItGo = function() {
    asciEmoji = '~_~';
    ATMsays = 'Not if you cling to it, and only if you let it go.'
    currentOptions = thanks;
}

let thanks = function() {
    let optThanks = new UserSelection('Thank you ATM I feel better now', width/2, 110, 275, 60, noProblem);
    let optReady = new UserSelection('I am ready to let it go now give me cash', width/2, 185, 275, 60, getCashAmt);
    optThanks.display();
    optReady.display();
}

let noProblem = function() {
    asciEmoji = '^_^';
    ATMsays = 'No problem! What else can I do for you?'
    currentOptions = userOpts;
}

let getCashAmt = function() {
    asciEmoji = '*_*';
    ATMsays = 'Alright! How much cash do you want?'
    isPin = false;
    currentOptions = numPad;
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
        textSize(14);
        fill(0);
        noStroke();
        textFont(myFont);
        textAlign(LEFT, TOP);
        text(this.screenText, this.x, this.y, this.wd-10, this.ht);
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
        this.onHover = false;
    }
    
    display() {
        this.detectSpeechInput();
        this.hoverSelect();
        fill(255);
        noStroke();
        textSize(11);
        textFont(myFont);
        textAlign(RIGHT, CENTER);
        text(this.optionText, this.xPos+10, this.yPos, this.wd-10, this.ht);
    }
    
    detectSpeechInput() {
        let textInput = this.optionText.toLowerCase();
        if (textInput === speechInput) {
            selectSound.amp(0.3);
            selectSound.play();
            setTimeout(this.onSelect, 300);
            speechInput = '';
            fill(0, 255, 0);
        } else {
            fill(0, 0, 255);
        }
    }
    
    hoverSelect() {
       if (poses) {
            if (cx > this.xPos && cx < this.xPos + this.wd && cy > this.yPos && cy < this.yPos + this.ht) {
                noFill();
                stroke(255);
                fill(255, 100, 0);
                rect(this.xPos, this.yPos, this.wd, this.ht, 5);
                if (speechInput === 'click' || speechInput === 'select') {
                    selectSound.amp(0.3);
                    selectSound.play();
                    setTimeout(this.onSelect, 300);
                    speechInput = '';
                    fill(0, 255, 0);
                } else {
                    fill(0, 0, 255);
                }
            } else {
                noStroke();
                fill(0, 0, 255);
                rect(this.xPos, this.yPos, this.wd, this.ht, 5);
            }
        } 
    }
}
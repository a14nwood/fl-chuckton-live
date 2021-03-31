p5.disableFriendlyErrors = true;

var deviceMotionAccess = false;
var mobile = false;

var step = 0;

function request()
{
  console.log("Device Motion Request");
  if (mobile) 
  {
    console.log("requesting");
    // feature detect
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('devicemotion', () => {});
              deviceMotionAccess = true;
            }
          })
          .catch(console.error);
      } else {
        // handle regular non iOS 13+ devices
      }

      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', () => {});
              deviceMotionAccess = true;
            }
          })
          .catch(console.error);
      } else {
        // handle regular non iOS 13+ devices
      }
  }
}

var home = true;
var active = false;

// ~ ~ ~ ~ ~ ~ ~ ~ ~ INPUT STUFF ~ ~ ~ ~ ~ ~ ~ ~ ~
function keyPressed(event)
{
	var keyCode = event.keyCode;
  console.log(keyCode);
    
};

function keyReleased(event)
{
  	var keyCode = event.keyCode;	
};

function preload() {}

var canvas;

function setup() 
{
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) 
  {
    console.log("mobile true");
    mobile = true;
  }

  if (mobile)
  {
    if (requested)
    {
      setShakeThreshold(25);
      setMoveThreshold(3);
    }

    canvas = createCanvas(displayWidth, displayHeight);
  }
  else
  {
    canvas = createCanvas(windowWidth, windowHeight);
  }

  canvas.style('z-index:999');
  canvas.id("myCanvas");

  x = windowWidth/2;
  y = windowHeight/2;

  //setFrameRate(30);
}


var  x, y;
var w = 80;
var h = 80;
var greyscale = 51;

var satTarget = 15;
var sat = 15;

function draw()
{
  colorMode(HSB);
  if (!active) 
  {
      c = color(300, sat, 100, 1.0);
      background(c);
      return;
  }

  // background pink
  sat += (satTarget-sat) * 0.01;
  if (abs(sat - satTarget)<2.0) satTarget = random(1, 30);
  c = color(300, sat, 100, 1.0);
  background(c); // 'hsba(300, 50%, 100%, 1.0)'

  noStroke();

  colorMode(RGB);
  fill(greyscale);

  w *= 0.98;
  h *= 0.98;
  if (w < 20) w = 20;
  if (h < 20) h = 20;
  circle(x, y, w);
}

function windowResized() 
{
  if (mobile) resizeCanvas(displayWidth, displayHeight);
  else        resizeCanvas(windowWidth, windowHeight);
}

function mousePressed()
{

}

function mouseRelease()
{

}

function touchStarted() 
{

}

function touchEnded() 
{
  
}

function touchMoved() 
{
}

function deviceMoved()
{
}

function deviceShaken()
{

}

// WebChucK Communication:
var stepCallback = function ()
{
  if (!active) active = true;
  x += -100 + random(0.,1.) * 200;
  y += -100 + random(0.,1.) * 200;

  if (x < 0) x = 0;
  if (y < 0) y = 0;
  let margin = 150;
  if (x > (windowWidth-margin)) x = windowWidth-margin; 
  if (y > (windowHeight-margin)) y = windowHeight-margin; 
  

  let seed = random(0.,1.);
  h = seed * 150 + 50;
  w = h;

  greyscale = 255.0-seed*100.0;
}


  //document.body.style.overflow = 'hidden';
  //document.getElementById("request").onmousedown = request;
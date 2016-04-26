window.requestAnimationFrame = function () {
    'use strict';
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            function (f) {
                window.setTimeout(f, 1e3 / 60);
            };
};

var Assets = {};
var canvas;
var context;
var canvasWidth = window.innerWidth, canvasHeight = window.innerHeight;
var mouseIsDown = false;
var clickX,clickY;
var releaseX,releaseY;

var activeKeys = [];

var bullets = [];

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function addBullet(){

  // var xValue = inX;
  // var yValue = app.canvas.h-80;
  var theX = player.x;
  var theY = player.y;

  bullets.push({

    beginX : theX,  // Initial x-coordinate
    beginY : theY,  // Initial y-coordinate
    endX : randomIntFromInterval(theX-300,theX+300),   // Final x-coordinate
    endY : randomIntFromInterval(theY-300,theY+300),   // Final y-coordinate
    distX : 0,          // X-axis distance to move
    distY : 0,          // Y-axis distance to move

    w : 30,
    h : 30,

    x : this.beginX,
    y : this.beginY,

    // x : Player.x + Player.w/2,        // Current x-coordinate
    // y : 10,        // Current y-coordinate
    step : 0.02,    // Size of each step along the path
    pct : 0.0,      // Percentage traveled (0.0 to 1.0)

    display : function () {

      this.x = Number(this.x);
      this.y = Number(this.y);

      this.pct += this.step;

      if (this.pct < 1.0) {
        this.x = this.beginX + (this.pct * this.distX);
        this.y = this.beginY + (this.pct * this.distY);
      }

      this.distX = this.endX - this.beginX;
      this.distY = this.endY - this.beginY;

      // // if there are ships in the ship array
      // if(para_squirrels.length > 0){
      // // look to see if the x,y of this bullet is in each of the ships 2d area
      //
      //   for(var i = 0; i<para_squirrels.length; i+=1){
      //
      //     hit = collidePointRect(this.x, this.y,para_squirrels[i].x,para_squirrels[i].y,para_squirrels[i].w,para_squirrels[i].h); //see if the mouse is in the rect
      //
      //     if(hit && !para_squirrels[i].hasBeenHit ){
      //       // console.log("hit",this.x, this.y,para_squirrels[i].x, para_squirrels[i].y, para_squirrels[i].w, para_squirrels[i].h);
      //       para_squirrels[i].hasBeenHit = true;
      //       game.score += 1;
      //       document.getElementById('score').innerHTML = game.score;
      //     } else{
      //
      //     }
      //   }
      //
      // }


      //image(canonball,this.x, this.y,36,36);
      //context.fill();
      //ellipse(this.x, this.y, 36, 36);

      context.beginPath();
      context.arc(this.x, this.y, 3, 0, Math.PI*2, false);
      context.stroke();
      context.closePath();

    }
  });
}




// event delegates
function onMouseMove(evt) {
    'use strict';
    evt.preventDefault();

    if (mouseIsDown) {
        console.log("mouse is down X:" + evt.pageX);

        if (evt.changedTouches && evt.changedTouches.length > 0) {
            player.x = evt.changedTouches[0].pageX;
            player.y = evt.changedTouches[0].pageY;
            player.dx = 0;
            player.dy = 0;

        } else {
            player.x = evt.pageX - 50;
            player.y = evt.pageY;
            player.dx = 0;
            player.dy = 0;
            player.draw();
        }
    }
}

function onMouseStart(e) {
    'use strict';
    e.preventDefault();

    if (e.changedTouches && e.changedTouches.length > 0) {
        clickX = e.changedTouches[0].pageX;
        clickY = e.changedTouches[0].pageY;

    } else {
        clickX = e.pageX;
        clickY = e.pageY;
        // player.x = e.pageX;
        // player.y = e.pageY;
    }

    mouseIsDown = true;
}

function onMouseEnd(e) {
    'use strict';
    e.preventDefault();
    mouseIsDown = false;

    if (e.changedTouches && e.changedTouches.length > 0) {
        releaseX = e.changedTouches[0].pageX;
        releaseY = e.changedTouches[0].pageY;
    } else {
        releaseX = e.pageX;
        releaseY = e.pageY;
    }

    player.x = releaseX;
    player.y = releaseY;

    // velocity hack...
    player.dx = (clickX - releaseX) / 10;
    player.dy = (clickY - releaseY) / 10;
}

function keyCheck(event) {

}

// end event delegates



var game = {
  tempScore:0,
  score:0
};

var coordinates = [
    {x:160,y:160},{x:140,y:140},{x:180,y:140},{x:120,y:120},{x:160,y:120},
    {x:200,y:120},{x:100,y:100},{x:140,y:100},{x:180,y:100},{x:220,y:100}
];

  function drawRotatedImage(image, x, y, angle) {

  	// save the current co-ordinate system
  	// before we screw with it
  	context.save();

  	// move to the middle of where we want to draw our image
  	context.translate(x, y);

  	// rotate around that point, converting our
  	// angle from degrees to radians
  	context.rotate(angle * Math.PI / 180);

  	// draw it up and to the left by half the width
  	// and height of the image
  	context.drawImage(image, -(image.width/2), -(image.height/2));

  	// and restore the co-ords to how they were when we began
  	context.restore();
  }

var squirrelImage = new Image();
squirrelImage.src = "img/home_page_squirrel1.png";

var player = {
    color: "#00A",
    x: parseInt(canvasWidth/2), // start point ... center
    y: parseInt(canvasHeight/2), // start point ... center
    newX:this.x,
    newY:this.y,

    rotation : 0,
    drag : .999,

    dx: 0, // amt to accelerate by -- horizontal
    dy: 0, // amt to accelerate by -- vertical
    width: 20,
    height: 10,
    bullet_number : 20,
    fire_delay: 20,
    fire : function(){
      if(this.bullet_number = this.fire_delay){

        addBullet();
      } else {

      }
      this.bullet_number -= 1;
      if(this.bullet_number<=0){
        this.bullet_number=this.fire_delay;
      }
      console.log(this.bullet_number);

    },
    moveLeft : function(){
      //this.rotation -= 1;
      player.dx -= .05;
    },
    moveRight : function(){
      //this.rotation += 1;
      player.dx += .05;
    },
    moveUp : function(){
      player.dy -= .05;
    },
    moveDown : function(){
      player.dy += .05;
    },
    draw: function () {
      'use strict';

      if (activeKeys[39]) {
          player.moveRight();

      }
      if (activeKeys[37]) {
          player.moveLeft();

      }
      if (activeKeys[38]) {
          player.moveUp();
      }
      if (activeKeys[40]) {
          player.moveDown();
      }
      if (activeKeys[32]) {
          player.fire();
      }

      // add drag...
      player.dy !== 0 ? player.dy *= player.drag : player.dy;
      player.dx !== 0 ? player.dx *= player.drag : player.dx;


      //console.log(player.dx, player.dy);

      if(Math.abs(player.dx) < .01 && Math.abs(player.dy) < .01){
        player.dx = 0;
        player.dy = 0;
      }



      this.newX = this.x += this.dx/3;
      this.newY = this.y += this.dy/3;

      if(this.dx == 0 && this.dy == 0){
        squirrelImage.src = "img/home_page_squirrel1.png";
      } else {
        squirrelImage.src = "img/home_page_squirrel2.png";
      }

      //context.drawImage(squirrelImage, this.x, this.y, 100, 100);

      drawRotatedImage(squirrelImage, this.x, this.y, player.rotation);

      if (this.newX >= (canvasWidth)) {
        this.newY = this.y;
        this.newX = 1;
        //this.dx *= -1;
        //this.dy *= -1;
      } else
      if (this.newX <= 0) {
        this.newY = this.y;
        this.newX = canvasWidth-1;
        // this.dx *= -1;
        // this.dy = 0;
      } else
      if (this.newY >= (canvasHeight)) {
        this.newY = 1;
        this.newX = this.x;
        // this.dx = 0;
        // this.dy = 0;
      } else
      if (this.newY <= 0) {
          this.newY = canvasHeight-1;
          this.newX = this.x;
          // this.dx = 0;
          // this.dy = 0;
      }


      document.getElementById("score").innerHTML = "Landed on : " + parseInt(this.x) + " TempScore : " + parseInt(game.tempScore) + " Score : " + game.score;
          // perfect is 432:
          // score is Math.abs(432-this.x)


      this.x = this.newX;
      this.y = this.newY;
    } // end draw
};

function draw(){
    'use strict';
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    for(var i=0;i<bullets.length; i+=1){

      // if (pins[i].x < player.x + player.width &&
      //    pins[i].x + pins[i].width > player.x &&
      //    pins[i].y < player.y + player.height &&
      //    pins[i].height + pins[i].y > player.y &&
      //    pins[i].status == 1 ) {
      //     // collision detected!
      //     pins[i].status = 0;
      //
      //     game.score += 1;
      // }

      //if(bullets[i].status == 1){
        bullets[i].display();

        if(bullets[i].x <= 15 || bullets[i].y <= 15 || bullets[i].x >= canvasWidth || bullets[i].y >= canvasHeight){
          bullets.splice(i);
        }
      //}

    }

    player.draw();

}







window.addEventListener('load', function() {
    'use strict';
    init();

}, false);

window.addEventListener('keydown', function(e){

console.log(e.keyCode);

  e.preventDefault();

  activeKeys[e.keyCode]=true;

}, false);

window.addEventListener('keyup', function(e){
      e.preventDefault();

      activeKeys[e.keyCode]=false;

}, false);

function init() {
    'use strict';
    canvas = document.createElement('canvas');

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    console.log(canvas.width, canvas.height);

    canvas.id = "gameboard";

    //canvas.style.background = "url(img/gameboard.jpg)";

    document.body.appendChild(canvas);

    // delegates
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mousedown', onMouseStart, false);
    canvas.addEventListener('mouseup', onMouseEnd, false);
    canvas.addEventListener('touchmove', onMouseMove, false);
    canvas.addEventListener('touchstart', onMouseStart, false);
    canvas.addEventListener('touchend', onMouseEnd, false);

    document.addEventListener('keyup', keyCheck, false);

    context = canvas.getContext("2d");

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    var FPS = 30;

    setInterval(function () {
        //update();
        draw();
    }, 1 / FPS);
}

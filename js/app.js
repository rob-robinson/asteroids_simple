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

var astroids = [];
var bullets = [];

var intervalID;

var Xacceleration = [], Yacceleration = [];

for (var i=0; i<360; i+=1) {
	Xacceleration[i]	=	Math.cos(i*Math.PI/180);
	Yacceleration[i]	=	Math.sin(i*Math.PI/180);
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function addBullet(){

  var theX = player.x;
  var theY = player.y;

  //console.log(Xacceleration[rotation], Yacceleration[rotation]);
  //console.log(Xacceleration, player.rotation, Xacceleration[player.rotation]);

  var rotation = player.rotation;

  bullets.push({

    beginX : theX,  // Initial x-coordinate
    beginY : theY,  // Initial y-coordinate
    // endX : randomIntFromInterval(theX-launchInterval,theX+launchInterval ),   // Final x-coordinate
    // endY : randomIntFromInterval(theY-launchInterval,theY+launchInterval),   // Final y-coordinate
    dx : Xacceleration[rotation],
    dy : Yacceleration[rotation],
    distX : 0,          // X-axis distance to move
    distY : 0,          // Y-axis distance to move

    //color : "#" + randomIntFromInterval(0,9) + "" + randomIntFromInterval(0,9) + "" + randomIntFromInterval(0,9) + "" + randomIntFromInterval(0,9) + "" + randomIntFromInterval(0,9) + "" + randomIntFromInterval(0,9),
    //color : "rgb("+randomIntFromInterval(0,255)+","+randomIntFromInterval(0,255)+","+randomIntFromInterval(0,255)+")",

    color : bullet_colors[bullet_color_index++],
    w : 4,
    h : 4,

    x : theX,
    y : theY,

    display : function () {

      if(bullet_color_index == bullet_colors.length){
        bullet_color_index = 0;
      } else {

      }

      this.x += this.dx;
      this.y += this.dy;

      // if there are ships in the ship array
      if(astroids.length > 0) {
      // look to see if the x,y of this bullet is in each of the ships 2d area

        for(var i = 0; i<astroids.length; i+=1){
          var hit = false;
          if(astroids[i].x < this.x + this.w &&
             astroids[i].x + astroids[i].w > this.x &&
             astroids[i].y < this.y + this.w &&
             astroids[i].h + astroids[i].y > this.y &&
             astroids[i].status == 1 ) {
             //hit = true;
             astroids[i].status = 0;
             console.log(astroids[i]);
           }

          if(astroids[i].status == 0 && !astroids[i].hasBeenHit ){
            console.log("hit");
            astroids[i].hasBeenHit = true;
            game.score += 1;
            document.getElementById('score').innerHTML = game.score;
          }
        }

      }

      context.beginPath();
      context.arc(this.x, this.y, this.w, 0, Math.PI*2, false);

      context.fillStyle = this.color;
      context.fill();

      context.closePath();



    }
  });
}

var delay_count = 0;
var delay = 5;

var game = {
  tempScore:0,
  score:0
};


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

var bullet_colors = ['red','orange','yellow','green','blue','purple','black'];
var bullet_color_index = 0;

var astroidImageTmp;
var astroidImages = [];

for(var i=0;i<4;i+=1){
  astroidImageTmp = new Image()
  astroidImageTmp.src = "img/astroid0" + i + ".png";
  astroidImages.push(astroidImageTmp);
}


var shipImage = new Image();
shipImage.src = "img/ship.png";

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
        addBullet();
    },
    moveLeft : function(){
      this.rotation -= 1;
      //this.rotation %= 360;

      if(this.rotation < 0) {
      	this.rotation += 360;
      }

    },
    moveRight : function(){
      this.rotation += 1;
      //this.rotation %= 360;

      if(this.rotation >= 360){
      	this.rotation -= 360;
      }
    },
    moveUp : function(){
      this.dx -= Xacceleration[this.rotation]/10;
      this.dy -= Yacceleration[this.rotation]/10;
    },
    moveDown : function(){
      this.dx += Xacceleration[this.rotation]/10;
      this.dy += Yacceleration[this.rotation]/10;
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
          player.moveDown();
      }
      if (activeKeys[40]) {

          player.moveUp();
      }
      if (activeKeys[32]) {
        if(delay_count == 0){
          player.fire();
        }
      }

      if(delay_count == delay){
        delay_count = 0;
      } else {
        delay_count += 1;
      }

      // add drag...
      player.dy !== 0 ? player.dy *= player.drag : player.dy;
      player.dx !== 0 ? player.dx *= player.drag : player.dx;

      if(Math.abs(player.dx) < .01 && Math.abs(player.dy) < .01){
        player.dx = 0;
        player.dy = 0;
      }

      this.newX = this.x += this.dx/3;
      this.newY = this.y += this.dy/3;

      shipImage.src = "img/ship.png";

      drawRotatedImage(shipImage, this.x, this.y, player.rotation);

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

      document.getElementById("score").innerHTML =
        "astroids : " + astroids.length + " ... " +
        "bullets : " + bullets.length;

      this.x = this.newX;
      this.y = this.newY;
    } // end draw
};

function draw(){
    //'use strict';
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    for(var i=0;i<bullets.length; i+=1){
      bullets[i].display();

        if(
          bullets[i].x <= 1 ||
          bullets[i].y <= 1 ||
          bullets[i].x >= canvasWidth ||
          bullets[i].y >= canvasHeight ) {
            bullets.splice(i,1);
        }

    }

    for(var i = 0; i < astroids.length; i+=1){
      astroids[i].display();

      if(astroids[i].x < 0) {
        astroids[i].x = canvasWidth-1;
      }

      if(astroids[i].y < 0) {
        astroids[i].y = canvasHeight-1;
      }

      if(astroids[i].x >= canvasWidth) {
        astroids[i].x = 2;
      }

      if(astroids[i].y >= canvasHeight) {
        astroids[i].y = 2;
      }

      if(astroids[i].hasBeenHit){
        astroids.splice(i,1);
      }
    }

    player.draw();
}

window.addEventListener('load', function() {
    'use strict';
    init();
}, false);

window.addEventListener('keydown', function(e){
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

    canvas.id = "gameboard";

    document.body.appendChild(canvas);

    context = canvas.getContext("2d");

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    var FPS = 30;

    intervalID = window.setInterval(function(){

      var rand_start_x = randomIntFromInterval(10,canvasWidth-10);
      var rand_start_y = randomIntFromInterval(10,canvasHeight-10);
      var imageIndex = randomIntFromInterval(0,3);

      astroids.push({
        beginX : rand_start_x,  // Initial x-coordinate
        beginY : rand_start_y,  // Initial y-coordinate

        dx : (Math.random() * 2) - 1,
        dy : (Math.random() * 2) - 1,

        hasBeenHit : 0,
        status : 1,

        w : 100,
        h : 100,

        x : rand_start_x,        // Current x-coordinate
        y : rand_start_y,        // Current y-coordinate

        display : function () {

          drawRotatedImage(astroidImages[imageIndex],this.x,this.y,0);

          this.x += this.dx;
          this.y += this.dy;
        }
      });

  }, 1000);

    setInterval(function () {
        //update();
        draw();
    }, 1 / FPS);
}

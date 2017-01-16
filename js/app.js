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

//var Assets = {};
var canvas;
var context; //

var max_asteroids;

var canvasWidth = window.innerWidth, canvasHeight = window.innerHeight;
//var mouseIsDown = false;
// var clickX,clickY;
// var releaseX,releaseY;

/*
TODO: some how I have to have the controls for this game be used by touching
the bottom parts of the screen as well...
*/

// array of keys that are currently pressed
var activeKeys = [];

var asteroids = [];
var bullets = [];

// this is the id of the setInterval that launches asteroids...
var intervalID;

// an set of arrays to hold sine and cosine values for less computation in draw
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

  var starting_x = player.x;
  var starting_y = player.y;

  var rotation = player.rotation;

  bullets.push({

    beginX : starting_x,  // Initial x-coordinate
    beginY : starting_y,  // Initial y-coordinate
    // endX : randomIntFromInterval(starting_x-launchInterval,starting_x+launchInterval ),   // Final x-coordinate
    // endY : randomIntFromInterval(starting_y-launchInterval,starting_y+launchInterval),   // Final y-coordinate
    dx : Xacceleration[rotation],
    dy : Yacceleration[rotation],
    distX : 0,          // X-axis distance to move
    distY : 0,          // Y-axis distance to move

    //color : "#" + randomIntFromInterval(0,9) + "" + randomIntFromInterval(0,9) + "" + randomIntFromInterval(0,9) + "" + randomIntFromInterval(0,9) + "" + randomIntFromInterval(0,9) + "" + randomIntFromInterval(0,9),
    //color : "rgb("+randomIntFromInterval(0,255)+","+randomIntFromInterval(0,255)+","+randomIntFromInterval(0,255)+")",

    color : bullet_colors[bullet_color_index++],
    w : 4,
    h : 4,

    x : starting_x,
    y : starting_y,

    display : function () {

      if(bullet_color_index == bullet_colors.length){
        bullet_color_index = 0;
      } else {

      }

      this.x += this.dx;
      this.y += this.dy;

      // if there are ships in the ship array
      if(asteroids.length > 0) {
      // look to see if the x,y of this bullet is in each of the ships 2d area

        for(var i = 0; i<asteroids.length; i+=1){
          var hit = false;
          if(asteroids[i].x < this.x + this.w &&
             asteroids[i].x + asteroids[i].w > this.x &&
             asteroids[i].y < this.y + this.w &&
             asteroids[i].h + asteroids[i].y > this.y &&
             asteroids[i].status == 1 ) {
             //hit = true;
             asteroids[i].status = 0;
             console.log(asteroids[i]);
           }

          if(asteroids[i].status == 0 && !asteroids[i].hasBeenHit ){
            console.log("hit");
            asteroids[i].hasBeenHit = true;
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

var bullet_delay_count = 0;
var bullet_delay = 5;

var game = {
  tempScore:0,
  score:0
};


  function drawRotatedImage(image, x, y, angle, w, h) {

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

var explosionImage = new Image();
explosionImage.src = "img/explosion.png";

var astroidImageTmp;
var astroidImages = [];

for(var i=0;i<4;i+=1){
  astroidImageTmp = new Image()
  astroidImageTmp.src = "img/asteroid0" + i + ".png";
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
        if(bullet_delay_count == 0){
          player.fire();
        }
      }

      if(bullet_delay_count == bullet_delay){
        bullet_delay_count = 0;
      } else {
        bullet_delay_count += 1;
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
        "asteroids : " + asteroids.length + " ... " +
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

    for(var i = 0; i < asteroids.length; i+=1){
      asteroids[i].display();

      if(asteroids[i].x < 0) {
        asteroids[i].x = canvasWidth-1;
      }

      if(asteroids[i].y < 0) {
        asteroids[i].y = canvasHeight-1;
      }

      if(asteroids[i].x >= canvasWidth) {
        asteroids[i].x = 2;
      }

      if(asteroids[i].y >= canvasHeight) {
        asteroids[i].y = 2;
      }

      if(asteroids[i].hasBeenHit &&
        (asteroids[i].x > canvasWidth-10 || asteroids[i].x < 10 || asteroids[i].y > canvasHeight-10 || asteroids[i].y < 10)
      ){

        asteroids.splice(i,1);
      }

    if(asteroids[i].hasBeenHit && asteroids[i].w<10){

      asteroids.splice(i,1);
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

    max_asteroids = 30;

    intervalID = window.setInterval(function(){

        if(asteroids.length < max_asteroids) {

            var rand_start_x = randomIntFromInterval(10, canvasWidth - 10);
            var rand_start_y = randomIntFromInterval(10, canvasHeight - 10);
            var imageIndex = randomIntFromInterval(0, 3);
            var rand_rotation = randomIntFromInterval(0, 359);

            asteroids.push({
                beginX: rand_start_x,  // Initial x-coordinate
                beginY: rand_start_y,  // Initial y-coordinate

                dx: (Math.random() * 2) - 1,
                dy: (Math.random() * 2) - 1,

                hasBeenHit: 0,
                status: 1,

                rotation: rand_rotation,

                w: 100,
                h: 100,

                x: rand_start_x,        // Current x-coordinate
                y: rand_start_y,        // Current y-coordinate

                rotation_delay_count: 0,
                rotation_delay: randomIntFromInterval(0, 50),

                display: function () {

                    if (this.hasBeenHit) {
                        //drawRotatedImage(explosionImage,this.x,this.y,rand_rotation,100,100);
                        context.drawImage(explosionImage, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
                        this.w *= .996;
                        this.h *= .996;

                    } else {
                        if (this.rotation_delay == this.rotation_delay_count) {
                            drawRotatedImage(astroidImages[imageIndex], this.x, this.y, this.rotation++);
                            this.rotation_delay_count = 0;
                        } else {
                            drawRotatedImage(astroidImages[imageIndex], this.x, this.y, this.rotation);
                        }
                    }

                    this.x += this.dx;
                    this.y += this.dy;

                    this.rotation_delay_count += 1;
                }
            });
        }

  }, 1000);

    setInterval(function () {
        //update();
        draw();
    }, 1 / FPS);
}

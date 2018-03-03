//starting game//
var game = new Game();

function init() {
  if (game.init()) {
    console.log("hi")
    game.startGame();
  }
};


var images = new function() {
  this.background = new Image();
  this.vonStroke = new Image();
  this.shot = new Image();
  this.grenade = new Image();
  this.plane = new Image();

  var imageTotal = 5;
  var loadedImg = 0;

  function imgLoad() {
    loadedImg++;
    if (loadedImg === imageTotal) {
      window.init();
    }
  }
  this.background.onload = function() {
    imgLoad();
  }
  this.vonStroke.onload = function() {
    imgLoad();
  }
  this.shot.onload = function() {
    imgLoad();
  }

  this.grenade.onload = function() {
    imgLoad();
  }

  this.plane.onload = function() {
    imgLoad();
  }


   this.background.src = "https://wallpapertag.com/wallpaper/full/e/0/6/345851-8-bit-background-1920x1080-for-iphone-7.jpg";

  this.vonStroke.src = "http://piq.codeus.net/static/media/userpics/piq_63249_400x400.png";

  this.shot.src = "http://www.extrafeet.com/stickers/images/stixels_fire_small.gif";


this.grenade.src = "http://pixelartmaker.com/art/796c8aedf632be7.png";

this.plane.src = "http://www.air-industries.com/Images/airplane.png";

  };

function Draw() {
  this.init = function(x, y, width, height) {

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  this.speed = 0;
  this.canvasHeight = 0;
  this.canvasWidth = 0;

  this.draw = function() {

  }
  this.move = function() {

  }
};

function Pool(max) {
      console.log("pool")

  var size = max;
  var pool = [];

  this.init = function(obj) {
    console.log("init")
    if (obj === "hero") {
          for (var i=0; i < size; i++) {
           var shot = new Shot("hero");
           shot.init(0,0, 40, 40);
           pool[i] = shot;
          }
     }
    else if (obj === "grenade") {
         for (var i=0; i < size; i++) {
          var grenade = new Shot("grenade");
          grenade.init(0,0, 40, 40);
          pool[i] = grenade;
        }
    }
        else if (obj === "plane") {
         for (var i=0; i < size; i++) {
          var plane = new Plane();
          plane.init(0,0, 40, 40);
          pool[i] = plane;
        }
    }

  };

  this.get = function(x, y, speed) {
    if (!pool[size -1].alive) {
      pool[size - 1].spawn(x, y, speed);
      pool.unshift(pool.pop());
    }
  };

  this.getTwo = function(x1, y1, speed1, x2, y2, speed2) {
		if(!pool[size - 1].alive &&
		   !pool[size - 2].alive) {
				this.get(x1, y1, speed1);
				this.get(x2, y2, speed2);
			 }
	};

  this.animate = function() {
    for (var i = 0; i < size; i++) {
      if (pool[i].alive) {
        if (pool[i].draw()) {
          pool[i].clear();
          pool.push((pool.splice(i, 1))[0]);
        }
      }
      else {
        break;
      }
    }
  };
};


function Shot(obj) {
  this.alive = false;
  var type = obj;

  this.spawn = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.alive = true;
  };

  this.draw = function() {
    this.context.clearRect(this.x, this.y, this.width, this.height);
    this.y -= this.speed;
    if (type === "hero" && this.y <= 0 - this.height) {
      return true;
    }
    else if (type === "grenade" && this.y >= this.canvasHeight) {
      return true;
    }
    else {
      if (type === "hero") {
        this.context.drawImage(images.shot, this.x, this.y, 50, 50);
      }
      else if (type === "grenade") {
        this.context.drawImage(images.grenade, this.x, this.y, 50, 50);

      }
      return false;
    }
  };

  this.clear = function() {
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.alive = false;
  };
}

Shot.prototype = new Draw();

function VonStroke() {

  this.speed = 3;
  this.bulletPool = new Pool(30);
  this.bulletPool.init("hero");
  var firingRate = 15;
  var count = 0;
  this.draw = function() {
    console.log(this.x)
    this.context.drawImage(images.vonStroke, this.x, this.y, 80, 80);

  };

  this.move = function() {
    count++;

    if (KEY_STATUS.left || KEY_STATUS.right) {
      console.log("hi")
      this.context.clearRect(this.x, this.y, this.width, this.height);

      if (KEY_STATUS.left) {
        this.x -= this.speed
        if (this.x <= 0) {
          this.x = 0;
        }
      }
       else if (KEY_STATUS.right) {
          this.x += this.speed
          if (this.x >= this.canvasWidth - this.width) {
            this.x = this.canvasWidth - this.width;
          }
        }
      this.draw();
    }
    if (KEY_STATUS.space && count >= firingRate) {
      this.shoot();
      count = 0;
    }
  }
  this.shoot = function() {
    this.bulletPool.getTwo(this.x+6, this.y, 3, this.x+33, this.y, 3);
  }
}

VonStroke.prototype = new Draw();



function bgImage() {

  this.speed = 0;
  this.y += this.speed;
  this.draw = function() {
    this.context.drawImage(images.background, this.x, this.y);
  };

};

bgImage.prototype = new Draw();



function Plane() {
  var percentFire = .01;
  var chance = 0;
  this.alive = false;

  this.spawn = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.speedX = 0;
    this.speedY = speed;
    this.alive = true;
    this.leftEdge = this.x - 90;
    this.rightEdge = this.x + 90;
    this.bottomEdge = this.y + 240;

  }

  this.draw = function() {
    this.context.clearRect(this.x-1, this.y, this.width+1, this.height);
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x <= this.leftEdge) {
      this.speedX = this.speed;
    }
    else if (this.x >= this.rightEdge + this.width) {
      this.speed = 1.5;
      this.speedY = 0;
      this.y -= 5;
      this.speedX = -this.speed;
    }

    else if (this.y >= this.bottomEdge) {
      this.speed = 1.5;
      this.speedY = 0;
      this.y -= 5;
      this.speedX = this.speed;
    }
    this.context.drawImage(images.plane, this.x, this.y, 40, 40);
    chance = Math.floor(Math.random()*101);
    if (chance/100 < percentFire) {
      this.shoot();
    }
  };

  this.shoot = function() {
    game.grenadePool.get(this.x+this.width/2, this.y+this.height, -2.5);
  }

  this.clear = function() {
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.alive = false;
  }
}
Plane.prototype = new Draw();

function Game() {
  this.init = function() {

    this.bgCanvas = document.getElementById("background");
    this.claudeCanvas = document.getElementById("claude");
    this.mainCanvas = document.getElementById("main");

    if (this.bgCanvas.getContext) {
      console.log("game")
      this.bgContext = this.bgCanvas.getContext("2d");
      this.claudeContext = this.claudeCanvas.getContext("2d");
      this.mainContext = this.mainCanvas.getContext("2d");

      bgImage.prototype.context = this.bgContext;
      bgImage.prototype.canvasWidth = this.bgCanvas.width;
      bgImage.prototype.canvasHeight = this.bgCanvas.height;

      VonStroke.prototype.context = this.claudeContext;
      VonStroke.prototype.canvasWidth = this.claudeCanvas.width;
      VonStroke.prototype.canvasHeight = this.claudeCanvas.height;

      Shot.prototype.context = this.mainContext;
      Shot.prototype.canvasWidth = this.mainCanvas.width;
      Shot.prototype.canvasHeight = this.mainCanvas.height;

      Plane.prototype.context = this.mainContext;
      Plane.prototype.canvasWidth = this.mainCanvas.width;
      Plane.prototype.canvasHeight = this.mainCanvas.height;




      this.background = new bgImage();
      this.background.init(0,0);
      this.vonstroke = new VonStroke();

      var claudeStartX = this.claudeCanvas.width/2 - images.vonStroke.width;
      var claudeStartY = this.claudeCanvas.height/3;
      this.vonstroke.init(claudeStartX, claudeStartY, images.vonStroke.width, images.vonStroke.height);
      this.planePool = new Pool(30);
      this.planePool.init("plane");
      var height = images.plane.height;
      var width = images.plane.width;
      var x = 100;
      var y = -height;
      var space = y * 1.5;
      for (var i = 1; i <= 18; i++) {
        this.planePool.get(x, y, 2);
        x += width + 25;
        if (i % 6 === 0) {
          x = 100;
          y += space;
        }
      };
      this.grenadePool = new Pool(50);
      this.grenadePool.init("grenade");


      return true;
    }
    else {
      return false;
    }
  }
  this.startGame = function() {
    console.log("start")
    this.vonstroke.draw();
    animate();
  }
};

function animate() {
  requestAnimFrame(animate);
  game.background.draw();
  game.vonstroke.move();
  game.vonstroke.bulletPool.animate();
  game.planePool.animate();
  game.grenadePool.animate();
}

KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}

// Creates the array to hold the KEY_CODES and sets all their values
// to false. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}
/**
 * Sets up the document to listen to onkeydown events (fired when
 * any key on the keyboard is pressed down). When a key is pressed,
 * it sets the appropriate direction to true to let us know which
 * key it was.
 */
document.onkeydown = function(e) {
  console.log("heeee")
  // Firefox and opera use charCode instead of keyCode to
  // return which key was pressed.
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
	e.preventDefault();
	KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}
/**
 * Sets up the document to listen to ownkeyup events (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets teh appropriate direction to false to let us know which
 * key it was.
 */
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}


/**
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){

	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

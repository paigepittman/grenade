//starting game//
var game = new Game();

function init() {
  if (game.init()) {
  //  console.log("hi")
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
    //console.log(width)
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  this.speed = 0;
  this.canvasHeight = 0;
  this.canvasWidth = 0;
  this.collidableWith = "";
  this.isColliding = false;
  this.type = "";

  this.draw = function() {

  }
  this.move = function() {

  }

  this.isCollidableWith = function(obj) {
    return (this.collidableWith === obj.type);
  }
};

function Pool(max) {

  var size = max;
  var pool = [];

  this.getPool = function() {
    var obj = [];
    for (var i = 0; i < size; i++) {
      if (pool[i].alive) {
        obj.push(pool[i]);
      }
    }
    return obj;
  }

  this.init = function(obj) {
    if (obj === "hero") {
          for (var i=0; i < size; i++) {
           var shot = new Shot("hero");
           shot.init(0,0, 20, 20);
           shot.collidableWith = "plane";
           shot.type = "claude";
           pool[i] = shot;
          }
     }
    else if (obj === "grenade") {
         for (var i=0; i < size; i++) {
          var grenade = new Shot("grenade");
          grenade.init(0,0, 40, 40);
          grenade.collidableWith = "claude";
          grenade.type = "grenade";
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
    //console.log(x,y)
    if (!pool[size -1].alive) {
      pool[size - 1].spawn(x, y, speed);
      pool.unshift(pool.pop());
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
      //console.log(this.height)
    this.context.clearRect(this.x, this.y, this.width, this.height);
    this.y -= this.speed;

    if (this.isColliding) {
      return true;
    }

    else if (type === "hero" && this.y <= 0 - this.height) {
      return true;
    }
    else if (type === "grenade" && this.y >= this.canvasHeight) {
      return true;
    }
    else {
      if (type === "hero") {
        this.context.drawImage(images.shot, this.x, this.y, 20, 20);
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
    this.isColliding = false;
  };
}

Shot.prototype = new Draw();

function VonStroke() {

  this.speed = 3;
  this.bulletPool = new Pool(30);
  this.bulletPool.init("hero");
  this.collidableWith = "grenade";
  this.type = "claude";
  var firingRate = 15;
  var count = 0;
  this.draw = function() {
  console.log(this.x)
    this.context.drawImage(images.vonStroke, this.x, this.y, 80, 80);

  };

  this.move = function() {
    count++;

    if (KEY_STATUS.left || KEY_STATUS.right) {
      //console.log(this.width)
      this.context.clearRect(this.x, this.y, this.width, this.height);

      if (KEY_STATUS.left) {
        this.x -= this.speed
        if (this.x <= -20) {
          this.x = -20;
        }
      }
       else if (KEY_STATUS.right) {
          this.x += this.speed
          if (this.x >= this.canvasWidth - 60) {
            this.x = this.canvasWidth - 60;
          }
        }
        if (!this.isColliding) {
          this.draw();
        }
    }
    if (KEY_STATUS.space && count >= firingRate) {
      this.shoot();
      count = 0;
    }
  }
  this.shoot = function() {
    this.bulletPool.get(this.x+30, this.y, 3);
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
  var percentFire = .7;
  var chance = 0;
  this.alive = false;
  this.collidableWith = "shot";
  this.type = "plane";

  this.spawn = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.speedX = 0;
    this.speedY = speed;
    this.alive = true;
    this.leftEdge = this.x - 15;
    this.rightEdge = this.x + 190;
    this.bottomEdge = this.y + 150;

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

    if (!this.isColliding) {
        this.context.drawImage(images.plane, this.x, this.y, 40, 40);
        chance = Math.floor(Math.random()*101);
        if (chance/100 < percentFire) {
          this.shoot();
        }
        return false;
    }
    else {
      return true;
    }
  };
  this.shoot = function() {
    game.grenadePool.get(this.x, this.y-5, -1.2);
  }

  this.clear = function() {
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.alive = false;
    this.isColliding = false;
  }
}
Plane.prototype = new Draw();


function QuadTree(boundbox, lvl) {

  var maxObj = 10;
  this.bounds = boundbox || {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }

  var objs = [];
  this.nodes = [];
  var level = lvl || 0;
  var maxLevels = 5;

  this.clear = function() {
    objs = [];

    for (var i = 0; i < this.nodes.length; i++) {
      this.nodes[i].clear();
    }

    this.nodes = [];
  }

  this.getAllObjs = function(returned) {
  //console.log(returned)
    for (var i = 0; i < this.nodes.length; i++) {
      this.nodes[i].getAllObjs(returned);
    }

    for (var i = 0, len = objs.length; i < len; i++) {
      returned.push(objs[i]);
    }

    return returned;

  };

  this.findObjs = function(returned, obj) {
    if (typeof obj === "undefined") {
    //  console.log("UNDEFINED");
      return;
    }

    var index = this.getIndex(obj);
    if (index != -1 && this.nodes.length) {
      this.nodes[index].findObjs(returned, obj);
    }

    for (var i = 0, len = objs.length; i < len; i++) {
      returned.push(objs[i]);
    }

    return returned;
  }
  this.insert = function(obj) {
    ////console.log(obj)

    if (typeof obj === "undefined") {
      return;
    }
    if (obj instanceof Array) {
      for (var i = 0, len = obj.length; i < len; i++) {
				this.insert(obj[i]);
			}
      return;
    }
    if (this.nodes.length) {
    //  console.log("nodes")
      var index = this.getIndex(obj);

      if (index != -1) {
        this.nodes[index].insert(obj);

        return;
      }
    }

    objs.push(obj);

    if (objs.length > maxObj && level < maxLevels) {
      if (this.nodes[0] == null) {
        this.split();
      }

      var i = 0;
      while (i <objs.length) {
        var index = this.getIndex(objs[i]);
        if (index != -1) {
        //  console.log("index", this.nodes[0])

          this.nodes[index].insert((objs.splice(i, 1))[0]);
        }
        else {
          i++;
        }
      }
    }
  }

  this.getIndex = function(obj) {
    //console.log("obj:", obj, "objx:", obj.x)
    var index = -1;
    var verticalMidpoint = this.bounds.x + this.bounds.width / 5;
    var horizontalMidpoint = this.bounds.y + this.bounds.height /5;

    var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);

    var bottomQuadrant = (obj.y > horizontalMidpoint);

    if (obj.x < verticalMidpoint &&
        obj.x + obj.width < verticalMidpoint) {
      if (topQuadrant) {
        index = 1;
      }
      else if (bottomQuadrant) {
        index = 2;
      }
    }

    else if (obj.x > verticalMidpoint) {
      if (topQuadrant) {
        index = 0;
      }
      else if (bottomQuadrant) {
        index = 3;
      }
    }
  //  console.log("index", index)

    	return index;
  };

  this.split = function() {
    var subWidth = (this.bounds.width / 10) | 0;
    var subHeight = (this.bounds.height / 2) | 0;

    this.nodes[0] = new QuadTree({
      x: this.bounds.x + subWidth,
      y: this.bounds.y,
      width: subWidth,
      height: subHeight
    }, level+1);
    this.nodes[1] = new QuadTree({
      x: this.bounds.x,
      y: this.bounds.y,
      width: subWidth,
      height: subHeight
    }, level+1);
    this.nodes[2] = new QuadTree({
      x: this.bounds.x,
      y: this.bounds.y + subHeight,
      width: subWidth,
      height: subHeight
    }, level+1);
    this.nodes[3] = new QuadTree({
      x: this.bounds.x + subWidth,
      y: this.bounds.y + subHeight,
      width: subWidth,
      height: subHeight
    }, level+1);
  }
}



function Game() {
  this.init = function() {

    this.bgCanvas = document.getElementById("background");
    this.claudeCanvas = document.getElementById("claude");
    this.mainCanvas = document.getElementById("main");

    if (this.bgCanvas.getContext) {
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

      var claudeStartX = this.claudeCanvas.width/2;
      var claudeStartY = this.claudeCanvas.height/4*3;
      this.vonstroke.init(claudeStartX, claudeStartY, 80, 80);
      this.planePool = new Pool(4);
      this.planePool.init("plane");
      var height = 100;
      var width = 100;
      var x = 10;
      var y = -height;
      var space = y * 1.5;
      for (var i = 1; i <= 10; i++) {
        this.planePool.get(x, y, 2);
        x += width + 5;
        if (i % 6 === 0) {
          x = 100;
          y += space;
        }
      };
      this.grenadePool = new Pool(5);
      this.grenadePool.init("grenade");

      this.quadTree = new QuadTree({x:0,y:0,width:this.mainCanvas.width,height:this.mainCanvas.height});

      return true;
    }
    else {
      return false;
    }
  }
  this.startGame = function() {
    this.vonstroke.draw();
    animate();
  }
};

function animate() {
  game.quadTree.clear();
  game.quadTree.insert(game.vonstroke);
  game.quadTree.insert(game.vonstroke.bulletPool.getPool());
  game.quadTree.insert(game.planePool.getPool());
  game.quadTree.insert(game.grenadePool.getPool());

  detectCollision();

  requestAnimFrame(animate);
  game.background.draw();
  game.vonstroke.move();
  game.vonstroke.bulletPool.animate();
  game.planePool.animate();
  game.grenadePool.animate();
}


function detectCollision() {
	var objects = [];
	game.quadTree.getAllObjs(objects);

	for (var x = 0, len = objects.length; x < len; x++) {
		game.quadTree.findObjs(obj = [], objects[x]);

		for (y = 0, length = obj.length; y < length; y++) {

			if (objects[x].collidableWith === obj[y].type &&
				(objects[x].x < obj[y].x + obj[y].width &&
			     objects[x].x + objects[x].width > obj[y].x &&
				 objects[x].y < obj[y].y + obj[y].height &&
				 objects[x].y + objects[x].height > obj[y].y)) {
				objects[x].isColliding = true;
				obj[y].isColliding = true;
			}
		}
	}
};

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
//  console.log("heeee")
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

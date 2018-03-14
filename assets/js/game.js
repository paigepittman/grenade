
var game = new Game();

var blur = false;

var mobile = false;

function init() {
	//game.init();
}

window.onload = function() {
	var orientation = window.orientation;
	var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	if (isMobile) {
		mobile = true;
		if (orientation === 90 || orientation === -90) {
			 $("body").addClass("landscape");
		}
			else {
				$("body").removeClass("landscape");
			}

	}
}


window.onorientationchange = function() {
	var orientation = window.orientation;
	var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	if (isMobile) {
		if (orientation === 90 || orientation === -90) {
			 $("body").addClass("landscape");
		}
			else {
				$("body").removeClass("landscape");
			}

	}

}


var images = new function() {
	// Define images
	this.background = new Image();
	this.hero = new Image();
	this.bullet = new Image();
	this.enemy = new Image();
	this.grenade = new Image();

	var numImages = 5;
	var numLoaded = 0;
	var userStart = false;
	var userChoice;

	//if userStart is true and numloaded === numImages, start game.
	//onclick for user choice sets user start to true and sets image src for player
	$(".player-choice").on("click", function() {
		var player = $(this).attr("id");

		if (player === "claude") {
			$("#claude").addClass("selected");
			$("#eprom").removeClass("selected");
			userChoice = "assets/imgs/claude-ship.png";
		}
		else if (player === "eprom") {
			$("#eprom").addClass("selected");
			$("#claude").removeClass("selected");
			userChoice = "assets/imgs/eprom-ship.png";
		}
		images.hero.src = userChoice;


	});

	$("#start-click").on("click", function() {
		$("#start-game").css("display", "none");
		document.getElementById('loading').style.display = "block";
		var mission = "your mission: make it to the end of the song to win";
		var typeMission = setInterval(appendMission, 100);
		var i = 0;

		function appendMission() {
			$("#mission-text").append(mission[i]);
			i++;
			if (i === mission.length) {
				clearInterval(typeMission);

			}

		}

		game.init();

	})

	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages && userStart) {
			window.init();
		}
	}
	this.background.onload = function() {
		imageLoaded();
	}
	this.hero.onload = function() {
		imageLoaded();
	}
	this.bullet.onload = function() {
		imageLoaded();
	}
	this.enemy.onload = function() {
		imageLoaded();
	}
	this.grenade.onload = function() {
		imageLoaded();
	}

	// Set images src
	this.background.src = "assets/imgs/background.png";
	this.bullet.src = "assets/imgs/bullet.png";
	this.hero.src = "assets/imgs/claude-ship.png";
 	this.enemy.srcArray = ["assets/imgs/yellow-plane.png", "assets/imgs/blue-plane.png", "assets/imgs/orange-plane.png"];
	this.enemy.src = "assets/imgs/yellow-plane.png";
	this.grenade.src = "assets/imgs/grenade-new.png";
}


/**
 * Creates the Drawable object which will be the base class for
 * all drawable objects in the game. Sets up defualt variables
 * that all child objects will inherit, as well as the defualt
 * functions.
 */
function Drawable() {
	this.init = function(x, y, width, height) {
		// Defualt variables
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	this.collidableWith = "";
	this.isColliding = false;
	this.type = "";

	// Define abstract function to be implemented in child objects
	this.draw = function() {
	};
	this.move = function() {
	};
	this.isCollidableWith = function(object) {
		return (this.collidableWith === object.type);
	};
}


/**
 * Creates the Background object which will become a child of
 * the Drawable object. The background is drawn on the "background"
 * canvas and creates the illusion of moving by panning the image.
 */
function Background() {
	this.speed = 0; // Redefine speed of the background for panning

	// Implement abstract function
	this.draw = function() {
		// Pan background
		this.y += this.speed;
		//this.context.clearRect(0,0, this.canvasWidth, this.canvasHeight);
		this.context.drawImage(images.background, this.x, this.y);

		// Draw another image at the top edge of the first image
		this.context.drawImage(images.background, this.x, this.y - this.canvasHeight);

		// If the image scrolled off the screen, reset
		if (this.y >= this.canvasHeight)
			this.y = 0;
	};
}
// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();


/**
 * Creates the Bullet object which the ship fires. The bullets are
 * drawn on the "main" canvas.
 */
function Bullet(object) {
	this.alive = false; // Is true if the bullet is currently in use
	var self = object;
	/*
	 * Sets the bullet values
	 */
	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	};

	/*
	 * Uses a "drity rectangle" to erase the bullet and moves it.
	 * Returns true if the bullet moved of the screen, indicating that
	 * the bullet is ready to be cleared by the pool, otherwise draws
	 * the bullet.
	 */
	this.draw = function() {
		this.context.clearRect(this.x-1, this.y-1, this.width+2, this.height+2);
		this.y -= this.speed;
		if (this.isColliding) {
			return true;
		}

		else if (self === "bullet" && this.y <= 0 - this.height) {
			return true;
		}
		else if (self === "grenade" && this.y >= this.canvasHeight) {
			return true;
		}
		else {
			if (self === "bullet") {
				this.context.drawImage(images.bullet, this.x, this.y);
			}
			else if (self === "grenade") {
				this.context.drawImage(images.grenade, this.x, this.y);
			}

			return false;
		}
	};

	/*
	 * Resets the bullet values
	 */
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
		this.isColliding = false;
	};
}
Bullet.prototype = new Drawable();


/**
 * QuadTree object.
 *
 * The quadrant indexes are numbered as below:
 *     |
 *  1  |  0
 * ----+----
 *  2  |  3
 *     |
 */
function QuadTree(boundBox, lvl) {
	var maxObjects = 10;
	this.bounds = boundBox || {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};
	var objects = [];
	this.nodes = [];
	var level = lvl || 0;
	var maxLevels = 5;

	/*
	 * Clears the quadTree and all nodes of objects
	 */
	this.clear = function() {
		objects = [];

		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].clear();
		}

		this.nodes = [];
	};

	/*
	 * Get all objects in the quadTree
	 */
	this.getAllObjects = function(returnedObjects) {
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].getAllObjects(returnedObjects);
		}

		for (var i = 0, len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}

		return returnedObjects;
	};

	/*
	 * Return all objects that the object could collide with
	 */
	this.findObjects = function(returnedObjects, obj) {
		if (typeof obj === "undefined") {
			return;
		}

		var index = this.getIndex(obj);
		if (index != -1 && this.nodes.length) {
			this.nodes[index].findObjects(returnedObjects, obj);
		}

		for (var i = 0, len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}

		return returnedObjects;
	};

	/*
	 * Insert the object into the quadTree. If the tree
	 * excedes the capacity, it will split and add all
	 * objects to their corresponding nodes.
	 */
	this.insert = function(obj) {
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
			var index = this.getIndex(obj);
			// Only add the object to a subnode if it can fit completely
			// within one
			if (index != -1) {
				this.nodes[index].insert(obj);

				return;
			}
		}

		objects.push(obj);

		// Prevent infinite splitting
		if (objects.length > maxObjects && level < maxLevels) {
			if (this.nodes[0] == null) {
				this.split();
			}

			var i = 0;
			while (i < objects.length) {

				var index = this.getIndex(objects[i]);
				if (index != -1) {
					this.nodes[index].insert((objects.splice(i,1))[0]);
				}
				else {
					i++;
				}
			}
		}
	};

	/*
	 * Determine which node the object belongs to. -1 means
	 * object cannot completely fit within a node and is part
	 * of the current node
	 */
	this.getIndex = function(obj) {

		var index = -1;
		var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
		var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

		// Object can fit completely within the top quadrant
		var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
		// Object can fit completely within the bottom quandrant
		var bottomQuadrant = (obj.y > horizontalMidpoint);

		// Object can fit completely within the left quadrants
		if (obj.x < verticalMidpoint &&
				obj.x + obj.width < verticalMidpoint) {
			if (topQuadrant) {
				index = 1;
			}
			else if (bottomQuadrant) {
				index = 2;
			}
		}
		// Object can fix completely within the right quandrants
		else if (obj.x > verticalMidpoint) {
			if (topQuadrant) {
				index = 0;
			}
			else if (bottomQuadrant) {
				index = 3;
			}
		}

		return index;
	};

	/*
	 * Splits the node into 4 subnodes
	 */
	this.split = function() {
		// Bitwise or [html5rocks]
		var subWidth = (this.bounds.width / 2) | 0;
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
	};
}


/**
 * Custom Pool object. Holds Bullet objects to be managed to prevent
 * garbage collection.
 * The pool works as follows:
 * - When the pool is initialized, it popoulates an array with
 *   Bullet objects.
 * - When the pool needs to create a new object for use, it looks at
 *   the last item in the array and checks to see if it is currently
 *   in use or not. If it is in use, the pool is full. If it is
 *   not in use, the pool "spawns" the last item in the array and
 *   then pops it from the end and pushed it back onto the front of
 *   the array. This makes the pool have free objects on the back
 *   and used objects in the front.
 * - When the pool animates its objects, it checks to see if the
 *   object is in use (no need to draw unused objects) and if it is,
 *   draws it. If the draw() function returns true, the object is
 *   ready to be cleaned so it "clears" the object and uses the
 *   array function splice() to remove the item from the array and
 *   pushes it to the back.
 * Doing this makes creating/destroying objects in the pool
 * constant.
 */
function Pool(maxSize) {
	var size = maxSize; // Max bullets allowed in the pool
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

	/*
	 * Populates the pool array with the given object
	 */
	this.init = function(object) {
		if (object == "bullet") {
			for (var i = 0; i < size; i++) {
				// Initalize the object
				var bullet = new Bullet("bullet");
				bullet.init(0,0, images.bullet.width,
										images.bullet.height);
				bullet.collidableWith = "grenade";
				bullet.type = "bullet";
				pool[i] = bullet;
			}
		}
		else if (object == "enemy") {
			for (var i = 0; i < size; i++) {
				var enemy = new Enemy();
				enemy.init(0,0, images.enemy.width,
									 images.enemy.height+1);
				pool[i] = enemy;
			}
		}
		else if (object == "grenade") {
			for (var i = 0; i < size; i++) {
				var bullet = new Bullet("grenade");
				bullet.init(0,0, images.grenade.width,
										images.grenade.height);
				bullet.collidableWith = "hero";
				bullet.type = "grenade";
				pool[i] = bullet;
			}
		}
	};

	/*
	 * Grabs the last item in the list and initializes it and
	 * pushes it to the front of the array.
	 */
	this.get = function(x, y, speed, color, lvl) {
		if(!pool[size - 1].alive) {
			if (color) {
				pool[size - 1].spawn(x, y-lvl*40, speed, color);
				pool.unshift(pool.pop());
			} else {
				pool[size - 1].spawn(x, y, speed);
				pool.unshift(pool.pop());
			}

		}
	};

	/*
	 * Used for the ship to be able to get two bullets at once. If
	 * only the get() function is used twice, the ship is able to
	 * fire and only have 1 bullet spawn instead of 2.
	 */

	/*
	 * Draws any in use Bullets. If a bullet goes off the screen,
	 * clears it and pushes it to the front of the array.
	 */
	this.animate = function() {
		for (var i = 0; i < size; i++) {
			// Only draw until we find a bullet that is not alive
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			}
			else
				break;
		}
	};
}


function Hero() {
	this.speed = 3;
	this.bulletPool = new Pool(30);
	var fireRate = 15;
	var counter = 0;
	this.collidableWith = "grenade";
	this.type = "hero";

	this.init = function(x, y, width, height) {
		// Defualt variables
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.alive = true;
		this.isColliding = false;
		this.bulletPool.init("bullet");
	}

	this.draw = function() {
		this.context.drawImage(images.hero, this.x, this.y, images.hero.width, images.hero.height);
	};

	this.respawn = function() {

	}

	this.move = function() {
		counter++;
		if (KEY_STATUS.left || KEY_STATUS.right) {

			this.context.clearRect(this.x, this.y, this.width, this.height);


			if (KEY_STATUS.left) {
				this.x -= this.speed
				if (this.x <= -8)
					this.x = -8;
			} else if (KEY_STATUS.right) {
				this.x += this.speed
				if (this.x >= this.canvasWidth - this.width)
					this.x = this.canvasWidth - this.width;
			}
		}
		// Redraw
		if (!this.isColliding) {
			this.draw();
		}
		else if (this.isColliding && game.playerLives > 0) {
			game.death.get();
			this.context.clearRect(this.x, this.y, this.width, this.height);
			this.x = game.mainCanvas.width/2;

			this.draw();
			this.isColliding = false;
		}
    else if (this.isColliding && game.playerlives === 0) {
			 this.context.clearRect(this.x, this.y, this.width, this.height);
			 this.alive = false;
		}

		if (KEY_STATUS.space && counter >= fireRate && !this.isColliding) {
			this.fire();
			counter = 0;
		}
	};

	this.fire = function() {
		this.bulletPool.get(this.x+22, this.y, 3);
		game.laser.get();
	};
}
Hero.prototype = new Drawable();



function Enemy() {
	var array = ["assets/imgs/yellow-plane.png", "assets/imgs/blue-plane.png", "assets/imgs/orange-plane.png"];
	var percentFire = 2;
	var chance = 0;
	this.alive = false;
	this.collidableWith = "bullet";
	this.type = "enemy";
	this.yellow = new Image();
	this.blue = new Image();
	this.orange = new Image();

	this.yellow.src = "assets/imgs/yellow-plane.png";
	this.blue.src ="assets/imgs/blue-plane.png";
	this.orange.src = "assets/imgs/blue-plane.png";	 ///FIX COLOR PLANES HEREEEEEEEEE
	this.spawn = function(x, y, speed, color) {

		this.color = color;
		images.enemy.src = this.color;
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.speedX = 0;
		this.speedY = speed;
		this.alive = true;
		this.leftEdge = this.x - 100;
		this.rightEdge = this.x + 230;
		this.bottomEdge = this.y + 160;
	};


	this.draw = function() {
		this.context.clearRect(this.x-1, this.y, this.width+1, this.height+2);
		this.x += this.speedX;
		this.y += this.speedY;
		if (this.x <= this.leftEdge) {
			this.speedX = this.speed;
		}
		else if (this.x >= this.rightEdge + this.width) {
			this.speedX = -this.speed;
		}
		else if (this.y >= this.bottomEdge) {
			this.speed = 1.5;
			this.speedY = 0;
			this.y -= 5;
			this.speedX = -this.speed;
		}

		if (!this.isColliding) {
			this.context.drawImage(images.enemy, this.x, this.y);
			var shots = 0;
			// Enemy has a chance to shoot every movement
			chance = Math.floor(Math.random()*201);
			if (chance === percentFire) {
				 shots++
				this.fire();
			}
			return false;
		}
		else {
			game.playerScore += 20;
			game.explosion.get();
			return true;
		}
	};


	this.fire = function() {
		game.grenadePool.get(this.x+this.width/2, this.y+this.height, -2.5);
		//game.grenade.get();
	};


	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.alive = false;
		this.isColliding = false;
	};
}
Enemy.prototype = new Drawable();



function Game() {

	this.init = function() {
		this.ended = false;
		// Get the canvas elements
		this.bgCanvas = document.getElementById('background');
		this.heroCanvas = document.getElementById('hero');
		this.mainCanvas = document.getElementById('main');


		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.heroContext = this.heroCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');

			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;

			Hero.prototype.context = this.heroContext;
			Hero.prototype.canvasWidth = this.heroCanvas.width;
			Hero.prototype.canvasHeight = this.heroCanvas.height;

			Bullet.prototype.context = this.mainContext;
			Bullet.prototype.canvasWidth = this.mainCanvas.width;
			Bullet.prototype.canvasHeight = this.mainCanvas.height;

			Enemy.prototype.context = this.mainContext;
			Enemy.prototype.canvasWidth = this.mainCanvas.width;
			Enemy.prototype.canvasHeight = this.mainCanvas.height;

			// Initialize the background object
			this.background = new Background();
			this.background.init(0,0); // Set draw point to 0,0


			this.hero = new Hero();
			this.heroStartX = this.heroCanvas.width/2 - images.hero.width;
			this.heroStartY = 295;
			this.hero.init(this.heroStartX, this.heroStartY,
			               images.hero.width, images.hero.height);

			this.enemyPool = new Pool(4);
			this.enemyPool.init("enemy");
			this.waveLevel = 0;
			this.spawnWave(this.waveLevel);

			this.grenadePool = new Pool(10);
			this.grenadePool.init("grenade");

			// Start QuadTree
			this.quadTree = new QuadTree({x:0,y:0,width:this.mainCanvas.width,height:this.mainCanvas.height});

			this.playerScore = 0;
			this.playerLives = 4;
			// Audio files
			this.laser = new SoundPool(10);
			this.laser.init("laser");

			this.explosion = new SoundPool(20);
			this.explosion.init("explosion");

			this.death = new SoundPool(4);
			this.death.init("death");

			this.grenade = new SoundPool(20);
			this.grenade.init("grenade");

			this.backgroundAudio = new Audio("assets/sounds/grenade.m4a")
			this.backgroundAudio.loop = false;
			this.backgroundAudio.volume = .25;
			this.backgroundAudio.currentTime = 0;
			this.backgroundAudio.load();

			this.gameOverAudio = new Audio("assets/sounds/game-over.wav");
			this.gameOverAudio.loop = false;
			this.gameOverAudio.volume = .25;
			this.gameOverAudio.load();
			this.loadingTime = 0;
			this.checkAudio = window.setInterval(function(){checkReadyState()},1000);
		}
	};

	this.spawnWave = function(level) {
		var lvl = level;
		var color = images.enemy.srcArray[lvl];
		var height = images.enemy.height;
		var width = images.enemy.width;
		var x = 100;
		var y = -height;
		var spacer = y * 1.5;
		for (var i = 1; i <= 18; i++) {
			this.enemyPool.get(x,y,2, color, lvl+1);
			x += width + 25;
			if (i % 6 == 0) {
				x = 150;
				y += spacer
			}
		}
	}

	// Start the animation loop
	this.start = function() {
		this.hero.draw();
		this.backgroundAudio.play();
		animate();
	};

	this.halfway = function() {
		$("#halfway").css("display", "block");

	}

	// Restart the game
	this.restart = function() {
		this.gameOverAudio.pause();
		this.ended = false;
		document.getElementById('game-over').style.display = "none";
		document.getElementById('you-win').style.display = "none";
		this.bgContext.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
		this.heroContext.clearRect(0, 0, this.heroCanvas.width, this.heroCanvas.height);
		this.mainContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

		this.quadTree.clear();

		this.background.init(0,0);
		this.hero.init(this.heroStartX, this.heroStartY,
		               images.hero.width, images.hero.height);

		this.enemyPool.init("enemy");
		this.waveLevel = 0;
		this.spawnWave(this.waveLevel);
		this.grenadePool.init("grenade");

		this.playerScore = 0;
		this.playerLives = 4;

		this.backgroundAudio.currentTime = 0;
		this.backgroundAudio.play();

		this.start();

	};

	// Game over
	this.gameOver = function(state) {
		this.backgroundAudio.pause();
		this.gameOverAudio.currentTime = 0;
		this.gameOverAudio.play();

		this.ended = true;
		if (state === "loss") {
					document.getElementById('game-over').style.display = "block";
		} else {
				document.getElementById('you-win').style.display = 	"block";
		}

	};


}

//Ensure the game sound has loaded before starting the game

function checkReadyState() {
	game.loadingTime++;
	if (game.gameOverAudio.readyState === 4 && game.backgroundAudio.readyState === 4 && game.loadingTime===8) {
		window.clearInterval(game.checkAudio);
		document.getElementById('loading').style.display = "none";
		document.getElementById('score').style.display = "block";
		$(".controller").attr("id", "controller");
		game.start();
		if (mobile) {
			$("#directions").css("display", "block");
		}


	}
}


function SoundPool(maxSize) {
	var size = maxSize;
	var pool = [];
	this.pool = pool;
	var currSound = 0;


	this.init = function(object) {
		if (object == "laser") {
			console.log("laser")
			for (var i = 0; i < size; i++) {
				laser = new Audio("assets/sounds/hero-fire.wav");
				laser.volume = .12;
				laser.load();
				pool[i] = laser;
			}
		}
		else if (object == "explosion") {


			for (var i = 0; i < size; i++) {
				var explosion = new Audio("assets/sounds/Powerup-hit.wav");
				explosion.volume = .12;
				explosion.load();
				pool[i] = explosion;
			}
		}
		else if (object == "grenade") {
			for (var i = 0; i < size; i++) {
				var grenade = new Audio("assets/sounds/grenade-drop.wav");
				grenade.volume = .12;
				grenade.load();
				pool[i] = grenade;
			}
		}
		else if (object == "death") {
			for (var i = 0; i < size; i++) {
				var death = new Audio("assets/sounds/hero-death.wav");
				death.volume = .12;
				death.load();
				pool[i] = death;
			}
		}
	};

	this.get = function() {

		if(pool[currSound].currentTime == 0 || pool[currSound].ended) {
			if (blur === false) {
						pool[currSound].play();
			}
		}
		currSound = (currSound + 1) % size;
	};
}


/**
 * The animation loop. Calls the requestAnimationFrame shim to
 * optimize the game loop and draws all game objects. This
 * function must be a gobal function and cannot be within an
 * object.
 */
function animate() {
	$("#your-score").html(game.playerScore);
	$("#your-lives").html(game.playerLives);

	// Insert objects into quadtree
	game.quadTree.clear();
	game.quadTree.insert(game.hero);
	game.quadTree.insert(game.hero.bulletPool.getPool());
	game.quadTree.insert(game.enemyPool.getPool());
	game.quadTree.insert(game.grenadePool.getPool());

	detectCollision();

	if (game.enemyPool.getPool().length <= 2) {
		if (game.waveLevel == 2) {
			game.waveLevel = 0;
			game.spawnWave(game.waveLevel);
		} else {
			game.waveLevel += 1;
			game.spawnWave(game.waveLevel);
		}

	}

	// Animate game objects
	if (game.hero.alive) {
		requestAnimFrame( animate );

		game.background.draw();
		game.hero.move();
		game.hero.bulletPool.animate();
		game.enemyPool.animate();
		game.grenadePool.animate();
	}

	if (game.backgroundAudio.currentTime > 412 && game.ended === false) {
		game.hero.alive = false;
		game.gameOver("win");
	}

	if (parseInt(game.backgroundAudio.currentTime) === parseInt(game.backgroundAudio.duration/2)) {
		game.halfway();
	}

	if (parseInt(game.backgroundAudio.currentTime) === parseInt(game.backgroundAudio.duration/2) + 3) {
		$("#halfway").css("display", "none");

	}

	if (game.backgroundAudio.currentTime >= 3) {
		$("#directions").css("display", "none");
	}

	if (game.playerLives === 0) {
		game.hero.alive = false;
		game.gameOver("loss");

		}
}

function detectCollision() {
	var objects = [];
	game.quadTree.getAllObjects(objects);

	for (var x = 0, len = objects.length; x < len; x++) {
		game.quadTree.findObjects(obj = [], objects[x]);

		for (y = 0, length = obj.length; y < length; y++) {

			// DETECT COLLISION ALGORITHM
			if (objects[x].collidableWith === obj[y].type &&
				(objects[x].x < obj[y].x + obj[y].width &&
			     objects[x].x + objects[x].width > obj[y].x &&
				 objects[x].y < obj[y].y + obj[y].height &&
				 objects[x].y + objects[x].height > obj[y].y)) {
				objects[x].isColliding = true;
				obj[y].isColliding = true;

				if (obj[y].type === "grenade" && objects[x].type === "bullet") {
					game.playerScore += 10;


				}
				else if (obj[y].type === "hero" && objects[x].type === "grenade" && game.playerLives > 0) {
					game.playerLives--;

				}
			}
		}
	}
};


// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = {
  32: 'space',
  37: 'left',
  39: 'right'
}

KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}


$("button").on("click", function(e) {
	e.preventDefault();
})

document.onkeydown = function(e) {

	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
		e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}

document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}

document.ontouchmove = function(event) {
	event.preventDefault()
}

//detecting movement for mobile

function touchdown(event) {
    var keyCode = event;
    if (KEY_CODES[keyCode]) {
    KEY_STATUS[KEY_CODES[keyCode]] = true;
    }
  }

function touchoff(event) {
    var keyCode = event;
    if (KEY_CODES[keyCode]) {
      KEY_STATUS[KEY_CODES[keyCode]] = false;
    }
}

//prevents music from continuing when browser minimized (also prevents from playing on phone lockcreen)
 window.onblur = function() {
	 blur = true;
	 game.backgroundAudio.pause();
	 game.gameOverAudio.pause();

 }

 window.onfocus = function() {
	 blur = false;
	 game.backgroundAudio.play();

 }

 /**
  * requestAnim shim layer by Paul Irish
  * Finds the first API that works to optimize the animation loop,
  * otherwise defaults to setTimeout().
  */
//
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function( callback, element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

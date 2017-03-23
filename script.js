window.onload = init;													//Execute 'init' once everything is loaded
var canvas;
var snake;																//Global variables for the game
var tileSize, boardDim;
function init(){
	canvas = document.getElementById("canvas");							//Get canvas from HTML and store it in canvas var
	boardDim = 20;														//20 tile x 20 tile board
	tileSize = canvas.width/boardDim;									//Size in pixels of each tile
	snake = new Snake();												//Initialize game
	snake.init();														//Start game
	document.addEventListener("keydown",snake.keydown.bind(snake));		//Send keyboard events from the document to the game
	gameloop();															//Start the game loop
}
function gameloop(){
	var g = canvas.getContext("2d");									//Get the graphics object of the canvas for drawing
	prepScreen(g);														//Preps the graphics object for the game to render
	snake.update();														//Update the game
	snake.render(g);													//Passes the graphics object to the game for rendering
	requestAnimationFrame(gameloop);									//Call gameloop again once the webpage is ready to render again
}
function prepScreen(g){
	g.clearRect(0,0,canvas.width,canvas.height);						//Clear all graphics, without this the old frames would still be rendered
	g.strokeStyle = "black";											//Change the drawing color to black
	g.lineWidth = 8;													//You can guess
	g.strokeRect(0,0,canvas.width,canvas.height);						//Draw the outline of the board
	g.lineWidth = 1;													
	for (var i = 0; i < boardDim; i++)									//Iterate across every 'tile' on the board
		for (var j = 0; j < boardDim; j++)
			g.strokeRect(tileSize*i,tileSize*j,tileSize,tileSize);		//and draw the outline of a square around it to form the grid
}
function Snake(){
	function Tile(x,y){													//Object representing a tile on the board
		this.x = x;														//Set x and y coordinates
		this.y = y;
		this.equals = function(other){									//Function to check if this tile is equal to another tile
			return other.x == this.x &&
				   other.y == this.y;
		}
	}
	this.init = function(){												//Start game
		this.cooldown = 0;												//Delay in frames before moving to next tile
		this.segments = [new Tile(Math.round(boardDim/2),				//List of all the tiles in the snake
								  Math.round(boardDim/2))];
		this.direction = -1;											//Direction travelling. 0 = up, 1 = left, 2 = down, 3 = right, -1 = not moving
		this.spawnfood();												//Spawn the first food thing
		this.pressed = "";												//The most recent key pressed, only changes for 'w' 'a' 's' and 'd'
	}
	this.update = function(){
		if (this.pressed == "")											//If no direction has been pressed down update
			return;
		this.cooldown--;												//Decrement the delay
		if (this.cooldown <= 0){										//When the delay reaches 0, reset the delay and move one tile
			this.cooldown = 10;
			this.move();
		}
	}
	this.render = function(g){
		g.fillStyle = "black";
		for (var i = 0; i < this.segments.length; i++)					//Draw all the tiles in the snake based on the coordinates and the size of each tile
			g.fillRect(this.segments[i].x*tileSize,this.segments[i].y*tileSize,tileSize,tileSize);
		g.fillStyle = "red";											//Change the color to red and draw the food
		g.fillRect(this.food.x*tileSize,this.food.y*tileSize,tileSize,tileSize);
	}
	this.keydown = function(k){
		switch(k.code){													//Get the code from the key event passed from the document
			case "KeyW":case "KeyA":case "KeyS":case "KeyD":			//If it is a valid key change this.pressed, otherwise do nothing
				this.pressed = k.code;
			break;
		}
	}
	this.spawnfood = function(){
		var overlap = false;
		do{
			overlap = false;											//Move the food to a random location on the board
			this.food = new Tile(Math.round(Math.random()*(boardDim-1)),Math.round(Math.random()*(boardDim-1)));
			for (var i = 0; i < this.segments.length; i++)				//Check if it overlaps the snake at any point and
				if (this.segments[i].equals(this.food))					//If so find a new location, repeating until it doesnt overlap
					overlap = true;
		}while(overlap);
	}
	this.collide = function(){											//Checks if a collision has been triggered
		var h = this.getHead();											//Get the head of the snake
		if (h.x<0||h.x>=boardDim||h.y<0||h.y>=boardDim)					//Return true if the head of the snake is off the board
			return true;
		for (var i = 0; i < this.segments.length-1; i++)				//Iterate through all of the tiles in the snake except the head
			if (h.equals(this.segments[i]))								//And check if the head is in the same position, meaning it hit itself
				return true;
		return false;													//Return no collision if the above didnt return true
	}
	this.getHead = function(){											//Function to get the head of the snake
		return this.segments[this.segments.length-1];
	}
	this.move = function(){
		var d = 0;
		switch (this.pressed){											//Decide a direction based on the last key pressed
			case "KeyW":	d = 0;	break;
			case "KeyA":	d = 1;	break;
			case "KeyS":	d = 2;	break;
			case "KeyD":	d = 3;	break;
			default:	return;
		}
		if (Math.abs(this.direction-d)%2!=0 || this.segments.length==1)	//If the player isnt trying to go straight forward or straight backward,
			this.direction = d;											//OR the snake is length 1, set the travel direction to that direction
			
		var h = this.getHead();
		var nextHead;													//Tile representing the next place the head is going to be
		switch(this.direction){
			case 0:		nextHead = new Tile(h.x,	h.y-1);	break;		//Make a new tile based on the direction the snake is headed
			case 1:		nextHead = new Tile(h.x-1,	h.y);	break;
			case 2:		nextHead = new Tile(h.x,	h.y+1);	break;
			case 3:		nextHead = new Tile(h.x+1,	h.y);	break;
		}
		this.segments.push(nextHead);									//Add the new head onto the snake
		if (!nextHead.equals(this.food))								//If the snake didnt just eat food remove the end of its tail to move forward
			this.segments.splice(0,1);									//Otherwise leave the tail alone and allow the snake to grow by one
		else this.spawnfood();											//If it did eat the food move the food to a new location
		if (this.collide())												//If there is a collision start the game over
			this.init();
	}
}
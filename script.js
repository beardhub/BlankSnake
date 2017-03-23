window.onload = init;
var c;
var snake;
var dt, db, t;
function init(){
	c = document.getElementById("canvas");
	t = 20;
	db = c.width;
	dt = db/t;
	snake = new Snake();
	snake.init();
	document.addEventListener("keydown",snake.keydown.bind(snake));
	gameloop();
}
function gameloop(){
	var g = c.getContext("2d");
	prepScreen(g);
	snake.update();
	snake.render(g);
	requestAnimationFrame(gameloop);
}
function prepScreen(g){
	g.clearRect(0,0,c.width,c.height);
	g.strokeStyle = "black";
	g.lineWidth = 8;
	g.strokeRect(0,0,c.width,c.height);
	g.lineWidth = 1;
	for (var i = 0; i < t; i++)
		for (var j = 0; j < t; j++)
			g.strokeRect(dt*i,dt*j,dt,dt);
}
function Snake(){
	function Seg(x,y){
		this.x = x;
		this.y = y;
		this.eq = function(o){
			return o.x==this.x&&o.y==this.y;
		}
	}
	this.init = function(){
		this.wait = 0;
		this.segs = [new Seg(Math.round(t/2),Math.round(t/2))];
		this.dir = -1;
		this.spawnfood();
		this.p = "";
	}
	this.update = function(){
		if (this.p == "")
			return;
		this.wait--;
		if (this.wait <= 0){
			this.wait = 10;
			this.move();
		}
	}
	this.render = function(g){
		g.fillStyle = "black";
		for (var i = 0; i < this.segs.length; i++)
			g.fillRect(this.segs[i].x*dt,this.segs[i].y*dt,dt,dt);
		g.fillStyle = "red";
		g.fillRect(this.food.x*dt,this.food.y*dt,dt,dt);
	}
	this.keydown = function(k){
		switch(k.code){
			case "KeyW":case "KeyA":case "KeyS":case "KeyD":break;
			default:return;
		}
		this.p = k.code;
	}
	this.spawnfood = function(){
		var overlap = false;
		do{
			overlap = false;
			this.food = new Seg(Math.round(Math.random()*(t-1)),Math.round(Math.random()*(t-1)));
			for (var i = 0; i < this.segs.length; i++)
				if (this.segs[i].eq(this.food))
					overlap = true;
		}while(overlap);
	}
	this.collide = function(h){
		if (h.x<0||h.x>=t||h.y<0||h.y>=t)
			return true;
		for (var i = 0; i < this.segs.length-1; i++)
			if (h.eq(this.segs[i]))
				return true;
		return false;
	}
	var head = function(){
		return this.segs[this.segs.length-1];
	}.bind(this);
	this.move = function(){
		var d = 0;
		switch (this.p){
			case "KeyW":	d = 0;	break;
			case "KeyA":	d = 1;	break;
			case "KeyS":	d = 2;	break;
			case "KeyD":	d = 3;	break;
			default:	return;
		}
		if (Math.abs(this.dir-d)%2!=0 || this.segs.length == 1)
			this.dir = d;
		var next;
		var h = head();
		switch(this.dir){
			case 0:		next = new Seg(h.x,		h.y-1);	break;
			case 1:		next = new Seg(h.x-1,	h.y);	break;
			case 2:		next = new Seg(h.x,		h.y+1);	break;
			case 3:		next = new Seg(h.x+1,	h.y);	break;
		}
		this.segs.push(next);
		if (!next.eq(this.food))
			this.segs.splice(0,1);
		else this.spawnfood();
		if (this.collide(head()))
			this.init();
	}
}
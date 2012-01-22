/**
 * @author pjnovas
 */

/* TODO:

- fix the removeEventListener

 */

var Invaders404 = Class.extend({
	init : function(options) {
		this.canvas = null;
		this.ctx = null;

		this.loopInterval = 30;
		this.currentDir = [];

		this.shield = {};
		this.ship = {};
		this.invasion = {};

		this.initCanvas();
		
		this.onLoose = options.onLoose || function(){};
		this.onWin = options.onWin || function(){};

		this.isOnGame = false;

		
		/* FPS Info */
		this.fps = 0
		this.now = null;
		this.lastUpdate = (new Date) * 1 - 1;
		this.fpsFilter = this.loopInterval;

		var self = this;
		var fpsOut = document.getElementById('fps');
		setInterval(function() {
			fpsOut.innerHTML = self.fps.toFixed(1) + "fps";
		}, 1000);
		/* End FPS Info */
	},
	initCanvas : function() {
		this.canvas = document.getElementById('canvas');
		this.ctx = this.canvas.getContext('2d');
	},
	start : function() {
		this.build();
		this.loop();
	},
	build : function() {
		var self = this;

		this.shield = new Shield({
			ctx : this.ctx,
			x : 100,
			y : 290,
			brickSize : 12,
			color : '#fff'
		});

		var cnvW = this.canvas.width;

		this.ship = new Ship({
			ctx : this.ctx,
			shield : this.shield,
			maxMoveLeft : 5,
			maxMoveRight : cnvW - 10,
			x : ((cnvW - 10) / 2),
			y : 370,
			color : '#1be400',
			onShipHit : function() {
				self.stop();
				self.onLoose();
			}
		});

		this.invasion = new Invasion({
			ctx : this.ctx,
			x : 20,
			y : 10,
			shield : this.shield,
			ship : this.ship,
			onAliensClean : function() {
				self.stop();
				self.onWin();
			}
		});

		this.ship.invasion = this.invasion;

		this.currentDir = [];

		this.isOnGame = true;
		this.bindControls();
	},
	loop : function() {
		this.update();
		this.draw();

		if(this.isOnGame) {
			var self = this;
			setTimeout(function() {
				self.loop();
			}, self.loopInterval);
		}
	},
	update : function() {
		this.shield.update();
		this.ship.update(this.currentDir);
	},
	draw : function() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.shield.draw();
		this.ship.draw();
		this.invasion.draw();

		/* FPS Info */
		var thisFrameFPS = 1000 / ((this.now = new Date) - this.lastUpdate);
		this.fps += (thisFrameFPS - this.fps) / this.fpsFilter;
		this.lastUpdate = this.now;
		/* End FPS Info */
	},
	bindControls : function(params) {
		var self = this;
		var gameKeys = [Keyboard.Space, Keyboard.Left, Keyboard.Right];

		function getAction(code) {
			switch (code) {
				case Keyboard.Space:
					return Controls.Shoot;
				case Keyboard.Left:
					return Controls.Left;
				case Keyboard.Right:
					return Controls.Right;
			}

			return null;
		}


		document.addEventListener('keydown', function(event) {
			if(self.isOnGame) {
				var key = event.keyCode;

				if(gameKeys.indexOf(key) > -1) {
					var dir = getAction(key);

					if(self.currentDir.indexOf(dir) === -1)
						self.currentDir.push(dir);

					event.stopPropagation();
					event.preventDefault();
					return false;
				}
			}
		});

		document.addEventListener('keyup', function(event) {
			if(self.isOnGame) {
				var key = event.keyCode;

				var dir = getAction(key);
				var pos = self.currentDir.indexOf(dir);
				if(pos > -1)
					self.currentDir.splice(pos, 1);
			}
		});
	},
	unbindControls : function(params) {
		document.removeEventListener('keydown', function() {
		});
		document.removeEventListener('keyup', function() {
		});
	},
	destroy : function() {
		this.shield.destroy();
		this.invasion.destroy();
		this.ship.destroy();
	},
	stop : function() {
		//this.unbindControls();
		this.isOnGame = false;

		for(var i = 0; i < this.currentDir.length; i++)
		this.currentDir[i] = null;

		this.currentDir = [];

		this.destroy();
	}
});

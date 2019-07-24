
var getTimeNow = function () {
   return +new Date();
};

// 游戏引擎
var Game = function (gameName, canvasId) {
   var canvas = document.getElementById(canvasId),
       self = this; // Used by key event handlers below

   // General
   
   this.context = canvas.getContext('2d');
   this.gameName = gameName;
   this.sprites = [];
   this.keyListeners = [];

   // High scores

   this.HIGH_SCORES_SUFFIX = '_highscores';

   // Image loading
   
   this.imageLoadingProgressCallback;
   this.images = {};
   this.imageUrls = [];
   this.imagesLoaded = 0;
   this.imagesFailedToLoad = 0;
   this.imagesIndex = 0;

   // Time
   
   this.startTime = 0;
   this.lastTime = 0;
   this.gameTime = 0;
   this.fps = 0;
   this.STARTING_FPS = 60;

   this.paused = false;
   this.startedPauseAt = 0;
   this.PAUSE_TIMEOUT = 100;

   // Sound

   this.soundOn = true;
   this.soundChannels = [];
   this.audio = new Audio();
   this.NUM_SOUND_CHANNELS = 10;

   for (var i=0; i < this.NUM_SOUND_CHANNELS; ++i) {
      var audio = new Audio();
      this.soundChannels.push(audio);
   }

   // The this object in the following event handlers is the
   // DOM window, which is why the functions call
   // self.keyPressed() instead of this.keyPressed(e).

   window.onkeypress = function (e) { self.keyPressed(e)  };
   window.onkeydown  = function (e) { self.keyPressed(e); };

   return this;
};

Game.prototype = {

  // 获取图片
   getImage: function (imageUrl) {
      return this.images[imageUrl];
   },
   
  // 加载图片
   imageLoadedCallback: function (e) {
      this.imagesLoaded++;
   },

  // 错误callback
   imageLoadErrorCallback: function (e) {
      this.imagesFailedToLoad++;
   },

   // 加载图片
   loadImage: function (imageUrl) {
      var image = new Image(),
          self = this; // load and error event handlers called by DOMWindow

      image.src = imageUrl;

      image.addEventListener('load',
         function (e) {
            self.imageLoadedCallback(e); 
         });

      image.addEventListener('error',
         function (e) {
            self.imageLoadErrorCallback(e);
         });

      this.images[imageUrl] = image;
   },


   loadImages: function () {

      // If there are images left to load

      if (this.imagesIndex < this.imageUrls.length) {
         this.loadImage(this.imageUrls[this.imagesIndex]);
         this.imagesIndex++;
      }

      // Return the percent complete

      return (this.imagesLoaded + this.imagesFailedToLoad) /
              this.imageUrls.length * 100;
   },

   queueImage: function (imageUrl) {
      this.imageUrls.push(imageUrl);
   },
   
   // Game loop..................................................................

   // 获取目前时间
  getTime: function () {
    return getTimeNow();
  },

   // 游戏循环
   start: function () {
      var self = this;
      this.startTime = getTimeNow();
      window.requestNextAnimationFrame(
         function () {

            var time = getTimeNow();
            self.animate.call(self, time);
         });
   },

   animate: function (time) {
      var self = this;
      
      if (this.paused) {
         setTimeout( function () {
            window.requestNextAnimationFrame(
               function (time) {
                  self.animate.call(self, time);
               });
         }, this.PAUSE_TIMEOUT);
      }
      else {
         this.tick(time);
         this.clearScreen();

         this.startAnimate(time);
         this.paintUnderSprites();

         this.updateSprites(time);
         this.paintSprites(time);

         this.paintOverSprites(time);
         this.endAnimate();

         this.lastTime = time;


         window.requestNextAnimationFrame(
            function () {
               var time = getTimeNow();
               self.animate.call(self, time);
            });
      }
   },

   tick: function (time) {
      this.updateFrameRate(time);
      this.gameTime = (getTimeNow()) - this.startTime;
   },

   updateFrameRate: function (time) {
      if (this.lastTime === 0) this.fps = this.STARTING_FPS;
      else                     this.fps = 1000 / (time - this.lastTime);
   },

   clearScreen: function () {
      this.context.clearRect(0, 0,
         this.context.canvas.width, this.context.canvas.height);
   },

   updateSprites: function (time) {
      for(var i=0; i < this.sprites.length; ++i) {
         var sprite = this.sprites[i];
         sprite.update(this.context, time);
      };
   },


   paintSprites: function (time) {
      for(var i=0; i < this.sprites.length; ++i) {
         var sprite = this.sprites[i];
         if (sprite.visible)
            sprite.paint(this.context);
      };
   },


   togglePaused: function () {
      var now = getTimeNow();

      this.paused = !this.paused;

      if (this.paused) {
         this.startedPauseAt = now;
      }
      else { // not paused
         // Adjust start time, so game starts where it left off when
         // the user paused it.

         this.startTime = this.startTime + now - this.startedPauseAt;
         this.lastTime = now;
      }
   },


   pixelsPerFrame: function (time, velocity) {
      // Sprites move a certain amount of pixels per frame (pixels/frame).
      // This methods returns the amount of pixels a sprite should move
      // for a given frame. Sprite velocity is measured in pixels / second,
      // so: (pixels/second) * (second/frame) = pixels/frame:

      return velocity / this.fps;  // pixels / frame
   },


  // 记录榜
   getHighScores: function () {
      var key = this.gameName + this.HIGH_SCORES_SUFFIX,
          highScoresString = localStorage[key];

      if (highScoresString == undefined) {
         localStorage[key] = JSON.stringify([]);
      }
      return JSON.parse(localStorage[key]);
   },

   // Sets the high score in local storage.

   setHighScore: function (highScore) {
      var key = this.gameName + this.HIGH_SCORES_SUFFIX,
          highScoresString = localStorage[key];

     highScoresString.unshift(highScore);
      localStorage[key] = JSON.stringify(highScores);
   },


   clearHighScores: function () {
      localStorage[this.gameName + this.HIGH_SCORES_SUFFIX] = JSON.stringify([]);
   },


   addKeyListener: function (keyAndListener) {
      this.keyListeners.push(keyAndListener);
   },
   

   findKeyListener: function (key) {
      var listener = undefined;
      
      for(var i=0; i < this.keyListeners.length; ++i) {
         var keyAndListener = this.keyListeners[i],
             currentKey = keyAndListener.key;
         if (currentKey === key) {
            listener = keyAndListener.listener;
         }
      };
      return listener;
   },


   keyPressed: function (e) {
      var listener = undefined,
          key = undefined;

      switch (e.keyCode) {
         // Add more keys as needed

         case 32: key = 'space';        break;
         case 68: key = 'd';            break;
         case 75: key = 'k';            break;
         case 83: key = 's';            break;
         case 80: key = 'p';            break;
         case 37: key = 'left arrow';   break;
         case 39: key = 'right arrow';  break;
         case 38: key = 'up arrow';     break;
         case 40: key = 'down arrow';   break;
      }

      listener = this.findKeyListener(key);
      if (listener) { // listener is a function
         listener();  // invoke the listener function
      }
   },

    // 音频
   canPlayOggVorbis: function () {
      return "" != this.audio.canPlayType('audio/ogg; codecs="vorbis"');
   },

   canPlayMp3: function () {
      return "" != this.audio.canPlayType('audio/mpeg');
   },

   getAvailableSoundChannel: function () {
      var audio;
      
      for (var i=0; i < this.NUM_SOUND_CHANNELS; ++i) {
         audio = this.soundChannels[i];

         if (audio.played.length === 0 || audio.ended) {
            return audio;
         }
      }
      return undefined; // all channels in use
   },

   playSound: function (id) {
      var channel = this.getAvailableSoundChannel(),
          element = document.getElementById(id);

      if (channel && element) {
         channel.src = element.src === '' ? element.currentSrc : element.src;
         channel.load();
         channel.play();
      }
   },


   addSprite: function (sprite) {
      this.sprites.push(sprite);
   },
   

   getSprite: function (name) { 
      for(i in this.sprites) {
         if (this.sprites[i].name === name)
            return this.sprites[i];
      }
      return null;      
   },


   startAnimate:      function (time) { },
   paintUnderSprites: function ()     { },
   paintOverSprites:  function ()     { },
   endAnimate:        function ()     { }
};

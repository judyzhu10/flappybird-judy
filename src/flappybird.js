/**
 * Created by zhuling on 2019/7/17.
 */

(function () {
  const game = new Game('flappybird', 'canvas');
  const canvasDom = document.getElementById('canvas');
  const canvasWidth = canvasDom.width;
  const canvasHeight = canvasDom.height;


  const BACK_GROUND_VELOCITY  = 300;

  const ctx = canvasDom.getContext('2d');

  const imgList = ['./images/bg.png', './images/ground.png', './images/holdback.png', './images/bird.png'];

  imgList.forEach(function(item) {
    game.queueImage(item);
    game.loadImages();
  });


  const bgImage = game.getImage(imgList[0]);
  const groundImage = game.getImage(imgList[1]);
  const hoseImage = game.getImage(imgList[2]);
  const birdImage = game.getImage(imgList[3]);

  // 图片宽高
  var bgImageWidth, bgImageHeight, groundImageWidth, groundImageHeight, groundImageY;

  var backgroundOffsetX = 0;

  var hoseOffsetX = 0;

  var FLY_ANIMATION_RATE = 30;

  var lastAdvanceTime = 0;

  /* 水管区域开始 */

  var hoseSpacingX = 300;
  var hoseSpacingY = 240;
  var numHoses = 4;
  var hoseBoxWidth = 148 + hoseSpacingX;
  var hoseWidth = 148;

  var hoseSpriteList = [];
  var HOSE_DOWN_RECT = [10, 0, 148, 802];
  var HOSE_UP_RECT = [160, 820, 148, 802];

  var BIRD_WIDTH = 87;
  var BIRD_HEIGHT = 60;

  var score = 0;

  var SCORE_TOP = 50;

  var FONT = '60px Georgia';

  game.context.font = FONT;
  game.context.fillStyle = 'black';
  game.context.strokeStyle = 'while';


  var birdCells = [
    {top: 0, left: 0, width: BIRD_WIDTH, height: BIRD_HEIGHT},
    {top: BIRD_HEIGHT, left: 0, width: BIRD_WIDTH, height: BIRD_HEIGHT},
    {top: BIRD_HEIGHT * 2, left: 0, width: BIRD_WIDTH, height: BIRD_HEIGHT},
  ];

  // const $video = document.getElementById('advertisement-video');

  // 进来先加载游戏东西，有进度条加载完毕开始播放视频

  // 视频进度监听
  // $video.addEventListener('timeupdate', handleTimeupdate);

  // 结束时 初始化游戏状态 并添加求求小鸟号召

  // 监听touchend事件，触发gamestart

  // 接下来就是游戏的事了

  // const handleTimeupdate = (timeupdate) => {
  //
  // }

  // 绘制背景图片
  function paintBackGround () {
    game.context.drawImage(bgImage, 0, 0, bgImageWidth, bgImageHeight, 0, 0, canvasWidth, canvasHeight);
  }

  // 绘制分数
  function paintScore() {
    var textWidth = game.context.measureText(score).width;
    var left = (canvasWidth / 2) - textWidth;
    game.context.fillText(score, left - 1, SCORE_TOP - 1);
    game.context.strokeText(score, left, SCORE_TOP);
  }

  // 绘制地板
  var updateGroundOffsetX = {
     execute: function (sprite, context, time) {
      const diffTime = time - game.lastTime;
      const stretch = diffTime * BACK_GROUND_VELOCITY / 1000;

      backgroundOffsetX += stretch;

      if (backgroundOffsetX > canvasWidth) {
        backgroundOffsetX = 0;
      }
    }
  }

  var paintGround = {
    paint: function (sprite, ctx) {
      // 下水管
      ctx.save();
      ctx.translate(- backgroundOffsetX, 0);
      ctx.drawImage(groundImage, 0, 0, groundImageWidth, groundImageHeight, 0, groundImageY, canvasWidth, groundImageHeight);
      ctx.drawImage(groundImage, 0, 0, groundImageWidth, groundImageHeight, canvasWidth, groundImageY, canvasWidth, groundImageHeight);
      ctx.restore();
    }
  }


  // FIXME 此处的管子高度可能有问题
  var paintHose = {
    paint: function (sprite, context) {
      ctx.rect(0, 0, 20, 20);
      ctx.save();
      ctx.translate(- hoseOffsetX, 0);
      // 上水管
      ctx.drawImage(hoseImage, HOSE_UP_RECT[0], HOSE_UP_RECT[1], HOSE_UP_RECT[2], - sprite.height.upY, sprite.left, sprite.top, sprite.width, sprite.height.upY);
      // 下水管
      ctx.drawImage(hoseImage, HOSE_DOWN_RECT[0], HOSE_DOWN_RECT[1], HOSE_DOWN_RECT[2], groundImageY - sprite.height.downY, sprite.left, sprite.height.downY, sprite.width, groundImageY - sprite.height.downY);
      ctx.restore();
    }
  }

  // 判断水管是否在视窗外
  function isHoseInView (hoseSprint) {
      if ((hoseSprint.left + hoseSprint.width) < hoseOffsetX) {
        return false
      }
      return true
  }

  // FIXME 底下的管子长度好像受限制了
  function randomHeight() {
    var height = {};
    //下面障碍在y轴的最上的位置 58为管子头部
    var downMaxY =  groundImageY - hoseSpacingY - 58;

    //下面障碍在y轴的最下的位置
    var downMinY = groundImageY - 58;

    //在downMinY和downMaxY之间随机位置
    height.downY = downMinY + (downMaxY - downMinY) * Math.random() >> 0;
    height.upY = height.downY - hoseSpacingY;
    return height;
  }

  // 更新管子，在第一根移出时就移动到队尾
  var updateHoses = {

    execute: function (sprite, ctx, time) {
      if (game.lastTime === 0 || birdSprite.isDead) return
      const diffTime = time - game.lastTime;
      const stretch = diffTime * BACK_GROUND_VELOCITY / 1000;

      hoseOffsetX += stretch;

      if (!isHoseInView(hoseSpriteList[0])) {
        var outHose = hoseSpriteList.shift();
        outHose.left = outHose.left + hoseBoxWidth * numHoses;
        outHose.height = randomHeight();
        hoseSpriteList.push(outHose);
      }
    }
  }

  var paintHoses = {
    paint: function (sprite, ctx) {
      for (var i = 0; i < hoseSpriteList.length; i++) {
        hoseSpriteList[i].paint(ctx);
      }
    }
  }

  /* 水管区域结束 */

  /* 主角区域开始 */

  var flyBehavior = {
    execute: function (sprite, ctx, time) {
      if (sprite.flyAnimationRate === 0 || game.lastTime === 0) {
        return;
      }

      if (lastAdvanceTime === 0) {
        lastAdvanceTime = time;
      } else if (time - lastAdvanceTime > 1000 / sprite.flyAnimationRate) {
        sprite.artist.advance();
        lastAdvanceTime = time;
      }
    }
  };

  var jumpBehavior = {
    execute: function (sprite, ctx, time) {
      if (sprite.isDead) return
      var animationTime = (time - sprite.lastUpAnimation);
      var distance = sprite.initVelocity * animationTime - 0.5 * sprite.gravity * animationTime * animationTime;
      var y = sprite.flyStartY - distance;

      // FIXME 旋转还有点问题
      if (y <= groundImageY) {
        sprite.top = y;
        if(distance > 0 && !sprite.isUp){
        //   往上飞时，角度上仰20度
        //   sprite.rotation = -(20 * Math.PI / 180);
          sprite.isUp = true;
        }else if(distance < 0 && sprite.isUp){
          // 往下跌落时，角度往下90度
          // sprite.rotation = 90 * Math.PI / 180;
          sprite.isUp = false;
        }
      } else {
        sprite.top = groundImageY;
        handleBirdDead(sprite);
      }
    }
  };

  var fallBehavior = {
    execute: function (sprite, ctx, time) {
      if (!sprite.isDead) return
      var animationTime = (time - sprite.lastUpAnimation);
      var distance = - 0.5 * sprite.gravity * animationTime * animationTime;
      var y = sprite.flyStartY - distance;

      // FIXME 旋转还有点问题
      if (y > groundImageY) {
        sprite.top = groundImageY;
      } else {
        sprite.top = y;
      }
    }
  }

  var collideBehavior = {
    isCollide: function (rect1, rect2) {
      if(rect1.left < rect2.left + rect2.width &&
        rect1.left + rect1.width > rect2.left &&
        rect1.top < rect2.top + rect2.height &&
        rect1.height + rect1.top > rect2.top) {
        return true
      } else {
        return false
      }
    },


    execute: function (sprite, ctx, time) {
      if (sprite.isDead) return
      var hoseSprite = hoseSpriteList[0];
      var hoseSpriteLeft = hoseSprite.left - hoseOffsetX;
      var spriteRect = { left: sprite.left, top: sprite.top, width: sprite.width, height: sprite.height };
      var upHoseRect = { left: hoseSpriteLeft , top: hoseSprite.top, width: hoseSprite.width, height: hoseSprite.height.upY };
      var downHoseRect = { left: hoseSpriteLeft, top: hoseSprite.height.downY, width: hoseSprite.width, height: groundImageY - hoseSprite.height.downY };
      if (this.isCollide(spriteRect, upHoseRect) || this.isCollide(spriteRect, downHoseRect)) {
        handleBirdDead(sprite);
      }
    }
  }

  // var fallBehavior = {
  //   execute: function (sprite, ctx, time) {
  //
  //   }
  // }


  // 精灵对象

  // 水管群
  var hosesSprite = new Sprite('hosesSprite', paintHoses, [updateHoses]);

  // 地板
  var groundSprite = new Sprite('groundSprite', paintGround, [updateGroundOffsetX]);

  // var birdSprite = new Sprite('birdSprite', new SpriteSheetArtist(birdImage, birdCells), [runBehavior, jumpBehavior, fallBehavior]);
  var birdSprite = new Sprite('birdSprite', new SpriteSheetArtist(birdImage, birdCells), [flyBehavior, jumpBehavior, collideBehavior, fallBehavior]);


  // 将精灵对象加入游戏引擎队列
  game.addSprite(groundSprite);

  game.paintUnderSprites = function() {
    paintBackGround();
  }

  game.paintOverSprites = function () {
    paintScore();
  }



  game.start();

  function createHosesSprite() {
    for (var i = 0; i < numHoses; i++) {
      var name = 'hose' + i;
      var hoseSprite = new Sprite(name, paintHose);
      hoseSprite.height = randomHeight();
      // 第一个管子在视窗后一个
      hoseSprite.left = canvasWidth + hoseBoxWidth * (i + 1);
      hoseSprite.width = hoseWidth;
      hoseSprite.top = 0;
      hoseSpriteList.push(hoseSprite);
    }
    game.addSprite(hosesSprite);
  }

  function createBirdSprite() {
    birdSprite.width = BIRD_WIDTH;
    birdSprite.height = BIRD_HEIGHT;
    birdSprite.flyAnimationRate = FLY_ANIMATION_RATE;
    birdSprite.flyHeight = 80;
    birdSprite.gravity = 10 / 1000 * 0.3;
    birdSprite.initVelocity = Math.sqrt(2 * birdSprite.flyHeight * birdSprite.gravity);
    birdSprite.flyStartY = groundImageY / 2;
    birdSprite.isDead = false;
    birdSprite.top = birdSprite.flyStartY;
    birdSprite.left = 80;
    birdSprite.lastUpAnimation = game.getTime();
    birdSprite.jump = function () {
      this.lastUpAnimation = game.getTime();
      // this.rotation = 20 * Math.PI / 180;
      // this.rotation = 20 * Math.PI / 180;
      this.flyStartY = this.top;
    }
    game.addSprite(birdSprite);
  }

  function handleBirdDead(sprite) {
    sprite.isDead = true;
    sprite.lastUpAnimation = game.getTime();
    sprite.flyStartY = sprite.top;
    sprite.rotation = 90 * Math.PI / 180;
  }

  function createGroundSprite() {

  }
  
  function showScore() {

  }

  function init() {
    bgImageWidth = bgImage.width;
    bgImageHeight = bgImage.height;

    groundImageWidth = groundImage.width;
    groundImageHeight = groundImage.height;
    groundImageY = canvasHeight - groundImageHeight;

    createHosesSprite();
    createBirdSprite();
  }

  var intervalId = 0;
  intervalId = setInterval(function () {
    var progress = game.loadImages();
    if (progress === 100) {
      clearInterval(intervalId);
      init();
      game.start();
    }
  }, 1000)

  window.addEventListener('keydown', function (e) {
    var key = e.keyCode,
      SLOW_MOTION_RATE = 0.2;


    if (key === 74) { // 'j' key
      birdSprite.jump();
    }
  });


})()
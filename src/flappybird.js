/**
 * Created by zhuling on 2019/7/17.
 */

(function () {
  const game = new Game('flappybird', 'canvas');
  const canvasDom = document.getElementById('canvas');
  const canvasWidth = canvasDom.width;
  const canvasHeight = canvasDom.height;
  const restartDom = document.getElementById('restart');
  const guideDom = document.getElementById('guide');
  const videoDom = document.getElementById('advertisement-video');
  const loadingDom = document.getElementById('loading');
  const viewportDom = document.getElementById('viewport');

  /* 常量开始 */
  const BACK_GROUND_VELOCITY  = 300;
  var FLY_ANIMATION_RATE = 30;

  var HOSE_SPACING_X = 300;
  var HOSE_SPACING_Y = 240;
  var NUMBER_HOSES = 4;
  var HOSE_BOX_WIDTH = 148 + HOSE_SPACING_X;
  var HOSE_WIDTH = 148;

  var HOSE_DOWN_RECT = [10, 0, 148, 802];
  var HOSE_UP_RECT = [160, 820, 148, 802];

  var BIRD_WIDTH = 87;
  var BIRD_HEIGHT = 60;
  var BIRD_LEFT = 80;

  var SCORE_TOP = 50;

  var FONT = '60px Georgia';

  var BIRD_CELLS = [
    {top: 0, left: 0, width: BIRD_WIDTH, height: BIRD_HEIGHT},
    {top: BIRD_HEIGHT, left: 0, width: BIRD_WIDTH, height: BIRD_HEIGHT},
    {top: BIRD_HEIGHT * 2, left: 0, width: BIRD_WIDTH, height: BIRD_HEIGHT},
  ];

  var first = true;

  var TEXT_CELLS = {};
  var TEXT_CELLS = {
    1: [
      {
        text: '误入水管群的小鸟',
        x: 100,
        y: 300,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      },
      {
        text: '需要从间隙中穿行',
        x: 400,
        y: 500,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      }
    ],
    2: [
      {
        text: '误入水管群的小鸟',
        x: 100,
        y: 300,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      },
      {
        text: '需要从间隙中穿行',
        x: 400,
        y: 500,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      }
    ],
    3: [
      {
        text: '稍有不慎',
        x: 300,
        y: 400,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      },
      {
        text: '就会被水管撞晕在地（成了烧烤店的烤物）',
        x: 10,
        y: 20,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      },
      {
        text: '（成了烧烤店的烤物）',
        x: 10,
        y: 20,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      }
    ],
    3: [
      {
        text: '（成了烧烤店的烤物）',
        x: 10,
        y: 20,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      },
      {
        text: '（成了烧烤店的烤物）',
        x: 10,
        y: 20,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      },
      {
        text: '而我们要做的！',
        x: 10,
        y: 20,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      },
      {
        text: '点击屏幕指引小鸟',
        x: 10,
        y: 20,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      },
      {
        text: '顺利通过障碍',
        x: 10,
        y: 20,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      }
    ],
    4: [
      {
        text: '点 点',
        x: 10,
        y: 20,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      },
      {
        text: '点',
        x: 10,
        y: 20,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      },
      {
        text: '点！',
        x: 10,
        y: 20,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      }
    ],
    5: [
      {
        text: '紧急！！！',
        x: 10,
        y: 20,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      },
      {
        text: '小鸟迷茫了！！！',
        x: 10,
        y: 20,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      },
      {
        text: '该你出手了！',
        x: 10,
        y: 20,
        font: '60px Georgia',
        fillStyle: 'black',
        strokeStyle: 'yellow',
      }
    ],
  };

  // /* 常量结束 */



  /* 变量开始 */

  // 图片宽高
  var bgImageWidth, bgImageHeight, groundImageWidth, groundImageHeight, groundImageY;

  var lastAdvanceTime = 0;

  var hoseSpriteList = [];
  var score = 0;

  var videoEnd = false;

  var firstTime = true;
  /* 变量结束 */



  const imgList = ['./src/images/bg.png', './src/images/ground.png', './src/images/holdback.png', './src/images/bird.png'];

  imgList.forEach(function(item) {
    game.queueImage(item);
    game.loadImages();
  });


  const bgImage = game.getImage(imgList[0]);
  const groundImage = game.getImage(imgList[1]);
  const hoseImage = game.getImage(imgList[2]);
  const birdImage = game.getImage(imgList[3]);


  game.context.font = FONT;
  game.context.fillStyle = 'black';
  game.context.strokeStyle = 'while';
  game.startFly = false;



  // 游戏缩放
  function calculateViewportScale() {
    var scale = 0;
    var clientWidth = document.documentElement.clientWidth;
    var clientHeight = document.documentElement.clientHeight;
    var scaleWidth = clientWidth / canvasWidth;
    var scaleHeight = clientHeight / canvasHeight;
    if (scaleWidth < scaleHeight) {
      scale = scaleWidth;
    } else {
      scale = scaleHeight;
    }
    scale = scale.toFixed(2);
    viewportDom.content = "width=device-width,height=device-height,initial-scale=" + scale + ",user-scalable=no";
  }

  calculateViewportScale();
  
  function handleRestart() {
    restartDom.style.display = 'none';
    guideDom.style.display = 'block';
    game.startFly = false;
    score = 0;
    initGround();
    initBirdSprite();
    initHosesSprite();
  }

  function handleBirdDead(sprite) {
    sprite.isDead = true;
    sprite.lastUpAnimation = game.getTime();
    sprite.flyStartY = sprite.top;
    birdSprite.flyAnimationRate = 0;
    sprite.rotation = 90 * Math.PI / 180;
  }

  // 判断水管是否在视窗外
  function isHoseInView (hoseSprint, sprite) {
    if ((hoseSprint.left + hoseSprint.width) < sprite.hoseOffsetX) {
      return false
    }
    return true
  }

  // FIXME 底下的管子长度好像受限制了
  function randomHeight() {
    var height = {};
    //下面障碍在y轴的最上的位置 58为管子头部
    var downMaxY = groundImageY - (groundImageY - HOSE_SPACING_Y - 100);

    //下面障碍在y轴的最下的位置
    var downMinY = groundImageY - 100;

    //在downMinY和downMaxY之间随机位置
    height.downY = downMinY + (downMaxY - downMinY) * Math.random();
    // height.downY = downMinY + (downMaxY - downMinY) * Math.random() >> 0;
    height.upY = height.downY - HOSE_SPACING_Y;
    return height;
  }

  /* Behavior 开始 */

  // ground移动
  var updateGroundOffsetXBehavior = {
     execute: function (sprite, context, time) {
      const diffTime = time - game.lastTime;
      const stretch = diffTime * BACK_GROUND_VELOCITY / 1000;

       sprite.backgroundOffsetX += stretch;

      if (sprite.backgroundOffsetX > canvasWidth) {
        sprite.backgroundOffsetX = 0;
      }
    }
  }

  // bird飞翔图片切换
  var flyBehavior = {
    execute: function (sprite, ctx, time) {
      // if (score === 6 && hoseSpriteList[0].left - hosesSprite.hoseOffsetX < birdSprite.left + birdSprite.width && first) {
      //   first = false;
      //   game.togglePaused();
      // }
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

  // bird向上飞
  var jumpBehavior = {
    execute: function (sprite, ctx, time) {
      if (sprite.isDead || !game.startFly) return
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

  // bird下落
  var fallBehavior = {
    execute: function (sprite, ctx, time) {
      if (!sprite.isDead || !game.startFly) return
      var animationTime = (time - sprite.lastUpAnimation);
      var distance = - 0.5 * sprite.gravity * animationTime * animationTime;
      var y = sprite.flyStartY - distance;

      // FIXME 旋转还有点问题
      if (y > groundImageY) {
        sprite.top = groundImageY;
        restartDom.style.display = 'block';
      } else {
        sprite.top = y;
      }
    }
  }

  // bird碰撞
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
      if (sprite.isDead || !game.startFly) return
      var hoseSprite = hoseSpriteList[0];
      var hoseSpriteLeft = hoseSprite.left - hosesSprite.hoseOffsetX;
      var spriteRect = { left: sprite.left, top: sprite.top, width: sprite.width, height: sprite.height };
      var upHoseRect = { left: hoseSpriteLeft , top: hoseSprite.top, width: hoseSprite.width, height: hoseSprite.height.upY };
      var downHoseRect = { left: hoseSpriteLeft, top: hoseSprite.height.downY, width: hoseSprite.width, height: groundImageY - hoseSprite.height.downY };
      if (this.isCollide(spriteRect, upHoseRect) || this.isCollide(spriteRect, downHoseRect)) {
        handleBirdDead(sprite);
      }
    }
  }

  // 水管移动
  var updateHosesBehavior = {

    execute: function (sprite, ctx, time) {
      if (game.lastTime === 0 || birdSprite.isDead || !game.startFly) return
      const diffTime = time - game.lastTime;
      const stretch = diffTime * BACK_GROUND_VELOCITY / 1000;

      sprite.hoseOffsetX += stretch;

      if (!isHoseInView(hoseSpriteList[0], sprite)) {
        score++;
        var outHose = hoseSpriteList.shift();
        outHose.left = outHose.left + HOSE_BOX_WIDTH * NUMBER_HOSES;
        outHose.height = randomHeight();
        hoseSpriteList.push(outHose);
      }
    }
  }

  /* Behavior 结束 */



  /* paint 开始 */

  // 绘制背景图片
  function paintBackGround () {
    // game.context.drawImage(bgImage, 0, 0, bgImageWidth, bgImageHeight, 0, 0, canvasWidth, canvasHeight);
  }

  // 绘制分数
  function paintScore() {
    var textWidth = game.context.measureText(score).width;
    var left = (canvasWidth / 2) - textWidth;
    game.context.fillText(score, left - 1, SCORE_TOP - 1);
    game.context.strokeText(score, left, SCORE_TOP);
  }

  // 绘制视频
  function paintVideoGuide() {
    const ctx = game.context;
    ctx.drawImage(videoDom, 0, 0, videoDom.videoWidth, videoDom.videoHeight, 0, 0, canvasWidth, canvasHeight);
    var textList = TEXT_CELLS[Math.floor(videoDom.currentTime)] || [];

    // 渲染在视频上的引导文字
    textList.forEach(function (item) {
      ctx.save();
      ctx.fillStyle = item.fillStyle;
      ctx.font = item.font;
      ctx.fillText(item.text, item.x, item.y);
      ctx.restore();
    })
  }

  // 绘制地板
  var paintGround = {
    paint: function (sprite, ctx) {
      // 下水管
      ctx.save();
      ctx.translate(- sprite.backgroundOffsetX, 0);
      ctx.drawImage(groundImage, 0, 0, groundImageWidth, groundImageHeight, 0, groundImageY, canvasWidth, groundImageHeight);
      ctx.drawImage(groundImage, 0, 0, groundImageWidth, groundImageHeight, canvasWidth, groundImageY, canvasWidth, groundImageHeight);
      ctx.restore();
    }
  }

  // 绘制水管
  var paintHose = {
    paint: function (sprite, ctx) {
      ctx.rect(0, 0, 20, 20);
      ctx.save();
      ctx.translate(- hosesSprite.hoseOffsetX, 0);
      // 上水管
      ctx.drawImage(hoseImage, HOSE_UP_RECT[0], HOSE_UP_RECT[1], HOSE_UP_RECT[2], - sprite.height.upY, sprite.left, sprite.top, sprite.width, sprite.height.upY);
      // 下水管
      ctx.drawImage(hoseImage, HOSE_DOWN_RECT[0], HOSE_DOWN_RECT[1], HOSE_DOWN_RECT[2], groundImageY - sprite.height.downY, sprite.left, sprite.height.downY, sprite.width, groundImageY - sprite.height.downY);
      ctx.restore();
    }
  }

  // 更新管子，在第一根移出时就移动到队尾

  var paintHoses = {
    paint: function (sprite, ctx) {
      for (var i = 0; i < hoseSpriteList.length; i++) {
        hoseSpriteList[i].paint(ctx);
      }
    }
  }

  /* paint 结束 */




  /* 精灵对象开始 */

  // 水管群
  var hosesSprite = new Sprite('hosesSprite', paintHoses, [updateHosesBehavior]);

  // 地板
  var groundSprite = new Sprite('groundSprite', paintGround, [updateGroundOffsetXBehavior]);

  // 鸟
  var birdSprite = new Sprite('birdSprite', new SpriteSheetArtist(birdImage, BIRD_CELLS), [flyBehavior, jumpBehavior, collideBehavior, fallBehavior]);

  /* 精灵对象结束 */


  /* 精灵对象初始化开始 */

  function initGround() {
    groundSprite.backgroundOffsetX = 0;
  }

  function initHosesSprite() {
    hoseSpriteList = [];
    hosesSprite.hoseOffsetX = 0;
    for (var i = 0; i < NUMBER_HOSES; i++) {
      var name = 'hose' + i;
      var hoseSprite = new Sprite(name, paintHose);
      hoseSprite.height = randomHeight();
      // 第一个管子在视窗后一个
      hoseSprite.left = canvasWidth + HOSE_BOX_WIDTH * (i + 1);
      hoseSprite.width = HOSE_WIDTH;
      hoseSprite.top = 0;
      hoseSpriteList.push(hoseSprite);
    }
  }

  function initBirdSprite() {
    birdSprite.width = BIRD_WIDTH;
    birdSprite.height = BIRD_HEIGHT;
    birdSprite.flyAnimationRate = FLY_ANIMATION_RATE;
    birdSprite.flyHeight = 80;
    birdSprite.gravity = 10 / 1000 * 0.3;
    birdSprite.initVelocity = Math.sqrt(2 * birdSprite.flyHeight * birdSprite.gravity);
    birdSprite.flyStartY = groundImageY / 2;
    birdSprite.isDead = false;
    birdSprite.top = birdSprite.flyStartY;
    birdSprite.left = BIRD_LEFT;
    birdSprite.lastUpAnimation = game.getTime();
    birdSprite.jump = function () {
      this.lastUpAnimation = game.getTime();
      // this.rotation = 20 * Math.PI / 180;
      // this.rotation = 20 * Math.PI / 180;
      this.flyStartY = this.top;
    }
  }

  /* 精灵对象初始化结束 */

  // 图片宽高赋值
  function init() {
    bgImageWidth = bgImage.width;
    bgImageHeight = bgImage.height;

    groundImageWidth = groundImage.width;
    groundImageHeight = groundImage.height;
    groundImageY = canvasHeight - groundImageHeight;
  }

  loadingDom.addEventListener('click', function (ev) {
    loadingDom.style.display = 'none';
    game.paintUnderSprites = paintVideoGuide;
    game.start();
    videoDom.play();
  })

  // 监听重新开始
  restartDom.addEventListener('click', handleRestart);

  // 监听j
  window.addEventListener('keydown', function (e) {
    var key = e.keyCode;

    if (key === 74) { // 'j' key
      if (!game.startFly) {
        guideDom.style.display = 'none';
        game.startFly = true;
        birdSprite.jump();
      } else {
        birdSprite.jump();
      }
    }
  });

  // iphone xs兼容性有点问题
  window.addEventListener('touchstart', function (e) {
    // 在小鸟飞行时防止页面放大
    if (!birdSprite.isDead) {
      e.preventDefault();
    }

    // 在视频没播放结束前点击事件无效
    if (!videoEnd) return

    // 游戏首次是和视频衔接的所以要特殊处理
    if (firstTime) {
      game.paintUnderSprites = paintBackGround;

      game.paintOverSprites =  paintScore;

      // 将水管、地板、鸟三个精灵对象加入游戏引擎
      game.addSprite(groundSprite);
      game.addSprite(hosesSprite);
      game.addSprite(birdSprite);

      firstTime = false;

      // game.startFly字段是用于区分在等待飞行和正在飞行
      game.startFly = true;
    }

    // 从等待区进入是需先移除等待图片
    if (!game.startFly) {
      guideDom.style.display = 'none';
      game.startFly = true;
    }

    // 小鸟向上飞行一次
    birdSprite.jump();
  })

  // 监听视频播放
  videoDom.addEventListener('canplaythrough', function () {
    loadingDom.innerText = '查看介绍';
  })

  // 监听视频播放结束
  videoDom.addEventListener('ended', function () {
    videoEnd = true;
    // 初始化图片大小
    init();

    initHosesSprite();
    initGround();
    initBirdSprite();

    birdSprite.flyStartY = 394.2955624232252;
    birdSprite.isDead = false;
    birdSprite.isUp = true;
    birdSprite.lastUpAnimation = 1564418990056;
    birdSprite.top = 394.2955624232252;


    // 地板重置
    groundSprite.backgroundOffsetX = 260.1;

    // 水管重置
    hosesSprite.hoseOffsetX = 3869.7000000000035;

    hoseSpriteList[0].height = {downY: 546.3124279722448, upY: 306.3124279722448};
    hoseSpriteList[0].left = 4036;
    hoseSpriteList[0].type = "hose2";

    hoseSpriteList[1].height = {downY: 340.8986725298381, upY: 100.89867252983811};
    hoseSpriteList[1].left = 4484;
    hoseSpriteList[1].type = "hose3";

    hoseSpriteList[2].height = {downY: 829.8579720183818, upY: 589.8579720183818};
    hoseSpriteList[2].left = 4932;
    hoseSpriteList[2].type = "hose0";

    hoseSpriteList[3].height = {downY: 857.0577861037434, upY: 617.0577861037434};
    hoseSpriteList[3].left = 5380;
    hoseSpriteList[3].type = "hose2";

    score = 6;

  })


})()
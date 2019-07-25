// 精灵图精灵对象
SpriteSheetArtist = function (spritesheet, cells) {
  this.cells = cells;
  this.spritesheet = spritesheet;
  this.cellIndex = 0;
};

SpriteSheetArtist.prototype = {
  paint: function (sprite, context) {
    var cell = this.cells[this.cellIndex];
    context.drawImage(this.spritesheet, cell.left, cell.top,
      cell.width, cell.height,
      sprite.left, sprite.top,
      cell.width, cell.height);
  },

  advance: function () {
    if (this.cellIndex === this.cells.length-1) {
      this.cellIndex = 0;
    }
    else {
      this.cellIndex++;
    }
  }
};


// 精灵对象
var Sprite = function (type, artist, behaviors) {
  var DEFAULT_WIDTH = 10,
    DEFAULT_HEIGHT = 10,
    DEFAULT_OPACITY = 1.0;

  this.artist    = artist;
  this.type      = type;
  this.behaviors = behaviors || [];

  this.hOffset   = 0;
  this.left      = 0;
  this.top       = 0;
  this.width     = DEFAULT_WIDTH;
  this.height    = DEFAULT_HEIGHT;
  this.velocityX = 0;
  this.velocityY = 0;
  this.opacity   = DEFAULT_OPACITY;
  this.visible   = true;
  this.rotation = 0;

};

Sprite.prototype = {
  paint: function (context) {
    context.save();

    context.globalAlpha = this.opacity;

    if (this.visible && this.artist) {
      this.artist.paint(this, context);
    }

    if (this.showCollisionRectangle) {
      this.drawCollisionRectangle(context);
    }

    context.restore();
  },

  update: function (context, time) {
    for (var i = 0; i < this.behaviors.length; ++i) {
      this.behaviors[i].execute(this, context, time);
    }
  },
};

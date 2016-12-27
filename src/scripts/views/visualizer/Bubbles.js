/**
 * Bubbles generator
 * @requires jQuery & TweenMax
 * @author Charlie
 */

var Bubbles = {

  /**
   * window reference
   * @type {jQuery}
   */
  $window     : $(window),

  /**
   * Bubble element wrapper
   * @type {jQuery}
   */
  $container  : null,

  /**
   * viewport width
   * @type {Number}
   */
  winWidth    : 0,

  /**
   * viewport height
   * @type {Number}
   */
  winHeight   : 0,

  /**
   * Bubble size classes
   * @type {Array}
   */
  sizeClasses : [ 'small', 'medium', 'big' ],

  bubbles: null,

  /**
   * Initializes Bubbles
   */
  initialize: function () {
    this.$container = $('<div>', {'class': 'bubbles-container'})
    this.winWidth   = this.$window.width();
    this.winHeight  = this.$window.height();
    this.flakes = []
    this.addEventlisteners();
    this.initBubbles();


    return this.$container
  },

  /**
   * Event listeners
   */
  addEventlisteners: function () {
    this.$window.resize($.proxy(this._onWindowResize, this));
  },

  /**
   * Initializes flakes
   */
  initBubbles: function () {
    this.createBubble();
  },

  /**
   * Creates bubbles
   */
  createBubble: function () {
    var $bubble = $('<div>', {'class': 'bubble'});
    var sizeClasses  = this.sizeClasses[ this._randomNumber(0, this.sizeClasses.length - 1) ];
    var rightPos   = this._randomNumber(100, -100);
    var opacity    = this._randomNumber(50, 90) / 100;

    TweenLite.set( $bubble, { y: window.innerHeight })

    $bubble.addClass(sizeClasses)
              .prependTo(this.$container)
              .css({
                'right'   : rightPos + '%',
                'opacity' : opacity
              });

    setTimeout($.proxy(this.createBubble, this), this._randomNumber(100, 300));
    this.animateFlake($bubble);
  },

  /**
   * Animates element
   * @param  {jQuery} $bubble
   */
  animateFlake: function ($bubble) {
    var self = this
    var duration = this._randomNumber(10, 20);
    var right = this._randomNumber(this.winWidth / 3, this.winWidth) /* go left */ * - 1;

    //make it fall
    TweenLite.to($bubble, duration, {
      'y'        : -this.winHeight * 1.1,
      'ease'     : 'Linear.easeNone',
      onComplete : function () {
        $bubble.remove();
      }
    });
  },


  beat: function() {},

  /**
   * Generates random number
   * @param  {Number} from
   * @param  {Number} to
   * @return {Number} random value
   */
  _randomNumber: function (from, to) {
    return Math.floor( Math.random() * (to-from+1) + from);
  },

  /**
   * Resize event hanlder
   * @param {Object} event object
   */
  _onWindowResize: function (event) {
    this.winWidth   = this.$window.width();
    this.winHeight  = this.$window.height();
  }

};

module.exports = Bubbles;

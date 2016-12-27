/**
 * Spin.js loader icon configuration
 *
 * @author  Christopher Pappas <chris@wintr.us>
 * @date    2.18.14
 */

var opts = {
  lines: 7, // The number of lines to draw
  length: 6, // The length of each line
  width: 3, // The line thickness
  radius: 6, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#fff', // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 78, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: 'auto', // Top position relative to parent in px
  left: 'auto' // Left position relative to parent in px
};


var SpinIcon = function (options) {
  this.target = options.target
  this.options = _.extend(opts, options)
  return this.init()
}

SpinIcon.prototype.init = function (options) {
  this.spinner = new Spinner(opts).spin(this.target);
  this.$el = $(this.spinner.el)
  TweenLite.set( this.$el, { autoAlpha: 0 })
  this.hide()
}

SpinIcon.prototype.show = function () {
  TweenLite.to( this.$el, .2, {
    autoAlpha: 1
  })
}

SpinIcon.prototype.hide = function () {
  TweenLite.to( this.$el, .2, {
    autoAlpha: 0
  })
}

module.exports = SpinIcon
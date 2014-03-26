
var Klass = function (options) {
  this.options = options || {};
  this.initialize.apply(this, arguments);
}

_.extend( Klass.prototype, Backbone.Events, {

  /**
   * Default constructor
   * @param {Object} options
   */
  initialize: function () {},

})

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var extend = function(protoProps, classProps) {
  var child = inherits(this, protoProps, classProps);
  child.extend = this.extend;
  return child;
};

Klass.extend = extend;

module.exports = Klass
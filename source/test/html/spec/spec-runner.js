(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
  @jsx React.DOM
 */
var HelloMessage;

HelloMessage = React.createBackboneClass({
  changeOptions: 'change:name',
  render: function() {
    return React.DOM.div( {className:"test", onMouseOver:this.onClick}, 'Hello ' + this.getModel().get("name"));
  },
  onClick: function(event) {
    return console.log('hey!');
  }
});

module.exports = HelloMessage;


},{}],2:[function(require,module,exports){
require('./spec/LandingView-spec.coffee');


},{"./spec/LandingView-spec.coffee":3}],3:[function(require,module,exports){
var LandingView;

LandingView = require('../../src/scripts/views/landing/LandingView.coffee');

describe('View', function() {
  return it('Should Workkkk', function() {
    return LandingView();
  });
});


},{"../../src/scripts/views/landing/LandingView.coffee":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMtcnVubmVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9MYW5kaW5nVmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQUE7O0dBQUE7QUFBQSxJQUFBLFlBQUE7O0FBQUEsWUFJQSxHQUFlLEtBQUssQ0FBQyxtQkFBTixDQUNaO0FBQUEsRUFBQSxhQUFBLEVBQWUsYUFBZjtBQUFBLEVBRUEsTUFBQSxFQUFRLFNBQUEsR0FBQTtXQUNMLGdHQURLO0VBQUEsQ0FGUjtBQUFBLEVBS0EsT0FBQSxFQUFTLFNBQUMsS0FBRCxHQUFBO1dBQ04sT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBRE07RUFBQSxDQUxUO0NBRFksQ0FKZixDQUFBOztBQUFBLE1BYU0sQ0FBQyxPQUFQLEdBQWlCLFlBYmpCLENBQUE7Ozs7QUNBQSxPQUFBLENBQVEsZ0NBQVIsQ0FBQSxDQUFBOzs7O0FDQ0EsSUFBQSxXQUFBOztBQUFBLFdBQUEsR0FBYyxPQUFBLENBQVMsb0RBQVQsQ0FBZCxDQUFBOztBQUFBLFFBRUEsQ0FBUyxNQUFULEVBQWlCLFNBQUEsR0FBQTtTQUVkLEVBQUEsQ0FBRyxnQkFBSCxFQUFxQixTQUFBLEdBQUE7V0FDbEIsV0FBQSxDQUFBLEVBRGtCO0VBQUEsQ0FBckIsRUFGYztBQUFBLENBQWpCLENBRkEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjKlxuICBAanN4IFJlYWN0LkRPTVxuIyMjXG5cbkhlbGxvTWVzc2FnZSA9IFJlYWN0LmNyZWF0ZUJhY2tib25lQ2xhc3NcbiAgIGNoYW5nZU9wdGlvbnM6ICdjaGFuZ2U6bmFtZSdcblxuICAgcmVuZGVyOiAtPlxuICAgICAgYDxkaXYgY2xhc3NOYW1lPSd0ZXN0JyBvbk1vdXNlT3Zlcj17dGhpcy5vbkNsaWNrfT57J0hlbGxvICcgKyB0aGlzLmdldE1vZGVsKCkuZ2V0KFwibmFtZVwiKX08L2Rpdj5gXG5cbiAgIG9uQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIGNvbnNvbGUubG9nICdoZXkhJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlbGxvTWVzc2FnZSIsInJlcXVpcmUgJy4vc3BlYy9MYW5kaW5nVmlldy1zcGVjLmNvZmZlZSciLCJcbkxhbmRpbmdWaWV3ID0gcmVxdWlyZSggJy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXcuY29mZmVlJylcblxuZGVzY3JpYmUgJ1ZpZXcnLCAtPlxuXG4gICBpdCAnU2hvdWxkIFdvcmtra2snLCAtPlxuICAgICAgTGFuZGluZ1ZpZXcoKSJdfQ==

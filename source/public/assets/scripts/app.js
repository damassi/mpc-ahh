(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
  @jsx React.DOM
 */
var HelloMessage, user;

HelloMessage = require('./views/landing/LandingView.coffee');

user = new Backbone.Model({
  name: 'Chris'
});

setTimeout(function() {
  return user.set('name', 'BOBBBB');
}, 2000);

React.renderComponent(HelloMessage({
  model: user
}), document.getElementById('wrapper'));


},{"./views/landing/LandingView.coffee":2}],2:[function(require,module,exports){

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


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvaW5pdC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQUE7O0dBQUE7QUFBQSxJQUFBLGtCQUFBOztBQUFBLFlBSUEsR0FBZSxPQUFBLENBQVEsb0NBQVIsQ0FKZixDQUFBOztBQUFBLElBTUEsR0FBVyxJQUFBLFFBQVEsQ0FBQyxLQUFULENBQWU7QUFBQSxFQUFFLElBQUEsRUFBTSxPQUFSO0NBQWYsQ0FOWCxDQUFBOztBQUFBLFVBUUEsQ0FBVyxTQUFBLEdBQUE7U0FDUixJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsRUFBaUIsUUFBakIsRUFEUTtBQUFBLENBQVgsRUFFRSxJQUZGLENBUkEsQ0FBQTs7QUFBQSxLQVlLLENBQUMsZUFBTixDQUF1QixZQUFBLENBQWE7QUFBQSxFQUFFLEtBQUEsRUFBTyxJQUFUO0NBQWIsQ0FBdkIsRUFBcUQsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsU0FBeEIsQ0FBckQsQ0FaQSxDQUFBOzs7O0FDQUE7QUFBQTs7R0FBQTtBQUFBLElBQUEsWUFBQTs7QUFBQSxZQUlBLEdBQWUsS0FBSyxDQUFDLG1CQUFOLENBQ1o7QUFBQSxFQUFBLGFBQUEsRUFBZSxhQUFmO0FBQUEsRUFFQSxNQUFBLEVBQVEsU0FBQSxHQUFBO1dBQ0wsZ0dBREs7RUFBQSxDQUZSO0FBQUEsRUFLQSxPQUFBLEVBQVMsU0FBQyxLQUFELEdBQUE7V0FDTixPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosRUFETTtFQUFBLENBTFQ7Q0FEWSxDQUpmLENBQUE7O0FBQUEsTUFhTSxDQUFDLE9BQVAsR0FBaUIsWUFiakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjKlxuICBAanN4IFJlYWN0LkRPTVxuIyMjXG5cbkhlbGxvTWVzc2FnZSA9IHJlcXVpcmUgJy4vdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUnXG5cbnVzZXIgPSBuZXcgQmFja2JvbmUuTW9kZWwoeyBuYW1lOiAnQ2hyaXMnIH0pXG5cbnNldFRpbWVvdXQgLT5cbiAgIHVzZXIuc2V0ICduYW1lJywgJ0JPQkJCQidcbiwgMjAwMFxuXG5SZWFjdC5yZW5kZXJDb21wb25lbnQoIEhlbGxvTWVzc2FnZSh7IG1vZGVsOiB1c2VyfSksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3cmFwcGVyJylcbikiLCIjIyMqXG4gIEBqc3ggUmVhY3QuRE9NXG4jIyNcblxuSGVsbG9NZXNzYWdlID0gUmVhY3QuY3JlYXRlQmFja2JvbmVDbGFzc1xuICAgY2hhbmdlT3B0aW9uczogJ2NoYW5nZTpuYW1lJ1xuXG4gICByZW5kZXI6IC0+XG4gICAgICBgPGRpdiBjbGFzc05hbWU9J3Rlc3QnIG9uTW91c2VPdmVyPXt0aGlzLm9uQ2xpY2t9PnsnSGVsbG8gJyArIHRoaXMuZ2V0TW9kZWwoKS5nZXQoXCJuYW1lXCIpfTwvZGl2PmBcblxuICAgb25DbGljazogKGV2ZW50KSAtPlxuICAgICAgY29uc29sZS5sb2cgJ2hleSEnXG5cbm1vZHVsZS5leHBvcnRzID0gSGVsbG9NZXNzYWdlIl19

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
  @jsx React.DOM

  Sonic application bootstrapper
  @author Christopher Pappas <chris@wintr.us>
  @date   2.6.14
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
var LandingView, ReactTestUtils;

ReactTestUtils = React.addons.TestUtils;

LandingView = require('../../src/scripts/views/LandingView.coffee');

describe('Landing View', function() {
  return it('Should Render', function() {
    var landingView, model;
    model = new Backbone.Model({
      name: 'chris'
    });
    landingView = LandingView({
      model: model,
      name: 'bob'
    });
    ReactTestUtils.renderIntoDocument(landingView);
    return expect(landingView.props.name).to.equal('bob');
  });
});


},{"../../src/scripts/views/LandingView.coffee":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvTGFuZGluZ1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjLXJ1bm5lci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUFBOzs7Ozs7R0FBQTtBQUFBLElBQUEsWUFBQTs7QUFBQSxZQVNBLEdBQWUsS0FBSyxDQUFDLG1CQUFOLENBQ1o7QUFBQSxFQUFBLGFBQUEsRUFBZSxhQUFmO0FBQUEsRUFFQSxNQUFBLEVBQVEsU0FBQSxHQUFBO1dBQ0wsZ0dBREs7RUFBQSxDQUZSO0FBQUEsRUFLQSxPQUFBLEVBQVMsU0FBQyxLQUFELEdBQUE7V0FDTixPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosRUFETTtFQUFBLENBTFQ7Q0FEWSxDQVRmLENBQUE7O0FBQUEsTUFrQk0sQ0FBQyxPQUFQLEdBQWlCLFlBbEJqQixDQUFBOzs7O0FDQUEsT0FBQSxDQUFRLGdDQUFSLENBQUEsQ0FBQTs7OztBQ0NBLElBQUEsMkJBQUE7O0FBQUEsY0FBQSxHQUFpQixLQUFLLENBQUMsTUFBTSxDQUFDLFNBQTlCLENBQUE7O0FBQUEsV0FDQSxHQUFjLE9BQUEsQ0FBUyw0Q0FBVCxDQURkLENBQUE7O0FBQUEsUUFHQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO1NBR3RCLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTtBQUNqQixRQUFBLGtCQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVksSUFBQSxRQUFRLENBQUMsS0FBVCxDQUFlO0FBQUEsTUFBRSxJQUFBLEVBQU0sT0FBUjtLQUFmLENBQVosQ0FBQTtBQUFBLElBQ0EsV0FBQSxHQUFjLFdBQUEsQ0FBWTtBQUFBLE1BQUUsS0FBQSxFQUFPLEtBQVQ7QUFBQSxNQUFnQixJQUFBLEVBQU0sS0FBdEI7S0FBWixDQURkLENBQUE7QUFBQSxJQUdBLGNBQWMsQ0FBQyxrQkFBZixDQUFrQyxXQUFsQyxDQUhBLENBQUE7V0FNQSxNQUFBLENBQU8sV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUF6QixDQUE4QixDQUFDLEVBQUUsQ0FBQyxLQUFsQyxDQUF3QyxLQUF4QyxFQVBpQjtFQUFBLENBQXBCLEVBSHNCO0FBQUEsQ0FBekIsQ0FIQSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIyMqXG4gIEBqc3ggUmVhY3QuRE9NXG5cbiAgU29uaWMgYXBwbGljYXRpb24gYm9vdHN0cmFwcGVyXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAyLjYuMTRcbiMjI1xuXG5cbkhlbGxvTWVzc2FnZSA9IFJlYWN0LmNyZWF0ZUJhY2tib25lQ2xhc3NcbiAgIGNoYW5nZU9wdGlvbnM6ICdjaGFuZ2U6bmFtZSdcblxuICAgcmVuZGVyOiAtPlxuICAgICAgYDxkaXYgY2xhc3NOYW1lPSd0ZXN0JyBvbk1vdXNlT3Zlcj17dGhpcy5vbkNsaWNrfT57J0hlbGxvICcgKyB0aGlzLmdldE1vZGVsKCkuZ2V0KFwibmFtZVwiKX08L2Rpdj5gXG5cbiAgIG9uQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIGNvbnNvbGUubG9nICdoZXkhJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlbGxvTWVzc2FnZSIsInJlcXVpcmUgJy4vc3BlYy9MYW5kaW5nVmlldy1zcGVjLmNvZmZlZSciLCJcblJlYWN0VGVzdFV0aWxzID0gUmVhY3QuYWRkb25zLlRlc3RVdGlsc1xuTGFuZGluZ1ZpZXcgPSByZXF1aXJlKCAnLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvTGFuZGluZ1ZpZXcuY29mZmVlJylcblxuZGVzY3JpYmUgJ0xhbmRpbmcgVmlldycsIC0+XG5cblxuICAgaXQgJ1Nob3VsZCBSZW5kZXInLCAtPlxuICAgICAgbW9kZWwgPSBuZXcgQmFja2JvbmUuTW9kZWwoeyBuYW1lOiAnY2hyaXMnIH0pXG4gICAgICBsYW5kaW5nVmlldyA9IExhbmRpbmdWaWV3KHsgbW9kZWw6IG1vZGVsLCBuYW1lOiAnYm9iJ30pXG5cbiAgICAgIFJlYWN0VGVzdFV0aWxzLnJlbmRlckludG9Eb2N1bWVudChsYW5kaW5nVmlldyk7XG4gICAgICAjUmVhY3RUZXN0VXRpbHMuU2ltdWxhdGUuY2xpY2sobGFiZWwucmVmcy5wKTtcblxuICAgICAgZXhwZWN0KGxhbmRpbmdWaWV3LnByb3BzLm5hbWUpLnRvLmVxdWFsICdib2InXG4iXX0=

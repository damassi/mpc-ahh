(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
  @jsx React.DOM

  Landing view with start button

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var LandingView;

LandingView = React.createBackboneClass({
  render: function() {
    return (
         React.DOM.div( {className:"landing-view", onClick:this.onClick}, "START")
      );
  },
  onClick: function() {
    return window.location.hash = '#/create';
  }
});

module.exports = LandingView;


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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvTGFuZGluZ1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjLXJ1bm5lci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUFBOzs7Ozs7O0dBQUE7QUFBQSxJQUFBLFdBQUE7O0FBQUEsV0FVQSxHQUFjLEtBQUssQ0FBQyxtQkFBTixDQUdYO0FBQUEsRUFBQSxNQUFBLEVBQVEsU0FBQSxHQUFBO0FBQ0wsV0FBTzs7T0FBUCxDQURLO0VBQUEsQ0FBUjtBQUFBLEVBTUEsT0FBQSxFQUFTLFNBQUEsR0FBQTtXQUNOLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBaEIsR0FBdUIsV0FEakI7RUFBQSxDQU5UO0NBSFcsQ0FWZCxDQUFBOztBQUFBLE1BdUJNLENBQUMsT0FBUCxHQUFpQixXQXZCakIsQ0FBQTs7OztBQ0FBLE9BQUEsQ0FBUSxnQ0FBUixDQUFBLENBQUE7Ozs7QUNDQSxJQUFBLDJCQUFBOztBQUFBLGNBQUEsR0FBaUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUE5QixDQUFBOztBQUFBLFdBQ0EsR0FBYyxPQUFBLENBQVMsNENBQVQsQ0FEZCxDQUFBOztBQUFBLFFBR0EsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtTQUd0QixFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7QUFDakIsUUFBQSxrQkFBQTtBQUFBLElBQUEsS0FBQSxHQUFZLElBQUEsUUFBUSxDQUFDLEtBQVQsQ0FBZTtBQUFBLE1BQUUsSUFBQSxFQUFNLE9BQVI7S0FBZixDQUFaLENBQUE7QUFBQSxJQUNBLFdBQUEsR0FBYyxXQUFBLENBQVk7QUFBQSxNQUFFLEtBQUEsRUFBTyxLQUFUO0FBQUEsTUFBZ0IsSUFBQSxFQUFNLEtBQXRCO0tBQVosQ0FEZCxDQUFBO0FBQUEsSUFHQSxjQUFjLENBQUMsa0JBQWYsQ0FBa0MsV0FBbEMsQ0FIQSxDQUFBO1dBTUEsTUFBQSxDQUFPLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBekIsQ0FBOEIsQ0FBQyxFQUFFLENBQUMsS0FBbEMsQ0FBd0MsS0FBeEMsRUFQaUI7RUFBQSxDQUFwQixFQUhzQjtBQUFBLENBQXpCLENBSEEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjKlxuICBAanN4IFJlYWN0LkRPTVxuXG4gIExhbmRpbmcgdmlldyB3aXRoIHN0YXJ0IGJ1dHRvblxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5MYW5kaW5nVmlldyA9IFJlYWN0LmNyZWF0ZUJhY2tib25lQ2xhc3NcblxuXG4gICByZW5kZXI6IC0+XG4gICAgICByZXR1cm4gYChcbiAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdsYW5kaW5nLXZpZXcnIG9uQ2xpY2s9e3RoaXMub25DbGlja30+U1RBUlQ8L2Rpdj5cbiAgICAgIClgXG5cblxuICAgb25DbGljazogLT5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyMvY3JlYXRlJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZGluZ1ZpZXciLCJyZXF1aXJlICcuL3NwZWMvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUnIiwiXG5SZWFjdFRlc3RVdGlscyA9IFJlYWN0LmFkZG9ucy5UZXN0VXRpbHNcbkxhbmRpbmdWaWV3ID0gcmVxdWlyZSggJy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL0xhbmRpbmdWaWV3LmNvZmZlZScpXG5cbmRlc2NyaWJlICdMYW5kaW5nIFZpZXcnLCAtPlxuXG5cbiAgIGl0ICdTaG91bGQgUmVuZGVyJywgLT5cbiAgICAgIG1vZGVsID0gbmV3IEJhY2tib25lLk1vZGVsKHsgbmFtZTogJ2NocmlzJyB9KVxuICAgICAgbGFuZGluZ1ZpZXcgPSBMYW5kaW5nVmlldyh7IG1vZGVsOiBtb2RlbCwgbmFtZTogJ2JvYid9KVxuXG4gICAgICBSZWFjdFRlc3RVdGlscy5yZW5kZXJJbnRvRG9jdW1lbnQobGFuZGluZ1ZpZXcpO1xuICAgICAgI1JlYWN0VGVzdFV0aWxzLlNpbXVsYXRlLmNsaWNrKGxhYmVsLnJlZnMucCk7XG5cbiAgICAgIGV4cGVjdChsYW5kaW5nVmlldy5wcm9wcy5uYW1lKS50by5lcXVhbCAnYm9iJ1xuIl19

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
  @jsx React.DOM

  Landing view with start button

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var LandingView, ViewMixin;

ViewMixin = require('./mixins/ViewMixin.coffee');

LandingView = React.createBackboneClass({
  mixins: [ViewMixin],
  viewName: 'landingView',
  componentWillMount: function(options) {
    console.log('mounting');
    return console.log(this.getViewName());
  },
  componentWillUnmount: function(options) {
    return console.log('unmounting....');
  },
  render: function() {
    return (
         React.DOM.div( {className:"landing-view", onClick:this.onClick}, 
            "START"
         )
      );
  },
  onClick: function() {
    return window.location.hash = '#/create';
  }
});

module.exports = LandingView;


},{"./mixins/ViewMixin.coffee":2}],2:[function(require,module,exports){

/**
  @jsx React.DOM

  View "superclass" MixIn for shared view functionality

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var ViewMixin;

ViewMixin = {

  /**
   * Helper method to return whether a view is visible or not
   * @return {Boolean}
   */
  setViewName: function(viewName) {
    return this.viewName = viewName;
  },
  getViewName: function() {
    return this.viewName;
  },
  getVisible: function() {
    if (this.getModel().get('currentView') === this.viewName) {
      return '';
    }
    return 'hidden';
  }
};

module.exports = ViewMixin;


},{}],3:[function(require,module,exports){
require('./spec/LandingView-spec.coffee');


},{"./spec/LandingView-spec.coffee":4}],4:[function(require,module,exports){
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


},{"../../src/scripts/views/LandingView.coffee":1}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvTGFuZGluZ1ZpZXcuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvbWl4aW5zL1ZpZXdNaXhpbi5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMtcnVubmVyLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9MYW5kaW5nVmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQUE7Ozs7Ozs7R0FBQTtBQUFBLElBQUEsc0JBQUE7O0FBQUEsU0FTQSxHQUFZLE9BQUEsQ0FBUSwyQkFBUixDQVRaLENBQUE7O0FBQUEsV0FZQSxHQUFjLEtBQUssQ0FBQyxtQkFBTixDQUVYO0FBQUEsRUFBQSxNQUFBLEVBQVEsQ0FBQyxTQUFELENBQVI7QUFBQSxFQUVBLFFBQUEsRUFBVSxhQUZWO0FBQUEsRUFLQSxrQkFBQSxFQUFvQixTQUFDLE9BQUQsR0FBQTtBQUNqQixJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBWixDQUFBLENBQUE7V0FFQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBWixFQUhpQjtFQUFBLENBTHBCO0FBQUEsRUFZQSxvQkFBQSxFQUFzQixTQUFDLE9BQUQsR0FBQTtXQUNuQixPQUFPLENBQUMsR0FBUixDQUFZLGdCQUFaLEVBRG1CO0VBQUEsQ0FadEI7QUFBQSxFQWlCQSxNQUFBLEVBQVEsU0FBQSxHQUFBO1dBQ0w7Ozs7UUFESztFQUFBLENBakJSO0FBQUEsRUF5QkEsT0FBQSxFQUFTLFNBQUEsR0FBQTtXQUNOLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBaEIsR0FBdUIsV0FEakI7RUFBQSxDQXpCVDtDQUZXLENBWmQsQ0FBQTs7QUFBQSxNQTJDTSxDQUFDLE9BQVAsR0FBaUIsV0EzQ2pCLENBQUE7Ozs7QUNBQTtBQUFBOzs7Ozs7O0dBQUE7QUFBQSxJQUFBLFNBQUE7O0FBQUEsU0FVQSxHQUdHO0FBQUE7QUFBQTs7O0tBQUE7QUFBQSxFQU1BLFdBQUEsRUFBYSxTQUFDLFFBQUQsR0FBQTtXQUNWLElBQUMsQ0FBQSxRQUFELEdBQVksU0FERjtFQUFBLENBTmI7QUFBQSxFQVVBLFdBQUEsRUFBYSxTQUFBLEdBQUE7V0FDVixJQUFDLENBQUEsU0FEUztFQUFBLENBVmI7QUFBQSxFQWVBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVCxJQUFBLElBQUcsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFXLENBQUMsR0FBWixDQUFnQixhQUFoQixDQUFBLEtBQWtDLElBQUMsQ0FBQSxRQUF0QztBQUNHLGFBQU8sRUFBUCxDQURIO0tBQUE7QUFHQSxXQUFPLFFBQVAsQ0FKUztFQUFBLENBZlo7Q0FiSCxDQUFBOztBQUFBLE1Bb0NNLENBQUMsT0FBUCxHQUFpQixTQXBDakIsQ0FBQTs7OztBQ0FBLE9BQUEsQ0FBUSxnQ0FBUixDQUFBLENBQUE7Ozs7QUNDQSxJQUFBLDJCQUFBOztBQUFBLGNBQUEsR0FBaUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUE5QixDQUFBOztBQUFBLFdBQ0EsR0FBYyxPQUFBLENBQVMsNENBQVQsQ0FEZCxDQUFBOztBQUFBLFFBR0EsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtTQUd0QixFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7QUFDakIsUUFBQSxrQkFBQTtBQUFBLElBQUEsS0FBQSxHQUFZLElBQUEsUUFBUSxDQUFDLEtBQVQsQ0FBZTtBQUFBLE1BQUUsSUFBQSxFQUFNLE9BQVI7S0FBZixDQUFaLENBQUE7QUFBQSxJQUNBLFdBQUEsR0FBYyxXQUFBLENBQVk7QUFBQSxNQUFFLEtBQUEsRUFBTyxLQUFUO0FBQUEsTUFBZ0IsSUFBQSxFQUFNLEtBQXRCO0tBQVosQ0FEZCxDQUFBO0FBQUEsSUFHQSxjQUFjLENBQUMsa0JBQWYsQ0FBa0MsV0FBbEMsQ0FIQSxDQUFBO1dBTUEsTUFBQSxDQUFPLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBekIsQ0FBOEIsQ0FBQyxFQUFFLENBQUMsS0FBbEMsQ0FBd0MsS0FBeEMsRUFQaUI7RUFBQSxDQUFwQixFQUhzQjtBQUFBLENBQXpCLENBSEEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjKlxuICBAanN4IFJlYWN0LkRPTVxuXG4gIExhbmRpbmcgdmlldyB3aXRoIHN0YXJ0IGJ1dHRvblxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlld01peGluID0gcmVxdWlyZSAnLi9taXhpbnMvVmlld01peGluLmNvZmZlZSdcblxuXG5MYW5kaW5nVmlldyA9IFJlYWN0LmNyZWF0ZUJhY2tib25lQ2xhc3NcblxuICAgbWl4aW5zOiBbVmlld01peGluXVxuXG4gICB2aWV3TmFtZTogJ2xhbmRpbmdWaWV3J1xuXG5cbiAgIGNvbXBvbmVudFdpbGxNb3VudDogKG9wdGlvbnMpIC0+XG4gICAgICBjb25zb2xlLmxvZyAnbW91bnRpbmcnXG5cbiAgICAgIGNvbnNvbGUubG9nIEBnZXRWaWV3TmFtZSgpXG5cblxuXG4gICBjb21wb25lbnRXaWxsVW5tb3VudDogKG9wdGlvbnMpIC0+XG4gICAgICBjb25zb2xlLmxvZyAndW5tb3VudGluZy4uLi4nXG5cblxuXG4gICByZW5kZXI6IC0+XG4gICAgICBgKFxuICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2xhbmRpbmctdmlldycgb25DbGljaz17dGhpcy5vbkNsaWNrfT5cbiAgICAgICAgICAgIFNUQVJUXG4gICAgICAgICA8L2Rpdj5cbiAgICAgIClgXG5cblxuICAgb25DbGljazogLT5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyMvY3JlYXRlJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZGluZ1ZpZXciLCIjIyMqXG4gIEBqc3ggUmVhY3QuRE9NXG5cbiAgVmlldyBcInN1cGVyY2xhc3NcIiBNaXhJbiBmb3Igc2hhcmVkIHZpZXcgZnVuY3Rpb25hbGl0eVxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5WaWV3TWl4aW4gPVxuXG5cbiAgICMjIypcbiAgICAqIEhlbHBlciBtZXRob2QgdG8gcmV0dXJuIHdoZXRoZXIgYSB2aWV3IGlzIHZpc2libGUgb3Igbm90XG4gICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgIyMjXG5cblxuICAgc2V0Vmlld05hbWU6ICh2aWV3TmFtZSkgLT5cbiAgICAgIEB2aWV3TmFtZSA9IHZpZXdOYW1lXG5cblxuICAgZ2V0Vmlld05hbWU6IC0+XG4gICAgICBAdmlld05hbWVcblxuXG5cbiAgIGdldFZpc2libGU6IC0+XG4gICAgICBpZiBAZ2V0TW9kZWwoKS5nZXQoJ2N1cnJlbnRWaWV3JykgaXMgQHZpZXdOYW1lXG4gICAgICAgICByZXR1cm4gJydcblxuICAgICAgcmV0dXJuICdoaWRkZW4nXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdNaXhpbiIsInJlcXVpcmUgJy4vc3BlYy9MYW5kaW5nVmlldy1zcGVjLmNvZmZlZSciLCJcblJlYWN0VGVzdFV0aWxzID0gUmVhY3QuYWRkb25zLlRlc3RVdGlsc1xuTGFuZGluZ1ZpZXcgPSByZXF1aXJlKCAnLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvTGFuZGluZ1ZpZXcuY29mZmVlJylcblxuZGVzY3JpYmUgJ0xhbmRpbmcgVmlldycsIC0+XG5cblxuICAgaXQgJ1Nob3VsZCBSZW5kZXInLCAtPlxuICAgICAgbW9kZWwgPSBuZXcgQmFja2JvbmUuTW9kZWwoeyBuYW1lOiAnY2hyaXMnIH0pXG4gICAgICBsYW5kaW5nVmlldyA9IExhbmRpbmdWaWV3KHsgbW9kZWw6IG1vZGVsLCBuYW1lOiAnYm9iJ30pXG5cbiAgICAgIFJlYWN0VGVzdFV0aWxzLnJlbmRlckludG9Eb2N1bWVudChsYW5kaW5nVmlldyk7XG4gICAgICAjUmVhY3RUZXN0VXRpbHMuU2ltdWxhdGUuY2xpY2sobGFiZWwucmVmcy5wKTtcblxuICAgICAgZXhwZWN0KGxhbmRpbmdWaWV3LnByb3BzLm5hbWUpLnRvLmVxdWFsICdib2InXG4iXX0=

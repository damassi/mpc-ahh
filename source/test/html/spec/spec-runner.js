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
var LandingView, ReactTestUtils;

ReactTestUtils = React.addons.TestUtils;

LandingView = require('../../src/scripts/views/landing/LandingView.coffee');

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


},{"../../src/scripts/views/landing/LandingView.coffee":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMtcnVubmVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9MYW5kaW5nVmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQUE7O0dBQUE7QUFBQSxJQUFBLFlBQUE7O0FBQUEsWUFJQSxHQUFlLEtBQUssQ0FBQyxtQkFBTixDQUNaO0FBQUEsRUFBQSxhQUFBLEVBQWUsYUFBZjtBQUFBLEVBRUEsTUFBQSxFQUFRLFNBQUEsR0FBQTtXQUNMLGdHQURLO0VBQUEsQ0FGUjtBQUFBLEVBS0EsT0FBQSxFQUFTLFNBQUMsS0FBRCxHQUFBO1dBQ04sT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBRE07RUFBQSxDQUxUO0NBRFksQ0FKZixDQUFBOztBQUFBLE1BYU0sQ0FBQyxPQUFQLEdBQWlCLFlBYmpCLENBQUE7Ozs7QUNBQSxPQUFBLENBQVEsZ0NBQVIsQ0FBQSxDQUFBOzs7O0FDQ0EsSUFBQSwyQkFBQTs7QUFBQSxjQUFBLEdBQWlCLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBOUIsQ0FBQTs7QUFBQSxXQUNBLEdBQWMsT0FBQSxDQUFTLG9EQUFULENBRGQsQ0FBQTs7QUFBQSxRQUdBLENBQVMsY0FBVCxFQUF5QixTQUFBLEdBQUE7U0FHdEIsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO0FBQ2pCLFFBQUEsa0JBQUE7QUFBQSxJQUFBLEtBQUEsR0FBWSxJQUFBLFFBQVEsQ0FBQyxLQUFULENBQWU7QUFBQSxNQUFFLElBQUEsRUFBTSxPQUFSO0tBQWYsQ0FBWixDQUFBO0FBQUEsSUFDQSxXQUFBLEdBQWMsV0FBQSxDQUFZO0FBQUEsTUFBRSxLQUFBLEVBQU8sS0FBVDtBQUFBLE1BQWdCLElBQUEsRUFBTSxLQUF0QjtLQUFaLENBRGQsQ0FBQTtBQUFBLElBR0EsY0FBYyxDQUFDLGtCQUFmLENBQWtDLFdBQWxDLENBSEEsQ0FBQTtXQU1BLE1BQUEsQ0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQXpCLENBQThCLENBQUMsRUFBRSxDQUFDLEtBQWxDLENBQXdDLEtBQXhDLEVBUGlCO0VBQUEsQ0FBcEIsRUFIc0I7QUFBQSxDQUF6QixDQUhBLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjIypcbiAgQGpzeCBSZWFjdC5ET01cbiMjI1xuXG5IZWxsb01lc3NhZ2UgPSBSZWFjdC5jcmVhdGVCYWNrYm9uZUNsYXNzXG4gICBjaGFuZ2VPcHRpb25zOiAnY2hhbmdlOm5hbWUnXG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIGA8ZGl2IGNsYXNzTmFtZT0ndGVzdCcgb25Nb3VzZU92ZXI9e3RoaXMub25DbGlja30+eydIZWxsbyAnICsgdGhpcy5nZXRNb2RlbCgpLmdldChcIm5hbWVcIil9PC9kaXY+YFxuXG4gICBvbkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBjb25zb2xlLmxvZyAnaGV5ISdcblxubW9kdWxlLmV4cG9ydHMgPSBIZWxsb01lc3NhZ2UiLCJyZXF1aXJlICcuL3NwZWMvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUnIiwiXG5SZWFjdFRlc3RVdGlscyA9IFJlYWN0LmFkZG9ucy5UZXN0VXRpbHNcbkxhbmRpbmdWaWV3ID0gcmVxdWlyZSggJy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXcuY29mZmVlJylcblxuZGVzY3JpYmUgJ0xhbmRpbmcgVmlldycsIC0+XG5cblxuICAgaXQgJ1Nob3VsZCBSZW5kZXInLCAtPlxuICAgICAgbW9kZWwgPSBuZXcgQmFja2JvbmUuTW9kZWwoeyBuYW1lOiAnY2hyaXMnIH0pXG4gICAgICBsYW5kaW5nVmlldyA9IExhbmRpbmdWaWV3KHsgbW9kZWw6IG1vZGVsLCBuYW1lOiAnYm9iJ30pXG5cbiAgICAgIFJlYWN0VGVzdFV0aWxzLnJlbmRlckludG9Eb2N1bWVudChsYW5kaW5nVmlldyk7XG4gICAgICAjUmVhY3RUZXN0VXRpbHMuU2ltdWxhdGUuY2xpY2sobGFiZWwucmVmcy5wKTtcblxuICAgICAgZXhwZWN0KGxhbmRpbmdWaWV3LnByb3BzLm5hbWUpLnRvLmVxdWFsICdib2InXG4iXX0=

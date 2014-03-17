(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
  @jsx React.DOM
 */
var HelloMessage;

HelloMessage = React.createClass({displayName: 'HelloMessage',
  onClick: function(event) {
    return console.log('hey you');
  },
  render: function() {
    return React.DOM.div( {className:"test", onMouseOver:this.onClick}, 'Hello ' + this.props.name);
  }
});

React.renderComponent(HelloMessage( {name:"Hey Dude"} ),
   document.getElementById('wrapper'));


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvaW5pdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUFBOztHQUFBO0FBQUEsSUFBQSxZQUFBOztBQUFBLFlBSUEsR0FBZSxLQUFLLENBQUMsV0FBTixDQUNaO0FBQUEsRUFBQSxPQUFBLEVBQVMsU0FBQyxLQUFELEdBQUE7V0FDTixPQUFPLENBQUMsR0FBUixDQUFZLFNBQVosRUFETTtFQUFBLENBQVQ7QUFBQSxFQUdBLE1BQUEsRUFBUSxTQUFBLEdBQUE7V0FDTCxvRkFESztFQUFBLENBSFI7Q0FEWSxDQUpmLENBQUE7O0FBQUEsS0FXSyxDQUFDLGVBQU4sQ0FDRztxQ0FESCxDQVhBLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjIypcbiAgQGpzeCBSZWFjdC5ET01cbiMjI1xuXG5IZWxsb01lc3NhZ2UgPSBSZWFjdC5jcmVhdGVDbGFzc1xuICAgb25DbGljazogKGV2ZW50KSAtPlxuICAgICAgY29uc29sZS5sb2cgJ2hleSB5b3UnXG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIGA8ZGl2IGNsYXNzTmFtZT0ndGVzdCcgb25Nb3VzZU92ZXI9e3RoaXMub25DbGlja30+eydIZWxsbyAnICsgdGhpcy5wcm9wcy5uYW1lfTwvZGl2PmBcblxuUmVhY3QucmVuZGVyQ29tcG9uZW50KFxuICAgYDxIZWxsb01lc3NhZ2UgbmFtZT0nSGV5IER1ZGUnIC8+LFxuICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dyYXBwZXInKWBcbikiXX0=

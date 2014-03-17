(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
  MPC application bootstrapper

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppController, AppModel, AppRouter, CreateView, LandingView;

AppRouter = require('./routers/AppRouter.coffee');

AppModel = require('./models/AppModel.coffee');

LandingView = require('./views/LandingView.coffee');

CreateView = require('./views/CreateView.coffee');

AppController = Backbone.View.extend({
  initialize: function() {
    this.appModel = new AppModel();
    this.appRouter = new AppRouter({
      appController: this,
      appModel: this.appModel
    });
    return Backbone.history.start();
  },
  renderLandingView: function() {
    console.log('starting application');
    return React.renderComponent(LandingView(), document.getElementById('wrapper'));
  },
  renderCreateView: function() {
    console.log('init create');
    return React.renderComponent(CreateView(), document.getElementById('wrapper'));
  }
});

module.exports = AppController;


},{"./models/AppModel.coffee":3,"./routers/AppRouter.coffee":4,"./views/CreateView.coffee":5,"./views/LandingView.coffee":6}],2:[function(require,module,exports){
var AppController;

AppController = require('./AppController.coffee');

$(function() {
  return new AppController();
});


},{"./AppController.coffee":1}],3:[function(require,module,exports){

/**
  Primary application model which coordinates state

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppRouter;

AppRouter = Backbone.Model.extend({
  defaults: {
    'initialized': false,
    'view': null
  }
});

module.exports = AppRouter;


},{}],4:[function(require,module,exports){

/**
  MPC Application Router

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppRouter;

AppRouter = Backbone.Router.extend({
  routes: {
    '': 'startRoute',
    'create': 'createRoute'
  },
  initialize: function(options) {
    return this.appController = options.appController, this.appModel = options.appModel, options;
  },
  startRoute: function() {
    return this.appController.renderLandingView();
  },
  createRoute: function() {
    return this.appController.renderCreateView();
  }
});

module.exports = AppRouter;


},{}],5:[function(require,module,exports){

/**
  @jsx React.DOM

  Primary app view which allows the user to create tracks

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var CreateView;

CreateView = React.createBackboneClass({
  render: function() {
    return (
         React.DOM.div( {className:"create-view", onClick:this.onClick}, "CREATE BEAT")
      );
  },
  onClick: function() {
    return console.log('creating beat');
  }
});

module.exports = CreateView;


},{}],6:[function(require,module,exports){

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


},{}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvQXBwQ29udHJvbGxlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9pbml0aWFsaXplLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9DcmVhdGVWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL0xhbmRpbmdWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLDJEQUFBOztBQUFBLFNBT0EsR0FBYyxPQUFBLENBQVEsNEJBQVIsQ0FQZCxDQUFBOztBQUFBLFFBUUEsR0FBYyxPQUFBLENBQVEsMEJBQVIsQ0FSZCxDQUFBOztBQUFBLFdBU0EsR0FBYyxPQUFBLENBQVEsNEJBQVIsQ0FUZCxDQUFBOztBQUFBLFVBVUEsR0FB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QUFBOztBQUFBLE1BdUJNLENBQUMsT0FBUCxHQUFpQixVQXZCakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7Ozs7R0FBQTtBQUFBLElBQUEsV0FBQTs7QUFBQSxXQVVBLEdBQWMsS0FBSyxDQUFDLG1CQUFOLENBR1g7QUFBQSxFQUFBLE1BQUEsRUFBUSxTQUFBLEdBQUE7QUFDTCxXQUFPOztPQUFQLENBREs7RUFBQSxDQUFSO0FBQUEsRUFNQSxPQUFBLEVBQVMsU0FBQSxHQUFBO1dBQ04sTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFoQixHQUF1QixXQURqQjtFQUFBLENBTlQ7Q0FIVyxDQVZkLENBQUE7O0FBQUEsTUF1Qk0sQ0FBQyxPQUFQLEdBQWlCLFdBdkJqQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIyMqXG4gIE1QQyBhcHBsaWNhdGlvbiBib290c3RyYXBwZXJcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcFJvdXRlciAgID0gcmVxdWlyZSAnLi9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUnXG5BcHBNb2RlbCAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbkxhbmRpbmdWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9MYW5kaW5nVmlldy5jb2ZmZWUnXG5DcmVhdGVWaWV3ICA9IHJlcXVpcmUgJy4vdmlld3MvQ3JlYXRlVmlldy5jb2ZmZWUnXG5cblxuQXBwQ29udHJvbGxlciA9IEJhY2tib25lLlZpZXcuZXh0ZW5kXG5cblxuICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbCgpXG5cbiAgICAgIEBhcHBSb3V0ZXIgPSBuZXcgQXBwUm91dGVyXG4gICAgICAgICBhcHBDb250cm9sbGVyOiBAXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEJhY2tib25lLmhpc3Rvcnkuc3RhcnQoKVxuXG5cblxuICAgIyBQVUJMSUMgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgIHJlbmRlckxhbmRpbmdWaWV3OiAtPlxuICAgICAgY29uc29sZS5sb2cgJ3N0YXJ0aW5nIGFwcGxpY2F0aW9uJ1xuICAgICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KCBMYW5kaW5nVmlldygpLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnd3JhcHBlcicgKVxuXG5cblxuICAgcmVuZGVyQ3JlYXRlVmlldzogLT5cbiAgICAgIGNvbnNvbGUubG9nICdpbml0IGNyZWF0ZSdcbiAgICAgIFJlYWN0LnJlbmRlckNvbXBvbmVudCggQ3JlYXRlVmlldygpLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnd3JhcHBlcicgKVxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb250cm9sbGVyIiwiXG5BcHBDb250cm9sbGVyID0gcmVxdWlyZSAnLi9BcHBDb250cm9sbGVyLmNvZmZlZSdcblxuJCAtPlxuICAgbmV3IEFwcENvbnRyb2xsZXIoKVxuXG4iLCIjIyMqXG4gIFByaW1hcnkgYXBwbGljYXRpb24gbW9kZWwgd2hpY2ggY29vcmRpbmF0ZXMgc3RhdGVcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblxuQXBwUm91dGVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnaW5pdGlhbGl6ZWQnOiBmYWxzZVxuICAgICAgJ3ZpZXcnOiBudWxsXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBSb3V0ZXIiLCIjIyMqXG4gIE1QQyBBcHBsaWNhdGlvbiBSb3V0ZXJcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblxuQXBwUm91dGVyID0gQmFja2JvbmUuUm91dGVyLmV4dGVuZFxuXG5cbiAgIHJvdXRlczpcbiAgICAgICcnOiAgICAgICAgICAgICdzdGFydFJvdXRlJ1xuICAgICAgJ2NyZWF0ZSc6ICAgICAgJ2NyZWF0ZVJvdXRlJ1xuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAge0BhcHBDb250cm9sbGVyLCBAYXBwTW9kZWx9ID0gb3B0aW9uc1xuXG5cblxuICAgc3RhcnRSb3V0ZTogLT5cbiAgICAgIEBhcHBDb250cm9sbGVyLnJlbmRlckxhbmRpbmdWaWV3KClcblxuXG5cbiAgIGNyZWF0ZVJvdXRlOiAtPlxuICAgICAgQGFwcENvbnRyb2xsZXIucmVuZGVyQ3JlYXRlVmlldygpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFJvdXRlciIsIiMjIypcbiAgQGpzeCBSZWFjdC5ET01cblxuICBQcmltYXJ5IGFwcCB2aWV3IHdoaWNoIGFsbG93cyB0aGUgdXNlciB0byBjcmVhdGUgdHJhY2tzXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cbkNyZWF0ZVZpZXcgPSBSZWFjdC5jcmVhdGVCYWNrYm9uZUNsYXNzXG5cblxuICAgcmVuZGVyOiAtPlxuICAgICAgcmV0dXJuIGAoXG4gICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY3JlYXRlLXZpZXcnIG9uQ2xpY2s9e3RoaXMub25DbGlja30+Q1JFQVRFIEJFQVQ8L2Rpdj5cbiAgICAgIClgXG5cblxuICAgb25DbGljazogLT5cbiAgICAgIGNvbnNvbGUubG9nICdjcmVhdGluZyBiZWF0J1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3JlYXRlVmlldyIsIiMjIypcbiAgQGpzeCBSZWFjdC5ET01cblxuICBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b25cblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblxuTGFuZGluZ1ZpZXcgPSBSZWFjdC5jcmVhdGVCYWNrYm9uZUNsYXNzXG5cblxuICAgcmVuZGVyOiAtPlxuICAgICAgcmV0dXJuIGAoXG4gICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbGFuZGluZy12aWV3JyBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9PlNUQVJUPC9kaXY+XG4gICAgICApYFxuXG5cbiAgIG9uQ2xpY2s6IC0+XG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcjL2NyZWF0ZSdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExhbmRpbmdWaWV3Il19

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
  @jsx React.DOM

  Main MPC application controller / root element, which cascades down state

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppController, CreateView, LandingView, ShareView;

LandingView = require('./views/LandingView.coffee');

CreateView = require('./views/CreateView.coffee');

ShareView = require('./views/ShareView.coffee');

AppController = React.createBackboneClass({
  changeOptions: 'change:view',
  componentDidMount: function() {},
  render: function() {
    var View, appModel;
    appModel = this.getModel();
    View = (function() {
      switch (appModel.get('view')) {
        case 'landingView':
          return LandingView;
        case 'createView':
          return CreateView;
        case 'shareView':
          return ShareView;
      }
    })();
    return View({
      model: appModel
    });
  }
});

module.exports = AppController;


},{"./views/CreateView.coffee":5,"./views/LandingView.coffee":6,"./views/ShareView.coffee":7}],2:[function(require,module,exports){

/**
  @jsx React.DOM

  MPC application bootstrapper

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppController, AppModel, AppRouter, initialize;

AppModel = require('./models/AppModel.coffee');

AppRouter = require('./routers/AppRouter.coffee');

AppController = require('./AppController.coffee');

initialize = (function() {
  var appModel, appRouter;
  appModel = new AppModel({
    view: 'landingView'
  });
  appRouter = new AppRouter({
    appModel: appModel
  });
  React.renderComponent(AppController({
    model: appModel
  }), document.getElementById('wrapper'));
  return Backbone.history.start();
})();


},{"./AppController.coffee":1,"./models/AppModel.coffee":3,"./routers/AppRouter.coffee":4}],3:[function(require,module,exports){

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
    '': 'landingRoute',
    'create': 'createRoute',
    'share': 'shareRoute'
  },
  initialize: function(options) {
    return this.appController = options.appController, this.appModel = options.appModel, options;
  },
  landingRoute: function() {
    return this.appModel.set('view', 'landingView');
  },
  createRoute: function() {
    return this.appModel.set('view', 'createView');
  },
  shareRoute: function() {
    return this.appModel.set('view', 'shareView');
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
var CreateView, ViewMixin;

ViewMixin = require('./mixins/ViewMixin.coffee');

CreateView = React.createBackboneClass({
  mixins: [ViewMixin],
  onClick: function() {
    return window.location.hash = '#/share';
  },
  render: function() {
    return (
         React.DOM.div( {className:"create-view", onClick:this.onClick}, "CREATE BEAT")
      );
  }
});

module.exports = CreateView;


},{"./mixins/ViewMixin.coffee":8}],6:[function(require,module,exports){

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
  onClick: function() {
    return window.location.hash = '#/create';
  },
  render: function() {
    return (
         React.DOM.div( {className:"landing-view", onClick:this.onClick}, 
            "START"
         )
      );
  }
});

module.exports = LandingView;


},{"./mixins/ViewMixin.coffee":8}],7:[function(require,module,exports){

/**
  @jsx React.DOM

  View for sharing / displaying final beat / animation

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var ShareView, ViewMixin;

ViewMixin = require('./mixins/ViewMixin.coffee');

ShareView = React.createBackboneClass({
  mixins: [ViewMixin],
  render: function() {
    return (
         React.DOM.div( {className:"share"}, 
            "Share view"
         )
      );
  }
});

module.exports = ShareView;


},{"./mixins/ViewMixin.coffee":8}],8:[function(require,module,exports){

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


},{}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvQXBwQ29udHJvbGxlci5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9pbml0aWFsaXplLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9DcmVhdGVWaWV3LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL0xhbmRpbmdWaWV3LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL1NoYXJlVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9taXhpbnMvVmlld01peGluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQUE7Ozs7Ozs7R0FBQTtBQUFBLElBQUEsaURBQUE7O0FBQUEsV0FVQSxHQUFjLE9BQUEsQ0FBUSw0QkFBUixDQVZkLENBQUE7O0FBQUEsVUFXQSxHQUFjLE9BQUEsQ0FBUSwyQkFBUixDQVhkLENBQUE7O0FBQUEsU0FZQSxHQUFjLE9BQUEsQ0FBUSwwQkFBUixDQVpkLENBQUE7O0FBQUEsYUFlQSxHQUFnQixLQUFLLENBQUMsbUJBQU4sQ0FJYjtBQUFBLEVBQUEsYUFBQSxFQUFlLGFBQWY7QUFBQSxFQVNBLGlCQUFBLEVBQW1CLFNBQUEsR0FBQSxDQVRuQjtBQUFBLEVBY0EsTUFBQSxFQUFRLFNBQUEsR0FBQTtBQUNMLFFBQUEsY0FBQTtBQUFBLElBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBWCxDQUFBO0FBQUEsSUFFQSxJQUFBO0FBQU8sY0FBTyxRQUFRLENBQUMsR0FBVCxDQUFhLE1BQWIsQ0FBUDtBQUFBLGFBQ0MsYUFERDtpQkFDb0IsWUFEcEI7QUFBQSxhQUVDLFlBRkQ7aUJBRW9CLFdBRnBCO0FBQUEsYUFHQyxXQUhEO2lCQUdvQixVQUhwQjtBQUFBO1FBRlAsQ0FBQTtXQU9BLElBQUEsQ0FBSztBQUFBLE1BQ0YsS0FBQSxFQUFPLFFBREw7S0FBTCxFQVJLO0VBQUEsQ0FkUjtDQUphLENBZmhCLENBQUE7O0FBQUEsTUFvRE0sQ0FBQyxPQUFQLEdBQWlCLGFBcERqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7OztHQUFBO0FBQUEsSUFBQSw4Q0FBQTs7QUFBQSxRQVVBLEdBQWdCLE9BQUEsQ0FBUSwwQkFBUixDQVZoQixDQUFBOztBQUFBLFNBV0EsR0FBZ0IsT0FBQSxDQUFRLDRCQUFSLENBWGhCLENBQUE7O0FBQUEsYUFZQSxHQUFnQixPQUFBLENBQVEsd0JBQVIsQ0FaaEIsQ0FBQTs7QUFBQSxVQWVBLEdBQWdCLENBQUEsU0FBQSxHQUFBO0FBRWIsTUFBQSxtQkFBQTtBQUFBLEVBQUEsUUFBQSxHQUFlLElBQUEsUUFBQSxDQUNaO0FBQUEsSUFBQSxJQUFBLEVBQU0sYUFBTjtHQURZLENBQWYsQ0FBQTtBQUFBLEVBR0EsU0FBQSxHQUFnQixJQUFBLFNBQUEsQ0FDYjtBQUFBLElBQUEsUUFBQSxFQUFVLFFBQVY7R0FEYSxDQUhoQixDQUFBO0FBQUEsRUFNQSxLQUFLLENBQUMsZUFBTixDQUF1QixhQUFBLENBQWM7QUFBQSxJQUFFLEtBQUEsRUFBTyxRQUFUO0dBQWQsQ0FBdkIsRUFBMkQsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsU0FBeEIsQ0FBM0QsQ0FOQSxDQUFBO1NBUUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFqQixDQUFBLEVBVmE7QUFBQSxDQUFBLENBQUgsQ0FBQSxDQWZiLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxTQUFBOztBQUFBLFNBUUEsR0FBWSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQWYsQ0FHVDtBQUFBLEVBQUEsUUFBQSxFQUNHO0FBQUEsSUFBQSxhQUFBLEVBQWUsS0FBZjtBQUFBLElBQ0EsTUFBQSxFQUFRLElBRFI7R0FESDtDQUhTLENBUlosQ0FBQTs7QUFBQSxNQWdCTSxDQUFDLE9BQVAsR0FBaUIsU0FoQmpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxTQUFBOztBQUFBLFNBUUEsR0FBWSxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQWhCLENBR1Q7QUFBQSxFQUFBLE1BQUEsRUFDRztBQUFBLElBQUEsRUFBQSxFQUFlLGNBQWY7QUFBQSxJQUNBLFFBQUEsRUFBZSxhQURmO0FBQUEsSUFFQSxPQUFBLEVBQWUsWUFGZjtHQURIO0FBQUEsRUFNQSxVQUFBLEVBQVksU0FBQyxPQUFELEdBQUE7V0FDUixJQUFDLENBQUEsd0JBQUEsYUFBRixFQUFpQixJQUFDLENBQUEsbUJBQUEsUUFBbEIsRUFBOEIsUUFEckI7RUFBQSxDQU5aO0FBQUEsRUFXQSxZQUFBLEVBQWMsU0FBQSxHQUFBO1dBQ1gsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxFQUFzQixhQUF0QixFQURXO0VBQUEsQ0FYZDtBQUFBLEVBZ0JBLFdBQUEsRUFBYSxTQUFBLEdBQUE7V0FDVixJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLFlBQXRCLEVBRFU7RUFBQSxDQWhCYjtBQUFBLEVBcUJBLFVBQUEsRUFBWSxTQUFBLEdBQUE7V0FDVCxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLFdBQXRCLEVBRFM7RUFBQSxDQXJCWjtDQUhTLENBUlosQ0FBQTs7QUFBQSxNQXFDTSxDQUFDLE9BQVAsR0FBaUIsU0FyQ2pCLENBQUE7Ozs7QUNBQTtBQUFBOzs7Ozs7O0dBQUE7QUFBQSxJQUFBLHFCQUFBOztBQUFBLFNBU0EsR0FBWSxPQUFBLENBQVEsMkJBQVIsQ0FUWixDQUFBOztBQUFBLFVBWUEsR0FBYSxLQUFLLENBQUMsbUJBQU4sQ0FJVjtBQUFBLEVBQUEsTUFBQSxFQUFRLENBQUMsU0FBRCxDQUFSO0FBQUEsRUFTQSxPQUFBLEVBQVMsU0FBQSxHQUFBO1dBQ04sTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFoQixHQUF1QixVQURqQjtFQUFBLENBVFQ7QUFBQSxFQWtCQSxNQUFBLEVBQVEsU0FBQSxHQUFBO0FBQ0wsV0FBTzs7T0FBUCxDQURLO0VBQUEsQ0FsQlI7Q0FKVSxDQVpiLENBQUE7O0FBQUEsTUF3Q00sQ0FBQyxPQUFQLEdBQWlCLFVBeENqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7OztHQUFBO0FBQUEsSUFBQSxzQkFBQTs7QUFBQSxTQVNBLEdBQVksT0FBQSxDQUFRLDJCQUFSLENBVFosQ0FBQTs7QUFBQSxXQVlBLEdBQWMsS0FBSyxDQUFDLG1CQUFOLENBTVg7QUFBQSxFQUFBLE1BQUEsRUFBUSxDQUFDLFNBQUQsQ0FBUjtBQUFBLEVBUUEsT0FBQSxFQUFTLFNBQUEsR0FBQTtXQUNOLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBaEIsR0FBdUIsV0FEakI7RUFBQSxDQVJUO0FBQUEsRUFxQkEsTUFBQSxFQUFRLFNBQUEsR0FBQTtXQUNMOzs7O1FBREs7RUFBQSxDQXJCUjtDQU5XLENBWmQsQ0FBQTs7QUFBQSxNQStDTSxDQUFDLE9BQVAsR0FBaUIsV0EvQ2pCLENBQUE7Ozs7QUNBQTtBQUFBOzs7Ozs7O0dBQUE7QUFBQSxJQUFBLG9CQUFBOztBQUFBLFNBU0EsR0FBWSxPQUFBLENBQVEsMkJBQVIsQ0FUWixDQUFBOztBQUFBLFNBWUEsR0FBWSxLQUFLLENBQUMsbUJBQU4sQ0FJVDtBQUFBLEVBQUEsTUFBQSxFQUFRLENBQUMsU0FBRCxDQUFSO0FBQUEsRUFnQkEsTUFBQSxFQUFRLFNBQUEsR0FBQTtXQUNMOzs7O1FBREs7RUFBQSxDQWhCUjtDQUpTLENBWlosQ0FBQTs7QUFBQSxNQXdDTSxDQUFDLE9BQVAsR0FBaUIsU0F4Q2pCLENBQUE7Ozs7QUNBQTtBQUFBOzs7Ozs7O0dBQUE7QUFBQSxJQUFBLFNBQUE7O0FBQUEsU0FVQSxHQUdHO0FBQUE7QUFBQTs7O0tBQUE7QUFBQSxFQU1BLFdBQUEsRUFBYSxTQUFDLFFBQUQsR0FBQTtXQUNWLElBQUMsQ0FBQSxRQUFELEdBQVksU0FERjtFQUFBLENBTmI7QUFBQSxFQVVBLFdBQUEsRUFBYSxTQUFBLEdBQUE7V0FDVixJQUFDLENBQUEsU0FEUztFQUFBLENBVmI7QUFBQSxFQWVBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVCxJQUFBLElBQUcsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFXLENBQUMsR0FBWixDQUFnQixhQUFoQixDQUFBLEtBQWtDLElBQUMsQ0FBQSxRQUF0QztBQUNHLGFBQU8sRUFBUCxDQURIO0tBQUE7QUFHQSxXQUFPLFFBQVAsQ0FKUztFQUFBLENBZlo7Q0FiSCxDQUFBOztBQUFBLE1Bb0NNLENBQUMsT0FBUCxHQUFpQixTQXBDakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjKlxuICBAanN4IFJlYWN0LkRPTVxuXG4gIE1haW4gTVBDIGFwcGxpY2F0aW9uIGNvbnRyb2xsZXIgLyByb290IGVsZW1lbnQsIHdoaWNoIGNhc2NhZGVzIGRvd24gc3RhdGVcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblxuTGFuZGluZ1ZpZXcgPSByZXF1aXJlICcuL3ZpZXdzL0xhbmRpbmdWaWV3LmNvZmZlZSdcbkNyZWF0ZVZpZXcgID0gcmVxdWlyZSAnLi92aWV3cy9DcmVhdGVWaWV3LmNvZmZlZSdcblNoYXJlVmlldyAgID0gcmVxdWlyZSAnLi92aWV3cy9TaGFyZVZpZXcuY29mZmVlJ1xuXG5cbkFwcENvbnRyb2xsZXIgPSBSZWFjdC5jcmVhdGVCYWNrYm9uZUNsYXNzXG5cblxuICAgIyBQcm9wcyB0byBsaXN0ZW4gdG8gZm9yIHN0YXRlIGNoYW5nZXNcbiAgIGNoYW5nZU9wdGlvbnM6ICdjaGFuZ2U6dmlldydcblxuXG5cbiAgICMgUkVBQ1QgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgICMgSW5pdGlhbGl6YXRpb25cbiAgIGNvbXBvbmVudERpZE1vdW50OiAtPlxuXG5cblxuICAgIyBSZXJlbmRlcnMgdGhlIHZpZXcgd2hlbmV2ZXIgdGhlcmVzIGEgY2hhbmdlIHRvIHRoZSBgdmlld2Agc3RhdGVcbiAgIHJlbmRlcjogLT5cbiAgICAgIGFwcE1vZGVsID0gQGdldE1vZGVsKClcblxuICAgICAgVmlldyA9IHN3aXRjaCBhcHBNb2RlbC5nZXQoJ3ZpZXcnKVxuICAgICAgICAgd2hlbiAnbGFuZGluZ1ZpZXcnIHRoZW4gTGFuZGluZ1ZpZXdcbiAgICAgICAgIHdoZW4gJ2NyZWF0ZVZpZXcnICB0aGVuIENyZWF0ZVZpZXdcbiAgICAgICAgIHdoZW4gJ3NoYXJlVmlldycgICB0aGVuIFNoYXJlVmlld1xuXG4gICAgICBWaWV3KHtcbiAgICAgICAgIG1vZGVsOiBhcHBNb2RlbFxuICAgICAgfSlcblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwQ29udHJvbGxlciIsIiMjIypcbiAgQGpzeCBSZWFjdC5ET01cblxuICBNUEMgYXBwbGljYXRpb24gYm9vdHN0cmFwcGVyXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cbkFwcE1vZGVsICAgICAgPSByZXF1aXJlICcuL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5BcHBSb3V0ZXIgICAgID0gcmVxdWlyZSAnLi9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUnXG5BcHBDb250cm9sbGVyID0gcmVxdWlyZSAnLi9BcHBDb250cm9sbGVyLmNvZmZlZSdcblxuXG5pbml0aWFsaXplID0gZG8gLT5cblxuICAgYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIHZpZXc6ICdsYW5kaW5nVmlldydcblxuICAgYXBwUm91dGVyID0gbmV3IEFwcFJvdXRlclxuICAgICAgYXBwTW9kZWw6IGFwcE1vZGVsXG5cbiAgIFJlYWN0LnJlbmRlckNvbXBvbmVudCggQXBwQ29udHJvbGxlcih7IG1vZGVsOiBhcHBNb2RlbCB9KSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3dyYXBwZXInIClcblxuICAgQmFja2JvbmUuaGlzdG9yeS5zdGFydCgpXG4iLCIjIyMqXG4gIFByaW1hcnkgYXBwbGljYXRpb24gbW9kZWwgd2hpY2ggY29vcmRpbmF0ZXMgc3RhdGVcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblxuQXBwUm91dGVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnaW5pdGlhbGl6ZWQnOiBmYWxzZVxuICAgICAgJ3ZpZXcnOiBudWxsXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBSb3V0ZXIiLCIjIyMqXG4gIE1QQyBBcHBsaWNhdGlvbiBSb3V0ZXJcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblxuQXBwUm91dGVyID0gQmFja2JvbmUuUm91dGVyLmV4dGVuZFxuXG5cbiAgIHJvdXRlczpcbiAgICAgICcnOiAgICAgICAgICAgICdsYW5kaW5nUm91dGUnXG4gICAgICAnY3JlYXRlJzogICAgICAnY3JlYXRlUm91dGUnXG4gICAgICAnc2hhcmUnOiAgICAgICAnc2hhcmVSb3V0ZSdcblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHtAYXBwQ29udHJvbGxlciwgQGFwcE1vZGVsfSA9IG9wdGlvbnNcblxuXG5cbiAgIGxhbmRpbmdSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCAnbGFuZGluZ1ZpZXcnXG5cblxuXG4gICBjcmVhdGVSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCAnY3JlYXRlVmlldydcblxuXG5cbiAgIHNoYXJlUm91dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgJ3NoYXJlVmlldydcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwUm91dGVyIiwiIyMjKlxuICBAanN4IFJlYWN0LkRPTVxuXG4gIFByaW1hcnkgYXBwIHZpZXcgd2hpY2ggYWxsb3dzIHRoZSB1c2VyIHRvIGNyZWF0ZSB0cmFja3NcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblZpZXdNaXhpbiA9IHJlcXVpcmUgJy4vbWl4aW5zL1ZpZXdNaXhpbi5jb2ZmZWUnXG5cblxuQ3JlYXRlVmlldyA9IFJlYWN0LmNyZWF0ZUJhY2tib25lQ2xhc3NcblxuXG4gICAjIFZpZXcgc3VwZXJjbGFzcyBtaXhpbiBmb3Igc2hhcmVkIGZ1bmN0aW9uYWxpdHlcbiAgIG1peGluczogW1ZpZXdNaXhpbl1cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgIG9uQ2xpY2s6IC0+XG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcjL3NoYXJlJ1xuXG5cblxuICAgIyBSRUFDVCBNRVRIT0RTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgcmVuZGVyOiAtPlxuICAgICAgcmV0dXJuIGAoXG4gICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY3JlYXRlLXZpZXcnIG9uQ2xpY2s9e3RoaXMub25DbGlja30+Q1JFQVRFIEJFQVQ8L2Rpdj5cbiAgICAgIClgXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDcmVhdGVWaWV3IiwiIyMjKlxuICBAanN4IFJlYWN0LkRPTVxuXG4gIExhbmRpbmcgdmlldyB3aXRoIHN0YXJ0IGJ1dHRvblxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlld01peGluID0gcmVxdWlyZSAnLi9taXhpbnMvVmlld01peGluLmNvZmZlZSdcblxuXG5MYW5kaW5nVmlldyA9IFJlYWN0LmNyZWF0ZUJhY2tib25lQ2xhc3NcblxuXG4gICAjIFZpZXcgc3VwZXJjbGFzcyBtaXhpbiBmb3Igc2hhcmVkIGZ1bmN0aW9uYWxpdHlcbiAgICMgQHR5cGUge01peElufVxuXG4gICBtaXhpbnM6IFtWaWV3TWl4aW5dXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgb25DbGljazogLT5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyMvY3JlYXRlJ1xuXG5cblxuXG4gICAjIFJFQUNUIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgdG8gdGhlIGRvbSB3aGVuIHN0YXRlIGNoYW5nZXNcbiAgICMgQHJldHVybiB7dm9pZH1cblxuICAgcmVuZGVyOiAtPlxuICAgICAgYChcbiAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdsYW5kaW5nLXZpZXcnIG9uQ2xpY2s9e3RoaXMub25DbGlja30+XG4gICAgICAgICAgICBTVEFSVFxuICAgICAgICAgPC9kaXY+XG4gICAgICApYFxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZGluZ1ZpZXciLCIjIyMqXG4gIEBqc3ggUmVhY3QuRE9NXG5cbiAgVmlldyBmb3Igc2hhcmluZyAvIGRpc3BsYXlpbmcgZmluYWwgYmVhdCAvIGFuaW1hdGlvblxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlld01peGluID0gcmVxdWlyZSAnLi9taXhpbnMvVmlld01peGluLmNvZmZlZSdcblxuXG5TaGFyZVZpZXcgPSBSZWFjdC5jcmVhdGVCYWNrYm9uZUNsYXNzXG5cblxuICAgIyBWaWV3IHN1cGVyY2xhc3MgbWl4aW4gZm9yIHNoYXJlZCBmdW5jdGlvbmFsaXR5XG4gICBtaXhpbnM6IFtWaWV3TWl4aW5dXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIFJFQUNUIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgdG8gdGhlIGRvbSB3aGVuIHN0YXRlIGNoYW5nZXNcbiAgICMgQHJldHVybiB7dm9pZH1cblxuICAgcmVuZGVyOiAtPlxuICAgICAgYChcbiAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzaGFyZSc+XG4gICAgICAgICAgICBTaGFyZSB2aWV3XG4gICAgICAgICA8L2Rpdj5cbiAgICAgIClgXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTaGFyZVZpZXciLCIjIyMqXG4gIEBqc3ggUmVhY3QuRE9NXG5cbiAgVmlldyBcInN1cGVyY2xhc3NcIiBNaXhJbiBmb3Igc2hhcmVkIHZpZXcgZnVuY3Rpb25hbGl0eVxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5WaWV3TWl4aW4gPVxuXG5cbiAgICMjIypcbiAgICAqIEhlbHBlciBtZXRob2QgdG8gcmV0dXJuIHdoZXRoZXIgYSB2aWV3IGlzIHZpc2libGUgb3Igbm90XG4gICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgIyMjXG5cblxuICAgc2V0Vmlld05hbWU6ICh2aWV3TmFtZSkgLT5cbiAgICAgIEB2aWV3TmFtZSA9IHZpZXdOYW1lXG5cblxuICAgZ2V0Vmlld05hbWU6IC0+XG4gICAgICBAdmlld05hbWVcblxuXG5cbiAgIGdldFZpc2libGU6IC0+XG4gICAgICBpZiBAZ2V0TW9kZWwoKS5nZXQoJ2N1cnJlbnRWaWV3JykgaXMgQHZpZXdOYW1lXG4gICAgICAgICByZXR1cm4gJydcblxuICAgICAgcmV0dXJuICdoaWRkZW4nXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdNaXhpbiJdfQ==

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
var CreateView;

CreateView = React.createBackboneClass({
  render: function() {
    return (
         React.DOM.div( {className:"create-view", onClick:this.onClick}, "CREATE BEAT")
      );
  },
  onClick: function() {
    return window.location.hash = '#/share';
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
var LandingView, ViewMixin;

ViewMixin = require('./mixins/ViewMixin.coffee');

LandingView = React.createBackboneClass({
  mixins: [ViewMixin],
  viewName: 'landingView',
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
  viewName: 'landingView',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvQXBwQ29udHJvbGxlci5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9pbml0aWFsaXplLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9DcmVhdGVWaWV3LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL0xhbmRpbmdWaWV3LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL1NoYXJlVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9taXhpbnMvVmlld01peGluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQUE7Ozs7Ozs7R0FBQTtBQUFBLElBQUEsaURBQUE7O0FBQUEsV0FVQSxHQUFj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QSxHQUFZLE9BQUEsQ0FBUSwyQkFBUixDQVRaLENBQUE7O0FBQUEsU0FZQSxHQUFZLEtBQUssQ0FBQyxtQkFBTixDQUlUO0FBQUEsRUFBQSxNQUFBLEVBQVEsQ0FBQyxTQUFELENBQVI7QUFBQSxFQUlBLFFBQUEsRUFBVSxhQUpWO0FBQUEsRUFXQSxNQUFBLEVBQVEsU0FBQSxHQUFBO1dBQ0w7Ozs7UUFESztFQUFBLENBWFI7Q0FKUyxDQVpaLENBQUE7O0FBQUEsTUFtQ00sQ0FBQyxPQUFQLEdBQWlCLFNBbkNqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7OztHQUFBO0FBQUEsSUFBQSxTQUFBOztBQUFBLFNBVUEsR0FHRztBQUFBO0FBQUE7OztLQUFBO0FBQUEsRUFNQSxXQUFBLEVBQWEsU0FBQyxRQUFELEdBQUE7V0FDVixJQUFDLENBQUEsUUFBRCxHQUFZLFNBREY7RUFBQSxDQU5iO0FBQUEsRUFVQSxXQUFBLEVBQWEsU0FBQSxHQUFBO1dBQ1YsSUFBQyxDQUFBLFNBRFM7RUFBQSxDQVZiO0FBQUEsRUFlQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1QsSUFBQSxJQUFHLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBVyxDQUFDLEdBQVosQ0FBZ0IsYUFBaEIsQ0FBQSxLQUFrQyxJQUFDLENBQUEsUUFBdEM7QUFDRyxhQUFPLEVBQVAsQ0FESDtLQUFBO0FBR0EsV0FBTyxRQUFQLENBSlM7RUFBQSxDQWZaO0NBYkgsQ0FBQTs7QUFBQSxNQW9DTSxDQUFDLE9BQVAsR0FBaUIsU0FwQ2pCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjIypcbiAgQGpzeCBSZWFjdC5ET01cblxuICBNYWluIE1QQyBhcHBsaWNhdGlvbiBjb250cm9sbGVyIC8gcm9vdCBlbGVtZW50LCB3aGljaCBjYXNjYWRlcyBkb3duIHN0YXRlXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cbkxhbmRpbmdWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9MYW5kaW5nVmlldy5jb2ZmZWUnXG5DcmVhdGVWaWV3ICA9IHJlcXVpcmUgJy4vdmlld3MvQ3JlYXRlVmlldy5jb2ZmZWUnXG5TaGFyZVZpZXcgICA9IHJlcXVpcmUgJy4vdmlld3MvU2hhcmVWaWV3LmNvZmZlZSdcblxuXG5BcHBDb250cm9sbGVyID0gUmVhY3QuY3JlYXRlQmFja2JvbmVDbGFzc1xuXG5cbiAgICMgUHJvcHMgdG8gbGlzdGVuIHRvIGZvciBzdGF0ZSBjaGFuZ2VzXG4gICBjaGFuZ2VPcHRpb25zOiAnY2hhbmdlOnZpZXcnXG5cblxuICAgIyBJbml0aWFsaXphdGlvblxuICAgY29tcG9uZW50RGlkTW91bnQ6IC0+XG5cblxuXG4gICAjIFJlcmVuZGVycyB0aGUgdmlldyB3aGVuZXZlciB0aGVyZXMgYSBjaGFuZ2UgdG8gdGhlIGB2aWV3YCBzdGF0ZVxuICAgcmVuZGVyOiAtPlxuICAgICAgYXBwTW9kZWwgPSBAZ2V0TW9kZWwoKVxuXG4gICAgICBWaWV3ID0gc3dpdGNoIGFwcE1vZGVsLmdldCgndmlldycpXG4gICAgICAgICB3aGVuICdsYW5kaW5nVmlldycgdGhlbiBMYW5kaW5nVmlld1xuICAgICAgICAgd2hlbiAnY3JlYXRlVmlldycgIHRoZW4gQ3JlYXRlVmlld1xuICAgICAgICAgd2hlbiAnc2hhcmVWaWV3JyAgIHRoZW4gU2hhcmVWaWV3XG5cbiAgICAgIFZpZXcoe1xuICAgICAgICAgbW9kZWw6IGFwcE1vZGVsXG4gICAgICB9KVxuXG5cblxuXG4gICAjIFBVQkxJQyBNRVRIT0RTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb250cm9sbGVyIiwiIyMjKlxuICBAanN4IFJlYWN0LkRPTVxuXG4gIE1QQyBhcHBsaWNhdGlvbiBib290c3RyYXBwZXJcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblxuQXBwTW9kZWwgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbkFwcFJvdXRlciAgICAgPSByZXF1aXJlICcuL3JvdXRlcnMvQXBwUm91dGVyLmNvZmZlZSdcbkFwcENvbnRyb2xsZXIgPSByZXF1aXJlICcuL0FwcENvbnRyb2xsZXIuY29mZmVlJ1xuXG5cbmluaXRpYWxpemUgPSBkbyAtPlxuXG4gICBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgdmlldzogJ2xhbmRpbmdWaWV3J1xuXG4gICBhcHBSb3V0ZXIgPSBuZXcgQXBwUm91dGVyXG4gICAgICBhcHBNb2RlbDogYXBwTW9kZWxcblxuICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KCBBcHBDb250cm9sbGVyKHsgbW9kZWw6IGFwcE1vZGVsIH0pLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnd3JhcHBlcicgKVxuXG4gICBCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0KClcbiIsIiMjIypcbiAgUHJpbWFyeSBhcHBsaWNhdGlvbiBtb2RlbCB3aGljaCBjb29yZGluYXRlcyBzdGF0ZVxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5BcHBSb3V0ZXIgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmRcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICdpbml0aWFsaXplZCc6IGZhbHNlXG4gICAgICAndmlldyc6IG51bGxcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFJvdXRlciIsIiMjIypcbiAgTVBDIEFwcGxpY2F0aW9uIFJvdXRlclxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5BcHBSb3V0ZXIgPSBCYWNrYm9uZS5Sb3V0ZXIuZXh0ZW5kXG5cblxuICAgcm91dGVzOlxuICAgICAgJyc6ICAgICAgICAgICAgJ2xhbmRpbmdSb3V0ZSdcbiAgICAgICdjcmVhdGUnOiAgICAgICdjcmVhdGVSb3V0ZSdcbiAgICAgICdzaGFyZSc6ICAgICAgICdzaGFyZVJvdXRlJ1xuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAge0BhcHBDb250cm9sbGVyLCBAYXBwTW9kZWx9ID0gb3B0aW9uc1xuXG5cblxuICAgbGFuZGluZ1JvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsICdsYW5kaW5nVmlldydcblxuXG5cbiAgIGNyZWF0ZVJvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsICdjcmVhdGVWaWV3J1xuXG5cblxuICAgc2hhcmVSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCAnc2hhcmVWaWV3J1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBSb3V0ZXIiLCIjIyMqXG4gIEBqc3ggUmVhY3QuRE9NXG5cbiAgUHJpbWFyeSBhcHAgdmlldyB3aGljaCBhbGxvd3MgdGhlIHVzZXIgdG8gY3JlYXRlIHRyYWNrc1xuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5DcmVhdGVWaWV3ID0gUmVhY3QuY3JlYXRlQmFja2JvbmVDbGFzc1xuXG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIHJldHVybiBgKFxuICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NyZWF0ZS12aWV3JyBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9PkNSRUFURSBCRUFUPC9kaXY+XG4gICAgICApYFxuXG5cbiAgIG9uQ2xpY2s6IC0+XG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcjL3NoYXJlJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3JlYXRlVmlldyIsIiMjIypcbiAgQGpzeCBSZWFjdC5ET01cblxuICBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b25cblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblZpZXdNaXhpbiA9IHJlcXVpcmUgJy4vbWl4aW5zL1ZpZXdNaXhpbi5jb2ZmZWUnXG5cblxuTGFuZGluZ1ZpZXcgPSBSZWFjdC5jcmVhdGVCYWNrYm9uZUNsYXNzXG5cblxuICAgIyBWaWV3IHN1cGVyY2xhc3MgbWl4aW4gZm9yIHNoYXJlZCBmdW5jdGlvbmFsaXR5XG4gICAjIEB0eXBlIHtNaXhJbn1cblxuICAgbWl4aW5zOiBbVmlld01peGluXVxuXG5cbiAgICMgVmlldyBpZGVudGl0eSBmb3IgaGFuZGxpbmcgcm91dGUgY2hhbmdlc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICB2aWV3TmFtZTogJ2xhbmRpbmdWaWV3J1xuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IHRvIHRoZSBkb20gd2hlbiBzdGF0ZSBjaGFuZ2VzXG4gICAjIEByZXR1cm4ge3ZvaWR9XG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIGAoXG4gICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbGFuZGluZy12aWV3JyBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9PlxuICAgICAgICAgICAgU1RBUlRcbiAgICAgICAgIDwvZGl2PlxuICAgICAgKWBcblxuXG4gICBvbkNsaWNrOiAtPlxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnIy9jcmVhdGUnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYW5kaW5nVmlldyIsIiMjIypcbiAgQGpzeCBSZWFjdC5ET01cblxuICBWaWV3IGZvciBzaGFyaW5nIC8gZGlzcGxheWluZyBmaW5hbCBiZWF0IC8gYW5pbWF0aW9uXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5WaWV3TWl4aW4gPSByZXF1aXJlICcuL21peGlucy9WaWV3TWl4aW4uY29mZmVlJ1xuXG5cblNoYXJlVmlldyA9IFJlYWN0LmNyZWF0ZUJhY2tib25lQ2xhc3NcblxuXG4gICAjIFZpZXcgc3VwZXJjbGFzcyBtaXhpbiBmb3Igc2hhcmVkIGZ1bmN0aW9uYWxpdHlcbiAgIG1peGluczogW1ZpZXdNaXhpbl1cblxuXG4gICAjIFZpZXcgaWRlbnRpdHkgZm9yIGhhbmRsaW5nIHJvdXRlIGNoYW5nZXNcbiAgIHZpZXdOYW1lOiAnbGFuZGluZ1ZpZXcnXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgdG8gdGhlIGRvbSB3aGVuIHN0YXRlIGNoYW5nZXNcbiAgICMgQHJldHVybiB7dm9pZH1cblxuICAgcmVuZGVyOiAtPlxuICAgICAgYChcbiAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzaGFyZSc+XG4gICAgICAgICAgICBTaGFyZSB2aWV3XG4gICAgICAgICA8L2Rpdj5cbiAgICAgIClgXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTaGFyZVZpZXciLCIjIyMqXG4gIEBqc3ggUmVhY3QuRE9NXG5cbiAgVmlldyBcInN1cGVyY2xhc3NcIiBNaXhJbiBmb3Igc2hhcmVkIHZpZXcgZnVuY3Rpb25hbGl0eVxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5WaWV3TWl4aW4gPVxuXG5cbiAgICMjIypcbiAgICAqIEhlbHBlciBtZXRob2QgdG8gcmV0dXJuIHdoZXRoZXIgYSB2aWV3IGlzIHZpc2libGUgb3Igbm90XG4gICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgIyMjXG5cblxuICAgc2V0Vmlld05hbWU6ICh2aWV3TmFtZSkgLT5cbiAgICAgIEB2aWV3TmFtZSA9IHZpZXdOYW1lXG5cblxuICAgZ2V0Vmlld05hbWU6IC0+XG4gICAgICBAdmlld05hbWVcblxuXG5cbiAgIGdldFZpc2libGU6IC0+XG4gICAgICBpZiBAZ2V0TW9kZWwoKS5nZXQoJ2N1cnJlbnRWaWV3JykgaXMgQHZpZXdOYW1lXG4gICAgICAgICByZXR1cm4gJydcblxuICAgICAgcmV0dXJuICdoaWRkZW4nXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdNaXhpbiJdfQ==

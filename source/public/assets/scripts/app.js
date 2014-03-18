(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
  @jsx React.DOM

  Main MPC application controller / root element, which cascades down state

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppController, CreateView, LandingView;

LandingView = require('./views/LandingView.coffee');

CreateView = require('./views/CreateView.coffee');

AppController = React.createBackboneClass({
  changeOptions: 'change:view',
  componentWillMount: function() {
    console.log(this.getModel());
    return setTimeout((function(_this) {
      return function() {
        console.log('changing view');
        return _this.model.set('view', 'landingView');
      };
    })(this), 3000);
  },
  render: function() {
    var View;
    View = (function() {
      switch (this.getModel().get('view')) {
        case 'landingView':
          return LandingView;
        case 'createView':
          return CreateView;
      }
    }).call(this);
    return (
         View()
      );
  },
  renderLandingView: function() {},
  renderCreateView: function() {}
});

module.exports = AppController;


},{"./views/CreateView.coffee":5,"./views/LandingView.coffee":6}],2:[function(require,module,exports){

/**
  @jsx React.DOM

  MPC application bootstrapper

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppController, AppModel, AppRouter, initialize;

AppRouter = require('./routers/AppRouter.coffee');

AppModel = require('./models/AppModel.coffee');

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
    'create': 'createRoute'
  },
  initialize: function(options) {
    return this.appController = options.appController, this.appModel = options.appModel, options;
  },
  landingRoute: function() {
    return this.appModel.set('view', 'landingView');
  },
  createRoute: function() {
    return this.appModel.set('view', 'createView');
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


},{"./mixins/ViewMixin.coffee":7}],7:[function(require,module,exports){

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvQXBwQ29udHJvbGxlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9pbml0aWFsaXplLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9DcmVhdGVWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL0xhbmRpbmdWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL21peGlucy9WaWV3TWl4aW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFBQTs7Ozs7OztHQUFBO0FBQUEsSUFBQSxzQ0FBQTs7QUFBQSxXQVVBLEdBQWMsT0FBQSxDQUFRLDRCQUFSLENBVmQsQ0FBQTs7QUFB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QUE7V0FDbkIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnQkFBWixFQURtQjtFQUFBLENBWnRCO0FBQUEsRUFpQkEsTUFBQSxFQUFRLFNBQUEsR0FBQTtXQUNMOzs7O1FBREs7RUFBQSxDQWpCUjtBQUFBLEVBeUJBLE9BQUEsRUFBUyxTQUFBLEdBQUE7V0FDTixNQUFNLENBQUMsUUFBUSxDQUFDLElBQWhCLEdBQXVCLFdBRGpCO0VBQUEsQ0F6QlQ7Q0FGVyxDQVpkLENBQUE7O0FBQUEsTUEyQ00sQ0FBQyxPQUFQLEdBQWlCLFdBM0NqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7OztHQUFBO0FBQUEsSUFBQSxTQUFBOztBQUFBLFNBVUEsR0FHRztBQUFBO0FBQUE7OztLQUFBO0FBQUEsRUFNQSxXQUFBLEVBQWEsU0FBQyxRQUFELEdBQUE7V0FDVixJQUFDLENBQUEsUUFBRCxHQUFZLFNBREY7RUFBQSxDQU5iO0FBQUEsRUFVQSxXQUFBLEVBQWEsU0FBQSxHQUFBO1dBQ1YsSUFBQyxDQUFBLFNBRFM7RUFBQSxDQVZiO0FBQUEsRUFlQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1QsSUFBQSxJQUFHLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBVyxDQUFDLEdBQVosQ0FBZ0IsYUFBaEIsQ0FBQSxLQUFrQyxJQUFDLENBQUEsUUFBdEM7QUFDRyxhQUFPLEVBQVAsQ0FESDtLQUFBO0FBR0EsV0FBTyxRQUFQLENBSlM7RUFBQSxDQWZaO0NBYkgsQ0FBQTs7QUFBQSxNQW9DTSxDQUFDLE9BQVAsR0FBaUIsU0FwQ2pCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjIypcbiAgQGpzeCBSZWFjdC5ET01cblxuICBNYWluIE1QQyBhcHBsaWNhdGlvbiBjb250cm9sbGVyIC8gcm9vdCBlbGVtZW50LCB3aGljaCBjYXNjYWRlcyBkb3duIHN0YXRlXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cbkxhbmRpbmdWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9MYW5kaW5nVmlldy5jb2ZmZWUnXG5DcmVhdGVWaWV3ICA9IHJlcXVpcmUgJy4vdmlld3MvQ3JlYXRlVmlldy5jb2ZmZWUnXG5cblxuQXBwQ29udHJvbGxlciA9IFJlYWN0LmNyZWF0ZUJhY2tib25lQ2xhc3NcblxuXG4gICBjaGFuZ2VPcHRpb25zOiAnY2hhbmdlOnZpZXcnXG5cblxuICAgY29tcG9uZW50V2lsbE1vdW50OiAtPlxuICAgICAgY29uc29sZS5sb2cgQGdldE1vZGVsKClcblxuICAgICAgc2V0VGltZW91dCA9PlxuICAgICAgICAgY29uc29sZS5sb2cgJ2NoYW5naW5nIHZpZXcnXG5cbiAgICAgICAgIEBtb2RlbC5zZXQgJ3ZpZXcnLCAnbGFuZGluZ1ZpZXcnXG4gICAgICAsIDMwMDBcblxuXG5cbiAgIHJlbmRlcjogLT5cblxuICAgICAgVmlldyA9IHN3aXRjaCBAZ2V0TW9kZWwoKS5nZXQoJ3ZpZXcnKVxuICAgICAgICAgd2hlbiAnbGFuZGluZ1ZpZXcnIHRoZW4gTGFuZGluZ1ZpZXdcbiAgICAgICAgIHdoZW4gJ2NyZWF0ZVZpZXcnICB0aGVuIENyZWF0ZVZpZXdcblxuICAgICAgYChcbiAgICAgICAgIFZpZXcoKVxuICAgICAgKWBcblxuXG5cblxuICAgIyBQVUJMSUMgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgIHJlbmRlckxhbmRpbmdWaWV3OiAtPlxuICAgICAgI1JlYWN0LnJlbmRlckNvbXBvbmVudCggTGFuZGluZ1ZpZXcoKSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3dyYXBwZXInIClcblxuXG5cbiAgIHJlbmRlckNyZWF0ZVZpZXc6IC0+XG4gICAgICAjUmVhY3QucmVuZGVyQ29tcG9uZW50KCBDcmVhdGVWaWV3KCksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICd3cmFwcGVyJyApXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcENvbnRyb2xsZXIiLCIjIyMqXG4gIEBqc3ggUmVhY3QuRE9NXG5cbiAgTVBDIGFwcGxpY2F0aW9uIGJvb3RzdHJhcHBlclxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5BcHBSb3V0ZXIgICAgID0gcmVxdWlyZSAnLi9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUnXG5BcHBNb2RlbCAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuQXBwQ29udHJvbGxlciA9IHJlcXVpcmUgJy4vQXBwQ29udHJvbGxlci5jb2ZmZWUnXG5cblxuaW5pdGlhbGl6ZSA9IGRvIC0+XG5cbiAgIGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICB2aWV3OiAnbGFuZGluZ1ZpZXcnXG5cbiAgIGFwcFJvdXRlciA9IG5ldyBBcHBSb3V0ZXJcbiAgICAgIGFwcE1vZGVsOiBhcHBNb2RlbFxuXG4gICBSZWFjdC5yZW5kZXJDb21wb25lbnQoIEFwcENvbnRyb2xsZXIoeyBtb2RlbDogYXBwTW9kZWwgfSksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICd3cmFwcGVyJyApXG5cbiAgIEJhY2tib25lLmhpc3Rvcnkuc3RhcnQoKVxuIiwiIyMjKlxuICBQcmltYXJ5IGFwcGxpY2F0aW9uIG1vZGVsIHdoaWNoIGNvb3JkaW5hdGVzIHN0YXRlXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cbkFwcFJvdXRlciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ2luaXRpYWxpemVkJzogZmFsc2VcbiAgICAgICd2aWV3JzogbnVsbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwUm91dGVyIiwiIyMjKlxuICBNUEMgQXBwbGljYXRpb24gUm91dGVyXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cbkFwcFJvdXRlciA9IEJhY2tib25lLlJvdXRlci5leHRlbmRcblxuXG4gICByb3V0ZXM6XG4gICAgICAnJzogICAgICAgICAgICAnbGFuZGluZ1JvdXRlJ1xuICAgICAgJ2NyZWF0ZSc6ICAgICAgJ2NyZWF0ZVJvdXRlJ1xuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAge0BhcHBDb250cm9sbGVyLCBAYXBwTW9kZWx9ID0gb3B0aW9uc1xuXG5cblxuICAgbGFuZGluZ1JvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsICdsYW5kaW5nVmlldydcblxuXG5cbiAgIGNyZWF0ZVJvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsICdjcmVhdGVWaWV3J1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBSb3V0ZXIiLCIjIyMqXG4gIEBqc3ggUmVhY3QuRE9NXG5cbiAgUHJpbWFyeSBhcHAgdmlldyB3aGljaCBhbGxvd3MgdGhlIHVzZXIgdG8gY3JlYXRlIHRyYWNrc1xuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5DcmVhdGVWaWV3ID0gUmVhY3QuY3JlYXRlQmFja2JvbmVDbGFzc1xuXG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIHJldHVybiBgKFxuICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NyZWF0ZS12aWV3JyBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9PkNSRUFURSBCRUFUPC9kaXY+XG4gICAgICApYFxuXG5cbiAgIG9uQ2xpY2s6IC0+XG4gICAgICBjb25zb2xlLmxvZyAnY3JlYXRpbmcgYmVhdCdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IENyZWF0ZVZpZXciLCIjIyMqXG4gIEBqc3ggUmVhY3QuRE9NXG5cbiAgTGFuZGluZyB2aWV3IHdpdGggc3RhcnQgYnV0dG9uXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5WaWV3TWl4aW4gPSByZXF1aXJlICcuL21peGlucy9WaWV3TWl4aW4uY29mZmVlJ1xuXG5cbkxhbmRpbmdWaWV3ID0gUmVhY3QuY3JlYXRlQmFja2JvbmVDbGFzc1xuXG4gICBtaXhpbnM6IFtWaWV3TWl4aW5dXG5cbiAgIHZpZXdOYW1lOiAnbGFuZGluZ1ZpZXcnXG5cblxuICAgY29tcG9uZW50V2lsbE1vdW50OiAob3B0aW9ucykgLT5cbiAgICAgIGNvbnNvbGUubG9nICdtb3VudGluZydcblxuICAgICAgY29uc29sZS5sb2cgQGdldFZpZXdOYW1lKClcblxuXG5cbiAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiAob3B0aW9ucykgLT5cbiAgICAgIGNvbnNvbGUubG9nICd1bm1vdW50aW5nLi4uLidcblxuXG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIGAoXG4gICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbGFuZGluZy12aWV3JyBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9PlxuICAgICAgICAgICAgU1RBUlRcbiAgICAgICAgIDwvZGl2PlxuICAgICAgKWBcblxuXG4gICBvbkNsaWNrOiAtPlxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnIy9jcmVhdGUnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYW5kaW5nVmlldyIsIiMjIypcbiAgQGpzeCBSZWFjdC5ET01cblxuICBWaWV3IFwic3VwZXJjbGFzc1wiIE1peEluIGZvciBzaGFyZWQgdmlldyBmdW5jdGlvbmFsaXR5XG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cblZpZXdNaXhpbiA9XG5cblxuICAgIyMjKlxuICAgICogSGVscGVyIG1ldGhvZCB0byByZXR1cm4gd2hldGhlciBhIHZpZXcgaXMgdmlzaWJsZSBvciBub3RcbiAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAjIyNcblxuXG4gICBzZXRWaWV3TmFtZTogKHZpZXdOYW1lKSAtPlxuICAgICAgQHZpZXdOYW1lID0gdmlld05hbWVcblxuXG4gICBnZXRWaWV3TmFtZTogLT5cbiAgICAgIEB2aWV3TmFtZVxuXG5cblxuICAgZ2V0VmlzaWJsZTogLT5cbiAgICAgIGlmIEBnZXRNb2RlbCgpLmdldCgnY3VycmVudFZpZXcnKSBpcyBAdmlld05hbWVcbiAgICAgICAgIHJldHVybiAnJ1xuXG4gICAgICByZXR1cm4gJ2hpZGRlbidcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld01peGluIl19

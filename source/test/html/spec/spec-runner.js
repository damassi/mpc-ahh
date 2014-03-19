(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jshint eqnull: true */

module.exports.create = function() {

var Handlebars = {};

// BEGIN(BROWSER)

Handlebars.VERSION = "1.0.0";
Handlebars.COMPILER_REVISION = 4;

Handlebars.REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '>= 1.0.0'
};

Handlebars.helpers  = {};
Handlebars.partials = {};

var toString = Object.prototype.toString,
    functionType = '[object Function]',
    objectType = '[object Object]';

Handlebars.registerHelper = function(name, fn, inverse) {
  if (toString.call(name) === objectType) {
    if (inverse || fn) { throw new Handlebars.Exception('Arg not supported with multiple helpers'); }
    Handlebars.Utils.extend(this.helpers, name);
  } else {
    if (inverse) { fn.not = inverse; }
    this.helpers[name] = fn;
  }
};

Handlebars.registerPartial = function(name, str) {
  if (toString.call(name) === objectType) {
    Handlebars.Utils.extend(this.partials,  name);
  } else {
    this.partials[name] = str;
  }
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Missing helper: '" + arg + "'");
  }
});

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;

  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      return Handlebars.helpers.each(context, options);
    } else {
      return inverse(this);
    }
  } else {
    return fn(context);
  }
});

Handlebars.K = function() {};

Handlebars.createFrame = Object.create || function(object) {
  Handlebars.K.prototype = object;
  var obj = new Handlebars.K();
  Handlebars.K.prototype = null;
  return obj;
};

Handlebars.logger = {
  DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

  methodMap: {0: 'debug', 1: 'info', 2: 'warn', 3: 'error'},

  // can be overridden in the host environment
  log: function(level, obj) {
    if (Handlebars.logger.level <= level) {
      var method = Handlebars.logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};

Handlebars.log = function(level, obj) { Handlebars.logger.log(level, obj); };

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var i = 0, ret = "", data;

  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  if(context && typeof context === 'object') {
    if(context instanceof Array){
      for(var j = context.length; i<j; i++) {
        if (data) { data.index = i; }
        ret = ret + fn(context[i], { data: data });
      }
    } else {
      for(var key in context) {
        if(context.hasOwnProperty(key)) {
          if(data) { data.key = key; }
          ret = ret + fn(context[key], {data: data});
          i++;
        }
      }
    }
  }

  if(i === 0){
    ret = inverse(this);
  }

  return ret;
});

Handlebars.registerHelper('if', function(conditional, options) {
  var type = toString.call(conditional);
  if(type === functionType) { conditional = conditional.call(this); }

  if(!conditional || Handlebars.Utils.isEmpty(conditional)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(conditional, options) {
  return Handlebars.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn});
});

Handlebars.registerHelper('with', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if (!Handlebars.Utils.isEmpty(context)) return options.fn(context);
});

Handlebars.registerHelper('log', function(context, options) {
  var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
  Handlebars.log(level, context);
});

// END(BROWSER)

return Handlebars;
};

},{}],2:[function(require,module,exports){
exports.attach = function(Handlebars) {

// BEGIN(BROWSER)

Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          programWrapper = Handlebars.VM.program(i, fn, data);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = Handlebars.VM.program(i, fn);
        }
        return programWrapper;
      },
      merge: function(param, common) {
        var ret = param || common;

        if (param && common) {
          ret = {};
          Handlebars.Utils.extend(ret, common);
          Handlebars.Utils.extend(ret, param);
        }
        return ret;
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop,
      compilerInfo: null
    };

    return function(context, options) {
      options = options || {};
      var result = templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);

      var compilerInfo = container.compilerInfo || [],
          compilerRevision = compilerInfo[0] || 1,
          currentRevision = Handlebars.COMPILER_REVISION;

      if (compilerRevision !== currentRevision) {
        if (compilerRevision < currentRevision) {
          var runtimeVersions = Handlebars.REVISION_CHANGES[currentRevision],
              compilerVersions = Handlebars.REVISION_CHANGES[compilerRevision];
          throw "Template was precompiled with an older version of Handlebars than the current runtime. "+
                "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").";
        } else {
          // Use the embedded version info since the runtime doesn't know about this revision yet
          throw "Template was precompiled with a newer version of Handlebars than the current runtime. "+
                "Please update your runtime to a newer version ("+compilerInfo[1]+").";
        }
      }

      return result;
    };
  },

  programWithDepth: function(i, fn, data /*, $depth */) {
    var args = Array.prototype.slice.call(arguments, 3);

    var program = function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
    program.program = i;
    program.depth = args.length;
    return program;
  },
  program: function(i, fn, data) {
    var program = function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
    program.program = i;
    program.depth = 0;
    return program;
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    var options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial, {data: data !== undefined});
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;

// END(BROWSER)

return Handlebars;

};

},{}],3:[function(require,module,exports){
exports.attach = function(Handlebars) {

var toString = Object.prototype.toString;

// BEGIN(BROWSER)

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }
};
Handlebars.Exception.prototype = new Error();

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

var escapeChar = function(chr) {
  return escape[chr] || "&amp;";
};

Handlebars.Utils = {
  extend: function(obj, value) {
    for(var key in value) {
      if(value.hasOwnProperty(key)) {
        obj[key] = value[key];
      }
    }
  },

  escapeExpression: function(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof Handlebars.SafeString) {
      return string.toString();
    } else if (string == null || string === false) {
      return "";
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = string.toString();

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  },

  isEmpty: function(value) {
    if (!value && value !== 0) {
      return true;
    } else if(toString.call(value) === "[object Array]" && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }
};

// END(BROWSER)

return Handlebars;
};

},{}],4:[function(require,module,exports){
module.exports = exports = require('handlebars/lib/handlebars/base.js').create()
require('handlebars/lib/handlebars/utils.js').attach(exports)
require('handlebars/lib/handlebars/runtime.js').attach(exports)
},{"handlebars/lib/handlebars/base.js":1,"handlebars/lib/handlebars/runtime.js":2,"handlebars/lib/handlebars/utils.js":3}],5:[function(require,module,exports){

/**
 * Primary application controller
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppController, AppModel, AppRouter, CreateView, LandingView, ShareView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppModel = require('./models/AppModel.coffee');

AppRouter = require('./routers/AppRouter.coffee');

LandingView = require('./views/landing/LandingView.coffee');

CreateView = require('./views/create/CreateView.coffee');

ShareView = require('./views/share/ShareView.coffee');

AppController = (function(_super) {
  __extends(AppController, _super);

  function AppController() {
    return AppController.__super__.constructor.apply(this, arguments);
  }

  AppController.prototype.className = 'wrapper';

  AppController.prototype.initialize = function(options) {
    this.appModel = new AppModel;
    this.landingView = new LandingView;
    this.shareView = new ShareView;
    this.createView = new CreateView;
    this.appRouter = new AppRouter({
      appController: this,
      appModel: this.appModel
    });
    return this.addEventListeners();
  };

  AppController.prototype.render = function() {
    this.$body = $('body');
    this.$body.append(this.el);
    return Backbone.history.start({
      pushState: false
    });
  };

  AppController.prototype.remove = function() {
    this.landingView.remove();
    this.shareView.remove();
    this.createView.remove();
    return this.removeEventListeners();
  };

  AppController.prototype.addEventListeners = function() {
    return this.listenTo(this.appModel, 'change:view', this.onViewChange);
  };

  AppController.prototype.removeEventListeners = function() {
    return this.stopListening();
  };

  AppController.prototype.onViewChange = function(model) {
    var currentView, previousView;
    previousView = model._previousAttributes.view;
    currentView = model.changed.view;
    if (previousView) {
      previousView.hide({
        remove: true
      });
    }
    this.$el.append(currentView.render().el);
    return currentView.show();
  };

  return AppController;

})(Backbone.View);

module.exports = AppController;


},{"./models/AppModel.coffee":9,"./routers/AppRouter.coffee":14,"./views/create/CreateView.coffee":17,"./views/landing/LandingView.coffee":33,"./views/share/ShareView.coffee":35}],6:[function(require,module,exports){

/**
  Application-wide general configurations

  @author Christopher Pappas <chris@wintr.us>
  @date   3.19.14
 */
var AppConfig;

AppConfig = {
  ASSETS: {
    path: '/assets',
    audio: 'audio',
    data: 'data',
    images: 'images'
  },
  BPM: 120,
  BPM_MAX: 300,
  returnAssetPath: function(assetType) {
    return this.ASSETS.path + '/' + this.ASSETS[assetType];
  },
  returnTestAssetPath: function(assetType) {
    return '/test/html/' + this.ASSETS.path + '/' + this.ASSETS[assetType];
  }
};

module.exports = AppConfig;


},{}],7:[function(require,module,exports){

/**
 * Application related events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent;

AppEvent = {
  CHANGE_KIT: 'change:kitModel',
  CHANGE_BPM: 'change:bpm'
};

module.exports = AppEvent;


},{}],8:[function(require,module,exports){

/**
 * Global PubSub events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var PubSub;

PubSub = {
  ROUTE: 'onRouteChange'
};

module.exports = PubSub;


},{}],9:[function(require,module,exports){

/**
  Primary application model which coordinates state

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppConfig, AppRouter;

AppConfig = require('../config/AppConfig.coffee');

AppRouter = Backbone.Model.extend({
  defaults: {
    'view': null,
    'kitModel': null,
    'bpm': AppConfig.BPM
  }
});

module.exports = AppRouter;


},{"../config/AppConfig.coffee":6}],10:[function(require,module,exports){

/**
 * Collection representing each sound from a kit set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var InstrumentCollection, InstrumentModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

InstrumentModel = require('./InstrumentModel.coffee');

InstrumentCollection = (function(_super) {
  __extends(InstrumentCollection, _super);

  function InstrumentCollection() {
    return InstrumentCollection.__super__.constructor.apply(this, arguments);
  }

  InstrumentCollection.prototype.model = InstrumentModel;

  return InstrumentCollection;

})(Backbone.Collection);

module.exports = InstrumentCollection;


},{"./InstrumentModel.coffee":11}],11:[function(require,module,exports){

/**
 * Sound model for each individual kit sound set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var InstrumentModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

InstrumentModel = (function(_super) {
  __extends(InstrumentModel, _super);

  function InstrumentModel() {
    return InstrumentModel.__super__.constructor.apply(this, arguments);
  }

  InstrumentModel.prototype.defaults = {
    icon: null,
    label: null,
    src: null
  };

  InstrumentModel.prototype.parse = function(response) {
    return response;
  };

  return InstrumentModel;

})(Backbone.Model);

module.exports = InstrumentModel;


},{}],12:[function(require,module,exports){

/**
 * Collection of sound kits
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppConfig, KitCollection, KitModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../config/AppConfig.coffee');

KitModel = require('./KitModel.coffee');

KitCollection = (function(_super) {
  __extends(KitCollection, _super);

  function KitCollection() {
    return KitCollection.__super__.constructor.apply(this, arguments);
  }

  KitCollection.prototype.url = "" + (AppConfig.returnAssetPath('data')) + "/sound-data.json";

  KitCollection.prototype.model = KitModel;

  KitCollection.prototype.kitId = 0;

  KitCollection.prototype.parse = function(response) {
    var assetPath, kits;
    assetPath = response.config.assetPath;
    kits = response.kits;
    kits = _.map(kits, function(kit) {
      kit.path = assetPath + '/' + kit.folder;
      return kit;
    });
    return kits;
  };

  KitCollection.prototype.previousKit = function() {
    var kitModel, len;
    len = this.length;
    if (this.kitId > 0) {
      this.kitId--;
    } else {
      this.kitId = len - 1;
    }
    return kitModel = this.at(this.kitId);
  };

  KitCollection.prototype.nextKit = function() {
    var kitModel, len;
    len = this.length - 1;
    if (this.kitId < len) {
      this.kitId++;
    } else {
      this.kitId = 0;
    }
    return kitModel = this.at(this.kitId);
  };

  return KitCollection;

})(Backbone.Collection);

module.exports = KitCollection;


},{"../config/AppConfig.coffee":6,"./KitModel.coffee":13}],13:[function(require,module,exports){

/**
 * Kit model for handling state related to kit selection
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var InstrumentCollection, KitModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

InstrumentCollection = require('./InstrumentCollection.coffee');

KitModel = (function(_super) {
  __extends(KitModel, _super);

  function KitModel() {
    return KitModel.__super__.constructor.apply(this, arguments);
  }

  KitModel.prototype.defaults = {
    'label': null,
    'path': null,
    'folder': null,
    'sounds': null
  };

  KitModel.prototype.initialize = function(options) {
    return this.parse = true;
  };

  KitModel.prototype.parse = function(response) {
    _.each(response.instruments, function(instrument) {
      return instrument.src = response.path + '/' + instrument.src;
    });
    response.instruments = new InstrumentCollection(response.instruments);
    return response;
  };

  return KitModel;

})(Backbone.Model);

module.exports = KitModel;


},{"./InstrumentCollection.coffee":10}],14:[function(require,module,exports){

/**
 * MPC Application router
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppRouter, BPMIndicator, KitCollection, KitModel, KitSelection, PubEvent, PubSub,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PubSub = require('../utils/PubSub');

PubEvent = require('../events/PubEvent.coffee');

KitSelection = require('../views/create/components/KitSelection.coffee');

KitCollection = require('../models/KitCollection.coffee');

KitModel = require('../models/KitModel.coffee');

BPMIndicator = require('../views/create/components/BPMIndicator.coffee');

AppRouter = (function(_super) {
  __extends(AppRouter, _super);

  function AppRouter() {
    this.onRouteChange = __bind(this.onRouteChange, this);
    return AppRouter.__super__.constructor.apply(this, arguments);
  }

  AppRouter.prototype.routes = {
    '': 'landingRoute',
    'create': 'createRoute',
    'share': 'shareRoute',
    'kit-selection': 'kitSelectionRoute',
    'bpm-indicator': 'bpmIndicatorRoute'
  };

  AppRouter.prototype.initialize = function(options) {
    this.appController = options.appController, this.appModel = options.appModel;
    return PubSub.on(PubEvent.ROUTE, this.onRouteChange);
  };

  AppRouter.prototype.onRouteChange = function(params) {
    var route;
    route = params.route;
    return this.navigate(route, {
      trigger: true
    });
  };

  AppRouter.prototype.landingRoute = function() {
    return this.appModel.set('view', this.appController.landingView);
  };

  AppRouter.prototype.createRoute = function() {
    return this.appModel.set('view', this.appController.createView);
  };

  AppRouter.prototype.shareRoute = function() {
    return this.appModel.set('view', this.appController.shareView);
  };

  AppRouter.prototype.kitSelectionRoute = function() {
    var models, view;
    models = [];
    _(4).times(function(index) {
      return models.push(new KitModel({
        label: "kit " + index
      }));
    });
    view = new KitSelection({
      appModel: this.appModel,
      kitCollection: new KitCollection(models, {
        appModel: this.appModel
      })
    });
    return this.appModel.set('view', view);
  };

  AppRouter.prototype.bpmIndicatorRoute = function() {
    var view;
    view = new BPMIndicator({
      appModel: this.appModel
    });
    view.render();
    return this.appModel.set('view', view);
  };

  return AppRouter;

})(Backbone.Router);

module.exports = AppRouter;


},{"../events/PubEvent.coffee":8,"../models/KitCollection.coffee":12,"../models/KitModel.coffee":13,"../utils/PubSub":16,"../views/create/components/BPMIndicator.coffee":18,"../views/create/components/KitSelection.coffee":19}],15:[function(require,module,exports){

/**
 * View superclass containing shared functionality
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   2.17.14
 */
var View;

View = Backbone.View.extend({
  initialize: function(options) {
    return _.extend(this, _.defaults(options = options || this.defaults, this.defaults || {}));
  },
  render: function(templateData) {
    templateData = templateData || {};
    if (this.template) {
      if (this.model instanceof Backbone.Model) {
        templateData = this.model.toJSON();
      }
      this.$el.html(this.template(templateData));
    }
    this.delegateEvents();
    this.addEventListeners();
    return this;
  },
  remove: function(options) {
    this.removeEventListeners();
    this.$el.remove();
    return this.undelegateEvents();
  },
  show: function(options) {
    return TweenMax.set(this.$el, {
      autoAlpha: 1
    });
  },
  hide: function(options) {
    return TweenMax.set(this.$el, {
      autoAlpha: 0,
      onComplete: (function(_this) {
        return function() {
          if (options != null ? options.remove : void 0) {
            return _this.remove();
          }
        };
      })(this)
    });
  },
  addEventListeners: function() {},
  removeEventListeners: function() {}
});

module.exports = View;


},{}],16:[function(require,module,exports){
/**
 * @module     PubSub
 * @desc       Global PubSub object for dispatch and delegation
 */

'use strict'

var PubSub = {}

_.extend( PubSub, Backbone.Events )

module.exports = PubSub
},{}],17:[function(require,module,exports){

/**
 * Create view which the user can build beats within
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var CreateView, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('../../supers/View.coffee');

template = require('./templates/create-template.hbs');

CreateView = (function(_super) {
  __extends(CreateView, _super);

  function CreateView() {
    return CreateView.__super__.constructor.apply(this, arguments);
  }

  CreateView.prototype.template = template;

  return CreateView;

})(View);

module.exports = CreateView;


},{"../../supers/View.coffee":15,"./templates/create-template.hbs":32}],18:[function(require,module,exports){

/**
 * Beats per minute view for handling tempo
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppConfig, AppEvent, BPMIndicator, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../../config/AppConfig.coffee');

AppEvent = require('../../../events/AppEvent.coffee');

View = require('../../../supers/View.coffee');

template = require('./templates/bpm-template.hbs');

BPMIndicator = (function(_super) {
  __extends(BPMIndicator, _super);

  function BPMIndicator() {
    this.onIncreaseBtnDown = __bind(this.onIncreaseBtnDown, this);
    return BPMIndicator.__super__.constructor.apply(this, arguments);
  }

  BPMIndicator.prototype.appModel = null;

  BPMIndicator.prototype.template = template;

  BPMIndicator.prototype.intervalUpdateTime = 70;

  BPMIndicator.prototype.updateInterval = null;

  BPMIndicator.prototype.bpmIncreaseAmount = 1;

  BPMIndicator.prototype.events = {
    'touchstart .btn-increase': 'onIncreaseBtnDown',
    'touchstart .btn-decrease': 'onDecreaseBtnDown',
    'touchend   .btn-increase': 'onBtnUp',
    'touchend   .btn-decrease': 'onBtnUp'
  };

  BPMIndicator.prototype.render = function(options) {
    BPMIndicator.__super__.render.call(this, options);
    this.$bpmLabel = this.$el.find('.label-bpm');
    this.increaseBtn = this.$el.find('.btn-increase');
    this.decreaseBtn = this.$el.find('.btn-decrease');
    this.$bpmLabel.text(this.appModel.get('bpm'));
    return this;
  };

  BPMIndicator.prototype.addEventListeners = function() {
    return this.listenTo(this.appModel, AppEvent.CHANGE_BPM, this.onBPMChange);
  };

  BPMIndicator.prototype.increaseBPM = function() {
    return this.updateInterval = setInterval((function(_this) {
      return function() {
        var bpm;
        bpm = _this.appModel.get('bpm');
        if (bpm < AppConfig.BPM_MAX) {
          bpm += _this.bpmIncreaseAmount;
        } else {
          bpm = AppConfig.BPM_MAX;
        }
        return _this.appModel.set('bpm', bpm);
      };
    })(this), this.intervalUpdateTime);
  };

  BPMIndicator.prototype.decreaseBPM = function() {
    return this.updateInterval = setInterval((function(_this) {
      return function() {
        var bpm;
        bpm = _this.appModel.get('bpm');
        if (bpm > 0) {
          bpm -= _this.bpmIncreaseAmount;
        } else {
          bpm = 0;
        }
        return _this.appModel.set('bpm', bpm);
      };
    })(this), this.intervalUpdateTime);
  };

  BPMIndicator.prototype.onIncreaseBtnDown = function(event) {
    return this.increaseBPM();
  };

  BPMIndicator.prototype.onDecreaseBtnDown = function(event) {
    return this.decreaseBPM();
  };

  BPMIndicator.prototype.onBtnUp = function(event) {
    clearInterval(this.updateInterval);
    return this.updateInterval = null;
  };

  BPMIndicator.prototype.onBPMChange = function(model) {
    return this.$bpmLabel.text(model.changed.bpm);
  };

  return BPMIndicator;

})(View);

module.exports = BPMIndicator;


},{"../../../config/AppConfig.coffee":6,"../../../events/AppEvent.coffee":7,"../../../supers/View.coffee":15,"./templates/bpm-template.hbs":30}],19:[function(require,module,exports){

/**
 * Kit selector for switching between drum-kit sounds
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent, KitSelection, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppEvent = require('../../../events/AppEvent.coffee');

View = require('../../../supers/View.coffee');

template = require('./templates/kit-selection-template.hbs');

KitSelection = (function(_super) {
  __extends(KitSelection, _super);

  function KitSelection() {
    return KitSelection.__super__.constructor.apply(this, arguments);
  }

  KitSelection.prototype.appModel = null;

  KitSelection.prototype.kitCollection = null;

  KitSelection.prototype.kitModel = null;

  KitSelection.prototype.template = template;

  KitSelection.prototype.events = {
    'touchend .btn-left': 'onLeftBtnClick',
    'touchend .btn-right': 'onRightBtnClick'
  };

  KitSelection.prototype.render = function(options) {
    KitSelection.__super__.render.call(this, options);
    this.$kitLabel = this.$el.find('.label-kit');
    if (this.appModel.get('kitModel') === null) {
      this.appModel.set('kitModel', this.kitCollection.at(0));
    }
    this.$kitLabel.text(this.appModel.get('kitModel').get('label'));
    return this;
  };

  KitSelection.prototype.addEventListeners = function() {
    return this.listenTo(this.appModel, AppEvent.CHANGE_KIT, this.onChangeKit);
  };

  KitSelection.prototype.onLeftBtnClick = function(event) {
    return this.appModel.set('kitModel', this.kitCollection.previousKit());
  };

  KitSelection.prototype.onRightBtnClick = function(event) {
    return this.appModel.set('kitModel', this.kitCollection.nextKit());
  };

  KitSelection.prototype.onChangeKit = function(model) {
    this.kitModel = model.changed.kitModel;
    return this.$kitLabel.text(this.kitModel.get('label'));
  };

  return KitSelection;

})(View);

module.exports = KitSelection;


},{"../../../events/AppEvent.coffee":7,"../../../supers/View.coffee":15,"./templates/kit-selection-template.hbs":31}],20:[function(require,module,exports){

/**
 * Sound type selector for choosing which sound should
 * play on each track
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var Instrument, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('../../../../supers/View.coffee');

template = require('./templates/instrument-template.hbs');

Instrument = (function(_super) {
  __extends(Instrument, _super);

  function Instrument() {
    return Instrument.__super__.constructor.apply(this, arguments);
  }

  Instrument.prototype.template = template;

  return Instrument;

})(View);

module.exports = Instrument;


},{"../../../../supers/View.coffee":15,"./templates/instrument-template.hbs":23}],21:[function(require,module,exports){

/**
 * Panel which houses each individual selectable sound
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var InstrumentSelectionPanel, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('../../../../supers/View.coffee');

template = require('./templates/instrument-panel-template.hbs');

InstrumentSelectionPanel = (function(_super) {
  __extends(InstrumentSelectionPanel, _super);

  function InstrumentSelectionPanel() {
    return InstrumentSelectionPanel.__super__.constructor.apply(this, arguments);
  }

  InstrumentSelectionPanel.prototype.template = template;

  return InstrumentSelectionPanel;

})(View);

module.exports = InstrumentSelectionPanel;


},{"../../../../supers/View.coffee":15,"./templates/instrument-panel-template.hbs":22}],22:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })
},{"handleify":4}],23:[function(require,module,exports){
module.exports=require(22)
},{"handleify":4}],24:[function(require,module,exports){

/**
 * Sequencer parent view for track sequences
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var Sequencer, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('../../../../supers/View.coffee');

template = require('./templates/sequencer-template.hbs');

Sequencer = (function(_super) {
  __extends(Sequencer, _super);

  function Sequencer() {
    return Sequencer.__super__.constructor.apply(this, arguments);
  }

  Sequencer.prototype.template = template;

  return Sequencer;

})(View);

module.exports = Sequencer;


},{"../../../../supers/View.coffee":15,"./templates/sequencer-template.hbs":27}],25:[function(require,module,exports){

/**
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var SequencerTrack, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('../../../../supers/View.coffee');

template = require('./templates/sequencer-track-template.hbs');

SequencerTrack = (function(_super) {
  __extends(SequencerTrack, _super);

  function SequencerTrack() {
    return SequencerTrack.__super__.constructor.apply(this, arguments);
  }

  SequencerTrack.prototype.template = template;

  return SequencerTrack;

})(View);

module.exports = SequencerTrack;


},{"../../../../supers/View.coffee":15,"./templates/sequencer-track-template.hbs":28}],26:[function(require,module,exports){

/**
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var SoundSquare, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('../../../../supers/View.coffee');

template = require('./templates/sound-square-template.hbs');

SoundSquare = (function(_super) {
  __extends(SoundSquare, _super);

  function SoundSquare() {
    return SoundSquare.__super__.constructor.apply(this, arguments);
  }

  SoundSquare.prototype.template = template;

  return SoundSquare;

})(View);

module.exports = SoundSquare;


},{"../../../../supers/View.coffee":15,"./templates/sound-square-template.hbs":29}],27:[function(require,module,exports){
module.exports=require(22)
},{"handleify":4}],28:[function(require,module,exports){
module.exports=require(22)
},{"handleify":4}],29:[function(require,module,exports){
module.exports=require(22)
},{"handleify":4}],30:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-decrease'>DECREASE</button>\n<span class='label-bpm'>0</span>\n<button class='btn-increase'>INCREASE</button>";
  })
},{"handleify":4}],31:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-left'>LEFT</button>\n<span class='label-kit'>DRUM KIT</span>\n<button class='btn-right'>RIGHT</button>";
  })
},{"handleify":4}],32:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<a href='#/share'>SHARE</a>";
  })
},{"handleify":4}],33:[function(require,module,exports){

/**
 * Landing view with start button and initial animation
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var LandingView, PubEvent, PubSub, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PubSub = require('../../utils/PubSub');

PubEvent = require('../../events/PubEvent.coffee');

View = require('../../supers/View.coffee');

template = require('./templates/landing-template.hbs');

LandingView = (function(_super) {
  __extends(LandingView, _super);

  function LandingView() {
    return LandingView.__super__.constructor.apply(this, arguments);
  }

  LandingView.prototype.template = template;

  LandingView.prototype.events = {
    'touchend .start-btn': 'onStartBtnClick'
  };

  LandingView.prototype.onStartBtnClick = function(event) {
    return PubSub.trigger(PubEvent.ROUTE, {
      route: 'create'
    });
  };

  return LandingView;

})(View);

module.exports = LandingView;


},{"../../events/PubEvent.coffee":8,"../../supers/View.coffee":15,"../../utils/PubSub":16,"./templates/landing-template.hbs":34}],34:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<span class='start-btn'>CREATE</span>";
  })
},{"handleify":4}],35:[function(require,module,exports){

/**
 * Share the user created beat
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var ShareView, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('../../supers/View.coffee');

template = require('./templates/share-template.hbs');

ShareView = (function(_super) {
  __extends(ShareView, _super);

  function ShareView() {
    return ShareView.__super__.constructor.apply(this, arguments);
  }

  ShareView.prototype.template = template;

  return ShareView;

})(View);

module.exports = ShareView;


},{"../../supers/View.coffee":15,"./templates/share-template.hbs":36}],36:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<a href='/#'>NEW</a>";
  })
},{"handleify":4}],37:[function(require,module,exports){
module.exports = {

  "config": {
    "assetPath": "/assets/audio"
  },

  "kits": [
    {
      "label": "Hip Hop",
      "folder": "hip-hop",
      "instruments": [
        {
          "label": "Closed HiHat",
          "src": "HAT_2.mp3",
          "icon": "icon-hihat-closed"
        },
        {
          "label": "Kick Drum",
          "src": "KIK_2.mp3",
          "icon": "icon-kickdrum"
        },
        {
          "label": "Open HiHat",
          "src": "OP_HAT_2.mp3",
          "icon": "icon-hihat-open"
        },
        {
          "label": "Ride",
          "src": "RIDE_CYM.mp3",
          "icon": "icon-ride"
        },
        {
          "label": "Snare",
          "src": "SN_2.mp3",
          "icon": "icon-snare"
        },
        {
          "label": "Tamborine",
          "src": "TAMB.mp3",
          "icon": "icon-tamborine"
        }
      ]
    },

    {
      "label": "Jazz",
      "folder": "jazz",
      "instruments": [
        {
          "label": "FX",
          "src": "FX_1.mp3",
          "icon": "icon-fx"
        },
        {
          "label": "Closed HiHat",
          "src": "HAT_1.mp3",
          "icon": "icon-hihat-closed"
        },
        {
          "label": "Kick Drum",
          "src": "KIK_1.mp3",
          "icon": "icon-kickdrum"
        },
        {
          "label": "Open HiHat",
          "src": "OP_HAT_1.mp3",
          "icon": "icon-hihat-open"
        },
        {
          "label": "Ride",
          "src": "RIDE_CYM.mp3",
          "icon": "icon-ride"
        },
        {
          "label": "Snare",
          "src": "SN_1.mp3",
          "icon": "icon-snare"
        }
      ]
    }
  ]
}
},{}],38:[function(require,module,exports){
require('./spec/views/landing/LandingView-spec.coffee');

require('./spec/views/create/components/KitSelection-spec.coffee');

require('./spec/views/create/components/BPMIndicator-spec.coffee');

require('./spec/views/create/components/instruments/InstrumentSelectionPanel-spec.coffee');

require('./spec/views/create/components/instruments/Instrument-spec.coffee');

return;

require('./spec/views/share/ShareView-spec.coffee');

require('./spec/views/create/CreateView-spec.coffee');

require('./spec/views/create/components/sequencer/Sequencer-spec.coffee');

require('./spec/views/create/components/sequencer/SequencerTrack-spec.coffee');

require('./spec/views/create/components/sequencer/SoundSquare-spec.coffee');

require('./spec/models/KitModel-spec.coffee');

require('./spec/models/SoundCollection-spec.coffee');

require('./spec/models/SoundModel-spec.coffee');

require('./spec/AppController-spec.coffee');


},{"./spec/AppController-spec.coffee":39,"./spec/models/KitModel-spec.coffee":40,"./spec/models/SoundCollection-spec.coffee":41,"./spec/models/SoundModel-spec.coffee":42,"./spec/views/create/CreateView-spec.coffee":43,"./spec/views/create/components/BPMIndicator-spec.coffee":44,"./spec/views/create/components/KitSelection-spec.coffee":45,"./spec/views/create/components/instruments/Instrument-spec.coffee":46,"./spec/views/create/components/instruments/InstrumentSelectionPanel-spec.coffee":47,"./spec/views/create/components/sequencer/Sequencer-spec.coffee":48,"./spec/views/create/components/sequencer/SequencerTrack-spec.coffee":49,"./spec/views/create/components/sequencer/SoundSquare-spec.coffee":50,"./spec/views/landing/LandingView-spec.coffee":51,"./spec/views/share/ShareView-spec.coffee":52}],39:[function(require,module,exports){
var AppController;

AppController = require('../../src/scripts/AppController.coffee');

describe('App Controller', function() {
  return it('Should initialize', (function(_this) {
    return function() {};
  })(this));
});


},{"../../src/scripts/AppController.coffee":5}],40:[function(require,module,exports){
describe('Kit Model', function() {
  return it('Should initialize with default config properties', (function(_this) {
    return function() {};
  })(this));
});


},{}],41:[function(require,module,exports){
describe('Sound Collection', function() {
  return it('Should initialize with a sound set', (function(_this) {
    return function() {};
  })(this));
});


},{}],42:[function(require,module,exports){
describe('Sound Model', function() {
  return it('Should initialize with default config properties', (function(_this) {
    return function() {};
  })(this));
});


},{}],43:[function(require,module,exports){
var CreateView;

CreateView = require('../../../../src/scripts/views/create/CreateView.coffee');

describe('Create View', function() {
  beforeEach((function(_this) {
    return function() {
      _this.view = new CreateView;
      return _this.view.render();
    };
  })(this));
  afterEach((function(_this) {
    return function() {
      return _this.view.remove();
    };
  })(this));
  return it('Should render', (function(_this) {
    return function() {
      return expect(_this.view.el).to.exist;
    };
  })(this));
});


},{"../../../../src/scripts/views/create/CreateView.coffee":17}],44:[function(require,module,exports){
var AppConfig, AppEvent, AppModel, BPMIndicator;

BPMIndicator = require('../../../../../src/scripts/views/create/components/BPMIndicator.coffee');

AppModel = require('../../../../../src/scripts/models/AppModel.coffee');

AppEvent = require('../../../../../src/scripts/events/AppEvent.coffee');

AppConfig = require('../../../../../src/scripts/config/AppConfig.coffee');

describe('BPM Indicator', function() {
  beforeEach((function(_this) {
    return function() {
      _this.view = new BPMIndicator({
        appModel: new AppModel()
      });
      return _this.view.render();
    };
  })(this));
  afterEach((function(_this) {
    return function() {
      if (_this.view.updateInterval) {
        clearInterval(_this.view.updateInterval);
      }
      return _this.view.remove();
    };
  })(this));
  it('Should render', (function(_this) {
    return function() {
      return _this.view.should.exist;
    };
  })(this));
  it('Should display the current BPM in the label', (function(_this) {
    return function() {
      var $label;
      $label = _this.view.$el.find('.label-bpm');
      return $label.text().should.equal(String(_this.view.appModel.get('bpm')));
    };
  })(this));
  it('Should auto-advance the bpm via setInterval on press', (function(_this) {
    return function(done) {
      var appModel;
      _this.view.bpmIncreaseAmount = 50;
      _this.view.intervalUpdateTime = 1;
      appModel = _this.view.appModel;
      appModel.set('bpm', 1);
      setTimeout(function() {
        var bpm;
        bpm = appModel.get('bpm');
        if (bpm >= 120) {
          _this.view.onBtnUp();
          return done();
        }
      }, 100);
      return _this.view.onIncreaseBtnDown();
    };
  })(this));
  return it('Should clear the interval on release', (function(_this) {
    return function() {
      _this.view.onIncreaseBtnDown();
      _this.view.updateInterval.should.exist;
      _this.view.onBtnUp();
      return expect(_this.view.updateInterval).to.be["null"];
    };
  })(this));
});


},{"../../../../../src/scripts/config/AppConfig.coffee":6,"../../../../../src/scripts/events/AppEvent.coffee":7,"../../../../../src/scripts/models/AppModel.coffee":9,"../../../../../src/scripts/views/create/components/BPMIndicator.coffee":18}],45:[function(require,module,exports){
var AppModel, KitCollection, KitModel, KitSelection;

KitSelection = require('../../../../../src/scripts/views/create/components/KitSelection.coffee');

AppModel = require('../../../../../src/scripts/models/AppModel.coffee');

KitModel = require('../../../../../src/scripts/models/KitModel.coffee');

KitCollection = require('../../../../../src/scripts/models/KitCollection.coffee');

describe('Kit Selection', function() {
  beforeEach((function(_this) {
    return function() {
      var models;
      models = [];
      _(4).times(function(index) {
        return models.push(new KitModel({
          label: "kit " + index
        }));
      });
      _this.view = new KitSelection({
        appModel: new AppModel(),
        kitCollection: new KitCollection(models)
      });
      return _this.view.render();
    };
  })(this));
  afterEach((function(_this) {
    return function() {
      return _this.view.remove();
    };
  })(this));
  it('Should render', (function(_this) {
    return function() {
      return _this.view.$el.should.exist;
    };
  })(this));
  it('Should have a label', (function(_this) {
    return function() {
      var $label;
      $label = _this.view.$el.find('.label-kit');
      $label.text(_this.view.kitCollection.at(0).get('label'));
      return $label.text().should.equal('kit 0');
    };
  })(this));
  return it('Should update the AppModel a kit is changed', (function(_this) {
    return function() {
      var $label, appModel, firstLabel, lastLabel;
      $label = _this.view.$el.find('.label-kit');
      firstLabel = _this.view.kitCollection.at(0).get('label');
      lastLabel = _this.view.kitCollection.at(_this.view.kitCollection.length - 1).get('label');
      appModel = _this.view.appModel;
      appModel.should.trigger('change:kitModel').when(function() {
        _this.view.onLeftBtnClick();
        return $label.text().should.equal(lastLabel);
      });
      return appModel.should.trigger('change:kitModel').when(function() {
        _this.view.onRightBtnClick();
        return $label.text().should.equal(firstLabel);
      });
    };
  })(this));
});


},{"../../../../../src/scripts/models/AppModel.coffee":9,"../../../../../src/scripts/models/KitCollection.coffee":12,"../../../../../src/scripts/models/KitModel.coffee":13,"../../../../../src/scripts/views/create/components/KitSelection.coffee":19}],46:[function(require,module,exports){
var Instrument;

Instrument = require('../../../../../../src/scripts/views/create/components/instruments/Instrument.coffee');

describe('Instrument', function() {
  beforeEach((function(_this) {
    return function() {
      return _this.view = new Instrument;
    };
  })(this));
  it('Should render', (function(_this) {
    return function() {};
  })(this));
  it('Should allow user to select and deselect instruments', (function(_this) {
    return function() {};
  })(this));
  it('Should dispatch an event indicating which sound has been selected', (function(_this) {
    return function() {};
  })(this));
  it('Should update the selected state if the user is interfacing with the sequence', (function(_this) {
    return function() {};
  })(this));
  return it('Should listen to the SequencerModel for updates', (function(_this) {
    return function() {};
  })(this));
});


},{"../../../../../../src/scripts/views/create/components/instruments/Instrument.coffee":20}],47:[function(require,module,exports){
var AppConfig, InstrumentSelectionPanel, KitCollection, soundData;

InstrumentSelectionPanel = require('../../../../../../src/scripts/views/create/components/instruments/InstrumentSelectionPanel.coffee');

AppConfig = require('../../../../../../src/scripts/config/AppConfig.coffee');

KitCollection = require('../../../../../../src/scripts/models/KitCollection.coffee');

soundData = require('../../../../../../test/fixtures/sound-data');

describe('Instrument Selection Panel', function() {
  beforeEach((function(_this) {
    return function() {
      _this.kitCollection = new KitCollection({
        parse: true
      });
      _this.kitCollection.fetch({
        url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'
      });
      _this.view = new InstrumentSelectionPanel;
      return _this.view.render();
    };
  })(this));
  afterEach((function(_this) {
    return function() {
      return _this.view.remove();
    };
  })(this));
  it('Should render', (function(_this) {
    return function() {
      return _this.view.should.exist;
    };
  })(this));
  it('Should refer to the current KitModel when instantiating sounds', (function(_this) {
    return function() {};
  })(this));
  it('Should iterate over all of the sounds in the SoundCollection to build out instruments', (function(_this) {
    return function() {};
  })(this));
  it('Should listen for selections from SoundType instances and update the model', (function(_this) {
    return function() {};
  })(this));
  it('Should allow user to select and deselect instruments', (function(_this) {
    return function() {};
  })(this));
  it('Should dispatch an event indicating which sound has been selected', (function(_this) {
    return function() {};
  })(this));
  return it('Should update the selected state if the user is interfacing with the sequence', (function(_this) {
    return function() {};
  })(this));
});


},{"../../../../../../src/scripts/config/AppConfig.coffee":6,"../../../../../../src/scripts/models/KitCollection.coffee":12,"../../../../../../src/scripts/views/create/components/instruments/InstrumentSelectionPanel.coffee":21,"../../../../../../test/fixtures/sound-data":37}],48:[function(require,module,exports){
var Sequencer;

Sequencer = require('../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee');


},{"../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee":24}],49:[function(require,module,exports){
var SequencerTrack;

SequencerTrack = require('../../../../../../src/scripts/views/create/components/sequencer/SequencerTrack.coffee');


},{"../../../../../../src/scripts/views/create/components/sequencer/SequencerTrack.coffee":25}],50:[function(require,module,exports){
var SoundSquare;

SoundSquare = require('../../../../../../src/scripts/views/create/components/sequencer/SoundSquare.coffee');


},{"../../../../../../src/scripts/views/create/components/sequencer/SoundSquare.coffee":26}],51:[function(require,module,exports){
var AppController, LandingView;

AppController = require('../../../../src/scripts/AppController.coffee');

LandingView = require('../../../../src/scripts/views/landing/LandingView.coffee');

describe('Landing View', function() {
  beforeEach((function(_this) {
    return function() {
      _this.view = new LandingView;
      return _this.view.render();
    };
  })(this));
  afterEach((function(_this) {
    return function() {
      _this.view.remove();
      if (_this.appController) {
        return _this.appController.remove();
      }
    };
  })(this));
  it('Should render', (function(_this) {
    return function() {
      return expect(_this.view.el).to.exist;
    };
  })(this));
  return it('Should redirect to create page on click', (function(_this) {
    return function(done) {
      var $startBtn, router;
      _this.appController = new AppController();
      router = _this.appController.appRouter;
      $startBtn = _this.view.$el.find('.start-btn');
      $startBtn.on('click', function(event) {
        'create'.should.route.to(router, 'createRoute');
        return done();
      });
      return $startBtn.click();
    };
  })(this));
});


},{"../../../../src/scripts/AppController.coffee":5,"../../../../src/scripts/views/landing/LandingView.coffee":33}],52:[function(require,module,exports){
var ShareView;

ShareView = require('../../../../src/scripts/views/share/ShareView.coffee');

describe('Share View', function() {
  beforeEach((function(_this) {
    return function() {
      _this.view = new ShareView;
      return _this.view.render();
    };
  })(this));
  afterEach((function(_this) {
    return function() {
      return _this.view.remove();
    };
  })(this));
  it('Should render', (function(_this) {
    return function() {
      return expect(_this.view.el).to.exist;
    };
  })(this));
  it('Should accept a SoundShare object', (function(_this) {
    return function() {};
  })(this));
  it('Should render the visualization layer', (function(_this) {
    return function() {};
  })(this));
  it('Should pause playback of the audio track on init', (function(_this) {
    return function() {};
  })(this));
  it('Should toggle the play / pause button', (function(_this) {
    return function() {};
  })(this));
  return it('Should display the users song title and username', (function(_this) {
    return function() {};
  })(this));
});


},{"../../../../src/scripts/views/share/ShareView.coffee":35}]},{},[38])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9iYXNlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy91dGlscy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvcnVudGltZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL0FwcENvbnRyb2xsZXIuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9ldmVudHMvQXBwRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvS2l0TW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvcm91dGVycy9BcHBSb3V0ZXIuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvc3VwZXJzL1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdXRpbHMvUHViU3ViLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3Rpb25QYW5lbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy90ZW1wbGF0ZXMvaW5zdHJ1bWVudC1wYW5lbC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXJUcmFjay5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU291bmRTcXVhcmUuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvdGVtcGxhdGVzL2JwbS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy90ZW1wbGF0ZXMva2l0LXNlbGVjdGlvbi10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvdGVtcGxhdGVzL2NyZWF0ZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvdGVtcGxhdGVzL2xhbmRpbmctdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL3RlbXBsYXRlcy9zaGFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L2ZpeHR1cmVzL3NvdW5kLWRhdGEuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMtcnVubmVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9BcHBDb250cm9sbGVyLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9LaXRNb2RlbC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9tb2RlbHMvU291bmRDb2xsZWN0aW9uLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9Tb3VuZE1vZGVsLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rpb24tc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0aW9uUGFuZWwtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyVHJhY2stc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NvdW5kU3F1YXJlLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7O0FDRkE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsc0VBQUE7RUFBQTtpU0FBQTs7QUFBQSxRQVFBLEdBQWMsT0FBQSxDQUFRLDBCQUFSLENBUmQsQ0FBQTs7QUFBQSxTQVNBLEdBQWMsT0FBQSxDQUFRLDRCQUFSLENBVGQsQ0FBQTs7QUFBQSxXQVVBLEdBQWMsT0FBQSxDQUFRLG9DQUFSLENBVmQsQ0FBQTs7QUFBQSxVQVdBLEdBQWMsT0FBQSxDQUFRLGtDQUFSLENBWGQsQ0FBQTs7QUFBQSxTQVlBLEdBQWMsT0FBQSxDQUFRLGdDQUFSLENBWmQsQ0FBQTs7QUFBQTtBQWtCRyxrQ0FBQSxDQUFBOzs7O0dBQUE7O0FBQUEs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Q0FBQyxFQUFFLENBQUMsTUFESDtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBVEEsQ0FBQTtBQUFBLEVBYUEsRUFBQSxDQUFHLG1DQUFILEVBQXdDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEMsQ0FiQSxDQUFBO0FBQUEsRUFnQkEsRUFBQSxDQUFHLHVDQUFILEVBQTRDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUMsQ0FoQkEsQ0FBQTtBQUFBLEVBbUJBLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZELENBbkJBLENBQUE7QUFBQSxFQXNCQSxFQUFBLENBQUcsdUNBQUgsRUFBNEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QyxDQXRCQSxDQUFBO1NBeUJBLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZELEVBM0JvQjtBQUFBLENBQXZCLENBSEEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypqc2hpbnQgZXFudWxsOiB0cnVlICovXG5cbm1vZHVsZS5leHBvcnRzLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuXG52YXIgSGFuZGxlYmFycyA9IHt9O1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZFUlNJT04gPSBcIjEuMC4wXCI7XG5IYW5kbGViYXJzLkNPTVBJTEVSX1JFVklTSU9OID0gNDtcblxuSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz49IDEuMC4wJ1xufTtcblxuSGFuZGxlYmFycy5oZWxwZXJzICA9IHt9O1xuSGFuZGxlYmFycy5wYXJ0aWFscyA9IHt9O1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgIGZ1bmN0aW9uVHlwZSA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24obmFtZSwgZm4sIGludmVyc2UpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBpZiAoaW52ZXJzZSB8fCBmbikgeyB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgaGVscGVycycpOyB9XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaW52ZXJzZSkgeyBmbi5ub3QgPSBpbnZlcnNlOyB9XG4gICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsID0gZnVuY3Rpb24obmFtZSwgc3RyKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBzdHI7XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihhcmcpIHtcbiAgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBoZWxwZXI6ICdcIiArIGFyZyArIFwiJ1wiKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UgfHwgZnVuY3Rpb24oKSB7fSwgZm4gPSBvcHRpb25zLmZuO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcblxuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKGNvbnRleHQgPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm4odGhpcyk7XG4gIH0gZWxzZSBpZihjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgIGlmKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIEhhbmRsZWJhcnMuaGVscGVycy5lYWNoKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZuKGNvbnRleHQpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5LID0gZnVuY3Rpb24oKSB7fTtcblxuSGFuZGxlYmFycy5jcmVhdGVGcmFtZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24ob2JqZWN0KSB7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBvYmplY3Q7XG4gIHZhciBvYmogPSBuZXcgSGFuZGxlYmFycy5LKCk7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBudWxsO1xuICByZXR1cm4gb2JqO1xufTtcblxuSGFuZGxlYmFycy5sb2dnZXIgPSB7XG4gIERFQlVHOiAwLCBJTkZPOiAxLCBXQVJOOiAyLCBFUlJPUjogMywgbGV2ZWw6IDMsXG5cbiAgbWV0aG9kTWFwOiB7MDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcid9LFxuXG4gIC8vIGNhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24obGV2ZWwsIG9iaikge1xuICAgIGlmIChIYW5kbGViYXJzLmxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IEhhbmRsZWJhcnMubG9nZ2VyLm1ldGhvZE1hcFtsZXZlbF07XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGVbbWV0aG9kXSkge1xuICAgICAgICBjb25zb2xlW21ldGhvZF0uY2FsbChjb25zb2xlLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy5sb2cgPSBmdW5jdGlvbihsZXZlbCwgb2JqKSB7IEhhbmRsZWJhcnMubG9nZ2VyLmxvZyhsZXZlbCwgb2JqKTsgfTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGZuID0gb3B0aW9ucy5mbiwgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZTtcbiAgdmFyIGkgPSAwLCByZXQgPSBcIlwiLCBkYXRhO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgZGF0YSA9IEhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgfVxuXG4gIGlmKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgaWYoY29udGV4dCBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgIGZvcih2YXIgaiA9IGNvbnRleHQubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgICBpZiAoZGF0YSkgeyBkYXRhLmluZGV4ID0gaTsgfVxuICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ldLCB7IGRhdGE6IGRhdGEgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvcih2YXIga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgaWYoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgaWYoZGF0YSkgeyBkYXRhLmtleSA9IGtleTsgfVxuICAgICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRba2V5XSwge2RhdGE6IGRhdGF9KTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZihpID09PSAwKXtcbiAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb25kaXRpb25hbCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICBpZighY29uZGl0aW9uYWwgfHwgSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd1bmxlc3MnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHtmbjogb3B0aW9ucy5pbnZlcnNlLCBpbnZlcnNlOiBvcHRpb25zLmZufSk7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmICghSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbnRleHQpKSByZXR1cm4gb3B0aW9ucy5mbihjb250ZXh0KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgSGFuZGxlYmFycy5sb2cobGV2ZWwsIGNvbnRleHQpO1xufSk7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxuLy8gQkVHSU4oQlJPV1NFUilcblxuSGFuZGxlYmFycy5WTSA9IHtcbiAgdGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlU3BlYykge1xuICAgIC8vIEp1c3QgYWRkIHdhdGVyXG4gICAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICAgIGVzY2FwZUV4cHJlc3Npb246IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICAgIGludm9rZVBhcnRpYWw6IEhhbmRsZWJhcnMuVk0uaW52b2tlUGFydGlhbCxcbiAgICAgIHByb2dyYW1zOiBbXSxcbiAgICAgIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV07XG4gICAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbShpLCBmbiwgZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgICB9LFxuICAgICAgbWVyZ2U6IGZ1bmN0aW9uKHBhcmFtLCBjb21tb24pIHtcbiAgICAgICAgdmFyIHJldCA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgICBpZiAocGFyYW0gJiYgY29tbW9uKSB7XG4gICAgICAgICAgcmV0ID0ge307XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBjb21tb24pO1xuICAgICAgICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHJldCwgcGFyYW0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9LFxuICAgICAgcHJvZ3JhbVdpdGhEZXB0aDogSGFuZGxlYmFycy5WTS5wcm9ncmFtV2l0aERlcHRoLFxuICAgICAgbm9vcDogSGFuZGxlYmFycy5WTS5ub29wLFxuICAgICAgY29tcGlsZXJJbmZvOiBudWxsXG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIHZhciByZXN1bHQgPSB0ZW1wbGF0ZVNwZWMuY2FsbChjb250YWluZXIsIEhhbmRsZWJhcnMsIGNvbnRleHQsIG9wdGlvbnMuaGVscGVycywgb3B0aW9ucy5wYXJ0aWFscywgb3B0aW9ucy5kYXRhKTtcblxuICAgICAgdmFyIGNvbXBpbGVySW5mbyA9IGNvbnRhaW5lci5jb21waWxlckluZm8gfHwgW10sXG4gICAgICAgICAgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IEhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgICAgIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICAgICAgdGhyb3cgXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBwcmVjb21waWxlciB0byBhIG5ld2VyIHZlcnNpb24gKFwiK3J1bnRpbWVWZXJzaW9ucytcIikgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uIChcIitjb21waWxlclZlcnNpb25zK1wiKS5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGEgbmV3ZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gXCIrXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKFwiK2NvbXBpbGVySW5mb1sxXStcIikuXCI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9LFxuXG4gIHByb2dyYW1XaXRoRGVwdGg6IGZ1bmN0aW9uKGksIGZuLCBkYXRhIC8qLCAkZGVwdGggKi8pIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMyk7XG5cbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgW2NvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhXS5jb25jYXQoYXJncykpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gYXJncy5sZW5ndGg7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgdmFyIHByb2dyYW0gPSBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhKTtcbiAgICB9O1xuICAgIHByb2dyYW0ucHJvZ3JhbSA9IGk7XG4gICAgcHJvZ3JhbS5kZXB0aCA9IDA7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIG5vb3A6IGZ1bmN0aW9uKCkgeyByZXR1cm4gXCJcIjsgfSxcbiAgaW52b2tlUGFydGlhbDogZnVuY3Rpb24ocGFydGlhbCwgbmFtZSwgY29udGV4dCwgaGVscGVycywgcGFydGlhbHMsIGRhdGEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHsgaGVscGVyczogaGVscGVycywgcGFydGlhbHM6IHBhcnRpYWxzLCBkYXRhOiBkYXRhIH07XG5cbiAgICBpZihwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBmb3VuZFwiKTtcbiAgICB9IGVsc2UgaWYocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKCFIYW5kbGViYXJzLmNvbXBpbGUpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRpYWxzW25hbWVdID0gSGFuZGxlYmFycy5jb21waWxlKHBhcnRpYWwsIHtkYXRhOiBkYXRhICE9PSB1bmRlZmluZWR9KTtcbiAgICAgIHJldHVybiBwYXJ0aWFsc1tuYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMudGVtcGxhdGUgPSBIYW5kbGViYXJzLlZNLnRlbXBsYXRlO1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG5cbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gQkVHSU4oQlJPV1NFUilcblxudmFyIGVycm9yUHJvcHMgPSBbJ2Rlc2NyaXB0aW9uJywgJ2ZpbGVOYW1lJywgJ2xpbmVOdW1iZXInLCAnbWVzc2FnZScsICduYW1lJywgJ251bWJlcicsICdzdGFjayddO1xuXG5IYW5kbGViYXJzLkV4Y2VwdGlvbiA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgdmFyIHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxufTtcbkhhbmRsZWJhcnMuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuSGFuZGxlYmFycy5TYWZlU3RyaW5nID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufTtcbkhhbmRsZWJhcnMuU2FmZVN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RyaW5nLnRvU3RyaW5nKCk7XG59O1xuXG52YXIgZXNjYXBlID0ge1xuICBcIiZcIjogXCImYW1wO1wiLFxuICBcIjxcIjogXCImbHQ7XCIsXG4gIFwiPlwiOiBcIiZndDtcIixcbiAgJ1wiJzogXCImcXVvdDtcIixcbiAgXCInXCI6IFwiJiN4Mjc7XCIsXG4gIFwiYFwiOiBcIiYjeDYwO1wiXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2c7XG52YXIgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxudmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdIHx8IFwiJmFtcDtcIjtcbn07XG5cbkhhbmRsZWJhcnMuVXRpbHMgPSB7XG4gIGV4dGVuZDogZnVuY3Rpb24ob2JqLCB2YWx1ZSkge1xuICAgIGZvcih2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgICBpZih2YWx1ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdmFsdWVba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZXNjYXBlRXhwcmVzc2lvbjogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgaW5zdGFuY2VvZiBIYW5kbGViYXJzLlNhZmVTdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcudG9TdHJpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsIHx8IHN0cmluZyA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAgIC8vIHRoZSByZWdleCB0ZXN0IHdpbGwgZG8gdGhpcyB0cmFuc3BhcmVudGx5IGJlaGluZCB0aGUgc2NlbmVzLCBjYXVzaW5nIGlzc3VlcyBpZlxuICAgIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICAgIHN0cmluZyA9IHN0cmluZy50b1N0cmluZygpO1xuXG4gICAgaWYoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbiAgfSxcblxuICBpc0VtcHR5OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZih0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSByZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMnKS5jcmVhdGUoKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy91dGlscy5qcycpLmF0dGFjaChleHBvcnRzKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzJykuYXR0YWNoKGV4cG9ydHMpIiwiIyMjKlxuICogUHJpbWFyeSBhcHBsaWNhdGlvbiBjb250cm9sbGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5BcHBNb2RlbCAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbkFwcFJvdXRlciAgID0gcmVxdWlyZSAnLi9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUnXG5MYW5kaW5nVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUnXG5DcmVhdGVWaWV3ICA9IHJlcXVpcmUgJy4vdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlJ1xuU2hhcmVWaWV3ICAgPSByZXF1aXJlICcuL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwQ29udHJvbGxlciBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuXG4gICBjbGFzc05hbWU6ICd3cmFwcGVyJ1xuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcblxuICAgICAgQGxhbmRpbmdWaWV3ID0gbmV3IExhbmRpbmdWaWV3XG4gICAgICBAc2hhcmVWaWV3ICAgPSBuZXcgU2hhcmVWaWV3XG4gICAgICBAY3JlYXRlVmlldyAgPSBuZXcgQ3JlYXRlVmlld1xuXG4gICAgICBAYXBwUm91dGVyID0gbmV3IEFwcFJvdXRlclxuICAgICAgICAgYXBwQ29udHJvbGxlcjogQFxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIEFwcENvbnRyb2xsZXIgdG8gdGhlIERPTSBhbmQga2lja3NcbiAgICMgb2ZmIGJhY2tib25lcyBoaXN0b3J5XG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIEAkYm9keSA9ICQgJ2JvZHknXG4gICAgICBAJGJvZHkuYXBwZW5kIEBlbFxuXG4gICAgICBCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0XG4gICAgICAgICBwdXNoU3RhdGU6IGZhbHNlXG5cblxuXG4gICAjIERlc3Ryb3lzIGFsbCBjdXJyZW50IGFuZCBwcmUtcmVuZGVyZWQgdmlld3MgYW5kXG4gICAjIHVuZGVsZWdhdGVzIGV2ZW50IGxpc3RlbmVyc1xuXG4gICByZW1vdmU6IC0+XG4gICAgICBAbGFuZGluZ1ZpZXcucmVtb3ZlKClcbiAgICAgIEBzaGFyZVZpZXcucmVtb3ZlKClcbiAgICAgIEBjcmVhdGVWaWV3LnJlbW92ZSgpXG5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG5cblxuXG5cbiAgICMgQWRkcyBBcHBDb250cm9sbGVyLXJlbGF0ZWQgZXZlbnQgbGlzdGVuZXJzIGFuZCBiZWdpbnNcbiAgICMgbGlzdGVuaW5nIHRvIHZpZXcgY2hhbmdlc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsICdjaGFuZ2U6dmlldycsIEBvblZpZXdDaGFuZ2VcblxuXG5cblxuICAgIyBSZW1vdmVzIEFwcENvbnRyb2xsZXItcmVsYXRlZCBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAc3RvcExpc3RlbmluZygpXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3Igc2hvd2luZyAvIGhpZGluZyAvIGRpc3Bvc2luZyBvZiBwcmltYXJ5IHZpZXdzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uVmlld0NoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgcHJldmlvdXNWaWV3ID0gbW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy52aWV3XG4gICAgICBjdXJyZW50VmlldyAgPSBtb2RlbC5jaGFuZ2VkLnZpZXdcblxuICAgICAgaWYgcHJldmlvdXNWaWV3IHRoZW4gcHJldmlvdXNWaWV3LmhpZGVcbiAgICAgICAgIHJlbW92ZTogdHJ1ZVxuXG5cbiAgICAgIEAkZWwuYXBwZW5kIGN1cnJlbnRWaWV3LnJlbmRlcigpLmVsXG5cbiAgICAgIGN1cnJlbnRWaWV3LnNob3coKVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcENvbnRyb2xsZXIiLCIjIyMqXG4gIEFwcGxpY2F0aW9uLXdpZGUgZ2VuZXJhbCBjb25maWd1cmF0aW9uc1xuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE5LjE0XG4jIyNcblxuXG5BcHBDb25maWcgPVxuXG5cbiAgICMgVGhlIHBhdGggdG8gYXBwbGljYXRpb24gYXNzZXRzXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIEFTU0VUUzpcbiAgICAgIHBhdGg6ICAgJy9hc3NldHMnXG4gICAgICBhdWRpbzogICdhdWRpbydcbiAgICAgIGRhdGE6ICAgJ2RhdGEnXG4gICAgICBpbWFnZXM6ICdpbWFnZXMnXG5cblxuICAgIyBUaGUgQlBNIHRlbXBvXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIEJQTTogMTIwXG5cblxuICAgIyBUaGUgbWF4IEJQTVxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBCUE1fTUFYOiAzMDBcblxuXG4gICAjIFJldHVybnMgYSBub3JtYWxpemVkIGFzc2V0IHBhdGggZm9yIGFwcGxpY2F0aW9uIGFzc2V0c1xuICAgIyBAcGFyYW0ge1N0cmluZ30gYXNzZXRUeXBlXG5cbiAgIHJldHVybkFzc2V0UGF0aDogKGFzc2V0VHlwZSkgLT5cbiAgICAgIEBBU1NFVFMucGF0aCArICcvJyArIEBBU1NFVFNbYXNzZXRUeXBlXVxuXG5cbiAgICMgUmV0dXJucyBhIG5vcm1hbGl6ZWQgYXNzZXQgcGF0aCBmb3IgdGhlIFRFU1QgZW52aXJvbm1lbnRcbiAgICMgQHBhcmFtIHtTdHJpbmd9IGFzc2V0VHlwZVxuXG4gICByZXR1cm5UZXN0QXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgICAgJy90ZXN0L2h0bWwvJyArIEBBU1NFVFMucGF0aCArICcvJyArIEBBU1NFVFNbYXNzZXRUeXBlXVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb25maWdcblxuIiwiIyMjKlxuICogQXBwbGljYXRpb24gcmVsYXRlZCBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cbkFwcEV2ZW50ID1cblxuICAgQ0hBTkdFX0tJVDogJ2NoYW5nZTpraXRNb2RlbCdcbiAgIENIQU5HRV9CUE06ICdjaGFuZ2U6YnBtJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwRXZlbnQiLCIjIyMqXG4gKiBHbG9iYWwgUHViU3ViIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblxuUHViU3ViID1cblxuICAgUk9VVEU6ICdvblJvdXRlQ2hhbmdlJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUHViU3ViIiwiIyMjKlxuICBQcmltYXJ5IGFwcGxpY2F0aW9uIG1vZGVsIHdoaWNoIGNvb3JkaW5hdGVzIHN0YXRlXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblxuXG5BcHBSb3V0ZXIgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmRcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICd2aWV3JzogICAgICAgIG51bGxcbiAgICAgICdraXRNb2RlbCc6ICAgIG51bGxcblxuICAgICAgIyBTZXR0aW5nc1xuICAgICAgJ2JwbSc6ICAgICAgICAgQXBwQ29uZmlnLkJQTVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwUm91dGVyIiwiIyMjKlxuICogQ29sbGVjdGlvbiByZXByZXNlbnRpbmcgZWFjaCBzb3VuZCBmcm9tIGEga2l0IHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4vSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBJbnN0cnVtZW50Q29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuXG4gICBtb2RlbDogSW5zdHJ1bWVudE1vZGVsXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50Q29sbGVjdGlvbiIsIiMjIypcbiAqIFNvdW5kIG1vZGVsIGZvciBlYWNoIGluZGl2aWR1YWwga2l0IHNvdW5kIHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbmNsYXNzIEluc3RydW1lbnRNb2RlbCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICBpY29uOiAgICBudWxsXG4gICAgICBsYWJlbDogICBudWxsXG4gICAgICBzcmM6ICAgICBudWxsXG5cblxuICAgcGFyc2U6IChyZXNwb25zZSkgLT5cbiAgICAgIHJlc3BvbnNlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50TW9kZWwiLCIjIyMqXG4gKiBDb2xsZWN0aW9uIG9mIHNvdW5kIGtpdHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdE1vZGVsICA9IHJlcXVpcmUgJy4vS2l0TW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIEtpdENvbGxlY3Rpb24gZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cblxuICAgIyBVcmwgdG8gZGF0YSBmb3IgZmV0Y2hcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdXJsOiBcIiN7QXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpfS9zb3VuZC1kYXRhLmpzb25cIlxuXG5cbiAgICMgSW5kaXZpZHVhbCBkcnVta2l0IGF1ZGlvIHNldHNcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBtb2RlbDogS2l0TW9kZWxcblxuXG4gICAjIFRoZSBjdXJyZW50IHVzZXItc2VsZWN0ZWQga2l0XG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGtpdElkOiAwXG5cblxuXG4gICBwYXJzZTogKHJlc3BvbnNlKSAtPlxuICAgICAgYXNzZXRQYXRoID0gcmVzcG9uc2UuY29uZmlnLmFzc2V0UGF0aFxuICAgICAga2l0cyA9IHJlc3BvbnNlLmtpdHNcblxuICAgICAga2l0cyA9IF8ubWFwIGtpdHMsIChraXQpIC0+XG4gICAgICAgICBraXQucGF0aCA9IGFzc2V0UGF0aCArICcvJyArIGtpdC5mb2xkZXJcbiAgICAgICAgIHJldHVybiBraXRcblxuICAgICAgcmV0dXJuIGtpdHNcblxuXG5cblxuICAgIyBDeWNsZXMgdGhlIGN1cnJlbnQgZHJ1bSBraXQgYmFja1xuICAgIyBAcmV0dXJuIHtLaXRNb2RlbH1cblxuICAgcHJldmlvdXNLaXQ6IC0+XG4gICAgICBsZW4gPSBAbGVuZ3RoXG5cbiAgICAgIGlmIEBraXRJZCA+IDBcbiAgICAgICAgIEBraXRJZC0tXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIEBraXRJZCA9IGxlbiAtIDFcblxuICAgICAga2l0TW9kZWwgPSBAYXQgQGtpdElkXG5cblxuXG5cbiAgICMgQ3ljbGVzIHRoZSBjdXJyZW50IGRydW0ga2l0IGZvcndhcmRcbiAgICMgQHJldHVybiB7S2l0TW9kZWx9XG5cbiAgIG5leHRLaXQ6IC0+XG4gICAgICBsZW4gPSBAbGVuZ3RoIC0gMVxuXG4gICAgICBpZiBAa2l0SWQgPCBsZW5cbiAgICAgICAgIEBraXRJZCsrXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIEBraXRJZCA9IDBcblxuICAgICAga2l0TW9kZWwgPSBAYXQgQGtpdElkXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdENvbGxlY3Rpb24iLCIjIyMqXG4gKiBLaXQgbW9kZWwgZm9yIGhhbmRsaW5nIHN0YXRlIHJlbGF0ZWQgdG8ga2l0IHNlbGVjdGlvblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkluc3RydW1lbnRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuY2xhc3MgS2l0TW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ2xhYmVsJzogICAgbnVsbFxuICAgICAgJ3BhdGgnOiAgICAgbnVsbFxuICAgICAgJ2ZvbGRlcic6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cbiAgICAgICdzb3VuZHMnOiAgIG51bGxcblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHRoaXMucGFyc2UgPSB0cnVlXG5cblxuICAgcGFyc2U6IChyZXNwb25zZSkgLT5cbiAgICAgIF8uZWFjaCByZXNwb25zZS5pbnN0cnVtZW50cywgKGluc3RydW1lbnQpIC0+XG4gICAgICAgICBpbnN0cnVtZW50LnNyYyA9IHJlc3BvbnNlLnBhdGggKyAnLycgKyBpbnN0cnVtZW50LnNyY1xuXG4gICAgICByZXNwb25zZS5pbnN0cnVtZW50cyA9IG5ldyBJbnN0cnVtZW50Q29sbGVjdGlvbiByZXNwb25zZS5pbnN0cnVtZW50c1xuXG4gICAgICByZXNwb25zZVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdE1vZGVsIiwiIyMjKlxuICogTVBDIEFwcGxpY2F0aW9uIHJvdXRlclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblB1YlN1YiAgID0gcmVxdWlyZSAnLi4vdXRpbHMvUHViU3ViJ1xuUHViRXZlbnQgPSByZXF1aXJlICcuLi9ldmVudHMvUHViRXZlbnQuY29mZmVlJ1xuXG4jIFRPRE86IFRoZSBiZWxvdyBpdGVtcyBhcmUgb25seSBpbmNsdWRlZCBmb3IgdGVzdGluZyBjb21wb25lbnRcbiMgbW9kdWxhcml0eS4gIFRoZXksIGFuZCB0aGVpciByb3V0ZXMsIHNob3VsZCBiZSByZW1vdmVkIGluIHByb2R1Y3Rpb25cblxuS2l0U2VsZWN0aW9uICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdGlvbi5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vbW9kZWxzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuS2l0TW9kZWwgICAgICA9IHJlcXVpcmUgJy4uL21vZGVscy9LaXRNb2RlbC5jb2ZmZWUnXG5cbkJQTUluZGljYXRvciAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcFJvdXRlciBleHRlbmRzIEJhY2tib25lLlJvdXRlclxuXG5cbiAgIHJvdXRlczpcbiAgICAgICcnOiAgICAgICAgICAgICAnbGFuZGluZ1JvdXRlJ1xuICAgICAgJ2NyZWF0ZSc6ICAgICAgICdjcmVhdGVSb3V0ZSdcbiAgICAgICdzaGFyZSc6ICAgICAgICAnc2hhcmVSb3V0ZSdcblxuICAgICAgIyBDb21wb25lbnQgdGVzdCByb3V0ZXNcbiAgICAgICdraXQtc2VsZWN0aW9uJzogJ2tpdFNlbGVjdGlvblJvdXRlJ1xuICAgICAgJ2JwbS1pbmRpY2F0b3InOiAnYnBtSW5kaWNhdG9yUm91dGUnXG5cblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHtAYXBwQ29udHJvbGxlciwgQGFwcE1vZGVsfSA9IG9wdGlvbnNcblxuICAgICAgUHViU3ViLm9uIFB1YkV2ZW50LlJPVVRFLCBAb25Sb3V0ZUNoYW5nZVxuXG5cblxuICAgb25Sb3V0ZUNoYW5nZTogKHBhcmFtcykgPT5cbiAgICAgIHtyb3V0ZX0gPSBwYXJhbXNcblxuICAgICAgQG5hdmlnYXRlIHJvdXRlLCB7IHRyaWdnZXI6IHRydWUgfVxuXG5cblxuICAgbGFuZGluZ1JvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLmxhbmRpbmdWaWV3XG5cblxuXG4gICBjcmVhdGVSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBAYXBwQ29udHJvbGxlci5jcmVhdGVWaWV3XG5cblxuXG4gICBzaGFyZVJvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLnNoYXJlVmlld1xuXG5cblxuXG5cblxuICAgIyBDT01QT05FTlQgVEVTVCBST1VURVNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICBraXRTZWxlY3Rpb25Sb3V0ZTogLT5cbiAgICAgIG1vZGVscyA9IFtdXG5cbiAgICAgIF8oNCkudGltZXMgKGluZGV4KSAtPlxuICAgICAgICAgbW9kZWxzLnB1c2ggbmV3IEtpdE1vZGVsIHtsYWJlbDogXCJraXQgI3tpbmRleH1cIn1cblxuICAgICAgdmlldyA9IG5ldyBLaXRTZWxlY3Rpb25cbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IG5ldyBLaXRDb2xsZWN0aW9uIG1vZGVscywge1xuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgfVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBicG1JbmRpY2F0b3JSb3V0ZTogLT5cbiAgICAgIHZpZXcgPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIHZpZXcucmVuZGVyKClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwUm91dGVyIiwiIyMjKlxuICogVmlldyBzdXBlcmNsYXNzIGNvbnRhaW5pbmcgc2hhcmVkIGZ1bmN0aW9uYWxpdHlcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDIuMTcuMTRcbiMjI1xuXG5cblZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZFxuXG5cblxuICAgIyBJbml0aWFsaXplcyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIF8uZXh0ZW5kIEAsIF8uZGVmYXVsdHMoIG9wdGlvbnMgPSBvcHRpb25zIHx8IEBkZWZhdWx0cywgQGRlZmF1bHRzIHx8IHt9IClcblxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgd2l0aCBzdXBwbGllZCB0ZW1wbGF0ZSBkYXRhLCBvciBjaGVja3MgaWYgdGVtcGxhdGUgaXMgb25cbiAgICMgb2JqZWN0IGJvZHlcbiAgICMgQHBhcmFtICB7RnVuY3Rpb258TW9kZWx9IHRlbXBsYXRlRGF0YVxuICAgIyBAcmV0dXJuIHtWaWV3fVxuXG4gICByZW5kZXI6ICh0ZW1wbGF0ZURhdGEpIC0+XG4gICAgICB0ZW1wbGF0ZURhdGEgPSB0ZW1wbGF0ZURhdGEgfHwge31cblxuICAgICAgaWYgQHRlbXBsYXRlXG5cbiAgICAgICAgICMgSWYgbW9kZWwgaXMgYW4gaW5zdGFuY2Ugb2YgYSBiYWNrYm9uZSBtb2RlbCwgdGhlbiBKU09OaWZ5IGl0XG4gICAgICAgICBpZiBAbW9kZWwgaW5zdGFuY2VvZiBCYWNrYm9uZS5Nb2RlbFxuICAgICAgICAgICAgdGVtcGxhdGVEYXRhID0gQG1vZGVsLnRvSlNPTigpXG5cbiAgICAgICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUgKHRlbXBsYXRlRGF0YSlcblxuICAgICAgQGRlbGVnYXRlRXZlbnRzKClcbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW1vdmVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbW92ZTogKG9wdGlvbnMpIC0+XG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuICAgICAgQCRlbC5yZW1vdmUoKVxuICAgICAgQHVuZGVsZWdhdGVFdmVudHMoKVxuXG5cblxuXG5cbiAgICMgU2hvd3MgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgc2hvdzogKG9wdGlvbnMpIC0+XG4gICAgICBUd2Vlbk1heC5zZXQgQCRlbCwgeyBhdXRvQWxwaGE6IDEgfVxuXG5cblxuXG4gICAjIEhpZGVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGhpZGU6IChvcHRpb25zKSAtPlxuICAgICAgVHdlZW5NYXguc2V0IEAkZWwsXG4gICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICBpZiBvcHRpb25zPy5yZW1vdmVcbiAgICAgICAgICAgICAgIEByZW1vdmUoKVxuXG5cblxuXG4gICAjIE5vb3Agd2hpY2ggaXMgY2FsbGVkIG9uIHJlbmRlclxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cblxuXG5cbiAgICMgTm9vcCB3aGljaCBpcyBjYWxsZWQgb24gcmVtb3ZlXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3IiwiLyoqXG4gKiBAbW9kdWxlICAgICBQdWJTdWJcbiAqIEBkZXNjICAgICAgIEdsb2JhbCBQdWJTdWIgb2JqZWN0IGZvciBkaXNwYXRjaCBhbmQgZGVsZWdhdGlvblxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG52YXIgUHViU3ViID0ge31cblxuXy5leHRlbmQoIFB1YlN1YiwgQmFja2JvbmUuRXZlbnRzIClcblxubW9kdWxlLmV4cG9ydHMgPSBQdWJTdWIiLCIjIyMqXG4gKiBDcmVhdGUgdmlldyB3aGljaCB0aGUgdXNlciBjYW4gYnVpbGQgYmVhdHMgd2l0aGluXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2NyZWF0ZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgQ3JlYXRlVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDcmVhdGVWaWV3IiwiIyMjKlxuICogQmVhdHMgcGVyIG1pbnV0ZSB2aWV3IGZvciBoYW5kbGluZyB0ZW1wb1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2JwbS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgQlBNSW5kaWNhdG9yIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgUmVmIHRvIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFRoZSBzZXRJbnRlcnZhbCB1cGRhdGUgaW50ZXJ2YWwgZm9yIGluY3JlYXNpbmcgYW5kXG4gICAjIGRlY3JlYXNpbmcgQlBNIG9uIHByZXNzIC8gdG91Y2hcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgaW50ZXJ2YWxVcGRhdGVUaW1lOiA3MFxuXG5cbiAgICMgVGhlIHNldEludGVydmFsIHVwZGF0ZXJcbiAgICMgQHR5cGUge1NldEludGVydmFsfVxuXG4gICB1cGRhdGVJbnRlcnZhbDogbnVsbFxuXG5cbiAgICMgVGhlIGFtb3VudCB0byBpbmNyZWFzZSB0aGUgQlBNIGJ5IG9uIGVhY2ggdGlja1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBicG1JbmNyZWFzZUFtb3VudDogMVxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hzdGFydCAuYnRuLWluY3JlYXNlJzogJ29uSW5jcmVhc2VCdG5Eb3duJ1xuICAgICAgJ3RvdWNoc3RhcnQgLmJ0bi1kZWNyZWFzZSc6ICdvbkRlY3JlYXNlQnRuRG93bidcbiAgICAgICd0b3VjaGVuZCAgIC5idG4taW5jcmVhc2UnOiAnb25CdG5VcCdcbiAgICAgICd0b3VjaGVuZCAgIC5idG4tZGVjcmVhc2UnOiAnb25CdG5VcCdcblxuXG5cblxuICAgIyBSZW5kZXIgdGhlIHZpZXcgYW5kIHVwZGF0ZSB0aGUga2l0IGlmIG5vdCBhbHJlYWR5XG4gICAjIHNldCB2aWEgYSBwcmV2aW91cyBzZXNzaW9uXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkYnBtTGFiZWwgICA9IEAkZWwuZmluZCAnLmxhYmVsLWJwbSdcbiAgICAgIEBpbmNyZWFzZUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1pbmNyZWFzZSdcbiAgICAgIEBkZWNyZWFzZUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1kZWNyZWFzZSdcblxuICAgICAgQCRicG1MYWJlbC50ZXh0IEBhcHBNb2RlbC5nZXQoJ2JwbScpXG5cbiAgICAgIEBcblxuXG5cbiAgICMgQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgaGFuZGluZyBjaGFuZ2VzIHJlbGF0ZWQgdG9cbiAgICMgc3dpdGNoaW5nIEJQTVxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9CUE0sIEBvbkJQTUNoYW5nZVxuXG5cblxuXG4gICAjIFNldHMgYW4gaW50ZXJ2YWwgdG8gaW5jcmVhc2UgdGhlIEJQTSBtb25pdG9yLiAgQ2xlYXJzXG4gICAjIHdoZW4gdGhlIHVzZXIgcmVsZWFzZXMgdGhlIG1vdXNlXG5cbiAgIGluY3JlYXNlQlBNOiAtPlxuICAgICAgQHVwZGF0ZUludGVydmFsID0gc2V0SW50ZXJ2YWwgPT5cbiAgICAgICAgIGJwbSA9IEBhcHBNb2RlbC5nZXQgJ2JwbSdcblxuICAgICAgICAgaWYgYnBtIDwgQXBwQ29uZmlnLkJQTV9NQVhcbiAgICAgICAgICAgIGJwbSArPSBAYnBtSW5jcmVhc2VBbW91bnRcblxuICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnBtID0gQXBwQ29uZmlnLkJQTV9NQVhcblxuICAgICAgICAgQGFwcE1vZGVsLnNldCAnYnBtJywgYnBtXG5cbiAgICAgICwgQGludGVydmFsVXBkYXRlVGltZVxuXG5cblxuXG4gICAjIFNldHMgYW4gaW50ZXJ2YWwgdG8gZGVjcmVhc2UgdGhlIEJQTSBtb25pdG9yLiAgQ2xlYXJzXG4gICAjIHdoZW4gdGhlIHVzZXIgcmVsZWFzZXMgdGhlIG1vdXNlXG5cbiAgIGRlY3JlYXNlQlBNOiAtPlxuICAgICAgQHVwZGF0ZUludGVydmFsID0gc2V0SW50ZXJ2YWwgPT5cbiAgICAgICAgIGJwbSA9IEBhcHBNb2RlbC5nZXQgJ2JwbSdcblxuICAgICAgICAgaWYgYnBtID4gMFxuICAgICAgICAgICAgYnBtIC09IEBicG1JbmNyZWFzZUFtb3VudFxuXG4gICAgICAgICBlbHNlXG4gICAgICAgICAgICBicG0gPSAwXG5cbiAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ2JwbScsIGJwbVxuXG4gICAgICAsIEBpbnRlcnZhbFVwZGF0ZVRpbWVcblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGxlZnQgYnV0dG9uIGNsaWNrcy4gIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gYW5kXG4gICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25JbmNyZWFzZUJ0bkRvd246IChldmVudCkgPT5cbiAgICAgIEBpbmNyZWFzZUJQTSgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkRlY3JlYXNlQnRuRG93bjogKGV2ZW50KSAtPlxuICAgICAgQGRlY3JlYXNlQlBNKClcblxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG1vdXNlIC8gdG91Y2h1cCBldmVudHMuICBDbGVhcnMgdGhlIGludGVydmFsXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uQnRuVXA6IChldmVudCkgLT5cbiAgICAgIGNsZWFySW50ZXJ2YWwgQHVwZGF0ZUludGVydmFsXG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBudWxsXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSBsYWJlbCBvbiB0aGVcbiAgICMga2l0IHNlbGVjdG9yXG5cbiAgIG9uQlBNQ2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBAJGJwbUxhYmVsLnRleHQgbW9kZWwuY2hhbmdlZC5icG1cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBCUE1JbmRpY2F0b3IiLCIjIyMqXG4gKiBLaXQgc2VsZWN0b3IgZm9yIHN3aXRjaGluZyBiZXR3ZWVuIGRydW0ta2l0IHNvdW5kc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ID0gcmVxdWlyZSAnLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9raXQtc2VsZWN0aW9uLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBLaXRTZWxlY3Rpb24gZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBSZWYgdG8gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBLaXRDb2xsZWN0aW9uIGZvciB1cGRhdGluZyBzb3VuZHNcbiAgICMgQHR5cGUge0tpdENvbGxlY3Rpb259XG5cbiAgIGtpdENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIFRoZSBjdXJyZW50IGtpdFxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdE1vZGVsOiBudWxsXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLmJ0bi1sZWZ0JzogICAnb25MZWZ0QnRuQ2xpY2snXG4gICAgICAndG91Y2hlbmQgLmJ0bi1yaWdodCc6ICAnb25SaWdodEJ0bkNsaWNrJ1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgdXBkYXRlIHRoZSBraXQgaWYgbm90IGFscmVhZHlcbiAgICMgc2V0IHZpYSBhIHByZXZpb3VzIHNlc3Npb25cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRraXRMYWJlbCA9IEAkZWwuZmluZCAnLmxhYmVsLWtpdCdcblxuICAgICAgaWYgQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKSBpcyBudWxsXG4gICAgICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEAka2l0TGFiZWwudGV4dCBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpLmdldCAnbGFiZWwnXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAgIyBzd2l0Y2hpbmcgZHJ1bSBraXRzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uQ2hhbmdlS2l0XG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuXG4gICBvbkxlZnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5wcmV2aW91c0tpdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuXG4gICBvblJpZ2h0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSBsYWJlbCBvbiB0aGVcbiAgICMga2l0IHNlbGVjdG9yXG5cbiAgIG9uQ2hhbmdlS2l0OiAobW9kZWwpIC0+XG4gICAgICBAa2l0TW9kZWwgPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsXG4gICAgICBAJGtpdExhYmVsLnRleHQgQGtpdE1vZGVsLmdldCAnbGFiZWwnXG5cblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdFNlbGVjdGlvbiIsIiMjIypcbiAqIFNvdW5kIHR5cGUgc2VsZWN0b3IgZm9yIGNob29zaW5nIHdoaWNoIHNvdW5kIHNob3VsZFxuICogcGxheSBvbiBlYWNoIHRyYWNrXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2luc3RydW1lbnQtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEluc3RydW1lbnQgZXh0ZW5kcyBWaWV3XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudCIsIiMjIypcbiAqIFBhbmVsIHdoaWNoIGhvdXNlcyBlYWNoIGluZGl2aWR1YWwgc2VsZWN0YWJsZSBzb3VuZFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXBhbmVsLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBJbnN0cnVtZW50U2VsZWN0aW9uUGFuZWwgZXh0ZW5kcyBWaWV3XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudFNlbGVjdGlvblBhbmVsIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCI7XG5cblxuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIiMjIypcbiAqIFNlcXVlbmNlciBwYXJlbnQgdmlldyBmb3IgdHJhY2sgc2VxdWVuY2VzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3NlcXVlbmNlci10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgU2VxdWVuY2VyIGV4dGVuZHMgVmlld1xuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcXVlbmNlciIsIiMjIypcbiAqIEluZGl2aWR1YWwgc2VxdWVuY2VyIHRyYWNrc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zZXF1ZW5jZXItdHJhY2stdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFNlcXVlbmNlclRyYWNrIGV4dGVuZHMgVmlld1xuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcXVlbmNlclRyYWNrIiwiIyMjKlxuICogSW5kaXZpZHVhbCBzZXF1ZW5jZXIgdHJhY2tzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3NvdW5kLXNxdWFyZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgU291bmRTcXVhcmUgZXh0ZW5kcyBWaWV3XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gU291bmRTcXVhcmUiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxidXR0b24gY2xhc3M9J2J0bi1kZWNyZWFzZSc+REVDUkVBU0U8L2J1dHRvbj5cXG48c3BhbiBjbGFzcz0nbGFiZWwtYnBtJz4wPC9zcGFuPlxcbjxidXR0b24gY2xhc3M9J2J0bi1pbmNyZWFzZSc+SU5DUkVBU0U8L2J1dHRvbj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxidXR0b24gY2xhc3M9J2J0bi1sZWZ0Jz5MRUZUPC9idXR0b24+XFxuPHNwYW4gY2xhc3M9J2xhYmVsLWtpdCc+RFJVTSBLSVQ8L3NwYW4+XFxuPGJ1dHRvbiBjbGFzcz0nYnRuLXJpZ2h0Jz5SSUdIVDwvYnV0dG9uPlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGEgaHJlZj0nIy9zaGFyZSc+U0hBUkU8L2E+XCI7XG4gIH0pIiwiIyMjKlxuICogTGFuZGluZyB2aWV3IHdpdGggc3RhcnQgYnV0dG9uIGFuZCBpbml0aWFsIGFuaW1hdGlvblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblB1YlN1YiAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvUHViU3ViJ1xuUHViRXZlbnQgPSByZXF1aXJlICcuLi8uLi9ldmVudHMvUHViRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2xhbmRpbmctdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIExhbmRpbmdWaWV3IGV4dGVuZHMgVmlld1xuXG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCAuc3RhcnQtYnRuJzogJ29uU3RhcnRCdG5DbGljaydcblxuXG4gICBvblN0YXJ0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIFB1YlN1Yi50cmlnZ2VyIFB1YkV2ZW50LlJPVVRFLFxuICAgICAgICAgcm91dGU6ICdjcmVhdGUnXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IExhbmRpbmdWaWV3IiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8c3BhbiBjbGFzcz0nc3RhcnQtYnRuJz5DUkVBVEU8L3NwYW4+XCI7XG4gIH0pIiwiIyMjKlxuICogU2hhcmUgdGhlIHVzZXIgY3JlYXRlZCBiZWF0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3NoYXJlLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBTaGFyZVZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTaGFyZVZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxhIGhyZWY9Jy8jJz5ORVc8L2E+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgXCJjb25maWdcIjoge1xuICAgIFwiYXNzZXRQYXRoXCI6IFwiL2Fzc2V0cy9hdWRpb1wiXG4gIH0sXG5cbiAgXCJraXRzXCI6IFtcbiAgICB7XG4gICAgICBcImxhYmVsXCI6IFwiSGlwIEhvcFwiLFxuICAgICAgXCJmb2xkZXJcIjogXCJoaXAtaG9wXCIsXG4gICAgICBcImluc3RydW1lbnRzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwibGFiZWxcIjogXCJDbG9zZWQgSGlIYXRcIixcbiAgICAgICAgICBcInNyY1wiOiBcIkhBVF8yLm1wM1wiLFxuICAgICAgICAgIFwiaWNvblwiOiBcImljb24taGloYXQtY2xvc2VkXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGFiZWxcIjogXCJLaWNrIERydW1cIixcbiAgICAgICAgICBcInNyY1wiOiBcIktJS18yLm1wM1wiLFxuICAgICAgICAgIFwiaWNvblwiOiBcImljb24ta2lja2RydW1cIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsYWJlbFwiOiBcIk9wZW4gSGlIYXRcIixcbiAgICAgICAgICBcInNyY1wiOiBcIk9QX0hBVF8yLm1wM1wiLFxuICAgICAgICAgIFwiaWNvblwiOiBcImljb24taGloYXQtb3BlblwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxhYmVsXCI6IFwiUmlkZVwiLFxuICAgICAgICAgIFwic3JjXCI6IFwiUklERV9DWU0ubXAzXCIsXG4gICAgICAgICAgXCJpY29uXCI6IFwiaWNvbi1yaWRlXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGFiZWxcIjogXCJTbmFyZVwiLFxuICAgICAgICAgIFwic3JjXCI6IFwiU05fMi5tcDNcIixcbiAgICAgICAgICBcImljb25cIjogXCJpY29uLXNuYXJlXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGFiZWxcIjogXCJUYW1ib3JpbmVcIixcbiAgICAgICAgICBcInNyY1wiOiBcIlRBTUIubXAzXCIsXG4gICAgICAgICAgXCJpY29uXCI6IFwiaWNvbi10YW1ib3JpbmVcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcblxuICAgIHtcbiAgICAgIFwibGFiZWxcIjogXCJKYXp6XCIsXG4gICAgICBcImZvbGRlclwiOiBcImphenpcIixcbiAgICAgIFwiaW5zdHJ1bWVudHNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJsYWJlbFwiOiBcIkZYXCIsXG4gICAgICAgICAgXCJzcmNcIjogXCJGWF8xLm1wM1wiLFxuICAgICAgICAgIFwiaWNvblwiOiBcImljb24tZnhcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsYWJlbFwiOiBcIkNsb3NlZCBIaUhhdFwiLFxuICAgICAgICAgIFwic3JjXCI6IFwiSEFUXzEubXAzXCIsXG4gICAgICAgICAgXCJpY29uXCI6IFwiaWNvbi1oaWhhdC1jbG9zZWRcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsYWJlbFwiOiBcIktpY2sgRHJ1bVwiLFxuICAgICAgICAgIFwic3JjXCI6IFwiS0lLXzEubXAzXCIsXG4gICAgICAgICAgXCJpY29uXCI6IFwiaWNvbi1raWNrZHJ1bVwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImxhYmVsXCI6IFwiT3BlbiBIaUhhdFwiLFxuICAgICAgICAgIFwic3JjXCI6IFwiT1BfSEFUXzEubXAzXCIsXG4gICAgICAgICAgXCJpY29uXCI6IFwiaWNvbi1oaWhhdC1vcGVuXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwibGFiZWxcIjogXCJSaWRlXCIsXG4gICAgICAgICAgXCJzcmNcIjogXCJSSURFX0NZTS5tcDNcIixcbiAgICAgICAgICBcImljb25cIjogXCJpY29uLXJpZGVcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJsYWJlbFwiOiBcIlNuYXJlXCIsXG4gICAgICAgICAgXCJzcmNcIjogXCJTTl8xLm1wM1wiLFxuICAgICAgICAgIFwiaWNvblwiOiBcImljb24tc25hcmVcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICBdXG59IiwiXG4jIFZpZXdzXG5yZXF1aXJlICcuL3NwZWMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy1zcGVjLmNvZmZlZSdcbnJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rpb24tc3BlYy5jb2ZmZWUnXG5yZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLXNwZWMuY29mZmVlJ1xucmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3Rpb25QYW5lbC1zcGVjLmNvZmZlZSdcbnJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50LXNwZWMuY29mZmVlJ1xuXG5yZXR1cm5cblxucmVxdWlyZSAnLi9zcGVjL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy1zcGVjLmNvZmZlZSdcblxuIyBDcmVhdGVcbnJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy1zcGVjLmNvZmZlZSdcblxuXG5yZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci1zcGVjLmNvZmZlZSdcbnJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyVHJhY2stc3BlYy5jb2ZmZWUnXG5yZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NvdW5kU3F1YXJlLXNwZWMuY29mZmVlJ1xuXG5cbiMgTW9kZWxzXG5yZXF1aXJlICcuL3NwZWMvbW9kZWxzL0tpdE1vZGVsLXNwZWMuY29mZmVlJ1xucmVxdWlyZSAnLi9zcGVjL21vZGVscy9Tb3VuZENvbGxlY3Rpb24tc3BlYy5jb2ZmZWUnXG5yZXF1aXJlICcuL3NwZWMvbW9kZWxzL1NvdW5kTW9kZWwtc3BlYy5jb2ZmZWUnXG5cbiMgQ29udHJvbGxlcnNcbnJlcXVpcmUgJy4vc3BlYy9BcHBDb250cm9sbGVyLXNwZWMuY29mZmVlJ1xuIiwiQXBwQ29udHJvbGxlciA9IHJlcXVpcmUgJy4uLy4uL3NyYy9zY3JpcHRzL0FwcENvbnRyb2xsZXIuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdBcHAgQ29udHJvbGxlcicsIC0+XG5cbiAgIGl0ICdTaG91bGQgaW5pdGlhbGl6ZScsID0+IiwiXG5cbmRlc2NyaWJlICdLaXQgTW9kZWwnLCAtPlxuXG4gICBpdCAnU2hvdWxkIGluaXRpYWxpemUgd2l0aCBkZWZhdWx0IGNvbmZpZyBwcm9wZXJ0aWVzJywgPT4iLCJcblxuZGVzY3JpYmUgJ1NvdW5kIENvbGxlY3Rpb24nLCAtPlxuXG4gICBpdCAnU2hvdWxkIGluaXRpYWxpemUgd2l0aCBhIHNvdW5kIHNldCcsID0+IiwiXG5cbmRlc2NyaWJlICdTb3VuZCBNb2RlbCcsIC0+XG5cbiAgIGl0ICdTaG91bGQgaW5pdGlhbGl6ZSB3aXRoIGRlZmF1bHQgY29uZmlnIHByb3BlcnRpZXMnLCA9PiIsIkNyZWF0ZVZpZXcgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdDcmVhdGUgVmlldycsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IENyZWF0ZVZpZXdcbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5lbCkudG8uZXhpc3QiLCJCUE1JbmRpY2F0b3IgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xuQXBwTW9kZWwgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbkFwcEV2ZW50ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5BcHBDb25maWcgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblxuZGVzY3JpYmUgJ0JQTSBJbmRpY2F0b3InLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IEJQTUluZGljYXRvclxuICAgICAgICAgYXBwTW9kZWw6IG5ldyBBcHBNb2RlbCgpXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBpZiBAdmlldy51cGRhdGVJbnRlcnZhbCB0aGVuIGNsZWFySW50ZXJ2YWwgQHZpZXcudXBkYXRlSW50ZXJ2YWxcbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG5cbiAgICAgIEB2aWV3LnNob3VsZC5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCBkaXNwbGF5IHRoZSBjdXJyZW50IEJQTSBpbiB0aGUgbGFiZWwnLCA9PlxuXG4gICAgICAkbGFiZWwgPSBAdmlldy4kZWwuZmluZCAnLmxhYmVsLWJwbSdcbiAgICAgICRsYWJlbC50ZXh0KCkuc2hvdWxkLmVxdWFsIFN0cmluZyhAdmlldy5hcHBNb2RlbC5nZXQoJ2JwbScpKVxuXG5cblxuICAgaXQgJ1Nob3VsZCBhdXRvLWFkdmFuY2UgdGhlIGJwbSB2aWEgc2V0SW50ZXJ2YWwgb24gcHJlc3MnLCAoZG9uZSkgPT5cblxuICAgICAgQHZpZXcuYnBtSW5jcmVhc2VBbW91bnQgPSA1MFxuICAgICAgQHZpZXcuaW50ZXJ2YWxVcGRhdGVUaW1lID0gMVxuICAgICAgYXBwTW9kZWwgPSBAdmlldy5hcHBNb2RlbFxuICAgICAgYXBwTW9kZWwuc2V0ICdicG0nLCAxXG5cbiAgICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICAgIGJwbSA9IGFwcE1vZGVsLmdldCAnYnBtJ1xuXG4gICAgICAgICBpZiBicG0gPj0gMTIwXG4gICAgICAgICAgICBAdmlldy5vbkJ0blVwKClcbiAgICAgICAgICAgIGRvbmUoKVxuICAgICAgLCAxMDBcblxuICAgICAgQHZpZXcub25JbmNyZWFzZUJ0bkRvd24oKVxuXG5cblxuICAgaXQgJ1Nob3VsZCBjbGVhciB0aGUgaW50ZXJ2YWwgb24gcmVsZWFzZScsID0+XG5cbiAgICAgIEB2aWV3Lm9uSW5jcmVhc2VCdG5Eb3duKClcbiAgICAgIEB2aWV3LnVwZGF0ZUludGVydmFsLnNob3VsZC5leGlzdFxuICAgICAgQHZpZXcub25CdG5VcCgpXG4gICAgICBleHBlY3QoQHZpZXcudXBkYXRlSW50ZXJ2YWwpLnRvLmJlLm51bGxcblxuIiwiS2l0U2VsZWN0aW9uICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rpb24uY29mZmVlJ1xuQXBwTW9kZWwgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0tpdE1vZGVsLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0tpdCBTZWxlY3Rpb24nLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIG1vZGVscyA9IFtdXG5cbiAgICAgIF8oNCkudGltZXMgKGluZGV4KSAtPlxuICAgICAgICAgbW9kZWxzLnB1c2ggbmV3IEtpdE1vZGVsIHtsYWJlbDogXCJraXQgI3tpbmRleH1cIn1cblxuXG4gICAgICBAdmlldyA9IG5ldyBLaXRTZWxlY3Rpb25cbiAgICAgICAgIGFwcE1vZGVsOiBuZXcgQXBwTW9kZWwoKVxuICAgICAgICAga2l0Q29sbGVjdGlvbjogbmV3IEtpdENvbGxlY3Rpb24gbW9kZWxzXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG5cbiAgICAgIEB2aWV3LiRlbC5zaG91bGQuZXhpc3RcblxuXG5cblxuICAgaXQgJ1Nob3VsZCBoYXZlIGEgbGFiZWwnLCA9PlxuXG4gICAgICAkbGFiZWwgPSBAdmlldy4kZWwuZmluZCAnLmxhYmVsLWtpdCdcbiAgICAgICRsYWJlbC50ZXh0IEB2aWV3LmtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0ICdsYWJlbCdcbiAgICAgICRsYWJlbC50ZXh0KCkuc2hvdWxkLmVxdWFsICdraXQgMCdcblxuXG5cblxuICAgaXQgJ1Nob3VsZCB1cGRhdGUgdGhlIEFwcE1vZGVsIGEga2l0IGlzIGNoYW5nZWQnLCA9PlxuXG4gICAgICAkbGFiZWwgPSBAdmlldy4kZWwuZmluZCAnLmxhYmVsLWtpdCdcbiAgICAgIGZpcnN0TGFiZWwgPSBAdmlldy5raXRDb2xsZWN0aW9uLmF0KDApLmdldCAnbGFiZWwnXG4gICAgICBsYXN0TGFiZWwgID0gQHZpZXcua2l0Q29sbGVjdGlvbi5hdChAdmlldy5raXRDb2xsZWN0aW9uLmxlbmd0aC0xKS5nZXQgJ2xhYmVsJ1xuXG4gICAgICBhcHBNb2RlbCA9IEB2aWV3LmFwcE1vZGVsXG5cbiAgICAgIGFwcE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6a2l0TW9kZWwnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5vbkxlZnRCdG5DbGljaygpXG4gICAgICAgICAkbGFiZWwudGV4dCgpLnNob3VsZC5lcXVhbCBsYXN0TGFiZWxcblxuICAgICAgYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpraXRNb2RlbCcpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm9uUmlnaHRCdG5DbGljaygpXG4gICAgICAgICAkbGFiZWwudGV4dCgpLnNob3VsZC5lcXVhbCBmaXJzdExhYmVsXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4iLCJJbnN0cnVtZW50ID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdJbnN0cnVtZW50JywgLT5cblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBJbnN0cnVtZW50XG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgYWxsb3cgdXNlciB0byBzZWxlY3QgYW5kIGRlc2VsZWN0IGluc3RydW1lbnRzJywgPT5cblxuXG4gICBpdCAnU2hvdWxkIGRpc3BhdGNoIGFuIGV2ZW50IGluZGljYXRpbmcgd2hpY2ggc291bmQgaGFzIGJlZW4gc2VsZWN0ZWQnLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgdXBkYXRlIHRoZSBzZWxlY3RlZCBzdGF0ZSBpZiB0aGUgdXNlciBpcyBpbnRlcmZhY2luZyB3aXRoIHRoZSBzZXF1ZW5jZScsID0+XG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gdG8gdGhlIFNlcXVlbmNlck1vZGVsIGZvciB1cGRhdGVzJywgPT4iLCJJbnN0cnVtZW50U2VsZWN0aW9uUGFuZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdGlvblBhbmVsLmNvZmZlZSdcbkFwcENvbmZpZyAgICAgICAgICAgICAgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gICAgICAgICAgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5zb3VuZERhdGEgICAgICAgICAgICAgICAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vdGVzdC9maXh0dXJlcy9zb3VuZC1kYXRhJ1xuXG5cblxuZGVzY3JpYmUgJ0luc3RydW1lbnQgU2VsZWN0aW9uIFBhbmVsJywgLT5cblxuXG4gICBiZWZvcmVFYWNoID0+XG5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICAjY29uc29sZS5sb2cgQGtpdENvbGxlY3Rpb25cbiAgICAgIEB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3Rpb25QYW5lbFxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCByZWZlciB0byB0aGUgY3VycmVudCBLaXRNb2RlbCB3aGVuIGluc3RhbnRpYXRpbmcgc291bmRzJywgPT5cblxuXG4gICBpdCAnU2hvdWxkIGl0ZXJhdGUgb3ZlciBhbGwgb2YgdGhlIHNvdW5kcyBpbiB0aGUgU291bmRDb2xsZWN0aW9uIHRvIGJ1aWxkIG91dCBpbnN0cnVtZW50cycsID0+XG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIHNlbGVjdGlvbnMgZnJvbSBTb3VuZFR5cGUgaW5zdGFuY2VzIGFuZCB1cGRhdGUgdGhlIG1vZGVsJywgPT5cblxuXG4gICBpdCAnU2hvdWxkIGFsbG93IHVzZXIgdG8gc2VsZWN0IGFuZCBkZXNlbGVjdCBpbnN0cnVtZW50cycsID0+XG5cblxuICAgaXQgJ1Nob3VsZCBkaXNwYXRjaCBhbiBldmVudCBpbmRpY2F0aW5nIHdoaWNoIHNvdW5kIGhhcyBiZWVuIHNlbGVjdGVkJywgPT5cblxuXG4gICBpdCAnU2hvdWxkIHVwZGF0ZSB0aGUgc2VsZWN0ZWQgc3RhdGUgaWYgdGhlIHVzZXIgaXMgaW50ZXJmYWNpbmcgd2l0aCB0aGUgc2VxdWVuY2UnLCA9PiIsIlNlcXVlbmNlciA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJyIsIlNlcXVlbmNlclRyYWNrID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXJUcmFjay5jb2ZmZWUnIiwiU291bmRTcXVhcmUgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NvdW5kU3F1YXJlLmNvZmZlZSciLCJBcHBDb250cm9sbGVyID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL0FwcENvbnRyb2xsZXIuY29mZmVlJ1xuTGFuZGluZ1ZpZXcgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSdcblxuZGVzY3JpYmUgJ0xhbmRpbmcgVmlldycsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IExhbmRpbmdWaWV3XG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuICAgICAgaWYgQGFwcENvbnRyb2xsZXIgdGhlbiBAYXBwQ29udHJvbGxlci5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgZXhwZWN0KEB2aWV3LmVsKS50by5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCByZWRpcmVjdCB0byBjcmVhdGUgcGFnZSBvbiBjbGljaycsIChkb25lKSA9PlxuXG4gICAgICBAYXBwQ29udHJvbGxlciA9IG5ldyBBcHBDb250cm9sbGVyKClcbiAgICAgIHJvdXRlciA9IEBhcHBDb250cm9sbGVyLmFwcFJvdXRlclxuICAgICAgJHN0YXJ0QnRuID0gQHZpZXcuJGVsLmZpbmQgJy5zdGFydC1idG4nXG5cbiAgICAgICRzdGFydEJ0bi5vbiAnY2xpY2snLCAoZXZlbnQpID0+XG4gICAgICAgICAnY3JlYXRlJy5zaG91bGQucm91dGUudG8gcm91dGVyLCAnY3JlYXRlUm91dGUnXG4gICAgICAgICBkb25lKClcblxuICAgICAgJHN0YXJ0QnRuLmNsaWNrKClcblxuXG5cblxuXG5cblxuXG4iLCJTaGFyZVZpZXcgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSdcblxuXG5kZXNjcmliZSAnU2hhcmUgVmlldycsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IFNoYXJlVmlld1xuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgZXhwZWN0KEB2aWV3LmVsKS50by5leGlzdFxuXG5cbiAgIGl0ICdTaG91bGQgYWNjZXB0IGEgU291bmRTaGFyZSBvYmplY3QnLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIHRoZSB2aXN1YWxpemF0aW9uIGxheWVyJywgPT5cblxuXG4gICBpdCAnU2hvdWxkIHBhdXNlIHBsYXliYWNrIG9mIHRoZSBhdWRpbyB0cmFjayBvbiBpbml0JywgPT5cblxuXG4gICBpdCAnU2hvdWxkIHRvZ2dsZSB0aGUgcGxheSAvIHBhdXNlIGJ1dHRvbicsID0+XG5cblxuICAgaXQgJ1Nob3VsZCBkaXNwbGF5IHRoZSB1c2VycyBzb25nIHRpdGxlIGFuZCB1c2VybmFtZScsID0+XG4iXX0=

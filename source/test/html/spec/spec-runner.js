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


},{"./models/AppModel.coffee":9,"./routers/AppRouter.coffee":17,"./views/create/CreateView.coffee":20,"./views/landing/LandingView.coffee":36,"./views/share/ShareView.coffee":38}],6:[function(require,module,exports){

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
  VELOCITY_MAX: 3,
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
  CHANGE_BPM: 'change:bpm',
  CHANGE_INSTRUMENT: 'change:currentInstrument',
  CHANGE_VELOCITY: 'change:velocity'
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
    'icon': null,
    'label': null,
    'src': null
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

AppConfig = require('../../config/AppConfig.coffee');

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


},{"../../config/AppConfig.coffee":6,"./KitModel.coffee":13}],13:[function(require,module,exports){

/**
 * Kit model for handling state related to kit selection
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var InstrumentCollection, KitModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

InstrumentCollection = require('../instruments/InstrumentCollection.coffee');

KitModel = (function(_super) {
  __extends(KitModel, _super);

  function KitModel() {
    return KitModel.__super__.constructor.apply(this, arguments);
  }

  KitModel.prototype.defaults = {
    'label': null,
    'path': null,
    'folder': null,
    'instruments': null,
    'currentInstrument': null
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


},{"../instruments/InstrumentCollection.coffee":10}],14:[function(require,module,exports){

/**
  A collection of individual pattern squares

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppConfig, PatternSquareCollection, PatternSquareModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../config/AppConfig.coffee');

PatternSquareModel = require('./PatternSquareModel.coffee');

PatternSquareCollection = (function(_super) {
  __extends(PatternSquareCollection, _super);

  function PatternSquareCollection() {
    return PatternSquareCollection.__super__.constructor.apply(this, arguments);
  }

  PatternSquareCollection.prototype.model = PatternSquareModel;

  return PatternSquareCollection;

})(Backbone.Collection);

module.exports = PatternSquareCollection;


},{"../../config/AppConfig.coffee":6,"./PatternSquareModel.coffee":15}],15:[function(require,module,exports){

/**
  Model for individual pattern squares.  Part of larger Pattern Track collection

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppConfig, PatternSquareModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../config/AppConfig.coffee');

PatternSquareModel = (function(_super) {
  __extends(PatternSquareModel, _super);

  function PatternSquareModel() {
    return PatternSquareModel.__super__.constructor.apply(this, arguments);
  }

  PatternSquareModel.prototype.defaults = {
    'velocity': 0,
    'previousVelocity': 0,
    'active': false
  };

  PatternSquareModel.prototype.initialize = function(options) {
    PatternSquareModel.__super__.initialize.call(this, options);
    return this.on('change:velocity', this.onVelocityChange);
  };

  PatternSquareModel.prototype.cycle = function() {
    var velocity;
    velocity = this.get('velocity');
    if (velocity < AppConfig.VELOCITY_MAX) {
      velocity++;
    } else {
      velocity = 0;
    }
    return this.set('velocity', velocity);
  };

  PatternSquareModel.prototype.enable = function() {
    return this.set('velocity', 1);
  };

  PatternSquareModel.prototype.disable = function() {
    return this.set('velocity', 0);
  };

  PatternSquareModel.prototype.onVelocityChange = function(model) {
    var velocity;
    this.set('previousVelocity', model._previousAttributes.velocity);
    velocity = model.changed.velocity;
    if (velocity > 0) {
      return this.set('active', true);
    } else if (velocity === 0) {
      return this.set('active', false);
    }
  };

  return PatternSquareModel;

})(Backbone.Model);

module.exports = PatternSquareModel;


},{"../../config/AppConfig.coffee":6}],16:[function(require,module,exports){

/**
  Model for pattern tracks, which corresponde to the current instrument

  @author Christopher Pappas <chris@wintr.us>
  @date   3.20.14
 */
var PatternTrackModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PatternTrackModel = (function(_super) {
  __extends(PatternTrackModel, _super);

  function PatternTrackModel() {
    return PatternTrackModel.__super__.constructor.apply(this, arguments);
  }

  PatternTrackModel.prototype.defaults = {
    'volume': null,
    'active': null
  };

  return PatternTrackModel;

})(Backbone.Model);

module.exports = PatternTrackModel;


},{}],17:[function(require,module,exports){

/**
 * MPC Application router
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppConfig, AppRouter, BPMIndicator, InstrumentSelectionPanel, KitCollection, KitModel, KitSelection, PatternSquare, PatternSquareCollection, PatternSquareModel, PatternTrack, PubEvent, PubSub, Sequencer, TestsView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../config/AppConfig.coffee');

PubSub = require('../utils/PubSub');

PubEvent = require('../events/PubEvent.coffee');

TestsView = require('../views/tests/TestsView.coffee');

KitSelection = require('../views/create/components/KitSelection.coffee');

KitCollection = require('../models/kits/KitCollection.coffee');

KitModel = require('../models/kits/KitModel.coffee');

BPMIndicator = require('../views/create/components/BPMIndicator.coffee');

InstrumentSelectionPanel = require('../views/create/components/instruments/InstrumentSelectionPanel.coffee');

PatternSquare = require('../views/create/components/sequencer/PatternSquare.coffee');

PatternSquareModel = require('../models/sequencer/PatternSquareModel.coffee');

PatternSquareCollection = require('../models/sequencer/PatternSquareCollection.coffee');

PatternTrack = require('../views/create/components/sequencer/PatternTrack.coffee');

Sequencer = require('../views/create/components/sequencer/Sequencer.coffee');

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
    'tests': 'tests',
    'kit-selection': 'kitSelectionRoute',
    'bpm-indicator': 'bpmIndicatorRoute',
    'instrument-selector': 'instrumentSelectorRoute',
    'pattern-square': 'patternSquareRoute',
    'pattern-track': 'patternTrackRoute',
    'sequencer': 'sequencerRoute'
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

  AppRouter.prototype.tests = function() {
    var view;
    view = new TestsView();
    return this.appModel.set('view', view);
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

  AppRouter.prototype.instrumentSelectorRoute = function() {
    var view;
    this.kitCollection = new KitCollection({
      parse: true
    });
    this.kitCollection.fetch({
      async: false,
      url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'
    });
    this.appModel.set('kitModel', this.kitCollection.at(0));
    view = new InstrumentSelectionPanel({
      kitCollection: this.kitCollection,
      appModel: this.appModel
    });
    return this.appModel.set('view', view);
  };

  AppRouter.prototype.patternSquareRoute = function() {
    var view;
    view = new PatternSquare({
      model: new PatternSquareModel()
    });
    return this.appModel.set('view', view);
  };

  AppRouter.prototype.patternTrackRoute = function() {
    var squares, view;
    squares = [];
    _(8).times((function(_this) {
      return function() {
        return squares.push(new PatternSquareModel());
      };
    })(this));
    view = new PatternTrack({
      collection: new PatternSquareCollection(squares)
    });
    return this.appModel.set('view', view);
  };

  AppRouter.prototype.sequencerRoute = function() {
    var view;
    view = new Sequencer();
    return this.appModel.set('view', view);
  };

  return AppRouter;

})(Backbone.Router);

module.exports = AppRouter;


},{"../config/AppConfig.coffee":6,"../events/PubEvent.coffee":8,"../models/kits/KitCollection.coffee":12,"../models/kits/KitModel.coffee":13,"../models/sequencer/PatternSquareCollection.coffee":14,"../models/sequencer/PatternSquareModel.coffee":15,"../utils/PubSub":19,"../views/create/components/BPMIndicator.coffee":21,"../views/create/components/KitSelection.coffee":22,"../views/create/components/instruments/InstrumentSelectionPanel.coffee":24,"../views/create/components/sequencer/PatternSquare.coffee":27,"../views/create/components/sequencer/PatternTrack.coffee":28,"../views/create/components/sequencer/Sequencer.coffee":29,"../views/tests/TestsView.coffee":40}],18:[function(require,module,exports){

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
  removeEventListeners: function() {
    return this.stopListening();
  }
});

module.exports = View;


},{}],19:[function(require,module,exports){
/**
 * @module     PubSub
 * @desc       Global PubSub object for dispatch and delegation
 */

'use strict'

var PubSub = {}

_.extend( PubSub, Backbone.Events )

module.exports = PubSub
},{}],20:[function(require,module,exports){

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


},{"../../supers/View.coffee":18,"./templates/create-template.hbs":35}],21:[function(require,module,exports){

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


},{"../../../config/AppConfig.coffee":6,"../../../events/AppEvent.coffee":7,"../../../supers/View.coffee":18,"./templates/bpm-template.hbs":33}],22:[function(require,module,exports){

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


},{"../../../events/AppEvent.coffee":7,"../../../supers/View.coffee":18,"./templates/kit-selection-template.hbs":34}],23:[function(require,module,exports){

/**
 * Sound type selector for choosing which sound should
 * play on each track
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent, Instrument, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppEvent = require('../../../../events/AppEvent.coffee');

View = require('../../../../supers/View.coffee');

template = require('./templates/instrument-template.hbs');

Instrument = (function(_super) {
  __extends(Instrument, _super);

  function Instrument() {
    return Instrument.__super__.constructor.apply(this, arguments);
  }

  Instrument.prototype.className = 'instrument';

  Instrument.prototype.template = template;

  Instrument.prototype.model = null;

  Instrument.prototype.kitModel = null;

  Instrument.prototype.events = {
    'touchend': 'onClick'
  };

  Instrument.prototype.onClick = function(event) {
    this.kitModel.set('currentInstrument', this.model);
    return this.$el.addClass('selected');
  };

  return Instrument;

})(View);

module.exports = Instrument;


},{"../../../../events/AppEvent.coffee":7,"../../../../supers/View.coffee":18,"./templates/instrument-template.hbs":26}],24:[function(require,module,exports){

/**
 * Panel which houses each individual selectable sound
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent, Instrument, InstrumentSelectionPanel, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppEvent = require('../../../../events/AppEvent.coffee');

View = require('../../../../supers/View.coffee');

Instrument = require('./Instrument.coffee');

template = require('./templates/instrument-panel-template.hbs');

InstrumentSelectionPanel = (function(_super) {
  __extends(InstrumentSelectionPanel, _super);

  function InstrumentSelectionPanel() {
    this.onInstrumentChange = __bind(this.onInstrumentChange, this);
    this.onKitChange = __bind(this.onKitChange, this);
    return InstrumentSelectionPanel.__super__.constructor.apply(this, arguments);
  }

  InstrumentSelectionPanel.prototype.template = template;

  InstrumentSelectionPanel.prototype.appModel = null;

  InstrumentSelectionPanel.prototype.kitCollection = null;

  InstrumentSelectionPanel.prototype.kitModel = null;

  InstrumentSelectionPanel.prototype.instrumentViews = null;

  InstrumentSelectionPanel.prototype.events = {
    'click .test': 'onTestClick'
  };

  InstrumentSelectionPanel.prototype.initialize = function(options) {
    InstrumentSelectionPanel.__super__.initialize.call(this, options);
    return this.kitModel = this.appModel.get('kitModel');
  };

  InstrumentSelectionPanel.prototype.render = function(options) {
    InstrumentSelectionPanel.__super__.render.call(this, options);
    this.$container = this.$el.find('.container-instruments');
    this.renderInstruments();
    return this;
  };

  InstrumentSelectionPanel.prototype.renderInstruments = function() {
    this.instrumentViews = [];
    return this.kitModel.get('instruments').each((function(_this) {
      return function(model) {
        var instrument;
        instrument = new Instrument({
          kitModel: _this.kitModel,
          model: model
        });
        _this.$container.append(instrument.render().el);
        return _this.instrumentViews.push(instrument);
      };
    })(this));
  };

  InstrumentSelectionPanel.prototype.addEventListeners = function() {
    this.listenTo(this.appModel, AppEvent.CHANGE_KIT, this.onKitChange);
    return this.listenTo(this.kitModel, AppEvent.CHANGE_INSTRUMENT, this.onInstrumentChange);
  };

  InstrumentSelectionPanel.prototype.removeEventListeners = function() {
    return this.stopListening();
  };

  InstrumentSelectionPanel.prototype.onKitChange = function(model) {
    this.removeEventListeners();
    this.kitModel = model.changed.kitModel;
    _.each(this.instrumentViews, function(instrument) {
      return instrument.remove();
    });
    this.renderInstruments();
    return this.addEventListeners();
  };

  InstrumentSelectionPanel.prototype.onInstrumentChange = function(model) {
    return this.$container.find('.instrument').removeClass('selected');
  };

  InstrumentSelectionPanel.prototype.onTestClick = function(event) {
    return this.appModel.set('kitModel', this.kitCollection.nextKit());
  };

  return InstrumentSelectionPanel;

})(View);

module.exports = InstrumentSelectionPanel;


},{"../../../../events/AppEvent.coffee":7,"../../../../supers/View.coffee":18,"./Instrument.coffee":23,"./templates/instrument-panel-template.hbs":25}],25:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='test'>NEXT</div>\n<div class='container-instruments'>\n\n</div>";
  })
},{"handleify":4}],26:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function";


  buffer += "<div class='icon ";
  if (stack1 = helpers.icon) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.icon; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>*</div>\n<div class='label'>\n	";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>";
  return buffer;
  })
},{"handleify":4}],27:[function(require,module,exports){

/**
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppConfig, AppEvent, PatternSquare, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../../../config/AppConfig.coffee');

AppEvent = require('../../../../events/AppEvent.coffee');

View = require('../../../../supers/View.coffee');

template = require('./templates/pattern-square-template.hbs');

PatternSquare = (function(_super) {
  __extends(PatternSquare, _super);

  function PatternSquare() {
    return PatternSquare.__super__.constructor.apply(this, arguments);
  }

  PatternSquare.prototype.className = 'pattern-square';

  PatternSquare.prototype.tagName = 'td';

  PatternSquare.prototype.template = template;

  PatternSquare.prototype.events = {
    'touchend': 'onClick'
  };

  PatternSquare.prototype.addEventListeners = function() {
    return this.listenTo(this.model, AppEvent.CHANGE_VELOCITY, this.onVelocityChange);
  };

  PatternSquare.prototype.enable = function() {
    return this.model.enable();
  };

  PatternSquare.prototype.disable = function() {
    return this.model.disable();
  };

  PatternSquare.prototype.flashOn = function() {
    return this.$el.addClass('flash');
  };

  PatternSquare.prototype.flashOff = function() {
    return this.$el.removeClass('flash');
  };

  PatternSquare.prototype.onClick = function(event) {
    return this.model.cycle();
  };

  PatternSquare.prototype.onVelocityChange = function(model) {
    var velocity, velocityClass;
    velocity = model.changed.velocity;
    this.$el.removeClass('velocity-low velocity-medium velocity-high');
    velocityClass = (function() {
      switch (velocity) {
        case 1:
          return 'velocity-low';
        case 2:
          return 'velocity-medium';
        case 3:
          return 'velocity-high';
        default:
          return '';
      }
    })();
    return this.$el.addClass(velocityClass);
  };

  return PatternSquare;

})(View);

module.exports = PatternSquare;


},{"../../../../config/AppConfig.coffee":6,"../../../../events/AppEvent.coffee":7,"../../../../supers/View.coffee":18,"./templates/pattern-square-template.hbs":30}],28:[function(require,module,exports){

/**
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var PatternSquare, PatternTrack, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PatternSquare = require('./PatternSquare.coffee');

View = require('../../../../supers/View.coffee');

template = require('./templates/pattern-track-template.hbs');

PatternTrack = (function(_super) {
  __extends(PatternTrack, _super);

  function PatternTrack() {
    return PatternTrack.__super__.constructor.apply(this, arguments);
  }

  PatternTrack.prototype.className = 'pattern-track';

  PatternTrack.prototype.tagName = 'tr';

  PatternTrack.prototype.template = template;

  PatternTrack.prototype.render = function(options) {
    PatternTrack.__super__.render.call(this, options);
    this.renderPatternSquares();
    return this;
  };

  PatternTrack.prototype.renderPatternSquares = function() {
    this.patternSquareViews = [];
    return this.collection.each((function(_this) {
      return function(model) {
        var patternSquare;
        patternSquare = new PatternSquare({
          model: model
        });
        console.log(_this.$el);
        _this.$el.append(patternSquare.render().el);
        return _this.patternSquareViews.push(patternSquare);
      };
    })(this));
  };

  return PatternTrack;

})(View);

module.exports = PatternTrack;


},{"../../../../supers/View.coffee":18,"./PatternSquare.coffee":27,"./templates/pattern-track-template.hbs":31}],29:[function(require,module,exports){

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


},{"../../../../supers/View.coffee":18,"./templates/sequencer-template.hbs":32}],30:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "Patterns square";
  })
},{"handleify":4}],31:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })
},{"handleify":4}],32:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "Sequencer";
  })
},{"handleify":4}],33:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-decrease'>DECREASE</button>\n<span class='label-bpm'>0</span>\n<button class='btn-increase'>INCREASE</button>";
  })
},{"handleify":4}],34:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-left'>LEFT</button>\n<span class='label-kit'>DRUM KIT</span>\n<button class='btn-right'>RIGHT</button>";
  })
},{"handleify":4}],35:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<a href='#/share'>SHARE</a>";
  })
},{"handleify":4}],36:[function(require,module,exports){

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


},{"../../events/PubEvent.coffee":8,"../../supers/View.coffee":18,"../../utils/PubSub":19,"./templates/landing-template.hbs":37}],37:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<span class='start-btn'>CREATE</span>";
  })
},{"handleify":4}],38:[function(require,module,exports){

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


},{"../../supers/View.coffee":18,"./templates/share-template.hbs":39}],39:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<a href='/#'>NEW</a>";
  })
},{"handleify":4}],40:[function(require,module,exports){

/**
 * Landing view with start button and initial animation
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var TestsView, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('../../supers/View.coffee');

template = require('./tests-template.hbs');

TestsView = (function(_super) {
  __extends(TestsView, _super);

  function TestsView() {
    return TestsView.__super__.constructor.apply(this, arguments);
  }

  TestsView.prototype.template = template;

  return TestsView;

})(View);

module.exports = TestsView;


},{"../../supers/View.coffee":18,"./tests-template.hbs":41}],41:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h1>Component Viewer</h1>\n\n<br />\n<p>\n	Make sure that <b>httpster</b> is running in the <b>source</b> route (npm install -g httpster) <br/>\n	<a href=\"http://localhost:3333/test/html/\">Mocha Test Runner</a>\n</p>\n\n<br />\n<ul>\n	<li><a href='#kit-selection'>Kit Selection</a></li>\n	<li><a href=\"#bpm-indicator\">BPM Indicator</a></li>\n	<li><a href=\"#instrument-selector\">Instrument Selector</a></li>\n	<li><a href=\"#pattern-square\">Pattern Square</a></li>\n	<li><a href=\"#pattern-track\">Pattern Track</a></li>\n	<li><a href=\"#sequencer\">Sequencer</a></li>\n</ul>";
  })
},{"handleify":4}],42:[function(require,module,exports){
describe('Models', (function(_this) {
  return function() {
    require('./spec/models/PatternTrackModel-spec.coffee');
    require('./spec/models/KitCollection-spec.coffee');
    return require('./spec/models/KitModel-spec.coffee');
  };
})(this));

describe('Views', (function(_this) {
  return function() {
    require('./spec/views/landing/LandingView-spec.coffee');
    require('./spec/views/create/components/KitSelection-spec.coffee');
    require('./spec/views/create/components/BPMIndicator-spec.coffee');
    describe('Instrument Selector', function() {
      require('./spec/views/create/components/instruments/InstrumentSelectionPanel-spec.coffee');
      return require('./spec/views/create/components/instruments/Instrument-spec.coffee');
    });
    return describe('Sequencer', function() {
      require('./spec/views/create/components/sequencer/PatternSquare-spec.coffee');
      require('./spec/views/create/components/sequencer/PatternTrack-spec.coffee');
      return require('./spec/views/create/components/sequencer/Sequencer-spec.coffee');
    });
  };
})(this));

require('./spec/views/share/ShareView-spec.coffee');

require('./spec/views/create/CreateView-spec.coffee');

require('./spec/models/SoundCollection-spec.coffee');

require('./spec/models/SoundModel-spec.coffee');

require('./spec/AppController-spec.coffee');


},{"./spec/AppController-spec.coffee":43,"./spec/models/KitCollection-spec.coffee":44,"./spec/models/KitModel-spec.coffee":45,"./spec/models/PatternTrackModel-spec.coffee":46,"./spec/models/SoundCollection-spec.coffee":47,"./spec/models/SoundModel-spec.coffee":48,"./spec/views/create/CreateView-spec.coffee":49,"./spec/views/create/components/BPMIndicator-spec.coffee":50,"./spec/views/create/components/KitSelection-spec.coffee":51,"./spec/views/create/components/instruments/Instrument-spec.coffee":52,"./spec/views/create/components/instruments/InstrumentSelectionPanel-spec.coffee":53,"./spec/views/create/components/sequencer/PatternSquare-spec.coffee":54,"./spec/views/create/components/sequencer/PatternTrack-spec.coffee":55,"./spec/views/create/components/sequencer/Sequencer-spec.coffee":56,"./spec/views/landing/LandingView-spec.coffee":57,"./spec/views/share/ShareView-spec.coffee":58}],43:[function(require,module,exports){
var AppController;

AppController = require('../../src/scripts/AppController.coffee');

describe('App Controller', function() {
  return it('Should initialize', (function(_this) {
    return function() {};
  })(this));
});


},{"../../src/scripts/AppController.coffee":5}],44:[function(require,module,exports){
var AppConfig, KitCollection;

AppConfig = require('../../../src/scripts/config/AppConfig.coffee');

KitCollection = require('../../../src/scripts/models/kits/KitCollection.coffee');

describe('Kit Collection', function() {
  beforeEach((function(_this) {
    return function() {
      _this.kitCollection = new KitCollection({
        parse: true
      });
      return _this.kitCollection.fetch({
        async: false,
        url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'
      });
    };
  })(this));
  it('Should parse the response and append an assetPath to each kit model', (function(_this) {
    return function() {
      return _this.kitCollection.at(0).get('path').should.exist;
    };
  })(this));
  it('Should return the next kit', (function(_this) {
    return function() {
      var kit, kitData;
      kitData = _this.kitCollection.toJSON();
      kit = _this.kitCollection.nextKit();
      return kit.get('label').should.equal(kitData[1].label);
    };
  })(this));
  return it('Should return the previous kit', (function(_this) {
    return function() {
      var kit, kitData;
      kitData = _this.kitCollection.toJSON();
      kit = _this.kitCollection.previousKit();
      return kit.get('label').should.equal(kitData[kitData.length - 1].label);
    };
  })(this));
});


},{"../../../src/scripts/config/AppConfig.coffee":6,"../../../src/scripts/models/kits/KitCollection.coffee":12}],45:[function(require,module,exports){
var AppConfig, InstrumentCollection, KitModel;

AppConfig = require('../../../src/scripts/config/AppConfig.coffee');

KitModel = require('../../../src/scripts/models/kits/KitModel.coffee');

InstrumentCollection = require('../../../src/scripts/models/instruments/InstrumentCollection.coffee');

describe('Kit Model', function() {
  beforeEach((function(_this) {
    return function() {
      var data;
      data = {
        "label": "Hip Hop",
        "folder": "hip-hop",
        "instruments": [
          {
            "label": "Closed HiHat",
            "src": "HAT_2.mp3",
            "icon": "icon-hihat-closed"
          }, {
            "label": "Kick Drum",
            "src": "KIK_2.mp3",
            "icon": "icon-kickdrum"
          }
        ]
      };
      return _this.kitModel = new KitModel(data, {
        parse: true
      });
    };
  })(this));
  return it('Should parse the model data and convert instruments to an InstrumentsCollection', (function(_this) {
    return function() {
      return _this.kitModel.get('instruments').should.be.an["instanceof"](InstrumentCollection);
    };
  })(this));
});


},{"../../../src/scripts/config/AppConfig.coffee":6,"../../../src/scripts/models/instruments/InstrumentCollection.coffee":10,"../../../src/scripts/models/kits/KitModel.coffee":13}],46:[function(require,module,exports){
var PatternTrackModel;

PatternTrackModel = require('../../../src/scripts/models/sequencer/PatternTrackModel.coffee');

describe('Pattern Track Model', function() {
  return it('Should exist', function() {});
});


},{"../../../src/scripts/models/sequencer/PatternTrackModel.coffee":16}],47:[function(require,module,exports){
describe('Sound Collection', function() {
  return it('Should initialize with a sound set', (function(_this) {
    return function() {};
  })(this));
});


},{}],48:[function(require,module,exports){
describe('Sound Model', function() {
  return it('Should initialize with default config properties', (function(_this) {
    return function() {};
  })(this));
});


},{}],49:[function(require,module,exports){
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


},{"../../../../src/scripts/views/create/CreateView.coffee":20}],50:[function(require,module,exports){
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


},{"../../../../../src/scripts/config/AppConfig.coffee":6,"../../../../../src/scripts/events/AppEvent.coffee":7,"../../../../../src/scripts/models/AppModel.coffee":9,"../../../../../src/scripts/views/create/components/BPMIndicator.coffee":21}],51:[function(require,module,exports){
var AppModel, KitCollection, KitModel, KitSelection;

KitSelection = require('../../../../../src/scripts/views/create/components/KitSelection.coffee');

AppModel = require('../../../../../src/scripts/models/AppModel.coffee');

KitModel = require('../../../../../src/scripts/models/kits/KitModel.coffee');

KitCollection = require('../../../../../src/scripts/models/kits/KitCollection.coffee');

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


},{"../../../../../src/scripts/models/AppModel.coffee":9,"../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../src/scripts/models/kits/KitModel.coffee":13,"../../../../../src/scripts/views/create/components/KitSelection.coffee":22}],52:[function(require,module,exports){
var Instrument, KitModel;

Instrument = require('../../../../../../src/scripts/views/create/components/instruments/Instrument.coffee');

KitModel = require('../../../../../../src/scripts/models/kits/KitModel.coffee');

describe('Instrument', function() {
  beforeEach((function(_this) {
    return function() {
      _this.view = new Instrument({
        kitModel: new KitModel()
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
      return _this.view.should.exist;
    };
  })(this));
  return it('Should allow user to select instruments', (function(_this) {
    return function() {
      _this.view.onClick();
      return expect(_this.view.$el.hasClass('selected')).to.be["true"];
    };
  })(this));
});


},{"../../../../../../src/scripts/models/kits/KitModel.coffee":13,"../../../../../../src/scripts/views/create/components/instruments/Instrument.coffee":23}],53:[function(require,module,exports){
var AppConfig, AppModel, InstrumentSelectionPanel, KitCollection;

InstrumentSelectionPanel = require('../../../../../../src/scripts/views/create/components/instruments/InstrumentSelectionPanel.coffee');

AppConfig = require('../../../../../../src/scripts/config/AppConfig.coffee');

AppModel = require('../../../../../../src/scripts/models/AppModel.coffee');

KitCollection = require('../../../../../../src/scripts/models/kits/KitCollection.coffee');

describe('Instrument Selection Panel', function() {
  before((function(_this) {
    return function() {
      _this.kitCollection = new KitCollection({
        parse: true
      });
      return _this.kitCollection.fetch({
        async: false,
        url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'
      });
    };
  })(this));
  beforeEach((function(_this) {
    return function() {
      _this.appModel = new AppModel();
      _this.appModel.set('kitModel', _this.kitCollection.at(0));
      _this.view = new InstrumentSelectionPanel({
        appModel: _this.appModel
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
      return _this.view.should.exist;
    };
  })(this));
  it('Should refer to the current KitModel when instantiating sounds', (function(_this) {
    return function() {
      return expect(_this.view.kitModel).to.exist;
    };
  })(this));
  it('Should iterate over all of the sounds in the SoundCollection to build out instruments', (function(_this) {
    return function() {
      var $instruments;
      _this.view.kitModel.toJSON().instruments.length.should.be.above(0);
      $instruments = _this.view.$el.find('.container-instruments').find('.instrument');
      return $instruments.length.should.be.above(0);
    };
  })(this));
  it('Should rebuild view when the kitModel changes', (function(_this) {
    return function() {
      var $instruments, kitModel, length;
      kitModel = _this.view.appModel.get('kitModel');
      length = kitModel.get('instruments').toJSON().length;
      $instruments = _this.view.$el.find('.container-instruments').find('.instrument');
      $instruments.length.should.be.equal(length);
      _this.view.appModel.set('kitModel', _this.kitCollection.nextKit());
      kitModel = _this.view.appModel.get('kitModel');
      length = kitModel.get('instruments').toJSON().length;
      $instruments = _this.view.$el.find('.container-instruments').find('.instrument');
      return $instruments.length.should.be.equal(length);
    };
  })(this));
  return it('Should listen for selections from Instrument instances and update the model', (function(_this) {
    return function() {
      return _this.view.kitModel.should.trigger('change:currentInstrument').when(function() {
        var $selected;
        _this.view.instrumentViews[0].onClick();
        $selected = _this.view.$el.find('.container-instruments').find('.selected');
        return $selected.length.should.equal(1);
      });
    };
  })(this));
});


},{"../../../../../../src/scripts/config/AppConfig.coffee":6,"../../../../../../src/scripts/models/AppModel.coffee":9,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/views/create/components/instruments/InstrumentSelectionPanel.coffee":24}],54:[function(require,module,exports){
var PatternSquare, PatternSquareModel;

PatternSquareModel = require('../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee');

PatternSquare = require('../../../../../../src/scripts/views/create/components/sequencer/PatternSquare.coffee');

describe('Pattern Square', function() {
  beforeEach((function(_this) {
    return function() {
      _this.view = new PatternSquare({
        model: new PatternSquareModel()
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
  it('Should cycle through velocity volumes', (function(_this) {
    return function() {
      _this.view.onClick();
      _this.view.model.get('velocity').should.equal(1);
      _this.view.$el.hasClass('velocity-low').should.be["true"];
      _this.view.onClick();
      _this.view.model.get('velocity').should.equal(2);
      _this.view.$el.hasClass('velocity-medium').should.be["true"];
      _this.view.onClick();
      _this.view.model.get('velocity').should.equal(3);
      _this.view.$el.hasClass('velocity-high').should.be["true"];
      _this.view.onClick();
      _this.view.model.get('velocity').should.equal(0);
      return _this.view.$el.hasClass('velocity-high').should.be["false"];
    };
  })(this));
  it('Should toggle off', (function(_this) {
    return function() {
      _this.view.disable();
      return _this.view.model.get('velocity').should.equal(0);
    };
  })(this));
  it('Should toggle on', (function(_this) {
    return function() {
      _this.view.onClick();
      _this.view.onClick();
      _this.view.onClick();
      _this.view.disable();
      _this.view.enable();
      return _this.view.model.get('velocity').should.equal(1);
    };
  })(this));
  return it('Should should flash when playing', (function(_this) {
    return function() {
      _this.view.flashOn();
      _this.view.$el.hasClass('flash').should.be["true"];
      _this.view.flashOff();
      return _this.view.$el.hasClass('flash').should.be["false"];
    };
  })(this));
});


},{"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":15,"../../../../../../src/scripts/views/create/components/sequencer/PatternSquare.coffee":27}],55:[function(require,module,exports){
var PatternSquareCollection, PatternSquareModel, PatternTrack, PatternTrackModel;

PatternSquareModel = require('../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee');

PatternSquareCollection = require('../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee');

PatternTrackModel = require('../../../../../../src/scripts/models/sequencer/PatternTrackModel.coffee');

PatternTrack = require('../../../../../../src/scripts/views/create/components/sequencer/PatternTrack.coffee');

describe('Pattern Track', function() {
  beforeEach((function(_this) {
    return function() {
      var squares;
      squares = [];
      _(8).times(function() {
        return squares.push(new PatternSquareModel());
      });
      _this.view = new PatternTrack({
        collection: new PatternSquareCollection(squares)
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
  it('Should render out child squares', (function(_this) {
    return function() {
      return _this.view.$el.find('.pattern-square').length.should.equal(8);
    };
  })(this));
  it('Should listen for changes to the pattern squares', (function(_this) {
    return function() {
      return _this.view.collection.should.trigger('change:velocity').when(function() {
        return _this.view.patternSquareViews[0].onClick();
      });
    };
  })(this));
  it('Should dispatch changes back to the parent', (function(_this) {
    return function() {};
  })(this));
  return it('Should update each PatternSquare model when the kit changes', (function(_this) {
    return function() {};
  })(this));
});


},{"../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee":14,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":15,"../../../../../../src/scripts/models/sequencer/PatternTrackModel.coffee":16,"../../../../../../src/scripts/views/create/components/sequencer/PatternTrack.coffee":28}],56:[function(require,module,exports){
var Sequencer;

Sequencer = require('../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee');

describe('Sequencer', function() {
  beforeEach((function(_this) {
    return function() {
      return _this.view = new Sequencer();
    };
  })(this));
  afterEach((function(_this) {
    return function() {
      return _this.view.remove();
    };
  })(this));
  it('Should render', function() {});
  it('Should render out each pattern track', (function(_this) {
    return function() {};
  })(this));
  it('Should update each pattern track when the kit changes', (function(_this) {
    return function() {};
  })(this));
  it('Should play', (function(_this) {
    return function() {};
  })(this));
  it('Should notifiy each track where its playstate is', (function(_this) {
    return function() {};
  })(this));
  it('Should listen for tempo changes', (function(_this) {
    return function() {};
  })(this));
  it('Should be mutable', (function(_this) {
    return function() {};
  })(this));
  it('Should be able to globally update its volume', (function(_this) {
    return function() {};
  })(this));
  return it('Should be labeled properly', (function(_this) {
    return function() {};
  })(this));
});


},{"../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee":29}],57:[function(require,module,exports){
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


},{"../../../../src/scripts/AppController.coffee":5,"../../../../src/scripts/views/landing/LandingView.coffee":36}],58:[function(require,module,exports){
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


},{"../../../../src/scripts/views/share/ShareView.coffee":38}]},{},[42])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9iYXNlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy91dGlscy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvcnVudGltZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL0FwcENvbnRyb2xsZXIuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9ldmVudHMvQXBwRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL2luc3RydW1lbnRzL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2tNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy91dGlscy9QdWJTdWIuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdGlvblBhbmVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL3RlbXBsYXRlcy9pbnN0cnVtZW50LXBhbmVsLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL3RlbXBsYXRlcy9pbnN0cnVtZW50LXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2suY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3BhdHRlcm4tc3F1YXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci90ZW1wbGF0ZXMvcGF0dGVybi10cmFjay10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3NlcXVlbmNlci10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy90ZW1wbGF0ZXMvYnBtLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3RlbXBsYXRlcy9raXQtc2VsZWN0aW9uLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS90ZW1wbGF0ZXMvY3JlYXRlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy90ZW1wbGF0ZXMvbGFuZGluZy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9zaGFyZS9TaGFyZVZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvdGVtcGxhdGVzL3NoYXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3Rlc3RzL1Rlc3RzVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy90ZXN0cy90ZXN0cy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMtcnVubmVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9BcHBDb250cm9sbGVyLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9LaXRDb2xsZWN0aW9uLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9LaXRNb2RlbC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9tb2RlbHMvUGF0dGVyblRyYWNrTW9kZWwtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvbW9kZWxzL1NvdW5kQ29sbGVjdGlvbi1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9tb2RlbHMvU291bmRNb2RlbC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3Itc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0aW9uLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdGlvblBhbmVsLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2stc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLHNFQUFBO0VBQUE7aVNBQUE7O0FBQUEsUUFRQSxHQUFjLE9BQUEsQ0FBUSwwQkFBUixDQVJkLENBQUE7O0FBQUEsU0FTQSxHQUFjLE9BQUEsQ0FBUSw0QkFBUixDQVRkLENBQUE7O0FBQUEsV0FVQSxHQUFjLE9BQUEsQ0FBUSxvQ0FBUixDQVZkLENBQUE7O0FBQUEsVUFXQSxHQUFjLE9BQUEsQ0FBUSxrQ0FBUixDQVhkLENBQUE7O0FBQUEsU0FZQSxHQUFjLE9BQUEsQ0FBUSxnQ0FBUixDQVpkLENBQUE7O0FBQUE7QUFrQkcsa0NBQUEsQ0FBQTs7OztHQUFBOztBQUFBLDBCQUFBLFNBQUEsR0FBVyxTQUFYLENBQUE7O0FBQUEsMEJBR0EsVUFBQSxHQUFZLFNBQUMsT0FBRCxHQUFBO0FBRVQsSUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLEdBQUEsQ0FBQSxRQUFaLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLFdBRmYsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFNBQUQsR0FBZSxHQUFBLENBQUEsU0FIZixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsVUFBRCxHQUFlLEdBQUEsQ0FBQSxVQUpmLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUEsU0FBQSxDQUNkO0FBQUEsTUFBQSxhQUFBLEVBQWUsSUFBZjtBQUFBLE1BQ0EsUUFBQSxFQUFVLElBQUMsQ0FBQSxRQURYO0tBRGMsQ0FOakIsQ0FBQTtXQVVBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBWlM7RUFBQSxDQUhaLENBQUE7O0FBQUEsMEJBdUJBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTCxJQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBQSxDQUFFLE1BQUYsQ0FBVCxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsRUFBZixDQURBLENBQUE7V0FHQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQWpCLENBQ0c7QUFBQSxNQUFBLFNBQUEsRUFBVyxLQUFYO0tBREgsRUFKSztFQUFBLENBdkJSLENBQUE7O0FBQUEsMEJBbUNBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTCxJQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBYixDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FEQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBQSxDQUZBLENBQUE7V0FJQSxJQUFDLENBQUEsb0JBQUQsQ0FBQSxFQUxLO0VBQUEsQ0FuQ1IsQ0FBQTs7QUFBQSwwQkFnREEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO1dBQ2hCLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFFBQVgsRUFBcUIsYUFBckIsRUFBb0MsSUFBQyxDQUFBLFlBQXJDLEVBRGdCO0VBQUEsQ0FoRG5CLENBQUE7O0FBQUEsMEJBd0RBLG9CQUFBLEdBQXNCLFNBQUEsR0FBQTtXQUNuQixJQUFDLENBQUEsYUFBRCxDQUFBLEVBRG1CO0VBQUEsQ0F4RHRCLENBQUE7O0FBQUEsMEJBc0VBLFlBQUEsR0FBYyxTQUFDLEtBQUQsR0FBQTtBQUNYLFFBQUEseUJBQUE7QUFBQSxJQUFBLFlBQUEsR0FBZSxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBekMsQ0FBQTtBQUFBLElBQ0EsV0FBQSxHQUFlLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFEN0IsQ0FBQTtBQUdBLElBQUEsSUFBRyxZQUFIO0FBQXFCLE1BQUEsWUFBWSxDQUFDLElBQWIsQ0FDbEI7QUFBQSxRQUFBLE1BQUEsRUFBUSxJQUFSO09BRGtCLENBQUEsQ0FBckI7S0FIQTtBQUFBLElBT0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksV0FBVyxDQUFDLE1BQVosQ0FBQSxDQUFvQixDQUFDLEVBQWpDLENBUEEsQ0FBQTtXQVNBLFdBQVcsQ0FBQyxJQUFaLENBQUEsRUFWVztFQUFBLENBdEVkLENBQUE7O3VCQUFBOztHQUh5QixRQUFRLENBQUMsS0FmckMsQ0FBQTs7QUFBQSxNQXVHTSxDQUFDLE9BQVAsR0FBaUIsYUF2R2pCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxTQUFBOztBQUFBLFNBUUEsR0FNRztBQUFBLEVBQUEsTUFBQSxFQUNHO0FBQUEsSUFBQSxJQUFBLEVBQVEsU0FBUjtBQUFBLElBQ0EsS0FBQSxFQUFRLE9BRFI7QUFBQSxJQUVBLElBQUEsRUFBUSxNQUZSO0FBQUEsSUFHQSxNQUFBLEVBQVEsUUFIUjtHQURIO0FBQUEsRUFVQSxHQUFBLEVBQUssR0FWTDtBQUFBLEVBZ0JBLE9BQUEsRUFBUyxHQWhCVDtBQUFBLEVBc0JBLFlBQUEsRUFBYyxDQXRCZDtBQUFBLEVBNEJBLGVBQUEsRUFBaUIsU0FBQyxTQUFELEdBQUE7V0FDZCxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsR0FBZSxHQUFmLEdBQXFCLElBQUMsQ0FBQSxNQUFPLENBQUEsU0FBQSxFQURmO0VBQUEsQ0E1QmpCO0FBQUEsRUFtQ0EsbUJBQUEsRUFBcUIsU0FBQyxTQUFELEdBQUE7V0FDbEIsYUFBQSxHQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQXhCLEdBQStCLEdBQS9CLEdBQXFDLElBQUMsQ0FBQSxNQUFPLENBQUEsU0FBQSxFQUQzQjtFQUFBLENBbkNyQjtDQWRILENBQUE7O0FBQUEsTUFzRE0sQ0FBQyxPQUFQLEdBQWlCLFNBdERqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsUUFBQTs7QUFBQSxRQVFBLEdBRUc7QUFBQSxFQUFBLFVBQUEsRUFBbUIsaUJBQW5CO0FBQUEsRUFDQSxVQUFBLEVBQW1CLFlBRG5CO0FBQUEsRUFFQSxpQkFBQSxFQUFtQiwwQkFGbkI7QUFBQSxFQUdBLGVBQUEsRUFBbUIsaUJBSG5CO0NBVkgsQ0FBQTs7QUFBQSxNQWdCTSxDQUFDLE9BQVAsR0FBaUIsUUFoQmpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxNQUFBOztBQUFBLE1BUUEsR0FFRztBQUFBLEVBQUEsS0FBQSxFQUFPLGVBQVA7Q0FWSCxDQUFBOztBQUFBLE1BYU0sQ0FBQyxPQUFQLEdBQWlCLE1BYmpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxvQkFBQTs7QUFBQSxTQU9BLEdBQVksT0FBQSxDQUFRLDRCQUFSLENBUFosQ0FBQTs7QUFBQSxTQVVBLEdBQVksUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFmLENBR1Q7QUFBQSxFQUFBLFFBQUEsRUFDRztBQUFBLElBQUEsTUFBQSxFQUFlLElBQWY7QUFBQSxJQUNBLFVBQUEsRUFBZSxJQURmO0FBQUEsSUFJQSxLQUFBLEVBQWUsU0FBUyxDQUFDLEdBSnpCO0dBREg7Q0FIUyxDQVZaLENBQUE7O0FBQUEsTUFxQk0sQ0FBQyxPQUFQLEdBQWlCLFNBckJqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEscUNBQUE7RUFBQTtpU0FBQTs7QUFBQSxlQU9BLEdBQWtCLE9BQUEsQ0FBUSwwQkFBUixDQVBsQixDQUFBOztBQUFBO0FBYUcseUNBQUEsQ0FBQTs7OztHQUFBOztBQUFBLGlDQUFBLEtBQUEsR0FBTyxlQUFQLENBQUE7OzhCQUFBOztHQUhnQyxRQUFRLENBQUMsV0FWNUMsQ0FBQTs7QUFBQSxNQWdCTSxDQUFDLE9BQVAsR0FBaUIsb0JBaEJqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsZUFBQTtFQUFBO2lTQUFBOztBQUFBO0FBVUcsb0NBQUEsQ0FBQTs7OztHQUFBOztBQUFBLDRCQUFBLFFBQUEsR0FDRztBQUFBLElBQUEsTUFBQSxFQUFXLElBQVg7QUFBQSxJQUNBLE9BQUEsRUFBVyxJQURYO0FBQUEsSUFFQSxLQUFBLEVBQVcsSUFGWDtHQURILENBQUE7O3lCQUFBOztHQUgyQixRQUFRLENBQUMsTUFQdkMsQ0FBQTs7QUFBQSxNQWdCTSxDQUFDLE9BQVAsR0FBaUIsZUFoQmpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxrQ0FBQTtFQUFBO2lTQUFBOztBQUFBLFNBT0EsR0FBWSxPQUFBLENBQVEsK0JBQVIsQ0FQWixDQUFBOztBQUFBLFFBUUEsR0FBWSxPQUFBLENBQVEsbUJBQVIsQ0FSWixDQUFBOztBQUFBO0FBaUJHLGtDQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSwwQkFBQSxHQUFBLEdBQUssRUFBQSxHQUFFLENBQUEsU0FBUyxDQUFDLGVBQVYsQ0FBMEIsTUFBMUIsQ0FBQSxDQUFGLEdBQXFDLGtCQUExQyxDQUFBOztBQUFBLDBCQU1BLEtBQUEsR0FBTyxRQU5QLENBQUE7O0FBQUEsMEJBWUEsS0FBQSxHQUFPLENBWlAsQ0FBQTs7QUFBQSwwQkFnQkEsS0FBQSxHQUFPLFNBQUMsUUFBRCxHQUFBO0FBQ0osUUFBQSxlQUFBO0FBQUEsSUFBQSxTQUFBLEdBQVksUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUE1QixDQUFBO0FBQUEsSUFDQSxJQUFBLEdBQU8sUUFBUSxDQUFDLElBRGhCLENBQUE7QUFBQSxJQUdBLElBQUEsR0FBTyxDQUFDLENBQUMsR0FBRixDQUFNLElBQU4sRUFBWSxTQUFDLEdBQUQsR0FBQTtBQUNoQixNQUFBLEdBQUcsQ0FBQyxJQUFKLEdBQVcsU0FBQSxHQUFZLEdBQVosR0FBa0IsR0FBRyxDQUFDLE1BQWpDLENBQUE7QUFDQSxhQUFPLEdBQVAsQ0FGZ0I7SUFBQSxDQUFaLENBSFAsQ0FBQTtBQU9BLFdBQU8sSUFBUCxDQVJJO0VBQUEsQ0FoQlAsQ0FBQTs7QUFBQSwwQkFnQ0EsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNWLFFBQUEsYUFBQTtBQUFBLElBQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFQLENBQUE7QUFFQSxJQUFBLElBQUcsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQUFaO0FBQ0csTUFBQSxJQUFDLENBQUEsS0FBRCxFQUFBLENBREg7S0FBQSxNQUFBO0FBSUcsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLEdBQUEsR0FBTSxDQUFmLENBSkg7S0FGQTtXQVFBLFFBQUEsR0FBVyxJQUFDLENBQUEsRUFBRCxDQUFJLElBQUMsQ0FBQSxLQUFMLEVBVEQ7RUFBQSxDQWhDYixDQUFBOztBQUFBLDBCQWlEQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ04sUUFBQSxhQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFoQixDQUFBO0FBRUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFELEdBQVMsR0FBWjtBQUNHLE1BQUEsSUFBQyxDQUFBLEtBQUQsRUFBQSxDQURIO0tBQUEsTUFBQTtBQUlHLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQUFULENBSkg7S0FGQTtXQVFBLFFBQUEsR0FBVyxJQUFDLENBQUEsRUFBRCxDQUFJLElBQUMsQ0FBQSxLQUFMLEVBVEw7RUFBQSxDQWpEVCxDQUFBOzt1QkFBQTs7R0FOeUIsUUFBUSxDQUFDLFdBWHJDLENBQUE7O0FBQUEsTUErRU0sQ0FBQyxPQUFQLEdBQWlCLGFBL0VqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsOEJBQUE7RUFBQTtpU0FBQTs7QUFBQSxvQkFPQSxHQUF1QixPQUFBLENBQVEsNENBQVIsQ0FQdkIsQ0FBQTs7QUFBQTtBQWFHLDZCQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSxxQkFBQSxRQUFBLEdBQ0c7QUFBQSxJQUFBLE9BQUEsRUFBWSxJQUFaO0FBQUEsSUFDQSxNQUFBLEVBQVksSUFEWjtBQUFBLElBRUEsUUFBQSxFQUFZLElBRlo7QUFBQSxJQUtBLGFBQUEsRUFBaUIsSUFMakI7QUFBQSxJQVFBLG1CQUFBLEVBQXFCLElBUnJCO0dBREgsQ0FBQTs7QUFBQSxxQkFtQkEsS0FBQSxHQUFPLFNBQUMsUUFBRCxHQUFBO0FBQ0osSUFBQSxDQUFDLENBQUMsSUFBRixDQUFPLFFBQVEsQ0FBQyxXQUFoQixFQUE2QixTQUFDLFVBQUQsR0FBQTthQUMxQixVQUFVLENBQUMsR0FBWCxHQUFpQixRQUFRLENBQUMsSUFBVCxHQUFnQixHQUFoQixHQUFzQixVQUFVLENBQUMsSUFEeEI7SUFBQSxDQUE3QixDQUFBLENBQUE7QUFBQSxJQUdBLFFBQVEsQ0FBQyxXQUFULEdBQTJCLElBQUEsb0JBQUEsQ0FBcUIsUUFBUSxDQUFDLFdBQTlCLENBSDNCLENBQUE7V0FLQSxTQU5JO0VBQUEsQ0FuQlAsQ0FBQTs7a0JBQUE7O0dBSG9CLFFBQVEsQ0FBQyxNQVZoQyxDQUFBOztBQUFBLE1BMkNNLENBQUMsT0FBUCxHQUFpQixRQTNDakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLHNEQUFBO0VBQUE7aVNBQUE7O0FBQUEsU0FPQSxHQUFxQixPQUFBLENBQVEsK0JBQVIsQ0FQckIsQ0FBQTs7QUFBQSxrQkFRQSxHQUFxQixPQUFBLENBQVEsNkJBQVIsQ0FSckIsQ0FBQTs7QUFBQTtBQWNHLDRDQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSxvQ0FBQSxLQUFBLEdBQU8sa0JBQVAsQ0FBQTs7aUNBQUE7O0dBSG1DLFFBQVEsQ0FBQyxXQVgvQyxDQUFBOztBQUFBLE1BaUJNLENBQUMsT0FBUCxHQUFpQix1QkFqQmpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSw2QkFBQTtFQUFBO2lTQUFBOztBQUFBLFNBT0EsR0FBWSxPQUFBLENBQVEsK0JBQVIsQ0FQWixDQUFBOztBQUFBO0FBYUcsdUNBQUEsQ0FBQTs7OztHQUFBOztBQUFBLCtCQUFBLFFBQUEsR0FDRztBQUFBLElBQUEsVUFBQSxFQUFvQixDQUFwQjtBQUFBLElBQ0Esa0JBQUEsRUFBb0IsQ0FEcEI7QUFBQSxJQUVBLFFBQUEsRUFBb0IsS0FGcEI7R0FESCxDQUFBOztBQUFBLCtCQU1BLFVBQUEsR0FBWSxTQUFDLE9BQUQsR0FBQTtBQUNULElBQUEsbURBQU0sT0FBTixDQUFBLENBQUE7V0FFQSxJQUFDLENBQUEsRUFBRCxDQUFJLGlCQUFKLEVBQXVCLElBQUMsQ0FBQSxnQkFBeEIsRUFIUztFQUFBLENBTlosQ0FBQTs7QUFBQSwrQkFhQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ0osUUFBQSxRQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLENBQVgsQ0FBQTtBQUVBLElBQUEsSUFBRyxRQUFBLEdBQVcsU0FBUyxDQUFDLFlBQXhCO0FBQ0csTUFBQSxRQUFBLEVBQUEsQ0FESDtLQUFBLE1BQUE7QUFJRyxNQUFBLFFBQUEsR0FBVyxDQUFYLENBSkg7S0FGQTtXQVNBLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxFQUFpQixRQUFqQixFQVZJO0VBQUEsQ0FiUCxDQUFBOztBQUFBLCtCQTJCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO1dBQ0wsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLEVBQWlCLENBQWpCLEVBREs7RUFBQSxDQTNCUixDQUFBOztBQUFBLCtCQWlDQSxPQUFBLEdBQVMsU0FBQSxHQUFBO1dBQ04sSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLEVBQWlCLENBQWpCLEVBRE07RUFBQSxDQWpDVCxDQUFBOztBQUFBLCtCQXNDQSxnQkFBQSxHQUFrQixTQUFDLEtBQUQsR0FBQTtBQUNmLFFBQUEsUUFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxrQkFBTCxFQUF5QixLQUFLLENBQUMsbUJBQW1CLENBQUMsUUFBbkQsQ0FBQSxDQUFBO0FBQUEsSUFFQSxRQUFBLEdBQVcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUZ6QixDQUFBO0FBSUEsSUFBQSxJQUFHLFFBQUEsR0FBVyxDQUFkO2FBQ0csSUFBQyxDQUFBLEdBQUQsQ0FBSyxRQUFMLEVBQWUsSUFBZixFQURIO0tBQUEsTUFHSyxJQUFHLFFBQUEsS0FBWSxDQUFmO2FBQ0YsSUFBQyxDQUFBLEdBQUQsQ0FBSyxRQUFMLEVBQWUsS0FBZixFQURFO0tBUlU7RUFBQSxDQXRDbEIsQ0FBQTs7NEJBQUE7O0dBSDhCLFFBQVEsQ0FBQyxNQVYxQyxDQUFBOztBQUFBLE1BaUVNLENBQUMsT0FBUCxHQUFpQixrQkFqRWpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxpQkFBQTtFQUFBO2lTQUFBOztBQUFBO0FBU0csc0NBQUEsQ0FBQTs7OztHQUFBOztBQUFBLDhCQUFBLFFBQUEsR0FDRztBQUFBLElBQUEsUUFBQSxFQUFjLElBQWQ7QUFBQSxJQUNBLFFBQUEsRUFBYyxJQURkO0dBREgsQ0FBQTs7MkJBQUE7O0dBRjZCLFFBQVEsQ0FBQyxNQVB6QyxDQUFBOztBQUFBLE1BY00sQ0FBQyxPQUFQLEdBQWlCLGlCQWRqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEscU5BQUE7RUFBQTs7aVNBQUE7O0FBQUEsU0FPQSxHQUFjLE9BQUEsQ0FBUSw0QkFBUixDQVBkLENBQUE7O0FBQUEsTUFRQSxHQUFjLE9BQUEsQ0FBUSxpQkFBUixDQVJkLENBQUE7O0FBQUEsUUFTQSxHQUFjLE9BQUEsQ0FBUSwyQkFBUixDQVRkLENBQUE7O0FBQUEsU0FjQSxHQUFnQixPQUFBLENBQVEsaUNBQVIsQ0FkaEIsQ0FBQTs7QUFBQSxZQWdCQSxHQUFnQixPQUFBLENBQVEsZ0RBQVIsQ0FoQmhCLENBQUE7O0FBQUEsYUFpQkEsR0FBZ0IsT0FBQSxDQUFRLHFDQUFSLENBakJoQixDQUFBOztBQUFBLFFBa0JBLEdBQWdCLE9BQUEsQ0FBUSxnQ0FBUixDQWxCaEIsQ0FBQTs7QUFBQSxZQW9CQSxHQUFnQixPQUFBLENBQVEsZ0RBQVIsQ0FwQmhCLENBQUE7O0FBQUEsd0JBcUJBLEdBQTJCLE9BQUEsQ0FBUSx3RUFBUixDQXJCM0IsQ0FBQTs7QUFBQSxhQXVCQSxHQUFnQixPQUFBLENBQVEsMkRBQVIsQ0F2QmhCLENBQUE7O0FBQUEsa0JBd0JBLEdBQXFCLE9BQUEsQ0FBUSwrQ0FBUixDQXhCckIsQ0FBQTs7QUFBQSx1QkF5QkEsR0FBMEIsT0FBQSxDQUFRLG9EQUFSLENBekIxQixDQUFBOztBQUFBLFlBMEJBLEdBQWdCLE9BQUEsQ0FBUSwwREFBUixDQTFCaEIsQ0FBQTs7QUFBQSxTQTJCQSxHQUFrQixPQUFBLENBQVEsdURBQVIsQ0EzQmxCLENBQUE7O0FBQUE7QUFpQ0csOEJBQUEsQ0FBQTs7Ozs7R0FBQTs7QUFBQSxzQkFBQSxNQUFBLEdBQ0c7QUFBQSxJQUFBLEVBQUEsRUFBZ0IsY0FBaEI7QUFBQSxJQUNBLFFBQUEsRUFBZ0IsYUFEaEI7QUFBQSxJQUVBLE9BQUEsRUFBZ0IsWUFGaEI7QUFBQSxJQUtBLE9BQUEsRUFBd0IsT0FMeEI7QUFBQSxJQU1BLGVBQUEsRUFBd0IsbUJBTnhCO0FBQUEsSUFPQSxlQUFBLEVBQXdCLG1CQVB4QjtBQUFBLElBUUEscUJBQUEsRUFBd0IseUJBUnhCO0FBQUEsSUFTQSxnQkFBQSxFQUF3QixvQkFUeEI7QUFBQSxJQVVBLGVBQUEsRUFBd0IsbUJBVnhCO0FBQUEsSUFXQSxXQUFBLEVBQXdCLGdCQVh4QjtHQURILENBQUE7O0FBQUEsc0JBZ0JBLFVBQUEsR0FBWSxTQUFDLE9BQUQsR0FBQTtBQUNULElBQUMsSUFBQyxDQUFBLHdCQUFBLGFBQUYsRUFBaUIsSUFBQyxDQUFBLG1CQUFBLFFBQWxCLENBQUE7V0FFQSxNQUFNLENBQUMsRUFBUCxDQUFVLFFBQVEsQ0FBQyxLQUFuQixFQUEwQixJQUFDLENBQUEsYUFBM0IsRUFIUztFQUFBLENBaEJaLENBQUE7O0FBQUEsc0JBdUJBLGFBQUEsR0FBZSxTQUFDLE1BQUQsR0FBQTtBQUNaLFFBQUEsS0FBQTtBQUFBLElBQUMsUUFBUyxPQUFULEtBQUQsQ0FBQTtXQUVBLElBQUMsQ0FBQSxRQUFELENBQVUsS0FBVixFQUFpQjtBQUFBLE1BQUUsT0FBQSxFQUFTLElBQVg7S0FBakIsRUFIWTtFQUFBLENBdkJmLENBQUE7O0FBQUEsc0JBOEJBLFlBQUEsR0FBYyxTQUFBLEdBQUE7V0FDWCxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLElBQUMsQ0FBQSxhQUFhLENBQUMsV0FBckMsRUFEVztFQUFBLENBOUJkLENBQUE7O0FBQUEsc0JBbUNBLFdBQUEsR0FBYSxTQUFBLEdBQUE7V0FDVixJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLElBQUMsQ0FBQSxhQUFhLENBQUMsVUFBckMsRUFEVTtFQUFBLENBbkNiLENBQUE7O0FBQUEsc0JBd0NBLFVBQUEsR0FBWSxTQUFBLEdBQUE7V0FDVCxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBckMsRUFEUztFQUFBLENBeENaLENBQUE7O0FBQUEsc0JBb0RBLEtBQUEsR0FBTyxTQUFBLEdBQUE7QUFDSixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBVyxJQUFBLFNBQUEsQ0FBQSxDQUFYLENBQUE7V0FFQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLElBQXRCLEVBSEk7RUFBQSxDQXBEUCxDQUFBOztBQUFBLHNCQTREQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFDaEIsUUFBQSxZQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsRUFBVCxDQUFBO0FBQUEsSUFFQSxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsS0FBTCxDQUFXLFNBQUMsS0FBRCxHQUFBO2FBQ1IsTUFBTSxDQUFDLElBQVAsQ0FBZ0IsSUFBQSxRQUFBLENBQVM7QUFBQSxRQUFDLEtBQUEsRUFBUSxNQUFBLEdBQUssS0FBZDtPQUFULENBQWhCLEVBRFE7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBS0EsSUFBQSxHQUFXLElBQUEsWUFBQSxDQUNSO0FBQUEsTUFBQSxRQUFBLEVBQVUsSUFBQyxDQUFBLFFBQVg7QUFBQSxNQUNBLGFBQUEsRUFBbUIsSUFBQSxhQUFBLENBQWMsTUFBZCxFQUFzQjtBQUFBLFFBQ3RDLFFBQUEsRUFBVSxJQUFDLENBQUEsUUFEMkI7T0FBdEIsQ0FEbkI7S0FEUSxDQUxYLENBQUE7V0FXQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLElBQXRCLEVBWmdCO0VBQUEsQ0E1RG5CLENBQUE7O0FBQUEsc0JBNkVBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNoQixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBVyxJQUFBLFlBQUEsQ0FDUjtBQUFBLE1BQUEsUUFBQSxFQUFVLElBQUMsQ0FBQSxRQUFYO0tBRFEsQ0FBWCxDQUFBO0FBQUEsSUFHQSxJQUFJLENBQUMsTUFBTCxDQUFBLENBSEEsQ0FBQTtXQUtBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE1BQWQsRUFBc0IsSUFBdEIsRUFOZ0I7RUFBQSxDQTdFbkIsQ0FBQTs7QUFBQSxzQkF3RkEsdUJBQUEsR0FBeUIsU0FBQSxHQUFBO0FBQ3RCLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxhQUFBLENBQ2xCO0FBQUEsTUFBQSxLQUFBLEVBQU8sSUFBUDtLQURrQixDQUFyQixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsQ0FDRztBQUFBLE1BQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxNQUNBLEdBQUEsRUFBSyxTQUFTLENBQUMsZUFBVixDQUEwQixNQUExQixDQUFBLEdBQW9DLEdBQXBDLEdBQTBDLGlCQUQvQztLQURILENBSEEsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsVUFBZCxFQUEwQixJQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsQ0FBbEIsQ0FBMUIsQ0FQQSxDQUFBO0FBQUEsSUFTQSxJQUFBLEdBQVcsSUFBQSx3QkFBQSxDQUNSO0FBQUEsTUFBQSxhQUFBLEVBQWUsSUFBQyxDQUFBLGFBQWhCO0FBQUEsTUFDQSxRQUFBLEVBQVUsSUFBQyxDQUFBLFFBRFg7S0FEUSxDQVRYLENBQUE7V0FhQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLElBQXRCLEVBZHNCO0VBQUEsQ0F4RnpCLENBQUE7O0FBQUEsc0JBMkdBLGtCQUFBLEdBQW9CLFNBQUEsR0FBQTtBQUNqQixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBVyxJQUFBLGFBQUEsQ0FDUjtBQUFBLE1BQUEsS0FBQSxFQUFXLElBQUEsa0JBQUEsQ0FBQSxDQUFYO0tBRFEsQ0FBWCxDQUFBO1dBR0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxFQUFzQixJQUF0QixFQUppQjtFQUFBLENBM0dwQixDQUFBOztBQUFBLHNCQW1IQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFDaEIsUUFBQSxhQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsRUFBVixDQUFBO0FBQUEsSUFFQSxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsS0FBTCxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFDUixPQUFPLENBQUMsSUFBUixDQUFpQixJQUFBLGtCQUFBLENBQUEsQ0FBakIsRUFEUTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFLQSxJQUFBLEdBQVcsSUFBQSxZQUFBLENBQ1I7QUFBQSxNQUFBLFVBQUEsRUFBZ0IsSUFBQSx1QkFBQSxDQUF3QixPQUF4QixDQUFoQjtLQURRLENBTFgsQ0FBQTtXQVFBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE1BQWQsRUFBc0IsSUFBdEIsRUFUZ0I7RUFBQSxDQW5IbkIsQ0FBQTs7QUFBQSxzQkFnSUEsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDYixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBVyxJQUFBLFNBQUEsQ0FBQSxDQUFYLENBQUE7V0FFQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLElBQXRCLEVBSGE7RUFBQSxDQWhJaEIsQ0FBQTs7bUJBQUE7O0dBSHFCLFFBQVEsQ0FBQyxPQTlCakMsQ0FBQTs7QUFBQSxNQXlLTSxDQUFDLE9BQVAsR0FBaUIsU0F6S2pCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxJQUFBOztBQUFBLElBUUEsR0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQWQsQ0FPSjtBQUFBLEVBQUEsVUFBQSxFQUFZLFNBQUMsT0FBRCxHQUFBO1dBQ1QsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQVksQ0FBQyxDQUFDLFFBQUYsQ0FBWSxPQUFBLEdBQVUsT0FBQSxJQUFXLElBQUMsQ0FBQSxRQUFsQyxFQUE0QyxJQUFDLENBQUEsUUFBRCxJQUFhLEVBQXpELENBQVosRUFEUztFQUFBLENBQVo7QUFBQSxFQVlBLE1BQUEsRUFBUSxTQUFDLFlBQUQsR0FBQTtBQUNMLElBQUEsWUFBQSxHQUFlLFlBQUEsSUFBZ0IsRUFBL0IsQ0FBQTtBQUVBLElBQUEsSUFBRyxJQUFDLENBQUEsUUFBSjtBQUdHLE1BQUEsSUFBRyxJQUFDLENBQUEsS0FBRCxZQUFrQixRQUFRLENBQUMsS0FBOUI7QUFDRyxRQUFBLFlBQUEsR0FBZSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUFmLENBREg7T0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsSUFBQyxDQUFBLFFBQUQsQ0FBVyxZQUFYLENBQVYsQ0FIQSxDQUhIO0tBRkE7QUFBQSxJQVVBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FWQSxDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQVhBLENBQUE7V0FhQSxLQWRLO0VBQUEsQ0FaUjtBQUFBLEVBa0NBLE1BQUEsRUFBUSxTQUFDLE9BQUQsR0FBQTtBQUNMLElBQUEsSUFBQyxDQUFBLG9CQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBQSxDQURBLENBQUE7V0FFQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxFQUhLO0VBQUEsQ0FsQ1I7QUFBQSxFQThDQSxJQUFBLEVBQU0sU0FBQyxPQUFELEdBQUE7V0FDSCxRQUFRLENBQUMsR0FBVCxDQUFhLElBQUMsQ0FBQSxHQUFkLEVBQW1CO0FBQUEsTUFBRSxTQUFBLEVBQVcsQ0FBYjtLQUFuQixFQURHO0VBQUEsQ0E5Q047QUFBQSxFQXVEQSxJQUFBLEVBQU0sU0FBQyxPQUFELEdBQUE7V0FDSCxRQUFRLENBQUMsR0FBVCxDQUFhLElBQUMsQ0FBQSxHQUFkLEVBQ0c7QUFBQSxNQUFBLFNBQUEsRUFBVyxDQUFYO0FBQUEsTUFDQSxVQUFBLEVBQVksQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNULFVBQUEsc0JBQUcsT0FBTyxDQUFFLGVBQVo7bUJBQ0csS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQURIO1dBRFM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURaO0tBREgsRUFERztFQUFBLENBdkROO0FBQUEsRUFvRUEsaUJBQUEsRUFBbUIsU0FBQSxHQUFBLENBcEVuQjtBQUFBLEVBMkVBLG9CQUFBLEVBQXNCLFNBQUEsR0FBQTtXQUNuQixJQUFDLENBQUEsYUFBRCxDQUFBLEVBRG1CO0VBQUEsQ0EzRXRCO0NBUEksQ0FSUCxDQUFBOztBQUFBLE1BK0ZNLENBQUMsT0FBUCxHQUFpQixJQS9GakIsQ0FBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSwwQkFBQTtFQUFBO2lTQUFBOztBQUFBLElBT0EsR0FBVyxPQUFBLENBQVEsMEJBQVIsQ0FQWCxDQUFBOztBQUFBLFFBUUEsR0FBVyxPQUFBLENBQVEsaUNBQVIsQ0FSWCxDQUFBOztBQUFBO0FBYUcsK0JBQUEsQ0FBQTs7OztHQUFBOztBQUFBLHVCQUFBLFFBQUEsR0FBVSxRQUFWLENBQUE7O29CQUFBOztHQUZzQixLQVh6QixDQUFBOztBQUFBLE1BZ0JNLENBQUMsT0FBUCxHQUFpQixVQWhCakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLGlEQUFBO0VBQUE7O2lTQUFBOztBQUFBLFNBT0EsR0FBWSxPQUFBLENBQVEsa0NBQVIsQ0FQWixDQUFBOztBQUFBLFFBUUEsR0FBWSxPQUFBLENBQVEsaUNBQVIsQ0FSWixDQUFBOztBQUFBLElBU0EsR0FBWSxPQUFBLENBQVEsNkJBQVIsQ0FUWixDQUFBOztBQUFBLFFBVUEsR0FBWSxPQUFBLENBQVEsOEJBQVIsQ0FWWixDQUFBOztBQUFBO0FBbUJHLGlDQUFBLENBQUE7Ozs7O0dBQUE7O0FBQUEseUJBQUEsUUFBQSxHQUFVLElBQVYsQ0FBQTs7QUFBQSx5QkFNQSxRQUFBLEdBQVUsUUFOVixDQUFBOztBQUFBLHlCQWFBLGtCQUFBLEdBQW9CLEVBYnBCLENBQUE7O0FBQUEseUJBbUJBLGNBQUEsR0FBZ0IsSUFuQmhCLENBQUE7O0FBQUEseUJBeUJBLGlCQUFBLEdBQW1CLENBekJuQixDQUFBOztBQUFBLHlCQThCQSxNQUFBLEdBQ0c7QUFBQSxJQUFBLDBCQUFBLEVBQTRCLG1CQUE1QjtBQUFBLElBQ0EsMEJBQUEsRUFBNEIsbUJBRDVCO0FBQUEsSUFFQSwwQkFBQSxFQUE0QixTQUY1QjtBQUFBLElBR0EsMEJBQUEsRUFBNEIsU0FINUI7R0EvQkgsQ0FBQTs7QUFBQSx5QkEyQ0EsTUFBQSxHQUFRLFNBQUMsT0FBRCxHQUFBO0FBQ0wsSUFBQSx5Q0FBTSxPQUFOLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFNBQUQsR0FBZSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxZQUFWLENBRmYsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxlQUFWLENBSGYsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxlQUFWLENBSmYsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLEtBQWQsQ0FBaEIsQ0FOQSxDQUFBO1dBUUEsS0FUSztFQUFBLENBM0NSLENBQUE7O0FBQUEseUJBMkRBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtXQUNoQixJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxRQUFYLEVBQXFCLFFBQVEsQ0FBQyxVQUE5QixFQUEwQyxJQUFDLENBQUEsV0FBM0MsRUFEZ0I7RUFBQSxDQTNEbkIsQ0FBQTs7QUFBQSx5QkFvRUEsV0FBQSxHQUFhLFNBQUEsR0FBQTtXQUNWLElBQUMsQ0FBQSxjQUFELEdBQWtCLFdBQUEsQ0FBWSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBQzNCLFlBQUEsR0FBQTtBQUFBLFFBQUEsR0FBQSxHQUFNLEtBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLEtBQWQsQ0FBTixDQUFBO0FBRUEsUUFBQSxJQUFHLEdBQUEsR0FBTSxTQUFTLENBQUMsT0FBbkI7QUFDRyxVQUFBLEdBQUEsSUFBTyxLQUFDLENBQUEsaUJBQVIsQ0FESDtTQUFBLE1BQUE7QUFJRyxVQUFBLEdBQUEsR0FBTSxTQUFTLENBQUMsT0FBaEIsQ0FKSDtTQUZBO2VBUUEsS0FBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsS0FBZCxFQUFxQixHQUFyQixFQVQyQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVosRUFXaEIsSUFBQyxDQUFBLGtCQVhlLEVBRFI7RUFBQSxDQXBFYixDQUFBOztBQUFBLHlCQXdGQSxXQUFBLEdBQWEsU0FBQSxHQUFBO1dBQ1YsSUFBQyxDQUFBLGNBQUQsR0FBa0IsV0FBQSxDQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDM0IsWUFBQSxHQUFBO0FBQUEsUUFBQSxHQUFBLEdBQU0sS0FBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsS0FBZCxDQUFOLENBQUE7QUFFQSxRQUFBLElBQUcsR0FBQSxHQUFNLENBQVQ7QUFDRyxVQUFBLEdBQUEsSUFBTyxLQUFDLENBQUEsaUJBQVIsQ0FESDtTQUFBLE1BQUE7QUFJRyxVQUFBLEdBQUEsR0FBTSxDQUFOLENBSkg7U0FGQTtlQVFBLEtBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLEtBQWQsRUFBcUIsR0FBckIsRUFUMkI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLEVBV2hCLElBQUMsQ0FBQSxrQkFYZSxFQURSO0VBQUEsQ0F4RmIsQ0FBQTs7QUFBQSx5QkFtSEEsaUJBQUEsR0FBbUIsU0FBQyxLQUFELEdBQUE7V0FDaEIsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQURnQjtFQUFBLENBbkhuQixDQUFBOztBQUFBLHlCQTZIQSxpQkFBQSxHQUFtQixTQUFDLEtBQUQsR0FBQTtXQUNoQixJQUFDLENBQUEsV0FBRCxDQUFBLEVBRGdCO0VBQUEsQ0E3SG5CLENBQUE7O0FBQUEseUJBdUlBLE9BQUEsR0FBUyxTQUFDLEtBQUQsR0FBQTtBQUNOLElBQUEsYUFBQSxDQUFjLElBQUMsQ0FBQSxjQUFmLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxjQUFELEdBQWtCLEtBRlo7RUFBQSxDQXZJVCxDQUFBOztBQUFBLHlCQWlKQSxXQUFBLEdBQWEsU0FBQyxLQUFELEdBQUE7V0FDVixJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUE5QixFQURVO0VBQUEsQ0FqSmIsQ0FBQTs7c0JBQUE7O0dBTndCLEtBYjNCLENBQUE7O0FBQUEsTUEwS00sQ0FBQyxPQUFQLEdBQWlCLFlBMUtqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsc0NBQUE7RUFBQTtpU0FBQTs7QUFBQSxRQU9BLEdBQVcsT0FBQSxDQUFRLGlDQUFSLENBUFgsQ0FBQTs7QUFBQSxJQVFBLEdBQVcsT0FBQSxDQUFRLDZCQUFSLENBUlgsQ0FBQTs7QUFBQSxRQVNBLEdBQVcsT0FBQSxDQUFRLHdDQUFSLENBVFgsQ0FBQTs7QUFBQTtBQWtCRyxpQ0FBQSxDQUFBOzs7O0dBQUE7O0FBQUEseUJBQUEsUUFBQSxHQUFVLElBQVYsQ0FBQTs7QUFBQSx5QkFNQSxhQUFBLEdBQWUsSUFOZixDQUFBOztBQUFBLHlCQVlBLFFBQUEsR0FBVSxJQVpWLENBQUE7O0FBQUEseUJBa0JBLFFBQUEsR0FBVSxRQWxCVixDQUFBOztBQUFBLHlCQXNCQSxNQUFBLEdBQ0c7QUFBQSxJQUFBLG9CQUFBLEVBQXdCLGdCQUF4QjtBQUFBLElBQ0EscUJBQUEsRUFBd0IsaUJBRHhCO0dBdkJILENBQUE7O0FBQUEseUJBaUNBLE1BQUEsR0FBUSxTQUFDLE9BQUQsR0FBQTtBQUNMLElBQUEseUNBQU0sT0FBTixDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsWUFBVixDQUZiLENBQUE7QUFJQSxJQUFBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsVUFBZCxDQUFBLEtBQTZCLElBQWhDO0FBQ0csTUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxVQUFkLEVBQTBCLElBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixDQUFsQixDQUExQixDQUFBLENBREg7S0FKQTtBQUFBLElBT0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFVBQWQsQ0FBeUIsQ0FBQyxHQUExQixDQUE4QixPQUE5QixDQUFoQixDQVBBLENBQUE7V0FTQSxLQVZLO0VBQUEsQ0FqQ1IsQ0FBQTs7QUFBQSx5QkFtREEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO1dBQ2hCLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFFBQVgsRUFBcUIsUUFBUSxDQUFDLFVBQTlCLEVBQTBDLElBQUMsQ0FBQSxXQUEzQyxFQURnQjtFQUFBLENBbkRuQixDQUFBOztBQUFBLHlCQWlFQSxjQUFBLEdBQWdCLFNBQUMsS0FBRCxHQUFBO1dBQ2IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsVUFBZCxFQUEwQixJQUFDLENBQUEsYUFBYSxDQUFDLFdBQWYsQ0FBQSxDQUExQixFQURhO0VBQUEsQ0FqRWhCLENBQUE7O0FBQUEseUJBMEVBLGVBQUEsR0FBaUIsU0FBQyxLQUFELEdBQUE7V0FDZCxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxVQUFkLEVBQTBCLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBQTFCLEVBRGM7RUFBQSxDQTFFakIsQ0FBQTs7QUFBQSx5QkFtRkEsV0FBQSxHQUFhLFNBQUMsS0FBRCxHQUFBO0FBQ1YsSUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBMUIsQ0FBQTtXQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxPQUFkLENBQWhCLEVBRlU7RUFBQSxDQW5GYixDQUFBOztzQkFBQTs7R0FOd0IsS0FaM0IsQ0FBQTs7QUFBQSxNQW9ITSxDQUFDLE9BQVAsR0FBaUIsWUFwSGpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7Ozs7R0FBQTtBQUFBLElBQUEsb0NBQUE7RUFBQTtpU0FBQTs7QUFBQSxRQVNBLEdBQWMsT0FBQSxDQUFRLG9DQUFSLENBVGQsQ0FBQTs7QUFBQSxJQVVBLEdBQWMsT0FBQSxDQUFRLGdDQUFSLENBVmQsQ0FBQTs7QUFBQSxRQVdBLEdBQWMsT0FBQSxDQUFRLHFDQUFSLENBWGQsQ0FBQTs7QUFBQTtBQW9CRywrQkFBQSxDQUFBOzs7O0dBQUE7O0FBQUEsdUJBQUEsU0FBQSxHQUFXLFlBQVgsQ0FBQTs7QUFBQSx1QkFNQSxRQUFBLEdBQVUsUUFOVixDQUFBOztBQUFBLHVCQVlBLEtBQUEsR0FBTyxJQVpQLENBQUE7O0FBQUEsdUJBa0JBLFFBQUEsR0FBVSxJQWxCVixDQUFBOztBQUFBLHVCQXNCQSxNQUFBLEdBQ0c7QUFBQSxJQUFBLFVBQUEsRUFBWSxTQUFaO0dBdkJILENBQUE7O0FBQUEsdUJBK0JBLE9BQUEsR0FBUyxTQUFDLEtBQUQsR0FBQTtBQUNOLElBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsbUJBQWQsRUFBbUMsSUFBQyxDQUFBLEtBQXBDLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLFVBQWQsRUFGTTtFQUFBLENBL0JULENBQUE7O29CQUFBOztHQU5zQixLQWR6QixDQUFBOztBQUFBLE1BeURNLENBQUMsT0FBUCxHQUFpQixVQXpEakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLDhEQUFBO0VBQUE7O2lTQUFBOztBQUFBLFFBT0EsR0FBYyxPQUFBLENBQVEsb0NBQVIsQ0FQZCxDQUFBOztBQUFBLElBUUEsR0FBYyxPQUFBLENBQVEsZ0NBQVIsQ0FSZCxDQUFBOztBQUFBLFVBU0EsR0FBYyxPQUFBLENBQVEscUJBQVIsQ0FUZCxDQUFBOztBQUFBLFFBVUEsR0FBYyxPQUFBLENBQVEsMkNBQVIsQ0FWZCxDQUFBOztBQUFBO0FBbUJHLDZDQUFBLENBQUE7Ozs7OztHQUFBOztBQUFBLHFDQUFBLFFBQUEsR0FBVSxRQUFWLENBQUE7O0FBQUEscUNBTUEsUUFBQSxHQUFVLElBTlYsQ0FBQTs7QUFBQSxxQ0FZQSxhQUFBLEdBQWUsSUFaZixDQUFBOztBQUFBLHFDQWtCQSxRQUFBLEdBQVUsSUFsQlYsQ0FBQTs7QUFBQSxxQ0F3QkEsZUFBQSxHQUFpQixJQXhCakIsQ0FBQTs7QUFBQSxxQ0E0QkEsTUFBQSxHQUNHO0FBQUEsSUFBQSxhQUFBLEVBQWUsYUFBZjtHQTdCSCxDQUFBOztBQUFBLHFDQXFDQSxVQUFBLEdBQVksU0FBQyxPQUFELEdBQUE7QUFDVCxJQUFBLHlEQUFNLE9BQU4sQ0FBQSxDQUFBO1dBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxVQUFkLEVBSEg7RUFBQSxDQXJDWixDQUFBOztBQUFBLHFDQWdEQSxNQUFBLEdBQVEsU0FBQyxPQUFELEdBQUE7QUFDTCxJQUFBLHFEQUFNLE9BQU4sQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHdCQUFWLENBRmQsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FKQSxDQUFBO1dBTUEsS0FQSztFQUFBLENBaERSLENBQUE7O0FBQUEscUNBOERBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNoQixJQUFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLEVBQW5CLENBQUE7V0FFQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxhQUFkLENBQTRCLENBQUMsSUFBN0IsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsS0FBRCxHQUFBO0FBQy9CLFlBQUEsVUFBQTtBQUFBLFFBQUEsVUFBQSxHQUFpQixJQUFBLFVBQUEsQ0FDZDtBQUFBLFVBQUEsUUFBQSxFQUFVLEtBQUMsQ0FBQSxRQUFYO0FBQUEsVUFDQSxLQUFBLEVBQU8sS0FEUDtTQURjLENBQWpCLENBQUE7QUFBQSxRQUlBLEtBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixVQUFVLENBQUMsTUFBWCxDQUFBLENBQW1CLENBQUMsRUFBdkMsQ0FKQSxDQUFBO2VBS0EsS0FBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFzQixVQUF0QixFQU4rQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLEVBSGdCO0VBQUEsQ0E5RG5CLENBQUE7O0FBQUEscUNBOEVBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNoQixJQUFBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFFBQVgsRUFBcUIsUUFBUSxDQUFDLFVBQTlCLEVBQTBDLElBQUMsQ0FBQSxXQUEzQyxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxRQUFYLEVBQXFCLFFBQVEsQ0FBQyxpQkFBOUIsRUFBaUQsSUFBQyxDQUFBLGtCQUFsRCxFQUZnQjtFQUFBLENBOUVuQixDQUFBOztBQUFBLHFDQXNGQSxvQkFBQSxHQUFzQixTQUFBLEdBQUE7V0FDbkIsSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQURtQjtFQUFBLENBdEZ0QixDQUFBOztBQUFBLHFDQXNHQSxXQUFBLEdBQWEsU0FBQyxLQUFELEdBQUE7QUFDVixJQUFBLElBQUMsQ0FBQSxvQkFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBRjFCLENBQUE7QUFBQSxJQUlBLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLGVBQVIsRUFBeUIsU0FBQyxVQUFELEdBQUE7YUFDdEIsVUFBVSxDQUFDLE1BQVgsQ0FBQSxFQURzQjtJQUFBLENBQXpCLENBSkEsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FQQSxDQUFBO1dBUUEsSUFBQyxDQUFBLGlCQUFELENBQUEsRUFUVTtFQUFBLENBdEdiLENBQUE7O0FBQUEscUNBb0hBLGtCQUFBLEdBQW9CLFNBQUMsS0FBRCxHQUFBO1dBQ2pCLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixhQUFqQixDQUErQixDQUFDLFdBQWhDLENBQTRDLFVBQTVDLEVBRGlCO0VBQUEsQ0FwSHBCLENBQUE7O0FBQUEscUNBMkhBLFdBQUEsR0FBYSxTQUFDLEtBQUQsR0FBQTtXQUNWLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFVBQWQsRUFBMEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FBMUIsRUFEVTtFQUFBLENBM0hiLENBQUE7O2tDQUFBOztHQU5vQyxLQWJ2QyxDQUFBOztBQUFBLE1BcUpNLENBQUMsT0FBUCxHQUFpQix3QkFySmpCLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLGtEQUFBO0VBQUE7aVNBQUE7O0FBQUEsU0FPQSxHQUFjLE9BQUEsQ0FBUSxxQ0FBUixDQVBkLENBQUE7O0FBQUEsUUFRQSxHQUFjLE9BQUEsQ0FBUSxvQ0FBUixDQVJkLENBQUE7O0FBQUEsSUFTQSxHQUFjLE9BQUEsQ0FBUSxnQ0FBUixDQVRkLENBQUE7O0FBQUEsUUFVQSxHQUFjLE9BQUEsQ0FBUSx5Q0FBUixDQVZkLENBQUE7O0FBQUE7QUFnQkcsa0NBQUEsQ0FBQTs7OztHQUFBOztBQUFBLDBCQUFBLFNBQUEsR0FBVyxnQkFBWCxDQUFBOztBQUFBLDBCQUVBLE9BQUEsR0FBUyxJQUZULENBQUE7O0FBQUEsMEJBSUEsUUFBQSxHQUFVLFFBSlYsQ0FBQTs7QUFBQSwwQkFPQSxNQUFBLEdBQ0c7QUFBQSxJQUFBLFVBQUEsRUFBWSxTQUFaO0dBUkgsQ0FBQTs7QUFBQSwwQkFXQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7V0FDaEIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsS0FBWCxFQUFrQixRQUFRLENBQUMsZUFBM0IsRUFBNEMsSUFBQyxDQUFBLGdCQUE3QyxFQURnQjtFQUFBLENBWG5CLENBQUE7O0FBQUEsMEJBZ0JBLE1BQUEsR0FBUSxTQUFBLEdBQUE7V0FDTCxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxFQURLO0VBQUEsQ0FoQlIsQ0FBQTs7QUFBQSwwQkFvQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtXQUNOLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBLEVBRE07RUFBQSxDQXBCVCxDQUFBOztBQUFBLDBCQXdCQSxPQUFBLEdBQVMsU0FBQSxHQUFBO1dBQ04sSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWMsT0FBZCxFQURNO0VBQUEsQ0F4QlQsQ0FBQTs7QUFBQSwwQkE2QkEsUUFBQSxHQUFVLFNBQUEsR0FBQTtXQUNQLElBQUMsQ0FBQSxHQUFHLENBQUMsV0FBTCxDQUFpQixPQUFqQixFQURPO0VBQUEsQ0E3QlYsQ0FBQTs7QUFBQSwwQkFzQ0EsT0FBQSxHQUFTLFNBQUMsS0FBRCxHQUFBO1dBQ04sSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUEsRUFETTtFQUFBLENBdENULENBQUE7O0FBQUEsMEJBMkNBLGdCQUFBLEdBQWtCLFNBQUMsS0FBRCxHQUFBO0FBQ2YsUUFBQSx1QkFBQTtBQUFBLElBQUEsUUFBQSxHQUFXLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBekIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLENBQWlCLDRDQUFqQixDQUZBLENBQUE7QUFBQSxJQUlBLGFBQUE7QUFBZ0IsY0FBTyxRQUFQO0FBQUEsYUFDUixDQURRO2lCQUNELGVBREM7QUFBQSxhQUVSLENBRlE7aUJBRUQsa0JBRkM7QUFBQSxhQUdSLENBSFE7aUJBR0QsZ0JBSEM7QUFBQTtpQkFJUixHQUpRO0FBQUE7UUFKaEIsQ0FBQTtXQVVBLElBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLGFBQWQsRUFYZTtFQUFBLENBM0NsQixDQUFBOzt1QkFBQTs7R0FIeUIsS0FiNUIsQ0FBQTs7QUFBQSxNQTRFTSxDQUFDLE9BQVAsR0FBaUIsYUE1RWpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSwyQ0FBQTtFQUFBO2lTQUFBOztBQUFBLGFBT0EsR0FBaUIsT0FBQSxDQUFRLHdCQUFSLENBUGpCLENBQUE7O0FBQUEsSUFRQSxHQUFpQixPQUFBLENBQVEsZ0NBQVIsQ0FSakIsQ0FBQTs7QUFBQSxRQVNBLEdBQWlCLE9BQUEsQ0FBUSx3Q0FBUixDQVRqQixDQUFBOztBQUFBO0FBY0csaUNBQUEsQ0FBQTs7OztHQUFBOztBQUFBLHlCQUFBLFNBQUEsR0FBVyxlQUFYLENBQUE7O0FBQUEseUJBQ0EsT0FBQSxHQUFTLElBRFQsQ0FBQTs7QUFBQSx5QkFFQSxRQUFBLEdBQVUsUUFGVixDQUFBOztBQUFBLHlCQUtBLE1BQUEsR0FBUSxTQUFDLE9BQUQsR0FBQTtBQUNMLElBQUEseUNBQU0sT0FBTixDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxvQkFBRCxDQUFBLENBRkEsQ0FBQTtXQUlBLEtBTEs7RUFBQSxDQUxSLENBQUE7O0FBQUEseUJBYUEsb0JBQUEsR0FBc0IsU0FBQSxHQUFBO0FBQ25CLElBQUEsSUFBQyxDQUFBLGtCQUFELEdBQXNCLEVBQXRCLENBQUE7V0FFQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsS0FBRCxHQUFBO0FBQ2QsWUFBQSxhQUFBO0FBQUEsUUFBQSxhQUFBLEdBQW9CLElBQUEsYUFBQSxDQUNqQjtBQUFBLFVBQUEsS0FBQSxFQUFPLEtBQVA7U0FEaUIsQ0FBcEIsQ0FBQTtBQUFBLFFBR0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxLQUFDLENBQUEsR0FBYixDQUhBLENBQUE7QUFBQSxRQUlBLEtBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFZLGFBQWEsQ0FBQyxNQUFkLENBQUEsQ0FBc0IsQ0FBQyxFQUFuQyxDQUpBLENBQUE7ZUFNQSxLQUFDLENBQUEsa0JBQWtCLENBQUMsSUFBcEIsQ0FBeUIsYUFBekIsRUFQYztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCLEVBSG1CO0VBQUEsQ0FidEIsQ0FBQTs7c0JBQUE7O0dBRndCLEtBWjNCLENBQUE7O0FBQUEsTUE0Q00sQ0FBQyxPQUFQLEdBQWlCLFlBNUNqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEseUJBQUE7RUFBQTtpU0FBQTs7QUFBQSxJQU9BLEdBQVcsT0FBQSxDQUFRLGdDQUFSLENBUFgsQ0FBQTs7QUFBQSxRQVFBLEdBQVcsT0FBQSxDQUFRLG9DQUFSLENBUlgsQ0FBQTs7QUFBQTtBQWFHLDhCQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSxzQkFBQSxRQUFBLEdBQVUsUUFBVixDQUFBOzttQkFBQTs7R0FGcUIsS0FYeEIsQ0FBQTs7QUFBQSxNQWdCTSxDQUFDLE9BQVAsR0FBaUIsU0FoQmpCLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSw2Q0FBQTtFQUFBO2lTQUFBOztBQUFBLE1BT0EsR0FBVyxPQUFBLENBQVEsb0JBQVIsQ0FQWCxDQUFBOztBQUFBLFFBUUEsR0FBVyxPQUFBLENBQVEsOEJBQVIsQ0FSWCxDQUFBOztBQUFBLElBU0EsR0FBVyxPQUFBLENBQVEsMEJBQVIsQ0FUWCxDQUFBOztBQUFBLFFBVUEsR0FBVyxPQUFBLENBQVEsa0NBQVIsQ0FWWCxDQUFBOztBQUFBO0FBZ0JHLGdDQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSx3QkFBQSxRQUFBLEdBQVUsUUFBVixDQUFBOztBQUFBLHdCQUdBLE1BQUEsR0FDRztBQUFBLElBQUEscUJBQUEsRUFBdUIsaUJBQXZCO0dBSkgsQ0FBQTs7QUFBQSx3QkFPQSxlQUFBLEdBQWlCLFNBQUMsS0FBRCxHQUFBO1dBQ2QsTUFBTSxDQUFDLE9BQVAsQ0FBZSxRQUFRLENBQUMsS0FBeEIsRUFDRztBQUFBLE1BQUEsS0FBQSxFQUFPLFFBQVA7S0FESCxFQURjO0VBQUEsQ0FQakIsQ0FBQTs7cUJBQUE7O0dBSHVCLEtBYjFCLENBQUE7O0FBQUEsTUE2Qk0sQ0FBQyxPQUFQLEdBQWlCLFdBN0JqQixDQUFBOzs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSx5QkFBQTtFQUFBO2lTQUFBOztBQUFBLElBT0EsR0FBVyxPQUFBLENBQVEsMEJBQVIsQ0FQWCxDQUFBOztBQUFBLFFBUUEsR0FBVyxPQUFBLENBQVEsZ0NBQVIsQ0FSWCxDQUFBOztBQUFBO0FBYUcsOEJBQUEsQ0FBQTs7OztHQUFBOztBQUFBLHNCQUFBLFFBQUEsR0FBVSxRQUFWLENBQUE7O21CQUFBOztHQUZxQixLQVh4QixDQUFBOztBQUFBLE1BaUJNLENBQUMsT0FBUCxHQUFpQixTQWpCakIsQ0FBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEseUJBQUE7RUFBQTtpU0FBQTs7QUFBQSxJQU9BLEdBQVcsT0FBQSxDQUFRLDBCQUFSLENBUFgsQ0FBQTs7QUFBQSxRQVFBLEdBQVcsT0FBQSxDQUFRLHNCQUFSLENBUlgsQ0FBQTs7QUFBQTtBQWFHLDhCQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSxzQkFBQSxRQUFBLEdBQVUsUUFBVixDQUFBOzttQkFBQTs7R0FGcUIsS0FYeEIsQ0FBQTs7QUFBQSxNQWdCTSxDQUFDLE9BQVAsR0FBaUIsU0FoQmpCLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BLFFBQUEsQ0FBUyxRQUFULEVBQW1CLENBQUEsU0FBQSxLQUFBLEdBQUE7U0FBQSxTQUFBLEdBQUE7QUFFaEIsSUFBQSxPQUFBLENBQVEsNkNBQVIsQ0FBQSxDQUFBO0FBQUEsSUFDQSxPQUFBLENBQVEseUNBQVIsQ0FEQSxDQUFBO1dBRUEsT0FBQSxDQUFRLG9DQUFSLEVBSmdCO0VBQUEsRUFBQTtBQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsQ0FBQSxDQUFBOztBQUFBLFFBT0EsQ0FBUyxPQUFULEVBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7U0FBQSxTQUFBLEdBQUE7QUFFZixJQUFBLE9BQUEsQ0FBUSw4Q0FBUixDQUFBLENBQUE7QUFBQSxJQUNBLE9BQUEsQ0FBUSx5REFBUixDQURBLENBQUE7QUFBQSxJQUVBLE9BQUEsQ0FBUSx5REFBUixDQUZBLENBQUE7QUFBQSxJQUtBLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBLEdBQUE7QUFFN0IsTUFBQSxPQUFBLENBQVEsaUZBQVIsQ0FBQSxDQUFBO2FBQ0EsT0FBQSxDQUFRLG1FQUFSLEVBSDZCO0lBQUEsQ0FBaEMsQ0FMQSxDQUFBO1dBV0EsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQSxHQUFBO0FBRW5CLE1BQUEsT0FBQSxDQUFRLG9FQUFSLENBQUEsQ0FBQTtBQUFBLE1BQ0EsT0FBQSxDQUFRLG1FQUFSLENBREEsQ0FBQTthQUVBLE9BQUEsQ0FBUSxnRUFBUixFQUptQjtJQUFBLENBQXRCLEVBYmU7RUFBQSxFQUFBO0FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQixDQVBBLENBQUE7O0FBQUEsT0E0QkEsQ0FBUSwwQ0FBUixDQTVCQSxDQUFBOztBQUFBLE9BNkJBLENBQVEsNENBQVIsQ0E3QkEsQ0FBQTs7QUFBQSxPQWlDQSxDQUFRLDJDQUFSLENBakNBLENBQUE7O0FBQUEsT0FrQ0EsQ0FBUSxzQ0FBUixDQWxDQSxDQUFBOztBQUFBLE9BcUNBLENBQVEsa0NBQVIsQ0FyQ0EsQ0FBQTs7OztBQ0RBLElBQUEsYUFBQTs7QUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSx3Q0FBUixDQUFoQixDQUFBOztBQUFBLFFBR0EsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7U0FFeEIsRUFBQSxDQUFHLG1CQUFILEVBQXdCLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEIsRUFGd0I7QUFBQSxDQUEzQixDQUhBLENBQUE7Ozs7QUNBQSxJQUFBLHdCQUFBOztBQUFBLFNBQUEsR0FBZ0IsT0FBQSxDQUFRLDhDQUFSLENBQWhCLENBQUE7O0FBQUEsYUFDQSxHQUFnQixPQUFBLENBQVEsdURBQVIsQ0FEaEIsQ0FBQTs7QUFBQSxRQUdBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQSxHQUFBO0FBRXhCLEVBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDUixNQUFBLEtBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUNsQjtBQUFBLFFBQUEsS0FBQSxFQUFPLElBQVA7T0FEa0IsQ0FBckIsQ0FBQTthQUdBLEtBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUNHO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFFBQ0EsR0FBQSxFQUFLLFNBQVMsQ0FBQyxtQkFBVixDQUE4QixNQUE5QixDQUFBLEdBQXdDLEdBQXhDLEdBQThDLGlCQURuRDtPQURILEVBSlE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLEVBU0EsRUFBQSxDQUFHLHFFQUFILEVBQTBFLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDdkUsS0FBQyxDQUFBLGFBQWEsQ0FBQyxFQUFmLENBQWtCLENBQWxCLENBQW9CLENBQUMsR0FBckIsQ0FBeUIsTUFBekIsQ0FBZ0MsQ0FBQyxNQUFNLENBQUMsTUFEK0I7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExRSxDQVRBLENBQUE7QUFBQSxFQWFBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQzlCLFVBQUEsWUFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLEtBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFBLENBQVYsQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLEtBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBRE4sQ0FBQTthQUVBLEdBQUcsQ0FBQyxHQUFKLENBQVEsT0FBUixDQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUF4QixDQUE4QixPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBekMsRUFIOEI7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQyxDQWJBLENBQUE7U0FtQkEsRUFBQSxDQUFHLGdDQUFILEVBQXFDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDbEMsVUFBQSxZQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsS0FBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQUEsQ0FBVixDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sS0FBQyxDQUFBLGFBQWEsQ0FBQyxXQUFmLENBQUEsQ0FETixDQUFBO2FBRUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxPQUFSLENBQWdCLENBQUMsTUFBTSxDQUFDLEtBQXhCLENBQThCLE9BQVEsQ0FBQSxPQUFPLENBQUMsTUFBUixHQUFlLENBQWYsQ0FBaUIsQ0FBQyxLQUF4RCxFQUhrQztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJDLEVBckJ3QjtBQUFBLENBQTNCLENBSEEsQ0FBQTs7OztBQ0FBLElBQUEseUNBQUE7O0FBQUEsU0FBQSxHQUFnQixPQUFBLENBQVEsOENBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxRQUNBLEdBQWdCLE9BQUEsQ0FBUSxrREFBUixDQURoQixDQUFBOztBQUFBLG9CQUVBLEdBQXVCLE9BQUEsQ0FBUSxxRUFBUixDQUZ2QixDQUFBOztBQUFBLFFBSUEsQ0FBUyxXQUFULEVBQXNCLFNBQUEsR0FBQTtBQUVuQixFQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBRVIsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU87QUFBQSxRQUNKLE9BQUEsRUFBUyxTQURMO0FBQUEsUUFFSixRQUFBLEVBQVUsU0FGTjtBQUFBLFFBR0osYUFBQSxFQUFlO1VBQ1o7QUFBQSxZQUNHLE9BQUEsRUFBUyxjQURaO0FBQUEsWUFFRyxLQUFBLEVBQU8sV0FGVjtBQUFBLFlBR0csTUFBQSxFQUFRLG1CQUhYO1dBRFksRUFNWjtBQUFBLFlBQ0csT0FBQSxFQUFTLFdBRFo7QUFBQSxZQUVHLEtBQUEsRUFBTyxXQUZWO0FBQUEsWUFHRyxNQUFBLEVBQVEsZUFIWDtXQU5ZO1NBSFg7T0FBUCxDQUFBO2FBaUJBLEtBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsUUFBQSxDQUFTLElBQVQsRUFBZTtBQUFBLFFBQUUsS0FBQSxFQUFPLElBQVQ7T0FBZixFQW5CUjtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FBQSxDQUFBO1NBc0JBLEVBQUEsQ0FBRyxpRkFBSCxFQUFzRixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ25GLEtBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLGFBQWQsQ0FBNEIsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFELENBQXpDLENBQXFELG9CQUFyRCxFQURtRjtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRGLEVBeEJtQjtBQUFBLENBQXRCLENBSkEsQ0FBQTs7OztBQ0FBLElBQUEsaUJBQUE7O0FBQUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLGdFQUFSLENBQXBCLENBQUE7O0FBQUEsUUFHQSxDQUFTLHFCQUFULEVBQWdDLFNBQUEsR0FBQTtTQUU3QixFQUFBLENBQUcsY0FBSCxFQUFtQixTQUFBLEdBQUEsQ0FBbkIsRUFGNkI7QUFBQSxDQUFoQyxDQUhBLENBQUE7Ozs7QUNFQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO1NBRTFCLEVBQUEsQ0FBRyxvQ0FBSCxFQUF5QyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpDLEVBRjBCO0FBQUEsQ0FBN0IsQ0FBQSxDQUFBOzs7O0FDQUEsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO1NBRXJCLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZELEVBRnFCO0FBQUEsQ0FBeEIsQ0FBQSxDQUFBOzs7O0FDRkEsSUFBQSxVQUFBOztBQUFBLFVBQUEsR0FBYSxPQUFBLENBQVMsd0RBQVQsQ0FBYixDQUFBOztBQUFBLFFBR0EsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUVyQixFQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ1IsTUFBQSxLQUFDLENBQUEsSUFBRCxHQUFRLEdBQUEsQ0FBQSxVQUFSLENBQUE7YUFDQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQUZRO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxFQUtBLFNBQUEsQ0FBVSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ1AsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFETztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVYsQ0FMQSxDQUFBO1NBU0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUNqQixNQUFBLENBQU8sS0FBQyxDQUFBLElBQUksQ0FBQyxFQUFiLENBQWdCLENBQUMsRUFBRSxDQUFDLE1BREg7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixFQVhxQjtBQUFBLENBQXhCLENBSEEsQ0FBQTs7OztBQ0FBLElBQUEsMkNBQUE7O0FBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSx3RUFBUixDQUFmLENBQUE7O0FBQUEsUUFDQSxHQUFlLE9BQUEsQ0FBUSxtREFBUixDQURmLENBQUE7O0FBQUEsUUFFQSxHQUFlLE9BQUEsQ0FBUSxtREFBUixDQUZmLENBQUE7O0FBQUEsU0FHQSxHQUFlLE9BQUEsQ0FBUSxvREFBUixDQUhmLENBQUE7O0FBQUEsUUFLQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBR3ZCLEVBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDUixNQUFBLEtBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxZQUFBLENBQ1Q7QUFBQSxRQUFBLFFBQUEsRUFBYyxJQUFBLFFBQUEsQ0FBQSxDQUFkO09BRFMsQ0FBWixDQUFBO2FBR0EsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFKUTtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsRUFPQSxTQUFBLENBQVUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBRyxLQUFDLENBQUEsSUFBSSxDQUFDLGNBQVQ7QUFBNkIsUUFBQSxhQUFBLENBQWMsS0FBQyxDQUFBLElBQUksQ0FBQyxjQUFwQixDQUFBLENBQTdCO09BQUE7YUFDQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQUZPO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVixDQVBBLENBQUE7QUFBQSxFQWFBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFFakIsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsTUFGSTtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBYkEsQ0FBQTtBQUFBLEVBbUJBLEVBQUEsQ0FBRyw2Q0FBSCxFQUFrRCxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBRS9DLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQVYsQ0FBZSxZQUFmLENBQVQsQ0FBQTthQUNBLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBYSxDQUFDLE1BQU0sQ0FBQyxLQUFyQixDQUEyQixNQUFBLENBQU8sS0FBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZixDQUFtQixLQUFuQixDQUFQLENBQTNCLEVBSCtDO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEQsQ0FuQkEsQ0FBQTtBQUFBLEVBMEJBLEVBQUEsQ0FBRyxzREFBSCxFQUEyRCxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQyxJQUFELEdBQUE7QUFFeEQsVUFBQSxRQUFBO0FBQUEsTUFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLGlCQUFOLEdBQTBCLEVBQTFCLENBQUE7QUFBQSxNQUNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsa0JBQU4sR0FBMkIsQ0FEM0IsQ0FBQTtBQUFBLE1BRUEsUUFBQSxHQUFXLEtBQUMsQ0FBQSxJQUFJLENBQUMsUUFGakIsQ0FBQTtBQUFBLE1BR0EsUUFBUSxDQUFDLEdBQVQsQ0FBYSxLQUFiLEVBQW9CLENBQXBCLENBSEEsQ0FBQTtBQUFBLE1BS0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNSLFlBQUEsR0FBQTtBQUFBLFFBQUEsR0FBQSxHQUFNLFFBQVEsQ0FBQyxHQUFULENBQWEsS0FBYixDQUFOLENBQUE7QUFFQSxRQUFBLElBQUcsR0FBQSxJQUFPLEdBQVY7QUFDRyxVQUFBLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBQUEsQ0FBQTtpQkFDQSxJQUFBLENBQUEsRUFGSDtTQUhRO01BQUEsQ0FBWCxFQU1FLEdBTkYsQ0FMQSxDQUFBO2FBYUEsS0FBQyxDQUFBLElBQUksQ0FBQyxpQkFBTixDQUFBLEVBZndEO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0QsQ0ExQkEsQ0FBQTtTQTZDQSxFQUFBLENBQUcsc0NBQUgsRUFBMkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUV4QyxNQUFBLEtBQUMsQ0FBQSxJQUFJLENBQUMsaUJBQU4sQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUQ1QixDQUFBO0FBQUEsTUFFQSxLQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxDQUZBLENBQUE7YUFHQSxNQUFBLENBQU8sS0FBQyxDQUFBLElBQUksQ0FBQyxjQUFiLENBQTRCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFELEVBTE07SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxFQWhEdUI7QUFBQSxDQUExQixDQUxBLENBQUE7Ozs7QUNBQSxJQUFBLCtDQUFBOztBQUFBLFlBQUEsR0FBZ0IsT0FBQSxDQUFTLHdFQUFULENBQWhCLENBQUE7O0FBQUEsUUFDQSxHQUFnQixPQUFBLENBQVEsbURBQVIsQ0FEaEIsQ0FBQTs7QUFBQSxRQUVBLEdBQWdCLE9BQUEsQ0FBUSx3REFBUixDQUZoQixDQUFBOztBQUFBLGFBR0EsR0FBZ0IsT0FBQSxDQUFRLDZEQUFSLENBSGhCLENBQUE7O0FBQUEsUUFNQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBR3ZCLEVBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDUixVQUFBLE1BQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxFQUFULENBQUE7QUFBQSxNQUVBLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxLQUFMLENBQVcsU0FBQyxLQUFELEdBQUE7ZUFDUixNQUFNLENBQUMsSUFBUCxDQUFnQixJQUFBLFFBQUEsQ0FBUztBQUFBLFVBQUMsS0FBQSxFQUFRLE1BQUEsR0FBSyxLQUFkO1NBQVQsQ0FBaEIsRUFEUTtNQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsTUFNQSxLQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsWUFBQSxDQUNUO0FBQUEsUUFBQSxRQUFBLEVBQWMsSUFBQSxRQUFBLENBQUEsQ0FBZDtBQUFBLFFBQ0EsYUFBQSxFQUFtQixJQUFBLGFBQUEsQ0FBYyxNQUFkLENBRG5CO09BRFMsQ0FOWixDQUFBO2FBVUEsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFYUTtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsRUFjQSxTQUFBLENBQVUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUNQLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBRE87SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWLENBZEEsQ0FBQTtBQUFBLEVBb0JBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFFakIsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BRkE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQXBCQSxDQUFBO0FBQUEsRUEyQkEsRUFBQSxDQUFHLHFCQUFILEVBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFFdkIsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBVixDQUFlLFlBQWYsQ0FBVCxDQUFBO0FBQUEsTUFDQSxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQUMsQ0FBQSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQXBCLENBQXVCLENBQXZCLENBQXlCLENBQUMsR0FBMUIsQ0FBOEIsT0FBOUIsQ0FBWixDQURBLENBQUE7YUFFQSxNQUFNLENBQUMsSUFBUCxDQUFBLENBQWEsQ0FBQyxNQUFNLENBQUMsS0FBckIsQ0FBMkIsT0FBM0IsRUFKdUI7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQixDQTNCQSxDQUFBO1NBb0NBLEVBQUEsQ0FBRyw2Q0FBSCxFQUFrRCxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBRS9DLFVBQUEsdUNBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxLQUFDLENBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFWLENBQWUsWUFBZixDQUFULENBQUE7QUFBQSxNQUNBLFVBQUEsR0FBYSxLQUFDLENBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFwQixDQUF1QixDQUF2QixDQUF5QixDQUFDLEdBQTFCLENBQThCLE9BQTlCLENBRGIsQ0FBQTtBQUFBLE1BRUEsU0FBQSxHQUFhLEtBQUMsQ0FBQSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQXBCLENBQXVCLEtBQUMsQ0FBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQXBCLEdBQTJCLENBQWxELENBQW9ELENBQUMsR0FBckQsQ0FBeUQsT0FBekQsQ0FGYixDQUFBO0FBQUEsTUFJQSxRQUFBLEdBQVcsS0FBQyxDQUFBLElBQUksQ0FBQyxRQUpqQixDQUFBO0FBQUEsTUFNQSxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQWhCLENBQXdCLGlCQUF4QixDQUEwQyxDQUFDLElBQTNDLENBQWdELFNBQUEsR0FBQTtBQUM3QyxRQUFBLEtBQUMsQ0FBQSxJQUFJLENBQUMsY0FBTixDQUFBLENBQUEsQ0FBQTtlQUNBLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBYSxDQUFDLE1BQU0sQ0FBQyxLQUFyQixDQUEyQixTQUEzQixFQUY2QztNQUFBLENBQWhELENBTkEsQ0FBQTthQVVBLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBaEIsQ0FBd0IsaUJBQXhCLENBQTBDLENBQUMsSUFBM0MsQ0FBZ0QsU0FBQSxHQUFBO0FBQzdDLFFBQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxlQUFOLENBQUEsQ0FBQSxDQUFBO2VBQ0EsTUFBTSxDQUFDLElBQVAsQ0FBQSxDQUFhLENBQUMsTUFBTSxDQUFDLEtBQXJCLENBQTJCLFVBQTNCLEVBRjZDO01BQUEsQ0FBaEQsRUFaK0M7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsRCxFQXZDdUI7QUFBQSxDQUExQixDQU5BLENBQUE7Ozs7QUNBQSxJQUFBLG9CQUFBOztBQUFBLFVBQUEsR0FBYSxPQUFBLENBQVMscUZBQVQsQ0FBYixDQUFBOztBQUFBLFFBQ0EsR0FBYSxPQUFBLENBQVMsMkRBQVQsQ0FEYixDQUFBOztBQUFBLFFBSUEsQ0FBUyxZQUFULEVBQXVCLFNBQUEsR0FBQTtBQUdwQixFQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ1IsTUFBQSxLQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsVUFBQSxDQUNUO0FBQUEsUUFBQSxRQUFBLEVBQWMsSUFBQSxRQUFBLENBQUEsQ0FBZDtPQURTLENBQVosQ0FBQTthQUdBLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBSlE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLEVBT0EsU0FBQSxDQUFVLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDUCxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQURPO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVixDQVBBLENBQUE7QUFBQSxFQVlBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDakIsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsTUFESTtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBWkEsQ0FBQTtTQWdCQSxFQUFBLENBQUcseUNBQUgsRUFBOEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUMzQyxNQUFBLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBQUEsQ0FBQTthQUNBLE1BQUEsQ0FBTyxLQUFDLENBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFWLENBQW1CLFVBQW5CLENBQVAsQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQUQsRUFGRDtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDLEVBbkJvQjtBQUFBLENBQXZCLENBSkEsQ0FBQTs7OztBQ0FBLElBQUEsNERBQUE7O0FBQUEsd0JBQUEsR0FBMkIsT0FBQSxDQUFTLG1HQUFULENBQTNCLENBQUE7O0FBQUEsU0FDQSxHQUEyQixPQUFBLENBQVMsdURBQVQsQ0FEM0IsQ0FBQTs7QUFBQSxRQUVBLEdBQTJCLE9BQUEsQ0FBUyxzREFBVCxDQUYzQixDQUFBOztBQUFBLGFBR0EsR0FBMkIsT0FBQSxDQUFTLGdFQUFULENBSDNCLENBQUE7O0FBQUEsUUFNQSxDQUFTLDRCQUFULEVBQXVDLFNBQUEsR0FBQTtBQUdwQyxFQUFBLE1BQUEsQ0FBTyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ0osTUFBQSxLQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FDbEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxJQUFQO09BRGtCLENBQXJCLENBQUE7YUFHQSxLQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsQ0FDRztBQUFBLFFBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxRQUNBLEdBQUEsRUFBSyxTQUFTLENBQUMsbUJBQVYsQ0FBOEIsTUFBOUIsQ0FBQSxHQUF3QyxHQUF4QyxHQUE4QyxpQkFEbkQ7T0FESCxFQUpJO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUCxDQUFBLENBQUE7QUFBQSxFQVNBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ1IsTUFBQSxLQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLFFBQUEsQ0FBQSxDQUFoQixDQUFBO0FBQUEsTUFDQSxLQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxVQUFkLEVBQTBCLEtBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixDQUFsQixDQUExQixDQURBLENBQUE7QUFBQSxNQUdBLEtBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSx3QkFBQSxDQUNUO0FBQUEsUUFBQSxRQUFBLEVBQVUsS0FBQyxDQUFBLFFBQVg7T0FEUyxDQUhaLENBQUE7YUFNQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQVBRO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQVRBLENBQUE7QUFBQSxFQW1CQSxTQUFBLENBQVUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUNQLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBRE87SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWLENBbkJBLENBQUE7QUFBQSxFQXVCQSxFQUFBLENBQUcsZUFBSCxFQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ2pCLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BREk7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQXZCQSxDQUFBO0FBQUEsRUE0QkEsRUFBQSxDQUFHLGdFQUFILEVBQXFFLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFFbEUsTUFBQSxDQUFPLEtBQUMsQ0FBQSxJQUFJLENBQUMsUUFBYixDQUFzQixDQUFDLEVBQUUsQ0FBQyxNQUZ3QztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJFLENBNUJBLENBQUE7QUFBQSxFQWtDQSxFQUFBLENBQUcsdUZBQUgsRUFBNEYsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUV6RixVQUFBLFlBQUE7QUFBQSxNQUFBLEtBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQWYsQ0FBQSxDQUF1QixDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFyRCxDQUEyRCxDQUEzRCxDQUFBLENBQUE7QUFBQSxNQUVBLFlBQUEsR0FBZSxLQUFDLENBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFWLENBQWUsd0JBQWYsQ0FBd0MsQ0FBQyxJQUF6QyxDQUE4QyxhQUE5QyxDQUZmLENBQUE7YUFHQSxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBOUIsQ0FBb0MsQ0FBcEMsRUFMeUY7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1RixDQWxDQSxDQUFBO0FBQUEsRUEyQ0EsRUFBQSxDQUFHLCtDQUFILEVBQW9ELENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFFakQsVUFBQSw4QkFBQTtBQUFBLE1BQUEsUUFBQSxHQUFXLEtBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWYsQ0FBbUIsVUFBbkIsQ0FBWCxDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsUUFBUSxDQUFDLEdBQVQsQ0FBYSxhQUFiLENBQTJCLENBQUMsTUFBNUIsQ0FBQSxDQUFvQyxDQUFDLE1BRDlDLENBQUE7QUFBQSxNQUdBLFlBQUEsR0FBZSxLQUFDLENBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFWLENBQWUsd0JBQWYsQ0FBd0MsQ0FBQyxJQUF6QyxDQUE4QyxhQUE5QyxDQUhmLENBQUE7QUFBQSxNQUlBLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUE5QixDQUFvQyxNQUFwQyxDQUpBLENBQUE7QUFBQSxNQU1BLEtBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWYsQ0FBbUIsVUFBbkIsRUFBK0IsS0FBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FBL0IsQ0FOQSxDQUFBO0FBQUEsTUFRQSxRQUFBLEdBQVcsS0FBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZixDQUFtQixVQUFuQixDQVJYLENBQUE7QUFBQSxNQVNBLE1BQUEsR0FBUyxRQUFRLENBQUMsR0FBVCxDQUFhLGFBQWIsQ0FBMkIsQ0FBQyxNQUE1QixDQUFBLENBQW9DLENBQUMsTUFUOUMsQ0FBQTtBQUFBLE1BV0EsWUFBQSxHQUFlLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQVYsQ0FBZSx3QkFBZixDQUF3QyxDQUFDLElBQXpDLENBQThDLGFBQTlDLENBWGYsQ0FBQTthQVlBLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUE5QixDQUFvQyxNQUFwQyxFQWRpRDtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBELENBM0NBLENBQUE7U0E2REEsRUFBQSxDQUFHLDZFQUFILEVBQWtGLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFFL0UsS0FBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQXRCLENBQThCLDBCQUE5QixDQUF5RCxDQUFDLElBQTFELENBQStELFNBQUEsR0FBQTtBQUM1RCxZQUFBLFNBQUE7QUFBQSxRQUFBLEtBQUMsQ0FBQSxJQUFJLENBQUMsZUFBZ0IsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUF6QixDQUFBLENBQUEsQ0FBQTtBQUFBLFFBRUEsU0FBQSxHQUFZLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQVYsQ0FBZSx3QkFBZixDQUF3QyxDQUFDLElBQXpDLENBQThDLFdBQTlDLENBRlosQ0FBQTtlQUdBLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQXhCLENBQThCLENBQTlCLEVBSjREO01BQUEsQ0FBL0QsRUFGK0U7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsRixFQWhFb0M7QUFBQSxDQUF2QyxDQU5BLENBQUE7Ozs7QUNBQSxJQUFBLGlDQUFBOztBQUFBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUywwRUFBVCxDQUFyQixDQUFBOztBQUFBLGFBQ0EsR0FBZ0IsT0FBQSxDQUFTLHNGQUFULENBRGhCLENBQUE7O0FBQUEsUUFJQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEsR0FBQTtBQUd4QixFQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ1IsTUFBQSxLQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsYUFBQSxDQUNUO0FBQUEsUUFBQSxLQUFBLEVBQVcsSUFBQSxrQkFBQSxDQUFBLENBQVg7T0FEUyxDQUFaLENBQUE7YUFHQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQUpRO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxFQU9BLFNBQUEsQ0FBVSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ1AsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFETztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVYsQ0FQQSxDQUFBO0FBQUEsRUFZQSxFQUFBLENBQUcsZUFBSCxFQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ2pCLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQURBO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FaQSxDQUFBO0FBQUEsRUFpQkEsRUFBQSxDQUFHLHVDQUFILEVBQTRDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFFekMsTUFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQVosQ0FBZ0IsVUFBaEIsQ0FBMkIsQ0FBQyxNQUFNLENBQUMsS0FBbkMsQ0FBeUMsQ0FBekMsQ0FEQSxDQUFBO0FBQUEsTUFFQSxLQUFDLENBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFWLENBQW1CLGNBQW5CLENBQWtDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFELENBRjVDLENBQUE7QUFBQSxNQUlBLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBSkEsQ0FBQTtBQUFBLE1BS0EsS0FBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBWixDQUFnQixVQUFoQixDQUEyQixDQUFDLE1BQU0sQ0FBQyxLQUFuQyxDQUF5QyxDQUF6QyxDQUxBLENBQUE7QUFBQSxNQU1BLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVYsQ0FBbUIsaUJBQW5CLENBQXFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFELENBTi9DLENBQUE7QUFBQSxNQVFBLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBUkEsQ0FBQTtBQUFBLE1BU0EsS0FBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBWixDQUFnQixVQUFoQixDQUEyQixDQUFDLE1BQU0sQ0FBQyxLQUFuQyxDQUF5QyxDQUF6QyxDQVRBLENBQUE7QUFBQSxNQVVBLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVYsQ0FBbUIsZUFBbkIsQ0FBbUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQUQsQ0FWN0MsQ0FBQTtBQUFBLE1BWUEsS0FBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsQ0FaQSxDQUFBO0FBQUEsTUFhQSxLQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFaLENBQWdCLFVBQWhCLENBQTJCLENBQUMsTUFBTSxDQUFDLEtBQW5DLENBQXlDLENBQXpDLENBYkEsQ0FBQTthQWNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVYsQ0FBbUIsZUFBbkIsQ0FBbUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQUQsRUFoQko7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QyxDQWpCQSxDQUFBO0FBQUEsRUFxQ0EsRUFBQSxDQUFHLG1CQUFILEVBQXdCLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFFckIsTUFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxDQUFBLENBQUE7YUFDQSxLQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFaLENBQWdCLFVBQWhCLENBQTJCLENBQUMsTUFBTSxDQUFDLEtBQW5DLENBQXlDLENBQXpDLEVBSHFCO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEIsQ0FyQ0EsQ0FBQTtBQUFBLEVBNENBLEVBQUEsQ0FBRyxrQkFBSCxFQUF1QixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBRXBCLE1BQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxLQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxDQURBLENBQUE7QUFBQSxNQUVBLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBRkEsQ0FBQTtBQUFBLE1BS0EsS0FBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsQ0FMQSxDQUFBO0FBQUEsTUFNQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxDQU5BLENBQUE7YUFPQSxLQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFaLENBQWdCLFVBQWhCLENBQTJCLENBQUMsTUFBTSxDQUFDLEtBQW5DLENBQXlDLENBQXpDLEVBVG9CO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkIsQ0E1Q0EsQ0FBQTtTQXlEQSxFQUFBLENBQUcsa0NBQUgsRUFBdUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUVwQyxNQUFBLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBVixDQUFtQixPQUFuQixDQUEyQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBRCxDQURyQyxDQUFBO0FBQUEsTUFFQSxLQUFDLENBQUEsSUFBSSxDQUFDLFFBQU4sQ0FBQSxDQUZBLENBQUE7YUFHQSxLQUFDLENBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFWLENBQW1CLE9BQW5CLENBQTJCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFELEVBTEQ7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QyxFQTVEd0I7QUFBQSxDQUEzQixDQUpBLENBQUE7Ozs7QUNDQSxJQUFBLDRFQUFBOztBQUFBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUywwRUFBVCxDQUFyQixDQUFBOztBQUFBLHVCQUNBLEdBQTBCLE9BQUEsQ0FBUywrRUFBVCxDQUQxQixDQUFBOztBQUFBLGlCQUVBLEdBQW9CLE9BQUEsQ0FBUyx5RUFBVCxDQUZwQixDQUFBOztBQUFBLFlBR0EsR0FBZSxPQUFBLENBQVMscUZBQVQsQ0FIZixDQUFBOztBQUFBLFFBTUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUd2QixFQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ1IsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsRUFBVixDQUFBO0FBQUEsTUFFQSxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsS0FBTCxDQUFXLFNBQUEsR0FBQTtlQUNSLE9BQU8sQ0FBQyxJQUFSLENBQWlCLElBQUEsa0JBQUEsQ0FBQSxDQUFqQixFQURRO01BQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxNQUtBLEtBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxZQUFBLENBQ1Q7QUFBQSxRQUFBLFVBQUEsRUFBZ0IsSUFBQSx1QkFBQSxDQUF3QixPQUF4QixDQUFoQjtPQURTLENBTFosQ0FBQTthQVFBLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBVFE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLEVBWUEsU0FBQSxDQUFVLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDUCxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQURPO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVixDQVpBLENBQUE7QUFBQSxFQWdCQSxFQUFBLENBQUcsZUFBSCxFQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ2pCLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQURBO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FoQkEsQ0FBQTtBQUFBLEVBb0JBLEVBQUEsQ0FBRyxpQ0FBSCxFQUFzQyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ25DLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQVYsQ0FBZSxpQkFBZixDQUFpQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBaEQsQ0FBc0QsQ0FBdEQsRUFEbUM7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QyxDQXBCQSxDQUFBO0FBQUEsRUF3QkEsRUFBQSxDQUFHLGtEQUFILEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDcEQsS0FBQyxDQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE9BQXhCLENBQWdDLGlCQUFoQyxDQUFrRCxDQUFDLElBQW5ELENBQXdELFNBQUEsR0FBQTtlQUNyRCxLQUFDLENBQUEsSUFBSSxDQUFDLGtCQUFtQixDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQTVCLENBQUEsRUFEcUQ7TUFBQSxDQUF4RCxFQURvRDtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZELENBeEJBLENBQUE7QUFBQSxFQTZCQSxFQUFBLENBQUcsNENBQUgsRUFBaUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqRCxDQTdCQSxDQUFBO1NBZ0NBLEVBQUEsQ0FBRyw2REFBSCxFQUFrRSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxFLEVBbkN1QjtBQUFBLENBQTFCLENBTkEsQ0FBQTs7OztBQ0RBLElBQUEsU0FBQTs7QUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLGtGQUFSLENBQVosQ0FBQTs7QUFBQSxRQUdBLENBQVMsV0FBVCxFQUFzQixTQUFBLEdBQUE7QUFHbkIsRUFBQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUNSLEtBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxTQUFBLENBQUEsRUFESjtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsRUFJQSxTQUFBLENBQVUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUNQLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBRE87SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWLENBSkEsQ0FBQTtBQUFBLEVBUUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBLENBQXBCLENBUkEsQ0FBQTtBQUFBLEVBV0EsRUFBQSxDQUFHLHNDQUFILEVBQTJDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0MsQ0FYQSxDQUFBO0FBQUEsRUFjQSxFQUFBLENBQUcsdURBQUgsRUFBNEQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1RCxDQWRBLENBQUE7QUFBQSxFQWlCQSxFQUFBLENBQUcsYUFBSCxFQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCLENBakJBLENBQUE7QUFBQSxFQW9CQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2RCxDQXBCQSxDQUFBO0FBQUEsRUF1QkEsRUFBQSxDQUFHLGlDQUFILEVBQXNDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEMsQ0F2QkEsQ0FBQTtBQUFBLEVBMEJBLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLENBMUJBLENBQUE7QUFBQSxFQTZCQSxFQUFBLENBQUcsOENBQUgsRUFBbUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuRCxDQTdCQSxDQUFBO1NBZ0NBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDLEVBbkNtQjtBQUFBLENBQXRCLENBSEEsQ0FBQTs7OztBQ0FBLElBQUEsMEJBQUE7O0FBQUEsYUFBQSxHQUFnQixPQUFBLENBQVMsOENBQVQsQ0FBaEIsQ0FBQTs7QUFBQSxXQUNBLEdBQWdCLE9BQUEsQ0FBUywwREFBVCxDQURoQixDQUFBOztBQUFBLFFBR0EsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUV0QixFQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ1IsTUFBQSxLQUFDLENBQUEsSUFBRCxHQUFRLEdBQUEsQ0FBQSxXQUFSLENBQUE7YUFDQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQUZRO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxFQUtBLFNBQUEsQ0FBVSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ1AsTUFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxDQUFBLENBQUE7QUFFQSxNQUFBLElBQUcsS0FBQyxDQUFBLGFBQUo7ZUFBdUIsS0FBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQUEsRUFBdkI7T0FITztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVYsQ0FMQSxDQUFBO0FBQUEsRUFZQSxFQUFBLENBQUcsZUFBSCxFQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ2pCLE1BQUEsQ0FBTyxLQUFDLENBQUEsSUFBSSxDQUFDLEVBQWIsQ0FBZ0IsQ0FBQyxFQUFFLENBQUMsTUFESDtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBWkEsQ0FBQTtTQWlCQSxFQUFBLENBQUcseUNBQUgsRUFBOEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUMsSUFBRCxHQUFBO0FBRTNDLFVBQUEsaUJBQUE7QUFBQSxNQUFBLEtBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUFBLENBQXJCLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxLQUFDLENBQUEsYUFBYSxDQUFDLFNBRHhCLENBQUE7QUFBQSxNQUVBLFNBQUEsR0FBWSxLQUFDLENBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFWLENBQWUsWUFBZixDQUZaLENBQUE7QUFBQSxNQUlBLFNBQVMsQ0FBQyxFQUFWLENBQWEsT0FBYixFQUFzQixTQUFDLEtBQUQsR0FBQTtBQUNuQixRQUFBLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQXRCLENBQXlCLE1BQXpCLEVBQWlDLGFBQWpDLENBQUEsQ0FBQTtlQUNBLElBQUEsQ0FBQSxFQUZtQjtNQUFBLENBQXRCLENBSkEsQ0FBQTthQVFBLFNBQVMsQ0FBQyxLQUFWLENBQUEsRUFWMkM7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QyxFQW5Cc0I7QUFBQSxDQUF6QixDQUhBLENBQUE7Ozs7QUNBQSxJQUFBLFNBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUyxzREFBVCxDQUFaLENBQUE7O0FBQUEsUUFHQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBRXBCLEVBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDUixNQUFBLEtBQUMsQ0FBQSxJQUFELEdBQVEsR0FBQSxDQUFBLFNBQVIsQ0FBQTthQUNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBRlE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLEVBS0EsU0FBQSxDQUFVLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDUCxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQURPO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVixDQUxBLENBQUE7QUFBQSxFQVNBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDakIsTUFBQSxDQUFPLEtBQUMsQ0FBQSxJQUFJLENBQUMsRUFBYixDQUFnQixDQUFDLEVBQUUsQ0FBQyxNQURIO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FUQSxDQUFBO0FBQUEsRUFhQSxFQUFBLENBQUcsbUNBQUgsRUFBd0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QyxDQWJBLENBQUE7QUFBQSxFQWdCQSxFQUFBLENBQUcsdUNBQUgsRUFBNEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QyxDQWhCQSxDQUFBO0FBQUEsRUFtQkEsRUFBQSxDQUFHLGtEQUFILEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsQ0FuQkEsQ0FBQTtBQUFBLEVBc0JBLEVBQUEsQ0FBRyx1Q0FBSCxFQUE0QyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVDLENBdEJBLENBQUE7U0F5QkEsRUFBQSxDQUFHLGtEQUFILEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsRUEzQm9CO0FBQUEsQ0FBdkIsQ0FIQSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmpzaGludCBlcW51bGw6IHRydWUgKi9cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG5cbnZhciBIYW5kbGViYXJzID0ge307XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbkhhbmRsZWJhcnMuVkVSU0lPTiA9IFwiMS4wLjBcIjtcbkhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT04gPSA0O1xuXG5IYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPj0gMS4wLjAnXG59O1xuXG5IYW5kbGViYXJzLmhlbHBlcnMgID0ge307XG5IYW5kbGViYXJzLnBhcnRpYWxzID0ge307XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgZnVuY3Rpb25UeXBlID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgPSBmdW5jdGlvbihuYW1lLCBmbiwgaW52ZXJzZSkge1xuICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgIGlmIChpbnZlcnNlIHx8IGZuKSB7IHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbnZlcnNlKSB7IGZuLm5vdCA9IGludmVyc2U7IH1cbiAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgPSBmdW5jdGlvbihuYW1lLCBzdHIpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLnBhcnRpYWxzLCAgbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHN0cjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGFyZykge1xuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGhlbHBlcjogJ1wiICsgYXJnICsgXCInXCIpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYmxvY2tIZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSB8fCBmdW5jdGlvbigpIHt9LCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuXG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbih0aGlzKTtcbiAgfSBlbHNlIGlmKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgaWYoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZm4oY29udGV4dCk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLksgPSBmdW5jdGlvbigpIHt9O1xuXG5IYW5kbGViYXJzLmNyZWF0ZUZyYW1lID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbihvYmplY3QpIHtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG9iamVjdDtcbiAgdmFyIG9iaiA9IG5ldyBIYW5kbGViYXJzLksoKTtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG51bGw7XG4gIHJldHVybiBvYmo7XG59O1xuXG5IYW5kbGViYXJzLmxvZ2dlciA9IHtcbiAgREVCVUc6IDAsIElORk86IDEsIFdBUk46IDIsIEVSUk9SOiAzLCBsZXZlbDogMyxcblxuICBtZXRob2RNYXA6IHswOiAnZGVidWcnLCAxOiAnaW5mbycsIDI6ICd3YXJuJywgMzogJ2Vycm9yJ30sXG5cbiAgLy8gY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgb2JqKSB7XG4gICAgaWYgKEhhbmRsZWJhcnMubG9nZ2VyLmxldmVsIDw9IGxldmVsKSB7XG4gICAgICB2YXIgbWV0aG9kID0gSGFuZGxlYmFycy5sb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5IYW5kbGViYXJzLmxvZyA9IGZ1bmN0aW9uKGxldmVsLCBvYmopIHsgSGFuZGxlYmFycy5sb2dnZXIubG9nKGxldmVsLCBvYmopOyB9O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdlYWNoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgZm4gPSBvcHRpb25zLmZuLCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlO1xuICB2YXIgaSA9IDAsIHJldCA9IFwiXCIsIGRhdGE7XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICBkYXRhID0gSGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICB9XG5cbiAgaWYoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICBpZihjb250ZXh0IGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgZm9yKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGk8ajsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhKSB7IGRhdGEuaW5kZXggPSBpOyB9XG4gICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbaV0sIHsgZGF0YTogZGF0YSB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICBpZihjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBpZihkYXRhKSB7IGRhdGEua2V5ID0ga2V5OyB9XG4gICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtrZXldLCB7ZGF0YTogZGF0YX0pO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmKGkgPT09IDApe1xuICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbmRpdGlvbmFsKTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKCFjb25kaXRpb25hbCB8fCBIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29uZGl0aW9uYWwpKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHJldHVybiBIYW5kbGViYXJzLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm59KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYgKCFIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICBIYW5kbGViYXJzLmxvZyhsZXZlbCwgY29udGV4dCk7XG59KTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZNID0ge1xuICB0ZW1wbGF0ZTogZnVuY3Rpb24odGVtcGxhdGVTcGVjKSB7XG4gICAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgICB2YXIgY29udGFpbmVyID0ge1xuICAgICAgZXNjYXBlRXhwcmVzc2lvbjogSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgICAgaW52b2tlUGFydGlhbDogSGFuZGxlYmFycy5WTS5pbnZva2VQYXJ0aWFsLFxuICAgICAgcHJvZ3JhbXM6IFtdLFxuICAgICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXTtcbiAgICAgICAgaWYoZGF0YSkge1xuICAgICAgICAgIHByb2dyYW1XcmFwcGVyID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuLCBkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSBIYW5kbGViYXJzLlZNLnByb2dyYW0oaSwgZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICAgIH0sXG4gICAgICBtZXJnZTogZnVuY3Rpb24ocGFyYW0sIGNvbW1vbikge1xuICAgICAgICB2YXIgcmV0ID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICAgIGlmIChwYXJhbSAmJiBjb21tb24pIHtcbiAgICAgICAgICByZXQgPSB7fTtcbiAgICAgICAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZChyZXQsIGNvbW1vbik7XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBwYXJhbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0sXG4gICAgICBwcm9ncmFtV2l0aERlcHRoOiBIYW5kbGViYXJzLlZNLnByb2dyYW1XaXRoRGVwdGgsXG4gICAgICBub29wOiBIYW5kbGViYXJzLlZNLm5vb3AsXG4gICAgICBjb21waWxlckluZm86IG51bGxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlU3BlYy5jYWxsKGNvbnRhaW5lciwgSGFuZGxlYmFycywgY29udGV4dCwgb3B0aW9ucy5oZWxwZXJzLCBvcHRpb25zLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEpO1xuXG4gICAgICB2YXIgY29tcGlsZXJJbmZvID0gY29udGFpbmVyLmNvbXBpbGVySW5mbyB8fCBbXSxcbiAgICAgICAgICBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICAgICAgY3VycmVudFJldmlzaW9uID0gSGFuZGxlYmFycy5DT01QSUxFUl9SRVZJU0lPTjtcblxuICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IEhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrcnVudGltZVZlcnNpb25zK1wiKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKFwiK2NvbXBpbGVyVmVyc2lvbnMrXCIpLlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgICAgIHRocm93IFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJJbmZvWzFdK1wiKS5cIjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH0sXG5cbiAgcHJvZ3JhbVdpdGhEZXB0aDogZnVuY3Rpb24oaSwgZm4sIGRhdGEgLyosICRkZXB0aCAqLykge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcblxuICAgIHZhciBwcm9ncmFtID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBbY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGFdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgICBwcm9ncmFtLnByb2dyYW0gPSBpO1xuICAgIHByb2dyYW0uZGVwdGggPSBhcmdzLmxlbmd0aDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGEpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gMDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgbm9vcDogZnVuY3Rpb24oKSB7IHJldHVybiBcIlwiOyB9LFxuICBpbnZva2VQYXJ0aWFsOiBmdW5jdGlvbihwYXJ0aWFsLCBuYW1lLCBjb250ZXh0LCBoZWxwZXJzLCBwYXJ0aWFscywgZGF0YSkge1xuICAgIHZhciBvcHRpb25zID0geyBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcblxuICAgIGlmKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuICAgIH0gZWxzZSBpZihwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAoIUhhbmRsZWJhcnMuY29tcGlsZSkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydGlhbHNbbmFtZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUocGFydGlhbCwge2RhdGE6IGRhdGEgIT09IHVuZGVmaW5lZH0pO1xuICAgICAgcmV0dXJuIHBhcnRpYWxzW25hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy50ZW1wbGF0ZSA9IEhhbmRsZWJhcnMuVk0udGVtcGxhdGU7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcblxufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbkhhbmRsZWJhcnMuRXhjZXB0aW9uID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG59O1xuSGFuZGxlYmFycy5FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbi8vIEJ1aWxkIG91dCBvdXIgYmFzaWMgU2FmZVN0cmluZyB0eXBlXG5IYW5kbGViYXJzLlNhZmVTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59O1xuSGFuZGxlYmFycy5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJpbmcudG9TdHJpbmcoKTtcbn07XG5cbnZhciBlc2NhcGUgPSB7XG4gIFwiJlwiOiBcIiZhbXA7XCIsXG4gIFwiPFwiOiBcIiZsdDtcIixcbiAgXCI+XCI6IFwiJmd0O1wiLFxuICAnXCInOiBcIiZxdW90O1wiLFxuICBcIidcIjogXCImI3gyNztcIixcbiAgXCJgXCI6IFwiJiN4NjA7XCJcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZztcbnZhciBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG52YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl0gfHwgXCImYW1wO1wiO1xufTtcblxuSGFuZGxlYmFycy5VdGlscyA9IHtcbiAgZXh0ZW5kOiBmdW5jdGlvbihvYmosIHZhbHVlKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICAgIGlmKHZhbHVlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWx1ZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBlc2NhcGVFeHByZXNzaW9uOiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyBpbnN0YW5jZW9mIEhhbmRsZWJhcnMuU2FmZVN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZy50b1N0cmluZygpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwgfHwgc3RyaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gc3RyaW5nLnRvU3RyaW5nKCk7XG5cbiAgICBpZighcG9zc2libGUudGVzdChzdHJpbmcpKSB7IHJldHVybiBzdHJpbmc7IH1cbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xuICB9LFxuXG4gIGlzRW1wdHk6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmKHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgQXJyYXldXCIgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcycpLmNyZWF0ZSgpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzJykuYXR0YWNoKGV4cG9ydHMpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMnKS5hdHRhY2goZXhwb3J0cykiLCIjIyMqXG4gKiBQcmltYXJ5IGFwcGxpY2F0aW9uIGNvbnRyb2xsZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cbkFwcE1vZGVsICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuQXBwUm91dGVyICAgPSByZXF1aXJlICcuL3JvdXRlcnMvQXBwUm91dGVyLmNvZmZlZSdcbkxhbmRpbmdWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSdcbkNyZWF0ZVZpZXcgID0gcmVxdWlyZSAnLi92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUnXG5TaGFyZVZpZXcgICA9IHJlcXVpcmUgJy4vdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBBcHBDb250cm9sbGVyIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG5cbiAgIGNsYXNzTmFtZTogJ3dyYXBwZXInXG5cblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuXG4gICAgICBAbGFuZGluZ1ZpZXcgPSBuZXcgTGFuZGluZ1ZpZXdcbiAgICAgIEBzaGFyZVZpZXcgICA9IG5ldyBTaGFyZVZpZXdcbiAgICAgIEBjcmVhdGVWaWV3ICA9IG5ldyBDcmVhdGVWaWV3XG5cbiAgICAgIEBhcHBSb3V0ZXIgPSBuZXcgQXBwUm91dGVyXG4gICAgICAgICBhcHBDb250cm9sbGVyOiBAXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgQXBwQ29udHJvbGxlciB0byB0aGUgRE9NIGFuZCBraWNrc1xuICAgIyBvZmYgYmFja2JvbmVzIGhpc3RvcnlcblxuICAgcmVuZGVyOiAtPlxuICAgICAgQCRib2R5ID0gJCAnYm9keSdcbiAgICAgIEAkYm9keS5hcHBlbmQgQGVsXG5cbiAgICAgIEJhY2tib25lLmhpc3Rvcnkuc3RhcnRcbiAgICAgICAgIHB1c2hTdGF0ZTogZmFsc2VcblxuXG5cbiAgICMgRGVzdHJveXMgYWxsIGN1cnJlbnQgYW5kIHByZS1yZW5kZXJlZCB2aWV3cyBhbmRcbiAgICMgdW5kZWxlZ2F0ZXMgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIEBsYW5kaW5nVmlldy5yZW1vdmUoKVxuICAgICAgQHNoYXJlVmlldy5yZW1vdmUoKVxuICAgICAgQGNyZWF0ZVZpZXcucmVtb3ZlKClcblxuICAgICAgQHJlbW92ZUV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgIyBBZGRzIEFwcENvbnRyb2xsZXItcmVsYXRlZCBldmVudCBsaXN0ZW5lcnMgYW5kIGJlZ2luc1xuICAgIyBsaXN0ZW5pbmcgdG8gdmlldyBjaGFuZ2VzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgJ2NoYW5nZTp2aWV3JywgQG9uVmlld0NoYW5nZVxuXG5cblxuXG4gICAjIFJlbW92ZXMgQXBwQ29udHJvbGxlci1yZWxhdGVkIGV2ZW50IGxpc3RlbmVyc1xuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBzaG93aW5nIC8gaGlkaW5nIC8gZGlzcG9zaW5nIG9mIHByaW1hcnkgdmlld3NcbiAgICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICAgb25WaWV3Q2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBwcmV2aW91c1ZpZXcgPSBtb2RlbC5fcHJldmlvdXNBdHRyaWJ1dGVzLnZpZXdcbiAgICAgIGN1cnJlbnRWaWV3ICA9IG1vZGVsLmNoYW5nZWQudmlld1xuXG4gICAgICBpZiBwcmV2aW91c1ZpZXcgdGhlbiBwcmV2aW91c1ZpZXcuaGlkZVxuICAgICAgICAgcmVtb3ZlOiB0cnVlXG5cblxuICAgICAgQCRlbC5hcHBlbmQgY3VycmVudFZpZXcucmVuZGVyKCkuZWxcblxuICAgICAgY3VycmVudFZpZXcuc2hvdygpXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwQ29udHJvbGxlciIsIiMjIypcbiAgQXBwbGljYXRpb24td2lkZSBnZW5lcmFsIGNvbmZpZ3VyYXRpb25zXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTkuMTRcbiMjI1xuXG5cbkFwcENvbmZpZyA9XG5cblxuICAgIyBUaGUgcGF0aCB0byBhcHBsaWNhdGlvbiBhc3NldHNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQVNTRVRTOlxuICAgICAgcGF0aDogICAnL2Fzc2V0cydcbiAgICAgIGF1ZGlvOiAgJ2F1ZGlvJ1xuICAgICAgZGF0YTogICAnZGF0YSdcbiAgICAgIGltYWdlczogJ2ltYWdlcydcblxuXG4gICAjIFRoZSBCUE0gdGVtcG9cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQlBNOiAxMjBcblxuXG4gICAjIFRoZSBtYXggQlBNXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIEJQTV9NQVg6IDMwMFxuXG5cbiAgICMgVGhlIG1heCB2YXJpZW50IG9uIGVhY2ggcGF0dGVybiBzcXVhcmUgKG9mZiwgbG93LCBtZWRpdW0sIGhpZ2gpXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIFZFTE9DSVRZX01BWDogM1xuXG5cbiAgICMgUmV0dXJucyBhIG5vcm1hbGl6ZWQgYXNzZXQgcGF0aCBmb3IgYXBwbGljYXRpb24gYXNzZXRzXG4gICAjIEBwYXJhbSB7U3RyaW5nfSBhc3NldFR5cGVcblxuICAgcmV0dXJuQXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgICAgQEFTU0VUUy5wYXRoICsgJy8nICsgQEFTU0VUU1thc3NldFR5cGVdXG5cblxuICAgIyBSZXR1cm5zIGEgbm9ybWFsaXplZCBhc3NldCBwYXRoIGZvciB0aGUgVEVTVCBlbnZpcm9ubWVudFxuICAgIyBAcGFyYW0ge1N0cmluZ30gYXNzZXRUeXBlXG5cbiAgIHJldHVyblRlc3RBc3NldFBhdGg6IChhc3NldFR5cGUpIC0+XG4gICAgICAnL3Rlc3QvaHRtbC8nICsgQEFTU0VUUy5wYXRoICsgJy8nICsgQEFTU0VUU1thc3NldFR5cGVdXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcENvbmZpZ1xuXG4iLCIjIyMqXG4gKiBBcHBsaWNhdGlvbiByZWxhdGVkIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblxuQXBwRXZlbnQgPVxuXG4gICBDSEFOR0VfS0lUOiAgICAgICAgJ2NoYW5nZTpraXRNb2RlbCdcbiAgIENIQU5HRV9CUE06ICAgICAgICAnY2hhbmdlOmJwbSdcbiAgIENIQU5HRV9JTlNUUlVNRU5UOiAnY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50J1xuICAgQ0hBTkdFX1ZFTE9DSVRZOiAgICdjaGFuZ2U6dmVsb2NpdHknXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBFdmVudCIsIiMjIypcbiAqIEdsb2JhbCBQdWJTdWIgZXZlbnRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuXG5QdWJTdWIgPVxuXG4gICBST1VURTogJ29uUm91dGVDaGFuZ2UnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQdWJTdWIiLCIjIyMqXG4gIFByaW1hcnkgYXBwbGljYXRpb24gbW9kZWwgd2hpY2ggY29vcmRpbmF0ZXMgc3RhdGVcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuXG5cbkFwcFJvdXRlciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ3ZpZXcnOiAgICAgICAgbnVsbFxuICAgICAgJ2tpdE1vZGVsJzogICAgbnVsbFxuXG4gICAgICAjIFNldHRpbmdzXG4gICAgICAnYnBtJzogICAgICAgICBBcHBDb25maWcuQlBNXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBSb3V0ZXIiLCIjIyMqXG4gKiBDb2xsZWN0aW9uIHJlcHJlc2VudGluZyBlYWNoIHNvdW5kIGZyb20gYSBraXQgc2V0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIEluc3RydW1lbnRDb2xsZWN0aW9uIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG5cbiAgIG1vZGVsOiBJbnN0cnVtZW50TW9kZWxcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRDb2xsZWN0aW9uIiwiIyMjKlxuICogU291bmQgbW9kZWwgZm9yIGVhY2ggaW5kaXZpZHVhbCBraXQgc291bmQgc2V0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuY2xhc3MgSW5zdHJ1bWVudE1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICdpY29uJzogICAgbnVsbFxuICAgICAgJ2xhYmVsJzogICBudWxsXG4gICAgICAnc3JjJzogICAgIG51bGxcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRNb2RlbCIsIiMjIypcbiAqIENvbGxlY3Rpb24gb2Ygc291bmQga2l0c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0TW9kZWwgID0gcmVxdWlyZSAnLi9LaXRNb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgS2l0Q29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuXG4gICAjIFVybCB0byBkYXRhIGZvciBmZXRjaFxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICB1cmw6IFwiI3tBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJyl9L3NvdW5kLWRhdGEuanNvblwiXG5cblxuICAgIyBJbmRpdmlkdWFsIGRydW1raXQgYXVkaW8gc2V0c1xuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIG1vZGVsOiBLaXRNb2RlbFxuXG5cbiAgICMgVGhlIGN1cnJlbnQgdXNlci1zZWxlY3RlZCBraXRcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAga2l0SWQ6IDBcblxuXG5cbiAgIHBhcnNlOiAocmVzcG9uc2UpIC0+XG4gICAgICBhc3NldFBhdGggPSByZXNwb25zZS5jb25maWcuYXNzZXRQYXRoXG4gICAgICBraXRzID0gcmVzcG9uc2Uua2l0c1xuXG4gICAgICBraXRzID0gXy5tYXAga2l0cywgKGtpdCkgLT5cbiAgICAgICAgIGtpdC5wYXRoID0gYXNzZXRQYXRoICsgJy8nICsga2l0LmZvbGRlclxuICAgICAgICAgcmV0dXJuIGtpdFxuXG4gICAgICByZXR1cm4ga2l0c1xuXG5cblxuXG4gICAjIEN5Y2xlcyB0aGUgY3VycmVudCBkcnVtIGtpdCBiYWNrXG4gICAjIEByZXR1cm4ge0tpdE1vZGVsfVxuXG4gICBwcmV2aW91c0tpdDogLT5cbiAgICAgIGxlbiA9IEBsZW5ndGhcblxuICAgICAgaWYgQGtpdElkID4gMFxuICAgICAgICAgQGtpdElkLS1cblxuICAgICAgZWxzZVxuICAgICAgICAgQGtpdElkID0gbGVuIC0gMVxuXG4gICAgICBraXRNb2RlbCA9IEBhdCBAa2l0SWRcblxuXG5cblxuICAgIyBDeWNsZXMgdGhlIGN1cnJlbnQgZHJ1bSBraXQgZm9yd2FyZFxuICAgIyBAcmV0dXJuIHtLaXRNb2RlbH1cblxuICAgbmV4dEtpdDogLT5cbiAgICAgIGxlbiA9IEBsZW5ndGggLSAxXG5cbiAgICAgIGlmIEBraXRJZCA8IGxlblxuICAgICAgICAgQGtpdElkKytcblxuICAgICAgZWxzZVxuICAgICAgICAgQGtpdElkID0gMFxuXG4gICAgICBraXRNb2RlbCA9IEBhdCBAa2l0SWRcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2l0Q29sbGVjdGlvbiIsIiMjIypcbiAqIEtpdCBtb2RlbCBmb3IgaGFuZGxpbmcgc3RhdGUgcmVsYXRlZCB0byBraXQgc2VsZWN0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9pbnN0cnVtZW50cy9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuY2xhc3MgS2l0TW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ2xhYmVsJzogICAgbnVsbFxuICAgICAgJ3BhdGgnOiAgICAgbnVsbFxuICAgICAgJ2ZvbGRlcic6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cbiAgICAgICdpbnN0cnVtZW50cyc6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICAgICAnY3VycmVudEluc3RydW1lbnQnOiBudWxsXG5cblxuXG4gICAjIEZvcm1hdCB0aGUgcmVzcG9uc2Ugc28gdGhhdCBpbnN0cnVtZW50cyBnZXRzIHByb2Nlc3NlZFxuICAgIyBieSBiYWNrYm9uZSB2aWEgdGhlIEluc3RydW1lbnRDb2xsZWN0aW9uLiAgQWRkaXRpb25hbGx5LFxuICAgIyBwYXNzIGluIHRoZSBwYXRoIHNvIHRoYXQgYWJzb2x1dGUgVVJMJ3MgY2FuIGJlIHVzZWRcbiAgICMgdG8gcmVmZXJlbmNlIHNvdW5kIGRhdGFcbiAgICMgQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG5cbiAgIHBhcnNlOiAocmVzcG9uc2UpIC0+XG4gICAgICBfLmVhY2ggcmVzcG9uc2UuaW5zdHJ1bWVudHMsIChpbnN0cnVtZW50KSAtPlxuICAgICAgICAgaW5zdHJ1bWVudC5zcmMgPSByZXNwb25zZS5wYXRoICsgJy8nICsgaW5zdHJ1bWVudC5zcmNcblxuICAgICAgcmVzcG9uc2UuaW5zdHJ1bWVudHMgPSBuZXcgSW5zdHJ1bWVudENvbGxlY3Rpb24gcmVzcG9uc2UuaW5zdHJ1bWVudHNcblxuICAgICAgcmVzcG9uc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRNb2RlbCIsIiMjIypcbiAgQSBjb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgcGF0dGVybiBzcXVhcmVzXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBDb25maWcgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4vUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuXG4gICBtb2RlbDogUGF0dGVyblNxdWFyZU1vZGVsXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiIsIiMjIypcbiAgTW9kZWwgZm9yIGluZGl2aWR1YWwgcGF0dGVybiBzcXVhcmVzLiAgUGFydCBvZiBsYXJnZXIgUGF0dGVybiBUcmFjayBjb2xsZWN0aW9uXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlTW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ3ZlbG9jaXR5JzogICAgICAgICAwXG4gICAgICAncHJldmlvdXNWZWxvY2l0eSc6IDBcbiAgICAgICdhY3RpdmUnOiAgICAgICAgICAgZmFsc2VcblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQG9uICdjaGFuZ2U6dmVsb2NpdHknLCBAb25WZWxvY2l0eUNoYW5nZVxuXG5cblxuICAgY3ljbGU6IC0+XG4gICAgICB2ZWxvY2l0eSA9IEBnZXQgJ3ZlbG9jaXR5J1xuXG4gICAgICBpZiB2ZWxvY2l0eSA8IEFwcENvbmZpZy5WRUxPQ0lUWV9NQVhcbiAgICAgICAgIHZlbG9jaXR5KytcblxuICAgICAgZWxzZVxuICAgICAgICAgdmVsb2NpdHkgPSAwXG5cbiAgICAgICMgVXBkYXRlIHdpdGggbmV3IHZhbHVlXG4gICAgICBAc2V0ICd2ZWxvY2l0eScsIHZlbG9jaXR5XG5cblxuXG4gICBlbmFibGU6IC0+XG4gICAgICBAc2V0ICd2ZWxvY2l0eScsIDFcblxuXG5cblxuICAgZGlzYWJsZTogLT5cbiAgICAgIEBzZXQgJ3ZlbG9jaXR5JywgMFxuXG5cblxuICAgb25WZWxvY2l0eUNoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgQHNldCAncHJldmlvdXNWZWxvY2l0eScsIG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMudmVsb2NpdHlcblxuICAgICAgdmVsb2NpdHkgPSBtb2RlbC5jaGFuZ2VkLnZlbG9jaXR5XG5cbiAgICAgIGlmIHZlbG9jaXR5ID4gMFxuICAgICAgICAgQHNldCAnYWN0aXZlJywgdHJ1ZVxuXG4gICAgICBlbHNlIGlmIHZlbG9jaXR5IGlzIDBcbiAgICAgICAgIEBzZXQgJ2FjdGl2ZScsIGZhbHNlXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblNxdWFyZU1vZGVsIiwiIyMjKlxuICBNb2RlbCBmb3IgcGF0dGVybiB0cmFja3MsIHdoaWNoIGNvcnJlc3BvbmRlIHRvIHRoZSBjdXJyZW50IGluc3RydW1lbnRcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4yMC4xNFxuIyMjXG5cbmNsYXNzIFBhdHRlcm5UcmFja01vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuICAgZGVmYXVsdHM6XG4gICAgICAndm9sdW1lJzogICAgIG51bGxcbiAgICAgICdhY3RpdmUnOiAgICAgbnVsbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblRyYWNrTW9kZWwiLCIjIyMqXG4gKiBNUEMgQXBwbGljYXRpb24gcm91dGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgPSByZXF1aXJlICcuLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblB1YlN1YiAgICAgID0gcmVxdWlyZSAnLi4vdXRpbHMvUHViU3ViJ1xuUHViRXZlbnQgICAgPSByZXF1aXJlICcuLi9ldmVudHMvUHViRXZlbnQuY29mZmVlJ1xuXG4jIFRPRE86IFRoZSBiZWxvdyBpdGVtcyBhcmUgb25seSBpbmNsdWRlZCBmb3IgdGVzdGluZyBjb21wb25lbnRcbiMgbW9kdWxhcml0eS4gIFRoZXksIGFuZCB0aGVpciByb3V0ZXMsIHNob3VsZCBiZSByZW1vdmVkIGluIHByb2R1Y3Rpb25cblxuVGVzdHNWaWV3ICAgICA9IHJlcXVpcmUgJy4uL3ZpZXdzL3Rlc3RzL1Rlc3RzVmlldy5jb2ZmZWUnXG5cbktpdFNlbGVjdGlvbiAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rpb24uY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuS2l0TW9kZWwgICAgICA9IHJlcXVpcmUgJy4uL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSdcblxuQlBNSW5kaWNhdG9yICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci5jb2ZmZWUnXG5JbnN0cnVtZW50U2VsZWN0aW9uUGFuZWwgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0aW9uUGFuZWwuY29mZmVlJ1xuXG5QYXR0ZXJuU3F1YXJlID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUuY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAnLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5UcmFjayAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLmNvZmZlZSdcblNlcXVlbmNlciAgICAgICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcFJvdXRlciBleHRlbmRzIEJhY2tib25lLlJvdXRlclxuXG5cbiAgIHJvdXRlczpcbiAgICAgICcnOiAgICAgICAgICAgICAnbGFuZGluZ1JvdXRlJ1xuICAgICAgJ2NyZWF0ZSc6ICAgICAgICdjcmVhdGVSb3V0ZSdcbiAgICAgICdzaGFyZSc6ICAgICAgICAnc2hhcmVSb3V0ZSdcblxuICAgICAgIyBDb21wb25lbnQgdGVzdCByb3V0ZXNcbiAgICAgICd0ZXN0cyc6ICAgICAgICAgICAgICAgICd0ZXN0cydcbiAgICAgICdraXQtc2VsZWN0aW9uJzogICAgICAgICdraXRTZWxlY3Rpb25Sb3V0ZSdcbiAgICAgICdicG0taW5kaWNhdG9yJzogICAgICAgICdicG1JbmRpY2F0b3JSb3V0ZSdcbiAgICAgICdpbnN0cnVtZW50LXNlbGVjdG9yJzogICdpbnN0cnVtZW50U2VsZWN0b3JSb3V0ZSdcbiAgICAgICdwYXR0ZXJuLXNxdWFyZSc6ICAgICAgICdwYXR0ZXJuU3F1YXJlUm91dGUnXG4gICAgICAncGF0dGVybi10cmFjayc6ICAgICAgICAncGF0dGVyblRyYWNrUm91dGUnXG4gICAgICAnc2VxdWVuY2VyJzogICAgICAgICAgICAnc2VxdWVuY2VyUm91dGUnXG5cblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHtAYXBwQ29udHJvbGxlciwgQGFwcE1vZGVsfSA9IG9wdGlvbnNcblxuICAgICAgUHViU3ViLm9uIFB1YkV2ZW50LlJPVVRFLCBAb25Sb3V0ZUNoYW5nZVxuXG5cblxuICAgb25Sb3V0ZUNoYW5nZTogKHBhcmFtcykgPT5cbiAgICAgIHtyb3V0ZX0gPSBwYXJhbXNcblxuICAgICAgQG5hdmlnYXRlIHJvdXRlLCB7IHRyaWdnZXI6IHRydWUgfVxuXG5cblxuICAgbGFuZGluZ1JvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLmxhbmRpbmdWaWV3XG5cblxuXG4gICBjcmVhdGVSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBAYXBwQ29udHJvbGxlci5jcmVhdGVWaWV3XG5cblxuXG4gICBzaGFyZVJvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLnNoYXJlVmlld1xuXG5cblxuXG5cblxuICAgIyBDT01QT05FTlQgVEVTVCBST1VURVNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICB0ZXN0czogLT5cbiAgICAgIHZpZXcgPSBuZXcgVGVzdHNWaWV3KClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAga2l0U2VsZWN0aW9uUm91dGU6IC0+XG4gICAgICBtb2RlbHMgPSBbXVxuXG4gICAgICBfKDQpLnRpbWVzIChpbmRleCkgLT5cbiAgICAgICAgIG1vZGVscy5wdXNoIG5ldyBLaXRNb2RlbCB7bGFiZWw6IFwia2l0ICN7aW5kZXh9XCJ9XG5cbiAgICAgIHZpZXcgPSBuZXcgS2l0U2VsZWN0aW9uXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBuZXcgS2l0Q29sbGVjdGlvbiBtb2RlbHMsIHtcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIH1cblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAgYnBtSW5kaWNhdG9yUm91dGU6IC0+XG4gICAgICB2aWV3ID0gbmV3IEJQTUluZGljYXRvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICB2aWV3LnJlbmRlcigpXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cbiAgIGluc3RydW1lbnRTZWxlY3RvclJvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIHZpZXcgPSBuZXcgSW5zdHJ1bWVudFNlbGVjdGlvblBhbmVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBwYXR0ZXJuU3F1YXJlUm91dGU6IC0+XG4gICAgICB2aWV3ID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgIG1vZGVsOiBuZXcgUGF0dGVyblNxdWFyZU1vZGVsKClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbiAgIHBhdHRlcm5UcmFja1JvdXRlOiAtPlxuICAgICAgc3F1YXJlcyA9IFtdXG5cbiAgICAgIF8oOCkudGltZXMgPT5cbiAgICAgICAgIHNxdWFyZXMucHVzaCBuZXcgUGF0dGVyblNxdWFyZU1vZGVsKClcblxuICAgICAgdmlldyA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgIGNvbGxlY3Rpb246IG5ldyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiBzcXVhcmVzXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG4gICBzZXF1ZW5jZXJSb3V0ZTogLT5cbiAgICAgIHZpZXcgPSBuZXcgU2VxdWVuY2VyKClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBSb3V0ZXIiLCIjIyMqXG4gKiBWaWV3IHN1cGVyY2xhc3MgY29udGFpbmluZyBzaGFyZWQgZnVuY3Rpb25hbGl0eVxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMi4xNy4xNFxuIyMjXG5cblxuVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kXG5cblxuXG4gICAjIEluaXRpYWxpemVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgXy5leHRlbmQgQCwgXy5kZWZhdWx0cyggb3B0aW9ucyA9IG9wdGlvbnMgfHwgQGRlZmF1bHRzLCBAZGVmYXVsdHMgfHwge30gKVxuXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyB3aXRoIHN1cHBsaWVkIHRlbXBsYXRlIGRhdGEsIG9yIGNoZWNrcyBpZiB0ZW1wbGF0ZSBpcyBvblxuICAgIyBvYmplY3QgYm9keVxuICAgIyBAcGFyYW0gIHtGdW5jdGlvbnxNb2RlbH0gdGVtcGxhdGVEYXRhXG4gICAjIEByZXR1cm4ge1ZpZXd9XG5cbiAgIHJlbmRlcjogKHRlbXBsYXRlRGF0YSkgLT5cbiAgICAgIHRlbXBsYXRlRGF0YSA9IHRlbXBsYXRlRGF0YSB8fCB7fVxuXG4gICAgICBpZiBAdGVtcGxhdGVcblxuICAgICAgICAgIyBJZiBtb2RlbCBpcyBhbiBpbnN0YW5jZSBvZiBhIGJhY2tib25lIG1vZGVsLCB0aGVuIEpTT05pZnkgaXRcbiAgICAgICAgIGlmIEBtb2RlbCBpbnN0YW5jZW9mIEJhY2tib25lLk1vZGVsXG4gICAgICAgICAgICB0ZW1wbGF0ZURhdGEgPSBAbW9kZWwudG9KU09OKClcblxuICAgICAgICAgQCRlbC5odG1sIEB0ZW1wbGF0ZSAodGVtcGxhdGVEYXRhKVxuXG4gICAgICBAZGVsZWdhdGVFdmVudHMoKVxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQFxuXG5cblxuXG4gICAjIFJlbW92ZXMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVtb3ZlOiAob3B0aW9ucykgLT5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG4gICAgICBAJGVsLnJlbW92ZSgpXG4gICAgICBAdW5kZWxlZ2F0ZUV2ZW50cygpXG5cblxuXG5cblxuICAgIyBTaG93cyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBzaG93OiAob3B0aW9ucykgLT5cbiAgICAgIFR3ZWVuTWF4LnNldCBAJGVsLCB7IGF1dG9BbHBoYTogMSB9XG5cblxuXG5cbiAgICMgSGlkZXMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaGlkZTogKG9wdGlvbnMpIC0+XG4gICAgICBUd2Vlbk1heC5zZXQgQCRlbCxcbiAgICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgIGlmIG9wdGlvbnM/LnJlbW92ZVxuICAgICAgICAgICAgICAgQHJlbW92ZSgpXG5cblxuXG5cbiAgICMgTm9vcCB3aGljaCBpcyBjYWxsZWQgb24gcmVuZGVyXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuXG5cblxuICAgIyBSZW1vdmVzIGFsbCByZWdpc3RlcmVkIGxpc3RlbmVyc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlldyIsIi8qKlxuICogQG1vZHVsZSAgICAgUHViU3ViXG4gKiBAZGVzYyAgICAgICBHbG9iYWwgUHViU3ViIG9iamVjdCBmb3IgZGlzcGF0Y2ggYW5kIGRlbGVnYXRpb25cbiAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIFB1YlN1YiA9IHt9XG5cbl8uZXh0ZW5kKCBQdWJTdWIsIEJhY2tib25lLkV2ZW50cyApXG5cbm1vZHVsZS5leHBvcnRzID0gUHViU3ViIiwiIyMjKlxuICogQ3JlYXRlIHZpZXcgd2hpY2ggdGhlIHVzZXIgY2FuIGJ1aWxkIGJlYXRzIHdpdGhpblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9jcmVhdGUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIENyZWF0ZVZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3JlYXRlVmlldyIsIiMjIypcbiAqIEJlYXRzIHBlciBtaW51dGUgdmlldyBmb3IgaGFuZGxpbmcgdGVtcG9cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9icG0tdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEJQTUluZGljYXRvciBleHRlbmRzIFZpZXdcblxuXG4gICAjIFJlZiB0byB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBUaGUgc2V0SW50ZXJ2YWwgdXBkYXRlIGludGVydmFsIGZvciBpbmNyZWFzaW5nIGFuZFxuICAgIyBkZWNyZWFzaW5nIEJQTSBvbiBwcmVzcyAvIHRvdWNoXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGludGVydmFsVXBkYXRlVGltZTogNzBcblxuXG4gICAjIFRoZSBzZXRJbnRlcnZhbCB1cGRhdGVyXG4gICAjIEB0eXBlIHtTZXRJbnRlcnZhbH1cblxuICAgdXBkYXRlSW50ZXJ2YWw6IG51bGxcblxuXG4gICAjIFRoZSBhbW91bnQgdG8gaW5jcmVhc2UgdGhlIEJQTSBieSBvbiBlYWNoIHRpY2tcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgYnBtSW5jcmVhc2VBbW91bnQ6IDFcblxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoc3RhcnQgLmJ0bi1pbmNyZWFzZSc6ICdvbkluY3JlYXNlQnRuRG93bidcbiAgICAgICd0b3VjaHN0YXJ0IC5idG4tZGVjcmVhc2UnOiAnb25EZWNyZWFzZUJ0bkRvd24nXG4gICAgICAndG91Y2hlbmQgICAuYnRuLWluY3JlYXNlJzogJ29uQnRuVXAnXG4gICAgICAndG91Y2hlbmQgICAuYnRuLWRlY3JlYXNlJzogJ29uQnRuVXAnXG5cblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGFuZCB1cGRhdGUgdGhlIGtpdCBpZiBub3QgYWxyZWFkeVxuICAgIyBzZXQgdmlhIGEgcHJldmlvdXMgc2Vzc2lvblxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGJwbUxhYmVsICAgPSBAJGVsLmZpbmQgJy5sYWJlbC1icG0nXG4gICAgICBAaW5jcmVhc2VCdG4gPSBAJGVsLmZpbmQgJy5idG4taW5jcmVhc2UnXG4gICAgICBAZGVjcmVhc2VCdG4gPSBAJGVsLmZpbmQgJy5idG4tZGVjcmVhc2UnXG5cbiAgICAgIEAkYnBtTGFiZWwudGV4dCBAYXBwTW9kZWwuZ2V0KCdicG0nKVxuXG4gICAgICBAXG5cblxuXG4gICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRpbmcgY2hhbmdlcyByZWxhdGVkIHRvXG4gICAjIHN3aXRjaGluZyBCUE1cblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfQlBNLCBAb25CUE1DaGFuZ2VcblxuXG5cblxuICAgIyBTZXRzIGFuIGludGVydmFsIHRvIGluY3JlYXNlIHRoZSBCUE0gbW9uaXRvci4gIENsZWFyc1xuICAgIyB3aGVuIHRoZSB1c2VyIHJlbGVhc2VzIHRoZSBtb3VzZVxuXG4gICBpbmNyZWFzZUJQTTogLT5cbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IHNldEludGVydmFsID0+XG4gICAgICAgICBicG0gPSBAYXBwTW9kZWwuZ2V0ICdicG0nXG5cbiAgICAgICAgIGlmIGJwbSA8IEFwcENvbmZpZy5CUE1fTUFYXG4gICAgICAgICAgICBicG0gKz0gQGJwbUluY3JlYXNlQW1vdW50XG5cbiAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJwbSA9IEFwcENvbmZpZy5CUE1fTUFYXG5cbiAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ2JwbScsIGJwbVxuXG4gICAgICAsIEBpbnRlcnZhbFVwZGF0ZVRpbWVcblxuXG5cblxuICAgIyBTZXRzIGFuIGludGVydmFsIHRvIGRlY3JlYXNlIHRoZSBCUE0gbW9uaXRvci4gIENsZWFyc1xuICAgIyB3aGVuIHRoZSB1c2VyIHJlbGVhc2VzIHRoZSBtb3VzZVxuXG4gICBkZWNyZWFzZUJQTTogLT5cbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IHNldEludGVydmFsID0+XG4gICAgICAgICBicG0gPSBAYXBwTW9kZWwuZ2V0ICdicG0nXG5cbiAgICAgICAgIGlmIGJwbSA+IDBcbiAgICAgICAgICAgIGJwbSAtPSBAYnBtSW5jcmVhc2VBbW91bnRcblxuICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnBtID0gMFxuXG4gICAgICAgICBAYXBwTW9kZWwuc2V0ICdicG0nLCBicG1cblxuICAgICAgLCBAaW50ZXJ2YWxVcGRhdGVUaW1lXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uSW5jcmVhc2VCdG5Eb3duOiAoZXZlbnQpID0+XG4gICAgICBAaW5jcmVhc2VCUE0oKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGxlZnQgYnV0dG9uIGNsaWNrcy4gIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gYW5kXG4gICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25EZWNyZWFzZUJ0bkRvd246IChldmVudCkgLT5cbiAgICAgIEBkZWNyZWFzZUJQTSgpXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtb3VzZSAvIHRvdWNodXAgZXZlbnRzLiAgQ2xlYXJzIHRoZSBpbnRlcnZhbFxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkJ0blVwOiAoZXZlbnQpIC0+XG4gICAgICBjbGVhckludGVydmFsIEB1cGRhdGVJbnRlcnZhbFxuICAgICAgQHVwZGF0ZUludGVydmFsID0gbnVsbFxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2UgZXZlbnRzLiAgVXBkYXRlcyB0aGUgbGFiZWwgb24gdGhlXG4gICAjIGtpdCBzZWxlY3RvclxuXG4gICBvbkJQTUNoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgQCRicG1MYWJlbC50ZXh0IG1vZGVsLmNoYW5nZWQuYnBtXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQlBNSW5kaWNhdG9yIiwiIyMjKlxuICogS2l0IHNlbGVjdG9yIGZvciBzd2l0Y2hpbmcgYmV0d2VlbiBkcnVtLWtpdCBzb3VuZHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMva2l0LXNlbGVjdGlvbi10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgS2l0U2VsZWN0aW9uIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgUmVmIHRvIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgS2l0Q29sbGVjdGlvbiBmb3IgdXBkYXRpbmcgc291bmRzXG4gICAjIEB0eXBlIHtLaXRDb2xsZWN0aW9ufVxuXG4gICBraXRDb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBUaGUgY3VycmVudCBraXRcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRNb2RlbDogbnVsbFxuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5idG4tbGVmdCc6ICAgJ29uTGVmdEJ0bkNsaWNrJ1xuICAgICAgJ3RvdWNoZW5kIC5idG4tcmlnaHQnOiAgJ29uUmlnaHRCdG5DbGljaydcblxuXG5cblxuICAgIyBSZW5kZXIgdGhlIHZpZXcgYW5kIHVwZGF0ZSB0aGUga2l0IGlmIG5vdCBhbHJlYWR5XG4gICAjIHNldCB2aWEgYSBwcmV2aW91cyBzZXNzaW9uXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAka2l0TGFiZWwgPSBAJGVsLmZpbmQgJy5sYWJlbC1raXQnXG5cbiAgICAgIGlmIEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJykgaXMgbnVsbFxuICAgICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAJGtpdExhYmVsLnRleHQgQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKS5nZXQgJ2xhYmVsJ1xuXG4gICAgICBAXG5cblxuXG5cbiAgICMgQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgaGFuZGluZyBjaGFuZ2VzIHJlbGF0ZWQgdG9cbiAgICMgc3dpdGNoaW5nIGRydW0ga2l0c1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9LSVQsIEBvbkNoYW5nZUtpdFxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGxlZnQgYnV0dG9uIGNsaWNrcy4gIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gYW5kXG4gICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcblxuICAgb25MZWZ0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ucHJldmlvdXNLaXQoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGxlZnQgYnV0dG9uIGNsaWNrcy4gIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gYW5kXG4gICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcblxuICAgb25SaWdodEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2UgZXZlbnRzLiAgVXBkYXRlcyB0aGUgbGFiZWwgb24gdGhlXG4gICAjIGtpdCBzZWxlY3RvclxuXG4gICBvbkNoYW5nZUtpdDogKG1vZGVsKSAtPlxuICAgICAgQGtpdE1vZGVsID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbFxuICAgICAgQCRraXRMYWJlbC50ZXh0IEBraXRNb2RlbC5nZXQgJ2xhYmVsJ1xuXG5cblxuXG5cbiAgICMgUFJJVkFURSBNRVRIT0RTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRTZWxlY3Rpb24iLCIjIyMqXG4gKiBTb3VuZCB0eXBlIHNlbGVjdG9yIGZvciBjaG9vc2luZyB3aGljaCBzb3VuZCBzaG91bGRcbiAqIHBsYXkgb24gZWFjaCB0cmFja1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblxuQXBwRXZlbnQgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2luc3RydW1lbnQtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEluc3RydW1lbnQgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgdmlldyBjbGFzc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdpbnN0cnVtZW50J1xuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgUmVmIHRvIHRoZSBJbnN0cnVtZW50TW9kZWxcbiAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cblxuICAgbW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgcGFyZW50IGtpdFxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdE1vZGVsOiBudWxsXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQnOiAnb25DbGljaydcblxuXG5cbiAgICMgSGFuZGxlciBmb3IgY2xpY2sgZXZlbnRzLiAgVXBkYXRlcyB0aGUgY3VycmVudCBpbnN0cnVtZW50IG1vZGVsLCB3aGljaFxuICAgIyBJbnN0cnVtZW50U2VsZWN0aW9uUGFuZWwgbGlzdGVucyB0bywgYW5kIGFkZHMgYSBzZWxlY3RlZCBzdGF0ZVxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAa2l0TW9kZWwuc2V0ICdjdXJyZW50SW5zdHJ1bWVudCcsIEBtb2RlbFxuICAgICAgQCRlbC5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnQiLCIjIyMqXG4gKiBQYW5lbCB3aGljaCBob3VzZXMgZWFjaCBpbmRpdmlkdWFsIHNlbGVjdGFibGUgc291bmRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbkluc3RydW1lbnQgID0gcmVxdWlyZSAnLi9JbnN0cnVtZW50LmNvZmZlZSdcbnRlbXBsYXRlICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvaW5zdHJ1bWVudC1wYW5lbC10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgSW5zdHJ1bWVudFNlbGVjdGlvblBhbmVsIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgUmVmIHRvIHRoZSBhcHBsaWNhdGlvbiBtb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8ga2l0IGNvbGxlY3Rpb25cbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRDb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBraXRcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIGluc3RydW1lbnQgdmlld3NcbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBpbnN0cnVtZW50Vmlld3M6IG51bGxcblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICdjbGljayAudGVzdCc6ICdvblRlc3RDbGljaydcblxuXG5cbiAgICMgSW5pdGlhbGl6ZXMgdGhlIGluc3RydW1lbnQgc2VsZWN0b3IgYW5kIHNldHMgYSBsb2NhbCByZWZcbiAgICMgdG8gdGhlIGN1cnJlbnQga2l0IG1vZGVsIGZvciBlYXN5IGFjY2Vzc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQGtpdE1vZGVsID0gQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKVxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYXMgd2VsbCBhcyB0aGUgYXNzb2NpYXRlZCBraXQgaW5zdHJ1bWVudHNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRjb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItaW5zdHJ1bWVudHMnXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW5kZXJzIGVhY2ggaW5kaXZpZHVhbCBraXQgbW9kZWwgaW50byBhbiBJbnN0cnVtZW50XG5cbiAgIHJlbmRlckluc3RydW1lbnRzOiAtPlxuICAgICAgQGluc3RydW1lbnRWaWV3cyA9IFtdXG5cbiAgICAgIEBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuZWFjaCAobW9kZWwpID0+XG4gICAgICAgICBpbnN0cnVtZW50ID0gbmV3IEluc3RydW1lbnRcbiAgICAgICAgICAgIGtpdE1vZGVsOiBAa2l0TW9kZWxcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuXG4gICAgICAgICBAJGNvbnRhaW5lci5hcHBlbmQgaW5zdHJ1bWVudC5yZW5kZXIoKS5lbFxuICAgICAgICAgQGluc3RydW1lbnRWaWV3cy5wdXNoIGluc3RydW1lbnRcblxuXG5cblxuICAgIyBBZGRzIGV2ZW50IGxpc3RlbmVycyByZWxhdGVkIHRvIGtpdCBjaGFuZ2VzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uS2l0Q2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGtpdE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cblxuICAgIyBSZW1vdmVzIGV2ZW50IGxpc3RlbmVyc1xuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cblxuXG4gICAjIEVWRU5UIExJU1RFTkVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIENsZWFucyB1cCB0aGUgdmlldyBhbmQgcmUtcmVuZGVyc1xuICAgIyB0aGUgaW5zdHJ1bWVudHMgdG8gdGhlIERPTVxuICAgIyBAcGFyYW0ge0tpdE1vZGVsfSBtb2RlbFxuXG4gICBvbktpdENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQHJlbW92ZUV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQGtpdE1vZGVsID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbFxuXG4gICAgICBfLmVhY2ggQGluc3RydW1lbnRWaWV3cywgKGluc3RydW1lbnQpIC0+XG4gICAgICAgICBpbnN0cnVtZW50LnJlbW92ZSgpXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICBvbkluc3RydW1lbnRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEAkY29udGFpbmVyLmZpbmQoJy5pbnN0cnVtZW50JykucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuXG5cbiAgIG9uVGVzdENsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudFNlbGVjdGlvblBhbmVsIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSd0ZXN0Jz5ORVhUPC9kaXY+XFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLWluc3RydW1lbnRzJz5cXG5cXG48L2Rpdj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiO1xuXG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz0naWNvbiBcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWNvbikgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWNvbjsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIic+KjwvZGl2PlxcbjxkaXYgY2xhc3M9J2xhYmVsJz5cXG5cdFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCIjIyMqXG4gKiBJbmRpdmlkdWFsIHNlcXVlbmNlciB0cmFja3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3BhdHRlcm4tc3F1YXJlLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlIGV4dGVuZHMgVmlld1xuXG5cbiAgIGNsYXNzTmFtZTogJ3BhdHRlcm4tc3F1YXJlJ1xuXG4gICB0YWdOYW1lOiAndGQnXG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCc6ICdvbkNsaWNrJ1xuXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBtb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1ZFTE9DSVRZLCBAb25WZWxvY2l0eUNoYW5nZVxuXG5cblxuICAgZW5hYmxlOiAtPlxuICAgICAgQG1vZGVsLmVuYWJsZSgpXG5cblxuICAgZGlzYWJsZTogLT5cbiAgICAgIEBtb2RlbC5kaXNhYmxlKClcblxuXG4gICBmbGFzaE9uOiAtPlxuICAgICAgQCRlbC5hZGRDbGFzcyAnZmxhc2gnXG5cblxuXG4gICBmbGFzaE9mZjogLT5cbiAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgJ2ZsYXNoJ1xuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgIG9uQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBtb2RlbC5jeWNsZSgpXG5cblxuXG4gICBvblZlbG9jaXR5Q2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICB2ZWxvY2l0eSA9IG1vZGVsLmNoYW5nZWQudmVsb2NpdHlcblxuICAgICAgQCRlbC5yZW1vdmVDbGFzcyAndmVsb2NpdHktbG93IHZlbG9jaXR5LW1lZGl1bSB2ZWxvY2l0eS1oaWdoJ1xuXG4gICAgICB2ZWxvY2l0eUNsYXNzID0gc3dpdGNoIHZlbG9jaXR5XG4gICAgICAgICB3aGVuIDEgdGhlbiAndmVsb2NpdHktbG93J1xuICAgICAgICAgd2hlbiAyIHRoZW4gJ3ZlbG9jaXR5LW1lZGl1bSdcbiAgICAgICAgIHdoZW4gMyB0aGVuICd2ZWxvY2l0eS1oaWdoJ1xuICAgICAgICAgZWxzZSAnJ1xuXG4gICAgICBAJGVsLmFkZENsYXNzIHZlbG9jaXR5Q2xhc3NcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmUiLCIjIyMqXG4gKiBJbmRpdmlkdWFsIHNlcXVlbmNlciB0cmFja3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5QYXR0ZXJuU3F1YXJlICA9IHJlcXVpcmUgJy4vUGF0dGVyblNxdWFyZS5jb2ZmZWUnXG5WaWV3ICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGF0dGVybi10cmFjay10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgUGF0dGVyblRyYWNrIGV4dGVuZHMgVmlld1xuXG4gICBjbGFzc05hbWU6ICdwYXR0ZXJuLXRyYWNrJ1xuICAgdGFnTmFtZTogJ3RyJ1xuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQHJlbmRlclBhdHRlcm5TcXVhcmVzKClcblxuICAgICAgQFxuXG5cbiAgIHJlbmRlclBhdHRlcm5TcXVhcmVzOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVWaWV3cyA9IFtdXG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgICAgcGF0dGVyblNxdWFyZSA9IG5ldyBQYXR0ZXJuU3F1YXJlXG4gICAgICAgICAgICBtb2RlbDogbW9kZWxcblxuICAgICAgICAgY29uc29sZS5sb2cgQCRlbFxuICAgICAgICAgQCRlbC5hcHBlbmQgcGF0dGVyblNxdWFyZS5yZW5kZXIoKS5lbFxuXG4gICAgICAgICBAcGF0dGVyblNxdWFyZVZpZXdzLnB1c2ggcGF0dGVyblNxdWFyZVxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuVHJhY2siLCIjIyMqXG4gKiBTZXF1ZW5jZXIgcGFyZW50IHZpZXcgZm9yIHRyYWNrIHNlcXVlbmNlc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zZXF1ZW5jZXItdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFNlcXVlbmNlciBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZXF1ZW5jZXIiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIlBhdHRlcm5zIHNxdWFyZVwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiO1xuXG5cbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIlNlcXVlbmNlclwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWRlY3JlYXNlJz5ERUNSRUFTRTwvYnV0dG9uPlxcbjxzcGFuIGNsYXNzPSdsYWJlbC1icG0nPjA8L3NwYW4+XFxuPGJ1dHRvbiBjbGFzcz0nYnRuLWluY3JlYXNlJz5JTkNSRUFTRTwvYnV0dG9uPlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWxlZnQnPkxFRlQ8L2J1dHRvbj5cXG48c3BhbiBjbGFzcz0nbGFiZWwta2l0Jz5EUlVNIEtJVDwvc3Bhbj5cXG48YnV0dG9uIGNsYXNzPSdidG4tcmlnaHQnPlJJR0hUPC9idXR0b24+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8YSBocmVmPScjL3NoYXJlJz5TSEFSRTwvYT5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuUHViU3ViICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9QdWJTdWInXG5QdWJFdmVudCA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvbGFuZGluZy10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgTGFuZGluZ1ZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5zdGFydC1idG4nOiAnb25TdGFydEJ0bkNsaWNrJ1xuXG5cbiAgIG9uU3RhcnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgUHViU3ViLnRyaWdnZXIgUHViRXZlbnQuUk9VVEUsXG4gICAgICAgICByb3V0ZTogJ2NyZWF0ZSdcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZGluZ1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxzcGFuIGNsYXNzPSdzdGFydC1idG4nPkNSRUFURTwvc3Bhbj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBTaGFyZSB0aGUgdXNlciBjcmVhdGVkIGJlYXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2hhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFNoYXJlVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlVmlldyIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGEgaHJlZj0nLyMnPk5FVzwvYT5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVzdHMtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFRlc3RzVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0c1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxoMT5Db21wb25lbnQgVmlld2VyPC9oMT5cXG5cXG48YnIgLz5cXG48cD5cXG5cdE1ha2Ugc3VyZSB0aGF0IDxiPmh0dHBzdGVyPC9iPiBpcyBydW5uaW5nIGluIHRoZSA8Yj5zb3VyY2U8L2I+IHJvdXRlIChucG0gaW5zdGFsbCAtZyBodHRwc3RlcikgPGJyLz5cXG5cdDxhIGhyZWY9XFxcImh0dHA6Ly9sb2NhbGhvc3Q6MzMzMy90ZXN0L2h0bWwvXFxcIj5Nb2NoYSBUZXN0IFJ1bm5lcjwvYT5cXG48L3A+XFxuXFxuPGJyIC8+XFxuPHVsPlxcblx0PGxpPjxhIGhyZWY9JyNraXQtc2VsZWN0aW9uJz5LaXQgU2VsZWN0aW9uPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2JwbS1pbmRpY2F0b3JcXFwiPkJQTSBJbmRpY2F0b3I8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjaW5zdHJ1bWVudC1zZWxlY3RvclxcXCI+SW5zdHJ1bWVudCBTZWxlY3RvcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNwYXR0ZXJuLXNxdWFyZVxcXCI+UGF0dGVybiBTcXVhcmU8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjcGF0dGVybi10cmFja1xcXCI+UGF0dGVybiBUcmFjazwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNzZXF1ZW5jZXJcXFwiPlNlcXVlbmNlcjwvYT48L2xpPlxcbjwvdWw+XCI7XG4gIH0pIiwiXG5kZXNjcmliZSAnTW9kZWxzJywgPT5cblxuICAgcmVxdWlyZSAnLi9zcGVjL21vZGVscy9QYXR0ZXJuVHJhY2tNb2RlbC1zcGVjLmNvZmZlZSdcbiAgIHJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvS2l0Q29sbGVjdGlvbi1zcGVjLmNvZmZlZSdcbiAgIHJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvS2l0TW9kZWwtc3BlYy5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1ZpZXdzJywgPT5cblxuICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUnXG4gICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0aW9uLXNwZWMuY29mZmVlJ1xuICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci1zcGVjLmNvZmZlZSdcblxuXG4gICBkZXNjcmliZSAnSW5zdHJ1bWVudCBTZWxlY3RvcicsID0+XG5cbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0aW9uUGFuZWwtc3BlYy5jb2ZmZWUnXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC1zcGVjLmNvZmZlZSdcblxuXG4gICBkZXNjcmliZSAnU2VxdWVuY2VyJywgPT5cblxuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLXNwZWMuY29mZmVlJ1xuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2stc3BlYy5jb2ZmZWUnXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci1zcGVjLmNvZmZlZSdcblxuXG5cbnJlcXVpcmUgJy4vc3BlYy92aWV3cy9zaGFyZS9TaGFyZVZpZXctc3BlYy5jb2ZmZWUnXG5yZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXctc3BlYy5jb2ZmZWUnXG5cblxuXG5yZXF1aXJlICcuL3NwZWMvbW9kZWxzL1NvdW5kQ29sbGVjdGlvbi1zcGVjLmNvZmZlZSdcbnJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvU291bmRNb2RlbC1zcGVjLmNvZmZlZSdcblxuIyBDb250cm9sbGVyc1xucmVxdWlyZSAnLi9zcGVjL0FwcENvbnRyb2xsZXItc3BlYy5jb2ZmZWUnXG4iLCJBcHBDb250cm9sbGVyID0gcmVxdWlyZSAnLi4vLi4vc3JjL3NjcmlwdHMvQXBwQ29udHJvbGxlci5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0FwcCBDb250cm9sbGVyJywgLT5cblxuICAgaXQgJ1Nob3VsZCBpbml0aWFsaXplJywgPT4iLCJBcHBDb25maWcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5cbmRlc2NyaWJlICdLaXQgQ29sbGVjdGlvbicsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cblxuICAgaXQgJ1Nob3VsZCBwYXJzZSB0aGUgcmVzcG9uc2UgYW5kIGFwcGVuZCBhbiBhc3NldFBhdGggdG8gZWFjaCBraXQgbW9kZWwnLCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdwYXRoJykuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCByZXR1cm4gdGhlIG5leHQga2l0JywgPT5cbiAgICAgIGtpdERhdGEgPSBAa2l0Q29sbGVjdGlvbi50b0pTT04oKVxuICAgICAga2l0ID0gQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG4gICAgICBraXQuZ2V0KCdsYWJlbCcpLnNob3VsZC5lcXVhbCBraXREYXRhWzFdLmxhYmVsXG5cblxuICAgaXQgJ1Nob3VsZCByZXR1cm4gdGhlIHByZXZpb3VzIGtpdCcsID0+XG4gICAgICBraXREYXRhID0gQGtpdENvbGxlY3Rpb24udG9KU09OKClcbiAgICAgIGtpdCA9IEBraXRDb2xsZWN0aW9uLnByZXZpb3VzS2l0KClcbiAgICAgIGtpdC5nZXQoJ2xhYmVsJykuc2hvdWxkLmVxdWFsIGtpdERhdGFba2l0RGF0YS5sZW5ndGgtMV0ubGFiZWwiLCJBcHBDb25maWcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlJ1xuXG5kZXNjcmliZSAnS2l0IE1vZGVsJywgLT5cblxuICAgYmVmb3JlRWFjaCA9PlxuXG4gICAgICBkYXRhID0ge1xuICAgICAgICAgXCJsYWJlbFwiOiBcIkhpcCBIb3BcIixcbiAgICAgICAgIFwiZm9sZGVyXCI6IFwiaGlwLWhvcFwiLFxuICAgICAgICAgXCJpbnN0cnVtZW50c1wiOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiQ2xvc2VkIEhpSGF0XCIsXG4gICAgICAgICAgICAgICBcInNyY1wiOiBcIkhBVF8yLm1wM1wiLFxuICAgICAgICAgICAgICAgXCJpY29uXCI6IFwiaWNvbi1oaWhhdC1jbG9zZWRcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJLaWNrIERydW1cIixcbiAgICAgICAgICAgICAgIFwic3JjXCI6IFwiS0lLXzIubXAzXCIsXG4gICAgICAgICAgICAgICBcImljb25cIjogXCJpY29uLWtpY2tkcnVtXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgIF1cbiAgICAgIH1cblxuICAgICAgQGtpdE1vZGVsID0gbmV3IEtpdE1vZGVsIGRhdGEsIHsgcGFyc2U6IHRydWUgfVxuXG5cbiAgIGl0ICdTaG91bGQgcGFyc2UgdGhlIG1vZGVsIGRhdGEgYW5kIGNvbnZlcnQgaW5zdHJ1bWVudHMgdG8gYW4gSW5zdHJ1bWVudHNDb2xsZWN0aW9uJywgPT5cbiAgICAgIEBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuc2hvdWxkLmJlLmFuLmluc3RhbmNlb2YgSW5zdHJ1bWVudENvbGxlY3Rpb24iLCJQYXR0ZXJuVHJhY2tNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrTW9kZWwuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdQYXR0ZXJuIFRyYWNrIE1vZGVsJywgLT5cblxuICAgaXQgJ1Nob3VsZCBleGlzdCcsIC0+IiwiXG5cbmRlc2NyaWJlICdTb3VuZCBDb2xsZWN0aW9uJywgLT5cblxuICAgaXQgJ1Nob3VsZCBpbml0aWFsaXplIHdpdGggYSBzb3VuZCBzZXQnLCA9PiIsIlxuXG5kZXNjcmliZSAnU291bmQgTW9kZWwnLCAtPlxuXG4gICBpdCAnU2hvdWxkIGluaXRpYWxpemUgd2l0aCBkZWZhdWx0IGNvbmZpZyBwcm9wZXJ0aWVzJywgPT4iLCJDcmVhdGVWaWV3ID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LmNvZmZlZSdcblxuXG5kZXNjcmliZSAnQ3JlYXRlIFZpZXcnLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBDcmVhdGVWaWV3XG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBleHBlY3QoQHZpZXcuZWwpLnRvLmV4aXN0IiwiQlBNSW5kaWNhdG9yID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSdcbkFwcE1vZGVsICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5BcHBFdmVudCAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuQXBwQ29uZmlnICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cbmRlc2NyaWJlICdCUE0gSW5kaWNhdG9yJywgLT5cblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBuZXcgQXBwTW9kZWwoKVxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgaWYgQHZpZXcudXBkYXRlSW50ZXJ2YWwgdGhlbiBjbGVhckludGVydmFsIEB2aWV3LnVwZGF0ZUludGVydmFsXG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuXG4gICAgICBAdmlldy5zaG91bGQuZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgZGlzcGxheSB0aGUgY3VycmVudCBCUE0gaW4gdGhlIGxhYmVsJywgPT5cblxuICAgICAgJGxhYmVsID0gQHZpZXcuJGVsLmZpbmQgJy5sYWJlbC1icG0nXG4gICAgICAkbGFiZWwudGV4dCgpLnNob3VsZC5lcXVhbCBTdHJpbmcoQHZpZXcuYXBwTW9kZWwuZ2V0KCdicG0nKSlcblxuXG5cbiAgIGl0ICdTaG91bGQgYXV0by1hZHZhbmNlIHRoZSBicG0gdmlhIHNldEludGVydmFsIG9uIHByZXNzJywgKGRvbmUpID0+XG5cbiAgICAgIEB2aWV3LmJwbUluY3JlYXNlQW1vdW50ID0gNTBcbiAgICAgIEB2aWV3LmludGVydmFsVXBkYXRlVGltZSA9IDFcbiAgICAgIGFwcE1vZGVsID0gQHZpZXcuYXBwTW9kZWxcbiAgICAgIGFwcE1vZGVsLnNldCAnYnBtJywgMVxuXG4gICAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAgICBicG0gPSBhcHBNb2RlbC5nZXQgJ2JwbSdcblxuICAgICAgICAgaWYgYnBtID49IDEyMFxuICAgICAgICAgICAgQHZpZXcub25CdG5VcCgpXG4gICAgICAgICAgICBkb25lKClcbiAgICAgICwgMTAwXG5cbiAgICAgIEB2aWV3Lm9uSW5jcmVhc2VCdG5Eb3duKClcblxuXG5cbiAgIGl0ICdTaG91bGQgY2xlYXIgdGhlIGludGVydmFsIG9uIHJlbGVhc2UnLCA9PlxuXG4gICAgICBAdmlldy5vbkluY3JlYXNlQnRuRG93bigpXG4gICAgICBAdmlldy51cGRhdGVJbnRlcnZhbC5zaG91bGQuZXhpc3RcbiAgICAgIEB2aWV3Lm9uQnRuVXAoKVxuICAgICAgZXhwZWN0KEB2aWV3LnVwZGF0ZUludGVydmFsKS50by5iZS5udWxsXG5cbiIsIktpdFNlbGVjdGlvbiAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0aW9uLmNvZmZlZSdcbkFwcE1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0TW9kZWwgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnS2l0IFNlbGVjdGlvbicsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgbW9kZWxzID0gW11cblxuICAgICAgXyg0KS50aW1lcyAoaW5kZXgpIC0+XG4gICAgICAgICBtb2RlbHMucHVzaCBuZXcgS2l0TW9kZWwge2xhYmVsOiBcImtpdCAje2luZGV4fVwifVxuXG5cbiAgICAgIEB2aWV3ID0gbmV3IEtpdFNlbGVjdGlvblxuICAgICAgICAgYXBwTW9kZWw6IG5ldyBBcHBNb2RlbCgpXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBuZXcgS2l0Q29sbGVjdGlvbiBtb2RlbHNcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cblxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cblxuXG4gICBpdCAnU2hvdWxkIGhhdmUgYSBsYWJlbCcsID0+XG5cbiAgICAgICRsYWJlbCA9IEB2aWV3LiRlbC5maW5kICcubGFiZWwta2l0J1xuICAgICAgJGxhYmVsLnRleHQgQHZpZXcua2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQgJ2xhYmVsJ1xuICAgICAgJGxhYmVsLnRleHQoKS5zaG91bGQuZXF1YWwgJ2tpdCAwJ1xuXG5cblxuXG4gICBpdCAnU2hvdWxkIHVwZGF0ZSB0aGUgQXBwTW9kZWwgYSBraXQgaXMgY2hhbmdlZCcsID0+XG5cbiAgICAgICRsYWJlbCA9IEB2aWV3LiRlbC5maW5kICcubGFiZWwta2l0J1xuICAgICAgZmlyc3RMYWJlbCA9IEB2aWV3LmtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0ICdsYWJlbCdcbiAgICAgIGxhc3RMYWJlbCAgPSBAdmlldy5raXRDb2xsZWN0aW9uLmF0KEB2aWV3LmtpdENvbGxlY3Rpb24ubGVuZ3RoLTEpLmdldCAnbGFiZWwnXG5cbiAgICAgIGFwcE1vZGVsID0gQHZpZXcuYXBwTW9kZWxcblxuICAgICAgYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpraXRNb2RlbCcpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm9uTGVmdEJ0bkNsaWNrKClcbiAgICAgICAgICRsYWJlbC50ZXh0KCkuc2hvdWxkLmVxdWFsIGxhc3RMYWJlbFxuXG4gICAgICBhcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmtpdE1vZGVsJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcub25SaWdodEJ0bkNsaWNrKClcbiAgICAgICAgICRsYWJlbC50ZXh0KCkuc2hvdWxkLmVxdWFsIGZpcnN0TGFiZWxcblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiIsIkluc3RydW1lbnQgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC5jb2ZmZWUnXG5LaXRNb2RlbCAgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnSW5zdHJ1bWVudCcsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQHZpZXcgPSBuZXcgSW5zdHJ1bWVudFxuICAgICAgICAga2l0TW9kZWw6IG5ldyBLaXRNb2RlbCgpXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCBhbGxvdyB1c2VyIHRvIHNlbGVjdCBpbnN0cnVtZW50cycsID0+XG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIGV4cGVjdChAdmlldy4kZWwuaGFzQ2xhc3MoJ3NlbGVjdGVkJykpLnRvLmJlLnRydWUiLCJJbnN0cnVtZW50U2VsZWN0aW9uUGFuZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdGlvblBhbmVsLmNvZmZlZSdcbkFwcENvbmZpZyAgICAgICAgICAgICAgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiAgICAgICAgICAgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdJbnN0cnVtZW50IFNlbGVjdGlvbiBQYW5lbCcsIC0+XG5cblxuICAgYmVmb3JlID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbCgpXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3Rpb25QYW5lbFxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy5zaG91bGQuZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVmZXIgdG8gdGhlIGN1cnJlbnQgS2l0TW9kZWwgd2hlbiBpbnN0YW50aWF0aW5nIHNvdW5kcycsID0+XG5cbiAgICAgIGV4cGVjdChAdmlldy5raXRNb2RlbCkudG8uZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgaXRlcmF0ZSBvdmVyIGFsbCBvZiB0aGUgc291bmRzIGluIHRoZSBTb3VuZENvbGxlY3Rpb24gdG8gYnVpbGQgb3V0IGluc3RydW1lbnRzJywgPT5cblxuICAgICAgQHZpZXcua2l0TW9kZWwudG9KU09OKCkuaW5zdHJ1bWVudHMubGVuZ3RoLnNob3VsZC5iZS5hYm92ZSgwKVxuXG4gICAgICAkaW5zdHJ1bWVudHMgPSBAdmlldy4kZWwuZmluZCgnLmNvbnRhaW5lci1pbnN0cnVtZW50cycpLmZpbmQoJy5pbnN0cnVtZW50JylcbiAgICAgICRpbnN0cnVtZW50cy5sZW5ndGguc2hvdWxkLmJlLmFib3ZlKDApXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlYnVpbGQgdmlldyB3aGVuIHRoZSBraXRNb2RlbCBjaGFuZ2VzJywgPT5cblxuICAgICAga2l0TW9kZWwgPSBAdmlldy5hcHBNb2RlbC5nZXQgJ2tpdE1vZGVsJ1xuICAgICAgbGVuZ3RoID0ga2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLnRvSlNPTigpLmxlbmd0aFxuXG4gICAgICAkaW5zdHJ1bWVudHMgPSBAdmlldy4kZWwuZmluZCgnLmNvbnRhaW5lci1pbnN0cnVtZW50cycpLmZpbmQoJy5pbnN0cnVtZW50JylcbiAgICAgICRpbnN0cnVtZW50cy5sZW5ndGguc2hvdWxkLmJlLmVxdWFsKGxlbmd0aClcblxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG4gICAgICBraXRNb2RlbCA9IEB2aWV3LmFwcE1vZGVsLmdldCAna2l0TW9kZWwnXG4gICAgICBsZW5ndGggPSBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykudG9KU09OKCkubGVuZ3RoXG5cbiAgICAgICRpbnN0cnVtZW50cyA9IEB2aWV3LiRlbC5maW5kKCcuY29udGFpbmVyLWluc3RydW1lbnRzJykuZmluZCgnLmluc3RydW1lbnQnKVxuICAgICAgJGluc3RydW1lbnRzLmxlbmd0aC5zaG91bGQuYmUuZXF1YWwobGVuZ3RoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIHNlbGVjdGlvbnMgZnJvbSBJbnN0cnVtZW50IGluc3RhbmNlcyBhbmQgdXBkYXRlIHRoZSBtb2RlbCcsID0+XG5cbiAgICAgIEB2aWV3LmtpdE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6Y3VycmVudEluc3RydW1lbnQnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5pbnN0cnVtZW50Vmlld3NbMF0ub25DbGljaygpXG5cbiAgICAgICAgICRzZWxlY3RlZCA9IEB2aWV3LiRlbC5maW5kKCcuY29udGFpbmVyLWluc3RydW1lbnRzJykuZmluZCgnLnNlbGVjdGVkJylcbiAgICAgICAgICRzZWxlY3RlZC5sZW5ndGguc2hvdWxkLmVxdWFsIDFcblxuXG5cbiIsIlBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnUGF0dGVybiBTcXVhcmUnLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgIG1vZGVsOiBuZXcgUGF0dGVyblNxdWFyZU1vZGVsKClcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIGN5Y2xlIHRocm91Z2ggdmVsb2NpdHkgdm9sdW1lcycsID0+XG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcubW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAxXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ3ZlbG9jaXR5LWxvdycpLnNob3VsZC5iZS50cnVlXG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcubW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAyXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ3ZlbG9jaXR5LW1lZGl1bScpLnNob3VsZC5iZS50cnVlXG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcubW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAzXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ3ZlbG9jaXR5LWhpZ2gnKS5zaG91bGQuYmUudHJ1ZVxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3Lm1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgMFxuICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKCd2ZWxvY2l0eS1oaWdoJykuc2hvdWxkLmJlLmZhbHNlXG5cblxuXG4gICBpdCAnU2hvdWxkIHRvZ2dsZSBvZmYnLCA9PlxuXG4gICAgICBAdmlldy5kaXNhYmxlKClcbiAgICAgIEB2aWV3Lm1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgMFxuXG5cblxuICAgaXQgJ1Nob3VsZCB0b2dnbGUgb24nLCA9PlxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcub25DbGljaygpXG5cblxuICAgICAgQHZpZXcuZGlzYWJsZSgpXG4gICAgICBAdmlldy5lbmFibGUoKVxuICAgICAgQHZpZXcubW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAxXG5cblxuXG4gICBpdCAnU2hvdWxkIHNob3VsZCBmbGFzaCB3aGVuIHBsYXlpbmcnLCA9PlxuXG4gICAgICBAdmlldy5mbGFzaE9uKClcbiAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygnZmxhc2gnKS5zaG91bGQuYmUudHJ1ZVxuICAgICAgQHZpZXcuZmxhc2hPZmYoKVxuICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKCdmbGFzaCcpLnNob3VsZC5iZS5mYWxzZVxuIiwiXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuVHJhY2tNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFja01vZGVsLmNvZmZlZSdcblBhdHRlcm5UcmFjayA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnUGF0dGVybiBUcmFjaycsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgc3F1YXJlcyA9IFtdXG5cbiAgICAgIF8oOCkudGltZXMgPT5cbiAgICAgICAgIHNxdWFyZXMucHVzaCBuZXcgUGF0dGVyblNxdWFyZU1vZGVsKClcblxuICAgICAgQHZpZXcgPSBuZXcgUGF0dGVyblRyYWNrXG4gICAgICAgICBjb2xsZWN0aW9uOiBuZXcgUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gc3F1YXJlc1xuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IGNoaWxkIHNxdWFyZXMnLCA9PlxuICAgICAgQHZpZXcuJGVsLmZpbmQoJy5wYXR0ZXJuLXNxdWFyZScpLmxlbmd0aC5zaG91bGQuZXF1YWwgOFxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBwYXR0ZXJuIHNxdWFyZXMnLCA9PlxuICAgICAgQHZpZXcuY29sbGVjdGlvbi5zaG91bGQudHJpZ2dlcignY2hhbmdlOnZlbG9jaXR5Jykud2hlbiA9PlxuICAgICAgICAgQHZpZXcucGF0dGVyblNxdWFyZVZpZXdzWzBdLm9uQ2xpY2soKVxuXG5cbiAgIGl0ICdTaG91bGQgZGlzcGF0Y2ggY2hhbmdlcyBiYWNrIHRvIHRoZSBwYXJlbnQnLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgdXBkYXRlIGVhY2ggUGF0dGVyblNxdWFyZSBtb2RlbCB3aGVuIHRoZSBraXQgY2hhbmdlcycsID0+IiwiU2VxdWVuY2VyID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1NlcXVlbmNlcicsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQHZpZXcgPSBuZXcgU2VxdWVuY2VyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCAtPlxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIG91dCBlYWNoIHBhdHRlcm4gdHJhY2snLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgdXBkYXRlIGVhY2ggcGF0dGVybiB0cmFjayB3aGVuIHRoZSBraXQgY2hhbmdlcycsID0+XG5cblxuICAgaXQgJ1Nob3VsZCBwbGF5JywgPT5cblxuXG4gICBpdCAnU2hvdWxkIG5vdGlmaXkgZWFjaCB0cmFjayB3aGVyZSBpdHMgcGxheXN0YXRlIGlzJywgPT5cblxuXG4gICBpdCAnU2hvdWxkIGxpc3RlbiBmb3IgdGVtcG8gY2hhbmdlcycsID0+XG5cblxuICAgaXQgJ1Nob3VsZCBiZSBtdXRhYmxlJywgPT5cblxuXG4gICBpdCAnU2hvdWxkIGJlIGFibGUgdG8gZ2xvYmFsbHkgdXBkYXRlIGl0cyB2b2x1bWUnLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgYmUgbGFiZWxlZCBwcm9wZXJseScsID0+IiwiQXBwQ29udHJvbGxlciA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSdcbkxhbmRpbmdWaWV3ICAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUnXG5cbmRlc2NyaWJlICdMYW5kaW5nIFZpZXcnLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBMYW5kaW5nVmlld1xuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cbiAgICAgIGlmIEBhcHBDb250cm9sbGVyIHRoZW4gQGFwcENvbnRyb2xsZXIucmVtb3ZlKClcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5lbCkudG8uZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVkaXJlY3QgdG8gY3JlYXRlIHBhZ2Ugb24gY2xpY2snLCAoZG9uZSkgPT5cblxuICAgICAgQGFwcENvbnRyb2xsZXIgPSBuZXcgQXBwQ29udHJvbGxlcigpXG4gICAgICByb3V0ZXIgPSBAYXBwQ29udHJvbGxlci5hcHBSb3V0ZXJcbiAgICAgICRzdGFydEJ0biA9IEB2aWV3LiRlbC5maW5kICcuc3RhcnQtYnRuJ1xuXG4gICAgICAkc3RhcnRCdG4ub24gJ2NsaWNrJywgKGV2ZW50KSA9PlxuICAgICAgICAgJ2NyZWF0ZScuc2hvdWxkLnJvdXRlLnRvIHJvdXRlciwgJ2NyZWF0ZVJvdXRlJ1xuICAgICAgICAgZG9uZSgpXG5cbiAgICAgICRzdGFydEJ0bi5jbGljaygpXG5cblxuXG5cblxuXG5cblxuIiwiU2hhcmVWaWV3ID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1NoYXJlIFZpZXcnLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBTaGFyZVZpZXdcbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5lbCkudG8uZXhpc3RcblxuXG4gICBpdCAnU2hvdWxkIGFjY2VwdCBhIFNvdW5kU2hhcmUgb2JqZWN0JywgPT5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciB0aGUgdmlzdWFsaXphdGlvbiBsYXllcicsID0+XG5cblxuICAgaXQgJ1Nob3VsZCBwYXVzZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gdHJhY2sgb24gaW5pdCcsID0+XG5cblxuICAgaXQgJ1Nob3VsZCB0b2dnbGUgdGhlIHBsYXkgLyBwYXVzZSBidXR0b24nLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgZGlzcGxheSB0aGUgdXNlcnMgc29uZyB0aXRsZSBhbmQgdXNlcm5hbWUnLCA9PlxuIl19

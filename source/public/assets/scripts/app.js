(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * digits
 * Copyright (c) 2013 Jon Schlinkert
 * Licensed under the MIT License (MIT)
 */

'use strict';

/**
 * Pad numbers with zeros.
 * Automatically pad the number of digits based on the length of the array,
 * or explicitly pass in the number of digits to use.
 *
 * @param  {Number} num  The number to pad.
 * @param  {Object} opts Options object with `digits` and `auto` properties.
 *    {
 *      auto: array.length // pass in the length of the array
 *      digits: 4          // or pass in the number of digits to use
 *    }
 * @return {Number}      The padded number with zeros prepended
 *
 * @examples:
 *  1      => 000001
 *  10     => 000010
 *  100    => 000100
 *  1000   => 001000
 *  10000  => 010000
 *  100000 => 100000
 */

exports.pad = function (num, opts) {
  var digits = opts.digits || 3;
  if(opts.auto && typeof opts.auto === 'number') {
    digits = String(opts.auto).length;
  }
  var lenDiff = digits - String(num).length;
  var padding = '';
  if (lenDiff > 0) {
    while (lenDiff--) {
      padding += '0';
    }
  }
  return padding + num;
};

/**
 * Strip leading digits from a string
 * @param  {String} str The string from which to strip digits
 * @return {String}     The modified string
 */

exports.stripleft = function(str) {
  return str.replace(/^\d+\-?/g, '');
};

/**
 * Strip trailing digits from a string
 * @param  {String} str The string from which to strip digits
 * @return {String}     The modified string
 */

exports.stripright = function(str) {
  return str.replace(/\-?\d+$/g, '');
};

/**
 * Count digits on the left side of a string
 * @param  {String} str The string with digits to count
 * @return {String}     The modified string
 * @example
 *  "001-foo.md" => 3
 */

exports.countleft = function(str) {
  return String(str.match(/^\d+/g)).length;
};

/**
 * Count digits on the right side of a string
 * @param  {String} str The string with digits to count
 * @return {String}     The modified string
 * @example
 *  "001-foo.md" => 3
 */

exports.countright = function(str) {
  return String(str.match(/\d+$/g)).length;
};
},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
module.exports = exports = require('handlebars/lib/handlebars/base.js').create()
require('handlebars/lib/handlebars/utils.js').attach(exports)
require('handlebars/lib/handlebars/runtime.js').attach(exports)
},{"handlebars/lib/handlebars/base.js":2,"handlebars/lib/handlebars/runtime.js":3,"handlebars/lib/handlebars/utils.js":4}],6:[function(require,module,exports){

/**
 * Primary application controller
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppController, AppModel, AppRouter, CreateView, LandingView, ShareView, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppModel = require('./models/AppModel.coffee');

AppRouter = require('./routers/AppRouter.coffee');

LandingView = require('./views/landing/LandingView.coffee');

CreateView = require('./views/create/CreateView.coffee');

ShareView = require('./views/share/ShareView.coffee');

View = require('./supers/View.coffee');

AppController = (function(_super) {
  __extends(AppController, _super);

  function AppController() {
    return AppController.__super__.constructor.apply(this, arguments);
  }

  AppController.prototype.className = 'wrapper';

  AppController.prototype.initialize = function(options) {
    AppController.__super__.initialize.call(this, options);
    this.appModel = new AppModel;
    this.appModel.set('kitModel', this.kitCollection.at(0));
    this.landingView = new LandingView;
    this.shareView = new ShareView;
    this.createView = new CreateView({
      appModel: this.appModel,
      kitCollection: this.kitCollection
    });
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
    if (previousView != null) {
      previousView.hide({
        remove: true
      });
    }
    this.$el.append(currentView.render().el);
    return currentView.show();
  };

  return AppController;

})(View);

module.exports = AppController;


},{"./models/AppModel.coffee":12,"./routers/AppRouter.coffee":22,"./supers/View.coffee":23,"./views/create/CreateView.coffee":26,"./views/landing/LandingView.coffee":46,"./views/share/ShareView.coffee":48}],7:[function(require,module,exports){

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
  BPM: 320,
  BPM_MAX: 1000,
  VELOCITY_MAX: 3,
  VOLUME_LEVELS: {
    low: .2,
    medium: .5,
    high: 1
  },
  returnAssetPath: function(assetType) {
    return this.ASSETS.path + '/' + this.ASSETS[assetType];
  },
  returnTestAssetPath: function(assetType) {
    return '/test/html/' + this.ASSETS.path + '/' + this.ASSETS[assetType];
  }
};

module.exports = AppConfig;


},{}],8:[function(require,module,exports){

/**
 * Application related events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent;

AppEvent = {
  CHANGE_ACTIVE: 'change:active',
  CHANGE_BPM: 'change:bpm',
  CHANGE_DRAGGING: 'change:dragging',
  CHANGE_DROPPED: 'change:dropped',
  CHANGE_FOCUS: 'change:focus',
  CHANGE_INSTRUMENT: 'change:currentInstrument',
  CHANGE_KIT: 'change:kitModel',
  CHANGE_MUTE: 'change:mute',
  CHANGE_PLAYING: 'change:playing',
  CHANGE_TRIGGER: 'change:trigger',
  CHANGE_VELOCITY: 'change:velocity'
};

module.exports = AppEvent;


},{}],9:[function(require,module,exports){

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


},{}],10:[function(require,module,exports){

var digits = require('digits');
var handlebars = require('handleify')

handlebars.registerHelper('repeat', function(n, options) {
    options = options || {};
    var _data = {};
    if (options._data) {
      _data = handlebars.createFrame(options._data);
    }

    var content = '';
    var count = n - 1;
    for (var i = 0; i <= count; i++) {
      _data = {
        index: digits.pad((i + 1), {auto: n})
      };
      content += options.fn(this, {data: _data});
    }
    return new handlebars.SafeString(content);
  });
},{"digits":1,"handleify":5}],11:[function(require,module,exports){

/**
 * MPC Application bootstrapper
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppConfig, AppController, KitCollection, Touch, helpers;

Touch = require('./utils/Touch');

AppConfig = require('./config/AppConfig.coffee');

KitCollection = require('./models/kits/KitCollection.coffee');

AppController = require('./AppController.coffee');

helpers = require('./helpers/handlebars-helpers');

$(function() {
  var appController, kitCollection;
  Touch.translateTouchEvents();
  kitCollection = new KitCollection({
    parse: true
  });
  kitCollection.fetch({
    async: false,
    url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'
  });
  appController = new AppController({
    kitCollection: kitCollection
  });
  return appController.render();
});


},{"./AppController.coffee":6,"./config/AppConfig.coffee":7,"./helpers/handlebars-helpers":10,"./models/kits/KitCollection.coffee":13,"./utils/Touch":25}],12:[function(require,module,exports){

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
    'playing': null,
    'mute': null,
    'kitModel': null,
    'bpm': AppConfig.BPM
  }
});

module.exports = AppRouter;


},{"../config/AppConfig.coffee":7}],13:[function(require,module,exports){

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

  KitCollection.prototype.findInstrumentModel = function(id) {
    var instrumentModel;
    instrumentModel = null;
    this.each((function(_this) {
      return function(kitModel) {
        return kitModel.get('instruments').each(function(model) {
          if (id === model.get('id')) {
            return instrumentModel = model;
          }
        });
      };
    })(this));
    if (instrumentModel === null) {
      return false;
    }
    return instrumentModel;
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


},{"../../config/AppConfig.coffee":7,"./KitModel.coffee":14}],14:[function(require,module,exports){

/**
 * Kit model for handling state related to kit selection
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var InstrumentCollection, KitModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

InstrumentCollection = require('../sequencer/InstrumentCollection.coffee');

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
      instrument.id = _.uniqueId('instrument-');
      return instrument.src = response.path + '/' + instrument.src;
    });
    response.instruments = new InstrumentCollection(response.instruments);
    return response;
  };

  return KitModel;

})(Backbone.Model);

module.exports = KitModel;


},{"../sequencer/InstrumentCollection.coffee":18}],15:[function(require,module,exports){

/**
 * Model for the entire Pad component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
 */
var LivePadModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

LivePadModel = (function(_super) {
  __extends(LivePadModel, _super);

  function LivePadModel() {
    return LivePadModel.__super__.constructor.apply(this, arguments);
  }

  return LivePadModel;

})(Backbone.Model);

module.exports = LivePadModel;


},{}],16:[function(require,module,exports){

/**
 * Collection of individual PadSquareModels
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
 */
var InstrumentModel, PadSquareCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

InstrumentModel = require('../sequencer/InstrumentModel.coffee');

PadSquareCollection = (function(_super) {
  __extends(PadSquareCollection, _super);

  function PadSquareCollection() {
    return PadSquareCollection.__super__.constructor.apply(this, arguments);
  }

  PadSquareCollection.prototype.model = InstrumentModel;

  return PadSquareCollection;

})(Backbone.Collection);

module.exports = PadSquareCollection;


},{"../sequencer/InstrumentModel.coffee":19}],17:[function(require,module,exports){

/**
 * Model for individual pad squares.
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
 */
var PadSquareModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PadSquareModel = (function(_super) {
  __extends(PadSquareModel, _super);

  function PadSquareModel() {
    return PadSquareModel.__super__.constructor.apply(this, arguments);
  }

  PadSquareModel.prototype.defaults = {
    'dragging': false,
    'keycode': null,
    'trigger': false,
    'currentInstrument': null
  };

  PadSquareModel.prototype.initialize = function(options) {
    PadSquareModel.__super__.initialize.call(this, options);
    return this.set('id', _.uniqueId('pad-square-'));
  };

  return PadSquareModel;

})(Backbone.Model);

module.exports = PadSquareModel;


},{}],18:[function(require,module,exports){

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

  InstrumentCollection.prototype.exportPatternSquares = function() {
    return this.map((function(_this) {
      return function(instrument) {
        return instrument.get('patternSquares');
      };
    })(this));
  };

  return InstrumentCollection;

})(Backbone.Collection);

module.exports = InstrumentCollection;


},{"./InstrumentModel.coffee":19}],19:[function(require,module,exports){

/**
 * Sound model for each individual kit sound set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppConfig, InstrumentModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../config/AppConfig.coffee');

InstrumentModel = (function(_super) {
  __extends(InstrumentModel, _super);

  function InstrumentModel() {
    return InstrumentModel.__super__.constructor.apply(this, arguments);
  }

  InstrumentModel.prototype.defaults = {
    'active': null,
    'dropped': null,
    'focus': null,
    'icon': null,
    'label': null,
    'mute': null,
    'src': null,
    'volume': null,
    'patternSquares': null
  };

  return InstrumentModel;

})(Backbone.Model);

module.exports = InstrumentModel;


},{"../../config/AppConfig.coffee":7}],20:[function(require,module,exports){

/**
  A collection of individual pattern squares

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppConfig, InstrumentModel, PatternSquareCollection, PatternSquareModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../config/AppConfig.coffee');

PatternSquareModel = require('./PatternSquareModel.coffee');

InstrumentModel = require('../sequencer/InstrumentModel.coffee');

PatternSquareCollection = (function(_super) {
  __extends(PatternSquareCollection, _super);

  function PatternSquareCollection() {
    return PatternSquareCollection.__super__.constructor.apply(this, arguments);
  }

  PatternSquareCollection.prototype.model = InstrumentModel;

  return PatternSquareCollection;

})(Backbone.Collection);

module.exports = PatternSquareCollection;


},{"../../config/AppConfig.coffee":7,"../sequencer/InstrumentModel.coffee":19,"./PatternSquareModel.coffee":21}],21:[function(require,module,exports){

/**
  Model for individual pattern squares.  Part of larger Pattern Track collection

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppConfig, AppEvent, PatternSquareModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppEvent = require('../../events/AppEvent.coffee');

AppConfig = require('../../config/AppConfig.coffee');

PatternSquareModel = (function(_super) {
  __extends(PatternSquareModel, _super);

  function PatternSquareModel() {
    return PatternSquareModel.__super__.constructor.apply(this, arguments);
  }

  PatternSquareModel.prototype.defaults = {
    'active': false,
    'instrument': null,
    'previousVelocity': 0,
    'trigger': null,
    'velocity': 0
  };

  PatternSquareModel.prototype.initialize = function(options) {
    PatternSquareModel.__super__.initialize.call(this, options);
    return this.on(AppEvent.CHANGE_VELOCITY, this.onVelocityChange);
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


},{"../../config/AppConfig.coffee":7,"../../events/AppEvent.coffee":8}],22:[function(require,module,exports){

/**
 * MPC Application router
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppConfig, AppRouter, BPMIndicator, InstrumentCollection, InstrumentModel, InstrumentSelectorPanel, KitCollection, KitModel, KitSelector, LivePad, LivePadModel, PadSquare, PadSquareCollection, PadSquareModel, PatternSquare, PatternSquareCollection, PatternSquareModel, PatternTrack, PubEvent, PubSub, Sequencer, TestsView, View,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../config/AppConfig.coffee');

PubSub = require('../utils/PubSub');

PubEvent = require('../events/PubEvent.coffee');

TestsView = require('../views/tests/TestsView.coffee');

View = require('../supers/View.coffee');

KitSelector = require('../views/create/components/KitSelector.coffee');

KitCollection = require('../models/kits/KitCollection.coffee');

KitModel = require('../models/kits/KitModel.coffee');

BPMIndicator = require('../views/create/components/BPMIndicator.coffee');

InstrumentSelectorPanel = require('../views/create/components/instruments/InstrumentSelectorPanel.coffee');

InstrumentModel = '../models/sequencer/InstrumentModel.coffee';

InstrumentCollection = '../models/sequencer/InstrumentCollection.coffee';

PatternSquare = require('../views/create/components/sequencer/PatternSquare.coffee');

PatternSquareModel = require('../models/sequencer/PatternSquareModel.coffee');

PatternSquareCollection = require('../models/sequencer/PatternSquareCollection.coffee');

PatternTrack = require('../views/create/components/sequencer/PatternTrack.coffee');

Sequencer = require('../views/create/components/sequencer/Sequencer.coffee');

LivePadModel = require('../models/pad/LivePadModel.coffee');

PadSquareCollection = require('../models/pad/PadSquareCollection.coffee');

PadSquareModel = require('../models/pad/PadSquareModel.coffee');

LivePad = require('../views/create/components/pad/LivePad.coffee');

PadSquare = require('../views/create/components/pad/PadSquare.coffee');

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
    'sequencer': 'sequencerRoute',
    'full-sequencer': 'fullSequencerRoute',
    'pad-square': 'padSquareRoute',
    'live-pad': 'livePadRoute'
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
    var view;
    this.kitCollection = new KitCollection({
      parse: true
    });
    this.kitCollection.fetch({
      async: false,
      url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'
    });
    view = new KitSelector({
      appModel: this.appModel,
      kitCollection: this.kitCollection
    }, {
      appModel: this.appModel
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
    view = new InstrumentSelectorPanel({
      kitCollection: this.kitCollection,
      appModel: this.appModel
    });
    return this.appModel.set('view', view);
  };

  AppRouter.prototype.patternSquareRoute = function() {
    var view;
    this.kitCollection = new KitCollection({
      parse: true
    });
    this.kitCollection.fetch({
      async: false,
      url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'
    });
    view = new PatternSquare({
      patternSquareModel: new PatternSquareModel()
    });
    return this.appModel.set('view', view);
  };

  AppRouter.prototype.patternTrackRoute = function() {
    var view;
    this.kitCollection = new KitCollection({
      parse: true
    });
    this.kitCollection.fetch({
      async: false,
      url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'
    });
    view = new PatternTrack({
      model: this.kitCollection.at(0).get('instruments').at(0)
    });
    return this.appModel.set('view', view);
  };

  AppRouter.prototype.sequencerRoute = function() {
    var view;
    this.kitCollection = new KitCollection({
      parse: true
    });
    this.kitCollection.fetch({
      async: false,
      url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'
    });
    view = new Sequencer({
      appModel: this.appModel,
      collection: this.kitCollection.at(0).get('instruments')
    });
    return this.appModel.set('view', view);
  };

  AppRouter.prototype.fullSequencerRoute = function() {
    var bpm, fullSequencerView, instrumentSelection, kitSelection, sequencer;
    this.kitCollection = new KitCollection({
      parse: true
    });
    this.kitCollection.fetch({
      async: false,
      url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'
    });
    kitSelection = (function(_this) {
      return function() {
        var view;
        view = new KitSelector({
          appModel: _this.appModel,
          kitCollection: _this.kitCollection
        });
        return view;
      };
    })(this);
    bpm = (function(_this) {
      return function() {
        var view;
        view = new BPMIndicator({
          appModel: _this.appModel
        });
        return view;
      };
    })(this);
    instrumentSelection = (function(_this) {
      return function() {
        var view;
        _this.appModel.set('kitModel', _this.kitCollection.at(0));
        view = new InstrumentSelectorPanel({
          kitCollection: _this.kitCollection,
          appModel: _this.appModel
        });
        return view;
      };
    })(this);
    sequencer = (function(_this) {
      return function() {
        var view;
        view = new Sequencer({
          appModel: _this.appModel,
          collection: _this.kitCollection.at(0).get('instruments')
        });
        return view;
      };
    })(this);
    fullSequencerView = new View();
    fullSequencerView.$el.append(kitSelection().render().el);
    fullSequencerView.$el.append(bpm().render().el);
    fullSequencerView.$el.append(instrumentSelection().render().el);
    fullSequencerView.$el.append(sequencer().render().el);
    return this.appModel.set('view', fullSequencerView);
  };

  AppRouter.prototype.padSquareRoute = function() {
    var view;
    this.kitCollection = new KitCollection({
      parse: true
    });
    this.kitCollection.fetch({
      async: false,
      url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'
    });
    view = new PadSquare({
      model: new PadSquareModel(),
      collection: this.kitCollection
    });
    return this.appModel.set('view', view);
  };

  AppRouter.prototype.livePadRoute = function() {
    var view;
    this.kitCollection = new KitCollection({
      parse: true
    });
    this.kitCollection.fetch({
      async: false,
      url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'
    });
    view = new LivePad({
      appModel: this.appModel,
      kitCollection: this.kitCollection
    });
    return this.appModel.set('view', view);
  };

  return AppRouter;

})(Backbone.Router);

module.exports = AppRouter;


},{"../config/AppConfig.coffee":7,"../events/PubEvent.coffee":9,"../models/kits/KitCollection.coffee":13,"../models/kits/KitModel.coffee":14,"../models/pad/LivePadModel.coffee":15,"../models/pad/PadSquareCollection.coffee":16,"../models/pad/PadSquareModel.coffee":17,"../models/sequencer/PatternSquareCollection.coffee":20,"../models/sequencer/PatternSquareModel.coffee":21,"../supers/View.coffee":23,"../utils/PubSub":24,"../views/create/components/BPMIndicator.coffee":27,"../views/create/components/KitSelector.coffee":28,"../views/create/components/instruments/InstrumentSelectorPanel.coffee":30,"../views/create/components/pad/LivePad.coffee":33,"../views/create/components/pad/PadSquare.coffee":34,"../views/create/components/sequencer/PatternSquare.coffee":37,"../views/create/components/sequencer/PatternTrack.coffee":38,"../views/create/components/sequencer/Sequencer.coffee":39,"../views/tests/TestsView.coffee":50}],23:[function(require,module,exports){

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


},{}],24:[function(require,module,exports){
/**
 * @module     PubSub
 * @desc       Global PubSub object for dispatch and delegation
 */

'use strict'

var PubSub = {}

_.extend( PubSub, Backbone.Events )

module.exports = PubSub
},{}],25:[function(require,module,exports){
/**
 * Touch related utilities
 *
 */

var Touch = {


  /**
   * Delegate touch events to mouse if not on a touch device
   */

  translateTouchEvents: function () {

    if (! ('ontouchstart' in window )) {
      $(document).delegate( 'body', 'mousedown', function(e) {
        $(e.target).trigger( 'touchstart' )
      })

      $(document).delegate( 'body', 'mouseup', function(e) {
        $(e.target).trigger( 'touchend' )
      })
    }
  }

}

module.exports = Touch
},{}],26:[function(require,module,exports){

/**
 * Create view which the user can build beats within
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var BPMIndicator, CreateView, InstrumentSelectorPanel, KitSelector, Sequencer, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('../../supers/View.coffee');

KitSelector = require('../../views/create/components/KitSelector.coffee');

InstrumentSelectorPanel = require('../../views/create/components/instruments/InstrumentSelectorPanel.coffee');

Sequencer = require('../../views/create/components/sequencer/Sequencer.coffee');

BPMIndicator = require('../../views/create/components/BPMIndicator.coffee');

template = require('./templates/create-template.hbs');

CreateView = (function(_super) {
  __extends(CreateView, _super);

  function CreateView() {
    return CreateView.__super__.constructor.apply(this, arguments);
  }

  CreateView.prototype.template = template;

  CreateView.prototype.initialize = function(options) {
    return CreateView.__super__.initialize.call(this, options);
  };

  CreateView.prototype.render = function(options) {
    CreateView.__super__.render.call(this, options);
    this.$kitSelectorContainer = this.$el.find('.container-kit-selector');
    this.$kitSelector = this.$el.find('.kit-selector');
    this.$visualizationContainer = this.$el.find('.container-visualization');
    this.$sequencerContainer = this.$el.find('.container-sequencer');
    this.$instrumentSelector = this.$sequencerContainer.find('.instrument-selector');
    this.$sequencer = this.$sequencerContainer.find('.sequencer');
    this.$bpm = this.$sequencerContainer.find('.bpm');
    this.$shareBtn = this.$sequencerContainer.find('.btn-share');
    this.renderKitSelector();
    this.renderInstrumentSelector();
    this.renderSequencer();
    this.renderBPM();
    return this;
  };

  CreateView.prototype.renderKitSelector = function() {
    this.kitSelector = new KitSelector({
      appModel: this.appModel,
      kitCollection: this.kitCollection
    });
    return this.$kitSelector.html(this.kitSelector.render().el);
  };

  CreateView.prototype.renderInstrumentSelector = function() {
    this.instrumentSelector = new InstrumentSelectorPanel({
      appModel: this.appModel,
      kitCollection: this.kitCollection
    });
    return this.$instrumentSelector.html(this.instrumentSelector.render().el);
  };

  CreateView.prototype.renderSequencer = function() {
    this.sequencer = new Sequencer({
      appModel: this.appModel,
      collection: this.kitCollection.at(0).get('instruments')
    });
    return this.$sequencer.html(this.sequencer.render().el);
  };

  CreateView.prototype.renderBPM = function() {
    this.bpm = new BPMIndicator({
      appModel: this.appModel
    });
    return this.$bpm.html(this.bpm.render().el);
  };

  return CreateView;

})(View);

module.exports = CreateView;


},{"../../supers/View.coffee":23,"../../views/create/components/BPMIndicator.coffee":27,"../../views/create/components/KitSelector.coffee":28,"../../views/create/components/instruments/InstrumentSelectorPanel.coffee":30,"../../views/create/components/sequencer/Sequencer.coffee":39,"./templates/create-template.hbs":45}],27:[function(require,module,exports){

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

  BPMIndicator.prototype.bpmIncreaseAmount = 10;

  BPMIndicator.prototype.currBPM = null;

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
    this.currBPM = this.appModel.get('bpm');
    this.$bpmLabel.text(this.currBPM);
    this.onBtnUp();
    return this;
  };

  BPMIndicator.prototype.addEventListeners = function() {
    return this.listenTo(this.appModel, AppEvent.CHANGE_BPM, this.onBPMChange);
  };

  BPMIndicator.prototype.increaseBPM = function() {
    return this.updateInterval = setInterval((function(_this) {
      return function() {
        var bpm;
        bpm = _this.currBPM;
        if (bpm < AppConfig.BPM_MAX) {
          bpm += _this.bpmIncreaseAmount;
        } else {
          bpm = AppConfig.BPM_MAX;
        }
        _this.currBPM = bpm;
        return _this.$bpmLabel.text(_this.currBPM);
      };
    })(this), this.intervalUpdateTime);
  };

  BPMIndicator.prototype.decreaseBPM = function() {
    return this.updateInterval = setInterval((function(_this) {
      return function() {
        var bpm;
        bpm = _this.currBPM;
        if (bpm > 0) {
          bpm -= _this.bpmIncreaseAmount;
        } else {
          bpm = 0;
        }
        _this.currBPM = bpm;
        return _this.$bpmLabel.text(_this.currBPM);
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
    this.updateInterval = null;
    return this.appModel.set('bpm', 60000 / this.currBPM);
  };

  BPMIndicator.prototype.onBPMChange = function(model) {};

  return BPMIndicator;

})(View);

module.exports = BPMIndicator;


},{"../../../config/AppConfig.coffee":7,"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":23,"./templates/bpm-template.hbs":43}],28:[function(require,module,exports){

/**
 * Kit selector for switching between drum-kit sounds
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent, KitSelector, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppEvent = require('../../../events/AppEvent.coffee');

View = require('../../../supers/View.coffee');

template = require('./templates/kit-selection-template.hbs');

KitSelector = (function(_super) {
  __extends(KitSelector, _super);

  function KitSelector() {
    return KitSelector.__super__.constructor.apply(this, arguments);
  }

  KitSelector.prototype.appModel = null;

  KitSelector.prototype.kitCollection = null;

  KitSelector.prototype.kitModel = null;

  KitSelector.prototype.template = template;

  KitSelector.prototype.events = {
    'touchend .btn-left': 'onLeftBtnClick',
    'touchend .btn-right': 'onRightBtnClick'
  };

  KitSelector.prototype.render = function(options) {
    KitSelector.__super__.render.call(this, options);
    this.$kitLabel = this.$el.find('.label-kit');
    if (this.appModel.get('kitModel') === null) {
      this.appModel.set('kitModel', this.kitCollection.at(0));
    }
    this.$kitLabel.text(this.appModel.get('kitModel').get('label'));
    return this;
  };

  KitSelector.prototype.addEventListeners = function() {
    return this.listenTo(this.appModel, AppEvent.CHANGE_KIT, this.onChangeKit);
  };

  KitSelector.prototype.onLeftBtnClick = function(event) {
    return this.appModel.set('kitModel', this.kitCollection.previousKit());
  };

  KitSelector.prototype.onRightBtnClick = function(event) {
    return this.appModel.set('kitModel', this.kitCollection.nextKit());
  };

  KitSelector.prototype.onChangeKit = function(model) {
    this.kitModel = model.changed.kitModel;
    return this.$kitLabel.text(this.kitModel.get('label'));
  };

  return KitSelector;

})(View);

module.exports = KitSelector;


},{"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":23,"./templates/kit-selection-template.hbs":44}],29:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":23,"./templates/instrument-template.hbs":32}],30:[function(require,module,exports){

/**
 * Panel which houses each individual selectable sound
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent, Instrument, InstrumentSelectorPanel, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppEvent = require('../../../../events/AppEvent.coffee');

View = require('../../../../supers/View.coffee');

Instrument = require('./Instrument.coffee');

template = require('./templates/instrument-panel-template.hbs');

InstrumentSelectorPanel = (function(_super) {
  __extends(InstrumentSelectorPanel, _super);

  function InstrumentSelectorPanel() {
    this.onInstrumentChange = __bind(this.onInstrumentChange, this);
    this.onKitChange = __bind(this.onKitChange, this);
    return InstrumentSelectorPanel.__super__.constructor.apply(this, arguments);
  }

  InstrumentSelectorPanel.prototype.template = template;

  InstrumentSelectorPanel.prototype.appModel = null;

  InstrumentSelectorPanel.prototype.kitCollection = null;

  InstrumentSelectorPanel.prototype.kitModel = null;

  InstrumentSelectorPanel.prototype.instrumentViews = null;

  InstrumentSelectorPanel.prototype.initialize = function(options) {
    InstrumentSelectorPanel.__super__.initialize.call(this, options);
    return this.kitModel = this.appModel.get('kitModel');
  };

  InstrumentSelectorPanel.prototype.render = function(options) {
    InstrumentSelectorPanel.__super__.render.call(this, options);
    this.$container = this.$el.find('.container-instruments');
    this.renderInstruments();
    return this;
  };

  InstrumentSelectorPanel.prototype.renderInstruments = function() {
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

  InstrumentSelectorPanel.prototype.addEventListeners = function() {
    this.listenTo(this.appModel, AppEvent.CHANGE_KIT, this.onKitChange);
    return this.listenTo(this.kitModel, AppEvent.CHANGE_INSTRUMENT, this.onInstrumentChange);
  };

  InstrumentSelectorPanel.prototype.removeEventListeners = function() {
    return this.stopListening();
  };

  InstrumentSelectorPanel.prototype.onKitChange = function(model) {
    this.removeEventListeners();
    this.kitModel = model.changed.kitModel;
    _.each(this.instrumentViews, function(instrument) {
      return instrument.remove();
    });
    this.renderInstruments();
    return this.addEventListeners();
  };

  InstrumentSelectorPanel.prototype.onInstrumentChange = function(model) {
    return this.$container.find('.instrument').removeClass('selected');
  };

  InstrumentSelectorPanel.prototype.onTestClick = function(event) {
    return this.appModel.set('kitModel', this.kitCollection.nextKit());
  };

  return InstrumentSelectorPanel;

})(View);

module.exports = InstrumentSelectorPanel;


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":23,"./Instrument.coffee":29,"./templates/instrument-panel-template.hbs":31}],31:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='container-instruments'>\n\n</div>";
  })
},{"handleify":5}],32:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function";


  buffer += "<div class='icon ";
  if (stack1 = helpers.icon) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.icon; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'></div>\n<div class='label'>\n	";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>";
  return buffer;
  })
},{"handleify":5}],33:[function(require,module,exports){

/**
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
 */
var AppEvent, LivePad, PadSquare, PadSquareCollection, PadSquareModel, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppEvent = require('../../../../events/AppEvent.coffee');

PadSquareCollection = require('../../../../models/pad/PadSquareCollection.coffee');

PadSquareModel = require('../../../../models/pad/PadSquareModel.coffee');

View = require('../../../../supers/View.coffee');

PadSquare = require('./PadSquare.coffee');

template = require('./templates/live-pad-template.hbs');

LivePad = (function(_super) {
  __extends(LivePad, _super);

  function LivePad() {
    this.onInstrumentDrop = __bind(this.onInstrumentDrop, this);
    this.onDroppedChange = __bind(this.onDroppedChange, this);
    return LivePad.__super__.constructor.apply(this, arguments);
  }

  LivePad.prototype.className = 'container-live-pad';

  LivePad.prototype.template = template;

  LivePad.prototype.appModel = null;

  LivePad.prototype.kitCollection = null;

  LivePad.prototype.instrumentCollection = null;

  LivePad.prototype.padSquareCollection = null;

  LivePad.prototype.padSquareViews = null;

  LivePad.prototype.keymap = ['1', '2', '3', '4', 'q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'];

  LivePad.prototype.render = function(options) {
    LivePad.__super__.render.call(this, {
      padTable: this.returnPadTableData(),
      instrumentTable: this.returnInstrumentTableData()
    });
    _.each(this.padSquareViews, (function(_this) {
      return function(padSquare) {
        var id;
        id = padSquare.model.get('id');
        return _this.$el.find("#" + id).html(padSquare.render().el);
      };
    })(this));
    this.$padContainer = this.$el.find('.container-pads');
    this.$instrumentContainer = this.$el.find('.container-instruments');
    this.$instrument = this.$el.find('.instrument');
    this.setDragAndDrop();
    return this;
  };

  LivePad.prototype.addEventListeners = function() {};

  LivePad.prototype.onDroppedChange = function(instrumentModel) {
    var $padSquare, instrumentId, padSquareId, padSquareModel;
    instrumentId = instrumentModel.get('id');
    $padSquare = this.$el.find("." + instrumentId);
    padSquareId = $padSquare.attr('id');
    padSquareModel = this.padSquareCollection.findWhere({
      id: padSquareId
    });
    if (padSquareModel !== void 0) {
      return padSquareModel.set('currentInstrument', instrumentModel);
    }
  };

  LivePad.prototype.onInstrumentDrop = function(dragged, dropped) {
    var $dragged, $dropped, id, instrumentModel;
    $dragged = $(dragged);
    $dropped = $(dropped);
    id = $dragged.attr('id');
    $dropped.addClass(id);
    instrumentModel = this.kitCollection.findInstrumentModel(id);
    return instrumentModel.set('dropped', true);
  };

  LivePad.prototype.setDragAndDrop = function() {
    var $droppables, self;
    self = this;
    $droppables = this.$el.find('.container-pad');
    return this.draggable = Draggable.create(this.$instrument, {
      bounds: window,
      onDrag: function(event) {
        var i, _results;
        i = $droppables.length;
        _results = [];
        while (--i > -1) {
          if (this.hitTest($droppables[i], '50%')) {
            _results.push($($droppables[i]).addClass('highlight'));
          } else {
            _results.push($($droppables[i]).removeClass('highlight'));
          }
        }
        return _results;
      },
      onDragEnd: function(event) {
        var i, _results;
        i = $droppables.length;
        _results = [];
        while (--i > -1) {
          if (this.hitTest($droppables[i], '50%')) {
            _results.push(self.onInstrumentDrop(this.target, $droppables[i]));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    });
  };

  LivePad.prototype.returnPadTableData = function() {
    var iterator, padTable, rows;
    this.padSquareCollection = new PadSquareCollection();
    this.padSquareViews = [];
    padTable = {};
    rows = [];
    iterator = 0;
    _(4).times((function(_this) {
      return function(index) {
        var tds;
        tds = [];
        _(4).times(function(index) {
          var model, padSquare;
          model = new PadSquareModel({
            keycode: _this.keymap[iterator]
          });
          padSquare = new PadSquare({
            model: model,
            collection: _this.kitCollection
          });
          _this.padSquareCollection.add(model);
          _this.padSquareViews.push(padSquare);
          iterator++;
          return tds.push({
            id: padSquare.model.get('id')
          });
        });
        return rows.push({
          id: "pad-row-" + index,
          tds: tds
        });
      };
    })(this));
    padTable.rows = rows;
    return padTable;
  };

  LivePad.prototype.returnInstrumentTableData = function() {
    var instrumentTable;
    instrumentTable = this.kitCollection.map((function(_this) {
      return function(kit) {
        var instrumentCollection, instruments;
        instrumentCollection = kit.get('instruments');
        _this.listenTo(instrumentCollection, AppEvent.CHANGE_DROPPED, _this.onDroppedChange);
        instruments = instrumentCollection.map(function(instrument) {
          return instrument.toJSON();
        });
        return {
          label: kit.get('label'),
          instruments: instruments
        };
      };
    })(this));
    return instrumentTable;
  };

  return LivePad;

})(View);

module.exports = LivePad;


},{"../../../../events/AppEvent.coffee":8,"../../../../models/pad/PadSquareCollection.coffee":16,"../../../../models/pad/PadSquareModel.coffee":17,"../../../../supers/View.coffee":23,"./PadSquare.coffee":34,"./templates/live-pad-template.hbs":35}],34:[function(require,module,exports){

/**
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
 */
var AppConfig, AppEvent, PadSquare, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../../../config/AppConfig.coffee');

AppEvent = require('../../../../events/AppEvent.coffee');

View = require('../../../../supers/View.coffee');

template = require('./templates/pad-square-template.hbs');

PadSquare = (function(_super) {
  __extends(PadSquare, _super);

  function PadSquare() {
    this.onSoundEnd = __bind(this.onSoundEnd, this);
    this.onInstrumentChange = __bind(this.onInstrumentChange, this);
    this.onTriggerChange = __bind(this.onTriggerChange, this);
    this.onHold = __bind(this.onHold, this);
    this.onClick = __bind(this.onClick, this);
    return PadSquare.__super__.constructor.apply(this, arguments);
  }

  PadSquare.prototype.tagName = 'div';

  PadSquare.prototype.className = 'pad-square';

  PadSquare.prototype.template = template;

  PadSquare.prototype.model = null;

  PadSquare.prototype.currentIcon = null;

  PadSquare.prototype.audioPlayback = null;

  PadSquare.prototype.events = {
    'touchend': 'onClick'
  };

  PadSquare.prototype.render = function(options) {
    PadSquare.__super__.render.call(this, options);
    this.$iconContainer = this.$el.find('.container-icon');
    this.$icon = this.$iconContainer.find('.icon');
    return this;
  };

  PadSquare.prototype.remove = function() {
    var _ref;
    if ((_ref = this.audioPlayback) != null) {
      _ref.unload();
    }
    return PadSquare.__super__.remove.call(this);
  };

  PadSquare.prototype.addEventListeners = function() {
    this.listenTo(this.model, AppEvent.CHANGE_TRIGGER, this.onTriggerChange);
    return this.listenTo(this.model, AppEvent.CHANGE_INSTRUMENT, this.onInstrumentChange);
  };

  PadSquare.prototype.updateInstrumentClass = function() {
    var instrument;
    instrument = this.model.get('currentInstrument');
    return this.$el.addClass(instrument.get('id'));
  };

  PadSquare.prototype.renderIcon = function() {
    var instrument;
    if (this.$icon.hasClass(this.currentIcon)) {
      this.$icon.removeClass(this.currentIcon);
    }
    instrument = this.model.get('currentInstrument');
    if (instrument !== null) {
      this.currentIcon = instrument.get('icon');
      this.$icon.addClass(this.currentIcon);
      return this.$icon.text(instrument.get('label'));
    }
  };

  PadSquare.prototype.setSound = function() {
    var audioSrc, instrument, _ref;
    if ((_ref = this.audioPlayback) != null) {
      _ref.unload();
    }
    instrument = this.model.get('currentInstrument');
    if (instrument !== null) {
      audioSrc = instrument.get('src');
      if (window.location.href.indexOf('test') !== -1) {
        audioSrc = '';
      }
      return this.audioPlayback = new Howl({
        volume: AppConfig.VOLUME_LEVELS.medium,
        urls: [audioSrc],
        onend: this.onSoundEnd
      });
    }
  };

  PadSquare.prototype.removeSound = function() {
    var icon, id, _ref;
    if ((_ref = this.audioPlayback) != null) {
      _ref.unload();
    }
    id = this.model.get('currentInstrument').get('id');
    icon = this.model.get('currentInstrument').get('icon');
    this.$el.removeClass(id);
    this.$icon.removeClass(icon);
    return _.defer((function(_this) {
      return function() {
        return _this.model.set('currentInstrument', null);
      };
    })(this));
  };

  PadSquare.prototype.playSound = function() {
    var _ref;
    if ((_ref = this.audioPlayback) != null) {
      _ref.play();
    }
    return this.model.set('trigger', false);
  };

  PadSquare.prototype.onClick = function(event) {
    this.model.set('trigger', true);
    return console.log('hey');
  };

  PadSquare.prototype.onHold = function(event) {
    return this.model.set('dragging', true);
  };

  PadSquare.prototype.onDrag = function(event) {
    return this.model.set('dragging', true);
  };

  PadSquare.prototype.onDrop = function(id) {
    var instrumentModel;
    instrumentModel = this.collection.findInstrumentModel(id);
    instrumentModel.set('dropped', true);
    return this.model.set({
      'dragging': false,
      'dropped': true,
      'currentInstrument': instrumentModel
    });
  };

  PadSquare.prototype.onTriggerChange = function(model) {
    var playing;
    playing = model.changed.playing;
    if (playing) {
      return this.playSound();
    }
  };

  PadSquare.prototype.onInstrumentChange = function(model) {
    var instrument;
    instrument = model.changed.currentInstrument;
    if (!(instrument === null || instrument === void 0)) {
      this.updateInstrumentClass();
      this.renderIcon();
      return this.setSound();
    }
  };

  PadSquare.prototype.onSoundEnd = function() {
    return this.model.set('trigger', false);
  };

  return PadSquare;

})(View);

module.exports = PadSquare;


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":23,"./templates/pad-square-template.hbs":36}],35:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, functionType="function", self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n		<tr>\n			";
  stack1 = helpers.each.call(depth0, depth0.tds, {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n		</tr>\n	";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n				<td class='container-pad' id=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n\n				</td>\n			";
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n		<div class='container-instrument'>\n			<h3>\n				<b>";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</b>\n			</h3>\n\n			";
  stack1 = helpers.each.call(depth0, depth0.instruments, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n		</div>\n	";
  return buffer;
  }
function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n				<div class='instrument' id=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n					";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n				</div>\n			";
  return buffer;
  }

  buffer += "<table class='container-pads'>\n	";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.padTable),stack1 == null || stack1 === false ? stack1 : stack1.rows), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</table>\n\n\n<div class='container-instruments'>\n	";
  stack2 = helpers.each.call(depth0, depth0.instrumentTable, {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</div>";
  return buffer;
  })
},{"handleify":5}],36:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function";


  buffer += "<div class='key-code'>\n	";
  if (stack1 = helpers.keycode) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.keycode; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n\n<div class='container-icon'>\n	<div class='icon'>\n\n	</div>\n</div>";
  return buffer;
  })
},{"handleify":5}],37:[function(require,module,exports){

/**
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppConfig, AppEvent, PatternSquare, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../../../config/AppConfig.coffee');

AppEvent = require('../../../../events/AppEvent.coffee');

View = require('../../../../supers/View.coffee');

template = require('./templates/pattern-square-template.hbs');

PatternSquare = (function(_super) {
  __extends(PatternSquare, _super);

  function PatternSquare() {
    this.onSoundEnd = __bind(this.onSoundEnd, this);
    this.onTriggerChange = __bind(this.onTriggerChange, this);
    return PatternSquare.__super__.constructor.apply(this, arguments);
  }

  PatternSquare.prototype.className = 'pattern-square';

  PatternSquare.prototype.tagName = 'td';

  PatternSquare.prototype.template = template;

  PatternSquare.prototype.audioPlayback = null;

  PatternSquare.prototype.patternSquareModel = null;

  PatternSquare.prototype.events = {
    'touchend': 'onClick'
  };

  PatternSquare.prototype.render = function(options) {
    var audioSrc;
    PatternSquare.__super__.render.call(this, options);
    audioSrc = this.patternSquareModel.get('instrument').get('src');
    if (window.location.href.indexOf('test') !== -1) {
      audioSrc = '';
    }
    this.audioPlayback = new Howl({
      volume: AppConfig.VOLUME_LEVELS.low,
      urls: [audioSrc],
      onend: this.onSoundEnd
    });
    return this;
  };

  PatternSquare.prototype.remove = function() {
    this.audioPlayback.unload();
    return PatternSquare.__super__.remove.call(this);
  };

  PatternSquare.prototype.addEventListeners = function() {
    this.listenTo(this.patternSquareModel, AppEvent.CHANGE_VELOCITY, this.onVelocityChange);
    this.listenTo(this.patternSquareModel, AppEvent.CHANGE_ACTIVE, this.onActiveChange);
    return this.listenTo(this.patternSquareModel, AppEvent.CHANGE_TRIGGER, this.onTriggerChange);
  };

  PatternSquare.prototype.enable = function() {
    return this.patternSquareModel.enable();
  };

  PatternSquare.prototype.disable = function() {
    return this.patternSquareModel.disable();
  };

  PatternSquare.prototype.play = function() {
    this.audioPlayback.play();
    return TweenMax.to(this.$el, .2, {
      ease: Back.easeIn,
      scale: .5,
      onComplete: (function(_this) {
        return function() {
          return TweenMax.to(_this.$el, .2, {
            scale: 1,
            ease: Back.easeOut
          });
        };
      })(this)
    });
  };

  PatternSquare.prototype.onClick = function(event) {
    return this.patternSquareModel.cycle();
  };

  PatternSquare.prototype.onVelocityChange = function(model) {
    var velocity, velocityClass, volume;
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
    this.$el.addClass(velocityClass);
    volume = (function() {
      switch (velocity) {
        case 1:
          return AppConfig.VOLUME_LEVELS.low;
        case 2:
          return AppConfig.VOLUME_LEVELS.medium;
        case 3:
          return AppConfig.VOLUME_LEVELS.high;
        default:
          return '';
      }
    })();
    return this.audioPlayback.volume(volume);
  };

  PatternSquare.prototype.onActiveChange = function(model) {};

  PatternSquare.prototype.onTriggerChange = function(model) {
    if (model.changed.trigger === true) {
      return this.play();
    }
  };

  PatternSquare.prototype.onSoundEnd = function() {
    return this.patternSquareModel.set('trigger', false);
  };

  return PatternSquare;

})(View);

module.exports = PatternSquare;


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":23,"./templates/pattern-square-template.hbs":40}],38:[function(require,module,exports){

/**
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent, PatternSquare, PatternSquareCollection, PatternSquareModel, PatternTrack, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppEvent = require('../../../../events/AppEvent.coffee');

PatternSquareCollection = require('../../../../models/sequencer/PatternSquareCollection.coffee');

PatternSquareModel = require('../../../../models/sequencer/PatternSquareModel.coffee');

PatternSquare = require('./PatternSquare.coffee');

View = require('../../../../supers/View.coffee');

template = require('./templates/pattern-track-template.hbs');

PatternTrack = (function(_super) {
  __extends(PatternTrack, _super);

  function PatternTrack() {
    this.onMuteBtnClick = __bind(this.onMuteBtnClick, this);
    this.onLabelClick = __bind(this.onLabelClick, this);
    this.onInstrumentChange = __bind(this.onInstrumentChange, this);
    return PatternTrack.__super__.constructor.apply(this, arguments);
  }

  PatternTrack.prototype.className = 'pattern-track';

  PatternTrack.prototype.tagName = 'tr';

  PatternTrack.prototype.template = template;

  PatternTrack.prototype.patternSquareViews = null;

  PatternTrack.prototype.collection = null;

  PatternTrack.prototype.model = null;

  PatternTrack.prototype.events = {
    'touchend .label-instrument': 'onLabelClick',
    'touchend .btn-mute': 'onMuteBtnClick'
  };

  PatternTrack.prototype.render = function(options) {
    PatternTrack.__super__.render.call(this, options);
    this.$label = this.$el.find('.label-instrument');
    this.renderPatternSquares();
    return this;
  };

  PatternTrack.prototype.remove = function() {
    _.each(this.patternSquareViews, (function(_this) {
      return function(square) {
        return square.remove();
      };
    })(this));
    return PatternTrack.__super__.remove.call(this);
  };

  PatternTrack.prototype.addEventListeners = function() {
    this.kitModel = this.appModel.get('kitModel');
    this.listenTo(this.model, AppEvent.CHANGE_FOCUS, this.onFocusChange);
    this.listenTo(this.model, AppEvent.CHANGE_MUTE, this.onMuteChange);
    return this.listenTo(this.kitModel, AppEvent.CHANGE_INSTRUMENT, this.onInstrumentChange);
  };

  PatternTrack.prototype.renderPatternSquares = function() {
    this.patternSquareViews = [];
    this.collection = new PatternSquareCollection;
    _(8).times((function(_this) {
      return function() {
        return _this.collection.add(new PatternSquareModel({
          instrument: _this.model
        }));
      };
    })(this));
    this.collection.each((function(_this) {
      return function(model) {
        var patternSquare;
        patternSquare = new PatternSquare({
          patternSquareModel: model
        });
        _this.$label.text(model.get('label'));
        _this.$el.append(patternSquare.render().el);
        return _this.patternSquareViews.push(patternSquare);
      };
    })(this));
    return this.model.set('patternSquares', this.collection);
  };

  PatternTrack.prototype.mute = function() {
    return this.model.set('mute', true);
  };

  PatternTrack.prototype.unmute = function() {
    return this.model.set('mute', false);
  };

  PatternTrack.prototype.select = function() {
    return this.$el.addClass('selected');
  };

  PatternTrack.prototype.deselect = function() {
    if (this.$el.hasClass('selected')) {
      return this.$el.removeClass('selected');
    }
  };

  PatternTrack.prototype.focus = function() {
    return this.$el.addClass('focus');
  };

  PatternTrack.prototype.unfocus = function() {
    if (this.$el.hasClass('focus')) {
      return this.$el.removeClass('focus');
    }
  };

  PatternTrack.prototype.onInstrumentChange = function(instrumentModel) {
    var instrument;
    instrument = instrumentModel.changed.currentInstrument;
    if (instrument.cid === this.model.cid) {
      return this.select();
    } else {
      return this.deselect();
    }
  };

  PatternTrack.prototype.onMuteChange = function(model) {
    var mute;
    mute = model.changed.mute;
    if (mute) {
      return this.$el.addClass('mute');
    } else {
      return this.$el.removeClass('mute');
    }
  };

  PatternTrack.prototype.onFocusChange = function(model) {
    if (model.changed.focus) {
      return this.focus();
    } else {
      return this.unfocus();
    }
  };

  PatternTrack.prototype.onLabelClick = function(event) {
    if (this.model.get('mute') !== true) {
      return this.model.set('focus', !this.model.get('focus'));
    }
  };

  PatternTrack.prototype.onMuteBtnClick = function(event) {
    if (this.model.get('mute')) {
      return this.unmute();
    } else {
      return this.mute();
    }
  };

  return PatternTrack;

})(View);

module.exports = PatternTrack;


},{"../../../../events/AppEvent.coffee":8,"../../../../models/sequencer/PatternSquareCollection.coffee":20,"../../../../models/sequencer/PatternSquareModel.coffee":21,"../../../../supers/View.coffee":23,"./PatternSquare.coffee":37,"./templates/pattern-track-template.hbs":41}],39:[function(require,module,exports){

/**
 * Sequencer parent view for track sequences
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent, PatternTrack, Sequencer, View, helpers, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PatternTrack = require('./PatternTrack.coffee');

AppEvent = require('../../../../events/AppEvent.coffee');

View = require('../../../../supers/View.coffee');

helpers = require('../../../../helpers/handlebars-helpers');

template = require('./templates/sequencer-template.hbs');

Sequencer = (function(_super) {
  __extends(Sequencer, _super);

  function Sequencer() {
    this.onFocusChange = __bind(this.onFocusChange, this);
    this.onKitChange = __bind(this.onKitChange, this);
    this.onMuteChange = __bind(this.onMuteChange, this);
    this.onPlayingChange = __bind(this.onPlayingChange, this);
    this.onBPMChange = __bind(this.onBPMChange, this);
    this.updateTime = __bind(this.updateTime, this);
    this.renderTracks = __bind(this.renderTracks, this);
    return Sequencer.__super__.constructor.apply(this, arguments);
  }

  Sequencer.prototype.className = 'sequencer-container';

  Sequencer.prototype.template = template;

  Sequencer.prototype.patternTrackViews = null;

  Sequencer.prototype.bpmInterval = null;

  Sequencer.prototype.updateIntervalTime = 200;

  Sequencer.prototype.currBeatCellId = -1;

  Sequencer.prototype.numCells = 7;

  Sequencer.prototype.appModel = null;

  Sequencer.prototype.collection = null;

  Sequencer.prototype.render = function(options) {
    Sequencer.__super__.render.call(this, options);
    this.$thStepper = this.$el.find('th.stepper');
    this.$sequencer = this.$el.find('.sequencer');
    this.renderTracks();
    this.play();
    return this;
  };

  Sequencer.prototype.remove = function() {
    _.each(this.patternTrackViews, (function(_this) {
      return function(track) {
        return track.remove();
      };
    })(this));
    this.pause();
    return Sequencer.__super__.remove.call(this);
  };

  Sequencer.prototype.addEventListeners = function() {
    this.listenTo(this.appModel, AppEvent.CHANGE_BPM, this.onBPMChange);
    this.listenTo(this.appModel, AppEvent.CHANGE_PLAYING, this.onPlayingChange);
    this.listenTo(this.appModel, AppEvent.CHANGE_KIT, this.onKitChange);
    return this.listenTo(this.collection, AppEvent.CHANGE_FOCUS, this.onFocusChange);
  };

  Sequencer.prototype.renderTracks = function() {
    this.$el.find('.pattern-track').remove();
    this.patternTrackViews = [];
    return this.collection.each((function(_this) {
      return function(model) {
        var patternTrack;
        patternTrack = new PatternTrack({
          appModel: _this.appModel,
          collection: model.get('patternSquares'),
          model: model
        });
        _this.patternTrackViews.push(patternTrack);
        return _this.$sequencer.append(patternTrack.render().el);
      };
    })(this));
  };

  Sequencer.prototype.updateTime = function() {
    this.$thStepper.removeClass('step');
    this.currBeatCellId = this.currBeatCellId < this.numCells ? this.currBeatCellId += 1 : this.currBeatCellId = 0;
    $(this.$thStepper[this.currBeatCellId]).addClass('step');
    return this.playAudio();
  };

  Sequencer.prototype.convertBPM = function() {
    return 200;
  };

  Sequencer.prototype.play = function() {
    return this.appModel.set('playing', true);
  };

  Sequencer.prototype.pause = function() {
    return this.appModel.set('playing', false);
  };

  Sequencer.prototype.mute = function() {
    return this.appModel.set('mute', true);
  };

  Sequencer.prototype.unmute = function() {
    return this.appModel.set('mute', false);
  };

  Sequencer.prototype.playAudio = function() {
    var focusedInstrument;
    focusedInstrument = this.collection.findWhere({
      focus: true
    });
    if (focusedInstrument) {
      if (focusedInstrument.get('mute') !== true) {
        focusedInstrument.get('patternSquares').each((function(_this) {
          return function(patternSquare, index) {
            return _this.playPatternSquareAudio(patternSquare, index);
          };
        })(this));
      }
      return;
    }
    return this.collection.each((function(_this) {
      return function(instrument) {
        if (instrument.get('mute') !== true) {
          return instrument.get('patternSquares').each(function(patternSquare, index) {
            return _this.playPatternSquareAudio(patternSquare, index);
          });
        }
      };
    })(this));
  };

  Sequencer.prototype.playPatternSquareAudio = function(patternSquare, index) {
    if (this.currBeatCellId === index) {
      if (patternSquare.get('active')) {
        return patternSquare.set('trigger', true);
      }
    }
  };

  Sequencer.prototype.onBPMChange = function(model) {
    clearInterval(this.bpmInterval);
    this.updateIntervalTime = model.changed.bpm;
    return this.bpmInterval = setInterval(this.updateTime, this.updateIntervalTime);
  };

  Sequencer.prototype.onPlayingChange = function(model) {
    var playing;
    playing = model.changed.playing;
    if (playing) {
      return this.bpmInterval = setInterval(this.updateTime, this.updateIntervalTime);
    } else {
      clearInterval(this.bpmInterval);
      return this.bpmInterval = null;
    }
  };

  Sequencer.prototype.onMuteChange = function(model) {};

  Sequencer.prototype.onKitChange = function(model) {
    var oldInstrumentCollection, oldPatternSquares;
    this.collection = model.changed.kitModel.get('instruments');
    this.renderTracks();
    oldInstrumentCollection = model._previousAttributes.kitModel.get('instruments');
    oldPatternSquares = oldInstrumentCollection.exportPatternSquares();
    return this.collection.each(function(instrumentModel, index) {
      var newCollection, oldCollection, oldProps;
      oldCollection = oldPatternSquares[index];
      newCollection = instrumentModel.get('patternSquares');
      oldProps = oldInstrumentCollection.at(index);
      if (oldProps !== void 0) {
        oldProps = oldProps.toJSON();
        instrumentModel.set({
          volume: oldProps.volume,
          active: oldProps.active,
          mute: oldProps.mute,
          focus: oldProps.focus
        });
      }
      if (oldCollection !== void 0) {
        return newCollection.each(function(patternSquare, index) {
          var oldPatternSquare;
          oldPatternSquare = oldCollection.at(index);
          return patternSquare.set(oldPatternSquare.toJSON());
        });
      }
    });
  };

  Sequencer.prototype.onFocusChange = function(model) {
    return this.collection.each((function(_this) {
      return function(instrumentModel) {
        if (model.changed.focus === true) {
          if (model.cid !== instrumentModel.cid) {
            return instrumentModel.set('focus', false);
          }
        }
      };
    })(this));
  };

  return Sequencer;

})(View);

module.exports = Sequencer;


},{"../../../../events/AppEvent.coffee":8,"../../../../helpers/handlebars-helpers":10,"../../../../supers/View.coffee":23,"./PatternTrack.coffee":38,"./templates/sequencer-template.hbs":42}],40:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })
},{"handleify":5}],41:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<td class='label-instrument'>\n	";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n</td>\n<td class='btn-mute'>\n	mute\n</td>\n";
  return buffer;
  })
},{"handleify":5}],42:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  return "\n			<th class='stepper'></th>\n		";
  }

  buffer += "<table class='sequencer'>\n	<tr>\n		<th></th>\n		<th></th>\n\n		";
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data};
  stack2 = ((stack1 = helpers.repeat || depth0.repeat),stack1 ? stack1.call(depth0, 8, options) : helperMissing.call(depth0, "repeat", 8, options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n	</tr>\n\n</table>";
  return buffer;
  })
},{"handleify":5}],43:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-decrease'>DECREASE</button>\n<span class='label-bpm'>0</span>\n<button class='btn-increase'>INCREASE</button>";
  })
},{"handleify":5}],44:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-left'>LEFT</button>\n<span class='label-kit'>DRUM KIT</span>\n<button class='btn-right'>RIGHT</button>";
  })
},{"handleify":5}],45:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='container-kit-selector'>\n	<div class='kit-selector'></div>\n</div>\n<div class='container-visualization'>Visualization</div>\n\n<div class='container-sequencer'>\n\n	<div class='instrument-selector'>Instrument Selector</div>\n	<div class='sequencer'>Sequencer</div>\n	<div class='bpm'>BPM</div>\n	<div class='btn-share'>SHARE</div>\n\n</div>";
  })
},{"handleify":5}],46:[function(require,module,exports){

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


},{"../../events/PubEvent.coffee":9,"../../supers/View.coffee":23,"../../utils/PubSub":24,"./templates/landing-template.hbs":47}],47:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<span class='start-btn'>CREATE</span>";
  })
},{"handleify":5}],48:[function(require,module,exports){

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


},{"../../supers/View.coffee":23,"./templates/share-template.hbs":49}],49:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<a href='/#'>NEW</a>";
  })
},{"handleify":5}],50:[function(require,module,exports){

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


},{"../../supers/View.coffee":23,"./tests-template.hbs":51}],51:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h1>Component Viewer</h1>\n\n<br />\n<p>\n	Make sure that <b>httpster</b> is running in the <b>source</b> route (npm install -g httpster) <br/>\n	<a href=\"http://localhost:3333/test/html/\">Mocha Test Runner</a>\n</p>\n\n<br />\n<ul>\n	<li><a href='#kit-selection'>Kit Selection</a></li>\n	<li><a href=\"#bpm-indicator\">BPM Indicator</a></li>\n	<li><a href=\"#instrument-selector\">Instrument Selector</a></li>\n	<li><a href=\"#pattern-square\">Pattern Square</a></li>\n	<li><a href=\"#pattern-track\">Pattern Track</a></li>\n	<li><a href=\"#sequencer\">Sequencer</a></li>\n	<li><a href=\"#full-sequencer\">Full Sequencer</a></li>\n	<li><a href=\"#pad-square\">Pad Square</a></li>\n	<li><a href=\"#live-pad\">LivePad</a></li>\n</ul>";
  })
},{"handleify":5}]},{},[11])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2RpZ2l0cy9pbmRleC5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L3J1bnRpbWUuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycy5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2luaXRpYWxpemUuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9MaXZlUGFkTW9kZWwuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlTW9kZWwuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3JvdXRlcnMvQXBwUm91dGVyLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3N1cGVycy9WaWV3LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3V0aWxzL1B1YlN1Yi5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3V0aWxzL1RvdWNoLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvdGVtcGxhdGVzL2luc3RydW1lbnQtcGFuZWwtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvdGVtcGxhdGVzL2luc3RydW1lbnQtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL0xpdmVQYWQuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL1BhZFNxdWFyZS5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvdGVtcGxhdGVzL2xpdmUtcGFkLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC90ZW1wbGF0ZXMvcGFkLXNxdWFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9wYXR0ZXJuLXNxdWFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3BhdHRlcm4tdHJhY2stdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9zZXF1ZW5jZXItdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvdGVtcGxhdGVzL2JwbS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy90ZW1wbGF0ZXMva2l0LXNlbGVjdGlvbi10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvdGVtcGxhdGVzL2NyZWF0ZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvdGVtcGxhdGVzL2xhbmRpbmctdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL3RlbXBsYXRlcy9zaGFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy90ZXN0cy9UZXN0c1ZpZXcuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvdGVzdHMvdGVzdHMtdGVtcGxhdGUuaGJzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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R0FBaUIsU0FoQmpCLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIGRpZ2l0c1xuICogQ29weXJpZ2h0IChjKSAyMDEzIEpvbiBTY2hsaW5rZXJ0XG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUGFkIG51bWJlcnMgd2l0aCB6ZXJvcy5cbiAqIEF1dG9tYXRpY2FsbHkgcGFkIHRoZSBudW1iZXIgb2YgZGlnaXRzIGJhc2VkIG9uIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5LFxuICogb3IgZXhwbGljaXRseSBwYXNzIGluIHRoZSBudW1iZXIgb2YgZGlnaXRzIHRvIHVzZS5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG51bSAgVGhlIG51bWJlciB0byBwYWQuXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdHMgT3B0aW9ucyBvYmplY3Qgd2l0aCBgZGlnaXRzYCBhbmQgYGF1dG9gIHByb3BlcnRpZXMuXG4gKiAgICB7XG4gKiAgICAgIGF1dG86IGFycmF5Lmxlbmd0aCAvLyBwYXNzIGluIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5XG4gKiAgICAgIGRpZ2l0czogNCAgICAgICAgICAvLyBvciBwYXNzIGluIHRoZSBudW1iZXIgb2YgZGlnaXRzIHRvIHVzZVxuICogICAgfVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgIFRoZSBwYWRkZWQgbnVtYmVyIHdpdGggemVyb3MgcHJlcGVuZGVkXG4gKlxuICogQGV4YW1wbGVzOlxuICogIDEgICAgICA9PiAwMDAwMDFcbiAqICAxMCAgICAgPT4gMDAwMDEwXG4gKiAgMTAwICAgID0+IDAwMDEwMFxuICogIDEwMDAgICA9PiAwMDEwMDBcbiAqICAxMDAwMCAgPT4gMDEwMDAwXG4gKiAgMTAwMDAwID0+IDEwMDAwMFxuICovXG5cbmV4cG9ydHMucGFkID0gZnVuY3Rpb24gKG51bSwgb3B0cykge1xuICB2YXIgZGlnaXRzID0gb3B0cy5kaWdpdHMgfHwgMztcbiAgaWYob3B0cy5hdXRvICYmIHR5cGVvZiBvcHRzLmF1dG8gPT09ICdudW1iZXInKSB7XG4gICAgZGlnaXRzID0gU3RyaW5nKG9wdHMuYXV0bykubGVuZ3RoO1xuICB9XG4gIHZhciBsZW5EaWZmID0gZGlnaXRzIC0gU3RyaW5nKG51bSkubGVuZ3RoO1xuICB2YXIgcGFkZGluZyA9ICcnO1xuICBpZiAobGVuRGlmZiA+IDApIHtcbiAgICB3aGlsZSAobGVuRGlmZi0tKSB7XG4gICAgICBwYWRkaW5nICs9ICcwJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhZGRpbmcgKyBudW07XG59O1xuXG4vKipcbiAqIFN0cmlwIGxlYWRpbmcgZGlnaXRzIGZyb20gYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgZnJvbSB3aGljaCB0byBzdHJpcCBkaWdpdHNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqL1xuXG5leHBvcnRzLnN0cmlwbGVmdCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXGQrXFwtPy9nLCAnJyk7XG59O1xuXG4vKipcbiAqIFN0cmlwIHRyYWlsaW5nIGRpZ2l0cyBmcm9tIGEgc3RyaW5nXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIGZyb20gd2hpY2ggdG8gc3RyaXAgZGlnaXRzXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBUaGUgbW9kaWZpZWQgc3RyaW5nXG4gKi9cblxuZXhwb3J0cy5zdHJpcHJpZ2h0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFwtP1xcZCskL2csICcnKTtcbn07XG5cbi8qKlxuICogQ291bnQgZGlnaXRzIG9uIHRoZSBsZWZ0IHNpZGUgb2YgYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgd2l0aCBkaWdpdHMgdG8gY291bnRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqIEBleGFtcGxlXG4gKiAgXCIwMDEtZm9vLm1kXCIgPT4gM1xuICovXG5cbmV4cG9ydHMuY291bnRsZWZ0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyLm1hdGNoKC9eXFxkKy9nKSkubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBDb3VudCBkaWdpdHMgb24gdGhlIHJpZ2h0IHNpZGUgb2YgYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgd2l0aCBkaWdpdHMgdG8gY291bnRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqIEBleGFtcGxlXG4gKiAgXCIwMDEtZm9vLm1kXCIgPT4gM1xuICovXG5cbmV4cG9ydHMuY291bnRyaWdodCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gU3RyaW5nKHN0ci5tYXRjaCgvXFxkKyQvZykpLmxlbmd0aDtcbn07IiwiLypqc2hpbnQgZXFudWxsOiB0cnVlICovXG5cbm1vZHVsZS5leHBvcnRzLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuXG52YXIgSGFuZGxlYmFycyA9IHt9O1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZFUlNJT04gPSBcIjEuMC4wXCI7XG5IYW5kbGViYXJzLkNPTVBJTEVSX1JFVklTSU9OID0gNDtcblxuSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz49IDEuMC4wJ1xufTtcblxuSGFuZGxlYmFycy5oZWxwZXJzICA9IHt9O1xuSGFuZGxlYmFycy5wYXJ0aWFscyA9IHt9O1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgIGZ1bmN0aW9uVHlwZSA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24obmFtZSwgZm4sIGludmVyc2UpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBpZiAoaW52ZXJzZSB8fCBmbikgeyB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgaGVscGVycycpOyB9XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaW52ZXJzZSkgeyBmbi5ub3QgPSBpbnZlcnNlOyB9XG4gICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsID0gZnVuY3Rpb24obmFtZSwgc3RyKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBzdHI7XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihhcmcpIHtcbiAgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBoZWxwZXI6ICdcIiArIGFyZyArIFwiJ1wiKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UgfHwgZnVuY3Rpb24oKSB7fSwgZm4gPSBvcHRpb25zLmZuO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcblxuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKGNvbnRleHQgPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm4odGhpcyk7XG4gIH0gZWxzZSBpZihjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgIGlmKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIEhhbmRsZWJhcnMuaGVscGVycy5lYWNoKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZuKGNvbnRleHQpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5LID0gZnVuY3Rpb24oKSB7fTtcblxuSGFuZGxlYmFycy5jcmVhdGVGcmFtZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24ob2JqZWN0KSB7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBvYmplY3Q7XG4gIHZhciBvYmogPSBuZXcgSGFuZGxlYmFycy5LKCk7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBudWxsO1xuICByZXR1cm4gb2JqO1xufTtcblxuSGFuZGxlYmFycy5sb2dnZXIgPSB7XG4gIERFQlVHOiAwLCBJTkZPOiAxLCBXQVJOOiAyLCBFUlJPUjogMywgbGV2ZWw6IDMsXG5cbiAgbWV0aG9kTWFwOiB7MDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcid9LFxuXG4gIC8vIGNhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24obGV2ZWwsIG9iaikge1xuICAgIGlmIChIYW5kbGViYXJzLmxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IEhhbmRsZWJhcnMubG9nZ2VyLm1ldGhvZE1hcFtsZXZlbF07XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGVbbWV0aG9kXSkge1xuICAgICAgICBjb25zb2xlW21ldGhvZF0uY2FsbChjb25zb2xlLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy5sb2cgPSBmdW5jdGlvbihsZXZlbCwgb2JqKSB7IEhhbmRsZWJhcnMubG9nZ2VyLmxvZyhsZXZlbCwgb2JqKTsgfTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGZuID0gb3B0aW9ucy5mbiwgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZTtcbiAgdmFyIGkgPSAwLCByZXQgPSBcIlwiLCBkYXRhO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgZGF0YSA9IEhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgfVxuXG4gIGlmKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgaWYoY29udGV4dCBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgIGZvcih2YXIgaiA9IGNvbnRleHQubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgICBpZiAoZGF0YSkgeyBkYXRhLmluZGV4ID0gaTsgfVxuICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ldLCB7IGRhdGE6IGRhdGEgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvcih2YXIga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgaWYoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgaWYoZGF0YSkgeyBkYXRhLmtleSA9IGtleTsgfVxuICAgICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRba2V5XSwge2RhdGE6IGRhdGF9KTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZihpID09PSAwKXtcbiAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb25kaXRpb25hbCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICBpZighY29uZGl0aW9uYWwgfHwgSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd1bmxlc3MnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHtmbjogb3B0aW9ucy5pbnZlcnNlLCBpbnZlcnNlOiBvcHRpb25zLmZufSk7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmICghSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbnRleHQpKSByZXR1cm4gb3B0aW9ucy5mbihjb250ZXh0KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgSGFuZGxlYmFycy5sb2cobGV2ZWwsIGNvbnRleHQpO1xufSk7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxuLy8gQkVHSU4oQlJPV1NFUilcblxuSGFuZGxlYmFycy5WTSA9IHtcbiAgdGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlU3BlYykge1xuICAgIC8vIEp1c3QgYWRkIHdhdGVyXG4gICAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICAgIGVzY2FwZUV4cHJlc3Npb246IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICAgIGludm9rZVBhcnRpYWw6IEhhbmRsZWJhcnMuVk0uaW52b2tlUGFydGlhbCxcbiAgICAgIHByb2dyYW1zOiBbXSxcbiAgICAgIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV07XG4gICAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbShpLCBmbiwgZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgICB9LFxuICAgICAgbWVyZ2U6IGZ1bmN0aW9uKHBhcmFtLCBjb21tb24pIHtcbiAgICAgICAgdmFyIHJldCA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgICBpZiAocGFyYW0gJiYgY29tbW9uKSB7XG4gICAgICAgICAgcmV0ID0ge307XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBjb21tb24pO1xuICAgICAgICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHJldCwgcGFyYW0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9LFxuICAgICAgcHJvZ3JhbVdpdGhEZXB0aDogSGFuZGxlYmFycy5WTS5wcm9ncmFtV2l0aERlcHRoLFxuICAgICAgbm9vcDogSGFuZGxlYmFycy5WTS5ub29wLFxuICAgICAgY29tcGlsZXJJbmZvOiBudWxsXG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIHZhciByZXN1bHQgPSB0ZW1wbGF0ZVNwZWMuY2FsbChjb250YWluZXIsIEhhbmRsZWJhcnMsIGNvbnRleHQsIG9wdGlvbnMuaGVscGVycywgb3B0aW9ucy5wYXJ0aWFscywgb3B0aW9ucy5kYXRhKTtcblxuICAgICAgdmFyIGNvbXBpbGVySW5mbyA9IGNvbnRhaW5lci5jb21waWxlckluZm8gfHwgW10sXG4gICAgICAgICAgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IEhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgICAgIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICAgICAgdGhyb3cgXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBwcmVjb21waWxlciB0byBhIG5ld2VyIHZlcnNpb24gKFwiK3J1bnRpbWVWZXJzaW9ucytcIikgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uIChcIitjb21waWxlclZlcnNpb25zK1wiKS5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGEgbmV3ZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gXCIrXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKFwiK2NvbXBpbGVySW5mb1sxXStcIikuXCI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9LFxuXG4gIHByb2dyYW1XaXRoRGVwdGg6IGZ1bmN0aW9uKGksIGZuLCBkYXRhIC8qLCAkZGVwdGggKi8pIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMyk7XG5cbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgW2NvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhXS5jb25jYXQoYXJncykpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gYXJncy5sZW5ndGg7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgdmFyIHByb2dyYW0gPSBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhKTtcbiAgICB9O1xuICAgIHByb2dyYW0ucHJvZ3JhbSA9IGk7XG4gICAgcHJvZ3JhbS5kZXB0aCA9IDA7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIG5vb3A6IGZ1bmN0aW9uKCkgeyByZXR1cm4gXCJcIjsgfSxcbiAgaW52b2tlUGFydGlhbDogZnVuY3Rpb24ocGFydGlhbCwgbmFtZSwgY29udGV4dCwgaGVscGVycywgcGFydGlhbHMsIGRhdGEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHsgaGVscGVyczogaGVscGVycywgcGFydGlhbHM6IHBhcnRpYWxzLCBkYXRhOiBkYXRhIH07XG5cbiAgICBpZihwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBmb3VuZFwiKTtcbiAgICB9IGVsc2UgaWYocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKCFIYW5kbGViYXJzLmNvbXBpbGUpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRpYWxzW25hbWVdID0gSGFuZGxlYmFycy5jb21waWxlKHBhcnRpYWwsIHtkYXRhOiBkYXRhICE9PSB1bmRlZmluZWR9KTtcbiAgICAgIHJldHVybiBwYXJ0aWFsc1tuYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMudGVtcGxhdGUgPSBIYW5kbGViYXJzLlZNLnRlbXBsYXRlO1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG5cbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gQkVHSU4oQlJPV1NFUilcblxudmFyIGVycm9yUHJvcHMgPSBbJ2Rlc2NyaXB0aW9uJywgJ2ZpbGVOYW1lJywgJ2xpbmVOdW1iZXInLCAnbWVzc2FnZScsICduYW1lJywgJ251bWJlcicsICdzdGFjayddO1xuXG5IYW5kbGViYXJzLkV4Y2VwdGlvbiA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgdmFyIHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxufTtcbkhhbmRsZWJhcnMuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuSGFuZGxlYmFycy5TYWZlU3RyaW5nID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufTtcbkhhbmRsZWJhcnMuU2FmZVN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RyaW5nLnRvU3RyaW5nKCk7XG59O1xuXG52YXIgZXNjYXBlID0ge1xuICBcIiZcIjogXCImYW1wO1wiLFxuICBcIjxcIjogXCImbHQ7XCIsXG4gIFwiPlwiOiBcIiZndDtcIixcbiAgJ1wiJzogXCImcXVvdDtcIixcbiAgXCInXCI6IFwiJiN4Mjc7XCIsXG4gIFwiYFwiOiBcIiYjeDYwO1wiXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2c7XG52YXIgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxudmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdIHx8IFwiJmFtcDtcIjtcbn07XG5cbkhhbmRsZWJhcnMuVXRpbHMgPSB7XG4gIGV4dGVuZDogZnVuY3Rpb24ob2JqLCB2YWx1ZSkge1xuICAgIGZvcih2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgICBpZih2YWx1ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdmFsdWVba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZXNjYXBlRXhwcmVzc2lvbjogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgaW5zdGFuY2VvZiBIYW5kbGViYXJzLlNhZmVTdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcudG9TdHJpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsIHx8IHN0cmluZyA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAgIC8vIHRoZSByZWdleCB0ZXN0IHdpbGwgZG8gdGhpcyB0cmFuc3BhcmVudGx5IGJlaGluZCB0aGUgc2NlbmVzLCBjYXVzaW5nIGlzc3VlcyBpZlxuICAgIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICAgIHN0cmluZyA9IHN0cmluZy50b1N0cmluZygpO1xuXG4gICAgaWYoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbiAgfSxcblxuICBpc0VtcHR5OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZih0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSByZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMnKS5jcmVhdGUoKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy91dGlscy5qcycpLmF0dGFjaChleHBvcnRzKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzJykuYXR0YWNoKGV4cG9ydHMpIiwiIyMjKlxuICogUHJpbWFyeSBhcHBsaWNhdGlvbiBjb250cm9sbGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5BcHBNb2RlbCAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbkFwcFJvdXRlciAgID0gcmVxdWlyZSAnLi9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUnXG5MYW5kaW5nVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUnXG5DcmVhdGVWaWV3ICA9IHJlcXVpcmUgJy4vdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlJ1xuU2hhcmVWaWV3ICAgPSByZXF1aXJlICcuL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcENvbnRyb2xsZXIgZXh0ZW5kcyBWaWV3XG5cblxuICAgY2xhc3NOYW1lOiAnd3JhcHBlcidcblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEBsYW5kaW5nVmlldyA9IG5ldyBMYW5kaW5nVmlld1xuICAgICAgQHNoYXJlVmlldyAgID0gbmV3IFNoYXJlVmlld1xuXG4gICAgICBAY3JlYXRlVmlldyAgPSBuZXcgQ3JlYXRlVmlld1xuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgQGFwcFJvdXRlciA9IG5ldyBBcHBSb3V0ZXJcbiAgICAgICAgIGFwcENvbnRyb2xsZXI6IEBcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSBBcHBDb250cm9sbGVyIHRvIHRoZSBET00gYW5kIGtpY2tzXG4gICAjIG9mZiBiYWNrYm9uZXMgaGlzdG9yeVxuXG4gICByZW5kZXI6IC0+XG4gICAgICBAJGJvZHkgPSAkICdib2R5J1xuICAgICAgQCRib2R5LmFwcGVuZCBAZWxcblxuICAgICAgQmFja2JvbmUuaGlzdG9yeS5zdGFydFxuICAgICAgICAgcHVzaFN0YXRlOiBmYWxzZVxuXG5cblxuICAgIyBEZXN0cm95cyBhbGwgY3VycmVudCBhbmQgcHJlLXJlbmRlcmVkIHZpZXdzIGFuZFxuICAgIyB1bmRlbGVnYXRlcyBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgQGxhbmRpbmdWaWV3LnJlbW92ZSgpXG4gICAgICBAc2hhcmVWaWV3LnJlbW92ZSgpXG4gICAgICBAY3JlYXRlVmlldy5yZW1vdmUoKVxuXG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICAjIEFkZHMgQXBwQ29udHJvbGxlci1yZWxhdGVkIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVnaW5zXG4gICAjIGxpc3RlbmluZyB0byB2aWV3IGNoYW5nZXNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAnY2hhbmdlOnZpZXcnLCBAb25WaWV3Q2hhbmdlXG5cblxuXG5cbiAgICMgUmVtb3ZlcyBBcHBDb250cm9sbGVyLXJlbGF0ZWQgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHNob3dpbmcgLyBoaWRpbmcgLyBkaXNwb3Npbmcgb2YgcHJpbWFyeSB2aWV3c1xuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvblZpZXdDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIHByZXZpb3VzVmlldyA9IG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMudmlld1xuICAgICAgY3VycmVudFZpZXcgID0gbW9kZWwuY2hhbmdlZC52aWV3XG5cbiAgICAgIHByZXZpb3VzVmlldz8uaGlkZVxuICAgICAgICAgcmVtb3ZlOiB0cnVlXG5cblxuICAgICAgQCRlbC5hcHBlbmQgY3VycmVudFZpZXcucmVuZGVyKCkuZWxcblxuICAgICAgY3VycmVudFZpZXcuc2hvdygpXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwQ29udHJvbGxlciIsIiMjIypcbiAgQXBwbGljYXRpb24td2lkZSBnZW5lcmFsIGNvbmZpZ3VyYXRpb25zXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTkuMTRcbiMjI1xuXG5cbkFwcENvbmZpZyA9XG5cblxuICAgIyBUaGUgcGF0aCB0byBhcHBsaWNhdGlvbiBhc3NldHNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQVNTRVRTOlxuICAgICAgcGF0aDogICAnL2Fzc2V0cydcbiAgICAgIGF1ZGlvOiAgJ2F1ZGlvJ1xuICAgICAgZGF0YTogICAnZGF0YSdcbiAgICAgIGltYWdlczogJ2ltYWdlcydcblxuXG4gICAjIFRoZSBCUE0gdGVtcG9cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQlBNOiAzMjBcblxuXG4gICAjIFRoZSBtYXggQlBNXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIEJQTV9NQVg6IDEwMDBcblxuXG4gICAjIFRoZSBtYXggdmFyaWVudCBvbiBlYWNoIHBhdHRlcm4gc3F1YXJlIChvZmYsIGxvdywgbWVkaXVtLCBoaWdoKVxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBWRUxPQ0lUWV9NQVg6IDNcblxuXG4gICAjIFZvbHVtZSBsZXZlbHMgZm9yIHBhdHRlcm4gcGxheWJhY2sgYXMgd2VsbCBhcyBmb3Igb3ZlcmFsbCB0cmFja3NcbiAgICMgQHR5cGUge09iamVjdH1cblxuICAgVk9MVU1FX0xFVkVMUzpcbiAgICAgIGxvdzogICAgLjJcbiAgICAgIG1lZGl1bTogLjVcbiAgICAgIGhpZ2g6ICAgIDFcblxuXG4gICAjIFJldHVybnMgYSBub3JtYWxpemVkIGFzc2V0IHBhdGggZm9yIGFwcGxpY2F0aW9uIGFzc2V0c1xuICAgIyBAcGFyYW0ge1N0cmluZ30gYXNzZXRUeXBlXG5cbiAgIHJldHVybkFzc2V0UGF0aDogKGFzc2V0VHlwZSkgLT5cbiAgICAgIEBBU1NFVFMucGF0aCArICcvJyArIEBBU1NFVFNbYXNzZXRUeXBlXVxuXG5cbiAgICMgUmV0dXJucyBhIG5vcm1hbGl6ZWQgYXNzZXQgcGF0aCBmb3IgdGhlIFRFU1QgZW52aXJvbm1lbnRcbiAgICMgQHBhcmFtIHtTdHJpbmd9IGFzc2V0VHlwZVxuXG4gICByZXR1cm5UZXN0QXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgICAgJy90ZXN0L2h0bWwvJyArIEBBU1NFVFMucGF0aCArICcvJyArIEBBU1NFVFNbYXNzZXRUeXBlXVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb25maWdcblxuIiwiIyMjKlxuICogQXBwbGljYXRpb24gcmVsYXRlZCBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cbkFwcEV2ZW50ID1cblxuICAgQ0hBTkdFX0FDVElWRTogICAgICdjaGFuZ2U6YWN0aXZlJ1xuICAgQ0hBTkdFX0JQTTogICAgICAgICdjaGFuZ2U6YnBtJ1xuICAgQ0hBTkdFX0RSQUdHSU5HOiAgICdjaGFuZ2U6ZHJhZ2dpbmcnXG4gICBDSEFOR0VfRFJPUFBFRDogICAgJ2NoYW5nZTpkcm9wcGVkJ1xuICAgQ0hBTkdFX0ZPQ1VTOiAgICAgICdjaGFuZ2U6Zm9jdXMnXG4gICBDSEFOR0VfSU5TVFJVTUVOVDogJ2NoYW5nZTpjdXJyZW50SW5zdHJ1bWVudCdcbiAgIENIQU5HRV9LSVQ6ICAgICAgICAnY2hhbmdlOmtpdE1vZGVsJ1xuICAgQ0hBTkdFX01VVEU6ICAgICAgICdjaGFuZ2U6bXV0ZSdcbiAgIENIQU5HRV9QTEFZSU5HOiAgICAnY2hhbmdlOnBsYXlpbmcnXG4gICBDSEFOR0VfVFJJR0dFUjogICAgJ2NoYW5nZTp0cmlnZ2VyJ1xuICAgQ0hBTkdFX1ZFTE9DSVRZOiAgICdjaGFuZ2U6dmVsb2NpdHknXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwRXZlbnQiLCIjIyMqXG4gKiBHbG9iYWwgUHViU3ViIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblxuUHViU3ViID1cblxuICAgUk9VVEU6ICdvblJvdXRlQ2hhbmdlJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUHViU3ViIiwiXG52YXIgZGlnaXRzID0gcmVxdWlyZSgnZGlnaXRzJyk7XG52YXIgaGFuZGxlYmFycyA9IHJlcXVpcmUoJ2hhbmRsZWlmeScpXG5cbmhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3JlcGVhdCcsIGZ1bmN0aW9uKG4sIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgX2RhdGEgPSB7fTtcbiAgICBpZiAob3B0aW9ucy5fZGF0YSkge1xuICAgICAgX2RhdGEgPSBoYW5kbGViYXJzLmNyZWF0ZUZyYW1lKG9wdGlvbnMuX2RhdGEpO1xuICAgIH1cblxuICAgIHZhciBjb250ZW50ID0gJyc7XG4gICAgdmFyIGNvdW50ID0gbiAtIDE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gY291bnQ7IGkrKykge1xuICAgICAgX2RhdGEgPSB7XG4gICAgICAgIGluZGV4OiBkaWdpdHMucGFkKChpICsgMSksIHthdXRvOiBufSlcbiAgICAgIH07XG4gICAgICBjb250ZW50ICs9IG9wdGlvbnMuZm4odGhpcywge2RhdGE6IF9kYXRhfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgaGFuZGxlYmFycy5TYWZlU3RyaW5nKGNvbnRlbnQpO1xuICB9KTsiLCIjIyMqXG4gKiBNUEMgQXBwbGljYXRpb24gYm9vdHN0cmFwcGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5Ub3VjaCAgICAgICAgID0gcmVxdWlyZSAnLi91dGlscy9Ub3VjaCdcbkFwcENvbmZpZyAgICAgPSByZXF1aXJlICcuL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4vbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5BcHBDb250cm9sbGVyID0gcmVxdWlyZSAnLi9BcHBDb250cm9sbGVyLmNvZmZlZSdcbmhlbHBlcnMgICAgICAgPSByZXF1aXJlICcuL2hlbHBlcnMvaGFuZGxlYmFycy1oZWxwZXJzJ1xuXG4kIC0+XG5cbiAgIFRvdWNoLnRyYW5zbGF0ZVRvdWNoRXZlbnRzKClcblxuICAga2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICBwYXJzZTogdHJ1ZVxuXG4gICBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICBhc3luYzogZmFsc2VcbiAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgYXBwQ29udHJvbGxlciA9IG5ldyBBcHBDb250cm9sbGVyXG4gICAgICBraXRDb2xsZWN0aW9uOiBraXRDb2xsZWN0aW9uXG5cbiAgIGFwcENvbnRyb2xsZXIucmVuZGVyKClcbiIsIiMjIypcbiAgUHJpbWFyeSBhcHBsaWNhdGlvbiBtb2RlbCB3aGljaCBjb29yZGluYXRlcyBzdGF0ZVxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cblxuQXBwUm91dGVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAndmlldyc6ICAgICAgICBudWxsXG4gICAgICAncGxheWluZyc6ICAgICBudWxsXG4gICAgICAnbXV0ZSc6ICAgICAgICBudWxsXG5cbiAgICAgICdraXRNb2RlbCc6ICAgIG51bGxcblxuICAgICAgIyBTZXR0aW5nc1xuICAgICAgJ2JwbSc6ICAgICAgICAgQXBwQ29uZmlnLkJQTVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwUm91dGVyIiwiIyMjKlxuICogQ29sbGVjdGlvbiBvZiBzb3VuZCBraXRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRNb2RlbCAgPSByZXF1aXJlICcuL0tpdE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBLaXRDb2xsZWN0aW9uIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG5cbiAgICMgVXJsIHRvIGRhdGEgZm9yIGZldGNoXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHVybDogXCIje0FwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKX0vc291bmQtZGF0YS5qc29uXCJcblxuXG4gICAjIEluZGl2aWR1YWwgZHJ1bWtpdCBhdWRpbyBzZXRzXG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAgbW9kZWw6IEtpdE1vZGVsXG5cblxuICAgIyBUaGUgY3VycmVudCB1c2VyLXNlbGVjdGVkIGtpdFxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBraXRJZDogMFxuXG5cblxuICAgIyBQYXJzZXMgdGhlIGNvbGxlY3Rpb24gdG8gYXNzaWduIHBhdGhzIHRvIGVhY2ggaW5kaXZpZHVhbCBzb3VuZFxuICAgIyBiYXNlZCB1cG9uIGNvbmZpZ3VyYXRpb24gZGF0YVxuICAgIyBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcblxuICAgcGFyc2U6IChyZXNwb25zZSkgLT5cbiAgICAgIGFzc2V0UGF0aCA9IHJlc3BvbnNlLmNvbmZpZy5hc3NldFBhdGhcbiAgICAgIGtpdHMgPSByZXNwb25zZS5raXRzXG5cbiAgICAgIGtpdHMgPSBfLm1hcCBraXRzLCAoa2l0KSAtPlxuICAgICAgICAga2l0LnBhdGggPSBhc3NldFBhdGggKyAnLycgKyBraXQuZm9sZGVyXG4gICAgICAgICByZXR1cm4ga2l0XG5cbiAgICAgIHJldHVybiBraXRzXG5cblxuXG5cbiAgICMgSXRlcmF0ZXMgdGhyb3VnaCB0aGUgY29sbGVjdGlvbiBhbmQgcmV0dXJucyBhIHNwZWNpZmljIGluc3RydW1lbnRcbiAgICMgYnkgbWF0Y2hpbmcgYXNzb2NpYXRlZCBpZFxuICAgIyBAcGFyYW0ge051bWJlcn0gaWRcblxuICAgZmluZEluc3RydW1lbnRNb2RlbDogKGlkKSAtPlxuICAgICAgaW5zdHJ1bWVudE1vZGVsID0gbnVsbFxuXG4gICAgICBAZWFjaCAoa2l0TW9kZWwpID0+XG4gICAgICAgICBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuZWFjaCAobW9kZWwpID0+XG4gICAgICAgICAgICBpZiBpZCBpcyBtb2RlbC5nZXQoJ2lkJylcbiAgICAgICAgICAgICAgIGluc3RydW1lbnRNb2RlbCA9IG1vZGVsXG5cbiAgICAgIGlmIGluc3RydW1lbnRNb2RlbCBpcyBudWxsXG4gICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgaW5zdHJ1bWVudE1vZGVsXG5cblxuXG5cbiAgICMgQ3ljbGVzIHRoZSBjdXJyZW50IGRydW0ga2l0IGJhY2tcbiAgICMgQHJldHVybiB7S2l0TW9kZWx9XG5cbiAgIHByZXZpb3VzS2l0OiAtPlxuICAgICAgbGVuID0gQGxlbmd0aFxuXG4gICAgICBpZiBAa2l0SWQgPiAwXG4gICAgICAgICBAa2l0SWQtLVxuXG4gICAgICBlbHNlXG4gICAgICAgICBAa2l0SWQgPSBsZW4gLSAxXG5cbiAgICAgIGtpdE1vZGVsID0gQGF0IEBraXRJZFxuXG5cblxuXG4gICAjIEN5Y2xlcyB0aGUgY3VycmVudCBkcnVtIGtpdCBmb3J3YXJkXG4gICAjIEByZXR1cm4ge0tpdE1vZGVsfVxuXG4gICBuZXh0S2l0OiAtPlxuICAgICAgbGVuID0gQGxlbmd0aCAtIDFcblxuICAgICAgaWYgQGtpdElkIDwgbGVuXG4gICAgICAgICBAa2l0SWQrK1xuXG4gICAgICBlbHNlXG4gICAgICAgICBAa2l0SWQgPSAwXG5cbiAgICAgIGtpdE1vZGVsID0gQGF0IEBraXRJZFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRDb2xsZWN0aW9uIiwiIyMjKlxuICogS2l0IG1vZGVsIGZvciBoYW5kbGluZyBzdGF0ZSByZWxhdGVkIHRvIGtpdCBzZWxlY3Rpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuY2xhc3MgS2l0TW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ2xhYmVsJzogICAgbnVsbFxuICAgICAgJ3BhdGgnOiAgICAgbnVsbFxuICAgICAgJ2ZvbGRlcic6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cbiAgICAgICdpbnN0cnVtZW50cyc6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICAgICAnY3VycmVudEluc3RydW1lbnQnOiBudWxsXG5cblxuXG4gICAjIEZvcm1hdCB0aGUgcmVzcG9uc2Ugc28gdGhhdCBpbnN0cnVtZW50cyBnZXRzIHByb2Nlc3NlZFxuICAgIyBieSBiYWNrYm9uZSB2aWEgdGhlIEluc3RydW1lbnRDb2xsZWN0aW9uLiAgQWRkaXRpb25hbGx5LFxuICAgIyBwYXNzIGluIHRoZSBwYXRoIHNvIHRoYXQgYWJzb2x1dGUgVVJMJ3MgY2FuIGJlIHVzZWRcbiAgICMgdG8gcmVmZXJlbmNlIHNvdW5kIGRhdGFcbiAgICMgQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG5cbiAgIHBhcnNlOiAocmVzcG9uc2UpIC0+XG4gICAgICBfLmVhY2ggcmVzcG9uc2UuaW5zdHJ1bWVudHMsIChpbnN0cnVtZW50KSAtPlxuICAgICAgICAgaW5zdHJ1bWVudC5pZCA9IF8udW5pcXVlSWQgJ2luc3RydW1lbnQtJ1xuICAgICAgICAgaW5zdHJ1bWVudC5zcmMgPSByZXNwb25zZS5wYXRoICsgJy8nICsgaW5zdHJ1bWVudC5zcmNcblxuICAgICAgcmVzcG9uc2UuaW5zdHJ1bWVudHMgPSBuZXcgSW5zdHJ1bWVudENvbGxlY3Rpb24gcmVzcG9uc2UuaW5zdHJ1bWVudHNcblxuICAgICAgcmVzcG9uc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRNb2RlbCIsIiMjIypcbiAqIE1vZGVsIGZvciB0aGUgZW50aXJlIFBhZCBjb21wb25lbnRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5jbGFzcyBMaXZlUGFkTW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGl2ZVBhZE1vZGVsXG4iLCIjIyMqXG4gKiBDb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgUGFkU3F1YXJlTW9kZWxzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI0LjE0XG4jIyNcblxuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi4vc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgUGFkU3F1YXJlQ29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFkU3F1YXJlQ29sbGVjdGlvbiIsIiMjIypcbiAqIE1vZGVsIGZvciBpbmRpdmlkdWFsIHBhZCBzcXVhcmVzLlxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbmNsYXNzIFBhZFNxdWFyZU1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICdkcmFnZ2luZyc6ICBmYWxzZVxuICAgICAgJ2tleWNvZGUnOiAgIG51bGxcbiAgICAgICd0cmlnZ2VyJzogICBmYWxzZVxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICAgICAnY3VycmVudEluc3RydW1lbnQnOiAgbnVsbFxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAc2V0ICdpZCcsIF8udW5pcXVlSWQgJ3BhZC1zcXVhcmUtJ1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYWRTcXVhcmVNb2RlbFxuIiwiIyMjKlxuICogQ29sbGVjdGlvbiByZXByZXNlbnRpbmcgZWFjaCBzb3VuZCBmcm9tIGEga2l0IHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4vSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBJbnN0cnVtZW50Q29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICBtb2RlbDogSW5zdHJ1bWVudE1vZGVsXG5cblxuXG4gICAjIEV4cG9ydHMgdGhlIHBhdHRlcm4gc3F1YXJlcyBjb2xsZWN0aW9uIGZvciB1c2VcbiAgICMgd2l0aCB0cmFuc2ZlcnJpbmcgcHJvcHMgYWNyb3NzIGRpZmZlcmVudCBkcnVtIGtpdHNcblxuICAgZXhwb3J0UGF0dGVyblNxdWFyZXM6IC0+XG4gICAgICByZXR1cm4gQG1hcCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgICAgIGluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRDb2xsZWN0aW9uIiwiIyMjKlxuICogU291bmQgbW9kZWwgZm9yIGVhY2ggaW5kaXZpZHVhbCBraXQgc291bmQgc2V0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cblxuY2xhc3MgSW5zdHJ1bWVudE1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG4gICBkZWZhdWx0czpcblxuICAgICAgIyBJZiBhY3RpdmUsIHNvdW5kIGNhbiBwbGF5XG4gICAgICAjIEB0eXBlIHtCb29sZWFufVxuXG4gICAgICAnYWN0aXZlJzogICBudWxsXG5cblxuICAgICAgIyBGbGFnIHRvIGNoZWNrIGlmIGluc3RydW1lbnQgaGFzIGJlZW4gZHJvcHBlZCBvbnRvIHBhZCBzcXVhcmVcbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgICAgICdkcm9wcGVkJzogIG51bGxcblxuXG4gICAgICAjIEZsYWcgdG8gY2hlY2sgaWYgYXVkaW8gZm9jdXMgaXMgc2V0IG9uIGEgcGFydGljdWxhciBpbnN0cnVtZW50LlxuICAgICAgIyBJZiBzbywgaXQgbXV0ZXMgYWxsIG90aGVyIHRyYWNrcy5cbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgICAgICdmb2N1cyc6ICAgIG51bGxcblxuXG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgICAnaWNvbic6ICAgICBudWxsXG5cbiAgICAgICMgQHR5cGUge1N0cmluZ31cbiAgICAgICdsYWJlbCc6ICAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgICdtdXRlJzogICAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7U3RyaW5nfVxuICAgICAgJ3NyYyc6ICAgICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAndm9sdW1lJzogICBudWxsXG5cbiAgICAgICMgQHR5cGUge1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9ufVxuICAgICAgJ3BhdHRlcm5TcXVhcmVzJzogICAgbnVsbFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50TW9kZWwiLCIjIyMqXG4gIEEgY29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlc1xuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICcuLi9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24iLCIjIyMqXG4gIE1vZGVsIGZvciBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlcy4gIFBhcnQgb2YgbGFyZ2VyIFBhdHRlcm4gVHJhY2sgY29sbGVjdGlvblxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmVNb2RlbCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnYWN0aXZlJzogICAgICAgICAgIGZhbHNlXG4gICAgICAnaW5zdHJ1bWVudCc6ICAgICAgIG51bGxcbiAgICAgICdwcmV2aW91c1ZlbG9jaXR5JzogMFxuICAgICAgJ3RyaWdnZXInOiAgICAgICAgICBudWxsXG4gICAgICAndmVsb2NpdHknOiAgICAgICAgIDBcblxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAb24gQXBwRXZlbnQuQ0hBTkdFX1ZFTE9DSVRZLCBAb25WZWxvY2l0eUNoYW5nZVxuXG5cblxuICAgY3ljbGU6IC0+XG4gICAgICB2ZWxvY2l0eSA9IEBnZXQgJ3ZlbG9jaXR5J1xuXG4gICAgICBpZiB2ZWxvY2l0eSA8IEFwcENvbmZpZy5WRUxPQ0lUWV9NQVhcbiAgICAgICAgIHZlbG9jaXR5KytcblxuICAgICAgZWxzZVxuICAgICAgICAgdmVsb2NpdHkgPSAwXG5cbiAgICAgIEBzZXQgJ3ZlbG9jaXR5JywgdmVsb2NpdHlcblxuXG5cbiAgIGVuYWJsZTogLT5cbiAgICAgIEBzZXQgJ3ZlbG9jaXR5JywgMVxuXG5cblxuXG4gICBkaXNhYmxlOiAtPlxuICAgICAgQHNldCAndmVsb2NpdHknLCAwXG5cblxuXG4gICBvblZlbG9jaXR5Q2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBAc2V0ICdwcmV2aW91c1ZlbG9jaXR5JywgbW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy52ZWxvY2l0eVxuXG4gICAgICB2ZWxvY2l0eSA9IG1vZGVsLmNoYW5nZWQudmVsb2NpdHlcblxuICAgICAgaWYgdmVsb2NpdHkgPiAwXG4gICAgICAgICBAc2V0ICdhY3RpdmUnLCB0cnVlXG5cbiAgICAgIGVsc2UgaWYgdmVsb2NpdHkgaXMgMFxuICAgICAgICAgQHNldCAnYWN0aXZlJywgZmFsc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlTW9kZWwiLCIjIyMqXG4gKiBNUEMgQXBwbGljYXRpb24gcm91dGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgPSByZXF1aXJlICcuLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblB1YlN1YiAgICAgID0gcmVxdWlyZSAnLi4vdXRpbHMvUHViU3ViJ1xuUHViRXZlbnQgICAgPSByZXF1aXJlICcuLi9ldmVudHMvUHViRXZlbnQuY29mZmVlJ1xuXG4jIFRPRE86IFRoZSBiZWxvdyBpdGVtcyBhcmUgb25seSBpbmNsdWRlZCBmb3IgdGVzdGluZyBjb21wb25lbnRcbiMgbW9kdWxhcml0eS4gIFRoZXksIGFuZCB0aGVpciByb3V0ZXMsIHNob3VsZCBiZSByZW1vdmVkIGluIHByb2R1Y3Rpb25cblxuVGVzdHNWaWV3ICAgICA9IHJlcXVpcmUgJy4uL3ZpZXdzL3Rlc3RzL1Rlc3RzVmlldy5jb2ZmZWUnXG5cblZpZXcgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cbktpdFNlbGVjdG9yICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcbktpdE1vZGVsICAgICAgPSByZXF1aXJlICcuLi9tb2RlbHMva2l0cy9LaXRNb2RlbC5jb2ZmZWUnXG5cbkJQTUluZGljYXRvciAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xuSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUnXG5cbkluc3RydW1lbnRNb2RlbCA9ICcuLi9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9ICcuLi9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblxuUGF0dGVyblNxdWFyZSA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuVHJhY2sgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay5jb2ZmZWUnXG5TZXF1ZW5jZXIgICAgICAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSdcblxuTGl2ZVBhZE1vZGVsID0gcmVxdWlyZSAnLi4vbW9kZWxzL3BhZC9MaXZlUGFkTW9kZWwuY29mZmVlJ1xuUGFkU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYWRTcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uL21vZGVscy9wYWQvUGFkU3F1YXJlTW9kZWwuY29mZmVlJ1xuTGl2ZVBhZCA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9MaXZlUGFkLmNvZmZlZSdcblBhZFNxdWFyZSA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcFJvdXRlciBleHRlbmRzIEJhY2tib25lLlJvdXRlclxuXG5cbiAgIHJvdXRlczpcbiAgICAgICcnOiAgICAgICAgICAgICAnbGFuZGluZ1JvdXRlJ1xuICAgICAgJ2NyZWF0ZSc6ICAgICAgICdjcmVhdGVSb3V0ZSdcbiAgICAgICdzaGFyZSc6ICAgICAgICAnc2hhcmVSb3V0ZSdcblxuICAgICAgIyBDb21wb25lbnQgdGVzdCByb3V0ZXNcbiAgICAgICd0ZXN0cyc6ICAgICAgICAgICAgICAgICd0ZXN0cydcbiAgICAgICdraXQtc2VsZWN0aW9uJzogICAgICAgICdraXRTZWxlY3Rpb25Sb3V0ZSdcbiAgICAgICdicG0taW5kaWNhdG9yJzogICAgICAgICdicG1JbmRpY2F0b3JSb3V0ZSdcbiAgICAgICdpbnN0cnVtZW50LXNlbGVjdG9yJzogICdpbnN0cnVtZW50U2VsZWN0b3JSb3V0ZSdcbiAgICAgICdwYXR0ZXJuLXNxdWFyZSc6ICAgICAgICdwYXR0ZXJuU3F1YXJlUm91dGUnXG4gICAgICAncGF0dGVybi10cmFjayc6ICAgICAgICAncGF0dGVyblRyYWNrUm91dGUnXG4gICAgICAnc2VxdWVuY2VyJzogICAgICAgICAgICAnc2VxdWVuY2VyUm91dGUnXG4gICAgICAnZnVsbC1zZXF1ZW5jZXInOiAgICAgICAnZnVsbFNlcXVlbmNlclJvdXRlJ1xuICAgICAgJ3BhZC1zcXVhcmUnOiAgICAgICAgICAgJ3BhZFNxdWFyZVJvdXRlJ1xuICAgICAgJ2xpdmUtcGFkJzogICAgICAgICAgICAgJ2xpdmVQYWRSb3V0ZSdcblxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAge0BhcHBDb250cm9sbGVyLCBAYXBwTW9kZWx9ID0gb3B0aW9uc1xuXG4gICAgICBQdWJTdWIub24gUHViRXZlbnQuUk9VVEUsIEBvblJvdXRlQ2hhbmdlXG5cblxuXG4gICBvblJvdXRlQ2hhbmdlOiAocGFyYW1zKSA9PlxuICAgICAge3JvdXRlfSA9IHBhcmFtc1xuXG4gICAgICBAbmF2aWdhdGUgcm91dGUsIHsgdHJpZ2dlcjogdHJ1ZSB9XG5cblxuXG4gICBsYW5kaW5nUm91dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgQGFwcENvbnRyb2xsZXIubGFuZGluZ1ZpZXdcblxuXG5cbiAgIGNyZWF0ZVJvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLmNyZWF0ZVZpZXdcblxuXG5cbiAgIHNoYXJlUm91dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgQGFwcENvbnRyb2xsZXIuc2hhcmVWaWV3XG5cblxuXG5cblxuXG4gICAjIENPTVBPTkVOVCBURVNUIFJPVVRFU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgIHRlc3RzOiAtPlxuICAgICAgdmlldyA9IG5ldyBUZXN0c1ZpZXcoKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBraXRTZWxlY3Rpb25Sb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBLaXRTZWxlY3RvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24sXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cbiAgIGJwbUluZGljYXRvclJvdXRlOiAtPlxuICAgICAgdmlldyA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgdmlldy5yZW5kZXIoKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBpbnN0cnVtZW50U2VsZWN0b3JSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBwYXR0ZXJuU3F1YXJlUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgUGF0dGVyblNxdWFyZVxuICAgICAgICAgcGF0dGVyblNxdWFyZU1vZGVsOiBuZXcgUGF0dGVyblNxdWFyZU1vZGVsKClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbiAgIHBhdHRlcm5UcmFja1JvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IFBhdHRlcm5UcmFja1xuICAgICAgICAgbW9kZWw6IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuICAgc2VxdWVuY2VyUm91dGU6IC0+XG5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuICAgZnVsbFNlcXVlbmNlclJvdXRlOiAtPlxuXG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cblxuICAgICAga2l0U2VsZWN0aW9uID0gPT5cbiAgICAgICAgIHZpZXcgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgICAgIHZpZXdcblxuXG4gICAgICBicG0gPSA9PlxuICAgICAgICAgdmlldyA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgICAgdmlld1xuXG5cbiAgICAgIGluc3RydW1lbnRTZWxlY3Rpb24gPSA9PlxuICAgICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICAgICB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICAgICB2aWV3XG5cblxuICAgICAgc2VxdWVuY2VyID0gPT5cbiAgICAgICAgIHZpZXcgPSBuZXcgU2VxdWVuY2VyXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgICAgdmlld1xuXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldyA9IG5ldyBWaWV3KClcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQga2l0U2VsZWN0aW9uKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgYnBtKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgaW5zdHJ1bWVudFNlbGVjdGlvbigpLnJlbmRlcigpLmVsXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldy4kZWwuYXBwZW5kIHNlcXVlbmNlcigpLnJlbmRlcigpLmVsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBmdWxsU2VxdWVuY2VyVmlld1xuXG5cblxuXG4gICBwYWRTcXVhcmVSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBQYWRTcXVhcmVcbiAgICAgICAgIG1vZGVsOiBuZXcgUGFkU3F1YXJlTW9kZWwoKVxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG5cbiAgIGxpdmVQYWRSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBMaXZlUGFkXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFJvdXRlciIsIiMjIypcbiAqIFZpZXcgc3VwZXJjbGFzcyBjb250YWluaW5nIHNoYXJlZCBmdW5jdGlvbmFsaXR5XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAyLjE3LjE0XG4jIyNcblxuXG5WaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmRcblxuXG5cbiAgICMgSW5pdGlhbGl6ZXMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBfLmV4dGVuZCBALCBfLmRlZmF1bHRzKCBvcHRpb25zID0gb3B0aW9ucyB8fCBAZGVmYXVsdHMsIEBkZWZhdWx0cyB8fCB7fSApXG5cblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IHdpdGggc3VwcGxpZWQgdGVtcGxhdGUgZGF0YSwgb3IgY2hlY2tzIGlmIHRlbXBsYXRlIGlzIG9uXG4gICAjIG9iamVjdCBib2R5XG4gICAjIEBwYXJhbSAge0Z1bmN0aW9ufE1vZGVsfSB0ZW1wbGF0ZURhdGFcbiAgICMgQHJldHVybiB7Vmlld31cblxuICAgcmVuZGVyOiAodGVtcGxhdGVEYXRhKSAtPlxuICAgICAgdGVtcGxhdGVEYXRhID0gdGVtcGxhdGVEYXRhIHx8IHt9XG5cbiAgICAgIGlmIEB0ZW1wbGF0ZVxuXG4gICAgICAgICAjIElmIG1vZGVsIGlzIGFuIGluc3RhbmNlIG9mIGEgYmFja2JvbmUgbW9kZWwsIHRoZW4gSlNPTmlmeSBpdFxuICAgICAgICAgaWYgQG1vZGVsIGluc3RhbmNlb2YgQmFja2JvbmUuTW9kZWxcbiAgICAgICAgICAgIHRlbXBsYXRlRGF0YSA9IEBtb2RlbC50b0pTT04oKVxuXG4gICAgICAgICBAJGVsLmh0bWwgQHRlbXBsYXRlICh0ZW1wbGF0ZURhdGEpXG5cbiAgICAgIEBkZWxlZ2F0ZUV2ZW50cygpXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG4gICAgICBAXG5cblxuXG5cbiAgICMgUmVtb3ZlcyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW1vdmU6IChvcHRpb25zKSAtPlxuICAgICAgQHJlbW92ZUV2ZW50TGlzdGVuZXJzKClcbiAgICAgIEAkZWwucmVtb3ZlKClcbiAgICAgIEB1bmRlbGVnYXRlRXZlbnRzKClcblxuXG5cblxuXG4gICAjIFNob3dzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHNob3c6IChvcHRpb25zKSAtPlxuICAgICAgVHdlZW5NYXguc2V0IEAkZWwsIHsgYXV0b0FscGhhOiAxIH1cblxuXG5cblxuICAgIyBIaWRlcyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBoaWRlOiAob3B0aW9ucykgLT5cbiAgICAgIFR3ZWVuTWF4LnNldCBAJGVsLFxuICAgICAgICAgYXV0b0FscGhhOiAwXG4gICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgaWYgb3B0aW9ucz8ucmVtb3ZlXG4gICAgICAgICAgICAgICBAcmVtb3ZlKClcblxuXG5cblxuICAgIyBOb29wIHdoaWNoIGlzIGNhbGxlZCBvbiByZW5kZXJcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG5cblxuXG4gICAjIFJlbW92ZXMgYWxsIHJlZ2lzdGVyZWQgbGlzdGVuZXJzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3IiwiLyoqXG4gKiBAbW9kdWxlICAgICBQdWJTdWJcbiAqIEBkZXNjICAgICAgIEdsb2JhbCBQdWJTdWIgb2JqZWN0IGZvciBkaXNwYXRjaCBhbmQgZGVsZWdhdGlvblxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG52YXIgUHViU3ViID0ge31cblxuXy5leHRlbmQoIFB1YlN1YiwgQmFja2JvbmUuRXZlbnRzIClcblxubW9kdWxlLmV4cG9ydHMgPSBQdWJTdWIiLCIvKipcbiAqIFRvdWNoIHJlbGF0ZWQgdXRpbGl0aWVzXG4gKlxuICovXG5cbnZhciBUb3VjaCA9IHtcblxuXG4gIC8qKlxuICAgKiBEZWxlZ2F0ZSB0b3VjaCBldmVudHMgdG8gbW91c2UgaWYgbm90IG9uIGEgdG91Y2ggZGV2aWNlXG4gICAqL1xuXG4gIHRyYW5zbGF0ZVRvdWNoRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoISAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93ICkpIHtcbiAgICAgICQoZG9jdW1lbnQpLmRlbGVnYXRlKCAnYm9keScsICdtb3VzZWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICQoZS50YXJnZXQpLnRyaWdnZXIoICd0b3VjaHN0YXJ0JyApXG4gICAgICB9KVxuXG4gICAgICAkKGRvY3VtZW50KS5kZWxlZ2F0ZSggJ2JvZHknLCAnbW91c2V1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgJChlLnRhcmdldCkudHJpZ2dlciggJ3RvdWNoZW5kJyApXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gVG91Y2giLCIjIyMqXG4gKiBDcmVhdGUgdmlldyB3aGljaCB0aGUgdXNlciBjYW4gYnVpbGQgYmVhdHMgd2l0aGluXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5WaWV3ICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbktpdFNlbGVjdG9yICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3IuY29mZmVlJ1xuSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUnXG5TZXF1ZW5jZXIgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuQlBNSW5kaWNhdG9yICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xudGVtcGxhdGUgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9jcmVhdGUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIENyZWF0ZVZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRraXRTZWxlY3RvckNvbnRhaW5lciAgID0gQCRlbC5maW5kICcuY29udGFpbmVyLWtpdC1zZWxlY3RvcidcbiAgICAgIEAka2l0U2VsZWN0b3IgICAgICAgICAgICA9IEAkZWwuZmluZCAnLmtpdC1zZWxlY3RvcidcbiAgICAgIEAkdmlzdWFsaXphdGlvbkNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci12aXN1YWxpemF0aW9uJ1xuICAgICAgQCRzZXF1ZW5jZXJDb250YWluZXIgICAgID0gQCRlbC5maW5kICcuY29udGFpbmVyLXNlcXVlbmNlcidcbiAgICAgIEAkaW5zdHJ1bWVudFNlbGVjdG9yICAgICA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5pbnN0cnVtZW50LXNlbGVjdG9yJ1xuICAgICAgQCRzZXF1ZW5jZXIgICAgICAgICAgICAgID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLnNlcXVlbmNlcidcbiAgICAgIEAkYnBtICAgICAgICAgICAgICAgICAgICA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5icG0nXG4gICAgICBAJHNoYXJlQnRuICAgICAgICAgICAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuYnRuLXNoYXJlJ1xuXG4gICAgICBAcmVuZGVyS2l0U2VsZWN0b3IoKVxuICAgICAgQHJlbmRlckluc3RydW1lbnRTZWxlY3RvcigpXG4gICAgICBAcmVuZGVyU2VxdWVuY2VyKClcbiAgICAgIEByZW5kZXJCUE0oKVxuXG4gICAgICBAXG5cblxuXG4gICByZW5kZXJLaXRTZWxlY3RvcjogLT5cbiAgICAgIEBraXRTZWxlY3RvciA9IG5ldyBLaXRTZWxlY3RvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgQCRraXRTZWxlY3Rvci5odG1sIEBraXRTZWxlY3Rvci5yZW5kZXIoKS5lbFxuXG5cblxuICAgcmVuZGVySW5zdHJ1bWVudFNlbGVjdG9yOiAtPlxuICAgICAgQGluc3RydW1lbnRTZWxlY3RvciA9IG5ldyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgQCRpbnN0cnVtZW50U2VsZWN0b3IuaHRtbCBAaW5zdHJ1bWVudFNlbGVjdG9yLnJlbmRlcigpLmVsXG5cblxuXG4gICByZW5kZXJTZXF1ZW5jZXI6IC0+XG4gICAgICBAc2VxdWVuY2VyID0gbmV3IFNlcXVlbmNlclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgIEAkc2VxdWVuY2VyLmh0bWwgQHNlcXVlbmNlci5yZW5kZXIoKS5lbFxuXG5cblxuICAgcmVuZGVyQlBNOiAtPlxuICAgICAgQGJwbSA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQCRicG0uaHRtbCBAYnBtLnJlbmRlcigpLmVsXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDcmVhdGVWaWV3IiwiIyMjKlxuICogQmVhdHMgcGVyIG1pbnV0ZSB2aWV3IGZvciBoYW5kbGluZyB0ZW1wb1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2JwbS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgQlBNSW5kaWNhdG9yIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgUmVmIHRvIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFRoZSBzZXRJbnRlcnZhbCB1cGRhdGUgaW50ZXJ2YWwgZm9yIGluY3JlYXNpbmcgYW5kXG4gICAjIGRlY3JlYXNpbmcgQlBNIG9uIHByZXNzIC8gdG91Y2hcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgaW50ZXJ2YWxVcGRhdGVUaW1lOiA3MFxuXG5cbiAgICMgVGhlIHNldEludGVydmFsIHVwZGF0ZXJcbiAgICMgQHR5cGUge1NldEludGVydmFsfVxuXG4gICB1cGRhdGVJbnRlcnZhbDogbnVsbFxuXG5cbiAgICMgVGhlIGFtb3VudCB0byBpbmNyZWFzZSB0aGUgQlBNIGJ5IG9uIGVhY2ggdGlja1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBicG1JbmNyZWFzZUFtb3VudDogMTBcblxuXG4gICAjIFRoZSBjdXJyZW50IGJwbSBiZWZvcmUgaXRzIHNldCBvbiB0aGUgbW9kZWwuICBVc2VkIHRvIGJ1ZmZlclxuICAgIyB1cGRhdGVzIGFuZCB0byBwcm92aWRlIGZvciBzbW9vdGggYW5pbWF0aW9uXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGN1cnJCUE06IG51bGxcblxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoc3RhcnQgLmJ0bi1pbmNyZWFzZSc6ICdvbkluY3JlYXNlQnRuRG93bidcbiAgICAgICd0b3VjaHN0YXJ0IC5idG4tZGVjcmVhc2UnOiAnb25EZWNyZWFzZUJ0bkRvd24nXG4gICAgICAndG91Y2hlbmQgICAuYnRuLWluY3JlYXNlJzogJ29uQnRuVXAnXG4gICAgICAndG91Y2hlbmQgICAuYnRuLWRlY3JlYXNlJzogJ29uQnRuVXAnXG5cblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGFuZCB1cGRhdGUgdGhlIGtpdCBpZiBub3QgYWxyZWFkeVxuICAgIyBzZXQgdmlhIGEgcHJldmlvdXMgc2Vzc2lvblxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGJwbUxhYmVsICAgPSBAJGVsLmZpbmQgJy5sYWJlbC1icG0nXG4gICAgICBAaW5jcmVhc2VCdG4gPSBAJGVsLmZpbmQgJy5idG4taW5jcmVhc2UnXG4gICAgICBAZGVjcmVhc2VCdG4gPSBAJGVsLmZpbmQgJy5idG4tZGVjcmVhc2UnXG5cbiAgICAgIEBjdXJyQlBNID0gQGFwcE1vZGVsLmdldCgnYnBtJylcbiAgICAgIEAkYnBtTGFiZWwudGV4dCBAY3VyckJQTVxuICAgICAgQG9uQnRuVXAoKVxuXG4gICAgICBAXG5cblxuXG4gICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRpbmcgY2hhbmdlcyByZWxhdGVkIHRvXG4gICAjIHN3aXRjaGluZyBCUE1cblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfQlBNLCBAb25CUE1DaGFuZ2VcblxuXG5cblxuICAgIyBTZXRzIGFuIGludGVydmFsIHRvIGluY3JlYXNlIHRoZSBCUE0gbW9uaXRvci4gIENsZWFyc1xuICAgIyB3aGVuIHRoZSB1c2VyIHJlbGVhc2VzIHRoZSBtb3VzZVxuXG4gICBpbmNyZWFzZUJQTTogLT5cbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IHNldEludGVydmFsID0+XG4gICAgICAgICBicG0gPSBAY3VyckJQTVxuXG4gICAgICAgICBpZiBicG0gPCBBcHBDb25maWcuQlBNX01BWFxuICAgICAgICAgICAgYnBtICs9IEBicG1JbmNyZWFzZUFtb3VudFxuXG4gICAgICAgICBlbHNlXG4gICAgICAgICAgICBicG0gPSBBcHBDb25maWcuQlBNX01BWFxuXG4gICAgICAgICBAY3VyckJQTSA9IGJwbVxuICAgICAgICAgQCRicG1MYWJlbC50ZXh0IEBjdXJyQlBNXG4gICAgICAgICAjQGFwcE1vZGVsLnNldCAnYnBtJywgNjAwMDAgLyBAY3VyckJQTVxuXG4gICAgICAsIEBpbnRlcnZhbFVwZGF0ZVRpbWVcblxuXG5cblxuICAgIyBTZXRzIGFuIGludGVydmFsIHRvIGRlY3JlYXNlIHRoZSBCUE0gbW9uaXRvci4gIENsZWFyc1xuICAgIyB3aGVuIHRoZSB1c2VyIHJlbGVhc2VzIHRoZSBtb3VzZVxuXG4gICBkZWNyZWFzZUJQTTogLT5cbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IHNldEludGVydmFsID0+XG4gICAgICAgICBicG0gPSBAY3VyckJQTVxuXG4gICAgICAgICBpZiBicG0gPiAwXG4gICAgICAgICAgICBicG0gLT0gQGJwbUluY3JlYXNlQW1vdW50XG5cbiAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJwbSA9IDBcblxuICAgICAgICAgQGN1cnJCUE0gPSBicG1cbiAgICAgICAgIEAkYnBtTGFiZWwudGV4dCBAY3VyckJQTVxuICAgICAgICAgI0BhcHBNb2RlbC5zZXQgJ2JwbScsIDYwMDAwIC8gQGN1cnJCUE1cblxuICAgICAgLCBAaW50ZXJ2YWxVcGRhdGVUaW1lXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uSW5jcmVhc2VCdG5Eb3duOiAoZXZlbnQpID0+XG4gICAgICBAaW5jcmVhc2VCUE0oKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGxlZnQgYnV0dG9uIGNsaWNrcy4gIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gYW5kXG4gICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25EZWNyZWFzZUJ0bkRvd246IChldmVudCkgLT5cbiAgICAgIEBkZWNyZWFzZUJQTSgpXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtb3VzZSAvIHRvdWNodXAgZXZlbnRzLiAgQ2xlYXJzIHRoZSBpbnRlcnZhbFxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkJ0blVwOiAoZXZlbnQpIC0+XG4gICAgICBjbGVhckludGVydmFsIEB1cGRhdGVJbnRlcnZhbFxuICAgICAgQHVwZGF0ZUludGVydmFsID0gbnVsbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICdicG0nLCA2MDAwMCAvIEBjdXJyQlBNXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSBsYWJlbCBvbiB0aGVcbiAgICMga2l0IHNlbGVjdG9yXG5cbiAgIG9uQlBNQ2hhbmdlOiAobW9kZWwpIC0+XG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBCUE1JbmRpY2F0b3IiLCIjIyMqXG4gKiBLaXQgc2VsZWN0b3IgZm9yIHN3aXRjaGluZyBiZXR3ZWVuIGRydW0ta2l0IHNvdW5kc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ID0gcmVxdWlyZSAnLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9raXQtc2VsZWN0aW9uLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBLaXRTZWxlY3RvciBleHRlbmRzIFZpZXdcblxuXG4gICAjIFJlZiB0byB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIEtpdENvbGxlY3Rpb24gZm9yIHVwZGF0aW5nIHNvdW5kc1xuICAgIyBAdHlwZSB7S2l0Q29sbGVjdGlvbn1cblxuICAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgVGhlIGN1cnJlbnQga2l0XG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0TW9kZWw6IG51bGxcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCAuYnRuLWxlZnQnOiAgICdvbkxlZnRCdG5DbGljaydcbiAgICAgICd0b3VjaGVuZCAuYnRuLXJpZ2h0JzogICdvblJpZ2h0QnRuQ2xpY2snXG5cblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGFuZCB1cGRhdGUgdGhlIGtpdCBpZiBub3QgYWxyZWFkeVxuICAgIyBzZXQgdmlhIGEgcHJldmlvdXMgc2Vzc2lvblxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGtpdExhYmVsID0gQCRlbC5maW5kICcubGFiZWwta2l0J1xuXG4gICAgICBpZiBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpIGlzIG51bGxcbiAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQCRraXRMYWJlbC50ZXh0IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJykuZ2V0ICdsYWJlbCdcblxuICAgICAgQFxuXG5cblxuXG4gICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRpbmcgY2hhbmdlcyByZWxhdGVkIHRvXG4gICAjIHN3aXRjaGluZyBkcnVtIGtpdHNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfS0lULCBAb25DaGFuZ2VLaXRcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG5cbiAgIG9uTGVmdEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLnByZXZpb3VzS2l0KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG5cbiAgIG9uUmlnaHRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5uZXh0S2l0KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGxhYmVsIG9uIHRoZVxuICAgIyBraXQgc2VsZWN0b3JcblxuICAgb25DaGFuZ2VLaXQ6IChtb2RlbCkgLT5cbiAgICAgIEBraXRNb2RlbCA9IG1vZGVsLmNoYW5nZWQua2l0TW9kZWxcbiAgICAgIEAka2l0TGFiZWwudGV4dCBAa2l0TW9kZWwuZ2V0ICdsYWJlbCdcblxuXG5cblxuXG4gICAjIFBSSVZBVEUgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2l0U2VsZWN0b3IiLCIjIyMqXG4gKiBTb3VuZCB0eXBlIHNlbGVjdG9yIGZvciBjaG9vc2luZyB3aGljaCBzb3VuZCBzaG91bGRcbiAqIHBsYXkgb24gZWFjaCB0cmFja1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblxuQXBwRXZlbnQgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2luc3RydW1lbnQtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEluc3RydW1lbnQgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgdmlldyBjbGFzc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdpbnN0cnVtZW50J1xuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgUmVmIHRvIHRoZSBJbnN0cnVtZW50TW9kZWxcbiAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cblxuICAgbW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgcGFyZW50IGtpdFxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdE1vZGVsOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCc6ICdvbkNsaWNrJ1xuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGNsaWNrIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGN1cnJlbnQgaW5zdHJ1bWVudCBtb2RlbCwgd2hpY2hcbiAgICMgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgbGlzdGVucyB0bywgYW5kIGFkZHMgYSBzZWxlY3RlZCBzdGF0ZVxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAa2l0TW9kZWwuc2V0ICdjdXJyZW50SW5zdHJ1bWVudCcsIEBtb2RlbFxuICAgICAgQCRlbC5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50IiwiIyMjKlxuICogUGFuZWwgd2hpY2ggaG91c2VzIGVhY2ggaW5kaXZpZHVhbCBzZWxlY3RhYmxlIHNvdW5kXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwRXZlbnQgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5JbnN0cnVtZW50ICA9IHJlcXVpcmUgJy4vSW5zdHJ1bWVudC5jb2ZmZWUnXG50ZW1wbGF0ZSAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2luc3RydW1lbnQtcGFuZWwtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEluc3RydW1lbnRTZWxlY3RvclBhbmVsIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgUmVmIHRvIHRoZSBhcHBsaWNhdGlvbiBtb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8ga2l0IGNvbGxlY3Rpb25cbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRDb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBraXRcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIGluc3RydW1lbnQgdmlld3NcbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBpbnN0cnVtZW50Vmlld3M6IG51bGxcblxuXG5cblxuICAgIyBJbml0aWFsaXplcyB0aGUgaW5zdHJ1bWVudCBzZWxlY3RvciBhbmQgc2V0cyBhIGxvY2FsIHJlZlxuICAgIyB0byB0aGUgY3VycmVudCBraXQgbW9kZWwgZm9yIGVhc3kgYWNjZXNzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAa2l0TW9kZWwgPSBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBhcyB3ZWxsIGFzIHRoZSBhc3NvY2lhdGVkIGtpdCBpbnN0cnVtZW50c1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1pbnN0cnVtZW50cydcblxuICAgICAgQHJlbmRlckluc3RydW1lbnRzKClcblxuICAgICAgQFxuXG5cblxuXG4gICAjIFJlbmRlcnMgZWFjaCBpbmRpdmlkdWFsIGtpdCBtb2RlbCBpbnRvIGFuIEluc3RydW1lbnRcblxuICAgcmVuZGVySW5zdHJ1bWVudHM6IC0+XG4gICAgICBAaW5zdHJ1bWVudFZpZXdzID0gW11cblxuICAgICAgQGtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKS5lYWNoIChtb2RlbCkgPT5cbiAgICAgICAgIGluc3RydW1lbnQgPSBuZXcgSW5zdHJ1bWVudFxuICAgICAgICAgICAga2l0TW9kZWw6IEBraXRNb2RlbFxuICAgICAgICAgICAgbW9kZWw6IG1vZGVsXG5cbiAgICAgICAgIEAkY29udGFpbmVyLmFwcGVuZCBpbnN0cnVtZW50LnJlbmRlcigpLmVsXG4gICAgICAgICBAaW5zdHJ1bWVudFZpZXdzLnB1c2ggaW5zdHJ1bWVudFxuXG5cblxuXG4gICAjIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHJlbGF0ZWQgdG8ga2l0IGNoYW5nZXNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfS0lULCBAb25LaXRDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAa2l0TW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9JTlNUUlVNRU5ULCBAb25JbnN0cnVtZW50Q2hhbmdlXG5cblxuXG4gICAjIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cblxuXG5cbiAgICMgRVZFTlQgTElTVEVORVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2UgZXZlbnRzLiAgQ2xlYW5zIHVwIHRoZSB2aWV3IGFuZCByZS1yZW5kZXJzXG4gICAjIHRoZSBpbnN0cnVtZW50cyB0byB0aGUgRE9NXG4gICAjIEBwYXJhbSB7S2l0TW9kZWx9IG1vZGVsXG5cbiAgIG9uS2l0Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuXG4gICAgICBAa2l0TW9kZWwgPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsXG5cbiAgICAgIF8uZWFjaCBAaW5zdHJ1bWVudFZpZXdzLCAoaW5zdHJ1bWVudCkgLT5cbiAgICAgICAgIGluc3RydW1lbnQucmVtb3ZlKClcblxuICAgICAgQHJlbmRlckluc3RydW1lbnRzKClcbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cblxuXG5cbiAgIG9uSW5zdHJ1bWVudENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQCRjb250YWluZXIuZmluZCgnLmluc3RydW1lbnQnKS5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG5cblxuXG5cblxuICAgb25UZXN0Q2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0nY29udGFpbmVyLWluc3RydW1lbnRzJz5cXG5cXG48L2Rpdj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiO1xuXG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz0naWNvbiBcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWNvbikgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWNvbjsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIic+PC9kaXY+XFxuPGRpdiBjbGFzcz0nbGFiZWwnPlxcblx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvZGl2PlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIiMjIypcbiAqIExpdmUgTVBDIFwicGFkXCIgY29tcG9uZW50XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI0LjE0XG4jIyNcblxuQXBwRXZlbnQgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5QYWRTcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhZFNxdWFyZU1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvcGFkL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSdcblZpZXcgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5QYWRTcXVhcmUgICAgICAgICAgID0gcmVxdWlyZSAnLi9QYWRTcXVhcmUuY29mZmVlJ1xudGVtcGxhdGUgICAgICAgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2xpdmUtcGFkLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBMaXZlUGFkIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIGNsYXNzbmFtZSBmb3IgdGhlIExpdmUgUGFkXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ2NvbnRhaW5lci1saXZlLXBhZCdcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgQXBwbW9kZWwgZm9yIGxpc3RlbmluZyB0byBzaG93IC8gaGlkZSBldmVudHNcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgQ29sbGVjdGlvbiBvZiBraXRzIHRvIGJlIHJlbmRlcmVkIHRvIHRoZSBpbnN0cnVtZW50IGNvbnRhaW5lclxuICAgIyBAdHlwZSB7S2l0Q29sbGVjdGlvbn1cblxuICAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgQ29sbGVjdGlvbiBvZiBpbnN0cnVtZW50cy4gIFVzZWQgdG8gbGlzdGVuIHRvIGBkcm9wcGVkYCBzdGF0dXNcbiAgICMgb24gaW5kaXZpZHVhbCBpbnN0cnVtZW50IG1vZGVscywgYXMgc2V0IGZyb20gdGhlIFBhZFNxdWFyZVxuICAgIyBAdHlwZSB7SW5zdHJ1bWVudENvbGxlY3Rpb259XG5cbiAgIGluc3RydW1lbnRDb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBDb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgcGFkIHNxdWFyZSBtb2RlbHNcbiAgICMgQHR5cGUge1BhZFNxdWFyZUNvbGxlY3Rpb259XG5cbiAgIHBhZFNxdWFyZUNvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIEFuIGFycmF5IG9mIGluZGl2aWR1YWwgUGFkU3F1YXJlVmlld3NcbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBwYWRTcXVhcmVWaWV3czogbnVsbFxuXG5cbiAgICMgS2V5IGNvbW1hbmQga2V5bWFwIGZvciBsaXZlIGtpdCBwbGF5YmFja1xuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIGtleW1hcDogWycxJywnMicsJzMnLCc0JywncScsICd3JywgJ2UnLCAncicsICdhJywgJ3MnLCAnZCcsICdmJywgJ3onLCAneCcsICdjJywgJ3YnXVxuXG5cblxuICAgIyBSZW5kZXIgdGhlIHZpZXcgYW5kIGFuZCBwYXJzZSB0aGUgY29sbGVjdGlvbiBpbnRvIGEgZGlzcGxheWFibGVcbiAgICMgaW5zdHJ1bWVudCAvIHBhZCB0YWJsZVxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgIyBAcmV0dXJuIHtMaXZlUGFkfVxuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuXG4gICAgICAjIFJlbmRlciB0aGUgdGFibGUgdG8gdGhlIERPTVxuICAgICAgc3VwZXIge1xuICAgICAgICAgcGFkVGFibGU6IEByZXR1cm5QYWRUYWJsZURhdGEoKVxuICAgICAgICAgaW5zdHJ1bWVudFRhYmxlOiBAcmV0dXJuSW5zdHJ1bWVudFRhYmxlRGF0YSgpXG4gICAgICB9XG5cbiAgICAgICMgUmVuZGVyIHNxdWFyZXMgdG8gdGhlIERPTVxuICAgICAgXy5lYWNoIEBwYWRTcXVhcmVWaWV3cywgKHBhZFNxdWFyZSkgPT5cbiAgICAgICAgIGlkID0gcGFkU3F1YXJlLm1vZGVsLmdldCAnaWQnXG4gICAgICAgICBAJGVsLmZpbmQoXCIjI3tpZH1cIikuaHRtbCBwYWRTcXVhcmUucmVuZGVyKCkuZWxcblxuXG4gICAgICBAJHBhZENvbnRhaW5lciAgICAgICAgPSBAJGVsLmZpbmQgJy5jb250YWluZXItcGFkcydcbiAgICAgIEAkaW5zdHJ1bWVudENvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1pbnN0cnVtZW50cydcbiAgICAgIEAkaW5zdHJ1bWVudCAgICAgICAgICA9IEAkZWwuZmluZCAnLmluc3RydW1lbnQnXG5cbiAgICAgIEBzZXREcmFnQW5kRHJvcCgpXG5cbiAgICAgIEBcblxuXG5cbiAgICMgQWRkIGNvbGxlY3Rpb24gbGlzdGVuZXJzIHRvIGxpc3RlbiBmb3IgaW5zdHJ1bWVudCBkcm9wc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGRyb3AgY2hhbmdlIGV2ZW50cy4gIENoZWNrcyB0byBzZWUgaWYgdGhlIGluc3RydW1lbnRcbiAgICMgY2xhc3NOYW1lIGV4aXN0cyBvbiB0aGUgZWxlbWVudCBhbmQsIGlmIHNvLCByZS1yZW5kZXJzIHRoZVxuICAgIyBpbnN0cnVtZW50IGFuZCBwYWQgdGFibGVzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBpbnN0cnVtZW50TW9kZWxcblxuICAgb25Ecm9wcGVkQ2hhbmdlOiAoaW5zdHJ1bWVudE1vZGVsKSA9PlxuICAgICAgaW5zdHJ1bWVudElkID0gaW5zdHJ1bWVudE1vZGVsLmdldCgnaWQnKVxuICAgICAgJHBhZFNxdWFyZSAgID0gQCRlbC5maW5kIFwiLiN7aW5zdHJ1bWVudElkfVwiXG4gICAgICBwYWRTcXVhcmVJZCAgPSAkcGFkU3F1YXJlLmF0dHIgJ2lkJ1xuICAgICAgcGFkU3F1YXJlTW9kZWwgPSBAcGFkU3F1YXJlQ29sbGVjdGlvbi5maW5kV2hlcmUgeyBpZDogcGFkU3F1YXJlSWQgfVxuXG4gICAgICAjIENoZWNrcyBhZ2FpbnN0IHRlc3RzIGFuZCBkcmFnZ2FibGUsIHdoaWNoIGlzIGxlc3MgdGVzdGFibGVcbiAgICAgIHVubGVzcyBwYWRTcXVhcmVNb2RlbCBpcyB1bmRlZmluZWRcbiAgICAgICAgIHBhZFNxdWFyZU1vZGVsLnNldCAnY3VycmVudEluc3RydW1lbnQnLCBpbnN0cnVtZW50TW9kZWxcblxuXG5cblxuICAgb25JbnN0cnVtZW50RHJvcDogKGRyYWdnZWQsIGRyb3BwZWQpID0+XG4gICAgICAkZHJhZ2dlZCA9ICQoZHJhZ2dlZClcbiAgICAgICRkcm9wcGVkID0gJChkcm9wcGVkKVxuXG4gICAgICBpZCA9ICRkcmFnZ2VkLmF0dHIgJ2lkJ1xuICAgICAgJGRyb3BwZWQuYWRkQ2xhc3MgaWRcblxuICAgICAgaW5zdHJ1bWVudE1vZGVsID0gQGtpdENvbGxlY3Rpb24uZmluZEluc3RydW1lbnRNb2RlbCBpZFxuICAgICAgaW5zdHJ1bWVudE1vZGVsLnNldCAnZHJvcHBlZCcsIHRydWVcblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgIHNldERyYWdBbmREcm9wOiAtPlxuICAgICAgc2VsZiA9IEBcblxuICAgICAgJGRyb3BwYWJsZXMgPSBAJGVsLmZpbmQgJy5jb250YWluZXItcGFkJ1xuXG4gICAgICBAZHJhZ2dhYmxlID0gRHJhZ2dhYmxlLmNyZWF0ZSBAJGluc3RydW1lbnQsXG4gICAgICAgICBib3VuZHM6IHdpbmRvd1xuXG4gICAgICAgICBvbkRyYWc6IChldmVudCkgLT5cbiAgICAgICAgICAgIGkgPSAkZHJvcHBhYmxlcy5sZW5ndGhcblxuICAgICAgICAgICAgd2hpbGUoLS1pID4gLTEpXG4gICAgICAgICAgICAgICBpZiBAaGl0VGVzdCgkZHJvcHBhYmxlc1tpXSwgJzUwJScpXG4gICAgICAgICAgICAgICAgICAkKCRkcm9wcGFibGVzW2ldKS5hZGRDbGFzcyAnaGlnaGxpZ2h0J1xuICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgJCgkZHJvcHBhYmxlc1tpXSkucmVtb3ZlQ2xhc3MgJ2hpZ2hsaWdodCdcblxuICAgICAgICAgb25EcmFnRW5kOiAoZXZlbnQpIC0+XG4gICAgICAgICAgICBpID0gJGRyb3BwYWJsZXMubGVuZ3RoXG5cbiAgICAgICAgICAgIHdoaWxlKC0taSA+IC0xKVxuICAgICAgICAgICAgICAgaWYgQGhpdFRlc3QoJGRyb3BwYWJsZXNbaV0sICc1MCUnKVxuICAgICAgICAgICAgICAgICAgc2VsZi5vbkluc3RydW1lbnREcm9wKHRoaXMudGFyZ2V0LCAkZHJvcHBhYmxlc1tpXSlcblxuXG5cblxuXG5cbiAgICMgUmVuZGVyIG91dCB0aGUgdGFibGUgZm9yIHRoZSBsaXZlIHBhZCBncmlkIGFuZCBwdXNoXG4gICAjIGl0IGludG8gYW4gYXJyYXkgb2YgdGFibGUgcm93cyBhbmQgdGRzXG4gICAjIEByZXR1cm4ge09iamVjdH1cblxuICAgcmV0dXJuUGFkVGFibGVEYXRhOiAtPlxuXG4gICAgICBAcGFkU3F1YXJlQ29sbGVjdGlvbiA9IG5ldyBQYWRTcXVhcmVDb2xsZWN0aW9uKClcbiAgICAgIEBwYWRTcXVhcmVWaWV3cyA9IFtdXG4gICAgICBwYWRUYWJsZSA9IHt9XG4gICAgICByb3dzID0gW11cbiAgICAgIGl0ZXJhdG9yID0gMFxuXG4gICAgICAjIFJlbmRlciBvdXQgcm93c1xuICAgICAgXyg0KS50aW1lcyAoaW5kZXgpID0+XG4gICAgICAgICB0ZHMgID0gW11cblxuICAgICAgICAgIyBSZW5kZXIgb3V0IGNvbHVtbnNcbiAgICAgICAgIF8oNCkudGltZXMgKGluZGV4KSA9PlxuXG4gICAgICAgICAgICAjIEluc3RhbnRpYXRlIGVhY2ggcGFkIHZpZXcgYW5kIHRpZSB0aGUgaWRcbiAgICAgICAgICAgICMgdG8gdGhlIERPTSBlbGVtZW50XG5cbiAgICAgICAgICAgIG1vZGVsID0gbmV3IFBhZFNxdWFyZU1vZGVsXG4gICAgICAgICAgICAgICBrZXljb2RlOiBAa2V5bWFwW2l0ZXJhdG9yXVxuXG4gICAgICAgICAgICBwYWRTcXVhcmUgPSBuZXcgUGFkU3F1YXJlXG4gICAgICAgICAgICAgICBtb2RlbDogbW9kZWxcbiAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgICAgICAgIEBwYWRTcXVhcmVDb2xsZWN0aW9uLmFkZCBtb2RlbFxuICAgICAgICAgICAgQHBhZFNxdWFyZVZpZXdzLnB1c2ggcGFkU3F1YXJlXG4gICAgICAgICAgICBpdGVyYXRvcisrXG5cbiAgICAgICAgICAgIHRkcy5wdXNoIHtcbiAgICAgICAgICAgICAgIGlkOiBwYWRTcXVhcmUubW9kZWwuZ2V0KCdpZCcpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgIHJvd3MucHVzaCB7XG4gICAgICAgICAgICBpZDogXCJwYWQtcm93LSN7aW5kZXh9XCJcbiAgICAgICAgICAgIHRkczogdGRzXG4gICAgICAgICB9XG5cbiAgICAgIHBhZFRhYmxlLnJvd3MgPSByb3dzXG5cbiAgICAgIHBhZFRhYmxlXG5cblxuXG5cbiAgICMgUmVuZGVyIG91dCB0aGUgaW5zdHJ1bWVudCB0YWJsZSBhbmQgcHVzaCBpdCBpbnRvXG4gICAjIGFuZCBhcnJheSBvZiBpbmRpdmlkdWFsIGluc3RydW1lbnRzXG4gICAjIEByZXR1cm4ge09iamVjdH1cblxuICAgcmV0dXJuSW5zdHJ1bWVudFRhYmxlRGF0YTogLT5cbiAgICAgIGluc3RydW1lbnRUYWJsZSA9IEBraXRDb2xsZWN0aW9uLm1hcCAoa2l0KSA9PlxuICAgICAgICAgaW5zdHJ1bWVudENvbGxlY3Rpb24gPSBraXQuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgICAgICMgQmVnaW4gbGlzdGVuaW5nIHRvIGRyb3AgZXZlbnRzXG4gICAgICAgICBAbGlzdGVuVG8gaW5zdHJ1bWVudENvbGxlY3Rpb24sIEFwcEV2ZW50LkNIQU5HRV9EUk9QUEVELCBAb25Ecm9wcGVkQ2hhbmdlXG5cbiAgICAgICAgIGluc3RydW1lbnRzID0gaW5zdHJ1bWVudENvbGxlY3Rpb24ubWFwIChpbnN0cnVtZW50KSA9PlxuICAgICAgICAgICAgaW5zdHJ1bWVudC50b0pTT04oKVxuXG4gICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGFiZWw6IGtpdC5nZXQgJ2xhYmVsJ1xuICAgICAgICAgICAgaW5zdHJ1bWVudHM6IGluc3RydW1lbnRzXG4gICAgICAgICB9XG5cbiAgICAgIGluc3RydW1lbnRUYWJsZVxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGl2ZVBhZCIsIiMjIypcbiAqIExpdmUgTVBDIFwicGFkXCIgY29tcG9uZW50XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI0LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBFdmVudCAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGFkLXNxdWFyZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgUGFkU3F1YXJlIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIHRhZyB0byBiZSByZW5kZXJlZCB0byB0aGUgRE9NXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHRhZ05hbWU6ICdkaXYnXG5cblxuICAgIyBUaGUgY2xhc3NuYW1lIGZvciB0aGUgUGFkIFNxdWFyZVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdwYWQtc3F1YXJlJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBNb2RlbCB3aGljaCB0cmFja3Mgc3RhdGUgb2Ygc3F1YXJlIGFuZCBpbnN0cnVtZW50c1xuICAgIyBAdHlwZSB7UGFkU3F1YXJlTW9kZWx9XG5cbiAgIG1vZGVsOiBudWxsXG5cblxuICAgIyBUaGUgY3VycmVudCBpY29uIGNsYXNzIGFzIGFwcGxpZWQgdG8gdGhlIHNxdWFyZVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjdXJyZW50SWNvbjogbnVsbFxuXG5cbiAgICMgVGhlIGF1ZGlvIHBsYXliYWNrIGNvbXBvbmVudFxuICAgIyBAdHlwZSB7SG93bH1cblxuICAgYXVkaW9QbGF5YmFjazogbnVsbFxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQnOiAnb25DbGljaydcblxuXG5cblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRpY29uQ29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLWljb24nXG4gICAgICBAJGljb24gICAgICAgICAgPSBAJGljb25Db250YWluZXIuZmluZCAnLmljb24nXG5cbiAgICAgIEBcblxuXG4gICByZW1vdmU6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjaz8udW5sb2FkKClcbiAgICAgIHN1cGVyKClcblxuXG5cblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQG1vZGVsLCBBcHBFdmVudC5DSEFOR0VfVFJJR0dFUiwgQG9uVHJpZ2dlckNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBtb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0lOU1RSVU1FTlQsIEBvbkluc3RydW1lbnRDaGFuZ2VcblxuXG5cblxuICAgdXBkYXRlSW5zdHJ1bWVudENsYXNzOiAtPlxuICAgICAgaW5zdHJ1bWVudCA9IEBtb2RlbC5nZXQgJ2N1cnJlbnRJbnN0cnVtZW50J1xuICAgICAgQCRlbC5hZGRDbGFzcyBpbnN0cnVtZW50LmdldCAnaWQnXG5cblxuXG5cbiAgIHJlbmRlckljb246IC0+XG4gICAgICBpZiBAJGljb24uaGFzQ2xhc3MgQGN1cnJlbnRJY29uXG4gICAgICAgICBAJGljb24ucmVtb3ZlQ2xhc3MgQGN1cnJlbnRJY29uXG5cbiAgICAgIGluc3RydW1lbnQgPSBAbW9kZWwuZ2V0ICdjdXJyZW50SW5zdHJ1bWVudCdcblxuICAgICAgdW5sZXNzIGluc3RydW1lbnQgaXMgbnVsbFxuICAgICAgICAgQGN1cnJlbnRJY29uID0gaW5zdHJ1bWVudC5nZXQgJ2ljb24nXG4gICAgICAgICBAJGljb24uYWRkQ2xhc3MgQGN1cnJlbnRJY29uXG4gICAgICAgICBAJGljb24udGV4dCBpbnN0cnVtZW50LmdldCAnbGFiZWwnXG5cblxuXG5cbiAgIHNldFNvdW5kOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2s/LnVubG9hZCgpXG5cbiAgICAgIGluc3RydW1lbnQgPSBAbW9kZWwuZ2V0ICdjdXJyZW50SW5zdHJ1bWVudCdcblxuICAgICAgdW5sZXNzIGluc3RydW1lbnQgaXMgbnVsbFxuICAgICAgICAgYXVkaW9TcmMgPSBpbnN0cnVtZW50LmdldCAnc3JjJ1xuXG4gICAgICAgICAjIFRPRE86IFRlc3QgbWV0aG9kc1xuICAgICAgICAgaWYgd2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZigndGVzdCcpIGlzbnQgLTEgdGhlbiBhdWRpb1NyYyA9ICcnXG5cbiAgICAgICAgIEBhdWRpb1BsYXliYWNrID0gbmV3IEhvd2xcbiAgICAgICAgICAgIHZvbHVtZTogQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubWVkaXVtXG4gICAgICAgICAgICB1cmxzOiBbYXVkaW9TcmNdXG4gICAgICAgICAgICBvbmVuZDogQG9uU291bmRFbmRcblxuXG5cbiAgIHJlbW92ZVNvdW5kOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2s/LnVubG9hZCgpXG5cbiAgICAgIGlkICAgPSBAbW9kZWwuZ2V0KCdjdXJyZW50SW5zdHJ1bWVudCcpLmdldCAnaWQnXG4gICAgICBpY29uID0gQG1vZGVsLmdldCgnY3VycmVudEluc3RydW1lbnQnKS5nZXQgJ2ljb24nXG5cbiAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgaWRcbiAgICAgIEAkaWNvbi5yZW1vdmVDbGFzcyBpY29uXG5cbiAgICAgIF8uZGVmZXIgPT5cbiAgICAgICAgIEBtb2RlbC5zZXQgJ2N1cnJlbnRJbnN0cnVtZW50JywgbnVsbFxuXG5cblxuXG4gICBwbGF5U291bmQ6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjaz8ucGxheSgpXG4gICAgICBAbW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICBvbkNsaWNrOiAoZXZlbnQpID0+XG4gICAgICBAbW9kZWwuc2V0ICd0cmlnZ2VyJywgdHJ1ZVxuXG4gICAgICBjb25zb2xlLmxvZyAnaGV5J1xuXG5cblxuXG4gICBvbkhvbGQ6IChldmVudCkgPT5cbiAgICAgIEBtb2RlbC5zZXQgJ2RyYWdnaW5nJywgdHJ1ZVxuXG5cblxuXG4gICBvbkRyYWc6IChldmVudCkgLT5cbiAgICAgIEBtb2RlbC5zZXQgJ2RyYWdnaW5nJywgdHJ1ZVxuXG5cblxuXG4gICBvbkRyb3A6IChpZCkgLT5cbiAgICAgIGluc3RydW1lbnRNb2RlbCA9IEBjb2xsZWN0aW9uLmZpbmRJbnN0cnVtZW50TW9kZWwgaWRcblxuICAgICAgIyBTZXQgZHJvcHBlZCBzdGF0dXMgc28gdGhhdCBiaS1kaXJlY3Rpb25hbFxuICAgICAgIyBjaGFuZ2UgY2FuIGJlIHRyaWdnZXJlZCBmcm9tIHRoZSBMaXZlUGFkXG4gICAgICAjIGtpdCByZW5kZXJcblxuICAgICAgaW5zdHJ1bWVudE1vZGVsLnNldCAnZHJvcHBlZCcsIHRydWVcblxuICAgICAgQG1vZGVsLnNldFxuICAgICAgICAgJ2RyYWdnaW5nJzogZmFsc2VcbiAgICAgICAgICdkcm9wcGVkJzogdHJ1ZVxuICAgICAgICAgJ2N1cnJlbnRJbnN0cnVtZW50JzogaW5zdHJ1bWVudE1vZGVsXG5cblxuXG5cbiAgIG9uVHJpZ2dlckNoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgcGxheWluZyA9IG1vZGVsLmNoYW5nZWQucGxheWluZ1xuXG4gICAgICBpZiBwbGF5aW5nXG4gICAgICAgICBAcGxheVNvdW5kKClcblxuXG5cbiAgIG9uSW5zdHJ1bWVudENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgaW5zdHJ1bWVudCA9IG1vZGVsLmNoYW5nZWQuY3VycmVudEluc3RydW1lbnRcblxuICAgICAgdW5sZXNzIGluc3RydW1lbnQgaXMgbnVsbCBvciBpbnN0cnVtZW50IGlzIHVuZGVmaW5lZFxuICAgICAgICAgQHVwZGF0ZUluc3RydW1lbnRDbGFzcygpXG4gICAgICAgICBAcmVuZGVySWNvbigpXG4gICAgICAgICBAc2V0U291bmQoKVxuXG5cblxuXG4gICBvblNvdW5kRW5kOiA9PlxuICAgICAgQG1vZGVsLnNldCAndHJpZ2dlcicsIGZhbHNlXG5cblxuXG5cbiAgICMgUFJJVkFURSBNRVRIT0RTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYWRTcXVhcmUiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBzdGFjazIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8dHI+XFxuXHRcdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgZGVwdGgwLnRkcywge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDIsIHByb2dyYW0yLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8L3RyPlxcblx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0yKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0XHRcdDx0ZCBjbGFzcz0nY29udGFpbmVyLXBhZCcgaWQ9XFxcIlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5pZCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWQ7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiPlxcblxcblx0XHRcdFx0PC90ZD5cXG5cdFx0XHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtNChkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHRcdDxkaXYgY2xhc3M9J2NvbnRhaW5lci1pbnN0cnVtZW50Jz5cXG5cdFx0XHQ8aDM+XFxuXHRcdFx0XHQ8Yj5cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmxhYmVsOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPC9iPlxcblx0XHRcdDwvaDM+XFxuXFxuXHRcdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgZGVwdGgwLmluc3RydW1lbnRzLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oNSwgcHJvZ3JhbTUsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHRcdDwvZGl2Plxcblx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW01KGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0XHRcdDxkaXYgY2xhc3M9J2luc3RydW1lbnQnIGlkPVxcXCJcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWQpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmlkOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj5cXG5cdFx0XHRcdFx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8dGFibGUgY2xhc3M9J2NvbnRhaW5lci1wYWRzJz5cXG5cdFwiO1xuICBzdGFjazIgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsICgoc3RhY2sxID0gZGVwdGgwLnBhZFRhYmxlKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLnJvd3MpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazIgfHwgc3RhY2syID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazI7IH1cbiAgYnVmZmVyICs9IFwiXFxuPC90YWJsZT5cXG5cXG5cXG48ZGl2IGNsYXNzPSdjb250YWluZXItaW5zdHJ1bWVudHMnPlxcblx0XCI7XG4gIHN0YWNrMiA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgZGVwdGgwLmluc3RydW1lbnRUYWJsZSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDQsIHByb2dyYW00LCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvZGl2PlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPSdrZXktY29kZSc+XFxuXHRcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMua2V5Y29kZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAua2V5Y29kZTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci1pY29uJz5cXG5cdDxkaXYgY2xhc3M9J2ljb24nPlxcblxcblx0PC9kaXY+XFxuPC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwiIyMjKlxuICogSW5kaXZpZHVhbCBzZXF1ZW5jZXIgdHJhY2tzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYXR0ZXJuLXNxdWFyZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgUGF0dGVyblNxdWFyZSBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBjb250YWluZXIgY2xhc3NuYW1lXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3BhdHRlcm4tc3F1YXJlJ1xuXG5cbiAgICMgVGhlIERPTSB0YWcgYW5lbVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICB0YWdOYW1lOiAndGQnXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFRoZSBhdWRpbyBwbGF5YmFjayBpbnN0YW5jZSAoSG93bGVyKVxuICAgIyBAdHlwZSB7SG93bH1cblxuICAgYXVkaW9QbGF5YmFjazogbnVsbFxuXG5cbiAgICMgVGhlIG1vZGVsIHdoaWNoIGNvbnRyb2xzIHZvbHVtZSwgcGxheWJhY2ssIGV0Y1xuICAgIyBAdHlwZSB7UGF0dGVyblNxdWFyZU1vZGVsfVxuXG4gICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG51bGxcblxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kJzogJ29uQ2xpY2snXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYW5kIGluc3RhbnRpYXRlcyB0aGUgaG93bGVyIGF1ZGlvIGVuZ2luZVxuICAgIyBAcGF0dGVyblNxdWFyZU1vZGVsIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgYXVkaW9TcmMgPSBAcGF0dGVyblNxdWFyZU1vZGVsLmdldCgnaW5zdHJ1bWVudCcpLmdldCAnc3JjJ1xuXG4gICAgICAjIFRPRE86IFRlc3QgbWV0aG9kc1xuICAgICAgaWYgd2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZigndGVzdCcpIGlzbnQgLTEgdGhlbiBhdWRpb1NyYyA9ICcnXG5cbiAgICAgIEBhdWRpb1BsYXliYWNrID0gbmV3IEhvd2xcbiAgICAgICAgIHZvbHVtZTogQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubG93XG4gICAgICAgICB1cmxzOiBbYXVkaW9TcmNdXG4gICAgICAgICBvbmVuZDogQG9uU291bmRFbmRcblxuICAgICAgQFxuXG5cblxuXG4gICAjIFJlbW92ZSB0aGUgdmlldyBhbmQgZGVzdHJveSB0aGUgYXVkaW8gcGxheWJhY2tcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2sudW5sb2FkKClcbiAgICAgIHN1cGVyKClcblxuXG5cblxuICAgIyBBZGRzIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVnaW5zIGxpc3RlbmluZyBmb3IgdmVsb2NpdHksIGFjdGl2aXR5IGFuZCB0cmlnZ2Vyc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAcGF0dGVyblNxdWFyZU1vZGVsLCBBcHBFdmVudC5DSEFOR0VfVkVMT0NJVFksIEBvblZlbG9jaXR5Q2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0FDVElWRSwgICBAb25BY3RpdmVDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAcGF0dGVyblNxdWFyZU1vZGVsLCBBcHBFdmVudC5DSEFOR0VfVFJJR0dFUiwgIEBvblRyaWdnZXJDaGFuZ2VcblxuXG5cblxuICAgIyBFbmFibGUgcGxheWJhY2sgb2YgdGhlIGF1ZGlvIHNxdWFyZVxuXG4gICBlbmFibGU6IC0+XG4gICAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmVuYWJsZSgpXG5cblxuXG5cbiAgICMgRGlzYWJsZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgIGRpc2FibGU6IC0+XG4gICAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmRpc2FibGUoKVxuXG5cblxuXG4gICAjIFBsYXliYWNrIGF1ZGlvIG9uIHRoZSBhdWRpbyBzcXVhcmVcblxuICAgcGxheTogLT5cbiAgICAgIEBhdWRpb1BsYXliYWNrLnBsYXkoKVxuXG4gICAgICBUd2Vlbk1heC50byBAJGVsLCAuMixcbiAgICAgICAgIGVhc2U6IEJhY2suZWFzZUluXG4gICAgICAgICBzY2FsZTogLjVcblxuICAgICAgICAgb25Db21wbGV0ZTogPT5cblxuICAgICAgICAgICAgVHdlZW5NYXgudG8gQCRlbCwgLjIsXG4gICAgICAgICAgICAgICBzY2FsZTogMVxuICAgICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgY2xpY2sgZXZlbnRzIG9uIHRoZSBhdWRpbyBzcXVhcmUuICBUb2dnbGVzIHRoZVxuICAgIyB2b2x1bWUgZnJvbSBsb3cgdG8gaGlnaCB0byBvZmZcblxuICAgb25DbGljazogKGV2ZW50KSAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5jeWNsZSgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgdmVsb2NpdHkgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIHZpc3VhbCBkaXNwbGF5IGFuZCBzZXRzIHZvbHVtZVxuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25WZWxvY2l0eUNoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgdmVsb2NpdHkgPSBtb2RlbC5jaGFuZ2VkLnZlbG9jaXR5XG5cbiAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgJ3ZlbG9jaXR5LWxvdyB2ZWxvY2l0eS1tZWRpdW0gdmVsb2NpdHktaGlnaCdcblxuICAgICAgIyBTZXQgdmlzdWFsIGluZGljYXRvclxuICAgICAgdmVsb2NpdHlDbGFzcyA9IHN3aXRjaCB2ZWxvY2l0eVxuICAgICAgICAgd2hlbiAxIHRoZW4gJ3ZlbG9jaXR5LWxvdydcbiAgICAgICAgIHdoZW4gMiB0aGVuICd2ZWxvY2l0eS1tZWRpdW0nXG4gICAgICAgICB3aGVuIDMgdGhlbiAndmVsb2NpdHktaGlnaCdcbiAgICAgICAgIGVsc2UgJydcblxuICAgICAgQCRlbC5hZGRDbGFzcyB2ZWxvY2l0eUNsYXNzXG5cblxuICAgICAgIyBTZXQgYXVkaW8gdm9sdW1lXG4gICAgICB2b2x1bWUgPSBzd2l0Y2ggdmVsb2NpdHlcbiAgICAgICAgIHdoZW4gMSB0aGVuIEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLmxvd1xuICAgICAgICAgd2hlbiAyIHRoZW4gQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubWVkaXVtXG4gICAgICAgICB3aGVuIDMgdGhlbiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5oaWdoXG4gICAgICAgICBlbHNlICcnXG5cbiAgICAgIEBhdWRpb1BsYXliYWNrLnZvbHVtZSggdm9sdW1lIClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBhY3Rpdml0eSBjaGFuZ2UgZXZlbnRzLiAgV2hlbiBpbmFjdGl2ZSwgY2hlY2tzIGFnYWluc3QgcGxheWJhY2sgYXJlXG4gICAjIG5vdCBwZXJmb3JtZWQgYW5kIHRoZSBzcXVhcmUgaXMgc2tpcHBlZC5cbiAgICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uQWN0aXZlQ2hhbmdlOiAobW9kZWwpIC0+XG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgdHJpZ2dlciBcInBsYXliYWNrXCIgZXZlbnRzXG4gICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gICBvblRyaWdnZXJDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIGlmIG1vZGVsLmNoYW5nZWQudHJpZ2dlciBpcyB0cnVlXG4gICAgICAgICBAcGxheSgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Igc291bmQgcGxheWJhY2sgZW5kIGV2ZW50cy4gIFJlbW92ZXMgdGhlIHRyaWdnZXJcbiAgICMgZmxhZyBzbyB0aGUgYXVkaW8gd29uJ3Qgb3ZlcmxhcFxuXG4gICBvblNvdW5kRW5kOiA9PlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5zZXQgJ3RyaWdnZXInLCBmYWxzZVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmUiLCIjIyMqXG4gKiBJbmRpdmlkdWFsIHNlcXVlbmNlciB0cmFja3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlICAgICAgICAgICA9IHJlcXVpcmUgJy4vUGF0dGVyblNxdWFyZS5jb2ZmZWUnXG5WaWV3ICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGF0dGVybi10cmFjay10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgUGF0dGVyblRyYWNrIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIG5hbWUgb2YgdGhlIGNsYXNzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3BhdHRlcm4tdHJhY2snXG5cblxuICAgIyBUaGUgdHlwZSBvZiB0YWdcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdGFnTmFtZTogJ3RyJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBBIGNvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCB2aWV3IHNxdWFyZXNcbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBwYXR0ZXJuU3F1YXJlVmlld3M6IG51bGxcblxuXG4gICAjIEB0eXBlIHtQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbn1cbiAgIGNvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICBtb2RlbDogbnVsbFxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5sYWJlbC1pbnN0cnVtZW50JzogJ29uTGFiZWxDbGljaydcbiAgICAgICd0b3VjaGVuZCAuYnRuLW11dGUnOiAgICAgICAgICdvbk11dGVCdG5DbGljaydcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGFuZCByZW5kZXJzIG91dCBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGxhYmVsID0gQCRlbC5maW5kICcubGFiZWwtaW5zdHJ1bWVudCdcblxuICAgICAgQHJlbmRlclBhdHRlcm5TcXVhcmVzKClcblxuICAgICAgQFxuXG5cblxuICAgcmVtb3ZlOiAtPlxuICAgICAgXy5lYWNoIEBwYXR0ZXJuU3F1YXJlVmlld3MsIChzcXVhcmUpID0+XG4gICAgICAgICBzcXVhcmUucmVtb3ZlKClcblxuICAgICAgc3VwZXIoKVxuXG5cblxuXG4gICAjIEFkZCBsaXN0ZW5lcnMgdG8gdGhlIHZpZXcgd2hpY2ggbGlzdGVuIGZvciB2aWV3IGNoYW5nZXNcbiAgICMgYXMgd2VsbCBhcyBjaGFuZ2VzIHRvIHRoZSBjb2xsZWN0aW9uLCB3aGljaCBzaG91bGQgdXBkYXRlXG4gICAjIHBhdHRlcm4gc3F1YXJlcyB3aXRob3V0IHJlLXJlbmRlcmluZyB0aGUgdmlld3NcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAa2l0TW9kZWwgPSBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpXG5cbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsICAgIEFwcEV2ZW50LkNIQU5HRV9GT0NVUywgICAgICBAb25Gb2N1c0NoYW5nZVxuICAgICAgQGxpc3RlblRvIEBtb2RlbCwgICAgQXBwRXZlbnQuQ0hBTkdFX01VVEUsICAgICAgIEBvbk11dGVDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAa2l0TW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9JTlNUUlVNRU5ULCBAb25JbnN0cnVtZW50Q2hhbmdlXG5cblxuXG5cbiAgICMgUmVuZGVyIG91dCB0aGUgcGF0dGVybiBzcXVhcmVzIGFuZCBwdXNoIHRoZW0gaW50byBhbiBhcnJheVxuICAgIyBmb3IgZnVydGhlciBpdGVyYXRpb25cblxuICAgcmVuZGVyUGF0dGVyblNxdWFyZXM6IC0+XG4gICAgICBAcGF0dGVyblNxdWFyZVZpZXdzID0gW11cblxuICAgICAgQGNvbGxlY3Rpb24gPSBuZXcgUGF0dGVyblNxdWFyZUNvbGxlY3Rpb25cblxuICAgICAgXyg4KS50aW1lcyA9PlxuICAgICAgICAgQGNvbGxlY3Rpb24uYWRkIG5ldyBQYXR0ZXJuU3F1YXJlTW9kZWwgeyBpbnN0cnVtZW50OiBAbW9kZWwgfVxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChtb2RlbCkgPT5cbiAgICAgICAgIHBhdHRlcm5TcXVhcmUgPSBuZXcgUGF0dGVyblNxdWFyZVxuICAgICAgICAgICAgcGF0dGVyblNxdWFyZU1vZGVsOiBtb2RlbFxuXG4gICAgICAgICBAJGxhYmVsLnRleHQgbW9kZWwuZ2V0ICdsYWJlbCdcbiAgICAgICAgIEAkZWwuYXBwZW5kIHBhdHRlcm5TcXVhcmUucmVuZGVyKCkuZWxcbiAgICAgICAgIEBwYXR0ZXJuU3F1YXJlVmlld3MucHVzaCBwYXR0ZXJuU3F1YXJlXG5cbiAgICAgICMgU2V0IHRoZSBzcXVhcmVzIG9uIHRoZSBJbnN0cnVtZW50IG1vZGVsIHRvIHRyYWNrIGFnYWluc3Qgc3RhdGVcbiAgICAgIEBtb2RlbC5zZXQgJ3BhdHRlcm5TcXVhcmVzJywgQGNvbGxlY3Rpb25cblxuXG5cbiAgICMgTXV0ZSB0aGUgZW50aXJlIHRyYWNrXG5cbiAgIG11dGU6IC0+XG4gICAgICBAbW9kZWwuc2V0ICdtdXRlJywgdHJ1ZVxuXG5cblxuICAgIyBVbm11dGUgdGhlIGVudGlyZSB0cmFja1xuXG4gICB1bm11dGU6IC0+XG4gICAgICBAbW9kZWwuc2V0ICdtdXRlJywgZmFsc2VcblxuXG5cbiAgIHNlbGVjdDogLT5cbiAgICAgIEAkZWwuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuICAgZGVzZWxlY3Q6IC0+XG4gICAgICBpZiBAJGVsLmhhc0NsYXNzICdzZWxlY3RlZCdcbiAgICAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuICAgZm9jdXM6IC0+XG4gICAgICBAJGVsLmFkZENsYXNzICdmb2N1cydcblxuXG5cblxuICAgdW5mb2N1czogLT5cbiAgICAgIGlmIEAkZWwuaGFzQ2xhc3MgJ2ZvY3VzJ1xuICAgICAgICAgQCRlbC5yZW1vdmVDbGFzcyAnZm9jdXMnXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgY2hhbmdlcyB0byB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGluc3RydW1lbnRcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IGluc3RydW1lbnRNb2RlbFxuXG4gICBvbkluc3RydW1lbnRDaGFuZ2U6IChpbnN0cnVtZW50TW9kZWwpID0+XG4gICAgICBpbnN0cnVtZW50ID0gaW5zdHJ1bWVudE1vZGVsLmNoYW5nZWQuY3VycmVudEluc3RydW1lbnRcblxuICAgICAgaWYgaW5zdHJ1bWVudC5jaWQgaXMgQG1vZGVsLmNpZFxuICAgICAgICAgQHNlbGVjdCgpXG5cbiAgICAgIGVsc2UgQGRlc2VsZWN0KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtdXRlIG1vZGVsIGNoYW5nZSBldmVudHNcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uTXV0ZUNoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgbXV0ZSA9IG1vZGVsLmNoYW5nZWQubXV0ZVxuXG4gICAgICBpZiBtdXRlXG4gICAgICAgICBAJGVsLmFkZENsYXNzICdtdXRlJ1xuXG4gICAgICBlbHNlIEAkZWwucmVtb3ZlQ2xhc3MgJ211dGUnXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGZvY3VzIGNoYW5nZSBldmVudHNcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uRm9jdXNDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIGlmIG1vZGVsLmNoYW5nZWQuZm9jdXNcbiAgICAgICAgICBAZm9jdXMoKVxuICAgICAgZWxzZVxuICAgICAgICAgIEB1bmZvY3VzKClcblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBidXR0b24gY2xpY2tzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbkxhYmVsQ2xpY2s6IChldmVudCkgPT5cbiAgICAgIGlmIEBtb2RlbC5nZXQoJ211dGUnKSBpc250IHRydWVcbiAgICAgICAgIEBtb2RlbC5zZXQgJ2ZvY3VzJywgISBAbW9kZWwuZ2V0KCdmb2N1cycpXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtdXRlIGJ1dHRvbiBjbGlja3NcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uTXV0ZUJ0bkNsaWNrOiAoZXZlbnQpID0+XG4gICAgICBpZiBAbW9kZWwuZ2V0ICdtdXRlJ1xuICAgICAgICAgQHVubXV0ZSgpXG5cbiAgICAgIGVsc2UgQG11dGUoKVxuXG5cblxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblRyYWNrIiwiIyMjKlxuICogU2VxdWVuY2VyIHBhcmVudCB2aWV3IGZvciB0cmFjayBzZXF1ZW5jZXNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5QYXR0ZXJuVHJhY2sgPSByZXF1aXJlICcuL1BhdHRlcm5UcmFjay5jb2ZmZWUnXG5BcHBFdmVudCAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuaGVscGVycyAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vaGVscGVycy9oYW5kbGViYXJzLWhlbHBlcnMnXG50ZW1wbGF0ZSAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zZXF1ZW5jZXItdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFNlcXVlbmNlciBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBuYW1lIG9mIHRoZSBjb250YWluZXIgY2xhc3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnc2VxdWVuY2VyLWNvbnRhaW5lcidcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgQW4gYXJyYXkgb2YgYWxsIHBhdHRlcm4gdHJhY2tzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHBhdHRlcm5UcmFja1ZpZXdzOiBudWxsXG5cblxuICAgIyBUaGUgc2V0SW50ZXJ2YWwgdGlja2VyXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGJwbUludGVydmFsOiBudWxsXG5cblxuICAgIyBUaGUgdGltZSBpbiB3aGljaCB0aGUgaW50ZXJ2YWwgZmlyZXNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgdXBkYXRlSW50ZXJ2YWxUaW1lOiAyMDBcblxuXG4gICAjIFRoZSBjdXJyZW50IGJlYXQgaWRcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgY3VyckJlYXRDZWxsSWQ6IC0xXG5cblxuICAgIyBUT0RPOiBVcGRhdGUgdGhpcyB0byBtYWtlIGl0IG1vcmUgZHluYW1pY1xuICAgIyBUaGUgbnVtYmVyIG9mIGJlYXQgY2VsbHNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgbnVtQ2VsbHM6IDdcblxuXG4gICAjIEdsb2JhbCBhcHBsaWNhdGlvbiBtb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBDb2xsZWN0aW9uIG9mIGluc3RydW1lbnRzXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cblxuICAgY29sbGVjdGlvbjogbnVsbFxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9XG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkdGhTdGVwcGVyID0gQCRlbC5maW5kICd0aC5zdGVwcGVyJ1xuICAgICAgQCRzZXF1ZW5jZXIgPSBAJGVsLmZpbmQgJy5zZXF1ZW5jZXInXG5cbiAgICAgIEByZW5kZXJUcmFja3MoKVxuICAgICAgQHBsYXkoKVxuXG4gICAgICBAXG5cblxuICAgIyBSZW1vdmVzIHRoZSB2aWV3IGZyb20gdGhlIERPTSBhbmQgY2FuY2Vsc1xuICAgIyB0aGUgdGlja2VyIGludGVydmFsXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIF8uZWFjaCBAcGF0dGVyblRyYWNrVmlld3MsICh0cmFjaykgPT5cbiAgICAgICAgIHRyYWNrLnJlbW92ZSgpXG5cbiAgICAgIEBwYXVzZSgpXG5cbiAgICAgIHN1cGVyKClcblxuXG5cbiAgICMgQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgaGFuZGxpbmcgaW5zdHJ1bWVudCBhbmQgcGxheWJhY2tcbiAgICMgY2hhbmdlcy4gIFVwZGF0ZXMgYWxsIG9mIHRoZSB2aWV3cyBhY2NvcmRpbmdseVxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsICAgQXBwRXZlbnQuQ0hBTkdFX0JQTSwgICAgIEBvbkJQTUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgICBBcHBFdmVudC5DSEFOR0VfUExBWUlORywgQG9uUGxheWluZ0NoYW5nZVxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgICBBcHBFdmVudC5DSEFOR0VfS0lULCAgICAgQG9uS2l0Q2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGNvbGxlY3Rpb24sIEFwcEV2ZW50LkNIQU5HRV9GT0NVUywgICBAb25Gb2N1c0NoYW5nZVxuXG5cblxuICAgIyBSZW5kZXJzIG91dCBlYWNoIGluZGl2aWR1YWwgdHJhY2suXG4gICAjIFRPRE86IE5lZWQgdG8gdXBkYXRlIHNvIHRoYXQgYWxsIG9mIHRoZSBiZWF0IHNxdWFyZXMgYXJlbid0XG4gICAjIGJsb3duIGF3YXkgYnkgdGhlIHJlLXJlbmRlclxuXG4gICByZW5kZXJUcmFja3M6ID0+XG4gICAgICBAJGVsLmZpbmQoJy5wYXR0ZXJuLXRyYWNrJykucmVtb3ZlKClcblxuICAgICAgQHBhdHRlcm5UcmFja1ZpZXdzID0gW11cblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAobW9kZWwpID0+XG5cbiAgICAgICAgIHBhdHRlcm5UcmFjayA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IG1vZGVsLmdldCAncGF0dGVyblNxdWFyZXMnXG4gICAgICAgICAgICBtb2RlbDogbW9kZWxcblxuICAgICAgICAgQHBhdHRlcm5UcmFja1ZpZXdzLnB1c2ggcGF0dGVyblRyYWNrXG4gICAgICAgICBAJHNlcXVlbmNlci5hcHBlbmQgcGF0dGVyblRyYWNrLnJlbmRlcigpLmVsXG5cblxuXG5cbiAgICMgVXBkYXRlIHRoZSB0aWNrZXIgdGltZSwgYW5kIGFkdmFuY2VzIHRoZSBiZWF0XG5cbiAgIHVwZGF0ZVRpbWU6ID0+XG4gICAgICBAJHRoU3RlcHBlci5yZW1vdmVDbGFzcyAnc3RlcCdcbiAgICAgIEBjdXJyQmVhdENlbGxJZCA9IGlmIEBjdXJyQmVhdENlbGxJZCA8IEBudW1DZWxscyB0aGVuIEBjdXJyQmVhdENlbGxJZCArPSAxIGVsc2UgQGN1cnJCZWF0Q2VsbElkID0gMFxuICAgICAgJChAJHRoU3RlcHBlcltAY3VyckJlYXRDZWxsSWRdKS5hZGRDbGFzcyAnc3RlcCdcblxuICAgICAgQHBsYXlBdWRpbygpXG5cblxuXG5cbiAgICMgQ29udmVydHMgbWlsbGlzZWNvbmRzIHRvIEJQTVxuXG4gICBjb252ZXJ0QlBNOiAtPlxuICAgICAgcmV0dXJuIDIwMFxuXG5cblxuICAgIyBTdGFydCBwbGF5YmFjayBvZiBzZXF1ZW5jZXJcblxuICAgcGxheTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3BsYXlpbmcnLCB0cnVlXG5cblxuXG5cbiAgICMgUGF1c2VzIHNlcXVlbmNlciBwbGF5YmFja1xuXG4gICBwYXVzZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3BsYXlpbmcnLCBmYWxzZVxuXG5cblxuXG4gICAjIE11dGVzIHRoZSBzZXF1ZW5jZXJcblxuICAgbXV0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ211dGUnLCB0cnVlXG5cblxuXG5cbiAgICMgVW5tdXRlcyB0aGUgc2VxdWVuY2VyXG5cbiAgIHVubXV0ZTogLT5cbiAgICAgICBAYXBwTW9kZWwuc2V0ICdtdXRlJywgZmFsc2VcblxuXG5cblxuXG4gICAjIFBsYXlzIGF1ZGlvIG9mIGVhY2ggdHJhY2sgY3VycmVudGx5IGVuYWJsZWQgYW5kIG9uXG5cbiAgIHBsYXlBdWRpbzogLT5cbiAgICAgIGZvY3VzZWRJbnN0cnVtZW50ID0gIEBjb2xsZWN0aW9uLmZpbmRXaGVyZSB7IGZvY3VzOiB0cnVlIH1cblxuICAgICAgIyBDaGVjayBpZiB0aGVyZSdzIGEgZm9jdXNlZCB0cmFjayBhbmQgb25seVxuICAgICAgIyBwbGF5IGF1ZGlvIGZyb20gdGhlcmVcblxuICAgICAgaWYgZm9jdXNlZEluc3RydW1lbnRcbiAgICAgICAgIGlmIGZvY3VzZWRJbnN0cnVtZW50LmdldCgnbXV0ZScpIGlzbnQgdHJ1ZVxuICAgICAgICAgICAgZm9jdXNlZEluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpLmVhY2ggKHBhdHRlcm5TcXVhcmUsIGluZGV4KSA9PlxuICAgICAgICAgICAgICAgQHBsYXlQYXR0ZXJuU3F1YXJlQXVkaW8oIHBhdHRlcm5TcXVhcmUsIGluZGV4IClcblxuICAgICAgICAgcmV0dXJuXG5cblxuICAgICAgIyBJZiBub3RoaW5nIGlzIGZvY3VzZWQsIHRoZW4gY2hlY2sgYWdhaW5zdFxuICAgICAgIyB0aGUgZW50aXJlIG1hdHJpeFxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChpbnN0cnVtZW50KSA9PlxuICAgICAgICAgaWYgaW5zdHJ1bWVudC5nZXQoJ211dGUnKSBpc250IHRydWVcbiAgICAgICAgICAgIGluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpLmVhY2ggKHBhdHRlcm5TcXVhcmUsIGluZGV4KSA9PlxuICAgICAgICAgICAgICAgQHBsYXlQYXR0ZXJuU3F1YXJlQXVkaW8oIHBhdHRlcm5TcXVhcmUsIGluZGV4IClcblxuXG5cblxuICAgIyBQbGF5cyB0aGUgYXVkaW8gb24gYW4gaW5kaXZpZHVhbCBQYXR0ZXJTcXVhcmUgaWYgdGVtcG8gaW5kZXhcbiAgICMgaXMgdGhlIHNhbWUgYXMgdGhlIGluZGV4IHdpdGhpbiB0aGUgY29sbGVjdGlvblxuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmV9IHBhdHRlcm5TcXVhcmVcbiAgICMgQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG5cbiAgIHBsYXlQYXR0ZXJuU3F1YXJlQXVkaW86IChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgLT5cbiAgICAgIGlmIEBjdXJyQmVhdENlbGxJZCBpcyBpbmRleFxuICAgICAgICAgaWYgcGF0dGVyblNxdWFyZS5nZXQgJ2FjdGl2ZSdcbiAgICAgICAgICAgIHBhdHRlcm5TcXVhcmUuc2V0ICd0cmlnZ2VyJywgdHJ1ZVxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIEJQTSB0ZW1wbyBjaGFuZ2VzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uQlBNQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBjbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuICAgICAgQHVwZGF0ZUludGVydmFsVGltZSA9IG1vZGVsLmNoYW5nZWQuYnBtXG4gICAgICBAYnBtSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAdXBkYXRlVGltZSwgQHVwZGF0ZUludGVydmFsVGltZVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHBsYXliYWNrIGNoYW5nZXMuICBJZiBwYXVzZWQsIGl0IHN0b3BzIHBsYXliYWNrIGFuZFxuICAgIyBjbGVhcnMgdGhlIGludGVydmFsLiAgSWYgcGxheWluZywgaXQgcmVzZXRzIGl0XG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uUGxheWluZ0NoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgcGxheWluZyA9IG1vZGVsLmNoYW5nZWQucGxheWluZ1xuXG4gICAgICBpZiBwbGF5aW5nXG4gICAgICAgICBAYnBtSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAdXBkYXRlVGltZSwgQHVwZGF0ZUludGVydmFsVGltZVxuXG4gICAgICBlbHNlXG4gICAgICAgICBjbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuICAgICAgICAgQGJwbUludGVydmFsID0gbnVsbFxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgYW5kIHVubXV0ZSBjaGFuZ2VzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uTXV0ZUNoYW5nZTogKG1vZGVsKSA9PlxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2VzLCBhcyBzZXQgZnJvbSB0aGUgS2l0U2VsZWN0b3JcbiAgICMgQHBhcmFtIHtLaXRNb2RlbH0gbW9kZWxcblxuICAgb25LaXRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEBjb2xsZWN0aW9uID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJylcbiAgICAgIEByZW5kZXJUcmFja3MoKVxuXG4gICAgICAjIEV4cG9ydCBvbGQgcGF0dGVybiBzcXVhcmVzIHNvIHRoZSB1c2VycyBwYXR0ZXJuIGlzbid0IGJsb3duIGF3YXlcbiAgICAgICMgd2hlbiBraXQgY2hhbmdlcyBvY2N1clxuXG4gICAgICBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbiA9IG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMua2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpXG4gICAgICBvbGRQYXR0ZXJuU3F1YXJlcyA9IG9sZEluc3RydW1lbnRDb2xsZWN0aW9uLmV4cG9ydFBhdHRlcm5TcXVhcmVzKClcblxuXG4gICAgICAjIFVwZGF0ZSB0aGUgbmV3IGNvbGxlY3Rpb24gd2l0aCBvbGQgcGF0dGVybiBzcXVhcmUgZGF0YVxuICAgICAgIyBhbmQgdHJpZ2dlciBVSSB1cGRhdGVzIG9uIGVhY2ggc3F1YXJlXG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKGluc3RydW1lbnRNb2RlbCwgaW5kZXgpIC0+XG4gICAgICAgICBvbGRDb2xsZWN0aW9uID0gb2xkUGF0dGVyblNxdWFyZXNbaW5kZXhdXG4gICAgICAgICBuZXdDb2xsZWN0aW9uID0gaW5zdHJ1bWVudE1vZGVsLmdldCAncGF0dGVyblNxdWFyZXMnXG5cbiAgICAgICAgICMgVXBkYXRlIHRyYWNrIC8gaW5zdHJ1bWVudCBsZXZlbCBwcm9wZXJ0aWVzIGxpa2Ugdm9sdW1lIC8gbXV0ZSAvIGZvY3VzXG4gICAgICAgICBvbGRQcm9wcyA9IG9sZEluc3RydW1lbnRDb2xsZWN0aW9uLmF0KGluZGV4KVxuXG4gICAgICAgICB1bmxlc3Mgb2xkUHJvcHMgaXMgdW5kZWZpbmVkXG5cbiAgICAgICAgICAgIG9sZFByb3BzID0gb2xkUHJvcHMudG9KU09OKClcblxuICAgICAgICAgICAgaW5zdHJ1bWVudE1vZGVsLnNldFxuICAgICAgICAgICAgICAgdm9sdW1lOiBvbGRQcm9wcy52b2x1bWVcbiAgICAgICAgICAgICAgIGFjdGl2ZTogb2xkUHJvcHMuYWN0aXZlXG4gICAgICAgICAgICAgICBtdXRlOiAgIG9sZFByb3BzLm11dGVcbiAgICAgICAgICAgICAgIGZvY3VzOiAgb2xkUHJvcHMuZm9jdXNcblxuICAgICAgICAgIyBDaGVjayBmb3IgaW5jb25zaXN0YW5jaWVzIGJldHdlZW4gbnVtYmVyIG9mIGluc3RydW1lbnRzXG4gICAgICAgICB1bmxlc3Mgb2xkQ29sbGVjdGlvbiBpcyB1bmRlZmluZWRcblxuICAgICAgICAgICAgbmV3Q29sbGVjdGlvbi5lYWNoIChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgLT5cbiAgICAgICAgICAgICAgIG9sZFBhdHRlcm5TcXVhcmUgPSBvbGRDb2xsZWN0aW9uLmF0IGluZGV4XG4gICAgICAgICAgICAgICBwYXR0ZXJuU3F1YXJlLnNldCBvbGRQYXR0ZXJuU3F1YXJlLnRvSlNPTigpXG5cblxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGZvY3VzIGNoYW5nZSBldmVudHMuICBJdGVyYXRlcyBvdmVyIGFsbCBvZiB0aGUgbW9kZWxzIHdpdGhpblxuICAgIyB0aGUgSW5zdHJ1bWVudENvbGxlY3Rpb24gYW5kIHRvZ2dsZXMgdGhlaXIgZm9jdXMgdG8gb2ZmIGlmIHRoZSBjaGFuZ2VkXG4gICAjIG1vZGVsJ3MgZm9jdXMgaXMgc2V0IHRvIHRydWUuXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbkZvY3VzQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChpbnN0cnVtZW50TW9kZWwpID0+XG4gICAgICAgICBpZiBtb2RlbC5jaGFuZ2VkLmZvY3VzIGlzIHRydWVcbiAgICAgICAgICAgIGlmIG1vZGVsLmNpZCBpc250IGluc3RydW1lbnRNb2RlbC5jaWRcbiAgICAgICAgICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXQgJ2ZvY3VzJywgZmFsc2VcblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZXF1ZW5jZXIiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIjtcblxuXG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cblxuICBidWZmZXIgKz0gXCI8dGQgY2xhc3M9J2xhYmVsLWluc3RydW1lbnQnPlxcblx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXG48L3RkPlxcbjx0ZCBjbGFzcz0nYnRuLW11dGUnPlxcblx0bXV0ZVxcbjwvdGQ+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc3RhY2syLCBvcHRpb25zLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblx0XHRcdDx0aCBjbGFzcz0nc3RlcHBlcic+PC90aD5cXG5cdFx0XCI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8dGFibGUgY2xhc3M9J3NlcXVlbmNlcic+XFxuXHQ8dHI+XFxuXHRcdDx0aD48L3RoPlxcblx0XHQ8dGg+PC90aD5cXG5cXG5cdFx0XCI7XG4gIG9wdGlvbnMgPSB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX07XG4gIHN0YWNrMiA9ICgoc3RhY2sxID0gaGVscGVycy5yZXBlYXQgfHwgZGVwdGgwLnJlcGVhdCksc3RhY2sxID8gc3RhY2sxLmNhbGwoZGVwdGgwLCA4LCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwicmVwZWF0XCIsIDgsIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC90cj5cXG5cXG48L3RhYmxlPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWRlY3JlYXNlJz5ERUNSRUFTRTwvYnV0dG9uPlxcbjxzcGFuIGNsYXNzPSdsYWJlbC1icG0nPjA8L3NwYW4+XFxuPGJ1dHRvbiBjbGFzcz0nYnRuLWluY3JlYXNlJz5JTkNSRUFTRTwvYnV0dG9uPlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWxlZnQnPkxFRlQ8L2J1dHRvbj5cXG48c3BhbiBjbGFzcz0nbGFiZWwta2l0Jz5EUlVNIEtJVDwvc3Bhbj5cXG48YnV0dG9uIGNsYXNzPSdidG4tcmlnaHQnPlJJR0hUPC9idXR0b24+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdjb250YWluZXIta2l0LXNlbGVjdG9yJz5cXG5cdDxkaXYgY2xhc3M9J2tpdC1zZWxlY3Rvcic+PC9kaXY+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLXZpc3VhbGl6YXRpb24nPlZpc3VhbGl6YXRpb248L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPSdjb250YWluZXItc2VxdWVuY2VyJz5cXG5cXG5cdDxkaXYgY2xhc3M9J2luc3RydW1lbnQtc2VsZWN0b3InPkluc3RydW1lbnQgU2VsZWN0b3I8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J3NlcXVlbmNlcic+U2VxdWVuY2VyPC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPSdicG0nPkJQTTwvZGl2Plxcblx0PGRpdiBjbGFzcz0nYnRuLXNoYXJlJz5TSEFSRTwvZGl2PlxcblxcbjwvZGl2PlwiO1xuICB9KSIsIiMjIypcbiAqIExhbmRpbmcgdmlldyB3aXRoIHN0YXJ0IGJ1dHRvbiBhbmQgaW5pdGlhbCBhbmltYXRpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5QdWJTdWIgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL1B1YlN1YidcblB1YkV2ZW50ID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9sYW5kaW5nLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBMYW5kaW5nVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLnN0YXJ0LWJ0bic6ICdvblN0YXJ0QnRuQ2xpY2snXG5cblxuICAgb25TdGFydEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBQdWJTdWIudHJpZ2dlciBQdWJFdmVudC5ST1VURSxcbiAgICAgICAgIHJvdXRlOiAnY3JlYXRlJ1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYW5kaW5nVmlldyIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPHNwYW4gY2xhc3M9J3N0YXJ0LWJ0bic+Q1JFQVRFPC9zcGFuPlwiO1xuICB9KSIsIiMjIypcbiAqIFNoYXJlIHRoZSB1c2VyIGNyZWF0ZWQgYmVhdFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zaGFyZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgU2hhcmVWaWV3IGV4dGVuZHMgVmlld1xuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gU2hhcmVWaWV3IiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8YSBocmVmPScvIyc+TkVXPC9hPlwiO1xuICB9KSIsIiMjIypcbiAqIExhbmRpbmcgdmlldyB3aXRoIHN0YXJ0IGJ1dHRvbiBhbmQgaW5pdGlhbCBhbmltYXRpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZXN0cy10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgVGVzdHNWaWV3IGV4dGVuZHMgVmlld1xuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RzVmlldyIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGgxPkNvbXBvbmVudCBWaWV3ZXI8L2gxPlxcblxcbjxiciAvPlxcbjxwPlxcblx0TWFrZSBzdXJlIHRoYXQgPGI+aHR0cHN0ZXI8L2I+IGlzIHJ1bm5pbmcgaW4gdGhlIDxiPnNvdXJjZTwvYj4gcm91dGUgKG5wbSBpbnN0YWxsIC1nIGh0dHBzdGVyKSA8YnIvPlxcblx0PGEgaHJlZj1cXFwiaHR0cDovL2xvY2FsaG9zdDozMzMzL3Rlc3QvaHRtbC9cXFwiPk1vY2hhIFRlc3QgUnVubmVyPC9hPlxcbjwvcD5cXG5cXG48YnIgLz5cXG48dWw+XFxuXHQ8bGk+PGEgaHJlZj0nI2tpdC1zZWxlY3Rpb24nPktpdCBTZWxlY3Rpb248L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjYnBtLWluZGljYXRvclxcXCI+QlBNIEluZGljYXRvcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNpbnN0cnVtZW50LXNlbGVjdG9yXFxcIj5JbnN0cnVtZW50IFNlbGVjdG9yPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI3BhdHRlcm4tc3F1YXJlXFxcIj5QYXR0ZXJuIFNxdWFyZTwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNwYXR0ZXJuLXRyYWNrXFxcIj5QYXR0ZXJuIFRyYWNrPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI3NlcXVlbmNlclxcXCI+U2VxdWVuY2VyPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2Z1bGwtc2VxdWVuY2VyXFxcIj5GdWxsIFNlcXVlbmNlcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNwYWQtc3F1YXJlXFxcIj5QYWQgU3F1YXJlPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2xpdmUtcGFkXFxcIj5MaXZlUGFkPC9hPjwvbGk+XFxuPC91bD5cIjtcbiAgfSkiXX0=

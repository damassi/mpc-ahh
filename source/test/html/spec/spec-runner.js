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


},{"./models/AppModel.coffee":11,"./routers/AppRouter.coffee":21,"./supers/View.coffee":22,"./views/create/CreateView.coffee":24,"./views/landing/LandingView.coffee":46,"./views/share/ShareView.coffee":48}],7:[function(require,module,exports){

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


},{"../config/AppConfig.coffee":7}],12:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"./KitModel.coffee":13}],13:[function(require,module,exports){

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


},{"../sequencer/InstrumentCollection.coffee":17}],14:[function(require,module,exports){

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


},{}],15:[function(require,module,exports){

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


},{"../sequencer/InstrumentModel.coffee":18}],16:[function(require,module,exports){

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


},{}],17:[function(require,module,exports){

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


},{"./InstrumentModel.coffee":18}],18:[function(require,module,exports){

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
    'dropped': false,
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


},{"../../config/AppConfig.coffee":7}],19:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../sequencer/InstrumentModel.coffee":18,"./PatternSquareModel.coffee":20}],20:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../../events/AppEvent.coffee":8}],21:[function(require,module,exports){

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


},{"../config/AppConfig.coffee":7,"../events/PubEvent.coffee":9,"../models/kits/KitCollection.coffee":12,"../models/kits/KitModel.coffee":13,"../models/pad/LivePadModel.coffee":14,"../models/pad/PadSquareCollection.coffee":15,"../models/pad/PadSquareModel.coffee":16,"../models/sequencer/PatternSquareCollection.coffee":19,"../models/sequencer/PatternSquareModel.coffee":20,"../supers/View.coffee":22,"../utils/PubSub":23,"../views/create/components/BPMIndicator.coffee":25,"../views/create/components/KitSelector.coffee":26,"../views/create/components/instruments/InstrumentSelectorPanel.coffee":28,"../views/create/components/pad/LivePad.coffee":31,"../views/create/components/pad/PadSquare.coffee":32,"../views/create/components/sequencer/PatternSquare.coffee":37,"../views/create/components/sequencer/PatternTrack.coffee":38,"../views/create/components/sequencer/Sequencer.coffee":39,"../views/tests/TestsView.coffee":50}],22:[function(require,module,exports){

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


},{}],23:[function(require,module,exports){
/**
 * @module     PubSub
 * @desc       Global PubSub object for dispatch and delegation
 */

'use strict'

var PubSub = {}

_.extend( PubSub, Backbone.Events )

module.exports = PubSub
},{}],24:[function(require,module,exports){

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


},{"../../supers/View.coffee":22,"../../views/create/components/BPMIndicator.coffee":25,"../../views/create/components/KitSelector.coffee":26,"../../views/create/components/instruments/InstrumentSelectorPanel.coffee":28,"../../views/create/components/sequencer/Sequencer.coffee":39,"./templates/create-template.hbs":45}],25:[function(require,module,exports){

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


},{"../../../config/AppConfig.coffee":7,"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":22,"./templates/bpm-template.hbs":43}],26:[function(require,module,exports){

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


},{"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":22,"./templates/kit-selection-template.hbs":44}],27:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":22,"./templates/instrument-template.hbs":30}],28:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":22,"./Instrument.coffee":27,"./templates/instrument-panel-template.hbs":29}],29:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='container-instruments'>\n\n</div>";
  })
},{"handleify":5}],30:[function(require,module,exports){
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
},{"handleify":5}],31:[function(require,module,exports){

/**
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
 */
var AppEvent, LivePad, PadSquare, PadSquareCollection, PadSquareModel, View, instrumentsTemplate, padsTemplate, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppEvent = require('../../../../events/AppEvent.coffee');

PadSquareCollection = require('../../../../models/pad/PadSquareCollection.coffee');

PadSquareModel = require('../../../../models/pad/PadSquareModel.coffee');

View = require('../../../../supers/View.coffee');

PadSquare = require('./PadSquare.coffee');

padsTemplate = require('./templates/pads-template.hbs');

instrumentsTemplate = require('./templates/instruments-template.hbs');

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
    LivePad.__super__.render.call(this, options);
    this.$padsContainer = this.$el.find('.container-pads');
    this.$instrumentsContainer = this.$el.find('.container-instruments');
    this.renderPads();
    this.renderInstruments();
    _.each(this.padSquareViews, (function(_this) {
      return function(padSquare) {
        var id;
        id = padSquare.model.get('id');
        return _this.$el.find("#" + id).html(padSquare.render().el);
      };
    })(this));
    this.setDragAndDrop();
    return this;
  };

  LivePad.prototype.renderPads = function() {
    return this.$padsContainer.html(padsTemplate({
      padTable: this.returnPadTableData()
    }));
  };

  LivePad.prototype.renderInstruments = function() {
    return this.$instrumentsContainer.html(instrumentsTemplate({
      instrumentTable: this.returnInstrumentTableData()
    }));
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
    instrumentModel.set('dropped', true);
    return _.defer((function(_this) {
      return function() {
        _this.renderInstruments();
        return _this.setDragAndDrop();
      };
    })(this));
  };

  LivePad.prototype.setDragAndDrop = function() {
    var $droppables, self;
    self = this;
    this.$instrument = this.$el.find('.instrument');
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
        instruments = _.where(instruments, {
          dropped: false
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


},{"../../../../events/AppEvent.coffee":8,"../../../../models/pad/PadSquareCollection.coffee":15,"../../../../models/pad/PadSquareModel.coffee":16,"../../../../supers/View.coffee":22,"./PadSquare.coffee":32,"./templates/instruments-template.hbs":33,"./templates/live-pad-template.hbs":34,"./templates/pads-template.hbs":36}],32:[function(require,module,exports){

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
    'touchstart': 'onClick'
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
    return this.model.set('trigger', true);
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
    var trigger;
    trigger = model.changed.trigger;
    if (trigger) {
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


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":22,"./templates/pad-square-template.hbs":35}],33:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n	<div class='container-kit'>\n		<h3>\n			<b>";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</b>\n		</h3>\n\n		";
  stack1 = helpers.each.call(depth0, depth0.instruments, {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</div>\n";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n			<div class='instrument' id=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n				";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n			</div>\n		";
  return buffer;
  }

  stack1 = helpers.each.call(depth0, depth0.instrumentTable, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  })
},{"handleify":5}],34:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<table class='container-pads'>\n\n</table>\n\n<div class='container-instruments'>\n\n</div>";
  })
},{"handleify":5}],35:[function(require,module,exports){
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
},{"handleify":5}],36:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, functionType="function", self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n	<tr>\n		";
  stack1 = helpers.each.call(depth0, depth0.tds, {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</tr>\n";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n			<td class='container-pad' id=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n\n			</td>\n		";
  return buffer;
  }

  stack2 = helpers.each.call(depth0, ((stack1 = depth0.padTable),stack1 == null || stack1 === false ? stack1 : stack1.rows), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n";
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


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":22,"./templates/pattern-square-template.hbs":40}],38:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../models/sequencer/PatternSquareCollection.coffee":19,"../../../../models/sequencer/PatternSquareModel.coffee":20,"../../../../supers/View.coffee":22,"./PatternSquare.coffee":37,"./templates/pattern-track-template.hbs":41}],39:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../helpers/handlebars-helpers":10,"../../../../supers/View.coffee":22,"./PatternTrack.coffee":38,"./templates/sequencer-template.hbs":42}],40:[function(require,module,exports){
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


},{"../../events/PubEvent.coffee":9,"../../supers/View.coffee":22,"../../utils/PubSub":23,"./templates/landing-template.hbs":47}],47:[function(require,module,exports){
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


},{"../../supers/View.coffee":22,"./templates/share-template.hbs":49}],49:[function(require,module,exports){
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


},{"../../supers/View.coffee":22,"./tests-template.hbs":51}],51:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h1>Component Viewer</h1>\n\n<br />\n<p>\n	Make sure that <b>httpster</b> is running in the <b>source</b> route (npm install -g httpster) <br/>\n	<a href=\"http://localhost:3333/test/html/\">Mocha Test Runner</a>\n</p>\n\n<br />\n<ul>\n	<li><a href='#kit-selection'>Kit Selection</a></li>\n	<li><a href=\"#bpm-indicator\">BPM Indicator</a></li>\n	<li><a href=\"#instrument-selector\">Instrument Selector</a></li>\n	<li><a href=\"#pattern-square\">Pattern Square</a></li>\n	<li><a href=\"#pattern-track\">Pattern Track</a></li>\n	<li><a href=\"#sequencer\">Sequencer</a></li>\n	<li><a href=\"#full-sequencer\">Full Sequencer</a></li>\n	<li><a href=\"#pad-square\">Pad Square</a></li>\n	<li><a href=\"#live-pad\">LivePad</a></li>\n</ul>";
  })
},{"handleify":5}],52:[function(require,module,exports){
describe('Models', (function(_this) {
  return function() {
    require('./spec/models/KitCollection-spec.coffee');
    return require('./spec/models/KitModel-spec.coffee');
  };
})(this));

describe('Views', (function(_this) {
  return function() {
    require('./spec/views/landing/LandingView-spec.coffee');
    require('./spec/views/create/components/KitSelector-spec.coffee');
    require('./spec/views/create/components/BPMIndicator-spec.coffee');
    describe('Live Pad', function() {
      require('./spec/views/create/components/pad/PadSquare-spec.coffee');
      return require('./spec/views/create/components/pad/LivePad-spec.coffee');
    });
    describe('Instrument Selector', function() {
      require('./spec/views/create/components/instruments/InstrumentSelectorPanel-spec.coffee');
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


},{"./spec/AppController-spec.coffee":53,"./spec/models/KitCollection-spec.coffee":54,"./spec/models/KitModel-spec.coffee":55,"./spec/models/SoundCollection-spec.coffee":56,"./spec/models/SoundModel-spec.coffee":57,"./spec/views/create/CreateView-spec.coffee":58,"./spec/views/create/components/BPMIndicator-spec.coffee":59,"./spec/views/create/components/KitSelector-spec.coffee":60,"./spec/views/create/components/instruments/Instrument-spec.coffee":61,"./spec/views/create/components/instruments/InstrumentSelectorPanel-spec.coffee":62,"./spec/views/create/components/pad/LivePad-spec.coffee":63,"./spec/views/create/components/pad/PadSquare-spec.coffee":64,"./spec/views/create/components/sequencer/PatternSquare-spec.coffee":65,"./spec/views/create/components/sequencer/PatternTrack-spec.coffee":66,"./spec/views/create/components/sequencer/Sequencer-spec.coffee":67,"./spec/views/landing/LandingView-spec.coffee":68,"./spec/views/share/ShareView-spec.coffee":69}],53:[function(require,module,exports){
var AppController;

AppController = require('../../src/scripts/AppController.coffee');

describe('App Controller', function() {
  return it('Should initialize', (function(_this) {
    return function() {};
  })(this));
});


},{"../../src/scripts/AppController.coffee":6}],54:[function(require,module,exports){
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


},{"../../../src/scripts/config/AppConfig.coffee":7,"../../../src/scripts/models/kits/KitCollection.coffee":12}],55:[function(require,module,exports){
var AppConfig, InstrumentCollection, KitModel;

AppConfig = require('../../../src/scripts/config/AppConfig.coffee');

KitModel = require('../../../src/scripts/models/kits/KitModel.coffee');

InstrumentCollection = require('../../../src/scripts/models/sequencer/InstrumentCollection.coffee');

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


},{"../../../src/scripts/config/AppConfig.coffee":7,"../../../src/scripts/models/kits/KitModel.coffee":13,"../../../src/scripts/models/sequencer/InstrumentCollection.coffee":17}],56:[function(require,module,exports){
describe('Sound Collection', function() {
  return it('Should initialize with a sound set', (function(_this) {
    return function() {};
  })(this));
});


},{}],57:[function(require,module,exports){
describe('Sound Model', function() {
  return it('Should initialize with default config properties', (function(_this) {
    return function() {};
  })(this));
});


},{}],58:[function(require,module,exports){
var AppConfig, AppModel, CreateView, KitCollection;

AppConfig = require('../../../../src/scripts/config/AppConfig.coffee');

AppModel = require('../../../../src/scripts/models/AppModel.coffee');

KitCollection = require('../../../../src/scripts/models/kits/KitCollection.coffee');

CreateView = require('../../../../src/scripts/views/create/CreateView.coffee');

describe('Create View', function() {
  beforeEach((function(_this) {
    return function() {
      _this.kitCollection = new KitCollection({
        parse: true
      });
      _this.kitCollection.fetch({
        async: false,
        url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'
      });
      _this.appModel = new AppModel;
      _this.appModel.set('kitModel', _this.kitCollection.at(0));
      _this.view = new CreateView({
        appModel: _this.appModel,
        kitCollection: _this.kitCollection
      });
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


},{"../../../../src/scripts/config/AppConfig.coffee":7,"../../../../src/scripts/models/AppModel.coffee":11,"../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../src/scripts/views/create/CreateView.coffee":24}],59:[function(require,module,exports){
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
  return it('Should display the current BPM in the label', (function(_this) {
    return function() {
      var $label;
      $label = _this.view.$el.find('.label-bpm');
      return $label.text().should.equal(String(60000 / _this.view.appModel.get('bpm')));
    };
  })(this));
});


},{"../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../src/scripts/events/AppEvent.coffee":8,"../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../src/scripts/views/create/components/BPMIndicator.coffee":25}],60:[function(require,module,exports){
var AppConfig, AppModel, KitCollection, KitModel, KitSelector;

AppConfig = require('../../../../../src/scripts/config/AppConfig.coffee');

KitSelector = require('../../../../../src/scripts/views/create/components/KitSelector.coffee');

AppModel = require('../../../../../src/scripts/models/AppModel.coffee');

KitModel = require('../../../../../src/scripts/models/kits/KitModel.coffee');

KitCollection = require('../../../../../src/scripts/models/kits/KitCollection.coffee');

describe('Kit Selection', function() {
  before((function(_this) {
    return function() {
      _this.kitCollection = new KitCollection({
        parse: true
      });
      _this.kitCollection.fetch({
        async: false,
        url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'
      });
      _this.appModel = new AppModel;
      return _this.appModel.set('kitModel', _this.kitCollection.at(0));
    };
  })(this));
  beforeEach((function(_this) {
    return function() {
      _this.view = new KitSelector({
        appModel: _this.appModel,
        kitCollection: _this.kitCollection
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
      return $label.should.exist;
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


},{"../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../src/scripts/models/kits/KitModel.coffee":13,"../../../../../src/scripts/views/create/components/KitSelector.coffee":26}],61:[function(require,module,exports){
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


},{"../../../../../../src/scripts/models/kits/KitModel.coffee":13,"../../../../../../src/scripts/views/create/components/instruments/Instrument.coffee":27}],62:[function(require,module,exports){
var AppConfig, AppModel, InstrumentSelectorPanel, KitCollection;

InstrumentSelectorPanel = require('../../../../../../src/scripts/views/create/components/instruments/InstrumentSelectorPanel.coffee');

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
      _this.view = new InstrumentSelectorPanel({
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/views/create/components/instruments/InstrumentSelectorPanel.coffee":28}],63:[function(require,module,exports){
var AppConfig, AppModel, InstrumentModel, KitCollection, LivePad, PadSquare, PadSquareCollection;

AppConfig = require('../../../../../../src/scripts/config/AppConfig.coffee');

AppModel = require('../../../../../../src/scripts/models/AppModel.coffee');

KitCollection = require('../../../../../../src/scripts/models/kits/KitCollection.coffee');

InstrumentModel = require('../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee');

PadSquareCollection = require('../../../../../../src/scripts/models/pad/PadSquareCollection.coffee');

PadSquare = require('../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee');

LivePad = require('../../../../../../src/scripts/views/create/components/pad/LivePad.coffee');

describe('Live Pad', function() {
  beforeEach((function(_this) {
    return function() {
      _this.kitCollection = new KitCollection({
        parse: true
      });
      _this.kitCollection.fetch({
        async: false,
        url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'
      });
      _this.appModel = new AppModel;
      _this.appModel.set('kitModel', _this.kitCollection.at(0));
      _this.view = new LivePad({
        kitCollection: _this.kitCollection,
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
      return _this.view.$el.should.exist;
    };
  })(this));
  it('Should render out pad squares', (function(_this) {
    return function() {
      return _this.view.$el.find('.pad-square').length.should.equal(16);
    };
  })(this));
  it('Should render out the entire kit collection', (function(_this) {
    return function() {
      var len;
      len = 0;
      _this.view.kitCollection.each(function(kit, index) {
        index = index + 1;
        return len = kit.get('instruments').length * index;
      });
      return _this.view.$el.find('.instrument').length.should.equal(len + 1);
    };
  })(this));
  it('Should listen to drops from the kits to the pads', (function(_this) {
    return function() {
      return _this.view.padSquareCollection.should.trigger('change:dropped').when(function() {
        var id;
        id = _this.view.kitCollection.at(0).get('instruments').at(0).get('id');
        return _this.view.padSquareViews[0].onDrop(id);
      });
    };
  })(this));
  it('Should update the PadSquareCollection with the current kit when dropped', (function(_this) {
    return function() {
      return _this.view.padSquareCollection.should.trigger('change:currentInstrument').when(function() {
        var id;
        id = _this.view.kitCollection.at(0).get('instruments').at(0).get('id');
        return _this.view.padSquareViews[0].onDrop(id);
      });
    };
  })(this));
  return it('Should listen for changes to instrument dropped status', (function(_this) {
    return function() {
      return _this.view.kitCollection.at(0).get('instruments').at(0).should.trigger('change:dropped').when(function() {
        var id;
        id = _this.view.kitCollection.at(0).get('instruments').at(0).get('id');
        return _this.view.padSquareViews[0].onDrop(id);
      });
    };
  })(this));
});


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/pad/PadSquareCollection.coffee":15,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":18,"../../../../../../src/scripts/views/create/components/pad/LivePad.coffee":31,"../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee":32}],64:[function(require,module,exports){
var AppConfig, AppModel, KitCollection, PadSquare, PadSquareCollection, PadSquareModel;

AppConfig = require('../../../../../../src/scripts/config/AppConfig.coffee');

AppModel = require('../../../../../../src/scripts/models/AppModel.coffee');

KitCollection = require('../../../../../../src/scripts/models/kits/KitCollection.coffee');

PadSquareCollection = require('../../../../../../src/scripts/models/pad/PadSquareCollection.coffee');

PadSquareModel = require('../../../../../../src/scripts/models/pad/PadSquareModel.coffee');

PadSquare = require('../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee');

describe('Pad Square', function() {
  before((function(_this) {
    return function() {
      _this.kitCollection = new KitCollection({
        parse: true
      });
      _this.kitCollection.fetch({
        async: false,
        url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'
      });
      _this.appModel = new AppModel;
      return _this.appModel.set('kitModel', _this.kitCollection.at(0));
    };
  })(this));
  beforeEach((function(_this) {
    return function() {
      _this.view = new PadSquare({
        collection: _this.kitCollection,
        model: new PadSquareModel()
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
  it('Should render out the appropriate key-code trigger', (function(_this) {
    return function() {
      return _this.view.$el.find('.key-code').length.should.equal(1);
    };
  })(this));
  it('Should trigger a play action on tap', (function(_this) {
    return function() {
      return _this.view.model.should.trigger('change:trigger').when(function() {
        return _this.view.onClick();
      });
    };
  })(this));
  it('Should accept a droppable visual element', (function(_this) {
    return function() {
      return _this.view.model.should.trigger('change:dropped').when(function() {
        var id;
        id = _this.kitCollection.at(0).get('instruments').at(0).get('id');
        return _this.view.onDrop(id);
      });
    };
  })(this));
  it('Should trigger instrument change on drop', (function(_this) {
    return function() {
      return _this.view.model.should.trigger('change:currentInstrument').when(function() {
        var id;
        id = _this.kitCollection.at(0).get('instruments').at(0).get('id');
        return _this.view.onDrop(id);
      });
    };
  })(this));
  it('Should render out a sound icon when dropped', (function(_this) {
    return function() {
      var icon, id;
      id = _this.kitCollection.at(0).get('instruments').at(0).get('id');
      _this.view.onDrop(id);
      icon = _this.kitCollection.at(0).get('instruments').at(0).get('icon');
      return _this.view.$el.find('.' + icon).length.should.equal(1);
    };
  })(this));
  it('Should update the td with the corresponding instrument id when dropped', (function(_this) {
    return function() {
      var id;
      id = _this.kitCollection.at(0).get('instruments').at(0).get('id');
      _this.view.onDrop(id);
      return _this.view.$el.hasClass("" + id).should.be["true"];
    };
  })(this));
  it('Should release the droppable visual element on press-hold', (function(_this) {
    return function() {
      return _this.view.model.should.trigger('change:dragging').when(function() {
        return _this.view.onHold();
      });
    };
  })(this));
  it('Should set the sound based upon the dropped visual element', (function(_this) {
    return function() {
      var id;
      id = _this.kitCollection.at(0).get('instruments').at(0).get('id');
      _this.view.onDrop(id);
      return expect(_this.view.audioPlayback).to.not.equal(void 0);
    };
  })(this));
  it('Should clear the sound when the droppable element is disposed of', (function(_this) {
    return function(done) {
      var id;
      id = _this.kitCollection.at(0).get('instruments').at(0).get('id');
      _this.view.onDrop(id);
      _this.view.model.once('change:currentInstrument', function() {
        return done();
      });
      return _this.view.removeSound();
    };
  })(this));
  return it('Should clear the icon when the droppable element is disposed of', (function(_this) {
    return function() {
      var icon, id;
      id = _this.kitCollection.at(0).get('instruments').at(0).get('id');
      _this.view.onDrop(id);
      icon = _this.kitCollection.at(0).get('instruments').at(0).get('icon');
      _this.view.$el.find('.' + icon).length.should.equal(1);
      _this.view.removeSound();
      return _this.view.$el.find('.' + icon).length.should.equal(0);
    };
  })(this));
});


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/pad/PadSquareCollection.coffee":15,"../../../../../../src/scripts/models/pad/PadSquareModel.coffee":16,"../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee":32}],65:[function(require,module,exports){
var AppConfig, AppModel, KitCollection, PatternSquare, PatternSquareModel;

AppConfig = require('../../../../../../src/scripts/config/AppConfig.coffee');

AppModel = require('../../../../../../src/scripts/models/AppModel.coffee');

KitCollection = require('../../../../../../src/scripts/models/kits/KitCollection.coffee');

PatternSquareModel = require('../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee');

PatternSquare = require('../../../../../../src/scripts/views/create/components/sequencer/PatternSquare.coffee');

describe('Pattern Square', function() {
  before((function(_this) {
    return function() {
      _this.kitCollection = new KitCollection({
        parse: true
      });
      _this.kitCollection.fetch({
        async: false,
        url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'
      });
      _this.appModel = new AppModel;
      return _this.appModel.set('kitModel', _this.kitCollection.at(0));
    };
  })(this));
  beforeEach((function(_this) {
    return function() {
      var model;
      model = new PatternSquareModel({
        'instrument': _this.kitCollection.at(0).get('instruments').at(0)
      });
      _this.view = new PatternSquare({
        appModel: _this.appModel,
        patternSquareModel: model
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
      _this.view.patternSquareModel.get('velocity').should.equal(1);
      _this.view.$el.hasClass('velocity-low').should.be["true"];
      _this.view.onClick();
      _this.view.patternSquareModel.get('velocity').should.equal(2);
      _this.view.$el.hasClass('velocity-medium').should.be["true"];
      _this.view.onClick();
      _this.view.patternSquareModel.get('velocity').should.equal(3);
      _this.view.$el.hasClass('velocity-high').should.be["true"];
      _this.view.onClick();
      _this.view.patternSquareModel.get('velocity').should.equal(0);
      return _this.view.$el.hasClass('velocity-high').should.be["false"];
    };
  })(this));
  it('Should toggle off', (function(_this) {
    return function() {
      _this.view.disable();
      return _this.view.patternSquareModel.get('velocity').should.equal(0);
    };
  })(this));
  return it('Should toggle on', (function(_this) {
    return function() {
      _this.view.onClick();
      _this.view.onClick();
      _this.view.onClick();
      _this.view.disable();
      _this.view.enable();
      return _this.view.patternSquareModel.get('velocity').should.equal(1);
    };
  })(this));
});


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":20,"../../../../../../src/scripts/views/create/components/sequencer/PatternSquare.coffee":37}],66:[function(require,module,exports){
var AppConfig, AppModel, InstrumentModel, KitCollection, PatternSquareCollection, PatternSquareModel, PatternTrack;

AppConfig = require('../../../../../../src/scripts/config/AppConfig.coffee');

AppModel = require('../../../../../../src/scripts/models/AppModel.coffee');

KitCollection = require('../../../../../../src/scripts/models/kits/KitCollection.coffee');

PatternSquareModel = require('../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee');

PatternSquareCollection = require('../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee');

PatternTrack = require('../../../../../../src/scripts/views/create/components/sequencer/PatternTrack.coffee');

InstrumentModel = require('../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee');

describe('Pattern Track', function() {
  beforeEach((function(_this) {
    return function() {
      _this.kitCollection = new KitCollection({
        parse: true
      });
      _this.kitCollection.fetch({
        async: false,
        url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'
      });
      _this.appModel = new AppModel;
      _this.appModel.set('kitModel', _this.kitCollection.at(0));
      _this.view = new PatternTrack({
        appModel: _this.appModel,
        model: _this.kitCollection.at(0).get('instruments').at(0)
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
  it('Should be mutable', (function(_this) {
    return function() {
      _this.view.model.should.trigger('change:mute').when(function() {
        return _this.view.mute();
      });
      return _this.view.model.should.trigger('change:mute').when(function() {
        return _this.view.unmute();
      });
    };
  })(this));
  it('Should add visual notification that track is muted', (function(_this) {
    return function(done) {
      _this.view.model.once('change:mute', function(model) {
        return _this.view.$el.hasClass('mute').should.be["true"];
      });
      _this.view.mute();
      _this.view.model.once('change:mute', function() {
        _this.view.$el.hasClass('mute').should.be["false"];
        return done();
      });
      return _this.view.unmute();
    };
  })(this));
  it('Should be able to focus and unfocus', (function(_this) {
    return function() {
      return _this.view.model.should.trigger('change:focus').when(function() {
        return _this.view.onLabelClick();
      });
    };
  })(this));
  return it('Should update each PatternSquare model when the kit changes', (function(_this) {
    return function() {};
  })(this));
});


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":18,"../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee":19,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":20,"../../../../../../src/scripts/views/create/components/sequencer/PatternTrack.coffee":38}],67:[function(require,module,exports){
var AppConfig, AppModel, InstrumentCollection, InstrumentModel, KitCollection, PatternSquareCollection, PatternSquareModel, Sequencer, helpers;

AppConfig = require('../../../../../../src/scripts/config/AppConfig.coffee');

AppModel = require('../../../../../../src/scripts/models/AppModel.coffee');

Sequencer = require('../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee');

KitCollection = require('../../../../../../src/scripts/models/kits/KitCollection.coffee');

InstrumentModel = require('../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee');

InstrumentCollection = require('../../../../../../src/scripts/models/sequencer/InstrumentCollection.coffee');

PatternSquareModel = require('../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee');

PatternSquareCollection = require('../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee');

helpers = require('../../../../../../src/scripts/helpers/handlebars-helpers');

describe('Sequencer', function() {
  beforeEach((function(_this) {
    return function() {
      _this.kitCollection = new KitCollection({
        parse: true
      });
      _this.kitCollection.fetch({
        async: false,
        url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'
      });
      _this.appModel = new AppModel;
      _this.appModel.set('kitModel', _this.kitCollection.at(0));
      _this.view = new Sequencer({
        appModel: _this.appModel,
        collection: _this.kitCollection.at(0).get('instruments')
      });
      return _this.view.render();
    };
  })(this));
  afterEach((function(_this) {
    return function() {
      _this.view.pause();
      return _this.view.remove();
    };
  })(this));
  it('Should render', (function(_this) {
    return function() {
      return _this.view.$el.should.exist;
    };
  })(this));
  it('Should render out each pattern track', (function(_this) {
    return function() {
      return _this.view.$el.find('.pattern-track').length.should.equal(_this.kitCollection.at(0).get('instruments').length);
    };
  })(this));
  it('Should create a bpm interval', (function(_this) {
    return function() {
      return expect(_this.view.bpmInterval).to.not.be(null);
    };
  })(this));
  it('Should listen for play / pause changes on the AppModel', (function(_this) {
    return function() {
      _this.view.appModel.should.trigger('change:playing').when(function() {
        return _this.view.pause();
      });
      return _this.view.appModel.should.trigger('change:playing').when(function() {
        return _this.view.play();
      });
    };
  })(this));
  it('Should listen for bpm changes', (function(_this) {
    return function() {
      _this.view.appModel.set('bpm', 200);
      return expect(_this.view.updateIntervalTime).to.equal(200);
    };
  })(this));
  it('Should be mutable', (function(_this) {
    return function() {
      _this.view.appModel.should.trigger('change:mute').when(function() {
        return _this.view.mute();
      });
      return _this.view.appModel.should.trigger('change:mute').when(function() {
        return _this.view.unmute();
      });
    };
  })(this));
  it('Should listen for InstrumentTrackModel focus events', (function(_this) {
    return function() {
      return _this.view.collection.should.trigger('change:focus').when(function() {
        return _this.view.patternTrackViews[0].onLabelClick();
      });
    };
  })(this));
  return it('Should update each pattern track when the kit changes', (function(_this) {
    return function() {};
  })(this));
});


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/helpers/handlebars-helpers":10,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/InstrumentCollection.coffee":17,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":18,"../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee":19,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":20,"../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee":39}],68:[function(require,module,exports){
var AppConfig, AppController, KitCollection, LandingView;

AppConfig = require('../../../../src/scripts/config/AppConfig.coffee');

KitCollection = require('../../../../src/scripts/models/kits/KitCollection.coffee');

AppController = require('../../../../src/scripts/AppController.coffee');

LandingView = require('../../../../src/scripts/views/landing/LandingView.coffee');

describe('Landing View', function() {
  beforeEach((function(_this) {
    return function() {
      _this.kitCollection = new KitCollection({
        parse: true
      });
      _this.kitCollection.fetch({
        async: false,
        url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'
      });
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
      _this.appController = new AppController({
        kitCollection: _this.kitCollection
      });
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


},{"../../../../src/scripts/AppController.coffee":6,"../../../../src/scripts/config/AppConfig.coffee":7,"../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../src/scripts/views/landing/LandingView.coffee":46}],69:[function(require,module,exports){
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


},{"../../../../src/scripts/views/share/ShareView.coffee":48}]},{},[52])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2RpZ2l0cy9pbmRleC5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L3J1bnRpbWUuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycy5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvTGl2ZVBhZE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvcGFkL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy91dGlscy9QdWJTdWIuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3IuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy90ZW1wbGF0ZXMvaW5zdHJ1bWVudC1wYW5lbC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy90ZW1wbGF0ZXMvaW5zdHJ1bWVudC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvTGl2ZVBhZC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvUGFkU3F1YXJlLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC90ZW1wbGF0ZXMvaW5zdHJ1bWVudHMtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL3RlbXBsYXRlcy9saXZlLXBhZC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvdGVtcGxhdGVzL3BhZC1zcXVhcmUtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL3RlbXBsYXRlcy9wYWRzLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2suY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3BhdHRlcm4tc3F1YXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci90ZW1wbGF0ZXMvcGF0dGVybi10cmFjay10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3NlcXVlbmNlci10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy90ZW1wbGF0ZXMvYnBtLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3RlbXBsYXRlcy9raXQtc2VsZWN0aW9uLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS90ZW1wbGF0ZXMvY3JlYXRlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXcuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy90ZW1wbGF0ZXMvbGFuZGluZy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9zaGFyZS9TaGFyZVZpZXcuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvdGVtcGxhdGVzL3NoYXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3Rlc3RzL1Rlc3RzVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy90ZXN0cy90ZXN0cy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMtcnVubmVyLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9BcHBDb250cm9sbGVyLXNwZWMuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9LaXRDb2xsZWN0aW9uLXNwZWMuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9LaXRNb2RlbC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9tb2RlbHMvU291bmRDb2xsZWN0aW9uLXNwZWMuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9Tb3VuZE1vZGVsLXNwZWMuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LXNwZWMuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50LXNwZWMuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLXNwZWMuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9MaXZlUGFkLXNwZWMuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLXNwZWMuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QSxDQUF2RCxDQW5CQSxDQUFBO0FBQUEsRUFzQkEsRUFBQSxDQUFHLHVDQUFILEVBQTRDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUMsQ0F0QkEsQ0FBQTtTQXlCQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2RCxFQTNCb0I7QUFBQSxDQUF2QixDQUhBLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogZGlnaXRzXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMgSm9uIFNjaGxpbmtlcnRcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQYWQgbnVtYmVycyB3aXRoIHplcm9zLlxuICogQXV0b21hdGljYWxseSBwYWQgdGhlIG51bWJlciBvZiBkaWdpdHMgYmFzZWQgb24gdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXksXG4gKiBvciBleHBsaWNpdGx5IHBhc3MgaW4gdGhlIG51bWJlciBvZiBkaWdpdHMgdG8gdXNlLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gbnVtICBUaGUgbnVtYmVyIHRvIHBhZC5cbiAqIEBwYXJhbSAge09iamVjdH0gb3B0cyBPcHRpb25zIG9iamVjdCB3aXRoIGBkaWdpdHNgIGFuZCBgYXV0b2AgcHJvcGVydGllcy5cbiAqICAgIHtcbiAqICAgICAgYXV0bzogYXJyYXkubGVuZ3RoIC8vIHBhc3MgaW4gdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXlcbiAqICAgICAgZGlnaXRzOiA0ICAgICAgICAgIC8vIG9yIHBhc3MgaW4gdGhlIG51bWJlciBvZiBkaWdpdHMgdG8gdXNlXG4gKiAgICB9XG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgVGhlIHBhZGRlZCBudW1iZXIgd2l0aCB6ZXJvcyBwcmVwZW5kZWRcbiAqXG4gKiBAZXhhbXBsZXM6XG4gKiAgMSAgICAgID0+IDAwMDAwMVxuICogIDEwICAgICA9PiAwMDAwMTBcbiAqICAxMDAgICAgPT4gMDAwMTAwXG4gKiAgMTAwMCAgID0+IDAwMTAwMFxuICogIDEwMDAwICA9PiAwMTAwMDBcbiAqICAxMDAwMDAgPT4gMTAwMDAwXG4gKi9cblxuZXhwb3J0cy5wYWQgPSBmdW5jdGlvbiAobnVtLCBvcHRzKSB7XG4gIHZhciBkaWdpdHMgPSBvcHRzLmRpZ2l0cyB8fCAzO1xuICBpZihvcHRzLmF1dG8gJiYgdHlwZW9mIG9wdHMuYXV0byA9PT0gJ251bWJlcicpIHtcbiAgICBkaWdpdHMgPSBTdHJpbmcob3B0cy5hdXRvKS5sZW5ndGg7XG4gIH1cbiAgdmFyIGxlbkRpZmYgPSBkaWdpdHMgLSBTdHJpbmcobnVtKS5sZW5ndGg7XG4gIHZhciBwYWRkaW5nID0gJyc7XG4gIGlmIChsZW5EaWZmID4gMCkge1xuICAgIHdoaWxlIChsZW5EaWZmLS0pIHtcbiAgICAgIHBhZGRpbmcgKz0gJzAnO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFkZGluZyArIG51bTtcbn07XG5cbi8qKlxuICogU3RyaXAgbGVhZGluZyBkaWdpdHMgZnJvbSBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyBmcm9tIHdoaWNoIHRvIHN0cmlwIGRpZ2l0c1xuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICovXG5cbmV4cG9ydHMuc3RyaXBsZWZ0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxcZCtcXC0/L2csICcnKTtcbn07XG5cbi8qKlxuICogU3RyaXAgdHJhaWxpbmcgZGlnaXRzIGZyb20gYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgZnJvbSB3aGljaCB0byBzdHJpcCBkaWdpdHNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqL1xuXG5leHBvcnRzLnN0cmlwcmlnaHQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXC0/XFxkKyQvZywgJycpO1xufTtcblxuLyoqXG4gKiBDb3VudCBkaWdpdHMgb24gdGhlIGxlZnQgc2lkZSBvZiBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB3aXRoIGRpZ2l0cyB0byBjb3VudFxuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICogQGV4YW1wbGVcbiAqICBcIjAwMS1mb28ubWRcIiA9PiAzXG4gKi9cblxuZXhwb3J0cy5jb3VudGxlZnQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIFN0cmluZyhzdHIubWF0Y2goL15cXGQrL2cpKS5sZW5ndGg7XG59O1xuXG4vKipcbiAqIENvdW50IGRpZ2l0cyBvbiB0aGUgcmlnaHQgc2lkZSBvZiBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB3aXRoIGRpZ2l0cyB0byBjb3VudFxuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICogQGV4YW1wbGVcbiAqICBcIjAwMS1mb28ubWRcIiA9PiAzXG4gKi9cblxuZXhwb3J0cy5jb3VudHJpZ2h0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyLm1hdGNoKC9cXGQrJC9nKSkubGVuZ3RoO1xufTsiLCIvKmpzaGludCBlcW51bGw6IHRydWUgKi9cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG5cbnZhciBIYW5kbGViYXJzID0ge307XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbkhhbmRsZWJhcnMuVkVSU0lPTiA9IFwiMS4wLjBcIjtcbkhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT04gPSA0O1xuXG5IYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPj0gMS4wLjAnXG59O1xuXG5IYW5kbGViYXJzLmhlbHBlcnMgID0ge307XG5IYW5kbGViYXJzLnBhcnRpYWxzID0ge307XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgZnVuY3Rpb25UeXBlID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgPSBmdW5jdGlvbihuYW1lLCBmbiwgaW52ZXJzZSkge1xuICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgIGlmIChpbnZlcnNlIHx8IGZuKSB7IHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbnZlcnNlKSB7IGZuLm5vdCA9IGludmVyc2U7IH1cbiAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgPSBmdW5jdGlvbihuYW1lLCBzdHIpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLnBhcnRpYWxzLCAgbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHN0cjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGFyZykge1xuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGhlbHBlcjogJ1wiICsgYXJnICsgXCInXCIpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYmxvY2tIZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSB8fCBmdW5jdGlvbigpIHt9LCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuXG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbih0aGlzKTtcbiAgfSBlbHNlIGlmKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgaWYoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZm4oY29udGV4dCk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLksgPSBmdW5jdGlvbigpIHt9O1xuXG5IYW5kbGViYXJzLmNyZWF0ZUZyYW1lID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbihvYmplY3QpIHtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG9iamVjdDtcbiAgdmFyIG9iaiA9IG5ldyBIYW5kbGViYXJzLksoKTtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG51bGw7XG4gIHJldHVybiBvYmo7XG59O1xuXG5IYW5kbGViYXJzLmxvZ2dlciA9IHtcbiAgREVCVUc6IDAsIElORk86IDEsIFdBUk46IDIsIEVSUk9SOiAzLCBsZXZlbDogMyxcblxuICBtZXRob2RNYXA6IHswOiAnZGVidWcnLCAxOiAnaW5mbycsIDI6ICd3YXJuJywgMzogJ2Vycm9yJ30sXG5cbiAgLy8gY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgb2JqKSB7XG4gICAgaWYgKEhhbmRsZWJhcnMubG9nZ2VyLmxldmVsIDw9IGxldmVsKSB7XG4gICAgICB2YXIgbWV0aG9kID0gSGFuZGxlYmFycy5sb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5IYW5kbGViYXJzLmxvZyA9IGZ1bmN0aW9uKGxldmVsLCBvYmopIHsgSGFuZGxlYmFycy5sb2dnZXIubG9nKGxldmVsLCBvYmopOyB9O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdlYWNoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgZm4gPSBvcHRpb25zLmZuLCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlO1xuICB2YXIgaSA9IDAsIHJldCA9IFwiXCIsIGRhdGE7XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICBkYXRhID0gSGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICB9XG5cbiAgaWYoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICBpZihjb250ZXh0IGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgZm9yKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGk8ajsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhKSB7IGRhdGEuaW5kZXggPSBpOyB9XG4gICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbaV0sIHsgZGF0YTogZGF0YSB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICBpZihjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBpZihkYXRhKSB7IGRhdGEua2V5ID0ga2V5OyB9XG4gICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtrZXldLCB7ZGF0YTogZGF0YX0pO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmKGkgPT09IDApe1xuICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbmRpdGlvbmFsKTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKCFjb25kaXRpb25hbCB8fCBIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29uZGl0aW9uYWwpKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHJldHVybiBIYW5kbGViYXJzLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm59KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYgKCFIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICBIYW5kbGViYXJzLmxvZyhsZXZlbCwgY29udGV4dCk7XG59KTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZNID0ge1xuICB0ZW1wbGF0ZTogZnVuY3Rpb24odGVtcGxhdGVTcGVjKSB7XG4gICAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgICB2YXIgY29udGFpbmVyID0ge1xuICAgICAgZXNjYXBlRXhwcmVzc2lvbjogSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgICAgaW52b2tlUGFydGlhbDogSGFuZGxlYmFycy5WTS5pbnZva2VQYXJ0aWFsLFxuICAgICAgcHJvZ3JhbXM6IFtdLFxuICAgICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXTtcbiAgICAgICAgaWYoZGF0YSkge1xuICAgICAgICAgIHByb2dyYW1XcmFwcGVyID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuLCBkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSBIYW5kbGViYXJzLlZNLnByb2dyYW0oaSwgZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICAgIH0sXG4gICAgICBtZXJnZTogZnVuY3Rpb24ocGFyYW0sIGNvbW1vbikge1xuICAgICAgICB2YXIgcmV0ID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICAgIGlmIChwYXJhbSAmJiBjb21tb24pIHtcbiAgICAgICAgICByZXQgPSB7fTtcbiAgICAgICAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZChyZXQsIGNvbW1vbik7XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBwYXJhbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0sXG4gICAgICBwcm9ncmFtV2l0aERlcHRoOiBIYW5kbGViYXJzLlZNLnByb2dyYW1XaXRoRGVwdGgsXG4gICAgICBub29wOiBIYW5kbGViYXJzLlZNLm5vb3AsXG4gICAgICBjb21waWxlckluZm86IG51bGxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlU3BlYy5jYWxsKGNvbnRhaW5lciwgSGFuZGxlYmFycywgY29udGV4dCwgb3B0aW9ucy5oZWxwZXJzLCBvcHRpb25zLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEpO1xuXG4gICAgICB2YXIgY29tcGlsZXJJbmZvID0gY29udGFpbmVyLmNvbXBpbGVySW5mbyB8fCBbXSxcbiAgICAgICAgICBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICAgICAgY3VycmVudFJldmlzaW9uID0gSGFuZGxlYmFycy5DT01QSUxFUl9SRVZJU0lPTjtcblxuICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IEhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrcnVudGltZVZlcnNpb25zK1wiKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKFwiK2NvbXBpbGVyVmVyc2lvbnMrXCIpLlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgICAgIHRocm93IFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJJbmZvWzFdK1wiKS5cIjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH0sXG5cbiAgcHJvZ3JhbVdpdGhEZXB0aDogZnVuY3Rpb24oaSwgZm4sIGRhdGEgLyosICRkZXB0aCAqLykge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcblxuICAgIHZhciBwcm9ncmFtID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBbY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGFdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgICBwcm9ncmFtLnByb2dyYW0gPSBpO1xuICAgIHByb2dyYW0uZGVwdGggPSBhcmdzLmxlbmd0aDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGEpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gMDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgbm9vcDogZnVuY3Rpb24oKSB7IHJldHVybiBcIlwiOyB9LFxuICBpbnZva2VQYXJ0aWFsOiBmdW5jdGlvbihwYXJ0aWFsLCBuYW1lLCBjb250ZXh0LCBoZWxwZXJzLCBwYXJ0aWFscywgZGF0YSkge1xuICAgIHZhciBvcHRpb25zID0geyBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcblxuICAgIGlmKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuICAgIH0gZWxzZSBpZihwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAoIUhhbmRsZWJhcnMuY29tcGlsZSkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydGlhbHNbbmFtZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUocGFydGlhbCwge2RhdGE6IGRhdGEgIT09IHVuZGVmaW5lZH0pO1xuICAgICAgcmV0dXJuIHBhcnRpYWxzW25hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy50ZW1wbGF0ZSA9IEhhbmRsZWJhcnMuVk0udGVtcGxhdGU7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcblxufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbkhhbmRsZWJhcnMuRXhjZXB0aW9uID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG59O1xuSGFuZGxlYmFycy5FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbi8vIEJ1aWxkIG91dCBvdXIgYmFzaWMgU2FmZVN0cmluZyB0eXBlXG5IYW5kbGViYXJzLlNhZmVTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59O1xuSGFuZGxlYmFycy5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJpbmcudG9TdHJpbmcoKTtcbn07XG5cbnZhciBlc2NhcGUgPSB7XG4gIFwiJlwiOiBcIiZhbXA7XCIsXG4gIFwiPFwiOiBcIiZsdDtcIixcbiAgXCI+XCI6IFwiJmd0O1wiLFxuICAnXCInOiBcIiZxdW90O1wiLFxuICBcIidcIjogXCImI3gyNztcIixcbiAgXCJgXCI6IFwiJiN4NjA7XCJcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZztcbnZhciBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG52YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl0gfHwgXCImYW1wO1wiO1xufTtcblxuSGFuZGxlYmFycy5VdGlscyA9IHtcbiAgZXh0ZW5kOiBmdW5jdGlvbihvYmosIHZhbHVlKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICAgIGlmKHZhbHVlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWx1ZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBlc2NhcGVFeHByZXNzaW9uOiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyBpbnN0YW5jZW9mIEhhbmRsZWJhcnMuU2FmZVN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZy50b1N0cmluZygpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwgfHwgc3RyaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gc3RyaW5nLnRvU3RyaW5nKCk7XG5cbiAgICBpZighcG9zc2libGUudGVzdChzdHJpbmcpKSB7IHJldHVybiBzdHJpbmc7IH1cbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xuICB9LFxuXG4gIGlzRW1wdHk6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmKHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgQXJyYXldXCIgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcycpLmNyZWF0ZSgpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzJykuYXR0YWNoKGV4cG9ydHMpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMnKS5hdHRhY2goZXhwb3J0cykiLCIjIyMqXG4gKiBQcmltYXJ5IGFwcGxpY2F0aW9uIGNvbnRyb2xsZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cbkFwcE1vZGVsICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuQXBwUm91dGVyICAgPSByZXF1aXJlICcuL3JvdXRlcnMvQXBwUm91dGVyLmNvZmZlZSdcbkxhbmRpbmdWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSdcbkNyZWF0ZVZpZXcgID0gcmVxdWlyZSAnLi92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUnXG5TaGFyZVZpZXcgICA9IHJlcXVpcmUgJy4vdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwQ29udHJvbGxlciBleHRlbmRzIFZpZXdcblxuXG4gICBjbGFzc05hbWU6ICd3cmFwcGVyJ1xuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQGxhbmRpbmdWaWV3ID0gbmV3IExhbmRpbmdWaWV3XG4gICAgICBAc2hhcmVWaWV3ICAgPSBuZXcgU2hhcmVWaWV3XG5cbiAgICAgIEBjcmVhdGVWaWV3ICA9IG5ldyBDcmVhdGVWaWV3XG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAYXBwUm91dGVyID0gbmV3IEFwcFJvdXRlclxuICAgICAgICAgYXBwQ29udHJvbGxlcjogQFxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIEFwcENvbnRyb2xsZXIgdG8gdGhlIERPTSBhbmQga2lja3NcbiAgICMgb2ZmIGJhY2tib25lcyBoaXN0b3J5XG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIEAkYm9keSA9ICQgJ2JvZHknXG4gICAgICBAJGJvZHkuYXBwZW5kIEBlbFxuXG4gICAgICBCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0XG4gICAgICAgICBwdXNoU3RhdGU6IGZhbHNlXG5cblxuXG4gICAjIERlc3Ryb3lzIGFsbCBjdXJyZW50IGFuZCBwcmUtcmVuZGVyZWQgdmlld3MgYW5kXG4gICAjIHVuZGVsZWdhdGVzIGV2ZW50IGxpc3RlbmVyc1xuXG4gICByZW1vdmU6IC0+XG4gICAgICBAbGFuZGluZ1ZpZXcucmVtb3ZlKClcbiAgICAgIEBzaGFyZVZpZXcucmVtb3ZlKClcbiAgICAgIEBjcmVhdGVWaWV3LnJlbW92ZSgpXG5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG5cblxuXG5cbiAgICMgQWRkcyBBcHBDb250cm9sbGVyLXJlbGF0ZWQgZXZlbnQgbGlzdGVuZXJzIGFuZCBiZWdpbnNcbiAgICMgbGlzdGVuaW5nIHRvIHZpZXcgY2hhbmdlc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsICdjaGFuZ2U6dmlldycsIEBvblZpZXdDaGFuZ2VcblxuXG5cblxuICAgIyBSZW1vdmVzIEFwcENvbnRyb2xsZXItcmVsYXRlZCBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAc3RvcExpc3RlbmluZygpXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3Igc2hvd2luZyAvIGhpZGluZyAvIGRpc3Bvc2luZyBvZiBwcmltYXJ5IHZpZXdzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uVmlld0NoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgcHJldmlvdXNWaWV3ID0gbW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy52aWV3XG4gICAgICBjdXJyZW50VmlldyAgPSBtb2RlbC5jaGFuZ2VkLnZpZXdcblxuICAgICAgcHJldmlvdXNWaWV3Py5oaWRlXG4gICAgICAgICByZW1vdmU6IHRydWVcblxuXG4gICAgICBAJGVsLmFwcGVuZCBjdXJyZW50Vmlldy5yZW5kZXIoKS5lbFxuXG4gICAgICBjdXJyZW50Vmlldy5zaG93KClcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb250cm9sbGVyIiwiIyMjKlxuICBBcHBsaWNhdGlvbi13aWRlIGdlbmVyYWwgY29uZmlndXJhdGlvbnNcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xOS4xNFxuIyMjXG5cblxuQXBwQ29uZmlnID1cblxuXG4gICAjIFRoZSBwYXRoIHRvIGFwcGxpY2F0aW9uIGFzc2V0c1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBBU1NFVFM6XG4gICAgICBwYXRoOiAgICcvYXNzZXRzJ1xuICAgICAgYXVkaW86ICAnYXVkaW8nXG4gICAgICBkYXRhOiAgICdkYXRhJ1xuICAgICAgaW1hZ2VzOiAnaW1hZ2VzJ1xuXG5cbiAgICMgVGhlIEJQTSB0ZW1wb1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBCUE06IDMyMFxuXG5cbiAgICMgVGhlIG1heCBCUE1cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQlBNX01BWDogMTAwMFxuXG5cbiAgICMgVGhlIG1heCB2YXJpZW50IG9uIGVhY2ggcGF0dGVybiBzcXVhcmUgKG9mZiwgbG93LCBtZWRpdW0sIGhpZ2gpXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIFZFTE9DSVRZX01BWDogM1xuXG5cbiAgICMgVm9sdW1lIGxldmVscyBmb3IgcGF0dGVybiBwbGF5YmFjayBhcyB3ZWxsIGFzIGZvciBvdmVyYWxsIHRyYWNrc1xuICAgIyBAdHlwZSB7T2JqZWN0fVxuXG4gICBWT0xVTUVfTEVWRUxTOlxuICAgICAgbG93OiAgICAuMlxuICAgICAgbWVkaXVtOiAuNVxuICAgICAgaGlnaDogICAgMVxuXG5cbiAgICMgUmV0dXJucyBhIG5vcm1hbGl6ZWQgYXNzZXQgcGF0aCBmb3IgYXBwbGljYXRpb24gYXNzZXRzXG4gICAjIEBwYXJhbSB7U3RyaW5nfSBhc3NldFR5cGVcblxuICAgcmV0dXJuQXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgICAgQEFTU0VUUy5wYXRoICsgJy8nICsgQEFTU0VUU1thc3NldFR5cGVdXG5cblxuICAgIyBSZXR1cm5zIGEgbm9ybWFsaXplZCBhc3NldCBwYXRoIGZvciB0aGUgVEVTVCBlbnZpcm9ubWVudFxuICAgIyBAcGFyYW0ge1N0cmluZ30gYXNzZXRUeXBlXG5cbiAgIHJldHVyblRlc3RBc3NldFBhdGg6IChhc3NldFR5cGUpIC0+XG4gICAgICAnL3Rlc3QvaHRtbC8nICsgQEFTU0VUUy5wYXRoICsgJy8nICsgQEFTU0VUU1thc3NldFR5cGVdXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcENvbmZpZ1xuXG4iLCIjIyMqXG4gKiBBcHBsaWNhdGlvbiByZWxhdGVkIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblxuQXBwRXZlbnQgPVxuXG4gICBDSEFOR0VfQUNUSVZFOiAgICAgJ2NoYW5nZTphY3RpdmUnXG4gICBDSEFOR0VfQlBNOiAgICAgICAgJ2NoYW5nZTpicG0nXG4gICBDSEFOR0VfRFJBR0dJTkc6ICAgJ2NoYW5nZTpkcmFnZ2luZydcbiAgIENIQU5HRV9EUk9QUEVEOiAgICAnY2hhbmdlOmRyb3BwZWQnXG4gICBDSEFOR0VfRk9DVVM6ICAgICAgJ2NoYW5nZTpmb2N1cydcbiAgIENIQU5HRV9JTlNUUlVNRU5UOiAnY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50J1xuICAgQ0hBTkdFX0tJVDogICAgICAgICdjaGFuZ2U6a2l0TW9kZWwnXG4gICBDSEFOR0VfTVVURTogICAgICAgJ2NoYW5nZTptdXRlJ1xuICAgQ0hBTkdFX1BMQVlJTkc6ICAgICdjaGFuZ2U6cGxheWluZydcbiAgIENIQU5HRV9UUklHR0VSOiAgICAnY2hhbmdlOnRyaWdnZXInXG4gICBDSEFOR0VfVkVMT0NJVFk6ICAgJ2NoYW5nZTp2ZWxvY2l0eSdcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBFdmVudCIsIiMjIypcbiAqIEdsb2JhbCBQdWJTdWIgZXZlbnRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuXG5QdWJTdWIgPVxuXG4gICBST1VURTogJ29uUm91dGVDaGFuZ2UnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQdWJTdWIiLCJcbnZhciBkaWdpdHMgPSByZXF1aXJlKCdkaWdpdHMnKTtcbnZhciBoYW5kbGViYXJzID0gcmVxdWlyZSgnaGFuZGxlaWZ5JylcblxuaGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcigncmVwZWF0JywgZnVuY3Rpb24obiwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBfZGF0YSA9IHt9O1xuICAgIGlmIChvcHRpb25zLl9kYXRhKSB7XG4gICAgICBfZGF0YSA9IGhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5fZGF0YSk7XG4gICAgfVxuXG4gICAgdmFyIGNvbnRlbnQgPSAnJztcbiAgICB2YXIgY291bnQgPSBuIC0gMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBjb3VudDsgaSsrKSB7XG4gICAgICBfZGF0YSA9IHtcbiAgICAgICAgaW5kZXg6IGRpZ2l0cy5wYWQoKGkgKyAxKSwge2F1dG86IG59KVxuICAgICAgfTtcbiAgICAgIGNvbnRlbnQgKz0gb3B0aW9ucy5mbih0aGlzLCB7ZGF0YTogX2RhdGF9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBoYW5kbGViYXJzLlNhZmVTdHJpbmcoY29udGVudCk7XG4gIH0pOyIsIiMjIypcbiAgUHJpbWFyeSBhcHBsaWNhdGlvbiBtb2RlbCB3aGljaCBjb29yZGluYXRlcyBzdGF0ZVxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cblxuQXBwUm91dGVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAndmlldyc6ICAgICAgICBudWxsXG4gICAgICAncGxheWluZyc6ICAgICBudWxsXG4gICAgICAnbXV0ZSc6ICAgICAgICBudWxsXG5cbiAgICAgICdraXRNb2RlbCc6ICAgIG51bGxcblxuICAgICAgIyBTZXR0aW5nc1xuICAgICAgJ2JwbSc6ICAgICAgICAgQXBwQ29uZmlnLkJQTVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwUm91dGVyIiwiIyMjKlxuICogQ29sbGVjdGlvbiBvZiBzb3VuZCBraXRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRNb2RlbCAgPSByZXF1aXJlICcuL0tpdE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBLaXRDb2xsZWN0aW9uIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG5cbiAgICMgVXJsIHRvIGRhdGEgZm9yIGZldGNoXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHVybDogXCIje0FwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKX0vc291bmQtZGF0YS5qc29uXCJcblxuXG4gICAjIEluZGl2aWR1YWwgZHJ1bWtpdCBhdWRpbyBzZXRzXG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAgbW9kZWw6IEtpdE1vZGVsXG5cblxuICAgIyBUaGUgY3VycmVudCB1c2VyLXNlbGVjdGVkIGtpdFxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBraXRJZDogMFxuXG5cblxuICAgIyBQYXJzZXMgdGhlIGNvbGxlY3Rpb24gdG8gYXNzaWduIHBhdGhzIHRvIGVhY2ggaW5kaXZpZHVhbCBzb3VuZFxuICAgIyBiYXNlZCB1cG9uIGNvbmZpZ3VyYXRpb24gZGF0YVxuICAgIyBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcblxuICAgcGFyc2U6IChyZXNwb25zZSkgLT5cbiAgICAgIGFzc2V0UGF0aCA9IHJlc3BvbnNlLmNvbmZpZy5hc3NldFBhdGhcbiAgICAgIGtpdHMgPSByZXNwb25zZS5raXRzXG5cbiAgICAgIGtpdHMgPSBfLm1hcCBraXRzLCAoa2l0KSAtPlxuICAgICAgICAga2l0LnBhdGggPSBhc3NldFBhdGggKyAnLycgKyBraXQuZm9sZGVyXG4gICAgICAgICByZXR1cm4ga2l0XG5cbiAgICAgIHJldHVybiBraXRzXG5cblxuXG5cbiAgICMgSXRlcmF0ZXMgdGhyb3VnaCB0aGUgY29sbGVjdGlvbiBhbmQgcmV0dXJucyBhIHNwZWNpZmljIGluc3RydW1lbnRcbiAgICMgYnkgbWF0Y2hpbmcgYXNzb2NpYXRlZCBpZFxuICAgIyBAcGFyYW0ge051bWJlcn0gaWRcblxuICAgZmluZEluc3RydW1lbnRNb2RlbDogKGlkKSAtPlxuICAgICAgaW5zdHJ1bWVudE1vZGVsID0gbnVsbFxuXG4gICAgICBAZWFjaCAoa2l0TW9kZWwpID0+XG4gICAgICAgICBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuZWFjaCAobW9kZWwpID0+XG4gICAgICAgICAgICBpZiBpZCBpcyBtb2RlbC5nZXQoJ2lkJylcbiAgICAgICAgICAgICAgIGluc3RydW1lbnRNb2RlbCA9IG1vZGVsXG5cbiAgICAgIGlmIGluc3RydW1lbnRNb2RlbCBpcyBudWxsXG4gICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgaW5zdHJ1bWVudE1vZGVsXG5cblxuXG5cbiAgICMgQ3ljbGVzIHRoZSBjdXJyZW50IGRydW0ga2l0IGJhY2tcbiAgICMgQHJldHVybiB7S2l0TW9kZWx9XG5cbiAgIHByZXZpb3VzS2l0OiAtPlxuICAgICAgbGVuID0gQGxlbmd0aFxuXG4gICAgICBpZiBAa2l0SWQgPiAwXG4gICAgICAgICBAa2l0SWQtLVxuXG4gICAgICBlbHNlXG4gICAgICAgICBAa2l0SWQgPSBsZW4gLSAxXG5cbiAgICAgIGtpdE1vZGVsID0gQGF0IEBraXRJZFxuXG5cblxuXG4gICAjIEN5Y2xlcyB0aGUgY3VycmVudCBkcnVtIGtpdCBmb3J3YXJkXG4gICAjIEByZXR1cm4ge0tpdE1vZGVsfVxuXG4gICBuZXh0S2l0OiAtPlxuICAgICAgbGVuID0gQGxlbmd0aCAtIDFcblxuICAgICAgaWYgQGtpdElkIDwgbGVuXG4gICAgICAgICBAa2l0SWQrK1xuXG4gICAgICBlbHNlXG4gICAgICAgICBAa2l0SWQgPSAwXG5cbiAgICAgIGtpdE1vZGVsID0gQGF0IEBraXRJZFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRDb2xsZWN0aW9uIiwiIyMjKlxuICogS2l0IG1vZGVsIGZvciBoYW5kbGluZyBzdGF0ZSByZWxhdGVkIHRvIGtpdCBzZWxlY3Rpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuY2xhc3MgS2l0TW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ2xhYmVsJzogICAgbnVsbFxuICAgICAgJ3BhdGgnOiAgICAgbnVsbFxuICAgICAgJ2ZvbGRlcic6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cbiAgICAgICdpbnN0cnVtZW50cyc6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICAgICAnY3VycmVudEluc3RydW1lbnQnOiBudWxsXG5cblxuXG4gICAjIEZvcm1hdCB0aGUgcmVzcG9uc2Ugc28gdGhhdCBpbnN0cnVtZW50cyBnZXRzIHByb2Nlc3NlZFxuICAgIyBieSBiYWNrYm9uZSB2aWEgdGhlIEluc3RydW1lbnRDb2xsZWN0aW9uLiAgQWRkaXRpb25hbGx5LFxuICAgIyBwYXNzIGluIHRoZSBwYXRoIHNvIHRoYXQgYWJzb2x1dGUgVVJMJ3MgY2FuIGJlIHVzZWRcbiAgICMgdG8gcmVmZXJlbmNlIHNvdW5kIGRhdGFcbiAgICMgQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG5cbiAgIHBhcnNlOiAocmVzcG9uc2UpIC0+XG4gICAgICBfLmVhY2ggcmVzcG9uc2UuaW5zdHJ1bWVudHMsIChpbnN0cnVtZW50KSAtPlxuICAgICAgICAgaW5zdHJ1bWVudC5pZCA9IF8udW5pcXVlSWQgJ2luc3RydW1lbnQtJ1xuICAgICAgICAgaW5zdHJ1bWVudC5zcmMgPSByZXNwb25zZS5wYXRoICsgJy8nICsgaW5zdHJ1bWVudC5zcmNcblxuICAgICAgcmVzcG9uc2UuaW5zdHJ1bWVudHMgPSBuZXcgSW5zdHJ1bWVudENvbGxlY3Rpb24gcmVzcG9uc2UuaW5zdHJ1bWVudHNcblxuICAgICAgcmVzcG9uc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRNb2RlbCIsIiMjIypcbiAqIE1vZGVsIGZvciB0aGUgZW50aXJlIFBhZCBjb21wb25lbnRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5jbGFzcyBMaXZlUGFkTW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGl2ZVBhZE1vZGVsXG4iLCIjIyMqXG4gKiBDb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgUGFkU3F1YXJlTW9kZWxzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI0LjE0XG4jIyNcblxuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi4vc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgUGFkU3F1YXJlQ29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFkU3F1YXJlQ29sbGVjdGlvbiIsIiMjIypcbiAqIE1vZGVsIGZvciBpbmRpdmlkdWFsIHBhZCBzcXVhcmVzLlxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbmNsYXNzIFBhZFNxdWFyZU1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICdkcmFnZ2luZyc6ICBmYWxzZVxuICAgICAgJ2tleWNvZGUnOiAgIG51bGxcbiAgICAgICd0cmlnZ2VyJzogICBmYWxzZVxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICAgICAnY3VycmVudEluc3RydW1lbnQnOiAgbnVsbFxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAc2V0ICdpZCcsIF8udW5pcXVlSWQgJ3BhZC1zcXVhcmUtJ1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYWRTcXVhcmVNb2RlbFxuIiwiIyMjKlxuICogQ29sbGVjdGlvbiByZXByZXNlbnRpbmcgZWFjaCBzb3VuZCBmcm9tIGEga2l0IHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4vSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBJbnN0cnVtZW50Q29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICBtb2RlbDogSW5zdHJ1bWVudE1vZGVsXG5cblxuXG4gICAjIEV4cG9ydHMgdGhlIHBhdHRlcm4gc3F1YXJlcyBjb2xsZWN0aW9uIGZvciB1c2VcbiAgICMgd2l0aCB0cmFuc2ZlcnJpbmcgcHJvcHMgYWNyb3NzIGRpZmZlcmVudCBkcnVtIGtpdHNcblxuICAgZXhwb3J0UGF0dGVyblNxdWFyZXM6IC0+XG4gICAgICByZXR1cm4gQG1hcCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgICAgIGluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRDb2xsZWN0aW9uIiwiIyMjKlxuICogU291bmQgbW9kZWwgZm9yIGVhY2ggaW5kaXZpZHVhbCBraXQgc291bmQgc2V0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cblxuY2xhc3MgSW5zdHJ1bWVudE1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG4gICBkZWZhdWx0czpcblxuICAgICAgIyBJZiBhY3RpdmUsIHNvdW5kIGNhbiBwbGF5XG4gICAgICAjIEB0eXBlIHtCb29sZWFufVxuXG4gICAgICAnYWN0aXZlJzogICBudWxsXG5cblxuICAgICAgIyBGbGFnIHRvIGNoZWNrIGlmIGluc3RydW1lbnQgaGFzIGJlZW4gZHJvcHBlZCBvbnRvIHBhZCBzcXVhcmVcbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgICAgICdkcm9wcGVkJzogIGZhbHNlXG5cblxuICAgICAgIyBGbGFnIHRvIGNoZWNrIGlmIGF1ZGlvIGZvY3VzIGlzIHNldCBvbiBhIHBhcnRpY3VsYXIgaW5zdHJ1bWVudC5cbiAgICAgICMgSWYgc28sIGl0IG11dGVzIGFsbCBvdGhlciB0cmFja3MuXG4gICAgICAjIEB0eXBlIHtCb29sZWFufVxuXG4gICAgICAnZm9jdXMnOiAgICBudWxsXG5cblxuICAgICAgIyBAdHlwZSB7U3RyaW5nfVxuICAgICAgJ2ljb24nOiAgICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgICAnbGFiZWwnOiAgICBudWxsXG5cbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG4gICAgICAnbXV0ZSc6ICAgICBudWxsXG5cbiAgICAgICMgQHR5cGUge1N0cmluZ31cbiAgICAgICdzcmMnOiAgICAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7TnVtYmVyfVxuICAgICAgJ3ZvbHVtZSc6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbn1cbiAgICAgICdwYXR0ZXJuU3F1YXJlcyc6ICAgIG51bGxcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudE1vZGVsIiwiIyMjKlxuICBBIGNvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXNcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcENvbmZpZyAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAnLi9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi4vc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgIG1vZGVsOiBJbnN0cnVtZW50TW9kZWxcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uIiwiIyMjKlxuICBNb2RlbCBmb3IgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXMuICBQYXJ0IG9mIGxhcmdlciBQYXR0ZXJuIFRyYWNrIGNvbGxlY3Rpb25cblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlTW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ2FjdGl2ZSc6ICAgICAgICAgICBmYWxzZVxuICAgICAgJ2luc3RydW1lbnQnOiAgICAgICBudWxsXG4gICAgICAncHJldmlvdXNWZWxvY2l0eSc6IDBcbiAgICAgICd0cmlnZ2VyJzogICAgICAgICAgbnVsbFxuICAgICAgJ3ZlbG9jaXR5JzogICAgICAgICAwXG5cblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQG9uIEFwcEV2ZW50LkNIQU5HRV9WRUxPQ0lUWSwgQG9uVmVsb2NpdHlDaGFuZ2VcblxuXG5cbiAgIGN5Y2xlOiAtPlxuICAgICAgdmVsb2NpdHkgPSBAZ2V0ICd2ZWxvY2l0eSdcblxuICAgICAgaWYgdmVsb2NpdHkgPCBBcHBDb25maWcuVkVMT0NJVFlfTUFYXG4gICAgICAgICB2ZWxvY2l0eSsrXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIHZlbG9jaXR5ID0gMFxuXG4gICAgICBAc2V0ICd2ZWxvY2l0eScsIHZlbG9jaXR5XG5cblxuXG4gICBlbmFibGU6IC0+XG4gICAgICBAc2V0ICd2ZWxvY2l0eScsIDFcblxuXG5cblxuICAgZGlzYWJsZTogLT5cbiAgICAgIEBzZXQgJ3ZlbG9jaXR5JywgMFxuXG5cblxuICAgb25WZWxvY2l0eUNoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgQHNldCAncHJldmlvdXNWZWxvY2l0eScsIG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMudmVsb2NpdHlcblxuICAgICAgdmVsb2NpdHkgPSBtb2RlbC5jaGFuZ2VkLnZlbG9jaXR5XG5cbiAgICAgIGlmIHZlbG9jaXR5ID4gMFxuICAgICAgICAgQHNldCAnYWN0aXZlJywgdHJ1ZVxuXG4gICAgICBlbHNlIGlmIHZlbG9jaXR5IGlzIDBcbiAgICAgICAgIEBzZXQgJ2FjdGl2ZScsIGZhbHNlXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblNxdWFyZU1vZGVsIiwiIyMjKlxuICogTVBDIEFwcGxpY2F0aW9uIHJvdXRlclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcENvbmZpZyAgID0gcmVxdWlyZSAnLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5QdWJTdWIgICAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL1B1YlN1YidcblB1YkV2ZW50ICAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblxuIyBUT0RPOiBUaGUgYmVsb3cgaXRlbXMgYXJlIG9ubHkgaW5jbHVkZWQgZm9yIHRlc3RpbmcgY29tcG9uZW50XG4jIG1vZHVsYXJpdHkuICBUaGV5LCBhbmQgdGhlaXIgcm91dGVzLCBzaG91bGQgYmUgcmVtb3ZlZCBpbiBwcm9kdWN0aW9uXG5cblRlc3RzVmlldyAgICAgPSByZXF1aXJlICcuLi92aWV3cy90ZXN0cy9UZXN0c1ZpZXcuY29mZmVlJ1xuXG5WaWV3ID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5LaXRTZWxlY3RvciAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5LaXRNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlJ1xuXG5CUE1JbmRpY2F0b3IgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSdcbkluc3RydW1lbnRTZWxlY3RvclBhbmVsID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlJ1xuXG5JbnN0cnVtZW50TW9kZWwgPSAnLi4vbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSAnLi4vbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblBhdHRlcm5TcXVhcmUgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblRyYWNrICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2suY29mZmVlJ1xuU2VxdWVuY2VyICAgICAgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUnXG5cbkxpdmVQYWRNb2RlbCA9IHJlcXVpcmUgJy4uL21vZGVscy9wYWQvTGl2ZVBhZE1vZGVsLmNvZmZlZSdcblBhZFNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9tb2RlbHMvcGFkL1BhZFNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGFkU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuLi9tb2RlbHMvcGFkL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSdcbkxpdmVQYWQgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvTGl2ZVBhZC5jb2ZmZWUnXG5QYWRTcXVhcmUgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvUGFkU3F1YXJlLmNvZmZlZSdcblxuXG5jbGFzcyBBcHBSb3V0ZXIgZXh0ZW5kcyBCYWNrYm9uZS5Sb3V0ZXJcblxuXG4gICByb3V0ZXM6XG4gICAgICAnJzogICAgICAgICAgICAgJ2xhbmRpbmdSb3V0ZSdcbiAgICAgICdjcmVhdGUnOiAgICAgICAnY3JlYXRlUm91dGUnXG4gICAgICAnc2hhcmUnOiAgICAgICAgJ3NoYXJlUm91dGUnXG5cbiAgICAgICMgQ29tcG9uZW50IHRlc3Qgcm91dGVzXG4gICAgICAndGVzdHMnOiAgICAgICAgICAgICAgICAndGVzdHMnXG4gICAgICAna2l0LXNlbGVjdGlvbic6ICAgICAgICAna2l0U2VsZWN0aW9uUm91dGUnXG4gICAgICAnYnBtLWluZGljYXRvcic6ICAgICAgICAnYnBtSW5kaWNhdG9yUm91dGUnXG4gICAgICAnaW5zdHJ1bWVudC1zZWxlY3Rvcic6ICAnaW5zdHJ1bWVudFNlbGVjdG9yUm91dGUnXG4gICAgICAncGF0dGVybi1zcXVhcmUnOiAgICAgICAncGF0dGVyblNxdWFyZVJvdXRlJ1xuICAgICAgJ3BhdHRlcm4tdHJhY2snOiAgICAgICAgJ3BhdHRlcm5UcmFja1JvdXRlJ1xuICAgICAgJ3NlcXVlbmNlcic6ICAgICAgICAgICAgJ3NlcXVlbmNlclJvdXRlJ1xuICAgICAgJ2Z1bGwtc2VxdWVuY2VyJzogICAgICAgJ2Z1bGxTZXF1ZW5jZXJSb3V0ZSdcbiAgICAgICdwYWQtc3F1YXJlJzogICAgICAgICAgICdwYWRTcXVhcmVSb3V0ZSdcbiAgICAgICdsaXZlLXBhZCc6ICAgICAgICAgICAgICdsaXZlUGFkUm91dGUnXG5cblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHtAYXBwQ29udHJvbGxlciwgQGFwcE1vZGVsfSA9IG9wdGlvbnNcblxuICAgICAgUHViU3ViLm9uIFB1YkV2ZW50LlJPVVRFLCBAb25Sb3V0ZUNoYW5nZVxuXG5cblxuICAgb25Sb3V0ZUNoYW5nZTogKHBhcmFtcykgPT5cbiAgICAgIHtyb3V0ZX0gPSBwYXJhbXNcblxuICAgICAgQG5hdmlnYXRlIHJvdXRlLCB7IHRyaWdnZXI6IHRydWUgfVxuXG5cblxuICAgbGFuZGluZ1JvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLmxhbmRpbmdWaWV3XG5cblxuXG4gICBjcmVhdGVSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBAYXBwQ29udHJvbGxlci5jcmVhdGVWaWV3XG5cblxuXG4gICBzaGFyZVJvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLnNoYXJlVmlld1xuXG5cblxuXG5cblxuICAgIyBDT01QT05FTlQgVEVTVCBST1VURVNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICB0ZXN0czogLT5cbiAgICAgIHZpZXcgPSBuZXcgVGVzdHNWaWV3KClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAga2l0U2VsZWN0aW9uUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLFxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBicG1JbmRpY2F0b3JSb3V0ZTogLT5cbiAgICAgIHZpZXcgPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIHZpZXcucmVuZGVyKClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAgaW5zdHJ1bWVudFNlbGVjdG9yUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgdmlldyA9IG5ldyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAgcGF0dGVyblNxdWFyZVJvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbmV3IFBhdHRlcm5TcXVhcmVNb2RlbCgpXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG4gICBwYXR0ZXJuVHJhY2tSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgIG1vZGVsOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbiAgIHNlcXVlbmNlclJvdXRlOiAtPlxuXG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgU2VxdWVuY2VyXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbiAgIGZ1bGxTZXF1ZW5jZXJSb3V0ZTogLT5cblxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG5cbiAgICAgIGtpdFNlbGVjdGlvbiA9ID0+XG4gICAgICAgICB2aWV3ID0gbmV3IEtpdFNlbGVjdG9yXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICAgICB2aWV3XG5cblxuICAgICAgYnBtID0gPT5cbiAgICAgICAgIHZpZXcgPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgICAgIHZpZXdcblxuXG4gICAgICBpbnN0cnVtZW50U2VsZWN0aW9uID0gPT5cbiAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgICAgdmlldyA9IG5ldyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuICAgICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgICAgdmlld1xuXG5cbiAgICAgIHNlcXVlbmNlciA9ID0+XG4gICAgICAgICB2aWV3ID0gbmV3IFNlcXVlbmNlclxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgICAgIHZpZXdcblxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcgPSBuZXcgVmlldygpXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldy4kZWwuYXBwZW5kIGtpdFNlbGVjdGlvbigpLnJlbmRlcigpLmVsXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldy4kZWwuYXBwZW5kIGJwbSgpLnJlbmRlcigpLmVsXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldy4kZWwuYXBwZW5kIGluc3RydW1lbnRTZWxlY3Rpb24oKS5yZW5kZXIoKS5lbFxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcuJGVsLmFwcGVuZCBzZXF1ZW5jZXIoKS5yZW5kZXIoKS5lbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgZnVsbFNlcXVlbmNlclZpZXdcblxuXG5cblxuICAgcGFkU3F1YXJlUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgUGFkU3F1YXJlXG4gICAgICAgICBtb2RlbDogbmV3IFBhZFNxdWFyZU1vZGVsKClcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuXG4gICBsaXZlUGFkUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgTGl2ZVBhZFxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBSb3V0ZXIiLCIjIyMqXG4gKiBWaWV3IHN1cGVyY2xhc3MgY29udGFpbmluZyBzaGFyZWQgZnVuY3Rpb25hbGl0eVxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMi4xNy4xNFxuIyMjXG5cblxuVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kXG5cblxuXG4gICAjIEluaXRpYWxpemVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgXy5leHRlbmQgQCwgXy5kZWZhdWx0cyggb3B0aW9ucyA9IG9wdGlvbnMgfHwgQGRlZmF1bHRzLCBAZGVmYXVsdHMgfHwge30gKVxuXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyB3aXRoIHN1cHBsaWVkIHRlbXBsYXRlIGRhdGEsIG9yIGNoZWNrcyBpZiB0ZW1wbGF0ZSBpcyBvblxuICAgIyBvYmplY3QgYm9keVxuICAgIyBAcGFyYW0gIHtGdW5jdGlvbnxNb2RlbH0gdGVtcGxhdGVEYXRhXG4gICAjIEByZXR1cm4ge1ZpZXd9XG5cbiAgIHJlbmRlcjogKHRlbXBsYXRlRGF0YSkgLT5cbiAgICAgIHRlbXBsYXRlRGF0YSA9IHRlbXBsYXRlRGF0YSB8fCB7fVxuXG4gICAgICBpZiBAdGVtcGxhdGVcblxuICAgICAgICAgIyBJZiBtb2RlbCBpcyBhbiBpbnN0YW5jZSBvZiBhIGJhY2tib25lIG1vZGVsLCB0aGVuIEpTT05pZnkgaXRcbiAgICAgICAgIGlmIEBtb2RlbCBpbnN0YW5jZW9mIEJhY2tib25lLk1vZGVsXG4gICAgICAgICAgICB0ZW1wbGF0ZURhdGEgPSBAbW9kZWwudG9KU09OKClcblxuICAgICAgICAgQCRlbC5odG1sIEB0ZW1wbGF0ZSAodGVtcGxhdGVEYXRhKVxuXG4gICAgICBAZGVsZWdhdGVFdmVudHMoKVxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQFxuXG5cblxuXG4gICAjIFJlbW92ZXMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVtb3ZlOiAob3B0aW9ucykgLT5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG4gICAgICBAJGVsLnJlbW92ZSgpXG4gICAgICBAdW5kZWxlZ2F0ZUV2ZW50cygpXG5cblxuXG5cblxuICAgIyBTaG93cyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBzaG93OiAob3B0aW9ucykgLT5cbiAgICAgIFR3ZWVuTWF4LnNldCBAJGVsLCB7IGF1dG9BbHBoYTogMSB9XG5cblxuXG5cbiAgICMgSGlkZXMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaGlkZTogKG9wdGlvbnMpIC0+XG4gICAgICBUd2Vlbk1heC5zZXQgQCRlbCxcbiAgICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgIGlmIG9wdGlvbnM/LnJlbW92ZVxuICAgICAgICAgICAgICAgQHJlbW92ZSgpXG5cblxuXG5cbiAgICMgTm9vcCB3aGljaCBpcyBjYWxsZWQgb24gcmVuZGVyXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuXG5cblxuICAgIyBSZW1vdmVzIGFsbCByZWdpc3RlcmVkIGxpc3RlbmVyc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlldyIsIi8qKlxuICogQG1vZHVsZSAgICAgUHViU3ViXG4gKiBAZGVzYyAgICAgICBHbG9iYWwgUHViU3ViIG9iamVjdCBmb3IgZGlzcGF0Y2ggYW5kIGRlbGVnYXRpb25cbiAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIFB1YlN1YiA9IHt9XG5cbl8uZXh0ZW5kKCBQdWJTdWIsIEJhY2tib25lLkV2ZW50cyApXG5cbm1vZHVsZS5leHBvcnRzID0gUHViU3ViIiwiIyMjKlxuICogQ3JlYXRlIHZpZXcgd2hpY2ggdGhlIHVzZXIgY2FuIGJ1aWxkIGJlYXRzIHdpdGhpblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblxuVmlldyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5LaXRTZWxlY3RvciAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSdcbkluc3RydW1lbnRTZWxlY3RvclBhbmVsID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlJ1xuU2VxdWVuY2VyICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSdcbkJQTUluZGljYXRvciAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSdcbnRlbXBsYXRlICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvY3JlYXRlLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBDcmVhdGVWaWV3IGV4dGVuZHMgVmlld1xuXG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAka2l0U2VsZWN0b3JDb250YWluZXIgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1raXQtc2VsZWN0b3InXG4gICAgICBAJGtpdFNlbGVjdG9yICAgICAgICAgICAgPSBAJGVsLmZpbmQgJy5raXQtc2VsZWN0b3InXG4gICAgICBAJHZpc3VhbGl6YXRpb25Db250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItdmlzdWFsaXphdGlvbidcbiAgICAgIEAkc2VxdWVuY2VyQ29udGFpbmVyICAgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1zZXF1ZW5jZXInXG4gICAgICBAJGluc3RydW1lbnRTZWxlY3RvciAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuaW5zdHJ1bWVudC1zZWxlY3RvcidcbiAgICAgIEAkc2VxdWVuY2VyICAgICAgICAgICAgICA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5zZXF1ZW5jZXInXG4gICAgICBAJGJwbSAgICAgICAgICAgICAgICAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuYnBtJ1xuICAgICAgQCRzaGFyZUJ0biAgICAgICAgICAgICAgID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLmJ0bi1zaGFyZSdcblxuICAgICAgQHJlbmRlcktpdFNlbGVjdG9yKClcbiAgICAgIEByZW5kZXJJbnN0cnVtZW50U2VsZWN0b3IoKVxuICAgICAgQHJlbmRlclNlcXVlbmNlcigpXG4gICAgICBAcmVuZGVyQlBNKClcblxuICAgICAgQFxuXG5cblxuICAgcmVuZGVyS2l0U2VsZWN0b3I6IC0+XG4gICAgICBAa2l0U2VsZWN0b3IgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIEAka2l0U2VsZWN0b3IuaHRtbCBAa2l0U2VsZWN0b3IucmVuZGVyKCkuZWxcblxuXG5cbiAgIHJlbmRlckluc3RydW1lbnRTZWxlY3RvcjogLT5cbiAgICAgIEBpbnN0cnVtZW50U2VsZWN0b3IgPSBuZXcgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWxcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIEAkaW5zdHJ1bWVudFNlbGVjdG9yLmh0bWwgQGluc3RydW1lbnRTZWxlY3Rvci5yZW5kZXIoKS5lbFxuXG5cblxuICAgcmVuZGVyU2VxdWVuY2VyOiAtPlxuICAgICAgQHNlcXVlbmNlciA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICBAJHNlcXVlbmNlci5odG1sIEBzZXF1ZW5jZXIucmVuZGVyKCkuZWxcblxuXG5cbiAgIHJlbmRlckJQTTogLT5cbiAgICAgIEBicG0gPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEAkYnBtLmh0bWwgQGJwbS5yZW5kZXIoKS5lbFxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3JlYXRlVmlldyIsIiMjIypcbiAqIEJlYXRzIHBlciBtaW51dGUgdmlldyBmb3IgaGFuZGxpbmcgdGVtcG9cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9icG0tdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEJQTUluZGljYXRvciBleHRlbmRzIFZpZXdcblxuXG4gICAjIFJlZiB0byB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBUaGUgc2V0SW50ZXJ2YWwgdXBkYXRlIGludGVydmFsIGZvciBpbmNyZWFzaW5nIGFuZFxuICAgIyBkZWNyZWFzaW5nIEJQTSBvbiBwcmVzcyAvIHRvdWNoXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGludGVydmFsVXBkYXRlVGltZTogNzBcblxuXG4gICAjIFRoZSBzZXRJbnRlcnZhbCB1cGRhdGVyXG4gICAjIEB0eXBlIHtTZXRJbnRlcnZhbH1cblxuICAgdXBkYXRlSW50ZXJ2YWw6IG51bGxcblxuXG4gICAjIFRoZSBhbW91bnQgdG8gaW5jcmVhc2UgdGhlIEJQTSBieSBvbiBlYWNoIHRpY2tcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgYnBtSW5jcmVhc2VBbW91bnQ6IDEwXG5cblxuICAgIyBUaGUgY3VycmVudCBicG0gYmVmb3JlIGl0cyBzZXQgb24gdGhlIG1vZGVsLiAgVXNlZCB0byBidWZmZXJcbiAgICMgdXBkYXRlcyBhbmQgdG8gcHJvdmlkZSBmb3Igc21vb3RoIGFuaW1hdGlvblxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBjdXJyQlBNOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaHN0YXJ0IC5idG4taW5jcmVhc2UnOiAnb25JbmNyZWFzZUJ0bkRvd24nXG4gICAgICAndG91Y2hzdGFydCAuYnRuLWRlY3JlYXNlJzogJ29uRGVjcmVhc2VCdG5Eb3duJ1xuICAgICAgJ3RvdWNoZW5kICAgLmJ0bi1pbmNyZWFzZSc6ICdvbkJ0blVwJ1xuICAgICAgJ3RvdWNoZW5kICAgLmJ0bi1kZWNyZWFzZSc6ICdvbkJ0blVwJ1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgdXBkYXRlIHRoZSBraXQgaWYgbm90IGFscmVhZHlcbiAgICMgc2V0IHZpYSBhIHByZXZpb3VzIHNlc3Npb25cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRicG1MYWJlbCAgID0gQCRlbC5maW5kICcubGFiZWwtYnBtJ1xuICAgICAgQGluY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWluY3JlYXNlJ1xuICAgICAgQGRlY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWRlY3JlYXNlJ1xuXG4gICAgICBAY3VyckJQTSA9IEBhcHBNb2RlbC5nZXQoJ2JwbScpXG4gICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cbiAgICAgIEBvbkJ0blVwKClcblxuICAgICAgQFxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAgIyBzd2l0Y2hpbmcgQlBNXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0JQTSwgQG9uQlBNQ2hhbmdlXG5cblxuXG5cbiAgICMgU2V0cyBhbiBpbnRlcnZhbCB0byBpbmNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgICMgd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2VcblxuICAgaW5jcmVhc2VCUE06IC0+XG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgICAgYnBtID0gQGN1cnJCUE1cblxuICAgICAgICAgaWYgYnBtIDwgQXBwQ29uZmlnLkJQTV9NQVhcbiAgICAgICAgICAgIGJwbSArPSBAYnBtSW5jcmVhc2VBbW91bnRcblxuICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnBtID0gQXBwQ29uZmlnLkJQTV9NQVhcblxuICAgICAgICAgQGN1cnJCUE0gPSBicG1cbiAgICAgICAgIEAkYnBtTGFiZWwudGV4dCBAY3VyckJQTVxuICAgICAgICAgI0BhcHBNb2RlbC5zZXQgJ2JwbScsIDYwMDAwIC8gQGN1cnJCUE1cblxuICAgICAgLCBAaW50ZXJ2YWxVcGRhdGVUaW1lXG5cblxuXG5cbiAgICMgU2V0cyBhbiBpbnRlcnZhbCB0byBkZWNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgICMgd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2VcblxuICAgZGVjcmVhc2VCUE06IC0+XG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgICAgYnBtID0gQGN1cnJCUE1cblxuICAgICAgICAgaWYgYnBtID4gMFxuICAgICAgICAgICAgYnBtIC09IEBicG1JbmNyZWFzZUFtb3VudFxuXG4gICAgICAgICBlbHNlXG4gICAgICAgICAgICBicG0gPSAwXG5cbiAgICAgICAgIEBjdXJyQlBNID0gYnBtXG4gICAgICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cbiAgICAgICAgICNAYXBwTW9kZWwuc2V0ICdicG0nLCA2MDAwMCAvIEBjdXJyQlBNXG5cbiAgICAgICwgQGludGVydmFsVXBkYXRlVGltZVxuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkluY3JlYXNlQnRuRG93bjogKGV2ZW50KSA9PlxuICAgICAgQGluY3JlYXNlQlBNKClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uRGVjcmVhc2VCdG5Eb3duOiAoZXZlbnQpIC0+XG4gICAgICBAZGVjcmVhc2VCUE0oKVxuXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbW91c2UgLyB0b3VjaHVwIGV2ZW50cy4gIENsZWFycyB0aGUgaW50ZXJ2YWxcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25CdG5VcDogKGV2ZW50KSAtPlxuICAgICAgY2xlYXJJbnRlcnZhbCBAdXBkYXRlSW50ZXJ2YWxcbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IG51bGxcblxuICAgICAgQGFwcE1vZGVsLnNldCAnYnBtJywgNjAwMDAgLyBAY3VyckJQTVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2UgZXZlbnRzLiAgVXBkYXRlcyB0aGUgbGFiZWwgb24gdGhlXG4gICAjIGtpdCBzZWxlY3RvclxuXG4gICBvbkJQTUNoYW5nZTogKG1vZGVsKSAtPlxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQlBNSW5kaWNhdG9yIiwiIyMjKlxuICogS2l0IHNlbGVjdG9yIGZvciBzd2l0Y2hpbmcgYmV0d2VlbiBkcnVtLWtpdCBzb3VuZHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMva2l0LXNlbGVjdGlvbi10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgS2l0U2VsZWN0b3IgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBSZWYgdG8gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBLaXRDb2xsZWN0aW9uIGZvciB1cGRhdGluZyBzb3VuZHNcbiAgICMgQHR5cGUge0tpdENvbGxlY3Rpb259XG5cbiAgIGtpdENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIFRoZSBjdXJyZW50IGtpdFxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdE1vZGVsOiBudWxsXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLmJ0bi1sZWZ0JzogICAnb25MZWZ0QnRuQ2xpY2snXG4gICAgICAndG91Y2hlbmQgLmJ0bi1yaWdodCc6ICAnb25SaWdodEJ0bkNsaWNrJ1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgdXBkYXRlIHRoZSBraXQgaWYgbm90IGFscmVhZHlcbiAgICMgc2V0IHZpYSBhIHByZXZpb3VzIHNlc3Npb25cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRraXRMYWJlbCA9IEAkZWwuZmluZCAnLmxhYmVsLWtpdCdcblxuICAgICAgaWYgQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKSBpcyBudWxsXG4gICAgICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEAka2l0TGFiZWwudGV4dCBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpLmdldCAnbGFiZWwnXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAgIyBzd2l0Y2hpbmcgZHJ1bSBraXRzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uQ2hhbmdlS2l0XG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuXG4gICBvbkxlZnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5wcmV2aW91c0tpdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuXG4gICBvblJpZ2h0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSBsYWJlbCBvbiB0aGVcbiAgICMga2l0IHNlbGVjdG9yXG5cbiAgIG9uQ2hhbmdlS2l0OiAobW9kZWwpIC0+XG4gICAgICBAa2l0TW9kZWwgPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsXG4gICAgICBAJGtpdExhYmVsLnRleHQgQGtpdE1vZGVsLmdldCAnbGFiZWwnXG5cblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdFNlbGVjdG9yIiwiIyMjKlxuICogU291bmQgdHlwZSBzZWxlY3RvciBmb3IgY2hvb3Npbmcgd2hpY2ggc291bmQgc2hvdWxkXG4gKiBwbGF5IG9uIGVhY2ggdHJhY2tcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBJbnN0cnVtZW50IGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIHZpZXcgY2xhc3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnaW5zdHJ1bWVudCdcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFJlZiB0byB0aGUgSW5zdHJ1bWVudE1vZGVsXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG5cbiAgIG1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIHBhcmVudCBraXRcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRNb2RlbDogbnVsbFxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQnOiAnb25DbGljaydcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBjbGljayBldmVudHMuICBVcGRhdGVzIHRoZSBjdXJyZW50IGluc3RydW1lbnQgbW9kZWwsIHdoaWNoXG4gICAjIEluc3RydW1lbnRTZWxlY3RvclBhbmVsIGxpc3RlbnMgdG8sIGFuZCBhZGRzIGEgc2VsZWN0ZWQgc3RhdGVcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGtpdE1vZGVsLnNldCAnY3VycmVudEluc3RydW1lbnQnLCBAbW9kZWxcbiAgICAgIEAkZWwuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudCIsIiMjIypcbiAqIFBhbmVsIHdoaWNoIGhvdXNlcyBlYWNoIGluZGl2aWR1YWwgc2VsZWN0YWJsZSBzb3VuZFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuSW5zdHJ1bWVudCAgPSByZXF1aXJlICcuL0luc3RydW1lbnQuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXBhbmVsLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCBleHRlbmRzIFZpZXdcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFJlZiB0byB0aGUgYXBwbGljYXRpb24gbW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIGtpdCBjb2xsZWN0aW9uXG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQga2l0XG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0TW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byBpbnN0cnVtZW50IHZpZXdzXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgaW5zdHJ1bWVudFZpZXdzOiBudWxsXG5cblxuXG5cbiAgICMgSW5pdGlhbGl6ZXMgdGhlIGluc3RydW1lbnQgc2VsZWN0b3IgYW5kIHNldHMgYSBsb2NhbCByZWZcbiAgICMgdG8gdGhlIGN1cnJlbnQga2l0IG1vZGVsIGZvciBlYXN5IGFjY2Vzc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQGtpdE1vZGVsID0gQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKVxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYXMgd2VsbCBhcyB0aGUgYXNzb2NpYXRlZCBraXQgaW5zdHJ1bWVudHNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRjb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItaW5zdHJ1bWVudHMnXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW5kZXJzIGVhY2ggaW5kaXZpZHVhbCBraXQgbW9kZWwgaW50byBhbiBJbnN0cnVtZW50XG5cbiAgIHJlbmRlckluc3RydW1lbnRzOiAtPlxuICAgICAgQGluc3RydW1lbnRWaWV3cyA9IFtdXG5cbiAgICAgIEBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuZWFjaCAobW9kZWwpID0+XG4gICAgICAgICBpbnN0cnVtZW50ID0gbmV3IEluc3RydW1lbnRcbiAgICAgICAgICAgIGtpdE1vZGVsOiBAa2l0TW9kZWxcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuXG4gICAgICAgICBAJGNvbnRhaW5lci5hcHBlbmQgaW5zdHJ1bWVudC5yZW5kZXIoKS5lbFxuICAgICAgICAgQGluc3RydW1lbnRWaWV3cy5wdXNoIGluc3RydW1lbnRcblxuXG5cblxuICAgIyBBZGRzIGV2ZW50IGxpc3RlbmVycyByZWxhdGVkIHRvIGtpdCBjaGFuZ2VzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uS2l0Q2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGtpdE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cblxuICAgIyBSZW1vdmVzIGV2ZW50IGxpc3RlbmVyc1xuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cblxuXG4gICAjIEVWRU5UIExJU1RFTkVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIENsZWFucyB1cCB0aGUgdmlldyBhbmQgcmUtcmVuZGVyc1xuICAgIyB0aGUgaW5zdHJ1bWVudHMgdG8gdGhlIERPTVxuICAgIyBAcGFyYW0ge0tpdE1vZGVsfSBtb2RlbFxuXG4gICBvbktpdENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQHJlbW92ZUV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQGtpdE1vZGVsID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbFxuXG4gICAgICBfLmVhY2ggQGluc3RydW1lbnRWaWV3cywgKGluc3RydW1lbnQpIC0+XG4gICAgICAgICBpbnN0cnVtZW50LnJlbW92ZSgpXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICBvbkluc3RydW1lbnRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEAkY29udGFpbmVyLmZpbmQoJy5pbnN0cnVtZW50JykucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuXG5cbiAgIG9uVGVzdENsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9J2NvbnRhaW5lci1pbnN0cnVtZW50cyc+XFxuXFxuPC9kaXY+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIjtcblxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9J2ljb24gXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmljb24pIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmljb247IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCInPjwvZGl2PlxcbjxkaXYgY2xhc3M9J2xhYmVsJz5cXG5cdFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCIjIyMqXG4gKiBMaXZlIE1QQyBcInBhZFwiIGNvbXBvbmVudFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbkFwcEV2ZW50ICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuUGFkU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYWRTcXVhcmVNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVNb2RlbC5jb2ZmZWUnXG5WaWV3ICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuUGFkU3F1YXJlICAgICAgICAgICA9IHJlcXVpcmUgJy4vUGFkU3F1YXJlLmNvZmZlZSdcbnBhZHNUZW1wbGF0ZSAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYWRzLXRlbXBsYXRlLmhicydcbmluc3RydW1lbnRzVGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50cy10ZW1wbGF0ZS5oYnMnXG50ZW1wbGF0ZSAgICAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvbGl2ZS1wYWQtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIExpdmVQYWQgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgY2xhc3NuYW1lIGZvciB0aGUgTGl2ZSBQYWRcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnY29udGFpbmVyLWxpdmUtcGFkJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBBcHBtb2RlbCBmb3IgbGlzdGVuaW5nIHRvIHNob3cgLyBoaWRlIGV2ZW50c1xuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBDb2xsZWN0aW9uIG9mIGtpdHMgdG8gYmUgcmVuZGVyZWQgdG8gdGhlIGluc3RydW1lbnQgY29udGFpbmVyXG4gICAjIEB0eXBlIHtLaXRDb2xsZWN0aW9ufVxuXG4gICBraXRDb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBDb2xsZWN0aW9uIG9mIGluc3RydW1lbnRzLiAgVXNlZCB0byBsaXN0ZW4gdG8gYGRyb3BwZWRgIHN0YXR1c1xuICAgIyBvbiBpbmRpdmlkdWFsIGluc3RydW1lbnQgbW9kZWxzLCBhcyBzZXQgZnJvbSB0aGUgUGFkU3F1YXJlXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cblxuICAgaW5zdHJ1bWVudENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIENvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBwYWQgc3F1YXJlIG1vZGVsc1xuICAgIyBAdHlwZSB7UGFkU3F1YXJlQ29sbGVjdGlvbn1cblxuICAgcGFkU3F1YXJlQ29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgQW4gYXJyYXkgb2YgaW5kaXZpZHVhbCBQYWRTcXVhcmVWaWV3c1xuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIHBhZFNxdWFyZVZpZXdzOiBudWxsXG5cblxuICAgIyBLZXkgY29tbWFuZCBrZXltYXAgZm9yIGxpdmUga2l0IHBsYXliYWNrXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAga2V5bWFwOiBbJzEnLCcyJywnMycsJzQnLCdxJywgJ3cnLCAnZScsICdyJywgJ2EnLCAncycsICdkJywgJ2YnLCAneicsICd4JywgJ2MnLCAndiddXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgYW5kIHBhcnNlIHRoZSBjb2xsZWN0aW9uIGludG8gYSBkaXNwbGF5YWJsZVxuICAgIyBpbnN0cnVtZW50IC8gcGFkIHRhYmxlXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAjIEByZXR1cm4ge0xpdmVQYWR9XG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkcGFkc0NvbnRhaW5lciAgICAgICAgPSBAJGVsLmZpbmQgJy5jb250YWluZXItcGFkcydcbiAgICAgIEAkaW5zdHJ1bWVudHNDb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItaW5zdHJ1bWVudHMnXG5cbiAgICAgIEByZW5kZXJQYWRzKClcbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG5cbiAgICAgICMgUmVuZGVyIHNxdWFyZXMgdG8gdGhlIERPTVxuICAgICAgXy5lYWNoIEBwYWRTcXVhcmVWaWV3cywgKHBhZFNxdWFyZSkgPT5cbiAgICAgICAgIGlkID0gcGFkU3F1YXJlLm1vZGVsLmdldCAnaWQnXG4gICAgICAgICBAJGVsLmZpbmQoXCIjI3tpZH1cIikuaHRtbCBwYWRTcXVhcmUucmVuZGVyKCkuZWxcblxuICAgICAgQHNldERyYWdBbmREcm9wKClcblxuICAgICAgQFxuXG5cblxuICAgcmVuZGVyUGFkczogLT5cbiAgICAgIEAkcGFkc0NvbnRhaW5lci5odG1sIHBhZHNUZW1wbGF0ZSB7XG4gICAgICAgICBwYWRUYWJsZTogQHJldHVyblBhZFRhYmxlRGF0YSgpXG4gICAgICB9XG5cblxuXG4gICByZW5kZXJJbnN0cnVtZW50czogLT5cbiAgICAgIEAkaW5zdHJ1bWVudHNDb250YWluZXIuaHRtbCBpbnN0cnVtZW50c1RlbXBsYXRlIHtcbiAgICAgICAgIGluc3RydW1lbnRUYWJsZTogQHJldHVybkluc3RydW1lbnRUYWJsZURhdGEoKVxuICAgICAgfVxuXG5cblxuICAgIyBBZGQgY29sbGVjdGlvbiBsaXN0ZW5lcnMgdG8gbGlzdGVuIGZvciBpbnN0cnVtZW50IGRyb3BzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgZHJvcCBjaGFuZ2UgZXZlbnRzLiAgQ2hlY2tzIHRvIHNlZSBpZiB0aGUgaW5zdHJ1bWVudFxuICAgIyBjbGFzc05hbWUgZXhpc3RzIG9uIHRoZSBlbGVtZW50IGFuZCwgaWYgc28sIHJlLXJlbmRlcnMgdGhlXG4gICAjIGluc3RydW1lbnQgYW5kIHBhZCB0YWJsZXNcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IGluc3RydW1lbnRNb2RlbFxuXG4gICBvbkRyb3BwZWRDaGFuZ2U6IChpbnN0cnVtZW50TW9kZWwpID0+XG4gICAgICBpbnN0cnVtZW50SWQgPSBpbnN0cnVtZW50TW9kZWwuZ2V0KCdpZCcpXG4gICAgICAkcGFkU3F1YXJlICAgPSBAJGVsLmZpbmQgXCIuI3tpbnN0cnVtZW50SWR9XCJcbiAgICAgIHBhZFNxdWFyZUlkICA9ICRwYWRTcXVhcmUuYXR0ciAnaWQnXG4gICAgICBwYWRTcXVhcmVNb2RlbCA9IEBwYWRTcXVhcmVDb2xsZWN0aW9uLmZpbmRXaGVyZSB7IGlkOiBwYWRTcXVhcmVJZCB9XG5cbiAgICAgICMgQ2hlY2tzIGFnYWluc3QgdGVzdHMgYW5kIGRyYWdnYWJsZSwgd2hpY2ggaXMgbGVzcyB0ZXN0YWJsZVxuICAgICAgdW5sZXNzIHBhZFNxdWFyZU1vZGVsIGlzIHVuZGVmaW5lZFxuICAgICAgICAgcGFkU3F1YXJlTW9kZWwuc2V0ICdjdXJyZW50SW5zdHJ1bWVudCcsIGluc3RydW1lbnRNb2RlbFxuXG5cblxuXG4gICBvbkluc3RydW1lbnREcm9wOiAoZHJhZ2dlZCwgZHJvcHBlZCkgPT5cbiAgICAgICRkcmFnZ2VkID0gJChkcmFnZ2VkKVxuICAgICAgJGRyb3BwZWQgPSAkKGRyb3BwZWQpXG5cbiAgICAgIGlkID0gJGRyYWdnZWQuYXR0ciAnaWQnXG4gICAgICAkZHJvcHBlZC5hZGRDbGFzcyBpZFxuXG4gICAgICBpbnN0cnVtZW50TW9kZWwgPSBAa2l0Q29sbGVjdGlvbi5maW5kSW5zdHJ1bWVudE1vZGVsIGlkXG4gICAgICBpbnN0cnVtZW50TW9kZWwuc2V0ICdkcm9wcGVkJywgdHJ1ZVxuXG4gICAgICBfLmRlZmVyID0+XG4gICAgICAgICBAcmVuZGVySW5zdHJ1bWVudHMoKVxuICAgICAgICAgQHNldERyYWdBbmREcm9wKClcblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgIHNldERyYWdBbmREcm9wOiAtPlxuICAgICAgc2VsZiA9IEBcblxuICAgICAgQCRpbnN0cnVtZW50ID0gQCRlbC5maW5kICcuaW5zdHJ1bWVudCdcbiAgICAgICRkcm9wcGFibGVzICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1wYWQnXG5cbiAgICAgIEBkcmFnZ2FibGUgPSBEcmFnZ2FibGUuY3JlYXRlIEAkaW5zdHJ1bWVudCxcbiAgICAgICAgIGJvdW5kczogd2luZG93XG5cbiAgICAgICAgIG9uRHJhZzogKGV2ZW50KSAtPlxuICAgICAgICAgICAgaSA9ICRkcm9wcGFibGVzLmxlbmd0aFxuXG4gICAgICAgICAgICB3aGlsZSgtLWkgPiAtMSlcbiAgICAgICAgICAgICAgIGlmIEBoaXRUZXN0KCRkcm9wcGFibGVzW2ldLCAnNTAlJylcbiAgICAgICAgICAgICAgICAgICQoJGRyb3BwYWJsZXNbaV0pLmFkZENsYXNzICdoaWdobGlnaHQnXG4gICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAkKCRkcm9wcGFibGVzW2ldKS5yZW1vdmVDbGFzcyAnaGlnaGxpZ2h0J1xuXG4gICAgICAgICBvbkRyYWdFbmQ6IChldmVudCkgLT5cbiAgICAgICAgICAgIGkgPSAkZHJvcHBhYmxlcy5sZW5ndGhcblxuICAgICAgICAgICAgd2hpbGUoLS1pID4gLTEpXG4gICAgICAgICAgICAgICBpZiBAaGl0VGVzdCgkZHJvcHBhYmxlc1tpXSwgJzUwJScpXG4gICAgICAgICAgICAgICAgICBzZWxmLm9uSW5zdHJ1bWVudERyb3AodGhpcy50YXJnZXQsICRkcm9wcGFibGVzW2ldKVxuXG5cblxuXG5cblxuICAgIyBSZW5kZXIgb3V0IHRoZSB0YWJsZSBmb3IgdGhlIGxpdmUgcGFkIGdyaWQgYW5kIHB1c2hcbiAgICMgaXQgaW50byBhbiBhcnJheSBvZiB0YWJsZSByb3dzIGFuZCB0ZHNcbiAgICMgQHJldHVybiB7T2JqZWN0fVxuXG4gICByZXR1cm5QYWRUYWJsZURhdGE6IC0+XG5cbiAgICAgIEBwYWRTcXVhcmVDb2xsZWN0aW9uID0gbmV3IFBhZFNxdWFyZUNvbGxlY3Rpb24oKVxuICAgICAgQHBhZFNxdWFyZVZpZXdzID0gW11cbiAgICAgIHBhZFRhYmxlID0ge31cbiAgICAgIHJvd3MgPSBbXVxuICAgICAgaXRlcmF0b3IgPSAwXG5cbiAgICAgICMgUmVuZGVyIG91dCByb3dzXG4gICAgICBfKDQpLnRpbWVzIChpbmRleCkgPT5cbiAgICAgICAgIHRkcyAgPSBbXVxuXG4gICAgICAgICAjIFJlbmRlciBvdXQgY29sdW1uc1xuICAgICAgICAgXyg0KS50aW1lcyAoaW5kZXgpID0+XG5cbiAgICAgICAgICAgICMgSW5zdGFudGlhdGUgZWFjaCBwYWQgdmlldyBhbmQgdGllIHRoZSBpZFxuICAgICAgICAgICAgIyB0byB0aGUgRE9NIGVsZW1lbnRcblxuICAgICAgICAgICAgbW9kZWwgPSBuZXcgUGFkU3F1YXJlTW9kZWxcbiAgICAgICAgICAgICAgIGtleWNvZGU6IEBrZXltYXBbaXRlcmF0b3JdXG5cbiAgICAgICAgICAgIHBhZFNxdWFyZSA9IG5ldyBQYWRTcXVhcmVcbiAgICAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuICAgICAgICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgICAgICAgQHBhZFNxdWFyZUNvbGxlY3Rpb24uYWRkIG1vZGVsXG4gICAgICAgICAgICBAcGFkU3F1YXJlVmlld3MucHVzaCBwYWRTcXVhcmVcbiAgICAgICAgICAgIGl0ZXJhdG9yKytcblxuICAgICAgICAgICAgdGRzLnB1c2gge1xuICAgICAgICAgICAgICAgaWQ6IHBhZFNxdWFyZS5tb2RlbC5nZXQoJ2lkJylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgcm93cy5wdXNoIHtcbiAgICAgICAgICAgIGlkOiBcInBhZC1yb3ctI3tpbmRleH1cIlxuICAgICAgICAgICAgdGRzOiB0ZHNcbiAgICAgICAgIH1cblxuICAgICAgcGFkVGFibGUucm93cyA9IHJvd3NcblxuICAgICAgcGFkVGFibGVcblxuXG5cblxuICAgIyBSZW5kZXIgb3V0IHRoZSBpbnN0cnVtZW50IHRhYmxlIGFuZCBwdXNoIGl0IGludG9cbiAgICMgYW5kIGFycmF5IG9mIGluZGl2aWR1YWwgaW5zdHJ1bWVudHNcbiAgICMgQHJldHVybiB7T2JqZWN0fVxuXG4gICByZXR1cm5JbnN0cnVtZW50VGFibGVEYXRhOiAtPlxuICAgICAgaW5zdHJ1bWVudFRhYmxlID0gQGtpdENvbGxlY3Rpb24ubWFwIChraXQpID0+XG4gICAgICAgICBpbnN0cnVtZW50Q29sbGVjdGlvbiA9IGtpdC5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgICAgIyBCZWdpbiBsaXN0ZW5pbmcgdG8gZHJvcCBldmVudHNcbiAgICAgICAgIEBsaXN0ZW5UbyBpbnN0cnVtZW50Q29sbGVjdGlvbiwgQXBwRXZlbnQuQ0hBTkdFX0RST1BQRUQsIEBvbkRyb3BwZWRDaGFuZ2VcblxuICAgICAgICAgaW5zdHJ1bWVudHMgPSBpbnN0cnVtZW50Q29sbGVjdGlvbi5tYXAgKGluc3RydW1lbnQpID0+XG4gICAgICAgICAgICBpbnN0cnVtZW50LnRvSlNPTigpXG5cbiAgICAgICAgIGluc3RydW1lbnRzID0gXy53aGVyZSBpbnN0cnVtZW50cywgeyBkcm9wcGVkOiBmYWxzZSB9XG5cbiAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbDoga2l0LmdldCAnbGFiZWwnXG4gICAgICAgICAgICBpbnN0cnVtZW50czogaW5zdHJ1bWVudHNcbiAgICAgICAgIH1cblxuICAgICAgaW5zdHJ1bWVudFRhYmxlXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMaXZlUGFkIiwiIyMjKlxuICogTGl2ZSBNUEMgXCJwYWRcIiBjb21wb25lbnRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYWQtc3F1YXJlLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBQYWRTcXVhcmUgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgdGFnIHRvIGJlIHJlbmRlcmVkIHRvIHRoZSBET01cbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdGFnTmFtZTogJ2RpdidcblxuXG4gICAjIFRoZSBjbGFzc25hbWUgZm9yIHRoZSBQYWQgU3F1YXJlXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3BhZC1zcXVhcmUnXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIE1vZGVsIHdoaWNoIHRyYWNrcyBzdGF0ZSBvZiBzcXVhcmUgYW5kIGluc3RydW1lbnRzXG4gICAjIEB0eXBlIHtQYWRTcXVhcmVNb2RlbH1cblxuICAgbW9kZWw6IG51bGxcblxuXG4gICAjIFRoZSBjdXJyZW50IGljb24gY2xhc3MgYXMgYXBwbGllZCB0byB0aGUgc3F1YXJlXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGN1cnJlbnRJY29uOiBudWxsXG5cblxuICAgIyBUaGUgYXVkaW8gcGxheWJhY2sgY29tcG9uZW50XG4gICAjIEB0eXBlIHtIb3dsfVxuXG4gICBhdWRpb1BsYXliYWNrOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaHN0YXJ0JzogJ29uQ2xpY2snXG5cblxuXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkaWNvbkNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1pY29uJ1xuICAgICAgQCRpY29uICAgICAgICAgID0gQCRpY29uQ29udGFpbmVyLmZpbmQgJy5pY29uJ1xuXG4gICAgICBAXG5cblxuICAgcmVtb3ZlOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2s/LnVubG9hZCgpXG4gICAgICBzdXBlcigpXG5cblxuXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBtb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1RSSUdHRVIsIEBvblRyaWdnZXJDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9JTlNUUlVNRU5ULCBAb25JbnN0cnVtZW50Q2hhbmdlXG5cblxuXG5cbiAgIHVwZGF0ZUluc3RydW1lbnRDbGFzczogLT5cbiAgICAgIGluc3RydW1lbnQgPSBAbW9kZWwuZ2V0ICdjdXJyZW50SW5zdHJ1bWVudCdcbiAgICAgIEAkZWwuYWRkQ2xhc3MgaW5zdHJ1bWVudC5nZXQgJ2lkJ1xuXG5cblxuXG4gICByZW5kZXJJY29uOiAtPlxuICAgICAgaWYgQCRpY29uLmhhc0NsYXNzIEBjdXJyZW50SWNvblxuICAgICAgICAgQCRpY29uLnJlbW92ZUNsYXNzIEBjdXJyZW50SWNvblxuXG4gICAgICBpbnN0cnVtZW50ID0gQG1vZGVsLmdldCAnY3VycmVudEluc3RydW1lbnQnXG5cbiAgICAgIHVubGVzcyBpbnN0cnVtZW50IGlzIG51bGxcbiAgICAgICAgIEBjdXJyZW50SWNvbiA9IGluc3RydW1lbnQuZ2V0ICdpY29uJ1xuICAgICAgICAgQCRpY29uLmFkZENsYXNzIEBjdXJyZW50SWNvblxuICAgICAgICAgQCRpY29uLnRleHQgaW5zdHJ1bWVudC5nZXQgJ2xhYmVsJ1xuXG5cblxuXG4gICBzZXRTb3VuZDogLT5cbiAgICAgIEBhdWRpb1BsYXliYWNrPy51bmxvYWQoKVxuXG4gICAgICBpbnN0cnVtZW50ID0gQG1vZGVsLmdldCAnY3VycmVudEluc3RydW1lbnQnXG5cbiAgICAgIHVubGVzcyBpbnN0cnVtZW50IGlzIG51bGxcbiAgICAgICAgIGF1ZGlvU3JjID0gaW5zdHJ1bWVudC5nZXQgJ3NyYydcblxuICAgICAgICAgIyBUT0RPOiBUZXN0IG1ldGhvZHNcbiAgICAgICAgIGlmIHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Rlc3QnKSBpc250IC0xIHRoZW4gYXVkaW9TcmMgPSAnJ1xuXG4gICAgICAgICBAYXVkaW9QbGF5YmFjayA9IG5ldyBIb3dsXG4gICAgICAgICAgICB2b2x1bWU6IEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLm1lZGl1bVxuICAgICAgICAgICAgdXJsczogW2F1ZGlvU3JjXVxuICAgICAgICAgICAgb25lbmQ6IEBvblNvdW5kRW5kXG5cblxuXG4gICByZW1vdmVTb3VuZDogLT5cbiAgICAgIEBhdWRpb1BsYXliYWNrPy51bmxvYWQoKVxuXG4gICAgICBpZCAgID0gQG1vZGVsLmdldCgnY3VycmVudEluc3RydW1lbnQnKS5nZXQgJ2lkJ1xuICAgICAgaWNvbiA9IEBtb2RlbC5nZXQoJ2N1cnJlbnRJbnN0cnVtZW50JykuZ2V0ICdpY29uJ1xuXG4gICAgICBAJGVsLnJlbW92ZUNsYXNzIGlkXG4gICAgICBAJGljb24ucmVtb3ZlQ2xhc3MgaWNvblxuXG4gICAgICBfLmRlZmVyID0+XG4gICAgICAgICBAbW9kZWwuc2V0ICdjdXJyZW50SW5zdHJ1bWVudCcsIG51bGxcblxuXG5cblxuICAgcGxheVNvdW5kOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2s/LnBsYXkoKVxuICAgICAgQG1vZGVsLnNldCAndHJpZ2dlcicsIGZhbHNlXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgb25DbGljazogKGV2ZW50KSA9PlxuICAgICAgQG1vZGVsLnNldCAndHJpZ2dlcicsIHRydWVcblxuXG5cblxuICAgb25Ib2xkOiAoZXZlbnQpID0+XG4gICAgICBAbW9kZWwuc2V0ICdkcmFnZ2luZycsIHRydWVcblxuXG5cblxuICAgb25EcmFnOiAoZXZlbnQpIC0+XG4gICAgICBAbW9kZWwuc2V0ICdkcmFnZ2luZycsIHRydWVcblxuXG5cblxuICAgb25Ecm9wOiAoaWQpIC0+XG4gICAgICBpbnN0cnVtZW50TW9kZWwgPSBAY29sbGVjdGlvbi5maW5kSW5zdHJ1bWVudE1vZGVsIGlkXG5cbiAgICAgICMgU2V0IGRyb3BwZWQgc3RhdHVzIHNvIHRoYXQgYmktZGlyZWN0aW9uYWxcbiAgICAgICMgY2hhbmdlIGNhbiBiZSB0cmlnZ2VyZWQgZnJvbSB0aGUgTGl2ZVBhZFxuICAgICAgIyBraXQgcmVuZGVyXG5cbiAgICAgIGluc3RydW1lbnRNb2RlbC5zZXQgJ2Ryb3BwZWQnLCB0cnVlXG5cbiAgICAgIEBtb2RlbC5zZXRcbiAgICAgICAgICdkcmFnZ2luZyc6IGZhbHNlXG4gICAgICAgICAnZHJvcHBlZCc6IHRydWVcbiAgICAgICAgICdjdXJyZW50SW5zdHJ1bWVudCc6IGluc3RydW1lbnRNb2RlbFxuXG5cblxuXG4gICBvblRyaWdnZXJDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIHRyaWdnZXIgPSBtb2RlbC5jaGFuZ2VkLnRyaWdnZXJcblxuICAgICAgaWYgdHJpZ2dlclxuICAgICAgICAgQHBsYXlTb3VuZCgpXG5cblxuXG4gICBvbkluc3RydW1lbnRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIGluc3RydW1lbnQgPSBtb2RlbC5jaGFuZ2VkLmN1cnJlbnRJbnN0cnVtZW50XG5cbiAgICAgIHVubGVzcyBpbnN0cnVtZW50IGlzIG51bGwgb3IgaW5zdHJ1bWVudCBpcyB1bmRlZmluZWRcbiAgICAgICAgIEB1cGRhdGVJbnN0cnVtZW50Q2xhc3MoKVxuICAgICAgICAgQHJlbmRlckljb24oKVxuICAgICAgICAgQHNldFNvdW5kKClcblxuXG5cblxuICAgb25Tb3VuZEVuZDogPT5cbiAgICAgIEBtb2RlbC5zZXQgJ3RyaWdnZXInLCBmYWxzZVxuXG5cblxuXG4gICAjIFBSSVZBVEUgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFkU3F1YXJlIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8ZGl2IGNsYXNzPSdjb250YWluZXIta2l0Jz5cXG5cdFx0PGgzPlxcblx0XHRcdDxiPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI8L2I+XFxuXHRcdDwvaDM+XFxuXFxuXHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsIGRlcHRoMC5pbnN0cnVtZW50cywge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDIsIHByb2dyYW0yLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC9kaXY+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0yKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0XHQ8ZGl2IGNsYXNzPSdpbnN0cnVtZW50JyBpZD1cXFwiXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmlkKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5pZDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCI+XFxuXHRcdFx0XHRcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmxhYmVsOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHRcdFx0PC9kaXY+XFxuXHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaW5zdHJ1bWVudFRhYmxlLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IHJldHVybiBzdGFjazE7IH1cbiAgZWxzZSB7IHJldHVybiAnJzsgfVxuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPHRhYmxlIGNsYXNzPSdjb250YWluZXItcGFkcyc+XFxuXFxuPC90YWJsZT5cXG5cXG48ZGl2IGNsYXNzPSdjb250YWluZXItaW5zdHJ1bWVudHMnPlxcblxcbjwvZGl2PlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPSdrZXktY29kZSc+XFxuXHRcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMua2V5Y29kZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAua2V5Y29kZTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci1pY29uJz5cXG5cdDxkaXYgY2xhc3M9J2ljb24nPlxcblxcblx0PC9kaXY+XFxuPC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc3RhY2syLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDx0cj5cXG5cdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgZGVwdGgwLnRkcywge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDIsIHByb2dyYW0yLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC90cj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTIoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdDx0ZCBjbGFzcz0nY29udGFpbmVyLXBhZCcgaWQ9XFxcIlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5pZCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWQ7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiPlxcblxcblx0XHRcdDwvdGQ+XFxuXHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgc3RhY2syID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCAoKHN0YWNrMSA9IGRlcHRoMC5wYWRUYWJsZSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5yb3dzKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIiMjIypcbiAqIEluZGl2aWR1YWwgc2VxdWVuY2VyIHRyYWNrc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBFdmVudCAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGF0dGVybi1zcXVhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmUgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgY29udGFpbmVyIGNsYXNzbmFtZVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdwYXR0ZXJuLXNxdWFyZSdcblxuXG4gICAjIFRoZSBET00gdGFnIGFuZW1cbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdGFnTmFtZTogJ3RkJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBUaGUgYXVkaW8gcGxheWJhY2sgaW5zdGFuY2UgKEhvd2xlcilcbiAgICMgQHR5cGUge0hvd2x9XG5cbiAgIGF1ZGlvUGxheWJhY2s6IG51bGxcblxuXG4gICAjIFRoZSBtb2RlbCB3aGljaCBjb250cm9scyB2b2x1bWUsIHBsYXliYWNrLCBldGNcbiAgICMgQHR5cGUge1BhdHRlcm5TcXVhcmVNb2RlbH1cblxuICAgcGF0dGVyblNxdWFyZU1vZGVsOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCc6ICdvbkNsaWNrJ1xuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGFuZCBpbnN0YW50aWF0ZXMgdGhlIGhvd2xlciBhdWRpbyBlbmdpbmVcbiAgICMgQHBhdHRlcm5TcXVhcmVNb2RlbCB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIGF1ZGlvU3JjID0gQHBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ2luc3RydW1lbnQnKS5nZXQgJ3NyYydcblxuICAgICAgIyBUT0RPOiBUZXN0IG1ldGhvZHNcbiAgICAgIGlmIHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Rlc3QnKSBpc250IC0xIHRoZW4gYXVkaW9TcmMgPSAnJ1xuXG4gICAgICBAYXVkaW9QbGF5YmFjayA9IG5ldyBIb3dsXG4gICAgICAgICB2b2x1bWU6IEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLmxvd1xuICAgICAgICAgdXJsczogW2F1ZGlvU3JjXVxuICAgICAgICAgb25lbmQ6IEBvblNvdW5kRW5kXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW1vdmUgdGhlIHZpZXcgYW5kIGRlc3Ryb3kgdGhlIGF1ZGlvIHBsYXliYWNrXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIEBhdWRpb1BsYXliYWNrLnVubG9hZCgpXG4gICAgICBzdXBlcigpXG5cblxuXG5cbiAgICMgQWRkcyBldmVudCBsaXN0ZW5lcnMgYW5kIGJlZ2lucyBsaXN0ZW5pbmcgZm9yIHZlbG9jaXR5LCBhY3Rpdml0eSBhbmQgdHJpZ2dlcnNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1ZFTE9DSVRZLCBAb25WZWxvY2l0eUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9BQ1RJVkUsICAgQG9uQWN0aXZlQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1RSSUdHRVIsICBAb25UcmlnZ2VyQ2hhbmdlXG5cblxuXG5cbiAgICMgRW5hYmxlIHBsYXliYWNrIG9mIHRoZSBhdWRpbyBzcXVhcmVcblxuICAgZW5hYmxlOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5lbmFibGUoKVxuXG5cblxuXG4gICAjIERpc2FibGUgcGxheWJhY2sgb2YgdGhlIGF1ZGlvIHNxdWFyZVxuXG4gICBkaXNhYmxlOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5kaXNhYmxlKClcblxuXG5cblxuICAgIyBQbGF5YmFjayBhdWRpbyBvbiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgIHBsYXk6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjay5wbGF5KClcblxuICAgICAgVHdlZW5NYXgudG8gQCRlbCwgLjIsXG4gICAgICAgICBlYXNlOiBCYWNrLmVhc2VJblxuICAgICAgICAgc2NhbGU6IC41XG5cbiAgICAgICAgIG9uQ29tcGxldGU6ID0+XG5cbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEAkZWwsIC4yLFxuICAgICAgICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGNsaWNrIGV2ZW50cyBvbiB0aGUgYXVkaW8gc3F1YXJlLiAgVG9nZ2xlcyB0aGVcbiAgICMgdm9sdW1lIGZyb20gbG93IHRvIGhpZ2ggdG8gb2ZmXG5cbiAgIG9uQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuY3ljbGUoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHZlbG9jaXR5IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSB2aXN1YWwgZGlzcGxheSBhbmQgc2V0cyB2b2x1bWVcbiAgICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uVmVsb2NpdHlDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIHZlbG9jaXR5ID0gbW9kZWwuY2hhbmdlZC52ZWxvY2l0eVxuXG4gICAgICBAJGVsLnJlbW92ZUNsYXNzICd2ZWxvY2l0eS1sb3cgdmVsb2NpdHktbWVkaXVtIHZlbG9jaXR5LWhpZ2gnXG5cbiAgICAgICMgU2V0IHZpc3VhbCBpbmRpY2F0b3JcbiAgICAgIHZlbG9jaXR5Q2xhc3MgPSBzd2l0Y2ggdmVsb2NpdHlcbiAgICAgICAgIHdoZW4gMSB0aGVuICd2ZWxvY2l0eS1sb3cnXG4gICAgICAgICB3aGVuIDIgdGhlbiAndmVsb2NpdHktbWVkaXVtJ1xuICAgICAgICAgd2hlbiAzIHRoZW4gJ3ZlbG9jaXR5LWhpZ2gnXG4gICAgICAgICBlbHNlICcnXG5cbiAgICAgIEAkZWwuYWRkQ2xhc3MgdmVsb2NpdHlDbGFzc1xuXG5cbiAgICAgICMgU2V0IGF1ZGlvIHZvbHVtZVxuICAgICAgdm9sdW1lID0gc3dpdGNoIHZlbG9jaXR5XG4gICAgICAgICB3aGVuIDEgdGhlbiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5sb3dcbiAgICAgICAgIHdoZW4gMiB0aGVuIEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLm1lZGl1bVxuICAgICAgICAgd2hlbiAzIHRoZW4gQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMuaGlnaFxuICAgICAgICAgZWxzZSAnJ1xuXG4gICAgICBAYXVkaW9QbGF5YmFjay52b2x1bWUoIHZvbHVtZSApXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgYWN0aXZpdHkgY2hhbmdlIGV2ZW50cy4gIFdoZW4gaW5hY3RpdmUsIGNoZWNrcyBhZ2FpbnN0IHBsYXliYWNrIGFyZVxuICAgIyBub3QgcGVyZm9ybWVkIGFuZCB0aGUgc3F1YXJlIGlzIHNraXBwZWQuXG4gICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gICBvbkFjdGl2ZUNoYW5nZTogKG1vZGVsKSAtPlxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHRyaWdnZXIgXCJwbGF5YmFja1wiIGV2ZW50c1xuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25UcmlnZ2VyQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBpZiBtb2RlbC5jaGFuZ2VkLnRyaWdnZXIgaXMgdHJ1ZVxuICAgICAgICAgQHBsYXkoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHNvdW5kIHBsYXliYWNrIGVuZCBldmVudHMuICBSZW1vdmVzIHRoZSB0cmlnZ2VyXG4gICAjIGZsYWcgc28gdGhlIGF1ZGlvIHdvbid0IG92ZXJsYXBcblxuICAgb25Tb3VuZEVuZDogPT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlIiwiIyMjKlxuICogSW5kaXZpZHVhbCBzZXF1ZW5jZXIgdHJhY2tzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwRXZlbnQgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGF0dGVyblNxdWFyZSAgICAgICAgICAgPSByZXF1aXJlICcuL1BhdHRlcm5TcXVhcmUuY29mZmVlJ1xuVmlldyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3BhdHRlcm4tdHJhY2stdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFBhdHRlcm5UcmFjayBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBuYW1lIG9mIHRoZSBjbGFzc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdwYXR0ZXJuLXRyYWNrJ1xuXG5cbiAgICMgVGhlIHR5cGUgb2YgdGFnXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHRhZ05hbWU6ICd0cidcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgQSBjb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgdmlldyBzcXVhcmVzXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgcGF0dGVyblNxdWFyZVZpZXdzOiBudWxsXG5cblxuICAgIyBAdHlwZSB7UGF0dGVyblNxdWFyZUNvbGxlY3Rpb259XG4gICBjb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICAgbW9kZWw6IG51bGxcblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCAubGFiZWwtaW5zdHJ1bWVudCc6ICdvbkxhYmVsQ2xpY2snXG4gICAgICAndG91Y2hlbmQgLmJ0bi1tdXRlJzogICAgICAgICAnb25NdXRlQnRuQ2xpY2snXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBhbmQgcmVuZGVycyBvdXQgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRsYWJlbCA9IEAkZWwuZmluZCAnLmxhYmVsLWluc3RydW1lbnQnXG5cbiAgICAgIEByZW5kZXJQYXR0ZXJuU3F1YXJlcygpXG5cbiAgICAgIEBcblxuXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIF8uZWFjaCBAcGF0dGVyblNxdWFyZVZpZXdzLCAoc3F1YXJlKSA9PlxuICAgICAgICAgc3F1YXJlLnJlbW92ZSgpXG5cbiAgICAgIHN1cGVyKClcblxuXG5cblxuICAgIyBBZGQgbGlzdGVuZXJzIHRvIHRoZSB2aWV3IHdoaWNoIGxpc3RlbiBmb3IgdmlldyBjaGFuZ2VzXG4gICAjIGFzIHdlbGwgYXMgY2hhbmdlcyB0byB0aGUgY29sbGVjdGlvbiwgd2hpY2ggc2hvdWxkIHVwZGF0ZVxuICAgIyBwYXR0ZXJuIHNxdWFyZXMgd2l0aG91dCByZS1yZW5kZXJpbmcgdGhlIHZpZXdzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGtpdE1vZGVsID0gQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKVxuXG4gICAgICBAbGlzdGVuVG8gQG1vZGVsLCAgICBBcHBFdmVudC5DSEFOR0VfRk9DVVMsICAgICAgQG9uRm9jdXNDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsICAgIEFwcEV2ZW50LkNIQU5HRV9NVVRFLCAgICAgICBAb25NdXRlQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGtpdE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cblxuXG4gICAjIFJlbmRlciBvdXQgdGhlIHBhdHRlcm4gc3F1YXJlcyBhbmQgcHVzaCB0aGVtIGludG8gYW4gYXJyYXlcbiAgICMgZm9yIGZ1cnRoZXIgaXRlcmF0aW9uXG5cbiAgIHJlbmRlclBhdHRlcm5TcXVhcmVzOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVWaWV3cyA9IFtdXG5cbiAgICAgIEBjb2xsZWN0aW9uID0gbmV3IFBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uXG5cbiAgICAgIF8oOCkudGltZXMgPT5cbiAgICAgICAgIEBjb2xsZWN0aW9uLmFkZCBuZXcgUGF0dGVyblNxdWFyZU1vZGVsIHsgaW5zdHJ1bWVudDogQG1vZGVsIH1cblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAobW9kZWwpID0+XG4gICAgICAgICBwYXR0ZXJuU3F1YXJlID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgICAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbW9kZWxcblxuICAgICAgICAgQCRsYWJlbC50ZXh0IG1vZGVsLmdldCAnbGFiZWwnXG4gICAgICAgICBAJGVsLmFwcGVuZCBwYXR0ZXJuU3F1YXJlLnJlbmRlcigpLmVsXG4gICAgICAgICBAcGF0dGVyblNxdWFyZVZpZXdzLnB1c2ggcGF0dGVyblNxdWFyZVxuXG4gICAgICAjIFNldCB0aGUgc3F1YXJlcyBvbiB0aGUgSW5zdHJ1bWVudCBtb2RlbCB0byB0cmFjayBhZ2FpbnN0IHN0YXRlXG4gICAgICBAbW9kZWwuc2V0ICdwYXR0ZXJuU3F1YXJlcycsIEBjb2xsZWN0aW9uXG5cblxuXG4gICAjIE11dGUgdGhlIGVudGlyZSB0cmFja1xuXG4gICBtdXRlOiAtPlxuICAgICAgQG1vZGVsLnNldCAnbXV0ZScsIHRydWVcblxuXG5cbiAgICMgVW5tdXRlIHRoZSBlbnRpcmUgdHJhY2tcblxuICAgdW5tdXRlOiAtPlxuICAgICAgQG1vZGVsLnNldCAnbXV0ZScsIGZhbHNlXG5cblxuXG4gICBzZWxlY3Q6IC0+XG4gICAgICBAJGVsLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG5cbiAgIGRlc2VsZWN0OiAtPlxuICAgICAgaWYgQCRlbC5oYXNDbGFzcyAnc2VsZWN0ZWQnXG4gICAgICAgICBAJGVsLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcblxuXG5cbiAgIGZvY3VzOiAtPlxuICAgICAgQCRlbC5hZGRDbGFzcyAnZm9jdXMnXG5cblxuXG5cbiAgIHVuZm9jdXM6IC0+XG4gICAgICBpZiBAJGVsLmhhc0NsYXNzICdmb2N1cydcbiAgICAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgJ2ZvY3VzJ1xuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGNoYW5nZXMgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBpbnN0cnVtZW50XG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBpbnN0cnVtZW50TW9kZWxcblxuICAgb25JbnN0cnVtZW50Q2hhbmdlOiAoaW5zdHJ1bWVudE1vZGVsKSA9PlxuICAgICAgaW5zdHJ1bWVudCA9IGluc3RydW1lbnRNb2RlbC5jaGFuZ2VkLmN1cnJlbnRJbnN0cnVtZW50XG5cbiAgICAgIGlmIGluc3RydW1lbnQuY2lkIGlzIEBtb2RlbC5jaWRcbiAgICAgICAgIEBzZWxlY3QoKVxuXG4gICAgICBlbHNlIEBkZXNlbGVjdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBtb2RlbCBjaGFuZ2UgZXZlbnRzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbk11dGVDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIG11dGUgPSBtb2RlbC5jaGFuZ2VkLm11dGVcblxuICAgICAgaWYgbXV0ZVxuICAgICAgICAgQCRlbC5hZGRDbGFzcyAnbXV0ZSdcblxuICAgICAgZWxzZSBAJGVsLnJlbW92ZUNsYXNzICdtdXRlJ1xuXG5cblxuICAgIyBIYW5kbGVyIGZvciBmb2N1cyBjaGFuZ2UgZXZlbnRzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbkZvY3VzQ2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBpZiBtb2RlbC5jaGFuZ2VkLmZvY3VzXG4gICAgICAgICAgQGZvY3VzKClcbiAgICAgIGVsc2VcbiAgICAgICAgICBAdW5mb2N1cygpXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgYnV0dG9uIGNsaWNrc1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25MYWJlbENsaWNrOiAoZXZlbnQpID0+XG4gICAgICBpZiBAbW9kZWwuZ2V0KCdtdXRlJykgaXNudCB0cnVlXG4gICAgICAgICBAbW9kZWwuc2V0ICdmb2N1cycsICEgQG1vZGVsLmdldCgnZm9jdXMnKVxuXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBidXR0b24gY2xpY2tzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbk11dGVCdG5DbGljazogKGV2ZW50KSA9PlxuICAgICAgaWYgQG1vZGVsLmdldCAnbXV0ZSdcbiAgICAgICAgIEB1bm11dGUoKVxuXG4gICAgICBlbHNlIEBtdXRlKClcblxuXG5cblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5UcmFjayIsIiMjIypcbiAqIFNlcXVlbmNlciBwYXJlbnQgdmlldyBmb3IgdHJhY2sgc2VxdWVuY2VzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuUGF0dGVyblRyYWNrID0gcmVxdWlyZSAnLi9QYXR0ZXJuVHJhY2suY29mZmVlJ1xuQXBwRXZlbnQgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbmhlbHBlcnMgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2hlbHBlcnMvaGFuZGxlYmFycy1oZWxwZXJzJ1xudGVtcGxhdGUgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2VxdWVuY2VyLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBTZXF1ZW5jZXIgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgbmFtZSBvZiB0aGUgY29udGFpbmVyIGNsYXNzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3NlcXVlbmNlci1jb250YWluZXInXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIEFuIGFycmF5IG9mIGFsbCBwYXR0ZXJuIHRyYWNrc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBwYXR0ZXJuVHJhY2tWaWV3czogbnVsbFxuXG5cbiAgICMgVGhlIHNldEludGVydmFsIHRpY2tlclxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBicG1JbnRlcnZhbDogbnVsbFxuXG5cbiAgICMgVGhlIHRpbWUgaW4gd2hpY2ggdGhlIGludGVydmFsIGZpcmVzXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIHVwZGF0ZUludGVydmFsVGltZTogMjAwXG5cblxuICAgIyBUaGUgY3VycmVudCBiZWF0IGlkXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGN1cnJCZWF0Q2VsbElkOiAtMVxuXG5cbiAgICMgVE9ETzogVXBkYXRlIHRoaXMgdG8gbWFrZSBpdCBtb3JlIGR5bmFtaWNcbiAgICMgVGhlIG51bWJlciBvZiBiZWF0IGNlbGxzXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIG51bUNlbGxzOiA3XG5cblxuICAgIyBHbG9iYWwgYXBwbGljYXRpb24gbW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgQ29sbGVjdGlvbiBvZiBpbnN0cnVtZW50c1xuICAgIyBAdHlwZSB7SW5zdHJ1bWVudENvbGxlY3Rpb259XG5cbiAgIGNvbGxlY3Rpb246IG51bGxcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fVxuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJHRoU3RlcHBlciA9IEAkZWwuZmluZCAndGguc3RlcHBlcidcbiAgICAgIEAkc2VxdWVuY2VyID0gQCRlbC5maW5kICcuc2VxdWVuY2VyJ1xuXG4gICAgICBAcmVuZGVyVHJhY2tzKClcbiAgICAgIEBwbGF5KClcblxuICAgICAgQFxuXG5cbiAgICMgUmVtb3ZlcyB0aGUgdmlldyBmcm9tIHRoZSBET00gYW5kIGNhbmNlbHNcbiAgICMgdGhlIHRpY2tlciBpbnRlcnZhbFxuXG4gICByZW1vdmU6IC0+XG4gICAgICBfLmVhY2ggQHBhdHRlcm5UcmFja1ZpZXdzLCAodHJhY2spID0+XG4gICAgICAgICB0cmFjay5yZW1vdmUoKVxuXG4gICAgICBAcGF1c2UoKVxuXG4gICAgICBzdXBlcigpXG5cblxuXG4gICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRsaW5nIGluc3RydW1lbnQgYW5kIHBsYXliYWNrXG4gICAjIGNoYW5nZXMuICBVcGRhdGVzIGFsbCBvZiB0aGUgdmlld3MgYWNjb3JkaW5nbHlcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAgIEFwcEV2ZW50LkNIQU5HRV9CUE0sICAgICBAb25CUE1DaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsICAgQXBwRXZlbnQuQ0hBTkdFX1BMQVlJTkcsIEBvblBsYXlpbmdDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsICAgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgICAgIEBvbktpdENoYW5nZVxuICAgICAgQGxpc3RlblRvIEBjb2xsZWN0aW9uLCBBcHBFdmVudC5DSEFOR0VfRk9DVVMsICAgQG9uRm9jdXNDaGFuZ2VcblxuXG5cbiAgICMgUmVuZGVycyBvdXQgZWFjaCBpbmRpdmlkdWFsIHRyYWNrLlxuICAgIyBUT0RPOiBOZWVkIHRvIHVwZGF0ZSBzbyB0aGF0IGFsbCBvZiB0aGUgYmVhdCBzcXVhcmVzIGFyZW4ndFxuICAgIyBibG93biBhd2F5IGJ5IHRoZSByZS1yZW5kZXJcblxuICAgcmVuZGVyVHJhY2tzOiA9PlxuICAgICAgQCRlbC5maW5kKCcucGF0dGVybi10cmFjaycpLnJlbW92ZSgpXG5cbiAgICAgIEBwYXR0ZXJuVHJhY2tWaWV3cyA9IFtdXG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKG1vZGVsKSA9PlxuXG4gICAgICAgICBwYXR0ZXJuVHJhY2sgPSBuZXcgUGF0dGVyblRyYWNrXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBtb2RlbC5nZXQgJ3BhdHRlcm5TcXVhcmVzJ1xuICAgICAgICAgICAgbW9kZWw6IG1vZGVsXG5cbiAgICAgICAgIEBwYXR0ZXJuVHJhY2tWaWV3cy5wdXNoIHBhdHRlcm5UcmFja1xuICAgICAgICAgQCRzZXF1ZW5jZXIuYXBwZW5kIHBhdHRlcm5UcmFjay5yZW5kZXIoKS5lbFxuXG5cblxuXG4gICAjIFVwZGF0ZSB0aGUgdGlja2VyIHRpbWUsIGFuZCBhZHZhbmNlcyB0aGUgYmVhdFxuXG4gICB1cGRhdGVUaW1lOiA9PlxuICAgICAgQCR0aFN0ZXBwZXIucmVtb3ZlQ2xhc3MgJ3N0ZXAnXG4gICAgICBAY3VyckJlYXRDZWxsSWQgPSBpZiBAY3VyckJlYXRDZWxsSWQgPCBAbnVtQ2VsbHMgdGhlbiBAY3VyckJlYXRDZWxsSWQgKz0gMSBlbHNlIEBjdXJyQmVhdENlbGxJZCA9IDBcbiAgICAgICQoQCR0aFN0ZXBwZXJbQGN1cnJCZWF0Q2VsbElkXSkuYWRkQ2xhc3MgJ3N0ZXAnXG5cbiAgICAgIEBwbGF5QXVkaW8oKVxuXG5cblxuXG4gICAjIENvbnZlcnRzIG1pbGxpc2Vjb25kcyB0byBCUE1cblxuICAgY29udmVydEJQTTogLT5cbiAgICAgIHJldHVybiAyMDBcblxuXG5cbiAgICMgU3RhcnQgcGxheWJhY2sgb2Ygc2VxdWVuY2VyXG5cbiAgIHBsYXk6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgdHJ1ZVxuXG5cblxuXG4gICAjIFBhdXNlcyBzZXF1ZW5jZXIgcGxheWJhY2tcblxuICAgcGF1c2U6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgZmFsc2VcblxuXG5cblxuICAgIyBNdXRlcyB0aGUgc2VxdWVuY2VyXG5cbiAgIG11dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdtdXRlJywgdHJ1ZVxuXG5cblxuXG4gICAjIFVubXV0ZXMgdGhlIHNlcXVlbmNlclxuXG4gICB1bm11dGU6IC0+XG4gICAgICAgQGFwcE1vZGVsLnNldCAnbXV0ZScsIGZhbHNlXG5cblxuXG5cblxuICAgIyBQbGF5cyBhdWRpbyBvZiBlYWNoIHRyYWNrIGN1cnJlbnRseSBlbmFibGVkIGFuZCBvblxuXG4gICBwbGF5QXVkaW86IC0+XG4gICAgICBmb2N1c2VkSW5zdHJ1bWVudCA9ICBAY29sbGVjdGlvbi5maW5kV2hlcmUgeyBmb2N1czogdHJ1ZSB9XG5cbiAgICAgICMgQ2hlY2sgaWYgdGhlcmUncyBhIGZvY3VzZWQgdHJhY2sgYW5kIG9ubHlcbiAgICAgICMgcGxheSBhdWRpbyBmcm9tIHRoZXJlXG5cbiAgICAgIGlmIGZvY3VzZWRJbnN0cnVtZW50XG4gICAgICAgICBpZiBmb2N1c2VkSW5zdHJ1bWVudC5nZXQoJ211dGUnKSBpc250IHRydWVcbiAgICAgICAgICAgIGZvY3VzZWRJbnN0cnVtZW50LmdldCgncGF0dGVyblNxdWFyZXMnKS5lYWNoIChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgPT5cbiAgICAgICAgICAgICAgIEBwbGF5UGF0dGVyblNxdWFyZUF1ZGlvKCBwYXR0ZXJuU3F1YXJlLCBpbmRleCApXG5cbiAgICAgICAgIHJldHVyblxuXG5cbiAgICAgICMgSWYgbm90aGluZyBpcyBmb2N1c2VkLCB0aGVuIGNoZWNrIGFnYWluc3RcbiAgICAgICMgdGhlIGVudGlyZSBtYXRyaXhcblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgICAgIGlmIGluc3RydW1lbnQuZ2V0KCdtdXRlJykgaXNudCB0cnVlXG4gICAgICAgICAgICBpbnN0cnVtZW50LmdldCgncGF0dGVyblNxdWFyZXMnKS5lYWNoIChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgPT5cbiAgICAgICAgICAgICAgIEBwbGF5UGF0dGVyblNxdWFyZUF1ZGlvKCBwYXR0ZXJuU3F1YXJlLCBpbmRleCApXG5cblxuXG5cbiAgICMgUGxheXMgdGhlIGF1ZGlvIG9uIGFuIGluZGl2aWR1YWwgUGF0dGVyU3F1YXJlIGlmIHRlbXBvIGluZGV4XG4gICAjIGlzIHRoZSBzYW1lIGFzIHRoZSBpbmRleCB3aXRoaW4gdGhlIGNvbGxlY3Rpb25cbiAgICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlfSBwYXR0ZXJuU3F1YXJlXG4gICAjIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuXG4gICBwbGF5UGF0dGVyblNxdWFyZUF1ZGlvOiAocGF0dGVyblNxdWFyZSwgaW5kZXgpIC0+XG4gICAgICBpZiBAY3VyckJlYXRDZWxsSWQgaXMgaW5kZXhcbiAgICAgICAgIGlmIHBhdHRlcm5TcXVhcmUuZ2V0ICdhY3RpdmUnXG4gICAgICAgICAgICBwYXR0ZXJuU3F1YXJlLnNldCAndHJpZ2dlcicsIHRydWVcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBCUE0gdGVtcG8gY2hhbmdlc1xuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvbkJQTUNoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgY2xlYXJJbnRlcnZhbCBAYnBtSW50ZXJ2YWxcbiAgICAgIEB1cGRhdGVJbnRlcnZhbFRpbWUgPSBtb2RlbC5jaGFuZ2VkLmJwbVxuICAgICAgQGJwbUludGVydmFsID0gc2V0SW50ZXJ2YWwgQHVwZGF0ZVRpbWUsIEB1cGRhdGVJbnRlcnZhbFRpbWVcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBwbGF5YmFjayBjaGFuZ2VzLiAgSWYgcGF1c2VkLCBpdCBzdG9wcyBwbGF5YmFjayBhbmRcbiAgICMgY2xlYXJzIHRoZSBpbnRlcnZhbC4gIElmIHBsYXlpbmcsIGl0IHJlc2V0cyBpdFxuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvblBsYXlpbmdDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIHBsYXlpbmcgPSBtb2RlbC5jaGFuZ2VkLnBsYXlpbmdcblxuICAgICAgaWYgcGxheWluZ1xuICAgICAgICAgQGJwbUludGVydmFsID0gc2V0SW50ZXJ2YWwgQHVwZGF0ZVRpbWUsIEB1cGRhdGVJbnRlcnZhbFRpbWVcblxuICAgICAgZWxzZVxuICAgICAgICAgY2xlYXJJbnRlcnZhbCBAYnBtSW50ZXJ2YWxcbiAgICAgICAgIEBicG1JbnRlcnZhbCA9IG51bGxcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtdXRlIGFuZCB1bm11dGUgY2hhbmdlc1xuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvbk11dGVDaGFuZ2U6IChtb2RlbCkgPT5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlcywgYXMgc2V0IGZyb20gdGhlIEtpdFNlbGVjdG9yXG4gICAjIEBwYXJhbSB7S2l0TW9kZWx9IG1vZGVsXG5cbiAgIG9uS2l0Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAY29sbGVjdGlvbiA9IG1vZGVsLmNoYW5nZWQua2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpXG4gICAgICBAcmVuZGVyVHJhY2tzKClcblxuICAgICAgIyBFeHBvcnQgb2xkIHBhdHRlcm4gc3F1YXJlcyBzbyB0aGUgdXNlcnMgcGF0dGVybiBpc24ndCBibG93biBhd2F5XG4gICAgICAjIHdoZW4ga2l0IGNoYW5nZXMgb2NjdXJcblxuICAgICAgb2xkSW5zdHJ1bWVudENvbGxlY3Rpb24gPSBtb2RlbC5fcHJldmlvdXNBdHRyaWJ1dGVzLmtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKVxuICAgICAgb2xkUGF0dGVyblNxdWFyZXMgPSBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbi5leHBvcnRQYXR0ZXJuU3F1YXJlcygpXG5cblxuICAgICAgIyBVcGRhdGUgdGhlIG5ldyBjb2xsZWN0aW9uIHdpdGggb2xkIHBhdHRlcm4gc3F1YXJlIGRhdGFcbiAgICAgICMgYW5kIHRyaWdnZXIgVUkgdXBkYXRlcyBvbiBlYWNoIHNxdWFyZVxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChpbnN0cnVtZW50TW9kZWwsIGluZGV4KSAtPlxuICAgICAgICAgb2xkQ29sbGVjdGlvbiA9IG9sZFBhdHRlcm5TcXVhcmVzW2luZGV4XVxuICAgICAgICAgbmV3Q29sbGVjdGlvbiA9IGluc3RydW1lbnRNb2RlbC5nZXQgJ3BhdHRlcm5TcXVhcmVzJ1xuXG4gICAgICAgICAjIFVwZGF0ZSB0cmFjayAvIGluc3RydW1lbnQgbGV2ZWwgcHJvcGVydGllcyBsaWtlIHZvbHVtZSAvIG11dGUgLyBmb2N1c1xuICAgICAgICAgb2xkUHJvcHMgPSBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbi5hdChpbmRleClcblxuICAgICAgICAgdW5sZXNzIG9sZFByb3BzIGlzIHVuZGVmaW5lZFxuXG4gICAgICAgICAgICBvbGRQcm9wcyA9IG9sZFByb3BzLnRvSlNPTigpXG5cbiAgICAgICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICAgICAgIHZvbHVtZTogb2xkUHJvcHMudm9sdW1lXG4gICAgICAgICAgICAgICBhY3RpdmU6IG9sZFByb3BzLmFjdGl2ZVxuICAgICAgICAgICAgICAgbXV0ZTogICBvbGRQcm9wcy5tdXRlXG4gICAgICAgICAgICAgICBmb2N1czogIG9sZFByb3BzLmZvY3VzXG5cbiAgICAgICAgICMgQ2hlY2sgZm9yIGluY29uc2lzdGFuY2llcyBiZXR3ZWVuIG51bWJlciBvZiBpbnN0cnVtZW50c1xuICAgICAgICAgdW5sZXNzIG9sZENvbGxlY3Rpb24gaXMgdW5kZWZpbmVkXG5cbiAgICAgICAgICAgIG5ld0NvbGxlY3Rpb24uZWFjaCAocGF0dGVyblNxdWFyZSwgaW5kZXgpIC0+XG4gICAgICAgICAgICAgICBvbGRQYXR0ZXJuU3F1YXJlID0gb2xkQ29sbGVjdGlvbi5hdCBpbmRleFxuICAgICAgICAgICAgICAgcGF0dGVyblNxdWFyZS5zZXQgb2xkUGF0dGVyblNxdWFyZS50b0pTT04oKVxuXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBmb2N1cyBjaGFuZ2UgZXZlbnRzLiAgSXRlcmF0ZXMgb3ZlciBhbGwgb2YgdGhlIG1vZGVscyB3aXRoaW5cbiAgICMgdGhlIEluc3RydW1lbnRDb2xsZWN0aW9uIGFuZCB0b2dnbGVzIHRoZWlyIGZvY3VzIHRvIG9mZiBpZiB0aGUgY2hhbmdlZFxuICAgIyBtb2RlbCdzIGZvY3VzIGlzIHNldCB0byB0cnVlLlxuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25Gb2N1c0NoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAoaW5zdHJ1bWVudE1vZGVsKSA9PlxuICAgICAgICAgaWYgbW9kZWwuY2hhbmdlZC5mb2N1cyBpcyB0cnVlXG4gICAgICAgICAgICBpZiBtb2RlbC5jaWQgaXNudCBpbnN0cnVtZW50TW9kZWwuY2lkXG4gICAgICAgICAgICAgICBpbnN0cnVtZW50TW9kZWwuc2V0ICdmb2N1cycsIGZhbHNlXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VxdWVuY2VyIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCI7XG5cblxuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG5cbiAgYnVmZmVyICs9IFwiPHRkIGNsYXNzPSdsYWJlbC1pbnN0cnVtZW50Jz5cXG5cdFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxuPC90ZD5cXG48dGQgY2xhc3M9J2J0bi1tdXRlJz5cXG5cdG11dGVcXG48L3RkPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIHN0YWNrMiwgb3B0aW9ucywgc2VsZj10aGlzLCBoZWxwZXJNaXNzaW5nPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJcXG5cdFx0XHQ8dGggY2xhc3M9J3N0ZXBwZXInPjwvdGg+XFxuXHRcdFwiO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPHRhYmxlIGNsYXNzPSdzZXF1ZW5jZXInPlxcblx0PHRyPlxcblx0XHQ8dGg+PC90aD5cXG5cdFx0PHRoPjwvdGg+XFxuXFxuXHRcdFwiO1xuICBvcHRpb25zID0ge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9O1xuICBzdGFjazIgPSAoKHN0YWNrMSA9IGhlbHBlcnMucmVwZWF0IHx8IGRlcHRoMC5yZXBlYXQpLHN0YWNrMSA/IHN0YWNrMS5jYWxsKGRlcHRoMCwgOCwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcInJlcGVhdFwiLCA4LCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMiB8fCBzdGFjazIgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMjsgfVxuICBidWZmZXIgKz0gXCJcXG5cdDwvdHI+XFxuXFxuPC90YWJsZT5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxidXR0b24gY2xhc3M9J2J0bi1kZWNyZWFzZSc+REVDUkVBU0U8L2J1dHRvbj5cXG48c3BhbiBjbGFzcz0nbGFiZWwtYnBtJz4wPC9zcGFuPlxcbjxidXR0b24gY2xhc3M9J2J0bi1pbmNyZWFzZSc+SU5DUkVBU0U8L2J1dHRvbj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxidXR0b24gY2xhc3M9J2J0bi1sZWZ0Jz5MRUZUPC9idXR0b24+XFxuPHNwYW4gY2xhc3M9J2xhYmVsLWtpdCc+RFJVTSBLSVQ8L3NwYW4+XFxuPGJ1dHRvbiBjbGFzcz0nYnRuLXJpZ2h0Jz5SSUdIVDwvYnV0dG9uPlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0nY29udGFpbmVyLWtpdC1zZWxlY3Rvcic+XFxuXHQ8ZGl2IGNsYXNzPSdraXQtc2VsZWN0b3InPjwvZGl2PlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci12aXN1YWxpemF0aW9uJz5WaXN1YWxpemF0aW9uPC9kaXY+XFxuXFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLXNlcXVlbmNlcic+XFxuXFxuXHQ8ZGl2IGNsYXNzPSdpbnN0cnVtZW50LXNlbGVjdG9yJz5JbnN0cnVtZW50IFNlbGVjdG9yPC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPSdzZXF1ZW5jZXInPlNlcXVlbmNlcjwvZGl2Plxcblx0PGRpdiBjbGFzcz0nYnBtJz5CUE08L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J2J0bi1zaGFyZSc+U0hBUkU8L2Rpdj5cXG5cXG48L2Rpdj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuUHViU3ViICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9QdWJTdWInXG5QdWJFdmVudCA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvbGFuZGluZy10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgTGFuZGluZ1ZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5zdGFydC1idG4nOiAnb25TdGFydEJ0bkNsaWNrJ1xuXG5cbiAgIG9uU3RhcnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgUHViU3ViLnRyaWdnZXIgUHViRXZlbnQuUk9VVEUsXG4gICAgICAgICByb3V0ZTogJ2NyZWF0ZSdcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZGluZ1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxzcGFuIGNsYXNzPSdzdGFydC1idG4nPkNSRUFURTwvc3Bhbj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBTaGFyZSB0aGUgdXNlciBjcmVhdGVkIGJlYXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2hhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFNoYXJlVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlVmlldyIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGEgaHJlZj0nLyMnPk5FVzwvYT5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVzdHMtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFRlc3RzVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0c1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxoMT5Db21wb25lbnQgVmlld2VyPC9oMT5cXG5cXG48YnIgLz5cXG48cD5cXG5cdE1ha2Ugc3VyZSB0aGF0IDxiPmh0dHBzdGVyPC9iPiBpcyBydW5uaW5nIGluIHRoZSA8Yj5zb3VyY2U8L2I+IHJvdXRlIChucG0gaW5zdGFsbCAtZyBodHRwc3RlcikgPGJyLz5cXG5cdDxhIGhyZWY9XFxcImh0dHA6Ly9sb2NhbGhvc3Q6MzMzMy90ZXN0L2h0bWwvXFxcIj5Nb2NoYSBUZXN0IFJ1bm5lcjwvYT5cXG48L3A+XFxuXFxuPGJyIC8+XFxuPHVsPlxcblx0PGxpPjxhIGhyZWY9JyNraXQtc2VsZWN0aW9uJz5LaXQgU2VsZWN0aW9uPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2JwbS1pbmRpY2F0b3JcXFwiPkJQTSBJbmRpY2F0b3I8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjaW5zdHJ1bWVudC1zZWxlY3RvclxcXCI+SW5zdHJ1bWVudCBTZWxlY3RvcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNwYXR0ZXJuLXNxdWFyZVxcXCI+UGF0dGVybiBTcXVhcmU8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjcGF0dGVybi10cmFja1xcXCI+UGF0dGVybiBUcmFjazwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNzZXF1ZW5jZXJcXFwiPlNlcXVlbmNlcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNmdWxsLXNlcXVlbmNlclxcXCI+RnVsbCBTZXF1ZW5jZXI8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjcGFkLXNxdWFyZVxcXCI+UGFkIFNxdWFyZTwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNsaXZlLXBhZFxcXCI+TGl2ZVBhZDwvYT48L2xpPlxcbjwvdWw+XCI7XG4gIH0pIiwiXG5kZXNjcmliZSAnTW9kZWxzJywgPT5cblxuICAgcmVxdWlyZSAnLi9zcGVjL21vZGVscy9LaXRDb2xsZWN0aW9uLXNwZWMuY29mZmVlJ1xuICAgcmVxdWlyZSAnLi9zcGVjL21vZGVscy9LaXRNb2RlbC1zcGVjLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnVmlld3MnLCA9PlxuXG4gICByZXF1aXJlICcuL3NwZWMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy1zcGVjLmNvZmZlZSdcbiAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci1zcGVjLmNvZmZlZSdcbiAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3Itc3BlYy5jb2ZmZWUnXG5cblxuICAgZGVzY3JpYmUgJ0xpdmUgUGFkJywgPT5cblxuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUtc3BlYy5jb2ZmZWUnXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL0xpdmVQYWQtc3BlYy5jb2ZmZWUnXG5cblxuICAgZGVzY3JpYmUgJ0luc3RydW1lbnQgU2VsZWN0b3InLCA9PlxuXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwtc3BlYy5jb2ZmZWUnXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC1zcGVjLmNvZmZlZSdcblxuXG4gICBkZXNjcmliZSAnU2VxdWVuY2VyJywgPT5cblxuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLXNwZWMuY29mZmVlJ1xuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2stc3BlYy5jb2ZmZWUnXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci1zcGVjLmNvZmZlZSdcblxuXG5cbnJlcXVpcmUgJy4vc3BlYy92aWV3cy9zaGFyZS9TaGFyZVZpZXctc3BlYy5jb2ZmZWUnXG5yZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXctc3BlYy5jb2ZmZWUnXG5cbnJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvU291bmRDb2xsZWN0aW9uLXNwZWMuY29mZmVlJ1xucmVxdWlyZSAnLi9zcGVjL21vZGVscy9Tb3VuZE1vZGVsLXNwZWMuY29mZmVlJ1xuXG4jIENvbnRyb2xsZXJzXG5yZXF1aXJlICcuL3NwZWMvQXBwQ29udHJvbGxlci1zcGVjLmNvZmZlZSdcbiIsIkFwcENvbnRyb2xsZXIgPSByZXF1aXJlICcuLi8uLi9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnQXBwIENvbnRyb2xsZXInLCAtPlxuXG4gICBpdCAnU2hvdWxkIGluaXRpYWxpemUnLCA9PiIsIkFwcENvbmZpZyAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblxuZGVzY3JpYmUgJ0tpdCBDb2xsZWN0aW9uJywgLT5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuXG4gICBpdCAnU2hvdWxkIHBhcnNlIHRoZSByZXNwb25zZSBhbmQgYXBwZW5kIGFuIGFzc2V0UGF0aCB0byBlYWNoIGtpdCBtb2RlbCcsID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ3BhdGgnKS5zaG91bGQuZXhpc3RcblxuXG4gICBpdCAnU2hvdWxkIHJldHVybiB0aGUgbmV4dCBraXQnLCA9PlxuICAgICAga2l0RGF0YSA9IEBraXRDb2xsZWN0aW9uLnRvSlNPTigpXG4gICAgICBraXQgPSBAa2l0Q29sbGVjdGlvbi5uZXh0S2l0KClcbiAgICAgIGtpdC5nZXQoJ2xhYmVsJykuc2hvdWxkLmVxdWFsIGtpdERhdGFbMV0ubGFiZWxcblxuXG4gICBpdCAnU2hvdWxkIHJldHVybiB0aGUgcHJldmlvdXMga2l0JywgPT5cbiAgICAgIGtpdERhdGEgPSBAa2l0Q29sbGVjdGlvbi50b0pTT04oKVxuICAgICAga2l0ID0gQGtpdENvbGxlY3Rpb24ucHJldmlvdXNLaXQoKVxuICAgICAga2l0LmdldCgnbGFiZWwnKS5zaG91bGQuZXF1YWwga2l0RGF0YVtraXREYXRhLmxlbmd0aC0xXS5sYWJlbCIsIkFwcENvbmZpZyAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdE1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRNb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlJ1xuXG5kZXNjcmliZSAnS2l0IE1vZGVsJywgLT5cblxuICAgYmVmb3JlRWFjaCA9PlxuXG4gICAgICBkYXRhID0ge1xuICAgICAgICAgXCJsYWJlbFwiOiBcIkhpcCBIb3BcIixcbiAgICAgICAgIFwiZm9sZGVyXCI6IFwiaGlwLWhvcFwiLFxuICAgICAgICAgXCJpbnN0cnVtZW50c1wiOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiQ2xvc2VkIEhpSGF0XCIsXG4gICAgICAgICAgICAgICBcInNyY1wiOiBcIkhBVF8yLm1wM1wiLFxuICAgICAgICAgICAgICAgXCJpY29uXCI6IFwiaWNvbi1oaWhhdC1jbG9zZWRcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJLaWNrIERydW1cIixcbiAgICAgICAgICAgICAgIFwic3JjXCI6IFwiS0lLXzIubXAzXCIsXG4gICAgICAgICAgICAgICBcImljb25cIjogXCJpY29uLWtpY2tkcnVtXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgIF1cbiAgICAgIH1cblxuICAgICAgQGtpdE1vZGVsID0gbmV3IEtpdE1vZGVsIGRhdGEsIHsgcGFyc2U6IHRydWUgfVxuXG5cbiAgIGl0ICdTaG91bGQgcGFyc2UgdGhlIG1vZGVsIGRhdGEgYW5kIGNvbnZlcnQgaW5zdHJ1bWVudHMgdG8gYW4gSW5zdHJ1bWVudHNDb2xsZWN0aW9uJywgPT5cbiAgICAgIEBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuc2hvdWxkLmJlLmFuLmluc3RhbmNlb2YgSW5zdHJ1bWVudENvbGxlY3Rpb24iLCJcblxuZGVzY3JpYmUgJ1NvdW5kIENvbGxlY3Rpb24nLCAtPlxuXG4gICBpdCAnU2hvdWxkIGluaXRpYWxpemUgd2l0aCBhIHNvdW5kIHNldCcsID0+IiwiXG5cbmRlc2NyaWJlICdTb3VuZCBNb2RlbCcsIC0+XG5cbiAgIGl0ICdTaG91bGQgaW5pdGlhbGl6ZSB3aXRoIGRlZmF1bHQgY29uZmlnIHByb3BlcnRpZXMnLCA9PiIsIkFwcENvbmZpZyA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuQ3JlYXRlVmlldyA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0NyZWF0ZSBWaWV3JywgLT5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEB2aWV3ICA9IG5ldyBDcmVhdGVWaWV3XG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBleHBlY3QoQHZpZXcuZWwpLnRvLmV4aXN0IiwiQlBNSW5kaWNhdG9yID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSdcbkFwcE1vZGVsICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5BcHBFdmVudCAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuQXBwQ29uZmlnICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cbmRlc2NyaWJlICdCUE0gSW5kaWNhdG9yJywgLT5cblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBuZXcgQXBwTW9kZWwoKVxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgaWYgQHZpZXcudXBkYXRlSW50ZXJ2YWwgdGhlbiBjbGVhckludGVydmFsIEB2aWV3LnVwZGF0ZUludGVydmFsXG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuXG4gICAgICBAdmlldy5zaG91bGQuZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgZGlzcGxheSB0aGUgY3VycmVudCBCUE0gaW4gdGhlIGxhYmVsJywgPT5cblxuICAgICAgJGxhYmVsID0gQHZpZXcuJGVsLmZpbmQgJy5sYWJlbC1icG0nXG4gICAgICAkbGFiZWwudGV4dCgpLnNob3VsZC5lcXVhbCBTdHJpbmcoNjAwMDAgLyBAdmlldy5hcHBNb2RlbC5nZXQoJ2JwbScpKVxuXG5cblxuICAgIyBpdCAnU2hvdWxkIGF1dG8tYWR2YW5jZSB0aGUgYnBtIHZpYSBzZXRJbnRlcnZhbCBvbiBwcmVzcycsIChkb25lKSA9PlxuXG4gICAjICAgIEB2aWV3LmJwbUluY3JlYXNlQW1vdW50ID0gNTBcbiAgICMgICAgQHZpZXcuaW50ZXJ2YWxVcGRhdGVUaW1lID0gMVxuICAgIyAgICBhcHBNb2RlbCA9IEB2aWV3LmFwcE1vZGVsXG4gICAjICAgIGFwcE1vZGVsLnNldCAnYnBtJywgMVxuXG4gICAjICAgIHNldFRpbWVvdXQgPT5cbiAgICMgICAgICAgYnBtID0gYXBwTW9kZWwuZ2V0ICdicG0nXG5cbiAgICMgICAgICAgaWYgYnBtID49IDEyMFxuICAgIyAgICAgICAgICBAdmlldy5vbkJ0blVwKClcbiAgICMgICAgICAgICAgZG9uZSgpXG4gICAjICAgICwgMTAwXG5cbiAgICMgICAgQHZpZXcub25JbmNyZWFzZUJ0bkRvd24oKVxuXG5cblxuICAgIyBpdCAnU2hvdWxkIGNsZWFyIHRoZSBpbnRlcnZhbCBvbiByZWxlYXNlJywgPT5cblxuICAgIyAgICBAdmlldy5vbkluY3JlYXNlQnRuRG93bigpXG4gICAjICAgIEB2aWV3LnVwZGF0ZUludGVydmFsLnNob3VsZC5leGlzdFxuICAgIyAgICBAdmlldy5vbkJ0blVwKClcbiAgICMgICAgZXhwZWN0KEB2aWV3LnVwZGF0ZUludGVydmFsKS50by5iZS5udWxsXG5cbiIsIkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0U2VsZWN0b3IgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSdcbkFwcE1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0TW9kZWwgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnS2l0IFNlbGVjdGlvbicsIC0+XG5cblxuICAgYmVmb3JlID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuXG4gICBiZWZvcmVFYWNoID0+XG5cbiAgICAgIEB2aWV3ID0gbmV3IEtpdFNlbGVjdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuXG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuXG5cbiAgIGl0ICdTaG91bGQgaGF2ZSBhIGxhYmVsJywgPT5cblxuICAgICAgJGxhYmVsID0gQHZpZXcuJGVsLmZpbmQgJy5sYWJlbC1raXQnXG4gICAgICAkbGFiZWwuc2hvdWxkLmV4aXN0XG5cblxuXG5cbiAgIGl0ICdTaG91bGQgdXBkYXRlIHRoZSBBcHBNb2RlbCBhIGtpdCBpcyBjaGFuZ2VkJywgPT5cblxuICAgICAgJGxhYmVsID0gQHZpZXcuJGVsLmZpbmQgJy5sYWJlbC1raXQnXG4gICAgICBmaXJzdExhYmVsID0gQHZpZXcua2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQgJ2xhYmVsJ1xuICAgICAgbGFzdExhYmVsICA9IEB2aWV3LmtpdENvbGxlY3Rpb24uYXQoQHZpZXcua2l0Q29sbGVjdGlvbi5sZW5ndGgtMSkuZ2V0ICdsYWJlbCdcblxuICAgICAgYXBwTW9kZWwgPSBAdmlldy5hcHBNb2RlbFxuXG4gICAgICBhcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmtpdE1vZGVsJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcub25MZWZ0QnRuQ2xpY2soKVxuICAgICAgICAgJGxhYmVsLnRleHQoKS5zaG91bGQuZXF1YWwgbGFzdExhYmVsXG5cbiAgICAgIGFwcE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6a2l0TW9kZWwnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5vblJpZ2h0QnRuQ2xpY2soKVxuICAgICAgICAgJGxhYmVsLnRleHQoKS5zaG91bGQuZXF1YWwgZmlyc3RMYWJlbFxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuIiwiSW5zdHJ1bWVudCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50LmNvZmZlZSdcbktpdE1vZGVsICAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdJbnN0cnVtZW50JywgLT5cblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBJbnN0cnVtZW50XG4gICAgICAgICBraXRNb2RlbDogbmV3IEtpdE1vZGVsKClcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy5zaG91bGQuZXhpc3RcblxuXG4gICBpdCAnU2hvdWxkIGFsbG93IHVzZXIgdG8gc2VsZWN0IGluc3RydW1lbnRzJywgPT5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgZXhwZWN0KEB2aWV3LiRlbC5oYXNDbGFzcygnc2VsZWN0ZWQnKSkudG8uYmUudHJ1ZSIsIkluc3RydW1lbnRTZWxlY3RvclBhbmVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLmNvZmZlZSdcbkFwcENvbmZpZyAgICAgICAgICAgICAgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiAgICAgICAgICAgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdJbnN0cnVtZW50IFNlbGVjdGlvbiBQYW5lbCcsIC0+XG5cblxuICAgYmVmb3JlID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbCgpXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIEB2aWV3LnNob3VsZC5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCByZWZlciB0byB0aGUgY3VycmVudCBLaXRNb2RlbCB3aGVuIGluc3RhbnRpYXRpbmcgc291bmRzJywgPT5cblxuICAgICAgZXhwZWN0KEB2aWV3LmtpdE1vZGVsKS50by5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCBpdGVyYXRlIG92ZXIgYWxsIG9mIHRoZSBzb3VuZHMgaW4gdGhlIFNvdW5kQ29sbGVjdGlvbiB0byBidWlsZCBvdXQgaW5zdHJ1bWVudHMnLCA9PlxuXG4gICAgICBAdmlldy5raXRNb2RlbC50b0pTT04oKS5pbnN0cnVtZW50cy5sZW5ndGguc2hvdWxkLmJlLmFib3ZlKDApXG5cbiAgICAgICRpbnN0cnVtZW50cyA9IEB2aWV3LiRlbC5maW5kKCcuY29udGFpbmVyLWluc3RydW1lbnRzJykuZmluZCgnLmluc3RydW1lbnQnKVxuICAgICAgJGluc3RydW1lbnRzLmxlbmd0aC5zaG91bGQuYmUuYWJvdmUoMClcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVidWlsZCB2aWV3IHdoZW4gdGhlIGtpdE1vZGVsIGNoYW5nZXMnLCA9PlxuXG4gICAgICBraXRNb2RlbCA9IEB2aWV3LmFwcE1vZGVsLmdldCAna2l0TW9kZWwnXG4gICAgICBsZW5ndGggPSBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykudG9KU09OKCkubGVuZ3RoXG5cbiAgICAgICRpbnN0cnVtZW50cyA9IEB2aWV3LiRlbC5maW5kKCcuY29udGFpbmVyLWluc3RydW1lbnRzJykuZmluZCgnLmluc3RydW1lbnQnKVxuICAgICAgJGluc3RydW1lbnRzLmxlbmd0aC5zaG91bGQuYmUuZXF1YWwobGVuZ3RoKVxuXG4gICAgICBAdmlldy5hcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG5cbiAgICAgIGtpdE1vZGVsID0gQHZpZXcuYXBwTW9kZWwuZ2V0ICdraXRNb2RlbCdcbiAgICAgIGxlbmd0aCA9IGtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKS50b0pTT04oKS5sZW5ndGhcblxuICAgICAgJGluc3RydW1lbnRzID0gQHZpZXcuJGVsLmZpbmQoJy5jb250YWluZXItaW5zdHJ1bWVudHMnKS5maW5kKCcuaW5zdHJ1bWVudCcpXG4gICAgICAkaW5zdHJ1bWVudHMubGVuZ3RoLnNob3VsZC5iZS5lcXVhbChsZW5ndGgpXG5cblxuXG4gICBpdCAnU2hvdWxkIGxpc3RlbiBmb3Igc2VsZWN0aW9ucyBmcm9tIEluc3RydW1lbnQgaW5zdGFuY2VzIGFuZCB1cGRhdGUgdGhlIG1vZGVsJywgPT5cblxuICAgICAgQHZpZXcua2l0TW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpjdXJyZW50SW5zdHJ1bWVudCcpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lmluc3RydW1lbnRWaWV3c1swXS5vbkNsaWNrKClcblxuICAgICAgICAgJHNlbGVjdGVkID0gQHZpZXcuJGVsLmZpbmQoJy5jb250YWluZXItaW5zdHJ1bWVudHMnKS5maW5kKCcuc2VsZWN0ZWQnKVxuICAgICAgICAgJHNlbGVjdGVkLmxlbmd0aC5zaG91bGQuZXF1YWwgMVxuXG5cblxuIiwiQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblBhZFNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvcGFkL1BhZFNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGFkU3F1YXJlID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL1BhZFNxdWFyZS5jb2ZmZWUnXG5MaXZlUGFkID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL0xpdmVQYWQuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdMaXZlIFBhZCcsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEB2aWV3ID0gbmV3IExpdmVQYWRcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG4gICAgICAgICAjcGFkU3F1YXJlQ29sbGVjdGlvbjogbmV3IFBhZFNxdWFyZUNvbGxlY3Rpb24oKVxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIEB2aWV3LiRlbC5zaG91bGQuZXhpc3RcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciBvdXQgcGFkIHNxdWFyZXMnLCA9PlxuICAgICAgQHZpZXcuJGVsLmZpbmQoJy5wYWQtc3F1YXJlJykubGVuZ3RoLnNob3VsZC5lcXVhbCAxNlxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IHRoZSBlbnRpcmUga2l0IGNvbGxlY3Rpb24nLCA9PlxuXG4gICAgICBsZW4gPSAwXG5cbiAgICAgIEB2aWV3LmtpdENvbGxlY3Rpb24uZWFjaCAoa2l0LCBpbmRleCkgLT5cbiAgICAgICAgIGluZGV4ID0gaW5kZXggKyAxXG4gICAgICAgICBsZW4gPSBraXQuZ2V0KCdpbnN0cnVtZW50cycpLmxlbmd0aCAqIGluZGV4XG5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcuaW5zdHJ1bWVudCcpLmxlbmd0aC5zaG91bGQuZXF1YWwgbGVuICsgMVxuXG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gdG8gZHJvcHMgZnJvbSB0aGUga2l0cyB0byB0aGUgcGFkcycsID0+XG5cbiAgICAgIEB2aWV3LnBhZFNxdWFyZUNvbGxlY3Rpb24uc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpkcm9wcGVkJykud2hlbiA9PlxuICAgICAgICAgaWQgPSBAdmlldy5raXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2lkJylcbiAgICAgICAgIEB2aWV3LnBhZFNxdWFyZVZpZXdzWzBdLm9uRHJvcCBpZFxuXG5cblxuICAgaXQgJ1Nob3VsZCB1cGRhdGUgdGhlIFBhZFNxdWFyZUNvbGxlY3Rpb24gd2l0aCB0aGUgY3VycmVudCBraXQgd2hlbiBkcm9wcGVkJywgPT5cblxuICAgICAgQHZpZXcucGFkU3F1YXJlQ29sbGVjdGlvbi5zaG91bGQudHJpZ2dlcignY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50Jykud2hlbiA9PlxuICAgICAgICAgaWQgPSBAdmlldy5raXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2lkJylcbiAgICAgICAgIEB2aWV3LnBhZFNxdWFyZVZpZXdzWzBdLm9uRHJvcCBpZFxuXG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIGNoYW5nZXMgdG8gaW5zdHJ1bWVudCBkcm9wcGVkIHN0YXR1cycsID0+XG5cbiAgICAgIEB2aWV3LmtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6ZHJvcHBlZCcpLndoZW4gPT5cbiAgICAgICAgIGlkID0gQHZpZXcua2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICAgICBAdmlldy5wYWRTcXVhcmVWaWV3c1swXS5vbkRyb3AgaWRcblxuXG5cblxuXG5cblxuXG4iLCJBcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuUGFkU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYWRTcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGFkU3F1YXJlID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL1BhZFNxdWFyZS5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1BhZCBTcXVhcmUnLCAtPlxuXG4gICBiZWZvcmUgPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IFBhZFNxdWFyZVxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cbiAgICAgICAgIG1vZGVsOiBuZXcgUGFkU3F1YXJlTW9kZWwoKVxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciBvdXQgdGhlIGFwcHJvcHJpYXRlIGtleS1jb2RlIHRyaWdnZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLmZpbmQoJy5rZXktY29kZScpLmxlbmd0aC5zaG91bGQuZXF1YWwgMVxuXG5cblxuICAgaXQgJ1Nob3VsZCB0cmlnZ2VyIGEgcGxheSBhY3Rpb24gb24gdGFwJywgPT5cbiAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6dHJpZ2dlcicpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuXG5cblxuICAgaXQgJ1Nob3VsZCBhY2NlcHQgYSBkcm9wcGFibGUgdmlzdWFsIGVsZW1lbnQnLCA9PlxuICAgICAgQHZpZXcubW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpkcm9wcGVkJykud2hlbiA9PlxuICAgICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG5cbiAgICAgICAgIEB2aWV3Lm9uRHJvcCBpZFxuXG5cblxuICAgaXQgJ1Nob3VsZCB0cmlnZ2VyIGluc3RydW1lbnQgY2hhbmdlIG9uIGRyb3AnLCA9PlxuICAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6Y3VycmVudEluc3RydW1lbnQnKS53aGVuID0+XG4gICAgICAgICBpZCA9IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2lkJylcblxuICAgICAgICAgQHZpZXcub25Ecm9wIGlkXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciBvdXQgYSBzb3VuZCBpY29uIHdoZW4gZHJvcHBlZCcsID0+XG4gICAgICBpZCA9IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2lkJylcbiAgICAgIEB2aWV3Lm9uRHJvcCBpZFxuXG4gICAgICBpY29uID0gQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLmdldCgnaWNvbicpXG5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcuJyArIGljb24pLmxlbmd0aC5zaG91bGQuZXF1YWwgMVxuXG5cblxuICAgaXQgJ1Nob3VsZCB1cGRhdGUgdGhlIHRkIHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgaW5zdHJ1bWVudCBpZCB3aGVuIGRyb3BwZWQnLCA9PlxuICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICBAdmlldy5vbkRyb3AgaWRcblxuICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKFwiI3tpZH1cIikuc2hvdWxkLmJlLnRydWVcblxuXG5cblxuICAgaXQgJ1Nob3VsZCByZWxlYXNlIHRoZSBkcm9wcGFibGUgdmlzdWFsIGVsZW1lbnQgb24gcHJlc3MtaG9sZCcsID0+XG4gICAgICBAdmlldy5tb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmRyYWdnaW5nJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcub25Ib2xkKClcblxuXG5cbiAgIGl0ICdTaG91bGQgc2V0IHRoZSBzb3VuZCBiYXNlZCB1cG9uIHRoZSBkcm9wcGVkIHZpc3VhbCBlbGVtZW50JywgPT5cbiAgICAgIGlkID0gQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLmdldCgnaWQnKVxuICAgICAgQHZpZXcub25Ecm9wIGlkXG5cbiAgICAgIGV4cGVjdChAdmlldy5hdWRpb1BsYXliYWNrKS50by5ub3QuZXF1YWwgdW5kZWZpbmVkXG5cblxuICAgaXQgJ1Nob3VsZCBjbGVhciB0aGUgc291bmQgd2hlbiB0aGUgZHJvcHBhYmxlIGVsZW1lbnQgaXMgZGlzcG9zZWQgb2YnLCAoZG9uZSkgPT5cbiAgICAgIGlkID0gQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLmdldCgnaWQnKVxuICAgICAgQHZpZXcub25Ecm9wIGlkXG5cbiAgICAgIEB2aWV3Lm1vZGVsLm9uY2UgJ2NoYW5nZTpjdXJyZW50SW5zdHJ1bWVudCcsID0+XG4gICAgICAgICBkb25lKClcblxuICAgICAgQHZpZXcucmVtb3ZlU291bmQoKVxuXG5cbiAgIGl0ICdTaG91bGQgY2xlYXIgdGhlIGljb24gd2hlbiB0aGUgZHJvcHBhYmxlIGVsZW1lbnQgaXMgZGlzcG9zZWQgb2YnLCA9PlxuICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICBAdmlldy5vbkRyb3AgaWRcblxuICAgICAgaWNvbiA9IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2ljb24nKVxuICAgICAgQHZpZXcuJGVsLmZpbmQoJy4nICsgaWNvbikubGVuZ3RoLnNob3VsZC5lcXVhbCAxXG5cbiAgICAgIEB2aWV3LnJlbW92ZVNvdW5kKClcblxuICAgICAgQHZpZXcuJGVsLmZpbmQoJy4nICsgaWNvbikubGVuZ3RoLnNob3VsZC5lcXVhbCAwXG5cblxuXG5cblxuXG5cblxuIiwiQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnUGF0dGVybiBTcXVhcmUnLCAtPlxuXG4gICBiZWZvcmUgPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cblxuICAgICAgbW9kZWwgPSBuZXcgUGF0dGVyblNxdWFyZU1vZGVsXG4gICAgICAgICAnaW5zdHJ1bWVudCc6IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKVxuXG4gICAgICBAdmlldyA9IG5ldyBQYXR0ZXJuU3F1YXJlXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG1vZGVsXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCBjeWNsZSB0aHJvdWdoIHZlbG9jaXR5IHZvbHVtZXMnLCA9PlxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ3ZlbG9jaXR5Jykuc2hvdWxkLmVxdWFsIDFcbiAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygndmVsb2NpdHktbG93Jykuc2hvdWxkLmJlLnRydWVcblxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAyXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ3ZlbG9jaXR5LW1lZGl1bScpLnNob3VsZC5iZS50cnVlXG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgM1xuICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKCd2ZWxvY2l0eS1oaWdoJykuc2hvdWxkLmJlLnRydWVcblxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAwXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ3ZlbG9jaXR5LWhpZ2gnKS5zaG91bGQuYmUuZmFsc2VcblxuXG5cbiAgIGl0ICdTaG91bGQgdG9nZ2xlIG9mZicsID0+XG5cbiAgICAgIEB2aWV3LmRpc2FibGUoKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgMFxuXG5cblxuICAgaXQgJ1Nob3VsZCB0b2dnbGUgb24nLCA9PlxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcub25DbGljaygpXG5cblxuICAgICAgQHZpZXcuZGlzYWJsZSgpXG4gICAgICBAdmlldy5lbmFibGUoKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgMVxuIiwiXG5BcHBDb25maWcgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5UcmFjayA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLmNvZmZlZSdcbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5cbmRlc2NyaWJlICdQYXR0ZXJuIFRyYWNrJywgLT5cblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQHZpZXcgPSBuZXcgUGF0dGVyblRyYWNrXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBtb2RlbDogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIEB2aWV3LiRlbC5zaG91bGQuZXhpc3RcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciBvdXQgY2hpbGQgc3F1YXJlcycsID0+XG4gICAgICBAdmlldy4kZWwuZmluZCgnLnBhdHRlcm4tc3F1YXJlJykubGVuZ3RoLnNob3VsZC5lcXVhbCA4XG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIHBhdHRlcm4gc3F1YXJlcycsID0+XG4gICAgICBAdmlldy5jb2xsZWN0aW9uLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6dmVsb2NpdHknKS53aGVuID0+XG4gICAgICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlVmlld3NbMF0ub25DbGljaygpXG5cblxuICAgaXQgJ1Nob3VsZCBiZSBtdXRhYmxlJywgPT5cbiAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6bXV0ZScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm11dGUoKVxuXG4gICAgICBAdmlldy5tb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOm11dGUnKS53aGVuID0+XG4gICAgICAgICBAdmlldy51bm11dGUoKVxuXG5cbiAgIGl0ICdTaG91bGQgYWRkIHZpc3VhbCBub3RpZmljYXRpb24gdGhhdCB0cmFjayBpcyBtdXRlZCcsIChkb25lKSA9PlxuICAgICAgQHZpZXcubW9kZWwub25jZSAnY2hhbmdlOm11dGUnLCAobW9kZWwpID0+XG4gICAgICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ211dGUnKS5zaG91bGQuYmUudHJ1ZVxuXG4gICAgICBAdmlldy5tdXRlKClcblxuICAgICAgQHZpZXcubW9kZWwub25jZSAnY2hhbmdlOm11dGUnLCA9PlxuICAgICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKCdtdXRlJykuc2hvdWxkLmJlLmZhbHNlXG4gICAgICAgICBkb25lKClcblxuICAgICAgQHZpZXcudW5tdXRlKClcblxuXG4gICBpdCAnU2hvdWxkIGJlIGFibGUgdG8gZm9jdXMgYW5kIHVuZm9jdXMnLCA9PlxuICAgICAgQHZpZXcubW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpmb2N1cycpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm9uTGFiZWxDbGljaygpXG5cblxuXG5cbiAgIGl0ICdTaG91bGQgdXBkYXRlIGVhY2ggUGF0dGVyblNxdWFyZSBtb2RlbCB3aGVuIHRoZSBraXQgY2hhbmdlcycsID0+IiwiQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5TZXF1ZW5jZXIgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcbkluc3RydW1lbnRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuaGVscGVycyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2hlbHBlcnMvaGFuZGxlYmFycy1oZWxwZXJzJ1xuXG5cbmRlc2NyaWJlICdTZXF1ZW5jZXInLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAdmlldyA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucGF1c2UoKVxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIEB2aWV3LiRlbC5zaG91bGQuZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIG91dCBlYWNoIHBhdHRlcm4gdHJhY2snLCA9PlxuICAgICAgQHZpZXcuJGVsLmZpbmQoJy5wYXR0ZXJuLXRyYWNrJykubGVuZ3RoLnNob3VsZC5lcXVhbCBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykubGVuZ3RoXG5cblxuXG4gICBpdCAnU2hvdWxkIGNyZWF0ZSBhIGJwbSBpbnRlcnZhbCcsID0+XG4gICAgICBleHBlY3QoQHZpZXcuYnBtSW50ZXJ2YWwpLnRvLm5vdC5iZSBudWxsXG5cblxuXG4gICBpdCAnU2hvdWxkIGxpc3RlbiBmb3IgcGxheSAvIHBhdXNlIGNoYW5nZXMgb24gdGhlIEFwcE1vZGVsJywgPT5cbiAgICAgIEB2aWV3LmFwcE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6cGxheWluZycpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnBhdXNlKClcblxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpwbGF5aW5nJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcucGxheSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIGxpc3RlbiBmb3IgYnBtIGNoYW5nZXMnLCA9PlxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2V0KCdicG0nLCAyMDApXG4gICAgICBleHBlY3QoQHZpZXcudXBkYXRlSW50ZXJ2YWxUaW1lKS50by5lcXVhbCAyMDBcblxuXG5cbiAgIGl0ICdTaG91bGQgYmUgbXV0YWJsZScsID0+XG4gICAgICBAdmlldy5hcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOm11dGUnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5tdXRlKClcblxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTptdXRlJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcudW5tdXRlKClcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBJbnN0cnVtZW50VHJhY2tNb2RlbCBmb2N1cyBldmVudHMnLCA9PlxuICAgICAgQHZpZXcuY29sbGVjdGlvbi5zaG91bGQudHJpZ2dlcignY2hhbmdlOmZvY3VzJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcucGF0dGVyblRyYWNrVmlld3NbMF0ub25MYWJlbENsaWNrKClcblxuXG5cblxuICAgaXQgJ1Nob3VsZCB1cGRhdGUgZWFjaCBwYXR0ZXJuIHRyYWNrIHdoZW4gdGhlIGtpdCBjaGFuZ2VzJywgPT4iLCJBcHBDb25maWcgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuQXBwQ29udHJvbGxlciA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSdcbkxhbmRpbmdWaWV3ICAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUnXG5cbmRlc2NyaWJlICdMYW5kaW5nIFZpZXcnLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAdmlldyA9IG5ldyBMYW5kaW5nVmlld1xuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cbiAgICAgIGlmIEBhcHBDb250cm9sbGVyIHRoZW4gQGFwcENvbnRyb2xsZXIucmVtb3ZlKClcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5lbCkudG8uZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVkaXJlY3QgdG8gY3JlYXRlIHBhZ2Ugb24gY2xpY2snLCAoZG9uZSkgPT5cblxuICAgICAgQGFwcENvbnRyb2xsZXIgPSBuZXcgQXBwQ29udHJvbGxlclxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgcm91dGVyID0gQGFwcENvbnRyb2xsZXIuYXBwUm91dGVyXG4gICAgICAkc3RhcnRCdG4gPSBAdmlldy4kZWwuZmluZCAnLnN0YXJ0LWJ0bidcblxuICAgICAgJHN0YXJ0QnRuLm9uICdjbGljaycsIChldmVudCkgPT5cbiAgICAgICAgICdjcmVhdGUnLnNob3VsZC5yb3V0ZS50byByb3V0ZXIsICdjcmVhdGVSb3V0ZSdcbiAgICAgICAgIGRvbmUoKVxuXG4gICAgICAkc3RhcnRCdG4uY2xpY2soKVxuXG5cblxuXG5cblxuXG5cbiIsIlNoYXJlVmlldyA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9zaGFyZS9TaGFyZVZpZXcuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdTaGFyZSBWaWV3JywgLT5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQHZpZXcgPSBuZXcgU2hhcmVWaWV3XG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBleHBlY3QoQHZpZXcuZWwpLnRvLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCBhY2NlcHQgYSBTb3VuZFNoYXJlIG9iamVjdCcsID0+XG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgdGhlIHZpc3VhbGl6YXRpb24gbGF5ZXInLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgcGF1c2UgcGxheWJhY2sgb2YgdGhlIGF1ZGlvIHRyYWNrIG9uIGluaXQnLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgdG9nZ2xlIHRoZSBwbGF5IC8gcGF1c2UgYnV0dG9uJywgPT5cblxuXG4gICBpdCAnU2hvdWxkIGRpc3BsYXkgdGhlIHVzZXJzIHNvbmcgdGl0bGUgYW5kIHVzZXJuYW1lJywgPT5cbiJdfQ==

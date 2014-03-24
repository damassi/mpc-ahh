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
    if (previousView) {
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


},{"./models/AppModel.coffee":11,"./routers/AppRouter.coffee":18,"./supers/View.coffee":19,"./views/create/CreateView.coffee":21,"./views/landing/LandingView.coffee":37,"./views/share/ShareView.coffee":39}],7:[function(require,module,exports){

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
      return instrument.src = response.path + '/' + instrument.src;
    });
    response.instruments = new InstrumentCollection(response.instruments);
    return response;
  };

  return KitModel;

})(Backbone.Model);

module.exports = KitModel;


},{"../sequencer/InstrumentCollection.coffee":14}],14:[function(require,module,exports){

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


},{"./InstrumentModel.coffee":15}],15:[function(require,module,exports){

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
    'icon': null,
    'label': null,
    'src': null,
    'volume': null,
    'active': null,
    'mute': null,
    'focus': null,
    'patternSquares': null
  };

  return InstrumentModel;

})(Backbone.Model);

module.exports = InstrumentModel;


},{"../../config/AppConfig.coffee":7}],16:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../sequencer/InstrumentModel.coffee":15,"./PatternSquareModel.coffee":17}],17:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../../events/AppEvent.coffee":8}],18:[function(require,module,exports){

/**
 * MPC Application router
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppConfig, AppRouter, BPMIndicator, InstrumentCollection, InstrumentModel, InstrumentSelectorPanel, KitCollection, KitModel, KitSelector, PatternSquare, PatternSquareCollection, PatternSquareModel, PatternTrack, PubEvent, PubSub, Sequencer, TestsView, View,
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
    'full-sequencer': 'fullSequencerRoute'
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

  return AppRouter;

})(Backbone.Router);

module.exports = AppRouter;


},{"../config/AppConfig.coffee":7,"../events/PubEvent.coffee":9,"../models/kits/KitCollection.coffee":12,"../models/kits/KitModel.coffee":13,"../models/sequencer/PatternSquareCollection.coffee":16,"../models/sequencer/PatternSquareModel.coffee":17,"../supers/View.coffee":19,"../utils/PubSub":20,"../views/create/components/BPMIndicator.coffee":22,"../views/create/components/KitSelector.coffee":23,"../views/create/components/instruments/InstrumentSelectorPanel.coffee":25,"../views/create/components/sequencer/PatternSquare.coffee":28,"../views/create/components/sequencer/PatternTrack.coffee":29,"../views/create/components/sequencer/Sequencer.coffee":30,"../views/tests/TestsView.coffee":41}],19:[function(require,module,exports){

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


},{}],20:[function(require,module,exports){
/**
 * @module     PubSub
 * @desc       Global PubSub object for dispatch and delegation
 */

'use strict'

var PubSub = {}

_.extend( PubSub, Backbone.Events )

module.exports = PubSub
},{}],21:[function(require,module,exports){

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


},{"../../supers/View.coffee":19,"../../views/create/components/BPMIndicator.coffee":22,"../../views/create/components/KitSelector.coffee":23,"../../views/create/components/instruments/InstrumentSelectorPanel.coffee":25,"../../views/create/components/sequencer/Sequencer.coffee":30,"./templates/create-template.hbs":36}],22:[function(require,module,exports){

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


},{"../../../config/AppConfig.coffee":7,"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":19,"./templates/bpm-template.hbs":34}],23:[function(require,module,exports){

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


},{"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":19,"./templates/kit-selection-template.hbs":35}],24:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":19,"./templates/instrument-template.hbs":27}],25:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":19,"./Instrument.coffee":24,"./templates/instrument-panel-template.hbs":26}],26:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='container-instruments'>\n\n</div>";
  })
},{"handleify":5}],27:[function(require,module,exports){
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
},{"handleify":5}],28:[function(require,module,exports){

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


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":19,"./templates/pattern-square-template.hbs":31}],29:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../models/sequencer/PatternSquareCollection.coffee":16,"../../../../models/sequencer/PatternSquareModel.coffee":17,"../../../../supers/View.coffee":19,"./PatternSquare.coffee":28,"./templates/pattern-track-template.hbs":32}],30:[function(require,module,exports){

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
    Sequencer.__super__.remove.call(this);
    return this.pause();
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


},{"../../../../events/AppEvent.coffee":8,"../../../../helpers/handlebars-helpers":10,"../../../../supers/View.coffee":19,"./PatternTrack.coffee":29,"./templates/sequencer-template.hbs":33}],31:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })
},{"handleify":5}],32:[function(require,module,exports){
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
},{"handleify":5}],33:[function(require,module,exports){
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
},{"handleify":5}],34:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-decrease'>DECREASE</button>\n<span class='label-bpm'>0</span>\n<button class='btn-increase'>INCREASE</button>";
  })
},{"handleify":5}],35:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-left'>LEFT</button>\n<span class='label-kit'>DRUM KIT</span>\n<button class='btn-right'>RIGHT</button>";
  })
},{"handleify":5}],36:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='container-kit-selector'>\n	<div class='kit-selector'></div>\n</div>\n<div class='container-visualization'>Visualization</div>\n\n<div class='container-sequencer'>\n\n	<div class='instrument-selector'>Instrument Selector</div>\n	<div class='sequencer'>Sequencer</div>\n	<div class='bpm'>BPM</div>\n	<div class='btn-share'>SHARE</div>\n\n</div>";
  })
},{"handleify":5}],37:[function(require,module,exports){

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


},{"../../events/PubEvent.coffee":9,"../../supers/View.coffee":19,"../../utils/PubSub":20,"./templates/landing-template.hbs":38}],38:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<span class='start-btn'>CREATE</span>";
  })
},{"handleify":5}],39:[function(require,module,exports){

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


},{"../../supers/View.coffee":19,"./templates/share-template.hbs":40}],40:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<a href='/#'>NEW</a>";
  })
},{"handleify":5}],41:[function(require,module,exports){

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


},{"../../supers/View.coffee":19,"./tests-template.hbs":42}],42:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h1>Component Viewer</h1>\n\n<br />\n<p>\n	Make sure that <b>httpster</b> is running in the <b>source</b> route (npm install -g httpster) <br/>\n	<a href=\"http://localhost:3333/test/html/\">Mocha Test Runner</a>\n</p>\n\n<br />\n<ul>\n	<li><a href='#kit-selection'>Kit Selection</a></li>\n	<li><a href=\"#bpm-indicator\">BPM Indicator</a></li>\n	<li><a href=\"#instrument-selector\">Instrument Selector</a></li>\n	<li><a href=\"#pattern-square\">Pattern Square</a></li>\n	<li><a href=\"#pattern-track\">Pattern Track</a></li>\n	<li><a href=\"#sequencer\">Sequencer</a></li>\n	<li><a href=\"#full-sequencer\">Full Sequencer</a></li>\n</ul>";
  })
},{"handleify":5}],43:[function(require,module,exports){
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


},{"./spec/AppController-spec.coffee":44,"./spec/models/KitCollection-spec.coffee":45,"./spec/models/KitModel-spec.coffee":46,"./spec/models/SoundCollection-spec.coffee":47,"./spec/models/SoundModel-spec.coffee":48,"./spec/views/create/CreateView-spec.coffee":49,"./spec/views/create/components/BPMIndicator-spec.coffee":50,"./spec/views/create/components/KitSelector-spec.coffee":51,"./spec/views/create/components/instruments/Instrument-spec.coffee":52,"./spec/views/create/components/instruments/InstrumentSelectorPanel-spec.coffee":53,"./spec/views/create/components/sequencer/PatternSquare-spec.coffee":54,"./spec/views/create/components/sequencer/PatternTrack-spec.coffee":55,"./spec/views/create/components/sequencer/Sequencer-spec.coffee":56,"./spec/views/landing/LandingView-spec.coffee":57,"./spec/views/share/ShareView-spec.coffee":58}],44:[function(require,module,exports){
var AppController;

AppController = require('../../src/scripts/AppController.coffee');

describe('App Controller', function() {
  return it('Should initialize', (function(_this) {
    return function() {};
  })(this));
});


},{"../../src/scripts/AppController.coffee":6}],45:[function(require,module,exports){
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


},{"../../../src/scripts/config/AppConfig.coffee":7,"../../../src/scripts/models/kits/KitCollection.coffee":12}],46:[function(require,module,exports){
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


},{"../../../src/scripts/config/AppConfig.coffee":7,"../../../src/scripts/models/kits/KitModel.coffee":13,"../../../src/scripts/models/sequencer/InstrumentCollection.coffee":14}],47:[function(require,module,exports){
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


},{"../../../../src/scripts/config/AppConfig.coffee":7,"../../../../src/scripts/models/AppModel.coffee":11,"../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../src/scripts/views/create/CreateView.coffee":21}],50:[function(require,module,exports){
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


},{"../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../src/scripts/events/AppEvent.coffee":8,"../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../src/scripts/views/create/components/BPMIndicator.coffee":22}],51:[function(require,module,exports){
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


},{"../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../src/scripts/models/kits/KitModel.coffee":13,"../../../../../src/scripts/views/create/components/KitSelector.coffee":23}],52:[function(require,module,exports){
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


},{"../../../../../../src/scripts/models/kits/KitModel.coffee":13,"../../../../../../src/scripts/views/create/components/instruments/Instrument.coffee":24}],53:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/views/create/components/instruments/InstrumentSelectorPanel.coffee":25}],54:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":17,"../../../../../../src/scripts/views/create/components/sequencer/PatternSquare.coffee":28}],55:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":15,"../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee":16,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":17,"../../../../../../src/scripts/views/create/components/sequencer/PatternTrack.coffee":29}],56:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/helpers/handlebars-helpers":10,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/InstrumentCollection.coffee":14,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":15,"../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee":16,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":17,"../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee":30}],57:[function(require,module,exports){
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


},{"../../../../src/scripts/AppController.coffee":6,"../../../../src/scripts/config/AppConfig.coffee":7,"../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../src/scripts/views/landing/LandingView.coffee":37}],58:[function(require,module,exports){
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


},{"../../../../src/scripts/views/share/ShareView.coffee":39}]},{},[43])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2RpZ2l0cy9pbmRleC5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L3J1bnRpbWUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy91dGlscy9QdWJTdWIuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3IuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy90ZW1wbGF0ZXMvaW5zdHJ1bWVudC1wYW5lbC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy90ZW1wbGF0ZXMvaW5zdHJ1bWVudC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9wYXR0ZXJuLXNxdWFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3BhdHRlcm4tdHJhY2stdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9zZXF1ZW5jZXItdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvdGVtcGxhdGVzL2JwbS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy90ZW1wbGF0ZXMva2l0LXNlbGVjdGlvbi10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvdGVtcGxhdGVzL2NyZWF0ZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvdGVtcGxhdGVzL2xhbmRpbmctdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL3RlbXBsYXRlcy9zaGFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy90ZXN0cy9UZXN0c1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvdGVzdHMvdGVzdHMtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjLXJ1bm5lci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvQXBwQ29udHJvbGxlci1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9tb2RlbHMvS2l0Q29sbGVjdGlvbi1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9tb2RlbHMvS2l0TW9kZWwtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvbW9kZWxzL1NvdW5kQ29sbGVjdGlvbi1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9tb2RlbHMvU291bmRNb2RlbC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3Itc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3Itc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXItc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9zaGFyZS9TaGFyZVZpZXctc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVDLENBdEJBLENBQUE7U0F5QkEsRUFBQSxDQUFHLGtEQUFILEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsRUEzQm9CO0FBQUEsQ0FBdkIsQ0FIQSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIGRpZ2l0c1xuICogQ29weXJpZ2h0IChjKSAyMDEzIEpvbiBTY2hsaW5rZXJ0XG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUGFkIG51bWJlcnMgd2l0aCB6ZXJvcy5cbiAqIEF1dG9tYXRpY2FsbHkgcGFkIHRoZSBudW1iZXIgb2YgZGlnaXRzIGJhc2VkIG9uIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5LFxuICogb3IgZXhwbGljaXRseSBwYXNzIGluIHRoZSBudW1iZXIgb2YgZGlnaXRzIHRvIHVzZS5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG51bSAgVGhlIG51bWJlciB0byBwYWQuXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdHMgT3B0aW9ucyBvYmplY3Qgd2l0aCBgZGlnaXRzYCBhbmQgYGF1dG9gIHByb3BlcnRpZXMuXG4gKiAgICB7XG4gKiAgICAgIGF1dG86IGFycmF5Lmxlbmd0aCAvLyBwYXNzIGluIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5XG4gKiAgICAgIGRpZ2l0czogNCAgICAgICAgICAvLyBvciBwYXNzIGluIHRoZSBudW1iZXIgb2YgZGlnaXRzIHRvIHVzZVxuICogICAgfVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgIFRoZSBwYWRkZWQgbnVtYmVyIHdpdGggemVyb3MgcHJlcGVuZGVkXG4gKlxuICogQGV4YW1wbGVzOlxuICogIDEgICAgICA9PiAwMDAwMDFcbiAqICAxMCAgICAgPT4gMDAwMDEwXG4gKiAgMTAwICAgID0+IDAwMDEwMFxuICogIDEwMDAgICA9PiAwMDEwMDBcbiAqICAxMDAwMCAgPT4gMDEwMDAwXG4gKiAgMTAwMDAwID0+IDEwMDAwMFxuICovXG5cbmV4cG9ydHMucGFkID0gZnVuY3Rpb24gKG51bSwgb3B0cykge1xuICB2YXIgZGlnaXRzID0gb3B0cy5kaWdpdHMgfHwgMztcbiAgaWYob3B0cy5hdXRvICYmIHR5cGVvZiBvcHRzLmF1dG8gPT09ICdudW1iZXInKSB7XG4gICAgZGlnaXRzID0gU3RyaW5nKG9wdHMuYXV0bykubGVuZ3RoO1xuICB9XG4gIHZhciBsZW5EaWZmID0gZGlnaXRzIC0gU3RyaW5nKG51bSkubGVuZ3RoO1xuICB2YXIgcGFkZGluZyA9ICcnO1xuICBpZiAobGVuRGlmZiA+IDApIHtcbiAgICB3aGlsZSAobGVuRGlmZi0tKSB7XG4gICAgICBwYWRkaW5nICs9ICcwJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhZGRpbmcgKyBudW07XG59O1xuXG4vKipcbiAqIFN0cmlwIGxlYWRpbmcgZGlnaXRzIGZyb20gYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgZnJvbSB3aGljaCB0byBzdHJpcCBkaWdpdHNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqL1xuXG5leHBvcnRzLnN0cmlwbGVmdCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXGQrXFwtPy9nLCAnJyk7XG59O1xuXG4vKipcbiAqIFN0cmlwIHRyYWlsaW5nIGRpZ2l0cyBmcm9tIGEgc3RyaW5nXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIGZyb20gd2hpY2ggdG8gc3RyaXAgZGlnaXRzXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBUaGUgbW9kaWZpZWQgc3RyaW5nXG4gKi9cblxuZXhwb3J0cy5zdHJpcHJpZ2h0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFwtP1xcZCskL2csICcnKTtcbn07XG5cbi8qKlxuICogQ291bnQgZGlnaXRzIG9uIHRoZSBsZWZ0IHNpZGUgb2YgYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgd2l0aCBkaWdpdHMgdG8gY291bnRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqIEBleGFtcGxlXG4gKiAgXCIwMDEtZm9vLm1kXCIgPT4gM1xuICovXG5cbmV4cG9ydHMuY291bnRsZWZ0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyLm1hdGNoKC9eXFxkKy9nKSkubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBDb3VudCBkaWdpdHMgb24gdGhlIHJpZ2h0IHNpZGUgb2YgYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgd2l0aCBkaWdpdHMgdG8gY291bnRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqIEBleGFtcGxlXG4gKiAgXCIwMDEtZm9vLm1kXCIgPT4gM1xuICovXG5cbmV4cG9ydHMuY291bnRyaWdodCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gU3RyaW5nKHN0ci5tYXRjaCgvXFxkKyQvZykpLmxlbmd0aDtcbn07IiwiLypqc2hpbnQgZXFudWxsOiB0cnVlICovXG5cbm1vZHVsZS5leHBvcnRzLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuXG52YXIgSGFuZGxlYmFycyA9IHt9O1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZFUlNJT04gPSBcIjEuMC4wXCI7XG5IYW5kbGViYXJzLkNPTVBJTEVSX1JFVklTSU9OID0gNDtcblxuSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz49IDEuMC4wJ1xufTtcblxuSGFuZGxlYmFycy5oZWxwZXJzICA9IHt9O1xuSGFuZGxlYmFycy5wYXJ0aWFscyA9IHt9O1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgIGZ1bmN0aW9uVHlwZSA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24obmFtZSwgZm4sIGludmVyc2UpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBpZiAoaW52ZXJzZSB8fCBmbikgeyB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgaGVscGVycycpOyB9XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaW52ZXJzZSkgeyBmbi5ub3QgPSBpbnZlcnNlOyB9XG4gICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsID0gZnVuY3Rpb24obmFtZSwgc3RyKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBzdHI7XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihhcmcpIHtcbiAgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBoZWxwZXI6ICdcIiArIGFyZyArIFwiJ1wiKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UgfHwgZnVuY3Rpb24oKSB7fSwgZm4gPSBvcHRpb25zLmZuO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcblxuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKGNvbnRleHQgPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm4odGhpcyk7XG4gIH0gZWxzZSBpZihjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgIGlmKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIEhhbmRsZWJhcnMuaGVscGVycy5lYWNoKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZuKGNvbnRleHQpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5LID0gZnVuY3Rpb24oKSB7fTtcblxuSGFuZGxlYmFycy5jcmVhdGVGcmFtZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24ob2JqZWN0KSB7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBvYmplY3Q7XG4gIHZhciBvYmogPSBuZXcgSGFuZGxlYmFycy5LKCk7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBudWxsO1xuICByZXR1cm4gb2JqO1xufTtcblxuSGFuZGxlYmFycy5sb2dnZXIgPSB7XG4gIERFQlVHOiAwLCBJTkZPOiAxLCBXQVJOOiAyLCBFUlJPUjogMywgbGV2ZWw6IDMsXG5cbiAgbWV0aG9kTWFwOiB7MDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcid9LFxuXG4gIC8vIGNhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24obGV2ZWwsIG9iaikge1xuICAgIGlmIChIYW5kbGViYXJzLmxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IEhhbmRsZWJhcnMubG9nZ2VyLm1ldGhvZE1hcFtsZXZlbF07XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGVbbWV0aG9kXSkge1xuICAgICAgICBjb25zb2xlW21ldGhvZF0uY2FsbChjb25zb2xlLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy5sb2cgPSBmdW5jdGlvbihsZXZlbCwgb2JqKSB7IEhhbmRsZWJhcnMubG9nZ2VyLmxvZyhsZXZlbCwgb2JqKTsgfTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGZuID0gb3B0aW9ucy5mbiwgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZTtcbiAgdmFyIGkgPSAwLCByZXQgPSBcIlwiLCBkYXRhO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgZGF0YSA9IEhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgfVxuXG4gIGlmKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgaWYoY29udGV4dCBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgIGZvcih2YXIgaiA9IGNvbnRleHQubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgICBpZiAoZGF0YSkgeyBkYXRhLmluZGV4ID0gaTsgfVxuICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ldLCB7IGRhdGE6IGRhdGEgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvcih2YXIga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgaWYoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgaWYoZGF0YSkgeyBkYXRhLmtleSA9IGtleTsgfVxuICAgICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRba2V5XSwge2RhdGE6IGRhdGF9KTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZihpID09PSAwKXtcbiAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb25kaXRpb25hbCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICBpZighY29uZGl0aW9uYWwgfHwgSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd1bmxlc3MnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHtmbjogb3B0aW9ucy5pbnZlcnNlLCBpbnZlcnNlOiBvcHRpb25zLmZufSk7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmICghSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbnRleHQpKSByZXR1cm4gb3B0aW9ucy5mbihjb250ZXh0KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgSGFuZGxlYmFycy5sb2cobGV2ZWwsIGNvbnRleHQpO1xufSk7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxuLy8gQkVHSU4oQlJPV1NFUilcblxuSGFuZGxlYmFycy5WTSA9IHtcbiAgdGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlU3BlYykge1xuICAgIC8vIEp1c3QgYWRkIHdhdGVyXG4gICAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICAgIGVzY2FwZUV4cHJlc3Npb246IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICAgIGludm9rZVBhcnRpYWw6IEhhbmRsZWJhcnMuVk0uaW52b2tlUGFydGlhbCxcbiAgICAgIHByb2dyYW1zOiBbXSxcbiAgICAgIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV07XG4gICAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbShpLCBmbiwgZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgICB9LFxuICAgICAgbWVyZ2U6IGZ1bmN0aW9uKHBhcmFtLCBjb21tb24pIHtcbiAgICAgICAgdmFyIHJldCA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgICBpZiAocGFyYW0gJiYgY29tbW9uKSB7XG4gICAgICAgICAgcmV0ID0ge307XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBjb21tb24pO1xuICAgICAgICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHJldCwgcGFyYW0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9LFxuICAgICAgcHJvZ3JhbVdpdGhEZXB0aDogSGFuZGxlYmFycy5WTS5wcm9ncmFtV2l0aERlcHRoLFxuICAgICAgbm9vcDogSGFuZGxlYmFycy5WTS5ub29wLFxuICAgICAgY29tcGlsZXJJbmZvOiBudWxsXG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIHZhciByZXN1bHQgPSB0ZW1wbGF0ZVNwZWMuY2FsbChjb250YWluZXIsIEhhbmRsZWJhcnMsIGNvbnRleHQsIG9wdGlvbnMuaGVscGVycywgb3B0aW9ucy5wYXJ0aWFscywgb3B0aW9ucy5kYXRhKTtcblxuICAgICAgdmFyIGNvbXBpbGVySW5mbyA9IGNvbnRhaW5lci5jb21waWxlckluZm8gfHwgW10sXG4gICAgICAgICAgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IEhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgICAgIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICAgICAgdGhyb3cgXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBwcmVjb21waWxlciB0byBhIG5ld2VyIHZlcnNpb24gKFwiK3J1bnRpbWVWZXJzaW9ucytcIikgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uIChcIitjb21waWxlclZlcnNpb25zK1wiKS5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGEgbmV3ZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gXCIrXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKFwiK2NvbXBpbGVySW5mb1sxXStcIikuXCI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9LFxuXG4gIHByb2dyYW1XaXRoRGVwdGg6IGZ1bmN0aW9uKGksIGZuLCBkYXRhIC8qLCAkZGVwdGggKi8pIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMyk7XG5cbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgW2NvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhXS5jb25jYXQoYXJncykpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gYXJncy5sZW5ndGg7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgdmFyIHByb2dyYW0gPSBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhKTtcbiAgICB9O1xuICAgIHByb2dyYW0ucHJvZ3JhbSA9IGk7XG4gICAgcHJvZ3JhbS5kZXB0aCA9IDA7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIG5vb3A6IGZ1bmN0aW9uKCkgeyByZXR1cm4gXCJcIjsgfSxcbiAgaW52b2tlUGFydGlhbDogZnVuY3Rpb24ocGFydGlhbCwgbmFtZSwgY29udGV4dCwgaGVscGVycywgcGFydGlhbHMsIGRhdGEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHsgaGVscGVyczogaGVscGVycywgcGFydGlhbHM6IHBhcnRpYWxzLCBkYXRhOiBkYXRhIH07XG5cbiAgICBpZihwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBmb3VuZFwiKTtcbiAgICB9IGVsc2UgaWYocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKCFIYW5kbGViYXJzLmNvbXBpbGUpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRpYWxzW25hbWVdID0gSGFuZGxlYmFycy5jb21waWxlKHBhcnRpYWwsIHtkYXRhOiBkYXRhICE9PSB1bmRlZmluZWR9KTtcbiAgICAgIHJldHVybiBwYXJ0aWFsc1tuYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMudGVtcGxhdGUgPSBIYW5kbGViYXJzLlZNLnRlbXBsYXRlO1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG5cbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gQkVHSU4oQlJPV1NFUilcblxudmFyIGVycm9yUHJvcHMgPSBbJ2Rlc2NyaXB0aW9uJywgJ2ZpbGVOYW1lJywgJ2xpbmVOdW1iZXInLCAnbWVzc2FnZScsICduYW1lJywgJ251bWJlcicsICdzdGFjayddO1xuXG5IYW5kbGViYXJzLkV4Y2VwdGlvbiA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgdmFyIHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxufTtcbkhhbmRsZWJhcnMuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuSGFuZGxlYmFycy5TYWZlU3RyaW5nID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufTtcbkhhbmRsZWJhcnMuU2FmZVN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RyaW5nLnRvU3RyaW5nKCk7XG59O1xuXG52YXIgZXNjYXBlID0ge1xuICBcIiZcIjogXCImYW1wO1wiLFxuICBcIjxcIjogXCImbHQ7XCIsXG4gIFwiPlwiOiBcIiZndDtcIixcbiAgJ1wiJzogXCImcXVvdDtcIixcbiAgXCInXCI6IFwiJiN4Mjc7XCIsXG4gIFwiYFwiOiBcIiYjeDYwO1wiXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2c7XG52YXIgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxudmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdIHx8IFwiJmFtcDtcIjtcbn07XG5cbkhhbmRsZWJhcnMuVXRpbHMgPSB7XG4gIGV4dGVuZDogZnVuY3Rpb24ob2JqLCB2YWx1ZSkge1xuICAgIGZvcih2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgICBpZih2YWx1ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdmFsdWVba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZXNjYXBlRXhwcmVzc2lvbjogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgaW5zdGFuY2VvZiBIYW5kbGViYXJzLlNhZmVTdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcudG9TdHJpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsIHx8IHN0cmluZyA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAgIC8vIHRoZSByZWdleCB0ZXN0IHdpbGwgZG8gdGhpcyB0cmFuc3BhcmVudGx5IGJlaGluZCB0aGUgc2NlbmVzLCBjYXVzaW5nIGlzc3VlcyBpZlxuICAgIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICAgIHN0cmluZyA9IHN0cmluZy50b1N0cmluZygpO1xuXG4gICAgaWYoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbiAgfSxcblxuICBpc0VtcHR5OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZih0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSByZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMnKS5jcmVhdGUoKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy91dGlscy5qcycpLmF0dGFjaChleHBvcnRzKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzJykuYXR0YWNoKGV4cG9ydHMpIiwiIyMjKlxuICogUHJpbWFyeSBhcHBsaWNhdGlvbiBjb250cm9sbGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5BcHBNb2RlbCAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbkFwcFJvdXRlciAgID0gcmVxdWlyZSAnLi9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUnXG5MYW5kaW5nVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUnXG5DcmVhdGVWaWV3ICA9IHJlcXVpcmUgJy4vdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlJ1xuU2hhcmVWaWV3ICAgPSByZXF1aXJlICcuL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcENvbnRyb2xsZXIgZXh0ZW5kcyBWaWV3XG5cblxuICAgY2xhc3NOYW1lOiAnd3JhcHBlcidcblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEBsYW5kaW5nVmlldyA9IG5ldyBMYW5kaW5nVmlld1xuICAgICAgQHNoYXJlVmlldyAgID0gbmV3IFNoYXJlVmlld1xuXG4gICAgICBAY3JlYXRlVmlldyAgPSBuZXcgQ3JlYXRlVmlld1xuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgQGFwcFJvdXRlciA9IG5ldyBBcHBSb3V0ZXJcbiAgICAgICAgIGFwcENvbnRyb2xsZXI6IEBcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSBBcHBDb250cm9sbGVyIHRvIHRoZSBET00gYW5kIGtpY2tzXG4gICAjIG9mZiBiYWNrYm9uZXMgaGlzdG9yeVxuXG4gICByZW5kZXI6IC0+XG4gICAgICBAJGJvZHkgPSAkICdib2R5J1xuICAgICAgQCRib2R5LmFwcGVuZCBAZWxcblxuICAgICAgQmFja2JvbmUuaGlzdG9yeS5zdGFydFxuICAgICAgICAgcHVzaFN0YXRlOiBmYWxzZVxuXG5cblxuICAgIyBEZXN0cm95cyBhbGwgY3VycmVudCBhbmQgcHJlLXJlbmRlcmVkIHZpZXdzIGFuZFxuICAgIyB1bmRlbGVnYXRlcyBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgQGxhbmRpbmdWaWV3LnJlbW92ZSgpXG4gICAgICBAc2hhcmVWaWV3LnJlbW92ZSgpXG4gICAgICBAY3JlYXRlVmlldy5yZW1vdmUoKVxuXG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICAjIEFkZHMgQXBwQ29udHJvbGxlci1yZWxhdGVkIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVnaW5zXG4gICAjIGxpc3RlbmluZyB0byB2aWV3IGNoYW5nZXNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAnY2hhbmdlOnZpZXcnLCBAb25WaWV3Q2hhbmdlXG5cblxuXG5cbiAgICMgUmVtb3ZlcyBBcHBDb250cm9sbGVyLXJlbGF0ZWQgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHNob3dpbmcgLyBoaWRpbmcgLyBkaXNwb3Npbmcgb2YgcHJpbWFyeSB2aWV3c1xuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvblZpZXdDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIHByZXZpb3VzVmlldyA9IG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMudmlld1xuICAgICAgY3VycmVudFZpZXcgID0gbW9kZWwuY2hhbmdlZC52aWV3XG5cbiAgICAgIGlmIHByZXZpb3VzVmlldyB0aGVuIHByZXZpb3VzVmlldy5oaWRlXG4gICAgICAgICByZW1vdmU6IHRydWVcblxuXG4gICAgICBAJGVsLmFwcGVuZCBjdXJyZW50Vmlldy5yZW5kZXIoKS5lbFxuXG4gICAgICBjdXJyZW50Vmlldy5zaG93KClcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb250cm9sbGVyIiwiIyMjKlxuICBBcHBsaWNhdGlvbi13aWRlIGdlbmVyYWwgY29uZmlndXJhdGlvbnNcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xOS4xNFxuIyMjXG5cblxuQXBwQ29uZmlnID1cblxuXG4gICAjIFRoZSBwYXRoIHRvIGFwcGxpY2F0aW9uIGFzc2V0c1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBBU1NFVFM6XG4gICAgICBwYXRoOiAgICcvYXNzZXRzJ1xuICAgICAgYXVkaW86ICAnYXVkaW8nXG4gICAgICBkYXRhOiAgICdkYXRhJ1xuICAgICAgaW1hZ2VzOiAnaW1hZ2VzJ1xuXG5cbiAgICMgVGhlIEJQTSB0ZW1wb1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBCUE06IDMyMFxuXG5cbiAgICMgVGhlIG1heCBCUE1cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQlBNX01BWDogMTAwMFxuXG5cbiAgICMgVGhlIG1heCB2YXJpZW50IG9uIGVhY2ggcGF0dGVybiBzcXVhcmUgKG9mZiwgbG93LCBtZWRpdW0sIGhpZ2gpXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIFZFTE9DSVRZX01BWDogM1xuXG5cbiAgICMgVm9sdW1lIGxldmVscyBmb3IgcGF0dGVybiBwbGF5YmFjayBhcyB3ZWxsIGFzIGZvciBvdmVyYWxsIHRyYWNrc1xuICAgIyBAdHlwZSB7T2JqZWN0fVxuXG4gICBWT0xVTUVfTEVWRUxTOlxuICAgICAgbG93OiAgICAuMlxuICAgICAgbWVkaXVtOiAuNVxuICAgICAgaGlnaDogICAgMVxuXG5cbiAgICMgUmV0dXJucyBhIG5vcm1hbGl6ZWQgYXNzZXQgcGF0aCBmb3IgYXBwbGljYXRpb24gYXNzZXRzXG4gICAjIEBwYXJhbSB7U3RyaW5nfSBhc3NldFR5cGVcblxuICAgcmV0dXJuQXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgICAgQEFTU0VUUy5wYXRoICsgJy8nICsgQEFTU0VUU1thc3NldFR5cGVdXG5cblxuICAgIyBSZXR1cm5zIGEgbm9ybWFsaXplZCBhc3NldCBwYXRoIGZvciB0aGUgVEVTVCBlbnZpcm9ubWVudFxuICAgIyBAcGFyYW0ge1N0cmluZ30gYXNzZXRUeXBlXG5cbiAgIHJldHVyblRlc3RBc3NldFBhdGg6IChhc3NldFR5cGUpIC0+XG4gICAgICAnL3Rlc3QvaHRtbC8nICsgQEFTU0VUUy5wYXRoICsgJy8nICsgQEFTU0VUU1thc3NldFR5cGVdXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcENvbmZpZ1xuXG4iLCIjIyMqXG4gKiBBcHBsaWNhdGlvbiByZWxhdGVkIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblxuQXBwRXZlbnQgPVxuXG4gICBDSEFOR0VfQUNUSVZFOiAgICAgJ2NoYW5nZTphY3RpdmUnXG4gICBDSEFOR0VfQlBNOiAgICAgICAgJ2NoYW5nZTpicG0nXG4gICBDSEFOR0VfRk9DVVM6ICAgICAgJ2NoYW5nZTpmb2N1cydcbiAgIENIQU5HRV9JTlNUUlVNRU5UOiAnY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50J1xuICAgQ0hBTkdFX0tJVDogICAgICAgICdjaGFuZ2U6a2l0TW9kZWwnXG4gICBDSEFOR0VfTVVURTogICAgICAgJ2NoYW5nZTptdXRlJ1xuICAgQ0hBTkdFX1BMQVlJTkc6ICAgICdjaGFuZ2U6cGxheWluZydcbiAgIENIQU5HRV9UUklHR0VSOiAgICAnY2hhbmdlOnRyaWdnZXInXG4gICBDSEFOR0VfVkVMT0NJVFk6ICAgJ2NoYW5nZTp2ZWxvY2l0eSdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcEV2ZW50IiwiIyMjKlxuICogR2xvYmFsIFB1YlN1YiBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cblB1YlN1YiA9XG5cbiAgIFJPVVRFOiAnb25Sb3V0ZUNoYW5nZSdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFB1YlN1YiIsIlxudmFyIGRpZ2l0cyA9IHJlcXVpcmUoJ2RpZ2l0cycpO1xudmFyIGhhbmRsZWJhcnMgPSByZXF1aXJlKCdoYW5kbGVpZnknKVxuXG5oYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdyZXBlYXQnLCBmdW5jdGlvbihuLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIF9kYXRhID0ge307XG4gICAgaWYgKG9wdGlvbnMuX2RhdGEpIHtcbiAgICAgIF9kYXRhID0gaGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLl9kYXRhKTtcbiAgICB9XG5cbiAgICB2YXIgY29udGVudCA9ICcnO1xuICAgIHZhciBjb3VudCA9IG4gLSAxO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IGNvdW50OyBpKyspIHtcbiAgICAgIF9kYXRhID0ge1xuICAgICAgICBpbmRleDogZGlnaXRzLnBhZCgoaSArIDEpLCB7YXV0bzogbn0pXG4gICAgICB9O1xuICAgICAgY29udGVudCArPSBvcHRpb25zLmZuKHRoaXMsIHtkYXRhOiBfZGF0YX0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IGhhbmRsZWJhcnMuU2FmZVN0cmluZyhjb250ZW50KTtcbiAgfSk7IiwiIyMjKlxuICBQcmltYXJ5IGFwcGxpY2F0aW9uIG1vZGVsIHdoaWNoIGNvb3JkaW5hdGVzIHN0YXRlXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblxuXG5BcHBSb3V0ZXIgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmRcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICd2aWV3JzogICAgICAgIG51bGxcbiAgICAgICdwbGF5aW5nJzogICAgIG51bGxcbiAgICAgICdtdXRlJzogICAgICAgIG51bGxcblxuICAgICAgJ2tpdE1vZGVsJzogICAgbnVsbFxuXG4gICAgICAjIFNldHRpbmdzXG4gICAgICAnYnBtJzogICAgICAgICBBcHBDb25maWcuQlBNXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBSb3V0ZXIiLCIjIyMqXG4gKiBDb2xsZWN0aW9uIG9mIHNvdW5kIGtpdHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdE1vZGVsICA9IHJlcXVpcmUgJy4vS2l0TW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIEtpdENvbGxlY3Rpb24gZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cblxuICAgIyBVcmwgdG8gZGF0YSBmb3IgZmV0Y2hcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdXJsOiBcIiN7QXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpfS9zb3VuZC1kYXRhLmpzb25cIlxuXG5cbiAgICMgSW5kaXZpZHVhbCBkcnVta2l0IGF1ZGlvIHNldHNcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBtb2RlbDogS2l0TW9kZWxcblxuXG4gICAjIFRoZSBjdXJyZW50IHVzZXItc2VsZWN0ZWQga2l0XG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGtpdElkOiAwXG5cblxuXG4gICBwYXJzZTogKHJlc3BvbnNlKSAtPlxuICAgICAgYXNzZXRQYXRoID0gcmVzcG9uc2UuY29uZmlnLmFzc2V0UGF0aFxuICAgICAga2l0cyA9IHJlc3BvbnNlLmtpdHNcblxuICAgICAga2l0cyA9IF8ubWFwIGtpdHMsIChraXQpIC0+XG4gICAgICAgICBraXQucGF0aCA9IGFzc2V0UGF0aCArICcvJyArIGtpdC5mb2xkZXJcbiAgICAgICAgIHJldHVybiBraXRcblxuICAgICAgcmV0dXJuIGtpdHNcblxuXG5cblxuICAgIyBDeWNsZXMgdGhlIGN1cnJlbnQgZHJ1bSBraXQgYmFja1xuICAgIyBAcmV0dXJuIHtLaXRNb2RlbH1cblxuICAgcHJldmlvdXNLaXQ6IC0+XG4gICAgICBsZW4gPSBAbGVuZ3RoXG5cbiAgICAgIGlmIEBraXRJZCA+IDBcbiAgICAgICAgIEBraXRJZC0tXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIEBraXRJZCA9IGxlbiAtIDFcblxuICAgICAga2l0TW9kZWwgPSBAYXQgQGtpdElkXG5cblxuXG5cbiAgICMgQ3ljbGVzIHRoZSBjdXJyZW50IGRydW0ga2l0IGZvcndhcmRcbiAgICMgQHJldHVybiB7S2l0TW9kZWx9XG5cbiAgIG5leHRLaXQ6IC0+XG4gICAgICBsZW4gPSBAbGVuZ3RoIC0gMVxuXG4gICAgICBpZiBAa2l0SWQgPCBsZW5cbiAgICAgICAgIEBraXRJZCsrXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIEBraXRJZCA9IDBcblxuICAgICAga2l0TW9kZWwgPSBAYXQgQGtpdElkXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdENvbGxlY3Rpb24iLCIjIyMqXG4gKiBLaXQgbW9kZWwgZm9yIGhhbmRsaW5nIHN0YXRlIHJlbGF0ZWQgdG8ga2l0IHNlbGVjdGlvblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkluc3RydW1lbnRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblxuXG5jbGFzcyBLaXRNb2RlbCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnbGFiZWwnOiAgICBudWxsXG4gICAgICAncGF0aCc6ICAgICBudWxsXG4gICAgICAnZm9sZGVyJzogICBudWxsXG5cbiAgICAgICMgQHR5cGUge0luc3RydW1lbnRDb2xsZWN0aW9ufVxuICAgICAgJ2luc3RydW1lbnRzJzogICBudWxsXG5cbiAgICAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cbiAgICAgICdjdXJyZW50SW5zdHJ1bWVudCc6IG51bGxcblxuXG5cbiAgICMgRm9ybWF0IHRoZSByZXNwb25zZSBzbyB0aGF0IGluc3RydW1lbnRzIGdldHMgcHJvY2Vzc2VkXG4gICAjIGJ5IGJhY2tib25lIHZpYSB0aGUgSW5zdHJ1bWVudENvbGxlY3Rpb24uICBBZGRpdGlvbmFsbHksXG4gICAjIHBhc3MgaW4gdGhlIHBhdGggc28gdGhhdCBhYnNvbHV0ZSBVUkwncyBjYW4gYmUgdXNlZFxuICAgIyB0byByZWZlcmVuY2Ugc291bmQgZGF0YVxuICAgIyBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcblxuICAgcGFyc2U6IChyZXNwb25zZSkgLT5cbiAgICAgIF8uZWFjaCByZXNwb25zZS5pbnN0cnVtZW50cywgKGluc3RydW1lbnQpIC0+XG4gICAgICAgICBpbnN0cnVtZW50LnNyYyA9IHJlc3BvbnNlLnBhdGggKyAnLycgKyBpbnN0cnVtZW50LnNyY1xuXG4gICAgICByZXNwb25zZS5pbnN0cnVtZW50cyA9IG5ldyBJbnN0cnVtZW50Q29sbGVjdGlvbiByZXNwb25zZS5pbnN0cnVtZW50c1xuXG4gICAgICByZXNwb25zZVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdE1vZGVsIiwiIyMjKlxuICogQ29sbGVjdGlvbiByZXByZXNlbnRpbmcgZWFjaCBzb3VuZCBmcm9tIGEga2l0IHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4vSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBJbnN0cnVtZW50Q29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICBtb2RlbDogSW5zdHJ1bWVudE1vZGVsXG5cblxuXG4gICAjIEV4cG9ydHMgdGhlIHBhdHRlcm4gc3F1YXJlcyBjb2xsZWN0aW9uIGZvciB1c2VcbiAgICMgd2l0aCB0cmFuc2ZlcnJpbmcgcHJvcHMgYWNyb3NzIGRpZmZlcmVudCBkcnVtIGtpdHNcblxuICAgZXhwb3J0UGF0dGVyblNxdWFyZXM6IC0+XG4gICAgICByZXR1cm4gQG1hcCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgICAgIGluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRDb2xsZWN0aW9uIiwiIyMjKlxuICogU291bmQgbW9kZWwgZm9yIGVhY2ggaW5kaXZpZHVhbCBraXQgc291bmQgc2V0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cblxuY2xhc3MgSW5zdHJ1bWVudE1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG4gICBkZWZhdWx0czpcblxuICAgICAgIyBAdHlwZSB7U3RyaW5nfVxuICAgICAgJ2ljb24nOiAgICBudWxsXG5cbiAgICAgICMgQHR5cGUge1N0cmluZ31cbiAgICAgICdsYWJlbCc6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgICAnc3JjJzogICAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7TnVtYmVyfVxuICAgICAgJ3ZvbHVtZSc6ICBudWxsXG5cbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG4gICAgICAnYWN0aXZlJzogIG51bGxcblxuICAgICAgIyBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgICdtdXRlJzogICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtCb29sZWFufVxuICAgICAgJ2ZvY3VzJzogICBudWxsXG5cbiAgICAgICMgQHR5cGUge1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9ufVxuICAgICAgJ3BhdHRlcm5TcXVhcmVzJzogICAgbnVsbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudE1vZGVsIiwiIyMjKlxuICBBIGNvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXNcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcENvbmZpZyAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAnLi9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi4vc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgIG1vZGVsOiBJbnN0cnVtZW50TW9kZWxcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uIiwiIyMjKlxuICBNb2RlbCBmb3IgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXMuICBQYXJ0IG9mIGxhcmdlciBQYXR0ZXJuIFRyYWNrIGNvbGxlY3Rpb25cblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlTW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ2FjdGl2ZSc6ICAgICAgICAgICBmYWxzZVxuICAgICAgJ2luc3RydW1lbnQnOiAgICAgICBudWxsXG4gICAgICAncHJldmlvdXNWZWxvY2l0eSc6IDBcbiAgICAgICd0cmlnZ2VyJzogICAgICAgICAgbnVsbFxuICAgICAgJ3ZlbG9jaXR5JzogICAgICAgICAwXG5cblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQG9uIEFwcEV2ZW50LkNIQU5HRV9WRUxPQ0lUWSwgQG9uVmVsb2NpdHlDaGFuZ2VcblxuXG5cbiAgIGN5Y2xlOiAtPlxuICAgICAgdmVsb2NpdHkgPSBAZ2V0ICd2ZWxvY2l0eSdcblxuICAgICAgaWYgdmVsb2NpdHkgPCBBcHBDb25maWcuVkVMT0NJVFlfTUFYXG4gICAgICAgICB2ZWxvY2l0eSsrXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIHZlbG9jaXR5ID0gMFxuXG4gICAgICBAc2V0ICd2ZWxvY2l0eScsIHZlbG9jaXR5XG5cblxuXG4gICBlbmFibGU6IC0+XG4gICAgICBAc2V0ICd2ZWxvY2l0eScsIDFcblxuXG5cblxuICAgZGlzYWJsZTogLT5cbiAgICAgIEBzZXQgJ3ZlbG9jaXR5JywgMFxuXG5cblxuICAgb25WZWxvY2l0eUNoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgQHNldCAncHJldmlvdXNWZWxvY2l0eScsIG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMudmVsb2NpdHlcblxuICAgICAgdmVsb2NpdHkgPSBtb2RlbC5jaGFuZ2VkLnZlbG9jaXR5XG5cbiAgICAgIGlmIHZlbG9jaXR5ID4gMFxuICAgICAgICAgQHNldCAnYWN0aXZlJywgdHJ1ZVxuXG4gICAgICBlbHNlIGlmIHZlbG9jaXR5IGlzIDBcbiAgICAgICAgIEBzZXQgJ2FjdGl2ZScsIGZhbHNlXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblNxdWFyZU1vZGVsIiwiIyMjKlxuICogTVBDIEFwcGxpY2F0aW9uIHJvdXRlclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcENvbmZpZyAgID0gcmVxdWlyZSAnLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5QdWJTdWIgICAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL1B1YlN1YidcblB1YkV2ZW50ICAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblxuIyBUT0RPOiBUaGUgYmVsb3cgaXRlbXMgYXJlIG9ubHkgaW5jbHVkZWQgZm9yIHRlc3RpbmcgY29tcG9uZW50XG4jIG1vZHVsYXJpdHkuICBUaGV5LCBhbmQgdGhlaXIgcm91dGVzLCBzaG91bGQgYmUgcmVtb3ZlZCBpbiBwcm9kdWN0aW9uXG5cblRlc3RzVmlldyAgICAgPSByZXF1aXJlICcuLi92aWV3cy90ZXN0cy9UZXN0c1ZpZXcuY29mZmVlJ1xuXG5WaWV3ID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5LaXRTZWxlY3RvciAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5LaXRNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlJ1xuXG5CUE1JbmRpY2F0b3IgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSdcbkluc3RydW1lbnRTZWxlY3RvclBhbmVsID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlJ1xuXG5JbnN0cnVtZW50TW9kZWwgPSAnLi4vbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSAnLi4vbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblBhdHRlcm5TcXVhcmUgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblRyYWNrICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2suY29mZmVlJ1xuU2VxdWVuY2VyICAgICAgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwUm91dGVyIGV4dGVuZHMgQmFja2JvbmUuUm91dGVyXG5cblxuICAgcm91dGVzOlxuICAgICAgJyc6ICAgICAgICAgICAgICdsYW5kaW5nUm91dGUnXG4gICAgICAnY3JlYXRlJzogICAgICAgJ2NyZWF0ZVJvdXRlJ1xuICAgICAgJ3NoYXJlJzogICAgICAgICdzaGFyZVJvdXRlJ1xuXG4gICAgICAjIENvbXBvbmVudCB0ZXN0IHJvdXRlc1xuICAgICAgJ3Rlc3RzJzogICAgICAgICAgICAgICAgJ3Rlc3RzJ1xuICAgICAgJ2tpdC1zZWxlY3Rpb24nOiAgICAgICAgJ2tpdFNlbGVjdGlvblJvdXRlJ1xuICAgICAgJ2JwbS1pbmRpY2F0b3InOiAgICAgICAgJ2JwbUluZGljYXRvclJvdXRlJ1xuICAgICAgJ2luc3RydW1lbnQtc2VsZWN0b3InOiAgJ2luc3RydW1lbnRTZWxlY3RvclJvdXRlJ1xuICAgICAgJ3BhdHRlcm4tc3F1YXJlJzogICAgICAgJ3BhdHRlcm5TcXVhcmVSb3V0ZSdcbiAgICAgICdwYXR0ZXJuLXRyYWNrJzogICAgICAgICdwYXR0ZXJuVHJhY2tSb3V0ZSdcbiAgICAgICdzZXF1ZW5jZXInOiAgICAgICAgICAgICdzZXF1ZW5jZXJSb3V0ZSdcbiAgICAgICdmdWxsLXNlcXVlbmNlcic6ICAgICAgICdmdWxsU2VxdWVuY2VyUm91dGUnXG5cblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHtAYXBwQ29udHJvbGxlciwgQGFwcE1vZGVsfSA9IG9wdGlvbnNcblxuICAgICAgUHViU3ViLm9uIFB1YkV2ZW50LlJPVVRFLCBAb25Sb3V0ZUNoYW5nZVxuXG5cblxuICAgb25Sb3V0ZUNoYW5nZTogKHBhcmFtcykgPT5cbiAgICAgIHtyb3V0ZX0gPSBwYXJhbXNcblxuICAgICAgQG5hdmlnYXRlIHJvdXRlLCB7IHRyaWdnZXI6IHRydWUgfVxuXG5cblxuICAgbGFuZGluZ1JvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLmxhbmRpbmdWaWV3XG5cblxuXG4gICBjcmVhdGVSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBAYXBwQ29udHJvbGxlci5jcmVhdGVWaWV3XG5cblxuXG4gICBzaGFyZVJvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLnNoYXJlVmlld1xuXG5cblxuXG5cblxuICAgIyBDT01QT05FTlQgVEVTVCBST1VURVNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICB0ZXN0czogLT5cbiAgICAgIHZpZXcgPSBuZXcgVGVzdHNWaWV3KClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAga2l0U2VsZWN0aW9uUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLFxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBicG1JbmRpY2F0b3JSb3V0ZTogLT5cbiAgICAgIHZpZXcgPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIHZpZXcucmVuZGVyKClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAgaW5zdHJ1bWVudFNlbGVjdG9yUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgdmlldyA9IG5ldyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAgcGF0dGVyblNxdWFyZVJvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbmV3IFBhdHRlcm5TcXVhcmVNb2RlbCgpXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG4gICBwYXR0ZXJuVHJhY2tSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgIG1vZGVsOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbiAgIHNlcXVlbmNlclJvdXRlOiAtPlxuXG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgU2VxdWVuY2VyXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbiAgIGZ1bGxTZXF1ZW5jZXJSb3V0ZTogLT5cblxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG5cbiAgICAgIGtpdFNlbGVjdGlvbiA9ID0+XG4gICAgICAgICB2aWV3ID0gbmV3IEtpdFNlbGVjdG9yXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICAgICB2aWV3XG5cblxuICAgICAgYnBtID0gPT5cbiAgICAgICAgIHZpZXcgPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgICAgIHZpZXdcblxuXG4gICAgICBpbnN0cnVtZW50U2VsZWN0aW9uID0gPT5cbiAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgICAgdmlldyA9IG5ldyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuICAgICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgICAgdmlld1xuXG5cbiAgICAgIHNlcXVlbmNlciA9ID0+XG4gICAgICAgICB2aWV3ID0gbmV3IFNlcXVlbmNlclxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgICAgIHZpZXdcblxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcgPSBuZXcgVmlldygpXG5cbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQga2l0U2VsZWN0aW9uKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgYnBtKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgaW5zdHJ1bWVudFNlbGVjdGlvbigpLnJlbmRlcigpLmVsXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldy4kZWwuYXBwZW5kIHNlcXVlbmNlcigpLnJlbmRlcigpLmVsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBmdWxsU2VxdWVuY2VyVmlld1xuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwUm91dGVyIiwiIyMjKlxuICogVmlldyBzdXBlcmNsYXNzIGNvbnRhaW5pbmcgc2hhcmVkIGZ1bmN0aW9uYWxpdHlcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDIuMTcuMTRcbiMjI1xuXG5cblZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZFxuXG5cblxuICAgIyBJbml0aWFsaXplcyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIF8uZXh0ZW5kIEAsIF8uZGVmYXVsdHMoIG9wdGlvbnMgPSBvcHRpb25zIHx8IEBkZWZhdWx0cywgQGRlZmF1bHRzIHx8IHt9IClcblxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgd2l0aCBzdXBwbGllZCB0ZW1wbGF0ZSBkYXRhLCBvciBjaGVja3MgaWYgdGVtcGxhdGUgaXMgb25cbiAgICMgb2JqZWN0IGJvZHlcbiAgICMgQHBhcmFtICB7RnVuY3Rpb258TW9kZWx9IHRlbXBsYXRlRGF0YVxuICAgIyBAcmV0dXJuIHtWaWV3fVxuXG4gICByZW5kZXI6ICh0ZW1wbGF0ZURhdGEpIC0+XG4gICAgICB0ZW1wbGF0ZURhdGEgPSB0ZW1wbGF0ZURhdGEgfHwge31cblxuICAgICAgaWYgQHRlbXBsYXRlXG5cbiAgICAgICAgICMgSWYgbW9kZWwgaXMgYW4gaW5zdGFuY2Ugb2YgYSBiYWNrYm9uZSBtb2RlbCwgdGhlbiBKU09OaWZ5IGl0XG4gICAgICAgICBpZiBAbW9kZWwgaW5zdGFuY2VvZiBCYWNrYm9uZS5Nb2RlbFxuICAgICAgICAgICAgdGVtcGxhdGVEYXRhID0gQG1vZGVsLnRvSlNPTigpXG5cbiAgICAgICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUgKHRlbXBsYXRlRGF0YSlcblxuICAgICAgQGRlbGVnYXRlRXZlbnRzKClcbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW1vdmVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbW92ZTogKG9wdGlvbnMpIC0+XG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuICAgICAgQCRlbC5yZW1vdmUoKVxuICAgICAgQHVuZGVsZWdhdGVFdmVudHMoKVxuXG5cblxuXG5cbiAgICMgU2hvd3MgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgc2hvdzogKG9wdGlvbnMpIC0+XG4gICAgICBUd2Vlbk1heC5zZXQgQCRlbCwgeyBhdXRvQWxwaGE6IDEgfVxuXG5cblxuXG4gICAjIEhpZGVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGhpZGU6IChvcHRpb25zKSAtPlxuICAgICAgVHdlZW5NYXguc2V0IEAkZWwsXG4gICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICBpZiBvcHRpb25zPy5yZW1vdmVcbiAgICAgICAgICAgICAgIEByZW1vdmUoKVxuXG5cblxuXG4gICAjIE5vb3Agd2hpY2ggaXMgY2FsbGVkIG9uIHJlbmRlclxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cblxuXG5cbiAgICMgUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBsaXN0ZW5lcnNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAc3RvcExpc3RlbmluZygpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXciLCIvKipcbiAqIEBtb2R1bGUgICAgIFB1YlN1YlxuICogQGRlc2MgICAgICAgR2xvYmFsIFB1YlN1YiBvYmplY3QgZm9yIGRpc3BhdGNoIGFuZCBkZWxlZ2F0aW9uXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBQdWJTdWIgPSB7fVxuXG5fLmV4dGVuZCggUHViU3ViLCBCYWNrYm9uZS5FdmVudHMgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFB1YlN1YiIsIiMjIypcbiAqIENyZWF0ZSB2aWV3IHdoaWNoIHRoZSB1c2VyIGNhbiBidWlsZCBiZWF0cyB3aXRoaW5cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cblZpZXcgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuS2l0U2VsZWN0b3IgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci5jb2ZmZWUnXG5JbnN0cnVtZW50U2VsZWN0b3JQYW5lbCA9IHJlcXVpcmUgJy4uLy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLmNvZmZlZSdcblNlcXVlbmNlciAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUnXG5CUE1JbmRpY2F0b3IgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci5jb2ZmZWUnXG50ZW1wbGF0ZSAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2NyZWF0ZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgQ3JlYXRlVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGtpdFNlbGVjdG9yQ29udGFpbmVyICAgPSBAJGVsLmZpbmQgJy5jb250YWluZXIta2l0LXNlbGVjdG9yJ1xuICAgICAgQCRraXRTZWxlY3RvciAgICAgICAgICAgID0gQCRlbC5maW5kICcua2l0LXNlbGVjdG9yJ1xuICAgICAgQCR2aXN1YWxpemF0aW9uQ29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLXZpc3VhbGl6YXRpb24nXG4gICAgICBAJHNlcXVlbmNlckNvbnRhaW5lciAgICAgPSBAJGVsLmZpbmQgJy5jb250YWluZXItc2VxdWVuY2VyJ1xuICAgICAgQCRpbnN0cnVtZW50U2VsZWN0b3IgICAgID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLmluc3RydW1lbnQtc2VsZWN0b3InXG4gICAgICBAJHNlcXVlbmNlciAgICAgICAgICAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuc2VxdWVuY2VyJ1xuICAgICAgQCRicG0gICAgICAgICAgICAgICAgICAgID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLmJwbSdcbiAgICAgIEAkc2hhcmVCdG4gICAgICAgICAgICAgICA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5idG4tc2hhcmUnXG5cbiAgICAgIEByZW5kZXJLaXRTZWxlY3RvcigpXG4gICAgICBAcmVuZGVySW5zdHJ1bWVudFNlbGVjdG9yKClcbiAgICAgIEByZW5kZXJTZXF1ZW5jZXIoKVxuICAgICAgQHJlbmRlckJQTSgpXG5cbiAgICAgIEBcblxuXG5cbiAgIHJlbmRlcktpdFNlbGVjdG9yOiAtPlxuICAgICAgQGtpdFNlbGVjdG9yID0gbmV3IEtpdFNlbGVjdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAJGtpdFNlbGVjdG9yLmh0bWwgQGtpdFNlbGVjdG9yLnJlbmRlcigpLmVsXG5cblxuXG4gICByZW5kZXJJbnN0cnVtZW50U2VsZWN0b3I6IC0+XG4gICAgICBAaW5zdHJ1bWVudFNlbGVjdG9yID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAJGluc3RydW1lbnRTZWxlY3Rvci5odG1sIEBpbnN0cnVtZW50U2VsZWN0b3IucmVuZGVyKCkuZWxcblxuXG5cbiAgIHJlbmRlclNlcXVlbmNlcjogLT5cbiAgICAgIEBzZXF1ZW5jZXIgPSBuZXcgU2VxdWVuY2VyXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgQCRzZXF1ZW5jZXIuaHRtbCBAc2VxdWVuY2VyLnJlbmRlcigpLmVsXG5cblxuXG4gICByZW5kZXJCUE06IC0+XG4gICAgICBAYnBtID0gbmV3IEJQTUluZGljYXRvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAJGJwbS5odG1sIEBicG0ucmVuZGVyKCkuZWxcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENyZWF0ZVZpZXciLCIjIyMqXG4gKiBCZWF0cyBwZXIgbWludXRlIHZpZXcgZm9yIGhhbmRsaW5nIHRlbXBvXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBFdmVudCAgPSByZXF1aXJlICcuLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvYnBtLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBCUE1JbmRpY2F0b3IgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBSZWYgdG8gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgVGhlIHNldEludGVydmFsIHVwZGF0ZSBpbnRlcnZhbCBmb3IgaW5jcmVhc2luZyBhbmRcbiAgICMgZGVjcmVhc2luZyBCUE0gb24gcHJlc3MgLyB0b3VjaFxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBpbnRlcnZhbFVwZGF0ZVRpbWU6IDcwXG5cblxuICAgIyBUaGUgc2V0SW50ZXJ2YWwgdXBkYXRlclxuICAgIyBAdHlwZSB7U2V0SW50ZXJ2YWx9XG5cbiAgIHVwZGF0ZUludGVydmFsOiBudWxsXG5cblxuICAgIyBUaGUgYW1vdW50IHRvIGluY3JlYXNlIHRoZSBCUE0gYnkgb24gZWFjaCB0aWNrXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGJwbUluY3JlYXNlQW1vdW50OiAxMFxuXG5cbiAgICMgVGhlIGN1cnJlbnQgYnBtIGJlZm9yZSBpdHMgc2V0IG9uIHRoZSBtb2RlbC4gIFVzZWQgdG8gYnVmZmVyXG4gICAjIHVwZGF0ZXMgYW5kIHRvIHByb3ZpZGUgZm9yIHNtb290aCBhbmltYXRpb25cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgY3VyckJQTTogbnVsbFxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hzdGFydCAuYnRuLWluY3JlYXNlJzogJ29uSW5jcmVhc2VCdG5Eb3duJ1xuICAgICAgJ3RvdWNoc3RhcnQgLmJ0bi1kZWNyZWFzZSc6ICdvbkRlY3JlYXNlQnRuRG93bidcbiAgICAgICd0b3VjaGVuZCAgIC5idG4taW5jcmVhc2UnOiAnb25CdG5VcCdcbiAgICAgICd0b3VjaGVuZCAgIC5idG4tZGVjcmVhc2UnOiAnb25CdG5VcCdcblxuXG5cblxuICAgIyBSZW5kZXIgdGhlIHZpZXcgYW5kIHVwZGF0ZSB0aGUga2l0IGlmIG5vdCBhbHJlYWR5XG4gICAjIHNldCB2aWEgYSBwcmV2aW91cyBzZXNzaW9uXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkYnBtTGFiZWwgICA9IEAkZWwuZmluZCAnLmxhYmVsLWJwbSdcbiAgICAgIEBpbmNyZWFzZUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1pbmNyZWFzZSdcbiAgICAgIEBkZWNyZWFzZUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1kZWNyZWFzZSdcblxuICAgICAgQGN1cnJCUE0gPSBAYXBwTW9kZWwuZ2V0KCdicG0nKVxuICAgICAgQCRicG1MYWJlbC50ZXh0IEBjdXJyQlBNXG4gICAgICBAb25CdG5VcCgpXG5cbiAgICAgIEBcblxuXG5cbiAgICMgQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgaGFuZGluZyBjaGFuZ2VzIHJlbGF0ZWQgdG9cbiAgICMgc3dpdGNoaW5nIEJQTVxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9CUE0sIEBvbkJQTUNoYW5nZVxuXG5cblxuXG4gICAjIFNldHMgYW4gaW50ZXJ2YWwgdG8gaW5jcmVhc2UgdGhlIEJQTSBtb25pdG9yLiAgQ2xlYXJzXG4gICAjIHdoZW4gdGhlIHVzZXIgcmVsZWFzZXMgdGhlIG1vdXNlXG5cbiAgIGluY3JlYXNlQlBNOiAtPlxuICAgICAgQHVwZGF0ZUludGVydmFsID0gc2V0SW50ZXJ2YWwgPT5cbiAgICAgICAgIGJwbSA9IEBjdXJyQlBNXG5cbiAgICAgICAgIGlmIGJwbSA8IEFwcENvbmZpZy5CUE1fTUFYXG4gICAgICAgICAgICBicG0gKz0gQGJwbUluY3JlYXNlQW1vdW50XG5cbiAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJwbSA9IEFwcENvbmZpZy5CUE1fTUFYXG5cbiAgICAgICAgIEBjdXJyQlBNID0gYnBtXG4gICAgICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cbiAgICAgICAgICNAYXBwTW9kZWwuc2V0ICdicG0nLCA2MDAwMCAvIEBjdXJyQlBNXG5cbiAgICAgICwgQGludGVydmFsVXBkYXRlVGltZVxuXG5cblxuXG4gICAjIFNldHMgYW4gaW50ZXJ2YWwgdG8gZGVjcmVhc2UgdGhlIEJQTSBtb25pdG9yLiAgQ2xlYXJzXG4gICAjIHdoZW4gdGhlIHVzZXIgcmVsZWFzZXMgdGhlIG1vdXNlXG5cbiAgIGRlY3JlYXNlQlBNOiAtPlxuICAgICAgQHVwZGF0ZUludGVydmFsID0gc2V0SW50ZXJ2YWwgPT5cbiAgICAgICAgIGJwbSA9IEBjdXJyQlBNXG5cbiAgICAgICAgIGlmIGJwbSA+IDBcbiAgICAgICAgICAgIGJwbSAtPSBAYnBtSW5jcmVhc2VBbW91bnRcblxuICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnBtID0gMFxuXG4gICAgICAgICBAY3VyckJQTSA9IGJwbVxuICAgICAgICAgQCRicG1MYWJlbC50ZXh0IEBjdXJyQlBNXG4gICAgICAgICAjQGFwcE1vZGVsLnNldCAnYnBtJywgNjAwMDAgLyBAY3VyckJQTVxuXG4gICAgICAsIEBpbnRlcnZhbFVwZGF0ZVRpbWVcblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGxlZnQgYnV0dG9uIGNsaWNrcy4gIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gYW5kXG4gICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25JbmNyZWFzZUJ0bkRvd246IChldmVudCkgPT5cbiAgICAgIEBpbmNyZWFzZUJQTSgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkRlY3JlYXNlQnRuRG93bjogKGV2ZW50KSAtPlxuICAgICAgQGRlY3JlYXNlQlBNKClcblxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG1vdXNlIC8gdG91Y2h1cCBldmVudHMuICBDbGVhcnMgdGhlIGludGVydmFsXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uQnRuVXA6IChldmVudCkgLT5cbiAgICAgIGNsZWFySW50ZXJ2YWwgQHVwZGF0ZUludGVydmFsXG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBudWxsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2JwbScsIDYwMDAwIC8gQGN1cnJCUE1cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGxhYmVsIG9uIHRoZVxuICAgIyBraXQgc2VsZWN0b3JcblxuICAgb25CUE1DaGFuZ2U6IChtb2RlbCkgLT5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEJQTUluZGljYXRvciIsIiMjIypcbiAqIEtpdCBzZWxlY3RvciBmb3Igc3dpdGNoaW5nIGJldHdlZW4gZHJ1bS1raXQgc291bmRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwRXZlbnQgPSByZXF1aXJlICcuLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2tpdC1zZWxlY3Rpb24tdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEtpdFNlbGVjdG9yIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgUmVmIHRvIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgS2l0Q29sbGVjdGlvbiBmb3IgdXBkYXRpbmcgc291bmRzXG4gICAjIEB0eXBlIHtLaXRDb2xsZWN0aW9ufVxuXG4gICBraXRDb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBUaGUgY3VycmVudCBraXRcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRNb2RlbDogbnVsbFxuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5idG4tbGVmdCc6ICAgJ29uTGVmdEJ0bkNsaWNrJ1xuICAgICAgJ3RvdWNoZW5kIC5idG4tcmlnaHQnOiAgJ29uUmlnaHRCdG5DbGljaydcblxuXG5cblxuICAgIyBSZW5kZXIgdGhlIHZpZXcgYW5kIHVwZGF0ZSB0aGUga2l0IGlmIG5vdCBhbHJlYWR5XG4gICAjIHNldCB2aWEgYSBwcmV2aW91cyBzZXNzaW9uXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAka2l0TGFiZWwgPSBAJGVsLmZpbmQgJy5sYWJlbC1raXQnXG5cbiAgICAgIGlmIEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJykgaXMgbnVsbFxuICAgICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAJGtpdExhYmVsLnRleHQgQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKS5nZXQgJ2xhYmVsJ1xuXG4gICAgICBAXG5cblxuXG5cbiAgICMgQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgaGFuZGluZyBjaGFuZ2VzIHJlbGF0ZWQgdG9cbiAgICMgc3dpdGNoaW5nIGRydW0ga2l0c1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9LSVQsIEBvbkNoYW5nZUtpdFxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGxlZnQgYnV0dG9uIGNsaWNrcy4gIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gYW5kXG4gICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcblxuICAgb25MZWZ0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ucHJldmlvdXNLaXQoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGxlZnQgYnV0dG9uIGNsaWNrcy4gIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gYW5kXG4gICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcblxuICAgb25SaWdodEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2UgZXZlbnRzLiAgVXBkYXRlcyB0aGUgbGFiZWwgb24gdGhlXG4gICAjIGtpdCBzZWxlY3RvclxuXG4gICBvbkNoYW5nZUtpdDogKG1vZGVsKSAtPlxuICAgICAgQGtpdE1vZGVsID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbFxuICAgICAgQCRraXRMYWJlbC50ZXh0IEBraXRNb2RlbC5nZXQgJ2xhYmVsJ1xuXG5cblxuXG5cbiAgICMgUFJJVkFURSBNRVRIT0RTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRTZWxlY3RvciIsIiMjIypcbiAqIFNvdW5kIHR5cGUgc2VsZWN0b3IgZm9yIGNob29zaW5nIHdoaWNoIHNvdW5kIHNob3VsZFxuICogcGxheSBvbiBlYWNoIHRyYWNrXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuXG5BcHBFdmVudCAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvaW5zdHJ1bWVudC10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgSW5zdHJ1bWVudCBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSB2aWV3IGNsYXNzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ2luc3RydW1lbnQnXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBSZWYgdG8gdGhlIEluc3RydW1lbnRNb2RlbFxuICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuXG4gICBtb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBwYXJlbnQga2l0XG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0TW9kZWw6IG51bGxcblxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kJzogJ29uQ2xpY2snXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgY2xpY2sgZXZlbnRzLiAgVXBkYXRlcyB0aGUgY3VycmVudCBpbnN0cnVtZW50IG1vZGVsLCB3aGljaFxuICAgIyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCBsaXN0ZW5zIHRvLCBhbmQgYWRkcyBhIHNlbGVjdGVkIHN0YXRlXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBraXRNb2RlbC5zZXQgJ2N1cnJlbnRJbnN0cnVtZW50JywgQG1vZGVsXG4gICAgICBAJGVsLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnQiLCIjIyMqXG4gKiBQYW5lbCB3aGljaCBob3VzZXMgZWFjaCBpbmRpdmlkdWFsIHNlbGVjdGFibGUgc291bmRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbkluc3RydW1lbnQgID0gcmVxdWlyZSAnLi9JbnN0cnVtZW50LmNvZmZlZSdcbnRlbXBsYXRlICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvaW5zdHJ1bWVudC1wYW5lbC10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBSZWYgdG8gdGhlIGFwcGxpY2F0aW9uIG1vZGVsXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byBraXQgY29sbGVjdGlvblxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGtpdFxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdE1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8gaW5zdHJ1bWVudCB2aWV3c1xuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIGluc3RydW1lbnRWaWV3czogbnVsbFxuXG5cblxuXG4gICAjIEluaXRpYWxpemVzIHRoZSBpbnN0cnVtZW50IHNlbGVjdG9yIGFuZCBzZXRzIGEgbG9jYWwgcmVmXG4gICAjIHRvIHRoZSBjdXJyZW50IGtpdCBtb2RlbCBmb3IgZWFzeSBhY2Nlc3NcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBraXRNb2RlbCA9IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJylcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGFzIHdlbGwgYXMgdGhlIGFzc29jaWF0ZWQga2l0IGluc3RydW1lbnRzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkY29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLWluc3RydW1lbnRzJ1xuXG4gICAgICBAcmVuZGVySW5zdHJ1bWVudHMoKVxuXG4gICAgICBAXG5cblxuXG5cbiAgICMgUmVuZGVycyBlYWNoIGluZGl2aWR1YWwga2l0IG1vZGVsIGludG8gYW4gSW5zdHJ1bWVudFxuXG4gICByZW5kZXJJbnN0cnVtZW50czogLT5cbiAgICAgIEBpbnN0cnVtZW50Vmlld3MgPSBbXVxuXG4gICAgICBAa2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgICAgaW5zdHJ1bWVudCA9IG5ldyBJbnN0cnVtZW50XG4gICAgICAgICAgICBraXRNb2RlbDogQGtpdE1vZGVsXG4gICAgICAgICAgICBtb2RlbDogbW9kZWxcblxuICAgICAgICAgQCRjb250YWluZXIuYXBwZW5kIGluc3RydW1lbnQucmVuZGVyKCkuZWxcbiAgICAgICAgIEBpbnN0cnVtZW50Vmlld3MucHVzaCBpbnN0cnVtZW50XG5cblxuXG5cbiAgICMgQWRkcyBldmVudCBsaXN0ZW5lcnMgcmVsYXRlZCB0byBraXQgY2hhbmdlc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9LSVQsIEBvbktpdENoYW5nZVxuICAgICAgQGxpc3RlblRvIEBraXRNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0lOU1RSVU1FTlQsIEBvbkluc3RydW1lbnRDaGFuZ2VcblxuXG5cbiAgICMgUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAc3RvcExpc3RlbmluZygpXG5cblxuXG5cblxuICAgIyBFVkVOVCBMSVNURU5FUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBDbGVhbnMgdXAgdGhlIHZpZXcgYW5kIHJlLXJlbmRlcnNcbiAgICMgdGhlIGluc3RydW1lbnRzIHRvIHRoZSBET01cbiAgICMgQHBhcmFtIHtLaXRNb2RlbH0gbW9kZWxcblxuICAgb25LaXRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG5cbiAgICAgIEBraXRNb2RlbCA9IG1vZGVsLmNoYW5nZWQua2l0TW9kZWxcblxuICAgICAgXy5lYWNoIEBpbnN0cnVtZW50Vmlld3MsIChpbnN0cnVtZW50KSAtPlxuICAgICAgICAgaW5zdHJ1bWVudC5yZW1vdmUoKVxuXG4gICAgICBAcmVuZGVySW5zdHJ1bWVudHMoKVxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgb25JbnN0cnVtZW50Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAJGNvbnRhaW5lci5maW5kKCcuaW5zdHJ1bWVudCcpLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcblxuXG5cblxuXG4gICBvblRlc3RDbGljazogKGV2ZW50KSAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5uZXh0S2l0KClcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRTZWxlY3RvclBhbmVsIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdjb250YWluZXItaW5zdHJ1bWVudHMnPlxcblxcbjwvZGl2PlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPSdpY29uIFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5pY29uKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5pY29uOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiJz48L2Rpdj5cXG48ZGl2IGNsYXNzPSdsYWJlbCc+XFxuXHRcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmxhYmVsOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuPC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwiIyMjKlxuICogSW5kaXZpZHVhbCBzZXF1ZW5jZXIgdHJhY2tzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYXR0ZXJuLXNxdWFyZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgUGF0dGVyblNxdWFyZSBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBjb250YWluZXIgY2xhc3NuYW1lXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3BhdHRlcm4tc3F1YXJlJ1xuXG5cbiAgICMgVGhlIERPTSB0YWcgYW5lbVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICB0YWdOYW1lOiAndGQnXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFRoZSBtb2RlbCB3aGljaCBjb250cm9scyB2b2x1bWUsIHBsYXliYWNrLCBldGNcbiAgICMgQHR5cGUge1BhdHRlcm5TcXVhcmVNb2RlbH1cbiAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbnVsbFxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQnOiAnb25DbGljaydcblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBhbmQgaW5zdGFudGlhdGVzIHRoZSBob3dsZXIgYXVkaW8gZW5naW5lXG4gICAjIEBwYXR0ZXJuU3F1YXJlTW9kZWwge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBhdWRpb1NyYyA9IEBwYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCdpbnN0cnVtZW50JykuZ2V0ICdzcmMnXG5cbiAgICAgICMgVE9ETzogVGVzdCBtZXRob2RzXG4gICAgICBpZiB3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCd0ZXN0JykgaXNudCAtMSB0aGVuIGF1ZGlvU3JjID0gJydcblxuICAgICAgQGF1ZGlvUGxheWJhY2sgPSBuZXcgSG93bFxuICAgICAgICAgdm9sdW1lOiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5sb3dcbiAgICAgICAgIHVybHM6IFthdWRpb1NyY11cbiAgICAgICAgIG9uZW5kOiBAb25Tb3VuZEVuZFxuXG4gICAgICBAXG5cblxuXG5cbiAgICMgUmVtb3ZlIHRoZSB2aWV3IGFuZCBkZXN0cm95IHRoZSBhdWRpbyBwbGF5YmFja1xuXG4gICByZW1vdmU6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjay51bmxvYWQoKVxuICAgICAgc3VwZXIoKVxuXG5cblxuXG4gICAjIEFkZHMgZXZlbnQgbGlzdGVuZXJzIGFuZCBiZWdpbnMgbGlzdGVuaW5nIGZvciB2ZWxvY2l0eSwgYWN0aXZpdHkgYW5kIHRyaWdnZXJzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9WRUxPQ0lUWSwgQG9uVmVsb2NpdHlDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAcGF0dGVyblNxdWFyZU1vZGVsLCBBcHBFdmVudC5DSEFOR0VfQUNUSVZFLCAgIEBvbkFjdGl2ZUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9UUklHR0VSLCAgQG9uVHJpZ2dlckNoYW5nZVxuXG5cblxuXG4gICAjIEVuYWJsZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgIGVuYWJsZTogLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuZW5hYmxlKClcblxuXG5cblxuICAgIyBEaXNhYmxlIHBsYXliYWNrIG9mIHRoZSBhdWRpbyBzcXVhcmVcblxuICAgZGlzYWJsZTogLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuZGlzYWJsZSgpXG5cblxuXG5cbiAgICMgUGxheWJhY2sgYXVkaW8gb24gdGhlIGF1ZGlvIHNxdWFyZVxuXG4gICBwbGF5OiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2sucGxheSgpXG5cbiAgICAgIFR3ZWVuTWF4LnRvIEAkZWwsIC4yLFxuICAgICAgICAgZWFzZTogQmFjay5lYXNlSW5cbiAgICAgICAgIHNjYWxlOiAuNVxuXG4gICAgICAgICBvbkNvbXBsZXRlOiA9PlxuXG4gICAgICAgICAgICBUd2Vlbk1heC50byBAJGVsLCAuMixcbiAgICAgICAgICAgICAgIHNjYWxlOiAxXG4gICAgICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBjbGljayBldmVudHMgb24gdGhlIGF1ZGlvIHNxdWFyZS4gIFRvZ2dsZXMgdGhlXG4gICAjIHZvbHVtZSBmcm9tIGxvdyB0byBoaWdoIHRvIG9mZlxuXG4gICBvbkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmN5Y2xlKClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciB2ZWxvY2l0eSBjaGFuZ2UgZXZlbnRzLiAgVXBkYXRlcyB0aGUgdmlzdWFsIGRpc3BsYXkgYW5kIHNldHMgdm9sdW1lXG4gICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gICBvblZlbG9jaXR5Q2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICB2ZWxvY2l0eSA9IG1vZGVsLmNoYW5nZWQudmVsb2NpdHlcblxuICAgICAgQCRlbC5yZW1vdmVDbGFzcyAndmVsb2NpdHktbG93IHZlbG9jaXR5LW1lZGl1bSB2ZWxvY2l0eS1oaWdoJ1xuXG4gICAgICAjIFNldCB2aXN1YWwgaW5kaWNhdG9yXG4gICAgICB2ZWxvY2l0eUNsYXNzID0gc3dpdGNoIHZlbG9jaXR5XG4gICAgICAgICB3aGVuIDEgdGhlbiAndmVsb2NpdHktbG93J1xuICAgICAgICAgd2hlbiAyIHRoZW4gJ3ZlbG9jaXR5LW1lZGl1bSdcbiAgICAgICAgIHdoZW4gMyB0aGVuICd2ZWxvY2l0eS1oaWdoJ1xuICAgICAgICAgZWxzZSAnJ1xuXG4gICAgICBAJGVsLmFkZENsYXNzIHZlbG9jaXR5Q2xhc3NcblxuXG4gICAgICAjIFNldCBhdWRpbyB2b2x1bWVcbiAgICAgIHZvbHVtZSA9IHN3aXRjaCB2ZWxvY2l0eVxuICAgICAgICAgd2hlbiAxIHRoZW4gQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubG93XG4gICAgICAgICB3aGVuIDIgdGhlbiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5tZWRpdW1cbiAgICAgICAgIHdoZW4gMyB0aGVuIEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLmhpZ2hcbiAgICAgICAgIGVsc2UgJydcblxuICAgICAgQGF1ZGlvUGxheWJhY2sudm9sdW1lKCB2b2x1bWUgKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGFjdGl2aXR5IGNoYW5nZSBldmVudHMuICBXaGVuIGluYWN0aXZlLCBjaGVja3MgYWdhaW5zdCBwbGF5YmFjayBhcmVcbiAgICMgbm90IHBlcmZvcm1lZCBhbmQgdGhlIHNxdWFyZSBpcyBza2lwcGVkLlxuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25BY3RpdmVDaGFuZ2U6IChtb2RlbCkgLT5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciB0cmlnZ2VyIFwicGxheWJhY2tcIiBldmVudHNcbiAgICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uVHJpZ2dlckNoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgaWYgbW9kZWwuY2hhbmdlZC50cmlnZ2VyIGlzIHRydWVcbiAgICAgICAgIEBwbGF5KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBzb3VuZCBwbGF5YmFjayBlbmQgZXZlbnRzLiAgUmVtb3ZlcyB0aGUgdHJpZ2dlclxuICAgIyBmbGFnIHNvIHRoZSBhdWRpbyB3b24ndCBvdmVybGFwXG5cbiAgIG9uU291bmRFbmQ6ID0+XG4gICAgICBAcGF0dGVyblNxdWFyZU1vZGVsLnNldCAndHJpZ2dlcicsIGZhbHNlXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblNxdWFyZSIsIiMjIypcbiAqIEluZGl2aWR1YWwgc2VxdWVuY2VyIHRyYWNrc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmUgICAgICAgICAgID0gcmVxdWlyZSAnLi9QYXR0ZXJuU3F1YXJlLmNvZmZlZSdcblZpZXcgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYXR0ZXJuLXRyYWNrLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBQYXR0ZXJuVHJhY2sgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgbmFtZSBvZiB0aGUgY2xhc3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAncGF0dGVybi10cmFjaydcblxuXG4gICAjIFRoZSB0eXBlIG9mIHRhZ1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICB0YWdOYW1lOiAndHInXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIEEgY29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIHZpZXcgc3F1YXJlc1xuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIHBhdHRlcm5TcXVhcmVWaWV3czogbnVsbFxuXG5cbiAgICMgQHR5cGUge1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9ufVxuICAgY29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cbiAgIG1vZGVsOiBudWxsXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLmxhYmVsLWluc3RydW1lbnQnOiAnb25MYWJlbENsaWNrJ1xuICAgICAgJ3RvdWNoZW5kIC5idG4tbXV0ZSc6ICAgICAgICAgJ29uTXV0ZUJ0bkNsaWNrJ1xuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYW5kIHJlbmRlcnMgb3V0IGluZGl2aWR1YWwgcGF0dGVybiBzcXVhcmVzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkbGFiZWwgPSBAJGVsLmZpbmQgJy5sYWJlbC1pbnN0cnVtZW50J1xuXG4gICAgICBAcmVuZGVyUGF0dGVyblNxdWFyZXMoKVxuXG4gICAgICBAXG5cblxuXG5cbiAgICMgQWRkIGxpc3RlbmVycyB0byB0aGUgdmlldyB3aGljaCBsaXN0ZW4gZm9yIHZpZXcgY2hhbmdlc1xuICAgIyBhcyB3ZWxsIGFzIGNoYW5nZXMgdG8gdGhlIGNvbGxlY3Rpb24sIHdoaWNoIHNob3VsZCB1cGRhdGVcbiAgICMgcGF0dGVybiBzcXVhcmVzIHdpdGhvdXQgcmUtcmVuZGVyaW5nIHRoZSB2aWV3c1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBraXRNb2RlbCA9IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJylcblxuICAgICAgQGxpc3RlblRvIEBtb2RlbCwgICAgQXBwRXZlbnQuQ0hBTkdFX0ZPQ1VTLCAgICAgIEBvbkZvY3VzQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQG1vZGVsLCAgICBBcHBFdmVudC5DSEFOR0VfTVVURSwgICAgICAgQG9uTXV0ZUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBraXRNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0lOU1RSVU1FTlQsIEBvbkluc3RydW1lbnRDaGFuZ2VcblxuXG5cblxuICAgIyBSZW5kZXIgb3V0IHRoZSBwYXR0ZXJuIHNxdWFyZXMgYW5kIHB1c2ggdGhlbSBpbnRvIGFuIGFycmF5XG4gICAjIGZvciBmdXJ0aGVyIGl0ZXJhdGlvblxuXG4gICByZW5kZXJQYXR0ZXJuU3F1YXJlczogLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlVmlld3MgPSBbXVxuXG4gICAgICBAY29sbGVjdGlvbiA9IG5ldyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvblxuXG4gICAgICBfKDgpLnRpbWVzID0+XG4gICAgICAgICBAY29sbGVjdGlvbi5hZGQgbmV3IFBhdHRlcm5TcXVhcmVNb2RlbCB7IGluc3RydW1lbnQ6IEBtb2RlbCB9XG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgICAgcGF0dGVyblNxdWFyZSA9IG5ldyBQYXR0ZXJuU3F1YXJlXG4gICAgICAgICAgICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG1vZGVsXG5cbiAgICAgICAgIEAkbGFiZWwudGV4dCBtb2RlbC5nZXQgJ2xhYmVsJ1xuICAgICAgICAgQCRlbC5hcHBlbmQgcGF0dGVyblNxdWFyZS5yZW5kZXIoKS5lbFxuICAgICAgICAgQHBhdHRlcm5TcXVhcmVWaWV3cy5wdXNoIHBhdHRlcm5TcXVhcmVcblxuICAgICAgIyBTZXQgdGhlIHNxdWFyZXMgb24gdGhlIEluc3RydW1lbnQgbW9kZWwgdG8gdHJhY2sgYWdhaW5zdCBzdGF0ZVxuICAgICAgQG1vZGVsLnNldCAncGF0dGVyblNxdWFyZXMnLCBAY29sbGVjdGlvblxuXG5cblxuICAgIyBNdXRlIHRoZSBlbnRpcmUgdHJhY2tcblxuICAgbXV0ZTogLT5cbiAgICAgIEBtb2RlbC5zZXQgJ211dGUnLCB0cnVlXG5cblxuXG4gICAjIFVubXV0ZSB0aGUgZW50aXJlIHRyYWNrXG5cbiAgIHVubXV0ZTogLT5cbiAgICAgIEBtb2RlbC5zZXQgJ211dGUnLCBmYWxzZVxuXG5cblxuICAgc2VsZWN0OiAtPlxuICAgICAgQCRlbC5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cblxuXG4gICBkZXNlbGVjdDogLT5cbiAgICAgIGlmIEAkZWwuaGFzQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgICAgQCRlbC5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG5cblxuXG4gICBmb2N1czogLT5cbiAgICAgIEAkZWwuYWRkQ2xhc3MgJ2ZvY3VzJ1xuXG5cblxuXG4gICB1bmZvY3VzOiAtPlxuICAgICAgaWYgQCRlbC5oYXNDbGFzcyAnZm9jdXMnXG4gICAgICAgICBAJGVsLnJlbW92ZUNsYXNzICdmb2N1cydcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBjaGFuZ2VzIHRvIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgaW5zdHJ1bWVudFxuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gaW5zdHJ1bWVudE1vZGVsXG5cbiAgIG9uSW5zdHJ1bWVudENoYW5nZTogKGluc3RydW1lbnRNb2RlbCkgPT5cbiAgICAgIGluc3RydW1lbnQgPSBpbnN0cnVtZW50TW9kZWwuY2hhbmdlZC5jdXJyZW50SW5zdHJ1bWVudFxuXG4gICAgICBpZiBpbnN0cnVtZW50LmNpZCBpcyBAbW9kZWwuY2lkXG4gICAgICAgICBAc2VsZWN0KClcblxuICAgICAgZWxzZSBAZGVzZWxlY3QoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgbW9kZWwgY2hhbmdlIGV2ZW50c1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25NdXRlQ2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBtdXRlID0gbW9kZWwuY2hhbmdlZC5tdXRlXG5cbiAgICAgIGlmIG11dGVcbiAgICAgICAgIEAkZWwuYWRkQ2xhc3MgJ211dGUnXG5cbiAgICAgIGVsc2UgQCRlbC5yZW1vdmVDbGFzcyAnbXV0ZSdcblxuXG5cbiAgICMgSGFuZGxlciBmb3IgZm9jdXMgY2hhbmdlIGV2ZW50c1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25Gb2N1c0NoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgaWYgbW9kZWwuY2hhbmdlZC5mb2N1c1xuICAgICAgICAgIEBmb2N1cygpXG4gICAgICBlbHNlXG4gICAgICAgICAgQHVuZm9jdXMoKVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtdXRlIGJ1dHRvbiBjbGlja3NcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uTGFiZWxDbGljazogKGV2ZW50KSA9PlxuICAgICAgaWYgQG1vZGVsLmdldCgnbXV0ZScpIGlzbnQgdHJ1ZVxuICAgICAgICAgQG1vZGVsLnNldCAnZm9jdXMnLCAhIEBtb2RlbC5nZXQoJ2ZvY3VzJylcblxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgYnV0dG9uIGNsaWNrc1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25NdXRlQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICAgIGlmIEBtb2RlbC5nZXQgJ211dGUnXG4gICAgICAgICBAdW5tdXRlKClcblxuICAgICAgZWxzZSBAbXV0ZSgpXG5cblxuXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuVHJhY2siLCIjIyMqXG4gKiBTZXF1ZW5jZXIgcGFyZW50IHZpZXcgZm9yIHRyYWNrIHNlcXVlbmNlc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblBhdHRlcm5UcmFjayA9IHJlcXVpcmUgJy4vUGF0dGVyblRyYWNrLmNvZmZlZSdcbkFwcEV2ZW50ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5oZWxwZXJzICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycydcbnRlbXBsYXRlICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3NlcXVlbmNlci10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgU2VxdWVuY2VyIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIG5hbWUgb2YgdGhlIGNvbnRhaW5lciBjbGFzc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdzZXF1ZW5jZXItY29udGFpbmVyJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBBbiBhcnJheSBvZiBhbGwgcGF0dGVybiB0cmFja3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgcGF0dGVyblRyYWNrVmlld3M6IG51bGxcblxuXG4gICAjIFRoZSBzZXRJbnRlcnZhbCB0aWNrZXJcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgYnBtSW50ZXJ2YWw6IG51bGxcblxuXG4gICAjIFRoZSB0aW1lIGluIHdoaWNoIHRoZSBpbnRlcnZhbCBmaXJlc1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICB1cGRhdGVJbnRlcnZhbFRpbWU6IDIwMFxuXG5cbiAgICMgVGhlIGN1cnJlbnQgYmVhdCBpZFxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBjdXJyQmVhdENlbGxJZDogLTFcblxuXG4gICAjIFRPRE86IFVwZGF0ZSB0aGlzIHRvIG1ha2UgaXQgbW9yZSBkeW5hbWljXG4gICAjIFRoZSBudW1iZXIgb2YgYmVhdCBjZWxsc1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBudW1DZWxsczogN1xuXG5cbiAgICMgR2xvYmFsIGFwcGxpY2F0aW9uIG1vZGVsXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIENvbGxlY3Rpb24gb2YgaW5zdHJ1bWVudHNcbiAgICMgQHR5cGUge0luc3RydW1lbnRDb2xsZWN0aW9ufVxuXG4gICBjb2xsZWN0aW9uOiBudWxsXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH1cblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCR0aFN0ZXBwZXIgPSBAJGVsLmZpbmQgJ3RoLnN0ZXBwZXInXG4gICAgICBAJHNlcXVlbmNlciA9IEAkZWwuZmluZCAnLnNlcXVlbmNlcidcblxuICAgICAgQHJlbmRlclRyYWNrcygpXG4gICAgICBAcGxheSgpXG5cbiAgICAgIEBcblxuXG4gICAjIFJlbW92ZXMgdGhlIHZpZXcgZnJvbSB0aGUgRE9NIGFuZCBjYW5jZWxzXG4gICAjIHRoZSB0aWNrZXIgaW50ZXJ2YWxcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgc3VwZXIoKVxuICAgICAgQHBhdXNlKClcblxuXG5cbiAgICMgQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgaGFuZGxpbmcgaW5zdHJ1bWVudCBhbmQgcGxheWJhY2tcbiAgICMgY2hhbmdlcy4gIFVwZGF0ZXMgYWxsIG9mIHRoZSB2aWV3cyBhY2NvcmRpbmdseVxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9CUE0sIEBvbkJQTUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1BMQVlJTkcsIEBvblBsYXlpbmdDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9LSVQsIEBvbktpdENoYW5nZVxuXG4gICAgICBAbGlzdGVuVG8gQGNvbGxlY3Rpb24sIEFwcEV2ZW50LkNIQU5HRV9GT0NVUywgQG9uRm9jdXNDaGFuZ2VcblxuXG5cbiAgICMgUmVuZGVycyBvdXQgZWFjaCBpbmRpdmlkdWFsIHRyYWNrLlxuICAgIyBUT0RPOiBOZWVkIHRvIHVwZGF0ZSBzbyB0aGF0IGFsbCBvZiB0aGUgYmVhdCBzcXVhcmVzIGFyZW4ndFxuICAgIyBibG93biBhd2F5IGJ5IHRoZSByZS1yZW5kZXJcblxuICAgcmVuZGVyVHJhY2tzOiA9PlxuICAgICAgQCRlbC5maW5kKCcucGF0dGVybi10cmFjaycpLnJlbW92ZSgpXG5cbiAgICAgIEBwYXR0ZXJuVHJhY2tWaWV3cyA9IFtdXG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKG1vZGVsKSA9PlxuXG4gICAgICAgICBwYXR0ZXJuVHJhY2sgPSBuZXcgUGF0dGVyblRyYWNrXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBtb2RlbC5nZXQgJ3BhdHRlcm5TcXVhcmVzJ1xuICAgICAgICAgICAgbW9kZWw6IG1vZGVsXG5cbiAgICAgICAgIEBwYXR0ZXJuVHJhY2tWaWV3cy5wdXNoIHBhdHRlcm5UcmFja1xuICAgICAgICAgQCRzZXF1ZW5jZXIuYXBwZW5kIHBhdHRlcm5UcmFjay5yZW5kZXIoKS5lbFxuXG5cblxuXG4gICAjIFVwZGF0ZSB0aGUgdGlja2VyIHRpbWUsIGFuZCBhZHZhbmNlcyB0aGUgYmVhdFxuXG4gICB1cGRhdGVUaW1lOiA9PlxuICAgICAgQCR0aFN0ZXBwZXIucmVtb3ZlQ2xhc3MgJ3N0ZXAnXG4gICAgICBAY3VyckJlYXRDZWxsSWQgPSBpZiBAY3VyckJlYXRDZWxsSWQgPCBAbnVtQ2VsbHMgdGhlbiBAY3VyckJlYXRDZWxsSWQgKz0gMSBlbHNlIEBjdXJyQmVhdENlbGxJZCA9IDBcbiAgICAgICQoQCR0aFN0ZXBwZXJbQGN1cnJCZWF0Q2VsbElkXSkuYWRkQ2xhc3MgJ3N0ZXAnXG5cbiAgICAgIEBwbGF5QXVkaW8oKVxuXG5cblxuXG4gICAjIENvbnZlcnRzIG1pbGxpc2Vjb25kcyB0byBCUE1cblxuICAgY29udmVydEJQTTogLT5cbiAgICAgIHJldHVybiAyMDBcblxuXG5cbiAgICMgU3RhcnQgcGxheWJhY2sgb2Ygc2VxdWVuY2VyXG5cbiAgIHBsYXk6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgdHJ1ZVxuXG5cblxuXG4gICAjIFBhdXNlcyBzZXF1ZW5jZXIgcGxheWJhY2tcblxuICAgcGF1c2U6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgZmFsc2VcblxuXG5cblxuICAgIyBNdXRlcyB0aGUgc2VxdWVuY2VyXG5cbiAgIG11dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdtdXRlJywgdHJ1ZVxuXG5cblxuXG4gICAjIFVubXV0ZXMgdGhlIHNlcXVlbmNlclxuXG4gICB1bm11dGU6IC0+XG4gICAgICAgQGFwcE1vZGVsLnNldCAnbXV0ZScsIGZhbHNlXG5cblxuXG5cblxuICAgIyBQbGF5cyBhdWRpbyBvZiBlYWNoIHRyYWNrIGN1cnJlbnRseSBlbmFibGVkIGFuZCBvblxuXG4gICBwbGF5QXVkaW86IC0+XG4gICAgICBmb2N1c2VkSW5zdHJ1bWVudCA9ICBAY29sbGVjdGlvbi5maW5kV2hlcmUgeyBmb2N1czogdHJ1ZSB9XG5cbiAgICAgICMgQ2hlY2sgaWYgdGhlcmUncyBhIGZvY3VzZWQgdHJhY2sgYW5kIG9ubHlcbiAgICAgICMgcGxheSBhdWRpbyBmcm9tIHRoZXJlXG5cbiAgICAgIGlmIGZvY3VzZWRJbnN0cnVtZW50XG4gICAgICAgICBpZiBmb2N1c2VkSW5zdHJ1bWVudC5nZXQoJ211dGUnKSBpc250IHRydWVcbiAgICAgICAgICAgIGZvY3VzZWRJbnN0cnVtZW50LmdldCgncGF0dGVyblNxdWFyZXMnKS5lYWNoIChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgPT5cbiAgICAgICAgICAgICAgIEBwbGF5UGF0dGVyblNxdWFyZUF1ZGlvKCBwYXR0ZXJuU3F1YXJlLCBpbmRleCApXG5cbiAgICAgICAgIHJldHVyblxuXG5cbiAgICAgICMgSWYgbm90aGluZyBpcyBmb2N1c2VkLCB0aGVuIGNoZWNrIGFnYWluc3RcbiAgICAgICMgdGhlIGVudGlyZSBtYXRyaXhcblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgICAgIGlmIGluc3RydW1lbnQuZ2V0KCdtdXRlJykgaXNudCB0cnVlXG4gICAgICAgICAgICBpbnN0cnVtZW50LmdldCgncGF0dGVyblNxdWFyZXMnKS5lYWNoIChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgPT5cbiAgICAgICAgICAgICAgIEBwbGF5UGF0dGVyblNxdWFyZUF1ZGlvKCBwYXR0ZXJuU3F1YXJlLCBpbmRleCApXG5cblxuXG5cbiAgICMgUGxheXMgdGhlIGF1ZGlvIG9uIGFuIGluZGl2aWR1YWwgUGF0dGVyU3F1YXJlIGlmIHRlbXBvIGluZGV4XG4gICAjIGlzIHRoZSBzYW1lIGFzIHRoZSBpbmRleCB3aXRoaW4gdGhlIGNvbGxlY3Rpb25cbiAgICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlfSBwYXR0ZXJuU3F1YXJlXG4gICAjIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuXG4gICBwbGF5UGF0dGVyblNxdWFyZUF1ZGlvOiAocGF0dGVyblNxdWFyZSwgaW5kZXgpIC0+XG4gICAgICBpZiBAY3VyckJlYXRDZWxsSWQgaXMgaW5kZXhcbiAgICAgICAgIGlmIHBhdHRlcm5TcXVhcmUuZ2V0ICdhY3RpdmUnXG4gICAgICAgICAgICBwYXR0ZXJuU3F1YXJlLnNldCAndHJpZ2dlcicsIHRydWVcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBCUE0gdGVtcG8gY2hhbmdlc1xuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvbkJQTUNoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgY2xlYXJJbnRlcnZhbCBAYnBtSW50ZXJ2YWxcbiAgICAgIEB1cGRhdGVJbnRlcnZhbFRpbWUgPSBtb2RlbC5jaGFuZ2VkLmJwbVxuICAgICAgQGJwbUludGVydmFsID0gc2V0SW50ZXJ2YWwgQHVwZGF0ZVRpbWUsIEB1cGRhdGVJbnRlcnZhbFRpbWVcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBwbGF5YmFjayBjaGFuZ2VzLiAgSWYgcGF1c2VkLCBpdCBzdG9wcyBwbGF5YmFjayBhbmRcbiAgICMgY2xlYXJzIHRoZSBpbnRlcnZhbC4gIElmIHBsYXlpbmcsIGl0IHJlc2V0cyBpdFxuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvblBsYXlpbmdDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIHBsYXlpbmcgPSBtb2RlbC5jaGFuZ2VkLnBsYXlpbmdcblxuICAgICAgaWYgcGxheWluZ1xuICAgICAgICAgQGJwbUludGVydmFsID0gc2V0SW50ZXJ2YWwgQHVwZGF0ZVRpbWUsIEB1cGRhdGVJbnRlcnZhbFRpbWVcblxuICAgICAgZWxzZVxuICAgICAgICAgY2xlYXJJbnRlcnZhbCBAYnBtSW50ZXJ2YWxcbiAgICAgICAgIEBicG1JbnRlcnZhbCA9IG51bGxcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtdXRlIGFuZCB1bm11dGUgY2hhbmdlc1xuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvbk11dGVDaGFuZ2U6IChtb2RlbCkgPT5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlcywgYXMgc2V0IGZyb20gdGhlIEtpdFNlbGVjdG9yXG4gICAjIEBwYXJhbSB7S2l0TW9kZWx9IG1vZGVsXG5cbiAgIG9uS2l0Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAY29sbGVjdGlvbiA9IG1vZGVsLmNoYW5nZWQua2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpXG4gICAgICBAcmVuZGVyVHJhY2tzKClcblxuICAgICAgIyBFeHBvcnQgb2xkIHBhdHRlcm4gc3F1YXJlcyBzbyB0aGUgdXNlcnMgcGF0dGVybiBpc24ndCBibG93biBhd2F5XG4gICAgICAjIHdoZW4ga2l0IGNoYW5nZXMgb2NjdXJcblxuICAgICAgb2xkSW5zdHJ1bWVudENvbGxlY3Rpb24gPSBtb2RlbC5fcHJldmlvdXNBdHRyaWJ1dGVzLmtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKVxuICAgICAgb2xkUGF0dGVyblNxdWFyZXMgPSBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbi5leHBvcnRQYXR0ZXJuU3F1YXJlcygpXG5cblxuICAgICAgIyBVcGRhdGUgdGhlIG5ldyBjb2xsZWN0aW9uIHdpdGggb2xkIHBhdHRlcm4gc3F1YXJlIGRhdGFcbiAgICAgICMgYW5kIHRyaWdnZXIgVUkgdXBkYXRlcyBvbiBlYWNoIHNxdWFyZVxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChpbnN0cnVtZW50TW9kZWwsIGluZGV4KSAtPlxuICAgICAgICAgb2xkQ29sbGVjdGlvbiA9IG9sZFBhdHRlcm5TcXVhcmVzW2luZGV4XVxuICAgICAgICAgbmV3Q29sbGVjdGlvbiA9IGluc3RydW1lbnRNb2RlbC5nZXQgJ3BhdHRlcm5TcXVhcmVzJ1xuXG4gICAgICAgICAjIFVwZGF0ZSB0cmFjayAvIGluc3RydW1lbnQgbGV2ZWwgcHJvcGVydGllcyBsaWtlIHZvbHVtZSAvIG11dGUgLyBmb2N1c1xuICAgICAgICAgb2xkUHJvcHMgPSBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbi5hdChpbmRleClcblxuICAgICAgICAgdW5sZXNzIG9sZFByb3BzIGlzIHVuZGVmaW5lZFxuXG4gICAgICAgICAgICBvbGRQcm9wcyA9IG9sZFByb3BzLnRvSlNPTigpXG5cbiAgICAgICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICAgICAgIHZvbHVtZTogb2xkUHJvcHMudm9sdW1lXG4gICAgICAgICAgICAgICBhY3RpdmU6IG9sZFByb3BzLmFjdGl2ZVxuICAgICAgICAgICAgICAgbXV0ZTogICBvbGRQcm9wcy5tdXRlXG4gICAgICAgICAgICAgICBmb2N1czogIG9sZFByb3BzLmZvY3VzXG5cbiAgICAgICAgICMgQ2hlY2sgZm9yIGluY29uc2lzdGFuY2llcyBiZXR3ZWVuIG51bWJlciBvZiBpbnN0cnVtZW50c1xuICAgICAgICAgdW5sZXNzIG9sZENvbGxlY3Rpb24gaXMgdW5kZWZpbmVkXG5cbiAgICAgICAgICAgIG5ld0NvbGxlY3Rpb24uZWFjaCAocGF0dGVyblNxdWFyZSwgaW5kZXgpIC0+XG4gICAgICAgICAgICAgICBvbGRQYXR0ZXJuU3F1YXJlID0gb2xkQ29sbGVjdGlvbi5hdCBpbmRleFxuICAgICAgICAgICAgICAgcGF0dGVyblNxdWFyZS5zZXQgb2xkUGF0dGVyblNxdWFyZS50b0pTT04oKVxuXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBmb2N1cyBjaGFuZ2UgZXZlbnRzLiAgSXRlcmF0ZXMgb3ZlciBhbGwgb2YgdGhlIG1vZGVscyB3aXRoaW5cbiAgICMgdGhlIEluc3RydW1lbnRDb2xsZWN0aW9uIGFuZCB0b2dnbGVzIHRoZWlyIGZvY3VzIHRvIG9mZiBpZiB0aGUgY2hhbmdlZFxuICAgIyBtb2RlbCdzIGZvY3VzIGlzIHNldCB0byB0cnVlLlxuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25Gb2N1c0NoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAoaW5zdHJ1bWVudE1vZGVsKSA9PlxuICAgICAgICAgaWYgbW9kZWwuY2hhbmdlZC5mb2N1cyBpcyB0cnVlXG4gICAgICAgICAgICBpZiBtb2RlbC5jaWQgaXNudCBpbnN0cnVtZW50TW9kZWwuY2lkXG4gICAgICAgICAgICAgICBpbnN0cnVtZW50TW9kZWwuc2V0ICdmb2N1cycsIGZhbHNlXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VxdWVuY2VyIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCI7XG5cblxuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG5cbiAgYnVmZmVyICs9IFwiPHRkIGNsYXNzPSdsYWJlbC1pbnN0cnVtZW50Jz5cXG5cdFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxuPC90ZD5cXG48dGQgY2xhc3M9J2J0bi1tdXRlJz5cXG5cdG11dGVcXG48L3RkPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIHN0YWNrMiwgb3B0aW9ucywgc2VsZj10aGlzLCBoZWxwZXJNaXNzaW5nPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJcXG5cdFx0XHQ8dGggY2xhc3M9J3N0ZXBwZXInPjwvdGg+XFxuXHRcdFwiO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPHRhYmxlIGNsYXNzPSdzZXF1ZW5jZXInPlxcblx0PHRyPlxcblx0XHQ8dGg+PC90aD5cXG5cdFx0PHRoPjwvdGg+XFxuXFxuXHRcdFwiO1xuICBvcHRpb25zID0ge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9O1xuICBzdGFjazIgPSAoKHN0YWNrMSA9IGhlbHBlcnMucmVwZWF0IHx8IGRlcHRoMC5yZXBlYXQpLHN0YWNrMSA/IHN0YWNrMS5jYWxsKGRlcHRoMCwgOCwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcInJlcGVhdFwiLCA4LCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMiB8fCBzdGFjazIgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMjsgfVxuICBidWZmZXIgKz0gXCJcXG5cdDwvdHI+XFxuXFxuPC90YWJsZT5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxidXR0b24gY2xhc3M9J2J0bi1kZWNyZWFzZSc+REVDUkVBU0U8L2J1dHRvbj5cXG48c3BhbiBjbGFzcz0nbGFiZWwtYnBtJz4wPC9zcGFuPlxcbjxidXR0b24gY2xhc3M9J2J0bi1pbmNyZWFzZSc+SU5DUkVBU0U8L2J1dHRvbj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxidXR0b24gY2xhc3M9J2J0bi1sZWZ0Jz5MRUZUPC9idXR0b24+XFxuPHNwYW4gY2xhc3M9J2xhYmVsLWtpdCc+RFJVTSBLSVQ8L3NwYW4+XFxuPGJ1dHRvbiBjbGFzcz0nYnRuLXJpZ2h0Jz5SSUdIVDwvYnV0dG9uPlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0nY29udGFpbmVyLWtpdC1zZWxlY3Rvcic+XFxuXHQ8ZGl2IGNsYXNzPSdraXQtc2VsZWN0b3InPjwvZGl2PlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci12aXN1YWxpemF0aW9uJz5WaXN1YWxpemF0aW9uPC9kaXY+XFxuXFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLXNlcXVlbmNlcic+XFxuXFxuXHQ8ZGl2IGNsYXNzPSdpbnN0cnVtZW50LXNlbGVjdG9yJz5JbnN0cnVtZW50IFNlbGVjdG9yPC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPSdzZXF1ZW5jZXInPlNlcXVlbmNlcjwvZGl2Plxcblx0PGRpdiBjbGFzcz0nYnBtJz5CUE08L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J2J0bi1zaGFyZSc+U0hBUkU8L2Rpdj5cXG5cXG48L2Rpdj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuUHViU3ViICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9QdWJTdWInXG5QdWJFdmVudCA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvbGFuZGluZy10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgTGFuZGluZ1ZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5zdGFydC1idG4nOiAnb25TdGFydEJ0bkNsaWNrJ1xuXG5cbiAgIG9uU3RhcnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgUHViU3ViLnRyaWdnZXIgUHViRXZlbnQuUk9VVEUsXG4gICAgICAgICByb3V0ZTogJ2NyZWF0ZSdcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZGluZ1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxzcGFuIGNsYXNzPSdzdGFydC1idG4nPkNSRUFURTwvc3Bhbj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBTaGFyZSB0aGUgdXNlciBjcmVhdGVkIGJlYXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2hhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFNoYXJlVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlVmlldyIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGEgaHJlZj0nLyMnPk5FVzwvYT5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVzdHMtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFRlc3RzVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0c1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxoMT5Db21wb25lbnQgVmlld2VyPC9oMT5cXG5cXG48YnIgLz5cXG48cD5cXG5cdE1ha2Ugc3VyZSB0aGF0IDxiPmh0dHBzdGVyPC9iPiBpcyBydW5uaW5nIGluIHRoZSA8Yj5zb3VyY2U8L2I+IHJvdXRlIChucG0gaW5zdGFsbCAtZyBodHRwc3RlcikgPGJyLz5cXG5cdDxhIGhyZWY9XFxcImh0dHA6Ly9sb2NhbGhvc3Q6MzMzMy90ZXN0L2h0bWwvXFxcIj5Nb2NoYSBUZXN0IFJ1bm5lcjwvYT5cXG48L3A+XFxuXFxuPGJyIC8+XFxuPHVsPlxcblx0PGxpPjxhIGhyZWY9JyNraXQtc2VsZWN0aW9uJz5LaXQgU2VsZWN0aW9uPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2JwbS1pbmRpY2F0b3JcXFwiPkJQTSBJbmRpY2F0b3I8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjaW5zdHJ1bWVudC1zZWxlY3RvclxcXCI+SW5zdHJ1bWVudCBTZWxlY3RvcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNwYXR0ZXJuLXNxdWFyZVxcXCI+UGF0dGVybiBTcXVhcmU8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjcGF0dGVybi10cmFja1xcXCI+UGF0dGVybiBUcmFjazwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNzZXF1ZW5jZXJcXFwiPlNlcXVlbmNlcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNmdWxsLXNlcXVlbmNlclxcXCI+RnVsbCBTZXF1ZW5jZXI8L2E+PC9saT5cXG48L3VsPlwiO1xuICB9KSIsIlxuZGVzY3JpYmUgJ01vZGVscycsID0+XG5cbiAgIHJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvS2l0Q29sbGVjdGlvbi1zcGVjLmNvZmZlZSdcbiAgIHJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvS2l0TW9kZWwtc3BlYy5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1ZpZXdzJywgPT5cblxuICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUnXG4gICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3Itc3BlYy5jb2ZmZWUnXG4gICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLXNwZWMuY29mZmVlJ1xuXG5cbiAgIGRlc2NyaWJlICdJbnN0cnVtZW50IFNlbGVjdG9yJywgPT5cblxuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLXNwZWMuY29mZmVlJ1xuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQtc3BlYy5jb2ZmZWUnXG5cblxuICAgZGVzY3JpYmUgJ1NlcXVlbmNlcicsID0+XG5cbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS1zcGVjLmNvZmZlZSdcbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLXNwZWMuY29mZmVlJ1xuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXItc3BlYy5jb2ZmZWUnXG5cblxuXG5yZXF1aXJlICcuL3NwZWMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LXNwZWMuY29mZmVlJ1xucmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LXNwZWMuY29mZmVlJ1xuXG5cblxucmVxdWlyZSAnLi9zcGVjL21vZGVscy9Tb3VuZENvbGxlY3Rpb24tc3BlYy5jb2ZmZWUnXG5yZXF1aXJlICcuL3NwZWMvbW9kZWxzL1NvdW5kTW9kZWwtc3BlYy5jb2ZmZWUnXG5cbiMgQ29udHJvbGxlcnNcbnJlcXVpcmUgJy4vc3BlYy9BcHBDb250cm9sbGVyLXNwZWMuY29mZmVlJ1xuIiwiQXBwQ29udHJvbGxlciA9IHJlcXVpcmUgJy4uLy4uL3NyYy9zY3JpcHRzL0FwcENvbnRyb2xsZXIuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdBcHAgQ29udHJvbGxlcicsIC0+XG5cbiAgIGl0ICdTaG91bGQgaW5pdGlhbGl6ZScsID0+IiwiQXBwQ29uZmlnICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuXG5kZXNjcmliZSAnS2l0IENvbGxlY3Rpb24nLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG5cbiAgIGl0ICdTaG91bGQgcGFyc2UgdGhlIHJlc3BvbnNlIGFuZCBhcHBlbmQgYW4gYXNzZXRQYXRoIHRvIGVhY2gga2l0IG1vZGVsJywgPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgncGF0aCcpLnNob3VsZC5leGlzdFxuXG5cbiAgIGl0ICdTaG91bGQgcmV0dXJuIHRoZSBuZXh0IGtpdCcsID0+XG4gICAgICBraXREYXRhID0gQGtpdENvbGxlY3Rpb24udG9KU09OKClcbiAgICAgIGtpdCA9IEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuICAgICAga2l0LmdldCgnbGFiZWwnKS5zaG91bGQuZXF1YWwga2l0RGF0YVsxXS5sYWJlbFxuXG5cbiAgIGl0ICdTaG91bGQgcmV0dXJuIHRoZSBwcmV2aW91cyBraXQnLCA9PlxuICAgICAga2l0RGF0YSA9IEBraXRDb2xsZWN0aW9uLnRvSlNPTigpXG4gICAgICBraXQgPSBAa2l0Q29sbGVjdGlvbi5wcmV2aW91c0tpdCgpXG4gICAgICBraXQuZ2V0KCdsYWJlbCcpLnNob3VsZC5lcXVhbCBraXREYXRhW2tpdERhdGEubGVuZ3RoLTFdLmxhYmVsIiwiQXBwQ29uZmlnICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0TW9kZWwgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSdcbkluc3RydW1lbnRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cbmRlc2NyaWJlICdLaXQgTW9kZWwnLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG5cbiAgICAgIGRhdGEgPSB7XG4gICAgICAgICBcImxhYmVsXCI6IFwiSGlwIEhvcFwiLFxuICAgICAgICAgXCJmb2xkZXJcIjogXCJoaXAtaG9wXCIsXG4gICAgICAgICBcImluc3RydW1lbnRzXCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJDbG9zZWQgSGlIYXRcIixcbiAgICAgICAgICAgICAgIFwic3JjXCI6IFwiSEFUXzIubXAzXCIsXG4gICAgICAgICAgICAgICBcImljb25cIjogXCJpY29uLWhpaGF0LWNsb3NlZFwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIktpY2sgRHJ1bVwiLFxuICAgICAgICAgICAgICAgXCJzcmNcIjogXCJLSUtfMi5tcDNcIixcbiAgICAgICAgICAgICAgIFwiaWNvblwiOiBcImljb24ta2lja2RydW1cIlxuICAgICAgICAgICAgfVxuICAgICAgICAgXVxuICAgICAgfVxuXG4gICAgICBAa2l0TW9kZWwgPSBuZXcgS2l0TW9kZWwgZGF0YSwgeyBwYXJzZTogdHJ1ZSB9XG5cblxuICAgaXQgJ1Nob3VsZCBwYXJzZSB0aGUgbW9kZWwgZGF0YSBhbmQgY29udmVydCBpbnN0cnVtZW50cyB0byBhbiBJbnN0cnVtZW50c0NvbGxlY3Rpb24nLCA9PlxuICAgICAgQGtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKS5zaG91bGQuYmUuYW4uaW5zdGFuY2VvZiBJbnN0cnVtZW50Q29sbGVjdGlvbiIsIlxuXG5kZXNjcmliZSAnU291bmQgQ29sbGVjdGlvbicsIC0+XG5cbiAgIGl0ICdTaG91bGQgaW5pdGlhbGl6ZSB3aXRoIGEgc291bmQgc2V0JywgPT4iLCJcblxuZGVzY3JpYmUgJ1NvdW5kIE1vZGVsJywgLT5cblxuICAgaXQgJ1Nob3VsZCBpbml0aWFsaXplIHdpdGggZGVmYXVsdCBjb25maWcgcHJvcGVydGllcycsID0+IiwiQXBwQ29uZmlnID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwTW9kZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5DcmVhdGVWaWV3ID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LmNvZmZlZSdcblxuXG5kZXNjcmliZSAnQ3JlYXRlIFZpZXcnLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQHZpZXcgID0gbmV3IENyZWF0ZVZpZXdcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5lbCkudG8uZXhpc3QiLCJCUE1JbmRpY2F0b3IgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xuQXBwTW9kZWwgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbkFwcEV2ZW50ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5BcHBDb25maWcgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblxuZGVzY3JpYmUgJ0JQTSBJbmRpY2F0b3InLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IEJQTUluZGljYXRvclxuICAgICAgICAgYXBwTW9kZWw6IG5ldyBBcHBNb2RlbCgpXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBpZiBAdmlldy51cGRhdGVJbnRlcnZhbCB0aGVuIGNsZWFySW50ZXJ2YWwgQHZpZXcudXBkYXRlSW50ZXJ2YWxcbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG5cbiAgICAgIEB2aWV3LnNob3VsZC5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCBkaXNwbGF5IHRoZSBjdXJyZW50IEJQTSBpbiB0aGUgbGFiZWwnLCA9PlxuXG4gICAgICAkbGFiZWwgPSBAdmlldy4kZWwuZmluZCAnLmxhYmVsLWJwbSdcbiAgICAgICRsYWJlbC50ZXh0KCkuc2hvdWxkLmVxdWFsIFN0cmluZyg2MDAwMCAvIEB2aWV3LmFwcE1vZGVsLmdldCgnYnBtJykpXG5cblxuXG4gICAjIGl0ICdTaG91bGQgYXV0by1hZHZhbmNlIHRoZSBicG0gdmlhIHNldEludGVydmFsIG9uIHByZXNzJywgKGRvbmUpID0+XG5cbiAgICMgICAgQHZpZXcuYnBtSW5jcmVhc2VBbW91bnQgPSA1MFxuICAgIyAgICBAdmlldy5pbnRlcnZhbFVwZGF0ZVRpbWUgPSAxXG4gICAjICAgIGFwcE1vZGVsID0gQHZpZXcuYXBwTW9kZWxcbiAgICMgICAgYXBwTW9kZWwuc2V0ICdicG0nLCAxXG5cbiAgICMgICAgc2V0VGltZW91dCA9PlxuICAgIyAgICAgICBicG0gPSBhcHBNb2RlbC5nZXQgJ2JwbSdcblxuICAgIyAgICAgICBpZiBicG0gPj0gMTIwXG4gICAjICAgICAgICAgIEB2aWV3Lm9uQnRuVXAoKVxuICAgIyAgICAgICAgICBkb25lKClcbiAgICMgICAgLCAxMDBcblxuICAgIyAgICBAdmlldy5vbkluY3JlYXNlQnRuRG93bigpXG5cblxuXG4gICAjIGl0ICdTaG91bGQgY2xlYXIgdGhlIGludGVydmFsIG9uIHJlbGVhc2UnLCA9PlxuXG4gICAjICAgIEB2aWV3Lm9uSW5jcmVhc2VCdG5Eb3duKClcbiAgICMgICAgQHZpZXcudXBkYXRlSW50ZXJ2YWwuc2hvdWxkLmV4aXN0XG4gICAjICAgIEB2aWV3Lm9uQnRuVXAoKVxuICAgIyAgICBleHBlY3QoQHZpZXcudXBkYXRlSW50ZXJ2YWwpLnRvLmJlLm51bGxcblxuIiwiQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRTZWxlY3RvciAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3IuY29mZmVlJ1xuQXBwTW9kZWwgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdLaXQgU2VsZWN0aW9uJywgLT5cblxuXG4gICBiZWZvcmUgPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cblxuICAgICAgQHZpZXcgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG5cbiAgICAgIEB2aWV3LiRlbC5zaG91bGQuZXhpc3RcblxuXG5cblxuICAgaXQgJ1Nob3VsZCBoYXZlIGEgbGFiZWwnLCA9PlxuXG4gICAgICAkbGFiZWwgPSBAdmlldy4kZWwuZmluZCAnLmxhYmVsLWtpdCdcbiAgICAgICRsYWJlbC5zaG91bGQuZXhpc3RcblxuXG5cblxuICAgaXQgJ1Nob3VsZCB1cGRhdGUgdGhlIEFwcE1vZGVsIGEga2l0IGlzIGNoYW5nZWQnLCA9PlxuXG4gICAgICAkbGFiZWwgPSBAdmlldy4kZWwuZmluZCAnLmxhYmVsLWtpdCdcbiAgICAgIGZpcnN0TGFiZWwgPSBAdmlldy5raXRDb2xsZWN0aW9uLmF0KDApLmdldCAnbGFiZWwnXG4gICAgICBsYXN0TGFiZWwgID0gQHZpZXcua2l0Q29sbGVjdGlvbi5hdChAdmlldy5raXRDb2xsZWN0aW9uLmxlbmd0aC0xKS5nZXQgJ2xhYmVsJ1xuXG4gICAgICBhcHBNb2RlbCA9IEB2aWV3LmFwcE1vZGVsXG5cbiAgICAgIGFwcE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6a2l0TW9kZWwnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5vbkxlZnRCdG5DbGljaygpXG4gICAgICAgICAkbGFiZWwudGV4dCgpLnNob3VsZC5lcXVhbCBsYXN0TGFiZWxcblxuICAgICAgYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpraXRNb2RlbCcpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm9uUmlnaHRCdG5DbGljaygpXG4gICAgICAgICAkbGFiZWwudGV4dCgpLnNob3VsZC5lcXVhbCBmaXJzdExhYmVsXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4iLCJJbnN0cnVtZW50ID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQuY29mZmVlJ1xuS2l0TW9kZWwgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRNb2RlbC5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0luc3RydW1lbnQnLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IEluc3RydW1lbnRcbiAgICAgICAgIGtpdE1vZGVsOiBuZXcgS2l0TW9kZWwoKVxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIEB2aWV3LnNob3VsZC5leGlzdFxuXG5cbiAgIGl0ICdTaG91bGQgYWxsb3cgdXNlciB0byBzZWxlY3QgaW5zdHJ1bWVudHMnLCA9PlxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBleHBlY3QoQHZpZXcuJGVsLmhhc0NsYXNzKCdzZWxlY3RlZCcpKS50by5iZS50cnVlIiwiSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlJ1xuQXBwQ29uZmlnICAgICAgICAgICAgICAgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwTW9kZWwgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uICAgICAgICAgICAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0luc3RydW1lbnQgU2VsZWN0aW9uIFBhbmVsJywgLT5cblxuXG4gICBiZWZvcmUgPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsKClcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQHZpZXcgPSBuZXcgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWxcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuc2hvdWxkLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIHJlZmVyIHRvIHRoZSBjdXJyZW50IEtpdE1vZGVsIHdoZW4gaW5zdGFudGlhdGluZyBzb3VuZHMnLCA9PlxuXG4gICAgICBleHBlY3QoQHZpZXcua2l0TW9kZWwpLnRvLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIGl0ZXJhdGUgb3ZlciBhbGwgb2YgdGhlIHNvdW5kcyBpbiB0aGUgU291bmRDb2xsZWN0aW9uIHRvIGJ1aWxkIG91dCBpbnN0cnVtZW50cycsID0+XG5cbiAgICAgIEB2aWV3LmtpdE1vZGVsLnRvSlNPTigpLmluc3RydW1lbnRzLmxlbmd0aC5zaG91bGQuYmUuYWJvdmUoMClcblxuICAgICAgJGluc3RydW1lbnRzID0gQHZpZXcuJGVsLmZpbmQoJy5jb250YWluZXItaW5zdHJ1bWVudHMnKS5maW5kKCcuaW5zdHJ1bWVudCcpXG4gICAgICAkaW5zdHJ1bWVudHMubGVuZ3RoLnNob3VsZC5iZS5hYm92ZSgwKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZWJ1aWxkIHZpZXcgd2hlbiB0aGUga2l0TW9kZWwgY2hhbmdlcycsID0+XG5cbiAgICAgIGtpdE1vZGVsID0gQHZpZXcuYXBwTW9kZWwuZ2V0ICdraXRNb2RlbCdcbiAgICAgIGxlbmd0aCA9IGtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKS50b0pTT04oKS5sZW5ndGhcblxuICAgICAgJGluc3RydW1lbnRzID0gQHZpZXcuJGVsLmZpbmQoJy5jb250YWluZXItaW5zdHJ1bWVudHMnKS5maW5kKCcuaW5zdHJ1bWVudCcpXG4gICAgICAkaW5zdHJ1bWVudHMubGVuZ3RoLnNob3VsZC5iZS5lcXVhbChsZW5ndGgpXG5cbiAgICAgIEB2aWV3LmFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5uZXh0S2l0KClcblxuICAgICAga2l0TW9kZWwgPSBAdmlldy5hcHBNb2RlbC5nZXQgJ2tpdE1vZGVsJ1xuICAgICAgbGVuZ3RoID0ga2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLnRvSlNPTigpLmxlbmd0aFxuXG4gICAgICAkaW5zdHJ1bWVudHMgPSBAdmlldy4kZWwuZmluZCgnLmNvbnRhaW5lci1pbnN0cnVtZW50cycpLmZpbmQoJy5pbnN0cnVtZW50JylcbiAgICAgICRpbnN0cnVtZW50cy5sZW5ndGguc2hvdWxkLmJlLmVxdWFsKGxlbmd0aClcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBzZWxlY3Rpb25zIGZyb20gSW5zdHJ1bWVudCBpbnN0YW5jZXMgYW5kIHVwZGF0ZSB0aGUgbW9kZWwnLCA9PlxuXG4gICAgICBAdmlldy5raXRNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50Jykud2hlbiA9PlxuICAgICAgICAgQHZpZXcuaW5zdHJ1bWVudFZpZXdzWzBdLm9uQ2xpY2soKVxuXG4gICAgICAgICAkc2VsZWN0ZWQgPSBAdmlldy4kZWwuZmluZCgnLmNvbnRhaW5lci1pbnN0cnVtZW50cycpLmZpbmQoJy5zZWxlY3RlZCcpXG4gICAgICAgICAkc2VsZWN0ZWQubGVuZ3RoLnNob3VsZC5lcXVhbCAxXG5cblxuXG4iLCJBcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmUgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdQYXR0ZXJuIFNxdWFyZScsIC0+XG5cbiAgIGJlZm9yZSA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cblxuICAgYmVmb3JlRWFjaCA9PlxuXG4gICAgICBtb2RlbCA9IG5ldyBQYXR0ZXJuU3F1YXJlTW9kZWxcbiAgICAgICAgICdpbnN0cnVtZW50JzogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApXG5cbiAgICAgIEB2aWV3ID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbW9kZWxcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIGN5Y2xlIHRocm91Z2ggdmVsb2NpdHkgdm9sdW1lcycsID0+XG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgMVxuICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKCd2ZWxvY2l0eS1sb3cnKS5zaG91bGQuYmUudHJ1ZVxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ3ZlbG9jaXR5Jykuc2hvdWxkLmVxdWFsIDJcbiAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygndmVsb2NpdHktbWVkaXVtJykuc2hvdWxkLmJlLnRydWVcblxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAzXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ3ZlbG9jaXR5LWhpZ2gnKS5zaG91bGQuYmUudHJ1ZVxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ3ZlbG9jaXR5Jykuc2hvdWxkLmVxdWFsIDBcbiAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygndmVsb2NpdHktaGlnaCcpLnNob3VsZC5iZS5mYWxzZVxuXG5cblxuICAgaXQgJ1Nob3VsZCB0b2dnbGUgb2ZmJywgPT5cblxuICAgICAgQHZpZXcuZGlzYWJsZSgpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAwXG5cblxuXG4gICBpdCAnU2hvdWxkIHRvZ2dsZSBvbicsID0+XG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5vbkNsaWNrKClcblxuXG4gICAgICBAdmlldy5kaXNhYmxlKClcbiAgICAgIEB2aWV3LmVuYWJsZSgpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAxXG4iLCJcbkFwcENvbmZpZyA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblRyYWNrID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2suY29mZmVlJ1xuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuZGVzY3JpYmUgJ1BhdHRlcm4gVHJhY2snLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAdmlldyA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIG1vZGVsOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMClcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIG91dCBjaGlsZCBzcXVhcmVzJywgPT5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcucGF0dGVybi1zcXVhcmUnKS5sZW5ndGguc2hvdWxkLmVxdWFsIDhcblxuXG4gICBpdCAnU2hvdWxkIGxpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUgcGF0dGVybiBzcXVhcmVzJywgPT5cbiAgICAgIEB2aWV3LmNvbGxlY3Rpb24uc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTp2ZWxvY2l0eScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVWaWV3c1swXS5vbkNsaWNrKClcblxuXG4gICBpdCAnU2hvdWxkIGJlIG11dGFibGUnLCA9PlxuICAgICAgQHZpZXcubW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTptdXRlJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcubXV0ZSgpXG5cbiAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6bXV0ZScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnVubXV0ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCBhZGQgdmlzdWFsIG5vdGlmaWNhdGlvbiB0aGF0IHRyYWNrIGlzIG11dGVkJywgKGRvbmUpID0+XG4gICAgICBAdmlldy5tb2RlbC5vbmNlICdjaGFuZ2U6bXV0ZScsIChtb2RlbCkgPT5cbiAgICAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygnbXV0ZScpLnNob3VsZC5iZS50cnVlXG5cbiAgICAgIEB2aWV3Lm11dGUoKVxuXG4gICAgICBAdmlldy5tb2RlbC5vbmNlICdjaGFuZ2U6bXV0ZScsID0+XG4gICAgICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ211dGUnKS5zaG91bGQuYmUuZmFsc2VcbiAgICAgICAgIGRvbmUoKVxuXG4gICAgICBAdmlldy51bm11dGUoKVxuXG5cbiAgIGl0ICdTaG91bGQgYmUgYWJsZSB0byBmb2N1cyBhbmQgdW5mb2N1cycsID0+XG4gICAgICBAdmlldy5tb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmZvY3VzJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcub25MYWJlbENsaWNrKClcblxuXG5cblxuICAgaXQgJ1Nob3VsZCB1cGRhdGUgZWFjaCBQYXR0ZXJuU3F1YXJlIG1vZGVsIHdoZW4gdGhlIGtpdCBjaGFuZ2VzJywgPT4iLCJBcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcblNlcXVlbmNlciA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5oZWxwZXJzID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvaGVscGVycy9oYW5kbGViYXJzLWhlbHBlcnMnXG5cblxuZGVzY3JpYmUgJ1NlcXVlbmNlcicsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEB2aWV3ID0gbmV3IFNlcXVlbmNlclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5wYXVzZSgpXG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IGVhY2ggcGF0dGVybiB0cmFjaycsID0+XG4gICAgICBAdmlldy4kZWwuZmluZCgnLnBhdHRlcm4tdHJhY2snKS5sZW5ndGguc2hvdWxkLmVxdWFsIEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5sZW5ndGhcblxuXG5cbiAgIGl0ICdTaG91bGQgY3JlYXRlIGEgYnBtIGludGVydmFsJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5icG1JbnRlcnZhbCkudG8ubm90LmJlIG51bGxcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBwbGF5IC8gcGF1c2UgY2hhbmdlcyBvbiB0aGUgQXBwTW9kZWwnLCA9PlxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpwbGF5aW5nJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcucGF1c2UoKVxuXG4gICAgICBAdmlldy5hcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOnBsYXlpbmcnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5wbGF5KClcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBicG0gY2hhbmdlcycsID0+XG4gICAgICBAdmlldy5hcHBNb2RlbC5zZXQoJ2JwbScsIDIwMClcbiAgICAgIGV4cGVjdChAdmlldy51cGRhdGVJbnRlcnZhbFRpbWUpLnRvLmVxdWFsIDIwMFxuXG5cblxuICAgaXQgJ1Nob3VsZCBiZSBtdXRhYmxlJywgPT5cbiAgICAgIEB2aWV3LmFwcE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6bXV0ZScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm11dGUoKVxuXG4gICAgICBAdmlldy5hcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOm11dGUnKS53aGVuID0+XG4gICAgICAgICBAdmlldy51bm11dGUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIEluc3RydW1lbnRUcmFja01vZGVsIGZvY3VzIGV2ZW50cycsID0+XG4gICAgICBAdmlldy5jb2xsZWN0aW9uLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6Zm9jdXMnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5wYXR0ZXJuVHJhY2tWaWV3c1swXS5vbkxhYmVsQ2xpY2soKVxuXG5cblxuXG4gICBpdCAnU2hvdWxkIHVwZGF0ZSBlYWNoIHBhdHRlcm4gdHJhY2sgd2hlbiB0aGUga2l0IGNoYW5nZXMnLCA9PiIsIkFwcENvbmZpZyA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5BcHBDb250cm9sbGVyID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL0FwcENvbnRyb2xsZXIuY29mZmVlJ1xuTGFuZGluZ1ZpZXcgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSdcblxuZGVzY3JpYmUgJ0xhbmRpbmcgVmlldycsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEB2aWV3ID0gbmV3IExhbmRpbmdWaWV3XG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuICAgICAgaWYgQGFwcENvbnRyb2xsZXIgdGhlbiBAYXBwQ29udHJvbGxlci5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgZXhwZWN0KEB2aWV3LmVsKS50by5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCByZWRpcmVjdCB0byBjcmVhdGUgcGFnZSBvbiBjbGljaycsIChkb25lKSA9PlxuXG4gICAgICBAYXBwQ29udHJvbGxlciA9IG5ldyBBcHBDb250cm9sbGVyXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICByb3V0ZXIgPSBAYXBwQ29udHJvbGxlci5hcHBSb3V0ZXJcbiAgICAgICRzdGFydEJ0biA9IEB2aWV3LiRlbC5maW5kICcuc3RhcnQtYnRuJ1xuXG4gICAgICAkc3RhcnRCdG4ub24gJ2NsaWNrJywgKGV2ZW50KSA9PlxuICAgICAgICAgJ2NyZWF0ZScuc2hvdWxkLnJvdXRlLnRvIHJvdXRlciwgJ2NyZWF0ZVJvdXRlJ1xuICAgICAgICAgZG9uZSgpXG5cbiAgICAgICRzdGFydEJ0bi5jbGljaygpXG5cblxuXG5cblxuXG5cblxuIiwiU2hhcmVWaWV3ID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1NoYXJlIFZpZXcnLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBTaGFyZVZpZXdcbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5lbCkudG8uZXhpc3RcblxuXG4gICBpdCAnU2hvdWxkIGFjY2VwdCBhIFNvdW5kU2hhcmUgb2JqZWN0JywgPT5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciB0aGUgdmlzdWFsaXphdGlvbiBsYXllcicsID0+XG5cblxuICAgaXQgJ1Nob3VsZCBwYXVzZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gdHJhY2sgb24gaW5pdCcsID0+XG5cblxuICAgaXQgJ1Nob3VsZCB0b2dnbGUgdGhlIHBsYXkgLyBwYXVzZSBidXR0b24nLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgZGlzcGxheSB0aGUgdXNlcnMgc29uZyB0aXRsZSBhbmQgdXNlcm5hbWUnLCA9PlxuIl19

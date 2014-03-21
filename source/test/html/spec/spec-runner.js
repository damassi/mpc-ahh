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


},{"./models/AppModel.coffee":11,"./routers/AppRouter.coffee":18,"./views/create/CreateView.coffee":21,"./views/landing/LandingView.coffee":37,"./views/share/ShareView.coffee":39}],7:[function(require,module,exports){

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


},{}],8:[function(require,module,exports){

/**
 * Application related events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent;

AppEvent = {
  CHANGE_BPM: 'change:bpm',
  CHANGE_INSTRUMENT: 'change:currentInstrument',
  CHANGE_KIT: 'change:kitModel',
  CHANGE_PLAYING: 'change:playing',
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
    'kitModel': null,
    'playing': null,
    'mute': null,
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


},{"../../config/AppConfig.coffee":7}],18:[function(require,module,exports){

/**
 * MPC Application router
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppConfig, AppRouter, BPMIndicator, InstrumentCollection, InstrumentModel, InstrumentSelectionPanel, KitCollection, KitModel, KitSelection, PatternSquare, PatternSquareCollection, PatternSquareModel, PatternTrack, PubEvent, PubSub, Sequencer, TestsView, View,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../config/AppConfig.coffee');

PubSub = require('../utils/PubSub');

PubEvent = require('../events/PubEvent.coffee');

TestsView = require('../views/tests/TestsView.coffee');

View = require('../supers/View.coffee');

KitSelection = require('../views/create/components/KitSelection.coffee');

KitCollection = require('../models/kits/KitCollection.coffee');

KitModel = require('../models/kits/KitModel.coffee');

BPMIndicator = require('../views/create/components/BPMIndicator.coffee');

InstrumentSelectionPanel = require('../views/create/components/instruments/InstrumentSelectionPanel.coffee');

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
    view = new KitSelection({
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
    view = new InstrumentSelectionPanel({
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
        view = new KitSelection({
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
        view = new InstrumentSelectionPanel({
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


},{"../config/AppConfig.coffee":7,"../events/PubEvent.coffee":9,"../models/kits/KitCollection.coffee":12,"../models/kits/KitModel.coffee":13,"../models/sequencer/PatternSquareCollection.coffee":16,"../models/sequencer/PatternSquareModel.coffee":17,"../supers/View.coffee":19,"../utils/PubSub":20,"../views/create/components/BPMIndicator.coffee":22,"../views/create/components/KitSelection.coffee":23,"../views/create/components/instruments/InstrumentSelectionPanel.coffee":25,"../views/create/components/sequencer/PatternSquare.coffee":28,"../views/create/components/sequencer/PatternTrack.coffee":29,"../views/create/components/sequencer/Sequencer.coffee":30,"../views/tests/TestsView.coffee":41}],19:[function(require,module,exports){

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


},{"../../supers/View.coffee":19,"./templates/create-template.hbs":36}],22:[function(require,module,exports){

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


},{"../../../config/AppConfig.coffee":7,"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":19,"./templates/bpm-template.hbs":34}],23:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":19,"./Instrument.coffee":24,"./templates/instrument-panel-template.hbs":26}],26:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='test'>NEXT</div>\n<div class='container-instruments'>\n\n</div>";
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
  buffer += "'>*</div>\n<div class='label'>\n	";
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

  PatternSquare.prototype.patternSquareModel = null;

  PatternSquare.prototype.events = {
    'touchend': 'onClick'
  };

  PatternSquare.prototype.addEventListeners = function() {
    return this.listenTo(this.patternSquareModel, AppEvent.CHANGE_VELOCITY, this.onVelocityChange);
  };

  PatternSquare.prototype.enable = function() {
    return this.patternSquareModel.enable();
  };

  PatternSquare.prototype.disable = function() {
    return this.patternSquareModel.disable();
  };

  PatternSquare.prototype.flashOn = function() {
    return this.$el.addClass('flash');
  };

  PatternSquare.prototype.flashOff = function() {
    return this.$el.removeClass('flash');
  };

  PatternSquare.prototype.onClick = function(event) {
    return this.patternSquareModel.cycle();
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


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":19,"./templates/pattern-square-template.hbs":31}],29:[function(require,module,exports){

/**
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var PatternSquare, PatternSquareCollection, PatternSquareModel, PatternTrack, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PatternSquareCollection = require('../../../../models/sequencer/PatternSquareCollection.coffee');

PatternSquareModel = require('../../../../models/sequencer/PatternSquareModel.coffee');

PatternSquare = require('./PatternSquare.coffee');

View = require('../../../../supers/View.coffee');

template = require('./templates/pattern-track-template.hbs');

PatternTrack = (function(_super) {
  __extends(PatternTrack, _super);

  function PatternTrack() {
    this.onMuteBtnClick = __bind(this.onMuteBtnClick, this);
    return PatternTrack.__super__.constructor.apply(this, arguments);
  }

  PatternTrack.prototype.className = 'pattern-track';

  PatternTrack.prototype.tagName = 'tr';

  PatternTrack.prototype.template = template;

  PatternTrack.prototype.patternSquareViews = null;

  PatternTrack.prototype.collection = null;

  PatternTrack.prototype.model = null;

  PatternTrack.prototype.events = {
    'touchend .btn-mute': 'onMuteBtnClick'
  };

  PatternTrack.prototype.render = function(options) {
    PatternTrack.__super__.render.call(this, options);
    this.$label = this.$el.find('.label-instrument');
    this.renderPatternSquares();
    return this;
  };

  PatternTrack.prototype.addEventListeners = function() {
    return this.listenTo(this.model, 'change:mute', this.onMuteChange);
  };

  PatternTrack.prototype.renderPatternSquares = function() {
    this.patternSquareViews = [];
    this.collection = new PatternSquareCollection;
    _(8).times((function(_this) {
      return function() {
        return _this.collection.add(new PatternSquareModel());
      };
    })(this));
    return this.collection.each((function(_this) {
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
  };

  PatternTrack.prototype.mute = function() {
    return this.model.set('mute', true);
  };

  PatternTrack.prototype.unmute = function() {
    return this.model.set('mute', false);
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


},{"../../../../models/sequencer/PatternSquareCollection.coffee":16,"../../../../models/sequencer/PatternSquareModel.coffee":17,"../../../../supers/View.coffee":19,"./PatternSquare.coffee":28,"./templates/pattern-track-template.hbs":32}],30:[function(require,module,exports){

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
    this.onKitChange = __bind(this.onKitChange, this);
    this.onMuteChange = __bind(this.onMuteChange, this);
    this.onPlayingChange = __bind(this.onPlayingChange, this);
    this.updateTime = __bind(this.updateTime, this);
    this.renderTracks = __bind(this.renderTracks, this);
    return Sequencer.__super__.constructor.apply(this, arguments);
  }

  Sequencer.prototype.className = 'sequencer-container';

  Sequencer.prototype.template = template;

  Sequencer.prototype.patternTrackViews = null;

  Sequencer.prototype.bpmInterval = null;

  Sequencer.prototype.updateIntervalTime = 200;

  Sequencer.prototype.currCellId = -1;

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
    this.listenTo(this.appModel, AppEvent.CHANGE_PLAYING, this.onPlayingChange);
    return this.listenTo(this.appModel, AppEvent.CHANGE_KIT, this.onKitChange);
  };

  Sequencer.prototype.renderTracks = function() {
    this.$el.find('.pattern-track').remove();
    this.patternTrackViews = [];
    return this.collection.each((function(_this) {
      return function(model) {
        var patternTrack;
        patternTrack = new PatternTrack({
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
    this.currCellId = this.currCellId < this.numCells ? this.currCellId += 1 : this.currCellId = 0;
    return $(this.$thStepper[this.currCellId]).addClass('step');
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
    this.collection = model.changed.kitModel.get('instruments');
    return this.renderTracks();
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
  


  return "<a href='#/share'>SHARE</a>";
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


},{"./spec/AppController-spec.coffee":44,"./spec/models/KitCollection-spec.coffee":45,"./spec/models/KitModel-spec.coffee":46,"./spec/models/SoundCollection-spec.coffee":47,"./spec/models/SoundModel-spec.coffee":48,"./spec/views/create/CreateView-spec.coffee":49,"./spec/views/create/components/BPMIndicator-spec.coffee":50,"./spec/views/create/components/KitSelection-spec.coffee":51,"./spec/views/create/components/instruments/Instrument-spec.coffee":52,"./spec/views/create/components/instruments/InstrumentSelectionPanel-spec.coffee":53,"./spec/views/create/components/sequencer/PatternSquare-spec.coffee":54,"./spec/views/create/components/sequencer/PatternTrack-spec.coffee":55,"./spec/views/create/components/sequencer/Sequencer-spec.coffee":56,"./spec/views/landing/LandingView-spec.coffee":57,"./spec/views/share/ShareView-spec.coffee":58}],44:[function(require,module,exports){
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


},{"../../../../src/scripts/views/create/CreateView.coffee":21}],50:[function(require,module,exports){
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


},{"../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../src/scripts/events/AppEvent.coffee":8,"../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../src/scripts/views/create/components/BPMIndicator.coffee":22}],51:[function(require,module,exports){
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


},{"../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../src/scripts/models/kits/KitModel.coffee":13,"../../../../../src/scripts/views/create/components/KitSelection.coffee":23}],52:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/views/create/components/instruments/InstrumentSelectionPanel.coffee":25}],54:[function(require,module,exports){
var PatternSquare, PatternSquareModel;

PatternSquareModel = require('../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee');

PatternSquare = require('../../../../../../src/scripts/views/create/components/sequencer/PatternSquare.coffee');

describe('Pattern Square', function() {
  beforeEach((function(_this) {
    return function() {
      _this.view = new PatternSquare({
        patternSquareModel: new PatternSquareModel()
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
  it('Should toggle on', (function(_this) {
    return function() {
      _this.view.onClick();
      _this.view.onClick();
      _this.view.onClick();
      _this.view.disable();
      _this.view.enable();
      return _this.view.patternSquareModel.get('velocity').should.equal(1);
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


},{"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":17,"../../../../../../src/scripts/views/create/components/sequencer/PatternSquare.coffee":28}],55:[function(require,module,exports){
var AppConfig, InstrumentModel, KitCollection, PatternSquareCollection, PatternSquareModel, PatternTrack;

AppConfig = require('../../../../../../src/scripts/config/AppConfig.coffee');

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
      _this.view = new PatternTrack({
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
  return it('Should update each PatternSquare model when the kit changes', (function(_this) {
    return function() {};
  })(this));
});


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":15,"../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee":16,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":17,"../../../../../../src/scripts/views/create/components/sequencer/PatternTrack.coffee":29}],56:[function(require,module,exports){
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
      _this.view = new Sequencer({
        appModel: new AppModel(),
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
      return _this.view.$el.find('.pattern-track').length.should.equal(6);
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
  return it('Should update each pattern track when the kit changes', (function(_this) {
    return function() {};
  })(this));
});


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/helpers/handlebars-helpers":10,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/InstrumentCollection.coffee":14,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":15,"../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee":16,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":17,"../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee":30}],57:[function(require,module,exports){
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


},{"../../../../src/scripts/AppController.coffee":6,"../../../../src/scripts/views/landing/LandingView.coffee":37}],58:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2RpZ2l0cy9pbmRleC5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L3J1bnRpbWUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy91dGlscy9QdWJTdWIuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdGlvblBhbmVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL3RlbXBsYXRlcy9pbnN0cnVtZW50LXBhbmVsLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL3RlbXBsYXRlcy9pbnN0cnVtZW50LXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2suY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3BhdHRlcm4tc3F1YXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci90ZW1wbGF0ZXMvcGF0dGVybi10cmFjay10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3NlcXVlbmNlci10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy90ZW1wbGF0ZXMvYnBtLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3RlbXBsYXRlcy9raXQtc2VsZWN0aW9uLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS90ZW1wbGF0ZXMvY3JlYXRlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy90ZW1wbGF0ZXMvbGFuZGluZy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9zaGFyZS9TaGFyZVZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvdGVtcGxhdGVzL3NoYXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3Rlc3RzL1Rlc3RzVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy90ZXN0cy90ZXN0cy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMtcnVubmVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9BcHBDb250cm9sbGVyLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9LaXRDb2xsZWN0aW9uLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9LaXRNb2RlbC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9tb2RlbHMvU291bmRDb2xsZWN0aW9uLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9Tb3VuZE1vZGVsLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rpb24tc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0aW9uUGFuZWwtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QXZCLENBSEEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBkaWdpdHNcbiAqIENvcHlyaWdodCAoYykgMjAxMyBKb24gU2NobGlua2VydFxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFBhZCBudW1iZXJzIHdpdGggemVyb3MuXG4gKiBBdXRvbWF0aWNhbGx5IHBhZCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBiYXNlZCBvbiB0aGUgbGVuZ3RoIG9mIHRoZSBhcnJheSxcbiAqIG9yIGV4cGxpY2l0bHkgcGFzcyBpbiB0aGUgbnVtYmVyIG9mIGRpZ2l0cyB0byB1c2UuXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBudW0gIFRoZSBudW1iZXIgdG8gcGFkLlxuICogQHBhcmFtICB7T2JqZWN0fSBvcHRzIE9wdGlvbnMgb2JqZWN0IHdpdGggYGRpZ2l0c2AgYW5kIGBhdXRvYCBwcm9wZXJ0aWVzLlxuICogICAge1xuICogICAgICBhdXRvOiBhcnJheS5sZW5ndGggLy8gcGFzcyBpbiB0aGUgbGVuZ3RoIG9mIHRoZSBhcnJheVxuICogICAgICBkaWdpdHM6IDQgICAgICAgICAgLy8gb3IgcGFzcyBpbiB0aGUgbnVtYmVyIG9mIGRpZ2l0cyB0byB1c2VcbiAqICAgIH1cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICBUaGUgcGFkZGVkIG51bWJlciB3aXRoIHplcm9zIHByZXBlbmRlZFxuICpcbiAqIEBleGFtcGxlczpcbiAqICAxICAgICAgPT4gMDAwMDAxXG4gKiAgMTAgICAgID0+IDAwMDAxMFxuICogIDEwMCAgICA9PiAwMDAxMDBcbiAqICAxMDAwICAgPT4gMDAxMDAwXG4gKiAgMTAwMDAgID0+IDAxMDAwMFxuICogIDEwMDAwMCA9PiAxMDAwMDBcbiAqL1xuXG5leHBvcnRzLnBhZCA9IGZ1bmN0aW9uIChudW0sIG9wdHMpIHtcbiAgdmFyIGRpZ2l0cyA9IG9wdHMuZGlnaXRzIHx8IDM7XG4gIGlmKG9wdHMuYXV0byAmJiB0eXBlb2Ygb3B0cy5hdXRvID09PSAnbnVtYmVyJykge1xuICAgIGRpZ2l0cyA9IFN0cmluZyhvcHRzLmF1dG8pLmxlbmd0aDtcbiAgfVxuICB2YXIgbGVuRGlmZiA9IGRpZ2l0cyAtIFN0cmluZyhudW0pLmxlbmd0aDtcbiAgdmFyIHBhZGRpbmcgPSAnJztcbiAgaWYgKGxlbkRpZmYgPiAwKSB7XG4gICAgd2hpbGUgKGxlbkRpZmYtLSkge1xuICAgICAgcGFkZGluZyArPSAnMCc7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYWRkaW5nICsgbnVtO1xufTtcblxuLyoqXG4gKiBTdHJpcCBsZWFkaW5nIGRpZ2l0cyBmcm9tIGEgc3RyaW5nXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIGZyb20gd2hpY2ggdG8gc3RyaXAgZGlnaXRzXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBUaGUgbW9kaWZpZWQgc3RyaW5nXG4gKi9cblxuZXhwb3J0cy5zdHJpcGxlZnQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxkK1xcLT8vZywgJycpO1xufTtcblxuLyoqXG4gKiBTdHJpcCB0cmFpbGluZyBkaWdpdHMgZnJvbSBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyBmcm9tIHdoaWNoIHRvIHN0cmlwIGRpZ2l0c1xuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICovXG5cbmV4cG9ydHMuc3RyaXByaWdodCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xcLT9cXGQrJC9nLCAnJyk7XG59O1xuXG4vKipcbiAqIENvdW50IGRpZ2l0cyBvbiB0aGUgbGVmdCBzaWRlIG9mIGEgc3RyaW5nXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIHdpdGggZGlnaXRzIHRvIGNvdW50XG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBUaGUgbW9kaWZpZWQgc3RyaW5nXG4gKiBAZXhhbXBsZVxuICogIFwiMDAxLWZvby5tZFwiID0+IDNcbiAqL1xuXG5leHBvcnRzLmNvdW50bGVmdCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gU3RyaW5nKHN0ci5tYXRjaCgvXlxcZCsvZykpLmxlbmd0aDtcbn07XG5cbi8qKlxuICogQ291bnQgZGlnaXRzIG9uIHRoZSByaWdodCBzaWRlIG9mIGEgc3RyaW5nXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIHdpdGggZGlnaXRzIHRvIGNvdW50XG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBUaGUgbW9kaWZpZWQgc3RyaW5nXG4gKiBAZXhhbXBsZVxuICogIFwiMDAxLWZvby5tZFwiID0+IDNcbiAqL1xuXG5leHBvcnRzLmNvdW50cmlnaHQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIFN0cmluZyhzdHIubWF0Y2goL1xcZCskL2cpKS5sZW5ndGg7XG59OyIsIi8qanNoaW50IGVxbnVsbDogdHJ1ZSAqL1xuXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGUgPSBmdW5jdGlvbigpIHtcblxudmFyIEhhbmRsZWJhcnMgPSB7fTtcblxuLy8gQkVHSU4oQlJPV1NFUilcblxuSGFuZGxlYmFycy5WRVJTSU9OID0gXCIxLjAuMFwiO1xuSGFuZGxlYmFycy5DT01QSUxFUl9SRVZJU0lPTiA9IDQ7XG5cbkhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFUyA9IHtcbiAgMTogJzw9IDEuMC5yYy4yJywgLy8gMS4wLnJjLjIgaXMgYWN0dWFsbHkgcmV2MiBidXQgZG9lc24ndCByZXBvcnQgaXRcbiAgMjogJz09IDEuMC4wLXJjLjMnLFxuICAzOiAnPT0gMS4wLjAtcmMuNCcsXG4gIDQ6ICc+PSAxLjAuMCdcbn07XG5cbkhhbmRsZWJhcnMuaGVscGVycyAgPSB7fTtcbkhhbmRsZWJhcnMucGFydGlhbHMgPSB7fTtcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyxcbiAgICBmdW5jdGlvblR5cGUgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIG9iamVjdFR5cGUgPSAnW29iamVjdCBPYmplY3RdJztcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciA9IGZ1bmN0aW9uKG5hbWUsIGZuLCBpbnZlcnNlKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgaWYgKGludmVyc2UgfHwgZm4pIHsgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTsgfVxuICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHRoaXMuaGVscGVycywgbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGludmVyc2UpIHsgZm4ubm90ID0gaW52ZXJzZTsgfVxuICAgIHRoaXMuaGVscGVyc1tuYW1lXSA9IGZuO1xuICB9XG59O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCA9IGZ1bmN0aW9uKG5hbWUsIHN0cikge1xuICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHRoaXMucGFydGlhbHMsICBuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnBhcnRpYWxzW25hbWVdID0gc3RyO1xuICB9XG59O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdoZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oYXJnKSB7XG4gIGlmKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk1pc3NpbmcgaGVscGVyOiAnXCIgKyBhcmcgKyBcIidcIik7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlIHx8IGZ1bmN0aW9uKCkge30sIGZuID0gb3B0aW9ucy5mbjtcblxuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG5cbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZihjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuKHRoaXMpO1xuICB9IGVsc2UgaWYoY29udGV4dCA9PT0gZmFsc2UgfHwgY29udGV4dCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gIH0gZWxzZSBpZih0eXBlID09PSBcIltvYmplY3QgQXJyYXldXCIpIHtcbiAgICBpZihjb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBIYW5kbGViYXJzLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmbihjb250ZXh0KTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMuSyA9IGZ1bmN0aW9uKCkge307XG5cbkhhbmRsZWJhcnMuY3JlYXRlRnJhbWUgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uKG9iamVjdCkge1xuICBIYW5kbGViYXJzLksucHJvdG90eXBlID0gb2JqZWN0O1xuICB2YXIgb2JqID0gbmV3IEhhbmRsZWJhcnMuSygpO1xuICBIYW5kbGViYXJzLksucHJvdG90eXBlID0gbnVsbDtcbiAgcmV0dXJuIG9iajtcbn07XG5cbkhhbmRsZWJhcnMubG9nZ2VyID0ge1xuICBERUJVRzogMCwgSU5GTzogMSwgV0FSTjogMiwgRVJST1I6IDMsIGxldmVsOiAzLFxuXG4gIG1ldGhvZE1hcDogezA6ICdkZWJ1ZycsIDE6ICdpbmZvJywgMjogJ3dhcm4nLCAzOiAnZXJyb3InfSxcblxuICAvLyBjYW4gYmUgb3ZlcnJpZGRlbiBpbiB0aGUgaG9zdCBlbnZpcm9ubWVudFxuICBsb2c6IGZ1bmN0aW9uKGxldmVsLCBvYmopIHtcbiAgICBpZiAoSGFuZGxlYmFycy5sb2dnZXIubGV2ZWwgPD0gbGV2ZWwpIHtcbiAgICAgIHZhciBtZXRob2QgPSBIYW5kbGViYXJzLmxvZ2dlci5tZXRob2RNYXBbbGV2ZWxdO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlW21ldGhvZF0pIHtcbiAgICAgICAgY29uc29sZVttZXRob2RdLmNhbGwoY29uc29sZSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMubG9nID0gZnVuY3Rpb24obGV2ZWwsIG9iaikgeyBIYW5kbGViYXJzLmxvZ2dlci5sb2cobGV2ZWwsIG9iaik7IH07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBmbiA9IG9wdGlvbnMuZm4sIGludmVyc2UgPSBvcHRpb25zLmludmVyc2U7XG4gIHZhciBpID0gMCwgcmV0ID0gXCJcIiwgZGF0YTtcblxuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYgKG9wdGlvbnMuZGF0YSkge1xuICAgIGRhdGEgPSBIYW5kbGViYXJzLmNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gIH1cblxuICBpZihjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0ID09PSAnb2JqZWN0Jykge1xuICAgIGlmKGNvbnRleHQgaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICBmb3IodmFyIGogPSBjb250ZXh0Lmxlbmd0aDsgaTxqOyBpKyspIHtcbiAgICAgICAgaWYgKGRhdGEpIHsgZGF0YS5pbmRleCA9IGk7IH1cbiAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtpXSwgeyBkYXRhOiBkYXRhIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IodmFyIGtleSBpbiBjb250ZXh0KSB7XG4gICAgICAgIGlmKGNvbnRleHQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIGlmKGRhdGEpIHsgZGF0YS5rZXkgPSBrZXk7IH1cbiAgICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2tleV0sIHtkYXRhOiBkYXRhfSk7XG4gICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYoaSA9PT0gMCl7XG4gICAgcmV0ID0gaW52ZXJzZSh0aGlzKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29uZGl0aW9uYWwpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29uZGl0aW9uYWwgPSBjb25kaXRpb25hbC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYoIWNvbmRpdGlvbmFsIHx8IEhhbmRsZWJhcnMuVXRpbHMuaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcigndW5sZXNzJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIEhhbmRsZWJhcnMuaGVscGVyc1snaWYnXS5jYWxsKHRoaXMsIGNvbmRpdGlvbmFsLCB7Zm46IG9wdGlvbnMuaW52ZXJzZSwgaW52ZXJzZTogb3B0aW9ucy5mbn0pO1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3dpdGgnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZiAoIUhhbmRsZWJhcnMuVXRpbHMuaXNFbXB0eShjb250ZXh0KSkgcmV0dXJuIG9wdGlvbnMuZm4oY29udGV4dCk7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgbGV2ZWwgPSBvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmxldmVsICE9IG51bGwgPyBwYXJzZUludChvcHRpb25zLmRhdGEubGV2ZWwsIDEwKSA6IDE7XG4gIEhhbmRsZWJhcnMubG9nKGxldmVsLCBjb250ZXh0KTtcbn0pO1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG59O1xuIiwiZXhwb3J0cy5hdHRhY2ggPSBmdW5jdGlvbihIYW5kbGViYXJzKSB7XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbkhhbmRsZWJhcnMuVk0gPSB7XG4gIHRlbXBsYXRlOiBmdW5jdGlvbih0ZW1wbGF0ZVNwZWMpIHtcbiAgICAvLyBKdXN0IGFkZCB3YXRlclxuICAgIHZhciBjb250YWluZXIgPSB7XG4gICAgICBlc2NhcGVFeHByZXNzaW9uOiBIYW5kbGViYXJzLlV0aWxzLmVzY2FwZUV4cHJlc3Npb24sXG4gICAgICBpbnZva2VQYXJ0aWFsOiBIYW5kbGViYXJzLlZNLmludm9rZVBhcnRpYWwsXG4gICAgICBwcm9ncmFtczogW10sXG4gICAgICBwcm9ncmFtOiBmdW5jdGlvbihpLCBmbiwgZGF0YSkge1xuICAgICAgICB2YXIgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldO1xuICAgICAgICBpZihkYXRhKSB7XG4gICAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSBIYW5kbGViYXJzLlZNLnByb2dyYW0oaSwgZm4sIGRhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKCFwcm9ncmFtV3JhcHBlcikge1xuICAgICAgICAgIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSA9IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbShpLCBmbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgICAgfSxcbiAgICAgIG1lcmdlOiBmdW5jdGlvbihwYXJhbSwgY29tbW9uKSB7XG4gICAgICAgIHZhciByZXQgPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgICAgaWYgKHBhcmFtICYmIGNvbW1vbikge1xuICAgICAgICAgIHJldCA9IHt9O1xuICAgICAgICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHJldCwgY29tbW9uKTtcbiAgICAgICAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZChyZXQsIHBhcmFtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfSxcbiAgICAgIHByb2dyYW1XaXRoRGVwdGg6IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbVdpdGhEZXB0aCxcbiAgICAgIG5vb3A6IEhhbmRsZWJhcnMuVk0ubm9vcCxcbiAgICAgIGNvbXBpbGVySW5mbzogbnVsbFxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICB2YXIgcmVzdWx0ID0gdGVtcGxhdGVTcGVjLmNhbGwoY29udGFpbmVyLCBIYW5kbGViYXJzLCBjb250ZXh0LCBvcHRpb25zLmhlbHBlcnMsIG9wdGlvbnMucGFydGlhbHMsIG9wdGlvbnMuZGF0YSk7XG5cbiAgICAgIHZhciBjb21waWxlckluZm8gPSBjb250YWluZXIuY29tcGlsZXJJbmZvIHx8IFtdLFxuICAgICAgICAgIGNvbXBpbGVyUmV2aXNpb24gPSBjb21waWxlckluZm9bMF0gfHwgMSxcbiAgICAgICAgICBjdXJyZW50UmV2aXNpb24gPSBIYW5kbGViYXJzLkNPTVBJTEVSX1JFVklTSU9OO1xuXG4gICAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiAhPT0gY3VycmVudFJldmlzaW9uKSB7XG4gICAgICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICAgICAgdmFyIHJ1bnRpbWVWZXJzaW9ucyA9IEhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgICAgICBjb21waWxlclZlcnNpb25zID0gSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgICAgIHRocm93IFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYW4gb2xkZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gXCIrXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcHJlY29tcGlsZXIgdG8gYSBuZXdlciB2ZXJzaW9uIChcIitydW50aW1lVmVyc2lvbnMrXCIpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJWZXJzaW9ucytcIikuXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICAgICAgdGhyb3cgXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhIG5ld2VyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHJ1bnRpbWUgdG8gYSBuZXdlciB2ZXJzaW9uIChcIitjb21waWxlckluZm9bMV0rXCIpLlwiO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfSxcblxuICBwcm9ncmFtV2l0aERlcHRoOiBmdW5jdGlvbihpLCBmbiwgZGF0YSAvKiwgJGRlcHRoICovKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDMpO1xuXG4gICAgdmFyIHByb2dyYW0gPSBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIFtjb250ZXh0LCBvcHRpb25zLmRhdGEgfHwgZGF0YV0uY29uY2F0KGFyZ3MpKTtcbiAgICB9O1xuICAgIHByb2dyYW0ucHJvZ3JhbSA9IGk7XG4gICAgcHJvZ3JhbS5kZXB0aCA9IGFyZ3MubGVuZ3RoO1xuICAgIHJldHVybiBwcm9ncmFtO1xuICB9LFxuICBwcm9ncmFtOiBmdW5jdGlvbihpLCBmbiwgZGF0YSkge1xuICAgIHZhciBwcm9ncmFtID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zLmRhdGEgfHwgZGF0YSk7XG4gICAgfTtcbiAgICBwcm9ncmFtLnByb2dyYW0gPSBpO1xuICAgIHByb2dyYW0uZGVwdGggPSAwO1xuICAgIHJldHVybiBwcm9ncmFtO1xuICB9LFxuICBub29wOiBmdW5jdGlvbigpIHsgcmV0dXJuIFwiXCI7IH0sXG4gIGludm9rZVBhcnRpYWw6IGZ1bmN0aW9uKHBhcnRpYWwsIG5hbWUsIGNvbnRleHQsIGhlbHBlcnMsIHBhcnRpYWxzLCBkYXRhKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB7IGhlbHBlcnM6IGhlbHBlcnMsIHBhcnRpYWxzOiBwYXJ0aWFscywgZGF0YTogZGF0YSB9O1xuXG4gICAgaWYocGFydGlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oXCJUaGUgcGFydGlhbCBcIiArIG5hbWUgKyBcIiBjb3VsZCBub3QgYmUgZm91bmRcIik7XG4gICAgfSBlbHNlIGlmKHBhcnRpYWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgcmV0dXJuIHBhcnRpYWwoY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIGlmICghSGFuZGxlYmFycy5jb21waWxlKSB7XG4gICAgICB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oXCJUaGUgcGFydGlhbCBcIiArIG5hbWUgKyBcIiBjb3VsZCBub3QgYmUgY29tcGlsZWQgd2hlbiBydW5uaW5nIGluIHJ1bnRpbWUtb25seSBtb2RlXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0aWFsc1tuYW1lXSA9IEhhbmRsZWJhcnMuY29tcGlsZShwYXJ0aWFsLCB7ZGF0YTogZGF0YSAhPT0gdW5kZWZpbmVkfSk7XG4gICAgICByZXR1cm4gcGFydGlhbHNbbmFtZV0oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICB9XG59O1xuXG5IYW5kbGViYXJzLnRlbXBsYXRlID0gSGFuZGxlYmFycy5WTS50ZW1wbGF0ZTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xuXG59O1xuIiwiZXhwb3J0cy5hdHRhY2ggPSBmdW5jdGlvbihIYW5kbGViYXJzKSB7XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbnZhciBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuSGFuZGxlYmFycy5FeGNlcHRpb24gPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gIHZhciB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cbn07XG5IYW5kbGViYXJzLkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbkhhbmRsZWJhcnMuU2FmZVN0cmluZyA9IGZ1bmN0aW9uKHN0cmluZykge1xuICB0aGlzLnN0cmluZyA9IHN0cmluZztcbn07XG5IYW5kbGViYXJzLlNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0cmluZy50b1N0cmluZygpO1xufTtcblxudmFyIGVzY2FwZSA9IHtcbiAgXCImXCI6IFwiJmFtcDtcIixcbiAgXCI8XCI6IFwiJmx0O1wiLFxuICBcIj5cIjogXCImZ3Q7XCIsXG4gICdcIic6IFwiJnF1b3Q7XCIsXG4gIFwiJ1wiOiBcIiYjeDI3O1wiLFxuICBcImBcIjogXCImI3g2MDtcIlxufTtcblxudmFyIGJhZENoYXJzID0gL1smPD5cIidgXS9nO1xudmFyIHBvc3NpYmxlID0gL1smPD5cIidgXS87XG5cbnZhciBlc2NhcGVDaGFyID0gZnVuY3Rpb24oY2hyKSB7XG4gIHJldHVybiBlc2NhcGVbY2hyXSB8fCBcIiZhbXA7XCI7XG59O1xuXG5IYW5kbGViYXJzLlV0aWxzID0ge1xuICBleHRlbmQ6IGZ1bmN0aW9uKG9iaiwgdmFsdWUpIHtcbiAgICBmb3IodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgICAgaWYodmFsdWUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IHZhbHVlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGVzY2FwZUV4cHJlc3Npb246IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIC8vIGRvbid0IGVzY2FwZSBTYWZlU3RyaW5ncywgc2luY2UgdGhleSdyZSBhbHJlYWR5IHNhZmVcbiAgICBpZiAoc3RyaW5nIGluc3RhbmNlb2YgSGFuZGxlYmFycy5TYWZlU3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLnRvU3RyaW5nKCk7XG4gICAgfSBlbHNlIGlmIChzdHJpbmcgPT0gbnVsbCB8fCBzdHJpbmcgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG5cbiAgICAvLyBGb3JjZSBhIHN0cmluZyBjb252ZXJzaW9uIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IHRoZSBhcHBlbmQgcmVnYXJkbGVzcyBhbmRcbiAgICAvLyB0aGUgcmVnZXggdGVzdCB3aWxsIGRvIHRoaXMgdHJhbnNwYXJlbnRseSBiZWhpbmQgdGhlIHNjZW5lcywgY2F1c2luZyBpc3N1ZXMgaWZcbiAgICAvLyBhbiBvYmplY3QncyB0byBzdHJpbmcgaGFzIGVzY2FwZWQgY2hhcmFjdGVycyBpbiBpdC5cbiAgICBzdHJpbmcgPSBzdHJpbmcudG9TdHJpbmcoKTtcblxuICAgIGlmKCFwb3NzaWJsZS50ZXN0KHN0cmluZykpIHsgcmV0dXJuIHN0cmluZzsgfVxuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShiYWRDaGFycywgZXNjYXBlQ2hhcik7XG4gIH0sXG5cbiAgaXNFbXB0eTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYodG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09IFwiW29iamVjdCBBcnJheV1cIiAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59O1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gcmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9iYXNlLmpzJykuY3JlYXRlKClcbnJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMnKS5hdHRhY2goZXhwb3J0cylcbnJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcycpLmF0dGFjaChleHBvcnRzKSIsIiMjIypcbiAqIFByaW1hcnkgYXBwbGljYXRpb24gY29udHJvbGxlclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblxuQXBwTW9kZWwgICAgPSByZXF1aXJlICcuL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5BcHBSb3V0ZXIgICA9IHJlcXVpcmUgJy4vcm91dGVycy9BcHBSb3V0ZXIuY29mZmVlJ1xuTGFuZGluZ1ZpZXcgPSByZXF1aXJlICcuL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXcuY29mZmVlJ1xuQ3JlYXRlVmlldyAgPSByZXF1aXJlICcuL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LmNvZmZlZSdcblNoYXJlVmlldyAgID0gcmVxdWlyZSAnLi92aWV3cy9zaGFyZS9TaGFyZVZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcENvbnRyb2xsZXIgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cblxuICAgY2xhc3NOYW1lOiAnd3JhcHBlcidcblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG5cbiAgICAgIEBsYW5kaW5nVmlldyA9IG5ldyBMYW5kaW5nVmlld1xuICAgICAgQHNoYXJlVmlldyAgID0gbmV3IFNoYXJlVmlld1xuICAgICAgQGNyZWF0ZVZpZXcgID0gbmV3IENyZWF0ZVZpZXdcblxuICAgICAgQGFwcFJvdXRlciA9IG5ldyBBcHBSb3V0ZXJcbiAgICAgICAgIGFwcENvbnRyb2xsZXI6IEBcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSBBcHBDb250cm9sbGVyIHRvIHRoZSBET00gYW5kIGtpY2tzXG4gICAjIG9mZiBiYWNrYm9uZXMgaGlzdG9yeVxuXG4gICByZW5kZXI6IC0+XG4gICAgICBAJGJvZHkgPSAkICdib2R5J1xuICAgICAgQCRib2R5LmFwcGVuZCBAZWxcblxuICAgICAgQmFja2JvbmUuaGlzdG9yeS5zdGFydFxuICAgICAgICAgcHVzaFN0YXRlOiBmYWxzZVxuXG5cblxuICAgIyBEZXN0cm95cyBhbGwgY3VycmVudCBhbmQgcHJlLXJlbmRlcmVkIHZpZXdzIGFuZFxuICAgIyB1bmRlbGVnYXRlcyBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgQGxhbmRpbmdWaWV3LnJlbW92ZSgpXG4gICAgICBAc2hhcmVWaWV3LnJlbW92ZSgpXG4gICAgICBAY3JlYXRlVmlldy5yZW1vdmUoKVxuXG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICAjIEFkZHMgQXBwQ29udHJvbGxlci1yZWxhdGVkIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVnaW5zXG4gICAjIGxpc3RlbmluZyB0byB2aWV3IGNoYW5nZXNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAnY2hhbmdlOnZpZXcnLCBAb25WaWV3Q2hhbmdlXG5cblxuXG5cbiAgICMgUmVtb3ZlcyBBcHBDb250cm9sbGVyLXJlbGF0ZWQgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHNob3dpbmcgLyBoaWRpbmcgLyBkaXNwb3Npbmcgb2YgcHJpbWFyeSB2aWV3c1xuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvblZpZXdDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIHByZXZpb3VzVmlldyA9IG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMudmlld1xuICAgICAgY3VycmVudFZpZXcgID0gbW9kZWwuY2hhbmdlZC52aWV3XG5cbiAgICAgIGlmIHByZXZpb3VzVmlldyB0aGVuIHByZXZpb3VzVmlldy5oaWRlXG4gICAgICAgICByZW1vdmU6IHRydWVcblxuXG4gICAgICBAJGVsLmFwcGVuZCBjdXJyZW50Vmlldy5yZW5kZXIoKS5lbFxuXG4gICAgICBjdXJyZW50Vmlldy5zaG93KClcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb250cm9sbGVyIiwiIyMjKlxuICBBcHBsaWNhdGlvbi13aWRlIGdlbmVyYWwgY29uZmlndXJhdGlvbnNcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xOS4xNFxuIyMjXG5cblxuQXBwQ29uZmlnID1cblxuXG4gICAjIFRoZSBwYXRoIHRvIGFwcGxpY2F0aW9uIGFzc2V0c1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBBU1NFVFM6XG4gICAgICBwYXRoOiAgICcvYXNzZXRzJ1xuICAgICAgYXVkaW86ICAnYXVkaW8nXG4gICAgICBkYXRhOiAgICdkYXRhJ1xuICAgICAgaW1hZ2VzOiAnaW1hZ2VzJ1xuXG5cbiAgICMgVGhlIEJQTSB0ZW1wb1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBCUE06IDEyMFxuXG5cbiAgICMgVGhlIG1heCBCUE1cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQlBNX01BWDogMzAwXG5cblxuICAgIyBUaGUgbWF4IHZhcmllbnQgb24gZWFjaCBwYXR0ZXJuIHNxdWFyZSAob2ZmLCBsb3csIG1lZGl1bSwgaGlnaClcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgVkVMT0NJVFlfTUFYOiAzXG5cblxuICAgIyBSZXR1cm5zIGEgbm9ybWFsaXplZCBhc3NldCBwYXRoIGZvciBhcHBsaWNhdGlvbiBhc3NldHNcbiAgICMgQHBhcmFtIHtTdHJpbmd9IGFzc2V0VHlwZVxuXG4gICByZXR1cm5Bc3NldFBhdGg6IChhc3NldFR5cGUpIC0+XG4gICAgICBAQVNTRVRTLnBhdGggKyAnLycgKyBAQVNTRVRTW2Fzc2V0VHlwZV1cblxuXG4gICAjIFJldHVybnMgYSBub3JtYWxpemVkIGFzc2V0IHBhdGggZm9yIHRoZSBURVNUIGVudmlyb25tZW50XG4gICAjIEBwYXJhbSB7U3RyaW5nfSBhc3NldFR5cGVcblxuICAgcmV0dXJuVGVzdEFzc2V0UGF0aDogKGFzc2V0VHlwZSkgLT5cbiAgICAgICcvdGVzdC9odG1sLycgKyBAQVNTRVRTLnBhdGggKyAnLycgKyBAQVNTRVRTW2Fzc2V0VHlwZV1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwQ29uZmlnXG5cbiIsIiMjIypcbiAqIEFwcGxpY2F0aW9uIHJlbGF0ZWQgZXZlbnRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuXG5BcHBFdmVudCA9XG5cbiAgIENIQU5HRV9CUE06ICAgICAgICAnY2hhbmdlOmJwbSdcbiAgIENIQU5HRV9JTlNUUlVNRU5UOiAnY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50J1xuICAgQ0hBTkdFX0tJVDogICAgICAgICdjaGFuZ2U6a2l0TW9kZWwnXG4gICBDSEFOR0VfUExBWUlORzogICAgJ2NoYW5nZTpwbGF5aW5nJ1xuICAgQ0hBTkdFX1ZFTE9DSVRZOiAgICdjaGFuZ2U6dmVsb2NpdHknXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBFdmVudCIsIiMjIypcbiAqIEdsb2JhbCBQdWJTdWIgZXZlbnRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuXG5QdWJTdWIgPVxuXG4gICBST1VURTogJ29uUm91dGVDaGFuZ2UnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQdWJTdWIiLCJcbnZhciBkaWdpdHMgPSByZXF1aXJlKCdkaWdpdHMnKTtcbnZhciBoYW5kbGViYXJzID0gcmVxdWlyZSgnaGFuZGxlaWZ5JylcblxuaGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcigncmVwZWF0JywgZnVuY3Rpb24obiwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBfZGF0YSA9IHt9O1xuICAgIGlmIChvcHRpb25zLl9kYXRhKSB7XG4gICAgICBfZGF0YSA9IGhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5fZGF0YSk7XG4gICAgfVxuXG4gICAgdmFyIGNvbnRlbnQgPSAnJztcbiAgICB2YXIgY291bnQgPSBuIC0gMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBjb3VudDsgaSsrKSB7XG4gICAgICBfZGF0YSA9IHtcbiAgICAgICAgaW5kZXg6IGRpZ2l0cy5wYWQoKGkgKyAxKSwge2F1dG86IG59KVxuICAgICAgfTtcbiAgICAgIGNvbnRlbnQgKz0gb3B0aW9ucy5mbih0aGlzLCB7ZGF0YTogX2RhdGF9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBoYW5kbGViYXJzLlNhZmVTdHJpbmcoY29udGVudCk7XG4gIH0pOyIsIiMjIypcbiAgUHJpbWFyeSBhcHBsaWNhdGlvbiBtb2RlbCB3aGljaCBjb29yZGluYXRlcyBzdGF0ZVxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cblxuQXBwUm91dGVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAndmlldyc6ICAgICAgICBudWxsXG4gICAgICAna2l0TW9kZWwnOiAgICBudWxsXG4gICAgICAncGxheWluZyc6ICAgICBudWxsXG4gICAgICAnbXV0ZSc6ICAgICAgICBudWxsXG5cbiAgICAgICMgU2V0dGluZ3NcbiAgICAgICdicG0nOiAgICAgICAgIEFwcENvbmZpZy5CUE1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFJvdXRlciIsIiMjIypcbiAqIENvbGxlY3Rpb24gb2Ygc291bmQga2l0c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0TW9kZWwgID0gcmVxdWlyZSAnLi9LaXRNb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgS2l0Q29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuXG4gICAjIFVybCB0byBkYXRhIGZvciBmZXRjaFxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICB1cmw6IFwiI3tBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJyl9L3NvdW5kLWRhdGEuanNvblwiXG5cblxuICAgIyBJbmRpdmlkdWFsIGRydW1raXQgYXVkaW8gc2V0c1xuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIG1vZGVsOiBLaXRNb2RlbFxuXG5cbiAgICMgVGhlIGN1cnJlbnQgdXNlci1zZWxlY3RlZCBraXRcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAga2l0SWQ6IDBcblxuXG5cbiAgIHBhcnNlOiAocmVzcG9uc2UpIC0+XG4gICAgICBhc3NldFBhdGggPSByZXNwb25zZS5jb25maWcuYXNzZXRQYXRoXG4gICAgICBraXRzID0gcmVzcG9uc2Uua2l0c1xuXG4gICAgICBraXRzID0gXy5tYXAga2l0cywgKGtpdCkgLT5cbiAgICAgICAgIGtpdC5wYXRoID0gYXNzZXRQYXRoICsgJy8nICsga2l0LmZvbGRlclxuICAgICAgICAgcmV0dXJuIGtpdFxuXG4gICAgICByZXR1cm4ga2l0c1xuXG5cblxuXG4gICAjIEN5Y2xlcyB0aGUgY3VycmVudCBkcnVtIGtpdCBiYWNrXG4gICAjIEByZXR1cm4ge0tpdE1vZGVsfVxuXG4gICBwcmV2aW91c0tpdDogLT5cbiAgICAgIGxlbiA9IEBsZW5ndGhcblxuICAgICAgaWYgQGtpdElkID4gMFxuICAgICAgICAgQGtpdElkLS1cblxuICAgICAgZWxzZVxuICAgICAgICAgQGtpdElkID0gbGVuIC0gMVxuXG4gICAgICBraXRNb2RlbCA9IEBhdCBAa2l0SWRcblxuXG5cblxuICAgIyBDeWNsZXMgdGhlIGN1cnJlbnQgZHJ1bSBraXQgZm9yd2FyZFxuICAgIyBAcmV0dXJuIHtLaXRNb2RlbH1cblxuICAgbmV4dEtpdDogLT5cbiAgICAgIGxlbiA9IEBsZW5ndGggLSAxXG5cbiAgICAgIGlmIEBraXRJZCA8IGxlblxuICAgICAgICAgQGtpdElkKytcblxuICAgICAgZWxzZVxuICAgICAgICAgQGtpdElkID0gMFxuXG4gICAgICBraXRNb2RlbCA9IEBhdCBAa2l0SWRcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2l0Q29sbGVjdGlvbiIsIiMjIypcbiAqIEtpdCBtb2RlbCBmb3IgaGFuZGxpbmcgc3RhdGUgcmVsYXRlZCB0byBraXQgc2VsZWN0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlJ1xuXG5cbmNsYXNzIEtpdE1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICdsYWJlbCc6ICAgIG51bGxcbiAgICAgICdwYXRoJzogICAgIG51bGxcbiAgICAgICdmb2xkZXInOiAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7SW5zdHJ1bWVudENvbGxlY3Rpb259XG4gICAgICAnaW5zdHJ1bWVudHMnOiAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICAgICAgJ2N1cnJlbnRJbnN0cnVtZW50JzogbnVsbFxuXG5cblxuICAgIyBGb3JtYXQgdGhlIHJlc3BvbnNlIHNvIHRoYXQgaW5zdHJ1bWVudHMgZ2V0cyBwcm9jZXNzZWRcbiAgICMgYnkgYmFja2JvbmUgdmlhIHRoZSBJbnN0cnVtZW50Q29sbGVjdGlvbi4gIEFkZGl0aW9uYWxseSxcbiAgICMgcGFzcyBpbiB0aGUgcGF0aCBzbyB0aGF0IGFic29sdXRlIFVSTCdzIGNhbiBiZSB1c2VkXG4gICAjIHRvIHJlZmVyZW5jZSBzb3VuZCBkYXRhXG4gICAjIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuXG4gICBwYXJzZTogKHJlc3BvbnNlKSAtPlxuICAgICAgXy5lYWNoIHJlc3BvbnNlLmluc3RydW1lbnRzLCAoaW5zdHJ1bWVudCkgLT5cbiAgICAgICAgIGluc3RydW1lbnQuc3JjID0gcmVzcG9uc2UucGF0aCArICcvJyArIGluc3RydW1lbnQuc3JjXG5cbiAgICAgIHJlc3BvbnNlLmluc3RydW1lbnRzID0gbmV3IEluc3RydW1lbnRDb2xsZWN0aW9uIHJlc3BvbnNlLmluc3RydW1lbnRzXG5cbiAgICAgIHJlc3BvbnNlXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2l0TW9kZWwiLCIjIyMqXG4gKiBDb2xsZWN0aW9uIHJlcHJlc2VudGluZyBlYWNoIHNvdW5kIGZyb20gYSBraXQgc2V0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIEluc3RydW1lbnRDb2xsZWN0aW9uIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG4gICBtb2RlbDogSW5zdHJ1bWVudE1vZGVsXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50Q29sbGVjdGlvbiIsIiMjIypcbiAqIFNvdW5kIG1vZGVsIGZvciBlYWNoIGluZGl2aWR1YWwga2l0IHNvdW5kIHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuXG5cbmNsYXNzIEluc3RydW1lbnRNb2RlbCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnaWNvbic6ICAgIG51bGxcbiAgICAgICdsYWJlbCc6ICAgbnVsbFxuICAgICAgJ3NyYyc6ICAgICBudWxsXG5cbiAgICAgICd2b2x1bWUnOiAgICAgbnVsbFxuICAgICAgJ2FjdGl2ZSc6ICAgICBudWxsXG4gICAgICAnbXV0ZSc6ICAgICAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7UGF0dGVyblNxdWFyZUNvbGxlY3Rpb259XG4gICAgICAncGF0dGVyblNxdWFyZXMnOiAgICBudWxsXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50TW9kZWwiLCIjIyMqXG4gIEEgY29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlc1xuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICcuLi9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24iLCIjIyMqXG4gIE1vZGVsIGZvciBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlcy4gIFBhcnQgb2YgbGFyZ2VyIFBhdHRlcm4gVHJhY2sgY29sbGVjdGlvblxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cblxuY2xhc3MgUGF0dGVyblNxdWFyZU1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICd2ZWxvY2l0eSc6ICAgICAgICAgMFxuICAgICAgJ3ByZXZpb3VzVmVsb2NpdHknOiAwXG4gICAgICAnYWN0aXZlJzogICAgICAgICAgIGZhbHNlXG5cblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBvbiAnY2hhbmdlOnZlbG9jaXR5JywgQG9uVmVsb2NpdHlDaGFuZ2VcblxuXG5cbiAgIGN5Y2xlOiAtPlxuICAgICAgdmVsb2NpdHkgPSBAZ2V0ICd2ZWxvY2l0eSdcblxuICAgICAgaWYgdmVsb2NpdHkgPCBBcHBDb25maWcuVkVMT0NJVFlfTUFYXG4gICAgICAgICB2ZWxvY2l0eSsrXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIHZlbG9jaXR5ID0gMFxuXG4gICAgICAjIFVwZGF0ZSB3aXRoIG5ldyB2YWx1ZVxuICAgICAgQHNldCAndmVsb2NpdHknLCB2ZWxvY2l0eVxuXG5cblxuICAgZW5hYmxlOiAtPlxuICAgICAgQHNldCAndmVsb2NpdHknLCAxXG5cblxuXG5cbiAgIGRpc2FibGU6IC0+XG4gICAgICBAc2V0ICd2ZWxvY2l0eScsIDBcblxuXG5cbiAgIG9uVmVsb2NpdHlDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIEBzZXQgJ3ByZXZpb3VzVmVsb2NpdHknLCBtb2RlbC5fcHJldmlvdXNBdHRyaWJ1dGVzLnZlbG9jaXR5XG5cbiAgICAgIHZlbG9jaXR5ID0gbW9kZWwuY2hhbmdlZC52ZWxvY2l0eVxuXG4gICAgICBpZiB2ZWxvY2l0eSA+IDBcbiAgICAgICAgIEBzZXQgJ2FjdGl2ZScsIHRydWVcblxuICAgICAgZWxzZSBpZiB2ZWxvY2l0eSBpcyAwXG4gICAgICAgICBAc2V0ICdhY3RpdmUnLCBmYWxzZVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmVNb2RlbCIsIiMjIypcbiAqIE1QQyBBcHBsaWNhdGlvbiByb3V0ZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBDb25maWcgICA9IHJlcXVpcmUgJy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuUHViU3ViICAgICAgPSByZXF1aXJlICcuLi91dGlscy9QdWJTdWInXG5QdWJFdmVudCAgICA9IHJlcXVpcmUgJy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5cbiMgVE9ETzogVGhlIGJlbG93IGl0ZW1zIGFyZSBvbmx5IGluY2x1ZGVkIGZvciB0ZXN0aW5nIGNvbXBvbmVudFxuIyBtb2R1bGFyaXR5LiAgVGhleSwgYW5kIHRoZWlyIHJvdXRlcywgc2hvdWxkIGJlIHJlbW92ZWQgaW4gcHJvZHVjdGlvblxuXG5UZXN0c1ZpZXcgICAgID0gcmVxdWlyZSAnLi4vdmlld3MvdGVzdHMvVGVzdHNWaWV3LmNvZmZlZSdcblxuVmlldyA9IHJlcXVpcmUgJy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblxuS2l0U2VsZWN0aW9uICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdGlvbi5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5LaXRNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlJ1xuXG5CUE1JbmRpY2F0b3IgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSdcbkluc3RydW1lbnRTZWxlY3Rpb25QYW5lbCA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3Rpb25QYW5lbC5jb2ZmZWUnXG5cbkluc3RydW1lbnRNb2RlbCA9ICcuLi9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9ICcuLi9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblxuUGF0dGVyblNxdWFyZSA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuVHJhY2sgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay5jb2ZmZWUnXG5TZXF1ZW5jZXIgICAgICAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSdcblxuXG5jbGFzcyBBcHBSb3V0ZXIgZXh0ZW5kcyBCYWNrYm9uZS5Sb3V0ZXJcblxuXG4gICByb3V0ZXM6XG4gICAgICAnJzogICAgICAgICAgICAgJ2xhbmRpbmdSb3V0ZSdcbiAgICAgICdjcmVhdGUnOiAgICAgICAnY3JlYXRlUm91dGUnXG4gICAgICAnc2hhcmUnOiAgICAgICAgJ3NoYXJlUm91dGUnXG5cbiAgICAgICMgQ29tcG9uZW50IHRlc3Qgcm91dGVzXG4gICAgICAndGVzdHMnOiAgICAgICAgICAgICAgICAndGVzdHMnXG4gICAgICAna2l0LXNlbGVjdGlvbic6ICAgICAgICAna2l0U2VsZWN0aW9uUm91dGUnXG4gICAgICAnYnBtLWluZGljYXRvcic6ICAgICAgICAnYnBtSW5kaWNhdG9yUm91dGUnXG4gICAgICAnaW5zdHJ1bWVudC1zZWxlY3Rvcic6ICAnaW5zdHJ1bWVudFNlbGVjdG9yUm91dGUnXG4gICAgICAncGF0dGVybi1zcXVhcmUnOiAgICAgICAncGF0dGVyblNxdWFyZVJvdXRlJ1xuICAgICAgJ3BhdHRlcm4tdHJhY2snOiAgICAgICAgJ3BhdHRlcm5UcmFja1JvdXRlJ1xuICAgICAgJ3NlcXVlbmNlcic6ICAgICAgICAgICAgJ3NlcXVlbmNlclJvdXRlJ1xuICAgICAgJ2Z1bGwtc2VxdWVuY2VyJzogICAgICAgJ2Z1bGxTZXF1ZW5jZXJSb3V0ZSdcblxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAge0BhcHBDb250cm9sbGVyLCBAYXBwTW9kZWx9ID0gb3B0aW9uc1xuXG4gICAgICBQdWJTdWIub24gUHViRXZlbnQuUk9VVEUsIEBvblJvdXRlQ2hhbmdlXG5cblxuXG4gICBvblJvdXRlQ2hhbmdlOiAocGFyYW1zKSA9PlxuICAgICAge3JvdXRlfSA9IHBhcmFtc1xuXG4gICAgICBAbmF2aWdhdGUgcm91dGUsIHsgdHJpZ2dlcjogdHJ1ZSB9XG5cblxuXG4gICBsYW5kaW5nUm91dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgQGFwcENvbnRyb2xsZXIubGFuZGluZ1ZpZXdcblxuXG5cbiAgIGNyZWF0ZVJvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLmNyZWF0ZVZpZXdcblxuXG5cbiAgIHNoYXJlUm91dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgQGFwcENvbnRyb2xsZXIuc2hhcmVWaWV3XG5cblxuXG5cblxuXG4gICAjIENPTVBPTkVOVCBURVNUIFJPVVRFU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgIHRlc3RzOiAtPlxuICAgICAgdmlldyA9IG5ldyBUZXN0c1ZpZXcoKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBraXRTZWxlY3Rpb25Sb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBLaXRTZWxlY3Rpb25cbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLFxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBicG1JbmRpY2F0b3JSb3V0ZTogLT5cbiAgICAgIHZpZXcgPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIHZpZXcucmVuZGVyKClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAgaW5zdHJ1bWVudFNlbGVjdG9yUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgdmlldyA9IG5ldyBJbnN0cnVtZW50U2VsZWN0aW9uUGFuZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cbiAgIHBhdHRlcm5TcXVhcmVSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBQYXR0ZXJuU3F1YXJlXG4gICAgICAgICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG5ldyBQYXR0ZXJuU3F1YXJlTW9kZWwoKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuICAgcGF0dGVyblRyYWNrUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgUGF0dGVyblRyYWNrXG4gICAgICAgICBtb2RlbDogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG4gICBzZXF1ZW5jZXJSb3V0ZTogLT5cblxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IFNlcXVlbmNlclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG4gICBmdWxsU2VxdWVuY2VyUm91dGU6IC0+XG5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuXG4gICAgICBraXRTZWxlY3Rpb24gPSA9PlxuICAgICAgICAgdmlldyA9IG5ldyBLaXRTZWxlY3Rpb25cbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgICAgIHZpZXdcblxuXG4gICAgICBicG0gPSA9PlxuICAgICAgICAgdmlldyA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgICAgdmlld1xuXG5cbiAgICAgIGluc3RydW1lbnRTZWxlY3Rpb24gPSA9PlxuICAgICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICAgICB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3Rpb25QYW5lbFxuICAgICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgICAgdmlld1xuXG5cbiAgICAgIHNlcXVlbmNlciA9ID0+XG4gICAgICAgICB2aWV3ID0gbmV3IFNlcXVlbmNlclxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgICAgIHZpZXdcblxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcgPSBuZXcgVmlldygpXG5cbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQga2l0U2VsZWN0aW9uKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgYnBtKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgaW5zdHJ1bWVudFNlbGVjdGlvbigpLnJlbmRlcigpLmVsXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldy4kZWwuYXBwZW5kIHNlcXVlbmNlcigpLnJlbmRlcigpLmVsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBmdWxsU2VxdWVuY2VyVmlld1xuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwUm91dGVyIiwiIyMjKlxuICogVmlldyBzdXBlcmNsYXNzIGNvbnRhaW5pbmcgc2hhcmVkIGZ1bmN0aW9uYWxpdHlcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDIuMTcuMTRcbiMjI1xuXG5cblZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZFxuXG5cblxuICAgIyBJbml0aWFsaXplcyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIF8uZXh0ZW5kIEAsIF8uZGVmYXVsdHMoIG9wdGlvbnMgPSBvcHRpb25zIHx8IEBkZWZhdWx0cywgQGRlZmF1bHRzIHx8IHt9IClcblxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgd2l0aCBzdXBwbGllZCB0ZW1wbGF0ZSBkYXRhLCBvciBjaGVja3MgaWYgdGVtcGxhdGUgaXMgb25cbiAgICMgb2JqZWN0IGJvZHlcbiAgICMgQHBhcmFtICB7RnVuY3Rpb258TW9kZWx9IHRlbXBsYXRlRGF0YVxuICAgIyBAcmV0dXJuIHtWaWV3fVxuXG4gICByZW5kZXI6ICh0ZW1wbGF0ZURhdGEpIC0+XG4gICAgICB0ZW1wbGF0ZURhdGEgPSB0ZW1wbGF0ZURhdGEgfHwge31cblxuICAgICAgaWYgQHRlbXBsYXRlXG5cbiAgICAgICAgICMgSWYgbW9kZWwgaXMgYW4gaW5zdGFuY2Ugb2YgYSBiYWNrYm9uZSBtb2RlbCwgdGhlbiBKU09OaWZ5IGl0XG4gICAgICAgICBpZiBAbW9kZWwgaW5zdGFuY2VvZiBCYWNrYm9uZS5Nb2RlbFxuICAgICAgICAgICAgdGVtcGxhdGVEYXRhID0gQG1vZGVsLnRvSlNPTigpXG5cbiAgICAgICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUgKHRlbXBsYXRlRGF0YSlcblxuICAgICAgQGRlbGVnYXRlRXZlbnRzKClcbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW1vdmVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbW92ZTogKG9wdGlvbnMpIC0+XG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuICAgICAgQCRlbC5yZW1vdmUoKVxuICAgICAgQHVuZGVsZWdhdGVFdmVudHMoKVxuXG5cblxuXG5cbiAgICMgU2hvd3MgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgc2hvdzogKG9wdGlvbnMpIC0+XG4gICAgICBUd2Vlbk1heC5zZXQgQCRlbCwgeyBhdXRvQWxwaGE6IDEgfVxuXG5cblxuXG4gICAjIEhpZGVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGhpZGU6IChvcHRpb25zKSAtPlxuICAgICAgVHdlZW5NYXguc2V0IEAkZWwsXG4gICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICBpZiBvcHRpb25zPy5yZW1vdmVcbiAgICAgICAgICAgICAgIEByZW1vdmUoKVxuXG5cblxuXG4gICAjIE5vb3Agd2hpY2ggaXMgY2FsbGVkIG9uIHJlbmRlclxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cblxuXG5cbiAgICMgUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBsaXN0ZW5lcnNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAc3RvcExpc3RlbmluZygpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXciLCIvKipcbiAqIEBtb2R1bGUgICAgIFB1YlN1YlxuICogQGRlc2MgICAgICAgR2xvYmFsIFB1YlN1YiBvYmplY3QgZm9yIGRpc3BhdGNoIGFuZCBkZWxlZ2F0aW9uXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBQdWJTdWIgPSB7fVxuXG5fLmV4dGVuZCggUHViU3ViLCBCYWNrYm9uZS5FdmVudHMgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFB1YlN1YiIsIiMjIypcbiAqIENyZWF0ZSB2aWV3IHdoaWNoIHRoZSB1c2VyIGNhbiBidWlsZCBiZWF0cyB3aXRoaW5cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvY3JlYXRlLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBDcmVhdGVWaWV3IGV4dGVuZHMgVmlld1xuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG5tb2R1bGUuZXhwb3J0cyA9IENyZWF0ZVZpZXciLCIjIyMqXG4gKiBCZWF0cyBwZXIgbWludXRlIHZpZXcgZm9yIGhhbmRsaW5nIHRlbXBvXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBFdmVudCAgPSByZXF1aXJlICcuLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvYnBtLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBCUE1JbmRpY2F0b3IgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBSZWYgdG8gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgVGhlIHNldEludGVydmFsIHVwZGF0ZSBpbnRlcnZhbCBmb3IgaW5jcmVhc2luZyBhbmRcbiAgICMgZGVjcmVhc2luZyBCUE0gb24gcHJlc3MgLyB0b3VjaFxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBpbnRlcnZhbFVwZGF0ZVRpbWU6IDcwXG5cblxuICAgIyBUaGUgc2V0SW50ZXJ2YWwgdXBkYXRlclxuICAgIyBAdHlwZSB7U2V0SW50ZXJ2YWx9XG5cbiAgIHVwZGF0ZUludGVydmFsOiBudWxsXG5cblxuICAgIyBUaGUgYW1vdW50IHRvIGluY3JlYXNlIHRoZSBCUE0gYnkgb24gZWFjaCB0aWNrXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGJwbUluY3JlYXNlQW1vdW50OiAxXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaHN0YXJ0IC5idG4taW5jcmVhc2UnOiAnb25JbmNyZWFzZUJ0bkRvd24nXG4gICAgICAndG91Y2hzdGFydCAuYnRuLWRlY3JlYXNlJzogJ29uRGVjcmVhc2VCdG5Eb3duJ1xuICAgICAgJ3RvdWNoZW5kICAgLmJ0bi1pbmNyZWFzZSc6ICdvbkJ0blVwJ1xuICAgICAgJ3RvdWNoZW5kICAgLmJ0bi1kZWNyZWFzZSc6ICdvbkJ0blVwJ1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgdXBkYXRlIHRoZSBraXQgaWYgbm90IGFscmVhZHlcbiAgICMgc2V0IHZpYSBhIHByZXZpb3VzIHNlc3Npb25cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRicG1MYWJlbCAgID0gQCRlbC5maW5kICcubGFiZWwtYnBtJ1xuICAgICAgQGluY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWluY3JlYXNlJ1xuICAgICAgQGRlY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWRlY3JlYXNlJ1xuXG4gICAgICBAJGJwbUxhYmVsLnRleHQgQGFwcE1vZGVsLmdldCgnYnBtJylcblxuICAgICAgQFxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAgIyBzd2l0Y2hpbmcgQlBNXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0JQTSwgQG9uQlBNQ2hhbmdlXG5cblxuXG5cbiAgICMgU2V0cyBhbiBpbnRlcnZhbCB0byBpbmNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgICMgd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2VcblxuICAgaW5jcmVhc2VCUE06IC0+XG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgICAgYnBtID0gQGFwcE1vZGVsLmdldCAnYnBtJ1xuXG4gICAgICAgICBpZiBicG0gPCBBcHBDb25maWcuQlBNX01BWFxuICAgICAgICAgICAgYnBtICs9IEBicG1JbmNyZWFzZUFtb3VudFxuXG4gICAgICAgICBlbHNlXG4gICAgICAgICAgICBicG0gPSBBcHBDb25maWcuQlBNX01BWFxuXG4gICAgICAgICBAYXBwTW9kZWwuc2V0ICdicG0nLCBicG1cblxuICAgICAgLCBAaW50ZXJ2YWxVcGRhdGVUaW1lXG5cblxuXG5cbiAgICMgU2V0cyBhbiBpbnRlcnZhbCB0byBkZWNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgICMgd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2VcblxuICAgZGVjcmVhc2VCUE06IC0+XG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgICAgYnBtID0gQGFwcE1vZGVsLmdldCAnYnBtJ1xuXG4gICAgICAgICBpZiBicG0gPiAwXG4gICAgICAgICAgICBicG0gLT0gQGJwbUluY3JlYXNlQW1vdW50XG5cbiAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJwbSA9IDBcblxuICAgICAgICAgQGFwcE1vZGVsLnNldCAnYnBtJywgYnBtXG5cbiAgICAgICwgQGludGVydmFsVXBkYXRlVGltZVxuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkluY3JlYXNlQnRuRG93bjogKGV2ZW50KSA9PlxuICAgICAgQGluY3JlYXNlQlBNKClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uRGVjcmVhc2VCdG5Eb3duOiAoZXZlbnQpIC0+XG4gICAgICBAZGVjcmVhc2VCUE0oKVxuXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbW91c2UgLyB0b3VjaHVwIGV2ZW50cy4gIENsZWFycyB0aGUgaW50ZXJ2YWxcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25CdG5VcDogKGV2ZW50KSAtPlxuICAgICAgY2xlYXJJbnRlcnZhbCBAdXBkYXRlSW50ZXJ2YWxcbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IG51bGxcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGxhYmVsIG9uIHRoZVxuICAgIyBraXQgc2VsZWN0b3JcblxuICAgb25CUE1DaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIEAkYnBtTGFiZWwudGV4dCBtb2RlbC5jaGFuZ2VkLmJwbVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEJQTUluZGljYXRvciIsIiMjIypcbiAqIEtpdCBzZWxlY3RvciBmb3Igc3dpdGNoaW5nIGJldHdlZW4gZHJ1bS1raXQgc291bmRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwRXZlbnQgPSByZXF1aXJlICcuLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2tpdC1zZWxlY3Rpb24tdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEtpdFNlbGVjdGlvbiBleHRlbmRzIFZpZXdcblxuXG4gICAjIFJlZiB0byB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIEtpdENvbGxlY3Rpb24gZm9yIHVwZGF0aW5nIHNvdW5kc1xuICAgIyBAdHlwZSB7S2l0Q29sbGVjdGlvbn1cblxuICAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgVGhlIGN1cnJlbnQga2l0XG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0TW9kZWw6IG51bGxcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCAuYnRuLWxlZnQnOiAgICdvbkxlZnRCdG5DbGljaydcbiAgICAgICd0b3VjaGVuZCAuYnRuLXJpZ2h0JzogICdvblJpZ2h0QnRuQ2xpY2snXG5cblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGFuZCB1cGRhdGUgdGhlIGtpdCBpZiBub3QgYWxyZWFkeVxuICAgIyBzZXQgdmlhIGEgcHJldmlvdXMgc2Vzc2lvblxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGtpdExhYmVsID0gQCRlbC5maW5kICcubGFiZWwta2l0J1xuXG4gICAgICBpZiBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpIGlzIG51bGxcbiAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQCRraXRMYWJlbC50ZXh0IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJykuZ2V0ICdsYWJlbCdcblxuICAgICAgQFxuXG5cblxuXG4gICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRpbmcgY2hhbmdlcyByZWxhdGVkIHRvXG4gICAjIHN3aXRjaGluZyBkcnVtIGtpdHNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfS0lULCBAb25DaGFuZ2VLaXRcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG5cbiAgIG9uTGVmdEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLnByZXZpb3VzS2l0KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG5cbiAgIG9uUmlnaHRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5uZXh0S2l0KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGxhYmVsIG9uIHRoZVxuICAgIyBraXQgc2VsZWN0b3JcblxuICAgb25DaGFuZ2VLaXQ6IChtb2RlbCkgLT5cbiAgICAgIEBraXRNb2RlbCA9IG1vZGVsLmNoYW5nZWQua2l0TW9kZWxcbiAgICAgIEAka2l0TGFiZWwudGV4dCBAa2l0TW9kZWwuZ2V0ICdsYWJlbCdcblxuXG5cblxuXG4gICAjIFBSSVZBVEUgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2l0U2VsZWN0aW9uIiwiIyMjKlxuICogU291bmQgdHlwZSBzZWxlY3RvciBmb3IgY2hvb3Npbmcgd2hpY2ggc291bmQgc2hvdWxkXG4gKiBwbGF5IG9uIGVhY2ggdHJhY2tcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBJbnN0cnVtZW50IGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIHZpZXcgY2xhc3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnaW5zdHJ1bWVudCdcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFJlZiB0byB0aGUgSW5zdHJ1bWVudE1vZGVsXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG5cbiAgIG1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIHBhcmVudCBraXRcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRNb2RlbDogbnVsbFxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kJzogJ29uQ2xpY2snXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGNsaWNrIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGN1cnJlbnQgaW5zdHJ1bWVudCBtb2RlbCwgd2hpY2hcbiAgICMgSW5zdHJ1bWVudFNlbGVjdGlvblBhbmVsIGxpc3RlbnMgdG8sIGFuZCBhZGRzIGEgc2VsZWN0ZWQgc3RhdGVcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGtpdE1vZGVsLnNldCAnY3VycmVudEluc3RydW1lbnQnLCBAbW9kZWxcbiAgICAgIEAkZWwuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50IiwiIyMjKlxuICogUGFuZWwgd2hpY2ggaG91c2VzIGVhY2ggaW5kaXZpZHVhbCBzZWxlY3RhYmxlIHNvdW5kXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwRXZlbnQgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5JbnN0cnVtZW50ICA9IHJlcXVpcmUgJy4vSW5zdHJ1bWVudC5jb2ZmZWUnXG50ZW1wbGF0ZSAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2luc3RydW1lbnQtcGFuZWwtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEluc3RydW1lbnRTZWxlY3Rpb25QYW5lbCBleHRlbmRzIFZpZXdcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFJlZiB0byB0aGUgYXBwbGljYXRpb24gbW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIGtpdCBjb2xsZWN0aW9uXG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQga2l0XG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0TW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byBpbnN0cnVtZW50IHZpZXdzXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgaW5zdHJ1bWVudFZpZXdzOiBudWxsXG5cblxuXG4gICBldmVudHM6XG4gICAgICAnY2xpY2sgLnRlc3QnOiAnb25UZXN0Q2xpY2snXG5cblxuXG4gICAjIEluaXRpYWxpemVzIHRoZSBpbnN0cnVtZW50IHNlbGVjdG9yIGFuZCBzZXRzIGEgbG9jYWwgcmVmXG4gICAjIHRvIHRoZSBjdXJyZW50IGtpdCBtb2RlbCBmb3IgZWFzeSBhY2Nlc3NcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBraXRNb2RlbCA9IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJylcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGFzIHdlbGwgYXMgdGhlIGFzc29jaWF0ZWQga2l0IGluc3RydW1lbnRzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkY29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLWluc3RydW1lbnRzJ1xuXG4gICAgICBAcmVuZGVySW5zdHJ1bWVudHMoKVxuXG4gICAgICBAXG5cblxuXG5cbiAgICMgUmVuZGVycyBlYWNoIGluZGl2aWR1YWwga2l0IG1vZGVsIGludG8gYW4gSW5zdHJ1bWVudFxuXG4gICByZW5kZXJJbnN0cnVtZW50czogLT5cbiAgICAgIEBpbnN0cnVtZW50Vmlld3MgPSBbXVxuXG4gICAgICBAa2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgICAgaW5zdHJ1bWVudCA9IG5ldyBJbnN0cnVtZW50XG4gICAgICAgICAgICBraXRNb2RlbDogQGtpdE1vZGVsXG4gICAgICAgICAgICBtb2RlbDogbW9kZWxcblxuICAgICAgICAgQCRjb250YWluZXIuYXBwZW5kIGluc3RydW1lbnQucmVuZGVyKCkuZWxcbiAgICAgICAgIEBpbnN0cnVtZW50Vmlld3MucHVzaCBpbnN0cnVtZW50XG5cblxuXG5cbiAgICMgQWRkcyBldmVudCBsaXN0ZW5lcnMgcmVsYXRlZCB0byBraXQgY2hhbmdlc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9LSVQsIEBvbktpdENoYW5nZVxuICAgICAgQGxpc3RlblRvIEBraXRNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0lOU1RSVU1FTlQsIEBvbkluc3RydW1lbnRDaGFuZ2VcblxuXG5cbiAgICMgUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAc3RvcExpc3RlbmluZygpXG5cblxuXG5cblxuICAgIyBFVkVOVCBMSVNURU5FUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBDbGVhbnMgdXAgdGhlIHZpZXcgYW5kIHJlLXJlbmRlcnNcbiAgICMgdGhlIGluc3RydW1lbnRzIHRvIHRoZSBET01cbiAgICMgQHBhcmFtIHtLaXRNb2RlbH0gbW9kZWxcblxuICAgb25LaXRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG5cbiAgICAgIEBraXRNb2RlbCA9IG1vZGVsLmNoYW5nZWQua2l0TW9kZWxcblxuICAgICAgXy5lYWNoIEBpbnN0cnVtZW50Vmlld3MsIChpbnN0cnVtZW50KSAtPlxuICAgICAgICAgaW5zdHJ1bWVudC5yZW1vdmUoKVxuXG4gICAgICBAcmVuZGVySW5zdHJ1bWVudHMoKVxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgb25JbnN0cnVtZW50Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAJGNvbnRhaW5lci5maW5kKCcuaW5zdHJ1bWVudCcpLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcblxuXG5cblxuXG4gICBvblRlc3RDbGljazogKGV2ZW50KSAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5uZXh0S2l0KClcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRTZWxlY3Rpb25QYW5lbCIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0ndGVzdCc+TkVYVDwvZGl2PlxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci1pbnN0cnVtZW50cyc+XFxuXFxuPC9kaXY+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIjtcblxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9J2ljb24gXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmljb24pIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmljb247IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCInPio8L2Rpdj5cXG48ZGl2IGNsYXNzPSdsYWJlbCc+XFxuXHRcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmxhYmVsOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuPC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwiIyMjKlxuICogSW5kaXZpZHVhbCBzZXF1ZW5jZXIgdHJhY2tzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYXR0ZXJuLXNxdWFyZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgUGF0dGVyblNxdWFyZSBleHRlbmRzIFZpZXdcblxuXG4gICBjbGFzc05hbWU6ICdwYXR0ZXJuLXNxdWFyZSdcblxuICAgdGFnTmFtZTogJ3RkJ1xuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuICAgIyBAdHlwZSB7UGF0dGVyblNxdWFyZU1vZGVsfVxuICAgcGF0dGVyblNxdWFyZU1vZGVsOiBudWxsXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kJzogJ29uQ2xpY2snXG5cblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1ZFTE9DSVRZLCBAb25WZWxvY2l0eUNoYW5nZVxuXG5cblxuICAgZW5hYmxlOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5lbmFibGUoKVxuXG5cbiAgIGRpc2FibGU6IC0+XG4gICAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmRpc2FibGUoKVxuXG5cbiAgIGZsYXNoT246IC0+XG4gICAgICBAJGVsLmFkZENsYXNzICdmbGFzaCdcblxuXG5cbiAgIGZsYXNoT2ZmOiAtPlxuICAgICAgQCRlbC5yZW1vdmVDbGFzcyAnZmxhc2gnXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgb25DbGljazogKGV2ZW50KSAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5jeWNsZSgpXG5cblxuXG4gICBvblZlbG9jaXR5Q2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICB2ZWxvY2l0eSA9IG1vZGVsLmNoYW5nZWQudmVsb2NpdHlcblxuICAgICAgQCRlbC5yZW1vdmVDbGFzcyAndmVsb2NpdHktbG93IHZlbG9jaXR5LW1lZGl1bSB2ZWxvY2l0eS1oaWdoJ1xuXG4gICAgICB2ZWxvY2l0eUNsYXNzID0gc3dpdGNoIHZlbG9jaXR5XG4gICAgICAgICB3aGVuIDEgdGhlbiAndmVsb2NpdHktbG93J1xuICAgICAgICAgd2hlbiAyIHRoZW4gJ3ZlbG9jaXR5LW1lZGl1bSdcbiAgICAgICAgIHdoZW4gMyB0aGVuICd2ZWxvY2l0eS1oaWdoJ1xuICAgICAgICAgZWxzZSAnJ1xuXG4gICAgICBAJGVsLmFkZENsYXNzIHZlbG9jaXR5Q2xhc3NcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmUiLCIjIyMqXG4gKiBJbmRpdmlkdWFsIHNlcXVlbmNlciB0cmFja3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlICAgICAgICAgICA9IHJlcXVpcmUgJy4vUGF0dGVyblNxdWFyZS5jb2ZmZWUnXG5WaWV3ICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGF0dGVybi10cmFjay10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgUGF0dGVyblRyYWNrIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIG5hbWUgb2YgdGhlIGNsYXNzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3BhdHRlcm4tdHJhY2snXG5cblxuICAgIyBUaGUgdHlwZSBvZiB0YWdcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdGFnTmFtZTogJ3RyJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBBIGNvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCB2aWV3IHNxdWFyZXNcbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBwYXR0ZXJuU3F1YXJlVmlld3M6IG51bGxcblxuXG4gICAjIEB0eXBlIHtQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbn1cbiAgIGNvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICBtb2RlbDogbnVsbFxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLmJ0bi1tdXRlJzogJ29uTXV0ZUJ0bkNsaWNrJ1xuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYW5kIHJlbmRlcnMgb3V0IGluZGl2aWR1YWwgcGF0dGVybiBzcXVhcmVzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkbGFiZWwgPSBAJGVsLmZpbmQgJy5sYWJlbC1pbnN0cnVtZW50J1xuXG4gICAgICBAcmVuZGVyUGF0dGVyblNxdWFyZXMoKVxuXG4gICAgICBAXG5cblxuXG5cbiAgICMgQWRkIGxpc3RlbmVycyB0byB0aGUgdmlldyB3aGljaCBsaXN0ZW4gZm9yIHZpZXcgY2hhbmdlc1xuICAgIyBhcyB3ZWxsIGFzIGNoYW5nZXMgdG8gdGhlIGNvbGxlY3Rpb24sIHdoaWNoIHNob3VsZCB1cGRhdGVcbiAgICMgcGF0dGVybiBzcXVhcmVzIHdpdGhvdXQgcmUtcmVuZGVyaW5nIHRoZSB2aWV3c1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsICdjaGFuZ2U6bXV0ZScsIEBvbk11dGVDaGFuZ2VcblxuXG5cblxuICAgIyBSZW5kZXIgb3V0IHRoZSBwYXR0ZXJuIHNxdWFyZXMgYW5kIHB1c2ggdGhlbSBpbnRvIGFuIGFycmF5XG4gICAjIGZvciBmdXJ0aGVyIGl0ZXJhdGlvblxuXG4gICByZW5kZXJQYXR0ZXJuU3F1YXJlczogLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlVmlld3MgPSBbXVxuXG4gICAgICBAY29sbGVjdGlvbiA9IG5ldyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvblxuXG4gICAgICBfKDgpLnRpbWVzID0+XG4gICAgICAgICBAY29sbGVjdGlvbi5hZGQgbmV3IFBhdHRlcm5TcXVhcmVNb2RlbCgpXG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgICAgcGF0dGVyblNxdWFyZSA9IG5ldyBQYXR0ZXJuU3F1YXJlXG4gICAgICAgICAgICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG1vZGVsXG5cbiAgICAgICAgIEAkbGFiZWwudGV4dCBtb2RlbC5nZXQgJ2xhYmVsJ1xuICAgICAgICAgQCRlbC5hcHBlbmQgcGF0dGVyblNxdWFyZS5yZW5kZXIoKS5lbFxuICAgICAgICAgQHBhdHRlcm5TcXVhcmVWaWV3cy5wdXNoIHBhdHRlcm5TcXVhcmVcblxuXG5cbiAgICMgTXV0ZSB0aGUgZW50aXJlIHRyYWNrXG5cbiAgIG11dGU6IC0+XG4gICAgICBAbW9kZWwuc2V0ICdtdXRlJywgdHJ1ZVxuXG5cblxuICAgIyBVbm11dGUgdGhlIGVudGlyZSB0cmFja1xuXG4gICB1bm11dGU6IC0+XG4gICAgICBAbW9kZWwuc2V0ICdtdXRlJywgZmFsc2VcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtdXRlIG1vZGVsIGNoYW5nZSBldmVudHNcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uTXV0ZUNoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgbXV0ZSA9IG1vZGVsLmNoYW5nZWQubXV0ZVxuXG4gICAgICBpZiBtdXRlXG4gICAgICAgICBAJGVsLmFkZENsYXNzICdtdXRlJ1xuXG4gICAgICBlbHNlIEAkZWwucmVtb3ZlQ2xhc3MgJ211dGUnXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBidXR0b24gY2xpY2tzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbk11dGVCdG5DbGljazogKGV2ZW50KSA9PlxuICAgICAgaWYgQG1vZGVsLmdldCAnbXV0ZSdcbiAgICAgICAgIEB1bm11dGUoKVxuXG4gICAgICBlbHNlIEBtdXRlKClcblxuXG5cblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5UcmFjayIsIiMjIypcbiAqIFNlcXVlbmNlciBwYXJlbnQgdmlldyBmb3IgdHJhY2sgc2VxdWVuY2VzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuUGF0dGVyblRyYWNrID0gcmVxdWlyZSAnLi9QYXR0ZXJuVHJhY2suY29mZmVlJ1xuQXBwRXZlbnQgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbmhlbHBlcnMgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2hlbHBlcnMvaGFuZGxlYmFycy1oZWxwZXJzJ1xudGVtcGxhdGUgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2VxdWVuY2VyLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBTZXF1ZW5jZXIgZXh0ZW5kcyBWaWV3XG5cblxuICAgY2xhc3NOYW1lOiAnc2VxdWVuY2VyLWNvbnRhaW5lcidcbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICAgcGF0dGVyblRyYWNrVmlld3M6IG51bGxcbiAgIGJwbUludGVydmFsOiBudWxsXG5cbiAgIHVwZGF0ZUludGVydmFsVGltZTogMjAwXG4gICBjdXJyQ2VsbElkOiAtMVxuICAgbnVtQ2VsbHM6IDdcblxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgIGNvbGxlY3Rpb246IG51bGxcblxuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJHRoU3RlcHBlciA9IEAkZWwuZmluZCAndGguc3RlcHBlcidcbiAgICAgIEAkc2VxdWVuY2VyID0gQCRlbC5maW5kICcuc2VxdWVuY2VyJ1xuXG4gICAgICBAcmVuZGVyVHJhY2tzKClcbiAgICAgIEBwbGF5KClcblxuICAgICAgQFxuXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIHN1cGVyKClcblxuICAgICAgQHBhdXNlKClcblxuXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1BMQVlJTkcsIEBvblBsYXlpbmdDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9LSVQsIEBvbktpdENoYW5nZVxuXG5cblxuXG4gICByZW5kZXJUcmFja3M6ID0+XG4gICAgICBAJGVsLmZpbmQoJy5wYXR0ZXJuLXRyYWNrJykucmVtb3ZlKClcblxuICAgICAgQHBhdHRlcm5UcmFja1ZpZXdzID0gW11cblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAobW9kZWwpID0+XG5cbiAgICAgICAgIHBhdHRlcm5UcmFjayA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IG1vZGVsLmdldCAncGF0dGVyblNxdWFyZXMnXG4gICAgICAgICAgICBtb2RlbDogbW9kZWxcblxuICAgICAgICAgQHBhdHRlcm5UcmFja1ZpZXdzLnB1c2ggcGF0dGVyblRyYWNrXG4gICAgICAgICBAJHNlcXVlbmNlci5hcHBlbmQgcGF0dGVyblRyYWNrLnJlbmRlcigpLmVsXG5cblxuXG4gICB1cGRhdGVUaW1lOiA9PlxuICAgICAgQCR0aFN0ZXBwZXIucmVtb3ZlQ2xhc3MgJ3N0ZXAnXG4gICAgICBAY3VyckNlbGxJZCA9IGlmIEBjdXJyQ2VsbElkIDwgQG51bUNlbGxzIHRoZW4gQGN1cnJDZWxsSWQgKz0gMSBlbHNlIEBjdXJyQ2VsbElkID0gMFxuICAgICAgJChAJHRoU3RlcHBlcltAY3VyckNlbGxJZF0pLmFkZENsYXNzICdzdGVwJ1xuXG5cblxuXG4gICBjb252ZXJ0QlBNOiAtPlxuICAgICAgcmV0dXJuIDIwMFxuXG5cblxuXG4gICBwbGF5OiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAncGxheWluZycsIHRydWVcblxuXG5cblxuICAgcGF1c2U6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgZmFsc2VcblxuXG5cblxuICAgbXV0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ211dGUnLCB0cnVlXG5cblxuXG5cbiAgIHVubXV0ZTogLT5cbiAgICAgICBAYXBwTW9kZWwuc2V0ICdtdXRlJywgZmFsc2VcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgb25QbGF5aW5nQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBwbGF5aW5nID0gbW9kZWwuY2hhbmdlZC5wbGF5aW5nXG5cbiAgICAgIGlmIHBsYXlpbmdcbiAgICAgICAgIEBicG1JbnRlcnZhbCA9IHNldEludGVydmFsIEB1cGRhdGVUaW1lLCBAdXBkYXRlSW50ZXJ2YWxUaW1lXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIGNsZWFySW50ZXJ2YWwgQGJwbUludGVydmFsXG4gICAgICAgICBAYnBtSW50ZXJ2YWwgPSBudWxsXG5cblxuXG5cbiAgIG9uTXV0ZUNoYW5nZTogKG1vZGVsKSA9PlxuXG5cblxuXG4gICBvbktpdENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQGNvbGxlY3Rpb24gPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKVxuICAgICAgQHJlbmRlclRyYWNrcygpXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZXF1ZW5jZXIiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIjtcblxuXG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cblxuICBidWZmZXIgKz0gXCI8dGQgY2xhc3M9J2xhYmVsLWluc3RydW1lbnQnPlxcblx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXG48L3RkPlxcbjx0ZCBjbGFzcz0nYnRuLW11dGUnPlxcblx0bXV0ZVxcbjwvdGQ+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc3RhY2syLCBvcHRpb25zLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblx0XHRcdDx0aCBjbGFzcz0nc3RlcHBlcic+PC90aD5cXG5cdFx0XCI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8dGFibGUgY2xhc3M9J3NlcXVlbmNlcic+XFxuXHQ8dHI+XFxuXHRcdDx0aD48L3RoPlxcblx0XHQ8dGg+PC90aD5cXG5cXG5cdFx0XCI7XG4gIG9wdGlvbnMgPSB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX07XG4gIHN0YWNrMiA9ICgoc3RhY2sxID0gaGVscGVycy5yZXBlYXQgfHwgZGVwdGgwLnJlcGVhdCksc3RhY2sxID8gc3RhY2sxLmNhbGwoZGVwdGgwLCA4LCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwicmVwZWF0XCIsIDgsIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC90cj5cXG5cXG48L3RhYmxlPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWRlY3JlYXNlJz5ERUNSRUFTRTwvYnV0dG9uPlxcbjxzcGFuIGNsYXNzPSdsYWJlbC1icG0nPjA8L3NwYW4+XFxuPGJ1dHRvbiBjbGFzcz0nYnRuLWluY3JlYXNlJz5JTkNSRUFTRTwvYnV0dG9uPlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWxlZnQnPkxFRlQ8L2J1dHRvbj5cXG48c3BhbiBjbGFzcz0nbGFiZWwta2l0Jz5EUlVNIEtJVDwvc3Bhbj5cXG48YnV0dG9uIGNsYXNzPSdidG4tcmlnaHQnPlJJR0hUPC9idXR0b24+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8YSBocmVmPScjL3NoYXJlJz5TSEFSRTwvYT5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuUHViU3ViICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9QdWJTdWInXG5QdWJFdmVudCA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvbGFuZGluZy10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgTGFuZGluZ1ZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5zdGFydC1idG4nOiAnb25TdGFydEJ0bkNsaWNrJ1xuXG5cbiAgIG9uU3RhcnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgUHViU3ViLnRyaWdnZXIgUHViRXZlbnQuUk9VVEUsXG4gICAgICAgICByb3V0ZTogJ2NyZWF0ZSdcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZGluZ1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxzcGFuIGNsYXNzPSdzdGFydC1idG4nPkNSRUFURTwvc3Bhbj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBTaGFyZSB0aGUgdXNlciBjcmVhdGVkIGJlYXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2hhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFNoYXJlVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlVmlldyIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGEgaHJlZj0nLyMnPk5FVzwvYT5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVzdHMtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFRlc3RzVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0c1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxoMT5Db21wb25lbnQgVmlld2VyPC9oMT5cXG5cXG48YnIgLz5cXG48cD5cXG5cdE1ha2Ugc3VyZSB0aGF0IDxiPmh0dHBzdGVyPC9iPiBpcyBydW5uaW5nIGluIHRoZSA8Yj5zb3VyY2U8L2I+IHJvdXRlIChucG0gaW5zdGFsbCAtZyBodHRwc3RlcikgPGJyLz5cXG5cdDxhIGhyZWY9XFxcImh0dHA6Ly9sb2NhbGhvc3Q6MzMzMy90ZXN0L2h0bWwvXFxcIj5Nb2NoYSBUZXN0IFJ1bm5lcjwvYT5cXG48L3A+XFxuXFxuPGJyIC8+XFxuPHVsPlxcblx0PGxpPjxhIGhyZWY9JyNraXQtc2VsZWN0aW9uJz5LaXQgU2VsZWN0aW9uPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2JwbS1pbmRpY2F0b3JcXFwiPkJQTSBJbmRpY2F0b3I8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjaW5zdHJ1bWVudC1zZWxlY3RvclxcXCI+SW5zdHJ1bWVudCBTZWxlY3RvcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNwYXR0ZXJuLXNxdWFyZVxcXCI+UGF0dGVybiBTcXVhcmU8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjcGF0dGVybi10cmFja1xcXCI+UGF0dGVybiBUcmFjazwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNzZXF1ZW5jZXJcXFwiPlNlcXVlbmNlcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNmdWxsLXNlcXVlbmNlclxcXCI+RnVsbCBTZXF1ZW5jZXI8L2E+PC9saT5cXG48L3VsPlwiO1xuICB9KSIsIlxuZGVzY3JpYmUgJ01vZGVscycsID0+XG5cbiAgIHJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvS2l0Q29sbGVjdGlvbi1zcGVjLmNvZmZlZSdcbiAgIHJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvS2l0TW9kZWwtc3BlYy5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1ZpZXdzJywgPT5cblxuICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUnXG4gICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0aW9uLXNwZWMuY29mZmVlJ1xuICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci1zcGVjLmNvZmZlZSdcblxuXG4gICBkZXNjcmliZSAnSW5zdHJ1bWVudCBTZWxlY3RvcicsID0+XG5cbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0aW9uUGFuZWwtc3BlYy5jb2ZmZWUnXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC1zcGVjLmNvZmZlZSdcblxuXG4gICBkZXNjcmliZSAnU2VxdWVuY2VyJywgPT5cblxuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLXNwZWMuY29mZmVlJ1xuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2stc3BlYy5jb2ZmZWUnXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci1zcGVjLmNvZmZlZSdcblxuXG5cbnJlcXVpcmUgJy4vc3BlYy92aWV3cy9zaGFyZS9TaGFyZVZpZXctc3BlYy5jb2ZmZWUnXG5yZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXctc3BlYy5jb2ZmZWUnXG5cblxuXG5yZXF1aXJlICcuL3NwZWMvbW9kZWxzL1NvdW5kQ29sbGVjdGlvbi1zcGVjLmNvZmZlZSdcbnJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvU291bmRNb2RlbC1zcGVjLmNvZmZlZSdcblxuIyBDb250cm9sbGVyc1xucmVxdWlyZSAnLi9zcGVjL0FwcENvbnRyb2xsZXItc3BlYy5jb2ZmZWUnXG4iLCJBcHBDb250cm9sbGVyID0gcmVxdWlyZSAnLi4vLi4vc3JjL3NjcmlwdHMvQXBwQ29udHJvbGxlci5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0FwcCBDb250cm9sbGVyJywgLT5cblxuICAgaXQgJ1Nob3VsZCBpbml0aWFsaXplJywgPT4iLCJBcHBDb25maWcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5cbmRlc2NyaWJlICdLaXQgQ29sbGVjdGlvbicsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cblxuICAgaXQgJ1Nob3VsZCBwYXJzZSB0aGUgcmVzcG9uc2UgYW5kIGFwcGVuZCBhbiBhc3NldFBhdGggdG8gZWFjaCBraXQgbW9kZWwnLCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdwYXRoJykuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCByZXR1cm4gdGhlIG5leHQga2l0JywgPT5cbiAgICAgIGtpdERhdGEgPSBAa2l0Q29sbGVjdGlvbi50b0pTT04oKVxuICAgICAga2l0ID0gQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG4gICAgICBraXQuZ2V0KCdsYWJlbCcpLnNob3VsZC5lcXVhbCBraXREYXRhWzFdLmxhYmVsXG5cblxuICAgaXQgJ1Nob3VsZCByZXR1cm4gdGhlIHByZXZpb3VzIGtpdCcsID0+XG4gICAgICBraXREYXRhID0gQGtpdENvbGxlY3Rpb24udG9KU09OKClcbiAgICAgIGtpdCA9IEBraXRDb2xsZWN0aW9uLnByZXZpb3VzS2l0KClcbiAgICAgIGtpdC5nZXQoJ2xhYmVsJykuc2hvdWxkLmVxdWFsIGtpdERhdGFba2l0RGF0YS5sZW5ndGgtMV0ubGFiZWwiLCJBcHBDb25maWcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblxuZGVzY3JpYmUgJ0tpdCBNb2RlbCcsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cblxuICAgICAgZGF0YSA9IHtcbiAgICAgICAgIFwibGFiZWxcIjogXCJIaXAgSG9wXCIsXG4gICAgICAgICBcImZvbGRlclwiOiBcImhpcC1ob3BcIixcbiAgICAgICAgIFwiaW5zdHJ1bWVudHNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNsb3NlZCBIaUhhdFwiLFxuICAgICAgICAgICAgICAgXCJzcmNcIjogXCJIQVRfMi5tcDNcIixcbiAgICAgICAgICAgICAgIFwiaWNvblwiOiBcImljb24taGloYXQtY2xvc2VkXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiS2ljayBEcnVtXCIsXG4gICAgICAgICAgICAgICBcInNyY1wiOiBcIktJS18yLm1wM1wiLFxuICAgICAgICAgICAgICAgXCJpY29uXCI6IFwiaWNvbi1raWNrZHJ1bVwiXG4gICAgICAgICAgICB9XG4gICAgICAgICBdXG4gICAgICB9XG5cbiAgICAgIEBraXRNb2RlbCA9IG5ldyBLaXRNb2RlbCBkYXRhLCB7IHBhcnNlOiB0cnVlIH1cblxuXG4gICBpdCAnU2hvdWxkIHBhcnNlIHRoZSBtb2RlbCBkYXRhIGFuZCBjb252ZXJ0IGluc3RydW1lbnRzIHRvIGFuIEluc3RydW1lbnRzQ29sbGVjdGlvbicsID0+XG4gICAgICBAa2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLnNob3VsZC5iZS5hbi5pbnN0YW5jZW9mIEluc3RydW1lbnRDb2xsZWN0aW9uIiwiXG5cbmRlc2NyaWJlICdTb3VuZCBDb2xsZWN0aW9uJywgLT5cblxuICAgaXQgJ1Nob3VsZCBpbml0aWFsaXplIHdpdGggYSBzb3VuZCBzZXQnLCA9PiIsIlxuXG5kZXNjcmliZSAnU291bmQgTW9kZWwnLCAtPlxuXG4gICBpdCAnU2hvdWxkIGluaXRpYWxpemUgd2l0aCBkZWZhdWx0IGNvbmZpZyBwcm9wZXJ0aWVzJywgPT4iLCJDcmVhdGVWaWV3ID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LmNvZmZlZSdcblxuXG5kZXNjcmliZSAnQ3JlYXRlIFZpZXcnLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBDcmVhdGVWaWV3XG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBleHBlY3QoQHZpZXcuZWwpLnRvLmV4aXN0IiwiQlBNSW5kaWNhdG9yID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSdcbkFwcE1vZGVsICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5BcHBFdmVudCAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuQXBwQ29uZmlnICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cbmRlc2NyaWJlICdCUE0gSW5kaWNhdG9yJywgLT5cblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBuZXcgQXBwTW9kZWwoKVxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgaWYgQHZpZXcudXBkYXRlSW50ZXJ2YWwgdGhlbiBjbGVhckludGVydmFsIEB2aWV3LnVwZGF0ZUludGVydmFsXG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuXG4gICAgICBAdmlldy5zaG91bGQuZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgZGlzcGxheSB0aGUgY3VycmVudCBCUE0gaW4gdGhlIGxhYmVsJywgPT5cblxuICAgICAgJGxhYmVsID0gQHZpZXcuJGVsLmZpbmQgJy5sYWJlbC1icG0nXG4gICAgICAkbGFiZWwudGV4dCgpLnNob3VsZC5lcXVhbCBTdHJpbmcoQHZpZXcuYXBwTW9kZWwuZ2V0KCdicG0nKSlcblxuXG5cbiAgIGl0ICdTaG91bGQgYXV0by1hZHZhbmNlIHRoZSBicG0gdmlhIHNldEludGVydmFsIG9uIHByZXNzJywgKGRvbmUpID0+XG5cbiAgICAgIEB2aWV3LmJwbUluY3JlYXNlQW1vdW50ID0gNTBcbiAgICAgIEB2aWV3LmludGVydmFsVXBkYXRlVGltZSA9IDFcbiAgICAgIGFwcE1vZGVsID0gQHZpZXcuYXBwTW9kZWxcbiAgICAgIGFwcE1vZGVsLnNldCAnYnBtJywgMVxuXG4gICAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAgICBicG0gPSBhcHBNb2RlbC5nZXQgJ2JwbSdcblxuICAgICAgICAgaWYgYnBtID49IDEyMFxuICAgICAgICAgICAgQHZpZXcub25CdG5VcCgpXG4gICAgICAgICAgICBkb25lKClcbiAgICAgICwgMTAwXG5cbiAgICAgIEB2aWV3Lm9uSW5jcmVhc2VCdG5Eb3duKClcblxuXG5cbiAgIGl0ICdTaG91bGQgY2xlYXIgdGhlIGludGVydmFsIG9uIHJlbGVhc2UnLCA9PlxuXG4gICAgICBAdmlldy5vbkluY3JlYXNlQnRuRG93bigpXG4gICAgICBAdmlldy51cGRhdGVJbnRlcnZhbC5zaG91bGQuZXhpc3RcbiAgICAgIEB2aWV3Lm9uQnRuVXAoKVxuICAgICAgZXhwZWN0KEB2aWV3LnVwZGF0ZUludGVydmFsKS50by5iZS5udWxsXG5cbiIsIktpdFNlbGVjdGlvbiAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0aW9uLmNvZmZlZSdcbkFwcE1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0TW9kZWwgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnS2l0IFNlbGVjdGlvbicsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgbW9kZWxzID0gW11cblxuICAgICAgXyg0KS50aW1lcyAoaW5kZXgpIC0+XG4gICAgICAgICBtb2RlbHMucHVzaCBuZXcgS2l0TW9kZWwge2xhYmVsOiBcImtpdCAje2luZGV4fVwifVxuXG5cbiAgICAgIEB2aWV3ID0gbmV3IEtpdFNlbGVjdGlvblxuICAgICAgICAgYXBwTW9kZWw6IG5ldyBBcHBNb2RlbCgpXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBuZXcgS2l0Q29sbGVjdGlvbiBtb2RlbHNcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cblxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cblxuXG4gICBpdCAnU2hvdWxkIGhhdmUgYSBsYWJlbCcsID0+XG5cbiAgICAgICRsYWJlbCA9IEB2aWV3LiRlbC5maW5kICcubGFiZWwta2l0J1xuICAgICAgJGxhYmVsLnRleHQgQHZpZXcua2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQgJ2xhYmVsJ1xuICAgICAgJGxhYmVsLnRleHQoKS5zaG91bGQuZXF1YWwgJ2tpdCAwJ1xuXG5cblxuXG4gICBpdCAnU2hvdWxkIHVwZGF0ZSB0aGUgQXBwTW9kZWwgYSBraXQgaXMgY2hhbmdlZCcsID0+XG5cbiAgICAgICRsYWJlbCA9IEB2aWV3LiRlbC5maW5kICcubGFiZWwta2l0J1xuICAgICAgZmlyc3RMYWJlbCA9IEB2aWV3LmtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0ICdsYWJlbCdcbiAgICAgIGxhc3RMYWJlbCAgPSBAdmlldy5raXRDb2xsZWN0aW9uLmF0KEB2aWV3LmtpdENvbGxlY3Rpb24ubGVuZ3RoLTEpLmdldCAnbGFiZWwnXG5cbiAgICAgIGFwcE1vZGVsID0gQHZpZXcuYXBwTW9kZWxcblxuICAgICAgYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpraXRNb2RlbCcpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm9uTGVmdEJ0bkNsaWNrKClcbiAgICAgICAgICRsYWJlbC50ZXh0KCkuc2hvdWxkLmVxdWFsIGxhc3RMYWJlbFxuXG4gICAgICBhcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmtpdE1vZGVsJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcub25SaWdodEJ0bkNsaWNrKClcbiAgICAgICAgICRsYWJlbC50ZXh0KCkuc2hvdWxkLmVxdWFsIGZpcnN0TGFiZWxcblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiIsIkluc3RydW1lbnQgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC5jb2ZmZWUnXG5LaXRNb2RlbCAgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnSW5zdHJ1bWVudCcsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQHZpZXcgPSBuZXcgSW5zdHJ1bWVudFxuICAgICAgICAga2l0TW9kZWw6IG5ldyBLaXRNb2RlbCgpXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCBhbGxvdyB1c2VyIHRvIHNlbGVjdCBpbnN0cnVtZW50cycsID0+XG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIGV4cGVjdChAdmlldy4kZWwuaGFzQ2xhc3MoJ3NlbGVjdGVkJykpLnRvLmJlLnRydWUiLCJJbnN0cnVtZW50U2VsZWN0aW9uUGFuZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdGlvblBhbmVsLmNvZmZlZSdcbkFwcENvbmZpZyAgICAgICAgICAgICAgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiAgICAgICAgICAgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdJbnN0cnVtZW50IFNlbGVjdGlvbiBQYW5lbCcsIC0+XG5cblxuICAgYmVmb3JlID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbCgpXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3Rpb25QYW5lbFxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy5zaG91bGQuZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVmZXIgdG8gdGhlIGN1cnJlbnQgS2l0TW9kZWwgd2hlbiBpbnN0YW50aWF0aW5nIHNvdW5kcycsID0+XG5cbiAgICAgIGV4cGVjdChAdmlldy5raXRNb2RlbCkudG8uZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgaXRlcmF0ZSBvdmVyIGFsbCBvZiB0aGUgc291bmRzIGluIHRoZSBTb3VuZENvbGxlY3Rpb24gdG8gYnVpbGQgb3V0IGluc3RydW1lbnRzJywgPT5cblxuICAgICAgQHZpZXcua2l0TW9kZWwudG9KU09OKCkuaW5zdHJ1bWVudHMubGVuZ3RoLnNob3VsZC5iZS5hYm92ZSgwKVxuXG4gICAgICAkaW5zdHJ1bWVudHMgPSBAdmlldy4kZWwuZmluZCgnLmNvbnRhaW5lci1pbnN0cnVtZW50cycpLmZpbmQoJy5pbnN0cnVtZW50JylcbiAgICAgICRpbnN0cnVtZW50cy5sZW5ndGguc2hvdWxkLmJlLmFib3ZlKDApXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlYnVpbGQgdmlldyB3aGVuIHRoZSBraXRNb2RlbCBjaGFuZ2VzJywgPT5cblxuICAgICAga2l0TW9kZWwgPSBAdmlldy5hcHBNb2RlbC5nZXQgJ2tpdE1vZGVsJ1xuICAgICAgbGVuZ3RoID0ga2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLnRvSlNPTigpLmxlbmd0aFxuXG4gICAgICAkaW5zdHJ1bWVudHMgPSBAdmlldy4kZWwuZmluZCgnLmNvbnRhaW5lci1pbnN0cnVtZW50cycpLmZpbmQoJy5pbnN0cnVtZW50JylcbiAgICAgICRpbnN0cnVtZW50cy5sZW5ndGguc2hvdWxkLmJlLmVxdWFsKGxlbmd0aClcblxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG4gICAgICBraXRNb2RlbCA9IEB2aWV3LmFwcE1vZGVsLmdldCAna2l0TW9kZWwnXG4gICAgICBsZW5ndGggPSBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykudG9KU09OKCkubGVuZ3RoXG5cbiAgICAgICRpbnN0cnVtZW50cyA9IEB2aWV3LiRlbC5maW5kKCcuY29udGFpbmVyLWluc3RydW1lbnRzJykuZmluZCgnLmluc3RydW1lbnQnKVxuICAgICAgJGluc3RydW1lbnRzLmxlbmd0aC5zaG91bGQuYmUuZXF1YWwobGVuZ3RoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIHNlbGVjdGlvbnMgZnJvbSBJbnN0cnVtZW50IGluc3RhbmNlcyBhbmQgdXBkYXRlIHRoZSBtb2RlbCcsID0+XG5cbiAgICAgIEB2aWV3LmtpdE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6Y3VycmVudEluc3RydW1lbnQnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5pbnN0cnVtZW50Vmlld3NbMF0ub25DbGljaygpXG5cbiAgICAgICAgICRzZWxlY3RlZCA9IEB2aWV3LiRlbC5maW5kKCcuY29udGFpbmVyLWluc3RydW1lbnRzJykuZmluZCgnLnNlbGVjdGVkJylcbiAgICAgICAgICRzZWxlY3RlZC5sZW5ndGguc2hvdWxkLmVxdWFsIDFcblxuXG5cbiIsIlBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnUGF0dGVybiBTcXVhcmUnLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbmV3IFBhdHRlcm5TcXVhcmVNb2RlbCgpXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCBjeWNsZSB0aHJvdWdoIHZlbG9jaXR5IHZvbHVtZXMnLCA9PlxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ3ZlbG9jaXR5Jykuc2hvdWxkLmVxdWFsIDFcbiAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygndmVsb2NpdHktbG93Jykuc2hvdWxkLmJlLnRydWVcblxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAyXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ3ZlbG9jaXR5LW1lZGl1bScpLnNob3VsZC5iZS50cnVlXG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgM1xuICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKCd2ZWxvY2l0eS1oaWdoJykuc2hvdWxkLmJlLnRydWVcblxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAwXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ3ZlbG9jaXR5LWhpZ2gnKS5zaG91bGQuYmUuZmFsc2VcblxuXG5cbiAgIGl0ICdTaG91bGQgdG9nZ2xlIG9mZicsID0+XG5cbiAgICAgIEB2aWV3LmRpc2FibGUoKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgMFxuXG5cblxuICAgaXQgJ1Nob3VsZCB0b2dnbGUgb24nLCA9PlxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcub25DbGljaygpXG5cblxuICAgICAgQHZpZXcuZGlzYWJsZSgpXG4gICAgICBAdmlldy5lbmFibGUoKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgMVxuXG5cblxuICAgaXQgJ1Nob3VsZCBzaG91bGQgZmxhc2ggd2hlbiBwbGF5aW5nJywgPT5cblxuICAgICAgQHZpZXcuZmxhc2hPbigpXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ2ZsYXNoJykuc2hvdWxkLmJlLnRydWVcbiAgICAgIEB2aWV3LmZsYXNoT2ZmKClcbiAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygnZmxhc2gnKS5zaG91bGQuYmUuZmFsc2VcbiIsIlxuQXBwQ29uZmlnID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5UcmFjayA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLmNvZmZlZSdcbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5cbmRlc2NyaWJlICdQYXR0ZXJuIFRyYWNrJywgLT5cblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAdmlldyA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgIG1vZGVsOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMClcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIG91dCBjaGlsZCBzcXVhcmVzJywgPT5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcucGF0dGVybi1zcXVhcmUnKS5sZW5ndGguc2hvdWxkLmVxdWFsIDhcblxuXG4gICBpdCAnU2hvdWxkIGxpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUgcGF0dGVybiBzcXVhcmVzJywgPT5cbiAgICAgIEB2aWV3LmNvbGxlY3Rpb24uc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTp2ZWxvY2l0eScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVWaWV3c1swXS5vbkNsaWNrKClcblxuXG4gICBpdCAnU2hvdWxkIGJlIG11dGFibGUnLCA9PlxuICAgICAgQHZpZXcubW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTptdXRlJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcubXV0ZSgpXG5cbiAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6bXV0ZScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnVubXV0ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCBhZGQgdmlzdWFsIG5vdGlmaWNhdGlvbiB0aGF0IHRyYWNrIGlzIG11dGVkJywgKGRvbmUpID0+XG4gICAgICBAdmlldy5tb2RlbC5vbmNlICdjaGFuZ2U6bXV0ZScsIChtb2RlbCkgPT5cbiAgICAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygnbXV0ZScpLnNob3VsZC5iZS50cnVlXG5cbiAgICAgIEB2aWV3Lm11dGUoKVxuXG4gICAgICBAdmlldy5tb2RlbC5vbmNlICdjaGFuZ2U6bXV0ZScsID0+XG4gICAgICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ211dGUnKS5zaG91bGQuYmUuZmFsc2VcbiAgICAgICAgIGRvbmUoKVxuXG4gICAgICBAdmlldy51bm11dGUoKVxuXG5cblxuXG4gICBpdCAnU2hvdWxkIHVwZGF0ZSBlYWNoIFBhdHRlcm5TcXVhcmUgbW9kZWwgd2hlbiB0aGUga2l0IGNoYW5nZXMnLCA9PiIsIkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwTW9kZWwgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuU2VxdWVuY2VyID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcbmhlbHBlcnMgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycydcblxuXG5kZXNjcmliZSAnU2VxdWVuY2VyJywgLT5cblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAdmlldyA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgICAgIGFwcE1vZGVsOiBuZXcgQXBwTW9kZWwoKVxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5wYXVzZSgpXG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IGVhY2ggcGF0dGVybiB0cmFjaycsID0+XG4gICAgICBAdmlldy4kZWwuZmluZCgnLnBhdHRlcm4tdHJhY2snKS5sZW5ndGguc2hvdWxkLmVxdWFsIDZcblxuXG5cbiAgIGl0ICdTaG91bGQgY3JlYXRlIGEgYnBtIGludGVydmFsJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5icG1JbnRlcnZhbCkudG8ubm90LmJlIG51bGxcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBwbGF5IC8gcGF1c2UgY2hhbmdlcyBvbiB0aGUgQXBwTW9kZWwnLCA9PlxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpwbGF5aW5nJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcucGF1c2UoKVxuXG4gICAgICBAdmlldy5hcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOnBsYXlpbmcnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5wbGF5KClcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBicG0gY2hhbmdlcycsID0+XG4gICAgICBAdmlldy5hcHBNb2RlbC5zZXQoJ2JwbScsIDIwMClcbiAgICAgIGV4cGVjdChAdmlldy51cGRhdGVJbnRlcnZhbFRpbWUpLnRvLmVxdWFsIDIwMFxuXG5cblxuICAgaXQgJ1Nob3VsZCBiZSBtdXRhYmxlJywgPT5cbiAgICAgIEB2aWV3LmFwcE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6bXV0ZScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm11dGUoKVxuXG4gICAgICBAdmlldy5hcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOm11dGUnKS53aGVuID0+XG4gICAgICAgICBAdmlldy51bm11dGUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCB1cGRhdGUgZWFjaCBwYXR0ZXJuIHRyYWNrIHdoZW4gdGhlIGtpdCBjaGFuZ2VzJywgPT4iLCJBcHBDb250cm9sbGVyID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL0FwcENvbnRyb2xsZXIuY29mZmVlJ1xuTGFuZGluZ1ZpZXcgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSdcblxuZGVzY3JpYmUgJ0xhbmRpbmcgVmlldycsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IExhbmRpbmdWaWV3XG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuICAgICAgaWYgQGFwcENvbnRyb2xsZXIgdGhlbiBAYXBwQ29udHJvbGxlci5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgZXhwZWN0KEB2aWV3LmVsKS50by5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCByZWRpcmVjdCB0byBjcmVhdGUgcGFnZSBvbiBjbGljaycsIChkb25lKSA9PlxuXG4gICAgICBAYXBwQ29udHJvbGxlciA9IG5ldyBBcHBDb250cm9sbGVyKClcbiAgICAgIHJvdXRlciA9IEBhcHBDb250cm9sbGVyLmFwcFJvdXRlclxuICAgICAgJHN0YXJ0QnRuID0gQHZpZXcuJGVsLmZpbmQgJy5zdGFydC1idG4nXG5cbiAgICAgICRzdGFydEJ0bi5vbiAnY2xpY2snLCAoZXZlbnQpID0+XG4gICAgICAgICAnY3JlYXRlJy5zaG91bGQucm91dGUudG8gcm91dGVyLCAnY3JlYXRlUm91dGUnXG4gICAgICAgICBkb25lKClcblxuICAgICAgJHN0YXJ0QnRuLmNsaWNrKClcblxuXG5cblxuXG5cblxuXG4iLCJTaGFyZVZpZXcgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSdcblxuXG5kZXNjcmliZSAnU2hhcmUgVmlldycsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IFNoYXJlVmlld1xuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgZXhwZWN0KEB2aWV3LmVsKS50by5leGlzdFxuXG5cbiAgIGl0ICdTaG91bGQgYWNjZXB0IGEgU291bmRTaGFyZSBvYmplY3QnLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIHRoZSB2aXN1YWxpemF0aW9uIGxheWVyJywgPT5cblxuXG4gICBpdCAnU2hvdWxkIHBhdXNlIHBsYXliYWNrIG9mIHRoZSBhdWRpbyB0cmFjayBvbiBpbml0JywgPT5cblxuXG4gICBpdCAnU2hvdWxkIHRvZ2dsZSB0aGUgcGxheSAvIHBhdXNlIGJ1dHRvbicsID0+XG5cblxuICAgaXQgJ1Nob3VsZCBkaXNwbGF5IHRoZSB1c2VycyBzb25nIHRpdGxlIGFuZCB1c2VybmFtZScsID0+XG4iXX0=

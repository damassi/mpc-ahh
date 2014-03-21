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


},{"./models/AppModel.coffee":12,"./routers/AppRouter.coffee":19,"./supers/View.coffee":20,"./views/create/CreateView.coffee":23,"./views/landing/LandingView.coffee":39,"./views/share/ShareView.coffee":41}],7:[function(require,module,exports){

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


},{"./AppController.coffee":6,"./config/AppConfig.coffee":7,"./helpers/handlebars-helpers":10,"./models/kits/KitCollection.coffee":13,"./utils/Touch":22}],12:[function(require,module,exports){

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
      return instrument.src = response.path + '/' + instrument.src;
    });
    response.instruments = new InstrumentCollection(response.instruments);
    return response;
  };

  return KitModel;

})(Backbone.Model);

module.exports = KitModel;


},{"../sequencer/InstrumentCollection.coffee":15}],15:[function(require,module,exports){

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


},{"./InstrumentModel.coffee":16}],16:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7}],17:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../sequencer/InstrumentModel.coffee":16,"./PatternSquareModel.coffee":18}],18:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../../events/AppEvent.coffee":8}],19:[function(require,module,exports){

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


},{"../config/AppConfig.coffee":7,"../events/PubEvent.coffee":9,"../models/kits/KitCollection.coffee":13,"../models/kits/KitModel.coffee":14,"../models/sequencer/PatternSquareCollection.coffee":17,"../models/sequencer/PatternSquareModel.coffee":18,"../supers/View.coffee":20,"../utils/PubSub":21,"../views/create/components/BPMIndicator.coffee":24,"../views/create/components/KitSelector.coffee":25,"../views/create/components/instruments/InstrumentSelectorPanel.coffee":27,"../views/create/components/sequencer/PatternSquare.coffee":30,"../views/create/components/sequencer/PatternTrack.coffee":31,"../views/create/components/sequencer/Sequencer.coffee":32,"../views/tests/TestsView.coffee":43}],20:[function(require,module,exports){

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


},{}],21:[function(require,module,exports){
/**
 * @module     PubSub
 * @desc       Global PubSub object for dispatch and delegation
 */

'use strict'

var PubSub = {}

_.extend( PubSub, Backbone.Events )

module.exports = PubSub
},{}],22:[function(require,module,exports){
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
},{}],23:[function(require,module,exports){

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


},{"../../supers/View.coffee":20,"../../views/create/components/BPMIndicator.coffee":24,"../../views/create/components/KitSelector.coffee":25,"../../views/create/components/instruments/InstrumentSelectorPanel.coffee":27,"../../views/create/components/sequencer/Sequencer.coffee":32,"./templates/create-template.hbs":38}],24:[function(require,module,exports){

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


},{"../../../config/AppConfig.coffee":7,"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":20,"./templates/bpm-template.hbs":36}],25:[function(require,module,exports){

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


},{"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":20,"./templates/kit-selection-template.hbs":37}],26:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":20,"./templates/instrument-template.hbs":29}],27:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":20,"./Instrument.coffee":26,"./templates/instrument-panel-template.hbs":28}],28:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='container-instruments'>\n\n</div>";
  })
},{"handleify":5}],29:[function(require,module,exports){
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
},{"handleify":5}],30:[function(require,module,exports){

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


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":20,"./templates/pattern-square-template.hbs":33}],31:[function(require,module,exports){

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
    return this.model.set('focus', !this.model.get('focus'));
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


},{"../../../../events/AppEvent.coffee":8,"../../../../models/sequencer/PatternSquareCollection.coffee":17,"../../../../models/sequencer/PatternSquareModel.coffee":18,"../../../../supers/View.coffee":20,"./PatternSquare.coffee":30,"./templates/pattern-track-template.hbs":34}],32:[function(require,module,exports){

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

  Sequencer.prototype.soundArray = null;

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
    return this.listenTo(this.collection, AppEvent.CHANGE_FOCUS, this.onChangeFocus);
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
    return this.collection.each((function(_this) {
      return function(instrument) {
        return instrument.get('patternSquares').each(function(patternSquare, index) {
          if (_this.currBeatCellId === index) {
            if (patternSquare.get('active')) {
              return patternSquare.set('trigger', true);
            }
          }
        });
      };
    })(this));
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
    this.collection = model.changed.kitModel.get('instruments');
    return this.renderTracks();
  };

  Sequencer.prototype.onFocusChange = function(model) {
    return console.log(model.changed.focus);
  };

  return Sequencer;

})(View);

module.exports = Sequencer;


},{"../../../../events/AppEvent.coffee":8,"../../../../helpers/handlebars-helpers":10,"../../../../supers/View.coffee":20,"./PatternTrack.coffee":31,"./templates/sequencer-template.hbs":35}],33:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })
},{"handleify":5}],34:[function(require,module,exports){
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
},{"handleify":5}],35:[function(require,module,exports){
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
},{"handleify":5}],36:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-decrease'>DECREASE</button>\n<span class='label-bpm'>0</span>\n<button class='btn-increase'>INCREASE</button>";
  })
},{"handleify":5}],37:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-left'>LEFT</button>\n<span class='label-kit'>DRUM KIT</span>\n<button class='btn-right'>RIGHT</button>";
  })
},{"handleify":5}],38:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='container-kit-selector'>\n	<div class='kit-selector'></div>\n</div>\n<div class='container-visualization'>Visualization</div>\n\n<div class='container-sequencer'>\n\n	<div class='instrument-selector'>Instrument Selector</div>\n	<div class='sequencer'>Sequencer</div>\n	<div class='bpm'>BPM</div>\n	<div class='btn-share'>SHARE</div>\n\n</div>";
  })
},{"handleify":5}],39:[function(require,module,exports){

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


},{"../../events/PubEvent.coffee":9,"../../supers/View.coffee":20,"../../utils/PubSub":21,"./templates/landing-template.hbs":40}],40:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<span class='start-btn'>CREATE</span>";
  })
},{"handleify":5}],41:[function(require,module,exports){

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


},{"../../supers/View.coffee":20,"./templates/share-template.hbs":42}],42:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<a href='/#'>NEW</a>";
  })
},{"handleify":5}],43:[function(require,module,exports){

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


},{"../../supers/View.coffee":20,"./tests-template.hbs":44}],44:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h1>Component Viewer</h1>\n\n<br />\n<p>\n	Make sure that <b>httpster</b> is running in the <b>source</b> route (npm install -g httpster) <br/>\n	<a href=\"http://localhost:3333/test/html/\">Mocha Test Runner</a>\n</p>\n\n<br />\n<ul>\n	<li><a href='#kit-selection'>Kit Selection</a></li>\n	<li><a href=\"#bpm-indicator\">BPM Indicator</a></li>\n	<li><a href=\"#instrument-selector\">Instrument Selector</a></li>\n	<li><a href=\"#pattern-square\">Pattern Square</a></li>\n	<li><a href=\"#pattern-track\">Pattern Track</a></li>\n	<li><a href=\"#sequencer\">Sequencer</a></li>\n	<li><a href=\"#full-sequencer\">Full Sequencer</a></li>\n</ul>";
  })
},{"handleify":5}]},{},[11])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2RpZ2l0cy9pbmRleC5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L3J1bnRpbWUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2luaXRpYWxpemUuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3JvdXRlcnMvQXBwUm91dGVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3N1cGVycy9WaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3V0aWxzL1B1YlN1Yi5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3V0aWxzL1RvdWNoLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvdGVtcGxhdGVzL2luc3RydW1lbnQtcGFuZWwtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvdGVtcGxhdGVzL2luc3RydW1lbnQtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci90ZW1wbGF0ZXMvcGF0dGVybi1zcXVhcmUtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9wYXR0ZXJuLXRyYWNrLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci90ZW1wbGF0ZXMvc2VxdWVuY2VyLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3RlbXBsYXRlcy9icG0tdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvdGVtcGxhdGVzL2tpdC1zZWxlY3Rpb24tdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL3RlbXBsYXRlcy9jcmVhdGUtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL3RlbXBsYXRlcy9sYW5kaW5nLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9zaGFyZS90ZW1wbGF0ZXMvc2hhcmUtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvdGVzdHMvVGVzdHNWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3Rlc3RzL3Rlc3RzLXRlbXBsYXRlLmhicyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTs7QUNGQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSw0RUFBQTtFQUFBO2lTQUFBOztBQUFBLFFBUUEsR0FBYyxPQUFBLENBQVEsMEJBQVIsQ0FSZCxDQUFBOztBQUFBLFNBU0EsR0FBYyxPQUFBLENBQVEsNEJBQVIsQ0FUZCxDQUFBOztBQUFBLFdBVUEsR0FBYyxPQUFBLENBQVEsb0NBQVIsQ0FWZCxDQUFBOztBQUFBLFVBV0EsR0FBYyxPQUFB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U0FBQTs7QUFBQSxJQU9BLEdBQVcsT0FBQSxDQUFRLDBCQUFSLENBUFgsQ0FBQTs7QUFBQSxRQVFBLEdBQVcsT0FBQSxDQUFRLGdDQUFSLENBUlgsQ0FBQTs7QUFBQTtBQWFHLDhCQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSxzQkFBQSxRQUFBLEdBQVUsUUFBVixDQUFBOzttQkFBQTs7R0FGcUIsS0FYeEIsQ0FBQTs7QUFBQSxNQWlCTSxDQUFDLE9BQVAsR0FBaUIsU0FqQmpCLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLHlCQUFBO0VBQUE7aVNBQUE7O0FBQUEsSUFPQSxHQUFXLE9BQUEsQ0FBUSwwQkFBUixDQVBYLENBQUE7O0FBQUEsUUFRQSxHQUFXLE9BQUEsQ0FBUSxzQkFBUixDQVJYLENBQUE7O0FBQUE7QUFhRyw4QkFBQSxDQUFBOzs7O0dBQUE7O0FBQUEsc0JBQUEsUUFBQSxHQUFVLFFBQVYsQ0FBQTs7bUJBQUE7O0dBRnFCLEtBWHhCLENBQUE7O0FBQUEsTUFnQk0sQ0FBQyxPQUFQLEdBQWlCLFNBaEJqQixDQUFBOzs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBkaWdpdHNcbiAqIENvcHlyaWdodCAoYykgMjAxMyBKb24gU2NobGlua2VydFxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFBhZCBudW1iZXJzIHdpdGggemVyb3MuXG4gKiBBdXRvbWF0aWNhbGx5IHBhZCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBiYXNlZCBvbiB0aGUgbGVuZ3RoIG9mIHRoZSBhcnJheSxcbiAqIG9yIGV4cGxpY2l0bHkgcGFzcyBpbiB0aGUgbnVtYmVyIG9mIGRpZ2l0cyB0byB1c2UuXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBudW0gIFRoZSBudW1iZXIgdG8gcGFkLlxuICogQHBhcmFtICB7T2JqZWN0fSBvcHRzIE9wdGlvbnMgb2JqZWN0IHdpdGggYGRpZ2l0c2AgYW5kIGBhdXRvYCBwcm9wZXJ0aWVzLlxuICogICAge1xuICogICAgICBhdXRvOiBhcnJheS5sZW5ndGggLy8gcGFzcyBpbiB0aGUgbGVuZ3RoIG9mIHRoZSBhcnJheVxuICogICAgICBkaWdpdHM6IDQgICAgICAgICAgLy8gb3IgcGFzcyBpbiB0aGUgbnVtYmVyIG9mIGRpZ2l0cyB0byB1c2VcbiAqICAgIH1cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICBUaGUgcGFkZGVkIG51bWJlciB3aXRoIHplcm9zIHByZXBlbmRlZFxuICpcbiAqIEBleGFtcGxlczpcbiAqICAxICAgICAgPT4gMDAwMDAxXG4gKiAgMTAgICAgID0+IDAwMDAxMFxuICogIDEwMCAgICA9PiAwMDAxMDBcbiAqICAxMDAwICAgPT4gMDAxMDAwXG4gKiAgMTAwMDAgID0+IDAxMDAwMFxuICogIDEwMDAwMCA9PiAxMDAwMDBcbiAqL1xuXG5leHBvcnRzLnBhZCA9IGZ1bmN0aW9uIChudW0sIG9wdHMpIHtcbiAgdmFyIGRpZ2l0cyA9IG9wdHMuZGlnaXRzIHx8IDM7XG4gIGlmKG9wdHMuYXV0byAmJiB0eXBlb2Ygb3B0cy5hdXRvID09PSAnbnVtYmVyJykge1xuICAgIGRpZ2l0cyA9IFN0cmluZyhvcHRzLmF1dG8pLmxlbmd0aDtcbiAgfVxuICB2YXIgbGVuRGlmZiA9IGRpZ2l0cyAtIFN0cmluZyhudW0pLmxlbmd0aDtcbiAgdmFyIHBhZGRpbmcgPSAnJztcbiAgaWYgKGxlbkRpZmYgPiAwKSB7XG4gICAgd2hpbGUgKGxlbkRpZmYtLSkge1xuICAgICAgcGFkZGluZyArPSAnMCc7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYWRkaW5nICsgbnVtO1xufTtcblxuLyoqXG4gKiBTdHJpcCBsZWFkaW5nIGRpZ2l0cyBmcm9tIGEgc3RyaW5nXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIGZyb20gd2hpY2ggdG8gc3RyaXAgZGlnaXRzXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBUaGUgbW9kaWZpZWQgc3RyaW5nXG4gKi9cblxuZXhwb3J0cy5zdHJpcGxlZnQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxkK1xcLT8vZywgJycpO1xufTtcblxuLyoqXG4gKiBTdHJpcCB0cmFpbGluZyBkaWdpdHMgZnJvbSBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyBmcm9tIHdoaWNoIHRvIHN0cmlwIGRpZ2l0c1xuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICovXG5cbmV4cG9ydHMuc3RyaXByaWdodCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xcLT9cXGQrJC9nLCAnJyk7XG59O1xuXG4vKipcbiAqIENvdW50IGRpZ2l0cyBvbiB0aGUgbGVmdCBzaWRlIG9mIGEgc3RyaW5nXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIHdpdGggZGlnaXRzIHRvIGNvdW50XG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBUaGUgbW9kaWZpZWQgc3RyaW5nXG4gKiBAZXhhbXBsZVxuICogIFwiMDAxLWZvby5tZFwiID0+IDNcbiAqL1xuXG5leHBvcnRzLmNvdW50bGVmdCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gU3RyaW5nKHN0ci5tYXRjaCgvXlxcZCsvZykpLmxlbmd0aDtcbn07XG5cbi8qKlxuICogQ291bnQgZGlnaXRzIG9uIHRoZSByaWdodCBzaWRlIG9mIGEgc3RyaW5nXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIHdpdGggZGlnaXRzIHRvIGNvdW50XG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBUaGUgbW9kaWZpZWQgc3RyaW5nXG4gKiBAZXhhbXBsZVxuICogIFwiMDAxLWZvby5tZFwiID0+IDNcbiAqL1xuXG5leHBvcnRzLmNvdW50cmlnaHQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIFN0cmluZyhzdHIubWF0Y2goL1xcZCskL2cpKS5sZW5ndGg7XG59OyIsIi8qanNoaW50IGVxbnVsbDogdHJ1ZSAqL1xuXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGUgPSBmdW5jdGlvbigpIHtcblxudmFyIEhhbmRsZWJhcnMgPSB7fTtcblxuLy8gQkVHSU4oQlJPV1NFUilcblxuSGFuZGxlYmFycy5WRVJTSU9OID0gXCIxLjAuMFwiO1xuSGFuZGxlYmFycy5DT01QSUxFUl9SRVZJU0lPTiA9IDQ7XG5cbkhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFUyA9IHtcbiAgMTogJzw9IDEuMC5yYy4yJywgLy8gMS4wLnJjLjIgaXMgYWN0dWFsbHkgcmV2MiBidXQgZG9lc24ndCByZXBvcnQgaXRcbiAgMjogJz09IDEuMC4wLXJjLjMnLFxuICAzOiAnPT0gMS4wLjAtcmMuNCcsXG4gIDQ6ICc+PSAxLjAuMCdcbn07XG5cbkhhbmRsZWJhcnMuaGVscGVycyAgPSB7fTtcbkhhbmRsZWJhcnMucGFydGlhbHMgPSB7fTtcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyxcbiAgICBmdW5jdGlvblR5cGUgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIG9iamVjdFR5cGUgPSAnW29iamVjdCBPYmplY3RdJztcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciA9IGZ1bmN0aW9uKG5hbWUsIGZuLCBpbnZlcnNlKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgaWYgKGludmVyc2UgfHwgZm4pIHsgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTsgfVxuICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHRoaXMuaGVscGVycywgbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGludmVyc2UpIHsgZm4ubm90ID0gaW52ZXJzZTsgfVxuICAgIHRoaXMuaGVscGVyc1tuYW1lXSA9IGZuO1xuICB9XG59O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCA9IGZ1bmN0aW9uKG5hbWUsIHN0cikge1xuICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHRoaXMucGFydGlhbHMsICBuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnBhcnRpYWxzW25hbWVdID0gc3RyO1xuICB9XG59O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdoZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oYXJnKSB7XG4gIGlmKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk1pc3NpbmcgaGVscGVyOiAnXCIgKyBhcmcgKyBcIidcIik7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlIHx8IGZ1bmN0aW9uKCkge30sIGZuID0gb3B0aW9ucy5mbjtcblxuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG5cbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZihjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuKHRoaXMpO1xuICB9IGVsc2UgaWYoY29udGV4dCA9PT0gZmFsc2UgfHwgY29udGV4dCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gIH0gZWxzZSBpZih0eXBlID09PSBcIltvYmplY3QgQXJyYXldXCIpIHtcbiAgICBpZihjb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBIYW5kbGViYXJzLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmbihjb250ZXh0KTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMuSyA9IGZ1bmN0aW9uKCkge307XG5cbkhhbmRsZWJhcnMuY3JlYXRlRnJhbWUgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uKG9iamVjdCkge1xuICBIYW5kbGViYXJzLksucHJvdG90eXBlID0gb2JqZWN0O1xuICB2YXIgb2JqID0gbmV3IEhhbmRsZWJhcnMuSygpO1xuICBIYW5kbGViYXJzLksucHJvdG90eXBlID0gbnVsbDtcbiAgcmV0dXJuIG9iajtcbn07XG5cbkhhbmRsZWJhcnMubG9nZ2VyID0ge1xuICBERUJVRzogMCwgSU5GTzogMSwgV0FSTjogMiwgRVJST1I6IDMsIGxldmVsOiAzLFxuXG4gIG1ldGhvZE1hcDogezA6ICdkZWJ1ZycsIDE6ICdpbmZvJywgMjogJ3dhcm4nLCAzOiAnZXJyb3InfSxcblxuICAvLyBjYW4gYmUgb3ZlcnJpZGRlbiBpbiB0aGUgaG9zdCBlbnZpcm9ubWVudFxuICBsb2c6IGZ1bmN0aW9uKGxldmVsLCBvYmopIHtcbiAgICBpZiAoSGFuZGxlYmFycy5sb2dnZXIubGV2ZWwgPD0gbGV2ZWwpIHtcbiAgICAgIHZhciBtZXRob2QgPSBIYW5kbGViYXJzLmxvZ2dlci5tZXRob2RNYXBbbGV2ZWxdO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlW21ldGhvZF0pIHtcbiAgICAgICAgY29uc29sZVttZXRob2RdLmNhbGwoY29uc29sZSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMubG9nID0gZnVuY3Rpb24obGV2ZWwsIG9iaikgeyBIYW5kbGViYXJzLmxvZ2dlci5sb2cobGV2ZWwsIG9iaik7IH07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBmbiA9IG9wdGlvbnMuZm4sIGludmVyc2UgPSBvcHRpb25zLmludmVyc2U7XG4gIHZhciBpID0gMCwgcmV0ID0gXCJcIiwgZGF0YTtcblxuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYgKG9wdGlvbnMuZGF0YSkge1xuICAgIGRhdGEgPSBIYW5kbGViYXJzLmNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gIH1cblxuICBpZihjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0ID09PSAnb2JqZWN0Jykge1xuICAgIGlmKGNvbnRleHQgaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICBmb3IodmFyIGogPSBjb250ZXh0Lmxlbmd0aDsgaTxqOyBpKyspIHtcbiAgICAgICAgaWYgKGRhdGEpIHsgZGF0YS5pbmRleCA9IGk7IH1cbiAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtpXSwgeyBkYXRhOiBkYXRhIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IodmFyIGtleSBpbiBjb250ZXh0KSB7XG4gICAgICAgIGlmKGNvbnRleHQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIGlmKGRhdGEpIHsgZGF0YS5rZXkgPSBrZXk7IH1cbiAgICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2tleV0sIHtkYXRhOiBkYXRhfSk7XG4gICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYoaSA9PT0gMCl7XG4gICAgcmV0ID0gaW52ZXJzZSh0aGlzKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29uZGl0aW9uYWwpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29uZGl0aW9uYWwgPSBjb25kaXRpb25hbC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYoIWNvbmRpdGlvbmFsIHx8IEhhbmRsZWJhcnMuVXRpbHMuaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcigndW5sZXNzJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIEhhbmRsZWJhcnMuaGVscGVyc1snaWYnXS5jYWxsKHRoaXMsIGNvbmRpdGlvbmFsLCB7Zm46IG9wdGlvbnMuaW52ZXJzZSwgaW52ZXJzZTogb3B0aW9ucy5mbn0pO1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3dpdGgnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZiAoIUhhbmRsZWJhcnMuVXRpbHMuaXNFbXB0eShjb250ZXh0KSkgcmV0dXJuIG9wdGlvbnMuZm4oY29udGV4dCk7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgbGV2ZWwgPSBvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmxldmVsICE9IG51bGwgPyBwYXJzZUludChvcHRpb25zLmRhdGEubGV2ZWwsIDEwKSA6IDE7XG4gIEhhbmRsZWJhcnMubG9nKGxldmVsLCBjb250ZXh0KTtcbn0pO1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG59O1xuIiwiZXhwb3J0cy5hdHRhY2ggPSBmdW5jdGlvbihIYW5kbGViYXJzKSB7XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbkhhbmRsZWJhcnMuVk0gPSB7XG4gIHRlbXBsYXRlOiBmdW5jdGlvbih0ZW1wbGF0ZVNwZWMpIHtcbiAgICAvLyBKdXN0IGFkZCB3YXRlclxuICAgIHZhciBjb250YWluZXIgPSB7XG4gICAgICBlc2NhcGVFeHByZXNzaW9uOiBIYW5kbGViYXJzLlV0aWxzLmVzY2FwZUV4cHJlc3Npb24sXG4gICAgICBpbnZva2VQYXJ0aWFsOiBIYW5kbGViYXJzLlZNLmludm9rZVBhcnRpYWwsXG4gICAgICBwcm9ncmFtczogW10sXG4gICAgICBwcm9ncmFtOiBmdW5jdGlvbihpLCBmbiwgZGF0YSkge1xuICAgICAgICB2YXIgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldO1xuICAgICAgICBpZihkYXRhKSB7XG4gICAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSBIYW5kbGViYXJzLlZNLnByb2dyYW0oaSwgZm4sIGRhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKCFwcm9ncmFtV3JhcHBlcikge1xuICAgICAgICAgIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSA9IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbShpLCBmbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgICAgfSxcbiAgICAgIG1lcmdlOiBmdW5jdGlvbihwYXJhbSwgY29tbW9uKSB7XG4gICAgICAgIHZhciByZXQgPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgICAgaWYgKHBhcmFtICYmIGNvbW1vbikge1xuICAgICAgICAgIHJldCA9IHt9O1xuICAgICAgICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHJldCwgY29tbW9uKTtcbiAgICAgICAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZChyZXQsIHBhcmFtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfSxcbiAgICAgIHByb2dyYW1XaXRoRGVwdGg6IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbVdpdGhEZXB0aCxcbiAgICAgIG5vb3A6IEhhbmRsZWJhcnMuVk0ubm9vcCxcbiAgICAgIGNvbXBpbGVySW5mbzogbnVsbFxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICB2YXIgcmVzdWx0ID0gdGVtcGxhdGVTcGVjLmNhbGwoY29udGFpbmVyLCBIYW5kbGViYXJzLCBjb250ZXh0LCBvcHRpb25zLmhlbHBlcnMsIG9wdGlvbnMucGFydGlhbHMsIG9wdGlvbnMuZGF0YSk7XG5cbiAgICAgIHZhciBjb21waWxlckluZm8gPSBjb250YWluZXIuY29tcGlsZXJJbmZvIHx8IFtdLFxuICAgICAgICAgIGNvbXBpbGVyUmV2aXNpb24gPSBjb21waWxlckluZm9bMF0gfHwgMSxcbiAgICAgICAgICBjdXJyZW50UmV2aXNpb24gPSBIYW5kbGViYXJzLkNPTVBJTEVSX1JFVklTSU9OO1xuXG4gICAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiAhPT0gY3VycmVudFJldmlzaW9uKSB7XG4gICAgICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICAgICAgdmFyIHJ1bnRpbWVWZXJzaW9ucyA9IEhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgICAgICBjb21waWxlclZlcnNpb25zID0gSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgICAgIHRocm93IFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYW4gb2xkZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gXCIrXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcHJlY29tcGlsZXIgdG8gYSBuZXdlciB2ZXJzaW9uIChcIitydW50aW1lVmVyc2lvbnMrXCIpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJWZXJzaW9ucytcIikuXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICAgICAgdGhyb3cgXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhIG5ld2VyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHJ1bnRpbWUgdG8gYSBuZXdlciB2ZXJzaW9uIChcIitjb21waWxlckluZm9bMV0rXCIpLlwiO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfSxcblxuICBwcm9ncmFtV2l0aERlcHRoOiBmdW5jdGlvbihpLCBmbiwgZGF0YSAvKiwgJGRlcHRoICovKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDMpO1xuXG4gICAgdmFyIHByb2dyYW0gPSBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIFtjb250ZXh0LCBvcHRpb25zLmRhdGEgfHwgZGF0YV0uY29uY2F0KGFyZ3MpKTtcbiAgICB9O1xuICAgIHByb2dyYW0ucHJvZ3JhbSA9IGk7XG4gICAgcHJvZ3JhbS5kZXB0aCA9IGFyZ3MubGVuZ3RoO1xuICAgIHJldHVybiBwcm9ncmFtO1xuICB9LFxuICBwcm9ncmFtOiBmdW5jdGlvbihpLCBmbiwgZGF0YSkge1xuICAgIHZhciBwcm9ncmFtID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zLmRhdGEgfHwgZGF0YSk7XG4gICAgfTtcbiAgICBwcm9ncmFtLnByb2dyYW0gPSBpO1xuICAgIHByb2dyYW0uZGVwdGggPSAwO1xuICAgIHJldHVybiBwcm9ncmFtO1xuICB9LFxuICBub29wOiBmdW5jdGlvbigpIHsgcmV0dXJuIFwiXCI7IH0sXG4gIGludm9rZVBhcnRpYWw6IGZ1bmN0aW9uKHBhcnRpYWwsIG5hbWUsIGNvbnRleHQsIGhlbHBlcnMsIHBhcnRpYWxzLCBkYXRhKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB7IGhlbHBlcnM6IGhlbHBlcnMsIHBhcnRpYWxzOiBwYXJ0aWFscywgZGF0YTogZGF0YSB9O1xuXG4gICAgaWYocGFydGlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oXCJUaGUgcGFydGlhbCBcIiArIG5hbWUgKyBcIiBjb3VsZCBub3QgYmUgZm91bmRcIik7XG4gICAgfSBlbHNlIGlmKHBhcnRpYWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgcmV0dXJuIHBhcnRpYWwoY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIGlmICghSGFuZGxlYmFycy5jb21waWxlKSB7XG4gICAgICB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oXCJUaGUgcGFydGlhbCBcIiArIG5hbWUgKyBcIiBjb3VsZCBub3QgYmUgY29tcGlsZWQgd2hlbiBydW5uaW5nIGluIHJ1bnRpbWUtb25seSBtb2RlXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0aWFsc1tuYW1lXSA9IEhhbmRsZWJhcnMuY29tcGlsZShwYXJ0aWFsLCB7ZGF0YTogZGF0YSAhPT0gdW5kZWZpbmVkfSk7XG4gICAgICByZXR1cm4gcGFydGlhbHNbbmFtZV0oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICB9XG59O1xuXG5IYW5kbGViYXJzLnRlbXBsYXRlID0gSGFuZGxlYmFycy5WTS50ZW1wbGF0ZTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xuXG59O1xuIiwiZXhwb3J0cy5hdHRhY2ggPSBmdW5jdGlvbihIYW5kbGViYXJzKSB7XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbnZhciBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuSGFuZGxlYmFycy5FeGNlcHRpb24gPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gIHZhciB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cbn07XG5IYW5kbGViYXJzLkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbkhhbmRsZWJhcnMuU2FmZVN0cmluZyA9IGZ1bmN0aW9uKHN0cmluZykge1xuICB0aGlzLnN0cmluZyA9IHN0cmluZztcbn07XG5IYW5kbGViYXJzLlNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0cmluZy50b1N0cmluZygpO1xufTtcblxudmFyIGVzY2FwZSA9IHtcbiAgXCImXCI6IFwiJmFtcDtcIixcbiAgXCI8XCI6IFwiJmx0O1wiLFxuICBcIj5cIjogXCImZ3Q7XCIsXG4gICdcIic6IFwiJnF1b3Q7XCIsXG4gIFwiJ1wiOiBcIiYjeDI3O1wiLFxuICBcImBcIjogXCImI3g2MDtcIlxufTtcblxudmFyIGJhZENoYXJzID0gL1smPD5cIidgXS9nO1xudmFyIHBvc3NpYmxlID0gL1smPD5cIidgXS87XG5cbnZhciBlc2NhcGVDaGFyID0gZnVuY3Rpb24oY2hyKSB7XG4gIHJldHVybiBlc2NhcGVbY2hyXSB8fCBcIiZhbXA7XCI7XG59O1xuXG5IYW5kbGViYXJzLlV0aWxzID0ge1xuICBleHRlbmQ6IGZ1bmN0aW9uKG9iaiwgdmFsdWUpIHtcbiAgICBmb3IodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgICAgaWYodmFsdWUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IHZhbHVlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGVzY2FwZUV4cHJlc3Npb246IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIC8vIGRvbid0IGVzY2FwZSBTYWZlU3RyaW5ncywgc2luY2UgdGhleSdyZSBhbHJlYWR5IHNhZmVcbiAgICBpZiAoc3RyaW5nIGluc3RhbmNlb2YgSGFuZGxlYmFycy5TYWZlU3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLnRvU3RyaW5nKCk7XG4gICAgfSBlbHNlIGlmIChzdHJpbmcgPT0gbnVsbCB8fCBzdHJpbmcgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG5cbiAgICAvLyBGb3JjZSBhIHN0cmluZyBjb252ZXJzaW9uIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IHRoZSBhcHBlbmQgcmVnYXJkbGVzcyBhbmRcbiAgICAvLyB0aGUgcmVnZXggdGVzdCB3aWxsIGRvIHRoaXMgdHJhbnNwYXJlbnRseSBiZWhpbmQgdGhlIHNjZW5lcywgY2F1c2luZyBpc3N1ZXMgaWZcbiAgICAvLyBhbiBvYmplY3QncyB0byBzdHJpbmcgaGFzIGVzY2FwZWQgY2hhcmFjdGVycyBpbiBpdC5cbiAgICBzdHJpbmcgPSBzdHJpbmcudG9TdHJpbmcoKTtcblxuICAgIGlmKCFwb3NzaWJsZS50ZXN0KHN0cmluZykpIHsgcmV0dXJuIHN0cmluZzsgfVxuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShiYWRDaGFycywgZXNjYXBlQ2hhcik7XG4gIH0sXG5cbiAgaXNFbXB0eTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYodG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09IFwiW29iamVjdCBBcnJheV1cIiAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59O1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gcmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9iYXNlLmpzJykuY3JlYXRlKClcbnJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMnKS5hdHRhY2goZXhwb3J0cylcbnJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcycpLmF0dGFjaChleHBvcnRzKSIsIiMjIypcbiAqIFByaW1hcnkgYXBwbGljYXRpb24gY29udHJvbGxlclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblxuQXBwTW9kZWwgICAgPSByZXF1aXJlICcuL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5BcHBSb3V0ZXIgICA9IHJlcXVpcmUgJy4vcm91dGVycy9BcHBSb3V0ZXIuY29mZmVlJ1xuTGFuZGluZ1ZpZXcgPSByZXF1aXJlICcuL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXcuY29mZmVlJ1xuQ3JlYXRlVmlldyAgPSByZXF1aXJlICcuL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LmNvZmZlZSdcblNoYXJlVmlldyAgID0gcmVxdWlyZSAnLi92aWV3cy9zaGFyZS9TaGFyZVZpZXcuY29mZmVlJ1xuVmlldyAgICAgICAgPSByZXF1aXJlICcuL3N1cGVycy9WaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBBcHBDb250cm9sbGVyIGV4dGVuZHMgVmlld1xuXG5cbiAgIGNsYXNzTmFtZTogJ3dyYXBwZXInXG5cblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAbGFuZGluZ1ZpZXcgPSBuZXcgTGFuZGluZ1ZpZXdcbiAgICAgIEBzaGFyZVZpZXcgICA9IG5ldyBTaGFyZVZpZXdcblxuICAgICAgQGNyZWF0ZVZpZXcgID0gbmV3IENyZWF0ZVZpZXdcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIEBhcHBSb3V0ZXIgPSBuZXcgQXBwUm91dGVyXG4gICAgICAgICBhcHBDb250cm9sbGVyOiBAXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgQXBwQ29udHJvbGxlciB0byB0aGUgRE9NIGFuZCBraWNrc1xuICAgIyBvZmYgYmFja2JvbmVzIGhpc3RvcnlcblxuICAgcmVuZGVyOiAtPlxuICAgICAgQCRib2R5ID0gJCAnYm9keSdcbiAgICAgIEAkYm9keS5hcHBlbmQgQGVsXG5cbiAgICAgIEJhY2tib25lLmhpc3Rvcnkuc3RhcnRcbiAgICAgICAgIHB1c2hTdGF0ZTogZmFsc2VcblxuXG5cbiAgICMgRGVzdHJveXMgYWxsIGN1cnJlbnQgYW5kIHByZS1yZW5kZXJlZCB2aWV3cyBhbmRcbiAgICMgdW5kZWxlZ2F0ZXMgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIEBsYW5kaW5nVmlldy5yZW1vdmUoKVxuICAgICAgQHNoYXJlVmlldy5yZW1vdmUoKVxuICAgICAgQGNyZWF0ZVZpZXcucmVtb3ZlKClcblxuICAgICAgQHJlbW92ZUV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgIyBBZGRzIEFwcENvbnRyb2xsZXItcmVsYXRlZCBldmVudCBsaXN0ZW5lcnMgYW5kIGJlZ2luc1xuICAgIyBsaXN0ZW5pbmcgdG8gdmlldyBjaGFuZ2VzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgJ2NoYW5nZTp2aWV3JywgQG9uVmlld0NoYW5nZVxuXG5cblxuXG4gICAjIFJlbW92ZXMgQXBwQ29udHJvbGxlci1yZWxhdGVkIGV2ZW50IGxpc3RlbmVyc1xuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBzaG93aW5nIC8gaGlkaW5nIC8gZGlzcG9zaW5nIG9mIHByaW1hcnkgdmlld3NcbiAgICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICAgb25WaWV3Q2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBwcmV2aW91c1ZpZXcgPSBtb2RlbC5fcHJldmlvdXNBdHRyaWJ1dGVzLnZpZXdcbiAgICAgIGN1cnJlbnRWaWV3ICA9IG1vZGVsLmNoYW5nZWQudmlld1xuXG4gICAgICBpZiBwcmV2aW91c1ZpZXcgdGhlbiBwcmV2aW91c1ZpZXcuaGlkZVxuICAgICAgICAgcmVtb3ZlOiB0cnVlXG5cblxuICAgICAgQCRlbC5hcHBlbmQgY3VycmVudFZpZXcucmVuZGVyKCkuZWxcblxuICAgICAgY3VycmVudFZpZXcuc2hvdygpXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwQ29udHJvbGxlciIsIiMjIypcbiAgQXBwbGljYXRpb24td2lkZSBnZW5lcmFsIGNvbmZpZ3VyYXRpb25zXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTkuMTRcbiMjI1xuXG5cbkFwcENvbmZpZyA9XG5cblxuICAgIyBUaGUgcGF0aCB0byBhcHBsaWNhdGlvbiBhc3NldHNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQVNTRVRTOlxuICAgICAgcGF0aDogICAnL2Fzc2V0cydcbiAgICAgIGF1ZGlvOiAgJ2F1ZGlvJ1xuICAgICAgZGF0YTogICAnZGF0YSdcbiAgICAgIGltYWdlczogJ2ltYWdlcydcblxuXG4gICAjIFRoZSBCUE0gdGVtcG9cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQlBNOiAzMjBcblxuXG4gICAjIFRoZSBtYXggQlBNXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIEJQTV9NQVg6IDEwMDBcblxuXG4gICAjIFRoZSBtYXggdmFyaWVudCBvbiBlYWNoIHBhdHRlcm4gc3F1YXJlIChvZmYsIGxvdywgbWVkaXVtLCBoaWdoKVxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBWRUxPQ0lUWV9NQVg6IDNcblxuXG4gICAjIFZvbHVtZSBsZXZlbHMgZm9yIHBhdHRlcm4gcGxheWJhY2sgYXMgd2VsbCBhcyBmb3Igb3ZlcmFsbCB0cmFja3NcbiAgICMgQHR5cGUge09iamVjdH1cblxuICAgVk9MVU1FX0xFVkVMUzpcbiAgICAgIGxvdzogICAgLjJcbiAgICAgIG1lZGl1bTogLjVcbiAgICAgIGhpZ2g6ICAgIDFcblxuXG4gICAjIFJldHVybnMgYSBub3JtYWxpemVkIGFzc2V0IHBhdGggZm9yIGFwcGxpY2F0aW9uIGFzc2V0c1xuICAgIyBAcGFyYW0ge1N0cmluZ30gYXNzZXRUeXBlXG5cbiAgIHJldHVybkFzc2V0UGF0aDogKGFzc2V0VHlwZSkgLT5cbiAgICAgIEBBU1NFVFMucGF0aCArICcvJyArIEBBU1NFVFNbYXNzZXRUeXBlXVxuXG5cbiAgICMgUmV0dXJucyBhIG5vcm1hbGl6ZWQgYXNzZXQgcGF0aCBmb3IgdGhlIFRFU1QgZW52aXJvbm1lbnRcbiAgICMgQHBhcmFtIHtTdHJpbmd9IGFzc2V0VHlwZVxuXG4gICByZXR1cm5UZXN0QXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgICAgJy90ZXN0L2h0bWwvJyArIEBBU1NFVFMucGF0aCArICcvJyArIEBBU1NFVFNbYXNzZXRUeXBlXVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb25maWdcblxuIiwiIyMjKlxuICogQXBwbGljYXRpb24gcmVsYXRlZCBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cbkFwcEV2ZW50ID1cblxuICAgQ0hBTkdFX0FDVElWRTogICAgICdjaGFuZ2U6YWN0aXZlJ1xuICAgQ0hBTkdFX0JQTTogICAgICAgICdjaGFuZ2U6YnBtJ1xuICAgQ0hBTkdFX0ZPQ1VTOiAgICAgICdjaGFuZ2U6Zm9jdXMnXG4gICBDSEFOR0VfSU5TVFJVTUVOVDogJ2NoYW5nZTpjdXJyZW50SW5zdHJ1bWVudCdcbiAgIENIQU5HRV9LSVQ6ICAgICAgICAnY2hhbmdlOmtpdE1vZGVsJ1xuICAgQ0hBTkdFX01VVEU6ICAgICAgICdjaGFuZ2U6bXV0ZSdcbiAgIENIQU5HRV9QTEFZSU5HOiAgICAnY2hhbmdlOnBsYXlpbmcnXG4gICBDSEFOR0VfVFJJR0dFUjogICAgJ2NoYW5nZTp0cmlnZ2VyJ1xuICAgQ0hBTkdFX1ZFTE9DSVRZOiAgICdjaGFuZ2U6dmVsb2NpdHknXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBFdmVudCIsIiMjIypcbiAqIEdsb2JhbCBQdWJTdWIgZXZlbnRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuXG5QdWJTdWIgPVxuXG4gICBST1VURTogJ29uUm91dGVDaGFuZ2UnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQdWJTdWIiLCJcbnZhciBkaWdpdHMgPSByZXF1aXJlKCdkaWdpdHMnKTtcbnZhciBoYW5kbGViYXJzID0gcmVxdWlyZSgnaGFuZGxlaWZ5JylcblxuaGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcigncmVwZWF0JywgZnVuY3Rpb24obiwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBfZGF0YSA9IHt9O1xuICAgIGlmIChvcHRpb25zLl9kYXRhKSB7XG4gICAgICBfZGF0YSA9IGhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5fZGF0YSk7XG4gICAgfVxuXG4gICAgdmFyIGNvbnRlbnQgPSAnJztcbiAgICB2YXIgY291bnQgPSBuIC0gMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBjb3VudDsgaSsrKSB7XG4gICAgICBfZGF0YSA9IHtcbiAgICAgICAgaW5kZXg6IGRpZ2l0cy5wYWQoKGkgKyAxKSwge2F1dG86IG59KVxuICAgICAgfTtcbiAgICAgIGNvbnRlbnQgKz0gb3B0aW9ucy5mbih0aGlzLCB7ZGF0YTogX2RhdGF9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBoYW5kbGViYXJzLlNhZmVTdHJpbmcoY29udGVudCk7XG4gIH0pOyIsIiMjIypcbiAqIE1QQyBBcHBsaWNhdGlvbiBib290c3RyYXBwZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cblRvdWNoICAgICAgICAgPSByZXF1aXJlICcuL3V0aWxzL1RvdWNoJ1xuQXBwQ29uZmlnICAgICA9IHJlcXVpcmUgJy4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcbkFwcENvbnRyb2xsZXIgPSByZXF1aXJlICcuL0FwcENvbnRyb2xsZXIuY29mZmVlJ1xuaGVscGVycyAgICAgICA9IHJlcXVpcmUgJy4vaGVscGVycy9oYW5kbGViYXJzLWhlbHBlcnMnXG5cbiQgLT5cblxuICAgVG91Y2gudHJhbnNsYXRlVG91Y2hFdmVudHMoKVxuXG4gICBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgIHBhcnNlOiB0cnVlXG5cbiAgIGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICBhcHBDb250cm9sbGVyID0gbmV3IEFwcENvbnRyb2xsZXJcbiAgICAgIGtpdENvbGxlY3Rpb246IGtpdENvbGxlY3Rpb25cblxuICAgYXBwQ29udHJvbGxlci5yZW5kZXIoKVxuIiwiIyMjKlxuICBQcmltYXJ5IGFwcGxpY2F0aW9uIG1vZGVsIHdoaWNoIGNvb3JkaW5hdGVzIHN0YXRlXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblxuXG5BcHBSb3V0ZXIgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmRcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICd2aWV3JzogICAgICAgIG51bGxcbiAgICAgICdwbGF5aW5nJzogICAgIG51bGxcbiAgICAgICdtdXRlJzogICAgICAgIG51bGxcblxuICAgICAgJ2tpdE1vZGVsJzogICAgbnVsbFxuXG4gICAgICAjIFNldHRpbmdzXG4gICAgICAnYnBtJzogICAgICAgICBBcHBDb25maWcuQlBNXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBSb3V0ZXIiLCIjIyMqXG4gKiBDb2xsZWN0aW9uIG9mIHNvdW5kIGtpdHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdE1vZGVsICA9IHJlcXVpcmUgJy4vS2l0TW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIEtpdENvbGxlY3Rpb24gZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cblxuICAgIyBVcmwgdG8gZGF0YSBmb3IgZmV0Y2hcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdXJsOiBcIiN7QXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpfS9zb3VuZC1kYXRhLmpzb25cIlxuXG5cbiAgICMgSW5kaXZpZHVhbCBkcnVta2l0IGF1ZGlvIHNldHNcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBtb2RlbDogS2l0TW9kZWxcblxuXG4gICAjIFRoZSBjdXJyZW50IHVzZXItc2VsZWN0ZWQga2l0XG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGtpdElkOiAwXG5cblxuXG4gICBwYXJzZTogKHJlc3BvbnNlKSAtPlxuICAgICAgYXNzZXRQYXRoID0gcmVzcG9uc2UuY29uZmlnLmFzc2V0UGF0aFxuICAgICAga2l0cyA9IHJlc3BvbnNlLmtpdHNcblxuICAgICAga2l0cyA9IF8ubWFwIGtpdHMsIChraXQpIC0+XG4gICAgICAgICBraXQucGF0aCA9IGFzc2V0UGF0aCArICcvJyArIGtpdC5mb2xkZXJcbiAgICAgICAgIHJldHVybiBraXRcblxuICAgICAgcmV0dXJuIGtpdHNcblxuXG5cblxuICAgIyBDeWNsZXMgdGhlIGN1cnJlbnQgZHJ1bSBraXQgYmFja1xuICAgIyBAcmV0dXJuIHtLaXRNb2RlbH1cblxuICAgcHJldmlvdXNLaXQ6IC0+XG4gICAgICBsZW4gPSBAbGVuZ3RoXG5cbiAgICAgIGlmIEBraXRJZCA+IDBcbiAgICAgICAgIEBraXRJZC0tXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIEBraXRJZCA9IGxlbiAtIDFcblxuICAgICAga2l0TW9kZWwgPSBAYXQgQGtpdElkXG5cblxuXG5cbiAgICMgQ3ljbGVzIHRoZSBjdXJyZW50IGRydW0ga2l0IGZvcndhcmRcbiAgICMgQHJldHVybiB7S2l0TW9kZWx9XG5cbiAgIG5leHRLaXQ6IC0+XG4gICAgICBsZW4gPSBAbGVuZ3RoIC0gMVxuXG4gICAgICBpZiBAa2l0SWQgPCBsZW5cbiAgICAgICAgIEBraXRJZCsrXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIEBraXRJZCA9IDBcblxuICAgICAga2l0TW9kZWwgPSBAYXQgQGtpdElkXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdENvbGxlY3Rpb24iLCIjIyMqXG4gKiBLaXQgbW9kZWwgZm9yIGhhbmRsaW5nIHN0YXRlIHJlbGF0ZWQgdG8ga2l0IHNlbGVjdGlvblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkluc3RydW1lbnRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblxuXG5jbGFzcyBLaXRNb2RlbCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnbGFiZWwnOiAgICBudWxsXG4gICAgICAncGF0aCc6ICAgICBudWxsXG4gICAgICAnZm9sZGVyJzogICBudWxsXG5cbiAgICAgICMgQHR5cGUge0luc3RydW1lbnRDb2xsZWN0aW9ufVxuICAgICAgJ2luc3RydW1lbnRzJzogICBudWxsXG5cbiAgICAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cbiAgICAgICdjdXJyZW50SW5zdHJ1bWVudCc6IG51bGxcblxuXG5cbiAgICMgRm9ybWF0IHRoZSByZXNwb25zZSBzbyB0aGF0IGluc3RydW1lbnRzIGdldHMgcHJvY2Vzc2VkXG4gICAjIGJ5IGJhY2tib25lIHZpYSB0aGUgSW5zdHJ1bWVudENvbGxlY3Rpb24uICBBZGRpdGlvbmFsbHksXG4gICAjIHBhc3MgaW4gdGhlIHBhdGggc28gdGhhdCBhYnNvbHV0ZSBVUkwncyBjYW4gYmUgdXNlZFxuICAgIyB0byByZWZlcmVuY2Ugc291bmQgZGF0YVxuICAgIyBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcblxuICAgcGFyc2U6IChyZXNwb25zZSkgLT5cbiAgICAgIF8uZWFjaCByZXNwb25zZS5pbnN0cnVtZW50cywgKGluc3RydW1lbnQpIC0+XG4gICAgICAgICBpbnN0cnVtZW50LnNyYyA9IHJlc3BvbnNlLnBhdGggKyAnLycgKyBpbnN0cnVtZW50LnNyY1xuXG4gICAgICByZXNwb25zZS5pbnN0cnVtZW50cyA9IG5ldyBJbnN0cnVtZW50Q29sbGVjdGlvbiByZXNwb25zZS5pbnN0cnVtZW50c1xuXG4gICAgICByZXNwb25zZVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdE1vZGVsIiwiIyMjKlxuICogQ29sbGVjdGlvbiByZXByZXNlbnRpbmcgZWFjaCBzb3VuZCBmcm9tIGEga2l0IHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4vSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBJbnN0cnVtZW50Q29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudENvbGxlY3Rpb24iLCIjIyMqXG4gKiBTb3VuZCBtb2RlbCBmb3IgZWFjaCBpbmRpdmlkdWFsIGtpdCBzb3VuZCBzZXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblxuXG5jbGFzcyBJbnN0cnVtZW50TW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuXG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgICAnaWNvbic6ICAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7U3RyaW5nfVxuICAgICAgJ2xhYmVsJzogICBudWxsXG5cbiAgICAgICMgQHR5cGUge1N0cmluZ31cbiAgICAgICdzcmMnOiAgICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAndm9sdW1lJzogIG51bGxcblxuICAgICAgIyBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgICdhY3RpdmUnOiAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtCb29sZWFufVxuICAgICAgJ211dGUnOiAgICBudWxsXG5cbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG4gICAgICAnZm9jdXMnOiAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7UGF0dGVyblNxdWFyZUNvbGxlY3Rpb259XG4gICAgICAncGF0dGVyblNxdWFyZXMnOiAgICBudWxsXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50TW9kZWwiLCIjIyMqXG4gIEEgY29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlc1xuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICcuLi9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24iLCIjIyMqXG4gIE1vZGVsIGZvciBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlcy4gIFBhcnQgb2YgbGFyZ2VyIFBhdHRlcm4gVHJhY2sgY29sbGVjdGlvblxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmVNb2RlbCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnYWN0aXZlJzogICAgICAgICAgIGZhbHNlXG4gICAgICAnaW5zdHJ1bWVudCc6ICAgICAgIG51bGxcbiAgICAgICdwcmV2aW91c1ZlbG9jaXR5JzogMFxuICAgICAgJ3RyaWdnZXInOiAgICAgICAgICBudWxsXG4gICAgICAndmVsb2NpdHknOiAgICAgICAgIDBcblxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAb24gQXBwRXZlbnQuQ0hBTkdFX1ZFTE9DSVRZLCBAb25WZWxvY2l0eUNoYW5nZVxuXG5cblxuICAgY3ljbGU6IC0+XG4gICAgICB2ZWxvY2l0eSA9IEBnZXQgJ3ZlbG9jaXR5J1xuXG4gICAgICBpZiB2ZWxvY2l0eSA8IEFwcENvbmZpZy5WRUxPQ0lUWV9NQVhcbiAgICAgICAgIHZlbG9jaXR5KytcblxuICAgICAgZWxzZVxuICAgICAgICAgdmVsb2NpdHkgPSAwXG5cbiAgICAgIEBzZXQgJ3ZlbG9jaXR5JywgdmVsb2NpdHlcblxuXG5cbiAgIGVuYWJsZTogLT5cbiAgICAgIEBzZXQgJ3ZlbG9jaXR5JywgMVxuXG5cblxuXG4gICBkaXNhYmxlOiAtPlxuICAgICAgQHNldCAndmVsb2NpdHknLCAwXG5cblxuXG4gICBvblZlbG9jaXR5Q2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBAc2V0ICdwcmV2aW91c1ZlbG9jaXR5JywgbW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy52ZWxvY2l0eVxuXG4gICAgICB2ZWxvY2l0eSA9IG1vZGVsLmNoYW5nZWQudmVsb2NpdHlcblxuICAgICAgaWYgdmVsb2NpdHkgPiAwXG4gICAgICAgICBAc2V0ICdhY3RpdmUnLCB0cnVlXG5cbiAgICAgIGVsc2UgaWYgdmVsb2NpdHkgaXMgMFxuICAgICAgICAgQHNldCAnYWN0aXZlJywgZmFsc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlTW9kZWwiLCIjIyMqXG4gKiBNUEMgQXBwbGljYXRpb24gcm91dGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgPSByZXF1aXJlICcuLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblB1YlN1YiAgICAgID0gcmVxdWlyZSAnLi4vdXRpbHMvUHViU3ViJ1xuUHViRXZlbnQgICAgPSByZXF1aXJlICcuLi9ldmVudHMvUHViRXZlbnQuY29mZmVlJ1xuXG4jIFRPRE86IFRoZSBiZWxvdyBpdGVtcyBhcmUgb25seSBpbmNsdWRlZCBmb3IgdGVzdGluZyBjb21wb25lbnRcbiMgbW9kdWxhcml0eS4gIFRoZXksIGFuZCB0aGVpciByb3V0ZXMsIHNob3VsZCBiZSByZW1vdmVkIGluIHByb2R1Y3Rpb25cblxuVGVzdHNWaWV3ICAgICA9IHJlcXVpcmUgJy4uL3ZpZXdzL3Rlc3RzL1Rlc3RzVmlldy5jb2ZmZWUnXG5cblZpZXcgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cbktpdFNlbGVjdG9yICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcbktpdE1vZGVsICAgICAgPSByZXF1aXJlICcuLi9tb2RlbHMva2l0cy9LaXRNb2RlbC5jb2ZmZWUnXG5cbkJQTUluZGljYXRvciAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xuSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUnXG5cbkluc3RydW1lbnRNb2RlbCA9ICcuLi9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9ICcuLi9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblxuUGF0dGVyblNxdWFyZSA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuVHJhY2sgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay5jb2ZmZWUnXG5TZXF1ZW5jZXIgICAgICAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSdcblxuXG5jbGFzcyBBcHBSb3V0ZXIgZXh0ZW5kcyBCYWNrYm9uZS5Sb3V0ZXJcblxuXG4gICByb3V0ZXM6XG4gICAgICAnJzogICAgICAgICAgICAgJ2xhbmRpbmdSb3V0ZSdcbiAgICAgICdjcmVhdGUnOiAgICAgICAnY3JlYXRlUm91dGUnXG4gICAgICAnc2hhcmUnOiAgICAgICAgJ3NoYXJlUm91dGUnXG5cbiAgICAgICMgQ29tcG9uZW50IHRlc3Qgcm91dGVzXG4gICAgICAndGVzdHMnOiAgICAgICAgICAgICAgICAndGVzdHMnXG4gICAgICAna2l0LXNlbGVjdGlvbic6ICAgICAgICAna2l0U2VsZWN0aW9uUm91dGUnXG4gICAgICAnYnBtLWluZGljYXRvcic6ICAgICAgICAnYnBtSW5kaWNhdG9yUm91dGUnXG4gICAgICAnaW5zdHJ1bWVudC1zZWxlY3Rvcic6ICAnaW5zdHJ1bWVudFNlbGVjdG9yUm91dGUnXG4gICAgICAncGF0dGVybi1zcXVhcmUnOiAgICAgICAncGF0dGVyblNxdWFyZVJvdXRlJ1xuICAgICAgJ3BhdHRlcm4tdHJhY2snOiAgICAgICAgJ3BhdHRlcm5UcmFja1JvdXRlJ1xuICAgICAgJ3NlcXVlbmNlcic6ICAgICAgICAgICAgJ3NlcXVlbmNlclJvdXRlJ1xuICAgICAgJ2Z1bGwtc2VxdWVuY2VyJzogICAgICAgJ2Z1bGxTZXF1ZW5jZXJSb3V0ZSdcblxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAge0BhcHBDb250cm9sbGVyLCBAYXBwTW9kZWx9ID0gb3B0aW9uc1xuXG4gICAgICBQdWJTdWIub24gUHViRXZlbnQuUk9VVEUsIEBvblJvdXRlQ2hhbmdlXG5cblxuXG4gICBvblJvdXRlQ2hhbmdlOiAocGFyYW1zKSA9PlxuICAgICAge3JvdXRlfSA9IHBhcmFtc1xuXG4gICAgICBAbmF2aWdhdGUgcm91dGUsIHsgdHJpZ2dlcjogdHJ1ZSB9XG5cblxuXG4gICBsYW5kaW5nUm91dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgQGFwcENvbnRyb2xsZXIubGFuZGluZ1ZpZXdcblxuXG5cbiAgIGNyZWF0ZVJvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLmNyZWF0ZVZpZXdcblxuXG5cbiAgIHNoYXJlUm91dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgQGFwcENvbnRyb2xsZXIuc2hhcmVWaWV3XG5cblxuXG5cblxuXG4gICAjIENPTVBPTkVOVCBURVNUIFJPVVRFU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgIHRlc3RzOiAtPlxuICAgICAgdmlldyA9IG5ldyBUZXN0c1ZpZXcoKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBraXRTZWxlY3Rpb25Sb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBLaXRTZWxlY3RvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24sXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cbiAgIGJwbUluZGljYXRvclJvdXRlOiAtPlxuICAgICAgdmlldyA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgdmlldy5yZW5kZXIoKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBpbnN0cnVtZW50U2VsZWN0b3JSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBwYXR0ZXJuU3F1YXJlUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgUGF0dGVyblNxdWFyZVxuICAgICAgICAgcGF0dGVyblNxdWFyZU1vZGVsOiBuZXcgUGF0dGVyblNxdWFyZU1vZGVsKClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbiAgIHBhdHRlcm5UcmFja1JvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IFBhdHRlcm5UcmFja1xuICAgICAgICAgbW9kZWw6IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuICAgc2VxdWVuY2VyUm91dGU6IC0+XG5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuICAgZnVsbFNlcXVlbmNlclJvdXRlOiAtPlxuXG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cblxuICAgICAga2l0U2VsZWN0aW9uID0gPT5cbiAgICAgICAgIHZpZXcgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgICAgIHZpZXdcblxuXG4gICAgICBicG0gPSA9PlxuICAgICAgICAgdmlldyA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgICAgdmlld1xuXG5cbiAgICAgIGluc3RydW1lbnRTZWxlY3Rpb24gPSA9PlxuICAgICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICAgICB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICAgICB2aWV3XG5cblxuICAgICAgc2VxdWVuY2VyID0gPT5cbiAgICAgICAgIHZpZXcgPSBuZXcgU2VxdWVuY2VyXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgICAgdmlld1xuXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldyA9IG5ldyBWaWV3KClcblxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcuJGVsLmFwcGVuZCBraXRTZWxlY3Rpb24oKS5yZW5kZXIoKS5lbFxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcuJGVsLmFwcGVuZCBicG0oKS5yZW5kZXIoKS5lbFxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcuJGVsLmFwcGVuZCBpbnN0cnVtZW50U2VsZWN0aW9uKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgc2VxdWVuY2VyKCkucmVuZGVyKCkuZWxcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIGZ1bGxTZXF1ZW5jZXJWaWV3XG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBSb3V0ZXIiLCIjIyMqXG4gKiBWaWV3IHN1cGVyY2xhc3MgY29udGFpbmluZyBzaGFyZWQgZnVuY3Rpb25hbGl0eVxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMi4xNy4xNFxuIyMjXG5cblxuVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kXG5cblxuXG4gICAjIEluaXRpYWxpemVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgXy5leHRlbmQgQCwgXy5kZWZhdWx0cyggb3B0aW9ucyA9IG9wdGlvbnMgfHwgQGRlZmF1bHRzLCBAZGVmYXVsdHMgfHwge30gKVxuXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyB3aXRoIHN1cHBsaWVkIHRlbXBsYXRlIGRhdGEsIG9yIGNoZWNrcyBpZiB0ZW1wbGF0ZSBpcyBvblxuICAgIyBvYmplY3QgYm9keVxuICAgIyBAcGFyYW0gIHtGdW5jdGlvbnxNb2RlbH0gdGVtcGxhdGVEYXRhXG4gICAjIEByZXR1cm4ge1ZpZXd9XG5cbiAgIHJlbmRlcjogKHRlbXBsYXRlRGF0YSkgLT5cbiAgICAgIHRlbXBsYXRlRGF0YSA9IHRlbXBsYXRlRGF0YSB8fCB7fVxuXG4gICAgICBpZiBAdGVtcGxhdGVcblxuICAgICAgICAgIyBJZiBtb2RlbCBpcyBhbiBpbnN0YW5jZSBvZiBhIGJhY2tib25lIG1vZGVsLCB0aGVuIEpTT05pZnkgaXRcbiAgICAgICAgIGlmIEBtb2RlbCBpbnN0YW5jZW9mIEJhY2tib25lLk1vZGVsXG4gICAgICAgICAgICB0ZW1wbGF0ZURhdGEgPSBAbW9kZWwudG9KU09OKClcblxuICAgICAgICAgQCRlbC5odG1sIEB0ZW1wbGF0ZSAodGVtcGxhdGVEYXRhKVxuXG4gICAgICBAZGVsZWdhdGVFdmVudHMoKVxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQFxuXG5cblxuXG4gICAjIFJlbW92ZXMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVtb3ZlOiAob3B0aW9ucykgLT5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG4gICAgICBAJGVsLnJlbW92ZSgpXG4gICAgICBAdW5kZWxlZ2F0ZUV2ZW50cygpXG5cblxuXG5cblxuICAgIyBTaG93cyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBzaG93OiAob3B0aW9ucykgLT5cbiAgICAgIFR3ZWVuTWF4LnNldCBAJGVsLCB7IGF1dG9BbHBoYTogMSB9XG5cblxuXG5cbiAgICMgSGlkZXMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaGlkZTogKG9wdGlvbnMpIC0+XG4gICAgICBUd2Vlbk1heC5zZXQgQCRlbCxcbiAgICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgIGlmIG9wdGlvbnM/LnJlbW92ZVxuICAgICAgICAgICAgICAgQHJlbW92ZSgpXG5cblxuXG5cbiAgICMgTm9vcCB3aGljaCBpcyBjYWxsZWQgb24gcmVuZGVyXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuXG5cblxuICAgIyBSZW1vdmVzIGFsbCByZWdpc3RlcmVkIGxpc3RlbmVyc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlldyIsIi8qKlxuICogQG1vZHVsZSAgICAgUHViU3ViXG4gKiBAZGVzYyAgICAgICBHbG9iYWwgUHViU3ViIG9iamVjdCBmb3IgZGlzcGF0Y2ggYW5kIGRlbGVnYXRpb25cbiAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIFB1YlN1YiA9IHt9XG5cbl8uZXh0ZW5kKCBQdWJTdWIsIEJhY2tib25lLkV2ZW50cyApXG5cbm1vZHVsZS5leHBvcnRzID0gUHViU3ViIiwiLyoqXG4gKiBUb3VjaCByZWxhdGVkIHV0aWxpdGllc1xuICpcbiAqL1xuXG52YXIgVG91Y2ggPSB7XG5cblxuICAvKipcbiAgICogRGVsZWdhdGUgdG91Y2ggZXZlbnRzIHRvIG1vdXNlIGlmIG5vdCBvbiBhIHRvdWNoIGRldmljZVxuICAgKi9cblxuICB0cmFuc2xhdGVUb3VjaEV2ZW50czogZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKCEgKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyApKSB7XG4gICAgICAkKGRvY3VtZW50KS5kZWxlZ2F0ZSggJ2JvZHknLCAnbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAkKGUudGFyZ2V0KS50cmlnZ2VyKCAndG91Y2hzdGFydCcgKVxuICAgICAgfSlcblxuICAgICAgJChkb2N1bWVudCkuZGVsZWdhdGUoICdib2R5JywgJ21vdXNldXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICQoZS50YXJnZXQpLnRyaWdnZXIoICd0b3VjaGVuZCcgKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRvdWNoIiwiIyMjKlxuICogQ3JlYXRlIHZpZXcgd2hpY2ggdGhlIHVzZXIgY2FuIGJ1aWxkIGJlYXRzIHdpdGhpblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblxuVmlldyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5LaXRTZWxlY3RvciAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSdcbkluc3RydW1lbnRTZWxlY3RvclBhbmVsID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlJ1xuU2VxdWVuY2VyICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSdcbkJQTUluZGljYXRvciAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSdcbnRlbXBsYXRlICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvY3JlYXRlLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBDcmVhdGVWaWV3IGV4dGVuZHMgVmlld1xuXG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAka2l0U2VsZWN0b3JDb250YWluZXIgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1raXQtc2VsZWN0b3InXG4gICAgICBAJGtpdFNlbGVjdG9yICAgICAgICAgICAgPSBAJGVsLmZpbmQgJy5raXQtc2VsZWN0b3InXG4gICAgICBAJHZpc3VhbGl6YXRpb25Db250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItdmlzdWFsaXphdGlvbidcbiAgICAgIEAkc2VxdWVuY2VyQ29udGFpbmVyICAgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1zZXF1ZW5jZXInXG4gICAgICBAJGluc3RydW1lbnRTZWxlY3RvciAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuaW5zdHJ1bWVudC1zZWxlY3RvcidcbiAgICAgIEAkc2VxdWVuY2VyICAgICAgICAgICAgICA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5zZXF1ZW5jZXInXG4gICAgICBAJGJwbSAgICAgICAgICAgICAgICAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuYnBtJ1xuICAgICAgQCRzaGFyZUJ0biAgICAgICAgICAgICAgID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLmJ0bi1zaGFyZSdcblxuICAgICAgQHJlbmRlcktpdFNlbGVjdG9yKClcbiAgICAgIEByZW5kZXJJbnN0cnVtZW50U2VsZWN0b3IoKVxuICAgICAgQHJlbmRlclNlcXVlbmNlcigpXG4gICAgICBAcmVuZGVyQlBNKClcblxuICAgICAgQFxuXG5cblxuICAgcmVuZGVyS2l0U2VsZWN0b3I6IC0+XG4gICAgICBAa2l0U2VsZWN0b3IgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIEAka2l0U2VsZWN0b3IuaHRtbCBAa2l0U2VsZWN0b3IucmVuZGVyKCkuZWxcblxuXG5cbiAgIHJlbmRlckluc3RydW1lbnRTZWxlY3RvcjogLT5cbiAgICAgIEBpbnN0cnVtZW50U2VsZWN0b3IgPSBuZXcgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWxcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIEAkaW5zdHJ1bWVudFNlbGVjdG9yLmh0bWwgQGluc3RydW1lbnRTZWxlY3Rvci5yZW5kZXIoKS5lbFxuXG5cblxuICAgcmVuZGVyU2VxdWVuY2VyOiAtPlxuICAgICAgQHNlcXVlbmNlciA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICBAJHNlcXVlbmNlci5odG1sIEBzZXF1ZW5jZXIucmVuZGVyKCkuZWxcblxuXG5cbiAgIHJlbmRlckJQTTogLT5cbiAgICAgIEBicG0gPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEAkYnBtLmh0bWwgQGJwbS5yZW5kZXIoKS5lbFxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3JlYXRlVmlldyIsIiMjIypcbiAqIEJlYXRzIHBlciBtaW51dGUgdmlldyBmb3IgaGFuZGxpbmcgdGVtcG9cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9icG0tdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEJQTUluZGljYXRvciBleHRlbmRzIFZpZXdcblxuXG4gICAjIFJlZiB0byB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBUaGUgc2V0SW50ZXJ2YWwgdXBkYXRlIGludGVydmFsIGZvciBpbmNyZWFzaW5nIGFuZFxuICAgIyBkZWNyZWFzaW5nIEJQTSBvbiBwcmVzcyAvIHRvdWNoXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGludGVydmFsVXBkYXRlVGltZTogNzBcblxuXG4gICAjIFRoZSBzZXRJbnRlcnZhbCB1cGRhdGVyXG4gICAjIEB0eXBlIHtTZXRJbnRlcnZhbH1cblxuICAgdXBkYXRlSW50ZXJ2YWw6IG51bGxcblxuXG4gICAjIFRoZSBhbW91bnQgdG8gaW5jcmVhc2UgdGhlIEJQTSBieSBvbiBlYWNoIHRpY2tcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgYnBtSW5jcmVhc2VBbW91bnQ6IDEwXG5cblxuICAgIyBUaGUgY3VycmVudCBicG0gYmVmb3JlIGl0cyBzZXQgb24gdGhlIG1vZGVsLiAgVXNlZCB0byBidWZmZXJcbiAgICMgdXBkYXRlcyBhbmQgdG8gcHJvdmlkZSBmb3Igc21vb3RoIGFuaW1hdGlvblxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBjdXJyQlBNOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaHN0YXJ0IC5idG4taW5jcmVhc2UnOiAnb25JbmNyZWFzZUJ0bkRvd24nXG4gICAgICAndG91Y2hzdGFydCAuYnRuLWRlY3JlYXNlJzogJ29uRGVjcmVhc2VCdG5Eb3duJ1xuICAgICAgJ3RvdWNoZW5kICAgLmJ0bi1pbmNyZWFzZSc6ICdvbkJ0blVwJ1xuICAgICAgJ3RvdWNoZW5kICAgLmJ0bi1kZWNyZWFzZSc6ICdvbkJ0blVwJ1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgdXBkYXRlIHRoZSBraXQgaWYgbm90IGFscmVhZHlcbiAgICMgc2V0IHZpYSBhIHByZXZpb3VzIHNlc3Npb25cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRicG1MYWJlbCAgID0gQCRlbC5maW5kICcubGFiZWwtYnBtJ1xuICAgICAgQGluY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWluY3JlYXNlJ1xuICAgICAgQGRlY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWRlY3JlYXNlJ1xuXG4gICAgICBAY3VyckJQTSA9IEBhcHBNb2RlbC5nZXQoJ2JwbScpXG4gICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cbiAgICAgIEBvbkJ0blVwKClcblxuICAgICAgQFxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAgIyBzd2l0Y2hpbmcgQlBNXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0JQTSwgQG9uQlBNQ2hhbmdlXG5cblxuXG5cbiAgICMgU2V0cyBhbiBpbnRlcnZhbCB0byBpbmNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgICMgd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2VcblxuICAgaW5jcmVhc2VCUE06IC0+XG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgICAgYnBtID0gQGN1cnJCUE1cblxuICAgICAgICAgaWYgYnBtIDwgQXBwQ29uZmlnLkJQTV9NQVhcbiAgICAgICAgICAgIGJwbSArPSBAYnBtSW5jcmVhc2VBbW91bnRcblxuICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnBtID0gQXBwQ29uZmlnLkJQTV9NQVhcblxuICAgICAgICAgQGN1cnJCUE0gPSBicG1cbiAgICAgICAgIEAkYnBtTGFiZWwudGV4dCBAY3VyckJQTVxuICAgICAgICAgI0BhcHBNb2RlbC5zZXQgJ2JwbScsIDYwMDAwIC8gQGN1cnJCUE1cblxuICAgICAgLCBAaW50ZXJ2YWxVcGRhdGVUaW1lXG5cblxuXG5cbiAgICMgU2V0cyBhbiBpbnRlcnZhbCB0byBkZWNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgICMgd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2VcblxuICAgZGVjcmVhc2VCUE06IC0+XG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgICAgYnBtID0gQGN1cnJCUE1cblxuICAgICAgICAgaWYgYnBtID4gMFxuICAgICAgICAgICAgYnBtIC09IEBicG1JbmNyZWFzZUFtb3VudFxuXG4gICAgICAgICBlbHNlXG4gICAgICAgICAgICBicG0gPSAwXG5cbiAgICAgICAgIEBjdXJyQlBNID0gYnBtXG4gICAgICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cbiAgICAgICAgICNAYXBwTW9kZWwuc2V0ICdicG0nLCA2MDAwMCAvIEBjdXJyQlBNXG5cbiAgICAgICwgQGludGVydmFsVXBkYXRlVGltZVxuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkluY3JlYXNlQnRuRG93bjogKGV2ZW50KSA9PlxuICAgICAgQGluY3JlYXNlQlBNKClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uRGVjcmVhc2VCdG5Eb3duOiAoZXZlbnQpIC0+XG4gICAgICBAZGVjcmVhc2VCUE0oKVxuXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbW91c2UgLyB0b3VjaHVwIGV2ZW50cy4gIENsZWFycyB0aGUgaW50ZXJ2YWxcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25CdG5VcDogKGV2ZW50KSAtPlxuICAgICAgY2xlYXJJbnRlcnZhbCBAdXBkYXRlSW50ZXJ2YWxcbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IG51bGxcblxuICAgICAgQGFwcE1vZGVsLnNldCAnYnBtJywgNjAwMDAgLyBAY3VyckJQTVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2UgZXZlbnRzLiAgVXBkYXRlcyB0aGUgbGFiZWwgb24gdGhlXG4gICAjIGtpdCBzZWxlY3RvclxuXG4gICBvbkJQTUNoYW5nZTogKG1vZGVsKSAtPlxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQlBNSW5kaWNhdG9yIiwiIyMjKlxuICogS2l0IHNlbGVjdG9yIGZvciBzd2l0Y2hpbmcgYmV0d2VlbiBkcnVtLWtpdCBzb3VuZHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMva2l0LXNlbGVjdGlvbi10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgS2l0U2VsZWN0b3IgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBSZWYgdG8gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBLaXRDb2xsZWN0aW9uIGZvciB1cGRhdGluZyBzb3VuZHNcbiAgICMgQHR5cGUge0tpdENvbGxlY3Rpb259XG5cbiAgIGtpdENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIFRoZSBjdXJyZW50IGtpdFxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdE1vZGVsOiBudWxsXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLmJ0bi1sZWZ0JzogICAnb25MZWZ0QnRuQ2xpY2snXG4gICAgICAndG91Y2hlbmQgLmJ0bi1yaWdodCc6ICAnb25SaWdodEJ0bkNsaWNrJ1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgdXBkYXRlIHRoZSBraXQgaWYgbm90IGFscmVhZHlcbiAgICMgc2V0IHZpYSBhIHByZXZpb3VzIHNlc3Npb25cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRraXRMYWJlbCA9IEAkZWwuZmluZCAnLmxhYmVsLWtpdCdcblxuICAgICAgaWYgQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKSBpcyBudWxsXG4gICAgICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEAka2l0TGFiZWwudGV4dCBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpLmdldCAnbGFiZWwnXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAgIyBzd2l0Y2hpbmcgZHJ1bSBraXRzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uQ2hhbmdlS2l0XG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuXG4gICBvbkxlZnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5wcmV2aW91c0tpdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuXG4gICBvblJpZ2h0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSBsYWJlbCBvbiB0aGVcbiAgICMga2l0IHNlbGVjdG9yXG5cbiAgIG9uQ2hhbmdlS2l0OiAobW9kZWwpIC0+XG4gICAgICBAa2l0TW9kZWwgPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsXG4gICAgICBAJGtpdExhYmVsLnRleHQgQGtpdE1vZGVsLmdldCAnbGFiZWwnXG5cblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdFNlbGVjdG9yIiwiIyMjKlxuICogU291bmQgdHlwZSBzZWxlY3RvciBmb3IgY2hvb3Npbmcgd2hpY2ggc291bmQgc2hvdWxkXG4gKiBwbGF5IG9uIGVhY2ggdHJhY2tcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBJbnN0cnVtZW50IGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIHZpZXcgY2xhc3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnaW5zdHJ1bWVudCdcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFJlZiB0byB0aGUgSW5zdHJ1bWVudE1vZGVsXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG5cbiAgIG1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIHBhcmVudCBraXRcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRNb2RlbDogbnVsbFxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQnOiAnb25DbGljaydcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBjbGljayBldmVudHMuICBVcGRhdGVzIHRoZSBjdXJyZW50IGluc3RydW1lbnQgbW9kZWwsIHdoaWNoXG4gICAjIEluc3RydW1lbnRTZWxlY3RvclBhbmVsIGxpc3RlbnMgdG8sIGFuZCBhZGRzIGEgc2VsZWN0ZWQgc3RhdGVcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGtpdE1vZGVsLnNldCAnY3VycmVudEluc3RydW1lbnQnLCBAbW9kZWxcbiAgICAgIEAkZWwuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudCIsIiMjIypcbiAqIFBhbmVsIHdoaWNoIGhvdXNlcyBlYWNoIGluZGl2aWR1YWwgc2VsZWN0YWJsZSBzb3VuZFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuSW5zdHJ1bWVudCAgPSByZXF1aXJlICcuL0luc3RydW1lbnQuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXBhbmVsLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCBleHRlbmRzIFZpZXdcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFJlZiB0byB0aGUgYXBwbGljYXRpb24gbW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIGtpdCBjb2xsZWN0aW9uXG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQga2l0XG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0TW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byBpbnN0cnVtZW50IHZpZXdzXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgaW5zdHJ1bWVudFZpZXdzOiBudWxsXG5cblxuXG5cbiAgICMgSW5pdGlhbGl6ZXMgdGhlIGluc3RydW1lbnQgc2VsZWN0b3IgYW5kIHNldHMgYSBsb2NhbCByZWZcbiAgICMgdG8gdGhlIGN1cnJlbnQga2l0IG1vZGVsIGZvciBlYXN5IGFjY2Vzc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQGtpdE1vZGVsID0gQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKVxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYXMgd2VsbCBhcyB0aGUgYXNzb2NpYXRlZCBraXQgaW5zdHJ1bWVudHNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRjb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItaW5zdHJ1bWVudHMnXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW5kZXJzIGVhY2ggaW5kaXZpZHVhbCBraXQgbW9kZWwgaW50byBhbiBJbnN0cnVtZW50XG5cbiAgIHJlbmRlckluc3RydW1lbnRzOiAtPlxuICAgICAgQGluc3RydW1lbnRWaWV3cyA9IFtdXG5cbiAgICAgIEBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuZWFjaCAobW9kZWwpID0+XG4gICAgICAgICBpbnN0cnVtZW50ID0gbmV3IEluc3RydW1lbnRcbiAgICAgICAgICAgIGtpdE1vZGVsOiBAa2l0TW9kZWxcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuXG4gICAgICAgICBAJGNvbnRhaW5lci5hcHBlbmQgaW5zdHJ1bWVudC5yZW5kZXIoKS5lbFxuICAgICAgICAgQGluc3RydW1lbnRWaWV3cy5wdXNoIGluc3RydW1lbnRcblxuXG5cblxuICAgIyBBZGRzIGV2ZW50IGxpc3RlbmVycyByZWxhdGVkIHRvIGtpdCBjaGFuZ2VzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uS2l0Q2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGtpdE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cblxuICAgIyBSZW1vdmVzIGV2ZW50IGxpc3RlbmVyc1xuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cblxuXG4gICAjIEVWRU5UIExJU1RFTkVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIENsZWFucyB1cCB0aGUgdmlldyBhbmQgcmUtcmVuZGVyc1xuICAgIyB0aGUgaW5zdHJ1bWVudHMgdG8gdGhlIERPTVxuICAgIyBAcGFyYW0ge0tpdE1vZGVsfSBtb2RlbFxuXG4gICBvbktpdENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQHJlbW92ZUV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQGtpdE1vZGVsID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbFxuXG4gICAgICBfLmVhY2ggQGluc3RydW1lbnRWaWV3cywgKGluc3RydW1lbnQpIC0+XG4gICAgICAgICBpbnN0cnVtZW50LnJlbW92ZSgpXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICBvbkluc3RydW1lbnRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEAkY29udGFpbmVyLmZpbmQoJy5pbnN0cnVtZW50JykucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuXG5cbiAgIG9uVGVzdENsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9J2NvbnRhaW5lci1pbnN0cnVtZW50cyc+XFxuXFxuPC9kaXY+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIjtcblxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9J2ljb24gXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmljb24pIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmljb247IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCInPjwvZGl2PlxcbjxkaXYgY2xhc3M9J2xhYmVsJz5cXG5cdFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCIjIyMqXG4gKiBJbmRpdmlkdWFsIHNlcXVlbmNlciB0cmFja3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3BhdHRlcm4tc3F1YXJlLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIGNvbnRhaW5lciBjbGFzc25hbWVcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAncGF0dGVybi1zcXVhcmUnXG5cblxuICAgIyBUaGUgRE9NIHRhZyBhbmVtXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHRhZ05hbWU6ICd0ZCdcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgVGhlIG1vZGVsIHdoaWNoIGNvbnRyb2xzIHZvbHVtZSwgcGxheWJhY2ssIGV0Y1xuICAgIyBAdHlwZSB7UGF0dGVyblNxdWFyZU1vZGVsfVxuICAgcGF0dGVyblNxdWFyZU1vZGVsOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCc6ICdvbkNsaWNrJ1xuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGFuZCBpbnN0YW50aWF0ZXMgdGhlIGhvd2xlciBhdWRpbyBlbmdpbmVcbiAgICMgQHBhdHRlcm5TcXVhcmVNb2RlbCB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIGF1ZGlvU3JjID0gQHBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ2luc3RydW1lbnQnKS5nZXQgJ3NyYydcblxuICAgICAgIyBUT0RPOiBUZXN0IG1ldGhvZHNcbiAgICAgIGlmIHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Rlc3QnKSBpc250IC0xIHRoZW4gYXVkaW9TcmMgPSAnJ1xuXG4gICAgICBAYXVkaW9QbGF5YmFjayA9IG5ldyBIb3dsXG4gICAgICAgICB2b2x1bWU6IEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLmxvd1xuICAgICAgICAgdXJsczogW2F1ZGlvU3JjXVxuICAgICAgICAgb25lbmQ6IEBvblNvdW5kRW5kXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW1vdmUgdGhlIHZpZXcgYW5kIGRlc3Ryb3kgdGhlIGF1ZGlvIHBsYXliYWNrXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIEBhdWRpb1BsYXliYWNrLnVubG9hZCgpXG4gICAgICBzdXBlcigpXG5cblxuXG5cbiAgICMgQWRkcyBldmVudCBsaXN0ZW5lcnMgYW5kIGJlZ2lucyBsaXN0ZW5pbmcgZm9yIHZlbG9jaXR5LCBhY3Rpdml0eSBhbmQgdHJpZ2dlcnNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1ZFTE9DSVRZLCBAb25WZWxvY2l0eUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9BQ1RJVkUsICAgQG9uQWN0aXZlQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1RSSUdHRVIsICBAb25UcmlnZ2VyQ2hhbmdlXG5cblxuXG5cbiAgICMgRW5hYmxlIHBsYXliYWNrIG9mIHRoZSBhdWRpbyBzcXVhcmVcblxuICAgZW5hYmxlOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5lbmFibGUoKVxuXG5cblxuXG4gICAjIERpc2FibGUgcGxheWJhY2sgb2YgdGhlIGF1ZGlvIHNxdWFyZVxuXG4gICBkaXNhYmxlOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5kaXNhYmxlKClcblxuXG5cblxuICAgIyBQbGF5YmFjayBhdWRpbyBvbiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgIHBsYXk6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjay5wbGF5KClcblxuICAgICAgVHdlZW5NYXgudG8gQCRlbCwgLjIsXG4gICAgICAgICBlYXNlOiBCYWNrLmVhc2VJblxuICAgICAgICAgc2NhbGU6IC41XG5cbiAgICAgICAgIG9uQ29tcGxldGU6ID0+XG5cbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEAkZWwsIC4yLFxuICAgICAgICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGNsaWNrIGV2ZW50cyBvbiB0aGUgYXVkaW8gc3F1YXJlLiAgVG9nZ2xlcyB0aGVcbiAgICMgdm9sdW1lIGZyb20gbG93IHRvIGhpZ2ggdG8gb2ZmXG5cbiAgIG9uQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuY3ljbGUoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHZlbG9jaXR5IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSB2aXN1YWwgZGlzcGxheSBhbmQgc2V0cyB2b2x1bWVcbiAgICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uVmVsb2NpdHlDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIHZlbG9jaXR5ID0gbW9kZWwuY2hhbmdlZC52ZWxvY2l0eVxuXG4gICAgICBAJGVsLnJlbW92ZUNsYXNzICd2ZWxvY2l0eS1sb3cgdmVsb2NpdHktbWVkaXVtIHZlbG9jaXR5LWhpZ2gnXG5cbiAgICAgICMgU2V0IHZpc3VhbCBpbmRpY2F0b3JcbiAgICAgIHZlbG9jaXR5Q2xhc3MgPSBzd2l0Y2ggdmVsb2NpdHlcbiAgICAgICAgIHdoZW4gMSB0aGVuICd2ZWxvY2l0eS1sb3cnXG4gICAgICAgICB3aGVuIDIgdGhlbiAndmVsb2NpdHktbWVkaXVtJ1xuICAgICAgICAgd2hlbiAzIHRoZW4gJ3ZlbG9jaXR5LWhpZ2gnXG4gICAgICAgICBlbHNlICcnXG5cbiAgICAgIEAkZWwuYWRkQ2xhc3MgdmVsb2NpdHlDbGFzc1xuXG5cbiAgICAgICMgU2V0IGF1ZGlvIHZvbHVtZVxuICAgICAgdm9sdW1lID0gc3dpdGNoIHZlbG9jaXR5XG4gICAgICAgICB3aGVuIDEgdGhlbiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5sb3dcbiAgICAgICAgIHdoZW4gMiB0aGVuIEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLm1lZGl1bVxuICAgICAgICAgd2hlbiAzIHRoZW4gQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMuaGlnaFxuICAgICAgICAgZWxzZSAnJ1xuXG4gICAgICBAYXVkaW9QbGF5YmFjay52b2x1bWUoIHZvbHVtZSApXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgYWN0aXZpdHkgY2hhbmdlIGV2ZW50cy4gIFdoZW4gaW5hY3RpdmUsIGNoZWNrcyBhZ2FpbnN0IHBsYXliYWNrIGFyZVxuICAgIyBub3QgcGVyZm9ybWVkIGFuZCB0aGUgc3F1YXJlIGlzIHNraXBwZWQuXG4gICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gICBvbkFjdGl2ZUNoYW5nZTogKG1vZGVsKSAtPlxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHRyaWdnZXIgXCJwbGF5YmFja1wiIGV2ZW50c1xuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25UcmlnZ2VyQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBpZiBtb2RlbC5jaGFuZ2VkLnRyaWdnZXIgaXMgdHJ1ZVxuICAgICAgICAgQHBsYXkoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHNvdW5kIHBsYXliYWNrIGVuZCBldmVudHMuICBSZW1vdmVzIHRoZSB0cmlnZ2VyXG4gICAjIGZsYWcgc28gdGhlIGF1ZGlvIHdvbid0IG92ZXJsYXBcblxuICAgb25Tb3VuZEVuZDogPT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlIiwiIyMjKlxuICogSW5kaXZpZHVhbCBzZXF1ZW5jZXIgdHJhY2tzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwRXZlbnQgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGF0dGVyblNxdWFyZSAgICAgICAgICAgPSByZXF1aXJlICcuL1BhdHRlcm5TcXVhcmUuY29mZmVlJ1xuVmlldyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3BhdHRlcm4tdHJhY2stdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFBhdHRlcm5UcmFjayBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBuYW1lIG9mIHRoZSBjbGFzc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdwYXR0ZXJuLXRyYWNrJ1xuXG5cbiAgICMgVGhlIHR5cGUgb2YgdGFnXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHRhZ05hbWU6ICd0cidcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgQSBjb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgdmlldyBzcXVhcmVzXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgcGF0dGVyblNxdWFyZVZpZXdzOiBudWxsXG5cblxuICAgIyBAdHlwZSB7UGF0dGVyblNxdWFyZUNvbGxlY3Rpb259XG4gICBjb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICAgbW9kZWw6IG51bGxcblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCAubGFiZWwtaW5zdHJ1bWVudCc6ICdvbkxhYmVsQ2xpY2snXG4gICAgICAndG91Y2hlbmQgLmJ0bi1tdXRlJzogICAgICAgICAnb25NdXRlQnRuQ2xpY2snXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBhbmQgcmVuZGVycyBvdXQgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRsYWJlbCA9IEAkZWwuZmluZCAnLmxhYmVsLWluc3RydW1lbnQnXG5cbiAgICAgIEByZW5kZXJQYXR0ZXJuU3F1YXJlcygpXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBBZGQgbGlzdGVuZXJzIHRvIHRoZSB2aWV3IHdoaWNoIGxpc3RlbiBmb3IgdmlldyBjaGFuZ2VzXG4gICAjIGFzIHdlbGwgYXMgY2hhbmdlcyB0byB0aGUgY29sbGVjdGlvbiwgd2hpY2ggc2hvdWxkIHVwZGF0ZVxuICAgIyBwYXR0ZXJuIHNxdWFyZXMgd2l0aG91dCByZS1yZW5kZXJpbmcgdGhlIHZpZXdzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGtpdE1vZGVsID0gQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKVxuXG4gICAgICBAbGlzdGVuVG8gQG1vZGVsLCAgICBBcHBFdmVudC5DSEFOR0VfRk9DVVMsICAgICAgQG9uRm9jdXNDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsICAgIEFwcEV2ZW50LkNIQU5HRV9NVVRFLCAgICAgICBAb25NdXRlQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGtpdE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cblxuXG4gICAjIFJlbmRlciBvdXQgdGhlIHBhdHRlcm4gc3F1YXJlcyBhbmQgcHVzaCB0aGVtIGludG8gYW4gYXJyYXlcbiAgICMgZm9yIGZ1cnRoZXIgaXRlcmF0aW9uXG5cbiAgIHJlbmRlclBhdHRlcm5TcXVhcmVzOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVWaWV3cyA9IFtdXG5cbiAgICAgIEBjb2xsZWN0aW9uID0gbmV3IFBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uXG5cbiAgICAgIF8oOCkudGltZXMgPT5cbiAgICAgICAgIEBjb2xsZWN0aW9uLmFkZCBuZXcgUGF0dGVyblNxdWFyZU1vZGVsIHsgaW5zdHJ1bWVudDogQG1vZGVsIH1cblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAobW9kZWwpID0+XG4gICAgICAgICBwYXR0ZXJuU3F1YXJlID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgICAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbW9kZWxcblxuICAgICAgICAgQCRsYWJlbC50ZXh0IG1vZGVsLmdldCAnbGFiZWwnXG4gICAgICAgICBAJGVsLmFwcGVuZCBwYXR0ZXJuU3F1YXJlLnJlbmRlcigpLmVsXG4gICAgICAgICBAcGF0dGVyblNxdWFyZVZpZXdzLnB1c2ggcGF0dGVyblNxdWFyZVxuXG4gICAgICAjIFNldCB0aGUgc3F1YXJlcyBvbiB0aGUgSW5zdHJ1bWVudCBtb2RlbCB0byB0cmFjayBhZ2FpbnN0IHN0YXRlXG4gICAgICBAbW9kZWwuc2V0ICdwYXR0ZXJuU3F1YXJlcycsIEBjb2xsZWN0aW9uXG5cblxuXG4gICAjIE11dGUgdGhlIGVudGlyZSB0cmFja1xuXG4gICBtdXRlOiAtPlxuICAgICAgQG1vZGVsLnNldCAnbXV0ZScsIHRydWVcblxuXG5cbiAgICMgVW5tdXRlIHRoZSBlbnRpcmUgdHJhY2tcblxuICAgdW5tdXRlOiAtPlxuICAgICAgQG1vZGVsLnNldCAnbXV0ZScsIGZhbHNlXG5cblxuXG4gICBzZWxlY3Q6IC0+XG4gICAgICBAJGVsLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG5cbiAgIGRlc2VsZWN0OiAtPlxuICAgICAgaWYgQCRlbC5oYXNDbGFzcyAnc2VsZWN0ZWQnXG4gICAgICAgICBAJGVsLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcblxuXG5cbiAgIGZvY3VzOiAtPlxuICAgICAgQCRlbC5hZGRDbGFzcyAnZm9jdXMnXG5cblxuXG5cbiAgIHVuZm9jdXM6IC0+XG4gICAgICBpZiBAJGVsLmhhc0NsYXNzICdmb2N1cydcbiAgICAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgJ2ZvY3VzJ1xuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGNoYW5nZXMgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBpbnN0cnVtZW50XG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBpbnN0cnVtZW50TW9kZWxcblxuICAgb25JbnN0cnVtZW50Q2hhbmdlOiAoaW5zdHJ1bWVudE1vZGVsKSA9PlxuICAgICAgaW5zdHJ1bWVudCA9IGluc3RydW1lbnRNb2RlbC5jaGFuZ2VkLmN1cnJlbnRJbnN0cnVtZW50XG5cbiAgICAgIGlmIGluc3RydW1lbnQuY2lkIGlzIEBtb2RlbC5jaWRcbiAgICAgICAgIEBzZWxlY3QoKVxuXG4gICAgICBlbHNlIEBkZXNlbGVjdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBtb2RlbCBjaGFuZ2UgZXZlbnRzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbk11dGVDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIG11dGUgPSBtb2RlbC5jaGFuZ2VkLm11dGVcblxuICAgICAgaWYgbXV0ZVxuICAgICAgICAgQCRlbC5hZGRDbGFzcyAnbXV0ZSdcblxuICAgICAgZWxzZSBAJGVsLnJlbW92ZUNsYXNzICdtdXRlJ1xuXG5cblxuICAgIyBIYW5kbGVyIGZvciBmb2N1cyBjaGFuZ2UgZXZlbnRzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbkZvY3VzQ2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBpZiBtb2RlbC5jaGFuZ2VkLmZvY3VzXG4gICAgICAgICAgQGZvY3VzKClcbiAgICAgIGVsc2VcbiAgICAgICAgICBAdW5mb2N1cygpXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgYnV0dG9uIGNsaWNrc1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25MYWJlbENsaWNrOiAoZXZlbnQpID0+XG4gICAgICBAbW9kZWwuc2V0ICdmb2N1cycsICEgQG1vZGVsLmdldCgnZm9jdXMnKVxuXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBidXR0b24gY2xpY2tzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbk11dGVCdG5DbGljazogKGV2ZW50KSA9PlxuICAgICAgaWYgQG1vZGVsLmdldCAnbXV0ZSdcbiAgICAgICAgIEB1bm11dGUoKVxuXG4gICAgICBlbHNlIEBtdXRlKClcblxuXG5cblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5UcmFjayIsIiMjIypcbiAqIFNlcXVlbmNlciBwYXJlbnQgdmlldyBmb3IgdHJhY2sgc2VxdWVuY2VzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuUGF0dGVyblRyYWNrID0gcmVxdWlyZSAnLi9QYXR0ZXJuVHJhY2suY29mZmVlJ1xuQXBwRXZlbnQgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbmhlbHBlcnMgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2hlbHBlcnMvaGFuZGxlYmFycy1oZWxwZXJzJ1xudGVtcGxhdGUgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2VxdWVuY2VyLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBTZXF1ZW5jZXIgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgbmFtZSBvZiB0aGUgY29udGFpbmVyIGNsYXNzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3NlcXVlbmNlci1jb250YWluZXInXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIEFuIGFycmF5IG9mIGFsbCBwYXR0ZXJuIHRyYWNrc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBwYXR0ZXJuVHJhY2tWaWV3czogbnVsbFxuXG5cbiAgICMgVGhlIHNldEludGVydmFsIHRpY2tlclxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBicG1JbnRlcnZhbDogbnVsbFxuXG5cbiAgICMgVGhlIHRpbWUgaW4gd2hpY2ggdGhlIGludGVydmFsIGZpcmVzXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIHVwZGF0ZUludGVydmFsVGltZTogMjAwXG5cblxuICAgIyBUaGUgY3VycmVudCBiZWF0IGlkXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGN1cnJCZWF0Q2VsbElkOiAtMVxuXG5cbiAgICMgVE9ETzogVXBkYXRlIHRoaXMgdG8gbWFrZSBpdCBtb3JlIGR5bmFtaWNcbiAgICMgVGhlIG51bWJlciBvZiBiZWF0IGNlbGxzXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIG51bUNlbGxzOiA3XG5cblxuICAgIyBHbG9iYWwgYXBwbGljYXRpb24gbW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgQ29sbGVjdGlvbiBvZiBpbnN0cnVtZW50c1xuICAgIyBAdHlwZSB7SW5zdHJ1bWVudENvbGxlY3Rpb259XG5cbiAgIGNvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIEFuIGFycmF5IG9mIGFsbCBzb3VuZHMgZXh0cmFjdGVkIGZyb20gdGhlIGN1cnJlbnQgSW5zdHJ1bWVudENvbGxlY3Rpb25cbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBzb3VuZEFycmF5OiBudWxsXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9XG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkdGhTdGVwcGVyID0gQCRlbC5maW5kICd0aC5zdGVwcGVyJ1xuICAgICAgQCRzZXF1ZW5jZXIgPSBAJGVsLmZpbmQgJy5zZXF1ZW5jZXInXG5cbiAgICAgIEByZW5kZXJUcmFja3MoKVxuICAgICAgQHBsYXkoKVxuXG4gICAgICBAXG5cblxuICAgIyBSZW1vdmVzIHRoZSB2aWV3IGZyb20gdGhlIERPTSBhbmQgY2FuY2Vsc1xuICAgIyB0aGUgdGlja2VyIGludGVydmFsXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIHN1cGVyKClcbiAgICAgIEBwYXVzZSgpXG5cblxuXG4gICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRsaW5nIGluc3RydW1lbnQgYW5kIHBsYXliYWNrXG4gICAjIGNoYW5nZXMuICBVcGRhdGVzIGFsbCBvZiB0aGUgdmlld3MgYWNjb3JkaW5nbHlcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfQlBNLCBAb25CUE1DaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9QTEFZSU5HLCBAb25QbGF5aW5nQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfS0lULCBAb25LaXRDaGFuZ2VcblxuICAgICAgQGxpc3RlblRvIEBjb2xsZWN0aW9uLCBBcHBFdmVudC5DSEFOR0VfRk9DVVMsIEBvbkNoYW5nZUZvY3VzXG5cblxuXG4gICAjIFJlbmRlcnMgb3V0IGVhY2ggaW5kaXZpZHVhbCB0cmFjay5cbiAgICMgVE9ETzogTmVlZCB0byB1cGRhdGUgc28gdGhhdCBhbGwgb2YgdGhlIGJlYXQgc3F1YXJlcyBhcmVuJ3RcbiAgICMgYmxvd24gYXdheSBieSB0aGUgcmUtcmVuZGVyXG5cbiAgIHJlbmRlclRyYWNrczogPT5cbiAgICAgIEAkZWwuZmluZCgnLnBhdHRlcm4tdHJhY2snKS5yZW1vdmUoKVxuXG4gICAgICBAcGF0dGVyblRyYWNrVmlld3MgPSBbXVxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChtb2RlbCkgPT5cblxuICAgICAgICAgcGF0dGVyblRyYWNrID0gbmV3IFBhdHRlcm5UcmFja1xuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgICAgY29sbGVjdGlvbjogbW9kZWwuZ2V0ICdwYXR0ZXJuU3F1YXJlcydcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuXG4gICAgICAgICBAcGF0dGVyblRyYWNrVmlld3MucHVzaCBwYXR0ZXJuVHJhY2tcbiAgICAgICAgIEAkc2VxdWVuY2VyLmFwcGVuZCBwYXR0ZXJuVHJhY2sucmVuZGVyKCkuZWxcblxuXG5cblxuICAgIyBVcGRhdGUgdGhlIHRpY2tlciB0aW1lLCBhbmQgYWR2YW5jZXMgdGhlIGJlYXRcblxuICAgdXBkYXRlVGltZTogPT5cbiAgICAgIEAkdGhTdGVwcGVyLnJlbW92ZUNsYXNzICdzdGVwJ1xuICAgICAgQGN1cnJCZWF0Q2VsbElkID0gaWYgQGN1cnJCZWF0Q2VsbElkIDwgQG51bUNlbGxzIHRoZW4gQGN1cnJCZWF0Q2VsbElkICs9IDEgZWxzZSBAY3VyckJlYXRDZWxsSWQgPSAwXG4gICAgICAkKEAkdGhTdGVwcGVyW0BjdXJyQmVhdENlbGxJZF0pLmFkZENsYXNzICdzdGVwJ1xuXG4gICAgICBAcGxheUF1ZGlvKClcblxuXG5cblxuICAgIyBDb252ZXJ0cyBtaWxsaXNlY29uZHMgdG8gQlBNXG5cbiAgIGNvbnZlcnRCUE06IC0+XG4gICAgICByZXR1cm4gMjAwXG5cblxuXG4gICAjIFN0YXJ0IHBsYXliYWNrIG9mIHNlcXVlbmNlclxuXG4gICBwbGF5OiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAncGxheWluZycsIHRydWVcblxuXG5cblxuICAgIyBQYXVzZXMgc2VxdWVuY2VyIHBsYXliYWNrXG5cbiAgIHBhdXNlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAncGxheWluZycsIGZhbHNlXG5cblxuXG5cbiAgICMgTXV0ZXMgdGhlIHNlcXVlbmNlclxuXG4gICBtdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAnbXV0ZScsIHRydWVcblxuXG5cblxuICAgIyBVbm11dGVzIHRoZSBzZXF1ZW5jZXJcblxuICAgdW5tdXRlOiAtPlxuICAgICAgIEBhcHBNb2RlbC5zZXQgJ211dGUnLCBmYWxzZVxuXG5cblxuXG5cbiAgICMgUGxheXMgYXVkaW8gb2YgZWFjaCB0cmFjayBjdXJyZW50bHkgZW5hYmxlZCBhbmQgb25cblxuICAgcGxheUF1ZGlvOiAtPlxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAoaW5zdHJ1bWVudCkgPT5cblxuICAgICAgICAgaW5zdHJ1bWVudC5nZXQoJ3BhdHRlcm5TcXVhcmVzJykuZWFjaCAocGF0dGVyblNxdWFyZSwgaW5kZXgpID0+XG5cbiAgICAgICAgICAgIGlmIEBjdXJyQmVhdENlbGxJZCBpcyBpbmRleFxuICAgICAgICAgICAgICAgaWYgcGF0dGVyblNxdWFyZS5nZXQgJ2FjdGl2ZSdcbiAgICAgICAgICAgICAgICAgIHBhdHRlcm5TcXVhcmUuc2V0ICd0cmlnZ2VyJywgdHJ1ZVxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIEJQTSB0ZW1wbyBjaGFuZ2VzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uQlBNQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBjbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuICAgICAgQHVwZGF0ZUludGVydmFsVGltZSA9IG1vZGVsLmNoYW5nZWQuYnBtXG4gICAgICBAYnBtSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAdXBkYXRlVGltZSwgQHVwZGF0ZUludGVydmFsVGltZVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHBsYXliYWNrIGNoYW5nZXMuICBJZiBwYXVzZWQsIGl0IHN0b3BzIHBsYXliYWNrIGFuZFxuICAgIyBjbGVhcnMgdGhlIGludGVydmFsLiAgSWYgcGxheWluZywgaXQgcmVzZXRzIGl0XG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uUGxheWluZ0NoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgcGxheWluZyA9IG1vZGVsLmNoYW5nZWQucGxheWluZ1xuXG4gICAgICBpZiBwbGF5aW5nXG4gICAgICAgICBAYnBtSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAdXBkYXRlVGltZSwgQHVwZGF0ZUludGVydmFsVGltZVxuXG4gICAgICBlbHNlXG4gICAgICAgICBjbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuICAgICAgICAgQGJwbUludGVydmFsID0gbnVsbFxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgYW5kIHVubXV0ZSBjaGFuZ2VzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uTXV0ZUNoYW5nZTogKG1vZGVsKSA9PlxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2VzLCBhcyBzZXQgZnJvbSB0aGUgS2l0U2VsZWN0b3JcbiAgICMgQHBhcmFtIHtLaXRNb2RlbH0gbW9kZWxcblxuICAgb25LaXRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEBjb2xsZWN0aW9uID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJylcbiAgICAgIEByZW5kZXJUcmFja3MoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2VzLCBhcyBzZXQgZnJvbSB0aGUgS2l0U2VsZWN0b3JcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uRm9jdXNDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIGNvbnNvbGUubG9nIG1vZGVsLmNoYW5nZWQuZm9jdXNcblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZXF1ZW5jZXIiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIjtcblxuXG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cblxuICBidWZmZXIgKz0gXCI8dGQgY2xhc3M9J2xhYmVsLWluc3RydW1lbnQnPlxcblx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXG48L3RkPlxcbjx0ZCBjbGFzcz0nYnRuLW11dGUnPlxcblx0bXV0ZVxcbjwvdGQ+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc3RhY2syLCBvcHRpb25zLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblx0XHRcdDx0aCBjbGFzcz0nc3RlcHBlcic+PC90aD5cXG5cdFx0XCI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8dGFibGUgY2xhc3M9J3NlcXVlbmNlcic+XFxuXHQ8dHI+XFxuXHRcdDx0aD48L3RoPlxcblx0XHQ8dGg+PC90aD5cXG5cXG5cdFx0XCI7XG4gIG9wdGlvbnMgPSB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX07XG4gIHN0YWNrMiA9ICgoc3RhY2sxID0gaGVscGVycy5yZXBlYXQgfHwgZGVwdGgwLnJlcGVhdCksc3RhY2sxID8gc3RhY2sxLmNhbGwoZGVwdGgwLCA4LCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwicmVwZWF0XCIsIDgsIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC90cj5cXG5cXG48L3RhYmxlPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWRlY3JlYXNlJz5ERUNSRUFTRTwvYnV0dG9uPlxcbjxzcGFuIGNsYXNzPSdsYWJlbC1icG0nPjA8L3NwYW4+XFxuPGJ1dHRvbiBjbGFzcz0nYnRuLWluY3JlYXNlJz5JTkNSRUFTRTwvYnV0dG9uPlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWxlZnQnPkxFRlQ8L2J1dHRvbj5cXG48c3BhbiBjbGFzcz0nbGFiZWwta2l0Jz5EUlVNIEtJVDwvc3Bhbj5cXG48YnV0dG9uIGNsYXNzPSdidG4tcmlnaHQnPlJJR0hUPC9idXR0b24+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdjb250YWluZXIta2l0LXNlbGVjdG9yJz5cXG5cdDxkaXYgY2xhc3M9J2tpdC1zZWxlY3Rvcic+PC9kaXY+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLXZpc3VhbGl6YXRpb24nPlZpc3VhbGl6YXRpb248L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPSdjb250YWluZXItc2VxdWVuY2VyJz5cXG5cXG5cdDxkaXYgY2xhc3M9J2luc3RydW1lbnQtc2VsZWN0b3InPkluc3RydW1lbnQgU2VsZWN0b3I8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J3NlcXVlbmNlcic+U2VxdWVuY2VyPC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPSdicG0nPkJQTTwvZGl2Plxcblx0PGRpdiBjbGFzcz0nYnRuLXNoYXJlJz5TSEFSRTwvZGl2PlxcblxcbjwvZGl2PlwiO1xuICB9KSIsIiMjIypcbiAqIExhbmRpbmcgdmlldyB3aXRoIHN0YXJ0IGJ1dHRvbiBhbmQgaW5pdGlhbCBhbmltYXRpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5QdWJTdWIgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL1B1YlN1YidcblB1YkV2ZW50ID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9sYW5kaW5nLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBMYW5kaW5nVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLnN0YXJ0LWJ0bic6ICdvblN0YXJ0QnRuQ2xpY2snXG5cblxuICAgb25TdGFydEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBQdWJTdWIudHJpZ2dlciBQdWJFdmVudC5ST1VURSxcbiAgICAgICAgIHJvdXRlOiAnY3JlYXRlJ1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYW5kaW5nVmlldyIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPHNwYW4gY2xhc3M9J3N0YXJ0LWJ0bic+Q1JFQVRFPC9zcGFuPlwiO1xuICB9KSIsIiMjIypcbiAqIFNoYXJlIHRoZSB1c2VyIGNyZWF0ZWQgYmVhdFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zaGFyZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgU2hhcmVWaWV3IGV4dGVuZHMgVmlld1xuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gU2hhcmVWaWV3IiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8YSBocmVmPScvIyc+TkVXPC9hPlwiO1xuICB9KSIsIiMjIypcbiAqIExhbmRpbmcgdmlldyB3aXRoIHN0YXJ0IGJ1dHRvbiBhbmQgaW5pdGlhbCBhbmltYXRpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZXN0cy10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgVGVzdHNWaWV3IGV4dGVuZHMgVmlld1xuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RzVmlldyIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGgxPkNvbXBvbmVudCBWaWV3ZXI8L2gxPlxcblxcbjxiciAvPlxcbjxwPlxcblx0TWFrZSBzdXJlIHRoYXQgPGI+aHR0cHN0ZXI8L2I+IGlzIHJ1bm5pbmcgaW4gdGhlIDxiPnNvdXJjZTwvYj4gcm91dGUgKG5wbSBpbnN0YWxsIC1nIGh0dHBzdGVyKSA8YnIvPlxcblx0PGEgaHJlZj1cXFwiaHR0cDovL2xvY2FsaG9zdDozMzMzL3Rlc3QvaHRtbC9cXFwiPk1vY2hhIFRlc3QgUnVubmVyPC9hPlxcbjwvcD5cXG5cXG48YnIgLz5cXG48dWw+XFxuXHQ8bGk+PGEgaHJlZj0nI2tpdC1zZWxlY3Rpb24nPktpdCBTZWxlY3Rpb248L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjYnBtLWluZGljYXRvclxcXCI+QlBNIEluZGljYXRvcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNpbnN0cnVtZW50LXNlbGVjdG9yXFxcIj5JbnN0cnVtZW50IFNlbGVjdG9yPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI3BhdHRlcm4tc3F1YXJlXFxcIj5QYXR0ZXJuIFNxdWFyZTwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNwYXR0ZXJuLXRyYWNrXFxcIj5QYXR0ZXJuIFRyYWNrPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI3NlcXVlbmNlclxcXCI+U2VxdWVuY2VyPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2Z1bGwtc2VxdWVuY2VyXFxcIj5GdWxsIFNlcXVlbmNlcjwvYT48L2xpPlxcbjwvdWw+XCI7XG4gIH0pIl19

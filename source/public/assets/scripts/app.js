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
var PadSquareCollection, PadSquareModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PadSquareModel = require('./PadSquareModel.coffee');

PadSquareCollection = (function(_super) {
  __extends(PadSquareCollection, _super);

  function PadSquareCollection() {
    return PadSquareCollection.__super__.constructor.apply(this, arguments);
  }

  PadSquareCollection.prototype.model = PadSquareModel;

  return PadSquareCollection;

})(Backbone.Collection);

module.exports = PadSquareCollection;


},{"./PadSquareModel.coffee":17}],17:[function(require,module,exports){

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
    'playing': false,
    'instrument': null
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
    view = new PadSquare({
      appModel: this.appModel
    });
    return this.appModel.set('view', view);
  };

  AppRouter.prototype.livePadRoute = function() {
    var view;
    view = new LivePad({
      appModel: this.appModel
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
var LivePad, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('../../../../supers/View.coffee');

template = require('./templates/live-pad-template.hbs');

LivePad = (function(_super) {
  __extends(LivePad, _super);

  function LivePad() {
    return LivePad.__super__.constructor.apply(this, arguments);
  }

  LivePad.prototype.template = template;

  return LivePad;

})(View);

module.exports = LivePad;


},{"../../../../supers/View.coffee":23,"./templates/live-pad-template.hbs":35}],34:[function(require,module,exports){

/**
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
 */
var PadSquare, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('../../../../supers/View.coffee');

template = require('./templates/pad-square-template.hbs');

PadSquare = (function(_super) {
  __extends(PadSquare, _super);

  function PadSquare() {
    this.onClick = __bind(this.onClick, this);
    return PadSquare.__super__.constructor.apply(this, arguments);
  }

  PadSquare.prototype.tagName = 'td';

  PadSquare.prototype.className = 'pad-square';

  PadSquare.prototype.template = template;

  PadSquare.prototype.events = {
    'touchend': 'onClick'
  };

  PadSquare.prototype.setSound = function() {};

  PadSquare.prototype.removeSound = function() {};

  PadSquare.prototype.onClick = function(event) {};

  PadSquare.prototype.onDrag = function(event) {};

  PadSquare.prototype.onDrop = function(event) {};

  return PadSquare;

})(View);

module.exports = PadSquare;


},{"../../../../supers/View.coffee":23,"./templates/pad-square-template.hbs":36}],35:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "Live Pad view";
  })
},{"handleify":5}],36:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='key-code'>\n	key code\n</div>";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2RpZ2l0cy9pbmRleC5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L3J1bnRpbWUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2luaXRpYWxpemUuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9MaXZlUGFkTW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlTW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3JvdXRlcnMvQXBwUm91dGVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3N1cGVycy9WaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3V0aWxzL1B1YlN1Yi5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3V0aWxzL1RvdWNoLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvdGVtcGxhdGVzL2luc3RydW1lbnQtcGFuZWwtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvdGVtcGxhdGVzL2luc3RydW1lbnQtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL0xpdmVQYWQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL1BhZFNxdWFyZS5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvdGVtcGxhdGVzL2xpdmUtcGFkLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC90ZW1wbGF0ZXMvcGFkLXNxdWFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9wYXR0ZXJuLXNxdWFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3BhdHRlcm4tdHJhY2stdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9zZXF1ZW5jZXItdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvdGVtcGxhdGVzL2JwbS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy90ZW1wbGF0ZXMva2l0LXNlbGVjdGlvbi10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvdGVtcGxhdGVzL2NyZWF0ZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvdGVtcGxhdGVzL2xhbmRpbmctdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL3RlbXBsYXRlcy9zaGFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy90ZXN0cy9UZXN0c1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvdGVzdHMvdGVzdHMtdGVtcGxhdGUuaGJzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFBLElBT0EsR0FBVyxPQUFBLENBQVEsMEJBQVIsQ0FQWCxDQUFBOztBQUFBLFFBUUEsR0FBVyxPQUFBLENBQVEsc0JBQVIsQ0FSWCxDQUFBOztBQUFBO0FBYUcsOEJBQUEsQ0FBQTs7OztHQUFBOztBQUFBLHNCQUFBLFFBQUEsR0FBVSxRQUFWLENBQUE7O21CQUFBOztHQUZxQixLQVh4QixDQUFBOztBQUFBLE1BZ0JNLENBQUMsT0FBUCxHQUFpQixTQWhCakIsQ0FBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogZGlnaXRzXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMgSm9uIFNjaGxpbmtlcnRcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQYWQgbnVtYmVycyB3aXRoIHplcm9zLlxuICogQXV0b21hdGljYWxseSBwYWQgdGhlIG51bWJlciBvZiBkaWdpdHMgYmFzZWQgb24gdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXksXG4gKiBvciBleHBsaWNpdGx5IHBhc3MgaW4gdGhlIG51bWJlciBvZiBkaWdpdHMgdG8gdXNlLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gbnVtICBUaGUgbnVtYmVyIHRvIHBhZC5cbiAqIEBwYXJhbSAge09iamVjdH0gb3B0cyBPcHRpb25zIG9iamVjdCB3aXRoIGBkaWdpdHNgIGFuZCBgYXV0b2AgcHJvcGVydGllcy5cbiAqICAgIHtcbiAqICAgICAgYXV0bzogYXJyYXkubGVuZ3RoIC8vIHBhc3MgaW4gdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXlcbiAqICAgICAgZGlnaXRzOiA0ICAgICAgICAgIC8vIG9yIHBhc3MgaW4gdGhlIG51bWJlciBvZiBkaWdpdHMgdG8gdXNlXG4gKiAgICB9XG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgVGhlIHBhZGRlZCBudW1iZXIgd2l0aCB6ZXJvcyBwcmVwZW5kZWRcbiAqXG4gKiBAZXhhbXBsZXM6XG4gKiAgMSAgICAgID0+IDAwMDAwMVxuICogIDEwICAgICA9PiAwMDAwMTBcbiAqICAxMDAgICAgPT4gMDAwMTAwXG4gKiAgMTAwMCAgID0+IDAwMTAwMFxuICogIDEwMDAwICA9PiAwMTAwMDBcbiAqICAxMDAwMDAgPT4gMTAwMDAwXG4gKi9cblxuZXhwb3J0cy5wYWQgPSBmdW5jdGlvbiAobnVtLCBvcHRzKSB7XG4gIHZhciBkaWdpdHMgPSBvcHRzLmRpZ2l0cyB8fCAzO1xuICBpZihvcHRzLmF1dG8gJiYgdHlwZW9mIG9wdHMuYXV0byA9PT0gJ251bWJlcicpIHtcbiAgICBkaWdpdHMgPSBTdHJpbmcob3B0cy5hdXRvKS5sZW5ndGg7XG4gIH1cbiAgdmFyIGxlbkRpZmYgPSBkaWdpdHMgLSBTdHJpbmcobnVtKS5sZW5ndGg7XG4gIHZhciBwYWRkaW5nID0gJyc7XG4gIGlmIChsZW5EaWZmID4gMCkge1xuICAgIHdoaWxlIChsZW5EaWZmLS0pIHtcbiAgICAgIHBhZGRpbmcgKz0gJzAnO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFkZGluZyArIG51bTtcbn07XG5cbi8qKlxuICogU3RyaXAgbGVhZGluZyBkaWdpdHMgZnJvbSBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyBmcm9tIHdoaWNoIHRvIHN0cmlwIGRpZ2l0c1xuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICovXG5cbmV4cG9ydHMuc3RyaXBsZWZ0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxcZCtcXC0/L2csICcnKTtcbn07XG5cbi8qKlxuICogU3RyaXAgdHJhaWxpbmcgZGlnaXRzIGZyb20gYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgZnJvbSB3aGljaCB0byBzdHJpcCBkaWdpdHNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqL1xuXG5leHBvcnRzLnN0cmlwcmlnaHQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXC0/XFxkKyQvZywgJycpO1xufTtcblxuLyoqXG4gKiBDb3VudCBkaWdpdHMgb24gdGhlIGxlZnQgc2lkZSBvZiBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB3aXRoIGRpZ2l0cyB0byBjb3VudFxuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICogQGV4YW1wbGVcbiAqICBcIjAwMS1mb28ubWRcIiA9PiAzXG4gKi9cblxuZXhwb3J0cy5jb3VudGxlZnQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIFN0cmluZyhzdHIubWF0Y2goL15cXGQrL2cpKS5sZW5ndGg7XG59O1xuXG4vKipcbiAqIENvdW50IGRpZ2l0cyBvbiB0aGUgcmlnaHQgc2lkZSBvZiBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB3aXRoIGRpZ2l0cyB0byBjb3VudFxuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICogQGV4YW1wbGVcbiAqICBcIjAwMS1mb28ubWRcIiA9PiAzXG4gKi9cblxuZXhwb3J0cy5jb3VudHJpZ2h0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyLm1hdGNoKC9cXGQrJC9nKSkubGVuZ3RoO1xufTsiLCIvKmpzaGludCBlcW51bGw6IHRydWUgKi9cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG5cbnZhciBIYW5kbGViYXJzID0ge307XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbkhhbmRsZWJhcnMuVkVSU0lPTiA9IFwiMS4wLjBcIjtcbkhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT04gPSA0O1xuXG5IYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPj0gMS4wLjAnXG59O1xuXG5IYW5kbGViYXJzLmhlbHBlcnMgID0ge307XG5IYW5kbGViYXJzLnBhcnRpYWxzID0ge307XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgZnVuY3Rpb25UeXBlID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgPSBmdW5jdGlvbihuYW1lLCBmbiwgaW52ZXJzZSkge1xuICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgIGlmIChpbnZlcnNlIHx8IGZuKSB7IHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbnZlcnNlKSB7IGZuLm5vdCA9IGludmVyc2U7IH1cbiAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgPSBmdW5jdGlvbihuYW1lLCBzdHIpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLnBhcnRpYWxzLCAgbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHN0cjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGFyZykge1xuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGhlbHBlcjogJ1wiICsgYXJnICsgXCInXCIpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYmxvY2tIZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSB8fCBmdW5jdGlvbigpIHt9LCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuXG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbih0aGlzKTtcbiAgfSBlbHNlIGlmKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgaWYoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZm4oY29udGV4dCk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLksgPSBmdW5jdGlvbigpIHt9O1xuXG5IYW5kbGViYXJzLmNyZWF0ZUZyYW1lID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbihvYmplY3QpIHtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG9iamVjdDtcbiAgdmFyIG9iaiA9IG5ldyBIYW5kbGViYXJzLksoKTtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG51bGw7XG4gIHJldHVybiBvYmo7XG59O1xuXG5IYW5kbGViYXJzLmxvZ2dlciA9IHtcbiAgREVCVUc6IDAsIElORk86IDEsIFdBUk46IDIsIEVSUk9SOiAzLCBsZXZlbDogMyxcblxuICBtZXRob2RNYXA6IHswOiAnZGVidWcnLCAxOiAnaW5mbycsIDI6ICd3YXJuJywgMzogJ2Vycm9yJ30sXG5cbiAgLy8gY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgb2JqKSB7XG4gICAgaWYgKEhhbmRsZWJhcnMubG9nZ2VyLmxldmVsIDw9IGxldmVsKSB7XG4gICAgICB2YXIgbWV0aG9kID0gSGFuZGxlYmFycy5sb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5IYW5kbGViYXJzLmxvZyA9IGZ1bmN0aW9uKGxldmVsLCBvYmopIHsgSGFuZGxlYmFycy5sb2dnZXIubG9nKGxldmVsLCBvYmopOyB9O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdlYWNoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgZm4gPSBvcHRpb25zLmZuLCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlO1xuICB2YXIgaSA9IDAsIHJldCA9IFwiXCIsIGRhdGE7XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICBkYXRhID0gSGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICB9XG5cbiAgaWYoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICBpZihjb250ZXh0IGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgZm9yKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGk8ajsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhKSB7IGRhdGEuaW5kZXggPSBpOyB9XG4gICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbaV0sIHsgZGF0YTogZGF0YSB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICBpZihjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBpZihkYXRhKSB7IGRhdGEua2V5ID0ga2V5OyB9XG4gICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtrZXldLCB7ZGF0YTogZGF0YX0pO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmKGkgPT09IDApe1xuICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbmRpdGlvbmFsKTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKCFjb25kaXRpb25hbCB8fCBIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29uZGl0aW9uYWwpKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHJldHVybiBIYW5kbGViYXJzLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm59KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYgKCFIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICBIYW5kbGViYXJzLmxvZyhsZXZlbCwgY29udGV4dCk7XG59KTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZNID0ge1xuICB0ZW1wbGF0ZTogZnVuY3Rpb24odGVtcGxhdGVTcGVjKSB7XG4gICAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgICB2YXIgY29udGFpbmVyID0ge1xuICAgICAgZXNjYXBlRXhwcmVzc2lvbjogSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgICAgaW52b2tlUGFydGlhbDogSGFuZGxlYmFycy5WTS5pbnZva2VQYXJ0aWFsLFxuICAgICAgcHJvZ3JhbXM6IFtdLFxuICAgICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXTtcbiAgICAgICAgaWYoZGF0YSkge1xuICAgICAgICAgIHByb2dyYW1XcmFwcGVyID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuLCBkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSBIYW5kbGViYXJzLlZNLnByb2dyYW0oaSwgZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICAgIH0sXG4gICAgICBtZXJnZTogZnVuY3Rpb24ocGFyYW0sIGNvbW1vbikge1xuICAgICAgICB2YXIgcmV0ID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICAgIGlmIChwYXJhbSAmJiBjb21tb24pIHtcbiAgICAgICAgICByZXQgPSB7fTtcbiAgICAgICAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZChyZXQsIGNvbW1vbik7XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBwYXJhbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0sXG4gICAgICBwcm9ncmFtV2l0aERlcHRoOiBIYW5kbGViYXJzLlZNLnByb2dyYW1XaXRoRGVwdGgsXG4gICAgICBub29wOiBIYW5kbGViYXJzLlZNLm5vb3AsXG4gICAgICBjb21waWxlckluZm86IG51bGxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlU3BlYy5jYWxsKGNvbnRhaW5lciwgSGFuZGxlYmFycywgY29udGV4dCwgb3B0aW9ucy5oZWxwZXJzLCBvcHRpb25zLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEpO1xuXG4gICAgICB2YXIgY29tcGlsZXJJbmZvID0gY29udGFpbmVyLmNvbXBpbGVySW5mbyB8fCBbXSxcbiAgICAgICAgICBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICAgICAgY3VycmVudFJldmlzaW9uID0gSGFuZGxlYmFycy5DT01QSUxFUl9SRVZJU0lPTjtcblxuICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IEhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrcnVudGltZVZlcnNpb25zK1wiKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKFwiK2NvbXBpbGVyVmVyc2lvbnMrXCIpLlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgICAgIHRocm93IFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJJbmZvWzFdK1wiKS5cIjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH0sXG5cbiAgcHJvZ3JhbVdpdGhEZXB0aDogZnVuY3Rpb24oaSwgZm4sIGRhdGEgLyosICRkZXB0aCAqLykge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcblxuICAgIHZhciBwcm9ncmFtID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBbY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGFdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgICBwcm9ncmFtLnByb2dyYW0gPSBpO1xuICAgIHByb2dyYW0uZGVwdGggPSBhcmdzLmxlbmd0aDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGEpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gMDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgbm9vcDogZnVuY3Rpb24oKSB7IHJldHVybiBcIlwiOyB9LFxuICBpbnZva2VQYXJ0aWFsOiBmdW5jdGlvbihwYXJ0aWFsLCBuYW1lLCBjb250ZXh0LCBoZWxwZXJzLCBwYXJ0aWFscywgZGF0YSkge1xuICAgIHZhciBvcHRpb25zID0geyBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcblxuICAgIGlmKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuICAgIH0gZWxzZSBpZihwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAoIUhhbmRsZWJhcnMuY29tcGlsZSkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydGlhbHNbbmFtZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUocGFydGlhbCwge2RhdGE6IGRhdGEgIT09IHVuZGVmaW5lZH0pO1xuICAgICAgcmV0dXJuIHBhcnRpYWxzW25hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy50ZW1wbGF0ZSA9IEhhbmRsZWJhcnMuVk0udGVtcGxhdGU7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcblxufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbkhhbmRsZWJhcnMuRXhjZXB0aW9uID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG59O1xuSGFuZGxlYmFycy5FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbi8vIEJ1aWxkIG91dCBvdXIgYmFzaWMgU2FmZVN0cmluZyB0eXBlXG5IYW5kbGViYXJzLlNhZmVTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59O1xuSGFuZGxlYmFycy5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJpbmcudG9TdHJpbmcoKTtcbn07XG5cbnZhciBlc2NhcGUgPSB7XG4gIFwiJlwiOiBcIiZhbXA7XCIsXG4gIFwiPFwiOiBcIiZsdDtcIixcbiAgXCI+XCI6IFwiJmd0O1wiLFxuICAnXCInOiBcIiZxdW90O1wiLFxuICBcIidcIjogXCImI3gyNztcIixcbiAgXCJgXCI6IFwiJiN4NjA7XCJcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZztcbnZhciBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG52YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl0gfHwgXCImYW1wO1wiO1xufTtcblxuSGFuZGxlYmFycy5VdGlscyA9IHtcbiAgZXh0ZW5kOiBmdW5jdGlvbihvYmosIHZhbHVlKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICAgIGlmKHZhbHVlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWx1ZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBlc2NhcGVFeHByZXNzaW9uOiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyBpbnN0YW5jZW9mIEhhbmRsZWJhcnMuU2FmZVN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZy50b1N0cmluZygpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwgfHwgc3RyaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gc3RyaW5nLnRvU3RyaW5nKCk7XG5cbiAgICBpZighcG9zc2libGUudGVzdChzdHJpbmcpKSB7IHJldHVybiBzdHJpbmc7IH1cbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xuICB9LFxuXG4gIGlzRW1wdHk6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmKHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgQXJyYXldXCIgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcycpLmNyZWF0ZSgpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzJykuYXR0YWNoKGV4cG9ydHMpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMnKS5hdHRhY2goZXhwb3J0cykiLCIjIyMqXG4gKiBQcmltYXJ5IGFwcGxpY2F0aW9uIGNvbnRyb2xsZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cbkFwcE1vZGVsICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuQXBwUm91dGVyICAgPSByZXF1aXJlICcuL3JvdXRlcnMvQXBwUm91dGVyLmNvZmZlZSdcbkxhbmRpbmdWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSdcbkNyZWF0ZVZpZXcgID0gcmVxdWlyZSAnLi92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUnXG5TaGFyZVZpZXcgICA9IHJlcXVpcmUgJy4vdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwQ29udHJvbGxlciBleHRlbmRzIFZpZXdcblxuXG4gICBjbGFzc05hbWU6ICd3cmFwcGVyJ1xuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQGxhbmRpbmdWaWV3ID0gbmV3IExhbmRpbmdWaWV3XG4gICAgICBAc2hhcmVWaWV3ICAgPSBuZXcgU2hhcmVWaWV3XG5cbiAgICAgIEBjcmVhdGVWaWV3ICA9IG5ldyBDcmVhdGVWaWV3XG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAYXBwUm91dGVyID0gbmV3IEFwcFJvdXRlclxuICAgICAgICAgYXBwQ29udHJvbGxlcjogQFxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIEFwcENvbnRyb2xsZXIgdG8gdGhlIERPTSBhbmQga2lja3NcbiAgICMgb2ZmIGJhY2tib25lcyBoaXN0b3J5XG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIEAkYm9keSA9ICQgJ2JvZHknXG4gICAgICBAJGJvZHkuYXBwZW5kIEBlbFxuXG4gICAgICBCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0XG4gICAgICAgICBwdXNoU3RhdGU6IGZhbHNlXG5cblxuXG4gICAjIERlc3Ryb3lzIGFsbCBjdXJyZW50IGFuZCBwcmUtcmVuZGVyZWQgdmlld3MgYW5kXG4gICAjIHVuZGVsZWdhdGVzIGV2ZW50IGxpc3RlbmVyc1xuXG4gICByZW1vdmU6IC0+XG4gICAgICBAbGFuZGluZ1ZpZXcucmVtb3ZlKClcbiAgICAgIEBzaGFyZVZpZXcucmVtb3ZlKClcbiAgICAgIEBjcmVhdGVWaWV3LnJlbW92ZSgpXG5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG5cblxuXG5cbiAgICMgQWRkcyBBcHBDb250cm9sbGVyLXJlbGF0ZWQgZXZlbnQgbGlzdGVuZXJzIGFuZCBiZWdpbnNcbiAgICMgbGlzdGVuaW5nIHRvIHZpZXcgY2hhbmdlc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsICdjaGFuZ2U6dmlldycsIEBvblZpZXdDaGFuZ2VcblxuXG5cblxuICAgIyBSZW1vdmVzIEFwcENvbnRyb2xsZXItcmVsYXRlZCBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAc3RvcExpc3RlbmluZygpXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3Igc2hvd2luZyAvIGhpZGluZyAvIGRpc3Bvc2luZyBvZiBwcmltYXJ5IHZpZXdzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uVmlld0NoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgcHJldmlvdXNWaWV3ID0gbW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy52aWV3XG4gICAgICBjdXJyZW50VmlldyAgPSBtb2RlbC5jaGFuZ2VkLnZpZXdcblxuICAgICAgaWYgcHJldmlvdXNWaWV3IHRoZW4gcHJldmlvdXNWaWV3LmhpZGVcbiAgICAgICAgIHJlbW92ZTogdHJ1ZVxuXG5cbiAgICAgIEAkZWwuYXBwZW5kIGN1cnJlbnRWaWV3LnJlbmRlcigpLmVsXG5cbiAgICAgIGN1cnJlbnRWaWV3LnNob3coKVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcENvbnRyb2xsZXIiLCIjIyMqXG4gIEFwcGxpY2F0aW9uLXdpZGUgZ2VuZXJhbCBjb25maWd1cmF0aW9uc1xuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE5LjE0XG4jIyNcblxuXG5BcHBDb25maWcgPVxuXG5cbiAgICMgVGhlIHBhdGggdG8gYXBwbGljYXRpb24gYXNzZXRzXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIEFTU0VUUzpcbiAgICAgIHBhdGg6ICAgJy9hc3NldHMnXG4gICAgICBhdWRpbzogICdhdWRpbydcbiAgICAgIGRhdGE6ICAgJ2RhdGEnXG4gICAgICBpbWFnZXM6ICdpbWFnZXMnXG5cblxuICAgIyBUaGUgQlBNIHRlbXBvXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIEJQTTogMzIwXG5cblxuICAgIyBUaGUgbWF4IEJQTVxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBCUE1fTUFYOiAxMDAwXG5cblxuICAgIyBUaGUgbWF4IHZhcmllbnQgb24gZWFjaCBwYXR0ZXJuIHNxdWFyZSAob2ZmLCBsb3csIG1lZGl1bSwgaGlnaClcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgVkVMT0NJVFlfTUFYOiAzXG5cblxuICAgIyBWb2x1bWUgbGV2ZWxzIGZvciBwYXR0ZXJuIHBsYXliYWNrIGFzIHdlbGwgYXMgZm9yIG92ZXJhbGwgdHJhY2tzXG4gICAjIEB0eXBlIHtPYmplY3R9XG5cbiAgIFZPTFVNRV9MRVZFTFM6XG4gICAgICBsb3c6ICAgIC4yXG4gICAgICBtZWRpdW06IC41XG4gICAgICBoaWdoOiAgICAxXG5cblxuICAgIyBSZXR1cm5zIGEgbm9ybWFsaXplZCBhc3NldCBwYXRoIGZvciBhcHBsaWNhdGlvbiBhc3NldHNcbiAgICMgQHBhcmFtIHtTdHJpbmd9IGFzc2V0VHlwZVxuXG4gICByZXR1cm5Bc3NldFBhdGg6IChhc3NldFR5cGUpIC0+XG4gICAgICBAQVNTRVRTLnBhdGggKyAnLycgKyBAQVNTRVRTW2Fzc2V0VHlwZV1cblxuXG4gICAjIFJldHVybnMgYSBub3JtYWxpemVkIGFzc2V0IHBhdGggZm9yIHRoZSBURVNUIGVudmlyb25tZW50XG4gICAjIEBwYXJhbSB7U3RyaW5nfSBhc3NldFR5cGVcblxuICAgcmV0dXJuVGVzdEFzc2V0UGF0aDogKGFzc2V0VHlwZSkgLT5cbiAgICAgICcvdGVzdC9odG1sLycgKyBAQVNTRVRTLnBhdGggKyAnLycgKyBAQVNTRVRTW2Fzc2V0VHlwZV1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwQ29uZmlnXG5cbiIsIiMjIypcbiAqIEFwcGxpY2F0aW9uIHJlbGF0ZWQgZXZlbnRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuXG5BcHBFdmVudCA9XG5cbiAgIENIQU5HRV9BQ1RJVkU6ICAgICAnY2hhbmdlOmFjdGl2ZSdcbiAgIENIQU5HRV9CUE06ICAgICAgICAnY2hhbmdlOmJwbSdcbiAgIENIQU5HRV9GT0NVUzogICAgICAnY2hhbmdlOmZvY3VzJ1xuICAgQ0hBTkdFX0lOU1RSVU1FTlQ6ICdjaGFuZ2U6Y3VycmVudEluc3RydW1lbnQnXG4gICBDSEFOR0VfS0lUOiAgICAgICAgJ2NoYW5nZTpraXRNb2RlbCdcbiAgIENIQU5HRV9NVVRFOiAgICAgICAnY2hhbmdlOm11dGUnXG4gICBDSEFOR0VfUExBWUlORzogICAgJ2NoYW5nZTpwbGF5aW5nJ1xuICAgQ0hBTkdFX1RSSUdHRVI6ICAgICdjaGFuZ2U6dHJpZ2dlcidcbiAgIENIQU5HRV9WRUxPQ0lUWTogICAnY2hhbmdlOnZlbG9jaXR5J1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwRXZlbnQiLCIjIyMqXG4gKiBHbG9iYWwgUHViU3ViIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblxuUHViU3ViID1cblxuICAgUk9VVEU6ICdvblJvdXRlQ2hhbmdlJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUHViU3ViIiwiXG52YXIgZGlnaXRzID0gcmVxdWlyZSgnZGlnaXRzJyk7XG52YXIgaGFuZGxlYmFycyA9IHJlcXVpcmUoJ2hhbmRsZWlmeScpXG5cbmhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3JlcGVhdCcsIGZ1bmN0aW9uKG4sIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgX2RhdGEgPSB7fTtcbiAgICBpZiAob3B0aW9ucy5fZGF0YSkge1xuICAgICAgX2RhdGEgPSBoYW5kbGViYXJzLmNyZWF0ZUZyYW1lKG9wdGlvbnMuX2RhdGEpO1xuICAgIH1cblxuICAgIHZhciBjb250ZW50ID0gJyc7XG4gICAgdmFyIGNvdW50ID0gbiAtIDE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gY291bnQ7IGkrKykge1xuICAgICAgX2RhdGEgPSB7XG4gICAgICAgIGluZGV4OiBkaWdpdHMucGFkKChpICsgMSksIHthdXRvOiBufSlcbiAgICAgIH07XG4gICAgICBjb250ZW50ICs9IG9wdGlvbnMuZm4odGhpcywge2RhdGE6IF9kYXRhfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgaGFuZGxlYmFycy5TYWZlU3RyaW5nKGNvbnRlbnQpO1xuICB9KTsiLCIjIyMqXG4gKiBNUEMgQXBwbGljYXRpb24gYm9vdHN0cmFwcGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5Ub3VjaCAgICAgICAgID0gcmVxdWlyZSAnLi91dGlscy9Ub3VjaCdcbkFwcENvbmZpZyAgICAgPSByZXF1aXJlICcuL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4vbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5BcHBDb250cm9sbGVyID0gcmVxdWlyZSAnLi9BcHBDb250cm9sbGVyLmNvZmZlZSdcbmhlbHBlcnMgICAgICAgPSByZXF1aXJlICcuL2hlbHBlcnMvaGFuZGxlYmFycy1oZWxwZXJzJ1xuXG4kIC0+XG5cbiAgIFRvdWNoLnRyYW5zbGF0ZVRvdWNoRXZlbnRzKClcblxuICAga2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICBwYXJzZTogdHJ1ZVxuXG4gICBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICBhc3luYzogZmFsc2VcbiAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgYXBwQ29udHJvbGxlciA9IG5ldyBBcHBDb250cm9sbGVyXG4gICAgICBraXRDb2xsZWN0aW9uOiBraXRDb2xsZWN0aW9uXG5cbiAgIGFwcENvbnRyb2xsZXIucmVuZGVyKClcbiIsIiMjIypcbiAgUHJpbWFyeSBhcHBsaWNhdGlvbiBtb2RlbCB3aGljaCBjb29yZGluYXRlcyBzdGF0ZVxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cblxuQXBwUm91dGVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAndmlldyc6ICAgICAgICBudWxsXG4gICAgICAncGxheWluZyc6ICAgICBudWxsXG4gICAgICAnbXV0ZSc6ICAgICAgICBudWxsXG5cbiAgICAgICdraXRNb2RlbCc6ICAgIG51bGxcblxuICAgICAgIyBTZXR0aW5nc1xuICAgICAgJ2JwbSc6ICAgICAgICAgQXBwQ29uZmlnLkJQTVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwUm91dGVyIiwiIyMjKlxuICogQ29sbGVjdGlvbiBvZiBzb3VuZCBraXRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRNb2RlbCAgPSByZXF1aXJlICcuL0tpdE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBLaXRDb2xsZWN0aW9uIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG5cbiAgICMgVXJsIHRvIGRhdGEgZm9yIGZldGNoXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHVybDogXCIje0FwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKX0vc291bmQtZGF0YS5qc29uXCJcblxuXG4gICAjIEluZGl2aWR1YWwgZHJ1bWtpdCBhdWRpbyBzZXRzXG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAgbW9kZWw6IEtpdE1vZGVsXG5cblxuICAgIyBUaGUgY3VycmVudCB1c2VyLXNlbGVjdGVkIGtpdFxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBraXRJZDogMFxuXG5cblxuICAgcGFyc2U6IChyZXNwb25zZSkgLT5cbiAgICAgIGFzc2V0UGF0aCA9IHJlc3BvbnNlLmNvbmZpZy5hc3NldFBhdGhcbiAgICAgIGtpdHMgPSByZXNwb25zZS5raXRzXG5cbiAgICAgIGtpdHMgPSBfLm1hcCBraXRzLCAoa2l0KSAtPlxuICAgICAgICAga2l0LnBhdGggPSBhc3NldFBhdGggKyAnLycgKyBraXQuZm9sZGVyXG4gICAgICAgICByZXR1cm4ga2l0XG5cbiAgICAgIHJldHVybiBraXRzXG5cblxuXG5cbiAgICMgQ3ljbGVzIHRoZSBjdXJyZW50IGRydW0ga2l0IGJhY2tcbiAgICMgQHJldHVybiB7S2l0TW9kZWx9XG5cbiAgIHByZXZpb3VzS2l0OiAtPlxuICAgICAgbGVuID0gQGxlbmd0aFxuXG4gICAgICBpZiBAa2l0SWQgPiAwXG4gICAgICAgICBAa2l0SWQtLVxuXG4gICAgICBlbHNlXG4gICAgICAgICBAa2l0SWQgPSBsZW4gLSAxXG5cbiAgICAgIGtpdE1vZGVsID0gQGF0IEBraXRJZFxuXG5cblxuXG4gICAjIEN5Y2xlcyB0aGUgY3VycmVudCBkcnVtIGtpdCBmb3J3YXJkXG4gICAjIEByZXR1cm4ge0tpdE1vZGVsfVxuXG4gICBuZXh0S2l0OiAtPlxuICAgICAgbGVuID0gQGxlbmd0aCAtIDFcblxuICAgICAgaWYgQGtpdElkIDwgbGVuXG4gICAgICAgICBAa2l0SWQrK1xuXG4gICAgICBlbHNlXG4gICAgICAgICBAa2l0SWQgPSAwXG5cbiAgICAgIGtpdE1vZGVsID0gQGF0IEBraXRJZFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRDb2xsZWN0aW9uIiwiIyMjKlxuICogS2l0IG1vZGVsIGZvciBoYW5kbGluZyBzdGF0ZSByZWxhdGVkIHRvIGtpdCBzZWxlY3Rpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuY2xhc3MgS2l0TW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ2xhYmVsJzogICAgbnVsbFxuICAgICAgJ3BhdGgnOiAgICAgbnVsbFxuICAgICAgJ2ZvbGRlcic6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cbiAgICAgICdpbnN0cnVtZW50cyc6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICAgICAnY3VycmVudEluc3RydW1lbnQnOiBudWxsXG5cblxuXG4gICAjIEZvcm1hdCB0aGUgcmVzcG9uc2Ugc28gdGhhdCBpbnN0cnVtZW50cyBnZXRzIHByb2Nlc3NlZFxuICAgIyBieSBiYWNrYm9uZSB2aWEgdGhlIEluc3RydW1lbnRDb2xsZWN0aW9uLiAgQWRkaXRpb25hbGx5LFxuICAgIyBwYXNzIGluIHRoZSBwYXRoIHNvIHRoYXQgYWJzb2x1dGUgVVJMJ3MgY2FuIGJlIHVzZWRcbiAgICMgdG8gcmVmZXJlbmNlIHNvdW5kIGRhdGFcbiAgICMgQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG5cbiAgIHBhcnNlOiAocmVzcG9uc2UpIC0+XG4gICAgICBfLmVhY2ggcmVzcG9uc2UuaW5zdHJ1bWVudHMsIChpbnN0cnVtZW50KSAtPlxuICAgICAgICAgaW5zdHJ1bWVudC5zcmMgPSByZXNwb25zZS5wYXRoICsgJy8nICsgaW5zdHJ1bWVudC5zcmNcblxuICAgICAgcmVzcG9uc2UuaW5zdHJ1bWVudHMgPSBuZXcgSW5zdHJ1bWVudENvbGxlY3Rpb24gcmVzcG9uc2UuaW5zdHJ1bWVudHNcblxuICAgICAgcmVzcG9uc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRNb2RlbCIsIiMjIypcbiAqIE1vZGVsIGZvciB0aGUgZW50aXJlIFBhZCBjb21wb25lbnRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5jbGFzcyBMaXZlUGFkTW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGl2ZVBhZE1vZGVsXG4iLCIjIyMqXG4gKiBDb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgUGFkU3F1YXJlTW9kZWxzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI0LjE0XG4jIyNcblxuUGFkU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBQYWRTcXVhcmVDb2xsZWN0aW9uIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG4gICBtb2RlbDogUGFkU3F1YXJlTW9kZWxcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZFNxdWFyZUNvbGxlY3Rpb24iLCIjIyMqXG4gKiBNb2RlbCBmb3IgaW5kaXZpZHVhbCBwYWQgc3F1YXJlcy5cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5jbGFzcyBQYWRTcXVhcmVNb2RlbCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnZHJhZ2dpbmcnOiAgICBmYWxzZVxuICAgICAgJ3BsYXlpbmcnOiAgICAgZmFsc2VcblxuICAgICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICAgICAgJ2luc3RydW1lbnQnOiAgbnVsbFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYWRTcXVhcmVNb2RlbFxuIiwiIyMjKlxuICogQ29sbGVjdGlvbiByZXByZXNlbnRpbmcgZWFjaCBzb3VuZCBmcm9tIGEga2l0IHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4vSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBJbnN0cnVtZW50Q29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICBtb2RlbDogSW5zdHJ1bWVudE1vZGVsXG5cblxuXG4gICAjIEV4cG9ydHMgdGhlIHBhdHRlcm4gc3F1YXJlcyBjb2xsZWN0aW9uIGZvciB1c2VcbiAgICMgd2l0aCB0cmFuc2ZlcnJpbmcgcHJvcHMgYWNyb3NzIGRpZmZlcmVudCBkcnVtIGtpdHNcblxuICAgZXhwb3J0UGF0dGVyblNxdWFyZXM6IC0+XG4gICAgICByZXR1cm4gQG1hcCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgICAgIGluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRDb2xsZWN0aW9uIiwiIyMjKlxuICogU291bmQgbW9kZWwgZm9yIGVhY2ggaW5kaXZpZHVhbCBraXQgc291bmQgc2V0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cblxuY2xhc3MgSW5zdHJ1bWVudE1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG4gICBkZWZhdWx0czpcblxuICAgICAgIyBAdHlwZSB7U3RyaW5nfVxuICAgICAgJ2ljb24nOiAgICBudWxsXG5cbiAgICAgICMgQHR5cGUge1N0cmluZ31cbiAgICAgICdsYWJlbCc6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgICAnc3JjJzogICAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7TnVtYmVyfVxuICAgICAgJ3ZvbHVtZSc6ICBudWxsXG5cbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG4gICAgICAnYWN0aXZlJzogIG51bGxcblxuICAgICAgIyBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgICdtdXRlJzogICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtCb29sZWFufVxuICAgICAgJ2ZvY3VzJzogICBudWxsXG5cbiAgICAgICMgQHR5cGUge1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9ufVxuICAgICAgJ3BhdHRlcm5TcXVhcmVzJzogICAgbnVsbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudE1vZGVsIiwiIyMjKlxuICBBIGNvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXNcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcENvbmZpZyAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAnLi9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi4vc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgIG1vZGVsOiBJbnN0cnVtZW50TW9kZWxcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uIiwiIyMjKlxuICBNb2RlbCBmb3IgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXMuICBQYXJ0IG9mIGxhcmdlciBQYXR0ZXJuIFRyYWNrIGNvbGxlY3Rpb25cblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlTW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ2FjdGl2ZSc6ICAgICAgICAgICBmYWxzZVxuICAgICAgJ2luc3RydW1lbnQnOiAgICAgICBudWxsXG4gICAgICAncHJldmlvdXNWZWxvY2l0eSc6IDBcbiAgICAgICd0cmlnZ2VyJzogICAgICAgICAgbnVsbFxuICAgICAgJ3ZlbG9jaXR5JzogICAgICAgICAwXG5cblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQG9uIEFwcEV2ZW50LkNIQU5HRV9WRUxPQ0lUWSwgQG9uVmVsb2NpdHlDaGFuZ2VcblxuXG5cbiAgIGN5Y2xlOiAtPlxuICAgICAgdmVsb2NpdHkgPSBAZ2V0ICd2ZWxvY2l0eSdcblxuICAgICAgaWYgdmVsb2NpdHkgPCBBcHBDb25maWcuVkVMT0NJVFlfTUFYXG4gICAgICAgICB2ZWxvY2l0eSsrXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIHZlbG9jaXR5ID0gMFxuXG4gICAgICBAc2V0ICd2ZWxvY2l0eScsIHZlbG9jaXR5XG5cblxuXG4gICBlbmFibGU6IC0+XG4gICAgICBAc2V0ICd2ZWxvY2l0eScsIDFcblxuXG5cblxuICAgZGlzYWJsZTogLT5cbiAgICAgIEBzZXQgJ3ZlbG9jaXR5JywgMFxuXG5cblxuICAgb25WZWxvY2l0eUNoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgQHNldCAncHJldmlvdXNWZWxvY2l0eScsIG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMudmVsb2NpdHlcblxuICAgICAgdmVsb2NpdHkgPSBtb2RlbC5jaGFuZ2VkLnZlbG9jaXR5XG5cbiAgICAgIGlmIHZlbG9jaXR5ID4gMFxuICAgICAgICAgQHNldCAnYWN0aXZlJywgdHJ1ZVxuXG4gICAgICBlbHNlIGlmIHZlbG9jaXR5IGlzIDBcbiAgICAgICAgIEBzZXQgJ2FjdGl2ZScsIGZhbHNlXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblNxdWFyZU1vZGVsIiwiIyMjKlxuICogTVBDIEFwcGxpY2F0aW9uIHJvdXRlclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcENvbmZpZyAgID0gcmVxdWlyZSAnLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5QdWJTdWIgICAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL1B1YlN1YidcblB1YkV2ZW50ICAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblxuIyBUT0RPOiBUaGUgYmVsb3cgaXRlbXMgYXJlIG9ubHkgaW5jbHVkZWQgZm9yIHRlc3RpbmcgY29tcG9uZW50XG4jIG1vZHVsYXJpdHkuICBUaGV5LCBhbmQgdGhlaXIgcm91dGVzLCBzaG91bGQgYmUgcmVtb3ZlZCBpbiBwcm9kdWN0aW9uXG5cblRlc3RzVmlldyAgICAgPSByZXF1aXJlICcuLi92aWV3cy90ZXN0cy9UZXN0c1ZpZXcuY29mZmVlJ1xuXG5WaWV3ID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5LaXRTZWxlY3RvciAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5LaXRNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlJ1xuXG5CUE1JbmRpY2F0b3IgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSdcbkluc3RydW1lbnRTZWxlY3RvclBhbmVsID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlJ1xuXG5JbnN0cnVtZW50TW9kZWwgPSAnLi4vbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSAnLi4vbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblBhdHRlcm5TcXVhcmUgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblRyYWNrICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2suY29mZmVlJ1xuU2VxdWVuY2VyICAgICAgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUnXG5cbkxpdmVQYWRNb2RlbCA9IHJlcXVpcmUgJy4uL21vZGVscy9wYWQvTGl2ZVBhZE1vZGVsLmNvZmZlZSdcblBhZFNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9tb2RlbHMvcGFkL1BhZFNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGFkU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuLi9tb2RlbHMvcGFkL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSdcbkxpdmVQYWQgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvTGl2ZVBhZC5jb2ZmZWUnXG5QYWRTcXVhcmUgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvUGFkU3F1YXJlLmNvZmZlZSdcblxuXG5jbGFzcyBBcHBSb3V0ZXIgZXh0ZW5kcyBCYWNrYm9uZS5Sb3V0ZXJcblxuXG4gICByb3V0ZXM6XG4gICAgICAnJzogICAgICAgICAgICAgJ2xhbmRpbmdSb3V0ZSdcbiAgICAgICdjcmVhdGUnOiAgICAgICAnY3JlYXRlUm91dGUnXG4gICAgICAnc2hhcmUnOiAgICAgICAgJ3NoYXJlUm91dGUnXG5cbiAgICAgICMgQ29tcG9uZW50IHRlc3Qgcm91dGVzXG4gICAgICAndGVzdHMnOiAgICAgICAgICAgICAgICAndGVzdHMnXG4gICAgICAna2l0LXNlbGVjdGlvbic6ICAgICAgICAna2l0U2VsZWN0aW9uUm91dGUnXG4gICAgICAnYnBtLWluZGljYXRvcic6ICAgICAgICAnYnBtSW5kaWNhdG9yUm91dGUnXG4gICAgICAnaW5zdHJ1bWVudC1zZWxlY3Rvcic6ICAnaW5zdHJ1bWVudFNlbGVjdG9yUm91dGUnXG4gICAgICAncGF0dGVybi1zcXVhcmUnOiAgICAgICAncGF0dGVyblNxdWFyZVJvdXRlJ1xuICAgICAgJ3BhdHRlcm4tdHJhY2snOiAgICAgICAgJ3BhdHRlcm5UcmFja1JvdXRlJ1xuICAgICAgJ3NlcXVlbmNlcic6ICAgICAgICAgICAgJ3NlcXVlbmNlclJvdXRlJ1xuICAgICAgJ2Z1bGwtc2VxdWVuY2VyJzogICAgICAgJ2Z1bGxTZXF1ZW5jZXJSb3V0ZSdcbiAgICAgICdwYWQtc3F1YXJlJzogICAgICAgICAgICdwYWRTcXVhcmVSb3V0ZSdcbiAgICAgICdsaXZlLXBhZCc6ICAgICAgICAgICAgICdsaXZlUGFkUm91dGUnXG5cblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHtAYXBwQ29udHJvbGxlciwgQGFwcE1vZGVsfSA9IG9wdGlvbnNcblxuICAgICAgUHViU3ViLm9uIFB1YkV2ZW50LlJPVVRFLCBAb25Sb3V0ZUNoYW5nZVxuXG5cblxuICAgb25Sb3V0ZUNoYW5nZTogKHBhcmFtcykgPT5cbiAgICAgIHtyb3V0ZX0gPSBwYXJhbXNcblxuICAgICAgQG5hdmlnYXRlIHJvdXRlLCB7IHRyaWdnZXI6IHRydWUgfVxuXG5cblxuICAgbGFuZGluZ1JvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLmxhbmRpbmdWaWV3XG5cblxuXG4gICBjcmVhdGVSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBAYXBwQ29udHJvbGxlci5jcmVhdGVWaWV3XG5cblxuXG4gICBzaGFyZVJvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLnNoYXJlVmlld1xuXG5cblxuXG5cblxuICAgIyBDT01QT05FTlQgVEVTVCBST1VURVNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICB0ZXN0czogLT5cbiAgICAgIHZpZXcgPSBuZXcgVGVzdHNWaWV3KClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAga2l0U2VsZWN0aW9uUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLFxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBicG1JbmRpY2F0b3JSb3V0ZTogLT5cbiAgICAgIHZpZXcgPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIHZpZXcucmVuZGVyKClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAgaW5zdHJ1bWVudFNlbGVjdG9yUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgdmlldyA9IG5ldyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAgcGF0dGVyblNxdWFyZVJvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbmV3IFBhdHRlcm5TcXVhcmVNb2RlbCgpXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG4gICBwYXR0ZXJuVHJhY2tSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgIG1vZGVsOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbiAgIHNlcXVlbmNlclJvdXRlOiAtPlxuXG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgU2VxdWVuY2VyXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbiAgIGZ1bGxTZXF1ZW5jZXJSb3V0ZTogLT5cblxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG5cbiAgICAgIGtpdFNlbGVjdGlvbiA9ID0+XG4gICAgICAgICB2aWV3ID0gbmV3IEtpdFNlbGVjdG9yXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICAgICB2aWV3XG5cblxuICAgICAgYnBtID0gPT5cbiAgICAgICAgIHZpZXcgPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgICAgIHZpZXdcblxuXG4gICAgICBpbnN0cnVtZW50U2VsZWN0aW9uID0gPT5cbiAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgICAgdmlldyA9IG5ldyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuICAgICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgICAgdmlld1xuXG5cbiAgICAgIHNlcXVlbmNlciA9ID0+XG4gICAgICAgICB2aWV3ID0gbmV3IFNlcXVlbmNlclxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgICAgIHZpZXdcblxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcgPSBuZXcgVmlldygpXG5cbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQga2l0U2VsZWN0aW9uKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgYnBtKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgaW5zdHJ1bWVudFNlbGVjdGlvbigpLnJlbmRlcigpLmVsXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldy4kZWwuYXBwZW5kIHNlcXVlbmNlcigpLnJlbmRlcigpLmVsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBmdWxsU2VxdWVuY2VyVmlld1xuXG5cblxuXG4gICBwYWRTcXVhcmVSb3V0ZTogLT5cbiAgICAgIHZpZXcgPSBuZXcgUGFkU3F1YXJlXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuXG4gICBsaXZlUGFkUm91dGU6IC0+XG4gICAgICB2aWV3ID0gbmV3IExpdmVQYWRcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBSb3V0ZXIiLCIjIyMqXG4gKiBWaWV3IHN1cGVyY2xhc3MgY29udGFpbmluZyBzaGFyZWQgZnVuY3Rpb25hbGl0eVxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMi4xNy4xNFxuIyMjXG5cblxuVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kXG5cblxuXG4gICAjIEluaXRpYWxpemVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgXy5leHRlbmQgQCwgXy5kZWZhdWx0cyggb3B0aW9ucyA9IG9wdGlvbnMgfHwgQGRlZmF1bHRzLCBAZGVmYXVsdHMgfHwge30gKVxuXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyB3aXRoIHN1cHBsaWVkIHRlbXBsYXRlIGRhdGEsIG9yIGNoZWNrcyBpZiB0ZW1wbGF0ZSBpcyBvblxuICAgIyBvYmplY3QgYm9keVxuICAgIyBAcGFyYW0gIHtGdW5jdGlvbnxNb2RlbH0gdGVtcGxhdGVEYXRhXG4gICAjIEByZXR1cm4ge1ZpZXd9XG5cbiAgIHJlbmRlcjogKHRlbXBsYXRlRGF0YSkgLT5cbiAgICAgIHRlbXBsYXRlRGF0YSA9IHRlbXBsYXRlRGF0YSB8fCB7fVxuXG4gICAgICBpZiBAdGVtcGxhdGVcblxuICAgICAgICAgIyBJZiBtb2RlbCBpcyBhbiBpbnN0YW5jZSBvZiBhIGJhY2tib25lIG1vZGVsLCB0aGVuIEpTT05pZnkgaXRcbiAgICAgICAgIGlmIEBtb2RlbCBpbnN0YW5jZW9mIEJhY2tib25lLk1vZGVsXG4gICAgICAgICAgICB0ZW1wbGF0ZURhdGEgPSBAbW9kZWwudG9KU09OKClcblxuICAgICAgICAgQCRlbC5odG1sIEB0ZW1wbGF0ZSAodGVtcGxhdGVEYXRhKVxuXG4gICAgICBAZGVsZWdhdGVFdmVudHMoKVxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQFxuXG5cblxuXG4gICAjIFJlbW92ZXMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVtb3ZlOiAob3B0aW9ucykgLT5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG4gICAgICBAJGVsLnJlbW92ZSgpXG4gICAgICBAdW5kZWxlZ2F0ZUV2ZW50cygpXG5cblxuXG5cblxuICAgIyBTaG93cyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBzaG93OiAob3B0aW9ucykgLT5cbiAgICAgIFR3ZWVuTWF4LnNldCBAJGVsLCB7IGF1dG9BbHBoYTogMSB9XG5cblxuXG5cbiAgICMgSGlkZXMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaGlkZTogKG9wdGlvbnMpIC0+XG4gICAgICBUd2Vlbk1heC5zZXQgQCRlbCxcbiAgICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgIGlmIG9wdGlvbnM/LnJlbW92ZVxuICAgICAgICAgICAgICAgQHJlbW92ZSgpXG5cblxuXG5cbiAgICMgTm9vcCB3aGljaCBpcyBjYWxsZWQgb24gcmVuZGVyXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuXG5cblxuICAgIyBSZW1vdmVzIGFsbCByZWdpc3RlcmVkIGxpc3RlbmVyc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlldyIsIi8qKlxuICogQG1vZHVsZSAgICAgUHViU3ViXG4gKiBAZGVzYyAgICAgICBHbG9iYWwgUHViU3ViIG9iamVjdCBmb3IgZGlzcGF0Y2ggYW5kIGRlbGVnYXRpb25cbiAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIFB1YlN1YiA9IHt9XG5cbl8uZXh0ZW5kKCBQdWJTdWIsIEJhY2tib25lLkV2ZW50cyApXG5cbm1vZHVsZS5leHBvcnRzID0gUHViU3ViIiwiLyoqXG4gKiBUb3VjaCByZWxhdGVkIHV0aWxpdGllc1xuICpcbiAqL1xuXG52YXIgVG91Y2ggPSB7XG5cblxuICAvKipcbiAgICogRGVsZWdhdGUgdG91Y2ggZXZlbnRzIHRvIG1vdXNlIGlmIG5vdCBvbiBhIHRvdWNoIGRldmljZVxuICAgKi9cblxuICB0cmFuc2xhdGVUb3VjaEV2ZW50czogZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKCEgKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyApKSB7XG4gICAgICAkKGRvY3VtZW50KS5kZWxlZ2F0ZSggJ2JvZHknLCAnbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAkKGUudGFyZ2V0KS50cmlnZ2VyKCAndG91Y2hzdGFydCcgKVxuICAgICAgfSlcblxuICAgICAgJChkb2N1bWVudCkuZGVsZWdhdGUoICdib2R5JywgJ21vdXNldXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICQoZS50YXJnZXQpLnRyaWdnZXIoICd0b3VjaGVuZCcgKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRvdWNoIiwiIyMjKlxuICogQ3JlYXRlIHZpZXcgd2hpY2ggdGhlIHVzZXIgY2FuIGJ1aWxkIGJlYXRzIHdpdGhpblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblxuVmlldyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5LaXRTZWxlY3RvciAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSdcbkluc3RydW1lbnRTZWxlY3RvclBhbmVsID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlJ1xuU2VxdWVuY2VyICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSdcbkJQTUluZGljYXRvciAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSdcbnRlbXBsYXRlICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvY3JlYXRlLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBDcmVhdGVWaWV3IGV4dGVuZHMgVmlld1xuXG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAka2l0U2VsZWN0b3JDb250YWluZXIgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1raXQtc2VsZWN0b3InXG4gICAgICBAJGtpdFNlbGVjdG9yICAgICAgICAgICAgPSBAJGVsLmZpbmQgJy5raXQtc2VsZWN0b3InXG4gICAgICBAJHZpc3VhbGl6YXRpb25Db250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItdmlzdWFsaXphdGlvbidcbiAgICAgIEAkc2VxdWVuY2VyQ29udGFpbmVyICAgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1zZXF1ZW5jZXInXG4gICAgICBAJGluc3RydW1lbnRTZWxlY3RvciAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuaW5zdHJ1bWVudC1zZWxlY3RvcidcbiAgICAgIEAkc2VxdWVuY2VyICAgICAgICAgICAgICA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5zZXF1ZW5jZXInXG4gICAgICBAJGJwbSAgICAgICAgICAgICAgICAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuYnBtJ1xuICAgICAgQCRzaGFyZUJ0biAgICAgICAgICAgICAgID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLmJ0bi1zaGFyZSdcblxuICAgICAgQHJlbmRlcktpdFNlbGVjdG9yKClcbiAgICAgIEByZW5kZXJJbnN0cnVtZW50U2VsZWN0b3IoKVxuICAgICAgQHJlbmRlclNlcXVlbmNlcigpXG4gICAgICBAcmVuZGVyQlBNKClcblxuICAgICAgQFxuXG5cblxuICAgcmVuZGVyS2l0U2VsZWN0b3I6IC0+XG4gICAgICBAa2l0U2VsZWN0b3IgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIEAka2l0U2VsZWN0b3IuaHRtbCBAa2l0U2VsZWN0b3IucmVuZGVyKCkuZWxcblxuXG5cbiAgIHJlbmRlckluc3RydW1lbnRTZWxlY3RvcjogLT5cbiAgICAgIEBpbnN0cnVtZW50U2VsZWN0b3IgPSBuZXcgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWxcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIEAkaW5zdHJ1bWVudFNlbGVjdG9yLmh0bWwgQGluc3RydW1lbnRTZWxlY3Rvci5yZW5kZXIoKS5lbFxuXG5cblxuICAgcmVuZGVyU2VxdWVuY2VyOiAtPlxuICAgICAgQHNlcXVlbmNlciA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICBAJHNlcXVlbmNlci5odG1sIEBzZXF1ZW5jZXIucmVuZGVyKCkuZWxcblxuXG5cbiAgIHJlbmRlckJQTTogLT5cbiAgICAgIEBicG0gPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEAkYnBtLmh0bWwgQGJwbS5yZW5kZXIoKS5lbFxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3JlYXRlVmlldyIsIiMjIypcbiAqIEJlYXRzIHBlciBtaW51dGUgdmlldyBmb3IgaGFuZGxpbmcgdGVtcG9cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9icG0tdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEJQTUluZGljYXRvciBleHRlbmRzIFZpZXdcblxuXG4gICAjIFJlZiB0byB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBUaGUgc2V0SW50ZXJ2YWwgdXBkYXRlIGludGVydmFsIGZvciBpbmNyZWFzaW5nIGFuZFxuICAgIyBkZWNyZWFzaW5nIEJQTSBvbiBwcmVzcyAvIHRvdWNoXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGludGVydmFsVXBkYXRlVGltZTogNzBcblxuXG4gICAjIFRoZSBzZXRJbnRlcnZhbCB1cGRhdGVyXG4gICAjIEB0eXBlIHtTZXRJbnRlcnZhbH1cblxuICAgdXBkYXRlSW50ZXJ2YWw6IG51bGxcblxuXG4gICAjIFRoZSBhbW91bnQgdG8gaW5jcmVhc2UgdGhlIEJQTSBieSBvbiBlYWNoIHRpY2tcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgYnBtSW5jcmVhc2VBbW91bnQ6IDEwXG5cblxuICAgIyBUaGUgY3VycmVudCBicG0gYmVmb3JlIGl0cyBzZXQgb24gdGhlIG1vZGVsLiAgVXNlZCB0byBidWZmZXJcbiAgICMgdXBkYXRlcyBhbmQgdG8gcHJvdmlkZSBmb3Igc21vb3RoIGFuaW1hdGlvblxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBjdXJyQlBNOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaHN0YXJ0IC5idG4taW5jcmVhc2UnOiAnb25JbmNyZWFzZUJ0bkRvd24nXG4gICAgICAndG91Y2hzdGFydCAuYnRuLWRlY3JlYXNlJzogJ29uRGVjcmVhc2VCdG5Eb3duJ1xuICAgICAgJ3RvdWNoZW5kICAgLmJ0bi1pbmNyZWFzZSc6ICdvbkJ0blVwJ1xuICAgICAgJ3RvdWNoZW5kICAgLmJ0bi1kZWNyZWFzZSc6ICdvbkJ0blVwJ1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgdXBkYXRlIHRoZSBraXQgaWYgbm90IGFscmVhZHlcbiAgICMgc2V0IHZpYSBhIHByZXZpb3VzIHNlc3Npb25cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRicG1MYWJlbCAgID0gQCRlbC5maW5kICcubGFiZWwtYnBtJ1xuICAgICAgQGluY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWluY3JlYXNlJ1xuICAgICAgQGRlY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWRlY3JlYXNlJ1xuXG4gICAgICBAY3VyckJQTSA9IEBhcHBNb2RlbC5nZXQoJ2JwbScpXG4gICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cbiAgICAgIEBvbkJ0blVwKClcblxuICAgICAgQFxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAgIyBzd2l0Y2hpbmcgQlBNXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0JQTSwgQG9uQlBNQ2hhbmdlXG5cblxuXG5cbiAgICMgU2V0cyBhbiBpbnRlcnZhbCB0byBpbmNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgICMgd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2VcblxuICAgaW5jcmVhc2VCUE06IC0+XG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgICAgYnBtID0gQGN1cnJCUE1cblxuICAgICAgICAgaWYgYnBtIDwgQXBwQ29uZmlnLkJQTV9NQVhcbiAgICAgICAgICAgIGJwbSArPSBAYnBtSW5jcmVhc2VBbW91bnRcblxuICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnBtID0gQXBwQ29uZmlnLkJQTV9NQVhcblxuICAgICAgICAgQGN1cnJCUE0gPSBicG1cbiAgICAgICAgIEAkYnBtTGFiZWwudGV4dCBAY3VyckJQTVxuICAgICAgICAgI0BhcHBNb2RlbC5zZXQgJ2JwbScsIDYwMDAwIC8gQGN1cnJCUE1cblxuICAgICAgLCBAaW50ZXJ2YWxVcGRhdGVUaW1lXG5cblxuXG5cbiAgICMgU2V0cyBhbiBpbnRlcnZhbCB0byBkZWNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgICMgd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2VcblxuICAgZGVjcmVhc2VCUE06IC0+XG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgICAgYnBtID0gQGN1cnJCUE1cblxuICAgICAgICAgaWYgYnBtID4gMFxuICAgICAgICAgICAgYnBtIC09IEBicG1JbmNyZWFzZUFtb3VudFxuXG4gICAgICAgICBlbHNlXG4gICAgICAgICAgICBicG0gPSAwXG5cbiAgICAgICAgIEBjdXJyQlBNID0gYnBtXG4gICAgICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cbiAgICAgICAgICNAYXBwTW9kZWwuc2V0ICdicG0nLCA2MDAwMCAvIEBjdXJyQlBNXG5cbiAgICAgICwgQGludGVydmFsVXBkYXRlVGltZVxuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkluY3JlYXNlQnRuRG93bjogKGV2ZW50KSA9PlxuICAgICAgQGluY3JlYXNlQlBNKClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uRGVjcmVhc2VCdG5Eb3duOiAoZXZlbnQpIC0+XG4gICAgICBAZGVjcmVhc2VCUE0oKVxuXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbW91c2UgLyB0b3VjaHVwIGV2ZW50cy4gIENsZWFycyB0aGUgaW50ZXJ2YWxcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25CdG5VcDogKGV2ZW50KSAtPlxuICAgICAgY2xlYXJJbnRlcnZhbCBAdXBkYXRlSW50ZXJ2YWxcbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IG51bGxcblxuICAgICAgQGFwcE1vZGVsLnNldCAnYnBtJywgNjAwMDAgLyBAY3VyckJQTVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2UgZXZlbnRzLiAgVXBkYXRlcyB0aGUgbGFiZWwgb24gdGhlXG4gICAjIGtpdCBzZWxlY3RvclxuXG4gICBvbkJQTUNoYW5nZTogKG1vZGVsKSAtPlxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQlBNSW5kaWNhdG9yIiwiIyMjKlxuICogS2l0IHNlbGVjdG9yIGZvciBzd2l0Y2hpbmcgYmV0d2VlbiBkcnVtLWtpdCBzb3VuZHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMva2l0LXNlbGVjdGlvbi10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgS2l0U2VsZWN0b3IgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBSZWYgdG8gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBLaXRDb2xsZWN0aW9uIGZvciB1cGRhdGluZyBzb3VuZHNcbiAgICMgQHR5cGUge0tpdENvbGxlY3Rpb259XG5cbiAgIGtpdENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIFRoZSBjdXJyZW50IGtpdFxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdE1vZGVsOiBudWxsXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLmJ0bi1sZWZ0JzogICAnb25MZWZ0QnRuQ2xpY2snXG4gICAgICAndG91Y2hlbmQgLmJ0bi1yaWdodCc6ICAnb25SaWdodEJ0bkNsaWNrJ1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgdXBkYXRlIHRoZSBraXQgaWYgbm90IGFscmVhZHlcbiAgICMgc2V0IHZpYSBhIHByZXZpb3VzIHNlc3Npb25cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRraXRMYWJlbCA9IEAkZWwuZmluZCAnLmxhYmVsLWtpdCdcblxuICAgICAgaWYgQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKSBpcyBudWxsXG4gICAgICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEAka2l0TGFiZWwudGV4dCBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpLmdldCAnbGFiZWwnXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAgIyBzd2l0Y2hpbmcgZHJ1bSBraXRzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uQ2hhbmdlS2l0XG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuXG4gICBvbkxlZnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5wcmV2aW91c0tpdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuXG4gICBvblJpZ2h0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSBsYWJlbCBvbiB0aGVcbiAgICMga2l0IHNlbGVjdG9yXG5cbiAgIG9uQ2hhbmdlS2l0OiAobW9kZWwpIC0+XG4gICAgICBAa2l0TW9kZWwgPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsXG4gICAgICBAJGtpdExhYmVsLnRleHQgQGtpdE1vZGVsLmdldCAnbGFiZWwnXG5cblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdFNlbGVjdG9yIiwiIyMjKlxuICogU291bmQgdHlwZSBzZWxlY3RvciBmb3IgY2hvb3Npbmcgd2hpY2ggc291bmQgc2hvdWxkXG4gKiBwbGF5IG9uIGVhY2ggdHJhY2tcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBJbnN0cnVtZW50IGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIHZpZXcgY2xhc3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnaW5zdHJ1bWVudCdcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFJlZiB0byB0aGUgSW5zdHJ1bWVudE1vZGVsXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG5cbiAgIG1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIHBhcmVudCBraXRcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRNb2RlbDogbnVsbFxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQnOiAnb25DbGljaydcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBjbGljayBldmVudHMuICBVcGRhdGVzIHRoZSBjdXJyZW50IGluc3RydW1lbnQgbW9kZWwsIHdoaWNoXG4gICAjIEluc3RydW1lbnRTZWxlY3RvclBhbmVsIGxpc3RlbnMgdG8sIGFuZCBhZGRzIGEgc2VsZWN0ZWQgc3RhdGVcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGtpdE1vZGVsLnNldCAnY3VycmVudEluc3RydW1lbnQnLCBAbW9kZWxcbiAgICAgIEAkZWwuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudCIsIiMjIypcbiAqIFBhbmVsIHdoaWNoIGhvdXNlcyBlYWNoIGluZGl2aWR1YWwgc2VsZWN0YWJsZSBzb3VuZFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuSW5zdHJ1bWVudCAgPSByZXF1aXJlICcuL0luc3RydW1lbnQuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXBhbmVsLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCBleHRlbmRzIFZpZXdcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFJlZiB0byB0aGUgYXBwbGljYXRpb24gbW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIGtpdCBjb2xsZWN0aW9uXG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQga2l0XG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0TW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byBpbnN0cnVtZW50IHZpZXdzXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgaW5zdHJ1bWVudFZpZXdzOiBudWxsXG5cblxuXG5cbiAgICMgSW5pdGlhbGl6ZXMgdGhlIGluc3RydW1lbnQgc2VsZWN0b3IgYW5kIHNldHMgYSBsb2NhbCByZWZcbiAgICMgdG8gdGhlIGN1cnJlbnQga2l0IG1vZGVsIGZvciBlYXN5IGFjY2Vzc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQGtpdE1vZGVsID0gQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKVxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYXMgd2VsbCBhcyB0aGUgYXNzb2NpYXRlZCBraXQgaW5zdHJ1bWVudHNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRjb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItaW5zdHJ1bWVudHMnXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW5kZXJzIGVhY2ggaW5kaXZpZHVhbCBraXQgbW9kZWwgaW50byBhbiBJbnN0cnVtZW50XG5cbiAgIHJlbmRlckluc3RydW1lbnRzOiAtPlxuICAgICAgQGluc3RydW1lbnRWaWV3cyA9IFtdXG5cbiAgICAgIEBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuZWFjaCAobW9kZWwpID0+XG4gICAgICAgICBpbnN0cnVtZW50ID0gbmV3IEluc3RydW1lbnRcbiAgICAgICAgICAgIGtpdE1vZGVsOiBAa2l0TW9kZWxcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuXG4gICAgICAgICBAJGNvbnRhaW5lci5hcHBlbmQgaW5zdHJ1bWVudC5yZW5kZXIoKS5lbFxuICAgICAgICAgQGluc3RydW1lbnRWaWV3cy5wdXNoIGluc3RydW1lbnRcblxuXG5cblxuICAgIyBBZGRzIGV2ZW50IGxpc3RlbmVycyByZWxhdGVkIHRvIGtpdCBjaGFuZ2VzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uS2l0Q2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGtpdE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cblxuICAgIyBSZW1vdmVzIGV2ZW50IGxpc3RlbmVyc1xuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cblxuXG4gICAjIEVWRU5UIExJU1RFTkVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIENsZWFucyB1cCB0aGUgdmlldyBhbmQgcmUtcmVuZGVyc1xuICAgIyB0aGUgaW5zdHJ1bWVudHMgdG8gdGhlIERPTVxuICAgIyBAcGFyYW0ge0tpdE1vZGVsfSBtb2RlbFxuXG4gICBvbktpdENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQHJlbW92ZUV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQGtpdE1vZGVsID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbFxuXG4gICAgICBfLmVhY2ggQGluc3RydW1lbnRWaWV3cywgKGluc3RydW1lbnQpIC0+XG4gICAgICAgICBpbnN0cnVtZW50LnJlbW92ZSgpXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICBvbkluc3RydW1lbnRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEAkY29udGFpbmVyLmZpbmQoJy5pbnN0cnVtZW50JykucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuXG5cbiAgIG9uVGVzdENsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9J2NvbnRhaW5lci1pbnN0cnVtZW50cyc+XFxuXFxuPC9kaXY+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIjtcblxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9J2ljb24gXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmljb24pIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmljb247IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCInPjwvZGl2PlxcbjxkaXYgY2xhc3M9J2xhYmVsJz5cXG5cdFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCIjIyMqXG4gKiBMaXZlIE1QQyBcInBhZFwiIGNvbXBvbmVudFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9saXZlLXBhZC10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgTGl2ZVBhZCBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMaXZlUGFkIiwiIyMjKlxuICogTGl2ZSBNUEMgXCJwYWRcIiBjb21wb25lbnRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGFkLXNxdWFyZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgUGFkU3F1YXJlIGV4dGVuZHMgVmlld1xuXG4gICB0YWdOYW1lOiAndGQnXG4gICBjbGFzc05hbWU6ICdwYWQtc3F1YXJlJ1xuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kJzogJ29uQ2xpY2snXG5cblxuICAgc2V0U291bmQ6IC0+XG5cblxuICAgcmVtb3ZlU291bmQ6IC0+XG5cblxuICAgb25DbGljazogKGV2ZW50KSA9PlxuXG5cbiAgIG9uRHJhZzogKGV2ZW50KSAtPlxuXG5cbiAgIG9uRHJvcDogKGV2ZW50KSAtPlxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFkU3F1YXJlIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCJMaXZlIFBhZCB2aWV3XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdrZXktY29kZSc+XFxuXHRrZXkgY29kZVxcbjwvZGl2PlwiO1xuICB9KSIsIiMjIypcbiAqIEluZGl2aWR1YWwgc2VxdWVuY2VyIHRyYWNrc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBFdmVudCAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGF0dGVybi1zcXVhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmUgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgY29udGFpbmVyIGNsYXNzbmFtZVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdwYXR0ZXJuLXNxdWFyZSdcblxuXG4gICAjIFRoZSBET00gdGFnIGFuZW1cbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdGFnTmFtZTogJ3RkJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBUaGUgbW9kZWwgd2hpY2ggY29udHJvbHMgdm9sdW1lLCBwbGF5YmFjaywgZXRjXG4gICAjIEB0eXBlIHtQYXR0ZXJuU3F1YXJlTW9kZWx9XG4gICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG51bGxcblxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kJzogJ29uQ2xpY2snXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYW5kIGluc3RhbnRpYXRlcyB0aGUgaG93bGVyIGF1ZGlvIGVuZ2luZVxuICAgIyBAcGF0dGVyblNxdWFyZU1vZGVsIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgYXVkaW9TcmMgPSBAcGF0dGVyblNxdWFyZU1vZGVsLmdldCgnaW5zdHJ1bWVudCcpLmdldCAnc3JjJ1xuXG4gICAgICAjIFRPRE86IFRlc3QgbWV0aG9kc1xuICAgICAgaWYgd2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZigndGVzdCcpIGlzbnQgLTEgdGhlbiBhdWRpb1NyYyA9ICcnXG5cbiAgICAgIEBhdWRpb1BsYXliYWNrID0gbmV3IEhvd2xcbiAgICAgICAgIHZvbHVtZTogQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubG93XG4gICAgICAgICB1cmxzOiBbYXVkaW9TcmNdXG4gICAgICAgICBvbmVuZDogQG9uU291bmRFbmRcblxuICAgICAgQFxuXG5cblxuXG4gICAjIFJlbW92ZSB0aGUgdmlldyBhbmQgZGVzdHJveSB0aGUgYXVkaW8gcGxheWJhY2tcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2sudW5sb2FkKClcbiAgICAgIHN1cGVyKClcblxuXG5cblxuICAgIyBBZGRzIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVnaW5zIGxpc3RlbmluZyBmb3IgdmVsb2NpdHksIGFjdGl2aXR5IGFuZCB0cmlnZ2Vyc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAcGF0dGVyblNxdWFyZU1vZGVsLCBBcHBFdmVudC5DSEFOR0VfVkVMT0NJVFksIEBvblZlbG9jaXR5Q2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0FDVElWRSwgICBAb25BY3RpdmVDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAcGF0dGVyblNxdWFyZU1vZGVsLCBBcHBFdmVudC5DSEFOR0VfVFJJR0dFUiwgIEBvblRyaWdnZXJDaGFuZ2VcblxuXG5cblxuICAgIyBFbmFibGUgcGxheWJhY2sgb2YgdGhlIGF1ZGlvIHNxdWFyZVxuXG4gICBlbmFibGU6IC0+XG4gICAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmVuYWJsZSgpXG5cblxuXG5cbiAgICMgRGlzYWJsZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgIGRpc2FibGU6IC0+XG4gICAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmRpc2FibGUoKVxuXG5cblxuXG4gICAjIFBsYXliYWNrIGF1ZGlvIG9uIHRoZSBhdWRpbyBzcXVhcmVcblxuICAgcGxheTogLT5cbiAgICAgIEBhdWRpb1BsYXliYWNrLnBsYXkoKVxuXG4gICAgICBUd2Vlbk1heC50byBAJGVsLCAuMixcbiAgICAgICAgIGVhc2U6IEJhY2suZWFzZUluXG4gICAgICAgICBzY2FsZTogLjVcblxuICAgICAgICAgb25Db21wbGV0ZTogPT5cblxuICAgICAgICAgICAgVHdlZW5NYXgudG8gQCRlbCwgLjIsXG4gICAgICAgICAgICAgICBzY2FsZTogMVxuICAgICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgY2xpY2sgZXZlbnRzIG9uIHRoZSBhdWRpbyBzcXVhcmUuICBUb2dnbGVzIHRoZVxuICAgIyB2b2x1bWUgZnJvbSBsb3cgdG8gaGlnaCB0byBvZmZcblxuICAgb25DbGljazogKGV2ZW50KSAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5jeWNsZSgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgdmVsb2NpdHkgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIHZpc3VhbCBkaXNwbGF5IGFuZCBzZXRzIHZvbHVtZVxuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25WZWxvY2l0eUNoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgdmVsb2NpdHkgPSBtb2RlbC5jaGFuZ2VkLnZlbG9jaXR5XG5cbiAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgJ3ZlbG9jaXR5LWxvdyB2ZWxvY2l0eS1tZWRpdW0gdmVsb2NpdHktaGlnaCdcblxuICAgICAgIyBTZXQgdmlzdWFsIGluZGljYXRvclxuICAgICAgdmVsb2NpdHlDbGFzcyA9IHN3aXRjaCB2ZWxvY2l0eVxuICAgICAgICAgd2hlbiAxIHRoZW4gJ3ZlbG9jaXR5LWxvdydcbiAgICAgICAgIHdoZW4gMiB0aGVuICd2ZWxvY2l0eS1tZWRpdW0nXG4gICAgICAgICB3aGVuIDMgdGhlbiAndmVsb2NpdHktaGlnaCdcbiAgICAgICAgIGVsc2UgJydcblxuICAgICAgQCRlbC5hZGRDbGFzcyB2ZWxvY2l0eUNsYXNzXG5cblxuICAgICAgIyBTZXQgYXVkaW8gdm9sdW1lXG4gICAgICB2b2x1bWUgPSBzd2l0Y2ggdmVsb2NpdHlcbiAgICAgICAgIHdoZW4gMSB0aGVuIEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLmxvd1xuICAgICAgICAgd2hlbiAyIHRoZW4gQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubWVkaXVtXG4gICAgICAgICB3aGVuIDMgdGhlbiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5oaWdoXG4gICAgICAgICBlbHNlICcnXG5cbiAgICAgIEBhdWRpb1BsYXliYWNrLnZvbHVtZSggdm9sdW1lIClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBhY3Rpdml0eSBjaGFuZ2UgZXZlbnRzLiAgV2hlbiBpbmFjdGl2ZSwgY2hlY2tzIGFnYWluc3QgcGxheWJhY2sgYXJlXG4gICAjIG5vdCBwZXJmb3JtZWQgYW5kIHRoZSBzcXVhcmUgaXMgc2tpcHBlZC5cbiAgICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uQWN0aXZlQ2hhbmdlOiAobW9kZWwpIC0+XG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgdHJpZ2dlciBcInBsYXliYWNrXCIgZXZlbnRzXG4gICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gICBvblRyaWdnZXJDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIGlmIG1vZGVsLmNoYW5nZWQudHJpZ2dlciBpcyB0cnVlXG4gICAgICAgICBAcGxheSgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Igc291bmQgcGxheWJhY2sgZW5kIGV2ZW50cy4gIFJlbW92ZXMgdGhlIHRyaWdnZXJcbiAgICMgZmxhZyBzbyB0aGUgYXVkaW8gd29uJ3Qgb3ZlcmxhcFxuXG4gICBvblNvdW5kRW5kOiA9PlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5zZXQgJ3RyaWdnZXInLCBmYWxzZVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmUiLCIjIyMqXG4gKiBJbmRpdmlkdWFsIHNlcXVlbmNlciB0cmFja3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlICAgICAgICAgICA9IHJlcXVpcmUgJy4vUGF0dGVyblNxdWFyZS5jb2ZmZWUnXG5WaWV3ICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGF0dGVybi10cmFjay10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgUGF0dGVyblRyYWNrIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIG5hbWUgb2YgdGhlIGNsYXNzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3BhdHRlcm4tdHJhY2snXG5cblxuICAgIyBUaGUgdHlwZSBvZiB0YWdcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdGFnTmFtZTogJ3RyJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBBIGNvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCB2aWV3IHNxdWFyZXNcbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBwYXR0ZXJuU3F1YXJlVmlld3M6IG51bGxcblxuXG4gICAjIEB0eXBlIHtQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbn1cbiAgIGNvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICBtb2RlbDogbnVsbFxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5sYWJlbC1pbnN0cnVtZW50JzogJ29uTGFiZWxDbGljaydcbiAgICAgICd0b3VjaGVuZCAuYnRuLW11dGUnOiAgICAgICAgICdvbk11dGVCdG5DbGljaydcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGFuZCByZW5kZXJzIG91dCBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGxhYmVsID0gQCRlbC5maW5kICcubGFiZWwtaW5zdHJ1bWVudCdcblxuICAgICAgQHJlbmRlclBhdHRlcm5TcXVhcmVzKClcblxuICAgICAgQFxuXG5cblxuXG4gICAjIEFkZCBsaXN0ZW5lcnMgdG8gdGhlIHZpZXcgd2hpY2ggbGlzdGVuIGZvciB2aWV3IGNoYW5nZXNcbiAgICMgYXMgd2VsbCBhcyBjaGFuZ2VzIHRvIHRoZSBjb2xsZWN0aW9uLCB3aGljaCBzaG91bGQgdXBkYXRlXG4gICAjIHBhdHRlcm4gc3F1YXJlcyB3aXRob3V0IHJlLXJlbmRlcmluZyB0aGUgdmlld3NcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAa2l0TW9kZWwgPSBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpXG5cbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsICAgIEFwcEV2ZW50LkNIQU5HRV9GT0NVUywgICAgICBAb25Gb2N1c0NoYW5nZVxuICAgICAgQGxpc3RlblRvIEBtb2RlbCwgICAgQXBwRXZlbnQuQ0hBTkdFX01VVEUsICAgICAgIEBvbk11dGVDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAa2l0TW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9JTlNUUlVNRU5ULCBAb25JbnN0cnVtZW50Q2hhbmdlXG5cblxuXG5cbiAgICMgUmVuZGVyIG91dCB0aGUgcGF0dGVybiBzcXVhcmVzIGFuZCBwdXNoIHRoZW0gaW50byBhbiBhcnJheVxuICAgIyBmb3IgZnVydGhlciBpdGVyYXRpb25cblxuICAgcmVuZGVyUGF0dGVyblNxdWFyZXM6IC0+XG4gICAgICBAcGF0dGVyblNxdWFyZVZpZXdzID0gW11cblxuICAgICAgQGNvbGxlY3Rpb24gPSBuZXcgUGF0dGVyblNxdWFyZUNvbGxlY3Rpb25cblxuICAgICAgXyg4KS50aW1lcyA9PlxuICAgICAgICAgQGNvbGxlY3Rpb24uYWRkIG5ldyBQYXR0ZXJuU3F1YXJlTW9kZWwgeyBpbnN0cnVtZW50OiBAbW9kZWwgfVxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChtb2RlbCkgPT5cbiAgICAgICAgIHBhdHRlcm5TcXVhcmUgPSBuZXcgUGF0dGVyblNxdWFyZVxuICAgICAgICAgICAgcGF0dGVyblNxdWFyZU1vZGVsOiBtb2RlbFxuXG4gICAgICAgICBAJGxhYmVsLnRleHQgbW9kZWwuZ2V0ICdsYWJlbCdcbiAgICAgICAgIEAkZWwuYXBwZW5kIHBhdHRlcm5TcXVhcmUucmVuZGVyKCkuZWxcbiAgICAgICAgIEBwYXR0ZXJuU3F1YXJlVmlld3MucHVzaCBwYXR0ZXJuU3F1YXJlXG5cbiAgICAgICMgU2V0IHRoZSBzcXVhcmVzIG9uIHRoZSBJbnN0cnVtZW50IG1vZGVsIHRvIHRyYWNrIGFnYWluc3Qgc3RhdGVcbiAgICAgIEBtb2RlbC5zZXQgJ3BhdHRlcm5TcXVhcmVzJywgQGNvbGxlY3Rpb25cblxuXG5cbiAgICMgTXV0ZSB0aGUgZW50aXJlIHRyYWNrXG5cbiAgIG11dGU6IC0+XG4gICAgICBAbW9kZWwuc2V0ICdtdXRlJywgdHJ1ZVxuXG5cblxuICAgIyBVbm11dGUgdGhlIGVudGlyZSB0cmFja1xuXG4gICB1bm11dGU6IC0+XG4gICAgICBAbW9kZWwuc2V0ICdtdXRlJywgZmFsc2VcblxuXG5cbiAgIHNlbGVjdDogLT5cbiAgICAgIEAkZWwuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuICAgZGVzZWxlY3Q6IC0+XG4gICAgICBpZiBAJGVsLmhhc0NsYXNzICdzZWxlY3RlZCdcbiAgICAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuICAgZm9jdXM6IC0+XG4gICAgICBAJGVsLmFkZENsYXNzICdmb2N1cydcblxuXG5cblxuICAgdW5mb2N1czogLT5cbiAgICAgIGlmIEAkZWwuaGFzQ2xhc3MgJ2ZvY3VzJ1xuICAgICAgICAgQCRlbC5yZW1vdmVDbGFzcyAnZm9jdXMnXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgY2hhbmdlcyB0byB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGluc3RydW1lbnRcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IGluc3RydW1lbnRNb2RlbFxuXG4gICBvbkluc3RydW1lbnRDaGFuZ2U6IChpbnN0cnVtZW50TW9kZWwpID0+XG4gICAgICBpbnN0cnVtZW50ID0gaW5zdHJ1bWVudE1vZGVsLmNoYW5nZWQuY3VycmVudEluc3RydW1lbnRcblxuICAgICAgaWYgaW5zdHJ1bWVudC5jaWQgaXMgQG1vZGVsLmNpZFxuICAgICAgICAgQHNlbGVjdCgpXG5cbiAgICAgIGVsc2UgQGRlc2VsZWN0KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtdXRlIG1vZGVsIGNoYW5nZSBldmVudHNcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uTXV0ZUNoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgbXV0ZSA9IG1vZGVsLmNoYW5nZWQubXV0ZVxuXG4gICAgICBpZiBtdXRlXG4gICAgICAgICBAJGVsLmFkZENsYXNzICdtdXRlJ1xuXG4gICAgICBlbHNlIEAkZWwucmVtb3ZlQ2xhc3MgJ211dGUnXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGZvY3VzIGNoYW5nZSBldmVudHNcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uRm9jdXNDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIGlmIG1vZGVsLmNoYW5nZWQuZm9jdXNcbiAgICAgICAgICBAZm9jdXMoKVxuICAgICAgZWxzZVxuICAgICAgICAgIEB1bmZvY3VzKClcblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBidXR0b24gY2xpY2tzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbkxhYmVsQ2xpY2s6IChldmVudCkgPT5cbiAgICAgIGlmIEBtb2RlbC5nZXQoJ211dGUnKSBpc250IHRydWVcbiAgICAgICAgIEBtb2RlbC5zZXQgJ2ZvY3VzJywgISBAbW9kZWwuZ2V0KCdmb2N1cycpXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtdXRlIGJ1dHRvbiBjbGlja3NcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uTXV0ZUJ0bkNsaWNrOiAoZXZlbnQpID0+XG4gICAgICBpZiBAbW9kZWwuZ2V0ICdtdXRlJ1xuICAgICAgICAgQHVubXV0ZSgpXG5cbiAgICAgIGVsc2UgQG11dGUoKVxuXG5cblxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblRyYWNrIiwiIyMjKlxuICogU2VxdWVuY2VyIHBhcmVudCB2aWV3IGZvciB0cmFjayBzZXF1ZW5jZXNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5QYXR0ZXJuVHJhY2sgPSByZXF1aXJlICcuL1BhdHRlcm5UcmFjay5jb2ZmZWUnXG5BcHBFdmVudCAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuaGVscGVycyAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vaGVscGVycy9oYW5kbGViYXJzLWhlbHBlcnMnXG50ZW1wbGF0ZSAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zZXF1ZW5jZXItdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFNlcXVlbmNlciBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBuYW1lIG9mIHRoZSBjb250YWluZXIgY2xhc3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnc2VxdWVuY2VyLWNvbnRhaW5lcidcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgQW4gYXJyYXkgb2YgYWxsIHBhdHRlcm4gdHJhY2tzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHBhdHRlcm5UcmFja1ZpZXdzOiBudWxsXG5cblxuICAgIyBUaGUgc2V0SW50ZXJ2YWwgdGlja2VyXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGJwbUludGVydmFsOiBudWxsXG5cblxuICAgIyBUaGUgdGltZSBpbiB3aGljaCB0aGUgaW50ZXJ2YWwgZmlyZXNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgdXBkYXRlSW50ZXJ2YWxUaW1lOiAyMDBcblxuXG4gICAjIFRoZSBjdXJyZW50IGJlYXQgaWRcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgY3VyckJlYXRDZWxsSWQ6IC0xXG5cblxuICAgIyBUT0RPOiBVcGRhdGUgdGhpcyB0byBtYWtlIGl0IG1vcmUgZHluYW1pY1xuICAgIyBUaGUgbnVtYmVyIG9mIGJlYXQgY2VsbHNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgbnVtQ2VsbHM6IDdcblxuXG4gICAjIEdsb2JhbCBhcHBsaWNhdGlvbiBtb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBDb2xsZWN0aW9uIG9mIGluc3RydW1lbnRzXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cblxuICAgY29sbGVjdGlvbjogbnVsbFxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9XG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkdGhTdGVwcGVyID0gQCRlbC5maW5kICd0aC5zdGVwcGVyJ1xuICAgICAgQCRzZXF1ZW5jZXIgPSBAJGVsLmZpbmQgJy5zZXF1ZW5jZXInXG5cbiAgICAgIEByZW5kZXJUcmFja3MoKVxuICAgICAgQHBsYXkoKVxuXG4gICAgICBAXG5cblxuICAgIyBSZW1vdmVzIHRoZSB2aWV3IGZyb20gdGhlIERPTSBhbmQgY2FuY2Vsc1xuICAgIyB0aGUgdGlja2VyIGludGVydmFsXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIHN1cGVyKClcbiAgICAgIEBwYXVzZSgpXG5cblxuXG4gICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRsaW5nIGluc3RydW1lbnQgYW5kIHBsYXliYWNrXG4gICAjIGNoYW5nZXMuICBVcGRhdGVzIGFsbCBvZiB0aGUgdmlld3MgYWNjb3JkaW5nbHlcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfQlBNLCBAb25CUE1DaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9QTEFZSU5HLCBAb25QbGF5aW5nQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfS0lULCBAb25LaXRDaGFuZ2VcblxuICAgICAgQGxpc3RlblRvIEBjb2xsZWN0aW9uLCBBcHBFdmVudC5DSEFOR0VfRk9DVVMsIEBvbkZvY3VzQ2hhbmdlXG5cblxuXG4gICAjIFJlbmRlcnMgb3V0IGVhY2ggaW5kaXZpZHVhbCB0cmFjay5cbiAgICMgVE9ETzogTmVlZCB0byB1cGRhdGUgc28gdGhhdCBhbGwgb2YgdGhlIGJlYXQgc3F1YXJlcyBhcmVuJ3RcbiAgICMgYmxvd24gYXdheSBieSB0aGUgcmUtcmVuZGVyXG5cbiAgIHJlbmRlclRyYWNrczogPT5cbiAgICAgIEAkZWwuZmluZCgnLnBhdHRlcm4tdHJhY2snKS5yZW1vdmUoKVxuXG4gICAgICBAcGF0dGVyblRyYWNrVmlld3MgPSBbXVxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChtb2RlbCkgPT5cblxuICAgICAgICAgcGF0dGVyblRyYWNrID0gbmV3IFBhdHRlcm5UcmFja1xuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgICAgY29sbGVjdGlvbjogbW9kZWwuZ2V0ICdwYXR0ZXJuU3F1YXJlcydcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuXG4gICAgICAgICBAcGF0dGVyblRyYWNrVmlld3MucHVzaCBwYXR0ZXJuVHJhY2tcbiAgICAgICAgIEAkc2VxdWVuY2VyLmFwcGVuZCBwYXR0ZXJuVHJhY2sucmVuZGVyKCkuZWxcblxuXG5cblxuICAgIyBVcGRhdGUgdGhlIHRpY2tlciB0aW1lLCBhbmQgYWR2YW5jZXMgdGhlIGJlYXRcblxuICAgdXBkYXRlVGltZTogPT5cbiAgICAgIEAkdGhTdGVwcGVyLnJlbW92ZUNsYXNzICdzdGVwJ1xuICAgICAgQGN1cnJCZWF0Q2VsbElkID0gaWYgQGN1cnJCZWF0Q2VsbElkIDwgQG51bUNlbGxzIHRoZW4gQGN1cnJCZWF0Q2VsbElkICs9IDEgZWxzZSBAY3VyckJlYXRDZWxsSWQgPSAwXG4gICAgICAkKEAkdGhTdGVwcGVyW0BjdXJyQmVhdENlbGxJZF0pLmFkZENsYXNzICdzdGVwJ1xuXG4gICAgICBAcGxheUF1ZGlvKClcblxuXG5cblxuICAgIyBDb252ZXJ0cyBtaWxsaXNlY29uZHMgdG8gQlBNXG5cbiAgIGNvbnZlcnRCUE06IC0+XG4gICAgICByZXR1cm4gMjAwXG5cblxuXG4gICAjIFN0YXJ0IHBsYXliYWNrIG9mIHNlcXVlbmNlclxuXG4gICBwbGF5OiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAncGxheWluZycsIHRydWVcblxuXG5cblxuICAgIyBQYXVzZXMgc2VxdWVuY2VyIHBsYXliYWNrXG5cbiAgIHBhdXNlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAncGxheWluZycsIGZhbHNlXG5cblxuXG5cbiAgICMgTXV0ZXMgdGhlIHNlcXVlbmNlclxuXG4gICBtdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAnbXV0ZScsIHRydWVcblxuXG5cblxuICAgIyBVbm11dGVzIHRoZSBzZXF1ZW5jZXJcblxuICAgdW5tdXRlOiAtPlxuICAgICAgIEBhcHBNb2RlbC5zZXQgJ211dGUnLCBmYWxzZVxuXG5cblxuXG5cbiAgICMgUGxheXMgYXVkaW8gb2YgZWFjaCB0cmFjayBjdXJyZW50bHkgZW5hYmxlZCBhbmQgb25cblxuICAgcGxheUF1ZGlvOiAtPlxuICAgICAgZm9jdXNlZEluc3RydW1lbnQgPSAgQGNvbGxlY3Rpb24uZmluZFdoZXJlIHsgZm9jdXM6IHRydWUgfVxuXG4gICAgICAjIENoZWNrIGlmIHRoZXJlJ3MgYSBmb2N1c2VkIHRyYWNrIGFuZCBvbmx5XG4gICAgICAjIHBsYXkgYXVkaW8gZnJvbSB0aGVyZVxuXG4gICAgICBpZiBmb2N1c2VkSW5zdHJ1bWVudFxuICAgICAgICAgaWYgZm9jdXNlZEluc3RydW1lbnQuZ2V0KCdtdXRlJykgaXNudCB0cnVlXG4gICAgICAgICAgICBmb2N1c2VkSW5zdHJ1bWVudC5nZXQoJ3BhdHRlcm5TcXVhcmVzJykuZWFjaCAocGF0dGVyblNxdWFyZSwgaW5kZXgpID0+XG4gICAgICAgICAgICAgICBAcGxheVBhdHRlcm5TcXVhcmVBdWRpbyggcGF0dGVyblNxdWFyZSwgaW5kZXggKVxuXG4gICAgICAgICByZXR1cm5cblxuXG4gICAgICAjIElmIG5vdGhpbmcgaXMgZm9jdXNlZCwgdGhlbiBjaGVjayBhZ2FpbnN0XG4gICAgICAjIHRoZSBlbnRpcmUgbWF0cml4XG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKGluc3RydW1lbnQpID0+XG4gICAgICAgICBpZiBpbnN0cnVtZW50LmdldCgnbXV0ZScpIGlzbnQgdHJ1ZVxuICAgICAgICAgICAgaW5zdHJ1bWVudC5nZXQoJ3BhdHRlcm5TcXVhcmVzJykuZWFjaCAocGF0dGVyblNxdWFyZSwgaW5kZXgpID0+XG4gICAgICAgICAgICAgICBAcGxheVBhdHRlcm5TcXVhcmVBdWRpbyggcGF0dGVyblNxdWFyZSwgaW5kZXggKVxuXG5cblxuXG4gICAjIFBsYXlzIHRoZSBhdWRpbyBvbiBhbiBpbmRpdmlkdWFsIFBhdHRlclNxdWFyZSBpZiB0ZW1wbyBpbmRleFxuICAgIyBpcyB0aGUgc2FtZSBhcyB0aGUgaW5kZXggd2l0aGluIHRoZSBjb2xsZWN0aW9uXG4gICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZX0gcGF0dGVyblNxdWFyZVxuICAgIyBAcGFyYW0ge051bWJlcn0gaW5kZXhcblxuICAgcGxheVBhdHRlcm5TcXVhcmVBdWRpbzogKHBhdHRlcm5TcXVhcmUsIGluZGV4KSAtPlxuICAgICAgaWYgQGN1cnJCZWF0Q2VsbElkIGlzIGluZGV4XG4gICAgICAgICBpZiBwYXR0ZXJuU3F1YXJlLmdldCAnYWN0aXZlJ1xuICAgICAgICAgICAgcGF0dGVyblNxdWFyZS5zZXQgJ3RyaWdnZXInLCB0cnVlXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgQlBNIHRlbXBvIGNoYW5nZXNcbiAgICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICAgb25CUE1DaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIGNsZWFySW50ZXJ2YWwgQGJwbUludGVydmFsXG4gICAgICBAdXBkYXRlSW50ZXJ2YWxUaW1lID0gbW9kZWwuY2hhbmdlZC5icG1cbiAgICAgIEBicG1JbnRlcnZhbCA9IHNldEludGVydmFsIEB1cGRhdGVUaW1lLCBAdXBkYXRlSW50ZXJ2YWxUaW1lXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgcGxheWJhY2sgY2hhbmdlcy4gIElmIHBhdXNlZCwgaXQgc3RvcHMgcGxheWJhY2sgYW5kXG4gICAjIGNsZWFycyB0aGUgaW50ZXJ2YWwuICBJZiBwbGF5aW5nLCBpdCByZXNldHMgaXRcbiAgICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICAgb25QbGF5aW5nQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBwbGF5aW5nID0gbW9kZWwuY2hhbmdlZC5wbGF5aW5nXG5cbiAgICAgIGlmIHBsYXlpbmdcbiAgICAgICAgIEBicG1JbnRlcnZhbCA9IHNldEludGVydmFsIEB1cGRhdGVUaW1lLCBAdXBkYXRlSW50ZXJ2YWxUaW1lXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIGNsZWFySW50ZXJ2YWwgQGJwbUludGVydmFsXG4gICAgICAgICBAYnBtSW50ZXJ2YWwgPSBudWxsXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBhbmQgdW5tdXRlIGNoYW5nZXNcbiAgICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICAgb25NdXRlQ2hhbmdlOiAobW9kZWwpID0+XG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZXMsIGFzIHNldCBmcm9tIHRoZSBLaXRTZWxlY3RvclxuICAgIyBAcGFyYW0ge0tpdE1vZGVsfSBtb2RlbFxuXG4gICBvbktpdENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQGNvbGxlY3Rpb24gPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKVxuICAgICAgQHJlbmRlclRyYWNrcygpXG5cbiAgICAgICMgRXhwb3J0IG9sZCBwYXR0ZXJuIHNxdWFyZXMgc28gdGhlIHVzZXJzIHBhdHRlcm4gaXNuJ3QgYmxvd24gYXdheVxuICAgICAgIyB3aGVuIGtpdCBjaGFuZ2VzIG9jY3VyXG5cbiAgICAgIG9sZEluc3RydW1lbnRDb2xsZWN0aW9uID0gbW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy5raXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJylcbiAgICAgIG9sZFBhdHRlcm5TcXVhcmVzID0gb2xkSW5zdHJ1bWVudENvbGxlY3Rpb24uZXhwb3J0UGF0dGVyblNxdWFyZXMoKVxuXG5cbiAgICAgICMgVXBkYXRlIHRoZSBuZXcgY29sbGVjdGlvbiB3aXRoIG9sZCBwYXR0ZXJuIHNxdWFyZSBkYXRhXG4gICAgICAjIGFuZCB0cmlnZ2VyIFVJIHVwZGF0ZXMgb24gZWFjaCBzcXVhcmVcblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAoaW5zdHJ1bWVudE1vZGVsLCBpbmRleCkgLT5cbiAgICAgICAgIG9sZENvbGxlY3Rpb24gPSBvbGRQYXR0ZXJuU3F1YXJlc1tpbmRleF1cbiAgICAgICAgIG5ld0NvbGxlY3Rpb24gPSBpbnN0cnVtZW50TW9kZWwuZ2V0ICdwYXR0ZXJuU3F1YXJlcydcblxuICAgICAgICAgIyBVcGRhdGUgdHJhY2sgLyBpbnN0cnVtZW50IGxldmVsIHByb3BlcnRpZXMgbGlrZSB2b2x1bWUgLyBtdXRlIC8gZm9jdXNcbiAgICAgICAgIG9sZFByb3BzID0gb2xkSW5zdHJ1bWVudENvbGxlY3Rpb24uYXQoaW5kZXgpXG5cbiAgICAgICAgIHVubGVzcyBvbGRQcm9wcyBpcyB1bmRlZmluZWRcblxuICAgICAgICAgICAgb2xkUHJvcHMgPSBvbGRQcm9wcy50b0pTT04oKVxuXG4gICAgICAgICAgICBpbnN0cnVtZW50TW9kZWwuc2V0XG4gICAgICAgICAgICAgICB2b2x1bWU6IG9sZFByb3BzLnZvbHVtZVxuICAgICAgICAgICAgICAgYWN0aXZlOiBvbGRQcm9wcy5hY3RpdmVcbiAgICAgICAgICAgICAgIG11dGU6ICAgb2xkUHJvcHMubXV0ZVxuICAgICAgICAgICAgICAgZm9jdXM6ICBvbGRQcm9wcy5mb2N1c1xuXG4gICAgICAgICAjIENoZWNrIGZvciBpbmNvbnNpc3RhbmNpZXMgYmV0d2VlbiBudW1iZXIgb2YgaW5zdHJ1bWVudHNcbiAgICAgICAgIHVubGVzcyBvbGRDb2xsZWN0aW9uIGlzIHVuZGVmaW5lZFxuXG4gICAgICAgICAgICBuZXdDb2xsZWN0aW9uLmVhY2ggKHBhdHRlcm5TcXVhcmUsIGluZGV4KSAtPlxuICAgICAgICAgICAgICAgb2xkUGF0dGVyblNxdWFyZSA9IG9sZENvbGxlY3Rpb24uYXQgaW5kZXhcbiAgICAgICAgICAgICAgIHBhdHRlcm5TcXVhcmUuc2V0IG9sZFBhdHRlcm5TcXVhcmUudG9KU09OKClcblxuXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgZm9jdXMgY2hhbmdlIGV2ZW50cy4gIEl0ZXJhdGVzIG92ZXIgYWxsIG9mIHRoZSBtb2RlbHMgd2l0aGluXG4gICAjIHRoZSBJbnN0cnVtZW50Q29sbGVjdGlvbiBhbmQgdG9nZ2xlcyB0aGVpciBmb2N1cyB0byBvZmYgaWYgdGhlIGNoYW5nZWRcbiAgICMgbW9kZWwncyBmb2N1cyBpcyBzZXQgdG8gdHJ1ZS5cbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uRm9jdXNDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKGluc3RydW1lbnRNb2RlbCkgPT5cbiAgICAgICAgIGlmIG1vZGVsLmNoYW5nZWQuZm9jdXMgaXMgdHJ1ZVxuICAgICAgICAgICAgaWYgbW9kZWwuY2lkIGlzbnQgaW5zdHJ1bWVudE1vZGVsLmNpZFxuICAgICAgICAgICAgICAgaW5zdHJ1bWVudE1vZGVsLnNldCAnZm9jdXMnLCBmYWxzZVxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcXVlbmNlciIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiO1xuXG5cbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuXG4gIGJ1ZmZlciArPSBcIjx0ZCBjbGFzcz0nbGFiZWwtaW5zdHJ1bWVudCc+XFxuXHRcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmxhYmVsOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIlxcbjwvdGQ+XFxuPHRkIGNsYXNzPSdidG4tbXV0ZSc+XFxuXHRtdXRlXFxuPC90ZD5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBzdGFjazIsIG9wdGlvbnMsIHNlbGY9dGhpcywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiXFxuXHRcdFx0PHRoIGNsYXNzPSdzdGVwcGVyJz48L3RoPlxcblx0XHRcIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIjx0YWJsZSBjbGFzcz0nc2VxdWVuY2VyJz5cXG5cdDx0cj5cXG5cdFx0PHRoPjwvdGg+XFxuXHRcdDx0aD48L3RoPlxcblxcblx0XHRcIjtcbiAgb3B0aW9ucyA9IHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfTtcbiAgc3RhY2syID0gKChzdGFjazEgPSBoZWxwZXJzLnJlcGVhdCB8fCBkZXB0aDAucmVwZWF0KSxzdGFjazEgPyBzdGFjazEuY2FsbChkZXB0aDAsIDgsIG9wdGlvbnMpIDogaGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgXCJyZXBlYXRcIiwgOCwgb3B0aW9ucykpO1xuICBpZihzdGFjazIgfHwgc3RhY2syID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazI7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHQ8L3RyPlxcblxcbjwvdGFibGU+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8YnV0dG9uIGNsYXNzPSdidG4tZGVjcmVhc2UnPkRFQ1JFQVNFPC9idXR0b24+XFxuPHNwYW4gY2xhc3M9J2xhYmVsLWJwbSc+MDwvc3Bhbj5cXG48YnV0dG9uIGNsYXNzPSdidG4taW5jcmVhc2UnPklOQ1JFQVNFPC9idXR0b24+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8YnV0dG9uIGNsYXNzPSdidG4tbGVmdCc+TEVGVDwvYnV0dG9uPlxcbjxzcGFuIGNsYXNzPSdsYWJlbC1raXQnPkRSVU0gS0lUPC9zcGFuPlxcbjxidXR0b24gY2xhc3M9J2J0bi1yaWdodCc+UklHSFQ8L2J1dHRvbj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9J2NvbnRhaW5lci1raXQtc2VsZWN0b3InPlxcblx0PGRpdiBjbGFzcz0na2l0LXNlbGVjdG9yJz48L2Rpdj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPSdjb250YWluZXItdmlzdWFsaXphdGlvbic+VmlzdWFsaXphdGlvbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci1zZXF1ZW5jZXInPlxcblxcblx0PGRpdiBjbGFzcz0naW5zdHJ1bWVudC1zZWxlY3Rvcic+SW5zdHJ1bWVudCBTZWxlY3RvcjwvZGl2Plxcblx0PGRpdiBjbGFzcz0nc2VxdWVuY2VyJz5TZXF1ZW5jZXI8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J2JwbSc+QlBNPC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPSdidG4tc2hhcmUnPlNIQVJFPC9kaXY+XFxuXFxuPC9kaXY+XCI7XG4gIH0pIiwiIyMjKlxuICogTGFuZGluZyB2aWV3IHdpdGggc3RhcnQgYnV0dG9uIGFuZCBpbml0aWFsIGFuaW1hdGlvblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblB1YlN1YiAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvUHViU3ViJ1xuUHViRXZlbnQgPSByZXF1aXJlICcuLi8uLi9ldmVudHMvUHViRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2xhbmRpbmctdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIExhbmRpbmdWaWV3IGV4dGVuZHMgVmlld1xuXG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCAuc3RhcnQtYnRuJzogJ29uU3RhcnRCdG5DbGljaydcblxuXG4gICBvblN0YXJ0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIFB1YlN1Yi50cmlnZ2VyIFB1YkV2ZW50LlJPVVRFLFxuICAgICAgICAgcm91dGU6ICdjcmVhdGUnXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IExhbmRpbmdWaWV3IiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8c3BhbiBjbGFzcz0nc3RhcnQtYnRuJz5DUkVBVEU8L3NwYW4+XCI7XG4gIH0pIiwiIyMjKlxuICogU2hhcmUgdGhlIHVzZXIgY3JlYXRlZCBiZWF0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3NoYXJlLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBTaGFyZVZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTaGFyZVZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxhIGhyZWY9Jy8jJz5ORVc8L2E+XCI7XG4gIH0pIiwiIyMjKlxuICogTGFuZGluZyB2aWV3IHdpdGggc3RhcnQgYnV0dG9uIGFuZCBpbml0aWFsIGFuaW1hdGlvblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3Rlc3RzLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBUZXN0c1ZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gVGVzdHNWaWV3IiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8aDE+Q29tcG9uZW50IFZpZXdlcjwvaDE+XFxuXFxuPGJyIC8+XFxuPHA+XFxuXHRNYWtlIHN1cmUgdGhhdCA8Yj5odHRwc3RlcjwvYj4gaXMgcnVubmluZyBpbiB0aGUgPGI+c291cmNlPC9iPiByb3V0ZSAobnBtIGluc3RhbGwgLWcgaHR0cHN0ZXIpIDxici8+XFxuXHQ8YSBocmVmPVxcXCJodHRwOi8vbG9jYWxob3N0OjMzMzMvdGVzdC9odG1sL1xcXCI+TW9jaGEgVGVzdCBSdW5uZXI8L2E+XFxuPC9wPlxcblxcbjxiciAvPlxcbjx1bD5cXG5cdDxsaT48YSBocmVmPScja2l0LXNlbGVjdGlvbic+S2l0IFNlbGVjdGlvbjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNicG0taW5kaWNhdG9yXFxcIj5CUE0gSW5kaWNhdG9yPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2luc3RydW1lbnQtc2VsZWN0b3JcXFwiPkluc3RydW1lbnQgU2VsZWN0b3I8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjcGF0dGVybi1zcXVhcmVcXFwiPlBhdHRlcm4gU3F1YXJlPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI3BhdHRlcm4tdHJhY2tcXFwiPlBhdHRlcm4gVHJhY2s8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjc2VxdWVuY2VyXFxcIj5TZXF1ZW5jZXI8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjZnVsbC1zZXF1ZW5jZXJcXFwiPkZ1bGwgU2VxdWVuY2VyPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI3BhZC1zcXVhcmVcXFwiPlBhZCBTcXVhcmU8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjbGl2ZS1wYWRcXFwiPkxpdmVQYWQ8L2E+PC9saT5cXG48L3VsPlwiO1xuICB9KSJdfQ==

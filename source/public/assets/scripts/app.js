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


},{"./models/AppModel.coffee":12,"./routers/AppRouter.coffee":23,"./supers/View.coffee":26,"./views/create/CreateView.coffee":29,"./views/landing/LandingView.coffee":51,"./views/share/ShareView.coffee":53}],7:[function(require,module,exports){

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
  CHANGE_VELOCITY: 'change:velocity',
  IMPORT_TRACK: 'onImportTrack',
  EXPORT_TRACK: 'onExportTrack'
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
  Parse.initialize("oZgOktrcDXEetGBjCGI6qqRLNbJ7j8GTDMmPyrxb", "U6b0hDT2Isb5blCVd0WU41NJ0EOFgY0Fx7orql4Q");
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


},{"./AppController.coffee":6,"./config/AppConfig.coffee":7,"./helpers/handlebars-helpers":10,"./models/kits/KitCollection.coffee":14,"./utils/Touch":28}],12:[function(require,module,exports){

/**
 * Primary application model which coordinates state
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppConfig, AppModel, Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../config/AppConfig.coffee');

Model = require('../supers/Model.coffee');

AppModel = (function(_super) {
  __extends(AppModel, _super);

  function AppModel() {
    return AppModel.__super__.constructor.apply(this, arguments);
  }

  AppModel.prototype.defaults = {
    'bpm': AppConfig.BPM,
    'mute': null,
    'kitModel': null,
    'playing': null,
    'shareId': null,
    'shareMessage': null,
    'trackTitle': null,
    'view': null,
    'visualization': null
  };

  AppModel.prototype["export"] = function() {
    var json;
    json = this.toJSON();
    json.kitModel = json.kitModel.toJSON();
    json.kitModel.instruments = json.kitModel.instruments.toJSON();
    json.kitModel.instruments = _.map(json.kitModel.instruments, function(instrument) {
      instrument.patternSquares = instrument.patternSquares.toJSON();
      return instrument;
    });
    return json;
  };

  return AppModel;

})(Model);

module.exports = AppModel;


},{"../config/AppConfig.coffee":7,"../supers/Model.coffee":25}],13:[function(require,module,exports){

/**
 * Handles sharing songs between the app and Parse, as well as other services
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.25.14
 */
var AppConfig, Model, SharedTrackModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../config/AppConfig.coffee');

Model = require('../supers/Model.coffee');

SharedTrackModel = (function(_super) {
  __extends(SharedTrackModel, _super);

  function SharedTrackModel() {
    return SharedTrackModel.__super__.constructor.apply(this, arguments);
  }

  SharedTrackModel.prototype.className = 'SharedTrack';

  SharedTrackModel.prototype.defaults = {
    bpm: null,
    instruments: null,
    kitType: null,
    message: null,
    name: null,
    patternSquareGroups: null,
    title: null,
    visualization: null
  };

  return SharedTrackModel;

})(Parse.Object);

module.exports = SharedTrackModel;


},{"../config/AppConfig.coffee":7,"../supers/Model.coffee":25}],14:[function(require,module,exports){

/**
 * Collection of sound kits
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppConfig, Collection, KitCollection, KitModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Collection = require('../../supers/Collection.coffee');

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

})(Collection);

module.exports = KitCollection;


},{"../../config/AppConfig.coffee":7,"../../supers/Collection.coffee":24,"./KitModel.coffee":15}],15:[function(require,module,exports){

/**
 * Kit model for handling state related to kit selection
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var InstrumentCollection, KitModel, Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('../../supers/Model.coffee');

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

})(Model);

module.exports = KitModel;


},{"../../supers/Model.coffee":25,"../sequencer/InstrumentCollection.coffee":19}],16:[function(require,module,exports){

/**
 * Model for the entire Pad component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
 */
var LivePadModel, Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('../../supers/Model.coffee');

LivePadModel = (function(_super) {
  __extends(LivePadModel, _super);

  function LivePadModel() {
    return LivePadModel.__super__.constructor.apply(this, arguments);
  }

  return LivePadModel;

})(Model);

module.exports = LivePadModel;


},{"../../supers/Model.coffee":25}],17:[function(require,module,exports){

/**
 * Collection of individual PadSquareModels
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
 */
var Collection, InstrumentModel, PadSquareCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

InstrumentModel = require('../sequencer/InstrumentModel.coffee');

Collection = require('../../supers/Collection.coffee');

PadSquareCollection = (function(_super) {
  __extends(PadSquareCollection, _super);

  function PadSquareCollection() {
    return PadSquareCollection.__super__.constructor.apply(this, arguments);
  }

  PadSquareCollection.prototype.model = InstrumentModel;

  return PadSquareCollection;

})(Collection);

module.exports = PadSquareCollection;


},{"../../supers/Collection.coffee":24,"../sequencer/InstrumentModel.coffee":20}],18:[function(require,module,exports){

/**
 * Model for individual pad squares.
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
 */
var Model, PadSquareModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('../../supers/Model.coffee');

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

})(Model);

module.exports = PadSquareModel;


},{"../../supers/Model.coffee":25}],19:[function(require,module,exports){

/**
 * Collection representing each sound from a kit set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var Collection, InstrumentCollection, InstrumentModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

InstrumentModel = require('./InstrumentModel.coffee');

Collection = require('../../supers/Collection.coffee');

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

})(Collection);

module.exports = InstrumentCollection;


},{"../../supers/Collection.coffee":24,"./InstrumentModel.coffee":20}],20:[function(require,module,exports){

/**
 * Sound model for each individual kit sound set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppConfig, InstrumentModel, Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../config/AppConfig.coffee');

Model = require('../../supers/Model.coffee');

InstrumentModel = (function(_super) {
  __extends(InstrumentModel, _super);

  function InstrumentModel() {
    return InstrumentModel.__super__.constructor.apply(this, arguments);
  }

  InstrumentModel.prototype.defaults = {
    'active': null,
    'dropped': false,
    'droppedEvent': null,
    'focus': null,
    'icon': null,
    'label': null,
    'mute': null,
    'src': null,
    'volume': null,
    'patternSquares': null
  };

  return InstrumentModel;

})(Model);

module.exports = InstrumentModel;


},{"../../config/AppConfig.coffee":7,"../../supers/Model.coffee":25}],21:[function(require,module,exports){

/**
  A collection of individual pattern squares

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppConfig, AppEvent, Collection, InstrumentModel, PatternSquareCollection, PatternSquareModel, PubSub,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PubSub = require('../../utils/PubSub');

AppEvent = require('../../events/AppEvent.coffee');

AppConfig = require('../../config/AppConfig.coffee');

PatternSquareModel = require('./PatternSquareModel.coffee');

Collection = require('../../supers/Collection.coffee');

InstrumentModel = require('../sequencer/InstrumentModel.coffee');

PatternSquareCollection = (function(_super) {
  __extends(PatternSquareCollection, _super);

  function PatternSquareCollection() {
    return PatternSquareCollection.__super__.constructor.apply(this, arguments);
  }

  PatternSquareCollection.prototype.model = InstrumentModel;

  PatternSquareCollection.prototype.initialize = function(options) {
    return PatternSquareCollection.__super__.initialize.call(this, options);
  };

  PatternSquareCollection.prototype.onImportTrack = function(params) {
    return console.log('firing import!!');
  };

  PatternSquareCollection.prototype.onExportTrack = function(params) {
    return console.log('firing export!!');
  };

  return PatternSquareCollection;

})(Collection);

module.exports = PatternSquareCollection;


},{"../../config/AppConfig.coffee":7,"../../events/AppEvent.coffee":8,"../../supers/Collection.coffee":24,"../../utils/PubSub":27,"../sequencer/InstrumentModel.coffee":20,"./PatternSquareModel.coffee":22}],22:[function(require,module,exports){

/**
  Model for individual pattern squares.  Part of larger Pattern Track collection

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppConfig, AppEvent, Model, PatternSquareModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppEvent = require('../../events/AppEvent.coffee');

AppConfig = require('../../config/AppConfig.coffee');

Model = require('../../supers/Model.coffee');

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

})(Model);

module.exports = PatternSquareModel;


},{"../../config/AppConfig.coffee":7,"../../events/AppEvent.coffee":8,"../../supers/Model.coffee":25}],23:[function(require,module,exports){

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
    'landing': 'landingRoute',
    'create': 'createRoute',
    'share/:id': 'shareRoute',
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

  AppRouter.prototype.shareRoute = function(shareId) {
    console.log(shareId);
    return this.appModel.set({
      'view': this.appController.createView,
      'shareId': shareId
    });
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


},{"../config/AppConfig.coffee":7,"../events/PubEvent.coffee":9,"../models/kits/KitCollection.coffee":14,"../models/kits/KitModel.coffee":15,"../models/pad/LivePadModel.coffee":16,"../models/pad/PadSquareCollection.coffee":17,"../models/pad/PadSquareModel.coffee":18,"../models/sequencer/PatternSquareCollection.coffee":21,"../models/sequencer/PatternSquareModel.coffee":22,"../supers/View.coffee":26,"../utils/PubSub":27,"../views/create/components/BPMIndicator.coffee":30,"../views/create/components/KitSelector.coffee":31,"../views/create/components/instruments/InstrumentSelectorPanel.coffee":33,"../views/create/components/pad/LivePad.coffee":36,"../views/create/components/pad/PadSquare.coffee":37,"../views/create/components/sequencer/PatternSquare.coffee":42,"../views/create/components/sequencer/PatternTrack.coffee":43,"../views/create/components/sequencer/Sequencer.coffee":44,"../views/tests/TestsView.coffee":55}],24:[function(require,module,exports){

/**
 * Collection superclass
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.25.14
 */
var Collection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Collection = (function(_super) {
  __extends(Collection, _super);

  function Collection() {
    return Collection.__super__.constructor.apply(this, arguments);
  }

  return Collection;

})(Backbone.Collection);

module.exports = Collection;


},{}],25:[function(require,module,exports){

/**
 * Model superclass
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.25.14
 */
var Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = (function(_super) {
  __extends(Model, _super);

  function Model() {
    return Model.__super__.constructor.apply(this, arguments);
  }

  return Model;

})(Backbone.Model);

module.exports = Model;


},{}],26:[function(require,module,exports){

/**
 * View superclass containing shared functionality
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   2.17.14
 */
var View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = (function(_super) {
  __extends(View, _super);

  function View() {
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.initialize = function(options) {
    return _.extend(this, _.defaults(options = options || this.defaults, this.defaults || {}));
  };

  View.prototype.render = function(templateData) {
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
  };

  View.prototype.remove = function(options) {
    this.removeEventListeners();
    this.$el.remove();
    return this.undelegateEvents();
  };

  View.prototype.show = function(options) {
    return TweenMax.set(this.$el, {
      autoAlpha: 1
    });
  };

  View.prototype.hide = function(options) {
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
  };

  View.prototype.addEventListeners = function() {};

  View.prototype.removeEventListeners = function() {
    return this.stopListening();
  };

  return View;

})(Backbone.View);

module.exports = View;


},{}],27:[function(require,module,exports){
/**
 * @module     PubSub
 * @desc       Global PubSub object for dispatch and delegation
 */

'use strict'

var PubSub = {}

_.extend( PubSub, Backbone.Events )

module.exports = PubSub
},{}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){

/**
 * Create view which the user can build beats within
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppEvent, BPMIndicator, CreateView, InstrumentSelectorPanel, KitSelector, PubSub, Sequencer, SharedTrackModel, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PubSub = require('../../utils/PubSub');

View = require('../../supers/View.coffee');

AppEvent = require('../../events/AppEvent.coffee');

SharedTrackModel = require('../../models/SharedTrackModel.coffee');

KitSelector = require('../../views/create/components/KitSelector.coffee');

InstrumentSelectorPanel = require('../../views/create/components/instruments/InstrumentSelectorPanel.coffee');

Sequencer = require('../../views/create/components/sequencer/Sequencer.coffee');

BPMIndicator = require('../../views/create/components/BPMIndicator.coffee');

template = require('./templates/create-template.hbs');

CreateView = (function(_super) {
  __extends(CreateView, _super);

  function CreateView() {
    this.onShareBtnClick = __bind(this.onShareBtnClick, this);
    this.onExportBtnClick = __bind(this.onExportBtnClick, this);
    this.onExportTrack = __bind(this.onExportTrack, this);
    this.importTrack = __bind(this.importTrack, this);
    this.saveTrack = __bind(this.saveTrack, this);
    this.exportTrack = __bind(this.exportTrack, this);
    return CreateView.__super__.constructor.apply(this, arguments);
  }

  CreateView.prototype.template = template;

  CreateView.prototype.events = {
    'touchend .btn-share': 'onShareBtnClick',
    'touchend .btn-export': 'onExportBtnClick'
  };

  CreateView.prototype.initialize = function(options) {
    return CreateView.__super__.initialize.call(this, options);
  };

  CreateView.prototype.render = function(options) {
    var shareId;
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
    shareId = this.appModel.get('shareId');
    if (shareId !== null) {
      this.importSharedTrack(shareId);
    }
    return this;
  };

  CreateView.prototype.addEventListeners = function() {
    return PubSub.on(AppEvent.EXPORT_TRACK, this.onExportTrack);
  };

  CreateView.prototype.removeEventListeners = function() {
    return PubSub.off(AppEvent.EXPORT_TRACK);
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

  CreateView.prototype.exportTrack = function() {
    return PubSub.trigger(AppEvent.EXPORT_TRACK, (function(_this) {
      return function(params) {
        return _this.kitType = params.kitType, _this.instruments = params.instruments, _this.patternSquareGroups = params.patternSquareGroups, params;
      };
    })(this));
  };

  CreateView.prototype.saveTrack = function() {
    var sharedTrackModel;
    sharedTrackModel = new SharedTrackModel({
      bpm: this.appModel.get('bpm'),
      instruments: this.instruments,
      kitType: this.kitType,
      patternSquareGroups: this.patternSquareGroups,
      shareMessage: this.appModel.get('shareMessage'),
      trackTitle: this.appModel.get('trackTitle'),
      visualization: this.appModel.get('visualization')
    });
    return sharedTrackModel.save({
      error: (function(_this) {
        return function(object, error) {
          return console.error(object, error);
        };
      })(this),
      success: (function(_this) {
        return function(response) {
          _this.shareId = response.id;
          return console.log(_this.shareId);
        };
      })(this)
    });
  };

  CreateView.prototype.importTrack = function(shareId) {
    var query;
    query = new Parse.Query(SharedTrackModel);
    return query.get(shareId, {
      error: (function(_this) {
        return function(object, error) {
          return console.error(object, error);
        };
      })(this),
      success: (function(_this) {
        return function(sharedTrackModel) {
          return PubSub.trigger(AppEvent.IMPORT_TRACK, {
            kitType: sharedTrackModel.get('kitType'),
            instruments: sharedTrackModel.get('instruments'),
            patternSquareGroups: sharedTrackModel.get('patternSquareGroups'),
            callback: function(response) {}
          });
        };
      })(this)
    });
  };

  CreateView.prototype.onExportTrack = function(callback) {
    var instruments, kit, patternSquareGroups, patternSquares;
    patternSquareGroups = [];
    patternSquares = [];
    kit = this.appModel.get('kitModel').toJSON();
    instruments = this.appModel["export"]().kitModel.instruments;
    instruments = instruments.map((function(_this) {
      return function(instrument) {
        instrument.patternSquares.forEach(function(patternSquare) {
          delete patternSquare.instrument;
          return patternSquares.push(patternSquare);
        });
        return instrument;
      };
    })(this));
    while (patternSquares.length > 0) {
      patternSquareGroups.push(patternSquares.splice(0, 8));
    }
    return callback({
      kitType: this.appModel.get('kitModel').get('label'),
      instruments: instruments,
      patternSquareGroups: patternSquareGroups
    });
  };

  CreateView.prototype.onExportBtnClick = function(event) {
    return this.exportTrack();
  };

  CreateView.prototype.onShareBtnClick = function(event) {
    return this.importTrack(this.shareId);
  };

  return CreateView;

})(View);

module.exports = CreateView;


},{"../../events/AppEvent.coffee":8,"../../models/SharedTrackModel.coffee":13,"../../supers/View.coffee":26,"../../utils/PubSub":27,"../../views/create/components/BPMIndicator.coffee":30,"../../views/create/components/KitSelector.coffee":31,"../../views/create/components/instruments/InstrumentSelectorPanel.coffee":33,"../../views/create/components/sequencer/Sequencer.coffee":44,"./templates/create-template.hbs":50}],30:[function(require,module,exports){

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


},{"../../../config/AppConfig.coffee":7,"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":26,"./templates/bpm-template.hbs":48}],31:[function(require,module,exports){

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


},{"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":26,"./templates/kit-selection-template.hbs":49}],32:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":26,"./templates/instrument-template.hbs":35}],33:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":26,"./Instrument.coffee":32,"./templates/instrument-panel-template.hbs":34}],34:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='container-instruments'>\n\n</div>";
  })
},{"handleify":5}],35:[function(require,module,exports){
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
},{"handleify":5}],36:[function(require,module,exports){

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
    this.parseDraggedAndDropped = __bind(this.parseDraggedAndDropped, this);
    this.onPadSquareDraggingStart = __bind(this.onPadSquareDraggingStart, this);
    this.onPreventInstrumentDrop = __bind(this.onPreventInstrumentDrop, this);
    this.onInstrumentDrop = __bind(this.onInstrumentDrop, this);
    this.onDroppedChange = __bind(this.onDroppedChange, this);
    this.onMouseMove = __bind(this.onMouseMove, this);
    return LivePad.__super__.constructor.apply(this, arguments);
  }

  LivePad.prototype.KEYMAP = ['1', '2', '3', '4', 'q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'];

  LivePad.prototype.className = 'container-live-pad';

  LivePad.prototype.template = template;

  LivePad.prototype.appModel = null;

  LivePad.prototype.kitCollection = null;

  LivePad.prototype.instrumentCollection = null;

  LivePad.prototype.padSquareCollection = null;

  LivePad.prototype.padSquareViews = null;

  LivePad.prototype.mousePosition = {
    x: 0,
    y: 0
  };

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
    this.addEventListeners();
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

  LivePad.prototype.addEventListeners = function() {
    return $(document).on('mousemove', this.onMouseMove);
  };

  LivePad.prototype.removeEventListeners = function() {
    $(document).off('mousemove', this.onMouseMove);
    return this.stopListening();
  };

  LivePad.prototype.onMouseMove = function(event) {
    return this.mousePosition = {
      x: event.pageX,
      y: event.pageY
    };
  };

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

  LivePad.prototype.onInstrumentDrop = function(dragged, dropped, event) {
    var $dragged, $dropped, id, instrumentModel, _ref;
    _ref = this.parseDraggedAndDropped(dragged, dropped), $dragged = _ref.$dragged, $dropped = _ref.$dropped, id = _ref.id, instrumentModel = _ref.instrumentModel;
    $dropped.addClass(id);
    $dropped.attr('data-instrument', "" + id);
    instrumentModel.set({
      'dropped': true,
      'droppedEvent': event
    });
    return _.defer((function(_this) {
      return function() {
        _this.renderInstruments();
        return _this.setDragAndDrop();
      };
    })(this));
  };

  LivePad.prototype.onPreventInstrumentDrop = function(dragged, dropped) {
    var $dragged, $dropped, id, instrumentModel, _ref;
    _ref = this.parseDraggedAndDropped(dragged, dropped), $dragged = _ref.$dragged, $dropped = _ref.$dropped, id = _ref.id, instrumentModel = _ref.instrumentModel;
    instrumentModel.set({
      'dropped': false,
      'droppedEvent': null
    });
    return _.defer((function(_this) {
      return function() {
        _this.renderInstruments();
        return _this.setDragAndDrop();
      };
    })(this));
  };

  LivePad.prototype.onPadSquareDraggingStart = function(params) {
    var $droppedInstrument, $padSquare, draggable, instrumentId, offset, originalDroppedEvent;
    instrumentId = params.instrumentId, $padSquare = params.$padSquare, originalDroppedEvent = params.originalDroppedEvent;
    $droppedInstrument = $(document.getElementById(instrumentId));
    draggable = _.find(this.draggable, (function(_this) {
      return function(draggableElement) {
        if ($(draggableElement._eventTarget).attr('id') === $droppedInstrument.attr('id')) {
          return draggableElement;
        }
      };
    })(this));
    offset = $droppedInstrument.offset();
    $droppedInstrument.css('position', 'absolute');
    TweenMax.set($droppedInstrument, {
      left: this.mousePosition.x - ($droppedInstrument.width() * .5),
      top: this.mousePosition.y - ($droppedInstrument.height() * .5)
    });
    draggable.startDrag(originalDroppedEvent);
    draggable.update(true);
    return $droppedInstrument.show();
  };

  LivePad.prototype.setDragAndDrop = function() {
    var $droppables, self;
    self = this;
    this.$instrument = this.$el.find('.instrument');
    $droppables = this.$el.find('.container-pad');
    return this.draggable = Draggable.create(this.$instrument, {
      onDrag: function(event) {
        var i, instrument, _results;
        i = $droppables.length;
        _results = [];
        while (--i > -1) {
          if (this.hitTest($droppables[i], '50%')) {
            instrument = $($droppables[i]).attr('data-instrument');
            if (instrument === null || instrument === void 0) {
              _results.push($($droppables[i]).addClass('highlight'));
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push($($droppables[i]).removeClass('highlight'));
          }
        }
        return _results;
      },
      onDragEnd: function(event) {
        var droppedProperly, i, instrument, _results;
        i = $droppables.length;
        droppedProperly = false;
        _results = [];
        while (--i > -1) {
          if (this.hitTest($droppables[i], '50%')) {
            instrument = $($droppables[i]).attr('data-instrument');
            if (instrument === null || instrument === void 0) {
              droppedProperly = true;
              self.onInstrumentDrop(this.target, $droppables[i], event);
            } else {
              self.onPreventInstrumentDrop(this.target, $droppables[i]);
            }
          }
          if (droppedProperly === false) {
            _results.push(self.onPreventInstrumentDrop(this.target, $droppables[i]));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    });
  };

  LivePad.prototype.parseDraggedAndDropped = function(dragged, dropped) {
    var $dragged, $dropped, id, instrumentModel;
    $dragged = $(dragged);
    $dropped = $(dropped);
    id = $dragged.attr('id');
    instrumentModel = this.kitCollection.findInstrumentModel(id);
    return {
      $dragged: $dragged,
      $dropped: $dropped,
      id: id,
      instrumentModel: instrumentModel
    };
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
            keycode: _this.KEYMAP[iterator]
          });
          padSquare = new PadSquare({
            model: model,
            collection: _this.kitCollection
          });
          _this.padSquareCollection.add(model);
          _this.padSquareViews.push(padSquare);
          iterator++;
          _this.listenTo(padSquare, AppEvent.CHANGE_DRAGGING, _this.onPadSquareDraggingStart);
          return tds.push({
            'id': padSquare.model.get('id')
          });
        });
        return rows.push({
          'id': "pad-row-" + index,
          'tds': tds
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
          'label': kit.get('label'),
          'instruments': instruments
        };
      };
    })(this));
    return instrumentTable;
  };

  return LivePad;

})(View);

module.exports = LivePad;


},{"../../../../events/AppEvent.coffee":8,"../../../../models/pad/PadSquareCollection.coffee":17,"../../../../models/pad/PadSquareModel.coffee":18,"../../../../supers/View.coffee":26,"./PadSquare.coffee":37,"./templates/instruments-template.hbs":38,"./templates/live-pad-template.hbs":39,"./templates/pads-template.hbs":41}],37:[function(require,module,exports){

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
    this.onDroppedChange = __bind(this.onDroppedChange, this);
    this.onDraggingChange = __bind(this.onDraggingChange, this);
    this.onRelease = __bind(this.onRelease, this);
    this.onPress = __bind(this.onPress, this);
    return PadSquare.__super__.constructor.apply(this, arguments);
  }

  PadSquare.prototype.DRAG_TRIGGER_DELAY = 1000;

  PadSquare.prototype.tagName = 'div';

  PadSquare.prototype.className = 'pad-square';

  PadSquare.prototype.template = template;

  PadSquare.prototype.model = null;

  PadSquare.prototype.currentIcon = null;

  PadSquare.prototype.audioPlayback = null;

  PadSquare.prototype.events = {
    'touchstart': 'onPress',
    'touchend': 'onRelease'
  };

  PadSquare.prototype.render = function(options) {
    PadSquare.__super__.render.call(this, options);
    this.$iconContainer = this.$el.find('.container-icon');
    this.$icon = this.$iconContainer.find('.icon');
    return this;
  };

  PadSquare.prototype.remove = function() {
    this.removeSoundAndClearPad();
    return PadSquare.__super__.remove.call(this);
  };

  PadSquare.prototype.addEventListeners = function() {
    this.listenTo(this.model, AppEvent.CHANGE_TRIGGER, this.onTriggerChange);
    this.listenTo(this.model, AppEvent.CHANGE_DRAGGING, this.onDraggingChange);
    this.listenTo(this.model, AppEvent.CHANGE_DROPPED, this.onDroppedChange);
    return this.listenTo(this.model, AppEvent.CHANGE_INSTRUMENT, this.onInstrumentChange);
  };

  PadSquare.prototype.updateInstrumentClass = function() {
    var instrument;
    instrument = this.model.get('currentInstrument');
    return this.$el.parent().addClass(instrument.get('id'));
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

  PadSquare.prototype.playSound = function() {
    var _ref;
    if ((_ref = this.audioPlayback) != null) {
      _ref.play();
    }
    return this.model.set('trigger', false);
  };

  PadSquare.prototype.removeSoundAndClearPad = function() {
    var currentInstrument, icon, id, _ref;
    if (this.model.get('currentInstrument') === null) {
      return;
    }
    if ((_ref = this.audioPlayback) != null) {
      _ref.unload();
    }
    this.audioPlayback = null;
    currentInstrument = this.model.get('currentInstrument');
    id = currentInstrument.get('id');
    icon = currentInstrument.get('icon');
    this.$el.parent().removeAttr('data-instrument');
    this.$el.parent().removeClass(id);
    this.$el.removeClass(id);
    this.$icon.removeClass(icon);
    this.$icon.text('');
    return _.defer((function(_this) {
      return function() {
        _this.model.set({
          'dragging': false,
          'dropped': false
        });
        currentInstrument.set({
          'dropped': false,
          'droppedEvent': null
        });
        return _this.model.set('currentInstrument', null);
      };
    })(this));
  };

  PadSquare.prototype.onPress = function(event) {
    this.model.set('trigger', true);
    return this.dragTimeout = setTimeout((function(_this) {
      return function() {
        return _this.model.set('dragging', true);
      };
    })(this), this.DRAG_TRIGGER_DELAY);
  };

  PadSquare.prototype.onRelease = function(event) {
    clearTimeout(this.dragTimeout);
    return this.model.set('dragging', false);
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

  PadSquare.prototype.onDraggingChange = function(model) {
    var currentInstrument, dragging, instrumentId, originalDroppedEvent;
    dragging = model.changed.dragging;
    if (dragging === true) {
      instrumentId = this.$el.parent().attr('data-instrument');
      currentInstrument = this.model.get('currentInstrument');
      originalDroppedEvent = currentInstrument.get('droppedEvent');
      this.model.set('dropped', false);
      currentInstrument.set('dropped', false);
      return this.trigger(AppEvent.CHANGE_DRAGGING, {
        'instrumentId': instrumentId,
        '$padSquare': this.$el.parent(),
        'originalDroppedEvent': originalDroppedEvent
      });
    }
  };

  PadSquare.prototype.onDroppedChange = function(model) {
    var dropped;
    dropped = model.changed.dropped;
    if (!dropped) {
      return this.removeSoundAndClearPad();
    }
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


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":26,"./templates/pad-square-template.hbs":40}],38:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, self=this, functionType="function";

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
  buffer += "\n\n			<div class='instrument ";
  stack1 = helpers['if'].call(depth0, depth0.dropped, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "' id=\"";
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
function program3(depth0,data) {
  
  
  return " hidden ";
  }

  stack1 = helpers.each.call(depth0, depth0.instrumentTable, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  })
},{"handleify":5}],39:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<table class='container-pads'>\n\n</table>\n\n<div class='container-instruments'>\n\n</div>";
  })
},{"handleify":5}],40:[function(require,module,exports){
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
},{"handleify":5}],41:[function(require,module,exports){
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
},{"handleify":5}],42:[function(require,module,exports){

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


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":26,"./templates/pattern-square-template.hbs":45}],43:[function(require,module,exports){

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
    return this.model.set('mute', !this.model.get('mute'));
  };

  return PatternTrack;

})(View);

module.exports = PatternTrack;


},{"../../../../events/AppEvent.coffee":8,"../../../../models/sequencer/PatternSquareCollection.coffee":21,"../../../../models/sequencer/PatternSquareModel.coffee":22,"../../../../supers/View.coffee":26,"./PatternSquare.coffee":42,"./templates/pattern-track-template.hbs":46}],44:[function(require,module,exports){

/**
 * Sequencer parent view for track sequences
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent, PatternTrack, PubSub, Sequencer, View, helpers, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PatternTrack = require('./PatternTrack.coffee');

PubSub = require('../../../../utils/PubSub');

AppEvent = require('../../../../events/AppEvent.coffee');

View = require('../../../../supers/View.coffee');

helpers = require('../../../../helpers/handlebars-helpers');

template = require('./templates/sequencer-template.hbs');

Sequencer = (function(_super) {
  __extends(Sequencer, _super);

  function Sequencer() {
    this.onFocusChange = __bind(this.onFocusChange, this);
    this.importTrack = __bind(this.importTrack, this);
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
    this.listenTo(this.collection, AppEvent.CHANGE_FOCUS, this.onFocusChange);
    return PubSub.on(AppEvent.IMPORT_TRACK, this.importTrack);
  };

  Sequencer.prototype.removeEventListeners = function() {
    Sequencer.__super__.removeEventListeners.call(this);
    PubSub.off(AppEvent.IMPORT_TRACK);
    return PubSub.off(AppEvent.EXPORT_TRACK);
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
    console.log(this.collection.toJSON());
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
          mute: null,
          focus: null
        });
        instrumentModel.set({
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

  Sequencer.prototype.importTrack = function(params) {
    var callback, instruments, patternSquareGroups;
    callback = params.callback, patternSquareGroups = params.patternSquareGroups, instruments = params.instruments;
    this.renderTracks();
    _.each(this.patternTrackViews, function(patternTrackView, iterator) {
      var instrumentModel;
      instrumentModel = patternTrackView.model;
      instrumentModel.set({
        mute: null,
        focus: null
      });
      instrumentModel.set({
        mute: instruments[iterator].mute,
        focus: instruments[iterator].focus
      });
      return patternTrackView.collection.each(function(patternModel, index) {
        return patternModel.set(patternSquareGroups[iterator][index]);
      });
    });
    return callback();
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


},{"../../../../events/AppEvent.coffee":8,"../../../../helpers/handlebars-helpers":10,"../../../../supers/View.coffee":26,"../../../../utils/PubSub":27,"./PatternTrack.coffee":43,"./templates/sequencer-template.hbs":47}],45:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })
},{"handleify":5}],46:[function(require,module,exports){
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
},{"handleify":5}],47:[function(require,module,exports){
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
},{"handleify":5}],48:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-decrease'>DECREASE</button>\n<span class='label-bpm'>0</span>\n<button class='btn-increase'>INCREASE</button>";
  })
},{"handleify":5}],49:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-left'>LEFT</button>\n<span class='label-kit'>DRUM KIT</span>\n<button class='btn-right'>RIGHT</button>";
  })
},{"handleify":5}],50:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='btn-export'>EXPORT</div>\n<div class='btn-share'>SHARE</div>\n<div class='container-kit-selector'>\n	<div class='kit-selector'></div>\n</div>\n<div class='container-visualization'>Visualization</div>\n\n<div class='container-sequencer'>\n\n	<div class='instrument-selector'>Instrument Selector</div>\n	<div class='sequencer'>Sequencer</div>\n	<div class='bpm'>BPM</div>\n\n</div>";
  })
},{"handleify":5}],51:[function(require,module,exports){

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


},{"../../events/PubEvent.coffee":9,"../../supers/View.coffee":26,"../../utils/PubSub":27,"./templates/landing-template.hbs":52}],52:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<span class='start-btn'>CREATE</span>";
  })
},{"handleify":5}],53:[function(require,module,exports){

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


},{"../../supers/View.coffee":26,"./templates/share-template.hbs":54}],54:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<a href='/#'>NEW</a>";
  })
},{"handleify":5}],55:[function(require,module,exports){

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


},{"../../supers/View.coffee":26,"./tests-template.hbs":56}],56:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h1>Component Viewer</h1>\n\n<br />\n<p>\n	Make sure that <b>httpster (npm install -g httpster)</b> is running in the <b>source</b> path <br/>\n	<a href=\"http://localhost:3333/test/html/\">Mocha Test Runner</a>\n</p>\n\n<br />\n<ul>\n	<li><a href='#landing'>Landing</a></li>\n	<li><a href='#create'>Create</a></li>\n	<li><a href='#share'>Share</a></li>\n	<li></li>\n	<li><b>Individual components</b></li>\n	<li><a href='#kit-selection'>Kit Selection</a></li>\n	<li><a href=\"#bpm-indicator\">BPM Indicator</a></li>\n	<li><a href=\"#instrument-selector\">Instrument Selector</a></li>\n	<li><a href=\"#pattern-square\">Pattern Square</a></li>\n	<li><a href=\"#pattern-track\">Pattern Track</a></li>\n	<li><a href=\"#sequencer\">Sequencer</a></li>\n	<li><a href=\"#full-sequencer\">Full Sequencer</a></li>\n	<li><a href=\"#pad-square\">Pad Square</a></li>\n	<li><a href=\"#live-pad\">LivePad</a></li>\n</ul>";
  })
},{"handleify":5}]},{},[11])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2RpZ2l0cy9pbmRleC5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L3J1bnRpbWUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2luaXRpYWxpemUuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9TaGFyZWRUcmFja01vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9MaXZlUGFkTW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlTW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3JvdXRlcnMvQXBwUm91dGVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3N1cGVycy9Db2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3N1cGVycy9Nb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy91dGlscy9QdWJTdWIuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy91dGlscy9Ub3VjaC5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL3RlbXBsYXRlcy9pbnN0cnVtZW50LXBhbmVsLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL3RlbXBsYXRlcy9pbnN0cnVtZW50LXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9MaXZlUGFkLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL3RlbXBsYXRlcy9pbnN0cnVtZW50cy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvdGVtcGxhdGVzL2xpdmUtcGFkLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC90ZW1wbGF0ZXMvcGFkLXNxdWFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvdGVtcGxhdGVzL3BhZHMtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci90ZW1wbGF0ZXMvcGF0dGVybi1zcXVhcmUtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9wYXR0ZXJuLXRyYWNrLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci90ZW1wbGF0ZXMvc2VxdWVuY2VyLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3RlbXBsYXRlcy9icG0tdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvdGVtcGxhdGVzL2tpdC1zZWxlY3Rpb24tdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL3RlbXBsYXRlcy9jcmVhdGUtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL3RlbXBsYXRlcy9sYW5kaW5nLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9zaGFyZS90ZW1wbGF0ZXMvc2hhcmUtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvdGVzdHMvVGVzdHNWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3Rlc3RzL3Rlc3RzLXRlbXBsYXRlLmhicyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUE7O21CQUFBOztHQUZxQixLQVh4QixDQUFBOztBQUFBLE1BaUJNLENBQUMsT0FBUCxHQUFpQixTQWpCakIsQ0FBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEseUJBQUE7RUFBQTtpU0FBQTs7QUFBQSxJQU9BLEdBQVcsT0FBQSxDQUFRLDBCQUFSLENBUFgsQ0FBQTs7QUFBQSxRQVFBLEdBQVcsT0FBQSxDQUFRLHNCQUFSLENBUlgsQ0FBQTs7QUFBQTtBQWFHLDhCQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSxzQkFBQSxRQUFBLEdBQVUsUUFBVixDQUFBOzttQkFBQTs7R0FGcUIsS0FYeEIsQ0FBQTs7QUFBQSxNQWdCTSxDQUFDLE9BQVAsR0FBaUIsU0FoQmpCLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIGRpZ2l0c1xuICogQ29weXJpZ2h0IChjKSAyMDEzIEpvbiBTY2hsaW5rZXJ0XG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUGFkIG51bWJlcnMgd2l0aCB6ZXJvcy5cbiAqIEF1dG9tYXRpY2FsbHkgcGFkIHRoZSBudW1iZXIgb2YgZGlnaXRzIGJhc2VkIG9uIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5LFxuICogb3IgZXhwbGljaXRseSBwYXNzIGluIHRoZSBudW1iZXIgb2YgZGlnaXRzIHRvIHVzZS5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG51bSAgVGhlIG51bWJlciB0byBwYWQuXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdHMgT3B0aW9ucyBvYmplY3Qgd2l0aCBgZGlnaXRzYCBhbmQgYGF1dG9gIHByb3BlcnRpZXMuXG4gKiAgICB7XG4gKiAgICAgIGF1dG86IGFycmF5Lmxlbmd0aCAvLyBwYXNzIGluIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5XG4gKiAgICAgIGRpZ2l0czogNCAgICAgICAgICAvLyBvciBwYXNzIGluIHRoZSBudW1iZXIgb2YgZGlnaXRzIHRvIHVzZVxuICogICAgfVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgIFRoZSBwYWRkZWQgbnVtYmVyIHdpdGggemVyb3MgcHJlcGVuZGVkXG4gKlxuICogQGV4YW1wbGVzOlxuICogIDEgICAgICA9PiAwMDAwMDFcbiAqICAxMCAgICAgPT4gMDAwMDEwXG4gKiAgMTAwICAgID0+IDAwMDEwMFxuICogIDEwMDAgICA9PiAwMDEwMDBcbiAqICAxMDAwMCAgPT4gMDEwMDAwXG4gKiAgMTAwMDAwID0+IDEwMDAwMFxuICovXG5cbmV4cG9ydHMucGFkID0gZnVuY3Rpb24gKG51bSwgb3B0cykge1xuICB2YXIgZGlnaXRzID0gb3B0cy5kaWdpdHMgfHwgMztcbiAgaWYob3B0cy5hdXRvICYmIHR5cGVvZiBvcHRzLmF1dG8gPT09ICdudW1iZXInKSB7XG4gICAgZGlnaXRzID0gU3RyaW5nKG9wdHMuYXV0bykubGVuZ3RoO1xuICB9XG4gIHZhciBsZW5EaWZmID0gZGlnaXRzIC0gU3RyaW5nKG51bSkubGVuZ3RoO1xuICB2YXIgcGFkZGluZyA9ICcnO1xuICBpZiAobGVuRGlmZiA+IDApIHtcbiAgICB3aGlsZSAobGVuRGlmZi0tKSB7XG4gICAgICBwYWRkaW5nICs9ICcwJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhZGRpbmcgKyBudW07XG59O1xuXG4vKipcbiAqIFN0cmlwIGxlYWRpbmcgZGlnaXRzIGZyb20gYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgZnJvbSB3aGljaCB0byBzdHJpcCBkaWdpdHNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqL1xuXG5leHBvcnRzLnN0cmlwbGVmdCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXGQrXFwtPy9nLCAnJyk7XG59O1xuXG4vKipcbiAqIFN0cmlwIHRyYWlsaW5nIGRpZ2l0cyBmcm9tIGEgc3RyaW5nXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIGZyb20gd2hpY2ggdG8gc3RyaXAgZGlnaXRzXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBUaGUgbW9kaWZpZWQgc3RyaW5nXG4gKi9cblxuZXhwb3J0cy5zdHJpcHJpZ2h0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFwtP1xcZCskL2csICcnKTtcbn07XG5cbi8qKlxuICogQ291bnQgZGlnaXRzIG9uIHRoZSBsZWZ0IHNpZGUgb2YgYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgd2l0aCBkaWdpdHMgdG8gY291bnRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqIEBleGFtcGxlXG4gKiAgXCIwMDEtZm9vLm1kXCIgPT4gM1xuICovXG5cbmV4cG9ydHMuY291bnRsZWZ0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyLm1hdGNoKC9eXFxkKy9nKSkubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBDb3VudCBkaWdpdHMgb24gdGhlIHJpZ2h0IHNpZGUgb2YgYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgd2l0aCBkaWdpdHMgdG8gY291bnRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqIEBleGFtcGxlXG4gKiAgXCIwMDEtZm9vLm1kXCIgPT4gM1xuICovXG5cbmV4cG9ydHMuY291bnRyaWdodCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gU3RyaW5nKHN0ci5tYXRjaCgvXFxkKyQvZykpLmxlbmd0aDtcbn07IiwiLypqc2hpbnQgZXFudWxsOiB0cnVlICovXG5cbm1vZHVsZS5leHBvcnRzLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuXG52YXIgSGFuZGxlYmFycyA9IHt9O1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZFUlNJT04gPSBcIjEuMC4wXCI7XG5IYW5kbGViYXJzLkNPTVBJTEVSX1JFVklTSU9OID0gNDtcblxuSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz49IDEuMC4wJ1xufTtcblxuSGFuZGxlYmFycy5oZWxwZXJzICA9IHt9O1xuSGFuZGxlYmFycy5wYXJ0aWFscyA9IHt9O1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgIGZ1bmN0aW9uVHlwZSA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24obmFtZSwgZm4sIGludmVyc2UpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBpZiAoaW52ZXJzZSB8fCBmbikgeyB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgaGVscGVycycpOyB9XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaW52ZXJzZSkgeyBmbi5ub3QgPSBpbnZlcnNlOyB9XG4gICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsID0gZnVuY3Rpb24obmFtZSwgc3RyKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBzdHI7XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihhcmcpIHtcbiAgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBoZWxwZXI6ICdcIiArIGFyZyArIFwiJ1wiKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UgfHwgZnVuY3Rpb24oKSB7fSwgZm4gPSBvcHRpb25zLmZuO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcblxuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKGNvbnRleHQgPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm4odGhpcyk7XG4gIH0gZWxzZSBpZihjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgIGlmKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIEhhbmRsZWJhcnMuaGVscGVycy5lYWNoKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZuKGNvbnRleHQpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5LID0gZnVuY3Rpb24oKSB7fTtcblxuSGFuZGxlYmFycy5jcmVhdGVGcmFtZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24ob2JqZWN0KSB7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBvYmplY3Q7XG4gIHZhciBvYmogPSBuZXcgSGFuZGxlYmFycy5LKCk7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBudWxsO1xuICByZXR1cm4gb2JqO1xufTtcblxuSGFuZGxlYmFycy5sb2dnZXIgPSB7XG4gIERFQlVHOiAwLCBJTkZPOiAxLCBXQVJOOiAyLCBFUlJPUjogMywgbGV2ZWw6IDMsXG5cbiAgbWV0aG9kTWFwOiB7MDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcid9LFxuXG4gIC8vIGNhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24obGV2ZWwsIG9iaikge1xuICAgIGlmIChIYW5kbGViYXJzLmxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IEhhbmRsZWJhcnMubG9nZ2VyLm1ldGhvZE1hcFtsZXZlbF07XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGVbbWV0aG9kXSkge1xuICAgICAgICBjb25zb2xlW21ldGhvZF0uY2FsbChjb25zb2xlLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy5sb2cgPSBmdW5jdGlvbihsZXZlbCwgb2JqKSB7IEhhbmRsZWJhcnMubG9nZ2VyLmxvZyhsZXZlbCwgb2JqKTsgfTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGZuID0gb3B0aW9ucy5mbiwgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZTtcbiAgdmFyIGkgPSAwLCByZXQgPSBcIlwiLCBkYXRhO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgZGF0YSA9IEhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgfVxuXG4gIGlmKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgaWYoY29udGV4dCBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgIGZvcih2YXIgaiA9IGNvbnRleHQubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgICBpZiAoZGF0YSkgeyBkYXRhLmluZGV4ID0gaTsgfVxuICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ldLCB7IGRhdGE6IGRhdGEgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvcih2YXIga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgaWYoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgaWYoZGF0YSkgeyBkYXRhLmtleSA9IGtleTsgfVxuICAgICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRba2V5XSwge2RhdGE6IGRhdGF9KTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZihpID09PSAwKXtcbiAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb25kaXRpb25hbCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICBpZighY29uZGl0aW9uYWwgfHwgSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd1bmxlc3MnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHtmbjogb3B0aW9ucy5pbnZlcnNlLCBpbnZlcnNlOiBvcHRpb25zLmZufSk7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmICghSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbnRleHQpKSByZXR1cm4gb3B0aW9ucy5mbihjb250ZXh0KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgSGFuZGxlYmFycy5sb2cobGV2ZWwsIGNvbnRleHQpO1xufSk7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxuLy8gQkVHSU4oQlJPV1NFUilcblxuSGFuZGxlYmFycy5WTSA9IHtcbiAgdGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlU3BlYykge1xuICAgIC8vIEp1c3QgYWRkIHdhdGVyXG4gICAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICAgIGVzY2FwZUV4cHJlc3Npb246IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICAgIGludm9rZVBhcnRpYWw6IEhhbmRsZWJhcnMuVk0uaW52b2tlUGFydGlhbCxcbiAgICAgIHByb2dyYW1zOiBbXSxcbiAgICAgIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV07XG4gICAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbShpLCBmbiwgZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgICB9LFxuICAgICAgbWVyZ2U6IGZ1bmN0aW9uKHBhcmFtLCBjb21tb24pIHtcbiAgICAgICAgdmFyIHJldCA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgICBpZiAocGFyYW0gJiYgY29tbW9uKSB7XG4gICAgICAgICAgcmV0ID0ge307XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBjb21tb24pO1xuICAgICAgICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHJldCwgcGFyYW0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9LFxuICAgICAgcHJvZ3JhbVdpdGhEZXB0aDogSGFuZGxlYmFycy5WTS5wcm9ncmFtV2l0aERlcHRoLFxuICAgICAgbm9vcDogSGFuZGxlYmFycy5WTS5ub29wLFxuICAgICAgY29tcGlsZXJJbmZvOiBudWxsXG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIHZhciByZXN1bHQgPSB0ZW1wbGF0ZVNwZWMuY2FsbChjb250YWluZXIsIEhhbmRsZWJhcnMsIGNvbnRleHQsIG9wdGlvbnMuaGVscGVycywgb3B0aW9ucy5wYXJ0aWFscywgb3B0aW9ucy5kYXRhKTtcblxuICAgICAgdmFyIGNvbXBpbGVySW5mbyA9IGNvbnRhaW5lci5jb21waWxlckluZm8gfHwgW10sXG4gICAgICAgICAgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IEhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgICAgIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICAgICAgdGhyb3cgXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBwcmVjb21waWxlciB0byBhIG5ld2VyIHZlcnNpb24gKFwiK3J1bnRpbWVWZXJzaW9ucytcIikgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uIChcIitjb21waWxlclZlcnNpb25zK1wiKS5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGEgbmV3ZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gXCIrXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKFwiK2NvbXBpbGVySW5mb1sxXStcIikuXCI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9LFxuXG4gIHByb2dyYW1XaXRoRGVwdGg6IGZ1bmN0aW9uKGksIGZuLCBkYXRhIC8qLCAkZGVwdGggKi8pIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMyk7XG5cbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgW2NvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhXS5jb25jYXQoYXJncykpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gYXJncy5sZW5ndGg7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgdmFyIHByb2dyYW0gPSBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhKTtcbiAgICB9O1xuICAgIHByb2dyYW0ucHJvZ3JhbSA9IGk7XG4gICAgcHJvZ3JhbS5kZXB0aCA9IDA7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIG5vb3A6IGZ1bmN0aW9uKCkgeyByZXR1cm4gXCJcIjsgfSxcbiAgaW52b2tlUGFydGlhbDogZnVuY3Rpb24ocGFydGlhbCwgbmFtZSwgY29udGV4dCwgaGVscGVycywgcGFydGlhbHMsIGRhdGEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHsgaGVscGVyczogaGVscGVycywgcGFydGlhbHM6IHBhcnRpYWxzLCBkYXRhOiBkYXRhIH07XG5cbiAgICBpZihwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBmb3VuZFwiKTtcbiAgICB9IGVsc2UgaWYocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKCFIYW5kbGViYXJzLmNvbXBpbGUpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRpYWxzW25hbWVdID0gSGFuZGxlYmFycy5jb21waWxlKHBhcnRpYWwsIHtkYXRhOiBkYXRhICE9PSB1bmRlZmluZWR9KTtcbiAgICAgIHJldHVybiBwYXJ0aWFsc1tuYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMudGVtcGxhdGUgPSBIYW5kbGViYXJzLlZNLnRlbXBsYXRlO1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG5cbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gQkVHSU4oQlJPV1NFUilcblxudmFyIGVycm9yUHJvcHMgPSBbJ2Rlc2NyaXB0aW9uJywgJ2ZpbGVOYW1lJywgJ2xpbmVOdW1iZXInLCAnbWVzc2FnZScsICduYW1lJywgJ251bWJlcicsICdzdGFjayddO1xuXG5IYW5kbGViYXJzLkV4Y2VwdGlvbiA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgdmFyIHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxufTtcbkhhbmRsZWJhcnMuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuSGFuZGxlYmFycy5TYWZlU3RyaW5nID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufTtcbkhhbmRsZWJhcnMuU2FmZVN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RyaW5nLnRvU3RyaW5nKCk7XG59O1xuXG52YXIgZXNjYXBlID0ge1xuICBcIiZcIjogXCImYW1wO1wiLFxuICBcIjxcIjogXCImbHQ7XCIsXG4gIFwiPlwiOiBcIiZndDtcIixcbiAgJ1wiJzogXCImcXVvdDtcIixcbiAgXCInXCI6IFwiJiN4Mjc7XCIsXG4gIFwiYFwiOiBcIiYjeDYwO1wiXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2c7XG52YXIgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxudmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdIHx8IFwiJmFtcDtcIjtcbn07XG5cbkhhbmRsZWJhcnMuVXRpbHMgPSB7XG4gIGV4dGVuZDogZnVuY3Rpb24ob2JqLCB2YWx1ZSkge1xuICAgIGZvcih2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgICBpZih2YWx1ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdmFsdWVba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZXNjYXBlRXhwcmVzc2lvbjogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgaW5zdGFuY2VvZiBIYW5kbGViYXJzLlNhZmVTdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcudG9TdHJpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsIHx8IHN0cmluZyA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAgIC8vIHRoZSByZWdleCB0ZXN0IHdpbGwgZG8gdGhpcyB0cmFuc3BhcmVudGx5IGJlaGluZCB0aGUgc2NlbmVzLCBjYXVzaW5nIGlzc3VlcyBpZlxuICAgIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICAgIHN0cmluZyA9IHN0cmluZy50b1N0cmluZygpO1xuXG4gICAgaWYoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbiAgfSxcblxuICBpc0VtcHR5OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZih0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSByZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMnKS5jcmVhdGUoKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy91dGlscy5qcycpLmF0dGFjaChleHBvcnRzKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzJykuYXR0YWNoKGV4cG9ydHMpIiwiIyMjKlxuICogUHJpbWFyeSBhcHBsaWNhdGlvbiBjb250cm9sbGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5BcHBNb2RlbCAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbkFwcFJvdXRlciAgID0gcmVxdWlyZSAnLi9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUnXG5MYW5kaW5nVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUnXG5DcmVhdGVWaWV3ICA9IHJlcXVpcmUgJy4vdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlJ1xuU2hhcmVWaWV3ICAgPSByZXF1aXJlICcuL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcENvbnRyb2xsZXIgZXh0ZW5kcyBWaWV3XG5cblxuICAgY2xhc3NOYW1lOiAnd3JhcHBlcidcblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEBsYW5kaW5nVmlldyA9IG5ldyBMYW5kaW5nVmlld1xuICAgICAgQHNoYXJlVmlldyAgID0gbmV3IFNoYXJlVmlld1xuXG4gICAgICBAY3JlYXRlVmlldyAgPSBuZXcgQ3JlYXRlVmlld1xuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgQGFwcFJvdXRlciA9IG5ldyBBcHBSb3V0ZXJcbiAgICAgICAgIGFwcENvbnRyb2xsZXI6IEBcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSBBcHBDb250cm9sbGVyIHRvIHRoZSBET00gYW5kIGtpY2tzXG4gICAjIG9mZiBiYWNrYm9uZXMgaGlzdG9yeVxuXG4gICByZW5kZXI6IC0+XG4gICAgICBAJGJvZHkgPSAkICdib2R5J1xuICAgICAgQCRib2R5LmFwcGVuZCBAZWxcblxuICAgICAgQmFja2JvbmUuaGlzdG9yeS5zdGFydFxuICAgICAgICAgcHVzaFN0YXRlOiBmYWxzZVxuXG5cblxuICAgIyBEZXN0cm95cyBhbGwgY3VycmVudCBhbmQgcHJlLXJlbmRlcmVkIHZpZXdzIGFuZFxuICAgIyB1bmRlbGVnYXRlcyBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgQGxhbmRpbmdWaWV3LnJlbW92ZSgpXG4gICAgICBAc2hhcmVWaWV3LnJlbW92ZSgpXG4gICAgICBAY3JlYXRlVmlldy5yZW1vdmUoKVxuXG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICAjIEFkZHMgQXBwQ29udHJvbGxlci1yZWxhdGVkIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVnaW5zXG4gICAjIGxpc3RlbmluZyB0byB2aWV3IGNoYW5nZXNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAnY2hhbmdlOnZpZXcnLCBAb25WaWV3Q2hhbmdlXG5cblxuXG5cbiAgICMgUmVtb3ZlcyBBcHBDb250cm9sbGVyLXJlbGF0ZWQgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHNob3dpbmcgLyBoaWRpbmcgLyBkaXNwb3Npbmcgb2YgcHJpbWFyeSB2aWV3c1xuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvblZpZXdDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIHByZXZpb3VzVmlldyA9IG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMudmlld1xuICAgICAgY3VycmVudFZpZXcgID0gbW9kZWwuY2hhbmdlZC52aWV3XG5cbiAgICAgIHByZXZpb3VzVmlldz8uaGlkZVxuICAgICAgICAgcmVtb3ZlOiB0cnVlXG5cblxuICAgICAgQCRlbC5hcHBlbmQgY3VycmVudFZpZXcucmVuZGVyKCkuZWxcblxuICAgICAgY3VycmVudFZpZXcuc2hvdygpXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwQ29udHJvbGxlciIsIiMjIypcbiAgQXBwbGljYXRpb24td2lkZSBnZW5lcmFsIGNvbmZpZ3VyYXRpb25zXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTkuMTRcbiMjI1xuXG5cbkFwcENvbmZpZyA9XG5cblxuICAgIyBUaGUgcGF0aCB0byBhcHBsaWNhdGlvbiBhc3NldHNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQVNTRVRTOlxuICAgICAgcGF0aDogICAnL2Fzc2V0cydcbiAgICAgIGF1ZGlvOiAgJ2F1ZGlvJ1xuICAgICAgZGF0YTogICAnZGF0YSdcbiAgICAgIGltYWdlczogJ2ltYWdlcydcblxuXG4gICAjIFRoZSBCUE0gdGVtcG9cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQlBNOiAzMjBcblxuXG4gICAjIFRoZSBtYXggQlBNXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIEJQTV9NQVg6IDEwMDBcblxuXG4gICAjIFRoZSBtYXggdmFyaWVudCBvbiBlYWNoIHBhdHRlcm4gc3F1YXJlIChvZmYsIGxvdywgbWVkaXVtLCBoaWdoKVxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBWRUxPQ0lUWV9NQVg6IDNcblxuXG4gICAjIFZvbHVtZSBsZXZlbHMgZm9yIHBhdHRlcm4gcGxheWJhY2sgYXMgd2VsbCBhcyBmb3Igb3ZlcmFsbCB0cmFja3NcbiAgICMgQHR5cGUge09iamVjdH1cblxuICAgVk9MVU1FX0xFVkVMUzpcbiAgICAgIGxvdzogICAgLjJcbiAgICAgIG1lZGl1bTogLjVcbiAgICAgIGhpZ2g6ICAgIDFcblxuXG4gICAjIFJldHVybnMgYSBub3JtYWxpemVkIGFzc2V0IHBhdGggZm9yIGFwcGxpY2F0aW9uIGFzc2V0c1xuICAgIyBAcGFyYW0ge1N0cmluZ30gYXNzZXRUeXBlXG5cbiAgIHJldHVybkFzc2V0UGF0aDogKGFzc2V0VHlwZSkgLT5cbiAgICAgIEBBU1NFVFMucGF0aCArICcvJyArIEBBU1NFVFNbYXNzZXRUeXBlXVxuXG5cbiAgICMgUmV0dXJucyBhIG5vcm1hbGl6ZWQgYXNzZXQgcGF0aCBmb3IgdGhlIFRFU1QgZW52aXJvbm1lbnRcbiAgICMgQHBhcmFtIHtTdHJpbmd9IGFzc2V0VHlwZVxuXG4gICByZXR1cm5UZXN0QXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgICAgJy90ZXN0L2h0bWwvJyArIEBBU1NFVFMucGF0aCArICcvJyArIEBBU1NFVFNbYXNzZXRUeXBlXVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb25maWdcblxuIiwiIyMjKlxuICogQXBwbGljYXRpb24gcmVsYXRlZCBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cbkFwcEV2ZW50ID1cblxuICAgQ0hBTkdFX0FDVElWRTogICAgICdjaGFuZ2U6YWN0aXZlJ1xuICAgQ0hBTkdFX0JQTTogICAgICAgICdjaGFuZ2U6YnBtJ1xuICAgQ0hBTkdFX0RSQUdHSU5HOiAgICdjaGFuZ2U6ZHJhZ2dpbmcnXG4gICBDSEFOR0VfRFJPUFBFRDogICAgJ2NoYW5nZTpkcm9wcGVkJ1xuICAgQ0hBTkdFX0ZPQ1VTOiAgICAgICdjaGFuZ2U6Zm9jdXMnXG4gICBDSEFOR0VfSU5TVFJVTUVOVDogJ2NoYW5nZTpjdXJyZW50SW5zdHJ1bWVudCdcbiAgIENIQU5HRV9LSVQ6ICAgICAgICAnY2hhbmdlOmtpdE1vZGVsJ1xuICAgQ0hBTkdFX01VVEU6ICAgICAgICdjaGFuZ2U6bXV0ZSdcbiAgIENIQU5HRV9QTEFZSU5HOiAgICAnY2hhbmdlOnBsYXlpbmcnXG4gICBDSEFOR0VfVFJJR0dFUjogICAgJ2NoYW5nZTp0cmlnZ2VyJ1xuICAgQ0hBTkdFX1ZFTE9DSVRZOiAgICdjaGFuZ2U6dmVsb2NpdHknXG5cbiAgIElNUE9SVF9UUkFDSzogICAgICAnb25JbXBvcnRUcmFjaydcbiAgIEVYUE9SVF9UUkFDSzogICAgICAnb25FeHBvcnRUcmFjaydcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBFdmVudCIsIiMjIypcbiAqIEdsb2JhbCBQdWJTdWIgZXZlbnRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuXG5QdWJTdWIgPVxuXG4gICBST1VURTogJ29uUm91dGVDaGFuZ2UnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQdWJTdWIiLCJcbnZhciBkaWdpdHMgPSByZXF1aXJlKCdkaWdpdHMnKTtcbnZhciBoYW5kbGViYXJzID0gcmVxdWlyZSgnaGFuZGxlaWZ5JylcblxuaGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcigncmVwZWF0JywgZnVuY3Rpb24obiwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBfZGF0YSA9IHt9O1xuICAgIGlmIChvcHRpb25zLl9kYXRhKSB7XG4gICAgICBfZGF0YSA9IGhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5fZGF0YSk7XG4gICAgfVxuXG4gICAgdmFyIGNvbnRlbnQgPSAnJztcbiAgICB2YXIgY291bnQgPSBuIC0gMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBjb3VudDsgaSsrKSB7XG4gICAgICBfZGF0YSA9IHtcbiAgICAgICAgaW5kZXg6IGRpZ2l0cy5wYWQoKGkgKyAxKSwge2F1dG86IG59KVxuICAgICAgfTtcbiAgICAgIGNvbnRlbnQgKz0gb3B0aW9ucy5mbih0aGlzLCB7ZGF0YTogX2RhdGF9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBoYW5kbGViYXJzLlNhZmVTdHJpbmcoY29udGVudCk7XG4gIH0pOyIsIiMjIypcbiAqIE1QQyBBcHBsaWNhdGlvbiBib290c3RyYXBwZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cblRvdWNoICAgICAgICAgPSByZXF1aXJlICcuL3V0aWxzL1RvdWNoJ1xuQXBwQ29uZmlnICAgICA9IHJlcXVpcmUgJy4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcbkFwcENvbnRyb2xsZXIgPSByZXF1aXJlICcuL0FwcENvbnRyb2xsZXIuY29mZmVlJ1xuaGVscGVycyAgICAgICA9IHJlcXVpcmUgJy4vaGVscGVycy9oYW5kbGViYXJzLWhlbHBlcnMnXG5cbiQgLT5cblxuICAgVG91Y2gudHJhbnNsYXRlVG91Y2hFdmVudHMoKVxuXG4gICBQYXJzZS5pbml0aWFsaXplKCBcIm9aZ09rdHJjRFhFZXRHQmpDR0k2cXFSTE5iSjdqOEdURE1tUHlyeGJcIiwgXCJVNmIwaERUMklzYjVibENWZDBXVTQxTkowRU9GZ1kwRng3b3JxbDRRXCIgKVxuXG4gICBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgIHBhcnNlOiB0cnVlXG5cbiAgIGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICBhcHBDb250cm9sbGVyID0gbmV3IEFwcENvbnRyb2xsZXJcbiAgICAgIGtpdENvbGxlY3Rpb246IGtpdENvbGxlY3Rpb25cblxuICAgYXBwQ29udHJvbGxlci5yZW5kZXIoKVxuIiwiIyMjKlxuICogUHJpbWFyeSBhcHBsaWNhdGlvbiBtb2RlbCB3aGljaCBjb29yZGluYXRlcyBzdGF0ZVxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuTW9kZWwgICAgID0gcmVxdWlyZSAnLi4vc3VwZXJzL01vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBBcHBNb2RlbCBleHRlbmRzIE1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnYnBtJzogICAgICAgICAgIEFwcENvbmZpZy5CUE1cbiAgICAgICdtdXRlJzogICAgICAgICAgbnVsbFxuICAgICAgJ2tpdE1vZGVsJzogICAgICBudWxsXG4gICAgICAncGxheWluZyc6ICAgICAgIG51bGxcblxuICAgICAgIyBTaGFyZSBpZCByZXR1cm5lZCBmcm9tIHBhcnNlXG4gICAgICAnc2hhcmVJZCc6ICAgICAgIG51bGxcblxuICAgICAgJ3NoYXJlTWVzc2FnZSc6ICBudWxsXG4gICAgICAndHJhY2tUaXRsZSc6ICAgIG51bGxcbiAgICAgICd2aWV3JzogICAgICAgICAgbnVsbFxuICAgICAgJ3Zpc3VhbGl6YXRpb24nOiBudWxsXG5cblxuICAgZXhwb3J0OiAtPlxuICAgICAganNvbiA9IEB0b0pTT04oKVxuXG4gICAgICBqc29uLmtpdE1vZGVsID0ganNvbi5raXRNb2RlbC50b0pTT04oKVxuICAgICAganNvbi5raXRNb2RlbC5pbnN0cnVtZW50cyA9IGpzb24ua2l0TW9kZWwuaW5zdHJ1bWVudHMudG9KU09OKClcbiAgICAgIGpzb24ua2l0TW9kZWwuaW5zdHJ1bWVudHMgPSBfLm1hcCBqc29uLmtpdE1vZGVsLmluc3RydW1lbnRzLCAoaW5zdHJ1bWVudCkgLT5cbiAgICAgICAgIGluc3RydW1lbnQucGF0dGVyblNxdWFyZXMgPSBpbnN0cnVtZW50LnBhdHRlcm5TcXVhcmVzLnRvSlNPTigpXG4gICAgICAgICByZXR1cm4gaW5zdHJ1bWVudFxuICAgICAgcmV0dXJuIGpzb25cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcE1vZGVsIiwiIyMjKlxuICogSGFuZGxlcyBzaGFyaW5nIHNvbmdzIGJldHdlZW4gdGhlIGFwcCBhbmQgUGFyc2UsIGFzIHdlbGwgYXMgb3RoZXIgc2VydmljZXNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjUuMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbk1vZGVsICAgICA9IHJlcXVpcmUgJy4uL3N1cGVycy9Nb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgU2hhcmVkVHJhY2tNb2RlbCBleHRlbmRzIFBhcnNlLk9iamVjdFxuXG5cbiAgICMgUGFyc2UgQ2xhc3MgJ2tleScgZm9yIHNhdmluZyBkYXRhXG4gICBjbGFzc05hbWU6ICdTaGFyZWRUcmFjaydcblxuXG4gICBkZWZhdWx0czpcblxuICAgICAgIyBAdHlwZSB7TnVtYmVyfVxuICAgICAgYnBtOiBudWxsXG5cbiAgICAgICMgQHR5cGUge09iamVjdH1cbiAgICAgIGluc3RydW1lbnRzOiBudWxsXG5cbiAgICAgICMgQHR5cGUge1N0cmluZ31cbiAgICAgIGtpdFR5cGU6IG51bGxcblxuICAgICAgIyBAdHlwZSB7U3RyaW5nfVxuICAgICAgbWVzc2FnZTogbnVsbFxuXG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgICBuYW1lOiBudWxsXG5cbiAgICAgICMgQHR5cGUge0FycmF5fVxuICAgICAgcGF0dGVyblNxdWFyZUdyb3VwczogbnVsbFxuXG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgICB0aXRsZTogbnVsbFxuXG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgICB2aXN1YWxpemF0aW9uOiBudWxsXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlZFRyYWNrTW9kZWwiLCIjIyMqXG4gKiBDb2xsZWN0aW9uIG9mIHNvdW5kIGtpdHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5Db2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL0NvbGxlY3Rpb24uY29mZmVlJ1xuQXBwQ29uZmlnICA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0TW9kZWwgICA9IHJlcXVpcmUgJy4vS2l0TW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIEtpdENvbGxlY3Rpb24gZXh0ZW5kcyBDb2xsZWN0aW9uXG5cblxuICAgIyBVcmwgdG8gZGF0YSBmb3IgZmV0Y2hcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdXJsOiBcIiN7QXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpfS9zb3VuZC1kYXRhLmpzb25cIlxuXG5cbiAgICMgSW5kaXZpZHVhbCBkcnVta2l0IGF1ZGlvIHNldHNcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBtb2RlbDogS2l0TW9kZWxcblxuXG4gICAjIFRoZSBjdXJyZW50IHVzZXItc2VsZWN0ZWQga2l0XG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGtpdElkOiAwXG5cblxuXG4gICAjIFBhcnNlcyB0aGUgY29sbGVjdGlvbiB0byBhc3NpZ24gcGF0aHMgdG8gZWFjaCBpbmRpdmlkdWFsIHNvdW5kXG4gICAjIGJhc2VkIHVwb24gY29uZmlndXJhdGlvbiBkYXRhXG4gICAjIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuXG4gICBwYXJzZTogKHJlc3BvbnNlKSAtPlxuICAgICAgYXNzZXRQYXRoID0gcmVzcG9uc2UuY29uZmlnLmFzc2V0UGF0aFxuICAgICAga2l0cyA9IHJlc3BvbnNlLmtpdHNcblxuICAgICAga2l0cyA9IF8ubWFwIGtpdHMsIChraXQpIC0+XG4gICAgICAgICBraXQucGF0aCA9IGFzc2V0UGF0aCArICcvJyArIGtpdC5mb2xkZXJcbiAgICAgICAgIHJldHVybiBraXRcblxuICAgICAgcmV0dXJuIGtpdHNcblxuXG5cblxuICAgIyBJdGVyYXRlcyB0aHJvdWdoIHRoZSBjb2xsZWN0aW9uIGFuZCByZXR1cm5zIGEgc3BlY2lmaWMgaW5zdHJ1bWVudFxuICAgIyBieSBtYXRjaGluZyBhc3NvY2lhdGVkIGlkXG4gICAjIEBwYXJhbSB7TnVtYmVyfSBpZFxuXG4gICBmaW5kSW5zdHJ1bWVudE1vZGVsOiAoaWQpIC0+XG4gICAgICBpbnN0cnVtZW50TW9kZWwgPSBudWxsXG5cbiAgICAgIEBlYWNoIChraXRNb2RlbCkgPT5cbiAgICAgICAgIGtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKS5lYWNoIChtb2RlbCkgPT5cbiAgICAgICAgICAgIGlmIGlkIGlzIG1vZGVsLmdldCgnaWQnKVxuICAgICAgICAgICAgICAgaW5zdHJ1bWVudE1vZGVsID0gbW9kZWxcblxuICAgICAgaWYgaW5zdHJ1bWVudE1vZGVsIGlzIG51bGxcbiAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICBpbnN0cnVtZW50TW9kZWxcblxuXG5cblxuICAgIyBDeWNsZXMgdGhlIGN1cnJlbnQgZHJ1bSBraXQgYmFja1xuICAgIyBAcmV0dXJuIHtLaXRNb2RlbH1cblxuICAgcHJldmlvdXNLaXQ6IC0+XG4gICAgICBsZW4gPSBAbGVuZ3RoXG5cbiAgICAgIGlmIEBraXRJZCA+IDBcbiAgICAgICAgIEBraXRJZC0tXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIEBraXRJZCA9IGxlbiAtIDFcblxuICAgICAga2l0TW9kZWwgPSBAYXQgQGtpdElkXG5cblxuXG5cbiAgICMgQ3ljbGVzIHRoZSBjdXJyZW50IGRydW0ga2l0IGZvcndhcmRcbiAgICMgQHJldHVybiB7S2l0TW9kZWx9XG5cbiAgIG5leHRLaXQ6IC0+XG4gICAgICBsZW4gPSBAbGVuZ3RoIC0gMVxuXG4gICAgICBpZiBAa2l0SWQgPCBsZW5cbiAgICAgICAgIEBraXRJZCsrXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIEBraXRJZCA9IDBcblxuICAgICAga2l0TW9kZWwgPSBAYXQgQGtpdElkXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdENvbGxlY3Rpb24iLCIjIyMqXG4gKiBLaXQgbW9kZWwgZm9yIGhhbmRsaW5nIHN0YXRlIHJlbGF0ZWQgdG8ga2l0IHNlbGVjdGlvblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbk1vZGVsICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL01vZGVsLmNvZmZlZSdcbkluc3RydW1lbnRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblxuXG5jbGFzcyBLaXRNb2RlbCBleHRlbmRzIE1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnbGFiZWwnOiAgICBudWxsXG4gICAgICAncGF0aCc6ICAgICBudWxsXG4gICAgICAnZm9sZGVyJzogICBudWxsXG5cbiAgICAgICMgQHR5cGUge0luc3RydW1lbnRDb2xsZWN0aW9ufVxuICAgICAgJ2luc3RydW1lbnRzJzogICBudWxsXG5cbiAgICAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cbiAgICAgICdjdXJyZW50SW5zdHJ1bWVudCc6IG51bGxcblxuXG5cbiAgICMgRm9ybWF0IHRoZSByZXNwb25zZSBzbyB0aGF0IGluc3RydW1lbnRzIGdldHMgcHJvY2Vzc2VkXG4gICAjIGJ5IGJhY2tib25lIHZpYSB0aGUgSW5zdHJ1bWVudENvbGxlY3Rpb24uICBBZGRpdGlvbmFsbHksXG4gICAjIHBhc3MgaW4gdGhlIHBhdGggc28gdGhhdCBhYnNvbHV0ZSBVUkwncyBjYW4gYmUgdXNlZFxuICAgIyB0byByZWZlcmVuY2Ugc291bmQgZGF0YVxuICAgIyBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcblxuICAgcGFyc2U6IChyZXNwb25zZSkgLT5cbiAgICAgIF8uZWFjaCByZXNwb25zZS5pbnN0cnVtZW50cywgKGluc3RydW1lbnQpIC0+XG4gICAgICAgICBpbnN0cnVtZW50LmlkID0gXy51bmlxdWVJZCAnaW5zdHJ1bWVudC0nXG4gICAgICAgICBpbnN0cnVtZW50LnNyYyA9IHJlc3BvbnNlLnBhdGggKyAnLycgKyBpbnN0cnVtZW50LnNyY1xuXG4gICAgICByZXNwb25zZS5pbnN0cnVtZW50cyA9IG5ldyBJbnN0cnVtZW50Q29sbGVjdGlvbiByZXNwb25zZS5pbnN0cnVtZW50c1xuXG4gICAgICByZXNwb25zZVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdE1vZGVsIiwiIyMjKlxuICogTW9kZWwgZm9yIHRoZSBlbnRpcmUgUGFkIGNvbXBvbmVudFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbk1vZGVsID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL01vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBMaXZlUGFkTW9kZWwgZXh0ZW5kcyBNb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGl2ZVBhZE1vZGVsXG4iLCIjIyMqXG4gKiBDb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgUGFkU3F1YXJlTW9kZWxzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI0LjE0XG4jIyNcblxuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi4vc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5Db2xsZWN0aW9uICAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvQ29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuY2xhc3MgUGFkU3F1YXJlQ29sbGVjdGlvbiBleHRlbmRzIENvbGxlY3Rpb25cblxuICAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFkU3F1YXJlQ29sbGVjdGlvbiIsIiMjIypcbiAqIE1vZGVsIGZvciBpbmRpdmlkdWFsIHBhZCBzcXVhcmVzLlxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbk1vZGVsID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL01vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBQYWRTcXVhcmVNb2RlbCBleHRlbmRzIE1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnZHJhZ2dpbmcnOiAgZmFsc2VcbiAgICAgICdrZXljb2RlJzogICBudWxsXG4gICAgICAndHJpZ2dlcic6ICAgZmFsc2VcblxuICAgICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICAgICAgJ2N1cnJlbnRJbnN0cnVtZW50JzogIG51bGxcblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQHNldCAnaWQnLCBfLnVuaXF1ZUlkICdwYWQtc3F1YXJlLSdcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFkU3F1YXJlTW9kZWxcbiIsIiMjIypcbiAqIENvbGxlY3Rpb24gcmVwcmVzZW50aW5nIGVhY2ggc291bmQgZnJvbSBhIGtpdCBzZXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICcuL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5Db2xsZWN0aW9uICAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvQ29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuY2xhc3MgSW5zdHJ1bWVudENvbGxlY3Rpb24gZXh0ZW5kcyBDb2xsZWN0aW9uXG5cblxuICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG5cblxuICAgIyBFeHBvcnRzIHRoZSBwYXR0ZXJuIHNxdWFyZXMgY29sbGVjdGlvbiBmb3IgdXNlXG4gICAjIHdpdGggdHJhbnNmZXJyaW5nIHByb3BzIGFjcm9zcyBkaWZmZXJlbnQgZHJ1bSBraXRzXG5cbiAgIGV4cG9ydFBhdHRlcm5TcXVhcmVzOiAtPlxuICAgICAgcmV0dXJuIEBtYXAgKGluc3RydW1lbnQpID0+XG4gICAgICAgICBpbnN0cnVtZW50LmdldCgncGF0dGVyblNxdWFyZXMnKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudENvbGxlY3Rpb24iLCIjIyMqXG4gKiBTb3VuZCBtb2RlbCBmb3IgZWFjaCBpbmRpdmlkdWFsIGtpdCBzb3VuZCBzZXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbk1vZGVsICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Nb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgSW5zdHJ1bWVudE1vZGVsIGV4dGVuZHMgTW9kZWxcblxuXG4gICBkZWZhdWx0czpcblxuICAgICAgIyBJZiBhY3RpdmUsIHNvdW5kIGNhbiBwbGF5XG4gICAgICAjIEB0eXBlIHtCb29sZWFufVxuXG4gICAgICAnYWN0aXZlJzogICBudWxsXG5cblxuICAgICAgIyBGbGFnIHRvIGNoZWNrIGlmIGluc3RydW1lbnQgaGFzIGJlZW4gZHJvcHBlZCBvbnRvIHBhZCBzcXVhcmVcbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgICAgICdkcm9wcGVkJzogIGZhbHNlXG5cblxuICAgICAgIyBDYWNoZSBvZiB0aGUgb3JpZ2luYWwgbW91c2UgZHJhZyBldmVudCBpbiBvcmRlciB0byB1cGRhdGUgdGhlXG4gICAgICAjIGRyYWcgcG9zaXRpb24gd2hlbiBkaXNsb2RnaW5nIGluIGluc3RydW1lbnQgZnJvbSB0aGUgUGFkU3F1YXJlXG4gICAgICAjIEB0eXBlIHtNb3VzZUV2ZW50fVxuXG4gICAgICAnZHJvcHBlZEV2ZW50JzogbnVsbFxuXG5cbiAgICAgICMgRmxhZyB0byBjaGVjayBpZiBhdWRpbyBmb2N1cyBpcyBzZXQgb24gYSBwYXJ0aWN1bGFyIGluc3RydW1lbnQuXG4gICAgICAjIElmIHNvLCBpdCBtdXRlcyBhbGwgb3RoZXIgdHJhY2tzLlxuICAgICAgIyBAdHlwZSB7Qm9vbGVhbn1cblxuICAgICAgJ2ZvY3VzJzogICAgbnVsbFxuXG5cbiAgICAgICMgVGhlIGljb24gY2xhc3MgdGhhdCByZXByZXNlbnRzIHRoZSBpbnN0cnVtZW50XG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgICAgICdpY29uJzogICAgIG51bGxcblxuXG4gICAgICAjIFRoZSB0ZXh0IGxhYmVsIGRlc2NyaWJpbmcgdGhlIGluc3RydW1lbnRcbiAgICAgICMgQHR5cGUge1N0cmluZ31cblxuICAgICAgJ2xhYmVsJzogICAgbnVsbFxuXG5cbiAgICAgICMgTXV0ZSBvciB1bm11dGUgc2V0dGluZ1xuICAgICAgIyBAdHlwZSB7Qm9vbGVhbn1cblxuICAgICAgJ211dGUnOiAgICAgbnVsbFxuXG5cbiAgICAgICMgVGhlIHBhdGggdG8gdGhlIHNvdW5kIHNvdXJjZVxuICAgICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICAgICAnc3JjJzogICAgICBudWxsXG5cblxuICAgICAgIyBUaGUgdm9sdW1lXG4gICAgICAjIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAndm9sdW1lJzogICBudWxsXG5cblxuICAgICAgIyBDb2xsZWN0aW9uIG9mIGFzc29jaWF0ZWQgcGF0dGVybiBzcXVhcmVzIChhIHRyYWNrKSBmb3IgdGhlXG4gICAgICAjIFNlcXVlbmNlciB2aWV3LiAgVXBkYXRlZCB3aGVuIHRoZSB0cmFja3MgYXJlIHN3YXBwZWQgb3V0XG4gICAgICAjIEB0eXBlIHtQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbn1cblxuICAgICAgJ3BhdHRlcm5TcXVhcmVzJzogICAgbnVsbFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50TW9kZWwiLCIjIyMqXG4gIEEgY29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlc1xuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuUHViU3ViICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvUHViU3ViJ1xuQXBwRXZlbnQgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcbkFwcENvbmZpZyAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAnLi9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuQ29sbGVjdGlvbiAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL0NvbGxlY3Rpb24uY29mZmVlJ1xuSW5zdHJ1bWVudE1vZGVsICAgID0gcmVxdWlyZSAnLi4vc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gZXh0ZW5kcyBDb2xsZWN0aW9uXG5cbiAgIG1vZGVsOiBJbnN0cnVtZW50TW9kZWxcblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgICNQdWJTdWIub24gQXBwRXZlbnQuSU1QT1JUX1RSQUNLLCBAb25JbXBvcnRUcmFja1xuICAgICAgI1B1YlN1Yi5vbiBBcHBFdmVudC5FWFBPUlRfVFJBQ0ssIEBvbkV4cG9ydFRyYWNrXG5cblxuICAgb25JbXBvcnRUcmFjazogKHBhcmFtcykgLT5cbiAgICAgIGNvbnNvbGUubG9nICdmaXJpbmcgaW1wb3J0ISEnXG5cblxuICAgb25FeHBvcnRUcmFjazogKHBhcmFtcykgLT5cbiAgICAgIGNvbnNvbGUubG9nICdmaXJpbmcgZXhwb3J0ISEnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiIsIiMjIypcbiAgTW9kZWwgZm9yIGluZGl2aWR1YWwgcGF0dGVybiBzcXVhcmVzLiAgUGFydCBvZiBsYXJnZXIgUGF0dGVybiBUcmFjayBjb2xsZWN0aW9uXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBFdmVudCAgPSByZXF1aXJlICcuLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5Nb2RlbCAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvTW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmVNb2RlbCBleHRlbmRzIE1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnYWN0aXZlJzogICAgICAgICAgIGZhbHNlXG4gICAgICAnaW5zdHJ1bWVudCc6ICAgICAgIG51bGxcbiAgICAgICdwcmV2aW91c1ZlbG9jaXR5JzogMFxuICAgICAgJ3RyaWdnZXInOiAgICAgICAgICBudWxsXG4gICAgICAndmVsb2NpdHknOiAgICAgICAgIDBcblxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAb24gQXBwRXZlbnQuQ0hBTkdFX1ZFTE9DSVRZLCBAb25WZWxvY2l0eUNoYW5nZVxuXG5cblxuICAgY3ljbGU6IC0+XG4gICAgICB2ZWxvY2l0eSA9IEBnZXQgJ3ZlbG9jaXR5J1xuXG4gICAgICBpZiB2ZWxvY2l0eSA8IEFwcENvbmZpZy5WRUxPQ0lUWV9NQVhcbiAgICAgICAgIHZlbG9jaXR5KytcblxuICAgICAgZWxzZVxuICAgICAgICAgdmVsb2NpdHkgPSAwXG5cbiAgICAgIEBzZXQgJ3ZlbG9jaXR5JywgdmVsb2NpdHlcblxuXG5cbiAgIGVuYWJsZTogLT5cbiAgICAgIEBzZXQgJ3ZlbG9jaXR5JywgMVxuXG5cblxuXG4gICBkaXNhYmxlOiAtPlxuICAgICAgQHNldCAndmVsb2NpdHknLCAwXG5cblxuXG4gICBvblZlbG9jaXR5Q2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBAc2V0ICdwcmV2aW91c1ZlbG9jaXR5JywgbW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy52ZWxvY2l0eVxuXG4gICAgICB2ZWxvY2l0eSA9IG1vZGVsLmNoYW5nZWQudmVsb2NpdHlcblxuICAgICAgaWYgdmVsb2NpdHkgPiAwXG4gICAgICAgICBAc2V0ICdhY3RpdmUnLCB0cnVlXG5cbiAgICAgIGVsc2UgaWYgdmVsb2NpdHkgaXMgMFxuICAgICAgICAgQHNldCAnYWN0aXZlJywgZmFsc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlTW9kZWwiLCIjIyMqXG4gKiBNUEMgQXBwbGljYXRpb24gcm91dGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgPSByZXF1aXJlICcuLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblB1YlN1YiAgICAgID0gcmVxdWlyZSAnLi4vdXRpbHMvUHViU3ViJ1xuUHViRXZlbnQgICAgPSByZXF1aXJlICcuLi9ldmVudHMvUHViRXZlbnQuY29mZmVlJ1xuXG4jIFRPRE86IFRoZSBiZWxvdyBpdGVtcyBhcmUgb25seSBpbmNsdWRlZCBmb3IgdGVzdGluZyBjb21wb25lbnRcbiMgbW9kdWxhcml0eS4gIFRoZXksIGFuZCB0aGVpciByb3V0ZXMsIHNob3VsZCBiZSByZW1vdmVkIGluIHByb2R1Y3Rpb25cblxuVGVzdHNWaWV3ICAgICA9IHJlcXVpcmUgJy4uL3ZpZXdzL3Rlc3RzL1Rlc3RzVmlldy5jb2ZmZWUnXG5cblZpZXcgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cbktpdFNlbGVjdG9yICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcbktpdE1vZGVsICAgICAgPSByZXF1aXJlICcuLi9tb2RlbHMva2l0cy9LaXRNb2RlbC5jb2ZmZWUnXG5cbkJQTUluZGljYXRvciAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xuSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUnXG5cbkluc3RydW1lbnRNb2RlbCA9ICcuLi9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9ICcuLi9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblxuUGF0dGVyblNxdWFyZSA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuVHJhY2sgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay5jb2ZmZWUnXG5TZXF1ZW5jZXIgICAgICAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSdcblxuTGl2ZVBhZE1vZGVsID0gcmVxdWlyZSAnLi4vbW9kZWxzL3BhZC9MaXZlUGFkTW9kZWwuY29mZmVlJ1xuUGFkU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYWRTcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uL21vZGVscy9wYWQvUGFkU3F1YXJlTW9kZWwuY29mZmVlJ1xuTGl2ZVBhZCA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9MaXZlUGFkLmNvZmZlZSdcblBhZFNxdWFyZSA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcFJvdXRlciBleHRlbmRzIEJhY2tib25lLlJvdXRlclxuXG5cbiAgIHJvdXRlczpcbiAgICAgICcnOiAgICAgICAgICAgICAnbGFuZGluZ1JvdXRlJ1xuICAgICAgJ2xhbmRpbmcnOiAgICAgICdsYW5kaW5nUm91dGUnXG4gICAgICAnY3JlYXRlJzogICAgICAgJ2NyZWF0ZVJvdXRlJ1xuICAgICAgJ3NoYXJlLzppZCc6ICAgICdzaGFyZVJvdXRlJ1xuXG4gICAgICAjIENvbXBvbmVudCB0ZXN0IHJvdXRlc1xuICAgICAgJ3Rlc3RzJzogICAgICAgICAgICAgICAgJ3Rlc3RzJ1xuICAgICAgJ2tpdC1zZWxlY3Rpb24nOiAgICAgICAgJ2tpdFNlbGVjdGlvblJvdXRlJ1xuICAgICAgJ2JwbS1pbmRpY2F0b3InOiAgICAgICAgJ2JwbUluZGljYXRvclJvdXRlJ1xuICAgICAgJ2luc3RydW1lbnQtc2VsZWN0b3InOiAgJ2luc3RydW1lbnRTZWxlY3RvclJvdXRlJ1xuICAgICAgJ3BhdHRlcm4tc3F1YXJlJzogICAgICAgJ3BhdHRlcm5TcXVhcmVSb3V0ZSdcbiAgICAgICdwYXR0ZXJuLXRyYWNrJzogICAgICAgICdwYXR0ZXJuVHJhY2tSb3V0ZSdcbiAgICAgICdzZXF1ZW5jZXInOiAgICAgICAgICAgICdzZXF1ZW5jZXJSb3V0ZSdcbiAgICAgICdmdWxsLXNlcXVlbmNlcic6ICAgICAgICdmdWxsU2VxdWVuY2VyUm91dGUnXG4gICAgICAncGFkLXNxdWFyZSc6ICAgICAgICAgICAncGFkU3F1YXJlUm91dGUnXG4gICAgICAnbGl2ZS1wYWQnOiAgICAgICAgICAgICAnbGl2ZVBhZFJvdXRlJ1xuXG5cblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICB7QGFwcENvbnRyb2xsZXIsIEBhcHBNb2RlbH0gPSBvcHRpb25zXG5cbiAgICAgIFB1YlN1Yi5vbiBQdWJFdmVudC5ST1VURSwgQG9uUm91dGVDaGFuZ2VcblxuXG5cbiAgIG9uUm91dGVDaGFuZ2U6IChwYXJhbXMpID0+XG4gICAgICB7cm91dGV9ID0gcGFyYW1zXG5cbiAgICAgIEBuYXZpZ2F0ZSByb3V0ZSwgeyB0cmlnZ2VyOiB0cnVlIH1cblxuXG5cbiAgIGxhbmRpbmdSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBAYXBwQ29udHJvbGxlci5sYW5kaW5nVmlld1xuXG5cblxuICAgY3JlYXRlUm91dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgQGFwcENvbnRyb2xsZXIuY3JlYXRlVmlld1xuXG5cblxuICAgc2hhcmVSb3V0ZTogKHNoYXJlSWQpIC0+XG4gICAgICBjb25zb2xlLmxvZyBzaGFyZUlkXG5cbiAgICAgIEBhcHBNb2RlbC5zZXRcbiAgICAgICAgICd2aWV3JzogQGFwcENvbnRyb2xsZXIuY3JlYXRlVmlld1xuICAgICAgICAgJ3NoYXJlSWQnOiBzaGFyZUlkXG5cbiAgICAgICNAYXBwTW9kZWwuc2V0ICd2aWV3JywgQGFwcENvbnRyb2xsZXIuc2hhcmVWaWV3XG5cblxuXG5cblxuXG4gICAjIENPTVBPTkVOVCBURVNUIFJPVVRFU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgIHRlc3RzOiAtPlxuICAgICAgdmlldyA9IG5ldyBUZXN0c1ZpZXcoKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBraXRTZWxlY3Rpb25Sb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBLaXRTZWxlY3RvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24sXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cbiAgIGJwbUluZGljYXRvclJvdXRlOiAtPlxuICAgICAgdmlldyA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgdmlldy5yZW5kZXIoKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBpbnN0cnVtZW50U2VsZWN0b3JSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBwYXR0ZXJuU3F1YXJlUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgUGF0dGVyblNxdWFyZVxuICAgICAgICAgcGF0dGVyblNxdWFyZU1vZGVsOiBuZXcgUGF0dGVyblNxdWFyZU1vZGVsKClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbiAgIHBhdHRlcm5UcmFja1JvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IFBhdHRlcm5UcmFja1xuICAgICAgICAgbW9kZWw6IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuICAgc2VxdWVuY2VyUm91dGU6IC0+XG5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuICAgZnVsbFNlcXVlbmNlclJvdXRlOiAtPlxuXG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cblxuICAgICAga2l0U2VsZWN0aW9uID0gPT5cbiAgICAgICAgIHZpZXcgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgICAgIHZpZXdcblxuXG4gICAgICBicG0gPSA9PlxuICAgICAgICAgdmlldyA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgICAgdmlld1xuXG5cbiAgICAgIGluc3RydW1lbnRTZWxlY3Rpb24gPSA9PlxuICAgICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICAgICB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICAgICB2aWV3XG5cblxuICAgICAgc2VxdWVuY2VyID0gPT5cbiAgICAgICAgIHZpZXcgPSBuZXcgU2VxdWVuY2VyXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgICAgdmlld1xuXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldyA9IG5ldyBWaWV3KClcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQga2l0U2VsZWN0aW9uKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgYnBtKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgaW5zdHJ1bWVudFNlbGVjdGlvbigpLnJlbmRlcigpLmVsXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldy4kZWwuYXBwZW5kIHNlcXVlbmNlcigpLnJlbmRlcigpLmVsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBmdWxsU2VxdWVuY2VyVmlld1xuXG5cblxuXG4gICBwYWRTcXVhcmVSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBQYWRTcXVhcmVcbiAgICAgICAgIG1vZGVsOiBuZXcgUGFkU3F1YXJlTW9kZWwoKVxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG5cbiAgIGxpdmVQYWRSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBMaXZlUGFkXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFJvdXRlciIsIiMjIypcbiAqIENvbGxlY3Rpb24gc3VwZXJjbGFzc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNS4xNFxuIyMjXG5cblxuY2xhc3MgQ29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvbiIsIiMjIypcbiAqIE1vZGVsIHN1cGVyY2xhc3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjUuMTRcbiMjI1xuXG5cbmNsYXNzIE1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTW9kZWwiLCIjIyMqXG4gKiBWaWV3IHN1cGVyY2xhc3MgY29udGFpbmluZyBzaGFyZWQgZnVuY3Rpb25hbGl0eVxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMi4xNy4xNFxuIyMjXG5cblxuY2xhc3MgVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuXG4gICAjIEluaXRpYWxpemVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgXy5leHRlbmQgQCwgXy5kZWZhdWx0cyggb3B0aW9ucyA9IG9wdGlvbnMgfHwgQGRlZmF1bHRzLCBAZGVmYXVsdHMgfHwge30gKVxuXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyB3aXRoIHN1cHBsaWVkIHRlbXBsYXRlIGRhdGEsIG9yIGNoZWNrcyBpZiB0ZW1wbGF0ZSBpcyBvblxuICAgIyBvYmplY3QgYm9keVxuICAgIyBAcGFyYW0gIHtGdW5jdGlvbnxNb2RlbH0gdGVtcGxhdGVEYXRhXG4gICAjIEByZXR1cm4ge1ZpZXd9XG5cbiAgIHJlbmRlcjogKHRlbXBsYXRlRGF0YSkgLT5cbiAgICAgIHRlbXBsYXRlRGF0YSA9IHRlbXBsYXRlRGF0YSB8fCB7fVxuXG4gICAgICBpZiBAdGVtcGxhdGVcblxuICAgICAgICAgIyBJZiBtb2RlbCBpcyBhbiBpbnN0YW5jZSBvZiBhIGJhY2tib25lIG1vZGVsLCB0aGVuIEpTT05pZnkgaXRcbiAgICAgICAgIGlmIEBtb2RlbCBpbnN0YW5jZW9mIEJhY2tib25lLk1vZGVsXG4gICAgICAgICAgICB0ZW1wbGF0ZURhdGEgPSBAbW9kZWwudG9KU09OKClcblxuICAgICAgICAgQCRlbC5odG1sIEB0ZW1wbGF0ZSAodGVtcGxhdGVEYXRhKVxuXG4gICAgICBAZGVsZWdhdGVFdmVudHMoKVxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQFxuXG5cblxuXG4gICAjIFJlbW92ZXMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVtb3ZlOiAob3B0aW9ucykgLT5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG4gICAgICBAJGVsLnJlbW92ZSgpXG4gICAgICBAdW5kZWxlZ2F0ZUV2ZW50cygpXG5cblxuXG5cblxuICAgIyBTaG93cyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBzaG93OiAob3B0aW9ucykgLT5cbiAgICAgIFR3ZWVuTWF4LnNldCBAJGVsLCB7IGF1dG9BbHBoYTogMSB9XG5cblxuXG5cbiAgICMgSGlkZXMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaGlkZTogKG9wdGlvbnMpIC0+XG4gICAgICBUd2Vlbk1heC5zZXQgQCRlbCxcbiAgICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgIGlmIG9wdGlvbnM/LnJlbW92ZVxuICAgICAgICAgICAgICAgQHJlbW92ZSgpXG5cblxuXG5cbiAgICMgTm9vcCB3aGljaCBpcyBjYWxsZWQgb24gcmVuZGVyXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuXG5cblxuICAgIyBSZW1vdmVzIGFsbCByZWdpc3RlcmVkIGxpc3RlbmVyc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlldyIsIi8qKlxuICogQG1vZHVsZSAgICAgUHViU3ViXG4gKiBAZGVzYyAgICAgICBHbG9iYWwgUHViU3ViIG9iamVjdCBmb3IgZGlzcGF0Y2ggYW5kIGRlbGVnYXRpb25cbiAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIFB1YlN1YiA9IHt9XG5cbl8uZXh0ZW5kKCBQdWJTdWIsIEJhY2tib25lLkV2ZW50cyApXG5cbm1vZHVsZS5leHBvcnRzID0gUHViU3ViIiwiLyoqXG4gKiBUb3VjaCByZWxhdGVkIHV0aWxpdGllc1xuICpcbiAqL1xuXG52YXIgVG91Y2ggPSB7XG5cblxuICAvKipcbiAgICogRGVsZWdhdGUgdG91Y2ggZXZlbnRzIHRvIG1vdXNlIGlmIG5vdCBvbiBhIHRvdWNoIGRldmljZVxuICAgKi9cblxuICB0cmFuc2xhdGVUb3VjaEV2ZW50czogZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKCEgKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyApKSB7XG4gICAgICAkKGRvY3VtZW50KS5kZWxlZ2F0ZSggJ2JvZHknLCAnbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAkKGUudGFyZ2V0KS50cmlnZ2VyKCAndG91Y2hzdGFydCcgKVxuICAgICAgfSlcblxuICAgICAgJChkb2N1bWVudCkuZGVsZWdhdGUoICdib2R5JywgJ21vdXNldXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICQoZS50YXJnZXQpLnRyaWdnZXIoICd0b3VjaGVuZCcgKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRvdWNoIiwiIyMjKlxuICogQ3JlYXRlIHZpZXcgd2hpY2ggdGhlIHVzZXIgY2FuIGJ1aWxkIGJlYXRzIHdpdGhpblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblB1YlN1YiAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvUHViU3ViJ1xuVmlldyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5BcHBFdmVudCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5TaGFyZWRUcmFja01vZGVsICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9TaGFyZWRUcmFja01vZGVsLmNvZmZlZSdcbktpdFNlbGVjdG9yICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3IuY29mZmVlJ1xuSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUnXG5TZXF1ZW5jZXIgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuQlBNSW5kaWNhdG9yICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xudGVtcGxhdGUgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9jcmVhdGUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIENyZWF0ZVZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5idG4tc2hhcmUnOiAgJ29uU2hhcmVCdG5DbGljaydcbiAgICAgICd0b3VjaGVuZCAuYnRuLWV4cG9ydCc6ICdvbkV4cG9ydEJ0bkNsaWNrJ1xuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAka2l0U2VsZWN0b3JDb250YWluZXIgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1raXQtc2VsZWN0b3InXG4gICAgICBAJGtpdFNlbGVjdG9yICAgICAgICAgICAgPSBAJGVsLmZpbmQgJy5raXQtc2VsZWN0b3InXG4gICAgICBAJHZpc3VhbGl6YXRpb25Db250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItdmlzdWFsaXphdGlvbidcbiAgICAgIEAkc2VxdWVuY2VyQ29udGFpbmVyICAgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1zZXF1ZW5jZXInXG4gICAgICBAJGluc3RydW1lbnRTZWxlY3RvciAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuaW5zdHJ1bWVudC1zZWxlY3RvcidcbiAgICAgIEAkc2VxdWVuY2VyICAgICAgICAgICAgICA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5zZXF1ZW5jZXInXG4gICAgICBAJGJwbSAgICAgICAgICAgICAgICAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuYnBtJ1xuICAgICAgQCRzaGFyZUJ0biAgICAgICAgICAgICAgID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLmJ0bi1zaGFyZSdcblxuICAgICAgQHJlbmRlcktpdFNlbGVjdG9yKClcbiAgICAgIEByZW5kZXJJbnN0cnVtZW50U2VsZWN0b3IoKVxuICAgICAgQHJlbmRlclNlcXVlbmNlcigpXG4gICAgICBAcmVuZGVyQlBNKClcblxuICAgICAgc2hhcmVJZCA9IEBhcHBNb2RlbC5nZXQgJ3NoYXJlSWQnXG5cbiAgICAgIGlmIHNoYXJlSWQgaXNudCBudWxsXG4gICAgICAgICBAaW1wb3J0U2hhcmVkVHJhY2sgc2hhcmVJZFxuXG4gICAgICBAXG5cblxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIFB1YlN1Yi5vbiBBcHBFdmVudC5FWFBPUlRfVFJBQ0ssIEBvbkV4cG9ydFRyYWNrXG5cblxuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIFB1YlN1Yi5vZmYgQXBwRXZlbnQuRVhQT1JUX1RSQUNLXG5cblxuXG5cbiAgIHJlbmRlcktpdFNlbGVjdG9yOiAtPlxuICAgICAgQGtpdFNlbGVjdG9yID0gbmV3IEtpdFNlbGVjdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAJGtpdFNlbGVjdG9yLmh0bWwgQGtpdFNlbGVjdG9yLnJlbmRlcigpLmVsXG5cblxuXG4gICByZW5kZXJJbnN0cnVtZW50U2VsZWN0b3I6IC0+XG4gICAgICBAaW5zdHJ1bWVudFNlbGVjdG9yID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAJGluc3RydW1lbnRTZWxlY3Rvci5odG1sIEBpbnN0cnVtZW50U2VsZWN0b3IucmVuZGVyKCkuZWxcblxuXG5cbiAgIHJlbmRlclNlcXVlbmNlcjogLT5cbiAgICAgIEBzZXF1ZW5jZXIgPSBuZXcgU2VxdWVuY2VyXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgQCRzZXF1ZW5jZXIuaHRtbCBAc2VxdWVuY2VyLnJlbmRlcigpLmVsXG5cblxuXG4gICByZW5kZXJCUE06IC0+XG4gICAgICBAYnBtID0gbmV3IEJQTUluZGljYXRvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAJGJwbS5odG1sIEBicG0ucmVuZGVyKCkuZWxcblxuXG5cblxuXG4gICAjIFBVQkxJQyBNRVRIT0RTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgIyBFeHBvcnRzIHRoZSBjdXJyZW50IHRyYWNrIGNvbmd1cmF0aW9uIGludG8gYSBzZXJpYWxpemFibGUsXG4gICAjIHNhdmFibGUgZm9ybWF0IHdoaWNoIGlzIHRoZW4gcG9zdGVkIHRvIFBhcnNlIG9yIGxhdGVyIHJldHJpZXZhbFxuXG4gICBleHBvcnRUcmFjazogPT5cblxuICAgICAgUHViU3ViLnRyaWdnZXIgQXBwRXZlbnQuRVhQT1JUX1RSQUNLLCAocGFyYW1zKSA9PlxuXG4gICAgICAgICB7QGtpdFR5cGUsIEBpbnN0cnVtZW50cywgQHBhdHRlcm5TcXVhcmVHcm91cHN9ID0gcGFyYW1zXG5cblxuXG5cbiAgICMgQ3JlYXRlIGEgbmV3IFBhcnNlIG1vZGVsIGFuZCBwYXNzIGluIHBhcmFtcyB0aGF0XG4gICAjIGhhdmUgYmVlbiByZXRyaWV2ZWQsIHZpYSBQdWJTdWIgZnJvbSB0aGUgU2VxdWVuY2VyIHZpZXdcblxuICAgc2F2ZVRyYWNrOiA9PlxuXG4gICAgICBzaGFyZWRUcmFja01vZGVsID0gbmV3IFNoYXJlZFRyYWNrTW9kZWxcbiAgICAgICAgIGJwbTogICAgICAgICAgICAgICAgIEBhcHBNb2RlbC5nZXQgJ2JwbSdcbiAgICAgICAgIGluc3RydW1lbnRzOiAgICAgICAgIEBpbnN0cnVtZW50c1xuICAgICAgICAga2l0VHlwZTogICAgICAgICAgICAgQGtpdFR5cGVcbiAgICAgICAgIHBhdHRlcm5TcXVhcmVHcm91cHM6IEBwYXR0ZXJuU3F1YXJlR3JvdXBzXG4gICAgICAgICBzaGFyZU1lc3NhZ2U6ICAgICAgICBAYXBwTW9kZWwuZ2V0ICdzaGFyZU1lc3NhZ2UnXG4gICAgICAgICB0cmFja1RpdGxlOiAgICAgICAgICBAYXBwTW9kZWwuZ2V0ICd0cmFja1RpdGxlJ1xuICAgICAgICAgdmlzdWFsaXphdGlvbjogICAgICAgQGFwcE1vZGVsLmdldCAndmlzdWFsaXphdGlvbidcblxuICAgICAgIyBTZW5kIHRoZSBQYXJzZSBtb2RlbCB1cCB0aGUgd2lyZSBhbmQgc2F2ZSB0byBEQlxuICAgICAgc2hhcmVkVHJhY2tNb2RlbC5zYXZlXG5cbiAgICAgICAgIGVycm9yOiAob2JqZWN0LCBlcnJvcikgPT5cbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3Igb2JqZWN0LCBlcnJvclxuXG5cbiAgICAgICAgICMgSGFuZGxlciBmb3Igc3VjY2VzcyBldmVudHMuICBDcmVhdGUgYSBuZXdcbiAgICAgICAgICMgdmlzdWFsIHN1Y2Nlc3MgbWVzc2FnZSBhbmQgcGFzcyB1c2VyIG9uIHRvXG4gICAgICAgICAjIHRoZWlyIHBhZ2VcblxuICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PlxuICAgICAgICAgICAgQHNoYXJlSWQgPSByZXNwb25zZS5pZFxuICAgICAgICAgICAgY29uc29sZS5sb2cgQHNoYXJlSWRcblxuXG5cblxuICAgIyBJbXBvcnQgdGhlIHNoYXJlZCB0cmFjayBieSByZXF1ZXN0aW5nIHRoZSBkYXRhIGZyb20gcGFyc2VcbiAgICMgT25jZSBpbXBvcnRlZFxuXG4gICBpbXBvcnRUcmFjazogKHNoYXJlSWQpID0+XG5cbiAgICAgIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5IFNoYXJlZFRyYWNrTW9kZWxcblxuICAgICAgIyBDcmVhdGUgcmVxdWVzdCB0byBmZXRjaCBkYXRhIGZyb20gdGhlIFBhcnNlIERCXG4gICAgICBxdWVyeS5nZXQgc2hhcmVJZCxcblxuICAgICAgICAgZXJyb3I6IChvYmplY3QsIGVycm9yKSA9PlxuICAgICAgICAgICAgY29uc29sZS5lcnJvciBvYmplY3QsIGVycm9yXG5cblxuICAgICAgICAgIyBIYW5kbGVyIGZvciBzdWNjZXNzIGV2ZW50cy4gIFJldHVybnMgdGhlIHNhdmVkIG1vZGVsIHdoaWNoIGlzIHRoZW5cbiAgICAgICAgICMgZGlzcGF0Y2hlZCwgdmlhIFB1YlN1YiwgdG8gdGhlIFNlcXVlbmNlciB2aWV3IGZvciBwbGF5YmFjayBhbmQgcmVuZGVyXG4gICAgICAgICAjIEBwYXJhbSB7U2hhcmVkVHJhY2tNb2RlbH1cblxuICAgICAgICAgc3VjY2VzczogKHNoYXJlZFRyYWNrTW9kZWwpID0+XG5cbiAgICAgICAgICAgIFB1YlN1Yi50cmlnZ2VyIEFwcEV2ZW50LklNUE9SVF9UUkFDSyxcblxuICAgICAgICAgICAgICAga2l0VHlwZTogICAgICAgICAgICAgc2hhcmVkVHJhY2tNb2RlbC5nZXQgJ2tpdFR5cGUnXG4gICAgICAgICAgICAgICBpbnN0cnVtZW50czogICAgICAgICBzaGFyZWRUcmFja01vZGVsLmdldCAnaW5zdHJ1bWVudHMnXG4gICAgICAgICAgICAgICBwYXR0ZXJuU3F1YXJlR3JvdXBzOiBzaGFyZWRUcmFja01vZGVsLmdldCAncGF0dGVyblNxdWFyZUdyb3VwcydcblxuXG4gICAgICAgICAgICAgICAjIEhhbmRsZXIgZm9yIGNhbGxiYWNrcyBvbmNlIHRoZSB0cmFjayBoYXMgYmVlbiBpbXBvcnRlZCBhbmRcbiAgICAgICAgICAgICAgICMgcmVuZGVyZWQuICBEaXNwbGF5cyB0aGUgU2hhcmUgdmlldyBhbmQgYmVnaW5zIHBsYXliYWNrXG4gICAgICAgICAgICAgICAjIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuXG4gICAgICAgICAgICAgICBjYWxsYmFjazogKHJlc3BvbnNlKSAtPlxuXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBQdWJTdWIgRVhQT1JUX1RSQUNLIGV2ZW50cy4gIFByZXBhcmVzIHRoZSBkYXRhIGluIGEgd2F5IHRoYXRcbiAgICMgaXMgc2F2YWJsZSwgZXhwb3J0YWJsZSwgYW5kIGltcG9ydGFibGVcbiAgICMgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcblxuICAgb25FeHBvcnRUcmFjazogKGNhbGxiYWNrKSA9PlxuXG4gICAgICBwYXR0ZXJuU3F1YXJlR3JvdXBzID0gW11cbiAgICAgIHBhdHRlcm5TcXVhcmVzICAgICAgPSBbXVxuXG4gICAgICBraXQgICAgICAgICA9IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJykudG9KU09OKClcbiAgICAgIGluc3RydW1lbnRzID0gQGFwcE1vZGVsLmV4cG9ydCgpLmtpdE1vZGVsLmluc3RydW1lbnRzXG5cbiAgICAgIGluc3RydW1lbnRzID0gaW5zdHJ1bWVudHMubWFwIChpbnN0cnVtZW50KSA9PlxuICAgICAgICAgaW5zdHJ1bWVudC5wYXR0ZXJuU3F1YXJlcy5mb3JFYWNoIChwYXR0ZXJuU3F1YXJlKSA9PlxuICAgICAgICAgICAgZGVsZXRlIHBhdHRlcm5TcXVhcmUuaW5zdHJ1bWVudFxuICAgICAgICAgICAgcGF0dGVyblNxdWFyZXMucHVzaCBwYXR0ZXJuU3F1YXJlXG5cbiAgICAgICAgIGluc3RydW1lbnRcblxuICAgICAgd2hpbGUgKHBhdHRlcm5TcXVhcmVzLmxlbmd0aCA+IDApXG4gICAgICAgICBwYXR0ZXJuU3F1YXJlR3JvdXBzLnB1c2ggcGF0dGVyblNxdWFyZXMuc3BsaWNlKDAsIDgpXG5cbiAgICAgIGNhbGxiYWNrIHtcbiAgICAgICAgIGtpdFR5cGU6IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJykuZ2V0KCdsYWJlbCcpXG4gICAgICAgICBpbnN0cnVtZW50czogaW5zdHJ1bWVudHNcbiAgICAgICAgIHBhdHRlcm5TcXVhcmVHcm91cHM6IHBhdHRlcm5TcXVhcmVHcm91cHNcbiAgICAgIH1cblxuXG5cblxuICAgb25FeHBvcnRCdG5DbGljazogKGV2ZW50KSA9PlxuICAgICAgQGV4cG9ydFRyYWNrKClcblxuXG5cblxuICAgb25TaGFyZUJ0bkNsaWNrOiAoZXZlbnQpID0+XG4gICAgICBAaW1wb3J0VHJhY2sgQHNoYXJlSWRcblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3JlYXRlVmlldyIsIiMjIypcbiAqIEJlYXRzIHBlciBtaW51dGUgdmlldyBmb3IgaGFuZGxpbmcgdGVtcG9cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9icG0tdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEJQTUluZGljYXRvciBleHRlbmRzIFZpZXdcblxuXG4gICAjIFJlZiB0byB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBUaGUgc2V0SW50ZXJ2YWwgdXBkYXRlIGludGVydmFsIGZvciBpbmNyZWFzaW5nIGFuZFxuICAgIyBkZWNyZWFzaW5nIEJQTSBvbiBwcmVzcyAvIHRvdWNoXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGludGVydmFsVXBkYXRlVGltZTogNzBcblxuXG4gICAjIFRoZSBzZXRJbnRlcnZhbCB1cGRhdGVyXG4gICAjIEB0eXBlIHtTZXRJbnRlcnZhbH1cblxuICAgdXBkYXRlSW50ZXJ2YWw6IG51bGxcblxuXG4gICAjIFRoZSBhbW91bnQgdG8gaW5jcmVhc2UgdGhlIEJQTSBieSBvbiBlYWNoIHRpY2tcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgYnBtSW5jcmVhc2VBbW91bnQ6IDEwXG5cblxuICAgIyBUaGUgY3VycmVudCBicG0gYmVmb3JlIGl0cyBzZXQgb24gdGhlIG1vZGVsLiAgVXNlZCB0byBidWZmZXJcbiAgICMgdXBkYXRlcyBhbmQgdG8gcHJvdmlkZSBmb3Igc21vb3RoIGFuaW1hdGlvblxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBjdXJyQlBNOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaHN0YXJ0IC5idG4taW5jcmVhc2UnOiAnb25JbmNyZWFzZUJ0bkRvd24nXG4gICAgICAndG91Y2hzdGFydCAuYnRuLWRlY3JlYXNlJzogJ29uRGVjcmVhc2VCdG5Eb3duJ1xuICAgICAgJ3RvdWNoZW5kICAgLmJ0bi1pbmNyZWFzZSc6ICdvbkJ0blVwJ1xuICAgICAgJ3RvdWNoZW5kICAgLmJ0bi1kZWNyZWFzZSc6ICdvbkJ0blVwJ1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgdXBkYXRlIHRoZSBraXQgaWYgbm90IGFscmVhZHlcbiAgICMgc2V0IHZpYSBhIHByZXZpb3VzIHNlc3Npb25cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRicG1MYWJlbCAgID0gQCRlbC5maW5kICcubGFiZWwtYnBtJ1xuICAgICAgQGluY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWluY3JlYXNlJ1xuICAgICAgQGRlY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWRlY3JlYXNlJ1xuXG4gICAgICBAY3VyckJQTSA9IEBhcHBNb2RlbC5nZXQoJ2JwbScpXG4gICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cbiAgICAgIEBvbkJ0blVwKClcblxuICAgICAgQFxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAgIyBzd2l0Y2hpbmcgQlBNXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0JQTSwgQG9uQlBNQ2hhbmdlXG5cblxuXG5cbiAgICMgU2V0cyBhbiBpbnRlcnZhbCB0byBpbmNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgICMgd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2VcblxuICAgaW5jcmVhc2VCUE06IC0+XG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgICAgYnBtID0gQGN1cnJCUE1cblxuICAgICAgICAgaWYgYnBtIDwgQXBwQ29uZmlnLkJQTV9NQVhcbiAgICAgICAgICAgIGJwbSArPSBAYnBtSW5jcmVhc2VBbW91bnRcblxuICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnBtID0gQXBwQ29uZmlnLkJQTV9NQVhcblxuICAgICAgICAgQGN1cnJCUE0gPSBicG1cbiAgICAgICAgIEAkYnBtTGFiZWwudGV4dCBAY3VyckJQTVxuICAgICAgICAgI0BhcHBNb2RlbC5zZXQgJ2JwbScsIDYwMDAwIC8gQGN1cnJCUE1cblxuICAgICAgLCBAaW50ZXJ2YWxVcGRhdGVUaW1lXG5cblxuXG5cbiAgICMgU2V0cyBhbiBpbnRlcnZhbCB0byBkZWNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgICMgd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2VcblxuICAgZGVjcmVhc2VCUE06IC0+XG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgICAgYnBtID0gQGN1cnJCUE1cblxuICAgICAgICAgaWYgYnBtID4gMFxuICAgICAgICAgICAgYnBtIC09IEBicG1JbmNyZWFzZUFtb3VudFxuXG4gICAgICAgICBlbHNlXG4gICAgICAgICAgICBicG0gPSAwXG5cbiAgICAgICAgIEBjdXJyQlBNID0gYnBtXG4gICAgICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cbiAgICAgICAgICNAYXBwTW9kZWwuc2V0ICdicG0nLCA2MDAwMCAvIEBjdXJyQlBNXG5cbiAgICAgICwgQGludGVydmFsVXBkYXRlVGltZVxuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkluY3JlYXNlQnRuRG93bjogKGV2ZW50KSA9PlxuICAgICAgQGluY3JlYXNlQlBNKClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uRGVjcmVhc2VCdG5Eb3duOiAoZXZlbnQpIC0+XG4gICAgICBAZGVjcmVhc2VCUE0oKVxuXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbW91c2UgLyB0b3VjaHVwIGV2ZW50cy4gIENsZWFycyB0aGUgaW50ZXJ2YWxcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25CdG5VcDogKGV2ZW50KSAtPlxuICAgICAgY2xlYXJJbnRlcnZhbCBAdXBkYXRlSW50ZXJ2YWxcbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IG51bGxcblxuICAgICAgQGFwcE1vZGVsLnNldCAnYnBtJywgNjAwMDAgLyBAY3VyckJQTVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2UgZXZlbnRzLiAgVXBkYXRlcyB0aGUgbGFiZWwgb24gdGhlXG4gICAjIGtpdCBzZWxlY3RvclxuXG4gICBvbkJQTUNoYW5nZTogKG1vZGVsKSAtPlxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQlBNSW5kaWNhdG9yIiwiIyMjKlxuICogS2l0IHNlbGVjdG9yIGZvciBzd2l0Y2hpbmcgYmV0d2VlbiBkcnVtLWtpdCBzb3VuZHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMva2l0LXNlbGVjdGlvbi10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgS2l0U2VsZWN0b3IgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBSZWYgdG8gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBLaXRDb2xsZWN0aW9uIGZvciB1cGRhdGluZyBzb3VuZHNcbiAgICMgQHR5cGUge0tpdENvbGxlY3Rpb259XG5cbiAgIGtpdENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIFRoZSBjdXJyZW50IGtpdFxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdE1vZGVsOiBudWxsXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLmJ0bi1sZWZ0JzogICAnb25MZWZ0QnRuQ2xpY2snXG4gICAgICAndG91Y2hlbmQgLmJ0bi1yaWdodCc6ICAnb25SaWdodEJ0bkNsaWNrJ1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgdXBkYXRlIHRoZSBraXQgaWYgbm90IGFscmVhZHlcbiAgICMgc2V0IHZpYSBhIHByZXZpb3VzIHNlc3Npb25cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRraXRMYWJlbCA9IEAkZWwuZmluZCAnLmxhYmVsLWtpdCdcblxuICAgICAgaWYgQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKSBpcyBudWxsXG4gICAgICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEAka2l0TGFiZWwudGV4dCBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpLmdldCAnbGFiZWwnXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAgIyBzd2l0Y2hpbmcgZHJ1bSBraXRzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uQ2hhbmdlS2l0XG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuXG4gICBvbkxlZnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5wcmV2aW91c0tpdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuXG4gICBvblJpZ2h0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSBsYWJlbCBvbiB0aGVcbiAgICMga2l0IHNlbGVjdG9yXG5cbiAgIG9uQ2hhbmdlS2l0OiAobW9kZWwpIC0+XG4gICAgICBAa2l0TW9kZWwgPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsXG4gICAgICBAJGtpdExhYmVsLnRleHQgQGtpdE1vZGVsLmdldCAnbGFiZWwnXG5cblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdFNlbGVjdG9yIiwiIyMjKlxuICogU291bmQgdHlwZSBzZWxlY3RvciBmb3IgY2hvb3Npbmcgd2hpY2ggc291bmQgc2hvdWxkXG4gKiBwbGF5IG9uIGVhY2ggdHJhY2tcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBJbnN0cnVtZW50IGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIHZpZXcgY2xhc3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnaW5zdHJ1bWVudCdcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFJlZiB0byB0aGUgSW5zdHJ1bWVudE1vZGVsXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG5cbiAgIG1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIHBhcmVudCBraXRcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRNb2RlbDogbnVsbFxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQnOiAnb25DbGljaydcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBjbGljayBldmVudHMuICBVcGRhdGVzIHRoZSBjdXJyZW50IGluc3RydW1lbnQgbW9kZWwsIHdoaWNoXG4gICAjIEluc3RydW1lbnRTZWxlY3RvclBhbmVsIGxpc3RlbnMgdG8sIGFuZCBhZGRzIGEgc2VsZWN0ZWQgc3RhdGVcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGtpdE1vZGVsLnNldCAnY3VycmVudEluc3RydW1lbnQnLCBAbW9kZWxcbiAgICAgIEAkZWwuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudCIsIiMjIypcbiAqIFBhbmVsIHdoaWNoIGhvdXNlcyBlYWNoIGluZGl2aWR1YWwgc2VsZWN0YWJsZSBzb3VuZFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuSW5zdHJ1bWVudCAgPSByZXF1aXJlICcuL0luc3RydW1lbnQuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXBhbmVsLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCBleHRlbmRzIFZpZXdcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFJlZiB0byB0aGUgYXBwbGljYXRpb24gbW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIGtpdCBjb2xsZWN0aW9uXG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQga2l0XG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0TW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byBpbnN0cnVtZW50IHZpZXdzXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgaW5zdHJ1bWVudFZpZXdzOiBudWxsXG5cblxuXG5cbiAgICMgSW5pdGlhbGl6ZXMgdGhlIGluc3RydW1lbnQgc2VsZWN0b3IgYW5kIHNldHMgYSBsb2NhbCByZWZcbiAgICMgdG8gdGhlIGN1cnJlbnQga2l0IG1vZGVsIGZvciBlYXN5IGFjY2Vzc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQGtpdE1vZGVsID0gQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKVxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYXMgd2VsbCBhcyB0aGUgYXNzb2NpYXRlZCBraXQgaW5zdHJ1bWVudHNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRjb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItaW5zdHJ1bWVudHMnXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW5kZXJzIGVhY2ggaW5kaXZpZHVhbCBraXQgbW9kZWwgaW50byBhbiBJbnN0cnVtZW50XG5cbiAgIHJlbmRlckluc3RydW1lbnRzOiAtPlxuICAgICAgQGluc3RydW1lbnRWaWV3cyA9IFtdXG5cbiAgICAgIEBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuZWFjaCAobW9kZWwpID0+XG4gICAgICAgICBpbnN0cnVtZW50ID0gbmV3IEluc3RydW1lbnRcbiAgICAgICAgICAgIGtpdE1vZGVsOiBAa2l0TW9kZWxcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuXG4gICAgICAgICBAJGNvbnRhaW5lci5hcHBlbmQgaW5zdHJ1bWVudC5yZW5kZXIoKS5lbFxuICAgICAgICAgQGluc3RydW1lbnRWaWV3cy5wdXNoIGluc3RydW1lbnRcblxuXG5cblxuICAgIyBBZGRzIGV2ZW50IGxpc3RlbmVycyByZWxhdGVkIHRvIGtpdCBjaGFuZ2VzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uS2l0Q2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGtpdE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cblxuICAgIyBSZW1vdmVzIGV2ZW50IGxpc3RlbmVyc1xuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cblxuXG4gICAjIEVWRU5UIExJU1RFTkVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIENsZWFucyB1cCB0aGUgdmlldyBhbmQgcmUtcmVuZGVyc1xuICAgIyB0aGUgaW5zdHJ1bWVudHMgdG8gdGhlIERPTVxuICAgIyBAcGFyYW0ge0tpdE1vZGVsfSBtb2RlbFxuXG4gICBvbktpdENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQHJlbW92ZUV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQGtpdE1vZGVsID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbFxuXG4gICAgICBfLmVhY2ggQGluc3RydW1lbnRWaWV3cywgKGluc3RydW1lbnQpIC0+XG4gICAgICAgICBpbnN0cnVtZW50LnJlbW92ZSgpXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICBvbkluc3RydW1lbnRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEAkY29udGFpbmVyLmZpbmQoJy5pbnN0cnVtZW50JykucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuXG5cbiAgIG9uVGVzdENsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9J2NvbnRhaW5lci1pbnN0cnVtZW50cyc+XFxuXFxuPC9kaXY+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIjtcblxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9J2ljb24gXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmljb24pIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmljb247IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCInPjwvZGl2PlxcbjxkaXYgY2xhc3M9J2xhYmVsJz5cXG5cdFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCIjIyMqXG4gKiBMaXZlIE1QQyBcInBhZFwiIGNvbXBvbmVudFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbkFwcEV2ZW50ICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuUGFkU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYWRTcXVhcmVNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVNb2RlbC5jb2ZmZWUnXG5WaWV3ICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuUGFkU3F1YXJlICAgICAgICAgICA9IHJlcXVpcmUgJy4vUGFkU3F1YXJlLmNvZmZlZSdcbnBhZHNUZW1wbGF0ZSAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYWRzLXRlbXBsYXRlLmhicydcbmluc3RydW1lbnRzVGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50cy10ZW1wbGF0ZS5oYnMnXG50ZW1wbGF0ZSAgICAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvbGl2ZS1wYWQtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIExpdmVQYWQgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBLZXkgY29tbWFuZCBrZXltYXAgZm9yIGxpdmUga2l0IHBsYXliYWNrXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgS0VZTUFQOiBbJzEnLCcyJywnMycsJzQnLCdxJywgJ3cnLCAnZScsICdyJywgJ2EnLCAncycsICdkJywgJ2YnLCAneicsICd4JywgJ2MnLCAndiddXG5cblxuICAgIyBUaGUgY2xhc3NuYW1lIGZvciB0aGUgTGl2ZSBQYWRcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnY29udGFpbmVyLWxpdmUtcGFkJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBBcHBtb2RlbCBmb3IgbGlzdGVuaW5nIHRvIHNob3cgLyBoaWRlIGV2ZW50c1xuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBDb2xsZWN0aW9uIG9mIGtpdHMgdG8gYmUgcmVuZGVyZWQgdG8gdGhlIGluc3RydW1lbnQgY29udGFpbmVyXG4gICAjIEB0eXBlIHtLaXRDb2xsZWN0aW9ufVxuXG4gICBraXRDb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBDb2xsZWN0aW9uIG9mIGluc3RydW1lbnRzLiAgVXNlZCB0byBsaXN0ZW4gdG8gYGRyb3BwZWRgIHN0YXR1c1xuICAgIyBvbiBpbmRpdmlkdWFsIGluc3RydW1lbnQgbW9kZWxzLCBhcyBzZXQgZnJvbSB0aGUgUGFkU3F1YXJlXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cblxuICAgaW5zdHJ1bWVudENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIENvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBwYWQgc3F1YXJlIG1vZGVsc1xuICAgIyBAdHlwZSB7UGFkU3F1YXJlQ29sbGVjdGlvbn1cblxuICAgcGFkU3F1YXJlQ29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgQW4gYXJyYXkgb2YgaW5kaXZpZHVhbCBQYWRTcXVhcmVWaWV3c1xuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIHBhZFNxdWFyZVZpZXdzOiBudWxsXG5cblxuICAgIyBNb3VzZSB0cmFja2VyIHdoaWNoIGNvbnN0YW50bHkgdXBkYXRlcyBtb3VzZSAvIHRvdWNoIHBvc2l0aW9uIHZpYSAueCBhbmQgLnlcbiAgICMgQHR5cGUge09iamVjdH1cblxuICAgbW91c2VQb3NpdGlvbjogeDogMCwgeTogMFxuXG5cblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGFuZCBhbmQgcGFyc2UgdGhlIGNvbGxlY3Rpb24gaW50byBhIGRpc3BsYXlhYmxlXG4gICAjIGluc3RydW1lbnQgLyBwYWQgdGFibGVcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICMgQHJldHVybiB7TGl2ZVBhZH1cblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRwYWRzQ29udGFpbmVyICAgICAgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1wYWRzJ1xuICAgICAgQCRpbnN0cnVtZW50c0NvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1pbnN0cnVtZW50cydcblxuICAgICAgQHJlbmRlclBhZHMoKVxuICAgICAgQHJlbmRlckluc3RydW1lbnRzKClcblxuICAgICAgIyBSZW5kZXIgc3F1YXJlcyB0byB0aGUgRE9NXG4gICAgICBfLmVhY2ggQHBhZFNxdWFyZVZpZXdzLCAocGFkU3F1YXJlKSA9PlxuICAgICAgICAgaWQgPSBwYWRTcXVhcmUubW9kZWwuZ2V0ICdpZCdcbiAgICAgICAgIEAkZWwuZmluZChcIiMje2lkfVwiKS5odG1sIHBhZFNxdWFyZS5yZW5kZXIoKS5lbFxuXG4gICAgICBAc2V0RHJhZ0FuZERyb3AoKVxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQFxuXG5cblxuICAgIyBSZW5kZXJzIG91dCB0aGUgaW5zdHJ1bWVudCBwYWQgc3F1YXJlc1xuXG4gICByZW5kZXJQYWRzOiAtPlxuICAgICAgQCRwYWRzQ29udGFpbmVyLmh0bWwgcGFkc1RlbXBsYXRlIHtcbiAgICAgICAgIHBhZFRhYmxlOiBAcmV0dXJuUGFkVGFibGVEYXRhKClcbiAgICAgIH1cblxuXG5cbiAgICMgUmVuZGVycyBvdXQgdGhlIGluc3RydW1lbnQgcmFja3MgYnkgaXRlcmF0aW5nIHRocm91Z2hcbiAgICMgZWFjaCBvZiB0aGUgaW5zdHJ1bWVudCBzZXRzIGluIHRoZSBLaXRDb2xsZWN0aW9uXG5cbiAgIHJlbmRlckluc3RydW1lbnRzOiAtPlxuICAgICAgQCRpbnN0cnVtZW50c0NvbnRhaW5lci5odG1sIGluc3RydW1lbnRzVGVtcGxhdGUge1xuICAgICAgICAgaW5zdHJ1bWVudFRhYmxlOiBAcmV0dXJuSW5zdHJ1bWVudFRhYmxlRGF0YSgpXG4gICAgICB9XG5cblxuXG4gICAjIEFkZCBjb2xsZWN0aW9uIGxpc3RlbmVycyB0byBsaXN0ZW4gZm9yIGluc3RydW1lbnQgZHJvcHNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICAkKGRvY3VtZW50KS5vbiAnbW91c2Vtb3ZlJywgQG9uTW91c2VNb3ZlXG5cblxuXG4gICAjIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgJChkb2N1bWVudCkub2ZmICdtb3VzZW1vdmUnLCBAb25Nb3VzZU1vdmVcbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBUT0RPOiBVcGRhdGUgbW91c2UgbW92ZSB0byBzdXBwb3J0IHRvdWNoIGV2ZW50c1xuICAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgIG9uTW91c2VNb3ZlOiAoZXZlbnQpID0+XG4gICAgICBAbW91c2VQb3NpdGlvbiA9XG4gICAgICAgICB4OiBldmVudC5wYWdlWFxuICAgICAgICAgeTogZXZlbnQucGFnZVlcblxuXG5cbiAgICMgSGFuZGxlciBmb3IgZHJvcCBjaGFuZ2UgZXZlbnRzLiAgQ2hlY2tzIHRvIHNlZSBpZiB0aGUgaW5zdHJ1bWVudFxuICAgIyBjbGFzc05hbWUgZXhpc3RzIG9uIHRoZSBlbGVtZW50IGFuZCwgaWYgc28sIHJlLXJlbmRlcnMgdGhlXG4gICAjIGluc3RydW1lbnQgYW5kIHBhZCB0YWJsZXNcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IGluc3RydW1lbnRNb2RlbFxuXG4gICBvbkRyb3BwZWRDaGFuZ2U6IChpbnN0cnVtZW50TW9kZWwpID0+XG4gICAgICBpbnN0cnVtZW50SWQgICAgICAgPSBpbnN0cnVtZW50TW9kZWwuZ2V0KCdpZCcpXG4gICAgICAkcGFkU3F1YXJlICAgICAgICAgPSBAJGVsLmZpbmQgXCIuI3tpbnN0cnVtZW50SWR9XCJcbiAgICAgIHBhZFNxdWFyZUlkICAgICAgICA9ICRwYWRTcXVhcmUuYXR0ciAnaWQnXG4gICAgICBwYWRTcXVhcmVNb2RlbCAgICAgPSBAcGFkU3F1YXJlQ29sbGVjdGlvbi5maW5kV2hlcmUgeyBpZDogcGFkU3F1YXJlSWQgfVxuXG4gICAgICAjIENoZWNrcyBhZ2FpbnN0IHRlc3RzIGFuZCBkcmFnZ2FibGUsIHdoaWNoIGlzIGxlc3MgdGVzdGFibGVcbiAgICAgIHVubGVzcyBwYWRTcXVhcmVNb2RlbCBpcyB1bmRlZmluZWRcbiAgICAgICAgIHBhZFNxdWFyZU1vZGVsLnNldCAnY3VycmVudEluc3RydW1lbnQnLCBpbnN0cnVtZW50TW9kZWxcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBkcm9wIGV2ZW50cy4gIFBhc3NlcyBpbiB0aGUgaXRlbSBkcmFnZ2VkLCB0aGUgaXRlbSBpdCB3YXNcbiAgICMgZHJvcHBlZCB1cG9uLCBhbmQgdGhlIG9yaWdpbmFsIGV2ZW50IHRvIHN0b3JlIGluIG1lbW9yeSBmb3Igd2hlblxuICAgIyB0aGUgdXNlciB3YW50cyB0byBcImRldGFjaFwiIHRoZSBkcm9wcGVkIGl0ZW0gYW5kIG1vdmUgaXQgYmFjayBpbnRvIHRoZVxuICAgIyBpbnN0cnVtZW50IHF1ZXVlXG4gICAjXG4gICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGRyYWdnZWRcbiAgICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gZHJvcHBlZFxuICAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgIG9uSW5zdHJ1bWVudERyb3A6IChkcmFnZ2VkLCBkcm9wcGVkLCBldmVudCkgPT5cbiAgICAgIHskZHJhZ2dlZCwgJGRyb3BwZWQsIGlkLCBpbnN0cnVtZW50TW9kZWx9ID0gQHBhcnNlRHJhZ2dlZEFuZERyb3BwZWQoIGRyYWdnZWQsIGRyb3BwZWQgKVxuXG4gICAgICAkZHJvcHBlZC5hZGRDbGFzcyBpZFxuICAgICAgJGRyb3BwZWQuYXR0ciAnZGF0YS1pbnN0cnVtZW50JywgXCIje2lkfVwiXG5cbiAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICdkcm9wcGVkJzogdHJ1ZVxuICAgICAgICAgJ2Ryb3BwZWRFdmVudCc6IGV2ZW50XG5cbiAgICAgIF8uZGVmZXIgPT5cbiAgICAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgICAgICBAc2V0RHJhZ0FuZERyb3AoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHNpdHVhdGlvbnMgd2hlcmUgdGhlIHVzZXIgYXR0ZW1wdHMgdG8gZHJvcCB0aGUgaW5zdHJ1bWVudCBpbmNvcnJlY3RseVxuICAgIyBAcGFyYW0ge0hUTUxEb21FbGVtZW50fSBkcmFnZ2VkXG4gICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGRyb3BwZWRcblxuICAgb25QcmV2ZW50SW5zdHJ1bWVudERyb3A6IChkcmFnZ2VkLCBkcm9wcGVkKSA9PlxuICAgICAgeyRkcmFnZ2VkLCAkZHJvcHBlZCwgaWQsIGluc3RydW1lbnRNb2RlbH0gPSBAcGFyc2VEcmFnZ2VkQW5kRHJvcHBlZCggZHJhZ2dlZCwgZHJvcHBlZCApXG5cbiAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICdkcm9wcGVkJzogZmFsc2VcbiAgICAgICAgICdkcm9wcGVkRXZlbnQnOiBudWxsXG5cbiAgICAgIF8uZGVmZXIgPT5cbiAgICAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgICAgICBAc2V0RHJhZ0FuZERyb3AoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHByZXNzIGFuZCBob2xkIGV2ZW50cywgYXMgZGlzcGF0Y2hlZCBmcm9tIHRoZSBwYWQgc3F1YXJlIHRoZSB1c2VyXG4gICAjIGlzIGludGVyYWN0aW5nIHdpdGguICBSZWxlYXNlcyB0aGUgaW5zdHJ1bWVudCBhbmQgYWxsb3dzIHRoZSB1c2VyIHRvIGRyYWcgdG9cbiAgICMgYSBuZXcgc3F1YXJlIG9yIGRlcG9zaXQgaXQgYmFjayB3aXRoaW4gdGhlIGluc3RydW1lbnQgcmFja1xuICAgIyBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG5cbiAgIG9uUGFkU3F1YXJlRHJhZ2dpbmdTdGFydDogKHBhcmFtcykgPT5cbiAgICAgIHtpbnN0cnVtZW50SWQsICRwYWRTcXVhcmUsIG9yaWdpbmFsRHJvcHBlZEV2ZW50fSA9IHBhcmFtc1xuXG4gICAgICAkZHJvcHBlZEluc3RydW1lbnQgPSAkKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGluc3RydW1lbnRJZCkpXG5cbiAgICAgICMgUmV0dXJuIHRoZSBkcmFnZ2FibGUgaW5zdGFuY2UgYXNzb2NpYXRlZCB3aXRoIHRoZSBwYWQgc3F1YXJlXG4gICAgICBkcmFnZ2FibGUgPSBfLmZpbmQgQGRyYWdnYWJsZSwgKGRyYWdnYWJsZUVsZW1lbnQpID0+XG4gICAgICAgICBpZiAkKGRyYWdnYWJsZUVsZW1lbnQuX2V2ZW50VGFyZ2V0KS5hdHRyKCdpZCcpIGlzICRkcm9wcGVkSW5zdHJ1bWVudC5hdHRyKCdpZCcpXG4gICAgICAgICAgICByZXR1cm4gZHJhZ2dhYmxlRWxlbWVudFxuXG4gICAgICBvZmZzZXQgPSAkZHJvcHBlZEluc3RydW1lbnQub2Zmc2V0KClcblxuICAgICAgIyBTaWxlbnRseSB1cGRhdGUgdGhlIHBvc2l0aW9uIG9mIHRoZSBpbnN0cnVtZW50XG4gICAgICAkZHJvcHBlZEluc3RydW1lbnQuY3NzICdwb3NpdGlvbicsICdhYnNvbHV0ZSdcblxuICAgICAgIyBUT0RPOiBJZiBCb3VuZHMgYXJlIHNldCBvbiB0aGUgb3JpZ2luYWwgZHJhZ2dhYmxlIHRoZW4gdGhlcmUncyBhIHdlaXJkXG4gICAgICAjIGJvdW5kcnkgb2Zmc2V0IHRoYXQgbmVlZHMgdG8gYmUgc29sdmVkLiAgUmVzZXQgaW4gRHJhZ2dhYmxlIGNvbnN0cnVjdG9yXG5cbiAgICAgIFR3ZWVuTWF4LnNldCAkZHJvcHBlZEluc3RydW1lbnQsXG4gICAgICAgICBsZWZ0OiBAbW91c2VQb3NpdGlvbi54IC0gKCRkcm9wcGVkSW5zdHJ1bWVudC53aWR0aCgpICAqIC41KVxuICAgICAgICAgdG9wOiAgQG1vdXNlUG9zaXRpb24ueSAtICgkZHJvcHBlZEluc3RydW1lbnQuaGVpZ2h0KCkgKiAuNSlcblxuICAgICAgIyBSZW5hYmxlIGRyYWdnaW5nXG4gICAgICBkcmFnZ2FibGUuc3RhcnREcmFnIG9yaWdpbmFsRHJvcHBlZEV2ZW50XG4gICAgICBkcmFnZ2FibGUudXBkYXRlKHRydWUpXG5cbiAgICAgICMgQW5kIHNob3cgaXRcbiAgICAgICRkcm9wcGVkSW5zdHJ1bWVudC5zaG93KClcblxuXG5cblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgU2V0cyB1cCBkcmFnIGFuZCBkcm9wIG9uIGVhY2ggb2YgdGhlIGluc3RydW1lbnRzIHJlbmRlcmVkIGZyb20gdGhlIEtpdENvbGxlY3Rpb25cbiAgICMgQWRkcyBoaWdobGlnaHRzIGFuZCBkZXRlcm1pbmVzIGhpdC10ZXN0cywgb3IgZGVmZXJzIHRvIG9uUHJldmVudEluc3RydW1lbnREcm9wXG4gICAjIGluIHNpdHVhdGlvbnMgd2hlcmUgZHJvcHBpbmcgaXNuJ3QgcG9zc2libGVcblxuICAgc2V0RHJhZ0FuZERyb3A6IC0+XG4gICAgICBzZWxmID0gQFxuXG4gICAgICBAJGluc3RydW1lbnQgPSBAJGVsLmZpbmQgJy5pbnN0cnVtZW50J1xuICAgICAgJGRyb3BwYWJsZXMgID0gQCRlbC5maW5kICcuY29udGFpbmVyLXBhZCdcblxuICAgICAgQGRyYWdnYWJsZSA9IERyYWdnYWJsZS5jcmVhdGUgQCRpbnN0cnVtZW50LFxuICAgICAgICAgI2JvdW5kczogd2luZG93XG5cblxuICAgICAgICAgIyBIYW5kbGVyIGZvciBkcmFnIGV2ZW50cy4gIEl0ZXJhdGVzIG92ZXIgYWxsIGRyb3BwYWJsZSBzcXVhcmUgYXJlYXNcbiAgICAgICAgICMgYW5kIGNoZWNrcyB0byBzZWUgaWYgYW4gaW5zdHJ1bWVudCBjdXJyZW50bHkgb2NjdXBpZXMgdGhlIHBvc2l0aW9uXG5cbiAgICAgICAgIG9uRHJhZzogKGV2ZW50KSAtPlxuXG4gICAgICAgICAgICBpID0gJGRyb3BwYWJsZXMubGVuZ3RoXG5cbiAgICAgICAgICAgIHdoaWxlKCAtLWkgPiAtMSApXG5cbiAgICAgICAgICAgICAgIGlmIEBoaXRUZXN0KCRkcm9wcGFibGVzW2ldLCAnNTAlJylcblxuICAgICAgICAgICAgICAgICAgaW5zdHJ1bWVudCA9ICQoJGRyb3BwYWJsZXNbaV0pLmF0dHIoJ2RhdGEtaW5zdHJ1bWVudCcpXG5cbiAgICAgICAgICAgICAgICAgICMgUHJldmVudCBkcm9wcGFibGVzIG9uIHNxdWFyZXMgdGhhdCBhbHJlYWR5IGhhdmUgaW5zdHJ1bWVudHNcbiAgICAgICAgICAgICAgICAgIGlmIGluc3RydW1lbnQgaXMgbnVsbCBvciBpbnN0cnVtZW50IGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgJCgkZHJvcHBhYmxlc1tpXSkuYWRkQ2xhc3MgJ2hpZ2hsaWdodCdcblxuICAgICAgICAgICAgICAgIyBSZW1vdmUgaWYgbm90IG92ZXIgc3F1YXJlXG4gICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAkKCRkcm9wcGFibGVzW2ldKS5yZW1vdmVDbGFzcyAnaGlnaGxpZ2h0J1xuXG5cbiAgICAgICAgICMgQ2hlY2sgdG8gc2VlIGlmIGluc3RydW1lbnQgaXMgZHJvcHBhYmxlOyBvdGhlcndpc2VcbiAgICAgICAgICMgdHJpZ2dlciBhIFwiY2FudCBkcm9wXCIgYW5pbWF0aW9uXG5cbiAgICAgICAgIG9uRHJhZ0VuZDogKGV2ZW50KSAtPlxuXG4gICAgICAgICAgICBpID0gJGRyb3BwYWJsZXMubGVuZ3RoXG5cbiAgICAgICAgICAgIGRyb3BwZWRQcm9wZXJseSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHdoaWxlKCAtLWkgPiAtMSApXG5cbiAgICAgICAgICAgICAgIGlmIEBoaXRUZXN0KCRkcm9wcGFibGVzW2ldLCAnNTAlJylcbiAgICAgICAgICAgICAgICAgIGluc3RydW1lbnQgPSAkKCRkcm9wcGFibGVzW2ldKS5hdHRyKCdkYXRhLWluc3RydW1lbnQnKVxuXG4gICAgICAgICAgICAgICAgICAjIFByZXZlbnQgZHJvcHBhYmxlcyBvbiBzcXVhcmVzIHRoYXQgYWxyZWFkeSBoYXZlIGluc3RydW1lbnRzXG4gICAgICAgICAgICAgICAgICBpZiBpbnN0cnVtZW50IGlzIG51bGwgb3IgaW5zdHJ1bWVudCBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgIGRyb3BwZWRQcm9wZXJseSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgIHNlbGYub25JbnN0cnVtZW50RHJvcCggdGhpcy50YXJnZXQsICRkcm9wcGFibGVzW2ldLCBldmVudCApXG5cblxuICAgICAgICAgICAgICAgICAgIyBTZW5kIGluc3RydW1lbnQgYmFja1xuICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgc2VsZi5vblByZXZlbnRJbnN0cnVtZW50RHJvcCggdGhpcy50YXJnZXQsICRkcm9wcGFibGVzW2ldIClcblxuICAgICAgICAgICAgICAgIyBTZW5kIGluc3RydW1lbnQgYmFja1xuICAgICAgICAgICAgICAgaWYgZHJvcHBlZFByb3Blcmx5IGlzIGZhbHNlXG4gICAgICAgICAgICAgICAgICBzZWxmLm9uUHJldmVudEluc3RydW1lbnREcm9wKCB0aGlzLnRhcmdldCwgJGRyb3BwYWJsZXNbaV0gKVxuXG5cblxuXG4gICAjIEhlbHBlciBtZXRob2QgZm9yIHBhcnNpbmcgdGhlIGRyYWcgYW5kIGRyb3AgZXZlbnQgcmVzcG9uc2VzXG4gICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGRyYWdnZWRcbiAgICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gZHJvcHBlZFxuXG4gICBwYXJzZURyYWdnZWRBbmREcm9wcGVkOiAoZHJhZ2dlZCwgZHJvcHBlZCkgPT5cbiAgICAgICRkcmFnZ2VkID0gJChkcmFnZ2VkKVxuICAgICAgJGRyb3BwZWQgPSAkKGRyb3BwZWQpXG4gICAgICBpZCA9ICRkcmFnZ2VkLmF0dHIgJ2lkJ1xuICAgICAgaW5zdHJ1bWVudE1vZGVsID0gQGtpdENvbGxlY3Rpb24uZmluZEluc3RydW1lbnRNb2RlbCBpZFxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAgJGRyYWdnZWQ6ICRkcmFnZ2VkXG4gICAgICAgICAkZHJvcHBlZDogJGRyb3BwZWRcbiAgICAgICAgIGlkOiBpZFxuICAgICAgICAgaW5zdHJ1bWVudE1vZGVsOiBpbnN0cnVtZW50TW9kZWxcbiAgICAgIH1cblxuXG5cblxuICAgIyBSZW5kZXIgb3V0IHRoZSB0YWJsZSBmb3IgdGhlIGxpdmUgcGFkIGdyaWQgYW5kIHB1c2hcbiAgICMgaXQgaW50byBhbiBhcnJheSBvZiB0YWJsZSByb3dzIGFuZCB0ZHNcbiAgICMgQHJldHVybiB7T2JqZWN0fVxuXG4gICByZXR1cm5QYWRUYWJsZURhdGE6IC0+XG5cbiAgICAgIEBwYWRTcXVhcmVDb2xsZWN0aW9uID0gbmV3IFBhZFNxdWFyZUNvbGxlY3Rpb24oKVxuICAgICAgQHBhZFNxdWFyZVZpZXdzID0gW11cbiAgICAgIHBhZFRhYmxlID0ge31cbiAgICAgIHJvd3MgPSBbXVxuICAgICAgaXRlcmF0b3IgPSAwXG5cbiAgICAgICMgUmVuZGVyIG91dCByb3dzXG4gICAgICBfKDQpLnRpbWVzIChpbmRleCkgPT5cbiAgICAgICAgIHRkcyAgPSBbXVxuXG4gICAgICAgICAjIFJlbmRlciBvdXQgY29sdW1uc1xuICAgICAgICAgXyg0KS50aW1lcyAoaW5kZXgpID0+XG5cbiAgICAgICAgICAgICMgSW5zdGFudGlhdGUgZWFjaCBwYWQgdmlldyBhbmQgdGllIHRoZSBpZFxuICAgICAgICAgICAgIyB0byB0aGUgRE9NIGVsZW1lbnRcblxuICAgICAgICAgICAgbW9kZWwgPSBuZXcgUGFkU3F1YXJlTW9kZWxcbiAgICAgICAgICAgICAgIGtleWNvZGU6IEBLRVlNQVBbaXRlcmF0b3JdXG5cbiAgICAgICAgICAgIHBhZFNxdWFyZSA9IG5ldyBQYWRTcXVhcmVcbiAgICAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuICAgICAgICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgICAgICAgQHBhZFNxdWFyZUNvbGxlY3Rpb24uYWRkIG1vZGVsXG4gICAgICAgICAgICBAcGFkU3F1YXJlVmlld3MucHVzaCBwYWRTcXVhcmVcbiAgICAgICAgICAgIGl0ZXJhdG9yKytcblxuICAgICAgICAgICAgIyBCZWdpbiBsaXN0ZW5pbmcgdG8gZHJhZyAvIHJlbGVhc2UgLyByZW1vdmUgZXZlbnRzIGZyb21cbiAgICAgICAgICAgICMgZWFjaCBwYWQgc3F1YXJlIGFuZCByZS1yZW5kZXIgcGFkIHNxdWFyZXNcblxuICAgICAgICAgICAgQGxpc3RlblRvIHBhZFNxdWFyZSwgQXBwRXZlbnQuQ0hBTkdFX0RSQUdHSU5HLCBAb25QYWRTcXVhcmVEcmFnZ2luZ1N0YXJ0XG5cblxuICAgICAgICAgICAgdGRzLnB1c2gge1xuICAgICAgICAgICAgICAgJ2lkJzogcGFkU3F1YXJlLm1vZGVsLmdldCgnaWQnKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICByb3dzLnB1c2gge1xuICAgICAgICAgICAgJ2lkJzogXCJwYWQtcm93LSN7aW5kZXh9XCJcbiAgICAgICAgICAgICd0ZHMnOiB0ZHNcbiAgICAgICAgIH1cblxuICAgICAgcGFkVGFibGUucm93cyA9IHJvd3NcblxuICAgICAgcGFkVGFibGVcblxuXG5cblxuICAgIyBSZW5kZXIgb3V0IHRoZSBpbnN0cnVtZW50IHRhYmxlIGFuZCBwdXNoIGl0IGludG9cbiAgICMgYW5kIGFycmF5IG9mIGluZGl2aWR1YWwgaW5zdHJ1bWVudHNcbiAgICMgQHJldHVybiB7T2JqZWN0fVxuXG4gICByZXR1cm5JbnN0cnVtZW50VGFibGVEYXRhOiAtPlxuICAgICAgaW5zdHJ1bWVudFRhYmxlID0gQGtpdENvbGxlY3Rpb24ubWFwIChraXQpID0+XG4gICAgICAgICBpbnN0cnVtZW50Q29sbGVjdGlvbiA9IGtpdC5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgICAgIyBCZWdpbiBsaXN0ZW5pbmcgdG8gZHJvcCBldmVudHMgZm9yIGVhY2ggaW5zdHJ1bWVudFxuICAgICAgICAgIyBpbiB0aGUgSW5zdHJ1bWVudCBjb2xsZWN0aW9uXG5cbiAgICAgICAgIEBsaXN0ZW5UbyBpbnN0cnVtZW50Q29sbGVjdGlvbiwgQXBwRXZlbnQuQ0hBTkdFX0RST1BQRUQsIEBvbkRyb3BwZWRDaGFuZ2VcblxuICAgICAgICAgaW5zdHJ1bWVudHMgPSBpbnN0cnVtZW50Q29sbGVjdGlvbi5tYXAgKGluc3RydW1lbnQpID0+XG4gICAgICAgICAgICBpbnN0cnVtZW50LnRvSlNPTigpXG5cbiAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnbGFiZWwnOiAgICAgICBraXQuZ2V0ICdsYWJlbCdcbiAgICAgICAgICAgICdpbnN0cnVtZW50cyc6IGluc3RydW1lbnRzXG4gICAgICAgICB9XG5cbiAgICAgIGluc3RydW1lbnRUYWJsZVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMaXZlUGFkXG4iLCIjIyMqXG4gKiBMaXZlIE1QQyBcInBhZFwiIGNvbXBvbmVudFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3BhZC1zcXVhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFBhZFNxdWFyZSBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBkZWxheSB0aW1lIGJlZm9yZSBkcmFnIGZ1bmN0aW9uYWxpdHkgaXMgaW5pdGlhbGl6ZWRcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgRFJBR19UUklHR0VSX0RFTEFZOiAxMDAwXG5cblxuICAgIyBUaGUgdGFnIHRvIGJlIHJlbmRlcmVkIHRvIHRoZSBET01cbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdGFnTmFtZTogJ2RpdidcblxuXG4gICAjIFRoZSBjbGFzc25hbWUgZm9yIHRoZSBQYWQgU3F1YXJlXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3BhZC1zcXVhcmUnXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIE1vZGVsIHdoaWNoIHRyYWNrcyBzdGF0ZSBvZiBzcXVhcmUgYW5kIGluc3RydW1lbnRzXG4gICAjIEB0eXBlIHtQYWRTcXVhcmVNb2RlbH1cblxuICAgbW9kZWw6IG51bGxcblxuXG4gICAjIFRoZSBjdXJyZW50IGljb24gY2xhc3MgYXMgYXBwbGllZCB0byB0aGUgc3F1YXJlXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGN1cnJlbnRJY29uOiBudWxsXG5cblxuICAgIyBUaGUgYXVkaW8gcGxheWJhY2sgY29tcG9uZW50XG4gICAjIEB0eXBlIHtIb3dsfVxuXG4gICBhdWRpb1BsYXliYWNrOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaHN0YXJ0JzogJ29uUHJlc3MnXG4gICAgICAndG91Y2hlbmQnOiAgICdvblJlbGVhc2UnXG5cblxuXG5cbiAgICMgUmVuZGVycyBvdXQgaW5kaXZpZHVhbCBwYWQgc3F1YXJlc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGljb25Db250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItaWNvbidcbiAgICAgIEAkaWNvbiAgICAgICAgICA9IEAkaWNvbkNvbnRhaW5lci5maW5kICcuaWNvbidcblxuICAgICAgQFxuXG5cblxuICAgIyBSZW1vdmVzIHRoZSBwYWQgc3F1YXJlIGZyb20gdGhlIGRvbSBhbmQgY2xlYXJzXG4gICAjIG91dCBwcmUtc2V0IG9yIHVzZXItc2V0IHByb3BlcnRpZXNcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgQHJlbW92ZVNvdW5kQW5kQ2xlYXJQYWQoKVxuICAgICAgc3VwZXIoKVxuXG5cblxuICAgIyBBZGQgbGlzdGVuZXJzIHJlbGF0ZWQgdG8gZHJhZ2dpbmcsIGRyb3BwaW5nIGFuZCBjaGFuZ2VzXG4gICAjIHRvIGluc3RydW1lbnRzLlxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9UUklHR0VSLCAgICBAb25UcmlnZ2VyQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQG1vZGVsLCBBcHBFdmVudC5DSEFOR0VfRFJBR0dJTkcsICAgQG9uRHJhZ2dpbmdDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9EUk9QUEVELCAgICBAb25Ecm9wcGVkQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQG1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cblxuXG4gICAjIFVwZGF0ZXMgdGhlIHZpc3VhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgcGFkIHNxdWFyZVxuXG4gICB1cGRhdGVJbnN0cnVtZW50Q2xhc3M6IC0+XG4gICAgICBpbnN0cnVtZW50ID0gQG1vZGVsLmdldCAnY3VycmVudEluc3RydW1lbnQnXG4gICAgICBAJGVsLnBhcmVudCgpLmFkZENsYXNzIGluc3RydW1lbnQuZ2V0ICdpZCdcblxuXG5cblxuICAgIyBSZW5kZXJzIG91dCB0aGUgaW5pdGlhbCBpY29uIGFuZCBzZXRzIHRoZSBpc250cnVtZW50XG5cbiAgIHJlbmRlckljb246IC0+XG4gICAgICBpZiBAJGljb24uaGFzQ2xhc3MgQGN1cnJlbnRJY29uXG4gICAgICAgICBAJGljb24ucmVtb3ZlQ2xhc3MgQGN1cnJlbnRJY29uXG5cbiAgICAgIGluc3RydW1lbnQgPSBAbW9kZWwuZ2V0ICdjdXJyZW50SW5zdHJ1bWVudCdcblxuICAgICAgdW5sZXNzIGluc3RydW1lbnQgaXMgbnVsbFxuICAgICAgICAgQGN1cnJlbnRJY29uID0gaW5zdHJ1bWVudC5nZXQgJ2ljb24nXG4gICAgICAgICBAJGljb24uYWRkQ2xhc3MgQGN1cnJlbnRJY29uXG4gICAgICAgICBAJGljb24udGV4dCBpbnN0cnVtZW50LmdldCAnbGFiZWwnXG5cblxuXG5cbiAgICMgU2V0cyB0aGUgY3VycmVudCBzb3VuZCBhbmQgZW5hYmxlcyBhdWRpbyBwbGF5YmFja1xuXG4gICBzZXRTb3VuZDogLT5cbiAgICAgIEBhdWRpb1BsYXliYWNrPy51bmxvYWQoKVxuXG4gICAgICBpbnN0cnVtZW50ID0gQG1vZGVsLmdldCAnY3VycmVudEluc3RydW1lbnQnXG5cbiAgICAgIHVubGVzcyBpbnN0cnVtZW50IGlzIG51bGxcbiAgICAgICAgIGF1ZGlvU3JjID0gaW5zdHJ1bWVudC5nZXQgJ3NyYydcblxuICAgICAgICAgIyBUT0RPOiBUZXN0IG1ldGhvZHNcbiAgICAgICAgIGlmIHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Rlc3QnKSBpc250IC0xIHRoZW4gYXVkaW9TcmMgPSAnJ1xuXG4gICAgICAgICBAYXVkaW9QbGF5YmFjayA9IG5ldyBIb3dsXG4gICAgICAgICAgICB2b2x1bWU6IEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLm1lZGl1bVxuICAgICAgICAgICAgdXJsczogW2F1ZGlvU3JjXVxuICAgICAgICAgICAgb25lbmQ6IEBvblNvdW5kRW5kXG5cblxuXG5cbiAgICMgVHJpZ2dlcnMgYXVkaW8gcGxheWJhY2tcblxuICAgcGxheVNvdW5kOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2s/LnBsYXkoKVxuICAgICAgQG1vZGVsLnNldCAndHJpZ2dlcicsIGZhbHNlXG5cblxuXG5cbiAgICMgR2VuZXJpYyByZW1vdmUgYW5kIGNsZWFyIHdoaWNoIGlzIHRyaWdnZXJlZCB3aGVuIGEgdXNlclxuICAgIyBkcmFncyB0aGUgaW5zdHJ1bWVudCBvZmYgb2YgdGhlIHBhZCBvciB0aGUgdmlldyBpcyBkZXN0cm95ZWRcblxuICAgcmVtb3ZlU291bmRBbmRDbGVhclBhZDogLT5cbiAgICAgIGlmIEBtb2RlbC5nZXQoJ2N1cnJlbnRJbnN0cnVtZW50JykgaXMgbnVsbFxuICAgICAgICAgcmV0dXJuXG5cbiAgICAgIEBhdWRpb1BsYXliYWNrPy51bmxvYWQoKVxuICAgICAgQGF1ZGlvUGxheWJhY2sgPSBudWxsXG5cbiAgICAgIGN1cnJlbnRJbnN0cnVtZW50ID0gQG1vZGVsLmdldCAnY3VycmVudEluc3RydW1lbnQnXG5cbiAgICAgIGlkICAgPSBjdXJyZW50SW5zdHJ1bWVudC5nZXQgJ2lkJ1xuICAgICAgaWNvbiA9IGN1cnJlbnRJbnN0cnVtZW50LmdldCAnaWNvbidcblxuICAgICAgQCRlbC5wYXJlbnQoKS5yZW1vdmVBdHRyICdkYXRhLWluc3RydW1lbnQnXG4gICAgICBAJGVsLnBhcmVudCgpLnJlbW92ZUNsYXNzIGlkXG4gICAgICBAJGVsLnJlbW92ZUNsYXNzIGlkXG4gICAgICBAJGljb24ucmVtb3ZlQ2xhc3MgaWNvblxuICAgICAgQCRpY29uLnRleHQgJydcblxuICAgICAgXy5kZWZlciA9PlxuICAgICAgICAgQG1vZGVsLnNldFxuICAgICAgICAgICAgJ2RyYWdnaW5nJzogZmFsc2VcbiAgICAgICAgICAgICdkcm9wcGVkJzogZmFsc2VcblxuICAgICAgICAgY3VycmVudEluc3RydW1lbnQuc2V0XG4gICAgICAgICAgICAnZHJvcHBlZCc6IGZhbHNlXG4gICAgICAgICAgICAnZHJvcHBlZEV2ZW50JzogbnVsbFxuXG4gICAgICAgICBAbW9kZWwuc2V0ICdjdXJyZW50SW5zdHJ1bWVudCcsIG51bGxcblxuXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBwcmVzcyBldmVudHMsIHdoaWNoLCB3aGVuIGhlbGRcbiAgICMgdHJpZ2dlcnMgYSBcImRyYWdcIiBldmVudCBvbiB0aGUgbW9kZWxcbiAgICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gICBvblByZXNzOiAoZXZlbnQpID0+XG4gICAgICBAbW9kZWwuc2V0ICd0cmlnZ2VyJywgdHJ1ZVxuXG4gICAgICBAZHJhZ1RpbWVvdXQgPSBzZXRUaW1lb3V0ID0+XG4gICAgICAgICBAbW9kZWwuc2V0ICdkcmFnZ2luZycsIHRydWVcblxuICAgICAgLCBARFJBR19UUklHR0VSX0RFTEFZXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgcmVsZWFzZSBldmVudHMgd2hpY2ggY2xlYXJzXG4gICAjIGRyYWcgd2hldGhlciBkcmFnIHdhcyBpbml0aWF0ZWQgb3Igbm90XG4gICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICAgb25SZWxlYXNlOiAoZXZlbnQpID0+XG4gICAgICBjbGVhclRpbWVvdXQgQGRyYWdUaW1lb3V0XG4gICAgICBAbW9kZWwuc2V0ICdkcmFnZ2luZycsIGZhbHNlXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgZHJhZyBldmVudHMuXG4gICAjIFRPRE86IERvIHdlIG5lZWQgdGhpc1xuICAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgIG9uRHJhZzogKGV2ZW50KSAtPlxuICAgICAgQG1vZGVsLnNldCAnZHJhZ2dpbmcnLCB0cnVlXG5cblxuXG5cbiAgICMgU2V0IGRyb3BwZWQgc3RhdHVzIHNvIHRoYXQgYmktZGlyZWN0aW9uYWwgY2hhbmdlIGNhblxuICAgIyBiZSB0cmlnZ2VyZWQgZnJvbSB0aGUgTGl2ZVBhZCBraXQgcmVuZGVyXG4gICAjIEBwYXJhbSB7TnVtYmVyfSBpZFxuXG4gICBvbkRyb3A6IChpZCkgLT5cbiAgICAgIGluc3RydW1lbnRNb2RlbCA9IEBjb2xsZWN0aW9uLmZpbmRJbnN0cnVtZW50TW9kZWwgaWRcblxuICAgICAgaW5zdHJ1bWVudE1vZGVsLnNldCAnZHJvcHBlZCcsIHRydWVcblxuICAgICAgQG1vZGVsLnNldFxuICAgICAgICAgJ2RyYWdnaW5nJzogZmFsc2VcbiAgICAgICAgICdkcm9wcGVkJzogdHJ1ZVxuICAgICAgICAgJ2N1cnJlbnRJbnN0cnVtZW50JzogaW5zdHJ1bWVudE1vZGVsXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgJ2NoYW5nZTpkcmFnJyBtb2RlbCBldmVudHMsIHdoaWNoXG4gICAjIHNldHMgdXAgc2VxdWVuY2UgZm9yIGRyYWdnaW5nIG9uIGFuZCBvZmYgb2ZcbiAgICMgdGhlIHBhZCBzcXVhcmVcbiAgICMgQHBhcmFtIHtQYWRTcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25EcmFnZ2luZ0NoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgZHJhZ2dpbmcgPSBtb2RlbC5jaGFuZ2VkLmRyYWdnaW5nXG5cbiAgICAgIGlmIGRyYWdnaW5nIGlzIHRydWVcblxuICAgICAgICAgaW5zdHJ1bWVudElkID0gQCRlbC5wYXJlbnQoKS5hdHRyICdkYXRhLWluc3RydW1lbnQnXG5cbiAgICAgICAgIGN1cnJlbnRJbnN0cnVtZW50ICAgID0gQG1vZGVsLmdldCgnY3VycmVudEluc3RydW1lbnQnKVxuICAgICAgICAgb3JpZ2luYWxEcm9wcGVkRXZlbnQgPSBjdXJyZW50SW5zdHJ1bWVudC5nZXQgJ2Ryb3BwZWRFdmVudCdcblxuICAgICAgICAgQG1vZGVsLnNldCAnZHJvcHBlZCcsIGZhbHNlXG4gICAgICAgICBjdXJyZW50SW5zdHJ1bWVudC5zZXQgJ2Ryb3BwZWQnLCBmYWxzZVxuXG4gICAgICAgICAjIERpc3BhdGNoIGRyYWcgc3RhcnQgZXZlbnQgYmFjayB0byBMaXZlUGFkXG4gICAgICAgICBAdHJpZ2dlciBBcHBFdmVudC5DSEFOR0VfRFJBR0dJTkcsIHtcbiAgICAgICAgICAgICdpbnN0cnVtZW50SWQnOiBpbnN0cnVtZW50SWRcbiAgICAgICAgICAgICckcGFkU3F1YXJlJzogQCRlbC5wYXJlbnQoKVxuICAgICAgICAgICAgJ29yaWdpbmFsRHJvcHBlZEV2ZW50Jzogb3JpZ2luYWxEcm9wcGVkRXZlbnRcbiAgICAgICAgIH1cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBkcm9wIGNoYW5nZSBldmVudHMsIHdoaWNoIGNoZWNrcyB0byBzZWVcbiAgICMgaWYgaXRzIGJlZW4gZHJvcHBlZCBvZmYgdGhlIHNxdWFyZSBhbWQgY2xlYXJzXG4gICAjIEBwYXJhbSB7UGFkU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uRHJvcHBlZENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgZHJvcHBlZCA9IG1vZGVsLmNoYW5nZWQuZHJvcHBlZFxuXG4gICAgICB1bmxlc3MgZHJvcHBlZFxuICAgICAgICAgQHJlbW92ZVNvdW5kQW5kQ2xlYXJQYWQoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yICdjaGFuZ2U6dHJpZ2dlcicgZXZlbnRzLCB3aGljaCB0cmlnZ2Vyc1xuICAgIyBzb3VuZCBwbGF5YmFjayB3aGljaCB0aGVuIHJlc2V0cyBpdCB0byBmYWxzZSBvbiBjb21wbGV0XG4gICAjIEBwYXJhbSB7UGFkU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uVHJpZ2dlckNoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgdHJpZ2dlciA9IG1vZGVsLmNoYW5nZWQudHJpZ2dlclxuXG4gICAgICBpZiB0cmlnZ2VyXG4gICAgICAgICBAcGxheVNvdW5kKClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciAnY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50JyBldmVudHMsIHdoaWNoIHVwZGF0ZXNcbiAgICMgdGhlIHBhZCBzcXVhcmUgd2l0aCB0aGUgYXBwcm9wcmlhdGUgZGF0YVxuICAgIyBAcGFyYW0ge1BhZFNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gICBvbkluc3RydW1lbnRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIGluc3RydW1lbnQgPSBtb2RlbC5jaGFuZ2VkLmN1cnJlbnRJbnN0cnVtZW50XG5cbiAgICAgIHVubGVzcyBpbnN0cnVtZW50IGlzIG51bGwgb3IgaW5zdHJ1bWVudCBpcyB1bmRlZmluZWRcbiAgICAgICAgIEB1cGRhdGVJbnN0cnVtZW50Q2xhc3MoKVxuICAgICAgICAgQHJlbmRlckljb24oKVxuICAgICAgICAgQHNldFNvdW5kKClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBzb3VuZCBlbmQgZXZlbnRzLCB3aGljaCByZXNldHMgdGhlIHNvdW5kIHBsYXliYWNrXG5cbiAgIG9uU291bmRFbmQ6ID0+XG4gICAgICBAbW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZFNxdWFyZSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBzdGFjazEsIHNlbGY9dGhpcywgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIjtcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PGRpdiBjbGFzcz0nY29udGFpbmVyLWtpdCc+XFxuXHRcdDxoMz5cXG5cdFx0XHQ8Yj5cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmxhYmVsOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPC9iPlxcblx0XHQ8L2gzPlxcblxcblx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaW5zdHJ1bWVudHMsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgyLCBwcm9ncmFtMiwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdDwvZGl2PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMihkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXFxuXHRcdFx0PGRpdiBjbGFzcz0naW5zdHJ1bWVudCBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmRyb3BwZWQsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCInIGlkPVxcXCJcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWQpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmlkOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj5cXG5cdFx0XHRcdFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiIGhpZGRlbiBcIjtcbiAgfVxuXG4gIHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgZGVwdGgwLmluc3RydW1lbnRUYWJsZSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyByZXR1cm4gc3RhY2sxOyB9XG4gIGVsc2UgeyByZXR1cm4gJyc7IH1cbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjx0YWJsZSBjbGFzcz0nY29udGFpbmVyLXBhZHMnPlxcblxcbjwvdGFibGU+XFxuXFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLWluc3RydW1lbnRzJz5cXG5cXG48L2Rpdj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiO1xuXG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz0na2V5LWNvZGUnPlxcblx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmtleWNvZGUpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmtleWNvZGU7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG48L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPSdjb250YWluZXItaWNvbic+XFxuXHQ8ZGl2IGNsYXNzPSdpY29uJz5cXG5cXG5cdDwvZGl2PlxcbjwvZGl2PlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIHN0YWNrMiwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8dHI+XFxuXHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsIGRlcHRoMC50ZHMsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgyLCBwcm9ncmFtMiwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdDwvdHI+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0yKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0XHQ8dGQgY2xhc3M9J2NvbnRhaW5lci1wYWQnIGlkPVxcXCJcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWQpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmlkOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj5cXG5cXG5cdFx0XHQ8L3RkPlxcblx0XHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIHN0YWNrMiA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgKChzdGFjazEgPSBkZXB0aDAucGFkVGFibGUpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEucm93cyksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMiB8fCBzdGFjazIgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMjsgfVxuICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCIjIyMqXG4gKiBJbmRpdmlkdWFsIHNlcXVlbmNlciB0cmFja3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3BhdHRlcm4tc3F1YXJlLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIGNvbnRhaW5lciBjbGFzc25hbWVcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAncGF0dGVybi1zcXVhcmUnXG5cblxuICAgIyBUaGUgRE9NIHRhZyBhbmVtXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHRhZ05hbWU6ICd0ZCdcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgVGhlIGF1ZGlvIHBsYXliYWNrIGluc3RhbmNlIChIb3dsZXIpXG4gICAjIEB0eXBlIHtIb3dsfVxuXG4gICBhdWRpb1BsYXliYWNrOiBudWxsXG5cblxuICAgIyBUaGUgbW9kZWwgd2hpY2ggY29udHJvbHMgdm9sdW1lLCBwbGF5YmFjaywgZXRjXG4gICAjIEB0eXBlIHtQYXR0ZXJuU3F1YXJlTW9kZWx9XG5cbiAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbnVsbFxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQnOiAnb25DbGljaydcblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBhbmQgaW5zdGFudGlhdGVzIHRoZSBob3dsZXIgYXVkaW8gZW5naW5lXG4gICAjIEBwYXR0ZXJuU3F1YXJlTW9kZWwge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBhdWRpb1NyYyA9IEBwYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCdpbnN0cnVtZW50JykuZ2V0ICdzcmMnXG5cbiAgICAgICMgVE9ETzogVGVzdCBtZXRob2RzXG4gICAgICBpZiB3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCd0ZXN0JykgaXNudCAtMSB0aGVuIGF1ZGlvU3JjID0gJydcblxuICAgICAgQGF1ZGlvUGxheWJhY2sgPSBuZXcgSG93bFxuICAgICAgICAgdm9sdW1lOiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5sb3dcbiAgICAgICAgIHVybHM6IFthdWRpb1NyY11cbiAgICAgICAgIG9uZW5kOiBAb25Tb3VuZEVuZFxuXG4gICAgICBAXG5cblxuXG5cbiAgICMgUmVtb3ZlIHRoZSB2aWV3IGFuZCBkZXN0cm95IHRoZSBhdWRpbyBwbGF5YmFja1xuXG4gICByZW1vdmU6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjay51bmxvYWQoKVxuICAgICAgc3VwZXIoKVxuXG5cblxuXG4gICAjIEFkZHMgZXZlbnQgbGlzdGVuZXJzIGFuZCBiZWdpbnMgbGlzdGVuaW5nIGZvciB2ZWxvY2l0eSwgYWN0aXZpdHkgYW5kIHRyaWdnZXJzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9WRUxPQ0lUWSwgQG9uVmVsb2NpdHlDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAcGF0dGVyblNxdWFyZU1vZGVsLCBBcHBFdmVudC5DSEFOR0VfQUNUSVZFLCAgIEBvbkFjdGl2ZUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9UUklHR0VSLCAgQG9uVHJpZ2dlckNoYW5nZVxuXG5cblxuXG4gICAjIEVuYWJsZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgIGVuYWJsZTogLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuZW5hYmxlKClcblxuXG5cblxuICAgIyBEaXNhYmxlIHBsYXliYWNrIG9mIHRoZSBhdWRpbyBzcXVhcmVcblxuICAgZGlzYWJsZTogLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuZGlzYWJsZSgpXG5cblxuXG5cbiAgICMgUGxheWJhY2sgYXVkaW8gb24gdGhlIGF1ZGlvIHNxdWFyZVxuXG4gICBwbGF5OiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2sucGxheSgpXG5cbiAgICAgIFR3ZWVuTWF4LnRvIEAkZWwsIC4yLFxuICAgICAgICAgZWFzZTogQmFjay5lYXNlSW5cbiAgICAgICAgIHNjYWxlOiAuNVxuXG4gICAgICAgICBvbkNvbXBsZXRlOiA9PlxuXG4gICAgICAgICAgICBUd2Vlbk1heC50byBAJGVsLCAuMixcbiAgICAgICAgICAgICAgIHNjYWxlOiAxXG4gICAgICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBjbGljayBldmVudHMgb24gdGhlIGF1ZGlvIHNxdWFyZS4gIFRvZ2dsZXMgdGhlXG4gICAjIHZvbHVtZSBmcm9tIGxvdyB0byBoaWdoIHRvIG9mZlxuXG4gICBvbkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmN5Y2xlKClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciB2ZWxvY2l0eSBjaGFuZ2UgZXZlbnRzLiAgVXBkYXRlcyB0aGUgdmlzdWFsIGRpc3BsYXkgYW5kIHNldHMgdm9sdW1lXG4gICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gICBvblZlbG9jaXR5Q2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICB2ZWxvY2l0eSA9IG1vZGVsLmNoYW5nZWQudmVsb2NpdHlcblxuICAgICAgQCRlbC5yZW1vdmVDbGFzcyAndmVsb2NpdHktbG93IHZlbG9jaXR5LW1lZGl1bSB2ZWxvY2l0eS1oaWdoJ1xuXG4gICAgICAjIFNldCB2aXN1YWwgaW5kaWNhdG9yXG4gICAgICB2ZWxvY2l0eUNsYXNzID0gc3dpdGNoIHZlbG9jaXR5XG4gICAgICAgICB3aGVuIDEgdGhlbiAndmVsb2NpdHktbG93J1xuICAgICAgICAgd2hlbiAyIHRoZW4gJ3ZlbG9jaXR5LW1lZGl1bSdcbiAgICAgICAgIHdoZW4gMyB0aGVuICd2ZWxvY2l0eS1oaWdoJ1xuICAgICAgICAgZWxzZSAnJ1xuXG4gICAgICBAJGVsLmFkZENsYXNzIHZlbG9jaXR5Q2xhc3NcblxuXG4gICAgICAjIFNldCBhdWRpbyB2b2x1bWVcbiAgICAgIHZvbHVtZSA9IHN3aXRjaCB2ZWxvY2l0eVxuICAgICAgICAgd2hlbiAxIHRoZW4gQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubG93XG4gICAgICAgICB3aGVuIDIgdGhlbiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5tZWRpdW1cbiAgICAgICAgIHdoZW4gMyB0aGVuIEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLmhpZ2hcbiAgICAgICAgIGVsc2UgJydcblxuICAgICAgQGF1ZGlvUGxheWJhY2sudm9sdW1lKCB2b2x1bWUgKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGFjdGl2aXR5IGNoYW5nZSBldmVudHMuICBXaGVuIGluYWN0aXZlLCBjaGVja3MgYWdhaW5zdCBwbGF5YmFjayBhcmVcbiAgICMgbm90IHBlcmZvcm1lZCBhbmQgdGhlIHNxdWFyZSBpcyBza2lwcGVkLlxuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25BY3RpdmVDaGFuZ2U6IChtb2RlbCkgLT5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciB0cmlnZ2VyIFwicGxheWJhY2tcIiBldmVudHNcbiAgICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uVHJpZ2dlckNoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgaWYgbW9kZWwuY2hhbmdlZC50cmlnZ2VyIGlzIHRydWVcbiAgICAgICAgIEBwbGF5KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBzb3VuZCBwbGF5YmFjayBlbmQgZXZlbnRzLiAgUmVtb3ZlcyB0aGUgdHJpZ2dlclxuICAgIyBmbGFnIHNvIHRoZSBhdWRpbyB3b24ndCBvdmVybGFwXG5cbiAgIG9uU291bmRFbmQ6ID0+XG4gICAgICBAcGF0dGVyblNxdWFyZU1vZGVsLnNldCAndHJpZ2dlcicsIGZhbHNlXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblNxdWFyZSIsIiMjIypcbiAqIEluZGl2aWR1YWwgc2VxdWVuY2VyIHRyYWNrc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmUgICAgICAgICAgID0gcmVxdWlyZSAnLi9QYXR0ZXJuU3F1YXJlLmNvZmZlZSdcblZpZXcgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYXR0ZXJuLXRyYWNrLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBQYXR0ZXJuVHJhY2sgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgbmFtZSBvZiB0aGUgY2xhc3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAncGF0dGVybi10cmFjaydcblxuXG4gICAjIFRoZSB0eXBlIG9mIHRhZ1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICB0YWdOYW1lOiAndHInXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIEEgY29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIHZpZXcgc3F1YXJlc1xuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIHBhdHRlcm5TcXVhcmVWaWV3czogbnVsbFxuXG5cbiAgICMgQHR5cGUge1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9ufVxuICAgY29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cbiAgIG1vZGVsOiBudWxsXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLmxhYmVsLWluc3RydW1lbnQnOiAnb25MYWJlbENsaWNrJ1xuICAgICAgJ3RvdWNoZW5kIC5idG4tbXV0ZSc6ICAgICAgICAgJ29uTXV0ZUJ0bkNsaWNrJ1xuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYW5kIHJlbmRlcnMgb3V0IGluZGl2aWR1YWwgcGF0dGVybiBzcXVhcmVzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkbGFiZWwgPSBAJGVsLmZpbmQgJy5sYWJlbC1pbnN0cnVtZW50J1xuXG4gICAgICBAcmVuZGVyUGF0dGVyblNxdWFyZXMoKVxuXG4gICAgICBAXG5cblxuXG4gICByZW1vdmU6IC0+XG4gICAgICBfLmVhY2ggQHBhdHRlcm5TcXVhcmVWaWV3cywgKHNxdWFyZSkgPT5cbiAgICAgICAgIHNxdWFyZS5yZW1vdmUoKVxuXG4gICAgICBzdXBlcigpXG5cblxuXG5cbiAgICMgQWRkIGxpc3RlbmVycyB0byB0aGUgdmlldyB3aGljaCBsaXN0ZW4gZm9yIHZpZXcgY2hhbmdlc1xuICAgIyBhcyB3ZWxsIGFzIGNoYW5nZXMgdG8gdGhlIGNvbGxlY3Rpb24sIHdoaWNoIHNob3VsZCB1cGRhdGVcbiAgICMgcGF0dGVybiBzcXVhcmVzIHdpdGhvdXQgcmUtcmVuZGVyaW5nIHRoZSB2aWV3c1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBraXRNb2RlbCA9IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJylcblxuICAgICAgQGxpc3RlblRvIEBtb2RlbCwgICAgQXBwRXZlbnQuQ0hBTkdFX0ZPQ1VTLCAgICAgIEBvbkZvY3VzQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQG1vZGVsLCAgICBBcHBFdmVudC5DSEFOR0VfTVVURSwgICAgICAgQG9uTXV0ZUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBraXRNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0lOU1RSVU1FTlQsIEBvbkluc3RydW1lbnRDaGFuZ2VcblxuXG5cblxuICAgIyBSZW5kZXIgb3V0IHRoZSBwYXR0ZXJuIHNxdWFyZXMgYW5kIHB1c2ggdGhlbSBpbnRvIGFuIGFycmF5XG4gICAjIGZvciBmdXJ0aGVyIGl0ZXJhdGlvblxuXG4gICByZW5kZXJQYXR0ZXJuU3F1YXJlczogLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlVmlld3MgPSBbXVxuXG4gICAgICBAY29sbGVjdGlvbiA9IG5ldyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvblxuXG4gICAgICBfKDgpLnRpbWVzID0+XG4gICAgICAgICBAY29sbGVjdGlvbi5hZGQgbmV3IFBhdHRlcm5TcXVhcmVNb2RlbCB7IGluc3RydW1lbnQ6IEBtb2RlbCB9XG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgICAgcGF0dGVyblNxdWFyZSA9IG5ldyBQYXR0ZXJuU3F1YXJlXG4gICAgICAgICAgICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG1vZGVsXG5cbiAgICAgICAgIEAkbGFiZWwudGV4dCBtb2RlbC5nZXQgJ2xhYmVsJ1xuICAgICAgICAgQCRlbC5hcHBlbmQgcGF0dGVyblNxdWFyZS5yZW5kZXIoKS5lbFxuICAgICAgICAgQHBhdHRlcm5TcXVhcmVWaWV3cy5wdXNoIHBhdHRlcm5TcXVhcmVcblxuICAgICAgIyBTZXQgdGhlIHNxdWFyZXMgb24gdGhlIEluc3RydW1lbnQgbW9kZWwgdG8gdHJhY2sgYWdhaW5zdCBzdGF0ZVxuICAgICAgQG1vZGVsLnNldCAncGF0dGVyblNxdWFyZXMnLCBAY29sbGVjdGlvblxuXG5cblxuICAgIyBNdXRlIHRoZSBlbnRpcmUgdHJhY2tcblxuICAgbXV0ZTogLT5cbiAgICAgIEBtb2RlbC5zZXQgJ211dGUnLCB0cnVlXG5cblxuXG4gICAjIFVubXV0ZSB0aGUgZW50aXJlIHRyYWNrXG5cbiAgIHVubXV0ZTogLT5cbiAgICAgIEBtb2RlbC5zZXQgJ211dGUnLCBmYWxzZVxuXG5cblxuICAgc2VsZWN0OiAtPlxuICAgICAgQCRlbC5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cblxuXG4gICBkZXNlbGVjdDogLT5cbiAgICAgIGlmIEAkZWwuaGFzQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgICAgQCRlbC5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG5cblxuXG4gICBmb2N1czogLT5cbiAgICAgIEAkZWwuYWRkQ2xhc3MgJ2ZvY3VzJ1xuXG5cblxuXG4gICB1bmZvY3VzOiAtPlxuICAgICAgaWYgQCRlbC5oYXNDbGFzcyAnZm9jdXMnXG4gICAgICAgICBAJGVsLnJlbW92ZUNsYXNzICdmb2N1cydcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBjaGFuZ2VzIHRvIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgaW5zdHJ1bWVudFxuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gaW5zdHJ1bWVudE1vZGVsXG5cbiAgIG9uSW5zdHJ1bWVudENoYW5nZTogKGluc3RydW1lbnRNb2RlbCkgPT5cbiAgICAgIGluc3RydW1lbnQgPSBpbnN0cnVtZW50TW9kZWwuY2hhbmdlZC5jdXJyZW50SW5zdHJ1bWVudFxuXG4gICAgICBpZiBpbnN0cnVtZW50LmNpZCBpcyBAbW9kZWwuY2lkXG4gICAgICAgICBAc2VsZWN0KClcblxuICAgICAgZWxzZSBAZGVzZWxlY3QoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgbW9kZWwgY2hhbmdlIGV2ZW50c1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25NdXRlQ2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBtdXRlID0gbW9kZWwuY2hhbmdlZC5tdXRlXG5cbiAgICAgIGlmIG11dGVcbiAgICAgICAgIEAkZWwuYWRkQ2xhc3MgJ211dGUnXG5cbiAgICAgIGVsc2UgQCRlbC5yZW1vdmVDbGFzcyAnbXV0ZSdcblxuXG5cbiAgICMgSGFuZGxlciBmb3IgZm9jdXMgY2hhbmdlIGV2ZW50c1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25Gb2N1c0NoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgaWYgbW9kZWwuY2hhbmdlZC5mb2N1c1xuICAgICAgICAgIEBmb2N1cygpXG4gICAgICBlbHNlXG4gICAgICAgICAgQHVuZm9jdXMoKVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtdXRlIGJ1dHRvbiBjbGlja3NcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uTGFiZWxDbGljazogKGV2ZW50KSA9PlxuICAgICAgaWYgQG1vZGVsLmdldCgnbXV0ZScpIGlzbnQgdHJ1ZVxuICAgICAgICAgQG1vZGVsLnNldCAnZm9jdXMnLCAhIEBtb2RlbC5nZXQoJ2ZvY3VzJylcblxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgYnV0dG9uIGNsaWNrc1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25NdXRlQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICAgIEBtb2RlbC5zZXQgJ211dGUnLCAhIEBtb2RlbC5nZXQoJ211dGUnKVxuXG4gICAgICAjIGlmIEBtb2RlbC5nZXQgJ211dGUnXG4gICAgICAjICAgIEB1bm11dGUoKVxuXG4gICAgICAjIGVsc2UgQG11dGUoKVxuXG5cblxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblRyYWNrIiwiIyMjKlxuICogU2VxdWVuY2VyIHBhcmVudCB2aWV3IGZvciB0cmFjayBzZXF1ZW5jZXNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5QYXR0ZXJuVHJhY2sgPSByZXF1aXJlICcuL1BhdHRlcm5UcmFjay5jb2ZmZWUnXG5QdWJTdWIgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi91dGlscy9QdWJTdWInXG5BcHBFdmVudCAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuaGVscGVycyAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vaGVscGVycy9oYW5kbGViYXJzLWhlbHBlcnMnXG50ZW1wbGF0ZSAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zZXF1ZW5jZXItdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFNlcXVlbmNlciBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBuYW1lIG9mIHRoZSBjb250YWluZXIgY2xhc3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnc2VxdWVuY2VyLWNvbnRhaW5lcidcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgQW4gYXJyYXkgb2YgYWxsIHBhdHRlcm4gdHJhY2tzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHBhdHRlcm5UcmFja1ZpZXdzOiBudWxsXG5cblxuICAgIyBUaGUgc2V0SW50ZXJ2YWwgdGlja2VyXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGJwbUludGVydmFsOiBudWxsXG5cblxuICAgIyBUaGUgdGltZSBpbiB3aGljaCB0aGUgaW50ZXJ2YWwgZmlyZXNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgdXBkYXRlSW50ZXJ2YWxUaW1lOiAyMDBcblxuXG4gICAjIFRoZSBjdXJyZW50IGJlYXQgaWRcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgY3VyckJlYXRDZWxsSWQ6IC0xXG5cblxuICAgIyBUT0RPOiBVcGRhdGUgdGhpcyB0byBtYWtlIGl0IG1vcmUgZHluYW1pY1xuICAgIyBUaGUgbnVtYmVyIG9mIGJlYXQgY2VsbHNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgbnVtQ2VsbHM6IDdcblxuXG4gICAjIEdsb2JhbCBhcHBsaWNhdGlvbiBtb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBDb2xsZWN0aW9uIG9mIGluc3RydW1lbnRzXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cblxuICAgY29sbGVjdGlvbjogbnVsbFxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9XG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkdGhTdGVwcGVyID0gQCRlbC5maW5kICd0aC5zdGVwcGVyJ1xuICAgICAgQCRzZXF1ZW5jZXIgPSBAJGVsLmZpbmQgJy5zZXF1ZW5jZXInXG5cbiAgICAgIEByZW5kZXJUcmFja3MoKVxuICAgICAgQHBsYXkoKVxuXG4gICAgICBAXG5cblxuICAgIyBSZW1vdmVzIHRoZSB2aWV3IGZyb20gdGhlIERPTSBhbmQgY2FuY2Vsc1xuICAgIyB0aGUgdGlja2VyIGludGVydmFsXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIF8uZWFjaCBAcGF0dGVyblRyYWNrVmlld3MsICh0cmFjaykgPT5cbiAgICAgICAgIHRyYWNrLnJlbW92ZSgpXG5cbiAgICAgIEBwYXVzZSgpXG5cbiAgICAgIHN1cGVyKClcblxuXG5cbiAgICMgQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgaGFuZGxpbmcgaW5zdHJ1bWVudCBhbmQgcGxheWJhY2tcbiAgICMgY2hhbmdlcy4gIFVwZGF0ZXMgYWxsIG9mIHRoZSB2aWV3cyBhY2NvcmRpbmdseVxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsICAgQXBwRXZlbnQuQ0hBTkdFX0JQTSwgICAgIEBvbkJQTUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgICBBcHBFdmVudC5DSEFOR0VfUExBWUlORywgQG9uUGxheWluZ0NoYW5nZVxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgICBBcHBFdmVudC5DSEFOR0VfS0lULCAgICAgQG9uS2l0Q2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGNvbGxlY3Rpb24sIEFwcEV2ZW50LkNIQU5HRV9GT0NVUywgICBAb25Gb2N1c0NoYW5nZVxuXG4gICAgICBQdWJTdWIub24gQXBwRXZlbnQuSU1QT1JUX1RSQUNLLCBAaW1wb3J0VHJhY2tcbiAgICAgICNQdWJTdWIub24gQXBwRXZlbnQuRVhQT1JUX1RSQUNLLCBAb25FeHBvcnRUcmFja1xuXG5cblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBzdXBlcigpXG5cbiAgICAgIFB1YlN1Yi5vZmYgQXBwRXZlbnQuSU1QT1JUX1RSQUNLXG4gICAgICBQdWJTdWIub2ZmIEFwcEV2ZW50LkVYUE9SVF9UUkFDS1xuXG5cblxuICAgIyBSZW5kZXJzIG91dCBlYWNoIGluZGl2aWR1YWwgdHJhY2suXG4gICAjIFRPRE86IE5lZWQgdG8gdXBkYXRlIHNvIHRoYXQgYWxsIG9mIHRoZSBiZWF0IHNxdWFyZXMgYXJlbid0XG4gICAjIGJsb3duIGF3YXkgYnkgdGhlIHJlLXJlbmRlclxuXG4gICByZW5kZXJUcmFja3M6ID0+XG4gICAgICBAJGVsLmZpbmQoJy5wYXR0ZXJuLXRyYWNrJykucmVtb3ZlKClcblxuICAgICAgQHBhdHRlcm5UcmFja1ZpZXdzID0gW11cblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAobW9kZWwpID0+XG5cbiAgICAgICAgIHBhdHRlcm5UcmFjayA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IG1vZGVsLmdldCAncGF0dGVyblNxdWFyZXMnXG4gICAgICAgICAgICBtb2RlbDogbW9kZWxcblxuICAgICAgICAgQHBhdHRlcm5UcmFja1ZpZXdzLnB1c2ggcGF0dGVyblRyYWNrXG4gICAgICAgICBAJHNlcXVlbmNlci5hcHBlbmQgcGF0dGVyblRyYWNrLnJlbmRlcigpLmVsXG5cblxuXG5cbiAgICMgVXBkYXRlIHRoZSB0aWNrZXIgdGltZSwgYW5kIGFkdmFuY2VzIHRoZSBiZWF0XG5cbiAgIHVwZGF0ZVRpbWU6ID0+XG4gICAgICBAJHRoU3RlcHBlci5yZW1vdmVDbGFzcyAnc3RlcCdcbiAgICAgIEBjdXJyQmVhdENlbGxJZCA9IGlmIEBjdXJyQmVhdENlbGxJZCA8IEBudW1DZWxscyB0aGVuIEBjdXJyQmVhdENlbGxJZCArPSAxIGVsc2UgQGN1cnJCZWF0Q2VsbElkID0gMFxuICAgICAgJChAJHRoU3RlcHBlcltAY3VyckJlYXRDZWxsSWRdKS5hZGRDbGFzcyAnc3RlcCdcblxuICAgICAgQHBsYXlBdWRpbygpXG5cblxuXG5cbiAgICMgQ29udmVydHMgbWlsbGlzZWNvbmRzIHRvIEJQTVxuXG4gICBjb252ZXJ0QlBNOiAtPlxuICAgICAgcmV0dXJuIDIwMFxuXG5cblxuICAgIyBTdGFydCBwbGF5YmFjayBvZiBzZXF1ZW5jZXJcblxuICAgcGxheTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3BsYXlpbmcnLCB0cnVlXG5cblxuXG5cbiAgICMgUGF1c2VzIHNlcXVlbmNlciBwbGF5YmFja1xuXG4gICBwYXVzZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3BsYXlpbmcnLCBmYWxzZVxuXG5cblxuXG4gICAjIE11dGVzIHRoZSBzZXF1ZW5jZXJcblxuICAgbXV0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ211dGUnLCB0cnVlXG5cblxuXG5cbiAgICMgVW5tdXRlcyB0aGUgc2VxdWVuY2VyXG5cbiAgIHVubXV0ZTogLT5cbiAgICAgICBAYXBwTW9kZWwuc2V0ICdtdXRlJywgZmFsc2VcblxuXG5cblxuXG4gICAjIFBsYXlzIGF1ZGlvIG9mIGVhY2ggdHJhY2sgY3VycmVudGx5IGVuYWJsZWQgYW5kIG9uXG5cbiAgIHBsYXlBdWRpbzogLT5cbiAgICAgIGZvY3VzZWRJbnN0cnVtZW50ID0gIEBjb2xsZWN0aW9uLmZpbmRXaGVyZSB7IGZvY3VzOiB0cnVlIH1cblxuICAgICAgIyBDaGVjayBpZiB0aGVyZSdzIGEgZm9jdXNlZCB0cmFjayBhbmQgb25seVxuICAgICAgIyBwbGF5IGF1ZGlvIGZyb20gdGhlcmVcblxuICAgICAgaWYgZm9jdXNlZEluc3RydW1lbnRcbiAgICAgICAgIGlmIGZvY3VzZWRJbnN0cnVtZW50LmdldCgnbXV0ZScpIGlzbnQgdHJ1ZVxuICAgICAgICAgICAgZm9jdXNlZEluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpLmVhY2ggKHBhdHRlcm5TcXVhcmUsIGluZGV4KSA9PlxuICAgICAgICAgICAgICAgQHBsYXlQYXR0ZXJuU3F1YXJlQXVkaW8oIHBhdHRlcm5TcXVhcmUsIGluZGV4IClcblxuICAgICAgICAgcmV0dXJuXG5cblxuICAgICAgIyBJZiBub3RoaW5nIGlzIGZvY3VzZWQsIHRoZW4gY2hlY2sgYWdhaW5zdFxuICAgICAgIyB0aGUgZW50aXJlIG1hdHJpeFxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChpbnN0cnVtZW50KSA9PlxuICAgICAgICAgaWYgaW5zdHJ1bWVudC5nZXQoJ211dGUnKSBpc250IHRydWVcbiAgICAgICAgICAgIGluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpLmVhY2ggKHBhdHRlcm5TcXVhcmUsIGluZGV4KSA9PlxuICAgICAgICAgICAgICAgQHBsYXlQYXR0ZXJuU3F1YXJlQXVkaW8oIHBhdHRlcm5TcXVhcmUsIGluZGV4IClcblxuXG5cblxuICAgIyBQbGF5cyB0aGUgYXVkaW8gb24gYW4gaW5kaXZpZHVhbCBQYXR0ZXJTcXVhcmUgaWYgdGVtcG8gaW5kZXhcbiAgICMgaXMgdGhlIHNhbWUgYXMgdGhlIGluZGV4IHdpdGhpbiB0aGUgY29sbGVjdGlvblxuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmV9IHBhdHRlcm5TcXVhcmVcbiAgICMgQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG5cbiAgIHBsYXlQYXR0ZXJuU3F1YXJlQXVkaW86IChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgLT5cbiAgICAgIGlmIEBjdXJyQmVhdENlbGxJZCBpcyBpbmRleFxuICAgICAgICAgaWYgcGF0dGVyblNxdWFyZS5nZXQgJ2FjdGl2ZSdcbiAgICAgICAgICAgIHBhdHRlcm5TcXVhcmUuc2V0ICd0cmlnZ2VyJywgdHJ1ZVxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIEJQTSB0ZW1wbyBjaGFuZ2VzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uQlBNQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBjbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuICAgICAgQHVwZGF0ZUludGVydmFsVGltZSA9IG1vZGVsLmNoYW5nZWQuYnBtXG4gICAgICBAYnBtSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAdXBkYXRlVGltZSwgQHVwZGF0ZUludGVydmFsVGltZVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHBsYXliYWNrIGNoYW5nZXMuICBJZiBwYXVzZWQsIGl0IHN0b3BzIHBsYXliYWNrIGFuZFxuICAgIyBjbGVhcnMgdGhlIGludGVydmFsLiAgSWYgcGxheWluZywgaXQgcmVzZXRzIGl0XG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uUGxheWluZ0NoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgcGxheWluZyA9IG1vZGVsLmNoYW5nZWQucGxheWluZ1xuXG4gICAgICBpZiBwbGF5aW5nXG4gICAgICAgICBAYnBtSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAdXBkYXRlVGltZSwgQHVwZGF0ZUludGVydmFsVGltZVxuXG4gICAgICBlbHNlXG4gICAgICAgICBjbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuICAgICAgICAgQGJwbUludGVydmFsID0gbnVsbFxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgYW5kIHVubXV0ZSBjaGFuZ2VzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uTXV0ZUNoYW5nZTogKG1vZGVsKSA9PlxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2VzLCBhcyBzZXQgZnJvbSB0aGUgS2l0U2VsZWN0b3JcbiAgICMgQHBhcmFtIHtLaXRNb2RlbH0gbW9kZWxcblxuICAgb25LaXRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEBjb2xsZWN0aW9uID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJylcbiAgICAgIEByZW5kZXJUcmFja3MoKVxuXG4gICAgICBjb25zb2xlLmxvZyBAY29sbGVjdGlvbi50b0pTT04oKVxuXG4gICAgICAjIEV4cG9ydCBvbGQgcGF0dGVybiBzcXVhcmVzIHNvIHRoZSB1c2VycyBwYXR0ZXJuIGlzbid0IGJsb3duIGF3YXlcbiAgICAgICMgd2hlbiBraXQgY2hhbmdlcyBvY2N1clxuXG4gICAgICBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbiA9IG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMua2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpXG4gICAgICBvbGRQYXR0ZXJuU3F1YXJlcyA9IG9sZEluc3RydW1lbnRDb2xsZWN0aW9uLmV4cG9ydFBhdHRlcm5TcXVhcmVzKClcblxuXG4gICAgICAjIFVwZGF0ZSB0aGUgbmV3IGNvbGxlY3Rpb24gd2l0aCBvbGQgcGF0dGVybiBzcXVhcmUgZGF0YVxuICAgICAgIyBhbmQgdHJpZ2dlciBVSSB1cGRhdGVzIG9uIGVhY2ggc3F1YXJlXG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKGluc3RydW1lbnRNb2RlbCwgaW5kZXgpIC0+XG4gICAgICAgICBvbGRDb2xsZWN0aW9uID0gb2xkUGF0dGVyblNxdWFyZXNbaW5kZXhdXG4gICAgICAgICBuZXdDb2xsZWN0aW9uID0gaW5zdHJ1bWVudE1vZGVsLmdldCAncGF0dGVyblNxdWFyZXMnXG5cbiAgICAgICAgICMgVXBkYXRlIHRyYWNrIC8gaW5zdHJ1bWVudCBsZXZlbCBwcm9wZXJ0aWVzIGxpa2Ugdm9sdW1lIC8gbXV0ZSAvIGZvY3VzXG4gICAgICAgICBvbGRQcm9wcyA9IG9sZEluc3RydW1lbnRDb2xsZWN0aW9uLmF0KGluZGV4KVxuXG4gICAgICAgICB1bmxlc3Mgb2xkUHJvcHMgaXMgdW5kZWZpbmVkXG5cbiAgICAgICAgICAgIG9sZFByb3BzID0gb2xkUHJvcHMudG9KU09OKClcblxuICAgICAgICAgICAgaW5zdHJ1bWVudE1vZGVsLnNldFxuICAgICAgICAgICAgICAgdm9sdW1lOiBvbGRQcm9wcy52b2x1bWVcbiAgICAgICAgICAgICAgIGFjdGl2ZTogb2xkUHJvcHMuYWN0aXZlXG4gICAgICAgICAgICAgICBtdXRlOiAgIG51bGxcbiAgICAgICAgICAgICAgIGZvY3VzOiAgbnVsbFxuXG4gICAgICAgICAgICAjIFJlc2V0IHZpc3VhbGx5IHRpZWQgcHJvcHMgdG8gdHJpZ2dlciB1aSB1cGRhdGVcbiAgICAgICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICAgICAgIG11dGU6ICAgb2xkUHJvcHMubXV0ZVxuICAgICAgICAgICAgICAgZm9jdXM6ICBvbGRQcm9wcy5mb2N1c1xuXG4gICAgICAgICAjIENoZWNrIGZvciBpbmNvbnNpc3RhbmNpZXMgYmV0d2VlbiBudW1iZXIgb2YgaW5zdHJ1bWVudHNcbiAgICAgICAgIHVubGVzcyBvbGRDb2xsZWN0aW9uIGlzIHVuZGVmaW5lZFxuXG4gICAgICAgICAgICBuZXdDb2xsZWN0aW9uLmVhY2ggKHBhdHRlcm5TcXVhcmUsIGluZGV4KSAtPlxuICAgICAgICAgICAgICAgb2xkUGF0dGVyblNxdWFyZSA9IG9sZENvbGxlY3Rpb24uYXQgaW5kZXhcbiAgICAgICAgICAgICAgIHBhdHRlcm5TcXVhcmUuc2V0IG9sZFBhdHRlcm5TcXVhcmUudG9KU09OKClcblxuXG5cblxuICAgaW1wb3J0VHJhY2s6IChwYXJhbXMpID0+XG4gICAgICB7Y2FsbGJhY2ssIHBhdHRlcm5TcXVhcmVHcm91cHMsIGluc3RydW1lbnRzfSA9IHBhcmFtc1xuXG4gICAgICBAcmVuZGVyVHJhY2tzKClcblxuICAgICAgIyBJdGVyYXRlIG92ZXIgZWFjaCB2aWV3IGFuZCBzZXQgc2F2ZWQgcHJvcGVydGllc1xuICAgICAgXy5lYWNoIEBwYXR0ZXJuVHJhY2tWaWV3cywgKHBhdHRlcm5UcmFja1ZpZXcsIGl0ZXJhdG9yKSAtPlxuICAgICAgICAgaW5zdHJ1bWVudE1vZGVsID0gcGF0dGVyblRyYWNrVmlldy5tb2RlbFxuXG4gICAgICAgICBpbnN0cnVtZW50TW9kZWwuc2V0XG4gICAgICAgICAgICBtdXRlOiAgbnVsbFxuICAgICAgICAgICAgZm9jdXM6IG51bGxcblxuICAgICAgICAgIyBVcGRhdGUgcHJvcHMgdG8gdHJpZ2dlciBVSSB1cGRhdGVzXG4gICAgICAgICBpbnN0cnVtZW50TW9kZWwuc2V0XG4gICAgICAgICAgICBtdXRlOiAgaW5zdHJ1bWVudHNbaXRlcmF0b3JdLm11dGVcbiAgICAgICAgICAgIGZvY3VzOiBpbnN0cnVtZW50c1tpdGVyYXRvcl0uZm9jdXNcblxuICAgICAgICAgIyBVcGRhdGUgZWFjaCBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlIHdpdGggc2V0dGluZ3NcbiAgICAgICAgIHBhdHRlcm5UcmFja1ZpZXcuY29sbGVjdGlvbi5lYWNoIChwYXR0ZXJuTW9kZWwsIGluZGV4KSAtPlxuICAgICAgICAgICAgcGF0dGVybk1vZGVsLnNldCBwYXR0ZXJuU3F1YXJlR3JvdXBzW2l0ZXJhdG9yXVtpbmRleF1cblxuICAgICAgY2FsbGJhY2soKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGZvY3VzIGNoYW5nZSBldmVudHMuICBJdGVyYXRlcyBvdmVyIGFsbCBvZiB0aGUgbW9kZWxzIHdpdGhpblxuICAgIyB0aGUgSW5zdHJ1bWVudENvbGxlY3Rpb24gYW5kIHRvZ2dsZXMgdGhlaXIgZm9jdXMgdG8gb2ZmIGlmIHRoZSBjaGFuZ2VkXG4gICAjIG1vZGVsJ3MgZm9jdXMgaXMgc2V0IHRvIHRydWUuXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbkZvY3VzQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChpbnN0cnVtZW50TW9kZWwpID0+XG4gICAgICAgICBpZiBtb2RlbC5jaGFuZ2VkLmZvY3VzIGlzIHRydWVcbiAgICAgICAgICAgIGlmIG1vZGVsLmNpZCBpc250IGluc3RydW1lbnRNb2RlbC5jaWRcbiAgICAgICAgICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXQgJ2ZvY3VzJywgZmFsc2VcblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZXF1ZW5jZXIiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIjtcblxuXG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cblxuICBidWZmZXIgKz0gXCI8dGQgY2xhc3M9J2xhYmVsLWluc3RydW1lbnQnPlxcblx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXG48L3RkPlxcbjx0ZCBjbGFzcz0nYnRuLW11dGUnPlxcblx0bXV0ZVxcbjwvdGQ+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc3RhY2syLCBvcHRpb25zLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblx0XHRcdDx0aCBjbGFzcz0nc3RlcHBlcic+PC90aD5cXG5cdFx0XCI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8dGFibGUgY2xhc3M9J3NlcXVlbmNlcic+XFxuXHQ8dHI+XFxuXHRcdDx0aD48L3RoPlxcblx0XHQ8dGg+PC90aD5cXG5cXG5cdFx0XCI7XG4gIG9wdGlvbnMgPSB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX07XG4gIHN0YWNrMiA9ICgoc3RhY2sxID0gaGVscGVycy5yZXBlYXQgfHwgZGVwdGgwLnJlcGVhdCksc3RhY2sxID8gc3RhY2sxLmNhbGwoZGVwdGgwLCA4LCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwicmVwZWF0XCIsIDgsIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC90cj5cXG5cXG48L3RhYmxlPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWRlY3JlYXNlJz5ERUNSRUFTRTwvYnV0dG9uPlxcbjxzcGFuIGNsYXNzPSdsYWJlbC1icG0nPjA8L3NwYW4+XFxuPGJ1dHRvbiBjbGFzcz0nYnRuLWluY3JlYXNlJz5JTkNSRUFTRTwvYnV0dG9uPlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWxlZnQnPkxFRlQ8L2J1dHRvbj5cXG48c3BhbiBjbGFzcz0nbGFiZWwta2l0Jz5EUlVNIEtJVDwvc3Bhbj5cXG48YnV0dG9uIGNsYXNzPSdidG4tcmlnaHQnPlJJR0hUPC9idXR0b24+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdidG4tZXhwb3J0Jz5FWFBPUlQ8L2Rpdj5cXG48ZGl2IGNsYXNzPSdidG4tc2hhcmUnPlNIQVJFPC9kaXY+XFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLWtpdC1zZWxlY3Rvcic+XFxuXHQ8ZGl2IGNsYXNzPSdraXQtc2VsZWN0b3InPjwvZGl2PlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci12aXN1YWxpemF0aW9uJz5WaXN1YWxpemF0aW9uPC9kaXY+XFxuXFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLXNlcXVlbmNlcic+XFxuXFxuXHQ8ZGl2IGNsYXNzPSdpbnN0cnVtZW50LXNlbGVjdG9yJz5JbnN0cnVtZW50IFNlbGVjdG9yPC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPSdzZXF1ZW5jZXInPlNlcXVlbmNlcjwvZGl2Plxcblx0PGRpdiBjbGFzcz0nYnBtJz5CUE08L2Rpdj5cXG5cXG48L2Rpdj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuUHViU3ViICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9QdWJTdWInXG5QdWJFdmVudCA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvbGFuZGluZy10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgTGFuZGluZ1ZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5zdGFydC1idG4nOiAnb25TdGFydEJ0bkNsaWNrJ1xuXG5cbiAgIG9uU3RhcnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgUHViU3ViLnRyaWdnZXIgUHViRXZlbnQuUk9VVEUsXG4gICAgICAgICByb3V0ZTogJ2NyZWF0ZSdcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZGluZ1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxzcGFuIGNsYXNzPSdzdGFydC1idG4nPkNSRUFURTwvc3Bhbj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBTaGFyZSB0aGUgdXNlciBjcmVhdGVkIGJlYXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2hhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFNoYXJlVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlVmlldyIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGEgaHJlZj0nLyMnPk5FVzwvYT5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVzdHMtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFRlc3RzVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0c1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxoMT5Db21wb25lbnQgVmlld2VyPC9oMT5cXG5cXG48YnIgLz5cXG48cD5cXG5cdE1ha2Ugc3VyZSB0aGF0IDxiPmh0dHBzdGVyIChucG0gaW5zdGFsbCAtZyBodHRwc3Rlcik8L2I+IGlzIHJ1bm5pbmcgaW4gdGhlIDxiPnNvdXJjZTwvYj4gcGF0aCA8YnIvPlxcblx0PGEgaHJlZj1cXFwiaHR0cDovL2xvY2FsaG9zdDozMzMzL3Rlc3QvaHRtbC9cXFwiPk1vY2hhIFRlc3QgUnVubmVyPC9hPlxcbjwvcD5cXG5cXG48YnIgLz5cXG48dWw+XFxuXHQ8bGk+PGEgaHJlZj0nI2xhbmRpbmcnPkxhbmRpbmc8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPScjY3JlYXRlJz5DcmVhdGU8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPScjc2hhcmUnPlNoYXJlPC9hPjwvbGk+XFxuXHQ8bGk+PC9saT5cXG5cdDxsaT48Yj5JbmRpdmlkdWFsIGNvbXBvbmVudHM8L2I+PC9saT5cXG5cdDxsaT48YSBocmVmPScja2l0LXNlbGVjdGlvbic+S2l0IFNlbGVjdGlvbjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNicG0taW5kaWNhdG9yXFxcIj5CUE0gSW5kaWNhdG9yPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2luc3RydW1lbnQtc2VsZWN0b3JcXFwiPkluc3RydW1lbnQgU2VsZWN0b3I8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjcGF0dGVybi1zcXVhcmVcXFwiPlBhdHRlcm4gU3F1YXJlPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI3BhdHRlcm4tdHJhY2tcXFwiPlBhdHRlcm4gVHJhY2s8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjc2VxdWVuY2VyXFxcIj5TZXF1ZW5jZXI8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjZnVsbC1zZXF1ZW5jZXJcXFwiPkZ1bGwgU2VxdWVuY2VyPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI3BhZC1zcXVhcmVcXFwiPlBhZCBTcXVhcmU8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjbGl2ZS1wYWRcXFwiPkxpdmVQYWQ8L2E+PC9saT5cXG48L3VsPlwiO1xuICB9KSJdfQ==

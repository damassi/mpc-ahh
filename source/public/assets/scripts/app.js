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


},{"./models/AppModel.coffee":12,"./routers/AppRouter.coffee":22,"./supers/View.coffee":25,"./views/create/CreateView.coffee":28,"./views/landing/LandingView.coffee":50,"./views/share/ShareView.coffee":52}],7:[function(require,module,exports){

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


},{"./AppController.coffee":6,"./config/AppConfig.coffee":7,"./helpers/handlebars-helpers":10,"./models/kits/KitCollection.coffee":13,"./utils/Touch":27}],12:[function(require,module,exports){

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
    'view': null,
    'playing': null,
    'mute': null,
    'kitModel': null,
    'songModel': null,
    'bpm': AppConfig.BPM
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


},{"../config/AppConfig.coffee":7,"../supers/Model.coffee":24}],13:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../../supers/Collection.coffee":23,"./KitModel.coffee":14}],14:[function(require,module,exports){

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


},{"../../supers/Model.coffee":24,"../sequencer/InstrumentCollection.coffee":18}],15:[function(require,module,exports){

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


},{"../../supers/Model.coffee":24}],16:[function(require,module,exports){

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


},{"../../supers/Collection.coffee":23,"../sequencer/InstrumentModel.coffee":19}],17:[function(require,module,exports){

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


},{"../../supers/Model.coffee":24}],18:[function(require,module,exports){

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


},{"../../supers/Collection.coffee":23,"./InstrumentModel.coffee":19}],19:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../../supers/Model.coffee":24}],20:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../../events/AppEvent.coffee":8,"../../supers/Collection.coffee":23,"../../utils/PubSub":26,"../sequencer/InstrumentModel.coffee":19,"./PatternSquareModel.coffee":21}],21:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../../events/AppEvent.coffee":8,"../../supers/Model.coffee":24}],22:[function(require,module,exports){

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


},{"../config/AppConfig.coffee":7,"../events/PubEvent.coffee":9,"../models/kits/KitCollection.coffee":13,"../models/kits/KitModel.coffee":14,"../models/pad/LivePadModel.coffee":15,"../models/pad/PadSquareCollection.coffee":16,"../models/pad/PadSquareModel.coffee":17,"../models/sequencer/PatternSquareCollection.coffee":20,"../models/sequencer/PatternSquareModel.coffee":21,"../supers/View.coffee":25,"../utils/PubSub":26,"../views/create/components/BPMIndicator.coffee":29,"../views/create/components/KitSelector.coffee":30,"../views/create/components/instruments/InstrumentSelectorPanel.coffee":32,"../views/create/components/pad/LivePad.coffee":35,"../views/create/components/pad/PadSquare.coffee":36,"../views/create/components/sequencer/PatternSquare.coffee":41,"../views/create/components/sequencer/PatternTrack.coffee":42,"../views/create/components/sequencer/Sequencer.coffee":43,"../views/tests/TestsView.coffee":54}],23:[function(require,module,exports){

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


},{}],24:[function(require,module,exports){

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


},{}],25:[function(require,module,exports){

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


},{}],26:[function(require,module,exports){
/**
 * @module     PubSub
 * @desc       Global PubSub object for dispatch and delegation
 */

'use strict'

var PubSub = {}

_.extend( PubSub, Backbone.Events )

module.exports = PubSub
},{}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){

/**
 * Create view which the user can build beats within
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppEvent, BPMIndicator, CreateView, InstrumentSelectorPanel, KitSelector, PubSub, Sequencer, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PubSub = require('../../utils/PubSub');

View = require('../../supers/View.coffee');

AppEvent = require('../../events/AppEvent.coffee');

KitSelector = require('../../views/create/components/KitSelector.coffee');

InstrumentSelectorPanel = require('../../views/create/components/instruments/InstrumentSelectorPanel.coffee');

Sequencer = require('../../views/create/components/sequencer/Sequencer.coffee');

BPMIndicator = require('../../views/create/components/BPMIndicator.coffee');

template = require('./templates/create-template.hbs');

CreateView = (function(_super) {
  __extends(CreateView, _super);

  function CreateView() {
    this.onExportTrack = __bind(this.onExportTrack, this);
    this.onShareBtnClick = __bind(this.onShareBtnClick, this);
    this.onExportBtnClick = __bind(this.onExportBtnClick, this);
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

  CreateView.prototype.onExportBtnClick = function(event) {
    return PubSub.trigger(AppEvent.EXPORT_TRACK, (function(_this) {
      return function(params) {
        return _this.instruments = params.instruments, _this.patternSquareGroups = params.patternSquareGroups, params;
      };
    })(this));
  };

  CreateView.prototype.onShareBtnClick = function(event) {
    return PubSub.trigger(AppEvent.IMPORT_TRACK, {
      instruments: this.instruments,
      patternSquareGroups: this.patternSquareGroups,
      callback: function(response) {
        return console.log('done importing');
      }
    });
  };

  CreateView.prototype.onExportTrack = function(callback) {
    var instruments, patternSquareGroups, patternSquares;
    patternSquareGroups = [];
    patternSquares = [];
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
      patternSquareGroups: patternSquareGroups,
      instruments: instruments
    });
  };

  return CreateView;

})(View);

module.exports = CreateView;


},{"../../events/AppEvent.coffee":8,"../../supers/View.coffee":25,"../../utils/PubSub":26,"../../views/create/components/BPMIndicator.coffee":29,"../../views/create/components/KitSelector.coffee":30,"../../views/create/components/instruments/InstrumentSelectorPanel.coffee":32,"../../views/create/components/sequencer/Sequencer.coffee":43,"./templates/create-template.hbs":49}],29:[function(require,module,exports){

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


},{"../../../config/AppConfig.coffee":7,"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":25,"./templates/bpm-template.hbs":47}],30:[function(require,module,exports){

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


},{"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":25,"./templates/kit-selection-template.hbs":48}],31:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":25,"./templates/instrument-template.hbs":34}],32:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":25,"./Instrument.coffee":31,"./templates/instrument-panel-template.hbs":33}],33:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='container-instruments'>\n\n</div>";
  })
},{"handleify":5}],34:[function(require,module,exports){
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
},{"handleify":5}],35:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../models/pad/PadSquareCollection.coffee":16,"../../../../models/pad/PadSquareModel.coffee":17,"../../../../supers/View.coffee":25,"./PadSquare.coffee":36,"./templates/instruments-template.hbs":37,"./templates/live-pad-template.hbs":38,"./templates/pads-template.hbs":40}],36:[function(require,module,exports){

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


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":25,"./templates/pad-square-template.hbs":39}],37:[function(require,module,exports){
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
},{"handleify":5}],38:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<table class='container-pads'>\n\n</table>\n\n<div class='container-instruments'>\n\n</div>";
  })
},{"handleify":5}],39:[function(require,module,exports){
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
},{"handleify":5}],40:[function(require,module,exports){
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
},{"handleify":5}],41:[function(require,module,exports){

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


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":25,"./templates/pattern-square-template.hbs":44}],42:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../models/sequencer/PatternSquareCollection.coffee":20,"../../../../models/sequencer/PatternSquareModel.coffee":21,"../../../../supers/View.coffee":25,"./PatternSquare.coffee":41,"./templates/pattern-track-template.hbs":45}],43:[function(require,module,exports){

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

  Sequencer.prototype.onExportTrack = function() {
    var callback, patternSquares;
    callback = params.callback;
    patternSquares = [];
    return console.log('firing export!!');
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


},{"../../../../events/AppEvent.coffee":8,"../../../../helpers/handlebars-helpers":10,"../../../../supers/View.coffee":25,"../../../../utils/PubSub":26,"./PatternTrack.coffee":42,"./templates/sequencer-template.hbs":46}],44:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })
},{"handleify":5}],45:[function(require,module,exports){
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
},{"handleify":5}],46:[function(require,module,exports){
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
},{"handleify":5}],47:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-decrease'>DECREASE</button>\n<span class='label-bpm'>0</span>\n<button class='btn-increase'>INCREASE</button>";
  })
},{"handleify":5}],48:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-left'>LEFT</button>\n<span class='label-kit'>DRUM KIT</span>\n<button class='btn-right'>RIGHT</button>";
  })
},{"handleify":5}],49:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='btn-export'>EXPORT</div>\n<div class='btn-share'>SHARE</div>\n<div class='container-kit-selector'>\n	<div class='kit-selector'></div>\n</div>\n<div class='container-visualization'>Visualization</div>\n\n<div class='container-sequencer'>\n\n	<div class='instrument-selector'>Instrument Selector</div>\n	<div class='sequencer'>Sequencer</div>\n	<div class='bpm'>BPM</div>\n\n</div>";
  })
},{"handleify":5}],50:[function(require,module,exports){

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


},{"../../events/PubEvent.coffee":9,"../../supers/View.coffee":25,"../../utils/PubSub":26,"./templates/landing-template.hbs":51}],51:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<span class='start-btn'>CREATE</span>";
  })
},{"handleify":5}],52:[function(require,module,exports){

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


},{"../../supers/View.coffee":25,"./templates/share-template.hbs":53}],53:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<a href='/#'>NEW</a>";
  })
},{"handleify":5}],54:[function(require,module,exports){

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


},{"../../supers/View.coffee":25,"./tests-template.hbs":55}],55:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h1>Component Viewer</h1>\n\n<br />\n<p>\n	Make sure that <b>httpster</b> is running in the <b>source</b> route (npm install -g httpster) <br/>\n	<a href=\"http://localhost:3333/test/html/\">Mocha Test Runner</a>\n</p>\n\n<br />\n<ul>\n	<li><a href='#kit-selection'>Kit Selection</a></li>\n	<li><a href=\"#bpm-indicator\">BPM Indicator</a></li>\n	<li><a href=\"#instrument-selector\">Instrument Selector</a></li>\n	<li><a href=\"#pattern-square\">Pattern Square</a></li>\n	<li><a href=\"#pattern-track\">Pattern Track</a></li>\n	<li><a href=\"#sequencer\">Sequencer</a></li>\n	<li><a href=\"#full-sequencer\">Full Sequencer</a></li>\n	<li><a href=\"#pad-square\">Pad Square</a></li>\n	<li><a href=\"#live-pad\">LivePad</a></li>\n</ul>";
  })
},{"handleify":5}]},{},[11])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2RpZ2l0cy9pbmRleC5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L3J1bnRpbWUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2luaXRpYWxpemUuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9MaXZlUGFkTW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlTW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3JvdXRlcnMvQXBwUm91dGVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3N1cGVycy9Db2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3N1cGVycy9Nb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy91dGlscy9QdWJTdWIuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy91dGlscy9Ub3VjaC5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL3RlbXBsYXRlcy9pbnN0cnVtZW50LXBhbmVsLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL3RlbXBsYXRlcy9pbnN0cnVtZW50LXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9MaXZlUGFkLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL3RlbXBsYXRlcy9pbnN0cnVtZW50cy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvdGVtcGxhdGVzL2xpdmUtcGFkLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC90ZW1wbGF0ZXMvcGFkLXNxdWFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvdGVtcGxhdGVzL3BhZHMtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci90ZW1wbGF0ZXMvcGF0dGVybi1zcXVhcmUtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9wYXR0ZXJuLXRyYWNrLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci90ZW1wbGF0ZXMvc2VxdWVuY2VyLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3RlbXBsYXRlcy9icG0tdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvdGVtcGxhdGVzL2tpdC1zZWxlY3Rpb24tdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL3RlbXBsYXRlcy9jcmVhdGUtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL3RlbXBsYXRlcy9sYW5kaW5nLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9zaGFyZS90ZW1wbGF0ZXMvc2hhcmUtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvdGVzdHMvVGVzdHNWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3Rlc3RzL3Rlc3RzLXRlbXBsYXRlLmhicyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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Q0FBUSxnQ0FBUixDQVJYLENBQUE7O0FBQUE7QUFhRyw4QkFBQSxDQUFBOzs7O0dBQUE7O0FBQUEsc0JBQUEsUUFBQSxHQUFVLFFBQVYsQ0FBQTs7bUJBQUE7O0dBRnFCLEtBWHhCLENBQUE7O0FBQUEsTUFpQk0sQ0FBQyxPQUFQLEdBQWlCLFNBakJqQixDQUFBOzs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSx5QkFBQTtFQUFBO2lTQUFBOztBQUFBLElBT0EsR0FBVyxPQUFBLENBQVEsMEJBQVIsQ0FQWCxDQUFBOztBQUFBLFFBUUEsR0FBVyxPQUFBLENBQVEsc0JBQVIsQ0FSWCxDQUFBOztBQUFBO0FBYUcsOEJBQUEsQ0FBQTs7OztHQUFBOztBQUFBLHNCQUFBLFFBQUEsR0FBVSxRQUFWLENBQUE7O21CQUFBOztHQUZxQixLQVh4QixDQUFBOztBQUFBLE1BZ0JNLENBQUMsT0FBUCxHQUFpQixTQWhCakIsQ0FBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogZGlnaXRzXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMgSm9uIFNjaGxpbmtlcnRcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQYWQgbnVtYmVycyB3aXRoIHplcm9zLlxuICogQXV0b21hdGljYWxseSBwYWQgdGhlIG51bWJlciBvZiBkaWdpdHMgYmFzZWQgb24gdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXksXG4gKiBvciBleHBsaWNpdGx5IHBhc3MgaW4gdGhlIG51bWJlciBvZiBkaWdpdHMgdG8gdXNlLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gbnVtICBUaGUgbnVtYmVyIHRvIHBhZC5cbiAqIEBwYXJhbSAge09iamVjdH0gb3B0cyBPcHRpb25zIG9iamVjdCB3aXRoIGBkaWdpdHNgIGFuZCBgYXV0b2AgcHJvcGVydGllcy5cbiAqICAgIHtcbiAqICAgICAgYXV0bzogYXJyYXkubGVuZ3RoIC8vIHBhc3MgaW4gdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXlcbiAqICAgICAgZGlnaXRzOiA0ICAgICAgICAgIC8vIG9yIHBhc3MgaW4gdGhlIG51bWJlciBvZiBkaWdpdHMgdG8gdXNlXG4gKiAgICB9XG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgVGhlIHBhZGRlZCBudW1iZXIgd2l0aCB6ZXJvcyBwcmVwZW5kZWRcbiAqXG4gKiBAZXhhbXBsZXM6XG4gKiAgMSAgICAgID0+IDAwMDAwMVxuICogIDEwICAgICA9PiAwMDAwMTBcbiAqICAxMDAgICAgPT4gMDAwMTAwXG4gKiAgMTAwMCAgID0+IDAwMTAwMFxuICogIDEwMDAwICA9PiAwMTAwMDBcbiAqICAxMDAwMDAgPT4gMTAwMDAwXG4gKi9cblxuZXhwb3J0cy5wYWQgPSBmdW5jdGlvbiAobnVtLCBvcHRzKSB7XG4gIHZhciBkaWdpdHMgPSBvcHRzLmRpZ2l0cyB8fCAzO1xuICBpZihvcHRzLmF1dG8gJiYgdHlwZW9mIG9wdHMuYXV0byA9PT0gJ251bWJlcicpIHtcbiAgICBkaWdpdHMgPSBTdHJpbmcob3B0cy5hdXRvKS5sZW5ndGg7XG4gIH1cbiAgdmFyIGxlbkRpZmYgPSBkaWdpdHMgLSBTdHJpbmcobnVtKS5sZW5ndGg7XG4gIHZhciBwYWRkaW5nID0gJyc7XG4gIGlmIChsZW5EaWZmID4gMCkge1xuICAgIHdoaWxlIChsZW5EaWZmLS0pIHtcbiAgICAgIHBhZGRpbmcgKz0gJzAnO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFkZGluZyArIG51bTtcbn07XG5cbi8qKlxuICogU3RyaXAgbGVhZGluZyBkaWdpdHMgZnJvbSBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyBmcm9tIHdoaWNoIHRvIHN0cmlwIGRpZ2l0c1xuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICovXG5cbmV4cG9ydHMuc3RyaXBsZWZ0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxcZCtcXC0/L2csICcnKTtcbn07XG5cbi8qKlxuICogU3RyaXAgdHJhaWxpbmcgZGlnaXRzIGZyb20gYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgZnJvbSB3aGljaCB0byBzdHJpcCBkaWdpdHNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqL1xuXG5leHBvcnRzLnN0cmlwcmlnaHQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXC0/XFxkKyQvZywgJycpO1xufTtcblxuLyoqXG4gKiBDb3VudCBkaWdpdHMgb24gdGhlIGxlZnQgc2lkZSBvZiBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB3aXRoIGRpZ2l0cyB0byBjb3VudFxuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICogQGV4YW1wbGVcbiAqICBcIjAwMS1mb28ubWRcIiA9PiAzXG4gKi9cblxuZXhwb3J0cy5jb3VudGxlZnQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIFN0cmluZyhzdHIubWF0Y2goL15cXGQrL2cpKS5sZW5ndGg7XG59O1xuXG4vKipcbiAqIENvdW50IGRpZ2l0cyBvbiB0aGUgcmlnaHQgc2lkZSBvZiBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB3aXRoIGRpZ2l0cyB0byBjb3VudFxuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICogQGV4YW1wbGVcbiAqICBcIjAwMS1mb28ubWRcIiA9PiAzXG4gKi9cblxuZXhwb3J0cy5jb3VudHJpZ2h0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyLm1hdGNoKC9cXGQrJC9nKSkubGVuZ3RoO1xufTsiLCIvKmpzaGludCBlcW51bGw6IHRydWUgKi9cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG5cbnZhciBIYW5kbGViYXJzID0ge307XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbkhhbmRsZWJhcnMuVkVSU0lPTiA9IFwiMS4wLjBcIjtcbkhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT04gPSA0O1xuXG5IYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPj0gMS4wLjAnXG59O1xuXG5IYW5kbGViYXJzLmhlbHBlcnMgID0ge307XG5IYW5kbGViYXJzLnBhcnRpYWxzID0ge307XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgZnVuY3Rpb25UeXBlID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgPSBmdW5jdGlvbihuYW1lLCBmbiwgaW52ZXJzZSkge1xuICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgIGlmIChpbnZlcnNlIHx8IGZuKSB7IHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbnZlcnNlKSB7IGZuLm5vdCA9IGludmVyc2U7IH1cbiAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgPSBmdW5jdGlvbihuYW1lLCBzdHIpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLnBhcnRpYWxzLCAgbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHN0cjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGFyZykge1xuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGhlbHBlcjogJ1wiICsgYXJnICsgXCInXCIpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYmxvY2tIZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSB8fCBmdW5jdGlvbigpIHt9LCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuXG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbih0aGlzKTtcbiAgfSBlbHNlIGlmKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgaWYoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZm4oY29udGV4dCk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLksgPSBmdW5jdGlvbigpIHt9O1xuXG5IYW5kbGViYXJzLmNyZWF0ZUZyYW1lID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbihvYmplY3QpIHtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG9iamVjdDtcbiAgdmFyIG9iaiA9IG5ldyBIYW5kbGViYXJzLksoKTtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG51bGw7XG4gIHJldHVybiBvYmo7XG59O1xuXG5IYW5kbGViYXJzLmxvZ2dlciA9IHtcbiAgREVCVUc6IDAsIElORk86IDEsIFdBUk46IDIsIEVSUk9SOiAzLCBsZXZlbDogMyxcblxuICBtZXRob2RNYXA6IHswOiAnZGVidWcnLCAxOiAnaW5mbycsIDI6ICd3YXJuJywgMzogJ2Vycm9yJ30sXG5cbiAgLy8gY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgb2JqKSB7XG4gICAgaWYgKEhhbmRsZWJhcnMubG9nZ2VyLmxldmVsIDw9IGxldmVsKSB7XG4gICAgICB2YXIgbWV0aG9kID0gSGFuZGxlYmFycy5sb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5IYW5kbGViYXJzLmxvZyA9IGZ1bmN0aW9uKGxldmVsLCBvYmopIHsgSGFuZGxlYmFycy5sb2dnZXIubG9nKGxldmVsLCBvYmopOyB9O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdlYWNoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgZm4gPSBvcHRpb25zLmZuLCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlO1xuICB2YXIgaSA9IDAsIHJldCA9IFwiXCIsIGRhdGE7XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICBkYXRhID0gSGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICB9XG5cbiAgaWYoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICBpZihjb250ZXh0IGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgZm9yKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGk8ajsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhKSB7IGRhdGEuaW5kZXggPSBpOyB9XG4gICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbaV0sIHsgZGF0YTogZGF0YSB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICBpZihjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBpZihkYXRhKSB7IGRhdGEua2V5ID0ga2V5OyB9XG4gICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtrZXldLCB7ZGF0YTogZGF0YX0pO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmKGkgPT09IDApe1xuICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbmRpdGlvbmFsKTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKCFjb25kaXRpb25hbCB8fCBIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29uZGl0aW9uYWwpKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHJldHVybiBIYW5kbGViYXJzLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm59KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYgKCFIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICBIYW5kbGViYXJzLmxvZyhsZXZlbCwgY29udGV4dCk7XG59KTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZNID0ge1xuICB0ZW1wbGF0ZTogZnVuY3Rpb24odGVtcGxhdGVTcGVjKSB7XG4gICAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgICB2YXIgY29udGFpbmVyID0ge1xuICAgICAgZXNjYXBlRXhwcmVzc2lvbjogSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgICAgaW52b2tlUGFydGlhbDogSGFuZGxlYmFycy5WTS5pbnZva2VQYXJ0aWFsLFxuICAgICAgcHJvZ3JhbXM6IFtdLFxuICAgICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXTtcbiAgICAgICAgaWYoZGF0YSkge1xuICAgICAgICAgIHByb2dyYW1XcmFwcGVyID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuLCBkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSBIYW5kbGViYXJzLlZNLnByb2dyYW0oaSwgZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICAgIH0sXG4gICAgICBtZXJnZTogZnVuY3Rpb24ocGFyYW0sIGNvbW1vbikge1xuICAgICAgICB2YXIgcmV0ID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICAgIGlmIChwYXJhbSAmJiBjb21tb24pIHtcbiAgICAgICAgICByZXQgPSB7fTtcbiAgICAgICAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZChyZXQsIGNvbW1vbik7XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBwYXJhbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0sXG4gICAgICBwcm9ncmFtV2l0aERlcHRoOiBIYW5kbGViYXJzLlZNLnByb2dyYW1XaXRoRGVwdGgsXG4gICAgICBub29wOiBIYW5kbGViYXJzLlZNLm5vb3AsXG4gICAgICBjb21waWxlckluZm86IG51bGxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlU3BlYy5jYWxsKGNvbnRhaW5lciwgSGFuZGxlYmFycywgY29udGV4dCwgb3B0aW9ucy5oZWxwZXJzLCBvcHRpb25zLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEpO1xuXG4gICAgICB2YXIgY29tcGlsZXJJbmZvID0gY29udGFpbmVyLmNvbXBpbGVySW5mbyB8fCBbXSxcbiAgICAgICAgICBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICAgICAgY3VycmVudFJldmlzaW9uID0gSGFuZGxlYmFycy5DT01QSUxFUl9SRVZJU0lPTjtcblxuICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IEhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrcnVudGltZVZlcnNpb25zK1wiKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKFwiK2NvbXBpbGVyVmVyc2lvbnMrXCIpLlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgICAgIHRocm93IFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJJbmZvWzFdK1wiKS5cIjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH0sXG5cbiAgcHJvZ3JhbVdpdGhEZXB0aDogZnVuY3Rpb24oaSwgZm4sIGRhdGEgLyosICRkZXB0aCAqLykge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcblxuICAgIHZhciBwcm9ncmFtID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBbY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGFdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgICBwcm9ncmFtLnByb2dyYW0gPSBpO1xuICAgIHByb2dyYW0uZGVwdGggPSBhcmdzLmxlbmd0aDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGEpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gMDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgbm9vcDogZnVuY3Rpb24oKSB7IHJldHVybiBcIlwiOyB9LFxuICBpbnZva2VQYXJ0aWFsOiBmdW5jdGlvbihwYXJ0aWFsLCBuYW1lLCBjb250ZXh0LCBoZWxwZXJzLCBwYXJ0aWFscywgZGF0YSkge1xuICAgIHZhciBvcHRpb25zID0geyBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcblxuICAgIGlmKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuICAgIH0gZWxzZSBpZihwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAoIUhhbmRsZWJhcnMuY29tcGlsZSkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydGlhbHNbbmFtZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUocGFydGlhbCwge2RhdGE6IGRhdGEgIT09IHVuZGVmaW5lZH0pO1xuICAgICAgcmV0dXJuIHBhcnRpYWxzW25hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy50ZW1wbGF0ZSA9IEhhbmRsZWJhcnMuVk0udGVtcGxhdGU7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcblxufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbkhhbmRsZWJhcnMuRXhjZXB0aW9uID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG59O1xuSGFuZGxlYmFycy5FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbi8vIEJ1aWxkIG91dCBvdXIgYmFzaWMgU2FmZVN0cmluZyB0eXBlXG5IYW5kbGViYXJzLlNhZmVTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59O1xuSGFuZGxlYmFycy5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJpbmcudG9TdHJpbmcoKTtcbn07XG5cbnZhciBlc2NhcGUgPSB7XG4gIFwiJlwiOiBcIiZhbXA7XCIsXG4gIFwiPFwiOiBcIiZsdDtcIixcbiAgXCI+XCI6IFwiJmd0O1wiLFxuICAnXCInOiBcIiZxdW90O1wiLFxuICBcIidcIjogXCImI3gyNztcIixcbiAgXCJgXCI6IFwiJiN4NjA7XCJcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZztcbnZhciBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG52YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl0gfHwgXCImYW1wO1wiO1xufTtcblxuSGFuZGxlYmFycy5VdGlscyA9IHtcbiAgZXh0ZW5kOiBmdW5jdGlvbihvYmosIHZhbHVlKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICAgIGlmKHZhbHVlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWx1ZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBlc2NhcGVFeHByZXNzaW9uOiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyBpbnN0YW5jZW9mIEhhbmRsZWJhcnMuU2FmZVN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZy50b1N0cmluZygpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwgfHwgc3RyaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gc3RyaW5nLnRvU3RyaW5nKCk7XG5cbiAgICBpZighcG9zc2libGUudGVzdChzdHJpbmcpKSB7IHJldHVybiBzdHJpbmc7IH1cbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xuICB9LFxuXG4gIGlzRW1wdHk6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmKHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgQXJyYXldXCIgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcycpLmNyZWF0ZSgpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzJykuYXR0YWNoKGV4cG9ydHMpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMnKS5hdHRhY2goZXhwb3J0cykiLCIjIyMqXG4gKiBQcmltYXJ5IGFwcGxpY2F0aW9uIGNvbnRyb2xsZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cbkFwcE1vZGVsICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuQXBwUm91dGVyICAgPSByZXF1aXJlICcuL3JvdXRlcnMvQXBwUm91dGVyLmNvZmZlZSdcbkxhbmRpbmdWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSdcbkNyZWF0ZVZpZXcgID0gcmVxdWlyZSAnLi92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUnXG5TaGFyZVZpZXcgICA9IHJlcXVpcmUgJy4vdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwQ29udHJvbGxlciBleHRlbmRzIFZpZXdcblxuXG4gICBjbGFzc05hbWU6ICd3cmFwcGVyJ1xuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQGxhbmRpbmdWaWV3ID0gbmV3IExhbmRpbmdWaWV3XG4gICAgICBAc2hhcmVWaWV3ICAgPSBuZXcgU2hhcmVWaWV3XG5cbiAgICAgIEBjcmVhdGVWaWV3ICA9IG5ldyBDcmVhdGVWaWV3XG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAYXBwUm91dGVyID0gbmV3IEFwcFJvdXRlclxuICAgICAgICAgYXBwQ29udHJvbGxlcjogQFxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIEFwcENvbnRyb2xsZXIgdG8gdGhlIERPTSBhbmQga2lja3NcbiAgICMgb2ZmIGJhY2tib25lcyBoaXN0b3J5XG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIEAkYm9keSA9ICQgJ2JvZHknXG4gICAgICBAJGJvZHkuYXBwZW5kIEBlbFxuXG4gICAgICBCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0XG4gICAgICAgICBwdXNoU3RhdGU6IGZhbHNlXG5cblxuXG4gICAjIERlc3Ryb3lzIGFsbCBjdXJyZW50IGFuZCBwcmUtcmVuZGVyZWQgdmlld3MgYW5kXG4gICAjIHVuZGVsZWdhdGVzIGV2ZW50IGxpc3RlbmVyc1xuXG4gICByZW1vdmU6IC0+XG4gICAgICBAbGFuZGluZ1ZpZXcucmVtb3ZlKClcbiAgICAgIEBzaGFyZVZpZXcucmVtb3ZlKClcbiAgICAgIEBjcmVhdGVWaWV3LnJlbW92ZSgpXG5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG5cblxuXG5cbiAgICMgQWRkcyBBcHBDb250cm9sbGVyLXJlbGF0ZWQgZXZlbnQgbGlzdGVuZXJzIGFuZCBiZWdpbnNcbiAgICMgbGlzdGVuaW5nIHRvIHZpZXcgY2hhbmdlc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsICdjaGFuZ2U6dmlldycsIEBvblZpZXdDaGFuZ2VcblxuXG5cblxuICAgIyBSZW1vdmVzIEFwcENvbnRyb2xsZXItcmVsYXRlZCBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAc3RvcExpc3RlbmluZygpXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3Igc2hvd2luZyAvIGhpZGluZyAvIGRpc3Bvc2luZyBvZiBwcmltYXJ5IHZpZXdzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uVmlld0NoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgcHJldmlvdXNWaWV3ID0gbW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy52aWV3XG4gICAgICBjdXJyZW50VmlldyAgPSBtb2RlbC5jaGFuZ2VkLnZpZXdcblxuICAgICAgcHJldmlvdXNWaWV3Py5oaWRlXG4gICAgICAgICByZW1vdmU6IHRydWVcblxuXG4gICAgICBAJGVsLmFwcGVuZCBjdXJyZW50Vmlldy5yZW5kZXIoKS5lbFxuXG4gICAgICBjdXJyZW50Vmlldy5zaG93KClcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb250cm9sbGVyIiwiIyMjKlxuICBBcHBsaWNhdGlvbi13aWRlIGdlbmVyYWwgY29uZmlndXJhdGlvbnNcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xOS4xNFxuIyMjXG5cblxuQXBwQ29uZmlnID1cblxuXG4gICAjIFRoZSBwYXRoIHRvIGFwcGxpY2F0aW9uIGFzc2V0c1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBBU1NFVFM6XG4gICAgICBwYXRoOiAgICcvYXNzZXRzJ1xuICAgICAgYXVkaW86ICAnYXVkaW8nXG4gICAgICBkYXRhOiAgICdkYXRhJ1xuICAgICAgaW1hZ2VzOiAnaW1hZ2VzJ1xuXG5cbiAgICMgVGhlIEJQTSB0ZW1wb1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBCUE06IDMyMFxuXG5cbiAgICMgVGhlIG1heCBCUE1cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQlBNX01BWDogMTAwMFxuXG5cbiAgICMgVGhlIG1heCB2YXJpZW50IG9uIGVhY2ggcGF0dGVybiBzcXVhcmUgKG9mZiwgbG93LCBtZWRpdW0sIGhpZ2gpXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIFZFTE9DSVRZX01BWDogM1xuXG5cbiAgICMgVm9sdW1lIGxldmVscyBmb3IgcGF0dGVybiBwbGF5YmFjayBhcyB3ZWxsIGFzIGZvciBvdmVyYWxsIHRyYWNrc1xuICAgIyBAdHlwZSB7T2JqZWN0fVxuXG4gICBWT0xVTUVfTEVWRUxTOlxuICAgICAgbG93OiAgICAuMlxuICAgICAgbWVkaXVtOiAuNVxuICAgICAgaGlnaDogICAgMVxuXG5cbiAgICMgUmV0dXJucyBhIG5vcm1hbGl6ZWQgYXNzZXQgcGF0aCBmb3IgYXBwbGljYXRpb24gYXNzZXRzXG4gICAjIEBwYXJhbSB7U3RyaW5nfSBhc3NldFR5cGVcblxuICAgcmV0dXJuQXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgICAgQEFTU0VUUy5wYXRoICsgJy8nICsgQEFTU0VUU1thc3NldFR5cGVdXG5cblxuICAgIyBSZXR1cm5zIGEgbm9ybWFsaXplZCBhc3NldCBwYXRoIGZvciB0aGUgVEVTVCBlbnZpcm9ubWVudFxuICAgIyBAcGFyYW0ge1N0cmluZ30gYXNzZXRUeXBlXG5cbiAgIHJldHVyblRlc3RBc3NldFBhdGg6IChhc3NldFR5cGUpIC0+XG4gICAgICAnL3Rlc3QvaHRtbC8nICsgQEFTU0VUUy5wYXRoICsgJy8nICsgQEFTU0VUU1thc3NldFR5cGVdXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcENvbmZpZ1xuXG4iLCIjIyMqXG4gKiBBcHBsaWNhdGlvbiByZWxhdGVkIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblxuQXBwRXZlbnQgPVxuXG4gICBDSEFOR0VfQUNUSVZFOiAgICAgJ2NoYW5nZTphY3RpdmUnXG4gICBDSEFOR0VfQlBNOiAgICAgICAgJ2NoYW5nZTpicG0nXG4gICBDSEFOR0VfRFJBR0dJTkc6ICAgJ2NoYW5nZTpkcmFnZ2luZydcbiAgIENIQU5HRV9EUk9QUEVEOiAgICAnY2hhbmdlOmRyb3BwZWQnXG4gICBDSEFOR0VfRk9DVVM6ICAgICAgJ2NoYW5nZTpmb2N1cydcbiAgIENIQU5HRV9JTlNUUlVNRU5UOiAnY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50J1xuICAgQ0hBTkdFX0tJVDogICAgICAgICdjaGFuZ2U6a2l0TW9kZWwnXG4gICBDSEFOR0VfTVVURTogICAgICAgJ2NoYW5nZTptdXRlJ1xuICAgQ0hBTkdFX1BMQVlJTkc6ICAgICdjaGFuZ2U6cGxheWluZydcbiAgIENIQU5HRV9UUklHR0VSOiAgICAnY2hhbmdlOnRyaWdnZXInXG4gICBDSEFOR0VfVkVMT0NJVFk6ICAgJ2NoYW5nZTp2ZWxvY2l0eSdcblxuICAgSU1QT1JUX1RSQUNLOiAgICAgICdvbkltcG9ydFRyYWNrJ1xuICAgRVhQT1JUX1RSQUNLOiAgICAgICdvbkV4cG9ydFRyYWNrJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcEV2ZW50IiwiIyMjKlxuICogR2xvYmFsIFB1YlN1YiBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cblB1YlN1YiA9XG5cbiAgIFJPVVRFOiAnb25Sb3V0ZUNoYW5nZSdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFB1YlN1YiIsIlxudmFyIGRpZ2l0cyA9IHJlcXVpcmUoJ2RpZ2l0cycpO1xudmFyIGhhbmRsZWJhcnMgPSByZXF1aXJlKCdoYW5kbGVpZnknKVxuXG5oYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdyZXBlYXQnLCBmdW5jdGlvbihuLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIF9kYXRhID0ge307XG4gICAgaWYgKG9wdGlvbnMuX2RhdGEpIHtcbiAgICAgIF9kYXRhID0gaGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLl9kYXRhKTtcbiAgICB9XG5cbiAgICB2YXIgY29udGVudCA9ICcnO1xuICAgIHZhciBjb3VudCA9IG4gLSAxO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IGNvdW50OyBpKyspIHtcbiAgICAgIF9kYXRhID0ge1xuICAgICAgICBpbmRleDogZGlnaXRzLnBhZCgoaSArIDEpLCB7YXV0bzogbn0pXG4gICAgICB9O1xuICAgICAgY29udGVudCArPSBvcHRpb25zLmZuKHRoaXMsIHtkYXRhOiBfZGF0YX0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IGhhbmRsZWJhcnMuU2FmZVN0cmluZyhjb250ZW50KTtcbiAgfSk7IiwiIyMjKlxuICogTVBDIEFwcGxpY2F0aW9uIGJvb3RzdHJhcHBlclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblxuVG91Y2ggICAgICAgICA9IHJlcXVpcmUgJy4vdXRpbHMvVG91Y2gnXG5BcHBDb25maWcgICAgID0gcmVxdWlyZSAnLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuQXBwQ29udHJvbGxlciA9IHJlcXVpcmUgJy4vQXBwQ29udHJvbGxlci5jb2ZmZWUnXG5oZWxwZXJzICAgICAgID0gcmVxdWlyZSAnLi9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycydcblxuJCAtPlxuXG4gICBUb3VjaC50cmFuc2xhdGVUb3VjaEV2ZW50cygpXG5cbiAgIGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgcGFyc2U6IHRydWVcblxuICAga2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgIGFwcENvbnRyb2xsZXIgPSBuZXcgQXBwQ29udHJvbGxlclxuICAgICAga2l0Q29sbGVjdGlvbjoga2l0Q29sbGVjdGlvblxuXG4gICBhcHBDb250cm9sbGVyLnJlbmRlcigpXG4iLCIjIyMqXG4gKiBQcmltYXJ5IGFwcGxpY2F0aW9uIG1vZGVsIHdoaWNoIGNvb3JkaW5hdGVzIHN0YXRlXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5Nb2RlbCAgICAgPSByZXF1aXJlICcuLi9zdXBlcnMvTW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcE1vZGVsIGV4dGVuZHMgTW9kZWxcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICd2aWV3JzogICAgICAgIG51bGxcbiAgICAgICdwbGF5aW5nJzogICAgIG51bGxcbiAgICAgICdtdXRlJzogICAgICAgIG51bGxcblxuICAgICAgJ2tpdE1vZGVsJzogICAgbnVsbFxuXG4gICAgICAjIEZvciBleHBvcnRpbmcgc2hhcmUgZnVuY3Rpb25hbGl0eVxuICAgICAgJ3NvbmdNb2RlbCc6ICAgbnVsbFxuXG4gICAgICAjIFNldHRpbmdzXG4gICAgICAnYnBtJzogICAgICAgICBBcHBDb25maWcuQlBNXG5cblxuICAgZXhwb3J0OiAtPlxuICAgICAganNvbiA9IEB0b0pTT04oKVxuXG4gICAgICBqc29uLmtpdE1vZGVsID0ganNvbi5raXRNb2RlbC50b0pTT04oKVxuICAgICAganNvbi5raXRNb2RlbC5pbnN0cnVtZW50cyA9IGpzb24ua2l0TW9kZWwuaW5zdHJ1bWVudHMudG9KU09OKClcbiAgICAgIGpzb24ua2l0TW9kZWwuaW5zdHJ1bWVudHMgPSBfLm1hcCBqc29uLmtpdE1vZGVsLmluc3RydW1lbnRzLCAoaW5zdHJ1bWVudCkgLT5cbiAgICAgICAgIGluc3RydW1lbnQucGF0dGVyblNxdWFyZXMgPSBpbnN0cnVtZW50LnBhdHRlcm5TcXVhcmVzLnRvSlNPTigpXG4gICAgICAgICByZXR1cm4gaW5zdHJ1bWVudFxuICAgICAgcmV0dXJuIGpzb25cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcE1vZGVsIiwiIyMjKlxuICogQ29sbGVjdGlvbiBvZiBzb3VuZCBraXRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Db2xsZWN0aW9uLmNvZmZlZSdcbkFwcENvbmZpZyAgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdE1vZGVsICAgPSByZXF1aXJlICcuL0tpdE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBLaXRDb2xsZWN0aW9uIGV4dGVuZHMgQ29sbGVjdGlvblxuXG5cbiAgICMgVXJsIHRvIGRhdGEgZm9yIGZldGNoXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHVybDogXCIje0FwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKX0vc291bmQtZGF0YS5qc29uXCJcblxuXG4gICAjIEluZGl2aWR1YWwgZHJ1bWtpdCBhdWRpbyBzZXRzXG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAgbW9kZWw6IEtpdE1vZGVsXG5cblxuICAgIyBUaGUgY3VycmVudCB1c2VyLXNlbGVjdGVkIGtpdFxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBraXRJZDogMFxuXG5cblxuICAgIyBQYXJzZXMgdGhlIGNvbGxlY3Rpb24gdG8gYXNzaWduIHBhdGhzIHRvIGVhY2ggaW5kaXZpZHVhbCBzb3VuZFxuICAgIyBiYXNlZCB1cG9uIGNvbmZpZ3VyYXRpb24gZGF0YVxuICAgIyBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcblxuICAgcGFyc2U6IChyZXNwb25zZSkgLT5cbiAgICAgIGFzc2V0UGF0aCA9IHJlc3BvbnNlLmNvbmZpZy5hc3NldFBhdGhcbiAgICAgIGtpdHMgPSByZXNwb25zZS5raXRzXG5cbiAgICAgIGtpdHMgPSBfLm1hcCBraXRzLCAoa2l0KSAtPlxuICAgICAgICAga2l0LnBhdGggPSBhc3NldFBhdGggKyAnLycgKyBraXQuZm9sZGVyXG4gICAgICAgICByZXR1cm4ga2l0XG5cbiAgICAgIHJldHVybiBraXRzXG5cblxuXG5cbiAgICMgSXRlcmF0ZXMgdGhyb3VnaCB0aGUgY29sbGVjdGlvbiBhbmQgcmV0dXJucyBhIHNwZWNpZmljIGluc3RydW1lbnRcbiAgICMgYnkgbWF0Y2hpbmcgYXNzb2NpYXRlZCBpZFxuICAgIyBAcGFyYW0ge051bWJlcn0gaWRcblxuICAgZmluZEluc3RydW1lbnRNb2RlbDogKGlkKSAtPlxuICAgICAgaW5zdHJ1bWVudE1vZGVsID0gbnVsbFxuXG4gICAgICBAZWFjaCAoa2l0TW9kZWwpID0+XG4gICAgICAgICBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuZWFjaCAobW9kZWwpID0+XG4gICAgICAgICAgICBpZiBpZCBpcyBtb2RlbC5nZXQoJ2lkJylcbiAgICAgICAgICAgICAgIGluc3RydW1lbnRNb2RlbCA9IG1vZGVsXG5cbiAgICAgIGlmIGluc3RydW1lbnRNb2RlbCBpcyBudWxsXG4gICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgaW5zdHJ1bWVudE1vZGVsXG5cblxuXG5cbiAgICMgQ3ljbGVzIHRoZSBjdXJyZW50IGRydW0ga2l0IGJhY2tcbiAgICMgQHJldHVybiB7S2l0TW9kZWx9XG5cbiAgIHByZXZpb3VzS2l0OiAtPlxuICAgICAgbGVuID0gQGxlbmd0aFxuXG4gICAgICBpZiBAa2l0SWQgPiAwXG4gICAgICAgICBAa2l0SWQtLVxuXG4gICAgICBlbHNlXG4gICAgICAgICBAa2l0SWQgPSBsZW4gLSAxXG5cbiAgICAgIGtpdE1vZGVsID0gQGF0IEBraXRJZFxuXG5cblxuXG4gICAjIEN5Y2xlcyB0aGUgY3VycmVudCBkcnVtIGtpdCBmb3J3YXJkXG4gICAjIEByZXR1cm4ge0tpdE1vZGVsfVxuXG4gICBuZXh0S2l0OiAtPlxuICAgICAgbGVuID0gQGxlbmd0aCAtIDFcblxuICAgICAgaWYgQGtpdElkIDwgbGVuXG4gICAgICAgICBAa2l0SWQrK1xuXG4gICAgICBlbHNlXG4gICAgICAgICBAa2l0SWQgPSAwXG5cbiAgICAgIGtpdE1vZGVsID0gQGF0IEBraXRJZFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRDb2xsZWN0aW9uIiwiIyMjKlxuICogS2l0IG1vZGVsIGZvciBoYW5kbGluZyBzdGF0ZSByZWxhdGVkIHRvIGtpdCBzZWxlY3Rpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5Nb2RlbCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Nb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuY2xhc3MgS2l0TW9kZWwgZXh0ZW5kcyBNb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ2xhYmVsJzogICAgbnVsbFxuICAgICAgJ3BhdGgnOiAgICAgbnVsbFxuICAgICAgJ2ZvbGRlcic6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cbiAgICAgICdpbnN0cnVtZW50cyc6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICAgICAnY3VycmVudEluc3RydW1lbnQnOiBudWxsXG5cblxuXG4gICAjIEZvcm1hdCB0aGUgcmVzcG9uc2Ugc28gdGhhdCBpbnN0cnVtZW50cyBnZXRzIHByb2Nlc3NlZFxuICAgIyBieSBiYWNrYm9uZSB2aWEgdGhlIEluc3RydW1lbnRDb2xsZWN0aW9uLiAgQWRkaXRpb25hbGx5LFxuICAgIyBwYXNzIGluIHRoZSBwYXRoIHNvIHRoYXQgYWJzb2x1dGUgVVJMJ3MgY2FuIGJlIHVzZWRcbiAgICMgdG8gcmVmZXJlbmNlIHNvdW5kIGRhdGFcbiAgICMgQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG5cbiAgIHBhcnNlOiAocmVzcG9uc2UpIC0+XG4gICAgICBfLmVhY2ggcmVzcG9uc2UuaW5zdHJ1bWVudHMsIChpbnN0cnVtZW50KSAtPlxuICAgICAgICAgaW5zdHJ1bWVudC5pZCA9IF8udW5pcXVlSWQgJ2luc3RydW1lbnQtJ1xuICAgICAgICAgaW5zdHJ1bWVudC5zcmMgPSByZXNwb25zZS5wYXRoICsgJy8nICsgaW5zdHJ1bWVudC5zcmNcblxuICAgICAgcmVzcG9uc2UuaW5zdHJ1bWVudHMgPSBuZXcgSW5zdHJ1bWVudENvbGxlY3Rpb24gcmVzcG9uc2UuaW5zdHJ1bWVudHNcblxuICAgICAgcmVzcG9uc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRNb2RlbCIsIiMjIypcbiAqIE1vZGVsIGZvciB0aGUgZW50aXJlIFBhZCBjb21wb25lbnRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5Nb2RlbCA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Nb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgTGl2ZVBhZE1vZGVsIGV4dGVuZHMgTW9kZWxcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExpdmVQYWRNb2RlbFxuIiwiIyMjKlxuICogQ29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIFBhZFNxdWFyZU1vZGVsc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4uL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuQ29sbGVjdGlvbiAgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL0NvbGxlY3Rpb24uY29mZmVlJ1xuXG5cbmNsYXNzIFBhZFNxdWFyZUNvbGxlY3Rpb24gZXh0ZW5kcyBDb2xsZWN0aW9uXG5cbiAgIG1vZGVsOiBJbnN0cnVtZW50TW9kZWxcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZFNxdWFyZUNvbGxlY3Rpb24iLCIjIyMqXG4gKiBNb2RlbCBmb3IgaW5kaXZpZHVhbCBwYWQgc3F1YXJlcy5cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5Nb2RlbCA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Nb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgUGFkU3F1YXJlTW9kZWwgZXh0ZW5kcyBNb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ2RyYWdnaW5nJzogIGZhbHNlXG4gICAgICAna2V5Y29kZSc6ICAgbnVsbFxuICAgICAgJ3RyaWdnZXInOiAgIGZhbHNlXG5cbiAgICAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cbiAgICAgICdjdXJyZW50SW5zdHJ1bWVudCc6ICBudWxsXG5cblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBzZXQgJ2lkJywgXy51bmlxdWVJZCAncGFkLXNxdWFyZS0nXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZFNxdWFyZU1vZGVsXG4iLCIjIyMqXG4gKiBDb2xsZWN0aW9uIHJlcHJlc2VudGluZyBlYWNoIHNvdW5kIGZyb20gYSBraXQgc2V0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuQ29sbGVjdGlvbiAgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL0NvbGxlY3Rpb24uY29mZmVlJ1xuXG5cbmNsYXNzIEluc3RydW1lbnRDb2xsZWN0aW9uIGV4dGVuZHMgQ29sbGVjdGlvblxuXG5cbiAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cbiAgIG1vZGVsOiBJbnN0cnVtZW50TW9kZWxcblxuXG5cbiAgICMgRXhwb3J0cyB0aGUgcGF0dGVybiBzcXVhcmVzIGNvbGxlY3Rpb24gZm9yIHVzZVxuICAgIyB3aXRoIHRyYW5zZmVycmluZyBwcm9wcyBhY3Jvc3MgZGlmZmVyZW50IGRydW0ga2l0c1xuXG4gICBleHBvcnRQYXR0ZXJuU3F1YXJlczogLT5cbiAgICAgIHJldHVybiBAbWFwIChpbnN0cnVtZW50KSA9PlxuICAgICAgICAgaW5zdHJ1bWVudC5nZXQoJ3BhdHRlcm5TcXVhcmVzJylcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRDb2xsZWN0aW9uIiwiIyMjKlxuICogU291bmQgbW9kZWwgZm9yIGVhY2ggaW5kaXZpZHVhbCBraXQgc291bmQgc2V0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5Nb2RlbCAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvTW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIEluc3RydW1lbnRNb2RlbCBleHRlbmRzIE1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG5cbiAgICAgICMgSWYgYWN0aXZlLCBzb3VuZCBjYW4gcGxheVxuICAgICAgIyBAdHlwZSB7Qm9vbGVhbn1cblxuICAgICAgJ2FjdGl2ZSc6ICAgbnVsbFxuXG5cbiAgICAgICMgRmxhZyB0byBjaGVjayBpZiBpbnN0cnVtZW50IGhhcyBiZWVuIGRyb3BwZWQgb250byBwYWQgc3F1YXJlXG4gICAgICAjIEB0eXBlIHtCb29sZWFufVxuXG4gICAgICAnZHJvcHBlZCc6ICBmYWxzZVxuXG5cbiAgICAgICMgQ2FjaGUgb2YgdGhlIG9yaWdpbmFsIG1vdXNlIGRyYWcgZXZlbnQgaW4gb3JkZXIgdG8gdXBkYXRlIHRoZVxuICAgICAgIyBkcmFnIHBvc2l0aW9uIHdoZW4gZGlzbG9kZ2luZyBpbiBpbnN0cnVtZW50IGZyb20gdGhlIFBhZFNxdWFyZVxuICAgICAgIyBAdHlwZSB7TW91c2VFdmVudH1cblxuICAgICAgJ2Ryb3BwZWRFdmVudCc6IG51bGxcblxuXG4gICAgICAjIEZsYWcgdG8gY2hlY2sgaWYgYXVkaW8gZm9jdXMgaXMgc2V0IG9uIGEgcGFydGljdWxhciBpbnN0cnVtZW50LlxuICAgICAgIyBJZiBzbywgaXQgbXV0ZXMgYWxsIG90aGVyIHRyYWNrcy5cbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgICAgICdmb2N1cyc6ICAgIG51bGxcblxuXG4gICAgICAjIFRoZSBpY29uIGNsYXNzIHRoYXQgcmVwcmVzZW50cyB0aGUgaW5zdHJ1bWVudFxuICAgICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICAgICAnaWNvbic6ICAgICBudWxsXG5cblxuICAgICAgIyBUaGUgdGV4dCBsYWJlbCBkZXNjcmliaW5nIHRoZSBpbnN0cnVtZW50XG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgICAgICdsYWJlbCc6ICAgIG51bGxcblxuXG4gICAgICAjIE11dGUgb3IgdW5tdXRlIHNldHRpbmdcbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgICAgICdtdXRlJzogICAgIG51bGxcblxuXG4gICAgICAjIFRoZSBwYXRoIHRvIHRoZSBzb3VuZCBzb3VyY2VcbiAgICAgICMgQHR5cGUge1N0cmluZ31cblxuICAgICAgJ3NyYyc6ICAgICAgbnVsbFxuXG5cbiAgICAgICMgVGhlIHZvbHVtZVxuICAgICAgIyBAdHlwZSB7TnVtYmVyfVxuICAgICAgJ3ZvbHVtZSc6ICAgbnVsbFxuXG5cbiAgICAgICMgQ29sbGVjdGlvbiBvZiBhc3NvY2lhdGVkIHBhdHRlcm4gc3F1YXJlcyAoYSB0cmFjaykgZm9yIHRoZVxuICAgICAgIyBTZXF1ZW5jZXIgdmlldy4gIFVwZGF0ZWQgd2hlbiB0aGUgdHJhY2tzIGFyZSBzd2FwcGVkIG91dFxuICAgICAgIyBAdHlwZSB7UGF0dGVyblNxdWFyZUNvbGxlY3Rpb259XG5cbiAgICAgICdwYXR0ZXJuU3F1YXJlcyc6ICAgIG51bGxcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudE1vZGVsIiwiIyMjKlxuICBBIGNvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXNcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblB1YlN1YiAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL1B1YlN1YidcbkFwcEV2ZW50ICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5BcHBDb25maWcgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4vUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcbkNvbGxlY3Rpb24gICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Db2xsZWN0aW9uLmNvZmZlZSdcbkluc3RydW1lbnRNb2RlbCAgICA9IHJlcXVpcmUgJy4uL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uIGV4dGVuZHMgQ29sbGVjdGlvblxuXG4gICBtb2RlbDogSW5zdHJ1bWVudE1vZGVsXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICAjUHViU3ViLm9uIEFwcEV2ZW50LklNUE9SVF9UUkFDSywgQG9uSW1wb3J0VHJhY2tcbiAgICAgICNQdWJTdWIub24gQXBwRXZlbnQuRVhQT1JUX1RSQUNLLCBAb25FeHBvcnRUcmFja1xuXG5cbiAgIG9uSW1wb3J0VHJhY2s6IChwYXJhbXMpIC0+XG4gICAgICBjb25zb2xlLmxvZyAnZmlyaW5nIGltcG9ydCEhJ1xuXG5cbiAgIG9uRXhwb3J0VHJhY2s6IChwYXJhbXMpIC0+XG4gICAgICBjb25zb2xlLmxvZyAnZmlyaW5nIGV4cG9ydCEhJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24iLCIjIyMqXG4gIE1vZGVsIGZvciBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlcy4gIFBhcnQgb2YgbGFyZ2VyIFBhdHRlcm4gVHJhY2sgY29sbGVjdGlvblxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuTW9kZWwgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL01vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlTW9kZWwgZXh0ZW5kcyBNb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ2FjdGl2ZSc6ICAgICAgICAgICBmYWxzZVxuICAgICAgJ2luc3RydW1lbnQnOiAgICAgICBudWxsXG4gICAgICAncHJldmlvdXNWZWxvY2l0eSc6IDBcbiAgICAgICd0cmlnZ2VyJzogICAgICAgICAgbnVsbFxuICAgICAgJ3ZlbG9jaXR5JzogICAgICAgICAwXG5cblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQG9uIEFwcEV2ZW50LkNIQU5HRV9WRUxPQ0lUWSwgQG9uVmVsb2NpdHlDaGFuZ2VcblxuXG5cbiAgIGN5Y2xlOiAtPlxuICAgICAgdmVsb2NpdHkgPSBAZ2V0ICd2ZWxvY2l0eSdcblxuICAgICAgaWYgdmVsb2NpdHkgPCBBcHBDb25maWcuVkVMT0NJVFlfTUFYXG4gICAgICAgICB2ZWxvY2l0eSsrXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIHZlbG9jaXR5ID0gMFxuXG4gICAgICBAc2V0ICd2ZWxvY2l0eScsIHZlbG9jaXR5XG5cblxuXG4gICBlbmFibGU6IC0+XG4gICAgICBAc2V0ICd2ZWxvY2l0eScsIDFcblxuXG5cblxuICAgZGlzYWJsZTogLT5cbiAgICAgIEBzZXQgJ3ZlbG9jaXR5JywgMFxuXG5cblxuICAgb25WZWxvY2l0eUNoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgQHNldCAncHJldmlvdXNWZWxvY2l0eScsIG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMudmVsb2NpdHlcblxuICAgICAgdmVsb2NpdHkgPSBtb2RlbC5jaGFuZ2VkLnZlbG9jaXR5XG5cbiAgICAgIGlmIHZlbG9jaXR5ID4gMFxuICAgICAgICAgQHNldCAnYWN0aXZlJywgdHJ1ZVxuXG4gICAgICBlbHNlIGlmIHZlbG9jaXR5IGlzIDBcbiAgICAgICAgIEBzZXQgJ2FjdGl2ZScsIGZhbHNlXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblNxdWFyZU1vZGVsIiwiIyMjKlxuICogTVBDIEFwcGxpY2F0aW9uIHJvdXRlclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcENvbmZpZyAgID0gcmVxdWlyZSAnLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5QdWJTdWIgICAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL1B1YlN1YidcblB1YkV2ZW50ICAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblxuIyBUT0RPOiBUaGUgYmVsb3cgaXRlbXMgYXJlIG9ubHkgaW5jbHVkZWQgZm9yIHRlc3RpbmcgY29tcG9uZW50XG4jIG1vZHVsYXJpdHkuICBUaGV5LCBhbmQgdGhlaXIgcm91dGVzLCBzaG91bGQgYmUgcmVtb3ZlZCBpbiBwcm9kdWN0aW9uXG5cblRlc3RzVmlldyAgICAgPSByZXF1aXJlICcuLi92aWV3cy90ZXN0cy9UZXN0c1ZpZXcuY29mZmVlJ1xuXG5WaWV3ID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5LaXRTZWxlY3RvciAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5LaXRNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlJ1xuXG5CUE1JbmRpY2F0b3IgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSdcbkluc3RydW1lbnRTZWxlY3RvclBhbmVsID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlJ1xuXG5JbnN0cnVtZW50TW9kZWwgPSAnLi4vbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSAnLi4vbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblBhdHRlcm5TcXVhcmUgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblRyYWNrICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2suY29mZmVlJ1xuU2VxdWVuY2VyICAgICAgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUnXG5cbkxpdmVQYWRNb2RlbCA9IHJlcXVpcmUgJy4uL21vZGVscy9wYWQvTGl2ZVBhZE1vZGVsLmNvZmZlZSdcblBhZFNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9tb2RlbHMvcGFkL1BhZFNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGFkU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuLi9tb2RlbHMvcGFkL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSdcbkxpdmVQYWQgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvTGl2ZVBhZC5jb2ZmZWUnXG5QYWRTcXVhcmUgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvUGFkU3F1YXJlLmNvZmZlZSdcblxuXG5jbGFzcyBBcHBSb3V0ZXIgZXh0ZW5kcyBCYWNrYm9uZS5Sb3V0ZXJcblxuXG4gICByb3V0ZXM6XG4gICAgICAnJzogICAgICAgICAgICAgJ2xhbmRpbmdSb3V0ZSdcbiAgICAgICdjcmVhdGUnOiAgICAgICAnY3JlYXRlUm91dGUnXG4gICAgICAnc2hhcmUnOiAgICAgICAgJ3NoYXJlUm91dGUnXG5cbiAgICAgICMgQ29tcG9uZW50IHRlc3Qgcm91dGVzXG4gICAgICAndGVzdHMnOiAgICAgICAgICAgICAgICAndGVzdHMnXG4gICAgICAna2l0LXNlbGVjdGlvbic6ICAgICAgICAna2l0U2VsZWN0aW9uUm91dGUnXG4gICAgICAnYnBtLWluZGljYXRvcic6ICAgICAgICAnYnBtSW5kaWNhdG9yUm91dGUnXG4gICAgICAnaW5zdHJ1bWVudC1zZWxlY3Rvcic6ICAnaW5zdHJ1bWVudFNlbGVjdG9yUm91dGUnXG4gICAgICAncGF0dGVybi1zcXVhcmUnOiAgICAgICAncGF0dGVyblNxdWFyZVJvdXRlJ1xuICAgICAgJ3BhdHRlcm4tdHJhY2snOiAgICAgICAgJ3BhdHRlcm5UcmFja1JvdXRlJ1xuICAgICAgJ3NlcXVlbmNlcic6ICAgICAgICAgICAgJ3NlcXVlbmNlclJvdXRlJ1xuICAgICAgJ2Z1bGwtc2VxdWVuY2VyJzogICAgICAgJ2Z1bGxTZXF1ZW5jZXJSb3V0ZSdcbiAgICAgICdwYWQtc3F1YXJlJzogICAgICAgICAgICdwYWRTcXVhcmVSb3V0ZSdcbiAgICAgICdsaXZlLXBhZCc6ICAgICAgICAgICAgICdsaXZlUGFkUm91dGUnXG5cblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHtAYXBwQ29udHJvbGxlciwgQGFwcE1vZGVsfSA9IG9wdGlvbnNcblxuICAgICAgUHViU3ViLm9uIFB1YkV2ZW50LlJPVVRFLCBAb25Sb3V0ZUNoYW5nZVxuXG5cblxuICAgb25Sb3V0ZUNoYW5nZTogKHBhcmFtcykgPT5cbiAgICAgIHtyb3V0ZX0gPSBwYXJhbXNcblxuICAgICAgQG5hdmlnYXRlIHJvdXRlLCB7IHRyaWdnZXI6IHRydWUgfVxuXG5cblxuICAgbGFuZGluZ1JvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLmxhbmRpbmdWaWV3XG5cblxuXG4gICBjcmVhdGVSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBAYXBwQ29udHJvbGxlci5jcmVhdGVWaWV3XG5cblxuXG4gICBzaGFyZVJvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLnNoYXJlVmlld1xuXG5cblxuXG5cblxuICAgIyBDT01QT05FTlQgVEVTVCBST1VURVNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICB0ZXN0czogLT5cbiAgICAgIHZpZXcgPSBuZXcgVGVzdHNWaWV3KClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAga2l0U2VsZWN0aW9uUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLFxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBicG1JbmRpY2F0b3JSb3V0ZTogLT5cbiAgICAgIHZpZXcgPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIHZpZXcucmVuZGVyKClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAgaW5zdHJ1bWVudFNlbGVjdG9yUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgdmlldyA9IG5ldyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAgcGF0dGVyblNxdWFyZVJvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbmV3IFBhdHRlcm5TcXVhcmVNb2RlbCgpXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG4gICBwYXR0ZXJuVHJhY2tSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgIG1vZGVsOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbiAgIHNlcXVlbmNlclJvdXRlOiAtPlxuXG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgU2VxdWVuY2VyXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbiAgIGZ1bGxTZXF1ZW5jZXJSb3V0ZTogLT5cblxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG5cbiAgICAgIGtpdFNlbGVjdGlvbiA9ID0+XG4gICAgICAgICB2aWV3ID0gbmV3IEtpdFNlbGVjdG9yXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICAgICB2aWV3XG5cblxuICAgICAgYnBtID0gPT5cbiAgICAgICAgIHZpZXcgPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgICAgIHZpZXdcblxuXG4gICAgICBpbnN0cnVtZW50U2VsZWN0aW9uID0gPT5cbiAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgICAgdmlldyA9IG5ldyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuICAgICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgICAgdmlld1xuXG5cbiAgICAgIHNlcXVlbmNlciA9ID0+XG4gICAgICAgICB2aWV3ID0gbmV3IFNlcXVlbmNlclxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgICAgIHZpZXdcblxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcgPSBuZXcgVmlldygpXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldy4kZWwuYXBwZW5kIGtpdFNlbGVjdGlvbigpLnJlbmRlcigpLmVsXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldy4kZWwuYXBwZW5kIGJwbSgpLnJlbmRlcigpLmVsXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldy4kZWwuYXBwZW5kIGluc3RydW1lbnRTZWxlY3Rpb24oKS5yZW5kZXIoKS5lbFxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcuJGVsLmFwcGVuZCBzZXF1ZW5jZXIoKS5yZW5kZXIoKS5lbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgZnVsbFNlcXVlbmNlclZpZXdcblxuXG5cblxuICAgcGFkU3F1YXJlUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgUGFkU3F1YXJlXG4gICAgICAgICBtb2RlbDogbmV3IFBhZFNxdWFyZU1vZGVsKClcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuXG4gICBsaXZlUGFkUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgTGl2ZVBhZFxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBSb3V0ZXIiLCIjIyMqXG4gKiBDb2xsZWN0aW9uIHN1cGVyY2xhc3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjUuMTRcbiMjI1xuXG5cbmNsYXNzIENvbGxlY3Rpb24gZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb24iLCIjIyMqXG4gKiBNb2RlbCBzdXBlcmNsYXNzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI1LjE0XG4jIyNcblxuXG5jbGFzcyBNb2RlbCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVsIiwiIyMjKlxuICogVmlldyBzdXBlcmNsYXNzIGNvbnRhaW5pbmcgc2hhcmVkIGZ1bmN0aW9uYWxpdHlcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDIuMTcuMTRcbiMjI1xuXG5cbmNsYXNzIFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cblxuICAgIyBJbml0aWFsaXplcyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIF8uZXh0ZW5kIEAsIF8uZGVmYXVsdHMoIG9wdGlvbnMgPSBvcHRpb25zIHx8IEBkZWZhdWx0cywgQGRlZmF1bHRzIHx8IHt9IClcblxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgd2l0aCBzdXBwbGllZCB0ZW1wbGF0ZSBkYXRhLCBvciBjaGVja3MgaWYgdGVtcGxhdGUgaXMgb25cbiAgICMgb2JqZWN0IGJvZHlcbiAgICMgQHBhcmFtICB7RnVuY3Rpb258TW9kZWx9IHRlbXBsYXRlRGF0YVxuICAgIyBAcmV0dXJuIHtWaWV3fVxuXG4gICByZW5kZXI6ICh0ZW1wbGF0ZURhdGEpIC0+XG4gICAgICB0ZW1wbGF0ZURhdGEgPSB0ZW1wbGF0ZURhdGEgfHwge31cblxuICAgICAgaWYgQHRlbXBsYXRlXG5cbiAgICAgICAgICMgSWYgbW9kZWwgaXMgYW4gaW5zdGFuY2Ugb2YgYSBiYWNrYm9uZSBtb2RlbCwgdGhlbiBKU09OaWZ5IGl0XG4gICAgICAgICBpZiBAbW9kZWwgaW5zdGFuY2VvZiBCYWNrYm9uZS5Nb2RlbFxuICAgICAgICAgICAgdGVtcGxhdGVEYXRhID0gQG1vZGVsLnRvSlNPTigpXG5cbiAgICAgICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUgKHRlbXBsYXRlRGF0YSlcblxuICAgICAgQGRlbGVnYXRlRXZlbnRzKClcbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW1vdmVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbW92ZTogKG9wdGlvbnMpIC0+XG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuICAgICAgQCRlbC5yZW1vdmUoKVxuICAgICAgQHVuZGVsZWdhdGVFdmVudHMoKVxuXG5cblxuXG5cbiAgICMgU2hvd3MgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgc2hvdzogKG9wdGlvbnMpIC0+XG4gICAgICBUd2Vlbk1heC5zZXQgQCRlbCwgeyBhdXRvQWxwaGE6IDEgfVxuXG5cblxuXG4gICAjIEhpZGVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGhpZGU6IChvcHRpb25zKSAtPlxuICAgICAgVHdlZW5NYXguc2V0IEAkZWwsXG4gICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICBpZiBvcHRpb25zPy5yZW1vdmVcbiAgICAgICAgICAgICAgIEByZW1vdmUoKVxuXG5cblxuXG4gICAjIE5vb3Agd2hpY2ggaXMgY2FsbGVkIG9uIHJlbmRlclxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cblxuXG5cbiAgICMgUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBsaXN0ZW5lcnNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAc3RvcExpc3RlbmluZygpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXciLCIvKipcbiAqIEBtb2R1bGUgICAgIFB1YlN1YlxuICogQGRlc2MgICAgICAgR2xvYmFsIFB1YlN1YiBvYmplY3QgZm9yIGRpc3BhdGNoIGFuZCBkZWxlZ2F0aW9uXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBQdWJTdWIgPSB7fVxuXG5fLmV4dGVuZCggUHViU3ViLCBCYWNrYm9uZS5FdmVudHMgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFB1YlN1YiIsIi8qKlxuICogVG91Y2ggcmVsYXRlZCB1dGlsaXRpZXNcbiAqXG4gKi9cblxudmFyIFRvdWNoID0ge1xuXG5cbiAgLyoqXG4gICAqIERlbGVnYXRlIHRvdWNoIGV2ZW50cyB0byBtb3VzZSBpZiBub3Qgb24gYSB0b3VjaCBkZXZpY2VcbiAgICovXG5cbiAgdHJhbnNsYXRlVG91Y2hFdmVudHM6IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICghICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgKSkge1xuICAgICAgJChkb2N1bWVudCkuZGVsZWdhdGUoICdib2R5JywgJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgJChlLnRhcmdldCkudHJpZ2dlciggJ3RvdWNoc3RhcnQnIClcbiAgICAgIH0pXG5cbiAgICAgICQoZG9jdW1lbnQpLmRlbGVnYXRlKCAnYm9keScsICdtb3VzZXVwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAkKGUudGFyZ2V0KS50cmlnZ2VyKCAndG91Y2hlbmQnIClcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUb3VjaCIsIiMjIypcbiAqIENyZWF0ZSB2aWV3IHdoaWNoIHRoZSB1c2VyIGNhbiBidWlsZCBiZWF0cyB3aXRoaW5cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5QdWJTdWIgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL1B1YlN1YidcblZpZXcgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuQXBwRXZlbnQgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuS2l0U2VsZWN0b3IgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci5jb2ZmZWUnXG5JbnN0cnVtZW50U2VsZWN0b3JQYW5lbCA9IHJlcXVpcmUgJy4uLy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLmNvZmZlZSdcblNlcXVlbmNlciAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUnXG5CUE1JbmRpY2F0b3IgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci5jb2ZmZWUnXG50ZW1wbGF0ZSAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2NyZWF0ZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgQ3JlYXRlVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLmJ0bi1zaGFyZSc6ICAnb25TaGFyZUJ0bkNsaWNrJ1xuICAgICAgJ3RvdWNoZW5kIC5idG4tZXhwb3J0JzogJ29uRXhwb3J0QnRuQ2xpY2snXG5cblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRraXRTZWxlY3RvckNvbnRhaW5lciAgID0gQCRlbC5maW5kICcuY29udGFpbmVyLWtpdC1zZWxlY3RvcidcbiAgICAgIEAka2l0U2VsZWN0b3IgICAgICAgICAgICA9IEAkZWwuZmluZCAnLmtpdC1zZWxlY3RvcidcbiAgICAgIEAkdmlzdWFsaXphdGlvbkNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci12aXN1YWxpemF0aW9uJ1xuICAgICAgQCRzZXF1ZW5jZXJDb250YWluZXIgICAgID0gQCRlbC5maW5kICcuY29udGFpbmVyLXNlcXVlbmNlcidcbiAgICAgIEAkaW5zdHJ1bWVudFNlbGVjdG9yICAgICA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5pbnN0cnVtZW50LXNlbGVjdG9yJ1xuICAgICAgQCRzZXF1ZW5jZXIgICAgICAgICAgICAgID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLnNlcXVlbmNlcidcbiAgICAgIEAkYnBtICAgICAgICAgICAgICAgICAgICA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5icG0nXG4gICAgICBAJHNoYXJlQnRuICAgICAgICAgICAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuYnRuLXNoYXJlJ1xuXG4gICAgICBAcmVuZGVyS2l0U2VsZWN0b3IoKVxuICAgICAgQHJlbmRlckluc3RydW1lbnRTZWxlY3RvcigpXG4gICAgICBAcmVuZGVyU2VxdWVuY2VyKClcbiAgICAgIEByZW5kZXJCUE0oKVxuXG4gICAgICBAXG5cblxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIFB1YlN1Yi5vbiBBcHBFdmVudC5FWFBPUlRfVFJBQ0ssIEBvbkV4cG9ydFRyYWNrXG5cblxuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIFB1YlN1Yi5vZmYgQXBwRXZlbnQuRVhQT1JUX1RSQUNLXG5cblxuXG5cbiAgIHJlbmRlcktpdFNlbGVjdG9yOiAtPlxuICAgICAgQGtpdFNlbGVjdG9yID0gbmV3IEtpdFNlbGVjdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAJGtpdFNlbGVjdG9yLmh0bWwgQGtpdFNlbGVjdG9yLnJlbmRlcigpLmVsXG5cblxuXG4gICByZW5kZXJJbnN0cnVtZW50U2VsZWN0b3I6IC0+XG4gICAgICBAaW5zdHJ1bWVudFNlbGVjdG9yID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAJGluc3RydW1lbnRTZWxlY3Rvci5odG1sIEBpbnN0cnVtZW50U2VsZWN0b3IucmVuZGVyKCkuZWxcblxuXG5cbiAgIHJlbmRlclNlcXVlbmNlcjogLT5cbiAgICAgIEBzZXF1ZW5jZXIgPSBuZXcgU2VxdWVuY2VyXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgQCRzZXF1ZW5jZXIuaHRtbCBAc2VxdWVuY2VyLnJlbmRlcigpLmVsXG5cblxuXG4gICByZW5kZXJCUE06IC0+XG4gICAgICBAYnBtID0gbmV3IEJQTUluZGljYXRvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAJGJwbS5odG1sIEBicG0ucmVuZGVyKCkuZWxcblxuXG5cblxuICAgb25FeHBvcnRCdG5DbGljazogKGV2ZW50KSA9PlxuICAgICAgUHViU3ViLnRyaWdnZXIgQXBwRXZlbnQuRVhQT1JUX1RSQUNLLCAocGFyYW1zKSA9PlxuICAgICAgICAge0BpbnN0cnVtZW50cywgQHBhdHRlcm5TcXVhcmVHcm91cHN9ID0gcGFyYW1zXG5cblxuXG5cbiAgIG9uU2hhcmVCdG5DbGljazogKGV2ZW50KSA9PlxuXG4gICAgICBQdWJTdWIudHJpZ2dlciBBcHBFdmVudC5JTVBPUlRfVFJBQ0ssXG5cbiAgICAgICAgIGluc3RydW1lbnRzOiAgICAgICAgIEBpbnN0cnVtZW50c1xuICAgICAgICAgcGF0dGVyblNxdWFyZUdyb3VwczogQHBhdHRlcm5TcXVhcmVHcm91cHNcblxuICAgICAgICAgY2FsbGJhY2s6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nICdkb25lIGltcG9ydGluZydcblxuXG5cblxuICAgb25FeHBvcnRUcmFjazogKGNhbGxiYWNrKSA9PlxuICAgICAgcGF0dGVyblNxdWFyZUdyb3VwcyA9IFtdXG4gICAgICBwYXR0ZXJuU3F1YXJlcyA9IFtdXG5cbiAgICAgIGluc3RydW1lbnRzID0gQGFwcE1vZGVsLmV4cG9ydCgpLmtpdE1vZGVsLmluc3RydW1lbnRzXG5cbiAgICAgIGluc3RydW1lbnRzID0gaW5zdHJ1bWVudHMubWFwIChpbnN0cnVtZW50KSA9PlxuICAgICAgICAgaW5zdHJ1bWVudC5wYXR0ZXJuU3F1YXJlcy5mb3JFYWNoIChwYXR0ZXJuU3F1YXJlKSA9PlxuICAgICAgICAgICAgZGVsZXRlIHBhdHRlcm5TcXVhcmUuaW5zdHJ1bWVudFxuICAgICAgICAgICAgcGF0dGVyblNxdWFyZXMucHVzaCBwYXR0ZXJuU3F1YXJlXG5cbiAgICAgICAgIGluc3RydW1lbnRcblxuICAgICAgd2hpbGUgKHBhdHRlcm5TcXVhcmVzLmxlbmd0aCA+IDApXG4gICAgICAgICBwYXR0ZXJuU3F1YXJlR3JvdXBzLnB1c2ggcGF0dGVyblNxdWFyZXMuc3BsaWNlKDAsIDgpXG5cbiAgICAgIGNhbGxiYWNrIHtcbiAgICAgICAgIHBhdHRlcm5TcXVhcmVHcm91cHM6IHBhdHRlcm5TcXVhcmVHcm91cHNcbiAgICAgICAgIGluc3RydW1lbnRzOiBpbnN0cnVtZW50c1xuICAgICAgfVxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDcmVhdGVWaWV3IiwiIyMjKlxuICogQmVhdHMgcGVyIG1pbnV0ZSB2aWV3IGZvciBoYW5kbGluZyB0ZW1wb1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2JwbS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgQlBNSW5kaWNhdG9yIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgUmVmIHRvIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFRoZSBzZXRJbnRlcnZhbCB1cGRhdGUgaW50ZXJ2YWwgZm9yIGluY3JlYXNpbmcgYW5kXG4gICAjIGRlY3JlYXNpbmcgQlBNIG9uIHByZXNzIC8gdG91Y2hcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgaW50ZXJ2YWxVcGRhdGVUaW1lOiA3MFxuXG5cbiAgICMgVGhlIHNldEludGVydmFsIHVwZGF0ZXJcbiAgICMgQHR5cGUge1NldEludGVydmFsfVxuXG4gICB1cGRhdGVJbnRlcnZhbDogbnVsbFxuXG5cbiAgICMgVGhlIGFtb3VudCB0byBpbmNyZWFzZSB0aGUgQlBNIGJ5IG9uIGVhY2ggdGlja1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBicG1JbmNyZWFzZUFtb3VudDogMTBcblxuXG4gICAjIFRoZSBjdXJyZW50IGJwbSBiZWZvcmUgaXRzIHNldCBvbiB0aGUgbW9kZWwuICBVc2VkIHRvIGJ1ZmZlclxuICAgIyB1cGRhdGVzIGFuZCB0byBwcm92aWRlIGZvciBzbW9vdGggYW5pbWF0aW9uXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGN1cnJCUE06IG51bGxcblxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoc3RhcnQgLmJ0bi1pbmNyZWFzZSc6ICdvbkluY3JlYXNlQnRuRG93bidcbiAgICAgICd0b3VjaHN0YXJ0IC5idG4tZGVjcmVhc2UnOiAnb25EZWNyZWFzZUJ0bkRvd24nXG4gICAgICAndG91Y2hlbmQgICAuYnRuLWluY3JlYXNlJzogJ29uQnRuVXAnXG4gICAgICAndG91Y2hlbmQgICAuYnRuLWRlY3JlYXNlJzogJ29uQnRuVXAnXG5cblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGFuZCB1cGRhdGUgdGhlIGtpdCBpZiBub3QgYWxyZWFkeVxuICAgIyBzZXQgdmlhIGEgcHJldmlvdXMgc2Vzc2lvblxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGJwbUxhYmVsICAgPSBAJGVsLmZpbmQgJy5sYWJlbC1icG0nXG4gICAgICBAaW5jcmVhc2VCdG4gPSBAJGVsLmZpbmQgJy5idG4taW5jcmVhc2UnXG4gICAgICBAZGVjcmVhc2VCdG4gPSBAJGVsLmZpbmQgJy5idG4tZGVjcmVhc2UnXG5cbiAgICAgIEBjdXJyQlBNID0gQGFwcE1vZGVsLmdldCgnYnBtJylcbiAgICAgIEAkYnBtTGFiZWwudGV4dCBAY3VyckJQTVxuICAgICAgQG9uQnRuVXAoKVxuXG4gICAgICBAXG5cblxuXG4gICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRpbmcgY2hhbmdlcyByZWxhdGVkIHRvXG4gICAjIHN3aXRjaGluZyBCUE1cblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfQlBNLCBAb25CUE1DaGFuZ2VcblxuXG5cblxuICAgIyBTZXRzIGFuIGludGVydmFsIHRvIGluY3JlYXNlIHRoZSBCUE0gbW9uaXRvci4gIENsZWFyc1xuICAgIyB3aGVuIHRoZSB1c2VyIHJlbGVhc2VzIHRoZSBtb3VzZVxuXG4gICBpbmNyZWFzZUJQTTogLT5cbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IHNldEludGVydmFsID0+XG4gICAgICAgICBicG0gPSBAY3VyckJQTVxuXG4gICAgICAgICBpZiBicG0gPCBBcHBDb25maWcuQlBNX01BWFxuICAgICAgICAgICAgYnBtICs9IEBicG1JbmNyZWFzZUFtb3VudFxuXG4gICAgICAgICBlbHNlXG4gICAgICAgICAgICBicG0gPSBBcHBDb25maWcuQlBNX01BWFxuXG4gICAgICAgICBAY3VyckJQTSA9IGJwbVxuICAgICAgICAgQCRicG1MYWJlbC50ZXh0IEBjdXJyQlBNXG4gICAgICAgICAjQGFwcE1vZGVsLnNldCAnYnBtJywgNjAwMDAgLyBAY3VyckJQTVxuXG4gICAgICAsIEBpbnRlcnZhbFVwZGF0ZVRpbWVcblxuXG5cblxuICAgIyBTZXRzIGFuIGludGVydmFsIHRvIGRlY3JlYXNlIHRoZSBCUE0gbW9uaXRvci4gIENsZWFyc1xuICAgIyB3aGVuIHRoZSB1c2VyIHJlbGVhc2VzIHRoZSBtb3VzZVxuXG4gICBkZWNyZWFzZUJQTTogLT5cbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IHNldEludGVydmFsID0+XG4gICAgICAgICBicG0gPSBAY3VyckJQTVxuXG4gICAgICAgICBpZiBicG0gPiAwXG4gICAgICAgICAgICBicG0gLT0gQGJwbUluY3JlYXNlQW1vdW50XG5cbiAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJwbSA9IDBcblxuICAgICAgICAgQGN1cnJCUE0gPSBicG1cbiAgICAgICAgIEAkYnBtTGFiZWwudGV4dCBAY3VyckJQTVxuICAgICAgICAgI0BhcHBNb2RlbC5zZXQgJ2JwbScsIDYwMDAwIC8gQGN1cnJCUE1cblxuICAgICAgLCBAaW50ZXJ2YWxVcGRhdGVUaW1lXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uSW5jcmVhc2VCdG5Eb3duOiAoZXZlbnQpID0+XG4gICAgICBAaW5jcmVhc2VCUE0oKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGxlZnQgYnV0dG9uIGNsaWNrcy4gIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gYW5kXG4gICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25EZWNyZWFzZUJ0bkRvd246IChldmVudCkgLT5cbiAgICAgIEBkZWNyZWFzZUJQTSgpXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtb3VzZSAvIHRvdWNodXAgZXZlbnRzLiAgQ2xlYXJzIHRoZSBpbnRlcnZhbFxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkJ0blVwOiAoZXZlbnQpIC0+XG4gICAgICBjbGVhckludGVydmFsIEB1cGRhdGVJbnRlcnZhbFxuICAgICAgQHVwZGF0ZUludGVydmFsID0gbnVsbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICdicG0nLCA2MDAwMCAvIEBjdXJyQlBNXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSBsYWJlbCBvbiB0aGVcbiAgICMga2l0IHNlbGVjdG9yXG5cbiAgIG9uQlBNQ2hhbmdlOiAobW9kZWwpIC0+XG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBCUE1JbmRpY2F0b3IiLCIjIyMqXG4gKiBLaXQgc2VsZWN0b3IgZm9yIHN3aXRjaGluZyBiZXR3ZWVuIGRydW0ta2l0IHNvdW5kc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ID0gcmVxdWlyZSAnLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9raXQtc2VsZWN0aW9uLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBLaXRTZWxlY3RvciBleHRlbmRzIFZpZXdcblxuXG4gICAjIFJlZiB0byB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIEtpdENvbGxlY3Rpb24gZm9yIHVwZGF0aW5nIHNvdW5kc1xuICAgIyBAdHlwZSB7S2l0Q29sbGVjdGlvbn1cblxuICAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgVGhlIGN1cnJlbnQga2l0XG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0TW9kZWw6IG51bGxcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCAuYnRuLWxlZnQnOiAgICdvbkxlZnRCdG5DbGljaydcbiAgICAgICd0b3VjaGVuZCAuYnRuLXJpZ2h0JzogICdvblJpZ2h0QnRuQ2xpY2snXG5cblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGFuZCB1cGRhdGUgdGhlIGtpdCBpZiBub3QgYWxyZWFkeVxuICAgIyBzZXQgdmlhIGEgcHJldmlvdXMgc2Vzc2lvblxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGtpdExhYmVsID0gQCRlbC5maW5kICcubGFiZWwta2l0J1xuXG4gICAgICBpZiBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpIGlzIG51bGxcbiAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQCRraXRMYWJlbC50ZXh0IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJykuZ2V0ICdsYWJlbCdcblxuICAgICAgQFxuXG5cblxuXG4gICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRpbmcgY2hhbmdlcyByZWxhdGVkIHRvXG4gICAjIHN3aXRjaGluZyBkcnVtIGtpdHNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfS0lULCBAb25DaGFuZ2VLaXRcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG5cbiAgIG9uTGVmdEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLnByZXZpb3VzS2l0KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG5cbiAgIG9uUmlnaHRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5uZXh0S2l0KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGxhYmVsIG9uIHRoZVxuICAgIyBraXQgc2VsZWN0b3JcblxuICAgb25DaGFuZ2VLaXQ6IChtb2RlbCkgLT5cbiAgICAgIEBraXRNb2RlbCA9IG1vZGVsLmNoYW5nZWQua2l0TW9kZWxcbiAgICAgIEAka2l0TGFiZWwudGV4dCBAa2l0TW9kZWwuZ2V0ICdsYWJlbCdcblxuXG5cblxuXG4gICAjIFBSSVZBVEUgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2l0U2VsZWN0b3IiLCIjIyMqXG4gKiBTb3VuZCB0eXBlIHNlbGVjdG9yIGZvciBjaG9vc2luZyB3aGljaCBzb3VuZCBzaG91bGRcbiAqIHBsYXkgb24gZWFjaCB0cmFja1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblxuQXBwRXZlbnQgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2luc3RydW1lbnQtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEluc3RydW1lbnQgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgdmlldyBjbGFzc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdpbnN0cnVtZW50J1xuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgUmVmIHRvIHRoZSBJbnN0cnVtZW50TW9kZWxcbiAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cblxuICAgbW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgcGFyZW50IGtpdFxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdE1vZGVsOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCc6ICdvbkNsaWNrJ1xuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGNsaWNrIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGN1cnJlbnQgaW5zdHJ1bWVudCBtb2RlbCwgd2hpY2hcbiAgICMgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgbGlzdGVucyB0bywgYW5kIGFkZHMgYSBzZWxlY3RlZCBzdGF0ZVxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAa2l0TW9kZWwuc2V0ICdjdXJyZW50SW5zdHJ1bWVudCcsIEBtb2RlbFxuICAgICAgQCRlbC5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50IiwiIyMjKlxuICogUGFuZWwgd2hpY2ggaG91c2VzIGVhY2ggaW5kaXZpZHVhbCBzZWxlY3RhYmxlIHNvdW5kXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwRXZlbnQgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5JbnN0cnVtZW50ICA9IHJlcXVpcmUgJy4vSW5zdHJ1bWVudC5jb2ZmZWUnXG50ZW1wbGF0ZSAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2luc3RydW1lbnQtcGFuZWwtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEluc3RydW1lbnRTZWxlY3RvclBhbmVsIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgUmVmIHRvIHRoZSBhcHBsaWNhdGlvbiBtb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8ga2l0IGNvbGxlY3Rpb25cbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRDb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBraXRcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIGluc3RydW1lbnQgdmlld3NcbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBpbnN0cnVtZW50Vmlld3M6IG51bGxcblxuXG5cblxuICAgIyBJbml0aWFsaXplcyB0aGUgaW5zdHJ1bWVudCBzZWxlY3RvciBhbmQgc2V0cyBhIGxvY2FsIHJlZlxuICAgIyB0byB0aGUgY3VycmVudCBraXQgbW9kZWwgZm9yIGVhc3kgYWNjZXNzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAa2l0TW9kZWwgPSBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBhcyB3ZWxsIGFzIHRoZSBhc3NvY2lhdGVkIGtpdCBpbnN0cnVtZW50c1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1pbnN0cnVtZW50cydcblxuICAgICAgQHJlbmRlckluc3RydW1lbnRzKClcblxuICAgICAgQFxuXG5cblxuXG4gICAjIFJlbmRlcnMgZWFjaCBpbmRpdmlkdWFsIGtpdCBtb2RlbCBpbnRvIGFuIEluc3RydW1lbnRcblxuICAgcmVuZGVySW5zdHJ1bWVudHM6IC0+XG4gICAgICBAaW5zdHJ1bWVudFZpZXdzID0gW11cblxuICAgICAgQGtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKS5lYWNoIChtb2RlbCkgPT5cbiAgICAgICAgIGluc3RydW1lbnQgPSBuZXcgSW5zdHJ1bWVudFxuICAgICAgICAgICAga2l0TW9kZWw6IEBraXRNb2RlbFxuICAgICAgICAgICAgbW9kZWw6IG1vZGVsXG5cbiAgICAgICAgIEAkY29udGFpbmVyLmFwcGVuZCBpbnN0cnVtZW50LnJlbmRlcigpLmVsXG4gICAgICAgICBAaW5zdHJ1bWVudFZpZXdzLnB1c2ggaW5zdHJ1bWVudFxuXG5cblxuXG4gICAjIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHJlbGF0ZWQgdG8ga2l0IGNoYW5nZXNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfS0lULCBAb25LaXRDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAa2l0TW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9JTlNUUlVNRU5ULCBAb25JbnN0cnVtZW50Q2hhbmdlXG5cblxuXG4gICAjIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cblxuXG5cbiAgICMgRVZFTlQgTElTVEVORVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2UgZXZlbnRzLiAgQ2xlYW5zIHVwIHRoZSB2aWV3IGFuZCByZS1yZW5kZXJzXG4gICAjIHRoZSBpbnN0cnVtZW50cyB0byB0aGUgRE9NXG4gICAjIEBwYXJhbSB7S2l0TW9kZWx9IG1vZGVsXG5cbiAgIG9uS2l0Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuXG4gICAgICBAa2l0TW9kZWwgPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsXG5cbiAgICAgIF8uZWFjaCBAaW5zdHJ1bWVudFZpZXdzLCAoaW5zdHJ1bWVudCkgLT5cbiAgICAgICAgIGluc3RydW1lbnQucmVtb3ZlKClcblxuICAgICAgQHJlbmRlckluc3RydW1lbnRzKClcbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cblxuXG5cbiAgIG9uSW5zdHJ1bWVudENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQCRjb250YWluZXIuZmluZCgnLmluc3RydW1lbnQnKS5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG5cblxuXG5cblxuICAgb25UZXN0Q2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0nY29udGFpbmVyLWluc3RydW1lbnRzJz5cXG5cXG48L2Rpdj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiO1xuXG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz0naWNvbiBcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWNvbikgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWNvbjsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIic+PC9kaXY+XFxuPGRpdiBjbGFzcz0nbGFiZWwnPlxcblx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvZGl2PlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIiMjIypcbiAqIExpdmUgTVBDIFwicGFkXCIgY29tcG9uZW50XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI0LjE0XG4jIyNcblxuQXBwRXZlbnQgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5QYWRTcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhZFNxdWFyZU1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvcGFkL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSdcblZpZXcgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5QYWRTcXVhcmUgICAgICAgICAgID0gcmVxdWlyZSAnLi9QYWRTcXVhcmUuY29mZmVlJ1xucGFkc1RlbXBsYXRlICAgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3BhZHMtdGVtcGxhdGUuaGJzJ1xuaW5zdHJ1bWVudHNUZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2luc3RydW1lbnRzLXRlbXBsYXRlLmhicydcbnRlbXBsYXRlICAgICAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9saXZlLXBhZC10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgTGl2ZVBhZCBleHRlbmRzIFZpZXdcblxuXG4gICAjIEtleSBjb21tYW5kIGtleW1hcCBmb3IgbGl2ZSBraXQgcGxheWJhY2tcbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBLRVlNQVA6IFsnMScsJzInLCczJywnNCcsJ3EnLCAndycsICdlJywgJ3InLCAnYScsICdzJywgJ2QnLCAnZicsICd6JywgJ3gnLCAnYycsICd2J11cblxuXG4gICAjIFRoZSBjbGFzc25hbWUgZm9yIHRoZSBMaXZlIFBhZFxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdjb250YWluZXItbGl2ZS1wYWQnXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIEFwcG1vZGVsIGZvciBsaXN0ZW5pbmcgdG8gc2hvdyAvIGhpZGUgZXZlbnRzXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIENvbGxlY3Rpb24gb2Yga2l0cyB0byBiZSByZW5kZXJlZCB0byB0aGUgaW5zdHJ1bWVudCBjb250YWluZXJcbiAgICMgQHR5cGUge0tpdENvbGxlY3Rpb259XG5cbiAgIGtpdENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIENvbGxlY3Rpb24gb2YgaW5zdHJ1bWVudHMuICBVc2VkIHRvIGxpc3RlbiB0byBgZHJvcHBlZGAgc3RhdHVzXG4gICAjIG9uIGluZGl2aWR1YWwgaW5zdHJ1bWVudCBtb2RlbHMsIGFzIHNldCBmcm9tIHRoZSBQYWRTcXVhcmVcbiAgICMgQHR5cGUge0luc3RydW1lbnRDb2xsZWN0aW9ufVxuXG4gICBpbnN0cnVtZW50Q29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgQ29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIHBhZCBzcXVhcmUgbW9kZWxzXG4gICAjIEB0eXBlIHtQYWRTcXVhcmVDb2xsZWN0aW9ufVxuXG4gICBwYWRTcXVhcmVDb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBBbiBhcnJheSBvZiBpbmRpdmlkdWFsIFBhZFNxdWFyZVZpZXdzXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgcGFkU3F1YXJlVmlld3M6IG51bGxcblxuXG4gICAjIE1vdXNlIHRyYWNrZXIgd2hpY2ggY29uc3RhbnRseSB1cGRhdGVzIG1vdXNlIC8gdG91Y2ggcG9zaXRpb24gdmlhIC54IGFuZCAueVxuICAgIyBAdHlwZSB7T2JqZWN0fVxuXG4gICBtb3VzZVBvc2l0aW9uOiB4OiAwLCB5OiAwXG5cblxuXG5cblxuICAgIyBSZW5kZXIgdGhlIHZpZXcgYW5kIGFuZCBwYXJzZSB0aGUgY29sbGVjdGlvbiBpbnRvIGEgZGlzcGxheWFibGVcbiAgICMgaW5zdHJ1bWVudCAvIHBhZCB0YWJsZVxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgIyBAcmV0dXJuIHtMaXZlUGFkfVxuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJHBhZHNDb250YWluZXIgICAgICAgID0gQCRlbC5maW5kICcuY29udGFpbmVyLXBhZHMnXG4gICAgICBAJGluc3RydW1lbnRzQ29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLWluc3RydW1lbnRzJ1xuXG4gICAgICBAcmVuZGVyUGFkcygpXG4gICAgICBAcmVuZGVySW5zdHJ1bWVudHMoKVxuXG4gICAgICAjIFJlbmRlciBzcXVhcmVzIHRvIHRoZSBET01cbiAgICAgIF8uZWFjaCBAcGFkU3F1YXJlVmlld3MsIChwYWRTcXVhcmUpID0+XG4gICAgICAgICBpZCA9IHBhZFNxdWFyZS5tb2RlbC5nZXQgJ2lkJ1xuICAgICAgICAgQCRlbC5maW5kKFwiIyN7aWR9XCIpLmh0bWwgcGFkU3F1YXJlLnJlbmRlcigpLmVsXG5cbiAgICAgIEBzZXREcmFnQW5kRHJvcCgpXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG4gICAgICBAXG5cblxuXG4gICAjIFJlbmRlcnMgb3V0IHRoZSBpbnN0cnVtZW50IHBhZCBzcXVhcmVzXG5cbiAgIHJlbmRlclBhZHM6IC0+XG4gICAgICBAJHBhZHNDb250YWluZXIuaHRtbCBwYWRzVGVtcGxhdGUge1xuICAgICAgICAgcGFkVGFibGU6IEByZXR1cm5QYWRUYWJsZURhdGEoKVxuICAgICAgfVxuXG5cblxuICAgIyBSZW5kZXJzIG91dCB0aGUgaW5zdHJ1bWVudCByYWNrcyBieSBpdGVyYXRpbmcgdGhyb3VnaFxuICAgIyBlYWNoIG9mIHRoZSBpbnN0cnVtZW50IHNldHMgaW4gdGhlIEtpdENvbGxlY3Rpb25cblxuICAgcmVuZGVySW5zdHJ1bWVudHM6IC0+XG4gICAgICBAJGluc3RydW1lbnRzQ29udGFpbmVyLmh0bWwgaW5zdHJ1bWVudHNUZW1wbGF0ZSB7XG4gICAgICAgICBpbnN0cnVtZW50VGFibGU6IEByZXR1cm5JbnN0cnVtZW50VGFibGVEYXRhKClcbiAgICAgIH1cblxuXG5cbiAgICMgQWRkIGNvbGxlY3Rpb24gbGlzdGVuZXJzIHRvIGxpc3RlbiBmb3IgaW5zdHJ1bWVudCBkcm9wc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgICQoZG9jdW1lbnQpLm9uICdtb3VzZW1vdmUnLCBAb25Nb3VzZU1vdmVcblxuXG5cbiAgICMgUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICAkKGRvY3VtZW50KS5vZmYgJ21vdXNlbW92ZScsIEBvbk1vdXNlTW92ZVxuICAgICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIFRPRE86IFVwZGF0ZSBtb3VzZSBtb3ZlIHRvIHN1cHBvcnQgdG91Y2ggZXZlbnRzXG4gICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICAgb25Nb3VzZU1vdmU6IChldmVudCkgPT5cbiAgICAgIEBtb3VzZVBvc2l0aW9uID1cbiAgICAgICAgIHg6IGV2ZW50LnBhZ2VYXG4gICAgICAgICB5OiBldmVudC5wYWdlWVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBkcm9wIGNoYW5nZSBldmVudHMuICBDaGVja3MgdG8gc2VlIGlmIHRoZSBpbnN0cnVtZW50XG4gICAjIGNsYXNzTmFtZSBleGlzdHMgb24gdGhlIGVsZW1lbnQgYW5kLCBpZiBzbywgcmUtcmVuZGVycyB0aGVcbiAgICMgaW5zdHJ1bWVudCBhbmQgcGFkIHRhYmxlc1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gaW5zdHJ1bWVudE1vZGVsXG5cbiAgIG9uRHJvcHBlZENoYW5nZTogKGluc3RydW1lbnRNb2RlbCkgPT5cbiAgICAgIGluc3RydW1lbnRJZCAgICAgICA9IGluc3RydW1lbnRNb2RlbC5nZXQoJ2lkJylcbiAgICAgICRwYWRTcXVhcmUgICAgICAgICA9IEAkZWwuZmluZCBcIi4je2luc3RydW1lbnRJZH1cIlxuICAgICAgcGFkU3F1YXJlSWQgICAgICAgID0gJHBhZFNxdWFyZS5hdHRyICdpZCdcbiAgICAgIHBhZFNxdWFyZU1vZGVsICAgICA9IEBwYWRTcXVhcmVDb2xsZWN0aW9uLmZpbmRXaGVyZSB7IGlkOiBwYWRTcXVhcmVJZCB9XG5cbiAgICAgICMgQ2hlY2tzIGFnYWluc3QgdGVzdHMgYW5kIGRyYWdnYWJsZSwgd2hpY2ggaXMgbGVzcyB0ZXN0YWJsZVxuICAgICAgdW5sZXNzIHBhZFNxdWFyZU1vZGVsIGlzIHVuZGVmaW5lZFxuICAgICAgICAgcGFkU3F1YXJlTW9kZWwuc2V0ICdjdXJyZW50SW5zdHJ1bWVudCcsIGluc3RydW1lbnRNb2RlbFxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGRyb3AgZXZlbnRzLiAgUGFzc2VzIGluIHRoZSBpdGVtIGRyYWdnZWQsIHRoZSBpdGVtIGl0IHdhc1xuICAgIyBkcm9wcGVkIHVwb24sIGFuZCB0aGUgb3JpZ2luYWwgZXZlbnQgdG8gc3RvcmUgaW4gbWVtb3J5IGZvciB3aGVuXG4gICAjIHRoZSB1c2VyIHdhbnRzIHRvIFwiZGV0YWNoXCIgdGhlIGRyb3BwZWQgaXRlbSBhbmQgbW92ZSBpdCBiYWNrIGludG8gdGhlXG4gICAjIGluc3RydW1lbnQgcXVldWVcbiAgICNcbiAgICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gZHJhZ2dlZFxuICAgIyBAcGFyYW0ge0hUTUxEb21FbGVtZW50fSBkcm9wcGVkXG4gICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICAgb25JbnN0cnVtZW50RHJvcDogKGRyYWdnZWQsIGRyb3BwZWQsIGV2ZW50KSA9PlxuICAgICAgeyRkcmFnZ2VkLCAkZHJvcHBlZCwgaWQsIGluc3RydW1lbnRNb2RlbH0gPSBAcGFyc2VEcmFnZ2VkQW5kRHJvcHBlZCggZHJhZ2dlZCwgZHJvcHBlZCApXG5cbiAgICAgICRkcm9wcGVkLmFkZENsYXNzIGlkXG4gICAgICAkZHJvcHBlZC5hdHRyICdkYXRhLWluc3RydW1lbnQnLCBcIiN7aWR9XCJcblxuICAgICAgaW5zdHJ1bWVudE1vZGVsLnNldFxuICAgICAgICAgJ2Ryb3BwZWQnOiB0cnVlXG4gICAgICAgICAnZHJvcHBlZEV2ZW50JzogZXZlbnRcblxuICAgICAgXy5kZWZlciA9PlxuICAgICAgICAgQHJlbmRlckluc3RydW1lbnRzKClcbiAgICAgICAgIEBzZXREcmFnQW5kRHJvcCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Igc2l0dWF0aW9ucyB3aGVyZSB0aGUgdXNlciBhdHRlbXB0cyB0byBkcm9wIHRoZSBpbnN0cnVtZW50IGluY29ycmVjdGx5XG4gICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGRyYWdnZWRcbiAgICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gZHJvcHBlZFxuXG4gICBvblByZXZlbnRJbnN0cnVtZW50RHJvcDogKGRyYWdnZWQsIGRyb3BwZWQpID0+XG4gICAgICB7JGRyYWdnZWQsICRkcm9wcGVkLCBpZCwgaW5zdHJ1bWVudE1vZGVsfSA9IEBwYXJzZURyYWdnZWRBbmREcm9wcGVkKCBkcmFnZ2VkLCBkcm9wcGVkIClcblxuICAgICAgaW5zdHJ1bWVudE1vZGVsLnNldFxuICAgICAgICAgJ2Ryb3BwZWQnOiBmYWxzZVxuICAgICAgICAgJ2Ryb3BwZWRFdmVudCc6IG51bGxcblxuICAgICAgXy5kZWZlciA9PlxuICAgICAgICAgQHJlbmRlckluc3RydW1lbnRzKClcbiAgICAgICAgIEBzZXREcmFnQW5kRHJvcCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgcHJlc3MgYW5kIGhvbGQgZXZlbnRzLCBhcyBkaXNwYXRjaGVkIGZyb20gdGhlIHBhZCBzcXVhcmUgdGhlIHVzZXJcbiAgICMgaXMgaW50ZXJhY3Rpbmcgd2l0aC4gIFJlbGVhc2VzIHRoZSBpbnN0cnVtZW50IGFuZCBhbGxvd3MgdGhlIHVzZXIgdG8gZHJhZyB0b1xuICAgIyBhIG5ldyBzcXVhcmUgb3IgZGVwb3NpdCBpdCBiYWNrIHdpdGhpbiB0aGUgaW5zdHJ1bWVudCByYWNrXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcblxuICAgb25QYWRTcXVhcmVEcmFnZ2luZ1N0YXJ0OiAocGFyYW1zKSA9PlxuICAgICAge2luc3RydW1lbnRJZCwgJHBhZFNxdWFyZSwgb3JpZ2luYWxEcm9wcGVkRXZlbnR9ID0gcGFyYW1zXG5cbiAgICAgICRkcm9wcGVkSW5zdHJ1bWVudCA9ICQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaW5zdHJ1bWVudElkKSlcblxuICAgICAgIyBSZXR1cm4gdGhlIGRyYWdnYWJsZSBpbnN0YW5jZSBhc3NvY2lhdGVkIHdpdGggdGhlIHBhZCBzcXVhcmVcbiAgICAgIGRyYWdnYWJsZSA9IF8uZmluZCBAZHJhZ2dhYmxlLCAoZHJhZ2dhYmxlRWxlbWVudCkgPT5cbiAgICAgICAgIGlmICQoZHJhZ2dhYmxlRWxlbWVudC5fZXZlbnRUYXJnZXQpLmF0dHIoJ2lkJykgaXMgJGRyb3BwZWRJbnN0cnVtZW50LmF0dHIoJ2lkJylcbiAgICAgICAgICAgIHJldHVybiBkcmFnZ2FibGVFbGVtZW50XG5cbiAgICAgIG9mZnNldCA9ICRkcm9wcGVkSW5zdHJ1bWVudC5vZmZzZXQoKVxuXG4gICAgICAjIFNpbGVudGx5IHVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIGluc3RydW1lbnRcbiAgICAgICRkcm9wcGVkSW5zdHJ1bWVudC5jc3MgJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJ1xuXG4gICAgICAjIFRPRE86IElmIEJvdW5kcyBhcmUgc2V0IG9uIHRoZSBvcmlnaW5hbCBkcmFnZ2FibGUgdGhlbiB0aGVyZSdzIGEgd2VpcmRcbiAgICAgICMgYm91bmRyeSBvZmZzZXQgdGhhdCBuZWVkcyB0byBiZSBzb2x2ZWQuICBSZXNldCBpbiBEcmFnZ2FibGUgY29uc3RydWN0b3JcblxuICAgICAgVHdlZW5NYXguc2V0ICRkcm9wcGVkSW5zdHJ1bWVudCxcbiAgICAgICAgIGxlZnQ6IEBtb3VzZVBvc2l0aW9uLnggLSAoJGRyb3BwZWRJbnN0cnVtZW50LndpZHRoKCkgICogLjUpXG4gICAgICAgICB0b3A6ICBAbW91c2VQb3NpdGlvbi55IC0gKCRkcm9wcGVkSW5zdHJ1bWVudC5oZWlnaHQoKSAqIC41KVxuXG4gICAgICAjIFJlbmFibGUgZHJhZ2dpbmdcbiAgICAgIGRyYWdnYWJsZS5zdGFydERyYWcgb3JpZ2luYWxEcm9wcGVkRXZlbnRcbiAgICAgIGRyYWdnYWJsZS51cGRhdGUodHJ1ZSlcblxuICAgICAgIyBBbmQgc2hvdyBpdFxuICAgICAgJGRyb3BwZWRJbnN0cnVtZW50LnNob3coKVxuXG5cblxuXG5cblxuXG4gICAjIFBSSVZBVEUgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBTZXRzIHVwIGRyYWcgYW5kIGRyb3Agb24gZWFjaCBvZiB0aGUgaW5zdHJ1bWVudHMgcmVuZGVyZWQgZnJvbSB0aGUgS2l0Q29sbGVjdGlvblxuICAgIyBBZGRzIGhpZ2hsaWdodHMgYW5kIGRldGVybWluZXMgaGl0LXRlc3RzLCBvciBkZWZlcnMgdG8gb25QcmV2ZW50SW5zdHJ1bWVudERyb3BcbiAgICMgaW4gc2l0dWF0aW9ucyB3aGVyZSBkcm9wcGluZyBpc24ndCBwb3NzaWJsZVxuXG4gICBzZXREcmFnQW5kRHJvcDogLT5cbiAgICAgIHNlbGYgPSBAXG5cbiAgICAgIEAkaW5zdHJ1bWVudCA9IEAkZWwuZmluZCAnLmluc3RydW1lbnQnXG4gICAgICAkZHJvcHBhYmxlcyAgPSBAJGVsLmZpbmQgJy5jb250YWluZXItcGFkJ1xuXG4gICAgICBAZHJhZ2dhYmxlID0gRHJhZ2dhYmxlLmNyZWF0ZSBAJGluc3RydW1lbnQsXG4gICAgICAgICAjYm91bmRzOiB3aW5kb3dcblxuXG4gICAgICAgICAjIEhhbmRsZXIgZm9yIGRyYWcgZXZlbnRzLiAgSXRlcmF0ZXMgb3ZlciBhbGwgZHJvcHBhYmxlIHNxdWFyZSBhcmVhc1xuICAgICAgICAgIyBhbmQgY2hlY2tzIHRvIHNlZSBpZiBhbiBpbnN0cnVtZW50IGN1cnJlbnRseSBvY2N1cGllcyB0aGUgcG9zaXRpb25cblxuICAgICAgICAgb25EcmFnOiAoZXZlbnQpIC0+XG5cbiAgICAgICAgICAgIGkgPSAkZHJvcHBhYmxlcy5sZW5ndGhcblxuICAgICAgICAgICAgd2hpbGUoIC0taSA+IC0xIClcblxuICAgICAgICAgICAgICAgaWYgQGhpdFRlc3QoJGRyb3BwYWJsZXNbaV0sICc1MCUnKVxuXG4gICAgICAgICAgICAgICAgICBpbnN0cnVtZW50ID0gJCgkZHJvcHBhYmxlc1tpXSkuYXR0cignZGF0YS1pbnN0cnVtZW50JylcblxuICAgICAgICAgICAgICAgICAgIyBQcmV2ZW50IGRyb3BwYWJsZXMgb24gc3F1YXJlcyB0aGF0IGFscmVhZHkgaGF2ZSBpbnN0cnVtZW50c1xuICAgICAgICAgICAgICAgICAgaWYgaW5zdHJ1bWVudCBpcyBudWxsIG9yIGluc3RydW1lbnQgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAkKCRkcm9wcGFibGVzW2ldKS5hZGRDbGFzcyAnaGlnaGxpZ2h0J1xuXG4gICAgICAgICAgICAgICAjIFJlbW92ZSBpZiBub3Qgb3ZlciBzcXVhcmVcbiAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICQoJGRyb3BwYWJsZXNbaV0pLnJlbW92ZUNsYXNzICdoaWdobGlnaHQnXG5cblxuICAgICAgICAgIyBDaGVjayB0byBzZWUgaWYgaW5zdHJ1bWVudCBpcyBkcm9wcGFibGU7IG90aGVyd2lzZVxuICAgICAgICAgIyB0cmlnZ2VyIGEgXCJjYW50IGRyb3BcIiBhbmltYXRpb25cblxuICAgICAgICAgb25EcmFnRW5kOiAoZXZlbnQpIC0+XG5cbiAgICAgICAgICAgIGkgPSAkZHJvcHBhYmxlcy5sZW5ndGhcblxuICAgICAgICAgICAgZHJvcHBlZFByb3Blcmx5ID0gZmFsc2VcblxuICAgICAgICAgICAgd2hpbGUoIC0taSA+IC0xIClcblxuICAgICAgICAgICAgICAgaWYgQGhpdFRlc3QoJGRyb3BwYWJsZXNbaV0sICc1MCUnKVxuICAgICAgICAgICAgICAgICAgaW5zdHJ1bWVudCA9ICQoJGRyb3BwYWJsZXNbaV0pLmF0dHIoJ2RhdGEtaW5zdHJ1bWVudCcpXG5cbiAgICAgICAgICAgICAgICAgICMgUHJldmVudCBkcm9wcGFibGVzIG9uIHNxdWFyZXMgdGhhdCBhbHJlYWR5IGhhdmUgaW5zdHJ1bWVudHNcbiAgICAgICAgICAgICAgICAgIGlmIGluc3RydW1lbnQgaXMgbnVsbCBvciBpbnN0cnVtZW50IGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgZHJvcHBlZFByb3Blcmx5ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgc2VsZi5vbkluc3RydW1lbnREcm9wKCB0aGlzLnRhcmdldCwgJGRyb3BwYWJsZXNbaV0sIGV2ZW50IClcblxuXG4gICAgICAgICAgICAgICAgICAjIFNlbmQgaW5zdHJ1bWVudCBiYWNrXG4gICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICBzZWxmLm9uUHJldmVudEluc3RydW1lbnREcm9wKCB0aGlzLnRhcmdldCwgJGRyb3BwYWJsZXNbaV0gKVxuXG4gICAgICAgICAgICAgICAjIFNlbmQgaW5zdHJ1bWVudCBiYWNrXG4gICAgICAgICAgICAgICBpZiBkcm9wcGVkUHJvcGVybHkgaXMgZmFsc2VcbiAgICAgICAgICAgICAgICAgIHNlbGYub25QcmV2ZW50SW5zdHJ1bWVudERyb3AoIHRoaXMudGFyZ2V0LCAkZHJvcHBhYmxlc1tpXSApXG5cblxuXG5cbiAgICMgSGVscGVyIG1ldGhvZCBmb3IgcGFyc2luZyB0aGUgZHJhZyBhbmQgZHJvcCBldmVudCByZXNwb25zZXNcbiAgICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gZHJhZ2dlZFxuICAgIyBAcGFyYW0ge0hUTUxEb21FbGVtZW50fSBkcm9wcGVkXG5cbiAgIHBhcnNlRHJhZ2dlZEFuZERyb3BwZWQ6IChkcmFnZ2VkLCBkcm9wcGVkKSA9PlxuICAgICAgJGRyYWdnZWQgPSAkKGRyYWdnZWQpXG4gICAgICAkZHJvcHBlZCA9ICQoZHJvcHBlZClcbiAgICAgIGlkID0gJGRyYWdnZWQuYXR0ciAnaWQnXG4gICAgICBpbnN0cnVtZW50TW9kZWwgPSBAa2l0Q29sbGVjdGlvbi5maW5kSW5zdHJ1bWVudE1vZGVsIGlkXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgICAkZHJhZ2dlZDogJGRyYWdnZWRcbiAgICAgICAgICRkcm9wcGVkOiAkZHJvcHBlZFxuICAgICAgICAgaWQ6IGlkXG4gICAgICAgICBpbnN0cnVtZW50TW9kZWw6IGluc3RydW1lbnRNb2RlbFxuICAgICAgfVxuXG5cblxuXG4gICAjIFJlbmRlciBvdXQgdGhlIHRhYmxlIGZvciB0aGUgbGl2ZSBwYWQgZ3JpZCBhbmQgcHVzaFxuICAgIyBpdCBpbnRvIGFuIGFycmF5IG9mIHRhYmxlIHJvd3MgYW5kIHRkc1xuICAgIyBAcmV0dXJuIHtPYmplY3R9XG5cbiAgIHJldHVyblBhZFRhYmxlRGF0YTogLT5cblxuICAgICAgQHBhZFNxdWFyZUNvbGxlY3Rpb24gPSBuZXcgUGFkU3F1YXJlQ29sbGVjdGlvbigpXG4gICAgICBAcGFkU3F1YXJlVmlld3MgPSBbXVxuICAgICAgcGFkVGFibGUgPSB7fVxuICAgICAgcm93cyA9IFtdXG4gICAgICBpdGVyYXRvciA9IDBcblxuICAgICAgIyBSZW5kZXIgb3V0IHJvd3NcbiAgICAgIF8oNCkudGltZXMgKGluZGV4KSA9PlxuICAgICAgICAgdGRzICA9IFtdXG5cbiAgICAgICAgICMgUmVuZGVyIG91dCBjb2x1bW5zXG4gICAgICAgICBfKDQpLnRpbWVzIChpbmRleCkgPT5cblxuICAgICAgICAgICAgIyBJbnN0YW50aWF0ZSBlYWNoIHBhZCB2aWV3IGFuZCB0aWUgdGhlIGlkXG4gICAgICAgICAgICAjIHRvIHRoZSBET00gZWxlbWVudFxuXG4gICAgICAgICAgICBtb2RlbCA9IG5ldyBQYWRTcXVhcmVNb2RlbFxuICAgICAgICAgICAgICAga2V5Y29kZTogQEtFWU1BUFtpdGVyYXRvcl1cblxuICAgICAgICAgICAgcGFkU3F1YXJlID0gbmV3IFBhZFNxdWFyZVxuICAgICAgICAgICAgICAgbW9kZWw6IG1vZGVsXG4gICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICAgICAgICBAcGFkU3F1YXJlQ29sbGVjdGlvbi5hZGQgbW9kZWxcbiAgICAgICAgICAgIEBwYWRTcXVhcmVWaWV3cy5wdXNoIHBhZFNxdWFyZVxuICAgICAgICAgICAgaXRlcmF0b3IrK1xuXG4gICAgICAgICAgICAjIEJlZ2luIGxpc3RlbmluZyB0byBkcmFnIC8gcmVsZWFzZSAvIHJlbW92ZSBldmVudHMgZnJvbVxuICAgICAgICAgICAgIyBlYWNoIHBhZCBzcXVhcmUgYW5kIHJlLXJlbmRlciBwYWQgc3F1YXJlc1xuXG4gICAgICAgICAgICBAbGlzdGVuVG8gcGFkU3F1YXJlLCBBcHBFdmVudC5DSEFOR0VfRFJBR0dJTkcsIEBvblBhZFNxdWFyZURyYWdnaW5nU3RhcnRcblxuXG4gICAgICAgICAgICB0ZHMucHVzaCB7XG4gICAgICAgICAgICAgICAnaWQnOiBwYWRTcXVhcmUubW9kZWwuZ2V0KCdpZCcpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgIHJvd3MucHVzaCB7XG4gICAgICAgICAgICAnaWQnOiBcInBhZC1yb3ctI3tpbmRleH1cIlxuICAgICAgICAgICAgJ3Rkcyc6IHRkc1xuICAgICAgICAgfVxuXG4gICAgICBwYWRUYWJsZS5yb3dzID0gcm93c1xuXG4gICAgICBwYWRUYWJsZVxuXG5cblxuXG4gICAjIFJlbmRlciBvdXQgdGhlIGluc3RydW1lbnQgdGFibGUgYW5kIHB1c2ggaXQgaW50b1xuICAgIyBhbmQgYXJyYXkgb2YgaW5kaXZpZHVhbCBpbnN0cnVtZW50c1xuICAgIyBAcmV0dXJuIHtPYmplY3R9XG5cbiAgIHJldHVybkluc3RydW1lbnRUYWJsZURhdGE6IC0+XG4gICAgICBpbnN0cnVtZW50VGFibGUgPSBAa2l0Q29sbGVjdGlvbi5tYXAgKGtpdCkgPT5cbiAgICAgICAgIGluc3RydW1lbnRDb2xsZWN0aW9uID0ga2l0LmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICAgICAjIEJlZ2luIGxpc3RlbmluZyB0byBkcm9wIGV2ZW50cyBmb3IgZWFjaCBpbnN0cnVtZW50XG4gICAgICAgICAjIGluIHRoZSBJbnN0cnVtZW50IGNvbGxlY3Rpb25cblxuICAgICAgICAgQGxpc3RlblRvIGluc3RydW1lbnRDb2xsZWN0aW9uLCBBcHBFdmVudC5DSEFOR0VfRFJPUFBFRCwgQG9uRHJvcHBlZENoYW5nZVxuXG4gICAgICAgICBpbnN0cnVtZW50cyA9IGluc3RydW1lbnRDb2xsZWN0aW9uLm1hcCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgICAgICAgIGluc3RydW1lbnQudG9KU09OKClcblxuICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICdsYWJlbCc6ICAgICAgIGtpdC5nZXQgJ2xhYmVsJ1xuICAgICAgICAgICAgJ2luc3RydW1lbnRzJzogaW5zdHJ1bWVudHNcbiAgICAgICAgIH1cblxuICAgICAgaW5zdHJ1bWVudFRhYmxlXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IExpdmVQYWRcbiIsIiMjIypcbiAqIExpdmUgTVBDIFwicGFkXCIgY29tcG9uZW50XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI0LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBFdmVudCAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGFkLXNxdWFyZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgUGFkU3F1YXJlIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIGRlbGF5IHRpbWUgYmVmb3JlIGRyYWcgZnVuY3Rpb25hbGl0eSBpcyBpbml0aWFsaXplZFxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBEUkFHX1RSSUdHRVJfREVMQVk6IDEwMDBcblxuXG4gICAjIFRoZSB0YWcgdG8gYmUgcmVuZGVyZWQgdG8gdGhlIERPTVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICB0YWdOYW1lOiAnZGl2J1xuXG5cbiAgICMgVGhlIGNsYXNzbmFtZSBmb3IgdGhlIFBhZCBTcXVhcmVcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAncGFkLXNxdWFyZSdcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgTW9kZWwgd2hpY2ggdHJhY2tzIHN0YXRlIG9mIHNxdWFyZSBhbmQgaW5zdHJ1bWVudHNcbiAgICMgQHR5cGUge1BhZFNxdWFyZU1vZGVsfVxuXG4gICBtb2RlbDogbnVsbFxuXG5cbiAgICMgVGhlIGN1cnJlbnQgaWNvbiBjbGFzcyBhcyBhcHBsaWVkIHRvIHRoZSBzcXVhcmVcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY3VycmVudEljb246IG51bGxcblxuXG4gICAjIFRoZSBhdWRpbyBwbGF5YmFjayBjb21wb25lbnRcbiAgICMgQHR5cGUge0hvd2x9XG5cbiAgIGF1ZGlvUGxheWJhY2s6IG51bGxcblxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoc3RhcnQnOiAnb25QcmVzcydcbiAgICAgICd0b3VjaGVuZCc6ICAgJ29uUmVsZWFzZSdcblxuXG5cblxuICAgIyBSZW5kZXJzIG91dCBpbmRpdmlkdWFsIHBhZCBzcXVhcmVzXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkaWNvbkNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1pY29uJ1xuICAgICAgQCRpY29uICAgICAgICAgID0gQCRpY29uQ29udGFpbmVyLmZpbmQgJy5pY29uJ1xuXG4gICAgICBAXG5cblxuXG4gICAjIFJlbW92ZXMgdGhlIHBhZCBzcXVhcmUgZnJvbSB0aGUgZG9tIGFuZCBjbGVhcnNcbiAgICMgb3V0IHByZS1zZXQgb3IgdXNlci1zZXQgcHJvcGVydGllc1xuXG4gICByZW1vdmU6IC0+XG4gICAgICBAcmVtb3ZlU291bmRBbmRDbGVhclBhZCgpXG4gICAgICBzdXBlcigpXG5cblxuXG4gICAjIEFkZCBsaXN0ZW5lcnMgcmVsYXRlZCB0byBkcmFnZ2luZywgZHJvcHBpbmcgYW5kIGNoYW5nZXNcbiAgICMgdG8gaW5zdHJ1bWVudHMuXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBtb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1RSSUdHRVIsICAgIEBvblRyaWdnZXJDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9EUkFHR0lORywgICBAb25EcmFnZ2luZ0NoYW5nZVxuICAgICAgQGxpc3RlblRvIEBtb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0RST1BQRUQsICAgIEBvbkRyb3BwZWRDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9JTlNUUlVNRU5ULCBAb25JbnN0cnVtZW50Q2hhbmdlXG5cblxuXG5cbiAgICMgVXBkYXRlcyB0aGUgdmlzdWFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwYWQgc3F1YXJlXG5cbiAgIHVwZGF0ZUluc3RydW1lbnRDbGFzczogLT5cbiAgICAgIGluc3RydW1lbnQgPSBAbW9kZWwuZ2V0ICdjdXJyZW50SW5zdHJ1bWVudCdcbiAgICAgIEAkZWwucGFyZW50KCkuYWRkQ2xhc3MgaW5zdHJ1bWVudC5nZXQgJ2lkJ1xuXG5cblxuXG4gICAjIFJlbmRlcnMgb3V0IHRoZSBpbml0aWFsIGljb24gYW5kIHNldHMgdGhlIGlzbnRydW1lbnRcblxuICAgcmVuZGVySWNvbjogLT5cbiAgICAgIGlmIEAkaWNvbi5oYXNDbGFzcyBAY3VycmVudEljb25cbiAgICAgICAgIEAkaWNvbi5yZW1vdmVDbGFzcyBAY3VycmVudEljb25cblxuICAgICAgaW5zdHJ1bWVudCA9IEBtb2RlbC5nZXQgJ2N1cnJlbnRJbnN0cnVtZW50J1xuXG4gICAgICB1bmxlc3MgaW5zdHJ1bWVudCBpcyBudWxsXG4gICAgICAgICBAY3VycmVudEljb24gPSBpbnN0cnVtZW50LmdldCAnaWNvbidcbiAgICAgICAgIEAkaWNvbi5hZGRDbGFzcyBAY3VycmVudEljb25cbiAgICAgICAgIEAkaWNvbi50ZXh0IGluc3RydW1lbnQuZ2V0ICdsYWJlbCdcblxuXG5cblxuICAgIyBTZXRzIHRoZSBjdXJyZW50IHNvdW5kIGFuZCBlbmFibGVzIGF1ZGlvIHBsYXliYWNrXG5cbiAgIHNldFNvdW5kOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2s/LnVubG9hZCgpXG5cbiAgICAgIGluc3RydW1lbnQgPSBAbW9kZWwuZ2V0ICdjdXJyZW50SW5zdHJ1bWVudCdcblxuICAgICAgdW5sZXNzIGluc3RydW1lbnQgaXMgbnVsbFxuICAgICAgICAgYXVkaW9TcmMgPSBpbnN0cnVtZW50LmdldCAnc3JjJ1xuXG4gICAgICAgICAjIFRPRE86IFRlc3QgbWV0aG9kc1xuICAgICAgICAgaWYgd2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZigndGVzdCcpIGlzbnQgLTEgdGhlbiBhdWRpb1NyYyA9ICcnXG5cbiAgICAgICAgIEBhdWRpb1BsYXliYWNrID0gbmV3IEhvd2xcbiAgICAgICAgICAgIHZvbHVtZTogQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubWVkaXVtXG4gICAgICAgICAgICB1cmxzOiBbYXVkaW9TcmNdXG4gICAgICAgICAgICBvbmVuZDogQG9uU291bmRFbmRcblxuXG5cblxuICAgIyBUcmlnZ2VycyBhdWRpbyBwbGF5YmFja1xuXG4gICBwbGF5U291bmQ6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjaz8ucGxheSgpXG4gICAgICBAbW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG5cblxuICAgIyBHZW5lcmljIHJlbW92ZSBhbmQgY2xlYXIgd2hpY2ggaXMgdHJpZ2dlcmVkIHdoZW4gYSB1c2VyXG4gICAjIGRyYWdzIHRoZSBpbnN0cnVtZW50IG9mZiBvZiB0aGUgcGFkIG9yIHRoZSB2aWV3IGlzIGRlc3Ryb3llZFxuXG4gICByZW1vdmVTb3VuZEFuZENsZWFyUGFkOiAtPlxuICAgICAgaWYgQG1vZGVsLmdldCgnY3VycmVudEluc3RydW1lbnQnKSBpcyBudWxsXG4gICAgICAgICByZXR1cm5cblxuICAgICAgQGF1ZGlvUGxheWJhY2s/LnVubG9hZCgpXG4gICAgICBAYXVkaW9QbGF5YmFjayA9IG51bGxcblxuICAgICAgY3VycmVudEluc3RydW1lbnQgPSBAbW9kZWwuZ2V0ICdjdXJyZW50SW5zdHJ1bWVudCdcblxuICAgICAgaWQgICA9IGN1cnJlbnRJbnN0cnVtZW50LmdldCAnaWQnXG4gICAgICBpY29uID0gY3VycmVudEluc3RydW1lbnQuZ2V0ICdpY29uJ1xuXG4gICAgICBAJGVsLnBhcmVudCgpLnJlbW92ZUF0dHIgJ2RhdGEtaW5zdHJ1bWVudCdcbiAgICAgIEAkZWwucGFyZW50KCkucmVtb3ZlQ2xhc3MgaWRcbiAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgaWRcbiAgICAgIEAkaWNvbi5yZW1vdmVDbGFzcyBpY29uXG4gICAgICBAJGljb24udGV4dCAnJ1xuXG4gICAgICBfLmRlZmVyID0+XG4gICAgICAgICBAbW9kZWwuc2V0XG4gICAgICAgICAgICAnZHJhZ2dpbmcnOiBmYWxzZVxuICAgICAgICAgICAgJ2Ryb3BwZWQnOiBmYWxzZVxuXG4gICAgICAgICBjdXJyZW50SW5zdHJ1bWVudC5zZXRcbiAgICAgICAgICAgICdkcm9wcGVkJzogZmFsc2VcbiAgICAgICAgICAgICdkcm9wcGVkRXZlbnQnOiBudWxsXG5cbiAgICAgICAgIEBtb2RlbC5zZXQgJ2N1cnJlbnRJbnN0cnVtZW50JywgbnVsbFxuXG5cblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHByZXNzIGV2ZW50cywgd2hpY2gsIHdoZW4gaGVsZFxuICAgIyB0cmlnZ2VycyBhIFwiZHJhZ1wiIGV2ZW50IG9uIHRoZSBtb2RlbFxuICAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgIG9uUHJlc3M6IChldmVudCkgPT5cbiAgICAgIEBtb2RlbC5zZXQgJ3RyaWdnZXInLCB0cnVlXG5cbiAgICAgIEBkcmFnVGltZW91dCA9IHNldFRpbWVvdXQgPT5cbiAgICAgICAgIEBtb2RlbC5zZXQgJ2RyYWdnaW5nJywgdHJ1ZVxuXG4gICAgICAsIEBEUkFHX1RSSUdHRVJfREVMQVlcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciByZWxlYXNlIGV2ZW50cyB3aGljaCBjbGVhcnNcbiAgICMgZHJhZyB3aGV0aGVyIGRyYWcgd2FzIGluaXRpYXRlZCBvciBub3RcbiAgICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gICBvblJlbGVhc2U6IChldmVudCkgPT5cbiAgICAgIGNsZWFyVGltZW91dCBAZHJhZ1RpbWVvdXRcbiAgICAgIEBtb2RlbC5zZXQgJ2RyYWdnaW5nJywgZmFsc2VcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBkcmFnIGV2ZW50cy5cbiAgICMgVE9ETzogRG8gd2UgbmVlZCB0aGlzXG4gICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICAgb25EcmFnOiAoZXZlbnQpIC0+XG4gICAgICBAbW9kZWwuc2V0ICdkcmFnZ2luZycsIHRydWVcblxuXG5cblxuICAgIyBTZXQgZHJvcHBlZCBzdGF0dXMgc28gdGhhdCBiaS1kaXJlY3Rpb25hbCBjaGFuZ2UgY2FuXG4gICAjIGJlIHRyaWdnZXJlZCBmcm9tIHRoZSBMaXZlUGFkIGtpdCByZW5kZXJcbiAgICMgQHBhcmFtIHtOdW1iZXJ9IGlkXG5cbiAgIG9uRHJvcDogKGlkKSAtPlxuICAgICAgaW5zdHJ1bWVudE1vZGVsID0gQGNvbGxlY3Rpb24uZmluZEluc3RydW1lbnRNb2RlbCBpZFxuXG4gICAgICBpbnN0cnVtZW50TW9kZWwuc2V0ICdkcm9wcGVkJywgdHJ1ZVxuXG4gICAgICBAbW9kZWwuc2V0XG4gICAgICAgICAnZHJhZ2dpbmcnOiBmYWxzZVxuICAgICAgICAgJ2Ryb3BwZWQnOiB0cnVlXG4gICAgICAgICAnY3VycmVudEluc3RydW1lbnQnOiBpbnN0cnVtZW50TW9kZWxcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciAnY2hhbmdlOmRyYWcnIG1vZGVsIGV2ZW50cywgd2hpY2hcbiAgICMgc2V0cyB1cCBzZXF1ZW5jZSBmb3IgZHJhZ2dpbmcgb24gYW5kIG9mZiBvZlxuICAgIyB0aGUgcGFkIHNxdWFyZVxuICAgIyBAcGFyYW0ge1BhZFNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gICBvbkRyYWdnaW5nQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBkcmFnZ2luZyA9IG1vZGVsLmNoYW5nZWQuZHJhZ2dpbmdcblxuICAgICAgaWYgZHJhZ2dpbmcgaXMgdHJ1ZVxuXG4gICAgICAgICBpbnN0cnVtZW50SWQgPSBAJGVsLnBhcmVudCgpLmF0dHIgJ2RhdGEtaW5zdHJ1bWVudCdcblxuICAgICAgICAgY3VycmVudEluc3RydW1lbnQgICAgPSBAbW9kZWwuZ2V0KCdjdXJyZW50SW5zdHJ1bWVudCcpXG4gICAgICAgICBvcmlnaW5hbERyb3BwZWRFdmVudCA9IGN1cnJlbnRJbnN0cnVtZW50LmdldCAnZHJvcHBlZEV2ZW50J1xuXG4gICAgICAgICBAbW9kZWwuc2V0ICdkcm9wcGVkJywgZmFsc2VcbiAgICAgICAgIGN1cnJlbnRJbnN0cnVtZW50LnNldCAnZHJvcHBlZCcsIGZhbHNlXG5cbiAgICAgICAgICMgRGlzcGF0Y2ggZHJhZyBzdGFydCBldmVudCBiYWNrIHRvIExpdmVQYWRcbiAgICAgICAgIEB0cmlnZ2VyIEFwcEV2ZW50LkNIQU5HRV9EUkFHR0lORywge1xuICAgICAgICAgICAgJ2luc3RydW1lbnRJZCc6IGluc3RydW1lbnRJZFxuICAgICAgICAgICAgJyRwYWRTcXVhcmUnOiBAJGVsLnBhcmVudCgpXG4gICAgICAgICAgICAnb3JpZ2luYWxEcm9wcGVkRXZlbnQnOiBvcmlnaW5hbERyb3BwZWRFdmVudFxuICAgICAgICAgfVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGRyb3AgY2hhbmdlIGV2ZW50cywgd2hpY2ggY2hlY2tzIHRvIHNlZVxuICAgIyBpZiBpdHMgYmVlbiBkcm9wcGVkIG9mZiB0aGUgc3F1YXJlIGFtZCBjbGVhcnNcbiAgICMgQHBhcmFtIHtQYWRTcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25Ecm9wcGVkQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBkcm9wcGVkID0gbW9kZWwuY2hhbmdlZC5kcm9wcGVkXG5cbiAgICAgIHVubGVzcyBkcm9wcGVkXG4gICAgICAgICBAcmVtb3ZlU291bmRBbmRDbGVhclBhZCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgJ2NoYW5nZTp0cmlnZ2VyJyBldmVudHMsIHdoaWNoIHRyaWdnZXJzXG4gICAjIHNvdW5kIHBsYXliYWNrIHdoaWNoIHRoZW4gcmVzZXRzIGl0IHRvIGZhbHNlIG9uIGNvbXBsZXRcbiAgICMgQHBhcmFtIHtQYWRTcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25UcmlnZ2VyQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICB0cmlnZ2VyID0gbW9kZWwuY2hhbmdlZC50cmlnZ2VyXG5cbiAgICAgIGlmIHRyaWdnZXJcbiAgICAgICAgIEBwbGF5U291bmQoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yICdjaGFuZ2U6Y3VycmVudEluc3RydW1lbnQnIGV2ZW50cywgd2hpY2ggdXBkYXRlc1xuICAgIyB0aGUgcGFkIHNxdWFyZSB3aXRoIHRoZSBhcHByb3ByaWF0ZSBkYXRhXG4gICAjIEBwYXJhbSB7UGFkU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uSW5zdHJ1bWVudENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgaW5zdHJ1bWVudCA9IG1vZGVsLmNoYW5nZWQuY3VycmVudEluc3RydW1lbnRcblxuICAgICAgdW5sZXNzIGluc3RydW1lbnQgaXMgbnVsbCBvciBpbnN0cnVtZW50IGlzIHVuZGVmaW5lZFxuICAgICAgICAgQHVwZGF0ZUluc3RydW1lbnRDbGFzcygpXG4gICAgICAgICBAcmVuZGVySWNvbigpXG4gICAgICAgICBAc2V0U291bmQoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHNvdW5kIGVuZCBldmVudHMsIHdoaWNoIHJlc2V0cyB0aGUgc291bmQgcGxheWJhY2tcblxuICAgb25Tb3VuZEVuZDogPT5cbiAgICAgIEBtb2RlbC5zZXQgJ3RyaWdnZXInLCBmYWxzZVxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFkU3F1YXJlIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIHN0YWNrMSwgc2VsZj10aGlzLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8ZGl2IGNsYXNzPSdjb250YWluZXIta2l0Jz5cXG5cdFx0PGgzPlxcblx0XHRcdDxiPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI8L2I+XFxuXHRcdDwvaDM+XFxuXFxuXHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsIGRlcHRoMC5pbnN0cnVtZW50cywge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDIsIHByb2dyYW0yLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC9kaXY+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0yKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPSdpbnN0cnVtZW50IFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCBkZXB0aDAuZHJvcHBlZCwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDMsIHByb2dyYW0zLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIicgaWQ9XFxcIlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5pZCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWQ7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiPlxcblx0XHRcdFx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdDwvZGl2Plxcblx0XHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCIgaGlkZGVuIFwiO1xuICB9XG5cbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaW5zdHJ1bWVudFRhYmxlLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IHJldHVybiBzdGFjazE7IH1cbiAgZWxzZSB7IHJldHVybiAnJzsgfVxuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPHRhYmxlIGNsYXNzPSdjb250YWluZXItcGFkcyc+XFxuXFxuPC90YWJsZT5cXG5cXG48ZGl2IGNsYXNzPSdjb250YWluZXItaW5zdHJ1bWVudHMnPlxcblxcbjwvZGl2PlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPSdrZXktY29kZSc+XFxuXHRcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMua2V5Y29kZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAua2V5Y29kZTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci1pY29uJz5cXG5cdDxkaXYgY2xhc3M9J2ljb24nPlxcblxcblx0PC9kaXY+XFxuPC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc3RhY2syLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDx0cj5cXG5cdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgZGVwdGgwLnRkcywge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDIsIHByb2dyYW0yLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC90cj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTIoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdDx0ZCBjbGFzcz0nY29udGFpbmVyLXBhZCcgaWQ9XFxcIlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5pZCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWQ7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiPlxcblxcblx0XHRcdDwvdGQ+XFxuXHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgc3RhY2syID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCAoKHN0YWNrMSA9IGRlcHRoMC5wYWRUYWJsZSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5yb3dzKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIiMjIypcbiAqIEluZGl2aWR1YWwgc2VxdWVuY2VyIHRyYWNrc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBFdmVudCAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGF0dGVybi1zcXVhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmUgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgY29udGFpbmVyIGNsYXNzbmFtZVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdwYXR0ZXJuLXNxdWFyZSdcblxuXG4gICAjIFRoZSBET00gdGFnIGFuZW1cbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdGFnTmFtZTogJ3RkJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBUaGUgYXVkaW8gcGxheWJhY2sgaW5zdGFuY2UgKEhvd2xlcilcbiAgICMgQHR5cGUge0hvd2x9XG5cbiAgIGF1ZGlvUGxheWJhY2s6IG51bGxcblxuXG4gICAjIFRoZSBtb2RlbCB3aGljaCBjb250cm9scyB2b2x1bWUsIHBsYXliYWNrLCBldGNcbiAgICMgQHR5cGUge1BhdHRlcm5TcXVhcmVNb2RlbH1cblxuICAgcGF0dGVyblNxdWFyZU1vZGVsOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCc6ICdvbkNsaWNrJ1xuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGFuZCBpbnN0YW50aWF0ZXMgdGhlIGhvd2xlciBhdWRpbyBlbmdpbmVcbiAgICMgQHBhdHRlcm5TcXVhcmVNb2RlbCB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIGF1ZGlvU3JjID0gQHBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ2luc3RydW1lbnQnKS5nZXQgJ3NyYydcblxuICAgICAgIyBUT0RPOiBUZXN0IG1ldGhvZHNcbiAgICAgIGlmIHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Rlc3QnKSBpc250IC0xIHRoZW4gYXVkaW9TcmMgPSAnJ1xuXG4gICAgICBAYXVkaW9QbGF5YmFjayA9IG5ldyBIb3dsXG4gICAgICAgICB2b2x1bWU6IEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLmxvd1xuICAgICAgICAgdXJsczogW2F1ZGlvU3JjXVxuICAgICAgICAgb25lbmQ6IEBvblNvdW5kRW5kXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW1vdmUgdGhlIHZpZXcgYW5kIGRlc3Ryb3kgdGhlIGF1ZGlvIHBsYXliYWNrXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIEBhdWRpb1BsYXliYWNrLnVubG9hZCgpXG4gICAgICBzdXBlcigpXG5cblxuXG5cbiAgICMgQWRkcyBldmVudCBsaXN0ZW5lcnMgYW5kIGJlZ2lucyBsaXN0ZW5pbmcgZm9yIHZlbG9jaXR5LCBhY3Rpdml0eSBhbmQgdHJpZ2dlcnNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1ZFTE9DSVRZLCBAb25WZWxvY2l0eUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9BQ1RJVkUsICAgQG9uQWN0aXZlQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1RSSUdHRVIsICBAb25UcmlnZ2VyQ2hhbmdlXG5cblxuXG5cbiAgICMgRW5hYmxlIHBsYXliYWNrIG9mIHRoZSBhdWRpbyBzcXVhcmVcblxuICAgZW5hYmxlOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5lbmFibGUoKVxuXG5cblxuXG4gICAjIERpc2FibGUgcGxheWJhY2sgb2YgdGhlIGF1ZGlvIHNxdWFyZVxuXG4gICBkaXNhYmxlOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5kaXNhYmxlKClcblxuXG5cblxuICAgIyBQbGF5YmFjayBhdWRpbyBvbiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgIHBsYXk6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjay5wbGF5KClcblxuICAgICAgVHdlZW5NYXgudG8gQCRlbCwgLjIsXG4gICAgICAgICBlYXNlOiBCYWNrLmVhc2VJblxuICAgICAgICAgc2NhbGU6IC41XG5cbiAgICAgICAgIG9uQ29tcGxldGU6ID0+XG5cbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEAkZWwsIC4yLFxuICAgICAgICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGNsaWNrIGV2ZW50cyBvbiB0aGUgYXVkaW8gc3F1YXJlLiAgVG9nZ2xlcyB0aGVcbiAgICMgdm9sdW1lIGZyb20gbG93IHRvIGhpZ2ggdG8gb2ZmXG5cbiAgIG9uQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuY3ljbGUoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHZlbG9jaXR5IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSB2aXN1YWwgZGlzcGxheSBhbmQgc2V0cyB2b2x1bWVcbiAgICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uVmVsb2NpdHlDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIHZlbG9jaXR5ID0gbW9kZWwuY2hhbmdlZC52ZWxvY2l0eVxuXG4gICAgICBAJGVsLnJlbW92ZUNsYXNzICd2ZWxvY2l0eS1sb3cgdmVsb2NpdHktbWVkaXVtIHZlbG9jaXR5LWhpZ2gnXG5cbiAgICAgICMgU2V0IHZpc3VhbCBpbmRpY2F0b3JcbiAgICAgIHZlbG9jaXR5Q2xhc3MgPSBzd2l0Y2ggdmVsb2NpdHlcbiAgICAgICAgIHdoZW4gMSB0aGVuICd2ZWxvY2l0eS1sb3cnXG4gICAgICAgICB3aGVuIDIgdGhlbiAndmVsb2NpdHktbWVkaXVtJ1xuICAgICAgICAgd2hlbiAzIHRoZW4gJ3ZlbG9jaXR5LWhpZ2gnXG4gICAgICAgICBlbHNlICcnXG5cbiAgICAgIEAkZWwuYWRkQ2xhc3MgdmVsb2NpdHlDbGFzc1xuXG5cbiAgICAgICMgU2V0IGF1ZGlvIHZvbHVtZVxuICAgICAgdm9sdW1lID0gc3dpdGNoIHZlbG9jaXR5XG4gICAgICAgICB3aGVuIDEgdGhlbiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5sb3dcbiAgICAgICAgIHdoZW4gMiB0aGVuIEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLm1lZGl1bVxuICAgICAgICAgd2hlbiAzIHRoZW4gQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMuaGlnaFxuICAgICAgICAgZWxzZSAnJ1xuXG4gICAgICBAYXVkaW9QbGF5YmFjay52b2x1bWUoIHZvbHVtZSApXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgYWN0aXZpdHkgY2hhbmdlIGV2ZW50cy4gIFdoZW4gaW5hY3RpdmUsIGNoZWNrcyBhZ2FpbnN0IHBsYXliYWNrIGFyZVxuICAgIyBub3QgcGVyZm9ybWVkIGFuZCB0aGUgc3F1YXJlIGlzIHNraXBwZWQuXG4gICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gICBvbkFjdGl2ZUNoYW5nZTogKG1vZGVsKSAtPlxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHRyaWdnZXIgXCJwbGF5YmFja1wiIGV2ZW50c1xuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25UcmlnZ2VyQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBpZiBtb2RlbC5jaGFuZ2VkLnRyaWdnZXIgaXMgdHJ1ZVxuICAgICAgICAgQHBsYXkoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHNvdW5kIHBsYXliYWNrIGVuZCBldmVudHMuICBSZW1vdmVzIHRoZSB0cmlnZ2VyXG4gICAjIGZsYWcgc28gdGhlIGF1ZGlvIHdvbid0IG92ZXJsYXBcblxuICAgb25Tb3VuZEVuZDogPT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlIiwiIyMjKlxuICogSW5kaXZpZHVhbCBzZXF1ZW5jZXIgdHJhY2tzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwRXZlbnQgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGF0dGVyblNxdWFyZSAgICAgICAgICAgPSByZXF1aXJlICcuL1BhdHRlcm5TcXVhcmUuY29mZmVlJ1xuVmlldyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3BhdHRlcm4tdHJhY2stdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFBhdHRlcm5UcmFjayBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBuYW1lIG9mIHRoZSBjbGFzc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdwYXR0ZXJuLXRyYWNrJ1xuXG5cbiAgICMgVGhlIHR5cGUgb2YgdGFnXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHRhZ05hbWU6ICd0cidcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgQSBjb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgdmlldyBzcXVhcmVzXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgcGF0dGVyblNxdWFyZVZpZXdzOiBudWxsXG5cblxuICAgIyBAdHlwZSB7UGF0dGVyblNxdWFyZUNvbGxlY3Rpb259XG4gICBjb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICAgbW9kZWw6IG51bGxcblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCAubGFiZWwtaW5zdHJ1bWVudCc6ICdvbkxhYmVsQ2xpY2snXG4gICAgICAndG91Y2hlbmQgLmJ0bi1tdXRlJzogICAgICAgICAnb25NdXRlQnRuQ2xpY2snXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBhbmQgcmVuZGVycyBvdXQgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRsYWJlbCA9IEAkZWwuZmluZCAnLmxhYmVsLWluc3RydW1lbnQnXG5cbiAgICAgIEByZW5kZXJQYXR0ZXJuU3F1YXJlcygpXG5cbiAgICAgIEBcblxuXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIF8uZWFjaCBAcGF0dGVyblNxdWFyZVZpZXdzLCAoc3F1YXJlKSA9PlxuICAgICAgICAgc3F1YXJlLnJlbW92ZSgpXG5cbiAgICAgIHN1cGVyKClcblxuXG5cblxuICAgIyBBZGQgbGlzdGVuZXJzIHRvIHRoZSB2aWV3IHdoaWNoIGxpc3RlbiBmb3IgdmlldyBjaGFuZ2VzXG4gICAjIGFzIHdlbGwgYXMgY2hhbmdlcyB0byB0aGUgY29sbGVjdGlvbiwgd2hpY2ggc2hvdWxkIHVwZGF0ZVxuICAgIyBwYXR0ZXJuIHNxdWFyZXMgd2l0aG91dCByZS1yZW5kZXJpbmcgdGhlIHZpZXdzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGtpdE1vZGVsID0gQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKVxuXG4gICAgICBAbGlzdGVuVG8gQG1vZGVsLCAgICBBcHBFdmVudC5DSEFOR0VfRk9DVVMsICAgICAgQG9uRm9jdXNDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsICAgIEFwcEV2ZW50LkNIQU5HRV9NVVRFLCAgICAgICBAb25NdXRlQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGtpdE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cblxuXG4gICAjIFJlbmRlciBvdXQgdGhlIHBhdHRlcm4gc3F1YXJlcyBhbmQgcHVzaCB0aGVtIGludG8gYW4gYXJyYXlcbiAgICMgZm9yIGZ1cnRoZXIgaXRlcmF0aW9uXG5cbiAgIHJlbmRlclBhdHRlcm5TcXVhcmVzOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVWaWV3cyA9IFtdXG5cbiAgICAgIEBjb2xsZWN0aW9uID0gbmV3IFBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uXG5cbiAgICAgIF8oOCkudGltZXMgPT5cbiAgICAgICAgIEBjb2xsZWN0aW9uLmFkZCBuZXcgUGF0dGVyblNxdWFyZU1vZGVsIHsgaW5zdHJ1bWVudDogQG1vZGVsIH1cblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAobW9kZWwpID0+XG4gICAgICAgICBwYXR0ZXJuU3F1YXJlID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgICAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbW9kZWxcblxuICAgICAgICAgQCRsYWJlbC50ZXh0IG1vZGVsLmdldCAnbGFiZWwnXG4gICAgICAgICBAJGVsLmFwcGVuZCBwYXR0ZXJuU3F1YXJlLnJlbmRlcigpLmVsXG4gICAgICAgICBAcGF0dGVyblNxdWFyZVZpZXdzLnB1c2ggcGF0dGVyblNxdWFyZVxuXG4gICAgICAjIFNldCB0aGUgc3F1YXJlcyBvbiB0aGUgSW5zdHJ1bWVudCBtb2RlbCB0byB0cmFjayBhZ2FpbnN0IHN0YXRlXG4gICAgICBAbW9kZWwuc2V0ICdwYXR0ZXJuU3F1YXJlcycsIEBjb2xsZWN0aW9uXG5cblxuXG4gICAjIE11dGUgdGhlIGVudGlyZSB0cmFja1xuXG4gICBtdXRlOiAtPlxuICAgICAgQG1vZGVsLnNldCAnbXV0ZScsIHRydWVcblxuXG5cbiAgICMgVW5tdXRlIHRoZSBlbnRpcmUgdHJhY2tcblxuICAgdW5tdXRlOiAtPlxuICAgICAgQG1vZGVsLnNldCAnbXV0ZScsIGZhbHNlXG5cblxuXG4gICBzZWxlY3Q6IC0+XG4gICAgICBAJGVsLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG5cbiAgIGRlc2VsZWN0OiAtPlxuICAgICAgaWYgQCRlbC5oYXNDbGFzcyAnc2VsZWN0ZWQnXG4gICAgICAgICBAJGVsLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcblxuXG5cbiAgIGZvY3VzOiAtPlxuICAgICAgQCRlbC5hZGRDbGFzcyAnZm9jdXMnXG5cblxuXG5cbiAgIHVuZm9jdXM6IC0+XG4gICAgICBpZiBAJGVsLmhhc0NsYXNzICdmb2N1cydcbiAgICAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgJ2ZvY3VzJ1xuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGNoYW5nZXMgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBpbnN0cnVtZW50XG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBpbnN0cnVtZW50TW9kZWxcblxuICAgb25JbnN0cnVtZW50Q2hhbmdlOiAoaW5zdHJ1bWVudE1vZGVsKSA9PlxuICAgICAgaW5zdHJ1bWVudCA9IGluc3RydW1lbnRNb2RlbC5jaGFuZ2VkLmN1cnJlbnRJbnN0cnVtZW50XG5cbiAgICAgIGlmIGluc3RydW1lbnQuY2lkIGlzIEBtb2RlbC5jaWRcbiAgICAgICAgIEBzZWxlY3QoKVxuXG4gICAgICBlbHNlIEBkZXNlbGVjdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBtb2RlbCBjaGFuZ2UgZXZlbnRzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbk11dGVDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIG11dGUgPSBtb2RlbC5jaGFuZ2VkLm11dGVcblxuICAgICAgaWYgbXV0ZVxuICAgICAgICAgQCRlbC5hZGRDbGFzcyAnbXV0ZSdcblxuICAgICAgZWxzZSBAJGVsLnJlbW92ZUNsYXNzICdtdXRlJ1xuXG5cblxuICAgIyBIYW5kbGVyIGZvciBmb2N1cyBjaGFuZ2UgZXZlbnRzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbkZvY3VzQ2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBpZiBtb2RlbC5jaGFuZ2VkLmZvY3VzXG4gICAgICAgICAgQGZvY3VzKClcbiAgICAgIGVsc2VcbiAgICAgICAgICBAdW5mb2N1cygpXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgYnV0dG9uIGNsaWNrc1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25MYWJlbENsaWNrOiAoZXZlbnQpID0+XG4gICAgICBpZiBAbW9kZWwuZ2V0KCdtdXRlJykgaXNudCB0cnVlXG4gICAgICAgICBAbW9kZWwuc2V0ICdmb2N1cycsICEgQG1vZGVsLmdldCgnZm9jdXMnKVxuXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBidXR0b24gY2xpY2tzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbk11dGVCdG5DbGljazogKGV2ZW50KSA9PlxuICAgICAgQG1vZGVsLnNldCAnbXV0ZScsICEgQG1vZGVsLmdldCgnbXV0ZScpXG5cbiAgICAgICMgaWYgQG1vZGVsLmdldCAnbXV0ZSdcbiAgICAgICMgICAgQHVubXV0ZSgpXG5cbiAgICAgICMgZWxzZSBAbXV0ZSgpXG5cblxuXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuVHJhY2siLCIjIyMqXG4gKiBTZXF1ZW5jZXIgcGFyZW50IHZpZXcgZm9yIHRyYWNrIHNlcXVlbmNlc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblBhdHRlcm5UcmFjayA9IHJlcXVpcmUgJy4vUGF0dGVyblRyYWNrLmNvZmZlZSdcblB1YlN1YiAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3V0aWxzL1B1YlN1YidcbkFwcEV2ZW50ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5oZWxwZXJzICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycydcbnRlbXBsYXRlICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3NlcXVlbmNlci10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgU2VxdWVuY2VyIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIG5hbWUgb2YgdGhlIGNvbnRhaW5lciBjbGFzc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdzZXF1ZW5jZXItY29udGFpbmVyJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBBbiBhcnJheSBvZiBhbGwgcGF0dGVybiB0cmFja3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgcGF0dGVyblRyYWNrVmlld3M6IG51bGxcblxuXG4gICAjIFRoZSBzZXRJbnRlcnZhbCB0aWNrZXJcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgYnBtSW50ZXJ2YWw6IG51bGxcblxuXG4gICAjIFRoZSB0aW1lIGluIHdoaWNoIHRoZSBpbnRlcnZhbCBmaXJlc1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICB1cGRhdGVJbnRlcnZhbFRpbWU6IDIwMFxuXG5cbiAgICMgVGhlIGN1cnJlbnQgYmVhdCBpZFxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBjdXJyQmVhdENlbGxJZDogLTFcblxuXG4gICAjIFRPRE86IFVwZGF0ZSB0aGlzIHRvIG1ha2UgaXQgbW9yZSBkeW5hbWljXG4gICAjIFRoZSBudW1iZXIgb2YgYmVhdCBjZWxsc1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBudW1DZWxsczogN1xuXG5cbiAgICMgR2xvYmFsIGFwcGxpY2F0aW9uIG1vZGVsXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIENvbGxlY3Rpb24gb2YgaW5zdHJ1bWVudHNcbiAgICMgQHR5cGUge0luc3RydW1lbnRDb2xsZWN0aW9ufVxuXG4gICBjb2xsZWN0aW9uOiBudWxsXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH1cblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCR0aFN0ZXBwZXIgPSBAJGVsLmZpbmQgJ3RoLnN0ZXBwZXInXG4gICAgICBAJHNlcXVlbmNlciA9IEAkZWwuZmluZCAnLnNlcXVlbmNlcidcblxuICAgICAgQHJlbmRlclRyYWNrcygpXG4gICAgICBAcGxheSgpXG5cbiAgICAgIEBcblxuXG4gICAjIFJlbW92ZXMgdGhlIHZpZXcgZnJvbSB0aGUgRE9NIGFuZCBjYW5jZWxzXG4gICAjIHRoZSB0aWNrZXIgaW50ZXJ2YWxcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgXy5lYWNoIEBwYXR0ZXJuVHJhY2tWaWV3cywgKHRyYWNrKSA9PlxuICAgICAgICAgdHJhY2sucmVtb3ZlKClcblxuICAgICAgQHBhdXNlKClcblxuICAgICAgc3VwZXIoKVxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kbGluZyBpbnN0cnVtZW50IGFuZCBwbGF5YmFja1xuICAgIyBjaGFuZ2VzLiAgVXBkYXRlcyBhbGwgb2YgdGhlIHZpZXdzIGFjY29yZGluZ2x5XG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgICBBcHBFdmVudC5DSEFOR0VfQlBNLCAgICAgQG9uQlBNQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAgIEFwcEV2ZW50LkNIQU5HRV9QTEFZSU5HLCBAb25QbGF5aW5nQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAgIEFwcEV2ZW50LkNIQU5HRV9LSVQsICAgICBAb25LaXRDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAY29sbGVjdGlvbiwgQXBwRXZlbnQuQ0hBTkdFX0ZPQ1VTLCAgIEBvbkZvY3VzQ2hhbmdlXG5cbiAgICAgIFB1YlN1Yi5vbiBBcHBFdmVudC5JTVBPUlRfVFJBQ0ssIEBpbXBvcnRUcmFja1xuICAgICAgI1B1YlN1Yi5vbiBBcHBFdmVudC5FWFBPUlRfVFJBQ0ssIEBvbkV4cG9ydFRyYWNrXG5cblxuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIHN1cGVyKClcblxuICAgICAgUHViU3ViLm9mZiBBcHBFdmVudC5JTVBPUlRfVFJBQ0tcbiAgICAgIFB1YlN1Yi5vZmYgQXBwRXZlbnQuRVhQT1JUX1RSQUNLXG5cblxuXG4gICAjIFJlbmRlcnMgb3V0IGVhY2ggaW5kaXZpZHVhbCB0cmFjay5cbiAgICMgVE9ETzogTmVlZCB0byB1cGRhdGUgc28gdGhhdCBhbGwgb2YgdGhlIGJlYXQgc3F1YXJlcyBhcmVuJ3RcbiAgICMgYmxvd24gYXdheSBieSB0aGUgcmUtcmVuZGVyXG5cbiAgIHJlbmRlclRyYWNrczogPT5cbiAgICAgIEAkZWwuZmluZCgnLnBhdHRlcm4tdHJhY2snKS5yZW1vdmUoKVxuXG4gICAgICBAcGF0dGVyblRyYWNrVmlld3MgPSBbXVxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChtb2RlbCkgPT5cblxuICAgICAgICAgcGF0dGVyblRyYWNrID0gbmV3IFBhdHRlcm5UcmFja1xuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgICAgY29sbGVjdGlvbjogbW9kZWwuZ2V0ICdwYXR0ZXJuU3F1YXJlcydcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuXG4gICAgICAgICBAcGF0dGVyblRyYWNrVmlld3MucHVzaCBwYXR0ZXJuVHJhY2tcbiAgICAgICAgIEAkc2VxdWVuY2VyLmFwcGVuZCBwYXR0ZXJuVHJhY2sucmVuZGVyKCkuZWxcblxuXG5cblxuICAgIyBVcGRhdGUgdGhlIHRpY2tlciB0aW1lLCBhbmQgYWR2YW5jZXMgdGhlIGJlYXRcblxuICAgdXBkYXRlVGltZTogPT5cbiAgICAgIEAkdGhTdGVwcGVyLnJlbW92ZUNsYXNzICdzdGVwJ1xuICAgICAgQGN1cnJCZWF0Q2VsbElkID0gaWYgQGN1cnJCZWF0Q2VsbElkIDwgQG51bUNlbGxzIHRoZW4gQGN1cnJCZWF0Q2VsbElkICs9IDEgZWxzZSBAY3VyckJlYXRDZWxsSWQgPSAwXG4gICAgICAkKEAkdGhTdGVwcGVyW0BjdXJyQmVhdENlbGxJZF0pLmFkZENsYXNzICdzdGVwJ1xuXG4gICAgICBAcGxheUF1ZGlvKClcblxuXG5cblxuICAgIyBDb252ZXJ0cyBtaWxsaXNlY29uZHMgdG8gQlBNXG5cbiAgIGNvbnZlcnRCUE06IC0+XG4gICAgICByZXR1cm4gMjAwXG5cblxuXG4gICAjIFN0YXJ0IHBsYXliYWNrIG9mIHNlcXVlbmNlclxuXG4gICBwbGF5OiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAncGxheWluZycsIHRydWVcblxuXG5cblxuICAgIyBQYXVzZXMgc2VxdWVuY2VyIHBsYXliYWNrXG5cbiAgIHBhdXNlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAncGxheWluZycsIGZhbHNlXG5cblxuXG5cbiAgICMgTXV0ZXMgdGhlIHNlcXVlbmNlclxuXG4gICBtdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAnbXV0ZScsIHRydWVcblxuXG5cblxuICAgIyBVbm11dGVzIHRoZSBzZXF1ZW5jZXJcblxuICAgdW5tdXRlOiAtPlxuICAgICAgIEBhcHBNb2RlbC5zZXQgJ211dGUnLCBmYWxzZVxuXG5cblxuXG5cbiAgICMgUGxheXMgYXVkaW8gb2YgZWFjaCB0cmFjayBjdXJyZW50bHkgZW5hYmxlZCBhbmQgb25cblxuICAgcGxheUF1ZGlvOiAtPlxuICAgICAgZm9jdXNlZEluc3RydW1lbnQgPSAgQGNvbGxlY3Rpb24uZmluZFdoZXJlIHsgZm9jdXM6IHRydWUgfVxuXG4gICAgICAjIENoZWNrIGlmIHRoZXJlJ3MgYSBmb2N1c2VkIHRyYWNrIGFuZCBvbmx5XG4gICAgICAjIHBsYXkgYXVkaW8gZnJvbSB0aGVyZVxuXG4gICAgICBpZiBmb2N1c2VkSW5zdHJ1bWVudFxuICAgICAgICAgaWYgZm9jdXNlZEluc3RydW1lbnQuZ2V0KCdtdXRlJykgaXNudCB0cnVlXG4gICAgICAgICAgICBmb2N1c2VkSW5zdHJ1bWVudC5nZXQoJ3BhdHRlcm5TcXVhcmVzJykuZWFjaCAocGF0dGVyblNxdWFyZSwgaW5kZXgpID0+XG4gICAgICAgICAgICAgICBAcGxheVBhdHRlcm5TcXVhcmVBdWRpbyggcGF0dGVyblNxdWFyZSwgaW5kZXggKVxuXG4gICAgICAgICByZXR1cm5cblxuXG4gICAgICAjIElmIG5vdGhpbmcgaXMgZm9jdXNlZCwgdGhlbiBjaGVjayBhZ2FpbnN0XG4gICAgICAjIHRoZSBlbnRpcmUgbWF0cml4XG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKGluc3RydW1lbnQpID0+XG4gICAgICAgICBpZiBpbnN0cnVtZW50LmdldCgnbXV0ZScpIGlzbnQgdHJ1ZVxuICAgICAgICAgICAgaW5zdHJ1bWVudC5nZXQoJ3BhdHRlcm5TcXVhcmVzJykuZWFjaCAocGF0dGVyblNxdWFyZSwgaW5kZXgpID0+XG4gICAgICAgICAgICAgICBAcGxheVBhdHRlcm5TcXVhcmVBdWRpbyggcGF0dGVyblNxdWFyZSwgaW5kZXggKVxuXG5cblxuXG4gICAjIFBsYXlzIHRoZSBhdWRpbyBvbiBhbiBpbmRpdmlkdWFsIFBhdHRlclNxdWFyZSBpZiB0ZW1wbyBpbmRleFxuICAgIyBpcyB0aGUgc2FtZSBhcyB0aGUgaW5kZXggd2l0aGluIHRoZSBjb2xsZWN0aW9uXG4gICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZX0gcGF0dGVyblNxdWFyZVxuICAgIyBAcGFyYW0ge051bWJlcn0gaW5kZXhcblxuICAgcGxheVBhdHRlcm5TcXVhcmVBdWRpbzogKHBhdHRlcm5TcXVhcmUsIGluZGV4KSAtPlxuICAgICAgaWYgQGN1cnJCZWF0Q2VsbElkIGlzIGluZGV4XG4gICAgICAgICBpZiBwYXR0ZXJuU3F1YXJlLmdldCAnYWN0aXZlJ1xuICAgICAgICAgICAgcGF0dGVyblNxdWFyZS5zZXQgJ3RyaWdnZXInLCB0cnVlXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgQlBNIHRlbXBvIGNoYW5nZXNcbiAgICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICAgb25CUE1DaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIGNsZWFySW50ZXJ2YWwgQGJwbUludGVydmFsXG4gICAgICBAdXBkYXRlSW50ZXJ2YWxUaW1lID0gbW9kZWwuY2hhbmdlZC5icG1cbiAgICAgIEBicG1JbnRlcnZhbCA9IHNldEludGVydmFsIEB1cGRhdGVUaW1lLCBAdXBkYXRlSW50ZXJ2YWxUaW1lXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgcGxheWJhY2sgY2hhbmdlcy4gIElmIHBhdXNlZCwgaXQgc3RvcHMgcGxheWJhY2sgYW5kXG4gICAjIGNsZWFycyB0aGUgaW50ZXJ2YWwuICBJZiBwbGF5aW5nLCBpdCByZXNldHMgaXRcbiAgICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICAgb25QbGF5aW5nQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBwbGF5aW5nID0gbW9kZWwuY2hhbmdlZC5wbGF5aW5nXG5cbiAgICAgIGlmIHBsYXlpbmdcbiAgICAgICAgIEBicG1JbnRlcnZhbCA9IHNldEludGVydmFsIEB1cGRhdGVUaW1lLCBAdXBkYXRlSW50ZXJ2YWxUaW1lXG5cbiAgICAgIGVsc2VcbiAgICAgICAgIGNsZWFySW50ZXJ2YWwgQGJwbUludGVydmFsXG4gICAgICAgICBAYnBtSW50ZXJ2YWwgPSBudWxsXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBhbmQgdW5tdXRlIGNoYW5nZXNcbiAgICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICAgb25NdXRlQ2hhbmdlOiAobW9kZWwpID0+XG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZXMsIGFzIHNldCBmcm9tIHRoZSBLaXRTZWxlY3RvclxuICAgIyBAcGFyYW0ge0tpdE1vZGVsfSBtb2RlbFxuXG4gICBvbktpdENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQGNvbGxlY3Rpb24gPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKVxuICAgICAgQHJlbmRlclRyYWNrcygpXG5cbiAgICAgIGNvbnNvbGUubG9nIEBjb2xsZWN0aW9uLnRvSlNPTigpXG5cbiAgICAgICMgRXhwb3J0IG9sZCBwYXR0ZXJuIHNxdWFyZXMgc28gdGhlIHVzZXJzIHBhdHRlcm4gaXNuJ3QgYmxvd24gYXdheVxuICAgICAgIyB3aGVuIGtpdCBjaGFuZ2VzIG9jY3VyXG5cbiAgICAgIG9sZEluc3RydW1lbnRDb2xsZWN0aW9uID0gbW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy5raXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJylcbiAgICAgIG9sZFBhdHRlcm5TcXVhcmVzID0gb2xkSW5zdHJ1bWVudENvbGxlY3Rpb24uZXhwb3J0UGF0dGVyblNxdWFyZXMoKVxuXG5cbiAgICAgICMgVXBkYXRlIHRoZSBuZXcgY29sbGVjdGlvbiB3aXRoIG9sZCBwYXR0ZXJuIHNxdWFyZSBkYXRhXG4gICAgICAjIGFuZCB0cmlnZ2VyIFVJIHVwZGF0ZXMgb24gZWFjaCBzcXVhcmVcblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAoaW5zdHJ1bWVudE1vZGVsLCBpbmRleCkgLT5cbiAgICAgICAgIG9sZENvbGxlY3Rpb24gPSBvbGRQYXR0ZXJuU3F1YXJlc1tpbmRleF1cbiAgICAgICAgIG5ld0NvbGxlY3Rpb24gPSBpbnN0cnVtZW50TW9kZWwuZ2V0ICdwYXR0ZXJuU3F1YXJlcydcblxuICAgICAgICAgIyBVcGRhdGUgdHJhY2sgLyBpbnN0cnVtZW50IGxldmVsIHByb3BlcnRpZXMgbGlrZSB2b2x1bWUgLyBtdXRlIC8gZm9jdXNcbiAgICAgICAgIG9sZFByb3BzID0gb2xkSW5zdHJ1bWVudENvbGxlY3Rpb24uYXQoaW5kZXgpXG5cbiAgICAgICAgIHVubGVzcyBvbGRQcm9wcyBpcyB1bmRlZmluZWRcblxuICAgICAgICAgICAgb2xkUHJvcHMgPSBvbGRQcm9wcy50b0pTT04oKVxuXG4gICAgICAgICAgICBpbnN0cnVtZW50TW9kZWwuc2V0XG4gICAgICAgICAgICAgICB2b2x1bWU6IG9sZFByb3BzLnZvbHVtZVxuICAgICAgICAgICAgICAgYWN0aXZlOiBvbGRQcm9wcy5hY3RpdmVcbiAgICAgICAgICAgICAgIG11dGU6ICAgbnVsbFxuICAgICAgICAgICAgICAgZm9jdXM6ICBudWxsXG5cbiAgICAgICAgICAgICMgUmVzZXQgdmlzdWFsbHkgdGllZCBwcm9wcyB0byB0cmlnZ2VyIHVpIHVwZGF0ZVxuICAgICAgICAgICAgaW5zdHJ1bWVudE1vZGVsLnNldFxuICAgICAgICAgICAgICAgbXV0ZTogICBvbGRQcm9wcy5tdXRlXG4gICAgICAgICAgICAgICBmb2N1czogIG9sZFByb3BzLmZvY3VzXG5cbiAgICAgICAgICMgQ2hlY2sgZm9yIGluY29uc2lzdGFuY2llcyBiZXR3ZWVuIG51bWJlciBvZiBpbnN0cnVtZW50c1xuICAgICAgICAgdW5sZXNzIG9sZENvbGxlY3Rpb24gaXMgdW5kZWZpbmVkXG5cbiAgICAgICAgICAgIG5ld0NvbGxlY3Rpb24uZWFjaCAocGF0dGVyblNxdWFyZSwgaW5kZXgpIC0+XG4gICAgICAgICAgICAgICBvbGRQYXR0ZXJuU3F1YXJlID0gb2xkQ29sbGVjdGlvbi5hdCBpbmRleFxuICAgICAgICAgICAgICAgcGF0dGVyblNxdWFyZS5zZXQgb2xkUGF0dGVyblNxdWFyZS50b0pTT04oKVxuXG5cblxuXG4gICBpbXBvcnRUcmFjazogKHBhcmFtcykgPT5cbiAgICAgIHtjYWxsYmFjaywgcGF0dGVyblNxdWFyZUdyb3VwcywgaW5zdHJ1bWVudHN9ID0gcGFyYW1zXG5cbiAgICAgIEByZW5kZXJUcmFja3MoKVxuXG4gICAgICAjIEl0ZXJhdGUgb3ZlciBlYWNoIHZpZXcgYW5kIHNldCBzYXZlZCBwcm9wZXJ0aWVzXG4gICAgICBfLmVhY2ggQHBhdHRlcm5UcmFja1ZpZXdzLCAocGF0dGVyblRyYWNrVmlldywgaXRlcmF0b3IpIC0+XG4gICAgICAgICBpbnN0cnVtZW50TW9kZWwgPSBwYXR0ZXJuVHJhY2tWaWV3Lm1vZGVsXG5cbiAgICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICAgIG11dGU6ICBudWxsXG4gICAgICAgICAgICBmb2N1czogbnVsbFxuXG4gICAgICAgICAjIFVwZGF0ZSBwcm9wcyB0byB0cmlnZ2VyIFVJIHVwZGF0ZXNcbiAgICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICAgIG11dGU6ICBpbnN0cnVtZW50c1tpdGVyYXRvcl0ubXV0ZVxuICAgICAgICAgICAgZm9jdXM6IGluc3RydW1lbnRzW2l0ZXJhdG9yXS5mb2N1c1xuXG4gICAgICAgICAjIFVwZGF0ZSBlYWNoIGluZGl2aWR1YWwgcGF0dGVybiBzcXVhcmUgd2l0aCBzZXR0aW5nc1xuICAgICAgICAgcGF0dGVyblRyYWNrVmlldy5jb2xsZWN0aW9uLmVhY2ggKHBhdHRlcm5Nb2RlbCwgaW5kZXgpIC0+XG4gICAgICAgICAgICBwYXR0ZXJuTW9kZWwuc2V0IHBhdHRlcm5TcXVhcmVHcm91cHNbaXRlcmF0b3JdW2luZGV4XVxuXG4gICAgICBjYWxsYmFjaygpXG5cblxuXG5cbiAgIG9uRXhwb3J0VHJhY2s6IC0+XG4gICAgICB7Y2FsbGJhY2t9ID0gcGFyYW1zXG5cbiAgICAgIHBhdHRlcm5TcXVhcmVzID0gW11cblxuICAgICAgY29uc29sZS5sb2cgJ2ZpcmluZyBleHBvcnQhISdcblxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGZvY3VzIGNoYW5nZSBldmVudHMuICBJdGVyYXRlcyBvdmVyIGFsbCBvZiB0aGUgbW9kZWxzIHdpdGhpblxuICAgIyB0aGUgSW5zdHJ1bWVudENvbGxlY3Rpb24gYW5kIHRvZ2dsZXMgdGhlaXIgZm9jdXMgdG8gb2ZmIGlmIHRoZSBjaGFuZ2VkXG4gICAjIG1vZGVsJ3MgZm9jdXMgaXMgc2V0IHRvIHRydWUuXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbkZvY3VzQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChpbnN0cnVtZW50TW9kZWwpID0+XG4gICAgICAgICBpZiBtb2RlbC5jaGFuZ2VkLmZvY3VzIGlzIHRydWVcbiAgICAgICAgICAgIGlmIG1vZGVsLmNpZCBpc250IGluc3RydW1lbnRNb2RlbC5jaWRcbiAgICAgICAgICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXQgJ2ZvY3VzJywgZmFsc2VcblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZXF1ZW5jZXIiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIjtcblxuXG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cblxuICBidWZmZXIgKz0gXCI8dGQgY2xhc3M9J2xhYmVsLWluc3RydW1lbnQnPlxcblx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXG48L3RkPlxcbjx0ZCBjbGFzcz0nYnRuLW11dGUnPlxcblx0bXV0ZVxcbjwvdGQ+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc3RhY2syLCBvcHRpb25zLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblx0XHRcdDx0aCBjbGFzcz0nc3RlcHBlcic+PC90aD5cXG5cdFx0XCI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8dGFibGUgY2xhc3M9J3NlcXVlbmNlcic+XFxuXHQ8dHI+XFxuXHRcdDx0aD48L3RoPlxcblx0XHQ8dGg+PC90aD5cXG5cXG5cdFx0XCI7XG4gIG9wdGlvbnMgPSB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX07XG4gIHN0YWNrMiA9ICgoc3RhY2sxID0gaGVscGVycy5yZXBlYXQgfHwgZGVwdGgwLnJlcGVhdCksc3RhY2sxID8gc3RhY2sxLmNhbGwoZGVwdGgwLCA4LCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwicmVwZWF0XCIsIDgsIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC90cj5cXG5cXG48L3RhYmxlPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWRlY3JlYXNlJz5ERUNSRUFTRTwvYnV0dG9uPlxcbjxzcGFuIGNsYXNzPSdsYWJlbC1icG0nPjA8L3NwYW4+XFxuPGJ1dHRvbiBjbGFzcz0nYnRuLWluY3JlYXNlJz5JTkNSRUFTRTwvYnV0dG9uPlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWxlZnQnPkxFRlQ8L2J1dHRvbj5cXG48c3BhbiBjbGFzcz0nbGFiZWwta2l0Jz5EUlVNIEtJVDwvc3Bhbj5cXG48YnV0dG9uIGNsYXNzPSdidG4tcmlnaHQnPlJJR0hUPC9idXR0b24+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdidG4tZXhwb3J0Jz5FWFBPUlQ8L2Rpdj5cXG48ZGl2IGNsYXNzPSdidG4tc2hhcmUnPlNIQVJFPC9kaXY+XFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLWtpdC1zZWxlY3Rvcic+XFxuXHQ8ZGl2IGNsYXNzPSdraXQtc2VsZWN0b3InPjwvZGl2PlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci12aXN1YWxpemF0aW9uJz5WaXN1YWxpemF0aW9uPC9kaXY+XFxuXFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLXNlcXVlbmNlcic+XFxuXFxuXHQ8ZGl2IGNsYXNzPSdpbnN0cnVtZW50LXNlbGVjdG9yJz5JbnN0cnVtZW50IFNlbGVjdG9yPC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPSdzZXF1ZW5jZXInPlNlcXVlbmNlcjwvZGl2Plxcblx0PGRpdiBjbGFzcz0nYnBtJz5CUE08L2Rpdj5cXG5cXG48L2Rpdj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuUHViU3ViICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9QdWJTdWInXG5QdWJFdmVudCA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvbGFuZGluZy10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgTGFuZGluZ1ZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5zdGFydC1idG4nOiAnb25TdGFydEJ0bkNsaWNrJ1xuXG5cbiAgIG9uU3RhcnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgUHViU3ViLnRyaWdnZXIgUHViRXZlbnQuUk9VVEUsXG4gICAgICAgICByb3V0ZTogJ2NyZWF0ZSdcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZGluZ1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxzcGFuIGNsYXNzPSdzdGFydC1idG4nPkNSRUFURTwvc3Bhbj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBTaGFyZSB0aGUgdXNlciBjcmVhdGVkIGJlYXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2hhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFNoYXJlVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlVmlldyIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGEgaHJlZj0nLyMnPk5FVzwvYT5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVzdHMtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFRlc3RzVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0c1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxoMT5Db21wb25lbnQgVmlld2VyPC9oMT5cXG5cXG48YnIgLz5cXG48cD5cXG5cdE1ha2Ugc3VyZSB0aGF0IDxiPmh0dHBzdGVyPC9iPiBpcyBydW5uaW5nIGluIHRoZSA8Yj5zb3VyY2U8L2I+IHJvdXRlIChucG0gaW5zdGFsbCAtZyBodHRwc3RlcikgPGJyLz5cXG5cdDxhIGhyZWY9XFxcImh0dHA6Ly9sb2NhbGhvc3Q6MzMzMy90ZXN0L2h0bWwvXFxcIj5Nb2NoYSBUZXN0IFJ1bm5lcjwvYT5cXG48L3A+XFxuXFxuPGJyIC8+XFxuPHVsPlxcblx0PGxpPjxhIGhyZWY9JyNraXQtc2VsZWN0aW9uJz5LaXQgU2VsZWN0aW9uPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2JwbS1pbmRpY2F0b3JcXFwiPkJQTSBJbmRpY2F0b3I8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjaW5zdHJ1bWVudC1zZWxlY3RvclxcXCI+SW5zdHJ1bWVudCBTZWxlY3RvcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNwYXR0ZXJuLXNxdWFyZVxcXCI+UGF0dGVybiBTcXVhcmU8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjcGF0dGVybi10cmFja1xcXCI+UGF0dGVybiBUcmFjazwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNzZXF1ZW5jZXJcXFwiPlNlcXVlbmNlcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNmdWxsLXNlcXVlbmNlclxcXCI+RnVsbCBTZXF1ZW5jZXI8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjcGFkLXNxdWFyZVxcXCI+UGFkIFNxdWFyZTwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNsaXZlLXBhZFxcXCI+TGl2ZVBhZDwvYT48L2xpPlxcbjwvdWw+XCI7XG4gIH0pIl19

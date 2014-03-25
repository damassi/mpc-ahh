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


},{"./models/AppModel.coffee":11,"./routers/AppRouter.coffee":21,"./supers/View.coffee":24,"./views/create/CreateView.coffee":26,"./views/landing/LandingView.coffee":48,"./views/share/ShareView.coffee":50}],7:[function(require,module,exports){

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


},{"../config/AppConfig.coffee":7,"../supers/Model.coffee":23}],12:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../../supers/Collection.coffee":22,"./KitModel.coffee":13}],13:[function(require,module,exports){

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


},{"../../supers/Model.coffee":23,"../sequencer/InstrumentCollection.coffee":17}],14:[function(require,module,exports){

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


},{"../../supers/Model.coffee":23}],15:[function(require,module,exports){

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


},{"../../supers/Collection.coffee":22,"../sequencer/InstrumentModel.coffee":18}],16:[function(require,module,exports){

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


},{"../../supers/Model.coffee":23}],17:[function(require,module,exports){

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


},{"../../supers/Collection.coffee":22,"./InstrumentModel.coffee":18}],18:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../../supers/Model.coffee":23}],19:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../../events/AppEvent.coffee":8,"../../supers/Collection.coffee":22,"../../utils/PubSub":25,"../sequencer/InstrumentModel.coffee":18,"./PatternSquareModel.coffee":20}],20:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":7,"../../events/AppEvent.coffee":8,"../../supers/Model.coffee":23}],21:[function(require,module,exports){

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


},{"../config/AppConfig.coffee":7,"../events/PubEvent.coffee":9,"../models/kits/KitCollection.coffee":12,"../models/kits/KitModel.coffee":13,"../models/pad/LivePadModel.coffee":14,"../models/pad/PadSquareCollection.coffee":15,"../models/pad/PadSquareModel.coffee":16,"../models/sequencer/PatternSquareCollection.coffee":19,"../models/sequencer/PatternSquareModel.coffee":20,"../supers/View.coffee":24,"../utils/PubSub":25,"../views/create/components/BPMIndicator.coffee":27,"../views/create/components/KitSelector.coffee":28,"../views/create/components/instruments/InstrumentSelectorPanel.coffee":30,"../views/create/components/pad/LivePad.coffee":33,"../views/create/components/pad/PadSquare.coffee":34,"../views/create/components/sequencer/PatternSquare.coffee":39,"../views/create/components/sequencer/PatternTrack.coffee":40,"../views/create/components/sequencer/Sequencer.coffee":41,"../views/tests/TestsView.coffee":52}],22:[function(require,module,exports){

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


},{}],23:[function(require,module,exports){

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


},{}],24:[function(require,module,exports){

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


},{}],25:[function(require,module,exports){
/**
 * @module     PubSub
 * @desc       Global PubSub object for dispatch and delegation
 */

'use strict'

var PubSub = {}

_.extend( PubSub, Backbone.Events )

module.exports = PubSub
},{}],26:[function(require,module,exports){

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
    var instruments, _results;
    this.patternSquareGroups = [];
    this.patternSquares = [];
    instruments = this.appModel["export"]().kitModel.instruments;
    instruments.forEach((function(_this) {
      return function(instrument) {
        return instrument.patternSquares.forEach(function(patternSquare) {
          delete patternSquare.instrument;
          return _this.patternSquares.push(patternSquare);
        });
      };
    })(this));
    _results = [];
    while (this.patternSquares.length > 0) {
      _results.push(this.patternSquareGroups.push(this.patternSquares.splice(0, 8)));
    }
    return _results;
  };

  CreateView.prototype.onShareBtnClick = function(event) {
    return PubSub.trigger(AppEvent.IMPORT_TRACK, {
      patternSquares: this.patternSquares,
      patternSquareGroups: this.patternSquareGroups,
      callback: function(response) {
        return console.log('done!');
      }
    });
  };

  return CreateView;

})(View);

module.exports = CreateView;


},{"../../events/AppEvent.coffee":8,"../../supers/View.coffee":24,"../../utils/PubSub":25,"../../views/create/components/BPMIndicator.coffee":27,"../../views/create/components/KitSelector.coffee":28,"../../views/create/components/instruments/InstrumentSelectorPanel.coffee":30,"../../views/create/components/sequencer/Sequencer.coffee":41,"./templates/create-template.hbs":47}],27:[function(require,module,exports){

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


},{"../../../config/AppConfig.coffee":7,"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":24,"./templates/bpm-template.hbs":45}],28:[function(require,module,exports){

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


},{"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":24,"./templates/kit-selection-template.hbs":46}],29:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":24,"./templates/instrument-template.hbs":32}],30:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":24,"./Instrument.coffee":29,"./templates/instrument-panel-template.hbs":31}],31:[function(require,module,exports){
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


},{"../../../../events/AppEvent.coffee":8,"../../../../models/pad/PadSquareCollection.coffee":15,"../../../../models/pad/PadSquareModel.coffee":16,"../../../../supers/View.coffee":24,"./PadSquare.coffee":34,"./templates/instruments-template.hbs":35,"./templates/live-pad-template.hbs":36,"./templates/pads-template.hbs":38}],34:[function(require,module,exports){

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


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":24,"./templates/pad-square-template.hbs":37}],35:[function(require,module,exports){
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
},{"handleify":5}],36:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<table class='container-pads'>\n\n</table>\n\n<div class='container-instruments'>\n\n</div>";
  })
},{"handleify":5}],37:[function(require,module,exports){
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
},{"handleify":5}],38:[function(require,module,exports){
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
},{"handleify":5}],39:[function(require,module,exports){

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


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":24,"./templates/pattern-square-template.hbs":42}],40:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../models/sequencer/PatternSquareCollection.coffee":19,"../../../../models/sequencer/PatternSquareModel.coffee":20,"../../../../supers/View.coffee":24,"./PatternSquare.coffee":39,"./templates/pattern-track-template.hbs":43}],41:[function(require,module,exports){

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
    this.onImportTrack = __bind(this.onImportTrack, this);
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
    PubSub.on(AppEvent.IMPORT_TRACK, this.onImportTrack);
    return PubSub.on(AppEvent.EXPORT_TRACK, this.onExportTrack);
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

  Sequencer.prototype.onImportTrack = function(params) {
    var callback, patternSquareGroups, patternSquares;
    callback = params.callback, patternSquareGroups = params.patternSquareGroups, patternSquares = params.patternSquares;
    this.renderTracks();
    _.each(this.patternTrackViews, function(trackView, iterator) {
      return trackView.collection.each(function(patternModel, index) {
        patternModel.set(patternSquareGroups[iterator][index]);
        return console.log(patternModel.toJSON());
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


},{"../../../../events/AppEvent.coffee":8,"../../../../helpers/handlebars-helpers":10,"../../../../supers/View.coffee":24,"../../../../utils/PubSub":25,"./PatternTrack.coffee":40,"./templates/sequencer-template.hbs":44}],42:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })
},{"handleify":5}],43:[function(require,module,exports){
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
},{"handleify":5}],44:[function(require,module,exports){
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
},{"handleify":5}],45:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-decrease'>DECREASE</button>\n<span class='label-bpm'>0</span>\n<button class='btn-increase'>INCREASE</button>";
  })
},{"handleify":5}],46:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-left'>LEFT</button>\n<span class='label-kit'>DRUM KIT</span>\n<button class='btn-right'>RIGHT</button>";
  })
},{"handleify":5}],47:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='btn-export'>EXPORT</div>\n<div class='btn-share'>SHARE</div>\n<div class='container-kit-selector'>\n	<div class='kit-selector'></div>\n</div>\n<div class='container-visualization'>Visualization</div>\n\n<div class='container-sequencer'>\n\n	<div class='instrument-selector'>Instrument Selector</div>\n	<div class='sequencer'>Sequencer</div>\n	<div class='bpm'>BPM</div>\n\n</div>";
  })
},{"handleify":5}],48:[function(require,module,exports){

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


},{"../../events/PubEvent.coffee":9,"../../supers/View.coffee":24,"../../utils/PubSub":25,"./templates/landing-template.hbs":49}],49:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<span class='start-btn'>CREATE</span>";
  })
},{"handleify":5}],50:[function(require,module,exports){

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


},{"../../supers/View.coffee":24,"./templates/share-template.hbs":51}],51:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<a href='/#'>NEW</a>";
  })
},{"handleify":5}],52:[function(require,module,exports){

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


},{"../../supers/View.coffee":24,"./tests-template.hbs":53}],53:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h1>Component Viewer</h1>\n\n<br />\n<p>\n	Make sure that <b>httpster</b> is running in the <b>source</b> route (npm install -g httpster) <br/>\n	<a href=\"http://localhost:3333/test/html/\">Mocha Test Runner</a>\n</p>\n\n<br />\n<ul>\n	<li><a href='#kit-selection'>Kit Selection</a></li>\n	<li><a href=\"#bpm-indicator\">BPM Indicator</a></li>\n	<li><a href=\"#instrument-selector\">Instrument Selector</a></li>\n	<li><a href=\"#pattern-square\">Pattern Square</a></li>\n	<li><a href=\"#pattern-track\">Pattern Track</a></li>\n	<li><a href=\"#sequencer\">Sequencer</a></li>\n	<li><a href=\"#full-sequencer\">Full Sequencer</a></li>\n	<li><a href=\"#pad-square\">Pad Square</a></li>\n	<li><a href=\"#live-pad\">LivePad</a></li>\n</ul>";
  })
},{"handleify":5}],54:[function(require,module,exports){
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


},{"./spec/AppController-spec.coffee":55,"./spec/models/KitCollection-spec.coffee":56,"./spec/models/KitModel-spec.coffee":57,"./spec/models/SoundCollection-spec.coffee":58,"./spec/models/SoundModel-spec.coffee":59,"./spec/views/create/CreateView-spec.coffee":60,"./spec/views/create/components/BPMIndicator-spec.coffee":61,"./spec/views/create/components/KitSelector-spec.coffee":62,"./spec/views/create/components/instruments/Instrument-spec.coffee":63,"./spec/views/create/components/instruments/InstrumentSelectorPanel-spec.coffee":64,"./spec/views/create/components/pad/LivePad-spec.coffee":65,"./spec/views/create/components/pad/PadSquare-spec.coffee":66,"./spec/views/create/components/sequencer/PatternSquare-spec.coffee":67,"./spec/views/create/components/sequencer/PatternTrack-spec.coffee":68,"./spec/views/create/components/sequencer/Sequencer-spec.coffee":69,"./spec/views/landing/LandingView-spec.coffee":70,"./spec/views/share/ShareView-spec.coffee":71}],55:[function(require,module,exports){
var AppController;

AppController = require('../../src/scripts/AppController.coffee');

describe('App Controller', function() {
  return it('Should initialize', (function(_this) {
    return function() {};
  })(this));
});


},{"../../src/scripts/AppController.coffee":6}],56:[function(require,module,exports){
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


},{"../../../src/scripts/config/AppConfig.coffee":7,"../../../src/scripts/models/kits/KitCollection.coffee":12}],57:[function(require,module,exports){
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


},{"../../../src/scripts/config/AppConfig.coffee":7,"../../../src/scripts/models/kits/KitModel.coffee":13,"../../../src/scripts/models/sequencer/InstrumentCollection.coffee":17}],58:[function(require,module,exports){
describe('Sound Collection', function() {
  return it('Should initialize with a sound set', (function(_this) {
    return function() {};
  })(this));
});


},{}],59:[function(require,module,exports){
describe('Sound Model', function() {
  return it('Should initialize with default config properties', (function(_this) {
    return function() {};
  })(this));
});


},{}],60:[function(require,module,exports){
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


},{"../../../../src/scripts/config/AppConfig.coffee":7,"../../../../src/scripts/models/AppModel.coffee":11,"../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../src/scripts/views/create/CreateView.coffee":26}],61:[function(require,module,exports){
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


},{"../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../src/scripts/events/AppEvent.coffee":8,"../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../src/scripts/views/create/components/BPMIndicator.coffee":27}],62:[function(require,module,exports){
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


},{"../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../src/scripts/models/kits/KitModel.coffee":13,"../../../../../src/scripts/views/create/components/KitSelector.coffee":28}],63:[function(require,module,exports){
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


},{"../../../../../../src/scripts/models/kits/KitModel.coffee":13,"../../../../../../src/scripts/views/create/components/instruments/Instrument.coffee":29}],64:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/views/create/components/instruments/InstrumentSelectorPanel.coffee":30}],65:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/pad/PadSquareCollection.coffee":15,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":18,"../../../../../../src/scripts/views/create/components/pad/LivePad.coffee":33,"../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee":34}],66:[function(require,module,exports){
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
        return _this.view.onPress();
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
      return _this.view.removeSoundAndClearPad();
    };
  })(this));
  return it('Should clear the icon when the droppable element is disposed of', (function(_this) {
    return function() {
      var icon, id;
      id = _this.kitCollection.at(0).get('instruments').at(0).get('id');
      _this.view.onDrop(id);
      icon = _this.kitCollection.at(0).get('instruments').at(0).get('icon');
      _this.view.$el.find('.' + icon).length.should.equal(1);
      _this.view.removeSoundAndClearPad();
      return _this.view.$el.find('.' + icon).length.should.equal(0);
    };
  })(this));
});


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/pad/PadSquareCollection.coffee":15,"../../../../../../src/scripts/models/pad/PadSquareModel.coffee":16,"../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee":34}],67:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":20,"../../../../../../src/scripts/views/create/components/sequencer/PatternSquare.coffee":39}],68:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":18,"../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee":19,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":20,"../../../../../../src/scripts/views/create/components/sequencer/PatternTrack.coffee":40}],69:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/helpers/handlebars-helpers":10,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/InstrumentCollection.coffee":17,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":18,"../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee":19,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":20,"../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee":41}],70:[function(require,module,exports){
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


},{"../../../../src/scripts/AppController.coffee":6,"../../../../src/scripts/config/AppConfig.coffee":7,"../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../src/scripts/views/landing/LandingView.coffee":48}],71:[function(require,module,exports){
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


},{"../../../../src/scripts/views/share/ShareView.coffee":50}]},{},[54])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2RpZ2l0cy9pbmRleC5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L3J1bnRpbWUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvTGl2ZVBhZE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvcGFkL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9zdXBlcnMvQ29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9zdXBlcnMvTW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvc3VwZXJzL1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdXRpbHMvUHViU3ViLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvdGVtcGxhdGVzL2luc3RydW1lbnQtcGFuZWwtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvdGVtcGxhdGVzL2luc3RydW1lbnQtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL0xpdmVQYWQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL1BhZFNxdWFyZS5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvdGVtcGxhdGVzL2luc3RydW1lbnRzLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC90ZW1wbGF0ZXMvbGl2ZS1wYWQtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL3RlbXBsYXRlcy9wYWQtc3F1YXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC90ZW1wbGF0ZXMvcGFkcy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9wYXR0ZXJuLXNxdWFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3BhdHRlcm4tdHJhY2stdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9zZXF1ZW5jZXItdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvdGVtcGxhdGVzL2JwbS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy90ZW1wbGF0ZXMva2l0LXNlbGVjdGlvbi10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvdGVtcGxhdGVzL2NyZWF0ZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvdGVtcGxhdGVzL2xhbmRpbmctdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL3RlbXBsYXRlcy9zaGFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy90ZXN0cy9UZXN0c1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvdGVzdHMvdGVzdHMtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjLXJ1bm5lci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvQXBwQ29udHJvbGxlci1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9tb2RlbHMvS2l0Q29sbGVjdGlvbi1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9tb2RlbHMvS2l0TW9kZWwtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvbW9kZWxzL1NvdW5kQ29sbGVjdGlvbi1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9tb2RlbHMvU291bmRNb2RlbC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3Itc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3Itc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvTGl2ZVBhZC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvUGFkU3F1YXJlLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2stc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTs7QUNGQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSw0RUFBQTtF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QUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVDLENBdEJBLENBQUE7U0F5QkEsRUFBQSxDQUFHLGtEQUFILEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsRUEzQm9CO0FBQUEsQ0FBdkIsQ0FIQSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIGRpZ2l0c1xuICogQ29weXJpZ2h0IChjKSAyMDEzIEpvbiBTY2hsaW5rZXJ0XG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUGFkIG51bWJlcnMgd2l0aCB6ZXJvcy5cbiAqIEF1dG9tYXRpY2FsbHkgcGFkIHRoZSBudW1iZXIgb2YgZGlnaXRzIGJhc2VkIG9uIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5LFxuICogb3IgZXhwbGljaXRseSBwYXNzIGluIHRoZSBudW1iZXIgb2YgZGlnaXRzIHRvIHVzZS5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG51bSAgVGhlIG51bWJlciB0byBwYWQuXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdHMgT3B0aW9ucyBvYmplY3Qgd2l0aCBgZGlnaXRzYCBhbmQgYGF1dG9gIHByb3BlcnRpZXMuXG4gKiAgICB7XG4gKiAgICAgIGF1dG86IGFycmF5Lmxlbmd0aCAvLyBwYXNzIGluIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5XG4gKiAgICAgIGRpZ2l0czogNCAgICAgICAgICAvLyBvciBwYXNzIGluIHRoZSBudW1iZXIgb2YgZGlnaXRzIHRvIHVzZVxuICogICAgfVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgIFRoZSBwYWRkZWQgbnVtYmVyIHdpdGggemVyb3MgcHJlcGVuZGVkXG4gKlxuICogQGV4YW1wbGVzOlxuICogIDEgICAgICA9PiAwMDAwMDFcbiAqICAxMCAgICAgPT4gMDAwMDEwXG4gKiAgMTAwICAgID0+IDAwMDEwMFxuICogIDEwMDAgICA9PiAwMDEwMDBcbiAqICAxMDAwMCAgPT4gMDEwMDAwXG4gKiAgMTAwMDAwID0+IDEwMDAwMFxuICovXG5cbmV4cG9ydHMucGFkID0gZnVuY3Rpb24gKG51bSwgb3B0cykge1xuICB2YXIgZGlnaXRzID0gb3B0cy5kaWdpdHMgfHwgMztcbiAgaWYob3B0cy5hdXRvICYmIHR5cGVvZiBvcHRzLmF1dG8gPT09ICdudW1iZXInKSB7XG4gICAgZGlnaXRzID0gU3RyaW5nKG9wdHMuYXV0bykubGVuZ3RoO1xuICB9XG4gIHZhciBsZW5EaWZmID0gZGlnaXRzIC0gU3RyaW5nKG51bSkubGVuZ3RoO1xuICB2YXIgcGFkZGluZyA9ICcnO1xuICBpZiAobGVuRGlmZiA+IDApIHtcbiAgICB3aGlsZSAobGVuRGlmZi0tKSB7XG4gICAgICBwYWRkaW5nICs9ICcwJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhZGRpbmcgKyBudW07XG59O1xuXG4vKipcbiAqIFN0cmlwIGxlYWRpbmcgZGlnaXRzIGZyb20gYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgZnJvbSB3aGljaCB0byBzdHJpcCBkaWdpdHNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqL1xuXG5leHBvcnRzLnN0cmlwbGVmdCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXGQrXFwtPy9nLCAnJyk7XG59O1xuXG4vKipcbiAqIFN0cmlwIHRyYWlsaW5nIGRpZ2l0cyBmcm9tIGEgc3RyaW5nXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIGZyb20gd2hpY2ggdG8gc3RyaXAgZGlnaXRzXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBUaGUgbW9kaWZpZWQgc3RyaW5nXG4gKi9cblxuZXhwb3J0cy5zdHJpcHJpZ2h0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFwtP1xcZCskL2csICcnKTtcbn07XG5cbi8qKlxuICogQ291bnQgZGlnaXRzIG9uIHRoZSBsZWZ0IHNpZGUgb2YgYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgd2l0aCBkaWdpdHMgdG8gY291bnRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqIEBleGFtcGxlXG4gKiAgXCIwMDEtZm9vLm1kXCIgPT4gM1xuICovXG5cbmV4cG9ydHMuY291bnRsZWZ0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyLm1hdGNoKC9eXFxkKy9nKSkubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBDb3VudCBkaWdpdHMgb24gdGhlIHJpZ2h0IHNpZGUgb2YgYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgd2l0aCBkaWdpdHMgdG8gY291bnRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqIEBleGFtcGxlXG4gKiAgXCIwMDEtZm9vLm1kXCIgPT4gM1xuICovXG5cbmV4cG9ydHMuY291bnRyaWdodCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gU3RyaW5nKHN0ci5tYXRjaCgvXFxkKyQvZykpLmxlbmd0aDtcbn07IiwiLypqc2hpbnQgZXFudWxsOiB0cnVlICovXG5cbm1vZHVsZS5leHBvcnRzLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuXG52YXIgSGFuZGxlYmFycyA9IHt9O1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZFUlNJT04gPSBcIjEuMC4wXCI7XG5IYW5kbGViYXJzLkNPTVBJTEVSX1JFVklTSU9OID0gNDtcblxuSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz49IDEuMC4wJ1xufTtcblxuSGFuZGxlYmFycy5oZWxwZXJzICA9IHt9O1xuSGFuZGxlYmFycy5wYXJ0aWFscyA9IHt9O1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgIGZ1bmN0aW9uVHlwZSA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24obmFtZSwgZm4sIGludmVyc2UpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBpZiAoaW52ZXJzZSB8fCBmbikgeyB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgaGVscGVycycpOyB9XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaW52ZXJzZSkgeyBmbi5ub3QgPSBpbnZlcnNlOyB9XG4gICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsID0gZnVuY3Rpb24obmFtZSwgc3RyKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBzdHI7XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihhcmcpIHtcbiAgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBoZWxwZXI6ICdcIiArIGFyZyArIFwiJ1wiKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UgfHwgZnVuY3Rpb24oKSB7fSwgZm4gPSBvcHRpb25zLmZuO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcblxuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKGNvbnRleHQgPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm4odGhpcyk7XG4gIH0gZWxzZSBpZihjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgIGlmKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIEhhbmRsZWJhcnMuaGVscGVycy5lYWNoKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZuKGNvbnRleHQpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5LID0gZnVuY3Rpb24oKSB7fTtcblxuSGFuZGxlYmFycy5jcmVhdGVGcmFtZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24ob2JqZWN0KSB7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBvYmplY3Q7XG4gIHZhciBvYmogPSBuZXcgSGFuZGxlYmFycy5LKCk7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBudWxsO1xuICByZXR1cm4gb2JqO1xufTtcblxuSGFuZGxlYmFycy5sb2dnZXIgPSB7XG4gIERFQlVHOiAwLCBJTkZPOiAxLCBXQVJOOiAyLCBFUlJPUjogMywgbGV2ZWw6IDMsXG5cbiAgbWV0aG9kTWFwOiB7MDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcid9LFxuXG4gIC8vIGNhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24obGV2ZWwsIG9iaikge1xuICAgIGlmIChIYW5kbGViYXJzLmxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IEhhbmRsZWJhcnMubG9nZ2VyLm1ldGhvZE1hcFtsZXZlbF07XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGVbbWV0aG9kXSkge1xuICAgICAgICBjb25zb2xlW21ldGhvZF0uY2FsbChjb25zb2xlLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy5sb2cgPSBmdW5jdGlvbihsZXZlbCwgb2JqKSB7IEhhbmRsZWJhcnMubG9nZ2VyLmxvZyhsZXZlbCwgb2JqKTsgfTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGZuID0gb3B0aW9ucy5mbiwgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZTtcbiAgdmFyIGkgPSAwLCByZXQgPSBcIlwiLCBkYXRhO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgZGF0YSA9IEhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgfVxuXG4gIGlmKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgaWYoY29udGV4dCBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgIGZvcih2YXIgaiA9IGNvbnRleHQubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgICBpZiAoZGF0YSkgeyBkYXRhLmluZGV4ID0gaTsgfVxuICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ldLCB7IGRhdGE6IGRhdGEgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvcih2YXIga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgaWYoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgaWYoZGF0YSkgeyBkYXRhLmtleSA9IGtleTsgfVxuICAgICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRba2V5XSwge2RhdGE6IGRhdGF9KTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZihpID09PSAwKXtcbiAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb25kaXRpb25hbCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICBpZighY29uZGl0aW9uYWwgfHwgSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd1bmxlc3MnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHtmbjogb3B0aW9ucy5pbnZlcnNlLCBpbnZlcnNlOiBvcHRpb25zLmZufSk7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmICghSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbnRleHQpKSByZXR1cm4gb3B0aW9ucy5mbihjb250ZXh0KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgSGFuZGxlYmFycy5sb2cobGV2ZWwsIGNvbnRleHQpO1xufSk7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxuLy8gQkVHSU4oQlJPV1NFUilcblxuSGFuZGxlYmFycy5WTSA9IHtcbiAgdGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlU3BlYykge1xuICAgIC8vIEp1c3QgYWRkIHdhdGVyXG4gICAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICAgIGVzY2FwZUV4cHJlc3Npb246IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICAgIGludm9rZVBhcnRpYWw6IEhhbmRsZWJhcnMuVk0uaW52b2tlUGFydGlhbCxcbiAgICAgIHByb2dyYW1zOiBbXSxcbiAgICAgIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV07XG4gICAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbShpLCBmbiwgZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgICB9LFxuICAgICAgbWVyZ2U6IGZ1bmN0aW9uKHBhcmFtLCBjb21tb24pIHtcbiAgICAgICAgdmFyIHJldCA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgICBpZiAocGFyYW0gJiYgY29tbW9uKSB7XG4gICAgICAgICAgcmV0ID0ge307XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBjb21tb24pO1xuICAgICAgICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHJldCwgcGFyYW0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9LFxuICAgICAgcHJvZ3JhbVdpdGhEZXB0aDogSGFuZGxlYmFycy5WTS5wcm9ncmFtV2l0aERlcHRoLFxuICAgICAgbm9vcDogSGFuZGxlYmFycy5WTS5ub29wLFxuICAgICAgY29tcGlsZXJJbmZvOiBudWxsXG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIHZhciByZXN1bHQgPSB0ZW1wbGF0ZVNwZWMuY2FsbChjb250YWluZXIsIEhhbmRsZWJhcnMsIGNvbnRleHQsIG9wdGlvbnMuaGVscGVycywgb3B0aW9ucy5wYXJ0aWFscywgb3B0aW9ucy5kYXRhKTtcblxuICAgICAgdmFyIGNvbXBpbGVySW5mbyA9IGNvbnRhaW5lci5jb21waWxlckluZm8gfHwgW10sXG4gICAgICAgICAgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IEhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgICAgIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICAgICAgdGhyb3cgXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBwcmVjb21waWxlciB0byBhIG5ld2VyIHZlcnNpb24gKFwiK3J1bnRpbWVWZXJzaW9ucytcIikgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uIChcIitjb21waWxlclZlcnNpb25zK1wiKS5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGEgbmV3ZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gXCIrXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKFwiK2NvbXBpbGVySW5mb1sxXStcIikuXCI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9LFxuXG4gIHByb2dyYW1XaXRoRGVwdGg6IGZ1bmN0aW9uKGksIGZuLCBkYXRhIC8qLCAkZGVwdGggKi8pIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMyk7XG5cbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgW2NvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhXS5jb25jYXQoYXJncykpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gYXJncy5sZW5ndGg7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgdmFyIHByb2dyYW0gPSBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhKTtcbiAgICB9O1xuICAgIHByb2dyYW0ucHJvZ3JhbSA9IGk7XG4gICAgcHJvZ3JhbS5kZXB0aCA9IDA7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIG5vb3A6IGZ1bmN0aW9uKCkgeyByZXR1cm4gXCJcIjsgfSxcbiAgaW52b2tlUGFydGlhbDogZnVuY3Rpb24ocGFydGlhbCwgbmFtZSwgY29udGV4dCwgaGVscGVycywgcGFydGlhbHMsIGRhdGEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHsgaGVscGVyczogaGVscGVycywgcGFydGlhbHM6IHBhcnRpYWxzLCBkYXRhOiBkYXRhIH07XG5cbiAgICBpZihwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBmb3VuZFwiKTtcbiAgICB9IGVsc2UgaWYocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKCFIYW5kbGViYXJzLmNvbXBpbGUpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRpYWxzW25hbWVdID0gSGFuZGxlYmFycy5jb21waWxlKHBhcnRpYWwsIHtkYXRhOiBkYXRhICE9PSB1bmRlZmluZWR9KTtcbiAgICAgIHJldHVybiBwYXJ0aWFsc1tuYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMudGVtcGxhdGUgPSBIYW5kbGViYXJzLlZNLnRlbXBsYXRlO1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG5cbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gQkVHSU4oQlJPV1NFUilcblxudmFyIGVycm9yUHJvcHMgPSBbJ2Rlc2NyaXB0aW9uJywgJ2ZpbGVOYW1lJywgJ2xpbmVOdW1iZXInLCAnbWVzc2FnZScsICduYW1lJywgJ251bWJlcicsICdzdGFjayddO1xuXG5IYW5kbGViYXJzLkV4Y2VwdGlvbiA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgdmFyIHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxufTtcbkhhbmRsZWJhcnMuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuSGFuZGxlYmFycy5TYWZlU3RyaW5nID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufTtcbkhhbmRsZWJhcnMuU2FmZVN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RyaW5nLnRvU3RyaW5nKCk7XG59O1xuXG52YXIgZXNjYXBlID0ge1xuICBcIiZcIjogXCImYW1wO1wiLFxuICBcIjxcIjogXCImbHQ7XCIsXG4gIFwiPlwiOiBcIiZndDtcIixcbiAgJ1wiJzogXCImcXVvdDtcIixcbiAgXCInXCI6IFwiJiN4Mjc7XCIsXG4gIFwiYFwiOiBcIiYjeDYwO1wiXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2c7XG52YXIgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxudmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdIHx8IFwiJmFtcDtcIjtcbn07XG5cbkhhbmRsZWJhcnMuVXRpbHMgPSB7XG4gIGV4dGVuZDogZnVuY3Rpb24ob2JqLCB2YWx1ZSkge1xuICAgIGZvcih2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgICBpZih2YWx1ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdmFsdWVba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZXNjYXBlRXhwcmVzc2lvbjogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgaW5zdGFuY2VvZiBIYW5kbGViYXJzLlNhZmVTdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcudG9TdHJpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsIHx8IHN0cmluZyA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAgIC8vIHRoZSByZWdleCB0ZXN0IHdpbGwgZG8gdGhpcyB0cmFuc3BhcmVudGx5IGJlaGluZCB0aGUgc2NlbmVzLCBjYXVzaW5nIGlzc3VlcyBpZlxuICAgIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICAgIHN0cmluZyA9IHN0cmluZy50b1N0cmluZygpO1xuXG4gICAgaWYoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbiAgfSxcblxuICBpc0VtcHR5OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZih0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSByZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMnKS5jcmVhdGUoKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy91dGlscy5qcycpLmF0dGFjaChleHBvcnRzKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzJykuYXR0YWNoKGV4cG9ydHMpIiwiIyMjKlxuICogUHJpbWFyeSBhcHBsaWNhdGlvbiBjb250cm9sbGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5BcHBNb2RlbCAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbkFwcFJvdXRlciAgID0gcmVxdWlyZSAnLi9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUnXG5MYW5kaW5nVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUnXG5DcmVhdGVWaWV3ICA9IHJlcXVpcmUgJy4vdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlJ1xuU2hhcmVWaWV3ICAgPSByZXF1aXJlICcuL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcENvbnRyb2xsZXIgZXh0ZW5kcyBWaWV3XG5cblxuICAgY2xhc3NOYW1lOiAnd3JhcHBlcidcblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEBsYW5kaW5nVmlldyA9IG5ldyBMYW5kaW5nVmlld1xuICAgICAgQHNoYXJlVmlldyAgID0gbmV3IFNoYXJlVmlld1xuXG4gICAgICBAY3JlYXRlVmlldyAgPSBuZXcgQ3JlYXRlVmlld1xuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgQGFwcFJvdXRlciA9IG5ldyBBcHBSb3V0ZXJcbiAgICAgICAgIGFwcENvbnRyb2xsZXI6IEBcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSBBcHBDb250cm9sbGVyIHRvIHRoZSBET00gYW5kIGtpY2tzXG4gICAjIG9mZiBiYWNrYm9uZXMgaGlzdG9yeVxuXG4gICByZW5kZXI6IC0+XG4gICAgICBAJGJvZHkgPSAkICdib2R5J1xuICAgICAgQCRib2R5LmFwcGVuZCBAZWxcblxuICAgICAgQmFja2JvbmUuaGlzdG9yeS5zdGFydFxuICAgICAgICAgcHVzaFN0YXRlOiBmYWxzZVxuXG5cblxuICAgIyBEZXN0cm95cyBhbGwgY3VycmVudCBhbmQgcHJlLXJlbmRlcmVkIHZpZXdzIGFuZFxuICAgIyB1bmRlbGVnYXRlcyBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgQGxhbmRpbmdWaWV3LnJlbW92ZSgpXG4gICAgICBAc2hhcmVWaWV3LnJlbW92ZSgpXG4gICAgICBAY3JlYXRlVmlldy5yZW1vdmUoKVxuXG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICAjIEFkZHMgQXBwQ29udHJvbGxlci1yZWxhdGVkIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVnaW5zXG4gICAjIGxpc3RlbmluZyB0byB2aWV3IGNoYW5nZXNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAnY2hhbmdlOnZpZXcnLCBAb25WaWV3Q2hhbmdlXG5cblxuXG5cbiAgICMgUmVtb3ZlcyBBcHBDb250cm9sbGVyLXJlbGF0ZWQgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHNob3dpbmcgLyBoaWRpbmcgLyBkaXNwb3Npbmcgb2YgcHJpbWFyeSB2aWV3c1xuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvblZpZXdDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIHByZXZpb3VzVmlldyA9IG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMudmlld1xuICAgICAgY3VycmVudFZpZXcgID0gbW9kZWwuY2hhbmdlZC52aWV3XG5cbiAgICAgIHByZXZpb3VzVmlldz8uaGlkZVxuICAgICAgICAgcmVtb3ZlOiB0cnVlXG5cblxuICAgICAgQCRlbC5hcHBlbmQgY3VycmVudFZpZXcucmVuZGVyKCkuZWxcblxuICAgICAgY3VycmVudFZpZXcuc2hvdygpXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwQ29udHJvbGxlciIsIiMjIypcbiAgQXBwbGljYXRpb24td2lkZSBnZW5lcmFsIGNvbmZpZ3VyYXRpb25zXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTkuMTRcbiMjI1xuXG5cbkFwcENvbmZpZyA9XG5cblxuICAgIyBUaGUgcGF0aCB0byBhcHBsaWNhdGlvbiBhc3NldHNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQVNTRVRTOlxuICAgICAgcGF0aDogICAnL2Fzc2V0cydcbiAgICAgIGF1ZGlvOiAgJ2F1ZGlvJ1xuICAgICAgZGF0YTogICAnZGF0YSdcbiAgICAgIGltYWdlczogJ2ltYWdlcydcblxuXG4gICAjIFRoZSBCUE0gdGVtcG9cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQlBNOiAzMjBcblxuXG4gICAjIFRoZSBtYXggQlBNXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIEJQTV9NQVg6IDEwMDBcblxuXG4gICAjIFRoZSBtYXggdmFyaWVudCBvbiBlYWNoIHBhdHRlcm4gc3F1YXJlIChvZmYsIGxvdywgbWVkaXVtLCBoaWdoKVxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBWRUxPQ0lUWV9NQVg6IDNcblxuXG4gICAjIFZvbHVtZSBsZXZlbHMgZm9yIHBhdHRlcm4gcGxheWJhY2sgYXMgd2VsbCBhcyBmb3Igb3ZlcmFsbCB0cmFja3NcbiAgICMgQHR5cGUge09iamVjdH1cblxuICAgVk9MVU1FX0xFVkVMUzpcbiAgICAgIGxvdzogICAgLjJcbiAgICAgIG1lZGl1bTogLjVcbiAgICAgIGhpZ2g6ICAgIDFcblxuXG4gICAjIFJldHVybnMgYSBub3JtYWxpemVkIGFzc2V0IHBhdGggZm9yIGFwcGxpY2F0aW9uIGFzc2V0c1xuICAgIyBAcGFyYW0ge1N0cmluZ30gYXNzZXRUeXBlXG5cbiAgIHJldHVybkFzc2V0UGF0aDogKGFzc2V0VHlwZSkgLT5cbiAgICAgIEBBU1NFVFMucGF0aCArICcvJyArIEBBU1NFVFNbYXNzZXRUeXBlXVxuXG5cbiAgICMgUmV0dXJucyBhIG5vcm1hbGl6ZWQgYXNzZXQgcGF0aCBmb3IgdGhlIFRFU1QgZW52aXJvbm1lbnRcbiAgICMgQHBhcmFtIHtTdHJpbmd9IGFzc2V0VHlwZVxuXG4gICByZXR1cm5UZXN0QXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgICAgJy90ZXN0L2h0bWwvJyArIEBBU1NFVFMucGF0aCArICcvJyArIEBBU1NFVFNbYXNzZXRUeXBlXVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb25maWdcblxuIiwiIyMjKlxuICogQXBwbGljYXRpb24gcmVsYXRlZCBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cbkFwcEV2ZW50ID1cblxuICAgQ0hBTkdFX0FDVElWRTogICAgICdjaGFuZ2U6YWN0aXZlJ1xuICAgQ0hBTkdFX0JQTTogICAgICAgICdjaGFuZ2U6YnBtJ1xuICAgQ0hBTkdFX0RSQUdHSU5HOiAgICdjaGFuZ2U6ZHJhZ2dpbmcnXG4gICBDSEFOR0VfRFJPUFBFRDogICAgJ2NoYW5nZTpkcm9wcGVkJ1xuICAgQ0hBTkdFX0ZPQ1VTOiAgICAgICdjaGFuZ2U6Zm9jdXMnXG4gICBDSEFOR0VfSU5TVFJVTUVOVDogJ2NoYW5nZTpjdXJyZW50SW5zdHJ1bWVudCdcbiAgIENIQU5HRV9LSVQ6ICAgICAgICAnY2hhbmdlOmtpdE1vZGVsJ1xuICAgQ0hBTkdFX01VVEU6ICAgICAgICdjaGFuZ2U6bXV0ZSdcbiAgIENIQU5HRV9QTEFZSU5HOiAgICAnY2hhbmdlOnBsYXlpbmcnXG4gICBDSEFOR0VfVFJJR0dFUjogICAgJ2NoYW5nZTp0cmlnZ2VyJ1xuICAgQ0hBTkdFX1ZFTE9DSVRZOiAgICdjaGFuZ2U6dmVsb2NpdHknXG5cbiAgIElNUE9SVF9UUkFDSzogICAgICAnb25JbXBvcnRUcmFjaydcbiAgIEVYUE9SVF9UUkFDSzogICAgICAnb25FeHBvcnRUcmFjaydcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBFdmVudCIsIiMjIypcbiAqIEdsb2JhbCBQdWJTdWIgZXZlbnRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuXG5QdWJTdWIgPVxuXG4gICBST1VURTogJ29uUm91dGVDaGFuZ2UnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQdWJTdWIiLCJcbnZhciBkaWdpdHMgPSByZXF1aXJlKCdkaWdpdHMnKTtcbnZhciBoYW5kbGViYXJzID0gcmVxdWlyZSgnaGFuZGxlaWZ5JylcblxuaGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcigncmVwZWF0JywgZnVuY3Rpb24obiwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBfZGF0YSA9IHt9O1xuICAgIGlmIChvcHRpb25zLl9kYXRhKSB7XG4gICAgICBfZGF0YSA9IGhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5fZGF0YSk7XG4gICAgfVxuXG4gICAgdmFyIGNvbnRlbnQgPSAnJztcbiAgICB2YXIgY291bnQgPSBuIC0gMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBjb3VudDsgaSsrKSB7XG4gICAgICBfZGF0YSA9IHtcbiAgICAgICAgaW5kZXg6IGRpZ2l0cy5wYWQoKGkgKyAxKSwge2F1dG86IG59KVxuICAgICAgfTtcbiAgICAgIGNvbnRlbnQgKz0gb3B0aW9ucy5mbih0aGlzLCB7ZGF0YTogX2RhdGF9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBoYW5kbGViYXJzLlNhZmVTdHJpbmcoY29udGVudCk7XG4gIH0pOyIsIiMjIypcbiAqIFByaW1hcnkgYXBwbGljYXRpb24gbW9kZWwgd2hpY2ggY29vcmRpbmF0ZXMgc3RhdGVcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbk1vZGVsICAgICA9IHJlcXVpcmUgJy4uL3N1cGVycy9Nb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwTW9kZWwgZXh0ZW5kcyBNb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ3ZpZXcnOiAgICAgICAgbnVsbFxuICAgICAgJ3BsYXlpbmcnOiAgICAgbnVsbFxuICAgICAgJ211dGUnOiAgICAgICAgbnVsbFxuXG4gICAgICAna2l0TW9kZWwnOiAgICBudWxsXG5cbiAgICAgICMgRm9yIGV4cG9ydGluZyBzaGFyZSBmdW5jdGlvbmFsaXR5XG4gICAgICAnc29uZ01vZGVsJzogICBudWxsXG5cbiAgICAgICMgU2V0dGluZ3NcbiAgICAgICdicG0nOiAgICAgICAgIEFwcENvbmZpZy5CUE1cblxuXG4gICBleHBvcnQ6IC0+XG4gICAgICBqc29uID0gQHRvSlNPTigpXG5cbiAgICAgIGpzb24ua2l0TW9kZWwgPSBqc29uLmtpdE1vZGVsLnRvSlNPTigpXG4gICAgICBqc29uLmtpdE1vZGVsLmluc3RydW1lbnRzID0ganNvbi5raXRNb2RlbC5pbnN0cnVtZW50cy50b0pTT04oKVxuICAgICAganNvbi5raXRNb2RlbC5pbnN0cnVtZW50cyA9IF8ubWFwIGpzb24ua2l0TW9kZWwuaW5zdHJ1bWVudHMsIChpbnN0cnVtZW50KSAtPlxuICAgICAgICAgaW5zdHJ1bWVudC5wYXR0ZXJuU3F1YXJlcyA9IGluc3RydW1lbnQucGF0dGVyblNxdWFyZXMudG9KU09OKClcblxuICAgICAgICAgcmV0dXJuIGluc3RydW1lbnRcbiAgICAgIHJldHVybiBqc29uXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBNb2RlbCIsIiMjIypcbiAqIENvbGxlY3Rpb24gb2Ygc291bmQga2l0c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvQ29sbGVjdGlvbi5jb2ZmZWUnXG5BcHBDb25maWcgID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRNb2RlbCAgID0gcmVxdWlyZSAnLi9LaXRNb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgS2l0Q29sbGVjdGlvbiBleHRlbmRzIENvbGxlY3Rpb25cblxuXG4gICAjIFVybCB0byBkYXRhIGZvciBmZXRjaFxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICB1cmw6IFwiI3tBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJyl9L3NvdW5kLWRhdGEuanNvblwiXG5cblxuICAgIyBJbmRpdmlkdWFsIGRydW1raXQgYXVkaW8gc2V0c1xuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIG1vZGVsOiBLaXRNb2RlbFxuXG5cbiAgICMgVGhlIGN1cnJlbnQgdXNlci1zZWxlY3RlZCBraXRcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAga2l0SWQ6IDBcblxuXG5cbiAgICMgUGFyc2VzIHRoZSBjb2xsZWN0aW9uIHRvIGFzc2lnbiBwYXRocyB0byBlYWNoIGluZGl2aWR1YWwgc291bmRcbiAgICMgYmFzZWQgdXBvbiBjb25maWd1cmF0aW9uIGRhdGFcbiAgICMgQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG5cbiAgIHBhcnNlOiAocmVzcG9uc2UpIC0+XG4gICAgICBhc3NldFBhdGggPSByZXNwb25zZS5jb25maWcuYXNzZXRQYXRoXG4gICAgICBraXRzID0gcmVzcG9uc2Uua2l0c1xuXG4gICAgICBraXRzID0gXy5tYXAga2l0cywgKGtpdCkgLT5cbiAgICAgICAgIGtpdC5wYXRoID0gYXNzZXRQYXRoICsgJy8nICsga2l0LmZvbGRlclxuICAgICAgICAgcmV0dXJuIGtpdFxuXG4gICAgICByZXR1cm4ga2l0c1xuXG5cblxuXG4gICAjIEl0ZXJhdGVzIHRocm91Z2ggdGhlIGNvbGxlY3Rpb24gYW5kIHJldHVybnMgYSBzcGVjaWZpYyBpbnN0cnVtZW50XG4gICAjIGJ5IG1hdGNoaW5nIGFzc29jaWF0ZWQgaWRcbiAgICMgQHBhcmFtIHtOdW1iZXJ9IGlkXG5cbiAgIGZpbmRJbnN0cnVtZW50TW9kZWw6IChpZCkgLT5cbiAgICAgIGluc3RydW1lbnRNb2RlbCA9IG51bGxcblxuICAgICAgQGVhY2ggKGtpdE1vZGVsKSA9PlxuICAgICAgICAga2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgICAgICAgaWYgaWQgaXMgbW9kZWwuZ2V0KCdpZCcpXG4gICAgICAgICAgICAgICBpbnN0cnVtZW50TW9kZWwgPSBtb2RlbFxuXG4gICAgICBpZiBpbnN0cnVtZW50TW9kZWwgaXMgbnVsbFxuICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgIGluc3RydW1lbnRNb2RlbFxuXG5cblxuXG4gICAjIEN5Y2xlcyB0aGUgY3VycmVudCBkcnVtIGtpdCBiYWNrXG4gICAjIEByZXR1cm4ge0tpdE1vZGVsfVxuXG4gICBwcmV2aW91c0tpdDogLT5cbiAgICAgIGxlbiA9IEBsZW5ndGhcblxuICAgICAgaWYgQGtpdElkID4gMFxuICAgICAgICAgQGtpdElkLS1cblxuICAgICAgZWxzZVxuICAgICAgICAgQGtpdElkID0gbGVuIC0gMVxuXG4gICAgICBraXRNb2RlbCA9IEBhdCBAa2l0SWRcblxuXG5cblxuICAgIyBDeWNsZXMgdGhlIGN1cnJlbnQgZHJ1bSBraXQgZm9yd2FyZFxuICAgIyBAcmV0dXJuIHtLaXRNb2RlbH1cblxuICAgbmV4dEtpdDogLT5cbiAgICAgIGxlbiA9IEBsZW5ndGggLSAxXG5cbiAgICAgIGlmIEBraXRJZCA8IGxlblxuICAgICAgICAgQGtpdElkKytcblxuICAgICAgZWxzZVxuICAgICAgICAgQGtpdElkID0gMFxuXG4gICAgICBraXRNb2RlbCA9IEBhdCBAa2l0SWRcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2l0Q29sbGVjdGlvbiIsIiMjIypcbiAqIEtpdCBtb2RlbCBmb3IgaGFuZGxpbmcgc3RhdGUgcmVsYXRlZCB0byBraXQgc2VsZWN0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuTW9kZWwgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvTW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlJ1xuXG5cbmNsYXNzIEtpdE1vZGVsIGV4dGVuZHMgTW9kZWxcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICdsYWJlbCc6ICAgIG51bGxcbiAgICAgICdwYXRoJzogICAgIG51bGxcbiAgICAgICdmb2xkZXInOiAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7SW5zdHJ1bWVudENvbGxlY3Rpb259XG4gICAgICAnaW5zdHJ1bWVudHMnOiAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICAgICAgJ2N1cnJlbnRJbnN0cnVtZW50JzogbnVsbFxuXG5cblxuICAgIyBGb3JtYXQgdGhlIHJlc3BvbnNlIHNvIHRoYXQgaW5zdHJ1bWVudHMgZ2V0cyBwcm9jZXNzZWRcbiAgICMgYnkgYmFja2JvbmUgdmlhIHRoZSBJbnN0cnVtZW50Q29sbGVjdGlvbi4gIEFkZGl0aW9uYWxseSxcbiAgICMgcGFzcyBpbiB0aGUgcGF0aCBzbyB0aGF0IGFic29sdXRlIFVSTCdzIGNhbiBiZSB1c2VkXG4gICAjIHRvIHJlZmVyZW5jZSBzb3VuZCBkYXRhXG4gICAjIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuXG4gICBwYXJzZTogKHJlc3BvbnNlKSAtPlxuICAgICAgXy5lYWNoIHJlc3BvbnNlLmluc3RydW1lbnRzLCAoaW5zdHJ1bWVudCkgLT5cbiAgICAgICAgIGluc3RydW1lbnQuaWQgPSBfLnVuaXF1ZUlkICdpbnN0cnVtZW50LSdcbiAgICAgICAgIGluc3RydW1lbnQuc3JjID0gcmVzcG9uc2UucGF0aCArICcvJyArIGluc3RydW1lbnQuc3JjXG5cbiAgICAgIHJlc3BvbnNlLmluc3RydW1lbnRzID0gbmV3IEluc3RydW1lbnRDb2xsZWN0aW9uIHJlc3BvbnNlLmluc3RydW1lbnRzXG5cbiAgICAgIHJlc3BvbnNlXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2l0TW9kZWwiLCIjIyMqXG4gKiBNb2RlbCBmb3IgdGhlIGVudGlyZSBQYWQgY29tcG9uZW50XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI0LjE0XG4jIyNcblxuTW9kZWwgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvTW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIExpdmVQYWRNb2RlbCBleHRlbmRzIE1vZGVsXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMaXZlUGFkTW9kZWxcbiIsIiMjIypcbiAqIENvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBQYWRTcXVhcmVNb2RlbHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICcuLi9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcbkNvbGxlY3Rpb24gICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Db2xsZWN0aW9uLmNvZmZlZSdcblxuXG5jbGFzcyBQYWRTcXVhcmVDb2xsZWN0aW9uIGV4dGVuZHMgQ29sbGVjdGlvblxuXG4gICBtb2RlbDogSW5zdHJ1bWVudE1vZGVsXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYWRTcXVhcmVDb2xsZWN0aW9uIiwiIyMjKlxuICogTW9kZWwgZm9yIGluZGl2aWR1YWwgcGFkIHNxdWFyZXMuXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI0LjE0XG4jIyNcblxuTW9kZWwgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvTW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIFBhZFNxdWFyZU1vZGVsIGV4dGVuZHMgTW9kZWxcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICdkcmFnZ2luZyc6ICBmYWxzZVxuICAgICAgJ2tleWNvZGUnOiAgIG51bGxcbiAgICAgICd0cmlnZ2VyJzogICBmYWxzZVxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICAgICAnY3VycmVudEluc3RydW1lbnQnOiAgbnVsbFxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAc2V0ICdpZCcsIF8udW5pcXVlSWQgJ3BhZC1zcXVhcmUtJ1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYWRTcXVhcmVNb2RlbFxuIiwiIyMjKlxuICogQ29sbGVjdGlvbiByZXByZXNlbnRpbmcgZWFjaCBzb3VuZCBmcm9tIGEga2l0IHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4vSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcbkNvbGxlY3Rpb24gICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Db2xsZWN0aW9uLmNvZmZlZSdcblxuXG5jbGFzcyBJbnN0cnVtZW50Q29sbGVjdGlvbiBleHRlbmRzIENvbGxlY3Rpb25cblxuXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICBtb2RlbDogSW5zdHJ1bWVudE1vZGVsXG5cblxuXG4gICAjIEV4cG9ydHMgdGhlIHBhdHRlcm4gc3F1YXJlcyBjb2xsZWN0aW9uIGZvciB1c2VcbiAgICMgd2l0aCB0cmFuc2ZlcnJpbmcgcHJvcHMgYWNyb3NzIGRpZmZlcmVudCBkcnVtIGtpdHNcblxuICAgZXhwb3J0UGF0dGVyblNxdWFyZXM6IC0+XG4gICAgICByZXR1cm4gQG1hcCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgICAgIGluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50Q29sbGVjdGlvbiIsIiMjIypcbiAqIFNvdW5kIG1vZGVsIGZvciBlYWNoIGluZGl2aWR1YWwga2l0IHNvdW5kIHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuTW9kZWwgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL01vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBJbnN0cnVtZW50TW9kZWwgZXh0ZW5kcyBNb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuXG4gICAgICAjIElmIGFjdGl2ZSwgc291bmQgY2FuIHBsYXlcbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgICAgICdhY3RpdmUnOiAgIG51bGxcblxuXG4gICAgICAjIEZsYWcgdG8gY2hlY2sgaWYgaW5zdHJ1bWVudCBoYXMgYmVlbiBkcm9wcGVkIG9udG8gcGFkIHNxdWFyZVxuICAgICAgIyBAdHlwZSB7Qm9vbGVhbn1cblxuICAgICAgJ2Ryb3BwZWQnOiAgZmFsc2VcblxuXG4gICAgICAjIENhY2hlIG9mIHRoZSBvcmlnaW5hbCBtb3VzZSBkcmFnIGV2ZW50IGluIG9yZGVyIHRvIHVwZGF0ZSB0aGVcbiAgICAgICMgZHJhZyBwb3NpdGlvbiB3aGVuIGRpc2xvZGdpbmcgaW4gaW5zdHJ1bWVudCBmcm9tIHRoZSBQYWRTcXVhcmVcbiAgICAgICMgQHR5cGUge01vdXNlRXZlbnR9XG5cbiAgICAgICdkcm9wcGVkRXZlbnQnOiBudWxsXG5cblxuICAgICAgIyBGbGFnIHRvIGNoZWNrIGlmIGF1ZGlvIGZvY3VzIGlzIHNldCBvbiBhIHBhcnRpY3VsYXIgaW5zdHJ1bWVudC5cbiAgICAgICMgSWYgc28sIGl0IG11dGVzIGFsbCBvdGhlciB0cmFja3MuXG4gICAgICAjIEB0eXBlIHtCb29sZWFufVxuXG4gICAgICAnZm9jdXMnOiAgICBudWxsXG5cblxuICAgICAgIyBUaGUgaWNvbiBjbGFzcyB0aGF0IHJlcHJlc2VudHMgdGhlIGluc3RydW1lbnRcbiAgICAgICMgQHR5cGUge1N0cmluZ31cblxuICAgICAgJ2ljb24nOiAgICAgbnVsbFxuXG5cbiAgICAgICMgVGhlIHRleHQgbGFiZWwgZGVzY3JpYmluZyB0aGUgaW5zdHJ1bWVudFxuICAgICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICAgICAnbGFiZWwnOiAgICBudWxsXG5cblxuICAgICAgIyBNdXRlIG9yIHVubXV0ZSBzZXR0aW5nXG4gICAgICAjIEB0eXBlIHtCb29sZWFufVxuXG4gICAgICAnbXV0ZSc6ICAgICBudWxsXG5cblxuICAgICAgIyBUaGUgcGF0aCB0byB0aGUgc291bmQgc291cmNlXG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgICAgICdzcmMnOiAgICAgIG51bGxcblxuXG4gICAgICAjIFRoZSB2b2x1bWVcbiAgICAgICMgQHR5cGUge051bWJlcn1cbiAgICAgICd2b2x1bWUnOiAgIG51bGxcblxuXG4gICAgICAjIENvbGxlY3Rpb24gb2YgYXNzb2NpYXRlZCBwYXR0ZXJuIHNxdWFyZXMgKGEgdHJhY2spIGZvciB0aGVcbiAgICAgICMgU2VxdWVuY2VyIHZpZXcuICBVcGRhdGVkIHdoZW4gdGhlIHRyYWNrcyBhcmUgc3dhcHBlZCBvdXRcbiAgICAgICMgQHR5cGUge1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9ufVxuXG4gICAgICAncGF0dGVyblNxdWFyZXMnOiAgICBudWxsXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRNb2RlbCIsIiMjIypcbiAgQSBjb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgcGF0dGVybiBzcXVhcmVzXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5QdWJTdWIgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9QdWJTdWInXG5BcHBFdmVudCAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuQXBwQ29uZmlnICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5Db2xsZWN0aW9uICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvQ29sbGVjdGlvbi5jb2ZmZWUnXG5JbnN0cnVtZW50TW9kZWwgICAgPSByZXF1aXJlICcuLi9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiBleHRlbmRzIENvbGxlY3Rpb25cblxuICAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgI1B1YlN1Yi5vbiBBcHBFdmVudC5JTVBPUlRfVFJBQ0ssIEBvbkltcG9ydFRyYWNrXG4gICAgICAjUHViU3ViLm9uIEFwcEV2ZW50LkVYUE9SVF9UUkFDSywgQG9uRXhwb3J0VHJhY2tcblxuXG4gICBvbkltcG9ydFRyYWNrOiAocGFyYW1zKSAtPlxuICAgICAgY29uc29sZS5sb2cgJ2ZpcmluZyBpbXBvcnQhISdcblxuXG4gICBvbkV4cG9ydFRyYWNrOiAocGFyYW1zKSAtPlxuICAgICAgY29uc29sZS5sb2cgJ2ZpcmluZyBleHBvcnQhISdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uIiwiIyMjKlxuICBNb2RlbCBmb3IgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXMuICBQYXJ0IG9mIGxhcmdlciBQYXR0ZXJuIFRyYWNrIGNvbGxlY3Rpb25cblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbk1vZGVsICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Nb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgUGF0dGVyblNxdWFyZU1vZGVsIGV4dGVuZHMgTW9kZWxcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICdhY3RpdmUnOiAgICAgICAgICAgZmFsc2VcbiAgICAgICdpbnN0cnVtZW50JzogICAgICAgbnVsbFxuICAgICAgJ3ByZXZpb3VzVmVsb2NpdHknOiAwXG4gICAgICAndHJpZ2dlcic6ICAgICAgICAgIG51bGxcbiAgICAgICd2ZWxvY2l0eSc6ICAgICAgICAgMFxuXG5cblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBvbiBBcHBFdmVudC5DSEFOR0VfVkVMT0NJVFksIEBvblZlbG9jaXR5Q2hhbmdlXG5cblxuXG4gICBjeWNsZTogLT5cbiAgICAgIHZlbG9jaXR5ID0gQGdldCAndmVsb2NpdHknXG5cbiAgICAgIGlmIHZlbG9jaXR5IDwgQXBwQ29uZmlnLlZFTE9DSVRZX01BWFxuICAgICAgICAgdmVsb2NpdHkrK1xuXG4gICAgICBlbHNlXG4gICAgICAgICB2ZWxvY2l0eSA9IDBcblxuICAgICAgQHNldCAndmVsb2NpdHknLCB2ZWxvY2l0eVxuXG5cblxuICAgZW5hYmxlOiAtPlxuICAgICAgQHNldCAndmVsb2NpdHknLCAxXG5cblxuXG5cbiAgIGRpc2FibGU6IC0+XG4gICAgICBAc2V0ICd2ZWxvY2l0eScsIDBcblxuXG5cbiAgIG9uVmVsb2NpdHlDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIEBzZXQgJ3ByZXZpb3VzVmVsb2NpdHknLCBtb2RlbC5fcHJldmlvdXNBdHRyaWJ1dGVzLnZlbG9jaXR5XG5cbiAgICAgIHZlbG9jaXR5ID0gbW9kZWwuY2hhbmdlZC52ZWxvY2l0eVxuXG4gICAgICBpZiB2ZWxvY2l0eSA+IDBcbiAgICAgICAgIEBzZXQgJ2FjdGl2ZScsIHRydWVcblxuICAgICAgZWxzZSBpZiB2ZWxvY2l0eSBpcyAwXG4gICAgICAgICBAc2V0ICdhY3RpdmUnLCBmYWxzZVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmVNb2RlbCIsIiMjIypcbiAqIE1QQyBBcHBsaWNhdGlvbiByb3V0ZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBDb25maWcgICA9IHJlcXVpcmUgJy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuUHViU3ViICAgICAgPSByZXF1aXJlICcuLi91dGlscy9QdWJTdWInXG5QdWJFdmVudCAgICA9IHJlcXVpcmUgJy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5cbiMgVE9ETzogVGhlIGJlbG93IGl0ZW1zIGFyZSBvbmx5IGluY2x1ZGVkIGZvciB0ZXN0aW5nIGNvbXBvbmVudFxuIyBtb2R1bGFyaXR5LiAgVGhleSwgYW5kIHRoZWlyIHJvdXRlcywgc2hvdWxkIGJlIHJlbW92ZWQgaW4gcHJvZHVjdGlvblxuXG5UZXN0c1ZpZXcgICAgID0gcmVxdWlyZSAnLi4vdmlld3MvdGVzdHMvVGVzdHNWaWV3LmNvZmZlZSdcblxuVmlldyA9IHJlcXVpcmUgJy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblxuS2l0U2VsZWN0b3IgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3IuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuS2l0TW9kZWwgICAgICA9IHJlcXVpcmUgJy4uL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSdcblxuQlBNSW5kaWNhdG9yICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci5jb2ZmZWUnXG5JbnN0cnVtZW50U2VsZWN0b3JQYW5lbCA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLmNvZmZlZSdcblxuSW5zdHJ1bWVudE1vZGVsID0gJy4uL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcbkluc3RydW1lbnRDb2xsZWN0aW9uID0gJy4uL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlJ1xuXG5QYXR0ZXJuU3F1YXJlID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUuY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAnLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5UcmFjayAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLmNvZmZlZSdcblNlcXVlbmNlciAgICAgICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuXG5MaXZlUGFkTW9kZWwgPSByZXF1aXJlICcuLi9tb2RlbHMvcGFkL0xpdmVQYWRNb2RlbC5jb2ZmZWUnXG5QYWRTcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhZFNxdWFyZU1vZGVsID0gcmVxdWlyZSAnLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVNb2RlbC5jb2ZmZWUnXG5MaXZlUGFkID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL0xpdmVQYWQuY29mZmVlJ1xuUGFkU3F1YXJlID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL1BhZFNxdWFyZS5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwUm91dGVyIGV4dGVuZHMgQmFja2JvbmUuUm91dGVyXG5cblxuICAgcm91dGVzOlxuICAgICAgJyc6ICAgICAgICAgICAgICdsYW5kaW5nUm91dGUnXG4gICAgICAnY3JlYXRlJzogICAgICAgJ2NyZWF0ZVJvdXRlJ1xuICAgICAgJ3NoYXJlJzogICAgICAgICdzaGFyZVJvdXRlJ1xuXG4gICAgICAjIENvbXBvbmVudCB0ZXN0IHJvdXRlc1xuICAgICAgJ3Rlc3RzJzogICAgICAgICAgICAgICAgJ3Rlc3RzJ1xuICAgICAgJ2tpdC1zZWxlY3Rpb24nOiAgICAgICAgJ2tpdFNlbGVjdGlvblJvdXRlJ1xuICAgICAgJ2JwbS1pbmRpY2F0b3InOiAgICAgICAgJ2JwbUluZGljYXRvclJvdXRlJ1xuICAgICAgJ2luc3RydW1lbnQtc2VsZWN0b3InOiAgJ2luc3RydW1lbnRTZWxlY3RvclJvdXRlJ1xuICAgICAgJ3BhdHRlcm4tc3F1YXJlJzogICAgICAgJ3BhdHRlcm5TcXVhcmVSb3V0ZSdcbiAgICAgICdwYXR0ZXJuLXRyYWNrJzogICAgICAgICdwYXR0ZXJuVHJhY2tSb3V0ZSdcbiAgICAgICdzZXF1ZW5jZXInOiAgICAgICAgICAgICdzZXF1ZW5jZXJSb3V0ZSdcbiAgICAgICdmdWxsLXNlcXVlbmNlcic6ICAgICAgICdmdWxsU2VxdWVuY2VyUm91dGUnXG4gICAgICAncGFkLXNxdWFyZSc6ICAgICAgICAgICAncGFkU3F1YXJlUm91dGUnXG4gICAgICAnbGl2ZS1wYWQnOiAgICAgICAgICAgICAnbGl2ZVBhZFJvdXRlJ1xuXG5cblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICB7QGFwcENvbnRyb2xsZXIsIEBhcHBNb2RlbH0gPSBvcHRpb25zXG5cbiAgICAgIFB1YlN1Yi5vbiBQdWJFdmVudC5ST1VURSwgQG9uUm91dGVDaGFuZ2VcblxuXG5cbiAgIG9uUm91dGVDaGFuZ2U6IChwYXJhbXMpID0+XG4gICAgICB7cm91dGV9ID0gcGFyYW1zXG5cbiAgICAgIEBuYXZpZ2F0ZSByb3V0ZSwgeyB0cmlnZ2VyOiB0cnVlIH1cblxuXG5cbiAgIGxhbmRpbmdSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBAYXBwQ29udHJvbGxlci5sYW5kaW5nVmlld1xuXG5cblxuICAgY3JlYXRlUm91dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgQGFwcENvbnRyb2xsZXIuY3JlYXRlVmlld1xuXG5cblxuICAgc2hhcmVSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBAYXBwQ29udHJvbGxlci5zaGFyZVZpZXdcblxuXG5cblxuXG5cbiAgICMgQ09NUE9ORU5UIFRFU1QgUk9VVEVTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgdGVzdHM6IC0+XG4gICAgICB2aWV3ID0gbmV3IFRlc3RzVmlldygpXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cbiAgIGtpdFNlbGVjdGlvblJvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IEtpdFNlbGVjdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbixcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAgYnBtSW5kaWNhdG9yUm91dGU6IC0+XG4gICAgICB2aWV3ID0gbmV3IEJQTUluZGljYXRvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICB2aWV3LnJlbmRlcigpXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cbiAgIGluc3RydW1lbnRTZWxlY3RvclJvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIHZpZXcgPSBuZXcgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cbiAgIHBhdHRlcm5TcXVhcmVSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBQYXR0ZXJuU3F1YXJlXG4gICAgICAgICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG5ldyBQYXR0ZXJuU3F1YXJlTW9kZWwoKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuICAgcGF0dGVyblRyYWNrUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgUGF0dGVyblRyYWNrXG4gICAgICAgICBtb2RlbDogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG4gICBzZXF1ZW5jZXJSb3V0ZTogLT5cblxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IFNlcXVlbmNlclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG4gICBmdWxsU2VxdWVuY2VyUm91dGU6IC0+XG5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuXG4gICAgICBraXRTZWxlY3Rpb24gPSA9PlxuICAgICAgICAgdmlldyA9IG5ldyBLaXRTZWxlY3RvclxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgICAgdmlld1xuXG5cbiAgICAgIGJwbSA9ID0+XG4gICAgICAgICB2aWV3ID0gbmV3IEJQTUluZGljYXRvclxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICAgICB2aWV3XG5cblxuICAgICAgaW5zdHJ1bWVudFNlbGVjdGlvbiA9ID0+XG4gICAgICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgICAgIHZpZXcgPSBuZXcgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWxcbiAgICAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgICAgIHZpZXdcblxuXG4gICAgICBzZXF1ZW5jZXIgPSA9PlxuICAgICAgICAgdmlldyA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICAgICB2aWV3XG5cbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3ID0gbmV3IFZpZXcoKVxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcuJGVsLmFwcGVuZCBraXRTZWxlY3Rpb24oKS5yZW5kZXIoKS5lbFxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcuJGVsLmFwcGVuZCBicG0oKS5yZW5kZXIoKS5lbFxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcuJGVsLmFwcGVuZCBpbnN0cnVtZW50U2VsZWN0aW9uKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgc2VxdWVuY2VyKCkucmVuZGVyKCkuZWxcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIGZ1bGxTZXF1ZW5jZXJWaWV3XG5cblxuXG5cbiAgIHBhZFNxdWFyZVJvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IFBhZFNxdWFyZVxuICAgICAgICAgbW9kZWw6IG5ldyBQYWRTcXVhcmVNb2RlbCgpXG4gICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cblxuICAgbGl2ZVBhZFJvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IExpdmVQYWRcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwUm91dGVyIiwiIyMjKlxuICogQ29sbGVjdGlvbiBzdXBlcmNsYXNzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI1LjE0XG4jIyNcblxuXG5jbGFzcyBDb2xsZWN0aW9uIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uIiwiIyMjKlxuICogTW9kZWwgc3VwZXJjbGFzc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNS4xNFxuIyMjXG5cblxuY2xhc3MgTW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbCIsIiMjIypcbiAqIFZpZXcgc3VwZXJjbGFzcyBjb250YWluaW5nIHNoYXJlZCBmdW5jdGlvbmFsaXR5XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAyLjE3LjE0XG4jIyNcblxuXG5jbGFzcyBWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG5cbiAgICMgSW5pdGlhbGl6ZXMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBfLmV4dGVuZCBALCBfLmRlZmF1bHRzKCBvcHRpb25zID0gb3B0aW9ucyB8fCBAZGVmYXVsdHMsIEBkZWZhdWx0cyB8fCB7fSApXG5cblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IHdpdGggc3VwcGxpZWQgdGVtcGxhdGUgZGF0YSwgb3IgY2hlY2tzIGlmIHRlbXBsYXRlIGlzIG9uXG4gICAjIG9iamVjdCBib2R5XG4gICAjIEBwYXJhbSAge0Z1bmN0aW9ufE1vZGVsfSB0ZW1wbGF0ZURhdGFcbiAgICMgQHJldHVybiB7Vmlld31cblxuICAgcmVuZGVyOiAodGVtcGxhdGVEYXRhKSAtPlxuICAgICAgdGVtcGxhdGVEYXRhID0gdGVtcGxhdGVEYXRhIHx8IHt9XG5cbiAgICAgIGlmIEB0ZW1wbGF0ZVxuXG4gICAgICAgICAjIElmIG1vZGVsIGlzIGFuIGluc3RhbmNlIG9mIGEgYmFja2JvbmUgbW9kZWwsIHRoZW4gSlNPTmlmeSBpdFxuICAgICAgICAgaWYgQG1vZGVsIGluc3RhbmNlb2YgQmFja2JvbmUuTW9kZWxcbiAgICAgICAgICAgIHRlbXBsYXRlRGF0YSA9IEBtb2RlbC50b0pTT04oKVxuXG4gICAgICAgICBAJGVsLmh0bWwgQHRlbXBsYXRlICh0ZW1wbGF0ZURhdGEpXG5cbiAgICAgIEBkZWxlZ2F0ZUV2ZW50cygpXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG4gICAgICBAXG5cblxuXG5cbiAgICMgUmVtb3ZlcyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW1vdmU6IChvcHRpb25zKSAtPlxuICAgICAgQHJlbW92ZUV2ZW50TGlzdGVuZXJzKClcbiAgICAgIEAkZWwucmVtb3ZlKClcbiAgICAgIEB1bmRlbGVnYXRlRXZlbnRzKClcblxuXG5cblxuXG4gICAjIFNob3dzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHNob3c6IChvcHRpb25zKSAtPlxuICAgICAgVHdlZW5NYXguc2V0IEAkZWwsIHsgYXV0b0FscGhhOiAxIH1cblxuXG5cblxuICAgIyBIaWRlcyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBoaWRlOiAob3B0aW9ucykgLT5cbiAgICAgIFR3ZWVuTWF4LnNldCBAJGVsLFxuICAgICAgICAgYXV0b0FscGhhOiAwXG4gICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgaWYgb3B0aW9ucz8ucmVtb3ZlXG4gICAgICAgICAgICAgICBAcmVtb3ZlKClcblxuXG5cblxuICAgIyBOb29wIHdoaWNoIGlzIGNhbGxlZCBvbiByZW5kZXJcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG5cblxuXG4gICAjIFJlbW92ZXMgYWxsIHJlZ2lzdGVyZWQgbGlzdGVuZXJzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3IiwiLyoqXG4gKiBAbW9kdWxlICAgICBQdWJTdWJcbiAqIEBkZXNjICAgICAgIEdsb2JhbCBQdWJTdWIgb2JqZWN0IGZvciBkaXNwYXRjaCBhbmQgZGVsZWdhdGlvblxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG52YXIgUHViU3ViID0ge31cblxuXy5leHRlbmQoIFB1YlN1YiwgQmFja2JvbmUuRXZlbnRzIClcblxubW9kdWxlLmV4cG9ydHMgPSBQdWJTdWIiLCIjIyMqXG4gKiBDcmVhdGUgdmlldyB3aGljaCB0aGUgdXNlciBjYW4gYnVpbGQgYmVhdHMgd2l0aGluXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuUHViU3ViICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9QdWJTdWInXG5WaWV3ICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbkFwcEV2ZW50ICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcbktpdFNlbGVjdG9yICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3IuY29mZmVlJ1xuSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUnXG5TZXF1ZW5jZXIgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuQlBNSW5kaWNhdG9yICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xudGVtcGxhdGUgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9jcmVhdGUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIENyZWF0ZVZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5idG4tc2hhcmUnOiAgJ29uU2hhcmVCdG5DbGljaydcbiAgICAgICd0b3VjaGVuZCAuYnRuLWV4cG9ydCc6ICdvbkV4cG9ydEJ0bkNsaWNrJ1xuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAka2l0U2VsZWN0b3JDb250YWluZXIgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1raXQtc2VsZWN0b3InXG4gICAgICBAJGtpdFNlbGVjdG9yICAgICAgICAgICAgPSBAJGVsLmZpbmQgJy5raXQtc2VsZWN0b3InXG4gICAgICBAJHZpc3VhbGl6YXRpb25Db250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItdmlzdWFsaXphdGlvbidcbiAgICAgIEAkc2VxdWVuY2VyQ29udGFpbmVyICAgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1zZXF1ZW5jZXInXG4gICAgICBAJGluc3RydW1lbnRTZWxlY3RvciAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuaW5zdHJ1bWVudC1zZWxlY3RvcidcbiAgICAgIEAkc2VxdWVuY2VyICAgICAgICAgICAgICA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5zZXF1ZW5jZXInXG4gICAgICBAJGJwbSAgICAgICAgICAgICAgICAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuYnBtJ1xuICAgICAgQCRzaGFyZUJ0biAgICAgICAgICAgICAgID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLmJ0bi1zaGFyZSdcblxuICAgICAgQHJlbmRlcktpdFNlbGVjdG9yKClcbiAgICAgIEByZW5kZXJJbnN0cnVtZW50U2VsZWN0b3IoKVxuICAgICAgQHJlbmRlclNlcXVlbmNlcigpXG4gICAgICBAcmVuZGVyQlBNKClcblxuICAgICAgQFxuXG5cblxuICAgcmVuZGVyS2l0U2VsZWN0b3I6IC0+XG4gICAgICBAa2l0U2VsZWN0b3IgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIEAka2l0U2VsZWN0b3IuaHRtbCBAa2l0U2VsZWN0b3IucmVuZGVyKCkuZWxcblxuXG5cbiAgIHJlbmRlckluc3RydW1lbnRTZWxlY3RvcjogLT5cbiAgICAgIEBpbnN0cnVtZW50U2VsZWN0b3IgPSBuZXcgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWxcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIEAkaW5zdHJ1bWVudFNlbGVjdG9yLmh0bWwgQGluc3RydW1lbnRTZWxlY3Rvci5yZW5kZXIoKS5lbFxuXG5cblxuICAgcmVuZGVyU2VxdWVuY2VyOiAtPlxuICAgICAgQHNlcXVlbmNlciA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICBAJHNlcXVlbmNlci5odG1sIEBzZXF1ZW5jZXIucmVuZGVyKCkuZWxcblxuXG5cbiAgIHJlbmRlckJQTTogLT5cbiAgICAgIEBicG0gPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEAkYnBtLmh0bWwgQGJwbS5yZW5kZXIoKS5lbFxuXG5cblxuICAgb25FeHBvcnRCdG5DbGljazogKGV2ZW50KSA9PlxuICAgICAgQHBhdHRlcm5TcXVhcmVHcm91cHMgPSBbXVxuICAgICAgQHBhdHRlcm5TcXVhcmVzID0gW11cblxuICAgICAgaW5zdHJ1bWVudHMgPSBAYXBwTW9kZWwuZXhwb3J0KCkua2l0TW9kZWwuaW5zdHJ1bWVudHNcblxuICAgICAgaW5zdHJ1bWVudHMuZm9yRWFjaCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgICAgIGluc3RydW1lbnQucGF0dGVyblNxdWFyZXMuZm9yRWFjaCAocGF0dGVyblNxdWFyZSkgPT5cbiAgICAgICAgICAgIGRlbGV0ZSBwYXR0ZXJuU3F1YXJlLmluc3RydW1lbnRcbiAgICAgICAgICAgIEBwYXR0ZXJuU3F1YXJlcy5wdXNoIHBhdHRlcm5TcXVhcmVcblxuICAgICAgd2hpbGUgKEBwYXR0ZXJuU3F1YXJlcy5sZW5ndGggPiAwKVxuICAgICAgICAgQHBhdHRlcm5TcXVhcmVHcm91cHMucHVzaCBAcGF0dGVyblNxdWFyZXMuc3BsaWNlKDAsIDgpXG5cblxuXG5cbiAgIG9uU2hhcmVCdG5DbGljazogKGV2ZW50KSA9PlxuICAgICAgUHViU3ViLnRyaWdnZXIgQXBwRXZlbnQuSU1QT1JUX1RSQUNLLFxuICAgICAgICAgcGF0dGVyblNxdWFyZXM6IEBwYXR0ZXJuU3F1YXJlc1xuICAgICAgICAgcGF0dGVyblNxdWFyZUdyb3VwczogQHBhdHRlcm5TcXVhcmVHcm91cHNcblxuICAgICAgICAgY2FsbGJhY2s6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nICdkb25lISdcblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3JlYXRlVmlldyIsIiMjIypcbiAqIEJlYXRzIHBlciBtaW51dGUgdmlldyBmb3IgaGFuZGxpbmcgdGVtcG9cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9icG0tdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEJQTUluZGljYXRvciBleHRlbmRzIFZpZXdcblxuXG4gICAjIFJlZiB0byB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBUaGUgc2V0SW50ZXJ2YWwgdXBkYXRlIGludGVydmFsIGZvciBpbmNyZWFzaW5nIGFuZFxuICAgIyBkZWNyZWFzaW5nIEJQTSBvbiBwcmVzcyAvIHRvdWNoXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGludGVydmFsVXBkYXRlVGltZTogNzBcblxuXG4gICAjIFRoZSBzZXRJbnRlcnZhbCB1cGRhdGVyXG4gICAjIEB0eXBlIHtTZXRJbnRlcnZhbH1cblxuICAgdXBkYXRlSW50ZXJ2YWw6IG51bGxcblxuXG4gICAjIFRoZSBhbW91bnQgdG8gaW5jcmVhc2UgdGhlIEJQTSBieSBvbiBlYWNoIHRpY2tcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgYnBtSW5jcmVhc2VBbW91bnQ6IDEwXG5cblxuICAgIyBUaGUgY3VycmVudCBicG0gYmVmb3JlIGl0cyBzZXQgb24gdGhlIG1vZGVsLiAgVXNlZCB0byBidWZmZXJcbiAgICMgdXBkYXRlcyBhbmQgdG8gcHJvdmlkZSBmb3Igc21vb3RoIGFuaW1hdGlvblxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBjdXJyQlBNOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaHN0YXJ0IC5idG4taW5jcmVhc2UnOiAnb25JbmNyZWFzZUJ0bkRvd24nXG4gICAgICAndG91Y2hzdGFydCAuYnRuLWRlY3JlYXNlJzogJ29uRGVjcmVhc2VCdG5Eb3duJ1xuICAgICAgJ3RvdWNoZW5kICAgLmJ0bi1pbmNyZWFzZSc6ICdvbkJ0blVwJ1xuICAgICAgJ3RvdWNoZW5kICAgLmJ0bi1kZWNyZWFzZSc6ICdvbkJ0blVwJ1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgdXBkYXRlIHRoZSBraXQgaWYgbm90IGFscmVhZHlcbiAgICMgc2V0IHZpYSBhIHByZXZpb3VzIHNlc3Npb25cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRicG1MYWJlbCAgID0gQCRlbC5maW5kICcubGFiZWwtYnBtJ1xuICAgICAgQGluY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWluY3JlYXNlJ1xuICAgICAgQGRlY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWRlY3JlYXNlJ1xuXG4gICAgICBAY3VyckJQTSA9IEBhcHBNb2RlbC5nZXQoJ2JwbScpXG4gICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cbiAgICAgIEBvbkJ0blVwKClcblxuICAgICAgQFxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAgIyBzd2l0Y2hpbmcgQlBNXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0JQTSwgQG9uQlBNQ2hhbmdlXG5cblxuXG5cbiAgICMgU2V0cyBhbiBpbnRlcnZhbCB0byBpbmNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgICMgd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2VcblxuICAgaW5jcmVhc2VCUE06IC0+XG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgICAgYnBtID0gQGN1cnJCUE1cblxuICAgICAgICAgaWYgYnBtIDwgQXBwQ29uZmlnLkJQTV9NQVhcbiAgICAgICAgICAgIGJwbSArPSBAYnBtSW5jcmVhc2VBbW91bnRcblxuICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnBtID0gQXBwQ29uZmlnLkJQTV9NQVhcblxuICAgICAgICAgQGN1cnJCUE0gPSBicG1cbiAgICAgICAgIEAkYnBtTGFiZWwudGV4dCBAY3VyckJQTVxuICAgICAgICAgI0BhcHBNb2RlbC5zZXQgJ2JwbScsIDYwMDAwIC8gQGN1cnJCUE1cblxuICAgICAgLCBAaW50ZXJ2YWxVcGRhdGVUaW1lXG5cblxuXG5cbiAgICMgU2V0cyBhbiBpbnRlcnZhbCB0byBkZWNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgICMgd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2VcblxuICAgZGVjcmVhc2VCUE06IC0+XG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgICAgYnBtID0gQGN1cnJCUE1cblxuICAgICAgICAgaWYgYnBtID4gMFxuICAgICAgICAgICAgYnBtIC09IEBicG1JbmNyZWFzZUFtb3VudFxuXG4gICAgICAgICBlbHNlXG4gICAgICAgICAgICBicG0gPSAwXG5cbiAgICAgICAgIEBjdXJyQlBNID0gYnBtXG4gICAgICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cbiAgICAgICAgICNAYXBwTW9kZWwuc2V0ICdicG0nLCA2MDAwMCAvIEBjdXJyQlBNXG5cbiAgICAgICwgQGludGVydmFsVXBkYXRlVGltZVxuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkluY3JlYXNlQnRuRG93bjogKGV2ZW50KSA9PlxuICAgICAgQGluY3JlYXNlQlBNKClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uRGVjcmVhc2VCdG5Eb3duOiAoZXZlbnQpIC0+XG4gICAgICBAZGVjcmVhc2VCUE0oKVxuXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbW91c2UgLyB0b3VjaHVwIGV2ZW50cy4gIENsZWFycyB0aGUgaW50ZXJ2YWxcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25CdG5VcDogKGV2ZW50KSAtPlxuICAgICAgY2xlYXJJbnRlcnZhbCBAdXBkYXRlSW50ZXJ2YWxcbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IG51bGxcblxuICAgICAgQGFwcE1vZGVsLnNldCAnYnBtJywgNjAwMDAgLyBAY3VyckJQTVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2UgZXZlbnRzLiAgVXBkYXRlcyB0aGUgbGFiZWwgb24gdGhlXG4gICAjIGtpdCBzZWxlY3RvclxuXG4gICBvbkJQTUNoYW5nZTogKG1vZGVsKSAtPlxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQlBNSW5kaWNhdG9yIiwiIyMjKlxuICogS2l0IHNlbGVjdG9yIGZvciBzd2l0Y2hpbmcgYmV0d2VlbiBkcnVtLWtpdCBzb3VuZHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMva2l0LXNlbGVjdGlvbi10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgS2l0U2VsZWN0b3IgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBSZWYgdG8gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBLaXRDb2xsZWN0aW9uIGZvciB1cGRhdGluZyBzb3VuZHNcbiAgICMgQHR5cGUge0tpdENvbGxlY3Rpb259XG5cbiAgIGtpdENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIFRoZSBjdXJyZW50IGtpdFxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdE1vZGVsOiBudWxsXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLmJ0bi1sZWZ0JzogICAnb25MZWZ0QnRuQ2xpY2snXG4gICAgICAndG91Y2hlbmQgLmJ0bi1yaWdodCc6ICAnb25SaWdodEJ0bkNsaWNrJ1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgdXBkYXRlIHRoZSBraXQgaWYgbm90IGFscmVhZHlcbiAgICMgc2V0IHZpYSBhIHByZXZpb3VzIHNlc3Npb25cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRraXRMYWJlbCA9IEAkZWwuZmluZCAnLmxhYmVsLWtpdCdcblxuICAgICAgaWYgQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKSBpcyBudWxsXG4gICAgICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEAka2l0TGFiZWwudGV4dCBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpLmdldCAnbGFiZWwnXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAgIyBzd2l0Y2hpbmcgZHJ1bSBraXRzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uQ2hhbmdlS2l0XG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuXG4gICBvbkxlZnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5wcmV2aW91c0tpdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuXG4gICBvblJpZ2h0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSBsYWJlbCBvbiB0aGVcbiAgICMga2l0IHNlbGVjdG9yXG5cbiAgIG9uQ2hhbmdlS2l0OiAobW9kZWwpIC0+XG4gICAgICBAa2l0TW9kZWwgPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsXG4gICAgICBAJGtpdExhYmVsLnRleHQgQGtpdE1vZGVsLmdldCAnbGFiZWwnXG5cblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdFNlbGVjdG9yIiwiIyMjKlxuICogU291bmQgdHlwZSBzZWxlY3RvciBmb3IgY2hvb3Npbmcgd2hpY2ggc291bmQgc2hvdWxkXG4gKiBwbGF5IG9uIGVhY2ggdHJhY2tcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBJbnN0cnVtZW50IGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIHZpZXcgY2xhc3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnaW5zdHJ1bWVudCdcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFJlZiB0byB0aGUgSW5zdHJ1bWVudE1vZGVsXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG5cbiAgIG1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIHBhcmVudCBraXRcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRNb2RlbDogbnVsbFxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQnOiAnb25DbGljaydcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBjbGljayBldmVudHMuICBVcGRhdGVzIHRoZSBjdXJyZW50IGluc3RydW1lbnQgbW9kZWwsIHdoaWNoXG4gICAjIEluc3RydW1lbnRTZWxlY3RvclBhbmVsIGxpc3RlbnMgdG8sIGFuZCBhZGRzIGEgc2VsZWN0ZWQgc3RhdGVcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGtpdE1vZGVsLnNldCAnY3VycmVudEluc3RydW1lbnQnLCBAbW9kZWxcbiAgICAgIEAkZWwuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudCIsIiMjIypcbiAqIFBhbmVsIHdoaWNoIGhvdXNlcyBlYWNoIGluZGl2aWR1YWwgc2VsZWN0YWJsZSBzb3VuZFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuSW5zdHJ1bWVudCAgPSByZXF1aXJlICcuL0luc3RydW1lbnQuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXBhbmVsLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCBleHRlbmRzIFZpZXdcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFJlZiB0byB0aGUgYXBwbGljYXRpb24gbW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIGtpdCBjb2xsZWN0aW9uXG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQga2l0XG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0TW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byBpbnN0cnVtZW50IHZpZXdzXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgaW5zdHJ1bWVudFZpZXdzOiBudWxsXG5cblxuXG5cbiAgICMgSW5pdGlhbGl6ZXMgdGhlIGluc3RydW1lbnQgc2VsZWN0b3IgYW5kIHNldHMgYSBsb2NhbCByZWZcbiAgICMgdG8gdGhlIGN1cnJlbnQga2l0IG1vZGVsIGZvciBlYXN5IGFjY2Vzc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQGtpdE1vZGVsID0gQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKVxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYXMgd2VsbCBhcyB0aGUgYXNzb2NpYXRlZCBraXQgaW5zdHJ1bWVudHNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRjb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItaW5zdHJ1bWVudHMnXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW5kZXJzIGVhY2ggaW5kaXZpZHVhbCBraXQgbW9kZWwgaW50byBhbiBJbnN0cnVtZW50XG5cbiAgIHJlbmRlckluc3RydW1lbnRzOiAtPlxuICAgICAgQGluc3RydW1lbnRWaWV3cyA9IFtdXG5cbiAgICAgIEBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuZWFjaCAobW9kZWwpID0+XG4gICAgICAgICBpbnN0cnVtZW50ID0gbmV3IEluc3RydW1lbnRcbiAgICAgICAgICAgIGtpdE1vZGVsOiBAa2l0TW9kZWxcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuXG4gICAgICAgICBAJGNvbnRhaW5lci5hcHBlbmQgaW5zdHJ1bWVudC5yZW5kZXIoKS5lbFxuICAgICAgICAgQGluc3RydW1lbnRWaWV3cy5wdXNoIGluc3RydW1lbnRcblxuXG5cblxuICAgIyBBZGRzIGV2ZW50IGxpc3RlbmVycyByZWxhdGVkIHRvIGtpdCBjaGFuZ2VzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uS2l0Q2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGtpdE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cblxuICAgIyBSZW1vdmVzIGV2ZW50IGxpc3RlbmVyc1xuXG4gICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cblxuXG4gICAjIEVWRU5UIExJU1RFTkVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIENsZWFucyB1cCB0aGUgdmlldyBhbmQgcmUtcmVuZGVyc1xuICAgIyB0aGUgaW5zdHJ1bWVudHMgdG8gdGhlIERPTVxuICAgIyBAcGFyYW0ge0tpdE1vZGVsfSBtb2RlbFxuXG4gICBvbktpdENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQHJlbW92ZUV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQGtpdE1vZGVsID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbFxuXG4gICAgICBfLmVhY2ggQGluc3RydW1lbnRWaWV3cywgKGluc3RydW1lbnQpIC0+XG4gICAgICAgICBpbnN0cnVtZW50LnJlbW92ZSgpXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICBvbkluc3RydW1lbnRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEAkY29udGFpbmVyLmZpbmQoJy5pbnN0cnVtZW50JykucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuXG5cbiAgIG9uVGVzdENsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9J2NvbnRhaW5lci1pbnN0cnVtZW50cyc+XFxuXFxuPC9kaXY+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIjtcblxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9J2ljb24gXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmljb24pIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmljb247IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCInPjwvZGl2PlxcbjxkaXYgY2xhc3M9J2xhYmVsJz5cXG5cdFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCIjIyMqXG4gKiBMaXZlIE1QQyBcInBhZFwiIGNvbXBvbmVudFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbkFwcEV2ZW50ICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuUGFkU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYWRTcXVhcmVNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVNb2RlbC5jb2ZmZWUnXG5WaWV3ICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuUGFkU3F1YXJlICAgICAgICAgICA9IHJlcXVpcmUgJy4vUGFkU3F1YXJlLmNvZmZlZSdcbnBhZHNUZW1wbGF0ZSAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYWRzLXRlbXBsYXRlLmhicydcbmluc3RydW1lbnRzVGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50cy10ZW1wbGF0ZS5oYnMnXG50ZW1wbGF0ZSAgICAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvbGl2ZS1wYWQtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIExpdmVQYWQgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBLZXkgY29tbWFuZCBrZXltYXAgZm9yIGxpdmUga2l0IHBsYXliYWNrXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgS0VZTUFQOiBbJzEnLCcyJywnMycsJzQnLCdxJywgJ3cnLCAnZScsICdyJywgJ2EnLCAncycsICdkJywgJ2YnLCAneicsICd4JywgJ2MnLCAndiddXG5cblxuICAgIyBUaGUgY2xhc3NuYW1lIGZvciB0aGUgTGl2ZSBQYWRcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnY29udGFpbmVyLWxpdmUtcGFkJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBBcHBtb2RlbCBmb3IgbGlzdGVuaW5nIHRvIHNob3cgLyBoaWRlIGV2ZW50c1xuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBDb2xsZWN0aW9uIG9mIGtpdHMgdG8gYmUgcmVuZGVyZWQgdG8gdGhlIGluc3RydW1lbnQgY29udGFpbmVyXG4gICAjIEB0eXBlIHtLaXRDb2xsZWN0aW9ufVxuXG4gICBraXRDb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBDb2xsZWN0aW9uIG9mIGluc3RydW1lbnRzLiAgVXNlZCB0byBsaXN0ZW4gdG8gYGRyb3BwZWRgIHN0YXR1c1xuICAgIyBvbiBpbmRpdmlkdWFsIGluc3RydW1lbnQgbW9kZWxzLCBhcyBzZXQgZnJvbSB0aGUgUGFkU3F1YXJlXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cblxuICAgaW5zdHJ1bWVudENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIENvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBwYWQgc3F1YXJlIG1vZGVsc1xuICAgIyBAdHlwZSB7UGFkU3F1YXJlQ29sbGVjdGlvbn1cblxuICAgcGFkU3F1YXJlQ29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgQW4gYXJyYXkgb2YgaW5kaXZpZHVhbCBQYWRTcXVhcmVWaWV3c1xuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIHBhZFNxdWFyZVZpZXdzOiBudWxsXG5cblxuICAgIyBNb3VzZSB0cmFja2VyIHdoaWNoIGNvbnN0YW50bHkgdXBkYXRlcyBtb3VzZSAvIHRvdWNoIHBvc2l0aW9uIHZpYSAueCBhbmQgLnlcbiAgICMgQHR5cGUge09iamVjdH1cblxuICAgbW91c2VQb3NpdGlvbjogeDogMCwgeTogMFxuXG5cblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGFuZCBhbmQgcGFyc2UgdGhlIGNvbGxlY3Rpb24gaW50byBhIGRpc3BsYXlhYmxlXG4gICAjIGluc3RydW1lbnQgLyBwYWQgdGFibGVcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICMgQHJldHVybiB7TGl2ZVBhZH1cblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRwYWRzQ29udGFpbmVyICAgICAgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1wYWRzJ1xuICAgICAgQCRpbnN0cnVtZW50c0NvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1pbnN0cnVtZW50cydcblxuICAgICAgQHJlbmRlclBhZHMoKVxuICAgICAgQHJlbmRlckluc3RydW1lbnRzKClcblxuICAgICAgIyBSZW5kZXIgc3F1YXJlcyB0byB0aGUgRE9NXG4gICAgICBfLmVhY2ggQHBhZFNxdWFyZVZpZXdzLCAocGFkU3F1YXJlKSA9PlxuICAgICAgICAgaWQgPSBwYWRTcXVhcmUubW9kZWwuZ2V0ICdpZCdcbiAgICAgICAgIEAkZWwuZmluZChcIiMje2lkfVwiKS5odG1sIHBhZFNxdWFyZS5yZW5kZXIoKS5lbFxuXG4gICAgICBAc2V0RHJhZ0FuZERyb3AoKVxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQFxuXG5cblxuICAgIyBSZW5kZXJzIG91dCB0aGUgaW5zdHJ1bWVudCBwYWQgc3F1YXJlc1xuXG4gICByZW5kZXJQYWRzOiAtPlxuICAgICAgQCRwYWRzQ29udGFpbmVyLmh0bWwgcGFkc1RlbXBsYXRlIHtcbiAgICAgICAgIHBhZFRhYmxlOiBAcmV0dXJuUGFkVGFibGVEYXRhKClcbiAgICAgIH1cblxuXG5cbiAgICMgUmVuZGVycyBvdXQgdGhlIGluc3RydW1lbnQgcmFja3MgYnkgaXRlcmF0aW5nIHRocm91Z2hcbiAgICMgZWFjaCBvZiB0aGUgaW5zdHJ1bWVudCBzZXRzIGluIHRoZSBLaXRDb2xsZWN0aW9uXG5cbiAgIHJlbmRlckluc3RydW1lbnRzOiAtPlxuICAgICAgQCRpbnN0cnVtZW50c0NvbnRhaW5lci5odG1sIGluc3RydW1lbnRzVGVtcGxhdGUge1xuICAgICAgICAgaW5zdHJ1bWVudFRhYmxlOiBAcmV0dXJuSW5zdHJ1bWVudFRhYmxlRGF0YSgpXG4gICAgICB9XG5cblxuXG4gICAjIEFkZCBjb2xsZWN0aW9uIGxpc3RlbmVycyB0byBsaXN0ZW4gZm9yIGluc3RydW1lbnQgZHJvcHNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICAkKGRvY3VtZW50KS5vbiAnbW91c2Vtb3ZlJywgQG9uTW91c2VNb3ZlXG5cblxuXG4gICAjIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgJChkb2N1bWVudCkub2ZmICdtb3VzZW1vdmUnLCBAb25Nb3VzZU1vdmVcbiAgICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBUT0RPOiBVcGRhdGUgbW91c2UgbW92ZSB0byBzdXBwb3J0IHRvdWNoIGV2ZW50c1xuICAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgIG9uTW91c2VNb3ZlOiAoZXZlbnQpID0+XG4gICAgICBAbW91c2VQb3NpdGlvbiA9XG4gICAgICAgICB4OiBldmVudC5wYWdlWFxuICAgICAgICAgeTogZXZlbnQucGFnZVlcblxuXG5cbiAgICMgSGFuZGxlciBmb3IgZHJvcCBjaGFuZ2UgZXZlbnRzLiAgQ2hlY2tzIHRvIHNlZSBpZiB0aGUgaW5zdHJ1bWVudFxuICAgIyBjbGFzc05hbWUgZXhpc3RzIG9uIHRoZSBlbGVtZW50IGFuZCwgaWYgc28sIHJlLXJlbmRlcnMgdGhlXG4gICAjIGluc3RydW1lbnQgYW5kIHBhZCB0YWJsZXNcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IGluc3RydW1lbnRNb2RlbFxuXG4gICBvbkRyb3BwZWRDaGFuZ2U6IChpbnN0cnVtZW50TW9kZWwpID0+XG4gICAgICBpbnN0cnVtZW50SWQgICAgICAgPSBpbnN0cnVtZW50TW9kZWwuZ2V0KCdpZCcpXG4gICAgICAkcGFkU3F1YXJlICAgICAgICAgPSBAJGVsLmZpbmQgXCIuI3tpbnN0cnVtZW50SWR9XCJcbiAgICAgIHBhZFNxdWFyZUlkICAgICAgICA9ICRwYWRTcXVhcmUuYXR0ciAnaWQnXG4gICAgICBwYWRTcXVhcmVNb2RlbCAgICAgPSBAcGFkU3F1YXJlQ29sbGVjdGlvbi5maW5kV2hlcmUgeyBpZDogcGFkU3F1YXJlSWQgfVxuXG4gICAgICAjIENoZWNrcyBhZ2FpbnN0IHRlc3RzIGFuZCBkcmFnZ2FibGUsIHdoaWNoIGlzIGxlc3MgdGVzdGFibGVcbiAgICAgIHVubGVzcyBwYWRTcXVhcmVNb2RlbCBpcyB1bmRlZmluZWRcbiAgICAgICAgIHBhZFNxdWFyZU1vZGVsLnNldCAnY3VycmVudEluc3RydW1lbnQnLCBpbnN0cnVtZW50TW9kZWxcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBkcm9wIGV2ZW50cy4gIFBhc3NlcyBpbiB0aGUgaXRlbSBkcmFnZ2VkLCB0aGUgaXRlbSBpdCB3YXNcbiAgICMgZHJvcHBlZCB1cG9uLCBhbmQgdGhlIG9yaWdpbmFsIGV2ZW50IHRvIHN0b3JlIGluIG1lbW9yeSBmb3Igd2hlblxuICAgIyB0aGUgdXNlciB3YW50cyB0byBcImRldGFjaFwiIHRoZSBkcm9wcGVkIGl0ZW0gYW5kIG1vdmUgaXQgYmFjayBpbnRvIHRoZVxuICAgIyBpbnN0cnVtZW50IHF1ZXVlXG4gICAjXG4gICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGRyYWdnZWRcbiAgICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gZHJvcHBlZFxuICAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgIG9uSW5zdHJ1bWVudERyb3A6IChkcmFnZ2VkLCBkcm9wcGVkLCBldmVudCkgPT5cbiAgICAgIHskZHJhZ2dlZCwgJGRyb3BwZWQsIGlkLCBpbnN0cnVtZW50TW9kZWx9ID0gQHBhcnNlRHJhZ2dlZEFuZERyb3BwZWQoIGRyYWdnZWQsIGRyb3BwZWQgKVxuXG4gICAgICAkZHJvcHBlZC5hZGRDbGFzcyBpZFxuICAgICAgJGRyb3BwZWQuYXR0ciAnZGF0YS1pbnN0cnVtZW50JywgXCIje2lkfVwiXG5cbiAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICdkcm9wcGVkJzogdHJ1ZVxuICAgICAgICAgJ2Ryb3BwZWRFdmVudCc6IGV2ZW50XG5cbiAgICAgIF8uZGVmZXIgPT5cbiAgICAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgICAgICBAc2V0RHJhZ0FuZERyb3AoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHNpdHVhdGlvbnMgd2hlcmUgdGhlIHVzZXIgYXR0ZW1wdHMgdG8gZHJvcCB0aGUgaW5zdHJ1bWVudCBpbmNvcnJlY3RseVxuICAgIyBAcGFyYW0ge0hUTUxEb21FbGVtZW50fSBkcmFnZ2VkXG4gICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGRyb3BwZWRcblxuICAgb25QcmV2ZW50SW5zdHJ1bWVudERyb3A6IChkcmFnZ2VkLCBkcm9wcGVkKSA9PlxuICAgICAgeyRkcmFnZ2VkLCAkZHJvcHBlZCwgaWQsIGluc3RydW1lbnRNb2RlbH0gPSBAcGFyc2VEcmFnZ2VkQW5kRHJvcHBlZCggZHJhZ2dlZCwgZHJvcHBlZCApXG5cbiAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICdkcm9wcGVkJzogZmFsc2VcbiAgICAgICAgICdkcm9wcGVkRXZlbnQnOiBudWxsXG5cbiAgICAgIF8uZGVmZXIgPT5cbiAgICAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgICAgICBAc2V0RHJhZ0FuZERyb3AoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHByZXNzIGFuZCBob2xkIGV2ZW50cywgYXMgZGlzcGF0Y2hlZCBmcm9tIHRoZSBwYWQgc3F1YXJlIHRoZSB1c2VyXG4gICAjIGlzIGludGVyYWN0aW5nIHdpdGguICBSZWxlYXNlcyB0aGUgaW5zdHJ1bWVudCBhbmQgYWxsb3dzIHRoZSB1c2VyIHRvIGRyYWcgdG9cbiAgICMgYSBuZXcgc3F1YXJlIG9yIGRlcG9zaXQgaXQgYmFjayB3aXRoaW4gdGhlIGluc3RydW1lbnQgcmFja1xuICAgIyBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG5cbiAgIG9uUGFkU3F1YXJlRHJhZ2dpbmdTdGFydDogKHBhcmFtcykgPT5cbiAgICAgIHtpbnN0cnVtZW50SWQsICRwYWRTcXVhcmUsIG9yaWdpbmFsRHJvcHBlZEV2ZW50fSA9IHBhcmFtc1xuXG4gICAgICAkZHJvcHBlZEluc3RydW1lbnQgPSAkKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGluc3RydW1lbnRJZCkpXG5cbiAgICAgICMgUmV0dXJuIHRoZSBkcmFnZ2FibGUgaW5zdGFuY2UgYXNzb2NpYXRlZCB3aXRoIHRoZSBwYWQgc3F1YXJlXG4gICAgICBkcmFnZ2FibGUgPSBfLmZpbmQgQGRyYWdnYWJsZSwgKGRyYWdnYWJsZUVsZW1lbnQpID0+XG4gICAgICAgICBpZiAkKGRyYWdnYWJsZUVsZW1lbnQuX2V2ZW50VGFyZ2V0KS5hdHRyKCdpZCcpIGlzICRkcm9wcGVkSW5zdHJ1bWVudC5hdHRyKCdpZCcpXG4gICAgICAgICAgICByZXR1cm4gZHJhZ2dhYmxlRWxlbWVudFxuXG4gICAgICBvZmZzZXQgPSAkZHJvcHBlZEluc3RydW1lbnQub2Zmc2V0KClcblxuICAgICAgIyBTaWxlbnRseSB1cGRhdGUgdGhlIHBvc2l0aW9uIG9mIHRoZSBpbnN0cnVtZW50XG4gICAgICAkZHJvcHBlZEluc3RydW1lbnQuY3NzICdwb3NpdGlvbicsICdhYnNvbHV0ZSdcblxuICAgICAgIyBUT0RPOiBJZiBCb3VuZHMgYXJlIHNldCBvbiB0aGUgb3JpZ2luYWwgZHJhZ2dhYmxlIHRoZW4gdGhlcmUncyBhIHdlaXJkXG4gICAgICAjIGJvdW5kcnkgb2Zmc2V0IHRoYXQgbmVlZHMgdG8gYmUgc29sdmVkLiAgUmVzZXQgaW4gRHJhZ2dhYmxlIGNvbnN0cnVjdG9yXG5cbiAgICAgIFR3ZWVuTWF4LnNldCAkZHJvcHBlZEluc3RydW1lbnQsXG4gICAgICAgICBsZWZ0OiBAbW91c2VQb3NpdGlvbi54IC0gKCRkcm9wcGVkSW5zdHJ1bWVudC53aWR0aCgpICAqIC41KVxuICAgICAgICAgdG9wOiAgQG1vdXNlUG9zaXRpb24ueSAtICgkZHJvcHBlZEluc3RydW1lbnQuaGVpZ2h0KCkgKiAuNSlcblxuICAgICAgIyBSZW5hYmxlIGRyYWdnaW5nXG4gICAgICBkcmFnZ2FibGUuc3RhcnREcmFnIG9yaWdpbmFsRHJvcHBlZEV2ZW50XG4gICAgICBkcmFnZ2FibGUudXBkYXRlKHRydWUpXG5cbiAgICAgICMgQW5kIHNob3cgaXRcbiAgICAgICRkcm9wcGVkSW5zdHJ1bWVudC5zaG93KClcblxuXG5cblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgU2V0cyB1cCBkcmFnIGFuZCBkcm9wIG9uIGVhY2ggb2YgdGhlIGluc3RydW1lbnRzIHJlbmRlcmVkIGZyb20gdGhlIEtpdENvbGxlY3Rpb25cbiAgICMgQWRkcyBoaWdobGlnaHRzIGFuZCBkZXRlcm1pbmVzIGhpdC10ZXN0cywgb3IgZGVmZXJzIHRvIG9uUHJldmVudEluc3RydW1lbnREcm9wXG4gICAjIGluIHNpdHVhdGlvbnMgd2hlcmUgZHJvcHBpbmcgaXNuJ3QgcG9zc2libGVcblxuICAgc2V0RHJhZ0FuZERyb3A6IC0+XG4gICAgICBzZWxmID0gQFxuXG4gICAgICBAJGluc3RydW1lbnQgPSBAJGVsLmZpbmQgJy5pbnN0cnVtZW50J1xuICAgICAgJGRyb3BwYWJsZXMgID0gQCRlbC5maW5kICcuY29udGFpbmVyLXBhZCdcblxuICAgICAgQGRyYWdnYWJsZSA9IERyYWdnYWJsZS5jcmVhdGUgQCRpbnN0cnVtZW50LFxuICAgICAgICAgI2JvdW5kczogd2luZG93XG5cblxuICAgICAgICAgIyBIYW5kbGVyIGZvciBkcmFnIGV2ZW50cy4gIEl0ZXJhdGVzIG92ZXIgYWxsIGRyb3BwYWJsZSBzcXVhcmUgYXJlYXNcbiAgICAgICAgICMgYW5kIGNoZWNrcyB0byBzZWUgaWYgYW4gaW5zdHJ1bWVudCBjdXJyZW50bHkgb2NjdXBpZXMgdGhlIHBvc2l0aW9uXG5cbiAgICAgICAgIG9uRHJhZzogKGV2ZW50KSAtPlxuXG4gICAgICAgICAgICBpID0gJGRyb3BwYWJsZXMubGVuZ3RoXG5cbiAgICAgICAgICAgIHdoaWxlKCAtLWkgPiAtMSApXG5cbiAgICAgICAgICAgICAgIGlmIEBoaXRUZXN0KCRkcm9wcGFibGVzW2ldLCAnNTAlJylcblxuICAgICAgICAgICAgICAgICAgaW5zdHJ1bWVudCA9ICQoJGRyb3BwYWJsZXNbaV0pLmF0dHIoJ2RhdGEtaW5zdHJ1bWVudCcpXG5cbiAgICAgICAgICAgICAgICAgICMgUHJldmVudCBkcm9wcGFibGVzIG9uIHNxdWFyZXMgdGhhdCBhbHJlYWR5IGhhdmUgaW5zdHJ1bWVudHNcbiAgICAgICAgICAgICAgICAgIGlmIGluc3RydW1lbnQgaXMgbnVsbCBvciBpbnN0cnVtZW50IGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgJCgkZHJvcHBhYmxlc1tpXSkuYWRkQ2xhc3MgJ2hpZ2hsaWdodCdcblxuICAgICAgICAgICAgICAgIyBSZW1vdmUgaWYgbm90IG92ZXIgc3F1YXJlXG4gICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAkKCRkcm9wcGFibGVzW2ldKS5yZW1vdmVDbGFzcyAnaGlnaGxpZ2h0J1xuXG5cbiAgICAgICAgICMgQ2hlY2sgdG8gc2VlIGlmIGluc3RydW1lbnQgaXMgZHJvcHBhYmxlOyBvdGhlcndpc2VcbiAgICAgICAgICMgdHJpZ2dlciBhIFwiY2FudCBkcm9wXCIgYW5pbWF0aW9uXG5cbiAgICAgICAgIG9uRHJhZ0VuZDogKGV2ZW50KSAtPlxuXG4gICAgICAgICAgICBpID0gJGRyb3BwYWJsZXMubGVuZ3RoXG5cbiAgICAgICAgICAgIGRyb3BwZWRQcm9wZXJseSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHdoaWxlKCAtLWkgPiAtMSApXG5cbiAgICAgICAgICAgICAgIGlmIEBoaXRUZXN0KCRkcm9wcGFibGVzW2ldLCAnNTAlJylcbiAgICAgICAgICAgICAgICAgIGluc3RydW1lbnQgPSAkKCRkcm9wcGFibGVzW2ldKS5hdHRyKCdkYXRhLWluc3RydW1lbnQnKVxuXG4gICAgICAgICAgICAgICAgICAjIFByZXZlbnQgZHJvcHBhYmxlcyBvbiBzcXVhcmVzIHRoYXQgYWxyZWFkeSBoYXZlIGluc3RydW1lbnRzXG4gICAgICAgICAgICAgICAgICBpZiBpbnN0cnVtZW50IGlzIG51bGwgb3IgaW5zdHJ1bWVudCBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgIGRyb3BwZWRQcm9wZXJseSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgIHNlbGYub25JbnN0cnVtZW50RHJvcCggdGhpcy50YXJnZXQsICRkcm9wcGFibGVzW2ldLCBldmVudCApXG5cblxuICAgICAgICAgICAgICAgICAgIyBTZW5kIGluc3RydW1lbnQgYmFja1xuICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgc2VsZi5vblByZXZlbnRJbnN0cnVtZW50RHJvcCggdGhpcy50YXJnZXQsICRkcm9wcGFibGVzW2ldIClcblxuICAgICAgICAgICAgICAgIyBTZW5kIGluc3RydW1lbnQgYmFja1xuICAgICAgICAgICAgICAgaWYgZHJvcHBlZFByb3Blcmx5IGlzIGZhbHNlXG4gICAgICAgICAgICAgICAgICBzZWxmLm9uUHJldmVudEluc3RydW1lbnREcm9wKCB0aGlzLnRhcmdldCwgJGRyb3BwYWJsZXNbaV0gKVxuXG5cblxuXG4gICAjIEhlbHBlciBtZXRob2QgZm9yIHBhcnNpbmcgdGhlIGRyYWcgYW5kIGRyb3AgZXZlbnQgcmVzcG9uc2VzXG4gICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGRyYWdnZWRcbiAgICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gZHJvcHBlZFxuXG4gICBwYXJzZURyYWdnZWRBbmREcm9wcGVkOiAoZHJhZ2dlZCwgZHJvcHBlZCkgPT5cbiAgICAgICRkcmFnZ2VkID0gJChkcmFnZ2VkKVxuICAgICAgJGRyb3BwZWQgPSAkKGRyb3BwZWQpXG4gICAgICBpZCA9ICRkcmFnZ2VkLmF0dHIgJ2lkJ1xuICAgICAgaW5zdHJ1bWVudE1vZGVsID0gQGtpdENvbGxlY3Rpb24uZmluZEluc3RydW1lbnRNb2RlbCBpZFxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAgJGRyYWdnZWQ6ICRkcmFnZ2VkXG4gICAgICAgICAkZHJvcHBlZDogJGRyb3BwZWRcbiAgICAgICAgIGlkOiBpZFxuICAgICAgICAgaW5zdHJ1bWVudE1vZGVsOiBpbnN0cnVtZW50TW9kZWxcbiAgICAgIH1cblxuXG5cblxuICAgIyBSZW5kZXIgb3V0IHRoZSB0YWJsZSBmb3IgdGhlIGxpdmUgcGFkIGdyaWQgYW5kIHB1c2hcbiAgICMgaXQgaW50byBhbiBhcnJheSBvZiB0YWJsZSByb3dzIGFuZCB0ZHNcbiAgICMgQHJldHVybiB7T2JqZWN0fVxuXG4gICByZXR1cm5QYWRUYWJsZURhdGE6IC0+XG5cbiAgICAgIEBwYWRTcXVhcmVDb2xsZWN0aW9uID0gbmV3IFBhZFNxdWFyZUNvbGxlY3Rpb24oKVxuICAgICAgQHBhZFNxdWFyZVZpZXdzID0gW11cbiAgICAgIHBhZFRhYmxlID0ge31cbiAgICAgIHJvd3MgPSBbXVxuICAgICAgaXRlcmF0b3IgPSAwXG5cbiAgICAgICMgUmVuZGVyIG91dCByb3dzXG4gICAgICBfKDQpLnRpbWVzIChpbmRleCkgPT5cbiAgICAgICAgIHRkcyAgPSBbXVxuXG4gICAgICAgICAjIFJlbmRlciBvdXQgY29sdW1uc1xuICAgICAgICAgXyg0KS50aW1lcyAoaW5kZXgpID0+XG5cbiAgICAgICAgICAgICMgSW5zdGFudGlhdGUgZWFjaCBwYWQgdmlldyBhbmQgdGllIHRoZSBpZFxuICAgICAgICAgICAgIyB0byB0aGUgRE9NIGVsZW1lbnRcblxuICAgICAgICAgICAgbW9kZWwgPSBuZXcgUGFkU3F1YXJlTW9kZWxcbiAgICAgICAgICAgICAgIGtleWNvZGU6IEBLRVlNQVBbaXRlcmF0b3JdXG5cbiAgICAgICAgICAgIHBhZFNxdWFyZSA9IG5ldyBQYWRTcXVhcmVcbiAgICAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuICAgICAgICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgICAgICAgQHBhZFNxdWFyZUNvbGxlY3Rpb24uYWRkIG1vZGVsXG4gICAgICAgICAgICBAcGFkU3F1YXJlVmlld3MucHVzaCBwYWRTcXVhcmVcbiAgICAgICAgICAgIGl0ZXJhdG9yKytcblxuICAgICAgICAgICAgIyBCZWdpbiBsaXN0ZW5pbmcgdG8gZHJhZyAvIHJlbGVhc2UgLyByZW1vdmUgZXZlbnRzIGZyb21cbiAgICAgICAgICAgICMgZWFjaCBwYWQgc3F1YXJlIGFuZCByZS1yZW5kZXIgcGFkIHNxdWFyZXNcblxuICAgICAgICAgICAgQGxpc3RlblRvIHBhZFNxdWFyZSwgQXBwRXZlbnQuQ0hBTkdFX0RSQUdHSU5HLCBAb25QYWRTcXVhcmVEcmFnZ2luZ1N0YXJ0XG5cblxuICAgICAgICAgICAgdGRzLnB1c2gge1xuICAgICAgICAgICAgICAgJ2lkJzogcGFkU3F1YXJlLm1vZGVsLmdldCgnaWQnKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICByb3dzLnB1c2gge1xuICAgICAgICAgICAgJ2lkJzogXCJwYWQtcm93LSN7aW5kZXh9XCJcbiAgICAgICAgICAgICd0ZHMnOiB0ZHNcbiAgICAgICAgIH1cblxuICAgICAgcGFkVGFibGUucm93cyA9IHJvd3NcblxuICAgICAgcGFkVGFibGVcblxuXG5cblxuICAgIyBSZW5kZXIgb3V0IHRoZSBpbnN0cnVtZW50IHRhYmxlIGFuZCBwdXNoIGl0IGludG9cbiAgICMgYW5kIGFycmF5IG9mIGluZGl2aWR1YWwgaW5zdHJ1bWVudHNcbiAgICMgQHJldHVybiB7T2JqZWN0fVxuXG4gICByZXR1cm5JbnN0cnVtZW50VGFibGVEYXRhOiAtPlxuICAgICAgaW5zdHJ1bWVudFRhYmxlID0gQGtpdENvbGxlY3Rpb24ubWFwIChraXQpID0+XG4gICAgICAgICBpbnN0cnVtZW50Q29sbGVjdGlvbiA9IGtpdC5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgICAgIyBCZWdpbiBsaXN0ZW5pbmcgdG8gZHJvcCBldmVudHMgZm9yIGVhY2ggaW5zdHJ1bWVudFxuICAgICAgICAgIyBpbiB0aGUgSW5zdHJ1bWVudCBjb2xsZWN0aW9uXG5cbiAgICAgICAgIEBsaXN0ZW5UbyBpbnN0cnVtZW50Q29sbGVjdGlvbiwgQXBwRXZlbnQuQ0hBTkdFX0RST1BQRUQsIEBvbkRyb3BwZWRDaGFuZ2VcblxuICAgICAgICAgaW5zdHJ1bWVudHMgPSBpbnN0cnVtZW50Q29sbGVjdGlvbi5tYXAgKGluc3RydW1lbnQpID0+XG4gICAgICAgICAgICBpbnN0cnVtZW50LnRvSlNPTigpXG5cbiAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnbGFiZWwnOiAgICAgICBraXQuZ2V0ICdsYWJlbCdcbiAgICAgICAgICAgICdpbnN0cnVtZW50cyc6IGluc3RydW1lbnRzXG4gICAgICAgICB9XG5cbiAgICAgIGluc3RydW1lbnRUYWJsZVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMaXZlUGFkXG4iLCIjIyMqXG4gKiBMaXZlIE1QQyBcInBhZFwiIGNvbXBvbmVudFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3BhZC1zcXVhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFBhZFNxdWFyZSBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBkZWxheSB0aW1lIGJlZm9yZSBkcmFnIGZ1bmN0aW9uYWxpdHkgaXMgaW5pdGlhbGl6ZWRcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgRFJBR19UUklHR0VSX0RFTEFZOiAxMDAwXG5cblxuICAgIyBUaGUgdGFnIHRvIGJlIHJlbmRlcmVkIHRvIHRoZSBET01cbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdGFnTmFtZTogJ2RpdidcblxuXG4gICAjIFRoZSBjbGFzc25hbWUgZm9yIHRoZSBQYWQgU3F1YXJlXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3BhZC1zcXVhcmUnXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIE1vZGVsIHdoaWNoIHRyYWNrcyBzdGF0ZSBvZiBzcXVhcmUgYW5kIGluc3RydW1lbnRzXG4gICAjIEB0eXBlIHtQYWRTcXVhcmVNb2RlbH1cblxuICAgbW9kZWw6IG51bGxcblxuXG4gICAjIFRoZSBjdXJyZW50IGljb24gY2xhc3MgYXMgYXBwbGllZCB0byB0aGUgc3F1YXJlXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGN1cnJlbnRJY29uOiBudWxsXG5cblxuICAgIyBUaGUgYXVkaW8gcGxheWJhY2sgY29tcG9uZW50XG4gICAjIEB0eXBlIHtIb3dsfVxuXG4gICBhdWRpb1BsYXliYWNrOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaHN0YXJ0JzogJ29uUHJlc3MnXG4gICAgICAndG91Y2hlbmQnOiAgICdvblJlbGVhc2UnXG5cblxuXG5cbiAgICMgUmVuZGVycyBvdXQgaW5kaXZpZHVhbCBwYWQgc3F1YXJlc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGljb25Db250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItaWNvbidcbiAgICAgIEAkaWNvbiAgICAgICAgICA9IEAkaWNvbkNvbnRhaW5lci5maW5kICcuaWNvbidcblxuICAgICAgQFxuXG5cblxuICAgIyBSZW1vdmVzIHRoZSBwYWQgc3F1YXJlIGZyb20gdGhlIGRvbSBhbmQgY2xlYXJzXG4gICAjIG91dCBwcmUtc2V0IG9yIHVzZXItc2V0IHByb3BlcnRpZXNcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgQHJlbW92ZVNvdW5kQW5kQ2xlYXJQYWQoKVxuICAgICAgc3VwZXIoKVxuXG5cblxuICAgIyBBZGQgbGlzdGVuZXJzIHJlbGF0ZWQgdG8gZHJhZ2dpbmcsIGRyb3BwaW5nIGFuZCBjaGFuZ2VzXG4gICAjIHRvIGluc3RydW1lbnRzLlxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9UUklHR0VSLCAgICBAb25UcmlnZ2VyQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQG1vZGVsLCBBcHBFdmVudC5DSEFOR0VfRFJBR0dJTkcsICAgQG9uRHJhZ2dpbmdDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9EUk9QUEVELCAgICBAb25Ecm9wcGVkQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQG1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cblxuXG4gICAjIFVwZGF0ZXMgdGhlIHZpc3VhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgcGFkIHNxdWFyZVxuXG4gICB1cGRhdGVJbnN0cnVtZW50Q2xhc3M6IC0+XG4gICAgICBpbnN0cnVtZW50ID0gQG1vZGVsLmdldCAnY3VycmVudEluc3RydW1lbnQnXG4gICAgICBAJGVsLnBhcmVudCgpLmFkZENsYXNzIGluc3RydW1lbnQuZ2V0ICdpZCdcblxuXG5cblxuICAgIyBSZW5kZXJzIG91dCB0aGUgaW5pdGlhbCBpY29uIGFuZCBzZXRzIHRoZSBpc250cnVtZW50XG5cbiAgIHJlbmRlckljb246IC0+XG4gICAgICBpZiBAJGljb24uaGFzQ2xhc3MgQGN1cnJlbnRJY29uXG4gICAgICAgICBAJGljb24ucmVtb3ZlQ2xhc3MgQGN1cnJlbnRJY29uXG5cbiAgICAgIGluc3RydW1lbnQgPSBAbW9kZWwuZ2V0ICdjdXJyZW50SW5zdHJ1bWVudCdcblxuICAgICAgdW5sZXNzIGluc3RydW1lbnQgaXMgbnVsbFxuICAgICAgICAgQGN1cnJlbnRJY29uID0gaW5zdHJ1bWVudC5nZXQgJ2ljb24nXG4gICAgICAgICBAJGljb24uYWRkQ2xhc3MgQGN1cnJlbnRJY29uXG4gICAgICAgICBAJGljb24udGV4dCBpbnN0cnVtZW50LmdldCAnbGFiZWwnXG5cblxuXG5cbiAgICMgU2V0cyB0aGUgY3VycmVudCBzb3VuZCBhbmQgZW5hYmxlcyBhdWRpbyBwbGF5YmFja1xuXG4gICBzZXRTb3VuZDogLT5cbiAgICAgIEBhdWRpb1BsYXliYWNrPy51bmxvYWQoKVxuXG4gICAgICBpbnN0cnVtZW50ID0gQG1vZGVsLmdldCAnY3VycmVudEluc3RydW1lbnQnXG5cbiAgICAgIHVubGVzcyBpbnN0cnVtZW50IGlzIG51bGxcbiAgICAgICAgIGF1ZGlvU3JjID0gaW5zdHJ1bWVudC5nZXQgJ3NyYydcblxuICAgICAgICAgIyBUT0RPOiBUZXN0IG1ldGhvZHNcbiAgICAgICAgIGlmIHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Rlc3QnKSBpc250IC0xIHRoZW4gYXVkaW9TcmMgPSAnJ1xuXG4gICAgICAgICBAYXVkaW9QbGF5YmFjayA9IG5ldyBIb3dsXG4gICAgICAgICAgICB2b2x1bWU6IEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLm1lZGl1bVxuICAgICAgICAgICAgdXJsczogW2F1ZGlvU3JjXVxuICAgICAgICAgICAgb25lbmQ6IEBvblNvdW5kRW5kXG5cblxuXG5cbiAgICMgVHJpZ2dlcnMgYXVkaW8gcGxheWJhY2tcblxuICAgcGxheVNvdW5kOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2s/LnBsYXkoKVxuICAgICAgQG1vZGVsLnNldCAndHJpZ2dlcicsIGZhbHNlXG5cblxuXG5cbiAgICMgR2VuZXJpYyByZW1vdmUgYW5kIGNsZWFyIHdoaWNoIGlzIHRyaWdnZXJlZCB3aGVuIGEgdXNlclxuICAgIyBkcmFncyB0aGUgaW5zdHJ1bWVudCBvZmYgb2YgdGhlIHBhZCBvciB0aGUgdmlldyBpcyBkZXN0cm95ZWRcblxuICAgcmVtb3ZlU291bmRBbmRDbGVhclBhZDogLT5cbiAgICAgIGlmIEBtb2RlbC5nZXQoJ2N1cnJlbnRJbnN0cnVtZW50JykgaXMgbnVsbFxuICAgICAgICAgcmV0dXJuXG5cbiAgICAgIEBhdWRpb1BsYXliYWNrPy51bmxvYWQoKVxuICAgICAgQGF1ZGlvUGxheWJhY2sgPSBudWxsXG5cbiAgICAgIGN1cnJlbnRJbnN0cnVtZW50ID0gQG1vZGVsLmdldCAnY3VycmVudEluc3RydW1lbnQnXG5cbiAgICAgIGlkICAgPSBjdXJyZW50SW5zdHJ1bWVudC5nZXQgJ2lkJ1xuICAgICAgaWNvbiA9IGN1cnJlbnRJbnN0cnVtZW50LmdldCAnaWNvbidcblxuICAgICAgQCRlbC5wYXJlbnQoKS5yZW1vdmVBdHRyICdkYXRhLWluc3RydW1lbnQnXG4gICAgICBAJGVsLnBhcmVudCgpLnJlbW92ZUNsYXNzIGlkXG4gICAgICBAJGVsLnJlbW92ZUNsYXNzIGlkXG4gICAgICBAJGljb24ucmVtb3ZlQ2xhc3MgaWNvblxuICAgICAgQCRpY29uLnRleHQgJydcblxuICAgICAgXy5kZWZlciA9PlxuICAgICAgICAgQG1vZGVsLnNldFxuICAgICAgICAgICAgJ2RyYWdnaW5nJzogZmFsc2VcbiAgICAgICAgICAgICdkcm9wcGVkJzogZmFsc2VcblxuICAgICAgICAgY3VycmVudEluc3RydW1lbnQuc2V0XG4gICAgICAgICAgICAnZHJvcHBlZCc6IGZhbHNlXG4gICAgICAgICAgICAnZHJvcHBlZEV2ZW50JzogbnVsbFxuXG4gICAgICAgICBAbW9kZWwuc2V0ICdjdXJyZW50SW5zdHJ1bWVudCcsIG51bGxcblxuXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBwcmVzcyBldmVudHMsIHdoaWNoLCB3aGVuIGhlbGRcbiAgICMgdHJpZ2dlcnMgYSBcImRyYWdcIiBldmVudCBvbiB0aGUgbW9kZWxcbiAgICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gICBvblByZXNzOiAoZXZlbnQpID0+XG4gICAgICBAbW9kZWwuc2V0ICd0cmlnZ2VyJywgdHJ1ZVxuXG4gICAgICBAZHJhZ1RpbWVvdXQgPSBzZXRUaW1lb3V0ID0+XG4gICAgICAgICBAbW9kZWwuc2V0ICdkcmFnZ2luZycsIHRydWVcblxuICAgICAgLCBARFJBR19UUklHR0VSX0RFTEFZXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgcmVsZWFzZSBldmVudHMgd2hpY2ggY2xlYXJzXG4gICAjIGRyYWcgd2hldGhlciBkcmFnIHdhcyBpbml0aWF0ZWQgb3Igbm90XG4gICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICAgb25SZWxlYXNlOiAoZXZlbnQpID0+XG4gICAgICBjbGVhclRpbWVvdXQgQGRyYWdUaW1lb3V0XG4gICAgICBAbW9kZWwuc2V0ICdkcmFnZ2luZycsIGZhbHNlXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgZHJhZyBldmVudHMuXG4gICAjIFRPRE86IERvIHdlIG5lZWQgdGhpc1xuICAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgIG9uRHJhZzogKGV2ZW50KSAtPlxuICAgICAgQG1vZGVsLnNldCAnZHJhZ2dpbmcnLCB0cnVlXG5cblxuXG5cbiAgICMgU2V0IGRyb3BwZWQgc3RhdHVzIHNvIHRoYXQgYmktZGlyZWN0aW9uYWwgY2hhbmdlIGNhblxuICAgIyBiZSB0cmlnZ2VyZWQgZnJvbSB0aGUgTGl2ZVBhZCBraXQgcmVuZGVyXG4gICAjIEBwYXJhbSB7TnVtYmVyfSBpZFxuXG4gICBvbkRyb3A6IChpZCkgLT5cbiAgICAgIGluc3RydW1lbnRNb2RlbCA9IEBjb2xsZWN0aW9uLmZpbmRJbnN0cnVtZW50TW9kZWwgaWRcblxuICAgICAgaW5zdHJ1bWVudE1vZGVsLnNldCAnZHJvcHBlZCcsIHRydWVcblxuICAgICAgQG1vZGVsLnNldFxuICAgICAgICAgJ2RyYWdnaW5nJzogZmFsc2VcbiAgICAgICAgICdkcm9wcGVkJzogdHJ1ZVxuICAgICAgICAgJ2N1cnJlbnRJbnN0cnVtZW50JzogaW5zdHJ1bWVudE1vZGVsXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgJ2NoYW5nZTpkcmFnJyBtb2RlbCBldmVudHMsIHdoaWNoXG4gICAjIHNldHMgdXAgc2VxdWVuY2UgZm9yIGRyYWdnaW5nIG9uIGFuZCBvZmYgb2ZcbiAgICMgdGhlIHBhZCBzcXVhcmVcbiAgICMgQHBhcmFtIHtQYWRTcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25EcmFnZ2luZ0NoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgZHJhZ2dpbmcgPSBtb2RlbC5jaGFuZ2VkLmRyYWdnaW5nXG5cbiAgICAgIGlmIGRyYWdnaW5nIGlzIHRydWVcblxuICAgICAgICAgaW5zdHJ1bWVudElkID0gQCRlbC5wYXJlbnQoKS5hdHRyICdkYXRhLWluc3RydW1lbnQnXG5cbiAgICAgICAgIGN1cnJlbnRJbnN0cnVtZW50ICAgID0gQG1vZGVsLmdldCgnY3VycmVudEluc3RydW1lbnQnKVxuICAgICAgICAgb3JpZ2luYWxEcm9wcGVkRXZlbnQgPSBjdXJyZW50SW5zdHJ1bWVudC5nZXQgJ2Ryb3BwZWRFdmVudCdcblxuICAgICAgICAgQG1vZGVsLnNldCAnZHJvcHBlZCcsIGZhbHNlXG4gICAgICAgICBjdXJyZW50SW5zdHJ1bWVudC5zZXQgJ2Ryb3BwZWQnLCBmYWxzZVxuXG4gICAgICAgICAjIERpc3BhdGNoIGRyYWcgc3RhcnQgZXZlbnQgYmFjayB0byBMaXZlUGFkXG4gICAgICAgICBAdHJpZ2dlciBBcHBFdmVudC5DSEFOR0VfRFJBR0dJTkcsIHtcbiAgICAgICAgICAgICdpbnN0cnVtZW50SWQnOiBpbnN0cnVtZW50SWRcbiAgICAgICAgICAgICckcGFkU3F1YXJlJzogQCRlbC5wYXJlbnQoKVxuICAgICAgICAgICAgJ29yaWdpbmFsRHJvcHBlZEV2ZW50Jzogb3JpZ2luYWxEcm9wcGVkRXZlbnRcbiAgICAgICAgIH1cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBkcm9wIGNoYW5nZSBldmVudHMsIHdoaWNoIGNoZWNrcyB0byBzZWVcbiAgICMgaWYgaXRzIGJlZW4gZHJvcHBlZCBvZmYgdGhlIHNxdWFyZSBhbWQgY2xlYXJzXG4gICAjIEBwYXJhbSB7UGFkU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uRHJvcHBlZENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgZHJvcHBlZCA9IG1vZGVsLmNoYW5nZWQuZHJvcHBlZFxuXG4gICAgICB1bmxlc3MgZHJvcHBlZFxuICAgICAgICAgQHJlbW92ZVNvdW5kQW5kQ2xlYXJQYWQoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yICdjaGFuZ2U6dHJpZ2dlcicgZXZlbnRzLCB3aGljaCB0cmlnZ2Vyc1xuICAgIyBzb3VuZCBwbGF5YmFjayB3aGljaCB0aGVuIHJlc2V0cyBpdCB0byBmYWxzZSBvbiBjb21wbGV0XG4gICAjIEBwYXJhbSB7UGFkU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uVHJpZ2dlckNoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgdHJpZ2dlciA9IG1vZGVsLmNoYW5nZWQudHJpZ2dlclxuXG4gICAgICBpZiB0cmlnZ2VyXG4gICAgICAgICBAcGxheVNvdW5kKClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciAnY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50JyBldmVudHMsIHdoaWNoIHVwZGF0ZXNcbiAgICMgdGhlIHBhZCBzcXVhcmUgd2l0aCB0aGUgYXBwcm9wcmlhdGUgZGF0YVxuICAgIyBAcGFyYW0ge1BhZFNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gICBvbkluc3RydW1lbnRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIGluc3RydW1lbnQgPSBtb2RlbC5jaGFuZ2VkLmN1cnJlbnRJbnN0cnVtZW50XG5cbiAgICAgIHVubGVzcyBpbnN0cnVtZW50IGlzIG51bGwgb3IgaW5zdHJ1bWVudCBpcyB1bmRlZmluZWRcbiAgICAgICAgIEB1cGRhdGVJbnN0cnVtZW50Q2xhc3MoKVxuICAgICAgICAgQHJlbmRlckljb24oKVxuICAgICAgICAgQHNldFNvdW5kKClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBzb3VuZCBlbmQgZXZlbnRzLCB3aGljaCByZXNldHMgdGhlIHNvdW5kIHBsYXliYWNrXG5cbiAgIG9uU291bmRFbmQ6ID0+XG4gICAgICBAbW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZFNxdWFyZSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBzdGFjazEsIHNlbGY9dGhpcywgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIjtcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0PGRpdiBjbGFzcz0nY29udGFpbmVyLWtpdCc+XFxuXHRcdDxoMz5cXG5cdFx0XHQ8Yj5cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmxhYmVsOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPC9iPlxcblx0XHQ8L2gzPlxcblxcblx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaW5zdHJ1bWVudHMsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgyLCBwcm9ncmFtMiwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdDwvZGl2PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtMihkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXFxuXHRcdFx0PGRpdiBjbGFzcz0naW5zdHJ1bWVudCBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmRyb3BwZWQsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCInIGlkPVxcXCJcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWQpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmlkOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj5cXG5cdFx0XHRcdFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiIGhpZGRlbiBcIjtcbiAgfVxuXG4gIHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgZGVwdGgwLmluc3RydW1lbnRUYWJsZSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyByZXR1cm4gc3RhY2sxOyB9XG4gIGVsc2UgeyByZXR1cm4gJyc7IH1cbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjx0YWJsZSBjbGFzcz0nY29udGFpbmVyLXBhZHMnPlxcblxcbjwvdGFibGU+XFxuXFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLWluc3RydW1lbnRzJz5cXG5cXG48L2Rpdj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiO1xuXG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz0na2V5LWNvZGUnPlxcblx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmtleWNvZGUpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmtleWNvZGU7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG48L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPSdjb250YWluZXItaWNvbic+XFxuXHQ8ZGl2IGNsYXNzPSdpY29uJz5cXG5cXG5cdDwvZGl2PlxcbjwvZGl2PlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIHN0YWNrMiwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8dHI+XFxuXHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsIGRlcHRoMC50ZHMsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgyLCBwcm9ncmFtMiwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdDwvdHI+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0yKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0XHQ8dGQgY2xhc3M9J2NvbnRhaW5lci1wYWQnIGlkPVxcXCJcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWQpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmlkOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj5cXG5cXG5cdFx0XHQ8L3RkPlxcblx0XHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIHN0YWNrMiA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgKChzdGFjazEgPSBkZXB0aDAucGFkVGFibGUpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEucm93cyksIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMiB8fCBzdGFjazIgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMjsgfVxuICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCIjIyMqXG4gKiBJbmRpdmlkdWFsIHNlcXVlbmNlciB0cmFja3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3BhdHRlcm4tc3F1YXJlLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIGNvbnRhaW5lciBjbGFzc25hbWVcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAncGF0dGVybi1zcXVhcmUnXG5cblxuICAgIyBUaGUgRE9NIHRhZyBhbmVtXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHRhZ05hbWU6ICd0ZCdcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgVGhlIGF1ZGlvIHBsYXliYWNrIGluc3RhbmNlIChIb3dsZXIpXG4gICAjIEB0eXBlIHtIb3dsfVxuXG4gICBhdWRpb1BsYXliYWNrOiBudWxsXG5cblxuICAgIyBUaGUgbW9kZWwgd2hpY2ggY29udHJvbHMgdm9sdW1lLCBwbGF5YmFjaywgZXRjXG4gICAjIEB0eXBlIHtQYXR0ZXJuU3F1YXJlTW9kZWx9XG5cbiAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbnVsbFxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQnOiAnb25DbGljaydcblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBhbmQgaW5zdGFudGlhdGVzIHRoZSBob3dsZXIgYXVkaW8gZW5naW5lXG4gICAjIEBwYXR0ZXJuU3F1YXJlTW9kZWwge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBhdWRpb1NyYyA9IEBwYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCdpbnN0cnVtZW50JykuZ2V0ICdzcmMnXG5cbiAgICAgICMgVE9ETzogVGVzdCBtZXRob2RzXG4gICAgICBpZiB3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCd0ZXN0JykgaXNudCAtMSB0aGVuIGF1ZGlvU3JjID0gJydcblxuICAgICAgQGF1ZGlvUGxheWJhY2sgPSBuZXcgSG93bFxuICAgICAgICAgdm9sdW1lOiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5sb3dcbiAgICAgICAgIHVybHM6IFthdWRpb1NyY11cbiAgICAgICAgIG9uZW5kOiBAb25Tb3VuZEVuZFxuXG4gICAgICBAXG5cblxuXG5cbiAgICMgUmVtb3ZlIHRoZSB2aWV3IGFuZCBkZXN0cm95IHRoZSBhdWRpbyBwbGF5YmFja1xuXG4gICByZW1vdmU6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjay51bmxvYWQoKVxuICAgICAgc3VwZXIoKVxuXG5cblxuXG4gICAjIEFkZHMgZXZlbnQgbGlzdGVuZXJzIGFuZCBiZWdpbnMgbGlzdGVuaW5nIGZvciB2ZWxvY2l0eSwgYWN0aXZpdHkgYW5kIHRyaWdnZXJzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9WRUxPQ0lUWSwgQG9uVmVsb2NpdHlDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAcGF0dGVyblNxdWFyZU1vZGVsLCBBcHBFdmVudC5DSEFOR0VfQUNUSVZFLCAgIEBvbkFjdGl2ZUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9UUklHR0VSLCAgQG9uVHJpZ2dlckNoYW5nZVxuXG5cblxuXG4gICAjIEVuYWJsZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgIGVuYWJsZTogLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuZW5hYmxlKClcblxuXG5cblxuICAgIyBEaXNhYmxlIHBsYXliYWNrIG9mIHRoZSBhdWRpbyBzcXVhcmVcblxuICAgZGlzYWJsZTogLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuZGlzYWJsZSgpXG5cblxuXG5cbiAgICMgUGxheWJhY2sgYXVkaW8gb24gdGhlIGF1ZGlvIHNxdWFyZVxuXG4gICBwbGF5OiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2sucGxheSgpXG5cbiAgICAgIFR3ZWVuTWF4LnRvIEAkZWwsIC4yLFxuICAgICAgICAgZWFzZTogQmFjay5lYXNlSW5cbiAgICAgICAgIHNjYWxlOiAuNVxuXG4gICAgICAgICBvbkNvbXBsZXRlOiA9PlxuXG4gICAgICAgICAgICBUd2Vlbk1heC50byBAJGVsLCAuMixcbiAgICAgICAgICAgICAgIHNjYWxlOiAxXG4gICAgICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBjbGljayBldmVudHMgb24gdGhlIGF1ZGlvIHNxdWFyZS4gIFRvZ2dsZXMgdGhlXG4gICAjIHZvbHVtZSBmcm9tIGxvdyB0byBoaWdoIHRvIG9mZlxuXG4gICBvbkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmN5Y2xlKClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciB2ZWxvY2l0eSBjaGFuZ2UgZXZlbnRzLiAgVXBkYXRlcyB0aGUgdmlzdWFsIGRpc3BsYXkgYW5kIHNldHMgdm9sdW1lXG4gICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gICBvblZlbG9jaXR5Q2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICB2ZWxvY2l0eSA9IG1vZGVsLmNoYW5nZWQudmVsb2NpdHlcblxuICAgICAgQCRlbC5yZW1vdmVDbGFzcyAndmVsb2NpdHktbG93IHZlbG9jaXR5LW1lZGl1bSB2ZWxvY2l0eS1oaWdoJ1xuXG4gICAgICAjIFNldCB2aXN1YWwgaW5kaWNhdG9yXG4gICAgICB2ZWxvY2l0eUNsYXNzID0gc3dpdGNoIHZlbG9jaXR5XG4gICAgICAgICB3aGVuIDEgdGhlbiAndmVsb2NpdHktbG93J1xuICAgICAgICAgd2hlbiAyIHRoZW4gJ3ZlbG9jaXR5LW1lZGl1bSdcbiAgICAgICAgIHdoZW4gMyB0aGVuICd2ZWxvY2l0eS1oaWdoJ1xuICAgICAgICAgZWxzZSAnJ1xuXG4gICAgICBAJGVsLmFkZENsYXNzIHZlbG9jaXR5Q2xhc3NcblxuXG4gICAgICAjIFNldCBhdWRpbyB2b2x1bWVcbiAgICAgIHZvbHVtZSA9IHN3aXRjaCB2ZWxvY2l0eVxuICAgICAgICAgd2hlbiAxIHRoZW4gQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubG93XG4gICAgICAgICB3aGVuIDIgdGhlbiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5tZWRpdW1cbiAgICAgICAgIHdoZW4gMyB0aGVuIEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLmhpZ2hcbiAgICAgICAgIGVsc2UgJydcblxuICAgICAgQGF1ZGlvUGxheWJhY2sudm9sdW1lKCB2b2x1bWUgKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGFjdGl2aXR5IGNoYW5nZSBldmVudHMuICBXaGVuIGluYWN0aXZlLCBjaGVja3MgYWdhaW5zdCBwbGF5YmFjayBhcmVcbiAgICMgbm90IHBlcmZvcm1lZCBhbmQgdGhlIHNxdWFyZSBpcyBza2lwcGVkLlxuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25BY3RpdmVDaGFuZ2U6IChtb2RlbCkgLT5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciB0cmlnZ2VyIFwicGxheWJhY2tcIiBldmVudHNcbiAgICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uVHJpZ2dlckNoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgaWYgbW9kZWwuY2hhbmdlZC50cmlnZ2VyIGlzIHRydWVcbiAgICAgICAgIEBwbGF5KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBzb3VuZCBwbGF5YmFjayBlbmQgZXZlbnRzLiAgUmVtb3ZlcyB0aGUgdHJpZ2dlclxuICAgIyBmbGFnIHNvIHRoZSBhdWRpbyB3b24ndCBvdmVybGFwXG5cbiAgIG9uU291bmRFbmQ6ID0+XG4gICAgICBAcGF0dGVyblNxdWFyZU1vZGVsLnNldCAndHJpZ2dlcicsIGZhbHNlXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblNxdWFyZSIsIiMjIypcbiAqIEluZGl2aWR1YWwgc2VxdWVuY2VyIHRyYWNrc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmUgICAgICAgICAgID0gcmVxdWlyZSAnLi9QYXR0ZXJuU3F1YXJlLmNvZmZlZSdcblZpZXcgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYXR0ZXJuLXRyYWNrLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBQYXR0ZXJuVHJhY2sgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgbmFtZSBvZiB0aGUgY2xhc3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAncGF0dGVybi10cmFjaydcblxuXG4gICAjIFRoZSB0eXBlIG9mIHRhZ1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICB0YWdOYW1lOiAndHInXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIEEgY29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIHZpZXcgc3F1YXJlc1xuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIHBhdHRlcm5TcXVhcmVWaWV3czogbnVsbFxuXG5cbiAgICMgQHR5cGUge1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9ufVxuICAgY29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cbiAgIG1vZGVsOiBudWxsXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLmxhYmVsLWluc3RydW1lbnQnOiAnb25MYWJlbENsaWNrJ1xuICAgICAgJ3RvdWNoZW5kIC5idG4tbXV0ZSc6ICAgICAgICAgJ29uTXV0ZUJ0bkNsaWNrJ1xuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYW5kIHJlbmRlcnMgb3V0IGluZGl2aWR1YWwgcGF0dGVybiBzcXVhcmVzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkbGFiZWwgPSBAJGVsLmZpbmQgJy5sYWJlbC1pbnN0cnVtZW50J1xuXG4gICAgICBAcmVuZGVyUGF0dGVyblNxdWFyZXMoKVxuXG4gICAgICBAXG5cblxuXG4gICByZW1vdmU6IC0+XG4gICAgICBfLmVhY2ggQHBhdHRlcm5TcXVhcmVWaWV3cywgKHNxdWFyZSkgPT5cbiAgICAgICAgIHNxdWFyZS5yZW1vdmUoKVxuXG4gICAgICBzdXBlcigpXG5cblxuXG5cbiAgICMgQWRkIGxpc3RlbmVycyB0byB0aGUgdmlldyB3aGljaCBsaXN0ZW4gZm9yIHZpZXcgY2hhbmdlc1xuICAgIyBhcyB3ZWxsIGFzIGNoYW5nZXMgdG8gdGhlIGNvbGxlY3Rpb24sIHdoaWNoIHNob3VsZCB1cGRhdGVcbiAgICMgcGF0dGVybiBzcXVhcmVzIHdpdGhvdXQgcmUtcmVuZGVyaW5nIHRoZSB2aWV3c1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBraXRNb2RlbCA9IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJylcblxuICAgICAgQGxpc3RlblRvIEBtb2RlbCwgICAgQXBwRXZlbnQuQ0hBTkdFX0ZPQ1VTLCAgICAgIEBvbkZvY3VzQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQG1vZGVsLCAgICBBcHBFdmVudC5DSEFOR0VfTVVURSwgICAgICAgQG9uTXV0ZUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBraXRNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0lOU1RSVU1FTlQsIEBvbkluc3RydW1lbnRDaGFuZ2VcblxuXG5cblxuICAgIyBSZW5kZXIgb3V0IHRoZSBwYXR0ZXJuIHNxdWFyZXMgYW5kIHB1c2ggdGhlbSBpbnRvIGFuIGFycmF5XG4gICAjIGZvciBmdXJ0aGVyIGl0ZXJhdGlvblxuXG4gICByZW5kZXJQYXR0ZXJuU3F1YXJlczogLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlVmlld3MgPSBbXVxuXG4gICAgICBAY29sbGVjdGlvbiA9IG5ldyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvblxuXG4gICAgICBfKDgpLnRpbWVzID0+XG4gICAgICAgICBAY29sbGVjdGlvbi5hZGQgbmV3IFBhdHRlcm5TcXVhcmVNb2RlbCB7IGluc3RydW1lbnQ6IEBtb2RlbCB9XG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgICAgcGF0dGVyblNxdWFyZSA9IG5ldyBQYXR0ZXJuU3F1YXJlXG4gICAgICAgICAgICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG1vZGVsXG5cbiAgICAgICAgIEAkbGFiZWwudGV4dCBtb2RlbC5nZXQgJ2xhYmVsJ1xuICAgICAgICAgQCRlbC5hcHBlbmQgcGF0dGVyblNxdWFyZS5yZW5kZXIoKS5lbFxuICAgICAgICAgQHBhdHRlcm5TcXVhcmVWaWV3cy5wdXNoIHBhdHRlcm5TcXVhcmVcblxuICAgICAgIyBTZXQgdGhlIHNxdWFyZXMgb24gdGhlIEluc3RydW1lbnQgbW9kZWwgdG8gdHJhY2sgYWdhaW5zdCBzdGF0ZVxuICAgICAgQG1vZGVsLnNldCAncGF0dGVyblNxdWFyZXMnLCBAY29sbGVjdGlvblxuXG5cblxuICAgIyBNdXRlIHRoZSBlbnRpcmUgdHJhY2tcblxuICAgbXV0ZTogLT5cbiAgICAgIEBtb2RlbC5zZXQgJ211dGUnLCB0cnVlXG5cblxuXG4gICAjIFVubXV0ZSB0aGUgZW50aXJlIHRyYWNrXG5cbiAgIHVubXV0ZTogLT5cbiAgICAgIEBtb2RlbC5zZXQgJ211dGUnLCBmYWxzZVxuXG5cblxuICAgc2VsZWN0OiAtPlxuICAgICAgQCRlbC5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cblxuXG4gICBkZXNlbGVjdDogLT5cbiAgICAgIGlmIEAkZWwuaGFzQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgICAgQCRlbC5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG5cblxuXG4gICBmb2N1czogLT5cbiAgICAgIEAkZWwuYWRkQ2xhc3MgJ2ZvY3VzJ1xuXG5cblxuXG4gICB1bmZvY3VzOiAtPlxuICAgICAgaWYgQCRlbC5oYXNDbGFzcyAnZm9jdXMnXG4gICAgICAgICBAJGVsLnJlbW92ZUNsYXNzICdmb2N1cydcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBjaGFuZ2VzIHRvIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgaW5zdHJ1bWVudFxuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gaW5zdHJ1bWVudE1vZGVsXG5cbiAgIG9uSW5zdHJ1bWVudENoYW5nZTogKGluc3RydW1lbnRNb2RlbCkgPT5cbiAgICAgIGluc3RydW1lbnQgPSBpbnN0cnVtZW50TW9kZWwuY2hhbmdlZC5jdXJyZW50SW5zdHJ1bWVudFxuXG4gICAgICBpZiBpbnN0cnVtZW50LmNpZCBpcyBAbW9kZWwuY2lkXG4gICAgICAgICBAc2VsZWN0KClcblxuICAgICAgZWxzZSBAZGVzZWxlY3QoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgbW9kZWwgY2hhbmdlIGV2ZW50c1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25NdXRlQ2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBtdXRlID0gbW9kZWwuY2hhbmdlZC5tdXRlXG5cbiAgICAgIGlmIG11dGVcbiAgICAgICAgIEAkZWwuYWRkQ2xhc3MgJ211dGUnXG5cbiAgICAgIGVsc2UgQCRlbC5yZW1vdmVDbGFzcyAnbXV0ZSdcblxuXG5cbiAgICMgSGFuZGxlciBmb3IgZm9jdXMgY2hhbmdlIGV2ZW50c1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25Gb2N1c0NoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgaWYgbW9kZWwuY2hhbmdlZC5mb2N1c1xuICAgICAgICAgIEBmb2N1cygpXG4gICAgICBlbHNlXG4gICAgICAgICAgQHVuZm9jdXMoKVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtdXRlIGJ1dHRvbiBjbGlja3NcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uTGFiZWxDbGljazogKGV2ZW50KSA9PlxuICAgICAgaWYgQG1vZGVsLmdldCgnbXV0ZScpIGlzbnQgdHJ1ZVxuICAgICAgICAgQG1vZGVsLnNldCAnZm9jdXMnLCAhIEBtb2RlbC5nZXQoJ2ZvY3VzJylcblxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgYnV0dG9uIGNsaWNrc1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25NdXRlQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICAgIGlmIEBtb2RlbC5nZXQgJ211dGUnXG4gICAgICAgICBAdW5tdXRlKClcblxuICAgICAgZWxzZSBAbXV0ZSgpXG5cblxuXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuVHJhY2siLCIjIyMqXG4gKiBTZXF1ZW5jZXIgcGFyZW50IHZpZXcgZm9yIHRyYWNrIHNlcXVlbmNlc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblBhdHRlcm5UcmFjayA9IHJlcXVpcmUgJy4vUGF0dGVyblRyYWNrLmNvZmZlZSdcblB1YlN1YiAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3V0aWxzL1B1YlN1YidcbkFwcEV2ZW50ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5oZWxwZXJzICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycydcbnRlbXBsYXRlICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3NlcXVlbmNlci10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgU2VxdWVuY2VyIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIG5hbWUgb2YgdGhlIGNvbnRhaW5lciBjbGFzc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdzZXF1ZW5jZXItY29udGFpbmVyJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBBbiBhcnJheSBvZiBhbGwgcGF0dGVybiB0cmFja3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgcGF0dGVyblRyYWNrVmlld3M6IG51bGxcblxuXG4gICAjIFRoZSBzZXRJbnRlcnZhbCB0aWNrZXJcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgYnBtSW50ZXJ2YWw6IG51bGxcblxuXG4gICAjIFRoZSB0aW1lIGluIHdoaWNoIHRoZSBpbnRlcnZhbCBmaXJlc1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICB1cGRhdGVJbnRlcnZhbFRpbWU6IDIwMFxuXG5cbiAgICMgVGhlIGN1cnJlbnQgYmVhdCBpZFxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBjdXJyQmVhdENlbGxJZDogLTFcblxuXG4gICAjIFRPRE86IFVwZGF0ZSB0aGlzIHRvIG1ha2UgaXQgbW9yZSBkeW5hbWljXG4gICAjIFRoZSBudW1iZXIgb2YgYmVhdCBjZWxsc1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBudW1DZWxsczogN1xuXG5cbiAgICMgR2xvYmFsIGFwcGxpY2F0aW9uIG1vZGVsXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIENvbGxlY3Rpb24gb2YgaW5zdHJ1bWVudHNcbiAgICMgQHR5cGUge0luc3RydW1lbnRDb2xsZWN0aW9ufVxuXG4gICBjb2xsZWN0aW9uOiBudWxsXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH1cblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCR0aFN0ZXBwZXIgPSBAJGVsLmZpbmQgJ3RoLnN0ZXBwZXInXG4gICAgICBAJHNlcXVlbmNlciA9IEAkZWwuZmluZCAnLnNlcXVlbmNlcidcblxuICAgICAgQHJlbmRlclRyYWNrcygpXG4gICAgICBAcGxheSgpXG5cbiAgICAgIEBcblxuXG4gICAjIFJlbW92ZXMgdGhlIHZpZXcgZnJvbSB0aGUgRE9NIGFuZCBjYW5jZWxzXG4gICAjIHRoZSB0aWNrZXIgaW50ZXJ2YWxcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgXy5lYWNoIEBwYXR0ZXJuVHJhY2tWaWV3cywgKHRyYWNrKSA9PlxuICAgICAgICAgdHJhY2sucmVtb3ZlKClcblxuICAgICAgQHBhdXNlKClcblxuICAgICAgc3VwZXIoKVxuXG5cblxuICAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kbGluZyBpbnN0cnVtZW50IGFuZCBwbGF5YmFja1xuICAgIyBjaGFuZ2VzLiAgVXBkYXRlcyBhbGwgb2YgdGhlIHZpZXdzIGFjY29yZGluZ2x5XG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgICBBcHBFdmVudC5DSEFOR0VfQlBNLCAgICAgQG9uQlBNQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAgIEFwcEV2ZW50LkNIQU5HRV9QTEFZSU5HLCBAb25QbGF5aW5nQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAgIEFwcEV2ZW50LkNIQU5HRV9LSVQsICAgICBAb25LaXRDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAY29sbGVjdGlvbiwgQXBwRXZlbnQuQ0hBTkdFX0ZPQ1VTLCAgIEBvbkZvY3VzQ2hhbmdlXG5cbiAgICAgIFB1YlN1Yi5vbiBBcHBFdmVudC5JTVBPUlRfVFJBQ0ssIEBvbkltcG9ydFRyYWNrXG4gICAgICBQdWJTdWIub24gQXBwRXZlbnQuRVhQT1JUX1RSQUNLLCBAb25FeHBvcnRUcmFja1xuXG5cblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBzdXBlcigpXG5cbiAgICAgIFB1YlN1Yi5vZmYgQXBwRXZlbnQuSU1QT1JUX1RSQUNLXG4gICAgICBQdWJTdWIub2ZmIEFwcEV2ZW50LkVYUE9SVF9UUkFDS1xuXG5cblxuICAgIyBSZW5kZXJzIG91dCBlYWNoIGluZGl2aWR1YWwgdHJhY2suXG4gICAjIFRPRE86IE5lZWQgdG8gdXBkYXRlIHNvIHRoYXQgYWxsIG9mIHRoZSBiZWF0IHNxdWFyZXMgYXJlbid0XG4gICAjIGJsb3duIGF3YXkgYnkgdGhlIHJlLXJlbmRlclxuXG4gICByZW5kZXJUcmFja3M6ID0+XG4gICAgICBAJGVsLmZpbmQoJy5wYXR0ZXJuLXRyYWNrJykucmVtb3ZlKClcblxuICAgICAgQHBhdHRlcm5UcmFja1ZpZXdzID0gW11cblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAobW9kZWwpID0+XG5cbiAgICAgICAgIHBhdHRlcm5UcmFjayA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IG1vZGVsLmdldCAncGF0dGVyblNxdWFyZXMnXG4gICAgICAgICAgICBtb2RlbDogbW9kZWxcblxuICAgICAgICAgQHBhdHRlcm5UcmFja1ZpZXdzLnB1c2ggcGF0dGVyblRyYWNrXG4gICAgICAgICBAJHNlcXVlbmNlci5hcHBlbmQgcGF0dGVyblRyYWNrLnJlbmRlcigpLmVsXG5cblxuXG5cbiAgICMgVXBkYXRlIHRoZSB0aWNrZXIgdGltZSwgYW5kIGFkdmFuY2VzIHRoZSBiZWF0XG5cbiAgIHVwZGF0ZVRpbWU6ID0+XG4gICAgICBAJHRoU3RlcHBlci5yZW1vdmVDbGFzcyAnc3RlcCdcbiAgICAgIEBjdXJyQmVhdENlbGxJZCA9IGlmIEBjdXJyQmVhdENlbGxJZCA8IEBudW1DZWxscyB0aGVuIEBjdXJyQmVhdENlbGxJZCArPSAxIGVsc2UgQGN1cnJCZWF0Q2VsbElkID0gMFxuICAgICAgJChAJHRoU3RlcHBlcltAY3VyckJlYXRDZWxsSWRdKS5hZGRDbGFzcyAnc3RlcCdcblxuICAgICAgQHBsYXlBdWRpbygpXG5cblxuXG5cbiAgICMgQ29udmVydHMgbWlsbGlzZWNvbmRzIHRvIEJQTVxuXG4gICBjb252ZXJ0QlBNOiAtPlxuICAgICAgcmV0dXJuIDIwMFxuXG5cblxuICAgIyBTdGFydCBwbGF5YmFjayBvZiBzZXF1ZW5jZXJcblxuICAgcGxheTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3BsYXlpbmcnLCB0cnVlXG5cblxuXG5cbiAgICMgUGF1c2VzIHNlcXVlbmNlciBwbGF5YmFja1xuXG4gICBwYXVzZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3BsYXlpbmcnLCBmYWxzZVxuXG5cblxuXG4gICAjIE11dGVzIHRoZSBzZXF1ZW5jZXJcblxuICAgbXV0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ211dGUnLCB0cnVlXG5cblxuXG5cbiAgICMgVW5tdXRlcyB0aGUgc2VxdWVuY2VyXG5cbiAgIHVubXV0ZTogLT5cbiAgICAgICBAYXBwTW9kZWwuc2V0ICdtdXRlJywgZmFsc2VcblxuXG5cblxuXG4gICAjIFBsYXlzIGF1ZGlvIG9mIGVhY2ggdHJhY2sgY3VycmVudGx5IGVuYWJsZWQgYW5kIG9uXG5cbiAgIHBsYXlBdWRpbzogLT5cbiAgICAgIGZvY3VzZWRJbnN0cnVtZW50ID0gIEBjb2xsZWN0aW9uLmZpbmRXaGVyZSB7IGZvY3VzOiB0cnVlIH1cblxuICAgICAgIyBDaGVjayBpZiB0aGVyZSdzIGEgZm9jdXNlZCB0cmFjayBhbmQgb25seVxuICAgICAgIyBwbGF5IGF1ZGlvIGZyb20gdGhlcmVcblxuICAgICAgaWYgZm9jdXNlZEluc3RydW1lbnRcbiAgICAgICAgIGlmIGZvY3VzZWRJbnN0cnVtZW50LmdldCgnbXV0ZScpIGlzbnQgdHJ1ZVxuICAgICAgICAgICAgZm9jdXNlZEluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpLmVhY2ggKHBhdHRlcm5TcXVhcmUsIGluZGV4KSA9PlxuICAgICAgICAgICAgICAgQHBsYXlQYXR0ZXJuU3F1YXJlQXVkaW8oIHBhdHRlcm5TcXVhcmUsIGluZGV4IClcblxuICAgICAgICAgcmV0dXJuXG5cblxuICAgICAgIyBJZiBub3RoaW5nIGlzIGZvY3VzZWQsIHRoZW4gY2hlY2sgYWdhaW5zdFxuICAgICAgIyB0aGUgZW50aXJlIG1hdHJpeFxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChpbnN0cnVtZW50KSA9PlxuICAgICAgICAgaWYgaW5zdHJ1bWVudC5nZXQoJ211dGUnKSBpc250IHRydWVcbiAgICAgICAgICAgIGluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpLmVhY2ggKHBhdHRlcm5TcXVhcmUsIGluZGV4KSA9PlxuICAgICAgICAgICAgICAgQHBsYXlQYXR0ZXJuU3F1YXJlQXVkaW8oIHBhdHRlcm5TcXVhcmUsIGluZGV4IClcblxuXG5cblxuICAgIyBQbGF5cyB0aGUgYXVkaW8gb24gYW4gaW5kaXZpZHVhbCBQYXR0ZXJTcXVhcmUgaWYgdGVtcG8gaW5kZXhcbiAgICMgaXMgdGhlIHNhbWUgYXMgdGhlIGluZGV4IHdpdGhpbiB0aGUgY29sbGVjdGlvblxuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmV9IHBhdHRlcm5TcXVhcmVcbiAgICMgQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG5cbiAgIHBsYXlQYXR0ZXJuU3F1YXJlQXVkaW86IChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgLT5cbiAgICAgIGlmIEBjdXJyQmVhdENlbGxJZCBpcyBpbmRleFxuICAgICAgICAgaWYgcGF0dGVyblNxdWFyZS5nZXQgJ2FjdGl2ZSdcbiAgICAgICAgICAgIHBhdHRlcm5TcXVhcmUuc2V0ICd0cmlnZ2VyJywgdHJ1ZVxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIEJQTSB0ZW1wbyBjaGFuZ2VzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uQlBNQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBjbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuICAgICAgQHVwZGF0ZUludGVydmFsVGltZSA9IG1vZGVsLmNoYW5nZWQuYnBtXG4gICAgICBAYnBtSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAdXBkYXRlVGltZSwgQHVwZGF0ZUludGVydmFsVGltZVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHBsYXliYWNrIGNoYW5nZXMuICBJZiBwYXVzZWQsIGl0IHN0b3BzIHBsYXliYWNrIGFuZFxuICAgIyBjbGVhcnMgdGhlIGludGVydmFsLiAgSWYgcGxheWluZywgaXQgcmVzZXRzIGl0XG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uUGxheWluZ0NoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgcGxheWluZyA9IG1vZGVsLmNoYW5nZWQucGxheWluZ1xuXG4gICAgICBpZiBwbGF5aW5nXG4gICAgICAgICBAYnBtSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAdXBkYXRlVGltZSwgQHVwZGF0ZUludGVydmFsVGltZVxuXG4gICAgICBlbHNlXG4gICAgICAgICBjbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuICAgICAgICAgQGJwbUludGVydmFsID0gbnVsbFxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgYW5kIHVubXV0ZSBjaGFuZ2VzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uTXV0ZUNoYW5nZTogKG1vZGVsKSA9PlxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2VzLCBhcyBzZXQgZnJvbSB0aGUgS2l0U2VsZWN0b3JcbiAgICMgQHBhcmFtIHtLaXRNb2RlbH0gbW9kZWxcblxuICAgb25LaXRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEBjb2xsZWN0aW9uID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJylcbiAgICAgIEByZW5kZXJUcmFja3MoKVxuXG4gICAgICBjb25zb2xlLmxvZyBAY29sbGVjdGlvbi50b0pTT04oKVxuXG4gICAgICAjIEV4cG9ydCBvbGQgcGF0dGVybiBzcXVhcmVzIHNvIHRoZSB1c2VycyBwYXR0ZXJuIGlzbid0IGJsb3duIGF3YXlcbiAgICAgICMgd2hlbiBraXQgY2hhbmdlcyBvY2N1clxuXG4gICAgICBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbiA9IG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMua2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpXG4gICAgICBvbGRQYXR0ZXJuU3F1YXJlcyA9IG9sZEluc3RydW1lbnRDb2xsZWN0aW9uLmV4cG9ydFBhdHRlcm5TcXVhcmVzKClcblxuXG4gICAgICAjIFVwZGF0ZSB0aGUgbmV3IGNvbGxlY3Rpb24gd2l0aCBvbGQgcGF0dGVybiBzcXVhcmUgZGF0YVxuICAgICAgIyBhbmQgdHJpZ2dlciBVSSB1cGRhdGVzIG9uIGVhY2ggc3F1YXJlXG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKGluc3RydW1lbnRNb2RlbCwgaW5kZXgpIC0+XG4gICAgICAgICBvbGRDb2xsZWN0aW9uID0gb2xkUGF0dGVyblNxdWFyZXNbaW5kZXhdXG4gICAgICAgICBuZXdDb2xsZWN0aW9uID0gaW5zdHJ1bWVudE1vZGVsLmdldCAncGF0dGVyblNxdWFyZXMnXG5cbiAgICAgICAgICMgVXBkYXRlIHRyYWNrIC8gaW5zdHJ1bWVudCBsZXZlbCBwcm9wZXJ0aWVzIGxpa2Ugdm9sdW1lIC8gbXV0ZSAvIGZvY3VzXG4gICAgICAgICBvbGRQcm9wcyA9IG9sZEluc3RydW1lbnRDb2xsZWN0aW9uLmF0KGluZGV4KVxuXG4gICAgICAgICB1bmxlc3Mgb2xkUHJvcHMgaXMgdW5kZWZpbmVkXG5cbiAgICAgICAgICAgIG9sZFByb3BzID0gb2xkUHJvcHMudG9KU09OKClcblxuICAgICAgICAgICAgaW5zdHJ1bWVudE1vZGVsLnNldFxuICAgICAgICAgICAgICAgdm9sdW1lOiBvbGRQcm9wcy52b2x1bWVcbiAgICAgICAgICAgICAgIGFjdGl2ZTogb2xkUHJvcHMuYWN0aXZlXG4gICAgICAgICAgICAgICBtdXRlOiAgIG9sZFByb3BzLm11dGVcbiAgICAgICAgICAgICAgIGZvY3VzOiAgb2xkUHJvcHMuZm9jdXNcblxuICAgICAgICAgIyBDaGVjayBmb3IgaW5jb25zaXN0YW5jaWVzIGJldHdlZW4gbnVtYmVyIG9mIGluc3RydW1lbnRzXG4gICAgICAgICB1bmxlc3Mgb2xkQ29sbGVjdGlvbiBpcyB1bmRlZmluZWRcblxuICAgICAgICAgICAgbmV3Q29sbGVjdGlvbi5lYWNoIChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgLT5cbiAgICAgICAgICAgICAgIG9sZFBhdHRlcm5TcXVhcmUgPSBvbGRDb2xsZWN0aW9uLmF0IGluZGV4XG4gICAgICAgICAgICAgICBwYXR0ZXJuU3F1YXJlLnNldCBvbGRQYXR0ZXJuU3F1YXJlLnRvSlNPTigpXG5cblxuXG5cbiAgIG9uSW1wb3J0VHJhY2s6IChwYXJhbXMpID0+XG4gICAgICB7Y2FsbGJhY2ssIHBhdHRlcm5TcXVhcmVHcm91cHMsIHBhdHRlcm5TcXVhcmVzfSA9IHBhcmFtc1xuXG4gICAgICBAcmVuZGVyVHJhY2tzKClcblxuICAgICAgI2l0ZXJhdG9yID0gMFxuXG4gICAgICBfLmVhY2ggQHBhdHRlcm5UcmFja1ZpZXdzLCAodHJhY2tWaWV3LCBpdGVyYXRvcikgLT5cbiAgICAgICAgIHRyYWNrVmlldy5jb2xsZWN0aW9uLmVhY2ggKHBhdHRlcm5Nb2RlbCwgaW5kZXgpIC0+XG5cbiAgICAgICAgICAgIHBhdHRlcm5Nb2RlbC5zZXQgcGF0dGVyblNxdWFyZUdyb3Vwc1tpdGVyYXRvcl1baW5kZXhdXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBwYXR0ZXJuTW9kZWwudG9KU09OKClcblxuICAgICAgY2FsbGJhY2soKVxuXG5cblxuXG4gICBvbkV4cG9ydFRyYWNrOiAtPlxuICAgICAge2NhbGxiYWNrfSA9IHBhcmFtc1xuXG4gICAgICBwYXR0ZXJuU3F1YXJlcyA9IFtdXG5cbiAgICAgIGNvbnNvbGUubG9nICdmaXJpbmcgZXhwb3J0ISEnXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBmb2N1cyBjaGFuZ2UgZXZlbnRzLiAgSXRlcmF0ZXMgb3ZlciBhbGwgb2YgdGhlIG1vZGVscyB3aXRoaW5cbiAgICMgdGhlIEluc3RydW1lbnRDb2xsZWN0aW9uIGFuZCB0b2dnbGVzIHRoZWlyIGZvY3VzIHRvIG9mZiBpZiB0aGUgY2hhbmdlZFxuICAgIyBtb2RlbCdzIGZvY3VzIGlzIHNldCB0byB0cnVlLlxuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25Gb2N1c0NoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAoaW5zdHJ1bWVudE1vZGVsKSA9PlxuICAgICAgICAgaWYgbW9kZWwuY2hhbmdlZC5mb2N1cyBpcyB0cnVlXG4gICAgICAgICAgICBpZiBtb2RlbC5jaWQgaXNudCBpbnN0cnVtZW50TW9kZWwuY2lkXG4gICAgICAgICAgICAgICBpbnN0cnVtZW50TW9kZWwuc2V0ICdmb2N1cycsIGZhbHNlXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VxdWVuY2VyIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCI7XG5cblxuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG5cbiAgYnVmZmVyICs9IFwiPHRkIGNsYXNzPSdsYWJlbC1pbnN0cnVtZW50Jz5cXG5cdFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxuPC90ZD5cXG48dGQgY2xhc3M9J2J0bi1tdXRlJz5cXG5cdG11dGVcXG48L3RkPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIHN0YWNrMiwgb3B0aW9ucywgc2VsZj10aGlzLCBoZWxwZXJNaXNzaW5nPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJcXG5cdFx0XHQ8dGggY2xhc3M9J3N0ZXBwZXInPjwvdGg+XFxuXHRcdFwiO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPHRhYmxlIGNsYXNzPSdzZXF1ZW5jZXInPlxcblx0PHRyPlxcblx0XHQ8dGg+PC90aD5cXG5cdFx0PHRoPjwvdGg+XFxuXFxuXHRcdFwiO1xuICBvcHRpb25zID0ge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9O1xuICBzdGFjazIgPSAoKHN0YWNrMSA9IGhlbHBlcnMucmVwZWF0IHx8IGRlcHRoMC5yZXBlYXQpLHN0YWNrMSA/IHN0YWNrMS5jYWxsKGRlcHRoMCwgOCwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcInJlcGVhdFwiLCA4LCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMiB8fCBzdGFjazIgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMjsgfVxuICBidWZmZXIgKz0gXCJcXG5cdDwvdHI+XFxuXFxuPC90YWJsZT5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxidXR0b24gY2xhc3M9J2J0bi1kZWNyZWFzZSc+REVDUkVBU0U8L2J1dHRvbj5cXG48c3BhbiBjbGFzcz0nbGFiZWwtYnBtJz4wPC9zcGFuPlxcbjxidXR0b24gY2xhc3M9J2J0bi1pbmNyZWFzZSc+SU5DUkVBU0U8L2J1dHRvbj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxidXR0b24gY2xhc3M9J2J0bi1sZWZ0Jz5MRUZUPC9idXR0b24+XFxuPHNwYW4gY2xhc3M9J2xhYmVsLWtpdCc+RFJVTSBLSVQ8L3NwYW4+XFxuPGJ1dHRvbiBjbGFzcz0nYnRuLXJpZ2h0Jz5SSUdIVDwvYnV0dG9uPlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0nYnRuLWV4cG9ydCc+RVhQT1JUPC9kaXY+XFxuPGRpdiBjbGFzcz0nYnRuLXNoYXJlJz5TSEFSRTwvZGl2PlxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci1raXQtc2VsZWN0b3InPlxcblx0PGRpdiBjbGFzcz0na2l0LXNlbGVjdG9yJz48L2Rpdj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPSdjb250YWluZXItdmlzdWFsaXphdGlvbic+VmlzdWFsaXphdGlvbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci1zZXF1ZW5jZXInPlxcblxcblx0PGRpdiBjbGFzcz0naW5zdHJ1bWVudC1zZWxlY3Rvcic+SW5zdHJ1bWVudCBTZWxlY3RvcjwvZGl2Plxcblx0PGRpdiBjbGFzcz0nc2VxdWVuY2VyJz5TZXF1ZW5jZXI8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J2JwbSc+QlBNPC9kaXY+XFxuXFxuPC9kaXY+XCI7XG4gIH0pIiwiIyMjKlxuICogTGFuZGluZyB2aWV3IHdpdGggc3RhcnQgYnV0dG9uIGFuZCBpbml0aWFsIGFuaW1hdGlvblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblB1YlN1YiAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvUHViU3ViJ1xuUHViRXZlbnQgPSByZXF1aXJlICcuLi8uLi9ldmVudHMvUHViRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2xhbmRpbmctdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIExhbmRpbmdWaWV3IGV4dGVuZHMgVmlld1xuXG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCAuc3RhcnQtYnRuJzogJ29uU3RhcnRCdG5DbGljaydcblxuXG4gICBvblN0YXJ0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIFB1YlN1Yi50cmlnZ2VyIFB1YkV2ZW50LlJPVVRFLFxuICAgICAgICAgcm91dGU6ICdjcmVhdGUnXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IExhbmRpbmdWaWV3IiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8c3BhbiBjbGFzcz0nc3RhcnQtYnRuJz5DUkVBVEU8L3NwYW4+XCI7XG4gIH0pIiwiIyMjKlxuICogU2hhcmUgdGhlIHVzZXIgY3JlYXRlZCBiZWF0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3NoYXJlLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBTaGFyZVZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTaGFyZVZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxhIGhyZWY9Jy8jJz5ORVc8L2E+XCI7XG4gIH0pIiwiIyMjKlxuICogTGFuZGluZyB2aWV3IHdpdGggc3RhcnQgYnV0dG9uIGFuZCBpbml0aWFsIGFuaW1hdGlvblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3Rlc3RzLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBUZXN0c1ZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gVGVzdHNWaWV3IiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8aDE+Q29tcG9uZW50IFZpZXdlcjwvaDE+XFxuXFxuPGJyIC8+XFxuPHA+XFxuXHRNYWtlIHN1cmUgdGhhdCA8Yj5odHRwc3RlcjwvYj4gaXMgcnVubmluZyBpbiB0aGUgPGI+c291cmNlPC9iPiByb3V0ZSAobnBtIGluc3RhbGwgLWcgaHR0cHN0ZXIpIDxici8+XFxuXHQ8YSBocmVmPVxcXCJodHRwOi8vbG9jYWxob3N0OjMzMzMvdGVzdC9odG1sL1xcXCI+TW9jaGEgVGVzdCBSdW5uZXI8L2E+XFxuPC9wPlxcblxcbjxiciAvPlxcbjx1bD5cXG5cdDxsaT48YSBocmVmPScja2l0LXNlbGVjdGlvbic+S2l0IFNlbGVjdGlvbjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNicG0taW5kaWNhdG9yXFxcIj5CUE0gSW5kaWNhdG9yPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2luc3RydW1lbnQtc2VsZWN0b3JcXFwiPkluc3RydW1lbnQgU2VsZWN0b3I8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjcGF0dGVybi1zcXVhcmVcXFwiPlBhdHRlcm4gU3F1YXJlPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI3BhdHRlcm4tdHJhY2tcXFwiPlBhdHRlcm4gVHJhY2s8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjc2VxdWVuY2VyXFxcIj5TZXF1ZW5jZXI8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjZnVsbC1zZXF1ZW5jZXJcXFwiPkZ1bGwgU2VxdWVuY2VyPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI3BhZC1zcXVhcmVcXFwiPlBhZCBTcXVhcmU8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjbGl2ZS1wYWRcXFwiPkxpdmVQYWQ8L2E+PC9saT5cXG48L3VsPlwiO1xuICB9KSIsIlxuZGVzY3JpYmUgJ01vZGVscycsID0+XG5cbiAgIHJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvS2l0Q29sbGVjdGlvbi1zcGVjLmNvZmZlZSdcbiAgIHJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvS2l0TW9kZWwtc3BlYy5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1ZpZXdzJywgPT5cblxuICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUnXG4gICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3Itc3BlYy5jb2ZmZWUnXG4gICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLXNwZWMuY29mZmVlJ1xuXG5cbiAgIGRlc2NyaWJlICdMaXZlIFBhZCcsID0+XG5cbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvUGFkU3F1YXJlLXNwZWMuY29mZmVlJ1xuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9MaXZlUGFkLXNwZWMuY29mZmVlJ1xuXG5cbiAgIGRlc2NyaWJlICdJbnN0cnVtZW50IFNlbGVjdG9yJywgPT5cblxuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLXNwZWMuY29mZmVlJ1xuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQtc3BlYy5jb2ZmZWUnXG5cblxuICAgZGVzY3JpYmUgJ1NlcXVlbmNlcicsID0+XG5cbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS1zcGVjLmNvZmZlZSdcbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLXNwZWMuY29mZmVlJ1xuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXItc3BlYy5jb2ZmZWUnXG5cblxuXG5yZXF1aXJlICcuL3NwZWMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LXNwZWMuY29mZmVlJ1xucmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LXNwZWMuY29mZmVlJ1xuXG5yZXF1aXJlICcuL3NwZWMvbW9kZWxzL1NvdW5kQ29sbGVjdGlvbi1zcGVjLmNvZmZlZSdcbnJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvU291bmRNb2RlbC1zcGVjLmNvZmZlZSdcblxuIyBDb250cm9sbGVyc1xucmVxdWlyZSAnLi9zcGVjL0FwcENvbnRyb2xsZXItc3BlYy5jb2ZmZWUnXG4iLCJBcHBDb250cm9sbGVyID0gcmVxdWlyZSAnLi4vLi4vc3JjL3NjcmlwdHMvQXBwQ29udHJvbGxlci5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0FwcCBDb250cm9sbGVyJywgLT5cblxuICAgaXQgJ1Nob3VsZCBpbml0aWFsaXplJywgPT4iLCJBcHBDb25maWcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5cbmRlc2NyaWJlICdLaXQgQ29sbGVjdGlvbicsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cblxuICAgaXQgJ1Nob3VsZCBwYXJzZSB0aGUgcmVzcG9uc2UgYW5kIGFwcGVuZCBhbiBhc3NldFBhdGggdG8gZWFjaCBraXQgbW9kZWwnLCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdwYXRoJykuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCByZXR1cm4gdGhlIG5leHQga2l0JywgPT5cbiAgICAgIGtpdERhdGEgPSBAa2l0Q29sbGVjdGlvbi50b0pTT04oKVxuICAgICAga2l0ID0gQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG4gICAgICBraXQuZ2V0KCdsYWJlbCcpLnNob3VsZC5lcXVhbCBraXREYXRhWzFdLmxhYmVsXG5cblxuICAgaXQgJ1Nob3VsZCByZXR1cm4gdGhlIHByZXZpb3VzIGtpdCcsID0+XG4gICAgICBraXREYXRhID0gQGtpdENvbGxlY3Rpb24udG9KU09OKClcbiAgICAgIGtpdCA9IEBraXRDb2xsZWN0aW9uLnByZXZpb3VzS2l0KClcbiAgICAgIGtpdC5nZXQoJ2xhYmVsJykuc2hvdWxkLmVxdWFsIGtpdERhdGFba2l0RGF0YS5sZW5ndGgtMV0ubGFiZWwiLCJBcHBDb25maWcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblxuZGVzY3JpYmUgJ0tpdCBNb2RlbCcsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cblxuICAgICAgZGF0YSA9IHtcbiAgICAgICAgIFwibGFiZWxcIjogXCJIaXAgSG9wXCIsXG4gICAgICAgICBcImZvbGRlclwiOiBcImhpcC1ob3BcIixcbiAgICAgICAgIFwiaW5zdHJ1bWVudHNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNsb3NlZCBIaUhhdFwiLFxuICAgICAgICAgICAgICAgXCJzcmNcIjogXCJIQVRfMi5tcDNcIixcbiAgICAgICAgICAgICAgIFwiaWNvblwiOiBcImljb24taGloYXQtY2xvc2VkXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiS2ljayBEcnVtXCIsXG4gICAgICAgICAgICAgICBcInNyY1wiOiBcIktJS18yLm1wM1wiLFxuICAgICAgICAgICAgICAgXCJpY29uXCI6IFwiaWNvbi1raWNrZHJ1bVwiXG4gICAgICAgICAgICB9XG4gICAgICAgICBdXG4gICAgICB9XG5cbiAgICAgIEBraXRNb2RlbCA9IG5ldyBLaXRNb2RlbCBkYXRhLCB7IHBhcnNlOiB0cnVlIH1cblxuXG4gICBpdCAnU2hvdWxkIHBhcnNlIHRoZSBtb2RlbCBkYXRhIGFuZCBjb252ZXJ0IGluc3RydW1lbnRzIHRvIGFuIEluc3RydW1lbnRzQ29sbGVjdGlvbicsID0+XG4gICAgICBAa2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLnNob3VsZC5iZS5hbi5pbnN0YW5jZW9mIEluc3RydW1lbnRDb2xsZWN0aW9uIiwiXG5cbmRlc2NyaWJlICdTb3VuZCBDb2xsZWN0aW9uJywgLT5cblxuICAgaXQgJ1Nob3VsZCBpbml0aWFsaXplIHdpdGggYSBzb3VuZCBzZXQnLCA9PiIsIlxuXG5kZXNjcmliZSAnU291bmQgTW9kZWwnLCAtPlxuXG4gICBpdCAnU2hvdWxkIGluaXRpYWxpemUgd2l0aCBkZWZhdWx0IGNvbmZpZyBwcm9wZXJ0aWVzJywgPT4iLCJBcHBDb25maWcgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcbkNyZWF0ZVZpZXcgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdDcmVhdGUgVmlldycsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAdmlldyAgPSBuZXcgQ3JlYXRlVmlld1xuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgZXhwZWN0KEB2aWV3LmVsKS50by5leGlzdCIsIkJQTUluZGljYXRvciA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci5jb2ZmZWUnXG5BcHBNb2RlbCAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuQXBwRXZlbnQgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcbkFwcENvbmZpZyAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuXG5kZXNjcmliZSAnQlBNIEluZGljYXRvcicsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQHZpZXcgPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICBhcHBNb2RlbDogbmV3IEFwcE1vZGVsKClcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIGlmIEB2aWV3LnVwZGF0ZUludGVydmFsIHRoZW4gY2xlYXJJbnRlcnZhbCBAdmlldy51cGRhdGVJbnRlcnZhbFxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cblxuICAgICAgQHZpZXcuc2hvdWxkLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIGRpc3BsYXkgdGhlIGN1cnJlbnQgQlBNIGluIHRoZSBsYWJlbCcsID0+XG5cbiAgICAgICRsYWJlbCA9IEB2aWV3LiRlbC5maW5kICcubGFiZWwtYnBtJ1xuICAgICAgJGxhYmVsLnRleHQoKS5zaG91bGQuZXF1YWwgU3RyaW5nKDYwMDAwIC8gQHZpZXcuYXBwTW9kZWwuZ2V0KCdicG0nKSlcblxuXG5cbiAgICMgaXQgJ1Nob3VsZCBhdXRvLWFkdmFuY2UgdGhlIGJwbSB2aWEgc2V0SW50ZXJ2YWwgb24gcHJlc3MnLCAoZG9uZSkgPT5cblxuICAgIyAgICBAdmlldy5icG1JbmNyZWFzZUFtb3VudCA9IDUwXG4gICAjICAgIEB2aWV3LmludGVydmFsVXBkYXRlVGltZSA9IDFcbiAgICMgICAgYXBwTW9kZWwgPSBAdmlldy5hcHBNb2RlbFxuICAgIyAgICBhcHBNb2RlbC5zZXQgJ2JwbScsIDFcblxuICAgIyAgICBzZXRUaW1lb3V0ID0+XG4gICAjICAgICAgIGJwbSA9IGFwcE1vZGVsLmdldCAnYnBtJ1xuXG4gICAjICAgICAgIGlmIGJwbSA+PSAxMjBcbiAgICMgICAgICAgICAgQHZpZXcub25CdG5VcCgpXG4gICAjICAgICAgICAgIGRvbmUoKVxuICAgIyAgICAsIDEwMFxuXG4gICAjICAgIEB2aWV3Lm9uSW5jcmVhc2VCdG5Eb3duKClcblxuXG5cbiAgICMgaXQgJ1Nob3VsZCBjbGVhciB0aGUgaW50ZXJ2YWwgb24gcmVsZWFzZScsID0+XG5cbiAgICMgICAgQHZpZXcub25JbmNyZWFzZUJ0bkRvd24oKVxuICAgIyAgICBAdmlldy51cGRhdGVJbnRlcnZhbC5zaG91bGQuZXhpc3RcbiAgICMgICAgQHZpZXcub25CdG5VcCgpXG4gICAjICAgIGV4cGVjdChAdmlldy51cGRhdGVJbnRlcnZhbCkudG8uYmUubnVsbFxuXG4iLCJBcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdFNlbGVjdG9yICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci5jb2ZmZWUnXG5BcHBNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbktpdE1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0tpdCBTZWxlY3Rpb24nLCAtPlxuXG5cbiAgIGJlZm9yZSA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cblxuICAgYmVmb3JlRWFjaCA9PlxuXG4gICAgICBAdmlldyA9IG5ldyBLaXRTZWxlY3RvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cblxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cblxuXG4gICBpdCAnU2hvdWxkIGhhdmUgYSBsYWJlbCcsID0+XG5cbiAgICAgICRsYWJlbCA9IEB2aWV3LiRlbC5maW5kICcubGFiZWwta2l0J1xuICAgICAgJGxhYmVsLnNob3VsZC5leGlzdFxuXG5cblxuXG4gICBpdCAnU2hvdWxkIHVwZGF0ZSB0aGUgQXBwTW9kZWwgYSBraXQgaXMgY2hhbmdlZCcsID0+XG5cbiAgICAgICRsYWJlbCA9IEB2aWV3LiRlbC5maW5kICcubGFiZWwta2l0J1xuICAgICAgZmlyc3RMYWJlbCA9IEB2aWV3LmtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0ICdsYWJlbCdcbiAgICAgIGxhc3RMYWJlbCAgPSBAdmlldy5raXRDb2xsZWN0aW9uLmF0KEB2aWV3LmtpdENvbGxlY3Rpb24ubGVuZ3RoLTEpLmdldCAnbGFiZWwnXG5cbiAgICAgIGFwcE1vZGVsID0gQHZpZXcuYXBwTW9kZWxcblxuICAgICAgYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpraXRNb2RlbCcpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm9uTGVmdEJ0bkNsaWNrKClcbiAgICAgICAgICRsYWJlbC50ZXh0KCkuc2hvdWxkLmVxdWFsIGxhc3RMYWJlbFxuXG4gICAgICBhcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmtpdE1vZGVsJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcub25SaWdodEJ0bkNsaWNrKClcbiAgICAgICAgICRsYWJlbC50ZXh0KCkuc2hvdWxkLmVxdWFsIGZpcnN0TGFiZWxcblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiIsIkluc3RydW1lbnQgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC5jb2ZmZWUnXG5LaXRNb2RlbCAgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnSW5zdHJ1bWVudCcsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQHZpZXcgPSBuZXcgSW5zdHJ1bWVudFxuICAgICAgICAga2l0TW9kZWw6IG5ldyBLaXRNb2RlbCgpXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCBhbGxvdyB1c2VyIHRvIHNlbGVjdCBpbnN0cnVtZW50cycsID0+XG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIGV4cGVjdChAdmlldy4kZWwuaGFzQ2xhc3MoJ3NlbGVjdGVkJykpLnRvLmJlLnRydWUiLCJJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUnXG5BcHBDb25maWcgICAgICAgICAgICAgICAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCAgICAgICAgICAgICAgICAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gICAgICAgICAgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnSW5zdHJ1bWVudCBTZWxlY3Rpb24gUGFuZWwnLCAtPlxuXG5cbiAgIGJlZm9yZSA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWwoKVxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAdmlldyA9IG5ldyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy5zaG91bGQuZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVmZXIgdG8gdGhlIGN1cnJlbnQgS2l0TW9kZWwgd2hlbiBpbnN0YW50aWF0aW5nIHNvdW5kcycsID0+XG5cbiAgICAgIGV4cGVjdChAdmlldy5raXRNb2RlbCkudG8uZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgaXRlcmF0ZSBvdmVyIGFsbCBvZiB0aGUgc291bmRzIGluIHRoZSBTb3VuZENvbGxlY3Rpb24gdG8gYnVpbGQgb3V0IGluc3RydW1lbnRzJywgPT5cblxuICAgICAgQHZpZXcua2l0TW9kZWwudG9KU09OKCkuaW5zdHJ1bWVudHMubGVuZ3RoLnNob3VsZC5iZS5hYm92ZSgwKVxuXG4gICAgICAkaW5zdHJ1bWVudHMgPSBAdmlldy4kZWwuZmluZCgnLmNvbnRhaW5lci1pbnN0cnVtZW50cycpLmZpbmQoJy5pbnN0cnVtZW50JylcbiAgICAgICRpbnN0cnVtZW50cy5sZW5ndGguc2hvdWxkLmJlLmFib3ZlKDApXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlYnVpbGQgdmlldyB3aGVuIHRoZSBraXRNb2RlbCBjaGFuZ2VzJywgPT5cblxuICAgICAga2l0TW9kZWwgPSBAdmlldy5hcHBNb2RlbC5nZXQgJ2tpdE1vZGVsJ1xuICAgICAgbGVuZ3RoID0ga2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLnRvSlNPTigpLmxlbmd0aFxuXG4gICAgICAkaW5zdHJ1bWVudHMgPSBAdmlldy4kZWwuZmluZCgnLmNvbnRhaW5lci1pbnN0cnVtZW50cycpLmZpbmQoJy5pbnN0cnVtZW50JylcbiAgICAgICRpbnN0cnVtZW50cy5sZW5ndGguc2hvdWxkLmJlLmVxdWFsKGxlbmd0aClcblxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG4gICAgICBraXRNb2RlbCA9IEB2aWV3LmFwcE1vZGVsLmdldCAna2l0TW9kZWwnXG4gICAgICBsZW5ndGggPSBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykudG9KU09OKCkubGVuZ3RoXG5cbiAgICAgICRpbnN0cnVtZW50cyA9IEB2aWV3LiRlbC5maW5kKCcuY29udGFpbmVyLWluc3RydW1lbnRzJykuZmluZCgnLmluc3RydW1lbnQnKVxuICAgICAgJGluc3RydW1lbnRzLmxlbmd0aC5zaG91bGQuYmUuZXF1YWwobGVuZ3RoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIHNlbGVjdGlvbnMgZnJvbSBJbnN0cnVtZW50IGluc3RhbmNlcyBhbmQgdXBkYXRlIHRoZSBtb2RlbCcsID0+XG5cbiAgICAgIEB2aWV3LmtpdE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6Y3VycmVudEluc3RydW1lbnQnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5pbnN0cnVtZW50Vmlld3NbMF0ub25DbGljaygpXG5cbiAgICAgICAgICRzZWxlY3RlZCA9IEB2aWV3LiRlbC5maW5kKCcuY29udGFpbmVyLWluc3RydW1lbnRzJykuZmluZCgnLnNlbGVjdGVkJylcbiAgICAgICAgICRzZWxlY3RlZC5sZW5ndGguc2hvdWxkLmVxdWFsIDFcblxuXG5cbiIsIkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwTW9kZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5QYWRTcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhZFNxdWFyZSA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUuY29mZmVlJ1xuTGl2ZVBhZCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9MaXZlUGFkLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnTGl2ZSBQYWQnLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAdmlldyA9IG5ldyBMaXZlUGFkXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuICAgICAgICAgI3BhZFNxdWFyZUNvbGxlY3Rpb246IG5ldyBQYWRTcXVhcmVDb2xsZWN0aW9uKClcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IHBhZCBzcXVhcmVzJywgPT5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcucGFkLXNxdWFyZScpLmxlbmd0aC5zaG91bGQuZXF1YWwgMTZcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIG91dCB0aGUgZW50aXJlIGtpdCBjb2xsZWN0aW9uJywgPT5cblxuICAgICAgbGVuID0gMFxuXG4gICAgICBAdmlldy5raXRDb2xsZWN0aW9uLmVhY2ggKGtpdCwgaW5kZXgpIC0+XG4gICAgICAgICBpbmRleCA9IGluZGV4ICsgMVxuICAgICAgICAgbGVuID0ga2l0LmdldCgnaW5zdHJ1bWVudHMnKS5sZW5ndGggKiBpbmRleFxuXG4gICAgICBAdmlldy4kZWwuZmluZCgnLmluc3RydW1lbnQnKS5sZW5ndGguc2hvdWxkLmVxdWFsIGxlbiArIDFcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIHRvIGRyb3BzIGZyb20gdGhlIGtpdHMgdG8gdGhlIHBhZHMnLCA9PlxuXG4gICAgICBAdmlldy5wYWRTcXVhcmVDb2xsZWN0aW9uLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6ZHJvcHBlZCcpLndoZW4gPT5cbiAgICAgICAgIGlkID0gQHZpZXcua2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICAgICBAdmlldy5wYWRTcXVhcmVWaWV3c1swXS5vbkRyb3AgaWRcblxuXG5cbiAgIGl0ICdTaG91bGQgdXBkYXRlIHRoZSBQYWRTcXVhcmVDb2xsZWN0aW9uIHdpdGggdGhlIGN1cnJlbnQga2l0IHdoZW4gZHJvcHBlZCcsID0+XG5cbiAgICAgIEB2aWV3LnBhZFNxdWFyZUNvbGxlY3Rpb24uc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpjdXJyZW50SW5zdHJ1bWVudCcpLndoZW4gPT5cbiAgICAgICAgIGlkID0gQHZpZXcua2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICAgICBAdmlldy5wYWRTcXVhcmVWaWV3c1swXS5vbkRyb3AgaWRcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBjaGFuZ2VzIHRvIGluc3RydW1lbnQgZHJvcHBlZCBzdGF0dXMnLCA9PlxuXG4gICAgICBAdmlldy5raXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5zaG91bGQudHJpZ2dlcignY2hhbmdlOmRyb3BwZWQnKS53aGVuID0+XG4gICAgICAgICBpZCA9IEB2aWV3LmtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLmdldCgnaWQnKVxuICAgICAgICAgQHZpZXcucGFkU3F1YXJlVmlld3NbMF0ub25Ecm9wIGlkXG5cblxuXG5cblxuXG5cblxuIiwiQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblBhZFNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvcGFkL1BhZFNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGFkU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvcGFkL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSdcblBhZFNxdWFyZSA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdQYWQgU3F1YXJlJywgLT5cblxuICAgYmVmb3JlID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBQYWRTcXVhcmVcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG4gICAgICAgICBtb2RlbDogbmV3IFBhZFNxdWFyZU1vZGVsKClcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IHRoZSBhcHByb3ByaWF0ZSBrZXktY29kZSB0cmlnZ2VyJywgPT5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcua2V5LWNvZGUnKS5sZW5ndGguc2hvdWxkLmVxdWFsIDFcblxuXG5cbiAgIGl0ICdTaG91bGQgdHJpZ2dlciBhIHBsYXkgYWN0aW9uIG9uIHRhcCcsID0+XG4gICAgICBAdmlldy5tb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOnRyaWdnZXInKS53aGVuID0+XG4gICAgICAgICBAdmlldy5vblByZXNzKClcblxuXG5cbiAgIGl0ICdTaG91bGQgYWNjZXB0IGEgZHJvcHBhYmxlIHZpc3VhbCBlbGVtZW50JywgPT5cbiAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6ZHJvcHBlZCcpLndoZW4gPT5cbiAgICAgICAgIGlkID0gQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLmdldCgnaWQnKVxuXG4gICAgICAgICBAdmlldy5vbkRyb3AgaWRcblxuXG5cbiAgIGl0ICdTaG91bGQgdHJpZ2dlciBpbnN0cnVtZW50IGNoYW5nZSBvbiBkcm9wJywgPT5cbiAgICAgICBAdmlldy5tb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50Jykud2hlbiA9PlxuICAgICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG5cbiAgICAgICAgIEB2aWV3Lm9uRHJvcCBpZFxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IGEgc291bmQgaWNvbiB3aGVuIGRyb3BwZWQnLCA9PlxuICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICBAdmlldy5vbkRyb3AgaWRcblxuICAgICAgaWNvbiA9IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2ljb24nKVxuXG4gICAgICBAdmlldy4kZWwuZmluZCgnLicgKyBpY29uKS5sZW5ndGguc2hvdWxkLmVxdWFsIDFcblxuXG5cblxuICAgaXQgJ1Nob3VsZCBzZXQgdGhlIHNvdW5kIGJhc2VkIHVwb24gdGhlIGRyb3BwZWQgdmlzdWFsIGVsZW1lbnQnLCA9PlxuICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICBAdmlldy5vbkRyb3AgaWRcblxuICAgICAgZXhwZWN0KEB2aWV3LmF1ZGlvUGxheWJhY2spLnRvLm5vdC5lcXVhbCB1bmRlZmluZWRcblxuXG4gICBpdCAnU2hvdWxkIGNsZWFyIHRoZSBzb3VuZCB3aGVuIHRoZSBkcm9wcGFibGUgZWxlbWVudCBpcyBkaXNwb3NlZCBvZicsIChkb25lKSA9PlxuICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICBAdmlldy5vbkRyb3AgaWRcblxuICAgICAgQHZpZXcubW9kZWwub25jZSAnY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50JywgPT5cbiAgICAgICAgIGRvbmUoKVxuXG4gICAgICBAdmlldy5yZW1vdmVTb3VuZEFuZENsZWFyUGFkKClcblxuXG4gICBpdCAnU2hvdWxkIGNsZWFyIHRoZSBpY29uIHdoZW4gdGhlIGRyb3BwYWJsZSBlbGVtZW50IGlzIGRpc3Bvc2VkIG9mJywgPT5cbiAgICAgIGlkID0gQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLmdldCgnaWQnKVxuICAgICAgQHZpZXcub25Ecm9wIGlkXG5cbiAgICAgIGljb24gPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpY29uJylcbiAgICAgIEB2aWV3LiRlbC5maW5kKCcuJyArIGljb24pLmxlbmd0aC5zaG91bGQuZXF1YWwgMVxuXG4gICAgICBAdmlldy5yZW1vdmVTb3VuZEFuZENsZWFyUGFkKClcblxuICAgICAgQHZpZXcuJGVsLmZpbmQoJy4nICsgaWNvbikubGVuZ3RoLnNob3VsZC5lcXVhbCAwXG5cblxuXG5cblxuXG5cblxuIiwiQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnUGF0dGVybiBTcXVhcmUnLCAtPlxuXG4gICBiZWZvcmUgPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cblxuICAgICAgbW9kZWwgPSBuZXcgUGF0dGVyblNxdWFyZU1vZGVsXG4gICAgICAgICAnaW5zdHJ1bWVudCc6IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKVxuXG4gICAgICBAdmlldyA9IG5ldyBQYXR0ZXJuU3F1YXJlXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG1vZGVsXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCBjeWNsZSB0aHJvdWdoIHZlbG9jaXR5IHZvbHVtZXMnLCA9PlxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ3ZlbG9jaXR5Jykuc2hvdWxkLmVxdWFsIDFcbiAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygndmVsb2NpdHktbG93Jykuc2hvdWxkLmJlLnRydWVcblxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAyXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ3ZlbG9jaXR5LW1lZGl1bScpLnNob3VsZC5iZS50cnVlXG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgM1xuICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKCd2ZWxvY2l0eS1oaWdoJykuc2hvdWxkLmJlLnRydWVcblxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAwXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ3ZlbG9jaXR5LWhpZ2gnKS5zaG91bGQuYmUuZmFsc2VcblxuXG5cbiAgIGl0ICdTaG91bGQgdG9nZ2xlIG9mZicsID0+XG5cbiAgICAgIEB2aWV3LmRpc2FibGUoKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgMFxuXG5cblxuICAgaXQgJ1Nob3VsZCB0b2dnbGUgb24nLCA9PlxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcub25DbGljaygpXG5cblxuICAgICAgQHZpZXcuZGlzYWJsZSgpXG4gICAgICBAdmlldy5lbmFibGUoKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgMVxuIiwiXG5BcHBDb25maWcgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5UcmFjayA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLmNvZmZlZSdcbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5cbmRlc2NyaWJlICdQYXR0ZXJuIFRyYWNrJywgLT5cblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQHZpZXcgPSBuZXcgUGF0dGVyblRyYWNrXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBtb2RlbDogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIEB2aWV3LiRlbC5zaG91bGQuZXhpc3RcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciBvdXQgY2hpbGQgc3F1YXJlcycsID0+XG4gICAgICBAdmlldy4kZWwuZmluZCgnLnBhdHRlcm4tc3F1YXJlJykubGVuZ3RoLnNob3VsZC5lcXVhbCA4XG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIHBhdHRlcm4gc3F1YXJlcycsID0+XG4gICAgICBAdmlldy5jb2xsZWN0aW9uLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6dmVsb2NpdHknKS53aGVuID0+XG4gICAgICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlVmlld3NbMF0ub25DbGljaygpXG5cblxuICAgaXQgJ1Nob3VsZCBiZSBtdXRhYmxlJywgPT5cbiAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6bXV0ZScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm11dGUoKVxuXG4gICAgICBAdmlldy5tb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOm11dGUnKS53aGVuID0+XG4gICAgICAgICBAdmlldy51bm11dGUoKVxuXG5cbiAgIGl0ICdTaG91bGQgYWRkIHZpc3VhbCBub3RpZmljYXRpb24gdGhhdCB0cmFjayBpcyBtdXRlZCcsIChkb25lKSA9PlxuICAgICAgQHZpZXcubW9kZWwub25jZSAnY2hhbmdlOm11dGUnLCAobW9kZWwpID0+XG4gICAgICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ211dGUnKS5zaG91bGQuYmUudHJ1ZVxuXG4gICAgICBAdmlldy5tdXRlKClcblxuICAgICAgQHZpZXcubW9kZWwub25jZSAnY2hhbmdlOm11dGUnLCA9PlxuICAgICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKCdtdXRlJykuc2hvdWxkLmJlLmZhbHNlXG4gICAgICAgICBkb25lKClcblxuICAgICAgQHZpZXcudW5tdXRlKClcblxuXG4gICBpdCAnU2hvdWxkIGJlIGFibGUgdG8gZm9jdXMgYW5kIHVuZm9jdXMnLCA9PlxuICAgICAgQHZpZXcubW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpmb2N1cycpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm9uTGFiZWxDbGljaygpXG5cblxuXG5cbiAgIGl0ICdTaG91bGQgdXBkYXRlIGVhY2ggUGF0dGVyblNxdWFyZSBtb2RlbCB3aGVuIHRoZSBraXQgY2hhbmdlcycsID0+IiwiQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5TZXF1ZW5jZXIgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcbkluc3RydW1lbnRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuaGVscGVycyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2hlbHBlcnMvaGFuZGxlYmFycy1oZWxwZXJzJ1xuXG5cbmRlc2NyaWJlICdTZXF1ZW5jZXInLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAdmlldyA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucGF1c2UoKVxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIEB2aWV3LiRlbC5zaG91bGQuZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIG91dCBlYWNoIHBhdHRlcm4gdHJhY2snLCA9PlxuICAgICAgQHZpZXcuJGVsLmZpbmQoJy5wYXR0ZXJuLXRyYWNrJykubGVuZ3RoLnNob3VsZC5lcXVhbCBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykubGVuZ3RoXG5cblxuXG4gICBpdCAnU2hvdWxkIGNyZWF0ZSBhIGJwbSBpbnRlcnZhbCcsID0+XG4gICAgICBleHBlY3QoQHZpZXcuYnBtSW50ZXJ2YWwpLnRvLm5vdC5iZSBudWxsXG5cblxuXG4gICBpdCAnU2hvdWxkIGxpc3RlbiBmb3IgcGxheSAvIHBhdXNlIGNoYW5nZXMgb24gdGhlIEFwcE1vZGVsJywgPT5cbiAgICAgIEB2aWV3LmFwcE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6cGxheWluZycpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnBhdXNlKClcblxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpwbGF5aW5nJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcucGxheSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIGxpc3RlbiBmb3IgYnBtIGNoYW5nZXMnLCA9PlxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2V0KCdicG0nLCAyMDApXG4gICAgICBleHBlY3QoQHZpZXcudXBkYXRlSW50ZXJ2YWxUaW1lKS50by5lcXVhbCAyMDBcblxuXG5cbiAgIGl0ICdTaG91bGQgYmUgbXV0YWJsZScsID0+XG4gICAgICBAdmlldy5hcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOm11dGUnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5tdXRlKClcblxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTptdXRlJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcudW5tdXRlKClcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBJbnN0cnVtZW50VHJhY2tNb2RlbCBmb2N1cyBldmVudHMnLCA9PlxuICAgICAgQHZpZXcuY29sbGVjdGlvbi5zaG91bGQudHJpZ2dlcignY2hhbmdlOmZvY3VzJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcucGF0dGVyblRyYWNrVmlld3NbMF0ub25MYWJlbENsaWNrKClcblxuXG5cblxuICAgaXQgJ1Nob3VsZCB1cGRhdGUgZWFjaCBwYXR0ZXJuIHRyYWNrIHdoZW4gdGhlIGtpdCBjaGFuZ2VzJywgPT4iLCJBcHBDb25maWcgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuQXBwQ29udHJvbGxlciA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSdcbkxhbmRpbmdWaWV3ICAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUnXG5cbmRlc2NyaWJlICdMYW5kaW5nIFZpZXcnLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAdmlldyA9IG5ldyBMYW5kaW5nVmlld1xuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cbiAgICAgIGlmIEBhcHBDb250cm9sbGVyIHRoZW4gQGFwcENvbnRyb2xsZXIucmVtb3ZlKClcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5lbCkudG8uZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVkaXJlY3QgdG8gY3JlYXRlIHBhZ2Ugb24gY2xpY2snLCAoZG9uZSkgPT5cblxuICAgICAgQGFwcENvbnRyb2xsZXIgPSBuZXcgQXBwQ29udHJvbGxlclxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgcm91dGVyID0gQGFwcENvbnRyb2xsZXIuYXBwUm91dGVyXG4gICAgICAkc3RhcnRCdG4gPSBAdmlldy4kZWwuZmluZCAnLnN0YXJ0LWJ0bidcblxuICAgICAgJHN0YXJ0QnRuLm9uICdjbGljaycsIChldmVudCkgPT5cbiAgICAgICAgICdjcmVhdGUnLnNob3VsZC5yb3V0ZS50byByb3V0ZXIsICdjcmVhdGVSb3V0ZSdcbiAgICAgICAgIGRvbmUoKVxuXG4gICAgICAkc3RhcnRCdG4uY2xpY2soKVxuXG5cblxuXG5cblxuXG5cbiIsIlNoYXJlVmlldyA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9zaGFyZS9TaGFyZVZpZXcuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdTaGFyZSBWaWV3JywgLT5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQHZpZXcgPSBuZXcgU2hhcmVWaWV3XG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBleHBlY3QoQHZpZXcuZWwpLnRvLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCBhY2NlcHQgYSBTb3VuZFNoYXJlIG9iamVjdCcsID0+XG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgdGhlIHZpc3VhbGl6YXRpb24gbGF5ZXInLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgcGF1c2UgcGxheWJhY2sgb2YgdGhlIGF1ZGlvIHRyYWNrIG9uIGluaXQnLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgdG9nZ2xlIHRoZSBwbGF5IC8gcGF1c2UgYnV0dG9uJywgPT5cblxuXG4gICBpdCAnU2hvdWxkIGRpc3BsYXkgdGhlIHVzZXJzIHNvbmcgdGl0bGUgYW5kIHVzZXJuYW1lJywgPT5cbiJdfQ==

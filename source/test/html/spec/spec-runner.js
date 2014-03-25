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


},{"./models/AppModel.coffee":11,"./routers/AppRouter.coffee":21,"./supers/View.coffee":22,"./views/create/CreateView.coffee":24,"./views/landing/LandingView.coffee":44,"./views/share/ShareView.coffee":46}],7:[function(require,module,exports){

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


},{"../config/AppConfig.coffee":7,"../events/PubEvent.coffee":9,"../models/kits/KitCollection.coffee":12,"../models/kits/KitModel.coffee":13,"../models/pad/LivePadModel.coffee":14,"../models/pad/PadSquareCollection.coffee":15,"../models/pad/PadSquareModel.coffee":16,"../models/sequencer/PatternSquareCollection.coffee":19,"../models/sequencer/PatternSquareModel.coffee":20,"../supers/View.coffee":22,"../utils/PubSub":23,"../views/create/components/BPMIndicator.coffee":25,"../views/create/components/KitSelector.coffee":26,"../views/create/components/instruments/InstrumentSelectorPanel.coffee":28,"../views/create/components/pad/LivePad.coffee":31,"../views/create/components/pad/PadSquare.coffee":32,"../views/create/components/sequencer/PatternSquare.coffee":35,"../views/create/components/sequencer/PatternTrack.coffee":36,"../views/create/components/sequencer/Sequencer.coffee":37,"../views/tests/TestsView.coffee":48}],22:[function(require,module,exports){

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


},{"../../supers/View.coffee":22,"../../views/create/components/BPMIndicator.coffee":25,"../../views/create/components/KitSelector.coffee":26,"../../views/create/components/instruments/InstrumentSelectorPanel.coffee":28,"../../views/create/components/sequencer/Sequencer.coffee":37,"./templates/create-template.hbs":43}],25:[function(require,module,exports){

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


},{"../../../config/AppConfig.coffee":7,"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":22,"./templates/bpm-template.hbs":41}],26:[function(require,module,exports){

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


},{"../../../events/AppEvent.coffee":8,"../../../supers/View.coffee":22,"./templates/kit-selection-template.hbs":42}],27:[function(require,module,exports){

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
var LivePad, PadSquare, PadSquareCollection, PadSquareModel, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PadSquareCollection = require('../../../../models/pad/PadSquareCollection.coffee');

PadSquareModel = require('../../../../models/pad/PadSquareModel.coffee');

View = require('../../../../supers/View.coffee');

PadSquare = require('./PadSquare.coffee');

template = require('./templates/live-pad-template.hbs');

LivePad = (function(_super) {
  __extends(LivePad, _super);

  function LivePad() {
    return LivePad.__super__.constructor.apply(this, arguments);
  }

  LivePad.prototype.className = 'container-live-pad';

  LivePad.prototype.template = template;

  LivePad.prototype.kitCollection = null;

  LivePad.prototype.appModel = null;

  LivePad.prototype.collection = null;

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
    return this;
  };

  LivePad.prototype.returnPadTableData = function() {
    var iterator, padTable, rows;
    this.collection = new PadSquareCollection();
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
        var instruments;
        instruments = kit.get('instruments').map(function(instrument) {
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

  LivePad.prototype.addEventListeners = function() {};

  return LivePad;

})(View);

module.exports = LivePad;


},{"../../../../models/pad/PadSquareCollection.coffee":15,"../../../../models/pad/PadSquareModel.coffee":16,"../../../../supers/View.coffee":22,"./PadSquare.coffee":32,"./templates/live-pad-template.hbs":33}],32:[function(require,module,exports){

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

  PadSquare.prototype.tagName = 'td';

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

  PadSquare.prototype.renderIcon = function() {
    var instrument;
    if (this.$icon.hasClass(this.currentIcon)) {
      this.$icon.removeClass(this.currentIcon);
    }
    instrument = this.model.get('currentInstrument');
    if (instrument !== null) {
      this.currentIcon = instrument.get('icon');
      return this.$icon.addClass(this.currentIcon);
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
    var _ref;
    if ((_ref = this.audioPlayback) != null) {
      _ref.unload();
    }
    return this.model.set('currentInstrument', null);
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
    instrumentModel = this.findInstrumentModel(id);
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
    this.renderIcon();
    return this.setSound();
  };

  PadSquare.prototype.onSoundEnd = function() {
    return this.model.set('trigger', false);
  };

  PadSquare.prototype.findInstrumentModel = function(id) {
    var instrumentModel;
    instrumentModel = null;
    this.collection.each((function(_this) {
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

  return PadSquare;

})(View);

module.exports = PadSquare;


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":22,"./templates/pad-square-template.hbs":34}],33:[function(require,module,exports){
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
  buffer += "\n				<td id=\"";
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
  buffer += "\n				<div class='instrument'>\n					";
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
},{"handleify":5}],34:[function(require,module,exports){
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
},{"handleify":5}],35:[function(require,module,exports){

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


},{"../../../../config/AppConfig.coffee":7,"../../../../events/AppEvent.coffee":8,"../../../../supers/View.coffee":22,"./templates/pattern-square-template.hbs":38}],36:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../models/sequencer/PatternSquareCollection.coffee":19,"../../../../models/sequencer/PatternSquareModel.coffee":20,"../../../../supers/View.coffee":22,"./PatternSquare.coffee":35,"./templates/pattern-track-template.hbs":39}],37:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":8,"../../../../helpers/handlebars-helpers":10,"../../../../supers/View.coffee":22,"./PatternTrack.coffee":36,"./templates/sequencer-template.hbs":40}],38:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })
},{"handleify":5}],39:[function(require,module,exports){
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
},{"handleify":5}],40:[function(require,module,exports){
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
},{"handleify":5}],41:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-decrease'>DECREASE</button>\n<span class='label-bpm'>0</span>\n<button class='btn-increase'>INCREASE</button>";
  })
},{"handleify":5}],42:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class='btn-left'>LEFT</button>\n<span class='label-kit'>DRUM KIT</span>\n<button class='btn-right'>RIGHT</button>";
  })
},{"handleify":5}],43:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='container-kit-selector'>\n	<div class='kit-selector'></div>\n</div>\n<div class='container-visualization'>Visualization</div>\n\n<div class='container-sequencer'>\n\n	<div class='instrument-selector'>Instrument Selector</div>\n	<div class='sequencer'>Sequencer</div>\n	<div class='bpm'>BPM</div>\n	<div class='btn-share'>SHARE</div>\n\n</div>";
  })
},{"handleify":5}],44:[function(require,module,exports){

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


},{"../../events/PubEvent.coffee":9,"../../supers/View.coffee":22,"../../utils/PubSub":23,"./templates/landing-template.hbs":45}],45:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<span class='start-btn'>CREATE</span>";
  })
},{"handleify":5}],46:[function(require,module,exports){

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


},{"../../supers/View.coffee":22,"./templates/share-template.hbs":47}],47:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<a href='/#'>NEW</a>";
  })
},{"handleify":5}],48:[function(require,module,exports){

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


},{"../../supers/View.coffee":22,"./tests-template.hbs":49}],49:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h1>Component Viewer</h1>\n\n<br />\n<p>\n	Make sure that <b>httpster</b> is running in the <b>source</b> route (npm install -g httpster) <br/>\n	<a href=\"http://localhost:3333/test/html/\">Mocha Test Runner</a>\n</p>\n\n<br />\n<ul>\n	<li><a href='#kit-selection'>Kit Selection</a></li>\n	<li><a href=\"#bpm-indicator\">BPM Indicator</a></li>\n	<li><a href=\"#instrument-selector\">Instrument Selector</a></li>\n	<li><a href=\"#pattern-square\">Pattern Square</a></li>\n	<li><a href=\"#pattern-track\">Pattern Track</a></li>\n	<li><a href=\"#sequencer\">Sequencer</a></li>\n	<li><a href=\"#full-sequencer\">Full Sequencer</a></li>\n	<li><a href=\"#pad-square\">Pad Square</a></li>\n	<li><a href=\"#live-pad\">LivePad</a></li>\n</ul>";
  })
},{"handleify":5}],50:[function(require,module,exports){
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


},{"./spec/AppController-spec.coffee":51,"./spec/models/KitCollection-spec.coffee":52,"./spec/models/KitModel-spec.coffee":53,"./spec/models/SoundCollection-spec.coffee":54,"./spec/models/SoundModel-spec.coffee":55,"./spec/views/create/CreateView-spec.coffee":56,"./spec/views/create/components/BPMIndicator-spec.coffee":57,"./spec/views/create/components/KitSelector-spec.coffee":58,"./spec/views/create/components/instruments/Instrument-spec.coffee":59,"./spec/views/create/components/instruments/InstrumentSelectorPanel-spec.coffee":60,"./spec/views/create/components/pad/LivePad-spec.coffee":61,"./spec/views/create/components/pad/PadSquare-spec.coffee":62,"./spec/views/create/components/sequencer/PatternSquare-spec.coffee":63,"./spec/views/create/components/sequencer/PatternTrack-spec.coffee":64,"./spec/views/create/components/sequencer/Sequencer-spec.coffee":65,"./spec/views/landing/LandingView-spec.coffee":66,"./spec/views/share/ShareView-spec.coffee":67}],51:[function(require,module,exports){
var AppController;

AppController = require('../../src/scripts/AppController.coffee');

describe('App Controller', function() {
  return it('Should initialize', (function(_this) {
    return function() {};
  })(this));
});


},{"../../src/scripts/AppController.coffee":6}],52:[function(require,module,exports){
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


},{"../../../src/scripts/config/AppConfig.coffee":7,"../../../src/scripts/models/kits/KitCollection.coffee":12}],53:[function(require,module,exports){
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


},{"../../../src/scripts/config/AppConfig.coffee":7,"../../../src/scripts/models/kits/KitModel.coffee":13,"../../../src/scripts/models/sequencer/InstrumentCollection.coffee":17}],54:[function(require,module,exports){
describe('Sound Collection', function() {
  return it('Should initialize with a sound set', (function(_this) {
    return function() {};
  })(this));
});


},{}],55:[function(require,module,exports){
describe('Sound Model', function() {
  return it('Should initialize with default config properties', (function(_this) {
    return function() {};
  })(this));
});


},{}],56:[function(require,module,exports){
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


},{"../../../../src/scripts/config/AppConfig.coffee":7,"../../../../src/scripts/models/AppModel.coffee":11,"../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../src/scripts/views/create/CreateView.coffee":24}],57:[function(require,module,exports){
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


},{"../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../src/scripts/events/AppEvent.coffee":8,"../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../src/scripts/views/create/components/BPMIndicator.coffee":25}],58:[function(require,module,exports){
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


},{"../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../src/scripts/models/kits/KitModel.coffee":13,"../../../../../src/scripts/views/create/components/KitSelector.coffee":26}],59:[function(require,module,exports){
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


},{"../../../../../../src/scripts/models/kits/KitModel.coffee":13,"../../../../../../src/scripts/views/create/components/instruments/Instrument.coffee":27}],60:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/views/create/components/instruments/InstrumentSelectorPanel.coffee":28}],61:[function(require,module,exports){
var AppConfig, AppModel, InstrumentModel, KitCollection, LivePad, PadSquare, PadSquareCollection;

AppConfig = require('../../../../../../src/scripts/config/AppConfig.coffee');

AppModel = require('../../../../../../src/scripts/models/AppModel.coffee');

KitCollection = require('../../../../../../src/scripts/models/kits/KitCollection.coffee');

InstrumentModel = require('../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee');

PadSquareCollection = require('../../../../../../src/scripts/models/pad/PadSquareCollection.coffee');

PadSquare = require('../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee');

LivePad = require('../../../../../../src/scripts/views/create/components/pad/LivePad.coffee');

describe('Live Pad', function() {
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
      _this.view = new LivePad({
        kitCollection: _this.kitCollection,
        collection: new PadSquareCollection(),
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
      return _this.view.collection.should.trigger('change:dropped').when(function() {
        return _this.view.padSquareViews[0].onDrop();
      });
    };
  })(this));
  return it('Should update the PadSquareCollection with the current kit when dropped', (function(_this) {
    return function() {
      return _this.view.collection.should.trigger('change:instrument').when(function() {
        return _this.view.padSquareViews[0].setSound();
      });
    };
  })(this));
});


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/pad/PadSquareCollection.coffee":15,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":18,"../../../../../../src/scripts/views/create/components/pad/LivePad.coffee":31,"../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee":32}],62:[function(require,module,exports){
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
    return function() {
      var id;
      id = _this.kitCollection.at(0).get('instruments').at(0).get('id');
      _this.view.onDrop(id);
      return _this.view.model.should.trigger('change:currentInstrument').when(function() {
        return _this.view.removeSound();
      });
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/pad/PadSquareCollection.coffee":15,"../../../../../../src/scripts/models/pad/PadSquareModel.coffee":16,"../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee":32}],63:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":20,"../../../../../../src/scripts/views/create/components/sequencer/PatternSquare.coffee":35}],64:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":18,"../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee":19,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":20,"../../../../../../src/scripts/views/create/components/sequencer/PatternTrack.coffee":36}],65:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":7,"../../../../../../src/scripts/helpers/handlebars-helpers":10,"../../../../../../src/scripts/models/AppModel.coffee":11,"../../../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../../../src/scripts/models/sequencer/InstrumentCollection.coffee":17,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":18,"../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee":19,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":20,"../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee":37}],66:[function(require,module,exports){
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


},{"../../../../src/scripts/AppController.coffee":6,"../../../../src/scripts/config/AppConfig.coffee":7,"../../../../src/scripts/models/kits/KitCollection.coffee":12,"../../../../src/scripts/views/landing/LandingView.coffee":44}],67:[function(require,module,exports){
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


},{"../../../../src/scripts/views/share/ShareView.coffee":46}]},{},[50])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2RpZ2l0cy9pbmRleC5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L3J1bnRpbWUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvTGl2ZVBhZE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvcGFkL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy91dGlscy9QdWJTdWIuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3IuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy90ZW1wbGF0ZXMvaW5zdHJ1bWVudC1wYW5lbC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy90ZW1wbGF0ZXMvaW5zdHJ1bWVudC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvTGl2ZVBhZC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvUGFkU3F1YXJlLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC90ZW1wbGF0ZXMvbGl2ZS1wYWQtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL3RlbXBsYXRlcy9wYWQtc3F1YXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2suY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3BhdHRlcm4tc3F1YXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci90ZW1wbGF0ZXMvcGF0dGVybi10cmFjay10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3NlcXVlbmNlci10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy90ZW1wbGF0ZXMvYnBtLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3RlbXBsYXRlcy9raXQtc2VsZWN0aW9uLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS90ZW1wbGF0ZXMvY3JlYXRlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy90ZW1wbGF0ZXMvbGFuZGluZy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9zaGFyZS9TaGFyZVZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvdGVtcGxhdGVzL3NoYXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3Rlc3RzL1Rlc3RzVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy90ZXN0cy90ZXN0cy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMtcnVubmVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9BcHBDb250cm9sbGVyLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9LaXRDb2xsZWN0aW9uLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9LaXRNb2RlbC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9tb2RlbHMvU291bmRDb2xsZWN0aW9uLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9Tb3VuZE1vZGVsLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50LXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9MaXZlUGFkLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QWdCLENBQUMsRUFBRSxDQUFDLE1BREg7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQVRBLENBQUE7QUFBQSxFQWFBLEVBQUEsQ0FBRyxtQ0FBSCxFQUF3QyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhDLENBYkEsQ0FBQTtBQUFBLEVBZ0JBLEVBQUEsQ0FBRyx1Q0FBSCxFQUE0QyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVDLENBaEJBLENBQUE7QUFBQSxFQW1CQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2RCxDQW5CQSxDQUFBO0FBQUEsRUFzQkEsRUFBQSxDQUFHLHVDQUFILEVBQTRDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUMsQ0F0QkEsQ0FBQTtTQXlCQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2RCxFQTNCb0I7QUFBQSxDQUF2QixDQUhBLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogZGlnaXRzXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMgSm9uIFNjaGxpbmtlcnRcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQYWQgbnVtYmVycyB3aXRoIHplcm9zLlxuICogQXV0b21hdGljYWxseSBwYWQgdGhlIG51bWJlciBvZiBkaWdpdHMgYmFzZWQgb24gdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXksXG4gKiBvciBleHBsaWNpdGx5IHBhc3MgaW4gdGhlIG51bWJlciBvZiBkaWdpdHMgdG8gdXNlLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gbnVtICBUaGUgbnVtYmVyIHRvIHBhZC5cbiAqIEBwYXJhbSAge09iamVjdH0gb3B0cyBPcHRpb25zIG9iamVjdCB3aXRoIGBkaWdpdHNgIGFuZCBgYXV0b2AgcHJvcGVydGllcy5cbiAqICAgIHtcbiAqICAgICAgYXV0bzogYXJyYXkubGVuZ3RoIC8vIHBhc3MgaW4gdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXlcbiAqICAgICAgZGlnaXRzOiA0ICAgICAgICAgIC8vIG9yIHBhc3MgaW4gdGhlIG51bWJlciBvZiBkaWdpdHMgdG8gdXNlXG4gKiAgICB9XG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgVGhlIHBhZGRlZCBudW1iZXIgd2l0aCB6ZXJvcyBwcmVwZW5kZWRcbiAqXG4gKiBAZXhhbXBsZXM6XG4gKiAgMSAgICAgID0+IDAwMDAwMVxuICogIDEwICAgICA9PiAwMDAwMTBcbiAqICAxMDAgICAgPT4gMDAwMTAwXG4gKiAgMTAwMCAgID0+IDAwMTAwMFxuICogIDEwMDAwICA9PiAwMTAwMDBcbiAqICAxMDAwMDAgPT4gMTAwMDAwXG4gKi9cblxuZXhwb3J0cy5wYWQgPSBmdW5jdGlvbiAobnVtLCBvcHRzKSB7XG4gIHZhciBkaWdpdHMgPSBvcHRzLmRpZ2l0cyB8fCAzO1xuICBpZihvcHRzLmF1dG8gJiYgdHlwZW9mIG9wdHMuYXV0byA9PT0gJ251bWJlcicpIHtcbiAgICBkaWdpdHMgPSBTdHJpbmcob3B0cy5hdXRvKS5sZW5ndGg7XG4gIH1cbiAgdmFyIGxlbkRpZmYgPSBkaWdpdHMgLSBTdHJpbmcobnVtKS5sZW5ndGg7XG4gIHZhciBwYWRkaW5nID0gJyc7XG4gIGlmIChsZW5EaWZmID4gMCkge1xuICAgIHdoaWxlIChsZW5EaWZmLS0pIHtcbiAgICAgIHBhZGRpbmcgKz0gJzAnO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFkZGluZyArIG51bTtcbn07XG5cbi8qKlxuICogU3RyaXAgbGVhZGluZyBkaWdpdHMgZnJvbSBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyBmcm9tIHdoaWNoIHRvIHN0cmlwIGRpZ2l0c1xuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICovXG5cbmV4cG9ydHMuc3RyaXBsZWZ0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxcZCtcXC0/L2csICcnKTtcbn07XG5cbi8qKlxuICogU3RyaXAgdHJhaWxpbmcgZGlnaXRzIGZyb20gYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgZnJvbSB3aGljaCB0byBzdHJpcCBkaWdpdHNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqL1xuXG5leHBvcnRzLnN0cmlwcmlnaHQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXC0/XFxkKyQvZywgJycpO1xufTtcblxuLyoqXG4gKiBDb3VudCBkaWdpdHMgb24gdGhlIGxlZnQgc2lkZSBvZiBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB3aXRoIGRpZ2l0cyB0byBjb3VudFxuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICogQGV4YW1wbGVcbiAqICBcIjAwMS1mb28ubWRcIiA9PiAzXG4gKi9cblxuZXhwb3J0cy5jb3VudGxlZnQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIFN0cmluZyhzdHIubWF0Y2goL15cXGQrL2cpKS5sZW5ndGg7XG59O1xuXG4vKipcbiAqIENvdW50IGRpZ2l0cyBvbiB0aGUgcmlnaHQgc2lkZSBvZiBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB3aXRoIGRpZ2l0cyB0byBjb3VudFxuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICogQGV4YW1wbGVcbiAqICBcIjAwMS1mb28ubWRcIiA9PiAzXG4gKi9cblxuZXhwb3J0cy5jb3VudHJpZ2h0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyLm1hdGNoKC9cXGQrJC9nKSkubGVuZ3RoO1xufTsiLCIvKmpzaGludCBlcW51bGw6IHRydWUgKi9cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG5cbnZhciBIYW5kbGViYXJzID0ge307XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbkhhbmRsZWJhcnMuVkVSU0lPTiA9IFwiMS4wLjBcIjtcbkhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT04gPSA0O1xuXG5IYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPj0gMS4wLjAnXG59O1xuXG5IYW5kbGViYXJzLmhlbHBlcnMgID0ge307XG5IYW5kbGViYXJzLnBhcnRpYWxzID0ge307XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgZnVuY3Rpb25UeXBlID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgPSBmdW5jdGlvbihuYW1lLCBmbiwgaW52ZXJzZSkge1xuICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgIGlmIChpbnZlcnNlIHx8IGZuKSB7IHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbnZlcnNlKSB7IGZuLm5vdCA9IGludmVyc2U7IH1cbiAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgPSBmdW5jdGlvbihuYW1lLCBzdHIpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLnBhcnRpYWxzLCAgbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHN0cjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGFyZykge1xuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGhlbHBlcjogJ1wiICsgYXJnICsgXCInXCIpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYmxvY2tIZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSB8fCBmdW5jdGlvbigpIHt9LCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuXG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbih0aGlzKTtcbiAgfSBlbHNlIGlmKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgaWYoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZm4oY29udGV4dCk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLksgPSBmdW5jdGlvbigpIHt9O1xuXG5IYW5kbGViYXJzLmNyZWF0ZUZyYW1lID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbihvYmplY3QpIHtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG9iamVjdDtcbiAgdmFyIG9iaiA9IG5ldyBIYW5kbGViYXJzLksoKTtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG51bGw7XG4gIHJldHVybiBvYmo7XG59O1xuXG5IYW5kbGViYXJzLmxvZ2dlciA9IHtcbiAgREVCVUc6IDAsIElORk86IDEsIFdBUk46IDIsIEVSUk9SOiAzLCBsZXZlbDogMyxcblxuICBtZXRob2RNYXA6IHswOiAnZGVidWcnLCAxOiAnaW5mbycsIDI6ICd3YXJuJywgMzogJ2Vycm9yJ30sXG5cbiAgLy8gY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgb2JqKSB7XG4gICAgaWYgKEhhbmRsZWJhcnMubG9nZ2VyLmxldmVsIDw9IGxldmVsKSB7XG4gICAgICB2YXIgbWV0aG9kID0gSGFuZGxlYmFycy5sb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5IYW5kbGViYXJzLmxvZyA9IGZ1bmN0aW9uKGxldmVsLCBvYmopIHsgSGFuZGxlYmFycy5sb2dnZXIubG9nKGxldmVsLCBvYmopOyB9O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdlYWNoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgZm4gPSBvcHRpb25zLmZuLCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlO1xuICB2YXIgaSA9IDAsIHJldCA9IFwiXCIsIGRhdGE7XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICBkYXRhID0gSGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICB9XG5cbiAgaWYoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICBpZihjb250ZXh0IGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgZm9yKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGk8ajsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhKSB7IGRhdGEuaW5kZXggPSBpOyB9XG4gICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbaV0sIHsgZGF0YTogZGF0YSB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICBpZihjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBpZihkYXRhKSB7IGRhdGEua2V5ID0ga2V5OyB9XG4gICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtrZXldLCB7ZGF0YTogZGF0YX0pO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmKGkgPT09IDApe1xuICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbmRpdGlvbmFsKTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKCFjb25kaXRpb25hbCB8fCBIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29uZGl0aW9uYWwpKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHJldHVybiBIYW5kbGViYXJzLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm59KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYgKCFIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICBIYW5kbGViYXJzLmxvZyhsZXZlbCwgY29udGV4dCk7XG59KTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZNID0ge1xuICB0ZW1wbGF0ZTogZnVuY3Rpb24odGVtcGxhdGVTcGVjKSB7XG4gICAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgICB2YXIgY29udGFpbmVyID0ge1xuICAgICAgZXNjYXBlRXhwcmVzc2lvbjogSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgICAgaW52b2tlUGFydGlhbDogSGFuZGxlYmFycy5WTS5pbnZva2VQYXJ0aWFsLFxuICAgICAgcHJvZ3JhbXM6IFtdLFxuICAgICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXTtcbiAgICAgICAgaWYoZGF0YSkge1xuICAgICAgICAgIHByb2dyYW1XcmFwcGVyID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuLCBkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSBIYW5kbGViYXJzLlZNLnByb2dyYW0oaSwgZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICAgIH0sXG4gICAgICBtZXJnZTogZnVuY3Rpb24ocGFyYW0sIGNvbW1vbikge1xuICAgICAgICB2YXIgcmV0ID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICAgIGlmIChwYXJhbSAmJiBjb21tb24pIHtcbiAgICAgICAgICByZXQgPSB7fTtcbiAgICAgICAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZChyZXQsIGNvbW1vbik7XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBwYXJhbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0sXG4gICAgICBwcm9ncmFtV2l0aERlcHRoOiBIYW5kbGViYXJzLlZNLnByb2dyYW1XaXRoRGVwdGgsXG4gICAgICBub29wOiBIYW5kbGViYXJzLlZNLm5vb3AsXG4gICAgICBjb21waWxlckluZm86IG51bGxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlU3BlYy5jYWxsKGNvbnRhaW5lciwgSGFuZGxlYmFycywgY29udGV4dCwgb3B0aW9ucy5oZWxwZXJzLCBvcHRpb25zLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEpO1xuXG4gICAgICB2YXIgY29tcGlsZXJJbmZvID0gY29udGFpbmVyLmNvbXBpbGVySW5mbyB8fCBbXSxcbiAgICAgICAgICBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICAgICAgY3VycmVudFJldmlzaW9uID0gSGFuZGxlYmFycy5DT01QSUxFUl9SRVZJU0lPTjtcblxuICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IEhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrcnVudGltZVZlcnNpb25zK1wiKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKFwiK2NvbXBpbGVyVmVyc2lvbnMrXCIpLlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgICAgIHRocm93IFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJJbmZvWzFdK1wiKS5cIjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH0sXG5cbiAgcHJvZ3JhbVdpdGhEZXB0aDogZnVuY3Rpb24oaSwgZm4sIGRhdGEgLyosICRkZXB0aCAqLykge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcblxuICAgIHZhciBwcm9ncmFtID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBbY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGFdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgICBwcm9ncmFtLnByb2dyYW0gPSBpO1xuICAgIHByb2dyYW0uZGVwdGggPSBhcmdzLmxlbmd0aDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGEpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gMDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgbm9vcDogZnVuY3Rpb24oKSB7IHJldHVybiBcIlwiOyB9LFxuICBpbnZva2VQYXJ0aWFsOiBmdW5jdGlvbihwYXJ0aWFsLCBuYW1lLCBjb250ZXh0LCBoZWxwZXJzLCBwYXJ0aWFscywgZGF0YSkge1xuICAgIHZhciBvcHRpb25zID0geyBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcblxuICAgIGlmKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuICAgIH0gZWxzZSBpZihwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAoIUhhbmRsZWJhcnMuY29tcGlsZSkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydGlhbHNbbmFtZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUocGFydGlhbCwge2RhdGE6IGRhdGEgIT09IHVuZGVmaW5lZH0pO1xuICAgICAgcmV0dXJuIHBhcnRpYWxzW25hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy50ZW1wbGF0ZSA9IEhhbmRsZWJhcnMuVk0udGVtcGxhdGU7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcblxufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbkhhbmRsZWJhcnMuRXhjZXB0aW9uID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG59O1xuSGFuZGxlYmFycy5FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbi8vIEJ1aWxkIG91dCBvdXIgYmFzaWMgU2FmZVN0cmluZyB0eXBlXG5IYW5kbGViYXJzLlNhZmVTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59O1xuSGFuZGxlYmFycy5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJpbmcudG9TdHJpbmcoKTtcbn07XG5cbnZhciBlc2NhcGUgPSB7XG4gIFwiJlwiOiBcIiZhbXA7XCIsXG4gIFwiPFwiOiBcIiZsdDtcIixcbiAgXCI+XCI6IFwiJmd0O1wiLFxuICAnXCInOiBcIiZxdW90O1wiLFxuICBcIidcIjogXCImI3gyNztcIixcbiAgXCJgXCI6IFwiJiN4NjA7XCJcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZztcbnZhciBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG52YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl0gfHwgXCImYW1wO1wiO1xufTtcblxuSGFuZGxlYmFycy5VdGlscyA9IHtcbiAgZXh0ZW5kOiBmdW5jdGlvbihvYmosIHZhbHVlKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICAgIGlmKHZhbHVlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWx1ZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBlc2NhcGVFeHByZXNzaW9uOiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyBpbnN0YW5jZW9mIEhhbmRsZWJhcnMuU2FmZVN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZy50b1N0cmluZygpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwgfHwgc3RyaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gc3RyaW5nLnRvU3RyaW5nKCk7XG5cbiAgICBpZighcG9zc2libGUudGVzdChzdHJpbmcpKSB7IHJldHVybiBzdHJpbmc7IH1cbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xuICB9LFxuXG4gIGlzRW1wdHk6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmKHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgQXJyYXldXCIgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcycpLmNyZWF0ZSgpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzJykuYXR0YWNoKGV4cG9ydHMpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMnKS5hdHRhY2goZXhwb3J0cykiLCIjIyMqXG4gKiBQcmltYXJ5IGFwcGxpY2F0aW9uIGNvbnRyb2xsZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cbkFwcE1vZGVsICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuQXBwUm91dGVyICAgPSByZXF1aXJlICcuL3JvdXRlcnMvQXBwUm91dGVyLmNvZmZlZSdcbkxhbmRpbmdWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSdcbkNyZWF0ZVZpZXcgID0gcmVxdWlyZSAnLi92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUnXG5TaGFyZVZpZXcgICA9IHJlcXVpcmUgJy4vdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwQ29udHJvbGxlciBleHRlbmRzIFZpZXdcblxuXG4gICBjbGFzc05hbWU6ICd3cmFwcGVyJ1xuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQGxhbmRpbmdWaWV3ID0gbmV3IExhbmRpbmdWaWV3XG4gICAgICBAc2hhcmVWaWV3ICAgPSBuZXcgU2hhcmVWaWV3XG5cbiAgICAgIEBjcmVhdGVWaWV3ICA9IG5ldyBDcmVhdGVWaWV3XG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAYXBwUm91dGVyID0gbmV3IEFwcFJvdXRlclxuICAgICAgICAgYXBwQ29udHJvbGxlcjogQFxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIEFwcENvbnRyb2xsZXIgdG8gdGhlIERPTSBhbmQga2lja3NcbiAgICMgb2ZmIGJhY2tib25lcyBoaXN0b3J5XG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIEAkYm9keSA9ICQgJ2JvZHknXG4gICAgICBAJGJvZHkuYXBwZW5kIEBlbFxuXG4gICAgICBCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0XG4gICAgICAgICBwdXNoU3RhdGU6IGZhbHNlXG5cblxuXG4gICAjIERlc3Ryb3lzIGFsbCBjdXJyZW50IGFuZCBwcmUtcmVuZGVyZWQgdmlld3MgYW5kXG4gICAjIHVuZGVsZWdhdGVzIGV2ZW50IGxpc3RlbmVyc1xuXG4gICByZW1vdmU6IC0+XG4gICAgICBAbGFuZGluZ1ZpZXcucmVtb3ZlKClcbiAgICAgIEBzaGFyZVZpZXcucmVtb3ZlKClcbiAgICAgIEBjcmVhdGVWaWV3LnJlbW92ZSgpXG5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG5cblxuXG5cbiAgICMgQWRkcyBBcHBDb250cm9sbGVyLXJlbGF0ZWQgZXZlbnQgbGlzdGVuZXJzIGFuZCBiZWdpbnNcbiAgICMgbGlzdGVuaW5nIHRvIHZpZXcgY2hhbmdlc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsICdjaGFuZ2U6dmlldycsIEBvblZpZXdDaGFuZ2VcblxuXG5cblxuICAgIyBSZW1vdmVzIEFwcENvbnRyb2xsZXItcmVsYXRlZCBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAc3RvcExpc3RlbmluZygpXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3Igc2hvd2luZyAvIGhpZGluZyAvIGRpc3Bvc2luZyBvZiBwcmltYXJ5IHZpZXdzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uVmlld0NoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgcHJldmlvdXNWaWV3ID0gbW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy52aWV3XG4gICAgICBjdXJyZW50VmlldyAgPSBtb2RlbC5jaGFuZ2VkLnZpZXdcblxuICAgICAgcHJldmlvdXNWaWV3Py5oaWRlXG4gICAgICAgICByZW1vdmU6IHRydWVcblxuXG4gICAgICBAJGVsLmFwcGVuZCBjdXJyZW50Vmlldy5yZW5kZXIoKS5lbFxuXG4gICAgICBjdXJyZW50Vmlldy5zaG93KClcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb250cm9sbGVyIiwiIyMjKlxuICBBcHBsaWNhdGlvbi13aWRlIGdlbmVyYWwgY29uZmlndXJhdGlvbnNcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xOS4xNFxuIyMjXG5cblxuQXBwQ29uZmlnID1cblxuXG4gICAjIFRoZSBwYXRoIHRvIGFwcGxpY2F0aW9uIGFzc2V0c1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBBU1NFVFM6XG4gICAgICBwYXRoOiAgICcvYXNzZXRzJ1xuICAgICAgYXVkaW86ICAnYXVkaW8nXG4gICAgICBkYXRhOiAgICdkYXRhJ1xuICAgICAgaW1hZ2VzOiAnaW1hZ2VzJ1xuXG5cbiAgICMgVGhlIEJQTSB0ZW1wb1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBCUE06IDMyMFxuXG5cbiAgICMgVGhlIG1heCBCUE1cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQlBNX01BWDogMTAwMFxuXG5cbiAgICMgVGhlIG1heCB2YXJpZW50IG9uIGVhY2ggcGF0dGVybiBzcXVhcmUgKG9mZiwgbG93LCBtZWRpdW0sIGhpZ2gpXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIFZFTE9DSVRZX01BWDogM1xuXG5cbiAgICMgVm9sdW1lIGxldmVscyBmb3IgcGF0dGVybiBwbGF5YmFjayBhcyB3ZWxsIGFzIGZvciBvdmVyYWxsIHRyYWNrc1xuICAgIyBAdHlwZSB7T2JqZWN0fVxuXG4gICBWT0xVTUVfTEVWRUxTOlxuICAgICAgbG93OiAgICAuMlxuICAgICAgbWVkaXVtOiAuNVxuICAgICAgaGlnaDogICAgMVxuXG5cbiAgICMgUmV0dXJucyBhIG5vcm1hbGl6ZWQgYXNzZXQgcGF0aCBmb3IgYXBwbGljYXRpb24gYXNzZXRzXG4gICAjIEBwYXJhbSB7U3RyaW5nfSBhc3NldFR5cGVcblxuICAgcmV0dXJuQXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgICAgQEFTU0VUUy5wYXRoICsgJy8nICsgQEFTU0VUU1thc3NldFR5cGVdXG5cblxuICAgIyBSZXR1cm5zIGEgbm9ybWFsaXplZCBhc3NldCBwYXRoIGZvciB0aGUgVEVTVCBlbnZpcm9ubWVudFxuICAgIyBAcGFyYW0ge1N0cmluZ30gYXNzZXRUeXBlXG5cbiAgIHJldHVyblRlc3RBc3NldFBhdGg6IChhc3NldFR5cGUpIC0+XG4gICAgICAnL3Rlc3QvaHRtbC8nICsgQEFTU0VUUy5wYXRoICsgJy8nICsgQEFTU0VUU1thc3NldFR5cGVdXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcENvbmZpZ1xuXG4iLCIjIyMqXG4gKiBBcHBsaWNhdGlvbiByZWxhdGVkIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblxuQXBwRXZlbnQgPVxuXG4gICBDSEFOR0VfQUNUSVZFOiAgICAgJ2NoYW5nZTphY3RpdmUnXG4gICBDSEFOR0VfQlBNOiAgICAgICAgJ2NoYW5nZTpicG0nXG4gICBDSEFOR0VfRFJBR0dJTkc6ICAgJ2NoYW5nZTpkcmFnZ2luZydcbiAgIENIQU5HRV9EUk9QUEVEOiAgICAnY2hhbmdlOmRyb3BwZWQnXG4gICBDSEFOR0VfRk9DVVM6ICAgICAgJ2NoYW5nZTpmb2N1cydcbiAgIENIQU5HRV9JTlNUUlVNRU5UOiAnY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50J1xuICAgQ0hBTkdFX0tJVDogICAgICAgICdjaGFuZ2U6a2l0TW9kZWwnXG4gICBDSEFOR0VfTVVURTogICAgICAgJ2NoYW5nZTptdXRlJ1xuICAgQ0hBTkdFX1BMQVlJTkc6ICAgICdjaGFuZ2U6cGxheWluZydcbiAgIENIQU5HRV9UUklHR0VSOiAgICAnY2hhbmdlOnRyaWdnZXInXG4gICBDSEFOR0VfVkVMT0NJVFk6ICAgJ2NoYW5nZTp2ZWxvY2l0eSdcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBFdmVudCIsIiMjIypcbiAqIEdsb2JhbCBQdWJTdWIgZXZlbnRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuXG5QdWJTdWIgPVxuXG4gICBST1VURTogJ29uUm91dGVDaGFuZ2UnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQdWJTdWIiLCJcbnZhciBkaWdpdHMgPSByZXF1aXJlKCdkaWdpdHMnKTtcbnZhciBoYW5kbGViYXJzID0gcmVxdWlyZSgnaGFuZGxlaWZ5JylcblxuaGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcigncmVwZWF0JywgZnVuY3Rpb24obiwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBfZGF0YSA9IHt9O1xuICAgIGlmIChvcHRpb25zLl9kYXRhKSB7XG4gICAgICBfZGF0YSA9IGhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5fZGF0YSk7XG4gICAgfVxuXG4gICAgdmFyIGNvbnRlbnQgPSAnJztcbiAgICB2YXIgY291bnQgPSBuIC0gMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBjb3VudDsgaSsrKSB7XG4gICAgICBfZGF0YSA9IHtcbiAgICAgICAgaW5kZXg6IGRpZ2l0cy5wYWQoKGkgKyAxKSwge2F1dG86IG59KVxuICAgICAgfTtcbiAgICAgIGNvbnRlbnQgKz0gb3B0aW9ucy5mbih0aGlzLCB7ZGF0YTogX2RhdGF9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBoYW5kbGViYXJzLlNhZmVTdHJpbmcoY29udGVudCk7XG4gIH0pOyIsIiMjIypcbiAgUHJpbWFyeSBhcHBsaWNhdGlvbiBtb2RlbCB3aGljaCBjb29yZGluYXRlcyBzdGF0ZVxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cblxuQXBwUm91dGVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAndmlldyc6ICAgICAgICBudWxsXG4gICAgICAncGxheWluZyc6ICAgICBudWxsXG4gICAgICAnbXV0ZSc6ICAgICAgICBudWxsXG5cbiAgICAgICdraXRNb2RlbCc6ICAgIG51bGxcblxuICAgICAgIyBTZXR0aW5nc1xuICAgICAgJ2JwbSc6ICAgICAgICAgQXBwQ29uZmlnLkJQTVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwUm91dGVyIiwiIyMjKlxuICogQ29sbGVjdGlvbiBvZiBzb3VuZCBraXRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRNb2RlbCAgPSByZXF1aXJlICcuL0tpdE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBLaXRDb2xsZWN0aW9uIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG5cbiAgICMgVXJsIHRvIGRhdGEgZm9yIGZldGNoXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHVybDogXCIje0FwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKX0vc291bmQtZGF0YS5qc29uXCJcblxuXG4gICAjIEluZGl2aWR1YWwgZHJ1bWtpdCBhdWRpbyBzZXRzXG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAgbW9kZWw6IEtpdE1vZGVsXG5cblxuICAgIyBUaGUgY3VycmVudCB1c2VyLXNlbGVjdGVkIGtpdFxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBraXRJZDogMFxuXG5cblxuICAgcGFyc2U6IChyZXNwb25zZSkgLT5cbiAgICAgIGFzc2V0UGF0aCA9IHJlc3BvbnNlLmNvbmZpZy5hc3NldFBhdGhcbiAgICAgIGtpdHMgPSByZXNwb25zZS5raXRzXG5cbiAgICAgIGtpdHMgPSBfLm1hcCBraXRzLCAoa2l0KSAtPlxuICAgICAgICAga2l0LnBhdGggPSBhc3NldFBhdGggKyAnLycgKyBraXQuZm9sZGVyXG4gICAgICAgICByZXR1cm4ga2l0XG5cbiAgICAgIHJldHVybiBraXRzXG5cblxuXG5cbiAgICMgQ3ljbGVzIHRoZSBjdXJyZW50IGRydW0ga2l0IGJhY2tcbiAgICMgQHJldHVybiB7S2l0TW9kZWx9XG5cbiAgIHByZXZpb3VzS2l0OiAtPlxuICAgICAgbGVuID0gQGxlbmd0aFxuXG4gICAgICBpZiBAa2l0SWQgPiAwXG4gICAgICAgICBAa2l0SWQtLVxuXG4gICAgICBlbHNlXG4gICAgICAgICBAa2l0SWQgPSBsZW4gLSAxXG5cbiAgICAgIGtpdE1vZGVsID0gQGF0IEBraXRJZFxuXG5cblxuXG4gICAjIEN5Y2xlcyB0aGUgY3VycmVudCBkcnVtIGtpdCBmb3J3YXJkXG4gICAjIEByZXR1cm4ge0tpdE1vZGVsfVxuXG4gICBuZXh0S2l0OiAtPlxuICAgICAgbGVuID0gQGxlbmd0aCAtIDFcblxuICAgICAgaWYgQGtpdElkIDwgbGVuXG4gICAgICAgICBAa2l0SWQrK1xuXG4gICAgICBlbHNlXG4gICAgICAgICBAa2l0SWQgPSAwXG5cbiAgICAgIGtpdE1vZGVsID0gQGF0IEBraXRJZFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRDb2xsZWN0aW9uIiwiIyMjKlxuICogS2l0IG1vZGVsIGZvciBoYW5kbGluZyBzdGF0ZSByZWxhdGVkIHRvIGtpdCBzZWxlY3Rpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuY2xhc3MgS2l0TW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ2xhYmVsJzogICAgbnVsbFxuICAgICAgJ3BhdGgnOiAgICAgbnVsbFxuICAgICAgJ2ZvbGRlcic6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cbiAgICAgICdpbnN0cnVtZW50cyc6ICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICAgICAnY3VycmVudEluc3RydW1lbnQnOiBudWxsXG5cblxuXG4gICAjIEZvcm1hdCB0aGUgcmVzcG9uc2Ugc28gdGhhdCBpbnN0cnVtZW50cyBnZXRzIHByb2Nlc3NlZFxuICAgIyBieSBiYWNrYm9uZSB2aWEgdGhlIEluc3RydW1lbnRDb2xsZWN0aW9uLiAgQWRkaXRpb25hbGx5LFxuICAgIyBwYXNzIGluIHRoZSBwYXRoIHNvIHRoYXQgYWJzb2x1dGUgVVJMJ3MgY2FuIGJlIHVzZWRcbiAgICMgdG8gcmVmZXJlbmNlIHNvdW5kIGRhdGFcbiAgICMgQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG5cbiAgIHBhcnNlOiAocmVzcG9uc2UpIC0+XG4gICAgICBfLmVhY2ggcmVzcG9uc2UuaW5zdHJ1bWVudHMsIChpbnN0cnVtZW50KSAtPlxuICAgICAgICAgaW5zdHJ1bWVudC5pZCA9IF8udW5pcXVlSWQgJ2luc3RydW1lbnQtJ1xuICAgICAgICAgaW5zdHJ1bWVudC5zcmMgPSByZXNwb25zZS5wYXRoICsgJy8nICsgaW5zdHJ1bWVudC5zcmNcblxuICAgICAgcmVzcG9uc2UuaW5zdHJ1bWVudHMgPSBuZXcgSW5zdHJ1bWVudENvbGxlY3Rpb24gcmVzcG9uc2UuaW5zdHJ1bWVudHNcblxuICAgICAgcmVzcG9uc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRNb2RlbCIsIiMjIypcbiAqIE1vZGVsIGZvciB0aGUgZW50aXJlIFBhZCBjb21wb25lbnRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5jbGFzcyBMaXZlUGFkTW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGl2ZVBhZE1vZGVsXG4iLCIjIyMqXG4gKiBDb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgUGFkU3F1YXJlTW9kZWxzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI0LjE0XG4jIyNcblxuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi4vc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgUGFkU3F1YXJlQ29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFkU3F1YXJlQ29sbGVjdGlvbiIsIiMjIypcbiAqIE1vZGVsIGZvciBpbmRpdmlkdWFsIHBhZCBzcXVhcmVzLlxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbmNsYXNzIFBhZFNxdWFyZU1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICdkcmFnZ2luZyc6ICBmYWxzZVxuICAgICAgJ2tleWNvZGUnOiAgIG51bGxcbiAgICAgICd0cmlnZ2VyJzogICBmYWxzZVxuXG4gICAgICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICAgICAnY3VycmVudEluc3RydW1lbnQnOiAgbnVsbFxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAc2V0ICdpZCcsIF8udW5pcXVlSWQgJ3BhZC1zcXVhcmUtJ1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYWRTcXVhcmVNb2RlbFxuIiwiIyMjKlxuICogQ29sbGVjdGlvbiByZXByZXNlbnRpbmcgZWFjaCBzb3VuZCBmcm9tIGEga2l0IHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4vSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBJbnN0cnVtZW50Q29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICBtb2RlbDogSW5zdHJ1bWVudE1vZGVsXG5cblxuXG4gICAjIEV4cG9ydHMgdGhlIHBhdHRlcm4gc3F1YXJlcyBjb2xsZWN0aW9uIGZvciB1c2VcbiAgICMgd2l0aCB0cmFuc2ZlcnJpbmcgcHJvcHMgYWNyb3NzIGRpZmZlcmVudCBkcnVtIGtpdHNcblxuICAgZXhwb3J0UGF0dGVyblNxdWFyZXM6IC0+XG4gICAgICByZXR1cm4gQG1hcCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgICAgIGluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRDb2xsZWN0aW9uIiwiIyMjKlxuICogU291bmQgbW9kZWwgZm9yIGVhY2ggaW5kaXZpZHVhbCBraXQgc291bmQgc2V0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cblxuY2xhc3MgSW5zdHJ1bWVudE1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG4gICBkZWZhdWx0czpcblxuICAgICAgIyBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgICdhY3RpdmUnOiAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgICdmb2N1cyc6ICAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7U3RyaW5nfVxuICAgICAgJ2ljb24nOiAgICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgICAnbGFiZWwnOiAgICBudWxsXG5cbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG4gICAgICAnbXV0ZSc6ICAgICBudWxsXG5cbiAgICAgICMgQHR5cGUge1N0cmluZ31cbiAgICAgICdzcmMnOiAgICAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7TnVtYmVyfVxuICAgICAgJ3ZvbHVtZSc6ICAgbnVsbFxuXG5cblxuICAgICAgIyBAdHlwZSB7UGF0dGVyblNxdWFyZUNvbGxlY3Rpb259XG4gICAgICAncGF0dGVyblNxdWFyZXMnOiAgICBudWxsXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRNb2RlbCIsIiMjIypcbiAgQSBjb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgcGF0dGVybiBzcXVhcmVzXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBDb25maWcgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4vUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4uL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG4gICBtb2RlbDogSW5zdHJ1bWVudE1vZGVsXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiIsIiMjIypcbiAgTW9kZWwgZm9yIGluZGl2aWR1YWwgcGF0dGVybiBzcXVhcmVzLiAgUGFydCBvZiBsYXJnZXIgUGF0dGVybiBUcmFjayBjb2xsZWN0aW9uXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBFdmVudCAgPSByZXF1aXJlICcuLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cblxuY2xhc3MgUGF0dGVyblNxdWFyZU1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICdhY3RpdmUnOiAgICAgICAgICAgZmFsc2VcbiAgICAgICdpbnN0cnVtZW50JzogICAgICAgbnVsbFxuICAgICAgJ3ByZXZpb3VzVmVsb2NpdHknOiAwXG4gICAgICAndHJpZ2dlcic6ICAgICAgICAgIG51bGxcbiAgICAgICd2ZWxvY2l0eSc6ICAgICAgICAgMFxuXG5cblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBvbiBBcHBFdmVudC5DSEFOR0VfVkVMT0NJVFksIEBvblZlbG9jaXR5Q2hhbmdlXG5cblxuXG4gICBjeWNsZTogLT5cbiAgICAgIHZlbG9jaXR5ID0gQGdldCAndmVsb2NpdHknXG5cbiAgICAgIGlmIHZlbG9jaXR5IDwgQXBwQ29uZmlnLlZFTE9DSVRZX01BWFxuICAgICAgICAgdmVsb2NpdHkrK1xuXG4gICAgICBlbHNlXG4gICAgICAgICB2ZWxvY2l0eSA9IDBcblxuICAgICAgQHNldCAndmVsb2NpdHknLCB2ZWxvY2l0eVxuXG5cblxuICAgZW5hYmxlOiAtPlxuICAgICAgQHNldCAndmVsb2NpdHknLCAxXG5cblxuXG5cbiAgIGRpc2FibGU6IC0+XG4gICAgICBAc2V0ICd2ZWxvY2l0eScsIDBcblxuXG5cbiAgIG9uVmVsb2NpdHlDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIEBzZXQgJ3ByZXZpb3VzVmVsb2NpdHknLCBtb2RlbC5fcHJldmlvdXNBdHRyaWJ1dGVzLnZlbG9jaXR5XG5cbiAgICAgIHZlbG9jaXR5ID0gbW9kZWwuY2hhbmdlZC52ZWxvY2l0eVxuXG4gICAgICBpZiB2ZWxvY2l0eSA+IDBcbiAgICAgICAgIEBzZXQgJ2FjdGl2ZScsIHRydWVcblxuICAgICAgZWxzZSBpZiB2ZWxvY2l0eSBpcyAwXG4gICAgICAgICBAc2V0ICdhY3RpdmUnLCBmYWxzZVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmVNb2RlbCIsIiMjIypcbiAqIE1QQyBBcHBsaWNhdGlvbiByb3V0ZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBDb25maWcgICA9IHJlcXVpcmUgJy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuUHViU3ViICAgICAgPSByZXF1aXJlICcuLi91dGlscy9QdWJTdWInXG5QdWJFdmVudCAgICA9IHJlcXVpcmUgJy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5cbiMgVE9ETzogVGhlIGJlbG93IGl0ZW1zIGFyZSBvbmx5IGluY2x1ZGVkIGZvciB0ZXN0aW5nIGNvbXBvbmVudFxuIyBtb2R1bGFyaXR5LiAgVGhleSwgYW5kIHRoZWlyIHJvdXRlcywgc2hvdWxkIGJlIHJlbW92ZWQgaW4gcHJvZHVjdGlvblxuXG5UZXN0c1ZpZXcgICAgID0gcmVxdWlyZSAnLi4vdmlld3MvdGVzdHMvVGVzdHNWaWV3LmNvZmZlZSdcblxuVmlldyA9IHJlcXVpcmUgJy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblxuS2l0U2VsZWN0b3IgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3IuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuS2l0TW9kZWwgICAgICA9IHJlcXVpcmUgJy4uL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSdcblxuQlBNSW5kaWNhdG9yICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci5jb2ZmZWUnXG5JbnN0cnVtZW50U2VsZWN0b3JQYW5lbCA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLmNvZmZlZSdcblxuSW5zdHJ1bWVudE1vZGVsID0gJy4uL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcbkluc3RydW1lbnRDb2xsZWN0aW9uID0gJy4uL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlJ1xuXG5QYXR0ZXJuU3F1YXJlID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUuY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAnLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5UcmFjayAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLmNvZmZlZSdcblNlcXVlbmNlciAgICAgICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuXG5MaXZlUGFkTW9kZWwgPSByZXF1aXJlICcuLi9tb2RlbHMvcGFkL0xpdmVQYWRNb2RlbC5jb2ZmZWUnXG5QYWRTcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhZFNxdWFyZU1vZGVsID0gcmVxdWlyZSAnLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVNb2RlbC5jb2ZmZWUnXG5MaXZlUGFkID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL0xpdmVQYWQuY29mZmVlJ1xuUGFkU3F1YXJlID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL1BhZFNxdWFyZS5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwUm91dGVyIGV4dGVuZHMgQmFja2JvbmUuUm91dGVyXG5cblxuICAgcm91dGVzOlxuICAgICAgJyc6ICAgICAgICAgICAgICdsYW5kaW5nUm91dGUnXG4gICAgICAnY3JlYXRlJzogICAgICAgJ2NyZWF0ZVJvdXRlJ1xuICAgICAgJ3NoYXJlJzogICAgICAgICdzaGFyZVJvdXRlJ1xuXG4gICAgICAjIENvbXBvbmVudCB0ZXN0IHJvdXRlc1xuICAgICAgJ3Rlc3RzJzogICAgICAgICAgICAgICAgJ3Rlc3RzJ1xuICAgICAgJ2tpdC1zZWxlY3Rpb24nOiAgICAgICAgJ2tpdFNlbGVjdGlvblJvdXRlJ1xuICAgICAgJ2JwbS1pbmRpY2F0b3InOiAgICAgICAgJ2JwbUluZGljYXRvclJvdXRlJ1xuICAgICAgJ2luc3RydW1lbnQtc2VsZWN0b3InOiAgJ2luc3RydW1lbnRTZWxlY3RvclJvdXRlJ1xuICAgICAgJ3BhdHRlcm4tc3F1YXJlJzogICAgICAgJ3BhdHRlcm5TcXVhcmVSb3V0ZSdcbiAgICAgICdwYXR0ZXJuLXRyYWNrJzogICAgICAgICdwYXR0ZXJuVHJhY2tSb3V0ZSdcbiAgICAgICdzZXF1ZW5jZXInOiAgICAgICAgICAgICdzZXF1ZW5jZXJSb3V0ZSdcbiAgICAgICdmdWxsLXNlcXVlbmNlcic6ICAgICAgICdmdWxsU2VxdWVuY2VyUm91dGUnXG4gICAgICAncGFkLXNxdWFyZSc6ICAgICAgICAgICAncGFkU3F1YXJlUm91dGUnXG4gICAgICAnbGl2ZS1wYWQnOiAgICAgICAgICAgICAnbGl2ZVBhZFJvdXRlJ1xuXG5cblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICB7QGFwcENvbnRyb2xsZXIsIEBhcHBNb2RlbH0gPSBvcHRpb25zXG5cbiAgICAgIFB1YlN1Yi5vbiBQdWJFdmVudC5ST1VURSwgQG9uUm91dGVDaGFuZ2VcblxuXG5cbiAgIG9uUm91dGVDaGFuZ2U6IChwYXJhbXMpID0+XG4gICAgICB7cm91dGV9ID0gcGFyYW1zXG5cbiAgICAgIEBuYXZpZ2F0ZSByb3V0ZSwgeyB0cmlnZ2VyOiB0cnVlIH1cblxuXG5cbiAgIGxhbmRpbmdSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBAYXBwQ29udHJvbGxlci5sYW5kaW5nVmlld1xuXG5cblxuICAgY3JlYXRlUm91dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgQGFwcENvbnRyb2xsZXIuY3JlYXRlVmlld1xuXG5cblxuICAgc2hhcmVSb3V0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBAYXBwQ29udHJvbGxlci5zaGFyZVZpZXdcblxuXG5cblxuXG5cbiAgICMgQ09NUE9ORU5UIFRFU1QgUk9VVEVTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgdGVzdHM6IC0+XG4gICAgICB2aWV3ID0gbmV3IFRlc3RzVmlldygpXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cbiAgIGtpdFNlbGVjdGlvblJvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IEtpdFNlbGVjdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbixcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuICAgYnBtSW5kaWNhdG9yUm91dGU6IC0+XG4gICAgICB2aWV3ID0gbmV3IEJQTUluZGljYXRvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICB2aWV3LnJlbmRlcigpXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cbiAgIGluc3RydW1lbnRTZWxlY3RvclJvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIHZpZXcgPSBuZXcgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cbiAgIHBhdHRlcm5TcXVhcmVSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBQYXR0ZXJuU3F1YXJlXG4gICAgICAgICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG5ldyBQYXR0ZXJuU3F1YXJlTW9kZWwoKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuICAgcGF0dGVyblRyYWNrUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgUGF0dGVyblRyYWNrXG4gICAgICAgICBtb2RlbDogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG4gICBzZXF1ZW5jZXJSb3V0ZTogLT5cblxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IFNlcXVlbmNlclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG4gICBmdWxsU2VxdWVuY2VyUm91dGU6IC0+XG5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuXG4gICAgICBraXRTZWxlY3Rpb24gPSA9PlxuICAgICAgICAgdmlldyA9IG5ldyBLaXRTZWxlY3RvclxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgICAgdmlld1xuXG5cbiAgICAgIGJwbSA9ID0+XG4gICAgICAgICB2aWV3ID0gbmV3IEJQTUluZGljYXRvclxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICAgICB2aWV3XG5cblxuICAgICAgaW5zdHJ1bWVudFNlbGVjdGlvbiA9ID0+XG4gICAgICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgICAgIHZpZXcgPSBuZXcgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWxcbiAgICAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgICAgIHZpZXdcblxuXG4gICAgICBzZXF1ZW5jZXIgPSA9PlxuICAgICAgICAgdmlldyA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICAgICB2aWV3XG5cbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3ID0gbmV3IFZpZXcoKVxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcuJGVsLmFwcGVuZCBraXRTZWxlY3Rpb24oKS5yZW5kZXIoKS5lbFxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcuJGVsLmFwcGVuZCBicG0oKS5yZW5kZXIoKS5lbFxuICAgICAgZnVsbFNlcXVlbmNlclZpZXcuJGVsLmFwcGVuZCBpbnN0cnVtZW50U2VsZWN0aW9uKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgc2VxdWVuY2VyKCkucmVuZGVyKCkuZWxcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIGZ1bGxTZXF1ZW5jZXJWaWV3XG5cblxuXG5cbiAgIHBhZFNxdWFyZVJvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IFBhZFNxdWFyZVxuICAgICAgICAgbW9kZWw6IG5ldyBQYWRTcXVhcmVNb2RlbCgpXG4gICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cblxuICAgbGl2ZVBhZFJvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IExpdmVQYWRcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwUm91dGVyIiwiIyMjKlxuICogVmlldyBzdXBlcmNsYXNzIGNvbnRhaW5pbmcgc2hhcmVkIGZ1bmN0aW9uYWxpdHlcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDIuMTcuMTRcbiMjI1xuXG5cblZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZFxuXG5cblxuICAgIyBJbml0aWFsaXplcyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIF8uZXh0ZW5kIEAsIF8uZGVmYXVsdHMoIG9wdGlvbnMgPSBvcHRpb25zIHx8IEBkZWZhdWx0cywgQGRlZmF1bHRzIHx8IHt9IClcblxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgd2l0aCBzdXBwbGllZCB0ZW1wbGF0ZSBkYXRhLCBvciBjaGVja3MgaWYgdGVtcGxhdGUgaXMgb25cbiAgICMgb2JqZWN0IGJvZHlcbiAgICMgQHBhcmFtICB7RnVuY3Rpb258TW9kZWx9IHRlbXBsYXRlRGF0YVxuICAgIyBAcmV0dXJuIHtWaWV3fVxuXG4gICByZW5kZXI6ICh0ZW1wbGF0ZURhdGEpIC0+XG4gICAgICB0ZW1wbGF0ZURhdGEgPSB0ZW1wbGF0ZURhdGEgfHwge31cblxuICAgICAgaWYgQHRlbXBsYXRlXG5cbiAgICAgICAgICMgSWYgbW9kZWwgaXMgYW4gaW5zdGFuY2Ugb2YgYSBiYWNrYm9uZSBtb2RlbCwgdGhlbiBKU09OaWZ5IGl0XG4gICAgICAgICBpZiBAbW9kZWwgaW5zdGFuY2VvZiBCYWNrYm9uZS5Nb2RlbFxuICAgICAgICAgICAgdGVtcGxhdGVEYXRhID0gQG1vZGVsLnRvSlNPTigpXG5cbiAgICAgICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUgKHRlbXBsYXRlRGF0YSlcblxuICAgICAgQGRlbGVnYXRlRXZlbnRzKClcbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW1vdmVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbW92ZTogKG9wdGlvbnMpIC0+XG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuICAgICAgQCRlbC5yZW1vdmUoKVxuICAgICAgQHVuZGVsZWdhdGVFdmVudHMoKVxuXG5cblxuXG5cbiAgICMgU2hvd3MgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgc2hvdzogKG9wdGlvbnMpIC0+XG4gICAgICBUd2Vlbk1heC5zZXQgQCRlbCwgeyBhdXRvQWxwaGE6IDEgfVxuXG5cblxuXG4gICAjIEhpZGVzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGhpZGU6IChvcHRpb25zKSAtPlxuICAgICAgVHdlZW5NYXguc2V0IEAkZWwsXG4gICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICBpZiBvcHRpb25zPy5yZW1vdmVcbiAgICAgICAgICAgICAgIEByZW1vdmUoKVxuXG5cblxuXG4gICAjIE5vb3Agd2hpY2ggaXMgY2FsbGVkIG9uIHJlbmRlclxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cblxuXG5cbiAgICMgUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBsaXN0ZW5lcnNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAc3RvcExpc3RlbmluZygpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXciLCIvKipcbiAqIEBtb2R1bGUgICAgIFB1YlN1YlxuICogQGRlc2MgICAgICAgR2xvYmFsIFB1YlN1YiBvYmplY3QgZm9yIGRpc3BhdGNoIGFuZCBkZWxlZ2F0aW9uXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBQdWJTdWIgPSB7fVxuXG5fLmV4dGVuZCggUHViU3ViLCBCYWNrYm9uZS5FdmVudHMgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFB1YlN1YiIsIiMjIypcbiAqIENyZWF0ZSB2aWV3IHdoaWNoIHRoZSB1c2VyIGNhbiBidWlsZCBiZWF0cyB3aXRoaW5cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5cblZpZXcgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuS2l0U2VsZWN0b3IgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci5jb2ZmZWUnXG5JbnN0cnVtZW50U2VsZWN0b3JQYW5lbCA9IHJlcXVpcmUgJy4uLy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLmNvZmZlZSdcblNlcXVlbmNlciAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUnXG5CUE1JbmRpY2F0b3IgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci5jb2ZmZWUnXG50ZW1wbGF0ZSAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2NyZWF0ZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgQ3JlYXRlVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGtpdFNlbGVjdG9yQ29udGFpbmVyICAgPSBAJGVsLmZpbmQgJy5jb250YWluZXIta2l0LXNlbGVjdG9yJ1xuICAgICAgQCRraXRTZWxlY3RvciAgICAgICAgICAgID0gQCRlbC5maW5kICcua2l0LXNlbGVjdG9yJ1xuICAgICAgQCR2aXN1YWxpemF0aW9uQ29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLXZpc3VhbGl6YXRpb24nXG4gICAgICBAJHNlcXVlbmNlckNvbnRhaW5lciAgICAgPSBAJGVsLmZpbmQgJy5jb250YWluZXItc2VxdWVuY2VyJ1xuICAgICAgQCRpbnN0cnVtZW50U2VsZWN0b3IgICAgID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLmluc3RydW1lbnQtc2VsZWN0b3InXG4gICAgICBAJHNlcXVlbmNlciAgICAgICAgICAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuc2VxdWVuY2VyJ1xuICAgICAgQCRicG0gICAgICAgICAgICAgICAgICAgID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLmJwbSdcbiAgICAgIEAkc2hhcmVCdG4gICAgICAgICAgICAgICA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5idG4tc2hhcmUnXG5cbiAgICAgIEByZW5kZXJLaXRTZWxlY3RvcigpXG4gICAgICBAcmVuZGVySW5zdHJ1bWVudFNlbGVjdG9yKClcbiAgICAgIEByZW5kZXJTZXF1ZW5jZXIoKVxuICAgICAgQHJlbmRlckJQTSgpXG5cbiAgICAgIEBcblxuXG5cbiAgIHJlbmRlcktpdFNlbGVjdG9yOiAtPlxuICAgICAgQGtpdFNlbGVjdG9yID0gbmV3IEtpdFNlbGVjdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAJGtpdFNlbGVjdG9yLmh0bWwgQGtpdFNlbGVjdG9yLnJlbmRlcigpLmVsXG5cblxuXG4gICByZW5kZXJJbnN0cnVtZW50U2VsZWN0b3I6IC0+XG4gICAgICBAaW5zdHJ1bWVudFNlbGVjdG9yID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAJGluc3RydW1lbnRTZWxlY3Rvci5odG1sIEBpbnN0cnVtZW50U2VsZWN0b3IucmVuZGVyKCkuZWxcblxuXG5cbiAgIHJlbmRlclNlcXVlbmNlcjogLT5cbiAgICAgIEBzZXF1ZW5jZXIgPSBuZXcgU2VxdWVuY2VyXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgQCRzZXF1ZW5jZXIuaHRtbCBAc2VxdWVuY2VyLnJlbmRlcigpLmVsXG5cblxuXG4gICByZW5kZXJCUE06IC0+XG4gICAgICBAYnBtID0gbmV3IEJQTUluZGljYXRvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAJGJwbS5odG1sIEBicG0ucmVuZGVyKCkuZWxcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENyZWF0ZVZpZXciLCIjIyMqXG4gKiBCZWF0cyBwZXIgbWludXRlIHZpZXcgZm9yIGhhbmRsaW5nIHRlbXBvXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBFdmVudCAgPSByZXF1aXJlICcuLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvYnBtLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBCUE1JbmRpY2F0b3IgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBSZWYgdG8gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgVGhlIHNldEludGVydmFsIHVwZGF0ZSBpbnRlcnZhbCBmb3IgaW5jcmVhc2luZyBhbmRcbiAgICMgZGVjcmVhc2luZyBCUE0gb24gcHJlc3MgLyB0b3VjaFxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBpbnRlcnZhbFVwZGF0ZVRpbWU6IDcwXG5cblxuICAgIyBUaGUgc2V0SW50ZXJ2YWwgdXBkYXRlclxuICAgIyBAdHlwZSB7U2V0SW50ZXJ2YWx9XG5cbiAgIHVwZGF0ZUludGVydmFsOiBudWxsXG5cblxuICAgIyBUaGUgYW1vdW50IHRvIGluY3JlYXNlIHRoZSBCUE0gYnkgb24gZWFjaCB0aWNrXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGJwbUluY3JlYXNlQW1vdW50OiAxMFxuXG5cbiAgICMgVGhlIGN1cnJlbnQgYnBtIGJlZm9yZSBpdHMgc2V0IG9uIHRoZSBtb2RlbC4gIFVzZWQgdG8gYnVmZmVyXG4gICAjIHVwZGF0ZXMgYW5kIHRvIHByb3ZpZGUgZm9yIHNtb290aCBhbmltYXRpb25cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgY3VyckJQTTogbnVsbFxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hzdGFydCAuYnRuLWluY3JlYXNlJzogJ29uSW5jcmVhc2VCdG5Eb3duJ1xuICAgICAgJ3RvdWNoc3RhcnQgLmJ0bi1kZWNyZWFzZSc6ICdvbkRlY3JlYXNlQnRuRG93bidcbiAgICAgICd0b3VjaGVuZCAgIC5idG4taW5jcmVhc2UnOiAnb25CdG5VcCdcbiAgICAgICd0b3VjaGVuZCAgIC5idG4tZGVjcmVhc2UnOiAnb25CdG5VcCdcblxuXG5cblxuICAgIyBSZW5kZXIgdGhlIHZpZXcgYW5kIHVwZGF0ZSB0aGUga2l0IGlmIG5vdCBhbHJlYWR5XG4gICAjIHNldCB2aWEgYSBwcmV2aW91cyBzZXNzaW9uXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkYnBtTGFiZWwgICA9IEAkZWwuZmluZCAnLmxhYmVsLWJwbSdcbiAgICAgIEBpbmNyZWFzZUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1pbmNyZWFzZSdcbiAgICAgIEBkZWNyZWFzZUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1kZWNyZWFzZSdcblxuICAgICAgQGN1cnJCUE0gPSBAYXBwTW9kZWwuZ2V0KCdicG0nKVxuICAgICAgQCRicG1MYWJlbC50ZXh0IEBjdXJyQlBNXG4gICAgICBAb25CdG5VcCgpXG5cbiAgICAgIEBcblxuXG5cbiAgICMgQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgaGFuZGluZyBjaGFuZ2VzIHJlbGF0ZWQgdG9cbiAgICMgc3dpdGNoaW5nIEJQTVxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9CUE0sIEBvbkJQTUNoYW5nZVxuXG5cblxuXG4gICAjIFNldHMgYW4gaW50ZXJ2YWwgdG8gaW5jcmVhc2UgdGhlIEJQTSBtb25pdG9yLiAgQ2xlYXJzXG4gICAjIHdoZW4gdGhlIHVzZXIgcmVsZWFzZXMgdGhlIG1vdXNlXG5cbiAgIGluY3JlYXNlQlBNOiAtPlxuICAgICAgQHVwZGF0ZUludGVydmFsID0gc2V0SW50ZXJ2YWwgPT5cbiAgICAgICAgIGJwbSA9IEBjdXJyQlBNXG5cbiAgICAgICAgIGlmIGJwbSA8IEFwcENvbmZpZy5CUE1fTUFYXG4gICAgICAgICAgICBicG0gKz0gQGJwbUluY3JlYXNlQW1vdW50XG5cbiAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJwbSA9IEFwcENvbmZpZy5CUE1fTUFYXG5cbiAgICAgICAgIEBjdXJyQlBNID0gYnBtXG4gICAgICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cbiAgICAgICAgICNAYXBwTW9kZWwuc2V0ICdicG0nLCA2MDAwMCAvIEBjdXJyQlBNXG5cbiAgICAgICwgQGludGVydmFsVXBkYXRlVGltZVxuXG5cblxuXG4gICAjIFNldHMgYW4gaW50ZXJ2YWwgdG8gZGVjcmVhc2UgdGhlIEJQTSBtb25pdG9yLiAgQ2xlYXJzXG4gICAjIHdoZW4gdGhlIHVzZXIgcmVsZWFzZXMgdGhlIG1vdXNlXG5cbiAgIGRlY3JlYXNlQlBNOiAtPlxuICAgICAgQHVwZGF0ZUludGVydmFsID0gc2V0SW50ZXJ2YWwgPT5cbiAgICAgICAgIGJwbSA9IEBjdXJyQlBNXG5cbiAgICAgICAgIGlmIGJwbSA+IDBcbiAgICAgICAgICAgIGJwbSAtPSBAYnBtSW5jcmVhc2VBbW91bnRcblxuICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnBtID0gMFxuXG4gICAgICAgICBAY3VyckJQTSA9IGJwbVxuICAgICAgICAgQCRicG1MYWJlbC50ZXh0IEBjdXJyQlBNXG4gICAgICAgICAjQGFwcE1vZGVsLnNldCAnYnBtJywgNjAwMDAgLyBAY3VyckJQTVxuXG4gICAgICAsIEBpbnRlcnZhbFVwZGF0ZVRpbWVcblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGxlZnQgYnV0dG9uIGNsaWNrcy4gIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gYW5kXG4gICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25JbmNyZWFzZUJ0bkRvd246IChldmVudCkgPT5cbiAgICAgIEBpbmNyZWFzZUJQTSgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgICMgc2V0cyBhIG5ldyBraXRNb2RlbCBvbiB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkRlY3JlYXNlQnRuRG93bjogKGV2ZW50KSAtPlxuICAgICAgQGRlY3JlYXNlQlBNKClcblxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG1vdXNlIC8gdG91Y2h1cCBldmVudHMuICBDbGVhcnMgdGhlIGludGVydmFsXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uQnRuVXA6IChldmVudCkgLT5cbiAgICAgIGNsZWFySW50ZXJ2YWwgQHVwZGF0ZUludGVydmFsXG4gICAgICBAdXBkYXRlSW50ZXJ2YWwgPSBudWxsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2JwbScsIDYwMDAwIC8gQGN1cnJCUE1cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGxhYmVsIG9uIHRoZVxuICAgIyBraXQgc2VsZWN0b3JcblxuICAgb25CUE1DaGFuZ2U6IChtb2RlbCkgLT5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEJQTUluZGljYXRvciIsIiMjIypcbiAqIEtpdCBzZWxlY3RvciBmb3Igc3dpdGNoaW5nIGJldHdlZW4gZHJ1bS1raXQgc291bmRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwRXZlbnQgPSByZXF1aXJlICcuLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2tpdC1zZWxlY3Rpb24tdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEtpdFNlbGVjdG9yIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgUmVmIHRvIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgS2l0Q29sbGVjdGlvbiBmb3IgdXBkYXRpbmcgc291bmRzXG4gICAjIEB0eXBlIHtLaXRDb2xsZWN0aW9ufVxuXG4gICBraXRDb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBUaGUgY3VycmVudCBraXRcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRNb2RlbDogbnVsbFxuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5idG4tbGVmdCc6ICAgJ29uTGVmdEJ0bkNsaWNrJ1xuICAgICAgJ3RvdWNoZW5kIC5idG4tcmlnaHQnOiAgJ29uUmlnaHRCdG5DbGljaydcblxuXG5cblxuICAgIyBSZW5kZXIgdGhlIHZpZXcgYW5kIHVwZGF0ZSB0aGUga2l0IGlmIG5vdCBhbHJlYWR5XG4gICAjIHNldCB2aWEgYSBwcmV2aW91cyBzZXNzaW9uXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAka2l0TGFiZWwgPSBAJGVsLmZpbmQgJy5sYWJlbC1raXQnXG5cbiAgICAgIGlmIEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJykgaXMgbnVsbFxuICAgICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAJGtpdExhYmVsLnRleHQgQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKS5nZXQgJ2xhYmVsJ1xuXG4gICAgICBAXG5cblxuXG5cbiAgICMgQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgaGFuZGluZyBjaGFuZ2VzIHJlbGF0ZWQgdG9cbiAgICMgc3dpdGNoaW5nIGRydW0ga2l0c1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9LSVQsIEBvbkNoYW5nZUtpdFxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGxlZnQgYnV0dG9uIGNsaWNrcy4gIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gYW5kXG4gICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcblxuICAgb25MZWZ0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ucHJldmlvdXNLaXQoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGxlZnQgYnV0dG9uIGNsaWNrcy4gIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gYW5kXG4gICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcblxuICAgb25SaWdodEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2UgZXZlbnRzLiAgVXBkYXRlcyB0aGUgbGFiZWwgb24gdGhlXG4gICAjIGtpdCBzZWxlY3RvclxuXG4gICBvbkNoYW5nZUtpdDogKG1vZGVsKSAtPlxuICAgICAgQGtpdE1vZGVsID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbFxuICAgICAgQCRraXRMYWJlbC50ZXh0IEBraXRNb2RlbC5nZXQgJ2xhYmVsJ1xuXG5cblxuXG5cbiAgICMgUFJJVkFURSBNRVRIT0RTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRTZWxlY3RvciIsIiMjIypcbiAqIFNvdW5kIHR5cGUgc2VsZWN0b3IgZm9yIGNob29zaW5nIHdoaWNoIHNvdW5kIHNob3VsZFxuICogcGxheSBvbiBlYWNoIHRyYWNrXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuXG5BcHBFdmVudCAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvaW5zdHJ1bWVudC10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgSW5zdHJ1bWVudCBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSB2aWV3IGNsYXNzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ2luc3RydW1lbnQnXG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBSZWYgdG8gdGhlIEluc3RydW1lbnRNb2RlbFxuICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuXG4gICBtb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBwYXJlbnQga2l0XG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0TW9kZWw6IG51bGxcblxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kJzogJ29uQ2xpY2snXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgY2xpY2sgZXZlbnRzLiAgVXBkYXRlcyB0aGUgY3VycmVudCBpbnN0cnVtZW50IG1vZGVsLCB3aGljaFxuICAgIyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCBsaXN0ZW5zIHRvLCBhbmQgYWRkcyBhIHNlbGVjdGVkIHN0YXRlXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBraXRNb2RlbC5zZXQgJ2N1cnJlbnRJbnN0cnVtZW50JywgQG1vZGVsXG4gICAgICBAJGVsLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnQiLCIjIyMqXG4gKiBQYW5lbCB3aGljaCBob3VzZXMgZWFjaCBpbmRpdmlkdWFsIHNlbGVjdGFibGUgc291bmRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbkluc3RydW1lbnQgID0gcmVxdWlyZSAnLi9JbnN0cnVtZW50LmNvZmZlZSdcbnRlbXBsYXRlICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvaW5zdHJ1bWVudC1wYW5lbC10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBWaWV3IHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBSZWYgdG8gdGhlIGFwcGxpY2F0aW9uIG1vZGVsXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byBraXQgY29sbGVjdGlvblxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGtpdFxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdE1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8gaW5zdHJ1bWVudCB2aWV3c1xuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIGluc3RydW1lbnRWaWV3czogbnVsbFxuXG5cblxuXG4gICAjIEluaXRpYWxpemVzIHRoZSBpbnN0cnVtZW50IHNlbGVjdG9yIGFuZCBzZXRzIGEgbG9jYWwgcmVmXG4gICAjIHRvIHRoZSBjdXJyZW50IGtpdCBtb2RlbCBmb3IgZWFzeSBhY2Nlc3NcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBraXRNb2RlbCA9IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJylcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGFzIHdlbGwgYXMgdGhlIGFzc29jaWF0ZWQga2l0IGluc3RydW1lbnRzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkY29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLWluc3RydW1lbnRzJ1xuXG4gICAgICBAcmVuZGVySW5zdHJ1bWVudHMoKVxuXG4gICAgICBAXG5cblxuXG5cbiAgICMgUmVuZGVycyBlYWNoIGluZGl2aWR1YWwga2l0IG1vZGVsIGludG8gYW4gSW5zdHJ1bWVudFxuXG4gICByZW5kZXJJbnN0cnVtZW50czogLT5cbiAgICAgIEBpbnN0cnVtZW50Vmlld3MgPSBbXVxuXG4gICAgICBAa2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgICAgaW5zdHJ1bWVudCA9IG5ldyBJbnN0cnVtZW50XG4gICAgICAgICAgICBraXRNb2RlbDogQGtpdE1vZGVsXG4gICAgICAgICAgICBtb2RlbDogbW9kZWxcblxuICAgICAgICAgQCRjb250YWluZXIuYXBwZW5kIGluc3RydW1lbnQucmVuZGVyKCkuZWxcbiAgICAgICAgIEBpbnN0cnVtZW50Vmlld3MucHVzaCBpbnN0cnVtZW50XG5cblxuXG5cbiAgICMgQWRkcyBldmVudCBsaXN0ZW5lcnMgcmVsYXRlZCB0byBraXQgY2hhbmdlc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9LSVQsIEBvbktpdENoYW5nZVxuICAgICAgQGxpc3RlblRvIEBraXRNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0lOU1RSVU1FTlQsIEBvbkluc3RydW1lbnRDaGFuZ2VcblxuXG5cbiAgICMgUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAc3RvcExpc3RlbmluZygpXG5cblxuXG5cblxuICAgIyBFVkVOVCBMSVNURU5FUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBDbGVhbnMgdXAgdGhlIHZpZXcgYW5kIHJlLXJlbmRlcnNcbiAgICMgdGhlIGluc3RydW1lbnRzIHRvIHRoZSBET01cbiAgICMgQHBhcmFtIHtLaXRNb2RlbH0gbW9kZWxcblxuICAgb25LaXRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG5cbiAgICAgIEBraXRNb2RlbCA9IG1vZGVsLmNoYW5nZWQua2l0TW9kZWxcblxuICAgICAgXy5lYWNoIEBpbnN0cnVtZW50Vmlld3MsIChpbnN0cnVtZW50KSAtPlxuICAgICAgICAgaW5zdHJ1bWVudC5yZW1vdmUoKVxuXG4gICAgICBAcmVuZGVySW5zdHJ1bWVudHMoKVxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgb25JbnN0cnVtZW50Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAJGNvbnRhaW5lci5maW5kKCcuaW5zdHJ1bWVudCcpLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcblxuXG5cblxuXG4gICBvblRlc3RDbGljazogKGV2ZW50KSAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5uZXh0S2l0KClcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRTZWxlY3RvclBhbmVsIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdjb250YWluZXItaW5zdHJ1bWVudHMnPlxcblxcbjwvZGl2PlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPSdpY29uIFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5pY29uKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5pY29uOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiJz48L2Rpdj5cXG48ZGl2IGNsYXNzPSdsYWJlbCc+XFxuXHRcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMubGFiZWwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmxhYmVsOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuPC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwiIyMjKlxuICogTGl2ZSBNUEMgXCJwYWRcIiBjb21wb25lbnRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5QYWRTcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhZFNxdWFyZU1vZGVsID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVNb2RlbC5jb2ZmZWUnXG5WaWV3ICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblBhZFNxdWFyZSAgICAgID0gcmVxdWlyZSAnLi9QYWRTcXVhcmUuY29mZmVlJ1xudGVtcGxhdGUgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9saXZlLXBhZC10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgTGl2ZVBhZCBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBjbGFzc25hbWUgZm9yIHRoZSBMaXZlIFBhZFxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdjb250YWluZXItbGl2ZS1wYWQnXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIENvbGxlY3Rpb24gb2Yga2l0cyB0byBiZSByZW5kZXJlZCB0byB0aGUgaW5zdHJ1bWVudCBjb250YWluZXJcbiAgICMgQHR5cGUge0tpdENvbGxlY3Rpb259XG5cbiAgIGtpdENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIEFwcG1vZGVsIGZvciBsaXN0ZW5pbmcgdG8gc2hvdyAvIGhpZGUgZXZlbnRzXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIENvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBwYWQgc3F1YXJlIG1vZGVsc1xuICAgIyBAdHlwZSB7UGFkU3F1YXJlQ29sbGVjdGlvbn1cblxuICAgY29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgQW4gYXJyYXkgb2YgaW5kaXZpZHVhbCBQYWRTcXVhcmVWaWV3c1xuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIHBhZFNxdWFyZVZpZXdzOiBudWxsXG5cblxuICAgIyBLZXkgY29tbWFuZCBrZXltYXAgZm9yIGxpdmUga2l0IHBsYXliYWNrXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAga2V5bWFwOiBbJzEnLCcyJywnMycsJzQnLCdxJywgJ3cnLCAnZScsICdyJywgJ2EnLCAncycsICdkJywgJ2YnLCAneicsICd4JywgJ2MnLCAndiddXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgYW5kIHBhcnNlIHRoZSBjb2xsZWN0aW9uIGludG8gYSBkaXNwbGF5YWJsZVxuICAgIyBpbnN0cnVtZW50IC8gcGFkIHRhYmxlXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAjIEByZXR1cm4ge0xpdmVQYWR9XG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG5cbiAgICAgICMgUmVuZGVyIHRoZSB0YWJsZSB0byB0aGUgRE9NXG4gICAgICBzdXBlciB7XG4gICAgICAgICBwYWRUYWJsZTogQHJldHVyblBhZFRhYmxlRGF0YSgpXG4gICAgICAgICBpbnN0cnVtZW50VGFibGU6IEByZXR1cm5JbnN0cnVtZW50VGFibGVEYXRhKClcbiAgICAgIH1cblxuICAgICAgIyBSZW5kZXIgc3F1YXJlcyB0byB0aGUgRE9NXG4gICAgICBfLmVhY2ggQHBhZFNxdWFyZVZpZXdzLCAocGFkU3F1YXJlKSA9PlxuICAgICAgICAgaWQgPSBwYWRTcXVhcmUubW9kZWwuZ2V0ICdpZCdcbiAgICAgICAgIEAkZWwuZmluZChcIiMje2lkfVwiKS5odG1sIHBhZFNxdWFyZS5yZW5kZXIoKS5lbFxuXG5cbiAgICAgIEAkcGFkQ29udGFpbmVyICAgICAgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1wYWRzJ1xuICAgICAgQCRpbnN0cnVtZW50Q29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLWluc3RydW1lbnRzJ1xuXG4gICAgICBAXG5cblxuXG4gICAjIFJlbmRlciBvdXQgdGhlIHRhYmxlIGZvciB0aGUgbGl2ZSBwYWQgZ3JpZCBhbmQgcHVzaFxuICAgIyBpdCBpbnRvIGFuIGFycmF5IG9mIHRhYmxlIHJvd3MgYW5kIHRkc1xuICAgIyBAcmV0dXJuIHtPYmplY3R9XG5cbiAgIHJldHVyblBhZFRhYmxlRGF0YTogLT5cblxuICAgICAgQGNvbGxlY3Rpb24gPSBuZXcgUGFkU3F1YXJlQ29sbGVjdGlvbigpXG4gICAgICBAcGFkU3F1YXJlVmlld3MgPSBbXVxuICAgICAgcGFkVGFibGUgPSB7fVxuICAgICAgcm93cyA9IFtdXG4gICAgICBpdGVyYXRvciA9IDBcblxuICAgICAgIyBSZW5kZXIgb3V0IHJvd3NcbiAgICAgIF8oNCkudGltZXMgKGluZGV4KSA9PlxuICAgICAgICAgdGRzICA9IFtdXG5cbiAgICAgICAgICMgUmVuZGVyIG91dCBjb2x1bW5zXG4gICAgICAgICBfKDQpLnRpbWVzIChpbmRleCkgPT5cblxuICAgICAgICAgICAgIyBJbnN0YW50aWF0ZSBlYWNoIHBhZCB2aWV3IGFuZCB0aWUgdGhlIGlkXG4gICAgICAgICAgICAjIHRvIHRoZSBET00gZWxlbWVudFxuXG4gICAgICAgICAgICBtb2RlbCA9IG5ldyBQYWRTcXVhcmVNb2RlbFxuICAgICAgICAgICAgICAga2V5Y29kZTogQGtleW1hcFtpdGVyYXRvcl1cblxuICAgICAgICAgICAgcGFkU3F1YXJlID0gbmV3IFBhZFNxdWFyZVxuICAgICAgICAgICAgICAgbW9kZWw6IG1vZGVsXG4gICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICAgICAgICBAcGFkU3F1YXJlVmlld3MucHVzaCBwYWRTcXVhcmVcbiAgICAgICAgICAgIGl0ZXJhdG9yKytcblxuICAgICAgICAgICAgdGRzLnB1c2gge1xuICAgICAgICAgICAgICAgaWQ6IHBhZFNxdWFyZS5tb2RlbC5nZXQoJ2lkJylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgcm93cy5wdXNoIHtcbiAgICAgICAgICAgIGlkOiBcInBhZC1yb3ctI3tpbmRleH1cIlxuICAgICAgICAgICAgdGRzOiB0ZHNcbiAgICAgICAgIH1cblxuICAgICAgcGFkVGFibGUucm93cyA9IHJvd3NcblxuICAgICAgcGFkVGFibGVcblxuXG5cblxuICAgIyBSZW5kZXIgb3V0IHRoZSBpbnN0cnVtZW50IHRhYmxlIGFuZCBwdXNoIGl0IGludG9cbiAgICMgYW5kIGFycmF5IG9mIGluZGl2aWR1YWwgaW5zdHJ1bWVudHNcbiAgICMgQHJldHVybiB7T2JqZWN0fVxuXG4gICByZXR1cm5JbnN0cnVtZW50VGFibGVEYXRhOiAtPlxuICAgICAgaW5zdHJ1bWVudFRhYmxlID0gQGtpdENvbGxlY3Rpb24ubWFwIChraXQpID0+XG4gICAgICAgICBpbnN0cnVtZW50cyA9IGtpdC5nZXQoJ2luc3RydW1lbnRzJykubWFwIChpbnN0cnVtZW50KSA9PlxuICAgICAgICAgICAgaW5zdHJ1bWVudC50b0pTT04oKVxuXG4gICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGFiZWw6IGtpdC5nZXQgJ2xhYmVsJ1xuICAgICAgICAgICAgaW5zdHJ1bWVudHM6IGluc3RydW1lbnRzXG4gICAgICAgICB9XG5cbiAgICAgIGluc3RydW1lbnRUYWJsZVxuXG5cblxuXG5cbiAgICMgQWRkIGNvbGxlY3Rpb24gbGlzdGVuZXJzIHRvIGxpc3RlbiBmb3IgaW5zdHJ1bWVudCBkcm9wc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMaXZlUGFkIiwiIyMjKlxuICogTGl2ZSBNUEMgXCJwYWRcIiBjb21wb25lbnRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYWQtc3F1YXJlLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBQYWRTcXVhcmUgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgdGFnIHRvIGJlIHJlbmRlcmVkIHRvIHRoZSBET01cbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdGFnTmFtZTogJ3RkJ1xuXG5cbiAgICMgVGhlIGNsYXNzbmFtZSBmb3IgdGhlIFBhZCBTcXVhcmVcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAncGFkLXNxdWFyZSdcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgTW9kZWwgd2hpY2ggdHJhY2tzIHN0YXRlIG9mIHNxdWFyZSBhbmQgaW5zdHJ1bWVudHNcbiAgICMgQHR5cGUge1BhZFNxdWFyZU1vZGVsfVxuXG4gICBtb2RlbDogbnVsbFxuXG5cbiAgICMgVGhlIGN1cnJlbnQgaWNvbiBjbGFzcyBhcyBhcHBsaWVkIHRvIHRoZSBzcXVhcmVcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY3VycmVudEljb246IG51bGxcblxuXG4gICAjIFRoZSBhdWRpbyBwbGF5YmFjayBjb21wb25lbnRcbiAgICMgQHR5cGUge0hvd2x9XG5cbiAgIGF1ZGlvUGxheWJhY2s6IG51bGxcblxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kJzogJ29uQ2xpY2snXG5cblxuXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkaWNvbkNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1pY29uJ1xuICAgICAgQCRpY29uICAgICAgICAgID0gQCRpY29uQ29udGFpbmVyLmZpbmQgJy5pY29uJ1xuXG4gICAgICBAXG5cblxuICAgcmVtb3ZlOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2s/LnVubG9hZCgpXG4gICAgICBzdXBlcigpXG5cblxuXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBtb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1RSSUdHRVIsIEBvblRyaWdnZXJDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9JTlNUUlVNRU5ULCBAb25JbnN0cnVtZW50Q2hhbmdlXG5cblxuXG5cbiAgIHJlbmRlckljb246IC0+XG4gICAgICBpZiBAJGljb24uaGFzQ2xhc3MgQGN1cnJlbnRJY29uXG4gICAgICAgICBAJGljb24ucmVtb3ZlQ2xhc3MgQGN1cnJlbnRJY29uXG5cbiAgICAgIGluc3RydW1lbnQgPSBAbW9kZWwuZ2V0ICdjdXJyZW50SW5zdHJ1bWVudCdcblxuICAgICAgdW5sZXNzIGluc3RydW1lbnQgaXMgbnVsbFxuICAgICAgICAgQGN1cnJlbnRJY29uID0gaW5zdHJ1bWVudC5nZXQgJ2ljb24nXG4gICAgICAgICBAJGljb24uYWRkQ2xhc3MgQGN1cnJlbnRJY29uXG5cblxuXG5cbiAgIHNldFNvdW5kOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2s/LnVubG9hZCgpXG5cbiAgICAgIGluc3RydW1lbnQgPSBAbW9kZWwuZ2V0ICdjdXJyZW50SW5zdHJ1bWVudCdcblxuICAgICAgdW5sZXNzIGluc3RydW1lbnQgaXMgbnVsbFxuICAgICAgICAgYXVkaW9TcmMgPSBpbnN0cnVtZW50LmdldCAnc3JjJ1xuXG4gICAgICAgICAjIFRPRE86IFRlc3QgbWV0aG9kc1xuICAgICAgICAgaWYgd2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZigndGVzdCcpIGlzbnQgLTEgdGhlbiBhdWRpb1NyYyA9ICcnXG5cbiAgICAgICAgIEBhdWRpb1BsYXliYWNrID0gbmV3IEhvd2xcbiAgICAgICAgICAgIHZvbHVtZTogQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubWVkaXVtXG4gICAgICAgICAgICB1cmxzOiBbYXVkaW9TcmNdXG4gICAgICAgICAgICBvbmVuZDogQG9uU291bmRFbmRcblxuXG5cbiAgIHJlbW92ZVNvdW5kOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2s/LnVubG9hZCgpXG4gICAgICBAbW9kZWwuc2V0ICdjdXJyZW50SW5zdHJ1bWVudCcsIG51bGxcblxuXG5cblxuICAgcGxheVNvdW5kOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2s/LnBsYXkoKVxuICAgICAgQG1vZGVsLnNldCAndHJpZ2dlcicsIGZhbHNlXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgb25DbGljazogKGV2ZW50KSA9PlxuICAgICAgQG1vZGVsLnNldCAndHJpZ2dlcicsIHRydWVcblxuICAgICAgY29uc29sZS5sb2cgJ2hleSdcblxuXG5cblxuICAgb25Ib2xkOiAoZXZlbnQpID0+XG4gICAgICBAbW9kZWwuc2V0ICdkcmFnZ2luZycsIHRydWVcblxuXG5cblxuICAgb25EcmFnOiAoZXZlbnQpIC0+XG4gICAgICBAbW9kZWwuc2V0ICdkcmFnZ2luZycsIHRydWVcblxuXG5cblxuICAgb25Ecm9wOiAoaWQpIC0+XG4gICAgICBpbnN0cnVtZW50TW9kZWwgPSBAZmluZEluc3RydW1lbnRNb2RlbCBpZFxuXG4gICAgICBAbW9kZWwuc2V0XG4gICAgICAgICAnZHJhZ2dpbmcnOiBmYWxzZVxuICAgICAgICAgJ2Ryb3BwZWQnOiB0cnVlXG4gICAgICAgICAnY3VycmVudEluc3RydW1lbnQnOiBpbnN0cnVtZW50TW9kZWxcblxuXG5cblxuICAgb25UcmlnZ2VyQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBwbGF5aW5nID0gbW9kZWwuY2hhbmdlZC5wbGF5aW5nXG5cbiAgICAgIGlmIHBsYXlpbmdcbiAgICAgICAgIEBwbGF5U291bmQoKVxuXG5cblxuICAgb25JbnN0cnVtZW50Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAcmVuZGVySWNvbigpXG4gICAgICBAc2V0U291bmQoKVxuXG5cblxuXG4gICBvblNvdW5kRW5kOiA9PlxuICAgICAgQG1vZGVsLnNldCAndHJpZ2dlcicsIGZhbHNlXG5cblxuXG5cbiAgICMgUFJJVkFURSBNRVRIT0RTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG5cbiAgIGZpbmRJbnN0cnVtZW50TW9kZWw6IChpZCkgLT5cbiAgICAgIGluc3RydW1lbnRNb2RlbCA9IG51bGxcblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAoa2l0TW9kZWwpID0+XG4gICAgICAgICBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuZWFjaCAobW9kZWwpID0+XG4gICAgICAgICAgICBpZiBpZCBpcyBtb2RlbC5nZXQoJ2lkJylcbiAgICAgICAgICAgICAgIGluc3RydW1lbnRNb2RlbCA9IG1vZGVsXG5cbiAgICAgIGlmIGluc3RydW1lbnRNb2RlbCBpcyBudWxsXG4gICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgaW5zdHJ1bWVudE1vZGVsXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYWRTcXVhcmUiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBzdGFjazIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8dHI+XFxuXHRcdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgZGVwdGgwLnRkcywge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDIsIHByb2dyYW0yLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8L3RyPlxcblx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0yKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0XHRcdDx0ZCBpZD1cXFwiXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmlkKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5pZDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCI+XFxuXFxuXHRcdFx0XHQ8L3RkPlxcblx0XHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW00KGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLWluc3RydW1lbnQnPlxcblx0XHRcdDxoMz5cXG5cdFx0XHRcdDxiPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI8L2I+XFxuXHRcdFx0PC9oMz5cXG5cXG5cdFx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaW5zdHJ1bWVudHMsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSg1LCBwcm9ncmFtNSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdFx0PC9kaXY+XFxuXHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTUoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdFx0PGRpdiBjbGFzcz0naW5zdHJ1bWVudCc+XFxuXHRcdFx0XHRcdFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPHRhYmxlIGNsYXNzPSdjb250YWluZXItcGFkcyc+XFxuXHRcIjtcbiAgc3RhY2syID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCAoKHN0YWNrMSA9IGRlcHRoMC5wYWRUYWJsZSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5yb3dzKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvdGFibGU+XFxuXFxuXFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLWluc3RydW1lbnRzJz5cXG5cdFwiO1xuICBzdGFjazIgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsIGRlcHRoMC5pbnN0cnVtZW50VGFibGUsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSg0LCBwcm9ncmFtNCwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMiB8fCBzdGFjazIgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMjsgfVxuICBidWZmZXIgKz0gXCJcXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiO1xuXG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz0na2V5LWNvZGUnPlxcblx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmtleWNvZGUpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmtleWNvZGU7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG48L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPSdjb250YWluZXItaWNvbic+XFxuXHQ8ZGl2IGNsYXNzPSdpY29uJz5cXG5cXG5cdDwvZGl2PlxcbjwvZGl2PlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIiMjIypcbiAqIEluZGl2aWR1YWwgc2VxdWVuY2VyIHRyYWNrc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBFdmVudCAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGF0dGVybi1zcXVhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmUgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgY29udGFpbmVyIGNsYXNzbmFtZVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdwYXR0ZXJuLXNxdWFyZSdcblxuXG4gICAjIFRoZSBET00gdGFnIGFuZW1cbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdGFnTmFtZTogJ3RkJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBUaGUgYXVkaW8gcGxheWJhY2sgaW5zdGFuY2UgKEhvd2xlcilcbiAgICMgQHR5cGUge0hvd2x9XG5cbiAgIGF1ZGlvUGxheWJhY2s6IG51bGxcblxuXG4gICAjIFRoZSBtb2RlbCB3aGljaCBjb250cm9scyB2b2x1bWUsIHBsYXliYWNrLCBldGNcbiAgICMgQHR5cGUge1BhdHRlcm5TcXVhcmVNb2RlbH1cblxuICAgcGF0dGVyblNxdWFyZU1vZGVsOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCc6ICdvbkNsaWNrJ1xuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGFuZCBpbnN0YW50aWF0ZXMgdGhlIGhvd2xlciBhdWRpbyBlbmdpbmVcbiAgICMgQHBhdHRlcm5TcXVhcmVNb2RlbCB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIGF1ZGlvU3JjID0gQHBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ2luc3RydW1lbnQnKS5nZXQgJ3NyYydcblxuICAgICAgIyBUT0RPOiBUZXN0IG1ldGhvZHNcbiAgICAgIGlmIHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Rlc3QnKSBpc250IC0xIHRoZW4gYXVkaW9TcmMgPSAnJ1xuXG4gICAgICBAYXVkaW9QbGF5YmFjayA9IG5ldyBIb3dsXG4gICAgICAgICB2b2x1bWU6IEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLmxvd1xuICAgICAgICAgdXJsczogW2F1ZGlvU3JjXVxuICAgICAgICAgb25lbmQ6IEBvblNvdW5kRW5kXG5cbiAgICAgIEBcblxuXG5cblxuICAgIyBSZW1vdmUgdGhlIHZpZXcgYW5kIGRlc3Ryb3kgdGhlIGF1ZGlvIHBsYXliYWNrXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIEBhdWRpb1BsYXliYWNrLnVubG9hZCgpXG4gICAgICBzdXBlcigpXG5cblxuXG5cbiAgICMgQWRkcyBldmVudCBsaXN0ZW5lcnMgYW5kIGJlZ2lucyBsaXN0ZW5pbmcgZm9yIHZlbG9jaXR5LCBhY3Rpdml0eSBhbmQgdHJpZ2dlcnNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1ZFTE9DSVRZLCBAb25WZWxvY2l0eUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9BQ1RJVkUsICAgQG9uQWN0aXZlQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1RSSUdHRVIsICBAb25UcmlnZ2VyQ2hhbmdlXG5cblxuXG5cbiAgICMgRW5hYmxlIHBsYXliYWNrIG9mIHRoZSBhdWRpbyBzcXVhcmVcblxuICAgZW5hYmxlOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5lbmFibGUoKVxuXG5cblxuXG4gICAjIERpc2FibGUgcGxheWJhY2sgb2YgdGhlIGF1ZGlvIHNxdWFyZVxuXG4gICBkaXNhYmxlOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5kaXNhYmxlKClcblxuXG5cblxuICAgIyBQbGF5YmFjayBhdWRpbyBvbiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgIHBsYXk6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjay5wbGF5KClcblxuICAgICAgVHdlZW5NYXgudG8gQCRlbCwgLjIsXG4gICAgICAgICBlYXNlOiBCYWNrLmVhc2VJblxuICAgICAgICAgc2NhbGU6IC41XG5cbiAgICAgICAgIG9uQ29tcGxldGU6ID0+XG5cbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEAkZWwsIC4yLFxuICAgICAgICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGNsaWNrIGV2ZW50cyBvbiB0aGUgYXVkaW8gc3F1YXJlLiAgVG9nZ2xlcyB0aGVcbiAgICMgdm9sdW1lIGZyb20gbG93IHRvIGhpZ2ggdG8gb2ZmXG5cbiAgIG9uQ2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuY3ljbGUoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHZlbG9jaXR5IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSB2aXN1YWwgZGlzcGxheSBhbmQgc2V0cyB2b2x1bWVcbiAgICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uVmVsb2NpdHlDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIHZlbG9jaXR5ID0gbW9kZWwuY2hhbmdlZC52ZWxvY2l0eVxuXG4gICAgICBAJGVsLnJlbW92ZUNsYXNzICd2ZWxvY2l0eS1sb3cgdmVsb2NpdHktbWVkaXVtIHZlbG9jaXR5LWhpZ2gnXG5cbiAgICAgICMgU2V0IHZpc3VhbCBpbmRpY2F0b3JcbiAgICAgIHZlbG9jaXR5Q2xhc3MgPSBzd2l0Y2ggdmVsb2NpdHlcbiAgICAgICAgIHdoZW4gMSB0aGVuICd2ZWxvY2l0eS1sb3cnXG4gICAgICAgICB3aGVuIDIgdGhlbiAndmVsb2NpdHktbWVkaXVtJ1xuICAgICAgICAgd2hlbiAzIHRoZW4gJ3ZlbG9jaXR5LWhpZ2gnXG4gICAgICAgICBlbHNlICcnXG5cbiAgICAgIEAkZWwuYWRkQ2xhc3MgdmVsb2NpdHlDbGFzc1xuXG5cbiAgICAgICMgU2V0IGF1ZGlvIHZvbHVtZVxuICAgICAgdm9sdW1lID0gc3dpdGNoIHZlbG9jaXR5XG4gICAgICAgICB3aGVuIDEgdGhlbiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5sb3dcbiAgICAgICAgIHdoZW4gMiB0aGVuIEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLm1lZGl1bVxuICAgICAgICAgd2hlbiAzIHRoZW4gQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMuaGlnaFxuICAgICAgICAgZWxzZSAnJ1xuXG4gICAgICBAYXVkaW9QbGF5YmFjay52b2x1bWUoIHZvbHVtZSApXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgYWN0aXZpdHkgY2hhbmdlIGV2ZW50cy4gIFdoZW4gaW5hY3RpdmUsIGNoZWNrcyBhZ2FpbnN0IHBsYXliYWNrIGFyZVxuICAgIyBub3QgcGVyZm9ybWVkIGFuZCB0aGUgc3F1YXJlIGlzIHNraXBwZWQuXG4gICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gICBvbkFjdGl2ZUNoYW5nZTogKG1vZGVsKSAtPlxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHRyaWdnZXIgXCJwbGF5YmFja1wiIGV2ZW50c1xuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25UcmlnZ2VyQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBpZiBtb2RlbC5jaGFuZ2VkLnRyaWdnZXIgaXMgdHJ1ZVxuICAgICAgICAgQHBsYXkoKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHNvdW5kIHBsYXliYWNrIGVuZCBldmVudHMuICBSZW1vdmVzIHRoZSB0cmlnZ2VyXG4gICAjIGZsYWcgc28gdGhlIGF1ZGlvIHdvbid0IG92ZXJsYXBcblxuICAgb25Tb3VuZEVuZDogPT5cbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlIiwiIyMjKlxuICogSW5kaXZpZHVhbCBzZXF1ZW5jZXIgdHJhY2tzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwRXZlbnQgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGF0dGVyblNxdWFyZSAgICAgICAgICAgPSByZXF1aXJlICcuL1BhdHRlcm5TcXVhcmUuY29mZmVlJ1xuVmlldyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3BhdHRlcm4tdHJhY2stdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFBhdHRlcm5UcmFjayBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBuYW1lIG9mIHRoZSBjbGFzc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdwYXR0ZXJuLXRyYWNrJ1xuXG5cbiAgICMgVGhlIHR5cGUgb2YgdGFnXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHRhZ05hbWU6ICd0cidcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgQSBjb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgdmlldyBzcXVhcmVzXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgcGF0dGVyblNxdWFyZVZpZXdzOiBudWxsXG5cblxuICAgIyBAdHlwZSB7UGF0dGVyblNxdWFyZUNvbGxlY3Rpb259XG4gICBjb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICAgbW9kZWw6IG51bGxcblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCAubGFiZWwtaW5zdHJ1bWVudCc6ICdvbkxhYmVsQ2xpY2snXG4gICAgICAndG91Y2hlbmQgLmJ0bi1tdXRlJzogICAgICAgICAnb25NdXRlQnRuQ2xpY2snXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBhbmQgcmVuZGVycyBvdXQgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXNcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRsYWJlbCA9IEAkZWwuZmluZCAnLmxhYmVsLWluc3RydW1lbnQnXG5cbiAgICAgIEByZW5kZXJQYXR0ZXJuU3F1YXJlcygpXG5cbiAgICAgIEBcblxuXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIF8uZWFjaCBAcGF0dGVyblNxdWFyZVZpZXdzLCAoc3F1YXJlKSA9PlxuICAgICAgICAgc3F1YXJlLnJlbW92ZSgpXG5cbiAgICAgIHN1cGVyKClcblxuXG5cblxuICAgIyBBZGQgbGlzdGVuZXJzIHRvIHRoZSB2aWV3IHdoaWNoIGxpc3RlbiBmb3IgdmlldyBjaGFuZ2VzXG4gICAjIGFzIHdlbGwgYXMgY2hhbmdlcyB0byB0aGUgY29sbGVjdGlvbiwgd2hpY2ggc2hvdWxkIHVwZGF0ZVxuICAgIyBwYXR0ZXJuIHNxdWFyZXMgd2l0aG91dCByZS1yZW5kZXJpbmcgdGhlIHZpZXdzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGtpdE1vZGVsID0gQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKVxuXG4gICAgICBAbGlzdGVuVG8gQG1vZGVsLCAgICBBcHBFdmVudC5DSEFOR0VfRk9DVVMsICAgICAgQG9uRm9jdXNDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsICAgIEFwcEV2ZW50LkNIQU5HRV9NVVRFLCAgICAgICBAb25NdXRlQ2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGtpdE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cblxuXG4gICAjIFJlbmRlciBvdXQgdGhlIHBhdHRlcm4gc3F1YXJlcyBhbmQgcHVzaCB0aGVtIGludG8gYW4gYXJyYXlcbiAgICMgZm9yIGZ1cnRoZXIgaXRlcmF0aW9uXG5cbiAgIHJlbmRlclBhdHRlcm5TcXVhcmVzOiAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVWaWV3cyA9IFtdXG5cbiAgICAgIEBjb2xsZWN0aW9uID0gbmV3IFBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uXG5cbiAgICAgIF8oOCkudGltZXMgPT5cbiAgICAgICAgIEBjb2xsZWN0aW9uLmFkZCBuZXcgUGF0dGVyblNxdWFyZU1vZGVsIHsgaW5zdHJ1bWVudDogQG1vZGVsIH1cblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAobW9kZWwpID0+XG4gICAgICAgICBwYXR0ZXJuU3F1YXJlID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgICAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbW9kZWxcblxuICAgICAgICAgQCRsYWJlbC50ZXh0IG1vZGVsLmdldCAnbGFiZWwnXG4gICAgICAgICBAJGVsLmFwcGVuZCBwYXR0ZXJuU3F1YXJlLnJlbmRlcigpLmVsXG4gICAgICAgICBAcGF0dGVyblNxdWFyZVZpZXdzLnB1c2ggcGF0dGVyblNxdWFyZVxuXG4gICAgICAjIFNldCB0aGUgc3F1YXJlcyBvbiB0aGUgSW5zdHJ1bWVudCBtb2RlbCB0byB0cmFjayBhZ2FpbnN0IHN0YXRlXG4gICAgICBAbW9kZWwuc2V0ICdwYXR0ZXJuU3F1YXJlcycsIEBjb2xsZWN0aW9uXG5cblxuXG4gICAjIE11dGUgdGhlIGVudGlyZSB0cmFja1xuXG4gICBtdXRlOiAtPlxuICAgICAgQG1vZGVsLnNldCAnbXV0ZScsIHRydWVcblxuXG5cbiAgICMgVW5tdXRlIHRoZSBlbnRpcmUgdHJhY2tcblxuICAgdW5tdXRlOiAtPlxuICAgICAgQG1vZGVsLnNldCAnbXV0ZScsIGZhbHNlXG5cblxuXG4gICBzZWxlY3Q6IC0+XG4gICAgICBAJGVsLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG5cbiAgIGRlc2VsZWN0OiAtPlxuICAgICAgaWYgQCRlbC5oYXNDbGFzcyAnc2VsZWN0ZWQnXG4gICAgICAgICBAJGVsLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcblxuXG5cbiAgIGZvY3VzOiAtPlxuICAgICAgQCRlbC5hZGRDbGFzcyAnZm9jdXMnXG5cblxuXG5cbiAgIHVuZm9jdXM6IC0+XG4gICAgICBpZiBAJGVsLmhhc0NsYXNzICdmb2N1cydcbiAgICAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgJ2ZvY3VzJ1xuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGNoYW5nZXMgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBpbnN0cnVtZW50XG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBpbnN0cnVtZW50TW9kZWxcblxuICAgb25JbnN0cnVtZW50Q2hhbmdlOiAoaW5zdHJ1bWVudE1vZGVsKSA9PlxuICAgICAgaW5zdHJ1bWVudCA9IGluc3RydW1lbnRNb2RlbC5jaGFuZ2VkLmN1cnJlbnRJbnN0cnVtZW50XG5cbiAgICAgIGlmIGluc3RydW1lbnQuY2lkIGlzIEBtb2RlbC5jaWRcbiAgICAgICAgIEBzZWxlY3QoKVxuXG4gICAgICBlbHNlIEBkZXNlbGVjdCgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBtb2RlbCBjaGFuZ2UgZXZlbnRzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbk11dGVDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIG11dGUgPSBtb2RlbC5jaGFuZ2VkLm11dGVcblxuICAgICAgaWYgbXV0ZVxuICAgICAgICAgQCRlbC5hZGRDbGFzcyAnbXV0ZSdcblxuICAgICAgZWxzZSBAJGVsLnJlbW92ZUNsYXNzICdtdXRlJ1xuXG5cblxuICAgIyBIYW5kbGVyIGZvciBmb2N1cyBjaGFuZ2UgZXZlbnRzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbkZvY3VzQ2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBpZiBtb2RlbC5jaGFuZ2VkLmZvY3VzXG4gICAgICAgICAgQGZvY3VzKClcbiAgICAgIGVsc2VcbiAgICAgICAgICBAdW5mb2N1cygpXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgYnV0dG9uIGNsaWNrc1xuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25MYWJlbENsaWNrOiAoZXZlbnQpID0+XG4gICAgICBpZiBAbW9kZWwuZ2V0KCdtdXRlJykgaXNudCB0cnVlXG4gICAgICAgICBAbW9kZWwuc2V0ICdmb2N1cycsICEgQG1vZGVsLmdldCgnZm9jdXMnKVxuXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBidXR0b24gY2xpY2tzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbk11dGVCdG5DbGljazogKGV2ZW50KSA9PlxuICAgICAgaWYgQG1vZGVsLmdldCAnbXV0ZSdcbiAgICAgICAgIEB1bm11dGUoKVxuXG4gICAgICBlbHNlIEBtdXRlKClcblxuXG5cblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5UcmFjayIsIiMjIypcbiAqIFNlcXVlbmNlciBwYXJlbnQgdmlldyBmb3IgdHJhY2sgc2VxdWVuY2VzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuUGF0dGVyblRyYWNrID0gcmVxdWlyZSAnLi9QYXR0ZXJuVHJhY2suY29mZmVlJ1xuQXBwRXZlbnQgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbmhlbHBlcnMgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2hlbHBlcnMvaGFuZGxlYmFycy1oZWxwZXJzJ1xudGVtcGxhdGUgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2VxdWVuY2VyLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBTZXF1ZW5jZXIgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgbmFtZSBvZiB0aGUgY29udGFpbmVyIGNsYXNzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3NlcXVlbmNlci1jb250YWluZXInXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIEFuIGFycmF5IG9mIGFsbCBwYXR0ZXJuIHRyYWNrc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBwYXR0ZXJuVHJhY2tWaWV3czogbnVsbFxuXG5cbiAgICMgVGhlIHNldEludGVydmFsIHRpY2tlclxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBicG1JbnRlcnZhbDogbnVsbFxuXG5cbiAgICMgVGhlIHRpbWUgaW4gd2hpY2ggdGhlIGludGVydmFsIGZpcmVzXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIHVwZGF0ZUludGVydmFsVGltZTogMjAwXG5cblxuICAgIyBUaGUgY3VycmVudCBiZWF0IGlkXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGN1cnJCZWF0Q2VsbElkOiAtMVxuXG5cbiAgICMgVE9ETzogVXBkYXRlIHRoaXMgdG8gbWFrZSBpdCBtb3JlIGR5bmFtaWNcbiAgICMgVGhlIG51bWJlciBvZiBiZWF0IGNlbGxzXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIG51bUNlbGxzOiA3XG5cblxuICAgIyBHbG9iYWwgYXBwbGljYXRpb24gbW9kZWxcbiAgICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gICBhcHBNb2RlbDogbnVsbFxuXG5cbiAgICMgQ29sbGVjdGlvbiBvZiBpbnN0cnVtZW50c1xuICAgIyBAdHlwZSB7SW5zdHJ1bWVudENvbGxlY3Rpb259XG5cbiAgIGNvbGxlY3Rpb246IG51bGxcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fVxuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJHRoU3RlcHBlciA9IEAkZWwuZmluZCAndGguc3RlcHBlcidcbiAgICAgIEAkc2VxdWVuY2VyID0gQCRlbC5maW5kICcuc2VxdWVuY2VyJ1xuXG4gICAgICBAcmVuZGVyVHJhY2tzKClcbiAgICAgIEBwbGF5KClcblxuICAgICAgQFxuXG5cbiAgICMgUmVtb3ZlcyB0aGUgdmlldyBmcm9tIHRoZSBET00gYW5kIGNhbmNlbHNcbiAgICMgdGhlIHRpY2tlciBpbnRlcnZhbFxuXG4gICByZW1vdmU6IC0+XG4gICAgICBfLmVhY2ggQHBhdHRlcm5UcmFja1ZpZXdzLCAodHJhY2spID0+XG4gICAgICAgICB0cmFjay5yZW1vdmUoKVxuXG4gICAgICBAcGF1c2UoKVxuXG4gICAgICBzdXBlcigpXG5cblxuXG4gICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRsaW5nIGluc3RydW1lbnQgYW5kIHBsYXliYWNrXG4gICAjIGNoYW5nZXMuICBVcGRhdGVzIGFsbCBvZiB0aGUgdmlld3MgYWNjb3JkaW5nbHlcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAgIEFwcEV2ZW50LkNIQU5HRV9CUE0sICAgICBAb25CUE1DaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsICAgQXBwRXZlbnQuQ0hBTkdFX1BMQVlJTkcsIEBvblBsYXlpbmdDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsICAgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgICAgIEBvbktpdENoYW5nZVxuICAgICAgQGxpc3RlblRvIEBjb2xsZWN0aW9uLCBBcHBFdmVudC5DSEFOR0VfRk9DVVMsICAgQG9uRm9jdXNDaGFuZ2VcblxuXG5cbiAgICMgUmVuZGVycyBvdXQgZWFjaCBpbmRpdmlkdWFsIHRyYWNrLlxuICAgIyBUT0RPOiBOZWVkIHRvIHVwZGF0ZSBzbyB0aGF0IGFsbCBvZiB0aGUgYmVhdCBzcXVhcmVzIGFyZW4ndFxuICAgIyBibG93biBhd2F5IGJ5IHRoZSByZS1yZW5kZXJcblxuICAgcmVuZGVyVHJhY2tzOiA9PlxuICAgICAgQCRlbC5maW5kKCcucGF0dGVybi10cmFjaycpLnJlbW92ZSgpXG5cbiAgICAgIEBwYXR0ZXJuVHJhY2tWaWV3cyA9IFtdXG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKG1vZGVsKSA9PlxuXG4gICAgICAgICBwYXR0ZXJuVHJhY2sgPSBuZXcgUGF0dGVyblRyYWNrXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBtb2RlbC5nZXQgJ3BhdHRlcm5TcXVhcmVzJ1xuICAgICAgICAgICAgbW9kZWw6IG1vZGVsXG5cbiAgICAgICAgIEBwYXR0ZXJuVHJhY2tWaWV3cy5wdXNoIHBhdHRlcm5UcmFja1xuICAgICAgICAgQCRzZXF1ZW5jZXIuYXBwZW5kIHBhdHRlcm5UcmFjay5yZW5kZXIoKS5lbFxuXG5cblxuXG4gICAjIFVwZGF0ZSB0aGUgdGlja2VyIHRpbWUsIGFuZCBhZHZhbmNlcyB0aGUgYmVhdFxuXG4gICB1cGRhdGVUaW1lOiA9PlxuICAgICAgQCR0aFN0ZXBwZXIucmVtb3ZlQ2xhc3MgJ3N0ZXAnXG4gICAgICBAY3VyckJlYXRDZWxsSWQgPSBpZiBAY3VyckJlYXRDZWxsSWQgPCBAbnVtQ2VsbHMgdGhlbiBAY3VyckJlYXRDZWxsSWQgKz0gMSBlbHNlIEBjdXJyQmVhdENlbGxJZCA9IDBcbiAgICAgICQoQCR0aFN0ZXBwZXJbQGN1cnJCZWF0Q2VsbElkXSkuYWRkQ2xhc3MgJ3N0ZXAnXG5cbiAgICAgIEBwbGF5QXVkaW8oKVxuXG5cblxuXG4gICAjIENvbnZlcnRzIG1pbGxpc2Vjb25kcyB0byBCUE1cblxuICAgY29udmVydEJQTTogLT5cbiAgICAgIHJldHVybiAyMDBcblxuXG5cbiAgICMgU3RhcnQgcGxheWJhY2sgb2Ygc2VxdWVuY2VyXG5cbiAgIHBsYXk6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgdHJ1ZVxuXG5cblxuXG4gICAjIFBhdXNlcyBzZXF1ZW5jZXIgcGxheWJhY2tcblxuICAgcGF1c2U6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgZmFsc2VcblxuXG5cblxuICAgIyBNdXRlcyB0aGUgc2VxdWVuY2VyXG5cbiAgIG11dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdtdXRlJywgdHJ1ZVxuXG5cblxuXG4gICAjIFVubXV0ZXMgdGhlIHNlcXVlbmNlclxuXG4gICB1bm11dGU6IC0+XG4gICAgICAgQGFwcE1vZGVsLnNldCAnbXV0ZScsIGZhbHNlXG5cblxuXG5cblxuICAgIyBQbGF5cyBhdWRpbyBvZiBlYWNoIHRyYWNrIGN1cnJlbnRseSBlbmFibGVkIGFuZCBvblxuXG4gICBwbGF5QXVkaW86IC0+XG4gICAgICBmb2N1c2VkSW5zdHJ1bWVudCA9ICBAY29sbGVjdGlvbi5maW5kV2hlcmUgeyBmb2N1czogdHJ1ZSB9XG5cbiAgICAgICMgQ2hlY2sgaWYgdGhlcmUncyBhIGZvY3VzZWQgdHJhY2sgYW5kIG9ubHlcbiAgICAgICMgcGxheSBhdWRpbyBmcm9tIHRoZXJlXG5cbiAgICAgIGlmIGZvY3VzZWRJbnN0cnVtZW50XG4gICAgICAgICBpZiBmb2N1c2VkSW5zdHJ1bWVudC5nZXQoJ211dGUnKSBpc250IHRydWVcbiAgICAgICAgICAgIGZvY3VzZWRJbnN0cnVtZW50LmdldCgncGF0dGVyblNxdWFyZXMnKS5lYWNoIChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgPT5cbiAgICAgICAgICAgICAgIEBwbGF5UGF0dGVyblNxdWFyZUF1ZGlvKCBwYXR0ZXJuU3F1YXJlLCBpbmRleCApXG5cbiAgICAgICAgIHJldHVyblxuXG5cbiAgICAgICMgSWYgbm90aGluZyBpcyBmb2N1c2VkLCB0aGVuIGNoZWNrIGFnYWluc3RcbiAgICAgICMgdGhlIGVudGlyZSBtYXRyaXhcblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgICAgIGlmIGluc3RydW1lbnQuZ2V0KCdtdXRlJykgaXNudCB0cnVlXG4gICAgICAgICAgICBpbnN0cnVtZW50LmdldCgncGF0dGVyblNxdWFyZXMnKS5lYWNoIChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgPT5cbiAgICAgICAgICAgICAgIEBwbGF5UGF0dGVyblNxdWFyZUF1ZGlvKCBwYXR0ZXJuU3F1YXJlLCBpbmRleCApXG5cblxuXG5cbiAgICMgUGxheXMgdGhlIGF1ZGlvIG9uIGFuIGluZGl2aWR1YWwgUGF0dGVyU3F1YXJlIGlmIHRlbXBvIGluZGV4XG4gICAjIGlzIHRoZSBzYW1lIGFzIHRoZSBpbmRleCB3aXRoaW4gdGhlIGNvbGxlY3Rpb25cbiAgICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlfSBwYXR0ZXJuU3F1YXJlXG4gICAjIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuXG4gICBwbGF5UGF0dGVyblNxdWFyZUF1ZGlvOiAocGF0dGVyblNxdWFyZSwgaW5kZXgpIC0+XG4gICAgICBpZiBAY3VyckJlYXRDZWxsSWQgaXMgaW5kZXhcbiAgICAgICAgIGlmIHBhdHRlcm5TcXVhcmUuZ2V0ICdhY3RpdmUnXG4gICAgICAgICAgICBwYXR0ZXJuU3F1YXJlLnNldCAndHJpZ2dlcicsIHRydWVcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBCUE0gdGVtcG8gY2hhbmdlc1xuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvbkJQTUNoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgY2xlYXJJbnRlcnZhbCBAYnBtSW50ZXJ2YWxcbiAgICAgIEB1cGRhdGVJbnRlcnZhbFRpbWUgPSBtb2RlbC5jaGFuZ2VkLmJwbVxuICAgICAgQGJwbUludGVydmFsID0gc2V0SW50ZXJ2YWwgQHVwZGF0ZVRpbWUsIEB1cGRhdGVJbnRlcnZhbFRpbWVcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBwbGF5YmFjayBjaGFuZ2VzLiAgSWYgcGF1c2VkLCBpdCBzdG9wcyBwbGF5YmFjayBhbmRcbiAgICMgY2xlYXJzIHRoZSBpbnRlcnZhbC4gIElmIHBsYXlpbmcsIGl0IHJlc2V0cyBpdFxuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvblBsYXlpbmdDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIHBsYXlpbmcgPSBtb2RlbC5jaGFuZ2VkLnBsYXlpbmdcblxuICAgICAgaWYgcGxheWluZ1xuICAgICAgICAgQGJwbUludGVydmFsID0gc2V0SW50ZXJ2YWwgQHVwZGF0ZVRpbWUsIEB1cGRhdGVJbnRlcnZhbFRpbWVcblxuICAgICAgZWxzZVxuICAgICAgICAgY2xlYXJJbnRlcnZhbCBAYnBtSW50ZXJ2YWxcbiAgICAgICAgIEBicG1JbnRlcnZhbCA9IG51bGxcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtdXRlIGFuZCB1bm11dGUgY2hhbmdlc1xuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvbk11dGVDaGFuZ2U6IChtb2RlbCkgPT5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlcywgYXMgc2V0IGZyb20gdGhlIEtpdFNlbGVjdG9yXG4gICAjIEBwYXJhbSB7S2l0TW9kZWx9IG1vZGVsXG5cbiAgIG9uS2l0Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAY29sbGVjdGlvbiA9IG1vZGVsLmNoYW5nZWQua2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpXG4gICAgICBAcmVuZGVyVHJhY2tzKClcblxuICAgICAgIyBFeHBvcnQgb2xkIHBhdHRlcm4gc3F1YXJlcyBzbyB0aGUgdXNlcnMgcGF0dGVybiBpc24ndCBibG93biBhd2F5XG4gICAgICAjIHdoZW4ga2l0IGNoYW5nZXMgb2NjdXJcblxuICAgICAgb2xkSW5zdHJ1bWVudENvbGxlY3Rpb24gPSBtb2RlbC5fcHJldmlvdXNBdHRyaWJ1dGVzLmtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKVxuICAgICAgb2xkUGF0dGVyblNxdWFyZXMgPSBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbi5leHBvcnRQYXR0ZXJuU3F1YXJlcygpXG5cblxuICAgICAgIyBVcGRhdGUgdGhlIG5ldyBjb2xsZWN0aW9uIHdpdGggb2xkIHBhdHRlcm4gc3F1YXJlIGRhdGFcbiAgICAgICMgYW5kIHRyaWdnZXIgVUkgdXBkYXRlcyBvbiBlYWNoIHNxdWFyZVxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChpbnN0cnVtZW50TW9kZWwsIGluZGV4KSAtPlxuICAgICAgICAgb2xkQ29sbGVjdGlvbiA9IG9sZFBhdHRlcm5TcXVhcmVzW2luZGV4XVxuICAgICAgICAgbmV3Q29sbGVjdGlvbiA9IGluc3RydW1lbnRNb2RlbC5nZXQgJ3BhdHRlcm5TcXVhcmVzJ1xuXG4gICAgICAgICAjIFVwZGF0ZSB0cmFjayAvIGluc3RydW1lbnQgbGV2ZWwgcHJvcGVydGllcyBsaWtlIHZvbHVtZSAvIG11dGUgLyBmb2N1c1xuICAgICAgICAgb2xkUHJvcHMgPSBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbi5hdChpbmRleClcblxuICAgICAgICAgdW5sZXNzIG9sZFByb3BzIGlzIHVuZGVmaW5lZFxuXG4gICAgICAgICAgICBvbGRQcm9wcyA9IG9sZFByb3BzLnRvSlNPTigpXG5cbiAgICAgICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICAgICAgIHZvbHVtZTogb2xkUHJvcHMudm9sdW1lXG4gICAgICAgICAgICAgICBhY3RpdmU6IG9sZFByb3BzLmFjdGl2ZVxuICAgICAgICAgICAgICAgbXV0ZTogICBvbGRQcm9wcy5tdXRlXG4gICAgICAgICAgICAgICBmb2N1czogIG9sZFByb3BzLmZvY3VzXG5cbiAgICAgICAgICMgQ2hlY2sgZm9yIGluY29uc2lzdGFuY2llcyBiZXR3ZWVuIG51bWJlciBvZiBpbnN0cnVtZW50c1xuICAgICAgICAgdW5sZXNzIG9sZENvbGxlY3Rpb24gaXMgdW5kZWZpbmVkXG5cbiAgICAgICAgICAgIG5ld0NvbGxlY3Rpb24uZWFjaCAocGF0dGVyblNxdWFyZSwgaW5kZXgpIC0+XG4gICAgICAgICAgICAgICBvbGRQYXR0ZXJuU3F1YXJlID0gb2xkQ29sbGVjdGlvbi5hdCBpbmRleFxuICAgICAgICAgICAgICAgcGF0dGVyblNxdWFyZS5zZXQgb2xkUGF0dGVyblNxdWFyZS50b0pTT04oKVxuXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBmb2N1cyBjaGFuZ2UgZXZlbnRzLiAgSXRlcmF0ZXMgb3ZlciBhbGwgb2YgdGhlIG1vZGVscyB3aXRoaW5cbiAgICMgdGhlIEluc3RydW1lbnRDb2xsZWN0aW9uIGFuZCB0b2dnbGVzIHRoZWlyIGZvY3VzIHRvIG9mZiBpZiB0aGUgY2hhbmdlZFxuICAgIyBtb2RlbCdzIGZvY3VzIGlzIHNldCB0byB0cnVlLlxuICAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICAgb25Gb2N1c0NoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAoaW5zdHJ1bWVudE1vZGVsKSA9PlxuICAgICAgICAgaWYgbW9kZWwuY2hhbmdlZC5mb2N1cyBpcyB0cnVlXG4gICAgICAgICAgICBpZiBtb2RlbC5jaWQgaXNudCBpbnN0cnVtZW50TW9kZWwuY2lkXG4gICAgICAgICAgICAgICBpbnN0cnVtZW50TW9kZWwuc2V0ICdmb2N1cycsIGZhbHNlXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VxdWVuY2VyIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCI7XG5cblxuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG5cbiAgYnVmZmVyICs9IFwiPHRkIGNsYXNzPSdsYWJlbC1pbnN0cnVtZW50Jz5cXG5cdFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxuPC90ZD5cXG48dGQgY2xhc3M9J2J0bi1tdXRlJz5cXG5cdG11dGVcXG48L3RkPlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIHN0YWNrMiwgb3B0aW9ucywgc2VsZj10aGlzLCBoZWxwZXJNaXNzaW5nPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJcXG5cdFx0XHQ8dGggY2xhc3M9J3N0ZXBwZXInPjwvdGg+XFxuXHRcdFwiO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPHRhYmxlIGNsYXNzPSdzZXF1ZW5jZXInPlxcblx0PHRyPlxcblx0XHQ8dGg+PC90aD5cXG5cdFx0PHRoPjwvdGg+XFxuXFxuXHRcdFwiO1xuICBvcHRpb25zID0ge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9O1xuICBzdGFjazIgPSAoKHN0YWNrMSA9IGhlbHBlcnMucmVwZWF0IHx8IGRlcHRoMC5yZXBlYXQpLHN0YWNrMSA/IHN0YWNrMS5jYWxsKGRlcHRoMCwgOCwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcInJlcGVhdFwiLCA4LCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMiB8fCBzdGFjazIgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMjsgfVxuICBidWZmZXIgKz0gXCJcXG5cdDwvdHI+XFxuXFxuPC90YWJsZT5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxidXR0b24gY2xhc3M9J2J0bi1kZWNyZWFzZSc+REVDUkVBU0U8L2J1dHRvbj5cXG48c3BhbiBjbGFzcz0nbGFiZWwtYnBtJz4wPC9zcGFuPlxcbjxidXR0b24gY2xhc3M9J2J0bi1pbmNyZWFzZSc+SU5DUkVBU0U8L2J1dHRvbj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxidXR0b24gY2xhc3M9J2J0bi1sZWZ0Jz5MRUZUPC9idXR0b24+XFxuPHNwYW4gY2xhc3M9J2xhYmVsLWtpdCc+RFJVTSBLSVQ8L3NwYW4+XFxuPGJ1dHRvbiBjbGFzcz0nYnRuLXJpZ2h0Jz5SSUdIVDwvYnV0dG9uPlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0nY29udGFpbmVyLWtpdC1zZWxlY3Rvcic+XFxuXHQ8ZGl2IGNsYXNzPSdraXQtc2VsZWN0b3InPjwvZGl2PlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci12aXN1YWxpemF0aW9uJz5WaXN1YWxpemF0aW9uPC9kaXY+XFxuXFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLXNlcXVlbmNlcic+XFxuXFxuXHQ8ZGl2IGNsYXNzPSdpbnN0cnVtZW50LXNlbGVjdG9yJz5JbnN0cnVtZW50IFNlbGVjdG9yPC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPSdzZXF1ZW5jZXInPlNlcXVlbmNlcjwvZGl2Plxcblx0PGRpdiBjbGFzcz0nYnBtJz5CUE08L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J2J0bi1zaGFyZSc+U0hBUkU8L2Rpdj5cXG5cXG48L2Rpdj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuUHViU3ViICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9QdWJTdWInXG5QdWJFdmVudCA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvbGFuZGluZy10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgTGFuZGluZ1ZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5zdGFydC1idG4nOiAnb25TdGFydEJ0bkNsaWNrJ1xuXG5cbiAgIG9uU3RhcnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgUHViU3ViLnRyaWdnZXIgUHViRXZlbnQuUk9VVEUsXG4gICAgICAgICByb3V0ZTogJ2NyZWF0ZSdcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGFuZGluZ1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxzcGFuIGNsYXNzPSdzdGFydC1idG4nPkNSRUFURTwvc3Bhbj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBTaGFyZSB0aGUgdXNlciBjcmVhdGVkIGJlYXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2hhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFNoYXJlVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlVmlldyIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGEgaHJlZj0nLyMnPk5FVzwvYT5cIjtcbiAgfSkiLCIjIyMqXG4gKiBMYW5kaW5nIHZpZXcgd2l0aCBzdGFydCBidXR0b24gYW5kIGluaXRpYWwgYW5pbWF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVzdHMtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFRlc3RzVmlldyBleHRlbmRzIFZpZXdcblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0c1ZpZXciLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxoMT5Db21wb25lbnQgVmlld2VyPC9oMT5cXG5cXG48YnIgLz5cXG48cD5cXG5cdE1ha2Ugc3VyZSB0aGF0IDxiPmh0dHBzdGVyPC9iPiBpcyBydW5uaW5nIGluIHRoZSA8Yj5zb3VyY2U8L2I+IHJvdXRlIChucG0gaW5zdGFsbCAtZyBodHRwc3RlcikgPGJyLz5cXG5cdDxhIGhyZWY9XFxcImh0dHA6Ly9sb2NhbGhvc3Q6MzMzMy90ZXN0L2h0bWwvXFxcIj5Nb2NoYSBUZXN0IFJ1bm5lcjwvYT5cXG48L3A+XFxuXFxuPGJyIC8+XFxuPHVsPlxcblx0PGxpPjxhIGhyZWY9JyNraXQtc2VsZWN0aW9uJz5LaXQgU2VsZWN0aW9uPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2JwbS1pbmRpY2F0b3JcXFwiPkJQTSBJbmRpY2F0b3I8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjaW5zdHJ1bWVudC1zZWxlY3RvclxcXCI+SW5zdHJ1bWVudCBTZWxlY3RvcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNwYXR0ZXJuLXNxdWFyZVxcXCI+UGF0dGVybiBTcXVhcmU8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjcGF0dGVybi10cmFja1xcXCI+UGF0dGVybiBUcmFjazwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNzZXF1ZW5jZXJcXFwiPlNlcXVlbmNlcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNmdWxsLXNlcXVlbmNlclxcXCI+RnVsbCBTZXF1ZW5jZXI8L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjcGFkLXNxdWFyZVxcXCI+UGFkIFNxdWFyZTwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNsaXZlLXBhZFxcXCI+TGl2ZVBhZDwvYT48L2xpPlxcbjwvdWw+XCI7XG4gIH0pIiwiXG5kZXNjcmliZSAnTW9kZWxzJywgPT5cblxuICAgcmVxdWlyZSAnLi9zcGVjL21vZGVscy9LaXRDb2xsZWN0aW9uLXNwZWMuY29mZmVlJ1xuICAgcmVxdWlyZSAnLi9zcGVjL21vZGVscy9LaXRNb2RlbC1zcGVjLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnVmlld3MnLCA9PlxuXG4gICByZXF1aXJlICcuL3NwZWMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy1zcGVjLmNvZmZlZSdcbiAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci1zcGVjLmNvZmZlZSdcbiAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3Itc3BlYy5jb2ZmZWUnXG5cblxuICAgZGVzY3JpYmUgJ0xpdmUgUGFkJywgPT5cblxuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUtc3BlYy5jb2ZmZWUnXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL0xpdmVQYWQtc3BlYy5jb2ZmZWUnXG5cblxuICAgZGVzY3JpYmUgJ0luc3RydW1lbnQgU2VsZWN0b3InLCA9PlxuXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwtc3BlYy5jb2ZmZWUnXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC1zcGVjLmNvZmZlZSdcblxuXG4gICBkZXNjcmliZSAnU2VxdWVuY2VyJywgPT5cblxuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLXNwZWMuY29mZmVlJ1xuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2stc3BlYy5jb2ZmZWUnXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci1zcGVjLmNvZmZlZSdcblxuXG5cbnJlcXVpcmUgJy4vc3BlYy92aWV3cy9zaGFyZS9TaGFyZVZpZXctc3BlYy5jb2ZmZWUnXG5yZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXctc3BlYy5jb2ZmZWUnXG5cbnJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvU291bmRDb2xsZWN0aW9uLXNwZWMuY29mZmVlJ1xucmVxdWlyZSAnLi9zcGVjL21vZGVscy9Tb3VuZE1vZGVsLXNwZWMuY29mZmVlJ1xuXG4jIENvbnRyb2xsZXJzXG5yZXF1aXJlICcuL3NwZWMvQXBwQ29udHJvbGxlci1zcGVjLmNvZmZlZSdcbiIsIkFwcENvbnRyb2xsZXIgPSByZXF1aXJlICcuLi8uLi9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnQXBwIENvbnRyb2xsZXInLCAtPlxuXG4gICBpdCAnU2hvdWxkIGluaXRpYWxpemUnLCA9PiIsIkFwcENvbmZpZyAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblxuZGVzY3JpYmUgJ0tpdCBDb2xsZWN0aW9uJywgLT5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuXG4gICBpdCAnU2hvdWxkIHBhcnNlIHRoZSByZXNwb25zZSBhbmQgYXBwZW5kIGFuIGFzc2V0UGF0aCB0byBlYWNoIGtpdCBtb2RlbCcsID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ3BhdGgnKS5zaG91bGQuZXhpc3RcblxuXG4gICBpdCAnU2hvdWxkIHJldHVybiB0aGUgbmV4dCBraXQnLCA9PlxuICAgICAga2l0RGF0YSA9IEBraXRDb2xsZWN0aW9uLnRvSlNPTigpXG4gICAgICBraXQgPSBAa2l0Q29sbGVjdGlvbi5uZXh0S2l0KClcbiAgICAgIGtpdC5nZXQoJ2xhYmVsJykuc2hvdWxkLmVxdWFsIGtpdERhdGFbMV0ubGFiZWxcblxuXG4gICBpdCAnU2hvdWxkIHJldHVybiB0aGUgcHJldmlvdXMga2l0JywgPT5cbiAgICAgIGtpdERhdGEgPSBAa2l0Q29sbGVjdGlvbi50b0pTT04oKVxuICAgICAga2l0ID0gQGtpdENvbGxlY3Rpb24ucHJldmlvdXNLaXQoKVxuICAgICAga2l0LmdldCgnbGFiZWwnKS5zaG91bGQuZXF1YWwga2l0RGF0YVtraXREYXRhLmxlbmd0aC0xXS5sYWJlbCIsIkFwcENvbmZpZyAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdE1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRNb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlJ1xuXG5kZXNjcmliZSAnS2l0IE1vZGVsJywgLT5cblxuICAgYmVmb3JlRWFjaCA9PlxuXG4gICAgICBkYXRhID0ge1xuICAgICAgICAgXCJsYWJlbFwiOiBcIkhpcCBIb3BcIixcbiAgICAgICAgIFwiZm9sZGVyXCI6IFwiaGlwLWhvcFwiLFxuICAgICAgICAgXCJpbnN0cnVtZW50c1wiOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiQ2xvc2VkIEhpSGF0XCIsXG4gICAgICAgICAgICAgICBcInNyY1wiOiBcIkhBVF8yLm1wM1wiLFxuICAgICAgICAgICAgICAgXCJpY29uXCI6IFwiaWNvbi1oaWhhdC1jbG9zZWRcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJLaWNrIERydW1cIixcbiAgICAgICAgICAgICAgIFwic3JjXCI6IFwiS0lLXzIubXAzXCIsXG4gICAgICAgICAgICAgICBcImljb25cIjogXCJpY29uLWtpY2tkcnVtXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgIF1cbiAgICAgIH1cblxuICAgICAgQGtpdE1vZGVsID0gbmV3IEtpdE1vZGVsIGRhdGEsIHsgcGFyc2U6IHRydWUgfVxuXG5cbiAgIGl0ICdTaG91bGQgcGFyc2UgdGhlIG1vZGVsIGRhdGEgYW5kIGNvbnZlcnQgaW5zdHJ1bWVudHMgdG8gYW4gSW5zdHJ1bWVudHNDb2xsZWN0aW9uJywgPT5cbiAgICAgIEBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuc2hvdWxkLmJlLmFuLmluc3RhbmNlb2YgSW5zdHJ1bWVudENvbGxlY3Rpb24iLCJcblxuZGVzY3JpYmUgJ1NvdW5kIENvbGxlY3Rpb24nLCAtPlxuXG4gICBpdCAnU2hvdWxkIGluaXRpYWxpemUgd2l0aCBhIHNvdW5kIHNldCcsID0+IiwiXG5cbmRlc2NyaWJlICdTb3VuZCBNb2RlbCcsIC0+XG5cbiAgIGl0ICdTaG91bGQgaW5pdGlhbGl6ZSB3aXRoIGRlZmF1bHQgY29uZmlnIHByb3BlcnRpZXMnLCA9PiIsIkFwcENvbmZpZyA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuQ3JlYXRlVmlldyA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0NyZWF0ZSBWaWV3JywgLT5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEB2aWV3ICA9IG5ldyBDcmVhdGVWaWV3XG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBleHBlY3QoQHZpZXcuZWwpLnRvLmV4aXN0IiwiQlBNSW5kaWNhdG9yID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSdcbkFwcE1vZGVsICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5BcHBFdmVudCAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuQXBwQ29uZmlnICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5cbmRlc2NyaWJlICdCUE0gSW5kaWNhdG9yJywgLT5cblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBuZXcgQXBwTW9kZWwoKVxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgaWYgQHZpZXcudXBkYXRlSW50ZXJ2YWwgdGhlbiBjbGVhckludGVydmFsIEB2aWV3LnVwZGF0ZUludGVydmFsXG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuXG4gICAgICBAdmlldy5zaG91bGQuZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgZGlzcGxheSB0aGUgY3VycmVudCBCUE0gaW4gdGhlIGxhYmVsJywgPT5cblxuICAgICAgJGxhYmVsID0gQHZpZXcuJGVsLmZpbmQgJy5sYWJlbC1icG0nXG4gICAgICAkbGFiZWwudGV4dCgpLnNob3VsZC5lcXVhbCBTdHJpbmcoNjAwMDAgLyBAdmlldy5hcHBNb2RlbC5nZXQoJ2JwbScpKVxuXG5cblxuICAgIyBpdCAnU2hvdWxkIGF1dG8tYWR2YW5jZSB0aGUgYnBtIHZpYSBzZXRJbnRlcnZhbCBvbiBwcmVzcycsIChkb25lKSA9PlxuXG4gICAjICAgIEB2aWV3LmJwbUluY3JlYXNlQW1vdW50ID0gNTBcbiAgICMgICAgQHZpZXcuaW50ZXJ2YWxVcGRhdGVUaW1lID0gMVxuICAgIyAgICBhcHBNb2RlbCA9IEB2aWV3LmFwcE1vZGVsXG4gICAjICAgIGFwcE1vZGVsLnNldCAnYnBtJywgMVxuXG4gICAjICAgIHNldFRpbWVvdXQgPT5cbiAgICMgICAgICAgYnBtID0gYXBwTW9kZWwuZ2V0ICdicG0nXG5cbiAgICMgICAgICAgaWYgYnBtID49IDEyMFxuICAgIyAgICAgICAgICBAdmlldy5vbkJ0blVwKClcbiAgICMgICAgICAgICAgZG9uZSgpXG4gICAjICAgICwgMTAwXG5cbiAgICMgICAgQHZpZXcub25JbmNyZWFzZUJ0bkRvd24oKVxuXG5cblxuICAgIyBpdCAnU2hvdWxkIGNsZWFyIHRoZSBpbnRlcnZhbCBvbiByZWxlYXNlJywgPT5cblxuICAgIyAgICBAdmlldy5vbkluY3JlYXNlQnRuRG93bigpXG4gICAjICAgIEB2aWV3LnVwZGF0ZUludGVydmFsLnNob3VsZC5leGlzdFxuICAgIyAgICBAdmlldy5vbkJ0blVwKClcbiAgICMgICAgZXhwZWN0KEB2aWV3LnVwZGF0ZUludGVydmFsKS50by5iZS5udWxsXG5cbiIsIkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0U2VsZWN0b3IgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSdcbkFwcE1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0TW9kZWwgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnS2l0IFNlbGVjdGlvbicsIC0+XG5cblxuICAgYmVmb3JlID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuXG4gICBiZWZvcmVFYWNoID0+XG5cbiAgICAgIEB2aWV3ID0gbmV3IEtpdFNlbGVjdG9yXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuXG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuXG5cbiAgIGl0ICdTaG91bGQgaGF2ZSBhIGxhYmVsJywgPT5cblxuICAgICAgJGxhYmVsID0gQHZpZXcuJGVsLmZpbmQgJy5sYWJlbC1raXQnXG4gICAgICAkbGFiZWwuc2hvdWxkLmV4aXN0XG5cblxuXG5cbiAgIGl0ICdTaG91bGQgdXBkYXRlIHRoZSBBcHBNb2RlbCBhIGtpdCBpcyBjaGFuZ2VkJywgPT5cblxuICAgICAgJGxhYmVsID0gQHZpZXcuJGVsLmZpbmQgJy5sYWJlbC1raXQnXG4gICAgICBmaXJzdExhYmVsID0gQHZpZXcua2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQgJ2xhYmVsJ1xuICAgICAgbGFzdExhYmVsICA9IEB2aWV3LmtpdENvbGxlY3Rpb24uYXQoQHZpZXcua2l0Q29sbGVjdGlvbi5sZW5ndGgtMSkuZ2V0ICdsYWJlbCdcblxuICAgICAgYXBwTW9kZWwgPSBAdmlldy5hcHBNb2RlbFxuXG4gICAgICBhcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmtpdE1vZGVsJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcub25MZWZ0QnRuQ2xpY2soKVxuICAgICAgICAgJGxhYmVsLnRleHQoKS5zaG91bGQuZXF1YWwgbGFzdExhYmVsXG5cbiAgICAgIGFwcE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6a2l0TW9kZWwnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5vblJpZ2h0QnRuQ2xpY2soKVxuICAgICAgICAgJGxhYmVsLnRleHQoKS5zaG91bGQuZXF1YWwgZmlyc3RMYWJlbFxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuIiwiSW5zdHJ1bWVudCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50LmNvZmZlZSdcbktpdE1vZGVsICAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdJbnN0cnVtZW50JywgLT5cblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBJbnN0cnVtZW50XG4gICAgICAgICBraXRNb2RlbDogbmV3IEtpdE1vZGVsKClcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy5zaG91bGQuZXhpc3RcblxuXG4gICBpdCAnU2hvdWxkIGFsbG93IHVzZXIgdG8gc2VsZWN0IGluc3RydW1lbnRzJywgPT5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgZXhwZWN0KEB2aWV3LiRlbC5oYXNDbGFzcygnc2VsZWN0ZWQnKSkudG8uYmUudHJ1ZSIsIkluc3RydW1lbnRTZWxlY3RvclBhbmVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLmNvZmZlZSdcbkFwcENvbmZpZyAgICAgICAgICAgICAgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiAgICAgICAgICAgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdJbnN0cnVtZW50IFNlbGVjdGlvbiBQYW5lbCcsIC0+XG5cblxuICAgYmVmb3JlID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbCgpXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIEB2aWV3LnNob3VsZC5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCByZWZlciB0byB0aGUgY3VycmVudCBLaXRNb2RlbCB3aGVuIGluc3RhbnRpYXRpbmcgc291bmRzJywgPT5cblxuICAgICAgZXhwZWN0KEB2aWV3LmtpdE1vZGVsKS50by5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCBpdGVyYXRlIG92ZXIgYWxsIG9mIHRoZSBzb3VuZHMgaW4gdGhlIFNvdW5kQ29sbGVjdGlvbiB0byBidWlsZCBvdXQgaW5zdHJ1bWVudHMnLCA9PlxuXG4gICAgICBAdmlldy5raXRNb2RlbC50b0pTT04oKS5pbnN0cnVtZW50cy5sZW5ndGguc2hvdWxkLmJlLmFib3ZlKDApXG5cbiAgICAgICRpbnN0cnVtZW50cyA9IEB2aWV3LiRlbC5maW5kKCcuY29udGFpbmVyLWluc3RydW1lbnRzJykuZmluZCgnLmluc3RydW1lbnQnKVxuICAgICAgJGluc3RydW1lbnRzLmxlbmd0aC5zaG91bGQuYmUuYWJvdmUoMClcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVidWlsZCB2aWV3IHdoZW4gdGhlIGtpdE1vZGVsIGNoYW5nZXMnLCA9PlxuXG4gICAgICBraXRNb2RlbCA9IEB2aWV3LmFwcE1vZGVsLmdldCAna2l0TW9kZWwnXG4gICAgICBsZW5ndGggPSBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykudG9KU09OKCkubGVuZ3RoXG5cbiAgICAgICRpbnN0cnVtZW50cyA9IEB2aWV3LiRlbC5maW5kKCcuY29udGFpbmVyLWluc3RydW1lbnRzJykuZmluZCgnLmluc3RydW1lbnQnKVxuICAgICAgJGluc3RydW1lbnRzLmxlbmd0aC5zaG91bGQuYmUuZXF1YWwobGVuZ3RoKVxuXG4gICAgICBAdmlldy5hcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG5cbiAgICAgIGtpdE1vZGVsID0gQHZpZXcuYXBwTW9kZWwuZ2V0ICdraXRNb2RlbCdcbiAgICAgIGxlbmd0aCA9IGtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKS50b0pTT04oKS5sZW5ndGhcblxuICAgICAgJGluc3RydW1lbnRzID0gQHZpZXcuJGVsLmZpbmQoJy5jb250YWluZXItaW5zdHJ1bWVudHMnKS5maW5kKCcuaW5zdHJ1bWVudCcpXG4gICAgICAkaW5zdHJ1bWVudHMubGVuZ3RoLnNob3VsZC5iZS5lcXVhbChsZW5ndGgpXG5cblxuXG4gICBpdCAnU2hvdWxkIGxpc3RlbiBmb3Igc2VsZWN0aW9ucyBmcm9tIEluc3RydW1lbnQgaW5zdGFuY2VzIGFuZCB1cGRhdGUgdGhlIG1vZGVsJywgPT5cblxuICAgICAgQHZpZXcua2l0TW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpjdXJyZW50SW5zdHJ1bWVudCcpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lmluc3RydW1lbnRWaWV3c1swXS5vbkNsaWNrKClcblxuICAgICAgICAgJHNlbGVjdGVkID0gQHZpZXcuJGVsLmZpbmQoJy5jb250YWluZXItaW5zdHJ1bWVudHMnKS5maW5kKCcuc2VsZWN0ZWQnKVxuICAgICAgICAgJHNlbGVjdGVkLmxlbmd0aC5zaG91bGQuZXF1YWwgMVxuXG5cblxuIiwiQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblBhZFNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvcGFkL1BhZFNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGFkU3F1YXJlID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL1BhZFNxdWFyZS5jb2ZmZWUnXG5MaXZlUGFkID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL0xpdmVQYWQuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdMaXZlIFBhZCcsIC0+XG5cbiAgIGJlZm9yZSA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQHZpZXcgPSBuZXcgTGl2ZVBhZFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cbiAgICAgICAgIGNvbGxlY3Rpb246IG5ldyBQYWRTcXVhcmVDb2xsZWN0aW9uKClcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIG91dCBwYWQgc3F1YXJlcycsID0+XG4gICAgICBAdmlldy4kZWwuZmluZCgnLnBhZC1zcXVhcmUnKS5sZW5ndGguc2hvdWxkLmVxdWFsIDE2XG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IHRoZSBlbnRpcmUga2l0IGNvbGxlY3Rpb24nLCA9PlxuICAgICAgbGVuID0gMFxuXG4gICAgICBAdmlldy5raXRDb2xsZWN0aW9uLmVhY2ggKGtpdCwgaW5kZXgpIC0+XG4gICAgICAgICBpbmRleCA9IGluZGV4ICsgMVxuICAgICAgICAgbGVuID0ga2l0LmdldCgnaW5zdHJ1bWVudHMnKS5sZW5ndGggKiBpbmRleFxuXG4gICAgICBAdmlldy4kZWwuZmluZCgnLmluc3RydW1lbnQnKS5sZW5ndGguc2hvdWxkLmVxdWFsIGxlbiArIDFcblxuXG4gICBpdCAnU2hvdWxkIGxpc3RlbiB0byBkcm9wcyBmcm9tIHRoZSBraXRzIHRvIHRoZSBwYWRzJywgPT5cbiAgICAgIEB2aWV3LmNvbGxlY3Rpb24uc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpkcm9wcGVkJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcucGFkU3F1YXJlVmlld3NbMF0ub25Ecm9wKClcblxuXG4gICBpdCAnU2hvdWxkIHVwZGF0ZSB0aGUgUGFkU3F1YXJlQ29sbGVjdGlvbiB3aXRoIHRoZSBjdXJyZW50IGtpdCB3aGVuIGRyb3BwZWQnLCA9PlxuICAgICAgQHZpZXcuY29sbGVjdGlvbi5zaG91bGQudHJpZ2dlcignY2hhbmdlOmluc3RydW1lbnQnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5wYWRTcXVhcmVWaWV3c1swXS5zZXRTb3VuZCgpIiwiQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblBhZFNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvcGFkL1BhZFNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGFkU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvcGFkL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSdcblBhZFNxdWFyZSA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdQYWQgU3F1YXJlJywgLT5cblxuICAgYmVmb3JlID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBQYWRTcXVhcmVcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG4gICAgICAgICBtb2RlbDogbmV3IFBhZFNxdWFyZU1vZGVsKClcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIG91dCB0aGUgYXBwcm9wcmlhdGUga2V5LWNvZGUgdHJpZ2dlcicsID0+XG4gICAgICBAdmlldy4kZWwuZmluZCgnLmtleS1jb2RlJykubGVuZ3RoLnNob3VsZC5lcXVhbCAxXG5cblxuICAgaXQgJ1Nob3VsZCB0cmlnZ2VyIGEgcGxheSBhY3Rpb24gb24gdGFwJywgPT5cbiAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6dHJpZ2dlcicpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuXG5cbiAgIGl0ICdTaG91bGQgYWNjZXB0IGEgZHJvcHBhYmxlIHZpc3VhbCBlbGVtZW50JywgPT5cbiAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6ZHJvcHBlZCcpLndoZW4gPT5cbiAgICAgICAgIGlkID0gQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLmdldCgnaWQnKVxuXG4gICAgICAgICBAdmlldy5vbkRyb3AgaWRcblxuXG4gICBpdCAnU2hvdWxkIHRyaWdnZXIgaW5zdHJ1bWVudCBjaGFuZ2Ugb24gZHJvcCcsID0+XG4gICAgICAgQHZpZXcubW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpjdXJyZW50SW5zdHJ1bWVudCcpLndoZW4gPT5cbiAgICAgICAgIGlkID0gQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLmdldCgnaWQnKVxuXG4gICAgICAgICBAdmlldy5vbkRyb3AgaWRcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciBvdXQgYSBzb3VuZCBpY29uIHdoZW4gZHJvcHBlZCcsID0+XG5cbiAgICAgIGlkID0gQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLmdldCgnaWQnKVxuICAgICAgQHZpZXcub25Ecm9wIGlkXG5cbiAgICAgIGljb24gPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpY29uJylcblxuICAgICAgQHZpZXcuJGVsLmZpbmQoJy4nICsgaWNvbikubGVuZ3RoLnNob3VsZC5lcXVhbCAxXG5cblxuICAgaXQgJ1Nob3VsZCByZWxlYXNlIHRoZSBkcm9wcGFibGUgdmlzdWFsIGVsZW1lbnQgb24gcHJlc3MtaG9sZCcsID0+XG4gICAgICBAdmlldy5tb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmRyYWdnaW5nJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcub25Ib2xkKClcblxuXG4gICBpdCAnU2hvdWxkIHNldCB0aGUgc291bmQgYmFzZWQgdXBvbiB0aGUgZHJvcHBlZCB2aXN1YWwgZWxlbWVudCcsID0+XG5cbiAgICAgIGlkID0gQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLmdldCgnaWQnKVxuICAgICAgQHZpZXcub25Ecm9wIGlkXG5cbiAgICAgIGV4cGVjdChAdmlldy5hdWRpb1BsYXliYWNrKS50by5ub3QuZXF1YWwgdW5kZWZpbmVkXG5cblxuICAgaXQgJ1Nob3VsZCBjbGVhciB0aGUgc291bmQgd2hlbiB0aGUgZHJvcHBhYmxlIGVsZW1lbnQgaXMgZGlzcG9zZWQgb2YnLCA9PlxuICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICBAdmlldy5vbkRyb3AgaWRcblxuICAgICAgQHZpZXcubW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpjdXJyZW50SW5zdHJ1bWVudCcpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnJlbW92ZVNvdW5kKClcblxuXG4gICBpdCAnU2hvdWxkIGNsZWFyIHRoZSBpY29uIHdoZW4gdGhlIGRyb3BwYWJsZSBlbGVtZW50IGlzIGRpc3Bvc2VkIG9mJywgPT5cbiAgICAgIGlkID0gQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLmdldCgnaWQnKVxuICAgICAgQHZpZXcub25Ecm9wIGlkXG5cbiAgICAgIGljb24gPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpY29uJylcbiAgICAgIEB2aWV3LiRlbC5maW5kKCcuJyArIGljb24pLmxlbmd0aC5zaG91bGQuZXF1YWwgMVxuXG4gICAgICBAdmlldy5yZW1vdmVTb3VuZCgpXG4gICAgICBAdmlldy4kZWwuZmluZCgnLicgKyBpY29uKS5sZW5ndGguc2hvdWxkLmVxdWFsIDBcblxuXG5cblxuXG5cblxuXG4iLCJBcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmUgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdQYXR0ZXJuIFNxdWFyZScsIC0+XG5cbiAgIGJlZm9yZSA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cblxuICAgYmVmb3JlRWFjaCA9PlxuXG4gICAgICBtb2RlbCA9IG5ldyBQYXR0ZXJuU3F1YXJlTW9kZWxcbiAgICAgICAgICdpbnN0cnVtZW50JzogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApXG5cbiAgICAgIEB2aWV3ID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbW9kZWxcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIGN5Y2xlIHRocm91Z2ggdmVsb2NpdHkgdm9sdW1lcycsID0+XG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgMVxuICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKCd2ZWxvY2l0eS1sb3cnKS5zaG91bGQuYmUudHJ1ZVxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ3ZlbG9jaXR5Jykuc2hvdWxkLmVxdWFsIDJcbiAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygndmVsb2NpdHktbWVkaXVtJykuc2hvdWxkLmJlLnRydWVcblxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAzXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ3ZlbG9jaXR5LWhpZ2gnKS5zaG91bGQuYmUudHJ1ZVxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ3ZlbG9jaXR5Jykuc2hvdWxkLmVxdWFsIDBcbiAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygndmVsb2NpdHktaGlnaCcpLnNob3VsZC5iZS5mYWxzZVxuXG5cblxuICAgaXQgJ1Nob3VsZCB0b2dnbGUgb2ZmJywgPT5cblxuICAgICAgQHZpZXcuZGlzYWJsZSgpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAwXG5cblxuXG4gICBpdCAnU2hvdWxkIHRvZ2dsZSBvbicsID0+XG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5vbkNsaWNrKClcblxuXG4gICAgICBAdmlldy5kaXNhYmxlKClcbiAgICAgIEB2aWV3LmVuYWJsZSgpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAxXG4iLCJcbkFwcENvbmZpZyA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblRyYWNrID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2suY29mZmVlJ1xuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuZGVzY3JpYmUgJ1BhdHRlcm4gVHJhY2snLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAdmlldyA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIG1vZGVsOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMClcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIG91dCBjaGlsZCBzcXVhcmVzJywgPT5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcucGF0dGVybi1zcXVhcmUnKS5sZW5ndGguc2hvdWxkLmVxdWFsIDhcblxuXG4gICBpdCAnU2hvdWxkIGxpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUgcGF0dGVybiBzcXVhcmVzJywgPT5cbiAgICAgIEB2aWV3LmNvbGxlY3Rpb24uc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTp2ZWxvY2l0eScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVWaWV3c1swXS5vbkNsaWNrKClcblxuXG4gICBpdCAnU2hvdWxkIGJlIG11dGFibGUnLCA9PlxuICAgICAgQHZpZXcubW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTptdXRlJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcubXV0ZSgpXG5cbiAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6bXV0ZScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnVubXV0ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCBhZGQgdmlzdWFsIG5vdGlmaWNhdGlvbiB0aGF0IHRyYWNrIGlzIG11dGVkJywgKGRvbmUpID0+XG4gICAgICBAdmlldy5tb2RlbC5vbmNlICdjaGFuZ2U6bXV0ZScsIChtb2RlbCkgPT5cbiAgICAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygnbXV0ZScpLnNob3VsZC5iZS50cnVlXG5cbiAgICAgIEB2aWV3Lm11dGUoKVxuXG4gICAgICBAdmlldy5tb2RlbC5vbmNlICdjaGFuZ2U6bXV0ZScsID0+XG4gICAgICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ211dGUnKS5zaG91bGQuYmUuZmFsc2VcbiAgICAgICAgIGRvbmUoKVxuXG4gICAgICBAdmlldy51bm11dGUoKVxuXG5cbiAgIGl0ICdTaG91bGQgYmUgYWJsZSB0byBmb2N1cyBhbmQgdW5mb2N1cycsID0+XG4gICAgICBAdmlldy5tb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmZvY3VzJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcub25MYWJlbENsaWNrKClcblxuXG5cblxuICAgaXQgJ1Nob3VsZCB1cGRhdGUgZWFjaCBQYXR0ZXJuU3F1YXJlIG1vZGVsIHdoZW4gdGhlIGtpdCBjaGFuZ2VzJywgPT4iLCJBcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcblNlcXVlbmNlciA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5oZWxwZXJzID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvaGVscGVycy9oYW5kbGViYXJzLWhlbHBlcnMnXG5cblxuZGVzY3JpYmUgJ1NlcXVlbmNlcicsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEB2aWV3ID0gbmV3IFNlcXVlbmNlclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5wYXVzZSgpXG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IGVhY2ggcGF0dGVybiB0cmFjaycsID0+XG4gICAgICBAdmlldy4kZWwuZmluZCgnLnBhdHRlcm4tdHJhY2snKS5sZW5ndGguc2hvdWxkLmVxdWFsIEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5sZW5ndGhcblxuXG5cbiAgIGl0ICdTaG91bGQgY3JlYXRlIGEgYnBtIGludGVydmFsJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5icG1JbnRlcnZhbCkudG8ubm90LmJlIG51bGxcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBwbGF5IC8gcGF1c2UgY2hhbmdlcyBvbiB0aGUgQXBwTW9kZWwnLCA9PlxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpwbGF5aW5nJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcucGF1c2UoKVxuXG4gICAgICBAdmlldy5hcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOnBsYXlpbmcnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5wbGF5KClcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBicG0gY2hhbmdlcycsID0+XG4gICAgICBAdmlldy5hcHBNb2RlbC5zZXQoJ2JwbScsIDIwMClcbiAgICAgIGV4cGVjdChAdmlldy51cGRhdGVJbnRlcnZhbFRpbWUpLnRvLmVxdWFsIDIwMFxuXG5cblxuICAgaXQgJ1Nob3VsZCBiZSBtdXRhYmxlJywgPT5cbiAgICAgIEB2aWV3LmFwcE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6bXV0ZScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm11dGUoKVxuXG4gICAgICBAdmlldy5hcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOm11dGUnKS53aGVuID0+XG4gICAgICAgICBAdmlldy51bm11dGUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIEluc3RydW1lbnRUcmFja01vZGVsIGZvY3VzIGV2ZW50cycsID0+XG4gICAgICBAdmlldy5jb2xsZWN0aW9uLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6Zm9jdXMnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5wYXR0ZXJuVHJhY2tWaWV3c1swXS5vbkxhYmVsQ2xpY2soKVxuXG5cblxuXG4gICBpdCAnU2hvdWxkIHVwZGF0ZSBlYWNoIHBhdHRlcm4gdHJhY2sgd2hlbiB0aGUga2l0IGNoYW5nZXMnLCA9PiIsIkFwcENvbmZpZyA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5BcHBDb250cm9sbGVyID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL0FwcENvbnRyb2xsZXIuY29mZmVlJ1xuTGFuZGluZ1ZpZXcgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSdcblxuZGVzY3JpYmUgJ0xhbmRpbmcgVmlldycsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEB2aWV3ID0gbmV3IExhbmRpbmdWaWV3XG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuICAgICAgaWYgQGFwcENvbnRyb2xsZXIgdGhlbiBAYXBwQ29udHJvbGxlci5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgZXhwZWN0KEB2aWV3LmVsKS50by5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCByZWRpcmVjdCB0byBjcmVhdGUgcGFnZSBvbiBjbGljaycsIChkb25lKSA9PlxuXG4gICAgICBAYXBwQ29udHJvbGxlciA9IG5ldyBBcHBDb250cm9sbGVyXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICByb3V0ZXIgPSBAYXBwQ29udHJvbGxlci5hcHBSb3V0ZXJcbiAgICAgICRzdGFydEJ0biA9IEB2aWV3LiRlbC5maW5kICcuc3RhcnQtYnRuJ1xuXG4gICAgICAkc3RhcnRCdG4ub24gJ2NsaWNrJywgKGV2ZW50KSA9PlxuICAgICAgICAgJ2NyZWF0ZScuc2hvdWxkLnJvdXRlLnRvIHJvdXRlciwgJ2NyZWF0ZVJvdXRlJ1xuICAgICAgICAgZG9uZSgpXG5cbiAgICAgICRzdGFydEJ0bi5jbGljaygpXG5cblxuXG5cblxuXG5cblxuIiwiU2hhcmVWaWV3ID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1NoYXJlIFZpZXcnLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBTaGFyZVZpZXdcbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5lbCkudG8uZXhpc3RcblxuXG4gICBpdCAnU2hvdWxkIGFjY2VwdCBhIFNvdW5kU2hhcmUgb2JqZWN0JywgPT5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciB0aGUgdmlzdWFsaXphdGlvbiBsYXllcicsID0+XG5cblxuICAgaXQgJ1Nob3VsZCBwYXVzZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gdHJhY2sgb24gaW5pdCcsID0+XG5cblxuICAgaXQgJ1Nob3VsZCB0b2dnbGUgdGhlIHBsYXkgLyBwYXVzZSBidXR0b24nLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgZGlzcGxheSB0aGUgdXNlcnMgc29uZyB0aXRsZSBhbmQgdXNlcm5hbWUnLCA9PlxuIl19

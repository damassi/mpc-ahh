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
          _this.collection.add(model);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvbm9kZV9tb2R1bGVzL2RpZ2l0cy9pbmRleC5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L3J1bnRpbWUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycy5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvTGl2ZVBhZE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvcGFkL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy91dGlscy9QdWJTdWIuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3IuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy90ZW1wbGF0ZXMvaW5zdHJ1bWVudC1wYW5lbC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy90ZW1wbGF0ZXMvaW5zdHJ1bWVudC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvTGl2ZVBhZC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvUGFkU3F1YXJlLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC90ZW1wbGF0ZXMvbGl2ZS1wYWQtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL3RlbXBsYXRlcy9wYWQtc3F1YXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2suY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3BhdHRlcm4tc3F1YXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci90ZW1wbGF0ZXMvcGF0dGVybi10cmFjay10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3NlcXVlbmNlci10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy90ZW1wbGF0ZXMvYnBtLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3RlbXBsYXRlcy9raXQtc2VsZWN0aW9uLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS90ZW1wbGF0ZXMvY3JlYXRlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy90ZW1wbGF0ZXMvbGFuZGluZy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy9zaGFyZS9TaGFyZVZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2Uvc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvdGVtcGxhdGVzL3NoYXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3NyYy9zY3JpcHRzL3ZpZXdzL3Rlc3RzL1Rlc3RzVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS9zcmMvc2NyaXB0cy92aWV3cy90ZXN0cy90ZXN0cy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMtcnVubmVyLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9BcHBDb250cm9sbGVyLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9LaXRDb2xsZWN0aW9uLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9LaXRNb2RlbC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy9tb2RlbHMvU291bmRDb2xsZWN0aW9uLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL21vZGVscy9Tb3VuZE1vZGVsLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50LXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9MaXZlUGFkLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9Db2tlL1Byb2plY3RzL2FoaC1tcGMvc291cmNlL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLXNwZWMuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL0Nva2UvUHJvamVjdHMvYWhoLW1wYy9zb3VyY2UvdGVzdC9zcGVjL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvQ29rZS9Qcm9qZWN0cy9haGgtbXBjL3NvdXJjZS90ZXN0L3NwZWMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLDRFQUFBO0VBQUE7aVNBQUE7O0FBQUEsUUFRQSxHQUFjLE9BQUEsQ0FBUSwwQkFBUixDQVJkLENBQUE7O0FBQUEsU0FTQSxHQUFjLE9BQUEsQ0FBUSw0QkFBUixDQVRkLENBQUE7O0FBQUEsV0FVQSxHQUFjLE9BQUEsQ0FBUSxvQ0FBUixDQVZkLENBQUE7O0FBQUEsVUFXQSxHQUFjLE9BQUEsQ0FBUSxrQ0FBUixDQVhkLENBQUE7O0FBQUEsU0FZQSxHQUFjLE9BQUEsQ0FBUSxnQ0FBUixDQVpkLENBQUE7O0FBQUEsSUFhQSxHQUFjLE9BQUEsQ0FBUSxzQkFBUixDQWJkLENBQUE7O0FBQUE7QUFtQkcsa0NBQUEsQ0FBQTs7OztHQUFBOztBQUFBLDBCQUFBLFNBQUEsR0FBVyxTQUFYLENBQUE7O0FBQUEsMEJBR0EsVUFBQSxHQUFZLFNBQUMsT0FBRCxHQUFBO0FBQ1QsSUFBQSw4Q0FBTSxPQUFOLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxHQUFBLENBQUEsUUFGWixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxVQUFkLEVBQTBCLElBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixDQUFsQixDQUExQixDQUhBLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLFdBTGYsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLFNBQUQsR0FBZSxHQUFBLENBQUEsU0FOZixDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsVUFBRCxHQUFtQixJQUFBLFVBQUEsQ0FDaEI7QUFBQSxNQUFBLFFBQUEsRUFBVSxJQUFDLENBQUEsUUFBWDtBQUFBLE1BQ0EsYUFBQSxFQUFlLElBQUMsQ0FBQSxhQURoQjtLQURnQixDQVJuQixDQUFBO0FBQUEsSUFZQSxJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLFNBQUEsQ0FDZDtBQUFBLE1BQUEsYUFBQSxFQUFlLElBQWY7QUFBQSxNQUNBLFFBQUEsRUFBVSxJQUFDLENBQUEsUUFEWDtLQURjLENBWmpCLENBQUE7V0FnQkEsSUFBQyxDQUFBLGlCQUFELENBQUEsRUFqQlM7RUFBQSxDQUhaLENBQUE7O0FBQUEsMEJBNEJBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTCxJQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBQSxDQUFFLE1BQUYsQ0FBVCxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsRUFBZixDQURBLENBQUE7V0FHQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQWpCLENBQ0c7QUFBQSxNQUFBLFNBQUEsRUFBVyxLQUFYO0tBREgsRUFKSztFQUFBLENBNUJSLENBQUE7O0FBQUEsMEJBd0NBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTCxJQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBYixDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FEQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBQSxDQUZBLENBQUE7V0FJQSxJQUFDLENBQUEsb0JBQUQsQ0FBQSxFQUxLO0VBQUEsQ0F4Q1IsQ0FBQTs7QUFBQSwwQkFxREEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO1dBQ2hCLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFFBQVgsRUFBcUIsYUFBckIsRUFBb0MsSUFBQyxDQUFBLFlBQXJDLEVBRGdCO0VBQUEsQ0FyRG5CLENBQUE7O0FBQUEsMEJBNkRBLG9CQUFBLEdBQXNCLFNBQUEsR0FBQTtXQUNuQixJQUFDLENBQUEsYUFBRCxDQUFBLEVBRG1CO0VBQUEsQ0E3RHRCLENBQUE7O0FBQUEsMEJBMkVBLFlBQUEsR0FBYyxTQUFDLEtBQUQsR0FBQTtBQUNYLFFBQUEseUJBQUE7QUFBQSxJQUFBLFlBQUEsR0FBZSxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBekMsQ0FBQTtBQUFBLElBQ0EsV0FBQSxHQUFlLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFEN0IsQ0FBQTs7TUFHQSxZQUFZLENBQUUsSUFBZCxDQUNHO0FBQUEsUUFBQSxNQUFBLEVBQVEsSUFBUjtPQURIO0tBSEE7QUFBQSxJQU9BLElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFZLFdBQVcsQ0FBQyxNQUFaLENBQUEsQ0FBb0IsQ0FBQyxFQUFqQyxDQVBBLENBQUE7V0FTQSxXQUFXLENBQUMsSUFBWixDQUFBLEVBVlc7RUFBQSxDQTNFZCxDQUFBOzt1QkFBQTs7R0FIeUIsS0FoQjVCLENBQUE7O0FBQUEsTUE2R00sQ0FBQyxPQUFQLEdBQWlCLGFBN0dqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsU0FBQTs7QUFBQSxTQVFBLEdBTUc7QUFBQSxFQUFBLE1BQUEsRUFDRztBQUFBLElBQUEsSUFBQSxFQUFRLFNBQVI7QUFBQSxJQUNBLEtBQUEsRUFBUSxPQURSO0FBQUEsSUFFQSxJQUFBLEVBQVEsTUFGUjtBQUFBLElBR0EsTUFBQSxFQUFRLFFBSFI7R0FESDtBQUFBLEVBVUEsR0FBQSxFQUFLLEdBVkw7QUFBQSxFQWdCQSxPQUFBLEVBQVMsSUFoQlQ7QUFBQSxFQXNCQSxZQUFBLEVBQWMsQ0F0QmQ7QUFBQSxFQTRCQSxhQUFBLEVBQ0c7QUFBQSxJQUFBLEdBQUEsRUFBUSxFQUFSO0FBQUEsSUFDQSxNQUFBLEVBQVEsRUFEUjtBQUFBLElBRUEsSUFBQSxFQUFTLENBRlQ7R0E3Qkg7QUFBQSxFQXFDQSxlQUFBLEVBQWlCLFNBQUMsU0FBRCxHQUFBO1dBQ2QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLEdBQWUsR0FBZixHQUFxQixJQUFDLENBQUEsTUFBTyxDQUFBLFNBQUEsRUFEZjtFQUFBLENBckNqQjtBQUFBLEVBNENBLG1CQUFBLEVBQXFCLFNBQUMsU0FBRCxHQUFBO1dBQ2xCLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUF4QixHQUErQixHQUEvQixHQUFxQyxJQUFDLENBQUEsTUFBTyxDQUFBLFNBQUEsRUFEM0I7RUFBQSxDQTVDckI7Q0FkSCxDQUFBOztBQUFBLE1BK0RNLENBQUMsT0FBUCxHQUFpQixTQS9EakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLFFBQUE7O0FBQUEsUUFRQSxHQUVHO0FBQUEsRUFBQSxhQUFBLEVBQW1CLGVBQW5CO0FBQUEsRUFDQSxVQUFBLEVBQW1CLFlBRG5CO0FBQUEsRUFFQSxlQUFBLEVBQW1CLGlCQUZuQjtBQUFBLEVBR0EsY0FBQSxFQUFtQixnQkFIbkI7QUFBQSxFQUlBLFlBQUEsRUFBbUIsY0FKbkI7QUFBQSxFQUtBLGlCQUFBLEVBQW1CLDBCQUxuQjtBQUFBLEVBTUEsVUFBQSxFQUFtQixpQkFObkI7QUFBQSxFQU9BLFdBQUEsRUFBbUIsYUFQbkI7QUFBQSxFQVFBLGNBQUEsRUFBbUIsZ0JBUm5CO0FBQUEsRUFTQSxjQUFBLEVBQW1CLGdCQVRuQjtBQUFBLEVBVUEsZUFBQSxFQUFtQixpQkFWbkI7Q0FWSCxDQUFBOztBQUFBLE1Bc0JNLENBQUMsT0FBUCxHQUFpQixRQXRCakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLE1BQUE7O0FBQUEsTUFRQSxHQUVHO0FBQUEsRUFBQSxLQUFBLEVBQU8sZUFBUDtDQVZILENBQUE7O0FBQUEsTUFhTSxDQUFDLE9BQVAsR0FBaUIsTUFiakIsQ0FBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsb0JBQUE7O0FBQUEsU0FPQSxHQUFZLE9BQUEsQ0FBUSw0QkFBUixDQVBaLENBQUE7O0FBQUEsU0FVQSxHQUFZLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBZixDQUdUO0FBQUEsRUFBQSxRQUFBLEVBQ0c7QUFBQSxJQUFBLE1BQUEsRUFBZSxJQUFmO0FBQUEsSUFDQSxTQUFBLEVBQWUsSUFEZjtBQUFBLElBRUEsTUFBQSxFQUFlLElBRmY7QUFBQSxJQUlBLFVBQUEsRUFBZSxJQUpmO0FBQUEsSUFPQSxLQUFBLEVBQWUsU0FBUyxDQUFDLEdBUHpCO0dBREg7Q0FIUyxDQVZaLENBQUE7O0FBQUEsTUF3Qk0sQ0FBQyxPQUFQLEdBQWlCLFNBeEJqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsa0NBQUE7RUFBQTtpU0FBQTs7QUFBQSxTQU9BLEdBQVksT0FBQSxDQUFRLCtCQUFSLENBUFosQ0FBQTs7QUFBQSxRQVFBLEdBQVksT0FBQSxDQUFRLG1CQUFSLENBUlosQ0FBQTs7QUFBQTtBQWlCRyxrQ0FBQSxDQUFBOzs7O0dBQUE7O0FBQUEsMEJBQUEsR0FBQSxHQUFLLEVBQUEsR0FBRSxDQUFBLFNBQVMsQ0FBQyxlQUFWLENBQTBCLE1BQTFCLENBQUEsQ0FBRixHQUFxQyxrQkFBMUMsQ0FBQTs7QUFBQSwwQkFNQSxLQUFBLEdBQU8sUUFOUCxDQUFBOztBQUFBLDBCQVlBLEtBQUEsR0FBTyxDQVpQLENBQUE7O0FBQUEsMEJBZ0JBLEtBQUEsR0FBTyxTQUFDLFFBQUQsR0FBQTtBQUNKLFFBQUEsZUFBQTtBQUFBLElBQUEsU0FBQSxHQUFZLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBNUIsQ0FBQTtBQUFBLElBQ0EsSUFBQSxHQUFPLFFBQVEsQ0FBQyxJQURoQixDQUFBO0FBQUEsSUFHQSxJQUFBLEdBQU8sQ0FBQyxDQUFDLEdBQUYsQ0FBTSxJQUFOLEVBQVksU0FBQyxHQUFELEdBQUE7QUFDaEIsTUFBQSxHQUFHLENBQUMsSUFBSixHQUFXLFNBQUEsR0FBWSxHQUFaLEdBQWtCLEdBQUcsQ0FBQyxNQUFqQyxDQUFBO0FBQ0EsYUFBTyxHQUFQLENBRmdCO0lBQUEsQ0FBWixDQUhQLENBQUE7QUFPQSxXQUFPLElBQVAsQ0FSSTtFQUFBLENBaEJQLENBQUE7O0FBQUEsMEJBZ0NBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDVixRQUFBLGFBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsTUFBUCxDQUFBO0FBRUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBWjtBQUNHLE1BQUEsSUFBQyxDQUFBLEtBQUQsRUFBQSxDQURIO0tBQUEsTUFBQTtBQUlHLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxHQUFBLEdBQU0sQ0FBZixDQUpIO0tBRkE7V0FRQSxRQUFBLEdBQVcsSUFBQyxDQUFBLEVBQUQsQ0FBSSxJQUFDLENBQUEsS0FBTCxFQVREO0VBQUEsQ0FoQ2IsQ0FBQTs7QUFBQSwwQkFpREEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNOLFFBQUEsYUFBQTtBQUFBLElBQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBaEIsQ0FBQTtBQUVBLElBQUEsSUFBRyxJQUFDLENBQUEsS0FBRCxHQUFTLEdBQVo7QUFDRyxNQUFBLElBQUMsQ0FBQSxLQUFELEVBQUEsQ0FESDtLQUFBLE1BQUE7QUFJRyxNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBVCxDQUpIO0tBRkE7V0FRQSxRQUFBLEdBQVcsSUFBQyxDQUFBLEVBQUQsQ0FBSSxJQUFDLENBQUEsS0FBTCxFQVRMO0VBQUEsQ0FqRFQsQ0FBQTs7dUJBQUE7O0dBTnlCLFFBQVEsQ0FBQyxXQVhyQyxDQUFBOztBQUFBLE1BK0VNLENBQUMsT0FBUCxHQUFpQixhQS9FakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLDhCQUFBO0VBQUE7aVNBQUE7O0FBQUEsb0JBT0EsR0FBdUIsT0FBQSxDQUFRLDBDQUFSLENBUHZCLENBQUE7O0FBQUE7QUFhRyw2QkFBQSxDQUFBOzs7O0dBQUE7O0FBQUEscUJBQUEsUUFBQSxHQUNHO0FBQUEsSUFBQSxPQUFBLEVBQVksSUFBWjtBQUFBLElBQ0EsTUFBQSxFQUFZLElBRFo7QUFBQSxJQUVBLFFBQUEsRUFBWSxJQUZaO0FBQUEsSUFLQSxhQUFBLEVBQWlCLElBTGpCO0FBQUEsSUFRQSxtQkFBQSxFQUFxQixJQVJyQjtHQURILENBQUE7O0FBQUEscUJBbUJBLEtBQUEsR0FBTyxTQUFDLFFBQUQsR0FBQTtBQUNKLElBQUEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxRQUFRLENBQUMsV0FBaEIsRUFBNkIsU0FBQyxVQUFELEdBQUE7QUFDMUIsTUFBQSxVQUFVLENBQUMsRUFBWCxHQUFnQixDQUFDLENBQUMsUUFBRixDQUFXLGFBQVgsQ0FBaEIsQ0FBQTthQUNBLFVBQVUsQ0FBQyxHQUFYLEdBQWlCLFFBQVEsQ0FBQyxJQUFULEdBQWdCLEdBQWhCLEdBQXNCLFVBQVUsQ0FBQyxJQUZ4QjtJQUFBLENBQTdCLENBQUEsQ0FBQTtBQUFBLElBSUEsUUFBUSxDQUFDLFdBQVQsR0FBMkIsSUFBQSxvQkFBQSxDQUFxQixRQUFRLENBQUMsV0FBOUIsQ0FKM0IsQ0FBQTtXQU1BLFNBUEk7RUFBQSxDQW5CUCxDQUFBOztrQkFBQTs7R0FIb0IsUUFBUSxDQUFDLE1BVmhDLENBQUE7O0FBQUEsTUE0Q00sQ0FBQyxPQUFQLEdBQWlCLFFBNUNqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsWUFBQTtFQUFBO2lTQUFBOztBQUFBO0FBT0EsaUNBQUEsQ0FBQTs7OztHQUFBOztzQkFBQTs7R0FBMkIsUUFBUSxDQUFDLE1BUHBDLENBQUE7O0FBQUEsTUFVTSxDQUFDLE9BQVAsR0FBaUIsWUFWakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLG9DQUFBO0VBQUE7aVNBQUE7O0FBQUEsZUFPQSxHQUFrQixPQUFBLENBQVEscUNBQVIsQ0FQbEIsQ0FBQTs7QUFBQTtBQVlHLHdDQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSxnQ0FBQSxLQUFBLEdBQU8sZUFBUCxDQUFBOzs2QkFBQTs7R0FGK0IsUUFBUSxDQUFDLFdBVjNDLENBQUE7O0FBQUEsTUFlTSxDQUFDLE9BQVAsR0FBaUIsbUJBZmpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxjQUFBO0VBQUE7aVNBQUE7O0FBQUE7QUFVRyxtQ0FBQSxDQUFBOzs7O0dBQUE7O0FBQUEsMkJBQUEsUUFBQSxHQUNHO0FBQUEsSUFBQSxVQUFBLEVBQWEsS0FBYjtBQUFBLElBQ0EsU0FBQSxFQUFhLElBRGI7QUFBQSxJQUVBLFNBQUEsRUFBYSxLQUZiO0FBQUEsSUFLQSxtQkFBQSxFQUFzQixJQUx0QjtHQURILENBQUE7O0FBQUEsMkJBU0EsVUFBQSxHQUFZLFNBQUMsT0FBRCxHQUFBO0FBQ1QsSUFBQSwrQ0FBTSxPQUFOLENBQUEsQ0FBQTtXQUVBLElBQUMsQ0FBQSxHQUFELENBQUssSUFBTCxFQUFXLENBQUMsQ0FBQyxRQUFGLENBQVcsYUFBWCxDQUFYLEVBSFM7RUFBQSxDQVRaLENBQUE7O3dCQUFBOztHQUgwQixRQUFRLENBQUMsTUFQdEMsQ0FBQTs7QUFBQSxNQTBCTSxDQUFDLE9BQVAsR0FBaUIsY0ExQmpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxxQ0FBQTtFQUFBO2lTQUFBOztBQUFBLGVBT0EsR0FBa0IsT0FBQSxDQUFRLDBCQUFSLENBUGxCLENBQUE7O0FBQUE7QUFjRyx5Q0FBQSxDQUFBOzs7O0dBQUE7O0FBQUEsaUNBQUEsS0FBQSxHQUFPLGVBQVAsQ0FBQTs7QUFBQSxpQ0FPQSxvQkFBQSxHQUFzQixTQUFBLEdBQUE7QUFDbkIsV0FBTyxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLFVBQUQsR0FBQTtlQUNULFVBQVUsQ0FBQyxHQUFYLENBQWUsZ0JBQWYsRUFEUztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUwsQ0FBUCxDQURtQjtFQUFBLENBUHRCLENBQUE7OzhCQUFBOztHQUpnQyxRQUFRLENBQUMsV0FWNUMsQ0FBQTs7QUFBQSxNQTJCTSxDQUFDLE9BQVAsR0FBaUIsb0JBM0JqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsMEJBQUE7RUFBQTtpU0FBQTs7QUFBQSxTQU9BLEdBQVksT0FBQSxDQUFRLCtCQUFSLENBUFosQ0FBQTs7QUFBQTtBQWFHLG9DQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSw0QkFBQSxRQUFBLEdBR0c7QUFBQSxJQUFBLFFBQUEsRUFBWSxJQUFaO0FBQUEsSUFHQSxPQUFBLEVBQVksSUFIWjtBQUFBLElBTUEsTUFBQSxFQUFZLElBTlo7QUFBQSxJQVNBLE9BQUEsRUFBWSxJQVRaO0FBQUEsSUFZQSxNQUFBLEVBQVksSUFaWjtBQUFBLElBZUEsS0FBQSxFQUFZLElBZlo7QUFBQSxJQWtCQSxRQUFBLEVBQVksSUFsQlo7QUFBQSxJQXVCQSxnQkFBQSxFQUFxQixJQXZCckI7R0FISCxDQUFBOzt5QkFBQTs7R0FIMkIsUUFBUSxDQUFDLE1BVnZDLENBQUE7O0FBQUEsTUEyQ00sQ0FBQyxPQUFQLEdBQWlCLGVBM0NqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsdUVBQUE7RUFBQTtpU0FBQTs7QUFBQSxTQU9BLEdBQXFCLE9BQUEsQ0FBUSwrQkFBUixDQVByQixDQUFBOztBQUFBLGtCQVFBLEdBQXFCLE9BQUEsQ0FBUSw2QkFBUixDQVJyQixDQUFBOztBQUFBLGVBU0EsR0FBa0IsT0FBQSxDQUFRLHFDQUFSLENBVGxCLENBQUE7O0FBQUE7QUFjRyw0Q0FBQSxDQUFBOzs7O0dBQUE7O0FBQUEsb0NBQUEsS0FBQSxHQUFPLGVBQVAsQ0FBQTs7aUNBQUE7O0dBRm1DLFFBQVEsQ0FBQyxXQVovQyxDQUFBOztBQUFBLE1BaUJNLENBQUMsT0FBUCxHQUFpQix1QkFqQmpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSx1Q0FBQTtFQUFBO2lTQUFBOztBQUFBLFFBT0EsR0FBWSxPQUFBLENBQVEsOEJBQVIsQ0FQWixDQUFBOztBQUFBLFNBUUEsR0FBWSxPQUFBLENBQVEsK0JBQVIsQ0FSWixDQUFBOztBQUFBO0FBY0csdUNBQUEsQ0FBQTs7OztHQUFBOztBQUFBLCtCQUFBLFFBQUEsR0FDRztBQUFBLElBQUEsUUFBQSxFQUFvQixLQUFwQjtBQUFBLElBQ0EsWUFBQSxFQUFvQixJQURwQjtBQUFBLElBRUEsa0JBQUEsRUFBb0IsQ0FGcEI7QUFBQSxJQUdBLFNBQUEsRUFBb0IsSUFIcEI7QUFBQSxJQUlBLFVBQUEsRUFBb0IsQ0FKcEI7R0FESCxDQUFBOztBQUFBLCtCQVNBLFVBQUEsR0FBWSxTQUFDLE9BQUQsR0FBQTtBQUNULElBQUEsbURBQU0sT0FBTixDQUFBLENBQUE7V0FFQSxJQUFDLENBQUEsRUFBRCxDQUFJLFFBQVEsQ0FBQyxlQUFiLEVBQThCLElBQUMsQ0FBQSxnQkFBL0IsRUFIUztFQUFBLENBVFosQ0FBQTs7QUFBQSwrQkFnQkEsS0FBQSxHQUFPLFNBQUEsR0FBQTtBQUNKLFFBQUEsUUFBQTtBQUFBLElBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxDQUFYLENBQUE7QUFFQSxJQUFBLElBQUcsUUFBQSxHQUFXLFNBQVMsQ0FBQyxZQUF4QjtBQUNHLE1BQUEsUUFBQSxFQUFBLENBREg7S0FBQSxNQUFBO0FBSUcsTUFBQSxRQUFBLEdBQVcsQ0FBWCxDQUpIO0tBRkE7V0FRQSxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsRUFBaUIsUUFBakIsRUFUSTtFQUFBLENBaEJQLENBQUE7O0FBQUEsK0JBNkJBLE1BQUEsR0FBUSxTQUFBLEdBQUE7V0FDTCxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsRUFBaUIsQ0FBakIsRUFESztFQUFBLENBN0JSLENBQUE7O0FBQUEsK0JBbUNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7V0FDTixJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsRUFBaUIsQ0FBakIsRUFETTtFQUFBLENBbkNULENBQUE7O0FBQUEsK0JBd0NBLGdCQUFBLEdBQWtCLFNBQUMsS0FBRCxHQUFBO0FBQ2YsUUFBQSxRQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLGtCQUFMLEVBQXlCLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxRQUFuRCxDQUFBLENBQUE7QUFBQSxJQUVBLFFBQUEsR0FBVyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBRnpCLENBQUE7QUFJQSxJQUFBLElBQUcsUUFBQSxHQUFXLENBQWQ7YUFDRyxJQUFDLENBQUEsR0FBRCxDQUFLLFFBQUwsRUFBZSxJQUFmLEVBREg7S0FBQSxNQUdLLElBQUcsUUFBQSxLQUFZLENBQWY7YUFDRixJQUFDLENBQUEsR0FBRCxDQUFLLFFBQUwsRUFBZSxLQUFmLEVBREU7S0FSVTtFQUFBLENBeENsQixDQUFBOzs0QkFBQTs7R0FIOEIsUUFBUSxDQUFDLE1BWDFDLENBQUE7O0FBQUEsTUFvRU0sQ0FBQyxPQUFQLEdBQWlCLGtCQXBFakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLHVVQUFBO0VBQUE7O2lTQUFBOztBQUFBLFNBT0EsR0FBYyxPQUFBLENBQVEsNEJBQVIsQ0FQZCxDQUFBOztBQUFBLE1BUUEsR0FBYyxPQUFBLENBQVEsaUJBQVIsQ0FSZCxDQUFBOztBQUFBLFFBU0EsR0FBYyxPQUFBLENBQVEsMkJBQVIsQ0FUZCxDQUFBOztBQUFBLFNBY0EsR0FBZ0IsT0FBQSxDQUFRLGlDQUFSLENBZGhCLENBQUE7O0FBQUEsSUFnQkEsR0FBTyxPQUFBLENBQVEsdUJBQVIsQ0FoQlAsQ0FBQTs7QUFBQSxXQWtCQSxHQUFlLE9BQUEsQ0FBUSwrQ0FBUixDQWxCZixDQUFBOztBQUFBLGFBbUJBLEdBQWdCLE9BQUEsQ0FBUSxxQ0FBUixDQW5CaEIsQ0FBQTs7QUFBQSxRQW9CQSxHQUFnQixPQUFBLENBQVEsZ0NBQVIsQ0FwQmhCLENBQUE7O0FBQUEsWUFzQkEsR0FBZ0IsT0FBQSxDQUFRLGdEQUFSLENBdEJoQixDQUFBOztBQUFBLHVCQXVCQSxHQUEwQixPQUFBLENBQVEsdUVBQVIsQ0F2QjFCLENBQUE7O0FBQUEsZUF5QkEsR0FBa0IsNENBekJsQixDQUFBOztBQUFBLG9CQTBCQSxHQUF1QixpREExQnZCLENBQUE7O0FBQUEsYUE0QkEsR0FBZ0IsT0FBQSxDQUFRLDJEQUFSLENBNUJoQixDQUFBOztBQUFBLGtCQTZCQSxHQUFxQixPQUFBLENBQVEsK0NBQVIsQ0E3QnJCLENBQUE7O0FBQUEsdUJBOEJBLEdBQTBCLE9BQUEsQ0FBUSxvREFBUixDQTlCMUIsQ0FBQTs7QUFBQSxZQStCQSxHQUFnQixPQUFBLENBQVEsMERBQVIsQ0EvQmhCLENBQUE7O0FBQUEsU0FnQ0EsR0FBa0IsT0FBQSxDQUFRLHVEQUFSLENBaENsQixDQUFBOztBQUFBLFlBa0NBLEdBQWUsT0FBQSxDQUFRLG1DQUFSLENBbENmLENBQUE7O0FBQUEsbUJBbUNBLEdBQXNCLE9BQUEsQ0FBUSwwQ0FBUixDQW5DdEIsQ0FBQTs7QUFBQSxjQW9DQSxHQUFpQixPQUFBLENBQVEscUNBQVIsQ0FwQ2pCLENBQUE7O0FBQUEsT0FxQ0EsR0FBVSxPQUFBLENBQVEsK0NBQVIsQ0FyQ1YsQ0FBQTs7QUFBQSxTQXNDQSxHQUFZLE9BQUEsQ0FBUSxpREFBUixDQXRDWixDQUFBOztBQUFBO0FBNENHLDhCQUFBLENBQUE7Ozs7O0dBQUE7O0FBQUEsc0JBQUEsTUFBQSxHQUNHO0FBQUEsSUFBQSxFQUFBLEVBQWdCLGNBQWhCO0FBQUEsSUFDQSxRQUFBLEVBQWdCLGFBRGhCO0FBQUEsSUFFQSxPQUFBLEVBQWdCLFlBRmhCO0FBQUEsSUFLQSxPQUFBLEVBQXdCLE9BTHhCO0FBQUEsSUFNQSxlQUFBLEVBQXdCLG1CQU54QjtBQUFBLElBT0EsZUFBQSxFQUF3QixtQkFQeEI7QUFBQSxJQVFBLHFCQUFBLEVBQXdCLHlCQVJ4QjtBQUFBLElBU0EsZ0JBQUEsRUFBd0Isb0JBVHhCO0FBQUEsSUFVQSxlQUFBLEVBQXdCLG1CQVZ4QjtBQUFBLElBV0EsV0FBQSxFQUF3QixnQkFYeEI7QUFBQSxJQVlBLGdCQUFBLEVBQXdCLG9CQVp4QjtBQUFBLElBYUEsWUFBQSxFQUF3QixnQkFieEI7QUFBQSxJQWNBLFVBQUEsRUFBd0IsY0FkeEI7R0FESCxDQUFBOztBQUFBLHNCQW1CQSxVQUFBLEdBQVksU0FBQyxPQUFELEdBQUE7QUFDVCxJQUFDLElBQUMsQ0FBQSx3QkFBQSxhQUFGLEVBQWlCLElBQUMsQ0FBQSxtQkFBQSxRQUFsQixDQUFBO1dBRUEsTUFBTSxDQUFDLEVBQVAsQ0FBVSxRQUFRLENBQUMsS0FBbkIsRUFBMEIsSUFBQyxDQUFBLGFBQTNCLEVBSFM7RUFBQSxDQW5CWixDQUFBOztBQUFBLHNCQTBCQSxhQUFBLEdBQWUsU0FBQyxNQUFELEdBQUE7QUFDWixRQUFBLEtBQUE7QUFBQSxJQUFDLFFBQVMsT0FBVCxLQUFELENBQUE7V0FFQSxJQUFDLENBQUEsUUFBRCxDQUFVLEtBQVYsRUFBaUI7QUFBQSxNQUFFLE9BQUEsRUFBUyxJQUFYO0tBQWpCLEVBSFk7RUFBQSxDQTFCZixDQUFBOztBQUFBLHNCQWlDQSxZQUFBLEdBQWMsU0FBQSxHQUFBO1dBQ1gsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxFQUFzQixJQUFDLENBQUEsYUFBYSxDQUFDLFdBQXJDLEVBRFc7RUFBQSxDQWpDZCxDQUFBOztBQUFBLHNCQXNDQSxXQUFBLEdBQWEsU0FBQSxHQUFBO1dBQ1YsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxFQUFzQixJQUFDLENBQUEsYUFBYSxDQUFDLFVBQXJDLEVBRFU7RUFBQSxDQXRDYixDQUFBOztBQUFBLHNCQTJDQSxVQUFBLEdBQVksU0FBQSxHQUFBO1dBQ1QsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxFQUFzQixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQXJDLEVBRFM7RUFBQSxDQTNDWixDQUFBOztBQUFBLHNCQXVEQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ0osUUFBQSxJQUFBO0FBQUEsSUFBQSxJQUFBLEdBQVcsSUFBQSxTQUFBLENBQUEsQ0FBWCxDQUFBO1dBRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxFQUFzQixJQUF0QixFQUhJO0VBQUEsQ0F2RFAsQ0FBQTs7QUFBQSxzQkErREEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO0FBQ2hCLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxhQUFBLENBQ2xCO0FBQUEsTUFBQSxLQUFBLEVBQU8sSUFBUDtLQURrQixDQUFyQixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsQ0FDRztBQUFBLE1BQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxNQUNBLEdBQUEsRUFBSyxTQUFTLENBQUMsZUFBVixDQUEwQixNQUExQixDQUFBLEdBQW9DLEdBQXBDLEdBQTBDLGlCQUQvQztLQURILENBSEEsQ0FBQTtBQUFBLElBT0EsSUFBQSxHQUFXLElBQUEsV0FBQSxDQUNSO0FBQUEsTUFBQSxRQUFBLEVBQVUsSUFBQyxDQUFBLFFBQVg7QUFBQSxNQUNBLGFBQUEsRUFBZSxJQUFDLENBQUEsYUFEaEI7S0FEUSxFQUdMO0FBQUEsTUFBQSxRQUFBLEVBQVUsSUFBQyxDQUFBLFFBQVg7S0FISyxDQVBYLENBQUE7V0FZQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLElBQXRCLEVBYmdCO0VBQUEsQ0EvRG5CLENBQUE7O0FBQUEsc0JBaUZBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNoQixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBVyxJQUFBLFlBQUEsQ0FDUjtBQUFBLE1BQUEsUUFBQSxFQUFVLElBQUMsQ0FBQSxRQUFYO0tBRFEsQ0FBWCxDQUFBO0FBQUEsSUFHQSxJQUFJLENBQUMsTUFBTCxDQUFBLENBSEEsQ0FBQTtXQUtBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE1BQWQsRUFBc0IsSUFBdEIsRUFOZ0I7RUFBQSxDQWpGbkIsQ0FBQTs7QUFBQSxzQkE0RkEsdUJBQUEsR0FBeUIsU0FBQSxHQUFBO0FBQ3RCLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxhQUFBLENBQ2xCO0FBQUEsTUFBQSxLQUFBLEVBQU8sSUFBUDtLQURrQixDQUFyQixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsQ0FDRztBQUFBLE1BQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxNQUNBLEdBQUEsRUFBSyxTQUFTLENBQUMsZUFBVixDQUEwQixNQUExQixDQUFBLEdBQW9DLEdBQXBDLEdBQTBDLGlCQUQvQztLQURILENBSEEsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsVUFBZCxFQUEwQixJQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsQ0FBbEIsQ0FBMUIsQ0FQQSxDQUFBO0FBQUEsSUFTQSxJQUFBLEdBQVcsSUFBQSx1QkFBQSxDQUNSO0FBQUEsTUFBQSxhQUFBLEVBQWUsSUFBQyxDQUFBLGFBQWhCO0FBQUEsTUFDQSxRQUFBLEVBQVUsSUFBQyxDQUFBLFFBRFg7S0FEUSxDQVRYLENBQUE7V0FhQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLElBQXRCLEVBZHNCO0VBQUEsQ0E1RnpCLENBQUE7O0FBQUEsc0JBK0dBLGtCQUFBLEdBQW9CLFNBQUEsR0FBQTtBQUNqQixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUNsQjtBQUFBLE1BQUEsS0FBQSxFQUFPLElBQVA7S0FEa0IsQ0FBckIsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQ0c7QUFBQSxNQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsTUFDQSxHQUFBLEVBQUssU0FBUyxDQUFDLGVBQVYsQ0FBMEIsTUFBMUIsQ0FBQSxHQUFvQyxHQUFwQyxHQUEwQyxpQkFEL0M7S0FESCxDQUhBLENBQUE7QUFBQSxJQU9BLElBQUEsR0FBVyxJQUFBLGFBQUEsQ0FDUjtBQUFBLE1BQUEsa0JBQUEsRUFBd0IsSUFBQSxrQkFBQSxDQUFBLENBQXhCO0tBRFEsQ0FQWCxDQUFBO1dBVUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxFQUFzQixJQUF0QixFQVhpQjtFQUFBLENBL0dwQixDQUFBOztBQUFBLHNCQThIQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFDaEIsUUFBQSxJQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FDbEI7QUFBQSxNQUFBLEtBQUEsRUFBTyxJQUFQO0tBRGtCLENBQXJCLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUNHO0FBQUEsTUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLE1BQ0EsR0FBQSxFQUFLLFNBQVMsQ0FBQyxlQUFWLENBQTBCLE1BQTFCLENBQUEsR0FBb0MsR0FBcEMsR0FBMEMsaUJBRC9DO0tBREgsQ0FIQSxDQUFBO0FBQUEsSUFPQSxJQUFBLEdBQVcsSUFBQSxZQUFBLENBQ1I7QUFBQSxNQUFBLEtBQUEsRUFBTyxJQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsQ0FBbEIsQ0FBb0IsQ0FBQyxHQUFyQixDQUF5QixhQUF6QixDQUF1QyxDQUFDLEVBQXhDLENBQTJDLENBQTNDLENBQVA7S0FEUSxDQVBYLENBQUE7V0FVQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLElBQXRCLEVBWGdCO0VBQUEsQ0E5SG5CLENBQUE7O0FBQUEsc0JBNklBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBRWIsUUFBQSxJQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FDbEI7QUFBQSxNQUFBLEtBQUEsRUFBTyxJQUFQO0tBRGtCLENBQXJCLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUNHO0FBQUEsTUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLE1BQ0EsR0FBQSxFQUFLLFNBQVMsQ0FBQyxlQUFWLENBQTBCLE1BQTFCLENBQUEsR0FBb0MsR0FBcEMsR0FBMEMsaUJBRC9DO0tBREgsQ0FIQSxDQUFBO0FBQUEsSUFPQSxJQUFBLEdBQVcsSUFBQSxTQUFBLENBQ1I7QUFBQSxNQUFBLFFBQUEsRUFBVSxJQUFDLENBQUEsUUFBWDtBQUFBLE1BQ0EsVUFBQSxFQUFZLElBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixDQUFsQixDQUFvQixDQUFDLEdBQXJCLENBQXlCLGFBQXpCLENBRFo7S0FEUSxDQVBYLENBQUE7V0FXQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLElBQXRCLEVBYmE7RUFBQSxDQTdJaEIsQ0FBQTs7QUFBQSxzQkE4SkEsa0JBQUEsR0FBb0IsU0FBQSxHQUFBO0FBRWpCLFFBQUEsb0VBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUNsQjtBQUFBLE1BQUEsS0FBQSxFQUFPLElBQVA7S0FEa0IsQ0FBckIsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQ0c7QUFBQSxNQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsTUFDQSxHQUFBLEVBQUssU0FBUyxDQUFDLGVBQVYsQ0FBMEIsTUFBMUIsQ0FBQSxHQUFvQyxHQUFwQyxHQUEwQyxpQkFEL0M7S0FESCxDQUhBLENBQUE7QUFBQSxJQVFBLFlBQUEsR0FBZSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBQ1osWUFBQSxJQUFBO0FBQUEsUUFBQSxJQUFBLEdBQVcsSUFBQSxXQUFBLENBQ1I7QUFBQSxVQUFBLFFBQUEsRUFBVSxLQUFDLENBQUEsUUFBWDtBQUFBLFVBQ0EsYUFBQSxFQUFlLEtBQUMsQ0FBQSxhQURoQjtTQURRLENBQVgsQ0FBQTtlQUlBLEtBTFk7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVJmLENBQUE7QUFBQSxJQWdCQSxHQUFBLEdBQU0sQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUNILFlBQUEsSUFBQTtBQUFBLFFBQUEsSUFBQSxHQUFXLElBQUEsWUFBQSxDQUNSO0FBQUEsVUFBQSxRQUFBLEVBQVUsS0FBQyxDQUFBLFFBQVg7U0FEUSxDQUFYLENBQUE7ZUFHQSxLQUpHO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FoQk4sQ0FBQTtBQUFBLElBdUJBLG1CQUFBLEdBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDbkIsWUFBQSxJQUFBO0FBQUEsUUFBQSxLQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxVQUFkLEVBQTBCLEtBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixDQUFsQixDQUExQixDQUFBLENBQUE7QUFBQSxRQUVBLElBQUEsR0FBVyxJQUFBLHVCQUFBLENBQ1I7QUFBQSxVQUFBLGFBQUEsRUFBZSxLQUFDLENBQUEsYUFBaEI7QUFBQSxVQUNBLFFBQUEsRUFBVSxLQUFDLENBQUEsUUFEWDtTQURRLENBRlgsQ0FBQTtlQU1BLEtBUG1CO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0F2QnRCLENBQUE7QUFBQSxJQWlDQSxTQUFBLEdBQVksQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUNULFlBQUEsSUFBQTtBQUFBLFFBQUEsSUFBQSxHQUFXLElBQUEsU0FBQSxDQUNSO0FBQUEsVUFBQSxRQUFBLEVBQVUsS0FBQyxDQUFBLFFBQVg7QUFBQSxVQUNBLFVBQUEsRUFBWSxLQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsQ0FBbEIsQ0FBb0IsQ0FBQyxHQUFyQixDQUF5QixhQUF6QixDQURaO1NBRFEsQ0FBWCxDQUFBO2VBSUEsS0FMUztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBakNaLENBQUE7QUFBQSxJQXdDQSxpQkFBQSxHQUF3QixJQUFBLElBQUEsQ0FBQSxDQXhDeEIsQ0FBQTtBQUFBLElBeUNBLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxNQUF0QixDQUE2QixZQUFBLENBQUEsQ0FBYyxDQUFDLE1BQWYsQ0FBQSxDQUF1QixDQUFDLEVBQXJELENBekNBLENBQUE7QUFBQSxJQTBDQSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsTUFBdEIsQ0FBNkIsR0FBQSxDQUFBLENBQUssQ0FBQyxNQUFOLENBQUEsQ0FBYyxDQUFDLEVBQTVDLENBMUNBLENBQUE7QUFBQSxJQTJDQSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsTUFBdEIsQ0FBNkIsbUJBQUEsQ0FBQSxDQUFxQixDQUFDLE1BQXRCLENBQUEsQ0FBOEIsQ0FBQyxFQUE1RCxDQTNDQSxDQUFBO0FBQUEsSUE0Q0EsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE1BQXRCLENBQTZCLFNBQUEsQ0FBQSxDQUFXLENBQUMsTUFBWixDQUFBLENBQW9CLENBQUMsRUFBbEQsQ0E1Q0EsQ0FBQTtXQThDQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLGlCQUF0QixFQWhEaUI7RUFBQSxDQTlKcEIsQ0FBQTs7QUFBQSxzQkFtTkEsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDYixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUNsQjtBQUFBLE1BQUEsS0FBQSxFQUFPLElBQVA7S0FEa0IsQ0FBckIsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQ0c7QUFBQSxNQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsTUFDQSxHQUFBLEVBQUssU0FBUyxDQUFDLGVBQVYsQ0FBMEIsTUFBMUIsQ0FBQSxHQUFvQyxHQUFwQyxHQUEwQyxpQkFEL0M7S0FESCxDQUhBLENBQUE7QUFBQSxJQU9BLElBQUEsR0FBVyxJQUFBLFNBQUEsQ0FDUjtBQUFBLE1BQUEsS0FBQSxFQUFXLElBQUEsY0FBQSxDQUFBLENBQVg7QUFBQSxNQUNBLFVBQUEsRUFBWSxJQUFDLENBQUEsYUFEYjtLQURRLENBUFgsQ0FBQTtXQVlBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE1BQWQsRUFBc0IsSUFBdEIsRUFiYTtFQUFBLENBbk5oQixDQUFBOztBQUFBLHNCQXNPQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1gsUUFBQSxJQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FDbEI7QUFBQSxNQUFBLEtBQUEsRUFBTyxJQUFQO0tBRGtCLENBQXJCLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUNHO0FBQUEsTUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLE1BQ0EsR0FBQSxFQUFLLFNBQVMsQ0FBQyxlQUFWLENBQTBCLE1BQTFCLENBQUEsR0FBb0MsR0FBcEMsR0FBMEMsaUJBRC9DO0tBREgsQ0FIQSxDQUFBO0FBQUEsSUFPQSxJQUFBLEdBQVcsSUFBQSxPQUFBLENBQ1I7QUFBQSxNQUFBLFFBQUEsRUFBVSxJQUFDLENBQUEsUUFBWDtBQUFBLE1BQ0EsYUFBQSxFQUFlLElBQUMsQ0FBQSxhQURoQjtLQURRLENBUFgsQ0FBQTtXQVlBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE1BQWQsRUFBc0IsSUFBdEIsRUFiVztFQUFBLENBdE9kLENBQUE7O21CQUFBOztHQUhxQixRQUFRLENBQUMsT0F6Q2pDLENBQUE7O0FBQUEsTUFzU00sQ0FBQyxPQUFQLEdBQWlCLFNBdFNqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsSUFBQTs7QUFBQSxJQVFBLEdBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFkLENBT0o7QUFBQSxFQUFBLFVBQUEsRUFBWSxTQUFDLE9BQUQsR0FBQTtXQUNULENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUFZLENBQUMsQ0FBQyxRQUFGLENBQVksT0FBQSxHQUFVLE9BQUEsSUFBVyxJQUFDLENBQUEsUUFBbEMsRUFBNEMsSUFBQyxDQUFBLFFBQUQsSUFBYSxFQUF6RCxDQUFaLEVBRFM7RUFBQSxDQUFaO0FBQUEsRUFZQSxNQUFBLEVBQVEsU0FBQyxZQUFELEdBQUE7QUFDTCxJQUFBLFlBQUEsR0FBZSxZQUFBLElBQWdCLEVBQS9CLENBQUE7QUFFQSxJQUFBLElBQUcsSUFBQyxDQUFBLFFBQUo7QUFHRyxNQUFBLElBQUcsSUFBQyxDQUFBLEtBQUQsWUFBa0IsUUFBUSxDQUFDLEtBQTlCO0FBQ0csUUFBQSxZQUFBLEdBQWUsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FBZixDQURIO09BQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQUMsQ0FBQSxRQUFELENBQVcsWUFBWCxDQUFWLENBSEEsQ0FISDtLQUZBO0FBQUEsSUFVQSxJQUFDLENBQUEsY0FBRCxDQUFBLENBVkEsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FYQSxDQUFBO1dBYUEsS0FkSztFQUFBLENBWlI7QUFBQSxFQWtDQSxNQUFBLEVBQVEsU0FBQyxPQUFELEdBQUE7QUFDTCxJQUFBLElBQUMsQ0FBQSxvQkFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQUEsQ0FEQSxDQUFBO1dBRUEsSUFBQyxDQUFBLGdCQUFELENBQUEsRUFISztFQUFBLENBbENSO0FBQUEsRUE4Q0EsSUFBQSxFQUFNLFNBQUMsT0FBRCxHQUFBO1dBQ0gsUUFBUSxDQUFDLEdBQVQsQ0FBYSxJQUFDLENBQUEsR0FBZCxFQUFtQjtBQUFBLE1BQUUsU0FBQSxFQUFXLENBQWI7S0FBbkIsRUFERztFQUFBLENBOUNOO0FBQUEsRUF1REEsSUFBQSxFQUFNLFNBQUMsT0FBRCxHQUFBO1dBQ0gsUUFBUSxDQUFDLEdBQVQsQ0FBYSxJQUFDLENBQUEsR0FBZCxFQUNHO0FBQUEsTUFBQSxTQUFBLEVBQVcsQ0FBWDtBQUFBLE1BQ0EsVUFBQSxFQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDVCxVQUFBLHNCQUFHLE9BQU8sQ0FBRSxlQUFaO21CQUNHLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFESDtXQURTO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEWjtLQURILEVBREc7RUFBQSxDQXZETjtBQUFBLEVBb0VBLGlCQUFBLEVBQW1CLFNBQUEsR0FBQSxDQXBFbkI7QUFBQSxFQTJFQSxvQkFBQSxFQUFzQixTQUFBLEdBQUE7V0FDbkIsSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQURtQjtFQUFBLENBM0V0QjtDQVBJLENBUlAsQ0FBQTs7QUFBQSxNQStGTSxDQUFDLE9BQVAsR0FBaUIsSUEvRmpCLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEseUZBQUE7RUFBQTtpU0FBQTs7QUFBQSxJQVFBLEdBQTBCLE9BQUEsQ0FBUSwwQkFBUixDQVIxQixDQUFBOztBQUFBLFdBU0EsR0FBMEIsT0FBQSxDQUFRLGtEQUFSLENBVDFCLENBQUE7O0FBQUEsdUJBVUEsR0FBMEIsT0FBQSxDQUFRLDBFQUFSLENBVjFCLENBQUE7O0FBQUEsU0FXQSxHQUEwQixPQUFBLENBQVEsMERBQVIsQ0FYMUIsQ0FBQTs7QUFBQSxZQVlBLEdBQTBCLE9BQUEsQ0FBUSxtREFBUixDQVoxQixDQUFBOztBQUFBLFFBYUEsR0FBMEIsT0FBQSxDQUFRLGlDQUFSLENBYjFCLENBQUE7O0FBQUE7QUFtQkcsK0JBQUEsQ0FBQTs7OztHQUFBOztBQUFBLHVCQUFBLFFBQUEsR0FBVSxRQUFWLENBQUE7O0FBQUEsdUJBR0EsVUFBQSxHQUFZLFNBQUMsT0FBRCxHQUFBO1dBQ1QsMkNBQU0sT0FBTixFQURTO0VBQUEsQ0FIWixDQUFBOztBQUFBLHVCQU9BLE1BQUEsR0FBUSxTQUFDLE9BQUQsR0FBQTtBQUNMLElBQUEsdUNBQU0sT0FBTixDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxxQkFBRCxHQUEyQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSx5QkFBVixDQUYzQixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsWUFBRCxHQUEyQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxlQUFWLENBSDNCLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSx1QkFBRCxHQUEyQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSwwQkFBVixDQUozQixDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsbUJBQUQsR0FBMkIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsc0JBQVYsQ0FMM0IsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLG1CQUFELEdBQTJCLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxJQUFyQixDQUEwQixzQkFBMUIsQ0FOM0IsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLFVBQUQsR0FBMkIsSUFBQyxDQUFBLG1CQUFtQixDQUFDLElBQXJCLENBQTBCLFlBQTFCLENBUDNCLENBQUE7QUFBQSxJQVFBLElBQUMsQ0FBQSxJQUFELEdBQTJCLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxJQUFyQixDQUEwQixNQUExQixDQVIzQixDQUFBO0FBQUEsSUFTQSxJQUFDLENBQUEsU0FBRCxHQUEyQixJQUFDLENBQUEsbUJBQW1CLENBQUMsSUFBckIsQ0FBMEIsWUFBMUIsQ0FUM0IsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FYQSxDQUFBO0FBQUEsSUFZQSxJQUFDLENBQUEsd0JBQUQsQ0FBQSxDQVpBLENBQUE7QUFBQSxJQWFBLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FiQSxDQUFBO0FBQUEsSUFjQSxJQUFDLENBQUEsU0FBRCxDQUFBLENBZEEsQ0FBQTtXQWdCQSxLQWpCSztFQUFBLENBUFIsQ0FBQTs7QUFBQSx1QkE0QkEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO0FBQ2hCLElBQUEsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxXQUFBLENBQ2hCO0FBQUEsTUFBQSxRQUFBLEVBQVUsSUFBQyxDQUFBLFFBQVg7QUFBQSxNQUNBLGFBQUEsRUFBZSxJQUFDLENBQUEsYUFEaEI7S0FEZ0IsQ0FBbkIsQ0FBQTtXQUlBLElBQUMsQ0FBQSxZQUFZLENBQUMsSUFBZCxDQUFtQixJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWIsQ0FBQSxDQUFxQixDQUFDLEVBQXpDLEVBTGdCO0VBQUEsQ0E1Qm5CLENBQUE7O0FBQUEsdUJBcUNBLHdCQUFBLEdBQTBCLFNBQUEsR0FBQTtBQUN2QixJQUFBLElBQUMsQ0FBQSxrQkFBRCxHQUEwQixJQUFBLHVCQUFBLENBQ3ZCO0FBQUEsTUFBQSxRQUFBLEVBQVUsSUFBQyxDQUFBLFFBQVg7QUFBQSxNQUNBLGFBQUEsRUFBZSxJQUFDLENBQUEsYUFEaEI7S0FEdUIsQ0FBMUIsQ0FBQTtXQUlBLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxJQUFyQixDQUEwQixJQUFDLENBQUEsa0JBQWtCLENBQUMsTUFBcEIsQ0FBQSxDQUE0QixDQUFDLEVBQXZELEVBTHVCO0VBQUEsQ0FyQzFCLENBQUE7O0FBQUEsdUJBOENBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2QsSUFBQSxJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLFNBQUEsQ0FDZDtBQUFBLE1BQUEsUUFBQSxFQUFVLElBQUMsQ0FBQSxRQUFYO0FBQUEsTUFDQSxVQUFBLEVBQVksSUFBQyxDQUFBLGFBQWEsQ0FBQyxFQUFmLENBQWtCLENBQWxCLENBQW9CLENBQUMsR0FBckIsQ0FBeUIsYUFBekIsQ0FEWjtLQURjLENBQWpCLENBQUE7V0FJQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxFQUFyQyxFQUxjO0VBQUEsQ0E5Q2pCLENBQUE7O0FBQUEsdUJBdURBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDUixJQUFBLElBQUMsQ0FBQSxHQUFELEdBQVcsSUFBQSxZQUFBLENBQ1I7QUFBQSxNQUFBLFFBQUEsRUFBVSxJQUFDLENBQUEsUUFBWDtLQURRLENBQVgsQ0FBQTtXQUdBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFBLENBQWEsQ0FBQyxFQUF6QixFQUpRO0VBQUEsQ0F2RFgsQ0FBQTs7b0JBQUE7O0dBSHNCLEtBaEJ6QixDQUFBOztBQUFBLE1Bb0ZNLENBQUMsT0FBUCxHQUFpQixVQXBGakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLGlEQUFBO0VBQUE7O2lTQUFBOztBQUFBLFNBT0EsR0FBWSxPQUFBLENBQVEsa0NBQVIsQ0FQWixDQUFBOztBQUFBLFFBUUEsR0FBWSxPQUFBLENBQVEsaUNBQVIsQ0FSWixDQUFBOztBQUFBLElBU0EsR0FBWSxPQUFBLENBQVEsNkJBQVIsQ0FUWixDQUFBOztBQUFBLFFBVUEsR0FBWSxPQUFBLENBQVEsOEJBQVIsQ0FWWixDQUFBOztBQUFBO0FBbUJHLGlDQUFBLENBQUE7Ozs7O0dBQUE7O0FBQUEseUJBQUEsUUFBQSxHQUFVLElBQVYsQ0FBQTs7QUFBQSx5QkFNQSxRQUFBLEdBQVUsUUFOVixDQUFBOztBQUFBLHlCQWFBLGtCQUFBLEdBQW9CLEVBYnBCLENBQUE7O0FBQUEseUJBbUJBLGNBQUEsR0FBZ0IsSUFuQmhCLENBQUE7O0FBQUEseUJBeUJBLGlCQUFBLEdBQW1CLEVBekJuQixDQUFBOztBQUFBLHlCQWdDQSxPQUFBLEdBQVMsSUFoQ1QsQ0FBQTs7QUFBQSx5QkFxQ0EsTUFBQSxHQUNHO0FBQUEsSUFBQSwwQkFBQSxFQUE0QixtQkFBNUI7QUFBQSxJQUNBLDBCQUFBLEVBQTRCLG1CQUQ1QjtBQUFBLElBRUEsMEJBQUEsRUFBNEIsU0FGNUI7QUFBQSxJQUdBLDBCQUFBLEVBQTRCLFNBSDVCO0dBdENILENBQUE7O0FBQUEseUJBa0RBLE1BQUEsR0FBUSxTQUFDLE9BQUQsR0FBQTtBQUNMLElBQUEseUNBQU0sT0FBTixDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxTQUFELEdBQWUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsWUFBVixDQUZmLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsZUFBVixDQUhmLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsZUFBVixDQUpmLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsS0FBZCxDQU5YLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixJQUFDLENBQUEsT0FBakIsQ0FQQSxDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBUkEsQ0FBQTtXQVVBLEtBWEs7RUFBQSxDQWxEUixDQUFBOztBQUFBLHlCQW9FQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7V0FDaEIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsUUFBWCxFQUFxQixRQUFRLENBQUMsVUFBOUIsRUFBMEMsSUFBQyxDQUFBLFdBQTNDLEVBRGdCO0VBQUEsQ0FwRW5CLENBQUE7O0FBQUEseUJBNkVBLFdBQUEsR0FBYSxTQUFBLEdBQUE7V0FDVixJQUFDLENBQUEsY0FBRCxHQUFrQixXQUFBLENBQVksQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUMzQixZQUFBLEdBQUE7QUFBQSxRQUFBLEdBQUEsR0FBTSxLQUFDLENBQUEsT0FBUCxDQUFBO0FBRUEsUUFBQSxJQUFHLEdBQUEsR0FBTSxTQUFTLENBQUMsT0FBbkI7QUFDRyxVQUFBLEdBQUEsSUFBTyxLQUFDLENBQUEsaUJBQVIsQ0FESDtTQUFBLE1BQUE7QUFJRyxVQUFBLEdBQUEsR0FBTSxTQUFTLENBQUMsT0FBaEIsQ0FKSDtTQUZBO0FBQUEsUUFRQSxLQUFDLENBQUEsT0FBRCxHQUFXLEdBUlgsQ0FBQTtlQVNBLEtBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixLQUFDLENBQUEsT0FBakIsRUFWMkI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLEVBYWhCLElBQUMsQ0FBQSxrQkFiZSxFQURSO0VBQUEsQ0E3RWIsQ0FBQTs7QUFBQSx5QkFtR0EsV0FBQSxHQUFhLFNBQUEsR0FBQTtXQUNWLElBQUMsQ0FBQSxjQUFELEdBQWtCLFdBQUEsQ0FBWSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBQzNCLFlBQUEsR0FBQTtBQUFBLFFBQUEsR0FBQSxHQUFNLEtBQUMsQ0FBQSxPQUFQLENBQUE7QUFFQSxRQUFBLElBQUcsR0FBQSxHQUFNLENBQVQ7QUFDRyxVQUFBLEdBQUEsSUFBTyxLQUFDLENBQUEsaUJBQVIsQ0FESDtTQUFBLE1BQUE7QUFJRyxVQUFBLEdBQUEsR0FBTSxDQUFOLENBSkg7U0FGQTtBQUFBLFFBUUEsS0FBQyxDQUFBLE9BQUQsR0FBVyxHQVJYLENBQUE7ZUFTQSxLQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsS0FBQyxDQUFBLE9BQWpCLEVBVjJCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWixFQWFoQixJQUFDLENBQUEsa0JBYmUsRUFEUjtFQUFBLENBbkdiLENBQUE7O0FBQUEseUJBZ0lBLGlCQUFBLEdBQW1CLFNBQUMsS0FBRCxHQUFBO1dBQ2hCLElBQUMsQ0FBQSxXQUFELENBQUEsRUFEZ0I7RUFBQSxDQWhJbkIsQ0FBQTs7QUFBQSx5QkEwSUEsaUJBQUEsR0FBbUIsU0FBQyxLQUFELEdBQUE7V0FDaEIsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQURnQjtFQUFBLENBMUluQixDQUFBOztBQUFBLHlCQW9KQSxPQUFBLEdBQVMsU0FBQyxLQUFELEdBQUE7QUFDTixJQUFBLGFBQUEsQ0FBYyxJQUFDLENBQUEsY0FBZixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBRGxCLENBQUE7V0FHQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxLQUFkLEVBQXFCLEtBQUEsR0FBUSxJQUFDLENBQUEsT0FBOUIsRUFKTTtFQUFBLENBcEpULENBQUE7O0FBQUEseUJBZ0tBLFdBQUEsR0FBYSxTQUFDLEtBQUQsR0FBQSxDQWhLYixDQUFBOztzQkFBQTs7R0FOd0IsS0FiM0IsQ0FBQTs7QUFBQSxNQXlMTSxDQUFDLE9BQVAsR0FBaUIsWUF6TGpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxxQ0FBQTtFQUFBO2lTQUFBOztBQUFBLFFBT0EsR0FBVyxPQUFBLENBQVEsaUNBQVIsQ0FQWCxDQUFBOztBQUFBLElBUUEsR0FBVyxPQUFBLENBQVEsNkJBQVIsQ0FSWCxDQUFBOztBQUFBLFFBU0EsR0FBVyxPQUFBLENBQVEsd0NBQVIsQ0FUWCxDQUFBOztBQUFBO0FBa0JHLGdDQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSx3QkFBQSxRQUFBLEdBQVUsSUFBVixDQUFBOztBQUFBLHdCQU1BLGFBQUEsR0FBZSxJQU5mLENBQUE7O0FBQUEsd0JBWUEsUUFBQSxHQUFVLElBWlYsQ0FBQTs7QUFBQSx3QkFrQkEsUUFBQSxHQUFVLFFBbEJWLENBQUE7O0FBQUEsd0JBc0JBLE1BQUEsR0FDRztBQUFBLElBQUEsb0JBQUEsRUFBd0IsZ0JBQXhCO0FBQUEsSUFDQSxxQkFBQSxFQUF3QixpQkFEeEI7R0F2QkgsQ0FBQTs7QUFBQSx3QkFpQ0EsTUFBQSxHQUFRLFNBQUMsT0FBRCxHQUFBO0FBQ0wsSUFBQSx3Q0FBTSxPQUFOLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxZQUFWLENBRmIsQ0FBQTtBQUlBLElBQUEsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxVQUFkLENBQUEsS0FBNkIsSUFBaEM7QUFDRyxNQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFVBQWQsRUFBMEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxFQUFmLENBQWtCLENBQWxCLENBQTFCLENBQUEsQ0FESDtLQUpBO0FBQUEsSUFPQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsVUFBZCxDQUF5QixDQUFDLEdBQTFCLENBQThCLE9BQTlCLENBQWhCLENBUEEsQ0FBQTtXQVNBLEtBVks7RUFBQSxDQWpDUixDQUFBOztBQUFBLHdCQW1EQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7V0FDaEIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsUUFBWCxFQUFxQixRQUFRLENBQUMsVUFBOUIsRUFBMEMsSUFBQyxDQUFBLFdBQTNDLEVBRGdCO0VBQUEsQ0FuRG5CLENBQUE7O0FBQUEsd0JBaUVBLGNBQUEsR0FBZ0IsU0FBQyxLQUFELEdBQUE7V0FDYixJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxVQUFkLEVBQTBCLElBQUMsQ0FBQSxhQUFhLENBQUMsV0FBZixDQUFBLENBQTFCLEVBRGE7RUFBQSxDQWpFaEIsQ0FBQTs7QUFBQSx3QkEwRUEsZUFBQSxHQUFpQixTQUFDLEtBQUQsR0FBQTtXQUNkLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFVBQWQsRUFBMEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FBMUIsRUFEYztFQUFBLENBMUVqQixDQUFBOztBQUFBLHdCQW1GQSxXQUFBLEdBQWEsU0FBQyxLQUFELEdBQUE7QUFDVixJQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUExQixDQUFBO1dBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE9BQWQsQ0FBaEIsRUFGVTtFQUFBLENBbkZiLENBQUE7O3FCQUFBOztHQU51QixLQVoxQixDQUFBOztBQUFBLE1Bb0hNLENBQUMsT0FBUCxHQUFpQixXQXBIakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7OztHQUFBO0FBQUEsSUFBQSxvQ0FBQTtFQUFBO2lTQUFBOztBQUFBLFFBU0EsR0FBYyxPQUFBLENBQVEsb0NBQVIsQ0FUZCxDQUFBOztBQUFBLElBVUEsR0FBYyxPQUFBLENBQVEsZ0NBQVIsQ0FWZCxDQUFBOztBQUFBLFFBV0EsR0FBYyxPQUFBLENBQVEscUNBQVIsQ0FYZCxDQUFBOztBQUFBO0FBb0JHLCtCQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSx1QkFBQSxTQUFBLEdBQVcsWUFBWCxDQUFBOztBQUFBLHVCQU1BLFFBQUEsR0FBVSxRQU5WLENBQUE7O0FBQUEsdUJBWUEsS0FBQSxHQUFPLElBWlAsQ0FBQTs7QUFBQSx1QkFrQkEsUUFBQSxHQUFVLElBbEJWLENBQUE7O0FBQUEsdUJBdUJBLE1BQUEsR0FDRztBQUFBLElBQUEsVUFBQSxFQUFZLFNBQVo7R0F4QkgsQ0FBQTs7QUFBQSx1QkFpQ0EsT0FBQSxHQUFTLFNBQUMsS0FBRCxHQUFBO0FBQ04sSUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxtQkFBZCxFQUFtQyxJQUFDLENBQUEsS0FBcEMsQ0FBQSxDQUFBO1dBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWMsVUFBZCxFQUZNO0VBQUEsQ0FqQ1QsQ0FBQTs7b0JBQUE7O0dBTnNCLEtBZHpCLENBQUE7O0FBQUEsTUE2RE0sQ0FBQyxPQUFQLEdBQWlCLFVBN0RqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsNkRBQUE7RUFBQTs7aVNBQUE7O0FBQUEsUUFPQSxHQUFjLE9BQUEsQ0FBUSxvQ0FBUixDQVBkLENBQUE7O0FBQUEsSUFRQSxHQUFjLE9BQUEsQ0FBUSxnQ0FBUixDQVJkLENBQUE7O0FBQUEsVUFTQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUixDQVRkLENBQUE7O0FBQUEsUUFVQSxHQUFjLE9BQUEsQ0FBUSwyQ0FBUixDQVZkLENBQUE7O0FBQUE7QUFtQkcsNENBQUEsQ0FBQTs7Ozs7O0dBQUE7O0FBQUEsb0NBQUEsUUFBQSxHQUFVLFFBQVYsQ0FBQTs7QUFBQSxvQ0FNQSxRQUFBLEdBQVUsSUFOVixDQUFBOztBQUFBLG9DQVlBLGFBQUEsR0FBZSxJQVpmLENBQUE7O0FBQUEsb0NBa0JBLFFBQUEsR0FBVSxJQWxCVixDQUFBOztBQUFBLG9DQXdCQSxlQUFBLEdBQWlCLElBeEJqQixDQUFBOztBQUFBLG9DQWlDQSxVQUFBLEdBQVksU0FBQyxPQUFELEdBQUE7QUFDVCxJQUFBLHdEQUFNLE9BQU4sQ0FBQSxDQUFBO1dBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxVQUFkLEVBSEg7RUFBQSxDQWpDWixDQUFBOztBQUFBLG9DQTRDQSxNQUFBLEdBQVEsU0FBQyxPQUFELEdBQUE7QUFDTCxJQUFBLG9EQUFNLE9BQU4sQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHdCQUFWLENBRmQsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FKQSxDQUFBO1dBTUEsS0FQSztFQUFBLENBNUNSLENBQUE7O0FBQUEsb0NBMERBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNoQixJQUFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLEVBQW5CLENBQUE7V0FFQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxhQUFkLENBQTRCLENBQUMsSUFBN0IsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsS0FBRCxHQUFBO0FBQy9CLFlBQUEsVUFBQTtBQUFBLFFBQUEsVUFBQSxHQUFpQixJQUFBLFVBQUEsQ0FDZDtBQUFBLFVBQUEsUUFBQSxFQUFVLEtBQUMsQ0FBQSxRQUFYO0FBQUEsVUFDQSxLQUFBLEVBQU8sS0FEUDtTQURjLENBQWpCLENBQUE7QUFBQSxRQUlBLEtBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixVQUFVLENBQUMsTUFBWCxDQUFBLENBQW1CLENBQUMsRUFBdkMsQ0FKQSxDQUFBO2VBS0EsS0FBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFzQixVQUF0QixFQU4rQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLEVBSGdCO0VBQUEsQ0ExRG5CLENBQUE7O0FBQUEsb0NBMEVBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNoQixJQUFBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFFBQVgsRUFBcUIsUUFBUSxDQUFDLFVBQTlCLEVBQTBDLElBQUMsQ0FBQSxXQUEzQyxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxRQUFYLEVBQXFCLFFBQVEsQ0FBQyxpQkFBOUIsRUFBaUQsSUFBQyxDQUFBLGtCQUFsRCxFQUZnQjtFQUFBLENBMUVuQixDQUFBOztBQUFBLG9DQWtGQSxvQkFBQSxHQUFzQixTQUFBLEdBQUE7V0FDbkIsSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQURtQjtFQUFBLENBbEZ0QixDQUFBOztBQUFBLG9DQWtHQSxXQUFBLEdBQWEsU0FBQyxLQUFELEdBQUE7QUFDVixJQUFBLElBQUMsQ0FBQSxvQkFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBRjFCLENBQUE7QUFBQSxJQUlBLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLGVBQVIsRUFBeUIsU0FBQyxVQUFELEdBQUE7YUFDdEIsVUFBVSxDQUFDLE1BQVgsQ0FBQSxFQURzQjtJQUFBLENBQXpCLENBSkEsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FQQSxDQUFBO1dBUUEsSUFBQyxDQUFBLGlCQUFELENBQUEsRUFUVTtFQUFBLENBbEdiLENBQUE7O0FBQUEsb0NBZ0hBLGtCQUFBLEdBQW9CLFNBQUMsS0FBRCxHQUFBO1dBQ2pCLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixhQUFqQixDQUErQixDQUFDLFdBQWhDLENBQTRDLFVBQTVDLEVBRGlCO0VBQUEsQ0FoSHBCLENBQUE7O0FBQUEsb0NBdUhBLFdBQUEsR0FBYSxTQUFDLEtBQUQsR0FBQTtXQUNWLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFVBQWQsRUFBMEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FBMUIsRUFEVTtFQUFBLENBdkhiLENBQUE7O2lDQUFBOztHQU5tQyxLQWJ0QyxDQUFBOztBQUFBLE1BaUpNLENBQUMsT0FBUCxHQUFpQix1QkFqSmpCLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLHVFQUFBO0VBQUE7aVNBQUE7O0FBQUEsbUJBT0EsR0FBc0IsT0FBQSxDQUFRLG1EQUFSLENBUHRCLENBQUE7O0FBQUEsY0FRQSxHQUFzQixPQUFBLENBQVEsOENBQVIsQ0FSdEIsQ0FBQTs7QUFBQSxJQVNBLEdBQXNCLE9BQUEsQ0FBUSxnQ0FBUixDQVR0QixDQUFBOztBQUFBLFNBVUEsR0FBc0IsT0FBQSxDQUFRLG9CQUFSLENBVnRCLENBQUE7O0FBQUEsUUFXQSxHQUFzQixPQUFBLENBQVEsbUNBQVIsQ0FYdEIsQ0FBQTs7QUFBQTtBQW9CRyw0QkFBQSxDQUFBOzs7O0dBQUE7O0FBQUEsb0JBQUEsU0FBQSxHQUFXLG9CQUFYLENBQUE7O0FBQUEsb0JBTUEsUUFBQSxHQUFVLFFBTlYsQ0FBQTs7QUFBQSxvQkFZQSxhQUFBLEdBQWUsSUFaZixDQUFBOztBQUFBLG9CQWtCQSxRQUFBLEdBQVUsSUFsQlYsQ0FBQTs7QUFBQSxvQkF3QkEsVUFBQSxHQUFZLElBeEJaLENBQUE7O0FBQUEsb0JBOEJBLGNBQUEsR0FBZ0IsSUE5QmhCLENBQUE7O0FBQUEsb0JBb0NBLE1BQUEsR0FBUSxDQUFDLEdBQUQsRUFBSyxHQUFMLEVBQVMsR0FBVCxFQUFhLEdBQWIsRUFBaUIsR0FBakIsRUFBc0IsR0FBdEIsRUFBMkIsR0FBM0IsRUFBZ0MsR0FBaEMsRUFBcUMsR0FBckMsRUFBMEMsR0FBMUMsRUFBK0MsR0FBL0MsRUFBb0QsR0FBcEQsRUFBeUQsR0FBekQsRUFBOEQsR0FBOUQsRUFBbUUsR0FBbkUsRUFBd0UsR0FBeEUsQ0FwQ1IsQ0FBQTs7QUFBQSxvQkE2Q0EsTUFBQSxHQUFRLFNBQUMsT0FBRCxHQUFBO0FBR0wsSUFBQSxvQ0FBTTtBQUFBLE1BQ0gsUUFBQSxFQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFBLENBRFA7QUFBQSxNQUVILGVBQUEsRUFBaUIsSUFBQyxDQUFBLHlCQUFELENBQUEsQ0FGZDtLQUFOLENBQUEsQ0FBQTtBQUFBLElBTUEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFDLENBQUEsY0FBUixFQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxTQUFELEdBQUE7QUFDckIsWUFBQSxFQUFBO0FBQUEsUUFBQSxFQUFBLEdBQUssU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFoQixDQUFvQixJQUFwQixDQUFMLENBQUE7ZUFDQSxLQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVyxHQUFBLEdBQUUsRUFBYixDQUFtQixDQUFDLElBQXBCLENBQXlCLFNBQVMsQ0FBQyxNQUFWLENBQUEsQ0FBa0IsQ0FBQyxFQUE1QyxFQUZxQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLENBTkEsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLGFBQUQsR0FBd0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsaUJBQVYsQ0FYeEIsQ0FBQTtBQUFBLElBWUEsSUFBQyxDQUFBLG9CQUFELEdBQXdCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHdCQUFWLENBWnhCLENBQUE7V0FjQSxLQWpCSztFQUFBLENBN0NSLENBQUE7O0FBQUEsb0JBc0VBLGtCQUFBLEdBQW9CLFNBQUEsR0FBQTtBQUVqQixRQUFBLHdCQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLG1CQUFBLENBQUEsQ0FBbEIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGNBQUQsR0FBa0IsRUFEbEIsQ0FBQTtBQUFBLElBRUEsUUFBQSxHQUFXLEVBRlgsQ0FBQTtBQUFBLElBR0EsSUFBQSxHQUFPLEVBSFAsQ0FBQTtBQUFBLElBSUEsUUFBQSxHQUFXLENBSlgsQ0FBQTtBQUFBLElBT0EsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLEtBQUwsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxLQUFELEdBQUE7QUFDUixZQUFBLEdBQUE7QUFBQSxRQUFBLEdBQUEsR0FBTyxFQUFQLENBQUE7QUFBQSxRQUdBLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxLQUFMLENBQVcsU0FBQyxLQUFELEdBQUE7QUFLUixjQUFBLGdCQUFBO0FBQUEsVUFBQSxLQUFBLEdBQVksSUFBQSxjQUFBLENBQ1Q7QUFBQSxZQUFBLE9BQUEsRUFBUyxLQUFDLENBQUEsTUFBTyxDQUFBLFFBQUEsQ0FBakI7V0FEUyxDQUFaLENBQUE7QUFBQSxVQUdBLFNBQUEsR0FBZ0IsSUFBQSxTQUFBLENBQ2I7QUFBQSxZQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsWUFDQSxVQUFBLEVBQVksS0FBQyxDQUFBLGFBRGI7V0FEYSxDQUhoQixDQUFBO0FBQUEsVUFPQSxLQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsS0FBaEIsQ0FQQSxDQUFBO0FBQUEsVUFRQSxLQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLFNBQXJCLENBUkEsQ0FBQTtBQUFBLFVBU0EsUUFBQSxFQVRBLENBQUE7aUJBV0EsR0FBRyxDQUFDLElBQUosQ0FBUztBQUFBLFlBQ04sRUFBQSxFQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBaEIsQ0FBb0IsSUFBcEIsQ0FERTtXQUFULEVBaEJRO1FBQUEsQ0FBWCxDQUhBLENBQUE7ZUF1QkEsSUFBSSxDQUFDLElBQUwsQ0FBVTtBQUFBLFVBQ1AsRUFBQSxFQUFLLFVBQUEsR0FBUyxLQURQO0FBQUEsVUFFUCxHQUFBLEVBQUssR0FGRTtTQUFWLEVBeEJRO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQVBBLENBQUE7QUFBQSxJQW9DQSxRQUFRLENBQUMsSUFBVCxHQUFnQixJQXBDaEIsQ0FBQTtXQXNDQSxTQXhDaUI7RUFBQSxDQXRFcEIsQ0FBQTs7QUFBQSxvQkF1SEEseUJBQUEsR0FBMkIsU0FBQSxHQUFBO0FBQ3hCLFFBQUEsZUFBQTtBQUFBLElBQUEsZUFBQSxHQUFrQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsR0FBRCxHQUFBO0FBQ2xDLFlBQUEsV0FBQTtBQUFBLFFBQUEsV0FBQSxHQUFjLEdBQUcsQ0FBQyxHQUFKLENBQVEsYUFBUixDQUFzQixDQUFDLEdBQXZCLENBQTJCLFNBQUMsVUFBRCxHQUFBO2lCQUN0QyxVQUFVLENBQUMsTUFBWCxDQUFBLEVBRHNDO1FBQUEsQ0FBM0IsQ0FBZCxDQUFBO0FBR0EsZUFBTztBQUFBLFVBQ0osS0FBQSxFQUFPLEdBQUcsQ0FBQyxHQUFKLENBQVEsT0FBUixDQURIO0FBQUEsVUFFSixXQUFBLEVBQWEsV0FGVDtTQUFQLENBSmtDO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsQ0FBbEIsQ0FBQTtXQVNBLGdCQVZ3QjtFQUFBLENBdkgzQixDQUFBOztBQUFBLG9CQXlJQSxpQkFBQSxHQUFtQixTQUFBLEdBQUEsQ0F6SW5CLENBQUE7O2lCQUFBOztHQU5tQixLQWR0QixDQUFBOztBQUFBLE1BcUtNLENBQUMsT0FBUCxHQUFpQixPQXJLakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLDhDQUFBO0VBQUE7O2lTQUFBOztBQUFBLFNBT0EsR0FBWSxPQUFBLENBQVEscUNBQVIsQ0FQWixDQUFBOztBQUFBLFFBUUEsR0FBWSxPQUFBLENBQVEsb0NBQVIsQ0FSWixDQUFBOztBQUFBLElBU0EsR0FBWSxPQUFBLENBQVEsZ0NBQVIsQ0FUWixDQUFBOztBQUFBLFFBVUEsR0FBWSxPQUFBLENBQVEscUNBQVIsQ0FWWixDQUFBOztBQUFBO0FBbUJHLDhCQUFBLENBQUE7Ozs7Ozs7OztHQUFBOztBQUFBLHNCQUFBLE9BQUEsR0FBUyxJQUFULENBQUE7O0FBQUEsc0JBTUEsU0FBQSxHQUFXLFlBTlgsQ0FBQTs7QUFBQSxzQkFZQSxRQUFBLEdBQVUsUUFaVixDQUFBOztBQUFBLHNCQWtCQSxLQUFBLEdBQU8sSUFsQlAsQ0FBQTs7QUFBQSxzQkF3QkEsV0FBQSxHQUFhLElBeEJiLENBQUE7O0FBQUEsc0JBOEJBLGFBQUEsR0FBZSxJQTlCZixDQUFBOztBQUFBLHNCQW1DQSxNQUFBLEdBQ0c7QUFBQSxJQUFBLFVBQUEsRUFBWSxTQUFaO0dBcENILENBQUE7O0FBQUEsc0JBeUNBLE1BQUEsR0FBUSxTQUFDLE9BQUQsR0FBQTtBQUNMLElBQUEsc0NBQU0sT0FBTixDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBRmxCLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxLQUFELEdBQWtCLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsT0FBckIsQ0FIbEIsQ0FBQTtXQUtBLEtBTks7RUFBQSxDQXpDUixDQUFBOztBQUFBLHNCQWtEQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ0wsUUFBQSxJQUFBOztVQUFjLENBQUUsTUFBaEIsQ0FBQTtLQUFBO1dBQ0Esb0NBQUEsRUFGSztFQUFBLENBbERSLENBQUE7O0FBQUEsc0JBeURBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNoQixJQUFBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLEtBQVgsRUFBa0IsUUFBUSxDQUFDLGNBQTNCLEVBQTJDLElBQUMsQ0FBQSxlQUE1QyxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxLQUFYLEVBQWtCLFFBQVEsQ0FBQyxpQkFBM0IsRUFBOEMsSUFBQyxDQUFBLGtCQUEvQyxFQUZnQjtFQUFBLENBekRuQixDQUFBOztBQUFBLHNCQWdFQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1QsUUFBQSxVQUFBO0FBQUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUCxDQUFnQixJQUFDLENBQUEsV0FBakIsQ0FBSDtBQUNHLE1BQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxXQUFQLENBQW1CLElBQUMsQ0FBQSxXQUFwQixDQUFBLENBREg7S0FBQTtBQUFBLElBR0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLG1CQUFYLENBSGIsQ0FBQTtBQUtBLElBQUEsSUFBTyxVQUFBLEtBQWMsSUFBckI7QUFDRyxNQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsVUFBVSxDQUFDLEdBQVgsQ0FBZSxNQUFmLENBQWYsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUCxDQUFnQixJQUFDLENBQUEsV0FBakIsRUFGSDtLQU5TO0VBQUEsQ0FoRVosQ0FBQTs7QUFBQSxzQkE2RUEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNQLFFBQUEsMEJBQUE7O1VBQWMsQ0FBRSxNQUFoQixDQUFBO0tBQUE7QUFBQSxJQUVBLFVBQUEsR0FBYSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxtQkFBWCxDQUZiLENBQUE7QUFJQSxJQUFBLElBQU8sVUFBQSxLQUFjLElBQXJCO0FBQ0csTUFBQSxRQUFBLEdBQVcsVUFBVSxDQUFDLEdBQVgsQ0FBZSxLQUFmLENBQVgsQ0FBQTtBQUdBLE1BQUEsSUFBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFyQixDQUE2QixNQUE3QixDQUFBLEtBQTBDLENBQUEsQ0FBN0M7QUFBcUQsUUFBQSxRQUFBLEdBQVcsRUFBWCxDQUFyRDtPQUhBO2FBS0EsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxJQUFBLENBQ2xCO0FBQUEsUUFBQSxNQUFBLEVBQVEsU0FBUyxDQUFDLGFBQWEsQ0FBQyxNQUFoQztBQUFBLFFBQ0EsSUFBQSxFQUFNLENBQUMsUUFBRCxDQUROO0FBQUEsUUFFQSxLQUFBLEVBQU8sSUFBQyxDQUFBLFVBRlI7T0FEa0IsRUFOeEI7S0FMTztFQUFBLENBN0VWLENBQUE7O0FBQUEsc0JBK0ZBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDVixRQUFBLElBQUE7O1VBQWMsQ0FBRSxNQUFoQixDQUFBO0tBQUE7V0FDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxtQkFBWCxFQUFnQyxJQUFoQyxFQUZVO0VBQUEsQ0EvRmIsQ0FBQTs7QUFBQSxzQkFzR0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNSLFFBQUEsSUFBQTs7VUFBYyxDQUFFLElBQWhCLENBQUE7S0FBQTtXQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFNBQVgsRUFBc0IsS0FBdEIsRUFGUTtFQUFBLENBdEdYLENBQUE7O0FBQUEsc0JBbUhBLE9BQUEsR0FBUyxTQUFDLEtBQUQsR0FBQTtBQUNOLElBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsU0FBWCxFQUFzQixJQUF0QixDQUFBLENBQUE7V0FFQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQVosRUFITTtFQUFBLENBbkhULENBQUE7O0FBQUEsc0JBMkhBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtXQUNMLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFVBQVgsRUFBdUIsSUFBdkIsRUFESztFQUFBLENBM0hSLENBQUE7O0FBQUEsc0JBaUlBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtXQUNMLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFVBQVgsRUFBdUIsSUFBdkIsRUFESztFQUFBLENBaklSLENBQUE7O0FBQUEsc0JBdUlBLE1BQUEsR0FBUSxTQUFDLEVBQUQsR0FBQTtBQUNMLFFBQUEsZUFBQTtBQUFBLElBQUEsZUFBQSxHQUFrQixJQUFDLENBQUEsbUJBQUQsQ0FBcUIsRUFBckIsQ0FBbEIsQ0FBQTtXQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUNHO0FBQUEsTUFBQSxVQUFBLEVBQVksS0FBWjtBQUFBLE1BQ0EsU0FBQSxFQUFXLElBRFg7QUFBQSxNQUVBLG1CQUFBLEVBQXFCLGVBRnJCO0tBREgsRUFISztFQUFBLENBdklSLENBQUE7O0FBQUEsc0JBa0pBLGVBQUEsR0FBaUIsU0FBQyxLQUFELEdBQUE7QUFDZCxRQUFBLE9BQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQXhCLENBQUE7QUFFQSxJQUFBLElBQUcsT0FBSDthQUNHLElBQUMsQ0FBQSxTQUFELENBQUEsRUFESDtLQUhjO0VBQUEsQ0FsSmpCLENBQUE7O0FBQUEsc0JBMEpBLGtCQUFBLEdBQW9CLFNBQUMsS0FBRCxHQUFBO0FBQ2pCLElBQUEsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsUUFBRCxDQUFBLEVBRmlCO0VBQUEsQ0ExSnBCLENBQUE7O0FBQUEsc0JBaUtBLFVBQUEsR0FBWSxTQUFBLEdBQUE7V0FDVCxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxTQUFYLEVBQXNCLEtBQXRCLEVBRFM7RUFBQSxDQWpLWixDQUFBOztBQUFBLHNCQTZLQSxtQkFBQSxHQUFxQixTQUFDLEVBQUQsR0FBQTtBQUNsQixRQUFBLGVBQUE7QUFBQSxJQUFBLGVBQUEsR0FBa0IsSUFBbEIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLFFBQUQsR0FBQTtlQUNkLFFBQVEsQ0FBQyxHQUFULENBQWEsYUFBYixDQUEyQixDQUFDLElBQTVCLENBQWlDLFNBQUMsS0FBRCxHQUFBO0FBQzlCLFVBQUEsSUFBRyxFQUFBLEtBQU0sS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWLENBQVQ7bUJBQ0csZUFBQSxHQUFrQixNQURyQjtXQUQ4QjtRQUFBLENBQWpDLEVBRGM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixDQUZBLENBQUE7QUFPQSxJQUFBLElBQUcsZUFBQSxLQUFtQixJQUF0QjtBQUNHLGFBQU8sS0FBUCxDQURIO0tBUEE7V0FVQSxnQkFYa0I7RUFBQSxDQTdLckIsQ0FBQTs7bUJBQUE7O0dBTnFCLEtBYnhCLENBQUE7O0FBQUEsTUFpTk0sQ0FBQyxPQUFQLEdBQWlCLFNBak5qQixDQUFBOzs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLGtEQUFBO0VBQUE7O2lTQUFBOztBQUFBLFNBT0EsR0FBYyxPQUFBLENBQVEscUNBQVIsQ0FQZCxDQUFBOztBQUFBLFFBUUEsR0FBYyxPQUFBLENBQVEsb0NBQVIsQ0FSZCxDQUFBOztBQUFBLElBU0EsR0FBYyxPQUFBLENBQVEsZ0NBQVIsQ0FUZCxDQUFBOztBQUFBLFFBVUEsR0FBYyxPQUFBLENBQVEseUNBQVIsQ0FWZCxDQUFBOztBQUFBO0FBbUJHLGtDQUFBLENBQUE7Ozs7OztHQUFBOztBQUFBLDBCQUFBLFNBQUEsR0FBVyxnQkFBWCxDQUFBOztBQUFBLDBCQU1BLE9BQUEsR0FBUyxJQU5ULENBQUE7O0FBQUEsMEJBWUEsUUFBQSxHQUFVLFFBWlYsQ0FBQTs7QUFBQSwwQkFrQkEsYUFBQSxHQUFlLElBbEJmLENBQUE7O0FBQUEsMEJBd0JBLGtCQUFBLEdBQW9CLElBeEJwQixDQUFBOztBQUFBLDBCQTZCQSxNQUFBLEdBQ0c7QUFBQSxJQUFBLFVBQUEsRUFBWSxTQUFaO0dBOUJILENBQUE7O0FBQUEsMEJBcUNBLE1BQUEsR0FBUSxTQUFDLE9BQUQsR0FBQTtBQUNMLFFBQUEsUUFBQTtBQUFBLElBQUEsMENBQU0sT0FBTixDQUFBLENBQUE7QUFBQSxJQUVBLFFBQUEsR0FBVyxJQUFDLENBQUEsa0JBQWtCLENBQUMsR0FBcEIsQ0FBd0IsWUFBeEIsQ0FBcUMsQ0FBQyxHQUF0QyxDQUEwQyxLQUExQyxDQUZYLENBQUE7QUFLQSxJQUFBLElBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBckIsQ0FBNkIsTUFBN0IsQ0FBQSxLQUEwQyxDQUFBLENBQTdDO0FBQXFELE1BQUEsUUFBQSxHQUFXLEVBQVgsQ0FBckQ7S0FMQTtBQUFBLElBT0EsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxJQUFBLENBQ2xCO0FBQUEsTUFBQSxNQUFBLEVBQVEsU0FBUyxDQUFDLGFBQWEsQ0FBQyxHQUFoQztBQUFBLE1BQ0EsSUFBQSxFQUFNLENBQUMsUUFBRCxDQUROO0FBQUEsTUFFQSxLQUFBLEVBQU8sSUFBQyxDQUFBLFVBRlI7S0FEa0IsQ0FQckIsQ0FBQTtXQVlBLEtBYks7RUFBQSxDQXJDUixDQUFBOztBQUFBLDBCQXlEQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ0wsSUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBQSxDQUFBLENBQUE7V0FDQSx3Q0FBQSxFQUZLO0VBQUEsQ0F6RFIsQ0FBQTs7QUFBQSwwQkFrRUEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO0FBQ2hCLElBQUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsa0JBQVgsRUFBK0IsUUFBUSxDQUFDLGVBQXhDLEVBQXlELElBQUMsQ0FBQSxnQkFBMUQsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxrQkFBWCxFQUErQixRQUFRLENBQUMsYUFBeEMsRUFBeUQsSUFBQyxDQUFBLGNBQTFELENBREEsQ0FBQTtXQUVBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLGtCQUFYLEVBQStCLFFBQVEsQ0FBQyxjQUF4QyxFQUF5RCxJQUFDLENBQUEsZUFBMUQsRUFIZ0I7RUFBQSxDQWxFbkIsQ0FBQTs7QUFBQSwwQkE0RUEsTUFBQSxHQUFRLFNBQUEsR0FBQTtXQUNMLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxNQUFwQixDQUFBLEVBREs7RUFBQSxDQTVFUixDQUFBOztBQUFBLDBCQW9GQSxPQUFBLEdBQVMsU0FBQSxHQUFBO1dBQ04sSUFBQyxDQUFBLGtCQUFrQixDQUFDLE9BQXBCLENBQUEsRUFETTtFQUFBLENBcEZULENBQUE7O0FBQUEsMEJBNEZBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSCxJQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFBLENBQUEsQ0FBQTtXQUVBLFFBQVEsQ0FBQyxFQUFULENBQVksSUFBQyxDQUFBLEdBQWIsRUFBa0IsRUFBbEIsRUFDRztBQUFBLE1BQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxNQUFYO0FBQUEsTUFDQSxLQUFBLEVBQU8sRUFEUDtBQUFBLE1BR0EsVUFBQSxFQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBRVQsUUFBUSxDQUFDLEVBQVQsQ0FBWSxLQUFDLENBQUEsR0FBYixFQUFrQixFQUFsQixFQUNHO0FBQUEsWUFBQSxLQUFBLEVBQU8sQ0FBUDtBQUFBLFlBQ0EsSUFBQSxFQUFNLElBQUksQ0FBQyxPQURYO1dBREgsRUFGUztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFo7S0FESCxFQUhHO0VBQUEsQ0E1Rk4sQ0FBQTs7QUFBQSwwQkFvSEEsT0FBQSxHQUFTLFNBQUMsS0FBRCxHQUFBO1dBQ04sSUFBQyxDQUFBLGtCQUFrQixDQUFDLEtBQXBCLENBQUEsRUFETTtFQUFBLENBcEhULENBQUE7O0FBQUEsMEJBNkhBLGdCQUFBLEdBQWtCLFNBQUMsS0FBRCxHQUFBO0FBQ2YsUUFBQSwrQkFBQTtBQUFBLElBQUEsUUFBQSxHQUFXLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBekIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLENBQWlCLDRDQUFqQixDQUZBLENBQUE7QUFBQSxJQUtBLGFBQUE7QUFBZ0IsY0FBTyxRQUFQO0FBQUEsYUFDUixDQURRO2lCQUNELGVBREM7QUFBQSxhQUVSLENBRlE7aUJBRUQsa0JBRkM7QUFBQSxhQUdSLENBSFE7aUJBR0QsZ0JBSEM7QUFBQTtpQkFJUixHQUpRO0FBQUE7UUFMaEIsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWMsYUFBZCxDQVhBLENBQUE7QUFBQSxJQWVBLE1BQUE7QUFBUyxjQUFPLFFBQVA7QUFBQSxhQUNELENBREM7aUJBQ00sU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUQ5QjtBQUFBLGFBRUQsQ0FGQztpQkFFTSxTQUFTLENBQUMsYUFBYSxDQUFDLE9BRjlCO0FBQUEsYUFHRCxDQUhDO2lCQUdNLFNBQVMsQ0FBQyxhQUFhLENBQUMsS0FIOUI7QUFBQTtpQkFJRCxHQUpDO0FBQUE7UUFmVCxDQUFBO1dBcUJBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUF1QixNQUF2QixFQXRCZTtFQUFBLENBN0hsQixDQUFBOztBQUFBLDBCQTRKQSxjQUFBLEdBQWdCLFNBQUMsS0FBRCxHQUFBLENBNUpoQixDQUFBOztBQUFBLDBCQW9LQSxlQUFBLEdBQWlCLFNBQUMsS0FBRCxHQUFBO0FBQ2QsSUFBQSxJQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZCxLQUF5QixJQUE1QjthQUNHLElBQUMsQ0FBQSxJQUFELENBQUEsRUFESDtLQURjO0VBQUEsQ0FwS2pCLENBQUE7O0FBQUEsMEJBOEtBLFVBQUEsR0FBWSxTQUFBLEdBQUE7V0FDVCxJQUFDLENBQUEsa0JBQWtCLENBQUMsR0FBcEIsQ0FBd0IsU0FBeEIsRUFBbUMsS0FBbkMsRUFEUztFQUFBLENBOUtaLENBQUE7O3VCQUFBOztHQU55QixLQWI1QixDQUFBOztBQUFBLE1BdU1NLENBQUMsT0FBUCxHQUFpQixhQXZNakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLGtHQUFBO0VBQUE7O2lTQUFBOztBQUFBLFFBT0EsR0FBMEIsT0FBQSxDQUFRLG9DQUFSLENBUDFCLENBQUE7O0FBQUEsdUJBUUEsR0FBMEIsT0FBQSxDQUFRLDZEQUFSLENBUjFCLENBQUE7O0FBQUEsa0JBU0EsR0FBMEIsT0FBQSxDQUFRLHdEQUFSLENBVDFCLENBQUE7O0FBQUEsYUFVQSxHQUEwQixPQUFBLENBQVEsd0JBQVIsQ0FWMUIsQ0FBQTs7QUFBQSxJQVdBLEdBQTBCLE9BQUEsQ0FBUSxnQ0FBUixDQVgxQixDQUFBOztBQUFBLFFBWUEsR0FBMEIsT0FBQSxDQUFRLHdDQUFSLENBWjFCLENBQUE7O0FBQUE7QUFxQkcsaUNBQUEsQ0FBQTs7Ozs7OztHQUFBOztBQUFBLHlCQUFBLFNBQUEsR0FBVyxlQUFYLENBQUE7O0FBQUEseUJBTUEsT0FBQSxHQUFTLElBTlQsQ0FBQTs7QUFBQSx5QkFZQSxRQUFBLEdBQVUsUUFaVixDQUFBOztBQUFBLHlCQWtCQSxrQkFBQSxHQUFvQixJQWxCcEIsQ0FBQTs7QUFBQSx5QkFzQkEsVUFBQSxHQUFZLElBdEJaLENBQUE7O0FBQUEseUJBMEJBLEtBQUEsR0FBTyxJQTFCUCxDQUFBOztBQUFBLHlCQThCQSxNQUFBLEdBQ0c7QUFBQSxJQUFBLDRCQUFBLEVBQThCLGNBQTlCO0FBQUEsSUFDQSxvQkFBQSxFQUE4QixnQkFEOUI7R0EvQkgsQ0FBQTs7QUFBQSx5QkF3Q0EsTUFBQSxHQUFRLFNBQUMsT0FBRCxHQUFBO0FBQ0wsSUFBQSx5Q0FBTSxPQUFOLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxtQkFBVixDQUZWLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxvQkFBRCxDQUFBLENBSkEsQ0FBQTtXQU1BLEtBUEs7RUFBQSxDQXhDUixDQUFBOztBQUFBLHlCQW1EQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ0wsSUFBQSxDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxrQkFBUixFQUE0QixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxNQUFELEdBQUE7ZUFDekIsTUFBTSxDQUFDLE1BQVAsQ0FBQSxFQUR5QjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCLENBQUEsQ0FBQTtXQUdBLHVDQUFBLEVBSks7RUFBQSxDQW5EUixDQUFBOztBQUFBLHlCQWdFQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFDaEIsSUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFVBQWQsQ0FBWixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxLQUFYLEVBQXFCLFFBQVEsQ0FBQyxZQUE5QixFQUFpRCxJQUFDLENBQUEsYUFBbEQsQ0FGQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxLQUFYLEVBQXFCLFFBQVEsQ0FBQyxXQUE5QixFQUFpRCxJQUFDLENBQUEsWUFBbEQsQ0FIQSxDQUFBO1dBSUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsUUFBWCxFQUFxQixRQUFRLENBQUMsaUJBQTlCLEVBQWlELElBQUMsQ0FBQSxrQkFBbEQsRUFMZ0I7RUFBQSxDQWhFbkIsQ0FBQTs7QUFBQSx5QkE2RUEsb0JBQUEsR0FBc0IsU0FBQSxHQUFBO0FBQ25CLElBQUEsSUFBQyxDQUFBLGtCQUFELEdBQXNCLEVBQXRCLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxVQUFELEdBQWMsR0FBQSxDQUFBLHVCQUZkLENBQUE7QUFBQSxJQUlBLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtlQUNSLEtBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFvQixJQUFBLGtCQUFBLENBQW1CO0FBQUEsVUFBRSxVQUFBLEVBQVksS0FBQyxDQUFBLEtBQWY7U0FBbkIsQ0FBcEIsRUFEUTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FKQSxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsS0FBRCxHQUFBO0FBQ2QsWUFBQSxhQUFBO0FBQUEsUUFBQSxhQUFBLEdBQW9CLElBQUEsYUFBQSxDQUNqQjtBQUFBLFVBQUEsa0JBQUEsRUFBb0IsS0FBcEI7U0FEaUIsQ0FBcEIsQ0FBQTtBQUFBLFFBR0EsS0FBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxPQUFWLENBQWIsQ0FIQSxDQUFBO0FBQUEsUUFJQSxLQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBWSxhQUFhLENBQUMsTUFBZCxDQUFBLENBQXNCLENBQUMsRUFBbkMsQ0FKQSxDQUFBO2VBS0EsS0FBQyxDQUFBLGtCQUFrQixDQUFDLElBQXBCLENBQXlCLGFBQXpCLEVBTmM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixDQVBBLENBQUE7V0FnQkEsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsZ0JBQVgsRUFBNkIsSUFBQyxDQUFBLFVBQTlCLEVBakJtQjtFQUFBLENBN0V0QixDQUFBOztBQUFBLHlCQW9HQSxJQUFBLEdBQU0sU0FBQSxHQUFBO1dBQ0gsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxFQUFtQixJQUFuQixFQURHO0VBQUEsQ0FwR04sQ0FBQTs7QUFBQSx5QkEyR0EsTUFBQSxHQUFRLFNBQUEsR0FBQTtXQUNMLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsRUFBbUIsS0FBbkIsRUFESztFQUFBLENBM0dSLENBQUE7O0FBQUEseUJBZ0hBLE1BQUEsR0FBUSxTQUFBLEdBQUE7V0FDTCxJQUFDLENBQUEsR0FBRyxDQUFDLFFBQUwsQ0FBYyxVQUFkLEVBREs7RUFBQSxDQWhIUixDQUFBOztBQUFBLHlCQXFIQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1AsSUFBQSxJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLFVBQWQsQ0FBSDthQUNHLElBQUMsQ0FBQSxHQUFHLENBQUMsV0FBTCxDQUFpQixVQUFqQixFQURIO0tBRE87RUFBQSxDQXJIVixDQUFBOztBQUFBLHlCQTJIQSxLQUFBLEdBQU8sU0FBQSxHQUFBO1dBQ0osSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWMsT0FBZCxFQURJO0VBQUEsQ0EzSFAsQ0FBQTs7QUFBQSx5QkFpSUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNOLElBQUEsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLFFBQUwsQ0FBYyxPQUFkLENBQUg7YUFDRyxJQUFDLENBQUEsR0FBRyxDQUFDLFdBQUwsQ0FBaUIsT0FBakIsRUFESDtLQURNO0VBQUEsQ0FqSVQsQ0FBQTs7QUFBQSx5QkFnSkEsa0JBQUEsR0FBb0IsU0FBQyxlQUFELEdBQUE7QUFDakIsUUFBQSxVQUFBO0FBQUEsSUFBQSxVQUFBLEdBQWEsZUFBZSxDQUFDLE9BQU8sQ0FBQyxpQkFBckMsQ0FBQTtBQUVBLElBQUEsSUFBRyxVQUFVLENBQUMsR0FBWCxLQUFrQixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQTVCO2FBQ0csSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURIO0tBQUEsTUFBQTthQUdLLElBQUMsQ0FBQSxRQUFELENBQUEsRUFITDtLQUhpQjtFQUFBLENBaEpwQixDQUFBOztBQUFBLHlCQThKQSxZQUFBLEdBQWMsU0FBQyxLQUFELEdBQUE7QUFDWCxRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQXJCLENBQUE7QUFFQSxJQUFBLElBQUcsSUFBSDthQUNHLElBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLE1BQWQsRUFESDtLQUFBLE1BQUE7YUFHSyxJQUFDLENBQUEsR0FBRyxDQUFDLFdBQUwsQ0FBaUIsTUFBakIsRUFITDtLQUhXO0VBQUEsQ0E5SmQsQ0FBQTs7QUFBQSx5QkEyS0EsYUFBQSxHQUFlLFNBQUMsS0FBRCxHQUFBO0FBQ1osSUFBQSxJQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBakI7YUFDSSxJQUFDLENBQUEsS0FBRCxDQUFBLEVBREo7S0FBQSxNQUFBO2FBR0ksSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQUhKO0tBRFk7RUFBQSxDQTNLZixDQUFBOztBQUFBLHlCQXNMQSxZQUFBLEdBQWMsU0FBQyxLQUFELEdBQUE7QUFDWCxJQUFBLElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFBLEtBQXdCLElBQTNCO2FBQ0csSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsT0FBWCxFQUFvQixDQUFBLElBQUcsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE9BQVgsQ0FBdEIsRUFESDtLQURXO0VBQUEsQ0F0TGQsQ0FBQTs7QUFBQSx5QkFpTUEsY0FBQSxHQUFnQixTQUFDLEtBQUQsR0FBQTtBQUNiLElBQUEsSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQUg7YUFDRyxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREg7S0FBQSxNQUFBO2FBR0ssSUFBQyxDQUFBLElBQUQsQ0FBQSxFQUhMO0tBRGE7RUFBQSxDQWpNaEIsQ0FBQTs7c0JBQUE7O0dBTndCLEtBZjNCLENBQUE7O0FBQUEsTUFzT00sQ0FBQyxPQUFQLEdBQWlCLFlBdE9qQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsMERBQUE7RUFBQTs7aVNBQUE7O0FBQUEsWUFPQSxHQUFlLE9BQUEsQ0FBUSx1QkFBUixDQVBmLENBQUE7O0FBQUEsUUFRQSxHQUFlLE9BQUEsQ0FBUSxvQ0FBUixDQVJmLENBQUE7O0FBQUEsSUFTQSxHQUFlLE9BQUEsQ0FBUSxnQ0FBUixDQVRmLENBQUE7O0FBQUEsT0FVQSxHQUFlLE9BQUEsQ0FBUSx3Q0FBUixDQVZmLENBQUE7O0FBQUEsUUFXQSxHQUFlLE9BQUEsQ0FBUSxvQ0FBUixDQVhmLENBQUE7O0FBQUE7QUFvQkcsOEJBQUEsQ0FBQTs7Ozs7Ozs7Ozs7R0FBQTs7QUFBQSxzQkFBQSxTQUFBLEdBQVcscUJBQVgsQ0FBQTs7QUFBQSxzQkFNQSxRQUFBLEdBQVUsUUFOVixDQUFBOztBQUFBLHNCQVlBLGlCQUFBLEdBQW1CLElBWm5CLENBQUE7O0FBQUEsc0JBa0JBLFdBQUEsR0FBYSxJQWxCYixDQUFBOztBQUFBLHNCQXdCQSxrQkFBQSxHQUFvQixHQXhCcEIsQ0FBQTs7QUFBQSxzQkE4QkEsY0FBQSxHQUFnQixDQUFBLENBOUJoQixDQUFBOztBQUFBLHNCQXFDQSxRQUFBLEdBQVUsQ0FyQ1YsQ0FBQTs7QUFBQSxzQkEyQ0EsUUFBQSxHQUFVLElBM0NWLENBQUE7O0FBQUEsc0JBaURBLFVBQUEsR0FBWSxJQWpEWixDQUFBOztBQUFBLHNCQXlEQSxNQUFBLEdBQVEsU0FBQyxPQUFELEdBQUE7QUFDTCxJQUFBLHNDQUFNLE9BQU4sQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFlBQVYsQ0FGZCxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFlBQVYsQ0FIZCxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBTEEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQU5BLENBQUE7V0FRQSxLQVRLO0VBQUEsQ0F6RFIsQ0FBQTs7QUFBQSxzQkF3RUEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNMLElBQUEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFDLENBQUEsaUJBQVIsRUFBMkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsS0FBRCxHQUFBO2VBQ3hCLEtBQUssQ0FBQyxNQUFOLENBQUEsRUFEd0I7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQixDQUFBLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FIQSxDQUFBO1dBS0Esb0NBQUEsRUFOSztFQUFBLENBeEVSLENBQUE7O0FBQUEsc0JBcUZBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNoQixJQUFBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFFBQVgsRUFBdUIsUUFBUSxDQUFDLFVBQWhDLEVBQWdELElBQUMsQ0FBQSxXQUFqRCxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFFBQVgsRUFBdUIsUUFBUSxDQUFDLGNBQWhDLEVBQWdELElBQUMsQ0FBQSxlQUFqRCxDQURBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFFBQVgsRUFBdUIsUUFBUSxDQUFDLFVBQWhDLEVBQWdELElBQUMsQ0FBQSxXQUFqRCxDQUZBLENBQUE7V0FHQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxVQUFYLEVBQXVCLFFBQVEsQ0FBQyxZQUFoQyxFQUFnRCxJQUFDLENBQUEsYUFBakQsRUFKZ0I7RUFBQSxDQXJGbkIsQ0FBQTs7QUFBQSxzQkFpR0EsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUNYLElBQUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsZ0JBQVYsQ0FBMkIsQ0FBQyxNQUE1QixDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLEVBRnJCLENBQUE7V0FJQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsS0FBRCxHQUFBO0FBRWQsWUFBQSxZQUFBO0FBQUEsUUFBQSxZQUFBLEdBQW1CLElBQUEsWUFBQSxDQUNoQjtBQUFBLFVBQUEsUUFBQSxFQUFVLEtBQUMsQ0FBQSxRQUFYO0FBQUEsVUFDQSxVQUFBLEVBQVksS0FBSyxDQUFDLEdBQU4sQ0FBVSxnQkFBVixDQURaO0FBQUEsVUFFQSxLQUFBLEVBQU8sS0FGUDtTQURnQixDQUFuQixDQUFBO0FBQUEsUUFLQSxLQUFDLENBQUEsaUJBQWlCLENBQUMsSUFBbkIsQ0FBd0IsWUFBeEIsQ0FMQSxDQUFBO2VBTUEsS0FBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLFlBQVksQ0FBQyxNQUFiLENBQUEsQ0FBcUIsQ0FBQyxFQUF6QyxFQVJjO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakIsRUFMVztFQUFBLENBakdkLENBQUE7O0FBQUEsc0JBcUhBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVCxJQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsV0FBWixDQUF3QixNQUF4QixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxjQUFELEdBQXFCLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUMsQ0FBQSxRQUF0QixHQUFvQyxJQUFDLENBQUEsY0FBRCxJQUFtQixDQUF2RCxHQUE4RCxJQUFDLENBQUEsY0FBRCxHQUFrQixDQURsRyxDQUFBO0FBQUEsSUFFQSxDQUFBLENBQUUsSUFBQyxDQUFBLFVBQVcsQ0FBQSxJQUFDLENBQUEsY0FBRCxDQUFkLENBQStCLENBQUMsUUFBaEMsQ0FBeUMsTUFBekMsQ0FGQSxDQUFBO1dBSUEsSUFBQyxDQUFBLFNBQUQsQ0FBQSxFQUxTO0VBQUEsQ0FySFosQ0FBQTs7QUFBQSxzQkFpSUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNULFdBQU8sR0FBUCxDQURTO0VBQUEsQ0FqSVosQ0FBQTs7QUFBQSxzQkF3SUEsSUFBQSxHQUFNLFNBQUEsR0FBQTtXQUNILElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFNBQWQsRUFBeUIsSUFBekIsRUFERztFQUFBLENBeElOLENBQUE7O0FBQUEsc0JBZ0pBLEtBQUEsR0FBTyxTQUFBLEdBQUE7V0FDSixJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxTQUFkLEVBQXlCLEtBQXpCLEVBREk7RUFBQSxDQWhKUCxDQUFBOztBQUFBLHNCQXdKQSxJQUFBLEdBQU0sU0FBQSxHQUFBO1dBQ0gsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxFQUFzQixJQUF0QixFQURHO0VBQUEsQ0F4Sk4sQ0FBQTs7QUFBQSxzQkFnS0EsTUFBQSxHQUFRLFNBQUEsR0FBQTtXQUNKLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE1BQWQsRUFBc0IsS0FBdEIsRUFESTtFQUFBLENBaEtSLENBQUE7O0FBQUEsc0JBeUtBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDUixRQUFBLGlCQUFBO0FBQUEsSUFBQSxpQkFBQSxHQUFxQixJQUFDLENBQUEsVUFBVSxDQUFDLFNBQVosQ0FBc0I7QUFBQSxNQUFFLEtBQUEsRUFBTyxJQUFUO0tBQXRCLENBQXJCLENBQUE7QUFLQSxJQUFBLElBQUcsaUJBQUg7QUFDRyxNQUFBLElBQUcsaUJBQWlCLENBQUMsR0FBbEIsQ0FBc0IsTUFBdEIsQ0FBQSxLQUFtQyxJQUF0QztBQUNHLFFBQUEsaUJBQWlCLENBQUMsR0FBbEIsQ0FBc0IsZ0JBQXRCLENBQXVDLENBQUMsSUFBeEMsQ0FBNkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLGFBQUQsRUFBZ0IsS0FBaEIsR0FBQTttQkFDMUMsS0FBQyxDQUFBLHNCQUFELENBQXlCLGFBQXpCLEVBQXdDLEtBQXhDLEVBRDBDO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0MsQ0FBQSxDQURIO09BQUE7QUFJQSxZQUFBLENBTEg7S0FMQTtXQWdCQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsVUFBRCxHQUFBO0FBQ2QsUUFBQSxJQUFHLFVBQVUsQ0FBQyxHQUFYLENBQWUsTUFBZixDQUFBLEtBQTRCLElBQS9CO2lCQUNHLFVBQVUsQ0FBQyxHQUFYLENBQWUsZ0JBQWYsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxTQUFDLGFBQUQsRUFBZ0IsS0FBaEIsR0FBQTttQkFDbkMsS0FBQyxDQUFBLHNCQUFELENBQXlCLGFBQXpCLEVBQXdDLEtBQXhDLEVBRG1DO1VBQUEsQ0FBdEMsRUFESDtTQURjO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakIsRUFqQlE7RUFBQSxDQXpLWCxDQUFBOztBQUFBLHNCQXVNQSxzQkFBQSxHQUF3QixTQUFDLGFBQUQsRUFBZ0IsS0FBaEIsR0FBQTtBQUNyQixJQUFBLElBQUcsSUFBQyxDQUFBLGNBQUQsS0FBbUIsS0FBdEI7QUFDRyxNQUFBLElBQUcsYUFBYSxDQUFDLEdBQWQsQ0FBa0IsUUFBbEIsQ0FBSDtlQUNHLGFBQWEsQ0FBQyxHQUFkLENBQWtCLFNBQWxCLEVBQTZCLElBQTdCLEVBREg7T0FESDtLQURxQjtFQUFBLENBdk14QixDQUFBOztBQUFBLHNCQXVOQSxXQUFBLEdBQWEsU0FBQyxLQUFELEdBQUE7QUFDVixJQUFBLGFBQUEsQ0FBYyxJQUFDLENBQUEsV0FBZixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixLQUFLLENBQUMsT0FBTyxDQUFDLEdBRHBDLENBQUE7V0FFQSxJQUFDLENBQUEsV0FBRCxHQUFlLFdBQUEsQ0FBWSxJQUFDLENBQUEsVUFBYixFQUF5QixJQUFDLENBQUEsa0JBQTFCLEVBSEw7RUFBQSxDQXZOYixDQUFBOztBQUFBLHNCQW1PQSxlQUFBLEdBQWlCLFNBQUMsS0FBRCxHQUFBO0FBQ2QsUUFBQSxPQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUF4QixDQUFBO0FBRUEsSUFBQSxJQUFHLE9BQUg7YUFDRyxJQUFDLENBQUEsV0FBRCxHQUFlLFdBQUEsQ0FBWSxJQUFDLENBQUEsVUFBYixFQUF5QixJQUFDLENBQUEsa0JBQTFCLEVBRGxCO0tBQUEsTUFBQTtBQUlHLE1BQUEsYUFBQSxDQUFjLElBQUMsQ0FBQSxXQUFmLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsS0FMbEI7S0FIYztFQUFBLENBbk9qQixDQUFBOztBQUFBLHNCQW1QQSxZQUFBLEdBQWMsU0FBQyxLQUFELEdBQUEsQ0FuUGQsQ0FBQTs7QUFBQSxzQkEyUEEsV0FBQSxHQUFhLFNBQUMsS0FBRCxHQUFBO0FBQ1YsUUFBQSwwQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUF2QixDQUEyQixhQUEzQixDQUFkLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FEQSxDQUFBO0FBQUEsSUFNQSx1QkFBQSxHQUEwQixLQUFLLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEdBQW5DLENBQXVDLGFBQXZDLENBTjFCLENBQUE7QUFBQSxJQU9BLGlCQUFBLEdBQW9CLHVCQUF1QixDQUFDLG9CQUF4QixDQUFBLENBUHBCLENBQUE7V0FhQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsU0FBQyxlQUFELEVBQWtCLEtBQWxCLEdBQUE7QUFDZCxVQUFBLHNDQUFBO0FBQUEsTUFBQSxhQUFBLEdBQWdCLGlCQUFrQixDQUFBLEtBQUEsQ0FBbEMsQ0FBQTtBQUFBLE1BQ0EsYUFBQSxHQUFnQixlQUFlLENBQUMsR0FBaEIsQ0FBb0IsZ0JBQXBCLENBRGhCLENBQUE7QUFBQSxNQUlBLFFBQUEsR0FBVyx1QkFBdUIsQ0FBQyxFQUF4QixDQUEyQixLQUEzQixDQUpYLENBQUE7QUFNQSxNQUFBLElBQU8sUUFBQSxLQUFZLE1BQW5CO0FBRUcsUUFBQSxRQUFBLEdBQVcsUUFBUSxDQUFDLE1BQVQsQ0FBQSxDQUFYLENBQUE7QUFBQSxRQUVBLGVBQWUsQ0FBQyxHQUFoQixDQUNHO0FBQUEsVUFBQSxNQUFBLEVBQVEsUUFBUSxDQUFDLE1BQWpCO0FBQUEsVUFDQSxNQUFBLEVBQVEsUUFBUSxDQUFDLE1BRGpCO0FBQUEsVUFFQSxJQUFBLEVBQVEsUUFBUSxDQUFDLElBRmpCO0FBQUEsVUFHQSxLQUFBLEVBQVEsUUFBUSxDQUFDLEtBSGpCO1NBREgsQ0FGQSxDQUZIO09BTkE7QUFpQkEsTUFBQSxJQUFPLGFBQUEsS0FBaUIsTUFBeEI7ZUFFRyxhQUFhLENBQUMsSUFBZCxDQUFtQixTQUFDLGFBQUQsRUFBZ0IsS0FBaEIsR0FBQTtBQUNoQixjQUFBLGdCQUFBO0FBQUEsVUFBQSxnQkFBQSxHQUFtQixhQUFhLENBQUMsRUFBZCxDQUFpQixLQUFqQixDQUFuQixDQUFBO2lCQUNBLGFBQWEsQ0FBQyxHQUFkLENBQWtCLGdCQUFnQixDQUFDLE1BQWpCLENBQUEsQ0FBbEIsRUFGZ0I7UUFBQSxDQUFuQixFQUZIO09BbEJjO0lBQUEsQ0FBakIsRUFkVTtFQUFBLENBM1BiLENBQUE7O0FBQUEsc0JBMlNBLGFBQUEsR0FBZSxTQUFDLEtBQUQsR0FBQTtXQUNaLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxlQUFELEdBQUE7QUFDZCxRQUFBLElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFkLEtBQXVCLElBQTFCO0FBQ0csVUFBQSxJQUFHLEtBQUssQ0FBQyxHQUFOLEtBQWUsZUFBZSxDQUFDLEdBQWxDO21CQUNHLGVBQWUsQ0FBQyxHQUFoQixDQUFvQixPQUFwQixFQUE2QixLQUE3QixFQURIO1dBREg7U0FEYztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCLEVBRFk7RUFBQSxDQTNTZixDQUFBOzttQkFBQTs7R0FOcUIsS0FkeEIsQ0FBQTs7QUFBQSxNQTJVTSxDQUFDLE9BQVAsR0FBaUIsU0EzVWpCLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsNkNBQUE7RUFBQTtpU0FBQTs7QUFBQSxNQU9BLEdBQVcsT0FBQSxDQUFRLG9CQUFSLENBUFgsQ0FBQTs7QUFBQSxRQVFBLEdBQVcsT0FBQSxDQUFRLDhCQUFSLENBUlgsQ0FBQTs7QUFBQSxJQVNBLEdBQVcsT0FBQSxDQUFRLDBCQUFSLENBVFgsQ0FBQTs7QUFBQSxRQVVBLEdBQVcsT0FBQSxDQUFRLGtDQUFSLENBVlgsQ0FBQTs7QUFBQTtBQWdCRyxnQ0FBQSxDQUFBOzs7O0dBQUE7O0FBQUEsd0JBQUEsUUFBQSxHQUFVLFFBQVYsQ0FBQTs7QUFBQSx3QkFHQSxNQUFBLEdBQ0c7QUFBQSxJQUFBLHFCQUFBLEVBQXVCLGlCQUF2QjtHQUpILENBQUE7O0FBQUEsd0JBT0EsZUFBQSxHQUFpQixTQUFDLEtBQUQsR0FBQTtXQUNkLE1BQU0sQ0FBQyxPQUFQLENBQWUsUUFBUSxDQUFDLEtBQXhCLEVBQ0c7QUFBQSxNQUFBLEtBQUEsRUFBTyxRQUFQO0tBREgsRUFEYztFQUFBLENBUGpCLENBQUE7O3FCQUFBOztHQUh1QixLQWIxQixDQUFBOztBQUFBLE1BNkJNLENBQUMsT0FBUCxHQUFpQixXQTdCakIsQ0FBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEseUJBQUE7RUFBQTtpU0FBQTs7QUFBQSxJQU9BLEdBQVcsT0FBQSxDQUFRLDBCQUFSLENBUFgsQ0FBQTs7QUFBQSxRQVFBLEdBQVcsT0FBQSxDQUFRLGdDQUFSLENBUlgsQ0FBQTs7QUFBQTtBQWFHLDhCQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSxzQkFBQSxRQUFBLEdBQVUsUUFBVixDQUFBOzttQkFBQTs7R0FGcUIsS0FYeEIsQ0FBQTs7QUFBQSxNQWlCTSxDQUFDLE9BQVAsR0FBaUIsU0FqQmpCLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLHlCQUFBO0VBQUE7aVNBQUE7O0FBQUEsSUFPQSxHQUFXLE9BQUEsQ0FBUSwwQkFBUixDQVBYLENBQUE7O0FBQUEsUUFRQSxHQUFXLE9BQUEsQ0FBUSxzQkFBUixDQVJYLENBQUE7O0FBQUE7QUFhRyw4QkFBQSxDQUFBOzs7O0dBQUE7O0FBQUEsc0JBQUEsUUFBQSxHQUFVLFFBQVYsQ0FBQTs7bUJBQUE7O0dBRnFCLEtBWHhCLENBQUE7O0FBQUEsTUFnQk0sQ0FBQyxPQUFQLEdBQWlCLFNBaEJqQixDQUFBOzs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQSxRQUFBLENBQVMsUUFBVCxFQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO1NBQUEsU0FBQSxHQUFBO0FBRWhCLElBQUEsT0FBQSxDQUFRLHlDQUFSLENBQUEsQ0FBQTtXQUNBLE9BQUEsQ0FBUSxvQ0FBUixFQUhnQjtFQUFBLEVBQUE7QUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLENBQUEsQ0FBQTs7QUFBQSxRQU1BLENBQVMsT0FBVCxFQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO1NBQUEsU0FBQSxHQUFBO0FBRWYsSUFBQSxPQUFBLENBQVEsOENBQVIsQ0FBQSxDQUFBO0FBQUEsSUFDQSxPQUFBLENBQVEsd0RBQVIsQ0FEQSxDQUFBO0FBQUEsSUFFQSxPQUFBLENBQVEseURBQVIsQ0FGQSxDQUFBO0FBQUEsSUFLQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFFbEIsTUFBQSxPQUFBLENBQVEsMERBQVIsQ0FBQSxDQUFBO2FBQ0EsT0FBQSxDQUFRLHdEQUFSLEVBSGtCO0lBQUEsQ0FBckIsQ0FMQSxDQUFBO0FBQUEsSUFXQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQSxHQUFBO0FBRTdCLE1BQUEsT0FBQSxDQUFRLGdGQUFSLENBQUEsQ0FBQTthQUNBLE9BQUEsQ0FBUSxtRUFBUixFQUg2QjtJQUFBLENBQWhDLENBWEEsQ0FBQTtXQWlCQSxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBLEdBQUE7QUFFbkIsTUFBQSxPQUFBLENBQVEsb0VBQVIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxPQUFBLENBQVEsbUVBQVIsQ0FEQSxDQUFBO2FBRUEsT0FBQSxDQUFRLGdFQUFSLEVBSm1CO0lBQUEsQ0FBdEIsRUFuQmU7RUFBQSxFQUFBO0FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQixDQU5BLENBQUE7O0FBQUEsT0FpQ0EsQ0FBUSwwQ0FBUixDQWpDQSxDQUFBOztBQUFBLE9Ba0NBLENBQVEsNENBQVIsQ0FsQ0EsQ0FBQTs7QUFBQSxPQW9DQSxDQUFRLDJDQUFSLENBcENBLENBQUE7O0FBQUEsT0FxQ0EsQ0FBUSxzQ0FBUixDQXJDQSxDQUFBOztBQUFBLE9Bd0NBLENBQVEsa0NBQVIsQ0F4Q0EsQ0FBQTs7OztBQ0RBLElBQUEsYUFBQTs7QUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSx3Q0FBUixDQUFoQixDQUFBOztBQUFBLFFBR0EsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7U0FFeEIsRUFBQSxDQUFHLG1CQUFILEVBQXdCLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEIsRUFGd0I7QUFBQSxDQUEzQixDQUhBLENBQUE7Ozs7QUNBQSxJQUFBLHdCQUFBOztBQUFBLFNBQUEsR0FBZ0IsT0FBQSxDQUFRLDhDQUFSLENBQWhCLENBQUE7O0FBQUEsYUFDQSxHQUFnQixPQUFBLENBQVEsdURBQVIsQ0FEaEIsQ0FBQTs7QUFBQSxRQUdBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQSxHQUFBO0FBRXhCLEVBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDUixNQUFBLEtBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUNsQjtBQUFBLFFBQUEsS0FBQSxFQUFPLElBQVA7T0FEa0IsQ0FBckIsQ0FBQTthQUdBLEtBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUNHO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFFBQ0EsR0FBQSxFQUFLLFNBQVMsQ0FBQyxtQkFBVixDQUE4QixNQUE5QixDQUFBLEdBQXdDLEdBQXhDLEdBQThDLGlCQURuRDtPQURILEVBSlE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLEVBU0EsRUFBQSxDQUFHLHFFQUFILEVBQTBFLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDdkUsS0FBQyxDQUFBLGFBQWEsQ0FBQyxFQUFmLENBQWtCLENBQWxCLENBQW9CLENBQUMsR0FBckIsQ0FBeUIsTUFBekIsQ0FBZ0MsQ0FBQyxNQUFNLENBQUMsTUFEK0I7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExRSxDQVRBLENBQUE7QUFBQSxFQWFBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQzlCLFVBQUEsWUFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLEtBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFBLENBQVYsQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLEtBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBRE4sQ0FBQTthQUVBLEdBQUcsQ0FBQyxHQUFKLENBQVEsT0FBUixDQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUF4QixDQUE4QixPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBekMsRUFIOEI7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQyxDQWJBLENBQUE7U0FtQkEsRUFBQSxDQUFHLGdDQUFILEVBQXFDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDbEMsVUFBQSxZQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsS0FBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQUEsQ0FBVixDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sS0FBQyxDQUFBLGFBQWEsQ0FBQyxXQUFmLENBQUEsQ0FETixDQUFBO2FBRUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxPQUFSLENBQWdCLENBQUMsTUFBTSxDQUFDLEtBQXhCLENBQThCLE9BQVEsQ0FBQSxPQUFPLENBQUMsTUFBUixHQUFlLENBQWYsQ0FBaUIsQ0FBQyxLQUF4RCxFQUhrQztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJDLEVBckJ3QjtBQUFBLENBQTNCLENBSEEsQ0FBQTs7OztBQ0FBLElBQUEseUNBQUE7O0FBQUEsU0FBQSxHQUFnQixPQUFBLENBQVEsOENBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxRQUNBLEdBQWdCLE9BQUEsQ0FBUSxrREFBUixDQURoQixDQUFBOztBQUFBLG9CQUVBLEdBQXVCLE9BQUEsQ0FBUSxtRUFBUixDQUZ2QixDQUFBOztBQUFBLFFBSUEsQ0FBUyxXQUFULEVBQXNCLFNBQUEsR0FBQTtBQUVuQixFQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBRVIsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU87QUFBQSxRQUNKLE9BQUEsRUFBUyxTQURMO0FBQUEsUUFFSixRQUFBLEVBQVUsU0FGTjtBQUFBLFFBR0osYUFBQSxFQUFlO1VBQ1o7QUFBQSxZQUNHLE9BQUEsRUFBUyxjQURaO0FBQUEsWUFFRyxLQUFBLEVBQU8sV0FGVjtBQUFBLFlBR0csTUFBQSxFQUFRLG1CQUhYO1dBRFksRUFNWjtBQUFBLFlBQ0csT0FBQSxFQUFTLFdBRFo7QUFBQSxZQUVHLEtBQUEsRUFBTyxXQUZWO0FBQUEsWUFHRyxNQUFBLEVBQVEsZUFIWDtXQU5ZO1NBSFg7T0FBUCxDQUFBO2FBaUJBLEtBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsUUFBQSxDQUFTLElBQVQsRUFBZTtBQUFBLFFBQUUsS0FBQSxFQUFPLElBQVQ7T0FBZixFQW5CUjtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FBQSxDQUFBO1NBc0JBLEVBQUEsQ0FBRyxpRkFBSCxFQUFzRixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ25GLEtBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLGFBQWQsQ0FBNEIsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFELENBQXpDLENBQXFELG9CQUFyRCxFQURtRjtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRGLEVBeEJtQjtBQUFBLENBQXRCLENBSkEsQ0FBQTs7OztBQ0VBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7U0FFMUIsRUFBQSxDQUFHLG9DQUFILEVBQXlDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekMsRUFGMEI7QUFBQSxDQUE3QixDQUFBLENBQUE7Ozs7QUNBQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7U0FFckIsRUFBQSxDQUFHLGtEQUFILEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsRUFGcUI7QUFBQSxDQUF4QixDQUFBLENBQUE7Ozs7QUNGQSxJQUFBLDhDQUFBOztBQUFBLFNBQUEsR0FBWSxPQUFBLENBQVMsaURBQVQsQ0FBWixDQUFBOztBQUFBLFFBQ0EsR0FBVyxPQUFBLENBQVMsZ0RBQVQsQ0FEWCxDQUFBOztBQUFBLGFBRUEsR0FBZ0IsT0FBQSxDQUFTLDBEQUFULENBRmhCLENBQUE7O0FBQUEsVUFHQSxHQUFhLE9BQUEsQ0FBUyx3REFBVCxDQUhiLENBQUE7O0FBQUEsUUFNQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO0FBRXJCLEVBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDUixNQUFBLEtBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUNsQjtBQUFBLFFBQUEsS0FBQSxFQUFPLElBQVA7T0FEa0IsQ0FBckIsQ0FBQTtBQUFBLE1BR0EsS0FBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQ0c7QUFBQSxRQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsUUFDQSxHQUFBLEVBQUssU0FBUyxDQUFDLG1CQUFWLENBQThCLE1BQTlCLENBQUEsR0FBd0MsR0FBeEMsR0FBOEMsaUJBRG5EO09BREgsQ0FIQSxDQUFBO0FBQUEsTUFPQSxLQUFDLENBQUEsUUFBRCxHQUFZLEdBQUEsQ0FBQSxRQVBaLENBQUE7QUFBQSxNQVFBLEtBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFVBQWQsRUFBMEIsS0FBQyxDQUFBLGFBQWEsQ0FBQyxFQUFmLENBQWtCLENBQWxCLENBQTFCLENBUkEsQ0FBQTtBQUFBLE1BVUEsS0FBQyxDQUFBLElBQUQsR0FBYSxJQUFBLFVBQUEsQ0FDVjtBQUFBLFFBQUEsUUFBQSxFQUFVLEtBQUMsQ0FBQSxRQUFYO0FBQUEsUUFDQSxhQUFBLEVBQWUsS0FBQyxDQUFBLGFBRGhCO09BRFUsQ0FWYixDQUFBO2FBY0EsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFmUTtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsRUFrQkEsU0FBQSxDQUFVLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDUCxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQURPO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVixDQWxCQSxDQUFBO1NBc0JBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDakIsTUFBQSxDQUFPLEtBQUMsQ0FBQSxJQUFJLENBQUMsRUFBYixDQUFnQixDQUFDLEVBQUUsQ0FBQyxNQURIO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsRUF4QnFCO0FBQUEsQ0FBeEIsQ0FOQSxDQUFBOzs7O0FDQUEsSUFBQSwyQ0FBQTs7QUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHdFQUFSLENBQWYsQ0FBQTs7QUFBQSxRQUNBLEdBQWUsT0FBQSxDQUFRLG1EQUFSLENBRGYsQ0FBQTs7QUFBQSxRQUVBLEdBQWUsT0FBQSxDQUFRLG1EQUFSLENBRmYsQ0FBQTs7QUFBQSxTQUdBLEdBQWUsT0FBQSxDQUFRLG9EQUFSLENBSGYsQ0FBQTs7QUFBQSxRQUtBLENBQVMsZUFBVCxFQUEwQixTQUFBLEdBQUE7QUFHdkIsRUFBQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUNSLE1BQUEsS0FBQyxDQUFBLElBQUQsR0FBWSxJQUFBLFlBQUEsQ0FDVDtBQUFBLFFBQUEsUUFBQSxFQUFjLElBQUEsUUFBQSxDQUFBLENBQWQ7T0FEUyxDQUFaLENBQUE7YUFHQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQUpRO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxFQU9BLFNBQUEsQ0FBVSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFHLEtBQUMsQ0FBQSxJQUFJLENBQUMsY0FBVDtBQUE2QixRQUFBLGFBQUEsQ0FBYyxLQUFDLENBQUEsSUFBSSxDQUFDLGNBQXBCLENBQUEsQ0FBN0I7T0FBQTthQUNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBRk87SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWLENBUEEsQ0FBQTtBQUFBLEVBYUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUVqQixLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUZJO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FiQSxDQUFBO1NBbUJBLEVBQUEsQ0FBRyw2Q0FBSCxFQUFrRCxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBRS9DLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQVYsQ0FBZSxZQUFmLENBQVQsQ0FBQTthQUNBLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBYSxDQUFDLE1BQU0sQ0FBQyxLQUFyQixDQUEyQixNQUFBLENBQU8sS0FBQSxHQUFRLEtBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWYsQ0FBbUIsS0FBbkIsQ0FBZixDQUEzQixFQUgrQztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxELEVBdEJ1QjtBQUFBLENBQTFCLENBTEEsQ0FBQTs7OztBQ0FBLElBQUEseURBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxvREFBUixDQUFaLENBQUE7O0FBQUEsV0FDQSxHQUFlLE9BQUEsQ0FBUyx1RUFBVCxDQURmLENBQUE7O0FBQUEsUUFFQSxHQUFnQixPQUFBLENBQVEsbURBQVIsQ0FGaEIsQ0FBQTs7QUFBQSxRQUdBLEdBQWdCLE9BQUEsQ0FBUSx3REFBUixDQUhoQixDQUFBOztBQUFBLGFBSUEsR0FBZ0IsT0FBQSxDQUFRLDZEQUFSLENBSmhCLENBQUE7O0FBQUEsUUFPQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBR3ZCLEVBQUEsTUFBQSxDQUFPLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDSixNQUFBLEtBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUNsQjtBQUFBLFFBQUEsS0FBQSxFQUFPLElBQVA7T0FEa0IsQ0FBckIsQ0FBQTtBQUFBLE1BR0EsS0FBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQ0c7QUFBQSxRQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsUUFDQSxHQUFBLEVBQUssU0FBUyxDQUFDLG1CQUFWLENBQThCLE1BQTlCLENBQUEsR0FBd0MsR0FBeEMsR0FBOEMsaUJBRG5EO09BREgsQ0FIQSxDQUFBO0FBQUEsTUFPQSxLQUFDLENBQUEsUUFBRCxHQUFZLEdBQUEsQ0FBQSxRQVBaLENBQUE7YUFRQSxLQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxVQUFkLEVBQTBCLEtBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixDQUFsQixDQUExQixFQVRJO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUCxDQUFBLENBQUE7QUFBQSxFQVlBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBRVIsTUFBQSxLQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsV0FBQSxDQUNUO0FBQUEsUUFBQSxRQUFBLEVBQVUsS0FBQyxDQUFBLFFBQVg7QUFBQSxRQUNBLGFBQUEsRUFBZSxLQUFDLENBQUEsYUFEaEI7T0FEUyxDQUFaLENBQUE7YUFJQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQU5RO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQVpBLENBQUE7QUFBQSxFQXFCQSxTQUFBLENBQVUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUNQLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBRE87SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWLENBckJBLENBQUE7QUFBQSxFQTJCQSxFQUFBLENBQUcsZUFBSCxFQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBRWpCLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUZBO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0EzQkEsQ0FBQTtBQUFBLEVBa0NBLEVBQUEsQ0FBRyxxQkFBSCxFQUEwQixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBRXZCLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQVYsQ0FBZSxZQUFmLENBQVQsQ0FBQTthQUNBLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFIUztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLENBbENBLENBQUE7U0EwQ0EsRUFBQSxDQUFHLDZDQUFILEVBQWtELENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFFL0MsVUFBQSx1Q0FBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQVYsQ0FBZSxZQUFmLENBQVQsQ0FBQTtBQUFBLE1BQ0EsVUFBQSxHQUFhLEtBQUMsQ0FBQSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQXBCLENBQXVCLENBQXZCLENBQXlCLENBQUMsR0FBMUIsQ0FBOEIsT0FBOUIsQ0FEYixDQUFBO0FBQUEsTUFFQSxTQUFBLEdBQWEsS0FBQyxDQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBcEIsQ0FBdUIsS0FBQyxDQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBcEIsR0FBMkIsQ0FBbEQsQ0FBb0QsQ0FBQyxHQUFyRCxDQUF5RCxPQUF6RCxDQUZiLENBQUE7QUFBQSxNQUlBLFFBQUEsR0FBVyxLQUFDLENBQUEsSUFBSSxDQUFDLFFBSmpCLENBQUE7QUFBQSxNQU1BLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBaEIsQ0FBd0IsaUJBQXhCLENBQTBDLENBQUMsSUFBM0MsQ0FBZ0QsU0FBQSxHQUFBO0FBQzdDLFFBQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxjQUFOLENBQUEsQ0FBQSxDQUFBO2VBQ0EsTUFBTSxDQUFDLElBQVAsQ0FBQSxDQUFhLENBQUMsTUFBTSxDQUFDLEtBQXJCLENBQTJCLFNBQTNCLEVBRjZDO01BQUEsQ0FBaEQsQ0FOQSxDQUFBO2FBVUEsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFoQixDQUF3QixpQkFBeEIsQ0FBMEMsQ0FBQyxJQUEzQyxDQUFnRCxTQUFBLEdBQUE7QUFDN0MsUUFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLGVBQU4sQ0FBQSxDQUFBLENBQUE7ZUFDQSxNQUFNLENBQUMsSUFBUCxDQUFBLENBQWEsQ0FBQyxNQUFNLENBQUMsS0FBckIsQ0FBMkIsVUFBM0IsRUFGNkM7TUFBQSxDQUFoRCxFQVorQztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxELEVBN0N1QjtBQUFBLENBQTFCLENBUEEsQ0FBQTs7OztBQ0FBLElBQUEsb0JBQUE7O0FBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUyxxRkFBVCxDQUFiLENBQUE7O0FBQUEsUUFDQSxHQUFhLE9BQUEsQ0FBUywyREFBVCxDQURiLENBQUE7O0FBQUEsUUFJQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBR3BCLEVBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDUixNQUFBLEtBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxVQUFBLENBQ1Q7QUFBQSxRQUFBLFFBQUEsRUFBYyxJQUFBLFFBQUEsQ0FBQSxDQUFkO09BRFMsQ0FBWixDQUFBO2FBR0EsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFKUTtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsRUFPQSxTQUFBLENBQVUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUNQLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBRE87SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWLENBUEEsQ0FBQTtBQUFBLEVBWUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUNqQixLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQURJO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FaQSxDQUFBO1NBZ0JBLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQzNDLE1BQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsQ0FBQSxDQUFBO2FBQ0EsTUFBQSxDQUFPLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVYsQ0FBbUIsVUFBbkIsQ0FBUCxDQUFzQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBRCxFQUZEO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUMsRUFuQm9CO0FBQUEsQ0FBdkIsQ0FKQSxDQUFBOzs7O0FDQUEsSUFBQSwyREFBQTs7QUFBQSx1QkFBQSxHQUEwQixPQUFBLENBQVMsa0dBQVQsQ0FBMUIsQ0FBQTs7QUFBQSxTQUNBLEdBQTJCLE9BQUEsQ0FBUyx1REFBVCxDQUQzQixDQUFBOztBQUFBLFFBRUEsR0FBMkIsT0FBQSxDQUFTLHNEQUFULENBRjNCLENBQUE7O0FBQUEsYUFHQSxHQUEyQixPQUFBLENBQVMsZ0VBQVQsQ0FIM0IsQ0FBQTs7QUFBQSxRQU1BLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO0FBR3BDLEVBQUEsTUFBQSxDQUFPLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDSixNQUFBLEtBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUNsQjtBQUFBLFFBQUEsS0FBQSxFQUFPLElBQVA7T0FEa0IsQ0FBckIsQ0FBQTthQUdBLEtBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUNHO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFFBQ0EsR0FBQSxFQUFLLFNBQVMsQ0FBQyxtQkFBVixDQUE4QixNQUE5QixDQUFBLEdBQXdDLEdBQXhDLEdBQThDLGlCQURuRDtPQURILEVBSkk7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFQLENBQUEsQ0FBQTtBQUFBLEVBU0EsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDUixNQUFBLEtBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsUUFBQSxDQUFBLENBQWhCLENBQUE7QUFBQSxNQUNBLEtBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFVBQWQsRUFBMEIsS0FBQyxDQUFBLGFBQWEsQ0FBQyxFQUFmLENBQWtCLENBQWxCLENBQTFCLENBREEsQ0FBQTtBQUFBLE1BR0EsS0FBQyxDQUFBLElBQUQsR0FBWSxJQUFBLHVCQUFBLENBQ1Q7QUFBQSxRQUFBLFFBQUEsRUFBVSxLQUFDLENBQUEsUUFBWDtPQURTLENBSFosQ0FBQTthQU1BLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBUFE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBVEEsQ0FBQTtBQUFBLEVBbUJBLFNBQUEsQ0FBVSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ1AsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFETztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVYsQ0FuQkEsQ0FBQTtBQUFBLEVBdUJBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDakIsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsTUFESTtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBdkJBLENBQUE7QUFBQSxFQTRCQSxFQUFBLENBQUcsZ0VBQUgsRUFBcUUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUVsRSxNQUFBLENBQU8sS0FBQyxDQUFBLElBQUksQ0FBQyxRQUFiLENBQXNCLENBQUMsRUFBRSxDQUFDLE1BRndDO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckUsQ0E1QkEsQ0FBQTtBQUFBLEVBa0NBLEVBQUEsQ0FBRyx1RkFBSCxFQUE0RixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBRXpGLFVBQUEsWUFBQTtBQUFBLE1BQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBZixDQUFBLENBQXVCLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQXJELENBQTJELENBQTNELENBQUEsQ0FBQTtBQUFBLE1BRUEsWUFBQSxHQUFlLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQVYsQ0FBZSx3QkFBZixDQUF3QyxDQUFDLElBQXpDLENBQThDLGFBQTlDLENBRmYsQ0FBQTthQUdBLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUE5QixDQUFvQyxDQUFwQyxFQUx5RjtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVGLENBbENBLENBQUE7QUFBQSxFQTJDQSxFQUFBLENBQUcsK0NBQUgsRUFBb0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUVqRCxVQUFBLDhCQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsS0FBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZixDQUFtQixVQUFuQixDQUFYLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxRQUFRLENBQUMsR0FBVCxDQUFhLGFBQWIsQ0FBMkIsQ0FBQyxNQUE1QixDQUFBLENBQW9DLENBQUMsTUFEOUMsQ0FBQTtBQUFBLE1BR0EsWUFBQSxHQUFlLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQVYsQ0FBZSx3QkFBZixDQUF3QyxDQUFDLElBQXpDLENBQThDLGFBQTlDLENBSGYsQ0FBQTtBQUFBLE1BSUEsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQTlCLENBQW9DLE1BQXBDLENBSkEsQ0FBQTtBQUFBLE1BTUEsS0FBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZixDQUFtQixVQUFuQixFQUErQixLQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxDQUEvQixDQU5BLENBQUE7QUFBQSxNQVFBLFFBQUEsR0FBVyxLQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFmLENBQW1CLFVBQW5CLENBUlgsQ0FBQTtBQUFBLE1BU0EsTUFBQSxHQUFTLFFBQVEsQ0FBQyxHQUFULENBQWEsYUFBYixDQUEyQixDQUFDLE1BQTVCLENBQUEsQ0FBb0MsQ0FBQyxNQVQ5QyxDQUFBO0FBQUEsTUFXQSxZQUFBLEdBQWUsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBVixDQUFlLHdCQUFmLENBQXdDLENBQUMsSUFBekMsQ0FBOEMsYUFBOUMsQ0FYZixDQUFBO2FBWUEsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQTlCLENBQW9DLE1BQXBDLEVBZGlEO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEQsQ0EzQ0EsQ0FBQTtTQTZEQSxFQUFBLENBQUcsNkVBQUgsRUFBa0YsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUUvRSxLQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBdEIsQ0FBOEIsMEJBQTlCLENBQXlELENBQUMsSUFBMUQsQ0FBK0QsU0FBQSxHQUFBO0FBQzVELFlBQUEsU0FBQTtBQUFBLFFBQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxlQUFnQixDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQXpCLENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFFQSxTQUFBLEdBQVksS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBVixDQUFlLHdCQUFmLENBQXdDLENBQUMsSUFBekMsQ0FBOEMsV0FBOUMsQ0FGWixDQUFBO2VBR0EsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBeEIsQ0FBOEIsQ0FBOUIsRUFKNEQ7TUFBQSxDQUEvRCxFQUYrRTtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxGLEVBaEVvQztBQUFBLENBQXZDLENBTkEsQ0FBQTs7OztBQ0FBLElBQUEsNEZBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSx1REFBUixDQUFaLENBQUE7O0FBQUEsUUFDQSxHQUFXLE9BQUEsQ0FBUyxzREFBVCxDQURYLENBQUE7O0FBQUEsYUFFQSxHQUFnQixPQUFBLENBQVMsZ0VBQVQsQ0FGaEIsQ0FBQTs7QUFBQSxlQUdBLEdBQWtCLE9BQUEsQ0FBUSx1RUFBUixDQUhsQixDQUFBOztBQUFBLG1CQUlBLEdBQXNCLE9BQUEsQ0FBUSxxRUFBUixDQUp0QixDQUFBOztBQUFBLFNBS0EsR0FBWSxPQUFBLENBQVEsNEVBQVIsQ0FMWixDQUFBOztBQUFBLE9BTUEsR0FBVSxPQUFBLENBQVEsMEVBQVIsQ0FOVixDQUFBOztBQUFBLFFBU0EsQ0FBUyxVQUFULEVBQXFCLFNBQUEsR0FBQTtBQUVsQixFQUFBLE1BQUEsQ0FBTyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ0osTUFBQSxLQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FDbEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxJQUFQO09BRGtCLENBQXJCLENBQUE7QUFBQSxNQUdBLEtBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUNHO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFFBQ0EsR0FBQSxFQUFLLFNBQVMsQ0FBQyxtQkFBVixDQUE4QixNQUE5QixDQUFBLEdBQXdDLEdBQXhDLEdBQThDLGlCQURuRDtPQURILENBSEEsQ0FBQTtBQUFBLE1BT0EsS0FBQyxDQUFBLFFBQUQsR0FBWSxHQUFBLENBQUEsUUFQWixDQUFBO2FBUUEsS0FBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsVUFBZCxFQUEwQixLQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsQ0FBbEIsQ0FBMUIsRUFUSTtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVAsQ0FBQSxDQUFBO0FBQUEsRUFZQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUNSLE1BQUEsS0FBQyxDQUFBLElBQUQsR0FBWSxJQUFBLE9BQUEsQ0FDVDtBQUFBLFFBQUEsYUFBQSxFQUFlLEtBQUMsQ0FBQSxhQUFoQjtBQUFBLFFBQ0EsVUFBQSxFQUFnQixJQUFBLG1CQUFBLENBQUEsQ0FEaEI7QUFBQSxRQUVBLFFBQUEsRUFBVSxLQUFDLENBQUEsUUFGWDtPQURTLENBQVosQ0FBQTthQUtBLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBTlE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBWkEsQ0FBQTtBQUFBLEVBcUJBLFNBQUEsQ0FBVSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ1AsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFETztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVYsQ0FyQkEsQ0FBQTtBQUFBLEVBeUJBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDakIsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BREE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQXpCQSxDQUFBO0FBQUEsRUE2QkEsRUFBQSxDQUFHLCtCQUFILEVBQW9DLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDakMsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBVixDQUFlLGFBQWYsQ0FBNkIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQTVDLENBQWtELEVBQWxELEVBRGlDO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEMsQ0E3QkEsQ0FBQTtBQUFBLEVBaUNBLEVBQUEsQ0FBRyw2Q0FBSCxFQUFrRCxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQy9DLFVBQUEsR0FBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLENBQU4sQ0FBQTtBQUFBLE1BRUEsS0FBQyxDQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBcEIsQ0FBeUIsU0FBQyxHQUFELEVBQU0sS0FBTixHQUFBO0FBQ3RCLFFBQUEsS0FBQSxHQUFRLEtBQUEsR0FBUSxDQUFoQixDQUFBO2VBQ0EsR0FBQSxHQUFNLEdBQUcsQ0FBQyxHQUFKLENBQVEsYUFBUixDQUFzQixDQUFDLE1BQXZCLEdBQWdDLE1BRmhCO01BQUEsQ0FBekIsQ0FGQSxDQUFBO2FBTUEsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBVixDQUFlLGFBQWYsQ0FBNkIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQTVDLENBQWtELEdBQUEsR0FBTSxDQUF4RCxFQVArQztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxELENBakNBLENBQUE7QUFBQSxFQTJDQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUNwRCxLQUFDLENBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBeEIsQ0FBZ0MsZ0JBQWhDLENBQWlELENBQUMsSUFBbEQsQ0FBdUQsU0FBQSxHQUFBO2VBQ3BELEtBQUMsQ0FBQSxJQUFJLENBQUMsY0FBZSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQXhCLENBQUEsRUFEb0Q7TUFBQSxDQUF2RCxFQURvRDtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZELENBM0NBLENBQUE7U0FnREEsRUFBQSxDQUFHLHlFQUFILEVBQThFLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDM0UsS0FBQyxDQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE9BQXhCLENBQWdDLG1CQUFoQyxDQUFvRCxDQUFDLElBQXJELENBQTBELFNBQUEsR0FBQTtlQUN2RCxLQUFDLENBQUEsSUFBSSxDQUFDLGNBQWUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUF4QixDQUFBLEVBRHVEO01BQUEsQ0FBMUQsRUFEMkU7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5RSxFQWxEa0I7QUFBQSxDQUFyQixDQVRBLENBQUE7Ozs7QUNBQSxJQUFBLGtGQUFBOztBQUFBLFNBQUEsR0FBWSxPQUFBLENBQVEsdURBQVIsQ0FBWixDQUFBOztBQUFBLFFBQ0EsR0FBVyxPQUFBLENBQVMsc0RBQVQsQ0FEWCxDQUFBOztBQUFBLGFBRUEsR0FBZ0IsT0FBQSxDQUFTLGdFQUFULENBRmhCLENBQUE7O0FBQUEsbUJBR0EsR0FBc0IsT0FBQSxDQUFRLHFFQUFSLENBSHRCLENBQUE7O0FBQUEsY0FJQSxHQUFpQixPQUFBLENBQVEsZ0VBQVIsQ0FKakIsQ0FBQTs7QUFBQSxTQUtBLEdBQVksT0FBQSxDQUFRLDRFQUFSLENBTFosQ0FBQTs7QUFBQSxRQVFBLENBQVMsWUFBVCxFQUF1QixTQUFBLEdBQUE7QUFFcEIsRUFBQSxNQUFBLENBQU8sQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUNKLE1BQUEsS0FBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxhQUFBLENBQ2xCO0FBQUEsUUFBQSxLQUFBLEVBQU8sSUFBUDtPQURrQixDQUFyQixDQUFBO0FBQUEsTUFHQSxLQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsQ0FDRztBQUFBLFFBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxRQUNBLEdBQUEsRUFBSyxTQUFTLENBQUMsbUJBQVYsQ0FBOEIsTUFBOUIsQ0FBQSxHQUF3QyxHQUF4QyxHQUE4QyxpQkFEbkQ7T0FESCxDQUhBLENBQUE7QUFBQSxNQU9BLEtBQUMsQ0FBQSxRQUFELEdBQVksR0FBQSxDQUFBLFFBUFosQ0FBQTthQVFBLEtBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLFVBQWQsRUFBMEIsS0FBQyxDQUFBLGFBQWEsQ0FBQyxFQUFmLENBQWtCLENBQWxCLENBQTFCLEVBVEk7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFQLENBQUEsQ0FBQTtBQUFBLEVBWUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDUixNQUFBLEtBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxTQUFBLENBQ1Q7QUFBQSxRQUFBLFVBQUEsRUFBWSxLQUFDLENBQUEsYUFBYjtBQUFBLFFBQ0EsS0FBQSxFQUFXLElBQUEsY0FBQSxDQUFBLENBRFg7T0FEUyxDQUFaLENBQUE7YUFJQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQUxRO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQVpBLENBQUE7QUFBQSxFQW9CQSxTQUFBLENBQVUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUNQLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBRE87SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWLENBcEJBLENBQUE7QUFBQSxFQXdCQSxFQUFBLENBQUcsZUFBSCxFQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ2pCLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQURBO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0F4QkEsQ0FBQTtBQUFBLEVBNEJBLEVBQUEsQ0FBRyxvREFBSCxFQUF5RCxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ3RELEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQVYsQ0FBZSxXQUFmLENBQTJCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUExQyxDQUFnRCxDQUFoRCxFQURzRDtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpELENBNUJBLENBQUE7QUFBQSxFQWdDQSxFQUFBLENBQUcscUNBQUgsRUFBMEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUN2QyxLQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBbkIsQ0FBMkIsZ0JBQTNCLENBQTRDLENBQUMsSUFBN0MsQ0FBa0QsU0FBQSxHQUFBO2VBQy9DLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLEVBRCtDO01BQUEsQ0FBbEQsRUFEdUM7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQyxDQWhDQSxDQUFBO0FBQUEsRUFxQ0EsRUFBQSxDQUFHLDBDQUFILEVBQStDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDNUMsS0FBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQW5CLENBQTJCLGdCQUEzQixDQUE0QyxDQUFDLElBQTdDLENBQWtELFNBQUEsR0FBQTtBQUMvQyxZQUFBLEVBQUE7QUFBQSxRQUFBLEVBQUEsR0FBSyxLQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsQ0FBbEIsQ0FBb0IsQ0FBQyxHQUFyQixDQUF5QixhQUF6QixDQUF1QyxDQUFDLEVBQXhDLENBQTJDLENBQTNDLENBQTZDLENBQUMsR0FBOUMsQ0FBa0QsSUFBbEQsQ0FBTCxDQUFBO2VBRUEsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQWEsRUFBYixFQUgrQztNQUFBLENBQWxELEVBRDRDO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0MsQ0FyQ0EsQ0FBQTtBQUFBLEVBNENBLEVBQUEsQ0FBRywwQ0FBSCxFQUErQyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQzNDLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFuQixDQUEyQiwwQkFBM0IsQ0FBc0QsQ0FBQyxJQUF2RCxDQUE0RCxTQUFBLEdBQUE7QUFDMUQsWUFBQSxFQUFBO0FBQUEsUUFBQSxFQUFBLEdBQUssS0FBQyxDQUFBLGFBQWEsQ0FBQyxFQUFmLENBQWtCLENBQWxCLENBQW9CLENBQUMsR0FBckIsQ0FBeUIsYUFBekIsQ0FBdUMsQ0FBQyxFQUF4QyxDQUEyQyxDQUEzQyxDQUE2QyxDQUFDLEdBQTlDLENBQWtELElBQWxELENBQUwsQ0FBQTtlQUVBLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFhLEVBQWIsRUFIMEQ7TUFBQSxDQUE1RCxFQUQyQztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9DLENBNUNBLENBQUE7QUFBQSxFQW1EQSxFQUFBLENBQUcsNkNBQUgsRUFBa0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUUvQyxVQUFBLFFBQUE7QUFBQSxNQUFBLEVBQUEsR0FBSyxLQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsQ0FBbEIsQ0FBb0IsQ0FBQyxHQUFyQixDQUF5QixhQUF6QixDQUF1QyxDQUFDLEVBQXhDLENBQTJDLENBQTNDLENBQTZDLENBQUMsR0FBOUMsQ0FBa0QsSUFBbEQsQ0FBTCxDQUFBO0FBQUEsTUFDQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBYSxFQUFiLENBREEsQ0FBQTtBQUFBLE1BR0EsSUFBQSxHQUFPLEtBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixDQUFsQixDQUFvQixDQUFDLEdBQXJCLENBQXlCLGFBQXpCLENBQXVDLENBQUMsRUFBeEMsQ0FBMkMsQ0FBM0MsQ0FBNkMsQ0FBQyxHQUE5QyxDQUFrRCxNQUFsRCxDQUhQLENBQUE7YUFLQSxLQUFDLENBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFWLENBQWUsR0FBQSxHQUFNLElBQXJCLENBQTBCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUF6QyxDQUErQyxDQUEvQyxFQVArQztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxELENBbkRBLENBQUE7QUFBQSxFQTZEQSxFQUFBLENBQUcsMkRBQUgsRUFBZ0UsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUM3RCxLQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBbkIsQ0FBMkIsaUJBQTNCLENBQTZDLENBQUMsSUFBOUMsQ0FBbUQsU0FBQSxHQUFBO2VBQ2hELEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBRGdEO01BQUEsQ0FBbkQsRUFENkQ7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoRSxDQTdEQSxDQUFBO0FBQUEsRUFrRUEsRUFBQSxDQUFHLDREQUFILEVBQWlFLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFFOUQsVUFBQSxFQUFBO0FBQUEsTUFBQSxFQUFBLEdBQUssS0FBQyxDQUFBLGFBQWEsQ0FBQyxFQUFmLENBQWtCLENBQWxCLENBQW9CLENBQUMsR0FBckIsQ0FBeUIsYUFBekIsQ0FBdUMsQ0FBQyxFQUF4QyxDQUEyQyxDQUEzQyxDQUE2QyxDQUFDLEdBQTlDLENBQWtELElBQWxELENBQUwsQ0FBQTtBQUFBLE1BQ0EsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQWEsRUFBYixDQURBLENBQUE7YUFHQSxNQUFBLENBQU8sS0FBQyxDQUFBLElBQUksQ0FBQyxhQUFiLENBQTJCLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFuQyxDQUF5QyxNQUF6QyxFQUw4RDtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpFLENBbEVBLENBQUE7QUFBQSxFQTBFQSxFQUFBLENBQUcsa0VBQUgsRUFBdUUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUNwRSxVQUFBLEVBQUE7QUFBQSxNQUFBLEVBQUEsR0FBSyxLQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsQ0FBbEIsQ0FBb0IsQ0FBQyxHQUFyQixDQUF5QixhQUF6QixDQUF1QyxDQUFDLEVBQXhDLENBQTJDLENBQTNDLENBQTZDLENBQUMsR0FBOUMsQ0FBa0QsSUFBbEQsQ0FBTCxDQUFBO0FBQUEsTUFDQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBYSxFQUFiLENBREEsQ0FBQTthQUdBLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFuQixDQUEyQiwwQkFBM0IsQ0FBc0QsQ0FBQyxJQUF2RCxDQUE0RCxTQUFBLEdBQUE7ZUFDekQsS0FBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQUEsRUFEeUQ7TUFBQSxDQUE1RCxFQUpvRTtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZFLENBMUVBLENBQUE7U0FrRkEsRUFBQSxDQUFHLGlFQUFILEVBQXNFLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDbkUsVUFBQSxRQUFBO0FBQUEsTUFBQSxFQUFBLEdBQUssS0FBQyxDQUFBLGFBQWEsQ0FBQyxFQUFmLENBQWtCLENBQWxCLENBQW9CLENBQUMsR0FBckIsQ0FBeUIsYUFBekIsQ0FBdUMsQ0FBQyxFQUF4QyxDQUEyQyxDQUEzQyxDQUE2QyxDQUFDLEdBQTlDLENBQWtELElBQWxELENBQUwsQ0FBQTtBQUFBLE1BQ0EsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQWEsRUFBYixDQURBLENBQUE7QUFBQSxNQUdBLElBQUEsR0FBTyxLQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsQ0FBbEIsQ0FBb0IsQ0FBQyxHQUFyQixDQUF5QixhQUF6QixDQUF1QyxDQUFDLEVBQXhDLENBQTJDLENBQTNDLENBQTZDLENBQUMsR0FBOUMsQ0FBa0QsTUFBbEQsQ0FIUCxDQUFBO0FBQUEsTUFJQSxLQUFDLENBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFWLENBQWUsR0FBQSxHQUFNLElBQXJCLENBQTBCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUF6QyxDQUErQyxDQUEvQyxDQUpBLENBQUE7QUFBQSxNQU1BLEtBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFBLENBTkEsQ0FBQTthQU9BLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQVYsQ0FBZSxHQUFBLEdBQU0sSUFBckIsQ0FBMEIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQXpDLENBQStDLENBQS9DLEVBUm1FO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEUsRUFwRm9CO0FBQUEsQ0FBdkIsQ0FSQSxDQUFBOzs7O0FDQUEsSUFBQSxxRUFBQTs7QUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLHVEQUFSLENBQVosQ0FBQTs7QUFBQSxRQUNBLEdBQVcsT0FBQSxDQUFTLHNEQUFULENBRFgsQ0FBQTs7QUFBQSxhQUVBLEdBQWdCLE9BQUEsQ0FBUyxnRUFBVCxDQUZoQixDQUFBOztBQUFBLGtCQUdBLEdBQXFCLE9BQUEsQ0FBUywwRUFBVCxDQUhyQixDQUFBOztBQUFBLGFBSUEsR0FBZ0IsT0FBQSxDQUFTLHNGQUFULENBSmhCLENBQUE7O0FBQUEsUUFPQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEsR0FBQTtBQUV4QixFQUFBLE1BQUEsQ0FBTyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ0osTUFBQSxLQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FDbEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxJQUFQO09BRGtCLENBQXJCLENBQUE7QUFBQSxNQUdBLEtBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUNHO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFFBQ0EsR0FBQSxFQUFLLFNBQVMsQ0FBQyxtQkFBVixDQUE4QixNQUE5QixDQUFBLEdBQXdDLEdBQXhDLEdBQThDLGlCQURuRDtPQURILENBSEEsQ0FBQTtBQUFBLE1BT0EsS0FBQyxDQUFBLFFBQUQsR0FBWSxHQUFBLENBQUEsUUFQWixDQUFBO2FBUUEsS0FBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsVUFBZCxFQUEwQixLQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsQ0FBbEIsQ0FBMUIsRUFUSTtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVAsQ0FBQSxDQUFBO0FBQUEsRUFZQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUVSLFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFZLElBQUEsa0JBQUEsQ0FDVDtBQUFBLFFBQUEsWUFBQSxFQUFjLEtBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixDQUFsQixDQUFvQixDQUFDLEdBQXJCLENBQXlCLGFBQXpCLENBQXVDLENBQUMsRUFBeEMsQ0FBMkMsQ0FBM0MsQ0FBZDtPQURTLENBQVosQ0FBQTtBQUFBLE1BR0EsS0FBQyxDQUFBLElBQUQsR0FBWSxJQUFBLGFBQUEsQ0FDVDtBQUFBLFFBQUEsUUFBQSxFQUFVLEtBQUMsQ0FBQSxRQUFYO0FBQUEsUUFDQSxrQkFBQSxFQUFvQixLQURwQjtPQURTLENBSFosQ0FBQTthQU9BLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBVFE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBWkEsQ0FBQTtBQUFBLEVBd0JBLFNBQUEsQ0FBVSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ1AsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFETztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVYsQ0F4QkEsQ0FBQTtBQUFBLEVBNkJBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDakIsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BREE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQTdCQSxDQUFBO0FBQUEsRUFrQ0EsRUFBQSxDQUFHLHVDQUFILEVBQTRDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFFekMsTUFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBekIsQ0FBNkIsVUFBN0IsQ0FBd0MsQ0FBQyxNQUFNLENBQUMsS0FBaEQsQ0FBc0QsQ0FBdEQsQ0FEQSxDQUFBO0FBQUEsTUFFQSxLQUFDLENBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFWLENBQW1CLGNBQW5CLENBQWtDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFELENBRjVDLENBQUE7QUFBQSxNQUlBLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBSkEsQ0FBQTtBQUFBLE1BS0EsS0FBQyxDQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUF6QixDQUE2QixVQUE3QixDQUF3QyxDQUFDLE1BQU0sQ0FBQyxLQUFoRCxDQUFzRCxDQUF0RCxDQUxBLENBQUE7QUFBQSxNQU1BLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVYsQ0FBbUIsaUJBQW5CLENBQXFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFELENBTi9DLENBQUE7QUFBQSxNQVFBLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBUkEsQ0FBQTtBQUFBLE1BU0EsS0FBQyxDQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUF6QixDQUE2QixVQUE3QixDQUF3QyxDQUFDLE1BQU0sQ0FBQyxLQUFoRCxDQUFzRCxDQUF0RCxDQVRBLENBQUE7QUFBQSxNQVVBLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVYsQ0FBbUIsZUFBbkIsQ0FBbUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQUQsQ0FWN0MsQ0FBQTtBQUFBLE1BWUEsS0FBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsQ0FaQSxDQUFBO0FBQUEsTUFhQSxLQUFDLENBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQXpCLENBQTZCLFVBQTdCLENBQXdDLENBQUMsTUFBTSxDQUFDLEtBQWhELENBQXNELENBQXRELENBYkEsQ0FBQTthQWNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVYsQ0FBbUIsZUFBbkIsQ0FBbUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQUQsRUFoQko7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QyxDQWxDQSxDQUFBO0FBQUEsRUFzREEsRUFBQSxDQUFHLG1CQUFILEVBQXdCLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFFckIsTUFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxDQUFBLENBQUE7YUFDQSxLQUFDLENBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQXpCLENBQTZCLFVBQTdCLENBQXdDLENBQUMsTUFBTSxDQUFDLEtBQWhELENBQXNELENBQXRELEVBSHFCO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEIsQ0F0REEsQ0FBQTtTQTZEQSxFQUFBLENBQUcsa0JBQUgsRUFBdUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUVwQixNQUFBLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsS0FBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxLQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxDQUZBLENBQUE7QUFBQSxNQUtBLEtBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLENBTEEsQ0FBQTtBQUFBLE1BTUEsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsQ0FOQSxDQUFBO2FBT0EsS0FBQyxDQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUF6QixDQUE2QixVQUE3QixDQUF3QyxDQUFDLE1BQU0sQ0FBQyxLQUFoRCxDQUFzRCxDQUF0RCxFQVRvQjtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCLEVBL0R3QjtBQUFBLENBQTNCLENBUEEsQ0FBQTs7OztBQ0NBLElBQUEsOEdBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUyx1REFBVCxDQUFaLENBQUE7O0FBQUEsUUFDQSxHQUFXLE9BQUEsQ0FBUyxzREFBVCxDQURYLENBQUE7O0FBQUEsYUFFQSxHQUFnQixPQUFBLENBQVMsZ0VBQVQsQ0FGaEIsQ0FBQTs7QUFBQSxrQkFHQSxHQUFxQixPQUFBLENBQVMsMEVBQVQsQ0FIckIsQ0FBQTs7QUFBQSx1QkFJQSxHQUEwQixPQUFBLENBQVMsK0VBQVQsQ0FKMUIsQ0FBQTs7QUFBQSxZQUtBLEdBQWUsT0FBQSxDQUFTLHFGQUFULENBTGYsQ0FBQTs7QUFBQSxlQU1BLEdBQWtCLE9BQUEsQ0FBUyx1RUFBVCxDQU5sQixDQUFBOztBQUFBLFFBUUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUd2QixFQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ1IsTUFBQSxLQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FDbEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxJQUFQO09BRGtCLENBQXJCLENBQUE7QUFBQSxNQUdBLEtBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUNHO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFFBQ0EsR0FBQSxFQUFLLFNBQVMsQ0FBQyxtQkFBVixDQUE4QixNQUE5QixDQUFBLEdBQXdDLEdBQXhDLEdBQThDLGlCQURuRDtPQURILENBSEEsQ0FBQTtBQUFBLE1BT0EsS0FBQyxDQUFBLFFBQUQsR0FBWSxHQUFBLENBQUEsUUFQWixDQUFBO0FBQUEsTUFRQSxLQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxVQUFkLEVBQTBCLEtBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixDQUFsQixDQUExQixDQVJBLENBQUE7QUFBQSxNQVVBLEtBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxZQUFBLENBQ1Q7QUFBQSxRQUFBLFFBQUEsRUFBVSxLQUFDLENBQUEsUUFBWDtBQUFBLFFBQ0EsS0FBQSxFQUFPLEtBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixDQUFsQixDQUFvQixDQUFDLEdBQXJCLENBQXlCLGFBQXpCLENBQXVDLENBQUMsRUFBeEMsQ0FBMkMsQ0FBM0MsQ0FEUDtPQURTLENBVlosQ0FBQTthQWNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBZlE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLEVBa0JBLFNBQUEsQ0FBVSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ1AsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFETztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVYsQ0FsQkEsQ0FBQTtBQUFBLEVBc0JBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDakIsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BREE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQXRCQSxDQUFBO0FBQUEsRUEwQkEsRUFBQSxDQUFHLGlDQUFILEVBQXNDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDbkMsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBVixDQUFlLGlCQUFmLENBQWlDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFoRCxDQUFzRCxDQUF0RCxFQURtQztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRDLENBMUJBLENBQUE7QUFBQSxFQThCQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUNwRCxLQUFDLENBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBeEIsQ0FBZ0MsaUJBQWhDLENBQWtELENBQUMsSUFBbkQsQ0FBd0QsU0FBQSxHQUFBO2VBQ3JELEtBQUMsQ0FBQSxJQUFJLENBQUMsa0JBQW1CLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBNUIsQ0FBQSxFQURxRDtNQUFBLENBQXhELEVBRG9EO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsQ0E5QkEsQ0FBQTtBQUFBLEVBbUNBLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ3JCLE1BQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQW5CLENBQTJCLGFBQTNCLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsU0FBQSxHQUFBO2VBQzVDLEtBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFBLEVBRDRDO01BQUEsQ0FBL0MsQ0FBQSxDQUFBO2FBR0EsS0FBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQW5CLENBQTJCLGFBQTNCLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsU0FBQSxHQUFBO2VBQzVDLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBRDRDO01BQUEsQ0FBL0MsRUFKcUI7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QixDQW5DQSxDQUFBO0FBQUEsRUEyQ0EsRUFBQSxDQUFHLG9EQUFILEVBQXlELENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFDLElBQUQsR0FBQTtBQUN0RCxNQUFBLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQVosQ0FBaUIsYUFBakIsRUFBZ0MsU0FBQyxLQUFELEdBQUE7ZUFDN0IsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBVixDQUFtQixNQUFuQixDQUEwQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBRCxFQURQO01BQUEsQ0FBaEMsQ0FBQSxDQUFBO0FBQUEsTUFHQSxLQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBQSxDQUhBLENBQUE7QUFBQSxNQUtBLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQVosQ0FBaUIsYUFBakIsRUFBZ0MsU0FBQSxHQUFBO0FBQzdCLFFBQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBVixDQUFtQixNQUFuQixDQUEwQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBRCxDQUFwQyxDQUFBO2VBQ0EsSUFBQSxDQUFBLEVBRjZCO01BQUEsQ0FBaEMsQ0FMQSxDQUFBO2FBU0EsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFWc0Q7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6RCxDQTNDQSxDQUFBO0FBQUEsRUF3REEsRUFBQSxDQUFHLHFDQUFILEVBQTBDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDdkMsS0FBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQW5CLENBQTJCLGNBQTNCLENBQTBDLENBQUMsSUFBM0MsQ0FBZ0QsU0FBQSxHQUFBO2VBQzdDLEtBQUMsQ0FBQSxJQUFJLENBQUMsWUFBTixDQUFBLEVBRDZDO01BQUEsQ0FBaEQsRUFEdUM7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQyxDQXhEQSxDQUFBO1NBK0RBLEVBQUEsQ0FBRyw2REFBSCxFQUFrRSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxFLEVBbEV1QjtBQUFBLENBQTFCLENBUkEsQ0FBQTs7OztBQ0RBLElBQUEsMElBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSx1REFBUixDQUFaLENBQUE7O0FBQUEsUUFDQSxHQUFXLE9BQUEsQ0FBUSxzREFBUixDQURYLENBQUE7O0FBQUEsU0FFQSxHQUFZLE9BQUEsQ0FBUSxrRkFBUixDQUZaLENBQUE7O0FBQUEsYUFHQSxHQUFnQixPQUFBLENBQVEsZ0VBQVIsQ0FIaEIsQ0FBQTs7QUFBQSxlQUlBLEdBQWtCLE9BQUEsQ0FBUSx1RUFBUixDQUpsQixDQUFBOztBQUFBLG9CQUtBLEdBQXVCLE9BQUEsQ0FBUSw0RUFBUixDQUx2QixDQUFBOztBQUFBLGtCQU1BLEdBQXFCLE9BQUEsQ0FBUSwwRUFBUixDQU5yQixDQUFBOztBQUFBLHVCQU9BLEdBQTBCLE9BQUEsQ0FBUSwrRUFBUixDQVAxQixDQUFBOztBQUFBLE9BUUEsR0FBVSxPQUFBLENBQVEsMERBQVIsQ0FSVixDQUFBOztBQUFBLFFBV0EsQ0FBUyxXQUFULEVBQXNCLFNBQUEsR0FBQTtBQUduQixFQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ1IsTUFBQSxLQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FDbEI7QUFBQSxRQUFBLEtBQUEsRUFBTyxJQUFQO09BRGtCLENBQXJCLENBQUE7QUFBQSxNQUdBLEtBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUNHO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFFBQ0EsR0FBQSxFQUFLLFNBQVMsQ0FBQyxtQkFBVixDQUE4QixNQUE5QixDQUFBLEdBQXdDLEdBQXhDLEdBQThDLGlCQURuRDtPQURILENBSEEsQ0FBQTtBQUFBLE1BT0EsS0FBQyxDQUFBLFFBQUQsR0FBWSxHQUFBLENBQUEsUUFQWixDQUFBO0FBQUEsTUFRQSxLQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxVQUFkLEVBQTBCLEtBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixDQUFsQixDQUExQixDQVJBLENBQUE7QUFBQSxNQVVBLEtBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxTQUFBLENBQ1Q7QUFBQSxRQUFBLFFBQUEsRUFBVSxLQUFDLENBQUEsUUFBWDtBQUFBLFFBQ0EsVUFBQSxFQUFZLEtBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixDQUFsQixDQUFvQixDQUFDLEdBQXJCLENBQXlCLGFBQXpCLENBRFo7T0FEUyxDQVZaLENBQUE7YUFjQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQWZRO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxFQWtCQSxTQUFBLENBQVUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUNQLE1BQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQUEsQ0FBQSxDQUFBO2FBQ0EsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFGTztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVYsQ0FsQkEsQ0FBQTtBQUFBLEVBd0JBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDakIsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BREE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQXhCQSxDQUFBO0FBQUEsRUE2QkEsRUFBQSxDQUFHLHNDQUFILEVBQTJDLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDeEMsS0FBQyxDQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBVixDQUFlLGdCQUFmLENBQWdDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUEvQyxDQUFxRCxLQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsQ0FBbEIsQ0FBb0IsQ0FBQyxHQUFyQixDQUF5QixhQUF6QixDQUF1QyxDQUFDLE1BQTdGLEVBRHdDO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0MsQ0E3QkEsQ0FBQTtBQUFBLEVBa0NBLEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO2FBQ2hDLE1BQUEsQ0FBTyxLQUFDLENBQUEsSUFBSSxDQUFDLFdBQWIsQ0FBeUIsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQWpDLENBQW9DLElBQXBDLEVBRGdDO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkMsQ0FsQ0EsQ0FBQTtBQUFBLEVBdUNBLEVBQUEsQ0FBRyx3REFBSCxFQUE2RCxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQzFELE1BQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQXRCLENBQThCLGdCQUE5QixDQUErQyxDQUFDLElBQWhELENBQXFELFNBQUEsR0FBQTtlQUNsRCxLQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBQSxFQURrRDtNQUFBLENBQXJELENBQUEsQ0FBQTthQUdBLEtBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUF0QixDQUE4QixnQkFBOUIsQ0FBK0MsQ0FBQyxJQUFoRCxDQUFxRCxTQUFBLEdBQUE7ZUFDbEQsS0FBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQUEsRUFEa0Q7TUFBQSxDQUFyRCxFQUowRDtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdELENBdkNBLENBQUE7QUFBQSxFQWdEQSxFQUFBLENBQUcsK0JBQUgsRUFBb0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTtBQUNqQyxNQUFBLEtBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWYsQ0FBbUIsS0FBbkIsRUFBMEIsR0FBMUIsQ0FBQSxDQUFBO2FBQ0EsTUFBQSxDQUFPLEtBQUMsQ0FBQSxJQUFJLENBQUMsa0JBQWIsQ0FBZ0MsQ0FBQyxFQUFFLENBQUMsS0FBcEMsQ0FBMEMsR0FBMUMsRUFGaUM7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQyxDQWhEQSxDQUFBO0FBQUEsRUFzREEsRUFBQSxDQUFHLG1CQUFILEVBQXdCLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDckIsTUFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBdEIsQ0FBOEIsYUFBOUIsQ0FBNEMsQ0FBQyxJQUE3QyxDQUFrRCxTQUFBLEdBQUE7ZUFDL0MsS0FBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQUEsRUFEK0M7TUFBQSxDQUFsRCxDQUFBLENBQUE7YUFHQSxLQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBdEIsQ0FBOEIsYUFBOUIsQ0FBNEMsQ0FBQyxJQUE3QyxDQUFrRCxTQUFBLEdBQUE7ZUFDL0MsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFEK0M7TUFBQSxDQUFsRCxFQUpxQjtJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLENBdERBLENBQUE7QUFBQSxFQStEQSxFQUFBLENBQUcscURBQUgsRUFBMEQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUN2RCxLQUFDLENBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBeEIsQ0FBZ0MsY0FBaEMsQ0FBK0MsQ0FBQyxJQUFoRCxDQUFxRCxTQUFBLEdBQUE7ZUFDbEQsS0FBQyxDQUFBLElBQUksQ0FBQyxpQkFBa0IsQ0FBQSxDQUFBLENBQUUsQ0FBQyxZQUEzQixDQUFBLEVBRGtEO01BQUEsQ0FBckQsRUFEdUQ7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExRCxDQS9EQSxDQUFBO1NBc0VBLEVBQUEsQ0FBRyx1REFBSCxFQUE0RCxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVELEVBekVtQjtBQUFBLENBQXRCLENBWEEsQ0FBQTs7OztBQ0FBLElBQUEsb0RBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUyxpREFBVCxDQUFaLENBQUE7O0FBQUEsYUFDQSxHQUFnQixPQUFBLENBQVMsMERBQVQsQ0FEaEIsQ0FBQTs7QUFBQSxhQUVBLEdBQWdCLE9BQUEsQ0FBUyw4Q0FBVCxDQUZoQixDQUFBOztBQUFBLFdBR0EsR0FBZ0IsT0FBQSxDQUFTLDBEQUFULENBSGhCLENBQUE7O0FBQUEsUUFLQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBRXRCLEVBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDUixNQUFBLEtBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUNsQjtBQUFBLFFBQUEsS0FBQSxFQUFPLElBQVA7T0FEa0IsQ0FBckIsQ0FBQTtBQUFBLE1BR0EsS0FBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQ0c7QUFBQSxRQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsUUFDQSxHQUFBLEVBQUssU0FBUyxDQUFDLG1CQUFWLENBQThCLE1BQTlCLENBQUEsR0FBd0MsR0FBeEMsR0FBOEMsaUJBRG5EO09BREgsQ0FIQSxDQUFBO0FBQUEsTUFPQSxLQUFDLENBQUEsSUFBRCxHQUFRLEdBQUEsQ0FBQSxXQVBSLENBQUE7YUFRQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQVRRO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxFQVlBLFNBQUEsQ0FBVSxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBO0FBQ1AsTUFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxDQUFBLENBQUE7QUFFQSxNQUFBLElBQUcsS0FBQyxDQUFBLGFBQUo7ZUFBdUIsS0FBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQUEsRUFBdkI7T0FITztJQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVYsQ0FaQSxDQUFBO0FBQUEsRUFtQkEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQTthQUNqQixNQUFBLENBQU8sS0FBQyxDQUFBLElBQUksQ0FBQyxFQUFiLENBQWdCLENBQUMsRUFBRSxDQUFDLE1BREg7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQW5CQSxDQUFBO1NBd0JBLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQyxJQUFELEdBQUE7QUFFM0MsVUFBQSxpQkFBQTtBQUFBLE1BQUEsS0FBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxhQUFBLENBQ2xCO0FBQUEsUUFBQSxhQUFBLEVBQWUsS0FBQyxDQUFBLGFBQWhCO09BRGtCLENBQXJCLENBQUE7QUFBQSxNQUdBLE1BQUEsR0FBUyxLQUFDLENBQUEsYUFBYSxDQUFDLFNBSHhCLENBQUE7QUFBQSxNQUlBLFNBQUEsR0FBWSxLQUFDLENBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFWLENBQWUsWUFBZixDQUpaLENBQUE7QUFBQSxNQU1BLFNBQVMsQ0FBQyxFQUFWLENBQWEsT0FBYixFQUFzQixTQUFDLEtBQUQsR0FBQTtBQUNuQixRQUFBLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQXRCLENBQXlCLE1BQXpCLEVBQWlDLGFBQWpDLENBQUEsQ0FBQTtlQUNBLElBQUEsQ0FBQSxFQUZtQjtNQUFBLENBQXRCLENBTkEsQ0FBQTthQVVBLFNBQVMsQ0FBQyxLQUFWLENBQUEsRUFaMkM7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QyxFQTFCc0I7QUFBQSxDQUF6QixDQUxBLENBQUE7Ozs7QUNBQSxJQUFBLFNBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUyxzREFBVCxDQUFaLENBQUE7O0FBQUEsUUFHQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBRXBCLEVBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7QUFDUixNQUFBLEtBQUMsQ0FBQSxJQUFELEdBQVEsR0FBQSxDQUFBLFNBQVIsQ0FBQTthQUNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBRlE7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLEVBS0EsU0FBQSxDQUFVLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDUCxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQURPO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVixDQUxBLENBQUE7QUFBQSxFQVNBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUE7YUFDakIsTUFBQSxDQUFPLEtBQUMsQ0FBQSxJQUFJLENBQUMsRUFBYixDQUFnQixDQUFDLEVBQUUsQ0FBQyxNQURIO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FUQSxDQUFBO0FBQUEsRUFhQSxFQUFBLENBQUcsbUNBQUgsRUFBd0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QyxDQWJBLENBQUE7QUFBQSxFQWdCQSxFQUFBLENBQUcsdUNBQUgsRUFBNEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QyxDQWhCQSxDQUFBO0FBQUEsRUFtQkEsRUFBQSxDQUFHLGtEQUFILEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsQ0FuQkEsQ0FBQTtBQUFBLEVBc0JBLEVBQUEsQ0FBRyx1Q0FBSCxFQUE0QyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVDLENBdEJBLENBQUE7U0F5QkEsRUFBQSxDQUFHLGtEQUFILEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsRUEzQm9CO0FBQUEsQ0FBdkIsQ0FIQSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIGRpZ2l0c1xuICogQ29weXJpZ2h0IChjKSAyMDEzIEpvbiBTY2hsaW5rZXJ0XG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUGFkIG51bWJlcnMgd2l0aCB6ZXJvcy5cbiAqIEF1dG9tYXRpY2FsbHkgcGFkIHRoZSBudW1iZXIgb2YgZGlnaXRzIGJhc2VkIG9uIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5LFxuICogb3IgZXhwbGljaXRseSBwYXNzIGluIHRoZSBudW1iZXIgb2YgZGlnaXRzIHRvIHVzZS5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG51bSAgVGhlIG51bWJlciB0byBwYWQuXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdHMgT3B0aW9ucyBvYmplY3Qgd2l0aCBgZGlnaXRzYCBhbmQgYGF1dG9gIHByb3BlcnRpZXMuXG4gKiAgICB7XG4gKiAgICAgIGF1dG86IGFycmF5Lmxlbmd0aCAvLyBwYXNzIGluIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5XG4gKiAgICAgIGRpZ2l0czogNCAgICAgICAgICAvLyBvciBwYXNzIGluIHRoZSBudW1iZXIgb2YgZGlnaXRzIHRvIHVzZVxuICogICAgfVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgIFRoZSBwYWRkZWQgbnVtYmVyIHdpdGggemVyb3MgcHJlcGVuZGVkXG4gKlxuICogQGV4YW1wbGVzOlxuICogIDEgICAgICA9PiAwMDAwMDFcbiAqICAxMCAgICAgPT4gMDAwMDEwXG4gKiAgMTAwICAgID0+IDAwMDEwMFxuICogIDEwMDAgICA9PiAwMDEwMDBcbiAqICAxMDAwMCAgPT4gMDEwMDAwXG4gKiAgMTAwMDAwID0+IDEwMDAwMFxuICovXG5cbmV4cG9ydHMucGFkID0gZnVuY3Rpb24gKG51bSwgb3B0cykge1xuICB2YXIgZGlnaXRzID0gb3B0cy5kaWdpdHMgfHwgMztcbiAgaWYob3B0cy5hdXRvICYmIHR5cGVvZiBvcHRzLmF1dG8gPT09ICdudW1iZXInKSB7XG4gICAgZGlnaXRzID0gU3RyaW5nKG9wdHMuYXV0bykubGVuZ3RoO1xuICB9XG4gIHZhciBsZW5EaWZmID0gZGlnaXRzIC0gU3RyaW5nKG51bSkubGVuZ3RoO1xuICB2YXIgcGFkZGluZyA9ICcnO1xuICBpZiAobGVuRGlmZiA+IDApIHtcbiAgICB3aGlsZSAobGVuRGlmZi0tKSB7XG4gICAgICBwYWRkaW5nICs9ICcwJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhZGRpbmcgKyBudW07XG59O1xuXG4vKipcbiAqIFN0cmlwIGxlYWRpbmcgZGlnaXRzIGZyb20gYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgZnJvbSB3aGljaCB0byBzdHJpcCBkaWdpdHNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqL1xuXG5leHBvcnRzLnN0cmlwbGVmdCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXGQrXFwtPy9nLCAnJyk7XG59O1xuXG4vKipcbiAqIFN0cmlwIHRyYWlsaW5nIGRpZ2l0cyBmcm9tIGEgc3RyaW5nXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIGZyb20gd2hpY2ggdG8gc3RyaXAgZGlnaXRzXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBUaGUgbW9kaWZpZWQgc3RyaW5nXG4gKi9cblxuZXhwb3J0cy5zdHJpcHJpZ2h0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFwtP1xcZCskL2csICcnKTtcbn07XG5cbi8qKlxuICogQ291bnQgZGlnaXRzIG9uIHRoZSBsZWZ0IHNpZGUgb2YgYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgd2l0aCBkaWdpdHMgdG8gY291bnRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqIEBleGFtcGxlXG4gKiAgXCIwMDEtZm9vLm1kXCIgPT4gM1xuICovXG5cbmV4cG9ydHMuY291bnRsZWZ0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyLm1hdGNoKC9eXFxkKy9nKSkubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBDb3VudCBkaWdpdHMgb24gdGhlIHJpZ2h0IHNpZGUgb2YgYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgd2l0aCBkaWdpdHMgdG8gY291bnRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqIEBleGFtcGxlXG4gKiAgXCIwMDEtZm9vLm1kXCIgPT4gM1xuICovXG5cbmV4cG9ydHMuY291bnRyaWdodCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gU3RyaW5nKHN0ci5tYXRjaCgvXFxkKyQvZykpLmxlbmd0aDtcbn07IiwiLypqc2hpbnQgZXFudWxsOiB0cnVlICovXG5cbm1vZHVsZS5leHBvcnRzLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuXG52YXIgSGFuZGxlYmFycyA9IHt9O1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZFUlNJT04gPSBcIjEuMC4wXCI7XG5IYW5kbGViYXJzLkNPTVBJTEVSX1JFVklTSU9OID0gNDtcblxuSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz49IDEuMC4wJ1xufTtcblxuSGFuZGxlYmFycy5oZWxwZXJzICA9IHt9O1xuSGFuZGxlYmFycy5wYXJ0aWFscyA9IHt9O1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgIGZ1bmN0aW9uVHlwZSA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24obmFtZSwgZm4sIGludmVyc2UpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBpZiAoaW52ZXJzZSB8fCBmbikgeyB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgaGVscGVycycpOyB9XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaW52ZXJzZSkgeyBmbi5ub3QgPSBpbnZlcnNlOyB9XG4gICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsID0gZnVuY3Rpb24obmFtZSwgc3RyKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBzdHI7XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihhcmcpIHtcbiAgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBoZWxwZXI6ICdcIiArIGFyZyArIFwiJ1wiKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UgfHwgZnVuY3Rpb24oKSB7fSwgZm4gPSBvcHRpb25zLmZuO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcblxuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKGNvbnRleHQgPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm4odGhpcyk7XG4gIH0gZWxzZSBpZihjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgIGlmKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIEhhbmRsZWJhcnMuaGVscGVycy5lYWNoKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZuKGNvbnRleHQpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5LID0gZnVuY3Rpb24oKSB7fTtcblxuSGFuZGxlYmFycy5jcmVhdGVGcmFtZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24ob2JqZWN0KSB7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBvYmplY3Q7XG4gIHZhciBvYmogPSBuZXcgSGFuZGxlYmFycy5LKCk7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBudWxsO1xuICByZXR1cm4gb2JqO1xufTtcblxuSGFuZGxlYmFycy5sb2dnZXIgPSB7XG4gIERFQlVHOiAwLCBJTkZPOiAxLCBXQVJOOiAyLCBFUlJPUjogMywgbGV2ZWw6IDMsXG5cbiAgbWV0aG9kTWFwOiB7MDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcid9LFxuXG4gIC8vIGNhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24obGV2ZWwsIG9iaikge1xuICAgIGlmIChIYW5kbGViYXJzLmxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IEhhbmRsZWJhcnMubG9nZ2VyLm1ldGhvZE1hcFtsZXZlbF07XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGVbbWV0aG9kXSkge1xuICAgICAgICBjb25zb2xlW21ldGhvZF0uY2FsbChjb25zb2xlLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy5sb2cgPSBmdW5jdGlvbihsZXZlbCwgb2JqKSB7IEhhbmRsZWJhcnMubG9nZ2VyLmxvZyhsZXZlbCwgb2JqKTsgfTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGZuID0gb3B0aW9ucy5mbiwgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZTtcbiAgdmFyIGkgPSAwLCByZXQgPSBcIlwiLCBkYXRhO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgZGF0YSA9IEhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgfVxuXG4gIGlmKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgaWYoY29udGV4dCBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgIGZvcih2YXIgaiA9IGNvbnRleHQubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgICBpZiAoZGF0YSkgeyBkYXRhLmluZGV4ID0gaTsgfVxuICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ldLCB7IGRhdGE6IGRhdGEgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvcih2YXIga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgaWYoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgaWYoZGF0YSkgeyBkYXRhLmtleSA9IGtleTsgfVxuICAgICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRba2V5XSwge2RhdGE6IGRhdGF9KTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZihpID09PSAwKXtcbiAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb25kaXRpb25hbCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICBpZighY29uZGl0aW9uYWwgfHwgSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd1bmxlc3MnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHtmbjogb3B0aW9ucy5pbnZlcnNlLCBpbnZlcnNlOiBvcHRpb25zLmZufSk7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmICghSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbnRleHQpKSByZXR1cm4gb3B0aW9ucy5mbihjb250ZXh0KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgSGFuZGxlYmFycy5sb2cobGV2ZWwsIGNvbnRleHQpO1xufSk7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxuLy8gQkVHSU4oQlJPV1NFUilcblxuSGFuZGxlYmFycy5WTSA9IHtcbiAgdGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlU3BlYykge1xuICAgIC8vIEp1c3QgYWRkIHdhdGVyXG4gICAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICAgIGVzY2FwZUV4cHJlc3Npb246IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICAgIGludm9rZVBhcnRpYWw6IEhhbmRsZWJhcnMuVk0uaW52b2tlUGFydGlhbCxcbiAgICAgIHByb2dyYW1zOiBbXSxcbiAgICAgIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV07XG4gICAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbShpLCBmbiwgZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgICB9LFxuICAgICAgbWVyZ2U6IGZ1bmN0aW9uKHBhcmFtLCBjb21tb24pIHtcbiAgICAgICAgdmFyIHJldCA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgICBpZiAocGFyYW0gJiYgY29tbW9uKSB7XG4gICAgICAgICAgcmV0ID0ge307XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBjb21tb24pO1xuICAgICAgICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHJldCwgcGFyYW0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9LFxuICAgICAgcHJvZ3JhbVdpdGhEZXB0aDogSGFuZGxlYmFycy5WTS5wcm9ncmFtV2l0aERlcHRoLFxuICAgICAgbm9vcDogSGFuZGxlYmFycy5WTS5ub29wLFxuICAgICAgY29tcGlsZXJJbmZvOiBudWxsXG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIHZhciByZXN1bHQgPSB0ZW1wbGF0ZVNwZWMuY2FsbChjb250YWluZXIsIEhhbmRsZWJhcnMsIGNvbnRleHQsIG9wdGlvbnMuaGVscGVycywgb3B0aW9ucy5wYXJ0aWFscywgb3B0aW9ucy5kYXRhKTtcblxuICAgICAgdmFyIGNvbXBpbGVySW5mbyA9IGNvbnRhaW5lci5jb21waWxlckluZm8gfHwgW10sXG4gICAgICAgICAgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IEhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgICAgIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICAgICAgdGhyb3cgXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBwcmVjb21waWxlciB0byBhIG5ld2VyIHZlcnNpb24gKFwiK3J1bnRpbWVWZXJzaW9ucytcIikgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uIChcIitjb21waWxlclZlcnNpb25zK1wiKS5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGEgbmV3ZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gXCIrXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKFwiK2NvbXBpbGVySW5mb1sxXStcIikuXCI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9LFxuXG4gIHByb2dyYW1XaXRoRGVwdGg6IGZ1bmN0aW9uKGksIGZuLCBkYXRhIC8qLCAkZGVwdGggKi8pIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMyk7XG5cbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgW2NvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhXS5jb25jYXQoYXJncykpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gYXJncy5sZW5ndGg7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgdmFyIHByb2dyYW0gPSBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhKTtcbiAgICB9O1xuICAgIHByb2dyYW0ucHJvZ3JhbSA9IGk7XG4gICAgcHJvZ3JhbS5kZXB0aCA9IDA7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIG5vb3A6IGZ1bmN0aW9uKCkgeyByZXR1cm4gXCJcIjsgfSxcbiAgaW52b2tlUGFydGlhbDogZnVuY3Rpb24ocGFydGlhbCwgbmFtZSwgY29udGV4dCwgaGVscGVycywgcGFydGlhbHMsIGRhdGEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHsgaGVscGVyczogaGVscGVycywgcGFydGlhbHM6IHBhcnRpYWxzLCBkYXRhOiBkYXRhIH07XG5cbiAgICBpZihwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBmb3VuZFwiKTtcbiAgICB9IGVsc2UgaWYocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKCFIYW5kbGViYXJzLmNvbXBpbGUpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRpYWxzW25hbWVdID0gSGFuZGxlYmFycy5jb21waWxlKHBhcnRpYWwsIHtkYXRhOiBkYXRhICE9PSB1bmRlZmluZWR9KTtcbiAgICAgIHJldHVybiBwYXJ0aWFsc1tuYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMudGVtcGxhdGUgPSBIYW5kbGViYXJzLlZNLnRlbXBsYXRlO1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG5cbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gQkVHSU4oQlJPV1NFUilcblxudmFyIGVycm9yUHJvcHMgPSBbJ2Rlc2NyaXB0aW9uJywgJ2ZpbGVOYW1lJywgJ2xpbmVOdW1iZXInLCAnbWVzc2FnZScsICduYW1lJywgJ251bWJlcicsICdzdGFjayddO1xuXG5IYW5kbGViYXJzLkV4Y2VwdGlvbiA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgdmFyIHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxufTtcbkhhbmRsZWJhcnMuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuSGFuZGxlYmFycy5TYWZlU3RyaW5nID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufTtcbkhhbmRsZWJhcnMuU2FmZVN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RyaW5nLnRvU3RyaW5nKCk7XG59O1xuXG52YXIgZXNjYXBlID0ge1xuICBcIiZcIjogXCImYW1wO1wiLFxuICBcIjxcIjogXCImbHQ7XCIsXG4gIFwiPlwiOiBcIiZndDtcIixcbiAgJ1wiJzogXCImcXVvdDtcIixcbiAgXCInXCI6IFwiJiN4Mjc7XCIsXG4gIFwiYFwiOiBcIiYjeDYwO1wiXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2c7XG52YXIgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxudmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdIHx8IFwiJmFtcDtcIjtcbn07XG5cbkhhbmRsZWJhcnMuVXRpbHMgPSB7XG4gIGV4dGVuZDogZnVuY3Rpb24ob2JqLCB2YWx1ZSkge1xuICAgIGZvcih2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgICBpZih2YWx1ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdmFsdWVba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZXNjYXBlRXhwcmVzc2lvbjogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgaW5zdGFuY2VvZiBIYW5kbGViYXJzLlNhZmVTdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcudG9TdHJpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsIHx8IHN0cmluZyA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAgIC8vIHRoZSByZWdleCB0ZXN0IHdpbGwgZG8gdGhpcyB0cmFuc3BhcmVudGx5IGJlaGluZCB0aGUgc2NlbmVzLCBjYXVzaW5nIGlzc3VlcyBpZlxuICAgIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICAgIHN0cmluZyA9IHN0cmluZy50b1N0cmluZygpO1xuXG4gICAgaWYoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbiAgfSxcblxuICBpc0VtcHR5OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZih0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSByZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMnKS5jcmVhdGUoKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy91dGlscy5qcycpLmF0dGFjaChleHBvcnRzKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzJykuYXR0YWNoKGV4cG9ydHMpIiwiIyMjKlxuICogUHJpbWFyeSBhcHBsaWNhdGlvbiBjb250cm9sbGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5BcHBNb2RlbCAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbkFwcFJvdXRlciAgID0gcmVxdWlyZSAnLi9yb3V0ZXJzL0FwcFJvdXRlci5jb2ZmZWUnXG5MYW5kaW5nVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUnXG5DcmVhdGVWaWV3ICA9IHJlcXVpcmUgJy4vdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlJ1xuU2hhcmVWaWV3ICAgPSByZXF1aXJlICcuL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUnXG5WaWV3ICAgICAgICA9IHJlcXVpcmUgJy4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcENvbnRyb2xsZXIgZXh0ZW5kcyBWaWV3XG5cblxuICAgY2xhc3NOYW1lOiAnd3JhcHBlcidcblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEBsYW5kaW5nVmlldyA9IG5ldyBMYW5kaW5nVmlld1xuICAgICAgQHNoYXJlVmlldyAgID0gbmV3IFNoYXJlVmlld1xuXG4gICAgICBAY3JlYXRlVmlldyAgPSBuZXcgQ3JlYXRlVmlld1xuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgQGFwcFJvdXRlciA9IG5ldyBBcHBSb3V0ZXJcbiAgICAgICAgIGFwcENvbnRyb2xsZXI6IEBcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSBBcHBDb250cm9sbGVyIHRvIHRoZSBET00gYW5kIGtpY2tzXG4gICAjIG9mZiBiYWNrYm9uZXMgaGlzdG9yeVxuXG4gICByZW5kZXI6IC0+XG4gICAgICBAJGJvZHkgPSAkICdib2R5J1xuICAgICAgQCRib2R5LmFwcGVuZCBAZWxcblxuICAgICAgQmFja2JvbmUuaGlzdG9yeS5zdGFydFxuICAgICAgICAgcHVzaFN0YXRlOiBmYWxzZVxuXG5cblxuICAgIyBEZXN0cm95cyBhbGwgY3VycmVudCBhbmQgcHJlLXJlbmRlcmVkIHZpZXdzIGFuZFxuICAgIyB1bmRlbGVnYXRlcyBldmVudCBsaXN0ZW5lcnNcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgQGxhbmRpbmdWaWV3LnJlbW92ZSgpXG4gICAgICBAc2hhcmVWaWV3LnJlbW92ZSgpXG4gICAgICBAY3JlYXRlVmlldy5yZW1vdmUoKVxuXG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICAjIEFkZHMgQXBwQ29udHJvbGxlci1yZWxhdGVkIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVnaW5zXG4gICAjIGxpc3RlbmluZyB0byB2aWV3IGNoYW5nZXNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAnY2hhbmdlOnZpZXcnLCBAb25WaWV3Q2hhbmdlXG5cblxuXG5cbiAgICMgUmVtb3ZlcyBBcHBDb250cm9sbGVyLXJlbGF0ZWQgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHNob3dpbmcgLyBoaWRpbmcgLyBkaXNwb3Npbmcgb2YgcHJpbWFyeSB2aWV3c1xuICAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gICBvblZpZXdDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIHByZXZpb3VzVmlldyA9IG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMudmlld1xuICAgICAgY3VycmVudFZpZXcgID0gbW9kZWwuY2hhbmdlZC52aWV3XG5cbiAgICAgIHByZXZpb3VzVmlldz8uaGlkZVxuICAgICAgICAgcmVtb3ZlOiB0cnVlXG5cblxuICAgICAgQCRlbC5hcHBlbmQgY3VycmVudFZpZXcucmVuZGVyKCkuZWxcblxuICAgICAgY3VycmVudFZpZXcuc2hvdygpXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwQ29udHJvbGxlciIsIiMjIypcbiAgQXBwbGljYXRpb24td2lkZSBnZW5lcmFsIGNvbmZpZ3VyYXRpb25zXG5cbiAgQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICBAZGF0ZSAgIDMuMTkuMTRcbiMjI1xuXG5cbkFwcENvbmZpZyA9XG5cblxuICAgIyBUaGUgcGF0aCB0byBhcHBsaWNhdGlvbiBhc3NldHNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQVNTRVRTOlxuICAgICAgcGF0aDogICAnL2Fzc2V0cydcbiAgICAgIGF1ZGlvOiAgJ2F1ZGlvJ1xuICAgICAgZGF0YTogICAnZGF0YSdcbiAgICAgIGltYWdlczogJ2ltYWdlcydcblxuXG4gICAjIFRoZSBCUE0gdGVtcG9cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQlBNOiAzMjBcblxuXG4gICAjIFRoZSBtYXggQlBNXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIEJQTV9NQVg6IDEwMDBcblxuXG4gICAjIFRoZSBtYXggdmFyaWVudCBvbiBlYWNoIHBhdHRlcm4gc3F1YXJlIChvZmYsIGxvdywgbWVkaXVtLCBoaWdoKVxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBWRUxPQ0lUWV9NQVg6IDNcblxuXG4gICAjIFZvbHVtZSBsZXZlbHMgZm9yIHBhdHRlcm4gcGxheWJhY2sgYXMgd2VsbCBhcyBmb3Igb3ZlcmFsbCB0cmFja3NcbiAgICMgQHR5cGUge09iamVjdH1cblxuICAgVk9MVU1FX0xFVkVMUzpcbiAgICAgIGxvdzogICAgLjJcbiAgICAgIG1lZGl1bTogLjVcbiAgICAgIGhpZ2g6ICAgIDFcblxuXG4gICAjIFJldHVybnMgYSBub3JtYWxpemVkIGFzc2V0IHBhdGggZm9yIGFwcGxpY2F0aW9uIGFzc2V0c1xuICAgIyBAcGFyYW0ge1N0cmluZ30gYXNzZXRUeXBlXG5cbiAgIHJldHVybkFzc2V0UGF0aDogKGFzc2V0VHlwZSkgLT5cbiAgICAgIEBBU1NFVFMucGF0aCArICcvJyArIEBBU1NFVFNbYXNzZXRUeXBlXVxuXG5cbiAgICMgUmV0dXJucyBhIG5vcm1hbGl6ZWQgYXNzZXQgcGF0aCBmb3IgdGhlIFRFU1QgZW52aXJvbm1lbnRcbiAgICMgQHBhcmFtIHtTdHJpbmd9IGFzc2V0VHlwZVxuXG4gICByZXR1cm5UZXN0QXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgICAgJy90ZXN0L2h0bWwvJyArIEBBU1NFVFMucGF0aCArICcvJyArIEBBU1NFVFNbYXNzZXRUeXBlXVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb25maWdcblxuIiwiIyMjKlxuICogQXBwbGljYXRpb24gcmVsYXRlZCBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5cbkFwcEV2ZW50ID1cblxuICAgQ0hBTkdFX0FDVElWRTogICAgICdjaGFuZ2U6YWN0aXZlJ1xuICAgQ0hBTkdFX0JQTTogICAgICAgICdjaGFuZ2U6YnBtJ1xuICAgQ0hBTkdFX0RSQUdHSU5HOiAgICdjaGFuZ2U6ZHJhZ2dpbmcnXG4gICBDSEFOR0VfRFJPUFBFRDogICAgJ2NoYW5nZTpkcm9wcGVkJ1xuICAgQ0hBTkdFX0ZPQ1VTOiAgICAgICdjaGFuZ2U6Zm9jdXMnXG4gICBDSEFOR0VfSU5TVFJVTUVOVDogJ2NoYW5nZTpjdXJyZW50SW5zdHJ1bWVudCdcbiAgIENIQU5HRV9LSVQ6ICAgICAgICAnY2hhbmdlOmtpdE1vZGVsJ1xuICAgQ0hBTkdFX01VVEU6ICAgICAgICdjaGFuZ2U6bXV0ZSdcbiAgIENIQU5HRV9QTEFZSU5HOiAgICAnY2hhbmdlOnBsYXlpbmcnXG4gICBDSEFOR0VfVFJJR0dFUjogICAgJ2NoYW5nZTp0cmlnZ2VyJ1xuICAgQ0hBTkdFX1ZFTE9DSVRZOiAgICdjaGFuZ2U6dmVsb2NpdHknXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwRXZlbnQiLCIjIyMqXG4gKiBHbG9iYWwgUHViU3ViIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblxuUHViU3ViID1cblxuICAgUk9VVEU6ICdvblJvdXRlQ2hhbmdlJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUHViU3ViIiwiXG52YXIgZGlnaXRzID0gcmVxdWlyZSgnZGlnaXRzJyk7XG52YXIgaGFuZGxlYmFycyA9IHJlcXVpcmUoJ2hhbmRsZWlmeScpXG5cbmhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3JlcGVhdCcsIGZ1bmN0aW9uKG4sIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgX2RhdGEgPSB7fTtcbiAgICBpZiAob3B0aW9ucy5fZGF0YSkge1xuICAgICAgX2RhdGEgPSBoYW5kbGViYXJzLmNyZWF0ZUZyYW1lKG9wdGlvbnMuX2RhdGEpO1xuICAgIH1cblxuICAgIHZhciBjb250ZW50ID0gJyc7XG4gICAgdmFyIGNvdW50ID0gbiAtIDE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gY291bnQ7IGkrKykge1xuICAgICAgX2RhdGEgPSB7XG4gICAgICAgIGluZGV4OiBkaWdpdHMucGFkKChpICsgMSksIHthdXRvOiBufSlcbiAgICAgIH07XG4gICAgICBjb250ZW50ICs9IG9wdGlvbnMuZm4odGhpcywge2RhdGE6IF9kYXRhfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgaGFuZGxlYmFycy5TYWZlU3RyaW5nKGNvbnRlbnQpO1xuICB9KTsiLCIjIyMqXG4gIFByaW1hcnkgYXBwbGljYXRpb24gbW9kZWwgd2hpY2ggY29vcmRpbmF0ZXMgc3RhdGVcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuXG5cbkFwcFJvdXRlciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZFxuXG5cbiAgIGRlZmF1bHRzOlxuICAgICAgJ3ZpZXcnOiAgICAgICAgbnVsbFxuICAgICAgJ3BsYXlpbmcnOiAgICAgbnVsbFxuICAgICAgJ211dGUnOiAgICAgICAgbnVsbFxuXG4gICAgICAna2l0TW9kZWwnOiAgICBudWxsXG5cbiAgICAgICMgU2V0dGluZ3NcbiAgICAgICdicG0nOiAgICAgICAgIEFwcENvbmZpZy5CUE1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFJvdXRlciIsIiMjIypcbiAqIENvbGxlY3Rpb24gb2Ygc291bmQga2l0c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0TW9kZWwgID0gcmVxdWlyZSAnLi9LaXRNb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgS2l0Q29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuXG4gICAjIFVybCB0byBkYXRhIGZvciBmZXRjaFxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICB1cmw6IFwiI3tBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJyl9L3NvdW5kLWRhdGEuanNvblwiXG5cblxuICAgIyBJbmRpdmlkdWFsIGRydW1raXQgYXVkaW8gc2V0c1xuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIG1vZGVsOiBLaXRNb2RlbFxuXG5cbiAgICMgVGhlIGN1cnJlbnQgdXNlci1zZWxlY3RlZCBraXRcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAga2l0SWQ6IDBcblxuXG5cbiAgIHBhcnNlOiAocmVzcG9uc2UpIC0+XG4gICAgICBhc3NldFBhdGggPSByZXNwb25zZS5jb25maWcuYXNzZXRQYXRoXG4gICAgICBraXRzID0gcmVzcG9uc2Uua2l0c1xuXG4gICAgICBraXRzID0gXy5tYXAga2l0cywgKGtpdCkgLT5cbiAgICAgICAgIGtpdC5wYXRoID0gYXNzZXRQYXRoICsgJy8nICsga2l0LmZvbGRlclxuICAgICAgICAgcmV0dXJuIGtpdFxuXG4gICAgICByZXR1cm4ga2l0c1xuXG5cblxuXG4gICAjIEN5Y2xlcyB0aGUgY3VycmVudCBkcnVtIGtpdCBiYWNrXG4gICAjIEByZXR1cm4ge0tpdE1vZGVsfVxuXG4gICBwcmV2aW91c0tpdDogLT5cbiAgICAgIGxlbiA9IEBsZW5ndGhcblxuICAgICAgaWYgQGtpdElkID4gMFxuICAgICAgICAgQGtpdElkLS1cblxuICAgICAgZWxzZVxuICAgICAgICAgQGtpdElkID0gbGVuIC0gMVxuXG4gICAgICBraXRNb2RlbCA9IEBhdCBAa2l0SWRcblxuXG5cblxuICAgIyBDeWNsZXMgdGhlIGN1cnJlbnQgZHJ1bSBraXQgZm9yd2FyZFxuICAgIyBAcmV0dXJuIHtLaXRNb2RlbH1cblxuICAgbmV4dEtpdDogLT5cbiAgICAgIGxlbiA9IEBsZW5ndGggLSAxXG5cbiAgICAgIGlmIEBraXRJZCA8IGxlblxuICAgICAgICAgQGtpdElkKytcblxuICAgICAgZWxzZVxuICAgICAgICAgQGtpdElkID0gMFxuXG4gICAgICBraXRNb2RlbCA9IEBhdCBAa2l0SWRcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2l0Q29sbGVjdGlvbiIsIiMjIypcbiAqIEtpdCBtb2RlbCBmb3IgaGFuZGxpbmcgc3RhdGUgcmVsYXRlZCB0byBraXQgc2VsZWN0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlJ1xuXG5cbmNsYXNzIEtpdE1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG4gICBkZWZhdWx0czpcbiAgICAgICdsYWJlbCc6ICAgIG51bGxcbiAgICAgICdwYXRoJzogICAgIG51bGxcbiAgICAgICdmb2xkZXInOiAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7SW5zdHJ1bWVudENvbGxlY3Rpb259XG4gICAgICAnaW5zdHJ1bWVudHMnOiAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICAgICAgJ2N1cnJlbnRJbnN0cnVtZW50JzogbnVsbFxuXG5cblxuICAgIyBGb3JtYXQgdGhlIHJlc3BvbnNlIHNvIHRoYXQgaW5zdHJ1bWVudHMgZ2V0cyBwcm9jZXNzZWRcbiAgICMgYnkgYmFja2JvbmUgdmlhIHRoZSBJbnN0cnVtZW50Q29sbGVjdGlvbi4gIEFkZGl0aW9uYWxseSxcbiAgICMgcGFzcyBpbiB0aGUgcGF0aCBzbyB0aGF0IGFic29sdXRlIFVSTCdzIGNhbiBiZSB1c2VkXG4gICAjIHRvIHJlZmVyZW5jZSBzb3VuZCBkYXRhXG4gICAjIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuXG4gICBwYXJzZTogKHJlc3BvbnNlKSAtPlxuICAgICAgXy5lYWNoIHJlc3BvbnNlLmluc3RydW1lbnRzLCAoaW5zdHJ1bWVudCkgLT5cbiAgICAgICAgIGluc3RydW1lbnQuaWQgPSBfLnVuaXF1ZUlkICdpbnN0cnVtZW50LSdcbiAgICAgICAgIGluc3RydW1lbnQuc3JjID0gcmVzcG9uc2UucGF0aCArICcvJyArIGluc3RydW1lbnQuc3JjXG5cbiAgICAgIHJlc3BvbnNlLmluc3RydW1lbnRzID0gbmV3IEluc3RydW1lbnRDb2xsZWN0aW9uIHJlc3BvbnNlLmluc3RydW1lbnRzXG5cbiAgICAgIHJlc3BvbnNlXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2l0TW9kZWwiLCIjIyMqXG4gKiBNb2RlbCBmb3IgdGhlIGVudGlyZSBQYWQgY29tcG9uZW50XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI0LjE0XG4jIyNcblxuY2xhc3MgTGl2ZVBhZE1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExpdmVQYWRNb2RlbFxuIiwiIyMjKlxuICogQ29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIFBhZFNxdWFyZU1vZGVsc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4uL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIFBhZFNxdWFyZUNvbGxlY3Rpb24gZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgIG1vZGVsOiBJbnN0cnVtZW50TW9kZWxcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZFNxdWFyZUNvbGxlY3Rpb24iLCIjIyMqXG4gKiBNb2RlbCBmb3IgaW5kaXZpZHVhbCBwYWQgc3F1YXJlcy5cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5jbGFzcyBQYWRTcXVhcmVNb2RlbCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnZHJhZ2dpbmcnOiAgZmFsc2VcbiAgICAgICdrZXljb2RlJzogICBudWxsXG4gICAgICAndHJpZ2dlcic6ICAgZmFsc2VcblxuICAgICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICAgICAgJ2N1cnJlbnRJbnN0cnVtZW50JzogIG51bGxcblxuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQHNldCAnaWQnLCBfLnVuaXF1ZUlkICdwYWQtc3F1YXJlLSdcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFkU3F1YXJlTW9kZWxcbiIsIiMjIypcbiAqIENvbGxlY3Rpb24gcmVwcmVzZW50aW5nIGVhY2ggc291bmQgZnJvbSBhIGtpdCBzZXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICcuL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5cblxuY2xhc3MgSW5zdHJ1bWVudENvbGxlY3Rpb24gZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cblxuICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG5cblxuICAgIyBFeHBvcnRzIHRoZSBwYXR0ZXJuIHNxdWFyZXMgY29sbGVjdGlvbiBmb3IgdXNlXG4gICAjIHdpdGggdHJhbnNmZXJyaW5nIHByb3BzIGFjcm9zcyBkaWZmZXJlbnQgZHJ1bSBraXRzXG5cbiAgIGV4cG9ydFBhdHRlcm5TcXVhcmVzOiAtPlxuICAgICAgcmV0dXJuIEBtYXAgKGluc3RydW1lbnQpID0+XG4gICAgICAgICBpbnN0cnVtZW50LmdldCgncGF0dGVyblNxdWFyZXMnKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50Q29sbGVjdGlvbiIsIiMjIypcbiAqIFNvdW5kIG1vZGVsIGZvciBlYWNoIGluZGl2aWR1YWwga2l0IHNvdW5kIHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuXG5cbmNsYXNzIEluc3RydW1lbnRNb2RlbCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG5cbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG4gICAgICAnYWN0aXZlJzogICBudWxsXG5cbiAgICAgICMgQHR5cGUge0Jvb2xlYW59XG4gICAgICAnZm9jdXMnOiAgICBudWxsXG5cbiAgICAgICMgQHR5cGUge1N0cmluZ31cbiAgICAgICdpY29uJzogICAgIG51bGxcblxuICAgICAgIyBAdHlwZSB7U3RyaW5nfVxuICAgICAgJ2xhYmVsJzogICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtCb29sZWFufVxuICAgICAgJ211dGUnOiAgICAgbnVsbFxuXG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgICAnc3JjJzogICAgICBudWxsXG5cbiAgICAgICMgQHR5cGUge051bWJlcn1cbiAgICAgICd2b2x1bWUnOiAgIG51bGxcblxuXG5cbiAgICAgICMgQHR5cGUge1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9ufVxuICAgICAgJ3BhdHRlcm5TcXVhcmVzJzogICAgbnVsbFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50TW9kZWwiLCIjIyMqXG4gIEEgY29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlc1xuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICcuLi9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24iLCIjIyMqXG4gIE1vZGVsIGZvciBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlcy4gIFBhcnQgb2YgbGFyZ2VyIFBhdHRlcm4gVHJhY2sgY29sbGVjdGlvblxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmVNb2RlbCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cblxuICAgZGVmYXVsdHM6XG4gICAgICAnYWN0aXZlJzogICAgICAgICAgIGZhbHNlXG4gICAgICAnaW5zdHJ1bWVudCc6ICAgICAgIG51bGxcbiAgICAgICdwcmV2aW91c1ZlbG9jaXR5JzogMFxuICAgICAgJ3RyaWdnZXInOiAgICAgICAgICBudWxsXG4gICAgICAndmVsb2NpdHknOiAgICAgICAgIDBcblxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAb24gQXBwRXZlbnQuQ0hBTkdFX1ZFTE9DSVRZLCBAb25WZWxvY2l0eUNoYW5nZVxuXG5cblxuICAgY3ljbGU6IC0+XG4gICAgICB2ZWxvY2l0eSA9IEBnZXQgJ3ZlbG9jaXR5J1xuXG4gICAgICBpZiB2ZWxvY2l0eSA8IEFwcENvbmZpZy5WRUxPQ0lUWV9NQVhcbiAgICAgICAgIHZlbG9jaXR5KytcblxuICAgICAgZWxzZVxuICAgICAgICAgdmVsb2NpdHkgPSAwXG5cbiAgICAgIEBzZXQgJ3ZlbG9jaXR5JywgdmVsb2NpdHlcblxuXG5cbiAgIGVuYWJsZTogLT5cbiAgICAgIEBzZXQgJ3ZlbG9jaXR5JywgMVxuXG5cblxuXG4gICBkaXNhYmxlOiAtPlxuICAgICAgQHNldCAndmVsb2NpdHknLCAwXG5cblxuXG4gICBvblZlbG9jaXR5Q2hhbmdlOiAobW9kZWwpIC0+XG4gICAgICBAc2V0ICdwcmV2aW91c1ZlbG9jaXR5JywgbW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy52ZWxvY2l0eVxuXG4gICAgICB2ZWxvY2l0eSA9IG1vZGVsLmNoYW5nZWQudmVsb2NpdHlcblxuICAgICAgaWYgdmVsb2NpdHkgPiAwXG4gICAgICAgICBAc2V0ICdhY3RpdmUnLCB0cnVlXG5cbiAgICAgIGVsc2UgaWYgdmVsb2NpdHkgaXMgMFxuICAgICAgICAgQHNldCAnYWN0aXZlJywgZmFsc2VcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlTW9kZWwiLCIjIyMqXG4gKiBNUEMgQXBwbGljYXRpb24gcm91dGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgPSByZXF1aXJlICcuLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblB1YlN1YiAgICAgID0gcmVxdWlyZSAnLi4vdXRpbHMvUHViU3ViJ1xuUHViRXZlbnQgICAgPSByZXF1aXJlICcuLi9ldmVudHMvUHViRXZlbnQuY29mZmVlJ1xuXG4jIFRPRE86IFRoZSBiZWxvdyBpdGVtcyBhcmUgb25seSBpbmNsdWRlZCBmb3IgdGVzdGluZyBjb21wb25lbnRcbiMgbW9kdWxhcml0eS4gIFRoZXksIGFuZCB0aGVpciByb3V0ZXMsIHNob3VsZCBiZSByZW1vdmVkIGluIHByb2R1Y3Rpb25cblxuVGVzdHNWaWV3ICAgICA9IHJlcXVpcmUgJy4uL3ZpZXdzL3Rlc3RzL1Rlc3RzVmlldy5jb2ZmZWUnXG5cblZpZXcgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cbktpdFNlbGVjdG9yICA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcbktpdE1vZGVsICAgICAgPSByZXF1aXJlICcuLi9tb2RlbHMva2l0cy9LaXRNb2RlbC5jb2ZmZWUnXG5cbkJQTUluZGljYXRvciAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xuSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUnXG5cbkluc3RydW1lbnRNb2RlbCA9ICcuLi9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9ICcuLi9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblxuUGF0dGVyblNxdWFyZSA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuVHJhY2sgID0gcmVxdWlyZSAnLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay5jb2ZmZWUnXG5TZXF1ZW5jZXIgICAgICAgPSByZXF1aXJlICcuLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSdcblxuTGl2ZVBhZE1vZGVsID0gcmVxdWlyZSAnLi4vbW9kZWxzL3BhZC9MaXZlUGFkTW9kZWwuY29mZmVlJ1xuUGFkU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYWRTcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uL21vZGVscy9wYWQvUGFkU3F1YXJlTW9kZWwuY29mZmVlJ1xuTGl2ZVBhZCA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9MaXZlUGFkLmNvZmZlZSdcblBhZFNxdWFyZSA9IHJlcXVpcmUgJy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcFJvdXRlciBleHRlbmRzIEJhY2tib25lLlJvdXRlclxuXG5cbiAgIHJvdXRlczpcbiAgICAgICcnOiAgICAgICAgICAgICAnbGFuZGluZ1JvdXRlJ1xuICAgICAgJ2NyZWF0ZSc6ICAgICAgICdjcmVhdGVSb3V0ZSdcbiAgICAgICdzaGFyZSc6ICAgICAgICAnc2hhcmVSb3V0ZSdcblxuICAgICAgIyBDb21wb25lbnQgdGVzdCByb3V0ZXNcbiAgICAgICd0ZXN0cyc6ICAgICAgICAgICAgICAgICd0ZXN0cydcbiAgICAgICdraXQtc2VsZWN0aW9uJzogICAgICAgICdraXRTZWxlY3Rpb25Sb3V0ZSdcbiAgICAgICdicG0taW5kaWNhdG9yJzogICAgICAgICdicG1JbmRpY2F0b3JSb3V0ZSdcbiAgICAgICdpbnN0cnVtZW50LXNlbGVjdG9yJzogICdpbnN0cnVtZW50U2VsZWN0b3JSb3V0ZSdcbiAgICAgICdwYXR0ZXJuLXNxdWFyZSc6ICAgICAgICdwYXR0ZXJuU3F1YXJlUm91dGUnXG4gICAgICAncGF0dGVybi10cmFjayc6ICAgICAgICAncGF0dGVyblRyYWNrUm91dGUnXG4gICAgICAnc2VxdWVuY2VyJzogICAgICAgICAgICAnc2VxdWVuY2VyUm91dGUnXG4gICAgICAnZnVsbC1zZXF1ZW5jZXInOiAgICAgICAnZnVsbFNlcXVlbmNlclJvdXRlJ1xuICAgICAgJ3BhZC1zcXVhcmUnOiAgICAgICAgICAgJ3BhZFNxdWFyZVJvdXRlJ1xuICAgICAgJ2xpdmUtcGFkJzogICAgICAgICAgICAgJ2xpdmVQYWRSb3V0ZSdcblxuXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAge0BhcHBDb250cm9sbGVyLCBAYXBwTW9kZWx9ID0gb3B0aW9uc1xuXG4gICAgICBQdWJTdWIub24gUHViRXZlbnQuUk9VVEUsIEBvblJvdXRlQ2hhbmdlXG5cblxuXG4gICBvblJvdXRlQ2hhbmdlOiAocGFyYW1zKSA9PlxuICAgICAge3JvdXRlfSA9IHBhcmFtc1xuXG4gICAgICBAbmF2aWdhdGUgcm91dGUsIHsgdHJpZ2dlcjogdHJ1ZSB9XG5cblxuXG4gICBsYW5kaW5nUm91dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgQGFwcENvbnRyb2xsZXIubGFuZGluZ1ZpZXdcblxuXG5cbiAgIGNyZWF0ZVJvdXRlOiAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLmNyZWF0ZVZpZXdcblxuXG5cbiAgIHNoYXJlUm91dGU6IC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgQGFwcENvbnRyb2xsZXIuc2hhcmVWaWV3XG5cblxuXG5cblxuXG4gICAjIENPTVBPTkVOVCBURVNUIFJPVVRFU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgIHRlc3RzOiAtPlxuICAgICAgdmlldyA9IG5ldyBUZXN0c1ZpZXcoKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBraXRTZWxlY3Rpb25Sb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBLaXRTZWxlY3RvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24sXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cbiAgIGJwbUluZGljYXRvclJvdXRlOiAtPlxuICAgICAgdmlldyA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgdmlldy5yZW5kZXIoKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBpbnN0cnVtZW50U2VsZWN0b3JSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG4gICBwYXR0ZXJuU3F1YXJlUm91dGU6IC0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIHZpZXcgPSBuZXcgUGF0dGVyblNxdWFyZVxuICAgICAgICAgcGF0dGVyblNxdWFyZU1vZGVsOiBuZXcgUGF0dGVyblNxdWFyZU1vZGVsKClcblxuICAgICAgQGFwcE1vZGVsLnNldCAndmlldycsIHZpZXdcblxuXG5cbiAgIHBhdHRlcm5UcmFja1JvdXRlOiAtPlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICB2aWV3ID0gbmV3IFBhdHRlcm5UcmFja1xuICAgICAgICAgbW9kZWw6IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuICAgc2VxdWVuY2VyUm91dGU6IC0+XG5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGNvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuICAgZnVsbFNlcXVlbmNlclJvdXRlOiAtPlxuXG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cblxuICAgICAga2l0U2VsZWN0aW9uID0gPT5cbiAgICAgICAgIHZpZXcgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgICAgIHZpZXdcblxuXG4gICAgICBicG0gPSA9PlxuICAgICAgICAgdmlldyA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgICAgdmlld1xuXG5cbiAgICAgIGluc3RydW1lbnRTZWxlY3Rpb24gPSA9PlxuICAgICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICAgICB2aWV3ID0gbmV3IEluc3RydW1lbnRTZWxlY3RvclBhbmVsXG4gICAgICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuICAgICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICAgICB2aWV3XG5cblxuICAgICAgc2VxdWVuY2VyID0gPT5cbiAgICAgICAgIHZpZXcgPSBuZXcgU2VxdWVuY2VyXG4gICAgICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgICAgdmlld1xuXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldyA9IG5ldyBWaWV3KClcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQga2l0U2VsZWN0aW9uKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgYnBtKCkucmVuZGVyKCkuZWxcbiAgICAgIGZ1bGxTZXF1ZW5jZXJWaWV3LiRlbC5hcHBlbmQgaW5zdHJ1bWVudFNlbGVjdGlvbigpLnJlbmRlcigpLmVsXG4gICAgICBmdWxsU2VxdWVuY2VyVmlldy4kZWwuYXBwZW5kIHNlcXVlbmNlcigpLnJlbmRlcigpLmVsXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBmdWxsU2VxdWVuY2VyVmlld1xuXG5cblxuXG4gICBwYWRTcXVhcmVSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBQYWRTcXVhcmVcbiAgICAgICAgIG1vZGVsOiBuZXcgUGFkU3F1YXJlTW9kZWwoKVxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICd2aWV3Jywgdmlld1xuXG5cblxuXG5cbiAgIGxpdmVQYWRSb3V0ZTogLT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVybkFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgdmlldyA9IG5ldyBMaXZlUGFkXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCB2aWV3XG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFJvdXRlciIsIiMjIypcbiAqIFZpZXcgc3VwZXJjbGFzcyBjb250YWluaW5nIHNoYXJlZCBmdW5jdGlvbmFsaXR5XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAyLjE3LjE0XG4jIyNcblxuXG5WaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmRcblxuXG5cbiAgICMgSW5pdGlhbGl6ZXMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBfLmV4dGVuZCBALCBfLmRlZmF1bHRzKCBvcHRpb25zID0gb3B0aW9ucyB8fCBAZGVmYXVsdHMsIEBkZWZhdWx0cyB8fCB7fSApXG5cblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IHdpdGggc3VwcGxpZWQgdGVtcGxhdGUgZGF0YSwgb3IgY2hlY2tzIGlmIHRlbXBsYXRlIGlzIG9uXG4gICAjIG9iamVjdCBib2R5XG4gICAjIEBwYXJhbSAge0Z1bmN0aW9ufE1vZGVsfSB0ZW1wbGF0ZURhdGFcbiAgICMgQHJldHVybiB7Vmlld31cblxuICAgcmVuZGVyOiAodGVtcGxhdGVEYXRhKSAtPlxuICAgICAgdGVtcGxhdGVEYXRhID0gdGVtcGxhdGVEYXRhIHx8IHt9XG5cbiAgICAgIGlmIEB0ZW1wbGF0ZVxuXG4gICAgICAgICAjIElmIG1vZGVsIGlzIGFuIGluc3RhbmNlIG9mIGEgYmFja2JvbmUgbW9kZWwsIHRoZW4gSlNPTmlmeSBpdFxuICAgICAgICAgaWYgQG1vZGVsIGluc3RhbmNlb2YgQmFja2JvbmUuTW9kZWxcbiAgICAgICAgICAgIHRlbXBsYXRlRGF0YSA9IEBtb2RlbC50b0pTT04oKVxuXG4gICAgICAgICBAJGVsLmh0bWwgQHRlbXBsYXRlICh0ZW1wbGF0ZURhdGEpXG5cbiAgICAgIEBkZWxlZ2F0ZUV2ZW50cygpXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG4gICAgICBAXG5cblxuXG5cbiAgICMgUmVtb3ZlcyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW1vdmU6IChvcHRpb25zKSAtPlxuICAgICAgQHJlbW92ZUV2ZW50TGlzdGVuZXJzKClcbiAgICAgIEAkZWwucmVtb3ZlKClcbiAgICAgIEB1bmRlbGVnYXRlRXZlbnRzKClcblxuXG5cblxuXG4gICAjIFNob3dzIHRoZSB2aWV3XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHNob3c6IChvcHRpb25zKSAtPlxuICAgICAgVHdlZW5NYXguc2V0IEAkZWwsIHsgYXV0b0FscGhhOiAxIH1cblxuXG5cblxuICAgIyBIaWRlcyB0aGUgdmlld1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBoaWRlOiAob3B0aW9ucykgLT5cbiAgICAgIFR3ZWVuTWF4LnNldCBAJGVsLFxuICAgICAgICAgYXV0b0FscGhhOiAwXG4gICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgaWYgb3B0aW9ucz8ucmVtb3ZlXG4gICAgICAgICAgICAgICBAcmVtb3ZlKClcblxuXG5cblxuICAgIyBOb29wIHdoaWNoIGlzIGNhbGxlZCBvbiByZW5kZXJcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG5cblxuXG4gICAjIFJlbW92ZXMgYWxsIHJlZ2lzdGVyZWQgbGlzdGVuZXJzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3IiwiLyoqXG4gKiBAbW9kdWxlICAgICBQdWJTdWJcbiAqIEBkZXNjICAgICAgIEdsb2JhbCBQdWJTdWIgb2JqZWN0IGZvciBkaXNwYXRjaCBhbmQgZGVsZWdhdGlvblxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG52YXIgUHViU3ViID0ge31cblxuXy5leHRlbmQoIFB1YlN1YiwgQmFja2JvbmUuRXZlbnRzIClcblxubW9kdWxlLmV4cG9ydHMgPSBQdWJTdWIiLCIjIyMqXG4gKiBDcmVhdGUgdmlldyB3aGljaCB0aGUgdXNlciBjYW4gYnVpbGQgYmVhdHMgd2l0aGluXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuXG5WaWV3ICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbktpdFNlbGVjdG9yICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3IuY29mZmVlJ1xuSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUnXG5TZXF1ZW5jZXIgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuQlBNSW5kaWNhdG9yICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xudGVtcGxhdGUgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9jcmVhdGUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIENyZWF0ZVZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRraXRTZWxlY3RvckNvbnRhaW5lciAgID0gQCRlbC5maW5kICcuY29udGFpbmVyLWtpdC1zZWxlY3RvcidcbiAgICAgIEAka2l0U2VsZWN0b3IgICAgICAgICAgICA9IEAkZWwuZmluZCAnLmtpdC1zZWxlY3RvcidcbiAgICAgIEAkdmlzdWFsaXphdGlvbkNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci12aXN1YWxpemF0aW9uJ1xuICAgICAgQCRzZXF1ZW5jZXJDb250YWluZXIgICAgID0gQCRlbC5maW5kICcuY29udGFpbmVyLXNlcXVlbmNlcidcbiAgICAgIEAkaW5zdHJ1bWVudFNlbGVjdG9yICAgICA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5pbnN0cnVtZW50LXNlbGVjdG9yJ1xuICAgICAgQCRzZXF1ZW5jZXIgICAgICAgICAgICAgID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLnNlcXVlbmNlcidcbiAgICAgIEAkYnBtICAgICAgICAgICAgICAgICAgICA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5icG0nXG4gICAgICBAJHNoYXJlQnRuICAgICAgICAgICAgICAgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcuYnRuLXNoYXJlJ1xuXG4gICAgICBAcmVuZGVyS2l0U2VsZWN0b3IoKVxuICAgICAgQHJlbmRlckluc3RydW1lbnRTZWxlY3RvcigpXG4gICAgICBAcmVuZGVyU2VxdWVuY2VyKClcbiAgICAgIEByZW5kZXJCUE0oKVxuXG4gICAgICBAXG5cblxuXG4gICByZW5kZXJLaXRTZWxlY3RvcjogLT5cbiAgICAgIEBraXRTZWxlY3RvciA9IG5ldyBLaXRTZWxlY3RvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgQCRraXRTZWxlY3Rvci5odG1sIEBraXRTZWxlY3Rvci5yZW5kZXIoKS5lbFxuXG5cblxuICAgcmVuZGVySW5zdHJ1bWVudFNlbGVjdG9yOiAtPlxuICAgICAgQGluc3RydW1lbnRTZWxlY3RvciA9IG5ldyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgQCRpbnN0cnVtZW50U2VsZWN0b3IuaHRtbCBAaW5zdHJ1bWVudFNlbGVjdG9yLnJlbmRlcigpLmVsXG5cblxuXG4gICByZW5kZXJTZXF1ZW5jZXI6IC0+XG4gICAgICBAc2VxdWVuY2VyID0gbmV3IFNlcXVlbmNlclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgIEAkc2VxdWVuY2VyLmh0bWwgQHNlcXVlbmNlci5yZW5kZXIoKS5lbFxuXG5cblxuICAgcmVuZGVyQlBNOiAtPlxuICAgICAgQGJwbSA9IG5ldyBCUE1JbmRpY2F0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQCRicG0uaHRtbCBAYnBtLnJlbmRlcigpLmVsXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDcmVhdGVWaWV3IiwiIyMjKlxuICogQmVhdHMgcGVyIG1pbnV0ZSB2aWV3IGZvciBoYW5kbGluZyB0ZW1wb1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2JwbS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgQlBNSW5kaWNhdG9yIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgUmVmIHRvIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFRoZSBzZXRJbnRlcnZhbCB1cGRhdGUgaW50ZXJ2YWwgZm9yIGluY3JlYXNpbmcgYW5kXG4gICAjIGRlY3JlYXNpbmcgQlBNIG9uIHByZXNzIC8gdG91Y2hcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgaW50ZXJ2YWxVcGRhdGVUaW1lOiA3MFxuXG5cbiAgICMgVGhlIHNldEludGVydmFsIHVwZGF0ZXJcbiAgICMgQHR5cGUge1NldEludGVydmFsfVxuXG4gICB1cGRhdGVJbnRlcnZhbDogbnVsbFxuXG5cbiAgICMgVGhlIGFtb3VudCB0byBpbmNyZWFzZSB0aGUgQlBNIGJ5IG9uIGVhY2ggdGlja1xuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBicG1JbmNyZWFzZUFtb3VudDogMTBcblxuXG4gICAjIFRoZSBjdXJyZW50IGJwbSBiZWZvcmUgaXRzIHNldCBvbiB0aGUgbW9kZWwuICBVc2VkIHRvIGJ1ZmZlclxuICAgIyB1cGRhdGVzIGFuZCB0byBwcm92aWRlIGZvciBzbW9vdGggYW5pbWF0aW9uXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGN1cnJCUE06IG51bGxcblxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoc3RhcnQgLmJ0bi1pbmNyZWFzZSc6ICdvbkluY3JlYXNlQnRuRG93bidcbiAgICAgICd0b3VjaHN0YXJ0IC5idG4tZGVjcmVhc2UnOiAnb25EZWNyZWFzZUJ0bkRvd24nXG4gICAgICAndG91Y2hlbmQgICAuYnRuLWluY3JlYXNlJzogJ29uQnRuVXAnXG4gICAgICAndG91Y2hlbmQgICAuYnRuLWRlY3JlYXNlJzogJ29uQnRuVXAnXG5cblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGFuZCB1cGRhdGUgdGhlIGtpdCBpZiBub3QgYWxyZWFkeVxuICAgIyBzZXQgdmlhIGEgcHJldmlvdXMgc2Vzc2lvblxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGJwbUxhYmVsICAgPSBAJGVsLmZpbmQgJy5sYWJlbC1icG0nXG4gICAgICBAaW5jcmVhc2VCdG4gPSBAJGVsLmZpbmQgJy5idG4taW5jcmVhc2UnXG4gICAgICBAZGVjcmVhc2VCdG4gPSBAJGVsLmZpbmQgJy5idG4tZGVjcmVhc2UnXG5cbiAgICAgIEBjdXJyQlBNID0gQGFwcE1vZGVsLmdldCgnYnBtJylcbiAgICAgIEAkYnBtTGFiZWwudGV4dCBAY3VyckJQTVxuICAgICAgQG9uQnRuVXAoKVxuXG4gICAgICBAXG5cblxuXG4gICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRpbmcgY2hhbmdlcyByZWxhdGVkIHRvXG4gICAjIHN3aXRjaGluZyBCUE1cblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfQlBNLCBAb25CUE1DaGFuZ2VcblxuXG5cblxuICAgIyBTZXRzIGFuIGludGVydmFsIHRvIGluY3JlYXNlIHRoZSBCUE0gbW9uaXRvci4gIENsZWFyc1xuICAgIyB3aGVuIHRoZSB1c2VyIHJlbGVhc2VzIHRoZSBtb3VzZVxuXG4gICBpbmNyZWFzZUJQTTogLT5cbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IHNldEludGVydmFsID0+XG4gICAgICAgICBicG0gPSBAY3VyckJQTVxuXG4gICAgICAgICBpZiBicG0gPCBBcHBDb25maWcuQlBNX01BWFxuICAgICAgICAgICAgYnBtICs9IEBicG1JbmNyZWFzZUFtb3VudFxuXG4gICAgICAgICBlbHNlXG4gICAgICAgICAgICBicG0gPSBBcHBDb25maWcuQlBNX01BWFxuXG4gICAgICAgICBAY3VyckJQTSA9IGJwbVxuICAgICAgICAgQCRicG1MYWJlbC50ZXh0IEBjdXJyQlBNXG4gICAgICAgICAjQGFwcE1vZGVsLnNldCAnYnBtJywgNjAwMDAgLyBAY3VyckJQTVxuXG4gICAgICAsIEBpbnRlcnZhbFVwZGF0ZVRpbWVcblxuXG5cblxuICAgIyBTZXRzIGFuIGludGVydmFsIHRvIGRlY3JlYXNlIHRoZSBCUE0gbW9uaXRvci4gIENsZWFyc1xuICAgIyB3aGVuIHRoZSB1c2VyIHJlbGVhc2VzIHRoZSBtb3VzZVxuXG4gICBkZWNyZWFzZUJQTTogLT5cbiAgICAgIEB1cGRhdGVJbnRlcnZhbCA9IHNldEludGVydmFsID0+XG4gICAgICAgICBicG0gPSBAY3VyckJQTVxuXG4gICAgICAgICBpZiBicG0gPiAwXG4gICAgICAgICAgICBicG0gLT0gQGJwbUluY3JlYXNlQW1vdW50XG5cbiAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJwbSA9IDBcblxuICAgICAgICAgQGN1cnJCUE0gPSBicG1cbiAgICAgICAgIEAkYnBtTGFiZWwudGV4dCBAY3VyckJQTVxuICAgICAgICAgI0BhcHBNb2RlbC5zZXQgJ2JwbScsIDYwMDAwIC8gQGN1cnJCUE1cblxuICAgICAgLCBAaW50ZXJ2YWxVcGRhdGVUaW1lXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG4gICAjIEBwYXJhbSB7RXZlbnR9XG5cbiAgIG9uSW5jcmVhc2VCdG5Eb3duOiAoZXZlbnQpID0+XG4gICAgICBAaW5jcmVhc2VCUE0oKVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGxlZnQgYnV0dG9uIGNsaWNrcy4gIFVwZGF0ZXMgdGhlIGNvbGxlY3Rpb24gYW5kXG4gICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcbiAgICMgQHBhcmFtIHtFdmVudH1cblxuICAgb25EZWNyZWFzZUJ0bkRvd246IChldmVudCkgLT5cbiAgICAgIEBkZWNyZWFzZUJQTSgpXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtb3VzZSAvIHRvdWNodXAgZXZlbnRzLiAgQ2xlYXJzIHRoZSBpbnRlcnZhbFxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkJ0blVwOiAoZXZlbnQpIC0+XG4gICAgICBjbGVhckludGVydmFsIEB1cGRhdGVJbnRlcnZhbFxuICAgICAgQHVwZGF0ZUludGVydmFsID0gbnVsbFxuXG4gICAgICBAYXBwTW9kZWwuc2V0ICdicG0nLCA2MDAwMCAvIEBjdXJyQlBNXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBVcGRhdGVzIHRoZSBsYWJlbCBvbiB0aGVcbiAgICMga2l0IHNlbGVjdG9yXG5cbiAgIG9uQlBNQ2hhbmdlOiAobW9kZWwpIC0+XG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBCUE1JbmRpY2F0b3IiLCIjIyMqXG4gKiBLaXQgc2VsZWN0b3IgZm9yIHN3aXRjaGluZyBiZXR3ZWVuIGRydW0ta2l0IHNvdW5kc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ID0gcmVxdWlyZSAnLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9raXQtc2VsZWN0aW9uLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBLaXRTZWxlY3RvciBleHRlbmRzIFZpZXdcblxuXG4gICAjIFJlZiB0byB0aGUgbWFpbiBBcHBNb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIEtpdENvbGxlY3Rpb24gZm9yIHVwZGF0aW5nIHNvdW5kc1xuICAgIyBAdHlwZSB7S2l0Q29sbGVjdGlvbn1cblxuICAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgVGhlIGN1cnJlbnQga2l0XG4gICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICAga2l0TW9kZWw6IG51bGxcblxuXG4gICAjIFZpZXcgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCAuYnRuLWxlZnQnOiAgICdvbkxlZnRCdG5DbGljaydcbiAgICAgICd0b3VjaGVuZCAuYnRuLXJpZ2h0JzogICdvblJpZ2h0QnRuQ2xpY2snXG5cblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGFuZCB1cGRhdGUgdGhlIGtpdCBpZiBub3QgYWxyZWFkeVxuICAgIyBzZXQgdmlhIGEgcHJldmlvdXMgc2Vzc2lvblxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGtpdExhYmVsID0gQCRlbC5maW5kICcubGFiZWwta2l0J1xuXG4gICAgICBpZiBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpIGlzIG51bGxcbiAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQCRraXRMYWJlbC50ZXh0IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJykuZ2V0ICdsYWJlbCdcblxuICAgICAgQFxuXG5cblxuXG4gICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRpbmcgY2hhbmdlcyByZWxhdGVkIHRvXG4gICAjIHN3aXRjaGluZyBkcnVtIGtpdHNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfS0lULCBAb25DaGFuZ2VLaXRcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG5cbiAgIG9uTGVmdEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLnByZXZpb3VzS2l0KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG5cbiAgIG9uUmlnaHRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5uZXh0S2l0KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGxhYmVsIG9uIHRoZVxuICAgIyBraXQgc2VsZWN0b3JcblxuICAgb25DaGFuZ2VLaXQ6IChtb2RlbCkgLT5cbiAgICAgIEBraXRNb2RlbCA9IG1vZGVsLmNoYW5nZWQua2l0TW9kZWxcbiAgICAgIEAka2l0TGFiZWwudGV4dCBAa2l0TW9kZWwuZ2V0ICdsYWJlbCdcblxuXG5cblxuXG4gICAjIFBSSVZBVEUgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2l0U2VsZWN0b3IiLCIjIyMqXG4gKiBTb3VuZCB0eXBlIHNlbGVjdG9yIGZvciBjaG9vc2luZyB3aGljaCBzb3VuZCBzaG91bGRcbiAqIHBsYXkgb24gZWFjaCB0cmFja1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblxuQXBwRXZlbnQgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2luc3RydW1lbnQtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEluc3RydW1lbnQgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBUaGUgdmlldyBjbGFzc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdpbnN0cnVtZW50J1xuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgUmVmIHRvIHRoZSBJbnN0cnVtZW50TW9kZWxcbiAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cblxuICAgbW9kZWw6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgcGFyZW50IGtpdFxuICAgIyBAdHlwZSB7S2l0TW9kZWx9XG5cbiAgIGtpdE1vZGVsOiBudWxsXG5cblxuXG5cbiAgIGV2ZW50czpcbiAgICAgICd0b3VjaGVuZCc6ICdvbkNsaWNrJ1xuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGNsaWNrIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGN1cnJlbnQgaW5zdHJ1bWVudCBtb2RlbCwgd2hpY2hcbiAgICMgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgbGlzdGVucyB0bywgYW5kIGFkZHMgYSBzZWxlY3RlZCBzdGF0ZVxuICAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gICBvbkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBAa2l0TW9kZWwuc2V0ICdjdXJyZW50SW5zdHJ1bWVudCcsIEBtb2RlbFxuICAgICAgQCRlbC5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50IiwiIyMjKlxuICogUGFuZWwgd2hpY2ggaG91c2VzIGVhY2ggaW5kaXZpZHVhbCBzZWxlY3RhYmxlIHNvdW5kXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwRXZlbnQgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5JbnN0cnVtZW50ICA9IHJlcXVpcmUgJy4vSW5zdHJ1bWVudC5jb2ZmZWUnXG50ZW1wbGF0ZSAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2luc3RydW1lbnQtcGFuZWwtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIEluc3RydW1lbnRTZWxlY3RvclBhbmVsIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVmlldyB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgUmVmIHRvIHRoZSBhcHBsaWNhdGlvbiBtb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBSZWYgdG8ga2l0IGNvbGxlY3Rpb25cbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRDb2xsZWN0aW9uOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBraXRcbiAgICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gICBraXRNb2RlbDogbnVsbFxuXG5cbiAgICMgUmVmIHRvIGluc3RydW1lbnQgdmlld3NcbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBpbnN0cnVtZW50Vmlld3M6IG51bGxcblxuXG5cblxuICAgIyBJbml0aWFsaXplcyB0aGUgaW5zdHJ1bWVudCBzZWxlY3RvciBhbmQgc2V0cyBhIGxvY2FsIHJlZlxuICAgIyB0byB0aGUgY3VycmVudCBraXQgbW9kZWwgZm9yIGVhc3kgYWNjZXNzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAa2l0TW9kZWwgPSBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpXG5cblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBhcyB3ZWxsIGFzIHRoZSBhc3NvY2lhdGVkIGtpdCBpbnN0cnVtZW50c1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1pbnN0cnVtZW50cydcblxuICAgICAgQHJlbmRlckluc3RydW1lbnRzKClcblxuICAgICAgQFxuXG5cblxuXG4gICAjIFJlbmRlcnMgZWFjaCBpbmRpdmlkdWFsIGtpdCBtb2RlbCBpbnRvIGFuIEluc3RydW1lbnRcblxuICAgcmVuZGVySW5zdHJ1bWVudHM6IC0+XG4gICAgICBAaW5zdHJ1bWVudFZpZXdzID0gW11cblxuICAgICAgQGtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKS5lYWNoIChtb2RlbCkgPT5cbiAgICAgICAgIGluc3RydW1lbnQgPSBuZXcgSW5zdHJ1bWVudFxuICAgICAgICAgICAga2l0TW9kZWw6IEBraXRNb2RlbFxuICAgICAgICAgICAgbW9kZWw6IG1vZGVsXG5cbiAgICAgICAgIEAkY29udGFpbmVyLmFwcGVuZCBpbnN0cnVtZW50LnJlbmRlcigpLmVsXG4gICAgICAgICBAaW5zdHJ1bWVudFZpZXdzLnB1c2ggaW5zdHJ1bWVudFxuXG5cblxuXG4gICAjIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHJlbGF0ZWQgdG8ga2l0IGNoYW5nZXNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfS0lULCBAb25LaXRDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAa2l0TW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9JTlNUUlVNRU5ULCBAb25JbnN0cnVtZW50Q2hhbmdlXG5cblxuXG4gICAjIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cblxuXG5cbiAgICMgRVZFTlQgTElTVEVORVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2UgZXZlbnRzLiAgQ2xlYW5zIHVwIHRoZSB2aWV3IGFuZCByZS1yZW5kZXJzXG4gICAjIHRoZSBpbnN0cnVtZW50cyB0byB0aGUgRE9NXG4gICAjIEBwYXJhbSB7S2l0TW9kZWx9IG1vZGVsXG5cbiAgIG9uS2l0Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuXG4gICAgICBAa2l0TW9kZWwgPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsXG5cbiAgICAgIF8uZWFjaCBAaW5zdHJ1bWVudFZpZXdzLCAoaW5zdHJ1bWVudCkgLT5cbiAgICAgICAgIGluc3RydW1lbnQucmVtb3ZlKClcblxuICAgICAgQHJlbmRlckluc3RydW1lbnRzKClcbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cblxuXG5cbiAgIG9uSW5zdHJ1bWVudENoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgQCRjb250YWluZXIuZmluZCgnLmluc3RydW1lbnQnKS5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG5cblxuXG5cblxuICAgb25UZXN0Q2xpY2s6IChldmVudCkgLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0nY29udGFpbmVyLWluc3RydW1lbnRzJz5cXG5cXG48L2Rpdj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiO1xuXG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz0naWNvbiBcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWNvbikgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWNvbjsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIic+PC9kaXY+XFxuPGRpdiBjbGFzcz0nbGFiZWwnPlxcblx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvZGl2PlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIiMjIypcbiAqIExpdmUgTVBDIFwicGFkXCIgY29tcG9uZW50XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI0LjE0XG4jIyNcblxuUGFkU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYWRTcXVhcmVNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVNb2RlbC5jb2ZmZWUnXG5WaWV3ICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuUGFkU3F1YXJlICAgICAgICAgICA9IHJlcXVpcmUgJy4vUGFkU3F1YXJlLmNvZmZlZSdcbnRlbXBsYXRlICAgICAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9saXZlLXBhZC10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgTGl2ZVBhZCBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBjbGFzc25hbWUgZm9yIHRoZSBMaXZlIFBhZFxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdjb250YWluZXItbGl2ZS1wYWQnXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIENvbGxlY3Rpb24gb2Yga2l0cyB0byBiZSByZW5kZXJlZCB0byB0aGUgaW5zdHJ1bWVudCBjb250YWluZXJcbiAgICMgQHR5cGUge0tpdENvbGxlY3Rpb259XG5cbiAgIGtpdENvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIEFwcG1vZGVsIGZvciBsaXN0ZW5pbmcgdG8gc2hvdyAvIGhpZGUgZXZlbnRzXG4gICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICAgYXBwTW9kZWw6IG51bGxcblxuXG4gICAjIENvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBwYWQgc3F1YXJlIG1vZGVsc1xuICAgIyBAdHlwZSB7UGFkU3F1YXJlQ29sbGVjdGlvbn1cblxuICAgY29sbGVjdGlvbjogbnVsbFxuXG5cbiAgICMgQW4gYXJyYXkgb2YgaW5kaXZpZHVhbCBQYWRTcXVhcmVWaWV3c1xuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIHBhZFNxdWFyZVZpZXdzOiBudWxsXG5cblxuICAgIyBLZXkgY29tbWFuZCBrZXltYXAgZm9yIGxpdmUga2l0IHBsYXliYWNrXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAga2V5bWFwOiBbJzEnLCcyJywnMycsJzQnLCdxJywgJ3cnLCAnZScsICdyJywgJ2EnLCAncycsICdkJywgJ2YnLCAneicsICd4JywgJ2MnLCAndiddXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBhbmQgYW5kIHBhcnNlIHRoZSBjb2xsZWN0aW9uIGludG8gYSBkaXNwbGF5YWJsZVxuICAgIyBpbnN0cnVtZW50IC8gcGFkIHRhYmxlXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAjIEByZXR1cm4ge0xpdmVQYWR9XG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG5cbiAgICAgICMgUmVuZGVyIHRoZSB0YWJsZSB0byB0aGUgRE9NXG4gICAgICBzdXBlciB7XG4gICAgICAgICBwYWRUYWJsZTogQHJldHVyblBhZFRhYmxlRGF0YSgpXG4gICAgICAgICBpbnN0cnVtZW50VGFibGU6IEByZXR1cm5JbnN0cnVtZW50VGFibGVEYXRhKClcbiAgICAgIH1cblxuICAgICAgIyBSZW5kZXIgc3F1YXJlcyB0byB0aGUgRE9NXG4gICAgICBfLmVhY2ggQHBhZFNxdWFyZVZpZXdzLCAocGFkU3F1YXJlKSA9PlxuICAgICAgICAgaWQgPSBwYWRTcXVhcmUubW9kZWwuZ2V0ICdpZCdcbiAgICAgICAgIEAkZWwuZmluZChcIiMje2lkfVwiKS5odG1sIHBhZFNxdWFyZS5yZW5kZXIoKS5lbFxuXG5cbiAgICAgIEAkcGFkQ29udGFpbmVyICAgICAgICA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1wYWRzJ1xuICAgICAgQCRpbnN0cnVtZW50Q29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLWluc3RydW1lbnRzJ1xuXG4gICAgICBAXG5cblxuXG4gICAjIFJlbmRlciBvdXQgdGhlIHRhYmxlIGZvciB0aGUgbGl2ZSBwYWQgZ3JpZCBhbmQgcHVzaFxuICAgIyBpdCBpbnRvIGFuIGFycmF5IG9mIHRhYmxlIHJvd3MgYW5kIHRkc1xuICAgIyBAcmV0dXJuIHtPYmplY3R9XG5cbiAgIHJldHVyblBhZFRhYmxlRGF0YTogLT5cblxuICAgICAgQGNvbGxlY3Rpb24gPSBuZXcgUGFkU3F1YXJlQ29sbGVjdGlvbigpXG4gICAgICBAcGFkU3F1YXJlVmlld3MgPSBbXVxuICAgICAgcGFkVGFibGUgPSB7fVxuICAgICAgcm93cyA9IFtdXG4gICAgICBpdGVyYXRvciA9IDBcblxuICAgICAgIyBSZW5kZXIgb3V0IHJvd3NcbiAgICAgIF8oNCkudGltZXMgKGluZGV4KSA9PlxuICAgICAgICAgdGRzICA9IFtdXG5cbiAgICAgICAgICMgUmVuZGVyIG91dCBjb2x1bW5zXG4gICAgICAgICBfKDQpLnRpbWVzIChpbmRleCkgPT5cblxuICAgICAgICAgICAgIyBJbnN0YW50aWF0ZSBlYWNoIHBhZCB2aWV3IGFuZCB0aWUgdGhlIGlkXG4gICAgICAgICAgICAjIHRvIHRoZSBET00gZWxlbWVudFxuXG4gICAgICAgICAgICBtb2RlbCA9IG5ldyBQYWRTcXVhcmVNb2RlbFxuICAgICAgICAgICAgICAga2V5Y29kZTogQGtleW1hcFtpdGVyYXRvcl1cblxuICAgICAgICAgICAgcGFkU3F1YXJlID0gbmV3IFBhZFNxdWFyZVxuICAgICAgICAgICAgICAgbW9kZWw6IG1vZGVsXG4gICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICAgICAgICBAY29sbGVjdGlvbi5hZGQgbW9kZWxcbiAgICAgICAgICAgIEBwYWRTcXVhcmVWaWV3cy5wdXNoIHBhZFNxdWFyZVxuICAgICAgICAgICAgaXRlcmF0b3IrK1xuXG4gICAgICAgICAgICB0ZHMucHVzaCB7XG4gICAgICAgICAgICAgICBpZDogcGFkU3F1YXJlLm1vZGVsLmdldCgnaWQnKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICByb3dzLnB1c2gge1xuICAgICAgICAgICAgaWQ6IFwicGFkLXJvdy0je2luZGV4fVwiXG4gICAgICAgICAgICB0ZHM6IHRkc1xuICAgICAgICAgfVxuXG4gICAgICBwYWRUYWJsZS5yb3dzID0gcm93c1xuXG4gICAgICBwYWRUYWJsZVxuXG5cblxuXG4gICAjIFJlbmRlciBvdXQgdGhlIGluc3RydW1lbnQgdGFibGUgYW5kIHB1c2ggaXQgaW50b1xuICAgIyBhbmQgYXJyYXkgb2YgaW5kaXZpZHVhbCBpbnN0cnVtZW50c1xuICAgIyBAcmV0dXJuIHtPYmplY3R9XG5cbiAgIHJldHVybkluc3RydW1lbnRUYWJsZURhdGE6IC0+XG4gICAgICBpbnN0cnVtZW50VGFibGUgPSBAa2l0Q29sbGVjdGlvbi5tYXAgKGtpdCkgPT5cbiAgICAgICAgIGluc3RydW1lbnRzID0ga2l0LmdldCgnaW5zdHJ1bWVudHMnKS5tYXAgKGluc3RydW1lbnQpID0+XG4gICAgICAgICAgICBpbnN0cnVtZW50LnRvSlNPTigpXG5cbiAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbDoga2l0LmdldCAnbGFiZWwnXG4gICAgICAgICAgICBpbnN0cnVtZW50czogaW5zdHJ1bWVudHNcbiAgICAgICAgIH1cblxuICAgICAgaW5zdHJ1bWVudFRhYmxlXG5cblxuXG5cblxuICAgIyBBZGQgY29sbGVjdGlvbiBsaXN0ZW5lcnMgdG8gbGlzdGVuIGZvciBpbnN0cnVtZW50IGRyb3BzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IExpdmVQYWQiLCIjIyMqXG4gKiBMaXZlIE1QQyBcInBhZFwiIGNvbXBvbmVudFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3BhZC1zcXVhcmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFBhZFNxdWFyZSBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSB0YWcgdG8gYmUgcmVuZGVyZWQgdG8gdGhlIERPTVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICB0YWdOYW1lOiAndGQnXG5cblxuICAgIyBUaGUgY2xhc3NuYW1lIGZvciB0aGUgUGFkIFNxdWFyZVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdwYWQtc3F1YXJlJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBNb2RlbCB3aGljaCB0cmFja3Mgc3RhdGUgb2Ygc3F1YXJlIGFuZCBpbnN0cnVtZW50c1xuICAgIyBAdHlwZSB7UGFkU3F1YXJlTW9kZWx9XG5cbiAgIG1vZGVsOiBudWxsXG5cblxuICAgIyBUaGUgY3VycmVudCBpY29uIGNsYXNzIGFzIGFwcGxpZWQgdG8gdGhlIHNxdWFyZVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjdXJyZW50SWNvbjogbnVsbFxuXG5cbiAgICMgVGhlIGF1ZGlvIHBsYXliYWNrIGNvbXBvbmVudFxuICAgIyBAdHlwZSB7SG93bH1cblxuICAgYXVkaW9QbGF5YmFjazogbnVsbFxuXG5cblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQnOiAnb25DbGljaydcblxuXG5cblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQCRpY29uQ29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLWljb24nXG4gICAgICBAJGljb24gICAgICAgICAgPSBAJGljb25Db250YWluZXIuZmluZCAnLmljb24nXG5cbiAgICAgIEBcblxuXG4gICByZW1vdmU6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjaz8udW5sb2FkKClcbiAgICAgIHN1cGVyKClcblxuXG5cblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQG1vZGVsLCBBcHBFdmVudC5DSEFOR0VfVFJJR0dFUiwgQG9uVHJpZ2dlckNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBtb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0lOU1RSVU1FTlQsIEBvbkluc3RydW1lbnRDaGFuZ2VcblxuXG5cblxuICAgcmVuZGVySWNvbjogLT5cbiAgICAgIGlmIEAkaWNvbi5oYXNDbGFzcyBAY3VycmVudEljb25cbiAgICAgICAgIEAkaWNvbi5yZW1vdmVDbGFzcyBAY3VycmVudEljb25cblxuICAgICAgaW5zdHJ1bWVudCA9IEBtb2RlbC5nZXQgJ2N1cnJlbnRJbnN0cnVtZW50J1xuXG4gICAgICB1bmxlc3MgaW5zdHJ1bWVudCBpcyBudWxsXG4gICAgICAgICBAY3VycmVudEljb24gPSBpbnN0cnVtZW50LmdldCAnaWNvbidcbiAgICAgICAgIEAkaWNvbi5hZGRDbGFzcyBAY3VycmVudEljb25cblxuXG5cblxuICAgc2V0U291bmQ6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjaz8udW5sb2FkKClcblxuICAgICAgaW5zdHJ1bWVudCA9IEBtb2RlbC5nZXQgJ2N1cnJlbnRJbnN0cnVtZW50J1xuXG4gICAgICB1bmxlc3MgaW5zdHJ1bWVudCBpcyBudWxsXG4gICAgICAgICBhdWRpb1NyYyA9IGluc3RydW1lbnQuZ2V0ICdzcmMnXG5cbiAgICAgICAgICMgVE9ETzogVGVzdCBtZXRob2RzXG4gICAgICAgICBpZiB3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCd0ZXN0JykgaXNudCAtMSB0aGVuIGF1ZGlvU3JjID0gJydcblxuICAgICAgICAgQGF1ZGlvUGxheWJhY2sgPSBuZXcgSG93bFxuICAgICAgICAgICAgdm9sdW1lOiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5tZWRpdW1cbiAgICAgICAgICAgIHVybHM6IFthdWRpb1NyY11cbiAgICAgICAgICAgIG9uZW5kOiBAb25Tb3VuZEVuZFxuXG5cblxuICAgcmVtb3ZlU291bmQ6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjaz8udW5sb2FkKClcbiAgICAgIEBtb2RlbC5zZXQgJ2N1cnJlbnRJbnN0cnVtZW50JywgbnVsbFxuXG5cblxuXG4gICBwbGF5U291bmQ6IC0+XG4gICAgICBAYXVkaW9QbGF5YmFjaz8ucGxheSgpXG4gICAgICBAbW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICBvbkNsaWNrOiAoZXZlbnQpID0+XG4gICAgICBAbW9kZWwuc2V0ICd0cmlnZ2VyJywgdHJ1ZVxuXG4gICAgICBjb25zb2xlLmxvZyAnaGV5J1xuXG5cblxuXG4gICBvbkhvbGQ6IChldmVudCkgPT5cbiAgICAgIEBtb2RlbC5zZXQgJ2RyYWdnaW5nJywgdHJ1ZVxuXG5cblxuXG4gICBvbkRyYWc6IChldmVudCkgLT5cbiAgICAgIEBtb2RlbC5zZXQgJ2RyYWdnaW5nJywgdHJ1ZVxuXG5cblxuXG4gICBvbkRyb3A6IChpZCkgLT5cbiAgICAgIGluc3RydW1lbnRNb2RlbCA9IEBmaW5kSW5zdHJ1bWVudE1vZGVsIGlkXG5cbiAgICAgIEBtb2RlbC5zZXRcbiAgICAgICAgICdkcmFnZ2luZyc6IGZhbHNlXG4gICAgICAgICAnZHJvcHBlZCc6IHRydWVcbiAgICAgICAgICdjdXJyZW50SW5zdHJ1bWVudCc6IGluc3RydW1lbnRNb2RlbFxuXG5cblxuXG4gICBvblRyaWdnZXJDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIHBsYXlpbmcgPSBtb2RlbC5jaGFuZ2VkLnBsYXlpbmdcblxuICAgICAgaWYgcGxheWluZ1xuICAgICAgICAgQHBsYXlTb3VuZCgpXG5cblxuXG4gICBvbkluc3RydW1lbnRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEByZW5kZXJJY29uKClcbiAgICAgIEBzZXRTb3VuZCgpXG5cblxuXG5cbiAgIG9uU291bmRFbmQ6ID0+XG4gICAgICBAbW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cblxuICAgZmluZEluc3RydW1lbnRNb2RlbDogKGlkKSAtPlxuICAgICAgaW5zdHJ1bWVudE1vZGVsID0gbnVsbFxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChraXRNb2RlbCkgPT5cbiAgICAgICAgIGtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKS5lYWNoIChtb2RlbCkgPT5cbiAgICAgICAgICAgIGlmIGlkIGlzIG1vZGVsLmdldCgnaWQnKVxuICAgICAgICAgICAgICAgaW5zdHJ1bWVudE1vZGVsID0gbW9kZWxcblxuICAgICAgaWYgaW5zdHJ1bWVudE1vZGVsIGlzIG51bGxcbiAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICBpbnN0cnVtZW50TW9kZWxcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZFNxdWFyZSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIHN0YWNrMiwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHRcdDx0cj5cXG5cdFx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAudGRzLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMiwgcHJvZ3JhbTIsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHRcdDwvdHI+XFxuXHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTIoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdFx0PHRkIGlkPVxcXCJcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWQpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmlkOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj5cXG5cXG5cdFx0XHRcdDwvdGQ+XFxuXHRcdFx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTQoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8ZGl2IGNsYXNzPSdjb250YWluZXItaW5zdHJ1bWVudCc+XFxuXHRcdFx0PGgzPlxcblx0XHRcdFx0PGI+XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIjwvYj5cXG5cdFx0XHQ8L2gzPlxcblxcblx0XHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsIGRlcHRoMC5pbnN0cnVtZW50cywge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDUsIHByb2dyYW01LCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8L2Rpdj5cXG5cdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtNShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPSdpbnN0cnVtZW50Jz5cXG5cdFx0XHRcdFx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8dGFibGUgY2xhc3M9J2NvbnRhaW5lci1wYWRzJz5cXG5cdFwiO1xuICBzdGFjazIgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsICgoc3RhY2sxID0gZGVwdGgwLnBhZFRhYmxlKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLnJvd3MpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazIgfHwgc3RhY2syID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazI7IH1cbiAgYnVmZmVyICs9IFwiXFxuPC90YWJsZT5cXG5cXG5cXG48ZGl2IGNsYXNzPSdjb250YWluZXItaW5zdHJ1bWVudHMnPlxcblx0XCI7XG4gIHN0YWNrMiA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgZGVwdGgwLmluc3RydW1lbnRUYWJsZSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDQsIHByb2dyYW00LCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvZGl2PlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPSdrZXktY29kZSc+XFxuXHRcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMua2V5Y29kZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAua2V5Y29kZTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci1pY29uJz5cXG5cdDxkaXYgY2xhc3M9J2ljb24nPlxcblxcblx0PC9kaXY+XFxuPC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwiIyMjKlxuICogSW5kaXZpZHVhbCBzZXF1ZW5jZXIgdHJhY2tzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYXR0ZXJuLXNxdWFyZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgUGF0dGVyblNxdWFyZSBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBjb250YWluZXIgY2xhc3NuYW1lXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3BhdHRlcm4tc3F1YXJlJ1xuXG5cbiAgICMgVGhlIERPTSB0YWcgYW5lbVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICB0YWdOYW1lOiAndGQnXG5cblxuICAgIyBUaGUgdGVtcGxhdGVcbiAgICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICAjIFRoZSBhdWRpbyBwbGF5YmFjayBpbnN0YW5jZSAoSG93bGVyKVxuICAgIyBAdHlwZSB7SG93bH1cblxuICAgYXVkaW9QbGF5YmFjazogbnVsbFxuXG5cbiAgICMgVGhlIG1vZGVsIHdoaWNoIGNvbnRyb2xzIHZvbHVtZSwgcGxheWJhY2ssIGV0Y1xuICAgIyBAdHlwZSB7UGF0dGVyblNxdWFyZU1vZGVsfVxuXG4gICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG51bGxcblxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kJzogJ29uQ2xpY2snXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYW5kIGluc3RhbnRpYXRlcyB0aGUgaG93bGVyIGF1ZGlvIGVuZ2luZVxuICAgIyBAcGF0dGVyblNxdWFyZU1vZGVsIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgYXVkaW9TcmMgPSBAcGF0dGVyblNxdWFyZU1vZGVsLmdldCgnaW5zdHJ1bWVudCcpLmdldCAnc3JjJ1xuXG4gICAgICAjIFRPRE86IFRlc3QgbWV0aG9kc1xuICAgICAgaWYgd2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZigndGVzdCcpIGlzbnQgLTEgdGhlbiBhdWRpb1NyYyA9ICcnXG5cbiAgICAgIEBhdWRpb1BsYXliYWNrID0gbmV3IEhvd2xcbiAgICAgICAgIHZvbHVtZTogQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubG93XG4gICAgICAgICB1cmxzOiBbYXVkaW9TcmNdXG4gICAgICAgICBvbmVuZDogQG9uU291bmRFbmRcblxuICAgICAgQFxuXG5cblxuXG4gICAjIFJlbW92ZSB0aGUgdmlldyBhbmQgZGVzdHJveSB0aGUgYXVkaW8gcGxheWJhY2tcblxuICAgcmVtb3ZlOiAtPlxuICAgICAgQGF1ZGlvUGxheWJhY2sudW5sb2FkKClcbiAgICAgIHN1cGVyKClcblxuXG5cblxuICAgIyBBZGRzIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVnaW5zIGxpc3RlbmluZyBmb3IgdmVsb2NpdHksIGFjdGl2aXR5IGFuZCB0cmlnZ2Vyc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAcGF0dGVyblNxdWFyZU1vZGVsLCBBcHBFdmVudC5DSEFOR0VfVkVMT0NJVFksIEBvblZlbG9jaXR5Q2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0FDVElWRSwgICBAb25BY3RpdmVDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAcGF0dGVyblNxdWFyZU1vZGVsLCBBcHBFdmVudC5DSEFOR0VfVFJJR0dFUiwgIEBvblRyaWdnZXJDaGFuZ2VcblxuXG5cblxuICAgIyBFbmFibGUgcGxheWJhY2sgb2YgdGhlIGF1ZGlvIHNxdWFyZVxuXG4gICBlbmFibGU6IC0+XG4gICAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmVuYWJsZSgpXG5cblxuXG5cbiAgICMgRGlzYWJsZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgIGRpc2FibGU6IC0+XG4gICAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmRpc2FibGUoKVxuXG5cblxuXG4gICAjIFBsYXliYWNrIGF1ZGlvIG9uIHRoZSBhdWRpbyBzcXVhcmVcblxuICAgcGxheTogLT5cbiAgICAgIEBhdWRpb1BsYXliYWNrLnBsYXkoKVxuXG4gICAgICBUd2Vlbk1heC50byBAJGVsLCAuMixcbiAgICAgICAgIGVhc2U6IEJhY2suZWFzZUluXG4gICAgICAgICBzY2FsZTogLjVcblxuICAgICAgICAgb25Db21wbGV0ZTogPT5cblxuICAgICAgICAgICAgVHdlZW5NYXgudG8gQCRlbCwgLjIsXG4gICAgICAgICAgICAgICBzY2FsZTogMVxuICAgICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgY2xpY2sgZXZlbnRzIG9uIHRoZSBhdWRpbyBzcXVhcmUuICBUb2dnbGVzIHRoZVxuICAgIyB2b2x1bWUgZnJvbSBsb3cgdG8gaGlnaCB0byBvZmZcblxuICAgb25DbGljazogKGV2ZW50KSAtPlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5jeWNsZSgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgdmVsb2NpdHkgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIHZpc3VhbCBkaXNwbGF5IGFuZCBzZXRzIHZvbHVtZVxuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICAgb25WZWxvY2l0eUNoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgdmVsb2NpdHkgPSBtb2RlbC5jaGFuZ2VkLnZlbG9jaXR5XG5cbiAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgJ3ZlbG9jaXR5LWxvdyB2ZWxvY2l0eS1tZWRpdW0gdmVsb2NpdHktaGlnaCdcblxuICAgICAgIyBTZXQgdmlzdWFsIGluZGljYXRvclxuICAgICAgdmVsb2NpdHlDbGFzcyA9IHN3aXRjaCB2ZWxvY2l0eVxuICAgICAgICAgd2hlbiAxIHRoZW4gJ3ZlbG9jaXR5LWxvdydcbiAgICAgICAgIHdoZW4gMiB0aGVuICd2ZWxvY2l0eS1tZWRpdW0nXG4gICAgICAgICB3aGVuIDMgdGhlbiAndmVsb2NpdHktaGlnaCdcbiAgICAgICAgIGVsc2UgJydcblxuICAgICAgQCRlbC5hZGRDbGFzcyB2ZWxvY2l0eUNsYXNzXG5cblxuICAgICAgIyBTZXQgYXVkaW8gdm9sdW1lXG4gICAgICB2b2x1bWUgPSBzd2l0Y2ggdmVsb2NpdHlcbiAgICAgICAgIHdoZW4gMSB0aGVuIEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLmxvd1xuICAgICAgICAgd2hlbiAyIHRoZW4gQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubWVkaXVtXG4gICAgICAgICB3aGVuIDMgdGhlbiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5oaWdoXG4gICAgICAgICBlbHNlICcnXG5cbiAgICAgIEBhdWRpb1BsYXliYWNrLnZvbHVtZSggdm9sdW1lIClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBhY3Rpdml0eSBjaGFuZ2UgZXZlbnRzLiAgV2hlbiBpbmFjdGl2ZSwgY2hlY2tzIGFnYWluc3QgcGxheWJhY2sgYXJlXG4gICAjIG5vdCBwZXJmb3JtZWQgYW5kIHRoZSBzcXVhcmUgaXMgc2tpcHBlZC5cbiAgICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgIG9uQWN0aXZlQ2hhbmdlOiAobW9kZWwpIC0+XG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgdHJpZ2dlciBcInBsYXliYWNrXCIgZXZlbnRzXG4gICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gICBvblRyaWdnZXJDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIGlmIG1vZGVsLmNoYW5nZWQudHJpZ2dlciBpcyB0cnVlXG4gICAgICAgICBAcGxheSgpXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Igc291bmQgcGxheWJhY2sgZW5kIGV2ZW50cy4gIFJlbW92ZXMgdGhlIHRyaWdnZXJcbiAgICMgZmxhZyBzbyB0aGUgYXVkaW8gd29uJ3Qgb3ZlcmxhcFxuXG4gICBvblNvdW5kRW5kOiA9PlxuICAgICAgQHBhdHRlcm5TcXVhcmVNb2RlbC5zZXQgJ3RyaWdnZXInLCBmYWxzZVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmUiLCIjIyMqXG4gKiBJbmRpdmlkdWFsIHNlcXVlbmNlciB0cmFja3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlICAgICAgICAgICA9IHJlcXVpcmUgJy4vUGF0dGVyblNxdWFyZS5jb2ZmZWUnXG5WaWV3ICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGF0dGVybi10cmFjay10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgUGF0dGVyblRyYWNrIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgVGhlIG5hbWUgb2YgdGhlIGNsYXNzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3BhdHRlcm4tdHJhY2snXG5cblxuICAgIyBUaGUgdHlwZSBvZiB0YWdcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgdGFnTmFtZTogJ3RyJ1xuXG5cbiAgICMgVGhlIHRlbXBsYXRlXG4gICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAgIyBBIGNvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCB2aWV3IHNxdWFyZXNcbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBwYXR0ZXJuU3F1YXJlVmlld3M6IG51bGxcblxuXG4gICAjIEB0eXBlIHtQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbn1cbiAgIGNvbGxlY3Rpb246IG51bGxcblxuXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICBtb2RlbDogbnVsbFxuXG5cblxuICAgZXZlbnRzOlxuICAgICAgJ3RvdWNoZW5kIC5sYWJlbC1pbnN0cnVtZW50JzogJ29uTGFiZWxDbGljaydcbiAgICAgICd0b3VjaGVuZCAuYnRuLW11dGUnOiAgICAgICAgICdvbk11dGVCdG5DbGljaydcblxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGFuZCByZW5kZXJzIG91dCBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlc1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAJGxhYmVsID0gQCRlbC5maW5kICcubGFiZWwtaW5zdHJ1bWVudCdcblxuICAgICAgQHJlbmRlclBhdHRlcm5TcXVhcmVzKClcblxuICAgICAgQFxuXG5cblxuICAgcmVtb3ZlOiAtPlxuICAgICAgXy5lYWNoIEBwYXR0ZXJuU3F1YXJlVmlld3MsIChzcXVhcmUpID0+XG4gICAgICAgICBzcXVhcmUucmVtb3ZlKClcblxuICAgICAgc3VwZXIoKVxuXG5cblxuXG4gICAjIEFkZCBsaXN0ZW5lcnMgdG8gdGhlIHZpZXcgd2hpY2ggbGlzdGVuIGZvciB2aWV3IGNoYW5nZXNcbiAgICMgYXMgd2VsbCBhcyBjaGFuZ2VzIHRvIHRoZSBjb2xsZWN0aW9uLCB3aGljaCBzaG91bGQgdXBkYXRlXG4gICAjIHBhdHRlcm4gc3F1YXJlcyB3aXRob3V0IHJlLXJlbmRlcmluZyB0aGUgdmlld3NcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAa2l0TW9kZWwgPSBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpXG5cbiAgICAgIEBsaXN0ZW5UbyBAbW9kZWwsICAgIEFwcEV2ZW50LkNIQU5HRV9GT0NVUywgICAgICBAb25Gb2N1c0NoYW5nZVxuICAgICAgQGxpc3RlblRvIEBtb2RlbCwgICAgQXBwRXZlbnQuQ0hBTkdFX01VVEUsICAgICAgIEBvbk11dGVDaGFuZ2VcbiAgICAgIEBsaXN0ZW5UbyBAa2l0TW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9JTlNUUlVNRU5ULCBAb25JbnN0cnVtZW50Q2hhbmdlXG5cblxuXG5cbiAgICMgUmVuZGVyIG91dCB0aGUgcGF0dGVybiBzcXVhcmVzIGFuZCBwdXNoIHRoZW0gaW50byBhbiBhcnJheVxuICAgIyBmb3IgZnVydGhlciBpdGVyYXRpb25cblxuICAgcmVuZGVyUGF0dGVyblNxdWFyZXM6IC0+XG4gICAgICBAcGF0dGVyblNxdWFyZVZpZXdzID0gW11cblxuICAgICAgQGNvbGxlY3Rpb24gPSBuZXcgUGF0dGVyblNxdWFyZUNvbGxlY3Rpb25cblxuICAgICAgXyg4KS50aW1lcyA9PlxuICAgICAgICAgQGNvbGxlY3Rpb24uYWRkIG5ldyBQYXR0ZXJuU3F1YXJlTW9kZWwgeyBpbnN0cnVtZW50OiBAbW9kZWwgfVxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChtb2RlbCkgPT5cbiAgICAgICAgIHBhdHRlcm5TcXVhcmUgPSBuZXcgUGF0dGVyblNxdWFyZVxuICAgICAgICAgICAgcGF0dGVyblNxdWFyZU1vZGVsOiBtb2RlbFxuXG4gICAgICAgICBAJGxhYmVsLnRleHQgbW9kZWwuZ2V0ICdsYWJlbCdcbiAgICAgICAgIEAkZWwuYXBwZW5kIHBhdHRlcm5TcXVhcmUucmVuZGVyKCkuZWxcbiAgICAgICAgIEBwYXR0ZXJuU3F1YXJlVmlld3MucHVzaCBwYXR0ZXJuU3F1YXJlXG5cbiAgICAgICMgU2V0IHRoZSBzcXVhcmVzIG9uIHRoZSBJbnN0cnVtZW50IG1vZGVsIHRvIHRyYWNrIGFnYWluc3Qgc3RhdGVcbiAgICAgIEBtb2RlbC5zZXQgJ3BhdHRlcm5TcXVhcmVzJywgQGNvbGxlY3Rpb25cblxuXG5cbiAgICMgTXV0ZSB0aGUgZW50aXJlIHRyYWNrXG5cbiAgIG11dGU6IC0+XG4gICAgICBAbW9kZWwuc2V0ICdtdXRlJywgdHJ1ZVxuXG5cblxuICAgIyBVbm11dGUgdGhlIGVudGlyZSB0cmFja1xuXG4gICB1bm11dGU6IC0+XG4gICAgICBAbW9kZWwuc2V0ICdtdXRlJywgZmFsc2VcblxuXG5cbiAgIHNlbGVjdDogLT5cbiAgICAgIEAkZWwuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuICAgZGVzZWxlY3Q6IC0+XG4gICAgICBpZiBAJGVsLmhhc0NsYXNzICdzZWxlY3RlZCdcbiAgICAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cblxuICAgZm9jdXM6IC0+XG4gICAgICBAJGVsLmFkZENsYXNzICdmb2N1cydcblxuXG5cblxuICAgdW5mb2N1czogLT5cbiAgICAgIGlmIEAkZWwuaGFzQ2xhc3MgJ2ZvY3VzJ1xuICAgICAgICAgQCRlbC5yZW1vdmVDbGFzcyAnZm9jdXMnXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgY2hhbmdlcyB0byB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGluc3RydW1lbnRcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IGluc3RydW1lbnRNb2RlbFxuXG4gICBvbkluc3RydW1lbnRDaGFuZ2U6IChpbnN0cnVtZW50TW9kZWwpID0+XG4gICAgICBpbnN0cnVtZW50ID0gaW5zdHJ1bWVudE1vZGVsLmNoYW5nZWQuY3VycmVudEluc3RydW1lbnRcblxuICAgICAgaWYgaW5zdHJ1bWVudC5jaWQgaXMgQG1vZGVsLmNpZFxuICAgICAgICAgQHNlbGVjdCgpXG5cbiAgICAgIGVsc2UgQGRlc2VsZWN0KClcblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtdXRlIG1vZGVsIGNoYW5nZSBldmVudHNcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uTXV0ZUNoYW5nZTogKG1vZGVsKSAtPlxuICAgICAgbXV0ZSA9IG1vZGVsLmNoYW5nZWQubXV0ZVxuXG4gICAgICBpZiBtdXRlXG4gICAgICAgICBAJGVsLmFkZENsYXNzICdtdXRlJ1xuXG4gICAgICBlbHNlIEAkZWwucmVtb3ZlQ2xhc3MgJ211dGUnXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGZvY3VzIGNoYW5nZSBldmVudHNcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uRm9jdXNDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICAgIGlmIG1vZGVsLmNoYW5nZWQuZm9jdXNcbiAgICAgICAgICBAZm9jdXMoKVxuICAgICAgZWxzZVxuICAgICAgICAgIEB1bmZvY3VzKClcblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbXV0ZSBidXR0b24gY2xpY2tzXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbkxhYmVsQ2xpY2s6IChldmVudCkgPT5cbiAgICAgIGlmIEBtb2RlbC5nZXQoJ211dGUnKSBpc250IHRydWVcbiAgICAgICAgIEBtb2RlbC5zZXQgJ2ZvY3VzJywgISBAbW9kZWwuZ2V0KCdmb2N1cycpXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtdXRlIGJ1dHRvbiBjbGlja3NcbiAgICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgIG9uTXV0ZUJ0bkNsaWNrOiAoZXZlbnQpID0+XG4gICAgICBpZiBAbW9kZWwuZ2V0ICdtdXRlJ1xuICAgICAgICAgQHVubXV0ZSgpXG5cbiAgICAgIGVsc2UgQG11dGUoKVxuXG5cblxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblRyYWNrIiwiIyMjKlxuICogU2VxdWVuY2VyIHBhcmVudCB2aWV3IGZvciB0cmFjayBzZXF1ZW5jZXNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5QYXR0ZXJuVHJhY2sgPSByZXF1aXJlICcuL1BhdHRlcm5UcmFjay5jb2ZmZWUnXG5BcHBFdmVudCAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuaGVscGVycyAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vaGVscGVycy9oYW5kbGViYXJzLWhlbHBlcnMnXG50ZW1wbGF0ZSAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zZXF1ZW5jZXItdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFNlcXVlbmNlciBleHRlbmRzIFZpZXdcblxuXG4gICAjIFRoZSBuYW1lIG9mIHRoZSBjb250YWluZXIgY2xhc3NcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnc2VxdWVuY2VyLWNvbnRhaW5lcidcblxuXG4gICAjIFRoZSB0ZW1wbGF0ZVxuICAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgICMgQW4gYXJyYXkgb2YgYWxsIHBhdHRlcm4gdHJhY2tzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIHBhdHRlcm5UcmFja1ZpZXdzOiBudWxsXG5cblxuICAgIyBUaGUgc2V0SW50ZXJ2YWwgdGlja2VyXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIGJwbUludGVydmFsOiBudWxsXG5cblxuICAgIyBUaGUgdGltZSBpbiB3aGljaCB0aGUgaW50ZXJ2YWwgZmlyZXNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgdXBkYXRlSW50ZXJ2YWxUaW1lOiAyMDBcblxuXG4gICAjIFRoZSBjdXJyZW50IGJlYXQgaWRcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgY3VyckJlYXRDZWxsSWQ6IC0xXG5cblxuICAgIyBUT0RPOiBVcGRhdGUgdGhpcyB0byBtYWtlIGl0IG1vcmUgZHluYW1pY1xuICAgIyBUaGUgbnVtYmVyIG9mIGJlYXQgY2VsbHNcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgbnVtQ2VsbHM6IDdcblxuXG4gICAjIEdsb2JhbCBhcHBsaWNhdGlvbiBtb2RlbFxuICAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgIGFwcE1vZGVsOiBudWxsXG5cblxuICAgIyBDb2xsZWN0aW9uIG9mIGluc3RydW1lbnRzXG4gICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cblxuICAgY29sbGVjdGlvbjogbnVsbFxuXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXdcbiAgICMgQHBhcmFtIHtPYmplY3R9XG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEAkdGhTdGVwcGVyID0gQCRlbC5maW5kICd0aC5zdGVwcGVyJ1xuICAgICAgQCRzZXF1ZW5jZXIgPSBAJGVsLmZpbmQgJy5zZXF1ZW5jZXInXG5cbiAgICAgIEByZW5kZXJUcmFja3MoKVxuICAgICAgQHBsYXkoKVxuXG4gICAgICBAXG5cblxuICAgIyBSZW1vdmVzIHRoZSB2aWV3IGZyb20gdGhlIERPTSBhbmQgY2FuY2Vsc1xuICAgIyB0aGUgdGlja2VyIGludGVydmFsXG5cbiAgIHJlbW92ZTogLT5cbiAgICAgIF8uZWFjaCBAcGF0dGVyblRyYWNrVmlld3MsICh0cmFjaykgPT5cbiAgICAgICAgIHRyYWNrLnJlbW92ZSgpXG5cbiAgICAgIEBwYXVzZSgpXG5cbiAgICAgIHN1cGVyKClcblxuXG5cbiAgICMgQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgaGFuZGxpbmcgaW5zdHJ1bWVudCBhbmQgcGxheWJhY2tcbiAgICMgY2hhbmdlcy4gIFVwZGF0ZXMgYWxsIG9mIHRoZSB2aWV3cyBhY2NvcmRpbmdseVxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsICAgQXBwRXZlbnQuQ0hBTkdFX0JQTSwgICAgIEBvbkJQTUNoYW5nZVxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgICBBcHBFdmVudC5DSEFOR0VfUExBWUlORywgQG9uUGxheWluZ0NoYW5nZVxuICAgICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgICBBcHBFdmVudC5DSEFOR0VfS0lULCAgICAgQG9uS2l0Q2hhbmdlXG4gICAgICBAbGlzdGVuVG8gQGNvbGxlY3Rpb24sIEFwcEV2ZW50LkNIQU5HRV9GT0NVUywgICBAb25Gb2N1c0NoYW5nZVxuXG5cblxuICAgIyBSZW5kZXJzIG91dCBlYWNoIGluZGl2aWR1YWwgdHJhY2suXG4gICAjIFRPRE86IE5lZWQgdG8gdXBkYXRlIHNvIHRoYXQgYWxsIG9mIHRoZSBiZWF0IHNxdWFyZXMgYXJlbid0XG4gICAjIGJsb3duIGF3YXkgYnkgdGhlIHJlLXJlbmRlclxuXG4gICByZW5kZXJUcmFja3M6ID0+XG4gICAgICBAJGVsLmZpbmQoJy5wYXR0ZXJuLXRyYWNrJykucmVtb3ZlKClcblxuICAgICAgQHBhdHRlcm5UcmFja1ZpZXdzID0gW11cblxuICAgICAgQGNvbGxlY3Rpb24uZWFjaCAobW9kZWwpID0+XG5cbiAgICAgICAgIHBhdHRlcm5UcmFjayA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IG1vZGVsLmdldCAncGF0dGVyblNxdWFyZXMnXG4gICAgICAgICAgICBtb2RlbDogbW9kZWxcblxuICAgICAgICAgQHBhdHRlcm5UcmFja1ZpZXdzLnB1c2ggcGF0dGVyblRyYWNrXG4gICAgICAgICBAJHNlcXVlbmNlci5hcHBlbmQgcGF0dGVyblRyYWNrLnJlbmRlcigpLmVsXG5cblxuXG5cbiAgICMgVXBkYXRlIHRoZSB0aWNrZXIgdGltZSwgYW5kIGFkdmFuY2VzIHRoZSBiZWF0XG5cbiAgIHVwZGF0ZVRpbWU6ID0+XG4gICAgICBAJHRoU3RlcHBlci5yZW1vdmVDbGFzcyAnc3RlcCdcbiAgICAgIEBjdXJyQmVhdENlbGxJZCA9IGlmIEBjdXJyQmVhdENlbGxJZCA8IEBudW1DZWxscyB0aGVuIEBjdXJyQmVhdENlbGxJZCArPSAxIGVsc2UgQGN1cnJCZWF0Q2VsbElkID0gMFxuICAgICAgJChAJHRoU3RlcHBlcltAY3VyckJlYXRDZWxsSWRdKS5hZGRDbGFzcyAnc3RlcCdcblxuICAgICAgQHBsYXlBdWRpbygpXG5cblxuXG5cbiAgICMgQ29udmVydHMgbWlsbGlzZWNvbmRzIHRvIEJQTVxuXG4gICBjb252ZXJ0QlBNOiAtPlxuICAgICAgcmV0dXJuIDIwMFxuXG5cblxuICAgIyBTdGFydCBwbGF5YmFjayBvZiBzZXF1ZW5jZXJcblxuICAgcGxheTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3BsYXlpbmcnLCB0cnVlXG5cblxuXG5cbiAgICMgUGF1c2VzIHNlcXVlbmNlciBwbGF5YmFja1xuXG4gICBwYXVzZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ3BsYXlpbmcnLCBmYWxzZVxuXG5cblxuXG4gICAjIE11dGVzIHRoZSBzZXF1ZW5jZXJcblxuICAgbXV0ZTogLT5cbiAgICAgIEBhcHBNb2RlbC5zZXQgJ211dGUnLCB0cnVlXG5cblxuXG5cbiAgICMgVW5tdXRlcyB0aGUgc2VxdWVuY2VyXG5cbiAgIHVubXV0ZTogLT5cbiAgICAgICBAYXBwTW9kZWwuc2V0ICdtdXRlJywgZmFsc2VcblxuXG5cblxuXG4gICAjIFBsYXlzIGF1ZGlvIG9mIGVhY2ggdHJhY2sgY3VycmVudGx5IGVuYWJsZWQgYW5kIG9uXG5cbiAgIHBsYXlBdWRpbzogLT5cbiAgICAgIGZvY3VzZWRJbnN0cnVtZW50ID0gIEBjb2xsZWN0aW9uLmZpbmRXaGVyZSB7IGZvY3VzOiB0cnVlIH1cblxuICAgICAgIyBDaGVjayBpZiB0aGVyZSdzIGEgZm9jdXNlZCB0cmFjayBhbmQgb25seVxuICAgICAgIyBwbGF5IGF1ZGlvIGZyb20gdGhlcmVcblxuICAgICAgaWYgZm9jdXNlZEluc3RydW1lbnRcbiAgICAgICAgIGlmIGZvY3VzZWRJbnN0cnVtZW50LmdldCgnbXV0ZScpIGlzbnQgdHJ1ZVxuICAgICAgICAgICAgZm9jdXNlZEluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpLmVhY2ggKHBhdHRlcm5TcXVhcmUsIGluZGV4KSA9PlxuICAgICAgICAgICAgICAgQHBsYXlQYXR0ZXJuU3F1YXJlQXVkaW8oIHBhdHRlcm5TcXVhcmUsIGluZGV4IClcblxuICAgICAgICAgcmV0dXJuXG5cblxuICAgICAgIyBJZiBub3RoaW5nIGlzIGZvY3VzZWQsIHRoZW4gY2hlY2sgYWdhaW5zdFxuICAgICAgIyB0aGUgZW50aXJlIG1hdHJpeFxuXG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChpbnN0cnVtZW50KSA9PlxuICAgICAgICAgaWYgaW5zdHJ1bWVudC5nZXQoJ211dGUnKSBpc250IHRydWVcbiAgICAgICAgICAgIGluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpLmVhY2ggKHBhdHRlcm5TcXVhcmUsIGluZGV4KSA9PlxuICAgICAgICAgICAgICAgQHBsYXlQYXR0ZXJuU3F1YXJlQXVkaW8oIHBhdHRlcm5TcXVhcmUsIGluZGV4IClcblxuXG5cblxuICAgIyBQbGF5cyB0aGUgYXVkaW8gb24gYW4gaW5kaXZpZHVhbCBQYXR0ZXJTcXVhcmUgaWYgdGVtcG8gaW5kZXhcbiAgICMgaXMgdGhlIHNhbWUgYXMgdGhlIGluZGV4IHdpdGhpbiB0aGUgY29sbGVjdGlvblxuICAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmV9IHBhdHRlcm5TcXVhcmVcbiAgICMgQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG5cbiAgIHBsYXlQYXR0ZXJuU3F1YXJlQXVkaW86IChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgLT5cbiAgICAgIGlmIEBjdXJyQmVhdENlbGxJZCBpcyBpbmRleFxuICAgICAgICAgaWYgcGF0dGVyblNxdWFyZS5nZXQgJ2FjdGl2ZSdcbiAgICAgICAgICAgIHBhdHRlcm5TcXVhcmUuc2V0ICd0cmlnZ2VyJywgdHJ1ZVxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIEJQTSB0ZW1wbyBjaGFuZ2VzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uQlBNQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBjbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuICAgICAgQHVwZGF0ZUludGVydmFsVGltZSA9IG1vZGVsLmNoYW5nZWQuYnBtXG4gICAgICBAYnBtSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAdXBkYXRlVGltZSwgQHVwZGF0ZUludGVydmFsVGltZVxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHBsYXliYWNrIGNoYW5nZXMuICBJZiBwYXVzZWQsIGl0IHN0b3BzIHBsYXliYWNrIGFuZFxuICAgIyBjbGVhcnMgdGhlIGludGVydmFsLiAgSWYgcGxheWluZywgaXQgcmVzZXRzIGl0XG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uUGxheWluZ0NoYW5nZTogKG1vZGVsKSA9PlxuICAgICAgcGxheWluZyA9IG1vZGVsLmNoYW5nZWQucGxheWluZ1xuXG4gICAgICBpZiBwbGF5aW5nXG4gICAgICAgICBAYnBtSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAdXBkYXRlVGltZSwgQHVwZGF0ZUludGVydmFsVGltZVxuXG4gICAgICBlbHNlXG4gICAgICAgICBjbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuICAgICAgICAgQGJwbUludGVydmFsID0gbnVsbFxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG11dGUgYW5kIHVubXV0ZSBjaGFuZ2VzXG4gICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgIG9uTXV0ZUNoYW5nZTogKG1vZGVsKSA9PlxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGtpdCBjaGFuZ2VzLCBhcyBzZXQgZnJvbSB0aGUgS2l0U2VsZWN0b3JcbiAgICMgQHBhcmFtIHtLaXRNb2RlbH0gbW9kZWxcblxuICAgb25LaXRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICAgIEBjb2xsZWN0aW9uID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJylcbiAgICAgIEByZW5kZXJUcmFja3MoKVxuXG4gICAgICAjIEV4cG9ydCBvbGQgcGF0dGVybiBzcXVhcmVzIHNvIHRoZSB1c2VycyBwYXR0ZXJuIGlzbid0IGJsb3duIGF3YXlcbiAgICAgICMgd2hlbiBraXQgY2hhbmdlcyBvY2N1clxuXG4gICAgICBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbiA9IG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMua2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpXG4gICAgICBvbGRQYXR0ZXJuU3F1YXJlcyA9IG9sZEluc3RydW1lbnRDb2xsZWN0aW9uLmV4cG9ydFBhdHRlcm5TcXVhcmVzKClcblxuXG4gICAgICAjIFVwZGF0ZSB0aGUgbmV3IGNvbGxlY3Rpb24gd2l0aCBvbGQgcGF0dGVybiBzcXVhcmUgZGF0YVxuICAgICAgIyBhbmQgdHJpZ2dlciBVSSB1cGRhdGVzIG9uIGVhY2ggc3F1YXJlXG5cbiAgICAgIEBjb2xsZWN0aW9uLmVhY2ggKGluc3RydW1lbnRNb2RlbCwgaW5kZXgpIC0+XG4gICAgICAgICBvbGRDb2xsZWN0aW9uID0gb2xkUGF0dGVyblNxdWFyZXNbaW5kZXhdXG4gICAgICAgICBuZXdDb2xsZWN0aW9uID0gaW5zdHJ1bWVudE1vZGVsLmdldCAncGF0dGVyblNxdWFyZXMnXG5cbiAgICAgICAgICMgVXBkYXRlIHRyYWNrIC8gaW5zdHJ1bWVudCBsZXZlbCBwcm9wZXJ0aWVzIGxpa2Ugdm9sdW1lIC8gbXV0ZSAvIGZvY3VzXG4gICAgICAgICBvbGRQcm9wcyA9IG9sZEluc3RydW1lbnRDb2xsZWN0aW9uLmF0KGluZGV4KVxuXG4gICAgICAgICB1bmxlc3Mgb2xkUHJvcHMgaXMgdW5kZWZpbmVkXG5cbiAgICAgICAgICAgIG9sZFByb3BzID0gb2xkUHJvcHMudG9KU09OKClcblxuICAgICAgICAgICAgaW5zdHJ1bWVudE1vZGVsLnNldFxuICAgICAgICAgICAgICAgdm9sdW1lOiBvbGRQcm9wcy52b2x1bWVcbiAgICAgICAgICAgICAgIGFjdGl2ZTogb2xkUHJvcHMuYWN0aXZlXG4gICAgICAgICAgICAgICBtdXRlOiAgIG9sZFByb3BzLm11dGVcbiAgICAgICAgICAgICAgIGZvY3VzOiAgb2xkUHJvcHMuZm9jdXNcblxuICAgICAgICAgIyBDaGVjayBmb3IgaW5jb25zaXN0YW5jaWVzIGJldHdlZW4gbnVtYmVyIG9mIGluc3RydW1lbnRzXG4gICAgICAgICB1bmxlc3Mgb2xkQ29sbGVjdGlvbiBpcyB1bmRlZmluZWRcblxuICAgICAgICAgICAgbmV3Q29sbGVjdGlvbi5lYWNoIChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgLT5cbiAgICAgICAgICAgICAgIG9sZFBhdHRlcm5TcXVhcmUgPSBvbGRDb2xsZWN0aW9uLmF0IGluZGV4XG4gICAgICAgICAgICAgICBwYXR0ZXJuU3F1YXJlLnNldCBvbGRQYXR0ZXJuU3F1YXJlLnRvSlNPTigpXG5cblxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIGZvY3VzIGNoYW5nZSBldmVudHMuICBJdGVyYXRlcyBvdmVyIGFsbCBvZiB0aGUgbW9kZWxzIHdpdGhpblxuICAgIyB0aGUgSW5zdHJ1bWVudENvbGxlY3Rpb24gYW5kIHRvZ2dsZXMgdGhlaXIgZm9jdXMgdG8gb2ZmIGlmIHRoZSBjaGFuZ2VkXG4gICAjIG1vZGVsJ3MgZm9jdXMgaXMgc2V0IHRvIHRydWUuXG4gICAjIEBwYXJhbSB7SW5zdHJ1bWVudE1vZGVsfSBtb2RlbFxuXG4gICBvbkZvY3VzQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgICBAY29sbGVjdGlvbi5lYWNoIChpbnN0cnVtZW50TW9kZWwpID0+XG4gICAgICAgICBpZiBtb2RlbC5jaGFuZ2VkLmZvY3VzIGlzIHRydWVcbiAgICAgICAgICAgIGlmIG1vZGVsLmNpZCBpc250IGluc3RydW1lbnRNb2RlbC5jaWRcbiAgICAgICAgICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXQgJ2ZvY3VzJywgZmFsc2VcblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZXF1ZW5jZXIiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIjtcblxuXG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cblxuICBidWZmZXIgKz0gXCI8dGQgY2xhc3M9J2xhYmVsLWluc3RydW1lbnQnPlxcblx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXG48L3RkPlxcbjx0ZCBjbGFzcz0nYnRuLW11dGUnPlxcblx0bXV0ZVxcbjwvdGQ+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc3RhY2syLCBvcHRpb25zLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblx0XHRcdDx0aCBjbGFzcz0nc3RlcHBlcic+PC90aD5cXG5cdFx0XCI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8dGFibGUgY2xhc3M9J3NlcXVlbmNlcic+XFxuXHQ8dHI+XFxuXHRcdDx0aD48L3RoPlxcblx0XHQ8dGg+PC90aD5cXG5cXG5cdFx0XCI7XG4gIG9wdGlvbnMgPSB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX07XG4gIHN0YWNrMiA9ICgoc3RhY2sxID0gaGVscGVycy5yZXBlYXQgfHwgZGVwdGgwLnJlcGVhdCksc3RhY2sxID8gc3RhY2sxLmNhbGwoZGVwdGgwLCA4LCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwicmVwZWF0XCIsIDgsIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC90cj5cXG5cXG48L3RhYmxlPlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWRlY3JlYXNlJz5ERUNSRUFTRTwvYnV0dG9uPlxcbjxzcGFuIGNsYXNzPSdsYWJlbC1icG0nPjA8L3NwYW4+XFxuPGJ1dHRvbiBjbGFzcz0nYnRuLWluY3JlYXNlJz5JTkNSRUFTRTwvYnV0dG9uPlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0nYnRuLWxlZnQnPkxFRlQ8L2J1dHRvbj5cXG48c3BhbiBjbGFzcz0nbGFiZWwta2l0Jz5EUlVNIEtJVDwvc3Bhbj5cXG48YnV0dG9uIGNsYXNzPSdidG4tcmlnaHQnPlJJR0hUPC9idXR0b24+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdjb250YWluZXIta2l0LXNlbGVjdG9yJz5cXG5cdDxkaXYgY2xhc3M9J2tpdC1zZWxlY3Rvcic+PC9kaXY+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz0nY29udGFpbmVyLXZpc3VhbGl6YXRpb24nPlZpc3VhbGl6YXRpb248L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPSdjb250YWluZXItc2VxdWVuY2VyJz5cXG5cXG5cdDxkaXYgY2xhc3M9J2luc3RydW1lbnQtc2VsZWN0b3InPkluc3RydW1lbnQgU2VsZWN0b3I8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J3NlcXVlbmNlcic+U2VxdWVuY2VyPC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPSdicG0nPkJQTTwvZGl2Plxcblx0PGRpdiBjbGFzcz0nYnRuLXNoYXJlJz5TSEFSRTwvZGl2PlxcblxcbjwvZGl2PlwiO1xuICB9KSIsIiMjIypcbiAqIExhbmRpbmcgdmlldyB3aXRoIHN0YXJ0IGJ1dHRvbiBhbmQgaW5pdGlhbCBhbmltYXRpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5QdWJTdWIgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL1B1YlN1YidcblB1YkV2ZW50ID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9sYW5kaW5nLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBMYW5kaW5nVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gICBldmVudHM6XG4gICAgICAndG91Y2hlbmQgLnN0YXJ0LWJ0bic6ICdvblN0YXJ0QnRuQ2xpY2snXG5cblxuICAgb25TdGFydEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgICBQdWJTdWIudHJpZ2dlciBQdWJFdmVudC5ST1VURSxcbiAgICAgICAgIHJvdXRlOiAnY3JlYXRlJ1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYW5kaW5nVmlldyIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPHNwYW4gY2xhc3M9J3N0YXJ0LWJ0bic+Q1JFQVRFPC9zcGFuPlwiO1xuICB9KSIsIiMjIypcbiAqIFNoYXJlIHRoZSB1c2VyIGNyZWF0ZWQgYmVhdFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zaGFyZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgU2hhcmVWaWV3IGV4dGVuZHMgVmlld1xuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gU2hhcmVWaWV3IiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8YSBocmVmPScvIyc+TkVXPC9hPlwiO1xuICB9KSIsIiMjIypcbiAqIExhbmRpbmcgdmlldyB3aXRoIHN0YXJ0IGJ1dHRvbiBhbmQgaW5pdGlhbCBhbmltYXRpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZXN0cy10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgVGVzdHNWaWV3IGV4dGVuZHMgVmlld1xuXG4gICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RzVmlldyIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGgxPkNvbXBvbmVudCBWaWV3ZXI8L2gxPlxcblxcbjxiciAvPlxcbjxwPlxcblx0TWFrZSBzdXJlIHRoYXQgPGI+aHR0cHN0ZXI8L2I+IGlzIHJ1bm5pbmcgaW4gdGhlIDxiPnNvdXJjZTwvYj4gcm91dGUgKG5wbSBpbnN0YWxsIC1nIGh0dHBzdGVyKSA8YnIvPlxcblx0PGEgaHJlZj1cXFwiaHR0cDovL2xvY2FsaG9zdDozMzMzL3Rlc3QvaHRtbC9cXFwiPk1vY2hhIFRlc3QgUnVubmVyPC9hPlxcbjwvcD5cXG5cXG48YnIgLz5cXG48dWw+XFxuXHQ8bGk+PGEgaHJlZj0nI2tpdC1zZWxlY3Rpb24nPktpdCBTZWxlY3Rpb248L2E+PC9saT5cXG5cdDxsaT48YSBocmVmPVxcXCIjYnBtLWluZGljYXRvclxcXCI+QlBNIEluZGljYXRvcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNpbnN0cnVtZW50LXNlbGVjdG9yXFxcIj5JbnN0cnVtZW50IFNlbGVjdG9yPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI3BhdHRlcm4tc3F1YXJlXFxcIj5QYXR0ZXJuIFNxdWFyZTwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNwYXR0ZXJuLXRyYWNrXFxcIj5QYXR0ZXJuIFRyYWNrPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI3NlcXVlbmNlclxcXCI+U2VxdWVuY2VyPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2Z1bGwtc2VxdWVuY2VyXFxcIj5GdWxsIFNlcXVlbmNlcjwvYT48L2xpPlxcblx0PGxpPjxhIGhyZWY9XFxcIiNwYWQtc3F1YXJlXFxcIj5QYWQgU3F1YXJlPC9hPjwvbGk+XFxuXHQ8bGk+PGEgaHJlZj1cXFwiI2xpdmUtcGFkXFxcIj5MaXZlUGFkPC9hPjwvbGk+XFxuPC91bD5cIjtcbiAgfSkiLCJcbmRlc2NyaWJlICdNb2RlbHMnLCA9PlxuXG4gICByZXF1aXJlICcuL3NwZWMvbW9kZWxzL0tpdENvbGxlY3Rpb24tc3BlYy5jb2ZmZWUnXG4gICByZXF1aXJlICcuL3NwZWMvbW9kZWxzL0tpdE1vZGVsLXNwZWMuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdWaWV3cycsID0+XG5cbiAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LXNwZWMuY29mZmVlJ1xuICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0tpdFNlbGVjdG9yLXNwZWMuY29mZmVlJ1xuICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci1zcGVjLmNvZmZlZSdcblxuXG4gICBkZXNjcmliZSAnTGl2ZSBQYWQnLCA9PlxuXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL1BhZFNxdWFyZS1zcGVjLmNvZmZlZSdcbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvTGl2ZVBhZC1zcGVjLmNvZmZlZSdcblxuXG4gICBkZXNjcmliZSAnSW5zdHJ1bWVudCBTZWxlY3RvcicsID0+XG5cbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC1zcGVjLmNvZmZlZSdcbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50LXNwZWMuY29mZmVlJ1xuXG5cbiAgIGRlc2NyaWJlICdTZXF1ZW5jZXInLCA9PlxuXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUtc3BlYy5jb2ZmZWUnXG4gICAgICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay1zcGVjLmNvZmZlZSdcbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLXNwZWMuY29mZmVlJ1xuXG5cblxucmVxdWlyZSAnLi9zcGVjL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy1zcGVjLmNvZmZlZSdcbnJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy1zcGVjLmNvZmZlZSdcblxucmVxdWlyZSAnLi9zcGVjL21vZGVscy9Tb3VuZENvbGxlY3Rpb24tc3BlYy5jb2ZmZWUnXG5yZXF1aXJlICcuL3NwZWMvbW9kZWxzL1NvdW5kTW9kZWwtc3BlYy5jb2ZmZWUnXG5cbiMgQ29udHJvbGxlcnNcbnJlcXVpcmUgJy4vc3BlYy9BcHBDb250cm9sbGVyLXNwZWMuY29mZmVlJ1xuIiwiQXBwQ29udHJvbGxlciA9IHJlcXVpcmUgJy4uLy4uL3NyYy9zY3JpcHRzL0FwcENvbnRyb2xsZXIuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdBcHAgQ29udHJvbGxlcicsIC0+XG5cbiAgIGl0ICdTaG91bGQgaW5pdGlhbGl6ZScsID0+IiwiQXBwQ29uZmlnICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuXG5kZXNjcmliZSAnS2l0IENvbGxlY3Rpb24nLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG5cbiAgIGl0ICdTaG91bGQgcGFyc2UgdGhlIHJlc3BvbnNlIGFuZCBhcHBlbmQgYW4gYXNzZXRQYXRoIHRvIGVhY2gga2l0IG1vZGVsJywgPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgncGF0aCcpLnNob3VsZC5leGlzdFxuXG5cbiAgIGl0ICdTaG91bGQgcmV0dXJuIHRoZSBuZXh0IGtpdCcsID0+XG4gICAgICBraXREYXRhID0gQGtpdENvbGxlY3Rpb24udG9KU09OKClcbiAgICAgIGtpdCA9IEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuICAgICAga2l0LmdldCgnbGFiZWwnKS5zaG91bGQuZXF1YWwga2l0RGF0YVsxXS5sYWJlbFxuXG5cbiAgIGl0ICdTaG91bGQgcmV0dXJuIHRoZSBwcmV2aW91cyBraXQnLCA9PlxuICAgICAga2l0RGF0YSA9IEBraXRDb2xsZWN0aW9uLnRvSlNPTigpXG4gICAgICBraXQgPSBAa2l0Q29sbGVjdGlvbi5wcmV2aW91c0tpdCgpXG4gICAgICBraXQuZ2V0KCdsYWJlbCcpLnNob3VsZC5lcXVhbCBraXREYXRhW2tpdERhdGEubGVuZ3RoLTFdLmxhYmVsIiwiQXBwQ29uZmlnICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0TW9kZWwgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSdcbkluc3RydW1lbnRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cbmRlc2NyaWJlICdLaXQgTW9kZWwnLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG5cbiAgICAgIGRhdGEgPSB7XG4gICAgICAgICBcImxhYmVsXCI6IFwiSGlwIEhvcFwiLFxuICAgICAgICAgXCJmb2xkZXJcIjogXCJoaXAtaG9wXCIsXG4gICAgICAgICBcImluc3RydW1lbnRzXCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJDbG9zZWQgSGlIYXRcIixcbiAgICAgICAgICAgICAgIFwic3JjXCI6IFwiSEFUXzIubXAzXCIsXG4gICAgICAgICAgICAgICBcImljb25cIjogXCJpY29uLWhpaGF0LWNsb3NlZFwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIktpY2sgRHJ1bVwiLFxuICAgICAgICAgICAgICAgXCJzcmNcIjogXCJLSUtfMi5tcDNcIixcbiAgICAgICAgICAgICAgIFwiaWNvblwiOiBcImljb24ta2lja2RydW1cIlxuICAgICAgICAgICAgfVxuICAgICAgICAgXVxuICAgICAgfVxuXG4gICAgICBAa2l0TW9kZWwgPSBuZXcgS2l0TW9kZWwgZGF0YSwgeyBwYXJzZTogdHJ1ZSB9XG5cblxuICAgaXQgJ1Nob3VsZCBwYXJzZSB0aGUgbW9kZWwgZGF0YSBhbmQgY29udmVydCBpbnN0cnVtZW50cyB0byBhbiBJbnN0cnVtZW50c0NvbGxlY3Rpb24nLCA9PlxuICAgICAgQGtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKS5zaG91bGQuYmUuYW4uaW5zdGFuY2VvZiBJbnN0cnVtZW50Q29sbGVjdGlvbiIsIlxuXG5kZXNjcmliZSAnU291bmQgQ29sbGVjdGlvbicsIC0+XG5cbiAgIGl0ICdTaG91bGQgaW5pdGlhbGl6ZSB3aXRoIGEgc291bmQgc2V0JywgPT4iLCJcblxuZGVzY3JpYmUgJ1NvdW5kIE1vZGVsJywgLT5cblxuICAgaXQgJ1Nob3VsZCBpbml0aWFsaXplIHdpdGggZGVmYXVsdCBjb25maWcgcHJvcGVydGllcycsID0+IiwiQXBwQ29uZmlnID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwTW9kZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5DcmVhdGVWaWV3ID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LmNvZmZlZSdcblxuXG5kZXNjcmliZSAnQ3JlYXRlIFZpZXcnLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQHZpZXcgID0gbmV3IENyZWF0ZVZpZXdcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5lbCkudG8uZXhpc3QiLCJCUE1JbmRpY2F0b3IgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xuQXBwTW9kZWwgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbkFwcEV2ZW50ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5BcHBDb25maWcgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblxuZGVzY3JpYmUgJ0JQTSBJbmRpY2F0b3InLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IEJQTUluZGljYXRvclxuICAgICAgICAgYXBwTW9kZWw6IG5ldyBBcHBNb2RlbCgpXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBpZiBAdmlldy51cGRhdGVJbnRlcnZhbCB0aGVuIGNsZWFySW50ZXJ2YWwgQHZpZXcudXBkYXRlSW50ZXJ2YWxcbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG5cbiAgICAgIEB2aWV3LnNob3VsZC5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCBkaXNwbGF5IHRoZSBjdXJyZW50IEJQTSBpbiB0aGUgbGFiZWwnLCA9PlxuXG4gICAgICAkbGFiZWwgPSBAdmlldy4kZWwuZmluZCAnLmxhYmVsLWJwbSdcbiAgICAgICRsYWJlbC50ZXh0KCkuc2hvdWxkLmVxdWFsIFN0cmluZyg2MDAwMCAvIEB2aWV3LmFwcE1vZGVsLmdldCgnYnBtJykpXG5cblxuXG4gICAjIGl0ICdTaG91bGQgYXV0by1hZHZhbmNlIHRoZSBicG0gdmlhIHNldEludGVydmFsIG9uIHByZXNzJywgKGRvbmUpID0+XG5cbiAgICMgICAgQHZpZXcuYnBtSW5jcmVhc2VBbW91bnQgPSA1MFxuICAgIyAgICBAdmlldy5pbnRlcnZhbFVwZGF0ZVRpbWUgPSAxXG4gICAjICAgIGFwcE1vZGVsID0gQHZpZXcuYXBwTW9kZWxcbiAgICMgICAgYXBwTW9kZWwuc2V0ICdicG0nLCAxXG5cbiAgICMgICAgc2V0VGltZW91dCA9PlxuICAgIyAgICAgICBicG0gPSBhcHBNb2RlbC5nZXQgJ2JwbSdcblxuICAgIyAgICAgICBpZiBicG0gPj0gMTIwXG4gICAjICAgICAgICAgIEB2aWV3Lm9uQnRuVXAoKVxuICAgIyAgICAgICAgICBkb25lKClcbiAgICMgICAgLCAxMDBcblxuICAgIyAgICBAdmlldy5vbkluY3JlYXNlQnRuRG93bigpXG5cblxuXG4gICAjIGl0ICdTaG91bGQgY2xlYXIgdGhlIGludGVydmFsIG9uIHJlbGVhc2UnLCA9PlxuXG4gICAjICAgIEB2aWV3Lm9uSW5jcmVhc2VCdG5Eb3duKClcbiAgICMgICAgQHZpZXcudXBkYXRlSW50ZXJ2YWwuc2hvdWxkLmV4aXN0XG4gICAjICAgIEB2aWV3Lm9uQnRuVXAoKVxuICAgIyAgICBleHBlY3QoQHZpZXcudXBkYXRlSW50ZXJ2YWwpLnRvLmJlLm51bGxcblxuIiwiQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRTZWxlY3RvciAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3IuY29mZmVlJ1xuQXBwTW9kZWwgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdLaXQgU2VsZWN0aW9uJywgLT5cblxuXG4gICBiZWZvcmUgPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cblxuICAgICAgQHZpZXcgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG5cbiAgICAgIEB2aWV3LiRlbC5zaG91bGQuZXhpc3RcblxuXG5cblxuICAgaXQgJ1Nob3VsZCBoYXZlIGEgbGFiZWwnLCA9PlxuXG4gICAgICAkbGFiZWwgPSBAdmlldy4kZWwuZmluZCAnLmxhYmVsLWtpdCdcbiAgICAgICRsYWJlbC5zaG91bGQuZXhpc3RcblxuXG5cblxuICAgaXQgJ1Nob3VsZCB1cGRhdGUgdGhlIEFwcE1vZGVsIGEga2l0IGlzIGNoYW5nZWQnLCA9PlxuXG4gICAgICAkbGFiZWwgPSBAdmlldy4kZWwuZmluZCAnLmxhYmVsLWtpdCdcbiAgICAgIGZpcnN0TGFiZWwgPSBAdmlldy5raXRDb2xsZWN0aW9uLmF0KDApLmdldCAnbGFiZWwnXG4gICAgICBsYXN0TGFiZWwgID0gQHZpZXcua2l0Q29sbGVjdGlvbi5hdChAdmlldy5raXRDb2xsZWN0aW9uLmxlbmd0aC0xKS5nZXQgJ2xhYmVsJ1xuXG4gICAgICBhcHBNb2RlbCA9IEB2aWV3LmFwcE1vZGVsXG5cbiAgICAgIGFwcE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6a2l0TW9kZWwnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5vbkxlZnRCdG5DbGljaygpXG4gICAgICAgICAkbGFiZWwudGV4dCgpLnNob3VsZC5lcXVhbCBsYXN0TGFiZWxcblxuICAgICAgYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpraXRNb2RlbCcpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm9uUmlnaHRCdG5DbGljaygpXG4gICAgICAgICAkbGFiZWwudGV4dCgpLnNob3VsZC5lcXVhbCBmaXJzdExhYmVsXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4iLCJJbnN0cnVtZW50ID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQuY29mZmVlJ1xuS2l0TW9kZWwgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRNb2RlbC5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0luc3RydW1lbnQnLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IEluc3RydW1lbnRcbiAgICAgICAgIGtpdE1vZGVsOiBuZXcgS2l0TW9kZWwoKVxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIEB2aWV3LnNob3VsZC5leGlzdFxuXG5cbiAgIGl0ICdTaG91bGQgYWxsb3cgdXNlciB0byBzZWxlY3QgaW5zdHJ1bWVudHMnLCA9PlxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBleHBlY3QoQHZpZXcuJGVsLmhhc0NsYXNzKCdzZWxlY3RlZCcpKS50by5iZS50cnVlIiwiSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlJ1xuQXBwQ29uZmlnICAgICAgICAgICAgICAgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwTW9kZWwgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uICAgICAgICAgICAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0luc3RydW1lbnQgU2VsZWN0aW9uIFBhbmVsJywgLT5cblxuXG4gICBiZWZvcmUgPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsKClcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQHZpZXcgPSBuZXcgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWxcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuc2hvdWxkLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIHJlZmVyIHRvIHRoZSBjdXJyZW50IEtpdE1vZGVsIHdoZW4gaW5zdGFudGlhdGluZyBzb3VuZHMnLCA9PlxuXG4gICAgICBleHBlY3QoQHZpZXcua2l0TW9kZWwpLnRvLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIGl0ZXJhdGUgb3ZlciBhbGwgb2YgdGhlIHNvdW5kcyBpbiB0aGUgU291bmRDb2xsZWN0aW9uIHRvIGJ1aWxkIG91dCBpbnN0cnVtZW50cycsID0+XG5cbiAgICAgIEB2aWV3LmtpdE1vZGVsLnRvSlNPTigpLmluc3RydW1lbnRzLmxlbmd0aC5zaG91bGQuYmUuYWJvdmUoMClcblxuICAgICAgJGluc3RydW1lbnRzID0gQHZpZXcuJGVsLmZpbmQoJy5jb250YWluZXItaW5zdHJ1bWVudHMnKS5maW5kKCcuaW5zdHJ1bWVudCcpXG4gICAgICAkaW5zdHJ1bWVudHMubGVuZ3RoLnNob3VsZC5iZS5hYm92ZSgwKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZWJ1aWxkIHZpZXcgd2hlbiB0aGUga2l0TW9kZWwgY2hhbmdlcycsID0+XG5cbiAgICAgIGtpdE1vZGVsID0gQHZpZXcuYXBwTW9kZWwuZ2V0ICdraXRNb2RlbCdcbiAgICAgIGxlbmd0aCA9IGtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKS50b0pTT04oKS5sZW5ndGhcblxuICAgICAgJGluc3RydW1lbnRzID0gQHZpZXcuJGVsLmZpbmQoJy5jb250YWluZXItaW5zdHJ1bWVudHMnKS5maW5kKCcuaW5zdHJ1bWVudCcpXG4gICAgICAkaW5zdHJ1bWVudHMubGVuZ3RoLnNob3VsZC5iZS5lcXVhbChsZW5ndGgpXG5cbiAgICAgIEB2aWV3LmFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5uZXh0S2l0KClcblxuICAgICAga2l0TW9kZWwgPSBAdmlldy5hcHBNb2RlbC5nZXQgJ2tpdE1vZGVsJ1xuICAgICAgbGVuZ3RoID0ga2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLnRvSlNPTigpLmxlbmd0aFxuXG4gICAgICAkaW5zdHJ1bWVudHMgPSBAdmlldy4kZWwuZmluZCgnLmNvbnRhaW5lci1pbnN0cnVtZW50cycpLmZpbmQoJy5pbnN0cnVtZW50JylcbiAgICAgICRpbnN0cnVtZW50cy5sZW5ndGguc2hvdWxkLmJlLmVxdWFsKGxlbmd0aClcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBzZWxlY3Rpb25zIGZyb20gSW5zdHJ1bWVudCBpbnN0YW5jZXMgYW5kIHVwZGF0ZSB0aGUgbW9kZWwnLCA9PlxuXG4gICAgICBAdmlldy5raXRNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50Jykud2hlbiA9PlxuICAgICAgICAgQHZpZXcuaW5zdHJ1bWVudFZpZXdzWzBdLm9uQ2xpY2soKVxuXG4gICAgICAgICAkc2VsZWN0ZWQgPSBAdmlldy4kZWwuZmluZCgnLmNvbnRhaW5lci1pbnN0cnVtZW50cycpLmZpbmQoJy5zZWxlY3RlZCcpXG4gICAgICAgICAkc2VsZWN0ZWQubGVuZ3RoLnNob3VsZC5lcXVhbCAxXG5cblxuXG4iLCJBcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuUGFkU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYWRTcXVhcmUgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvUGFkU3F1YXJlLmNvZmZlZSdcbkxpdmVQYWQgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvTGl2ZVBhZC5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0xpdmUgUGFkJywgLT5cblxuICAgYmVmb3JlID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBMaXZlUGFkXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuICAgICAgICAgY29sbGVjdGlvbjogbmV3IFBhZFNxdWFyZUNvbGxlY3Rpb24oKVxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IHBhZCBzcXVhcmVzJywgPT5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcucGFkLXNxdWFyZScpLmxlbmd0aC5zaG91bGQuZXF1YWwgMTZcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciBvdXQgdGhlIGVudGlyZSBraXQgY29sbGVjdGlvbicsID0+XG4gICAgICBsZW4gPSAwXG5cbiAgICAgIEB2aWV3LmtpdENvbGxlY3Rpb24uZWFjaCAoa2l0LCBpbmRleCkgLT5cbiAgICAgICAgIGluZGV4ID0gaW5kZXggKyAxXG4gICAgICAgICBsZW4gPSBraXQuZ2V0KCdpbnN0cnVtZW50cycpLmxlbmd0aCAqIGluZGV4XG5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcuaW5zdHJ1bWVudCcpLmxlbmd0aC5zaG91bGQuZXF1YWwgbGVuICsgMVxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIHRvIGRyb3BzIGZyb20gdGhlIGtpdHMgdG8gdGhlIHBhZHMnLCA9PlxuICAgICAgQHZpZXcuY29sbGVjdGlvbi5zaG91bGQudHJpZ2dlcignY2hhbmdlOmRyb3BwZWQnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5wYWRTcXVhcmVWaWV3c1swXS5vbkRyb3AoKVxuXG5cbiAgIGl0ICdTaG91bGQgdXBkYXRlIHRoZSBQYWRTcXVhcmVDb2xsZWN0aW9uIHdpdGggdGhlIGN1cnJlbnQga2l0IHdoZW4gZHJvcHBlZCcsID0+XG4gICAgICBAdmlldy5jb2xsZWN0aW9uLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6aW5zdHJ1bWVudCcpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnBhZFNxdWFyZVZpZXdzWzBdLnNldFNvdW5kKCkiLCJBcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuUGFkU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYWRTcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGFkU3F1YXJlID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL1BhZFNxdWFyZS5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1BhZCBTcXVhcmUnLCAtPlxuXG4gICBiZWZvcmUgPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IFBhZFNxdWFyZVxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cbiAgICAgICAgIG1vZGVsOiBuZXcgUGFkU3F1YXJlTW9kZWwoKVxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IHRoZSBhcHByb3ByaWF0ZSBrZXktY29kZSB0cmlnZ2VyJywgPT5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcua2V5LWNvZGUnKS5sZW5ndGguc2hvdWxkLmVxdWFsIDFcblxuXG4gICBpdCAnU2hvdWxkIHRyaWdnZXIgYSBwbGF5IGFjdGlvbiBvbiB0YXAnLCA9PlxuICAgICAgQHZpZXcubW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTp0cmlnZ2VyJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcub25DbGljaygpXG5cblxuICAgaXQgJ1Nob3VsZCBhY2NlcHQgYSBkcm9wcGFibGUgdmlzdWFsIGVsZW1lbnQnLCA9PlxuICAgICAgQHZpZXcubW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpkcm9wcGVkJykud2hlbiA9PlxuICAgICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG5cbiAgICAgICAgIEB2aWV3Lm9uRHJvcCBpZFxuXG5cbiAgIGl0ICdTaG91bGQgdHJpZ2dlciBpbnN0cnVtZW50IGNoYW5nZSBvbiBkcm9wJywgPT5cbiAgICAgICBAdmlldy5tb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50Jykud2hlbiA9PlxuICAgICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG5cbiAgICAgICAgIEB2aWV3Lm9uRHJvcCBpZFxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIG91dCBhIHNvdW5kIGljb24gd2hlbiBkcm9wcGVkJywgPT5cblxuICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICBAdmlldy5vbkRyb3AgaWRcblxuICAgICAgaWNvbiA9IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2ljb24nKVxuXG4gICAgICBAdmlldy4kZWwuZmluZCgnLicgKyBpY29uKS5sZW5ndGguc2hvdWxkLmVxdWFsIDFcblxuXG4gICBpdCAnU2hvdWxkIHJlbGVhc2UgdGhlIGRyb3BwYWJsZSB2aXN1YWwgZWxlbWVudCBvbiBwcmVzcy1ob2xkJywgPT5cbiAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6ZHJhZ2dpbmcnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5vbkhvbGQoKVxuXG5cbiAgIGl0ICdTaG91bGQgc2V0IHRoZSBzb3VuZCBiYXNlZCB1cG9uIHRoZSBkcm9wcGVkIHZpc3VhbCBlbGVtZW50JywgPT5cblxuICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICBAdmlldy5vbkRyb3AgaWRcblxuICAgICAgZXhwZWN0KEB2aWV3LmF1ZGlvUGxheWJhY2spLnRvLm5vdC5lcXVhbCB1bmRlZmluZWRcblxuXG4gICBpdCAnU2hvdWxkIGNsZWFyIHRoZSBzb3VuZCB3aGVuIHRoZSBkcm9wcGFibGUgZWxlbWVudCBpcyBkaXNwb3NlZCBvZicsID0+XG4gICAgICBpZCA9IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2lkJylcbiAgICAgIEB2aWV3Lm9uRHJvcCBpZFxuXG4gICAgICBAdmlldy5tb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50Jykud2hlbiA9PlxuICAgICAgICAgQHZpZXcucmVtb3ZlU291bmQoKVxuXG5cbiAgIGl0ICdTaG91bGQgY2xlYXIgdGhlIGljb24gd2hlbiB0aGUgZHJvcHBhYmxlIGVsZW1lbnQgaXMgZGlzcG9zZWQgb2YnLCA9PlxuICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICBAdmlldy5vbkRyb3AgaWRcblxuICAgICAgaWNvbiA9IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2ljb24nKVxuICAgICAgQHZpZXcuJGVsLmZpbmQoJy4nICsgaWNvbikubGVuZ3RoLnNob3VsZC5lcXVhbCAxXG5cbiAgICAgIEB2aWV3LnJlbW92ZVNvdW5kKClcbiAgICAgIEB2aWV3LiRlbC5maW5kKCcuJyArIGljb24pLmxlbmd0aC5zaG91bGQuZXF1YWwgMFxuXG5cblxuXG5cblxuXG5cbiIsIkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwTW9kZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGF0dGVyblNxdWFyZSA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1BhdHRlcm4gU3F1YXJlJywgLT5cblxuICAgYmVmb3JlID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuXG4gICBiZWZvcmVFYWNoID0+XG5cbiAgICAgIG1vZGVsID0gbmV3IFBhdHRlcm5TcXVhcmVNb2RlbFxuICAgICAgICAgJ2luc3RydW1lbnQnOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMClcblxuICAgICAgQHZpZXcgPSBuZXcgUGF0dGVyblNxdWFyZVxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgcGF0dGVyblNxdWFyZU1vZGVsOiBtb2RlbFxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIEB2aWV3LiRlbC5zaG91bGQuZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgY3ljbGUgdGhyb3VnaCB2ZWxvY2l0eSB2b2x1bWVzJywgPT5cblxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAxXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ3ZlbG9jaXR5LWxvdycpLnNob3VsZC5iZS50cnVlXG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgMlxuICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKCd2ZWxvY2l0eS1tZWRpdW0nKS5zaG91bGQuYmUudHJ1ZVxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ3ZlbG9jaXR5Jykuc2hvdWxkLmVxdWFsIDNcbiAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygndmVsb2NpdHktaGlnaCcpLnNob3VsZC5iZS50cnVlXG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgMFxuICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKCd2ZWxvY2l0eS1oaWdoJykuc2hvdWxkLmJlLmZhbHNlXG5cblxuXG4gICBpdCAnU2hvdWxkIHRvZ2dsZSBvZmYnLCA9PlxuXG4gICAgICBAdmlldy5kaXNhYmxlKClcbiAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ3ZlbG9jaXR5Jykuc2hvdWxkLmVxdWFsIDBcblxuXG5cbiAgIGl0ICdTaG91bGQgdG9nZ2xlIG9uJywgPT5cblxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuXG5cbiAgICAgIEB2aWV3LmRpc2FibGUoKVxuICAgICAgQHZpZXcuZW5hYmxlKClcbiAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ3ZlbG9jaXR5Jykuc2hvdWxkLmVxdWFsIDFcbiIsIlxuQXBwQ29uZmlnID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwTW9kZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYXR0ZXJuVHJhY2sgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay5jb2ZmZWUnXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuXG5kZXNjcmliZSAnUGF0dGVybiBUcmFjaycsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEB2aWV3ID0gbmV3IFBhdHRlcm5UcmFja1xuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgbW9kZWw6IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKVxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IGNoaWxkIHNxdWFyZXMnLCA9PlxuICAgICAgQHZpZXcuJGVsLmZpbmQoJy5wYXR0ZXJuLXNxdWFyZScpLmxlbmd0aC5zaG91bGQuZXF1YWwgOFxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBwYXR0ZXJuIHNxdWFyZXMnLCA9PlxuICAgICAgQHZpZXcuY29sbGVjdGlvbi5zaG91bGQudHJpZ2dlcignY2hhbmdlOnZlbG9jaXR5Jykud2hlbiA9PlxuICAgICAgICAgQHZpZXcucGF0dGVyblNxdWFyZVZpZXdzWzBdLm9uQ2xpY2soKVxuXG5cbiAgIGl0ICdTaG91bGQgYmUgbXV0YWJsZScsID0+XG4gICAgICBAdmlldy5tb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOm11dGUnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5tdXRlKClcblxuICAgICAgQHZpZXcubW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTptdXRlJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcudW5tdXRlKClcblxuXG4gICBpdCAnU2hvdWxkIGFkZCB2aXN1YWwgbm90aWZpY2F0aW9uIHRoYXQgdHJhY2sgaXMgbXV0ZWQnLCAoZG9uZSkgPT5cbiAgICAgIEB2aWV3Lm1vZGVsLm9uY2UgJ2NoYW5nZTptdXRlJywgKG1vZGVsKSA9PlxuICAgICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKCdtdXRlJykuc2hvdWxkLmJlLnRydWVcblxuICAgICAgQHZpZXcubXV0ZSgpXG5cbiAgICAgIEB2aWV3Lm1vZGVsLm9uY2UgJ2NoYW5nZTptdXRlJywgPT5cbiAgICAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygnbXV0ZScpLnNob3VsZC5iZS5mYWxzZVxuICAgICAgICAgZG9uZSgpXG5cbiAgICAgIEB2aWV3LnVubXV0ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCBiZSBhYmxlIHRvIGZvY3VzIGFuZCB1bmZvY3VzJywgPT5cbiAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6Zm9jdXMnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5vbkxhYmVsQ2xpY2soKVxuXG5cblxuXG4gICBpdCAnU2hvdWxkIHVwZGF0ZSBlYWNoIFBhdHRlcm5TcXVhcmUgbW9kZWwgd2hlbiB0aGUga2l0IGNoYW5nZXMnLCA9PiIsIkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwTW9kZWwgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuU2VxdWVuY2VyID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1NlcXVlbmNlci5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcbmhlbHBlcnMgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycydcblxuXG5kZXNjcmliZSAnU2VxdWVuY2VyJywgLT5cblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAa2l0Q29sbGVjdGlvbiA9IG5ldyBLaXRDb2xsZWN0aW9uXG4gICAgICAgICBwYXJzZTogdHJ1ZVxuXG4gICAgICBAa2l0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICAgICB1cmw6IEFwcENvbmZpZy5yZXR1cm5UZXN0QXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgICAgQHZpZXcgPSBuZXcgU2VxdWVuY2VyXG4gICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnBhdXNlKClcbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciBvdXQgZWFjaCBwYXR0ZXJuIHRyYWNrJywgPT5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcucGF0dGVybi10cmFjaycpLmxlbmd0aC5zaG91bGQuZXF1YWwgQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmxlbmd0aFxuXG5cblxuICAgaXQgJ1Nob3VsZCBjcmVhdGUgYSBicG0gaW50ZXJ2YWwnLCA9PlxuICAgICAgZXhwZWN0KEB2aWV3LmJwbUludGVydmFsKS50by5ub3QuYmUgbnVsbFxuXG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIHBsYXkgLyBwYXVzZSBjaGFuZ2VzIG9uIHRoZSBBcHBNb2RlbCcsID0+XG4gICAgICBAdmlldy5hcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOnBsYXlpbmcnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5wYXVzZSgpXG5cbiAgICAgIEB2aWV3LmFwcE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6cGxheWluZycpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnBsYXkoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIGJwbSBjaGFuZ2VzJywgPT5cbiAgICAgIEB2aWV3LmFwcE1vZGVsLnNldCgnYnBtJywgMjAwKVxuICAgICAgZXhwZWN0KEB2aWV3LnVwZGF0ZUludGVydmFsVGltZSkudG8uZXF1YWwgMjAwXG5cblxuXG4gICBpdCAnU2hvdWxkIGJlIG11dGFibGUnLCA9PlxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTptdXRlJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcubXV0ZSgpXG5cbiAgICAgIEB2aWV3LmFwcE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6bXV0ZScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnVubXV0ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIGxpc3RlbiBmb3IgSW5zdHJ1bWVudFRyYWNrTW9kZWwgZm9jdXMgZXZlbnRzJywgPT5cbiAgICAgIEB2aWV3LmNvbGxlY3Rpb24uc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpmb2N1cycpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnBhdHRlcm5UcmFja1ZpZXdzWzBdLm9uTGFiZWxDbGljaygpXG5cblxuXG5cbiAgIGl0ICdTaG91bGQgdXBkYXRlIGVhY2ggcGF0dGVybiB0cmFjayB3aGVuIHRoZSBraXQgY2hhbmdlcycsID0+IiwiQXBwQ29uZmlnID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcbkFwcENvbnRyb2xsZXIgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvQXBwQ29udHJvbGxlci5jb2ZmZWUnXG5MYW5kaW5nVmlldyAgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXcuY29mZmVlJ1xuXG5kZXNjcmliZSAnTGFuZGluZyBWaWV3JywgLT5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQHZpZXcgPSBuZXcgTGFuZGluZ1ZpZXdcbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG4gICAgICBpZiBAYXBwQ29udHJvbGxlciB0aGVuIEBhcHBDb250cm9sbGVyLnJlbW92ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBleHBlY3QoQHZpZXcuZWwpLnRvLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIHJlZGlyZWN0IHRvIGNyZWF0ZSBwYWdlIG9uIGNsaWNrJywgKGRvbmUpID0+XG5cbiAgICAgIEBhcHBDb250cm9sbGVyID0gbmV3IEFwcENvbnRyb2xsZXJcbiAgICAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICAgIHJvdXRlciA9IEBhcHBDb250cm9sbGVyLmFwcFJvdXRlclxuICAgICAgJHN0YXJ0QnRuID0gQHZpZXcuJGVsLmZpbmQgJy5zdGFydC1idG4nXG5cbiAgICAgICRzdGFydEJ0bi5vbiAnY2xpY2snLCAoZXZlbnQpID0+XG4gICAgICAgICAnY3JlYXRlJy5zaG91bGQucm91dGUudG8gcm91dGVyLCAnY3JlYXRlUm91dGUnXG4gICAgICAgICBkb25lKClcblxuICAgICAgJHN0YXJ0QnRuLmNsaWNrKClcblxuXG5cblxuXG5cblxuXG4iLCJTaGFyZVZpZXcgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSdcblxuXG5kZXNjcmliZSAnU2hhcmUgVmlldycsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IFNoYXJlVmlld1xuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgZXhwZWN0KEB2aWV3LmVsKS50by5leGlzdFxuXG5cbiAgIGl0ICdTaG91bGQgYWNjZXB0IGEgU291bmRTaGFyZSBvYmplY3QnLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIHRoZSB2aXN1YWxpemF0aW9uIGxheWVyJywgPT5cblxuXG4gICBpdCAnU2hvdWxkIHBhdXNlIHBsYXliYWNrIG9mIHRoZSBhdWRpbyB0cmFjayBvbiBpbml0JywgPT5cblxuXG4gICBpdCAnU2hvdWxkIHRvZ2dsZSB0aGUgcGxheSAvIHBhdXNlIGJ1dHRvbicsID0+XG5cblxuICAgaXQgJ1Nob3VsZCBkaXNwbGF5IHRoZSB1c2VycyBzb25nIHRpdGxlIGFuZCB1c2VybmFtZScsID0+XG4iXX0=

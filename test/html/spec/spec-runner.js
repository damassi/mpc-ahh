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
module.exports = require('./lib/visibility.timers.js')

},{"./lib/visibility.timers.js":8}],7:[function(require,module,exports){
;(function (global) {
    "use strict";

    var lastId = -1;

    // Visibility.js allow you to know, that your web page is in the background
    // tab and thus not visible to the user. This library is wrap under
    // Page Visibility API. It fix problems with different vendor prefixes and
    // add high-level useful functions.
    var self = {

        // Call callback only when page become to visible for user or
        // call it now if page is visible now or Page Visibility API
        // doesn’t supported.
        //
        // Return false if API isn’t supported, true if page is already visible
        // or listener ID (you can use it in `unbind` method) if page isn’t
        // visible now.
        //
        //   Visibility.onVisible(function () {
        //       startIntroAnimation();
        //   });
        onVisible: function (callback) {
            var support = self.isSupported();
            if ( !support || !self.hidden() ) {
                callback();
                return support;
            }

            var listener = self.change(function (e, state) {
                if ( !self.hidden() ) {
                    self.unbind(listener);
                    callback();
                }
            });
            return listener;
        },

        // Call callback when visibility will be changed. First argument for
        // callback will be original event object, second will be visibility
        // state name.
        //
        // Return listener ID to unbind listener by `unbind` method.
        //
        // If Page Visibility API doesn’t supported method will be return false
        // and callback never will be called.
        //
        //   Visibility.change(function(e, state) {
        //       Statistics.visibilityChange(state);
        //   });
        //
        // It is just proxy to `visibilitychange` event, but use vendor prefix.
        change: function (callback) {
            if ( !self.isSupported() ) {
                return false;
            }
            lastId += 1;
            var number = lastId;
            self._callbacks[number] = callback;
            self._listen();
            return number;
        },

        // Remove `change` listener by it ID.
        //
        //   var id = Visibility.change(function(e, state) {
        //       firstChangeCallback();
        //       Visibility.unbind(id);
        //   });
        unbind: function (id) {
            delete self._callbacks[id];
        },

        // Call `callback` in any state, expect “prerender”. If current state
        // is “prerender” it will wait until state will be changed.
        // If Page Visibility API doesn’t supported, it will call `callback`
        // immediately.
        //
        // Return false if API isn’t supported, true if page is already after
        // prerendering or listener ID (you can use it in `unbind` method)
        // if page is prerended now.
        //
        //   Visibility.afterPrerendering(function () {
        //       Statistics.countVisitor();
        //   });
        afterPrerendering: function (callback) {
            var support   = self.isSupported();
            var prerender = 'prerender';

            if ( !support || prerender != self.state() ) {
                callback();
                return support;
            }

            var listener = self.change(function (e, state) {
                if ( prerender != state ) {
                    self.unbind(listener);
                    callback();
                }
            });
            return listener;
        },

        // Return true if page now isn’t visible to user.
        //
        //   if ( !Visibility.hidden() ) {
        //       VideoPlayer.play();
        //   }
        //
        // It is just proxy to `document.hidden`, but use vendor prefix.
        hidden: function () {
            return !!(self._doc.hidden || self._doc.webkitHidden);
        },

        // Return visibility state: 'visible', 'hidden' or 'prerender'.
        //
        //   if ( 'prerender' == Visibility.state() ) {
        //       Statistics.pageIsPrerendering();
        //   }
        //
        // Don’t use `Visibility.state()` to detect, is page visible, because
        // visibility states can extend in next API versions.
        // Use more simpler and general `Visibility.hidden()` for this cases.
        //
        // It is just proxy to `document.visibilityState`, but use
        // vendor prefix.
        state: function () {
            return self._doc.visibilityState       ||
                   self._doc.webkitVisibilityState ||
                   'visible';
        },

        // Return true if browser support Page Visibility API.
        //
        //   if ( Visibility.isSupported() ) {
        //       Statistics.startTrackingVisibility();
        //       Visibility.change(function(e, state)) {
        //           Statistics.trackVisibility(state);
        //       });
        //   }
        isSupported: function () {
            return !!(self._doc.visibilityState ||
                      self._doc.webkitVisibilityState);
        },

        // Link to document object to change it in tests.
        _doc: document || {},

        // Callbacks from `change` method, that wait visibility changes.
        _callbacks: { },

        // Listener for `visibilitychange` event.
        _change: function(event) {
            var state = self.state();

            for ( var i in self._callbacks ) {
                self._callbacks[i].call(self._doc, event, state);
            }
        },

        // Set listener for `visibilitychange` event.
        _listen: function () {
            if ( self._init ) {
                return;
            }

            var event = 'visibilitychange';
            if ( self._doc.webkitVisibilityState ) {
                event = 'webkit' + event;
            }

            var listener = function () {
                self._change.apply(self, arguments);
            };
            if ( self._doc.addEventListener ) {
                self._doc.addEventListener(event, listener);
            } else {
                self._doc.attachEvent(event, listener);
            }
            self._init = true;
        }

    };

    if ( typeof(module) != 'undefined' && module.exports ) {
        module.exports = self;
    } else {
        global.Visibility = self;
    }

})(this);

},{}],8:[function(require,module,exports){
;(function (window) {
    "use strict";

    var lastTimer = -1;

    var install = function (Visibility) {

        // Run callback every `interval` milliseconds if page is visible and
        // every `hiddenInterval` milliseconds if page is hidden.
        //
        //   Visibility.every(60 * 1000, 5 * 60 * 1000, function () {
        //       checkNewMails();
        //   });
        //
        // You can skip `hiddenInterval` and callback will be called only if
        // page is visible.
        //
        //   Visibility.every(1000, function () {
        //       updateCountdown();
        //   });
        //
        // It is analog of `setInterval(callback, interval)` but use visibility
        // state.
        //
        // It return timer ID, that you can use in `Visibility.stop(id)` to stop
        // timer (`clearInterval` analog).
        // Warning: timer ID is different from interval ID from `setInterval`,
        // so don’t use it in `clearInterval`.
        //
        // On change state from hidden to visible timers will be execute.
        Visibility.every = function (interval, hiddenInterval, callback) {
            Visibility._time();

            if ( !callback ) {
                callback = hiddenInterval;
                hiddenInterval = null;
            }

            lastTimer += 1;
            var number = lastTimer;

            Visibility._timers[number] = {
                visible:  interval,
                hidden:   hiddenInterval,
                callback: callback
            };
            Visibility._run(number, false);

            if ( Visibility.isSupported() ) {
                Visibility._listen();
            }
            return number;
        };

        // Stop timer from `every` method by it ID (`every` method return it).
        //
        //   slideshow = Visibility.every(5 * 1000, function () {
        //       changeSlide();
        //   });
        //   $('.stopSlideshow').click(function () {
        //       Visibility.stop(slideshow);
        //   });
        Visibility.stop = function(id) {
            if ( !Visibility._timers[id] ) {
                return false;
            }
            Visibility._stop(id);
            delete Visibility._timers[id];
            return true;
        };

        // Callbacks and intervals added by `every` method.
        Visibility._timers = { };

        // Initialize variables on page loading.
        Visibility._time = function () {
            if ( Visibility._timed ) {
                return;
            }
            Visibility._timed     = true;
            Visibility._wasHidden = Visibility.hidden();

            Visibility.change(function () {
                Visibility._stopRun();
                Visibility._wasHidden = Visibility.hidden();
            });
        };

        // Try to run timer from every method by it’s ID. It will be use
        // `interval` or `hiddenInterval` depending on visibility state.
        // If page is hidden and `hiddenInterval` is null,
        // it will not run timer.
        //
        // Argument `runNow` say, that timers must be execute now too.
        Visibility._run = function (id, runNow) {
            var interval,
                timer = Visibility._timers[id];

            if ( Visibility.hidden() ) {
                if ( null === timer.hidden ) {
                    return;
                }
                interval = timer.hidden;
            } else {
                interval = timer.visible;
            }

            var runner = function () {
                timer.last = new Date();
                timer.callback.call(window);
            }

            if ( runNow ) {
                var now  = new Date();
                var last = now - timer.last ;

                if ( interval > last ) {
                    timer.delay = setTimeout(function () {
                        timer.id = setInterval(runner, interval);
                        runner();
                    }, interval - last);
                } else {
                    timer.id = setInterval(runner, interval);
                    runner();
                }

            } else {
              timer.id = setInterval(runner, interval);
            }
        };

        // Stop timer from `every` method by it’s ID.
        Visibility._stop = function (id) {
            var timer = Visibility._timers[id];
            clearInterval(timer.id);
            clearTimeout(timer.delay);
            delete timer.id;
            delete timer.delay;
        };

        // Listener for `visibilitychange` event.
        Visibility._stopRun = function (event) {
            var isHidden  = Visibility.hidden(),
                wasHidden = Visibility._wasHidden;

            if ( (isHidden && !wasHidden) || (!isHidden && wasHidden) ) {
                for ( var i in Visibility._timers ) {
                    Visibility._stop(i);
                    Visibility._run(i, !isHidden);
                }
            }
        };

        return Visibility;
    }

    if ( typeof(module) != 'undefined' && module.exports ) {
        module.exports = install(require('./visibility.core'));
    } else {
        install(window.Visibility)
    }

})(window);

},{"./visibility.core":7}],9:[function(require,module,exports){

/**
 * Primary application controller
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppConfig, AppController, AppEvent, AppRouter, BreakpointManager, BrowserDetect, CreateView, LandingView, NotSupportedView, PubEvent, PubSub, ShareView, SharedTrackModel, View, Visibility, VisualizerView, mainTemplate, observeDom,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Visibility = require('visibilityjs');

AppConfig = require('./config/AppConfig.coffee');

AppEvent = require('./events/AppEvent.coffee');

PubEvent = require('./events/PubEvent.coffee');

SharedTrackModel = require('./models/SharedTrackModel.coffee');

AppRouter = require('./routers/AppRouter.coffee');

BreakpointManager = require('./utils/BreakpointManager.coffee');

PubSub = require('./utils/PubSub');

BrowserDetect = require('./utils/BrowserDetect');

LandingView = require('./views/landing/LandingView.coffee');

CreateView = require('./views/create/CreateView.coffee');

ShareView = require('./views/share/ShareView.coffee');

VisualizerView = require('./views/visualizer/VisualizerView.coffee');

NotSupportedView = require('./views/not-supported/NotSupportedView.coffee');

View = require('./supers/View.coffee');

observeDom = require('./utils/observeDom');

mainTemplate = require('./views/templates/main-template.hbs');

AppController = (function(_super) {
  __extends(AppController, _super);

  function AppController() {
    this.onSaveTrack = __bind(this.onSaveTrack, this);
    this.onCloseShare = __bind(this.onCloseShare, this);
    this.onOpenShare = __bind(this.onOpenShare, this);
    this.onVisibilityChange = __bind(this.onVisibilityChange, this);
    this.onResize = __bind(this.onResize, this);
    this.saveTrack = __bind(this.saveTrack, this);
    this.exportTrackAndSaveToParse = __bind(this.exportTrackAndSaveToParse, this);
    return AppController.__super__.constructor.apply(this, arguments);
  }

  AppController.prototype.id = 'wrapper';

  AppController.prototype.visualizationRendered = false;

  AppController.prototype.parseErrorAttempts = 0;

  AppController.prototype.initialize = function(options) {
    AppController.__super__.initialize.call(this, options);
    this.$body = $('body');
    this.$window = $('window');
    this.breakpointManager = new BreakpointManager({
      breakpoints: AppConfig.BREAKPOINTS,
      scope: this
    });
    this.sharedTrackModel = new SharedTrackModel;
    this.landingView = new LandingView({
      appModel: this.appModel
    });
    this.createView = new CreateView({
      appModel: this.appModel,
      sharedTrackModel: this.sharedTrackModel,
      kitCollection: this.kitCollection
    });
    this.shareView = new ShareView({
      appModel: this.appModel,
      sharedTrackModel: this.sharedTrackModel,
      kitCollection: this.kitCollection
    });
    this.notSupportedView = new NotSupportedView({
      appModel: this.appModel
    });
    this.appRouter = new AppRouter({
      appController: this,
      appModel: this.appModel
    });
    this.isMobile = this.$body.hasClass('mobile');
    this.isTablet = BrowserDetect.deviceDetection().deviceType === 'tablet' ? true : false;
    if (!this.isMobile) {
      this.visualizerView = new VisualizerView({
        appModel: this.appModel
      });
    }
    this.notSupported = false;
    if (this.isMobile && this.notSupported) {
      window.location.hash = 'not-supported';
    }
    return this.addEventListeners();
  };

  AppController.prototype.render = function() {
    var hash;
    this.$body.append(this.$el.html(mainTemplate({
      isDesktop: this.$body.hasClass('desktop')
    })));
    this.$mainContainer = this.$el.find('#container-main');
    this.$topContainer = this.$el.find('#container-top');
    this.$bottomContainer = this.$el.find('#container-bottom');
    TweenLite.set(this.$bottomContainer, {
      y: 300
    });
    if (!this.isMobile) {
      this.$mainContainer.hide();
    }
    if (this.isMobile) {
      hash = window.location.hash;
      if (hash.indexOf('share') === -1 || hash.indexOf('not-supported') === -1) {
        TweenLite.set($('.top-bar'), {
          autoAlpha: 0
        });
        TweenLite.set(this.$mainContainer, {
          y: (window.innerHeight * .5 - this.$mainContainer.height() * .5) - 25
        });
      }
    }
    Backbone.history.start({
      pushState: false
    });
    return this;
  };

  AppController.prototype.renderVisualizationLayer = function() {
    if (this.appModel.get('isMobile')) {
      return;
    }
    if (this.visualizationRendered === false) {
      this.visualizationRendered = true;
      return this.$mainContainer.prepend(this.visualizerView.render().el);
    }
  };

  AppController.prototype.remove = function() {
    var _ref, _ref1, _ref2, _ref3;
    if ((_ref = this.landingView) != null) {
      _ref.remove();
    }
    if ((_ref1 = this.shareView) != null) {
      _ref1.remove();
    }
    if ((_ref2 = this.createView) != null) {
      _ref2.remove();
    }
    if ((_ref3 = this.notSupportedView) != null) {
      _ref3.remove();
    }
    return AppController.__super__.remove.call(this);
  };

  AppController.prototype.addEventListeners = function() {
    this.listenTo(this.appModel, AppEvent.CHANGE_VIEW, this.onViewChange);
    this.listenTo(this.appModel, AppEvent.CHANGE_ISMOBILE, this.onIsMobileChange);
    this.listenTo(this.createView, AppEvent.OPEN_SHARE, this.onOpenShare);
    this.listenTo(this.createView, AppEvent.CLOSE_SHARE, this.onCloseShare);
    this.listenTo(this.createView, AppEvent.SAVE_TRACK, this.onSaveTrack);
    this.listenTo(this.createView, PubEvent.BEAT, this.onBeat);
    this.listenTo(this.shareView, PubEvent.BEAT, this.onBeat);
    this.listenTo(this, AppEvent.BREAKPOINT_MATCH, this.onBreakpointMatch);
    Visibility.change(this.onVisibilityChange);
    if (!this.isMobile) {
      _.delay((function(_this) {
        return function() {
          return observeDom($('.plitems')[0], function() {
            return TweenLite.to(_this.$bottomContainer, .6, {
              y: _this.createView.returnMoveAmount(),
              ease: Expo.easeInOut
            });
          });
        };
      })(this), 500);
    }
    if (AppConfig.ENABLE_ROTATION_LOCK) {
      return $(window).on('resize', this.onResize);
    }
  };

  AppController.prototype.removeEventListeners = function() {
    $(window).off('resize', this.onResize);
    return AppController.__super__.removeEventListeners.call(this);
  };

  AppController.prototype.expandVisualization = function() {
    if (!this.isMobile) {
      if (this.appModel.get('view') instanceof CreateView) {
        this.createView.hideUI();
      }
      return this.visualizerView.scaleUp();
    }
  };

  AppController.prototype.contractVisualization = function() {
    if (!this.isMobile) {
      if (this.appModel.get('view') instanceof CreateView) {
        this.createView.showUI();
      }
      return this.visualizerView.scaleDown();
    }
  };

  AppController.prototype.exportTrackAndSaveToParse = function() {
    var instruments, kit, patternSquareGroups, patternSquares;
    patternSquareGroups = [];
    patternSquares = [];
    instruments = this.appModel["export"]().kitModel.instruments;
    kit = this.appModel.get('kitModel').toJSON();
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
    this.kitType = this.appModel.get('kitModel').get('label');
    this.instruments = instruments;
    this.patternSquareGroups = patternSquareGroups;
    return this.saveTrack();
  };

  AppController.prototype.saveTrack = function() {
    this.sharedTrackModel.set({
      bpm: this.appModel.get('bpm'),
      instruments: this.instruments,
      kitType: this.kitType,
      patternSquareGroups: this.patternSquareGroups,
      visualization: this.appModel.get('visualization')
    });
    return this.sharedTrackModel.save({
      error: (function(_this) {
        return function(object, error) {
          console.log('error here!');
          console.error(object, error);
          if (_this.parseErrorAttempts < 3) {
            _this.parseErrorAttempts++;
            return _this.saveTrack();
          } else {
            return _this.appModel.set('shareId', 'error');
          }
        };
      })(this),
      success: (function(_this) {
        return function(model) {
          console.log(model.id);
          return _this.appModel.set('shareId', model.id);
        };
      })(this)
    });
  };

  AppController.prototype.onResize = function(event) {
    var $deviceOrientation;
    if (this.isMobile || this.isTablet) {
      $deviceOrientation = $('.device-orientation');
      TweenLite.to($('body'), 0, {
        scrollTop: 0,
        scrollLeft: 0
      });
      if (window.innerHeight > window.innerWidth) {
        TweenLite.set($('#wrapper'), {
          autoAlpha: 0
        });
        TweenLite.fromTo($deviceOrientation, .2, {
          autoAlpha: 0
        }, {
          autoAlpha: 1,
          delay: 0
        });
        TweenLite.fromTo($deviceOrientation.find('img'), .3, {
          scale: 0
        }, {
          scale: 1,
          autoAlpha: 1,
          ease: Back.easeOut,
          delay: .6
        });
        return $deviceOrientation.show();
      } else {
        TweenLite.to($deviceOrientation.find('img'), .3, {
          scale: 0,
          autoAlpha: 0,
          ease: Back.easeIn,
          delay: .3
        });
        return TweenLite.to($deviceOrientation, .2, {
          autoAlpha: 0,
          delay: .6,
          onComplete: (function(_this) {
            return function() {
              TweenLite.to($('#wrapper'), .4, {
                autoAlpha: 1,
                delay: .3
              });
              return $deviceOrientation.hide();
            };
          })(this)
        });
      }
    }
  };

  AppController.prototype.onBeat = function(params) {
    return this.visualizerView.onBeat(params);
  };

  AppController.prototype.onVisibilityChange = function(event, state) {
    if (state === 'visible') {
      if (this.appModel._previousAttributes.playing === true) {
        return this.appModel.set('playing', true);
      }
    } else {
      return this.appModel.set('playing', false);
    }
  };

  AppController.prototype.onViewChange = function(model) {
    var $container, currentView, previousView, _ref;
    previousView = model._previousAttributes.view;
    currentView = model.changed.view;
    if (previousView != null) {
      previousView.hide({
        remove: true
      });
    }
    $container = this.$el;
    if (currentView instanceof CreateView) {
      this.renderVisualizationLayer();
      if ((_ref = this.visualizerView) != null) {
        _ref.resetPosition();
      }
      if (this.isMobile) {
        $container = this.$mainContainer;
      } else {
        $container = this.$bottomContainer;
      }
    }
    if (currentView instanceof ShareView) {
      if (this.isMobile) {
        $('#logo').removeClass('logo').addClass('logo-white');
        TweenLite.to($('#wrapper'), .3, {
          backgroundColor: '#E41E2B'
        });
      } else {
        this.renderVisualizationLayer();
      }
      _.defer((function(_this) {
        return function() {
          var _ref1;
          return (_ref1 = _this.visualizerView) != null ? _ref1.setShareViewPosition() : void 0;
        };
      })(this));
    } else {
      if (this.isMobile) {
        $('#logo').removeClass('logo-white').addClass('logo');
        TweenLite.to($('#wrapper'), .3, {
          backgroundColor: 'white'
        });
      }
    }
    $container.append(currentView.render().el);
    if (!(currentView instanceof ShareView)) {
      return currentView.show();
    }
  };

  AppController.prototype.onIsMobileChange = function(model) {
    var isMobile;
    isMobile = model.changed.isMobile;
    if (isMobile) {
      return this.$body.removeClass('desktop').addClass('mobile');
    } else {
      return this.$body.removeClass('mobile').addClass('desktop');
    }
  };

  AppController.prototype.onBreakpointMatch = function(breakpoint) {
    this.appModel.set('isMobile', (breakpoint === 'mobile' ? true : false));
    return _.delay(function() {
      return window.location.reload();
    }, 100);
  };

  AppController.prototype.onOpenShare = function() {
    return this.expandVisualization();
  };

  AppController.prototype.onCloseShare = function() {
    return this.contractVisualization();
  };

  AppController.prototype.onSaveTrack = function(params) {
    this.sharedTrackModel = params.sharedTrackModel;
    return this.exportTrackAndSaveToParse();
  };

  return AppController;

})(View);

module.exports = AppController;


},{"./config/AppConfig.coffee":10,"./events/AppEvent.coffee":12,"./events/PubEvent.coffee":13,"./models/SharedTrackModel.coffee":16,"./routers/AppRouter.coffee":25,"./supers/View.coffee":28,"./utils/BreakpointManager.coffee":29,"./utils/BrowserDetect":30,"./utils/PubSub":31,"./utils/observeDom":33,"./views/create/CreateView.coffee":34,"./views/landing/LandingView.coffee":65,"./views/not-supported/NotSupportedView.coffee":67,"./views/share/ShareView.coffee":69,"./views/templates/main-template.hbs":71,"./views/visualizer/VisualizerView.coffee":74,"visibilityjs":6}],10:[function(require,module,exports){

/**
  Application-wide general  configurations

  @author Christopher Pappas <chris@wintr.us>
  @date   3.19.14
 */
var AppConfig;

AppConfig = {
  ASSETS: {
    path: 'assets',
    audio: 'audio',
    data: 'data',
    images: 'images'
  },
  BPM: 120,
  BPM_MAX: 1000,
  BREAKPOINTS: {
    mobile: {
      min: null,
      max: 600
    },
    desktop: {
      min: 601,
      max: null
    }
  },
  ENABLE_ROTATION_LOCK: true,
  VELOCITY_MAX: 3,
  VOLUME_LEVELS: {
    low: .2,
    medium: .5,
    high: 1
  },
  returnAssetPath: function(assetType) {
    var path;
    path = this.ASSETS.path + '/' + this.ASSETS[assetType];
    return path;
  },
  returnTestAssetPath: function(assetType) {
    var path;
    path = window.location.pathname + this.ASSETS.path + '/' + this.ASSETS[assetType];
    return path;
  }
};

module.exports = AppConfig;


},{}],11:[function(require,module,exports){
module.exports = [
  {
    track: {"bpm":204,"instruments":[{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-kick1","id":"instrument-3","label":"Kick Drum 1","mute":false,"patternSquares":[{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":true,"velocity":1},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":0,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":0,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":1,"trigger":true,"velocity":2}],"src":"/assets/audio/hip-hop/HipHopKit_KickHard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-kick2","id":"instrument-4","label":"Kick Drum 2","mute":false,"patternSquares":[{"active":true,"orderIndex":1,"previousVelocity":2,"trigger":true,"velocity":3},{"active":false,"orderIndex":1,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":1,"trigger":true,"velocity":2},{"active":false,"orderIndex":1,"previousVelocity":3,"trigger":false,"velocity":0}],"src":"/assets/audio/hip-hop/Cool_RnB_Kick_Hard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-hihat-closed","id":"instrument-5","label":"Closed HiHat","mute":false,"patternSquares":[{"active":true,"orderIndex":2,"previousVelocity":2,"trigger":true,"velocity":3},{"active":true,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":1},{"active":true,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":1},{"active":true,"orderIndex":2,"previousVelocity":2,"trigger":false,"velocity":3},{"active":true,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":1},{"active":true,"orderIndex":2,"previousVelocity":0,"trigger":true,"velocity":1},{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":true,"velocity":2},{"active":true,"orderIndex":2,"previousVelocity":2,"trigger":true,"velocity":3}],"src":"/assets/audio/hip-hop/Cool_RnB_Hi-Hat_Closed_Hard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-hihat-open","id":"instrument-6","label":"Open HiHat","mute":false,"patternSquares":[{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":true,"velocity":1},{"active":false,"orderIndex":3,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":true,"velocity":1},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":true,"velocity":1},{"active":false,"orderIndex":3,"previousVelocity":3,"trigger":false,"velocity":0}],"src":"/assets/audio/hip-hop/Cool_RnB_Hi-Hat_Open_Soft.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-snare","id":"instrument-7","label":"Snare","mute":false,"patternSquares":[{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":0,"trigger":true,"velocity":1}],"src":"/assets/audio/hip-hop/HipHopKit_SnareHard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-voice","id":"instrument-8","label":"Voice","mute":false,"patternSquares":[{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0}],"src":"/assets/audio/hip-hop/0021_props_can_soda_open _01-1.mp3","volume":null}],"kitType":"Hip-hop","patternSquareGroups":[[{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":true,"velocity":1},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":0,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":0,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":1,"trigger":true,"velocity":2}],[{"active":true,"orderIndex":1,"previousVelocity":2,"trigger":true,"velocity":3},{"active":false,"orderIndex":1,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":1,"trigger":true,"velocity":2},{"active":false,"orderIndex":1,"previousVelocity":3,"trigger":false,"velocity":0}],[{"active":true,"orderIndex":2,"previousVelocity":2,"trigger":true,"velocity":3},{"active":true,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":1},{"active":true,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":1},{"active":true,"orderIndex":2,"previousVelocity":2,"trigger":false,"velocity":3},{"active":true,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":1},{"active":true,"orderIndex":2,"previousVelocity":0,"trigger":true,"velocity":1},{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":true,"velocity":2},{"active":true,"orderIndex":2,"previousVelocity":2,"trigger":true,"velocity":3}],[{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":true,"velocity":1},{"active":false,"orderIndex":3,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":true,"velocity":1},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":true,"velocity":1},{"active":false,"orderIndex":3,"previousVelocity":3,"trigger":false,"velocity":0}],[{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":0,"trigger":true,"velocity":1}],[{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0}]],"shareName":"Kevin Bleich","shareTitle":"Filthy 1","shareMessage":"Yeah","visualization":null,"objectId":"duaeGp4zlx","createdAt":"2014-04-07T16:28:48.566Z","updatedAt":"2014-04-07T16:28:48.566Z"}
  },
  {
    track: {"bpm":120,"instruments":[{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-coke-bottle","id":"instrument-42","label":"Cowbell","mute":false,"patternSquares":[{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":1}],"src":"/assets/audio/coke/03___coke_cowbell.ogg","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-coke-twist","id":"instrument-43","label":"Twist","mute":false,"patternSquares":[{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":1},{"active":true,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":0}],"src":"/assets/audio/coke/006144285-bottle-beer-open-01.ogg","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-coke-can","id":"instrument-44","label":"Can opening","mute":false,"patternSquares":[{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0}],"src":"/assets/audio/coke/02___0021_props_can_beer_open _01.ogg","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-coke-voice3","id":"instrument-45","label":"Voice 3","mute":false,"patternSquares":[{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":1},{"active":true,"orderIndex":3,"previousVelocity":2,"trigger":false,"velocity":3},{"active":true,"orderIndex":3,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":0}],"src":"/assets/audio/coke/female_ahhh_03.ogg","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-coke-voice2","id":"instrument-46","label":"Voice 2","mute":false,"patternSquares":[{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":0}],"src":"/assets/audio/coke/04___male_ahhh_01.ogg","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-coke-voice1","id":"instrument-47","label":"Voice 1","mute":false,"patternSquares":[{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":5,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":5,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":1}],"src":"/assets/audio/coke/05___female_ahhh_01.ogg","volume":null}],"kitType":"COKE","patternSquareGroups":[[{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":1}],[{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":1},{"active":true,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":0}],[{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":false,"velocity":0}],[{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":1},{"active":true,"orderIndex":3,"previousVelocity":2,"trigger":false,"velocity":3},{"active":true,"orderIndex":3,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":0}],[{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":0}],[{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":5,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":5,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":0},{"active":true,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":1}]],"shareName":"asdf","shareTitle":"asdf","shareMessage":"NEED SHARE MESSAGE","visualization":null,"objectId":"qR0nsxIRIP","createdAt":"2014-04-15T17:23:07.655Z","updatedAt":"2014-04-15T17:23:07.655Z"}
  },
  {
    track: {"bpm":260,"instruments":[{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-kick1","id":"instrument-3","label":"Kick Drum 1","mute":false,"patternSquares":[{"active":true,"orderIndex":0,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":0,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":3,"trigger":false,"velocity":0}],"src":"/assets/audio/hip-hop/HipHopKit_KickHard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-kick2","id":"instrument-4","label":"Kick Drum 2","mute":false,"patternSquares":[{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0}],"src":"/assets/audio/hip-hop/Cool_RnB_Kick_Hard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-hihat-closed","id":"instrument-5","label":"Closed HiHat","mute":false,"patternSquares":[{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":2,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":false,"velocity":2},{"active":true,"orderIndex":2,"previousVelocity":2,"trigger":false,"velocity":3},{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":false,"velocity":2},{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":false,"velocity":2},{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":2,"previousVelocity":3,"trigger":false,"velocity":0}],"src":"/assets/audio/hip-hop/Cool_RnB_Hi-Hat_Closed_Hard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-hihat-open","id":"instrument-6","label":"Open HiHat","mute":false,"patternSquares":[{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":2,"trigger":false,"velocity":3}],"src":"/assets/audio/hip-hop/Cool_RnB_Hi-Hat_Open_Soft.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-snare","id":"instrument-7","label":"Snare","mute":false,"patternSquares":[{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0}],"src":"/assets/audio/hip-hop/HipHopKit_SnareHard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-voice","id":"instrument-8","label":"Voice","mute":false,"patternSquares":[{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0}],"src":"/assets/audio/hip-hop/0021_props_can_soda_open _01-1.mp3","volume":null}],"kitType":"Hip-hop","patternSquareGroups":[[{"active":true,"orderIndex":0,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":0,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":3,"trigger":false,"velocity":0}],[{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0}],[{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":2,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":false,"velocity":2},{"active":true,"orderIndex":2,"previousVelocity":2,"trigger":false,"velocity":3},{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":false,"velocity":2},{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":false,"velocity":2},{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":2,"previousVelocity":3,"trigger":false,"velocity":0}],[{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":2,"trigger":false,"velocity":3}],[{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0}],[{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0}]],"shareName":"Matt","shareTitle":"Helz Yes","shareMessage":"Hope you like it.","visualization":null,"objectId":"fxDP8MLqkG","createdAt":"2014-04-03T22:57:29.606Z","updatedAt":"2014-04-03T22:57:29.606Z"}
  },
  {
    track: {"bpm":250,"instruments":[{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-kick1","id":"instrument-3","label":"Kick Drum 1","mute":false,"patternSquares":[{"active":true,"orderIndex":0,"previousVelocity":1,"trigger":true,"velocity":2},{"active":true,"orderIndex":0,"previousVelocity":1,"trigger":true,"velocity":2},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0}],"src":"/assets/audio/hip-hop/HipHopKit_KickHard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-kick2","id":"instrument-4","label":"Kick Drum 2","mute":false,"patternSquares":[{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":0,"trigger":true,"velocity":1},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0}],"src":"/assets/audio/hip-hop/Cool_RnB_Kick_Hard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-hihat-closed","id":"instrument-5","label":"Closed HiHat","mute":false,"patternSquares":[{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":3,"trigger":false,"velocity":0}],"src":"/assets/audio/hip-hop/Cool_RnB_Hi-Hat_Closed_Hard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-hihat-open","id":"instrument-6","label":"Open HiHat","mute":false,"patternSquares":[{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0}],"src":"/assets/audio/hip-hop/Cool_RnB_Hi-Hat_Open_Soft.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-snare","id":"instrument-7","label":"Snare","mute":false,"patternSquares":[{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0}],"src":"/assets/audio/hip-hop/HipHopKit_SnareHard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-voice","id":"instrument-8","label":"Voice","mute":false,"patternSquares":[{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0}],"src":"/assets/audio/hip-hop/0021_props_can_soda_open _01-1.mp3","volume":null}],"kitType":"Hip-hop","patternSquareGroups":[[{"active":true,"orderIndex":0,"previousVelocity":1,"trigger":true,"velocity":2},{"active":true,"orderIndex":0,"previousVelocity":1,"trigger":true,"velocity":2},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0}],[{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":0,"trigger":true,"velocity":1},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0}],[{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":3,"trigger":false,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":3,"trigger":false,"velocity":0}],[{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0}],[{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":3,"trigger":false,"velocity":0}],[{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0}]],"shareName":"Hypsteria","shareTitle":"You wish ","shareMessage":"you wish you made it","visualization":null,"objectId":"nhGDUaQ9ri","createdAt":"2014-04-05T21:11:47.776Z","updatedAt":"2014-04-05T21:11:47.776Z"}
  },
  {
    track: {"bpm":250,"instruments":[{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-kick1","id":"instrument-3","label":"Kick Drum 1","mute":false,"patternSquares":[{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":true,"velocity":1},{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0}],"src":"/assets/audio/hip-hop/HipHopKit_KickHard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-kick2","id":"instrument-4","label":"Kick Drum 2","mute":false,"patternSquares":[{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0}],"src":"/assets/audio/hip-hop/Cool_RnB_Kick_Hard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-hihat-closed","id":"instrument-5","label":"Closed HiHat","mute":false,"patternSquares":[{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0}],"src":"/assets/audio/hip-hop/Cool_RnB_Hi-Hat_Closed_Hard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-hihat-open","id":"instrument-6","label":"Open HiHat","mute":false,"patternSquares":[{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":true,"velocity":1},{"active":true,"orderIndex":3,"previousVelocity":1,"trigger":true,"velocity":2}],"src":"/assets/audio/hip-hop/Cool_RnB_Hi-Hat_Open_Soft.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-snare","id":"instrument-7","label":"Snare","mute":false,"patternSquares":[{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0}],"src":"/assets/audio/hip-hop/HipHopKit_SnareHard.mp3","volume":null},{"active":null,"dropped":false,"droppedEvent":null,"focus":false,"icon":"icon-kit-0-voice","id":"instrument-8","label":"Voice","mute":false,"patternSquares":[{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":1}],"src":"/assets/audio/hip-hop/0021_props_can_soda_open _01-1.mp3","volume":null}],"kitType":"Hip-hop","patternSquareGroups":[[{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":true,"velocity":1},{"active":true,"orderIndex":0,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":0,"previousVelocity":0,"trigger":null,"velocity":0}],[{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":1,"previousVelocity":2,"trigger":false,"velocity":3},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":1,"previousVelocity":0,"trigger":null,"velocity":0}],[{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":2,"previousVelocity":1,"trigger":false,"velocity":2},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":2,"previousVelocity":0,"trigger":null,"velocity":0}],[{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":3,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":3,"previousVelocity":0,"trigger":true,"velocity":1},{"active":true,"orderIndex":3,"previousVelocity":1,"trigger":true,"velocity":2}],[{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":4,"previousVelocity":0,"trigger":false,"velocity":1},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":4,"previousVelocity":0,"trigger":null,"velocity":0}],[{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":false,"orderIndex":5,"previousVelocity":0,"trigger":null,"velocity":0},{"active":true,"orderIndex":5,"previousVelocity":0,"trigger":false,"velocity":1}]],"shareName":"Courtney","shareTitle":"So So Fresh","shareMessage":"Awesome work Chris & Wes!","visualization":null,"objectId":"hyCDeoZDox","createdAt":"2014-04-04T00:13:34.561Z","updatedAt":"2014-04-04T00:13:34.561Z"}
  }
]
},{}],12:[function(require,module,exports){

/**
 * Application related events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent;

AppEvent = {
  BREAKPOINT_MATCH: 'breakpoint:match',
  BREAKPOINT_UNMATCH: 'breakpoint:unmatch',
  CHANGE_ACTIVE: 'change:active',
  CHANGE_BPM: 'change:bpm',
  CHANGE_DRAGGING: 'change:dragging',
  CHANGE_DROPPED: 'change:dropped',
  CHANGE_FOCUS: 'change:focus',
  CHANGE_INSTRUMENT: 'change:currentInstrument',
  CHANGE_ISMOBILE: 'change:isMobile',
  CHANGE_KIT: 'change:kitModel',
  CHANGE_MUTE: 'change:mute',
  CHANGE_PLAYING: 'change:playing',
  CHANGE_SHARE_ID: 'change:shareId',
  CHANGE_SHOW_SEQUENCER: 'change:showSequencer',
  CHANGE_SHOW_PAD: 'change:showPad',
  CHANGE_TRIGGER: 'change:trigger',
  CHANGE_VELOCITY: 'change:velocity',
  CHANGE_VIEW: 'change:view',
  SAVE_TRACK: 'onSaveTrack',
  OPEN_SHARE: 'onOpenShare',
  CLOSE_SHARE: 'onCloseShare'
};

module.exports = AppEvent;


},{}],13:[function(require,module,exports){

/**
 * Global PubSub events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var PubSub;

PubSub = {
  BEAT: 'onBeat',
  EXPORT_TRACK: 'onExportTrack',
  IMPORT_TRACK: 'onImportTrack',
  ROUTE: 'onRouteChange',
  SAVE_TRACK: 'onSaveTrack'
};

module.exports = PubSub;


},{}],14:[function(require,module,exports){

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
},{"digits":1,"handleify":5}],15:[function(require,module,exports){

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
    'pageFocus': true,
    'shareId': null,
    'sharedTrackModel': null,
    'showSequencer': null,
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


},{"../config/AppConfig.coffee":10,"../supers/Model.coffee":27}],16:[function(require,module,exports){

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
    patternSquareGroups: null,
    shareName: null,
    shareTitle: null,
    shareMessage: null,
    visualization: null
  };

  return SharedTrackModel;

})(Parse.Object);

module.exports = SharedTrackModel;


},{"../config/AppConfig.coffee":10,"../supers/Model.coffee":27}],17:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":10,"../../supers/Collection.coffee":26,"./KitModel.coffee":18}],18:[function(require,module,exports){

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
    _.each(response.instruments, function(instrument, index) {
      instrument.id = _.uniqueId('instrument-');
      return instrument.src = response.path + '/' + instrument.src;
    });
    response.instruments = new InstrumentCollection(response.instruments);
    return response;
  };

  return KitModel;

})(Model);

module.exports = KitModel;


},{"../../supers/Model.coffee":27,"../sequencer/InstrumentCollection.coffee":21}],19:[function(require,module,exports){

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


},{"../../supers/Collection.coffee":26,"../sequencer/InstrumentModel.coffee":22}],20:[function(require,module,exports){

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


},{"../../supers/Model.coffee":27}],21:[function(require,module,exports){

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


},{"../../supers/Collection.coffee":26,"./InstrumentModel.coffee":22}],22:[function(require,module,exports){

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
    'focus': false,
    'icon': null,
    'label': null,
    'mute': false,
    'src': null,
    'volume': null,
    'patternSquares': null
  };

  return InstrumentModel;

})(Model);

module.exports = InstrumentModel;


},{"../../config/AppConfig.coffee":10,"../../supers/Model.coffee":27}],23:[function(require,module,exports){

/**
  A collection of individual pattern squares

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
 */
var AppConfig, AppEvent, Collection, InstrumentModel, PatternSquareCollection, PatternSquareModel, PubSub,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../config/AppConfig.coffee');

AppEvent = require('../../events/AppEvent.coffee');

Collection = require('../../supers/Collection.coffee');

InstrumentModel = require('../sequencer/InstrumentModel.coffee');

PatternSquareModel = require('./PatternSquareModel.coffee');

PubSub = require('../../utils/PubSub');

PatternSquareCollection = (function(_super) {
  __extends(PatternSquareCollection, _super);

  function PatternSquareCollection() {
    return PatternSquareCollection.__super__.constructor.apply(this, arguments);
  }

  PatternSquareCollection.prototype.model = InstrumentModel;

  PatternSquareCollection.prototype.initialize = function(options) {
    return PatternSquareCollection.__super__.initialize.call(this, options);
  };

  PatternSquareCollection.prototype.onImportTrack = function(params) {};

  PatternSquareCollection.prototype.onExportTrack = function(params) {};

  return PatternSquareCollection;

})(Collection);

module.exports = PatternSquareCollection;


},{"../../config/AppConfig.coffee":10,"../../events/AppEvent.coffee":12,"../../supers/Collection.coffee":26,"../../utils/PubSub":31,"../sequencer/InstrumentModel.coffee":22,"./PatternSquareModel.coffee":24}],24:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":10,"../../events/AppEvent.coffee":12,"../../supers/Model.coffee":27}],25:[function(require,module,exports){

/**
 * MPC Application router
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppConfig, AppRouter, PubEvent, PubSub,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../config/AppConfig.coffee');

PubSub = require('../utils/PubSub');

PubEvent = require('../events/PubEvent.coffee');

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
    'share': 'shareRoute',
    'share/:id': 'shareRoute',
    'not-supported': 'notSupportedRoute'
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
      'view': this.appController.shareView,
      'shareId': shareId
    });
  };

  AppRouter.prototype.notSupportedRoute = function() {
    return this.appModel.set('view', this.appController.notSupportedView);
  };

  return AppRouter;

})(Backbone.Router);

module.exports = AppRouter;


},{"../config/AppConfig.coffee":10,"../events/PubEvent.coffee":13,"../utils/PubSub":31}],26:[function(require,module,exports){

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


},{}],27:[function(require,module,exports){

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


},{}],28:[function(require,module,exports){

/**
 * View superclass containing shared functionality
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   2.17.14
 */
var BrowserDetect, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BrowserDetect = require('../utils/BrowserDetect');

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
      templateData.isDesktop = $('body').hasClass('desktop') ? true : false;
      this.$el.html(this.template(templateData));
    }
    this.isMobile = $('body').hasClass('mobile') ? true : false;
    this.isTablet = BrowserDetect.deviceDetection().deviceType === 'tablet' ? true : false;
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
    return;
    return TweenLite.set(this.$el, {
      autoAlpha: 1
    });
  };

  View.prototype.hide = function(options) {
    return TweenLite.to(this.$el, 0, {
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


},{"../utils/BrowserDetect":30}],29:[function(require,module,exports){
var BreakpointManager;

BreakpointManager = (function() {
  BreakpointManager.prototype.scope = null;

  BreakpointManager.prototype.breakpoints = [];

  function BreakpointManager(options) {
    this.scope = options.scope, this.breakpoints = options.breakpoints;
    $.each(this.breakpoints, (function(_this) {
      return function(breakpoint, boundries) {
        var query;
        if (boundries.min === null) {
          query = "screen and (min-width:0px) and (max-width:" + boundries.max + "px)";
        } else if (boundries.max === null) {
          query = "screen and (min-width:" + boundries.min + "px)";
        } else {
          query = "screen and (min-width:" + boundries.min + "px) and (max-width:" + boundries.max + "px)";
        }
        return enquire.register(query, {
          match: function() {
            return _this.scope.trigger("breakpoint:match", breakpoint);
          },
          unmatch: function() {
            return _this.scope.trigger("breakpoint:unmatch", breakpoint);
          }
        });
      };
    })(this));
  }

  return BreakpointManager;

})();

module.exports = BreakpointManager;


},{}],30:[function(require,module,exports){

var BrowserDetect = {

  unsupportedAndroidDevice: function() {
    var userAgent = navigator.userAgent
    var agentIndex = userAgent.indexOf('Android');

    if (agentIndex != -1) {
      var androidversion = parseFloat(userAgent.match(/Android\s+([\d\.]+)/)[1]);
      if (androidversion < 4.1) {
        return true
      } else {
        return false
      }
    }

    return false
  },


  deviceDetection: function() {
    var osVersion,
    device,
    deviceType,
    userAgent,
    isSmartphoneOrTablet;

    device = (navigator.userAgent).match(/Android|iPhone|iPad|iPod/i);

    if ( /Android/i.test(device) ) {
        if ( !/mobile/i.test(navigator.userAgent) ) {
            deviceType = 'tablet';
        } else {
            deviceType = 'phone';
        }

        osVersion = (navigator.userAgent).match(/Android\s+([\d\.]+)/i);
        osVersion = osVersion[0];
        osVersion = osVersion.replace('Android ', '');

    } else if ( /iPhone/i.test(device) ) {
        deviceType = 'phone';
        osVersion = (navigator.userAgent).match(/OS\s+([\d\_]+)/i);
        osVersion = osVersion[0];
        osVersion = osVersion.replace(/_/g, '.');
        osVersion = osVersion.replace('OS ', '');

    } else if ( /iPad/i.test(device) ) {
        deviceType = 'tablet';
        osVersion = (navigator.userAgent).match(/OS\s+([\d\_]+)/i);
        osVersion = osVersion[0];
        osVersion = osVersion.replace(/_/g, '.');
        osVersion = osVersion.replace('OS ', '');
    }
    isSmartphoneOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    userAgent = navigator.userAgent;

    return { 'isSmartphoneOrTablet': isSmartphoneOrTablet,
             'device': device,
             'osVersion': osVersion,
             'userAgent': userAgent,
             'deviceType': deviceType
            };
  },


  isIE: function() {
    if (navigator.userAgent.match(/IE/i))
      return true

    if (!!navigator.userAgent.match(/Trident.*rv\:11\./))
      return true

    return false
  }

}

module.exports = BrowserDetect


},{}],31:[function(require,module,exports){
/**
 * @module     PubSub
 * @desc       Global PubSub object for dispatch and delegation
 */

'use strict'

var PubSub = {}

_.extend( PubSub, Backbone.Events )

module.exports = PubSub
},{}],32:[function(require,module,exports){
/**
 * Spin.js loader icon configuration
 *
 * @author  Christopher Pappas <chris@wintr.us>
 * @date    2.18.14
 */

var opts = {
  lines: 7, // The number of lines to draw
  length: 6, // The length of each line
  width: 3, // The line thickness
  radius: 6, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#fff', // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 78, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: 'auto', // Top position relative to parent in px
  left: 'auto' // Left position relative to parent in px
};


var SpinIcon = function (options) {
  this.target = options.target
  this.options = _.extend(opts, options)
  return this.init()
}

SpinIcon.prototype.init = function (options) {
  this.spinner = new Spinner(opts).spin(this.target);
  this.$el = $(this.spinner.el)
  TweenLite.set( this.$el, { autoAlpha: 0 })
  this.hide()
}

SpinIcon.prototype.show = function () {
  TweenLite.to( this.$el, .2, {
    autoAlpha: 1
  })
}

SpinIcon.prototype.hide = function () {
  TweenLite.to( this.$el, .2, {
    autoAlpha: 0
  })
}

module.exports = SpinIcon
},{}],33:[function(require,module,exports){
var observeDOM = (function(){
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
    eventListenerSupported = window.addEventListener;

  return function(obj, callback){
    if (MutationObserver) {

      // Define a new observer
      var obs = new MutationObserver(function(mutations, observer){
          if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
              callback();
      });

      // Have the observer observe foo for changes in children
      obs.observe( obj, { childList:true, subtree:true });
    } else if (eventListenerSupported) {
      obj.addEventListener('DOMNodeInserted', callback, false);
      obj.addEventListener('DOMNodeRemoved', callback, false);
    }
  }
})();

module.exports = observeDOM

},{}],34:[function(require,module,exports){

/**
 * Create view which the user can build beats within
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppEvent, BPMIndicator, BrowserDetect, Bubbles, BubblesView, CreateView, InstrumentSelectorPanel, KitSelector, LivePad, PatternSelector, PlayPauseBtn, PubEvent, PubSub, Sequencer, ShareModal, SharedTrackModel, Toggle, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PubSub = require('../../utils/PubSub');

View = require('../../supers/View.coffee');

AppEvent = require('../../events/AppEvent.coffee');

PubEvent = require('../../events/PubEvent.coffee');

SharedTrackModel = require('../../models/SharedTrackModel.coffee');

Bubbles = require('../../views/visualizer/Bubbles');

BubblesView = require('../../views/visualizer/BubblesView.coffee');

BrowserDetect = require('../../utils/BrowserDetect');

KitSelector = require('./components/KitSelector.coffee');

PlayPauseBtn = require('./components/PlayPauseBtn.coffee');

Toggle = require('./components/Toggle.coffee');

PatternSelector = require('./components/PatternSelector.coffee');

InstrumentSelectorPanel = require('./components/instruments/InstrumentSelectorPanel.coffee');

Sequencer = require('./components/sequencer/Sequencer.coffee');

LivePad = require('./components/pad/LivePad.coffee');

ShareModal = require('./components/share/ShareModal.coffee');

BPMIndicator = require('./components/BPMIndicator.coffee');

template = require('./templates/create-template.hbs');

CreateView = (function(_super) {
  __extends(CreateView, _super);

  function CreateView() {
    this.onJamLiveBtnClick = __bind(this.onJamLiveBtnClick, this);
    this.onJamLiveBtnPress = __bind(this.onJamLiveBtnPress, this);
    this.onShowSequencerChange = __bind(this.onShowSequencerChange, this);
    this.onCloseShare = __bind(this.onCloseShare, this);
    this.onClearBtnClick = __bind(this.onClearBtnClick, this);
    this.onShareBtnClick = __bind(this.onShareBtnClick, this);
    this.onSaveTrack = __bind(this.onSaveTrack, this);
    this.onBeat = __bind(this.onBeat, this);
    this.hide = __bind(this.hide, this);
    this.show = __bind(this.show, this);
    return CreateView.__super__.constructor.apply(this, arguments);
  }

  CreateView.prototype.className = 'container-create';

  CreateView.prototype.template = template;

  CreateView.prototype.events = {
    'touchend .btn-share': 'onShareBtnClick',
    'touchend .btn-export': 'onExportBtnClick',
    'touchstart .btn-clear': 'onClearBtnPress',
    'touchend .btn-clear': 'onClearBtnClick',
    'touchstart .btn-jam-live': 'onJamLiveBtnPress',
    'touchend .btn-jam-live': 'onJamLiveBtnClick'
  };

  CreateView.prototype.render = function(options) {
    CreateView.__super__.render.call(this, options);
    this.playPauseBtn = new PlayPauseBtn({
      appModel: this.appModel
    });
    this.toggle = new Toggle({
      appModel: this.appModel
    });
    this.bubblesView = new BubblesView({
      appModel: this.appModel
    });
    this.$body = $('body');
    this.$mainContainer = this.$body.find('#container-main');
    this.$bottomContainer = this.$body.find('#container-bottom');
    this.$wrapper = this.$el.find('.wrapper');
    this.$kitSelectorContainer = this.$el.find('.container-kit-selector');
    this.$toggleContainer = this.$el.find('.container-toggle');
    this.$playPauseContainer = this.$el.find('.container-play-pause');
    this.$sequencerContainer = this.$el.find('.container-sequencer');
    this.$livePadContainer = this.$el.find('.container-live-pad');
    this.$patternSelectorContainer = this.$el.find('.column-2');
    this.$bpmContainer = this.$el.find('.column-3');
    this.$instrumentSelector = this.$sequencerContainer.find('.instrument-selector');
    this.$sequencer = this.$sequencerContainer.find('.sequencer');
    this.$livePad = this.$sequencerContainer.find('.live-pad');
    this.$patternSelector = this.$sequencerContainer.find('.pattern-selector');
    this.$bpm = this.$sequencerContainer.find('.bpm');
    this.$shareBtn = this.$sequencerContainer.find('.btn-share');
    this.$playPauseContainer.html(this.playPauseBtn.render().el);
    TweenLite.to(this.$body, 0, {
      scrollTop: 0,
      scrollLeft: 0
    });
    if (!this.isMobile) {
      this.$toggleContainer.html(this.toggle.render().el);
    }
    if (this.isMobile) {
      this.$row1 = this.$el.find('.row-1');
      this.$row2 = this.$el.find('.row-2');
      this.$row3 = this.$el.find('.row-3');
      this.$row4 = this.$el.find('.row-4');
      this.renderInstrumentSelector();
      _.defer((function(_this) {
        return function() {
          _this.appModel.set('showSequencer', true);
          return _this.instrumentSelector.instrumentViews[0].onClick();
        };
      })(this));
    }
    TweenLite.set(this.$bottomContainer, {
      y: 300
    });
    this.renderKitSelector();
    this.renderSequencer();
    this.renderLivePad();
    this.renderPatternSelector();
    this.renderBPM();
    if (!(this.isMobile || this.isTablet || BrowserDetect.isIE())) {
      this.renderBubbles();
    }
    this.$kitSelector = this.$el.find('.kit-selector');
    return this;
  };

  CreateView.prototype.show = function() {
    this.$mainContainer.show();
    this.showUI();
    this.appModel.set('showSequencer', true);
    if (this.isMobile) {
      TweenLite.to($('.top-bar'), .3, {
        autoAlpha: 1
      });
      return TweenLite.fromTo(this.$mainContainer, .4, {
        y: 1000
      }, {
        immediateRender: true,
        y: this.returnMoveAmount(),
        ease: Expo.easeOut,
        delay: 1
      });
    }
  };

  CreateView.prototype.hide = function(options) {
    TweenLite.fromTo(this.$el, .3, {
      autoAlpha: 1
    }, {
      autoAlpha: 0
    });
    this.kitSelector.hide();
    this.hideUI();
    if (this.isMobile) {
      TweenLite.to($('.top-bar'), .3, {
        autoAlpha: 0
      });
    }
    if (this.$bottomContainer.length) {
      return TweenLite.fromTo(this.$bottomContainer, .4, {
        y: 0
      }, {
        y: 300,
        ease: Expo.easeOut,
        onComplete: (function(_this) {
          return function() {
            _this.appModel.set({
              'showSequencer': null,
              'showPad': null
            });
            if (options != null ? options.remove : void 0) {
              return _this.remove();
            }
          };
        })(this)
      });
    }
  };

  CreateView.prototype.showUI = function() {
    this.kitSelector.show();
    TweenLite.fromTo(this.$el, .3, {
      autoAlpha: 0
    }, {
      autoAlpha: 1,
      delay: .3
    });
    return TweenLite.fromTo(this.$bottomContainer, .4, {
      y: 300
    }, {
      autoAlpha: 1,
      y: this.returnMoveAmount(),
      ease: Expo.easeOut,
      delay: .3
    });
  };

  CreateView.prototype.hideUI = function() {
    this.kitSelector.hide();
    TweenLite.fromTo(this.$el, .3, {
      autoAlpha: 1
    }, {
      autoAlpha: 0
    });
    return TweenLite.fromTo(this.$bottomContainer, .4, {
      y: 0
    }, {
      y: 300,
      ease: Expo.easeOut
    });
  };

  CreateView.prototype.remove = function() {
    var _ref, _ref1;
    this.playPauseBtn.remove();
    this.playPauseBtn = null;
    this.toggle.remove();
    this.toggle = null;
    this.kitSelector.remove();
    this.kitSelector = null;
    this.sequencer.remove();
    this.sequencer = null;
    this.livePad.remove();
    this.livePad = null;
    this.patternSelector.remove();
    this.patternSelector = null;
    this.bpm.remove();
    this.bpm = null;
    if ((_ref = this.instrumentSelector) != null) {
      _ref.remove();
    }
    this.instrumentSelector = null;
    if ((_ref1 = this.shareModal) != null) {
      _ref1.remove();
    }
    this.shareModal = null;
    this.appModel.set('playing', false);
    $('.container-kit-selector').remove();
    return CreateView.__super__.remove.call(this);
  };

  CreateView.prototype.addEventListeners = function() {
    return this.listenTo(this.appModel, AppEvent.CHANGE_SHOW_SEQUENCER, this.onShowSequencerChange);
  };

  CreateView.prototype.removeEventListeners = function() {
    return CreateView.__super__.removeEventListeners.call(this);
  };

  CreateView.prototype.renderKitSelector = function() {
    var html;
    this.kitSelector = new KitSelector({
      appModel: this.appModel,
      kitCollection: this.kitCollection
    });
    html = this.kitSelector.render().el;
    if (this.isMobile) {
      return this.$row2.append(html);
    } else {
      return this.$mainContainer.prepend(html);
    }
  };

  CreateView.prototype.renderInstrumentSelector = function() {
    this.instrumentSelector = new InstrumentSelectorPanel({
      appModel: this.appModel,
      kitCollection: this.kitCollection
    });
    return this.$row3.prepend(this.instrumentSelector.render().el);
  };

  CreateView.prototype.renderSequencer = function() {
    var html;
    this.sequencer = new Sequencer({
      appModel: this.appModel,
      kitCollection: this.kitCollection,
      collection: this.kitCollection.at(0).get('instruments')
    });
    html = this.sequencer.render().el;
    if (this.isMobile) {
      this.$row4.html(html);
    } else {
      this.$sequencer.prepend(html);
    }
    return this.listenTo(this.sequencer, PubEvent.BEAT, this.onBeat);
  };

  CreateView.prototype.renderLivePad = function() {
    var html;
    this.livePad = new LivePad({
      appModel: this.appModel,
      kitCollection: this.kitCollection
    });
    html = this.livePad.render().el;
    if (this.isMobile) {
      this.$livePadContainer.html(html);
    } else {
      this.$livePad.html(html);
    }
    return this.listenTo(this.livePad, PubEvent.BEAT, this.onBeat);
  };

  CreateView.prototype.renderPatternSelector = function() {
    var html;
    this.patternSelector = new PatternSelector({
      appModel: this.appModel,
      sequencer: this.sequencer
    });
    html = this.patternSelector.render().el;
    if (this.isMobile) {
      return this.$row2.append(html);
    } else {
      return this.$patternSelector.html(html);
    }
  };

  CreateView.prototype.renderBPM = function() {
    var html;
    this.bpm = new BPMIndicator({
      appModel: this.appModel
    });
    html = this.bpm.render().el;
    if (this.isMobile) {
      return this.$row1.append(html);
    } else {
      return this.$bpm.html(html);
    }
  };

  CreateView.prototype.renderBubbles = function() {
    return this.$mainContainer.prepend(Bubbles.initialize());
  };

  CreateView.prototype.renderShareModal = function() {
    this.shareModal = new ShareModal({
      appModel: this.appModel,
      sharedTrackModel: this.sharedTrackModel
    });
    if (this.isMobile) {
      this.$mainContainer.append(this.shareModal.render().el);
      TweenLite.to(this.$sequencerContainer, .6, {
        y: -window.innerHeight,
        ease: Expo.easeInOut
      });
    } else {
      this.$body.prepend(this.shareModal.render().el);
    }
    this.shareModal.show();
    this.listenTo(this.shareModal, AppEvent.SAVE_TRACK, this.onSaveTrack);
    return this.listenTo(this.shareModal, AppEvent.CLOSE_SHARE, this.onCloseShare);
  };

  CreateView.prototype.onBeat = function(params) {
    this.trigger(PubEvent.BEAT, params);
    if (!this.isMobile) {
      return Bubbles.beat();
    }
  };

  CreateView.prototype.onSaveTrack = function() {
    return this.trigger(AppEvent.SAVE_TRACK, {
      sharedTrackModel: this.sharedTrackModel
    });
  };

  CreateView.prototype.onShareBtnClick = function(event) {
    this.trigger(AppEvent.OPEN_SHARE);
    return this.renderShareModal();
  };

  CreateView.prototype.onClearBtnPress = function(event) {
    if (this.isMobile) {
      return $(event.currentTarget).addClass('press');
    }
  };

  CreateView.prototype.onClearBtnClick = function(event) {
    if (this.isMobile) {
      $(event.currentTarget).removeClass('press');
    }
    if (this.appModel.get('showSequencer')) {
      this.appModel.set('sharedTrackModel', null);
      this.patternSelector.$el.find('.selected').removeClass('selected');
      return this.sequencer.renderTracks();
    } else {
      return this.livePad.clearLivePad();
    }
  };

  CreateView.prototype.onCloseShare = function(event) {
    this.trigger(AppEvent.CLOSE_SHARE);
    this.stopListening(this.shareModal);
    if (this.isMobile) {
      return TweenLite.to(this.$sequencerContainer, .6, {
        y: 0,
        ease: Expo.easeInOut
      });
    }
  };

  CreateView.prototype.onShowSequencerChange = function(model) {
    if (model.changed.showSequencer) {
      if (this.prevVolume) {
        createjs.Sound.setVolume(this.prevVolume);
      }
      return this.showSequencer();
    } else {
      this.prevVolume = createjs.Sound.getVolume();
      createjs.Sound.setVolume(1);
      return this.showLivePad();
    }
  };

  CreateView.prototype.onJamLiveBtnPress = function(event) {
    return $(event.currentTarget).addClass('press');
  };

  CreateView.prototype.onJamLiveBtnClick = function(event) {
    $(event.currentTarget).removeClass('press');
    return this.appModel.set('showSequencer', false);
  };

  CreateView.prototype.returnMoveAmount = function() {
    var moveAmount;
    return moveAmount = $('.plitem').length > 0 ? -30 : 0;
  };

  CreateView.prototype.showSequencer = function() {
    var tweenTime;
    tweenTime = .6;
    if (this.isMobile) {
      TweenLite.to(this.$sequencerContainer, tweenTime, {
        x: 0,
        autoAlpha: 1,
        ease: Expo.easeInOut
      });
      return TweenLite.to(this.$livePadContainer, tweenTime, {
        x: window.innerWidth,
        autoAlpha: 0,
        ease: Expo.easeInOut
      });
    } else {
      TweenLite.to(this.$sequencer, tweenTime, {
        autoAlpha: 1,
        x: 0,
        ease: Expo.easeInOut
      });
      return TweenLite.to(this.$livePad, tweenTime, {
        autoAlpha: 0,
        x: 2000,
        ease: Expo.easeInOut
      });
    }
  };

  CreateView.prototype.showLivePad = function() {
    var tweenTime;
    tweenTime = .6;
    if (this.isMobile) {
      TweenLite.to(this.$sequencerContainer, tweenTime, {
        autoAlpha: 0,
        x: -window.innerWidth,
        ease: Expo.easeInOut
      });
      return TweenLite.fromTo(this.$livePadContainer, tweenTime, {
        x: window.innerWidth
      }, {
        autoAlpha: 1,
        x: 0,
        ease: Expo.easeInOut
      });
    } else {
      TweenLite.to(this.$sequencer, tweenTime, {
        autoAlpha: 0,
        x: -2000,
        ease: Expo.easeInOut
      });
      return TweenLite.to(this.$livePad, tweenTime, {
        autoAlpha: 1,
        x: 0,
        ease: Expo.easeInOut
      });
    }
  };

  return CreateView;

})(View);

module.exports = CreateView;


},{"../../events/AppEvent.coffee":12,"../../events/PubEvent.coffee":13,"../../models/SharedTrackModel.coffee":16,"../../supers/View.coffee":28,"../../utils/BrowserDetect":30,"../../utils/PubSub":31,"../../views/visualizer/Bubbles":72,"../../views/visualizer/BubblesView.coffee":73,"./components/BPMIndicator.coffee":35,"./components/KitSelector.coffee":36,"./components/PatternSelector.coffee":37,"./components/PlayPauseBtn.coffee":38,"./components/Toggle.coffee":39,"./components/instruments/InstrumentSelectorPanel.coffee":41,"./components/pad/LivePad.coffee":44,"./components/sequencer/Sequencer.coffee":52,"./components/share/ShareModal.coffee":56,"./templates/create-template.hbs":64}],35:[function(require,module,exports){

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

  BPMIndicator.prototype.ROTATE_TWEEN_TIME = .4;

  BPMIndicator.prototype.className = 'container-bpm';

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
    'touchend   .btn-decrease': 'onBtnUp',
    'touchend   .wrapper': 'onBtnUp',
    'mouseup    .wrapper': 'onBtnUp'
  };

  BPMIndicator.prototype.render = function(options) {
    BPMIndicator.__super__.render.call(this, options);
    this.$bpmLabel = this.$el.find('.bpm-value');
    this.increaseBtn = this.$el.find('.btn-increase');
    this.decreaseBtn = this.$el.find('.btn-decrease');
    this.$bgCircle = this.$el.find('.bg-circle');
    this.currBPM = this.appModel.get('bpm');
    this.$bpmLabel.text(this.currBPM);
    if (!this.isMobile) {
      TweenLite.set(this.$bgCircle, {
        rotation: 0
      });
    }
    return this;
  };

  BPMIndicator.prototype.addEventListeners = function() {
    return this.listenTo(this.appModel, AppEvent.CHANGE_BPM, this.onBPMChange);
  };

  BPMIndicator.prototype.increaseBPM = function() {
    clearInterval(this.updateInterval);
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
        _this.$bpmLabel.text(_this.currBPM);
        if (!_this.isMobile) {
          return TweenLite.to(_this.$bgCircle, _this.ROTATE_TWEEN_TIME, {
            rotation: GreenProp.rotation(_this.$bgCircle) + 90
          });
        }
      };
    })(this), this.intervalUpdateTime);
  };

  BPMIndicator.prototype.decreaseBPM = function() {
    clearInterval(this.updateInterval);
    return this.updateInterval = setInterval((function(_this) {
      return function() {
        var bpm;
        bpm = _this.currBPM;
        if (bpm > 1) {
          bpm -= _this.bpmIncreaseAmount;
        } else {
          bpm = 1;
        }
        _this.currBPM = bpm;
        _this.$bpmLabel.text(_this.currBPM);
        if (!_this.isMobile) {
          return TweenLite.to(_this.$bgCircle, _this.ROTATE_TWEEN_TIME, {
            rotation: GreenProp.rotation(_this.$bgCircle) - 90
          });
        }
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
    return this.appModel.set('bpm', Math.floor(60000 / this.currBPM) * .5);
  };

  BPMIndicator.prototype.onBPMChange = function(model) {
    var bpm;
    return bpm = model.changed.bpm;
  };

  return BPMIndicator;

})(View);

module.exports = BPMIndicator;


},{"../../../config/AppConfig.coffee":10,"../../../events/AppEvent.coffee":12,"../../../supers/View.coffee":28,"./templates/bpm-template.hbs":59}],36:[function(require,module,exports){

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

  KitSelector.prototype.className = 'container-kit-selector';

  KitSelector.prototype.appModel = null;

  KitSelector.prototype.kitCollection = null;

  KitSelector.prototype.kitModel = null;

  KitSelector.prototype.template = template;

  KitSelector.prototype.events = {
    'touchstart .btn': 'onBtnPress',
    'touchend .btn-left': 'onLeftBtnClick',
    'touchend .btn-right': 'onRightBtnClick'
  };

  KitSelector.prototype.render = function(options) {
    KitSelector.__super__.render.call(this, options);
    this.$kitLabel = this.$el.find('.label-kit').find('div');
    if (this.appModel.get('kitModel') === null) {
      this.appModel.set('kitModel', this.kitCollection.at(0));
    }
    this.$kitLabel.text(this.appModel.get('kitModel').get('label'));
    return this;
  };

  KitSelector.prototype.show = function() {
    if (!this.isMobile) {
      return TweenLite.fromTo(this.$el, .4, {
        y: -100
      }, {
        y: 0,
        ease: Expo.easeOut,
        delay: .3
      });
    }
  };

  KitSelector.prototype.hide = function() {
    if (!this.isMobile) {
      return TweenLite.fromTo(this.$el, .4, {
        y: 0
      }, {
        y: -100,
        ease: Expo.easeOut
      });
    }
  };

  KitSelector.prototype.addEventListeners = function() {
    return this.listenTo(this.appModel, AppEvent.CHANGE_KIT, this.onChangeKit);
  };

  KitSelector.prototype.onBtnPress = function(event) {
    return $(event.currentTarget).addClass('press');
  };

  KitSelector.prototype.onLeftBtnClick = function(event) {
    $(event.currentTarget).removeClass('press');
    return this.appModel.set('kitModel', this.kitCollection.previousKit());
  };

  KitSelector.prototype.onRightBtnClick = function(event) {
    $(event.currentTarget).removeClass('press');
    return this.appModel.set('kitModel', this.kitCollection.nextKit());
  };

  KitSelector.prototype.onChangeKit = function(model) {
    var delay;
    this.kitModel = model.changed.kitModel;
    delay = this.isMobile ? .5 : 0;
    return TweenLite.to(this.$kitLabel, .2, {
      y: -20,
      ease: Expo.easeIn,
      delay: delay,
      onComplete: (function(_this) {
        return function() {
          _this.$kitLabel.text(_this.kitModel.get('label'));
          return TweenLite.fromTo(_this.$kitLabel, .2, {
            y: 20
          }, {
            y: 0,
            ease: Expo.easeOut
          });
        };
      })(this)
    });
  };

  return KitSelector;

})(View);

module.exports = KitSelector;


},{"../../../events/AppEvent.coffee":12,"../../../supers/View.coffee":28,"./templates/kit-selection-template.hbs":60}],37:[function(require,module,exports){

/**
 * Pattern selector for prepopulating tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   4.1.14
 */
var AppConfig, AppEvent, PatternSelector, SharedTrackModel, View, presets, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../../config/AppConfig.coffee');

AppEvent = require('../../../events/AppEvent.coffee');

SharedTrackModel = require('../../../models/SharedTrackModel.coffee');

View = require('../../../supers/View.coffee');

presets = require('../../../config/Presets');

template = require('./templates/pattern-selector-template.hbs');

PatternSelector = (function(_super) {
  __extends(PatternSelector, _super);

  function PatternSelector() {
    this.onBtnClick = __bind(this.onBtnClick, this);
    return PatternSelector.__super__.constructor.apply(this, arguments);
  }

  PatternSelector.prototype.className = 'container-pattern-selector';

  PatternSelector.prototype.template = template;

  PatternSelector.selectedIndex = -1;

  PatternSelector.prototype.events = {
    'touchstart .btn': 'onBtnPress',
    'touchend .btn': 'onBtnClick'
  };

  PatternSelector.prototype.initialize = function(options) {
    PatternSelector.__super__.initialize.call(this, options);
    return this.presetModels = _.map(presets, function(preset) {
      return new SharedTrackModel(preset.track);
    });
  };

  PatternSelector.prototype.render = function(options) {
    PatternSelector.__super__.render.call(this, options);
    this.$btns = this.$el.find('.btn');
    return this;
  };

  PatternSelector.prototype.onBtnPress = function(event) {
    return $(event.currentTarget).addClass('press');
  };

  PatternSelector.prototype.onBtnClick = function(event) {
    var $btn, self;
    self = this;
    $btn = $(event.currentTarget);
    $btn.removeClass('press');
    this.$btns.each(function(index) {
      if ($btn.text() !== $(this).text()) {
        return $(this).removeClass('selected');
      } else {
        return self.selectedIndex = index;
      }
    });
    if ($btn.hasClass('selected') === false) {
      $btn.addClass('selected');
    } else {
      $btn.removeClass('selected');
      self.selectedIndex = -1;
    }
    return this.importTrack();
  };

  PatternSelector.prototype.importTrack = function() {
    var sharedTrackModel;
    if (this.selectedIndex !== -1) {
      sharedTrackModel = this.presetModels[this.selectedIndex];
      this.appModel.set({
        'bpm': sharedTrackModel.get('bpm'),
        'sharedTrackModel': sharedTrackModel
      });
      return this.sequencer.importTrack({
        kitType: sharedTrackModel.get('kitType'),
        instruments: sharedTrackModel.get('instruments'),
        patternSquareGroups: sharedTrackModel.get('patternSquareGroups')
      });
    } else {
      this.appModel.set({
        'bpm': 120,
        'sharedTrackModel': null
      });
      return this.sequencer.renderTracks();
    }
  };

  return PatternSelector;

})(View);

module.exports = PatternSelector;


},{"../../../config/AppConfig.coffee":10,"../../../config/Presets":11,"../../../events/AppEvent.coffee":12,"../../../models/SharedTrackModel.coffee":16,"../../../supers/View.coffee":28,"./templates/pattern-selector-template.hbs":61}],38:[function(require,module,exports){

/**
 * Play / Pause button toggle
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.28.14
 */
var AppConfig, AppEvent, PlayPauseBtn, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../../config/AppConfig.coffee');

AppEvent = require('../../../events/AppEvent.coffee');

View = require('../../../supers/View.coffee');

template = require('./templates/play-pause-template.hbs');

PlayPauseBtn = (function(_super) {
  __extends(PlayPauseBtn, _super);

  function PlayPauseBtn() {
    this.onClick = __bind(this.onClick, this);
    this.onMouseOut = __bind(this.onMouseOut, this);
    this.onMouseOver = __bind(this.onMouseOver, this);
    this.onPlayChange = __bind(this.onPlayChange, this);
    return PlayPauseBtn.__super__.constructor.apply(this, arguments);
  }

  PlayPauseBtn.prototype.className = 'btn-play-pause';

  PlayPauseBtn.prototype.template = template;

  PlayPauseBtn.prototype.events = {
    'mouseover .btn-play': 'onMouseOver',
    'mouseover .btn-pause': 'onMouseOver',
    'mouseout .btn-play': 'onMouseOut',
    'mouseout .btn-pause': 'onMouseOut',
    'touchend': 'onClick'
  };

  PlayPauseBtn.prototype.render = function(options) {
    PlayPauseBtn.__super__.render.call(this, options);
    this.$playBtn = this.$el.find('.btn-play');
    this.$pauseBtn = this.$el.find('.btn-pause');
    this.$label = this.$el.find('.label-btn');
    TweenLite.set(this.$playBtn, {
      autoAlpha: 0
    });
    return this;
  };

  PlayPauseBtn.prototype.addEventListeners = function() {
    return this.listenTo(this.appModel, AppEvent.CHANGE_PLAYING, this.onPlayChange);
  };

  PlayPauseBtn.prototype.onPlayChange = function(model) {
    var playing;
    playing = model.changed.playing;
    if (playing) {
      return this.setPlayState();
    } else {
      return this.setPauseState();
    }
  };

  PlayPauseBtn.prototype.onMouseOver = function(event) {
    var $target;
    return;
    $target = $(event.currentTarget);
    return TweenLite.to($target, .2, {
      color: 'black'
    });
  };

  PlayPauseBtn.prototype.onMouseOut = function(event) {
    var $target;
    return;
    $target = $(event.currentTarget);
    return TweenLite.to($target, .2, {
      color: '#E41E2B'
    });
  };

  PlayPauseBtn.prototype.onClick = function(event) {
    var doPlay, obj, volume;
    doPlay = !this.appModel.get('playing');
    volume = doPlay === true ? 1 : 0;
    obj = {
      volume: volume === 1 ? 0 : 1
    };
    TweenLite.to(obj, .4, {
      volume: volume,
      onUpdate: (function(_this) {
        return function() {
          return createjs.Sound.setVolume(obj.volume);
        };
      })(this),
      onComplete: (function(_this) {
        return function() {
          if (doPlay === false) {
            return _this.appModel.set('playing', doPlay);
          }
        };
      })(this)
    });
    if (doPlay === true) {
      return this.appModel.set('playing', doPlay);
    } else {
      return this.setPauseState();
    }
  };

  PlayPauseBtn.prototype.setPlayState = function() {
    TweenLite.set(this.$playBtn, {
      autoAlpha: 0
    });
    TweenLite.set(this.$pauseBtn, {
      autoAlpha: 1
    });
    return this.$label.text('PAUSE');
  };

  PlayPauseBtn.prototype.setPauseState = function() {
    TweenLite.set(this.$playBtn, {
      autoAlpha: 1
    });
    TweenLite.set(this.$pauseBtn, {
      autoAlpha: 0
    });
    return this.$label.text('PLAY');
  };

  return PlayPauseBtn;

})(View);

module.exports = PlayPauseBtn;


},{"../../../config/AppConfig.coffee":10,"../../../events/AppEvent.coffee":12,"../../../supers/View.coffee":28,"./templates/play-pause-template.hbs":62}],39:[function(require,module,exports){

/**
 * Kit / Pad toggle button.
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.28.14
 */
var AppConfig, AppEvent, Toggle, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../../config/AppConfig.coffee');

AppEvent = require('../../../events/AppEvent.coffee');

View = require('../../../supers/View.coffee');

template = require('./templates/toggle-template.hbs');

Toggle = (function(_super) {
  __extends(Toggle, _super);

  function Toggle() {
    this.onShowSequencerChange = __bind(this.onShowSequencerChange, this);
    this.onPadBtnClick = __bind(this.onPadBtnClick, this);
    this.onStepsBtnClick = __bind(this.onStepsBtnClick, this);
    return Toggle.__super__.constructor.apply(this, arguments);
  }

  Toggle.prototype.className = 'toggle';

  Toggle.prototype.template = template;

  Toggle.prototype.events = {
    'touchend .btn-steps': 'onStepsBtnClick',
    'touchend .btn-pads': 'onPadBtnClick'
  };

  Toggle.prototype.render = function(options) {
    Toggle.__super__.render.call(this, options);
    this.$stepsBtn = this.$el.find('.btn-steps');
    this.$padBtn = this.$el.find('.btn-pads');
    return this;
  };

  Toggle.prototype.addEventListeners = function() {
    return this.appModel.on('change:showSequencer', this.onShowSequencerChange);
  };

  Toggle.prototype.onStepsBtnClick = function(event) {
    return this.appModel.set({
      'showSequencer': true
    });
  };

  Toggle.prototype.onPadBtnClick = function(event) {
    return this.appModel.set({
      'showSequencer': false
    });
  };

  Toggle.prototype.onShowSequencerChange = function(model) {
    if (model.changed.showSequencer) {
      this.$stepsBtn.addClass('selected');
      return this.$padBtn.removeClass('selected');
    } else {
      this.$stepsBtn.removeClass('selected');
      return this.$padBtn.addClass('selected');
    }
  };

  return Toggle;

})(View);

module.exports = Toggle;


},{"../../../config/AppConfig.coffee":10,"../../../events/AppEvent.coffee":12,"../../../supers/View.coffee":28,"./templates/toggle-template.hbs":63}],40:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":12,"../../../../supers/View.coffee":28,"./templates/instrument-template.hbs":43}],41:[function(require,module,exports){

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
    this.$container = this.$el.find('.instruments');
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


},{"../../../../events/AppEvent.coffee":12,"../../../../supers/View.coffee":28,"./Instrument.coffee":40,"./templates/instrument-panel-template.hbs":42}],42:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n<div class='container-instruments'>\n\n	<div class='label'>\n		DRUM PATTERN EDITOR\n	</div>\n\n	<div class='instruments'>\n\n	</div>\n\n</div>";
  })
},{"handleify":5}],43:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function";


  buffer += "<div class='icon ";
  if (stack1 = helpers.icon) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.icon; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'></div>";
  return buffer;
  })
},{"handleify":5}],44:[function(require,module,exports){

/**
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
 */
var AppEvent, LivePad, PadSquare, PadSquareCollection, PadSquareModel, PlayPauseBtn, PubEvent, View, instrumentsTemplate, padsTemplate, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppEvent = require('../../../../events/AppEvent.coffee');

PubEvent = require('../../../../events/PubEvent.coffee');

PadSquareCollection = require('../../../../models/pad/PadSquareCollection.coffee');

PadSquareModel = require('../../../../models/pad/PadSquareModel.coffee');

View = require('../../../../supers/View.coffee');

PadSquare = require('./PadSquare.coffee');

PlayPauseBtn = require('../PlayPauseBtn.coffee');

padsTemplate = require('./templates/pads-template.hbs');

instrumentsTemplate = require('./templates/instruments-template.hbs');

template = require('./templates/live-pad-template.hbs');

LivePad = (function(_super) {
  __extends(LivePad, _super);

  function LivePad() {
    this.parseDraggedAndDropped = __bind(this.parseDraggedAndDropped, this);
    this.returnInstrumentToDock = __bind(this.returnInstrumentToDock, this);
    this.dropInstrument = __bind(this.dropInstrument, this);
    this.onBeat = __bind(this.onBeat, this);
    this.onDraggingChange = __bind(this.onDraggingChange, this);
    this.onDroppedChange = __bind(this.onDroppedChange, this);
    this.onMouseMove = __bind(this.onMouseMove, this);
    this.onBackBtnClick = __bind(this.onBackBtnClick, this);
    this.onBackBtnPress = __bind(this.onBackBtnPress, this);
    this.onTabClick = __bind(this.onTabClick, this);
    this.onKeyPress = __bind(this.onKeyPress, this);
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

  LivePad.prototype.events = {
    'touchend .btn-edit': 'onEditBtnClick',
    'touchend .tab': 'onTabClick',
    'touchstart .btn-back': 'onBackBtnPress',
    'touchend .btn-back': 'onBackBtnClick'
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
    if (this.isMobile) {
      this.playPauseBtn = new PlayPauseBtn({
        appModel: this.appModel
      });
      this.$playPauseContainer = this.$el.find('.container-play-pause');
      this.$playLabel = this.$playPauseContainer.find('.label-btn');
      this.$instructions = this.$el.find('.instructions');
      this.$tabs = this.$el.find('.tab');
      this.$kits = this.$el.find('.container-kit');
      this.$playPauseContainer.html(this.playPauseBtn.render().el);
      this.$playLabel.text('PAUSE SEQUENCE');
      _.delay((function(_this) {
        return function() {
          return $(_this.$tabs[0]).trigger('touchend');
        };
      })(this), 100);
    }
    this.initDragAndDrop();
    return this;
  };

  LivePad.prototype.remove = function(options) {
    _.each(this.padSquareViews, (function(_this) {
      return function(view) {
        return view.remove();
      };
    })(this));
    this.$padsContainer.remove();
    return LivePad.__super__.remove.call(this);
  };

  LivePad.prototype.addEventListeners = function() {
    $(document).on('mousemove', this.onMouseMove);
    return _.each(this.KEYMAP, (function(_this) {
      return function(key) {
        return $(document).on('keydown', null, key, _this.onKeyPress);
      };
    })(this));
  };

  LivePad.prototype.removeEventListeners = function() {
    $(document).off('mousemove', this.onMouseMove);
    _.each(this.KEYMAP, (function(_this) {
      return function(key) {
        return $(document).off('keydown', null, key, _this.onKeyPress);
      };
    })(this));
    return this.stopListening();
  };

  LivePad.prototype.renderPads = function() {
    return this.$padsContainer.html(padsTemplate({
      padTable: this.returnPadTableData(),
      isDesktop: !this.isMobile
    }));
  };

  LivePad.prototype.renderInstruments = function() {
    this.$instrumentsContainer.html(instrumentsTemplate({
      instrumentTable: this.returnInstrumentTableData(),
      isDesktop: !this.isMobile
    }));
    if (this.isMobile) {
      this.$kits = this.$el.find('.container-kit');
      return this.$tabs = this.$el.find('.tab');
    }
  };

  LivePad.prototype.clearLivePad = function() {
    _.each(this.padSquareViews, (function(_this) {
      return function(padSquare, index) {
        if (padSquare.model.get('currentInstrument')) {
          padSquare.model.set('dropped', false);
          padSquare.model.get('currentInstrument').set('dropped', false);
          padSquare.model.set('currentInstrument', null);
          return padSquare.removeSoundAndClearPad();
        }
      };
    })(this));
    this.renderInstruments();
    return this.initDragAndDrop();
  };

  LivePad.prototype.onKeyPress = function(event) {
    var index, key;
    key = event.handleObj.data;
    index = _.indexOf(this.KEYMAP, key);
    return this.padSquareViews[index].onPress();
  };

  LivePad.prototype.onEditBtnClick = function(event) {
    this.$instructions.hide();
    return this.$instrumentsContainer.show();
  };

  LivePad.prototype.onTabClick = function(event) {
    var $tab;
    this.$kits.hide();
    this.$tabs.removeClass('selected');
    $tab = $(event.currentTarget);
    this.selectedIndex = $tab.index();
    $tab.addClass('selected');
    return $(this.$kits[this.selectedIndex]).show();
  };

  LivePad.prototype.onBackBtnPress = function(event) {
    return $(event.currentTarget).addClass('press');
  };

  LivePad.prototype.onBackBtnClick = function(event) {
    $(event.currentTarget).removeClass('press');
    return this.appModel.set('showSequencer', true);
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

  LivePad.prototype.onDraggingChange = function(params) {
    var $droppedInstrument, $padSquare, draggable, event, instrumentId, padSquare, position, repeat, tween;
    instrumentId = params.instrumentId, padSquare = params.padSquare, $padSquare = params.$padSquare, event = params.event;
    $droppedInstrument = $(document.getElementById(instrumentId));
    draggable = _.find(this.draggable, (function(_this) {
      return function(draggableElement) {
        if ($(draggableElement._eventTarget).attr('id') === $droppedInstrument.attr('id')) {
          return draggableElement;
        }
      };
    })(this));
    padSquare.model.set('dropped', false);
    padSquare.model.set('currentInstrument', null);
    if (this.isMobile) {
      repeat = 0;
      tween = TweenLite.to(padSquare.$el, .05, {
        backgroundColor: '#E41E2B',
        onComplete: (function(_this) {
          return function() {
            tween.reverse();
            if (repeat === 1) {
              return draggable.disable();
            }
          };
        })(this),
        onReverseComplete: (function(_this) {
          return function() {
            if (repeat < 1) {
              repeat++;
              return tween.restart();
            }
          };
        })(this)
      });
    } else {
      $droppedInstrument.css('position', 'absolute');
      $droppedInstrument.show();
      position = $padSquare.position();
      TweenLite.set($droppedInstrument, {
        scale: .8,
        top: position.top + ($padSquare.height() * .5),
        left: position.left + ($padSquare.width() * .5)
      });
      TweenLite.to($droppedInstrument, .2, {
        scale: 1.1,
        color: '#E41E2B',
        ease: Expo.easeOut,
        onComplete: function() {
          return TweenLite.to($droppedInstrument, .2, {
            scale: 1
          });
        }
      });
    }
    draggable.enable();
    draggable.update();
    return draggable.startDrag(event);
  };

  LivePad.prototype.onBeat = function(params) {
    return this.trigger(PubEvent.BEAT, params);
  };

  LivePad.prototype.initDragAndDrop = function() {
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
              _results.push(TweenLite.to(self.padSquareViews[i].$border, .2, {
                autoAlpha: 1
              }));
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(TweenLite.to(self.padSquareViews[i].$border, .2, {
              autoAlpha: 0
            }));
          }
        }
        return _results;
      },
      onDragEnd: function(event) {
        var $dragged, $dropped, droppedProperly, i, instrument;
        i = $droppables.length;
        droppedProperly = false;
        $dragged = null;
        $dropped = null;
        while (--i > -1) {
          $dragged = this.target;
          $dropped = $droppables[i];
          if (this.hitTest($droppables[i], '50%')) {
            instrument = $($droppables[i]).attr('data-instrument');
            if (instrument === null || instrument === void 0) {
              droppedProperly = true;
              self.dropInstrument($dragged, $dropped, event);
              TweenLite.to(self.padSquareViews[i].$border, .2, {
                autoAlpha: 0
              });
              break;
            } else {
              self.returnInstrumentToDock($dragged, $dropped);
              break;
            }
          }
        }
        if (droppedProperly === false) {
          return self.returnInstrumentToDock($dragged, $dropped);
        }
      }
    });
  };

  LivePad.prototype.dropInstrument = function(dragged, dropped, event) {
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
        _this.initDragAndDrop();
        if (_this.isMobile) {
          return _this.reselectMobileTab();
        }
      };
    })(this));
  };

  LivePad.prototype.returnInstrumentToDock = function(dragged, dropped) {
    var $dragged, $dropped, id, instrumentModel, _ref;
    _ref = this.parseDraggedAndDropped(dragged, dropped), $dragged = _ref.$dragged, $dropped = _ref.$dropped, id = _ref.id, instrumentModel = _ref.instrumentModel;
    instrumentModel.set({
      'dropped': false
    });
    return _.defer((function(_this) {
      return function() {
        _this.renderInstruments();
        _this.initDragAndDrop();
        if (_this.isMobile) {
          return _this.reselectMobileTab();
        }
      };
    })(this));
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
            keycode: _this.KEYMAP[iterator],
            index: iterator + 1
          });
          padSquare = new PadSquare({
            model: model,
            collection: _this.kitCollection
          });
          _this.padSquareCollection.add(model);
          _this.padSquareViews.push(padSquare);
          iterator++;
          _this.listenTo(padSquare, AppEvent.CHANGE_DRAGGING, _this.onDraggingChange);
          _this.listenTo(padSquare, PubEvent.BEAT, _this.onBeat);
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
          'icon': kit.get('icon'),
          'instruments': instruments
        };
      };
    })(this));
    return instrumentTable;
  };

  LivePad.prototype.reselectMobileTab = function() {
    this.$kits.hide();
    $(this.$kits[this.selectedIndex]).show();
    return $(this.$tabs[this.selectedIndex]).addClass('selected');
  };

  return LivePad;

})(View);

module.exports = LivePad;


},{"../../../../events/AppEvent.coffee":12,"../../../../events/PubEvent.coffee":13,"../../../../models/pad/PadSquareCollection.coffee":19,"../../../../models/pad/PadSquareModel.coffee":20,"../../../../supers/View.coffee":28,"../PlayPauseBtn.coffee":38,"./PadSquare.coffee":45,"./templates/instruments-template.hbs":46,"./templates/live-pad-template.hbs":47,"./templates/pads-template.hbs":49}],45:[function(require,module,exports){

/**
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
 */
var AppConfig, AppEvent, PadSquare, PubEvent, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../../../config/AppConfig.coffee');

AppEvent = require('../../../../events/AppEvent.coffee');

PubEvent = require('../../../../events/PubEvent.coffee');

View = require('../../../../supers/View.coffee');

template = require('./templates/pad-square-template.hbs');

PadSquare = (function(_super) {
  __extends(PadSquare, _super);

  function PadSquare() {
    this.onSoundEnd = __bind(this.onSoundEnd, this);
    this.onInstrumentChange = __bind(this.onInstrumentChange, this);
    this.onTriggerChange = __bind(this.onTriggerChange, this);
    this.onDroppedChange = __bind(this.onDroppedChange, this);
    this.onHold = __bind(this.onHold, this);
    this.onRelease = __bind(this.onRelease, this);
    this.onPress = __bind(this.onPress, this);
    return PadSquare.__super__.constructor.apply(this, arguments);
  }

  PadSquare.prototype.DRAG_TRIGGER_DELAY = 600;

  PadSquare.prototype.className = 'pad-square';

  PadSquare.prototype.template = template;

  PadSquare.prototype.model = null;

  PadSquare.prototype.currentIcon = null;

  PadSquare.prototype.audioPlayback = null;

  PadSquare.prototype.events = {
    'touchstart': 'onPress',
    'taphold': 'onHold'
  };

  PadSquare.prototype.render = function(options) {
    PadSquare.__super__.render.call(this, options);
    this.$border = this.$el.find('.border-dark');
    this.$keycode = this.$el.find('.key-code');
    this.$iconContainer = this.$el.find('.container-icon');
    this.$icon = this.$iconContainer.find('.icon');
    TweenLite.set(this.$border, {
      autoAlpha: 0
    });
    TweenLite.set(this.$keycode, {
      scale: .7
    });
    return this;
  };

  PadSquare.prototype.remove = function() {
    this.removeSoundAndClearPad();
    return PadSquare.__super__.remove.call(this);
  };

  PadSquare.prototype.addEventListeners = function() {
    this.listenTo(this.model, AppEvent.CHANGE_TRIGGER, this.onTriggerChange);
    this.listenTo(this.model, AppEvent.CHANGE_DROPPED, this.onDroppedChange);
    return this.listenTo(this.model, AppEvent.CHANGE_INSTRUMENT, this.onInstrumentChange);
  };

  PadSquare.prototype.updateInstrumentClass = function() {
    var instrument;
    instrument = this.model.get('currentInstrument');
    this.instrumentId = instrument.get('id');
    return this.$el.parent().addClass(this.instrumentId);
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
    var audioSrc, instrument;
    instrument = this.model.get('currentInstrument');
    if (instrument !== null) {
      audioSrc = instrument.get('src');
      this.audioPlayback = createjs.Sound.createInstance(audioSrc);
      this.audioPlayback.volume = AppConfig.VOLUME_LEVELS.high;
      return this.audioPlayback.addEventListener('complete', this.onSoundEnd);
    }
  };

  PadSquare.prototype.playSound = function() {
    var _ref;
    if ((_ref = this.audioPlayback) != null) {
      _ref.play();
    }
    if (!this.isMobile) {
      if (this.model.get('currentInstrument')) {
        this.trigger(PubEvent.BEAT, {
          livePad: true
        });
      }
    }
    return this.model.set('trigger', false);
  };

  PadSquare.prototype.removeSoundAndClearPad = function() {
    var currentInstrument, icon, id;
    if (this.model.get('currentInstrument') === null) {
      return;
    }
    this.audioPlayback = null;
    currentInstrument = this.model.get('currentInstrument');
    id = currentInstrument.get('id');
    icon = currentInstrument.get('icon');
    this.$el.parent().removeAttr('data-instrument');
    this.$el.parent().removeClass(id);
    this.$el.removeClass(id);
    this.$icon.removeClass(icon);
    return this.$icon.text('');
  };

  PadSquare.prototype.onPress = function(event) {
    this.model.set('trigger', true);
    return TweenLite.to(this.$el, .2, {
      backgroundColor: '#E41E2B',
      onComplete: (function(_this) {
        return function() {
          return TweenLite.to(_this.$el, .2, {
            backgroundColor: '#e5e5e5'
          });
        };
      })(this)
    });
  };

  PadSquare.prototype.onRelease = function(event) {
    return this.model.set('dragging', false);
  };

  PadSquare.prototype.onHold = function(event) {
    var currentInstrument, instrumentId;
    currentInstrument = this.model.get('currentInstrument');
    instrumentId = this.$el.parent().attr('data-instrument');
    if (currentInstrument === null) {
      return;
    }
    this.model.set('dropped', false);
    currentInstrument.set('dropped', false);
    return this.trigger(AppEvent.CHANGE_DRAGGING, {
      'instrumentId': instrumentId,
      'padSquare': this,
      '$padSquare': this.$el.parent(),
      'event': event
    });
  };

  PadSquare.prototype.onDroppedChange = function(model) {
    var dropped;
    dropped = model.changed.dropped;
    if (dropped === false) {
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
      this.model.set('dropped', true);
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


},{"../../../../config/AppConfig.coffee":10,"../../../../events/AppEvent.coffee":12,"../../../../events/PubEvent.coffee":13,"../../../../supers/View.coffee":28,"./templates/pad-square-template.hbs":48}],46:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n\n	<div class=\"headline\">\n		DRAG DRUM BELOW TO ASSIGN TO NEW PAD\n	</div>\n\n	";
  stack1 = helpers.each.call(depth0, depth0.instrumentTable, {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n\n\n\n"
    + "\n";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n		<div class='container-kit'>\n			<div class='kit-type'>\n				<span>";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n			</div>\n\n			";
  stack1 = helpers.each.call(depth0, depth0.instruments, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n		</div>\n	";
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n\n				<div class='instrument ";
  if (stack1 = helpers.icon) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.icon; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, depth0.dropped, {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "' id=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n\n				</div>\n			";
  return buffer;
  }
function program4(depth0,data) {
  
  
  return " hidden ";
  }

function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n\n	<div class=\"headline\">\n		DRAG DRUM BELOW TO ASSIGN TO NEW PAD\n	</div>\n\n	<div class='container-tabs'>\n		";
  stack1 = helpers.each.call(depth0, depth0.instrumentTable, {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</div>\n\n	";
  stack1 = helpers.each.call(depth0, depth0.instrumentTable, {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n			<div class='tab'>\n				<div class='kit-type'>\n					<span>";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n				</div>\n			</div>\n		";
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n		<div class='container-kit'>\n\n			";
  stack1 = helpers.each.call(depth0, depth0.instruments, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n		</div>\n	";
  return buffer;
  }

  buffer += "\n\n"
    + "\n\n";
  stack1 = helpers['if'].call(depth0, depth0.isDesktop, {hash:{},inverse:self.program(6, program6, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })
},{"handleify":5}],47:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n\n	<div class='wrapper'>\n		<div class='left-wrapper'>\n			<div class='left'>\n				<table class='container-pads'>\n\n				</table>\n			</div>\n		</div>\n		<div class='right'>\n			<div class='container-instruments'>\n\n			</div>\n		</div>\n	</div>\n\n\n\n"
    + "\n";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "\n\n	<div class='wrapper'>\n		<div class='left-wrapper'>\n			<div class='left'>\n				<table class='container-pads'>\n\n				</table>\n			</div>\n		</div>\n\n		<div class='right'>\n\n			<div class='top'>\n				<div class='container-play-pause'>\n					play pause\n				</div>\n			</div>\n\n			<div class='middle'>\n				<div class='container-instruments'>\n\n				</div>\n			</div>\n\n			<div class='bottom'>\n				<div class=\"btn-back btn\">&lt; Back</div>\n			</div>\n		</div>\n	</div>\n\n";
  }

  buffer += "\n"
    + "\n\n";
  stack1 = helpers['if'].call(depth0, depth0.isDesktop, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })
},{"handleify":5}],48:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n	<div class='pad-number'>\n		<span class='text'>\n			PAD ";
  if (stack1 = helpers.index) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.index; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n		</span>\n	</div>\n\n	<div class='key-code'>\n		<span class='text'>\n			";
  if (stack1 = helpers.keycode) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.keycode; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n		</span>\n	</div>\n";
  return buffer;
  }

  buffer += "<div class='border-dark' />\n\n";
  stack1 = helpers['if'].call(depth0, depth0.isDesktop, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n<div class='container-icon'>\n	<div class='icon'>\n\n	</div>\n</div>";
  return buffer;
  })
},{"handleify":5}],49:[function(require,module,exports){
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
},{"handleify":5}],50:[function(require,module,exports){

/**
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppConfig, AppEvent, PatternSquare, PubEvent, PubSub, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PubSub = require('../../../../utils/PubSub');

AppConfig = require('../../../../config/AppConfig.coffee');

PubEvent = require('../../../../events/PubEvent.coffee');

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
    'mouseover': 'onMouseOver',
    'mouseout': 'onMouseOut',
    'touchend': 'onClick'
  };

  PatternSquare.prototype.render = function(options) {
    var audioSrc;
    PatternSquare.__super__.render.call(this, options);
    this.$border = this.$el.find('.border-dark');
    this.$icon = this.$el.find('.icon');
    TweenLite.set(this.$border, {
      autoAlpha: 0
    });
    TweenLite.set(this.$icon, {
      autoAlpha: 0,
      scale: 0
    });
    audioSrc = '';
    if (this.patternSquareModel.get('instrument')) {
      this.audioSrc = audioSrc = this.patternSquareModel.get('instrument').get('src');
    }
    this.audioPlayback = createjs.Sound.createInstance(audioSrc);
    this.audioPlayback.addEventListener('complete', this.onSoundEnd);
    return this;
  };

  PatternSquare.prototype.remove = function() {
    this.audioPlayback = null;
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
    if (!this.isMobile) {
      this.trigger(PubEvent.BEAT, {
        patternSquareModel: this.patternSquareModel.toJSON()
      });
    }
    TweenLite.to(this.$icon, .3, {
      scale: 1.2,
      ease: Back.easeOut,
      onComplete: (function(_this) {
        return function() {
          return TweenLite.to(_this.$icon, .3, {
            scale: 1,
            ease: Back.easeOut
          });
        };
      })(this)
    });
    return TweenLite.to(this.$el, .2, {
      backgroundColor: "#E41E2B",
      onComplete: (function(_this) {
        return function() {
          return TweenLite.to(_this.$el, .2, {
            backgroundColor: "#E5E5E5"
          });
        };
      })(this)
    });
  };

  PatternSquare.prototype.onMouseOver = function(event) {
    return TweenLite.to(this.$border, .2, {
      autoAlpha: .5
    });
  };

  PatternSquare.prototype.onMouseOut = function(event) {
    return TweenLite.to(this.$border, .2, {
      autoAlpha: 0
    });
  };

  PatternSquare.prototype.onClick = function(event) {
    return this.patternSquareModel.cycle();
  };

  PatternSquare.prototype.onVelocityChange = function(model) {
    var addClass, removeClass, rotation, velocity, velocityClass, volume;
    removeClass = (function(_this) {
      return function() {
        return _this.$icon.removeClass('velocity-soft velocity-medium velocity-hard play');
      };
    })(this);
    addClass = (function(_this) {
      return function() {
        return _this.$icon.addClass(velocityClass);
      };
    })(this);
    velocity = model.changed.velocity;
    velocityClass = (function() {
      switch (velocity) {
        case 1:
          return 'velocity-soft play';
        case 2:
          return 'velocity-medium play';
        case 3:
          return 'velocity-hard play';
        default:
          return '';
      }
    })();
    if (velocityClass !== '') {
      removeClass();
      if (velocityClass === 'velocity-soft play') {
        TweenLite.set(this.$icon, {
          autoAlpha: 0,
          scale: 0
        });
      }
      rotation = (function() {
        switch (velocity) {
          case 1:
            return 90;
          case 2:
            return 180;
          case 3:
            return 270;
          default:
            return 0;
        }
      })();
      TweenLite.to(this.$icon, .2, {
        autoAlpha: 1,
        scale: 1,
        rotation: rotation,
        ease: Expo.easeOut
      });
      addClass();
    } else {
      TweenLite.to(this.$icon, .2, {
        scale: 0,
        ease: Back.easeIn,
        onComplete: (function(_this) {
          return function() {
            TweenLite.set(_this.$icon, {
              rotation: 0
            });
            return removeClass();
          };
        })(this)
      });
    }
    this.onMouseOut();
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
    return this.audioPlayback.volume = volume;
  };

  PatternSquare.prototype.onActiveChange = function(model) {};

  PatternSquare.prototype.onTriggerChange = function(model) {
    if (model.changed.trigger === true) {
      this.play();
      return this.patternSquareModel.set('trigger', false);
    }
  };

  PatternSquare.prototype.onSoundEnd = function() {
    return this.patternSquareModel.set('trigger', false);
  };

  return PatternSquare;

})(View);

module.exports = PatternSquare;


},{"../../../../config/AppConfig.coffee":10,"../../../../events/AppEvent.coffee":12,"../../../../events/PubEvent.coffee":13,"../../../../supers/View.coffee":28,"../../../../utils/PubSub":31,"./templates/pattern-square-template.hbs":53}],51:[function(require,module,exports){

/**
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent, PatternSquare, PatternSquareCollection, PatternSquareModel, PatternTrack, PubEvent, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppEvent = require('../../../../events/AppEvent.coffee');

PubEvent = require('../../../../events/PubEvent.coffee');

PatternSquareCollection = require('../../../../models/sequencer/PatternSquareCollection.coffee');

PatternSquareModel = require('../../../../models/sequencer/PatternSquareModel.coffee');

PatternSquare = require('./PatternSquare.coffee');

View = require('../../../../supers/View.coffee');

template = require('./templates/pattern-track-template.hbs');

PatternTrack = (function(_super) {
  __extends(PatternTrack, _super);

  function PatternTrack() {
    this.onMuteBtnClick = __bind(this.onMuteBtnClick, this);
    this.onInstrumentBtnClick = __bind(this.onInstrumentBtnClick, this);
    this.onInstrumentChange = __bind(this.onInstrumentChange, this);
    this.onBeat = __bind(this.onBeat, this);
    this.addEventListeners = __bind(this.addEventListeners, this);
    return PatternTrack.__super__.constructor.apply(this, arguments);
  }

  PatternTrack.prototype.className = 'pattern-track';

  PatternTrack.prototype.tagName = 'tr';

  PatternTrack.prototype.template = template;

  PatternTrack.prototype.patternSquareViews = null;

  PatternTrack.prototype.collection = null;

  PatternTrack.prototype.model = null;

  PatternTrack.prototype.events = {
    'touchend .instrument': 'onInstrumentBtnClick',
    'touchend .btn-mute': 'onMuteBtnClick'
  };

  PatternTrack.prototype.render = function(options) {
    PatternTrack.__super__.render.call(this, options);
    this.$instrument = this.$el.find('.instrument');
    this.$mute = this.$el.find('.btn-mute');
    this.$mute.hide();
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
        model.set('orderIndex', _this.orderIndex);
        patternSquare = new PatternSquare({
          patternSquareModel: model
        });
        _this.$instrument.text(model.get('label'));
        _this.$el.append(patternSquare.render().el);
        _this.patternSquareViews.push(patternSquare);
        return _this.listenTo(patternSquare, PubEvent.BEAT, _this.onBeat);
      };
    })(this));
    return this.model.set('patternSquares', this.collection);
  };

  PatternTrack.prototype.select = function() {
    return this.$el.addClass('selected');
  };

  PatternTrack.prototype.deselect = function() {
    if (this.$el.hasClass('selected')) {
      return this.$el.removeClass('selected');
    }
  };

  PatternTrack.prototype.onBeat = function(params) {
    return this.trigger(PubEvent.BEAT, params);
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

  PatternTrack.prototype.onInstrumentBtnClick = function(event) {
    if (this.model.get('mute') === false && this.model.get('focus') === false) {
      return this.model.set({
        'mute': true
      });
    }
    if (this.model.get('mute')) {
      return this.model.set({
        'mute': false
      });
    }
  };

  PatternTrack.prototype.onMuteBtnClick = function(event) {
    return this.model.set('mute', !this.model.get('mute'));
  };

  return PatternTrack;

})(View);

module.exports = PatternTrack;


},{"../../../../events/AppEvent.coffee":12,"../../../../events/PubEvent.coffee":13,"../../../../models/sequencer/PatternSquareCollection.coffee":23,"../../../../models/sequencer/PatternSquareModel.coffee":24,"../../../../supers/View.coffee":28,"./PatternSquare.coffee":50,"./templates/pattern-track-template.hbs":54}],52:[function(require,module,exports){

/**
 * Sequencer parent view for track sequences
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
 */
var AppEvent, PatternTrack, PubEvent, PubSub, Sequencer, View, helpers, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PatternTrack = require('./PatternTrack.coffee');

PubSub = require('../../../../utils/PubSub');

AppEvent = require('../../../../events/AppEvent.coffee');

PubEvent = require('../../../../events/PubEvent.coffee');

View = require('../../../../supers/View.coffee');

helpers = require('../../../../helpers/handlebars-helpers');

template = require('./templates/sequencer-template.hbs');

Sequencer = (function(_super) {
  __extends(Sequencer, _super);

  function Sequencer() {
    this.onMuteChange = __bind(this.onMuteChange, this);
    this.onFocusChange = __bind(this.onFocusChange, this);
    this.importTrack = __bind(this.importTrack, this);
    this.onKitChange = __bind(this.onKitChange, this);
    this.onInstrumentChange = __bind(this.onInstrumentChange, this);
    this.onMuteChange = __bind(this.onMuteChange, this);
    this.onPlayingChange = __bind(this.onPlayingChange, this);
    this.onBPMChange = __bind(this.onBPMChange, this);
    this.onBeat = __bind(this.onBeat, this);
    this.updateTime = __bind(this.updateTime, this);
    this.renderTracks = __bind(this.renderTracks, this);
    return Sequencer.__super__.constructor.apply(this, arguments);
  }

  Sequencer.prototype.id = 'container-sequencer';

  Sequencer.prototype.template = template;

  Sequencer.prototype.patternTrackViews = null;

  Sequencer.prototype.bpmInterval = null;

  Sequencer.prototype.updateIntervalTime = 200;

  Sequencer.prototype.currBeatCellId = -1;

  Sequencer.prototype.numCells = 7;

  Sequencer.prototype.appModel = null;

  Sequencer.prototype.collection = null;

  Sequencer.prototype.kitCollection = null;

  Sequencer.prototype.render = function(options) {
    Sequencer.__super__.render.call(this, options);
    this.$thStepper = this.$el.find('th.stepper');
    this.$sequencer = this.$el.find('.sequencer');
    $(this.$thStepper[0]).addClass('step');
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
    window.clearInterval(this.bpmInterval);
    return Sequencer.__super__.remove.call(this);
  };

  Sequencer.prototype.addEventListeners = function() {
    this.listenTo(this.appModel, AppEvent.CHANGE_BPM, this.onBPMChange);
    this.listenTo(this.appModel, AppEvent.CHANGE_PLAYING, this.onPlayingChange);
    this.listenTo(this.appModel, AppEvent.CHANGE_KIT, this.onKitChange);
    this.listenTo(this.appModel.get('kitModel'), AppEvent.CHANGE_INSTRUMENT, this.onInstrumentChange);
    this.listenTo(this.collection, AppEvent.CHANGE_FOCUS, this.onFocusChange);
    this.listenTo(this.collection, AppEvent.CHANGE_MUTE, this.onMuteChange);
    return PubSub.on(AppEvent.IMPORT_TRACK, this.importTrack);
  };

  Sequencer.prototype.removeEventListeners = function() {
    PubSub.off(AppEvent.IMPORT_TRACK);
    PubSub.off(AppEvent.EXPORT_TRACK);
    return Sequencer.__super__.removeEventListeners.call(this);
  };

  Sequencer.prototype.renderTracks = function() {
    this.$el.find('.pattern-track').remove();
    this.patternTrackViews = [];
    return this.collection.each((function(_this) {
      return function(model, index) {
        var patternTrack;
        patternTrack = new PatternTrack({
          appModel: _this.appModel,
          collection: model.get('patternSquares'),
          model: model,
          orderIndex: index
        });
        _this.patternTrackViews.push(patternTrack);
        _this.$sequencer.append(patternTrack.render().el);
        return _this.listenTo(patternTrack, PubEvent.BEAT, _this.onBeat);
      };
    })(this));
  };

  Sequencer.prototype.updateTime = function() {
    this.$thStepper.removeClass('step');
    this.$sequencer.find('td').removeClass('step');
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

  Sequencer.prototype.onBeat = function(params) {
    return this.trigger(PubEvent.BEAT, params);
  };

  Sequencer.prototype.onBPMChange = function(model) {
    window.clearInterval(this.bpmInterval);
    this.updateIntervalTime = model.changed.bpm;
    if (this.appModel.get('playing')) {
      return this.bpmInterval = window.setInterval(this.updateTime, this.updateIntervalTime);
    }
  };

  Sequencer.prototype.onPlayingChange = function(model) {
    var playing;
    playing = model.changed.playing;
    if (playing) {
      return this.bpmInterval = window.setInterval(this.updateTime, this.updateIntervalTime);
    } else {
      window.clearInterval(this.bpmInterval);
      return this.bpmInterval = null;
    }
  };

  Sequencer.prototype.onMuteChange = function(model) {};

  Sequencer.prototype.onInstrumentChange = function(model) {
    var $patternTracks, iconClass, selectedInstrument;
    selectedInstrument = model.changed.currentInstrument;
    iconClass = selectedInstrument.get('icon');
    $patternTracks = this.$el.find('.pattern-track');
    return $patternTracks.each(function() {
      var $track;
      $track = $(this);
      if ($track.find('.instrument').hasClass(iconClass)) {
        $track.show();
        return TweenLite.fromTo($track, .6, {
          y: 100
        }, {
          immediateRender: true,
          y: 0,
          ease: Expo.easeInOut
        });
      } else {
        return $track.hide();
      }
    });
  };

  Sequencer.prototype.onKitChange = function(model) {
    var oldInstrumentCollection, oldPatternSquares;
    this.removeEventListeners();
    this.collection = model.changed.kitModel.get('instruments');
    this.renderTracks();
    oldInstrumentCollection = model._previousAttributes.kitModel.get('instruments');
    oldPatternSquares = oldInstrumentCollection.exportPatternSquares();
    this.collection.each(function(instrumentModel, index) {
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
          oldPatternSquare = oldPatternSquare.toJSON();
          oldPatternSquare.trigger = false;
          return patternSquare.set(oldPatternSquare);
        });
      }
    });
    return this.addEventListeners();
  };

  Sequencer.prototype.importTrack = function(params) {
    var callback, instruments, kitType, patternSquareGroups;
    callback = params.callback, patternSquareGroups = params.patternSquareGroups, instruments = params.instruments, kitType = params.kitType;
    this.appModel.set('kitModel', this.kitCollection.findWhere({
      label: kitType
    }));
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
        var squareData;
        squareData = patternSquareGroups[iterator][index];
        squareData.trigger = false;
        return patternModel.set(squareData);
      });
    });
    if (callback) {
      return callback();
    }
  };

  Sequencer.prototype.onFocusChange = function(model) {
    var doFocus, selectedIndex;
    doFocus = model.changed.focus;
    selectedIndex = this.collection.indexOf(model);
    this.collection.each((function(_this) {
      return function(instrumentModel, index) {
        if (model.changed.focus === true) {
          if (model.cid !== instrumentModel.cid) {
            return instrumentModel.set('focus', false, {
              trigger: false
            });
          }
        }
      };
    })(this));
    return this.collection.each((function(_this) {
      return function(instrumentModel, index) {
        var view;
        view = _this.patternTrackViews[index];
        if (model === instrumentModel) {
          if (doFocus === true) {
            return view.$el.removeClass('defocused');
          }
        } else {
          if (doFocus === true) {
            return view.$el.addClass('defocused');
          } else {
            return view.$el.removeClass('defocused');
          }
        }
      };
    })(this));
  };

  Sequencer.prototype.onMuteChange = function(model) {
    var selectedIndex;
    selectedIndex = this.collection.indexOf(model);
    return this.collection.each((function(_this) {
      return function(instrumentModel, index) {
        var view;
        view = _this.patternTrackViews[index];
        if (selectedIndex === index) {
          if (model.changed.mute === true) {
            return view.$el.addClass('mute');
          } else {
            return view.$el.removeClass('mute');
          }
        }
      };
    })(this));
  };

  return Sequencer;

})(View);

module.exports = Sequencer;


},{"../../../../events/AppEvent.coffee":12,"../../../../events/PubEvent.coffee":13,"../../../../helpers/handlebars-helpers":14,"../../../../supers/View.coffee":28,"../../../../utils/PubSub":31,"./PatternTrack.coffee":51,"./templates/sequencer-template.hbs":55}],53:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='inner-container'>\n	<div class='border-dark' />\n\n	<div class='icon'>\n\n	</div>\n</div>";
  })
},{"handleify":5}],54:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<td class='instrument ";
  if (stack1 = helpers.icon) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.icon; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "' />\n<td class='btn-mute'>\n	mute\n</td>\n";
  return buffer;
  })
},{"handleify":5}],55:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n				"
    + "\n				<th></th>\n			";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "\n				<th class='stepper'></th>\n			";
  }

  buffer += "\n<div class='wrapper'>\n	<table class='sequencer'>\n		<tr>\n\n			";
  stack1 = helpers['if'].call(depth0, depth0.isDesktop, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n\n			"
    + "\n			<th style='display:none'></th>\n\n			";
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data};
  stack2 = ((stack1 = helpers.repeat || depth0.repeat),stack1 ? stack1.call(depth0, 8, options) : helperMissing.call(depth0, "repeat", 8, options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n		</tr>\n	</table>\n</div>";
  return buffer;
  })
},{"handleify":5}],56:[function(require,module,exports){

/**
 * Share modal pop-down
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.26.14
 */
var AppConfig, AppEvent, ShareModal, SpinIcon, View, previewTemplate, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppConfig = require('../../../../config/AppConfig.coffee');

AppEvent = require('../../../../events/AppEvent.coffee');

View = require('../../../../supers/View.coffee');

SpinIcon = require('../../../../utils/SpinIcon');

previewTemplate = require('./templates/share-preview-template.hbs');

template = require('./templates/share-modal-template.hbs');

ShareModal = (function(_super) {
  __extends(ShareModal, _super);

  function ShareModal() {
    this.createClipboardListeners = __bind(this.createClipboardListeners, this);
    this.renderServiceOptions = __bind(this.renderServiceOptions, this);
    this.showForm = __bind(this.showForm, this);
    this.onWrapperClick = __bind(this.onWrapperClick, this);
    this.onTumblrBtnClick = __bind(this.onTumblrBtnClick, this);
    this.onCopyBtnClick = __bind(this.onCopyBtnClick, this);
    this.onCloseBtnClick = __bind(this.onCloseBtnClick, this);
    this.onCloseBtnPress = __bind(this.onCloseBtnPress, this);
    this.onBackBtnClick = __bind(this.onBackBtnClick, this);
    this.onSelectYourServiceBtnClick = __bind(this.onSelectYourServiceBtnClick, this);
    this.onShareIdChange = __bind(this.onShareIdChange, this);
    this.onInputBlur = __bind(this.onInputBlur, this);
    this.onInputKeyPress = __bind(this.onInputKeyPress, this);
    this.onLinkBtnClick = __bind(this.onLinkBtnClick, this);
    return ShareModal.__super__.constructor.apply(this, arguments);
  }

  ShareModal.prototype.FORM_TWEEN_TIME = .3;

  ShareModal.prototype.ERROR_MSG = 'Error saving track';

  ShareModal.prototype.SHARE_MSG = 'NEED SHARE MESSAGE';

  ShareModal.prototype.className = 'container-share-modal';

  ShareModal.prototype.template = template;

  ShareModal.prototype.sharedTrackModel = null;

  ShareModal.prototype.events = {
    'click .btn-link': 'onLinkBtnClick',
    'click .btn-select-service': 'onSelectYourServiceBtnClick',
    'touchend .btn-close': 'onCloseBtnClick',
    'click': 'onCloseBtnClick',
    'click .wrapper': 'onWrapperClick',
    'click .btn-tumblr': 'onTumblrBtnClick',
    'keypress .input-name': 'onInputKeyPress',
    'blur .input-title': 'onInputBlur',
    'blur .input-name': 'onInputBlur',
    'blur .input-message': 'onInputBlur',
    'touchstart .btn-close-share': 'onCloseBtnPress'
  };

  ShareModal.prototype.render = function(options) {
    ShareModal.__super__.render.call(this, options);
    this.$wrapper = this.$el.find('.wrapper');
    this.$form = this.$el.find('.container-form');
    this.$preview = this.$el.find('.container-preview');
    this.$formWrapper = this.$el.find('.form-wrapper');
    this.$closeBtn = this.$el.find('.btn-close');
    this.$nameInput = this.$el.find('.input-name');
    this.$titleInput = this.$el.find('.input-title');
    this.$messageInput = this.$el.find('.input-message');
    this.$preloader = this.$el.find('.preloader');
    this.$serviceBtn = this.$el.find('.btn-select-service');
    this.$serviceText = this.$serviceBtn.find('.text');
    this.spinner = new SpinIcon({
      target: this.$preloader[0]
    });
    this.spinner.$el.css('margin', 'auto');
    this.spinner.show();
    this.$preloader.hide();
    TweenLite.set(this.$el, {
      autoAlpha: 0
    });
    TweenLite.set(this.$preview, {
      autoAlpha: 0
    });
    TweenLite.set(this.$preloader, {
      autoAlpha: 0,
      scale: 0
    });
    TweenLite.set(this.$closeBtn, {
      autoAlpha: 0,
      scaleX: 1.7
    });
    if (this.isMobile) {
      TweenLite.set(this.$preloader, {
        autoAlpha: 1,
        scale: 0,
        y: -12
      });
      _.each([this.$nameInput, this.$titleInput, this.$messageInput], function($input) {});
      _.defer((function(_this) {
        return function() {
          var centerY;
          centerY = (window.innerHeight * .5 - _this.$formWrapper.height()) + ($('.top-bar').height() * .5);
          return TweenLite.set(_this.$formWrapper, {
            y: centerY
          });
        };
      })(this));
    }
    return this;
  };

  ShareModal.prototype.remove = function() {
    var _ref, _ref1;
    if ((_ref = this.$backBtn) != null) {
      _ref.off('touchend', this.onBackBtnClick);
    }
    if ((_ref1 = this.$copyBtn) != null) {
      _ref1.off('touchend', this.onCopyBtnClick);
    }
    return ShareModal.__super__.remove.call(this);
  };

  ShareModal.prototype.addEventListeners = function() {
    return this.listenTo(this.appModel, AppEvent.CHANGE_SHARE_ID, this.onShareIdChange);
  };

  ShareModal.prototype.show = function() {
    if (this.isMobile) {
      return TweenLite.fromTo(this.$el, .6, {
        y: window.innerHeight
      }, {
        y: 0,
        autoAlpha: 1,
        ease: Expo.easeInOut,
        onComplete: (function(_this) {
          return function() {
            return TweenLite.to(_this.$closeBtn, .3, {
              autoAlpha: 1,
              ease: Linear.easeNone
            });
          };
        })(this)
      });
    } else {
      return TweenLite.fromTo(this.$el, this.FORM_TWEEN_TIME + .1, {
        y: 2000
      }, {
        y: 0,
        autoAlpha: 1,
        ease: Expo.easeOut,
        onComplete: (function(_this) {
          return function() {
            return TweenLite.to(_this.$closeBtn, .3, {
              autoAlpha: 1,
              ease: Linear.easeNone
            });
          };
        })(this)
      });
    }
  };

  ShareModal.prototype.hide = function() {
    this.trigger(AppEvent.CLOSE_SHARE);
    if (this.isMobile) {
      return TweenLite.to(this.$el, .6, {
        y: window.innerHeight,
        autoAlpha: 0,
        ease: Expo.easeInOut,
        onComplete: (function(_this) {
          return function() {
            return _this.remove();
          };
        })(this)
      });
    } else {
      TweenLite.to(this.$closeBtn, .2, {
        autoAlpha: 0
      });
      return TweenLite.to(this.$el, this.FORM_TWEEN_TIME + .1, {
        y: 2000,
        autoAlpha: 0,
        ease: Expo.easeIn,
        delay: .1,
        onComplete: (function(_this) {
          return function() {
            return _this.remove();
          };
        })(this)
      });
    }
  };

  ShareModal.prototype.onLinkBtnClick = function(event) {
    return console.log('link btn');
  };

  ShareModal.prototype.onInputKeyPress = function(event) {
    var key;
    key = event.which || event.keyCode;
    if (key === 13) {
      event.preventDefault();
      document.activeElement.blur();
      this.onInputBlur();
      return this.onSelectYourServiceBtnClick();
    }
  };

  ShareModal.prototype.onInputBlur = function(event) {
    return TweenLite.to($('body'), 0, {
      scrollTop: 0,
      scrollLeft: 0
    });
  };

  ShareModal.prototype.onShareIdChange = function(model) {
    var shareId;
    shareId = model.changed.shareId;
    if (shareId === null) {
      return;
    }
    return TweenLite.to(this.$preloader, .2, {
      autoAlpha: 0,
      scale: 0,
      ease: Back.easeIn,
      onComplete: (function(_this) {
        return function() {
          _this.$serviceBtn.removeClass('no-transition');
          _this.$serviceBtn.attr('style', '');
          if (shareId === 'error') {
            _this.$serviceText.text('Error saving track.');
            _.delay(function() {
              return _this.hide();
            }, 2000);
          } else {
            _this.renderServiceOptions();
          }
          return TweenLite.to(_this.$serviceText, .2, {
            autoAlpha: 1
          });
        };
      })(this)
    });
  };

  ShareModal.prototype.onSelectYourServiceBtnClick = function(event) {
    if (this.formValid() === false) {
      return;
    }
    this.$preloader.show();
    this.$serviceBtn.addClass('no-transition');
    TweenLite.to(this.$serviceBtn, .2, {
      backgroundColor: 'black'
    });
    TweenLite.to(this.$serviceText, .2, {
      autoAlpha: 0
    });
    TweenLite.to(this.$preloader, .2, {
      autoAlpha: 1,
      scale: this.isMobile ? .7 : 1,
      ease: Back.easeOut,
      delay: .1
    });
    this.sharedTrackModel.set({
      'shareName': this.$nameInput.val(),
      'shareTitle': this.$titleInput.val(),
      'shareMessage': this.SHARE_MSG
    });
    return this.trigger(AppEvent.SAVE_TRACK);
  };

  ShareModal.prototype.onBackBtnClick = function(event) {
    return this.showForm();
  };

  ShareModal.prototype.onCloseBtnPress = function(event) {
    $(event.currentTarget).addClass('press');
    return this.hide();
  };

  ShareModal.prototype.onCloseBtnClick = function(event) {
    $(event.currentTarget).removeClass('press');
    return this.hide();
  };

  ShareModal.prototype.onCopyBtnClick = function(event) {
    var $btn, $text, btnHtml, delay, tweenTime;
    if (!this.tweeningCopyText) {
      this.tweeningCopyText = true;
      $btn = this.$copyBtn;
      $text = $btn.find('.text');
      btnHtml = $btn.html();
      tweenTime = .2;
      delay = 1;
      return TweenLite.fromTo($text, tweenTime, {
        autoAlpha: 1
      }, {
        autoAlpha: 0,
        onComplete: (function(_this) {
          return function() {
            $text.html('COPIED!');
            return TweenLite.fromTo($text, tweenTime, {
              autoAlpha: 0
            }, {
              autoAlpha: 1,
              delay: .1,
              onComplete: function() {
                return TweenLite.fromTo($text, tweenTime, {
                  autoAlpha: 1
                }, {
                  autoAlpha: 0,
                  delay: delay,
                  onComplete: function() {
                    _this.tweeningCopyText = false;
                    $text.html(btnHtml);
                    $text.attr('style', '');
                    return TweenLite.fromTo($text, tweenTime, {
                      autoAlpha: 0
                    }, {
                      autoAlpha: 1,
                      delay: .1
                    });
                  }
                });
              }
            });
          };
        })(this)
      });
    }
  };

  ShareModal.prototype.onTumblrBtnClick = function(event) {
    var url;
    url = 'http://www.tumblr.com/share/link';
    url += '?url=' + encodeURIComponent(this.shareData.shareLink);
    url += '&name=' + document.title;
    url += '&description=' + encodeURIComponent(this.SHARE_MSG);
    return window.open(url, 'share', 'width=450,height=430');
  };

  ShareModal.prototype.onWrapperClick = function(event) {
    var $target;
    $target = $(event.target);
    if ($target.hasClass('icon')) {
      $target.trigger('click');
    }
    event.stopImmediatePropagation();
    return false;
  };

  ShareModal.prototype.formValid = function() {
    if (this.$titleInput.val() === '') {
      this.$titleInput.attr('placeholder', 'Please enter title');
      return false;
    }
    if (this.$nameInput.val() === '') {
      this.$nameInput.attr('placeholder', 'Please enter name');
      return false;
    }
    return true;
  };

  ShareModal.prototype.showPreview = function() {
    return TweenLite.to(this.$form, this.FORM_TWEEN_TIME, {
      autoAlpha: 0,
      x: -300,
      ease: Expo.easeIn,
      onComplete: (function(_this) {
        return function() {
          var data;
          _this.$form.hide();
          data = _this.sharedTrackModel.toJSON();
          data.isDesktop = !_this.isMobile;
          _this.$preview.html(previewTemplate(data));
          _this.$backBtn = _this.$preview.find('.btn-back');
          _this.$copyBtn = _this.$preview.find('.btn-copy-url');
          TweenLite.fromTo(_this.$preview, .4, {
            autoAlpha: 0,
            x: 300
          }, {
            autoAlpha: 1,
            x: 0,
            ease: Expo.easeOut
          });
          _this.createClipboardListeners();
          _this.$backBtn.on('touchend', _this.onBackBtnClick);
          return _this.$copyBtn.on('touchend', _this.onCopyBtnClick);
        };
      })(this)
    });
  };

  ShareModal.prototype.showForm = function() {
    this.$backBtn.off('touchend', this.onBackBtnClick);
    this.$copyBtn.off('touchend', this.onCopyBtnClick);
    return TweenLite.to(this.$preview, this.FORM_TWEEN_TIME, {
      autoAlpha: 0,
      x: 300,
      ease: Expo.easeIn,
      onComplete: (function(_this) {
        return function() {
          _this.$form.show();
          return TweenLite.fromTo(_this.$form, .4, {
            autoAlpha: 0,
            x: -300
          }, {
            autoAlpha: 1,
            x: 0,
            ease: Expo.easeOut
          });
        };
      })(this)
    });
  };

  ShareModal.prototype.renderServiceOptions = function() {
    var shareLink;
    shareLink = window.location.origin + '/#share/' + this.appModel.get('shareId');
    this.sharedTrackModel.set('shareLink', shareLink);
    this.showPreview();
    this.shareData = this.sharedTrackModel.toJSON();
    this.appModel.set('shareId', null);
    $.getScript('//platform.tumblr.com/v1/share.js');
    return _.delay((function(_this) {
      return function() {
        return Share.init();
      };
    })(this), 500);
  };

  ShareModal.prototype.createClipboardListeners = function() {
    this.clipboardClient = new ZeroClipboard(this.$copyBtn);
    this.clipboardClient.on('load', function(client) {});
    this.clipboardClient.on('datarequested', function(client) {
      return this.clipboardClient.setText(this.innerHTML);
    });
    this.clipboardClient.on('complete', function(client, args) {
      return console.log("Copied text to clipboard: " + args.text);
    });
    this.clipboardClient.on('wrongflash noflash', function() {
      return ZeroClipboard.destroy();
    });
    this.clipboardClient.on('mouseover', (function(_this) {
      return function(client, args) {
        return _this.$copyBtn.addClass('mouseover');
      };
    })(this));
    this.clipboardClient.on('mouseout', (function(_this) {
      return function(client, args) {
        return _this.$copyBtn.removeClass('mouseover');
      };
    })(this));
    return this.clipboardClient.on('mouseup', (function(_this) {
      return function(client, args) {
        return _this.onCopyBtnClick();
      };
    })(this));
  };

  return ShareModal;

})(View);

module.exports = ShareModal;


},{"../../../../config/AppConfig.coffee":10,"../../../../events/AppEvent.coffee":12,"../../../../supers/View.coffee":28,"../../../../utils/SpinIcon":32,"./templates/share-modal-template.hbs":57,"./templates/share-preview-template.hbs":58}],57:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this;

function program1(depth0,data) {
  
  
  return "\n		<div class='btn-close'>\n			X\n		</div>\n	";
  }

function program3(depth0,data) {
  
  
  return "\n			<div class='btn-close-share'>\n				&lt; Back\n			</div>\n		";
  }

function program5(depth0,data) {
  
  
  return "\n				<div class='message'>\n					Please name your beat before sharing\n				</div>\n			";
  }

  buffer += "<div class='wrapper'>\n\n	";
  stack1 = helpers['if'].call(depth0, depth0.isDesktop, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n	<div class='form-wrapper'>\n\n		";
  stack1 = helpers.unless.call(depth0, depth0.isDesktop, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n		<h1>\n			Share Your Beat\n		</h1>\n\n		<div class='container-form'>\n\n			";
  stack1 = helpers['if'].call(depth0, depth0.isDesktop, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n			<div class='input-group text-input'>\n				<span class='label-input'>Title</span>\n				<input class='input-title' placeholder='title' />\n			</div>\n\n			<div class='input-group text-input name'>\n				<span class='label-input'>Name</span>\n				<input class='input-name' placeholder='name' />\n			</div>\n\n			"
    + "\n\n			<div class='btn-select-service'>\n				<div class='text'>\n					Select Your Service\n				</div>\n\n				<div class='preloader' />\n			</div>\n		</div>\n\n		<div class='container-preview'>\n\n		</div>\n\n	</div>\n\n</div>";
  return buffer;
  })
},{"handleify":5}],58:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n	<div class='btn-copy-url' data-clipboard-text='";
  if (stack1 = helpers.shareLink) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.shareLink; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n		<div class='text'>\n			<div class='url'>\n\n			</div>\n			<div class='copy'>\n				COPY LINK\n			</div>\n		</div>\n	</div>\n";
  return buffer;
  }

  buffer += "\n<div class='btn-back'>\n	&lt; EDIT FIELDS\n</div>\n<div class='track-data'>\n	<h1>\n		";
  if (stack1 = helpers.shareName) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.shareName; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</h1>\n	<h3>\n		";
  if (stack1 = helpers.shareTitle) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.shareTitle; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</h3>\n	<p>\n		";
  if (stack1 = helpers.shareMessage) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.shareMessage; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</p>\n</div>\n\n\n"
    + "\n\n<div class='services'>\n	<span>\n		Select a Service\n	</span>\n\n	<div class='service-btns'>\n		<div class='btn-facebook icon-facebook icon'\n			data-share-facebook\n			data-share-description=\"";
  if (stack1 = helpers.shareMessage) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.shareMessage; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"\n			data-share-link=\"";
  if (stack1 = helpers.encodedUrl) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.encodedUrl; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"\n			data-share-name=\"";
  if (stack1 = helpers.shareTitle) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.shareTitle; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"\n			data-share-caption=\"Caption\">\n		</div>\n		<div class='btn-twitter icon-twitter icon'\n			data-share-twitter\n			data-share-description=\"";
  if (stack1 = helpers.shareMessage) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.shareMessage; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"\n			data-share-link=\"";
  if (stack1 = helpers.encodedUrl) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.encodedUrl; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n		</div>\n		<div class='btn-tumblr icon-tumblr icon'>\n\n		</div>\n	</div>\n</div>\n\n";
  stack1 = helpers['if'].call(depth0, depth0.isDesktop, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })
},{"handleify":5}],59:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n\n		<div class='bg-circle' />\n\n		<div class='btn-increase btn-circle'>\n			+\n		</div>\n\n		<div class='label-bpm'>\n			BPM\n		</div>\n\n		<div class='bpm-value'>\n			0\n		</div>\n\n		<div class='btn-decrease btn-circle'>\n			-\n		</div>\n\n\n\n\n	"
    + "\n\n	";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "\n		<div class='label-bpm'>\n			BPM\n		</div>\n\n		<div class='btn-decrease'>\n			-\n		</div>\n\n		<div class='bpm-value'>\n			0\n		</div>\n\n		<div class='btn-increase'>\n			+\n		</div>\n\n	";
  }

  buffer += "\n\n\n<div class='wrapper'>\n\n\n	"
    + "\n\n	";
  stack1 = helpers['if'].call(depth0, depth0.isDesktop, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n</div>";
  return buffer;
  })
},{"handleify":5}],60:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n\n	<div class='wrapper'>\n\n		<div class='bg-half-circle' />\n\n		<div class='label-select'>\n			Select Kit\n		</div>\n\n		<div class='btn-left'>\n			&lt;\n		</div>\n		<div class='label-kit'>\n			<div>\n				DRUM KIT\n			</div>\n		</div>\n\n		<div class='btn-right'>\n			&gt;\n		</div>\n	</div>\n\n\n\n\n"
    + "\n";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "\n\n	<div class='wrapper'>\n		<div class='btn-left btn'>\n			&lt;\n		</div>\n		<div class='label-kit'>\n			<div>\n				DRUM KIT\n			</div>\n		</div>\n\n		<div class='btn-right btn'>\n			&gt;\n		</div>\n	</div>\n\n";
  }

  buffer += "\n\n"
    + "\n\n";
  stack1 = helpers['if'].call(depth0, depth0.isDesktop, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })
},{"handleify":5}],61:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='wrapper'>\n	<div class=\"label\">\n		PATTERNS\n	</div>\n	<div class='container-btns'>\n		<div class='btn-pattern-1 btn'>1</div>\n		<div class='btn-pattern-1 btn'>2</div>\n		<div class='btn-pattern-1 btn'>3</div>\n		<div class='btn-pattern-1 btn'>4</div>\n	</div>\n</div>";
  })
},{"handleify":5}],62:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this;

function program1(depth0,data) {
  
  
  return "\n	<div class='btn-play icon-play'></div>\n	<div class='btn-pause icon-pause'></div>\n\n";
  }

function program3(depth0,data) {
  
  
  return "\n\n	<div class='btn-play icon-play'></div>\n	<div class='btn-pause icon-pause'></div>\n	<div class='label-btn'>\n		PAUSE\n	</div>\n\n";
  }

  buffer += "\n";
  stack1 = helpers['if'].call(depth0, depth0.isDesktop, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })
},{"handleify":5}],63:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='btn-steps'>\n	STEPS\n</div>\n\n<div class='btn-pads'>\n	PAD\n</div>\n";
  })
},{"handleify":5}],64:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n\n	<div class='wrapper'>\n\n		<div class='container-sequencer'>\n\n			<div class='column-0'>\n				<div class='container-toggle'></div>\n				<div class='btn-clear'>CLEAR SEQUENCER</div>\n				<div class='container-play-pause'></div>\n			</div>\n\n			<div class='column-1'>\n				<div class='sequencer'>\n\n					<div class='pattern-selector'>\n						Pattern Selector\n					</div>\n\n				</div>\n				<div style='position:relative'>\n					<div class='live-pad'>\n\n					</div>\n				</div>\n			</div>\n\n			<div class='column-3'>\n				<div class='bpm'>BPM</div>\n			</div>\n\n			<div class=\"column-4\">\n				<div class='btn-share'>\n					SHARE\n				</div>\n			</div>\n		</div>\n	</div>\n\n\n\n\n"
    + "\n\n";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "";
  buffer += "\n	<div class='wrapper'>\n\n		<div class='container-sequencer'>\n			"
    + "\n			<div class='row-1'>\n				<div class='container-play-pause'></div>\n				<div class='btn-share'>\n					SHARE\n				</div>\n			</div>\n\n			"
    + "\n			<div class='row-2'>\n\n			</div>\n\n			"
    + "\n			<div class='row-3'>\n				<div class='btn-clear'>\n					CLEAR\n				</div>\n				<div class='btn-jam-live'>\n					JAM LIVE &gt;\n				</div>\n			</div>\n\n			"
    + "\n			<div class='row-4'>\n\n			</div>\n		</div>\n\n		<div class='container-live-pad'>\n			LIVE PAD\n		</div>\n\n	</div>\n\n";
  return buffer;
  }

  buffer += "\n\n"
    + "\n\n";
  stack1 = helpers['if'].call(depth0, depth0.isDesktop, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })
},{"handleify":5}],65:[function(require,module,exports){

/**
 * Landing view with start button and initial animation
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var LandingView, PubEvent, PubSub, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PubSub = require('../../utils/PubSub');

PubEvent = require('../../events/PubEvent.coffee');

View = require('../../supers/View.coffee');

template = require('./templates/landing-template.hbs');

LandingView = (function(_super) {
  __extends(LandingView, _super);

  function LandingView() {
    this.onInstructionsBtnClick = __bind(this.onInstructionsBtnClick, this);
    this.onStartBtnClick = __bind(this.onStartBtnClick, this);
    this.onMouseOut = __bind(this.onMouseOut, this);
    this.onMouseOver = __bind(this.onMouseOver, this);
    return LandingView.__super__.constructor.apply(this, arguments);
  }

  LandingView.prototype.SHOW_DELAY = 1;

  LandingView.prototype.START_BTN_TEXT = 'GET STARTED';

  LandingView.prototype.className = 'container-landing';

  LandingView.prototype.template = template;

  LandingView.prototype.instructionsShowing = false;

  LandingView.prototype.events = {
    'mouseover .btn-start': 'onMouseOver',
    'mouseout  .btn-start': 'onMouseOut',
    'touchend  .btn-start': 'onStartBtnClick',
    'touchend  .btn-instructions': 'onInstructionsBtnClick'
  };

  LandingView.prototype.render = function(options) {
    LandingView.__super__.render.call(this, options);
    this.instructionsShowing = false;
    this.$mainContainer = $('#container-main');
    this.$wrapper = this.$el.find('.wrapper');
    this.$landing = this.$el.find('.landing');
    this.$instructions = this.$el.find('.instructions');
    this.$logo = this.$el.find('.logo');
    this.$message = this.$el.find('.message');
    this.$startBtn = this.$el.find('.btn-start');
    this.$instructionsBtn = this.$el.find('.btn-instructions');
    this.viewedInstructions = $.cookie('mpcahh-instructions-viewed');
    TweenLite.set(this.$el, {
      autoAlpha: 0
    });
    return this;
  };

  LandingView.prototype.show = function() {
    var delay;
    delay = this.SHOW_DELAY;
    TweenLite.to(this.$el, .3, {
      autoAlpha: 1
    });
    TweenLite.fromTo(this.$logo, .4, {
      x: -200,
      autoAlpha: 0
    }, {
      autoAlpha: 1,
      x: 0,
      ease: Expo.easeOut,
      delay: delay
    });
    TweenLite.fromTo(this.$message, .4, {
      x: 200,
      autoAlpha: 0
    }, {
      autoAlpha: 1,
      x: 0,
      ease: Expo.easeOut,
      delay: delay
    });
    TweenLite.fromTo(this.$startBtn, .4, {
      y: 200,
      autoAlpha: 0
    }, {
      autoAlpha: 1,
      y: 0,
      ease: Expo.easeOut,
      delay: delay + .2,
      onComplete: (function(_this) {
        return function() {
          var repeat, tween;
          repeat = 0;
          return tween = TweenLite.to(_this.$startBtn, .1, {
            scale: 1.1,
            onComplete: function() {
              return tween.reverse();
            },
            onReverseComplete: function() {
              if (repeat < 1) {
                repeat++;
                return tween.restart();
              }
            }
          });
        };
      })(this)
    });
    if (this.viewedInstructions) {
      return TweenLite.to(this.$instructionsBtn, .3, {
        autoAlpha: .4,
        delay: this.SHOW_DELAY + 1
      });
    } else {
      return this.$instructionsBtn.hide();
    }
  };

  LandingView.prototype.hide = function(options) {
    var delay, redirect, self;
    self = this;
    delay = 0;
    redirect = (function(_this) {
      return function() {
        return _.delay(function() {
          window.location.href = '#create';
          if (options != null ? options.remove : void 0) {
            return self.remove();
          }
        }, 300);
      };
    })(this);
    TweenLite.to(this.$startBtn, .3, {
      autoAlpha: 0,
      scale: 0,
      ease: Back.easeIn,
      delay: delay
    });
    if (this.instructionsShowing === true) {
      TweenLite.to(this.$el, .3, {
        autoAlpha: 0,
        delay: .2
      });
      return TweenLite.to(this.$instructions, .3, {
        autoAlpha: 0,
        ease: Expo.easeIn,
        delay: delay + .2,
        onComplete: (function(_this) {
          return function() {
            return redirect();
          };
        })(this)
      });
    } else {
      TweenLite.to(this.$el, .3, {
        autoAlpha: 0,
        delay: .5
      });
      TweenLite.to(this.$logo, .4, {
        autoAlpha: 0,
        x: -200,
        ease: Expo.easeIn,
        delay: delay + .2
      });
      TweenLite.to(this.$instructionsBtn, .3, {
        autoAlpha: 0,
        delay: delay
      });
      return TweenLite.to(this.$message, .4, {
        autoAlpha: 0,
        x: 200,
        ease: Expo.easeIn,
        delay: delay + .2,
        onComplete: (function(_this) {
          return function() {
            return redirect();
          };
        })(this)
      });
    }
  };

  LandingView.prototype.showInstructions = function() {
    var preDelay;
    this.instructionsShowing = true;
    preDelay = .2;
    TweenLite.to(this.$landing, .3, {
      autoAlpha: 0,
      onComplete: (function(_this) {
        return function() {
          _this.$landing.hide();
          return _this.$instructions.show();
        };
      })(this)
    });
    TweenLite.to(this.$instructionsBtn, .3, {
      autoAlpha: 0,
      delay: 0
    });
    TweenLite.to(this.$wrapper, .8, {
      height: 562,
      ease: Expo.easeInOut,
      delay: preDelay
    });
    TweenLite.fromTo(this.$instructions, .4, {
      height: 96
    }, {
      height: 315,
      ease: Back.easeOut,
      delay: preDelay + .3
    });
    TweenLite.to(this.$logo, .4, {
      y: -20,
      ease: Back.easeIn,
      delay: preDelay,
      onComplete: (function(_this) {
        return function() {
          _this.$startBtn.text(_this.START_BTN_TEXT);
          return TweenLite.to(_this.$logo, .4, {
            y: 0,
            ease: Back.easeOut
          });
        };
      })(this)
    });
    return TweenLite.to(this.$startBtn, .4, {
      y: 40,
      ease: Back.easeIn,
      delay: preDelay,
      onComplete: (function(_this) {
        return function() {
          return TweenLite.to(_this.$instructions, .4, {
            autoAlpha: 1,
            delay: 0
          });
        };
      })(this)
    });
  };

  LandingView.prototype.exitLanding = function() {
    var snd;
    if (this.isMobile) {
      snd = createjs.Sound.createInstance('assets/audio/coke/05___female_ahhh_01.mp3');
      snd.volume = .1;
      snd.play();
    }
    this.$mainContainer.show();
    return this.hide({
      remove: true
    });
  };

  LandingView.prototype.onMouseOver = function(event) {
    return TweenLite.to(this.$startBtn, .2, {
      border: '3px solid black',
      scale: 1.1,
      color: 'black'
    });
  };

  LandingView.prototype.onMouseOut = function(event) {
    return TweenLite.to(this.$startBtn, .2, {
      border: '3px solid #E41E2B',
      scale: 1,
      color: '#E41E2B'
    });
  };

  LandingView.prototype.onStartBtnClick = function(event) {
    if (this.instructionsShowing || this.isMobile || (this.viewedInstructions === 'true')) {
      return this.exitLanding();
    } else {
      $.cookie('mpcahh-instructions-viewed', 'true', {
        expires: 7
      });
      return this.showInstructions();
    }
  };

  LandingView.prototype.onInstructionsBtnClick = function(event) {
    return this.showInstructions();
  };

  return LandingView;

})(View);

module.exports = LandingView;


},{"../../events/PubEvent.coffee":13,"../../supers/View.coffee":28,"../../utils/PubSub":31,"./templates/landing-template.hbs":66}],66:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='wrapper'>\n\n	<div class='logo' />\n\n	<div class='landing'>\n		<div class='message'>\n			LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPSCING ELIT. IN A MATTIS QUAM.\n		</div>\n	</div>\n\n	<div class='instructions'>\n		<div class='first'>\n			Pick a BPM and a drum kit and ready yourself for the <br/> consequences of world-wide fame.\n		</div>\n		<div>\n			Each song contains eight slots which correspond to eight beats per measure. <br />\n			<img src='assets/images/instructions-track.png' class='img-track' />\n		</div>\n		<div>\n			Tap the square next to the drum to SELECT the BEAT velocity OR TAP THE DRUM TO MUTE THE TRACK <br />\n			<img src='assets/images/instructions-velocity.png' class='img-velocity' />\n		</div>\n		<div>\n			JAM ALONG TO YOUR BEAT BY TAPPING THE <span>PADS</span> BUTTON; press and hold pad to reassign sound\n		</div>\n	</div>\n\n	<div class='btn-start'>\n		CREATE YOUR OWN JAM\n	</div>\n\n	<div class='btn-instructions'>\n		VIEW INSTRUCTIONS\n	</div>\n\n</div>";
  })
},{"handleify":5}],67:[function(require,module,exports){

/**
 * Mobile view if capabilities are not met
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   4.9.14
 */
var NotSupportedView, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('../../supers/View.coffee');

template = require('./templates/not-supported-template.hbs');

NotSupportedView = (function(_super) {
  __extends(NotSupportedView, _super);

  function NotSupportedView() {
    return NotSupportedView.__super__.constructor.apply(this, arguments);
  }

  NotSupportedView.prototype.className = 'container-not-supported';

  NotSupportedView.prototype.template = template;

  NotSupportedView.prototype.events = {
    'touchend .btn-listen': 'onListenBtnClick'
  };

  NotSupportedView.prototype.render = function(options) {
    NotSupportedView.__super__.render.call(this, options);
    this.$notification = this.$el.find('.notification');
    this.$samples = this.$el.find('.samples');
    return this;
  };

  NotSupportedView.prototype.onListenBtnClick = function(event) {
    TweenLite.to(this.$notification, .6, {
      autoAlpha: 0,
      x: -window.innerWidth,
      ease: Expo.easeInOut
    });
    return TweenLite.fromTo(this.$samples, .6, {
      x: window.innerWidth,
      autoAlpha: 0
    }, {
      display: 'block',
      autoAlpha: 1,
      x: 0,
      ease: Expo.easeInOut
    });
  };

  return NotSupportedView;

})(View);

module.exports = NotSupportedView;


},{"../../supers/View.coffee":28,"./templates/not-supported-template.hbs":68}],68:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n<div class='wrapper'>\n	<div class='notification'>\n		<div class='headline'>\n			LOOKS LIKE MPC AHH IS NOT SUPPORTED BY YOUR DEVICE\n		</div>\n		<div class='requirements'>\n			MINIMUM REQUIREMENTS ANDROID 4.2 / iOS 6\n		</div>\n		<div class='desktop'>\n			PLEASE VISIT THIS SITE ON YOUR DESKTOP OR\n		</div>\n		<div class='btn-listen'>\n			LISTEN TO SAMPLE BEATS FROM THE MPC-AHH &gt;\n		</div>\n	</div>\n\n	<div class='samples'>\n		<div class='headline'>\n			LISTEN TO SAMPLE BEATS FROM THE MPC AHH\n		</div>\n\n		<table>\n			<tr>\n				<td class='right-bottom'>\n					<div class='btn-play icon-play'/>\n					<div class='label'>\n						HIP-HOP SAMPLE\n					</div>\n				</td>\n				<td class='bottom'>\n					<div class='btn-play icon-play'/>\n					<div class='label'>\n						ROCK SAMPLE\n					</div>\n				</td>\n			</tr>\n			<tr>\n				<td class='right'>\n					<div class='btn-play icon-play'/>\n					<div class='label'>\n						DANCE SAMPLE\n					</div>\n				</td>\n				<td>\n					<div class='btn-play icon-play'/>\n					<div class='label'>\n						COKE SAMPLE\n					</div>\n				</td>\n			</tr>\n		</table>\n\n	</div>\n</div>";
  })
},{"handleify":5}],69:[function(require,module,exports){

/**
 * Share the user created beat
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var CreateView, PlayPauseBtn, PubEvent, PubSub, Sequencer, ShareView, SharedTrackModel, View, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PubSub = require('../../utils/PubSub');

PubEvent = require('../../events/PubEvent.coffee');

SharedTrackModel = require('../../models/SharedTrackModel.coffee');

CreateView = require('../create/CreateView.coffee');

PlayPauseBtn = require('../create/components/PlayPauseBtn.coffee');

Sequencer = require('../create/components/sequencer/Sequencer.coffee');

View = require('../../supers/View.coffee');

template = require('./templates/share-template.hbs');

ShareView = (function(_super) {
  __extends(ShareView, _super);

  function ShareView() {
    this.onBeat = __bind(this.onBeat, this);
    this.onMouseOut = __bind(this.onMouseOut, this);
    this.onMouseOver = __bind(this.onMouseOver, this);
    this.onSharedTrackModelChange = __bind(this.onSharedTrackModelChange, this);
    this.importTrack = __bind(this.importTrack, this);
    return ShareView.__super__.constructor.apply(this, arguments);
  }

  ShareView.prototype.className = 'container-share';

  ShareView.prototype.template = template;

  ShareView.prototype.createView = null;

  ShareView.prototype.events = {
    'mouseover .btn-start': 'onMouseOver',
    'mouseout  .btn-start': 'onMouseOut',
    'touchend  .btn-start': 'onStartBtnClick'
  };

  ShareView.prototype.render = function(options) {
    ShareView.__super__.render.call(this, options);
    this.$textContainer = this.$el.find('.container-text');
    this.$mainContainer = $('#container-main');
    this.$name = this.$el.find('.name');
    this.$title = this.$el.find('.title');
    this.$message = this.$el.find('.message');
    this.$playBtn = this.$el.find('.btn-play');
    this.$startBtn = this.$el.find('.btn-start');
    TweenLite.set(this.$textContainer, {
      y: -300,
      autoAlpha: 0
    });
    TweenLite.set(this.$startBtn, {
      y: 300,
      autoAlpha: 0
    });
    this.$mainContainer.show();
    this.createView = new CreateView({
      appModel: this.appModel,
      sharedTrackModel: this.sharedTrackModel,
      kitCollection: this.kitCollection
    });
    if (this.isMobile) {
      this.playPauseBtn = new PlayPauseBtn({
        appModel: this.appModel
      });
      this.$el.find('.container-btn').append(this.playPauseBtn.render().el);
      this.playPauseBtn.$el.find('.label-btn').hide();
      TweenLite.set(this.playPauseBtn.$el, {
        scale: 1,
        autoAlpha: 0
      });
    }
    this.$el.append(this.createView.render().el);
    this.createView.$el.hide();
    this.createView.kitSelector.remove();
    this.importTrack(this.appModel.get('shareId'));
    return this;
  };

  ShareView.prototype.show = function() {
    var delay;
    delay = .5;
    if (this.isMobile) {
      this.$message.hide();
      TweenLite.fromTo(this.$textContainer, .4, {
        y: -300,
        autoAlpha: 0
      }, {
        autoAlpha: 1,
        y: 10,
        ease: Expo.easeOut,
        delay: delay + .3
      });
      return TweenLite.fromTo(this.$startBtn, .4, {
        y: 1000,
        autoAlpha: 0
      }, {
        autoAlpha: 1,
        y: 160,
        ease: Expo.easeOut,
        delay: delay + .3,
        onComplete: (function(_this) {
          return function() {
            return TweenLite.to(_this.playPauseBtn.$el, .3, {
              autoAlpha: 1,
              ease: Back.easeOut,
              delay: 0
            });
          };
        })(this)
      });
    } else {
      TweenLite.fromTo(this.$textContainer, .4, {
        y: -300,
        autoAlpha: 0
      }, {
        autoAlpha: 1,
        y: 0,
        ease: Expo.easeOut,
        delay: delay + .3
      });
      return TweenLite.fromTo(this.$startBtn, .4, {
        y: 300,
        autoAlpha: 0
      }, {
        autoAlpha: 1,
        y: -80,
        ease: Expo.easeOut,
        delay: delay + .3
      });
    }
  };

  ShareView.prototype.hide = function(options) {
    if (this.isMobile) {
      return TweenLite.to(this.$el, .4, {
        autoAlpha: 0
      }, {
        onComplete: (function(_this) {
          return function() {
            if (options != null ? options.remove : void 0) {
              return _.delay(function() {
                return _this.remove();
              }, 300);
            }
          };
        })(this)
      });
    } else {
      TweenLite.to(this.$startBtn, .3, {
        scale: 0,
        autoAlpha: 0,
        ease: Back.easeIn
      });
      return TweenLite.to(this.$el, .4, {
        autoAlpha: 0
      }, {
        onComplete: (function(_this) {
          return function() {
            if (options != null ? options.remove : void 0) {
              return _.delay(function() {
                return _this.remove();
              }, 300);
            }
          };
        })(this)
      });
    }
  };

  ShareView.prototype.addEventListeners = function() {
    return this.listenTo(this.appModel, 'change:sharedTrackModel', this.onSharedTrackModelChange);
  };

  ShareView.prototype.importTrack = function(shareId, callback) {
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
          console.log(JSON.stringify(sharedTrackModel.toJSON()));
          _this.appModel.set({
            'bpm': sharedTrackModel.get('bpm'),
            'sharedTrackModel': sharedTrackModel,
            'shareId': null
          });
          _this.listenTo(_this.createView, PubEvent.BEAT, _this.onBeat);
          return _this.createView.sequencer.importTrack({
            kitType: sharedTrackModel.get('kitType'),
            instruments: sharedTrackModel.get('instruments'),
            patternSquareGroups: sharedTrackModel.get('patternSquareGroups'),
            callback: function(response) {}
          });
        };
      })(this)
    });
  };

  ShareView.prototype.onSharedTrackModelChange = function(model) {
    var sharedTrackModel;
    sharedTrackModel = model.changed.sharedTrackModel;
    if (sharedTrackModel !== null) {
      this.$name.html(sharedTrackModel.get('shareName'));
      this.$title.html(sharedTrackModel.get('shareTitle'));
      this.$message.html(sharedTrackModel.get('shareMessage'));
      TweenLite.set(this.$el, {
        autoAlpha: 1
      });
      this.appModel.set('playing', (this.isMobile ? false : true));
      return this.show();
    }
  };

  ShareView.prototype.onStartBtnClick = function(event) {
    this.removeEventListeners();
    this.createView.remove();
    $('.container-kit-selector').remove();
    this.appModel.set({
      'bpm': 120,
      'sharedTrackModel': null,
      'showSequencer': false
    });
    return window.location.hash = 'create';
  };

  ShareView.prototype.onMouseOver = function(event) {
    return TweenLite.to(this.$startBtn, .2, {
      border: '3px solid black',
      scale: 1.1,
      color: 'black'
    });
  };

  ShareView.prototype.onMouseOut = function(event) {
    return TweenLite.to(this.$startBtn, .2, {
      border: '3px solid white',
      scale: 1,
      color: 'white'
    });
  };

  ShareView.prototype.onBeat = function(params) {
    return this.trigger(PubEvent.BEAT, params);
  };

  return ShareView;

})(View);

module.exports = ShareView;


},{"../../events/PubEvent.coffee":13,"../../models/SharedTrackModel.coffee":16,"../../supers/View.coffee":28,"../../utils/PubSub":31,"../create/CreateView.coffee":34,"../create/components/PlayPauseBtn.coffee":38,"../create/components/sequencer/Sequencer.coffee":52,"./templates/share-template.hbs":70}],70:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this;

function program1(depth0,data) {
  
  
  return "\n\n			<div class='message'>\n\n			</div>\n		";
  }

function program3(depth0,data) {
  
  
  return "\n\n			<div class='container-btn'>\n\n			</div>\n\n		";
  }

  buffer += "<div class='logo-coke'></div>\n\n<div class='wrapper'>\n\n	<div class='container-text'>\n		<div class='title'>\n\n		</div>\n\n		<div class='name'>\n\n		</div>\n\n		";
  stack1 = helpers['if'].call(depth0, depth0.isDesktop, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n	</div>\n\n	<div class='btn-start'>\n		CREATE YOUR OWN JAM\n	</div>\n\n</div>\n\n\n<div class='btn-play'>\n\n</div>";
  return buffer;
  })
},{"handleify":5}],71:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n\n	<div id='container-main'>\n		<div id='container-bottom'>\n\n		</div>\n	</div>\n\n\n\n"
    + "\n\n";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "\n\n	<div id='container-main'>\n		<div class='top-bar'>\n			<div id='logo' class='logo' />\n		</div>\n\n	</div>\n";
  }

  buffer += "\n"
    + "\n\n";
  stack1 = helpers['if'].call(depth0, depth0.isDesktop, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })
},{"handleify":5}],72:[function(require,module,exports){
/**
 * Bubbles generator
 * @requires jQuery & TweenMax
 * @author Charlie
 */

var Bubbles = {

  /**
   * window reference
   * @type {jQuery}
   */
  $window     : $(window),

  /**
   * Bubble element wrapper
   * @type {jQuery}
   */
  $container  : null,

  /**
   * viewport width
   * @type {Number}
   */
  winWidth    : 0,

  /**
   * viewport height
   * @type {Number}
   */
  winHeight   : 0,

  /**
   * Bubble size classes
   * @type {Array}
   */
  sizeClasses : [ 'small', 'medium', 'big' ],

  bubbles: null,

  /**
   * Initializes Bubbles
   */
  initialize: function () {
    this.$container = $('<div>', {'class': 'bubbles-container'})
    this.winWidth   = this.$window.width();
    this.winHeight  = this.$window.height();
    this.flakes = []
    this.addEventlisteners();
    this.initBubbles();


    return this.$container
  },

  /**
   * Event listeners
   */
  addEventlisteners: function () {
    this.$window.resize($.proxy(this._onWindowResize, this));
  },

  /**
   * Initializes flakes
   */
  initBubbles: function () {
    this.createBubble();
  },

  /**
   * Creates bubbles
   */
  createBubble: function () {
    var $bubble = $('<div>', {'class': 'bubble'});
    var sizeClasses  = this.sizeClasses[ this._randomNumber(0, this.sizeClasses.length - 1) ];
    var rightPos   = this._randomNumber(100, -100);
    var opacity    = this._randomNumber(50, 90) / 100;

    TweenLite.set( $bubble, { y: window.innerHeight })

    $bubble.addClass(sizeClasses)
              .prependTo(this.$container)
              .css({
                'right'   : rightPos + '%',
                'opacity' : opacity
              });

    setTimeout($.proxy(this.createBubble, this), this._randomNumber(100, 300));
    this.animateFlake($bubble);
  },

  /**
   * Animates element
   * @param  {jQuery} $bubble
   */
  animateFlake: function ($bubble) {
    var self = this
    var duration = this._randomNumber(10, 20);
    var right = this._randomNumber(this.winWidth / 3, this.winWidth) /* go left */ * - 1;

    //make it fall
    TweenLite.to($bubble, duration, {
      'y'        : -this.winHeight * 1.1,
      'ease'     : 'Linear.easeNone',
      onComplete : function () {
        $bubble.remove();
      }
    });
  },


  beat: function() {},

  /**
   * Generates random number
   * @param  {Number} from
   * @param  {Number} to
   * @return {Number} random value
   */
  _randomNumber: function (from, to) {
    return Math.floor( Math.random() * (to-from+1) + from);
  },

  /**
   * Resize event hanlder
   * @param {Object} event object
   */
  _onWindowResize: function (event) {
    this.winWidth   = this.$window.width();
    this.winHeight  = this.$window.height();
  }

};

module.exports = Bubbles;

},{}],73:[function(require,module,exports){

/**
 * Background visualization view
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   4.13.14
 */
var BubblesView, View, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('../../supers/View.coffee');

template = require('./templates/bubbles-template.hbs');

BubblesView = (function(_super) {
  __extends(BubblesView, _super);

  function BubblesView() {
    return BubblesView.__super__.constructor.apply(this, arguments);
  }

  BubblesView.prototype.className = 'container-bubbles';

  BubblesView.prototype.template = template;

  BubblesView.prototype.render = function(options) {
    BubblesView.__super__.render.call(this, options);
    this.startBubbles();
    return this;
  };

  BubblesView.prototype.startBubbles = function() {};

  return BubblesView;

})(View);

module.exports = BubblesView;


},{"../../supers/View.coffee":28,"./templates/bubbles-template.hbs":75}],74:[function(require,module,exports){

/**
 * Background visualization view
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.27.14
 */
var PubEvent, PubSub, View, VisualizerView, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PubSub = require('../../utils/PubSub');

PubEvent = require('../../events/PubEvent.coffee');

View = require('../../supers/View.coffee');

template = require('./templates/visualizer-template.hbs');

VisualizerView = (function(_super) {
  __extends(VisualizerView, _super);

  function VisualizerView() {
    this.onBeat = __bind(this.onBeat, this);
    this.onResize = __bind(this.onResize, this);
    this.buildBottles = __bind(this.buildBottles, this);
    this.show = __bind(this.show, this);
    return VisualizerView.__super__.constructor.apply(this, arguments);
  }

  VisualizerView.prototype.BOTTLE_NUM = 6;

  VisualizerView.prototype.className = 'container-visualizer';

  VisualizerView.prototype.template = template;

  VisualizerView.prototype.render = function(options) {
    VisualizerView.__super__.render.call(this, options);
    this.$bottlesContainer = this.$el.find('.container-bottles');
    this.show();
    return this;
  };

  VisualizerView.prototype.addEventListeners = function() {
    window.addEventListener('resize', this.onResize, false);
    return PubSub.on(PubEvent.BEAT, this.onBeat);
  };

  VisualizerView.prototype.removeEventListeners = function() {
    PubSub.off(PubEvent.BEAT, this.onBeat);
    return VisualizerView.__super__.removeEventListeners.call(this);
  };

  VisualizerView.prototype.show = function() {
    this.buildBottles();
    return TweenLite.to(this.$el.find('.wrapper'), .3, {
      autoAlpha: 1,
      delay: 1
    });
  };

  VisualizerView.prototype.hide = function() {
    return TweenLite.to(this.$el.find('.wrapper'), .3, {
      autoAlpha: 0,
      delay: 0
    });
  };

  VisualizerView.prototype.scaleUp = function() {
    this.prevX = GreenProp.x(this.$bottlesContainer);
    this.prevY = GreenProp.y(this.$bottlesContainer);
    return TweenLite.to(this.$bottlesContainer, .8, {
      scale: 1.3,
      x: this.containerWidth * .26,
      y: this.prevY + 65,
      ease: Expo.easeOut
    });
  };

  VisualizerView.prototype.scaleDown = function() {
    return TweenLite.to(this.$bottlesContainer, .8, {
      scaleX: 1,
      scaleY: 1,
      x: this.prevX,
      y: this.prevY,
      ease: Expo.easeInOut
    });
  };

  VisualizerView.prototype.setShareViewPosition = function() {
    this.isShareView = true;
    return this.onResize();
  };

  VisualizerView.prototype.resetPosition = function() {
    this.isShareView = false;
    return this.onResize();
  };

  VisualizerView.prototype.buildBottles = function() {
    var $bottle, delay, _i, _len, _ref, _results;
    this.bottles = [];
    this.widths = [];
    _(this.BOTTLE_NUM).times((function(_this) {
      return function(index) {
        var $bottle;
        $bottle = _this.$el.find("#bottle-" + (index + 1));
        TweenLite.set($bottle, {
          transformOrigin: 'center middle',
          scale: 1,
          x: ~~(index * ((window.innerWidth * .8) / _this.BOTTLE_NUM)),
          y: 1000
        });
        TweenLite.set($bottle.find('.bottle-bg'), {
          scaleY: 0
        });
        return _this.bottles.push($bottle);
      };
    })(this));
    delay = .5;
    _ref = this.bottles;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      $bottle = _ref[_i];
      TweenLite.to($bottle, .7, {
        y: -10,
        ease: Back.easeOut,
        delay: delay
      });
      _results.push(delay += .1);
    }
    return _results;
  };

  VisualizerView.prototype.onResize = function() {
    var len, xPos, yOffset, yPos;
    len = this.bottles.length;
    this.widths = [];
    _.each(this.bottles, (function(_this) {
      return function($bottle, index) {
        var xPos;
        xPos = ~~(index * (window.innerWidth * .8 / _this.BOTTLE_NUM));
        TweenLite.set($bottle, {
          transformOrigin: 'center',
          x: xPos,
          ease: Expo.easeOut
        });
        return _this.widths.push(GreenProp.x($bottle) + $bottle.width());
      };
    })(this));
    this.containerWidth = this.widths[this.widths.length - 1];
    this.containerHeight = ~~this.$bottlesContainer.height();
    yOffset = this.isShareView ? 0 : 100;
    xPos = (window.innerWidth * .5) - (this.containerWidth * .5);
    yPos = (window.innerHeight * .5) - (this.containerHeight * .5) - yOffset;
    return TweenLite.to(this.$bottlesContainer, .6, {
      x: ~~xPos,
      y: ~~yPos,
      ease: Expo.easeOut
    });
  };

  VisualizerView.prototype.onBeat = function(params) {
    var bottle, patternSquareModel, props, scale, tweenTime;
    patternSquareModel = params.patternSquareModel;
    props = patternSquareModel || {};
    if (_.isEmpty(props)) {
      props = {
        velocity: ~~(Math.random() * 4),
        orderIndex: ~~(Math.random() * 6)
      };
    }
    scale = (function() {
      switch (props.velocity) {
        case 1:
          return .33 + Math.random() * .20;
        case 2:
          return .66 + Math.random() * .20;
        case 3:
          return .95;
      }
    })();
    if (scale === void 0) {
      scale = 1;
    }
    tweenTime = .2;
    bottle = this.bottles[props.orderIndex].find('.bottle-bg');
    return TweenLite.to(bottle, .1, {
      transformOrigin: 'center bottom',
      scaleY: scale,
      ease: Linear.easeNone,
      onComplete: (function(_this) {
        return function() {
          return TweenLite.to(bottle, 1, {
            scaleY: 0,
            ease: Quart.easeOut
          });
        };
      })(this)
    });
  };

  return VisualizerView;

})(View);

module.exports = VisualizerView;


},{"../../events/PubEvent.coffee":13,"../../supers/View.coffee":28,"../../utils/PubSub":31,"./templates/visualizer-template.hbs":76}],75:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })
},{"handleify":5}],76:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n\n			<div class='vis-bottle' id='bottle-"
    + escapeExpression(((stack1 = ((stack1 = data),stack1 == null || stack1 === false ? stack1 : stack1.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>\n				<div class='bottle-bg-white' />\n				<div class='bottle-bg' />\n				<div class='bottle-mask' />\n			</div>\n\n		";
  return buffer;
  }

  buffer += "<div class='wrapper'>\n	<div class='container-bottles'>\n\n		";
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data};
  stack2 = ((stack1 = helpers.repeat || depth0.repeat),stack1 ? stack1.call(depth0, 6, options) : helperMissing.call(depth0, "repeat", 6, options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n\n	</div>\n</div>";
  return buffer;
  })
},{"handleify":5}],77:[function(require,module,exports){
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


},{"./spec/AppController-spec.coffee":78,"./spec/models/KitCollection-spec.coffee":79,"./spec/models/KitModel-spec.coffee":80,"./spec/models/SoundCollection-spec.coffee":81,"./spec/models/SoundModel-spec.coffee":82,"./spec/views/create/CreateView-spec.coffee":83,"./spec/views/create/components/BPMIndicator-spec.coffee":84,"./spec/views/create/components/KitSelector-spec.coffee":85,"./spec/views/create/components/instruments/Instrument-spec.coffee":86,"./spec/views/create/components/instruments/InstrumentSelectorPanel-spec.coffee":87,"./spec/views/create/components/pad/LivePad-spec.coffee":88,"./spec/views/create/components/pad/PadSquare-spec.coffee":89,"./spec/views/create/components/sequencer/PatternSquare-spec.coffee":90,"./spec/views/create/components/sequencer/PatternTrack-spec.coffee":91,"./spec/views/create/components/sequencer/Sequencer-spec.coffee":92,"./spec/views/landing/LandingView-spec.coffee":93,"./spec/views/share/ShareView-spec.coffee":94}],78:[function(require,module,exports){
var AppController;

AppController = require('../../src/scripts/AppController.coffee');

describe('App Controller', function() {
  return it('Should initialize', (function(_this) {
    return function() {};
  })(this));
});


},{"../../src/scripts/AppController.coffee":9}],79:[function(require,module,exports){
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


},{"../../../src/scripts/config/AppConfig.coffee":10,"../../../src/scripts/models/kits/KitCollection.coffee":17}],80:[function(require,module,exports){
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


},{"../../../src/scripts/config/AppConfig.coffee":10,"../../../src/scripts/models/kits/KitModel.coffee":18,"../../../src/scripts/models/sequencer/InstrumentCollection.coffee":21}],81:[function(require,module,exports){
describe('Sound Collection', function() {
  return it('Should initialize with a sound set', (function(_this) {
    return function() {};
  })(this));
});


},{}],82:[function(require,module,exports){
describe('Sound Model', function() {
  return it('Should initialize with default config properties', (function(_this) {
    return function() {};
  })(this));
});


},{}],83:[function(require,module,exports){
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


},{"../../../../src/scripts/config/AppConfig.coffee":10,"../../../../src/scripts/models/AppModel.coffee":15,"../../../../src/scripts/models/kits/KitCollection.coffee":17,"../../../../src/scripts/views/create/CreateView.coffee":34}],84:[function(require,module,exports){
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


},{"../../../../../src/scripts/config/AppConfig.coffee":10,"../../../../../src/scripts/events/AppEvent.coffee":12,"../../../../../src/scripts/models/AppModel.coffee":15,"../../../../../src/scripts/views/create/components/BPMIndicator.coffee":35}],85:[function(require,module,exports){
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


},{"../../../../../src/scripts/config/AppConfig.coffee":10,"../../../../../src/scripts/models/AppModel.coffee":15,"../../../../../src/scripts/models/kits/KitCollection.coffee":17,"../../../../../src/scripts/models/kits/KitModel.coffee":18,"../../../../../src/scripts/views/create/components/KitSelector.coffee":36}],86:[function(require,module,exports){
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


},{"../../../../../../src/scripts/models/kits/KitModel.coffee":18,"../../../../../../src/scripts/views/create/components/instruments/Instrument.coffee":40}],87:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":10,"../../../../../../src/scripts/models/AppModel.coffee":15,"../../../../../../src/scripts/models/kits/KitCollection.coffee":17,"../../../../../../src/scripts/views/create/components/instruments/InstrumentSelectorPanel.coffee":41}],88:[function(require,module,exports){
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
      return _this.view.$el.find('.instrument').length.should.equal(len);
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":10,"../../../../../../src/scripts/models/AppModel.coffee":15,"../../../../../../src/scripts/models/kits/KitCollection.coffee":17,"../../../../../../src/scripts/models/pad/PadSquareCollection.coffee":19,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":22,"../../../../../../src/scripts/views/create/components/pad/LivePad.coffee":44,"../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee":45}],89:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":10,"../../../../../../src/scripts/models/AppModel.coffee":15,"../../../../../../src/scripts/models/kits/KitCollection.coffee":17,"../../../../../../src/scripts/models/pad/PadSquareCollection.coffee":19,"../../../../../../src/scripts/models/pad/PadSquareModel.coffee":20,"../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee":45}],90:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":10,"../../../../../../src/scripts/models/AppModel.coffee":15,"../../../../../../src/scripts/models/kits/KitCollection.coffee":17,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":24,"../../../../../../src/scripts/views/create/components/sequencer/PatternSquare.coffee":50}],91:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":10,"../../../../../../src/scripts/models/AppModel.coffee":15,"../../../../../../src/scripts/models/kits/KitCollection.coffee":17,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":22,"../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee":23,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":24,"../../../../../../src/scripts/views/create/components/sequencer/PatternTrack.coffee":51}],92:[function(require,module,exports){
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


},{"../../../../../../src/scripts/config/AppConfig.coffee":10,"../../../../../../src/scripts/helpers/handlebars-helpers":14,"../../../../../../src/scripts/models/AppModel.coffee":15,"../../../../../../src/scripts/models/kits/KitCollection.coffee":17,"../../../../../../src/scripts/models/sequencer/InstrumentCollection.coffee":21,"../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee":22,"../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee":23,"../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee":24,"../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee":52}],93:[function(require,module,exports){
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


},{"../../../../src/scripts/AppController.coffee":9,"../../../../src/scripts/config/AppConfig.coffee":10,"../../../../src/scripts/models/kits/KitCollection.coffee":17,"../../../../src/scripts/views/landing/LandingView.coffee":65}],94:[function(require,module,exports){
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


},{"../../../../src/scripts/views/share/ShareView.coffee":69}]},{},[77])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvbm9kZV9tb2R1bGVzL2RpZ2l0cy9pbmRleC5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9iYXNlLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvcnVudGltZS5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvbm9kZV9tb2R1bGVzL3Zpc2liaWxpdHlqcy9pbmRleC5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvbm9kZV9tb2R1bGVzL3Zpc2liaWxpdHlqcy9saWIvdmlzaWJpbGl0eS5jb3JlLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9ub2RlX21vZHVsZXMvdmlzaWJpbGl0eWpzL2xpYi92aXNpYmlsaXR5LnRpbWVycy5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvQXBwQ29udHJvbGxlci5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy9jb25maWcvUHJlc2V0cy5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvaGVscGVycy9oYW5kbGViYXJzLWhlbHBlcnMuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL21vZGVscy9TaGFyZWRUcmFja01vZGVsLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9QYWRTcXVhcmVNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3JvdXRlcnMvQXBwUm91dGVyLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvc3VwZXJzL0NvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy9zdXBlcnMvTW9kZWwuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3V0aWxzL0JyZWFrcG9pbnRNYW5hZ2VyLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdXRpbHMvQnJvd3NlckRldGVjdC5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdXRpbHMvUHViU3ViLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy91dGlscy9TcGluSWNvbi5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdXRpbHMvb2JzZXJ2ZURvbS5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL1BhdHRlcm5TZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL1BsYXlQYXVzZUJ0bi5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL1RvZ2dsZS5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL3RlbXBsYXRlcy9pbnN0cnVtZW50LXBhbmVsLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvdGVtcGxhdGVzL2luc3RydW1lbnQtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvTGl2ZVBhZC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvdGVtcGxhdGVzL2luc3RydW1lbnRzLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL3RlbXBsYXRlcy9saXZlLXBhZC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC90ZW1wbGF0ZXMvcGFkLXNxdWFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC90ZW1wbGF0ZXMvcGFkcy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5UcmFjay5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvdGVtcGxhdGVzL3BhdHRlcm4tc3F1YXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9wYXR0ZXJuLXRyYWNrLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9zZXF1ZW5jZXItdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zaGFyZS9TaGFyZU1vZGFsLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2hhcmUvdGVtcGxhdGVzL3NoYXJlLW1vZGFsLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2hhcmUvdGVtcGxhdGVzL3NoYXJlLXByZXZpZXctdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy90ZW1wbGF0ZXMvYnBtLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvdGVtcGxhdGVzL2tpdC1zZWxlY3Rpb24tdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy90ZW1wbGF0ZXMvcGF0dGVybi1zZWxlY3Rvci10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3RlbXBsYXRlcy9wbGF5LXBhdXNlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvdGVtcGxhdGVzL3RvZ2dsZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS90ZW1wbGF0ZXMvY3JlYXRlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvdGVtcGxhdGVzL2xhbmRpbmctdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9ub3Qtc3VwcG9ydGVkL05vdFN1cHBvcnRlZFZpZXcuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9ub3Qtc3VwcG9ydGVkL3RlbXBsYXRlcy9ub3Qtc3VwcG9ydGVkLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3Mvc2hhcmUvdGVtcGxhdGVzL3NoYXJlLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvdGVtcGxhdGVzL21haW4tdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy92aXN1YWxpemVyL0J1YmJsZXMuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL3Zpc3VhbGl6ZXIvQnViYmxlc1ZpZXcuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy92aXN1YWxpemVyL1Zpc3VhbGl6ZXJWaWV3LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvdmlzdWFsaXplci90ZW1wbGF0ZXMvYnViYmxlcy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL3Zpc3VhbGl6ZXIvdGVtcGxhdGVzL3Zpc3VhbGl6ZXItdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC90ZXN0L3NwZWMtcnVubmVyLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvdGVzdC9zcGVjL0FwcENvbnRyb2xsZXItc3BlYy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3Rlc3Qvc3BlYy9tb2RlbHMvS2l0Q29sbGVjdGlvbi1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvdGVzdC9zcGVjL21vZGVscy9LaXRNb2RlbC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvdGVzdC9zcGVjL21vZGVscy9Tb3VuZENvbGxlY3Rpb24tc3BlYy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3Rlc3Qvc3BlYy9tb2RlbHMvU291bmRNb2RlbC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LXNwZWMuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLXNwZWMuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3Itc3BlYy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50LXNwZWMuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC90ZXN0L3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvTGl2ZVBhZC1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUtc3BlYy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvdGVzdC9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2stc3BlYy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3Rlc3Qvc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLXNwZWMuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC90ZXN0L3NwZWMvdmlld3MvbGFuZGluZy9MYW5kaW5nVmlldy1zcGVjLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvdGVzdC9zcGVjL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEscU9BQUE7RUFBQTs7aVNBQUE7O0FBQUEsVUFPQSxHQUFvQixPQUFBLENBQVEsY0FBUixDQVBwQixD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QUFBLENBRlQ7U0FERixFQVRtQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCLENBRkEsQ0FEVztFQUFBLENBeEJiOzsyQkFBQTs7SUFKRixDQUFBOztBQUFBLE1BZ0RNLENBQUMsT0FBUCxHQUFpQixpQkFoRGpCLENBQUE7Ozs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtB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QTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUFB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLDJCQUFBO0VBQUE7aVNBQUE7O0FBQUEsSUFPQSxHQUFXLE9BQUEsQ0FBUSwwQkFBUixDQVBYLENBQUE7O0FBQUEsUUFRQSxHQUFXLE9BQUEsQ0FBUSxrQ0FBUixDQVJYLENBQUE7O0FBQUE7QUFZRSxnQ0FBQSxDQUFBOzs7O0dBQUE7O0FBQUEsd0JBQUEsU0FBQSxHQUFXLG1CQUFYLENBQUE7O0FBQUEsd0JBQ0EsUUFBQSxHQUFVLFFBRFYsQ0FBQTs7QUFB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QSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUEsR0FBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QyxDQWhCQSxDQUFBO0FBQUEsRUFtQkEsRUFBQSxDQUFHLGtEQUFILEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsQ0FuQkEsQ0FBQTtBQUFBLEVBc0JBLEVBQUEsQ0FBRyx1Q0FBSCxFQUE0QyxDQUFBLFNBQUEsS0FBQSxHQUFBO1dBQUEsU0FBQSxHQUFBLEVBQUE7RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVDLENBdEJBLENBQUE7U0F5QkEsRUFBQSxDQUFHLGtEQUFILEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFBLEdBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsRUEzQm9CO0FBQUEsQ0FBdkIsQ0FIQSxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogZGlnaXRzXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMgSm9uIFNjaGxpbmtlcnRcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQYWQgbnVtYmVycyB3aXRoIHplcm9zLlxuICogQXV0b21hdGljYWxseSBwYWQgdGhlIG51bWJlciBvZiBkaWdpdHMgYmFzZWQgb24gdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXksXG4gKiBvciBleHBsaWNpdGx5IHBhc3MgaW4gdGhlIG51bWJlciBvZiBkaWdpdHMgdG8gdXNlLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gbnVtICBUaGUgbnVtYmVyIHRvIHBhZC5cbiAqIEBwYXJhbSAge09iamVjdH0gb3B0cyBPcHRpb25zIG9iamVjdCB3aXRoIGBkaWdpdHNgIGFuZCBgYXV0b2AgcHJvcGVydGllcy5cbiAqICAgIHtcbiAqICAgICAgYXV0bzogYXJyYXkubGVuZ3RoIC8vIHBhc3MgaW4gdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXlcbiAqICAgICAgZGlnaXRzOiA0ICAgICAgICAgIC8vIG9yIHBhc3MgaW4gdGhlIG51bWJlciBvZiBkaWdpdHMgdG8gdXNlXG4gKiAgICB9XG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgVGhlIHBhZGRlZCBudW1iZXIgd2l0aCB6ZXJvcyBwcmVwZW5kZWRcbiAqXG4gKiBAZXhhbXBsZXM6XG4gKiAgMSAgICAgID0+IDAwMDAwMVxuICogIDEwICAgICA9PiAwMDAwMTBcbiAqICAxMDAgICAgPT4gMDAwMTAwXG4gKiAgMTAwMCAgID0+IDAwMTAwMFxuICogIDEwMDAwICA9PiAwMTAwMDBcbiAqICAxMDAwMDAgPT4gMTAwMDAwXG4gKi9cblxuZXhwb3J0cy5wYWQgPSBmdW5jdGlvbiAobnVtLCBvcHRzKSB7XG4gIHZhciBkaWdpdHMgPSBvcHRzLmRpZ2l0cyB8fCAzO1xuICBpZihvcHRzLmF1dG8gJiYgdHlwZW9mIG9wdHMuYXV0byA9PT0gJ251bWJlcicpIHtcbiAgICBkaWdpdHMgPSBTdHJpbmcob3B0cy5hdXRvKS5sZW5ndGg7XG4gIH1cbiAgdmFyIGxlbkRpZmYgPSBkaWdpdHMgLSBTdHJpbmcobnVtKS5sZW5ndGg7XG4gIHZhciBwYWRkaW5nID0gJyc7XG4gIGlmIChsZW5EaWZmID4gMCkge1xuICAgIHdoaWxlIChsZW5EaWZmLS0pIHtcbiAgICAgIHBhZGRpbmcgKz0gJzAnO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFkZGluZyArIG51bTtcbn07XG5cbi8qKlxuICogU3RyaXAgbGVhZGluZyBkaWdpdHMgZnJvbSBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyBmcm9tIHdoaWNoIHRvIHN0cmlwIGRpZ2l0c1xuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICovXG5cbmV4cG9ydHMuc3RyaXBsZWZ0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxcZCtcXC0/L2csICcnKTtcbn07XG5cbi8qKlxuICogU3RyaXAgdHJhaWxpbmcgZGlnaXRzIGZyb20gYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgZnJvbSB3aGljaCB0byBzdHJpcCBkaWdpdHNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqL1xuXG5leHBvcnRzLnN0cmlwcmlnaHQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXC0/XFxkKyQvZywgJycpO1xufTtcblxuLyoqXG4gKiBDb3VudCBkaWdpdHMgb24gdGhlIGxlZnQgc2lkZSBvZiBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB3aXRoIGRpZ2l0cyB0byBjb3VudFxuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICogQGV4YW1wbGVcbiAqICBcIjAwMS1mb28ubWRcIiA9PiAzXG4gKi9cblxuZXhwb3J0cy5jb3VudGxlZnQgPSBmdW5jdGlvbihzdHIpIHtcbiAgcmV0dXJuIFN0cmluZyhzdHIubWF0Y2goL15cXGQrL2cpKS5sZW5ndGg7XG59O1xuXG4vKipcbiAqIENvdW50IGRpZ2l0cyBvbiB0aGUgcmlnaHQgc2lkZSBvZiBhIHN0cmluZ1xuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB3aXRoIGRpZ2l0cyB0byBjb3VudFxuICogQHJldHVybiB7U3RyaW5nfSAgICAgVGhlIG1vZGlmaWVkIHN0cmluZ1xuICogQGV4YW1wbGVcbiAqICBcIjAwMS1mb28ubWRcIiA9PiAzXG4gKi9cblxuZXhwb3J0cy5jb3VudHJpZ2h0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyLm1hdGNoKC9cXGQrJC9nKSkubGVuZ3RoO1xufTsiLCIvKmpzaGludCBlcW51bGw6IHRydWUgKi9cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG5cbnZhciBIYW5kbGViYXJzID0ge307XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbkhhbmRsZWJhcnMuVkVSU0lPTiA9IFwiMS4wLjBcIjtcbkhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT04gPSA0O1xuXG5IYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPj0gMS4wLjAnXG59O1xuXG5IYW5kbGViYXJzLmhlbHBlcnMgID0ge307XG5IYW5kbGViYXJzLnBhcnRpYWxzID0ge307XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgZnVuY3Rpb25UeXBlID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgPSBmdW5jdGlvbihuYW1lLCBmbiwgaW52ZXJzZSkge1xuICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgIGlmIChpbnZlcnNlIHx8IGZuKSB7IHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbnZlcnNlKSB7IGZuLm5vdCA9IGludmVyc2U7IH1cbiAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgPSBmdW5jdGlvbihuYW1lLCBzdHIpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLnBhcnRpYWxzLCAgbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHN0cjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGFyZykge1xuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGhlbHBlcjogJ1wiICsgYXJnICsgXCInXCIpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYmxvY2tIZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSB8fCBmdW5jdGlvbigpIHt9LCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuXG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbih0aGlzKTtcbiAgfSBlbHNlIGlmKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgaWYoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZm4oY29udGV4dCk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLksgPSBmdW5jdGlvbigpIHt9O1xuXG5IYW5kbGViYXJzLmNyZWF0ZUZyYW1lID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbihvYmplY3QpIHtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG9iamVjdDtcbiAgdmFyIG9iaiA9IG5ldyBIYW5kbGViYXJzLksoKTtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG51bGw7XG4gIHJldHVybiBvYmo7XG59O1xuXG5IYW5kbGViYXJzLmxvZ2dlciA9IHtcbiAgREVCVUc6IDAsIElORk86IDEsIFdBUk46IDIsIEVSUk9SOiAzLCBsZXZlbDogMyxcblxuICBtZXRob2RNYXA6IHswOiAnZGVidWcnLCAxOiAnaW5mbycsIDI6ICd3YXJuJywgMzogJ2Vycm9yJ30sXG5cbiAgLy8gY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgb2JqKSB7XG4gICAgaWYgKEhhbmRsZWJhcnMubG9nZ2VyLmxldmVsIDw9IGxldmVsKSB7XG4gICAgICB2YXIgbWV0aG9kID0gSGFuZGxlYmFycy5sb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5IYW5kbGViYXJzLmxvZyA9IGZ1bmN0aW9uKGxldmVsLCBvYmopIHsgSGFuZGxlYmFycy5sb2dnZXIubG9nKGxldmVsLCBvYmopOyB9O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdlYWNoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgZm4gPSBvcHRpb25zLmZuLCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlO1xuICB2YXIgaSA9IDAsIHJldCA9IFwiXCIsIGRhdGE7XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICBkYXRhID0gSGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICB9XG5cbiAgaWYoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICBpZihjb250ZXh0IGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgZm9yKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGk8ajsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhKSB7IGRhdGEuaW5kZXggPSBpOyB9XG4gICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbaV0sIHsgZGF0YTogZGF0YSB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICBpZihjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBpZihkYXRhKSB7IGRhdGEua2V5ID0ga2V5OyB9XG4gICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtrZXldLCB7ZGF0YTogZGF0YX0pO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmKGkgPT09IDApe1xuICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbmRpdGlvbmFsKTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKCFjb25kaXRpb25hbCB8fCBIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29uZGl0aW9uYWwpKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHJldHVybiBIYW5kbGViYXJzLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm59KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYgKCFIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICBIYW5kbGViYXJzLmxvZyhsZXZlbCwgY29udGV4dCk7XG59KTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZNID0ge1xuICB0ZW1wbGF0ZTogZnVuY3Rpb24odGVtcGxhdGVTcGVjKSB7XG4gICAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgICB2YXIgY29udGFpbmVyID0ge1xuICAgICAgZXNjYXBlRXhwcmVzc2lvbjogSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgICAgaW52b2tlUGFydGlhbDogSGFuZGxlYmFycy5WTS5pbnZva2VQYXJ0aWFsLFxuICAgICAgcHJvZ3JhbXM6IFtdLFxuICAgICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXTtcbiAgICAgICAgaWYoZGF0YSkge1xuICAgICAgICAgIHByb2dyYW1XcmFwcGVyID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuLCBkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSBIYW5kbGViYXJzLlZNLnByb2dyYW0oaSwgZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICAgIH0sXG4gICAgICBtZXJnZTogZnVuY3Rpb24ocGFyYW0sIGNvbW1vbikge1xuICAgICAgICB2YXIgcmV0ID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICAgIGlmIChwYXJhbSAmJiBjb21tb24pIHtcbiAgICAgICAgICByZXQgPSB7fTtcbiAgICAgICAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZChyZXQsIGNvbW1vbik7XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBwYXJhbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0sXG4gICAgICBwcm9ncmFtV2l0aERlcHRoOiBIYW5kbGViYXJzLlZNLnByb2dyYW1XaXRoRGVwdGgsXG4gICAgICBub29wOiBIYW5kbGViYXJzLlZNLm5vb3AsXG4gICAgICBjb21waWxlckluZm86IG51bGxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlU3BlYy5jYWxsKGNvbnRhaW5lciwgSGFuZGxlYmFycywgY29udGV4dCwgb3B0aW9ucy5oZWxwZXJzLCBvcHRpb25zLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEpO1xuXG4gICAgICB2YXIgY29tcGlsZXJJbmZvID0gY29udGFpbmVyLmNvbXBpbGVySW5mbyB8fCBbXSxcbiAgICAgICAgICBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICAgICAgY3VycmVudFJldmlzaW9uID0gSGFuZGxlYmFycy5DT01QSUxFUl9SRVZJU0lPTjtcblxuICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IEhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrcnVudGltZVZlcnNpb25zK1wiKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKFwiK2NvbXBpbGVyVmVyc2lvbnMrXCIpLlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgICAgIHRocm93IFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJJbmZvWzFdK1wiKS5cIjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH0sXG5cbiAgcHJvZ3JhbVdpdGhEZXB0aDogZnVuY3Rpb24oaSwgZm4sIGRhdGEgLyosICRkZXB0aCAqLykge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcblxuICAgIHZhciBwcm9ncmFtID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBbY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGFdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgICBwcm9ncmFtLnByb2dyYW0gPSBpO1xuICAgIHByb2dyYW0uZGVwdGggPSBhcmdzLmxlbmd0aDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGEpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gMDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgbm9vcDogZnVuY3Rpb24oKSB7IHJldHVybiBcIlwiOyB9LFxuICBpbnZva2VQYXJ0aWFsOiBmdW5jdGlvbihwYXJ0aWFsLCBuYW1lLCBjb250ZXh0LCBoZWxwZXJzLCBwYXJ0aWFscywgZGF0YSkge1xuICAgIHZhciBvcHRpb25zID0geyBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcblxuICAgIGlmKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuICAgIH0gZWxzZSBpZihwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAoIUhhbmRsZWJhcnMuY29tcGlsZSkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydGlhbHNbbmFtZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUocGFydGlhbCwge2RhdGE6IGRhdGEgIT09IHVuZGVmaW5lZH0pO1xuICAgICAgcmV0dXJuIHBhcnRpYWxzW25hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy50ZW1wbGF0ZSA9IEhhbmRsZWJhcnMuVk0udGVtcGxhdGU7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcblxufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbkhhbmRsZWJhcnMuRXhjZXB0aW9uID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG59O1xuSGFuZGxlYmFycy5FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbi8vIEJ1aWxkIG91dCBvdXIgYmFzaWMgU2FmZVN0cmluZyB0eXBlXG5IYW5kbGViYXJzLlNhZmVTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59O1xuSGFuZGxlYmFycy5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJpbmcudG9TdHJpbmcoKTtcbn07XG5cbnZhciBlc2NhcGUgPSB7XG4gIFwiJlwiOiBcIiZhbXA7XCIsXG4gIFwiPFwiOiBcIiZsdDtcIixcbiAgXCI+XCI6IFwiJmd0O1wiLFxuICAnXCInOiBcIiZxdW90O1wiLFxuICBcIidcIjogXCImI3gyNztcIixcbiAgXCJgXCI6IFwiJiN4NjA7XCJcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZztcbnZhciBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG52YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl0gfHwgXCImYW1wO1wiO1xufTtcblxuSGFuZGxlYmFycy5VdGlscyA9IHtcbiAgZXh0ZW5kOiBmdW5jdGlvbihvYmosIHZhbHVlKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICAgIGlmKHZhbHVlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWx1ZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBlc2NhcGVFeHByZXNzaW9uOiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyBpbnN0YW5jZW9mIEhhbmRsZWJhcnMuU2FmZVN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZy50b1N0cmluZygpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwgfHwgc3RyaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gc3RyaW5nLnRvU3RyaW5nKCk7XG5cbiAgICBpZighcG9zc2libGUudGVzdChzdHJpbmcpKSB7IHJldHVybiBzdHJpbmc7IH1cbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xuICB9LFxuXG4gIGlzRW1wdHk6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmKHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgQXJyYXldXCIgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcycpLmNyZWF0ZSgpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzJykuYXR0YWNoKGV4cG9ydHMpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMnKS5hdHRhY2goZXhwb3J0cykiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL3Zpc2liaWxpdHkudGltZXJzLmpzJylcbiIsIjsoZnVuY3Rpb24gKGdsb2JhbCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIGxhc3RJZCA9IC0xO1xuXG4gICAgLy8gVmlzaWJpbGl0eS5qcyBhbGxvdyB5b3UgdG8ga25vdywgdGhhdCB5b3VyIHdlYiBwYWdlIGlzIGluIHRoZSBiYWNrZ3JvdW5kXG4gICAgLy8gdGFiIGFuZCB0aHVzIG5vdCB2aXNpYmxlIHRvIHRoZSB1c2VyLiBUaGlzIGxpYnJhcnkgaXMgd3JhcCB1bmRlclxuICAgIC8vIFBhZ2UgVmlzaWJpbGl0eSBBUEkuIEl0IGZpeCBwcm9ibGVtcyB3aXRoIGRpZmZlcmVudCB2ZW5kb3IgcHJlZml4ZXMgYW5kXG4gICAgLy8gYWRkIGhpZ2gtbGV2ZWwgdXNlZnVsIGZ1bmN0aW9ucy5cbiAgICB2YXIgc2VsZiA9IHtcblxuICAgICAgICAvLyBDYWxsIGNhbGxiYWNrIG9ubHkgd2hlbiBwYWdlIGJlY29tZSB0byB2aXNpYmxlIGZvciB1c2VyIG9yXG4gICAgICAgIC8vIGNhbGwgaXQgbm93IGlmIHBhZ2UgaXMgdmlzaWJsZSBub3cgb3IgUGFnZSBWaXNpYmlsaXR5IEFQSVxuICAgICAgICAvLyBkb2VzbuKAmXQgc3VwcG9ydGVkLlxuICAgICAgICAvL1xuICAgICAgICAvLyBSZXR1cm4gZmFsc2UgaWYgQVBJIGlzbuKAmXQgc3VwcG9ydGVkLCB0cnVlIGlmIHBhZ2UgaXMgYWxyZWFkeSB2aXNpYmxlXG4gICAgICAgIC8vIG9yIGxpc3RlbmVyIElEICh5b3UgY2FuIHVzZSBpdCBpbiBgdW5iaW5kYCBtZXRob2QpIGlmIHBhZ2UgaXNu4oCZdFxuICAgICAgICAvLyB2aXNpYmxlIG5vdy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gICBWaXNpYmlsaXR5Lm9uVmlzaWJsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vICAgICAgIHN0YXJ0SW50cm9BbmltYXRpb24oKTtcbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgb25WaXNpYmxlOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBzdXBwb3J0ID0gc2VsZi5pc1N1cHBvcnRlZCgpO1xuICAgICAgICAgICAgaWYgKCAhc3VwcG9ydCB8fCAhc2VsZi5oaWRkZW4oKSApIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdXBwb3J0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBzZWxmLmNoYW5nZShmdW5jdGlvbiAoZSwgc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoICFzZWxmLmhpZGRlbigpICkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnVuYmluZChsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gQ2FsbCBjYWxsYmFjayB3aGVuIHZpc2liaWxpdHkgd2lsbCBiZSBjaGFuZ2VkLiBGaXJzdCBhcmd1bWVudCBmb3JcbiAgICAgICAgLy8gY2FsbGJhY2sgd2lsbCBiZSBvcmlnaW5hbCBldmVudCBvYmplY3QsIHNlY29uZCB3aWxsIGJlIHZpc2liaWxpdHlcbiAgICAgICAgLy8gc3RhdGUgbmFtZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gUmV0dXJuIGxpc3RlbmVyIElEIHRvIHVuYmluZCBsaXN0ZW5lciBieSBgdW5iaW5kYCBtZXRob2QuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIElmIFBhZ2UgVmlzaWJpbGl0eSBBUEkgZG9lc27igJl0IHN1cHBvcnRlZCBtZXRob2Qgd2lsbCBiZSByZXR1cm4gZmFsc2VcbiAgICAgICAgLy8gYW5kIGNhbGxiYWNrIG5ldmVyIHdpbGwgYmUgY2FsbGVkLlxuICAgICAgICAvL1xuICAgICAgICAvLyAgIFZpc2liaWxpdHkuY2hhbmdlKGZ1bmN0aW9uKGUsIHN0YXRlKSB7XG4gICAgICAgIC8vICAgICAgIFN0YXRpc3RpY3MudmlzaWJpbGl0eUNoYW5nZShzdGF0ZSk7XG4gICAgICAgIC8vICAgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIEl0IGlzIGp1c3QgcHJveHkgdG8gYHZpc2liaWxpdHljaGFuZ2VgIGV2ZW50LCBidXQgdXNlIHZlbmRvciBwcmVmaXguXG4gICAgICAgIGNoYW5nZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoICFzZWxmLmlzU3VwcG9ydGVkKCkgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdElkICs9IDE7XG4gICAgICAgICAgICB2YXIgbnVtYmVyID0gbGFzdElkO1xuICAgICAgICAgICAgc2VsZi5fY2FsbGJhY2tzW251bWJlcl0gPSBjYWxsYmFjaztcbiAgICAgICAgICAgIHNlbGYuX2xpc3RlbigpO1xuICAgICAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBSZW1vdmUgYGNoYW5nZWAgbGlzdGVuZXIgYnkgaXQgSUQuXG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgdmFyIGlkID0gVmlzaWJpbGl0eS5jaGFuZ2UoZnVuY3Rpb24oZSwgc3RhdGUpIHtcbiAgICAgICAgLy8gICAgICAgZmlyc3RDaGFuZ2VDYWxsYmFjaygpO1xuICAgICAgICAvLyAgICAgICBWaXNpYmlsaXR5LnVuYmluZChpZCk7XG4gICAgICAgIC8vICAgfSk7XG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICBkZWxldGUgc2VsZi5fY2FsbGJhY2tzW2lkXTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBDYWxsIGBjYWxsYmFja2AgaW4gYW55IHN0YXRlLCBleHBlY3Qg4oCccHJlcmVuZGVy4oCdLiBJZiBjdXJyZW50IHN0YXRlXG4gICAgICAgIC8vIGlzIOKAnHByZXJlbmRlcuKAnSBpdCB3aWxsIHdhaXQgdW50aWwgc3RhdGUgd2lsbCBiZSBjaGFuZ2VkLlxuICAgICAgICAvLyBJZiBQYWdlIFZpc2liaWxpdHkgQVBJIGRvZXNu4oCZdCBzdXBwb3J0ZWQsIGl0IHdpbGwgY2FsbCBgY2FsbGJhY2tgXG4gICAgICAgIC8vIGltbWVkaWF0ZWx5LlxuICAgICAgICAvL1xuICAgICAgICAvLyBSZXR1cm4gZmFsc2UgaWYgQVBJIGlzbuKAmXQgc3VwcG9ydGVkLCB0cnVlIGlmIHBhZ2UgaXMgYWxyZWFkeSBhZnRlclxuICAgICAgICAvLyBwcmVyZW5kZXJpbmcgb3IgbGlzdGVuZXIgSUQgKHlvdSBjYW4gdXNlIGl0IGluIGB1bmJpbmRgIG1ldGhvZClcbiAgICAgICAgLy8gaWYgcGFnZSBpcyBwcmVyZW5kZWQgbm93LlxuICAgICAgICAvL1xuICAgICAgICAvLyAgIFZpc2liaWxpdHkuYWZ0ZXJQcmVyZW5kZXJpbmcoZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgICAgICBTdGF0aXN0aWNzLmNvdW50VmlzaXRvcigpO1xuICAgICAgICAvLyAgIH0pO1xuICAgICAgICBhZnRlclByZXJlbmRlcmluZzogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgc3VwcG9ydCAgID0gc2VsZi5pc1N1cHBvcnRlZCgpO1xuICAgICAgICAgICAgdmFyIHByZXJlbmRlciA9ICdwcmVyZW5kZXInO1xuXG4gICAgICAgICAgICBpZiAoICFzdXBwb3J0IHx8IHByZXJlbmRlciAhPSBzZWxmLnN0YXRlKCkgKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VwcG9ydDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGxpc3RlbmVyID0gc2VsZi5jaGFuZ2UoZnVuY3Rpb24gKGUsIHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBwcmVyZW5kZXIgIT0gc3RhdGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudW5iaW5kKGxpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBpZiBwYWdlIG5vdyBpc27igJl0IHZpc2libGUgdG8gdXNlci5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gICBpZiAoICFWaXNpYmlsaXR5LmhpZGRlbigpICkge1xuICAgICAgICAvLyAgICAgICBWaWRlb1BsYXllci5wbGF5KCk7XG4gICAgICAgIC8vICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyBJdCBpcyBqdXN0IHByb3h5IHRvIGBkb2N1bWVudC5oaWRkZW5gLCBidXQgdXNlIHZlbmRvciBwcmVmaXguXG4gICAgICAgIGhpZGRlbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhKHNlbGYuX2RvYy5oaWRkZW4gfHwgc2VsZi5fZG9jLndlYmtpdEhpZGRlbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gUmV0dXJuIHZpc2liaWxpdHkgc3RhdGU6ICd2aXNpYmxlJywgJ2hpZGRlbicgb3IgJ3ByZXJlbmRlcicuXG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgaWYgKCAncHJlcmVuZGVyJyA9PSBWaXNpYmlsaXR5LnN0YXRlKCkgKSB7XG4gICAgICAgIC8vICAgICAgIFN0YXRpc3RpY3MucGFnZUlzUHJlcmVuZGVyaW5nKCk7XG4gICAgICAgIC8vICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyBEb27igJl0IHVzZSBgVmlzaWJpbGl0eS5zdGF0ZSgpYCB0byBkZXRlY3QsIGlzIHBhZ2UgdmlzaWJsZSwgYmVjYXVzZVxuICAgICAgICAvLyB2aXNpYmlsaXR5IHN0YXRlcyBjYW4gZXh0ZW5kIGluIG5leHQgQVBJIHZlcnNpb25zLlxuICAgICAgICAvLyBVc2UgbW9yZSBzaW1wbGVyIGFuZCBnZW5lcmFsIGBWaXNpYmlsaXR5LmhpZGRlbigpYCBmb3IgdGhpcyBjYXNlcy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gSXQgaXMganVzdCBwcm94eSB0byBgZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlYCwgYnV0IHVzZVxuICAgICAgICAvLyB2ZW5kb3IgcHJlZml4LlxuICAgICAgICBzdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2RvYy52aXNpYmlsaXR5U3RhdGUgICAgICAgfHxcbiAgICAgICAgICAgICAgICAgICBzZWxmLl9kb2Mud2Via2l0VmlzaWJpbGl0eVN0YXRlIHx8XG4gICAgICAgICAgICAgICAgICAgJ3Zpc2libGUnO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFJldHVybiB0cnVlIGlmIGJyb3dzZXIgc3VwcG9ydCBQYWdlIFZpc2liaWxpdHkgQVBJLlxuICAgICAgICAvL1xuICAgICAgICAvLyAgIGlmICggVmlzaWJpbGl0eS5pc1N1cHBvcnRlZCgpICkge1xuICAgICAgICAvLyAgICAgICBTdGF0aXN0aWNzLnN0YXJ0VHJhY2tpbmdWaXNpYmlsaXR5KCk7XG4gICAgICAgIC8vICAgICAgIFZpc2liaWxpdHkuY2hhbmdlKGZ1bmN0aW9uKGUsIHN0YXRlKSkge1xuICAgICAgICAvLyAgICAgICAgICAgU3RhdGlzdGljcy50cmFja1Zpc2liaWxpdHkoc3RhdGUpO1xuICAgICAgICAvLyAgICAgICB9KTtcbiAgICAgICAgLy8gICB9XG4gICAgICAgIGlzU3VwcG9ydGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gISEoc2VsZi5fZG9jLnZpc2liaWxpdHlTdGF0ZSB8fFxuICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2RvYy53ZWJraXRWaXNpYmlsaXR5U3RhdGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIExpbmsgdG8gZG9jdW1lbnQgb2JqZWN0IHRvIGNoYW5nZSBpdCBpbiB0ZXN0cy5cbiAgICAgICAgX2RvYzogZG9jdW1lbnQgfHwge30sXG5cbiAgICAgICAgLy8gQ2FsbGJhY2tzIGZyb20gYGNoYW5nZWAgbWV0aG9kLCB0aGF0IHdhaXQgdmlzaWJpbGl0eSBjaGFuZ2VzLlxuICAgICAgICBfY2FsbGJhY2tzOiB7IH0sXG5cbiAgICAgICAgLy8gTGlzdGVuZXIgZm9yIGB2aXNpYmlsaXR5Y2hhbmdlYCBldmVudC5cbiAgICAgICAgX2NoYW5nZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHNlbGYuc3RhdGUoKTtcblxuICAgICAgICAgICAgZm9yICggdmFyIGkgaW4gc2VsZi5fY2FsbGJhY2tzICkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2NhbGxiYWNrc1tpXS5jYWxsKHNlbGYuX2RvYywgZXZlbnQsIHN0YXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBTZXQgbGlzdGVuZXIgZm9yIGB2aXNpYmlsaXR5Y2hhbmdlYCBldmVudC5cbiAgICAgICAgX2xpc3RlbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCBzZWxmLl9pbml0ICkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGV2ZW50ID0gJ3Zpc2liaWxpdHljaGFuZ2UnO1xuICAgICAgICAgICAgaWYgKCBzZWxmLl9kb2Mud2Via2l0VmlzaWJpbGl0eVN0YXRlICkge1xuICAgICAgICAgICAgICAgIGV2ZW50ID0gJ3dlYmtpdCcgKyBldmVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2NoYW5nZS5hcHBseShzZWxmLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICggc2VsZi5fZG9jLmFkZEV2ZW50TGlzdGVuZXIgKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZG9jLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZG9jLmF0dGFjaEV2ZW50KGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLl9pbml0ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIGlmICggdHlwZW9mKG1vZHVsZSkgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gc2VsZjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBnbG9iYWwuVmlzaWJpbGl0eSA9IHNlbGY7XG4gICAgfVxuXG59KSh0aGlzKTtcbiIsIjsoZnVuY3Rpb24gKHdpbmRvdykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIGxhc3RUaW1lciA9IC0xO1xuXG4gICAgdmFyIGluc3RhbGwgPSBmdW5jdGlvbiAoVmlzaWJpbGl0eSkge1xuXG4gICAgICAgIC8vIFJ1biBjYWxsYmFjayBldmVyeSBgaW50ZXJ2YWxgIG1pbGxpc2Vjb25kcyBpZiBwYWdlIGlzIHZpc2libGUgYW5kXG4gICAgICAgIC8vIGV2ZXJ5IGBoaWRkZW5JbnRlcnZhbGAgbWlsbGlzZWNvbmRzIGlmIHBhZ2UgaXMgaGlkZGVuLlxuICAgICAgICAvL1xuICAgICAgICAvLyAgIFZpc2liaWxpdHkuZXZlcnkoNjAgKiAxMDAwLCA1ICogNjAgKiAxMDAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vICAgICAgIGNoZWNrTmV3TWFpbHMoKTtcbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gWW91IGNhbiBza2lwIGBoaWRkZW5JbnRlcnZhbGAgYW5kIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIG9ubHkgaWZcbiAgICAgICAgLy8gcGFnZSBpcyB2aXNpYmxlLlxuICAgICAgICAvL1xuICAgICAgICAvLyAgIFZpc2liaWxpdHkuZXZlcnkoMTAwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgICAgICB1cGRhdGVDb3VudGRvd24oKTtcbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gSXQgaXMgYW5hbG9nIG9mIGBzZXRJbnRlcnZhbChjYWxsYmFjaywgaW50ZXJ2YWwpYCBidXQgdXNlIHZpc2liaWxpdHlcbiAgICAgICAgLy8gc3RhdGUuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEl0IHJldHVybiB0aW1lciBJRCwgdGhhdCB5b3UgY2FuIHVzZSBpbiBgVmlzaWJpbGl0eS5zdG9wKGlkKWAgdG8gc3RvcFxuICAgICAgICAvLyB0aW1lciAoYGNsZWFySW50ZXJ2YWxgIGFuYWxvZykuXG4gICAgICAgIC8vIFdhcm5pbmc6IHRpbWVyIElEIGlzIGRpZmZlcmVudCBmcm9tIGludGVydmFsIElEIGZyb20gYHNldEludGVydmFsYCxcbiAgICAgICAgLy8gc28gZG9u4oCZdCB1c2UgaXQgaW4gYGNsZWFySW50ZXJ2YWxgLlxuICAgICAgICAvL1xuICAgICAgICAvLyBPbiBjaGFuZ2Ugc3RhdGUgZnJvbSBoaWRkZW4gdG8gdmlzaWJsZSB0aW1lcnMgd2lsbCBiZSBleGVjdXRlLlxuICAgICAgICBWaXNpYmlsaXR5LmV2ZXJ5ID0gZnVuY3Rpb24gKGludGVydmFsLCBoaWRkZW5JbnRlcnZhbCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIFZpc2liaWxpdHkuX3RpbWUoKTtcblxuICAgICAgICAgICAgaWYgKCAhY2FsbGJhY2sgKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBoaWRkZW5JbnRlcnZhbDtcbiAgICAgICAgICAgICAgICBoaWRkZW5JbnRlcnZhbCA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhc3RUaW1lciArPSAxO1xuICAgICAgICAgICAgdmFyIG51bWJlciA9IGxhc3RUaW1lcjtcblxuICAgICAgICAgICAgVmlzaWJpbGl0eS5fdGltZXJzW251bWJlcl0gPSB7XG4gICAgICAgICAgICAgICAgdmlzaWJsZTogIGludGVydmFsLFxuICAgICAgICAgICAgICAgIGhpZGRlbjogICBoaWRkZW5JbnRlcnZhbCxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2tcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBWaXNpYmlsaXR5Ll9ydW4obnVtYmVyLCBmYWxzZSk7XG5cbiAgICAgICAgICAgIGlmICggVmlzaWJpbGl0eS5pc1N1cHBvcnRlZCgpICkge1xuICAgICAgICAgICAgICAgIFZpc2liaWxpdHkuX2xpc3RlbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTdG9wIHRpbWVyIGZyb20gYGV2ZXJ5YCBtZXRob2QgYnkgaXQgSUQgKGBldmVyeWAgbWV0aG9kIHJldHVybiBpdCkuXG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgc2xpZGVzaG93ID0gVmlzaWJpbGl0eS5ldmVyeSg1ICogMTAwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgICAgICBjaGFuZ2VTbGlkZSgpO1xuICAgICAgICAvLyAgIH0pO1xuICAgICAgICAvLyAgICQoJy5zdG9wU2xpZGVzaG93JykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgICAgICBWaXNpYmlsaXR5LnN0b3Aoc2xpZGVzaG93KTtcbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgVmlzaWJpbGl0eS5zdG9wID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIGlmICggIVZpc2liaWxpdHkuX3RpbWVyc1tpZF0gKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgVmlzaWJpbGl0eS5fc3RvcChpZCk7XG4gICAgICAgICAgICBkZWxldGUgVmlzaWJpbGl0eS5fdGltZXJzW2lkXTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENhbGxiYWNrcyBhbmQgaW50ZXJ2YWxzIGFkZGVkIGJ5IGBldmVyeWAgbWV0aG9kLlxuICAgICAgICBWaXNpYmlsaXR5Ll90aW1lcnMgPSB7IH07XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSB2YXJpYWJsZXMgb24gcGFnZSBsb2FkaW5nLlxuICAgICAgICBWaXNpYmlsaXR5Ll90aW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCBWaXNpYmlsaXR5Ll90aW1lZCApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBWaXNpYmlsaXR5Ll90aW1lZCAgICAgPSB0cnVlO1xuICAgICAgICAgICAgVmlzaWJpbGl0eS5fd2FzSGlkZGVuID0gVmlzaWJpbGl0eS5oaWRkZW4oKTtcblxuICAgICAgICAgICAgVmlzaWJpbGl0eS5jaGFuZ2UoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFZpc2liaWxpdHkuX3N0b3BSdW4oKTtcbiAgICAgICAgICAgICAgICBWaXNpYmlsaXR5Ll93YXNIaWRkZW4gPSBWaXNpYmlsaXR5LmhpZGRlbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVHJ5IHRvIHJ1biB0aW1lciBmcm9tIGV2ZXJ5IG1ldGhvZCBieSBpdOKAmXMgSUQuIEl0IHdpbGwgYmUgdXNlXG4gICAgICAgIC8vIGBpbnRlcnZhbGAgb3IgYGhpZGRlbkludGVydmFsYCBkZXBlbmRpbmcgb24gdmlzaWJpbGl0eSBzdGF0ZS5cbiAgICAgICAgLy8gSWYgcGFnZSBpcyBoaWRkZW4gYW5kIGBoaWRkZW5JbnRlcnZhbGAgaXMgbnVsbCxcbiAgICAgICAgLy8gaXQgd2lsbCBub3QgcnVuIHRpbWVyLlxuICAgICAgICAvL1xuICAgICAgICAvLyBBcmd1bWVudCBgcnVuTm93YCBzYXksIHRoYXQgdGltZXJzIG11c3QgYmUgZXhlY3V0ZSBub3cgdG9vLlxuICAgICAgICBWaXNpYmlsaXR5Ll9ydW4gPSBmdW5jdGlvbiAoaWQsIHJ1bk5vdykge1xuICAgICAgICAgICAgdmFyIGludGVydmFsLFxuICAgICAgICAgICAgICAgIHRpbWVyID0gVmlzaWJpbGl0eS5fdGltZXJzW2lkXTtcblxuICAgICAgICAgICAgaWYgKCBWaXNpYmlsaXR5LmhpZGRlbigpICkge1xuICAgICAgICAgICAgICAgIGlmICggbnVsbCA9PT0gdGltZXIuaGlkZGVuICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGludGVydmFsID0gdGltZXIuaGlkZGVuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IHRpbWVyLnZpc2libGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBydW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGltZXIubGFzdCA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgdGltZXIuY2FsbGJhY2suY2FsbCh3aW5kb3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIHJ1bk5vdyApIHtcbiAgICAgICAgICAgICAgICB2YXIgbm93ICA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgdmFyIGxhc3QgPSBub3cgLSB0aW1lci5sYXN0IDtcblxuICAgICAgICAgICAgICAgIGlmICggaW50ZXJ2YWwgPiBsYXN0ICkge1xuICAgICAgICAgICAgICAgICAgICB0aW1lci5kZWxheSA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXIuaWQgPSBzZXRJbnRlcnZhbChydW5uZXIsIGludGVydmFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5lcigpO1xuICAgICAgICAgICAgICAgICAgICB9LCBpbnRlcnZhbCAtIGxhc3QpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVyLmlkID0gc2V0SW50ZXJ2YWwocnVubmVyLCBpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5lcigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGltZXIuaWQgPSBzZXRJbnRlcnZhbChydW5uZXIsIGludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTdG9wIHRpbWVyIGZyb20gYGV2ZXJ5YCBtZXRob2QgYnkgaXTigJlzIElELlxuICAgICAgICBWaXNpYmlsaXR5Ll9zdG9wID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICB2YXIgdGltZXIgPSBWaXNpYmlsaXR5Ll90aW1lcnNbaWRdO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lci5pZCk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIuZGVsYXkpO1xuICAgICAgICAgICAgZGVsZXRlIHRpbWVyLmlkO1xuICAgICAgICAgICAgZGVsZXRlIHRpbWVyLmRlbGF5O1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIExpc3RlbmVyIGZvciBgdmlzaWJpbGl0eWNoYW5nZWAgZXZlbnQuXG4gICAgICAgIFZpc2liaWxpdHkuX3N0b3BSdW4gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBpc0hpZGRlbiAgPSBWaXNpYmlsaXR5LmhpZGRlbigpLFxuICAgICAgICAgICAgICAgIHdhc0hpZGRlbiA9IFZpc2liaWxpdHkuX3dhc0hpZGRlbjtcblxuICAgICAgICAgICAgaWYgKCAoaXNIaWRkZW4gJiYgIXdhc0hpZGRlbikgfHwgKCFpc0hpZGRlbiAmJiB3YXNIaWRkZW4pICkge1xuICAgICAgICAgICAgICAgIGZvciAoIHZhciBpIGluIFZpc2liaWxpdHkuX3RpbWVycyApIHtcbiAgICAgICAgICAgICAgICAgICAgVmlzaWJpbGl0eS5fc3RvcChpKTtcbiAgICAgICAgICAgICAgICAgICAgVmlzaWJpbGl0eS5fcnVuKGksICFpc0hpZGRlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBWaXNpYmlsaXR5O1xuICAgIH1cblxuICAgIGlmICggdHlwZW9mKG1vZHVsZSkgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gaW5zdGFsbChyZXF1aXJlKCcuL3Zpc2liaWxpdHkuY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpbnN0YWxsKHdpbmRvdy5WaXNpYmlsaXR5KVxuICAgIH1cblxufSkod2luZG93KTtcbiIsIiMjIypcbiAqIFByaW1hcnkgYXBwbGljYXRpb24gY29udHJvbGxlclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblZpc2liaWxpdHkgICAgICAgID0gcmVxdWlyZSAndmlzaWJpbGl0eWpzJ1xuQXBwQ29uZmlnICAgICAgICAgPSByZXF1aXJlICcuL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgICAgICAgICAgPSByZXF1aXJlICcuL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5QdWJFdmVudCAgICAgICAgICA9IHJlcXVpcmUgJy4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblNoYXJlZFRyYWNrTW9kZWwgID0gcmVxdWlyZSAnLi9tb2RlbHMvU2hhcmVkVHJhY2tNb2RlbC5jb2ZmZWUnXG5BcHBSb3V0ZXIgICAgICAgICA9IHJlcXVpcmUgJy4vcm91dGVycy9BcHBSb3V0ZXIuY29mZmVlJ1xuQnJlYWtwb2ludE1hbmFnZXIgPSByZXF1aXJlICcuL3V0aWxzL0JyZWFrcG9pbnRNYW5hZ2VyLmNvZmZlZSdcblB1YlN1YiAgICAgICAgICAgID0gcmVxdWlyZSAnLi91dGlscy9QdWJTdWInXG5Ccm93c2VyRGV0ZWN0ICAgICA9IHJlcXVpcmUgJy4vdXRpbHMvQnJvd3NlckRldGVjdCdcbkxhbmRpbmdWaWV3ICAgICAgID0gcmVxdWlyZSAnLi92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSdcbkNyZWF0ZVZpZXcgICAgICAgID0gcmVxdWlyZSAnLi92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUnXG5TaGFyZVZpZXcgICAgICAgICA9IHJlcXVpcmUgJy4vdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSdcblZpc3VhbGl6ZXJWaWV3ICAgID0gcmVxdWlyZSAnLi92aWV3cy92aXN1YWxpemVyL1Zpc3VhbGl6ZXJWaWV3LmNvZmZlZSdcbk5vdFN1cHBvcnRlZFZpZXcgID0gcmVxdWlyZSAnLi92aWV3cy9ub3Qtc3VwcG9ydGVkL05vdFN1cHBvcnRlZFZpZXcuY29mZmVlJ1xuVmlldyAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3N1cGVycy9WaWV3LmNvZmZlZSdcbm9ic2VydmVEb20gICAgICAgID0gcmVxdWlyZSAnLi91dGlscy9vYnNlcnZlRG9tJ1xubWFpblRlbXBsYXRlICAgICAgPSByZXF1aXJlICcuL3ZpZXdzL3RlbXBsYXRlcy9tYWluLXRlbXBsYXRlLmhicydcblxuY2xhc3MgQXBwQ29udHJvbGxlciBleHRlbmRzIFZpZXdcblxuICBpZDogJ3dyYXBwZXInXG5cbiAgIyBDaGVja3MgaWYgdmlzdWFsaXphdGlvbiBpcyByZW5kZXJlZC4gIFVzZWZ1bCB3aGVuIGFycml2aW5nIHRvIHBhZ2UgYmVmb3JlXG4gICMgc3RhcnRpbmcgaW5pdGlhbGx5LCBvciBhcnJpdmluZyBvbiBhIFNoYXJlXG4gICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgdmlzdWFsaXphdGlvblJlbmRlcmVkOiBmYWxzZVxuXG4gICMgVGhlIG51bWJlciBvZiBhdHRlbXB0cyBpdCB3aWxsIG1ha2UgdG8gc2F2ZSB0aGUgdHJhY2sgdG8gUGFyc2VcbiAgIyB3aXRob3V0IHRpbWluZyBvdXQuICBNYXggaXMgM1xuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgcGFyc2VFcnJvckF0dGVtcHRzOiAwXG5cblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG5cbiAgICBAJGJvZHkgPSAkICdib2R5J1xuICAgIEAkd2luZG93ID0gJCAnd2luZG93J1xuXG4gICAgQGJyZWFrcG9pbnRNYW5hZ2VyID0gbmV3IEJyZWFrcG9pbnRNYW5hZ2VyXG4gICAgICBicmVha3BvaW50czogQXBwQ29uZmlnLkJSRUFLUE9JTlRTXG4gICAgICBzY29wZTogQFxuXG4gICAgIyBTaGFyZWQgdHJhY2sgbW9kZWwgaXMgdXNlZCBmb3Igc2F2aW5nIHRvIFBhcnNlLFxuICAgICMgb3IgcHJlcG9wdWxhdGluZyBmb3IgUHJlc2V0c1xuXG4gICAgQHNoYXJlZFRyYWNrTW9kZWwgPSBuZXcgU2hhcmVkVHJhY2tNb2RlbFxuXG4gICAgQGxhbmRpbmdWaWV3ID0gbmV3IExhbmRpbmdWaWV3XG4gICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICBAY3JlYXRlVmlldyA9IG5ldyBDcmVhdGVWaWV3XG4gICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICBzaGFyZWRUcmFja01vZGVsOiBAc2hhcmVkVHJhY2tNb2RlbFxuICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgIEBzaGFyZVZpZXcgPSBuZXcgU2hhcmVWaWV3XG4gICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICBzaGFyZWRUcmFja01vZGVsOiBAc2hhcmVkVHJhY2tNb2RlbFxuICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgIEBub3RTdXBwb3J0ZWRWaWV3ID0gbmV3IE5vdFN1cHBvcnRlZFZpZXdcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgIEBhcHBSb3V0ZXIgPSBuZXcgQXBwUm91dGVyXG4gICAgICBhcHBDb250cm9sbGVyOiBAXG4gICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICBAaXNNb2JpbGUgPSBAJGJvZHkuaGFzQ2xhc3MgJ21vYmlsZSdcbiAgICBAaXNUYWJsZXQgPSBpZiBCcm93c2VyRGV0ZWN0LmRldmljZURldGVjdGlvbigpLmRldmljZVR5cGUgaXMgJ3RhYmxldCcgdGhlbiB0cnVlIGVsc2UgZmFsc2VcblxuICAgIHVubGVzcyBAaXNNb2JpbGVcbiAgICAgIEB2aXN1YWxpemVyVmlldyA9IG5ldyBWaXN1YWxpemVyVmlld1xuICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAjIFRPRE86IEhvb2sgdXAgYnJvd3NlciBkZXRlY3Rpb25cbiAgICBAbm90U3VwcG9ydGVkID0gZmFsc2VcblxuICAgIGlmIEBpc01vYmlsZSBhbmQgQG5vdFN1cHBvcnRlZFxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnbm90LXN1cHBvcnRlZCdcblxuICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cblxuICAjIFJlbmRlcnMgdGhlIEFwcENvbnRyb2xsZXIgdG8gdGhlIERPTSBhbmQga2lja3NcbiAgIyBvZmYgYmFja2JvbmVzIGhpc3RvcnlcblxuICByZW5kZXI6IC0+XG4gICAgQCRib2R5LmFwcGVuZCBAJGVsLmh0bWwgbWFpblRlbXBsYXRlXG4gICAgICBpc0Rlc2t0b3A6IEAkYm9keS5oYXNDbGFzcyAnZGVza3RvcCdcblxuICAgIEAkbWFpbkNvbnRhaW5lciA9IEAkZWwuZmluZCAnI2NvbnRhaW5lci1tYWluJ1xuICAgIEAkdG9wQ29udGFpbmVyID0gQCRlbC5maW5kICcjY29udGFpbmVyLXRvcCdcbiAgICBAJGJvdHRvbUNvbnRhaW5lciA9IEAkZWwuZmluZCAnI2NvbnRhaW5lci1ib3R0b20nXG5cbiAgICBUd2VlbkxpdGUuc2V0IEAkYm90dG9tQ29udGFpbmVyLCB5OiAzMDBcblxuICAgIHVubGVzcyBAaXNNb2JpbGVcbiAgICAgIEAkbWFpbkNvbnRhaW5lci5oaWRlKClcblxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoXG5cbiAgICAgIGlmIGhhc2guaW5kZXhPZignc2hhcmUnKSBpcyAtMSBvciBoYXNoLmluZGV4T2YoJ25vdC1zdXBwb3J0ZWQnKSBpcyAtMVxuICAgICAgICBUd2VlbkxpdGUuc2V0ICQoJy50b3AtYmFyJyksIGF1dG9BbHBoYTogMFxuICAgICAgICBUd2VlbkxpdGUuc2V0IEAkbWFpbkNvbnRhaW5lciwgeTogKHdpbmRvdy5pbm5lckhlaWdodCAqIC41IC0gQCRtYWluQ29udGFpbmVyLmhlaWdodCgpICogLjUpIC0gMjVcblxuICAgIEJhY2tib25lLmhpc3Rvcnkuc3RhcnRcbiAgICAgIHB1c2hTdGF0ZTogZmFsc2VcblxuICAgIEBcblxuXG4gICMgUmVuZGVycyB0aGUgdmlzdWFsaXphdGlvbiBpZiBvbiBkZXNrdG9wXG5cbiAgcmVuZGVyVmlzdWFsaXphdGlvbkxheWVyOiAtPlxuICAgIGlmIEBhcHBNb2RlbC5nZXQoJ2lzTW9iaWxlJykgdGhlbiByZXR1cm5cblxuICAgIGlmIEB2aXN1YWxpemF0aW9uUmVuZGVyZWQgaXMgZmFsc2VcbiAgICAgIEB2aXN1YWxpemF0aW9uUmVuZGVyZWQgPSB0cnVlXG4gICAgICBAJG1haW5Db250YWluZXIucHJlcGVuZCBAdmlzdWFsaXplclZpZXcucmVuZGVyKCkuZWxcblxuXG4gICMgRGVzdHJveXMgYWxsIGN1cnJlbnQgYW5kIHByZS1yZW5kZXJlZCB2aWV3cyBhbmRcbiAgIyB1bmRlbGVnYXRlcyBldmVudCBsaXN0ZW5lcnNcblxuICByZW1vdmU6IC0+XG4gICAgQGxhbmRpbmdWaWV3Py5yZW1vdmUoKVxuICAgIEBzaGFyZVZpZXc/LnJlbW92ZSgpXG4gICAgQGNyZWF0ZVZpZXc/LnJlbW92ZSgpXG4gICAgQG5vdFN1cHBvcnRlZFZpZXc/LnJlbW92ZSgpXG5cbiAgICBzdXBlcigpXG5cblxuICAjIEFkZHMgQXBwQ29udHJvbGxlci1yZWxhdGVkIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVnaW5zXG4gICMgbGlzdGVuaW5nIHRvIHZpZXcgY2hhbmdlc1xuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9WSUVXLCBAb25WaWV3Q2hhbmdlXG4gICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0lTTU9CSUxFLCBAb25Jc01vYmlsZUNoYW5nZVxuXG4gICAgQGxpc3RlblRvIEBjcmVhdGVWaWV3LCBBcHBFdmVudC5PUEVOX1NIQVJFLCBAb25PcGVuU2hhcmVcbiAgICBAbGlzdGVuVG8gQGNyZWF0ZVZpZXcsIEFwcEV2ZW50LkNMT1NFX1NIQVJFLCBAb25DbG9zZVNoYXJlXG4gICAgQGxpc3RlblRvIEBjcmVhdGVWaWV3LCBBcHBFdmVudC5TQVZFX1RSQUNLLCBAb25TYXZlVHJhY2tcbiAgICBAbGlzdGVuVG8gQGNyZWF0ZVZpZXcsIFB1YkV2ZW50LkJFQVQsIEBvbkJlYXRcbiAgICBAbGlzdGVuVG8gQHNoYXJlVmlldywgUHViRXZlbnQuQkVBVCwgQG9uQmVhdFxuXG4gICAgQGxpc3RlblRvIEAsIEFwcEV2ZW50LkJSRUFLUE9JTlRfTUFUQ0gsIEBvbkJyZWFrcG9pbnRNYXRjaFxuXG4gICAgVmlzaWJpbGl0eS5jaGFuZ2UgQG9uVmlzaWJpbGl0eUNoYW5nZVxuXG4gICAgIyBDaGVjayBpZiBhIHVzZXIgaXMgYWRkaW5nIGl0ZW1zIHRvIHRoZSBDb2tlIHBsYXlsaXN0XG4gICAgdW5sZXNzIEBpc01vYmlsZVxuICAgICAgXy5kZWxheSA9PlxuICAgICAgICBvYnNlcnZlRG9tICQoJy5wbGl0ZW1zJylbMF0sID0+XG4gICAgICAgICAgVHdlZW5MaXRlLnRvIEAkYm90dG9tQ29udGFpbmVyLCAuNixcbiAgICAgICAgICAgIHk6IEBjcmVhdGVWaWV3LnJldHVybk1vdmVBbW91bnQoKVxuICAgICAgICAgICAgZWFzZTogRXhwby5lYXNlSW5PdXRcbiAgICAgICwgNTAwXG5cbiAgICAjIFJlc2l6ZSBsaXN0ZW4gZm9yIHJvdGF0aW9uIGFuZCByZXNwb25zXG4gICAgaWYgQXBwQ29uZmlnLkVOQUJMRV9ST1RBVElPTl9MT0NLXG4gICAgICAkKHdpbmRvdykub24gJ3Jlc2l6ZScsIEBvblJlc2l6ZVxuXG5cbiAgIyBSZW1vdmUgbGlzdGVuZXJzIGFuZCBjYWxsIHN1cGVyY2xhc3NcblxuICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAkKHdpbmRvdykub2ZmICdyZXNpemUnLCBAb25SZXNpemVcbiAgICBzdXBlcigpXG5cblxuICAjIERlc2t0b3AuICBFeHBhbmQgdGhlIHZpc3VhbGl6YXRpb24gb24gU2hhcmVNb2RhbCBvcGVuXG5cbiAgZXhwYW5kVmlzdWFsaXphdGlvbjogLT5cbiAgICB1bmxlc3MgQGlzTW9iaWxlXG4gICAgICBpZiBAYXBwTW9kZWwuZ2V0KCd2aWV3JykgaW5zdGFuY2VvZiBDcmVhdGVWaWV3XG4gICAgICAgIEBjcmVhdGVWaWV3LmhpZGVVSSgpXG5cbiAgICAgIEB2aXN1YWxpemVyVmlldy5zY2FsZVVwKClcblxuXG4gICMgRGVza3RvcC4gIENvbnRyYWN0IHRoZSB2aXN1YWxpemF0aW9uIG9uIFNoYXJlTW9kYWwgY2xvc2VcblxuICBjb250cmFjdFZpc3VhbGl6YXRpb246IC0+XG4gICAgdW5sZXNzIEBpc01vYmlsZVxuICAgICAgaWYgQGFwcE1vZGVsLmdldCgndmlldycpIGluc3RhbmNlb2YgQ3JlYXRlVmlld1xuICAgICAgICBAY3JlYXRlVmlldy5zaG93VUkoKVxuXG4gICAgICBAdmlzdWFsaXplclZpZXcuc2NhbGVEb3duKClcblxuXG4gICMgSGFuZGxlciBmb3IgUHViU3ViIEVYUE9SVF9UUkFDSyBldmVudHMuICBQcmVwYXJlcyB0aGUgZGF0YSBpbiBhIHdheSB0aGF0XG4gICMgaXMgc2F2YWJsZSwgZXhwb3J0YWJsZSwgYW5kIGltcG9ydGFibGVcbiAgIyBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuXG4gIGV4cG9ydFRyYWNrQW5kU2F2ZVRvUGFyc2U6ID0+XG4gICAgcGF0dGVyblNxdWFyZUdyb3VwcyA9IFtdXG4gICAgcGF0dGVyblNxdWFyZXMgPSBbXVxuXG4gICAgaW5zdHJ1bWVudHMgPSBAYXBwTW9kZWwuZXhwb3J0KCkua2l0TW9kZWwuaW5zdHJ1bWVudHNcbiAgICBraXQgPSBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpLnRvSlNPTigpXG5cbiAgICAjIEl0ZXJhdGUgb3ZlciBlYWNoIGluc3RydW1lbnQgYW5kIGNsZWFuIHZhbHVlcyB0aGF0IGFyZSB1bm5lZWRlZFxuICAgIGluc3RydW1lbnRzID0gaW5zdHJ1bWVudHMubWFwIChpbnN0cnVtZW50KSA9PlxuICAgICAgaW5zdHJ1bWVudC5wYXR0ZXJuU3F1YXJlcy5mb3JFYWNoIChwYXR0ZXJuU3F1YXJlKSA9PlxuICAgICAgICBkZWxldGUgcGF0dGVyblNxdWFyZS5pbnN0cnVtZW50XG4gICAgICAgIHBhdHRlcm5TcXVhcmVzLnB1c2ggcGF0dGVyblNxdWFyZVxuXG4gICAgICBpbnN0cnVtZW50XG5cbiAgICAjIEJyZWFrIHRoZSBwYXR0ZXJuU3F1YXJlcyBpbnRvIGdyb3VwcyBvZiB0cmFja3NcbiAgICB3aGlsZSAocGF0dGVyblNxdWFyZXMubGVuZ3RoID4gMClcbiAgICAgIHBhdHRlcm5TcXVhcmVHcm91cHMucHVzaCBwYXR0ZXJuU3F1YXJlcy5zcGxpY2UoMCwgOClcblxuICAgICMgU3RvcmUgcmVzdWx0c1xuICAgIEBraXRUeXBlID0gQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKS5nZXQoJ2xhYmVsJylcbiAgICBAaW5zdHJ1bWVudHMgPSBpbnN0cnVtZW50c1xuICAgIEBwYXR0ZXJuU3F1YXJlR3JvdXBzID0gcGF0dGVyblNxdWFyZUdyb3Vwc1xuXG4gICAgIyBTYXZlIHRyYWNrXG4gICAgQHNhdmVUcmFjaygpXG5cblxuICAjIENyZWF0ZSBhIG5ldyBQYXJzZSBtb2RlbCBhbmQgcGFzcyBpbiBwYXJhbXMgdGhhdCBoYXZlIGJlZW5cbiAgIyByZXRyaWV2ZWQsIHZpYSBQdWJTdWIgZnJvbSB0aGUgQ3JlYXRlVmlld1xuXG4gIHNhdmVUcmFjazogPT5cbiAgICBAc2hhcmVkVHJhY2tNb2RlbC5zZXRcbiAgICAgIGJwbTogQGFwcE1vZGVsLmdldCAnYnBtJ1xuICAgICAgaW5zdHJ1bWVudHM6IEBpbnN0cnVtZW50c1xuICAgICAga2l0VHlwZTogQGtpdFR5cGVcbiAgICAgIHBhdHRlcm5TcXVhcmVHcm91cHM6IEBwYXR0ZXJuU3F1YXJlR3JvdXBzXG4gICAgICB2aXN1YWxpemF0aW9uOiBAYXBwTW9kZWwuZ2V0ICd2aXN1YWxpemF0aW9uJ1xuXG4gICAgIyBTZW5kIHRoZSBQYXJzZSBtb2RlbCB1cCB0aGUgd2lyZSBhbmQgc2F2ZSB0byBEQlxuICAgIEBzaGFyZWRUcmFja01vZGVsLnNhdmVcbiAgICAgIGVycm9yOiAob2JqZWN0LCBlcnJvcikgPT5cbiAgICAgICAgY29uc29sZS5sb2cgJ2Vycm9yIGhlcmUhJ1xuICAgICAgICBjb25zb2xlLmVycm9yIG9iamVjdCwgZXJyb3JcblxuICAgICAgICBpZiBAcGFyc2VFcnJvckF0dGVtcHRzIDwgM1xuICAgICAgICAgIEBwYXJzZUVycm9yQXR0ZW1wdHMrK1xuXG4gICAgICAgICAgQHNhdmVUcmFjaygpXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ3NoYXJlSWQnLCAnZXJyb3InXG5cbiAgICAgICMgSGFuZGxlciBmb3Igc3VjY2VzcyBldmVudHMuICBDcmVhdGUgYSBuZXdcbiAgICAgICMgdmlzdWFsIHN1Y2Nlc3MgbWVzc2FnZSBhbmQgcGFzcyB1c2VyIG9uIHRvXG4gICAgICAjIHRoZWlyIHBhZ2VcblxuICAgICAgc3VjY2VzczogKG1vZGVsKSA9PlxuICAgICAgICBjb25zb2xlLmxvZyBtb2RlbC5pZFxuICAgICAgICBAYXBwTW9kZWwuc2V0ICdzaGFyZUlkJywgbW9kZWwuaWRcblxuXG4gICMgRXZlbnQgaGFuZGxlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLVxuXG4gIG9uUmVzaXplOiAoZXZlbnQpID0+XG4gICAgaWYgQGlzTW9iaWxlIG9yIEBpc1RhYmxldFxuICAgICAgJGRldmljZU9yaWVudGF0aW9uID0gJCgnLmRldmljZS1vcmllbnRhdGlvbicpXG5cbiAgICAgICMgUmVzZXQgcG9zaXRpb25cbiAgICAgIFR3ZWVuTGl0ZS50byAkKCdib2R5JyksIDAsXG4gICAgICAgIHNjcm9sbFRvcDogMFxuICAgICAgICBzY3JvbGxMZWZ0OiAwXG5cbiAgICAgICMgVXNlciBpcyBpbiBQb3J0cmFpdFxuICAgICAgaWYgd2luZG93LmlubmVySGVpZ2h0ID4gd2luZG93LmlubmVyV2lkdGhcbiAgICAgICAgVHdlZW5MaXRlLnNldCAkKCcjd3JhcHBlcicpLCBhdXRvQWxwaGE6IDBcblxuICAgICAgICBUd2VlbkxpdGUuZnJvbVRvICRkZXZpY2VPcmllbnRhdGlvbiwgLjIsIGF1dG9BbHBoYTogMCxcbiAgICAgICAgICBhdXRvQWxwaGE6IDFcbiAgICAgICAgICBkZWxheTogMFxuXG4gICAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gJGRldmljZU9yaWVudGF0aW9uLmZpbmQoJ2ltZycpLCAuMywgc2NhbGU6IDAsXG4gICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICBhdXRvQWxwaGE6IDFcbiAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcbiAgICAgICAgICBkZWxheTogLjZcblxuICAgICAgICAkZGV2aWNlT3JpZW50YXRpb24uc2hvdygpXG5cbiAgICAgICMgVXNlciBpcyBpbiBsYW5kc2NhcGUgLS0gYWxsIGdvb2RcbiAgICAgIGVsc2VcbiAgICAgICAgVHdlZW5MaXRlLnRvICRkZXZpY2VPcmllbnRhdGlvbi5maW5kKCdpbWcnKSwgLjMsXG4gICAgICAgICAgc2NhbGU6IDBcbiAgICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VJblxuICAgICAgICAgIGRlbGF5OiAuM1xuXG4gICAgICAgIFR3ZWVuTGl0ZS50byAkZGV2aWNlT3JpZW50YXRpb24sIC4yLFxuICAgICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICAgIGRlbGF5OiAuNlxuXG4gICAgICAgICAgb25Db21wbGV0ZTogPT5cblxuICAgICAgICAgICAgIyBGYWRlIHRoZSBpbnRlcmZhY2UgYmFjayBpblxuICAgICAgICAgICAgVHdlZW5MaXRlLnRvICQoJyN3cmFwcGVyJyksIC40LCBhdXRvQWxwaGE6IDEsIGRlbGF5OiAuM1xuICAgICAgICAgICAgJGRldmljZU9yaWVudGF0aW9uLmhpZGUoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBzb3VuZCBiZWF0cy4gIFBhc3MgaXQgb24gdG8gdGhlIHZpc3VhbGl6YXRpb24gbGF5ZXIgYW5kIHRyaWdnZXJcbiAgIyBhbmltYXRpb24uICBQYXNzZWQgZG93biBmcm9tIFBhdHRlcm5TcXVhcmVWaWV3XG4gICMgQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xuXG4gIG9uQmVhdDogKHBhcmFtcykgLT5cbiAgICBAdmlzdWFsaXplclZpZXcub25CZWF0IHBhcmFtc1xuXG5cbiAgIyBIYW5kbGVyIGZvciBwYWdlIHZpc2liaWxpdHkgY2hhbmdlcywgd2hlbiBvcGVuaW5nIG5ldyB0YWIgLyBtaW5pbWl6aW5nIHdpbmRvd1xuICAjIFBhdXNlcyB0aGUgYXVkaW8gYW5kIHdhaXRzIGZvciB0aGUgdXNlciB0byByZXR1cm5cbiAgIyBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAjIEBwYXJhbSB7U3RyaW5nfSBzdGF0ZSAtIGVpdGhlciAndmlzaWJsZScgb3IgJ2hpZGRlbidcblxuICBvblZpc2liaWxpdHlDaGFuZ2U6IChldmVudCwgc3RhdGUpID0+XG4gICAgaWYgc3RhdGUgaXMgJ3Zpc2libGUnXG4gICAgICBpZiBAYXBwTW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy5wbGF5aW5nIGlzIHRydWVcbiAgICAgICAgQGFwcE1vZGVsLnNldCAncGxheWluZycsIHRydWVcbiAgICBlbHNlXG4gICAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgZmFsc2VcblxuXG4gICMgSGFuZGxlciBmb3Igc2hvd2luZyAvIGhpZGluZyAvIGRpc3Bvc2luZyBvZiBwcmltYXJ5IHZpZXdzXG4gICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICBvblZpZXdDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICBwcmV2aW91c1ZpZXcgPSBtb2RlbC5fcHJldmlvdXNBdHRyaWJ1dGVzLnZpZXdcbiAgICBjdXJyZW50VmlldyA9IG1vZGVsLmNoYW5nZWQudmlld1xuXG4gICAgcHJldmlvdXNWaWV3Py5oaWRlXG4gICAgICByZW1vdmU6IHRydWVcblxuICAgICRjb250YWluZXIgPSBAJGVsXG5cbiAgICBpZiBjdXJyZW50VmlldyBpbnN0YW5jZW9mIENyZWF0ZVZpZXdcbiAgICAgIEByZW5kZXJWaXN1YWxpemF0aW9uTGF5ZXIoKVxuICAgICAgQHZpc3VhbGl6ZXJWaWV3Py5yZXNldFBvc2l0aW9uKClcblxuICAgICAgaWYgQGlzTW9iaWxlXG4gICAgICAgICRjb250YWluZXIgPSBAJG1haW5Db250YWluZXJcbiAgICAgIGVsc2VcbiAgICAgICAgJGNvbnRhaW5lciA9IEAkYm90dG9tQ29udGFpbmVyXG5cbiAgICBpZiBjdXJyZW50VmlldyBpbnN0YW5jZW9mIFNoYXJlVmlld1xuICAgICAgaWYgQGlzTW9iaWxlXG4gICAgICAgICQoJyNsb2dvJykucmVtb3ZlQ2xhc3MoJ2xvZ28nKS5hZGRDbGFzcygnbG9nby13aGl0ZScpXG4gICAgICAgIFR3ZWVuTGl0ZS50byAkKCcjd3JhcHBlcicpLCAuMyxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjRTQxRTJCJ1xuXG4gICAgICAjIE9ubHkgcmVuZGVyIHZpc3VhbGl6YXRpb24gb24gZGVza3RvcFxuICAgICAgZWxzZVxuICAgICAgICBAcmVuZGVyVmlzdWFsaXphdGlvbkxheWVyKClcblxuICAgICAgXy5kZWZlciA9PlxuICAgICAgICBAdmlzdWFsaXplclZpZXc/LnNldFNoYXJlVmlld1Bvc2l0aW9uKClcblxuICAgIGVsc2VcbiAgICAgIGlmIEBpc01vYmlsZVxuICAgICAgICAkKCcjbG9nbycpLnJlbW92ZUNsYXNzKCdsb2dvLXdoaXRlJykuYWRkQ2xhc3MoJ2xvZ28nKVxuICAgICAgICBUd2VlbkxpdGUudG8gJCgnI3dyYXBwZXInKSwgLjMsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnXG5cbiAgICAkY29udGFpbmVyLmFwcGVuZCBjdXJyZW50Vmlldy5yZW5kZXIoKS5lbFxuXG4gICAgdW5sZXNzIGN1cnJlbnRWaWV3IGluc3RhbmNlb2YgU2hhcmVWaWV3XG4gICAgICBjdXJyZW50Vmlldy5zaG93KClcblxuXG4gICMgSGFuZGxlciBmb3IgbW9iaWxlIGJyZWFrcG9pbnQgY2hhbmdlcy4gIFVwZGF0ZXMgdGhlIGRvbSB3aXRoXG4gICMgYW4gaW5kaWNhdG9yLlxuICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsPVxuXG4gIG9uSXNNb2JpbGVDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICBpc01vYmlsZSA9IG1vZGVsLmNoYW5nZWQuaXNNb2JpbGVcblxuICAgIGlmIGlzTW9iaWxlXG4gICAgICBAJGJvZHkucmVtb3ZlQ2xhc3MoJ2Rlc2t0b3AnKS5hZGRDbGFzcyAnbW9iaWxlJ1xuXG4gICAgZWxzZVxuICAgICAgQCRib2R5LnJlbW92ZUNsYXNzKCdtb2JpbGUnKS5hZGRDbGFzcyAnZGVza3RvcCdcblxuXG4gICMgSGFuZGxlciBmb3IgYnJlYWtwb2ludCBtYXRjaCBldmVudHMuICBVcGRhdGVzIG1vZGVsIGFuZCB0cmlnZ2Vyc1xuICAjIHJlbG9hZHMgb24gdGhlIHJlZ2lzdGVyZWQgdmlld3Mgd2hpY2ggYXJlIGxpc3RlbmluZ1xuICAjIEBwYXJhbSB7U3RyaW5nfSBicmVha3BvaW50IEVpdGhlciBgbW9iaWxlYCBvciBgZGVza3RvcGBcblxuICBvbkJyZWFrcG9pbnRNYXRjaDogKGJyZWFrcG9pbnQpIC0+XG4gICAgQGFwcE1vZGVsLnNldCAnaXNNb2JpbGUnLCAoIGlmIGJyZWFrcG9pbnQgaXMgJ21vYmlsZScgdGhlbiB0cnVlIGVsc2UgZmFsc2UgKVxuXG4gICAgXy5kZWxheSAtPlxuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgLCAxMDBcblxuXG4gICMgSGFuZGxlciBmb3Igb3BlbmluZyB0aGUgc2hhcmUgbW9kYWwuICBQYXNzZWQgZG93biBmcm9tIENyZWF0ZVZpZXdcblxuICBvbk9wZW5TaGFyZTogPT5cbiAgICBAZXhwYW5kVmlzdWFsaXphdGlvbigpXG5cblxuICAjIEhhbmRsZXIgZm9yIGNsb3NpbmcgdGhlIHNoYXJlIG1vZGFsLiAgUGFzc2VkIGRvd24gZnJvbSBDcmVhdGVWaWV3XG5cbiAgb25DbG9zZVNoYXJlOiA9PlxuICAgIEBjb250cmFjdFZpc3VhbGl6YXRpb24oKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBQdWJTdWIgU0FWRV9UUkFDSyBldmVudHMuICBFeHBvcnRzIHRoZSB0cmFjaywgY2FsbHMgYSBwdWJzdWIgdG8gdGhlXG4gICMgZXhwb3J0IGZ1bmN0aW9uLCB0aGVuIHByZXBhcmVzIGl0IGZvciBpbXBvcnRcbiAgIyBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuXG4gIG9uU2F2ZVRyYWNrOiAocGFyYW1zKSA9PlxuICAgIHtAc2hhcmVkVHJhY2tNb2RlbH0gPSBwYXJhbXNcblxuICAgIEBleHBvcnRUcmFja0FuZFNhdmVUb1BhcnNlKClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcENvbnRyb2xsZXJcbiIsIiMjIypcbiAgQXBwbGljYXRpb24td2lkZSBnZW5lcmFsICBjb25maWd1cmF0aW9uc1xuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE5LjE0XG4jIyNcblxuQXBwQ29uZmlnID1cblxuICAjIFRoZSBwYXRoIHRvIGFwcGxpY2F0aW9uIGFzc2V0c1xuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgQVNTRVRTOlxuICAgIHBhdGg6ICdhc3NldHMnXG4gICAgYXVkaW86ICdhdWRpbydcbiAgICBkYXRhOiAnZGF0YSdcbiAgICBpbWFnZXM6ICdpbWFnZXMnXG5cbiAgIyBUaGUgQlBNIHRlbXBvXG4gICMgQHR5cGUge051bWJlcn1cblxuICBCUE06IDEyMFxuXG4gICMgVGhlIG1heCBCUE1cbiAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gIEJQTV9NQVg6IDEwMDBcblxuICAjIEJyZWFrcG9pbnQgZGVmaW5pdGlvbiBmb3IgZW5xdWlyZVxuICAjIGFuZCBCcmVha3BvaW50TWFuYWdlciBjbGFzc1xuXG4gIEJSRUFLUE9JTlRTOlxuICAgIG1vYmlsZTpcbiAgICAgIG1pbjogbnVsbFxuICAgICAgbWF4OiA2MDBcblxuICAgIGRlc2t0b3A6XG4gICAgICBtaW46IDYwMVxuICAgICAgbWF4OiBudWxsXG5cbiAgIyBGb3IgZGVidWdnaW5nIHJlc3BvbnNpdmUgaXNzdWVzIG9uIGRlc2t0b3BcbiAgIyBAdHlwZSB7Qm9vbGVhbn1cblxuICBFTkFCTEVfUk9UQVRJT05fTE9DSzogdHJ1ZVxuXG4gICMgVGhlIG1heCB2YXJpZW50IG9uIGVhY2ggcGF0dGVybiBzcXVhcmUgKG9mZiwgbG93LCBtZWRpdW0sIGhpZ2gpXG4gICMgQHR5cGUge051bWJlcn1cblxuICBWRUxPQ0lUWV9NQVg6IDNcblxuICAjIFZvbHVtZSBsZXZlbHMgZm9yIHBhdHRlcm4gcGxheWJhY2sgYXMgd2VsbCBhcyBmb3Igb3ZlcmFsbCB0cmFja3NcbiAgIyBAdHlwZSB7T2JqZWN0fVxuXG4gIFZPTFVNRV9MRVZFTFM6XG4gICAgbG93OiAuMlxuICAgIG1lZGl1bTogLjVcbiAgICBoaWdoOiAxXG5cbiAgIyBSZXR1cm5zIGEgbm9ybWFsaXplZCBhc3NldCBwYXRoIGZvciBhcHBsaWNhdGlvbiBhc3NldHNcbiAgIyBAcGFyYW0ge1N0cmluZ30gYXNzZXRUeXBlXG5cbiAgcmV0dXJuQXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgIHBhdGggPSBAQVNTRVRTLnBhdGggKyAnLycgKyBAQVNTRVRTW2Fzc2V0VHlwZV1cbiAgICBwYXRoXG5cbiAgIyBSZXR1cm5zIGEgbm9ybWFsaXplZCBhc3NldCBwYXRoIGZvciB0aGUgVEVTVCBlbnZpcm9ubWVudFxuICAjIEBwYXJhbSB7U3RyaW5nfSBhc3NldFR5cGVcblxuICByZXR1cm5UZXN0QXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgIHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBAQVNTRVRTLnBhdGggKyAnLycgKyBAQVNTRVRTW2Fzc2V0VHlwZV1cbiAgICBwYXRoXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwQ29uZmlnXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFtcbiAge1xuICAgIHRyYWNrOiB7XCJicG1cIjoyMDQsXCJpbnN0cnVtZW50c1wiOlt7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC0wLWtpY2sxXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC0zXCIsXCJsYWJlbFwiOlwiS2ljayBEcnVtIDFcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjJ9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0hpcEhvcEtpdF9LaWNrSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAta2ljazJcIixcImlkXCI6XCJpbnN0cnVtZW50LTRcIixcImxhYmVsXCI6XCJLaWNrIERydW0gMlwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0Nvb2xfUm5CX0tpY2tfSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtaGloYXQtY2xvc2VkXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC01XCIsXCJsYWJlbFwiOlwiQ2xvc2VkIEhpSGF0XCIsXCJtdXRlXCI6ZmFsc2UsXCJwYXR0ZXJuU3F1YXJlc1wiOlt7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6M31dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvQ29vbF9SbkJfSGktSGF0X0Nsb3NlZF9IYXJkLm1wM1wiLFwidm9sdW1lXCI6bnVsbH0se1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtMC1oaWhhdC1vcGVuXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC02XCIsXCJsYWJlbFwiOlwiT3BlbiBIaUhhdFwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvQ29vbF9SbkJfSGktSGF0X09wZW5fU29mdC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtc25hcmVcIixcImlkXCI6XCJpbnN0cnVtZW50LTdcIixcImxhYmVsXCI6XCJTbmFyZVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0hpcEhvcEtpdF9TbmFyZUhhcmQubXAzXCIsXCJ2b2x1bWVcIjpudWxsfSx7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC0wLXZvaWNlXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC04XCIsXCJsYWJlbFwiOlwiVm9pY2VcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sXCJzcmNcIjpcIi9hc3NldHMvYXVkaW8vaGlwLWhvcC8wMDIxX3Byb3BzX2Nhbl9zb2RhX29wZW4gXzAxLTEubXAzXCIsXCJ2b2x1bWVcIjpudWxsfV0sXCJraXRUeXBlXCI6XCJIaXAtaG9wXCIsXCJwYXR0ZXJuU3F1YXJlR3JvdXBzXCI6W1t7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoyfV0sW3tcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjozfV0sW3tcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9XV0sXCJzaGFyZU5hbWVcIjpcIktldmluIEJsZWljaFwiLFwic2hhcmVUaXRsZVwiOlwiRmlsdGh5IDFcIixcInNoYXJlTWVzc2FnZVwiOlwiWWVhaFwiLFwidmlzdWFsaXphdGlvblwiOm51bGwsXCJvYmplY3RJZFwiOlwiZHVhZUdwNHpseFwiLFwiY3JlYXRlZEF0XCI6XCIyMDE0LTA0LTA3VDE2OjI4OjQ4LjU2NlpcIixcInVwZGF0ZWRBdFwiOlwiMjAxNC0wNC0wN1QxNjoyODo0OC41NjZaXCJ9XG4gIH0sXG4gIHtcbiAgICB0cmFjazoge1wiYnBtXCI6MTIwLFwiaW5zdHJ1bWVudHNcIjpbe1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtY29rZS1ib3R0bGVcIixcImlkXCI6XCJpbnN0cnVtZW50LTQyXCIsXCJsYWJlbFwiOlwiQ293YmVsbFwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2Nva2UvMDNfX19jb2tlX2Nvd2JlbGwub2dnXCIsXCJ2b2x1bWVcIjpudWxsfSx7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC1jb2tlLXR3aXN0XCIsXCJpZFwiOlwiaW5zdHJ1bWVudC00M1wiLFwibGFiZWxcIjpcIlR3aXN0XCIsXCJtdXRlXCI6ZmFsc2UsXCJwYXR0ZXJuU3F1YXJlc1wiOlt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2Nva2UvMDA2MTQ0Mjg1LWJvdHRsZS1iZWVyLW9wZW4tMDEub2dnXCIsXCJ2b2x1bWVcIjpudWxsfSx7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC1jb2tlLWNhblwiLFwiaWRcIjpcImluc3RydW1lbnQtNDRcIixcImxhYmVsXCI6XCJDYW4gb3BlbmluZ1wiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9jb2tlLzAyX19fMDAyMV9wcm9wc19jYW5fYmVlcl9vcGVuIF8wMS5vZ2dcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LWNva2Utdm9pY2UzXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC00NVwiLFwibGFiZWxcIjpcIlZvaWNlIDNcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9jb2tlL2ZlbWFsZV9haGhoXzAzLm9nZ1wiLFwidm9sdW1lXCI6bnVsbH0se1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtY29rZS12b2ljZTJcIixcImlkXCI6XCJpbnN0cnVtZW50LTQ2XCIsXCJsYWJlbFwiOlwiVm9pY2UgMlwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfV0sXCJzcmNcIjpcIi9hc3NldHMvYXVkaW8vY29rZS8wNF9fX21hbGVfYWhoaF8wMS5vZ2dcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LWNva2Utdm9pY2UxXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC00N1wiLFwibGFiZWxcIjpcIlZvaWNlIDFcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfV0sXCJzcmNcIjpcIi9hc3NldHMvYXVkaW8vY29rZS8wNV9fX2ZlbWFsZV9haGhoXzAxLm9nZ1wiLFwidm9sdW1lXCI6bnVsbH1dLFwia2l0VHlwZVwiOlwiQ09LRVwiLFwicGF0dGVyblNxdWFyZUdyb3Vwc1wiOltbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX1dLFt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFt7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX1dXSxcInNoYXJlTmFtZVwiOlwiYXNkZlwiLFwic2hhcmVUaXRsZVwiOlwiYXNkZlwiLFwic2hhcmVNZXNzYWdlXCI6XCJORUVEIFNIQVJFIE1FU1NBR0VcIixcInZpc3VhbGl6YXRpb25cIjpudWxsLFwib2JqZWN0SWRcIjpcInFSMG5zeElSSVBcIixcImNyZWF0ZWRBdFwiOlwiMjAxNC0wNC0xNVQxNzoyMzowNy42NTVaXCIsXCJ1cGRhdGVkQXRcIjpcIjIwMTQtMDQtMTVUMTc6MjM6MDcuNjU1WlwifVxuICB9LFxuICB7XG4gICAgdHJhY2s6IHtcImJwbVwiOjI2MCxcImluc3RydW1lbnRzXCI6W3tcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAta2ljazFcIixcImlkXCI6XCJpbnN0cnVtZW50LTNcIixcImxhYmVsXCI6XCJLaWNrIERydW0gMVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0hpcEhvcEtpdF9LaWNrSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAta2ljazJcIixcImlkXCI6XCJpbnN0cnVtZW50LTRcIixcImxhYmVsXCI6XCJLaWNrIERydW0gMlwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sXCJzcmNcIjpcIi9hc3NldHMvYXVkaW8vaGlwLWhvcC9Db29sX1JuQl9LaWNrX0hhcmQubXAzXCIsXCJ2b2x1bWVcIjpudWxsfSx7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC0wLWhpaGF0LWNsb3NlZFwiLFwiaWRcIjpcImluc3RydW1lbnQtNVwiLFwibGFiZWxcIjpcIkNsb3NlZCBIaUhhdFwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0Nvb2xfUm5CX0hpLUhhdF9DbG9zZWRfSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtaGloYXQtb3BlblwiLFwiaWRcIjpcImluc3RydW1lbnQtNlwiLFwibGFiZWxcIjpcIk9wZW4gSGlIYXRcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M31dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvQ29vbF9SbkJfSGktSGF0X09wZW5fU29mdC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtc25hcmVcIixcImlkXCI6XCJpbnN0cnVtZW50LTdcIixcImxhYmVsXCI6XCJTbmFyZVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0hpcEhvcEtpdF9TbmFyZUhhcmQubXAzXCIsXCJ2b2x1bWVcIjpudWxsfSx7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC0wLXZvaWNlXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC04XCIsXCJsYWJlbFwiOlwiVm9pY2VcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wLzAwMjFfcHJvcHNfY2FuX3NvZGFfb3BlbiBfMDEtMS5tcDNcIixcInZvbHVtZVwiOm51bGx9XSxcImtpdFR5cGVcIjpcIkhpcC1ob3BcIixcInBhdHRlcm5TcXVhcmVHcm91cHNcIjpbW3tcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFt7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dXSxcInNoYXJlTmFtZVwiOlwiTWF0dFwiLFwic2hhcmVUaXRsZVwiOlwiSGVseiBZZXNcIixcInNoYXJlTWVzc2FnZVwiOlwiSG9wZSB5b3UgbGlrZSBpdC5cIixcInZpc3VhbGl6YXRpb25cIjpudWxsLFwib2JqZWN0SWRcIjpcImZ4RFA4TUxxa0dcIixcImNyZWF0ZWRBdFwiOlwiMjAxNC0wNC0wM1QyMjo1NzoyOS42MDZaXCIsXCJ1cGRhdGVkQXRcIjpcIjIwMTQtMDQtMDNUMjI6NTc6MjkuNjA2WlwifVxuICB9LFxuICB7XG4gICAgdHJhY2s6IHtcImJwbVwiOjI1MCxcImluc3RydW1lbnRzXCI6W3tcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAta2ljazFcIixcImlkXCI6XCJpbnN0cnVtZW50LTNcIixcImxhYmVsXCI6XCJLaWNrIERydW0gMVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvSGlwSG9wS2l0X0tpY2tIYXJkLm1wM1wiLFwidm9sdW1lXCI6bnVsbH0se1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtMC1raWNrMlwiLFwiaWRcIjpcImluc3RydW1lbnQtNFwiLFwibGFiZWxcIjpcIktpY2sgRHJ1bSAyXCIsXCJtdXRlXCI6ZmFsc2UsXCJwYXR0ZXJuU3F1YXJlc1wiOlt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvQ29vbF9SbkJfS2lja19IYXJkLm1wM1wiLFwidm9sdW1lXCI6bnVsbH0se1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtMC1oaWhhdC1jbG9zZWRcIixcImlkXCI6XCJpbnN0cnVtZW50LTVcIixcImxhYmVsXCI6XCJDbG9zZWQgSGlIYXRcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0Nvb2xfUm5CX0hpLUhhdF9DbG9zZWRfSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtaGloYXQtb3BlblwiLFwiaWRcIjpcImluc3RydW1lbnQtNlwiLFwibGFiZWxcIjpcIk9wZW4gSGlIYXRcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvQ29vbF9SbkJfSGktSGF0X09wZW5fU29mdC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtc25hcmVcIixcImlkXCI6XCJpbnN0cnVtZW50LTdcIixcImxhYmVsXCI6XCJTbmFyZVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvSGlwSG9wS2l0X1NuYXJlSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtdm9pY2VcIixcImlkXCI6XCJpbnN0cnVtZW50LThcIixcImxhYmVsXCI6XCJWb2ljZVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sXCJzcmNcIjpcIi9hc3NldHMvYXVkaW8vaGlwLWhvcC8wMDIxX3Byb3BzX2Nhbl9zb2RhX29wZW4gXzAxLTEubXAzXCIsXCJ2b2x1bWVcIjpudWxsfV0sXCJraXRUeXBlXCI6XCJIaXAtaG9wXCIsXCJwYXR0ZXJuU3F1YXJlR3JvdXBzXCI6W1t7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV1dLFwic2hhcmVOYW1lXCI6XCJIeXBzdGVyaWFcIixcInNoYXJlVGl0bGVcIjpcIllvdSB3aXNoIFwiLFwic2hhcmVNZXNzYWdlXCI6XCJ5b3Ugd2lzaCB5b3UgbWFkZSBpdFwiLFwidmlzdWFsaXphdGlvblwiOm51bGwsXCJvYmplY3RJZFwiOlwibmhHRFVhUTlyaVwiLFwiY3JlYXRlZEF0XCI6XCIyMDE0LTA0LTA1VDIxOjExOjQ3Ljc3NlpcIixcInVwZGF0ZWRBdFwiOlwiMjAxNC0wNC0wNVQyMToxMTo0Ny43NzZaXCJ9XG4gIH0sXG4gIHtcbiAgICB0cmFjazoge1wiYnBtXCI6MjUwLFwiaW5zdHJ1bWVudHNcIjpbe1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtMC1raWNrMVwiLFwiaWRcIjpcImluc3RydW1lbnQtM1wiLFwibGFiZWxcIjpcIktpY2sgRHJ1bSAxXCIsXCJtdXRlXCI6ZmFsc2UsXCJwYXR0ZXJuU3F1YXJlc1wiOlt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvSGlwSG9wS2l0X0tpY2tIYXJkLm1wM1wiLFwidm9sdW1lXCI6bnVsbH0se1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtMC1raWNrMlwiLFwiaWRcIjpcImluc3RydW1lbnQtNFwiLFwibGFiZWxcIjpcIktpY2sgRHJ1bSAyXCIsXCJtdXRlXCI6ZmFsc2UsXCJwYXR0ZXJuU3F1YXJlc1wiOlt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0Nvb2xfUm5CX0tpY2tfSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtaGloYXQtY2xvc2VkXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC01XCIsXCJsYWJlbFwiOlwiQ2xvc2VkIEhpSGF0XCIsXCJtdXRlXCI6ZmFsc2UsXCJwYXR0ZXJuU3F1YXJlc1wiOlt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0Nvb2xfUm5CX0hpLUhhdF9DbG9zZWRfSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtaGloYXQtb3BlblwiLFwiaWRcIjpcImluc3RydW1lbnQtNlwiLFwibGFiZWxcIjpcIk9wZW4gSGlIYXRcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjJ9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0Nvb2xfUm5CX0hpLUhhdF9PcGVuX1NvZnQubXAzXCIsXCJ2b2x1bWVcIjpudWxsfSx7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC0wLXNuYXJlXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC03XCIsXCJsYWJlbFwiOlwiU25hcmVcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvSGlwSG9wS2l0X1NuYXJlSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtdm9pY2VcIixcImlkXCI6XCJpbnN0cnVtZW50LThcIixcImxhYmVsXCI6XCJWb2ljZVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfV0sXCJzcmNcIjpcIi9hc3NldHMvYXVkaW8vaGlwLWhvcC8wMDIxX3Byb3BzX2Nhbl9zb2RhX29wZW4gXzAxLTEubXAzXCIsXCJ2b2x1bWVcIjpudWxsfV0sXCJraXRUeXBlXCI6XCJIaXAtaG9wXCIsXCJwYXR0ZXJuU3F1YXJlR3JvdXBzXCI6W1t7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjJ9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX1dXSxcInNoYXJlTmFtZVwiOlwiQ291cnRuZXlcIixcInNoYXJlVGl0bGVcIjpcIlNvIFNvIEZyZXNoXCIsXCJzaGFyZU1lc3NhZ2VcIjpcIkF3ZXNvbWUgd29yayBDaHJpcyAmIFdlcyFcIixcInZpc3VhbGl6YXRpb25cIjpudWxsLFwib2JqZWN0SWRcIjpcImh5Q0Rlb1pEb3hcIixcImNyZWF0ZWRBdFwiOlwiMjAxNC0wNC0wNFQwMDoxMzozNC41NjFaXCIsXCJ1cGRhdGVkQXRcIjpcIjIwMTQtMDQtMDRUMDA6MTM6MzQuNTYxWlwifVxuICB9XG5dIiwiIyMjKlxuICogQXBwbGljYXRpb24gcmVsYXRlZCBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCA9XG5cbiAgQlJFQUtQT0lOVF9NQVRDSCAgICAgIDogJ2JyZWFrcG9pbnQ6bWF0Y2gnXG4gIEJSRUFLUE9JTlRfVU5NQVRDSCAgICA6ICdicmVha3BvaW50OnVubWF0Y2gnXG5cbiAgQ0hBTkdFX0FDVElWRSAgICAgICAgIDogJ2NoYW5nZTphY3RpdmUnXG4gIENIQU5HRV9CUE0gICAgICAgICAgICA6ICdjaGFuZ2U6YnBtJ1xuICBDSEFOR0VfRFJBR0dJTkcgICAgICAgOiAnY2hhbmdlOmRyYWdnaW5nJ1xuICBDSEFOR0VfRFJPUFBFRCAgICAgICAgOiAnY2hhbmdlOmRyb3BwZWQnXG4gIENIQU5HRV9GT0NVUyAgICAgICAgICA6ICdjaGFuZ2U6Zm9jdXMnXG4gIENIQU5HRV9JTlNUUlVNRU5UICAgICA6ICdjaGFuZ2U6Y3VycmVudEluc3RydW1lbnQnXG4gIENIQU5HRV9JU01PQklMRSAgICAgICA6ICdjaGFuZ2U6aXNNb2JpbGUnXG4gIENIQU5HRV9LSVQgICAgICAgICAgICA6ICdjaGFuZ2U6a2l0TW9kZWwnXG4gIENIQU5HRV9NVVRFICAgICAgICAgICA6ICdjaGFuZ2U6bXV0ZSdcbiAgQ0hBTkdFX1BMQVlJTkcgICAgICAgIDogJ2NoYW5nZTpwbGF5aW5nJ1xuICBDSEFOR0VfU0hBUkVfSUQgICAgICAgOiAnY2hhbmdlOnNoYXJlSWQnXG4gIENIQU5HRV9TSE9XX1NFUVVFTkNFUiA6ICdjaGFuZ2U6c2hvd1NlcXVlbmNlcidcbiAgQ0hBTkdFX1NIT1dfUEFEICAgICAgIDogJ2NoYW5nZTpzaG93UGFkJ1xuICBDSEFOR0VfVFJJR0dFUiAgICAgICAgOiAnY2hhbmdlOnRyaWdnZXInXG4gIENIQU5HRV9WRUxPQ0lUWSAgICAgICA6ICdjaGFuZ2U6dmVsb2NpdHknXG4gIENIQU5HRV9WSUVXICAgICAgICAgICA6ICdjaGFuZ2U6dmlldydcblxuICBTQVZFX1RSQUNLICAgICAgICAgICAgOiAnb25TYXZlVHJhY2snXG5cbiAgT1BFTl9TSEFSRSAgICAgICAgICAgIDogJ29uT3BlblNoYXJlJ1xuICBDTE9TRV9TSEFSRSAgICAgICAgICAgOiAnb25DbG9zZVNoYXJlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcEV2ZW50XG4iLCIjIyMqXG4gKiBHbG9iYWwgUHViU3ViIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblB1YlN1YiA9XG5cbiAgQkVBVCAgICAgICAgIDogJ29uQmVhdCdcbiAgRVhQT1JUX1RSQUNLIDogJ29uRXhwb3J0VHJhY2snXG4gIElNUE9SVF9UUkFDSyA6ICdvbkltcG9ydFRyYWNrJ1xuICBST1VURSAgICAgICAgOiAnb25Sb3V0ZUNoYW5nZSdcbiAgU0FWRV9UUkFDSyAgIDogJ29uU2F2ZVRyYWNrJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFB1YlN1YlxuIiwiXG52YXIgZGlnaXRzID0gcmVxdWlyZSgnZGlnaXRzJyk7XG52YXIgaGFuZGxlYmFycyA9IHJlcXVpcmUoJ2hhbmRsZWlmeScpXG5cbmhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3JlcGVhdCcsIGZ1bmN0aW9uKG4sIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgX2RhdGEgPSB7fTtcbiAgICBpZiAob3B0aW9ucy5fZGF0YSkge1xuICAgICAgX2RhdGEgPSBoYW5kbGViYXJzLmNyZWF0ZUZyYW1lKG9wdGlvbnMuX2RhdGEpO1xuICAgIH1cblxuICAgIHZhciBjb250ZW50ID0gJyc7XG4gICAgdmFyIGNvdW50ID0gbiAtIDE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gY291bnQ7IGkrKykge1xuICAgICAgX2RhdGEgPSB7XG4gICAgICAgIGluZGV4OiBkaWdpdHMucGFkKChpICsgMSksIHthdXRvOiBufSlcbiAgICAgIH07XG4gICAgICBjb250ZW50ICs9IG9wdGlvbnMuZm4odGhpcywge2RhdGE6IF9kYXRhfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgaGFuZGxlYmFycy5TYWZlU3RyaW5nKGNvbnRlbnQpO1xuICB9KTsiLCIjIyMqXG4gKiBQcmltYXJ5IGFwcGxpY2F0aW9uIG1vZGVsIHdoaWNoIGNvb3JkaW5hdGVzIHN0YXRlXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5Nb2RlbCAgICAgPSByZXF1aXJlICcuLi9zdXBlcnMvTW9kZWwuY29mZmVlJ1xuXG5jbGFzcyBBcHBNb2RlbCBleHRlbmRzIE1vZGVsXG5cbiAgZGVmYXVsdHM6XG4gICAgJ2JwbSc6IEFwcENvbmZpZy5CUE1cbiAgICAnbXV0ZSc6IG51bGxcbiAgICAna2l0TW9kZWwnOiBudWxsXG4gICAgJ3BsYXlpbmcnOiBudWxsXG4gICAgJ3BhZ2VGb2N1cyc6IHRydWVcbiAgICAnc2hhcmVJZCc6IG51bGxcbiAgICAnc2hhcmVkVHJhY2tNb2RlbCc6IG51bGxcblxuICAgICMgU2V0IHRvIHRydWUgdG8gc2hvdyBzZXF1ZW5jZXIgdmlldywgZmFsc2UgdG8gc2hvdyBwYWRcbiAgICAnc2hvd1NlcXVlbmNlcic6IG51bGxcblxuICAgICd2aWV3JzogbnVsbFxuICAgICd2aXN1YWxpemF0aW9uJzogbnVsbFxuXG5cbiAgZXhwb3J0OiAtPlxuICAgIGpzb24gPSBAdG9KU09OKClcblxuICAgIGpzb24ua2l0TW9kZWwgPSBqc29uLmtpdE1vZGVsLnRvSlNPTigpXG4gICAganNvbi5raXRNb2RlbC5pbnN0cnVtZW50cyA9IGpzb24ua2l0TW9kZWwuaW5zdHJ1bWVudHMudG9KU09OKClcbiAgICBqc29uLmtpdE1vZGVsLmluc3RydW1lbnRzID0gXy5tYXAganNvbi5raXRNb2RlbC5pbnN0cnVtZW50cywgKGluc3RydW1lbnQpIC0+XG4gICAgICBpbnN0cnVtZW50LnBhdHRlcm5TcXVhcmVzID0gaW5zdHJ1bWVudC5wYXR0ZXJuU3F1YXJlcy50b0pTT04oKVxuICAgICAgcmV0dXJuIGluc3RydW1lbnRcbiAgICByZXR1cm4ganNvblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcE1vZGVsXG4iLCIjIyMqXG4gKiBIYW5kbGVzIHNoYXJpbmcgc29uZ3MgYmV0d2VlbiB0aGUgYXBwIGFuZCBQYXJzZSwgYXMgd2VsbCBhcyBvdGhlciBzZXJ2aWNlc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNS4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuTW9kZWwgICAgID0gcmVxdWlyZSAnLi4vc3VwZXJzL01vZGVsLmNvZmZlZSdcblxuY2xhc3MgU2hhcmVkVHJhY2tNb2RlbCBleHRlbmRzIFBhcnNlLk9iamVjdFxuXG4gIGNsYXNzTmFtZTogJ1NoYXJlZFRyYWNrJ1xuXG4gIGRlZmF1bHRzOlxuXG4gICAgIyBLaXQgcGxheWJhY2sgcHJvcGVydGllc1xuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICMgQHR5cGUge051bWJlcn1cbiAgICBicG06IG51bGxcblxuICAgICMgQHR5cGUge09iamVjdH1cbiAgICBpbnN0cnVtZW50czogbnVsbFxuXG4gICAgIyBAdHlwZSB7U3RyaW5nfVxuICAgIGtpdFR5cGU6IG51bGxcblxuICAgICMgQHR5cGUge0FycmF5fVxuICAgIHBhdHRlcm5TcXVhcmVHcm91cHM6IG51bGxcblxuICAgICMgU2hhcmUgZGF0YSByZWxhdGVkIHRvIHVzZXJcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgc2hhcmVOYW1lOiBudWxsXG5cbiAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgc2hhcmVUaXRsZTogbnVsbFxuXG4gICAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgc2hhcmVNZXNzYWdlOiBudWxsXG5cbiAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAgdmlzdWFsaXphdGlvbjogbnVsbFxuXG5cbm1vZHVsZS5leHBvcnRzID0gU2hhcmVkVHJhY2tNb2RlbFxuIiwiIyMjKlxuICogQ29sbGVjdGlvbiBvZiBzb3VuZCBraXRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Db2xsZWN0aW9uLmNvZmZlZSdcbkFwcENvbmZpZyAgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdE1vZGVsICAgPSByZXF1aXJlICcuL0tpdE1vZGVsLmNvZmZlZSdcblxuXG5jbGFzcyBLaXRDb2xsZWN0aW9uIGV4dGVuZHMgQ29sbGVjdGlvblxuXG4gICMgVXJsIHRvIGRhdGEgZm9yIGZldGNoXG4gICMgQHR5cGUge1N0cmluZ31cblxuICB1cmw6IFwiI3tBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJyl9L3NvdW5kLWRhdGEuanNvblwiXG5cbiAgIyBJbmRpdmlkdWFsIGRydW1raXQgYXVkaW8gc2V0c1xuICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICBtb2RlbDogS2l0TW9kZWxcblxuICAjIFRoZSBjdXJyZW50IHVzZXItc2VsZWN0ZWQga2l0XG4gICMgQHR5cGUge051bWJlcn1cblxuICBraXRJZDogMFxuXG5cbiAgIyBQYXJzZXMgdGhlIGNvbGxlY3Rpb24gdG8gYXNzaWduIHBhdGhzIHRvIGVhY2ggaW5kaXZpZHVhbCBzb3VuZFxuICAjIGJhc2VkIHVwb24gY29uZmlndXJhdGlvbiBkYXRhXG4gICMgQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG5cbiAgcGFyc2U6IChyZXNwb25zZSkgLT5cbiAgICBhc3NldFBhdGggPSByZXNwb25zZS5jb25maWcuYXNzZXRQYXRoXG4gICAga2l0cyA9IHJlc3BvbnNlLmtpdHNcblxuICAgIGtpdHMgPSBfLm1hcCBraXRzLCAoa2l0KSAtPlxuICAgICAga2l0LnBhdGggPSBhc3NldFBhdGggKyAnLycgKyBraXQuZm9sZGVyXG4gICAgICByZXR1cm4ga2l0XG5cbiAgICByZXR1cm4ga2l0c1xuXG5cbiAgIyBJdGVyYXRlcyB0aHJvdWdoIHRoZSBjb2xsZWN0aW9uIGFuZCByZXR1cm5zIGEgc3BlY2lmaWMgaW5zdHJ1bWVudFxuICAjIGJ5IG1hdGNoaW5nIGFzc29jaWF0ZWQgaWRcbiAgIyBAcGFyYW0ge051bWJlcn0gaWRcblxuICBmaW5kSW5zdHJ1bWVudE1vZGVsOiAoaWQpIC0+XG4gICAgaW5zdHJ1bWVudE1vZGVsID0gbnVsbFxuXG4gICAgQGVhY2ggKGtpdE1vZGVsKSA9PlxuICAgICAga2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgICBpZiBpZCBpcyBtb2RlbC5nZXQoJ2lkJylcbiAgICAgICAgICBpbnN0cnVtZW50TW9kZWwgPSBtb2RlbFxuXG4gICAgaWYgaW5zdHJ1bWVudE1vZGVsIGlzIG51bGxcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgaW5zdHJ1bWVudE1vZGVsXG5cblxuICAjIEN5Y2xlcyB0aGUgY3VycmVudCBkcnVtIGtpdCBiYWNrXG4gICMgQHJldHVybiB7S2l0TW9kZWx9XG5cbiAgcHJldmlvdXNLaXQ6IC0+XG4gICAgbGVuID0gQGxlbmd0aFxuXG4gICAgaWYgQGtpdElkID4gMFxuICAgICAgQGtpdElkLS1cblxuICAgIGVsc2VcbiAgICAgIEBraXRJZCA9IGxlbiAtIDFcblxuICAgIGtpdE1vZGVsID0gQGF0IEBraXRJZFxuXG5cbiAgIyBDeWNsZXMgdGhlIGN1cnJlbnQgZHJ1bSBraXQgZm9yd2FyZFxuICAjIEByZXR1cm4ge0tpdE1vZGVsfVxuXG4gIG5leHRLaXQ6IC0+XG4gICAgbGVuID0gQGxlbmd0aCAtIDFcblxuICAgIGlmIEBraXRJZCA8IGxlblxuICAgICAgQGtpdElkKytcblxuICAgIGVsc2VcbiAgICAgIEBraXRJZCA9IDBcblxuICAgIGtpdE1vZGVsID0gQGF0IEBraXRJZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEtpdENvbGxlY3Rpb25cbiIsIiMjIypcbiAqIEtpdCBtb2RlbCBmb3IgaGFuZGxpbmcgc3RhdGUgcmVsYXRlZCB0byBraXQgc2VsZWN0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuTW9kZWwgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvTW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlJ1xuXG5jbGFzcyBLaXRNb2RlbCBleHRlbmRzIE1vZGVsXG5cbiAgZGVmYXVsdHM6XG4gICAgJ2xhYmVsJzogbnVsbFxuICAgICdwYXRoJzogbnVsbFxuICAgICdmb2xkZXInOiBudWxsXG5cbiAgICAjIEB0eXBlIHtJbnN0cnVtZW50Q29sbGVjdGlvbn1cbiAgICAnaW5zdHJ1bWVudHMnOiBudWxsXG5cbiAgICAjIEB0eXBlIHtJbnN0cnVtZW50TW9kZWx9XG4gICAgJ2N1cnJlbnRJbnN0cnVtZW50JzogbnVsbFxuXG5cbiAgIyBGb3JtYXQgdGhlIHJlc3BvbnNlIHNvIHRoYXQgaW5zdHJ1bWVudHMgZ2V0cyBwcm9jZXNzZWRcbiAgIyBieSBiYWNrYm9uZSB2aWEgdGhlIEluc3RydW1lbnRDb2xsZWN0aW9uLiAgQWRkaXRpb25hbGx5LFxuICAjIHBhc3MgaW4gdGhlIHBhdGggc28gdGhhdCBhYnNvbHV0ZSBVUkwncyBjYW4gYmUgdXNlZFxuICAjIHRvIHJlZmVyZW5jZSBzb3VuZCBkYXRhXG4gICMgQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG5cbiAgcGFyc2U6IChyZXNwb25zZSkgLT5cbiAgICBfLmVhY2ggcmVzcG9uc2UuaW5zdHJ1bWVudHMsIChpbnN0cnVtZW50LCBpbmRleCkgLT5cbiAgICAgIGluc3RydW1lbnQuaWQgPSBfLnVuaXF1ZUlkICdpbnN0cnVtZW50LSdcbiAgICAgIGluc3RydW1lbnQuc3JjID0gcmVzcG9uc2UucGF0aCArICcvJyArIGluc3RydW1lbnQuc3JjXG5cbiAgICByZXNwb25zZS5pbnN0cnVtZW50cyA9IG5ldyBJbnN0cnVtZW50Q29sbGVjdGlvbiByZXNwb25zZS5pbnN0cnVtZW50c1xuICAgIHJlc3BvbnNlXG5cbm1vZHVsZS5leHBvcnRzID0gS2l0TW9kZWxcbiIsIiMjIypcbiAqIENvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBQYWRTcXVhcmVNb2RlbHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICcuLi9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcbkNvbGxlY3Rpb24gICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Db2xsZWN0aW9uLmNvZmZlZSdcblxuY2xhc3MgUGFkU3F1YXJlQ29sbGVjdGlvbiBleHRlbmRzIENvbGxlY3Rpb25cbiAgIG1vZGVsOiBJbnN0cnVtZW50TW9kZWxcblxubW9kdWxlLmV4cG9ydHMgPSBQYWRTcXVhcmVDb2xsZWN0aW9uXG4iLCIjIyMqXG4gKiBNb2RlbCBmb3IgaW5kaXZpZHVhbCBwYWQgc3F1YXJlcy5cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjQuMTRcbiMjI1xuXG5Nb2RlbCA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Nb2RlbC5jb2ZmZWUnXG5cbmNsYXNzIFBhZFNxdWFyZU1vZGVsIGV4dGVuZHMgTW9kZWxcblxuICBkZWZhdWx0czpcbiAgICAnZHJhZ2dpbmcnOiBmYWxzZVxuICAgICdrZXljb2RlJzogbnVsbFxuICAgICd0cmlnZ2VyJzogZmFsc2VcblxuICAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cbiAgICAnY3VycmVudEluc3RydW1lbnQnOiBudWxsXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuICAgIEBzZXQgJ2lkJywgXy51bmlxdWVJZCAncGFkLXNxdWFyZS0nXG5cbm1vZHVsZS5leHBvcnRzID0gUGFkU3F1YXJlTW9kZWxcbiIsIiMjIypcbiAqIENvbGxlY3Rpb24gcmVwcmVzZW50aW5nIGVhY2ggc291bmQgZnJvbSBhIGtpdCBzZXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICcuL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5Db2xsZWN0aW9uICAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvQ29sbGVjdGlvbi5jb2ZmZWUnXG5cbmNsYXNzIEluc3RydW1lbnRDb2xsZWN0aW9uIGV4dGVuZHMgQ29sbGVjdGlvblxuXG4gICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cbiAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG4gICMgRXhwb3J0cyB0aGUgcGF0dGVybiBzcXVhcmVzIGNvbGxlY3Rpb24gZm9yIHVzZVxuICAjIHdpdGggdHJhbnNmZXJyaW5nIHByb3BzIGFjcm9zcyBkaWZmZXJlbnQgZHJ1bSBraXRzXG5cbiAgZXhwb3J0UGF0dGVyblNxdWFyZXM6IC0+XG4gICAgcmV0dXJuIEBtYXAgKGluc3RydW1lbnQpID0+XG4gICAgICBpbnN0cnVtZW50LmdldCgncGF0dGVyblNxdWFyZXMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRDb2xsZWN0aW9uXG4iLCIjIyMqXG4gKiBTb3VuZCBtb2RlbCBmb3IgZWFjaCBpbmRpdmlkdWFsIGtpdCBzb3VuZCBzZXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbk1vZGVsICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Nb2RlbC5jb2ZmZWUnXG5cbmNsYXNzIEluc3RydW1lbnRNb2RlbCBleHRlbmRzIE1vZGVsXG5cbiAgZGVmYXVsdHM6XG5cbiAgICAjIElmIGFjdGl2ZSwgc291bmQgY2FuIHBsYXlcbiAgICAjIEB0eXBlIHtCb29sZWFufVxuXG4gICAgJ2FjdGl2ZSc6IG51bGxcblxuXG4gICAgIyBGbGFnIHRvIGNoZWNrIGlmIGluc3RydW1lbnQgaGFzIGJlZW4gZHJvcHBlZCBvbnRvIHBhZCBzcXVhcmVcbiAgICAjIEB0eXBlIHtCb29sZWFufVxuXG4gICAgJ2Ryb3BwZWQnOiBmYWxzZVxuXG5cbiAgICAjIENhY2hlIG9mIHRoZSBvcmlnaW5hbCBtb3VzZSBkcmFnIGV2ZW50IGluIG9yZGVyIHRvIHVwZGF0ZSB0aGVcbiAgICAjIGRyYWcgcG9zaXRpb24gd2hlbiBkaXNsb2RnaW5nIGluIGluc3RydW1lbnQgZnJvbSB0aGUgUGFkU3F1YXJlXG4gICAgIyBAdHlwZSB7TW91c2VFdmVudH1cblxuICAgICdkcm9wcGVkRXZlbnQnOiBudWxsXG5cblxuICAgICMgRmxhZyB0byBjaGVjayBpZiBhdWRpbyBmb2N1cyBpcyBzZXQgb24gYSBwYXJ0aWN1bGFyIGluc3RydW1lbnQuXG4gICAgIyBJZiBzbywgaXQgbXV0ZXMgYWxsIG90aGVyIHRyYWNrcy5cbiAgICAjIEB0eXBlIHtCb29sZWFufVxuXG4gICAgJ2ZvY3VzJzogZmFsc2VcblxuXG4gICAgIyBUaGUgaWNvbiBjbGFzcyB0aGF0IHJlcHJlc2VudHMgdGhlIGluc3RydW1lbnRcbiAgICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgICAnaWNvbic6IG51bGxcblxuXG4gICAgIyBUaGUgdGV4dCBsYWJlbCBkZXNjcmliaW5nIHRoZSBpbnN0cnVtZW50XG4gICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICAgJ2xhYmVsJzogbnVsbFxuXG5cbiAgICAjIE11dGUgb3IgdW5tdXRlIHNldHRpbmdcbiAgICAjIEB0eXBlIHtCb29sZWFufVxuXG4gICAgJ211dGUnOiBmYWxzZVxuXG5cbiAgICAjIFRoZSBwYXRoIHRvIHRoZSBzb3VuZCBzb3VyY2VcbiAgICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgICAnc3JjJzogbnVsbFxuXG5cbiAgICAjIFRoZSB2b2x1bWVcbiAgICAjIEB0eXBlIHtOdW1iZXJ9XG4gICAgJ3ZvbHVtZSc6IG51bGxcblxuXG4gICAgIyBDb2xsZWN0aW9uIG9mIGFzc29jaWF0ZWQgcGF0dGVybiBzcXVhcmVzIChhIHRyYWNrKSBmb3IgdGhlXG4gICAgIyBTZXF1ZW5jZXIgdmlldy4gIFVwZGF0ZWQgd2hlbiB0aGUgdHJhY2tzIGFyZSBzd2FwcGVkIG91dFxuICAgICMgQHR5cGUge1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9ufVxuXG4gICAgJ3BhdHRlcm5TcXVhcmVzJzogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RydW1lbnRNb2RlbFxuIiwiIyMjKlxuICBBIGNvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXNcblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcENvbmZpZyAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcbkNvbGxlY3Rpb24gICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Db2xsZWN0aW9uLmNvZmZlZSdcbkluc3RydW1lbnRNb2RlbCAgICA9IHJlcXVpcmUgJy4uL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAnLi9QYXR0ZXJuU3F1YXJlTW9kZWwuY29mZmVlJ1xuUHViU3ViICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvUHViU3ViJ1xuXG5jbGFzcyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiBleHRlbmRzIENvbGxlY3Rpb25cblxuICBtb2RlbDogSW5zdHJ1bWVudE1vZGVsXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gIG9uSW1wb3J0VHJhY2s6IChwYXJhbXMpIC0+XG5cbiAgb25FeHBvcnRUcmFjazogKHBhcmFtcykgLT5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvblxuIiwiIyMjKlxuICBNb2RlbCBmb3IgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXMuICBQYXJ0IG9mIGxhcmdlciBQYXR0ZXJuIFRyYWNrIGNvbGxlY3Rpb25cblxuICBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbk1vZGVsICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Nb2RlbC5jb2ZmZWUnXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmVNb2RlbCBleHRlbmRzIE1vZGVsXG5cbiAgZGVmYXVsdHM6XG4gICAgJ2FjdGl2ZSc6IGZhbHNlXG4gICAgJ2luc3RydW1lbnQnOiBudWxsXG4gICAgJ3ByZXZpb3VzVmVsb2NpdHknOiAwXG4gICAgJ3RyaWdnZXInOiBudWxsXG4gICAgJ3ZlbG9jaXR5JzogMFxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEBvbiBBcHBFdmVudC5DSEFOR0VfVkVMT0NJVFksIEBvblZlbG9jaXR5Q2hhbmdlXG5cblxuICBjeWNsZTogLT5cbiAgICB2ZWxvY2l0eSA9IEBnZXQgJ3ZlbG9jaXR5J1xuXG4gICAgaWYgdmVsb2NpdHkgPCBBcHBDb25maWcuVkVMT0NJVFlfTUFYXG4gICAgICB2ZWxvY2l0eSsrXG5cbiAgICBlbHNlXG4gICAgICB2ZWxvY2l0eSA9IDBcblxuICAgIEBzZXQgJ3ZlbG9jaXR5JywgdmVsb2NpdHlcblxuXG4gIGVuYWJsZTogLT5cbiAgICBAc2V0ICd2ZWxvY2l0eScsIDFcblxuXG4gIGRpc2FibGU6IC0+XG4gICAgQHNldCAndmVsb2NpdHknLCAwXG5cblxuICBvblZlbG9jaXR5Q2hhbmdlOiAobW9kZWwpIC0+XG4gICAgQHNldCAncHJldmlvdXNWZWxvY2l0eScsIG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMudmVsb2NpdHlcblxuICAgIHZlbG9jaXR5ID0gbW9kZWwuY2hhbmdlZC52ZWxvY2l0eVxuXG4gICAgaWYgdmVsb2NpdHkgPiAwXG4gICAgICBAc2V0ICdhY3RpdmUnLCB0cnVlXG5cbiAgICBlbHNlIGlmIHZlbG9jaXR5IGlzIDBcbiAgICAgIEBzZXQgJ2FjdGl2ZScsIGZhbHNlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlTW9kZWxcbiIsIiMjIypcbiAqIE1QQyBBcHBsaWNhdGlvbiByb3V0ZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcblB1YlN1YiAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL1B1YlN1YidcblB1YkV2ZW50ICA9IHJlcXVpcmUgJy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5cbmNsYXNzIEFwcFJvdXRlciBleHRlbmRzIEJhY2tib25lLlJvdXRlclxuXG4gIHJvdXRlczpcbiAgICAnJyAgICAgICAgICAgICA6ICdsYW5kaW5nUm91dGUnXG4gICAgJ2xhbmRpbmcnICAgICAgOiAnbGFuZGluZ1JvdXRlJ1xuICAgICdjcmVhdGUnICAgICAgIDogJ2NyZWF0ZVJvdXRlJ1xuICAgICdzaGFyZScgICAgICAgIDogJ3NoYXJlUm91dGUnXG4gICAgJ3NoYXJlLzppZCcgICAgOiAnc2hhcmVSb3V0ZSdcbiAgICAnbm90LXN1cHBvcnRlZCc6ICdub3RTdXBwb3J0ZWRSb3V0ZSdcblxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIHtAYXBwQ29udHJvbGxlciwgQGFwcE1vZGVsfSA9IG9wdGlvbnNcblxuICAgIFB1YlN1Yi5vbiBQdWJFdmVudC5ST1VURSwgQG9uUm91dGVDaGFuZ2VcblxuXG4gIG9uUm91dGVDaGFuZ2U6IChwYXJhbXMpID0+XG4gICAge3JvdXRlfSA9IHBhcmFtc1xuXG4gICAgQG5hdmlnYXRlIHJvdXRlLCB7IHRyaWdnZXI6IHRydWUgfVxuXG5cbiAgbGFuZGluZ1JvdXRlOiAtPlxuICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBAYXBwQ29udHJvbGxlci5sYW5kaW5nVmlld1xuXG5cbiAgY3JlYXRlUm91dGU6IC0+XG4gICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLmNyZWF0ZVZpZXdcblxuXG4gIHNoYXJlUm91dGU6IChzaGFyZUlkKSAtPlxuICAgIGNvbnNvbGUubG9nIHNoYXJlSWRcblxuICAgIEBhcHBNb2RlbC5zZXRcbiAgICAgICd2aWV3JzogQGFwcENvbnRyb2xsZXIuc2hhcmVWaWV3XG4gICAgICAnc2hhcmVJZCc6IHNoYXJlSWRcblxuXG4gIG5vdFN1cHBvcnRlZFJvdXRlOiAtPlxuICAgIEBhcHBNb2RlbC5zZXQgJ3ZpZXcnLCBAYXBwQ29udHJvbGxlci5ub3RTdXBwb3J0ZWRWaWV3XG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBSb3V0ZXJcbiIsIiMjIypcbiAqIENvbGxlY3Rpb24gc3VwZXJjbGFzc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNS4xNFxuIyMjXG5cbmNsYXNzIENvbGxlY3Rpb24gZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvblxuIiwiIyMjKlxuICogTW9kZWwgc3VwZXJjbGFzc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNS4xNFxuIyMjXG5cbmNsYXNzIE1vZGVsIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbFxuIiwiIyMjKlxuICogVmlldyBzdXBlcmNsYXNzIGNvbnRhaW5pbmcgc2hhcmVkIGZ1bmN0aW9uYWxpdHlcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDIuMTcuMTRcbiMjI1xuXG5Ccm93c2VyRGV0ZWN0ID0gcmVxdWlyZSAnLi4vdXRpbHMvQnJvd3NlckRldGVjdCdcblxuY2xhc3MgVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICAjIEluaXRpYWxpemVzIHRoZSB2aWV3XG4gICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBfLmV4dGVuZCBALCBfLmRlZmF1bHRzKCBvcHRpb25zID0gb3B0aW9ucyB8fCBAZGVmYXVsdHMsIEBkZWZhdWx0cyB8fCB7fSApXG5cblxuICAjIFJlbmRlcnMgdGhlIHZpZXcgd2l0aCBzdXBwbGllZCB0ZW1wbGF0ZSBkYXRhLCBvciBjaGVja3MgaWYgdGVtcGxhdGUgaXMgb25cbiAgIyBvYmplY3QgYm9keVxuICAjIEBwYXJhbSAge0Z1bmN0aW9ufE1vZGVsfSB0ZW1wbGF0ZURhdGFcbiAgIyBAcmV0dXJuIHtWaWV3fVxuXG4gIHJlbmRlcjogKHRlbXBsYXRlRGF0YSkgLT5cbiAgICB0ZW1wbGF0ZURhdGEgPSB0ZW1wbGF0ZURhdGEgfHwge31cblxuICAgIGlmIEB0ZW1wbGF0ZVxuXG4gICAgICAjIElmIG1vZGVsIGlzIGFuIGluc3RhbmNlIG9mIGEgYmFja2JvbmUgbW9kZWwsIHRoZW4gSlNPTmlmeSBpdFxuICAgICAgaWYgQG1vZGVsIGluc3RhbmNlb2YgQmFja2JvbmUuTW9kZWxcbiAgICAgICAgdGVtcGxhdGVEYXRhID0gQG1vZGVsLnRvSlNPTigpXG5cbiAgICAgICMgUGFzcyBpbiBkZXNrdG9wIHRvIHJlbmRlciBzZXBlcmF0ZSBtb2JpbGUgY29uZGl0aW9uYWwgdGVtcGxhdGVzXG4gICAgICB0ZW1wbGF0ZURhdGEuaXNEZXNrdG9wID0gaWYgJCgnYm9keScpLmhhc0NsYXNzKCdkZXNrdG9wJykgdGhlbiB0cnVlIGVsc2UgZmFsc2VcblxuICAgICAgQCRlbC5odG1sIEB0ZW1wbGF0ZSAodGVtcGxhdGVEYXRhKVxuXG4gICAgIyBBZGQgZmxhZyBzbyB2aWV3IGNhbiBjaGVjayBhZ2FpbnN0IHN0dWZmXG4gICAgQGlzTW9iaWxlID0gaWYgJCgnYm9keScpLmhhc0NsYXNzKCdtb2JpbGUnKSB0aGVuIHRydWUgZWxzZSBmYWxzZVxuICAgIEBpc1RhYmxldCA9IGlmIEJyb3dzZXJEZXRlY3QuZGV2aWNlRGV0ZWN0aW9uKCkuZGV2aWNlVHlwZSBpcyAndGFibGV0JyB0aGVuIHRydWUgZWxzZSBmYWxzZVxuXG4gICAgQGRlbGVnYXRlRXZlbnRzKClcbiAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuICAgIEBcblxuXG4gICMgUmVtb3ZlcyB0aGUgdmlld1xuICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgcmVtb3ZlOiAob3B0aW9ucykgLT5cbiAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuICAgIEAkZWwucmVtb3ZlKClcbiAgICBAdW5kZWxlZ2F0ZUV2ZW50cygpXG5cblxuICAjIFNob3dzIHRoZSB2aWV3XG4gICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICBzaG93OiAob3B0aW9ucykgLT5cbiAgICByZXR1cm5cbiAgICBUd2VlbkxpdGUuc2V0IEAkZWwsIHsgYXV0b0FscGhhOiAxIH1cblxuXG4gICMgSGlkZXMgdGhlIHZpZXdcbiAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gIGhpZGU6IChvcHRpb25zKSAtPlxuICAgIFR3ZWVuTGl0ZS50byBAJGVsLCAwLFxuICAgICAgYXV0b0FscGhhOiAwXG4gICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICBpZiBvcHRpb25zPy5yZW1vdmVcbiAgICAgICAgICBAcmVtb3ZlKClcblxuXG4gICMgTm9vcCB3aGljaCBpcyBjYWxsZWQgb24gcmVuZGVyXG4gICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICBhZGRFdmVudExpc3RlbmVyczogLT5cblxuXG4gICMgUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBsaXN0ZW5lcnNcbiAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdcbiIsIiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuIyBCcmVha3BvaW50IE1hbmFnZXJcbiMgQXV0aG9yOiBtYXR0QHdpbnRyLnVzIEAgV0lOVFJcbiNcbiMgVGhpcyBjbGFzcyB3aWxsIGJyb2FkY2FzdCBhbiBldmVudCB3aGVuZXZlciBhIGJyZWFrcG9pbnRcbiMgaXMgbWF0Y2hlZCBvciB1bm1hdGNoZWQuIERlcGVuZHMgb24gZW5xdWlyZS5qcyBhbmQgalF1ZXJ5XG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuXG5jbGFzcyBCcmVha3BvaW50TWFuYWdlclxuXG5cbiAgIyBCcmVha3BvaW50IGV2ZW50cyB3aWxsIGJlIHRyaWdnZXJlZCBvbiB0aGlzIHNjb3BlXG4gIHNjb3BlOiBudWxsXG5cbiAgIyBBcnJheSBvZiBicmVha3BvaW50cyBvYmplY3RzLCBlYWNoIHdpdGggbWluL21heCBwcm9wZXJ0aWVzXG4gICNcbiAgIyBVc2FnZSBFeGFtcGxlOlxuICAjXG4gICMgYnJlYWtwb2ludE1hbmFnZXIgPSBuZXcgQnJlYWtwb2ludE1hbmFnZXJcbiAgIyAgIHNjb3BlOiAkKGRvY3VtZW50KVxuICAjICAgYnJlYWtwb2ludHM6XG4gICMgICAgIG1vYmlsZTpcbiAgIyAgICAgICBtaW46IG51bGxcbiAgIyAgICAgICBtYXg6IDU5OVxuICAjICAgICB0YWJsZXQ6XG4gICMgICAgICAgbWluOiA2MDBcbiAgIyAgICAgICBtYXg6IDgxOVxuICAjICAgICBkZXNrdG9wOlxuICAjICAgICAgIG1pbjogODIwXG4gICMgICAgICAgbWF4OiBudWxsXG4gICNcbiAgIyAjIFRoZW4gc3Vic2NyaWJlIHRvIGV2ZW50cyB2aWE6XG4gICMgJChkb2N1bWVudCkub24gXCJicmVha3BvaW50Om1hdGNoXCIsIChldmVudCwgYnJlYWtwb2ludCkgLT5cblxuICBicmVha3BvaW50czogW11cblxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAge0BzY29wZSwgQGJyZWFrcG9pbnRzfSA9IG9wdGlvbnNcblxuICAgICQuZWFjaCBAYnJlYWtwb2ludHMsIChicmVha3BvaW50LCBib3VuZHJpZXMpID0+XG5cbiAgICAgIGlmIGJvdW5kcmllcy5taW4gaXMgbnVsbFxuICAgICAgICBxdWVyeSA9IFwic2NyZWVuIGFuZCAobWluLXdpZHRoOjBweCkgYW5kIChtYXgtd2lkdGg6I3tib3VuZHJpZXMubWF4fXB4KVwiXG4gICAgICBlbHNlIGlmIGJvdW5kcmllcy5tYXggaXMgbnVsbFxuICAgICAgICBxdWVyeSA9IFwic2NyZWVuIGFuZCAobWluLXdpZHRoOiN7Ym91bmRyaWVzLm1pbn1weClcIlxuICAgICAgZWxzZVxuICAgICAgICBxdWVyeSA9IFwic2NyZWVuIGFuZCAobWluLXdpZHRoOiN7Ym91bmRyaWVzLm1pbn1weCkgYW5kIChtYXgtd2lkdGg6I3tib3VuZHJpZXMubWF4fXB4KVwiXG5cbiAgICAgIGVucXVpcmUucmVnaXN0ZXIocXVlcnksXG4gICAgICAgIG1hdGNoOiA9PlxuICAgICAgICAgIEBzY29wZS50cmlnZ2VyKFwiYnJlYWtwb2ludDptYXRjaFwiLCBicmVha3BvaW50KVxuICAgICAgICB1bm1hdGNoOiA9PlxuICAgICAgICAgIEBzY29wZS50cmlnZ2VyKFwiYnJlYWtwb2ludDp1bm1hdGNoXCIsIGJyZWFrcG9pbnQpXG4gICAgICApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBCcmVha3BvaW50TWFuYWdlciIsIlxudmFyIEJyb3dzZXJEZXRlY3QgPSB7XG5cbiAgdW5zdXBwb3J0ZWRBbmRyb2lkRGV2aWNlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudFxuICAgIHZhciBhZ2VudEluZGV4ID0gdXNlckFnZW50LmluZGV4T2YoJ0FuZHJvaWQnKTtcblxuICAgIGlmIChhZ2VudEluZGV4ICE9IC0xKSB7XG4gICAgICB2YXIgYW5kcm9pZHZlcnNpb24gPSBwYXJzZUZsb2F0KHVzZXJBZ2VudC5tYXRjaCgvQW5kcm9pZFxccysoW1xcZFxcLl0rKS8pWzFdKTtcbiAgICAgIGlmIChhbmRyb2lkdmVyc2lvbiA8IDQuMSkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH0sXG5cblxuICBkZXZpY2VEZXRlY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvc1ZlcnNpb24sXG4gICAgZGV2aWNlLFxuICAgIGRldmljZVR5cGUsXG4gICAgdXNlckFnZW50LFxuICAgIGlzU21hcnRwaG9uZU9yVGFibGV0O1xuXG4gICAgZGV2aWNlID0gKG5hdmlnYXRvci51c2VyQWdlbnQpLm1hdGNoKC9BbmRyb2lkfGlQaG9uZXxpUGFkfGlQb2QvaSk7XG5cbiAgICBpZiAoIC9BbmRyb2lkL2kudGVzdChkZXZpY2UpICkge1xuICAgICAgICBpZiAoICEvbW9iaWxlL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSApIHtcbiAgICAgICAgICAgIGRldmljZVR5cGUgPSAndGFibGV0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRldmljZVR5cGUgPSAncGhvbmUnO1xuICAgICAgICB9XG5cbiAgICAgICAgb3NWZXJzaW9uID0gKG5hdmlnYXRvci51c2VyQWdlbnQpLm1hdGNoKC9BbmRyb2lkXFxzKyhbXFxkXFwuXSspL2kpO1xuICAgICAgICBvc1ZlcnNpb24gPSBvc1ZlcnNpb25bMF07XG4gICAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvbi5yZXBsYWNlKCdBbmRyb2lkICcsICcnKTtcblxuICAgIH0gZWxzZSBpZiAoIC9pUGhvbmUvaS50ZXN0KGRldmljZSkgKSB7XG4gICAgICAgIGRldmljZVR5cGUgPSAncGhvbmUnO1xuICAgICAgICBvc1ZlcnNpb24gPSAobmF2aWdhdG9yLnVzZXJBZ2VudCkubWF0Y2goL09TXFxzKyhbXFxkXFxfXSspL2kpO1xuICAgICAgICBvc1ZlcnNpb24gPSBvc1ZlcnNpb25bMF07XG4gICAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvbi5yZXBsYWNlKC9fL2csICcuJyk7XG4gICAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvbi5yZXBsYWNlKCdPUyAnLCAnJyk7XG5cbiAgICB9IGVsc2UgaWYgKCAvaVBhZC9pLnRlc3QoZGV2aWNlKSApIHtcbiAgICAgICAgZGV2aWNlVHlwZSA9ICd0YWJsZXQnO1xuICAgICAgICBvc1ZlcnNpb24gPSAobmF2aWdhdG9yLnVzZXJBZ2VudCkubWF0Y2goL09TXFxzKyhbXFxkXFxfXSspL2kpO1xuICAgICAgICBvc1ZlcnNpb24gPSBvc1ZlcnNpb25bMF07XG4gICAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvbi5yZXBsYWNlKC9fL2csICcuJyk7XG4gICAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvbi5yZXBsYWNlKCdPUyAnLCAnJyk7XG4gICAgfVxuICAgIGlzU21hcnRwaG9uZU9yVGFibGV0ID0gL0FuZHJvaWR8d2ViT1N8aVBob25lfGlQYWR8aVBvZHxCbGFja0JlcnJ5L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICB1c2VyQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xuXG4gICAgcmV0dXJuIHsgJ2lzU21hcnRwaG9uZU9yVGFibGV0JzogaXNTbWFydHBob25lT3JUYWJsZXQsXG4gICAgICAgICAgICAgJ2RldmljZSc6IGRldmljZSxcbiAgICAgICAgICAgICAnb3NWZXJzaW9uJzogb3NWZXJzaW9uLFxuICAgICAgICAgICAgICd1c2VyQWdlbnQnOiB1c2VyQWdlbnQsXG4gICAgICAgICAgICAgJ2RldmljZVR5cGUnOiBkZXZpY2VUeXBlXG4gICAgICAgICAgICB9O1xuICB9LFxuXG5cbiAgaXNJRTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0lFL2kpKVxuICAgICAgcmV0dXJuIHRydWVcblxuICAgIGlmICghIW5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1RyaWRlbnQuKnJ2XFw6MTFcXC4vKSlcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnJvd3NlckRldGVjdFxuXG4iLCIvKipcbiAqIEBtb2R1bGUgICAgIFB1YlN1YlxuICogQGRlc2MgICAgICAgR2xvYmFsIFB1YlN1YiBvYmplY3QgZm9yIGRpc3BhdGNoIGFuZCBkZWxlZ2F0aW9uXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBQdWJTdWIgPSB7fVxuXG5fLmV4dGVuZCggUHViU3ViLCBCYWNrYm9uZS5FdmVudHMgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFB1YlN1YiIsIi8qKlxuICogU3Bpbi5qcyBsb2FkZXIgaWNvbiBjb25maWd1cmF0aW9uXG4gKlxuICogQGF1dGhvciAgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgIDIuMTguMTRcbiAqL1xuXG52YXIgb3B0cyA9IHtcbiAgbGluZXM6IDcsIC8vIFRoZSBudW1iZXIgb2YgbGluZXMgdG8gZHJhd1xuICBsZW5ndGg6IDYsIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gIHdpZHRoOiAzLCAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgcmFkaXVzOiA2LCAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgY29ybmVyczogMSwgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcbiAgcm90YXRlOiAwLCAvLyBUaGUgcm90YXRpb24gb2Zmc2V0XG4gIGRpcmVjdGlvbjogMSwgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxuICBjb2xvcjogJyNmZmYnLCAvLyAjcmdiIG9yICNycmdnYmIgb3IgYXJyYXkgb2YgY29sb3JzXG4gIHNwZWVkOiAxLCAvLyBSb3VuZHMgcGVyIHNlY29uZFxuICB0cmFpbDogNzgsIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXG4gIHNoYWRvdzogZmFsc2UsIC8vIFdoZXRoZXIgdG8gcmVuZGVyIGEgc2hhZG93XG4gIGh3YWNjZWw6IGZhbHNlLCAvLyBXaGV0aGVyIHRvIHVzZSBoYXJkd2FyZSBhY2NlbGVyYXRpb25cbiAgY2xhc3NOYW1lOiAnc3Bpbm5lcicsIC8vIFRoZSBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBzcGlubmVyXG4gIHpJbmRleDogMmU5LCAvLyBUaGUgei1pbmRleCAoZGVmYXVsdHMgdG8gMjAwMDAwMDAwMClcbiAgdG9wOiAnYXV0bycsIC8vIFRvcCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnQgaW4gcHhcbiAgbGVmdDogJ2F1dG8nIC8vIExlZnQgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50IGluIHB4XG59O1xuXG5cbnZhciBTcGluSWNvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIHRoaXMudGFyZ2V0ID0gb3B0aW9ucy50YXJnZXRcbiAgdGhpcy5vcHRpb25zID0gXy5leHRlbmQob3B0cywgb3B0aW9ucylcbiAgcmV0dXJuIHRoaXMuaW5pdCgpXG59XG5cblNwaW5JY29uLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgdGhpcy5zcGlubmVyID0gbmV3IFNwaW5uZXIob3B0cykuc3Bpbih0aGlzLnRhcmdldCk7XG4gIHRoaXMuJGVsID0gJCh0aGlzLnNwaW5uZXIuZWwpXG4gIFR3ZWVuTGl0ZS5zZXQoIHRoaXMuJGVsLCB7IGF1dG9BbHBoYTogMCB9KVxuICB0aGlzLmhpZGUoKVxufVxuXG5TcGluSWNvbi5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgVHdlZW5MaXRlLnRvKCB0aGlzLiRlbCwgLjIsIHtcbiAgICBhdXRvQWxwaGE6IDFcbiAgfSlcbn1cblxuU3Bpbkljb24ucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gIFR3ZWVuTGl0ZS50byggdGhpcy4kZWwsIC4yLCB7XG4gICAgYXV0b0FscGhhOiAwXG4gIH0pXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3Bpbkljb24iLCJ2YXIgb2JzZXJ2ZURPTSA9IChmdW5jdGlvbigpe1xuICB2YXIgTXV0YXRpb25PYnNlcnZlciA9IHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyIHx8IHdpbmRvdy5XZWJLaXRNdXRhdGlvbk9ic2VydmVyLFxuICAgIGV2ZW50TGlzdGVuZXJTdXBwb3J0ZWQgPSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcblxuICByZXR1cm4gZnVuY3Rpb24ob2JqLCBjYWxsYmFjayl7XG4gICAgaWYgKE11dGF0aW9uT2JzZXJ2ZXIpIHtcblxuICAgICAgLy8gRGVmaW5lIGEgbmV3IG9ic2VydmVyXG4gICAgICB2YXIgb2JzID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24obXV0YXRpb25zLCBvYnNlcnZlcil7XG4gICAgICAgICAgaWYoIG11dGF0aW9uc1swXS5hZGRlZE5vZGVzLmxlbmd0aCB8fCBtdXRhdGlvbnNbMF0ucmVtb3ZlZE5vZGVzLmxlbmd0aCApXG4gICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gSGF2ZSB0aGUgb2JzZXJ2ZXIgb2JzZXJ2ZSBmb28gZm9yIGNoYW5nZXMgaW4gY2hpbGRyZW5cbiAgICAgIG9icy5vYnNlcnZlKCBvYmosIHsgY2hpbGRMaXN0OnRydWUsIHN1YnRyZWU6dHJ1ZSB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50TGlzdGVuZXJTdXBwb3J0ZWQpIHtcbiAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyKCdET01Ob2RlSW5zZXJ0ZWQnLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgb2JqLmFkZEV2ZW50TGlzdGVuZXIoJ0RPTU5vZGVSZW1vdmVkJywgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICB9XG4gIH1cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gb2JzZXJ2ZURPTVxuIiwiIyMjKlxuICogQ3JlYXRlIHZpZXcgd2hpY2ggdGhlIHVzZXIgY2FuIGJ1aWxkIGJlYXRzIHdpdGhpblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblB1YlN1YiAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvUHViU3ViJ1xuVmlldyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5BcHBFdmVudCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5QdWJFdmVudCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5TaGFyZWRUcmFja01vZGVsICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9TaGFyZWRUcmFja01vZGVsLmNvZmZlZSdcbkJ1YmJsZXMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvdmlzdWFsaXplci9CdWJibGVzJ1xuQnViYmxlc1ZpZXcgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi92aWV3cy92aXN1YWxpemVyL0J1YmJsZXNWaWV3LmNvZmZlZSdcbkJyb3dzZXJEZXRlY3QgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvQnJvd3NlckRldGVjdCdcbktpdFNlbGVjdG9yICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSdcblBsYXlQYXVzZUJ0biAgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb21wb25lbnRzL1BsYXlQYXVzZUJ0bi5jb2ZmZWUnXG5Ub2dnbGUgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vY29tcG9uZW50cy9Ub2dnbGUuY29mZmVlJ1xuUGF0dGVyblNlbGVjdG9yICAgICAgICAgPSByZXF1aXJlICcuL2NvbXBvbmVudHMvUGF0dGVyblNlbGVjdG9yLmNvZmZlZSdcbkluc3RydW1lbnRTZWxlY3RvclBhbmVsID0gcmVxdWlyZSAnLi9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLmNvZmZlZSdcblNlcXVlbmNlciAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuTGl2ZVBhZCAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL2NvbXBvbmVudHMvcGFkL0xpdmVQYWQuY29mZmVlJ1xuU2hhcmVNb2RhbCAgICAgICAgICAgICAgPSByZXF1aXJlICcuL2NvbXBvbmVudHMvc2hhcmUvU2hhcmVNb2RhbC5jb2ZmZWUnXG5CUE1JbmRpY2F0b3IgICAgICAgICAgICA9IHJlcXVpcmUgJy4vY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xudGVtcGxhdGUgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9jcmVhdGUtdGVtcGxhdGUuaGJzJ1xuXG5jbGFzcyBDcmVhdGVWaWV3IGV4dGVuZHMgVmlld1xuXG4gICMgVGhlIGNsYXNzIG5hbWUgZm9yIHRoZSBjbGFzc1xuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgY2xhc3NOYW1lOiAnY29udGFpbmVyLWNyZWF0ZSdcblxuICAjIFRoZSB0ZW1wbGF0ZVxuICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gIGV2ZW50czpcbiAgICAndG91Y2hlbmQgLmJ0bi1zaGFyZSc6ICdvblNoYXJlQnRuQ2xpY2snXG4gICAgJ3RvdWNoZW5kIC5idG4tZXhwb3J0JzogJ29uRXhwb3J0QnRuQ2xpY2snXG4gICAgJ3RvdWNoc3RhcnQgLmJ0bi1jbGVhcic6ICdvbkNsZWFyQnRuUHJlc3MnXG4gICAgJ3RvdWNoZW5kIC5idG4tY2xlYXInOiAnb25DbGVhckJ0bkNsaWNrJ1xuICAgICd0b3VjaHN0YXJ0IC5idG4tamFtLWxpdmUnOiAnb25KYW1MaXZlQnRuUHJlc3MnICMgTW9iaWxlIG9ubHlcbiAgICAndG91Y2hlbmQgLmJ0bi1qYW0tbGl2ZSc6ICdvbkphbUxpdmVCdG5DbGljaycgIyBNb2JpbGUgb25seVxuXG5cbiAgIyBSZW5kZXJzIHRoZSB2aWV3IGFuZCBhbGwgb2YgdGhlIGluZGl2aWR1YWwgY29tcG9uZW50cy4gIEFsc28gY2hlY2tzXG4gICMgZm9yIGEgYHNoYXJlSWRgIG9uIHRoZSBBcHBNb2RlbCBhbmQgaGlkZXMgZWxlbWVudHMgYXBwcm9wcmlhdGVseVxuICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG5cbiAgICBAcGxheVBhdXNlQnRuID0gbmV3IFBsYXlQYXVzZUJ0blxuICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgQHRvZ2dsZSA9IG5ldyBUb2dnbGVcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgIEBidWJibGVzVmlldyA9IG5ldyBCdWJibGVzVmlld1xuICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgQCRib2R5ID0gJCgnYm9keScpXG5cbiAgICBAJG1haW5Db250YWluZXIgPSBAJGJvZHkuZmluZCAnI2NvbnRhaW5lci1tYWluJ1xuICAgIEAkYm90dG9tQ29udGFpbmVyID0gQCRib2R5LmZpbmQgJyNjb250YWluZXItYm90dG9tJ1xuICAgIEAkd3JhcHBlciA9IEAkZWwuZmluZCAnLndyYXBwZXInXG4gICAgQCRraXRTZWxlY3RvckNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1raXQtc2VsZWN0b3InXG4gICAgQCR0b2dnbGVDb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItdG9nZ2xlJ1xuICAgIEAkcGxheVBhdXNlQ29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLXBsYXktcGF1c2UnXG4gICAgQCRzZXF1ZW5jZXJDb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItc2VxdWVuY2VyJ1xuICAgIEAkbGl2ZVBhZENvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1saXZlLXBhZCdcbiAgICBAJHBhdHRlcm5TZWxlY3RvckNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbHVtbi0yJ1xuICAgIEAkYnBtQ29udGFpbmVyID0gQCRlbC5maW5kICcuY29sdW1uLTMnXG5cbiAgICBAJGluc3RydW1lbnRTZWxlY3RvciA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5pbnN0cnVtZW50LXNlbGVjdG9yJ1xuICAgIEAkc2VxdWVuY2VyID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLnNlcXVlbmNlcidcbiAgICBAJGxpdmVQYWQgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcubGl2ZS1wYWQnXG4gICAgQCRwYXR0ZXJuU2VsZWN0b3IgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcucGF0dGVybi1zZWxlY3RvcidcbiAgICBAJGJwbSA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5icG0nXG4gICAgQCRzaGFyZUJ0biA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5idG4tc2hhcmUnXG5cbiAgICBAJHBsYXlQYXVzZUNvbnRhaW5lci5odG1sIEBwbGF5UGF1c2VCdG4ucmVuZGVyKCkuZWxcblxuICAgICMgRml4IHZpZXdwb3J0IGlmIG9uIFRhYmxldFxuICAgIFR3ZWVuTGl0ZS50byBAJGJvZHksIDAsXG4gICAgICBzY3JvbGxUb3A6IDBcbiAgICAgIHNjcm9sbExlZnQ6IDBcblxuICAgICMgTm8gdG9nZ2xlIG9uIG1vYmlsZVxuICAgIHVubGVzcyBAaXNNb2JpbGVcbiAgICAgIEAkdG9nZ2xlQ29udGFpbmVyLmh0bWwgQHRvZ2dsZS5yZW5kZXIoKS5lbFxuXG4gICAgIyBCdWlsZCBvdXQgcm93cyBmb3IgbmV3IGxheW91dFxuICAgIGlmIEBpc01vYmlsZVxuXG4gICAgICAjIFBhdXNlIGJ0biwgQlBNLCBTaGFyZSBidG5cbiAgICAgIEAkcm93MSA9IEAkZWwuZmluZCAnLnJvdy0xJ1xuXG4gICAgICAjIEtpdCBzZWxlY3RvciwgcGF0dGVybiBzZWxlY3RvclxuICAgICAgQCRyb3cyID0gQCRlbC5maW5kICcucm93LTInXG5cbiAgICAgICMgSW5zdHJ1bWVudCBTZWxlY3RvciwgTGl2ZXBhZCB0b2dnbGVcbiAgICAgIEAkcm93MyA9IEAkZWwuZmluZCAnLnJvdy0zJ1xuXG4gICAgICAjIFNlcXVlbmNlclxuICAgICAgQCRyb3c0ID0gQCRlbC5maW5kICcucm93LTQnXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50U2VsZWN0b3IoKVxuXG4gICAgICBfLmRlZmVyID0+XG4gICAgICAgIEBhcHBNb2RlbC5zZXQgJ3Nob3dTZXF1ZW5jZXInLCB0cnVlXG4gICAgICAgIEBpbnN0cnVtZW50U2VsZWN0b3IuaW5zdHJ1bWVudFZpZXdzWzBdLm9uQ2xpY2soKVxuXG4gICAgVHdlZW5MaXRlLnNldCBAJGJvdHRvbUNvbnRhaW5lciwgeTogMzAwXG5cbiAgICBAcmVuZGVyS2l0U2VsZWN0b3IoKVxuICAgIEByZW5kZXJTZXF1ZW5jZXIoKVxuICAgIEByZW5kZXJMaXZlUGFkKClcbiAgICBAcmVuZGVyUGF0dGVyblNlbGVjdG9yKClcbiAgICBAcmVuZGVyQlBNKClcblxuICAgIHVubGVzcyBAaXNNb2JpbGUgb3IgQGlzVGFibGV0IG9yIEJyb3dzZXJEZXRlY3QuaXNJRSgpXG4gICAgICBAcmVuZGVyQnViYmxlcygpXG5cbiAgICBAJGtpdFNlbGVjdG9yID0gQCRlbC5maW5kICcua2l0LXNlbGVjdG9yJ1xuXG4gICAgQFxuXG5cbiAgIyBTaG93IHRoZSB2aWV3IGFuZCBvcGVuIHRoZSBzZXF1ZW5jZXJcblxuICBzaG93OiA9PlxuICAgIEAkbWFpbkNvbnRhaW5lci5zaG93KClcbiAgICBAc2hvd1VJKClcbiAgICBAYXBwTW9kZWwuc2V0ICdzaG93U2VxdWVuY2VyJywgdHJ1ZVxuXG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBUd2VlbkxpdGUudG8gJCgnLnRvcC1iYXInKSwgLjMsIGF1dG9BbHBoYTogMVxuXG4gICAgICBUd2VlbkxpdGUuZnJvbVRvIEAkbWFpbkNvbnRhaW5lciwgLjQsIHk6IDEwMDAsXG4gICAgICAgIGltbWVkaWF0ZVJlbmRlcjogdHJ1ZVxuICAgICAgICB5OiBAcmV0dXJuTW92ZUFtb3VudCgpXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuICAgICAgICBkZWxheTogMVxuXG5cbiAgIyBIaWRlIHRoZSB2aWV3IGFuZCByZW1vdmUgaXQgZnJvbSB0aGUgRE9NXG5cbiAgaGlkZTogKG9wdGlvbnMpID0+XG4gICAgVHdlZW5MaXRlLmZyb21UbyBAJGVsLCAuMywgYXV0b0FscGhhOiAxLFxuICAgICAgYXV0b0FscGhhOiAwXG5cbiAgICBAa2l0U2VsZWN0b3IuaGlkZSgpXG4gICAgQGhpZGVVSSgpXG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIFR3ZWVuTGl0ZS50byAkKCcudG9wLWJhcicpLCAuMywgYXV0b0FscGhhOiAwXG5cbiAgICBpZiBAJGJvdHRvbUNvbnRhaW5lci5sZW5ndGhcbiAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRib3R0b21Db250YWluZXIsIC40LCB5OiAwLFxuICAgICAgICB5OiAzMDBcbiAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG4gICAgICAgIG9uQ29tcGxldGU6ID0+XG5cbiAgICAgICAgICBAYXBwTW9kZWwuc2V0XG4gICAgICAgICAgICAnc2hvd1NlcXVlbmNlcic6IG51bGxcbiAgICAgICAgICAgICdzaG93UGFkJzogbnVsbFxuXG4gICAgICAgICAgaWYgb3B0aW9ucz8ucmVtb3ZlXG4gICAgICAgICAgICBAcmVtb3ZlKClcblxuXG4gICMgRGVza3RvcCBvbmx5LiAgVHJpZ2dlcmVkIHdoZW4gc2hvd2luZyAvIGhpZGluZyB2aWV3IG9yIGV4cGFuZGluZ1xuICAjIHZpc3VhbGl6YXRpb24gb24gc2hhcmVcblxuICBzaG93VUk6IC0+XG4gICAgQGtpdFNlbGVjdG9yLnNob3coKVxuXG4gICAgVHdlZW5MaXRlLmZyb21UbyBAJGVsLCAuMywgYXV0b0FscGhhOiAwLFxuICAgICAgYXV0b0FscGhhOiAxXG4gICAgICBkZWxheTogLjNcblxuICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRib3R0b21Db250YWluZXIsIC40LCB5OiAzMDAsXG4gICAgICBhdXRvQWxwaGE6IDFcbiAgICAgIHk6IEByZXR1cm5Nb3ZlQW1vdW50KClcbiAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuICAgICAgZGVsYXk6IC4zXG5cblxuICAjIERlc2t0b3Agb25seS4gIFRyaWdnZXJlZCB3aGVuIHNob3dpbmcgLyBoaWRpbmcgdmlldyBvciBleHBhbmRpbmdcbiAgIyB2aXN1YWxpemF0aW9uIG9uIHNoYXJlXG5cbiAgaGlkZVVJOiAtPlxuICAgIEBraXRTZWxlY3Rvci5oaWRlKClcblxuICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRlbCwgLjMsIGF1dG9BbHBoYTogMSxcbiAgICAgIGF1dG9BbHBoYTogMFxuXG4gICAgVHdlZW5MaXRlLmZyb21UbyBAJGJvdHRvbUNvbnRhaW5lciwgLjQsIHk6IDAsXG4gICAgICB5OiAzMDBcbiAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuXG5cbiAgIyBSZW1vdmVzIHRoZSB2aWV3XG5cbiAgcmVtb3ZlOiAtPlxuICAgIEBwbGF5UGF1c2VCdG4ucmVtb3ZlKClcbiAgICBAcGxheVBhdXNlQnRuID0gbnVsbFxuXG4gICAgQHRvZ2dsZS5yZW1vdmUoKVxuICAgIEB0b2dnbGUgPSBudWxsXG5cbiAgICBAa2l0U2VsZWN0b3IucmVtb3ZlKClcbiAgICBAa2l0U2VsZWN0b3IgPSBudWxsXG5cbiAgICBAc2VxdWVuY2VyLnJlbW92ZSgpXG4gICAgQHNlcXVlbmNlciA9IG51bGxcblxuICAgIEBsaXZlUGFkLnJlbW92ZSgpXG4gICAgQGxpdmVQYWQgPSBudWxsXG5cbiAgICBAcGF0dGVyblNlbGVjdG9yLnJlbW92ZSgpXG4gICAgQHBhdHRlcm5TZWxlY3RvciA9IG51bGxcblxuICAgIEBicG0ucmVtb3ZlKClcbiAgICBAYnBtID0gbnVsbFxuXG4gICAgQGluc3RydW1lbnRTZWxlY3Rvcj8ucmVtb3ZlKClcbiAgICBAaW5zdHJ1bWVudFNlbGVjdG9yID0gbnVsbFxuXG4gICAgQHNoYXJlTW9kYWw/LnJlbW92ZSgpXG4gICAgQHNoYXJlTW9kYWwgPSBudWxsXG5cbiAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgZmFsc2VcblxuICAgICQoJy5jb250YWluZXIta2l0LXNlbGVjdG9yJykucmVtb3ZlKClcbiAgICBzdXBlcigpXG5cblxuICAjIEFkZHMgbGlzdGVuZXJzIHJlbGF0ZWQgdG8gZXhwb3J0aW5nIHRoZSB0cmFjayBwYXR0ZXJuXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1NIT1dfU0VRVUVOQ0VSLCBAb25TaG93U2VxdWVuY2VyQ2hhbmdlXG5cblxuICAjIFJlbW92ZXMgbGlzdGVuZXJzXG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgc3VwZXIoKVxuXG5cbiAgIyBSZW5kZXJzIHRoZSBraXQgc2VsZWN0b3IgY2Fyb3VzZWxcblxuICByZW5kZXJLaXRTZWxlY3RvcjogLT5cbiAgICBAa2l0U2VsZWN0b3IgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICBodG1sID0gQGtpdFNlbGVjdG9yLnJlbmRlcigpLmVsXG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIEAkcm93Mi5hcHBlbmQgaHRtbFxuICAgIGVsc2VcbiAgICAgIEAkbWFpbkNvbnRhaW5lci5wcmVwZW5kIGh0bWxcblxuXG4gICMgUmVuZGVycyB0aGUgaW5zdHJ1bWVudCBzZWxlY3RvciB3aGljaCwgb24gZGVza3RvcCwgZG9lcyBub3RoaW5nLCBidXQgb25cbiAgIyBtb2JpbGUgZm9jdXNlcyB0aGUgdHJhY2sgd2l0aGluIHRoZSB2aWV3XG5cbiAgcmVuZGVySW5zdHJ1bWVudFNlbGVjdG9yOiAtPlxuICAgIEBpbnN0cnVtZW50U2VsZWN0b3IgPSBuZXcgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWxcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICBAJHJvdzMucHJlcGVuZCBAaW5zdHJ1bWVudFNlbGVjdG9yLnJlbmRlcigpLmVsXG5cblxuICAjIFJlbmRlcnMgb3V0IHRoZSBwYXR0ZXJuIHNxdWFyZSBzZXF1ZW5jZXJcblxuICByZW5kZXJTZXF1ZW5jZXI6IC0+XG4gICAgQHNlcXVlbmNlciA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG4gICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgIGh0bWwgPSBAc2VxdWVuY2VyLnJlbmRlcigpLmVsXG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIEAkcm93NC5odG1sIGh0bWxcbiAgICBlbHNlXG4gICAgICBAJHNlcXVlbmNlci5wcmVwZW5kIGh0bWxcblxuICAgIEBsaXN0ZW5UbyBAc2VxdWVuY2VyLCBQdWJFdmVudC5CRUFULCBAb25CZWF0XG5cblxuICAjIFJlbmRlcnMgb3V0IHRoZSBsaXZlIHBhZCBwbGF5ZXJcblxuICByZW5kZXJMaXZlUGFkOiAtPlxuICAgIEBsaXZlUGFkID0gbmV3IExpdmVQYWRcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICBodG1sID0gQGxpdmVQYWQucmVuZGVyKCkuZWxcblxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgQCRsaXZlUGFkQ29udGFpbmVyLmh0bWwgaHRtbFxuICAgIGVsc2VcbiAgICAgIEAkbGl2ZVBhZC5odG1sIGh0bWxcblxuICAgIEBsaXN0ZW5UbyBAbGl2ZVBhZCwgUHViRXZlbnQuQkVBVCwgQG9uQmVhdFxuXG5cbiAgIyBSZW5kZXIgdGhlIHByZS1wb3B1bGF0ZWQgcGF0dGVybiBzZWxlY3RvclxuXG4gIHJlbmRlclBhdHRlcm5TZWxlY3RvcjogLT5cbiAgICBAcGF0dGVyblNlbGVjdG9yID0gbmV3IFBhdHRlcm5TZWxlY3RvclxuICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgc2VxdWVuY2VyOiBAc2VxdWVuY2VyXG5cbiAgICBodG1sID0gQHBhdHRlcm5TZWxlY3Rvci5yZW5kZXIoKS5lbFxuXG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBAJHJvdzIuYXBwZW5kIGh0bWxcbiAgICBlbHNlXG4gICAgICBAJHBhdHRlcm5TZWxlY3Rvci5odG1sIGh0bWxcblxuXG4gICMgUmVuZGVycyBvdXQgdGhlIEJQTSBpbnRlcmZhY2UgZm9yIGNvbnRyb2xsaW5nIHRlbXBvXG5cbiAgcmVuZGVyQlBNOiAtPlxuICAgIEBicG0gPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICBodG1sID0gQGJwbS5yZW5kZXIoKS5lbFxuXG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBAJHJvdzEuYXBwZW5kIGh0bWxcbiAgICBlbHNlXG4gICAgICBAJGJwbS5odG1sIGh0bWxcblxuXG4gIHJlbmRlckJ1YmJsZXM6IC0+XG4gICAgQCRtYWluQ29udGFpbmVyLnByZXBlbmQgQnViYmxlcy5pbml0aWFsaXplKClcblxuXG4gICMgUmVuZGVycyBvdXQgdGhlIHNoYXJlIG1vZGFsIHdoaWNoIHRoZW4gcG9zdHMgdG8gUGFyc2VcblxuICByZW5kZXJTaGFyZU1vZGFsOiAtPlxuICAgIEBzaGFyZU1vZGFsID0gbmV3IFNoYXJlTW9kYWxcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgIHNoYXJlZFRyYWNrTW9kZWw6IEBzaGFyZWRUcmFja01vZGVsXG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIEAkbWFpbkNvbnRhaW5lci5hcHBlbmQgQHNoYXJlTW9kYWwucmVuZGVyKCkuZWxcblxuICAgICAgIyBTbGlkZSBtYWluIGNvbnRhaW5lciB1cCBhbmQgdGhlbiBvcGVuIHNoYXJlXG4gICAgICBUd2VlbkxpdGUudG8gQCRzZXF1ZW5jZXJDb250YWluZXIsIC42LFxuICAgICAgICB5OiAtd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cbiAgICBlbHNlXG4gICAgICBAJGJvZHkucHJlcGVuZCBAc2hhcmVNb2RhbC5yZW5kZXIoKS5lbFxuXG4gICAgQHNoYXJlTW9kYWwuc2hvdygpXG5cbiAgICBAbGlzdGVuVG8gQHNoYXJlTW9kYWwsIEFwcEV2ZW50LlNBVkVfVFJBQ0ssIEBvblNhdmVUcmFja1xuICAgIEBsaXN0ZW5UbyBAc2hhcmVNb2RhbCwgQXBwRXZlbnQuQ0xPU0VfU0hBUkUsIEBvbkNsb3NlU2hhcmVcblxuXG4gICMgRXZlbnQgaGFuZGxlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLVxuXG4gICMgSGFuZGxlciBmb3IgYmVhdHMgd2hpY2ggYXJlIHBpcGVkIGRvd24gZnJvbSBQYXR0ZXJuU3F1YXJlIHRvIFZpc3VhbGl6YXRpb25WaWV3XG4gICMgQHBhcmFtIHtPYmplY3R9IHBhcmFtcyBXaGljaCBjb25zaXN0IG9mIFBhdHRlcm5TcXVhcmVNb2RlbCBmb3IgaGFuZGxpbmcgdmVsb2NpdHksIGV0Y1xuXG4gIG9uQmVhdDogKHBhcmFtcykgPT5cbiAgICBAdHJpZ2dlciBQdWJFdmVudC5CRUFULCBwYXJhbXNcblxuICAgIHVubGVzcyBAaXNNb2JpbGVcbiAgICAgIEJ1YmJsZXMuYmVhdCgpXG5cblxuICAjIEhhbmRsZXIgZm9yIHNhdmluZywgc2hhcmluZyBhbmQgcG9zdGluZyBhIHRyYWNrXG5cbiAgb25TYXZlVHJhY2s6ID0+XG4gICAgQHRyaWdnZXIgQXBwRXZlbnQuU0FWRV9UUkFDSywgc2hhcmVkVHJhY2tNb2RlbDogQHNoYXJlZFRyYWNrTW9kZWxcblxuXG4gICMgSGFuZGxlciBmb3Igc2hhcmUgYnV0dG9uIGNsaWNrcy4gIENyZWF0ZXMgdGhlIG1vZGFsIGFuZCBwcm9tcHRzIHRoZSB1c2VyXG4gICMgdG8gZW50ZXIgaW5mbyByZWxhdGVkIHRvIHRoZWlyIGNyZWF0aW9uXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uU2hhcmVCdG5DbGljazogKGV2ZW50KSA9PlxuICAgIEB0cmlnZ2VyIEFwcEV2ZW50Lk9QRU5fU0hBUkVcbiAgICBAcmVuZGVyU2hhcmVNb2RhbCgpXG5cblxuICAjIEhhbmRsZXIgZm9yIHByZXNzLXN0YXRlcyBvbiBtb2JpbGVcbiAgIyBAcGFyYW0ge0V2ZW50fSBldmVudFxuXG4gIG9uQ2xlYXJCdG5QcmVzczogKGV2ZW50KSAtPlxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0KS5hZGRDbGFzcyAncHJlc3MnXG5cblxuICAjIEhhbmRsZXIgZm9yIHJlc2V0dGluZyB0aGUgcGF0dGVybiB0cmFjayB0byBkZWZhdWx0LCBibGFuayBzdGF0ZVxuICAjIEBwYXJhbSB7TW91c2VFdmVudHxUb3VjaEV2ZW50fSBldmVudFxuXG4gIG9uQ2xlYXJCdG5DbGljazogKGV2ZW50KSA9PlxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyAncHJlc3MnXG5cbiAgICAjIFdoZW4gdXNlciBpcyBpbiBTZXF1ZW5jZXIgbW9kZVxuICAgIGlmIEBhcHBNb2RlbC5nZXQgJ3Nob3dTZXF1ZW5jZXInXG4gICAgICBAYXBwTW9kZWwuc2V0ICdzaGFyZWRUcmFja01vZGVsJywgbnVsbFxuXG4gICAgICAjIFJlbW92ZSBwcmVzZXQgaWYgY3VycmVudGx5IHNlbGVjdGVkXG4gICAgICBAcGF0dGVyblNlbGVjdG9yLiRlbC5maW5kKCcuc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG4gICAgICBAc2VxdWVuY2VyLnJlbmRlclRyYWNrcygpXG5cbiAgICAjIEZpcmVkIHdoZW4gdGhlIHVzZXIgaW4gdGhlIExpdmVQYWQgbW9kZWxcbiAgICBlbHNlXG4gICAgICBAbGl2ZVBhZC5jbGVhckxpdmVQYWQoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBjbG9zZSBidG4gZXZlbnQgb24gdGhlIHNoYXJlIG1vZGFsLCBhcyBkaXNwYXRjaGVkIGZyb20gdGhlIFNoYXJlTW9kYWxcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgb25DbG9zZVNoYXJlOiAoZXZlbnQpID0+XG4gICAgQHRyaWdnZXIgQXBwRXZlbnQuQ0xPU0VfU0hBUkVcbiAgICBAc3RvcExpc3RlbmluZyBAc2hhcmVNb2RhbFxuXG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBUd2VlbkxpdGUudG8gQCRzZXF1ZW5jZXJDb250YWluZXIsIC42LFxuICAgICAgICB5OiAwXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cblxuICAjIEhhbmRsZXIgZm9yIHNob3dpbmcgc2VxdWVuY2VyIC8gcGFkLiAgSWYgc2VxIGlzIGZhbHNlLCB0aGVuIHBhZCBpcyBzaG93blxuICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgb25TaG93U2VxdWVuY2VyQ2hhbmdlOiAobW9kZWwpID0+XG5cbiAgICAjIFNsaWRlIHRoZSBzZXF1ZW5jZXIgaW5cbiAgICBpZiBtb2RlbC5jaGFuZ2VkLnNob3dTZXF1ZW5jZXJcbiAgICAgIGlmIEBwcmV2Vm9sdW1lIHRoZW4gY3JlYXRlanMuU291bmQuc2V0Vm9sdW1lIEBwcmV2Vm9sdW1lXG5cbiAgICAgIEBzaG93U2VxdWVuY2VyKClcblxuICAgICMgU2xpZGUgdGhlIGxpdmUgcGFkIGluXG4gICAgZWxzZVxuXG4gICAgICAjIEVuc3VyZSB0aGF0IHZvbHVtZSBpcyBhbHdheXMgdXAgZm9yIHRoZSBMaXZlUGFkXG4gICAgICBAcHJldlZvbHVtZSA9IGNyZWF0ZWpzLlNvdW5kLmdldFZvbHVtZSgpXG4gICAgICBjcmVhdGVqcy5Tb3VuZC5zZXRWb2x1bWUgMVxuXG4gICAgICBAc2hvd0xpdmVQYWQoKVxuXG5cbiAgIyBNT0JJTEUgT05MWS4gIEhhbmRsZXIgZm9yIHNob3dpbmcgdGhlIGxpdmUgcGFkIGZyb20gbW9iaWxlIHZpZXdcbiAgIyBAcGFyYW0ge1RvdWNoRXZlbnR9IGV2ZW50XG5cbiAgb25KYW1MaXZlQnRuUHJlc3M6IChldmVudCkgPT5cbiAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzICdwcmVzcydcblxuXG4gICMgTU9CSUxFIE9OTFkuICBIYW5kbGVyIGZvciBzaG93aW5nIHRoZSBsaXZlIHBhZCBmcm9tIG1vYmlsZSB2aWV3XG4gICMgQHBhcmFtIHtUb3VjaEV2ZW50fSBldmVudFxuXG4gIG9uSmFtTGl2ZUJ0bkNsaWNrOiAoZXZlbnQpID0+XG4gICAgJChldmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyAncHJlc3MnXG4gICAgQGFwcE1vZGVsLnNldCAnc2hvd1NlcXVlbmNlcicsIGZhbHNlXG5cblxuXG4gICMgUHJpdmF0ZVxuICAjIC0tLS0tLS1cblxuICAjIENoZWNrIGFnYWluc3QgQ29rZSBuYXYgcGxheWxpc3QgaXRlbXNcblxuICByZXR1cm5Nb3ZlQW1vdW50OiAtPlxuICAgIG1vdmVBbW91bnQgPSBpZiAkKCcucGxpdGVtJykubGVuZ3RoID4gMCB0aGVuIC0zMCBlbHNlIDBcblxuXG4gICMgU3dhcHMgdGhlIGxpdmUgcGFkIG91dCB3aXRoIHRoZSBzZXF1ZW5jZXJcblxuICBzaG93U2VxdWVuY2VyOiAtPlxuICAgIHR3ZWVuVGltZSA9IC42XG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIFR3ZWVuTGl0ZS50byBAJHNlcXVlbmNlckNvbnRhaW5lciwgdHdlZW5UaW1lLFxuICAgICAgICB4OiAwXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuXG4gICAgICBUd2VlbkxpdGUudG8gQCRsaXZlUGFkQ29udGFpbmVyLCB0d2VlblRpbWUsXG4gICAgICAgIHg6IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuXG4gICAgZWxzZVxuICAgICAgVHdlZW5MaXRlLnRvIEAkc2VxdWVuY2VyLCB0d2VlblRpbWUsXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICB4OiAwXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cbiAgICAgIFR3ZWVuTGl0ZS50byBAJGxpdmVQYWQsIHR3ZWVuVGltZSxcbiAgICAgICAgYXV0b0FscGhhOiAwXG4gICAgICAgIHg6IDIwMDBcbiAgICAgICAgZWFzZTogRXhwby5lYXNlSW5PdXRcblxuXG4gICMgU3dhcHMgdGhlIHNlcXVlbmNlciBhcmVhIG91dCB3aXRoIHRoZSBsaXZlIHBhZFxuXG4gIHNob3dMaXZlUGFkOiAtPlxuICAgIHR3ZWVuVGltZSA9IC42XG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIFR3ZWVuTGl0ZS50byBAJHNlcXVlbmNlckNvbnRhaW5lciwgdHdlZW5UaW1lLFxuICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgeDogLXdpbmRvdy5pbm5lcldpZHRoXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cbiAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRsaXZlUGFkQ29udGFpbmVyLCB0d2VlblRpbWUsIHg6IHdpbmRvdy5pbm5lcldpZHRoLFxuICAgICAgICBhdXRvQWxwaGE6IDFcbiAgICAgICAgeDogMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuXG4gICAgZWxzZVxuICAgICAgVHdlZW5MaXRlLnRvIEAkc2VxdWVuY2VyLCB0d2VlblRpbWUsXG4gICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICB4OiAtMjAwMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuXG4gICAgICBUd2VlbkxpdGUudG8gQCRsaXZlUGFkLCB0d2VlblRpbWUsXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICB4OiAwXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDcmVhdGVWaWV3XG4iLCIjIyMqXG4gKiBCZWF0cyBwZXIgbWludXRlIHZpZXcgZm9yIGhhbmRsaW5nIHRlbXBvXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBFdmVudCAgPSByZXF1aXJlICcuLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvYnBtLXRlbXBsYXRlLmhicydcblxuY2xhc3MgQlBNSW5kaWNhdG9yIGV4dGVuZHMgVmlld1xuXG4gICMgQW5pbWF0aW9uIHJvdGF0aW9uIHRpbWUgZm9yIGJvdHRsZWNhcFxuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgUk9UQVRFX1RXRUVOX1RJTUU6IC40XG5cbiAgIyBDbGFzcyBuYW1lIG9mIGNvbnRhaW5lclxuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgY2xhc3NOYW1lOiAnY29udGFpbmVyLWJwbSdcblxuICAjIFJlZiB0byB0aGUgbWFpbiBBcHBNb2RlbFxuICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICBhcHBNb2RlbDogbnVsbFxuXG4gICMgVmlldyB0ZW1wbGF0ZVxuICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuICAjIFRoZSBzZXRJbnRlcnZhbCB1cGRhdGUgaW50ZXJ2YWwgZm9yIGluY3JlYXNpbmcgYW5kXG4gICMgZGVjcmVhc2luZyBCUE0gb24gcHJlc3MgLyB0b3VjaFxuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgaW50ZXJ2YWxVcGRhdGVUaW1lOiA3MFxuXG4gICMgVGhlIHNldEludGVydmFsIHVwZGF0ZXJcbiAgIyBAdHlwZSB7U2V0SW50ZXJ2YWx9XG5cbiAgdXBkYXRlSW50ZXJ2YWw6IG51bGxcblxuICAjIFRoZSBhbW91bnQgdG8gaW5jcmVhc2UgdGhlIEJQTSBieSBvbiBlYWNoIHRpY2tcbiAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gIGJwbUluY3JlYXNlQW1vdW50OiAxMFxuXG4gICMgVGhlIGN1cnJlbnQgYnBtIGJlZm9yZSBpdHMgc2V0IG9uIHRoZSBtb2RlbC4gIFVzZWQgdG8gYnVmZmVyXG4gICMgdXBkYXRlcyBhbmQgdG8gcHJvdmlkZSBmb3Igc21vb3RoIGFuaW1hdGlvblxuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgY3VyckJQTTogbnVsbFxuXG5cbiAgZXZlbnRzOlxuICAgICd0b3VjaHN0YXJ0IC5idG4taW5jcmVhc2UnOiAnb25JbmNyZWFzZUJ0bkRvd24nXG4gICAgJ3RvdWNoc3RhcnQgLmJ0bi1kZWNyZWFzZSc6ICdvbkRlY3JlYXNlQnRuRG93bidcbiAgICAndG91Y2hlbmQgICAuYnRuLWluY3JlYXNlJzogJ29uQnRuVXAnXG4gICAgJ3RvdWNoZW5kICAgLmJ0bi1kZWNyZWFzZSc6ICdvbkJ0blVwJ1xuICAgICd0b3VjaGVuZCAgIC53cmFwcGVyJzogJ29uQnRuVXAnXG4gICAgJ21vdXNldXAgICAgLndyYXBwZXInOiAnb25CdG5VcCdcblxuXG4gICMgUmVuZGVyIHRoZSB2aWV3IGFuZCB1cGRhdGUgdGhlIGtpdCBpZiBub3QgYWxyZWFkeVxuICAjIHNldCB2aWEgYSBwcmV2aW91cyBzZXNzaW9uXG4gICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEAkYnBtTGFiZWwgPSBAJGVsLmZpbmQgJy5icG0tdmFsdWUnXG4gICAgQGluY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWluY3JlYXNlJ1xuICAgIEBkZWNyZWFzZUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1kZWNyZWFzZSdcbiAgICBAJGJnQ2lyY2xlID0gQCRlbC5maW5kICcuYmctY2lyY2xlJ1xuXG4gICAgQGN1cnJCUE0gPSBAYXBwTW9kZWwuZ2V0KCdicG0nKVxuICAgIEAkYnBtTGFiZWwudGV4dCBAY3VyckJQTVxuXG4gICAgdW5sZXNzIEBpc01vYmlsZVxuICAgICAgVHdlZW5MaXRlLnNldCBAJGJnQ2lyY2xlLCByb3RhdGlvbjogMFxuXG4gICAgQFxuXG5cbiAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAjIHN3aXRjaGluZyBCUE1cblxuICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfQlBNLCBAb25CUE1DaGFuZ2VcblxuXG4gICMgU2V0cyBhbiBpbnRlcnZhbCB0byBpbmNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgIyB3aGVuIHRoZSB1c2VyIHJlbGVhc2VzIHRoZSBtb3VzZVxuXG4gIGluY3JlYXNlQlBNOiAtPlxuICAgIGNsZWFySW50ZXJ2YWwgQHVwZGF0ZUludGVydmFsXG5cbiAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgYnBtID0gQGN1cnJCUE1cblxuICAgICAgaWYgYnBtIDwgQXBwQ29uZmlnLkJQTV9NQVhcbiAgICAgICAgYnBtICs9IEBicG1JbmNyZWFzZUFtb3VudFxuXG4gICAgICBlbHNlXG4gICAgICAgIGJwbSA9IEFwcENvbmZpZy5CUE1fTUFYXG5cbiAgICAgIEBjdXJyQlBNID0gYnBtXG4gICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cblxuICAgICAgdW5sZXNzIEBpc01vYmlsZVxuICAgICAgICBUd2VlbkxpdGUudG8gQCRiZ0NpcmNsZSwgQFJPVEFURV9UV0VFTl9USU1FLCByb3RhdGlvbjogR3JlZW5Qcm9wLnJvdGF0aW9uKEAkYmdDaXJjbGUpICsgOTBcblxuICAgICwgQGludGVydmFsVXBkYXRlVGltZVxuXG5cbiAgIyBTZXRzIGFuIGludGVydmFsIHRvIGRlY3JlYXNlIHRoZSBCUE0gbW9uaXRvci4gIENsZWFyc1xuICAjIHdoZW4gdGhlIHVzZXIgcmVsZWFzZXMgdGhlIG1vdXNlXG5cbiAgZGVjcmVhc2VCUE06IC0+XG4gICAgY2xlYXJJbnRlcnZhbCBAdXBkYXRlSW50ZXJ2YWxcblxuICAgIEB1cGRhdGVJbnRlcnZhbCA9IHNldEludGVydmFsID0+XG4gICAgICBicG0gPSBAY3VyckJQTVxuXG4gICAgICBpZiBicG0gPiAxXG4gICAgICAgIGJwbSAtPSBAYnBtSW5jcmVhc2VBbW91bnRcblxuICAgICAgZWxzZVxuICAgICAgICBicG0gPSAxXG5cbiAgICAgIEBjdXJyQlBNID0gYnBtXG4gICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cblxuICAgICAgdW5sZXNzIEBpc01vYmlsZVxuICAgICAgICBUd2VlbkxpdGUudG8gQCRiZ0NpcmNsZSwgQFJPVEFURV9UV0VFTl9USU1FLCByb3RhdGlvbjogR3JlZW5Qcm9wLnJvdGF0aW9uKEAkYmdDaXJjbGUpIC0gOTBcblxuICAgICwgQGludGVydmFsVXBkYXRlVGltZVxuXG5cbiAgIyBFdmVudCBoYW5kbGVyc1xuICAjIC0tLS0tLS0tLS0tLS0tXG5cbiAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcbiAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gIG9uSW5jcmVhc2VCdG5Eb3duOiAoZXZlbnQpID0+XG4gICAgQGluY3JlYXNlQlBNKClcblxuXG4gICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG4gICMgQHBhcmFtIHtFdmVudH1cblxuICBvbkRlY3JlYXNlQnRuRG93bjogKGV2ZW50KSAtPlxuICAgIEBkZWNyZWFzZUJQTSgpXG5cblxuICAjIEhhbmRsZXIgZm9yIG1vdXNlIC8gdG91Y2h1cCBldmVudHMuICBDbGVhcnMgdGhlIGludGVydmFsXG4gICMgQHBhcmFtIHtFdmVudH1cblxuICBvbkJ0blVwOiAoZXZlbnQpIC0+XG4gICAgY2xlYXJJbnRlcnZhbCBAdXBkYXRlSW50ZXJ2YWxcbiAgICBAdXBkYXRlSW50ZXJ2YWwgPSBudWxsXG5cbiAgICBAYXBwTW9kZWwuc2V0ICdicG0nLCAoTWF0aC5mbG9vcig2MDAwMCAvIEBjdXJyQlBNKSAqIC41KVxuXG5cbiAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGxhYmVsIG9uIHRoZVxuICAjIGtpdCBzZWxlY3RvclxuXG4gIG9uQlBNQ2hhbmdlOiAobW9kZWwpIC0+XG4gICAgYnBtID0gbW9kZWwuY2hhbmdlZC5icG1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEJQTUluZGljYXRvclxuIiwiIyMjKlxuICogS2l0IHNlbGVjdG9yIGZvciBzd2l0Y2hpbmcgYmV0d2VlbiBkcnVtLWtpdCBzb3VuZHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMva2l0LXNlbGVjdGlvbi10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIEtpdFNlbGVjdG9yIGV4dGVuZHMgVmlld1xuXG4gIGNsYXNzTmFtZTogJ2NvbnRhaW5lci1raXQtc2VsZWN0b3InXG5cbiAgIyBSZWYgdG8gdGhlIG1haW4gQXBwTW9kZWxcbiAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgYXBwTW9kZWw6IG51bGxcblxuICAjIFJlZiB0byB0aGUgS2l0Q29sbGVjdGlvbiBmb3IgdXBkYXRpbmcgc291bmRzXG4gICMgQHR5cGUge0tpdENvbGxlY3Rpb259XG5cbiAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG4gICMgVGhlIGN1cnJlbnQga2l0XG4gICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gIGtpdE1vZGVsOiBudWxsXG5cbiAgIyBWaWV3IHRlbXBsYXRlXG4gICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgZXZlbnRzOlxuICAgICd0b3VjaHN0YXJ0IC5idG4nOiAnb25CdG5QcmVzcydcbiAgICAndG91Y2hlbmQgLmJ0bi1sZWZ0JzogJ29uTGVmdEJ0bkNsaWNrJ1xuICAgICd0b3VjaGVuZCAuYnRuLXJpZ2h0JzogJ29uUmlnaHRCdG5DbGljaydcblxuXG4gICMgUmVuZGVyIHRoZSB2aWV3IGFuZCB1cGRhdGUgdGhlIGtpdCBpZiBub3QgYWxyZWFkeVxuICAjIHNldCB2aWEgYSBwcmV2aW91cyBzZXNzaW9uXG4gICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEAka2l0TGFiZWwgPSBAJGVsLmZpbmQoJy5sYWJlbC1raXQnKS5maW5kICdkaXYnXG5cbiAgICBpZiBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpIGlzIG51bGxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgIEAka2l0TGFiZWwudGV4dCBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpLmdldCAnbGFiZWwnXG5cbiAgICBAXG5cblxuICBzaG93OiAtPlxuICAgIHVubGVzcyBAaXNNb2JpbGVcblxuICAgICAgVHdlZW5MaXRlLmZyb21UbyBAJGVsLCAuNCwgeTogLTEwMCxcbiAgICAgICAgeTogMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VPdXRcbiAgICAgICAgZGVsYXk6IC4zXG5cblxuICBoaWRlOiAtPlxuICAgIHVubGVzcyBAaXNNb2JpbGVcbiAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRlbCwgLjQsIHk6IDAsXG4gICAgICAgIHk6IC0xMDBcbiAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG5cblxuICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRpbmcgY2hhbmdlcyByZWxhdGVkIHRvXG4gICMgc3dpdGNoaW5nIGRydW0ga2l0c1xuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9LSVQsIEBvbkNoYW5nZUtpdFxuXG5cbiAgIyBFdmVudCBoYW5kbGVyc1xuICAjIC0tLS0tLS0tLS0tLS0tXG5cbiAgb25CdG5QcmVzczogKGV2ZW50KSAtPlxuICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkuYWRkQ2xhc3MgJ3ByZXNzJ1xuXG5cbiAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcblxuICBvbkxlZnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MgJ3ByZXNzJ1xuICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ucHJldmlvdXNLaXQoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcblxuICBvblJpZ2h0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzICdwcmVzcydcbiAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGxhYmVsIG9uIHRoZVxuICAjIGtpdCBzZWxlY3RvclxuXG4gIG9uQ2hhbmdlS2l0OiAobW9kZWwpIC0+XG4gICAgQGtpdE1vZGVsID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbFxuXG4gICAgZGVsYXkgPSBpZiBAaXNNb2JpbGUgdGhlbiAuNSBlbHNlIDBcblxuICAgIFR3ZWVuTGl0ZS50byBAJGtpdExhYmVsLCAuMixcbiAgICAgIHk6IC0yMFxuICAgICAgZWFzZTogRXhwby5lYXNlSW5cbiAgICAgIGRlbGF5OiBkZWxheVxuXG4gICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICBAJGtpdExhYmVsLnRleHQgQGtpdE1vZGVsLmdldCAnbGFiZWwnXG4gICAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRraXRMYWJlbCwgLjIsIHsgeTogMjAgfSxcbiAgICAgICAgICB5OiAwXG4gICAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRTZWxlY3RvclxuIiwiIyMjKlxuICogUGF0dGVybiBzZWxlY3RvciBmb3IgcHJlcG9wdWxhdGluZyB0cmFja3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDQuMS4xNFxuIyMjXG5cbkFwcENvbmZpZyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuU2hhcmVkVHJhY2tNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uL21vZGVscy9TaGFyZWRUcmFja01vZGVsLmNvZmZlZSdcblZpZXcgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5wcmVzZXRzICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vY29uZmlnL1ByZXNldHMnXG50ZW1wbGF0ZSAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGF0dGVybi1zZWxlY3Rvci10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIFBhdHRlcm5TZWxlY3RvciBleHRlbmRzIFZpZXdcblxuICBjbGFzc05hbWU6ICdjb250YWluZXItcGF0dGVybi1zZWxlY3RvcidcbiAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIEBzZWxlY3RlZEluZGV4OiAtMVxuXG4gIGV2ZW50czpcbiAgICAndG91Y2hzdGFydCAuYnRuJzogJ29uQnRuUHJlc3MnXG4gICAgJ3RvdWNoZW5kIC5idG4nOiAnb25CdG5DbGljaydcblxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEBwcmVzZXRNb2RlbHMgPSBfLm1hcCBwcmVzZXRzLCAocHJlc2V0KSAtPlxuICAgICAgbmV3IFNoYXJlZFRyYWNrTW9kZWwgcHJlc2V0LnRyYWNrXG5cblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEAkYnRucyA9IEAkZWwuZmluZCAnLmJ0bidcblxuICAgIEBcblxuXG4gIG9uQnRuUHJlc3M6IChldmVudCkgLT5cbiAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzICdwcmVzcydcblxuXG4gIG9uQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICBzZWxmID0gQFxuXG4gICAgJGJ0biA9ICQoZXZlbnQuY3VycmVudFRhcmdldClcbiAgICAkYnRuLnJlbW92ZUNsYXNzICdwcmVzcydcblxuICAgICMgRGVzZWxlY3QgY3VycmVudCBidXR0b25zXG4gICAgQCRidG5zLmVhY2ggKGluZGV4KSAtPlxuICAgICAgaWYgJGJ0bi50ZXh0KCkgaXNudCAkKEApLnRleHQoKVxuICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcbiAgICAgIGVsc2VcbiAgICAgICAgc2VsZi5zZWxlY3RlZEluZGV4ID0gaW5kZXhcblxuICAgICMgQWxsb3cgZm9yIHNlbGVjdGlvbiBhbmQgZGUtc2VsZWN0aW9uXG4gICAgaWYgJGJ0bi5oYXNDbGFzcygnc2VsZWN0ZWQnKSBpcyBmYWxzZVxuICAgICAgJGJ0bi5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cbiAgICAjIERlc2VsZWN0IGFuZCBjbGVhciBjdXJyZW50IHBhdHRlcm5cbiAgICBlbHNlXG4gICAgICAkYnRuLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcbiAgICAgIHNlbGYuc2VsZWN0ZWRJbmRleCA9IC0xXG5cbiAgICBAaW1wb3J0VHJhY2soKVxuXG5cbiAgaW1wb3J0VHJhY2s6IC0+XG4gICAgaWYgQHNlbGVjdGVkSW5kZXggaXNudCAtMVxuICAgICAgc2hhcmVkVHJhY2tNb2RlbCA9IEBwcmVzZXRNb2RlbHNbQHNlbGVjdGVkSW5kZXhdXG5cbiAgICAgIEBhcHBNb2RlbC5zZXRcbiAgICAgICAgJ2JwbSc6IHNoYXJlZFRyYWNrTW9kZWwuZ2V0ICdicG0nXG4gICAgICAgICdzaGFyZWRUcmFja01vZGVsJzogc2hhcmVkVHJhY2tNb2RlbFxuXG4gICAgICAjIEltcG9ydCBpbnRvIHNlcXVlbmNlclxuICAgICAgQHNlcXVlbmNlci5pbXBvcnRUcmFja1xuICAgICAgICBraXRUeXBlOiBzaGFyZWRUcmFja01vZGVsLmdldCAna2l0VHlwZSdcbiAgICAgICAgaW5zdHJ1bWVudHM6IHNoYXJlZFRyYWNrTW9kZWwuZ2V0ICdpbnN0cnVtZW50cydcbiAgICAgICAgcGF0dGVyblNxdWFyZUdyb3Vwczogc2hhcmVkVHJhY2tNb2RlbC5nZXQgJ3BhdHRlcm5TcXVhcmVHcm91cHMnXG5cbiAgICBlbHNlXG4gICAgICBAYXBwTW9kZWwuc2V0XG4gICAgICAgICdicG0nOiAxMjBcbiAgICAgICAgJ3NoYXJlZFRyYWNrTW9kZWwnOiBudWxsXG5cbiAgICAgIEBzZXF1ZW5jZXIucmVuZGVyVHJhY2tzKClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TZWxlY3RvclxuIiwiIyMjKlxuICogUGxheSAvIFBhdXNlIGJ1dHRvbiB0b2dnbGVcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wbGF5LXBhdXNlLXRlbXBsYXRlLmhicydcblxuY2xhc3MgUGxheVBhdXNlQnRuIGV4dGVuZHMgVmlld1xuXG4gIGNsYXNzTmFtZTogJ2J0bi1wbGF5LXBhdXNlJ1xuICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuICBldmVudHM6XG4gICAgJ21vdXNlb3ZlciAuYnRuLXBsYXknOiAnb25Nb3VzZU92ZXInXG4gICAgJ21vdXNlb3ZlciAuYnRuLXBhdXNlJzogJ29uTW91c2VPdmVyJ1xuICAgICdtb3VzZW91dCAuYnRuLXBsYXknOiAnb25Nb3VzZU91dCdcbiAgICAnbW91c2VvdXQgLmJ0bi1wYXVzZSc6ICdvbk1vdXNlT3V0J1xuICAgICd0b3VjaGVuZCc6ICdvbkNsaWNrJ1xuXG5cbiAgIyBSZW5kZXIgdGhlIHZpZXdcblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEAkcGxheUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1wbGF5J1xuICAgIEAkcGF1c2VCdG4gPSBAJGVsLmZpbmQgJy5idG4tcGF1c2UnXG4gICAgQCRsYWJlbCA9IEAkZWwuZmluZCAnLmxhYmVsLWJ0bidcblxuICAgIFR3ZWVuTGl0ZS5zZXQgQCRwbGF5QnRuLCBhdXRvQWxwaGE6IDBcbiAgICBAXG5cblxuICAjIEFkZCBldmVudCBsaXN0ZW5lcnNcblxuICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfUExBWUlORywgQG9uUGxheUNoYW5nZVxuXG5cbiAgIyBIYW5kbGVyIGZvciBwbGF5aW5nIG1vZGVsIGNoYW5nZSBldmVudHNcbiAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gIG9uUGxheUNoYW5nZTogKG1vZGVsKSA9PlxuICAgIHBsYXlpbmcgPSBtb2RlbC5jaGFuZ2VkLnBsYXlpbmdcblxuICAgIGlmIHBsYXlpbmdcbiAgICAgIEBzZXRQbGF5U3RhdGUoKVxuXG4gICAgZWxzZVxuICAgICAgQHNldFBhdXNlU3RhdGUoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBtb3VzZW91dCBldmVudHNcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9XG5cbiAgb25Nb3VzZU92ZXI6IChldmVudCkgPT5cbiAgICByZXR1cm5cbiAgICAkdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KVxuXG4gICAgVHdlZW5MaXRlLnRvICR0YXJnZXQsIC4yLFxuICAgICAgY29sb3I6ICdibGFjaydcblxuXG4gICMgSGFuZGxlciBmb3IgbW91c2VvdXQgZXZlbnRzXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fVxuXG4gIG9uTW91c2VPdXQ6IChldmVudCkgPT5cbiAgICByZXR1cm5cbiAgICAkdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KVxuXG4gICAgVHdlZW5MaXRlLnRvICR0YXJnZXQsIC4yLFxuICAgICAgY29sb3I6ICcjRTQxRTJCJ1xuXG5cbiAgIyBIYW5kbGVyIGZvciBjbGljayBldmVudHMuICBGYWRlcyB0aGUgdm9sdW1lIHVwIG9yIGRvd24gYW5kXG4gICMgc3RvcHMgb3Igc3RhcnRzIHBsYXliYWNrXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uQ2xpY2s6IChldmVudCkgPT5cbiAgICBkb1BsYXkgPSAhIEBhcHBNb2RlbC5nZXQoJ3BsYXlpbmcnKVxuICAgIHZvbHVtZSA9IGlmIGRvUGxheSBpcyB0cnVlIHRoZW4gMSBlbHNlIDBcbiAgICBvYmogPSB2b2x1bWU6IGlmIHZvbHVtZSBpcyAxIHRoZW4gMCBlbHNlIDFcblxuICAgIFR3ZWVuTGl0ZS50byBvYmosIC40LFxuICAgICAgdm9sdW1lOiB2b2x1bWVcblxuICAgICAgb25VcGRhdGU6ID0+XG4gICAgICAgIGNyZWF0ZWpzLlNvdW5kLnNldFZvbHVtZSBvYmoudm9sdW1lXG5cbiAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgIGlmIGRvUGxheSBpcyBmYWxzZVxuICAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ3BsYXlpbmcnLCBkb1BsYXlcblxuICAgIGlmIGRvUGxheSBpcyB0cnVlXG4gICAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgZG9QbGF5XG5cbiAgICAjIFNldCB2aXN1YWwgc3RhdGUgaW1tZWRpYXRlbHkgc28gdGhlcmUncyBubyBsYWdcbiAgICBlbHNlXG4gICAgICBAc2V0UGF1c2VTdGF0ZSgpXG5cblxuICAjIFNldCB2aXN1YWwgc3RhdGUgb2YgcGxheSBwYXVzZSBidG5cblxuICBzZXRQbGF5U3RhdGU6IC0+XG4gICAgVHdlZW5MaXRlLnNldCBAJHBsYXlCdG4sIGF1dG9BbHBoYTogMFxuICAgIFR3ZWVuTGl0ZS5zZXQgQCRwYXVzZUJ0biwgYXV0b0FscGhhOiAxXG4gICAgQCRsYWJlbC50ZXh0ICdQQVVTRSdcblxuXG4gICMgU2V0IHZpc3VhbCBzdGF0ZSBvZiBwbGF5IHBhdXNlIGJ0blxuXG4gIHNldFBhdXNlU3RhdGU6IC0+XG4gICAgVHdlZW5MaXRlLnNldCBAJHBsYXlCdG4sIGF1dG9BbHBoYTogMVxuICAgIFR3ZWVuTGl0ZS5zZXQgQCRwYXVzZUJ0biwgYXV0b0FscGhhOiAwXG4gICAgQCRsYWJlbC50ZXh0ICdQTEFZJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheVBhdXNlQnRuXG4iLCIjIyMqXG4gKiBLaXQgLyBQYWQgdG9nZ2xlIGJ1dHRvbi5cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy90b2dnbGUtdGVtcGxhdGUuaGJzJ1xuXG5jbGFzcyBUb2dnbGUgZXh0ZW5kcyBWaWV3XG5cbiAgY2xhc3NOYW1lOiAndG9nZ2xlJ1xuICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuICBldmVudHM6XG4gICAgJ3RvdWNoZW5kIC5idG4tc3RlcHMnOiAnb25TdGVwc0J0bkNsaWNrJ1xuICAgICd0b3VjaGVuZCAuYnRuLXBhZHMnOiAnb25QYWRCdG5DbGljaydcblxuXG4gIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgQCRzdGVwc0J0biA9IEAkZWwuZmluZCAnLmJ0bi1zdGVwcydcbiAgICBAJHBhZEJ0biA9IEAkZWwuZmluZCAnLmJ0bi1wYWRzJ1xuICAgIEBcblxuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgIEBhcHBNb2RlbC5vbiAnY2hhbmdlOnNob3dTZXF1ZW5jZXInLCBAb25TaG93U2VxdWVuY2VyQ2hhbmdlXG5cblxuICBvblN0ZXBzQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICBAYXBwTW9kZWwuc2V0XG4gICAgICAnc2hvd1NlcXVlbmNlcic6IHRydWVcblxuXG4gIG9uUGFkQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICBAYXBwTW9kZWwuc2V0XG4gICAgICAnc2hvd1NlcXVlbmNlcic6IGZhbHNlXG5cblxuICBvblNob3dTZXF1ZW5jZXJDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICBpZiBtb2RlbC5jaGFuZ2VkLnNob3dTZXF1ZW5jZXJcbiAgICAgIEAkc3RlcHNCdG4uYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgQCRwYWRCdG4ucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuXG4gICAgIyBTaG93IHBhZFxuICAgIGVsc2VcbiAgICAgIEAkc3RlcHNCdG4ucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgQCRwYWRCdG4uYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVG9nZ2xlXG4iLCIjIyMqXG4gKiBTb3VuZCB0eXBlIHNlbGVjdG9yIGZvciBjaG9vc2luZyB3aGljaCBzb3VuZCBzaG91bGRcbiAqIHBsYXkgb24gZWFjaCB0cmFja1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXRlbXBsYXRlLmhicydcblxuY2xhc3MgSW5zdHJ1bWVudCBleHRlbmRzIFZpZXdcblxuICAjIFRoZSB2aWV3IGNsYXNzXG4gICMgQHR5cGUge1N0cmluZ31cblxuICBjbGFzc05hbWU6ICdpbnN0cnVtZW50J1xuXG4gICMgVmlldyB0ZW1wbGF0ZVxuICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuICAjIFJlZiB0byB0aGUgSW5zdHJ1bWVudE1vZGVsXG4gICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cblxuICBtb2RlbDogbnVsbFxuXG4gICMgUmVmIHRvIHRoZSBwYXJlbnQga2l0XG4gICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gIGtpdE1vZGVsOiBudWxsXG5cblxuICBldmVudHM6XG4gICAgJ3RvdWNoZW5kJzogJ29uQ2xpY2snXG5cblxuICAjIEhhbmRsZXIgZm9yIGNsaWNrIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGN1cnJlbnQgaW5zdHJ1bWVudCBtb2RlbCwgd2hpY2hcbiAgIyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCBsaXN0ZW5zIHRvLCBhbmQgYWRkcyBhIHNlbGVjdGVkIHN0YXRlXG4gICMgQHBhcmFtIHtFdmVudH1cblxuICBvbkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgQGtpdE1vZGVsLnNldCAnY3VycmVudEluc3RydW1lbnQnLCBAbW9kZWxcbiAgICBAJGVsLmFkZENsYXNzICdzZWxlY3RlZCdcblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50XG4iLCIjIyMqXG4gKiBQYW5lbCB3aGljaCBob3VzZXMgZWFjaCBpbmRpdmlkdWFsIHNlbGVjdGFibGUgc291bmRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5JbnN0cnVtZW50ID0gcmVxdWlyZSAnLi9JbnN0cnVtZW50LmNvZmZlZSdcbnRlbXBsYXRlICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXBhbmVsLXRlbXBsYXRlLmhicydcblxuY2xhc3MgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgZXh0ZW5kcyBWaWV3XG5cbiAgIyBWaWV3IHRlbXBsYXRlXG4gICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG4gICMgUmVmIHRvIHRoZSBhcHBsaWNhdGlvbiBtb2RlbFxuICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICBhcHBNb2RlbDogbnVsbFxuXG4gICMgUmVmIHRvIGtpdCBjb2xsZWN0aW9uXG4gICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gIGtpdENvbGxlY3Rpb246IG51bGxcblxuICAjIFJlZiB0byB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGtpdFxuICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICBraXRNb2RlbDogbnVsbFxuXG4gICMgUmVmIHRvIGluc3RydW1lbnQgdmlld3NcbiAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgaW5zdHJ1bWVudFZpZXdzOiBudWxsXG5cbiAgIyBJbml0aWFsaXplcyB0aGUgaW5zdHJ1bWVudCBzZWxlY3RvciBhbmQgc2V0cyBhIGxvY2FsIHJlZlxuICAjIHRvIHRoZSBjdXJyZW50IGtpdCBtb2RlbCBmb3IgZWFzeSBhY2Nlc3NcbiAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEBraXRNb2RlbCA9IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJylcblxuXG4gICMgUmVuZGVycyB0aGUgdmlldyBhcyB3ZWxsIGFzIHRoZSBhc3NvY2lhdGVkIGtpdCBpbnN0cnVtZW50c1xuICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG5cbiAgICBAJGNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmluc3RydW1lbnRzJ1xuICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgQFxuXG5cbiAgIyBSZW5kZXJzIGVhY2ggaW5kaXZpZHVhbCBraXQgbW9kZWwgaW50byBhbiBJbnN0cnVtZW50XG5cbiAgcmVuZGVySW5zdHJ1bWVudHM6IC0+XG4gICAgQGluc3RydW1lbnRWaWV3cyA9IFtdXG5cbiAgICBAa2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgaW5zdHJ1bWVudCA9IG5ldyBJbnN0cnVtZW50XG4gICAgICAgIGtpdE1vZGVsOiBAa2l0TW9kZWxcbiAgICAgICAgbW9kZWw6IG1vZGVsXG5cbiAgICAgIEAkY29udGFpbmVyLmFwcGVuZCBpbnN0cnVtZW50LnJlbmRlcigpLmVsXG4gICAgICBAaW5zdHJ1bWVudFZpZXdzLnB1c2ggaW5zdHJ1bWVudFxuXG5cbiAgIyBBZGRzIGV2ZW50IGxpc3RlbmVycyByZWxhdGVkIHRvIGtpdCBjaGFuZ2VzXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uS2l0Q2hhbmdlXG4gICAgQGxpc3RlblRvIEBraXRNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0lOU1RSVU1FTlQsIEBvbkluc3RydW1lbnRDaGFuZ2VcblxuXG4gICMgUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnNcblxuICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICBAc3RvcExpc3RlbmluZygpXG5cblxuICAjIEV2ZW50IExpc3RlbmVyc1xuICAjIC0tLS0tLS0tLS0tLS0tLVxuXG4gICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBDbGVhbnMgdXAgdGhlIHZpZXcgYW5kIHJlLXJlbmRlcnNcbiAgIyB0aGUgaW5zdHJ1bWVudHMgdG8gdGhlIERPTVxuICAjIEBwYXJhbSB7S2l0TW9kZWx9IG1vZGVsXG5cbiAgb25LaXRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuXG4gICAgQGtpdE1vZGVsID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbFxuXG4gICAgXy5lYWNoIEBpbnN0cnVtZW50Vmlld3MsIChpbnN0cnVtZW50KSAtPlxuICAgICAgaW5zdHJ1bWVudC5yZW1vdmUoKVxuXG4gICAgQHJlbmRlckluc3RydW1lbnRzKClcbiAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cbiAgb25JbnN0cnVtZW50Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgQCRjb250YWluZXIuZmluZCgnLmluc3RydW1lbnQnKS5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG5cblxuICBvblRlc3RDbGljazogKGV2ZW50KSAtPlxuICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCJcXG48ZGl2IGNsYXNzPSdjb250YWluZXItaW5zdHJ1bWVudHMnPlxcblxcblx0PGRpdiBjbGFzcz0nbGFiZWwnPlxcblx0XHREUlVNIFBBVFRFUk4gRURJVE9SXFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9J2luc3RydW1lbnRzJz5cXG5cXG5cdDwvZGl2PlxcblxcbjwvZGl2PlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPSdpY29uIFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5pY29uKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5pY29uOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiJz48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCIjIyMqXG4gKiBMaXZlIE1QQyBcInBhZFwiIGNvbXBvbmVudFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbkFwcEV2ZW50ICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuUHViRXZlbnQgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5QYWRTcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhZFNxdWFyZU1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvcGFkL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSdcblZpZXcgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5QYWRTcXVhcmUgICAgICAgICAgID0gcmVxdWlyZSAnLi9QYWRTcXVhcmUuY29mZmVlJ1xuUGxheVBhdXNlQnRuICAgICAgICA9IHJlcXVpcmUgJy4uL1BsYXlQYXVzZUJ0bi5jb2ZmZWUnXG5wYWRzVGVtcGxhdGUgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGFkcy10ZW1wbGF0ZS5oYnMnXG5pbnN0cnVtZW50c1RlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvaW5zdHJ1bWVudHMtdGVtcGxhdGUuaGJzJ1xudGVtcGxhdGUgICAgICAgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2xpdmUtcGFkLXRlbXBsYXRlLmhicydcblxuY2xhc3MgTGl2ZVBhZCBleHRlbmRzIFZpZXdcblxuICAjIEtleSBjb21tYW5kIGtleW1hcCBmb3IgbGl2ZSBraXQgcGxheWJhY2tcbiAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgS0VZTUFQOiBbJzEnLCcyJywnMycsJzQnLCdxJywgJ3cnLCAnZScsICdyJywgJ2EnLCAncycsICdkJywgJ2YnLCAneicsICd4JywgJ2MnLCAndiddXG5cbiAgIyBUaGUgY2xhc3NuYW1lIGZvciB0aGUgTGl2ZSBQYWRcbiAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gIGNsYXNzTmFtZTogJ2NvbnRhaW5lci1saXZlLXBhZCdcblxuICAjIFRoZSB0ZW1wbGF0ZVxuICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuICAjIEFwcG1vZGVsIGZvciBsaXN0ZW5pbmcgdG8gc2hvdyAvIGhpZGUgZXZlbnRzXG4gICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gIGFwcE1vZGVsOiBudWxsXG5cbiAgIyBDb2xsZWN0aW9uIG9mIGtpdHMgdG8gYmUgcmVuZGVyZWQgdG8gdGhlIGluc3RydW1lbnQgY29udGFpbmVyXG4gICMgQHR5cGUge0tpdENvbGxlY3Rpb259XG5cbiAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG4gICMgQ29sbGVjdGlvbiBvZiBpbnN0cnVtZW50cy4gIFVzZWQgdG8gbGlzdGVuIHRvIGBkcm9wcGVkYCBzdGF0dXNcbiAgIyBvbiBpbmRpdmlkdWFsIGluc3RydW1lbnQgbW9kZWxzLCBhcyBzZXQgZnJvbSB0aGUgUGFkU3F1YXJlXG4gICMgQHR5cGUge0luc3RydW1lbnRDb2xsZWN0aW9ufVxuXG4gIGluc3RydW1lbnRDb2xsZWN0aW9uOiBudWxsXG5cbiAgIyBDb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgcGFkIHNxdWFyZSBtb2RlbHNcbiAgIyBAdHlwZSB7UGFkU3F1YXJlQ29sbGVjdGlvbn1cblxuICBwYWRTcXVhcmVDb2xsZWN0aW9uOiBudWxsXG5cbiAgIyBBbiBhcnJheSBvZiBpbmRpdmlkdWFsIFBhZFNxdWFyZVZpZXdzXG4gICMgQHR5cGUge0FycmF5fVxuXG4gIHBhZFNxdWFyZVZpZXdzOiBudWxsXG5cbiAgIyBNb3VzZSB0cmFja2VyIHdoaWNoIGNvbnN0YW50bHkgdXBkYXRlcyBtb3VzZSAvIHRvdWNoIHBvc2l0aW9uIHZpYSAueCBhbmQgLnlcbiAgIyBAdHlwZSB7T2JqZWN0fVxuXG4gIG1vdXNlUG9zaXRpb246IHg6IDAsIHk6IDBcblxuICBldmVudHM6XG4gICAgJ3RvdWNoZW5kIC5idG4tZWRpdCc6ICdvbkVkaXRCdG5DbGljaydcbiAgICAndG91Y2hlbmQgLnRhYic6ICdvblRhYkNsaWNrJ1xuICAgICd0b3VjaHN0YXJ0IC5idG4tYmFjayc6ICdvbkJhY2tCdG5QcmVzcycgIyBNb2JpbGUgb25seVxuICAgICd0b3VjaGVuZCAuYnRuLWJhY2snOiAnb25CYWNrQnRuQ2xpY2snICMgTW9iaWxlIG9ubHlcblxuXG4gICMgUmVuZGVyIHRoZSB2aWV3IGFuZCBhbmQgcGFyc2UgdGhlIGNvbGxlY3Rpb24gaW50byBhIGRpc3BsYXlhYmxlXG4gICMgaW5zdHJ1bWVudCAvIHBhZCB0YWJsZVxuICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICMgQHJldHVybiB7TGl2ZVBhZH1cblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEAkcGFkc0NvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1wYWRzJ1xuICAgIEAkaW5zdHJ1bWVudHNDb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItaW5zdHJ1bWVudHMnXG5cbiAgICBAcmVuZGVyUGFkcygpXG4gICAgQHJlbmRlckluc3RydW1lbnRzKClcblxuICAgICMgUmVuZGVyIHNxdWFyZXMgdG8gdGhlIERPTVxuICAgIF8uZWFjaCBAcGFkU3F1YXJlVmlld3MsIChwYWRTcXVhcmUpID0+XG4gICAgICBpZCA9IHBhZFNxdWFyZS5tb2RlbC5nZXQgJ2lkJ1xuICAgICAgQCRlbC5maW5kKFwiIyN7aWR9XCIpLmh0bWwgcGFkU3F1YXJlLnJlbmRlcigpLmVsXG5cblxuICAgICMgU2V0dXAgbW9iaWxlIGxheW91dFxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgQHBsYXlQYXVzZUJ0biA9IG5ldyBQbGF5UGF1c2VCdG5cbiAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAJHBsYXlQYXVzZUNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1wbGF5LXBhdXNlJ1xuICAgICAgQCRwbGF5TGFiZWwgPSBAJHBsYXlQYXVzZUNvbnRhaW5lci5maW5kICcubGFiZWwtYnRuJ1xuICAgICAgQCRpbnN0cnVjdGlvbnMgPSBAJGVsLmZpbmQgJy5pbnN0cnVjdGlvbnMnXG4gICAgICBAJHRhYnMgPSBAJGVsLmZpbmQgJy50YWInXG4gICAgICBAJGtpdHMgPSBAJGVsLmZpbmQgJy5jb250YWluZXIta2l0J1xuXG4gICAgICBAJHBsYXlQYXVzZUNvbnRhaW5lci5odG1sIEBwbGF5UGF1c2VCdG4ucmVuZGVyKCkuZWxcbiAgICAgIEAkcGxheUxhYmVsLnRleHQgJ1BBVVNFIFNFUVVFTkNFJ1xuXG4gICAgICBfLmRlbGF5ID0+XG4gICAgICAgICQoQCR0YWJzWzBdKS50cmlnZ2VyICd0b3VjaGVuZCdcbiAgICAgICwgMTAwXG5cbiAgICBAaW5pdERyYWdBbmREcm9wKClcbiAgICBAXG5cblxuICByZW1vdmU6IChvcHRpb25zKSAtPlxuICAgIF8uZWFjaCBAcGFkU3F1YXJlVmlld3MsICh2aWV3KSA9PlxuICAgICAgdmlldy5yZW1vdmUoKVxuXG4gICAgQCRwYWRzQ29udGFpbmVyLnJlbW92ZSgpXG4gICAgc3VwZXIoKVxuXG5cbiAgIyBBZGQgY29sbGVjdGlvbiBsaXN0ZW5lcnMgdG8gbGlzdGVuIGZvciBpbnN0cnVtZW50IGRyb3BzXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgJChkb2N1bWVudCkub24gJ21vdXNlbW92ZScsIEBvbk1vdXNlTW92ZVxuXG4gICAgIyBTZXR1cCBsaXZlcGFkIGtleXNcbiAgICBfLmVhY2ggQEtFWU1BUCwgKGtleSkgPT5cbiAgICAgICQoZG9jdW1lbnQpLm9uICdrZXlkb3duJywgbnVsbCwga2V5LCBAb25LZXlQcmVzc1xuXG5cbiAgIyBSZW1vdmVzIGV2ZW50IGxpc3RlbmVyc1xuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICQoZG9jdW1lbnQpLm9mZiAnbW91c2Vtb3ZlJywgQG9uTW91c2VNb3ZlXG5cbiAgICAjIFJlbW92ZSBsaXZlcGFkIGtleXNcbiAgICBfLmVhY2ggQEtFWU1BUCwgKGtleSkgPT5cbiAgICAgICQoZG9jdW1lbnQpLm9mZiAna2V5ZG93bicsIG51bGwsIGtleSwgQG9uS2V5UHJlc3NcblxuICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG4gICMgUmVuZGVycyBvdXQgdGhlIGluc3RydW1lbnQgcGFkIHNxdWFyZXNcblxuICByZW5kZXJQYWRzOiAtPlxuICAgIEAkcGFkc0NvbnRhaW5lci5odG1sIHBhZHNUZW1wbGF0ZSB7XG4gICAgICBwYWRUYWJsZTogQHJldHVyblBhZFRhYmxlRGF0YSgpXG4gICAgICBpc0Rlc2t0b3A6ICEgQGlzTW9iaWxlXG4gICAgfVxuXG5cbiAgIyBSZW5kZXJzIG91dCB0aGUgaW5zdHJ1bWVudCByYWNrcyBieSBpdGVyYXRpbmcgdGhyb3VnaFxuICAjIGVhY2ggb2YgdGhlIGluc3RydW1lbnQgc2V0cyBpbiB0aGUgS2l0Q29sbGVjdGlvblxuXG4gIHJlbmRlckluc3RydW1lbnRzOiAtPlxuICAgIEAkaW5zdHJ1bWVudHNDb250YWluZXIuaHRtbCBpbnN0cnVtZW50c1RlbXBsYXRlIHtcbiAgICAgIGluc3RydW1lbnRUYWJsZTogQHJldHVybkluc3RydW1lbnRUYWJsZURhdGEoKVxuICAgICAgaXNEZXNrdG9wOiAhIEBpc01vYmlsZVxuICAgIH1cblxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgQCRraXRzID0gQCRlbC5maW5kICcuY29udGFpbmVyLWtpdCdcbiAgICAgIEAkdGFicyA9IEAkZWwuZmluZCAnLnRhYidcblxuXG4gICMgQ2xlYXJzIHRoZSBsaXZlIHBhZCBvZiBhbGwgYXNzaWduZWQgaW5zdHJ1bWVudHNcblxuICBjbGVhckxpdmVQYWQ6IC0+XG5cbiAgICAjIEl0ZXJhdGUgb3ZlciBhcHAgcGFkIHNxdWFyZXNcbiAgICBfLmVhY2ggQHBhZFNxdWFyZVZpZXdzLCAocGFkU3F1YXJlLCBpbmRleCkgPT5cblxuICAgICAgIyBPbmx5IG1vZGlmeSBwYWQgc3F1YXJlcyB3aGljaCBoYXZlIGEgZHJvcHBlZCBpbnN0cnVtZW50XG4gICAgICBpZiBwYWRTcXVhcmUubW9kZWwuZ2V0KCdjdXJyZW50SW5zdHJ1bWVudCcpXG4gICAgICAgIHBhZFNxdWFyZS5tb2RlbC5zZXQgJ2Ryb3BwZWQnLCBmYWxzZVxuICAgICAgICBwYWRTcXVhcmUubW9kZWwuZ2V0KCdjdXJyZW50SW5zdHJ1bWVudCcpLnNldCAnZHJvcHBlZCcsIGZhbHNlXG4gICAgICAgIHBhZFNxdWFyZS5tb2RlbC5zZXQgJ2N1cnJlbnRJbnN0cnVtZW50JywgbnVsbFxuICAgICAgICBwYWRTcXVhcmUucmVtb3ZlU291bmRBbmRDbGVhclBhZCgpXG5cbiAgICBAcmVuZGVySW5zdHJ1bWVudHMoKVxuICAgIEBpbml0RHJhZ0FuZERyb3AoKVxuXG5cbiAgIyBFdmVudCBoYW5kbGVyc1xuICAjIC0tLS0tLS0tLS0tLS0tXG5cbiAgb25LZXlQcmVzczogKGV2ZW50KSA9PlxuICAgIGtleSA9IGV2ZW50LmhhbmRsZU9iai5kYXRhXG4gICAgaW5kZXggPSBfLmluZGV4T2YgQEtFWU1BUCwga2V5XG4gICAgQHBhZFNxdWFyZVZpZXdzW2luZGV4XS5vblByZXNzKClcblxuXG4gIG9uRWRpdEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgQCRpbnN0cnVjdGlvbnMuaGlkZSgpXG4gICAgQCRpbnN0cnVtZW50c0NvbnRhaW5lci5zaG93KClcblxuXG4gIG9uVGFiQ2xpY2s6IChldmVudCkgPT5cbiAgICBAJGtpdHMuaGlkZSgpXG4gICAgQCR0YWJzLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcbiAgICAkdGFiID0gJChldmVudC5jdXJyZW50VGFyZ2V0KVxuICAgIEBzZWxlY3RlZEluZGV4ID0gJHRhYi5pbmRleCgpXG5cbiAgICAkdGFiLmFkZENsYXNzICdzZWxlY3RlZCdcbiAgICAkKEAka2l0c1tAc2VsZWN0ZWRJbmRleF0pLnNob3coKVxuXG5cbiAgIyBNb2JpbGUgb25seS4gQWRkIHByZXNzIHN0YXRlIG9uIGJ0blxuICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICBvbkJhY2tCdG5QcmVzczogKGV2ZW50KSA9PlxuICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkuYWRkQ2xhc3MgJ3ByZXNzJ1xuXG5cbiAgIyBNb2JpbGUgb25seS4gVHJpZ2dlciBzZXF1ZW5jZXIgc2hvdyBiYWNrIG9uIENyZWF0ZVZpZXdcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgb25CYWNrQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzICdwcmVzcydcbiAgICBAYXBwTW9kZWwuc2V0ICdzaG93U2VxdWVuY2VyJywgdHJ1ZVxuXG5cbiAgIyBUT0RPOiBVcGRhdGUgbW91c2UgbW92ZSB0byBzdXBwb3J0IHRvdWNoIGV2ZW50c1xuICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICBvbk1vdXNlTW92ZTogKGV2ZW50KSA9PlxuICAgIEBtb3VzZVBvc2l0aW9uID1cbiAgICAgIHg6IGV2ZW50LnBhZ2VYXG4gICAgICB5OiBldmVudC5wYWdlWVxuXG5cbiAgIyBIYW5kbGVyIGZvciBkcm9wIGNoYW5nZSBldmVudHMuICBDaGVja3MgdG8gc2VlIGlmIHRoZSBpbnN0cnVtZW50XG4gICMgY2xhc3NOYW1lIGV4aXN0cyBvbiB0aGUgZWxlbWVudCBhbmQsIGlmIHNvLCByZS1yZW5kZXJzIHRoZVxuICAjIGluc3RydW1lbnQgYW5kIHBhZCB0YWJsZXNcbiAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gaW5zdHJ1bWVudE1vZGVsXG5cbiAgb25Ecm9wcGVkQ2hhbmdlOiAoaW5zdHJ1bWVudE1vZGVsKSA9PlxuICAgIGluc3RydW1lbnRJZCA9IGluc3RydW1lbnRNb2RlbC5nZXQoJ2lkJylcbiAgICAkcGFkU3F1YXJlID0gQCRlbC5maW5kIFwiLiN7aW5zdHJ1bWVudElkfVwiXG4gICAgcGFkU3F1YXJlSWQgPSAkcGFkU3F1YXJlLmF0dHIgJ2lkJ1xuICAgIHBhZFNxdWFyZU1vZGVsID0gQHBhZFNxdWFyZUNvbGxlY3Rpb24uZmluZFdoZXJlIHsgaWQ6IHBhZFNxdWFyZUlkIH1cblxuICAgICMgQ2hlY2tzIGFnYWluc3QgdGVzdHMgYW5kIGRyYWdnYWJsZSwgd2hpY2ggaXMgbGVzcyB0ZXN0YWJsZVxuICAgIHVubGVzcyBwYWRTcXVhcmVNb2RlbCBpcyB1bmRlZmluZWRcbiAgICAgIHBhZFNxdWFyZU1vZGVsLnNldCAnY3VycmVudEluc3RydW1lbnQnLCBpbnN0cnVtZW50TW9kZWxcblxuXG4gICMgSGFuZGxlciBmb3IgcHJlc3MgYW5kIGhvbGQgZXZlbnRzLCBhcyBkaXNwYXRjaGVkIGZyb20gdGhlIHBhZCBzcXVhcmUgdGhlIHVzZXJcbiAgIyBpcyBpbnRlcmFjdGluZyB3aXRoLiAgUmVsZWFzZXMgdGhlIGluc3RydW1lbnQgYW5kIGFsbG93cyB0aGUgdXNlciB0byBkcmFnIHRvXG4gICMgYSBuZXcgc3F1YXJlIG9yIGRlcG9zaXQgaXQgYmFjayB3aXRoaW4gdGhlIGluc3RydW1lbnQgcmFja1xuICAjIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcblxuICBvbkRyYWdnaW5nQ2hhbmdlOiAocGFyYW1zKSA9PlxuICAgIHtpbnN0cnVtZW50SWQsIHBhZFNxdWFyZSwgJHBhZFNxdWFyZSwgZXZlbnR9ID0gcGFyYW1zXG5cbiAgICAkZHJvcHBlZEluc3RydW1lbnQgPSAkKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGluc3RydW1lbnRJZCkpXG5cbiAgICAjIFJldHVybiB0aGUgZHJhZ2dhYmxlIGluc3RhbmNlIGFzc29jaWF0ZWQgd2l0aCB0aGUgcGFkIHNxdWFyZVxuICAgIGRyYWdnYWJsZSA9IF8uZmluZCBAZHJhZ2dhYmxlLCAoZHJhZ2dhYmxlRWxlbWVudCkgPT5cbiAgICAgIGlmICQoZHJhZ2dhYmxlRWxlbWVudC5fZXZlbnRUYXJnZXQpLmF0dHIoJ2lkJykgaXMgJGRyb3BwZWRJbnN0cnVtZW50LmF0dHIoJ2lkJylcbiAgICAgICAgcmV0dXJuIGRyYWdnYWJsZUVsZW1lbnRcblxuICAgICMgU2V0IHRoZSBtb2RlbCB0byBudWxsIHNvIHRoYXQgaXQgY2FuIGJlIHJlYXNzaWduZWRcbiAgICBwYWRTcXVhcmUubW9kZWwuc2V0ICdkcm9wcGVkJywgZmFsc2VcbiAgICBwYWRTcXVhcmUubW9kZWwuc2V0ICdjdXJyZW50SW5zdHJ1bWVudCcsIG51bGxcblxuICAgICMgSWYgbW9iaWxlIG9yIHRhYmxldCwganVzdCBzZW5kIGl0IGJhY2sgdG8gdGhlIGRvY2tcbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIHJlcGVhdCA9IDBcblxuICAgICAgdHdlZW4gPSBUd2VlbkxpdGUudG8gcGFkU3F1YXJlLiRlbCwgLjA1LFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjRTQxRTJCJ1xuXG4gICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgdHdlZW4ucmV2ZXJzZSgpXG5cbiAgICAgICAgICBpZiByZXBlYXQgaXMgMVxuICAgICAgICAgICAgZHJhZ2dhYmxlLmRpc2FibGUoKVxuXG4gICAgICAgIG9uUmV2ZXJzZUNvbXBsZXRlOiA9PlxuICAgICAgICAgIGlmIHJlcGVhdCA8IDFcbiAgICAgICAgICAgIHJlcGVhdCsrXG4gICAgICAgICAgICB0d2Vlbi5yZXN0YXJ0KClcblxuXG4gICAgIyBBbGxvdyB0aGUgdXNlciB0byBjbGljayBhbmQgcmUtYXNzaWduXG4gICAgZWxzZVxuXG4gICAgICAjIFNpbGVudGx5IHVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIGhpZGRlbiBpbnN0cnVtZW50XG4gICAgICAkZHJvcHBlZEluc3RydW1lbnQuY3NzICdwb3NpdGlvbicsICdhYnNvbHV0ZSdcbiAgICAgICRkcm9wcGVkSW5zdHJ1bWVudC5zaG93KClcbiAgICAgIHBvc2l0aW9uID0gJHBhZFNxdWFyZS5wb3NpdGlvbigpXG5cbiAgICAgICMgU2V0IHRoZSBwb3NpdGlvbiBiZWZvcmUgaXQgYXBwZWFyc1xuICAgICAgVHdlZW5MaXRlLnNldCAkZHJvcHBlZEluc3RydW1lbnQsXG4gICAgICAgIHNjYWxlOiAuOFxuICAgICAgICB0b3A6IHBvc2l0aW9uLnRvcCArICgkcGFkU3F1YXJlLmhlaWdodCgpICogLjUpXG4gICAgICAgIGxlZnQ6IHBvc2l0aW9uLmxlZnQgKyAoJHBhZFNxdWFyZS53aWR0aCgpICogLjUpXG5cbiAgICAgICMgU2NhbGUgaXQgdXAgc28gdGhhdCB0aGUgdXNlciBrbm93cyB0aGV5IGNhbiBkcmFnXG4gICAgICBUd2VlbkxpdGUudG8gJGRyb3BwZWRJbnN0cnVtZW50LCAuMixcbiAgICAgICAgc2NhbGU6IDEuMVxuICAgICAgICBjb2xvcjogJyNFNDFFMkInXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuICAgICAgICBvbkNvbXBsZXRlOiAtPlxuICAgICAgICAgIFR3ZWVuTGl0ZS50byAkZHJvcHBlZEluc3RydW1lbnQsIC4yLFxuICAgICAgICAgICAgc2NhbGU6IDFcblxuXG4gICAgIyBSZW5hYmxlIGRyYWdnaW5nXG4gICAgZHJhZ2dhYmxlLmVuYWJsZSgpXG4gICAgZHJhZ2dhYmxlLnVwZGF0ZSgpXG4gICAgZHJhZ2dhYmxlLnN0YXJ0RHJhZyBldmVudFxuXG5cbiAgIyBIYW5kbGVyIGZvciBiZWF0IGV2ZW50cyBvcmlnaW5hdGluZyBmcm9tIHRoZSBQYWRTcXVhcmUuICBJc1xuICAjIHBhc3NlZCBkb3duIHRvIHRoZSBWaXN1YWxpemF0aW9uVmlldyB0byB0cmlnZ2VyIGFuaW1hdGlvblxuICAjIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcblxuICBvbkJlYXQ6IChwYXJhbXMpID0+XG4gICAgQHRyaWdnZXIgUHViRXZlbnQuQkVBVCwgcGFyYW1zXG5cblxuICAjIFByaXZhdGVcbiAgIyAtLS0tLS0tXG5cbiAgIyBTZXRzIHVwIGRyYWcgYW5kIGRyb3Agb24gZWFjaCBvZiB0aGUgaW5zdHJ1bWVudHMgcmVuZGVyZWQgZnJvbSB0aGUgS2l0Q29sbGVjdGlvblxuICAjIEFkZHMgaGlnaGxpZ2h0cyBhbmQgZGV0ZXJtaW5lcyBoaXQtdGVzdHMsIG9yIGRlZmVycyB0byByZXR1cm5JbnN0cnVtZW50VG9Eb2NrXG4gICMgaW4gc2l0dWF0aW9ucyB3aGVyZSBkcm9wcGluZyBpc24ndCBwb3NzaWJsZVxuXG4gIGluaXREcmFnQW5kRHJvcDogLT5cbiAgICBzZWxmID0gQFxuXG4gICAgQCRpbnN0cnVtZW50ID0gQCRlbC5maW5kICcuaW5zdHJ1bWVudCdcbiAgICAkZHJvcHBhYmxlcyA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1wYWQnXG5cbiAgICBAZHJhZ2dhYmxlID0gRHJhZ2dhYmxlLmNyZWF0ZSBAJGluc3RydW1lbnQsXG5cbiAgICAgICMgSGFuZGxlciBmb3IgZHJhZyBldmVudHMuICBJdGVyYXRlcyBvdmVyIGFsbCBkcm9wcGFibGUgc3F1YXJlIGFyZWFzXG4gICAgICAjIGFuZCBjaGVja3MgdG8gc2VlIGlmIGFuIGluc3RydW1lbnQgY3VycmVudGx5IG9jY3VwaWVzIHRoZSBwb3NpdGlvblxuXG4gICAgICBvbkRyYWc6IChldmVudCkgLT5cblxuICAgICAgICBpID0gJGRyb3BwYWJsZXMubGVuZ3RoXG5cbiAgICAgICAgd2hpbGUoIC0taSA+IC0xIClcblxuICAgICAgICAgIGlmIEBoaXRUZXN0KCRkcm9wcGFibGVzW2ldLCAnNTAlJylcblxuICAgICAgICAgICAgaW5zdHJ1bWVudCA9ICQoJGRyb3BwYWJsZXNbaV0pLmF0dHIoJ2RhdGEtaW5zdHJ1bWVudCcpXG5cbiAgICAgICAgICAgICMgUHJldmVudCBkcm9wcGFibGVzIG9uIHNxdWFyZXMgdGhhdCBhbHJlYWR5IGhhdmUgaW5zdHJ1bWVudHNcbiAgICAgICAgICAgIGlmIGluc3RydW1lbnQgaXMgbnVsbCBvciBpbnN0cnVtZW50IGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICBUd2VlbkxpdGUudG8gc2VsZi5wYWRTcXVhcmVWaWV3c1tpXS4kYm9yZGVyLCAuMixcbiAgICAgICAgICAgICAgICBhdXRvQWxwaGE6IDFcblxuICAgICAgICAgICMgUmVtb3ZlIGlmIG5vdCBvdmVyIHNxdWFyZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIFR3ZWVuTGl0ZS50byBzZWxmLnBhZFNxdWFyZVZpZXdzW2ldLiRib3JkZXIsIC4yLFxuICAgICAgICAgICAgICBhdXRvQWxwaGE6IDBcblxuXG4gICAgICAjIENoZWNrIHRvIHNlZSBpZiBpbnN0cnVtZW50IGlzIGRyb3BwYWJsZTsgb3RoZXJ3aXNlXG4gICAgICAjIHRyaWdnZXIgYSBcImNhbnQgZHJvcFwiIGFuaW1hdGlvblxuXG4gICAgICBvbkRyYWdFbmQ6IChldmVudCkgLT5cbiAgICAgICAgaSA9ICRkcm9wcGFibGVzLmxlbmd0aFxuXG4gICAgICAgIGRyb3BwZWRQcm9wZXJseSA9IGZhbHNlXG4gICAgICAgICRkcmFnZ2VkID0gbnVsbFxuICAgICAgICAkZHJvcHBlZCA9IG51bGxcblxuICAgICAgICB3aGlsZSggLS1pID4gLTEgKVxuXG4gICAgICAgICAgJGRyYWdnZWQgPSB0aGlzLnRhcmdldFxuICAgICAgICAgICRkcm9wcGVkID0gJGRyb3BwYWJsZXNbaV1cblxuICAgICAgICAgIGlmIEBoaXRUZXN0KCRkcm9wcGFibGVzW2ldLCAnNTAlJylcbiAgICAgICAgICAgIGluc3RydW1lbnQgPSAkKCRkcm9wcGFibGVzW2ldKS5hdHRyKCdkYXRhLWluc3RydW1lbnQnKVxuXG4gICAgICAgICAgICAjIFByZXZlbnQgZHJvcHBhYmxlcyBvbiBzcXVhcmVzIHRoYXQgYWxyZWFkeSBoYXZlIGluc3RydW1lbnRzXG4gICAgICAgICAgICBpZiBpbnN0cnVtZW50IGlzIG51bGwgb3IgaW5zdHJ1bWVudCBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgZHJvcHBlZFByb3Blcmx5ID0gdHJ1ZVxuXG4gICAgICAgICAgICAgICMgU2V0dXAgc291bmQgYW5kIGluaXQgcGFkXG4gICAgICAgICAgICAgIHNlbGYuZHJvcEluc3RydW1lbnQoICRkcmFnZ2VkLCAkZHJvcHBlZCwgZXZlbnQgKVxuXG4gICAgICAgICAgICAgICMgSGlkZSBCb3JkZXJcbiAgICAgICAgICAgICAgVHdlZW5MaXRlLnRvIHNlbGYucGFkU3F1YXJlVmlld3NbaV0uJGJvcmRlciwgLjIsXG4gICAgICAgICAgICAgICAgYXV0b0FscGhhOiAwXG5cbiAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgIyBTZW5kIGluc3RydW1lbnQgYmFjayBpZiBvdmVybGFwaW5nIG9uIG90aGVyIHNxdWFyZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBzZWxmLnJldHVybkluc3RydW1lbnRUb0RvY2soICRkcmFnZ2VkLCAkZHJvcHBlZCApXG4gICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgIyBTZW5kIGluc3RydW1lbnQgYmFjayBpZiBvdXQgb2YgYm91bmRzXG4gICAgICAgIGlmIGRyb3BwZWRQcm9wZXJseSBpcyBmYWxzZVxuICAgICAgICAgIHNlbGYucmV0dXJuSW5zdHJ1bWVudFRvRG9jayggJGRyYWdnZWQsICRkcm9wcGVkIClcblxuXG4gICMgSGFuZGxlciBmb3IgZHJvcCBldmVudHMuICBQYXNzZXMgaW4gdGhlIGl0ZW0gZHJhZ2dlZCwgdGhlIGl0ZW0gaXQgd2FzXG4gICMgZHJvcHBlZCB1cG9uLCBhbmQgdGhlIG9yaWdpbmFsIGV2ZW50IHRvIHN0b3JlIGluIG1lbW9yeSBmb3Igd2hlblxuICAjIHRoZSB1c2VyIHdhbnRzIHRvIFwiZGV0YWNoXCIgdGhlIGRyb3BwZWQgaXRlbSBhbmQgbW92ZSBpdCBiYWNrIGludG8gdGhlXG4gICMgaW5zdHJ1bWVudCBxdWV1ZVxuICAjXG4gICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gZHJhZ2dlZFxuICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGRyb3BwZWRcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgZHJvcEluc3RydW1lbnQ6IChkcmFnZ2VkLCBkcm9wcGVkLCBldmVudCkgPT5cbiAgICB7JGRyYWdnZWQsICRkcm9wcGVkLCBpZCwgaW5zdHJ1bWVudE1vZGVsfSA9IEBwYXJzZURyYWdnZWRBbmREcm9wcGVkKCBkcmFnZ2VkLCBkcm9wcGVkIClcblxuICAgICRkcm9wcGVkLmFkZENsYXNzIGlkXG4gICAgJGRyb3BwZWQuYXR0ciAnZGF0YS1pbnN0cnVtZW50JywgXCIje2lkfVwiXG5cbiAgICBpbnN0cnVtZW50TW9kZWwuc2V0XG4gICAgICAnZHJvcHBlZCc6IHRydWVcbiAgICAgICdkcm9wcGVkRXZlbnQnOiBldmVudFxuXG4gICAgXy5kZWZlciA9PlxuICAgICAgQHJlbmRlckluc3RydW1lbnRzKClcbiAgICAgIEBpbml0RHJhZ0FuZERyb3AoKVxuXG4gICAgICAjIEhpZGUgZXZlcnl0aGluZyBhbmQgcmVzZWxlY3QgdGFiXG4gICAgICBpZiBAaXNNb2JpbGVcbiAgICAgICAgQHJlc2VsZWN0TW9iaWxlVGFiKClcblxuXG4gICMgSGFuZGxlciBmb3Igc2l0dWF0aW9ucyB3aGVyZSB0aGUgdXNlciBhdHRlbXB0cyB0byBkcm9wIHRoZSBpbnN0cnVtZW50IGluY29ycmVjdGx5XG4gICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gZHJhZ2dlZFxuICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGRyb3BwZWRcblxuICByZXR1cm5JbnN0cnVtZW50VG9Eb2NrOiAoZHJhZ2dlZCwgZHJvcHBlZCkgPT5cbiAgICB7JGRyYWdnZWQsICRkcm9wcGVkLCBpZCwgaW5zdHJ1bWVudE1vZGVsfSA9IEBwYXJzZURyYWdnZWRBbmREcm9wcGVkKCBkcmFnZ2VkLCBkcm9wcGVkIClcblxuICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICdkcm9wcGVkJzogZmFsc2VcblxuICAgIF8uZGVmZXIgPT5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgICBAaW5pdERyYWdBbmREcm9wKClcblxuICAgICAgaWYgQGlzTW9iaWxlXG4gICAgICAgIEByZXNlbGVjdE1vYmlsZVRhYigpXG5cblxuICAjIEhlbHBlciBtZXRob2QgZm9yIHBhcnNpbmcgdGhlIGRyYWcgYW5kIGRyb3AgZXZlbnQgcmVzcG9uc2VzXG4gICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gZHJhZ2dlZFxuICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGRyb3BwZWRcblxuICBwYXJzZURyYWdnZWRBbmREcm9wcGVkOiAoZHJhZ2dlZCwgZHJvcHBlZCkgPT5cbiAgICAkZHJhZ2dlZCA9ICQoZHJhZ2dlZClcbiAgICAkZHJvcHBlZCA9ICQoZHJvcHBlZClcbiAgICBpZCA9ICRkcmFnZ2VkLmF0dHIgJ2lkJ1xuICAgIGluc3RydW1lbnRNb2RlbCA9IEBraXRDb2xsZWN0aW9uLmZpbmRJbnN0cnVtZW50TW9kZWwgaWRcblxuICAgIHJldHVybiB7XG4gICAgICAkZHJhZ2dlZDogJGRyYWdnZWRcbiAgICAgICRkcm9wcGVkOiAkZHJvcHBlZFxuICAgICAgaWQ6IGlkXG4gICAgICBpbnN0cnVtZW50TW9kZWw6IGluc3RydW1lbnRNb2RlbFxuICAgIH1cblxuXG4gICMgUmVuZGVyIG91dCB0aGUgdGFibGUgZm9yIHRoZSBsaXZlIHBhZCBncmlkIGFuZCBwdXNoXG4gICMgaXQgaW50byBhbiBhcnJheSBvZiB0YWJsZSByb3dzIGFuZCB0ZHNcbiAgIyBAcmV0dXJuIHtPYmplY3R9XG5cbiAgcmV0dXJuUGFkVGFibGVEYXRhOiAtPlxuICAgIEBwYWRTcXVhcmVDb2xsZWN0aW9uID0gbmV3IFBhZFNxdWFyZUNvbGxlY3Rpb24oKVxuICAgIEBwYWRTcXVhcmVWaWV3cyA9IFtdXG4gICAgcGFkVGFibGUgPSB7fVxuICAgIHJvd3MgPSBbXVxuICAgIGl0ZXJhdG9yID0gMFxuXG4gICAgIyBSZW5kZXIgb3V0IHJvd3NcbiAgICBfKDQpLnRpbWVzIChpbmRleCkgPT5cbiAgICAgIHRkcyA9IFtdXG5cbiAgICAgICMgUmVuZGVyIG91dCBjb2x1bW5zXG4gICAgICBfKDQpLnRpbWVzIChpbmRleCkgPT5cblxuICAgICAgICAjIEluc3RhbnRpYXRlIGVhY2ggcGFkIHZpZXcgYW5kIHRpZSB0aGUgaWRcbiAgICAgICAgIyB0byB0aGUgRE9NIGVsZW1lbnRcblxuICAgICAgICBtb2RlbCA9IG5ldyBQYWRTcXVhcmVNb2RlbFxuICAgICAgICAgIGtleWNvZGU6IEBLRVlNQVBbaXRlcmF0b3JdXG4gICAgICAgICAgaW5kZXg6IGl0ZXJhdG9yICsgMVxuXG4gICAgICAgIHBhZFNxdWFyZSA9IG5ldyBQYWRTcXVhcmVcbiAgICAgICAgICBtb2RlbDogbW9kZWxcbiAgICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICAgIEBwYWRTcXVhcmVDb2xsZWN0aW9uLmFkZCBtb2RlbFxuICAgICAgICBAcGFkU3F1YXJlVmlld3MucHVzaCBwYWRTcXVhcmVcbiAgICAgICAgaXRlcmF0b3IrK1xuXG4gICAgICAgICMgQmVnaW4gbGlzdGVuaW5nIHRvIGRyYWcgLyByZWxlYXNlIC8gcmVtb3ZlIGV2ZW50cyBmcm9tXG4gICAgICAgICMgZWFjaCBwYWQgc3F1YXJlIGFuZCByZS1yZW5kZXIgcGFkIHNxdWFyZXNcblxuICAgICAgICBAbGlzdGVuVG8gcGFkU3F1YXJlLCBBcHBFdmVudC5DSEFOR0VfRFJBR0dJTkcsIEBvbkRyYWdnaW5nQ2hhbmdlXG4gICAgICAgIEBsaXN0ZW5UbyBwYWRTcXVhcmUsIFB1YkV2ZW50LkJFQVQsIEBvbkJlYXRcblxuICAgICAgICB0ZHMucHVzaCB7XG4gICAgICAgICAgJ2lkJzogcGFkU3F1YXJlLm1vZGVsLmdldCgnaWQnKVxuICAgICAgICB9XG5cbiAgICAgIHJvd3MucHVzaCB7XG4gICAgICAgICdpZCc6IFwicGFkLXJvdy0je2luZGV4fVwiXG4gICAgICAgICd0ZHMnOiB0ZHNcbiAgICAgIH1cblxuICAgIHBhZFRhYmxlLnJvd3MgPSByb3dzXG4gICAgcGFkVGFibGVcblxuXG4gICMgUmVuZGVyIG91dCB0aGUgaW5zdHJ1bWVudCB0YWJsZSBhbmQgcHVzaCBpdCBpbnRvXG4gICMgYW5kIGFycmF5IG9mIGluZGl2aWR1YWwgaW5zdHJ1bWVudHNcbiAgIyBAcmV0dXJuIHtPYmplY3R9XG5cbiAgcmV0dXJuSW5zdHJ1bWVudFRhYmxlRGF0YTogLT5cbiAgICBpbnN0cnVtZW50VGFibGUgPSBAa2l0Q29sbGVjdGlvbi5tYXAgKGtpdCkgPT5cbiAgICAgIGluc3RydW1lbnRDb2xsZWN0aW9uID0ga2l0LmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICAjIEJlZ2luIGxpc3RlbmluZyB0byBkcm9wIGV2ZW50cyBmb3IgZWFjaCBpbnN0cnVtZW50XG4gICAgICAjIGluIHRoZSBJbnN0cnVtZW50IGNvbGxlY3Rpb25cblxuICAgICAgQGxpc3RlblRvIGluc3RydW1lbnRDb2xsZWN0aW9uLCBBcHBFdmVudC5DSEFOR0VfRFJPUFBFRCwgQG9uRHJvcHBlZENoYW5nZVxuXG4gICAgICBpbnN0cnVtZW50cyA9IGluc3RydW1lbnRDb2xsZWN0aW9uLm1hcCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgICAgaW5zdHJ1bWVudC50b0pTT04oKVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAnbGFiZWwnOiBraXQuZ2V0ICdsYWJlbCdcbiAgICAgICAgJ2ljb24nOiBraXQuZ2V0ICdpY29uJ1xuICAgICAgICAnaW5zdHJ1bWVudHMnOiBpbnN0cnVtZW50c1xuICAgICAgfVxuXG4gICAgaW5zdHJ1bWVudFRhYmxlXG5cblxuICByZXNlbGVjdE1vYmlsZVRhYjogLT5cbiAgICBAJGtpdHMuaGlkZSgpXG4gICAgJChAJGtpdHNbQHNlbGVjdGVkSW5kZXhdKS5zaG93KClcbiAgICAkKEAkdGFic1tAc2VsZWN0ZWRJbmRleF0pLmFkZENsYXNzICdzZWxlY3RlZCdcblxubW9kdWxlLmV4cG9ydHMgPSBMaXZlUGFkXG4iLCIjIyMqXG4gKiBMaXZlIE1QQyBcInBhZFwiIGNvbXBvbmVudFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblB1YkV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYWQtc3F1YXJlLXRlbXBsYXRlLmhicydcblxuY2xhc3MgUGFkU3F1YXJlIGV4dGVuZHMgVmlld1xuXG4gICMgVGhlIGRlbGF5IHRpbWUgYmVmb3JlIGRyYWcgZnVuY3Rpb25hbGl0eSBpcyBpbml0aWFsaXplZFxuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgRFJBR19UUklHR0VSX0RFTEFZOiA2MDBcblxuICAjIFRoZSBjbGFzc25hbWUgZm9yIHRoZSBQYWQgU3F1YXJlXG4gICMgQHR5cGUge1N0cmluZ31cblxuICBjbGFzc05hbWU6ICdwYWQtc3F1YXJlJ1xuXG4gICMgVGhlIHRlbXBsYXRlXG4gICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG4gICMgTW9kZWwgd2hpY2ggdHJhY2tzIHN0YXRlIG9mIHNxdWFyZSBhbmQgaW5zdHJ1bWVudHNcbiAgIyBAdHlwZSB7UGFkU3F1YXJlTW9kZWx9XG5cbiAgbW9kZWw6IG51bGxcblxuICAjIFRoZSBjdXJyZW50IGljb24gY2xhc3MgYXMgYXBwbGllZCB0byB0aGUgc3F1YXJlXG4gICMgQHR5cGUge1N0cmluZ31cblxuICBjdXJyZW50SWNvbjogbnVsbFxuXG4gICMgVGhlIGF1ZGlvIHBsYXliYWNrIGNvbXBvbmVudFxuICAjIEB0eXBlIHtIb3dsfVxuXG4gIGF1ZGlvUGxheWJhY2s6IG51bGxcblxuICBldmVudHM6XG4gICAgJ3RvdWNoc3RhcnQnOiAnb25QcmVzcydcbiAgICAndGFwaG9sZCc6ICdvbkhvbGQnXG5cblxuICAjIFJlbmRlcnMgb3V0IGluZGl2aWR1YWwgcGFkIHNxdWFyZXNcblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEAkYm9yZGVyID0gQCRlbC5maW5kICcuYm9yZGVyLWRhcmsnXG4gICAgQCRrZXljb2RlID0gQCRlbC5maW5kICcua2V5LWNvZGUnXG4gICAgQCRpY29uQ29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLWljb24nXG4gICAgQCRpY29uID0gQCRpY29uQ29udGFpbmVyLmZpbmQgJy5pY29uJ1xuXG4gICAgVHdlZW5MaXRlLnNldCBAJGJvcmRlciwgYXV0b0FscGhhOiAwXG4gICAgVHdlZW5MaXRlLnNldCBAJGtleWNvZGUsIHNjYWxlOiAuN1xuICAgIEBcblxuXG4gICMgUmVtb3ZlcyB0aGUgcGFkIHNxdWFyZSBmcm9tIHRoZSBkb20gYW5kIGNsZWFyc1xuICAjIG91dCBwcmUtc2V0IG9yIHVzZXItc2V0IHByb3BlcnRpZXNcblxuICByZW1vdmU6IC0+XG4gICAgQHJlbW92ZVNvdW5kQW5kQ2xlYXJQYWQoKVxuICAgIHN1cGVyKClcblxuXG4gICMgQWRkIGxpc3RlbmVycyByZWxhdGVkIHRvIGRyYWdnaW5nLCBkcm9wcGluZyBhbmQgY2hhbmdlc1xuICAjIHRvIGluc3RydW1lbnRzLlxuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgIEBsaXN0ZW5UbyBAbW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9UUklHR0VSLCBAb25UcmlnZ2VyQ2hhbmdlXG4gICAgQGxpc3RlblRvIEBtb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0RST1BQRUQsIEBvbkRyb3BwZWRDaGFuZ2VcbiAgICBAbGlzdGVuVG8gQG1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cbiAgIyBVcGRhdGVzIHRoZSB2aXN1YWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIHBhZCBzcXVhcmVcblxuICB1cGRhdGVJbnN0cnVtZW50Q2xhc3M6IC0+XG4gICAgaW5zdHJ1bWVudCA9IEBtb2RlbC5nZXQgJ2N1cnJlbnRJbnN0cnVtZW50J1xuICAgIEBpbnN0cnVtZW50SWQgPSBpbnN0cnVtZW50LmdldCAnaWQnXG4gICAgQCRlbC5wYXJlbnQoKS5hZGRDbGFzcyBAaW5zdHJ1bWVudElkXG5cblxuICAjIFJlbmRlcnMgb3V0IHRoZSBpbml0aWFsIGljb24gYW5kIHNldHMgdGhlIGlzbnRydW1lbnRcblxuICByZW5kZXJJY29uOiAtPlxuICAgIGlmIEAkaWNvbi5oYXNDbGFzcyBAY3VycmVudEljb25cbiAgICAgIEAkaWNvbi5yZW1vdmVDbGFzcyBAY3VycmVudEljb25cblxuICAgIGluc3RydW1lbnQgPSBAbW9kZWwuZ2V0ICdjdXJyZW50SW5zdHJ1bWVudCdcblxuICAgIHVubGVzcyBpbnN0cnVtZW50IGlzIG51bGxcbiAgICAgIEBjdXJyZW50SWNvbiA9IGluc3RydW1lbnQuZ2V0ICdpY29uJ1xuICAgICAgQCRpY29uLmFkZENsYXNzIEBjdXJyZW50SWNvblxuXG5cbiAgIyBTZXRzIHRoZSBjdXJyZW50IHNvdW5kIGFuZCBlbmFibGVzIGF1ZGlvIHBsYXliYWNrXG5cbiAgc2V0U291bmQ6IC0+XG4gICAgaW5zdHJ1bWVudCA9IEBtb2RlbC5nZXQgJ2N1cnJlbnRJbnN0cnVtZW50J1xuXG4gICAgdW5sZXNzIGluc3RydW1lbnQgaXMgbnVsbFxuICAgICAgYXVkaW9TcmMgPSBpbnN0cnVtZW50LmdldCAnc3JjJ1xuXG4gICAgICBAYXVkaW9QbGF5YmFjayA9IGNyZWF0ZWpzLlNvdW5kLmNyZWF0ZUluc3RhbmNlIGF1ZGlvU3JjXG4gICAgICBAYXVkaW9QbGF5YmFjay52b2x1bWUgPSBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5oaWdoXG4gICAgICBAYXVkaW9QbGF5YmFjay5hZGRFdmVudExpc3RlbmVyICdjb21wbGV0ZScsIEBvblNvdW5kRW5kXG5cblxuICAjIFRyaWdnZXJzIGF1ZGlvIHBsYXliYWNrXG5cbiAgcGxheVNvdW5kOiAtPlxuICAgIEBhdWRpb1BsYXliYWNrPy5wbGF5KClcblxuICAgIHVubGVzcyBAaXNNb2JpbGVcblxuICAgICAgIyBNYWtlIHN1cmUgdGhhdCB0aGVyZSdzIGFuIGluc3RydW1lbnQgYXR0YWNoZWRcbiAgICAgICMgdG8gdGhlIHBhZCBiZWZvcmUgdHJpZ2dlcmluZyB0aGUgdmlzdWFsaXphdGlvblxuXG4gICAgICBpZiBAbW9kZWwuZ2V0KCdjdXJyZW50SW5zdHJ1bWVudCcpXG4gICAgICAgIEB0cmlnZ2VyIFB1YkV2ZW50LkJFQVQsIGxpdmVQYWQ6IHRydWVcblxuICAgIEBtb2RlbC5zZXQgJ3RyaWdnZXInLCBmYWxzZVxuXG5cbiAgIyBHZW5lcmljIHJlbW92ZSBhbmQgY2xlYXIgd2hpY2ggaXMgdHJpZ2dlcmVkIHdoZW4gYSB1c2VyXG4gICMgZHJhZ3MgdGhlIGluc3RydW1lbnQgb2ZmIG9mIHRoZSBwYWQgb3IgdGhlIHZpZXcgaXMgZGVzdHJveWVkXG5cbiAgcmVtb3ZlU291bmRBbmRDbGVhclBhZDogLT5cbiAgICBpZiBAbW9kZWwuZ2V0KCdjdXJyZW50SW5zdHJ1bWVudCcpIGlzIG51bGxcbiAgICAgIHJldHVyblxuXG4gICAgQGF1ZGlvUGxheWJhY2sgPSBudWxsXG5cbiAgICBjdXJyZW50SW5zdHJ1bWVudCA9IEBtb2RlbC5nZXQgJ2N1cnJlbnRJbnN0cnVtZW50J1xuXG4gICAgaWQgPSBjdXJyZW50SW5zdHJ1bWVudC5nZXQgJ2lkJ1xuICAgIGljb24gPSBjdXJyZW50SW5zdHJ1bWVudC5nZXQgJ2ljb24nXG5cbiAgICBAJGVsLnBhcmVudCgpLnJlbW92ZUF0dHIgJ2RhdGEtaW5zdHJ1bWVudCdcbiAgICBAJGVsLnBhcmVudCgpLnJlbW92ZUNsYXNzIGlkXG4gICAgQCRlbC5yZW1vdmVDbGFzcyBpZFxuICAgIEAkaWNvbi5yZW1vdmVDbGFzcyBpY29uXG4gICAgQCRpY29uLnRleHQgJydcblxuXG4gICMgRXZlbnQgaGFuZGxlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLVxuXG4gICMgSGFuZGxlciBmb3IgcHJlc3MgZXZlbnRzLCB3aGljaCwgd2hlbiBoZWxkXG4gICMgdHJpZ2dlcnMgYSBcImRyYWdcIiBldmVudCBvbiB0aGUgbW9kZWxcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgb25QcmVzczogKGV2ZW50KSA9PlxuICAgIEBtb2RlbC5zZXQgJ3RyaWdnZXInLCB0cnVlXG5cbiAgICBUd2VlbkxpdGUudG8gQCRlbCwgLjIsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjRTQxRTJCJ1xuXG4gICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICBUd2VlbkxpdGUudG8gQCRlbCwgLjIsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2U1ZTVlNSdcblxuXG4gICMgSGFuZGxlciBmb3IgcmVsZWFzZSBldmVudHMgd2hpY2ggY2xlYXJzXG4gICMgZHJhZyB3aGV0aGVyIGRyYWcgd2FzIGluaXRpYXRlZCBvciBub3RcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgb25SZWxlYXNlOiAoZXZlbnQpID0+XG4gICAgQG1vZGVsLnNldCAnZHJhZ2dpbmcnLCBmYWxzZVxuXG5cbiAgb25Ib2xkOiAoZXZlbnQpID0+XG4gICAgY3VycmVudEluc3RydW1lbnQgPSBAbW9kZWwuZ2V0KCdjdXJyZW50SW5zdHJ1bWVudCcpXG4gICAgaW5zdHJ1bWVudElkID0gQCRlbC5wYXJlbnQoKS5hdHRyICdkYXRhLWluc3RydW1lbnQnXG5cbiAgICBpZiBjdXJyZW50SW5zdHJ1bWVudCBpcyBudWxsIHRoZW4gcmV0dXJuXG5cbiAgICBAbW9kZWwuc2V0ICdkcm9wcGVkJywgZmFsc2VcbiAgICBjdXJyZW50SW5zdHJ1bWVudC5zZXQgJ2Ryb3BwZWQnLCBmYWxzZVxuXG4gICAgIyBEaXNwYXRjaCBkcmFnIHN0YXJ0IGV2ZW50IGJhY2sgdG8gTGl2ZVBhZFxuICAgIEB0cmlnZ2VyIEFwcEV2ZW50LkNIQU5HRV9EUkFHR0lORywge1xuICAgICAgJ2luc3RydW1lbnRJZCc6IGluc3RydW1lbnRJZFxuICAgICAgJ3BhZFNxdWFyZSc6IEBcbiAgICAgICckcGFkU3F1YXJlJzogQCRlbC5wYXJlbnQoKVxuICAgICAgJ2V2ZW50JzogZXZlbnRcbiAgICB9XG5cblxuICAjIEhhbmRsZXIgZm9yIGRyb3AgY2hhbmdlIGV2ZW50cywgd2hpY2ggY2hlY2tzIHRvIHNlZVxuICAjIGlmIGl0cyBiZWVuIGV4dHJhY3RlZCBmcm9tIHRoZSBwYWQgc3F1YXJlIHRvIGJlIGRyb3BwZWRcbiAgIyBiYWNrIGludG8gdGhlIGluc3RydW1lbnQgZ3JvdXBcbiAgIyBAcGFyYW0ge1BhZFNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gIG9uRHJvcHBlZENoYW5nZTogKG1vZGVsKSA9PlxuICAgIGRyb3BwZWQgPSBtb2RlbC5jaGFuZ2VkLmRyb3BwZWRcblxuICAgIGlmIGRyb3BwZWQgaXMgZmFsc2VcbiAgICAgIEByZW1vdmVTb3VuZEFuZENsZWFyUGFkKClcblxuXG4gICMgSGFuZGxlciBmb3IgJ2NoYW5nZTp0cmlnZ2VyJyBldmVudHMsIHdoaWNoIHRyaWdnZXJzXG4gICMgc291bmQgcGxheWJhY2sgd2hpY2ggdGhlbiByZXNldHMgaXQgdG8gZmFsc2Ugb24gY29tcGxldFxuICAjIEBwYXJhbSB7UGFkU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgb25UcmlnZ2VyQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgdHJpZ2dlciA9IG1vZGVsLmNoYW5nZWQudHJpZ2dlclxuXG4gICAgaWYgdHJpZ2dlclxuICAgICAgQHBsYXlTb3VuZCgpXG5cblxuICAjIEhhbmRsZXIgZm9yICdjaGFuZ2U6Y3VycmVudEluc3RydW1lbnQnIGV2ZW50cywgd2hpY2ggdXBkYXRlc1xuICAjIHRoZSBwYWQgc3F1YXJlIHdpdGggdGhlIGFwcHJvcHJpYXRlIGRhdGFcbiAgIyBAcGFyYW0ge1BhZFNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gIG9uSW5zdHJ1bWVudENoYW5nZTogKG1vZGVsKSA9PlxuICAgIGluc3RydW1lbnQgPSBtb2RlbC5jaGFuZ2VkLmN1cnJlbnRJbnN0cnVtZW50XG5cbiAgICB1bmxlc3MgaW5zdHJ1bWVudCBpcyBudWxsIG9yIGluc3RydW1lbnQgaXMgdW5kZWZpbmVkXG4gICAgICBAbW9kZWwuc2V0ICdkcm9wcGVkJywgdHJ1ZVxuICAgICAgQHVwZGF0ZUluc3RydW1lbnRDbGFzcygpXG4gICAgICBAcmVuZGVySWNvbigpXG4gICAgICBAc2V0U291bmQoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBzb3VuZCBlbmQgZXZlbnRzLCB3aGljaCByZXNldHMgdGhlIHNvdW5kIHBsYXliYWNrXG5cbiAgb25Tb3VuZEVuZDogPT5cbiAgICBAbW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZFNxdWFyZVxuIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJoZWFkbGluZVxcXCI+XFxuXHRcdERSQUcgRFJVTSBCRUxPVyBUTyBBU1NJR04gVE8gTkVXIFBBRFxcblx0PC9kaXY+XFxuXFxuXHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaW5zdHJ1bWVudFRhYmxlLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMiwgcHJvZ3JhbTIsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXFxuXFxuXFxuXCJcbiAgICArIFwiXFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0yKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLWtpdCc+XFxuXHRcdFx0PGRpdiBjbGFzcz0na2l0LXR5cGUnPlxcblx0XHRcdFx0PHNwYW4+XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIjwvc3Bhbj5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaW5zdHJ1bWVudHMsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cdFx0PC9kaXY+XFxuXHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblxcblx0XHRcdFx0PGRpdiBjbGFzcz0naW5zdHJ1bWVudCBcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWNvbikgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWNvbjsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmRyb3BwZWQsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSg0LCBwcm9ncmFtNCwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCInIGlkPVxcXCJcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWQpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmlkOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj5cXG5cXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtNChkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIiBoaWRkZW4gXCI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTYoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblxcblx0PGRpdiBjbGFzcz1cXFwiaGVhZGxpbmVcXFwiPlxcblx0XHREUkFHIERSVU0gQkVMT1cgVE8gQVNTSUdOIFRPIE5FVyBQQURcXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz0nY29udGFpbmVyLXRhYnMnPlxcblx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaW5zdHJ1bWVudFRhYmxlLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oNywgcHJvZ3JhbTcsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHQ8L2Rpdj5cXG5cXG5cdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsIGRlcHRoMC5pbnN0cnVtZW50VGFibGUsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSg5LCBwcm9ncmFtOSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTcoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdDxkaXYgY2xhc3M9J3RhYic+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPSdraXQtdHlwZSc+XFxuXHRcdFx0XHRcdDxzcGFuPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI8L3NwYW4+XFxuXHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTkoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8ZGl2IGNsYXNzPSdjb250YWluZXIta2l0Jz5cXG5cXG5cdFx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaW5zdHJ1bWVudHMsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cdFx0PC9kaXY+XFxuXHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlxcblxcblwiXG4gICAgKyBcIlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYucHJvZ3JhbSg2LCBwcm9ncmFtNiwgZGF0YSksZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCI7XG4gIGJ1ZmZlciArPSBcIlxcblxcblx0PGRpdiBjbGFzcz0nd3JhcHBlcic+XFxuXHRcdDxkaXYgY2xhc3M9J2xlZnQtd3JhcHBlcic+XFxuXHRcdFx0PGRpdiBjbGFzcz0nbGVmdCc+XFxuXHRcdFx0XHQ8dGFibGUgY2xhc3M9J2NvbnRhaW5lci1wYWRzJz5cXG5cXG5cdFx0XHRcdDwvdGFibGU+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPSdyaWdodCc+XFxuXHRcdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLWluc3RydW1lbnRzJz5cXG5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cXG5cXG5cIlxuICAgICsgXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblxcblx0PGRpdiBjbGFzcz0nd3JhcHBlcic+XFxuXHRcdDxkaXYgY2xhc3M9J2xlZnQtd3JhcHBlcic+XFxuXHRcdFx0PGRpdiBjbGFzcz0nbGVmdCc+XFxuXHRcdFx0XHQ8dGFibGUgY2xhc3M9J2NvbnRhaW5lci1wYWRzJz5cXG5cXG5cdFx0XHRcdDwvdGFibGU+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdyaWdodCc+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz0ndG9wJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9J2NvbnRhaW5lci1wbGF5LXBhdXNlJz5cXG5cdFx0XHRcdFx0cGxheSBwYXVzZVxcblx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0PC9kaXY+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz0nbWlkZGxlJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9J2NvbnRhaW5lci1pbnN0cnVtZW50cyc+XFxuXFxuXHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPSdib3R0b20nPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwiYnRuLWJhY2sgYnRuXFxcIj4mbHQ7IEJhY2s8L2Rpdj5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlxcblwiXG4gICAgKyBcIlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8ZGl2IGNsYXNzPSdwYWQtbnVtYmVyJz5cXG5cdFx0PHNwYW4gY2xhc3M9J3RleHQnPlxcblx0XHRcdFBBRCBcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaW5kZXgpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmluZGV4OyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHRcdDwvc3Bhbj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz0na2V5LWNvZGUnPlxcblx0XHQ8c3BhbiBjbGFzcz0ndGV4dCc+XFxuXHRcdFx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmtleWNvZGUpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmtleWNvZGU7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdFx0PC9zcGFuPlxcblx0PC9kaXY+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPSdib3JkZXItZGFyaycgLz5cXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmlzRGVza3RvcCwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci1pY29uJz5cXG5cdDxkaXYgY2xhc3M9J2ljb24nPlxcblxcblx0PC9kaXY+XFxuPC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc3RhY2syLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDx0cj5cXG5cdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgZGVwdGgwLnRkcywge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDIsIHByb2dyYW0yLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC90cj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTIoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdDx0ZCBjbGFzcz0nY29udGFpbmVyLXBhZCcgaWQ9XFxcIlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5pZCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWQ7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiPlxcblxcblx0XHRcdDwvdGQ+XFxuXHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgc3RhY2syID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCAoKHN0YWNrMSA9IGRlcHRoMC5wYWRUYWJsZSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5yb3dzKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIiMjIypcbiAqIEluZGl2aWR1YWwgc2VxdWVuY2VyIHRyYWNrc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblB1YlN1YiAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3V0aWxzL1B1YlN1YidcbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuUHViRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYXR0ZXJuLXNxdWFyZS10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmUgZXh0ZW5kcyBWaWV3XG5cbiAgIyBUaGUgY29udGFpbmVyIGNsYXNzbmFtZVxuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgY2xhc3NOYW1lOiAncGF0dGVybi1zcXVhcmUnXG5cbiAgIyBUaGUgRE9NIHRhZyBhbmVtXG4gICMgQHR5cGUge1N0cmluZ31cblxuICB0YWdOYW1lOiAndGQnXG5cbiAgIyBUaGUgdGVtcGxhdGVcbiAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cbiAgIyBUaGUgYXVkaW8gcGxheWJhY2sgaW5zdGFuY2UgKEhvd2xlcilcbiAgIyBAdHlwZSB7SG93bH1cblxuICBhdWRpb1BsYXliYWNrOiBudWxsXG5cbiAgIyBUaGUgbW9kZWwgd2hpY2ggY29udHJvbHMgdm9sdW1lLCBwbGF5YmFjaywgZXRjXG4gICMgQHR5cGUge1BhdHRlcm5TcXVhcmVNb2RlbH1cblxuICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG51bGxcblxuICBldmVudHM6XG4gICAgJ21vdXNlb3Zlcic6ICdvbk1vdXNlT3ZlcidcbiAgICAnbW91c2VvdXQnOiAnb25Nb3VzZU91dCdcbiAgICAndG91Y2hlbmQnOiAnb25DbGljaydcblxuXG4gICMgUmVuZGVycyB0aGUgdmlldyBhbmQgaW5zdGFudGlhdGVzIHRoZSBob3dsZXIgYXVkaW8gZW5naW5lXG4gICMgQHBhdHRlcm5TcXVhcmVNb2RlbCB7T2JqZWN0fSBvcHRpb25zXG5cbiAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG5cbiAgICBAJGJvcmRlciA9IEAkZWwuZmluZCAnLmJvcmRlci1kYXJrJ1xuICAgIEAkaWNvbiA9IEAkZWwuZmluZCAnLmljb24nXG5cbiAgICBUd2VlbkxpdGUuc2V0IEAkYm9yZGVyLCBhdXRvQWxwaGE6IDBcbiAgICBUd2VlbkxpdGUuc2V0IEAkaWNvbiwgYXV0b0FscGhhOiAwLCBzY2FsZTogMFxuXG4gICAgYXVkaW9TcmMgPSAnJ1xuXG4gICAgaWYgQHBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ2luc3RydW1lbnQnKVxuICAgICAgQGF1ZGlvU3JjID0gYXVkaW9TcmMgPSBAcGF0dGVyblNxdWFyZU1vZGVsLmdldCgnaW5zdHJ1bWVudCcpLmdldCAnc3JjJ1xuXG4gICAgIyBUT0RPOiBUZXN0IG1ldGhvZHNcbiAgICAjaWYgd2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZigndGVzdCcpIGlzbnQgLTEgdGhlbiBhdWRpb1NyYyA9ICcnXG5cbiAgICBAYXVkaW9QbGF5YmFjayA9IGNyZWF0ZWpzLlNvdW5kLmNyZWF0ZUluc3RhbmNlIGF1ZGlvU3JjXG4gICAgQGF1ZGlvUGxheWJhY2suYWRkRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnLCBAb25Tb3VuZEVuZFxuICAgIEBcblxuXG4gICMgUmVtb3ZlIHRoZSB2aWV3IGFuZCBkZXN0cm95IHRoZSBhdWRpbyBwbGF5YmFja1xuXG4gIHJlbW92ZTogLT5cbiAgICBAYXVkaW9QbGF5YmFjayA9IG51bGxcbiAgICBzdXBlcigpXG5cblxuICAjIEFkZHMgZXZlbnQgbGlzdGVuZXJzIGFuZCBiZWdpbnMgbGlzdGVuaW5nIGZvciB2ZWxvY2l0eSwgYWN0aXZpdHkgYW5kIHRyaWdnZXJzXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9WRUxPQ0lUWSwgQG9uVmVsb2NpdHlDaGFuZ2VcbiAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0FDVElWRSwgQG9uQWN0aXZlQ2hhbmdlXG4gICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9UUklHR0VSLCBAb25UcmlnZ2VyQ2hhbmdlXG5cblxuICAjIEVuYWJsZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgZW5hYmxlOiAtPlxuICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuZW5hYmxlKClcblxuXG4gICMgRGlzYWJsZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgZGlzYWJsZTogLT5cbiAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmRpc2FibGUoKVxuXG5cbiAgIyBQbGF5YmFjayBhdWRpbyBvbiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgcGxheTogLT5cbiAgICBAYXVkaW9QbGF5YmFjay5wbGF5KClcblxuICAgIHVubGVzcyBAaXNNb2JpbGVcbiAgICAgIEB0cmlnZ2VyIFB1YkV2ZW50LkJFQVQsIHBhdHRlcm5TcXVhcmVNb2RlbDogQHBhdHRlcm5TcXVhcmVNb2RlbC50b0pTT04oKVxuXG4gICAgVHdlZW5MaXRlLnRvIEAkaWNvbiwgLjMsXG4gICAgICBzY2FsZTogMS4yXG4gICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcblxuICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgVHdlZW5MaXRlLnRvIEAkaWNvbiwgLjMsXG4gICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcblxuXG4gICAgVHdlZW5MaXRlLnRvIEAkZWwsIC4yLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiNFNDFFMkJcIlxuXG4gICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICBUd2VlbkxpdGUudG8gQCRlbCwgLjIsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiNFNUU1RTVcIlxuXG5cbiAgIyBFdmVudCBoYW5kbGVyc1xuICAjIC0tLS0tLS0tLS0tLS0tXG5cbiAgb25Nb3VzZU92ZXI6IChldmVudCkgLT5cbiAgICBUd2VlbkxpdGUudG8gQCRib3JkZXIsIC4yLFxuICAgICAgYXV0b0FscGhhOiAuNVxuXG5cbiAgb25Nb3VzZU91dDogKGV2ZW50KSAtPlxuICAgIFR3ZWVuTGl0ZS50byBAJGJvcmRlciwgLjIsXG4gICAgICBhdXRvQWxwaGE6IDBcblxuXG4gICMgSGFuZGxlciBmb3IgY2xpY2sgZXZlbnRzIG9uIHRoZSBhdWRpbyBzcXVhcmUuICBUb2dnbGVzIHRoZVxuICAjIHZvbHVtZSBmcm9tIGxvdyB0byBoaWdoIHRvIG9mZlxuXG4gIG9uQ2xpY2s6IChldmVudCkgLT5cbiAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmN5Y2xlKClcblxuXG4gICMgSGFuZGxlciBmb3IgdmVsb2NpdHkgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIHZpc3VhbCBkaXNwbGF5IGFuZCBzZXRzIHZvbHVtZVxuICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gIG9uVmVsb2NpdHlDaGFuZ2U6IChtb2RlbCkgLT5cblxuICAgIHJlbW92ZUNsYXNzID0gPT5cbiAgICAgIEAkaWNvbi5yZW1vdmVDbGFzcyAndmVsb2NpdHktc29mdCB2ZWxvY2l0eS1tZWRpdW0gdmVsb2NpdHktaGFyZCBwbGF5J1xuXG4gICAgYWRkQ2xhc3MgPSA9PlxuICAgICAgQCRpY29uLmFkZENsYXNzIHZlbG9jaXR5Q2xhc3NcblxuICAgIHZlbG9jaXR5ID0gbW9kZWwuY2hhbmdlZC52ZWxvY2l0eVxuXG4gICAgIyBTZXQgdmlzdWFsIGluZGljYXRvclxuICAgIHZlbG9jaXR5Q2xhc3MgPSBzd2l0Y2ggdmVsb2NpdHlcbiAgICAgIHdoZW4gMSB0aGVuICd2ZWxvY2l0eS1zb2Z0IHBsYXknXG4gICAgICB3aGVuIDIgdGhlbiAndmVsb2NpdHktbWVkaXVtIHBsYXknXG4gICAgICB3aGVuIDMgdGhlbiAndmVsb2NpdHktaGFyZCBwbGF5J1xuICAgICAgZWxzZSAnJ1xuXG4gICAgIyBBbmltYXRlIGluIGlmIHRoZSB1c2VyIGlzIGFkZGluZyBhIHBhdHRlcm5cbiAgICBpZiB2ZWxvY2l0eUNsYXNzIGlzbnQgJydcbiAgICAgIHJlbW92ZUNsYXNzKClcblxuICAgICAgaWYgdmVsb2NpdHlDbGFzcyBpcyAndmVsb2NpdHktc29mdCBwbGF5J1xuICAgICAgICBUd2VlbkxpdGUuc2V0IEAkaWNvbiwgYXV0b0FscGhhOiAwLCBzY2FsZTogMFxuXG4gICAgICByb3RhdGlvbiA9IHN3aXRjaCB2ZWxvY2l0eVxuICAgICAgICB3aGVuIDEgdGhlbiA5MFxuICAgICAgICB3aGVuIDIgdGhlbiAxODBcbiAgICAgICAgd2hlbiAzIHRoZW4gMjcwXG4gICAgICAgIGVsc2UgMFxuXG4gICAgICBUd2VlbkxpdGUudG8gQCRpY29uLCAuMixcbiAgICAgICAgYXV0b0FscGhhOiAxXG4gICAgICAgIHNjYWxlOiAxXG4gICAgICAgIHJvdGF0aW9uOiByb3RhdGlvblxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VPdXRcblxuICAgICAgYWRkQ2xhc3MoKVxuXG4gICAgIyBVc2VyIGlzIHJlbW92aW5nIHRoZSBwYXR0ZXJuLCBhbmltYXRlIG91dFxuICAgIGVsc2VcbiAgICAgIFR3ZWVuTGl0ZS50byBAJGljb24sIC4yLFxuICAgICAgICBzY2FsZTogMFxuICAgICAgICBlYXNlOiBCYWNrLmVhc2VJblxuICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgIFR3ZWVuTGl0ZS5zZXQgQCRpY29uLCByb3RhdGlvbjogMFxuICAgICAgICAgIHJlbW92ZUNsYXNzKClcblxuICAgICMgVHJpZ2dlciBtb3VzZSBvdXQgdG8gaGlkZSBib3JkZXJcbiAgICBAb25Nb3VzZU91dCgpXG5cbiAgICAjIFNldCBhdWRpbyB2b2x1bWVcbiAgICB2b2x1bWUgPSBzd2l0Y2ggdmVsb2NpdHlcbiAgICAgIHdoZW4gMSB0aGVuIEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLmxvd1xuICAgICAgd2hlbiAyIHRoZW4gQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubWVkaXVtXG4gICAgICB3aGVuIDMgdGhlbiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5oaWdoXG4gICAgICBlbHNlICcnXG5cbiAgICBAYXVkaW9QbGF5YmFjay52b2x1bWUgPSB2b2x1bWVcblxuXG4gICMgSGFuZGxlciBmb3IgYWN0aXZpdHkgY2hhbmdlIGV2ZW50cy4gIFdoZW4gaW5hY3RpdmUsIGNoZWNrcyBhZ2FpbnN0IHBsYXliYWNrIGFyZVxuICAjIG5vdCBwZXJmb3JtZWQgYW5kIHRoZSBzcXVhcmUgaXMgc2tpcHBlZC5cbiAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICBvbkFjdGl2ZUNoYW5nZTogKG1vZGVsKSAtPlxuXG5cbiAgIyBIYW5kbGVyIGZvciB0cmlnZ2VyIFwicGxheWJhY2tcIiBldmVudHNcbiAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICBvblRyaWdnZXJDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICBpZiBtb2RlbC5jaGFuZ2VkLnRyaWdnZXIgaXMgdHJ1ZVxuICAgICAgQHBsYXkoKVxuXG4gICAgICAjIEF1dG8gc2V0IGl0IGZvciBub3dcbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG4gICMgSGFuZGxlciBmb3Igc291bmQgcGxheWJhY2sgZW5kIGV2ZW50cy4gIFJlbW92ZXMgdGhlIHRyaWdnZXJcbiAgIyBmbGFnIHNvIHRoZSBhdWRpbyB3b24ndCBvdmVybGFwXG5cbiAgb25Tb3VuZEVuZDogPT5cbiAgICBAcGF0dGVyblNxdWFyZU1vZGVsLnNldCAndHJpZ2dlcicsIGZhbHNlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlXG4iLCIjIyMqXG4gKiBJbmRpdmlkdWFsIHNlcXVlbmNlciB0cmFja3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5QdWJFdmVudCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlICAgICAgICAgICA9IHJlcXVpcmUgJy4vUGF0dGVyblNxdWFyZS5jb2ZmZWUnXG5WaWV3ICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGF0dGVybi10cmFjay10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIFBhdHRlcm5UcmFjayBleHRlbmRzIFZpZXdcblxuICAjIFRoZSBuYW1lIG9mIHRoZSBjbGFzc1xuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgY2xhc3NOYW1lOiAncGF0dGVybi10cmFjaydcblxuICAjIFRoZSB0eXBlIG9mIHRhZ1xuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgdGFnTmFtZTogJ3RyJ1xuXG4gICMgVGhlIHRlbXBsYXRlXG4gICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG4gICMgQSBjb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgdmlldyBzcXVhcmVzXG4gICMgQHR5cGUge0FycmF5fVxuXG4gIHBhdHRlcm5TcXVhcmVWaWV3czogbnVsbFxuXG4gICMgQHR5cGUge1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9ufVxuICBjb2xsZWN0aW9uOiBudWxsXG5cbiAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICBtb2RlbDogbnVsbFxuXG4gIGV2ZW50czpcbiAgICAndG91Y2hlbmQgLmluc3RydW1lbnQnOiAnb25JbnN0cnVtZW50QnRuQ2xpY2snXG4gICAgJ3RvdWNoZW5kIC5idG4tbXV0ZSc6ICdvbk11dGVCdG5DbGljaydcblxuXG4gICMgUmVuZGVycyB0aGUgdmlldyBhbmQgcmVuZGVycyBvdXQgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXNcbiAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgQCRpbnN0cnVtZW50ID0gQCRlbC5maW5kICcuaW5zdHJ1bWVudCdcbiAgICBAJG11dGUgPSBAJGVsLmZpbmQgJy5idG4tbXV0ZSdcblxuICAgIEAkbXV0ZS5oaWRlKClcbiAgICBAcmVuZGVyUGF0dGVyblNxdWFyZXMoKVxuICAgIEBcblxuXG4gIHJlbW92ZTogLT5cbiAgICBfLmVhY2ggQHBhdHRlcm5TcXVhcmVWaWV3cywgKHNxdWFyZSkgPT5cbiAgICAgIHNxdWFyZS5yZW1vdmUoKVxuXG4gICAgc3VwZXIoKVxuXG5cbiAgIyBBZGQgbGlzdGVuZXJzIHRvIHRoZSB2aWV3IHdoaWNoIGxpc3RlbiBmb3IgdmlldyBjaGFuZ2VzXG4gICMgYXMgd2VsbCBhcyBjaGFuZ2VzIHRvIHRoZSBjb2xsZWN0aW9uLCB3aGljaCBzaG91bGQgdXBkYXRlXG4gICMgcGF0dGVybiBzcXVhcmVzIHdpdGhvdXQgcmUtcmVuZGVyaW5nIHRoZSB2aWV3c1xuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiA9PlxuICAgIEBraXRNb2RlbCA9IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJylcblxuICAgIEBsaXN0ZW5UbyBAbW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9GT0NVUywgQG9uRm9jdXNDaGFuZ2VcbiAgICBAbGlzdGVuVG8gQGtpdE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cbiAgIyBSZW5kZXIgb3V0IHRoZSBwYXR0ZXJuIHNxdWFyZXMgYW5kIHB1c2ggdGhlbSBpbnRvIGFuIGFycmF5XG4gICMgZm9yIGZ1cnRoZXIgaXRlcmF0aW9uXG5cbiAgcmVuZGVyUGF0dGVyblNxdWFyZXM6IC0+XG4gICAgQHBhdHRlcm5TcXVhcmVWaWV3cyA9IFtdXG5cbiAgICBAY29sbGVjdGlvbiA9IG5ldyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvblxuXG4gICAgXyg4KS50aW1lcyA9PlxuICAgICAgQGNvbGxlY3Rpb24uYWRkIG5ldyBQYXR0ZXJuU3F1YXJlTW9kZWwgeyBpbnN0cnVtZW50OiBAbW9kZWwgfVxuXG4gICAgQGNvbGxlY3Rpb24uZWFjaCAobW9kZWwpID0+XG5cbiAgICAgIG1vZGVsLnNldCAnb3JkZXJJbmRleCcsIEBvcmRlckluZGV4XG5cbiAgICAgIHBhdHRlcm5TcXVhcmUgPSBuZXcgUGF0dGVyblNxdWFyZVxuICAgICAgICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG1vZGVsXG5cbiAgICAgIEAkaW5zdHJ1bWVudC50ZXh0IG1vZGVsLmdldCAnbGFiZWwnXG4gICAgICBAJGVsLmFwcGVuZCBwYXR0ZXJuU3F1YXJlLnJlbmRlcigpLmVsXG4gICAgICBAcGF0dGVyblNxdWFyZVZpZXdzLnB1c2ggcGF0dGVyblNxdWFyZVxuXG4gICAgICBAbGlzdGVuVG8gcGF0dGVyblNxdWFyZSwgUHViRXZlbnQuQkVBVCwgQG9uQmVhdFxuXG4gICAgIyBTZXQgdGhlIHNxdWFyZXMgb24gdGhlIEluc3RydW1lbnQgbW9kZWwgdG8gdHJhY2sgYWdhaW5zdCBzdGF0ZVxuICAgIEBtb2RlbC5zZXQgJ3BhdHRlcm5TcXVhcmVzJywgQGNvbGxlY3Rpb25cblxuXG4gIHNlbGVjdDogLT5cbiAgICBAJGVsLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG4gIGRlc2VsZWN0OiAtPlxuICAgIGlmIEAkZWwuaGFzQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgQCRlbC5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG5cblxuICAjIEV2ZW50IGhhbmRsZXJzXG4gICMgLS0tLS0tLS0tLS0tLS1cblxuICBvbkJlYXQ6IChwYXJhbXMpID0+XG4gICAgQHRyaWdnZXIgUHViRXZlbnQuQkVBVCwgcGFyYW1zXG5cblxuICAjIEhhbmRsZXIgZm9yIGNoYW5nZXMgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBpbnN0cnVtZW50XG4gICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IGluc3RydW1lbnRNb2RlbFxuXG4gIG9uSW5zdHJ1bWVudENoYW5nZTogKGluc3RydW1lbnRNb2RlbCkgPT5cbiAgICBpbnN0cnVtZW50ID0gaW5zdHJ1bWVudE1vZGVsLmNoYW5nZWQuY3VycmVudEluc3RydW1lbnRcblxuICAgIGlmIGluc3RydW1lbnQuY2lkIGlzIEBtb2RlbC5jaWRcbiAgICAgIEBzZWxlY3QoKVxuXG4gICAgZWxzZSBAZGVzZWxlY3QoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBtdXRlIGJ1dHRvbiBjbGlja3NcbiAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICBvbkluc3RydW1lbnRCdG5DbGljazogKGV2ZW50KSA9PlxuXG4gICAgIyBPZmYgc3RhdGUgPiBGb2N1c1xuICAgIGlmIEBtb2RlbC5nZXQoJ211dGUnKSBpcyBmYWxzZSBhbmQgQG1vZGVsLmdldCgnZm9jdXMnKSBpcyBmYWxzZVxuXG4gICAgICByZXR1cm4gQG1vZGVsLnNldFxuICAgICAgICAnbXV0ZSc6IHRydWVcblxuXG4gICAgIyBGb2N1cyBzdGF0ZSA+IE11dGVcbiAgICBpZiBAbW9kZWwuZ2V0KCdtdXRlJylcbiAgICAgIHJldHVybiBAbW9kZWwuc2V0XG4gICAgICAgICdtdXRlJzogZmFsc2VcblxuXG4gICMgSGFuZGxlciBmb3IgbXV0ZSBidXR0b24gY2xpY2tzXG4gICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgb25NdXRlQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICBAbW9kZWwuc2V0ICdtdXRlJywgISBAbW9kZWwuZ2V0KCdtdXRlJylcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5UcmFja1xuIiwiIyMjKlxuICogU2VxdWVuY2VyIHBhcmVudCB2aWV3IGZvciB0cmFjayBzZXF1ZW5jZXNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5QYXR0ZXJuVHJhY2sgPSByZXF1aXJlICcuL1BhdHRlcm5UcmFjay5jb2ZmZWUnXG5QdWJTdWIgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi91dGlscy9QdWJTdWInXG5BcHBFdmVudCAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuUHViRXZlbnQgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbmhlbHBlcnMgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2hlbHBlcnMvaGFuZGxlYmFycy1oZWxwZXJzJ1xudGVtcGxhdGUgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2VxdWVuY2VyLXRlbXBsYXRlLmhicydcblxuY2xhc3MgU2VxdWVuY2VyIGV4dGVuZHMgVmlld1xuXG4gICMgVGhlIG5hbWUgb2YgdGhlIGNvbnRhaW5lciBjbGFzc1xuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgaWQ6ICdjb250YWluZXItc2VxdWVuY2VyJ1xuXG4gICMgVGhlIHRlbXBsYXRlXG4gICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG4gICMgQW4gYXJyYXkgb2YgYWxsIHBhdHRlcm4gdHJhY2tzXG4gICMgQHR5cGUge1N0cmluZ31cblxuICBwYXR0ZXJuVHJhY2tWaWV3czogbnVsbFxuXG4gICMgVGhlIHNldEludGVydmFsIHRpY2tlclxuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgYnBtSW50ZXJ2YWw6IG51bGxcblxuICAjIFRoZSB0aW1lIGluIHdoaWNoIHRoZSBpbnRlcnZhbCBmaXJlc1xuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgdXBkYXRlSW50ZXJ2YWxUaW1lOiAyMDBcblxuICAjIFRoZSBjdXJyZW50IGJlYXQgaWRcbiAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gIGN1cnJCZWF0Q2VsbElkOiAtMVxuXG4gICMgVE9ETzogVXBkYXRlIHRoaXMgdG8gbWFrZSBpdCBtb3JlIGR5bmFtaWNcbiAgIyBUaGUgbnVtYmVyIG9mIGJlYXQgY2VsbHNcbiAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gIG51bUNlbGxzOiA3XG5cbiAgIyBHbG9iYWwgYXBwbGljYXRpb24gbW9kZWxcbiAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgYXBwTW9kZWw6IG51bGxcblxuICAjIENvbGxlY3Rpb24gb2YgaW5zdHJ1bWVudHNcbiAgIyBAdHlwZSB7SW5zdHJ1bWVudENvbGxlY3Rpb259XG5cbiAgY29sbGVjdGlvbjogbnVsbFxuXG4gICMgQ29sbGVjdGlvbiBvZiBpbnN0cnVtZW50c1xuICAjIEB0eXBlIHtLaXRDb2xsZWN0aW9ufVxuXG4gIGtpdENvbGxlY3Rpb246IG51bGxcblxuXG4gICMgUmVuZGVycyB0aGUgdmlld1xuICAjIEBwYXJhbSB7T2JqZWN0fVxuXG4gIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgQCR0aFN0ZXBwZXIgPSBAJGVsLmZpbmQgJ3RoLnN0ZXBwZXInXG4gICAgQCRzZXF1ZW5jZXIgPSBAJGVsLmZpbmQgJy5zZXF1ZW5jZXInXG5cbiAgICAkKEAkdGhTdGVwcGVyWzBdKS5hZGRDbGFzcyAnc3RlcCdcbiAgICBAcmVuZGVyVHJhY2tzKClcbiAgICBAcGxheSgpXG4gICAgQFxuXG5cbiAgIyBSZW1vdmVzIHRoZSB2aWV3IGZyb20gdGhlIERPTSBhbmQgY2FuY2Vsc1xuICAjIHRoZSB0aWNrZXIgaW50ZXJ2YWxcblxuICByZW1vdmU6IC0+XG4gICAgXy5lYWNoIEBwYXR0ZXJuVHJhY2tWaWV3cywgKHRyYWNrKSA9PlxuICAgICAgdHJhY2sucmVtb3ZlKClcblxuICAgIHdpbmRvdy5jbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuXG4gICAgc3VwZXIoKVxuXG5cbiAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kbGluZyBpbnN0cnVtZW50IGFuZCBwbGF5YmFja1xuICAjIGNoYW5nZXMuICBVcGRhdGVzIGFsbCBvZiB0aGUgdmlld3MgYWNjb3JkaW5nbHlcblxuICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfQlBNLCBAb25CUE1DaGFuZ2VcbiAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfUExBWUlORywgQG9uUGxheWluZ0NoYW5nZVxuICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9LSVQsIEBvbktpdENoYW5nZVxuXG4gICAgQGxpc3RlblRvIEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJyksIEFwcEV2ZW50LkNIQU5HRV9JTlNUUlVNRU5ULCBAb25JbnN0cnVtZW50Q2hhbmdlXG5cbiAgICBAbGlzdGVuVG8gQGNvbGxlY3Rpb24sIEFwcEV2ZW50LkNIQU5HRV9GT0NVUywgQG9uRm9jdXNDaGFuZ2VcbiAgICBAbGlzdGVuVG8gQGNvbGxlY3Rpb24sIEFwcEV2ZW50LkNIQU5HRV9NVVRFLCBAb25NdXRlQ2hhbmdlXG5cbiAgICBQdWJTdWIub24gQXBwRXZlbnQuSU1QT1JUX1RSQUNLLCBAaW1wb3J0VHJhY2tcblxuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgIFB1YlN1Yi5vZmYgQXBwRXZlbnQuSU1QT1JUX1RSQUNLXG4gICAgUHViU3ViLm9mZiBBcHBFdmVudC5FWFBPUlRfVFJBQ0tcblxuICAgIHN1cGVyKClcblxuXG4gICMgUmVuZGVycyBvdXQgZWFjaCBpbmRpdmlkdWFsIHRyYWNrLlxuICAjIFRPRE86IE5lZWQgdG8gdXBkYXRlIHNvIHRoYXQgYWxsIG9mIHRoZSBiZWF0IHNxdWFyZXMgYXJlbid0XG4gICMgYmxvd24gYXdheSBieSB0aGUgcmUtcmVuZGVyXG5cbiAgcmVuZGVyVHJhY2tzOiA9PlxuICAgIEAkZWwuZmluZCgnLnBhdHRlcm4tdHJhY2snKS5yZW1vdmUoKVxuXG4gICAgQHBhdHRlcm5UcmFja1ZpZXdzID0gW11cblxuICAgIEBjb2xsZWN0aW9uLmVhY2ggKG1vZGVsLCBpbmRleCkgPT5cblxuICAgICAgcGF0dGVyblRyYWNrID0gbmV3IFBhdHRlcm5UcmFja1xuICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgIGNvbGxlY3Rpb246IG1vZGVsLmdldCAncGF0dGVyblNxdWFyZXMnXG4gICAgICAgIG1vZGVsOiBtb2RlbFxuICAgICAgICBvcmRlckluZGV4OiBpbmRleFxuXG4gICAgICBAcGF0dGVyblRyYWNrVmlld3MucHVzaCBwYXR0ZXJuVHJhY2tcbiAgICAgIEAkc2VxdWVuY2VyLmFwcGVuZCBwYXR0ZXJuVHJhY2sucmVuZGVyKCkuZWxcblxuICAgICAgQGxpc3RlblRvIHBhdHRlcm5UcmFjaywgUHViRXZlbnQuQkVBVCwgQG9uQmVhdFxuXG5cbiAgIyBVcGRhdGUgdGhlIHRpY2tlciB0aW1lLCBhbmQgYWR2YW5jZXMgdGhlIGJlYXRcblxuICB1cGRhdGVUaW1lOiA9PlxuICAgICNjb25zb2xlLmxvZyAnQkVBVCEnXG4gICAgQCR0aFN0ZXBwZXIucmVtb3ZlQ2xhc3MgJ3N0ZXAnXG4gICAgQCRzZXF1ZW5jZXIuZmluZCgndGQnKS5yZW1vdmVDbGFzcyAnc3RlcCdcbiAgICBAY3VyckJlYXRDZWxsSWQgPSBpZiBAY3VyckJlYXRDZWxsSWQgPCBAbnVtQ2VsbHMgdGhlbiBAY3VyckJlYXRDZWxsSWQgKz0gMSBlbHNlIEBjdXJyQmVhdENlbGxJZCA9IDBcbiAgICAkKEAkdGhTdGVwcGVyW0BjdXJyQmVhdENlbGxJZF0pLmFkZENsYXNzICdzdGVwJ1xuXG4gICAgQHBsYXlBdWRpbygpXG5cblxuICAjIENvbnZlcnRzIG1pbGxpc2Vjb25kcyB0byBCUE1cblxuICBjb252ZXJ0QlBNOiAtPlxuICAgIHJldHVybiAyMDBcblxuXG4gICMgU3RhcnQgcGxheWJhY2sgb2Ygc2VxdWVuY2VyXG5cbiAgcGxheTogLT5cbiAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgdHJ1ZVxuXG5cbiAgIyBQYXVzZXMgc2VxdWVuY2VyIHBsYXliYWNrXG5cbiAgcGF1c2U6IC0+XG4gICAgQGFwcE1vZGVsLnNldCAncGxheWluZycsIGZhbHNlXG5cblxuICAjIE11dGVzIHRoZSBzZXF1ZW5jZXJcblxuICBtdXRlOiAtPlxuICAgIEBhcHBNb2RlbC5zZXQgJ211dGUnLCB0cnVlXG5cblxuICAjIFVubXV0ZXMgdGhlIHNlcXVlbmNlclxuXG4gIHVubXV0ZTogLT5cbiAgICBAYXBwTW9kZWwuc2V0ICdtdXRlJywgZmFsc2VcblxuXG4gICMgUGxheXMgYXVkaW8gb2YgZWFjaCB0cmFjayBjdXJyZW50bHkgZW5hYmxlZCBhbmQgb25cblxuICBwbGF5QXVkaW86IC0+XG4gICAgZm9jdXNlZEluc3RydW1lbnQgPSBAY29sbGVjdGlvbi5maW5kV2hlcmUgeyBmb2N1czogdHJ1ZSB9XG5cbiAgICAjIENoZWNrIGlmIHRoZXJlJ3MgYSBmb2N1c2VkIHRyYWNrIGFuZCBvbmx5XG4gICAgIyBwbGF5IGF1ZGlvIGZyb20gdGhlcmVcblxuICAgIGlmIGZvY3VzZWRJbnN0cnVtZW50XG4gICAgICBpZiBmb2N1c2VkSW5zdHJ1bWVudC5nZXQoJ211dGUnKSBpc250IHRydWVcbiAgICAgICAgZm9jdXNlZEluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpLmVhY2ggKHBhdHRlcm5TcXVhcmUsIGluZGV4KSA9PlxuICAgICAgICAgIEBwbGF5UGF0dGVyblNxdWFyZUF1ZGlvKCBwYXR0ZXJuU3F1YXJlLCBpbmRleCApXG5cbiAgICAgIHJldHVyblxuXG4gICAgIyBJZiBub3RoaW5nIGlzIGZvY3VzZWQsIHRoZW4gY2hlY2sgYWdhaW5zdFxuICAgICMgdGhlIGVudGlyZSBtYXRyaXhcblxuICAgIEBjb2xsZWN0aW9uLmVhY2ggKGluc3RydW1lbnQpID0+XG4gICAgICBpZiBpbnN0cnVtZW50LmdldCgnbXV0ZScpIGlzbnQgdHJ1ZVxuICAgICAgICBpbnN0cnVtZW50LmdldCgncGF0dGVyblNxdWFyZXMnKS5lYWNoIChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgPT5cbiAgICAgICAgICBAcGxheVBhdHRlcm5TcXVhcmVBdWRpbyggcGF0dGVyblNxdWFyZSwgaW5kZXggKVxuXG5cbiAgIyBQbGF5cyB0aGUgYXVkaW8gb24gYW4gaW5kaXZpZHVhbCBQYXR0ZXJTcXVhcmUgaWYgdGVtcG8gaW5kZXhcbiAgIyBpcyB0aGUgc2FtZSBhcyB0aGUgaW5kZXggd2l0aGluIHRoZSBjb2xsZWN0aW9uXG4gICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlfSBwYXR0ZXJuU3F1YXJlXG4gICMgQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG5cbiAgcGxheVBhdHRlcm5TcXVhcmVBdWRpbzogKHBhdHRlcm5TcXVhcmUsIGluZGV4KSAtPlxuICAgIGlmIEBjdXJyQmVhdENlbGxJZCBpcyBpbmRleFxuICAgICAgaWYgcGF0dGVyblNxdWFyZS5nZXQgJ2FjdGl2ZSdcbiAgICAgICAgcGF0dGVyblNxdWFyZS5zZXQgJ3RyaWdnZXInLCB0cnVlXG5cblxuICAjIEV2ZW50IGhhbmRsZXJzXG4gICMgLS0tLS0tLS0tLS0tLS1cblxuICBvbkJlYXQ6IChwYXJhbXMpID0+XG4gICAgQHRyaWdnZXIgUHViRXZlbnQuQkVBVCwgcGFyYW1zXG5cblxuICAjIEhhbmRsZXIgZm9yIEJQTSB0ZW1wbyBjaGFuZ2VzXG4gICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICBvbkJQTUNoYW5nZTogKG1vZGVsKSA9PlxuICAgIHdpbmRvdy5jbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuICAgIEB1cGRhdGVJbnRlcnZhbFRpbWUgPSBtb2RlbC5jaGFuZ2VkLmJwbVxuXG4gICAgaWYgQGFwcE1vZGVsLmdldCgncGxheWluZycpXG4gICAgICBAYnBtSW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwgQHVwZGF0ZVRpbWUsIEB1cGRhdGVJbnRlcnZhbFRpbWVcblxuXG4gICMgSGFuZGxlciBmb3IgcGxheWJhY2sgY2hhbmdlcy4gIElmIHBhdXNlZCwgaXQgc3RvcHMgcGxheWJhY2sgYW5kXG4gICMgY2xlYXJzIHRoZSBpbnRlcnZhbC4gIElmIHBsYXlpbmcsIGl0IHJlc2V0cyBpdFxuICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgb25QbGF5aW5nQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgcGxheWluZyA9IG1vZGVsLmNoYW5nZWQucGxheWluZ1xuXG4gICAgaWYgcGxheWluZ1xuICAgICAgQGJwbUludGVydmFsID0gd2luZG93LnNldEludGVydmFsIEB1cGRhdGVUaW1lLCBAdXBkYXRlSW50ZXJ2YWxUaW1lXG5cbiAgICBlbHNlXG4gICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCBAYnBtSW50ZXJ2YWxcbiAgICAgIEBicG1JbnRlcnZhbCA9IG51bGxcblxuXG4gICMgSGFuZGxlciBmb3IgbXV0ZSBhbmQgdW5tdXRlIGNoYW5nZXNcbiAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gIG9uTXV0ZUNoYW5nZTogKG1vZGVsKSA9PlxuXG5cbiAgIyBNT0JJTEUgT05MWS4gIFN3YXBzIG91dCB0aGUgY3VycmVudGx5IHZpc2libGUgcGF0dGVybiB0cmFjayB3aXRoIHRoZSBvbmVcbiAgIyBjb3JyZXNwb25kaW5nIHRvIHRoZSBzZWxlY3RlZCBpbnN0cnVtZW50XG4gICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgb25JbnN0cnVtZW50Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgc2VsZWN0ZWRJbnN0cnVtZW50ID0gbW9kZWwuY2hhbmdlZC5jdXJyZW50SW5zdHJ1bWVudFxuICAgIGljb25DbGFzcyA9IHNlbGVjdGVkSW5zdHJ1bWVudC5nZXQgJ2ljb24nXG4gICAgJHBhdHRlcm5UcmFja3MgPSBAJGVsLmZpbmQgJy5wYXR0ZXJuLXRyYWNrJ1xuXG4gICAgJHBhdHRlcm5UcmFja3MuZWFjaCAtPlxuICAgICAgJHRyYWNrID0gJCh0aGlzKVxuXG4gICAgICAjIEZvdW5kIHRoZSBwcm9wZXIgdHJhY2ssIHNob3cgaXRcbiAgICAgIGlmICR0cmFjay5maW5kKCcuaW5zdHJ1bWVudCcpLmhhc0NsYXNzIGljb25DbGFzc1xuICAgICAgICAkdHJhY2suc2hvdygpXG5cbiAgICAgICAgVHdlZW5MaXRlLmZyb21UbyAkdHJhY2ssIC42LCB5OiAxMDAsXG4gICAgICAgICAgaW1tZWRpYXRlUmVuZGVyOiB0cnVlXG4gICAgICAgICAgeTogMFxuICAgICAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cbiAgICAgICMgSGlkZSBvbGQgdHJhY2tcbiAgICAgIGVsc2VcbiAgICAgICAgJHRyYWNrLmhpZGUoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlcywgYXMgc2V0IGZyb20gdGhlIEtpdFNlbGVjdG9yXG4gICMgQHBhcmFtIHtLaXRNb2RlbH0gbW9kZWxcblxuICBvbktpdENoYW5nZTogKG1vZGVsKSA9PlxuICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG4gICAgQGNvbGxlY3Rpb24gPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKVxuICAgIEByZW5kZXJUcmFja3MoKVxuXG4gICAgIyBFeHBvcnQgb2xkIHBhdHRlcm4gc3F1YXJlcyBzbyB0aGUgdXNlcnMgcGF0dGVybiBpc24ndCBibG93biBhd2F5XG4gICAgIyB3aGVuIGtpdCBjaGFuZ2VzIG9jY3VyXG5cbiAgICBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbiA9IG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMua2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpXG4gICAgb2xkUGF0dGVyblNxdWFyZXMgPSBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbi5leHBvcnRQYXR0ZXJuU3F1YXJlcygpXG5cbiAgICAjIFVwZGF0ZSB0aGUgbmV3IGNvbGxlY3Rpb24gd2l0aCBvbGQgcGF0dGVybiBzcXVhcmUgZGF0YVxuICAgICMgYW5kIHRyaWdnZXIgVUkgdXBkYXRlcyBvbiBlYWNoIHNxdWFyZVxuXG4gICAgQGNvbGxlY3Rpb24uZWFjaCAoaW5zdHJ1bWVudE1vZGVsLCBpbmRleCkgLT5cbiAgICAgIG9sZENvbGxlY3Rpb24gPSBvbGRQYXR0ZXJuU3F1YXJlc1tpbmRleF1cbiAgICAgIG5ld0NvbGxlY3Rpb24gPSBpbnN0cnVtZW50TW9kZWwuZ2V0ICdwYXR0ZXJuU3F1YXJlcydcblxuICAgICAgIyBVcGRhdGUgdHJhY2sgLyBpbnN0cnVtZW50IGxldmVsIHByb3BlcnRpZXMgbGlrZSB2b2x1bWUgLyBtdXRlIC8gZm9jdXNcbiAgICAgIG9sZFByb3BzID0gb2xkSW5zdHJ1bWVudENvbGxlY3Rpb24uYXQoaW5kZXgpXG5cbiAgICAgIHVubGVzcyBvbGRQcm9wcyBpcyB1bmRlZmluZWRcbiAgICAgICAgb2xkUHJvcHMgPSBvbGRQcm9wcy50b0pTT04oKVxuXG4gICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICB2b2x1bWU6IG9sZFByb3BzLnZvbHVtZVxuICAgICAgICAgIGFjdGl2ZTogb2xkUHJvcHMuYWN0aXZlXG4gICAgICAgICAgbXV0ZTogbnVsbFxuICAgICAgICAgIGZvY3VzOiBudWxsXG5cbiAgICAgICAgIyBSZXNldCB2aXN1YWxseSB0aWVkIHByb3BzIHRvIHRyaWdnZXIgdWkgdXBkYXRlXG4gICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICBtdXRlOiBvbGRQcm9wcy5tdXRlXG4gICAgICAgICAgZm9jdXM6IG9sZFByb3BzLmZvY3VzXG5cbiAgICAgICMgQ2hlY2sgZm9yIGluY29uc2lzdGFuY2llcyBiZXR3ZWVuIG51bWJlciBvZiBpbnN0cnVtZW50c1xuICAgICAgdW5sZXNzIG9sZENvbGxlY3Rpb24gaXMgdW5kZWZpbmVkXG4gICAgICAgIG5ld0NvbGxlY3Rpb24uZWFjaCAocGF0dGVyblNxdWFyZSwgaW5kZXgpIC0+XG4gICAgICAgICAgb2xkUGF0dGVyblNxdWFyZSA9IG9sZENvbGxlY3Rpb24uYXQgaW5kZXhcbiAgICAgICAgICBvbGRQYXR0ZXJuU3F1YXJlID0gb2xkUGF0dGVyblNxdWFyZS50b0pTT04oKVxuICAgICAgICAgIG9sZFBhdHRlcm5TcXVhcmUudHJpZ2dlciA9IGZhbHNlXG5cbiAgICAgICAgICBwYXR0ZXJuU3F1YXJlLnNldCBvbGRQYXR0ZXJuU3F1YXJlXG5cbiAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cbiAgaW1wb3J0VHJhY2s6IChwYXJhbXMpID0+XG4gICAge2NhbGxiYWNrLCBwYXR0ZXJuU3F1YXJlR3JvdXBzLCBpbnN0cnVtZW50cywga2l0VHlwZX0gPSBwYXJhbXNcblxuICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uZmluZFdoZXJlKCBsYWJlbDoga2l0VHlwZSApXG4gICAgQHJlbmRlclRyYWNrcygpXG5cbiAgICAjIEl0ZXJhdGUgb3ZlciBlYWNoIHZpZXcgYW5kIHNldCBzYXZlZCBwcm9wZXJ0aWVzXG4gICAgXy5lYWNoIEBwYXR0ZXJuVHJhY2tWaWV3cywgKHBhdHRlcm5UcmFja1ZpZXcsIGl0ZXJhdG9yKSAtPlxuICAgICAgaW5zdHJ1bWVudE1vZGVsID0gcGF0dGVyblRyYWNrVmlldy5tb2RlbFxuXG4gICAgICBpbnN0cnVtZW50TW9kZWwuc2V0XG4gICAgICAgIG11dGU6IG51bGxcbiAgICAgICAgZm9jdXM6IG51bGxcblxuICAgICAgIyBVcGRhdGUgcHJvcHMgdG8gdHJpZ2dlciBVSSB1cGRhdGVzXG4gICAgICBpbnN0cnVtZW50TW9kZWwuc2V0XG4gICAgICAgIG11dGU6IGluc3RydW1lbnRzW2l0ZXJhdG9yXS5tdXRlXG4gICAgICAgIGZvY3VzOiBpbnN0cnVtZW50c1tpdGVyYXRvcl0uZm9jdXNcblxuICAgICAgIyBVcGRhdGUgZWFjaCBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlIHdpdGggc2V0dGluZ3NcbiAgICAgIHBhdHRlcm5UcmFja1ZpZXcuY29sbGVjdGlvbi5lYWNoIChwYXR0ZXJuTW9kZWwsIGluZGV4KSAtPlxuICAgICAgICBzcXVhcmVEYXRhID0gcGF0dGVyblNxdWFyZUdyb3Vwc1tpdGVyYXRvcl1baW5kZXhdXG4gICAgICAgIHNxdWFyZURhdGEudHJpZ2dlciA9IGZhbHNlXG5cbiAgICAgICAgcGF0dGVybk1vZGVsLnNldCBzcXVhcmVEYXRhXG5cbiAgICBpZiBjYWxsYmFjayB0aGVuIGNhbGxiYWNrKClcblxuXG4gICMgSGFuZGxlciBmb3IgZm9jdXMgY2hhbmdlIGV2ZW50cy4gIEl0ZXJhdGVzIG92ZXIgYWxsIG9mIHRoZSBtb2RlbHMgd2l0aGluXG4gICMgdGhlIEluc3RydW1lbnRDb2xsZWN0aW9uIGFuZCB0b2dnbGVzIHRoZWlyIGZvY3VzIHRvIG9mZiBpZiB0aGUgY2hhbmdlZFxuICAjIG1vZGVsJ3MgZm9jdXMgaXMgc2V0IHRvIHRydWUuXG4gICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgb25Gb2N1c0NoYW5nZTogKG1vZGVsKSA9PlxuICAgIGRvRm9jdXMgPSBtb2RlbC5jaGFuZ2VkLmZvY3VzXG4gICAgc2VsZWN0ZWRJbmRleCA9IEBjb2xsZWN0aW9uLmluZGV4T2YgbW9kZWxcblxuICAgIEBjb2xsZWN0aW9uLmVhY2ggKGluc3RydW1lbnRNb2RlbCwgaW5kZXgpID0+XG5cbiAgICAgICMgVW5zZXQgYXVkaW8gZm9jdXMgb24gb3RoZXIgdHJhY2tzXG4gICAgICBpZiBtb2RlbC5jaGFuZ2VkLmZvY3VzIGlzIHRydWVcbiAgICAgICAgaWYgbW9kZWwuY2lkIGlzbnQgaW5zdHJ1bWVudE1vZGVsLmNpZFxuICAgICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXQgJ2ZvY3VzJywgZmFsc2UsIHt0cmlnZ2VyOiBmYWxzZSB9XG5cbiAgICBAY29sbGVjdGlvbi5lYWNoIChpbnN0cnVtZW50TW9kZWwsIGluZGV4KSA9PlxuXG4gICAgICAjIFVwZGF0ZSB2aWV3IHJlcHJlc2VudGF0aW9uIGZvciBmb2N1cyBzdGF0ZVxuICAgICAgdmlldyA9IEBwYXR0ZXJuVHJhY2tWaWV3c1tpbmRleF1cblxuICAgICAgIyBGb3VuZCBpbnN0cnVtZW50IG1vZGVsXG4gICAgICBpZiBtb2RlbCBpcyBpbnN0cnVtZW50TW9kZWxcblxuICAgICAgICAjIEFkZCBmb2N1c1xuICAgICAgICBpZiBkb0ZvY3VzIGlzIHRydWVcbiAgICAgICAgICB2aWV3LiRlbC5yZW1vdmVDbGFzcygnZGVmb2N1c2VkJylcblxuICAgICAgIyBBbGwgdGhlIG90aGVyIHRyYWNrcywgcmVtb3ZlIGZvY3VzIGlmIHNldFxuICAgICAgZWxzZVxuXG4gICAgICAgICMgQWRkIGRlZm9jdXNlZCBzdGF0ZVxuICAgICAgICBpZiBkb0ZvY3VzIGlzIHRydWVcbiAgICAgICAgICB2aWV3LiRlbC5hZGRDbGFzcygnZGVmb2N1c2VkJylcblxuICAgICAgICAjIFJlbW92ZSBkZWZvY3VzZWQgc3RhdGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpZXcuJGVsLnJlbW92ZUNsYXNzKCdkZWZvY3VzZWQnKVxuXG5cbiAgb25NdXRlQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgc2VsZWN0ZWRJbmRleCA9IEBjb2xsZWN0aW9uLmluZGV4T2YgbW9kZWxcblxuICAgIEBjb2xsZWN0aW9uLmVhY2ggKGluc3RydW1lbnRNb2RlbCwgaW5kZXgpID0+XG4gICAgICB2aWV3ID0gQHBhdHRlcm5UcmFja1ZpZXdzW2luZGV4XVxuXG4gICAgICAjIEZvdW5kIGluc3RydW1lbnQgbW9kZWxcbiAgICAgIGlmIHNlbGVjdGVkSW5kZXggaXMgaW5kZXhcblxuICAgICAgICAjIEFkZCBtdXRlXG4gICAgICAgIGlmIG1vZGVsLmNoYW5nZWQubXV0ZSBpcyB0cnVlXG4gICAgICAgICAgdmlldy4kZWwuYWRkQ2xhc3MgJ211dGUnXG5cbiAgICAgICAgIyBVc2VyIHVubXV0aW5nIHRyYWNrXG4gICAgICAgIGVsc2Ugdmlldy4kZWwucmVtb3ZlQ2xhc3MgJ211dGUnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZXF1ZW5jZXJcbiIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0naW5uZXItY29udGFpbmVyJz5cXG5cdDxkaXYgY2xhc3M9J2JvcmRlci1kYXJrJyAvPlxcblxcblx0PGRpdiBjbGFzcz0naWNvbic+XFxuXFxuXHQ8L2Rpdj5cXG48L2Rpdj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuXG4gIGJ1ZmZlciArPSBcIjx0ZCBjbGFzcz0naW5zdHJ1bWVudCBcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWNvbikgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWNvbjsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCInIC8+XFxuPHRkIGNsYXNzPSdidG4tbXV0ZSc+XFxuXHRtdXRlXFxuPC90ZD5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBzdGFjazIsIG9wdGlvbnMsIHNlbGY9dGhpcywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIjtcbiAgYnVmZmVyICs9IFwiXFxuXHRcdFx0XHRcIlxuICAgICsgXCJcXG5cdFx0XHRcdDx0aD48L3RoPlxcblx0XHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiXFxuXHRcdFx0XHQ8dGggY2xhc3M9J3N0ZXBwZXInPjwvdGg+XFxuXHRcdFx0XCI7XG4gIH1cblxuICBidWZmZXIgKz0gXCJcXG48ZGl2IGNsYXNzPSd3cmFwcGVyJz5cXG5cdDx0YWJsZSBjbGFzcz0nc2VxdWVuY2VyJz5cXG5cdFx0PHRyPlxcblxcblx0XHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXFxuXHRcdFx0XCJcbiAgICArIFwiXFxuXHRcdFx0PHRoIHN0eWxlPSdkaXNwbGF5Om5vbmUnPjwvdGg+XFxuXFxuXHRcdFx0XCI7XG4gIG9wdGlvbnMgPSB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMywgcHJvZ3JhbTMsIGRhdGEpLGRhdGE6ZGF0YX07XG4gIHN0YWNrMiA9ICgoc3RhY2sxID0gaGVscGVycy5yZXBlYXQgfHwgZGVwdGgwLnJlcGVhdCksc3RhY2sxID8gc3RhY2sxLmNhbGwoZGVwdGgwLCA4LCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwicmVwZWF0XCIsIDgsIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8L3RyPlxcblx0PC90YWJsZT5cXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCIjIyMqXG4gKiBTaGFyZSBtb2RhbCBwb3AtZG93blxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNi4xNFxuIyMjXG5cbkFwcENvbmZpZyAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblNwaW5JY29uICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3V0aWxzL1NwaW5JY29uJ1xucHJldmlld1RlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2hhcmUtcHJldmlldy10ZW1wbGF0ZS5oYnMnXG50ZW1wbGF0ZSAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zaGFyZS1tb2RhbC10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIFNoYXJlTW9kYWwgZXh0ZW5kcyBWaWV3XG5cbiAgIyBUaGUgdHdlZW4gdGltZSBmb3IgZm9ybSB0cmFuc2l0aW9ucyBpbiBhbmQgYmV0d2VlblxuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgRk9STV9UV0VFTl9USU1FOiAuM1xuXG4gICMgRXJyb3IgbWVzc2FnZSB0byBkaXNwbGF5IGluIGJ1dHRvbiBpZiB0aGVyZSdzIGEgcHJvYmxlbSBzYXZpbmcgdGhlIHRyYWNrXG4gICMgQHR5cGUge1N0cmluZ31cblxuICBFUlJPUl9NU0c6ICdFcnJvciBzYXZpbmcgdHJhY2snXG5cbiAgIyBHZW5lcmljIHNoYXJlIG1lc3NhZ2Ugd2hpY2ggaXMgcG9zdGVkIHRvIHNvY2lhbCBtZWRpYVxuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgU0hBUkVfTVNHOiAnTkVFRCBTSEFSRSBNRVNTQUdFJ1xuXG4gICMgVGhlIGNvbnRhaW5lciBlbGVtZW50IGlkXG4gICMgQHR5cGUge1N0cmluZ31cblxuICBjbGFzc05hbWU6ICdjb250YWluZXItc2hhcmUtbW9kYWwnXG5cbiAgIyBUaGUgdGVtcGxhdGVcbiAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cbiAgIyBUaGUgbW9kZWwgdG8gc2hhcmUgZGF0YSBiZXR3ZWVuIHRoZSB2aWV3IGFuZCBQYXJzZVxuICAjIEB0eXBlIHtTaGFyZWRUcmFja01vZGVsfVxuXG4gIHNoYXJlZFRyYWNrTW9kZWw6IG51bGxcblxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmJ0bi1saW5rJzogJ29uTGlua0J0bkNsaWNrJ1xuICAgICdjbGljayAuYnRuLXNlbGVjdC1zZXJ2aWNlJzogJ29uU2VsZWN0WW91clNlcnZpY2VCdG5DbGljaydcbiAgICAndG91Y2hlbmQgLmJ0bi1jbG9zZSc6ICdvbkNsb3NlQnRuQ2xpY2snXG4gICAgJ2NsaWNrJzogJ29uQ2xvc2VCdG5DbGljaydcbiAgICAnY2xpY2sgLndyYXBwZXInOiAnb25XcmFwcGVyQ2xpY2snXG4gICAgJ2NsaWNrIC5idG4tdHVtYmxyJzogJ29uVHVtYmxyQnRuQ2xpY2snXG5cbiAgICAna2V5cHJlc3MgLmlucHV0LW5hbWUnOiAnb25JbnB1dEtleVByZXNzJ1xuICAgICdibHVyIC5pbnB1dC10aXRsZSc6ICdvbklucHV0Qmx1cidcbiAgICAnYmx1ciAuaW5wdXQtbmFtZSc6ICdvbklucHV0Qmx1cidcbiAgICAnYmx1ciAuaW5wdXQtbWVzc2FnZSc6ICdvbklucHV0Qmx1cidcblxuICAgICMgTW9iaWxlIG9ubHlcbiAgICAndG91Y2hzdGFydCAuYnRuLWNsb3NlLXNoYXJlJzogJ29uQ2xvc2VCdG5QcmVzcydcblxuXG4gICMgUmVuZGVycyB0aGUgdmlldyBvbmNlIHRoZSB1c2VyIGhhcyBjbGlja2VkIHRoZSAnc2hhcmUnIGJ1dHRvblxuICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG5cbiAgICBAJHdyYXBwZXIgPSBAJGVsLmZpbmQgJy53cmFwcGVyJ1xuICAgIEAkZm9ybSA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1mb3JtJ1xuICAgIEAkcHJldmlldyA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1wcmV2aWV3J1xuICAgIEAkZm9ybVdyYXBwZXIgPSBAJGVsLmZpbmQgJy5mb3JtLXdyYXBwZXInXG4gICAgQCRjbG9zZUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1jbG9zZSdcbiAgICBAJG5hbWVJbnB1dCA9IEAkZWwuZmluZCAnLmlucHV0LW5hbWUnXG4gICAgQCR0aXRsZUlucHV0ID0gQCRlbC5maW5kICcuaW5wdXQtdGl0bGUnXG4gICAgQCRtZXNzYWdlSW5wdXQgPSBAJGVsLmZpbmQgJy5pbnB1dC1tZXNzYWdlJ1xuICAgIEAkcHJlbG9hZGVyID0gQCRlbC5maW5kICcucHJlbG9hZGVyJ1xuICAgIEAkc2VydmljZUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1zZWxlY3Qtc2VydmljZSdcbiAgICBAJHNlcnZpY2VUZXh0ID0gQCRzZXJ2aWNlQnRuLmZpbmQgJy50ZXh0J1xuXG4gICAgQHNwaW5uZXIgPSBuZXcgU3Bpbkljb24geyB0YXJnZXQ6IEAkcHJlbG9hZGVyWzBdIH1cbiAgICBAc3Bpbm5lci4kZWwuY3NzICdtYXJnaW4nLCAnYXV0bydcbiAgICBAc3Bpbm5lci5zaG93KClcbiAgICBAJHByZWxvYWRlci5oaWRlKClcblxuICAgIFR3ZWVuTGl0ZS5zZXQgQCRlbCwgYXV0b0FscGhhOiAwXG4gICAgVHdlZW5MaXRlLnNldCBAJHByZXZpZXcsIGF1dG9BbHBoYTogMFxuICAgIFR3ZWVuTGl0ZS5zZXQgQCRwcmVsb2FkZXIsIGF1dG9BbHBoYTogMCwgc2NhbGU6IDBcbiAgICBUd2VlbkxpdGUuc2V0IEAkY2xvc2VCdG4sIGF1dG9BbHBoYTogMCwgc2NhbGVYOiAxLjdcblxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgVHdlZW5MaXRlLnNldCBAJHByZWxvYWRlciwgYXV0b0FscGhhOiAxLCBzY2FsZTogMCwgeTogLTEyXG5cbiAgICAgIF8uZWFjaCBbQCRuYW1lSW5wdXQsIEAkdGl0bGVJbnB1dCwgQCRtZXNzYWdlSW5wdXRdLCAoJGlucHV0KSAtPlxuICAgICAgICAjJGlucHV0LmF0dHIgJ3BsYWNlaG9sZGVyJywgJydcblxuICAgICAgXy5kZWZlciA9PlxuICAgICAgICBjZW50ZXJZID0gKHdpbmRvdy5pbm5lckhlaWdodCAqIC41IC0gQCRmb3JtV3JhcHBlci5oZWlnaHQoKSkgKyAoJCgnLnRvcC1iYXInKS5oZWlnaHQoKSAqIC41KVxuXG4gICAgICAgIFR3ZWVuTGl0ZS5zZXQgQCRmb3JtV3JhcHBlciwgeTogY2VudGVyWVxuICAgIEBcblxuXG4gIHJlbW92ZTogLT5cbiAgICBAJGJhY2tCdG4/Lm9mZiAndG91Y2hlbmQnLCBAb25CYWNrQnRuQ2xpY2tcbiAgICBAJGNvcHlCdG4/Lm9mZiAndG91Y2hlbmQnLCBAb25Db3B5QnRuQ2xpY2tcbiAgICBzdXBlcigpXG5cblxuICAjIEFkZHMgZXZlbnQgbGlzdGVuZXJzIGFuZCB3YWl0cyBmb3IgdGhlIHNoYXJlSWQgdG8gdXBkYXRlLCB0cmlnZ2VyaW5nXG4gICMgdGhlIFVJIGNoYW5nZSByZWxhdGVkIHRvIHBvc3RlZCB0byBkaWZmZXJlbnQgc29jaWFsIHNlcnZpY2VzXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1NIQVJFX0lELCBAb25TaGFyZUlkQ2hhbmdlXG5cblxuICAjIFNob3dzIHRoZSB2aWV3XG5cbiAgc2hvdzogLT5cblxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgVHdlZW5MaXRlLmZyb21UbyBAJGVsLCAuNiwgeTogd2luZG93LmlubmVySGVpZ2h0LFxuICAgICAgICB5OiAwXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgIFR3ZWVuTGl0ZS50byBAJGNsb3NlQnRuLCAuMyxcbiAgICAgICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICAgICAgZWFzZTogTGluZWFyLmVhc2VOb25lXG5cbiAgICBlbHNlXG4gICAgICBUd2VlbkxpdGUuZnJvbVRvIEAkZWwsIEBGT1JNX1RXRUVOX1RJTUUgKyAuMSwgeTogMjAwMCxcbiAgICAgICAgeTogMFxuICAgICAgICBhdXRvQWxwaGE6IDFcbiAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0LFxuXG4gICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgVHdlZW5MaXRlLnRvIEAkY2xvc2VCdG4sIC4zLFxuICAgICAgICAgICAgYXV0b0FscGhhOiAxXG4gICAgICAgICAgICBlYXNlOiBMaW5lYXIuZWFzZU5vbmVcblxuXG4gICMgSGlkZXMgdGhlIHZpZXdcblxuICBoaWRlOiAtPlxuICAgIEB0cmlnZ2VyIEFwcEV2ZW50LkNMT1NFX1NIQVJFXG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIFR3ZWVuTGl0ZS50byBAJGVsLCAuNixcbiAgICAgICAgeTogd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgIEByZW1vdmUoKVxuXG4gICAgZWxzZVxuICAgICAgVHdlZW5MaXRlLnRvIEAkY2xvc2VCdG4sIC4yLFxuICAgICAgICBhdXRvQWxwaGE6IDBcblxuICAgICAgVHdlZW5MaXRlLnRvIEAkZWwsIEBGT1JNX1RXRUVOX1RJTUUgKyAuMSxcbiAgICAgICAgeTogMjAwMFxuICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgZWFzZTogRXhwby5lYXNlSW5cbiAgICAgICAgZGVsYXk6IC4xXG5cbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICBAcmVtb3ZlKClcblxuXG4gICMgRXZlbnQgaGFuZGxlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLVxuXG4gICMgSGFuZGxlciBmb3IgbGluayBidXR0b24gY2xpY2tzXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uTGlua0J0bkNsaWNrOiAoZXZlbnQpID0+XG4gICAgY29uc29sZS5sb2cgJ2xpbmsgYnRuJ1xuXG5cbiAgb25JbnB1dEtleVByZXNzOiAoZXZlbnQpID0+XG4gICAga2V5ID0gZXZlbnQud2hpY2ggb3IgZXZlbnQua2V5Q29kZVxuXG4gICAgIyBFTlRFUiBrZXlcbiAgICBpZiBrZXkgaXMgMTNcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpXG4gICAgICBAb25JbnB1dEJsdXIoKVxuICAgICAgQG9uU2VsZWN0WW91clNlcnZpY2VCdG5DbGljaygpXG5cblxuICBvbklucHV0Qmx1cjogKGV2ZW50KSA9PlxuICAgIFR3ZWVuTGl0ZS50byAkKCdib2R5JyksIDAsXG4gICAgICBzY3JvbGxUb3A6IDBcbiAgICAgIHNjcm9sbExlZnQ6IDBcblxuXG4gICMgSGFuZGxlciBmb3IgbW9kZWwgYHNoYXJlSWRgIGNoYW5nZXMgd2hpY2ggdHJpZ2dlcnMgdGhlXG4gICMgcmVuZGVyaW5nIG9mIHRoZSBzaGFyZSBvcHRpb25zXG4gICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICBvblNoYXJlSWRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICBzaGFyZUlkID0gbW9kZWwuY2hhbmdlZC5zaGFyZUlkXG5cbiAgICBpZiBzaGFyZUlkIGlzIG51bGxcbiAgICAgIHJldHVyblxuXG4gICAgVHdlZW5MaXRlLnRvIEAkcHJlbG9hZGVyLCAuMixcbiAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgc2NhbGU6IDBcbiAgICAgIGVhc2U6IEJhY2suZWFzZUluXG5cbiAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgIEAkc2VydmljZUJ0bi5yZW1vdmVDbGFzcyAnbm8tdHJhbnNpdGlvbidcbiAgICAgICAgQCRzZXJ2aWNlQnRuLmF0dHIgJ3N0eWxlJywgJydcblxuICAgICAgICBpZiBzaGFyZUlkIGlzICdlcnJvcidcbiAgICAgICAgICBAJHNlcnZpY2VUZXh0LnRleHQgJ0Vycm9yIHNhdmluZyB0cmFjay4nXG5cbiAgICAgICAgICBfLmRlbGF5ID0+XG4gICAgICAgICAgICBAaGlkZSgpXG4gICAgICAgICAgLCAyMDAwXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIEByZW5kZXJTZXJ2aWNlT3B0aW9ucygpXG5cbiAgICAgICAgVHdlZW5MaXRlLnRvIEAkc2VydmljZVRleHQsIC4yLCBhdXRvQWxwaGE6IDFcblxuXG4gICMgSGFuZGxlciBmb3Igc2VsZWN0IHNlcnZpY2UgYnV0dG9uIGNsaWNrcy4gIFRyaWdnZXJzIHRoZSBwb3N0IHRvXG4gICMgUGFyc2UgYnkgc2V0dGluZyB0aGUgdmFsdWVzIG9mIHRoZSBpbnB1dCBmaWVsZHMuXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uU2VsZWN0WW91clNlcnZpY2VCdG5DbGljazogKGV2ZW50KSA9PlxuICAgIGlmIEBmb3JtVmFsaWQoKSBpcyBmYWxzZSB0aGVuIHJldHVyblxuXG4gICAgQCRwcmVsb2FkZXIuc2hvdygpXG4gICAgQCRzZXJ2aWNlQnRuLmFkZENsYXNzICduby10cmFuc2l0aW9uJ1xuICAgIFR3ZWVuTGl0ZS50byBAJHNlcnZpY2VCdG4sIC4yLCBiYWNrZ3JvdW5kQ29sb3I6ICdibGFjaydcbiAgICBUd2VlbkxpdGUudG8gQCRzZXJ2aWNlVGV4dCwgLjIsIGF1dG9BbHBoYTogMFxuXG4gICAgVHdlZW5MaXRlLnRvIEAkcHJlbG9hZGVyLCAuMixcbiAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgc2NhbGU6IGlmIEBpc01vYmlsZSB0aGVuIC43IGVsc2UgMVxuICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG4gICAgICBkZWxheTogLjFcblxuICAgIEBzaGFyZWRUcmFja01vZGVsLnNldFxuICAgICAgJ3NoYXJlTmFtZSc6IEAkbmFtZUlucHV0LnZhbCgpXG4gICAgICAnc2hhcmVUaXRsZSc6IEAkdGl0bGVJbnB1dC52YWwoKVxuICAgICAgJ3NoYXJlTWVzc2FnZSc6IEBTSEFSRV9NU0dcblxuICAgIEB0cmlnZ2VyIEFwcEV2ZW50LlNBVkVfVFJBQ0tcblxuXG4gIG9uQmFja0J0bkNsaWNrOiAoZXZlbnQpID0+XG4gICAgQHNob3dGb3JtKClcblxuXG4gICMgSGFuZGxlciBmb3IgY2xvc2UgYnRuIHByZXNzLlxuICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICBvbkNsb3NlQnRuUHJlc3M6IChldmVudCkgPT5cbiAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzICdwcmVzcydcbiAgICBAaGlkZSgpXG5cblxuICAjIEhhbmRsZXIgZm9yIGNsb3NlIGJ0biBjbGlja3MuICBEZXN0cm95cyB0aGUgdmlld1xuICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICBvbkNsb3NlQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzICdwcmVzcydcbiAgICBAaGlkZSgpXG5cblxuICBvbkNvcHlCdG5DbGljazogKGV2ZW50KSA9PlxuICAgIHVubGVzcyBAdHdlZW5pbmdDb3B5VGV4dFxuICAgICAgQHR3ZWVuaW5nQ29weVRleHQgPSB0cnVlXG5cbiAgICAgICRidG4gPSBAJGNvcHlCdG5cbiAgICAgICR0ZXh0ID0gJGJ0bi5maW5kICcudGV4dCdcblxuICAgICAgYnRuSHRtbCA9ICRidG4uaHRtbCgpXG4gICAgICB0d2VlblRpbWUgPSAuMlxuICAgICAgZGVsYXkgPSAxXG5cbiAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gJHRleHQsIHR3ZWVuVGltZSwgYXV0b0FscGhhOiAxLFxuICAgICAgICBhdXRvQWxwaGE6IDBcblxuICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICR0ZXh0Lmh0bWwgJ0NPUElFRCEnXG5cbiAgICAgICAgICBUd2VlbkxpdGUuZnJvbVRvICR0ZXh0LCB0d2VlblRpbWUsIGF1dG9BbHBoYTogMCxcbiAgICAgICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICAgICAgZGVsYXk6IC4xXG5cbiAgICAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gJHRleHQsIHR3ZWVuVGltZSwgYXV0b0FscGhhOiAxLFxuICAgICAgICAgICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICAgICAgICAgIGRlbGF5OiBkZWxheVxuXG4gICAgICAgICAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICAgIEB0d2VlbmluZ0NvcHlUZXh0ID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICR0ZXh0Lmh0bWwgYnRuSHRtbFxuICAgICAgICAgICAgICAgICAgJHRleHQuYXR0ciAnc3R5bGUnLCAnJ1xuXG4gICAgICAgICAgICAgICAgICBUd2VlbkxpdGUuZnJvbVRvICR0ZXh0LCB0d2VlblRpbWUsIGF1dG9BbHBoYTogMCxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0FscGhhOiAxXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiAuMVxuXG5cbiAgb25UdW1ibHJCdG5DbGljazogKGV2ZW50KSA9PlxuICAgIHVybCA9ICdodHRwOi8vd3d3LnR1bWJsci5jb20vc2hhcmUvbGluaydcbiAgICB1cmwgKz0gJz91cmw9JyArIGVuY29kZVVSSUNvbXBvbmVudChAc2hhcmVEYXRhLnNoYXJlTGluaylcbiAgICB1cmwgKz0gJyZuYW1lPScgK2RvY3VtZW50LnRpdGxlXG4gICAgdXJsICs9ICcmZGVzY3JpcHRpb249JyArZW5jb2RlVVJJQ29tcG9uZW50KEBTSEFSRV9NU0cpXG5cbiAgICB3aW5kb3cub3Blbih1cmwsICdzaGFyZScsICd3aWR0aD00NTAsaGVpZ2h0PTQzMCcpXG5cblxuICAjIFByZXZlbnQgYmFja2dyb3VuZCBjbGlja3MgZnJvbSBwcm9wYWdhdGluZyBkb3duIHRocm91Z2ggdG8gdHJpZ2dlciBjbG9zZVxuICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICBvbldyYXBwZXJDbGljazogKGV2ZW50KSA9PlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcblxuICAgIGlmICR0YXJnZXQuaGFzQ2xhc3MoJ2ljb24nKVxuICAgICAgJHRhcmdldC50cmlnZ2VyKCdjbGljaycpXG5cbiAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgIHJldHVybiBmYWxzZVxuXG5cbiAgIyBQcml2YXRlXG4gICMgLS0tLS0tLVxuXG4gIGZvcm1WYWxpZDogLT5cbiAgICBpZiBAJHRpdGxlSW5wdXQudmFsKCkgaXMgJydcbiAgICAgIEAkdGl0bGVJbnB1dC5hdHRyICdwbGFjZWhvbGRlcicsICdQbGVhc2UgZW50ZXIgdGl0bGUnXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGlmIEAkbmFtZUlucHV0LnZhbCgpIGlzICcnXG4gICAgICBAJG5hbWVJbnB1dC5hdHRyICdwbGFjZWhvbGRlcicsICdQbGVhc2UgZW50ZXIgbmFtZSdcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgcmV0dXJuIHRydWVcblxuXG4gIHNob3dQcmV2aWV3OiAtPlxuICAgIFR3ZWVuTGl0ZS50byBAJGZvcm0sIEBGT1JNX1RXRUVOX1RJTUUsXG4gICAgICBhdXRvQWxwaGE6IDBcbiAgICAgIHg6IC0zMDBcbiAgICAgIGVhc2U6IEV4cG8uZWFzZUluXG5cbiAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgIEAkZm9ybS5oaWRlKClcblxuICAgICAgICBkYXRhID0gQHNoYXJlZFRyYWNrTW9kZWwudG9KU09OKClcbiAgICAgICAgZGF0YS5pc0Rlc2t0b3AgPSAhIEBpc01vYmlsZVxuXG4gICAgICAgICMgUmVuZGVyIHByZXZpZXcgdGVtcGxhdGUgYW5kIHNoYXJlIHRoZW4gZGlzcGxheVxuICAgICAgICBAJHByZXZpZXcuaHRtbCBwcmV2aWV3VGVtcGxhdGUgZGF0YVxuXG4gICAgICAgIEAkYmFja0J0biA9IEAkcHJldmlldy5maW5kICcuYnRuLWJhY2snXG4gICAgICAgIEAkY29weUJ0biA9IEAkcHJldmlldy5maW5kICcuYnRuLWNvcHktdXJsJ1xuXG4gICAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRwcmV2aWV3LCAuNCwgYXV0b0FscGhhOiAwLCB4OiAzMDAsXG4gICAgICAgICAgYXV0b0FscGhhOiAxXG4gICAgICAgICAgeDogMFxuICAgICAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuXG4gICAgICAgICMgQWRkIGluIGxpYiBmb3IgY29weWluZyB0byBjbGlwYm9hcmRcbiAgICAgICAgQGNyZWF0ZUNsaXBib2FyZExpc3RlbmVycygpXG5cbiAgICAgICAgQCRiYWNrQnRuLm9uICd0b3VjaGVuZCcsIEBvbkJhY2tCdG5DbGlja1xuICAgICAgICBAJGNvcHlCdG4ub24gJ3RvdWNoZW5kJywgQG9uQ29weUJ0bkNsaWNrXG5cblxuICBzaG93Rm9ybTogPT5cbiAgICBAJGJhY2tCdG4ub2ZmICd0b3VjaGVuZCcsIEBvbkJhY2tCdG5DbGlja1xuICAgIEAkY29weUJ0bi5vZmYgJ3RvdWNoZW5kJywgQG9uQ29weUJ0bkNsaWNrXG5cbiAgICBUd2VlbkxpdGUudG8gQCRwcmV2aWV3LCBARk9STV9UV0VFTl9USU1FLFxuICAgICAgYXV0b0FscGhhOiAwXG4gICAgICB4OiAzMDBcbiAgICAgIGVhc2U6IEV4cG8uZWFzZUluXG5cbiAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgIEAkZm9ybS5zaG93KClcblxuICAgICAgICBUd2VlbkxpdGUuZnJvbVRvIEAkZm9ybSwgLjQsIGF1dG9BbHBoYTogMCwgeDogLTMwMCxcbiAgICAgICAgICBhdXRvQWxwaGE6IDFcbiAgICAgICAgICB4OiAwXG4gICAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG5cblxuICAjIFJlbmRlcnMgb3V0IHRoZSBzaGFyZSBzZWxlY3Rpb24gb3B0aW9ucyBhZnRlciB0aGUgdHJhY2sgaGFzXG4gICMgYmVlbiBwb3N0ZWQgdG8gUGFyc2VcblxuICByZW5kZXJTZXJ2aWNlT3B0aW9uczogPT5cbiAgICBzaGFyZUxpbmsgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgJy8jc2hhcmUvJyArIEBhcHBNb2RlbC5nZXQgJ3NoYXJlSWQnXG4gICAgQHNoYXJlZFRyYWNrTW9kZWwuc2V0ICdzaGFyZUxpbmsnLCBzaGFyZUxpbmtcbiAgICBAc2hvd1ByZXZpZXcoKVxuICAgIEBzaGFyZURhdGEgPSBAc2hhcmVkVHJhY2tNb2RlbC50b0pTT04oKVxuICAgIEBhcHBNb2RlbC5zZXQgJ3NoYXJlSWQnLCBudWxsXG5cbiAgICAkLmdldFNjcmlwdCAnLy9wbGF0Zm9ybS50dW1ibHIuY29tL3YxL3NoYXJlLmpzJ1xuXG4gICAgXy5kZWxheSA9PlxuICAgICAgU2hhcmUuaW5pdCgpXG4gICAgLCA1MDBcblxuXG4gIGNyZWF0ZUNsaXBib2FyZExpc3RlbmVyczogPT5cbiAgICBAY2xpcGJvYXJkQ2xpZW50ID0gbmV3IFplcm9DbGlwYm9hcmQoIEAkY29weUJ0biApXG4gICAgQGNsaXBib2FyZENsaWVudC5vbiAnbG9hZCcsIChjbGllbnQpIC0+XG5cbiAgICBAY2xpcGJvYXJkQ2xpZW50Lm9uICdkYXRhcmVxdWVzdGVkJywgKGNsaWVudCkgLT5cbiAgICAgIEBjbGlwYm9hcmRDbGllbnQuc2V0VGV4dCh0aGlzLmlubmVySFRNTClcblxuICAgIEBjbGlwYm9hcmRDbGllbnQub24gJ2NvbXBsZXRlJywgKGNsaWVudCwgYXJncykgLT5cbiAgICAgIGNvbnNvbGUubG9nKFwiQ29waWVkIHRleHQgdG8gY2xpcGJvYXJkOiBcIiArIGFyZ3MudGV4dCApXG5cbiAgICBAY2xpcGJvYXJkQ2xpZW50Lm9uICd3cm9uZ2ZsYXNoIG5vZmxhc2gnLCAtPlxuICAgICAgWmVyb0NsaXBib2FyZC5kZXN0cm95KClcblxuICAgIEBjbGlwYm9hcmRDbGllbnQub24gJ21vdXNlb3ZlcicsIChjbGllbnQsIGFyZ3MpID0+XG4gICAgICBAJGNvcHlCdG4uYWRkQ2xhc3MgJ21vdXNlb3ZlcidcblxuICAgIEBjbGlwYm9hcmRDbGllbnQub24gJ21vdXNlb3V0JywgKGNsaWVudCwgYXJncykgPT5cbiAgICAgIEAkY29weUJ0bi5yZW1vdmVDbGFzcyAnbW91c2VvdmVyJ1xuXG4gICAgQGNsaXBib2FyZENsaWVudC5vbiAnbW91c2V1cCcsIChjbGllbnQsIGFyZ3MpID0+XG4gICAgICBAb25Db3B5QnRuQ2xpY2soKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gU2hhcmVNb2RhbFxuIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tY2xvc2UnPlxcblx0XHRcdFhcXG5cdFx0PC9kaXY+XFxuXHRcIjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblx0XHRcdDxkaXYgY2xhc3M9J2J0bi1jbG9zZS1zaGFyZSc+XFxuXHRcdFx0XHQmbHQ7IEJhY2tcXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XCI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTUoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJcXG5cdFx0XHRcdDxkaXYgY2xhc3M9J21lc3NhZ2UnPlxcblx0XHRcdFx0XHRQbGVhc2UgbmFtZSB5b3VyIGJlYXQgYmVmb3JlIHNoYXJpbmdcXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdFwiO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz0nd3JhcHBlcic+XFxuXFxuXHRcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmlzRGVza3RvcCwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcblx0PGRpdiBjbGFzcz0nZm9ybS13cmFwcGVyJz5cXG5cXG5cdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnMudW5sZXNzLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMywgcHJvZ3JhbTMsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXHRcdDxoMT5cXG5cdFx0XHRTaGFyZSBZb3VyIEJlYXRcXG5cdFx0PC9oMT5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLWZvcm0nPlxcblxcblx0XHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oNSwgcHJvZ3JhbTUsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXHRcdFx0PGRpdiBjbGFzcz0naW5wdXQtZ3JvdXAgdGV4dC1pbnB1dCc+XFxuXHRcdFx0XHQ8c3BhbiBjbGFzcz0nbGFiZWwtaW5wdXQnPlRpdGxlPC9zcGFuPlxcblx0XHRcdFx0PGlucHV0IGNsYXNzPSdpbnB1dC10aXRsZScgcGxhY2Vob2xkZXI9J3RpdGxlJyAvPlxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdDxkaXYgY2xhc3M9J2lucHV0LWdyb3VwIHRleHQtaW5wdXQgbmFtZSc+XFxuXHRcdFx0XHQ8c3BhbiBjbGFzcz0nbGFiZWwtaW5wdXQnPk5hbWU8L3NwYW4+XFxuXHRcdFx0XHQ8aW5wdXQgY2xhc3M9J2lucHV0LW5hbWUnIHBsYWNlaG9sZGVyPSduYW1lJyAvPlxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdFwiXG4gICAgKyBcIlxcblxcblx0XHRcdDxkaXYgY2xhc3M9J2J0bi1zZWxlY3Qtc2VydmljZSc+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPSd0ZXh0Jz5cXG5cdFx0XHRcdFx0U2VsZWN0IFlvdXIgU2VydmljZVxcblx0XHRcdFx0PC9kaXY+XFxuXFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPSdwcmVsb2FkZXInIC8+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdjb250YWluZXItcHJldmlldyc+XFxuXFxuXHRcdDwvZGl2Plxcblxcblx0PC9kaXY+XFxuXFxuPC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8ZGl2IGNsYXNzPSdidG4tY29weS11cmwnIGRhdGEtY2xpcGJvYXJkLXRleHQ9J1wiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5zaGFyZUxpbmspIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLnNoYXJlTGluazsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIic+XFxuXHRcdDxkaXYgY2xhc3M9J3RleHQnPlxcblx0XHRcdDxkaXYgY2xhc3M9J3VybCc+XFxuXFxuXHRcdFx0PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz0nY29weSc+XFxuXHRcdFx0XHRDT1BZIExJTktcXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlxcbjxkaXYgY2xhc3M9J2J0bi1iYWNrJz5cXG5cdCZsdDsgRURJVCBGSUVMRFNcXG48L2Rpdj5cXG48ZGl2IGNsYXNzPSd0cmFjay1kYXRhJz5cXG5cdDxoMT5cXG5cdFx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLnNoYXJlTmFtZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuc2hhcmVOYW1lOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHQ8L2gxPlxcblx0PGgzPlxcblx0XHRcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuc2hhcmVUaXRsZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuc2hhcmVUaXRsZTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC9oMz5cXG5cdDxwPlxcblx0XHRcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuc2hhcmVNZXNzYWdlKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5zaGFyZU1lc3NhZ2U7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdDwvcD5cXG48L2Rpdj5cXG5cXG5cXG5cIlxuICAgICsgXCJcXG5cXG48ZGl2IGNsYXNzPSdzZXJ2aWNlcyc+XFxuXHQ8c3Bhbj5cXG5cdFx0U2VsZWN0IGEgU2VydmljZVxcblx0PC9zcGFuPlxcblxcblx0PGRpdiBjbGFzcz0nc2VydmljZS1idG5zJz5cXG5cdFx0PGRpdiBjbGFzcz0nYnRuLWZhY2Vib29rIGljb24tZmFjZWJvb2sgaWNvbidcXG5cdFx0XHRkYXRhLXNoYXJlLWZhY2Vib29rXFxuXHRcdFx0ZGF0YS1zaGFyZS1kZXNjcmlwdGlvbj1cXFwiXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLnNoYXJlTWVzc2FnZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuc2hhcmVNZXNzYWdlOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIlxcblx0XHRcdGRhdGEtc2hhcmUtbGluaz1cXFwiXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmVuY29kZWRVcmwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmVuY29kZWRVcmw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiXFxuXHRcdFx0ZGF0YS1zaGFyZS1uYW1lPVxcXCJcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuc2hhcmVUaXRsZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuc2hhcmVUaXRsZTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCJcXG5cdFx0XHRkYXRhLXNoYXJlLWNhcHRpb249XFxcIkNhcHRpb25cXFwiPlxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz0nYnRuLXR3aXR0ZXIgaWNvbi10d2l0dGVyIGljb24nXFxuXHRcdFx0ZGF0YS1zaGFyZS10d2l0dGVyXFxuXHRcdFx0ZGF0YS1zaGFyZS1kZXNjcmlwdGlvbj1cXFwiXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLnNoYXJlTWVzc2FnZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuc2hhcmVNZXNzYWdlOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIlxcblx0XHRcdGRhdGEtc2hhcmUtbGluaz1cXFwiXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmVuY29kZWRVcmwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmVuY29kZWRVcmw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiPlxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz0nYnRuLXR1bWJsciBpY29uLXR1bWJsciBpY29uJz5cXG5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG48L2Rpdj5cXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmlzRGVza3RvcCwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCI7XG4gIGJ1ZmZlciArPSBcIlxcblxcblx0XHQ8ZGl2IGNsYXNzPSdiZy1jaXJjbGUnIC8+XFxuXFxuXHRcdDxkaXYgY2xhc3M9J2J0bi1pbmNyZWFzZSBidG4tY2lyY2xlJz5cXG5cdFx0XHQrXFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdsYWJlbC1icG0nPlxcblx0XHRcdEJQTVxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nYnBtLXZhbHVlJz5cXG5cdFx0XHQwXFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tZGVjcmVhc2UgYnRuLWNpcmNsZSc+XFxuXHRcdFx0LVxcblx0XHQ8L2Rpdj5cXG5cXG5cXG5cXG5cXG5cdFwiXG4gICAgKyBcIlxcblxcblx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJcXG5cdFx0PGRpdiBjbGFzcz0nbGFiZWwtYnBtJz5cXG5cdFx0XHRCUE1cXG5cdFx0PC9kaXY+XFxuXFxuXHRcdDxkaXYgY2xhc3M9J2J0bi1kZWNyZWFzZSc+XFxuXHRcdFx0LVxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nYnBtLXZhbHVlJz5cXG5cdFx0XHQwXFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdidG4taW5jcmVhc2UnPlxcblx0XHRcdCtcXG5cdFx0PC9kaXY+XFxuXFxuXHRcIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlxcblxcblxcbjxkaXYgY2xhc3M9J3dyYXBwZXInPlxcblxcblxcblx0XCJcbiAgICArIFwiXFxuXFxuXHRcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmlzRGVza3RvcCwge2hhc2g6e30saW52ZXJzZTpzZWxmLnByb2dyYW0oMywgcHJvZ3JhbTMsIGRhdGEpLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIjtcbiAgYnVmZmVyICs9IFwiXFxuXFxuXHQ8ZGl2IGNsYXNzPSd3cmFwcGVyJz5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nYmctaGFsZi1jaXJjbGUnIC8+XFxuXFxuXHRcdDxkaXYgY2xhc3M9J2xhYmVsLXNlbGVjdCc+XFxuXHRcdFx0U2VsZWN0IEtpdFxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nYnRuLWxlZnQnPlxcblx0XHRcdCZsdDtcXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9J2xhYmVsLWtpdCc+XFxuXHRcdFx0PGRpdj5cXG5cdFx0XHRcdERSVU0gS0lUXFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tcmlnaHQnPlxcblx0XHRcdCZndDtcXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cXG5cXG5cXG5cIlxuICAgICsgXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblxcblx0PGRpdiBjbGFzcz0nd3JhcHBlcic+XFxuXHRcdDxkaXYgY2xhc3M9J2J0bi1sZWZ0IGJ0bic+XFxuXHRcdFx0Jmx0O1xcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz0nbGFiZWwta2l0Jz5cXG5cdFx0XHQ8ZGl2Plxcblx0XHRcdFx0RFJVTSBLSVRcXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXFxuXHRcdDxkaXYgY2xhc3M9J2J0bi1yaWdodCBidG4nPlxcblx0XHRcdCZndDtcXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlxcblxcblwiXG4gICAgKyBcIlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSd3cmFwcGVyJz5cXG5cdDxkaXYgY2xhc3M9XFxcImxhYmVsXFxcIj5cXG5cdFx0UEFUVEVSTlNcXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz0nY29udGFpbmVyLWJ0bnMnPlxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tcGF0dGVybi0xIGJ0bic+MTwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tcGF0dGVybi0xIGJ0bic+MjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tcGF0dGVybi0xIGJ0bic+MzwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tcGF0dGVybi0xIGJ0bic+NDwvZGl2Plxcblx0PC9kaXY+XFxuPC9kaXY+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblx0PGRpdiBjbGFzcz0nYnRuLXBsYXkgaWNvbi1wbGF5Jz48L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J2J0bi1wYXVzZSBpY29uLXBhdXNlJz48L2Rpdj5cXG5cXG5cIjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblxcblx0PGRpdiBjbGFzcz0nYnRuLXBsYXkgaWNvbi1wbGF5Jz48L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J2J0bi1wYXVzZSBpY29uLXBhdXNlJz48L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J2xhYmVsLWJ0bic+XFxuXHRcdFBBVVNFXFxuXHQ8L2Rpdj5cXG5cXG5cIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdidG4tc3RlcHMnPlxcblx0U1RFUFNcXG48L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPSdidG4tcGFkcyc+XFxuXHRQQURcXG48L2Rpdj5cXG5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIjtcbiAgYnVmZmVyICs9IFwiXFxuXFxuXHQ8ZGl2IGNsYXNzPSd3cmFwcGVyJz5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLXNlcXVlbmNlcic+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz0nY29sdW1uLTAnPlxcblx0XHRcdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLXRvZ2dsZSc+PC9kaXY+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPSdidG4tY2xlYXInPkNMRUFSIFNFUVVFTkNFUjwvZGl2Plxcblx0XHRcdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLXBsYXktcGF1c2UnPjwvZGl2Plxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdDxkaXYgY2xhc3M9J2NvbHVtbi0xJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9J3NlcXVlbmNlcic+XFxuXFxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9J3BhdHRlcm4tc2VsZWN0b3InPlxcblx0XHRcdFx0XHRcdFBhdHRlcm4gU2VsZWN0b3JcXG5cdFx0XHRcdFx0PC9kaXY+XFxuXFxuXHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHRcdDxkaXYgc3R5bGU9J3Bvc2l0aW9uOnJlbGF0aXZlJz5cXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz0nbGl2ZS1wYWQnPlxcblxcblx0XHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdDxkaXYgY2xhc3M9J2NvbHVtbi0zJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9J2JwbSc+QlBNPC9kaXY+XFxuXHRcdFx0PC9kaXY+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiY29sdW1uLTRcXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz0nYnRuLXNoYXJlJz5cXG5cdFx0XHRcdFx0U0hBUkVcXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdDwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2PlxcblxcblxcblxcblxcblwiXG4gICAgKyBcIlxcblxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIjtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8ZGl2IGNsYXNzPSd3cmFwcGVyJz5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLXNlcXVlbmNlcic+XFxuXHRcdFx0XCJcbiAgICArIFwiXFxuXHRcdFx0PGRpdiBjbGFzcz0ncm93LTEnPlxcblx0XHRcdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLXBsYXktcGF1c2UnPjwvZGl2Plxcblx0XHRcdFx0PGRpdiBjbGFzcz0nYnRuLXNoYXJlJz5cXG5cdFx0XHRcdFx0U0hBUkVcXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdFwiXG4gICAgKyBcIlxcblx0XHRcdDxkaXYgY2xhc3M9J3Jvdy0yJz5cXG5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHRcIlxuICAgICsgXCJcXG5cdFx0XHQ8ZGl2IGNsYXNzPSdyb3ctMyc+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPSdidG4tY2xlYXInPlxcblx0XHRcdFx0XHRDTEVBUlxcblx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPSdidG4tamFtLWxpdmUnPlxcblx0XHRcdFx0XHRKQU0gTElWRSAmZ3Q7XFxuXHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHRcIlxuICAgICsgXCJcXG5cdFx0XHQ8ZGl2IGNsYXNzPSdyb3ctNCc+XFxuXFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdjb250YWluZXItbGl2ZS1wYWQnPlxcblx0XHRcdExJVkUgUEFEXFxuXHRcdDwvZGl2Plxcblxcblx0PC9kaXY+XFxuXFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBidWZmZXIgKz0gXCJcXG5cXG5cIlxuICAgICsgXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmlzRGVza3RvcCwge2hhc2g6e30saW52ZXJzZTpzZWxmLnByb2dyYW0oMywgcHJvZ3JhbTMsIGRhdGEpLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIiMjIypcbiAqIExhbmRpbmcgdmlldyB3aXRoIHN0YXJ0IGJ1dHRvbiBhbmQgaW5pdGlhbCBhbmltYXRpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5QdWJTdWIgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL1B1YlN1YidcblB1YkV2ZW50ID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9sYW5kaW5nLXRlbXBsYXRlLmhicydcblxuY2xhc3MgTGFuZGluZ1ZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgIyBUaGUgdGltZSBiZWZvcmUgdGhlIHZpZXcgZmlyc3QgYXBwZWFyc1xuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgU0hPV19ERUxBWTogMVxuXG4gICMgVGhlIHRleHQgdGhhdCBhcHBlYXJzIGFmdGVyIGluc3RydWN0aW9uc1xuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgU1RBUlRfQlROX1RFWFQ6ICdHRVQgU1RBUlRFRCdcblxuICAjIFRoZSBjb250YWluZXIgY2xhc3NcbiAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gIGNsYXNzTmFtZTogJ2NvbnRhaW5lci1sYW5kaW5nJ1xuXG4gICMgVGVtcGxhdGVcbiAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cbiAgIyBCb29sZWFuIHRvIGNoZWNrIGlmIGluc3RydWN0aW9ucyBzaG91bGQgYXBwZWFyXG4gICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgaW5zdHJ1Y3Rpb25zU2hvd2luZzogZmFsc2VcblxuXG4gIGV2ZW50czpcbiAgICAnbW91c2VvdmVyIC5idG4tc3RhcnQnOiAnb25Nb3VzZU92ZXInXG4gICAgJ21vdXNlb3V0ICAuYnRuLXN0YXJ0JzogJ29uTW91c2VPdXQnXG4gICAgJ3RvdWNoZW5kICAuYnRuLXN0YXJ0JzogJ29uU3RhcnRCdG5DbGljaydcbiAgICAndG91Y2hlbmQgIC5idG4taW5zdHJ1Y3Rpb25zJzogJ29uSW5zdHJ1Y3Rpb25zQnRuQ2xpY2snXG5cblxuICAjIFJlbmRlciB0aGUgdmlld1xuXG4gIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgQGluc3RydWN0aW9uc1Nob3dpbmcgPSBmYWxzZVxuXG4gICAgQCRtYWluQ29udGFpbmVyID0gJCgnI2NvbnRhaW5lci1tYWluJylcbiAgICBAJHdyYXBwZXIgPSBAJGVsLmZpbmQgJy53cmFwcGVyJ1xuICAgIEAkbGFuZGluZyA9IEAkZWwuZmluZCAnLmxhbmRpbmcnXG4gICAgQCRpbnN0cnVjdGlvbnMgPSBAJGVsLmZpbmQgJy5pbnN0cnVjdGlvbnMnXG4gICAgQCRsb2dvID0gQCRlbC5maW5kICcubG9nbydcbiAgICBAJG1lc3NhZ2UgPSBAJGVsLmZpbmQgJy5tZXNzYWdlJ1xuICAgIEAkc3RhcnRCdG4gPSBAJGVsLmZpbmQgJy5idG4tc3RhcnQnXG4gICAgQCRpbnN0cnVjdGlvbnNCdG4gPSBAJGVsLmZpbmQgJy5idG4taW5zdHJ1Y3Rpb25zJ1xuXG4gICAgQHZpZXdlZEluc3RydWN0aW9ucyA9ICQuY29va2llKCdtcGNhaGgtaW5zdHJ1Y3Rpb25zLXZpZXdlZCcpXG5cbiAgICBUd2VlbkxpdGUuc2V0IEAkZWwsIGF1dG9BbHBoYTogMFxuICAgIEBcblxuXG4gICMgQW5pbWF0ZSBpbiB0aGUgZmlyc3QgbGFuZGluZyB2aWV3XG5cbiAgc2hvdzogLT5cbiAgICBkZWxheSA9IEBTSE9XX0RFTEFZXG5cbiAgICBUd2VlbkxpdGUudG8gQCRlbCwgLjMsIGF1dG9BbHBoYTogMVxuICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRsb2dvLCAuNCwgeDogLTIwMCwgYXV0b0FscGhhOiAwLFxuICAgICAgYXV0b0FscGhhOiAxXG4gICAgICB4OiAwXG4gICAgICBlYXNlOiBFeHBvLmVhc2VPdXRcbiAgICAgIGRlbGF5OiBkZWxheVxuXG4gICAgVHdlZW5MaXRlLmZyb21UbyBAJG1lc3NhZ2UsIC40LCB4OiAyMDAsIGF1dG9BbHBoYTogMCxcbiAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgeDogMFxuICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG4gICAgICBkZWxheTogZGVsYXlcblxuICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRzdGFydEJ0biwgLjQsIHk6IDIwMCwgYXV0b0FscGhhOiAwLFxuICAgICAgYXV0b0FscGhhOiAxXG4gICAgICB5OiAwXG4gICAgICBlYXNlOiBFeHBvLmVhc2VPdXRcbiAgICAgIGRlbGF5OiBkZWxheSArIC4yLFxuXG4gICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICByZXBlYXQgPSAwXG4gICAgICAgIHR3ZWVuID0gVHdlZW5MaXRlLnRvIEAkc3RhcnRCdG4sIC4xLFxuICAgICAgICAgIHNjYWxlOiAxLjFcblxuICAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICB0d2Vlbi5yZXZlcnNlKClcblxuICAgICAgICAgIG9uUmV2ZXJzZUNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgaWYgcmVwZWF0IDwgMVxuICAgICAgICAgICAgICByZXBlYXQrK1xuICAgICAgICAgICAgICB0d2Vlbi5yZXN0YXJ0KClcblxuICAgIGlmIEB2aWV3ZWRJbnN0cnVjdGlvbnNcbiAgICAgIFR3ZWVuTGl0ZS50byBAJGluc3RydWN0aW9uc0J0biwgLjMsXG4gICAgICAgIGF1dG9BbHBoYTogLjRcbiAgICAgICAgZGVsYXk6IEBTSE9XX0RFTEFZICsgMVxuXG4gICAgZWxzZVxuICAgICAgQCRpbnN0cnVjdGlvbnNCdG4uaGlkZSgpXG5cblxuICAjIEhpZGUgdGhlIHZpZXcgYW5kIHRyaWdnZXIgb25lIG9mIHR3byBhbmltYXRpb24gc2VxdWVuY2VzOyB0aGVcbiAgIyBpbnN0cnVjdGlvbnMgcGFnZSBvciB0aGUgYXJyaXZhbCBtZXNzYWdlLiAgRGVwZW5kcyBvbiB3aGV0aGVyXG4gICMgY29va2llIGlzIHNldFxuXG4gIGhpZGU6IChvcHRpb25zKSAtPlxuICAgIHNlbGYgPSBAXG4gICAgZGVsYXkgPSAwXG5cbiAgICByZWRpcmVjdCA9ID0+XG4gICAgICBfLmRlbGF5ID0+XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJyNjcmVhdGUnXG5cbiAgICAgICAgaWYgb3B0aW9ucz8ucmVtb3ZlXG4gICAgICAgICAgc2VsZi5yZW1vdmUoKVxuICAgICAgLCAzMDBcblxuICAgICMgRmFkZSBvdXQgYnV0dG9uXG4gICAgVHdlZW5MaXRlLnRvIEAkc3RhcnRCdG4sIC4zLFxuICAgICAgYXV0b0FscGhhOiAwXG4gICAgICBzY2FsZTogMFxuICAgICAgZWFzZTogQmFjay5lYXNlSW5cbiAgICAgIGRlbGF5OiBkZWxheVxuXG4gICAgIyBJTlNUUlVDVElPTlMgYW5pbWF0aW9uLW91dCBzZXF1ZW5jZSBpZiBpbnN0cnVjdGlvbnMgYXJlIHVwXG4gICAgaWYgQGluc3RydWN0aW9uc1Nob3dpbmcgaXMgdHJ1ZVxuICAgICAgVHdlZW5MaXRlLnRvIEAkZWwsIC4zLCBhdXRvQWxwaGE6IDAsIGRlbGF5OiAuMlxuICAgICAgVHdlZW5MaXRlLnRvIEAkaW5zdHJ1Y3Rpb25zLCAuMyxcbiAgICAgICAgYXV0b0FscGhhOiAwXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluXG4gICAgICAgIGRlbGF5OiBkZWxheSArIC4yXG5cbiAgICAgICAgIyBUcmlnZ2VyIG5ldyByb3V0ZSBhZnRlciBhbmltYXRpb25cbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICByZWRpcmVjdCgpXG5cbiAgICAjIFVzZXIgaGFzIGFscmVhZHkgc2VlbiBpbnN0cnVjdGlvbnMsIG5vcm1hbCBmYWRlIG91dFxuICAgIGVsc2VcbiAgICAgIFR3ZWVuTGl0ZS50byBAJGVsLCAuMywgYXV0b0FscGhhOiAwLCBkZWxheTogLjVcbiAgICAgIFR3ZWVuTGl0ZS50byBAJGxvZ28sIC40LFxuICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgeDogLTIwMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJblxuICAgICAgICBkZWxheTogZGVsYXkgKyAuMlxuXG4gICAgICBUd2VlbkxpdGUudG8gQCRpbnN0cnVjdGlvbnNCdG4sIC4zLFxuICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgZGVsYXk6IGRlbGF5XG5cbiAgICAgIFR3ZWVuTGl0ZS50byBAJG1lc3NhZ2UsIC40LFxuICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgeDogMjAwXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluXG4gICAgICAgIGRlbGF5OiBkZWxheSArIC4yXG5cbiAgICAgICAgIyBUcmlnZ2VyIG5ldyByb3V0ZSBhZnRlciBhbmltYXRpb25cbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICByZWRpcmVjdCgpXG5cblxuICAjIFNob3dzIHRoZSBpbnN0cnVjdGlvbnMgcGFnZSBpZiB0aGUgdXNlciBoYXMgbmV2ZXIgdmlzaXRlZFxuICAjIHRoZSBzaXRlIGJlZm9yZS4gIElmIHRoZXkgaGF2ZSwgYSBjb29raWUgaXMgc2V0IGFuZCB0aGVcbiAgIyBpbnN0cnVjdGlvbnMgYXJlIGJ5cGFzc2VkXG5cbiAgc2hvd0luc3RydWN0aW9uczogLT5cbiAgICBAaW5zdHJ1Y3Rpb25zU2hvd2luZyA9IHRydWVcbiAgICBwcmVEZWxheSA9IC4yXG5cbiAgICBUd2VlbkxpdGUudG8gQCRsYW5kaW5nLCAuMyxcbiAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgQCRsYW5kaW5nLmhpZGUoKVxuICAgICAgICBAJGluc3RydWN0aW9ucy5zaG93KClcblxuICAgIFR3ZWVuTGl0ZS50byBAJGluc3RydWN0aW9uc0J0biwgLjMsXG4gICAgICBhdXRvQWxwaGE6IDBcbiAgICAgIGRlbGF5OiAwXG5cbiAgICBUd2VlbkxpdGUudG8gQCR3cmFwcGVyLCAuOCxcbiAgICAgIGhlaWdodDogNTYyXG4gICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuICAgICAgZGVsYXk6IHByZURlbGF5XG5cbiAgICBUd2VlbkxpdGUuZnJvbVRvIEAkaW5zdHJ1Y3Rpb25zLCAuNCwgaGVpZ2h0OiA5NixcbiAgICAgIGhlaWdodDogMzE1XG4gICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcbiAgICAgIGRlbGF5OiBwcmVEZWxheSArIC4zXG5cbiAgICBUd2VlbkxpdGUudG8gQCRsb2dvLCAuNCxcbiAgICAgIHk6IC0yMFxuICAgICAgZWFzZTogQmFjay5lYXNlSW5cbiAgICAgIGRlbGF5OiBwcmVEZWxheVxuICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgQCRzdGFydEJ0bi50ZXh0IEBTVEFSVF9CVE5fVEVYVFxuICAgICAgICBUd2VlbkxpdGUudG8gQCRsb2dvLCAuNCxcbiAgICAgICAgICB5OiAwXG4gICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG5cbiAgICBUd2VlbkxpdGUudG8gQCRzdGFydEJ0biwgLjQsXG4gICAgICB5OiA0MFxuICAgICAgZWFzZTogQmFjay5lYXNlSW5cbiAgICAgIGRlbGF5OiBwcmVEZWxheVxuXG4gICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICBUd2VlbkxpdGUudG8gQCRpbnN0cnVjdGlvbnMsIC40LCBhdXRvQWxwaGE6IDEsIGRlbGF5OiAwXG5cblxuICAjIEV4aXQgdGhlIGxhbmRpbmcgYW5kIHByb2NlZWQgdG8gYXBwXG5cbiAgZXhpdExhbmRpbmc6IC0+XG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBzbmQgPSBjcmVhdGVqcy5Tb3VuZC5jcmVhdGVJbnN0YW5jZSgnYXNzZXRzL2F1ZGlvL2Nva2UvMDVfX19mZW1hbGVfYWhoaF8wMS5tcDMnKVxuICAgICAgc25kLnZvbHVtZSA9IC4xXG4gICAgICBzbmQucGxheSgpXG5cbiAgICBAJG1haW5Db250YWluZXIuc2hvdygpXG4gICAgQGhpZGUoIHJlbW92ZTogdHJ1ZSApXG5cblxuICAjIEhhbmRsZXIgZm9yIGJ0biBtb3VzZW92ZXJzXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uTW91c2VPdmVyOiAoZXZlbnQpID0+XG4gICAgVHdlZW5MaXRlLnRvIEAkc3RhcnRCdG4sIC4yLFxuICAgICAgYm9yZGVyOiAnM3B4IHNvbGlkIGJsYWNrJ1xuICAgICAgc2NhbGU6IDEuMVxuICAgICAgY29sb3I6ICdibGFjaydcblxuXG4gICMgSGFuZGxlciBmb3IgYnRuIG1vdXNlb3V0XG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uTW91c2VPdXQ6IChldmVudCkgPT5cbiAgICBUd2VlbkxpdGUudG8gQCRzdGFydEJ0biwgLjIsXG4gICAgICBib3JkZXI6ICczcHggc29saWQgI0U0MUUyQidcbiAgICAgIHNjYWxlOiAxXG4gICAgICBjb2xvcjogJyNFNDFFMkInXG5cblxuICAjIEhhbmRsZXIgZm9yIHN0YXJ0IGJ0biBjbGlja3MuICBTZXRzIGEgY29va2llIGlmIHVzZXIgaGFzXG4gICMgYWxyZWFkeSBiZWVuIHRvIHNpdGVcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgb25TdGFydEJ0bkNsaWNrOiAoZXZlbnQpID0+XG4gICAgaWYgQGluc3RydWN0aW9uc1Nob3dpbmcgb3IgQGlzTW9iaWxlIG9yIChAdmlld2VkSW5zdHJ1Y3Rpb25zIGlzICd0cnVlJylcbiAgICAgIEBleGl0TGFuZGluZygpXG5cbiAgICBlbHNlXG4gICAgICAkLmNvb2tpZSgnbXBjYWhoLWluc3RydWN0aW9ucy12aWV3ZWQnLCAndHJ1ZScsIHsgZXhwaXJlczogNyB9KTtcbiAgICAgIEBzaG93SW5zdHJ1Y3Rpb25zKClcblxuXG4gICMgU2hvd3MgdGhlIGluc3RydWN0aW9ucyBzY3JlZW5cbiAgIyBAcGFyYW0ge0V2ZW50fSBldmVudFxuXG4gIG9uSW5zdHJ1Y3Rpb25zQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICBAc2hvd0luc3RydWN0aW9ucygpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYW5kaW5nVmlld1xuIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSd3cmFwcGVyJz5cXG5cXG5cdDxkaXYgY2xhc3M9J2xvZ28nIC8+XFxuXFxuXHQ8ZGl2IGNsYXNzPSdsYW5kaW5nJz5cXG5cdFx0PGRpdiBjbGFzcz0nbWVzc2FnZSc+XFxuXHRcdFx0TE9SRU0gSVBTVU0gRE9MT1IgU0lUIEFNRVQsIENPTlNFQ1RFVFVSIEFESVBTQ0lORyBFTElULiBJTiBBIE1BVFRJUyBRVUFNLlxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz0naW5zdHJ1Y3Rpb25zJz5cXG5cdFx0PGRpdiBjbGFzcz0nZmlyc3QnPlxcblx0XHRcdFBpY2sgYSBCUE0gYW5kIGEgZHJ1bSBraXQgYW5kIHJlYWR5IHlvdXJzZWxmIGZvciB0aGUgPGJyLz4gY29uc2VxdWVuY2VzIG9mIHdvcmxkLXdpZGUgZmFtZS5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXY+XFxuXHRcdFx0RWFjaCBzb25nIGNvbnRhaW5zIGVpZ2h0IHNsb3RzIHdoaWNoIGNvcnJlc3BvbmQgdG8gZWlnaHQgYmVhdHMgcGVyIG1lYXN1cmUuIDxiciAvPlxcblx0XHRcdDxpbWcgc3JjPSdhc3NldHMvaW1hZ2VzL2luc3RydWN0aW9ucy10cmFjay5wbmcnIGNsYXNzPSdpbWctdHJhY2snIC8+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2Plxcblx0XHRcdFRhcCB0aGUgc3F1YXJlIG5leHQgdG8gdGhlIGRydW0gdG8gU0VMRUNUIHRoZSBCRUFUIHZlbG9jaXR5IE9SIFRBUCBUSEUgRFJVTSBUTyBNVVRFIFRIRSBUUkFDSyA8YnIgLz5cXG5cdFx0XHQ8aW1nIHNyYz0nYXNzZXRzL2ltYWdlcy9pbnN0cnVjdGlvbnMtdmVsb2NpdHkucG5nJyBjbGFzcz0naW1nLXZlbG9jaXR5JyAvPlxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdj5cXG5cdFx0XHRKQU0gQUxPTkcgVE8gWU9VUiBCRUFUIEJZIFRBUFBJTkcgVEhFIDxzcGFuPlBBRFM8L3NwYW4+IEJVVFRPTjsgcHJlc3MgYW5kIGhvbGQgcGFkIHRvIHJlYXNzaWduIHNvdW5kXFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPSdidG4tc3RhcnQnPlxcblx0XHRDUkVBVEUgWU9VUiBPV04gSkFNXFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9J2J0bi1pbnN0cnVjdGlvbnMnPlxcblx0XHRWSUVXIElOU1RSVUNUSU9OU1xcblx0PC9kaXY+XFxuXFxuPC9kaXY+XCI7XG4gIH0pIiwiIyMjKlxuICogTW9iaWxlIHZpZXcgaWYgY2FwYWJpbGl0aWVzIGFyZSBub3QgbWV0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA0LjkuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvbm90LXN1cHBvcnRlZC10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIE5vdFN1cHBvcnRlZFZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgY2xhc3NOYW1lOiAnY29udGFpbmVyLW5vdC1zdXBwb3J0ZWQnXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG4gIGV2ZW50czpcbiAgICAndG91Y2hlbmQgLmJ0bi1saXN0ZW4nOiAnb25MaXN0ZW5CdG5DbGljaydcblxuXG4gIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgQCRub3RpZmljYXRpb24gPSBAJGVsLmZpbmQgJy5ub3RpZmljYXRpb24nXG4gICAgQCRzYW1wbGVzID0gQCRlbC5maW5kICcuc2FtcGxlcydcblxuICAgIEBcblxuXG4gIG9uTGlzdGVuQnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICBUd2VlbkxpdGUudG8gQCRub3RpZmljYXRpb24sIC42LFxuICAgICAgYXV0b0FscGhhOiAwXG4gICAgICB4OiAtd2luZG93LmlubmVyV2lkdGhcbiAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cbiAgICBUd2VlbkxpdGUuZnJvbVRvIEAkc2FtcGxlcywgLjYsIHg6IHdpbmRvdy5pbm5lcldpZHRoLCBhdXRvQWxwaGE6IDAsXG4gICAgICBkaXNwbGF5OiAnYmxvY2snXG4gICAgICBhdXRvQWxwaGE6IDFcbiAgICAgIHg6IDBcbiAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBOb3RTdXBwb3J0ZWRWaWV3XG4iLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIlxcbjxkaXYgY2xhc3M9J3dyYXBwZXInPlxcblx0PGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uJz5cXG5cdFx0PGRpdiBjbGFzcz0naGVhZGxpbmUnPlxcblx0XHRcdExPT0tTIExJS0UgTVBDIEFISCBJUyBOT1QgU1VQUE9SVEVEIEJZIFlPVVIgREVWSUNFXFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPSdyZXF1aXJlbWVudHMnPlxcblx0XHRcdE1JTklNVU0gUkVRVUlSRU1FTlRTIEFORFJPSUQgNC4yIC8gaU9TIDZcXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9J2Rlc2t0b3AnPlxcblx0XHRcdFBMRUFTRSBWSVNJVCBUSElTIFNJVEUgT04gWU9VUiBERVNLVE9QIE9SXFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tbGlzdGVuJz5cXG5cdFx0XHRMSVNURU4gVE8gU0FNUExFIEJFQVRTIEZST00gVEhFIE1QQy1BSEggJmd0O1xcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz0nc2FtcGxlcyc+XFxuXHRcdDxkaXYgY2xhc3M9J2hlYWRsaW5lJz5cXG5cdFx0XHRMSVNURU4gVE8gU0FNUExFIEJFQVRTIEZST00gVEhFIE1QQyBBSEhcXG5cdFx0PC9kaXY+XFxuXFxuXHRcdDx0YWJsZT5cXG5cdFx0XHQ8dHI+XFxuXHRcdFx0XHQ8dGQgY2xhc3M9J3JpZ2h0LWJvdHRvbSc+XFxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9J2J0bi1wbGF5IGljb24tcGxheScvPlxcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPSdsYWJlbCc+XFxuXHRcdFx0XHRcdFx0SElQLUhPUCBTQU1QTEVcXG5cdFx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0XHQ8L3RkPlxcblx0XHRcdFx0PHRkIGNsYXNzPSdib3R0b20nPlxcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPSdidG4tcGxheSBpY29uLXBsYXknLz5cXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz0nbGFiZWwnPlxcblx0XHRcdFx0XHRcdFJPQ0sgU0FNUExFXFxuXHRcdFx0XHRcdDwvZGl2Plxcblx0XHRcdFx0PC90ZD5cXG5cdFx0XHQ8L3RyPlxcblx0XHRcdDx0cj5cXG5cdFx0XHRcdDx0ZCBjbGFzcz0ncmlnaHQnPlxcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPSdidG4tcGxheSBpY29uLXBsYXknLz5cXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz0nbGFiZWwnPlxcblx0XHRcdFx0XHRcdERBTkNFIFNBTVBMRVxcblx0XHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHRcdDwvdGQ+XFxuXHRcdFx0XHQ8dGQ+XFxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9J2J0bi1wbGF5IGljb24tcGxheScvPlxcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPSdsYWJlbCc+XFxuXHRcdFx0XHRcdFx0Q09LRSBTQU1QTEVcXG5cdFx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0XHQ8L3RkPlxcblx0XHRcdDwvdHI+XFxuXHRcdDwvdGFibGU+XFxuXFxuXHQ8L2Rpdj5cXG48L2Rpdj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBTaGFyZSB0aGUgdXNlciBjcmVhdGVkIGJlYXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5QdWJTdWIgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvUHViU3ViJ1xuUHViRXZlbnQgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5TaGFyZWRUcmFja01vZGVsID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL1NoYXJlZFRyYWNrTW9kZWwuY29mZmVlJ1xuQ3JlYXRlVmlldyAgICAgICA9IHJlcXVpcmUgJy4uL2NyZWF0ZS9DcmVhdGVWaWV3LmNvZmZlZSdcblBsYXlQYXVzZUJ0biAgICAgPSByZXF1aXJlICcuLi9jcmVhdGUvY29tcG9uZW50cy9QbGF5UGF1c2VCdG4uY29mZmVlJ1xuU2VxdWVuY2VyICAgICAgICA9IHJlcXVpcmUgJy4uL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuVmlldyAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zaGFyZS10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIFNoYXJlVmlldyBleHRlbmRzIFZpZXdcblxuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgY2xhc3NOYW1lOiAnY29udGFpbmVyLXNoYXJlJ1xuXG4gICMgVGhlIHRlbXBsYXRlXG4gICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG4gICMgXCJIaWRkZW5cIiB2aWV3IHdoaWNoIGFsbG93cyBmb3IgcGxheWJhY2sgb2Ygc2hhcmVkIGF1ZGlvXG4gICMgQHR5cGUge0NyZWF0ZVZpZXd9XG5cbiAgY3JlYXRlVmlldzogbnVsbFxuXG4gIGV2ZW50czpcbiAgICAnbW91c2VvdmVyIC5idG4tc3RhcnQnOiAnb25Nb3VzZU92ZXInXG4gICAgJ21vdXNlb3V0ICAuYnRuLXN0YXJ0JzogJ29uTW91c2VPdXQnXG4gICAgJ3RvdWNoZW5kICAuYnRuLXN0YXJ0JzogJ29uU3RhcnRCdG5DbGljaydcblxuXG4gICMgUmVuZGVycyB0aGUgdmlld1xuICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG5cbiAgICBAJHRleHRDb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItdGV4dCdcbiAgICBAJG1haW5Db250YWluZXIgPSAkKCcjY29udGFpbmVyLW1haW4nKVxuXG4gICAgQCRuYW1lID0gQCRlbC5maW5kICcubmFtZSdcbiAgICBAJHRpdGxlID0gQCRlbC5maW5kICcudGl0bGUnXG4gICAgQCRtZXNzYWdlID0gQCRlbC5maW5kICcubWVzc2FnZSdcbiAgICBAJHBsYXlCdG4gPSBAJGVsLmZpbmQgJy5idG4tcGxheSdcbiAgICBAJHN0YXJ0QnRuID0gQCRlbC5maW5kICcuYnRuLXN0YXJ0J1xuXG4gICAgVHdlZW5MaXRlLnNldCBAJHRleHRDb250YWluZXIsIHk6IC0zMDAsIGF1dG9BbHBoYTogMFxuICAgIFR3ZWVuTGl0ZS5zZXQgQCRzdGFydEJ0biwgeTogMzAwLCBhdXRvQWxwaGE6IDBcblxuICAgIEAkbWFpbkNvbnRhaW5lci5zaG93KClcblxuICAgIEBjcmVhdGVWaWV3ID0gbmV3IENyZWF0ZVZpZXdcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgIHNoYXJlZFRyYWNrTW9kZWw6IEBzaGFyZWRUcmFja01vZGVsXG4gICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBAcGxheVBhdXNlQnRuID0gbmV3IFBsYXlQYXVzZUJ0blxuICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEAkZWwuZmluZCgnLmNvbnRhaW5lci1idG4nKS5hcHBlbmQgQHBsYXlQYXVzZUJ0bi5yZW5kZXIoKS5lbFxuICAgICAgQHBsYXlQYXVzZUJ0bi4kZWwuZmluZCgnLmxhYmVsLWJ0bicpLmhpZGUoKVxuICAgICAgVHdlZW5MaXRlLnNldCBAcGxheVBhdXNlQnRuLiRlbCwgc2NhbGU6IDEsIGF1dG9BbHBoYTogMFxuXG4gICAgQCRlbC5hcHBlbmQgQGNyZWF0ZVZpZXcucmVuZGVyKCkuZWxcbiAgICBAY3JlYXRlVmlldy4kZWwuaGlkZSgpXG4gICAgQGNyZWF0ZVZpZXcua2l0U2VsZWN0b3IucmVtb3ZlKClcblxuICAgIEBpbXBvcnRUcmFjayBAYXBwTW9kZWwuZ2V0KCdzaGFyZUlkJylcblxuICAgIEBcblxuXG4gICMgU2hvdyB0aGUgdmlldywgYW5kIGhpZGUgdGhlIG1lc3NhZ2UgaWYgb24gbW9iaWxlXG5cbiAgc2hvdzogLT5cbiAgICBkZWxheSA9IC41XG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIEAkbWVzc2FnZS5oaWRlKClcblxuICAgICAgVHdlZW5MaXRlLmZyb21UbyBAJHRleHRDb250YWluZXIsIC40LCB5OiAtMzAwLCBhdXRvQWxwaGE6IDAsXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICB5OiAxMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VPdXQsXG4gICAgICAgIGRlbGF5OiBkZWxheSArIC4zXG5cbiAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRzdGFydEJ0biwgLjQsIHk6IDEwMDAsIGF1dG9BbHBoYTogMCxcbiAgICAgICAgYXV0b0FscGhhOiAxXG4gICAgICAgIHk6IDE2MFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VPdXQsXG4gICAgICAgIGRlbGF5OiBkZWxheSArIC4zXG4gICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgVHdlZW5MaXRlLnRvIEBwbGF5UGF1c2VCdG4uJGVsLCAuMyxcbiAgICAgICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG4gICAgICAgICAgICBkZWxheTogMFxuXG4gICAgZWxzZVxuICAgICAgVHdlZW5MaXRlLmZyb21UbyBAJHRleHRDb250YWluZXIsIC40LCB5OiAtMzAwLCBhdXRvQWxwaGE6IDAsXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICB5OiAwXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZU91dCxcbiAgICAgICAgZGVsYXk6IGRlbGF5ICsgLjNcblxuICAgICAgVHdlZW5MaXRlLmZyb21UbyBAJHN0YXJ0QnRuLCAuNCwgeTogMzAwLCBhdXRvQWxwaGE6IDAsXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICB5OiAtODBcbiAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0LFxuICAgICAgICBkZWxheTogZGVsYXkgKyAuM1xuXG5cbiAgIyBIaWRlIHRoZSB2aWV3XG5cbiAgaGlkZTogKG9wdGlvbnMpIC0+XG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBUd2VlbkxpdGUudG8gQCRlbCwgLjQsIGF1dG9BbHBoYTogMCxcbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICBpZiBvcHRpb25zPy5yZW1vdmVcbiAgICAgICAgICAgIF8uZGVsYXkgPT5cbiAgICAgICAgICAgICAgQHJlbW92ZSgpXG4gICAgICAgICAgICAsIDMwMFxuXG4gICAgZWxzZVxuICAgICAgVHdlZW5MaXRlLnRvIEAkc3RhcnRCdG4sIC4zLFxuICAgICAgICBzY2FsZTogMFxuICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgZWFzZTogQmFjay5lYXNlSW5cblxuICAgICAgVHdlZW5MaXRlLnRvIEAkZWwsIC40LCBhdXRvQWxwaGE6IDAsXG4gICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgaWYgb3B0aW9ucz8ucmVtb3ZlXG4gICAgICAgICAgICBfLmRlbGF5ID0+XG4gICAgICAgICAgICAgIEByZW1vdmUoKVxuICAgICAgICAgICAgLCAzMDBcblxuXG4gICMgQWRkcyBsaXN0ZW5lcnMgcmVsYXRlZCB0byBzaGFyaW5nIHRyYWNrcy4gIFdoZW4gY2hhbmdlZCwgdGhlIHZpZXdcbiAgIyBpcyBwb3B1bGF0ZWQgd2l0aCB0aGUgdXNlcnMgc2hhcmVkIGRhdGFcblxuICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAnY2hhbmdlOnNoYXJlZFRyYWNrTW9kZWwnLCBAb25TaGFyZWRUcmFja01vZGVsQ2hhbmdlXG5cblxuICAjIEltcG9ydCB0aGUgc2hhcmVkIHRyYWNrIGJ5IHJlcXVlc3RpbmcgdGhlIGRhdGEgZnJvbSBwYXJzZVxuICAjIE9uY2UgaW1wb3J0ZWRcblxuICBpbXBvcnRUcmFjazogKHNoYXJlSWQsIGNhbGxiYWNrKSA9PlxuICAgIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5IFNoYXJlZFRyYWNrTW9kZWxcblxuICAgICMgQ3JlYXRlIHJlcXVlc3QgdG8gZmV0Y2ggZGF0YSBmcm9tIHRoZSBQYXJzZSBEQlxuICAgIHF1ZXJ5LmdldCBzaGFyZUlkLFxuICAgICAgZXJyb3I6IChvYmplY3QsIGVycm9yKSA9PlxuICAgICAgICBjb25zb2xlLmVycm9yIG9iamVjdCwgZXJyb3JcblxuICAgICAgIyBIYW5kbGVyIGZvciBzdWNjZXNzIGV2ZW50cy4gIFJldHVybnMgdGhlIHNhdmVkIG1vZGVsIHdoaWNoIGlzIHRoZW5cbiAgICAgICMgZGlzcGF0Y2hlZCwgdmlhIFB1YlN1YiwgdG8gdGhlIFNlcXVlbmNlciB2aWV3IGZvciBwbGF5YmFjayBhbmQgcmVuZGVyXG4gICAgICAjIEBwYXJhbSB7U2hhcmVkVHJhY2tNb2RlbH1cblxuICAgICAgc3VjY2VzczogKHNoYXJlZFRyYWNrTW9kZWwpID0+XG4gICAgICAgIGNvbnNvbGUubG9nIEpTT04uc3RyaW5naWZ5IHNoYXJlZFRyYWNrTW9kZWwudG9KU09OKClcblxuICAgICAgICBAYXBwTW9kZWwuc2V0XG4gICAgICAgICAgJ2JwbSc6IHNoYXJlZFRyYWNrTW9kZWwuZ2V0ICdicG0nXG4gICAgICAgICAgJ3NoYXJlZFRyYWNrTW9kZWwnOiBzaGFyZWRUcmFja01vZGVsXG4gICAgICAgICAgJ3NoYXJlSWQnOiBudWxsXG5cbiAgICAgICAgQGxpc3RlblRvIEBjcmVhdGVWaWV3LCBQdWJFdmVudC5CRUFULCBAb25CZWF0XG5cbiAgICAgICAgIyBJbXBvcnQgaW50byBzZXF1ZW5jZXJcbiAgICAgICAgQGNyZWF0ZVZpZXcuc2VxdWVuY2VyLmltcG9ydFRyYWNrXG4gICAgICAgICAga2l0VHlwZTogc2hhcmVkVHJhY2tNb2RlbC5nZXQgJ2tpdFR5cGUnXG4gICAgICAgICAgaW5zdHJ1bWVudHM6IHNoYXJlZFRyYWNrTW9kZWwuZ2V0ICdpbnN0cnVtZW50cydcbiAgICAgICAgICBwYXR0ZXJuU3F1YXJlR3JvdXBzOiBzaGFyZWRUcmFja01vZGVsLmdldCAncGF0dGVyblNxdWFyZUdyb3VwcydcblxuICAgICAgICAgICMgSGFuZGxlciBmb3IgY2FsbGJhY2tzIG9uY2UgdGhlIHRyYWNrIGhhcyBiZWVuIGltcG9ydGVkIGFuZFxuICAgICAgICAgICMgcmVuZGVyZWQuICBEaXNwbGF5cyB0aGUgU2hhcmUgdmlldyBhbmQgYmVnaW5zIHBsYXliYWNrXG4gICAgICAgICAgIyBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcblxuICAgICAgICAgIGNhbGxiYWNrOiAocmVzcG9uc2UpIC0+XG5cblxuICAjIEhhbmRsZXIgZm9yIHdoZW4gdGhlIFBhcnNlIGRhdGEgaXMgcmV0dXJuZWQgZnJvbSB0aGUgc2VydmljZVxuICAjIEBwYXJhbSB7U2hhcmVkVHJhY2tNb2RlbH0gbW9kZWxcblxuICBvblNoYXJlZFRyYWNrTW9kZWxDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICBzaGFyZWRUcmFja01vZGVsID0gbW9kZWwuY2hhbmdlZC5zaGFyZWRUcmFja01vZGVsXG5cbiAgICAjIENoZWNrIGFnYWluc3QgcmVzZXRzXG4gICAgdW5sZXNzIHNoYXJlZFRyYWNrTW9kZWwgaXMgbnVsbFxuXG4gICAgICBAJG5hbWUuaHRtbCBzaGFyZWRUcmFja01vZGVsLmdldCAnc2hhcmVOYW1lJ1xuICAgICAgQCR0aXRsZS5odG1sIHNoYXJlZFRyYWNrTW9kZWwuZ2V0ICdzaGFyZVRpdGxlJ1xuICAgICAgQCRtZXNzYWdlLmh0bWwgc2hhcmVkVHJhY2tNb2RlbC5nZXQgJ3NoYXJlTWVzc2FnZSdcblxuICAgICAgVHdlZW5MaXRlLnNldCBAJGVsLCBhdXRvQWxwaGE6IDFcblxuICAgICAgQGFwcE1vZGVsLnNldCAncGxheWluZycsIChpZiBAaXNNb2JpbGUgdGhlbiBmYWxzZSBlbHNlIHRydWUpXG4gICAgICBAc2hvdygpXG5cblxuICAjIEhhbmRsZXIgZm9yIHN0YXJ0IGJ1dHRvbiBjbGlja3MsIHdoaWNoIHNlbmRzIHRoZSB1c2VyIHRvIHRoZSBDcmVhdGVWaWV3LlxuICAjIFJlc2V0cyB0aGUgQXBwTW9kZWwgdG8gaXRzIGRlZmF1bHQgc3RhdGVcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgb25TdGFydEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgQHJlbW92ZUV2ZW50TGlzdGVuZXJzKClcbiAgICBAY3JlYXRlVmlldy5yZW1vdmUoKVxuICAgICQoJy5jb250YWluZXIta2l0LXNlbGVjdG9yJykucmVtb3ZlKClcblxuICAgIEBhcHBNb2RlbC5zZXRcbiAgICAgICdicG0nOiAxMjBcbiAgICAgICdzaGFyZWRUcmFja01vZGVsJzogbnVsbFxuICAgICAgJ3Nob3dTZXF1ZW5jZXInOiBmYWxzZVxuXG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnY3JlYXRlJ1xuXG5cbiAgIyBIYW5kbGVyIGZvciBtb3VzZSBldmVudHMgb24gZGVza3RvcFxuICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICBvbk1vdXNlT3ZlcjogKGV2ZW50KSA9PlxuICAgIFR3ZWVuTGl0ZS50byBAJHN0YXJ0QnRuLCAuMixcbiAgICAgIGJvcmRlcjogJzNweCBzb2xpZCBibGFjaydcbiAgICAgIHNjYWxlOiAxLjFcbiAgICAgIGNvbG9yOiAnYmxhY2snXG5cblxuICAjIEhhbmRsZXIgZm9yIG1vdXNlIGV2ZW50cyBvbiBkZXNrdG9wXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uTW91c2VPdXQ6IChldmVudCkgPT5cbiAgICBUd2VlbkxpdGUudG8gQCRzdGFydEJ0biwgLjIsXG4gICAgICBib3JkZXI6ICczcHggc29saWQgd2hpdGUnXG4gICAgICBzY2FsZTogMVxuICAgICAgY29sb3I6ICd3aGl0ZSdcblxuXG4gIG9uQmVhdDogKHBhcmFtcykgPT5cbiAgICBAdHJpZ2dlciBQdWJFdmVudC5CRUFULCBwYXJhbXNcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlVmlld1xuIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblxcblx0XHRcdDxkaXYgY2xhc3M9J21lc3NhZ2UnPlxcblxcblx0XHRcdDwvZGl2Plxcblx0XHRcIjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblxcblx0XHRcdDxkaXYgY2xhc3M9J2NvbnRhaW5lci1idG4nPlxcblxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9J2xvZ28tY29rZSc+PC9kaXY+XFxuXFxuPGRpdiBjbGFzcz0nd3JhcHBlcic+XFxuXFxuXHQ8ZGl2IGNsYXNzPSdjb250YWluZXItdGV4dCc+XFxuXHRcdDxkaXYgY2xhc3M9J3RpdGxlJz5cXG5cXG5cdFx0PC9kaXY+XFxuXFxuXHRcdDxkaXYgY2xhc3M9J25hbWUnPlxcblxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIGRlcHRoMC5pc0Rlc2t0b3AsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5wcm9ncmFtKDMsIHByb2dyYW0zLCBkYXRhKSxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9J2J0bi1zdGFydCc+XFxuXHRcdENSRUFURSBZT1VSIE9XTiBKQU1cXG5cdDwvZGl2PlxcblxcbjwvZGl2PlxcblxcblxcbjxkaXYgY2xhc3M9J2J0bi1wbGF5Jz5cXG5cXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIjtcbiAgYnVmZmVyICs9IFwiXFxuXFxuXHQ8ZGl2IGlkPSdjb250YWluZXItbWFpbic+XFxuXHRcdDxkaXYgaWQ9J2NvbnRhaW5lci1ib3R0b20nPlxcblxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2PlxcblxcblxcblxcblwiXG4gICAgKyBcIlxcblxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiXFxuXFxuXHQ8ZGl2IGlkPSdjb250YWluZXItbWFpbic+XFxuXHRcdDxkaXYgY2xhc3M9J3RvcC1iYXInPlxcblx0XHRcdDxkaXYgaWQ9J2xvZ28nIGNsYXNzPSdsb2dvJyAvPlxcblx0XHQ8L2Rpdj5cXG5cXG5cdDwvZGl2PlxcblwiO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiXFxuXCJcbiAgICArIFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIGRlcHRoMC5pc0Rlc2t0b3AsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5wcm9ncmFtKDMsIHByb2dyYW0zLCBkYXRhKSxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCIvKipcbiAqIEJ1YmJsZXMgZ2VuZXJhdG9yXG4gKiBAcmVxdWlyZXMgalF1ZXJ5ICYgVHdlZW5NYXhcbiAqIEBhdXRob3IgQ2hhcmxpZVxuICovXG5cbnZhciBCdWJibGVzID0ge1xuXG4gIC8qKlxuICAgKiB3aW5kb3cgcmVmZXJlbmNlXG4gICAqIEB0eXBlIHtqUXVlcnl9XG4gICAqL1xuICAkd2luZG93ICAgICA6ICQod2luZG93KSxcblxuICAvKipcbiAgICogQnViYmxlIGVsZW1lbnQgd3JhcHBlclxuICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgKi9cbiAgJGNvbnRhaW5lciAgOiBudWxsLFxuXG4gIC8qKlxuICAgKiB2aWV3cG9ydCB3aWR0aFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgd2luV2lkdGggICAgOiAwLFxuXG4gIC8qKlxuICAgKiB2aWV3cG9ydCBoZWlnaHRcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHdpbkhlaWdodCAgIDogMCxcblxuICAvKipcbiAgICogQnViYmxlIHNpemUgY2xhc3Nlc1xuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqL1xuICBzaXplQ2xhc3NlcyA6IFsgJ3NtYWxsJywgJ21lZGl1bScsICdiaWcnIF0sXG5cbiAgYnViYmxlczogbnVsbCxcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgQnViYmxlc1xuICAgKi9cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuJGNvbnRhaW5lciA9ICQoJzxkaXY+JywgeydjbGFzcyc6ICdidWJibGVzLWNvbnRhaW5lcid9KVxuICAgIHRoaXMud2luV2lkdGggICA9IHRoaXMuJHdpbmRvdy53aWR0aCgpO1xuICAgIHRoaXMud2luSGVpZ2h0ICA9IHRoaXMuJHdpbmRvdy5oZWlnaHQoKTtcbiAgICB0aGlzLmZsYWtlcyA9IFtdXG4gICAgdGhpcy5hZGRFdmVudGxpc3RlbmVycygpO1xuICAgIHRoaXMuaW5pdEJ1YmJsZXMoKTtcblxuXG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lclxuICB9LFxuXG4gIC8qKlxuICAgKiBFdmVudCBsaXN0ZW5lcnNcbiAgICovXG4gIGFkZEV2ZW50bGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy4kd2luZG93LnJlc2l6ZSgkLnByb3h5KHRoaXMuX29uV2luZG93UmVzaXplLCB0aGlzKSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGZsYWtlc1xuICAgKi9cbiAgaW5pdEJ1YmJsZXM6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNyZWF0ZUJ1YmJsZSgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGJ1YmJsZXNcbiAgICovXG4gIGNyZWF0ZUJ1YmJsZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciAkYnViYmxlID0gJCgnPGRpdj4nLCB7J2NsYXNzJzogJ2J1YmJsZSd9KTtcbiAgICB2YXIgc2l6ZUNsYXNzZXMgID0gdGhpcy5zaXplQ2xhc3Nlc1sgdGhpcy5fcmFuZG9tTnVtYmVyKDAsIHRoaXMuc2l6ZUNsYXNzZXMubGVuZ3RoIC0gMSkgXTtcbiAgICB2YXIgcmlnaHRQb3MgICA9IHRoaXMuX3JhbmRvbU51bWJlcigxMDAsIC0xMDApO1xuICAgIHZhciBvcGFjaXR5ICAgID0gdGhpcy5fcmFuZG9tTnVtYmVyKDUwLCA5MCkgLyAxMDA7XG5cbiAgICBUd2VlbkxpdGUuc2V0KCAkYnViYmxlLCB7IHk6IHdpbmRvdy5pbm5lckhlaWdodCB9KVxuXG4gICAgJGJ1YmJsZS5hZGRDbGFzcyhzaXplQ2xhc3NlcylcbiAgICAgICAgICAgICAgLnByZXBlbmRUbyh0aGlzLiRjb250YWluZXIpXG4gICAgICAgICAgICAgIC5jc3Moe1xuICAgICAgICAgICAgICAgICdyaWdodCcgICA6IHJpZ2h0UG9zICsgJyUnLFxuICAgICAgICAgICAgICAgICdvcGFjaXR5JyA6IG9wYWNpdHlcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICBzZXRUaW1lb3V0KCQucHJveHkodGhpcy5jcmVhdGVCdWJibGUsIHRoaXMpLCB0aGlzLl9yYW5kb21OdW1iZXIoMTAwLCAzMDApKTtcbiAgICB0aGlzLmFuaW1hdGVGbGFrZSgkYnViYmxlKTtcbiAgfSxcblxuICAvKipcbiAgICogQW5pbWF0ZXMgZWxlbWVudFxuICAgKiBAcGFyYW0gIHtqUXVlcnl9ICRidWJibGVcbiAgICovXG4gIGFuaW1hdGVGbGFrZTogZnVuY3Rpb24gKCRidWJibGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICB2YXIgZHVyYXRpb24gPSB0aGlzLl9yYW5kb21OdW1iZXIoMTAsIDIwKTtcbiAgICB2YXIgcmlnaHQgPSB0aGlzLl9yYW5kb21OdW1iZXIodGhpcy53aW5XaWR0aCAvIDMsIHRoaXMud2luV2lkdGgpIC8qIGdvIGxlZnQgKi8gKiAtIDE7XG5cbiAgICAvL21ha2UgaXQgZmFsbFxuICAgIFR3ZWVuTGl0ZS50bygkYnViYmxlLCBkdXJhdGlvbiwge1xuICAgICAgJ3knICAgICAgICA6IC10aGlzLndpbkhlaWdodCAqIDEuMSxcbiAgICAgICdlYXNlJyAgICAgOiAnTGluZWFyLmVhc2VOb25lJyxcbiAgICAgIG9uQ29tcGxldGUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRidWJibGUucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cblxuICBiZWF0OiBmdW5jdGlvbigpIHt9LFxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgcmFuZG9tIG51bWJlclxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGZyb21cbiAgICogQHBhcmFtICB7TnVtYmVyfSB0b1xuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHJhbmRvbSB2YWx1ZVxuICAgKi9cbiAgX3JhbmRvbU51bWJlcjogZnVuY3Rpb24gKGZyb20sIHRvKSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiAodG8tZnJvbSsxKSArIGZyb20pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXNpemUgZXZlbnQgaGFubGRlclxuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgb2JqZWN0XG4gICAqL1xuICBfb25XaW5kb3dSZXNpemU6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMud2luV2lkdGggICA9IHRoaXMuJHdpbmRvdy53aWR0aCgpO1xuICAgIHRoaXMud2luSGVpZ2h0ICA9IHRoaXMuJHdpbmRvdy5oZWlnaHQoKTtcbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1YmJsZXM7XG4iLCIjIyMqXG4gKiBCYWNrZ3JvdW5kIHZpc3VhbGl6YXRpb24gdmlld1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNC4xMy4xNFxuIyMjXG5cblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9idWJibGVzLXRlbXBsYXRlLmhicydcblxuY2xhc3MgQnViYmxlc1ZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgY2xhc3NOYW1lOiAnY29udGFpbmVyLWJ1YmJsZXMnXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG4gIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgQHN0YXJ0QnViYmxlcygpXG4gICAgQFxuXG4gIHN0YXJ0QnViYmxlczogLT5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1YmJsZXNWaWV3XG4iLCIjIyMqXG4gKiBCYWNrZ3JvdW5kIHZpc3VhbGl6YXRpb24gdmlld1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNy4xNFxuIyMjXG5cblB1YlN1YiAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvUHViU3ViJ1xuUHViRXZlbnQgPSByZXF1aXJlICcuLi8uLi9ldmVudHMvUHViRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3Zpc3VhbGl6ZXItdGVtcGxhdGUuaGJzJ1xuXG5jbGFzcyBWaXN1YWxpemVyVmlldyBleHRlbmRzIFZpZXdcblxuICBCT1RUTEVfTlVNOiA2XG5cbiAgIyBUaGUgY2xhc3NuYW1lIGZvciB0aGUgY29udGFpbmVyXG4gICMgQHR5cGUge1N0cmluZ31cblxuICBjbGFzc05hbWU6ICdjb250YWluZXItdmlzdWFsaXplcidcblxuICAjIEhUTUwgVGVtcGxhdGVcbiAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cblxuICAjIFJlbmRlcnMgdGhlIHZpZXcgYW5kIGJ1aWxkcyBvdXQgdGhlIGJvdHRsZXNcbiAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgQCRib3R0bGVzQ29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLWJvdHRsZXMnXG5cbiAgICBAc2hvdygpXG4gICAgQFxuXG5cbiAgIyBBZGQgbGlzdGVuZXJzXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIEBvblJlc2l6ZSwgZmFsc2UpO1xuICAgIFB1YlN1Yi5vbiBQdWJFdmVudC5CRUFULCBAb25CZWF0XG5cblxuICAjIFJlbW92ZSBsaXN0ZW5lcnNcblxuICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICBQdWJTdWIub2ZmIFB1YkV2ZW50LkJFQVQsIEBvbkJlYXRcbiAgICBzdXBlcigpXG5cblxuICAjIFNob3cgdGhlIHZpZXcgYW5kIGJ1aWxkIG91dCB0aGUgYm90dGxlc1xuXG4gIHNob3c6ID0+XG4gICAgQGJ1aWxkQm90dGxlcygpXG5cbiAgICBUd2VlbkxpdGUudG8gQCRlbC5maW5kKCcud3JhcHBlcicpLCAuMyxcbiAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgZGVsYXk6IDFcblxuXG4gICMgSGlkZSB0aGUgdmlld1xuXG4gIGhpZGU6IC0+XG4gICAgVHdlZW5MaXRlLnRvIEAkZWwuZmluZCgnLndyYXBwZXInKSwgLjMsXG4gICAgICBhdXRvQWxwaGE6IDBcbiAgICAgIGRlbGF5OiAwXG5cblxuICAjIFNjYWxlIHVwIHRoZSB2aWV3LiAgQ2FsbGVkIHdoZW4gdGhlIHVzZXIgY2xpY2tzXG4gICMgc2hhcmUgd2hlbiBvbiBEZXNrdG9wXG5cbiAgc2NhbGVVcDogLT5cbiAgICBAcHJldlggPSBHcmVlblByb3AueCBAJGJvdHRsZXNDb250YWluZXJcbiAgICBAcHJldlkgPSBHcmVlblByb3AueSBAJGJvdHRsZXNDb250YWluZXJcblxuICAgIFR3ZWVuTGl0ZS50byBAJGJvdHRsZXNDb250YWluZXIsIC44LFxuICAgICAgc2NhbGU6IDEuM1xuICAgICAgeDogKEBjb250YWluZXJXaWR0aCAqIC4yNilcbiAgICAgIHk6IEBwcmV2WSArIDY1XG4gICAgICBlYXNlOiBFeHBvLmVhc2VPdXRcblxuXG4gICMgU2NhbGUgZG93biB0aGUgdmlldyBjbG9zZSBzaGFyZVxuXG4gIHNjYWxlRG93bjogLT5cbiAgICBUd2VlbkxpdGUudG8gQCRib3R0bGVzQ29udGFpbmVyLCAuOCxcbiAgICAgIHNjYWxlWDogMVxuICAgICAgc2NhbGVZOiAxXG4gICAgICB4OiBAcHJldlhcbiAgICAgIHk6IEBwcmV2WVxuICAgICAgZWFzZTogRXhwby5lYXNlSW5PdXRcblxuXG4gICMgU2V0cyB0aGUgcG9zaXRpb24gIHdoZW4gdGhlIHNoYXJlIHZpZXcgYXBwZWFyc1xuXG4gIHNldFNoYXJlVmlld1Bvc2l0aW9uOiAtPlxuICAgIEBpc1NoYXJlVmlldyA9IHRydWVcbiAgICBAb25SZXNpemUoKVxuXG5cbiAgIyBSZXNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBib3R0bGVzXG5cbiAgcmVzZXRQb3NpdGlvbjogLT5cbiAgICBAaXNTaGFyZVZpZXcgPSBmYWxzZVxuICAgIEBvblJlc2l6ZSgpXG5cblxuICAjIENvbnN0cnVjdCB0aGUgYm90dGxlcyBhbmQgc2V0IHVwIHBvc2l0aW9uaW5nIGFuZCB3aWR0aFxuXG4gIGJ1aWxkQm90dGxlczogPT5cbiAgICBAYm90dGxlcyA9IFtdXG4gICAgQHdpZHRocyA9IFtdXG5cbiAgICBfKEBCT1RUTEVfTlVNKS50aW1lcyAoaW5kZXgpID0+XG4gICAgICAkYm90dGxlID0gQCRlbC5maW5kIFwiI2JvdHRsZS0je2luZGV4KzF9XCJcblxuICAgICAgVHdlZW5MaXRlLnNldCAkYm90dGxlLFxuICAgICAgICB0cmFuc2Zvcm1PcmlnaW46ICdjZW50ZXIgbWlkZGxlJ1xuICAgICAgICBzY2FsZTogMVxuICAgICAgICB4OiB+fihpbmRleCAqICgod2luZG93LmlubmVyV2lkdGggKiAuOCkgLyBAQk9UVExFX05VTSkpXG4gICAgICAgIHk6IDEwMDBcblxuICAgICAgVHdlZW5MaXRlLnNldCAkYm90dGxlLmZpbmQoJy5ib3R0bGUtYmcnKSwgc2NhbGVZOiAwXG4gICAgICBAYm90dGxlcy5wdXNoICRib3R0bGVcblxuICAgIGRlbGF5ID0gLjVcblxuICAgIGZvciAkYm90dGxlIGluIEBib3R0bGVzXG4gICAgICBUd2VlbkxpdGUudG8gJGJvdHRsZSwgLjcsXG4gICAgICAgIHk6IC0xMFxuICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcbiAgICAgICAgZGVsYXk6IGRlbGF5XG5cbiAgICAgIGRlbGF5ICs9IC4xXG5cblxuICAjIEV2ZW50IGhhbmRsZXJzXG4gICMgLS0tLS0tLS0tLS0tLS1cblxuICAjIEhhbmRsZXIgZm9yIHJlc2l6ZSBldmVudHMuICBSZXBvc2l0aW9ucyBib3R0bGVzIGFjcm9zcyB3aWR0aCBhbmRcbiAgIyBjZW50ZXJzIGNvbnRhaW5lclxuXG4gIG9uUmVzaXplOiA9PlxuICAgIGxlbiA9IEBib3R0bGVzLmxlbmd0aFxuICAgIEB3aWR0aHMgPSBbXVxuXG4gICAgXy5lYWNoIEBib3R0bGVzLCAoJGJvdHRsZSwgaW5kZXgpID0+XG4gICAgICB4UG9zID0gfn4oaW5kZXggKiAoKHdpbmRvdy5pbm5lcldpZHRoICogLjggLyBAQk9UVExFX05VTSkgKSlcblxuICAgICAgVHdlZW5MaXRlLnNldCAkYm90dGxlLFxuICAgICAgICB0cmFuc2Zvcm1PcmlnaW46ICdjZW50ZXInXG4gICAgICAgIHg6IHhQb3NcbiAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG5cbiAgICAgIEB3aWR0aHMucHVzaCAoR3JlZW5Qcm9wLngoJGJvdHRsZSkgKyAkYm90dGxlLndpZHRoKCkpXG5cbiAgICBAY29udGFpbmVyV2lkdGggPSBAd2lkdGhzW0B3aWR0aHMubGVuZ3RoIC0gMV1cbiAgICBAY29udGFpbmVySGVpZ2h0ID0gfn5AJGJvdHRsZXNDb250YWluZXIuaGVpZ2h0KClcblxuICAgIHlPZmZzZXQgPSBpZiBAaXNTaGFyZVZpZXcgdGhlbiAwIGVsc2UgMTAwXG5cbiAgICB4UG9zID0gKHdpbmRvdy5pbm5lcldpZHRoICogLjUpIC0gKEBjb250YWluZXJXaWR0aCAqIC41KVxuICAgIHlQb3MgPSAod2luZG93LmlubmVySGVpZ2h0ICogLjUpIC0gKEBjb250YWluZXJIZWlnaHQgKiAuNSkgLSB5T2Zmc2V0XG5cbiAgICBUd2VlbkxpdGUudG8gQCRib3R0bGVzQ29udGFpbmVyLCAuNixcbiAgICAgIHg6IH5+eFBvc1xuICAgICAgeTogfn55UG9zXG4gICAgICBlYXNlOiBFeHBvLmVhc2VPdXRcblxuXG4gICMgSGFuZGxlciBmb3IgXCJCZWF0XCIgZXZlbnRzLCBkaXNwYXRjaGVkIGZyb20gdGhlIFBhdHRlcm5TcXVhcmVWaWV3XG4gICMgQHBhcmFtIHtPYmplY3R9IHBhcmFtXG5cbiAgb25CZWF0OiAocGFyYW1zKSA9PlxuICAgIHtwYXR0ZXJuU3F1YXJlTW9kZWx9ID0gcGFyYW1zXG5cbiAgICBwcm9wcyA9IHBhdHRlcm5TcXVhcmVNb2RlbCB8fCB7fVxuXG4gICAgIyBDaGVjayBpZiB0aGVcbiAgICBpZiBfLmlzRW1wdHkgcHJvcHNcbiAgICAgIHByb3BzID1cbiAgICAgICAgdmVsb2NpdHk6IH5+KE1hdGgucmFuZG9tKCkgKiA0KVxuICAgICAgICBvcmRlckluZGV4OiB+fihNYXRoLnJhbmRvbSgpICogNilcblxuICAgIHNjYWxlID0gc3dpdGNoIHByb3BzLnZlbG9jaXR5XG4gICAgICB3aGVuIDEgdGhlbiAuMzMgKyBNYXRoLnJhbmRvbSgpICogLjIwXG4gICAgICB3aGVuIDIgdGhlbiAuNjYgKyBNYXRoLnJhbmRvbSgpICogLjIwXG4gICAgICB3aGVuIDMgdGhlbiAuOTVcblxuICAgIGlmIHNjYWxlIGlzIHVuZGVmaW5lZCB0aGVuIHNjYWxlID0gMVxuXG4gICAgdHdlZW5UaW1lID0gLjJcbiAgICBib3R0bGUgPSBAYm90dGxlc1twcm9wcy5vcmRlckluZGV4XS5maW5kKCcuYm90dGxlLWJnJylcblxuICAgIFR3ZWVuTGl0ZS50byBib3R0bGUsIC4xLFxuICAgICAgdHJhbnNmb3JtT3JpZ2luOiAnY2VudGVyIGJvdHRvbSdcbiAgICAgIHNjYWxlWTogc2NhbGVcbiAgICAgIGVhc2U6IExpbmVhci5lYXNlTm9uZVxuXG4gICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICBUd2VlbkxpdGUudG8gYm90dGxlLCAxLFxuICAgICAgICAgIHNjYWxlWTogMFxuICAgICAgICAgIGVhc2U6IFF1YXJ0LmVhc2VPdXRcblxubW9kdWxlLmV4cG9ydHMgPSBWaXN1YWxpemVyVmlld1xuIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCI7XG5cblxuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIHN0YWNrMiwgb3B0aW9ucywgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPSd2aXMtYm90dGxlJyBpZD0nYm90dGxlLVwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKChzdGFjazEgPSBkYXRhKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmluZGV4KSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCInPlxcblx0XHRcdFx0PGRpdiBjbGFzcz0nYm90dGxlLWJnLXdoaXRlJyAvPlxcblx0XHRcdFx0PGRpdiBjbGFzcz0nYm90dGxlLWJnJyAvPlxcblx0XHRcdFx0PGRpdiBjbGFzcz0nYm90dGxlLW1hc2snIC8+XFxuXHRcdFx0PC9kaXY+XFxuXFxuXHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz0nd3JhcHBlcic+XFxuXHQ8ZGl2IGNsYXNzPSdjb250YWluZXItYm90dGxlcyc+XFxuXFxuXHRcdFwiO1xuICBvcHRpb25zID0ge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9O1xuICBzdGFjazIgPSAoKHN0YWNrMSA9IGhlbHBlcnMucmVwZWF0IHx8IGRlcHRoMC5yZXBlYXQpLHN0YWNrMSA/IHN0YWNrMS5jYWxsKGRlcHRoMCwgNiwgb3B0aW9ucykgOiBoZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLCBcInJlcGVhdFwiLCA2LCBvcHRpb25zKSk7XG4gIGlmKHN0YWNrMiB8fCBzdGFjazIgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMjsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cdDwvZGl2PlxcbjwvZGl2PlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIlxuZGVzY3JpYmUgJ01vZGVscycsID0+XG5cbiAgIHJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvS2l0Q29sbGVjdGlvbi1zcGVjLmNvZmZlZSdcbiAgIHJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvS2l0TW9kZWwtc3BlYy5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1ZpZXdzJywgPT5cblxuICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXctc3BlYy5jb2ZmZWUnXG4gICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3Itc3BlYy5jb2ZmZWUnXG4gICByZXF1aXJlICcuL3NwZWMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLXNwZWMuY29mZmVlJ1xuXG5cbiAgIGRlc2NyaWJlICdMaXZlIFBhZCcsID0+XG5cbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvUGFkU3F1YXJlLXNwZWMuY29mZmVlJ1xuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9MaXZlUGFkLXNwZWMuY29mZmVlJ1xuXG5cbiAgIGRlc2NyaWJlICdJbnN0cnVtZW50IFNlbGVjdG9yJywgPT5cblxuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLXNwZWMuY29mZmVlJ1xuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnQtc3BlYy5jb2ZmZWUnXG5cblxuICAgZGVzY3JpYmUgJ1NlcXVlbmNlcicsID0+XG5cbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS1zcGVjLmNvZmZlZSdcbiAgICAgIHJlcXVpcmUgJy4vc3BlYy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblRyYWNrLXNwZWMuY29mZmVlJ1xuICAgICAgcmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXItc3BlYy5jb2ZmZWUnXG5cblxuXG5yZXF1aXJlICcuL3NwZWMvdmlld3Mvc2hhcmUvU2hhcmVWaWV3LXNwZWMuY29mZmVlJ1xucmVxdWlyZSAnLi9zcGVjL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LXNwZWMuY29mZmVlJ1xuXG5yZXF1aXJlICcuL3NwZWMvbW9kZWxzL1NvdW5kQ29sbGVjdGlvbi1zcGVjLmNvZmZlZSdcbnJlcXVpcmUgJy4vc3BlYy9tb2RlbHMvU291bmRNb2RlbC1zcGVjLmNvZmZlZSdcblxuIyBDb250cm9sbGVyc1xucmVxdWlyZSAnLi9zcGVjL0FwcENvbnRyb2xsZXItc3BlYy5jb2ZmZWUnXG4iLCJBcHBDb250cm9sbGVyID0gcmVxdWlyZSAnLi4vLi4vc3JjL3NjcmlwdHMvQXBwQ29udHJvbGxlci5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0FwcCBDb250cm9sbGVyJywgLT5cblxuICAgaXQgJ1Nob3VsZCBpbml0aWFsaXplJywgPT4iLCJBcHBDb25maWcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5cbmRlc2NyaWJlICdLaXQgQ29sbGVjdGlvbicsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cblxuICAgaXQgJ1Nob3VsZCBwYXJzZSB0aGUgcmVzcG9uc2UgYW5kIGFwcGVuZCBhbiBhc3NldFBhdGggdG8gZWFjaCBraXQgbW9kZWwnLCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdwYXRoJykuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCByZXR1cm4gdGhlIG5leHQga2l0JywgPT5cbiAgICAgIGtpdERhdGEgPSBAa2l0Q29sbGVjdGlvbi50b0pTT04oKVxuICAgICAga2l0ID0gQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG4gICAgICBraXQuZ2V0KCdsYWJlbCcpLnNob3VsZC5lcXVhbCBraXREYXRhWzFdLmxhYmVsXG5cblxuICAgaXQgJ1Nob3VsZCByZXR1cm4gdGhlIHByZXZpb3VzIGtpdCcsID0+XG4gICAgICBraXREYXRhID0gQGtpdENvbGxlY3Rpb24udG9KU09OKClcbiAgICAgIGtpdCA9IEBraXRDb2xsZWN0aW9uLnByZXZpb3VzS2l0KClcbiAgICAgIGtpdC5nZXQoJ2xhYmVsJykuc2hvdWxkLmVxdWFsIGtpdERhdGFba2l0RGF0YS5sZW5ndGgtMV0ubGFiZWwiLCJBcHBDb25maWcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5LaXRNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0TW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblxuZGVzY3JpYmUgJ0tpdCBNb2RlbCcsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cblxuICAgICAgZGF0YSA9IHtcbiAgICAgICAgIFwibGFiZWxcIjogXCJIaXAgSG9wXCIsXG4gICAgICAgICBcImZvbGRlclwiOiBcImhpcC1ob3BcIixcbiAgICAgICAgIFwiaW5zdHJ1bWVudHNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNsb3NlZCBIaUhhdFwiLFxuICAgICAgICAgICAgICAgXCJzcmNcIjogXCJIQVRfMi5tcDNcIixcbiAgICAgICAgICAgICAgIFwiaWNvblwiOiBcImljb24taGloYXQtY2xvc2VkXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiS2ljayBEcnVtXCIsXG4gICAgICAgICAgICAgICBcInNyY1wiOiBcIktJS18yLm1wM1wiLFxuICAgICAgICAgICAgICAgXCJpY29uXCI6IFwiaWNvbi1raWNrZHJ1bVwiXG4gICAgICAgICAgICB9XG4gICAgICAgICBdXG4gICAgICB9XG5cbiAgICAgIEBraXRNb2RlbCA9IG5ldyBLaXRNb2RlbCBkYXRhLCB7IHBhcnNlOiB0cnVlIH1cblxuXG4gICBpdCAnU2hvdWxkIHBhcnNlIHRoZSBtb2RlbCBkYXRhIGFuZCBjb252ZXJ0IGluc3RydW1lbnRzIHRvIGFuIEluc3RydW1lbnRzQ29sbGVjdGlvbicsID0+XG4gICAgICBAa2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLnNob3VsZC5iZS5hbi5pbnN0YW5jZW9mIEluc3RydW1lbnRDb2xsZWN0aW9uIiwiXG5cbmRlc2NyaWJlICdTb3VuZCBDb2xsZWN0aW9uJywgLT5cblxuICAgaXQgJ1Nob3VsZCBpbml0aWFsaXplIHdpdGggYSBzb3VuZCBzZXQnLCA9PiIsIlxuXG5kZXNjcmliZSAnU291bmQgTW9kZWwnLCAtPlxuXG4gICBpdCAnU2hvdWxkIGluaXRpYWxpemUgd2l0aCBkZWZhdWx0IGNvbmZpZyBwcm9wZXJ0aWVzJywgPT4iLCJBcHBDb25maWcgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcbkNyZWF0ZVZpZXcgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL0NyZWF0ZVZpZXcuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdDcmVhdGUgVmlldycsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAdmlldyAgPSBuZXcgQ3JlYXRlVmlld1xuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgZXhwZWN0KEB2aWV3LmVsKS50by5leGlzdCIsIkJQTUluZGljYXRvciA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL0JQTUluZGljYXRvci5jb2ZmZWUnXG5BcHBNb2RlbCAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvQXBwTW9kZWwuY29mZmVlJ1xuQXBwRXZlbnQgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcbkFwcENvbmZpZyAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuXG5kZXNjcmliZSAnQlBNIEluZGljYXRvcicsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQHZpZXcgPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICAgICBhcHBNb2RlbDogbmV3IEFwcE1vZGVsKClcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIGlmIEB2aWV3LnVwZGF0ZUludGVydmFsIHRoZW4gY2xlYXJJbnRlcnZhbCBAdmlldy51cGRhdGVJbnRlcnZhbFxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cblxuICAgICAgQHZpZXcuc2hvdWxkLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIGRpc3BsYXkgdGhlIGN1cnJlbnQgQlBNIGluIHRoZSBsYWJlbCcsID0+XG5cbiAgICAgICRsYWJlbCA9IEB2aWV3LiRlbC5maW5kICcubGFiZWwtYnBtJ1xuICAgICAgJGxhYmVsLnRleHQoKS5zaG91bGQuZXF1YWwgU3RyaW5nKDYwMDAwIC8gQHZpZXcuYXBwTW9kZWwuZ2V0KCdicG0nKSlcblxuXG5cbiAgICMgaXQgJ1Nob3VsZCBhdXRvLWFkdmFuY2UgdGhlIGJwbSB2aWEgc2V0SW50ZXJ2YWwgb24gcHJlc3MnLCAoZG9uZSkgPT5cblxuICAgIyAgICBAdmlldy5icG1JbmNyZWFzZUFtb3VudCA9IDUwXG4gICAjICAgIEB2aWV3LmludGVydmFsVXBkYXRlVGltZSA9IDFcbiAgICMgICAgYXBwTW9kZWwgPSBAdmlldy5hcHBNb2RlbFxuICAgIyAgICBhcHBNb2RlbC5zZXQgJ2JwbScsIDFcblxuICAgIyAgICBzZXRUaW1lb3V0ID0+XG4gICAjICAgICAgIGJwbSA9IGFwcE1vZGVsLmdldCAnYnBtJ1xuXG4gICAjICAgICAgIGlmIGJwbSA+PSAxMjBcbiAgICMgICAgICAgICAgQHZpZXcub25CdG5VcCgpXG4gICAjICAgICAgICAgIGRvbmUoKVxuICAgIyAgICAsIDEwMFxuXG4gICAjICAgIEB2aWV3Lm9uSW5jcmVhc2VCdG5Eb3duKClcblxuXG5cbiAgICMgaXQgJ1Nob3VsZCBjbGVhciB0aGUgaW50ZXJ2YWwgb24gcmVsZWFzZScsID0+XG5cbiAgICMgICAgQHZpZXcub25JbmNyZWFzZUJ0bkRvd24oKVxuICAgIyAgICBAdmlldy51cGRhdGVJbnRlcnZhbC5zaG91bGQuZXhpc3RcbiAgICMgICAgQHZpZXcub25CdG5VcCgpXG4gICAjICAgIGV4cGVjdChAdmlldy51cGRhdGVJbnRlcnZhbCkudG8uYmUubnVsbFxuXG4iLCJBcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdFNlbGVjdG9yICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9LaXRTZWxlY3Rvci5jb2ZmZWUnXG5BcHBNb2RlbCAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbktpdE1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ0tpdCBTZWxlY3Rpb24nLCAtPlxuXG5cbiAgIGJlZm9yZSA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cblxuICAgYmVmb3JlRWFjaCA9PlxuXG4gICAgICBAdmlldyA9IG5ldyBLaXRTZWxlY3RvclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cblxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cblxuXG4gICBpdCAnU2hvdWxkIGhhdmUgYSBsYWJlbCcsID0+XG5cbiAgICAgICRsYWJlbCA9IEB2aWV3LiRlbC5maW5kICcubGFiZWwta2l0J1xuICAgICAgJGxhYmVsLnNob3VsZC5leGlzdFxuXG5cblxuXG4gICBpdCAnU2hvdWxkIHVwZGF0ZSB0aGUgQXBwTW9kZWwgYSBraXQgaXMgY2hhbmdlZCcsID0+XG5cbiAgICAgICRsYWJlbCA9IEB2aWV3LiRlbC5maW5kICcubGFiZWwta2l0J1xuICAgICAgZmlyc3RMYWJlbCA9IEB2aWV3LmtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0ICdsYWJlbCdcbiAgICAgIGxhc3RMYWJlbCAgPSBAdmlldy5raXRDb2xsZWN0aW9uLmF0KEB2aWV3LmtpdENvbGxlY3Rpb24ubGVuZ3RoLTEpLmdldCAnbGFiZWwnXG5cbiAgICAgIGFwcE1vZGVsID0gQHZpZXcuYXBwTW9kZWxcblxuICAgICAgYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpraXRNb2RlbCcpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm9uTGVmdEJ0bkNsaWNrKClcbiAgICAgICAgICRsYWJlbC50ZXh0KCkuc2hvdWxkLmVxdWFsIGxhc3RMYWJlbFxuXG4gICAgICBhcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmtpdE1vZGVsJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcub25SaWdodEJ0bkNsaWNrKClcbiAgICAgICAgICRsYWJlbC50ZXh0KCkuc2hvdWxkLmVxdWFsIGZpcnN0TGFiZWxcblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiIsIkluc3RydW1lbnQgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudC5jb2ZmZWUnXG5LaXRNb2RlbCAgID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnSW5zdHJ1bWVudCcsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQHZpZXcgPSBuZXcgSW5zdHJ1bWVudFxuICAgICAgICAga2l0TW9kZWw6IG5ldyBLaXRNb2RlbCgpXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCBhbGxvdyB1c2VyIHRvIHNlbGVjdCBpbnN0cnVtZW50cycsID0+XG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIGV4cGVjdChAdmlldy4kZWwuaGFzQ2xhc3MoJ3NlbGVjdGVkJykpLnRvLmJlLnRydWUiLCJJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50U2VsZWN0b3JQYW5lbC5jb2ZmZWUnXG5BcHBDb25maWcgICAgICAgICAgICAgICAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBNb2RlbCAgICAgICAgICAgICAgICAgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gICAgICAgICAgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMva2l0cy9LaXRDb2xsZWN0aW9uLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnSW5zdHJ1bWVudCBTZWxlY3Rpb24gUGFuZWwnLCAtPlxuXG5cbiAgIGJlZm9yZSA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAYXBwTW9kZWwgPSBuZXcgQXBwTW9kZWwoKVxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAdmlldyA9IG5ldyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy5zaG91bGQuZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVmZXIgdG8gdGhlIGN1cnJlbnQgS2l0TW9kZWwgd2hlbiBpbnN0YW50aWF0aW5nIHNvdW5kcycsID0+XG5cbiAgICAgIGV4cGVjdChAdmlldy5raXRNb2RlbCkudG8uZXhpc3RcblxuXG5cbiAgIGl0ICdTaG91bGQgaXRlcmF0ZSBvdmVyIGFsbCBvZiB0aGUgc291bmRzIGluIHRoZSBTb3VuZENvbGxlY3Rpb24gdG8gYnVpbGQgb3V0IGluc3RydW1lbnRzJywgPT5cblxuICAgICAgQHZpZXcua2l0TW9kZWwudG9KU09OKCkuaW5zdHJ1bWVudHMubGVuZ3RoLnNob3VsZC5iZS5hYm92ZSgwKVxuXG4gICAgICAkaW5zdHJ1bWVudHMgPSBAdmlldy4kZWwuZmluZCgnLmNvbnRhaW5lci1pbnN0cnVtZW50cycpLmZpbmQoJy5pbnN0cnVtZW50JylcbiAgICAgICRpbnN0cnVtZW50cy5sZW5ndGguc2hvdWxkLmJlLmFib3ZlKDApXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlYnVpbGQgdmlldyB3aGVuIHRoZSBraXRNb2RlbCBjaGFuZ2VzJywgPT5cblxuICAgICAga2l0TW9kZWwgPSBAdmlldy5hcHBNb2RlbC5nZXQgJ2tpdE1vZGVsJ1xuICAgICAgbGVuZ3RoID0ga2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLnRvSlNPTigpLmxlbmd0aFxuXG4gICAgICAkaW5zdHJ1bWVudHMgPSBAdmlldy4kZWwuZmluZCgnLmNvbnRhaW5lci1pbnN0cnVtZW50cycpLmZpbmQoJy5pbnN0cnVtZW50JylcbiAgICAgICRpbnN0cnVtZW50cy5sZW5ndGguc2hvdWxkLmJlLmVxdWFsKGxlbmd0aClcblxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG4gICAgICBraXRNb2RlbCA9IEB2aWV3LmFwcE1vZGVsLmdldCAna2l0TW9kZWwnXG4gICAgICBsZW5ndGggPSBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykudG9KU09OKCkubGVuZ3RoXG5cbiAgICAgICRpbnN0cnVtZW50cyA9IEB2aWV3LiRlbC5maW5kKCcuY29udGFpbmVyLWluc3RydW1lbnRzJykuZmluZCgnLmluc3RydW1lbnQnKVxuICAgICAgJGluc3RydW1lbnRzLmxlbmd0aC5zaG91bGQuYmUuZXF1YWwobGVuZ3RoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIHNlbGVjdGlvbnMgZnJvbSBJbnN0cnVtZW50IGluc3RhbmNlcyBhbmQgdXBkYXRlIHRoZSBtb2RlbCcsID0+XG5cbiAgICAgIEB2aWV3LmtpdE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6Y3VycmVudEluc3RydW1lbnQnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5pbnN0cnVtZW50Vmlld3NbMF0ub25DbGljaygpXG5cbiAgICAgICAgICRzZWxlY3RlZCA9IEB2aWV3LiRlbC5maW5kKCcuY29udGFpbmVyLWluc3RydW1lbnRzJykuZmluZCgnLnNlbGVjdGVkJylcbiAgICAgICAgICRzZWxlY3RlZC5sZW5ndGguc2hvdWxkLmVxdWFsIDFcblxuXG5cbiIsIkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwTW9kZWwgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5JbnN0cnVtZW50TW9kZWwgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5QYWRTcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhZFNxdWFyZSA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9QYWRTcXVhcmUuY29mZmVlJ1xuTGl2ZVBhZCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC9MaXZlUGFkLmNvZmZlZSdcblxuXG5kZXNjcmliZSAnTGl2ZSBQYWQnLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAdmlldyA9IG5ldyBMaXZlUGFkXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuICAgICAgICAgI3BhZFNxdWFyZUNvbGxlY3Rpb246IG5ldyBQYWRTcXVhcmVDb2xsZWN0aW9uKClcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IHBhZCBzcXVhcmVzJywgPT5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcucGFkLXNxdWFyZScpLmxlbmd0aC5zaG91bGQuZXF1YWwgMTZcblxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIG91dCB0aGUgZW50aXJlIGtpdCBjb2xsZWN0aW9uJywgPT5cblxuICAgICAgbGVuID0gMFxuXG4gICAgICBAdmlldy5raXRDb2xsZWN0aW9uLmVhY2ggKGtpdCwgaW5kZXgpIC0+XG4gICAgICAgICBpbmRleCA9IGluZGV4ICsgMVxuICAgICAgICAgbGVuID0ga2l0LmdldCgnaW5zdHJ1bWVudHMnKS5sZW5ndGggKiBpbmRleFxuXG4gICAgICBAdmlldy4kZWwuZmluZCgnLmluc3RydW1lbnQnKS5sZW5ndGguc2hvdWxkLmVxdWFsIGxlblxuXG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gdG8gZHJvcHMgZnJvbSB0aGUga2l0cyB0byB0aGUgcGFkcycsID0+XG5cbiAgICAgIEB2aWV3LnBhZFNxdWFyZUNvbGxlY3Rpb24uc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpkcm9wcGVkJykud2hlbiA9PlxuICAgICAgICAgaWQgPSBAdmlldy5raXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2lkJylcbiAgICAgICAgIEB2aWV3LnBhZFNxdWFyZVZpZXdzWzBdLm9uRHJvcCBpZFxuXG5cblxuICAgaXQgJ1Nob3VsZCB1cGRhdGUgdGhlIFBhZFNxdWFyZUNvbGxlY3Rpb24gd2l0aCB0aGUgY3VycmVudCBraXQgd2hlbiBkcm9wcGVkJywgPT5cblxuICAgICAgQHZpZXcucGFkU3F1YXJlQ29sbGVjdGlvbi5zaG91bGQudHJpZ2dlcignY2hhbmdlOmN1cnJlbnRJbnN0cnVtZW50Jykud2hlbiA9PlxuICAgICAgICAgaWQgPSBAdmlldy5raXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2lkJylcbiAgICAgICAgIEB2aWV3LnBhZFNxdWFyZVZpZXdzWzBdLm9uRHJvcCBpZFxuXG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIGNoYW5nZXMgdG8gaW5zdHJ1bWVudCBkcm9wcGVkIHN0YXR1cycsID0+XG5cbiAgICAgIEB2aWV3LmtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6ZHJvcHBlZCcpLndoZW4gPT5cbiAgICAgICAgIGlkID0gQHZpZXcua2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICAgICBAdmlldy5wYWRTcXVhcmVWaWV3c1swXS5vbkRyb3AgaWRcblxuXG5cblxuXG5cblxuXG4iLCJBcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuUGFkU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5QYWRTcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9wYWQvUGFkU3F1YXJlTW9kZWwuY29mZmVlJ1xuUGFkU3F1YXJlID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL1BhZFNxdWFyZS5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1BhZCBTcXVhcmUnLCAtPlxuXG4gICBiZWZvcmUgPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEB2aWV3ID0gbmV3IFBhZFNxdWFyZVxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cbiAgICAgICAgIG1vZGVsOiBuZXcgUGFkU3F1YXJlTW9kZWwoKVxuXG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciBvdXQgdGhlIGFwcHJvcHJpYXRlIGtleS1jb2RlIHRyaWdnZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLmZpbmQoJy5rZXktY29kZScpLmxlbmd0aC5zaG91bGQuZXF1YWwgMVxuXG5cblxuICAgaXQgJ1Nob3VsZCB0cmlnZ2VyIGEgcGxheSBhY3Rpb24gb24gdGFwJywgPT5cbiAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6dHJpZ2dlcicpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm9uUHJlc3MoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCBhY2NlcHQgYSBkcm9wcGFibGUgdmlzdWFsIGVsZW1lbnQnLCA9PlxuICAgICAgQHZpZXcubW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpkcm9wcGVkJykud2hlbiA9PlxuICAgICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG5cbiAgICAgICAgIEB2aWV3Lm9uRHJvcCBpZFxuXG5cblxuICAgaXQgJ1Nob3VsZCB0cmlnZ2VyIGluc3RydW1lbnQgY2hhbmdlIG9uIGRyb3AnLCA9PlxuICAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6Y3VycmVudEluc3RydW1lbnQnKS53aGVuID0+XG4gICAgICAgICBpZCA9IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2lkJylcblxuICAgICAgICAgQHZpZXcub25Ecm9wIGlkXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciBvdXQgYSBzb3VuZCBpY29uIHdoZW4gZHJvcHBlZCcsID0+XG4gICAgICBpZCA9IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2lkJylcbiAgICAgIEB2aWV3Lm9uRHJvcCBpZFxuXG4gICAgICBpY29uID0gQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApLmdldCgnaWNvbicpXG5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcuJyArIGljb24pLmxlbmd0aC5zaG91bGQuZXF1YWwgMVxuXG5cblxuXG4gICBpdCAnU2hvdWxkIHNldCB0aGUgc291bmQgYmFzZWQgdXBvbiB0aGUgZHJvcHBlZCB2aXN1YWwgZWxlbWVudCcsID0+XG4gICAgICBpZCA9IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2lkJylcbiAgICAgIEB2aWV3Lm9uRHJvcCBpZFxuXG4gICAgICBleHBlY3QoQHZpZXcuYXVkaW9QbGF5YmFjaykudG8ubm90LmVxdWFsIHVuZGVmaW5lZFxuXG5cbiAgIGl0ICdTaG91bGQgY2xlYXIgdGhlIHNvdW5kIHdoZW4gdGhlIGRyb3BwYWJsZSBlbGVtZW50IGlzIGRpc3Bvc2VkIG9mJywgKGRvbmUpID0+XG4gICAgICBpZCA9IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2lkJylcbiAgICAgIEB2aWV3Lm9uRHJvcCBpZFxuXG4gICAgICBAdmlldy5tb2RlbC5vbmNlICdjaGFuZ2U6Y3VycmVudEluc3RydW1lbnQnLCA9PlxuICAgICAgICAgZG9uZSgpXG5cbiAgICAgIEB2aWV3LnJlbW92ZVNvdW5kQW5kQ2xlYXJQYWQoKVxuXG5cbiAgIGl0ICdTaG91bGQgY2xlYXIgdGhlIGljb24gd2hlbiB0aGUgZHJvcHBhYmxlIGVsZW1lbnQgaXMgZGlzcG9zZWQgb2YnLCA9PlxuICAgICAgaWQgPSBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMCkuZ2V0KCdpZCcpXG4gICAgICBAdmlldy5vbkRyb3AgaWRcblxuICAgICAgaWNvbiA9IEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5hdCgwKS5nZXQoJ2ljb24nKVxuICAgICAgQHZpZXcuJGVsLmZpbmQoJy4nICsgaWNvbikubGVuZ3RoLnNob3VsZC5lcXVhbCAxXG5cbiAgICAgIEB2aWV3LnJlbW92ZVNvdW5kQW5kQ2xlYXJQYWQoKVxuXG4gICAgICBAdmlldy4kZWwuZmluZCgnLicgKyBpY29uKS5sZW5ndGguc2hvdWxkLmVxdWFsIDBcblxuXG5cblxuXG5cblxuXG4iLCJBcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmUgPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmUuY29mZmVlJ1xuXG5cbmRlc2NyaWJlICdQYXR0ZXJuIFNxdWFyZScsIC0+XG5cbiAgIGJlZm9yZSA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cblxuICAgYmVmb3JlRWFjaCA9PlxuXG4gICAgICBtb2RlbCA9IG5ldyBQYXR0ZXJuU3F1YXJlTW9kZWxcbiAgICAgICAgICdpbnN0cnVtZW50JzogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpLmF0KDApXG5cbiAgICAgIEB2aWV3ID0gbmV3IFBhdHRlcm5TcXVhcmVcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIHBhdHRlcm5TcXVhcmVNb2RlbDogbW9kZWxcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlcicsID0+XG4gICAgICBAdmlldy4kZWwuc2hvdWxkLmV4aXN0XG5cblxuXG4gICBpdCAnU2hvdWxkIGN5Y2xlIHRocm91Z2ggdmVsb2NpdHkgdm9sdW1lcycsID0+XG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcucGF0dGVyblNxdWFyZU1vZGVsLmdldCgndmVsb2NpdHknKS5zaG91bGQuZXF1YWwgMVxuICAgICAgQHZpZXcuJGVsLmhhc0NsYXNzKCd2ZWxvY2l0eS1sb3cnKS5zaG91bGQuYmUudHJ1ZVxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ3ZlbG9jaXR5Jykuc2hvdWxkLmVxdWFsIDJcbiAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygndmVsb2NpdHktbWVkaXVtJykuc2hvdWxkLmJlLnRydWVcblxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAzXG4gICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ3ZlbG9jaXR5LWhpZ2gnKS5zaG91bGQuYmUudHJ1ZVxuXG4gICAgICBAdmlldy5vbkNsaWNrKClcbiAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ3ZlbG9jaXR5Jykuc2hvdWxkLmVxdWFsIDBcbiAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygndmVsb2NpdHktaGlnaCcpLnNob3VsZC5iZS5mYWxzZVxuXG5cblxuICAgaXQgJ1Nob3VsZCB0b2dnbGUgb2ZmJywgPT5cblxuICAgICAgQHZpZXcuZGlzYWJsZSgpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAwXG5cblxuXG4gICBpdCAnU2hvdWxkIHRvZ2dsZSBvbicsID0+XG5cbiAgICAgIEB2aWV3Lm9uQ2xpY2soKVxuICAgICAgQHZpZXcub25DbGljaygpXG4gICAgICBAdmlldy5vbkNsaWNrKClcblxuXG4gICAgICBAdmlldy5kaXNhYmxlKClcbiAgICAgIEB2aWV3LmVuYWJsZSgpXG4gICAgICBAdmlldy5wYXR0ZXJuU3F1YXJlTW9kZWwuZ2V0KCd2ZWxvY2l0eScpLnNob3VsZC5lcXVhbCAxXG4iLCJcbkFwcENvbmZpZyA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5LaXRDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblRyYWNrID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2suY29mZmVlJ1xuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcblxuZGVzY3JpYmUgJ1BhdHRlcm4gVHJhY2snLCAtPlxuXG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEBhcHBNb2RlbCA9IG5ldyBBcHBNb2RlbFxuICAgICAgQGFwcE1vZGVsLnNldCAna2l0TW9kZWwnLCBAa2l0Q29sbGVjdGlvbi5hdCgwKVxuXG4gICAgICBAdmlldyA9IG5ldyBQYXR0ZXJuVHJhY2tcbiAgICAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgICAgIG1vZGVsOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJykuYXQoMClcblxuICAgICAgQHZpZXcucmVuZGVyKClcblxuXG4gICBhZnRlckVhY2ggPT5cbiAgICAgIEB2aWV3LnJlbW92ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyIG91dCBjaGlsZCBzcXVhcmVzJywgPT5cbiAgICAgIEB2aWV3LiRlbC5maW5kKCcucGF0dGVybi1zcXVhcmUnKS5sZW5ndGguc2hvdWxkLmVxdWFsIDhcblxuXG4gICBpdCAnU2hvdWxkIGxpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUgcGF0dGVybiBzcXVhcmVzJywgPT5cbiAgICAgIEB2aWV3LmNvbGxlY3Rpb24uc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTp2ZWxvY2l0eScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnBhdHRlcm5TcXVhcmVWaWV3c1swXS5vbkNsaWNrKClcblxuXG4gICBpdCAnU2hvdWxkIGJlIG11dGFibGUnLCA9PlxuICAgICAgQHZpZXcubW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTptdXRlJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcubXV0ZSgpXG5cbiAgICAgIEB2aWV3Lm1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6bXV0ZScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3LnVubXV0ZSgpXG5cblxuICAgaXQgJ1Nob3VsZCBhZGQgdmlzdWFsIG5vdGlmaWNhdGlvbiB0aGF0IHRyYWNrIGlzIG11dGVkJywgKGRvbmUpID0+XG4gICAgICBAdmlldy5tb2RlbC5vbmNlICdjaGFuZ2U6bXV0ZScsIChtb2RlbCkgPT5cbiAgICAgICAgIEB2aWV3LiRlbC5oYXNDbGFzcygnbXV0ZScpLnNob3VsZC5iZS50cnVlXG5cbiAgICAgIEB2aWV3Lm11dGUoKVxuXG4gICAgICBAdmlldy5tb2RlbC5vbmNlICdjaGFuZ2U6bXV0ZScsID0+XG4gICAgICAgICBAdmlldy4kZWwuaGFzQ2xhc3MoJ211dGUnKS5zaG91bGQuYmUuZmFsc2VcbiAgICAgICAgIGRvbmUoKVxuXG4gICAgICBAdmlldy51bm11dGUoKVxuXG5cbiAgIGl0ICdTaG91bGQgYmUgYWJsZSB0byBmb2N1cyBhbmQgdW5mb2N1cycsID0+XG4gICAgICBAdmlldy5tb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOmZvY3VzJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcub25MYWJlbENsaWNrKClcblxuXG5cblxuICAgaXQgJ1Nob3VsZCB1cGRhdGUgZWFjaCBQYXR0ZXJuU3F1YXJlIG1vZGVsIHdoZW4gdGhlIGtpdCBjaGFuZ2VzJywgPT4iLCJBcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcE1vZGVsID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL0FwcE1vZGVsLmNvZmZlZSdcblNlcXVlbmNlciA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuS2l0Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdENvbGxlY3Rpb24uY29mZmVlJ1xuSW5zdHJ1bWVudE1vZGVsID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuSW5zdHJ1bWVudENvbGxlY3Rpb24gPSByZXF1aXJlICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRDb2xsZWN0aW9uLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZU1vZGVsLmNvZmZlZSdcblBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL3NlcXVlbmNlci9QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbi5jb2ZmZWUnXG5oZWxwZXJzID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvaGVscGVycy9oYW5kbGViYXJzLWhlbHBlcnMnXG5cblxuZGVzY3JpYmUgJ1NlcXVlbmNlcicsIC0+XG5cblxuICAgYmVmb3JlRWFjaCA9PlxuICAgICAgQGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgICAgcGFyc2U6IHRydWVcblxuICAgICAgQGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuVGVzdEFzc2V0UGF0aCgnZGF0YScpICsgJy8nICsgJ3NvdW5kLWRhdGEuanNvbidcblxuICAgICAgQGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAgIEB2aWV3ID0gbmV3IFNlcXVlbmNlclxuICAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgICAgY29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb24uYXQoMCkuZ2V0KCdpbnN0cnVtZW50cycpXG5cbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5wYXVzZSgpXG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgQHZpZXcuJGVsLnNob3VsZC5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXIgb3V0IGVhY2ggcGF0dGVybiB0cmFjaycsID0+XG4gICAgICBAdmlldy4kZWwuZmluZCgnLnBhdHRlcm4tdHJhY2snKS5sZW5ndGguc2hvdWxkLmVxdWFsIEBraXRDb2xsZWN0aW9uLmF0KDApLmdldCgnaW5zdHJ1bWVudHMnKS5sZW5ndGhcblxuXG5cbiAgIGl0ICdTaG91bGQgY3JlYXRlIGEgYnBtIGludGVydmFsJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5icG1JbnRlcnZhbCkudG8ubm90LmJlIG51bGxcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBwbGF5IC8gcGF1c2UgY2hhbmdlcyBvbiB0aGUgQXBwTW9kZWwnLCA9PlxuICAgICAgQHZpZXcuYXBwTW9kZWwuc2hvdWxkLnRyaWdnZXIoJ2NoYW5nZTpwbGF5aW5nJykud2hlbiA9PlxuICAgICAgICAgQHZpZXcucGF1c2UoKVxuXG4gICAgICBAdmlldy5hcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOnBsYXlpbmcnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5wbGF5KClcblxuXG5cbiAgIGl0ICdTaG91bGQgbGlzdGVuIGZvciBicG0gY2hhbmdlcycsID0+XG4gICAgICBAdmlldy5hcHBNb2RlbC5zZXQoJ2JwbScsIDIwMClcbiAgICAgIGV4cGVjdChAdmlldy51cGRhdGVJbnRlcnZhbFRpbWUpLnRvLmVxdWFsIDIwMFxuXG5cblxuICAgaXQgJ1Nob3VsZCBiZSBtdXRhYmxlJywgPT5cbiAgICAgIEB2aWV3LmFwcE1vZGVsLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6bXV0ZScpLndoZW4gPT5cbiAgICAgICAgIEB2aWV3Lm11dGUoKVxuXG4gICAgICBAdmlldy5hcHBNb2RlbC5zaG91bGQudHJpZ2dlcignY2hhbmdlOm11dGUnKS53aGVuID0+XG4gICAgICAgICBAdmlldy51bm11dGUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCBsaXN0ZW4gZm9yIEluc3RydW1lbnRUcmFja01vZGVsIGZvY3VzIGV2ZW50cycsID0+XG4gICAgICBAdmlldy5jb2xsZWN0aW9uLnNob3VsZC50cmlnZ2VyKCdjaGFuZ2U6Zm9jdXMnKS53aGVuID0+XG4gICAgICAgICBAdmlldy5wYXR0ZXJuVHJhY2tWaWV3c1swXS5vbkxhYmVsQ2xpY2soKVxuXG5cblxuXG4gICBpdCAnU2hvdWxkIHVwZGF0ZSBlYWNoIHBhdHRlcm4gdHJhY2sgd2hlbiB0aGUga2l0IGNoYW5nZXMnLCA9PiIsIkFwcENvbmZpZyA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbktpdENvbGxlY3Rpb24gPSByZXF1aXJlICAnLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5BcHBDb250cm9sbGVyID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL0FwcENvbnRyb2xsZXIuY29mZmVlJ1xuTGFuZGluZ1ZpZXcgICA9IHJlcXVpcmUgICcuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSdcblxuZGVzY3JpYmUgJ0xhbmRpbmcgVmlldycsIC0+XG5cbiAgIGJlZm9yZUVhY2ggPT5cbiAgICAgIEBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb25cbiAgICAgICAgIHBhcnNlOiB0cnVlXG5cbiAgICAgIEBraXRDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICBhc3luYzogZmFsc2VcbiAgICAgICAgIHVybDogQXBwQ29uZmlnLnJldHVyblRlc3RBc3NldFBhdGgoJ2RhdGEnKSArICcvJyArICdzb3VuZC1kYXRhLmpzb24nXG5cbiAgICAgIEB2aWV3ID0gbmV3IExhbmRpbmdWaWV3XG4gICAgICBAdmlldy5yZW5kZXIoKVxuXG5cbiAgIGFmdGVyRWFjaCA9PlxuICAgICAgQHZpZXcucmVtb3ZlKClcblxuICAgICAgaWYgQGFwcENvbnRyb2xsZXIgdGhlbiBAYXBwQ29udHJvbGxlci5yZW1vdmUoKVxuXG5cblxuICAgaXQgJ1Nob3VsZCByZW5kZXInLCA9PlxuICAgICAgZXhwZWN0KEB2aWV3LmVsKS50by5leGlzdFxuXG5cblxuICAgaXQgJ1Nob3VsZCByZWRpcmVjdCB0byBjcmVhdGUgcGFnZSBvbiBjbGljaycsIChkb25lKSA9PlxuXG4gICAgICBAYXBwQ29udHJvbGxlciA9IG5ldyBBcHBDb250cm9sbGVyXG4gICAgICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICByb3V0ZXIgPSBAYXBwQ29udHJvbGxlci5hcHBSb3V0ZXJcbiAgICAgICRzdGFydEJ0biA9IEB2aWV3LiRlbC5maW5kICcuc3RhcnQtYnRuJ1xuXG4gICAgICAkc3RhcnRCdG4ub24gJ2NsaWNrJywgKGV2ZW50KSA9PlxuICAgICAgICAgJ2NyZWF0ZScuc2hvdWxkLnJvdXRlLnRvIHJvdXRlciwgJ2NyZWF0ZVJvdXRlJ1xuICAgICAgICAgZG9uZSgpXG5cbiAgICAgICRzdGFydEJ0bi5jbGljaygpXG5cblxuXG5cblxuXG5cblxuIiwiU2hhcmVWaWV3ID0gcmVxdWlyZSAgJy4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUnXG5cblxuZGVzY3JpYmUgJ1NoYXJlIFZpZXcnLCAtPlxuXG4gICBiZWZvcmVFYWNoID0+XG4gICAgICBAdmlldyA9IG5ldyBTaGFyZVZpZXdcbiAgICAgIEB2aWV3LnJlbmRlcigpXG5cblxuICAgYWZ0ZXJFYWNoID0+XG4gICAgICBAdmlldy5yZW1vdmUoKVxuXG5cbiAgIGl0ICdTaG91bGQgcmVuZGVyJywgPT5cbiAgICAgIGV4cGVjdChAdmlldy5lbCkudG8uZXhpc3RcblxuXG4gICBpdCAnU2hvdWxkIGFjY2VwdCBhIFNvdW5kU2hhcmUgb2JqZWN0JywgPT5cblxuXG4gICBpdCAnU2hvdWxkIHJlbmRlciB0aGUgdmlzdWFsaXphdGlvbiBsYXllcicsID0+XG5cblxuICAgaXQgJ1Nob3VsZCBwYXVzZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gdHJhY2sgb24gaW5pdCcsID0+XG5cblxuICAgaXQgJ1Nob3VsZCB0b2dnbGUgdGhlIHBsYXkgLyBwYXVzZSBidXR0b24nLCA9PlxuXG5cbiAgIGl0ICdTaG91bGQgZGlzcGxheSB0aGUgdXNlcnMgc29uZyB0aXRsZSBhbmQgdXNlcm5hbWUnLCA9PlxuIl19

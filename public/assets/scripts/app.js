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
;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
module.exports = exports = require('handlebars/lib/handlebars/base.js').create()
require('handlebars/lib/handlebars/utils.js').attach(exports)
require('handlebars/lib/handlebars/runtime.js').attach(exports)
},{"handlebars/lib/handlebars/base.js":3,"handlebars/lib/handlebars/runtime.js":4,"handlebars/lib/handlebars/utils.js":5}],7:[function(require,module,exports){
module.exports = require('./lib/visibility.timers.js')

},{"./lib/visibility.timers.js":9}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"./visibility.core":8}],10:[function(require,module,exports){

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


},{"./config/AppConfig.coffee":11,"./events/AppEvent.coffee":13,"./events/PubEvent.coffee":14,"./models/SharedTrackModel.coffee":18,"./routers/AppRouter.coffee":27,"./supers/View.coffee":30,"./utils/BreakpointManager.coffee":31,"./utils/BrowserDetect":32,"./utils/PubSub":33,"./utils/observeDom":36,"./views/create/CreateView.coffee":37,"./views/landing/LandingView.coffee":68,"./views/not-supported/NotSupportedView.coffee":70,"./views/share/ShareView.coffee":72,"./views/templates/main-template.hbs":74,"./views/visualizer/VisualizerView.coffee":78,"visibilityjs":7}],11:[function(require,module,exports){

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


},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){

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


},{}],14:[function(require,module,exports){

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


},{}],15:[function(require,module,exports){

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
},{"digits":1,"handleify":6}],16:[function(require,module,exports){

/**
 * MPC Application bootstrapper
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
 */
var AppConfig, AppController, AppModel, BrowserDetect, KitCollection, Touch, attachFastClick, helpers, rotationTemplate;

AppConfig = require('./config/AppConfig.coffee');

AppController = require('./AppController.coffee');

AppModel = require('./models/AppModel.coffee');

BrowserDetect = require('./utils/BrowserDetect');

KitCollection = require('./models/kits/KitCollection.coffee');

Touch = require('./utils/Touch');

attachFastClick = require('fastclick');

helpers = require('./helpers/handlebars-helpers');

rotationTemplate = require('./views/templates/rotation-template.hbs');

$(function() {
  var onPreloadComplete, preloadManifest, queue;
  preloadManifest = [
    {
      id: 'velocity-soft',
      src: 'assets/images/icon-beat-soft.svg'
    }, {
      id: 'velocity-medium',
      src: 'assets/images/icon-beat-medium.svg'
    }, {
      id: 'velocity-hard',
      src: 'assets/images/icon-beat-hard.svg'
    }, {
      id: 'bottle-mask',
      src: 'assets/images/bottle-mask.png'
    }, {
      id: 'velocity-soft',
      src: 'assets/audio/coke/05___female_ahhh_01.mp3'
    }
  ];
  onPreloadComplete = (function(_this) {
    return function() {
      var $body, appController, appModel, device, kitCollection, sndPath;
      Parse.initialize("foo", "bar");
      Touch.translateTouchEvents();
      ZeroClipboard.config({
        moviePath: 'assets/swf/ZeroClipboard.swf'
      });
      attachFastClick(document.body);
      $(document).on('touchmove', function(event) {
        return event.preventDefault();
      });
      $body = $('body');
      kitCollection = new KitCollection({
        parse: true
      });
      kitCollection.fetch({
        async: false,
        url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'
      });
      appModel = new AppModel({
        'kitModel': kitCollection.at(0)
      });
      if ($(window).innerWidth() < AppConfig.BREAKPOINTS.desktop.min) {
        appModel.set('isMobile', true);
        $body.addClass('mobile');
      } else {
        $body.addClass('desktop');
      }
      $body.append(rotationTemplate());
      if (AppConfig.ENABLE_ROTATION_LOCK) {
        if (window.innerHeight > window.innerWidth) {
          $('.device-orientation').show();
        }
      }
      sndPath = preloadManifest[preloadManifest.length - 1].src;
      createjs.Sound.registerSound(sndPath, sndPath);
      createjs.Sound.alternateExtensions = ['mp3'];
      createjs.FlashPlugin.swfPath = '/assets/swf/';
      createjs.HTMLAudioPlugin.defaultNumChannels = 30;
      if (BrowserDetect.isIE()) {
        createjs.Sound.registerPlugins([createjs.FlashPlugin]);
      } else {
        createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
      }
      TweenLite.to($('body'), 0, {
        scrollTop: 0,
        scrollLeft: 0
      });
      appController = new AppController({
        appModel: appModel,
        kitCollection: kitCollection
      });
      appController.render();
      if (appModel.get('isMobile')) {
        if (BrowserDetect.unsupportedAndroidDevice()) {
          window.location.hash = '#not-supported';
        }
        return device = BrowserDetect.deviceDetection();
      }
    };
  })(this);
  queue = new createjs.LoadQueue();
  queue.installPlugin(createjs.Sound);
  queue.on('complete', onPreloadComplete);
  return queue.loadManifest(preloadManifest);
});


},{"./AppController.coffee":10,"./config/AppConfig.coffee":11,"./helpers/handlebars-helpers":15,"./models/AppModel.coffee":17,"./models/kits/KitCollection.coffee":19,"./utils/BrowserDetect":32,"./utils/Touch":35,"./views/templates/rotation-template.hbs":75,"fastclick":2}],17:[function(require,module,exports){

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


},{"../config/AppConfig.coffee":11,"../supers/Model.coffee":29}],18:[function(require,module,exports){

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


},{"../config/AppConfig.coffee":11,"../supers/Model.coffee":29}],19:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":11,"../../supers/Collection.coffee":28,"./KitModel.coffee":20}],20:[function(require,module,exports){

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


},{"../../supers/Model.coffee":29,"../sequencer/InstrumentCollection.coffee":23}],21:[function(require,module,exports){

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


},{"../../supers/Collection.coffee":28,"../sequencer/InstrumentModel.coffee":24}],22:[function(require,module,exports){

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


},{"../../supers/Model.coffee":29}],23:[function(require,module,exports){

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


},{"../../supers/Collection.coffee":28,"./InstrumentModel.coffee":24}],24:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":11,"../../supers/Model.coffee":29}],25:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":11,"../../events/AppEvent.coffee":13,"../../supers/Collection.coffee":28,"../../utils/PubSub":33,"../sequencer/InstrumentModel.coffee":24,"./PatternSquareModel.coffee":26}],26:[function(require,module,exports){

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


},{"../../config/AppConfig.coffee":11,"../../events/AppEvent.coffee":13,"../../supers/Model.coffee":29}],27:[function(require,module,exports){

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


},{"../config/AppConfig.coffee":11,"../events/PubEvent.coffee":14,"../utils/PubSub":33}],28:[function(require,module,exports){

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


},{}],29:[function(require,module,exports){

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


},{}],30:[function(require,module,exports){

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


},{"../utils/BrowserDetect":32}],31:[function(require,module,exports){
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


},{}],32:[function(require,module,exports){

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


},{}],33:[function(require,module,exports){
/**
 * @module     PubSub
 * @desc       Global PubSub object for dispatch and delegation
 */

'use strict'

var PubSub = {}

_.extend( PubSub, Backbone.Events )

module.exports = PubSub
},{}],34:[function(require,module,exports){
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
},{}],35:[function(require,module,exports){
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
      $(document).on( 'mousedown', 'body', function(e) {
        $(e.target).trigger( 'touchstart' )
      })

      $(document).on( 'mouseup', 'body',  function(e) {
        $(e.target).trigger( 'touchend' )
      })
    }
  }

}

module.exports = Touch

},{}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){

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


},{"../../events/AppEvent.coffee":13,"../../events/PubEvent.coffee":14,"../../models/SharedTrackModel.coffee":18,"../../supers/View.coffee":30,"../../utils/BrowserDetect":32,"../../utils/PubSub":33,"../../views/visualizer/Bubbles":76,"../../views/visualizer/BubblesView.coffee":77,"./components/BPMIndicator.coffee":38,"./components/KitSelector.coffee":39,"./components/PatternSelector.coffee":40,"./components/PlayPauseBtn.coffee":41,"./components/Toggle.coffee":42,"./components/instruments/InstrumentSelectorPanel.coffee":44,"./components/pad/LivePad.coffee":47,"./components/sequencer/Sequencer.coffee":55,"./components/share/ShareModal.coffee":59,"./templates/create-template.hbs":67}],38:[function(require,module,exports){

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


},{"../../../config/AppConfig.coffee":11,"../../../events/AppEvent.coffee":13,"../../../supers/View.coffee":30,"./templates/bpm-template.hbs":62}],39:[function(require,module,exports){

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


},{"../../../events/AppEvent.coffee":13,"../../../supers/View.coffee":30,"./templates/kit-selection-template.hbs":63}],40:[function(require,module,exports){

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


},{"../../../config/AppConfig.coffee":11,"../../../config/Presets":12,"../../../events/AppEvent.coffee":13,"../../../models/SharedTrackModel.coffee":18,"../../../supers/View.coffee":30,"./templates/pattern-selector-template.hbs":64}],41:[function(require,module,exports){

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


},{"../../../config/AppConfig.coffee":11,"../../../events/AppEvent.coffee":13,"../../../supers/View.coffee":30,"./templates/play-pause-template.hbs":65}],42:[function(require,module,exports){

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


},{"../../../config/AppConfig.coffee":11,"../../../events/AppEvent.coffee":13,"../../../supers/View.coffee":30,"./templates/toggle-template.hbs":66}],43:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":13,"../../../../supers/View.coffee":30,"./templates/instrument-template.hbs":46}],44:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":13,"../../../../supers/View.coffee":30,"./Instrument.coffee":43,"./templates/instrument-panel-template.hbs":45}],45:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n<div class='container-instruments'>\n\n	<div class='label'>\n		DRUM PATTERN EDITOR\n	</div>\n\n	<div class='instruments'>\n\n	</div>\n\n</div>";
  })
},{"handleify":6}],46:[function(require,module,exports){
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
},{"handleify":6}],47:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":13,"../../../../events/PubEvent.coffee":14,"../../../../models/pad/PadSquareCollection.coffee":21,"../../../../models/pad/PadSquareModel.coffee":22,"../../../../supers/View.coffee":30,"../PlayPauseBtn.coffee":41,"./PadSquare.coffee":48,"./templates/instruments-template.hbs":49,"./templates/live-pad-template.hbs":50,"./templates/pads-template.hbs":52}],48:[function(require,module,exports){

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


},{"../../../../config/AppConfig.coffee":11,"../../../../events/AppEvent.coffee":13,"../../../../events/PubEvent.coffee":14,"../../../../supers/View.coffee":30,"./templates/pad-square-template.hbs":51}],49:[function(require,module,exports){
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
},{"handleify":6}],50:[function(require,module,exports){
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
},{"handleify":6}],51:[function(require,module,exports){
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
},{"handleify":6}],52:[function(require,module,exports){
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
},{"handleify":6}],53:[function(require,module,exports){

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


},{"../../../../config/AppConfig.coffee":11,"../../../../events/AppEvent.coffee":13,"../../../../events/PubEvent.coffee":14,"../../../../supers/View.coffee":30,"../../../../utils/PubSub":33,"./templates/pattern-square-template.hbs":56}],54:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":13,"../../../../events/PubEvent.coffee":14,"../../../../models/sequencer/PatternSquareCollection.coffee":25,"../../../../models/sequencer/PatternSquareModel.coffee":26,"../../../../supers/View.coffee":30,"./PatternSquare.coffee":53,"./templates/pattern-track-template.hbs":57}],55:[function(require,module,exports){

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


},{"../../../../events/AppEvent.coffee":13,"../../../../events/PubEvent.coffee":14,"../../../../helpers/handlebars-helpers":15,"../../../../supers/View.coffee":30,"../../../../utils/PubSub":33,"./PatternTrack.coffee":54,"./templates/sequencer-template.hbs":58}],56:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='inner-container'>\n	<div class='border-dark' />\n\n	<div class='icon'>\n\n	</div>\n</div>";
  })
},{"handleify":6}],57:[function(require,module,exports){
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
},{"handleify":6}],58:[function(require,module,exports){
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
},{"handleify":6}],59:[function(require,module,exports){

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


},{"../../../../config/AppConfig.coffee":11,"../../../../events/AppEvent.coffee":13,"../../../../supers/View.coffee":30,"../../../../utils/SpinIcon":34,"./templates/share-modal-template.hbs":60,"./templates/share-preview-template.hbs":61}],60:[function(require,module,exports){
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
},{"handleify":6}],61:[function(require,module,exports){
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
},{"handleify":6}],62:[function(require,module,exports){
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
},{"handleify":6}],63:[function(require,module,exports){
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
},{"handleify":6}],64:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='wrapper'>\n	<div class=\"label\">\n		PATTERNS\n	</div>\n	<div class='container-btns'>\n		<div class='btn-pattern-1 btn'>1</div>\n		<div class='btn-pattern-1 btn'>2</div>\n		<div class='btn-pattern-1 btn'>3</div>\n		<div class='btn-pattern-1 btn'>4</div>\n	</div>\n</div>";
  })
},{"handleify":6}],65:[function(require,module,exports){
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
},{"handleify":6}],66:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='btn-steps'>\n	STEPS\n</div>\n\n<div class='btn-pads'>\n	PAD\n</div>\n";
  })
},{"handleify":6}],67:[function(require,module,exports){
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
},{"handleify":6}],68:[function(require,module,exports){

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


},{"../../events/PubEvent.coffee":14,"../../supers/View.coffee":30,"../../utils/PubSub":33,"./templates/landing-template.hbs":69}],69:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='wrapper'>\n\n	<div class='logo' />\n\n	<div class='landing'>\n		<div class='message'>\n			LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPSCING ELIT. IN A MATTIS QUAM.\n		</div>\n	</div>\n\n	<div class='instructions'>\n		<div class='first'>\n			Pick a BPM and a drum kit and ready yourself for the <br/> consequences of world-wide fame.\n		</div>\n		<div>\n			Each song contains eight slots which correspond to eight beats per measure. <br />\n			<img src='assets/images/instructions-track.png' class='img-track' />\n		</div>\n		<div>\n			Tap the square next to the drum to SELECT the BEAT velocity OR TAP THE DRUM TO MUTE THE TRACK <br />\n			<img src='assets/images/instructions-velocity.png' class='img-velocity' />\n		</div>\n		<div>\n			JAM ALONG TO YOUR BEAT BY TAPPING THE <span>PADS</span> BUTTON; press and hold pad to reassign sound\n		</div>\n	</div>\n\n	<div class='btn-start'>\n		CREATE YOUR OWN JAM\n	</div>\n\n	<div class='btn-instructions'>\n		VIEW INSTRUCTIONS\n	</div>\n\n</div>";
  })
},{"handleify":6}],70:[function(require,module,exports){

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


},{"../../supers/View.coffee":30,"./templates/not-supported-template.hbs":71}],71:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n<div class='wrapper'>\n	<div class='notification'>\n		<div class='headline'>\n			LOOKS LIKE MPC AHH IS NOT SUPPORTED BY YOUR DEVICE\n		</div>\n		<div class='requirements'>\n			MINIMUM REQUIREMENTS ANDROID 4.2 / iOS 6\n		</div>\n		<div class='desktop'>\n			PLEASE VISIT THIS SITE ON YOUR DESKTOP OR\n		</div>\n		<div class='btn-listen'>\n			LISTEN TO SAMPLE BEATS FROM THE MPC-AHH &gt;\n		</div>\n	</div>\n\n	<div class='samples'>\n		<div class='headline'>\n			LISTEN TO SAMPLE BEATS FROM THE MPC AHH\n		</div>\n\n		<table>\n			<tr>\n				<td class='right-bottom'>\n					<div class='btn-play icon-play'/>\n					<div class='label'>\n						HIP-HOP SAMPLE\n					</div>\n				</td>\n				<td class='bottom'>\n					<div class='btn-play icon-play'/>\n					<div class='label'>\n						ROCK SAMPLE\n					</div>\n				</td>\n			</tr>\n			<tr>\n				<td class='right'>\n					<div class='btn-play icon-play'/>\n					<div class='label'>\n						DANCE SAMPLE\n					</div>\n				</td>\n				<td>\n					<div class='btn-play icon-play'/>\n					<div class='label'>\n						COKE SAMPLE\n					</div>\n				</td>\n			</tr>\n		</table>\n\n	</div>\n</div>";
  })
},{"handleify":6}],72:[function(require,module,exports){

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


},{"../../events/PubEvent.coffee":14,"../../models/SharedTrackModel.coffee":18,"../../supers/View.coffee":30,"../../utils/PubSub":33,"../create/CreateView.coffee":37,"../create/components/PlayPauseBtn.coffee":41,"../create/components/sequencer/Sequencer.coffee":55,"./templates/share-template.hbs":73}],73:[function(require,module,exports){
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
},{"handleify":6}],74:[function(require,module,exports){
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
},{"handleify":6}],75:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class='device-orientation'>\n	<img src='assets/images/landscape-message.png' />\n</div>";
  })
},{"handleify":6}],76:[function(require,module,exports){
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

},{}],77:[function(require,module,exports){

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


},{"../../supers/View.coffee":30,"./templates/bubbles-template.hbs":79}],78:[function(require,module,exports){

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


},{"../../events/PubEvent.coffee":14,"../../supers/View.coffee":30,"../../utils/PubSub":33,"./templates/visualizer-template.hbs":80}],79:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  })
},{"handleify":6}],80:[function(require,module,exports){
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
},{"handleify":6}]},{},[16])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvbm9kZV9tb2R1bGVzL2RpZ2l0cy9pbmRleC5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvbm9kZV9tb2R1bGVzL2Zhc3RjbGljay9saWIvZmFzdGNsaWNrLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy91dGlscy5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ydW50aW1lLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9ub2RlX21vZHVsZXMvdmlzaWJpbGl0eWpzL2luZGV4LmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9ub2RlX21vZHVsZXMvdmlzaWJpbGl0eWpzL2xpYi92aXNpYmlsaXR5LmNvcmUuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL25vZGVfbW9kdWxlcy92aXNpYmlsaXR5anMvbGliL3Zpc2liaWxpdHkudGltZXJzLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy9BcHBDb250cm9sbGVyLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL2NvbmZpZy9QcmVzZXRzLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy9ldmVudHMvQXBwRXZlbnQuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy9ldmVudHMvUHViRXZlbnQuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy9oZWxwZXJzL2hhbmRsZWJhcnMtaGVscGVycy5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvaW5pdGlhbGl6ZS5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL21vZGVscy9TaGFyZWRUcmFja01vZGVsLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL21vZGVscy9raXRzL0tpdE1vZGVsLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvbW9kZWxzL3BhZC9QYWRTcXVhcmVNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvSW5zdHJ1bWVudENvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3JvdXRlcnMvQXBwUm91dGVyLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvc3VwZXJzL0NvbGxlY3Rpb24uY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy9zdXBlcnMvTW9kZWwuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3V0aWxzL0JyZWFrcG9pbnRNYW5hZ2VyLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdXRpbHMvQnJvd3NlckRldGVjdC5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdXRpbHMvUHViU3ViLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy91dGlscy9TcGluSWNvbi5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdXRpbHMvVG91Y2guanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3V0aWxzL29ic2VydmVEb20uanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9DcmVhdGVWaWV3LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvQlBNSW5kaWNhdG9yLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvS2l0U2VsZWN0b3IuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9QYXR0ZXJuU2VsZWN0b3IuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9QbGF5UGF1c2VCdG4uY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9Ub2dnbGUuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy9JbnN0cnVtZW50LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvaW5zdHJ1bWVudHMvSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9pbnN0cnVtZW50cy90ZW1wbGF0ZXMvaW5zdHJ1bWVudC1wYW5lbC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL2luc3RydW1lbnRzL3RlbXBsYXRlcy9pbnN0cnVtZW50LXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL0xpdmVQYWQuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvUGFkU3F1YXJlLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvcGFkL3RlbXBsYXRlcy9pbnN0cnVtZW50cy10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3BhZC90ZW1wbGF0ZXMvbGl2ZS1wYWQtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvdGVtcGxhdGVzL3BhZC1zcXVhcmUtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9wYWQvdGVtcGxhdGVzL3BhZHMtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZS5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9QYXR0ZXJuVHJhY2suY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy9zZXF1ZW5jZXIvU2VxdWVuY2VyLmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2VxdWVuY2VyL3RlbXBsYXRlcy9wYXR0ZXJuLXNxdWFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci90ZW1wbGF0ZXMvcGF0dGVybi10cmFjay10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci90ZW1wbGF0ZXMvc2VxdWVuY2VyLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvc2hhcmUvU2hhcmVNb2RhbC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NoYXJlL3RlbXBsYXRlcy9zaGFyZS1tb2RhbC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3NoYXJlL3RlbXBsYXRlcy9zaGFyZS1wcmV2aWV3LXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvdGVtcGxhdGVzL2JwbS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3RlbXBsYXRlcy9raXQtc2VsZWN0aW9uLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvY3JlYXRlL2NvbXBvbmVudHMvdGVtcGxhdGVzL3BhdHRlcm4tc2VsZWN0b3ItdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvY29tcG9uZW50cy90ZW1wbGF0ZXMvcGxheS1wYXVzZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2NyZWF0ZS9jb21wb25lbnRzL3RlbXBsYXRlcy90b2dnbGUtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9jcmVhdGUvdGVtcGxhdGVzL2NyZWF0ZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL2xhbmRpbmcvTGFuZGluZ1ZpZXcuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy9sYW5kaW5nL3RlbXBsYXRlcy9sYW5kaW5nLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3Mvbm90LXN1cHBvcnRlZC9Ob3RTdXBwb3J0ZWRWaWV3LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3Mvbm90LXN1cHBvcnRlZC90ZW1wbGF0ZXMvbm90LXN1cHBvcnRlZC10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL1NoYXJlVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL3NoYXJlL3RlbXBsYXRlcy9zaGFyZS10ZW1wbGF0ZS5oYnMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL3RlbXBsYXRlcy9tYWluLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvdGVtcGxhdGVzL3JvdGF0aW9uLXRlbXBsYXRlLmhicyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvdmlzdWFsaXplci9CdWJibGVzLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy92aXN1YWxpemVyL0J1YmJsZXNWaWV3LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL2NuL21wYy1haGgvc3JjL3NjcmlwdHMvdmlld3MvdmlzdWFsaXplci9WaXN1YWxpemVyVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9jbi9tcGMtYWhoL3NyYy9zY3JpcHRzL3ZpZXdzL3Zpc3VhbGl6ZXIvdGVtcGxhdGVzL2J1YmJsZXMtdGVtcGxhdGUuaGJzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvY24vbXBjLWFoaC9zcmMvc2NyaXB0cy92aWV3cy92aXN1YWxpemVyL3RlbXBsYXRlcy92aXN1YWxpemVyLXRlbXBsYXRlLmhicyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3owQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFpQixVQXJiakIsQ0FBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztB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MkIsS0FaN0IsQ0FBQTs7QUFBQSxNQStNTSxDQUFDLE9BQVAsR0FBaUIsY0EvTWpCLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIGRpZ2l0c1xuICogQ29weXJpZ2h0IChjKSAyMDEzIEpvbiBTY2hsaW5rZXJ0XG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUGFkIG51bWJlcnMgd2l0aCB6ZXJvcy5cbiAqIEF1dG9tYXRpY2FsbHkgcGFkIHRoZSBudW1iZXIgb2YgZGlnaXRzIGJhc2VkIG9uIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5LFxuICogb3IgZXhwbGljaXRseSBwYXNzIGluIHRoZSBudW1iZXIgb2YgZGlnaXRzIHRvIHVzZS5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG51bSAgVGhlIG51bWJlciB0byBwYWQuXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdHMgT3B0aW9ucyBvYmplY3Qgd2l0aCBgZGlnaXRzYCBhbmQgYGF1dG9gIHByb3BlcnRpZXMuXG4gKiAgICB7XG4gKiAgICAgIGF1dG86IGFycmF5Lmxlbmd0aCAvLyBwYXNzIGluIHRoZSBsZW5ndGggb2YgdGhlIGFycmF5XG4gKiAgICAgIGRpZ2l0czogNCAgICAgICAgICAvLyBvciBwYXNzIGluIHRoZSBudW1iZXIgb2YgZGlnaXRzIHRvIHVzZVxuICogICAgfVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgIFRoZSBwYWRkZWQgbnVtYmVyIHdpdGggemVyb3MgcHJlcGVuZGVkXG4gKlxuICogQGV4YW1wbGVzOlxuICogIDEgICAgICA9PiAwMDAwMDFcbiAqICAxMCAgICAgPT4gMDAwMDEwXG4gKiAgMTAwICAgID0+IDAwMDEwMFxuICogIDEwMDAgICA9PiAwMDEwMDBcbiAqICAxMDAwMCAgPT4gMDEwMDAwXG4gKiAgMTAwMDAwID0+IDEwMDAwMFxuICovXG5cbmV4cG9ydHMucGFkID0gZnVuY3Rpb24gKG51bSwgb3B0cykge1xuICB2YXIgZGlnaXRzID0gb3B0cy5kaWdpdHMgfHwgMztcbiAgaWYob3B0cy5hdXRvICYmIHR5cGVvZiBvcHRzLmF1dG8gPT09ICdudW1iZXInKSB7XG4gICAgZGlnaXRzID0gU3RyaW5nKG9wdHMuYXV0bykubGVuZ3RoO1xuICB9XG4gIHZhciBsZW5EaWZmID0gZGlnaXRzIC0gU3RyaW5nKG51bSkubGVuZ3RoO1xuICB2YXIgcGFkZGluZyA9ICcnO1xuICBpZiAobGVuRGlmZiA+IDApIHtcbiAgICB3aGlsZSAobGVuRGlmZi0tKSB7XG4gICAgICBwYWRkaW5nICs9ICcwJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhZGRpbmcgKyBudW07XG59O1xuXG4vKipcbiAqIFN0cmlwIGxlYWRpbmcgZGlnaXRzIGZyb20gYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgZnJvbSB3aGljaCB0byBzdHJpcCBkaWdpdHNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqL1xuXG5leHBvcnRzLnN0cmlwbGVmdCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXGQrXFwtPy9nLCAnJyk7XG59O1xuXG4vKipcbiAqIFN0cmlwIHRyYWlsaW5nIGRpZ2l0cyBmcm9tIGEgc3RyaW5nXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIGZyb20gd2hpY2ggdG8gc3RyaXAgZGlnaXRzXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBUaGUgbW9kaWZpZWQgc3RyaW5nXG4gKi9cblxuZXhwb3J0cy5zdHJpcHJpZ2h0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFwtP1xcZCskL2csICcnKTtcbn07XG5cbi8qKlxuICogQ291bnQgZGlnaXRzIG9uIHRoZSBsZWZ0IHNpZGUgb2YgYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgd2l0aCBkaWdpdHMgdG8gY291bnRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqIEBleGFtcGxlXG4gKiAgXCIwMDEtZm9vLm1kXCIgPT4gM1xuICovXG5cbmV4cG9ydHMuY291bnRsZWZ0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyLm1hdGNoKC9eXFxkKy9nKSkubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBDb3VudCBkaWdpdHMgb24gdGhlIHJpZ2h0IHNpZGUgb2YgYSBzdHJpbmdcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgd2l0aCBkaWdpdHMgdG8gY291bnRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgIFRoZSBtb2RpZmllZCBzdHJpbmdcbiAqIEBleGFtcGxlXG4gKiAgXCIwMDEtZm9vLm1kXCIgPT4gM1xuICovXG5cbmV4cG9ydHMuY291bnRyaWdodCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gU3RyaW5nKHN0ci5tYXRjaCgvXFxkKyQvZykpLmxlbmd0aDtcbn07IiwiOyhmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHQvKipcblx0ICogQHByZXNlcnZlIEZhc3RDbGljazogcG9seWZpbGwgdG8gcmVtb3ZlIGNsaWNrIGRlbGF5cyBvbiBicm93c2VycyB3aXRoIHRvdWNoIFVJcy5cblx0ICpcblx0ICogQGNvZGluZ3N0YW5kYXJkIGZ0bGFicy1qc3YyXG5cdCAqIEBjb3B5cmlnaHQgVGhlIEZpbmFuY2lhbCBUaW1lcyBMaW1pdGVkIFtBbGwgUmlnaHRzIFJlc2VydmVkXVxuXHQgKiBAbGljZW5zZSBNSVQgTGljZW5zZSAoc2VlIExJQ0VOU0UudHh0KVxuXHQgKi9cblxuXHQvKmpzbGludCBicm93c2VyOnRydWUsIG5vZGU6dHJ1ZSovXG5cdC8qZ2xvYmFsIGRlZmluZSwgRXZlbnQsIE5vZGUqL1xuXG5cblx0LyoqXG5cdCAqIEluc3RhbnRpYXRlIGZhc3QtY2xpY2tpbmcgbGlzdGVuZXJzIG9uIHRoZSBzcGVjaWZpZWQgbGF5ZXIuXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGxheWVyIFRoZSBsYXllciB0byBsaXN0ZW4gb25cblx0ICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyB0byBvdmVycmlkZSB0aGUgZGVmYXVsdHNcblx0ICovXG5cdGZ1bmN0aW9uIEZhc3RDbGljayhsYXllciwgb3B0aW9ucykge1xuXHRcdHZhciBvbGRPbkNsaWNrO1xuXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHQvKipcblx0XHQgKiBXaGV0aGVyIGEgY2xpY2sgaXMgY3VycmVudGx5IGJlaW5nIHRyYWNrZWQuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBib29sZWFuXG5cdFx0ICovXG5cdFx0dGhpcy50cmFja2luZ0NsaWNrID0gZmFsc2U7XG5cblxuXHRcdC8qKlxuXHRcdCAqIFRpbWVzdGFtcCBmb3Igd2hlbiBjbGljayB0cmFja2luZyBzdGFydGVkLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50cmFja2luZ0NsaWNrU3RhcnQgPSAwO1xuXG5cblx0XHQvKipcblx0XHQgKiBUaGUgZWxlbWVudCBiZWluZyB0cmFja2VkIGZvciBhIGNsaWNrLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgRXZlbnRUYXJnZXRcblx0XHQgKi9cblx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXG5cblx0XHQvKipcblx0XHQgKiBYLWNvb3JkaW5hdGUgb2YgdG91Y2ggc3RhcnQgZXZlbnQuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRvdWNoU3RhcnRYID0gMDtcblxuXG5cdFx0LyoqXG5cdFx0ICogWS1jb29yZGluYXRlIG9mIHRvdWNoIHN0YXJ0IGV2ZW50LlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50b3VjaFN0YXJ0WSA9IDA7XG5cblxuXHRcdC8qKlxuXHRcdCAqIElEIG9mIHRoZSBsYXN0IHRvdWNoLCByZXRyaWV2ZWQgZnJvbSBUb3VjaC5pZGVudGlmaWVyLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy5sYXN0VG91Y2hJZGVudGlmaWVyID0gMDtcblxuXG5cdFx0LyoqXG5cdFx0ICogVG91Y2htb3ZlIGJvdW5kYXJ5LCBiZXlvbmQgd2hpY2ggYSBjbGljayB3aWxsIGJlIGNhbmNlbGxlZC5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudG91Y2hCb3VuZGFyeSA9IG9wdGlvbnMudG91Y2hCb3VuZGFyeSB8fCAxMDtcblxuXG5cdFx0LyoqXG5cdFx0ICogVGhlIEZhc3RDbGljayBsYXllci5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIEVsZW1lbnRcblx0XHQgKi9cblx0XHR0aGlzLmxheWVyID0gbGF5ZXI7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgbWluaW11bSB0aW1lIGJldHdlZW4gdGFwKHRvdWNoc3RhcnQgYW5kIHRvdWNoZW5kKSBldmVudHNcblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudGFwRGVsYXkgPSBvcHRpb25zLnRhcERlbGF5IHx8IDIwMDtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBtYXhpbXVtIHRpbWUgZm9yIGEgdGFwXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRhcFRpbWVvdXQgPSBvcHRpb25zLnRhcFRpbWVvdXQgfHwgNzAwO1xuXG5cdFx0aWYgKEZhc3RDbGljay5ub3ROZWVkZWQobGF5ZXIpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gU29tZSBvbGQgdmVyc2lvbnMgb2YgQW5kcm9pZCBkb24ndCBoYXZlIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kXG5cdFx0ZnVuY3Rpb24gYmluZChtZXRob2QsIGNvbnRleHQpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpOyB9O1xuXHRcdH1cblxuXG5cdFx0dmFyIG1ldGhvZHMgPSBbJ29uTW91c2UnLCAnb25DbGljaycsICdvblRvdWNoU3RhcnQnLCAnb25Ub3VjaE1vdmUnLCAnb25Ub3VjaEVuZCcsICdvblRvdWNoQ2FuY2VsJ107XG5cdFx0dmFyIGNvbnRleHQgPSB0aGlzO1xuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gbWV0aG9kcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHRcdGNvbnRleHRbbWV0aG9kc1tpXV0gPSBiaW5kKGNvbnRleHRbbWV0aG9kc1tpXV0sIGNvbnRleHQpO1xuXHRcdH1cblxuXHRcdC8vIFNldCB1cCBldmVudCBoYW5kbGVycyBhcyByZXF1aXJlZFxuXHRcdGlmIChkZXZpY2VJc0FuZHJvaWQpIHtcblx0XHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0fVxuXG5cdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQ2xpY2ssIHRydWUpO1xuXHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uVG91Y2hTdGFydCwgZmFsc2UpO1xuXHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Ub3VjaE1vdmUsIGZhbHNlKTtcblx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Ub3VjaEVuZCwgZmFsc2UpO1xuXHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5vblRvdWNoQ2FuY2VsLCBmYWxzZSk7XG5cblx0XHQvLyBIYWNrIGlzIHJlcXVpcmVkIGZvciBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgRXZlbnQjc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIChlLmcuIEFuZHJvaWQgMilcblx0XHQvLyB3aGljaCBpcyBob3cgRmFzdENsaWNrIG5vcm1hbGx5IHN0b3BzIGNsaWNrIGV2ZW50cyBidWJibGluZyB0byBjYWxsYmFja3MgcmVnaXN0ZXJlZCBvbiB0aGUgRmFzdENsaWNrXG5cdFx0Ly8gbGF5ZXIgd2hlbiB0aGV5IGFyZSBjYW5jZWxsZWQuXG5cdFx0aWYgKCFFdmVudC5wcm90b3R5cGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKSB7XG5cdFx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgY2FsbGJhY2ssIGNhcHR1cmUpIHtcblx0XHRcdFx0dmFyIHJtdiA9IE5vZGUucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXI7XG5cdFx0XHRcdGlmICh0eXBlID09PSAnY2xpY2snKSB7XG5cdFx0XHRcdFx0cm12LmNhbGwobGF5ZXIsIHR5cGUsIGNhbGxiYWNrLmhpamFja2VkIHx8IGNhbGxiYWNrLCBjYXB0dXJlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRybXYuY2FsbChsYXllciwgdHlwZSwgY2FsbGJhY2ssIGNhcHR1cmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgY2FsbGJhY2ssIGNhcHR1cmUpIHtcblx0XHRcdFx0dmFyIGFkdiA9IE5vZGUucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI7XG5cdFx0XHRcdGlmICh0eXBlID09PSAnY2xpY2snKSB7XG5cdFx0XHRcdFx0YWR2LmNhbGwobGF5ZXIsIHR5cGUsIGNhbGxiYWNrLmhpamFja2VkIHx8IChjYWxsYmFjay5oaWphY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdFx0XHRpZiAoIWV2ZW50LnByb3BhZ2F0aW9uU3RvcHBlZCkge1xuXHRcdFx0XHRcdFx0XHRjYWxsYmFjayhldmVudCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSksIGNhcHR1cmUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFkdi5jYWxsKGxheWVyLCB0eXBlLCBjYWxsYmFjaywgY2FwdHVyZSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Ly8gSWYgYSBoYW5kbGVyIGlzIGFscmVhZHkgZGVjbGFyZWQgaW4gdGhlIGVsZW1lbnQncyBvbmNsaWNrIGF0dHJpYnV0ZSwgaXQgd2lsbCBiZSBmaXJlZCBiZWZvcmVcblx0XHQvLyBGYXN0Q2xpY2sncyBvbkNsaWNrIGhhbmRsZXIuIEZpeCB0aGlzIGJ5IHB1bGxpbmcgb3V0IHRoZSB1c2VyLWRlZmluZWQgaGFuZGxlciBmdW5jdGlvbiBhbmRcblx0XHQvLyBhZGRpbmcgaXQgYXMgbGlzdGVuZXIuXG5cdFx0aWYgKHR5cGVvZiBsYXllci5vbmNsaWNrID09PSAnZnVuY3Rpb24nKSB7XG5cblx0XHRcdC8vIEFuZHJvaWQgYnJvd3NlciBvbiBhdCBsZWFzdCAzLjIgcmVxdWlyZXMgYSBuZXcgcmVmZXJlbmNlIHRvIHRoZSBmdW5jdGlvbiBpbiBsYXllci5vbmNsaWNrXG5cdFx0XHQvLyAtIHRoZSBvbGQgb25lIHdvbid0IHdvcmsgaWYgcGFzc2VkIHRvIGFkZEV2ZW50TGlzdGVuZXIgZGlyZWN0bHkuXG5cdFx0XHRvbGRPbkNsaWNrID0gbGF5ZXIub25jbGljaztcblx0XHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0b2xkT25DbGljayhldmVudCk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRsYXllci5vbmNsaWNrID0gbnVsbDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0KiBXaW5kb3dzIFBob25lIDguMSBmYWtlcyB1c2VyIGFnZW50IHN0cmluZyB0byBsb29rIGxpa2UgQW5kcm9pZCBhbmQgaVBob25lLlxuXHQqXG5cdCogQHR5cGUgYm9vbGVhblxuXHQqL1xuXHR2YXIgZGV2aWNlSXNXaW5kb3dzUGhvbmUgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoXCJXaW5kb3dzIFBob25lXCIpID49IDA7XG5cblx0LyoqXG5cdCAqIEFuZHJvaWQgcmVxdWlyZXMgZXhjZXB0aW9ucy5cblx0ICpcblx0ICogQHR5cGUgYm9vbGVhblxuXHQgKi9cblx0dmFyIGRldmljZUlzQW5kcm9pZCA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignQW5kcm9pZCcpID4gMCAmJiAhZGV2aWNlSXNXaW5kb3dzUGhvbmU7XG5cblxuXHQvKipcblx0ICogaU9TIHJlcXVpcmVzIGV4Y2VwdGlvbnMuXG5cdCAqXG5cdCAqIEB0eXBlIGJvb2xlYW5cblx0ICovXG5cdHZhciBkZXZpY2VJc0lPUyA9IC9pUChhZHxob25lfG9kKS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiAhZGV2aWNlSXNXaW5kb3dzUGhvbmU7XG5cblxuXHQvKipcblx0ICogaU9TIDQgcmVxdWlyZXMgYW4gZXhjZXB0aW9uIGZvciBzZWxlY3QgZWxlbWVudHMuXG5cdCAqXG5cdCAqIEB0eXBlIGJvb2xlYW5cblx0ICovXG5cdHZhciBkZXZpY2VJc0lPUzQgPSBkZXZpY2VJc0lPUyAmJiAoL09TIDRfXFxkKF9cXGQpPy8pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cblxuXHQvKipcblx0ICogaU9TIDYuMC03LiogcmVxdWlyZXMgdGhlIHRhcmdldCBlbGVtZW50IHRvIGJlIG1hbnVhbGx5IGRlcml2ZWRcblx0ICpcblx0ICogQHR5cGUgYm9vbGVhblxuXHQgKi9cblx0dmFyIGRldmljZUlzSU9TV2l0aEJhZFRhcmdldCA9IGRldmljZUlzSU9TICYmICgvT1MgWzYtN11fXFxkLykudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxuXHQvKipcblx0ICogQmxhY2tCZXJyeSByZXF1aXJlcyBleGNlcHRpb25zLlxuXHQgKlxuXHQgKiBAdHlwZSBib29sZWFuXG5cdCAqL1xuXHR2YXIgZGV2aWNlSXNCbGFja0JlcnJ5MTAgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0JCMTAnKSA+IDA7XG5cblx0LyoqXG5cdCAqIERldGVybWluZSB3aGV0aGVyIGEgZ2l2ZW4gZWxlbWVudCByZXF1aXJlcyBhIG5hdGl2ZSBjbGljay5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxFbGVtZW50fSB0YXJnZXQgVGFyZ2V0IERPTSBlbGVtZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIHRydWUgaWYgdGhlIGVsZW1lbnQgbmVlZHMgYSBuYXRpdmUgY2xpY2tcblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUubmVlZHNDbGljayA9IGZ1bmN0aW9uKHRhcmdldCkge1xuXHRcdHN3aXRjaCAodGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpIHtcblxuXHRcdC8vIERvbid0IHNlbmQgYSBzeW50aGV0aWMgY2xpY2sgdG8gZGlzYWJsZWQgaW5wdXRzIChpc3N1ZSAjNjIpXG5cdFx0Y2FzZSAnYnV0dG9uJzpcblx0XHRjYXNlICdzZWxlY3QnOlxuXHRcdGNhc2UgJ3RleHRhcmVhJzpcblx0XHRcdGlmICh0YXJnZXQuZGlzYWJsZWQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ2lucHV0JzpcblxuXHRcdFx0Ly8gRmlsZSBpbnB1dHMgbmVlZCByZWFsIGNsaWNrcyBvbiBpT1MgNiBkdWUgdG8gYSBicm93c2VyIGJ1ZyAoaXNzdWUgIzY4KVxuXHRcdFx0aWYgKChkZXZpY2VJc0lPUyAmJiB0YXJnZXQudHlwZSA9PT0gJ2ZpbGUnKSB8fCB0YXJnZXQuZGlzYWJsZWQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ2xhYmVsJzpcblx0XHRjYXNlICdpZnJhbWUnOiAvLyBpT1M4IGhvbWVzY3JlZW4gYXBwcyBjYW4gcHJldmVudCBldmVudHMgYnViYmxpbmcgaW50byBmcmFtZXNcblx0XHRjYXNlICd2aWRlbyc6XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKC9cXGJuZWVkc2NsaWNrXFxiLykudGVzdCh0YXJnZXQuY2xhc3NOYW1lKTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgd2hldGhlciBhIGdpdmVuIGVsZW1lbnQgcmVxdWlyZXMgYSBjYWxsIHRvIGZvY3VzIHRvIHNpbXVsYXRlIGNsaWNrIGludG8gZWxlbWVudC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxFbGVtZW50fSB0YXJnZXQgVGFyZ2V0IERPTSBlbGVtZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIHRydWUgaWYgdGhlIGVsZW1lbnQgcmVxdWlyZXMgYSBjYWxsIHRvIGZvY3VzIHRvIHNpbXVsYXRlIG5hdGl2ZSBjbGljay5cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUubmVlZHNGb2N1cyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuXHRcdHN3aXRjaCAodGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRjYXNlICd0ZXh0YXJlYSc6XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRjYXNlICdzZWxlY3QnOlxuXHRcdFx0cmV0dXJuICFkZXZpY2VJc0FuZHJvaWQ7XG5cdFx0Y2FzZSAnaW5wdXQnOlxuXHRcdFx0c3dpdGNoICh0YXJnZXQudHlwZSkge1xuXHRcdFx0Y2FzZSAnYnV0dG9uJzpcblx0XHRcdGNhc2UgJ2NoZWNrYm94Jzpcblx0XHRcdGNhc2UgJ2ZpbGUnOlxuXHRcdFx0Y2FzZSAnaW1hZ2UnOlxuXHRcdFx0Y2FzZSAncmFkaW8nOlxuXHRcdFx0Y2FzZSAnc3VibWl0Jzpcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBObyBwb2ludCBpbiBhdHRlbXB0aW5nIHRvIGZvY3VzIGRpc2FibGVkIGlucHV0c1xuXHRcdFx0cmV0dXJuICF0YXJnZXQuZGlzYWJsZWQgJiYgIXRhcmdldC5yZWFkT25seTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuICgvXFxibmVlZHNmb2N1c1xcYi8pLnRlc3QodGFyZ2V0LmNsYXNzTmFtZSk7XG5cdFx0fVxuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFNlbmQgYSBjbGljayBldmVudCB0byB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5zZW5kQ2xpY2sgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50LCBldmVudCkge1xuXHRcdHZhciBjbGlja0V2ZW50LCB0b3VjaDtcblxuXHRcdC8vIE9uIHNvbWUgQW5kcm9pZCBkZXZpY2VzIGFjdGl2ZUVsZW1lbnQgbmVlZHMgdG8gYmUgYmx1cnJlZCBvdGhlcndpc2UgdGhlIHN5bnRoZXRpYyBjbGljayB3aWxsIGhhdmUgbm8gZWZmZWN0ICgjMjQpXG5cdFx0aWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gdGFyZ2V0RWxlbWVudCkge1xuXHRcdFx0ZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG5cdFx0fVxuXG5cdFx0dG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcblxuXHRcdC8vIFN5bnRoZXNpc2UgYSBjbGljayBldmVudCwgd2l0aCBhbiBleHRyYSBhdHRyaWJ1dGUgc28gaXQgY2FuIGJlIHRyYWNrZWRcblx0XHRjbGlja0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnRzJyk7XG5cdFx0Y2xpY2tFdmVudC5pbml0TW91c2VFdmVudCh0aGlzLmRldGVybWluZUV2ZW50VHlwZSh0YXJnZXRFbGVtZW50KSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCB0b3VjaC5zY3JlZW5YLCB0b3VjaC5zY3JlZW5ZLCB0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMCwgbnVsbCk7XG5cdFx0Y2xpY2tFdmVudC5mb3J3YXJkZWRUb3VjaEV2ZW50ID0gdHJ1ZTtcblx0XHR0YXJnZXRFbGVtZW50LmRpc3BhdGNoRXZlbnQoY2xpY2tFdmVudCk7XG5cdH07XG5cblx0RmFzdENsaWNrLnByb3RvdHlwZS5kZXRlcm1pbmVFdmVudFR5cGUgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50KSB7XG5cblx0XHQvL0lzc3VlICMxNTk6IEFuZHJvaWQgQ2hyb21lIFNlbGVjdCBCb3ggZG9lcyBub3Qgb3BlbiB3aXRoIGEgc3ludGhldGljIGNsaWNrIGV2ZW50XG5cdFx0aWYgKGRldmljZUlzQW5kcm9pZCAmJiB0YXJnZXRFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NlbGVjdCcpIHtcblx0XHRcdHJldHVybiAnbW91c2Vkb3duJztcblx0XHR9XG5cblx0XHRyZXR1cm4gJ2NsaWNrJztcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEVsZW1lbnR9IHRhcmdldEVsZW1lbnRcblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUuZm9jdXMgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50KSB7XG5cdFx0dmFyIGxlbmd0aDtcblxuXHRcdC8vIElzc3VlICMxNjA6IG9uIGlPUyA3LCBzb21lIGlucHV0IGVsZW1lbnRzIChlLmcuIGRhdGUgZGF0ZXRpbWUgbW9udGgpIHRocm93IGEgdmFndWUgVHlwZUVycm9yIG9uIHNldFNlbGVjdGlvblJhbmdlLiBUaGVzZSBlbGVtZW50cyBkb24ndCBoYXZlIGFuIGludGVnZXIgdmFsdWUgZm9yIHRoZSBzZWxlY3Rpb25TdGFydCBhbmQgc2VsZWN0aW9uRW5kIHByb3BlcnRpZXMsIGJ1dCB1bmZvcnR1bmF0ZWx5IHRoYXQgY2FuJ3QgYmUgdXNlZCBmb3IgZGV0ZWN0aW9uIGJlY2F1c2UgYWNjZXNzaW5nIHRoZSBwcm9wZXJ0aWVzIGFsc28gdGhyb3dzIGEgVHlwZUVycm9yLiBKdXN0IGNoZWNrIHRoZSB0eXBlIGluc3RlYWQuIEZpbGVkIGFzIEFwcGxlIGJ1ZyAjMTUxMjI3MjQuXG5cdFx0aWYgKGRldmljZUlzSU9TICYmIHRhcmdldEVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UgJiYgdGFyZ2V0RWxlbWVudC50eXBlLmluZGV4T2YoJ2RhdGUnKSAhPT0gMCAmJiB0YXJnZXRFbGVtZW50LnR5cGUgIT09ICd0aW1lJyAmJiB0YXJnZXRFbGVtZW50LnR5cGUgIT09ICdtb250aCcpIHtcblx0XHRcdGxlbmd0aCA9IHRhcmdldEVsZW1lbnQudmFsdWUubGVuZ3RoO1xuXHRcdFx0dGFyZ2V0RWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShsZW5ndGgsIGxlbmd0aCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhcmdldEVsZW1lbnQuZm9jdXMoKTtcblx0XHR9XG5cdH07XG5cblxuXHQvKipcblx0ICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gdGFyZ2V0IGVsZW1lbnQgaXMgYSBjaGlsZCBvZiBhIHNjcm9sbGFibGUgbGF5ZXIgYW5kIGlmIHNvLCBzZXQgYSBmbGFnIG9uIGl0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEVsZW1lbnR9IHRhcmdldEVsZW1lbnRcblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUudXBkYXRlU2Nyb2xsUGFyZW50ID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCkge1xuXHRcdHZhciBzY3JvbGxQYXJlbnQsIHBhcmVudEVsZW1lbnQ7XG5cblx0XHRzY3JvbGxQYXJlbnQgPSB0YXJnZXRFbGVtZW50LmZhc3RDbGlja1Njcm9sbFBhcmVudDtcblxuXHRcdC8vIEF0dGVtcHQgdG8gZGlzY292ZXIgd2hldGhlciB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgY29udGFpbmVkIHdpdGhpbiBhIHNjcm9sbGFibGUgbGF5ZXIuIFJlLWNoZWNrIGlmIHRoZVxuXHRcdC8vIHRhcmdldCBlbGVtZW50IHdhcyBtb3ZlZCB0byBhbm90aGVyIHBhcmVudC5cblx0XHRpZiAoIXNjcm9sbFBhcmVudCB8fCAhc2Nyb2xsUGFyZW50LmNvbnRhaW5zKHRhcmdldEVsZW1lbnQpKSB7XG5cdFx0XHRwYXJlbnRFbGVtZW50ID0gdGFyZ2V0RWxlbWVudDtcblx0XHRcdGRvIHtcblx0XHRcdFx0aWYgKHBhcmVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0ID4gcGFyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcblx0XHRcdFx0XHRzY3JvbGxQYXJlbnQgPSBwYXJlbnRFbGVtZW50O1xuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnQuZmFzdENsaWNrU2Nyb2xsUGFyZW50ID0gcGFyZW50RWxlbWVudDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHBhcmVudEVsZW1lbnQgPSBwYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG5cdFx0XHR9IHdoaWxlIChwYXJlbnRFbGVtZW50KTtcblx0XHR9XG5cblx0XHQvLyBBbHdheXMgdXBkYXRlIHRoZSBzY3JvbGwgdG9wIHRyYWNrZXIgaWYgcG9zc2libGUuXG5cdFx0aWYgKHNjcm9sbFBhcmVudCkge1xuXHRcdFx0c2Nyb2xsUGFyZW50LmZhc3RDbGlja0xhc3RTY3JvbGxUb3AgPSBzY3JvbGxQYXJlbnQuc2Nyb2xsVG9wO1xuXHRcdH1cblx0fTtcblxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fSB0YXJnZXRFbGVtZW50XG5cdCAqIEByZXR1cm5zIHtFbGVtZW50fEV2ZW50VGFyZ2V0fVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5nZXRUYXJnZXRFbGVtZW50RnJvbUV2ZW50VGFyZ2V0ID0gZnVuY3Rpb24oZXZlbnRUYXJnZXQpIHtcblxuXHRcdC8vIE9uIHNvbWUgb2xkZXIgYnJvd3NlcnMgKG5vdGFibHkgU2FmYXJpIG9uIGlPUyA0LjEgLSBzZWUgaXNzdWUgIzU2KSB0aGUgZXZlbnQgdGFyZ2V0IG1heSBiZSBhIHRleHQgbm9kZS5cblx0XHRpZiAoZXZlbnRUYXJnZXQubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKSB7XG5cdFx0XHRyZXR1cm4gZXZlbnRUYXJnZXQucGFyZW50Tm9kZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZXZlbnRUYXJnZXQ7XG5cdH07XG5cblxuXHQvKipcblx0ICogT24gdG91Y2ggc3RhcnQsIHJlY29yZCB0aGUgcG9zaXRpb24gYW5kIHNjcm9sbCBvZmZzZXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vblRvdWNoU3RhcnQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciB0YXJnZXRFbGVtZW50LCB0b3VjaCwgc2VsZWN0aW9uO1xuXG5cdFx0Ly8gSWdub3JlIG11bHRpcGxlIHRvdWNoZXMsIG90aGVyd2lzZSBwaW5jaC10by16b29tIGlzIHByZXZlbnRlZCBpZiBib3RoIGZpbmdlcnMgYXJlIG9uIHRoZSBGYXN0Q2xpY2sgZWxlbWVudCAoaXNzdWUgIzExMSkuXG5cdFx0aWYgKGV2ZW50LnRhcmdldFRvdWNoZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0dGFyZ2V0RWxlbWVudCA9IHRoaXMuZ2V0VGFyZ2V0RWxlbWVudEZyb21FdmVudFRhcmdldChldmVudC50YXJnZXQpO1xuXHRcdHRvdWNoID0gZXZlbnQudGFyZ2V0VG91Y2hlc1swXTtcblxuXHRcdGlmIChkZXZpY2VJc0lPUykge1xuXG5cdFx0XHQvLyBPbmx5IHRydXN0ZWQgZXZlbnRzIHdpbGwgZGVzZWxlY3QgdGV4dCBvbiBpT1MgKGlzc3VlICM0OSlcblx0XHRcdHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcblx0XHRcdGlmIChzZWxlY3Rpb24ucmFuZ2VDb3VudCAmJiAhc2VsZWN0aW9uLmlzQ29sbGFwc2VkKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWRldmljZUlzSU9TNCkge1xuXG5cdFx0XHRcdC8vIFdlaXJkIHRoaW5ncyBoYXBwZW4gb24gaU9TIHdoZW4gYW4gYWxlcnQgb3IgY29uZmlybSBkaWFsb2cgaXMgb3BlbmVkIGZyb20gYSBjbGljayBldmVudCBjYWxsYmFjayAoaXNzdWUgIzIzKTpcblx0XHRcdFx0Ly8gd2hlbiB0aGUgdXNlciBuZXh0IHRhcHMgYW55d2hlcmUgZWxzZSBvbiB0aGUgcGFnZSwgbmV3IHRvdWNoc3RhcnQgYW5kIHRvdWNoZW5kIGV2ZW50cyBhcmUgZGlzcGF0Y2hlZFxuXHRcdFx0XHQvLyB3aXRoIHRoZSBzYW1lIGlkZW50aWZpZXIgYXMgdGhlIHRvdWNoIGV2ZW50IHRoYXQgcHJldmlvdXNseSB0cmlnZ2VyZWQgdGhlIGNsaWNrIHRoYXQgdHJpZ2dlcmVkIHRoZSBhbGVydC5cblx0XHRcdFx0Ly8gU2FkbHksIHRoZXJlIGlzIGFuIGlzc3VlIG9uIGlPUyA0IHRoYXQgY2F1c2VzIHNvbWUgbm9ybWFsIHRvdWNoIGV2ZW50cyB0byBoYXZlIHRoZSBzYW1lIGlkZW50aWZpZXIgYXMgYW5cblx0XHRcdFx0Ly8gaW1tZWRpYXRlbHkgcHJlY2VlZGluZyB0b3VjaCBldmVudCAoaXNzdWUgIzUyKSwgc28gdGhpcyBmaXggaXMgdW5hdmFpbGFibGUgb24gdGhhdCBwbGF0Zm9ybS5cblx0XHRcdFx0Ly8gSXNzdWUgMTIwOiB0b3VjaC5pZGVudGlmaWVyIGlzIDAgd2hlbiBDaHJvbWUgZGV2IHRvb2xzICdFbXVsYXRlIHRvdWNoIGV2ZW50cycgaXMgc2V0IHdpdGggYW4gaU9TIGRldmljZSBVQSBzdHJpbmcsXG5cdFx0XHRcdC8vIHdoaWNoIGNhdXNlcyBhbGwgdG91Y2ggZXZlbnRzIHRvIGJlIGlnbm9yZWQuIEFzIHRoaXMgYmxvY2sgb25seSBhcHBsaWVzIHRvIGlPUywgYW5kIGlPUyBpZGVudGlmaWVycyBhcmUgYWx3YXlzIGxvbmcsXG5cdFx0XHRcdC8vIHJhbmRvbSBpbnRlZ2VycywgaXQncyBzYWZlIHRvIHRvIGNvbnRpbnVlIGlmIHRoZSBpZGVudGlmaWVyIGlzIDAgaGVyZS5cblx0XHRcdFx0aWYgKHRvdWNoLmlkZW50aWZpZXIgJiYgdG91Y2guaWRlbnRpZmllciA9PT0gdGhpcy5sYXN0VG91Y2hJZGVudGlmaWVyKSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLmxhc3RUb3VjaElkZW50aWZpZXIgPSB0b3VjaC5pZGVudGlmaWVyO1xuXG5cdFx0XHRcdC8vIElmIHRoZSB0YXJnZXQgZWxlbWVudCBpcyBhIGNoaWxkIG9mIGEgc2Nyb2xsYWJsZSBsYXllciAodXNpbmcgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoKSBhbmQ6XG5cdFx0XHRcdC8vIDEpIHRoZSB1c2VyIGRvZXMgYSBmbGluZyBzY3JvbGwgb24gdGhlIHNjcm9sbGFibGUgbGF5ZXJcblx0XHRcdFx0Ly8gMikgdGhlIHVzZXIgc3RvcHMgdGhlIGZsaW5nIHNjcm9sbCB3aXRoIGFub3RoZXIgdGFwXG5cdFx0XHRcdC8vIHRoZW4gdGhlIGV2ZW50LnRhcmdldCBvZiB0aGUgbGFzdCAndG91Y2hlbmQnIGV2ZW50IHdpbGwgYmUgdGhlIGVsZW1lbnQgdGhhdCB3YXMgdW5kZXIgdGhlIHVzZXIncyBmaW5nZXJcblx0XHRcdFx0Ly8gd2hlbiB0aGUgZmxpbmcgc2Nyb2xsIHdhcyBzdGFydGVkLCBjYXVzaW5nIEZhc3RDbGljayB0byBzZW5kIGEgY2xpY2sgZXZlbnQgdG8gdGhhdCBsYXllciAtIHVubGVzcyBhIGNoZWNrXG5cdFx0XHRcdC8vIGlzIG1hZGUgdG8gZW5zdXJlIHRoYXQgYSBwYXJlbnQgbGF5ZXIgd2FzIG5vdCBzY3JvbGxlZCBiZWZvcmUgc2VuZGluZyBhIHN5bnRoZXRpYyBjbGljayAoaXNzdWUgIzQyKS5cblx0XHRcdFx0dGhpcy51cGRhdGVTY3JvbGxQYXJlbnQodGFyZ2V0RWxlbWVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy50cmFja2luZ0NsaWNrID0gdHJ1ZTtcblx0XHR0aGlzLnRyYWNraW5nQ2xpY2tTdGFydCA9IGV2ZW50LnRpbWVTdGFtcDtcblx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSB0YXJnZXRFbGVtZW50O1xuXG5cdFx0dGhpcy50b3VjaFN0YXJ0WCA9IHRvdWNoLnBhZ2VYO1xuXHRcdHRoaXMudG91Y2hTdGFydFkgPSB0b3VjaC5wYWdlWTtcblxuXHRcdC8vIFByZXZlbnQgcGhhbnRvbSBjbGlja3Mgb24gZmFzdCBkb3VibGUtdGFwIChpc3N1ZSAjMzYpXG5cdFx0aWYgKChldmVudC50aW1lU3RhbXAgLSB0aGlzLmxhc3RDbGlja1RpbWUpIDwgdGhpcy50YXBEZWxheSkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBCYXNlZCBvbiBhIHRvdWNobW92ZSBldmVudCBvYmplY3QsIGNoZWNrIHdoZXRoZXIgdGhlIHRvdWNoIGhhcyBtb3ZlZCBwYXN0IGEgYm91bmRhcnkgc2luY2UgaXQgc3RhcnRlZC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLnRvdWNoSGFzTW92ZWQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciB0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLCBib3VuZGFyeSA9IHRoaXMudG91Y2hCb3VuZGFyeTtcblxuXHRcdGlmIChNYXRoLmFicyh0b3VjaC5wYWdlWCAtIHRoaXMudG91Y2hTdGFydFgpID4gYm91bmRhcnkgfHwgTWF0aC5hYnModG91Y2gucGFnZVkgLSB0aGlzLnRvdWNoU3RhcnRZKSA+IGJvdW5kYXJ5KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cblxuXHQvKipcblx0ICogVXBkYXRlIHRoZSBsYXN0IHBvc2l0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Ub3VjaE1vdmUgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmICghdGhpcy50cmFja2luZ0NsaWNrKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBJZiB0aGUgdG91Y2ggaGFzIG1vdmVkLCBjYW5jZWwgdGhlIGNsaWNrIHRyYWNraW5nXG5cdFx0aWYgKHRoaXMudGFyZ2V0RWxlbWVudCAhPT0gdGhpcy5nZXRUYXJnZXRFbGVtZW50RnJvbUV2ZW50VGFyZ2V0KGV2ZW50LnRhcmdldCkgfHwgdGhpcy50b3VjaEhhc01vdmVkKGV2ZW50KSkge1xuXHRcdFx0dGhpcy50cmFja2luZ0NsaWNrID0gZmFsc2U7XG5cdFx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIEF0dGVtcHQgdG8gZmluZCB0aGUgbGFiZWxsZWQgY29udHJvbCBmb3IgdGhlIGdpdmVuIGxhYmVsIGVsZW1lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8SFRNTExhYmVsRWxlbWVudH0gbGFiZWxFbGVtZW50XG5cdCAqIEByZXR1cm5zIHtFbGVtZW50fG51bGx9XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLmZpbmRDb250cm9sID0gZnVuY3Rpb24obGFiZWxFbGVtZW50KSB7XG5cblx0XHQvLyBGYXN0IHBhdGggZm9yIG5ld2VyIGJyb3dzZXJzIHN1cHBvcnRpbmcgdGhlIEhUTUw1IGNvbnRyb2wgYXR0cmlidXRlXG5cdFx0aWYgKGxhYmVsRWxlbWVudC5jb250cm9sICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiBsYWJlbEVsZW1lbnQuY29udHJvbDtcblx0XHR9XG5cblx0XHQvLyBBbGwgYnJvd3NlcnMgdW5kZXIgdGVzdCB0aGF0IHN1cHBvcnQgdG91Y2ggZXZlbnRzIGFsc28gc3VwcG9ydCB0aGUgSFRNTDUgaHRtbEZvciBhdHRyaWJ1dGVcblx0XHRpZiAobGFiZWxFbGVtZW50Lmh0bWxGb3IpIHtcblx0XHRcdHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChsYWJlbEVsZW1lbnQuaHRtbEZvcik7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgbm8gZm9yIGF0dHJpYnV0ZSBleGlzdHMsIGF0dGVtcHQgdG8gcmV0cmlldmUgdGhlIGZpcnN0IGxhYmVsbGFibGUgZGVzY2VuZGFudCBlbGVtZW50XG5cdFx0Ly8gdGhlIGxpc3Qgb2Ygd2hpY2ggaXMgZGVmaW5lZCBoZXJlOiBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNS9mb3Jtcy5odG1sI2NhdGVnb3J5LWxhYmVsXG5cdFx0cmV0dXJuIGxhYmVsRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24sIGlucHV0Om5vdChbdHlwZT1oaWRkZW5dKSwga2V5Z2VuLCBtZXRlciwgb3V0cHV0LCBwcm9ncmVzcywgc2VsZWN0LCB0ZXh0YXJlYScpO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIE9uIHRvdWNoIGVuZCwgZGV0ZXJtaW5lIHdoZXRoZXIgdG8gc2VuZCBhIGNsaWNrIGV2ZW50IGF0IG9uY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vblRvdWNoRW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgZm9yRWxlbWVudCwgdHJhY2tpbmdDbGlja1N0YXJ0LCB0YXJnZXRUYWdOYW1lLCBzY3JvbGxQYXJlbnQsIHRvdWNoLCB0YXJnZXRFbGVtZW50ID0gdGhpcy50YXJnZXRFbGVtZW50O1xuXG5cdFx0aWYgKCF0aGlzLnRyYWNraW5nQ2xpY2spIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIFByZXZlbnQgcGhhbnRvbSBjbGlja3Mgb24gZmFzdCBkb3VibGUtdGFwIChpc3N1ZSAjMzYpXG5cdFx0aWYgKChldmVudC50aW1lU3RhbXAgLSB0aGlzLmxhc3RDbGlja1RpbWUpIDwgdGhpcy50YXBEZWxheSkge1xuXHRcdFx0dGhpcy5jYW5jZWxOZXh0Q2xpY2sgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKChldmVudC50aW1lU3RhbXAgLSB0aGlzLnRyYWNraW5nQ2xpY2tTdGFydCkgPiB0aGlzLnRhcFRpbWVvdXQpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIFJlc2V0IHRvIHByZXZlbnQgd3JvbmcgY2xpY2sgY2FuY2VsIG9uIGlucHV0IChpc3N1ZSAjMTU2KS5cblx0XHR0aGlzLmNhbmNlbE5leHRDbGljayA9IGZhbHNlO1xuXG5cdFx0dGhpcy5sYXN0Q2xpY2tUaW1lID0gZXZlbnQudGltZVN0YW1wO1xuXG5cdFx0dHJhY2tpbmdDbGlja1N0YXJ0ID0gdGhpcy50cmFja2luZ0NsaWNrU3RhcnQ7XG5cdFx0dGhpcy50cmFja2luZ0NsaWNrID0gZmFsc2U7XG5cdFx0dGhpcy50cmFja2luZ0NsaWNrU3RhcnQgPSAwO1xuXG5cdFx0Ly8gT24gc29tZSBpT1MgZGV2aWNlcywgdGhlIHRhcmdldEVsZW1lbnQgc3VwcGxpZWQgd2l0aCB0aGUgZXZlbnQgaXMgaW52YWxpZCBpZiB0aGUgbGF5ZXJcblx0XHQvLyBpcyBwZXJmb3JtaW5nIGEgdHJhbnNpdGlvbiBvciBzY3JvbGwsIGFuZCBoYXMgdG8gYmUgcmUtZGV0ZWN0ZWQgbWFudWFsbHkuIE5vdGUgdGhhdFxuXHRcdC8vIGZvciB0aGlzIHRvIGZ1bmN0aW9uIGNvcnJlY3RseSwgaXQgbXVzdCBiZSBjYWxsZWQgKmFmdGVyKiB0aGUgZXZlbnQgdGFyZ2V0IGlzIGNoZWNrZWQhXG5cdFx0Ly8gU2VlIGlzc3VlICM1NzsgYWxzbyBmaWxlZCBhcyByZGFyOi8vMTMwNDg1ODkgLlxuXHRcdGlmIChkZXZpY2VJc0lPU1dpdGhCYWRUYXJnZXQpIHtcblx0XHRcdHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG5cblx0XHRcdC8vIEluIGNlcnRhaW4gY2FzZXMgYXJndW1lbnRzIG9mIGVsZW1lbnRGcm9tUG9pbnQgY2FuIGJlIG5lZ2F0aXZlLCBzbyBwcmV2ZW50IHNldHRpbmcgdGFyZ2V0RWxlbWVudCB0byBudWxsXG5cdFx0XHR0YXJnZXRFbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh0b3VjaC5wYWdlWCAtIHdpbmRvdy5wYWdlWE9mZnNldCwgdG91Y2gucGFnZVkgLSB3aW5kb3cucGFnZVlPZmZzZXQpIHx8IHRhcmdldEVsZW1lbnQ7XG5cdFx0XHR0YXJnZXRFbGVtZW50LmZhc3RDbGlja1Njcm9sbFBhcmVudCA9IHRoaXMudGFyZ2V0RWxlbWVudC5mYXN0Q2xpY2tTY3JvbGxQYXJlbnQ7XG5cdFx0fVxuXG5cdFx0dGFyZ2V0VGFnTmFtZSA9IHRhcmdldEVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdGlmICh0YXJnZXRUYWdOYW1lID09PSAnbGFiZWwnKSB7XG5cdFx0XHRmb3JFbGVtZW50ID0gdGhpcy5maW5kQ29udHJvbCh0YXJnZXRFbGVtZW50KTtcblx0XHRcdGlmIChmb3JFbGVtZW50KSB7XG5cdFx0XHRcdHRoaXMuZm9jdXModGFyZ2V0RWxlbWVudCk7XG5cdFx0XHRcdGlmIChkZXZpY2VJc0FuZHJvaWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0YXJnZXRFbGVtZW50ID0gZm9yRWxlbWVudDtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHRoaXMubmVlZHNGb2N1cyh0YXJnZXRFbGVtZW50KSkge1xuXG5cdFx0XHQvLyBDYXNlIDE6IElmIHRoZSB0b3VjaCBzdGFydGVkIGEgd2hpbGUgYWdvIChiZXN0IGd1ZXNzIGlzIDEwMG1zIGJhc2VkIG9uIHRlc3RzIGZvciBpc3N1ZSAjMzYpIHRoZW4gZm9jdXMgd2lsbCBiZSB0cmlnZ2VyZWQgYW55d2F5LiBSZXR1cm4gZWFybHkgYW5kIHVuc2V0IHRoZSB0YXJnZXQgZWxlbWVudCByZWZlcmVuY2Ugc28gdGhhdCB0aGUgc3Vic2VxdWVudCBjbGljayB3aWxsIGJlIGFsbG93ZWQgdGhyb3VnaC5cblx0XHRcdC8vIENhc2UgMjogV2l0aG91dCB0aGlzIGV4Y2VwdGlvbiBmb3IgaW5wdXQgZWxlbWVudHMgdGFwcGVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIGNvbnRhaW5lZCBpbiBhbiBpZnJhbWUsIHRoZW4gYW55IGlucHV0dGVkIHRleHQgd29uJ3QgYmUgdmlzaWJsZSBldmVuIHRob3VnaCB0aGUgdmFsdWUgYXR0cmlidXRlIGlzIHVwZGF0ZWQgYXMgdGhlIHVzZXIgdHlwZXMgKGlzc3VlICMzNykuXG5cdFx0XHRpZiAoKGV2ZW50LnRpbWVTdGFtcCAtIHRyYWNraW5nQ2xpY2tTdGFydCkgPiAxMDAgfHwgKGRldmljZUlzSU9TICYmIHdpbmRvdy50b3AgIT09IHdpbmRvdyAmJiB0YXJnZXRUYWdOYW1lID09PSAnaW5wdXQnKSkge1xuXHRcdFx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuZm9jdXModGFyZ2V0RWxlbWVudCk7XG5cdFx0XHR0aGlzLnNlbmRDbGljayh0YXJnZXRFbGVtZW50LCBldmVudCk7XG5cblx0XHRcdC8vIFNlbGVjdCBlbGVtZW50cyBuZWVkIHRoZSBldmVudCB0byBnbyB0aHJvdWdoIG9uIGlPUyA0LCBvdGhlcndpc2UgdGhlIHNlbGVjdG9yIG1lbnUgd29uJ3Qgb3Blbi5cblx0XHRcdC8vIEFsc28gdGhpcyBicmVha3Mgb3BlbmluZyBzZWxlY3RzIHdoZW4gVm9pY2VPdmVyIGlzIGFjdGl2ZSBvbiBpT1M2LCBpT1M3IChhbmQgcG9zc2libHkgb3RoZXJzKVxuXHRcdFx0aWYgKCFkZXZpY2VJc0lPUyB8fCB0YXJnZXRUYWdOYW1lICE9PSAnc2VsZWN0Jykge1xuXHRcdFx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKGRldmljZUlzSU9TICYmICFkZXZpY2VJc0lPUzQpIHtcblxuXHRcdFx0Ly8gRG9uJ3Qgc2VuZCBhIHN5bnRoZXRpYyBjbGljayBldmVudCBpZiB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgY29udGFpbmVkIHdpdGhpbiBhIHBhcmVudCBsYXllciB0aGF0IHdhcyBzY3JvbGxlZFxuXHRcdFx0Ly8gYW5kIHRoaXMgdGFwIGlzIGJlaW5nIHVzZWQgdG8gc3RvcCB0aGUgc2Nyb2xsaW5nICh1c3VhbGx5IGluaXRpYXRlZCBieSBhIGZsaW5nIC0gaXNzdWUgIzQyKS5cblx0XHRcdHNjcm9sbFBhcmVudCA9IHRhcmdldEVsZW1lbnQuZmFzdENsaWNrU2Nyb2xsUGFyZW50O1xuXHRcdFx0aWYgKHNjcm9sbFBhcmVudCAmJiBzY3JvbGxQYXJlbnQuZmFzdENsaWNrTGFzdFNjcm9sbFRvcCAhPT0gc2Nyb2xsUGFyZW50LnNjcm9sbFRvcCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBQcmV2ZW50IHRoZSBhY3R1YWwgY2xpY2sgZnJvbSBnb2luZyB0aG91Z2ggLSB1bmxlc3MgdGhlIHRhcmdldCBub2RlIGlzIG1hcmtlZCBhcyByZXF1aXJpbmdcblx0XHQvLyByZWFsIGNsaWNrcyBvciBpZiBpdCBpcyBpbiB0aGUgd2hpdGVsaXN0IGluIHdoaWNoIGNhc2Ugb25seSBub24tcHJvZ3JhbW1hdGljIGNsaWNrcyBhcmUgcGVybWl0dGVkLlxuXHRcdGlmICghdGhpcy5uZWVkc0NsaWNrKHRhcmdldEVsZW1lbnQpKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dGhpcy5zZW5kQ2xpY2sodGFyZ2V0RWxlbWVudCwgZXZlbnQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBPbiB0b3VjaCBjYW5jZWwsIHN0b3AgdHJhY2tpbmcgdGhlIGNsaWNrLlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Ub3VjaENhbmNlbCA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudHJhY2tpbmdDbGljayA9IGZhbHNlO1xuXHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cdH07XG5cblxuXHQvKipcblx0ICogRGV0ZXJtaW5lIG1vdXNlIGV2ZW50cyB3aGljaCBzaG91bGQgYmUgcGVybWl0dGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Nb3VzZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0XHQvLyBJZiBhIHRhcmdldCBlbGVtZW50IHdhcyBuZXZlciBzZXQgKGJlY2F1c2UgYSB0b3VjaCBldmVudCB3YXMgbmV2ZXIgZmlyZWQpIGFsbG93IHRoZSBldmVudFxuXHRcdGlmICghdGhpcy50YXJnZXRFbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoZXZlbnQuZm9yd2FyZGVkVG91Y2hFdmVudCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gUHJvZ3JhbW1hdGljYWxseSBnZW5lcmF0ZWQgZXZlbnRzIHRhcmdldGluZyBhIHNwZWNpZmljIGVsZW1lbnQgc2hvdWxkIGJlIHBlcm1pdHRlZFxuXHRcdGlmICghZXZlbnQuY2FuY2VsYWJsZSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gRGVyaXZlIGFuZCBjaGVjayB0aGUgdGFyZ2V0IGVsZW1lbnQgdG8gc2VlIHdoZXRoZXIgdGhlIG1vdXNlIGV2ZW50IG5lZWRzIHRvIGJlIHBlcm1pdHRlZDtcblx0XHQvLyB1bmxlc3MgZXhwbGljaXRseSBlbmFibGVkLCBwcmV2ZW50IG5vbi10b3VjaCBjbGljayBldmVudHMgZnJvbSB0cmlnZ2VyaW5nIGFjdGlvbnMsXG5cdFx0Ly8gdG8gcHJldmVudCBnaG9zdC9kb3VibGVjbGlja3MuXG5cdFx0aWYgKCF0aGlzLm5lZWRzQ2xpY2sodGhpcy50YXJnZXRFbGVtZW50KSB8fCB0aGlzLmNhbmNlbE5leHRDbGljaykge1xuXG5cdFx0XHQvLyBQcmV2ZW50IGFueSB1c2VyLWFkZGVkIGxpc3RlbmVycyBkZWNsYXJlZCBvbiBGYXN0Q2xpY2sgZWxlbWVudCBmcm9tIGJlaW5nIGZpcmVkLlxuXHRcdFx0aWYgKGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbikge1xuXHRcdFx0XHRldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0Ly8gUGFydCBvZiB0aGUgaGFjayBmb3IgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IEV2ZW50I3N0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiAoZS5nLiBBbmRyb2lkIDIpXG5cdFx0XHRcdGV2ZW50LnByb3BhZ2F0aW9uU3RvcHBlZCA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENhbmNlbCB0aGUgZXZlbnRcblx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZSBtb3VzZSBldmVudCBpcyBwZXJtaXR0ZWQsIHJldHVybiB0cnVlIGZvciB0aGUgYWN0aW9uIHRvIGdvIHRocm91Z2guXG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cblxuXHQvKipcblx0ICogT24gYWN0dWFsIGNsaWNrcywgZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIHRvdWNoLWdlbmVyYXRlZCBjbGljaywgYSBjbGljayBhY3Rpb24gb2NjdXJyaW5nXG5cdCAqIG5hdHVyYWxseSBhZnRlciBhIGRlbGF5IGFmdGVyIGEgdG91Y2ggKHdoaWNoIG5lZWRzIHRvIGJlIGNhbmNlbGxlZCB0byBhdm9pZCBkdXBsaWNhdGlvbiksIG9yXG5cdCAqIGFuIGFjdHVhbCBjbGljayB3aGljaCBzaG91bGQgYmUgcGVybWl0dGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25DbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIHBlcm1pdHRlZDtcblxuXHRcdC8vIEl0J3MgcG9zc2libGUgZm9yIGFub3RoZXIgRmFzdENsaWNrLWxpa2UgbGlicmFyeSBkZWxpdmVyZWQgd2l0aCB0aGlyZC1wYXJ0eSBjb2RlIHRvIGZpcmUgYSBjbGljayBldmVudCBiZWZvcmUgRmFzdENsaWNrIGRvZXMgKGlzc3VlICM0NCkuIEluIHRoYXQgY2FzZSwgc2V0IHRoZSBjbGljay10cmFja2luZyBmbGFnIGJhY2sgdG8gZmFsc2UgYW5kIHJldHVybiBlYXJseS4gVGhpcyB3aWxsIGNhdXNlIG9uVG91Y2hFbmQgdG8gcmV0dXJuIGVhcmx5LlxuXHRcdGlmICh0aGlzLnRyYWNraW5nQ2xpY2spIHtcblx0XHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cdFx0XHR0aGlzLnRyYWNraW5nQ2xpY2sgPSBmYWxzZTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIFZlcnkgb2RkIGJlaGF2aW91ciBvbiBpT1MgKGlzc3VlICMxOCk6IGlmIGEgc3VibWl0IGVsZW1lbnQgaXMgcHJlc2VudCBpbnNpZGUgYSBmb3JtIGFuZCB0aGUgdXNlciBoaXRzIGVudGVyIGluIHRoZSBpT1Mgc2ltdWxhdG9yIG9yIGNsaWNrcyB0aGUgR28gYnV0dG9uIG9uIHRoZSBwb3AtdXAgT1Mga2V5Ym9hcmQgdGhlIGEga2luZCBvZiAnZmFrZScgY2xpY2sgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2l0aCB0aGUgc3VibWl0LXR5cGUgaW5wdXQgZWxlbWVudCBhcyB0aGUgdGFyZ2V0LlxuXHRcdGlmIChldmVudC50YXJnZXQudHlwZSA9PT0gJ3N1Ym1pdCcgJiYgZXZlbnQuZGV0YWlsID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRwZXJtaXR0ZWQgPSB0aGlzLm9uTW91c2UoZXZlbnQpO1xuXG5cdFx0Ly8gT25seSB1bnNldCB0YXJnZXRFbGVtZW50IGlmIHRoZSBjbGljayBpcyBub3QgcGVybWl0dGVkLiBUaGlzIHdpbGwgZW5zdXJlIHRoYXQgdGhlIGNoZWNrIGZvciAhdGFyZ2V0RWxlbWVudCBpbiBvbk1vdXNlIGZhaWxzIGFuZCB0aGUgYnJvd3NlcidzIGNsaWNrIGRvZXNuJ3QgZ28gdGhyb3VnaC5cblx0XHRpZiAoIXBlcm1pdHRlZCkge1xuXHRcdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0XHR9XG5cblx0XHQvLyBJZiBjbGlja3MgYXJlIHBlcm1pdHRlZCwgcmV0dXJuIHRydWUgZm9yIHRoZSBhY3Rpb24gdG8gZ28gdGhyb3VnaC5cblx0XHRyZXR1cm4gcGVybWl0dGVkO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFJlbW92ZSBhbGwgRmFzdENsaWNrJ3MgZXZlbnQgbGlzdGVuZXJzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBsYXllciA9IHRoaXMubGF5ZXI7XG5cblx0XHRpZiAoZGV2aWNlSXNBbmRyb2lkKSB7XG5cdFx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlLCB0cnVlKTtcblx0XHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdH1cblxuXHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrLCB0cnVlKTtcblx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblRvdWNoU3RhcnQsIGZhbHNlKTtcblx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uVG91Y2hNb3ZlLCBmYWxzZSk7XG5cdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uVG91Y2hFbmQsIGZhbHNlKTtcblx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMub25Ub3VjaENhbmNlbCwgZmFsc2UpO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIENoZWNrIHdoZXRoZXIgRmFzdENsaWNrIGlzIG5lZWRlZC5cblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBsYXllciBUaGUgbGF5ZXIgdG8gbGlzdGVuIG9uXG5cdCAqL1xuXHRGYXN0Q2xpY2subm90TmVlZGVkID0gZnVuY3Rpb24obGF5ZXIpIHtcblx0XHR2YXIgbWV0YVZpZXdwb3J0O1xuXHRcdHZhciBjaHJvbWVWZXJzaW9uO1xuXHRcdHZhciBibGFja2JlcnJ5VmVyc2lvbjtcblx0XHR2YXIgZmlyZWZveFZlcnNpb247XG5cblx0XHQvLyBEZXZpY2VzIHRoYXQgZG9uJ3Qgc3VwcG9ydCB0b3VjaCBkb24ndCBuZWVkIEZhc3RDbGlja1xuXHRcdGlmICh0eXBlb2Ygd2luZG93Lm9udG91Y2hzdGFydCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIENocm9tZSB2ZXJzaW9uIC0gemVybyBmb3Igb3RoZXIgYnJvd3NlcnNcblx0XHRjaHJvbWVWZXJzaW9uID0gKygvQ2hyb21lXFwvKFswLTldKykvLmV4ZWMobmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgWywwXSlbMV07XG5cblx0XHRpZiAoY2hyb21lVmVyc2lvbikge1xuXG5cdFx0XHRpZiAoZGV2aWNlSXNBbmRyb2lkKSB7XG5cdFx0XHRcdG1ldGFWaWV3cG9ydCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT12aWV3cG9ydF0nKTtcblxuXHRcdFx0XHRpZiAobWV0YVZpZXdwb3J0KSB7XG5cdFx0XHRcdFx0Ly8gQ2hyb21lIG9uIEFuZHJvaWQgd2l0aCB1c2VyLXNjYWxhYmxlPVwibm9cIiBkb2Vzbid0IG5lZWQgRmFzdENsaWNrIChpc3N1ZSAjODkpXG5cdFx0XHRcdFx0aWYgKG1ldGFWaWV3cG9ydC5jb250ZW50LmluZGV4T2YoJ3VzZXItc2NhbGFibGU9bm8nKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBDaHJvbWUgMzIgYW5kIGFib3ZlIHdpdGggd2lkdGg9ZGV2aWNlLXdpZHRoIG9yIGxlc3MgZG9uJ3QgbmVlZCBGYXN0Q2xpY2tcblx0XHRcdFx0XHRpZiAoY2hyb21lVmVyc2lvbiA+IDMxICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCA8PSB3aW5kb3cub3V0ZXJXaWR0aCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIENocm9tZSBkZXNrdG9wIGRvZXNuJ3QgbmVlZCBGYXN0Q2xpY2sgKGlzc3VlICMxNSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChkZXZpY2VJc0JsYWNrQmVycnkxMCkge1xuXHRcdFx0YmxhY2tiZXJyeVZlcnNpb24gPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9WZXJzaW9uXFwvKFswLTldKilcXC4oWzAtOV0qKS8pO1xuXG5cdFx0XHQvLyBCbGFja0JlcnJ5IDEwLjMrIGRvZXMgbm90IHJlcXVpcmUgRmFzdGNsaWNrIGxpYnJhcnkuXG5cdFx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vZnRsYWJzL2Zhc3RjbGljay9pc3N1ZXMvMjUxXG5cdFx0XHRpZiAoYmxhY2tiZXJyeVZlcnNpb25bMV0gPj0gMTAgJiYgYmxhY2tiZXJyeVZlcnNpb25bMl0gPj0gMykge1xuXHRcdFx0XHRtZXRhVmlld3BvcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9dmlld3BvcnRdJyk7XG5cblx0XHRcdFx0aWYgKG1ldGFWaWV3cG9ydCkge1xuXHRcdFx0XHRcdC8vIHVzZXItc2NhbGFibGU9bm8gZWxpbWluYXRlcyBjbGljayBkZWxheS5cblx0XHRcdFx0XHRpZiAobWV0YVZpZXdwb3J0LmNvbnRlbnQuaW5kZXhPZigndXNlci1zY2FsYWJsZT1ubycpICE9PSAtMSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIHdpZHRoPWRldmljZS13aWR0aCAob3IgbGVzcyB0aGFuIGRldmljZS13aWR0aCkgZWxpbWluYXRlcyBjbGljayBkZWxheS5cblx0XHRcdFx0XHRpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFdpZHRoIDw9IHdpbmRvdy5vdXRlcldpZHRoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBJRTEwIHdpdGggLW1zLXRvdWNoLWFjdGlvbjogbm9uZSBvciBtYW5pcHVsYXRpb24sIHdoaWNoIGRpc2FibGVzIGRvdWJsZS10YXAtdG8tem9vbSAoaXNzdWUgIzk3KVxuXHRcdGlmIChsYXllci5zdHlsZS5tc1RvdWNoQWN0aW9uID09PSAnbm9uZScgfHwgbGF5ZXIuc3R5bGUudG91Y2hBY3Rpb24gPT09ICdtYW5pcHVsYXRpb24nKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBGaXJlZm94IHZlcnNpb24gLSB6ZXJvIGZvciBvdGhlciBicm93c2Vyc1xuXHRcdGZpcmVmb3hWZXJzaW9uID0gKygvRmlyZWZveFxcLyhbMC05XSspLy5leGVjKG5hdmlnYXRvci51c2VyQWdlbnQpIHx8IFssMF0pWzFdO1xuXG5cdFx0aWYgKGZpcmVmb3hWZXJzaW9uID49IDI3KSB7XG5cdFx0XHQvLyBGaXJlZm94IDI3KyBkb2VzIG5vdCBoYXZlIHRhcCBkZWxheSBpZiB0aGUgY29udGVudCBpcyBub3Qgem9vbWFibGUgLSBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD05MjI4OTZcblxuXHRcdFx0bWV0YVZpZXdwb3J0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPXZpZXdwb3J0XScpO1xuXHRcdFx0aWYgKG1ldGFWaWV3cG9ydCAmJiAobWV0YVZpZXdwb3J0LmNvbnRlbnQuaW5kZXhPZigndXNlci1zY2FsYWJsZT1ubycpICE9PSAtMSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGggPD0gd2luZG93Lm91dGVyV2lkdGgpKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIElFMTE6IHByZWZpeGVkIC1tcy10b3VjaC1hY3Rpb24gaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCBhbmQgaXQncyByZWNvbWVuZGVkIHRvIHVzZSBub24tcHJlZml4ZWQgdmVyc2lvblxuXHRcdC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS93aW5kb3dzL2FwcHMvSGg3NjczMTMuYXNweFxuXHRcdGlmIChsYXllci5zdHlsZS50b3VjaEFjdGlvbiA9PT0gJ25vbmUnIHx8IGxheWVyLnN0eWxlLnRvdWNoQWN0aW9uID09PSAnbWFuaXB1bGF0aW9uJykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIEZhY3RvcnkgbWV0aG9kIGZvciBjcmVhdGluZyBhIEZhc3RDbGljayBvYmplY3Rcblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBsYXllciBUaGUgbGF5ZXIgdG8gbGlzdGVuIG9uXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHRzXG5cdCAqL1xuXHRGYXN0Q2xpY2suYXR0YWNoID0gZnVuY3Rpb24obGF5ZXIsIG9wdGlvbnMpIHtcblx0XHRyZXR1cm4gbmV3IEZhc3RDbGljayhsYXllciwgb3B0aW9ucyk7XG5cdH07XG5cblxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcgJiYgZGVmaW5lLmFtZCkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBGYXN0Q2xpY2s7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IEZhc3RDbGljay5hdHRhY2g7XG5cdFx0bW9kdWxlLmV4cG9ydHMuRmFzdENsaWNrID0gRmFzdENsaWNrO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5GYXN0Q2xpY2sgPSBGYXN0Q2xpY2s7XG5cdH1cbn0oKSk7XG4iLCIvKmpzaGludCBlcW51bGw6IHRydWUgKi9cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG5cbnZhciBIYW5kbGViYXJzID0ge307XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbkhhbmRsZWJhcnMuVkVSU0lPTiA9IFwiMS4wLjBcIjtcbkhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT04gPSA0O1xuXG5IYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPj0gMS4wLjAnXG59O1xuXG5IYW5kbGViYXJzLmhlbHBlcnMgID0ge307XG5IYW5kbGViYXJzLnBhcnRpYWxzID0ge307XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgZnVuY3Rpb25UeXBlID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgPSBmdW5jdGlvbihuYW1lLCBmbiwgaW52ZXJzZSkge1xuICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgIGlmIChpbnZlcnNlIHx8IGZuKSB7IHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbnZlcnNlKSB7IGZuLm5vdCA9IGludmVyc2U7IH1cbiAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgPSBmdW5jdGlvbihuYW1lLCBzdHIpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLnBhcnRpYWxzLCAgbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHN0cjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGFyZykge1xuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGhlbHBlcjogJ1wiICsgYXJnICsgXCInXCIpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYmxvY2tIZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSB8fCBmdW5jdGlvbigpIHt9LCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuXG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbih0aGlzKTtcbiAgfSBlbHNlIGlmKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgaWYoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZm4oY29udGV4dCk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLksgPSBmdW5jdGlvbigpIHt9O1xuXG5IYW5kbGViYXJzLmNyZWF0ZUZyYW1lID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbihvYmplY3QpIHtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG9iamVjdDtcbiAgdmFyIG9iaiA9IG5ldyBIYW5kbGViYXJzLksoKTtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG51bGw7XG4gIHJldHVybiBvYmo7XG59O1xuXG5IYW5kbGViYXJzLmxvZ2dlciA9IHtcbiAgREVCVUc6IDAsIElORk86IDEsIFdBUk46IDIsIEVSUk9SOiAzLCBsZXZlbDogMyxcblxuICBtZXRob2RNYXA6IHswOiAnZGVidWcnLCAxOiAnaW5mbycsIDI6ICd3YXJuJywgMzogJ2Vycm9yJ30sXG5cbiAgLy8gY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgb2JqKSB7XG4gICAgaWYgKEhhbmRsZWJhcnMubG9nZ2VyLmxldmVsIDw9IGxldmVsKSB7XG4gICAgICB2YXIgbWV0aG9kID0gSGFuZGxlYmFycy5sb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5IYW5kbGViYXJzLmxvZyA9IGZ1bmN0aW9uKGxldmVsLCBvYmopIHsgSGFuZGxlYmFycy5sb2dnZXIubG9nKGxldmVsLCBvYmopOyB9O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdlYWNoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgZm4gPSBvcHRpb25zLmZuLCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlO1xuICB2YXIgaSA9IDAsIHJldCA9IFwiXCIsIGRhdGE7XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICBkYXRhID0gSGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICB9XG5cbiAgaWYoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICBpZihjb250ZXh0IGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgZm9yKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGk8ajsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhKSB7IGRhdGEuaW5kZXggPSBpOyB9XG4gICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbaV0sIHsgZGF0YTogZGF0YSB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICBpZihjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBpZihkYXRhKSB7IGRhdGEua2V5ID0ga2V5OyB9XG4gICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtrZXldLCB7ZGF0YTogZGF0YX0pO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmKGkgPT09IDApe1xuICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbmRpdGlvbmFsKTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKCFjb25kaXRpb25hbCB8fCBIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29uZGl0aW9uYWwpKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHJldHVybiBIYW5kbGViYXJzLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm59KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYgKCFIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICBIYW5kbGViYXJzLmxvZyhsZXZlbCwgY29udGV4dCk7XG59KTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZNID0ge1xuICB0ZW1wbGF0ZTogZnVuY3Rpb24odGVtcGxhdGVTcGVjKSB7XG4gICAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgICB2YXIgY29udGFpbmVyID0ge1xuICAgICAgZXNjYXBlRXhwcmVzc2lvbjogSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgICAgaW52b2tlUGFydGlhbDogSGFuZGxlYmFycy5WTS5pbnZva2VQYXJ0aWFsLFxuICAgICAgcHJvZ3JhbXM6IFtdLFxuICAgICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXTtcbiAgICAgICAgaWYoZGF0YSkge1xuICAgICAgICAgIHByb2dyYW1XcmFwcGVyID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuLCBkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSBIYW5kbGViYXJzLlZNLnByb2dyYW0oaSwgZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICAgIH0sXG4gICAgICBtZXJnZTogZnVuY3Rpb24ocGFyYW0sIGNvbW1vbikge1xuICAgICAgICB2YXIgcmV0ID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICAgIGlmIChwYXJhbSAmJiBjb21tb24pIHtcbiAgICAgICAgICByZXQgPSB7fTtcbiAgICAgICAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZChyZXQsIGNvbW1vbik7XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBwYXJhbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0sXG4gICAgICBwcm9ncmFtV2l0aERlcHRoOiBIYW5kbGViYXJzLlZNLnByb2dyYW1XaXRoRGVwdGgsXG4gICAgICBub29wOiBIYW5kbGViYXJzLlZNLm5vb3AsXG4gICAgICBjb21waWxlckluZm86IG51bGxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlU3BlYy5jYWxsKGNvbnRhaW5lciwgSGFuZGxlYmFycywgY29udGV4dCwgb3B0aW9ucy5oZWxwZXJzLCBvcHRpb25zLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEpO1xuXG4gICAgICB2YXIgY29tcGlsZXJJbmZvID0gY29udGFpbmVyLmNvbXBpbGVySW5mbyB8fCBbXSxcbiAgICAgICAgICBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICAgICAgY3VycmVudFJldmlzaW9uID0gSGFuZGxlYmFycy5DT01QSUxFUl9SRVZJU0lPTjtcblxuICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IEhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrcnVudGltZVZlcnNpb25zK1wiKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKFwiK2NvbXBpbGVyVmVyc2lvbnMrXCIpLlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgICAgIHRocm93IFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJJbmZvWzFdK1wiKS5cIjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH0sXG5cbiAgcHJvZ3JhbVdpdGhEZXB0aDogZnVuY3Rpb24oaSwgZm4sIGRhdGEgLyosICRkZXB0aCAqLykge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcblxuICAgIHZhciBwcm9ncmFtID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBbY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGFdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgICBwcm9ncmFtLnByb2dyYW0gPSBpO1xuICAgIHByb2dyYW0uZGVwdGggPSBhcmdzLmxlbmd0aDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGEpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gMDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgbm9vcDogZnVuY3Rpb24oKSB7IHJldHVybiBcIlwiOyB9LFxuICBpbnZva2VQYXJ0aWFsOiBmdW5jdGlvbihwYXJ0aWFsLCBuYW1lLCBjb250ZXh0LCBoZWxwZXJzLCBwYXJ0aWFscywgZGF0YSkge1xuICAgIHZhciBvcHRpb25zID0geyBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcblxuICAgIGlmKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuICAgIH0gZWxzZSBpZihwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAoIUhhbmRsZWJhcnMuY29tcGlsZSkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydGlhbHNbbmFtZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUocGFydGlhbCwge2RhdGE6IGRhdGEgIT09IHVuZGVmaW5lZH0pO1xuICAgICAgcmV0dXJuIHBhcnRpYWxzW25hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy50ZW1wbGF0ZSA9IEhhbmRsZWJhcnMuVk0udGVtcGxhdGU7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcblxufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbkhhbmRsZWJhcnMuRXhjZXB0aW9uID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG59O1xuSGFuZGxlYmFycy5FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbi8vIEJ1aWxkIG91dCBvdXIgYmFzaWMgU2FmZVN0cmluZyB0eXBlXG5IYW5kbGViYXJzLlNhZmVTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59O1xuSGFuZGxlYmFycy5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJpbmcudG9TdHJpbmcoKTtcbn07XG5cbnZhciBlc2NhcGUgPSB7XG4gIFwiJlwiOiBcIiZhbXA7XCIsXG4gIFwiPFwiOiBcIiZsdDtcIixcbiAgXCI+XCI6IFwiJmd0O1wiLFxuICAnXCInOiBcIiZxdW90O1wiLFxuICBcIidcIjogXCImI3gyNztcIixcbiAgXCJgXCI6IFwiJiN4NjA7XCJcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZztcbnZhciBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG52YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl0gfHwgXCImYW1wO1wiO1xufTtcblxuSGFuZGxlYmFycy5VdGlscyA9IHtcbiAgZXh0ZW5kOiBmdW5jdGlvbihvYmosIHZhbHVlKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICAgIGlmKHZhbHVlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWx1ZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBlc2NhcGVFeHByZXNzaW9uOiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyBpbnN0YW5jZW9mIEhhbmRsZWJhcnMuU2FmZVN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZy50b1N0cmluZygpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwgfHwgc3RyaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gc3RyaW5nLnRvU3RyaW5nKCk7XG5cbiAgICBpZighcG9zc2libGUudGVzdChzdHJpbmcpKSB7IHJldHVybiBzdHJpbmc7IH1cbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xuICB9LFxuXG4gIGlzRW1wdHk6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmKHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgQXJyYXldXCIgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcycpLmNyZWF0ZSgpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzJykuYXR0YWNoKGV4cG9ydHMpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMnKS5hdHRhY2goZXhwb3J0cykiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL3Zpc2liaWxpdHkudGltZXJzLmpzJylcbiIsIjsoZnVuY3Rpb24gKGdsb2JhbCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIGxhc3RJZCA9IC0xO1xuXG4gICAgLy8gVmlzaWJpbGl0eS5qcyBhbGxvdyB5b3UgdG8ga25vdywgdGhhdCB5b3VyIHdlYiBwYWdlIGlzIGluIHRoZSBiYWNrZ3JvdW5kXG4gICAgLy8gdGFiIGFuZCB0aHVzIG5vdCB2aXNpYmxlIHRvIHRoZSB1c2VyLiBUaGlzIGxpYnJhcnkgaXMgd3JhcCB1bmRlclxuICAgIC8vIFBhZ2UgVmlzaWJpbGl0eSBBUEkuIEl0IGZpeCBwcm9ibGVtcyB3aXRoIGRpZmZlcmVudCB2ZW5kb3IgcHJlZml4ZXMgYW5kXG4gICAgLy8gYWRkIGhpZ2gtbGV2ZWwgdXNlZnVsIGZ1bmN0aW9ucy5cbiAgICB2YXIgc2VsZiA9IHtcblxuICAgICAgICAvLyBDYWxsIGNhbGxiYWNrIG9ubHkgd2hlbiBwYWdlIGJlY29tZSB0byB2aXNpYmxlIGZvciB1c2VyIG9yXG4gICAgICAgIC8vIGNhbGwgaXQgbm93IGlmIHBhZ2UgaXMgdmlzaWJsZSBub3cgb3IgUGFnZSBWaXNpYmlsaXR5IEFQSVxuICAgICAgICAvLyBkb2VzbuKAmXQgc3VwcG9ydGVkLlxuICAgICAgICAvL1xuICAgICAgICAvLyBSZXR1cm4gZmFsc2UgaWYgQVBJIGlzbuKAmXQgc3VwcG9ydGVkLCB0cnVlIGlmIHBhZ2UgaXMgYWxyZWFkeSB2aXNpYmxlXG4gICAgICAgIC8vIG9yIGxpc3RlbmVyIElEICh5b3UgY2FuIHVzZSBpdCBpbiBgdW5iaW5kYCBtZXRob2QpIGlmIHBhZ2UgaXNu4oCZdFxuICAgICAgICAvLyB2aXNpYmxlIG5vdy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gICBWaXNpYmlsaXR5Lm9uVmlzaWJsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vICAgICAgIHN0YXJ0SW50cm9BbmltYXRpb24oKTtcbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgb25WaXNpYmxlOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBzdXBwb3J0ID0gc2VsZi5pc1N1cHBvcnRlZCgpO1xuICAgICAgICAgICAgaWYgKCAhc3VwcG9ydCB8fCAhc2VsZi5oaWRkZW4oKSApIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdXBwb3J0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBzZWxmLmNoYW5nZShmdW5jdGlvbiAoZSwgc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoICFzZWxmLmhpZGRlbigpICkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnVuYmluZChsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gQ2FsbCBjYWxsYmFjayB3aGVuIHZpc2liaWxpdHkgd2lsbCBiZSBjaGFuZ2VkLiBGaXJzdCBhcmd1bWVudCBmb3JcbiAgICAgICAgLy8gY2FsbGJhY2sgd2lsbCBiZSBvcmlnaW5hbCBldmVudCBvYmplY3QsIHNlY29uZCB3aWxsIGJlIHZpc2liaWxpdHlcbiAgICAgICAgLy8gc3RhdGUgbmFtZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gUmV0dXJuIGxpc3RlbmVyIElEIHRvIHVuYmluZCBsaXN0ZW5lciBieSBgdW5iaW5kYCBtZXRob2QuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIElmIFBhZ2UgVmlzaWJpbGl0eSBBUEkgZG9lc27igJl0IHN1cHBvcnRlZCBtZXRob2Qgd2lsbCBiZSByZXR1cm4gZmFsc2VcbiAgICAgICAgLy8gYW5kIGNhbGxiYWNrIG5ldmVyIHdpbGwgYmUgY2FsbGVkLlxuICAgICAgICAvL1xuICAgICAgICAvLyAgIFZpc2liaWxpdHkuY2hhbmdlKGZ1bmN0aW9uKGUsIHN0YXRlKSB7XG4gICAgICAgIC8vICAgICAgIFN0YXRpc3RpY3MudmlzaWJpbGl0eUNoYW5nZShzdGF0ZSk7XG4gICAgICAgIC8vICAgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIEl0IGlzIGp1c3QgcHJveHkgdG8gYHZpc2liaWxpdHljaGFuZ2VgIGV2ZW50LCBidXQgdXNlIHZlbmRvciBwcmVmaXguXG4gICAgICAgIGNoYW5nZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoICFzZWxmLmlzU3VwcG9ydGVkKCkgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdElkICs9IDE7XG4gICAgICAgICAgICB2YXIgbnVtYmVyID0gbGFzdElkO1xuICAgICAgICAgICAgc2VsZi5fY2FsbGJhY2tzW251bWJlcl0gPSBjYWxsYmFjaztcbiAgICAgICAgICAgIHNlbGYuX2xpc3RlbigpO1xuICAgICAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBSZW1vdmUgYGNoYW5nZWAgbGlzdGVuZXIgYnkgaXQgSUQuXG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgdmFyIGlkID0gVmlzaWJpbGl0eS5jaGFuZ2UoZnVuY3Rpb24oZSwgc3RhdGUpIHtcbiAgICAgICAgLy8gICAgICAgZmlyc3RDaGFuZ2VDYWxsYmFjaygpO1xuICAgICAgICAvLyAgICAgICBWaXNpYmlsaXR5LnVuYmluZChpZCk7XG4gICAgICAgIC8vICAgfSk7XG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICBkZWxldGUgc2VsZi5fY2FsbGJhY2tzW2lkXTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBDYWxsIGBjYWxsYmFja2AgaW4gYW55IHN0YXRlLCBleHBlY3Qg4oCccHJlcmVuZGVy4oCdLiBJZiBjdXJyZW50IHN0YXRlXG4gICAgICAgIC8vIGlzIOKAnHByZXJlbmRlcuKAnSBpdCB3aWxsIHdhaXQgdW50aWwgc3RhdGUgd2lsbCBiZSBjaGFuZ2VkLlxuICAgICAgICAvLyBJZiBQYWdlIFZpc2liaWxpdHkgQVBJIGRvZXNu4oCZdCBzdXBwb3J0ZWQsIGl0IHdpbGwgY2FsbCBgY2FsbGJhY2tgXG4gICAgICAgIC8vIGltbWVkaWF0ZWx5LlxuICAgICAgICAvL1xuICAgICAgICAvLyBSZXR1cm4gZmFsc2UgaWYgQVBJIGlzbuKAmXQgc3VwcG9ydGVkLCB0cnVlIGlmIHBhZ2UgaXMgYWxyZWFkeSBhZnRlclxuICAgICAgICAvLyBwcmVyZW5kZXJpbmcgb3IgbGlzdGVuZXIgSUQgKHlvdSBjYW4gdXNlIGl0IGluIGB1bmJpbmRgIG1ldGhvZClcbiAgICAgICAgLy8gaWYgcGFnZSBpcyBwcmVyZW5kZWQgbm93LlxuICAgICAgICAvL1xuICAgICAgICAvLyAgIFZpc2liaWxpdHkuYWZ0ZXJQcmVyZW5kZXJpbmcoZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgICAgICBTdGF0aXN0aWNzLmNvdW50VmlzaXRvcigpO1xuICAgICAgICAvLyAgIH0pO1xuICAgICAgICBhZnRlclByZXJlbmRlcmluZzogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgc3VwcG9ydCAgID0gc2VsZi5pc1N1cHBvcnRlZCgpO1xuICAgICAgICAgICAgdmFyIHByZXJlbmRlciA9ICdwcmVyZW5kZXInO1xuXG4gICAgICAgICAgICBpZiAoICFzdXBwb3J0IHx8IHByZXJlbmRlciAhPSBzZWxmLnN0YXRlKCkgKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VwcG9ydDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGxpc3RlbmVyID0gc2VsZi5jaGFuZ2UoZnVuY3Rpb24gKGUsIHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBwcmVyZW5kZXIgIT0gc3RhdGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudW5iaW5kKGxpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBpZiBwYWdlIG5vdyBpc27igJl0IHZpc2libGUgdG8gdXNlci5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gICBpZiAoICFWaXNpYmlsaXR5LmhpZGRlbigpICkge1xuICAgICAgICAvLyAgICAgICBWaWRlb1BsYXllci5wbGF5KCk7XG4gICAgICAgIC8vICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyBJdCBpcyBqdXN0IHByb3h5IHRvIGBkb2N1bWVudC5oaWRkZW5gLCBidXQgdXNlIHZlbmRvciBwcmVmaXguXG4gICAgICAgIGhpZGRlbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhKHNlbGYuX2RvYy5oaWRkZW4gfHwgc2VsZi5fZG9jLndlYmtpdEhpZGRlbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gUmV0dXJuIHZpc2liaWxpdHkgc3RhdGU6ICd2aXNpYmxlJywgJ2hpZGRlbicgb3IgJ3ByZXJlbmRlcicuXG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgaWYgKCAncHJlcmVuZGVyJyA9PSBWaXNpYmlsaXR5LnN0YXRlKCkgKSB7XG4gICAgICAgIC8vICAgICAgIFN0YXRpc3RpY3MucGFnZUlzUHJlcmVuZGVyaW5nKCk7XG4gICAgICAgIC8vICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyBEb27igJl0IHVzZSBgVmlzaWJpbGl0eS5zdGF0ZSgpYCB0byBkZXRlY3QsIGlzIHBhZ2UgdmlzaWJsZSwgYmVjYXVzZVxuICAgICAgICAvLyB2aXNpYmlsaXR5IHN0YXRlcyBjYW4gZXh0ZW5kIGluIG5leHQgQVBJIHZlcnNpb25zLlxuICAgICAgICAvLyBVc2UgbW9yZSBzaW1wbGVyIGFuZCBnZW5lcmFsIGBWaXNpYmlsaXR5LmhpZGRlbigpYCBmb3IgdGhpcyBjYXNlcy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gSXQgaXMganVzdCBwcm94eSB0byBgZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlYCwgYnV0IHVzZVxuICAgICAgICAvLyB2ZW5kb3IgcHJlZml4LlxuICAgICAgICBzdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2RvYy52aXNpYmlsaXR5U3RhdGUgICAgICAgfHxcbiAgICAgICAgICAgICAgICAgICBzZWxmLl9kb2Mud2Via2l0VmlzaWJpbGl0eVN0YXRlIHx8XG4gICAgICAgICAgICAgICAgICAgJ3Zpc2libGUnO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFJldHVybiB0cnVlIGlmIGJyb3dzZXIgc3VwcG9ydCBQYWdlIFZpc2liaWxpdHkgQVBJLlxuICAgICAgICAvL1xuICAgICAgICAvLyAgIGlmICggVmlzaWJpbGl0eS5pc1N1cHBvcnRlZCgpICkge1xuICAgICAgICAvLyAgICAgICBTdGF0aXN0aWNzLnN0YXJ0VHJhY2tpbmdWaXNpYmlsaXR5KCk7XG4gICAgICAgIC8vICAgICAgIFZpc2liaWxpdHkuY2hhbmdlKGZ1bmN0aW9uKGUsIHN0YXRlKSkge1xuICAgICAgICAvLyAgICAgICAgICAgU3RhdGlzdGljcy50cmFja1Zpc2liaWxpdHkoc3RhdGUpO1xuICAgICAgICAvLyAgICAgICB9KTtcbiAgICAgICAgLy8gICB9XG4gICAgICAgIGlzU3VwcG9ydGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gISEoc2VsZi5fZG9jLnZpc2liaWxpdHlTdGF0ZSB8fFxuICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2RvYy53ZWJraXRWaXNpYmlsaXR5U3RhdGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIExpbmsgdG8gZG9jdW1lbnQgb2JqZWN0IHRvIGNoYW5nZSBpdCBpbiB0ZXN0cy5cbiAgICAgICAgX2RvYzogZG9jdW1lbnQgfHwge30sXG5cbiAgICAgICAgLy8gQ2FsbGJhY2tzIGZyb20gYGNoYW5nZWAgbWV0aG9kLCB0aGF0IHdhaXQgdmlzaWJpbGl0eSBjaGFuZ2VzLlxuICAgICAgICBfY2FsbGJhY2tzOiB7IH0sXG5cbiAgICAgICAgLy8gTGlzdGVuZXIgZm9yIGB2aXNpYmlsaXR5Y2hhbmdlYCBldmVudC5cbiAgICAgICAgX2NoYW5nZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHNlbGYuc3RhdGUoKTtcblxuICAgICAgICAgICAgZm9yICggdmFyIGkgaW4gc2VsZi5fY2FsbGJhY2tzICkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2NhbGxiYWNrc1tpXS5jYWxsKHNlbGYuX2RvYywgZXZlbnQsIHN0YXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBTZXQgbGlzdGVuZXIgZm9yIGB2aXNpYmlsaXR5Y2hhbmdlYCBldmVudC5cbiAgICAgICAgX2xpc3RlbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCBzZWxmLl9pbml0ICkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGV2ZW50ID0gJ3Zpc2liaWxpdHljaGFuZ2UnO1xuICAgICAgICAgICAgaWYgKCBzZWxmLl9kb2Mud2Via2l0VmlzaWJpbGl0eVN0YXRlICkge1xuICAgICAgICAgICAgICAgIGV2ZW50ID0gJ3dlYmtpdCcgKyBldmVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2NoYW5nZS5hcHBseShzZWxmLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICggc2VsZi5fZG9jLmFkZEV2ZW50TGlzdGVuZXIgKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZG9jLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZG9jLmF0dGFjaEV2ZW50KGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLl9pbml0ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIGlmICggdHlwZW9mKG1vZHVsZSkgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gc2VsZjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBnbG9iYWwuVmlzaWJpbGl0eSA9IHNlbGY7XG4gICAgfVxuXG59KSh0aGlzKTtcbiIsIjsoZnVuY3Rpb24gKHdpbmRvdykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIGxhc3RUaW1lciA9IC0xO1xuXG4gICAgdmFyIGluc3RhbGwgPSBmdW5jdGlvbiAoVmlzaWJpbGl0eSkge1xuXG4gICAgICAgIC8vIFJ1biBjYWxsYmFjayBldmVyeSBgaW50ZXJ2YWxgIG1pbGxpc2Vjb25kcyBpZiBwYWdlIGlzIHZpc2libGUgYW5kXG4gICAgICAgIC8vIGV2ZXJ5IGBoaWRkZW5JbnRlcnZhbGAgbWlsbGlzZWNvbmRzIGlmIHBhZ2UgaXMgaGlkZGVuLlxuICAgICAgICAvL1xuICAgICAgICAvLyAgIFZpc2liaWxpdHkuZXZlcnkoNjAgKiAxMDAwLCA1ICogNjAgKiAxMDAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vICAgICAgIGNoZWNrTmV3TWFpbHMoKTtcbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gWW91IGNhbiBza2lwIGBoaWRkZW5JbnRlcnZhbGAgYW5kIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIG9ubHkgaWZcbiAgICAgICAgLy8gcGFnZSBpcyB2aXNpYmxlLlxuICAgICAgICAvL1xuICAgICAgICAvLyAgIFZpc2liaWxpdHkuZXZlcnkoMTAwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgICAgICB1cGRhdGVDb3VudGRvd24oKTtcbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gSXQgaXMgYW5hbG9nIG9mIGBzZXRJbnRlcnZhbChjYWxsYmFjaywgaW50ZXJ2YWwpYCBidXQgdXNlIHZpc2liaWxpdHlcbiAgICAgICAgLy8gc3RhdGUuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEl0IHJldHVybiB0aW1lciBJRCwgdGhhdCB5b3UgY2FuIHVzZSBpbiBgVmlzaWJpbGl0eS5zdG9wKGlkKWAgdG8gc3RvcFxuICAgICAgICAvLyB0aW1lciAoYGNsZWFySW50ZXJ2YWxgIGFuYWxvZykuXG4gICAgICAgIC8vIFdhcm5pbmc6IHRpbWVyIElEIGlzIGRpZmZlcmVudCBmcm9tIGludGVydmFsIElEIGZyb20gYHNldEludGVydmFsYCxcbiAgICAgICAgLy8gc28gZG9u4oCZdCB1c2UgaXQgaW4gYGNsZWFySW50ZXJ2YWxgLlxuICAgICAgICAvL1xuICAgICAgICAvLyBPbiBjaGFuZ2Ugc3RhdGUgZnJvbSBoaWRkZW4gdG8gdmlzaWJsZSB0aW1lcnMgd2lsbCBiZSBleGVjdXRlLlxuICAgICAgICBWaXNpYmlsaXR5LmV2ZXJ5ID0gZnVuY3Rpb24gKGludGVydmFsLCBoaWRkZW5JbnRlcnZhbCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIFZpc2liaWxpdHkuX3RpbWUoKTtcblxuICAgICAgICAgICAgaWYgKCAhY2FsbGJhY2sgKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBoaWRkZW5JbnRlcnZhbDtcbiAgICAgICAgICAgICAgICBoaWRkZW5JbnRlcnZhbCA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhc3RUaW1lciArPSAxO1xuICAgICAgICAgICAgdmFyIG51bWJlciA9IGxhc3RUaW1lcjtcblxuICAgICAgICAgICAgVmlzaWJpbGl0eS5fdGltZXJzW251bWJlcl0gPSB7XG4gICAgICAgICAgICAgICAgdmlzaWJsZTogIGludGVydmFsLFxuICAgICAgICAgICAgICAgIGhpZGRlbjogICBoaWRkZW5JbnRlcnZhbCxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2tcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBWaXNpYmlsaXR5Ll9ydW4obnVtYmVyLCBmYWxzZSk7XG5cbiAgICAgICAgICAgIGlmICggVmlzaWJpbGl0eS5pc1N1cHBvcnRlZCgpICkge1xuICAgICAgICAgICAgICAgIFZpc2liaWxpdHkuX2xpc3RlbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTdG9wIHRpbWVyIGZyb20gYGV2ZXJ5YCBtZXRob2QgYnkgaXQgSUQgKGBldmVyeWAgbWV0aG9kIHJldHVybiBpdCkuXG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgc2xpZGVzaG93ID0gVmlzaWJpbGl0eS5ldmVyeSg1ICogMTAwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgICAgICBjaGFuZ2VTbGlkZSgpO1xuICAgICAgICAvLyAgIH0pO1xuICAgICAgICAvLyAgICQoJy5zdG9wU2xpZGVzaG93JykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgICAgICBWaXNpYmlsaXR5LnN0b3Aoc2xpZGVzaG93KTtcbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgVmlzaWJpbGl0eS5zdG9wID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIGlmICggIVZpc2liaWxpdHkuX3RpbWVyc1tpZF0gKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgVmlzaWJpbGl0eS5fc3RvcChpZCk7XG4gICAgICAgICAgICBkZWxldGUgVmlzaWJpbGl0eS5fdGltZXJzW2lkXTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENhbGxiYWNrcyBhbmQgaW50ZXJ2YWxzIGFkZGVkIGJ5IGBldmVyeWAgbWV0aG9kLlxuICAgICAgICBWaXNpYmlsaXR5Ll90aW1lcnMgPSB7IH07XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSB2YXJpYWJsZXMgb24gcGFnZSBsb2FkaW5nLlxuICAgICAgICBWaXNpYmlsaXR5Ll90aW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCBWaXNpYmlsaXR5Ll90aW1lZCApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBWaXNpYmlsaXR5Ll90aW1lZCAgICAgPSB0cnVlO1xuICAgICAgICAgICAgVmlzaWJpbGl0eS5fd2FzSGlkZGVuID0gVmlzaWJpbGl0eS5oaWRkZW4oKTtcblxuICAgICAgICAgICAgVmlzaWJpbGl0eS5jaGFuZ2UoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFZpc2liaWxpdHkuX3N0b3BSdW4oKTtcbiAgICAgICAgICAgICAgICBWaXNpYmlsaXR5Ll93YXNIaWRkZW4gPSBWaXNpYmlsaXR5LmhpZGRlbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVHJ5IHRvIHJ1biB0aW1lciBmcm9tIGV2ZXJ5IG1ldGhvZCBieSBpdOKAmXMgSUQuIEl0IHdpbGwgYmUgdXNlXG4gICAgICAgIC8vIGBpbnRlcnZhbGAgb3IgYGhpZGRlbkludGVydmFsYCBkZXBlbmRpbmcgb24gdmlzaWJpbGl0eSBzdGF0ZS5cbiAgICAgICAgLy8gSWYgcGFnZSBpcyBoaWRkZW4gYW5kIGBoaWRkZW5JbnRlcnZhbGAgaXMgbnVsbCxcbiAgICAgICAgLy8gaXQgd2lsbCBub3QgcnVuIHRpbWVyLlxuICAgICAgICAvL1xuICAgICAgICAvLyBBcmd1bWVudCBgcnVuTm93YCBzYXksIHRoYXQgdGltZXJzIG11c3QgYmUgZXhlY3V0ZSBub3cgdG9vLlxuICAgICAgICBWaXNpYmlsaXR5Ll9ydW4gPSBmdW5jdGlvbiAoaWQsIHJ1bk5vdykge1xuICAgICAgICAgICAgdmFyIGludGVydmFsLFxuICAgICAgICAgICAgICAgIHRpbWVyID0gVmlzaWJpbGl0eS5fdGltZXJzW2lkXTtcblxuICAgICAgICAgICAgaWYgKCBWaXNpYmlsaXR5LmhpZGRlbigpICkge1xuICAgICAgICAgICAgICAgIGlmICggbnVsbCA9PT0gdGltZXIuaGlkZGVuICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGludGVydmFsID0gdGltZXIuaGlkZGVuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IHRpbWVyLnZpc2libGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBydW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGltZXIubGFzdCA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgdGltZXIuY2FsbGJhY2suY2FsbCh3aW5kb3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIHJ1bk5vdyApIHtcbiAgICAgICAgICAgICAgICB2YXIgbm93ICA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgdmFyIGxhc3QgPSBub3cgLSB0aW1lci5sYXN0IDtcblxuICAgICAgICAgICAgICAgIGlmICggaW50ZXJ2YWwgPiBsYXN0ICkge1xuICAgICAgICAgICAgICAgICAgICB0aW1lci5kZWxheSA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXIuaWQgPSBzZXRJbnRlcnZhbChydW5uZXIsIGludGVydmFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5lcigpO1xuICAgICAgICAgICAgICAgICAgICB9LCBpbnRlcnZhbCAtIGxhc3QpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVyLmlkID0gc2V0SW50ZXJ2YWwocnVubmVyLCBpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5lcigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGltZXIuaWQgPSBzZXRJbnRlcnZhbChydW5uZXIsIGludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTdG9wIHRpbWVyIGZyb20gYGV2ZXJ5YCBtZXRob2QgYnkgaXTigJlzIElELlxuICAgICAgICBWaXNpYmlsaXR5Ll9zdG9wID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICB2YXIgdGltZXIgPSBWaXNpYmlsaXR5Ll90aW1lcnNbaWRdO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lci5pZCk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIuZGVsYXkpO1xuICAgICAgICAgICAgZGVsZXRlIHRpbWVyLmlkO1xuICAgICAgICAgICAgZGVsZXRlIHRpbWVyLmRlbGF5O1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIExpc3RlbmVyIGZvciBgdmlzaWJpbGl0eWNoYW5nZWAgZXZlbnQuXG4gICAgICAgIFZpc2liaWxpdHkuX3N0b3BSdW4gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBpc0hpZGRlbiAgPSBWaXNpYmlsaXR5LmhpZGRlbigpLFxuICAgICAgICAgICAgICAgIHdhc0hpZGRlbiA9IFZpc2liaWxpdHkuX3dhc0hpZGRlbjtcblxuICAgICAgICAgICAgaWYgKCAoaXNIaWRkZW4gJiYgIXdhc0hpZGRlbikgfHwgKCFpc0hpZGRlbiAmJiB3YXNIaWRkZW4pICkge1xuICAgICAgICAgICAgICAgIGZvciAoIHZhciBpIGluIFZpc2liaWxpdHkuX3RpbWVycyApIHtcbiAgICAgICAgICAgICAgICAgICAgVmlzaWJpbGl0eS5fc3RvcChpKTtcbiAgICAgICAgICAgICAgICAgICAgVmlzaWJpbGl0eS5fcnVuKGksICFpc0hpZGRlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBWaXNpYmlsaXR5O1xuICAgIH1cblxuICAgIGlmICggdHlwZW9mKG1vZHVsZSkgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gaW5zdGFsbChyZXF1aXJlKCcuL3Zpc2liaWxpdHkuY29yZScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpbnN0YWxsKHdpbmRvdy5WaXNpYmlsaXR5KVxuICAgIH1cblxufSkod2luZG93KTtcbiIsIiMjIypcbiAqIFByaW1hcnkgYXBwbGljYXRpb24gY29udHJvbGxlclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblZpc2liaWxpdHkgICAgICAgID0gcmVxdWlyZSAndmlzaWJpbGl0eWpzJ1xuQXBwQ29uZmlnICAgICAgICAgPSByZXF1aXJlICcuL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgICAgICAgICAgPSByZXF1aXJlICcuL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5QdWJFdmVudCAgICAgICAgICA9IHJlcXVpcmUgJy4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblNoYXJlZFRyYWNrTW9kZWwgID0gcmVxdWlyZSAnLi9tb2RlbHMvU2hhcmVkVHJhY2tNb2RlbC5jb2ZmZWUnXG5BcHBSb3V0ZXIgICAgICAgICA9IHJlcXVpcmUgJy4vcm91dGVycy9BcHBSb3V0ZXIuY29mZmVlJ1xuQnJlYWtwb2ludE1hbmFnZXIgPSByZXF1aXJlICcuL3V0aWxzL0JyZWFrcG9pbnRNYW5hZ2VyLmNvZmZlZSdcblB1YlN1YiAgICAgICAgICAgID0gcmVxdWlyZSAnLi91dGlscy9QdWJTdWInXG5Ccm93c2VyRGV0ZWN0ICAgICA9IHJlcXVpcmUgJy4vdXRpbHMvQnJvd3NlckRldGVjdCdcbkxhbmRpbmdWaWV3ICAgICAgID0gcmVxdWlyZSAnLi92aWV3cy9sYW5kaW5nL0xhbmRpbmdWaWV3LmNvZmZlZSdcbkNyZWF0ZVZpZXcgICAgICAgID0gcmVxdWlyZSAnLi92aWV3cy9jcmVhdGUvQ3JlYXRlVmlldy5jb2ZmZWUnXG5TaGFyZVZpZXcgICAgICAgICA9IHJlcXVpcmUgJy4vdmlld3Mvc2hhcmUvU2hhcmVWaWV3LmNvZmZlZSdcblZpc3VhbGl6ZXJWaWV3ICAgID0gcmVxdWlyZSAnLi92aWV3cy92aXN1YWxpemVyL1Zpc3VhbGl6ZXJWaWV3LmNvZmZlZSdcbk5vdFN1cHBvcnRlZFZpZXcgID0gcmVxdWlyZSAnLi92aWV3cy9ub3Qtc3VwcG9ydGVkL05vdFN1cHBvcnRlZFZpZXcuY29mZmVlJ1xuVmlldyAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3N1cGVycy9WaWV3LmNvZmZlZSdcbm9ic2VydmVEb20gICAgICAgID0gcmVxdWlyZSAnLi91dGlscy9vYnNlcnZlRG9tJ1xubWFpblRlbXBsYXRlICAgICAgPSByZXF1aXJlICcuL3ZpZXdzL3RlbXBsYXRlcy9tYWluLXRlbXBsYXRlLmhicydcblxuY2xhc3MgQXBwQ29udHJvbGxlciBleHRlbmRzIFZpZXdcblxuICBpZDogJ3dyYXBwZXInXG5cbiAgIyBDaGVja3MgaWYgdmlzdWFsaXphdGlvbiBpcyByZW5kZXJlZC4gIFVzZWZ1bCB3aGVuIGFycml2aW5nIHRvIHBhZ2UgYmVmb3JlXG4gICMgc3RhcnRpbmcgaW5pdGlhbGx5LCBvciBhcnJpdmluZyBvbiBhIFNoYXJlXG4gICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgdmlzdWFsaXphdGlvblJlbmRlcmVkOiBmYWxzZVxuXG4gICMgVGhlIG51bWJlciBvZiBhdHRlbXB0cyBpdCB3aWxsIG1ha2UgdG8gc2F2ZSB0aGUgdHJhY2sgdG8gUGFyc2VcbiAgIyB3aXRob3V0IHRpbWluZyBvdXQuICBNYXggaXMgM1xuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgcGFyc2VFcnJvckF0dGVtcHRzOiAwXG5cblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG5cbiAgICBAJGJvZHkgPSAkICdib2R5J1xuICAgIEAkd2luZG93ID0gJCAnd2luZG93J1xuXG4gICAgQGJyZWFrcG9pbnRNYW5hZ2VyID0gbmV3IEJyZWFrcG9pbnRNYW5hZ2VyXG4gICAgICBicmVha3BvaW50czogQXBwQ29uZmlnLkJSRUFLUE9JTlRTXG4gICAgICBzY29wZTogQFxuXG4gICAgIyBTaGFyZWQgdHJhY2sgbW9kZWwgaXMgdXNlZCBmb3Igc2F2aW5nIHRvIFBhcnNlLFxuICAgICMgb3IgcHJlcG9wdWxhdGluZyBmb3IgUHJlc2V0c1xuXG4gICAgQHNoYXJlZFRyYWNrTW9kZWwgPSBuZXcgU2hhcmVkVHJhY2tNb2RlbFxuXG4gICAgQGxhbmRpbmdWaWV3ID0gbmV3IExhbmRpbmdWaWV3XG4gICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICBAY3JlYXRlVmlldyA9IG5ldyBDcmVhdGVWaWV3XG4gICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICBzaGFyZWRUcmFja01vZGVsOiBAc2hhcmVkVHJhY2tNb2RlbFxuICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgIEBzaGFyZVZpZXcgPSBuZXcgU2hhcmVWaWV3XG4gICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICBzaGFyZWRUcmFja01vZGVsOiBAc2hhcmVkVHJhY2tNb2RlbFxuICAgICAga2l0Q29sbGVjdGlvbjogQGtpdENvbGxlY3Rpb25cblxuICAgIEBub3RTdXBwb3J0ZWRWaWV3ID0gbmV3IE5vdFN1cHBvcnRlZFZpZXdcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgIEBhcHBSb3V0ZXIgPSBuZXcgQXBwUm91dGVyXG4gICAgICBhcHBDb250cm9sbGVyOiBAXG4gICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICBAaXNNb2JpbGUgPSBAJGJvZHkuaGFzQ2xhc3MgJ21vYmlsZSdcbiAgICBAaXNUYWJsZXQgPSBpZiBCcm93c2VyRGV0ZWN0LmRldmljZURldGVjdGlvbigpLmRldmljZVR5cGUgaXMgJ3RhYmxldCcgdGhlbiB0cnVlIGVsc2UgZmFsc2VcblxuICAgIHVubGVzcyBAaXNNb2JpbGVcbiAgICAgIEB2aXN1YWxpemVyVmlldyA9IG5ldyBWaXN1YWxpemVyVmlld1xuICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAjIFRPRE86IEhvb2sgdXAgYnJvd3NlciBkZXRlY3Rpb25cbiAgICBAbm90U3VwcG9ydGVkID0gZmFsc2VcblxuICAgIGlmIEBpc01vYmlsZSBhbmQgQG5vdFN1cHBvcnRlZFxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnbm90LXN1cHBvcnRlZCdcblxuICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cblxuICAjIFJlbmRlcnMgdGhlIEFwcENvbnRyb2xsZXIgdG8gdGhlIERPTSBhbmQga2lja3NcbiAgIyBvZmYgYmFja2JvbmVzIGhpc3RvcnlcblxuICByZW5kZXI6IC0+XG4gICAgQCRib2R5LmFwcGVuZCBAJGVsLmh0bWwgbWFpblRlbXBsYXRlXG4gICAgICBpc0Rlc2t0b3A6IEAkYm9keS5oYXNDbGFzcyAnZGVza3RvcCdcblxuICAgIEAkbWFpbkNvbnRhaW5lciA9IEAkZWwuZmluZCAnI2NvbnRhaW5lci1tYWluJ1xuICAgIEAkdG9wQ29udGFpbmVyID0gQCRlbC5maW5kICcjY29udGFpbmVyLXRvcCdcbiAgICBAJGJvdHRvbUNvbnRhaW5lciA9IEAkZWwuZmluZCAnI2NvbnRhaW5lci1ib3R0b20nXG5cbiAgICBUd2VlbkxpdGUuc2V0IEAkYm90dG9tQ29udGFpbmVyLCB5OiAzMDBcblxuICAgIHVubGVzcyBAaXNNb2JpbGVcbiAgICAgIEAkbWFpbkNvbnRhaW5lci5oaWRlKClcblxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoXG5cbiAgICAgIGlmIGhhc2guaW5kZXhPZignc2hhcmUnKSBpcyAtMSBvciBoYXNoLmluZGV4T2YoJ25vdC1zdXBwb3J0ZWQnKSBpcyAtMVxuICAgICAgICBUd2VlbkxpdGUuc2V0ICQoJy50b3AtYmFyJyksIGF1dG9BbHBoYTogMFxuICAgICAgICBUd2VlbkxpdGUuc2V0IEAkbWFpbkNvbnRhaW5lciwgeTogKHdpbmRvdy5pbm5lckhlaWdodCAqIC41IC0gQCRtYWluQ29udGFpbmVyLmhlaWdodCgpICogLjUpIC0gMjVcblxuICAgIEJhY2tib25lLmhpc3Rvcnkuc3RhcnRcbiAgICAgIHB1c2hTdGF0ZTogZmFsc2VcblxuICAgIEBcblxuXG4gICMgUmVuZGVycyB0aGUgdmlzdWFsaXphdGlvbiBpZiBvbiBkZXNrdG9wXG5cbiAgcmVuZGVyVmlzdWFsaXphdGlvbkxheWVyOiAtPlxuICAgIGlmIEBhcHBNb2RlbC5nZXQoJ2lzTW9iaWxlJykgdGhlbiByZXR1cm5cblxuICAgIGlmIEB2aXN1YWxpemF0aW9uUmVuZGVyZWQgaXMgZmFsc2VcbiAgICAgIEB2aXN1YWxpemF0aW9uUmVuZGVyZWQgPSB0cnVlXG4gICAgICBAJG1haW5Db250YWluZXIucHJlcGVuZCBAdmlzdWFsaXplclZpZXcucmVuZGVyKCkuZWxcblxuXG4gICMgRGVzdHJveXMgYWxsIGN1cnJlbnQgYW5kIHByZS1yZW5kZXJlZCB2aWV3cyBhbmRcbiAgIyB1bmRlbGVnYXRlcyBldmVudCBsaXN0ZW5lcnNcblxuICByZW1vdmU6IC0+XG4gICAgQGxhbmRpbmdWaWV3Py5yZW1vdmUoKVxuICAgIEBzaGFyZVZpZXc/LnJlbW92ZSgpXG4gICAgQGNyZWF0ZVZpZXc/LnJlbW92ZSgpXG4gICAgQG5vdFN1cHBvcnRlZFZpZXc/LnJlbW92ZSgpXG5cbiAgICBzdXBlcigpXG5cblxuICAjIEFkZHMgQXBwQ29udHJvbGxlci1yZWxhdGVkIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVnaW5zXG4gICMgbGlzdGVuaW5nIHRvIHZpZXcgY2hhbmdlc1xuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9WSUVXLCBAb25WaWV3Q2hhbmdlXG4gICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0lTTU9CSUxFLCBAb25Jc01vYmlsZUNoYW5nZVxuXG4gICAgQGxpc3RlblRvIEBjcmVhdGVWaWV3LCBBcHBFdmVudC5PUEVOX1NIQVJFLCBAb25PcGVuU2hhcmVcbiAgICBAbGlzdGVuVG8gQGNyZWF0ZVZpZXcsIEFwcEV2ZW50LkNMT1NFX1NIQVJFLCBAb25DbG9zZVNoYXJlXG4gICAgQGxpc3RlblRvIEBjcmVhdGVWaWV3LCBBcHBFdmVudC5TQVZFX1RSQUNLLCBAb25TYXZlVHJhY2tcbiAgICBAbGlzdGVuVG8gQGNyZWF0ZVZpZXcsIFB1YkV2ZW50LkJFQVQsIEBvbkJlYXRcbiAgICBAbGlzdGVuVG8gQHNoYXJlVmlldywgUHViRXZlbnQuQkVBVCwgQG9uQmVhdFxuXG4gICAgQGxpc3RlblRvIEAsIEFwcEV2ZW50LkJSRUFLUE9JTlRfTUFUQ0gsIEBvbkJyZWFrcG9pbnRNYXRjaFxuXG4gICAgVmlzaWJpbGl0eS5jaGFuZ2UgQG9uVmlzaWJpbGl0eUNoYW5nZVxuXG4gICAgIyBDaGVjayBpZiBhIHVzZXIgaXMgYWRkaW5nIGl0ZW1zIHRvIHRoZSBDb2tlIHBsYXlsaXN0XG4gICAgdW5sZXNzIEBpc01vYmlsZVxuICAgICAgXy5kZWxheSA9PlxuICAgICAgICBvYnNlcnZlRG9tICQoJy5wbGl0ZW1zJylbMF0sID0+XG4gICAgICAgICAgVHdlZW5MaXRlLnRvIEAkYm90dG9tQ29udGFpbmVyLCAuNixcbiAgICAgICAgICAgIHk6IEBjcmVhdGVWaWV3LnJldHVybk1vdmVBbW91bnQoKVxuICAgICAgICAgICAgZWFzZTogRXhwby5lYXNlSW5PdXRcbiAgICAgICwgNTAwXG5cbiAgICAjIFJlc2l6ZSBsaXN0ZW4gZm9yIHJvdGF0aW9uIGFuZCByZXNwb25zXG4gICAgaWYgQXBwQ29uZmlnLkVOQUJMRV9ST1RBVElPTl9MT0NLXG4gICAgICAkKHdpbmRvdykub24gJ3Jlc2l6ZScsIEBvblJlc2l6ZVxuXG5cbiAgIyBSZW1vdmUgbGlzdGVuZXJzIGFuZCBjYWxsIHN1cGVyY2xhc3NcblxuICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICAkKHdpbmRvdykub2ZmICdyZXNpemUnLCBAb25SZXNpemVcbiAgICBzdXBlcigpXG5cblxuICAjIERlc2t0b3AuICBFeHBhbmQgdGhlIHZpc3VhbGl6YXRpb24gb24gU2hhcmVNb2RhbCBvcGVuXG5cbiAgZXhwYW5kVmlzdWFsaXphdGlvbjogLT5cbiAgICB1bmxlc3MgQGlzTW9iaWxlXG4gICAgICBpZiBAYXBwTW9kZWwuZ2V0KCd2aWV3JykgaW5zdGFuY2VvZiBDcmVhdGVWaWV3XG4gICAgICAgIEBjcmVhdGVWaWV3LmhpZGVVSSgpXG5cbiAgICAgIEB2aXN1YWxpemVyVmlldy5zY2FsZVVwKClcblxuXG4gICMgRGVza3RvcC4gIENvbnRyYWN0IHRoZSB2aXN1YWxpemF0aW9uIG9uIFNoYXJlTW9kYWwgY2xvc2VcblxuICBjb250cmFjdFZpc3VhbGl6YXRpb246IC0+XG4gICAgdW5sZXNzIEBpc01vYmlsZVxuICAgICAgaWYgQGFwcE1vZGVsLmdldCgndmlldycpIGluc3RhbmNlb2YgQ3JlYXRlVmlld1xuICAgICAgICBAY3JlYXRlVmlldy5zaG93VUkoKVxuXG4gICAgICBAdmlzdWFsaXplclZpZXcuc2NhbGVEb3duKClcblxuXG4gICMgSGFuZGxlciBmb3IgUHViU3ViIEVYUE9SVF9UUkFDSyBldmVudHMuICBQcmVwYXJlcyB0aGUgZGF0YSBpbiBhIHdheSB0aGF0XG4gICMgaXMgc2F2YWJsZSwgZXhwb3J0YWJsZSwgYW5kIGltcG9ydGFibGVcbiAgIyBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuXG4gIGV4cG9ydFRyYWNrQW5kU2F2ZVRvUGFyc2U6ID0+XG4gICAgcGF0dGVyblNxdWFyZUdyb3VwcyA9IFtdXG4gICAgcGF0dGVyblNxdWFyZXMgPSBbXVxuXG4gICAgaW5zdHJ1bWVudHMgPSBAYXBwTW9kZWwuZXhwb3J0KCkua2l0TW9kZWwuaW5zdHJ1bWVudHNcbiAgICBraXQgPSBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpLnRvSlNPTigpXG5cbiAgICAjIEl0ZXJhdGUgb3ZlciBlYWNoIGluc3RydW1lbnQgYW5kIGNsZWFuIHZhbHVlcyB0aGF0IGFyZSB1bm5lZWRlZFxuICAgIGluc3RydW1lbnRzID0gaW5zdHJ1bWVudHMubWFwIChpbnN0cnVtZW50KSA9PlxuICAgICAgaW5zdHJ1bWVudC5wYXR0ZXJuU3F1YXJlcy5mb3JFYWNoIChwYXR0ZXJuU3F1YXJlKSA9PlxuICAgICAgICBkZWxldGUgcGF0dGVyblNxdWFyZS5pbnN0cnVtZW50XG4gICAgICAgIHBhdHRlcm5TcXVhcmVzLnB1c2ggcGF0dGVyblNxdWFyZVxuXG4gICAgICBpbnN0cnVtZW50XG5cbiAgICAjIEJyZWFrIHRoZSBwYXR0ZXJuU3F1YXJlcyBpbnRvIGdyb3VwcyBvZiB0cmFja3NcbiAgICB3aGlsZSAocGF0dGVyblNxdWFyZXMubGVuZ3RoID4gMClcbiAgICAgIHBhdHRlcm5TcXVhcmVHcm91cHMucHVzaCBwYXR0ZXJuU3F1YXJlcy5zcGxpY2UoMCwgOClcblxuICAgICMgU3RvcmUgcmVzdWx0c1xuICAgIEBraXRUeXBlID0gQGFwcE1vZGVsLmdldCgna2l0TW9kZWwnKS5nZXQoJ2xhYmVsJylcbiAgICBAaW5zdHJ1bWVudHMgPSBpbnN0cnVtZW50c1xuICAgIEBwYXR0ZXJuU3F1YXJlR3JvdXBzID0gcGF0dGVyblNxdWFyZUdyb3Vwc1xuXG4gICAgIyBTYXZlIHRyYWNrXG4gICAgQHNhdmVUcmFjaygpXG5cblxuICAjIENyZWF0ZSBhIG5ldyBQYXJzZSBtb2RlbCBhbmQgcGFzcyBpbiBwYXJhbXMgdGhhdCBoYXZlIGJlZW5cbiAgIyByZXRyaWV2ZWQsIHZpYSBQdWJTdWIgZnJvbSB0aGUgQ3JlYXRlVmlld1xuXG4gIHNhdmVUcmFjazogPT5cbiAgICBAc2hhcmVkVHJhY2tNb2RlbC5zZXRcbiAgICAgIGJwbTogQGFwcE1vZGVsLmdldCAnYnBtJ1xuICAgICAgaW5zdHJ1bWVudHM6IEBpbnN0cnVtZW50c1xuICAgICAga2l0VHlwZTogQGtpdFR5cGVcbiAgICAgIHBhdHRlcm5TcXVhcmVHcm91cHM6IEBwYXR0ZXJuU3F1YXJlR3JvdXBzXG4gICAgICB2aXN1YWxpemF0aW9uOiBAYXBwTW9kZWwuZ2V0ICd2aXN1YWxpemF0aW9uJ1xuXG4gICAgIyBTZW5kIHRoZSBQYXJzZSBtb2RlbCB1cCB0aGUgd2lyZSBhbmQgc2F2ZSB0byBEQlxuICAgIEBzaGFyZWRUcmFja01vZGVsLnNhdmVcbiAgICAgIGVycm9yOiAob2JqZWN0LCBlcnJvcikgPT5cbiAgICAgICAgY29uc29sZS5sb2cgJ2Vycm9yIGhlcmUhJ1xuICAgICAgICBjb25zb2xlLmVycm9yIG9iamVjdCwgZXJyb3JcblxuICAgICAgICBpZiBAcGFyc2VFcnJvckF0dGVtcHRzIDwgM1xuICAgICAgICAgIEBwYXJzZUVycm9yQXR0ZW1wdHMrK1xuXG4gICAgICAgICAgQHNhdmVUcmFjaygpXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ3NoYXJlSWQnLCAnZXJyb3InXG5cbiAgICAgICMgSGFuZGxlciBmb3Igc3VjY2VzcyBldmVudHMuICBDcmVhdGUgYSBuZXdcbiAgICAgICMgdmlzdWFsIHN1Y2Nlc3MgbWVzc2FnZSBhbmQgcGFzcyB1c2VyIG9uIHRvXG4gICAgICAjIHRoZWlyIHBhZ2VcblxuICAgICAgc3VjY2VzczogKG1vZGVsKSA9PlxuICAgICAgICBjb25zb2xlLmxvZyBtb2RlbC5pZFxuICAgICAgICBAYXBwTW9kZWwuc2V0ICdzaGFyZUlkJywgbW9kZWwuaWRcblxuXG4gICMgRXZlbnQgaGFuZGxlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLVxuXG4gIG9uUmVzaXplOiAoZXZlbnQpID0+XG4gICAgaWYgQGlzTW9iaWxlIG9yIEBpc1RhYmxldFxuICAgICAgJGRldmljZU9yaWVudGF0aW9uID0gJCgnLmRldmljZS1vcmllbnRhdGlvbicpXG5cbiAgICAgICMgUmVzZXQgcG9zaXRpb25cbiAgICAgIFR3ZWVuTGl0ZS50byAkKCdib2R5JyksIDAsXG4gICAgICAgIHNjcm9sbFRvcDogMFxuICAgICAgICBzY3JvbGxMZWZ0OiAwXG5cbiAgICAgICMgVXNlciBpcyBpbiBQb3J0cmFpdFxuICAgICAgaWYgd2luZG93LmlubmVySGVpZ2h0ID4gd2luZG93LmlubmVyV2lkdGhcbiAgICAgICAgVHdlZW5MaXRlLnNldCAkKCcjd3JhcHBlcicpLCBhdXRvQWxwaGE6IDBcblxuICAgICAgICBUd2VlbkxpdGUuZnJvbVRvICRkZXZpY2VPcmllbnRhdGlvbiwgLjIsIGF1dG9BbHBoYTogMCxcbiAgICAgICAgICBhdXRvQWxwaGE6IDFcbiAgICAgICAgICBkZWxheTogMFxuXG4gICAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gJGRldmljZU9yaWVudGF0aW9uLmZpbmQoJ2ltZycpLCAuMywgc2NhbGU6IDAsXG4gICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICBhdXRvQWxwaGE6IDFcbiAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcbiAgICAgICAgICBkZWxheTogLjZcblxuICAgICAgICAkZGV2aWNlT3JpZW50YXRpb24uc2hvdygpXG5cbiAgICAgICMgVXNlciBpcyBpbiBsYW5kc2NhcGUgLS0gYWxsIGdvb2RcbiAgICAgIGVsc2VcbiAgICAgICAgVHdlZW5MaXRlLnRvICRkZXZpY2VPcmllbnRhdGlvbi5maW5kKCdpbWcnKSwgLjMsXG4gICAgICAgICAgc2NhbGU6IDBcbiAgICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VJblxuICAgICAgICAgIGRlbGF5OiAuM1xuXG4gICAgICAgIFR3ZWVuTGl0ZS50byAkZGV2aWNlT3JpZW50YXRpb24sIC4yLFxuICAgICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICAgIGRlbGF5OiAuNlxuXG4gICAgICAgICAgb25Db21wbGV0ZTogPT5cblxuICAgICAgICAgICAgIyBGYWRlIHRoZSBpbnRlcmZhY2UgYmFjayBpblxuICAgICAgICAgICAgVHdlZW5MaXRlLnRvICQoJyN3cmFwcGVyJyksIC40LCBhdXRvQWxwaGE6IDEsIGRlbGF5OiAuM1xuICAgICAgICAgICAgJGRldmljZU9yaWVudGF0aW9uLmhpZGUoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBzb3VuZCBiZWF0cy4gIFBhc3MgaXQgb24gdG8gdGhlIHZpc3VhbGl6YXRpb24gbGF5ZXIgYW5kIHRyaWdnZXJcbiAgIyBhbmltYXRpb24uICBQYXNzZWQgZG93biBmcm9tIFBhdHRlcm5TcXVhcmVWaWV3XG4gICMgQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xuXG4gIG9uQmVhdDogKHBhcmFtcykgLT5cbiAgICBAdmlzdWFsaXplclZpZXcub25CZWF0IHBhcmFtc1xuXG5cbiAgIyBIYW5kbGVyIGZvciBwYWdlIHZpc2liaWxpdHkgY2hhbmdlcywgd2hlbiBvcGVuaW5nIG5ldyB0YWIgLyBtaW5pbWl6aW5nIHdpbmRvd1xuICAjIFBhdXNlcyB0aGUgYXVkaW8gYW5kIHdhaXRzIGZvciB0aGUgdXNlciB0byByZXR1cm5cbiAgIyBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAjIEBwYXJhbSB7U3RyaW5nfSBzdGF0ZSAtIGVpdGhlciAndmlzaWJsZScgb3IgJ2hpZGRlbidcblxuICBvblZpc2liaWxpdHlDaGFuZ2U6IChldmVudCwgc3RhdGUpID0+XG4gICAgaWYgc3RhdGUgaXMgJ3Zpc2libGUnXG4gICAgICBpZiBAYXBwTW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy5wbGF5aW5nIGlzIHRydWVcbiAgICAgICAgQGFwcE1vZGVsLnNldCAncGxheWluZycsIHRydWVcbiAgICBlbHNlXG4gICAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgZmFsc2VcblxuXG4gICMgSGFuZGxlciBmb3Igc2hvd2luZyAvIGhpZGluZyAvIGRpc3Bvc2luZyBvZiBwcmltYXJ5IHZpZXdzXG4gICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICBvblZpZXdDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICBwcmV2aW91c1ZpZXcgPSBtb2RlbC5fcHJldmlvdXNBdHRyaWJ1dGVzLnZpZXdcbiAgICBjdXJyZW50VmlldyA9IG1vZGVsLmNoYW5nZWQudmlld1xuXG4gICAgcHJldmlvdXNWaWV3Py5oaWRlXG4gICAgICByZW1vdmU6IHRydWVcblxuICAgICRjb250YWluZXIgPSBAJGVsXG5cbiAgICBpZiBjdXJyZW50VmlldyBpbnN0YW5jZW9mIENyZWF0ZVZpZXdcbiAgICAgIEByZW5kZXJWaXN1YWxpemF0aW9uTGF5ZXIoKVxuICAgICAgQHZpc3VhbGl6ZXJWaWV3Py5yZXNldFBvc2l0aW9uKClcblxuICAgICAgaWYgQGlzTW9iaWxlXG4gICAgICAgICRjb250YWluZXIgPSBAJG1haW5Db250YWluZXJcbiAgICAgIGVsc2VcbiAgICAgICAgJGNvbnRhaW5lciA9IEAkYm90dG9tQ29udGFpbmVyXG5cbiAgICBpZiBjdXJyZW50VmlldyBpbnN0YW5jZW9mIFNoYXJlVmlld1xuICAgICAgaWYgQGlzTW9iaWxlXG4gICAgICAgICQoJyNsb2dvJykucmVtb3ZlQ2xhc3MoJ2xvZ28nKS5hZGRDbGFzcygnbG9nby13aGl0ZScpXG4gICAgICAgIFR3ZWVuTGl0ZS50byAkKCcjd3JhcHBlcicpLCAuMyxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjRTQxRTJCJ1xuXG4gICAgICAjIE9ubHkgcmVuZGVyIHZpc3VhbGl6YXRpb24gb24gZGVza3RvcFxuICAgICAgZWxzZVxuICAgICAgICBAcmVuZGVyVmlzdWFsaXphdGlvbkxheWVyKClcblxuICAgICAgXy5kZWZlciA9PlxuICAgICAgICBAdmlzdWFsaXplclZpZXc/LnNldFNoYXJlVmlld1Bvc2l0aW9uKClcblxuICAgIGVsc2VcbiAgICAgIGlmIEBpc01vYmlsZVxuICAgICAgICAkKCcjbG9nbycpLnJlbW92ZUNsYXNzKCdsb2dvLXdoaXRlJykuYWRkQ2xhc3MoJ2xvZ28nKVxuICAgICAgICBUd2VlbkxpdGUudG8gJCgnI3dyYXBwZXInKSwgLjMsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnXG5cbiAgICAkY29udGFpbmVyLmFwcGVuZCBjdXJyZW50Vmlldy5yZW5kZXIoKS5lbFxuXG4gICAgdW5sZXNzIGN1cnJlbnRWaWV3IGluc3RhbmNlb2YgU2hhcmVWaWV3XG4gICAgICBjdXJyZW50Vmlldy5zaG93KClcblxuXG4gICMgSGFuZGxlciBmb3IgbW9iaWxlIGJyZWFrcG9pbnQgY2hhbmdlcy4gIFVwZGF0ZXMgdGhlIGRvbSB3aXRoXG4gICMgYW4gaW5kaWNhdG9yLlxuICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsPVxuXG4gIG9uSXNNb2JpbGVDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICBpc01vYmlsZSA9IG1vZGVsLmNoYW5nZWQuaXNNb2JpbGVcblxuICAgIGlmIGlzTW9iaWxlXG4gICAgICBAJGJvZHkucmVtb3ZlQ2xhc3MoJ2Rlc2t0b3AnKS5hZGRDbGFzcyAnbW9iaWxlJ1xuXG4gICAgZWxzZVxuICAgICAgQCRib2R5LnJlbW92ZUNsYXNzKCdtb2JpbGUnKS5hZGRDbGFzcyAnZGVza3RvcCdcblxuXG4gICMgSGFuZGxlciBmb3IgYnJlYWtwb2ludCBtYXRjaCBldmVudHMuICBVcGRhdGVzIG1vZGVsIGFuZCB0cmlnZ2Vyc1xuICAjIHJlbG9hZHMgb24gdGhlIHJlZ2lzdGVyZWQgdmlld3Mgd2hpY2ggYXJlIGxpc3RlbmluZ1xuICAjIEBwYXJhbSB7U3RyaW5nfSBicmVha3BvaW50IEVpdGhlciBgbW9iaWxlYCBvciBgZGVza3RvcGBcblxuICBvbkJyZWFrcG9pbnRNYXRjaDogKGJyZWFrcG9pbnQpIC0+XG4gICAgQGFwcE1vZGVsLnNldCAnaXNNb2JpbGUnLCAoIGlmIGJyZWFrcG9pbnQgaXMgJ21vYmlsZScgdGhlbiB0cnVlIGVsc2UgZmFsc2UgKVxuXG4gICAgXy5kZWxheSAtPlxuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgLCAxMDBcblxuXG4gICMgSGFuZGxlciBmb3Igb3BlbmluZyB0aGUgc2hhcmUgbW9kYWwuICBQYXNzZWQgZG93biBmcm9tIENyZWF0ZVZpZXdcblxuICBvbk9wZW5TaGFyZTogPT5cbiAgICBAZXhwYW5kVmlzdWFsaXphdGlvbigpXG5cblxuICAjIEhhbmRsZXIgZm9yIGNsb3NpbmcgdGhlIHNoYXJlIG1vZGFsLiAgUGFzc2VkIGRvd24gZnJvbSBDcmVhdGVWaWV3XG5cbiAgb25DbG9zZVNoYXJlOiA9PlxuICAgIEBjb250cmFjdFZpc3VhbGl6YXRpb24oKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBQdWJTdWIgU0FWRV9UUkFDSyBldmVudHMuICBFeHBvcnRzIHRoZSB0cmFjaywgY2FsbHMgYSBwdWJzdWIgdG8gdGhlXG4gICMgZXhwb3J0IGZ1bmN0aW9uLCB0aGVuIHByZXBhcmVzIGl0IGZvciBpbXBvcnRcbiAgIyBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuXG4gIG9uU2F2ZVRyYWNrOiAocGFyYW1zKSA9PlxuICAgIHtAc2hhcmVkVHJhY2tNb2RlbH0gPSBwYXJhbXNcblxuICAgIEBleHBvcnRUcmFja0FuZFNhdmVUb1BhcnNlKClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcENvbnRyb2xsZXJcbiIsIiMjIypcbiAgQXBwbGljYXRpb24td2lkZSBnZW5lcmFsICBjb25maWd1cmF0aW9uc1xuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE5LjE0XG4jIyNcblxuQXBwQ29uZmlnID1cblxuICAjIFRoZSBwYXRoIHRvIGFwcGxpY2F0aW9uIGFzc2V0c1xuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgQVNTRVRTOlxuICAgIHBhdGg6ICdhc3NldHMnXG4gICAgYXVkaW86ICdhdWRpbydcbiAgICBkYXRhOiAnZGF0YSdcbiAgICBpbWFnZXM6ICdpbWFnZXMnXG5cbiAgIyBUaGUgQlBNIHRlbXBvXG4gICMgQHR5cGUge051bWJlcn1cblxuICBCUE06IDEyMFxuXG4gICMgVGhlIG1heCBCUE1cbiAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gIEJQTV9NQVg6IDEwMDBcblxuICAjIEJyZWFrcG9pbnQgZGVmaW5pdGlvbiBmb3IgZW5xdWlyZVxuICAjIGFuZCBCcmVha3BvaW50TWFuYWdlciBjbGFzc1xuXG4gIEJSRUFLUE9JTlRTOlxuICAgIG1vYmlsZTpcbiAgICAgIG1pbjogbnVsbFxuICAgICAgbWF4OiA2MDBcblxuICAgIGRlc2t0b3A6XG4gICAgICBtaW46IDYwMVxuICAgICAgbWF4OiBudWxsXG5cbiAgIyBGb3IgZGVidWdnaW5nIHJlc3BvbnNpdmUgaXNzdWVzIG9uIGRlc2t0b3BcbiAgIyBAdHlwZSB7Qm9vbGVhbn1cblxuICBFTkFCTEVfUk9UQVRJT05fTE9DSzogdHJ1ZVxuXG4gICMgVGhlIG1heCB2YXJpZW50IG9uIGVhY2ggcGF0dGVybiBzcXVhcmUgKG9mZiwgbG93LCBtZWRpdW0sIGhpZ2gpXG4gICMgQHR5cGUge051bWJlcn1cblxuICBWRUxPQ0lUWV9NQVg6IDNcblxuICAjIFZvbHVtZSBsZXZlbHMgZm9yIHBhdHRlcm4gcGxheWJhY2sgYXMgd2VsbCBhcyBmb3Igb3ZlcmFsbCB0cmFja3NcbiAgIyBAdHlwZSB7T2JqZWN0fVxuXG4gIFZPTFVNRV9MRVZFTFM6XG4gICAgbG93OiAuMlxuICAgIG1lZGl1bTogLjVcbiAgICBoaWdoOiAxXG5cbiAgIyBSZXR1cm5zIGEgbm9ybWFsaXplZCBhc3NldCBwYXRoIGZvciBhcHBsaWNhdGlvbiBhc3NldHNcbiAgIyBAcGFyYW0ge1N0cmluZ30gYXNzZXRUeXBlXG5cbiAgcmV0dXJuQXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgIHBhdGggPSBAQVNTRVRTLnBhdGggKyAnLycgKyBAQVNTRVRTW2Fzc2V0VHlwZV1cbiAgICBwYXRoXG5cbiAgIyBSZXR1cm5zIGEgbm9ybWFsaXplZCBhc3NldCBwYXRoIGZvciB0aGUgVEVTVCBlbnZpcm9ubWVudFxuICAjIEBwYXJhbSB7U3RyaW5nfSBhc3NldFR5cGVcblxuICByZXR1cm5UZXN0QXNzZXRQYXRoOiAoYXNzZXRUeXBlKSAtPlxuICAgIHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBAQVNTRVRTLnBhdGggKyAnLycgKyBAQVNTRVRTW2Fzc2V0VHlwZV1cbiAgICBwYXRoXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwQ29uZmlnXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFtcbiAge1xuICAgIHRyYWNrOiB7XCJicG1cIjoyMDQsXCJpbnN0cnVtZW50c1wiOlt7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC0wLWtpY2sxXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC0zXCIsXCJsYWJlbFwiOlwiS2ljayBEcnVtIDFcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjJ9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0hpcEhvcEtpdF9LaWNrSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAta2ljazJcIixcImlkXCI6XCJpbnN0cnVtZW50LTRcIixcImxhYmVsXCI6XCJLaWNrIERydW0gMlwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0Nvb2xfUm5CX0tpY2tfSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtaGloYXQtY2xvc2VkXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC01XCIsXCJsYWJlbFwiOlwiQ2xvc2VkIEhpSGF0XCIsXCJtdXRlXCI6ZmFsc2UsXCJwYXR0ZXJuU3F1YXJlc1wiOlt7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6M31dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvQ29vbF9SbkJfSGktSGF0X0Nsb3NlZF9IYXJkLm1wM1wiLFwidm9sdW1lXCI6bnVsbH0se1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtMC1oaWhhdC1vcGVuXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC02XCIsXCJsYWJlbFwiOlwiT3BlbiBIaUhhdFwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvQ29vbF9SbkJfSGktSGF0X09wZW5fU29mdC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtc25hcmVcIixcImlkXCI6XCJpbnN0cnVtZW50LTdcIixcImxhYmVsXCI6XCJTbmFyZVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0hpcEhvcEtpdF9TbmFyZUhhcmQubXAzXCIsXCJ2b2x1bWVcIjpudWxsfSx7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC0wLXZvaWNlXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC04XCIsXCJsYWJlbFwiOlwiVm9pY2VcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sXCJzcmNcIjpcIi9hc3NldHMvYXVkaW8vaGlwLWhvcC8wMDIxX3Byb3BzX2Nhbl9zb2RhX29wZW4gXzAxLTEubXAzXCIsXCJ2b2x1bWVcIjpudWxsfV0sXCJraXRUeXBlXCI6XCJIaXAtaG9wXCIsXCJwYXR0ZXJuU3F1YXJlR3JvdXBzXCI6W1t7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoyfV0sW3tcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjozfV0sW3tcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9XV0sXCJzaGFyZU5hbWVcIjpcIktldmluIEJsZWljaFwiLFwic2hhcmVUaXRsZVwiOlwiRmlsdGh5IDFcIixcInNoYXJlTWVzc2FnZVwiOlwiWWVhaFwiLFwidmlzdWFsaXphdGlvblwiOm51bGwsXCJvYmplY3RJZFwiOlwiZHVhZUdwNHpseFwiLFwiY3JlYXRlZEF0XCI6XCIyMDE0LTA0LTA3VDE2OjI4OjQ4LjU2NlpcIixcInVwZGF0ZWRBdFwiOlwiMjAxNC0wNC0wN1QxNjoyODo0OC41NjZaXCJ9XG4gIH0sXG4gIHtcbiAgICB0cmFjazoge1wiYnBtXCI6MTIwLFwiaW5zdHJ1bWVudHNcIjpbe1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtY29rZS1ib3R0bGVcIixcImlkXCI6XCJpbnN0cnVtZW50LTQyXCIsXCJsYWJlbFwiOlwiQ293YmVsbFwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2Nva2UvMDNfX19jb2tlX2Nvd2JlbGwub2dnXCIsXCJ2b2x1bWVcIjpudWxsfSx7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC1jb2tlLXR3aXN0XCIsXCJpZFwiOlwiaW5zdHJ1bWVudC00M1wiLFwibGFiZWxcIjpcIlR3aXN0XCIsXCJtdXRlXCI6ZmFsc2UsXCJwYXR0ZXJuU3F1YXJlc1wiOlt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2Nva2UvMDA2MTQ0Mjg1LWJvdHRsZS1iZWVyLW9wZW4tMDEub2dnXCIsXCJ2b2x1bWVcIjpudWxsfSx7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC1jb2tlLWNhblwiLFwiaWRcIjpcImluc3RydW1lbnQtNDRcIixcImxhYmVsXCI6XCJDYW4gb3BlbmluZ1wiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9jb2tlLzAyX19fMDAyMV9wcm9wc19jYW5fYmVlcl9vcGVuIF8wMS5vZ2dcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LWNva2Utdm9pY2UzXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC00NVwiLFwibGFiZWxcIjpcIlZvaWNlIDNcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9jb2tlL2ZlbWFsZV9haGhoXzAzLm9nZ1wiLFwidm9sdW1lXCI6bnVsbH0se1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtY29rZS12b2ljZTJcIixcImlkXCI6XCJpbnN0cnVtZW50LTQ2XCIsXCJsYWJlbFwiOlwiVm9pY2UgMlwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfV0sXCJzcmNcIjpcIi9hc3NldHMvYXVkaW8vY29rZS8wNF9fX21hbGVfYWhoaF8wMS5vZ2dcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LWNva2Utdm9pY2UxXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC00N1wiLFwibGFiZWxcIjpcIlZvaWNlIDFcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfV0sXCJzcmNcIjpcIi9hc3NldHMvYXVkaW8vY29rZS8wNV9fX2ZlbWFsZV9haGhoXzAxLm9nZ1wiLFwidm9sdW1lXCI6bnVsbH1dLFwia2l0VHlwZVwiOlwiQ09LRVwiLFwicGF0dGVyblNxdWFyZUdyb3Vwc1wiOltbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX1dLFt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFt7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX1dXSxcInNoYXJlTmFtZVwiOlwiYXNkZlwiLFwic2hhcmVUaXRsZVwiOlwiYXNkZlwiLFwic2hhcmVNZXNzYWdlXCI6XCJORUVEIFNIQVJFIE1FU1NBR0VcIixcInZpc3VhbGl6YXRpb25cIjpudWxsLFwib2JqZWN0SWRcIjpcInFSMG5zeElSSVBcIixcImNyZWF0ZWRBdFwiOlwiMjAxNC0wNC0xNVQxNzoyMzowNy42NTVaXCIsXCJ1cGRhdGVkQXRcIjpcIjIwMTQtMDQtMTVUMTc6MjM6MDcuNjU1WlwifVxuICB9LFxuICB7XG4gICAgdHJhY2s6IHtcImJwbVwiOjI2MCxcImluc3RydW1lbnRzXCI6W3tcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAta2ljazFcIixcImlkXCI6XCJpbnN0cnVtZW50LTNcIixcImxhYmVsXCI6XCJLaWNrIERydW0gMVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0hpcEhvcEtpdF9LaWNrSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAta2ljazJcIixcImlkXCI6XCJpbnN0cnVtZW50LTRcIixcImxhYmVsXCI6XCJLaWNrIERydW0gMlwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sXCJzcmNcIjpcIi9hc3NldHMvYXVkaW8vaGlwLWhvcC9Db29sX1JuQl9LaWNrX0hhcmQubXAzXCIsXCJ2b2x1bWVcIjpudWxsfSx7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC0wLWhpaGF0LWNsb3NlZFwiLFwiaWRcIjpcImluc3RydW1lbnQtNVwiLFwibGFiZWxcIjpcIkNsb3NlZCBIaUhhdFwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0Nvb2xfUm5CX0hpLUhhdF9DbG9zZWRfSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtaGloYXQtb3BlblwiLFwiaWRcIjpcImluc3RydW1lbnQtNlwiLFwibGFiZWxcIjpcIk9wZW4gSGlIYXRcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M30se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MixcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6M31dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvQ29vbF9SbkJfSGktSGF0X09wZW5fU29mdC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtc25hcmVcIixcImlkXCI6XCJpbnN0cnVtZW50LTdcIixcImxhYmVsXCI6XCJTbmFyZVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0hpcEhvcEtpdF9TbmFyZUhhcmQubXAzXCIsXCJ2b2x1bWVcIjpudWxsfSx7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC0wLXZvaWNlXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC04XCIsXCJsYWJlbFwiOlwiVm9pY2VcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wLzAwMjFfcHJvcHNfY2FuX3NvZGFfb3BlbiBfMDEtMS5tcDNcIixcInZvbHVtZVwiOm51bGx9XSxcImtpdFR5cGVcIjpcIkhpcC1ob3BcIixcInBhdHRlcm5TcXVhcmVHcm91cHNcIjpbW3tcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFt7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjoyLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjozfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dXSxcInNoYXJlTmFtZVwiOlwiTWF0dFwiLFwic2hhcmVUaXRsZVwiOlwiSGVseiBZZXNcIixcInNoYXJlTWVzc2FnZVwiOlwiSG9wZSB5b3UgbGlrZSBpdC5cIixcInZpc3VhbGl6YXRpb25cIjpudWxsLFwib2JqZWN0SWRcIjpcImZ4RFA4TUxxa0dcIixcImNyZWF0ZWRBdFwiOlwiMjAxNC0wNC0wM1QyMjo1NzoyOS42MDZaXCIsXCJ1cGRhdGVkQXRcIjpcIjIwMTQtMDQtMDNUMjI6NTc6MjkuNjA2WlwifVxuICB9LFxuICB7XG4gICAgdHJhY2s6IHtcImJwbVwiOjI1MCxcImluc3RydW1lbnRzXCI6W3tcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAta2ljazFcIixcImlkXCI6XCJpbnN0cnVtZW50LTNcIixcImxhYmVsXCI6XCJLaWNrIERydW0gMVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6dHJ1ZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvSGlwSG9wS2l0X0tpY2tIYXJkLm1wM1wiLFwidm9sdW1lXCI6bnVsbH0se1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtMC1raWNrMlwiLFwiaWRcIjpcImluc3RydW1lbnQtNFwiLFwibGFiZWxcIjpcIktpY2sgRHJ1bSAyXCIsXCJtdXRlXCI6ZmFsc2UsXCJwYXR0ZXJuU3F1YXJlc1wiOlt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvQ29vbF9SbkJfS2lja19IYXJkLm1wM1wiLFwidm9sdW1lXCI6bnVsbH0se1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtMC1oaWhhdC1jbG9zZWRcIixcImlkXCI6XCJpbnN0cnVtZW50LTVcIixcImxhYmVsXCI6XCJDbG9zZWQgSGlIYXRcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0Nvb2xfUm5CX0hpLUhhdF9DbG9zZWRfSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtaGloYXQtb3BlblwiLFwiaWRcIjpcImluc3RydW1lbnQtNlwiLFwibGFiZWxcIjpcIk9wZW4gSGlIYXRcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvQ29vbF9SbkJfSGktSGF0X09wZW5fU29mdC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtc25hcmVcIixcImlkXCI6XCJpbnN0cnVtZW50LTdcIixcImxhYmVsXCI6XCJTbmFyZVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MyxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvSGlwSG9wS2l0X1NuYXJlSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtdm9pY2VcIixcImlkXCI6XCJpbnN0cnVtZW50LThcIixcImxhYmVsXCI6XCJWb2ljZVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sXCJzcmNcIjpcIi9hc3NldHMvYXVkaW8vaGlwLWhvcC8wMDIxX3Byb3BzX2Nhbl9zb2RhX29wZW4gXzAxLTEubXAzXCIsXCJ2b2x1bWVcIjpudWxsfV0sXCJraXRUeXBlXCI6XCJIaXAtaG9wXCIsXCJwYXR0ZXJuU3F1YXJlR3JvdXBzXCI6W1t7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjp0cnVlLFwidmVsb2NpdHlcIjoyfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjozLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjMsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjB9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV1dLFwic2hhcmVOYW1lXCI6XCJIeXBzdGVyaWFcIixcInNoYXJlVGl0bGVcIjpcIllvdSB3aXNoIFwiLFwic2hhcmVNZXNzYWdlXCI6XCJ5b3Ugd2lzaCB5b3UgbWFkZSBpdFwiLFwidmlzdWFsaXphdGlvblwiOm51bGwsXCJvYmplY3RJZFwiOlwibmhHRFVhUTlyaVwiLFwiY3JlYXRlZEF0XCI6XCIyMDE0LTA0LTA1VDIxOjExOjQ3Ljc3NlpcIixcInVwZGF0ZWRBdFwiOlwiMjAxNC0wNC0wNVQyMToxMTo0Ny43NzZaXCJ9XG4gIH0sXG4gIHtcbiAgICB0cmFjazoge1wiYnBtXCI6MjUwLFwiaW5zdHJ1bWVudHNcIjpbe1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtMC1raWNrMVwiLFwiaWRcIjpcImluc3RydW1lbnQtM1wiLFwibGFiZWxcIjpcIktpY2sgRHJ1bSAxXCIsXCJtdXRlXCI6ZmFsc2UsXCJwYXR0ZXJuU3F1YXJlc1wiOlt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvSGlwSG9wS2l0X0tpY2tIYXJkLm1wM1wiLFwidm9sdW1lXCI6bnVsbH0se1wiYWN0aXZlXCI6bnVsbCxcImRyb3BwZWRcIjpmYWxzZSxcImRyb3BwZWRFdmVudFwiOm51bGwsXCJmb2N1c1wiOmZhbHNlLFwiaWNvblwiOlwiaWNvbi1raXQtMC1raWNrMlwiLFwiaWRcIjpcImluc3RydW1lbnQtNFwiLFwibGFiZWxcIjpcIktpY2sgRHJ1bSAyXCIsXCJtdXRlXCI6ZmFsc2UsXCJwYXR0ZXJuU3F1YXJlc1wiOlt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0Nvb2xfUm5CX0tpY2tfSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtaGloYXQtY2xvc2VkXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC01XCIsXCJsYWJlbFwiOlwiQ2xvc2VkIEhpSGF0XCIsXCJtdXRlXCI6ZmFsc2UsXCJwYXR0ZXJuU3F1YXJlc1wiOlt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MSxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6Mn0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0Nvb2xfUm5CX0hpLUhhdF9DbG9zZWRfSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtaGloYXQtb3BlblwiLFwiaWRcIjpcImluc3RydW1lbnQtNlwiLFwibGFiZWxcIjpcIk9wZW4gSGlIYXRcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjJ9XSxcInNyY1wiOlwiL2Fzc2V0cy9hdWRpby9oaXAtaG9wL0Nvb2xfUm5CX0hpLUhhdF9PcGVuX1NvZnQubXAzXCIsXCJ2b2x1bWVcIjpudWxsfSx7XCJhY3RpdmVcIjpudWxsLFwiZHJvcHBlZFwiOmZhbHNlLFwiZHJvcHBlZEV2ZW50XCI6bnVsbCxcImZvY3VzXCI6ZmFsc2UsXCJpY29uXCI6XCJpY29uLWtpdC0wLXNuYXJlXCIsXCJpZFwiOlwiaW5zdHJ1bWVudC03XCIsXCJsYWJlbFwiOlwiU25hcmVcIixcIm11dGVcIjpmYWxzZSxcInBhdHRlcm5TcXVhcmVzXCI6W3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFwic3JjXCI6XCIvYXNzZXRzL2F1ZGlvL2hpcC1ob3AvSGlwSG9wS2l0X1NuYXJlSGFyZC5tcDNcIixcInZvbHVtZVwiOm51bGx9LHtcImFjdGl2ZVwiOm51bGwsXCJkcm9wcGVkXCI6ZmFsc2UsXCJkcm9wcGVkRXZlbnRcIjpudWxsLFwiZm9jdXNcIjpmYWxzZSxcImljb25cIjpcImljb24ta2l0LTAtdm9pY2VcIixcImlkXCI6XCJpbnN0cnVtZW50LThcIixcImxhYmVsXCI6XCJWb2ljZVwiLFwibXV0ZVwiOmZhbHNlLFwicGF0dGVyblNxdWFyZXNcIjpbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfV0sXCJzcmNcIjpcIi9hc3NldHMvYXVkaW8vaGlwLWhvcC8wMDIxX3Byb3BzX2Nhbl9zb2RhX29wZW4gXzAxLTEubXAzXCIsXCJ2b2x1bWVcIjpudWxsfV0sXCJraXRUeXBlXCI6XCJIaXAtaG9wXCIsXCJwYXR0ZXJuU3F1YXJlR3JvdXBzXCI6W1t7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOmZhbHNlLFwidmVsb2NpdHlcIjoxfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjAsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjowLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH1dLFt7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjIsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjN9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjEsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoxLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6dHJ1ZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjEsXCJ0cmlnZ2VyXCI6ZmFsc2UsXCJ2ZWxvY2l0eVwiOjJ9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjoyLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MixcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjIsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjMsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjozLFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjF9LHtcImFjdGl2ZVwiOnRydWUsXCJvcmRlckluZGV4XCI6MyxcInByZXZpb3VzVmVsb2NpdHlcIjoxLFwidHJpZ2dlclwiOnRydWUsXCJ2ZWxvY2l0eVwiOjJ9XSxbe1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo0LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NCxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjQsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfV0sW3tcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjpmYWxzZSxcIm9yZGVySW5kZXhcIjo1LFwicHJldmlvdXNWZWxvY2l0eVwiOjAsXCJ0cmlnZ2VyXCI6bnVsbCxcInZlbG9jaXR5XCI6MH0se1wiYWN0aXZlXCI6ZmFsc2UsXCJvcmRlckluZGV4XCI6NSxcInByZXZpb3VzVmVsb2NpdHlcIjowLFwidHJpZ2dlclwiOm51bGwsXCJ2ZWxvY2l0eVwiOjB9LHtcImFjdGl2ZVwiOmZhbHNlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpudWxsLFwidmVsb2NpdHlcIjowfSx7XCJhY3RpdmVcIjp0cnVlLFwib3JkZXJJbmRleFwiOjUsXCJwcmV2aW91c1ZlbG9jaXR5XCI6MCxcInRyaWdnZXJcIjpmYWxzZSxcInZlbG9jaXR5XCI6MX1dXSxcInNoYXJlTmFtZVwiOlwiQ291cnRuZXlcIixcInNoYXJlVGl0bGVcIjpcIlNvIFNvIEZyZXNoXCIsXCJzaGFyZU1lc3NhZ2VcIjpcIkF3ZXNvbWUgd29yayBDaHJpcyAmIFdlcyFcIixcInZpc3VhbGl6YXRpb25cIjpudWxsLFwib2JqZWN0SWRcIjpcImh5Q0Rlb1pEb3hcIixcImNyZWF0ZWRBdFwiOlwiMjAxNC0wNC0wNFQwMDoxMzozNC41NjFaXCIsXCJ1cGRhdGVkQXRcIjpcIjIwMTQtMDQtMDRUMDA6MTM6MzQuNTYxWlwifVxuICB9XG5dIiwiIyMjKlxuICogQXBwbGljYXRpb24gcmVsYXRlZCBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCA9XG5cbiAgQlJFQUtQT0lOVF9NQVRDSCAgICAgIDogJ2JyZWFrcG9pbnQ6bWF0Y2gnXG4gIEJSRUFLUE9JTlRfVU5NQVRDSCAgICA6ICdicmVha3BvaW50OnVubWF0Y2gnXG5cbiAgQ0hBTkdFX0FDVElWRSAgICAgICAgIDogJ2NoYW5nZTphY3RpdmUnXG4gIENIQU5HRV9CUE0gICAgICAgICAgICA6ICdjaGFuZ2U6YnBtJ1xuICBDSEFOR0VfRFJBR0dJTkcgICAgICAgOiAnY2hhbmdlOmRyYWdnaW5nJ1xuICBDSEFOR0VfRFJPUFBFRCAgICAgICAgOiAnY2hhbmdlOmRyb3BwZWQnXG4gIENIQU5HRV9GT0NVUyAgICAgICAgICA6ICdjaGFuZ2U6Zm9jdXMnXG4gIENIQU5HRV9JTlNUUlVNRU5UICAgICA6ICdjaGFuZ2U6Y3VycmVudEluc3RydW1lbnQnXG4gIENIQU5HRV9JU01PQklMRSAgICAgICA6ICdjaGFuZ2U6aXNNb2JpbGUnXG4gIENIQU5HRV9LSVQgICAgICAgICAgICA6ICdjaGFuZ2U6a2l0TW9kZWwnXG4gIENIQU5HRV9NVVRFICAgICAgICAgICA6ICdjaGFuZ2U6bXV0ZSdcbiAgQ0hBTkdFX1BMQVlJTkcgICAgICAgIDogJ2NoYW5nZTpwbGF5aW5nJ1xuICBDSEFOR0VfU0hBUkVfSUQgICAgICAgOiAnY2hhbmdlOnNoYXJlSWQnXG4gIENIQU5HRV9TSE9XX1NFUVVFTkNFUiA6ICdjaGFuZ2U6c2hvd1NlcXVlbmNlcidcbiAgQ0hBTkdFX1NIT1dfUEFEICAgICAgIDogJ2NoYW5nZTpzaG93UGFkJ1xuICBDSEFOR0VfVFJJR0dFUiAgICAgICAgOiAnY2hhbmdlOnRyaWdnZXInXG4gIENIQU5HRV9WRUxPQ0lUWSAgICAgICA6ICdjaGFuZ2U6dmVsb2NpdHknXG4gIENIQU5HRV9WSUVXICAgICAgICAgICA6ICdjaGFuZ2U6dmlldydcblxuICBTQVZFX1RSQUNLICAgICAgICAgICAgOiAnb25TYXZlVHJhY2snXG5cbiAgT1BFTl9TSEFSRSAgICAgICAgICAgIDogJ29uT3BlblNoYXJlJ1xuICBDTE9TRV9TSEFSRSAgICAgICAgICAgOiAnb25DbG9zZVNoYXJlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcEV2ZW50XG4iLCIjIyMqXG4gKiBHbG9iYWwgUHViU3ViIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblB1YlN1YiA9XG5cbiAgQkVBVCAgICAgICAgIDogJ29uQmVhdCdcbiAgRVhQT1JUX1RSQUNLIDogJ29uRXhwb3J0VHJhY2snXG4gIElNUE9SVF9UUkFDSyA6ICdvbkltcG9ydFRyYWNrJ1xuICBST1VURSAgICAgICAgOiAnb25Sb3V0ZUNoYW5nZSdcbiAgU0FWRV9UUkFDSyAgIDogJ29uU2F2ZVRyYWNrJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFB1YlN1YlxuIiwiXG52YXIgZGlnaXRzID0gcmVxdWlyZSgnZGlnaXRzJyk7XG52YXIgaGFuZGxlYmFycyA9IHJlcXVpcmUoJ2hhbmRsZWlmeScpXG5cbmhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3JlcGVhdCcsIGZ1bmN0aW9uKG4sIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgX2RhdGEgPSB7fTtcbiAgICBpZiAob3B0aW9ucy5fZGF0YSkge1xuICAgICAgX2RhdGEgPSBoYW5kbGViYXJzLmNyZWF0ZUZyYW1lKG9wdGlvbnMuX2RhdGEpO1xuICAgIH1cblxuICAgIHZhciBjb250ZW50ID0gJyc7XG4gICAgdmFyIGNvdW50ID0gbiAtIDE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gY291bnQ7IGkrKykge1xuICAgICAgX2RhdGEgPSB7XG4gICAgICAgIGluZGV4OiBkaWdpdHMucGFkKChpICsgMSksIHthdXRvOiBufSlcbiAgICAgIH07XG4gICAgICBjb250ZW50ICs9IG9wdGlvbnMuZm4odGhpcywge2RhdGE6IF9kYXRhfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgaGFuZGxlYmFycy5TYWZlU3RyaW5nKGNvbnRlbnQpO1xuICB9KTsiLCIjIyMqXG4gKiBNUEMgQXBwbGljYXRpb24gYm9vdHN0cmFwcGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgICAgICA9IHJlcXVpcmUgJy4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBDb250cm9sbGVyICAgID0gcmVxdWlyZSAnLi9BcHBDb250cm9sbGVyLmNvZmZlZSdcbkFwcE1vZGVsICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9BcHBNb2RlbC5jb2ZmZWUnXG5Ccm93c2VyRGV0ZWN0ICAgID0gcmVxdWlyZSAnLi91dGlscy9Ccm93c2VyRGV0ZWN0J1xuS2l0Q29sbGVjdGlvbiAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2tpdHMvS2l0Q29sbGVjdGlvbi5jb2ZmZWUnXG5Ub3VjaCAgICAgICAgICAgID0gcmVxdWlyZSAnLi91dGlscy9Ub3VjaCdcbmF0dGFjaEZhc3RDbGljayAgPSByZXF1aXJlKCdmYXN0Y2xpY2snKTtcbmhlbHBlcnMgICAgICAgICAgPSByZXF1aXJlICcuL2hlbHBlcnMvaGFuZGxlYmFycy1oZWxwZXJzJ1xucm90YXRpb25UZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdmlld3MvdGVtcGxhdGVzL3JvdGF0aW9uLXRlbXBsYXRlLmhicydcblxuJCAtPlxuXG4gIHByZWxvYWRNYW5pZmVzdCA9IFtcbiAgICB7IGlkOiAndmVsb2NpdHktc29mdCcsIHNyYzogJ2Fzc2V0cy9pbWFnZXMvaWNvbi1iZWF0LXNvZnQuc3ZnJyB9LFxuICAgIHsgaWQ6ICd2ZWxvY2l0eS1tZWRpdW0nLCBzcmM6ICdhc3NldHMvaW1hZ2VzL2ljb24tYmVhdC1tZWRpdW0uc3ZnJ30sXG4gICAgeyBpZDogJ3ZlbG9jaXR5LWhhcmQnLCBzcmM6ICdhc3NldHMvaW1hZ2VzL2ljb24tYmVhdC1oYXJkLnN2Zyd9LFxuICAgIHsgaWQ6ICdib3R0bGUtbWFzaycsIHNyYzogJ2Fzc2V0cy9pbWFnZXMvYm90dGxlLW1hc2sucG5nJ30sXG4gICAgeyBpZDogJ3ZlbG9jaXR5LXNvZnQnLCBzcmM6ICdhc3NldHMvYXVkaW8vY29rZS8wNV9fX2ZlbWFsZV9haGhoXzAxLm1wMyd9XG4gIF1cblxuICBvblByZWxvYWRDb21wbGV0ZSA9ID0+XG4gICAgUGFyc2UuaW5pdGlhbGl6ZSggXCJmb29cIiwgXCJiYXJcIiApXG4gICAgVG91Y2gudHJhbnNsYXRlVG91Y2hFdmVudHMoKVxuICAgIFplcm9DbGlwYm9hcmQuY29uZmlnKHsgbW92aWVQYXRoOiAnYXNzZXRzL3N3Zi9aZXJvQ2xpcGJvYXJkLnN3ZicgfSlcblxuICAgIGF0dGFjaEZhc3RDbGljayBkb2N1bWVudC5ib2R5XG5cbiAgICAjIFByZXZlbnQgc2Nyb2xsaW5nIG9uIGlvcyBkZXZpY2VzXG4gICAgJChkb2N1bWVudCkub24gJ3RvdWNobW92ZScsIChldmVudCkgLT4gZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICRib2R5ID0gJCgnYm9keScpXG5cbiAgICAjIEJ1aWxkIG91dCB0aGUga2l0LWNvbGxlY3Rpb24sIHdoaWNoIGlzIHRoZSBiYXNpcyBmb3IgYWxsIG90aGVyIG1vZGVsc1xuICAgIGtpdENvbGxlY3Rpb24gPSBuZXcgS2l0Q29sbGVjdGlvblxuICAgICAgcGFyc2U6IHRydWVcblxuICAgIGtpdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgdXJsOiBBcHBDb25maWcucmV0dXJuQXNzZXRQYXRoKCdkYXRhJykgKyAnLycgKyAnc291bmQtZGF0YS5qc29uJ1xuXG4gICAgIyBDcmVhdGUgdGhlIHByaW1hcnkgYXBwbGljYXRpb24gbW9kZWwgd2hpY2ggaGFuZGxlcyBzdGF0ZVxuICAgIGFwcE1vZGVsID0gbmV3IEFwcE1vZGVsXG4gICAgICAna2l0TW9kZWwnOiBraXRDb2xsZWN0aW9uLmF0KDApXG5cbiAgICAjIENoZWNrIGN1cnJlbnQgbW9iaWxlIHN0YXR1c1xuICAgIGlmICQod2luZG93KS5pbm5lcldpZHRoKCkgPCBBcHBDb25maWcuQlJFQUtQT0lOVFMuZGVza3RvcC5taW5cbiAgICAgIGFwcE1vZGVsLnNldCAnaXNNb2JpbGUnLCB0cnVlXG4gICAgICAkYm9keS5hZGRDbGFzcyAnbW9iaWxlJ1xuICAgIGVsc2VcbiAgICAgICRib2R5LmFkZENsYXNzICdkZXNrdG9wJ1xuXG4gICAgJGJvZHkuYXBwZW5kIHJvdGF0aW9uVGVtcGxhdGUoKVxuXG4gICAgIyBUZWxsIHVzZXIgdG8gcm90YXRlXG4gICAgaWYgQXBwQ29uZmlnLkVOQUJMRV9ST1RBVElPTl9MT0NLXG4gICAgICBpZiB3aW5kb3cuaW5uZXJIZWlnaHQgPiB3aW5kb3cuaW5uZXJXaWR0aFxuICAgICAgICAkKCcuZGV2aWNlLW9yaWVudGF0aW9uJykuc2hvdygpXG5cblxuICAgICMgVG8gaW5pdGlhbGl6ZSBtb2JpbGUgcGxheWJhY2ssIGEgc291bmQgbXVzdCBiZSBsb2FkZWRcbiAgICAjIGFuZCB0cmlnZ2VyZWQgYnkgdXNlciBpbnRlcmFjdGlvbi5cbiAgICAjXG4gICAgIyBOT1RFOiAgU291bmQgbWFuaWZlc3QgaXMgcmVnaXN0ZXJlZCBpbiB0aGUgS2l0TW9kZWxcbiAgICAjIGR1cmluZyBkYXRhIHBhcnNlLlxuXG4gICAgc25kUGF0aCA9IHByZWxvYWRNYW5pZmVzdFtwcmVsb2FkTWFuaWZlc3QubGVuZ3RoLTFdLnNyY1xuICAgIGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQgc25kUGF0aCwgc25kUGF0aFxuICAgIGNyZWF0ZWpzLlNvdW5kLmFsdGVybmF0ZUV4dGVuc2lvbnMgPSBbJ21wMyddXG4gICAgY3JlYXRlanMuRmxhc2hQbHVnaW4uc3dmUGF0aCA9ICcvYXNzZXRzL3N3Zi8nXG4gICAgY3JlYXRlanMuSFRNTEF1ZGlvUGx1Z2luLmRlZmF1bHROdW1DaGFubmVscyA9IDMwXG5cbiAgICBpZiBCcm93c2VyRGV0ZWN0LmlzSUUoKVxuICAgICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJQbHVnaW5zKFtjcmVhdGVqcy5GbGFzaFBsdWdpbl0pXG4gICAgZWxzZVxuICAgICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJQbHVnaW5zKFtjcmVhdGVqcy5XZWJBdWRpb1BsdWdpbiwgY3JlYXRlanMuSFRNTEF1ZGlvUGx1Z2luXSlcblxuICAgICMgRml4IHZpZXdwb3J0IGlmIG9uIFRhYmxldFxuICAgIFR3ZWVuTGl0ZS50byAkKCdib2R5JyksIDAsXG4gICAgICBzY3JvbGxUb3A6IDBcbiAgICAgIHNjcm9sbExlZnQ6IDBcblxuICAgICMgS2ljayBvZmYgYXBwXG4gICAgYXBwQ29udHJvbGxlciA9IG5ldyBBcHBDb250cm9sbGVyXG4gICAgICBhcHBNb2RlbDogYXBwTW9kZWxcbiAgICAgIGtpdENvbGxlY3Rpb246IGtpdENvbGxlY3Rpb25cblxuICAgIGFwcENvbnRyb2xsZXIucmVuZGVyKClcblxuICAgICMgUmVkaXJlY3QgaWYgZGV2aWNlIGlzIG5vdCBzdXBwb3J0ZWRcbiAgICBpZiBhcHBNb2RlbC5nZXQgJ2lzTW9iaWxlJ1xuICAgICAgaWYgQnJvd3NlckRldGVjdC51bnN1cHBvcnRlZEFuZHJvaWREZXZpY2UoKVxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcjbm90LXN1cHBvcnRlZCdcblxuICAgICAgZGV2aWNlID0gQnJvd3NlckRldGVjdC5kZXZpY2VEZXRlY3Rpb24oKVxuXG5cbiAgIyBQcmVsb2FkIGFzc2V0c1xuICBxdWV1ZSA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUoKVxuICBxdWV1ZS5pbnN0YWxsUGx1Z2luKCBjcmVhdGVqcy5Tb3VuZCApXG4gIHF1ZXVlLm9uICdjb21wbGV0ZScsIG9uUHJlbG9hZENvbXBsZXRlXG4gIHF1ZXVlLmxvYWRNYW5pZmVzdCBwcmVsb2FkTWFuaWZlc3RcbiIsIiMjIypcbiAqIFByaW1hcnkgYXBwbGljYXRpb24gbW9kZWwgd2hpY2ggY29vcmRpbmF0ZXMgc3RhdGVcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbk1vZGVsICAgICA9IHJlcXVpcmUgJy4uL3N1cGVycy9Nb2RlbC5jb2ZmZWUnXG5cbmNsYXNzIEFwcE1vZGVsIGV4dGVuZHMgTW9kZWxcblxuICBkZWZhdWx0czpcbiAgICAnYnBtJzogQXBwQ29uZmlnLkJQTVxuICAgICdtdXRlJzogbnVsbFxuICAgICdraXRNb2RlbCc6IG51bGxcbiAgICAncGxheWluZyc6IG51bGxcbiAgICAncGFnZUZvY3VzJzogdHJ1ZVxuICAgICdzaGFyZUlkJzogbnVsbFxuICAgICdzaGFyZWRUcmFja01vZGVsJzogbnVsbFxuXG4gICAgIyBTZXQgdG8gdHJ1ZSB0byBzaG93IHNlcXVlbmNlciB2aWV3LCBmYWxzZSB0byBzaG93IHBhZFxuICAgICdzaG93U2VxdWVuY2VyJzogbnVsbFxuXG4gICAgJ3ZpZXcnOiBudWxsXG4gICAgJ3Zpc3VhbGl6YXRpb24nOiBudWxsXG5cblxuICBleHBvcnQ6IC0+XG4gICAganNvbiA9IEB0b0pTT04oKVxuXG4gICAganNvbi5raXRNb2RlbCA9IGpzb24ua2l0TW9kZWwudG9KU09OKClcbiAgICBqc29uLmtpdE1vZGVsLmluc3RydW1lbnRzID0ganNvbi5raXRNb2RlbC5pbnN0cnVtZW50cy50b0pTT04oKVxuICAgIGpzb24ua2l0TW9kZWwuaW5zdHJ1bWVudHMgPSBfLm1hcCBqc29uLmtpdE1vZGVsLmluc3RydW1lbnRzLCAoaW5zdHJ1bWVudCkgLT5cbiAgICAgIGluc3RydW1lbnQucGF0dGVyblNxdWFyZXMgPSBpbnN0cnVtZW50LnBhdHRlcm5TcXVhcmVzLnRvSlNPTigpXG4gICAgICByZXR1cm4gaW5zdHJ1bWVudFxuICAgIHJldHVybiBqc29uXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwTW9kZWxcbiIsIiMjIypcbiAqIEhhbmRsZXMgc2hhcmluZyBzb25ncyBiZXR3ZWVuIHRoZSBhcHAgYW5kIFBhcnNlLCBhcyB3ZWxsIGFzIG90aGVyIHNlcnZpY2VzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI1LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5Nb2RlbCAgICAgPSByZXF1aXJlICcuLi9zdXBlcnMvTW9kZWwuY29mZmVlJ1xuXG5jbGFzcyBTaGFyZWRUcmFja01vZGVsIGV4dGVuZHMgUGFyc2UuT2JqZWN0XG5cbiAgY2xhc3NOYW1lOiAnU2hhcmVkVHJhY2snXG5cbiAgZGVmYXVsdHM6XG5cbiAgICAjIEtpdCBwbGF5YmFjayBwcm9wZXJ0aWVzXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgIyBAdHlwZSB7TnVtYmVyfVxuICAgIGJwbTogbnVsbFxuXG4gICAgIyBAdHlwZSB7T2JqZWN0fVxuICAgIGluc3RydW1lbnRzOiBudWxsXG5cbiAgICAjIEB0eXBlIHtTdHJpbmd9XG4gICAga2l0VHlwZTogbnVsbFxuXG4gICAgIyBAdHlwZSB7QXJyYXl9XG4gICAgcGF0dGVyblNxdWFyZUdyb3VwczogbnVsbFxuXG4gICAgIyBTaGFyZSBkYXRhIHJlbGF0ZWQgdG8gdXNlclxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICMgQHR5cGUge1N0cmluZ31cbiAgICBzaGFyZU5hbWU6IG51bGxcblxuICAgICMgQHR5cGUge1N0cmluZ31cbiAgICBzaGFyZVRpdGxlOiBudWxsXG5cbiAgICAgICMgQHR5cGUge1N0cmluZ31cbiAgICBzaGFyZU1lc3NhZ2U6IG51bGxcblxuICAgICMgQHR5cGUge1N0cmluZ31cbiAgICB2aXN1YWxpemF0aW9uOiBudWxsXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTaGFyZWRUcmFja01vZGVsXG4iLCIjIyMqXG4gKiBDb2xsZWN0aW9uIG9mIHNvdW5kIGtpdHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5Db2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL0NvbGxlY3Rpb24uY29mZmVlJ1xuQXBwQ29uZmlnICA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuS2l0TW9kZWwgICA9IHJlcXVpcmUgJy4vS2l0TW9kZWwuY29mZmVlJ1xuXG5cbmNsYXNzIEtpdENvbGxlY3Rpb24gZXh0ZW5kcyBDb2xsZWN0aW9uXG5cbiAgIyBVcmwgdG8gZGF0YSBmb3IgZmV0Y2hcbiAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gIHVybDogXCIje0FwcENvbmZpZy5yZXR1cm5Bc3NldFBhdGgoJ2RhdGEnKX0vc291bmQtZGF0YS5qc29uXCJcblxuICAjIEluZGl2aWR1YWwgZHJ1bWtpdCBhdWRpbyBzZXRzXG4gICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gIG1vZGVsOiBLaXRNb2RlbFxuXG4gICMgVGhlIGN1cnJlbnQgdXNlci1zZWxlY3RlZCBraXRcbiAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gIGtpdElkOiAwXG5cblxuICAjIFBhcnNlcyB0aGUgY29sbGVjdGlvbiB0byBhc3NpZ24gcGF0aHMgdG8gZWFjaCBpbmRpdmlkdWFsIHNvdW5kXG4gICMgYmFzZWQgdXBvbiBjb25maWd1cmF0aW9uIGRhdGFcbiAgIyBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcblxuICBwYXJzZTogKHJlc3BvbnNlKSAtPlxuICAgIGFzc2V0UGF0aCA9IHJlc3BvbnNlLmNvbmZpZy5hc3NldFBhdGhcbiAgICBraXRzID0gcmVzcG9uc2Uua2l0c1xuXG4gICAga2l0cyA9IF8ubWFwIGtpdHMsIChraXQpIC0+XG4gICAgICBraXQucGF0aCA9IGFzc2V0UGF0aCArICcvJyArIGtpdC5mb2xkZXJcbiAgICAgIHJldHVybiBraXRcblxuICAgIHJldHVybiBraXRzXG5cblxuICAjIEl0ZXJhdGVzIHRocm91Z2ggdGhlIGNvbGxlY3Rpb24gYW5kIHJldHVybnMgYSBzcGVjaWZpYyBpbnN0cnVtZW50XG4gICMgYnkgbWF0Y2hpbmcgYXNzb2NpYXRlZCBpZFxuICAjIEBwYXJhbSB7TnVtYmVyfSBpZFxuXG4gIGZpbmRJbnN0cnVtZW50TW9kZWw6IChpZCkgLT5cbiAgICBpbnN0cnVtZW50TW9kZWwgPSBudWxsXG5cbiAgICBAZWFjaCAoa2l0TW9kZWwpID0+XG4gICAgICBraXRNb2RlbC5nZXQoJ2luc3RydW1lbnRzJykuZWFjaCAobW9kZWwpID0+XG4gICAgICAgIGlmIGlkIGlzIG1vZGVsLmdldCgnaWQnKVxuICAgICAgICAgIGluc3RydW1lbnRNb2RlbCA9IG1vZGVsXG5cbiAgICBpZiBpbnN0cnVtZW50TW9kZWwgaXMgbnVsbFxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBpbnN0cnVtZW50TW9kZWxcblxuXG4gICMgQ3ljbGVzIHRoZSBjdXJyZW50IGRydW0ga2l0IGJhY2tcbiAgIyBAcmV0dXJuIHtLaXRNb2RlbH1cblxuICBwcmV2aW91c0tpdDogLT5cbiAgICBsZW4gPSBAbGVuZ3RoXG5cbiAgICBpZiBAa2l0SWQgPiAwXG4gICAgICBAa2l0SWQtLVxuXG4gICAgZWxzZVxuICAgICAgQGtpdElkID0gbGVuIC0gMVxuXG4gICAga2l0TW9kZWwgPSBAYXQgQGtpdElkXG5cblxuICAjIEN5Y2xlcyB0aGUgY3VycmVudCBkcnVtIGtpdCBmb3J3YXJkXG4gICMgQHJldHVybiB7S2l0TW9kZWx9XG5cbiAgbmV4dEtpdDogLT5cbiAgICBsZW4gPSBAbGVuZ3RoIC0gMVxuXG4gICAgaWYgQGtpdElkIDwgbGVuXG4gICAgICBAa2l0SWQrK1xuXG4gICAgZWxzZVxuICAgICAgQGtpdElkID0gMFxuXG4gICAga2l0TW9kZWwgPSBAYXQgQGtpdElkXG5cbm1vZHVsZS5leHBvcnRzID0gS2l0Q29sbGVjdGlvblxuIiwiIyMjKlxuICogS2l0IG1vZGVsIGZvciBoYW5kbGluZyBzdGF0ZSByZWxhdGVkIHRvIGtpdCBzZWxlY3Rpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5Nb2RlbCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Nb2RlbC5jb2ZmZWUnXG5JbnN0cnVtZW50Q29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL3NlcXVlbmNlci9JbnN0cnVtZW50Q29sbGVjdGlvbi5jb2ZmZWUnXG5cbmNsYXNzIEtpdE1vZGVsIGV4dGVuZHMgTW9kZWxcblxuICBkZWZhdWx0czpcbiAgICAnbGFiZWwnOiBudWxsXG4gICAgJ3BhdGgnOiBudWxsXG4gICAgJ2ZvbGRlcic6IG51bGxcblxuICAgICMgQHR5cGUge0luc3RydW1lbnRDb2xsZWN0aW9ufVxuICAgICdpbnN0cnVtZW50cyc6IG51bGxcblxuICAgICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cbiAgICAnY3VycmVudEluc3RydW1lbnQnOiBudWxsXG5cblxuICAjIEZvcm1hdCB0aGUgcmVzcG9uc2Ugc28gdGhhdCBpbnN0cnVtZW50cyBnZXRzIHByb2Nlc3NlZFxuICAjIGJ5IGJhY2tib25lIHZpYSB0aGUgSW5zdHJ1bWVudENvbGxlY3Rpb24uICBBZGRpdGlvbmFsbHksXG4gICMgcGFzcyBpbiB0aGUgcGF0aCBzbyB0aGF0IGFic29sdXRlIFVSTCdzIGNhbiBiZSB1c2VkXG4gICMgdG8gcmVmZXJlbmNlIHNvdW5kIGRhdGFcbiAgIyBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcblxuICBwYXJzZTogKHJlc3BvbnNlKSAtPlxuICAgIF8uZWFjaCByZXNwb25zZS5pbnN0cnVtZW50cywgKGluc3RydW1lbnQsIGluZGV4KSAtPlxuICAgICAgaW5zdHJ1bWVudC5pZCA9IF8udW5pcXVlSWQgJ2luc3RydW1lbnQtJ1xuICAgICAgaW5zdHJ1bWVudC5zcmMgPSByZXNwb25zZS5wYXRoICsgJy8nICsgaW5zdHJ1bWVudC5zcmNcblxuICAgIHJlc3BvbnNlLmluc3RydW1lbnRzID0gbmV3IEluc3RydW1lbnRDb2xsZWN0aW9uIHJlc3BvbnNlLmluc3RydW1lbnRzXG4gICAgcmVzcG9uc2VcblxubW9kdWxlLmV4cG9ydHMgPSBLaXRNb2RlbFxuIiwiIyMjKlxuICogQ29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIFBhZFNxdWFyZU1vZGVsc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4uL3NlcXVlbmNlci9JbnN0cnVtZW50TW9kZWwuY29mZmVlJ1xuQ29sbGVjdGlvbiAgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL0NvbGxlY3Rpb24uY29mZmVlJ1xuXG5jbGFzcyBQYWRTcXVhcmVDb2xsZWN0aW9uIGV4dGVuZHMgQ29sbGVjdGlvblxuICAgbW9kZWw6IEluc3RydW1lbnRNb2RlbFxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZFNxdWFyZUNvbGxlY3Rpb25cbiIsIiMjIypcbiAqIE1vZGVsIGZvciBpbmRpdmlkdWFsIHBhZCBzcXVhcmVzLlxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbk1vZGVsID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL01vZGVsLmNvZmZlZSdcblxuY2xhc3MgUGFkU3F1YXJlTW9kZWwgZXh0ZW5kcyBNb2RlbFxuXG4gIGRlZmF1bHRzOlxuICAgICdkcmFnZ2luZyc6IGZhbHNlXG4gICAgJ2tleWNvZGUnOiBudWxsXG4gICAgJ3RyaWdnZXInOiBmYWxzZVxuXG4gICAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICAgICdjdXJyZW50SW5zdHJ1bWVudCc6IG51bGxcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG4gICAgQHNldCAnaWQnLCBfLnVuaXF1ZUlkICdwYWQtc3F1YXJlLSdcblxubW9kdWxlLmV4cG9ydHMgPSBQYWRTcXVhcmVNb2RlbFxuIiwiIyMjKlxuICogQ29sbGVjdGlvbiByZXByZXNlbnRpbmcgZWFjaCBzb3VuZCBmcm9tIGEga2l0IHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkluc3RydW1lbnRNb2RlbCA9IHJlcXVpcmUgJy4vSW5zdHJ1bWVudE1vZGVsLmNvZmZlZSdcbkNvbGxlY3Rpb24gICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9Db2xsZWN0aW9uLmNvZmZlZSdcblxuY2xhc3MgSW5zdHJ1bWVudENvbGxlY3Rpb24gZXh0ZW5kcyBDb2xsZWN0aW9uXG5cbiAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICBtb2RlbDogSW5zdHJ1bWVudE1vZGVsXG5cbiAgIyBFeHBvcnRzIHRoZSBwYXR0ZXJuIHNxdWFyZXMgY29sbGVjdGlvbiBmb3IgdXNlXG4gICMgd2l0aCB0cmFuc2ZlcnJpbmcgcHJvcHMgYWNyb3NzIGRpZmZlcmVudCBkcnVtIGtpdHNcblxuICBleHBvcnRQYXR0ZXJuU3F1YXJlczogLT5cbiAgICByZXR1cm4gQG1hcCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgIGluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudENvbGxlY3Rpb25cbiIsIiMjIypcbiAqIFNvdW5kIG1vZGVsIGZvciBlYWNoIGluZGl2aWR1YWwga2l0IHNvdW5kIHNldFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuTW9kZWwgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL01vZGVsLmNvZmZlZSdcblxuY2xhc3MgSW5zdHJ1bWVudE1vZGVsIGV4dGVuZHMgTW9kZWxcblxuICBkZWZhdWx0czpcblxuICAgICMgSWYgYWN0aXZlLCBzb3VuZCBjYW4gcGxheVxuICAgICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgICAnYWN0aXZlJzogbnVsbFxuXG5cbiAgICAjIEZsYWcgdG8gY2hlY2sgaWYgaW5zdHJ1bWVudCBoYXMgYmVlbiBkcm9wcGVkIG9udG8gcGFkIHNxdWFyZVxuICAgICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgICAnZHJvcHBlZCc6IGZhbHNlXG5cblxuICAgICMgQ2FjaGUgb2YgdGhlIG9yaWdpbmFsIG1vdXNlIGRyYWcgZXZlbnQgaW4gb3JkZXIgdG8gdXBkYXRlIHRoZVxuICAgICMgZHJhZyBwb3NpdGlvbiB3aGVuIGRpc2xvZGdpbmcgaW4gaW5zdHJ1bWVudCBmcm9tIHRoZSBQYWRTcXVhcmVcbiAgICAjIEB0eXBlIHtNb3VzZUV2ZW50fVxuXG4gICAgJ2Ryb3BwZWRFdmVudCc6IG51bGxcblxuXG4gICAgIyBGbGFnIHRvIGNoZWNrIGlmIGF1ZGlvIGZvY3VzIGlzIHNldCBvbiBhIHBhcnRpY3VsYXIgaW5zdHJ1bWVudC5cbiAgICAjIElmIHNvLCBpdCBtdXRlcyBhbGwgb3RoZXIgdHJhY2tzLlxuICAgICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgICAnZm9jdXMnOiBmYWxzZVxuXG5cbiAgICAjIFRoZSBpY29uIGNsYXNzIHRoYXQgcmVwcmVzZW50cyB0aGUgaW5zdHJ1bWVudFxuICAgICMgQHR5cGUge1N0cmluZ31cblxuICAgICdpY29uJzogbnVsbFxuXG5cbiAgICAjIFRoZSB0ZXh0IGxhYmVsIGRlc2NyaWJpbmcgdGhlIGluc3RydW1lbnRcbiAgICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgICAnbGFiZWwnOiBudWxsXG5cblxuICAgICMgTXV0ZSBvciB1bm11dGUgc2V0dGluZ1xuICAgICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgICAnbXV0ZSc6IGZhbHNlXG5cblxuICAgICMgVGhlIHBhdGggdG8gdGhlIHNvdW5kIHNvdXJjZVxuICAgICMgQHR5cGUge1N0cmluZ31cblxuICAgICdzcmMnOiBudWxsXG5cblxuICAgICMgVGhlIHZvbHVtZVxuICAgICMgQHR5cGUge051bWJlcn1cbiAgICAndm9sdW1lJzogbnVsbFxuXG5cbiAgICAjIENvbGxlY3Rpb24gb2YgYXNzb2NpYXRlZCBwYXR0ZXJuIHNxdWFyZXMgKGEgdHJhY2spIGZvciB0aGVcbiAgICAjIFNlcXVlbmNlciB2aWV3LiAgVXBkYXRlZCB3aGVuIHRoZSB0cmFja3MgYXJlIHN3YXBwZWQgb3V0XG4gICAgIyBAdHlwZSB7UGF0dGVyblNxdWFyZUNvbGxlY3Rpb259XG5cbiAgICAncGF0dGVyblNxdWFyZXMnOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdHJ1bWVudE1vZGVsXG4iLCIjIyMqXG4gIEEgY29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlc1xuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwQ29uZmlnICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBFdmVudCAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuQ29sbGVjdGlvbiAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL0NvbGxlY3Rpb24uY29mZmVlJ1xuSW5zdHJ1bWVudE1vZGVsICAgID0gcmVxdWlyZSAnLi4vc2VxdWVuY2VyL0luc3RydW1lbnRNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlTW9kZWwgPSByZXF1aXJlICcuL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QdWJTdWIgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9QdWJTdWInXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uIGV4dGVuZHMgQ29sbGVjdGlvblxuXG4gIG1vZGVsOiBJbnN0cnVtZW50TW9kZWxcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG5cbiAgb25JbXBvcnRUcmFjazogKHBhcmFtcykgLT5cblxuICBvbkV4cG9ydFRyYWNrOiAocGFyYW1zKSAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmVDb2xsZWN0aW9uXG4iLCIjIyMqXG4gIE1vZGVsIGZvciBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlcy4gIFBhcnQgb2YgbGFyZ2VyIFBhdHRlcm4gVHJhY2sgY29sbGVjdGlvblxuXG4gIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAgQGRhdGUgICAzLjE3LjE0XG4jIyNcblxuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuTW9kZWwgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL01vZGVsLmNvZmZlZSdcblxuY2xhc3MgUGF0dGVyblNxdWFyZU1vZGVsIGV4dGVuZHMgTW9kZWxcblxuICBkZWZhdWx0czpcbiAgICAnYWN0aXZlJzogZmFsc2VcbiAgICAnaW5zdHJ1bWVudCc6IG51bGxcbiAgICAncHJldmlvdXNWZWxvY2l0eSc6IDBcbiAgICAndHJpZ2dlcic6IG51bGxcbiAgICAndmVsb2NpdHknOiAwXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgQG9uIEFwcEV2ZW50LkNIQU5HRV9WRUxPQ0lUWSwgQG9uVmVsb2NpdHlDaGFuZ2VcblxuXG4gIGN5Y2xlOiAtPlxuICAgIHZlbG9jaXR5ID0gQGdldCAndmVsb2NpdHknXG5cbiAgICBpZiB2ZWxvY2l0eSA8IEFwcENvbmZpZy5WRUxPQ0lUWV9NQVhcbiAgICAgIHZlbG9jaXR5KytcblxuICAgIGVsc2VcbiAgICAgIHZlbG9jaXR5ID0gMFxuXG4gICAgQHNldCAndmVsb2NpdHknLCB2ZWxvY2l0eVxuXG5cbiAgZW5hYmxlOiAtPlxuICAgIEBzZXQgJ3ZlbG9jaXR5JywgMVxuXG5cbiAgZGlzYWJsZTogLT5cbiAgICBAc2V0ICd2ZWxvY2l0eScsIDBcblxuXG4gIG9uVmVsb2NpdHlDaGFuZ2U6IChtb2RlbCkgLT5cbiAgICBAc2V0ICdwcmV2aW91c1ZlbG9jaXR5JywgbW9kZWwuX3ByZXZpb3VzQXR0cmlidXRlcy52ZWxvY2l0eVxuXG4gICAgdmVsb2NpdHkgPSBtb2RlbC5jaGFuZ2VkLnZlbG9jaXR5XG5cbiAgICBpZiB2ZWxvY2l0eSA+IDBcbiAgICAgIEBzZXQgJ2FjdGl2ZScsIHRydWVcblxuICAgIGVsc2UgaWYgdmVsb2NpdHkgaXMgMFxuICAgICAgQHNldCAnYWN0aXZlJywgZmFsc2VcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TcXVhcmVNb2RlbFxuIiwiIyMjKlxuICogTVBDIEFwcGxpY2F0aW9uIHJvdXRlclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuUHViU3ViICAgID0gcmVxdWlyZSAnLi4vdXRpbHMvUHViU3ViJ1xuUHViRXZlbnQgID0gcmVxdWlyZSAnLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblxuY2xhc3MgQXBwUm91dGVyIGV4dGVuZHMgQmFja2JvbmUuUm91dGVyXG5cbiAgcm91dGVzOlxuICAgICcnICAgICAgICAgICAgIDogJ2xhbmRpbmdSb3V0ZSdcbiAgICAnbGFuZGluZycgICAgICA6ICdsYW5kaW5nUm91dGUnXG4gICAgJ2NyZWF0ZScgICAgICAgOiAnY3JlYXRlUm91dGUnXG4gICAgJ3NoYXJlJyAgICAgICAgOiAnc2hhcmVSb3V0ZSdcbiAgICAnc2hhcmUvOmlkJyAgICA6ICdzaGFyZVJvdXRlJ1xuICAgICdub3Qtc3VwcG9ydGVkJzogJ25vdFN1cHBvcnRlZFJvdXRlJ1xuXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAge0BhcHBDb250cm9sbGVyLCBAYXBwTW9kZWx9ID0gb3B0aW9uc1xuXG4gICAgUHViU3ViLm9uIFB1YkV2ZW50LlJPVVRFLCBAb25Sb3V0ZUNoYW5nZVxuXG5cbiAgb25Sb3V0ZUNoYW5nZTogKHBhcmFtcykgPT5cbiAgICB7cm91dGV9ID0gcGFyYW1zXG5cbiAgICBAbmF2aWdhdGUgcm91dGUsIHsgdHJpZ2dlcjogdHJ1ZSB9XG5cblxuICBsYW5kaW5nUm91dGU6IC0+XG4gICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLmxhbmRpbmdWaWV3XG5cblxuICBjcmVhdGVSb3V0ZTogLT5cbiAgICBAYXBwTW9kZWwuc2V0ICd2aWV3JywgQGFwcENvbnRyb2xsZXIuY3JlYXRlVmlld1xuXG5cbiAgc2hhcmVSb3V0ZTogKHNoYXJlSWQpIC0+XG4gICAgY29uc29sZS5sb2cgc2hhcmVJZFxuXG4gICAgQGFwcE1vZGVsLnNldFxuICAgICAgJ3ZpZXcnOiBAYXBwQ29udHJvbGxlci5zaGFyZVZpZXdcbiAgICAgICdzaGFyZUlkJzogc2hhcmVJZFxuXG5cbiAgbm90U3VwcG9ydGVkUm91dGU6IC0+XG4gICAgQGFwcE1vZGVsLnNldCAndmlldycsIEBhcHBDb250cm9sbGVyLm5vdFN1cHBvcnRlZFZpZXdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcFJvdXRlclxuIiwiIyMjKlxuICogQ29sbGVjdGlvbiBzdXBlcmNsYXNzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI1LjE0XG4jIyNcblxuY2xhc3MgQ29sbGVjdGlvbiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uXG4iLCIjIyMqXG4gKiBNb2RlbCBzdXBlcmNsYXNzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjI1LjE0XG4jIyNcblxuY2xhc3MgTW9kZWwgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVsXG4iLCIjIyMqXG4gKiBWaWV3IHN1cGVyY2xhc3MgY29udGFpbmluZyBzaGFyZWQgZnVuY3Rpb25hbGl0eVxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMi4xNy4xNFxuIyMjXG5cbkJyb3dzZXJEZXRlY3QgPSByZXF1aXJlICcuLi91dGlscy9Ccm93c2VyRGV0ZWN0J1xuXG5jbGFzcyBWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gICMgSW5pdGlhbGl6ZXMgdGhlIHZpZXdcbiAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIF8uZXh0ZW5kIEAsIF8uZGVmYXVsdHMoIG9wdGlvbnMgPSBvcHRpb25zIHx8IEBkZWZhdWx0cywgQGRlZmF1bHRzIHx8IHt9IClcblxuXG4gICMgUmVuZGVycyB0aGUgdmlldyB3aXRoIHN1cHBsaWVkIHRlbXBsYXRlIGRhdGEsIG9yIGNoZWNrcyBpZiB0ZW1wbGF0ZSBpcyBvblxuICAjIG9iamVjdCBib2R5XG4gICMgQHBhcmFtICB7RnVuY3Rpb258TW9kZWx9IHRlbXBsYXRlRGF0YVxuICAjIEByZXR1cm4ge1ZpZXd9XG5cbiAgcmVuZGVyOiAodGVtcGxhdGVEYXRhKSAtPlxuICAgIHRlbXBsYXRlRGF0YSA9IHRlbXBsYXRlRGF0YSB8fCB7fVxuXG4gICAgaWYgQHRlbXBsYXRlXG5cbiAgICAgICMgSWYgbW9kZWwgaXMgYW4gaW5zdGFuY2Ugb2YgYSBiYWNrYm9uZSBtb2RlbCwgdGhlbiBKU09OaWZ5IGl0XG4gICAgICBpZiBAbW9kZWwgaW5zdGFuY2VvZiBCYWNrYm9uZS5Nb2RlbFxuICAgICAgICB0ZW1wbGF0ZURhdGEgPSBAbW9kZWwudG9KU09OKClcblxuICAgICAgIyBQYXNzIGluIGRlc2t0b3AgdG8gcmVuZGVyIHNlcGVyYXRlIG1vYmlsZSBjb25kaXRpb25hbCB0ZW1wbGF0ZXNcbiAgICAgIHRlbXBsYXRlRGF0YS5pc0Rlc2t0b3AgPSBpZiAkKCdib2R5JykuaGFzQ2xhc3MoJ2Rlc2t0b3AnKSB0aGVuIHRydWUgZWxzZSBmYWxzZVxuXG4gICAgICBAJGVsLmh0bWwgQHRlbXBsYXRlICh0ZW1wbGF0ZURhdGEpXG5cbiAgICAjIEFkZCBmbGFnIHNvIHZpZXcgY2FuIGNoZWNrIGFnYWluc3Qgc3R1ZmZcbiAgICBAaXNNb2JpbGUgPSBpZiAkKCdib2R5JykuaGFzQ2xhc3MoJ21vYmlsZScpIHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG4gICAgQGlzVGFibGV0ID0gaWYgQnJvd3NlckRldGVjdC5kZXZpY2VEZXRlY3Rpb24oKS5kZXZpY2VUeXBlIGlzICd0YWJsZXQnIHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG5cbiAgICBAZGVsZWdhdGVFdmVudHMoKVxuICAgIEBhZGRFdmVudExpc3RlbmVycygpXG4gICAgQFxuXG5cbiAgIyBSZW1vdmVzIHRoZSB2aWV3XG4gICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICByZW1vdmU6IChvcHRpb25zKSAtPlxuICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG4gICAgQCRlbC5yZW1vdmUoKVxuICAgIEB1bmRlbGVnYXRlRXZlbnRzKClcblxuXG4gICMgU2hvd3MgdGhlIHZpZXdcbiAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gIHNob3c6IChvcHRpb25zKSAtPlxuICAgIHJldHVyblxuICAgIFR3ZWVuTGl0ZS5zZXQgQCRlbCwgeyBhdXRvQWxwaGE6IDEgfVxuXG5cbiAgIyBIaWRlcyB0aGUgdmlld1xuICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgaGlkZTogKG9wdGlvbnMpIC0+XG4gICAgVHdlZW5MaXRlLnRvIEAkZWwsIDAsXG4gICAgICBhdXRvQWxwaGE6IDBcbiAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgIGlmIG9wdGlvbnM/LnJlbW92ZVxuICAgICAgICAgIEByZW1vdmUoKVxuXG5cbiAgIyBOb29wIHdoaWNoIGlzIGNhbGxlZCBvbiByZW5kZXJcbiAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuXG5cbiAgIyBSZW1vdmVzIGFsbCByZWdpc3RlcmVkIGxpc3RlbmVyc1xuICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgQHN0b3BMaXN0ZW5pbmcoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld1xuIiwiIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4jIEJyZWFrcG9pbnQgTWFuYWdlclxuIyBBdXRob3I6IG1hdHRAd2ludHIudXMgQCBXSU5UUlxuI1xuIyBUaGlzIGNsYXNzIHdpbGwgYnJvYWRjYXN0IGFuIGV2ZW50IHdoZW5ldmVyIGEgYnJlYWtwb2ludFxuIyBpcyBtYXRjaGVkIG9yIHVubWF0Y2hlZC4gRGVwZW5kcyBvbiBlbnF1aXJlLmpzIGFuZCBqUXVlcnlcbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5cbmNsYXNzIEJyZWFrcG9pbnRNYW5hZ2VyXG5cblxuICAjIEJyZWFrcG9pbnQgZXZlbnRzIHdpbGwgYmUgdHJpZ2dlcmVkIG9uIHRoaXMgc2NvcGVcbiAgc2NvcGU6IG51bGxcblxuICAjIEFycmF5IG9mIGJyZWFrcG9pbnRzIG9iamVjdHMsIGVhY2ggd2l0aCBtaW4vbWF4IHByb3BlcnRpZXNcbiAgI1xuICAjIFVzYWdlIEV4YW1wbGU6XG4gICNcbiAgIyBicmVha3BvaW50TWFuYWdlciA9IG5ldyBCcmVha3BvaW50TWFuYWdlclxuICAjICAgc2NvcGU6ICQoZG9jdW1lbnQpXG4gICMgICBicmVha3BvaW50czpcbiAgIyAgICAgbW9iaWxlOlxuICAjICAgICAgIG1pbjogbnVsbFxuICAjICAgICAgIG1heDogNTk5XG4gICMgICAgIHRhYmxldDpcbiAgIyAgICAgICBtaW46IDYwMFxuICAjICAgICAgIG1heDogODE5XG4gICMgICAgIGRlc2t0b3A6XG4gICMgICAgICAgbWluOiA4MjBcbiAgIyAgICAgICBtYXg6IG51bGxcbiAgI1xuICAjICMgVGhlbiBzdWJzY3JpYmUgdG8gZXZlbnRzIHZpYTpcbiAgIyAkKGRvY3VtZW50KS5vbiBcImJyZWFrcG9pbnQ6bWF0Y2hcIiwgKGV2ZW50LCBicmVha3BvaW50KSAtPlxuXG4gIGJyZWFrcG9pbnRzOiBbXVxuXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICB7QHNjb3BlLCBAYnJlYWtwb2ludHN9ID0gb3B0aW9uc1xuXG4gICAgJC5lYWNoIEBicmVha3BvaW50cywgKGJyZWFrcG9pbnQsIGJvdW5kcmllcykgPT5cblxuICAgICAgaWYgYm91bmRyaWVzLm1pbiBpcyBudWxsXG4gICAgICAgIHF1ZXJ5ID0gXCJzY3JlZW4gYW5kIChtaW4td2lkdGg6MHB4KSBhbmQgKG1heC13aWR0aDoje2JvdW5kcmllcy5tYXh9cHgpXCJcbiAgICAgIGVsc2UgaWYgYm91bmRyaWVzLm1heCBpcyBudWxsXG4gICAgICAgIHF1ZXJ5ID0gXCJzY3JlZW4gYW5kIChtaW4td2lkdGg6I3tib3VuZHJpZXMubWlufXB4KVwiXG4gICAgICBlbHNlXG4gICAgICAgIHF1ZXJ5ID0gXCJzY3JlZW4gYW5kIChtaW4td2lkdGg6I3tib3VuZHJpZXMubWlufXB4KSBhbmQgKG1heC13aWR0aDoje2JvdW5kcmllcy5tYXh9cHgpXCJcblxuICAgICAgZW5xdWlyZS5yZWdpc3RlcihxdWVyeSxcbiAgICAgICAgbWF0Y2g6ID0+XG4gICAgICAgICAgQHNjb3BlLnRyaWdnZXIoXCJicmVha3BvaW50Om1hdGNoXCIsIGJyZWFrcG9pbnQpXG4gICAgICAgIHVubWF0Y2g6ID0+XG4gICAgICAgICAgQHNjb3BlLnRyaWdnZXIoXCJicmVha3BvaW50OnVubWF0Y2hcIiwgYnJlYWtwb2ludClcbiAgICAgIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEJyZWFrcG9pbnRNYW5hZ2VyIiwiXG52YXIgQnJvd3NlckRldGVjdCA9IHtcblxuICB1bnN1cHBvcnRlZEFuZHJvaWREZXZpY2U6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1c2VyQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50XG4gICAgdmFyIGFnZW50SW5kZXggPSB1c2VyQWdlbnQuaW5kZXhPZignQW5kcm9pZCcpO1xuXG4gICAgaWYgKGFnZW50SW5kZXggIT0gLTEpIHtcbiAgICAgIHZhciBhbmRyb2lkdmVyc2lvbiA9IHBhcnNlRmxvYXQodXNlckFnZW50Lm1hdGNoKC9BbmRyb2lkXFxzKyhbXFxkXFwuXSspLylbMV0pO1xuICAgICAgaWYgKGFuZHJvaWR2ZXJzaW9uIDwgNC4xKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcblxuXG4gIGRldmljZURldGVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9zVmVyc2lvbixcbiAgICBkZXZpY2UsXG4gICAgZGV2aWNlVHlwZSxcbiAgICB1c2VyQWdlbnQsXG4gICAgaXNTbWFydHBob25lT3JUYWJsZXQ7XG5cbiAgICBkZXZpY2UgPSAobmF2aWdhdG9yLnVzZXJBZ2VudCkubWF0Y2goL0FuZHJvaWR8aVBob25lfGlQYWR8aVBvZC9pKTtcblxuICAgIGlmICggL0FuZHJvaWQvaS50ZXN0KGRldmljZSkgKSB7XG4gICAgICAgIGlmICggIS9tb2JpbGUvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICkge1xuICAgICAgICAgICAgZGV2aWNlVHlwZSA9ICd0YWJsZXQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGV2aWNlVHlwZSA9ICdwaG9uZSc7XG4gICAgICAgIH1cblxuICAgICAgICBvc1ZlcnNpb24gPSAobmF2aWdhdG9yLnVzZXJBZ2VudCkubWF0Y2goL0FuZHJvaWRcXHMrKFtcXGRcXC5dKykvaSk7XG4gICAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvblswXTtcbiAgICAgICAgb3NWZXJzaW9uID0gb3NWZXJzaW9uLnJlcGxhY2UoJ0FuZHJvaWQgJywgJycpO1xuXG4gICAgfSBlbHNlIGlmICggL2lQaG9uZS9pLnRlc3QoZGV2aWNlKSApIHtcbiAgICAgICAgZGV2aWNlVHlwZSA9ICdwaG9uZSc7XG4gICAgICAgIG9zVmVyc2lvbiA9IChuYXZpZ2F0b3IudXNlckFnZW50KS5tYXRjaCgvT1NcXHMrKFtcXGRcXF9dKykvaSk7XG4gICAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvblswXTtcbiAgICAgICAgb3NWZXJzaW9uID0gb3NWZXJzaW9uLnJlcGxhY2UoL18vZywgJy4nKTtcbiAgICAgICAgb3NWZXJzaW9uID0gb3NWZXJzaW9uLnJlcGxhY2UoJ09TICcsICcnKTtcblxuICAgIH0gZWxzZSBpZiAoIC9pUGFkL2kudGVzdChkZXZpY2UpICkge1xuICAgICAgICBkZXZpY2VUeXBlID0gJ3RhYmxldCc7XG4gICAgICAgIG9zVmVyc2lvbiA9IChuYXZpZ2F0b3IudXNlckFnZW50KS5tYXRjaCgvT1NcXHMrKFtcXGRcXF9dKykvaSk7XG4gICAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvblswXTtcbiAgICAgICAgb3NWZXJzaW9uID0gb3NWZXJzaW9uLnJlcGxhY2UoL18vZywgJy4nKTtcbiAgICAgICAgb3NWZXJzaW9uID0gb3NWZXJzaW9uLnJlcGxhY2UoJ09TICcsICcnKTtcbiAgICB9XG4gICAgaXNTbWFydHBob25lT3JUYWJsZXQgPSAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgIHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG5cbiAgICByZXR1cm4geyAnaXNTbWFydHBob25lT3JUYWJsZXQnOiBpc1NtYXJ0cGhvbmVPclRhYmxldCxcbiAgICAgICAgICAgICAnZGV2aWNlJzogZGV2aWNlLFxuICAgICAgICAgICAgICdvc1ZlcnNpb24nOiBvc1ZlcnNpb24sXG4gICAgICAgICAgICAgJ3VzZXJBZ2VudCc6IHVzZXJBZ2VudCxcbiAgICAgICAgICAgICAnZGV2aWNlVHlwZSc6IGRldmljZVR5cGVcbiAgICAgICAgICAgIH07XG4gIH0sXG5cblxuICBpc0lFOiBmdW5jdGlvbigpIHtcbiAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvSUUvaSkpXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgaWYgKCEhbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvVHJpZGVudC4qcnZcXDoxMVxcLi8pKVxuICAgICAgcmV0dXJuIHRydWVcblxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCcm93c2VyRGV0ZWN0XG5cbiIsIi8qKlxuICogQG1vZHVsZSAgICAgUHViU3ViXG4gKiBAZGVzYyAgICAgICBHbG9iYWwgUHViU3ViIG9iamVjdCBmb3IgZGlzcGF0Y2ggYW5kIGRlbGVnYXRpb25cbiAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIFB1YlN1YiA9IHt9XG5cbl8uZXh0ZW5kKCBQdWJTdWIsIEJhY2tib25lLkV2ZW50cyApXG5cbm1vZHVsZS5leHBvcnRzID0gUHViU3ViIiwiLyoqXG4gKiBTcGluLmpzIGxvYWRlciBpY29uIGNvbmZpZ3VyYXRpb25cbiAqXG4gKiBAYXV0aG9yICBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAgMi4xOC4xNFxuICovXG5cbnZhciBvcHRzID0ge1xuICBsaW5lczogNywgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gIGxlbmd0aDogNiwgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgd2lkdGg6IDMsIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICByYWRpdXM6IDYsIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICBjb3JuZXJzOiAxLCAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxuICByb3RhdGU6IDAsIC8vIFRoZSByb3RhdGlvbiBvZmZzZXRcbiAgZGlyZWN0aW9uOiAxLCAvLyAxOiBjbG9ja3dpc2UsIC0xOiBjb3VudGVyY2xvY2t3aXNlXG4gIGNvbG9yOiAnI2ZmZicsIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcbiAgc3BlZWQ6IDEsIC8vIFJvdW5kcyBwZXIgc2Vjb25kXG4gIHRyYWlsOiA3OCwgLy8gQWZ0ZXJnbG93IHBlcmNlbnRhZ2VcbiAgc2hhZG93OiBmYWxzZSwgLy8gV2hldGhlciB0byByZW5kZXIgYSBzaGFkb3dcbiAgaHdhY2NlbDogZmFsc2UsIC8vIFdoZXRoZXIgdG8gdXNlIGhhcmR3YXJlIGFjY2VsZXJhdGlvblxuICBjbGFzc05hbWU6ICdzcGlubmVyJywgLy8gVGhlIENTUyBjbGFzcyB0byBhc3NpZ24gdG8gdGhlIHNwaW5uZXJcbiAgekluZGV4OiAyZTksIC8vIFRoZSB6LWluZGV4IChkZWZhdWx0cyB0byAyMDAwMDAwMDAwKVxuICB0b3A6ICdhdXRvJywgLy8gVG9wIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudCBpbiBweFxuICBsZWZ0OiAnYXV0bycgLy8gTGVmdCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnQgaW4gcHhcbn07XG5cblxudmFyIFNwaW5JY29uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgdGhpcy50YXJnZXQgPSBvcHRpb25zLnRhcmdldFxuICB0aGlzLm9wdGlvbnMgPSBfLmV4dGVuZChvcHRzLCBvcHRpb25zKVxuICByZXR1cm4gdGhpcy5pbml0KClcbn1cblxuU3Bpbkljb24ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcihvcHRzKS5zcGluKHRoaXMudGFyZ2V0KTtcbiAgdGhpcy4kZWwgPSAkKHRoaXMuc3Bpbm5lci5lbClcbiAgVHdlZW5MaXRlLnNldCggdGhpcy4kZWwsIHsgYXV0b0FscGhhOiAwIH0pXG4gIHRoaXMuaGlkZSgpXG59XG5cblNwaW5JY29uLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuICBUd2VlbkxpdGUudG8oIHRoaXMuJGVsLCAuMiwge1xuICAgIGF1dG9BbHBoYTogMVxuICB9KVxufVxuXG5TcGluSWNvbi5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgVHdlZW5MaXRlLnRvKCB0aGlzLiRlbCwgLjIsIHtcbiAgICBhdXRvQWxwaGE6IDBcbiAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTcGluSWNvbiIsIi8qKlxuICogVG91Y2ggcmVsYXRlZCB1dGlsaXRpZXNcbiAqXG4gKi9cblxudmFyIFRvdWNoID0ge1xuXG4gIC8qKlxuICAgKiBEZWxlZ2F0ZSB0b3VjaCBldmVudHMgdG8gbW91c2UgaWYgbm90IG9uIGEgdG91Y2ggZGV2aWNlXG4gICAqL1xuXG4gIHRyYW5zbGF0ZVRvdWNoRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoISAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93ICkpIHtcbiAgICAgICQoZG9jdW1lbnQpLm9uKCAnbW91c2Vkb3duJywgJ2JvZHknLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICQoZS50YXJnZXQpLnRyaWdnZXIoICd0b3VjaHN0YXJ0JyApXG4gICAgICB9KVxuXG4gICAgICAkKGRvY3VtZW50KS5vbiggJ21vdXNldXAnLCAnYm9keScsICBmdW5jdGlvbihlKSB7XG4gICAgICAgICQoZS50YXJnZXQpLnRyaWdnZXIoICd0b3VjaGVuZCcgKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRvdWNoXG4iLCJ2YXIgb2JzZXJ2ZURPTSA9IChmdW5jdGlvbigpe1xuICB2YXIgTXV0YXRpb25PYnNlcnZlciA9IHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyIHx8IHdpbmRvdy5XZWJLaXRNdXRhdGlvbk9ic2VydmVyLFxuICAgIGV2ZW50TGlzdGVuZXJTdXBwb3J0ZWQgPSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcblxuICByZXR1cm4gZnVuY3Rpb24ob2JqLCBjYWxsYmFjayl7XG4gICAgaWYgKE11dGF0aW9uT2JzZXJ2ZXIpIHtcblxuICAgICAgLy8gRGVmaW5lIGEgbmV3IG9ic2VydmVyXG4gICAgICB2YXIgb2JzID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24obXV0YXRpb25zLCBvYnNlcnZlcil7XG4gICAgICAgICAgaWYoIG11dGF0aW9uc1swXS5hZGRlZE5vZGVzLmxlbmd0aCB8fCBtdXRhdGlvbnNbMF0ucmVtb3ZlZE5vZGVzLmxlbmd0aCApXG4gICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gSGF2ZSB0aGUgb2JzZXJ2ZXIgb2JzZXJ2ZSBmb28gZm9yIGNoYW5nZXMgaW4gY2hpbGRyZW5cbiAgICAgIG9icy5vYnNlcnZlKCBvYmosIHsgY2hpbGRMaXN0OnRydWUsIHN1YnRyZWU6dHJ1ZSB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50TGlzdGVuZXJTdXBwb3J0ZWQpIHtcbiAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyKCdET01Ob2RlSW5zZXJ0ZWQnLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgb2JqLmFkZEV2ZW50TGlzdGVuZXIoJ0RPTU5vZGVSZW1vdmVkJywgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICB9XG4gIH1cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gb2JzZXJ2ZURPTVxuIiwiIyMjKlxuICogQ3JlYXRlIHZpZXcgd2hpY2ggdGhlIHVzZXIgY2FuIGJ1aWxkIGJlYXRzIHdpdGhpblxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xNy4xNFxuIyMjXG5cblB1YlN1YiAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvUHViU3ViJ1xuVmlldyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5BcHBFdmVudCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5QdWJFdmVudCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5TaGFyZWRUcmFja01vZGVsICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9TaGFyZWRUcmFja01vZGVsLmNvZmZlZSdcbkJ1YmJsZXMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdmlld3MvdmlzdWFsaXplci9CdWJibGVzJ1xuQnViYmxlc1ZpZXcgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi92aWV3cy92aXN1YWxpemVyL0J1YmJsZXNWaWV3LmNvZmZlZSdcbkJyb3dzZXJEZXRlY3QgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvQnJvd3NlckRldGVjdCdcbktpdFNlbGVjdG9yICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb21wb25lbnRzL0tpdFNlbGVjdG9yLmNvZmZlZSdcblBsYXlQYXVzZUJ0biAgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb21wb25lbnRzL1BsYXlQYXVzZUJ0bi5jb2ZmZWUnXG5Ub2dnbGUgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vY29tcG9uZW50cy9Ub2dnbGUuY29mZmVlJ1xuUGF0dGVyblNlbGVjdG9yICAgICAgICAgPSByZXF1aXJlICcuL2NvbXBvbmVudHMvUGF0dGVyblNlbGVjdG9yLmNvZmZlZSdcbkluc3RydW1lbnRTZWxlY3RvclBhbmVsID0gcmVxdWlyZSAnLi9jb21wb25lbnRzL2luc3RydW1lbnRzL0luc3RydW1lbnRTZWxlY3RvclBhbmVsLmNvZmZlZSdcblNlcXVlbmNlciAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuTGl2ZVBhZCAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL2NvbXBvbmVudHMvcGFkL0xpdmVQYWQuY29mZmVlJ1xuU2hhcmVNb2RhbCAgICAgICAgICAgICAgPSByZXF1aXJlICcuL2NvbXBvbmVudHMvc2hhcmUvU2hhcmVNb2RhbC5jb2ZmZWUnXG5CUE1JbmRpY2F0b3IgICAgICAgICAgICA9IHJlcXVpcmUgJy4vY29tcG9uZW50cy9CUE1JbmRpY2F0b3IuY29mZmVlJ1xudGVtcGxhdGUgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9jcmVhdGUtdGVtcGxhdGUuaGJzJ1xuXG5jbGFzcyBDcmVhdGVWaWV3IGV4dGVuZHMgVmlld1xuXG4gICMgVGhlIGNsYXNzIG5hbWUgZm9yIHRoZSBjbGFzc1xuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgY2xhc3NOYW1lOiAnY29udGFpbmVyLWNyZWF0ZSdcblxuICAjIFRoZSB0ZW1wbGF0ZVxuICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuXG4gIGV2ZW50czpcbiAgICAndG91Y2hlbmQgLmJ0bi1zaGFyZSc6ICdvblNoYXJlQnRuQ2xpY2snXG4gICAgJ3RvdWNoZW5kIC5idG4tZXhwb3J0JzogJ29uRXhwb3J0QnRuQ2xpY2snXG4gICAgJ3RvdWNoc3RhcnQgLmJ0bi1jbGVhcic6ICdvbkNsZWFyQnRuUHJlc3MnXG4gICAgJ3RvdWNoZW5kIC5idG4tY2xlYXInOiAnb25DbGVhckJ0bkNsaWNrJ1xuICAgICd0b3VjaHN0YXJ0IC5idG4tamFtLWxpdmUnOiAnb25KYW1MaXZlQnRuUHJlc3MnICMgTW9iaWxlIG9ubHlcbiAgICAndG91Y2hlbmQgLmJ0bi1qYW0tbGl2ZSc6ICdvbkphbUxpdmVCdG5DbGljaycgIyBNb2JpbGUgb25seVxuXG5cbiAgIyBSZW5kZXJzIHRoZSB2aWV3IGFuZCBhbGwgb2YgdGhlIGluZGl2aWR1YWwgY29tcG9uZW50cy4gIEFsc28gY2hlY2tzXG4gICMgZm9yIGEgYHNoYXJlSWRgIG9uIHRoZSBBcHBNb2RlbCBhbmQgaGlkZXMgZWxlbWVudHMgYXBwcm9wcmlhdGVseVxuICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG5cbiAgICBAcGxheVBhdXNlQnRuID0gbmV3IFBsYXlQYXVzZUJ0blxuICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgQHRvZ2dsZSA9IG5ldyBUb2dnbGVcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcblxuICAgIEBidWJibGVzVmlldyA9IG5ldyBCdWJibGVzVmlld1xuICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgQCRib2R5ID0gJCgnYm9keScpXG5cbiAgICBAJG1haW5Db250YWluZXIgPSBAJGJvZHkuZmluZCAnI2NvbnRhaW5lci1tYWluJ1xuICAgIEAkYm90dG9tQ29udGFpbmVyID0gQCRib2R5LmZpbmQgJyNjb250YWluZXItYm90dG9tJ1xuICAgIEAkd3JhcHBlciA9IEAkZWwuZmluZCAnLndyYXBwZXInXG4gICAgQCRraXRTZWxlY3RvckNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1raXQtc2VsZWN0b3InXG4gICAgQCR0b2dnbGVDb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItdG9nZ2xlJ1xuICAgIEAkcGxheVBhdXNlQ29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLXBsYXktcGF1c2UnXG4gICAgQCRzZXF1ZW5jZXJDb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItc2VxdWVuY2VyJ1xuICAgIEAkbGl2ZVBhZENvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1saXZlLXBhZCdcbiAgICBAJHBhdHRlcm5TZWxlY3RvckNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbHVtbi0yJ1xuICAgIEAkYnBtQ29udGFpbmVyID0gQCRlbC5maW5kICcuY29sdW1uLTMnXG5cbiAgICBAJGluc3RydW1lbnRTZWxlY3RvciA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5pbnN0cnVtZW50LXNlbGVjdG9yJ1xuICAgIEAkc2VxdWVuY2VyID0gQCRzZXF1ZW5jZXJDb250YWluZXIuZmluZCAnLnNlcXVlbmNlcidcbiAgICBAJGxpdmVQYWQgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcubGl2ZS1wYWQnXG4gICAgQCRwYXR0ZXJuU2VsZWN0b3IgPSBAJHNlcXVlbmNlckNvbnRhaW5lci5maW5kICcucGF0dGVybi1zZWxlY3RvcidcbiAgICBAJGJwbSA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5icG0nXG4gICAgQCRzaGFyZUJ0biA9IEAkc2VxdWVuY2VyQ29udGFpbmVyLmZpbmQgJy5idG4tc2hhcmUnXG5cbiAgICBAJHBsYXlQYXVzZUNvbnRhaW5lci5odG1sIEBwbGF5UGF1c2VCdG4ucmVuZGVyKCkuZWxcblxuICAgICMgRml4IHZpZXdwb3J0IGlmIG9uIFRhYmxldFxuICAgIFR3ZWVuTGl0ZS50byBAJGJvZHksIDAsXG4gICAgICBzY3JvbGxUb3A6IDBcbiAgICAgIHNjcm9sbExlZnQ6IDBcblxuICAgICMgTm8gdG9nZ2xlIG9uIG1vYmlsZVxuICAgIHVubGVzcyBAaXNNb2JpbGVcbiAgICAgIEAkdG9nZ2xlQ29udGFpbmVyLmh0bWwgQHRvZ2dsZS5yZW5kZXIoKS5lbFxuXG4gICAgIyBCdWlsZCBvdXQgcm93cyBmb3IgbmV3IGxheW91dFxuICAgIGlmIEBpc01vYmlsZVxuXG4gICAgICAjIFBhdXNlIGJ0biwgQlBNLCBTaGFyZSBidG5cbiAgICAgIEAkcm93MSA9IEAkZWwuZmluZCAnLnJvdy0xJ1xuXG4gICAgICAjIEtpdCBzZWxlY3RvciwgcGF0dGVybiBzZWxlY3RvclxuICAgICAgQCRyb3cyID0gQCRlbC5maW5kICcucm93LTInXG5cbiAgICAgICMgSW5zdHJ1bWVudCBTZWxlY3RvciwgTGl2ZXBhZCB0b2dnbGVcbiAgICAgIEAkcm93MyA9IEAkZWwuZmluZCAnLnJvdy0zJ1xuXG4gICAgICAjIFNlcXVlbmNlclxuICAgICAgQCRyb3c0ID0gQCRlbC5maW5kICcucm93LTQnXG5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50U2VsZWN0b3IoKVxuXG4gICAgICBfLmRlZmVyID0+XG4gICAgICAgIEBhcHBNb2RlbC5zZXQgJ3Nob3dTZXF1ZW5jZXInLCB0cnVlXG4gICAgICAgIEBpbnN0cnVtZW50U2VsZWN0b3IuaW5zdHJ1bWVudFZpZXdzWzBdLm9uQ2xpY2soKVxuXG4gICAgVHdlZW5MaXRlLnNldCBAJGJvdHRvbUNvbnRhaW5lciwgeTogMzAwXG5cbiAgICBAcmVuZGVyS2l0U2VsZWN0b3IoKVxuICAgIEByZW5kZXJTZXF1ZW5jZXIoKVxuICAgIEByZW5kZXJMaXZlUGFkKClcbiAgICBAcmVuZGVyUGF0dGVyblNlbGVjdG9yKClcbiAgICBAcmVuZGVyQlBNKClcblxuICAgIHVubGVzcyBAaXNNb2JpbGUgb3IgQGlzVGFibGV0IG9yIEJyb3dzZXJEZXRlY3QuaXNJRSgpXG4gICAgICBAcmVuZGVyQnViYmxlcygpXG5cbiAgICBAJGtpdFNlbGVjdG9yID0gQCRlbC5maW5kICcua2l0LXNlbGVjdG9yJ1xuXG4gICAgQFxuXG5cbiAgIyBTaG93IHRoZSB2aWV3IGFuZCBvcGVuIHRoZSBzZXF1ZW5jZXJcblxuICBzaG93OiA9PlxuICAgIEAkbWFpbkNvbnRhaW5lci5zaG93KClcbiAgICBAc2hvd1VJKClcbiAgICBAYXBwTW9kZWwuc2V0ICdzaG93U2VxdWVuY2VyJywgdHJ1ZVxuXG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBUd2VlbkxpdGUudG8gJCgnLnRvcC1iYXInKSwgLjMsIGF1dG9BbHBoYTogMVxuXG4gICAgICBUd2VlbkxpdGUuZnJvbVRvIEAkbWFpbkNvbnRhaW5lciwgLjQsIHk6IDEwMDAsXG4gICAgICAgIGltbWVkaWF0ZVJlbmRlcjogdHJ1ZVxuICAgICAgICB5OiBAcmV0dXJuTW92ZUFtb3VudCgpXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuICAgICAgICBkZWxheTogMVxuXG5cbiAgIyBIaWRlIHRoZSB2aWV3IGFuZCByZW1vdmUgaXQgZnJvbSB0aGUgRE9NXG5cbiAgaGlkZTogKG9wdGlvbnMpID0+XG4gICAgVHdlZW5MaXRlLmZyb21UbyBAJGVsLCAuMywgYXV0b0FscGhhOiAxLFxuICAgICAgYXV0b0FscGhhOiAwXG5cbiAgICBAa2l0U2VsZWN0b3IuaGlkZSgpXG4gICAgQGhpZGVVSSgpXG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIFR3ZWVuTGl0ZS50byAkKCcudG9wLWJhcicpLCAuMywgYXV0b0FscGhhOiAwXG5cbiAgICBpZiBAJGJvdHRvbUNvbnRhaW5lci5sZW5ndGhcbiAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRib3R0b21Db250YWluZXIsIC40LCB5OiAwLFxuICAgICAgICB5OiAzMDBcbiAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG4gICAgICAgIG9uQ29tcGxldGU6ID0+XG5cbiAgICAgICAgICBAYXBwTW9kZWwuc2V0XG4gICAgICAgICAgICAnc2hvd1NlcXVlbmNlcic6IG51bGxcbiAgICAgICAgICAgICdzaG93UGFkJzogbnVsbFxuXG4gICAgICAgICAgaWYgb3B0aW9ucz8ucmVtb3ZlXG4gICAgICAgICAgICBAcmVtb3ZlKClcblxuXG4gICMgRGVza3RvcCBvbmx5LiAgVHJpZ2dlcmVkIHdoZW4gc2hvd2luZyAvIGhpZGluZyB2aWV3IG9yIGV4cGFuZGluZ1xuICAjIHZpc3VhbGl6YXRpb24gb24gc2hhcmVcblxuICBzaG93VUk6IC0+XG4gICAgQGtpdFNlbGVjdG9yLnNob3coKVxuXG4gICAgVHdlZW5MaXRlLmZyb21UbyBAJGVsLCAuMywgYXV0b0FscGhhOiAwLFxuICAgICAgYXV0b0FscGhhOiAxXG4gICAgICBkZWxheTogLjNcblxuICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRib3R0b21Db250YWluZXIsIC40LCB5OiAzMDAsXG4gICAgICBhdXRvQWxwaGE6IDFcbiAgICAgIHk6IEByZXR1cm5Nb3ZlQW1vdW50KClcbiAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuICAgICAgZGVsYXk6IC4zXG5cblxuICAjIERlc2t0b3Agb25seS4gIFRyaWdnZXJlZCB3aGVuIHNob3dpbmcgLyBoaWRpbmcgdmlldyBvciBleHBhbmRpbmdcbiAgIyB2aXN1YWxpemF0aW9uIG9uIHNoYXJlXG5cbiAgaGlkZVVJOiAtPlxuICAgIEBraXRTZWxlY3Rvci5oaWRlKClcblxuICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRlbCwgLjMsIGF1dG9BbHBoYTogMSxcbiAgICAgIGF1dG9BbHBoYTogMFxuXG4gICAgVHdlZW5MaXRlLmZyb21UbyBAJGJvdHRvbUNvbnRhaW5lciwgLjQsIHk6IDAsXG4gICAgICB5OiAzMDBcbiAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuXG5cbiAgIyBSZW1vdmVzIHRoZSB2aWV3XG5cbiAgcmVtb3ZlOiAtPlxuICAgIEBwbGF5UGF1c2VCdG4ucmVtb3ZlKClcbiAgICBAcGxheVBhdXNlQnRuID0gbnVsbFxuXG4gICAgQHRvZ2dsZS5yZW1vdmUoKVxuICAgIEB0b2dnbGUgPSBudWxsXG5cbiAgICBAa2l0U2VsZWN0b3IucmVtb3ZlKClcbiAgICBAa2l0U2VsZWN0b3IgPSBudWxsXG5cbiAgICBAc2VxdWVuY2VyLnJlbW92ZSgpXG4gICAgQHNlcXVlbmNlciA9IG51bGxcblxuICAgIEBsaXZlUGFkLnJlbW92ZSgpXG4gICAgQGxpdmVQYWQgPSBudWxsXG5cbiAgICBAcGF0dGVyblNlbGVjdG9yLnJlbW92ZSgpXG4gICAgQHBhdHRlcm5TZWxlY3RvciA9IG51bGxcblxuICAgIEBicG0ucmVtb3ZlKClcbiAgICBAYnBtID0gbnVsbFxuXG4gICAgQGluc3RydW1lbnRTZWxlY3Rvcj8ucmVtb3ZlKClcbiAgICBAaW5zdHJ1bWVudFNlbGVjdG9yID0gbnVsbFxuXG4gICAgQHNoYXJlTW9kYWw/LnJlbW92ZSgpXG4gICAgQHNoYXJlTW9kYWwgPSBudWxsXG5cbiAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgZmFsc2VcblxuICAgICQoJy5jb250YWluZXIta2l0LXNlbGVjdG9yJykucmVtb3ZlKClcbiAgICBzdXBlcigpXG5cblxuICAjIEFkZHMgbGlzdGVuZXJzIHJlbGF0ZWQgdG8gZXhwb3J0aW5nIHRoZSB0cmFjayBwYXR0ZXJuXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1NIT1dfU0VRVUVOQ0VSLCBAb25TaG93U2VxdWVuY2VyQ2hhbmdlXG5cblxuICAjIFJlbW92ZXMgbGlzdGVuZXJzXG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgc3VwZXIoKVxuXG5cbiAgIyBSZW5kZXJzIHRoZSBraXQgc2VsZWN0b3IgY2Fyb3VzZWxcblxuICByZW5kZXJLaXRTZWxlY3RvcjogLT5cbiAgICBAa2l0U2VsZWN0b3IgPSBuZXcgS2l0U2VsZWN0b3JcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICBodG1sID0gQGtpdFNlbGVjdG9yLnJlbmRlcigpLmVsXG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIEAkcm93Mi5hcHBlbmQgaHRtbFxuICAgIGVsc2VcbiAgICAgIEAkbWFpbkNvbnRhaW5lci5wcmVwZW5kIGh0bWxcblxuXG4gICMgUmVuZGVycyB0aGUgaW5zdHJ1bWVudCBzZWxlY3RvciB3aGljaCwgb24gZGVza3RvcCwgZG9lcyBub3RoaW5nLCBidXQgb25cbiAgIyBtb2JpbGUgZm9jdXNlcyB0aGUgdHJhY2sgd2l0aGluIHRoZSB2aWV3XG5cbiAgcmVuZGVySW5zdHJ1bWVudFNlbGVjdG9yOiAtPlxuICAgIEBpbnN0cnVtZW50U2VsZWN0b3IgPSBuZXcgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWxcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICBAJHJvdzMucHJlcGVuZCBAaW5zdHJ1bWVudFNlbGVjdG9yLnJlbmRlcigpLmVsXG5cblxuICAjIFJlbmRlcnMgb3V0IHRoZSBwYXR0ZXJuIHNxdWFyZSBzZXF1ZW5jZXJcblxuICByZW5kZXJTZXF1ZW5jZXI6IC0+XG4gICAgQHNlcXVlbmNlciA9IG5ldyBTZXF1ZW5jZXJcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG4gICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvbi5hdCgwKS5nZXQoJ2luc3RydW1lbnRzJylcblxuICAgIGh0bWwgPSBAc2VxdWVuY2VyLnJlbmRlcigpLmVsXG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIEAkcm93NC5odG1sIGh0bWxcbiAgICBlbHNlXG4gICAgICBAJHNlcXVlbmNlci5wcmVwZW5kIGh0bWxcblxuICAgIEBsaXN0ZW5UbyBAc2VxdWVuY2VyLCBQdWJFdmVudC5CRUFULCBAb25CZWF0XG5cblxuICAjIFJlbmRlcnMgb3V0IHRoZSBsaXZlIHBhZCBwbGF5ZXJcblxuICByZW5kZXJMaXZlUGFkOiAtPlxuICAgIEBsaXZlUGFkID0gbmV3IExpdmVQYWRcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgIGtpdENvbGxlY3Rpb246IEBraXRDb2xsZWN0aW9uXG5cbiAgICBodG1sID0gQGxpdmVQYWQucmVuZGVyKCkuZWxcblxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgQCRsaXZlUGFkQ29udGFpbmVyLmh0bWwgaHRtbFxuICAgIGVsc2VcbiAgICAgIEAkbGl2ZVBhZC5odG1sIGh0bWxcblxuICAgIEBsaXN0ZW5UbyBAbGl2ZVBhZCwgUHViRXZlbnQuQkVBVCwgQG9uQmVhdFxuXG5cbiAgIyBSZW5kZXIgdGhlIHByZS1wb3B1bGF0ZWQgcGF0dGVybiBzZWxlY3RvclxuXG4gIHJlbmRlclBhdHRlcm5TZWxlY3RvcjogLT5cbiAgICBAcGF0dGVyblNlbGVjdG9yID0gbmV3IFBhdHRlcm5TZWxlY3RvclxuICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuICAgICAgc2VxdWVuY2VyOiBAc2VxdWVuY2VyXG5cbiAgICBodG1sID0gQHBhdHRlcm5TZWxlY3Rvci5yZW5kZXIoKS5lbFxuXG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBAJHJvdzIuYXBwZW5kIGh0bWxcbiAgICBlbHNlXG4gICAgICBAJHBhdHRlcm5TZWxlY3Rvci5odG1sIGh0bWxcblxuXG4gICMgUmVuZGVycyBvdXQgdGhlIEJQTSBpbnRlcmZhY2UgZm9yIGNvbnRyb2xsaW5nIHRlbXBvXG5cbiAgcmVuZGVyQlBNOiAtPlxuICAgIEBicG0gPSBuZXcgQlBNSW5kaWNhdG9yXG4gICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICBodG1sID0gQGJwbS5yZW5kZXIoKS5lbFxuXG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBAJHJvdzEuYXBwZW5kIGh0bWxcbiAgICBlbHNlXG4gICAgICBAJGJwbS5odG1sIGh0bWxcblxuXG4gIHJlbmRlckJ1YmJsZXM6IC0+XG4gICAgQCRtYWluQ29udGFpbmVyLnByZXBlbmQgQnViYmxlcy5pbml0aWFsaXplKClcblxuXG4gICMgUmVuZGVycyBvdXQgdGhlIHNoYXJlIG1vZGFsIHdoaWNoIHRoZW4gcG9zdHMgdG8gUGFyc2VcblxuICByZW5kZXJTaGFyZU1vZGFsOiAtPlxuICAgIEBzaGFyZU1vZGFsID0gbmV3IFNoYXJlTW9kYWxcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgIHNoYXJlZFRyYWNrTW9kZWw6IEBzaGFyZWRUcmFja01vZGVsXG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIEAkbWFpbkNvbnRhaW5lci5hcHBlbmQgQHNoYXJlTW9kYWwucmVuZGVyKCkuZWxcblxuICAgICAgIyBTbGlkZSBtYWluIGNvbnRhaW5lciB1cCBhbmQgdGhlbiBvcGVuIHNoYXJlXG4gICAgICBUd2VlbkxpdGUudG8gQCRzZXF1ZW5jZXJDb250YWluZXIsIC42LFxuICAgICAgICB5OiAtd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cbiAgICBlbHNlXG4gICAgICBAJGJvZHkucHJlcGVuZCBAc2hhcmVNb2RhbC5yZW5kZXIoKS5lbFxuXG4gICAgQHNoYXJlTW9kYWwuc2hvdygpXG5cbiAgICBAbGlzdGVuVG8gQHNoYXJlTW9kYWwsIEFwcEV2ZW50LlNBVkVfVFJBQ0ssIEBvblNhdmVUcmFja1xuICAgIEBsaXN0ZW5UbyBAc2hhcmVNb2RhbCwgQXBwRXZlbnQuQ0xPU0VfU0hBUkUsIEBvbkNsb3NlU2hhcmVcblxuXG4gICMgRXZlbnQgaGFuZGxlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLVxuXG4gICMgSGFuZGxlciBmb3IgYmVhdHMgd2hpY2ggYXJlIHBpcGVkIGRvd24gZnJvbSBQYXR0ZXJuU3F1YXJlIHRvIFZpc3VhbGl6YXRpb25WaWV3XG4gICMgQHBhcmFtIHtPYmplY3R9IHBhcmFtcyBXaGljaCBjb25zaXN0IG9mIFBhdHRlcm5TcXVhcmVNb2RlbCBmb3IgaGFuZGxpbmcgdmVsb2NpdHksIGV0Y1xuXG4gIG9uQmVhdDogKHBhcmFtcykgPT5cbiAgICBAdHJpZ2dlciBQdWJFdmVudC5CRUFULCBwYXJhbXNcblxuICAgIHVubGVzcyBAaXNNb2JpbGVcbiAgICAgIEJ1YmJsZXMuYmVhdCgpXG5cblxuICAjIEhhbmRsZXIgZm9yIHNhdmluZywgc2hhcmluZyBhbmQgcG9zdGluZyBhIHRyYWNrXG5cbiAgb25TYXZlVHJhY2s6ID0+XG4gICAgQHRyaWdnZXIgQXBwRXZlbnQuU0FWRV9UUkFDSywgc2hhcmVkVHJhY2tNb2RlbDogQHNoYXJlZFRyYWNrTW9kZWxcblxuXG4gICMgSGFuZGxlciBmb3Igc2hhcmUgYnV0dG9uIGNsaWNrcy4gIENyZWF0ZXMgdGhlIG1vZGFsIGFuZCBwcm9tcHRzIHRoZSB1c2VyXG4gICMgdG8gZW50ZXIgaW5mbyByZWxhdGVkIHRvIHRoZWlyIGNyZWF0aW9uXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uU2hhcmVCdG5DbGljazogKGV2ZW50KSA9PlxuICAgIEB0cmlnZ2VyIEFwcEV2ZW50Lk9QRU5fU0hBUkVcbiAgICBAcmVuZGVyU2hhcmVNb2RhbCgpXG5cblxuICAjIEhhbmRsZXIgZm9yIHByZXNzLXN0YXRlcyBvbiBtb2JpbGVcbiAgIyBAcGFyYW0ge0V2ZW50fSBldmVudFxuXG4gIG9uQ2xlYXJCdG5QcmVzczogKGV2ZW50KSAtPlxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0KS5hZGRDbGFzcyAncHJlc3MnXG5cblxuICAjIEhhbmRsZXIgZm9yIHJlc2V0dGluZyB0aGUgcGF0dGVybiB0cmFjayB0byBkZWZhdWx0LCBibGFuayBzdGF0ZVxuICAjIEBwYXJhbSB7TW91c2VFdmVudHxUb3VjaEV2ZW50fSBldmVudFxuXG4gIG9uQ2xlYXJCdG5DbGljazogKGV2ZW50KSA9PlxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyAncHJlc3MnXG5cbiAgICAjIFdoZW4gdXNlciBpcyBpbiBTZXF1ZW5jZXIgbW9kZVxuICAgIGlmIEBhcHBNb2RlbC5nZXQgJ3Nob3dTZXF1ZW5jZXInXG4gICAgICBAYXBwTW9kZWwuc2V0ICdzaGFyZWRUcmFja01vZGVsJywgbnVsbFxuXG4gICAgICAjIFJlbW92ZSBwcmVzZXQgaWYgY3VycmVudGx5IHNlbGVjdGVkXG4gICAgICBAcGF0dGVyblNlbGVjdG9yLiRlbC5maW5kKCcuc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG4gICAgICBAc2VxdWVuY2VyLnJlbmRlclRyYWNrcygpXG5cbiAgICAjIEZpcmVkIHdoZW4gdGhlIHVzZXIgaW4gdGhlIExpdmVQYWQgbW9kZWxcbiAgICBlbHNlXG4gICAgICBAbGl2ZVBhZC5jbGVhckxpdmVQYWQoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBjbG9zZSBidG4gZXZlbnQgb24gdGhlIHNoYXJlIG1vZGFsLCBhcyBkaXNwYXRjaGVkIGZyb20gdGhlIFNoYXJlTW9kYWxcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgb25DbG9zZVNoYXJlOiAoZXZlbnQpID0+XG4gICAgQHRyaWdnZXIgQXBwRXZlbnQuQ0xPU0VfU0hBUkVcbiAgICBAc3RvcExpc3RlbmluZyBAc2hhcmVNb2RhbFxuXG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBUd2VlbkxpdGUudG8gQCRzZXF1ZW5jZXJDb250YWluZXIsIC42LFxuICAgICAgICB5OiAwXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cblxuICAjIEhhbmRsZXIgZm9yIHNob3dpbmcgc2VxdWVuY2VyIC8gcGFkLiAgSWYgc2VxIGlzIGZhbHNlLCB0aGVuIHBhZCBpcyBzaG93blxuICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgb25TaG93U2VxdWVuY2VyQ2hhbmdlOiAobW9kZWwpID0+XG5cbiAgICAjIFNsaWRlIHRoZSBzZXF1ZW5jZXIgaW5cbiAgICBpZiBtb2RlbC5jaGFuZ2VkLnNob3dTZXF1ZW5jZXJcbiAgICAgIGlmIEBwcmV2Vm9sdW1lIHRoZW4gY3JlYXRlanMuU291bmQuc2V0Vm9sdW1lIEBwcmV2Vm9sdW1lXG5cbiAgICAgIEBzaG93U2VxdWVuY2VyKClcblxuICAgICMgU2xpZGUgdGhlIGxpdmUgcGFkIGluXG4gICAgZWxzZVxuXG4gICAgICAjIEVuc3VyZSB0aGF0IHZvbHVtZSBpcyBhbHdheXMgdXAgZm9yIHRoZSBMaXZlUGFkXG4gICAgICBAcHJldlZvbHVtZSA9IGNyZWF0ZWpzLlNvdW5kLmdldFZvbHVtZSgpXG4gICAgICBjcmVhdGVqcy5Tb3VuZC5zZXRWb2x1bWUgMVxuXG4gICAgICBAc2hvd0xpdmVQYWQoKVxuXG5cbiAgIyBNT0JJTEUgT05MWS4gIEhhbmRsZXIgZm9yIHNob3dpbmcgdGhlIGxpdmUgcGFkIGZyb20gbW9iaWxlIHZpZXdcbiAgIyBAcGFyYW0ge1RvdWNoRXZlbnR9IGV2ZW50XG5cbiAgb25KYW1MaXZlQnRuUHJlc3M6IChldmVudCkgPT5cbiAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzICdwcmVzcydcblxuXG4gICMgTU9CSUxFIE9OTFkuICBIYW5kbGVyIGZvciBzaG93aW5nIHRoZSBsaXZlIHBhZCBmcm9tIG1vYmlsZSB2aWV3XG4gICMgQHBhcmFtIHtUb3VjaEV2ZW50fSBldmVudFxuXG4gIG9uSmFtTGl2ZUJ0bkNsaWNrOiAoZXZlbnQpID0+XG4gICAgJChldmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyAncHJlc3MnXG4gICAgQGFwcE1vZGVsLnNldCAnc2hvd1NlcXVlbmNlcicsIGZhbHNlXG5cblxuXG4gICMgUHJpdmF0ZVxuICAjIC0tLS0tLS1cblxuICAjIENoZWNrIGFnYWluc3QgQ29rZSBuYXYgcGxheWxpc3QgaXRlbXNcblxuICByZXR1cm5Nb3ZlQW1vdW50OiAtPlxuICAgIG1vdmVBbW91bnQgPSBpZiAkKCcucGxpdGVtJykubGVuZ3RoID4gMCB0aGVuIC0zMCBlbHNlIDBcblxuXG4gICMgU3dhcHMgdGhlIGxpdmUgcGFkIG91dCB3aXRoIHRoZSBzZXF1ZW5jZXJcblxuICBzaG93U2VxdWVuY2VyOiAtPlxuICAgIHR3ZWVuVGltZSA9IC42XG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIFR3ZWVuTGl0ZS50byBAJHNlcXVlbmNlckNvbnRhaW5lciwgdHdlZW5UaW1lLFxuICAgICAgICB4OiAwXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuXG4gICAgICBUd2VlbkxpdGUudG8gQCRsaXZlUGFkQ29udGFpbmVyLCB0d2VlblRpbWUsXG4gICAgICAgIHg6IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuXG4gICAgZWxzZVxuICAgICAgVHdlZW5MaXRlLnRvIEAkc2VxdWVuY2VyLCB0d2VlblRpbWUsXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICB4OiAwXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cbiAgICAgIFR3ZWVuTGl0ZS50byBAJGxpdmVQYWQsIHR3ZWVuVGltZSxcbiAgICAgICAgYXV0b0FscGhhOiAwXG4gICAgICAgIHg6IDIwMDBcbiAgICAgICAgZWFzZTogRXhwby5lYXNlSW5PdXRcblxuXG4gICMgU3dhcHMgdGhlIHNlcXVlbmNlciBhcmVhIG91dCB3aXRoIHRoZSBsaXZlIHBhZFxuXG4gIHNob3dMaXZlUGFkOiAtPlxuICAgIHR3ZWVuVGltZSA9IC42XG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIFR3ZWVuTGl0ZS50byBAJHNlcXVlbmNlckNvbnRhaW5lciwgdHdlZW5UaW1lLFxuICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgeDogLXdpbmRvdy5pbm5lcldpZHRoXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cbiAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRsaXZlUGFkQ29udGFpbmVyLCB0d2VlblRpbWUsIHg6IHdpbmRvdy5pbm5lcldpZHRoLFxuICAgICAgICBhdXRvQWxwaGE6IDFcbiAgICAgICAgeDogMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuXG4gICAgZWxzZVxuICAgICAgVHdlZW5MaXRlLnRvIEAkc2VxdWVuY2VyLCB0d2VlblRpbWUsXG4gICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICB4OiAtMjAwMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuXG4gICAgICBUd2VlbkxpdGUudG8gQCRsaXZlUGFkLCB0d2VlblRpbWUsXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICB4OiAwXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDcmVhdGVWaWV3XG4iLCIjIyMqXG4gKiBCZWF0cyBwZXIgbWludXRlIHZpZXcgZm9yIGhhbmRsaW5nIHRlbXBvXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICAzLjE4LjE0XG4jIyNcblxuQXBwQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vLi4vY29uZmlnL0FwcENvbmZpZy5jb2ZmZWUnXG5BcHBFdmVudCAgPSByZXF1aXJlICcuLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvYnBtLXRlbXBsYXRlLmhicydcblxuY2xhc3MgQlBNSW5kaWNhdG9yIGV4dGVuZHMgVmlld1xuXG4gICMgQW5pbWF0aW9uIHJvdGF0aW9uIHRpbWUgZm9yIGJvdHRsZWNhcFxuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgUk9UQVRFX1RXRUVOX1RJTUU6IC40XG5cbiAgIyBDbGFzcyBuYW1lIG9mIGNvbnRhaW5lclxuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgY2xhc3NOYW1lOiAnY29udGFpbmVyLWJwbSdcblxuICAjIFJlZiB0byB0aGUgbWFpbiBBcHBNb2RlbFxuICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICBhcHBNb2RlbDogbnVsbFxuXG4gICMgVmlldyB0ZW1wbGF0ZVxuICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuICAjIFRoZSBzZXRJbnRlcnZhbCB1cGRhdGUgaW50ZXJ2YWwgZm9yIGluY3JlYXNpbmcgYW5kXG4gICMgZGVjcmVhc2luZyBCUE0gb24gcHJlc3MgLyB0b3VjaFxuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgaW50ZXJ2YWxVcGRhdGVUaW1lOiA3MFxuXG4gICMgVGhlIHNldEludGVydmFsIHVwZGF0ZXJcbiAgIyBAdHlwZSB7U2V0SW50ZXJ2YWx9XG5cbiAgdXBkYXRlSW50ZXJ2YWw6IG51bGxcblxuICAjIFRoZSBhbW91bnQgdG8gaW5jcmVhc2UgdGhlIEJQTSBieSBvbiBlYWNoIHRpY2tcbiAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gIGJwbUluY3JlYXNlQW1vdW50OiAxMFxuXG4gICMgVGhlIGN1cnJlbnQgYnBtIGJlZm9yZSBpdHMgc2V0IG9uIHRoZSBtb2RlbC4gIFVzZWQgdG8gYnVmZmVyXG4gICMgdXBkYXRlcyBhbmQgdG8gcHJvdmlkZSBmb3Igc21vb3RoIGFuaW1hdGlvblxuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgY3VyckJQTTogbnVsbFxuXG5cbiAgZXZlbnRzOlxuICAgICd0b3VjaHN0YXJ0IC5idG4taW5jcmVhc2UnOiAnb25JbmNyZWFzZUJ0bkRvd24nXG4gICAgJ3RvdWNoc3RhcnQgLmJ0bi1kZWNyZWFzZSc6ICdvbkRlY3JlYXNlQnRuRG93bidcbiAgICAndG91Y2hlbmQgICAuYnRuLWluY3JlYXNlJzogJ29uQnRuVXAnXG4gICAgJ3RvdWNoZW5kICAgLmJ0bi1kZWNyZWFzZSc6ICdvbkJ0blVwJ1xuICAgICd0b3VjaGVuZCAgIC53cmFwcGVyJzogJ29uQnRuVXAnXG4gICAgJ21vdXNldXAgICAgLndyYXBwZXInOiAnb25CdG5VcCdcblxuXG4gICMgUmVuZGVyIHRoZSB2aWV3IGFuZCB1cGRhdGUgdGhlIGtpdCBpZiBub3QgYWxyZWFkeVxuICAjIHNldCB2aWEgYSBwcmV2aW91cyBzZXNzaW9uXG4gICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEAkYnBtTGFiZWwgPSBAJGVsLmZpbmQgJy5icG0tdmFsdWUnXG4gICAgQGluY3JlYXNlQnRuID0gQCRlbC5maW5kICcuYnRuLWluY3JlYXNlJ1xuICAgIEBkZWNyZWFzZUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1kZWNyZWFzZSdcbiAgICBAJGJnQ2lyY2xlID0gQCRlbC5maW5kICcuYmctY2lyY2xlJ1xuXG4gICAgQGN1cnJCUE0gPSBAYXBwTW9kZWwuZ2V0KCdicG0nKVxuICAgIEAkYnBtTGFiZWwudGV4dCBAY3VyckJQTVxuXG4gICAgdW5sZXNzIEBpc01vYmlsZVxuICAgICAgVHdlZW5MaXRlLnNldCBAJGJnQ2lyY2xlLCByb3RhdGlvbjogMFxuXG4gICAgQFxuXG5cbiAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kaW5nIGNoYW5nZXMgcmVsYXRlZCB0b1xuICAjIHN3aXRjaGluZyBCUE1cblxuICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfQlBNLCBAb25CUE1DaGFuZ2VcblxuXG4gICMgU2V0cyBhbiBpbnRlcnZhbCB0byBpbmNyZWFzZSB0aGUgQlBNIG1vbml0b3IuICBDbGVhcnNcbiAgIyB3aGVuIHRoZSB1c2VyIHJlbGVhc2VzIHRoZSBtb3VzZVxuXG4gIGluY3JlYXNlQlBNOiAtPlxuICAgIGNsZWFySW50ZXJ2YWwgQHVwZGF0ZUludGVydmFsXG5cbiAgICBAdXBkYXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCA9PlxuICAgICAgYnBtID0gQGN1cnJCUE1cblxuICAgICAgaWYgYnBtIDwgQXBwQ29uZmlnLkJQTV9NQVhcbiAgICAgICAgYnBtICs9IEBicG1JbmNyZWFzZUFtb3VudFxuXG4gICAgICBlbHNlXG4gICAgICAgIGJwbSA9IEFwcENvbmZpZy5CUE1fTUFYXG5cbiAgICAgIEBjdXJyQlBNID0gYnBtXG4gICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cblxuICAgICAgdW5sZXNzIEBpc01vYmlsZVxuICAgICAgICBUd2VlbkxpdGUudG8gQCRiZ0NpcmNsZSwgQFJPVEFURV9UV0VFTl9USU1FLCByb3RhdGlvbjogR3JlZW5Qcm9wLnJvdGF0aW9uKEAkYmdDaXJjbGUpICsgOTBcblxuICAgICwgQGludGVydmFsVXBkYXRlVGltZVxuXG5cbiAgIyBTZXRzIGFuIGludGVydmFsIHRvIGRlY3JlYXNlIHRoZSBCUE0gbW9uaXRvci4gIENsZWFyc1xuICAjIHdoZW4gdGhlIHVzZXIgcmVsZWFzZXMgdGhlIG1vdXNlXG5cbiAgZGVjcmVhc2VCUE06IC0+XG4gICAgY2xlYXJJbnRlcnZhbCBAdXBkYXRlSW50ZXJ2YWxcblxuICAgIEB1cGRhdGVJbnRlcnZhbCA9IHNldEludGVydmFsID0+XG4gICAgICBicG0gPSBAY3VyckJQTVxuXG4gICAgICBpZiBicG0gPiAxXG4gICAgICAgIGJwbSAtPSBAYnBtSW5jcmVhc2VBbW91bnRcblxuICAgICAgZWxzZVxuICAgICAgICBicG0gPSAxXG5cbiAgICAgIEBjdXJyQlBNID0gYnBtXG4gICAgICBAJGJwbUxhYmVsLnRleHQgQGN1cnJCUE1cblxuICAgICAgdW5sZXNzIEBpc01vYmlsZVxuICAgICAgICBUd2VlbkxpdGUudG8gQCRiZ0NpcmNsZSwgQFJPVEFURV9UV0VFTl9USU1FLCByb3RhdGlvbjogR3JlZW5Qcm9wLnJvdGF0aW9uKEAkYmdDaXJjbGUpIC0gOTBcblxuICAgICwgQGludGVydmFsVXBkYXRlVGltZVxuXG5cbiAgIyBFdmVudCBoYW5kbGVyc1xuICAjIC0tLS0tLS0tLS0tLS0tXG5cbiAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcbiAgIyBAcGFyYW0ge0V2ZW50fVxuXG4gIG9uSW5jcmVhc2VCdG5Eb3duOiAoZXZlbnQpID0+XG4gICAgQGluY3JlYXNlQlBNKClcblxuXG4gICMgSGFuZGxlciBmb3IgbGVmdCBidXR0b24gY2xpY2tzLiAgVXBkYXRlcyB0aGUgY29sbGVjdGlvbiBhbmRcbiAgIyBzZXRzIGEgbmV3IGtpdE1vZGVsIG9uIHRoZSBtYWluIEFwcE1vZGVsXG4gICMgQHBhcmFtIHtFdmVudH1cblxuICBvbkRlY3JlYXNlQnRuRG93bjogKGV2ZW50KSAtPlxuICAgIEBkZWNyZWFzZUJQTSgpXG5cblxuICAjIEhhbmRsZXIgZm9yIG1vdXNlIC8gdG91Y2h1cCBldmVudHMuICBDbGVhcnMgdGhlIGludGVydmFsXG4gICMgQHBhcmFtIHtFdmVudH1cblxuICBvbkJ0blVwOiAoZXZlbnQpIC0+XG4gICAgY2xlYXJJbnRlcnZhbCBAdXBkYXRlSW50ZXJ2YWxcbiAgICBAdXBkYXRlSW50ZXJ2YWwgPSBudWxsXG5cbiAgICBAYXBwTW9kZWwuc2V0ICdicG0nLCAoTWF0aC5mbG9vcig2MDAwMCAvIEBjdXJyQlBNKSAqIC41KVxuXG5cbiAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGxhYmVsIG9uIHRoZVxuICAjIGtpdCBzZWxlY3RvclxuXG4gIG9uQlBNQ2hhbmdlOiAobW9kZWwpIC0+XG4gICAgYnBtID0gbW9kZWwuY2hhbmdlZC5icG1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEJQTUluZGljYXRvclxuIiwiIyMjKlxuICogS2l0IHNlbGVjdG9yIGZvciBzd2l0Y2hpbmcgYmV0d2VlbiBkcnVtLWtpdCBzb3VuZHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMva2l0LXNlbGVjdGlvbi10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIEtpdFNlbGVjdG9yIGV4dGVuZHMgVmlld1xuXG4gIGNsYXNzTmFtZTogJ2NvbnRhaW5lci1raXQtc2VsZWN0b3InXG5cbiAgIyBSZWYgdG8gdGhlIG1haW4gQXBwTW9kZWxcbiAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgYXBwTW9kZWw6IG51bGxcblxuICAjIFJlZiB0byB0aGUgS2l0Q29sbGVjdGlvbiBmb3IgdXBkYXRpbmcgc291bmRzXG4gICMgQHR5cGUge0tpdENvbGxlY3Rpb259XG5cbiAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG4gICMgVGhlIGN1cnJlbnQga2l0XG4gICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gIGtpdE1vZGVsOiBudWxsXG5cbiAgIyBWaWV3IHRlbXBsYXRlXG4gICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgZXZlbnRzOlxuICAgICd0b3VjaHN0YXJ0IC5idG4nOiAnb25CdG5QcmVzcydcbiAgICAndG91Y2hlbmQgLmJ0bi1sZWZ0JzogJ29uTGVmdEJ0bkNsaWNrJ1xuICAgICd0b3VjaGVuZCAuYnRuLXJpZ2h0JzogJ29uUmlnaHRCdG5DbGljaydcblxuXG4gICMgUmVuZGVyIHRoZSB2aWV3IGFuZCB1cGRhdGUgdGhlIGtpdCBpZiBub3QgYWxyZWFkeVxuICAjIHNldCB2aWEgYSBwcmV2aW91cyBzZXNzaW9uXG4gICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEAka2l0TGFiZWwgPSBAJGVsLmZpbmQoJy5sYWJlbC1raXQnKS5maW5kICdkaXYnXG5cbiAgICBpZiBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpIGlzIG51bGxcbiAgICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uYXQoMClcblxuICAgIEAka2l0TGFiZWwudGV4dCBAYXBwTW9kZWwuZ2V0KCdraXRNb2RlbCcpLmdldCAnbGFiZWwnXG5cbiAgICBAXG5cblxuICBzaG93OiAtPlxuICAgIHVubGVzcyBAaXNNb2JpbGVcblxuICAgICAgVHdlZW5MaXRlLmZyb21UbyBAJGVsLCAuNCwgeTogLTEwMCxcbiAgICAgICAgeTogMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VPdXRcbiAgICAgICAgZGVsYXk6IC4zXG5cblxuICBoaWRlOiAtPlxuICAgIHVubGVzcyBAaXNNb2JpbGVcbiAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRlbCwgLjQsIHk6IDAsXG4gICAgICAgIHk6IC0xMDBcbiAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG5cblxuICAjIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGhhbmRpbmcgY2hhbmdlcyByZWxhdGVkIHRvXG4gICMgc3dpdGNoaW5nIGRydW0ga2l0c1xuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9LSVQsIEBvbkNoYW5nZUtpdFxuXG5cbiAgIyBFdmVudCBoYW5kbGVyc1xuICAjIC0tLS0tLS0tLS0tLS0tXG5cbiAgb25CdG5QcmVzczogKGV2ZW50KSAtPlxuICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkuYWRkQ2xhc3MgJ3ByZXNzJ1xuXG5cbiAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcblxuICBvbkxlZnRCdG5DbGljazogKGV2ZW50KSAtPlxuICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MgJ3ByZXNzJ1xuICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ucHJldmlvdXNLaXQoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBsZWZ0IGJ1dHRvbiBjbGlja3MuICBVcGRhdGVzIHRoZSBjb2xsZWN0aW9uIGFuZFxuICAjIHNldHMgYSBuZXcga2l0TW9kZWwgb24gdGhlIG1haW4gQXBwTW9kZWxcblxuICBvblJpZ2h0QnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzICdwcmVzcydcbiAgICBAYXBwTW9kZWwuc2V0ICdraXRNb2RlbCcsIEBraXRDb2xsZWN0aW9uLm5leHRLaXQoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGxhYmVsIG9uIHRoZVxuICAjIGtpdCBzZWxlY3RvclxuXG4gIG9uQ2hhbmdlS2l0OiAobW9kZWwpIC0+XG4gICAgQGtpdE1vZGVsID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbFxuXG4gICAgZGVsYXkgPSBpZiBAaXNNb2JpbGUgdGhlbiAuNSBlbHNlIDBcblxuICAgIFR3ZWVuTGl0ZS50byBAJGtpdExhYmVsLCAuMixcbiAgICAgIHk6IC0yMFxuICAgICAgZWFzZTogRXhwby5lYXNlSW5cbiAgICAgIGRlbGF5OiBkZWxheVxuXG4gICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICBAJGtpdExhYmVsLnRleHQgQGtpdE1vZGVsLmdldCAnbGFiZWwnXG4gICAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRraXRMYWJlbCwgLjIsIHsgeTogMjAgfSxcbiAgICAgICAgICB5OiAwXG4gICAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBLaXRTZWxlY3RvclxuIiwiIyMjKlxuICogUGF0dGVybiBzZWxlY3RvciBmb3IgcHJlcG9wdWxhdGluZyB0cmFja3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDQuMS4xNFxuIyMjXG5cbkFwcENvbmZpZyAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuU2hhcmVkVHJhY2tNb2RlbCA9IHJlcXVpcmUgJy4uLy4uLy4uL21vZGVscy9TaGFyZWRUcmFja01vZGVsLmNvZmZlZSdcblZpZXcgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5wcmVzZXRzICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vY29uZmlnL1ByZXNldHMnXG50ZW1wbGF0ZSAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGF0dGVybi1zZWxlY3Rvci10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIFBhdHRlcm5TZWxlY3RvciBleHRlbmRzIFZpZXdcblxuICBjbGFzc05hbWU6ICdjb250YWluZXItcGF0dGVybi1zZWxlY3RvcidcbiAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIEBzZWxlY3RlZEluZGV4OiAtMVxuXG4gIGV2ZW50czpcbiAgICAndG91Y2hzdGFydCAuYnRuJzogJ29uQnRuUHJlc3MnXG4gICAgJ3RvdWNoZW5kIC5idG4nOiAnb25CdG5DbGljaydcblxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEBwcmVzZXRNb2RlbHMgPSBfLm1hcCBwcmVzZXRzLCAocHJlc2V0KSAtPlxuICAgICAgbmV3IFNoYXJlZFRyYWNrTW9kZWwgcHJlc2V0LnRyYWNrXG5cblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEAkYnRucyA9IEAkZWwuZmluZCAnLmJ0bidcblxuICAgIEBcblxuXG4gIG9uQnRuUHJlc3M6IChldmVudCkgLT5cbiAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzICdwcmVzcydcblxuXG4gIG9uQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICBzZWxmID0gQFxuXG4gICAgJGJ0biA9ICQoZXZlbnQuY3VycmVudFRhcmdldClcbiAgICAkYnRuLnJlbW92ZUNsYXNzICdwcmVzcydcblxuICAgICMgRGVzZWxlY3QgY3VycmVudCBidXR0b25zXG4gICAgQCRidG5zLmVhY2ggKGluZGV4KSAtPlxuICAgICAgaWYgJGJ0bi50ZXh0KCkgaXNudCAkKEApLnRleHQoKVxuICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcbiAgICAgIGVsc2VcbiAgICAgICAgc2VsZi5zZWxlY3RlZEluZGV4ID0gaW5kZXhcblxuICAgICMgQWxsb3cgZm9yIHNlbGVjdGlvbiBhbmQgZGUtc2VsZWN0aW9uXG4gICAgaWYgJGJ0bi5oYXNDbGFzcygnc2VsZWN0ZWQnKSBpcyBmYWxzZVxuICAgICAgJGJ0bi5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cbiAgICAjIERlc2VsZWN0IGFuZCBjbGVhciBjdXJyZW50IHBhdHRlcm5cbiAgICBlbHNlXG4gICAgICAkYnRuLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcbiAgICAgIHNlbGYuc2VsZWN0ZWRJbmRleCA9IC0xXG5cbiAgICBAaW1wb3J0VHJhY2soKVxuXG5cbiAgaW1wb3J0VHJhY2s6IC0+XG4gICAgaWYgQHNlbGVjdGVkSW5kZXggaXNudCAtMVxuICAgICAgc2hhcmVkVHJhY2tNb2RlbCA9IEBwcmVzZXRNb2RlbHNbQHNlbGVjdGVkSW5kZXhdXG5cbiAgICAgIEBhcHBNb2RlbC5zZXRcbiAgICAgICAgJ2JwbSc6IHNoYXJlZFRyYWNrTW9kZWwuZ2V0ICdicG0nXG4gICAgICAgICdzaGFyZWRUcmFja01vZGVsJzogc2hhcmVkVHJhY2tNb2RlbFxuXG4gICAgICAjIEltcG9ydCBpbnRvIHNlcXVlbmNlclxuICAgICAgQHNlcXVlbmNlci5pbXBvcnRUcmFja1xuICAgICAgICBraXRUeXBlOiBzaGFyZWRUcmFja01vZGVsLmdldCAna2l0VHlwZSdcbiAgICAgICAgaW5zdHJ1bWVudHM6IHNoYXJlZFRyYWNrTW9kZWwuZ2V0ICdpbnN0cnVtZW50cydcbiAgICAgICAgcGF0dGVyblNxdWFyZUdyb3Vwczogc2hhcmVkVHJhY2tNb2RlbC5nZXQgJ3BhdHRlcm5TcXVhcmVHcm91cHMnXG5cbiAgICBlbHNlXG4gICAgICBAYXBwTW9kZWwuc2V0XG4gICAgICAgICdicG0nOiAxMjBcbiAgICAgICAgJ3NoYXJlZFRyYWNrTW9kZWwnOiBudWxsXG5cbiAgICAgIEBzZXF1ZW5jZXIucmVuZGVyVHJhY2tzKClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5TZWxlY3RvclxuIiwiIyMjKlxuICogUGxheSAvIFBhdXNlIGJ1dHRvbiB0b2dnbGVcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wbGF5LXBhdXNlLXRlbXBsYXRlLmhicydcblxuY2xhc3MgUGxheVBhdXNlQnRuIGV4dGVuZHMgVmlld1xuXG4gIGNsYXNzTmFtZTogJ2J0bi1wbGF5LXBhdXNlJ1xuICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuICBldmVudHM6XG4gICAgJ21vdXNlb3ZlciAuYnRuLXBsYXknOiAnb25Nb3VzZU92ZXInXG4gICAgJ21vdXNlb3ZlciAuYnRuLXBhdXNlJzogJ29uTW91c2VPdmVyJ1xuICAgICdtb3VzZW91dCAuYnRuLXBsYXknOiAnb25Nb3VzZU91dCdcbiAgICAnbW91c2VvdXQgLmJ0bi1wYXVzZSc6ICdvbk1vdXNlT3V0J1xuICAgICd0b3VjaGVuZCc6ICdvbkNsaWNrJ1xuXG5cbiAgIyBSZW5kZXIgdGhlIHZpZXdcblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEAkcGxheUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1wbGF5J1xuICAgIEAkcGF1c2VCdG4gPSBAJGVsLmZpbmQgJy5idG4tcGF1c2UnXG4gICAgQCRsYWJlbCA9IEAkZWwuZmluZCAnLmxhYmVsLWJ0bidcblxuICAgIFR3ZWVuTGl0ZS5zZXQgQCRwbGF5QnRuLCBhdXRvQWxwaGE6IDBcbiAgICBAXG5cblxuICAjIEFkZCBldmVudCBsaXN0ZW5lcnNcblxuICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfUExBWUlORywgQG9uUGxheUNoYW5nZVxuXG5cbiAgIyBIYW5kbGVyIGZvciBwbGF5aW5nIG1vZGVsIGNoYW5nZSBldmVudHNcbiAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gIG9uUGxheUNoYW5nZTogKG1vZGVsKSA9PlxuICAgIHBsYXlpbmcgPSBtb2RlbC5jaGFuZ2VkLnBsYXlpbmdcblxuICAgIGlmIHBsYXlpbmdcbiAgICAgIEBzZXRQbGF5U3RhdGUoKVxuXG4gICAgZWxzZVxuICAgICAgQHNldFBhdXNlU3RhdGUoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBtb3VzZW91dCBldmVudHNcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9XG5cbiAgb25Nb3VzZU92ZXI6IChldmVudCkgPT5cbiAgICByZXR1cm5cbiAgICAkdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KVxuXG4gICAgVHdlZW5MaXRlLnRvICR0YXJnZXQsIC4yLFxuICAgICAgY29sb3I6ICdibGFjaydcblxuXG4gICMgSGFuZGxlciBmb3IgbW91c2VvdXQgZXZlbnRzXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fVxuXG4gIG9uTW91c2VPdXQ6IChldmVudCkgPT5cbiAgICByZXR1cm5cbiAgICAkdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KVxuXG4gICAgVHdlZW5MaXRlLnRvICR0YXJnZXQsIC4yLFxuICAgICAgY29sb3I6ICcjRTQxRTJCJ1xuXG5cbiAgIyBIYW5kbGVyIGZvciBjbGljayBldmVudHMuICBGYWRlcyB0aGUgdm9sdW1lIHVwIG9yIGRvd24gYW5kXG4gICMgc3RvcHMgb3Igc3RhcnRzIHBsYXliYWNrXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uQ2xpY2s6IChldmVudCkgPT5cbiAgICBkb1BsYXkgPSAhIEBhcHBNb2RlbC5nZXQoJ3BsYXlpbmcnKVxuICAgIHZvbHVtZSA9IGlmIGRvUGxheSBpcyB0cnVlIHRoZW4gMSBlbHNlIDBcbiAgICBvYmogPSB2b2x1bWU6IGlmIHZvbHVtZSBpcyAxIHRoZW4gMCBlbHNlIDFcblxuICAgIFR3ZWVuTGl0ZS50byBvYmosIC40LFxuICAgICAgdm9sdW1lOiB2b2x1bWVcblxuICAgICAgb25VcGRhdGU6ID0+XG4gICAgICAgIGNyZWF0ZWpzLlNvdW5kLnNldFZvbHVtZSBvYmoudm9sdW1lXG5cbiAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgIGlmIGRvUGxheSBpcyBmYWxzZVxuICAgICAgICAgIEBhcHBNb2RlbC5zZXQgJ3BsYXlpbmcnLCBkb1BsYXlcblxuICAgIGlmIGRvUGxheSBpcyB0cnVlXG4gICAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgZG9QbGF5XG5cbiAgICAjIFNldCB2aXN1YWwgc3RhdGUgaW1tZWRpYXRlbHkgc28gdGhlcmUncyBubyBsYWdcbiAgICBlbHNlXG4gICAgICBAc2V0UGF1c2VTdGF0ZSgpXG5cblxuICAjIFNldCB2aXN1YWwgc3RhdGUgb2YgcGxheSBwYXVzZSBidG5cblxuICBzZXRQbGF5U3RhdGU6IC0+XG4gICAgVHdlZW5MaXRlLnNldCBAJHBsYXlCdG4sIGF1dG9BbHBoYTogMFxuICAgIFR3ZWVuTGl0ZS5zZXQgQCRwYXVzZUJ0biwgYXV0b0FscGhhOiAxXG4gICAgQCRsYWJlbC50ZXh0ICdQQVVTRSdcblxuXG4gICMgU2V0IHZpc3VhbCBzdGF0ZSBvZiBwbGF5IHBhdXNlIGJ0blxuXG4gIHNldFBhdXNlU3RhdGU6IC0+XG4gICAgVHdlZW5MaXRlLnNldCBAJHBsYXlCdG4sIGF1dG9BbHBoYTogMVxuICAgIFR3ZWVuTGl0ZS5zZXQgQCRwYXVzZUJ0biwgYXV0b0FscGhhOiAwXG4gICAgQCRsYWJlbC50ZXh0ICdQTEFZJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheVBhdXNlQnRuXG4iLCIjIyMqXG4gKiBLaXQgLyBQYWQgdG9nZ2xlIGJ1dHRvbi5cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjguMTRcbiMjI1xuXG5BcHBDb25maWcgPSByZXF1aXJlICcuLi8uLi8uLi9jb25maWcvQXBwQ29uZmlnLmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy90b2dnbGUtdGVtcGxhdGUuaGJzJ1xuXG5jbGFzcyBUb2dnbGUgZXh0ZW5kcyBWaWV3XG5cbiAgY2xhc3NOYW1lOiAndG9nZ2xlJ1xuICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuICBldmVudHM6XG4gICAgJ3RvdWNoZW5kIC5idG4tc3RlcHMnOiAnb25TdGVwc0J0bkNsaWNrJ1xuICAgICd0b3VjaGVuZCAuYnRuLXBhZHMnOiAnb25QYWRCdG5DbGljaydcblxuXG4gIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgQCRzdGVwc0J0biA9IEAkZWwuZmluZCAnLmJ0bi1zdGVwcydcbiAgICBAJHBhZEJ0biA9IEAkZWwuZmluZCAnLmJ0bi1wYWRzJ1xuICAgIEBcblxuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgIEBhcHBNb2RlbC5vbiAnY2hhbmdlOnNob3dTZXF1ZW5jZXInLCBAb25TaG93U2VxdWVuY2VyQ2hhbmdlXG5cblxuICBvblN0ZXBzQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICBAYXBwTW9kZWwuc2V0XG4gICAgICAnc2hvd1NlcXVlbmNlcic6IHRydWVcblxuXG4gIG9uUGFkQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICBAYXBwTW9kZWwuc2V0XG4gICAgICAnc2hvd1NlcXVlbmNlcic6IGZhbHNlXG5cblxuICBvblNob3dTZXF1ZW5jZXJDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICBpZiBtb2RlbC5jaGFuZ2VkLnNob3dTZXF1ZW5jZXJcbiAgICAgIEAkc3RlcHNCdG4uYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgQCRwYWRCdG4ucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuXG4gICAgIyBTaG93IHBhZFxuICAgIGVsc2VcbiAgICAgIEAkc3RlcHNCdG4ucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgQCRwYWRCdG4uYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVG9nZ2xlXG4iLCIjIyMqXG4gKiBTb3VuZCB0eXBlIHNlbGVjdG9yIGZvciBjaG9vc2luZyB3aGljaCBzb3VuZCBzaG91bGRcbiAqIHBsYXkgb24gZWFjaCB0cmFja1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cbkFwcEV2ZW50ID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXRlbXBsYXRlLmhicydcblxuY2xhc3MgSW5zdHJ1bWVudCBleHRlbmRzIFZpZXdcblxuICAjIFRoZSB2aWV3IGNsYXNzXG4gICMgQHR5cGUge1N0cmluZ31cblxuICBjbGFzc05hbWU6ICdpbnN0cnVtZW50J1xuXG4gICMgVmlldyB0ZW1wbGF0ZVxuICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuICAjIFJlZiB0byB0aGUgSW5zdHJ1bWVudE1vZGVsXG4gICMgQHR5cGUge0luc3RydW1lbnRNb2RlbH1cblxuICBtb2RlbDogbnVsbFxuXG4gICMgUmVmIHRvIHRoZSBwYXJlbnQga2l0XG4gICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gIGtpdE1vZGVsOiBudWxsXG5cblxuICBldmVudHM6XG4gICAgJ3RvdWNoZW5kJzogJ29uQ2xpY2snXG5cblxuICAjIEhhbmRsZXIgZm9yIGNsaWNrIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIGN1cnJlbnQgaW5zdHJ1bWVudCBtb2RlbCwgd2hpY2hcbiAgIyBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbCBsaXN0ZW5zIHRvLCBhbmQgYWRkcyBhIHNlbGVjdGVkIHN0YXRlXG4gICMgQHBhcmFtIHtFdmVudH1cblxuICBvbkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgQGtpdE1vZGVsLnNldCAnY3VycmVudEluc3RydW1lbnQnLCBAbW9kZWxcbiAgICBAJGVsLmFkZENsYXNzICdzZWxlY3RlZCdcblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50XG4iLCIjIyMqXG4gKiBQYW5lbCB3aGljaCBob3VzZXMgZWFjaCBpbmRpdmlkdWFsIHNlbGVjdGFibGUgc291bmRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5JbnN0cnVtZW50ID0gcmVxdWlyZSAnLi9JbnN0cnVtZW50LmNvZmZlZSdcbnRlbXBsYXRlICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9pbnN0cnVtZW50LXBhbmVsLXRlbXBsYXRlLmhicydcblxuY2xhc3MgSW5zdHJ1bWVudFNlbGVjdG9yUGFuZWwgZXh0ZW5kcyBWaWV3XG5cbiAgIyBWaWV3IHRlbXBsYXRlXG4gICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG4gICMgUmVmIHRvIHRoZSBhcHBsaWNhdGlvbiBtb2RlbFxuICAjIEB0eXBlIHtBcHBNb2RlbH1cblxuICBhcHBNb2RlbDogbnVsbFxuXG4gICMgUmVmIHRvIGtpdCBjb2xsZWN0aW9uXG4gICMgQHR5cGUge0tpdE1vZGVsfVxuXG4gIGtpdENvbGxlY3Rpb246IG51bGxcblxuICAjIFJlZiB0byB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGtpdFxuICAjIEB0eXBlIHtLaXRNb2RlbH1cblxuICBraXRNb2RlbDogbnVsbFxuXG4gICMgUmVmIHRvIGluc3RydW1lbnQgdmlld3NcbiAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgaW5zdHJ1bWVudFZpZXdzOiBudWxsXG5cbiAgIyBJbml0aWFsaXplcyB0aGUgaW5zdHJ1bWVudCBzZWxlY3RvciBhbmQgc2V0cyBhIGxvY2FsIHJlZlxuICAjIHRvIHRoZSBjdXJyZW50IGtpdCBtb2RlbCBmb3IgZWFzeSBhY2Nlc3NcbiAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEBraXRNb2RlbCA9IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJylcblxuXG4gICMgUmVuZGVycyB0aGUgdmlldyBhcyB3ZWxsIGFzIHRoZSBhc3NvY2lhdGVkIGtpdCBpbnN0cnVtZW50c1xuICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG5cbiAgICBAJGNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmluc3RydW1lbnRzJ1xuICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgQFxuXG5cbiAgIyBSZW5kZXJzIGVhY2ggaW5kaXZpZHVhbCBraXQgbW9kZWwgaW50byBhbiBJbnN0cnVtZW50XG5cbiAgcmVuZGVySW5zdHJ1bWVudHM6IC0+XG4gICAgQGluc3RydW1lbnRWaWV3cyA9IFtdXG5cbiAgICBAa2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpLmVhY2ggKG1vZGVsKSA9PlxuICAgICAgaW5zdHJ1bWVudCA9IG5ldyBJbnN0cnVtZW50XG4gICAgICAgIGtpdE1vZGVsOiBAa2l0TW9kZWxcbiAgICAgICAgbW9kZWw6IG1vZGVsXG5cbiAgICAgIEAkY29udGFpbmVyLmFwcGVuZCBpbnN0cnVtZW50LnJlbmRlcigpLmVsXG4gICAgICBAaW5zdHJ1bWVudFZpZXdzLnB1c2ggaW5zdHJ1bWVudFxuXG5cbiAgIyBBZGRzIGV2ZW50IGxpc3RlbmVycyByZWxhdGVkIHRvIGtpdCBjaGFuZ2VzXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0tJVCwgQG9uS2l0Q2hhbmdlXG4gICAgQGxpc3RlblRvIEBraXRNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0lOU1RSVU1FTlQsIEBvbkluc3RydW1lbnRDaGFuZ2VcblxuXG4gICMgUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnNcblxuICByZW1vdmVFdmVudExpc3RlbmVyczogLT5cbiAgICBAc3RvcExpc3RlbmluZygpXG5cblxuICAjIEV2ZW50IExpc3RlbmVyc1xuICAjIC0tLS0tLS0tLS0tLS0tLVxuXG4gICMgSGFuZGxlciBmb3Iga2l0IGNoYW5nZSBldmVudHMuICBDbGVhbnMgdXAgdGhlIHZpZXcgYW5kIHJlLXJlbmRlcnNcbiAgIyB0aGUgaW5zdHJ1bWVudHMgdG8gdGhlIERPTVxuICAjIEBwYXJhbSB7S2l0TW9kZWx9IG1vZGVsXG5cbiAgb25LaXRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICBAcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKVxuXG4gICAgQGtpdE1vZGVsID0gbW9kZWwuY2hhbmdlZC5raXRNb2RlbFxuXG4gICAgXy5lYWNoIEBpbnN0cnVtZW50Vmlld3MsIChpbnN0cnVtZW50KSAtPlxuICAgICAgaW5zdHJ1bWVudC5yZW1vdmUoKVxuXG4gICAgQHJlbmRlckluc3RydW1lbnRzKClcbiAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cbiAgb25JbnN0cnVtZW50Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgQCRjb250YWluZXIuZmluZCgnLmluc3RydW1lbnQnKS5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG5cblxuICBvblRlc3RDbGljazogKGV2ZW50KSAtPlxuICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24ubmV4dEtpdCgpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0cnVtZW50U2VsZWN0b3JQYW5lbFxuIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCJcXG48ZGl2IGNsYXNzPSdjb250YWluZXItaW5zdHJ1bWVudHMnPlxcblxcblx0PGRpdiBjbGFzcz0nbGFiZWwnPlxcblx0XHREUlVNIFBBVFRFUk4gRURJVE9SXFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9J2luc3RydW1lbnRzJz5cXG5cXG5cdDwvZGl2PlxcblxcbjwvZGl2PlwiO1xuICB9KSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPSdpY29uIFwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5pY29uKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5pY29uOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiJz48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCIjIyMqXG4gKiBMaXZlIE1QQyBcInBhZFwiIGNvbXBvbmVudFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbkFwcEV2ZW50ICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuUHViRXZlbnQgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5QYWRTcXVhcmVDb2xsZWN0aW9uID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vbW9kZWxzL3BhZC9QYWRTcXVhcmVDb2xsZWN0aW9uLmNvZmZlZSdcblBhZFNxdWFyZU1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvcGFkL1BhZFNxdWFyZU1vZGVsLmNvZmZlZSdcblZpZXcgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5QYWRTcXVhcmUgICAgICAgICAgID0gcmVxdWlyZSAnLi9QYWRTcXVhcmUuY29mZmVlJ1xuUGxheVBhdXNlQnRuICAgICAgICA9IHJlcXVpcmUgJy4uL1BsYXlQYXVzZUJ0bi5jb2ZmZWUnXG5wYWRzVGVtcGxhdGUgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGFkcy10ZW1wbGF0ZS5oYnMnXG5pbnN0cnVtZW50c1RlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvaW5zdHJ1bWVudHMtdGVtcGxhdGUuaGJzJ1xudGVtcGxhdGUgICAgICAgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2xpdmUtcGFkLXRlbXBsYXRlLmhicydcblxuY2xhc3MgTGl2ZVBhZCBleHRlbmRzIFZpZXdcblxuICAjIEtleSBjb21tYW5kIGtleW1hcCBmb3IgbGl2ZSBraXQgcGxheWJhY2tcbiAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgS0VZTUFQOiBbJzEnLCcyJywnMycsJzQnLCdxJywgJ3cnLCAnZScsICdyJywgJ2EnLCAncycsICdkJywgJ2YnLCAneicsICd4JywgJ2MnLCAndiddXG5cbiAgIyBUaGUgY2xhc3NuYW1lIGZvciB0aGUgTGl2ZSBQYWRcbiAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gIGNsYXNzTmFtZTogJ2NvbnRhaW5lci1saXZlLXBhZCdcblxuICAjIFRoZSB0ZW1wbGF0ZVxuICAjIEB0eXBlIHtGdW5jdGlvbn1cblxuICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuICAjIEFwcG1vZGVsIGZvciBsaXN0ZW5pbmcgdG8gc2hvdyAvIGhpZGUgZXZlbnRzXG4gICMgQHR5cGUge0FwcE1vZGVsfVxuXG4gIGFwcE1vZGVsOiBudWxsXG5cbiAgIyBDb2xsZWN0aW9uIG9mIGtpdHMgdG8gYmUgcmVuZGVyZWQgdG8gdGhlIGluc3RydW1lbnQgY29udGFpbmVyXG4gICMgQHR5cGUge0tpdENvbGxlY3Rpb259XG5cbiAga2l0Q29sbGVjdGlvbjogbnVsbFxuXG4gICMgQ29sbGVjdGlvbiBvZiBpbnN0cnVtZW50cy4gIFVzZWQgdG8gbGlzdGVuIHRvIGBkcm9wcGVkYCBzdGF0dXNcbiAgIyBvbiBpbmRpdmlkdWFsIGluc3RydW1lbnQgbW9kZWxzLCBhcyBzZXQgZnJvbSB0aGUgUGFkU3F1YXJlXG4gICMgQHR5cGUge0luc3RydW1lbnRDb2xsZWN0aW9ufVxuXG4gIGluc3RydW1lbnRDb2xsZWN0aW9uOiBudWxsXG5cbiAgIyBDb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgcGFkIHNxdWFyZSBtb2RlbHNcbiAgIyBAdHlwZSB7UGFkU3F1YXJlQ29sbGVjdGlvbn1cblxuICBwYWRTcXVhcmVDb2xsZWN0aW9uOiBudWxsXG5cbiAgIyBBbiBhcnJheSBvZiBpbmRpdmlkdWFsIFBhZFNxdWFyZVZpZXdzXG4gICMgQHR5cGUge0FycmF5fVxuXG4gIHBhZFNxdWFyZVZpZXdzOiBudWxsXG5cbiAgIyBNb3VzZSB0cmFja2VyIHdoaWNoIGNvbnN0YW50bHkgdXBkYXRlcyBtb3VzZSAvIHRvdWNoIHBvc2l0aW9uIHZpYSAueCBhbmQgLnlcbiAgIyBAdHlwZSB7T2JqZWN0fVxuXG4gIG1vdXNlUG9zaXRpb246IHg6IDAsIHk6IDBcblxuICBldmVudHM6XG4gICAgJ3RvdWNoZW5kIC5idG4tZWRpdCc6ICdvbkVkaXRCdG5DbGljaydcbiAgICAndG91Y2hlbmQgLnRhYic6ICdvblRhYkNsaWNrJ1xuICAgICd0b3VjaHN0YXJ0IC5idG4tYmFjayc6ICdvbkJhY2tCdG5QcmVzcycgIyBNb2JpbGUgb25seVxuICAgICd0b3VjaGVuZCAuYnRuLWJhY2snOiAnb25CYWNrQnRuQ2xpY2snICMgTW9iaWxlIG9ubHlcblxuXG4gICMgUmVuZGVyIHRoZSB2aWV3IGFuZCBhbmQgcGFyc2UgdGhlIGNvbGxlY3Rpb24gaW50byBhIGRpc3BsYXlhYmxlXG4gICMgaW5zdHJ1bWVudCAvIHBhZCB0YWJsZVxuICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICMgQHJldHVybiB7TGl2ZVBhZH1cblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEAkcGFkc0NvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1wYWRzJ1xuICAgIEAkaW5zdHJ1bWVudHNDb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItaW5zdHJ1bWVudHMnXG5cbiAgICBAcmVuZGVyUGFkcygpXG4gICAgQHJlbmRlckluc3RydW1lbnRzKClcblxuICAgICMgUmVuZGVyIHNxdWFyZXMgdG8gdGhlIERPTVxuICAgIF8uZWFjaCBAcGFkU3F1YXJlVmlld3MsIChwYWRTcXVhcmUpID0+XG4gICAgICBpZCA9IHBhZFNxdWFyZS5tb2RlbC5nZXQgJ2lkJ1xuICAgICAgQCRlbC5maW5kKFwiIyN7aWR9XCIpLmh0bWwgcGFkU3F1YXJlLnJlbmRlcigpLmVsXG5cblxuICAgICMgU2V0dXAgbW9iaWxlIGxheW91dFxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgQHBsYXlQYXVzZUJ0biA9IG5ldyBQbGF5UGF1c2VCdG5cbiAgICAgICAgYXBwTW9kZWw6IEBhcHBNb2RlbFxuXG4gICAgICBAJHBsYXlQYXVzZUNvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1wbGF5LXBhdXNlJ1xuICAgICAgQCRwbGF5TGFiZWwgPSBAJHBsYXlQYXVzZUNvbnRhaW5lci5maW5kICcubGFiZWwtYnRuJ1xuICAgICAgQCRpbnN0cnVjdGlvbnMgPSBAJGVsLmZpbmQgJy5pbnN0cnVjdGlvbnMnXG4gICAgICBAJHRhYnMgPSBAJGVsLmZpbmQgJy50YWInXG4gICAgICBAJGtpdHMgPSBAJGVsLmZpbmQgJy5jb250YWluZXIta2l0J1xuXG4gICAgICBAJHBsYXlQYXVzZUNvbnRhaW5lci5odG1sIEBwbGF5UGF1c2VCdG4ucmVuZGVyKCkuZWxcbiAgICAgIEAkcGxheUxhYmVsLnRleHQgJ1BBVVNFIFNFUVVFTkNFJ1xuXG4gICAgICBfLmRlbGF5ID0+XG4gICAgICAgICQoQCR0YWJzWzBdKS50cmlnZ2VyICd0b3VjaGVuZCdcbiAgICAgICwgMTAwXG5cbiAgICBAaW5pdERyYWdBbmREcm9wKClcbiAgICBAXG5cblxuICByZW1vdmU6IChvcHRpb25zKSAtPlxuICAgIF8uZWFjaCBAcGFkU3F1YXJlVmlld3MsICh2aWV3KSA9PlxuICAgICAgdmlldy5yZW1vdmUoKVxuXG4gICAgQCRwYWRzQ29udGFpbmVyLnJlbW92ZSgpXG4gICAgc3VwZXIoKVxuXG5cbiAgIyBBZGQgY29sbGVjdGlvbiBsaXN0ZW5lcnMgdG8gbGlzdGVuIGZvciBpbnN0cnVtZW50IGRyb3BzXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgJChkb2N1bWVudCkub24gJ21vdXNlbW92ZScsIEBvbk1vdXNlTW92ZVxuXG4gICAgIyBTZXR1cCBsaXZlcGFkIGtleXNcbiAgICBfLmVhY2ggQEtFWU1BUCwgKGtleSkgPT5cbiAgICAgICQoZG9jdW1lbnQpLm9uICdrZXlkb3duJywgbnVsbCwga2V5LCBAb25LZXlQcmVzc1xuXG5cbiAgIyBSZW1vdmVzIGV2ZW50IGxpc3RlbmVyc1xuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICQoZG9jdW1lbnQpLm9mZiAnbW91c2Vtb3ZlJywgQG9uTW91c2VNb3ZlXG5cbiAgICAjIFJlbW92ZSBsaXZlcGFkIGtleXNcbiAgICBfLmVhY2ggQEtFWU1BUCwgKGtleSkgPT5cbiAgICAgICQoZG9jdW1lbnQpLm9mZiAna2V5ZG93bicsIG51bGwsIGtleSwgQG9uS2V5UHJlc3NcblxuICAgIEBzdG9wTGlzdGVuaW5nKClcblxuXG4gICMgUmVuZGVycyBvdXQgdGhlIGluc3RydW1lbnQgcGFkIHNxdWFyZXNcblxuICByZW5kZXJQYWRzOiAtPlxuICAgIEAkcGFkc0NvbnRhaW5lci5odG1sIHBhZHNUZW1wbGF0ZSB7XG4gICAgICBwYWRUYWJsZTogQHJldHVyblBhZFRhYmxlRGF0YSgpXG4gICAgICBpc0Rlc2t0b3A6ICEgQGlzTW9iaWxlXG4gICAgfVxuXG5cbiAgIyBSZW5kZXJzIG91dCB0aGUgaW5zdHJ1bWVudCByYWNrcyBieSBpdGVyYXRpbmcgdGhyb3VnaFxuICAjIGVhY2ggb2YgdGhlIGluc3RydW1lbnQgc2V0cyBpbiB0aGUgS2l0Q29sbGVjdGlvblxuXG4gIHJlbmRlckluc3RydW1lbnRzOiAtPlxuICAgIEAkaW5zdHJ1bWVudHNDb250YWluZXIuaHRtbCBpbnN0cnVtZW50c1RlbXBsYXRlIHtcbiAgICAgIGluc3RydW1lbnRUYWJsZTogQHJldHVybkluc3RydW1lbnRUYWJsZURhdGEoKVxuICAgICAgaXNEZXNrdG9wOiAhIEBpc01vYmlsZVxuICAgIH1cblxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgQCRraXRzID0gQCRlbC5maW5kICcuY29udGFpbmVyLWtpdCdcbiAgICAgIEAkdGFicyA9IEAkZWwuZmluZCAnLnRhYidcblxuXG4gICMgQ2xlYXJzIHRoZSBsaXZlIHBhZCBvZiBhbGwgYXNzaWduZWQgaW5zdHJ1bWVudHNcblxuICBjbGVhckxpdmVQYWQ6IC0+XG5cbiAgICAjIEl0ZXJhdGUgb3ZlciBhcHAgcGFkIHNxdWFyZXNcbiAgICBfLmVhY2ggQHBhZFNxdWFyZVZpZXdzLCAocGFkU3F1YXJlLCBpbmRleCkgPT5cblxuICAgICAgIyBPbmx5IG1vZGlmeSBwYWQgc3F1YXJlcyB3aGljaCBoYXZlIGEgZHJvcHBlZCBpbnN0cnVtZW50XG4gICAgICBpZiBwYWRTcXVhcmUubW9kZWwuZ2V0KCdjdXJyZW50SW5zdHJ1bWVudCcpXG4gICAgICAgIHBhZFNxdWFyZS5tb2RlbC5zZXQgJ2Ryb3BwZWQnLCBmYWxzZVxuICAgICAgICBwYWRTcXVhcmUubW9kZWwuZ2V0KCdjdXJyZW50SW5zdHJ1bWVudCcpLnNldCAnZHJvcHBlZCcsIGZhbHNlXG4gICAgICAgIHBhZFNxdWFyZS5tb2RlbC5zZXQgJ2N1cnJlbnRJbnN0cnVtZW50JywgbnVsbFxuICAgICAgICBwYWRTcXVhcmUucmVtb3ZlU291bmRBbmRDbGVhclBhZCgpXG5cbiAgICBAcmVuZGVySW5zdHJ1bWVudHMoKVxuICAgIEBpbml0RHJhZ0FuZERyb3AoKVxuXG5cbiAgIyBFdmVudCBoYW5kbGVyc1xuICAjIC0tLS0tLS0tLS0tLS0tXG5cbiAgb25LZXlQcmVzczogKGV2ZW50KSA9PlxuICAgIGtleSA9IGV2ZW50LmhhbmRsZU9iai5kYXRhXG4gICAgaW5kZXggPSBfLmluZGV4T2YgQEtFWU1BUCwga2V5XG4gICAgQHBhZFNxdWFyZVZpZXdzW2luZGV4XS5vblByZXNzKClcblxuXG4gIG9uRWRpdEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgQCRpbnN0cnVjdGlvbnMuaGlkZSgpXG4gICAgQCRpbnN0cnVtZW50c0NvbnRhaW5lci5zaG93KClcblxuXG4gIG9uVGFiQ2xpY2s6IChldmVudCkgPT5cbiAgICBAJGtpdHMuaGlkZSgpXG4gICAgQCR0YWJzLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcbiAgICAkdGFiID0gJChldmVudC5jdXJyZW50VGFyZ2V0KVxuICAgIEBzZWxlY3RlZEluZGV4ID0gJHRhYi5pbmRleCgpXG5cbiAgICAkdGFiLmFkZENsYXNzICdzZWxlY3RlZCdcbiAgICAkKEAka2l0c1tAc2VsZWN0ZWRJbmRleF0pLnNob3coKVxuXG5cbiAgIyBNb2JpbGUgb25seS4gQWRkIHByZXNzIHN0YXRlIG9uIGJ0blxuICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICBvbkJhY2tCdG5QcmVzczogKGV2ZW50KSA9PlxuICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkuYWRkQ2xhc3MgJ3ByZXNzJ1xuXG5cbiAgIyBNb2JpbGUgb25seS4gVHJpZ2dlciBzZXF1ZW5jZXIgc2hvdyBiYWNrIG9uIENyZWF0ZVZpZXdcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgb25CYWNrQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzICdwcmVzcydcbiAgICBAYXBwTW9kZWwuc2V0ICdzaG93U2VxdWVuY2VyJywgdHJ1ZVxuXG5cbiAgIyBUT0RPOiBVcGRhdGUgbW91c2UgbW92ZSB0byBzdXBwb3J0IHRvdWNoIGV2ZW50c1xuICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICBvbk1vdXNlTW92ZTogKGV2ZW50KSA9PlxuICAgIEBtb3VzZVBvc2l0aW9uID1cbiAgICAgIHg6IGV2ZW50LnBhZ2VYXG4gICAgICB5OiBldmVudC5wYWdlWVxuXG5cbiAgIyBIYW5kbGVyIGZvciBkcm9wIGNoYW5nZSBldmVudHMuICBDaGVja3MgdG8gc2VlIGlmIHRoZSBpbnN0cnVtZW50XG4gICMgY2xhc3NOYW1lIGV4aXN0cyBvbiB0aGUgZWxlbWVudCBhbmQsIGlmIHNvLCByZS1yZW5kZXJzIHRoZVxuICAjIGluc3RydW1lbnQgYW5kIHBhZCB0YWJsZXNcbiAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gaW5zdHJ1bWVudE1vZGVsXG5cbiAgb25Ecm9wcGVkQ2hhbmdlOiAoaW5zdHJ1bWVudE1vZGVsKSA9PlxuICAgIGluc3RydW1lbnRJZCA9IGluc3RydW1lbnRNb2RlbC5nZXQoJ2lkJylcbiAgICAkcGFkU3F1YXJlID0gQCRlbC5maW5kIFwiLiN7aW5zdHJ1bWVudElkfVwiXG4gICAgcGFkU3F1YXJlSWQgPSAkcGFkU3F1YXJlLmF0dHIgJ2lkJ1xuICAgIHBhZFNxdWFyZU1vZGVsID0gQHBhZFNxdWFyZUNvbGxlY3Rpb24uZmluZFdoZXJlIHsgaWQ6IHBhZFNxdWFyZUlkIH1cblxuICAgICMgQ2hlY2tzIGFnYWluc3QgdGVzdHMgYW5kIGRyYWdnYWJsZSwgd2hpY2ggaXMgbGVzcyB0ZXN0YWJsZVxuICAgIHVubGVzcyBwYWRTcXVhcmVNb2RlbCBpcyB1bmRlZmluZWRcbiAgICAgIHBhZFNxdWFyZU1vZGVsLnNldCAnY3VycmVudEluc3RydW1lbnQnLCBpbnN0cnVtZW50TW9kZWxcblxuXG4gICMgSGFuZGxlciBmb3IgcHJlc3MgYW5kIGhvbGQgZXZlbnRzLCBhcyBkaXNwYXRjaGVkIGZyb20gdGhlIHBhZCBzcXVhcmUgdGhlIHVzZXJcbiAgIyBpcyBpbnRlcmFjdGluZyB3aXRoLiAgUmVsZWFzZXMgdGhlIGluc3RydW1lbnQgYW5kIGFsbG93cyB0aGUgdXNlciB0byBkcmFnIHRvXG4gICMgYSBuZXcgc3F1YXJlIG9yIGRlcG9zaXQgaXQgYmFjayB3aXRoaW4gdGhlIGluc3RydW1lbnQgcmFja1xuICAjIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcblxuICBvbkRyYWdnaW5nQ2hhbmdlOiAocGFyYW1zKSA9PlxuICAgIHtpbnN0cnVtZW50SWQsIHBhZFNxdWFyZSwgJHBhZFNxdWFyZSwgZXZlbnR9ID0gcGFyYW1zXG5cbiAgICAkZHJvcHBlZEluc3RydW1lbnQgPSAkKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGluc3RydW1lbnRJZCkpXG5cbiAgICAjIFJldHVybiB0aGUgZHJhZ2dhYmxlIGluc3RhbmNlIGFzc29jaWF0ZWQgd2l0aCB0aGUgcGFkIHNxdWFyZVxuICAgIGRyYWdnYWJsZSA9IF8uZmluZCBAZHJhZ2dhYmxlLCAoZHJhZ2dhYmxlRWxlbWVudCkgPT5cbiAgICAgIGlmICQoZHJhZ2dhYmxlRWxlbWVudC5fZXZlbnRUYXJnZXQpLmF0dHIoJ2lkJykgaXMgJGRyb3BwZWRJbnN0cnVtZW50LmF0dHIoJ2lkJylcbiAgICAgICAgcmV0dXJuIGRyYWdnYWJsZUVsZW1lbnRcblxuICAgICMgU2V0IHRoZSBtb2RlbCB0byBudWxsIHNvIHRoYXQgaXQgY2FuIGJlIHJlYXNzaWduZWRcbiAgICBwYWRTcXVhcmUubW9kZWwuc2V0ICdkcm9wcGVkJywgZmFsc2VcbiAgICBwYWRTcXVhcmUubW9kZWwuc2V0ICdjdXJyZW50SW5zdHJ1bWVudCcsIG51bGxcblxuICAgICMgSWYgbW9iaWxlIG9yIHRhYmxldCwganVzdCBzZW5kIGl0IGJhY2sgdG8gdGhlIGRvY2tcbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIHJlcGVhdCA9IDBcblxuICAgICAgdHdlZW4gPSBUd2VlbkxpdGUudG8gcGFkU3F1YXJlLiRlbCwgLjA1LFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjRTQxRTJCJ1xuXG4gICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgdHdlZW4ucmV2ZXJzZSgpXG5cbiAgICAgICAgICBpZiByZXBlYXQgaXMgMVxuICAgICAgICAgICAgZHJhZ2dhYmxlLmRpc2FibGUoKVxuXG4gICAgICAgIG9uUmV2ZXJzZUNvbXBsZXRlOiA9PlxuICAgICAgICAgIGlmIHJlcGVhdCA8IDFcbiAgICAgICAgICAgIHJlcGVhdCsrXG4gICAgICAgICAgICB0d2Vlbi5yZXN0YXJ0KClcblxuXG4gICAgIyBBbGxvdyB0aGUgdXNlciB0byBjbGljayBhbmQgcmUtYXNzaWduXG4gICAgZWxzZVxuXG4gICAgICAjIFNpbGVudGx5IHVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIGhpZGRlbiBpbnN0cnVtZW50XG4gICAgICAkZHJvcHBlZEluc3RydW1lbnQuY3NzICdwb3NpdGlvbicsICdhYnNvbHV0ZSdcbiAgICAgICRkcm9wcGVkSW5zdHJ1bWVudC5zaG93KClcbiAgICAgIHBvc2l0aW9uID0gJHBhZFNxdWFyZS5wb3NpdGlvbigpXG5cbiAgICAgICMgU2V0IHRoZSBwb3NpdGlvbiBiZWZvcmUgaXQgYXBwZWFyc1xuICAgICAgVHdlZW5MaXRlLnNldCAkZHJvcHBlZEluc3RydW1lbnQsXG4gICAgICAgIHNjYWxlOiAuOFxuICAgICAgICB0b3A6IHBvc2l0aW9uLnRvcCArICgkcGFkU3F1YXJlLmhlaWdodCgpICogLjUpXG4gICAgICAgIGxlZnQ6IHBvc2l0aW9uLmxlZnQgKyAoJHBhZFNxdWFyZS53aWR0aCgpICogLjUpXG5cbiAgICAgICMgU2NhbGUgaXQgdXAgc28gdGhhdCB0aGUgdXNlciBrbm93cyB0aGV5IGNhbiBkcmFnXG4gICAgICBUd2VlbkxpdGUudG8gJGRyb3BwZWRJbnN0cnVtZW50LCAuMixcbiAgICAgICAgc2NhbGU6IDEuMVxuICAgICAgICBjb2xvcjogJyNFNDFFMkInXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuICAgICAgICBvbkNvbXBsZXRlOiAtPlxuICAgICAgICAgIFR3ZWVuTGl0ZS50byAkZHJvcHBlZEluc3RydW1lbnQsIC4yLFxuICAgICAgICAgICAgc2NhbGU6IDFcblxuXG4gICAgIyBSZW5hYmxlIGRyYWdnaW5nXG4gICAgZHJhZ2dhYmxlLmVuYWJsZSgpXG4gICAgZHJhZ2dhYmxlLnVwZGF0ZSgpXG4gICAgZHJhZ2dhYmxlLnN0YXJ0RHJhZyBldmVudFxuXG5cbiAgIyBIYW5kbGVyIGZvciBiZWF0IGV2ZW50cyBvcmlnaW5hdGluZyBmcm9tIHRoZSBQYWRTcXVhcmUuICBJc1xuICAjIHBhc3NlZCBkb3duIHRvIHRoZSBWaXN1YWxpemF0aW9uVmlldyB0byB0cmlnZ2VyIGFuaW1hdGlvblxuICAjIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcblxuICBvbkJlYXQ6IChwYXJhbXMpID0+XG4gICAgQHRyaWdnZXIgUHViRXZlbnQuQkVBVCwgcGFyYW1zXG5cblxuICAjIFByaXZhdGVcbiAgIyAtLS0tLS0tXG5cbiAgIyBTZXRzIHVwIGRyYWcgYW5kIGRyb3Agb24gZWFjaCBvZiB0aGUgaW5zdHJ1bWVudHMgcmVuZGVyZWQgZnJvbSB0aGUgS2l0Q29sbGVjdGlvblxuICAjIEFkZHMgaGlnaGxpZ2h0cyBhbmQgZGV0ZXJtaW5lcyBoaXQtdGVzdHMsIG9yIGRlZmVycyB0byByZXR1cm5JbnN0cnVtZW50VG9Eb2NrXG4gICMgaW4gc2l0dWF0aW9ucyB3aGVyZSBkcm9wcGluZyBpc24ndCBwb3NzaWJsZVxuXG4gIGluaXREcmFnQW5kRHJvcDogLT5cbiAgICBzZWxmID0gQFxuXG4gICAgQCRpbnN0cnVtZW50ID0gQCRlbC5maW5kICcuaW5zdHJ1bWVudCdcbiAgICAkZHJvcHBhYmxlcyA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1wYWQnXG5cbiAgICBAZHJhZ2dhYmxlID0gRHJhZ2dhYmxlLmNyZWF0ZSBAJGluc3RydW1lbnQsXG5cbiAgICAgICMgSGFuZGxlciBmb3IgZHJhZyBldmVudHMuICBJdGVyYXRlcyBvdmVyIGFsbCBkcm9wcGFibGUgc3F1YXJlIGFyZWFzXG4gICAgICAjIGFuZCBjaGVja3MgdG8gc2VlIGlmIGFuIGluc3RydW1lbnQgY3VycmVudGx5IG9jY3VwaWVzIHRoZSBwb3NpdGlvblxuXG4gICAgICBvbkRyYWc6IChldmVudCkgLT5cblxuICAgICAgICBpID0gJGRyb3BwYWJsZXMubGVuZ3RoXG5cbiAgICAgICAgd2hpbGUoIC0taSA+IC0xIClcblxuICAgICAgICAgIGlmIEBoaXRUZXN0KCRkcm9wcGFibGVzW2ldLCAnNTAlJylcblxuICAgICAgICAgICAgaW5zdHJ1bWVudCA9ICQoJGRyb3BwYWJsZXNbaV0pLmF0dHIoJ2RhdGEtaW5zdHJ1bWVudCcpXG5cbiAgICAgICAgICAgICMgUHJldmVudCBkcm9wcGFibGVzIG9uIHNxdWFyZXMgdGhhdCBhbHJlYWR5IGhhdmUgaW5zdHJ1bWVudHNcbiAgICAgICAgICAgIGlmIGluc3RydW1lbnQgaXMgbnVsbCBvciBpbnN0cnVtZW50IGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICBUd2VlbkxpdGUudG8gc2VsZi5wYWRTcXVhcmVWaWV3c1tpXS4kYm9yZGVyLCAuMixcbiAgICAgICAgICAgICAgICBhdXRvQWxwaGE6IDFcblxuICAgICAgICAgICMgUmVtb3ZlIGlmIG5vdCBvdmVyIHNxdWFyZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIFR3ZWVuTGl0ZS50byBzZWxmLnBhZFNxdWFyZVZpZXdzW2ldLiRib3JkZXIsIC4yLFxuICAgICAgICAgICAgICBhdXRvQWxwaGE6IDBcblxuXG4gICAgICAjIENoZWNrIHRvIHNlZSBpZiBpbnN0cnVtZW50IGlzIGRyb3BwYWJsZTsgb3RoZXJ3aXNlXG4gICAgICAjIHRyaWdnZXIgYSBcImNhbnQgZHJvcFwiIGFuaW1hdGlvblxuXG4gICAgICBvbkRyYWdFbmQ6IChldmVudCkgLT5cbiAgICAgICAgaSA9ICRkcm9wcGFibGVzLmxlbmd0aFxuXG4gICAgICAgIGRyb3BwZWRQcm9wZXJseSA9IGZhbHNlXG4gICAgICAgICRkcmFnZ2VkID0gbnVsbFxuICAgICAgICAkZHJvcHBlZCA9IG51bGxcblxuICAgICAgICB3aGlsZSggLS1pID4gLTEgKVxuXG4gICAgICAgICAgJGRyYWdnZWQgPSB0aGlzLnRhcmdldFxuICAgICAgICAgICRkcm9wcGVkID0gJGRyb3BwYWJsZXNbaV1cblxuICAgICAgICAgIGlmIEBoaXRUZXN0KCRkcm9wcGFibGVzW2ldLCAnNTAlJylcbiAgICAgICAgICAgIGluc3RydW1lbnQgPSAkKCRkcm9wcGFibGVzW2ldKS5hdHRyKCdkYXRhLWluc3RydW1lbnQnKVxuXG4gICAgICAgICAgICAjIFByZXZlbnQgZHJvcHBhYmxlcyBvbiBzcXVhcmVzIHRoYXQgYWxyZWFkeSBoYXZlIGluc3RydW1lbnRzXG4gICAgICAgICAgICBpZiBpbnN0cnVtZW50IGlzIG51bGwgb3IgaW5zdHJ1bWVudCBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgZHJvcHBlZFByb3Blcmx5ID0gdHJ1ZVxuXG4gICAgICAgICAgICAgICMgU2V0dXAgc291bmQgYW5kIGluaXQgcGFkXG4gICAgICAgICAgICAgIHNlbGYuZHJvcEluc3RydW1lbnQoICRkcmFnZ2VkLCAkZHJvcHBlZCwgZXZlbnQgKVxuXG4gICAgICAgICAgICAgICMgSGlkZSBCb3JkZXJcbiAgICAgICAgICAgICAgVHdlZW5MaXRlLnRvIHNlbGYucGFkU3F1YXJlVmlld3NbaV0uJGJvcmRlciwgLjIsXG4gICAgICAgICAgICAgICAgYXV0b0FscGhhOiAwXG5cbiAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgIyBTZW5kIGluc3RydW1lbnQgYmFjayBpZiBvdmVybGFwaW5nIG9uIG90aGVyIHNxdWFyZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBzZWxmLnJldHVybkluc3RydW1lbnRUb0RvY2soICRkcmFnZ2VkLCAkZHJvcHBlZCApXG4gICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgIyBTZW5kIGluc3RydW1lbnQgYmFjayBpZiBvdXQgb2YgYm91bmRzXG4gICAgICAgIGlmIGRyb3BwZWRQcm9wZXJseSBpcyBmYWxzZVxuICAgICAgICAgIHNlbGYucmV0dXJuSW5zdHJ1bWVudFRvRG9jayggJGRyYWdnZWQsICRkcm9wcGVkIClcblxuXG4gICMgSGFuZGxlciBmb3IgZHJvcCBldmVudHMuICBQYXNzZXMgaW4gdGhlIGl0ZW0gZHJhZ2dlZCwgdGhlIGl0ZW0gaXQgd2FzXG4gICMgZHJvcHBlZCB1cG9uLCBhbmQgdGhlIG9yaWdpbmFsIGV2ZW50IHRvIHN0b3JlIGluIG1lbW9yeSBmb3Igd2hlblxuICAjIHRoZSB1c2VyIHdhbnRzIHRvIFwiZGV0YWNoXCIgdGhlIGRyb3BwZWQgaXRlbSBhbmQgbW92ZSBpdCBiYWNrIGludG8gdGhlXG4gICMgaW5zdHJ1bWVudCBxdWV1ZVxuICAjXG4gICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gZHJhZ2dlZFxuICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGRyb3BwZWRcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgZHJvcEluc3RydW1lbnQ6IChkcmFnZ2VkLCBkcm9wcGVkLCBldmVudCkgPT5cbiAgICB7JGRyYWdnZWQsICRkcm9wcGVkLCBpZCwgaW5zdHJ1bWVudE1vZGVsfSA9IEBwYXJzZURyYWdnZWRBbmREcm9wcGVkKCBkcmFnZ2VkLCBkcm9wcGVkIClcblxuICAgICRkcm9wcGVkLmFkZENsYXNzIGlkXG4gICAgJGRyb3BwZWQuYXR0ciAnZGF0YS1pbnN0cnVtZW50JywgXCIje2lkfVwiXG5cbiAgICBpbnN0cnVtZW50TW9kZWwuc2V0XG4gICAgICAnZHJvcHBlZCc6IHRydWVcbiAgICAgICdkcm9wcGVkRXZlbnQnOiBldmVudFxuXG4gICAgXy5kZWZlciA9PlxuICAgICAgQHJlbmRlckluc3RydW1lbnRzKClcbiAgICAgIEBpbml0RHJhZ0FuZERyb3AoKVxuXG4gICAgICAjIEhpZGUgZXZlcnl0aGluZyBhbmQgcmVzZWxlY3QgdGFiXG4gICAgICBpZiBAaXNNb2JpbGVcbiAgICAgICAgQHJlc2VsZWN0TW9iaWxlVGFiKClcblxuXG4gICMgSGFuZGxlciBmb3Igc2l0dWF0aW9ucyB3aGVyZSB0aGUgdXNlciBhdHRlbXB0cyB0byBkcm9wIHRoZSBpbnN0cnVtZW50IGluY29ycmVjdGx5XG4gICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gZHJhZ2dlZFxuICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGRyb3BwZWRcblxuICByZXR1cm5JbnN0cnVtZW50VG9Eb2NrOiAoZHJhZ2dlZCwgZHJvcHBlZCkgPT5cbiAgICB7JGRyYWdnZWQsICRkcm9wcGVkLCBpZCwgaW5zdHJ1bWVudE1vZGVsfSA9IEBwYXJzZURyYWdnZWRBbmREcm9wcGVkKCBkcmFnZ2VkLCBkcm9wcGVkIClcblxuICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICdkcm9wcGVkJzogZmFsc2VcblxuICAgIF8uZGVmZXIgPT5cbiAgICAgIEByZW5kZXJJbnN0cnVtZW50cygpXG4gICAgICBAaW5pdERyYWdBbmREcm9wKClcblxuICAgICAgaWYgQGlzTW9iaWxlXG4gICAgICAgIEByZXNlbGVjdE1vYmlsZVRhYigpXG5cblxuICAjIEhlbHBlciBtZXRob2QgZm9yIHBhcnNpbmcgdGhlIGRyYWcgYW5kIGRyb3AgZXZlbnQgcmVzcG9uc2VzXG4gICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gZHJhZ2dlZFxuICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGRyb3BwZWRcblxuICBwYXJzZURyYWdnZWRBbmREcm9wcGVkOiAoZHJhZ2dlZCwgZHJvcHBlZCkgPT5cbiAgICAkZHJhZ2dlZCA9ICQoZHJhZ2dlZClcbiAgICAkZHJvcHBlZCA9ICQoZHJvcHBlZClcbiAgICBpZCA9ICRkcmFnZ2VkLmF0dHIgJ2lkJ1xuICAgIGluc3RydW1lbnRNb2RlbCA9IEBraXRDb2xsZWN0aW9uLmZpbmRJbnN0cnVtZW50TW9kZWwgaWRcblxuICAgIHJldHVybiB7XG4gICAgICAkZHJhZ2dlZDogJGRyYWdnZWRcbiAgICAgICRkcm9wcGVkOiAkZHJvcHBlZFxuICAgICAgaWQ6IGlkXG4gICAgICBpbnN0cnVtZW50TW9kZWw6IGluc3RydW1lbnRNb2RlbFxuICAgIH1cblxuXG4gICMgUmVuZGVyIG91dCB0aGUgdGFibGUgZm9yIHRoZSBsaXZlIHBhZCBncmlkIGFuZCBwdXNoXG4gICMgaXQgaW50byBhbiBhcnJheSBvZiB0YWJsZSByb3dzIGFuZCB0ZHNcbiAgIyBAcmV0dXJuIHtPYmplY3R9XG5cbiAgcmV0dXJuUGFkVGFibGVEYXRhOiAtPlxuICAgIEBwYWRTcXVhcmVDb2xsZWN0aW9uID0gbmV3IFBhZFNxdWFyZUNvbGxlY3Rpb24oKVxuICAgIEBwYWRTcXVhcmVWaWV3cyA9IFtdXG4gICAgcGFkVGFibGUgPSB7fVxuICAgIHJvd3MgPSBbXVxuICAgIGl0ZXJhdG9yID0gMFxuXG4gICAgIyBSZW5kZXIgb3V0IHJvd3NcbiAgICBfKDQpLnRpbWVzIChpbmRleCkgPT5cbiAgICAgIHRkcyA9IFtdXG5cbiAgICAgICMgUmVuZGVyIG91dCBjb2x1bW5zXG4gICAgICBfKDQpLnRpbWVzIChpbmRleCkgPT5cblxuICAgICAgICAjIEluc3RhbnRpYXRlIGVhY2ggcGFkIHZpZXcgYW5kIHRpZSB0aGUgaWRcbiAgICAgICAgIyB0byB0aGUgRE9NIGVsZW1lbnRcblxuICAgICAgICBtb2RlbCA9IG5ldyBQYWRTcXVhcmVNb2RlbFxuICAgICAgICAgIGtleWNvZGU6IEBLRVlNQVBbaXRlcmF0b3JdXG4gICAgICAgICAgaW5kZXg6IGl0ZXJhdG9yICsgMVxuXG4gICAgICAgIHBhZFNxdWFyZSA9IG5ldyBQYWRTcXVhcmVcbiAgICAgICAgICBtb2RlbDogbW9kZWxcbiAgICAgICAgICBjb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgICAgIEBwYWRTcXVhcmVDb2xsZWN0aW9uLmFkZCBtb2RlbFxuICAgICAgICBAcGFkU3F1YXJlVmlld3MucHVzaCBwYWRTcXVhcmVcbiAgICAgICAgaXRlcmF0b3IrK1xuXG4gICAgICAgICMgQmVnaW4gbGlzdGVuaW5nIHRvIGRyYWcgLyByZWxlYXNlIC8gcmVtb3ZlIGV2ZW50cyBmcm9tXG4gICAgICAgICMgZWFjaCBwYWQgc3F1YXJlIGFuZCByZS1yZW5kZXIgcGFkIHNxdWFyZXNcblxuICAgICAgICBAbGlzdGVuVG8gcGFkU3F1YXJlLCBBcHBFdmVudC5DSEFOR0VfRFJBR0dJTkcsIEBvbkRyYWdnaW5nQ2hhbmdlXG4gICAgICAgIEBsaXN0ZW5UbyBwYWRTcXVhcmUsIFB1YkV2ZW50LkJFQVQsIEBvbkJlYXRcblxuICAgICAgICB0ZHMucHVzaCB7XG4gICAgICAgICAgJ2lkJzogcGFkU3F1YXJlLm1vZGVsLmdldCgnaWQnKVxuICAgICAgICB9XG5cbiAgICAgIHJvd3MucHVzaCB7XG4gICAgICAgICdpZCc6IFwicGFkLXJvdy0je2luZGV4fVwiXG4gICAgICAgICd0ZHMnOiB0ZHNcbiAgICAgIH1cblxuICAgIHBhZFRhYmxlLnJvd3MgPSByb3dzXG4gICAgcGFkVGFibGVcblxuXG4gICMgUmVuZGVyIG91dCB0aGUgaW5zdHJ1bWVudCB0YWJsZSBhbmQgcHVzaCBpdCBpbnRvXG4gICMgYW5kIGFycmF5IG9mIGluZGl2aWR1YWwgaW5zdHJ1bWVudHNcbiAgIyBAcmV0dXJuIHtPYmplY3R9XG5cbiAgcmV0dXJuSW5zdHJ1bWVudFRhYmxlRGF0YTogLT5cbiAgICBpbnN0cnVtZW50VGFibGUgPSBAa2l0Q29sbGVjdGlvbi5tYXAgKGtpdCkgPT5cbiAgICAgIGluc3RydW1lbnRDb2xsZWN0aW9uID0ga2l0LmdldCgnaW5zdHJ1bWVudHMnKVxuXG4gICAgICAjIEJlZ2luIGxpc3RlbmluZyB0byBkcm9wIGV2ZW50cyBmb3IgZWFjaCBpbnN0cnVtZW50XG4gICAgICAjIGluIHRoZSBJbnN0cnVtZW50IGNvbGxlY3Rpb25cblxuICAgICAgQGxpc3RlblRvIGluc3RydW1lbnRDb2xsZWN0aW9uLCBBcHBFdmVudC5DSEFOR0VfRFJPUFBFRCwgQG9uRHJvcHBlZENoYW5nZVxuXG4gICAgICBpbnN0cnVtZW50cyA9IGluc3RydW1lbnRDb2xsZWN0aW9uLm1hcCAoaW5zdHJ1bWVudCkgPT5cbiAgICAgICAgaW5zdHJ1bWVudC50b0pTT04oKVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAnbGFiZWwnOiBraXQuZ2V0ICdsYWJlbCdcbiAgICAgICAgJ2ljb24nOiBraXQuZ2V0ICdpY29uJ1xuICAgICAgICAnaW5zdHJ1bWVudHMnOiBpbnN0cnVtZW50c1xuICAgICAgfVxuXG4gICAgaW5zdHJ1bWVudFRhYmxlXG5cblxuICByZXNlbGVjdE1vYmlsZVRhYjogLT5cbiAgICBAJGtpdHMuaGlkZSgpXG4gICAgJChAJGtpdHNbQHNlbGVjdGVkSW5kZXhdKS5zaG93KClcbiAgICAkKEAkdGFic1tAc2VsZWN0ZWRJbmRleF0pLmFkZENsYXNzICdzZWxlY3RlZCdcblxubW9kdWxlLmV4cG9ydHMgPSBMaXZlUGFkXG4iLCIjIyMqXG4gKiBMaXZlIE1QQyBcInBhZFwiIGNvbXBvbmVudFxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNC4xNFxuIyMjXG5cbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblB1YkV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYWQtc3F1YXJlLXRlbXBsYXRlLmhicydcblxuY2xhc3MgUGFkU3F1YXJlIGV4dGVuZHMgVmlld1xuXG4gICMgVGhlIGRlbGF5IHRpbWUgYmVmb3JlIGRyYWcgZnVuY3Rpb25hbGl0eSBpcyBpbml0aWFsaXplZFxuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgRFJBR19UUklHR0VSX0RFTEFZOiA2MDBcblxuICAjIFRoZSBjbGFzc25hbWUgZm9yIHRoZSBQYWQgU3F1YXJlXG4gICMgQHR5cGUge1N0cmluZ31cblxuICBjbGFzc05hbWU6ICdwYWQtc3F1YXJlJ1xuXG4gICMgVGhlIHRlbXBsYXRlXG4gICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG4gICMgTW9kZWwgd2hpY2ggdHJhY2tzIHN0YXRlIG9mIHNxdWFyZSBhbmQgaW5zdHJ1bWVudHNcbiAgIyBAdHlwZSB7UGFkU3F1YXJlTW9kZWx9XG5cbiAgbW9kZWw6IG51bGxcblxuICAjIFRoZSBjdXJyZW50IGljb24gY2xhc3MgYXMgYXBwbGllZCB0byB0aGUgc3F1YXJlXG4gICMgQHR5cGUge1N0cmluZ31cblxuICBjdXJyZW50SWNvbjogbnVsbFxuXG4gICMgVGhlIGF1ZGlvIHBsYXliYWNrIGNvbXBvbmVudFxuICAjIEB0eXBlIHtIb3dsfVxuXG4gIGF1ZGlvUGxheWJhY2s6IG51bGxcblxuICBldmVudHM6XG4gICAgJ3RvdWNoc3RhcnQnOiAnb25QcmVzcydcbiAgICAndGFwaG9sZCc6ICdvbkhvbGQnXG5cblxuICAjIFJlbmRlcnMgb3V0IGluZGl2aWR1YWwgcGFkIHNxdWFyZXNcblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEAkYm9yZGVyID0gQCRlbC5maW5kICcuYm9yZGVyLWRhcmsnXG4gICAgQCRrZXljb2RlID0gQCRlbC5maW5kICcua2V5LWNvZGUnXG4gICAgQCRpY29uQ29udGFpbmVyID0gQCRlbC5maW5kICcuY29udGFpbmVyLWljb24nXG4gICAgQCRpY29uID0gQCRpY29uQ29udGFpbmVyLmZpbmQgJy5pY29uJ1xuXG4gICAgVHdlZW5MaXRlLnNldCBAJGJvcmRlciwgYXV0b0FscGhhOiAwXG4gICAgVHdlZW5MaXRlLnNldCBAJGtleWNvZGUsIHNjYWxlOiAuN1xuICAgIEBcblxuXG4gICMgUmVtb3ZlcyB0aGUgcGFkIHNxdWFyZSBmcm9tIHRoZSBkb20gYW5kIGNsZWFyc1xuICAjIG91dCBwcmUtc2V0IG9yIHVzZXItc2V0IHByb3BlcnRpZXNcblxuICByZW1vdmU6IC0+XG4gICAgQHJlbW92ZVNvdW5kQW5kQ2xlYXJQYWQoKVxuICAgIHN1cGVyKClcblxuXG4gICMgQWRkIGxpc3RlbmVycyByZWxhdGVkIHRvIGRyYWdnaW5nLCBkcm9wcGluZyBhbmQgY2hhbmdlc1xuICAjIHRvIGluc3RydW1lbnRzLlxuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgIEBsaXN0ZW5UbyBAbW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9UUklHR0VSLCBAb25UcmlnZ2VyQ2hhbmdlXG4gICAgQGxpc3RlblRvIEBtb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0RST1BQRUQsIEBvbkRyb3BwZWRDaGFuZ2VcbiAgICBAbGlzdGVuVG8gQG1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cbiAgIyBVcGRhdGVzIHRoZSB2aXN1YWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIHBhZCBzcXVhcmVcblxuICB1cGRhdGVJbnN0cnVtZW50Q2xhc3M6IC0+XG4gICAgaW5zdHJ1bWVudCA9IEBtb2RlbC5nZXQgJ2N1cnJlbnRJbnN0cnVtZW50J1xuICAgIEBpbnN0cnVtZW50SWQgPSBpbnN0cnVtZW50LmdldCAnaWQnXG4gICAgQCRlbC5wYXJlbnQoKS5hZGRDbGFzcyBAaW5zdHJ1bWVudElkXG5cblxuICAjIFJlbmRlcnMgb3V0IHRoZSBpbml0aWFsIGljb24gYW5kIHNldHMgdGhlIGlzbnRydW1lbnRcblxuICByZW5kZXJJY29uOiAtPlxuICAgIGlmIEAkaWNvbi5oYXNDbGFzcyBAY3VycmVudEljb25cbiAgICAgIEAkaWNvbi5yZW1vdmVDbGFzcyBAY3VycmVudEljb25cblxuICAgIGluc3RydW1lbnQgPSBAbW9kZWwuZ2V0ICdjdXJyZW50SW5zdHJ1bWVudCdcblxuICAgIHVubGVzcyBpbnN0cnVtZW50IGlzIG51bGxcbiAgICAgIEBjdXJyZW50SWNvbiA9IGluc3RydW1lbnQuZ2V0ICdpY29uJ1xuICAgICAgQCRpY29uLmFkZENsYXNzIEBjdXJyZW50SWNvblxuXG5cbiAgIyBTZXRzIHRoZSBjdXJyZW50IHNvdW5kIGFuZCBlbmFibGVzIGF1ZGlvIHBsYXliYWNrXG5cbiAgc2V0U291bmQ6IC0+XG4gICAgaW5zdHJ1bWVudCA9IEBtb2RlbC5nZXQgJ2N1cnJlbnRJbnN0cnVtZW50J1xuXG4gICAgdW5sZXNzIGluc3RydW1lbnQgaXMgbnVsbFxuICAgICAgYXVkaW9TcmMgPSBpbnN0cnVtZW50LmdldCAnc3JjJ1xuXG4gICAgICBAYXVkaW9QbGF5YmFjayA9IGNyZWF0ZWpzLlNvdW5kLmNyZWF0ZUluc3RhbmNlIGF1ZGlvU3JjXG4gICAgICBAYXVkaW9QbGF5YmFjay52b2x1bWUgPSBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5oaWdoXG4gICAgICBAYXVkaW9QbGF5YmFjay5hZGRFdmVudExpc3RlbmVyICdjb21wbGV0ZScsIEBvblNvdW5kRW5kXG5cblxuICAjIFRyaWdnZXJzIGF1ZGlvIHBsYXliYWNrXG5cbiAgcGxheVNvdW5kOiAtPlxuICAgIEBhdWRpb1BsYXliYWNrPy5wbGF5KClcblxuICAgIHVubGVzcyBAaXNNb2JpbGVcblxuICAgICAgIyBNYWtlIHN1cmUgdGhhdCB0aGVyZSdzIGFuIGluc3RydW1lbnQgYXR0YWNoZWRcbiAgICAgICMgdG8gdGhlIHBhZCBiZWZvcmUgdHJpZ2dlcmluZyB0aGUgdmlzdWFsaXphdGlvblxuXG4gICAgICBpZiBAbW9kZWwuZ2V0KCdjdXJyZW50SW5zdHJ1bWVudCcpXG4gICAgICAgIEB0cmlnZ2VyIFB1YkV2ZW50LkJFQVQsIGxpdmVQYWQ6IHRydWVcblxuICAgIEBtb2RlbC5zZXQgJ3RyaWdnZXInLCBmYWxzZVxuXG5cbiAgIyBHZW5lcmljIHJlbW92ZSBhbmQgY2xlYXIgd2hpY2ggaXMgdHJpZ2dlcmVkIHdoZW4gYSB1c2VyXG4gICMgZHJhZ3MgdGhlIGluc3RydW1lbnQgb2ZmIG9mIHRoZSBwYWQgb3IgdGhlIHZpZXcgaXMgZGVzdHJveWVkXG5cbiAgcmVtb3ZlU291bmRBbmRDbGVhclBhZDogLT5cbiAgICBpZiBAbW9kZWwuZ2V0KCdjdXJyZW50SW5zdHJ1bWVudCcpIGlzIG51bGxcbiAgICAgIHJldHVyblxuXG4gICAgQGF1ZGlvUGxheWJhY2sgPSBudWxsXG5cbiAgICBjdXJyZW50SW5zdHJ1bWVudCA9IEBtb2RlbC5nZXQgJ2N1cnJlbnRJbnN0cnVtZW50J1xuXG4gICAgaWQgPSBjdXJyZW50SW5zdHJ1bWVudC5nZXQgJ2lkJ1xuICAgIGljb24gPSBjdXJyZW50SW5zdHJ1bWVudC5nZXQgJ2ljb24nXG5cbiAgICBAJGVsLnBhcmVudCgpLnJlbW92ZUF0dHIgJ2RhdGEtaW5zdHJ1bWVudCdcbiAgICBAJGVsLnBhcmVudCgpLnJlbW92ZUNsYXNzIGlkXG4gICAgQCRlbC5yZW1vdmVDbGFzcyBpZFxuICAgIEAkaWNvbi5yZW1vdmVDbGFzcyBpY29uXG4gICAgQCRpY29uLnRleHQgJydcblxuXG4gICMgRXZlbnQgaGFuZGxlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLVxuXG4gICMgSGFuZGxlciBmb3IgcHJlc3MgZXZlbnRzLCB3aGljaCwgd2hlbiBoZWxkXG4gICMgdHJpZ2dlcnMgYSBcImRyYWdcIiBldmVudCBvbiB0aGUgbW9kZWxcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgb25QcmVzczogKGV2ZW50KSA9PlxuICAgIEBtb2RlbC5zZXQgJ3RyaWdnZXInLCB0cnVlXG5cbiAgICBUd2VlbkxpdGUudG8gQCRlbCwgLjIsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjRTQxRTJCJ1xuXG4gICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICBUd2VlbkxpdGUudG8gQCRlbCwgLjIsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2U1ZTVlNSdcblxuXG4gICMgSGFuZGxlciBmb3IgcmVsZWFzZSBldmVudHMgd2hpY2ggY2xlYXJzXG4gICMgZHJhZyB3aGV0aGVyIGRyYWcgd2FzIGluaXRpYXRlZCBvciBub3RcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgb25SZWxlYXNlOiAoZXZlbnQpID0+XG4gICAgQG1vZGVsLnNldCAnZHJhZ2dpbmcnLCBmYWxzZVxuXG5cbiAgb25Ib2xkOiAoZXZlbnQpID0+XG4gICAgY3VycmVudEluc3RydW1lbnQgPSBAbW9kZWwuZ2V0KCdjdXJyZW50SW5zdHJ1bWVudCcpXG4gICAgaW5zdHJ1bWVudElkID0gQCRlbC5wYXJlbnQoKS5hdHRyICdkYXRhLWluc3RydW1lbnQnXG5cbiAgICBpZiBjdXJyZW50SW5zdHJ1bWVudCBpcyBudWxsIHRoZW4gcmV0dXJuXG5cbiAgICBAbW9kZWwuc2V0ICdkcm9wcGVkJywgZmFsc2VcbiAgICBjdXJyZW50SW5zdHJ1bWVudC5zZXQgJ2Ryb3BwZWQnLCBmYWxzZVxuXG4gICAgIyBEaXNwYXRjaCBkcmFnIHN0YXJ0IGV2ZW50IGJhY2sgdG8gTGl2ZVBhZFxuICAgIEB0cmlnZ2VyIEFwcEV2ZW50LkNIQU5HRV9EUkFHR0lORywge1xuICAgICAgJ2luc3RydW1lbnRJZCc6IGluc3RydW1lbnRJZFxuICAgICAgJ3BhZFNxdWFyZSc6IEBcbiAgICAgICckcGFkU3F1YXJlJzogQCRlbC5wYXJlbnQoKVxuICAgICAgJ2V2ZW50JzogZXZlbnRcbiAgICB9XG5cblxuICAjIEhhbmRsZXIgZm9yIGRyb3AgY2hhbmdlIGV2ZW50cywgd2hpY2ggY2hlY2tzIHRvIHNlZVxuICAjIGlmIGl0cyBiZWVuIGV4dHJhY3RlZCBmcm9tIHRoZSBwYWQgc3F1YXJlIHRvIGJlIGRyb3BwZWRcbiAgIyBiYWNrIGludG8gdGhlIGluc3RydW1lbnQgZ3JvdXBcbiAgIyBAcGFyYW0ge1BhZFNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gIG9uRHJvcHBlZENoYW5nZTogKG1vZGVsKSA9PlxuICAgIGRyb3BwZWQgPSBtb2RlbC5jaGFuZ2VkLmRyb3BwZWRcblxuICAgIGlmIGRyb3BwZWQgaXMgZmFsc2VcbiAgICAgIEByZW1vdmVTb3VuZEFuZENsZWFyUGFkKClcblxuXG4gICMgSGFuZGxlciBmb3IgJ2NoYW5nZTp0cmlnZ2VyJyBldmVudHMsIHdoaWNoIHRyaWdnZXJzXG4gICMgc291bmQgcGxheWJhY2sgd2hpY2ggdGhlbiByZXNldHMgaXQgdG8gZmFsc2Ugb24gY29tcGxldFxuICAjIEBwYXJhbSB7UGFkU3F1YXJlTW9kZWx9IG1vZGVsXG5cbiAgb25UcmlnZ2VyQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgdHJpZ2dlciA9IG1vZGVsLmNoYW5nZWQudHJpZ2dlclxuXG4gICAgaWYgdHJpZ2dlclxuICAgICAgQHBsYXlTb3VuZCgpXG5cblxuICAjIEhhbmRsZXIgZm9yICdjaGFuZ2U6Y3VycmVudEluc3RydW1lbnQnIGV2ZW50cywgd2hpY2ggdXBkYXRlc1xuICAjIHRoZSBwYWQgc3F1YXJlIHdpdGggdGhlIGFwcHJvcHJpYXRlIGRhdGFcbiAgIyBAcGFyYW0ge1BhZFNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gIG9uSW5zdHJ1bWVudENoYW5nZTogKG1vZGVsKSA9PlxuICAgIGluc3RydW1lbnQgPSBtb2RlbC5jaGFuZ2VkLmN1cnJlbnRJbnN0cnVtZW50XG5cbiAgICB1bmxlc3MgaW5zdHJ1bWVudCBpcyBudWxsIG9yIGluc3RydW1lbnQgaXMgdW5kZWZpbmVkXG4gICAgICBAbW9kZWwuc2V0ICdkcm9wcGVkJywgdHJ1ZVxuICAgICAgQHVwZGF0ZUluc3RydW1lbnRDbGFzcygpXG4gICAgICBAcmVuZGVySWNvbigpXG4gICAgICBAc2V0U291bmQoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBzb3VuZCBlbmQgZXZlbnRzLCB3aGljaCByZXNldHMgdGhlIHNvdW5kIHBsYXliYWNrXG5cbiAgb25Tb3VuZEVuZDogPT5cbiAgICBAbW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZFNxdWFyZVxuIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJoZWFkbGluZVxcXCI+XFxuXHRcdERSQUcgRFJVTSBCRUxPVyBUTyBBU1NJR04gVE8gTkVXIFBBRFxcblx0PC9kaXY+XFxuXFxuXHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaW5zdHJ1bWVudFRhYmxlLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMiwgcHJvZ3JhbTIsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXFxuXFxuXFxuXCJcbiAgICArIFwiXFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cbmZ1bmN0aW9uIHByb2dyYW0yKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLWtpdCc+XFxuXHRcdFx0PGRpdiBjbGFzcz0na2l0LXR5cGUnPlxcblx0XHRcdFx0PHNwYW4+XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmxhYmVsKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5sYWJlbDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIjwvc3Bhbj5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaW5zdHJ1bWVudHMsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cdFx0PC9kaXY+XFxuXHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblxcblx0XHRcdFx0PGRpdiBjbGFzcz0naW5zdHJ1bWVudCBcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWNvbikgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWNvbjsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIiBcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmRyb3BwZWQsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSg0LCBwcm9ncmFtNCwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCInIGlkPVxcXCJcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWQpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmlkOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIj5cXG5cXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5mdW5jdGlvbiBwcm9ncmFtNChkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIiBoaWRkZW4gXCI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTYoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblxcblx0PGRpdiBjbGFzcz1cXFwiaGVhZGxpbmVcXFwiPlxcblx0XHREUkFHIERSVU0gQkVMT1cgVE8gQVNTSUdOIFRPIE5FVyBQQURcXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz0nY29udGFpbmVyLXRhYnMnPlxcblx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaW5zdHJ1bWVudFRhYmxlLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oNywgcHJvZ3JhbTcsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHQ8L2Rpdj5cXG5cXG5cdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsIGRlcHRoMC5pbnN0cnVtZW50VGFibGUsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSg5LCBwcm9ncmFtOSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTcoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdDxkaXYgY2xhc3M9J3RhYic+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPSdraXQtdHlwZSc+XFxuXHRcdFx0XHRcdDxzcGFuPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5sYWJlbCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAubGFiZWw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI8L3NwYW4+XFxuXHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTkoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8ZGl2IGNsYXNzPSdjb250YWluZXIta2l0Jz5cXG5cXG5cdFx0XHRcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCBkZXB0aDAuaW5zdHJ1bWVudHMsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG5cdFx0PC9kaXY+XFxuXHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlxcblxcblwiXG4gICAgKyBcIlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYucHJvZ3JhbSg2LCBwcm9ncmFtNiwgZGF0YSksZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCI7XG4gIGJ1ZmZlciArPSBcIlxcblxcblx0PGRpdiBjbGFzcz0nd3JhcHBlcic+XFxuXHRcdDxkaXYgY2xhc3M9J2xlZnQtd3JhcHBlcic+XFxuXHRcdFx0PGRpdiBjbGFzcz0nbGVmdCc+XFxuXHRcdFx0XHQ8dGFibGUgY2xhc3M9J2NvbnRhaW5lci1wYWRzJz5cXG5cXG5cdFx0XHRcdDwvdGFibGU+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPSdyaWdodCc+XFxuXHRcdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLWluc3RydW1lbnRzJz5cXG5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cXG5cXG5cIlxuICAgICsgXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblxcblx0PGRpdiBjbGFzcz0nd3JhcHBlcic+XFxuXHRcdDxkaXYgY2xhc3M9J2xlZnQtd3JhcHBlcic+XFxuXHRcdFx0PGRpdiBjbGFzcz0nbGVmdCc+XFxuXHRcdFx0XHQ8dGFibGUgY2xhc3M9J2NvbnRhaW5lci1wYWRzJz5cXG5cXG5cdFx0XHRcdDwvdGFibGU+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdyaWdodCc+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz0ndG9wJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9J2NvbnRhaW5lci1wbGF5LXBhdXNlJz5cXG5cdFx0XHRcdFx0cGxheSBwYXVzZVxcblx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0PC9kaXY+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz0nbWlkZGxlJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9J2NvbnRhaW5lci1pbnN0cnVtZW50cyc+XFxuXFxuXHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPSdib3R0b20nPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwiYnRuLWJhY2sgYnRuXFxcIj4mbHQ7IEJhY2s8L2Rpdj5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlxcblwiXG4gICAgKyBcIlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8ZGl2IGNsYXNzPSdwYWQtbnVtYmVyJz5cXG5cdFx0PHNwYW4gY2xhc3M9J3RleHQnPlxcblx0XHRcdFBBRCBcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaW5kZXgpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmluZGV4OyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHRcdDwvc3Bhbj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz0na2V5LWNvZGUnPlxcblx0XHQ8c3BhbiBjbGFzcz0ndGV4dCc+XFxuXHRcdFx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmtleWNvZGUpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmtleWNvZGU7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdFx0PC9zcGFuPlxcblx0PC9kaXY+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPSdib3JkZXItZGFyaycgLz5cXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmlzRGVza3RvcCwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcbjxkaXYgY2xhc3M9J2NvbnRhaW5lci1pY29uJz5cXG5cdDxkaXYgY2xhc3M9J2ljb24nPlxcblxcblx0PC9kaXY+XFxuPC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc3RhY2syLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxO1xuICBidWZmZXIgKz0gXCJcXG5cdDx0cj5cXG5cdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwgZGVwdGgwLnRkcywge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDIsIHByb2dyYW0yLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC90cj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuZnVuY3Rpb24gcHJvZ3JhbTIoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazE7XG4gIGJ1ZmZlciArPSBcIlxcblx0XHRcdDx0ZCBjbGFzcz0nY29udGFpbmVyLXBhZCcgaWQ9XFxcIlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5pZCkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWQ7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiPlxcblxcblx0XHRcdDwvdGQ+XFxuXHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgc3RhY2syID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCAoKHN0YWNrMSA9IGRlcHRoMC5wYWRUYWJsZSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5yb3dzKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIiMjIypcbiAqIEluZGl2aWR1YWwgc2VxdWVuY2VyIHRyYWNrc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4xOC4xNFxuIyMjXG5cblB1YlN1YiAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3V0aWxzL1B1YlN1YidcbkFwcENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuUHViRXZlbnQgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcbkFwcEV2ZW50ICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9wYXR0ZXJuLXNxdWFyZS10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIFBhdHRlcm5TcXVhcmUgZXh0ZW5kcyBWaWV3XG5cbiAgIyBUaGUgY29udGFpbmVyIGNsYXNzbmFtZVxuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgY2xhc3NOYW1lOiAncGF0dGVybi1zcXVhcmUnXG5cbiAgIyBUaGUgRE9NIHRhZyBhbmVtXG4gICMgQHR5cGUge1N0cmluZ31cblxuICB0YWdOYW1lOiAndGQnXG5cbiAgIyBUaGUgdGVtcGxhdGVcbiAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cbiAgIyBUaGUgYXVkaW8gcGxheWJhY2sgaW5zdGFuY2UgKEhvd2xlcilcbiAgIyBAdHlwZSB7SG93bH1cblxuICBhdWRpb1BsYXliYWNrOiBudWxsXG5cbiAgIyBUaGUgbW9kZWwgd2hpY2ggY29udHJvbHMgdm9sdW1lLCBwbGF5YmFjaywgZXRjXG4gICMgQHR5cGUge1BhdHRlcm5TcXVhcmVNb2RlbH1cblxuICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG51bGxcblxuICBldmVudHM6XG4gICAgJ21vdXNlb3Zlcic6ICdvbk1vdXNlT3ZlcidcbiAgICAnbW91c2VvdXQnOiAnb25Nb3VzZU91dCdcbiAgICAndG91Y2hlbmQnOiAnb25DbGljaydcblxuXG4gICMgUmVuZGVycyB0aGUgdmlldyBhbmQgaW5zdGFudGlhdGVzIHRoZSBob3dsZXIgYXVkaW8gZW5naW5lXG4gICMgQHBhdHRlcm5TcXVhcmVNb2RlbCB7T2JqZWN0fSBvcHRpb25zXG5cbiAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG5cbiAgICBAJGJvcmRlciA9IEAkZWwuZmluZCAnLmJvcmRlci1kYXJrJ1xuICAgIEAkaWNvbiA9IEAkZWwuZmluZCAnLmljb24nXG5cbiAgICBUd2VlbkxpdGUuc2V0IEAkYm9yZGVyLCBhdXRvQWxwaGE6IDBcbiAgICBUd2VlbkxpdGUuc2V0IEAkaWNvbiwgYXV0b0FscGhhOiAwLCBzY2FsZTogMFxuXG4gICAgYXVkaW9TcmMgPSAnJ1xuXG4gICAgaWYgQHBhdHRlcm5TcXVhcmVNb2RlbC5nZXQoJ2luc3RydW1lbnQnKVxuICAgICAgQGF1ZGlvU3JjID0gYXVkaW9TcmMgPSBAcGF0dGVyblNxdWFyZU1vZGVsLmdldCgnaW5zdHJ1bWVudCcpLmdldCAnc3JjJ1xuXG4gICAgIyBUT0RPOiBUZXN0IG1ldGhvZHNcbiAgICAjaWYgd2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZigndGVzdCcpIGlzbnQgLTEgdGhlbiBhdWRpb1NyYyA9ICcnXG5cbiAgICBAYXVkaW9QbGF5YmFjayA9IGNyZWF0ZWpzLlNvdW5kLmNyZWF0ZUluc3RhbmNlIGF1ZGlvU3JjXG4gICAgQGF1ZGlvUGxheWJhY2suYWRkRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnLCBAb25Tb3VuZEVuZFxuICAgIEBcblxuXG4gICMgUmVtb3ZlIHRoZSB2aWV3IGFuZCBkZXN0cm95IHRoZSBhdWRpbyBwbGF5YmFja1xuXG4gIHJlbW92ZTogLT5cbiAgICBAYXVkaW9QbGF5YmFjayA9IG51bGxcbiAgICBzdXBlcigpXG5cblxuICAjIEFkZHMgZXZlbnQgbGlzdGVuZXJzIGFuZCBiZWdpbnMgbGlzdGVuaW5nIGZvciB2ZWxvY2l0eSwgYWN0aXZpdHkgYW5kIHRyaWdnZXJzXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9WRUxPQ0lUWSwgQG9uVmVsb2NpdHlDaGFuZ2VcbiAgICBAbGlzdGVuVG8gQHBhdHRlcm5TcXVhcmVNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX0FDVElWRSwgQG9uQWN0aXZlQ2hhbmdlXG4gICAgQGxpc3RlblRvIEBwYXR0ZXJuU3F1YXJlTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9UUklHR0VSLCBAb25UcmlnZ2VyQ2hhbmdlXG5cblxuICAjIEVuYWJsZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgZW5hYmxlOiAtPlxuICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuZW5hYmxlKClcblxuXG4gICMgRGlzYWJsZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgZGlzYWJsZTogLT5cbiAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmRpc2FibGUoKVxuXG5cbiAgIyBQbGF5YmFjayBhdWRpbyBvbiB0aGUgYXVkaW8gc3F1YXJlXG5cbiAgcGxheTogLT5cbiAgICBAYXVkaW9QbGF5YmFjay5wbGF5KClcblxuICAgIHVubGVzcyBAaXNNb2JpbGVcbiAgICAgIEB0cmlnZ2VyIFB1YkV2ZW50LkJFQVQsIHBhdHRlcm5TcXVhcmVNb2RlbDogQHBhdHRlcm5TcXVhcmVNb2RlbC50b0pTT04oKVxuXG4gICAgVHdlZW5MaXRlLnRvIEAkaWNvbiwgLjMsXG4gICAgICBzY2FsZTogMS4yXG4gICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcblxuICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgVHdlZW5MaXRlLnRvIEAkaWNvbiwgLjMsXG4gICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcblxuXG4gICAgVHdlZW5MaXRlLnRvIEAkZWwsIC4yLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiNFNDFFMkJcIlxuXG4gICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICBUd2VlbkxpdGUudG8gQCRlbCwgLjIsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiNFNUU1RTVcIlxuXG5cbiAgIyBFdmVudCBoYW5kbGVyc1xuICAjIC0tLS0tLS0tLS0tLS0tXG5cbiAgb25Nb3VzZU92ZXI6IChldmVudCkgLT5cbiAgICBUd2VlbkxpdGUudG8gQCRib3JkZXIsIC4yLFxuICAgICAgYXV0b0FscGhhOiAuNVxuXG5cbiAgb25Nb3VzZU91dDogKGV2ZW50KSAtPlxuICAgIFR3ZWVuTGl0ZS50byBAJGJvcmRlciwgLjIsXG4gICAgICBhdXRvQWxwaGE6IDBcblxuXG4gICMgSGFuZGxlciBmb3IgY2xpY2sgZXZlbnRzIG9uIHRoZSBhdWRpbyBzcXVhcmUuICBUb2dnbGVzIHRoZVxuICAjIHZvbHVtZSBmcm9tIGxvdyB0byBoaWdoIHRvIG9mZlxuXG4gIG9uQ2xpY2s6IChldmVudCkgLT5cbiAgICBAcGF0dGVyblNxdWFyZU1vZGVsLmN5Y2xlKClcblxuXG4gICMgSGFuZGxlciBmb3IgdmVsb2NpdHkgY2hhbmdlIGV2ZW50cy4gIFVwZGF0ZXMgdGhlIHZpc3VhbCBkaXNwbGF5IGFuZCBzZXRzIHZvbHVtZVxuICAjIEBwYXJhbSB7UGF0dGVyblNxdWFyZU1vZGVsfSBtb2RlbFxuXG4gIG9uVmVsb2NpdHlDaGFuZ2U6IChtb2RlbCkgLT5cblxuICAgIHJlbW92ZUNsYXNzID0gPT5cbiAgICAgIEAkaWNvbi5yZW1vdmVDbGFzcyAndmVsb2NpdHktc29mdCB2ZWxvY2l0eS1tZWRpdW0gdmVsb2NpdHktaGFyZCBwbGF5J1xuXG4gICAgYWRkQ2xhc3MgPSA9PlxuICAgICAgQCRpY29uLmFkZENsYXNzIHZlbG9jaXR5Q2xhc3NcblxuICAgIHZlbG9jaXR5ID0gbW9kZWwuY2hhbmdlZC52ZWxvY2l0eVxuXG4gICAgIyBTZXQgdmlzdWFsIGluZGljYXRvclxuICAgIHZlbG9jaXR5Q2xhc3MgPSBzd2l0Y2ggdmVsb2NpdHlcbiAgICAgIHdoZW4gMSB0aGVuICd2ZWxvY2l0eS1zb2Z0IHBsYXknXG4gICAgICB3aGVuIDIgdGhlbiAndmVsb2NpdHktbWVkaXVtIHBsYXknXG4gICAgICB3aGVuIDMgdGhlbiAndmVsb2NpdHktaGFyZCBwbGF5J1xuICAgICAgZWxzZSAnJ1xuXG4gICAgIyBBbmltYXRlIGluIGlmIHRoZSB1c2VyIGlzIGFkZGluZyBhIHBhdHRlcm5cbiAgICBpZiB2ZWxvY2l0eUNsYXNzIGlzbnQgJydcbiAgICAgIHJlbW92ZUNsYXNzKClcblxuICAgICAgaWYgdmVsb2NpdHlDbGFzcyBpcyAndmVsb2NpdHktc29mdCBwbGF5J1xuICAgICAgICBUd2VlbkxpdGUuc2V0IEAkaWNvbiwgYXV0b0FscGhhOiAwLCBzY2FsZTogMFxuXG4gICAgICByb3RhdGlvbiA9IHN3aXRjaCB2ZWxvY2l0eVxuICAgICAgICB3aGVuIDEgdGhlbiA5MFxuICAgICAgICB3aGVuIDIgdGhlbiAxODBcbiAgICAgICAgd2hlbiAzIHRoZW4gMjcwXG4gICAgICAgIGVsc2UgMFxuXG4gICAgICBUd2VlbkxpdGUudG8gQCRpY29uLCAuMixcbiAgICAgICAgYXV0b0FscGhhOiAxXG4gICAgICAgIHNjYWxlOiAxXG4gICAgICAgIHJvdGF0aW9uOiByb3RhdGlvblxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VPdXRcblxuICAgICAgYWRkQ2xhc3MoKVxuXG4gICAgIyBVc2VyIGlzIHJlbW92aW5nIHRoZSBwYXR0ZXJuLCBhbmltYXRlIG91dFxuICAgIGVsc2VcbiAgICAgIFR3ZWVuTGl0ZS50byBAJGljb24sIC4yLFxuICAgICAgICBzY2FsZTogMFxuICAgICAgICBlYXNlOiBCYWNrLmVhc2VJblxuICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgIFR3ZWVuTGl0ZS5zZXQgQCRpY29uLCByb3RhdGlvbjogMFxuICAgICAgICAgIHJlbW92ZUNsYXNzKClcblxuICAgICMgVHJpZ2dlciBtb3VzZSBvdXQgdG8gaGlkZSBib3JkZXJcbiAgICBAb25Nb3VzZU91dCgpXG5cbiAgICAjIFNldCBhdWRpbyB2b2x1bWVcbiAgICB2b2x1bWUgPSBzd2l0Y2ggdmVsb2NpdHlcbiAgICAgIHdoZW4gMSB0aGVuIEFwcENvbmZpZy5WT0xVTUVfTEVWRUxTLmxvd1xuICAgICAgd2hlbiAyIHRoZW4gQXBwQ29uZmlnLlZPTFVNRV9MRVZFTFMubWVkaXVtXG4gICAgICB3aGVuIDMgdGhlbiBBcHBDb25maWcuVk9MVU1FX0xFVkVMUy5oaWdoXG4gICAgICBlbHNlICcnXG5cbiAgICBAYXVkaW9QbGF5YmFjay52b2x1bWUgPSB2b2x1bWVcblxuXG4gICMgSGFuZGxlciBmb3IgYWN0aXZpdHkgY2hhbmdlIGV2ZW50cy4gIFdoZW4gaW5hY3RpdmUsIGNoZWNrcyBhZ2FpbnN0IHBsYXliYWNrIGFyZVxuICAjIG5vdCBwZXJmb3JtZWQgYW5kIHRoZSBzcXVhcmUgaXMgc2tpcHBlZC5cbiAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICBvbkFjdGl2ZUNoYW5nZTogKG1vZGVsKSAtPlxuXG5cbiAgIyBIYW5kbGVyIGZvciB0cmlnZ2VyIFwicGxheWJhY2tcIiBldmVudHNcbiAgIyBAcGFyYW0ge1BhdHRlcm5TcXVhcmVNb2RlbH0gbW9kZWxcblxuICBvblRyaWdnZXJDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICBpZiBtb2RlbC5jaGFuZ2VkLnRyaWdnZXIgaXMgdHJ1ZVxuICAgICAgQHBsYXkoKVxuXG4gICAgICAjIEF1dG8gc2V0IGl0IGZvciBub3dcbiAgICAgIEBwYXR0ZXJuU3F1YXJlTW9kZWwuc2V0ICd0cmlnZ2VyJywgZmFsc2VcblxuXG4gICMgSGFuZGxlciBmb3Igc291bmQgcGxheWJhY2sgZW5kIGV2ZW50cy4gIFJlbW92ZXMgdGhlIHRyaWdnZXJcbiAgIyBmbGFnIHNvIHRoZSBhdWRpbyB3b24ndCBvdmVybGFwXG5cbiAgb25Tb3VuZEVuZDogPT5cbiAgICBAcGF0dGVyblNxdWFyZU1vZGVsLnNldCAndHJpZ2dlcicsIGZhbHNlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuU3F1YXJlXG4iLCIjIyMqXG4gKiBJbmRpdmlkdWFsIHNlcXVlbmNlciB0cmFja3NcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5BcHBFdmVudCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9BcHBFdmVudC5jb2ZmZWUnXG5QdWJFdmVudCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL21vZGVscy9zZXF1ZW5jZXIvUGF0dGVyblNxdWFyZUNvbGxlY3Rpb24uY29mZmVlJ1xuUGF0dGVyblNxdWFyZU1vZGVsICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9tb2RlbHMvc2VxdWVuY2VyL1BhdHRlcm5TcXVhcmVNb2RlbC5jb2ZmZWUnXG5QYXR0ZXJuU3F1YXJlICAgICAgICAgICA9IHJlcXVpcmUgJy4vUGF0dGVyblNxdWFyZS5jb2ZmZWUnXG5WaWV3ICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvcGF0dGVybi10cmFjay10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIFBhdHRlcm5UcmFjayBleHRlbmRzIFZpZXdcblxuICAjIFRoZSBuYW1lIG9mIHRoZSBjbGFzc1xuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgY2xhc3NOYW1lOiAncGF0dGVybi10cmFjaydcblxuICAjIFRoZSB0eXBlIG9mIHRhZ1xuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgdGFnTmFtZTogJ3RyJ1xuXG4gICMgVGhlIHRlbXBsYXRlXG4gICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG4gICMgQSBjb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgdmlldyBzcXVhcmVzXG4gICMgQHR5cGUge0FycmF5fVxuXG4gIHBhdHRlcm5TcXVhcmVWaWV3czogbnVsbFxuXG4gICMgQHR5cGUge1BhdHRlcm5TcXVhcmVDb2xsZWN0aW9ufVxuICBjb2xsZWN0aW9uOiBudWxsXG5cbiAgIyBAdHlwZSB7SW5zdHJ1bWVudE1vZGVsfVxuICBtb2RlbDogbnVsbFxuXG4gIGV2ZW50czpcbiAgICAndG91Y2hlbmQgLmluc3RydW1lbnQnOiAnb25JbnN0cnVtZW50QnRuQ2xpY2snXG4gICAgJ3RvdWNoZW5kIC5idG4tbXV0ZSc6ICdvbk11dGVCdG5DbGljaydcblxuXG4gICMgUmVuZGVycyB0aGUgdmlldyBhbmQgcmVuZGVycyBvdXQgaW5kaXZpZHVhbCBwYXR0ZXJuIHNxdWFyZXNcbiAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgQCRpbnN0cnVtZW50ID0gQCRlbC5maW5kICcuaW5zdHJ1bWVudCdcbiAgICBAJG11dGUgPSBAJGVsLmZpbmQgJy5idG4tbXV0ZSdcblxuICAgIEAkbXV0ZS5oaWRlKClcbiAgICBAcmVuZGVyUGF0dGVyblNxdWFyZXMoKVxuICAgIEBcblxuXG4gIHJlbW92ZTogLT5cbiAgICBfLmVhY2ggQHBhdHRlcm5TcXVhcmVWaWV3cywgKHNxdWFyZSkgPT5cbiAgICAgIHNxdWFyZS5yZW1vdmUoKVxuXG4gICAgc3VwZXIoKVxuXG5cbiAgIyBBZGQgbGlzdGVuZXJzIHRvIHRoZSB2aWV3IHdoaWNoIGxpc3RlbiBmb3IgdmlldyBjaGFuZ2VzXG4gICMgYXMgd2VsbCBhcyBjaGFuZ2VzIHRvIHRoZSBjb2xsZWN0aW9uLCB3aGljaCBzaG91bGQgdXBkYXRlXG4gICMgcGF0dGVybiBzcXVhcmVzIHdpdGhvdXQgcmUtcmVuZGVyaW5nIHRoZSB2aWV3c1xuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiA9PlxuICAgIEBraXRNb2RlbCA9IEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJylcblxuICAgIEBsaXN0ZW5UbyBAbW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9GT0NVUywgQG9uRm9jdXNDaGFuZ2VcbiAgICBAbGlzdGVuVG8gQGtpdE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfSU5TVFJVTUVOVCwgQG9uSW5zdHJ1bWVudENoYW5nZVxuXG5cbiAgIyBSZW5kZXIgb3V0IHRoZSBwYXR0ZXJuIHNxdWFyZXMgYW5kIHB1c2ggdGhlbSBpbnRvIGFuIGFycmF5XG4gICMgZm9yIGZ1cnRoZXIgaXRlcmF0aW9uXG5cbiAgcmVuZGVyUGF0dGVyblNxdWFyZXM6IC0+XG4gICAgQHBhdHRlcm5TcXVhcmVWaWV3cyA9IFtdXG5cbiAgICBAY29sbGVjdGlvbiA9IG5ldyBQYXR0ZXJuU3F1YXJlQ29sbGVjdGlvblxuXG4gICAgXyg4KS50aW1lcyA9PlxuICAgICAgQGNvbGxlY3Rpb24uYWRkIG5ldyBQYXR0ZXJuU3F1YXJlTW9kZWwgeyBpbnN0cnVtZW50OiBAbW9kZWwgfVxuXG4gICAgQGNvbGxlY3Rpb24uZWFjaCAobW9kZWwpID0+XG5cbiAgICAgIG1vZGVsLnNldCAnb3JkZXJJbmRleCcsIEBvcmRlckluZGV4XG5cbiAgICAgIHBhdHRlcm5TcXVhcmUgPSBuZXcgUGF0dGVyblNxdWFyZVxuICAgICAgICBwYXR0ZXJuU3F1YXJlTW9kZWw6IG1vZGVsXG5cbiAgICAgIEAkaW5zdHJ1bWVudC50ZXh0IG1vZGVsLmdldCAnbGFiZWwnXG4gICAgICBAJGVsLmFwcGVuZCBwYXR0ZXJuU3F1YXJlLnJlbmRlcigpLmVsXG4gICAgICBAcGF0dGVyblNxdWFyZVZpZXdzLnB1c2ggcGF0dGVyblNxdWFyZVxuXG4gICAgICBAbGlzdGVuVG8gcGF0dGVyblNxdWFyZSwgUHViRXZlbnQuQkVBVCwgQG9uQmVhdFxuXG4gICAgIyBTZXQgdGhlIHNxdWFyZXMgb24gdGhlIEluc3RydW1lbnQgbW9kZWwgdG8gdHJhY2sgYWdhaW5zdCBzdGF0ZVxuICAgIEBtb2RlbC5zZXQgJ3BhdHRlcm5TcXVhcmVzJywgQGNvbGxlY3Rpb25cblxuXG4gIHNlbGVjdDogLT5cbiAgICBAJGVsLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG4gIGRlc2VsZWN0OiAtPlxuICAgIGlmIEAkZWwuaGFzQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgQCRlbC5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG5cblxuICAjIEV2ZW50IGhhbmRsZXJzXG4gICMgLS0tLS0tLS0tLS0tLS1cblxuICBvbkJlYXQ6IChwYXJhbXMpID0+XG4gICAgQHRyaWdnZXIgUHViRXZlbnQuQkVBVCwgcGFyYW1zXG5cblxuICAjIEhhbmRsZXIgZm9yIGNoYW5nZXMgdG8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBpbnN0cnVtZW50XG4gICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IGluc3RydW1lbnRNb2RlbFxuXG4gIG9uSW5zdHJ1bWVudENoYW5nZTogKGluc3RydW1lbnRNb2RlbCkgPT5cbiAgICBpbnN0cnVtZW50ID0gaW5zdHJ1bWVudE1vZGVsLmNoYW5nZWQuY3VycmVudEluc3RydW1lbnRcblxuICAgIGlmIGluc3RydW1lbnQuY2lkIGlzIEBtb2RlbC5jaWRcbiAgICAgIEBzZWxlY3QoKVxuXG4gICAgZWxzZSBAZGVzZWxlY3QoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBtdXRlIGJ1dHRvbiBjbGlja3NcbiAgIyBAcGFyYW0ge0luc3RydW1lbnRNb2RlbH0gbW9kZWxcblxuICBvbkluc3RydW1lbnRCdG5DbGljazogKGV2ZW50KSA9PlxuXG4gICAgIyBPZmYgc3RhdGUgPiBGb2N1c1xuICAgIGlmIEBtb2RlbC5nZXQoJ211dGUnKSBpcyBmYWxzZSBhbmQgQG1vZGVsLmdldCgnZm9jdXMnKSBpcyBmYWxzZVxuXG4gICAgICByZXR1cm4gQG1vZGVsLnNldFxuICAgICAgICAnbXV0ZSc6IHRydWVcblxuXG4gICAgIyBGb2N1cyBzdGF0ZSA+IE11dGVcbiAgICBpZiBAbW9kZWwuZ2V0KCdtdXRlJylcbiAgICAgIHJldHVybiBAbW9kZWwuc2V0XG4gICAgICAgICdtdXRlJzogZmFsc2VcblxuXG4gICMgSGFuZGxlciBmb3IgbXV0ZSBidXR0b24gY2xpY2tzXG4gICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgb25NdXRlQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICBAbW9kZWwuc2V0ICdtdXRlJywgISBAbW9kZWwuZ2V0KCdtdXRlJylcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5UcmFja1xuIiwiIyMjKlxuICogU2VxdWVuY2VyIHBhcmVudCB2aWV3IGZvciB0cmFjayBzZXF1ZW5jZXNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTguMTRcbiMjI1xuXG5QYXR0ZXJuVHJhY2sgPSByZXF1aXJlICcuL1BhdHRlcm5UcmFjay5jb2ZmZWUnXG5QdWJTdWIgICAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi91dGlscy9QdWJTdWInXG5BcHBFdmVudCAgICAgPSByZXF1aXJlICcuLi8uLi8uLi8uLi9ldmVudHMvQXBwRXZlbnQuY29mZmVlJ1xuUHViRXZlbnQgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbmhlbHBlcnMgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2hlbHBlcnMvaGFuZGxlYmFycy1oZWxwZXJzJ1xudGVtcGxhdGUgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2VxdWVuY2VyLXRlbXBsYXRlLmhicydcblxuY2xhc3MgU2VxdWVuY2VyIGV4dGVuZHMgVmlld1xuXG4gICMgVGhlIG5hbWUgb2YgdGhlIGNvbnRhaW5lciBjbGFzc1xuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgaWQ6ICdjb250YWluZXItc2VxdWVuY2VyJ1xuXG4gICMgVGhlIHRlbXBsYXRlXG4gICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG4gICMgQW4gYXJyYXkgb2YgYWxsIHBhdHRlcm4gdHJhY2tzXG4gICMgQHR5cGUge1N0cmluZ31cblxuICBwYXR0ZXJuVHJhY2tWaWV3czogbnVsbFxuXG4gICMgVGhlIHNldEludGVydmFsIHRpY2tlclxuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgYnBtSW50ZXJ2YWw6IG51bGxcblxuICAjIFRoZSB0aW1lIGluIHdoaWNoIHRoZSBpbnRlcnZhbCBmaXJlc1xuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgdXBkYXRlSW50ZXJ2YWxUaW1lOiAyMDBcblxuICAjIFRoZSBjdXJyZW50IGJlYXQgaWRcbiAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gIGN1cnJCZWF0Q2VsbElkOiAtMVxuXG4gICMgVE9ETzogVXBkYXRlIHRoaXMgdG8gbWFrZSBpdCBtb3JlIGR5bmFtaWNcbiAgIyBUaGUgbnVtYmVyIG9mIGJlYXQgY2VsbHNcbiAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gIG51bUNlbGxzOiA3XG5cbiAgIyBHbG9iYWwgYXBwbGljYXRpb24gbW9kZWxcbiAgIyBAdHlwZSB7QXBwTW9kZWx9XG5cbiAgYXBwTW9kZWw6IG51bGxcblxuICAjIENvbGxlY3Rpb24gb2YgaW5zdHJ1bWVudHNcbiAgIyBAdHlwZSB7SW5zdHJ1bWVudENvbGxlY3Rpb259XG5cbiAgY29sbGVjdGlvbjogbnVsbFxuXG4gICMgQ29sbGVjdGlvbiBvZiBpbnN0cnVtZW50c1xuICAjIEB0eXBlIHtLaXRDb2xsZWN0aW9ufVxuXG4gIGtpdENvbGxlY3Rpb246IG51bGxcblxuXG4gICMgUmVuZGVycyB0aGUgdmlld1xuICAjIEBwYXJhbSB7T2JqZWN0fVxuXG4gIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgQCR0aFN0ZXBwZXIgPSBAJGVsLmZpbmQgJ3RoLnN0ZXBwZXInXG4gICAgQCRzZXF1ZW5jZXIgPSBAJGVsLmZpbmQgJy5zZXF1ZW5jZXInXG5cbiAgICAkKEAkdGhTdGVwcGVyWzBdKS5hZGRDbGFzcyAnc3RlcCdcbiAgICBAcmVuZGVyVHJhY2tzKClcbiAgICBAcGxheSgpXG4gICAgQFxuXG5cbiAgIyBSZW1vdmVzIHRoZSB2aWV3IGZyb20gdGhlIERPTSBhbmQgY2FuY2Vsc1xuICAjIHRoZSB0aWNrZXIgaW50ZXJ2YWxcblxuICByZW1vdmU6IC0+XG4gICAgXy5lYWNoIEBwYXR0ZXJuVHJhY2tWaWV3cywgKHRyYWNrKSA9PlxuICAgICAgdHJhY2sucmVtb3ZlKClcblxuICAgIHdpbmRvdy5jbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuXG4gICAgc3VwZXIoKVxuXG5cbiAgIyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBoYW5kbGluZyBpbnN0cnVtZW50IGFuZCBwbGF5YmFja1xuICAjIGNoYW5nZXMuICBVcGRhdGVzIGFsbCBvZiB0aGUgdmlld3MgYWNjb3JkaW5nbHlcblxuICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfQlBNLCBAb25CUE1DaGFuZ2VcbiAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCBBcHBFdmVudC5DSEFOR0VfUExBWUlORywgQG9uUGxheWluZ0NoYW5nZVxuICAgIEBsaXN0ZW5UbyBAYXBwTW9kZWwsIEFwcEV2ZW50LkNIQU5HRV9LSVQsIEBvbktpdENoYW5nZVxuXG4gICAgQGxpc3RlblRvIEBhcHBNb2RlbC5nZXQoJ2tpdE1vZGVsJyksIEFwcEV2ZW50LkNIQU5HRV9JTlNUUlVNRU5ULCBAb25JbnN0cnVtZW50Q2hhbmdlXG5cbiAgICBAbGlzdGVuVG8gQGNvbGxlY3Rpb24sIEFwcEV2ZW50LkNIQU5HRV9GT0NVUywgQG9uRm9jdXNDaGFuZ2VcbiAgICBAbGlzdGVuVG8gQGNvbGxlY3Rpb24sIEFwcEV2ZW50LkNIQU5HRV9NVVRFLCBAb25NdXRlQ2hhbmdlXG5cbiAgICBQdWJTdWIub24gQXBwRXZlbnQuSU1QT1JUX1RSQUNLLCBAaW1wb3J0VHJhY2tcblxuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiAtPlxuICAgIFB1YlN1Yi5vZmYgQXBwRXZlbnQuSU1QT1JUX1RSQUNLXG4gICAgUHViU3ViLm9mZiBBcHBFdmVudC5FWFBPUlRfVFJBQ0tcblxuICAgIHN1cGVyKClcblxuXG4gICMgUmVuZGVycyBvdXQgZWFjaCBpbmRpdmlkdWFsIHRyYWNrLlxuICAjIFRPRE86IE5lZWQgdG8gdXBkYXRlIHNvIHRoYXQgYWxsIG9mIHRoZSBiZWF0IHNxdWFyZXMgYXJlbid0XG4gICMgYmxvd24gYXdheSBieSB0aGUgcmUtcmVuZGVyXG5cbiAgcmVuZGVyVHJhY2tzOiA9PlxuICAgIEAkZWwuZmluZCgnLnBhdHRlcm4tdHJhY2snKS5yZW1vdmUoKVxuXG4gICAgQHBhdHRlcm5UcmFja1ZpZXdzID0gW11cblxuICAgIEBjb2xsZWN0aW9uLmVhY2ggKG1vZGVsLCBpbmRleCkgPT5cblxuICAgICAgcGF0dGVyblRyYWNrID0gbmV3IFBhdHRlcm5UcmFja1xuICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG4gICAgICAgIGNvbGxlY3Rpb246IG1vZGVsLmdldCAncGF0dGVyblNxdWFyZXMnXG4gICAgICAgIG1vZGVsOiBtb2RlbFxuICAgICAgICBvcmRlckluZGV4OiBpbmRleFxuXG4gICAgICBAcGF0dGVyblRyYWNrVmlld3MucHVzaCBwYXR0ZXJuVHJhY2tcbiAgICAgIEAkc2VxdWVuY2VyLmFwcGVuZCBwYXR0ZXJuVHJhY2sucmVuZGVyKCkuZWxcblxuICAgICAgQGxpc3RlblRvIHBhdHRlcm5UcmFjaywgUHViRXZlbnQuQkVBVCwgQG9uQmVhdFxuXG5cbiAgIyBVcGRhdGUgdGhlIHRpY2tlciB0aW1lLCBhbmQgYWR2YW5jZXMgdGhlIGJlYXRcblxuICB1cGRhdGVUaW1lOiA9PlxuICAgICNjb25zb2xlLmxvZyAnQkVBVCEnXG4gICAgQCR0aFN0ZXBwZXIucmVtb3ZlQ2xhc3MgJ3N0ZXAnXG4gICAgQCRzZXF1ZW5jZXIuZmluZCgndGQnKS5yZW1vdmVDbGFzcyAnc3RlcCdcbiAgICBAY3VyckJlYXRDZWxsSWQgPSBpZiBAY3VyckJlYXRDZWxsSWQgPCBAbnVtQ2VsbHMgdGhlbiBAY3VyckJlYXRDZWxsSWQgKz0gMSBlbHNlIEBjdXJyQmVhdENlbGxJZCA9IDBcbiAgICAkKEAkdGhTdGVwcGVyW0BjdXJyQmVhdENlbGxJZF0pLmFkZENsYXNzICdzdGVwJ1xuXG4gICAgQHBsYXlBdWRpbygpXG5cblxuICAjIENvbnZlcnRzIG1pbGxpc2Vjb25kcyB0byBCUE1cblxuICBjb252ZXJ0QlBNOiAtPlxuICAgIHJldHVybiAyMDBcblxuXG4gICMgU3RhcnQgcGxheWJhY2sgb2Ygc2VxdWVuY2VyXG5cbiAgcGxheTogLT5cbiAgICBAYXBwTW9kZWwuc2V0ICdwbGF5aW5nJywgdHJ1ZVxuXG5cbiAgIyBQYXVzZXMgc2VxdWVuY2VyIHBsYXliYWNrXG5cbiAgcGF1c2U6IC0+XG4gICAgQGFwcE1vZGVsLnNldCAncGxheWluZycsIGZhbHNlXG5cblxuICAjIE11dGVzIHRoZSBzZXF1ZW5jZXJcblxuICBtdXRlOiAtPlxuICAgIEBhcHBNb2RlbC5zZXQgJ211dGUnLCB0cnVlXG5cblxuICAjIFVubXV0ZXMgdGhlIHNlcXVlbmNlclxuXG4gIHVubXV0ZTogLT5cbiAgICBAYXBwTW9kZWwuc2V0ICdtdXRlJywgZmFsc2VcblxuXG4gICMgUGxheXMgYXVkaW8gb2YgZWFjaCB0cmFjayBjdXJyZW50bHkgZW5hYmxlZCBhbmQgb25cblxuICBwbGF5QXVkaW86IC0+XG4gICAgZm9jdXNlZEluc3RydW1lbnQgPSBAY29sbGVjdGlvbi5maW5kV2hlcmUgeyBmb2N1czogdHJ1ZSB9XG5cbiAgICAjIENoZWNrIGlmIHRoZXJlJ3MgYSBmb2N1c2VkIHRyYWNrIGFuZCBvbmx5XG4gICAgIyBwbGF5IGF1ZGlvIGZyb20gdGhlcmVcblxuICAgIGlmIGZvY3VzZWRJbnN0cnVtZW50XG4gICAgICBpZiBmb2N1c2VkSW5zdHJ1bWVudC5nZXQoJ211dGUnKSBpc250IHRydWVcbiAgICAgICAgZm9jdXNlZEluc3RydW1lbnQuZ2V0KCdwYXR0ZXJuU3F1YXJlcycpLmVhY2ggKHBhdHRlcm5TcXVhcmUsIGluZGV4KSA9PlxuICAgICAgICAgIEBwbGF5UGF0dGVyblNxdWFyZUF1ZGlvKCBwYXR0ZXJuU3F1YXJlLCBpbmRleCApXG5cbiAgICAgIHJldHVyblxuXG4gICAgIyBJZiBub3RoaW5nIGlzIGZvY3VzZWQsIHRoZW4gY2hlY2sgYWdhaW5zdFxuICAgICMgdGhlIGVudGlyZSBtYXRyaXhcblxuICAgIEBjb2xsZWN0aW9uLmVhY2ggKGluc3RydW1lbnQpID0+XG4gICAgICBpZiBpbnN0cnVtZW50LmdldCgnbXV0ZScpIGlzbnQgdHJ1ZVxuICAgICAgICBpbnN0cnVtZW50LmdldCgncGF0dGVyblNxdWFyZXMnKS5lYWNoIChwYXR0ZXJuU3F1YXJlLCBpbmRleCkgPT5cbiAgICAgICAgICBAcGxheVBhdHRlcm5TcXVhcmVBdWRpbyggcGF0dGVyblNxdWFyZSwgaW5kZXggKVxuXG5cbiAgIyBQbGF5cyB0aGUgYXVkaW8gb24gYW4gaW5kaXZpZHVhbCBQYXR0ZXJTcXVhcmUgaWYgdGVtcG8gaW5kZXhcbiAgIyBpcyB0aGUgc2FtZSBhcyB0aGUgaW5kZXggd2l0aGluIHRoZSBjb2xsZWN0aW9uXG4gICMgQHBhcmFtIHtQYXR0ZXJuU3F1YXJlfSBwYXR0ZXJuU3F1YXJlXG4gICMgQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG5cbiAgcGxheVBhdHRlcm5TcXVhcmVBdWRpbzogKHBhdHRlcm5TcXVhcmUsIGluZGV4KSAtPlxuICAgIGlmIEBjdXJyQmVhdENlbGxJZCBpcyBpbmRleFxuICAgICAgaWYgcGF0dGVyblNxdWFyZS5nZXQgJ2FjdGl2ZSdcbiAgICAgICAgcGF0dGVyblNxdWFyZS5zZXQgJ3RyaWdnZXInLCB0cnVlXG5cblxuICAjIEV2ZW50IGhhbmRsZXJzXG4gICMgLS0tLS0tLS0tLS0tLS1cblxuICBvbkJlYXQ6IChwYXJhbXMpID0+XG4gICAgQHRyaWdnZXIgUHViRXZlbnQuQkVBVCwgcGFyYW1zXG5cblxuICAjIEhhbmRsZXIgZm9yIEJQTSB0ZW1wbyBjaGFuZ2VzXG4gICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICBvbkJQTUNoYW5nZTogKG1vZGVsKSA9PlxuICAgIHdpbmRvdy5jbGVhckludGVydmFsIEBicG1JbnRlcnZhbFxuICAgIEB1cGRhdGVJbnRlcnZhbFRpbWUgPSBtb2RlbC5jaGFuZ2VkLmJwbVxuXG4gICAgaWYgQGFwcE1vZGVsLmdldCgncGxheWluZycpXG4gICAgICBAYnBtSW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwgQHVwZGF0ZVRpbWUsIEB1cGRhdGVJbnRlcnZhbFRpbWVcblxuXG4gICMgSGFuZGxlciBmb3IgcGxheWJhY2sgY2hhbmdlcy4gIElmIHBhdXNlZCwgaXQgc3RvcHMgcGxheWJhY2sgYW5kXG4gICMgY2xlYXJzIHRoZSBpbnRlcnZhbC4gIElmIHBsYXlpbmcsIGl0IHJlc2V0cyBpdFxuICAjIEBwYXJhbSB7QXBwTW9kZWx9IG1vZGVsXG5cbiAgb25QbGF5aW5nQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgcGxheWluZyA9IG1vZGVsLmNoYW5nZWQucGxheWluZ1xuXG4gICAgaWYgcGxheWluZ1xuICAgICAgQGJwbUludGVydmFsID0gd2luZG93LnNldEludGVydmFsIEB1cGRhdGVUaW1lLCBAdXBkYXRlSW50ZXJ2YWxUaW1lXG5cbiAgICBlbHNlXG4gICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCBAYnBtSW50ZXJ2YWxcbiAgICAgIEBicG1JbnRlcnZhbCA9IG51bGxcblxuXG4gICMgSGFuZGxlciBmb3IgbXV0ZSBhbmQgdW5tdXRlIGNoYW5nZXNcbiAgIyBAcGFyYW0ge0FwcE1vZGVsfSBtb2RlbFxuXG4gIG9uTXV0ZUNoYW5nZTogKG1vZGVsKSA9PlxuXG5cbiAgIyBNT0JJTEUgT05MWS4gIFN3YXBzIG91dCB0aGUgY3VycmVudGx5IHZpc2libGUgcGF0dGVybiB0cmFjayB3aXRoIHRoZSBvbmVcbiAgIyBjb3JyZXNwb25kaW5nIHRvIHRoZSBzZWxlY3RlZCBpbnN0cnVtZW50XG4gICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgb25JbnN0cnVtZW50Q2hhbmdlOiAobW9kZWwpID0+XG4gICAgc2VsZWN0ZWRJbnN0cnVtZW50ID0gbW9kZWwuY2hhbmdlZC5jdXJyZW50SW5zdHJ1bWVudFxuICAgIGljb25DbGFzcyA9IHNlbGVjdGVkSW5zdHJ1bWVudC5nZXQgJ2ljb24nXG4gICAgJHBhdHRlcm5UcmFja3MgPSBAJGVsLmZpbmQgJy5wYXR0ZXJuLXRyYWNrJ1xuXG4gICAgJHBhdHRlcm5UcmFja3MuZWFjaCAtPlxuICAgICAgJHRyYWNrID0gJCh0aGlzKVxuXG4gICAgICAjIEZvdW5kIHRoZSBwcm9wZXIgdHJhY2ssIHNob3cgaXRcbiAgICAgIGlmICR0cmFjay5maW5kKCcuaW5zdHJ1bWVudCcpLmhhc0NsYXNzIGljb25DbGFzc1xuICAgICAgICAkdHJhY2suc2hvdygpXG5cbiAgICAgICAgVHdlZW5MaXRlLmZyb21UbyAkdHJhY2ssIC42LCB5OiAxMDAsXG4gICAgICAgICAgaW1tZWRpYXRlUmVuZGVyOiB0cnVlXG4gICAgICAgICAgeTogMFxuICAgICAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cbiAgICAgICMgSGlkZSBvbGQgdHJhY2tcbiAgICAgIGVsc2VcbiAgICAgICAgJHRyYWNrLmhpZGUoKVxuXG5cbiAgIyBIYW5kbGVyIGZvciBraXQgY2hhbmdlcywgYXMgc2V0IGZyb20gdGhlIEtpdFNlbGVjdG9yXG4gICMgQHBhcmFtIHtLaXRNb2RlbH0gbW9kZWxcblxuICBvbktpdENoYW5nZTogKG1vZGVsKSA9PlxuICAgIEByZW1vdmVFdmVudExpc3RlbmVycygpXG4gICAgQGNvbGxlY3Rpb24gPSBtb2RlbC5jaGFuZ2VkLmtpdE1vZGVsLmdldCgnaW5zdHJ1bWVudHMnKVxuICAgIEByZW5kZXJUcmFja3MoKVxuXG4gICAgIyBFeHBvcnQgb2xkIHBhdHRlcm4gc3F1YXJlcyBzbyB0aGUgdXNlcnMgcGF0dGVybiBpc24ndCBibG93biBhd2F5XG4gICAgIyB3aGVuIGtpdCBjaGFuZ2VzIG9jY3VyXG5cbiAgICBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbiA9IG1vZGVsLl9wcmV2aW91c0F0dHJpYnV0ZXMua2l0TW9kZWwuZ2V0KCdpbnN0cnVtZW50cycpXG4gICAgb2xkUGF0dGVyblNxdWFyZXMgPSBvbGRJbnN0cnVtZW50Q29sbGVjdGlvbi5leHBvcnRQYXR0ZXJuU3F1YXJlcygpXG5cbiAgICAjIFVwZGF0ZSB0aGUgbmV3IGNvbGxlY3Rpb24gd2l0aCBvbGQgcGF0dGVybiBzcXVhcmUgZGF0YVxuICAgICMgYW5kIHRyaWdnZXIgVUkgdXBkYXRlcyBvbiBlYWNoIHNxdWFyZVxuXG4gICAgQGNvbGxlY3Rpb24uZWFjaCAoaW5zdHJ1bWVudE1vZGVsLCBpbmRleCkgLT5cbiAgICAgIG9sZENvbGxlY3Rpb24gPSBvbGRQYXR0ZXJuU3F1YXJlc1tpbmRleF1cbiAgICAgIG5ld0NvbGxlY3Rpb24gPSBpbnN0cnVtZW50TW9kZWwuZ2V0ICdwYXR0ZXJuU3F1YXJlcydcblxuICAgICAgIyBVcGRhdGUgdHJhY2sgLyBpbnN0cnVtZW50IGxldmVsIHByb3BlcnRpZXMgbGlrZSB2b2x1bWUgLyBtdXRlIC8gZm9jdXNcbiAgICAgIG9sZFByb3BzID0gb2xkSW5zdHJ1bWVudENvbGxlY3Rpb24uYXQoaW5kZXgpXG5cbiAgICAgIHVubGVzcyBvbGRQcm9wcyBpcyB1bmRlZmluZWRcbiAgICAgICAgb2xkUHJvcHMgPSBvbGRQcm9wcy50b0pTT04oKVxuXG4gICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICB2b2x1bWU6IG9sZFByb3BzLnZvbHVtZVxuICAgICAgICAgIGFjdGl2ZTogb2xkUHJvcHMuYWN0aXZlXG4gICAgICAgICAgbXV0ZTogbnVsbFxuICAgICAgICAgIGZvY3VzOiBudWxsXG5cbiAgICAgICAgIyBSZXNldCB2aXN1YWxseSB0aWVkIHByb3BzIHRvIHRyaWdnZXIgdWkgdXBkYXRlXG4gICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXRcbiAgICAgICAgICBtdXRlOiBvbGRQcm9wcy5tdXRlXG4gICAgICAgICAgZm9jdXM6IG9sZFByb3BzLmZvY3VzXG5cbiAgICAgICMgQ2hlY2sgZm9yIGluY29uc2lzdGFuY2llcyBiZXR3ZWVuIG51bWJlciBvZiBpbnN0cnVtZW50c1xuICAgICAgdW5sZXNzIG9sZENvbGxlY3Rpb24gaXMgdW5kZWZpbmVkXG4gICAgICAgIG5ld0NvbGxlY3Rpb24uZWFjaCAocGF0dGVyblNxdWFyZSwgaW5kZXgpIC0+XG4gICAgICAgICAgb2xkUGF0dGVyblNxdWFyZSA9IG9sZENvbGxlY3Rpb24uYXQgaW5kZXhcbiAgICAgICAgICBvbGRQYXR0ZXJuU3F1YXJlID0gb2xkUGF0dGVyblNxdWFyZS50b0pTT04oKVxuICAgICAgICAgIG9sZFBhdHRlcm5TcXVhcmUudHJpZ2dlciA9IGZhbHNlXG5cbiAgICAgICAgICBwYXR0ZXJuU3F1YXJlLnNldCBvbGRQYXR0ZXJuU3F1YXJlXG5cbiAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cbiAgaW1wb3J0VHJhY2s6IChwYXJhbXMpID0+XG4gICAge2NhbGxiYWNrLCBwYXR0ZXJuU3F1YXJlR3JvdXBzLCBpbnN0cnVtZW50cywga2l0VHlwZX0gPSBwYXJhbXNcblxuICAgIEBhcHBNb2RlbC5zZXQgJ2tpdE1vZGVsJywgQGtpdENvbGxlY3Rpb24uZmluZFdoZXJlKCBsYWJlbDoga2l0VHlwZSApXG4gICAgQHJlbmRlclRyYWNrcygpXG5cbiAgICAjIEl0ZXJhdGUgb3ZlciBlYWNoIHZpZXcgYW5kIHNldCBzYXZlZCBwcm9wZXJ0aWVzXG4gICAgXy5lYWNoIEBwYXR0ZXJuVHJhY2tWaWV3cywgKHBhdHRlcm5UcmFja1ZpZXcsIGl0ZXJhdG9yKSAtPlxuICAgICAgaW5zdHJ1bWVudE1vZGVsID0gcGF0dGVyblRyYWNrVmlldy5tb2RlbFxuXG4gICAgICBpbnN0cnVtZW50TW9kZWwuc2V0XG4gICAgICAgIG11dGU6IG51bGxcbiAgICAgICAgZm9jdXM6IG51bGxcblxuICAgICAgIyBVcGRhdGUgcHJvcHMgdG8gdHJpZ2dlciBVSSB1cGRhdGVzXG4gICAgICBpbnN0cnVtZW50TW9kZWwuc2V0XG4gICAgICAgIG11dGU6IGluc3RydW1lbnRzW2l0ZXJhdG9yXS5tdXRlXG4gICAgICAgIGZvY3VzOiBpbnN0cnVtZW50c1tpdGVyYXRvcl0uZm9jdXNcblxuICAgICAgIyBVcGRhdGUgZWFjaCBpbmRpdmlkdWFsIHBhdHRlcm4gc3F1YXJlIHdpdGggc2V0dGluZ3NcbiAgICAgIHBhdHRlcm5UcmFja1ZpZXcuY29sbGVjdGlvbi5lYWNoIChwYXR0ZXJuTW9kZWwsIGluZGV4KSAtPlxuICAgICAgICBzcXVhcmVEYXRhID0gcGF0dGVyblNxdWFyZUdyb3Vwc1tpdGVyYXRvcl1baW5kZXhdXG4gICAgICAgIHNxdWFyZURhdGEudHJpZ2dlciA9IGZhbHNlXG5cbiAgICAgICAgcGF0dGVybk1vZGVsLnNldCBzcXVhcmVEYXRhXG5cbiAgICBpZiBjYWxsYmFjayB0aGVuIGNhbGxiYWNrKClcblxuXG4gICMgSGFuZGxlciBmb3IgZm9jdXMgY2hhbmdlIGV2ZW50cy4gIEl0ZXJhdGVzIG92ZXIgYWxsIG9mIHRoZSBtb2RlbHMgd2l0aGluXG4gICMgdGhlIEluc3RydW1lbnRDb2xsZWN0aW9uIGFuZCB0b2dnbGVzIHRoZWlyIGZvY3VzIHRvIG9mZiBpZiB0aGUgY2hhbmdlZFxuICAjIG1vZGVsJ3MgZm9jdXMgaXMgc2V0IHRvIHRydWUuXG4gICMgQHBhcmFtIHtJbnN0cnVtZW50TW9kZWx9IG1vZGVsXG5cbiAgb25Gb2N1c0NoYW5nZTogKG1vZGVsKSA9PlxuICAgIGRvRm9jdXMgPSBtb2RlbC5jaGFuZ2VkLmZvY3VzXG4gICAgc2VsZWN0ZWRJbmRleCA9IEBjb2xsZWN0aW9uLmluZGV4T2YgbW9kZWxcblxuICAgIEBjb2xsZWN0aW9uLmVhY2ggKGluc3RydW1lbnRNb2RlbCwgaW5kZXgpID0+XG5cbiAgICAgICMgVW5zZXQgYXVkaW8gZm9jdXMgb24gb3RoZXIgdHJhY2tzXG4gICAgICBpZiBtb2RlbC5jaGFuZ2VkLmZvY3VzIGlzIHRydWVcbiAgICAgICAgaWYgbW9kZWwuY2lkIGlzbnQgaW5zdHJ1bWVudE1vZGVsLmNpZFxuICAgICAgICAgIGluc3RydW1lbnRNb2RlbC5zZXQgJ2ZvY3VzJywgZmFsc2UsIHt0cmlnZ2VyOiBmYWxzZSB9XG5cbiAgICBAY29sbGVjdGlvbi5lYWNoIChpbnN0cnVtZW50TW9kZWwsIGluZGV4KSA9PlxuXG4gICAgICAjIFVwZGF0ZSB2aWV3IHJlcHJlc2VudGF0aW9uIGZvciBmb2N1cyBzdGF0ZVxuICAgICAgdmlldyA9IEBwYXR0ZXJuVHJhY2tWaWV3c1tpbmRleF1cblxuICAgICAgIyBGb3VuZCBpbnN0cnVtZW50IG1vZGVsXG4gICAgICBpZiBtb2RlbCBpcyBpbnN0cnVtZW50TW9kZWxcblxuICAgICAgICAjIEFkZCBmb2N1c1xuICAgICAgICBpZiBkb0ZvY3VzIGlzIHRydWVcbiAgICAgICAgICB2aWV3LiRlbC5yZW1vdmVDbGFzcygnZGVmb2N1c2VkJylcblxuICAgICAgIyBBbGwgdGhlIG90aGVyIHRyYWNrcywgcmVtb3ZlIGZvY3VzIGlmIHNldFxuICAgICAgZWxzZVxuXG4gICAgICAgICMgQWRkIGRlZm9jdXNlZCBzdGF0ZVxuICAgICAgICBpZiBkb0ZvY3VzIGlzIHRydWVcbiAgICAgICAgICB2aWV3LiRlbC5hZGRDbGFzcygnZGVmb2N1c2VkJylcblxuICAgICAgICAjIFJlbW92ZSBkZWZvY3VzZWQgc3RhdGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpZXcuJGVsLnJlbW92ZUNsYXNzKCdkZWZvY3VzZWQnKVxuXG5cbiAgb25NdXRlQ2hhbmdlOiAobW9kZWwpID0+XG4gICAgc2VsZWN0ZWRJbmRleCA9IEBjb2xsZWN0aW9uLmluZGV4T2YgbW9kZWxcblxuICAgIEBjb2xsZWN0aW9uLmVhY2ggKGluc3RydW1lbnRNb2RlbCwgaW5kZXgpID0+XG4gICAgICB2aWV3ID0gQHBhdHRlcm5UcmFja1ZpZXdzW2luZGV4XVxuXG4gICAgICAjIEZvdW5kIGluc3RydW1lbnQgbW9kZWxcbiAgICAgIGlmIHNlbGVjdGVkSW5kZXggaXMgaW5kZXhcblxuICAgICAgICAjIEFkZCBtdXRlXG4gICAgICAgIGlmIG1vZGVsLmNoYW5nZWQubXV0ZSBpcyB0cnVlXG4gICAgICAgICAgdmlldy4kZWwuYWRkQ2xhc3MgJ211dGUnXG5cbiAgICAgICAgIyBVc2VyIHVubXV0aW5nIHRyYWNrXG4gICAgICAgIGVsc2Ugdmlldy4kZWwucmVtb3ZlQ2xhc3MgJ211dGUnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZXF1ZW5jZXJcbiIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0naW5uZXItY29udGFpbmVyJz5cXG5cdDxkaXYgY2xhc3M9J2JvcmRlci1kYXJrJyAvPlxcblxcblx0PGRpdiBjbGFzcz0naWNvbic+XFxuXFxuXHQ8L2Rpdj5cXG48L2Rpdj5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuXG4gIGJ1ZmZlciArPSBcIjx0ZCBjbGFzcz0naW5zdHJ1bWVudCBcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaWNvbikgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuaWNvbjsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCInIC8+XFxuPHRkIGNsYXNzPSdidG4tbXV0ZSc+XFxuXHRtdXRlXFxuPC90ZD5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBzdGFjazIsIG9wdGlvbnMsIHNlbGY9dGhpcywgaGVscGVyTWlzc2luZz1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIjtcbiAgYnVmZmVyICs9IFwiXFxuXHRcdFx0XHRcIlxuICAgICsgXCJcXG5cdFx0XHRcdDx0aD48L3RoPlxcblx0XHRcdFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiXFxuXHRcdFx0XHQ8dGggY2xhc3M9J3N0ZXBwZXInPjwvdGg+XFxuXHRcdFx0XCI7XG4gIH1cblxuICBidWZmZXIgKz0gXCJcXG48ZGl2IGNsYXNzPSd3cmFwcGVyJz5cXG5cdDx0YWJsZSBjbGFzcz0nc2VxdWVuY2VyJz5cXG5cdFx0PHRyPlxcblxcblx0XHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXFxuXHRcdFx0XCJcbiAgICArIFwiXFxuXHRcdFx0PHRoIHN0eWxlPSdkaXNwbGF5Om5vbmUnPjwvdGg+XFxuXFxuXHRcdFx0XCI7XG4gIG9wdGlvbnMgPSB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMywgcHJvZ3JhbTMsIGRhdGEpLGRhdGE6ZGF0YX07XG4gIHN0YWNrMiA9ICgoc3RhY2sxID0gaGVscGVycy5yZXBlYXQgfHwgZGVwdGgwLnJlcGVhdCksc3RhY2sxID8gc3RhY2sxLmNhbGwoZGVwdGgwLCA4LCBvcHRpb25zKSA6IGhlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsIFwicmVwZWF0XCIsIDgsIG9wdGlvbnMpKTtcbiAgaWYoc3RhY2syIHx8IHN0YWNrMiA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2syOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0XHQ8L3RyPlxcblx0PC90YWJsZT5cXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCIjIyMqXG4gKiBTaGFyZSBtb2RhbCBwb3AtZG93blxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgMy4yNi4xNFxuIyMjXG5cbkFwcENvbmZpZyAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL2NvbmZpZy9BcHBDb25maWcuY29mZmVlJ1xuQXBwRXZlbnQgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vLi4vLi4vZXZlbnRzL0FwcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblNwaW5JY29uICAgICAgICA9IHJlcXVpcmUgJy4uLy4uLy4uLy4uL3V0aWxzL1NwaW5JY29uJ1xucHJldmlld1RlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2hhcmUtcHJldmlldy10ZW1wbGF0ZS5oYnMnXG50ZW1wbGF0ZSAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zaGFyZS1tb2RhbC10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIFNoYXJlTW9kYWwgZXh0ZW5kcyBWaWV3XG5cbiAgIyBUaGUgdHdlZW4gdGltZSBmb3IgZm9ybSB0cmFuc2l0aW9ucyBpbiBhbmQgYmV0d2VlblxuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgRk9STV9UV0VFTl9USU1FOiAuM1xuXG4gICMgRXJyb3IgbWVzc2FnZSB0byBkaXNwbGF5IGluIGJ1dHRvbiBpZiB0aGVyZSdzIGEgcHJvYmxlbSBzYXZpbmcgdGhlIHRyYWNrXG4gICMgQHR5cGUge1N0cmluZ31cblxuICBFUlJPUl9NU0c6ICdFcnJvciBzYXZpbmcgdHJhY2snXG5cbiAgIyBHZW5lcmljIHNoYXJlIG1lc3NhZ2Ugd2hpY2ggaXMgcG9zdGVkIHRvIHNvY2lhbCBtZWRpYVxuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgU0hBUkVfTVNHOiAnTkVFRCBTSEFSRSBNRVNTQUdFJ1xuXG4gICMgVGhlIGNvbnRhaW5lciBlbGVtZW50IGlkXG4gICMgQHR5cGUge1N0cmluZ31cblxuICBjbGFzc05hbWU6ICdjb250YWluZXItc2hhcmUtbW9kYWwnXG5cbiAgIyBUaGUgdGVtcGxhdGVcbiAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cbiAgIyBUaGUgbW9kZWwgdG8gc2hhcmUgZGF0YSBiZXR3ZWVuIHRoZSB2aWV3IGFuZCBQYXJzZVxuICAjIEB0eXBlIHtTaGFyZWRUcmFja01vZGVsfVxuXG4gIHNoYXJlZFRyYWNrTW9kZWw6IG51bGxcblxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmJ0bi1saW5rJzogJ29uTGlua0J0bkNsaWNrJ1xuICAgICdjbGljayAuYnRuLXNlbGVjdC1zZXJ2aWNlJzogJ29uU2VsZWN0WW91clNlcnZpY2VCdG5DbGljaydcbiAgICAndG91Y2hlbmQgLmJ0bi1jbG9zZSc6ICdvbkNsb3NlQnRuQ2xpY2snXG4gICAgJ2NsaWNrJzogJ29uQ2xvc2VCdG5DbGljaydcbiAgICAnY2xpY2sgLndyYXBwZXInOiAnb25XcmFwcGVyQ2xpY2snXG4gICAgJ2NsaWNrIC5idG4tdHVtYmxyJzogJ29uVHVtYmxyQnRuQ2xpY2snXG5cbiAgICAna2V5cHJlc3MgLmlucHV0LW5hbWUnOiAnb25JbnB1dEtleVByZXNzJ1xuICAgICdibHVyIC5pbnB1dC10aXRsZSc6ICdvbklucHV0Qmx1cidcbiAgICAnYmx1ciAuaW5wdXQtbmFtZSc6ICdvbklucHV0Qmx1cidcbiAgICAnYmx1ciAuaW5wdXQtbWVzc2FnZSc6ICdvbklucHV0Qmx1cidcblxuICAgICMgTW9iaWxlIG9ubHlcbiAgICAndG91Y2hzdGFydCAuYnRuLWNsb3NlLXNoYXJlJzogJ29uQ2xvc2VCdG5QcmVzcydcblxuXG4gICMgUmVuZGVycyB0aGUgdmlldyBvbmNlIHRoZSB1c2VyIGhhcyBjbGlja2VkIHRoZSAnc2hhcmUnIGJ1dHRvblxuICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG5cbiAgICBAJHdyYXBwZXIgPSBAJGVsLmZpbmQgJy53cmFwcGVyJ1xuICAgIEAkZm9ybSA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1mb3JtJ1xuICAgIEAkcHJldmlldyA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1wcmV2aWV3J1xuICAgIEAkZm9ybVdyYXBwZXIgPSBAJGVsLmZpbmQgJy5mb3JtLXdyYXBwZXInXG4gICAgQCRjbG9zZUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1jbG9zZSdcbiAgICBAJG5hbWVJbnB1dCA9IEAkZWwuZmluZCAnLmlucHV0LW5hbWUnXG4gICAgQCR0aXRsZUlucHV0ID0gQCRlbC5maW5kICcuaW5wdXQtdGl0bGUnXG4gICAgQCRtZXNzYWdlSW5wdXQgPSBAJGVsLmZpbmQgJy5pbnB1dC1tZXNzYWdlJ1xuICAgIEAkcHJlbG9hZGVyID0gQCRlbC5maW5kICcucHJlbG9hZGVyJ1xuICAgIEAkc2VydmljZUJ0biA9IEAkZWwuZmluZCAnLmJ0bi1zZWxlY3Qtc2VydmljZSdcbiAgICBAJHNlcnZpY2VUZXh0ID0gQCRzZXJ2aWNlQnRuLmZpbmQgJy50ZXh0J1xuXG4gICAgQHNwaW5uZXIgPSBuZXcgU3Bpbkljb24geyB0YXJnZXQ6IEAkcHJlbG9hZGVyWzBdIH1cbiAgICBAc3Bpbm5lci4kZWwuY3NzICdtYXJnaW4nLCAnYXV0bydcbiAgICBAc3Bpbm5lci5zaG93KClcbiAgICBAJHByZWxvYWRlci5oaWRlKClcblxuICAgIFR3ZWVuTGl0ZS5zZXQgQCRlbCwgYXV0b0FscGhhOiAwXG4gICAgVHdlZW5MaXRlLnNldCBAJHByZXZpZXcsIGF1dG9BbHBoYTogMFxuICAgIFR3ZWVuTGl0ZS5zZXQgQCRwcmVsb2FkZXIsIGF1dG9BbHBoYTogMCwgc2NhbGU6IDBcbiAgICBUd2VlbkxpdGUuc2V0IEAkY2xvc2VCdG4sIGF1dG9BbHBoYTogMCwgc2NhbGVYOiAxLjdcblxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgVHdlZW5MaXRlLnNldCBAJHByZWxvYWRlciwgYXV0b0FscGhhOiAxLCBzY2FsZTogMCwgeTogLTEyXG5cbiAgICAgIF8uZWFjaCBbQCRuYW1lSW5wdXQsIEAkdGl0bGVJbnB1dCwgQCRtZXNzYWdlSW5wdXRdLCAoJGlucHV0KSAtPlxuICAgICAgICAjJGlucHV0LmF0dHIgJ3BsYWNlaG9sZGVyJywgJydcblxuICAgICAgXy5kZWZlciA9PlxuICAgICAgICBjZW50ZXJZID0gKHdpbmRvdy5pbm5lckhlaWdodCAqIC41IC0gQCRmb3JtV3JhcHBlci5oZWlnaHQoKSkgKyAoJCgnLnRvcC1iYXInKS5oZWlnaHQoKSAqIC41KVxuXG4gICAgICAgIFR3ZWVuTGl0ZS5zZXQgQCRmb3JtV3JhcHBlciwgeTogY2VudGVyWVxuICAgIEBcblxuXG4gIHJlbW92ZTogLT5cbiAgICBAJGJhY2tCdG4/Lm9mZiAndG91Y2hlbmQnLCBAb25CYWNrQnRuQ2xpY2tcbiAgICBAJGNvcHlCdG4/Lm9mZiAndG91Y2hlbmQnLCBAb25Db3B5QnRuQ2xpY2tcbiAgICBzdXBlcigpXG5cblxuICAjIEFkZHMgZXZlbnQgbGlzdGVuZXJzIGFuZCB3YWl0cyBmb3IgdGhlIHNoYXJlSWQgdG8gdXBkYXRlLCB0cmlnZ2VyaW5nXG4gICMgdGhlIFVJIGNoYW5nZSByZWxhdGVkIHRvIHBvc3RlZCB0byBkaWZmZXJlbnQgc29jaWFsIHNlcnZpY2VzXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgQGxpc3RlblRvIEBhcHBNb2RlbCwgQXBwRXZlbnQuQ0hBTkdFX1NIQVJFX0lELCBAb25TaGFyZUlkQ2hhbmdlXG5cblxuICAjIFNob3dzIHRoZSB2aWV3XG5cbiAgc2hvdzogLT5cblxuICAgIGlmIEBpc01vYmlsZVxuICAgICAgVHdlZW5MaXRlLmZyb21UbyBAJGVsLCAuNiwgeTogd2luZG93LmlubmVySGVpZ2h0LFxuICAgICAgICB5OiAwXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgIFR3ZWVuTGl0ZS50byBAJGNsb3NlQnRuLCAuMyxcbiAgICAgICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICAgICAgZWFzZTogTGluZWFyLmVhc2VOb25lXG5cbiAgICBlbHNlXG4gICAgICBUd2VlbkxpdGUuZnJvbVRvIEAkZWwsIEBGT1JNX1RXRUVOX1RJTUUgKyAuMSwgeTogMjAwMCxcbiAgICAgICAgeTogMFxuICAgICAgICBhdXRvQWxwaGE6IDFcbiAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0LFxuXG4gICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgVHdlZW5MaXRlLnRvIEAkY2xvc2VCdG4sIC4zLFxuICAgICAgICAgICAgYXV0b0FscGhhOiAxXG4gICAgICAgICAgICBlYXNlOiBMaW5lYXIuZWFzZU5vbmVcblxuXG4gICMgSGlkZXMgdGhlIHZpZXdcblxuICBoaWRlOiAtPlxuICAgIEB0cmlnZ2VyIEFwcEV2ZW50LkNMT1NFX1NIQVJFXG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIFR3ZWVuTGl0ZS50byBAJGVsLCAuNixcbiAgICAgICAgeTogd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgIEByZW1vdmUoKVxuXG4gICAgZWxzZVxuICAgICAgVHdlZW5MaXRlLnRvIEAkY2xvc2VCdG4sIC4yLFxuICAgICAgICBhdXRvQWxwaGE6IDBcblxuICAgICAgVHdlZW5MaXRlLnRvIEAkZWwsIEBGT1JNX1RXRUVOX1RJTUUgKyAuMSxcbiAgICAgICAgeTogMjAwMFxuICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgZWFzZTogRXhwby5lYXNlSW5cbiAgICAgICAgZGVsYXk6IC4xXG5cbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICBAcmVtb3ZlKClcblxuXG4gICMgRXZlbnQgaGFuZGxlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLVxuXG4gICMgSGFuZGxlciBmb3IgbGluayBidXR0b24gY2xpY2tzXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uTGlua0J0bkNsaWNrOiAoZXZlbnQpID0+XG4gICAgY29uc29sZS5sb2cgJ2xpbmsgYnRuJ1xuXG5cbiAgb25JbnB1dEtleVByZXNzOiAoZXZlbnQpID0+XG4gICAga2V5ID0gZXZlbnQud2hpY2ggb3IgZXZlbnQua2V5Q29kZVxuXG4gICAgIyBFTlRFUiBrZXlcbiAgICBpZiBrZXkgaXMgMTNcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpXG4gICAgICBAb25JbnB1dEJsdXIoKVxuICAgICAgQG9uU2VsZWN0WW91clNlcnZpY2VCdG5DbGljaygpXG5cblxuICBvbklucHV0Qmx1cjogKGV2ZW50KSA9PlxuICAgIFR3ZWVuTGl0ZS50byAkKCdib2R5JyksIDAsXG4gICAgICBzY3JvbGxUb3A6IDBcbiAgICAgIHNjcm9sbExlZnQ6IDBcblxuXG4gICMgSGFuZGxlciBmb3IgbW9kZWwgYHNoYXJlSWRgIGNoYW5nZXMgd2hpY2ggdHJpZ2dlcnMgdGhlXG4gICMgcmVuZGVyaW5nIG9mIHRoZSBzaGFyZSBvcHRpb25zXG4gICMgQHBhcmFtIHtBcHBNb2RlbH0gbW9kZWxcblxuICBvblNoYXJlSWRDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICBzaGFyZUlkID0gbW9kZWwuY2hhbmdlZC5zaGFyZUlkXG5cbiAgICBpZiBzaGFyZUlkIGlzIG51bGxcbiAgICAgIHJldHVyblxuXG4gICAgVHdlZW5MaXRlLnRvIEAkcHJlbG9hZGVyLCAuMixcbiAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgc2NhbGU6IDBcbiAgICAgIGVhc2U6IEJhY2suZWFzZUluXG5cbiAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgIEAkc2VydmljZUJ0bi5yZW1vdmVDbGFzcyAnbm8tdHJhbnNpdGlvbidcbiAgICAgICAgQCRzZXJ2aWNlQnRuLmF0dHIgJ3N0eWxlJywgJydcblxuICAgICAgICBpZiBzaGFyZUlkIGlzICdlcnJvcidcbiAgICAgICAgICBAJHNlcnZpY2VUZXh0LnRleHQgJ0Vycm9yIHNhdmluZyB0cmFjay4nXG5cbiAgICAgICAgICBfLmRlbGF5ID0+XG4gICAgICAgICAgICBAaGlkZSgpXG4gICAgICAgICAgLCAyMDAwXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIEByZW5kZXJTZXJ2aWNlT3B0aW9ucygpXG5cbiAgICAgICAgVHdlZW5MaXRlLnRvIEAkc2VydmljZVRleHQsIC4yLCBhdXRvQWxwaGE6IDFcblxuXG4gICMgSGFuZGxlciBmb3Igc2VsZWN0IHNlcnZpY2UgYnV0dG9uIGNsaWNrcy4gIFRyaWdnZXJzIHRoZSBwb3N0IHRvXG4gICMgUGFyc2UgYnkgc2V0dGluZyB0aGUgdmFsdWVzIG9mIHRoZSBpbnB1dCBmaWVsZHMuXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uU2VsZWN0WW91clNlcnZpY2VCdG5DbGljazogKGV2ZW50KSA9PlxuICAgIGlmIEBmb3JtVmFsaWQoKSBpcyBmYWxzZSB0aGVuIHJldHVyblxuXG4gICAgQCRwcmVsb2FkZXIuc2hvdygpXG4gICAgQCRzZXJ2aWNlQnRuLmFkZENsYXNzICduby10cmFuc2l0aW9uJ1xuICAgIFR3ZWVuTGl0ZS50byBAJHNlcnZpY2VCdG4sIC4yLCBiYWNrZ3JvdW5kQ29sb3I6ICdibGFjaydcbiAgICBUd2VlbkxpdGUudG8gQCRzZXJ2aWNlVGV4dCwgLjIsIGF1dG9BbHBoYTogMFxuXG4gICAgVHdlZW5MaXRlLnRvIEAkcHJlbG9hZGVyLCAuMixcbiAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgc2NhbGU6IGlmIEBpc01vYmlsZSB0aGVuIC43IGVsc2UgMVxuICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG4gICAgICBkZWxheTogLjFcblxuICAgIEBzaGFyZWRUcmFja01vZGVsLnNldFxuICAgICAgJ3NoYXJlTmFtZSc6IEAkbmFtZUlucHV0LnZhbCgpXG4gICAgICAnc2hhcmVUaXRsZSc6IEAkdGl0bGVJbnB1dC52YWwoKVxuICAgICAgJ3NoYXJlTWVzc2FnZSc6IEBTSEFSRV9NU0dcblxuICAgIEB0cmlnZ2VyIEFwcEV2ZW50LlNBVkVfVFJBQ0tcblxuXG4gIG9uQmFja0J0bkNsaWNrOiAoZXZlbnQpID0+XG4gICAgQHNob3dGb3JtKClcblxuXG4gICMgSGFuZGxlciBmb3IgY2xvc2UgYnRuIHByZXNzLlxuICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICBvbkNsb3NlQnRuUHJlc3M6IChldmVudCkgPT5cbiAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzICdwcmVzcydcbiAgICBAaGlkZSgpXG5cblxuICAjIEhhbmRsZXIgZm9yIGNsb3NlIGJ0biBjbGlja3MuICBEZXN0cm95cyB0aGUgdmlld1xuICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICBvbkNsb3NlQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzICdwcmVzcydcbiAgICBAaGlkZSgpXG5cblxuICBvbkNvcHlCdG5DbGljazogKGV2ZW50KSA9PlxuICAgIHVubGVzcyBAdHdlZW5pbmdDb3B5VGV4dFxuICAgICAgQHR3ZWVuaW5nQ29weVRleHQgPSB0cnVlXG5cbiAgICAgICRidG4gPSBAJGNvcHlCdG5cbiAgICAgICR0ZXh0ID0gJGJ0bi5maW5kICcudGV4dCdcblxuICAgICAgYnRuSHRtbCA9ICRidG4uaHRtbCgpXG4gICAgICB0d2VlblRpbWUgPSAuMlxuICAgICAgZGVsYXkgPSAxXG5cbiAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gJHRleHQsIHR3ZWVuVGltZSwgYXV0b0FscGhhOiAxLFxuICAgICAgICBhdXRvQWxwaGE6IDBcblxuICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICR0ZXh0Lmh0bWwgJ0NPUElFRCEnXG5cbiAgICAgICAgICBUd2VlbkxpdGUuZnJvbVRvICR0ZXh0LCB0d2VlblRpbWUsIGF1dG9BbHBoYTogMCxcbiAgICAgICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICAgICAgZGVsYXk6IC4xXG5cbiAgICAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gJHRleHQsIHR3ZWVuVGltZSwgYXV0b0FscGhhOiAxLFxuICAgICAgICAgICAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgICAgICAgICAgIGRlbGF5OiBkZWxheVxuXG4gICAgICAgICAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICAgIEB0d2VlbmluZ0NvcHlUZXh0ID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICR0ZXh0Lmh0bWwgYnRuSHRtbFxuICAgICAgICAgICAgICAgICAgJHRleHQuYXR0ciAnc3R5bGUnLCAnJ1xuXG4gICAgICAgICAgICAgICAgICBUd2VlbkxpdGUuZnJvbVRvICR0ZXh0LCB0d2VlblRpbWUsIGF1dG9BbHBoYTogMCxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0FscGhhOiAxXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiAuMVxuXG5cbiAgb25UdW1ibHJCdG5DbGljazogKGV2ZW50KSA9PlxuICAgIHVybCA9ICdodHRwOi8vd3d3LnR1bWJsci5jb20vc2hhcmUvbGluaydcbiAgICB1cmwgKz0gJz91cmw9JyArIGVuY29kZVVSSUNvbXBvbmVudChAc2hhcmVEYXRhLnNoYXJlTGluaylcbiAgICB1cmwgKz0gJyZuYW1lPScgK2RvY3VtZW50LnRpdGxlXG4gICAgdXJsICs9ICcmZGVzY3JpcHRpb249JyArZW5jb2RlVVJJQ29tcG9uZW50KEBTSEFSRV9NU0cpXG5cbiAgICB3aW5kb3cub3Blbih1cmwsICdzaGFyZScsICd3aWR0aD00NTAsaGVpZ2h0PTQzMCcpXG5cblxuICAjIFByZXZlbnQgYmFja2dyb3VuZCBjbGlja3MgZnJvbSBwcm9wYWdhdGluZyBkb3duIHRocm91Z2ggdG8gdHJpZ2dlciBjbG9zZVxuICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICBvbldyYXBwZXJDbGljazogKGV2ZW50KSA9PlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcblxuICAgIGlmICR0YXJnZXQuaGFzQ2xhc3MoJ2ljb24nKVxuICAgICAgJHRhcmdldC50cmlnZ2VyKCdjbGljaycpXG5cbiAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgIHJldHVybiBmYWxzZVxuXG5cbiAgIyBQcml2YXRlXG4gICMgLS0tLS0tLVxuXG4gIGZvcm1WYWxpZDogLT5cbiAgICBpZiBAJHRpdGxlSW5wdXQudmFsKCkgaXMgJydcbiAgICAgIEAkdGl0bGVJbnB1dC5hdHRyICdwbGFjZWhvbGRlcicsICdQbGVhc2UgZW50ZXIgdGl0bGUnXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGlmIEAkbmFtZUlucHV0LnZhbCgpIGlzICcnXG4gICAgICBAJG5hbWVJbnB1dC5hdHRyICdwbGFjZWhvbGRlcicsICdQbGVhc2UgZW50ZXIgbmFtZSdcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgcmV0dXJuIHRydWVcblxuXG4gIHNob3dQcmV2aWV3OiAtPlxuICAgIFR3ZWVuTGl0ZS50byBAJGZvcm0sIEBGT1JNX1RXRUVOX1RJTUUsXG4gICAgICBhdXRvQWxwaGE6IDBcbiAgICAgIHg6IC0zMDBcbiAgICAgIGVhc2U6IEV4cG8uZWFzZUluXG5cbiAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgIEAkZm9ybS5oaWRlKClcblxuICAgICAgICBkYXRhID0gQHNoYXJlZFRyYWNrTW9kZWwudG9KU09OKClcbiAgICAgICAgZGF0YS5pc0Rlc2t0b3AgPSAhIEBpc01vYmlsZVxuXG4gICAgICAgICMgUmVuZGVyIHByZXZpZXcgdGVtcGxhdGUgYW5kIHNoYXJlIHRoZW4gZGlzcGxheVxuICAgICAgICBAJHByZXZpZXcuaHRtbCBwcmV2aWV3VGVtcGxhdGUgZGF0YVxuXG4gICAgICAgIEAkYmFja0J0biA9IEAkcHJldmlldy5maW5kICcuYnRuLWJhY2snXG4gICAgICAgIEAkY29weUJ0biA9IEAkcHJldmlldy5maW5kICcuYnRuLWNvcHktdXJsJ1xuXG4gICAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRwcmV2aWV3LCAuNCwgYXV0b0FscGhhOiAwLCB4OiAzMDAsXG4gICAgICAgICAgYXV0b0FscGhhOiAxXG4gICAgICAgICAgeDogMFxuICAgICAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuXG4gICAgICAgICMgQWRkIGluIGxpYiBmb3IgY29weWluZyB0byBjbGlwYm9hcmRcbiAgICAgICAgQGNyZWF0ZUNsaXBib2FyZExpc3RlbmVycygpXG5cbiAgICAgICAgQCRiYWNrQnRuLm9uICd0b3VjaGVuZCcsIEBvbkJhY2tCdG5DbGlja1xuICAgICAgICBAJGNvcHlCdG4ub24gJ3RvdWNoZW5kJywgQG9uQ29weUJ0bkNsaWNrXG5cblxuICBzaG93Rm9ybTogPT5cbiAgICBAJGJhY2tCdG4ub2ZmICd0b3VjaGVuZCcsIEBvbkJhY2tCdG5DbGlja1xuICAgIEAkY29weUJ0bi5vZmYgJ3RvdWNoZW5kJywgQG9uQ29weUJ0bkNsaWNrXG5cbiAgICBUd2VlbkxpdGUudG8gQCRwcmV2aWV3LCBARk9STV9UV0VFTl9USU1FLFxuICAgICAgYXV0b0FscGhhOiAwXG4gICAgICB4OiAzMDBcbiAgICAgIGVhc2U6IEV4cG8uZWFzZUluXG5cbiAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgIEAkZm9ybS5zaG93KClcblxuICAgICAgICBUd2VlbkxpdGUuZnJvbVRvIEAkZm9ybSwgLjQsIGF1dG9BbHBoYTogMCwgeDogLTMwMCxcbiAgICAgICAgICBhdXRvQWxwaGE6IDFcbiAgICAgICAgICB4OiAwXG4gICAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG5cblxuICAjIFJlbmRlcnMgb3V0IHRoZSBzaGFyZSBzZWxlY3Rpb24gb3B0aW9ucyBhZnRlciB0aGUgdHJhY2sgaGFzXG4gICMgYmVlbiBwb3N0ZWQgdG8gUGFyc2VcblxuICByZW5kZXJTZXJ2aWNlT3B0aW9uczogPT5cbiAgICBzaGFyZUxpbmsgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgJy8jc2hhcmUvJyArIEBhcHBNb2RlbC5nZXQgJ3NoYXJlSWQnXG4gICAgQHNoYXJlZFRyYWNrTW9kZWwuc2V0ICdzaGFyZUxpbmsnLCBzaGFyZUxpbmtcbiAgICBAc2hvd1ByZXZpZXcoKVxuICAgIEBzaGFyZURhdGEgPSBAc2hhcmVkVHJhY2tNb2RlbC50b0pTT04oKVxuICAgIEBhcHBNb2RlbC5zZXQgJ3NoYXJlSWQnLCBudWxsXG5cbiAgICAkLmdldFNjcmlwdCAnLy9wbGF0Zm9ybS50dW1ibHIuY29tL3YxL3NoYXJlLmpzJ1xuXG4gICAgXy5kZWxheSA9PlxuICAgICAgU2hhcmUuaW5pdCgpXG4gICAgLCA1MDBcblxuXG4gIGNyZWF0ZUNsaXBib2FyZExpc3RlbmVyczogPT5cbiAgICBAY2xpcGJvYXJkQ2xpZW50ID0gbmV3IFplcm9DbGlwYm9hcmQoIEAkY29weUJ0biApXG4gICAgQGNsaXBib2FyZENsaWVudC5vbiAnbG9hZCcsIChjbGllbnQpIC0+XG5cbiAgICBAY2xpcGJvYXJkQ2xpZW50Lm9uICdkYXRhcmVxdWVzdGVkJywgKGNsaWVudCkgLT5cbiAgICAgIEBjbGlwYm9hcmRDbGllbnQuc2V0VGV4dCh0aGlzLmlubmVySFRNTClcblxuICAgIEBjbGlwYm9hcmRDbGllbnQub24gJ2NvbXBsZXRlJywgKGNsaWVudCwgYXJncykgLT5cbiAgICAgIGNvbnNvbGUubG9nKFwiQ29waWVkIHRleHQgdG8gY2xpcGJvYXJkOiBcIiArIGFyZ3MudGV4dCApXG5cbiAgICBAY2xpcGJvYXJkQ2xpZW50Lm9uICd3cm9uZ2ZsYXNoIG5vZmxhc2gnLCAtPlxuICAgICAgWmVyb0NsaXBib2FyZC5kZXN0cm95KClcblxuICAgIEBjbGlwYm9hcmRDbGllbnQub24gJ21vdXNlb3ZlcicsIChjbGllbnQsIGFyZ3MpID0+XG4gICAgICBAJGNvcHlCdG4uYWRkQ2xhc3MgJ21vdXNlb3ZlcidcblxuICAgIEBjbGlwYm9hcmRDbGllbnQub24gJ21vdXNlb3V0JywgKGNsaWVudCwgYXJncykgPT5cbiAgICAgIEAkY29weUJ0bi5yZW1vdmVDbGFzcyAnbW91c2VvdmVyJ1xuXG4gICAgQGNsaXBib2FyZENsaWVudC5vbiAnbW91c2V1cCcsIChjbGllbnQsIGFyZ3MpID0+XG4gICAgICBAb25Db3B5QnRuQ2xpY2soKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gU2hhcmVNb2RhbFxuIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tY2xvc2UnPlxcblx0XHRcdFhcXG5cdFx0PC9kaXY+XFxuXHRcIjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblx0XHRcdDxkaXYgY2xhc3M9J2J0bi1jbG9zZS1zaGFyZSc+XFxuXHRcdFx0XHQmbHQ7IEJhY2tcXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XCI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTUoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJcXG5cdFx0XHRcdDxkaXYgY2xhc3M9J21lc3NhZ2UnPlxcblx0XHRcdFx0XHRQbGVhc2UgbmFtZSB5b3VyIGJlYXQgYmVmb3JlIHNoYXJpbmdcXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdFwiO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz0nd3JhcHBlcic+XFxuXFxuXHRcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmlzRGVza3RvcCwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblxcblx0PGRpdiBjbGFzcz0nZm9ybS13cmFwcGVyJz5cXG5cXG5cdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnMudW5sZXNzLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMywgcHJvZ3JhbTMsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXHRcdDxoMT5cXG5cdFx0XHRTaGFyZSBZb3VyIEJlYXRcXG5cdFx0PC9oMT5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLWZvcm0nPlxcblxcblx0XHRcdFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oNSwgcHJvZ3JhbTUsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXHRcdFx0PGRpdiBjbGFzcz0naW5wdXQtZ3JvdXAgdGV4dC1pbnB1dCc+XFxuXHRcdFx0XHQ8c3BhbiBjbGFzcz0nbGFiZWwtaW5wdXQnPlRpdGxlPC9zcGFuPlxcblx0XHRcdFx0PGlucHV0IGNsYXNzPSdpbnB1dC10aXRsZScgcGxhY2Vob2xkZXI9J3RpdGxlJyAvPlxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdDxkaXYgY2xhc3M9J2lucHV0LWdyb3VwIHRleHQtaW5wdXQgbmFtZSc+XFxuXHRcdFx0XHQ8c3BhbiBjbGFzcz0nbGFiZWwtaW5wdXQnPk5hbWU8L3NwYW4+XFxuXHRcdFx0XHQ8aW5wdXQgY2xhc3M9J2lucHV0LW5hbWUnIHBsYWNlaG9sZGVyPSduYW1lJyAvPlxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdFwiXG4gICAgKyBcIlxcblxcblx0XHRcdDxkaXYgY2xhc3M9J2J0bi1zZWxlY3Qtc2VydmljZSc+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPSd0ZXh0Jz5cXG5cdFx0XHRcdFx0U2VsZWN0IFlvdXIgU2VydmljZVxcblx0XHRcdFx0PC9kaXY+XFxuXFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPSdwcmVsb2FkZXInIC8+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdjb250YWluZXItcHJldmlldyc+XFxuXFxuXHRcdDwvZGl2Plxcblxcblx0PC9kaXY+XFxuXFxuPC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8ZGl2IGNsYXNzPSdidG4tY29weS11cmwnIGRhdGEtY2xpcGJvYXJkLXRleHQ9J1wiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5zaGFyZUxpbmspIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLnNoYXJlTGluazsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIic+XFxuXHRcdDxkaXYgY2xhc3M9J3RleHQnPlxcblx0XHRcdDxkaXYgY2xhc3M9J3VybCc+XFxuXFxuXHRcdFx0PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz0nY29weSc+XFxuXHRcdFx0XHRDT1BZIExJTktcXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlxcbjxkaXYgY2xhc3M9J2J0bi1iYWNrJz5cXG5cdCZsdDsgRURJVCBGSUVMRFNcXG48L2Rpdj5cXG48ZGl2IGNsYXNzPSd0cmFjay1kYXRhJz5cXG5cdDxoMT5cXG5cdFx0XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLnNoYXJlTmFtZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuc2hhcmVOYW1lOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXHQ8L2gxPlxcblx0PGgzPlxcblx0XHRcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuc2hhcmVUaXRsZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuc2hhcmVUaXRsZTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC9oMz5cXG5cdDxwPlxcblx0XHRcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuc2hhcmVNZXNzYWdlKSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5zaGFyZU1lc3NhZ2U7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cdDwvcD5cXG48L2Rpdj5cXG5cXG5cXG5cIlxuICAgICsgXCJcXG5cXG48ZGl2IGNsYXNzPSdzZXJ2aWNlcyc+XFxuXHQ8c3Bhbj5cXG5cdFx0U2VsZWN0IGEgU2VydmljZVxcblx0PC9zcGFuPlxcblxcblx0PGRpdiBjbGFzcz0nc2VydmljZS1idG5zJz5cXG5cdFx0PGRpdiBjbGFzcz0nYnRuLWZhY2Vib29rIGljb24tZmFjZWJvb2sgaWNvbidcXG5cdFx0XHRkYXRhLXNoYXJlLWZhY2Vib29rXFxuXHRcdFx0ZGF0YS1zaGFyZS1kZXNjcmlwdGlvbj1cXFwiXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLnNoYXJlTWVzc2FnZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuc2hhcmVNZXNzYWdlOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIlxcblx0XHRcdGRhdGEtc2hhcmUtbGluaz1cXFwiXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmVuY29kZWRVcmwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmVuY29kZWRVcmw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiXFxuXHRcdFx0ZGF0YS1zaGFyZS1uYW1lPVxcXCJcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuc2hhcmVUaXRsZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuc2hhcmVUaXRsZTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcXCJcXG5cdFx0XHRkYXRhLXNoYXJlLWNhcHRpb249XFxcIkNhcHRpb25cXFwiPlxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz0nYnRuLXR3aXR0ZXIgaWNvbi10d2l0dGVyIGljb24nXFxuXHRcdFx0ZGF0YS1zaGFyZS10d2l0dGVyXFxuXHRcdFx0ZGF0YS1zaGFyZS1kZXNjcmlwdGlvbj1cXFwiXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLnNoYXJlTWVzc2FnZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuc2hhcmVNZXNzYWdlOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxcIlxcblx0XHRcdGRhdGEtc2hhcmUtbGluaz1cXFwiXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmVuY29kZWRVcmwpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmVuY29kZWRVcmw7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXFwiPlxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz0nYnRuLXR1bWJsciBpY29uLXR1bWJsciBpY29uJz5cXG5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG48L2Rpdj5cXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmlzRGVza3RvcCwge2hhc2g6e30saW52ZXJzZTpzZWxmLm5vb3AsZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCI7XG4gIGJ1ZmZlciArPSBcIlxcblxcblx0XHQ8ZGl2IGNsYXNzPSdiZy1jaXJjbGUnIC8+XFxuXFxuXHRcdDxkaXYgY2xhc3M9J2J0bi1pbmNyZWFzZSBidG4tY2lyY2xlJz5cXG5cdFx0XHQrXFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdsYWJlbC1icG0nPlxcblx0XHRcdEJQTVxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nYnBtLXZhbHVlJz5cXG5cdFx0XHQwXFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tZGVjcmVhc2UgYnRuLWNpcmNsZSc+XFxuXHRcdFx0LVxcblx0XHQ8L2Rpdj5cXG5cXG5cXG5cXG5cXG5cdFwiXG4gICAgKyBcIlxcblxcblx0XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuZnVuY3Rpb24gcHJvZ3JhbTMoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIFxuICByZXR1cm4gXCJcXG5cdFx0PGRpdiBjbGFzcz0nbGFiZWwtYnBtJz5cXG5cdFx0XHRCUE1cXG5cdFx0PC9kaXY+XFxuXFxuXHRcdDxkaXYgY2xhc3M9J2J0bi1kZWNyZWFzZSc+XFxuXHRcdFx0LVxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nYnBtLXZhbHVlJz5cXG5cdFx0XHQwXFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdidG4taW5jcmVhc2UnPlxcblx0XHRcdCtcXG5cdFx0PC9kaXY+XFxuXFxuXHRcIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlxcblxcblxcbjxkaXYgY2xhc3M9J3dyYXBwZXInPlxcblxcblxcblx0XCJcbiAgICArIFwiXFxuXFxuXHRcIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmlzRGVza3RvcCwge2hhc2g6e30saW52ZXJzZTpzZWxmLnByb2dyYW0oMywgcHJvZ3JhbTMsIGRhdGEpLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIjtcbiAgYnVmZmVyICs9IFwiXFxuXFxuXHQ8ZGl2IGNsYXNzPSd3cmFwcGVyJz5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nYmctaGFsZi1jaXJjbGUnIC8+XFxuXFxuXHRcdDxkaXYgY2xhc3M9J2xhYmVsLXNlbGVjdCc+XFxuXHRcdFx0U2VsZWN0IEtpdFxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nYnRuLWxlZnQnPlxcblx0XHRcdCZsdDtcXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9J2xhYmVsLWtpdCc+XFxuXHRcdFx0PGRpdj5cXG5cdFx0XHRcdERSVU0gS0lUXFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tcmlnaHQnPlxcblx0XHRcdCZndDtcXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cXG5cXG5cXG5cIlxuICAgICsgXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblxcblx0PGRpdiBjbGFzcz0nd3JhcHBlcic+XFxuXHRcdDxkaXYgY2xhc3M9J2J0bi1sZWZ0IGJ0bic+XFxuXHRcdFx0Jmx0O1xcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz0nbGFiZWwta2l0Jz5cXG5cdFx0XHQ8ZGl2Plxcblx0XHRcdFx0RFJVTSBLSVRcXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXFxuXHRcdDxkaXYgY2xhc3M9J2J0bi1yaWdodCBidG4nPlxcblx0XHRcdCZndDtcXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlxcblxcblwiXG4gICAgKyBcIlxcblxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSd3cmFwcGVyJz5cXG5cdDxkaXYgY2xhc3M9XFxcImxhYmVsXFxcIj5cXG5cdFx0UEFUVEVSTlNcXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz0nY29udGFpbmVyLWJ0bnMnPlxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tcGF0dGVybi0xIGJ0bic+MTwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tcGF0dGVybi0xIGJ0bic+MjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tcGF0dGVybi0xIGJ0bic+MzwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tcGF0dGVybi0xIGJ0bic+NDwvZGl2Plxcblx0PC9kaXY+XFxuPC9kaXY+XCI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblx0PGRpdiBjbGFzcz0nYnRuLXBsYXkgaWNvbi1wbGF5Jz48L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J2J0bi1wYXVzZSBpY29uLXBhdXNlJz48L2Rpdj5cXG5cXG5cIjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblxcblx0PGRpdiBjbGFzcz0nYnRuLXBsYXkgaWNvbi1wbGF5Jz48L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J2J0bi1wYXVzZSBpY29uLXBhdXNlJz48L2Rpdj5cXG5cdDxkaXYgY2xhc3M9J2xhYmVsLWJ0bic+XFxuXHRcdFBBVVNFXFxuXHQ8L2Rpdj5cXG5cXG5cIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIlxcblwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCBkZXB0aDAuaXNEZXNrdG9wLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdidG4tc3RlcHMnPlxcblx0U1RFUFNcXG48L2Rpdj5cXG5cXG48ZGl2IGNsYXNzPSdidG4tcGFkcyc+XFxuXHRQQURcXG48L2Rpdj5cXG5cIjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIjtcbiAgYnVmZmVyICs9IFwiXFxuXFxuXHQ8ZGl2IGNsYXNzPSd3cmFwcGVyJz5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLXNlcXVlbmNlcic+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz0nY29sdW1uLTAnPlxcblx0XHRcdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLXRvZ2dsZSc+PC9kaXY+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPSdidG4tY2xlYXInPkNMRUFSIFNFUVVFTkNFUjwvZGl2Plxcblx0XHRcdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLXBsYXktcGF1c2UnPjwvZGl2Plxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdDxkaXYgY2xhc3M9J2NvbHVtbi0xJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9J3NlcXVlbmNlcic+XFxuXFxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9J3BhdHRlcm4tc2VsZWN0b3InPlxcblx0XHRcdFx0XHRcdFBhdHRlcm4gU2VsZWN0b3JcXG5cdFx0XHRcdFx0PC9kaXY+XFxuXFxuXHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHRcdDxkaXYgc3R5bGU9J3Bvc2l0aW9uOnJlbGF0aXZlJz5cXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz0nbGl2ZS1wYWQnPlxcblxcblx0XHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdDxkaXYgY2xhc3M9J2NvbHVtbi0zJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9J2JwbSc+QlBNPC9kaXY+XFxuXHRcdFx0PC9kaXY+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiY29sdW1uLTRcXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz0nYnRuLXNoYXJlJz5cXG5cdFx0XHRcdFx0U0hBUkVcXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdDwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2PlxcblxcblxcblxcblxcblwiXG4gICAgKyBcIlxcblxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIjtcbiAgYnVmZmVyICs9IFwiXFxuXHQ8ZGl2IGNsYXNzPSd3cmFwcGVyJz5cXG5cXG5cdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLXNlcXVlbmNlcic+XFxuXHRcdFx0XCJcbiAgICArIFwiXFxuXHRcdFx0PGRpdiBjbGFzcz0ncm93LTEnPlxcblx0XHRcdFx0PGRpdiBjbGFzcz0nY29udGFpbmVyLXBsYXktcGF1c2UnPjwvZGl2Plxcblx0XHRcdFx0PGRpdiBjbGFzcz0nYnRuLXNoYXJlJz5cXG5cdFx0XHRcdFx0U0hBUkVcXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdFwiXG4gICAgKyBcIlxcblx0XHRcdDxkaXYgY2xhc3M9J3Jvdy0yJz5cXG5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHRcIlxuICAgICsgXCJcXG5cdFx0XHQ8ZGl2IGNsYXNzPSdyb3ctMyc+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPSdidG4tY2xlYXInPlxcblx0XHRcdFx0XHRDTEVBUlxcblx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPSdidG4tamFtLWxpdmUnPlxcblx0XHRcdFx0XHRKQU0gTElWRSAmZ3Q7XFxuXHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHRcIlxuICAgICsgXCJcXG5cdFx0XHQ8ZGl2IGNsYXNzPSdyb3ctNCc+XFxuXFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPSdjb250YWluZXItbGl2ZS1wYWQnPlxcblx0XHRcdExJVkUgUEFEXFxuXHRcdDwvZGl2Plxcblxcblx0PC9kaXY+XFxuXFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBidWZmZXIgKz0gXCJcXG5cXG5cIlxuICAgICsgXCJcXG5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgZGVwdGgwLmlzRGVza3RvcCwge2hhc2g6e30saW52ZXJzZTpzZWxmLnByb2dyYW0oMywgcHJvZ3JhbTMsIGRhdGEpLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xuICB9KSIsIiMjIypcbiAqIExhbmRpbmcgdmlldyB3aXRoIHN0YXJ0IGJ1dHRvbiBhbmQgaW5pdGlhbCBhbmltYXRpb25cbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5QdWJTdWIgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL1B1YlN1YidcblB1YkV2ZW50ID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9sYW5kaW5nLXRlbXBsYXRlLmhicydcblxuY2xhc3MgTGFuZGluZ1ZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgIyBUaGUgdGltZSBiZWZvcmUgdGhlIHZpZXcgZmlyc3QgYXBwZWFyc1xuICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgU0hPV19ERUxBWTogMVxuXG4gICMgVGhlIHRleHQgdGhhdCBhcHBlYXJzIGFmdGVyIGluc3RydWN0aW9uc1xuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgU1RBUlRfQlROX1RFWFQ6ICdHRVQgU1RBUlRFRCdcblxuICAjIFRoZSBjb250YWluZXIgY2xhc3NcbiAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gIGNsYXNzTmFtZTogJ2NvbnRhaW5lci1sYW5kaW5nJ1xuXG4gICMgVGVtcGxhdGVcbiAgIyBAdHlwZSB7RnVuY3Rpb259XG5cbiAgdGVtcGxhdGU6IHRlbXBsYXRlXG5cbiAgIyBCb29sZWFuIHRvIGNoZWNrIGlmIGluc3RydWN0aW9ucyBzaG91bGQgYXBwZWFyXG4gICMgQHR5cGUge0Jvb2xlYW59XG5cbiAgaW5zdHJ1Y3Rpb25zU2hvd2luZzogZmFsc2VcblxuXG4gIGV2ZW50czpcbiAgICAnbW91c2VvdmVyIC5idG4tc3RhcnQnOiAnb25Nb3VzZU92ZXInXG4gICAgJ21vdXNlb3V0ICAuYnRuLXN0YXJ0JzogJ29uTW91c2VPdXQnXG4gICAgJ3RvdWNoZW5kICAuYnRuLXN0YXJ0JzogJ29uU3RhcnRCdG5DbGljaydcbiAgICAndG91Y2hlbmQgIC5idG4taW5zdHJ1Y3Rpb25zJzogJ29uSW5zdHJ1Y3Rpb25zQnRuQ2xpY2snXG5cblxuICAjIFJlbmRlciB0aGUgdmlld1xuXG4gIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgQGluc3RydWN0aW9uc1Nob3dpbmcgPSBmYWxzZVxuXG4gICAgQCRtYWluQ29udGFpbmVyID0gJCgnI2NvbnRhaW5lci1tYWluJylcbiAgICBAJHdyYXBwZXIgPSBAJGVsLmZpbmQgJy53cmFwcGVyJ1xuICAgIEAkbGFuZGluZyA9IEAkZWwuZmluZCAnLmxhbmRpbmcnXG4gICAgQCRpbnN0cnVjdGlvbnMgPSBAJGVsLmZpbmQgJy5pbnN0cnVjdGlvbnMnXG4gICAgQCRsb2dvID0gQCRlbC5maW5kICcubG9nbydcbiAgICBAJG1lc3NhZ2UgPSBAJGVsLmZpbmQgJy5tZXNzYWdlJ1xuICAgIEAkc3RhcnRCdG4gPSBAJGVsLmZpbmQgJy5idG4tc3RhcnQnXG4gICAgQCRpbnN0cnVjdGlvbnNCdG4gPSBAJGVsLmZpbmQgJy5idG4taW5zdHJ1Y3Rpb25zJ1xuXG4gICAgQHZpZXdlZEluc3RydWN0aW9ucyA9ICQuY29va2llKCdtcGNhaGgtaW5zdHJ1Y3Rpb25zLXZpZXdlZCcpXG5cbiAgICBUd2VlbkxpdGUuc2V0IEAkZWwsIGF1dG9BbHBoYTogMFxuICAgIEBcblxuXG4gICMgQW5pbWF0ZSBpbiB0aGUgZmlyc3QgbGFuZGluZyB2aWV3XG5cbiAgc2hvdzogLT5cbiAgICBkZWxheSA9IEBTSE9XX0RFTEFZXG5cbiAgICBUd2VlbkxpdGUudG8gQCRlbCwgLjMsIGF1dG9BbHBoYTogMVxuICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRsb2dvLCAuNCwgeDogLTIwMCwgYXV0b0FscGhhOiAwLFxuICAgICAgYXV0b0FscGhhOiAxXG4gICAgICB4OiAwXG4gICAgICBlYXNlOiBFeHBvLmVhc2VPdXRcbiAgICAgIGRlbGF5OiBkZWxheVxuXG4gICAgVHdlZW5MaXRlLmZyb21UbyBAJG1lc3NhZ2UsIC40LCB4OiAyMDAsIGF1dG9BbHBoYTogMCxcbiAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgeDogMFxuICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG4gICAgICBkZWxheTogZGVsYXlcblxuICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRzdGFydEJ0biwgLjQsIHk6IDIwMCwgYXV0b0FscGhhOiAwLFxuICAgICAgYXV0b0FscGhhOiAxXG4gICAgICB5OiAwXG4gICAgICBlYXNlOiBFeHBvLmVhc2VPdXRcbiAgICAgIGRlbGF5OiBkZWxheSArIC4yLFxuXG4gICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICByZXBlYXQgPSAwXG4gICAgICAgIHR3ZWVuID0gVHdlZW5MaXRlLnRvIEAkc3RhcnRCdG4sIC4xLFxuICAgICAgICAgIHNjYWxlOiAxLjFcblxuICAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICB0d2Vlbi5yZXZlcnNlKClcblxuICAgICAgICAgIG9uUmV2ZXJzZUNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgaWYgcmVwZWF0IDwgMVxuICAgICAgICAgICAgICByZXBlYXQrK1xuICAgICAgICAgICAgICB0d2Vlbi5yZXN0YXJ0KClcblxuICAgIGlmIEB2aWV3ZWRJbnN0cnVjdGlvbnNcbiAgICAgIFR3ZWVuTGl0ZS50byBAJGluc3RydWN0aW9uc0J0biwgLjMsXG4gICAgICAgIGF1dG9BbHBoYTogLjRcbiAgICAgICAgZGVsYXk6IEBTSE9XX0RFTEFZICsgMVxuXG4gICAgZWxzZVxuICAgICAgQCRpbnN0cnVjdGlvbnNCdG4uaGlkZSgpXG5cblxuICAjIEhpZGUgdGhlIHZpZXcgYW5kIHRyaWdnZXIgb25lIG9mIHR3byBhbmltYXRpb24gc2VxdWVuY2VzOyB0aGVcbiAgIyBpbnN0cnVjdGlvbnMgcGFnZSBvciB0aGUgYXJyaXZhbCBtZXNzYWdlLiAgRGVwZW5kcyBvbiB3aGV0aGVyXG4gICMgY29va2llIGlzIHNldFxuXG4gIGhpZGU6IChvcHRpb25zKSAtPlxuICAgIHNlbGYgPSBAXG4gICAgZGVsYXkgPSAwXG5cbiAgICByZWRpcmVjdCA9ID0+XG4gICAgICBfLmRlbGF5ID0+XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJyNjcmVhdGUnXG5cbiAgICAgICAgaWYgb3B0aW9ucz8ucmVtb3ZlXG4gICAgICAgICAgc2VsZi5yZW1vdmUoKVxuICAgICAgLCAzMDBcblxuICAgICMgRmFkZSBvdXQgYnV0dG9uXG4gICAgVHdlZW5MaXRlLnRvIEAkc3RhcnRCdG4sIC4zLFxuICAgICAgYXV0b0FscGhhOiAwXG4gICAgICBzY2FsZTogMFxuICAgICAgZWFzZTogQmFjay5lYXNlSW5cbiAgICAgIGRlbGF5OiBkZWxheVxuXG4gICAgIyBJTlNUUlVDVElPTlMgYW5pbWF0aW9uLW91dCBzZXF1ZW5jZSBpZiBpbnN0cnVjdGlvbnMgYXJlIHVwXG4gICAgaWYgQGluc3RydWN0aW9uc1Nob3dpbmcgaXMgdHJ1ZVxuICAgICAgVHdlZW5MaXRlLnRvIEAkZWwsIC4zLCBhdXRvQWxwaGE6IDAsIGRlbGF5OiAuMlxuICAgICAgVHdlZW5MaXRlLnRvIEAkaW5zdHJ1Y3Rpb25zLCAuMyxcbiAgICAgICAgYXV0b0FscGhhOiAwXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluXG4gICAgICAgIGRlbGF5OiBkZWxheSArIC4yXG5cbiAgICAgICAgIyBUcmlnZ2VyIG5ldyByb3V0ZSBhZnRlciBhbmltYXRpb25cbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICByZWRpcmVjdCgpXG5cbiAgICAjIFVzZXIgaGFzIGFscmVhZHkgc2VlbiBpbnN0cnVjdGlvbnMsIG5vcm1hbCBmYWRlIG91dFxuICAgIGVsc2VcbiAgICAgIFR3ZWVuTGl0ZS50byBAJGVsLCAuMywgYXV0b0FscGhhOiAwLCBkZWxheTogLjVcbiAgICAgIFR3ZWVuTGl0ZS50byBAJGxvZ28sIC40LFxuICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgeDogLTIwMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VJblxuICAgICAgICBkZWxheTogZGVsYXkgKyAuMlxuXG4gICAgICBUd2VlbkxpdGUudG8gQCRpbnN0cnVjdGlvbnNCdG4sIC4zLFxuICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgZGVsYXk6IGRlbGF5XG5cbiAgICAgIFR3ZWVuTGl0ZS50byBAJG1lc3NhZ2UsIC40LFxuICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgeDogMjAwXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZUluXG4gICAgICAgIGRlbGF5OiBkZWxheSArIC4yXG5cbiAgICAgICAgIyBUcmlnZ2VyIG5ldyByb3V0ZSBhZnRlciBhbmltYXRpb25cbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICByZWRpcmVjdCgpXG5cblxuICAjIFNob3dzIHRoZSBpbnN0cnVjdGlvbnMgcGFnZSBpZiB0aGUgdXNlciBoYXMgbmV2ZXIgdmlzaXRlZFxuICAjIHRoZSBzaXRlIGJlZm9yZS4gIElmIHRoZXkgaGF2ZSwgYSBjb29raWUgaXMgc2V0IGFuZCB0aGVcbiAgIyBpbnN0cnVjdGlvbnMgYXJlIGJ5cGFzc2VkXG5cbiAgc2hvd0luc3RydWN0aW9uczogLT5cbiAgICBAaW5zdHJ1Y3Rpb25zU2hvd2luZyA9IHRydWVcbiAgICBwcmVEZWxheSA9IC4yXG5cbiAgICBUd2VlbkxpdGUudG8gQCRsYW5kaW5nLCAuMyxcbiAgICAgIGF1dG9BbHBoYTogMFxuICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgQCRsYW5kaW5nLmhpZGUoKVxuICAgICAgICBAJGluc3RydWN0aW9ucy5zaG93KClcblxuICAgIFR3ZWVuTGl0ZS50byBAJGluc3RydWN0aW9uc0J0biwgLjMsXG4gICAgICBhdXRvQWxwaGE6IDBcbiAgICAgIGRlbGF5OiAwXG5cbiAgICBUd2VlbkxpdGUudG8gQCR3cmFwcGVyLCAuOCxcbiAgICAgIGhlaWdodDogNTYyXG4gICAgICBlYXNlOiBFeHBvLmVhc2VJbk91dFxuICAgICAgZGVsYXk6IHByZURlbGF5XG5cbiAgICBUd2VlbkxpdGUuZnJvbVRvIEAkaW5zdHJ1Y3Rpb25zLCAuNCwgaGVpZ2h0OiA5NixcbiAgICAgIGhlaWdodDogMzE1XG4gICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcbiAgICAgIGRlbGF5OiBwcmVEZWxheSArIC4zXG5cbiAgICBUd2VlbkxpdGUudG8gQCRsb2dvLCAuNCxcbiAgICAgIHk6IC0yMFxuICAgICAgZWFzZTogQmFjay5lYXNlSW5cbiAgICAgIGRlbGF5OiBwcmVEZWxheVxuICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgQCRzdGFydEJ0bi50ZXh0IEBTVEFSVF9CVE5fVEVYVFxuICAgICAgICBUd2VlbkxpdGUudG8gQCRsb2dvLCAuNCxcbiAgICAgICAgICB5OiAwXG4gICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG5cbiAgICBUd2VlbkxpdGUudG8gQCRzdGFydEJ0biwgLjQsXG4gICAgICB5OiA0MFxuICAgICAgZWFzZTogQmFjay5lYXNlSW5cbiAgICAgIGRlbGF5OiBwcmVEZWxheVxuXG4gICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICBUd2VlbkxpdGUudG8gQCRpbnN0cnVjdGlvbnMsIC40LCBhdXRvQWxwaGE6IDEsIGRlbGF5OiAwXG5cblxuICAjIEV4aXQgdGhlIGxhbmRpbmcgYW5kIHByb2NlZWQgdG8gYXBwXG5cbiAgZXhpdExhbmRpbmc6IC0+XG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBzbmQgPSBjcmVhdGVqcy5Tb3VuZC5jcmVhdGVJbnN0YW5jZSgnYXNzZXRzL2F1ZGlvL2Nva2UvMDVfX19mZW1hbGVfYWhoaF8wMS5tcDMnKVxuICAgICAgc25kLnZvbHVtZSA9IC4xXG4gICAgICBzbmQucGxheSgpXG5cbiAgICBAJG1haW5Db250YWluZXIuc2hvdygpXG4gICAgQGhpZGUoIHJlbW92ZTogdHJ1ZSApXG5cblxuICAjIEhhbmRsZXIgZm9yIGJ0biBtb3VzZW92ZXJzXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uTW91c2VPdmVyOiAoZXZlbnQpID0+XG4gICAgVHdlZW5MaXRlLnRvIEAkc3RhcnRCdG4sIC4yLFxuICAgICAgYm9yZGVyOiAnM3B4IHNvbGlkIGJsYWNrJ1xuICAgICAgc2NhbGU6IDEuMVxuICAgICAgY29sb3I6ICdibGFjaydcblxuXG4gICMgSGFuZGxlciBmb3IgYnRuIG1vdXNlb3V0XG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uTW91c2VPdXQ6IChldmVudCkgPT5cbiAgICBUd2VlbkxpdGUudG8gQCRzdGFydEJ0biwgLjIsXG4gICAgICBib3JkZXI6ICczcHggc29saWQgI0U0MUUyQidcbiAgICAgIHNjYWxlOiAxXG4gICAgICBjb2xvcjogJyNFNDFFMkInXG5cblxuICAjIEhhbmRsZXIgZm9yIHN0YXJ0IGJ0biBjbGlja3MuICBTZXRzIGEgY29va2llIGlmIHVzZXIgaGFzXG4gICMgYWxyZWFkeSBiZWVuIHRvIHNpdGVcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgb25TdGFydEJ0bkNsaWNrOiAoZXZlbnQpID0+XG4gICAgaWYgQGluc3RydWN0aW9uc1Nob3dpbmcgb3IgQGlzTW9iaWxlIG9yIChAdmlld2VkSW5zdHJ1Y3Rpb25zIGlzICd0cnVlJylcbiAgICAgIEBleGl0TGFuZGluZygpXG5cbiAgICBlbHNlXG4gICAgICAkLmNvb2tpZSgnbXBjYWhoLWluc3RydWN0aW9ucy12aWV3ZWQnLCAndHJ1ZScsIHsgZXhwaXJlczogNyB9KTtcbiAgICAgIEBzaG93SW5zdHJ1Y3Rpb25zKClcblxuXG4gICMgU2hvd3MgdGhlIGluc3RydWN0aW9ucyBzY3JlZW5cbiAgIyBAcGFyYW0ge0V2ZW50fSBldmVudFxuXG4gIG9uSW5zdHJ1Y3Rpb25zQnRuQ2xpY2s6IChldmVudCkgPT5cbiAgICBAc2hvd0luc3RydWN0aW9ucygpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYW5kaW5nVmlld1xuIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSd3cmFwcGVyJz5cXG5cXG5cdDxkaXYgY2xhc3M9J2xvZ28nIC8+XFxuXFxuXHQ8ZGl2IGNsYXNzPSdsYW5kaW5nJz5cXG5cdFx0PGRpdiBjbGFzcz0nbWVzc2FnZSc+XFxuXHRcdFx0TE9SRU0gSVBTVU0gRE9MT1IgU0lUIEFNRVQsIENPTlNFQ1RFVFVSIEFESVBTQ0lORyBFTElULiBJTiBBIE1BVFRJUyBRVUFNLlxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz0naW5zdHJ1Y3Rpb25zJz5cXG5cdFx0PGRpdiBjbGFzcz0nZmlyc3QnPlxcblx0XHRcdFBpY2sgYSBCUE0gYW5kIGEgZHJ1bSBraXQgYW5kIHJlYWR5IHlvdXJzZWxmIGZvciB0aGUgPGJyLz4gY29uc2VxdWVuY2VzIG9mIHdvcmxkLXdpZGUgZmFtZS5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXY+XFxuXHRcdFx0RWFjaCBzb25nIGNvbnRhaW5zIGVpZ2h0IHNsb3RzIHdoaWNoIGNvcnJlc3BvbmQgdG8gZWlnaHQgYmVhdHMgcGVyIG1lYXN1cmUuIDxiciAvPlxcblx0XHRcdDxpbWcgc3JjPSdhc3NldHMvaW1hZ2VzL2luc3RydWN0aW9ucy10cmFjay5wbmcnIGNsYXNzPSdpbWctdHJhY2snIC8+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2Plxcblx0XHRcdFRhcCB0aGUgc3F1YXJlIG5leHQgdG8gdGhlIGRydW0gdG8gU0VMRUNUIHRoZSBCRUFUIHZlbG9jaXR5IE9SIFRBUCBUSEUgRFJVTSBUTyBNVVRFIFRIRSBUUkFDSyA8YnIgLz5cXG5cdFx0XHQ8aW1nIHNyYz0nYXNzZXRzL2ltYWdlcy9pbnN0cnVjdGlvbnMtdmVsb2NpdHkucG5nJyBjbGFzcz0naW1nLXZlbG9jaXR5JyAvPlxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdj5cXG5cdFx0XHRKQU0gQUxPTkcgVE8gWU9VUiBCRUFUIEJZIFRBUFBJTkcgVEhFIDxzcGFuPlBBRFM8L3NwYW4+IEJVVFRPTjsgcHJlc3MgYW5kIGhvbGQgcGFkIHRvIHJlYXNzaWduIHNvdW5kXFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPSdidG4tc3RhcnQnPlxcblx0XHRDUkVBVEUgWU9VUiBPV04gSkFNXFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9J2J0bi1pbnN0cnVjdGlvbnMnPlxcblx0XHRWSUVXIElOU1RSVUNUSU9OU1xcblx0PC9kaXY+XFxuXFxuPC9kaXY+XCI7XG4gIH0pIiwiIyMjKlxuICogTW9iaWxlIHZpZXcgaWYgY2FwYWJpbGl0aWVzIGFyZSBub3QgbWV0XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA0LjkuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvbm90LXN1cHBvcnRlZC10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIE5vdFN1cHBvcnRlZFZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgY2xhc3NOYW1lOiAnY29udGFpbmVyLW5vdC1zdXBwb3J0ZWQnXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG4gIGV2ZW50czpcbiAgICAndG91Y2hlbmQgLmJ0bi1saXN0ZW4nOiAnb25MaXN0ZW5CdG5DbGljaydcblxuXG4gIHJlbmRlcjogKG9wdGlvbnMpIC0+XG4gICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgQCRub3RpZmljYXRpb24gPSBAJGVsLmZpbmQgJy5ub3RpZmljYXRpb24nXG4gICAgQCRzYW1wbGVzID0gQCRlbC5maW5kICcuc2FtcGxlcydcblxuICAgIEBcblxuXG4gIG9uTGlzdGVuQnRuQ2xpY2s6IChldmVudCkgLT5cbiAgICBUd2VlbkxpdGUudG8gQCRub3RpZmljYXRpb24sIC42LFxuICAgICAgYXV0b0FscGhhOiAwXG4gICAgICB4OiAtd2luZG93LmlubmVyV2lkdGhcbiAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cbiAgICBUd2VlbkxpdGUuZnJvbVRvIEAkc2FtcGxlcywgLjYsIHg6IHdpbmRvdy5pbm5lcldpZHRoLCBhdXRvQWxwaGE6IDAsXG4gICAgICBkaXNwbGF5OiAnYmxvY2snXG4gICAgICBhdXRvQWxwaGE6IDFcbiAgICAgIHg6IDBcbiAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBOb3RTdXBwb3J0ZWRWaWV3XG4iLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIlxcbjxkaXYgY2xhc3M9J3dyYXBwZXInPlxcblx0PGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uJz5cXG5cdFx0PGRpdiBjbGFzcz0naGVhZGxpbmUnPlxcblx0XHRcdExPT0tTIExJS0UgTVBDIEFISCBJUyBOT1QgU1VQUE9SVEVEIEJZIFlPVVIgREVWSUNFXFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPSdyZXF1aXJlbWVudHMnPlxcblx0XHRcdE1JTklNVU0gUkVRVUlSRU1FTlRTIEFORFJPSUQgNC4yIC8gaU9TIDZcXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9J2Rlc2t0b3AnPlxcblx0XHRcdFBMRUFTRSBWSVNJVCBUSElTIFNJVEUgT04gWU9VUiBERVNLVE9QIE9SXFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPSdidG4tbGlzdGVuJz5cXG5cdFx0XHRMSVNURU4gVE8gU0FNUExFIEJFQVRTIEZST00gVEhFIE1QQy1BSEggJmd0O1xcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz0nc2FtcGxlcyc+XFxuXHRcdDxkaXYgY2xhc3M9J2hlYWRsaW5lJz5cXG5cdFx0XHRMSVNURU4gVE8gU0FNUExFIEJFQVRTIEZST00gVEhFIE1QQyBBSEhcXG5cdFx0PC9kaXY+XFxuXFxuXHRcdDx0YWJsZT5cXG5cdFx0XHQ8dHI+XFxuXHRcdFx0XHQ8dGQgY2xhc3M9J3JpZ2h0LWJvdHRvbSc+XFxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9J2J0bi1wbGF5IGljb24tcGxheScvPlxcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPSdsYWJlbCc+XFxuXHRcdFx0XHRcdFx0SElQLUhPUCBTQU1QTEVcXG5cdFx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0XHQ8L3RkPlxcblx0XHRcdFx0PHRkIGNsYXNzPSdib3R0b20nPlxcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPSdidG4tcGxheSBpY29uLXBsYXknLz5cXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz0nbGFiZWwnPlxcblx0XHRcdFx0XHRcdFJPQ0sgU0FNUExFXFxuXHRcdFx0XHRcdDwvZGl2Plxcblx0XHRcdFx0PC90ZD5cXG5cdFx0XHQ8L3RyPlxcblx0XHRcdDx0cj5cXG5cdFx0XHRcdDx0ZCBjbGFzcz0ncmlnaHQnPlxcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPSdidG4tcGxheSBpY29uLXBsYXknLz5cXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz0nbGFiZWwnPlxcblx0XHRcdFx0XHRcdERBTkNFIFNBTVBMRVxcblx0XHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHRcdDwvdGQ+XFxuXHRcdFx0XHQ8dGQ+XFxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9J2J0bi1wbGF5IGljb24tcGxheScvPlxcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPSdsYWJlbCc+XFxuXHRcdFx0XHRcdFx0Q09LRSBTQU1QTEVcXG5cdFx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0XHQ8L3RkPlxcblx0XHRcdDwvdHI+XFxuXHRcdDwvdGFibGU+XFxuXFxuXHQ8L2Rpdj5cXG48L2Rpdj5cIjtcbiAgfSkiLCIjIyMqXG4gKiBTaGFyZSB0aGUgdXNlciBjcmVhdGVkIGJlYXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMTcuMTRcbiMjI1xuXG5QdWJTdWIgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvUHViU3ViJ1xuUHViRXZlbnQgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2V2ZW50cy9QdWJFdmVudC5jb2ZmZWUnXG5TaGFyZWRUcmFja01vZGVsID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL1NoYXJlZFRyYWNrTW9kZWwuY29mZmVlJ1xuQ3JlYXRlVmlldyAgICAgICA9IHJlcXVpcmUgJy4uL2NyZWF0ZS9DcmVhdGVWaWV3LmNvZmZlZSdcblBsYXlQYXVzZUJ0biAgICAgPSByZXF1aXJlICcuLi9jcmVhdGUvY29tcG9uZW50cy9QbGF5UGF1c2VCdG4uY29mZmVlJ1xuU2VxdWVuY2VyICAgICAgICA9IHJlcXVpcmUgJy4uL2NyZWF0ZS9jb21wb25lbnRzL3NlcXVlbmNlci9TZXF1ZW5jZXIuY29mZmVlJ1xuVmlldyAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zaGFyZS10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIFNoYXJlVmlldyBleHRlbmRzIFZpZXdcblxuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgY2xhc3NOYW1lOiAnY29udGFpbmVyLXNoYXJlJ1xuXG4gICMgVGhlIHRlbXBsYXRlXG4gICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG4gICMgXCJIaWRkZW5cIiB2aWV3IHdoaWNoIGFsbG93cyBmb3IgcGxheWJhY2sgb2Ygc2hhcmVkIGF1ZGlvXG4gICMgQHR5cGUge0NyZWF0ZVZpZXd9XG5cbiAgY3JlYXRlVmlldzogbnVsbFxuXG4gIGV2ZW50czpcbiAgICAnbW91c2VvdmVyIC5idG4tc3RhcnQnOiAnb25Nb3VzZU92ZXInXG4gICAgJ21vdXNlb3V0ICAuYnRuLXN0YXJ0JzogJ29uTW91c2VPdXQnXG4gICAgJ3RvdWNoZW5kICAuYnRuLXN0YXJ0JzogJ29uU3RhcnRCdG5DbGljaydcblxuXG4gICMgUmVuZGVycyB0aGUgdmlld1xuICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgcmVuZGVyOiAob3B0aW9ucykgLT5cbiAgICBzdXBlciBvcHRpb25zXG5cbiAgICBAJHRleHRDb250YWluZXIgPSBAJGVsLmZpbmQgJy5jb250YWluZXItdGV4dCdcbiAgICBAJG1haW5Db250YWluZXIgPSAkKCcjY29udGFpbmVyLW1haW4nKVxuXG4gICAgQCRuYW1lID0gQCRlbC5maW5kICcubmFtZSdcbiAgICBAJHRpdGxlID0gQCRlbC5maW5kICcudGl0bGUnXG4gICAgQCRtZXNzYWdlID0gQCRlbC5maW5kICcubWVzc2FnZSdcbiAgICBAJHBsYXlCdG4gPSBAJGVsLmZpbmQgJy5idG4tcGxheSdcbiAgICBAJHN0YXJ0QnRuID0gQCRlbC5maW5kICcuYnRuLXN0YXJ0J1xuXG4gICAgVHdlZW5MaXRlLnNldCBAJHRleHRDb250YWluZXIsIHk6IC0zMDAsIGF1dG9BbHBoYTogMFxuICAgIFR3ZWVuTGl0ZS5zZXQgQCRzdGFydEJ0biwgeTogMzAwLCBhdXRvQWxwaGE6IDBcblxuICAgIEAkbWFpbkNvbnRhaW5lci5zaG93KClcblxuICAgIEBjcmVhdGVWaWV3ID0gbmV3IENyZWF0ZVZpZXdcbiAgICAgIGFwcE1vZGVsOiBAYXBwTW9kZWxcbiAgICAgIHNoYXJlZFRyYWNrTW9kZWw6IEBzaGFyZWRUcmFja01vZGVsXG4gICAgICBraXRDb2xsZWN0aW9uOiBAa2l0Q29sbGVjdGlvblxuXG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBAcGxheVBhdXNlQnRuID0gbmV3IFBsYXlQYXVzZUJ0blxuICAgICAgICBhcHBNb2RlbDogQGFwcE1vZGVsXG5cbiAgICAgIEAkZWwuZmluZCgnLmNvbnRhaW5lci1idG4nKS5hcHBlbmQgQHBsYXlQYXVzZUJ0bi5yZW5kZXIoKS5lbFxuICAgICAgQHBsYXlQYXVzZUJ0bi4kZWwuZmluZCgnLmxhYmVsLWJ0bicpLmhpZGUoKVxuICAgICAgVHdlZW5MaXRlLnNldCBAcGxheVBhdXNlQnRuLiRlbCwgc2NhbGU6IDEsIGF1dG9BbHBoYTogMFxuXG4gICAgQCRlbC5hcHBlbmQgQGNyZWF0ZVZpZXcucmVuZGVyKCkuZWxcbiAgICBAY3JlYXRlVmlldy4kZWwuaGlkZSgpXG4gICAgQGNyZWF0ZVZpZXcua2l0U2VsZWN0b3IucmVtb3ZlKClcblxuICAgIEBpbXBvcnRUcmFjayBAYXBwTW9kZWwuZ2V0KCdzaGFyZUlkJylcblxuICAgIEBcblxuXG4gICMgU2hvdyB0aGUgdmlldywgYW5kIGhpZGUgdGhlIG1lc3NhZ2UgaWYgb24gbW9iaWxlXG5cbiAgc2hvdzogLT5cbiAgICBkZWxheSA9IC41XG5cbiAgICBpZiBAaXNNb2JpbGVcbiAgICAgIEAkbWVzc2FnZS5oaWRlKClcblxuICAgICAgVHdlZW5MaXRlLmZyb21UbyBAJHRleHRDb250YWluZXIsIC40LCB5OiAtMzAwLCBhdXRvQWxwaGE6IDAsXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICB5OiAxMFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VPdXQsXG4gICAgICAgIGRlbGF5OiBkZWxheSArIC4zXG5cbiAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8gQCRzdGFydEJ0biwgLjQsIHk6IDEwMDAsIGF1dG9BbHBoYTogMCxcbiAgICAgICAgYXV0b0FscGhhOiAxXG4gICAgICAgIHk6IDE2MFxuICAgICAgICBlYXNlOiBFeHBvLmVhc2VPdXQsXG4gICAgICAgIGRlbGF5OiBkZWxheSArIC4zXG4gICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgVHdlZW5MaXRlLnRvIEBwbGF5UGF1c2VCdG4uJGVsLCAuMyxcbiAgICAgICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG4gICAgICAgICAgICBkZWxheTogMFxuXG4gICAgZWxzZVxuICAgICAgVHdlZW5MaXRlLmZyb21UbyBAJHRleHRDb250YWluZXIsIC40LCB5OiAtMzAwLCBhdXRvQWxwaGE6IDAsXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICB5OiAwXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZU91dCxcbiAgICAgICAgZGVsYXk6IGRlbGF5ICsgLjNcblxuICAgICAgVHdlZW5MaXRlLmZyb21UbyBAJHN0YXJ0QnRuLCAuNCwgeTogMzAwLCBhdXRvQWxwaGE6IDAsXG4gICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICB5OiAtODBcbiAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0LFxuICAgICAgICBkZWxheTogZGVsYXkgKyAuM1xuXG5cbiAgIyBIaWRlIHRoZSB2aWV3XG5cbiAgaGlkZTogKG9wdGlvbnMpIC0+XG4gICAgaWYgQGlzTW9iaWxlXG4gICAgICBUd2VlbkxpdGUudG8gQCRlbCwgLjQsIGF1dG9BbHBoYTogMCxcbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICBpZiBvcHRpb25zPy5yZW1vdmVcbiAgICAgICAgICAgIF8uZGVsYXkgPT5cbiAgICAgICAgICAgICAgQHJlbW92ZSgpXG4gICAgICAgICAgICAsIDMwMFxuXG4gICAgZWxzZVxuICAgICAgVHdlZW5MaXRlLnRvIEAkc3RhcnRCdG4sIC4zLFxuICAgICAgICBzY2FsZTogMFxuICAgICAgICBhdXRvQWxwaGE6IDBcbiAgICAgICAgZWFzZTogQmFjay5lYXNlSW5cblxuICAgICAgVHdlZW5MaXRlLnRvIEAkZWwsIC40LCBhdXRvQWxwaGE6IDAsXG4gICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgaWYgb3B0aW9ucz8ucmVtb3ZlXG4gICAgICAgICAgICBfLmRlbGF5ID0+XG4gICAgICAgICAgICAgIEByZW1vdmUoKVxuICAgICAgICAgICAgLCAzMDBcblxuXG4gICMgQWRkcyBsaXN0ZW5lcnMgcmVsYXRlZCB0byBzaGFyaW5nIHRyYWNrcy4gIFdoZW4gY2hhbmdlZCwgdGhlIHZpZXdcbiAgIyBpcyBwb3B1bGF0ZWQgd2l0aCB0aGUgdXNlcnMgc2hhcmVkIGRhdGFcblxuICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICBAbGlzdGVuVG8gQGFwcE1vZGVsLCAnY2hhbmdlOnNoYXJlZFRyYWNrTW9kZWwnLCBAb25TaGFyZWRUcmFja01vZGVsQ2hhbmdlXG5cblxuICAjIEltcG9ydCB0aGUgc2hhcmVkIHRyYWNrIGJ5IHJlcXVlc3RpbmcgdGhlIGRhdGEgZnJvbSBwYXJzZVxuICAjIE9uY2UgaW1wb3J0ZWRcblxuICBpbXBvcnRUcmFjazogKHNoYXJlSWQsIGNhbGxiYWNrKSA9PlxuICAgIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5IFNoYXJlZFRyYWNrTW9kZWxcblxuICAgICMgQ3JlYXRlIHJlcXVlc3QgdG8gZmV0Y2ggZGF0YSBmcm9tIHRoZSBQYXJzZSBEQlxuICAgIHF1ZXJ5LmdldCBzaGFyZUlkLFxuICAgICAgZXJyb3I6IChvYmplY3QsIGVycm9yKSA9PlxuICAgICAgICBjb25zb2xlLmVycm9yIG9iamVjdCwgZXJyb3JcblxuICAgICAgIyBIYW5kbGVyIGZvciBzdWNjZXNzIGV2ZW50cy4gIFJldHVybnMgdGhlIHNhdmVkIG1vZGVsIHdoaWNoIGlzIHRoZW5cbiAgICAgICMgZGlzcGF0Y2hlZCwgdmlhIFB1YlN1YiwgdG8gdGhlIFNlcXVlbmNlciB2aWV3IGZvciBwbGF5YmFjayBhbmQgcmVuZGVyXG4gICAgICAjIEBwYXJhbSB7U2hhcmVkVHJhY2tNb2RlbH1cblxuICAgICAgc3VjY2VzczogKHNoYXJlZFRyYWNrTW9kZWwpID0+XG4gICAgICAgIGNvbnNvbGUubG9nIEpTT04uc3RyaW5naWZ5IHNoYXJlZFRyYWNrTW9kZWwudG9KU09OKClcblxuICAgICAgICBAYXBwTW9kZWwuc2V0XG4gICAgICAgICAgJ2JwbSc6IHNoYXJlZFRyYWNrTW9kZWwuZ2V0ICdicG0nXG4gICAgICAgICAgJ3NoYXJlZFRyYWNrTW9kZWwnOiBzaGFyZWRUcmFja01vZGVsXG4gICAgICAgICAgJ3NoYXJlSWQnOiBudWxsXG5cbiAgICAgICAgQGxpc3RlblRvIEBjcmVhdGVWaWV3LCBQdWJFdmVudC5CRUFULCBAb25CZWF0XG5cbiAgICAgICAgIyBJbXBvcnQgaW50byBzZXF1ZW5jZXJcbiAgICAgICAgQGNyZWF0ZVZpZXcuc2VxdWVuY2VyLmltcG9ydFRyYWNrXG4gICAgICAgICAga2l0VHlwZTogc2hhcmVkVHJhY2tNb2RlbC5nZXQgJ2tpdFR5cGUnXG4gICAgICAgICAgaW5zdHJ1bWVudHM6IHNoYXJlZFRyYWNrTW9kZWwuZ2V0ICdpbnN0cnVtZW50cydcbiAgICAgICAgICBwYXR0ZXJuU3F1YXJlR3JvdXBzOiBzaGFyZWRUcmFja01vZGVsLmdldCAncGF0dGVyblNxdWFyZUdyb3VwcydcblxuICAgICAgICAgICMgSGFuZGxlciBmb3IgY2FsbGJhY2tzIG9uY2UgdGhlIHRyYWNrIGhhcyBiZWVuIGltcG9ydGVkIGFuZFxuICAgICAgICAgICMgcmVuZGVyZWQuICBEaXNwbGF5cyB0aGUgU2hhcmUgdmlldyBhbmQgYmVnaW5zIHBsYXliYWNrXG4gICAgICAgICAgIyBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcblxuICAgICAgICAgIGNhbGxiYWNrOiAocmVzcG9uc2UpIC0+XG5cblxuICAjIEhhbmRsZXIgZm9yIHdoZW4gdGhlIFBhcnNlIGRhdGEgaXMgcmV0dXJuZWQgZnJvbSB0aGUgc2VydmljZVxuICAjIEBwYXJhbSB7U2hhcmVkVHJhY2tNb2RlbH0gbW9kZWxcblxuICBvblNoYXJlZFRyYWNrTW9kZWxDaGFuZ2U6IChtb2RlbCkgPT5cbiAgICBzaGFyZWRUcmFja01vZGVsID0gbW9kZWwuY2hhbmdlZC5zaGFyZWRUcmFja01vZGVsXG5cbiAgICAjIENoZWNrIGFnYWluc3QgcmVzZXRzXG4gICAgdW5sZXNzIHNoYXJlZFRyYWNrTW9kZWwgaXMgbnVsbFxuXG4gICAgICBAJG5hbWUuaHRtbCBzaGFyZWRUcmFja01vZGVsLmdldCAnc2hhcmVOYW1lJ1xuICAgICAgQCR0aXRsZS5odG1sIHNoYXJlZFRyYWNrTW9kZWwuZ2V0ICdzaGFyZVRpdGxlJ1xuICAgICAgQCRtZXNzYWdlLmh0bWwgc2hhcmVkVHJhY2tNb2RlbC5nZXQgJ3NoYXJlTWVzc2FnZSdcblxuICAgICAgVHdlZW5MaXRlLnNldCBAJGVsLCBhdXRvQWxwaGE6IDFcblxuICAgICAgQGFwcE1vZGVsLnNldCAncGxheWluZycsIChpZiBAaXNNb2JpbGUgdGhlbiBmYWxzZSBlbHNlIHRydWUpXG4gICAgICBAc2hvdygpXG5cblxuICAjIEhhbmRsZXIgZm9yIHN0YXJ0IGJ1dHRvbiBjbGlja3MsIHdoaWNoIHNlbmRzIHRoZSB1c2VyIHRvIHRoZSBDcmVhdGVWaWV3LlxuICAjIFJlc2V0cyB0aGUgQXBwTW9kZWwgdG8gaXRzIGRlZmF1bHQgc3RhdGVcbiAgIyBAcGFyYW0ge01vdXNlRXZlbnR9IGV2ZW50XG5cbiAgb25TdGFydEJ0bkNsaWNrOiAoZXZlbnQpIC0+XG4gICAgQHJlbW92ZUV2ZW50TGlzdGVuZXJzKClcbiAgICBAY3JlYXRlVmlldy5yZW1vdmUoKVxuICAgICQoJy5jb250YWluZXIta2l0LXNlbGVjdG9yJykucmVtb3ZlKClcblxuICAgIEBhcHBNb2RlbC5zZXRcbiAgICAgICdicG0nOiAxMjBcbiAgICAgICdzaGFyZWRUcmFja01vZGVsJzogbnVsbFxuICAgICAgJ3Nob3dTZXF1ZW5jZXInOiBmYWxzZVxuXG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnY3JlYXRlJ1xuXG5cbiAgIyBIYW5kbGVyIGZvciBtb3VzZSBldmVudHMgb24gZGVza3RvcFxuICAjIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnRcblxuICBvbk1vdXNlT3ZlcjogKGV2ZW50KSA9PlxuICAgIFR3ZWVuTGl0ZS50byBAJHN0YXJ0QnRuLCAuMixcbiAgICAgIGJvcmRlcjogJzNweCBzb2xpZCBibGFjaydcbiAgICAgIHNjYWxlOiAxLjFcbiAgICAgIGNvbG9yOiAnYmxhY2snXG5cblxuICAjIEhhbmRsZXIgZm9yIG1vdXNlIGV2ZW50cyBvbiBkZXNrdG9wXG4gICMgQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudFxuXG4gIG9uTW91c2VPdXQ6IChldmVudCkgPT5cbiAgICBUd2VlbkxpdGUudG8gQCRzdGFydEJ0biwgLjIsXG4gICAgICBib3JkZXI6ICczcHggc29saWQgd2hpdGUnXG4gICAgICBzY2FsZTogMVxuICAgICAgY29sb3I6ICd3aGl0ZSdcblxuXG4gIG9uQmVhdDogKHBhcmFtcykgPT5cbiAgICBAdHJpZ2dlciBQdWJFdmVudC5CRUFULCBwYXJhbXNcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlVmlld1xuIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblxcblx0XHRcdDxkaXYgY2xhc3M9J21lc3NhZ2UnPlxcblxcblx0XHRcdDwvZGl2Plxcblx0XHRcIjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcblxcblx0XHRcdDxkaXYgY2xhc3M9J2NvbnRhaW5lci1idG4nPlxcblxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9J2xvZ28tY29rZSc+PC9kaXY+XFxuXFxuPGRpdiBjbGFzcz0nd3JhcHBlcic+XFxuXFxuXHQ8ZGl2IGNsYXNzPSdjb250YWluZXItdGV4dCc+XFxuXHRcdDxkaXYgY2xhc3M9J3RpdGxlJz5cXG5cXG5cdFx0PC9kaXY+XFxuXFxuXHRcdDxkaXYgY2xhc3M9J25hbWUnPlxcblxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0XCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIGRlcHRoMC5pc0Rlc2t0b3AsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5wcm9ncmFtKDMsIHByb2dyYW0zLCBkYXRhKSxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9J2J0bi1zdGFydCc+XFxuXHRcdENSRUFURSBZT1VSIE9XTiBKQU1cXG5cdDwvZGl2PlxcblxcbjwvZGl2PlxcblxcblxcbjxkaXYgY2xhc3M9J2J0bi1wbGF5Jz5cXG5cXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBzZWxmPXRoaXM7XG5cbmZ1bmN0aW9uIHByb2dyYW0xKGRlcHRoMCxkYXRhKSB7XG4gIFxuICB2YXIgYnVmZmVyID0gXCJcIjtcbiAgYnVmZmVyICs9IFwiXFxuXFxuXHQ8ZGl2IGlkPSdjb250YWluZXItbWFpbic+XFxuXHRcdDxkaXYgaWQ9J2NvbnRhaW5lci1ib3R0b20nPlxcblxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2PlxcblxcblxcblxcblwiXG4gICAgKyBcIlxcblxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiXFxuXFxuXHQ8ZGl2IGlkPSdjb250YWluZXItbWFpbic+XFxuXHRcdDxkaXYgY2xhc3M9J3RvcC1iYXInPlxcblx0XHRcdDxkaXYgaWQ9J2xvZ28nIGNsYXNzPSdsb2dvJyAvPlxcblx0XHQ8L2Rpdj5cXG5cXG5cdDwvZGl2PlxcblwiO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiXFxuXCJcbiAgICArIFwiXFxuXFxuXCI7XG4gIHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsIGRlcHRoMC5pc0Rlc2t0b3AsIHtoYXNoOnt9LGludmVyc2U6c2VsZi5wcm9ncmFtKDMsIHByb2dyYW0zLCBkYXRhKSxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9J2RldmljZS1vcmllbnRhdGlvbic+XFxuXHQ8aW1nIHNyYz0nYXNzZXRzL2ltYWdlcy9sYW5kc2NhcGUtbWVzc2FnZS5wbmcnIC8+XFxuPC9kaXY+XCI7XG4gIH0pIiwiLyoqXG4gKiBCdWJibGVzIGdlbmVyYXRvclxuICogQHJlcXVpcmVzIGpRdWVyeSAmIFR3ZWVuTWF4XG4gKiBAYXV0aG9yIENoYXJsaWVcbiAqL1xuXG52YXIgQnViYmxlcyA9IHtcblxuICAvKipcbiAgICogd2luZG93IHJlZmVyZW5jZVxuICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgKi9cbiAgJHdpbmRvdyAgICAgOiAkKHdpbmRvdyksXG5cbiAgLyoqXG4gICAqIEJ1YmJsZSBlbGVtZW50IHdyYXBwZXJcbiAgICogQHR5cGUge2pRdWVyeX1cbiAgICovXG4gICRjb250YWluZXIgIDogbnVsbCxcblxuICAvKipcbiAgICogdmlld3BvcnQgd2lkdGhcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHdpbldpZHRoICAgIDogMCxcblxuICAvKipcbiAgICogdmlld3BvcnQgaGVpZ2h0XG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICB3aW5IZWlnaHQgICA6IDAsXG5cbiAgLyoqXG4gICAqIEJ1YmJsZSBzaXplIGNsYXNzZXNcbiAgICogQHR5cGUge0FycmF5fVxuICAgKi9cbiAgc2l6ZUNsYXNzZXMgOiBbICdzbWFsbCcsICdtZWRpdW0nLCAnYmlnJyBdLFxuXG4gIGJ1YmJsZXM6IG51bGwsXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIEJ1YmJsZXNcbiAgICovXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLiRjb250YWluZXIgPSAkKCc8ZGl2PicsIHsnY2xhc3MnOiAnYnViYmxlcy1jb250YWluZXInfSlcbiAgICB0aGlzLndpbldpZHRoICAgPSB0aGlzLiR3aW5kb3cud2lkdGgoKTtcbiAgICB0aGlzLndpbkhlaWdodCAgPSB0aGlzLiR3aW5kb3cuaGVpZ2h0KCk7XG4gICAgdGhpcy5mbGFrZXMgPSBbXVxuICAgIHRoaXMuYWRkRXZlbnRsaXN0ZW5lcnMoKTtcbiAgICB0aGlzLmluaXRCdWJibGVzKCk7XG5cblxuICAgIHJldHVybiB0aGlzLiRjb250YWluZXJcbiAgfSxcblxuICAvKipcbiAgICogRXZlbnQgbGlzdGVuZXJzXG4gICAqL1xuICBhZGRFdmVudGxpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuJHdpbmRvdy5yZXNpemUoJC5wcm94eSh0aGlzLl9vbldpbmRvd1Jlc2l6ZSwgdGhpcykpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBmbGFrZXNcbiAgICovXG4gIGluaXRCdWJibGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jcmVhdGVCdWJibGUoKTtcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlcyBidWJibGVzXG4gICAqL1xuICBjcmVhdGVCdWJibGU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJGJ1YmJsZSA9ICQoJzxkaXY+JywgeydjbGFzcyc6ICdidWJibGUnfSk7XG4gICAgdmFyIHNpemVDbGFzc2VzICA9IHRoaXMuc2l6ZUNsYXNzZXNbIHRoaXMuX3JhbmRvbU51bWJlcigwLCB0aGlzLnNpemVDbGFzc2VzLmxlbmd0aCAtIDEpIF07XG4gICAgdmFyIHJpZ2h0UG9zICAgPSB0aGlzLl9yYW5kb21OdW1iZXIoMTAwLCAtMTAwKTtcbiAgICB2YXIgb3BhY2l0eSAgICA9IHRoaXMuX3JhbmRvbU51bWJlcig1MCwgOTApIC8gMTAwO1xuXG4gICAgVHdlZW5MaXRlLnNldCggJGJ1YmJsZSwgeyB5OiB3aW5kb3cuaW5uZXJIZWlnaHQgfSlcblxuICAgICRidWJibGUuYWRkQ2xhc3Moc2l6ZUNsYXNzZXMpXG4gICAgICAgICAgICAgIC5wcmVwZW5kVG8odGhpcy4kY29udGFpbmVyKVxuICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAncmlnaHQnICAgOiByaWdodFBvcyArICclJyxcbiAgICAgICAgICAgICAgICAnb3BhY2l0eScgOiBvcGFjaXR5XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgc2V0VGltZW91dCgkLnByb3h5KHRoaXMuY3JlYXRlQnViYmxlLCB0aGlzKSwgdGhpcy5fcmFuZG9tTnVtYmVyKDEwMCwgMzAwKSk7XG4gICAgdGhpcy5hbmltYXRlRmxha2UoJGJ1YmJsZSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFuaW1hdGVzIGVsZW1lbnRcbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkYnViYmxlXG4gICAqL1xuICBhbmltYXRlRmxha2U6IGZ1bmN0aW9uICgkYnViYmxlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgdmFyIGR1cmF0aW9uID0gdGhpcy5fcmFuZG9tTnVtYmVyKDEwLCAyMCk7XG4gICAgdmFyIHJpZ2h0ID0gdGhpcy5fcmFuZG9tTnVtYmVyKHRoaXMud2luV2lkdGggLyAzLCB0aGlzLndpbldpZHRoKSAvKiBnbyBsZWZ0ICovICogLSAxO1xuXG4gICAgLy9tYWtlIGl0IGZhbGxcbiAgICBUd2VlbkxpdGUudG8oJGJ1YmJsZSwgZHVyYXRpb24sIHtcbiAgICAgICd5JyAgICAgICAgOiAtdGhpcy53aW5IZWlnaHQgKiAxLjEsXG4gICAgICAnZWFzZScgICAgIDogJ0xpbmVhci5lYXNlTm9uZScsXG4gICAgICBvbkNvbXBsZXRlIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAkYnViYmxlLnJlbW92ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG5cbiAgYmVhdDogZnVuY3Rpb24oKSB7fSxcblxuICAvKipcbiAgICogR2VuZXJhdGVzIHJhbmRvbSBudW1iZXJcbiAgICogQHBhcmFtICB7TnVtYmVyfSBmcm9tXG4gICAqIEBwYXJhbSAge051bWJlcn0gdG9cbiAgICogQHJldHVybiB7TnVtYmVyfSByYW5kb20gdmFsdWVcbiAgICovXG4gIF9yYW5kb21OdW1iZXI6IGZ1bmN0aW9uIChmcm9tLCB0bykge1xuICAgIHJldHVybiBNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogKHRvLWZyb20rMSkgKyBmcm9tKTtcbiAgfSxcblxuICAvKipcbiAgICogUmVzaXplIGV2ZW50IGhhbmxkZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IG9iamVjdFxuICAgKi9cbiAgX29uV2luZG93UmVzaXplOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLndpbldpZHRoICAgPSB0aGlzLiR3aW5kb3cud2lkdGgoKTtcbiAgICB0aGlzLndpbkhlaWdodCAgPSB0aGlzLiR3aW5kb3cuaGVpZ2h0KCk7XG4gIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdWJibGVzO1xuIiwiIyMjKlxuICogQmFja2dyb3VuZCB2aXN1YWxpemF0aW9uIHZpZXdcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDQuMTMuMTRcbiMjI1xuXG5WaWV3ICAgICA9IHJlcXVpcmUgJy4uLy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvYnViYmxlcy10ZW1wbGF0ZS5oYnMnXG5cbmNsYXNzIEJ1YmJsZXNWaWV3IGV4dGVuZHMgVmlld1xuXG4gIGNsYXNzTmFtZTogJ2NvbnRhaW5lci1idWJibGVzJ1xuICB0ZW1wbGF0ZTogdGVtcGxhdGVcblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEBzdGFydEJ1YmJsZXMoKVxuICAgIEBcblxuICBzdGFydEJ1YmJsZXM6IC0+XG5cblxubW9kdWxlLmV4cG9ydHMgPSBCdWJibGVzVmlld1xuIiwiIyMjKlxuICogQmFja2dyb3VuZCB2aXN1YWxpemF0aW9uIHZpZXdcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDMuMjcuMTRcbiMjI1xuXG5QdWJTdWIgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL1B1YlN1YidcblB1YkV2ZW50ID0gcmVxdWlyZSAnLi4vLi4vZXZlbnRzL1B1YkV2ZW50LmNvZmZlZSdcblZpZXcgICAgID0gcmVxdWlyZSAnLi4vLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgPSByZXF1aXJlICcuL3RlbXBsYXRlcy92aXN1YWxpemVyLXRlbXBsYXRlLmhicydcblxuY2xhc3MgVmlzdWFsaXplclZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgQk9UVExFX05VTTogNlxuXG4gICMgVGhlIGNsYXNzbmFtZSBmb3IgdGhlIGNvbnRhaW5lclxuICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgY2xhc3NOYW1lOiAnY29udGFpbmVyLXZpc3VhbGl6ZXInXG5cbiAgIyBIVE1MIFRlbXBsYXRlXG4gICMgQHR5cGUge0Z1bmN0aW9ufVxuXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuXG5cbiAgIyBSZW5kZXJzIHRoZSB2aWV3IGFuZCBidWlsZHMgb3V0IHRoZSBib3R0bGVzXG4gICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICByZW5kZXI6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyIG9wdGlvbnNcblxuICAgIEAkYm90dGxlc0NvbnRhaW5lciA9IEAkZWwuZmluZCAnLmNvbnRhaW5lci1ib3R0bGVzJ1xuXG4gICAgQHNob3coKVxuICAgIEBcblxuXG4gICMgQWRkIGxpc3RlbmVyc1xuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBAb25SZXNpemUsIGZhbHNlKTtcbiAgICBQdWJTdWIub24gUHViRXZlbnQuQkVBVCwgQG9uQmVhdFxuXG5cbiAgIyBSZW1vdmUgbGlzdGVuZXJzXG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgUHViU3ViLm9mZiBQdWJFdmVudC5CRUFULCBAb25CZWF0XG4gICAgc3VwZXIoKVxuXG5cbiAgIyBTaG93IHRoZSB2aWV3IGFuZCBidWlsZCBvdXQgdGhlIGJvdHRsZXNcblxuICBzaG93OiA9PlxuICAgIEBidWlsZEJvdHRsZXMoKVxuXG4gICAgVHdlZW5MaXRlLnRvIEAkZWwuZmluZCgnLndyYXBwZXInKSwgLjMsXG4gICAgICBhdXRvQWxwaGE6IDFcbiAgICAgIGRlbGF5OiAxXG5cblxuICAjIEhpZGUgdGhlIHZpZXdcblxuICBoaWRlOiAtPlxuICAgIFR3ZWVuTGl0ZS50byBAJGVsLmZpbmQoJy53cmFwcGVyJyksIC4zLFxuICAgICAgYXV0b0FscGhhOiAwXG4gICAgICBkZWxheTogMFxuXG5cbiAgIyBTY2FsZSB1cCB0aGUgdmlldy4gIENhbGxlZCB3aGVuIHRoZSB1c2VyIGNsaWNrc1xuICAjIHNoYXJlIHdoZW4gb24gRGVza3RvcFxuXG4gIHNjYWxlVXA6IC0+XG4gICAgQHByZXZYID0gR3JlZW5Qcm9wLnggQCRib3R0bGVzQ29udGFpbmVyXG4gICAgQHByZXZZID0gR3JlZW5Qcm9wLnkgQCRib3R0bGVzQ29udGFpbmVyXG5cbiAgICBUd2VlbkxpdGUudG8gQCRib3R0bGVzQ29udGFpbmVyLCAuOCxcbiAgICAgIHNjYWxlOiAxLjNcbiAgICAgIHg6IChAY29udGFpbmVyV2lkdGggKiAuMjYpXG4gICAgICB5OiBAcHJldlkgKyA2NVxuICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG5cblxuICAjIFNjYWxlIGRvd24gdGhlIHZpZXcgY2xvc2Ugc2hhcmVcblxuICBzY2FsZURvd246IC0+XG4gICAgVHdlZW5MaXRlLnRvIEAkYm90dGxlc0NvbnRhaW5lciwgLjgsXG4gICAgICBzY2FsZVg6IDFcbiAgICAgIHNjYWxlWTogMVxuICAgICAgeDogQHByZXZYXG4gICAgICB5OiBAcHJldllcbiAgICAgIGVhc2U6IEV4cG8uZWFzZUluT3V0XG5cblxuICAjIFNldHMgdGhlIHBvc2l0aW9uICB3aGVuIHRoZSBzaGFyZSB2aWV3IGFwcGVhcnNcblxuICBzZXRTaGFyZVZpZXdQb3NpdGlvbjogLT5cbiAgICBAaXNTaGFyZVZpZXcgPSB0cnVlXG4gICAgQG9uUmVzaXplKClcblxuXG4gICMgUmVzZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgYm90dGxlc1xuXG4gIHJlc2V0UG9zaXRpb246IC0+XG4gICAgQGlzU2hhcmVWaWV3ID0gZmFsc2VcbiAgICBAb25SZXNpemUoKVxuXG5cbiAgIyBDb25zdHJ1Y3QgdGhlIGJvdHRsZXMgYW5kIHNldCB1cCBwb3NpdGlvbmluZyBhbmQgd2lkdGhcblxuICBidWlsZEJvdHRsZXM6ID0+XG4gICAgQGJvdHRsZXMgPSBbXVxuICAgIEB3aWR0aHMgPSBbXVxuXG4gICAgXyhAQk9UVExFX05VTSkudGltZXMgKGluZGV4KSA9PlxuICAgICAgJGJvdHRsZSA9IEAkZWwuZmluZCBcIiNib3R0bGUtI3tpbmRleCsxfVwiXG5cbiAgICAgIFR3ZWVuTGl0ZS5zZXQgJGJvdHRsZSxcbiAgICAgICAgdHJhbnNmb3JtT3JpZ2luOiAnY2VudGVyIG1pZGRsZSdcbiAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgeDogfn4oaW5kZXggKiAoKHdpbmRvdy5pbm5lcldpZHRoICogLjgpIC8gQEJPVFRMRV9OVU0pKVxuICAgICAgICB5OiAxMDAwXG5cbiAgICAgIFR3ZWVuTGl0ZS5zZXQgJGJvdHRsZS5maW5kKCcuYm90dGxlLWJnJyksIHNjYWxlWTogMFxuICAgICAgQGJvdHRsZXMucHVzaCAkYm90dGxlXG5cbiAgICBkZWxheSA9IC41XG5cbiAgICBmb3IgJGJvdHRsZSBpbiBAYm90dGxlc1xuICAgICAgVHdlZW5MaXRlLnRvICRib3R0bGUsIC43LFxuICAgICAgICB5OiAtMTBcbiAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG4gICAgICAgIGRlbGF5OiBkZWxheVxuXG4gICAgICBkZWxheSArPSAuMVxuXG5cbiAgIyBFdmVudCBoYW5kbGVyc1xuICAjIC0tLS0tLS0tLS0tLS0tXG5cbiAgIyBIYW5kbGVyIGZvciByZXNpemUgZXZlbnRzLiAgUmVwb3NpdGlvbnMgYm90dGxlcyBhY3Jvc3Mgd2lkdGggYW5kXG4gICMgY2VudGVycyBjb250YWluZXJcblxuICBvblJlc2l6ZTogPT5cbiAgICBsZW4gPSBAYm90dGxlcy5sZW5ndGhcbiAgICBAd2lkdGhzID0gW11cblxuICAgIF8uZWFjaCBAYm90dGxlcywgKCRib3R0bGUsIGluZGV4KSA9PlxuICAgICAgeFBvcyA9IH5+KGluZGV4ICogKCh3aW5kb3cuaW5uZXJXaWR0aCAqIC44IC8gQEJPVFRMRV9OVU0pICkpXG5cbiAgICAgIFR3ZWVuTGl0ZS5zZXQgJGJvdHRsZSxcbiAgICAgICAgdHJhbnNmb3JtT3JpZ2luOiAnY2VudGVyJ1xuICAgICAgICB4OiB4UG9zXG4gICAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuXG4gICAgICBAd2lkdGhzLnB1c2ggKEdyZWVuUHJvcC54KCRib3R0bGUpICsgJGJvdHRsZS53aWR0aCgpKVxuXG4gICAgQGNvbnRhaW5lcldpZHRoID0gQHdpZHRoc1tAd2lkdGhzLmxlbmd0aCAtIDFdXG4gICAgQGNvbnRhaW5lckhlaWdodCA9IH5+QCRib3R0bGVzQ29udGFpbmVyLmhlaWdodCgpXG5cbiAgICB5T2Zmc2V0ID0gaWYgQGlzU2hhcmVWaWV3IHRoZW4gMCBlbHNlIDEwMFxuXG4gICAgeFBvcyA9ICh3aW5kb3cuaW5uZXJXaWR0aCAqIC41KSAtIChAY29udGFpbmVyV2lkdGggKiAuNSlcbiAgICB5UG9zID0gKHdpbmRvdy5pbm5lckhlaWdodCAqIC41KSAtIChAY29udGFpbmVySGVpZ2h0ICogLjUpIC0geU9mZnNldFxuXG4gICAgVHdlZW5MaXRlLnRvIEAkYm90dGxlc0NvbnRhaW5lciwgLjYsXG4gICAgICB4OiB+fnhQb3NcbiAgICAgIHk6IH5+eVBvc1xuICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG5cblxuICAjIEhhbmRsZXIgZm9yIFwiQmVhdFwiIGV2ZW50cywgZGlzcGF0Y2hlZCBmcm9tIHRoZSBQYXR0ZXJuU3F1YXJlVmlld1xuICAjIEBwYXJhbSB7T2JqZWN0fSBwYXJhbVxuXG4gIG9uQmVhdDogKHBhcmFtcykgPT5cbiAgICB7cGF0dGVyblNxdWFyZU1vZGVsfSA9IHBhcmFtc1xuXG4gICAgcHJvcHMgPSBwYXR0ZXJuU3F1YXJlTW9kZWwgfHwge31cblxuICAgICMgQ2hlY2sgaWYgdGhlXG4gICAgaWYgXy5pc0VtcHR5IHByb3BzXG4gICAgICBwcm9wcyA9XG4gICAgICAgIHZlbG9jaXR5OiB+fihNYXRoLnJhbmRvbSgpICogNClcbiAgICAgICAgb3JkZXJJbmRleDogfn4oTWF0aC5yYW5kb20oKSAqIDYpXG5cbiAgICBzY2FsZSA9IHN3aXRjaCBwcm9wcy52ZWxvY2l0eVxuICAgICAgd2hlbiAxIHRoZW4gLjMzICsgTWF0aC5yYW5kb20oKSAqIC4yMFxuICAgICAgd2hlbiAyIHRoZW4gLjY2ICsgTWF0aC5yYW5kb20oKSAqIC4yMFxuICAgICAgd2hlbiAzIHRoZW4gLjk1XG5cbiAgICBpZiBzY2FsZSBpcyB1bmRlZmluZWQgdGhlbiBzY2FsZSA9IDFcblxuICAgIHR3ZWVuVGltZSA9IC4yXG4gICAgYm90dGxlID0gQGJvdHRsZXNbcHJvcHMub3JkZXJJbmRleF0uZmluZCgnLmJvdHRsZS1iZycpXG5cbiAgICBUd2VlbkxpdGUudG8gYm90dGxlLCAuMSxcbiAgICAgIHRyYW5zZm9ybU9yaWdpbjogJ2NlbnRlciBib3R0b20nXG4gICAgICBzY2FsZVk6IHNjYWxlXG4gICAgICBlYXNlOiBMaW5lYXIuZWFzZU5vbmVcblxuICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgVHdlZW5MaXRlLnRvIGJvdHRsZSwgMSxcbiAgICAgICAgICBzY2FsZVk6IDBcbiAgICAgICAgICBlYXNlOiBRdWFydC5lYXNlT3V0XG5cbm1vZHVsZS5leHBvcnRzID0gVmlzdWFsaXplclZpZXdcbiIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiO1xuXG5cbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiaGFuZGxlaWZ5XCIpLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBzdGFjazIsIG9wdGlvbnMsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBzZWxmPXRoaXMsIGhlbHBlck1pc3Npbmc9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMTtcbiAgYnVmZmVyICs9IFwiXFxuXFxuXHRcdFx0PGRpdiBjbGFzcz0ndmlzLWJvdHRsZScgaWQ9J2JvdHRsZS1cIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9ICgoc3RhY2sxID0gZGF0YSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5pbmRleCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9J2JvdHRsZS1iZy13aGl0ZScgLz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9J2JvdHRsZS1iZycgLz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9J2JvdHRsZS1tYXNrJyAvPlxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9J3dyYXBwZXInPlxcblx0PGRpdiBjbGFzcz0nY29udGFpbmVyLWJvdHRsZXMnPlxcblxcblx0XHRcIjtcbiAgb3B0aW9ucyA9IHtoYXNoOnt9LGludmVyc2U6c2VsZi5ub29wLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfTtcbiAgc3RhY2syID0gKChzdGFjazEgPSBoZWxwZXJzLnJlcGVhdCB8fCBkZXB0aDAucmVwZWF0KSxzdGFjazEgPyBzdGFjazEuY2FsbChkZXB0aDAsIDYsIG9wdGlvbnMpIDogaGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCwgXCJyZXBlYXRcIiwgNiwgb3B0aW9ucykpO1xuICBpZihzdGFjazIgfHwgc3RhY2syID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazI7IH1cbiAgYnVmZmVyICs9IFwiXFxuXFxuXHQ8L2Rpdj5cXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiXX0=

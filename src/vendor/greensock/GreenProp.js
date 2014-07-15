(function (window){

	GreenProp.rotationX = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0]; return t._gsTransform.rotationX;};
	GreenProp.rotationY = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0];return t._gsTransform.rotationY;};
	GreenProp.rotationZ = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0];return t._gsTransform.rotation;};
	GreenProp.rotation = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0];return t._gsTransform.rotation;};

	GreenProp.scaleX = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0];return t._gsTransform.scaleX};
	GreenProp.scaleY = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0];return t._gsTransform.scaleY};
	GreenProp.scaleZ = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0];return t._gsTransform.scaleZ};

	GreenProp.x = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0];return t._gsTransform.x};
	GreenProp.y = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0];return t._gsTransform.y};
	GreenProp.z = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0];return t._gsTransform.z};
	GreenProp.perspective = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0];return t._gsTransform.perspective};

	GreenProp.skewX = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0];return t._gsTransform.skewX};
	GreenProp.skewY = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0];return t._gsTransform.skewY};

	GreenProp.zOrigin = function (obj){var t = (obj[0] === undefined ) ? obj : obj[0];return t._gsTransform.zOrigin};

	function GreenProp (){

		throw new Error ("Greenprop is a static helper class and does not need to be an instance");
	}

	window.GreenProp = GreenProp;	

})(window);
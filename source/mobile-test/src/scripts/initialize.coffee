
require './helpers/handlebars-helpers'
attachFastClick = require('fastclick');
Touch = require './utils/Touch'

MobileTest = require './views/mobile-test/MobileTest.coffee'

$ ->
   Touch.translateTouchEvents()
   attachFastClick document.body
   new MobileTest()
###*
 * MPC Application bootstrapper
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###


Touch         = require './utils/Touch'
AppController = require './AppController.coffee'
helpers       = require './helpers/handlebars-helpers'

$ ->

   Touch.translateTouchEvents()

   appController = new AppController()
   appController.render()

###*
 * MPC Application bootstrapper
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

Touch         = require './utils/Touch'
AppController = require './AppController.coffee'

$ ->

   Touch.translateTouchEvents()

   appController = new AppController()
   appController.render()

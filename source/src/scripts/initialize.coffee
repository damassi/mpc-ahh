###*
 * MPC Application bootstrapper
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###


Touch         = require './utils/Touch'
AppConfig     = require './config/AppConfig.coffee'
KitCollection = require './models/kits/KitCollection.coffee'
AppController = require './AppController.coffee'
helpers       = require './helpers/handlebars-helpers'

$ ->

   Touch.translateTouchEvents()

   kitCollection = new KitCollection
      parse: true

   kitCollection.fetch
      async: false
      url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'

   appController = new AppController
      kitCollection: kitCollection

   appController.render()

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

   # @kitCollection = new KitCollection
   #    parse: true

   # @kitCollection.fetch
   #    async: false


   # console.log @kitCollection.toJSON()
      #url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'

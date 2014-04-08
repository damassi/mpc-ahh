###*
 * MPC Application bootstrapper
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###


attachFastClick  = require('fastclick');
Touch            = require './utils/Touch'
AppConfig        = require './config/AppConfig.coffee'
KitCollection    = require './models/kits/KitCollection.coffee'
AppModel         = require './models/AppModel.coffee'
AppController    = require './AppController.coffee'
rotationTemplate = require './views/templates/rotation-template.hbs'
helpers          = require './helpers/handlebars-helpers'

$ ->

   Touch.translateTouchEvents()
   attachFastClick document.body
   Parse.initialize( "oZgOktrcDXEetGBjCGI6qqRLNbJ7j8GTDMmPyrxb", "U6b0hDT2Isb5blCVd0WU41NJ0EOFgY0Fx7orql4Q" )
   ZeroClipboard.config({ moviePath: 'assets/swf/ZeroClipboard.swf' })

   # Prevent scrolling on ios devices
   $(document).on 'touchmove', (event) ->
      event.preventDefault()

   kitCollection = new KitCollection
      parse: true

   kitCollection.fetch
      async: false
      url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'

   appModel = new AppModel
      'kitModel': kitCollection.at(0)

   $body = $('body')

   # Check current mobile status
   if $(window).innerWidth() < AppConfig.BREAKPOINTS.desktop.min
      appModel.set 'isMobile', true
      $body.addClass 'mobile'
      $body.append rotationTemplate()
   else
      $body.addClass 'desktop'

   if window.innerHeight > window.innerWidth
      $('.device-orientation').show()


   # Kick off app
   appController = new AppController
      appModel: appModel
      kitCollection: kitCollection

   appController.render()

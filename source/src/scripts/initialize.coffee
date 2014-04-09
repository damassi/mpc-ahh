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

   # Initialize app-side utilities
   Touch.translateTouchEvents()
   attachFastClick document.body
   Parse.initialize( "oZgOktrcDXEetGBjCGI6qqRLNbJ7j8GTDMmPyrxb", "U6b0hDT2Isb5blCVd0WU41NJ0EOFgY0Fx7orql4Q" )
   ZeroClipboard.config({ moviePath: 'assets/swf/ZeroClipboard.swf' })

   # Prevent scrolling on ios devices
   $(document).on 'touchmove', (event) ->
      event.preventDefault()


   # Build out the kit-collection, which is the basis for all other models
   kitCollection = new KitCollection
      parse: true

   kitCollection.fetch
      async: false
      url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'


   # Create the primary application model which handles state
   appModel = new AppModel
      'kitModel': kitCollection.at(0)


   # Begin setting up viewport-related components
   $body = $('body')

   # Check current mobile status
   if $(window).innerWidth() < AppConfig.BREAKPOINTS.desktop.min
      appModel.set 'isMobile', true
      $body.addClass 'mobile'
      $body.append rotationTemplate()
   else
      $body.addClass 'desktop'

   # if window.innerHeight > window.innerWidth
   #    $('.device-orientation').show()


   # Create mock preloader for any image assets
   _.each ['velocity-soft', 'velocity-medium', 'velocity-hard'], (className) ->
      $('<div />', { class: "preload #{className}"}).appendTo 'body'


   # Handler for audio load events, which is required for mobile (iOS) audio playback
   onLoad = ->
      createjs.Sound.removeEventListener 'fileload', onLoad

      # Fix viewport if on Tablet
      TweenMax.to $('body'), 0,
         scrollTop:  0
         scrollLeft: 0

      $('body').find('.preload').remove()

      # Kick off app
      appController = new AppController
         appModel: appModel
         kitCollection: kitCollection

      appController.render()

   # To initialize mobile playback, a sound must be loaded and triggered by user interaction
   createjs.Sound.addEventListener 'fileload', onLoad
   sndPath = 'assets/audio/hip-hop/HipHopKit_KickHard.mp3'
   createjs.Sound.registerSound sndPath, sndPath

###*
 * MPC Application bootstrapper
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

AppConfig        = require './config/AppConfig.coffee'
AppController    = require './AppController.coffee'
AppModel         = require './models/AppModel.coffee'
BrowserDetect    = require './utils/BrowserDetect'
KitCollection    = require './models/kits/KitCollection.coffee'
Touch            = require './utils/Touch'
attachFastClick  = require('fastclick');
helpers          = require './helpers/handlebars-helpers'
rotationTemplate = require './views/templates/rotation-template.hbs'

$ ->

  preloadManifest = [
    { id: 'velocity-soft', src: 'assets/images/icon-beat-soft.svg' },
    { id: 'velocity-medium', src: 'assets/images/icon-beat-medium.svg'},
    { id: 'velocity-hard', src: 'assets/images/icon-beat-hard.svg'},
    { id: 'bottle-mask', src: 'assets/images/bottle-mask.png'},
    { id: 'velocity-soft', src: 'assets/audio/coke/05___female_ahhh_01.mp3'}
  ]

  onPreloadComplete = =>
    Parse.initialize( "foo", "bar" )
    Touch.translateTouchEvents()
    ZeroClipboard.config({ moviePath: 'assets/swf/ZeroClipboard.swf' })

    attachFastClick document.body

    # Prevent scrolling on ios devices
    $(document).on 'touchmove', (event) -> event.preventDefault()
    $body = $('body')

    # Build out the kit-collection, which is the basis for all other models
    kitCollection = new KitCollection
      parse: true

    kitCollection.fetch
      async: false
      url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'

    # Create the primary application model which handles state
    appModel = new AppModel
      'kitModel': kitCollection.at(0)

    # Check current mobile status
    if $(window).innerWidth() < AppConfig.BREAKPOINTS.desktop.min
      appModel.set 'isMobile', true
      $body.addClass 'mobile'
    else
      $body.addClass 'desktop'

    $body.append rotationTemplate()

    # Tell user to rotate
    if AppConfig.ENABLE_ROTATION_LOCK
      if window.innerHeight > window.innerWidth
        $('.device-orientation').show()


    # To initialize mobile playback, a sound must be loaded
    # and triggered by user interaction.
    #
    # NOTE:  Sound manifest is registered in the KitModel
    # during data parse.

    sndPath = preloadManifest[preloadManifest.length-1].src
    createjs.Sound.registerSound sndPath, sndPath
    createjs.Sound.alternateExtensions = ['mp3']
    createjs.FlashPlugin.swfPath = '/assets/swf/'
    createjs.HTMLAudioPlugin.defaultNumChannels = 30

    if BrowserDetect.isIE()
      createjs.Sound.registerPlugins([createjs.FlashPlugin])
    else
      createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin])

    # Fix viewport if on Tablet
    TweenLite.to $('body'), 0,
      scrollTop: 0
      scrollLeft: 0

    # Kick off app
    appController = new AppController
      appModel: appModel
      kitCollection: kitCollection

    appController.render()

    # Redirect if device is not supported
    if appModel.get 'isMobile'
      if BrowserDetect.unsupportedAndroidDevice()
        window.location.hash = '#not-supported'

      device = BrowserDetect.deviceDetection()


  # Preload assets
  queue = new createjs.LoadQueue()
  queue.installPlugin( createjs.Sound )
  queue.on 'complete', onPreloadComplete
  queue.loadManifest preloadManifest

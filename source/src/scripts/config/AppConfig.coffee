###*
  Application-wide general  configurations

  @author Christopher Pappas <chris@wintr.us>
  @date   3.19.14
###


AppConfig =


   # The path to application assets
   # @type {Number}

   ASSETS:
      path:   'assets'
      audio:  'audio'
      data:   'data'
      images: 'images'


   # The BPM tempo
   # @type {Number}

   BPM: 120


   # The max BPM
   # @type {Number}

   BPM_MAX: 1000


   # Breakpoint definition for enquire
   # and BreakpointManager class

   BREAKPOINTS:
      mobile:
         min: null
         max: 600

      desktop:
         min: 601
         max: null


   # The max varient on each pattern square (off, low, medium, high)
   # @type {Number}

   VELOCITY_MAX: 3


   # Volume levels for pattern playback as well as for overall tracks
   # @type {Object}

   VOLUME_LEVELS:
      low:    .2
      medium: .5
      high:    1


   # Returns a normalized asset path for application assets
   # @param {String} assetType

   returnAssetPath: (assetType) ->
      path = @ASSETS.path + '/' + @ASSETS[assetType]
      path


   # Returns a normalized asset path for the TEST environment
   # @param {String} assetType

   returnTestAssetPath: (assetType) ->
      path = window.location.pathname + @ASSETS.path + '/' + @ASSETS[assetType]
      path



module.exports = AppConfig


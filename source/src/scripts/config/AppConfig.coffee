###*
  Application-wide general configurations

  @author Christopher Pappas <chris@wintr.us>
  @date   3.19.14
###


AppConfig =


   # The path to application assets
   # @type {Number}

   ASSETS:
      path:   '/assets'
      audio:  'audio'
      data:   'data'
      images: 'images'


   # The BPM tempo
   # @type {Number}

   BPM: 120


   # The max BPM
   # @type {Number}

   BPM_MAX: 300


   # The max varient on each pattern square (off, low, medium, high)
   # @type {Number}

   VELOCITY_MAX: 3


   # Returns a normalized asset path for application assets
   # @param {String} assetType

   returnAssetPath: (assetType) ->
      @ASSETS.path + '/' + @ASSETS[assetType]


   # Returns a normalized asset path for the TEST environment
   # @param {String} assetType

   returnTestAssetPath: (assetType) ->
      '/test/html/' + @ASSETS.path + '/' + @ASSETS[assetType]



module.exports = AppConfig


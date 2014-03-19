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


   # Returns a normalized asset path for application assets
   # @param {String} assetType

   returnAssetPath: (assetType) ->
      @ASSETS.path + '/' + @ASSETS[assetType]



module.exports = AppConfig


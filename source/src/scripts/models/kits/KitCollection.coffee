###*
 * Collection of sound kits
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

AppConfig = require '../../config/AppConfig.coffee'
KitModel  = require './KitModel.coffee'


class KitCollection extends Backbone.Collection


   # Url to data for fetch
   # @type {String}

   url: "#{AppConfig.returnAssetPath('data')}/sound-data.json"


   # Individual drumkit audio sets
   # @type {KitModel}

   model: KitModel


   # The current user-selected kit
   # @type {Number}

   kitId: 0



   parse: (response) ->
      assetPath = response.config.assetPath
      kits = response.kits

      kits = _.map kits, (kit) ->
         kit.path = assetPath + '/' + kit.folder
         return kit

      return kits




   # Cycles the current drum kit back
   # @return {KitModel}

   previousKit: ->
      len = @length

      if @kitId > 0
         @kitId--

      else
         @kitId = len - 1

      kitModel = @at @kitId




   # Cycles the current drum kit forward
   # @return {KitModel}

   nextKit: ->
      len = @length - 1

      if @kitId < len
         @kitId++

      else
         @kitId = 0

      kitModel = @at @kitId



module.exports = KitCollection
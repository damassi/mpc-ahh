###*
  A collection of pattern tracks

  @author Christopher Pappas <chris@wintr.us>
  @date   3.20.14
###

AppConfig          = require '../../config/AppConfig.coffee'
PatternTrackModel  = require './PatternTrackModel.coffee'


class PatternTrackCollection extends Backbone.Collection

   model: PatternTrackModel


module.exports = PatternTrackCollection
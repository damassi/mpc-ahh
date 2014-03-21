###*
  A collection of individual pattern squares

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###

AppConfig          = require '../../config/AppConfig.coffee'
PatternSquareModel = require './PatternSquareModel.coffee'
InstrumentModel = require '../sequencer/InstrumentModel.coffee'


class PatternSquareCollection extends Backbone.Collection

   model: InstrumentModel


module.exports = PatternSquareCollection
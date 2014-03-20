###*
  Model for pattern tracks, which corresponde to the current instrument

  @author Christopher Pappas <chris@wintr.us>
  @date   3.20.14
###

class PatternTrackModel extends Backbone.Model

   defaults:
      'volume':     null
      'active':     null
      'mute':       null

      # @type {PatternSquareCollection}
      'patternSquares':    null


module.exports = PatternTrackModel
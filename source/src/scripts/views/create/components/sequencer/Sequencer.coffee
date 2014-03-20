###*
 * Sequencer parent view for track sequences
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

PatternTrack = require './PatternTrack.coffee'
View         = require '../../../../supers/View.coffee'
template     = require './templates/sequencer-template.hbs'


class Sequencer extends View

   className: 'sequencer-container'
   template: template
   patternTrackViews: null


   render: (options) ->
      super options

      @$sequencer = @$el.find '.sequencer'

      @renderTracks()

      @



   renderTracks: =>
      @patternTrackViews = []

      @patternTrackCollection.each (model) =>

         patternTrack = new PatternTrack
            collection: model.get 'patternSquares'
            model: model

         @patternTrackViews.push patternTrack
         @$sequencer.append patternTrack.render().el







module.exports = Sequencer
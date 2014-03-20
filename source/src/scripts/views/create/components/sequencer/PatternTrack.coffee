###*
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

PatternSquare  = require './PatternSquare.coffee'
View           = require '../../../../supers/View.coffee'
template       = require './templates/pattern-track-template.hbs'


class PatternTrack extends View

   className: 'pattern-track'
   tagName: 'tr'
   template: template

   patternSquareViews: null


   render: (options) ->
      super options

      @renderPatternSquares()

      @


   renderPatternSquares: ->
      @patternSquareViews = []

      @collection.each (model) =>
         patternSquare = new PatternSquare
            model: model

         console.log @$el
         @$el.append patternSquare.render().el

         @patternSquareViews.push patternSquare






module.exports = PatternTrack
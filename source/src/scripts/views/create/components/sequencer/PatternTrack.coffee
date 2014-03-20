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



   addEventListeners: ->
      @listenTo @model, 'change:mute', @onMuteChange




   renderPatternSquares: ->
      @patternSquareViews = []

      @collection.each (model) =>
         patternSquare = new PatternSquare
            model: model

         #console.log @$el
         @$el.append patternSquare.render().el

         @patternSquareViews.push patternSquare


   mute: ->
      @model.set 'mute', true



   unmute: ->
      @model.set 'mute', false



   onMuteChange: (model) ->
      mute = model.changed.mute

      if mute
         @$el.addClass 'mute'

      else
         @$el.removeClass 'mute'










module.exports = PatternTrack
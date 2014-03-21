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


   # The name of the class
   # @type {String}

   className: 'pattern-track'


   # The type of tag
   # @type {String}

   tagName: 'tr'


   # The template
   # @type {Function}

   template: template


   # A collection of individual view squares
   # @type {Array}

   patternSquareViews: null


   # @type {PatternSquareCollection}
   patternSquareCollection: null


   # @type {PatternTrackModel}
   patternTrackModel: null




   events:
      'touchend .btn-mute': 'onMuteBtnClick'




   # Renders the view and renders out individual pattern squares
   # @param {Object} options

   render: (options) ->
      super options

      @$label = @$el.find '.label-instrument'

      @renderPatternSquares()

      @




   # Add listeners to the view which listen for view changes
   # as well as changes to the collection, which should update
   # pattern squares without re-rendering the views

   addEventListeners: ->
      @listenTo @patternTrackModel, 'change:mute', @onMuteChange




   # Render out the pattern squares and push them into an array
   # for further iteration

   renderPatternSquares: ->
      @patternSquareViews = []

      @patternSquareCollection.each (model) =>
         patternSquare = new PatternSquare
            patternSquareModel: model

         #console.log model.toJSON()
         @$label.text model.get 'label'
         @$el.append patternSquare.render().el
         @patternSquareViews.push patternSquare



   # Mute the entire track

   mute: ->
      @patternTrackModel.set 'mute', true



   # Unmute the entire track

   unmute: ->
      @patternTrackModel.set 'mute', false




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for mute model change events
   # @param {PatternTrackModel} model

   onMuteChange: (model) ->
      mute = model.changed.mute

      if mute
         @$el.addClass 'mute'

      else @$el.removeClass 'mute'




   # Handler for mute button clicks
   # @param {PatternTrackModel} model

   onMuteBtnClick: (event) =>
      if @patternTrackModel.get 'mute'
         @unmute()

      else @mute()











module.exports = PatternTrack
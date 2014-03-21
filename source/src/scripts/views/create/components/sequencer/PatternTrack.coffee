###*
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

AppEvent                = require '../../../../events/AppEvent.coffee'
PatternSquareCollection = require '../../../../models/sequencer/PatternSquareCollection.coffee'
PatternSquareModel      = require '../../../../models/sequencer/PatternSquareModel.coffee'
PatternSquare           = require './PatternSquare.coffee'
View                    = require '../../../../supers/View.coffee'
template                = require './templates/pattern-track-template.hbs'


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
   collection: null


   # @type {InstrumentModel}
   model: null



   events:
      'touchend .label-instrument': 'onLabelClick'
      'touchend .btn-mute':         'onMuteBtnClick'




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
      @kitModel = @appModel.get('kitModel')

      @listenTo @model,    AppEvent.CHANGE_FOCUS,      @onFocusChange
      @listenTo @model,    AppEvent.CHANGE_MUTE,       @onMuteChange
      @listenTo @kitModel, AppEvent.CHANGE_INSTRUMENT, @onInstrumentChange




   # Render out the pattern squares and push them into an array
   # for further iteration

   renderPatternSquares: ->
      @patternSquareViews = []

      @collection = new PatternSquareCollection

      _(8).times =>
         @collection.add new PatternSquareModel { instrument: @model }

      @collection.each (model) =>
         patternSquare = new PatternSquare
            patternSquareModel: model

         @$label.text model.get 'label'
         @$el.append patternSquare.render().el
         @patternSquareViews.push patternSquare

      # Set the squares on the Instrument model to track against state
      @model.set 'patternSquares', @collection



   # Mute the entire track

   mute: ->
      @model.set 'mute', true



   # Unmute the entire track

   unmute: ->
      @model.set 'mute', false



   select: ->
      @$el.addClass 'selected'



   deselect: ->
      if @$el.hasClass 'selected'
         @$el.removeClass 'selected'



   focus: ->
      @$el.addClass 'focus'




   unfocus: ->
      if @$el.hasClass 'focus'
         @$el.removeClass 'focus'




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for changes to the currently selected instrument
   # @param {InstrumentModel} instrumentModel

   onInstrumentChange: (instrumentModel) =>
      instrument = instrumentModel.changed.currentInstrument

      if instrument.cid is @model.cid
         @select()

      else @deselect()




   # Handler for mute model change events
   # @param {InstrumentModel} model

   onMuteChange: (model) ->
      mute = model.changed.mute

      if mute
         @$el.addClass 'mute'

      else @$el.removeClass 'mute'



   # Handler for focus change events
   # @param {InstrumentModel} model

   onFocusChange: (model) ->
      if model.changed.focus
          @focus()
      else
          @unfocus()



   # Handler for mute button clicks
   # @param {InstrumentModel} model

   onLabelClick: (event) =>
      @model.set 'focus', ! @model.get('focus')





   # Handler for mute button clicks
   # @param {InstrumentModel} model

   onMuteBtnClick: (event) =>
      if @model.get 'mute'
         @unmute()

      else @mute()











module.exports = PatternTrack
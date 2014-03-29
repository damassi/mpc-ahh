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
      'touchend .instrument':   'onInstrumentBtnClick'
      'touchend .btn-mute':     'onMuteBtnClick'




   # Renders the view and renders out individual pattern squares
   # @param {Object} options

   render: (options) ->
      super options

      @$instrument = @$el.find '.instrument'
      @$mute       = @$el.find '.btn-mute'

      @$mute.hide()
      @renderPatternSquares()

      @



   remove: ->
      _.each @patternSquareViews, (square) =>
         square.remove()

      super()




   # Add listeners to the view which listen for view changes
   # as well as changes to the collection, which should update
   # pattern squares without re-rendering the views

   addEventListeners: =>
      @kitModel = @appModel.get('kitModel')

      @listenTo @model,    AppEvent.CHANGE_FOCUS,      @onFocusChange
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

         @$instrument.text model.get 'label'
         @$el.append patternSquare.render().el
         @patternSquareViews.push patternSquare

      # Set the squares on the Instrument model to track against state
      @model.set 'patternSquares', @collection





   select: ->
      @$el.addClass 'selected'





   deselect: ->
      if @$el.hasClass 'selected'
         @$el.removeClass 'selected'





   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for changes to the currently selected instrument
   # @param {InstrumentModel} instrumentModel

   onInstrumentChange: (instrumentModel) =>
      instrument = instrumentModel.changed.currentInstrument

      if instrument.cid is @model.cid
         @select()

      else @deselect()




   # Handler for mute button clicks
   # @param {InstrumentModel} model

   onInstrumentBtnClick: (event) =>

      # Off state > Focus
      if @model.get('mute') is false and @model.get('focus') is false

         return @model.set
            'mute':  false
            'focus': true

      # Focus state > Mute
      if @model.get('focus')

         return @model.set
            'mute':  true
            'focus': false

      # Mute state > off
      if @model.get('mute')

         return @model.set
            'mute': false
            'focus': false




   onFocusChange: (model) ->
      focus = model.changed.focus

      if focus
         @$instrument.addClass 'focus'
      else
         @$instrument.removeClass 'focus'




   # Handler for mute button clicks
   # @param {InstrumentModel} model

   onMuteBtnClick: (event) =>
      @model.set 'mute', ! @model.get('mute')





module.exports = PatternTrack
###*
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

AppConfig = require '../../../../config/AppConfig.coffee'
AppEvent  = require '../../../../events/AppEvent.coffee'
View      = require '../../../../supers/View.coffee'
template  = require './templates/pad-square-template.hbs'


class PadSquare extends View


   # The delay time before drag functionality is initialized
   # @type {Number}

   DRAG_TRIGGER_DELAY: 1000


   # The tag to be rendered to the DOM
   # @type {String}

   tagName: 'div'


   # The classname for the Pad Square
   # @type {String}

   className: 'pad-square'


   # The template
   # @type {Function}

   template: template


   # Model which tracks state of square and instruments
   # @type {PadSquareModel}

   model: null


   # The current icon class as applied to the square
   # @type {String}

   currentIcon: null


   # The audio playback component
   # @type {Howl}

   audioPlayback: null




   events:
      'touchstart': 'onPress'
      'touchend':   'onRelease'




   render: (options) ->
      super options

      @$iconContainer = @$el.find '.container-icon'
      @$icon          = @$iconContainer.find '.icon'

      @


   remove: ->
      @removeSoundAndClearPad()
      super()




   addEventListeners: ->
      @listenTo @model, AppEvent.CHANGE_TRIGGER,    @onTriggerChange
      @listenTo @model, AppEvent.CHANGE_DRAGGING,   @onDraggingChange
      @listenTo @model, AppEvent.CHANGE_DROPPED,    @onDroppedChange
      @listenTo @model, AppEvent.CHANGE_INSTRUMENT, @onInstrumentChange




   updateInstrumentClass: ->
      instrument = @model.get 'currentInstrument'
      @$el.parent().addClass instrument.get 'id'




   renderIcon: ->
      if @$icon.hasClass @currentIcon
         @$icon.removeClass @currentIcon

      instrument = @model.get 'currentInstrument'

      unless instrument is null
         @currentIcon = instrument.get 'icon'
         @$icon.addClass @currentIcon
         @$icon.text instrument.get 'label'




   setSound: ->
      @audioPlayback?.unload()

      instrument = @model.get 'currentInstrument'

      unless instrument is null
         audioSrc = instrument.get 'src'

         # TODO: Test methods
         if window.location.href.indexOf('test') isnt -1 then audioSrc = ''

         @audioPlayback = new Howl
            volume: AppConfig.VOLUME_LEVELS.medium
            urls: [audioSrc]
            onend: @onSoundEnd



   removeSoundAndClearPad: ->
      if @model.get('currentInstrument') is null
         return

      @audioPlayback?.unload()
      @audioPlayback = null

      currentInstrument = @model.get 'currentInstrument'

      id   = currentInstrument.get 'id'
      icon = currentInstrument.get 'icon'

      @$el.parent().removeAttr 'data-instrument'
      @$el.parent().removeClass id
      @$el.removeClass id
      @$icon.removeClass icon
      @$icon.text ''

      _.defer =>
         @model.set
            'dragging': false
            'dropped': false

         currentInstrument.set
            'dropped': false
            'droppedEvent': null

         @model.set 'currentInstrument', null




   playSound: ->
      @audioPlayback?.play()
      @model.set 'trigger', false





   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   onPress: (event) =>
      @model.set 'trigger', true

      @dragTimeout = setTimeout =>
         @model.set 'dragging', true

      , @DRAG_TRIGGER_DELAY




   onRelease: (event) =>
      clearTimeout @dragTimeout
      @model.set 'dragging', false




   onDrag: (event) ->
      @model.set 'dragging', true




   # Set dropped status so that bi-directional change can
   # be triggered from the LivePad kit render
   # @param {Number} id

   onDrop: (id) ->
      instrumentModel = @collection.findInstrumentModel id

      instrumentModel.set 'dropped', true

      @model.set
         'dragging': false
         'dropped': true
         'currentInstrument': instrumentModel



   onDraggingChange: (model) =>
      dragging = model.changed.dragging

      if dragging is true

         instrumentId = @$el.parent().attr 'data-instrument'

         currentInstrument    = @model.get('currentInstrument')
         originalDroppedEvent = currentInstrument.get 'droppedEvent'

         @model.set 'dropped', false
         currentInstrument.set 'dropped', false

         # Dispatch drag start event back to LivePad
         @trigger AppEvent.CHANGE_DRAGGING, {
            'instrumentId': instrumentId
            '$padSquare': @$el.parent()
            'originalDroppedEvent': originalDroppedEvent
         }



   onDroppedChange: (model) =>
      dropped = model.changed.dropped

      unless dropped
         @removeSoundAndClearPad()




   onTriggerChange: (model) =>
      trigger = model.changed.trigger

      if trigger
         @playSound()



   onInstrumentChange: (model) =>
      instrument = model.changed.currentInstrument

      unless instrument is null or instrument is undefined
         @updateInstrumentClass()
         @renderIcon()
         @setSound()




   onSoundEnd: =>
      @model.set 'trigger', false




   # PRIVATE METHODS
   # --------------------------------------------------------------------------------





module.exports = PadSquare
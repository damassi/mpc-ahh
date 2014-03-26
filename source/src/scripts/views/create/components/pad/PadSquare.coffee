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




   # Renders out individual pad squares

   render: (options) ->
      super options

      @$iconContainer = @$el.find '.container-icon'
      @$icon          = @$iconContainer.find '.icon'

      @



   # Removes the pad square from the dom and clears
   # out pre-set or user-set properties

   remove: ->
      @removeSoundAndClearPad()
      super()



   # Add listeners related to dragging, dropping and changes
   # to instruments.

   addEventListeners: ->
      @listenTo @model, AppEvent.CHANGE_TRIGGER,    @onTriggerChange
      @listenTo @model, AppEvent.CHANGE_DRAGGING,   @onDraggingChange
      @listenTo @model, AppEvent.CHANGE_DROPPED,    @onDroppedChange
      @listenTo @model, AppEvent.CHANGE_INSTRUMENT, @onInstrumentChange




   # Updates the visual representation of the pad square

   updateInstrumentClass: ->
      instrument = @model.get 'currentInstrument'
      @$el.parent().addClass instrument.get 'id'




   # Renders out the initial icon and sets the isntrument

   renderIcon: ->
      if @$icon.hasClass @currentIcon
         @$icon.removeClass @currentIcon

      instrument = @model.get 'currentInstrument'

      unless instrument is null
         @currentIcon = instrument.get 'icon'
         @$icon.addClass @currentIcon
         @$icon.text instrument.get 'label'




   # Sets the current sound and enables audio playback

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




   # Triggers audio playback

   playSound: ->
      @audioPlayback?.play()
      @model.set 'trigger', false




   # Generic remove and clear which is triggered when a user
   # drags the instrument off of the pad or the view is destroyed

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







   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for press events, which, when held
   # triggers a "drag" event on the model
   # @param {MouseEvent} event

   onPress: (event) =>
      @model.set 'trigger', true

      @dragTimeout = setTimeout =>
         @model.set 'dragging', true

      , @DRAG_TRIGGER_DELAY




   # Handler for release events which clears
   # drag whether drag was initiated or not
   # @param {MouseEvent} event

   onRelease: (event) =>
      clearTimeout @dragTimeout
      @model.set 'dragging', false




   # Handler for drag events.
   # TODO: Do we need this
   # @param {MouseEvent} event

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




   # Handler for 'change:drag' model events, which
   # sets up sequence for dragging on and off of
   # the pad square
   # @param {PadSquareModel} model

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




   # Handler for drop change events, which checks to see
   # if its been dropped off the square amd clears
   # @param {PadSquareModel} model

   onDroppedChange: (model) =>
      dropped = model.changed.dropped

      unless dropped
         @removeSoundAndClearPad()




   # Handler for 'change:trigger' events, which triggers
   # sound playback which then resets it to false on complet
   # @param {PadSquareModel} model

   onTriggerChange: (model) =>
      trigger = model.changed.trigger

      if trigger
         @playSound()




   # Handler for 'change:currentInstrument' events, which updates
   # the pad square with the appropriate data
   # @param {PadSquareModel} model

   onInstrumentChange: (model) =>
      instrument = model.changed.currentInstrument

      unless instrument is null or instrument is undefined
         @updateInstrumentClass()
         @renderIcon()
         @setSound()




   # Handler for sound end events, which resets the sound playback

   onSoundEnd: =>
      @model.set 'trigger', false





module.exports = PadSquare
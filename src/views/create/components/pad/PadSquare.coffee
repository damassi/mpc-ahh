###*
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

AppConfig = require '../../../../config/AppConfig.coffee'
AppEvent  = require '../../../../events/AppEvent.coffee'
PubEvent  = require '../../../../events/PubEvent.coffee'
View      = require '../../../../supers/View.coffee'
template  = require './templates/pad-square-template.hbs'

class PadSquare extends View

  # The delay time before drag functionality is initialized
  # @type {Number}

  DRAG_TRIGGER_DELAY: 600

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
    'taphold': 'onHold'


  # Renders out individual pad squares

  render: (options) ->
    super options

    @$border = @$el.find '.border-dark'
    @$keycode = @$el.find '.key-code'
    @$iconContainer = @$el.find '.container-icon'
    @$icon = @$iconContainer.find '.icon'

    TweenLite.set @$border, autoAlpha: 0
    TweenLite.set @$keycode, scale: .7
    @


  # Removes the pad square from the dom and clears
  # out pre-set or user-set properties

  remove: ->
    @removeSoundAndClearPad()
    super()


  # Add listeners related to dragging, dropping and changes
  # to instruments.

  addEventListeners: ->
    @listenTo @model, AppEvent.CHANGE_TRIGGER, @onTriggerChange
    @listenTo @model, AppEvent.CHANGE_DROPPED, @onDroppedChange
    @listenTo @model, AppEvent.CHANGE_INSTRUMENT, @onInstrumentChange


  # Updates the visual representation of the pad square

  updateInstrumentClass: ->
    instrument = @model.get 'currentInstrument'
    @instrumentId = instrument.get 'id'
    @$el.parent().addClass @instrumentId


  # Renders out the initial icon and sets the isntrument

  renderIcon: ->
    if @$icon.hasClass @currentIcon
      @$icon.removeClass @currentIcon

    instrument = @model.get 'currentInstrument'

    unless instrument is null
      @currentIcon = instrument.get 'icon'
      @$icon.addClass @currentIcon


  # Sets the current sound and enables audio playback

  setSound: ->
    instrument = @model.get 'currentInstrument'

    unless instrument is null
      audioSrc = instrument.get 'src'

      @audioPlayback = createjs.Sound.createInstance audioSrc
      @audioPlayback.volume = AppConfig.VOLUME_LEVELS.high
      @audioPlayback.addEventListener 'complete', @onSoundEnd


  # Triggers audio playback

  playSound: ->
    @audioPlayback?.play()

    unless @isMobile

      # Make sure that there's an instrument attached
      # to the pad before triggering the visualization

      if @model.get('currentInstrument')
        @trigger PubEvent.BEAT, livePad: true

    @model.set 'trigger', false


  # Generic remove and clear which is triggered when a user
  # drags the instrument off of the pad or the view is destroyed

  removeSoundAndClearPad: ->
    if @model.get('currentInstrument') is null
      return

    @audioPlayback = null

    currentInstrument = @model.get 'currentInstrument'

    id = currentInstrument.get 'id'
    icon = currentInstrument.get 'icon'

    @$el.parent().removeAttr 'data-instrument'
    @$el.parent().removeClass id
    @$el.removeClass id
    @$icon.removeClass icon
    @$icon.text ''


  # Event handlers
  # --------------

  # Handler for press events, which, when held
  # triggers a "drag" event on the model
  # @param {MouseEvent} event

  onPress: (event) =>
    @model.set 'trigger', true

    TweenLite.to @$el, .2,
      backgroundColor: '#E41E2B'

      onComplete: =>
        TweenLite.to @$el, .2,
          backgroundColor: '#e5e5e5'


  # Handler for release events which clears
  # drag whether drag was initiated or not
  # @param {MouseEvent} event

  onRelease: (event) =>
    @model.set 'dragging', false


  onHold: (event) =>
    currentInstrument = @model.get('currentInstrument')
    instrumentId = @$el.parent().attr 'data-instrument'

    if currentInstrument is null then return

    @model.set 'dropped', false
    currentInstrument.set 'dropped', false

    # Dispatch drag start event back to LivePad
    @trigger AppEvent.CHANGE_DRAGGING, {
      'instrumentId': instrumentId
      'padSquare': @
      '$padSquare': @$el.parent()
      'event': event
    }


  # Handler for drop change events, which checks to see
  # if its been extracted from the pad square to be dropped
  # back into the instrument group
  # @param {PadSquareModel} model

  onDroppedChange: (model) =>
    dropped = model.changed.dropped

    if dropped is false
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
      @model.set 'dropped', true
      @updateInstrumentClass()
      @renderIcon()
      @setSound()


  # Handler for sound end events, which resets the sound playback

  onSoundEnd: =>
    @model.set 'trigger', false


module.exports = PadSquare

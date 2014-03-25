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


   # The tag to be rendered to the DOM
   # @type {String}

   tagName: 'td'


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
      'touchend': 'onClick'




   render: (options) ->
      super options

      @$iconContainer = @$el.find '.container-icon'
      @$icon          = @$iconContainer.find '.icon'

      @


   remove: ->
      @audioPlayback?.unload()
      super()




   addEventListeners: ->
      @listenTo @model, AppEvent.CHANGE_TRIGGER, @onTriggerChange
      @listenTo @model, AppEvent.CHANGE_INSTRUMENT, @onInstrumentChange




   renderIcon: ->
      if @$icon.hasClass @currentIcon
         @$icon.removeClass @currentIcon

      instrument = @model.get 'currentInstrument'

      unless instrument is null
         @currentIcon = instrument.get 'icon'
         @$icon.addClass @currentIcon




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



   removeSound: ->
      @audioPlayback?.unload()
      @model.set 'currentInstrument', null




   playSound: ->
      @audioPlayback?.play()
      @model.set 'trigger', false





   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   onClick: (event) =>
      @model.set 'trigger', true

      console.log 'hey'




   onHold: (event) =>
      @model.set 'dragging', true




   onDrag: (event) ->
      @model.set 'dragging', true




   onDrop: (id) ->
      instrumentModel = @findInstrumentModel id

      # Set dropped status so that bi-directional
      # change can be triggered from the LivePad
      # kit render

      instrumentModel.set 'dropped', true

      @model.set
         'dragging': false
         'dropped': true
         'currentInstrument': instrumentModel




   onTriggerChange: (model) =>
      playing = model.changed.playing

      if playing
         @playSound()



   onInstrumentChange: (model) =>
      @renderIcon()
      @setSound()




   onSoundEnd: =>
      @model.set 'trigger', false




   # PRIVATE METHODS
   # --------------------------------------------------------------------------------




   findInstrumentModel: (id) ->
      instrumentModel = null

      @collection.each (kitModel) =>
         kitModel.get('instruments').each (model) =>
            if id is model.get('id')
               instrumentModel = model

      if instrumentModel is null
         return false

      instrumentModel





module.exports = PadSquare
###*
 * Sequencer parent view for track sequences
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

PatternTrack = require './PatternTrack.coffee'
AppEvent     = require '../../../../events/AppEvent.coffee'
View         = require '../../../../supers/View.coffee'
helpers      = require '../../../../helpers/handlebars-helpers'
template     = require './templates/sequencer-template.hbs'


class Sequencer extends View


   # The name of the container class
   # @type {String}

   className: 'sequencer-container'


   # The template
   # @type {Function}

   template: template


   # An array of all pattern tracks
   # @type {String}

   patternTrackViews: null


   # The setInterval ticker
   # @type {Number}

   bpmInterval: null


   # The time in which the interval fires
   # @type {Number}

   updateIntervalTime: 200


   # The current beat id
   # @type {Number}

   currBeatCellId: -1


   # TODO: Update this to make it more dynamic
   # The number of beat cells
   # @type {Number}

   numCells: 7


   # Global application model
   # @type {AppModel}

   appModel: null


   # Collection of instruments
   # @type {InstrumentCollection}

   collection: null


   # An array of all sounds extracted from the current InstrumentCollection
   # @type {Array}

   soundArray: null



   # Renders the view
   # @param {Object}

   render: (options) ->
      super options

      @$thStepper = @$el.find 'th.stepper'
      @$sequencer = @$el.find '.sequencer'

      @renderTracks()
      @play()

      @


   # Removes the view from the DOM and cancels
   # the ticker interval

   remove: ->
      super()
      @pause()



   # Add event listeners for handling instrument and playback
   # changes.  Updates all of the views accordingly

   addEventListeners: ->
      @listenTo @appModel, AppEvent.CHANGE_PLAYING, @onPlayingChange
      @listenTo @appModel, AppEvent.CHANGE_KIT, @onKitChange



   # Renders out each individual track.
   # TODO: Need to update so that all of the beat squares aren't
   # blown away by the re-render

   renderTracks: =>
      @$el.find('.pattern-track').remove()

      @patternTrackViews = []

      @collection.each (model) =>

         patternTrack = new PatternTrack
            appModel: @appModel
            collection: model.get 'patternSquares'
            model: model

         @patternTrackViews.push patternTrack
         @$sequencer.append patternTrack.render().el




   # Update the ticker time, and advances the beat

   updateTime: =>
      @$thStepper.removeClass 'step'
      @currBeatCellId = if @currBeatCellId < @numCells then @currBeatCellId += 1 else @currBeatCellId = 0
      $(@$thStepper[@currBeatCellId]).addClass 'step'

      @playAudio()




   # Converts milliseconds to BPM

   convertBPM: ->
      return 200



   # Start playback of sequencer

   play: ->
      @appModel.set 'playing', true




   # Pauses sequencer playback

   pause: ->
      @appModel.set 'playing', false




   # Mutes the sequencer

   mute: ->
      @appModel.set 'mute', true




   # Unmutes the sequencer

   unmute: ->
       @appModel.set 'mute', false





   # Plays audio of each track currently enabled and on

   playAudio: ->

      @collection.each (instrument) =>
         patternSquares = instrument.get 'patternSquares'

         patternSquares.each (patternSquare, index) =>

            if @currBeatCellId is index
               if patternSquare.get 'active'
                  patternSquare.set 'trigger', true
                  console.log patternSquare.get('trigger'), 'should be trigger!'

               else
                  #patternSquare.set 'trigger', false


      return

      @collection.toJSON().forEach (sound, index) =>
         {soundId, src} = sound

         return
         beat = sound.beats[@currBeatCellId]

         $tr = $("#sequencer tr[data-sound=#{index+1}]")
         $td = $tr.find("[data-beat=#{@currBeatCellId+1}]");

         return

         if beat.active
            console.log 'beat is active!'
            @$activeSquare = $td

            TweenMax.to $td, .2,
               backgroundColor: Math.random() * 0xFF0000
               ease: Back.easeIn
               scale: .5
               onComplete: ->
                  TweenMax.to $td, .2,
                     backgroundColor: "#000000"
                     scale: 1
                     ease: Back.easeOut



            #createjs.Sound.play(soundId)
            new Howl({ urls: [src] }).play()




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for playback changes.  If paused, it stops playback and
   # clears the interval.  If playing, it resets it
   # @param {AppModel} model

   onPlayingChange: (model) =>
      playing = model.changed.playing

      if playing
         @bpmInterval = setInterval @updateTime, @updateIntervalTime

      else
         clearInterval @bpmInterval
         @bpmInterval = null




   # Handler for mute and unmute changes
   # @param {AppModel} model

   onMuteChange: (model) =>




   # Handler for kit changes, as set from the KitSelector
   # @param {KitModel} model

   onKitChange: (model) =>
      @collection = model.changed.kitModel.get('instruments')
      @renderTracks()








module.exports = Sequencer
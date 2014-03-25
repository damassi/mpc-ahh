###*
 * Sequencer parent view for track sequences
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

PatternTrack = require './PatternTrack.coffee'
PubSub       = require '../../../../utils/PubSub'
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
      _.each @patternTrackViews, (track) =>
         track.remove()

      @pause()

      super()



   # Add event listeners for handling instrument and playback
   # changes.  Updates all of the views accordingly

   addEventListeners: ->
      @listenTo @appModel,   AppEvent.CHANGE_BPM,     @onBPMChange
      @listenTo @appModel,   AppEvent.CHANGE_PLAYING, @onPlayingChange
      @listenTo @appModel,   AppEvent.CHANGE_KIT,     @onKitChange
      @listenTo @collection, AppEvent.CHANGE_FOCUS,   @onFocusChange

      PubSub.on AppEvent.IMPORT_TRACK, @importTrack
      #PubSub.on AppEvent.EXPORT_TRACK, @onExportTrack



   removeEventListeners: ->
      super()

      PubSub.off AppEvent.IMPORT_TRACK
      PubSub.off AppEvent.EXPORT_TRACK



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
      focusedInstrument =  @collection.findWhere { focus: true }

      # Check if there's a focused track and only
      # play audio from there

      if focusedInstrument
         if focusedInstrument.get('mute') isnt true
            focusedInstrument.get('patternSquares').each (patternSquare, index) =>
               @playPatternSquareAudio( patternSquare, index )

         return


      # If nothing is focused, then check against
      # the entire matrix

      @collection.each (instrument) =>
         if instrument.get('mute') isnt true
            instrument.get('patternSquares').each (patternSquare, index) =>
               @playPatternSquareAudio( patternSquare, index )




   # Plays the audio on an individual PatterSquare if tempo index
   # is the same as the index within the collection
   # @param {PatternSquare} patternSquare
   # @param {Number} index

   playPatternSquareAudio: (patternSquare, index) ->
      if @currBeatCellId is index
         if patternSquare.get 'active'
            patternSquare.set 'trigger', true




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for BPM tempo changes
   # @param {AppModel} model

   onBPMChange: (model) =>
      clearInterval @bpmInterval
      @updateIntervalTime = model.changed.bpm
      @bpmInterval = setInterval @updateTime, @updateIntervalTime




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

      console.log @collection.toJSON()

      # Export old pattern squares so the users pattern isn't blown away
      # when kit changes occur

      oldInstrumentCollection = model._previousAttributes.kitModel.get('instruments')
      oldPatternSquares = oldInstrumentCollection.exportPatternSquares()


      # Update the new collection with old pattern square data
      # and trigger UI updates on each square

      @collection.each (instrumentModel, index) ->
         oldCollection = oldPatternSquares[index]
         newCollection = instrumentModel.get 'patternSquares'

         # Update track / instrument level properties like volume / mute / focus
         oldProps = oldInstrumentCollection.at(index)

         unless oldProps is undefined

            oldProps = oldProps.toJSON()

            instrumentModel.set
               volume: oldProps.volume
               active: oldProps.active
               mute:   null
               focus:  null

            # Reset visually tied props to trigger ui update
            instrumentModel.set
               mute:   oldProps.mute
               focus:  oldProps.focus

         # Check for inconsistancies between number of instruments
         unless oldCollection is undefined

            newCollection.each (patternSquare, index) ->
               oldPatternSquare = oldCollection.at index
               patternSquare.set oldPatternSquare.toJSON()




   importTrack: (params) =>
      {callback, patternSquareGroups, instruments} = params

      @renderTracks()

      # Iterate over each view and set saved properties
      _.each @patternTrackViews, (patternTrackView, iterator) ->
         instrumentModel = patternTrackView.model

         instrumentModel.set
            mute:  null
            focus: null

         # Update props to trigger UI updates
         instrumentModel.set
            mute:  instruments[iterator].mute
            focus: instruments[iterator].focus

         # Update each individual pattern square with settings
         patternTrackView.collection.each (patternModel, index) ->
            patternModel.set patternSquareGroups[iterator][index]

      callback()




   onExportTrack: ->
      {callback} = params

      patternSquares = []

      console.log 'firing export!!'





   # Handler for focus change events.  Iterates over all of the models within
   # the InstrumentCollection and toggles their focus to off if the changed
   # model's focus is set to true.
   # @param {InstrumentModel} model

   onFocusChange: (model) =>
      @collection.each (instrumentModel) =>
         if model.changed.focus is true
            if model.cid isnt instrumentModel.cid
               instrumentModel.set 'focus', false







module.exports = Sequencer
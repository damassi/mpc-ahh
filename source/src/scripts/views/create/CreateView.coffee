###*
 * Create view which the user can build beats within
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

PubSub                  = require '../../utils/PubSub'
View                    = require '../../supers/View.coffee'
AppEvent                = require '../../events/AppEvent.coffee'
SharedTrackModel        = require '../../models/SharedTrackModel.coffee'
KitSelector             = require './components/KitSelector.coffee'
PlayPauseBtn            = require './components/PlayPauseBtn.coffee'
Toggle                  = require './components/Toggle.coffee'
PatternSelector         = require './components/PatternSelector.coffee'
InstrumentSelectorPanel = require './components/instruments/InstrumentSelectorPanel.coffee'
Sequencer               = require './components/sequencer/Sequencer.coffee'
LivePad                 = require './components/pad/LivePad.coffee'
ShareModal              = require './components/share/ShareModal.coffee'
BPMIndicator            = require './components/BPMIndicator.coffee'
template                = require './templates/create-template.hbs'


class CreateView extends View


   id: 'container-create'

   # The template
   # @type {Function}

   template: template


   events:
      'touchend .btn-share':  'onShareBtnClick'
      'touchend .btn-export': 'onExportBtnClick'



   # Renders the view and all of the individual components.  Also checks
   # for a `shareId` on the AppModel and hides elements appropriately
   # @param {Object} options

   render: (options) ->
      super options

      @sharedTrackModel = new SharedTrackModel

      @playPauseBtn = new PlayPauseBtn
         appModel: @appModel

      @toggle = new Toggle
         appModel: @appModel

      @$topContainer             = $('body').find '#container-top'
      @$wrapper                  = @$el.find '.wrapper'
      @$kitSelectorContainer     = @$el.find '#container-kit-selector'
      @$toggleContainer          = @$el.find '.container-toggle'
      @$playPauseContainer       = @$el.find '.container-play-pause'
      @$sequencerContainer       = @$el.find '.container-sequencer'
      @$patternSelectorContainer = @$el.find '.column-2'
      @$bpmContainer             = @$el.find '.column-3'

      @$instrumentSelector     = @$sequencerContainer.find '.instrument-selector'
      @$sequencer              = @$sequencerContainer.find '.sequencer'
      @$livePad                = @$sequencerContainer.find '.live-pad'
      @$patternSelector        = @$sequencerContainer.find '.pattern-selector'
      @$bpm                    = @$sequencerContainer.find '.bpm'
      @$shareBtn               = @$sequencerContainer.find '.btn-share'

      @$toggleContainer.html     @toggle.render().el
      @$playPauseContainer.html  @playPauseBtn.render().el

      @renderKitSelector()
      @renderSequencer()
      @renderLivePad()
      @renderPatternSelector()
      @renderBPM()

      @appModel.set 'showSequencer', true


      @$kitSelector = @$el.find '.kit-selector'

      # Check if the user is importing a track
      shareId = @appModel.get 'shareId'
      if shareId isnt null and shareId isnt '' and shareId isnt undefined
         @$wrapper.hide()
         @importTrack shareId
         @appModel.set 'shareId', null

         _.defer =>
            TweenMax.set $('#container-visualizer').find('.wrapper'), top: 0

      @



   # Removes the view

   remove: ->
      @kitSelector.remove()
      @instrumentSelector.remove()
      @sequencer.remove()
      @livePad.remove()
      @patternSelector.remove()
      @bpm.remove()
      @shareModal?.remove()
      super()



   # Adds listeners related to exporting the track pattern

   addEventListeners: ->
      PubSub.on AppEvent.EXPORT_TRACK, @onExportTrack
      @listenTo @appModel, AppEvent.CHANGE_SHOW_SEQUENCER, @onShowSequencerChange
      @listenTo @appModel, AppEvent.CHANGE_SHOW_PAD,       @onShowPadChange




   # Removes listeners

   removeEventListeners: ->
      PubSub.off AppEvent.EXPORT_TRACK
      super()




   # Renders the kit selector carousel

   renderKitSelector: ->
      @kitSelector = new KitSelector
         appModel: @appModel
         kitCollection: @kitCollection

      @$topContainer.append @kitSelector.render().el




   # Renders the instrument selector which, on desktop, does nothing, but on
   # mobile focuses the track within the view

   renderInstrumentSelector: ->
      @instrumentSelector = new InstrumentSelectorPanel
         appModel: @appModel
         kitCollection: @kitCollection

      @$instrumentSelector.html @instrumentSelector.render().el




   # Renders out the pattern square sequencer

   renderSequencer: ->
      @sequencer = new Sequencer
         appModel: @appModel
         collection: @kitCollection.at(0).get('instruments')

      @$sequencer.prepend @sequencer.render().el




   # Renders out the live pad player

   renderLivePad: ->
      @livePad = new LivePad
         appModel: @appModel
         kitCollection: @kitCollection

      @$livePad.html @livePad.render().el




   # Render the pre-populated pattern selector

   renderPatternSelector: ->
      @patternSelector = new PatternSelector
         appModel: @appModel

      @$patternSelector.html @patternSelector.render().el




   # Renders out the BPM interface for controlling tempo

   renderBPM: ->
      @bpm = new BPMIndicator
         appModel: @appModel

      @$bpm.html @bpm.render().el




   # Renders out the share modal which then posts to Parse

   renderShareModal: ->
      @shareModal = new ShareModal
         appModel: @appModel
         sharedTrackModel: @sharedTrackModel

      $('body').prepend @shareModal.render().el

      @shareModal.show()

      @listenTo @shareModal, AppEvent.SAVE_TRACK,  @onSaveTrack
      @listenTo @shareModal, AppEvent.CLOSE_SHARE, @onCloseShare





   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for saving, sharing and posting a track

   onSaveTrack: =>
      @exportTrack =>
         @saveTrack()



   # Handler for PubSub EXPORT_TRACK events.  Prepares the data in a way that
   # is savable, exportable, and importable
   # @param {Function} callback

   onExportTrack: (callback) =>

      patternSquareGroups = []
      patternSquares      = []

      instruments = @appModel.export().kitModel.instruments
      kit         = @appModel.get('kitModel').toJSON()

      # Iterate over each instrument and clean values that are unneeded
      instruments = instruments.map (instrument) =>
         instrument.patternSquares.forEach (patternSquare) =>
            delete patternSquare.instrument
            patternSquares.push patternSquare

         instrument

      # Break the patternSquares into groups of tracks
      while (patternSquares.length > 0)
         patternSquareGroups.push patternSquares.splice(0, 8)

      # Pass parsable values back to callee
      callback {
         kitType: @appModel.get('kitModel').get('label')
         instruments: instruments
         patternSquareGroups: patternSquareGroups
      }




   # Handler for share button clicks.  Creates the modal and prompts the user
   # to enter info related to their creation
   # @param {MouseEvent} event

   onShareBtnClick: (event) =>
      @trigger AppEvent.OPEN_SHARE
      @renderShareModal()




   # Handler for close btn event on the share modal, as dispatched from the ShareModal
   # @param {MouseEvent} event

   onCloseShare: (event) =>
      @trigger AppEvent.CLOSE_SHARE
      @stopListening @shareModal





   onShowSequencerChange: (model) =>
      if model.changed.showSequencer
         @showSequencer()





   onShowPadChange: (model) =>
      if model.changed.showPad
         @showLivePad()



   # PRIVATE METHODS
   # --------------------------------------------------------------------------------



   # Swaps the live pad out with the sequencer

   showSequencer: ->
      tweenTime = .6

      @$sequencer.removeClass 'hide'

      TweenMax.to @$sequencer, tweenTime,
         autoAlpha: 1
         x: 0
         ease: Expo.easeInOut
         #delay: .2

      TweenMax.to @$livePad, tweenTime,
         autoAlpha: 0
         x: 2000
         ease: Expo.easeInOut
         onComplete: =>
            #@$livePad.addClass 'hide'



   # Swaps the sequencer area out with the live pad

   showLivePad: ->
      tweenTime = .6

      @$livePad.removeClass 'hide'

      TweenMax.to @$sequencer, tweenTime,
         autoAlpha: 0
         x: -2000
         ease: Expo.easeInOut
         onComplete: =>
            #@$sequencer.addClass 'hide'


      TweenMax.to @$livePad, tweenTime,
         autoAlpha: 1
         x: 0
         ease: Expo.easeInOut




   # Exports the current track conguration into a serializable,
   # savable format which is then posted to Parse or later retrieval

   exportTrack: (callback) =>
      PubSub.trigger AppEvent.EXPORT_TRACK, (params) =>

         {@kitType, @instruments, @patternSquareGroups} = params

         if callback then callback()




   # Create a new Parse model and pass in params that
   # have been retrieved, via PubSub from the Sequencer view

   saveTrack: =>

      @sharedTrackModel.set

         bpm:                 @appModel.get 'bpm'
         instruments:         @instruments
         kitType:             @kitType
         patternSquareGroups: @patternSquareGroups
         visualization:       @appModel.get 'visualization'

      # Send the Parse model up the wire and save to DB
      @sharedTrackModel.save

         error: (object, error) =>
            console.error object, error
            @appModel.set 'shareId', 'error'



         # Handler for success events.  Create a new
         # visual success message and pass user on to
         # their page

         success: (response) =>
            @appModel.set 'shareId', response.id




   # Import the shared track by requesting the data from parse
   # Once imported

   importTrack: (shareId) =>

      query = new Parse.Query SharedTrackModel

      # Create request to fetch data from the Parse DB
      query.get shareId,

         error: (object, error) =>
            console.error object, error


         # Handler for success events.  Returns the saved model which is then
         # dispatched, via PubSub, to the Sequencer view for playback and render
         # @param {SharedTrackModel}

         success: (sharedTrackModel) =>

            console.log sharedTrackModel

            @appModel.set
               'bpm':              sharedTrackModel.get 'bpm'
               'sharedTrackModel': sharedTrackModel

            PubSub.trigger AppEvent.IMPORT_TRACK,

               kitType:             sharedTrackModel.get 'kitType'
               instruments:         sharedTrackModel.get 'instruments'
               patternSquareGroups: sharedTrackModel.get 'patternSquareGroups'


               # Handler for callbacks once the track has been imported and
               # rendered.  Displays the Share view and begins playback
               # @param {Object} response

               callback: (response) ->





module.exports = CreateView
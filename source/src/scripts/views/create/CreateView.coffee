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
KitSelector             = require '../../views/create/components/KitSelector.coffee'
InstrumentSelectorPanel = require '../../views/create/components/instruments/InstrumentSelectorPanel.coffee'
Sequencer               = require '../../views/create/components/sequencer/Sequencer.coffee'
BPMIndicator            = require '../../views/create/components/BPMIndicator.coffee'
template                = require './templates/create-template.hbs'


class CreateView extends View


   template: template


   events:
      'touchend .btn-share':  'onShareBtnClick'
      'touchend .btn-export': 'onExportBtnClick'


   initialize: (options) ->
      super options


   render: (options) ->
      super options

      @$kitSelectorContainer   = @$el.find '.container-kit-selector'
      @$kitSelector            = @$el.find '.kit-selector'
      @$visualizationContainer = @$el.find '.container-visualization'
      @$sequencerContainer     = @$el.find '.container-sequencer'
      @$instrumentSelector     = @$sequencerContainer.find '.instrument-selector'
      @$sequencer              = @$sequencerContainer.find '.sequencer'
      @$bpm                    = @$sequencerContainer.find '.bpm'
      @$shareBtn               = @$sequencerContainer.find '.btn-share'

      @renderKitSelector()
      @renderInstrumentSelector()
      @renderSequencer()
      @renderBPM()

      shareId = @appModel.get 'shareId'

      if shareId isnt null
         @importSharedTrack shareId

      @



   addEventListeners: ->
      PubSub.on AppEvent.EXPORT_TRACK, @onExportTrack



   removeEventListeners: ->
      PubSub.off AppEvent.EXPORT_TRACK




   renderKitSelector: ->
      @kitSelector = new KitSelector
         appModel: @appModel
         kitCollection: @kitCollection

      @$kitSelector.html @kitSelector.render().el



   renderInstrumentSelector: ->
      @instrumentSelector = new InstrumentSelectorPanel
         appModel: @appModel
         kitCollection: @kitCollection

      @$instrumentSelector.html @instrumentSelector.render().el



   renderSequencer: ->
      @sequencer = new Sequencer
         appModel: @appModel
         collection: @kitCollection.at(0).get('instruments')

      @$sequencer.html @sequencer.render().el



   renderBPM: ->
      @bpm = new BPMIndicator
         appModel: @appModel

      @$bpm.html @bpm.render().el





   # PUBLIC METHODS
   # --------------------------------------------------------------------------------


   # Exports the current track conguration into a serializable,
   # savable format which is then posted to Parse or later retrieval

   exportTrack: =>

      PubSub.trigger AppEvent.EXPORT_TRACK, (params) =>

         {@kitType, @instruments, @patternSquareGroups} = params




   # Create a new Parse model and pass in params that
   # have been retrieved, via PubSub from the Sequencer view

   saveTrack: =>

      sharedTrackModel = new SharedTrackModel
         bpm:                 @appModel.get 'bpm'
         instruments:         @instruments
         kitType:             @kitType
         patternSquareGroups: @patternSquareGroups
         shareMessage:        @appModel.get 'shareMessage'
         trackTitle:          @appModel.get 'trackTitle'
         visualization:       @appModel.get 'visualization'

      # Send the Parse model up the wire and save to DB
      sharedTrackModel.save

         error: (object, error) =>
            console.error object, error


         # Handler for success events.  Create a new
         # visual success message and pass user on to
         # their page

         success: (response) =>
            @shareId = response.id
            console.log @shareId




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

            PubSub.trigger AppEvent.IMPORT_TRACK,

               kitType:             sharedTrackModel.get 'kitType'
               instruments:         sharedTrackModel.get 'instruments'
               patternSquareGroups: sharedTrackModel.get 'patternSquareGroups'


               # Handler for callbacks once the track has been imported and
               # rendered.  Displays the Share view and begins playback
               # @param {Object} response

               callback: (response) ->






   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for PubSub EXPORT_TRACK events.  Prepares the data in a way that
   # is savable, exportable, and importable
   # @param {Function} callback

   onExportTrack: (callback) =>

      patternSquareGroups = []
      patternSquares      = []

      kit         = @appModel.get('kitModel').toJSON()
      instruments = @appModel.export().kitModel.instruments

      instruments = instruments.map (instrument) =>
         instrument.patternSquares.forEach (patternSquare) =>
            delete patternSquare.instrument
            patternSquares.push patternSquare

         instrument

      while (patternSquares.length > 0)
         patternSquareGroups.push patternSquares.splice(0, 8)

      callback {
         kitType: @appModel.get('kitModel').get('label')
         instruments: instruments
         patternSquareGroups: patternSquareGroups
      }




   onExportBtnClick: (event) =>
      @exportTrack()




   onShareBtnClick: (event) =>
      @importTrack @shareId






module.exports = CreateView
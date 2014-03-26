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



   importSharedTrack: (shareId) =>
      query = new Parse.Query SharedTrackModel

      query.get shareId,

         error: (object, error) =>
            console.error 'Error retrieving parse track'
            console.error object, error

         success: (sharedTrackModel) =>

            PubSub.trigger AppEvent.IMPORT_TRACK,
               kitType:             sharedTrackModel.get 'kitType'
               instruments:         sharedTrackModel.get 'instruments'
               patternSquareGroups: sharedTrackModel.get 'patternSquareGroups'

               callback: (response) ->
                  #console.log 'done importing'




   onExportBtnClick: (event) =>
      PubSub.trigger AppEvent.EXPORT_TRACK, (params) =>

         {@kitType, @instruments, @patternSquareGroups} = params

         sharedTrackModel = new SharedTrackModel
            kitType:             @kitType
            instruments:         @instruments,
            patternSquareGroups: @patternSquareGroups

         console.log sharedTrackModel

         sharedTrackModel.save
            success: (response) =>
               console.log 'success'
               console.log response

               @shareId = response.id

               console.log @shareId

            error: (response) =>
               console.log 'error...'
               console.log error




   onShareBtnClick: (event) =>
      @importSharedTrack @shareId




   onExportTrack: (callback) =>
      patternSquareGroups = []
      patternSquares = []

      kit = @appModel.get('kitModel').toJSON()

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






module.exports = CreateView
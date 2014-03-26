###*
 * Create view which the user can build beats within
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

PubSub                  = require '../../utils/PubSub'
View                    = require '../../supers/View.coffee'
AppEvent                = require '../../events/AppEvent.coffee'
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




   onExportBtnClick: (event) =>
      PubSub.trigger AppEvent.EXPORT_TRACK, (params) =>
         console.log JSON.stringify params
         {@instruments, @patternSquareGroups} = params




   onShareBtnClick: (event) =>

      PubSub.trigger AppEvent.IMPORT_TRACK,

         instruments:         @instruments
         patternSquareGroups: @patternSquareGroups

         callback: (response) ->
            console.log 'done importing'




   onExportTrack: (callback) =>
      patternSquareGroups = []
      patternSquares = []

      instruments = @appModel.export().kitModel.instruments

      instruments = instruments.map (instrument) =>
         instrument.patternSquares.forEach (patternSquare) =>
            delete patternSquare.instrument
            patternSquares.push patternSquare

         instrument

      while (patternSquares.length > 0)
         patternSquareGroups.push patternSquares.splice(0, 8)

      callback {
         patternSquareGroups: patternSquareGroups
         instruments: instruments
      }






module.exports = CreateView
###*
 * Create view which the user can build beats within
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###


View                    = require '../../supers/View.coffee'
KitSelector             = require '../../views/create/components/KitSelector.coffee'
InstrumentSelectorPanel = require '../../views/create/components/instruments/InstrumentSelectorPanel.coffee'
Sequencer               = require '../../views/create/components/sequencer/Sequencer.coffee'
BPMIndicator            = require '../../views/create/components/BPMIndicator.coffee'
template                = require './templates/create-template.hbs'


class CreateView extends View


   template: template


   events:
      'touchend .btn-share': 'onShareBtnClick'


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



   onShareBtnClick: (event) ->
      console.log @kitCollection.toJSON()





module.exports = CreateView
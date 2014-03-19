###*
 * MPC Application router
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

AppConfig   = require '../config/AppConfig.coffee'
PubSub      = require '../utils/PubSub'
PubEvent    = require '../events/PubEvent.coffee'

# TODO: The below items are only included for testing component
# modularity.  They, and their routes, should be removed in production

TestsView     = require '../views/tests/TestsView.coffee'

KitSelection  = require '../views/create/components/KitSelection.coffee'
KitCollection = require '../models/KitCollection.coffee'
KitModel      = require '../models/KitModel.coffee'

BPMIndicator  = require '../views/create/components/BPMIndicator.coffee'
InstrumentSelectionPanel = require '../views/create/components/instruments/InstrumentSelectionPanel.coffee'

SequencerSquare = require '../views/create/components/sequencer/SequencerSquare.coffee'
SequencerTrack  = require '../views/create/components/sequencer/SequencerTrack.coffee'
Sequencer       = require '../views/create/components/sequencer/Sequencer.coffee'


class AppRouter extends Backbone.Router


   routes:
      '':             'landingRoute'
      'create':       'createRoute'
      'share':        'shareRoute'

      # Component test routes
      'tests':                'tests'
      'kit-selection':        'kitSelectionRoute'
      'bpm-indicator':        'bpmIndicatorRoute'
      'instrument-selector':  'instrumentSelectorRoute'
      'sequencer-square':     'sequencerSquareRoute'
      'sequencer-track':      'sequencerTrackRoute'
      'sequencer':            'sequencerRoute'



   initialize: (options) ->
      {@appController, @appModel} = options

      PubSub.on PubEvent.ROUTE, @onRouteChange



   onRouteChange: (params) =>
      {route} = params

      @navigate route, { trigger: true }



   landingRoute: ->
      @appModel.set 'view', @appController.landingView



   createRoute: ->
      @appModel.set 'view', @appController.createView



   shareRoute: ->
      @appModel.set 'view', @appController.shareView






   # COMPONENT TEST ROUTES
   # --------------------------------------------------------------------------------


   tests: ->
      view = new TestsView()

      @appModel.set 'view', view




   kitSelectionRoute: ->
      models = []

      _(4).times (index) ->
         models.push new KitModel {label: "kit #{index}"}

      view = new KitSelection
         appModel: @appModel
         kitCollection: new KitCollection models, {
            appModel: @appModel
         }

      @appModel.set 'view', view




   bpmIndicatorRoute: ->
      view = new BPMIndicator
         appModel: @appModel

      view.render()

      @appModel.set 'view', view




   instrumentSelectorRoute: ->
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'

      @appModel.set 'kitModel', @kitCollection.at(0)

      view = new InstrumentSelectionPanel
         kitCollection: @kitCollection
         appModel: @appModel

      @appModel.set 'view', view




   sequencerSquareRoute: ->
      view = new SequencerSquare()

      @appModel.set 'view', view



   sequencerTrackRoute: ->
      view = new SequencerTrack()

      @appModel.set 'view', view



   sequencerRoute: ->
      view = new Sequencer()

      @appModel.set 'view', view




module.exports = AppRouter
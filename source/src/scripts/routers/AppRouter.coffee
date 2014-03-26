###*
 * MPC Application router
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

AppConfig   = require '../config/AppConfig.coffee'
PubSub      = require '../utils/PubSub'
PubEvent    = require '../events/PubEvent.coffee'


# ***************************************************************************************************
# ***************************************************************************************************

# TODO: The below items are only included for testing component
# modularity.  They, and their routes, should be removed in production

TestsView               = require '../views/tests/TestsView.coffee'

View                    = require '../supers/View.coffee'

KitSelector             = require '../views/create/components/KitSelector.coffee'
KitCollection           = require '../models/kits/KitCollection.coffee'
KitModel                = require '../models/kits/KitModel.coffee'

BPMIndicator            = require '../views/create/components/BPMIndicator.coffee'
InstrumentSelectorPanel = require '../views/create/components/instruments/InstrumentSelectorPanel.coffee'

InstrumentModel         = require '../models/sequencer/InstrumentModel.coffee'
InstrumentCollection    = require '../models/sequencer/InstrumentCollection.coffee'

PatternSquare           = require '../views/create/components/sequencer/PatternSquare.coffee'
PatternSquareModel      = require '../models/sequencer/PatternSquareModel.coffee'
PatternSquareCollection = require '../models/sequencer/PatternSquareCollection.coffee'
PatternTrack            = require '../views/create/components/sequencer/PatternTrack.coffee'
Sequencer               = require '../views/create/components/sequencer/Sequencer.coffee'

LivePadModel            = require '../models/pad/LivePadModel.coffee'
PadSquareCollection     = require '../models/pad/PadSquareCollection.coffee'
PadSquareModel          = require '../models/pad/PadSquareModel.coffee'
LivePad                 = require '../views/create/components/pad/LivePad.coffee'
PadSquare               = require '../views/create/components/pad/PadSquare.coffee'


# ***************************************************************************************************
# ***************************************************************************************************


class AppRouter extends Backbone.Router


   routes:
      '':             'landingRoute'
      'landing':      'landingRoute'
      'create':       'createRoute'
      'share/:id':    'shareRoute'

      # Component test routes
      'development':          'tests'
      'kit-selection':        'kitSelectionRoute'
      'bpm-indicator':        'bpmIndicatorRoute'
      'instrument-selector':  'instrumentSelectorRoute'
      'pattern-square':       'patternSquareRoute'
      'pattern-track':        'patternTrackRoute'
      'sequencer':            'sequencerRoute'
      'full-sequencer':       'fullSequencerRoute'
      'pad-square':           'padSquareRoute'
      'live-pad':             'livePadRoute'



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



   shareRoute: (shareId) ->
      console.log shareId

      @appModel.set
         'view': @appController.createView
         'shareId': shareId

      #@appModel.set 'view', @appController.shareView







   # ***************************************************************************************************
   # ***************************************************************************************************



   tests: ->
      view = new TestsView()

      @appModel.set 'view', view




   kitSelectionRoute: ->
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'

      view = new KitSelector
         appModel: @appModel
         kitCollection: @kitCollection,
            appModel: @appModel

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

      view = new InstrumentSelectorPanel
         kitCollection: @kitCollection
         appModel: @appModel

      @appModel.set 'view', view




   patternSquareRoute: ->
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'

      view = new PatternSquare
         patternSquareModel: new PatternSquareModel()

      @appModel.set 'view', view



   patternTrackRoute: ->
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'

      view = new PatternTrack
         appModel: @appModel
         model: @kitCollection.at(0).get('instruments').at(0)

      @appModel.set 'view', view



   sequencerRoute: ->

      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'

      view = new Sequencer
         appModel: @appModel
         collection: @kitCollection.at(0).get('instruments')

      @appModel.set 'view', view



   fullSequencerRoute: ->

      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'


      kitSelection = =>
         view = new KitSelector
            appModel: @appModel
            kitCollection: @kitCollection

         view


      bpm = =>
         view = new BPMIndicator
            appModel: @appModel

         view


      instrumentSelection = =>
         @appModel.set 'kitModel', @kitCollection.at(0)

         view = new InstrumentSelectorPanel
            kitCollection: @kitCollection
            appModel: @appModel

         view


      sequencer = =>
         view = new Sequencer
            appModel: @appModel
            collection: @kitCollection.at(0).get('instruments')

         view

      fullSequencerView = new View()
      fullSequencerView.$el.append kitSelection().render().el
      fullSequencerView.$el.append bpm().render().el
      fullSequencerView.$el.append instrumentSelection().render().el
      fullSequencerView.$el.append sequencer().render().el

      @appModel.set 'view', fullSequencerView




   padSquareRoute: ->
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'

      view = new PadSquare
         model: new PadSquareModel()
         collection: @kitCollection


      @appModel.set 'view', view





   livePadRoute: ->
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnAssetPath('data') + '/' + 'sound-data.json'

      view = new LivePad
         appModel: @appModel
         kitCollection: @kitCollection


      @appModel.set 'view', view




   # ***************************************************************************************************
   # ***************************************************************************************************







module.exports = AppRouter
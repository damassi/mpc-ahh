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

KitSelection  = require '../views/create/components/KitSelection.coffee'
KitCollection = require '../models/KitCollection.coffee'
KitModel      = require '../models/KitModel.coffee'
BPMIndicator  = require '../views/create/components/BPMIndicator.coffee'
InstrumentSelectionPanel = require '../views/create/components/instruments/InstrumentSelectionPanel.coffee'


class AppRouter extends Backbone.Router


   routes:
      '':             'landingRoute'
      'create':       'createRoute'
      'share':        'shareRoute'

      # Component test routes
      'kit-selection': 'kitSelectionRoute'
      'bpm-indicator': 'bpmIndicatorRoute'
      'instrument-selector': 'instrumentSelectorRoute'



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
         appModel: @appModel

      @appModel.set 'view', view




module.exports = AppRouter
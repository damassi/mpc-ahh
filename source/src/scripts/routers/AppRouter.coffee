###*
 * MPC Application router
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

PubSub   = require '../utils/PubSub'
PubEvent = require '../events/PubEvent.coffee'

# TODO: The below items are only included for testing component
# modularity.  They, and their routes, should be removed in production

KitSelection = require '../views/create/components/KitSelection.coffee'


class AppRouter extends Backbone.Router


   routes:
      '':             'landingRoute'
      'create':       'createRoute'
      'share':        'shareRoute'

      # Component test routes
      'kit-selection': 'kitSelectionRoute'


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
      view = new KitSelection

      @appModel.set 'view', view



module.exports = AppRouter
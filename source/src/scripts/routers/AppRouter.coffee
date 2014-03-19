###*
 * MPC Application router
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

PubSub   = require '../utils/PubSub'
PubEvent = require '../events/PubEvent.coffee'


class AppRouter extends Backbone.Router


   routes:
      '':             'landingRoute'
      'create':       'createRoute'
      'share':        'shareRoute'


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



module.exports = AppRouter
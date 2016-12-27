###*
 * MPC Application router
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

AppConfig = require '../config/AppConfig.coffee'
PubSub    = require '../utils/PubSub'
PubEvent  = require '../events/PubEvent.coffee'

class AppRouter extends Backbone.Router

  routes:
    ''             : 'landingRoute'
    'landing'      : 'landingRoute'
    'create'       : 'createRoute'
    'share'        : 'shareRoute'
    'share/:id'    : 'shareRoute'
    'not-supported': 'notSupportedRoute'


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
    @appModel.set
      'view': @appController.shareView
      'shareId': shareId


  notSupportedRoute: ->
    @appModel.set 'view', @appController.notSupportedView


module.exports = AppRouter

###*
  MPC Application Router

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###


AppRouter = Backbone.Router.extend


   routes:
      '':            'landingRoute'
      'create':      'createRoute'
      'share':       'shareRoute'


   initialize: (options) ->
      {@appController, @appModel} = options



   landingRoute: ->
      @appModel.set 'view', @appController.landingView



   createRoute: ->
      @appModel.set 'view', @appController.createView



   shareRoute: ->
      @appModel.set 'view', @appController.shareView



module.exports = AppRouter
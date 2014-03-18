###*
  @jsx React.DOM

  Main MPC application controller / root element, which cascades down state

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###


LandingView = require './views/LandingView.coffee'
CreateView  = require './views/CreateView.coffee'
ShareView   = require './views/ShareView.coffee'


AppController = React.createBackboneClass


   # Props to listen to for state changes
   changeOptions: 'change:view'



   # REACT METHODS
   # --------------------------------------------------------------------------------


   # Initialization
   componentDidMount: ->



   # Rerenders the view whenever theres a change to the `view` state
   render: ->
      appModel = @getModel()

      View = switch appModel.get('view')
         when 'landingView' then LandingView
         when 'createView'  then CreateView
         when 'shareView'   then ShareView

      View({
         model: appModel
      })



   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



module.exports = AppController
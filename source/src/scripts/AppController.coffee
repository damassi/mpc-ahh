###*
  @jsx React.DOM

  Main MPC application controller / root element, which cascades down state

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###


LandingView = require './views/LandingView.coffee'
CreateView  = require './views/CreateView.coffee'


AppController = React.createBackboneClass


   changeOptions: 'change:view'


   componentWillMount: ->
      console.log @getModel()

      setTimeout =>
         console.log 'changing view'

         @model.set 'view', 'landingView'
      , 3000



   render: ->

      View = switch @getModel().get('view')
         when 'landingView' then LandingView
         when 'createView'  then CreateView

      `(
         View()
      )`




   # PUBLIC METHODS
   # --------------------------------------------------------------------------------


   renderLandingView: ->
      #React.renderComponent( LandingView(), document.getElementById 'wrapper' )



   renderCreateView: ->
      #React.renderComponent( CreateView(), document.getElementById 'wrapper' )



   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



module.exports = AppController
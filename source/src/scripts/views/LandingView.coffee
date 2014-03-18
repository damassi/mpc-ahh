###*
  @jsx React.DOM

  Landing view with start button

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###

ViewMixin = require './mixins/ViewMixin.coffee'


LandingView = React.createBackboneClass

   mixins: [ViewMixin]

   viewName: 'landingView'


   componentWillMount: (options) ->
      console.log 'mounting'

      console.log @getViewName()



   componentWillUnmount: (options) ->
      console.log 'unmounting....'



   render: ->
      `(
         <div className='landing-view' onClick={this.onClick}>
            START
         </div>
      )`


   onClick: ->
      window.location.hash = '#/create'


module.exports = LandingView
###*
  @jsx React.DOM

  Landing view with start button

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###

ViewMixin = require './mixins/ViewMixin.coffee'


LandingView = React.createBackboneClass


   # View superclass mixin for shared functionality
   # @type {MixIn}

   mixins: [ViewMixin]


   # View identity for handling route changes
   # @type {String}

   viewName: 'landingView'



   # Renders the view to the dom when state changes
   # @return {void}

   render: ->
      `(
         <div className='landing-view' onClick={this.onClick}>
            START
         </div>
      )`


   onClick: ->
      window.location.hash = '#/create'


module.exports = LandingView
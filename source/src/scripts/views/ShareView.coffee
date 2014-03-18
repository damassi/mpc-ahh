###*
  @jsx React.DOM

  View for sharing / displaying final beat / animation

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###

ViewMixin = require './mixins/ViewMixin.coffee'


ShareView = React.createBackboneClass


   # View superclass mixin for shared functionality
   mixins: [ViewMixin]


   # View identity for handling route changes
   viewName: 'landingView'



   # Renders the view to the dom when state changes
   # @return {void}

   render: ->
      `(
         <div className='share'>
            Share view
         </div>
      )`


module.exports = ShareView
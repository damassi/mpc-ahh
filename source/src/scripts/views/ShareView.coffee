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



   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # REACT METHODS
   # --------------------------------------------------------------------------------


   # Renders the view to the dom when state changes
   # @return {void}

   render: ->
      `(
         <div className='share'>
            Share view
         </div>
      )`


module.exports = ShareView
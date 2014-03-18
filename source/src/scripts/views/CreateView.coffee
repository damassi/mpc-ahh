###*
  @jsx React.DOM

  Primary app view which allows the user to create tracks

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###

ViewMixin = require './mixins/ViewMixin.coffee'


CreateView = React.createBackboneClass


   # View superclass mixin for shared functionality
   mixins: [ViewMixin]




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------


   onClick: ->
      window.location.hash = '#/share'



   # REACT METHODS
   # --------------------------------------------------------------------------------


   render: ->
      return `(
         <div className='create-view' onClick={this.onClick}>CREATE BEAT</div>
      )`


module.exports = CreateView
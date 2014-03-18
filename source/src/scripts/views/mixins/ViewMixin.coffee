###*
  @jsx React.DOM

  View "superclass" MixIn for shared view functionality

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###


ViewMixin =


   ###*
    * Helper method to return whether a view is visible or not
    * @return {Boolean}
   ###


   setViewName: (viewName) ->
      @viewName = viewName


   getViewName: ->
      @viewName



   getVisible: ->
      if @getModel().get('currentView') is @viewName
         return ''

      return 'hidden'



module.exports = ViewMixin
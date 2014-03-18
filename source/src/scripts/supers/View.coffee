###*
 * View superclass containing shared functionality
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   2.17.14
###


View = Backbone.View.extend



   # Initializes the view
   # @param {Object} options

   initialize: (options) ->
      _.extend @, _.defaults( options = options || @defaults, @defaults || {} )





   # Renders the view with supplied template data, or checks if template is on
   # object body
   # @param  {Function|Model} templateData
   # @return {View}

   render: (templateData) ->
      templateData = templateData || {}

      if @template

         # If model is an instance of a backbone model, then JSONify it
         if @model instanceof Backbone.Model
            templateData = @model.toJSON()

         @$el.html @template (templateData)

      @delegateEvents()
      @addEventListeners()

      @




   # Removes the view
   # @param {Object} options

   remove: (options) ->
      @removeEventListeners()
      @$el.remove()
      @undelegateEvents()





   # Shows the view
   # @param {Object} options

   show: (options) ->
      TweenMax.set @$el, { autoAlpha: 1 }




   # Hides the view
   # @param {Object} options

   hide: (options) ->
      TweenMax.set @$el,
         autoAlpha: 0
         onComplete: =>
            if options?.remove
               @remove()




   # Noop which is called on render
   # @param {Object} options

   addEventListeners: ->



   # Noop which is called on remove
   # @param {Object} options

   removeEventListeners: ->



module.exports = View
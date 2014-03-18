###*
 * View superclass containing shared functionality
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   2.17.14
###


View = Backbone.View.extend


   initialize: (options) ->
      _.extend @, _.defaults( options = options || @defaults, @defaults || {} )


   render: (templateData) ->
      templateData = templateData || {}

      if @template

         # If model is an instance of a backbone model, then JSONify it
         if @model instanceof Backbone.Model
            templateData = @model.toJSON()

         @$el.html @template (templateData)

      @delegateEvents()

      @


   remove: (options) ->
      @removeEventListeners()
      @$el.remove()
      @undelegateEvents()



   addEventListeners: ->



   removeEventListeners: ->



   show: (options) ->
      TweenMax.set @$el, { autoAlpha: 1 }



   hide: (options) ->
      TweenMax.set @$el, { autoAlpha: 0 }



module.exports = View
###*
 * View superclass containing shared functionality
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   2.17.14
###

BrowserDetect = require '../utils/BrowserDetect'

class View extends Backbone.View

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

      # Pass in desktop to render seperate mobile conditional templates
      templateData.isDesktop = if $('body').hasClass('desktop') then true else false

      @$el.html @template (templateData)

    # Add flag so view can check against stuff
    @isMobile = if $('body').hasClass('mobile') then true else false
    @isTablet = if BrowserDetect.deviceDetection().deviceType is 'tablet' then true else false

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
    return
    TweenLite.set @$el, { autoAlpha: 1 }

  # Hides the view
  # @param {Object} options

  hide: (options) ->

    TweenLite.to @$el, 0,
      autoAlpha: 0
      onComplete: =>
        if options?.remove
          @remove()

  # Noop which is called on render
  # @param {Object} options

  addEventListeners: ->

  # Removes all registered listeners
  # @param {Object} options

  removeEventListeners: ->
    @stopListening()

module.exports = View

###*
 * Share modal pop-down
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.26.14
###

AppConfig     = require '../../../../config/AppConfig.coffee'
AppEvent      = require '../../../../events/AppEvent.coffee'
View          = require '../../../../supers/View.coffee'
linksTemplate = require './templates/share-links-template.hbs'
template      = require './templates/share-modal-template.hbs'


class ShareModal extends View


   # The template
   # @type {Function}

   template: template


   # The model to share data between the view and Parse
   # @type {SharedTrackModel}

   sharedTrackModel: null



   events:
      'click .btn-link':            'onLinkBtnClick'
      'click .btn-select-service':  'onSelectYourServiceBtnClick'
      'touchend .btn-close':        'onCloseBtnClick'



   # Renders the view once the user has clicked the 'share' button
   # @param {Object} options

   render: (options) ->
      super options

      @$nameInput    = @$el.find '.input-name'
      @$titleInput   = @$el.find '.input-title'
      @$messageInput = @$el.find '.input-message'
      @$services     = @$el.find '.services'

      TweenMax.set @$el, autoAlpha: 0

      _.defer =>
         Share.init()

      @



   # Adds event listeners and waits for the shareId to update, triggering
   # the UI change related to posted to different social services

   addEventListeners: ->
      @listenTo @appModel, AppEvent.CHANGE_SHARE_ID, @onShareIdChange




   # Shows the view

   show: ->
      TweenMax.to @$el, .3,
         autoAlpha: 1



   # Hides the view

   hide: ->
      @trigger AppEvent.CLOSE_SHARE

      TweenMax.to @$el, .3,
         autoAlpha: 0


         onComplete: =>
            @remove()




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for link button clicks
   # @param {MouseEvent} event

   onLinkBtnClick: (event) =>
      console.log 'link btn'




   # Handler for model `shareId` changes which triggers the
   # rendering of the share options
   # @param {AppModel} model

   onShareIdChange: (model) =>
      shareId = model.changed.shareId

      if shareId is 'error'
         return 'Error saving track'

      @renderServiceOptions()




   # Handler for select service button clicks.  Triggers the post to
   # Parse by setting the values of the input fields.
   # @param {MouseEvent} event

   onSelectYourServiceBtnClick: (event) =>
      @sharedTrackModel.set
         'shareName':      @$nameInput.val()
         'shareTitle':     @$titleInput.val()
         'shareMessage':   @$messageInput.val()

      @trigger AppEvent.SAVE_TRACK




   # Handler for close btn clicks.  Destroys the view
   # @param {MouseEvent} event

   onCloseBtnClick: (event) =>
      @hide()





   # PRIVATE METHODS
   # --------------------------------------------------------------------------------



   # Renders out the share selection options after the track has
   # been posted to Parse

   renderServiceOptions: =>
      shareLink = window.location.origin + '/#share/' + @appModel.get 'shareId'

      @sharedTrackModel.set
         'shareLink':      shareLink
         'encodedUrl':     encodeURIComponent shareLink

      # Render out the template
      @$services.html linksTemplate @sharedTrackModel.toJSON()



module.exports = ShareModal
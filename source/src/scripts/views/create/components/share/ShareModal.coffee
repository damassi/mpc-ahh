###*
 * Share modal pop-down
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.26.14
###

AppConfig       = require '../../../../config/AppConfig.coffee'
AppEvent        = require '../../../../events/AppEvent.coffee'
View            = require '../../../../supers/View.coffee'
SpinIcon        = require '../../../../utils/SpinIcon'
previewTemplate = require './templates/share-preview-template.hbs'
template        = require './templates/share-modal-template.hbs'


class ShareModal extends View


   # The tween time for form transitions in and between
   # @type {Number}

   FORM_TWEEN_TIME: .3


   # The container element id
   # @type {String}

   className: 'container-share'


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
      #'click':                      'onCloseBtnClick'
      'click .wrapper':             'onWrapperClick'

      'keypress .input-message':    'onInputKeyPress'
      'blur .input-name':           'onInputBlur'
      'blur .input-title':          'onInputBlur'
      'blur .input-message':        'onInputBlur'

      # Mobile only
      'touchend .btn-close-share':  'onCloseBtnClick'



   # Renders the view once the user has clicked the 'share' button
   # @param {Object} options

   render: (options) ->
      super options

      @$wrapper      = @$el.find '.wrapper'
      @$form         = @$el.find '.container-form'
      @$preview      = @$el.find '.container-preview'
      @$closeBtn     = @$el.find '.btn-close'
      @$nameInput    = @$el.find '.input-name'
      @$titleInput   = @$el.find '.input-title'
      @$messageInput = @$el.find '.input-message'
      @$preloader    = @$el.find '.preloader'
      @$serviceBtn   = @$el.find '.btn-select-service'
      @$serviceText  = @$serviceBtn.find '.text'

      @spinner = new SpinIcon { target: @$preloader[0] }
      @spinner.$el.css 'margin', 'auto'
      @spinner.show()
      @$preloader.hide()

      TweenMax.set @$el,        autoAlpha: 0
      TweenMax.set @$preview,   autoAlpha: 0
      TweenMax.set @$preloader, autoAlpha: 0, scale:  0
      TweenMax.set @$closeBtn,  autoAlpha: 0, scaleX: 1.7

      if @isMobile
         TweenMax.set @$preloader, autoAlpha: 1, scale:  0, y: -12

         _.each [@$nameInput, @$titleInput, @$messageInput], ($input) ->
            $input.attr 'placeholder', ''

      @




   remove: ->
      @$backBtn?.off 'touchend', @onBackBtnClick
      @$copyBtn?.off 'touchend', @onCopyBtnClick
      super()




   # Adds event listeners and waits for the shareId to update, triggering
   # the UI change related to posted to different social services

   addEventListeners: ->
      @listenTo @appModel, AppEvent.CHANGE_SHARE_ID, @onShareIdChange




   # Shows the view

   show: ->

      if @isMobile
         TweenMax.fromTo @$el, .6, y: window.innerHeight,
            y: 0
            autoAlpha: 1
            ease: Expo.easeInOut
            onComplete: =>
               TweenMax.to @$closeBtn, .3,
                  autoAlpha: 1
                  ease: Linear.easeNone

      else

         TweenMax.fromTo @$el, @FORM_TWEEN_TIME + .1, y: 2000,
            y: 0
            autoAlpha: 1
            ease: Expo.easeOut,


            onComplete: =>

               TweenMax.to @$closeBtn, .3,
                  autoAlpha: 1
                  ease: Linear.easeNone




   # Hides the view

   hide: ->
      console.log 'here?'
      @trigger AppEvent.CLOSE_SHARE

      if @isMobile
         TweenMax.to @$el, .6,
            y: window.innerHeight
            autoAlpha: 0
            ease: Expo.easeInOut
            onComplete: =>
               @remove()


      else

         TweenMax.to @$closeBtn, .2,
            autoAlpha: 0

         TweenMax.to @$el, @FORM_TWEEN_TIME + .1,
            y: 2000
            autoAlpha: 0
            ease: Expo.easeIn
            delay: .1

            onComplete: =>
               @remove()




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for link button clicks
   # @param {MouseEvent} event

   onLinkBtnClick: (event) =>
      console.log 'link btn'




   onInputKeyPress: (event) =>
      key = event.which or event.keyCode

      if key is 13
         event.preventDefault()
         document.activeElement.blur()
         @onInputBlur()




   onInputBlur: (event) =>
       TweenMax.to $('body'), 0,
         scrollTop: 0
         scrollLeft: 0


   # Handler for model `shareId` changes which triggers the
   # rendering of the share options
   # @param {AppModel} model

   onShareIdChange: (model) =>
      shareId = model.changed.shareId

      if shareId is 'error'
         return 'Error saving track'

      if shareId is null
         return

      TweenMax.to @$preloader,   .2,
         autoAlpha: 0
         scale: 0
         ease: Back.easeIn

         onComplete: =>
            @$serviceBtn.removeClass 'no-transition'
            @$serviceBtn.attr 'style', ''
            TweenMax.to @$serviceText, .2, autoAlpha: 1

            @renderServiceOptions()




   # Handler for select service button clicks.  Triggers the post to
   # Parse by setting the values of the input fields.
   # @param {MouseEvent} event

   onSelectYourServiceBtnClick: (event) =>

      if @formValid() is false then return

      @$preloader.show()

      @$serviceBtn.addClass 'no-transition'
      TweenMax.to @$serviceBtn,  .2, backgroundColor: 'black'
      TweenMax.to @$serviceText, .2, autoAlpha: 0

      TweenMax.to @$preloader,   .2,
         autoAlpha: 1
         scale: if @isMobile then .7 else 1
         ease: Back.easeOut
         delay: .1

      @sharedTrackModel.set
         'shareName':      @$nameInput.val()
         'shareTitle':     @$titleInput.val()
         'shareMessage':   @$messageInput.val()

      @trigger AppEvent.SAVE_TRACK





   onBackBtnClick: (event) =>
      @showForm()




   # Handler for close btn clicks.  Destroys the view
   # @param {MouseEvent} event

   onCloseBtnClick: (event) =>
      @hide()




   onCopyBtnClick: (event) =>

      unless @tweeningCopyText

         @tweeningCopyText = true

         $btn   = @$copyBtn
         $text  = $btn.find '.text'

         btnHtml   = $btn.html()
         tweenTime = .2
         delay     = 1

         TweenMax.fromTo $text, tweenTime, autoAlpha: 1,
            autoAlpha: 0

            onComplete: =>

               $text.html 'COPIED!'

               TweenMax.fromTo $text, tweenTime, autoAlpha: 0,
                  autoAlpha: 1
                  delay: .1

                  onComplete: =>
                     TweenMax.fromTo $text, tweenTime, autoAlpha: 1,
                        autoAlpha: 0
                        delay: delay

                        onComplete: =>
                           @tweeningCopyText = false
                           $text.html btnHtml
                           $text.attr 'style', ''

                           TweenMax.fromTo $text, tweenTime, autoAlpha: 0,
                              autoAlpha: 1
                              delay: .1











   # Prevent background clicks from propagating down through to trigger close
   # @param {MouseEvent} event

   onWrapperClick: (event) =>
      $target = $(event.target)

      if $target.hasClass('icon')
         $target.trigger('click')

      event.stopImmediatePropagation()
      return false






   # PRIVATE METHODS
   # --------------------------------------------------------------------------------


   formValid: ->
      if @$titleInput.val() is ''
         @$titleInput.attr 'placeholder', 'Please enter title'
         return false

      if @$nameInput.val() is ''
         @$nameInput.attr 'placeholder', 'Please enter name'
         return false

      if @$messageInput.val() is ''
         @$messageInput.attr 'placeholder', 'Please enter message'
         return false

      return true



   showPreview: ->

      TweenMax.to @$form, @FORM_TWEEN_TIME,
         autoAlpha: 0
         x: -300
         ease: Expo.easeIn


         onComplete: =>

            @$form.hide()

            # Render out the template
            @$preview.html previewTemplate @sharedTrackModel.toJSON()

            @$backBtn = @$preview.find '.btn-back'
            @$copyBtn = @$preview.find '.btn-copy-url'

            TweenMax.fromTo @$preview, .4, autoAlpha: 0, x: 300,
               autoAlpha: 1
               x: 0
               ease: Expo.easeOut

            # Add in lib for copying to clipboard
            @createClipboardListeners()


            @$backBtn.on 'touchend', @onBackBtnClick
            @$copyBtn.on 'touchend', @onCopyBtnClick





   showForm: =>

      @$backBtn.off 'touchend', @onBackBtnClick
      @$copyBtn.off 'touchend', @onCopyBtnClick

      TweenMax.to @$preview, @FORM_TWEEN_TIME,
         autoAlpha: 0
         x: 300
         ease: Expo.easeIn


         onComplete: =>

            @$form.show()

            TweenMax.fromTo @$form, .4, autoAlpha: 0, x: -300,
               autoAlpha: 1
               x: 0
               ease: Expo.easeOut





   # Renders out the share selection options after the track has
   # been posted to Parse

   renderServiceOptions: =>
      shareLink = window.location.origin + '/#share/' + @appModel.get 'shareId'

      @sharedTrackModel.set
         'shareLink':      shareLink
         'encodedUrl':     encodeURIComponent shareLink

      @showPreview()
      @appModel.set 'shareId', null

      _.delay =>
         console.log $(document).find '[data-share-facebook]'
         Share.init()
      , 500




   createClipboardListeners: =>
      @clipboardClient = new ZeroClipboard( @$copyBtn )


      @clipboardClient.on 'load', (client) ->


      @clipboardClient.on 'datarequested', (client) ->
         @clipboardClient.setText(this.innerHTML)


      @clipboardClient.on 'complete', (client, args) ->
         console.log("Copied text to clipboard: " + args.text )


      @clipboardClient.on 'wrongflash noflash', ->
         ZeroClipboard.destroy()


      @clipboardClient.on 'mouseover', (client, args) =>
         @$copyBtn.addClass 'mouseover'


      @clipboardClient.on 'mouseout', (client, args) =>
         @$copyBtn.removeClass 'mouseover'


      @clipboardClient.on 'mouseup', (client, args) =>
         @onCopyBtnClick()







module.exports = ShareModal
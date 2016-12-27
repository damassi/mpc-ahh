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

  # Error message to display in button if there's a problem saving the track
  # @type {String}

  ERROR_MSG: 'Error saving track'

  # Generic share message which is posted to social media
  # @type {String}

  SHARE_MSG: 'NEED SHARE MESSAGE'

  # The container element id
  # @type {String}

  className: 'container-share-modal'

  # The template
  # @type {Function}

  template: template

  # The model to share data between the view and Parse
  # @type {SharedTrackModel}

  sharedTrackModel: null


  events:
    'click .btn-link': 'onLinkBtnClick'
    'click .btn-select-service': 'onSelectYourServiceBtnClick'
    'touchend .btn-close': 'onCloseBtnClick'
    'click': 'onCloseBtnClick'
    'click .wrapper': 'onWrapperClick'
    'click .btn-tumblr': 'onTumblrBtnClick'

    'keypress .input-name': 'onInputKeyPress'
    'blur .input-title': 'onInputBlur'
    'blur .input-name': 'onInputBlur'
    'blur .input-message': 'onInputBlur'

    # Mobile only
    'touchstart .btn-close-share': 'onCloseBtnPress'


  # Renders the view once the user has clicked the 'share' button
  # @param {Object} options

  render: (options) ->
    super options

    @$wrapper = @$el.find '.wrapper'
    @$form = @$el.find '.container-form'
    @$preview = @$el.find '.container-preview'
    @$formWrapper = @$el.find '.form-wrapper'
    @$closeBtn = @$el.find '.btn-close'
    @$nameInput = @$el.find '.input-name'
    @$titleInput = @$el.find '.input-title'
    @$messageInput = @$el.find '.input-message'
    @$preloader = @$el.find '.preloader'
    @$serviceBtn = @$el.find '.btn-select-service'
    @$serviceText = @$serviceBtn.find '.text'

    @spinner = new SpinIcon { target: @$preloader[0] }
    @spinner.$el.css 'margin', 'auto'
    @spinner.show()
    @$preloader.hide()

    TweenLite.set @$el, autoAlpha: 0
    TweenLite.set @$preview, autoAlpha: 0
    TweenLite.set @$preloader, autoAlpha: 0, scale: 0
    TweenLite.set @$closeBtn, autoAlpha: 0, scaleX: 1.7

    if @isMobile
      TweenLite.set @$preloader, autoAlpha: 1, scale: 0, y: -12

      _.each [@$nameInput, @$titleInput, @$messageInput], ($input) ->
        #$input.attr 'placeholder', ''

      _.defer =>
        centerY = (window.innerHeight * .5 - @$formWrapper.height()) + ($('.top-bar').height() * .5)

        TweenLite.set @$formWrapper, y: centerY
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
      TweenLite.fromTo @$el, .6, y: window.innerHeight,
        y: 0
        autoAlpha: 1
        ease: Expo.easeInOut
        onComplete: =>
          TweenLite.to @$closeBtn, .3,
            autoAlpha: 1
            ease: Linear.easeNone

    else
      TweenLite.fromTo @$el, @FORM_TWEEN_TIME + .1, y: 2000,
        y: 0
        autoAlpha: 1
        ease: Expo.easeOut,

        onComplete: =>
          TweenLite.to @$closeBtn, .3,
            autoAlpha: 1
            ease: Linear.easeNone


  # Hides the view

  hide: ->
    @trigger AppEvent.CLOSE_SHARE

    if @isMobile
      TweenLite.to @$el, .6,
        y: window.innerHeight
        autoAlpha: 0
        ease: Expo.easeInOut
        onComplete: =>
          @remove()

    else
      TweenLite.to @$closeBtn, .2,
        autoAlpha: 0

      TweenLite.to @$el, @FORM_TWEEN_TIME + .1,
        y: 2000
        autoAlpha: 0
        ease: Expo.easeIn
        delay: .1

        onComplete: =>
          @remove()


  # Event handlers
  # --------------

  # Handler for link button clicks
  # @param {MouseEvent} event

  onLinkBtnClick: (event) =>
    console.log 'link btn'


  onInputKeyPress: (event) =>
    key = event.which or event.keyCode

    # ENTER key
    if key is 13
      event.preventDefault()
      document.activeElement.blur()
      @onInputBlur()
      @onSelectYourServiceBtnClick()


  onInputBlur: (event) =>
    TweenLite.to $('body'), 0,
      scrollTop: 0
      scrollLeft: 0


  # Handler for model `shareId` changes which triggers the
  # rendering of the share options
  # @param {AppModel} model

  onShareIdChange: (model) =>
    shareId = model.changed.shareId

    if shareId is null
      return

    TweenLite.to @$preloader, .2,
      autoAlpha: 0
      scale: 0
      ease: Back.easeIn

      onComplete: =>
        @$serviceBtn.removeClass 'no-transition'
        @$serviceBtn.attr 'style', ''

        if shareId is 'error'
          @$serviceText.text 'Error saving track.'

          _.delay =>
            @hide()
          , 2000

        else
          @renderServiceOptions()

        TweenLite.to @$serviceText, .2, autoAlpha: 1


  # Handler for select service button clicks.  Triggers the post to
  # Parse by setting the values of the input fields.
  # @param {MouseEvent} event

  onSelectYourServiceBtnClick: (event) =>
    if @formValid() is false then return

    @$preloader.show()
    @$serviceBtn.addClass 'no-transition'
    TweenLite.to @$serviceBtn, .2, backgroundColor: 'black'
    TweenLite.to @$serviceText, .2, autoAlpha: 0

    TweenLite.to @$preloader, .2,
      autoAlpha: 1
      scale: if @isMobile then .7 else 1
      ease: Back.easeOut
      delay: .1

    @sharedTrackModel.set
      'shareName': @$nameInput.val()
      'shareTitle': @$titleInput.val()
      'shareMessage': @SHARE_MSG

    @trigger AppEvent.SAVE_TRACK


  onBackBtnClick: (event) =>
    @showForm()


  # Handler for close btn press.
  # @param {MouseEvent} event

  onCloseBtnPress: (event) =>
    $(event.currentTarget).addClass 'press'
    @hide()


  # Handler for close btn clicks.  Destroys the view
  # @param {MouseEvent} event

  onCloseBtnClick: (event) =>
    $(event.currentTarget).removeClass 'press'
    @hide()


  onCopyBtnClick: (event) =>
    unless @tweeningCopyText
      @tweeningCopyText = true

      $btn = @$copyBtn
      $text = $btn.find '.text'

      btnHtml = $btn.html()
      tweenTime = .2
      delay = 1

      TweenLite.fromTo $text, tweenTime, autoAlpha: 1,
        autoAlpha: 0

        onComplete: =>
          $text.html 'COPIED!'

          TweenLite.fromTo $text, tweenTime, autoAlpha: 0,
            autoAlpha: 1
            delay: .1

            onComplete: =>
              TweenLite.fromTo $text, tweenTime, autoAlpha: 1,
                autoAlpha: 0
                delay: delay

                onComplete: =>
                  @tweeningCopyText = false
                  $text.html btnHtml
                  $text.attr 'style', ''

                  TweenLite.fromTo $text, tweenTime, autoAlpha: 0,
                    autoAlpha: 1
                    delay: .1


  onTumblrBtnClick: (event) =>
    url = 'http://www.tumblr.com/share/link'
    url += '?url=' + encodeURIComponent(@shareData.shareLink)
    url += '&name=' +document.title
    url += '&description=' +encodeURIComponent(@SHARE_MSG)

    window.open(url, 'share', 'width=450,height=430')


  # Prevent background clicks from propagating down through to trigger close
  # @param {MouseEvent} event

  onWrapperClick: (event) =>
    $target = $(event.target)

    if $target.hasClass('icon')
      $target.trigger('click')

    event.stopImmediatePropagation()
    return false


  # Private
  # -------

  formValid: ->
    if @$titleInput.val() is ''
      @$titleInput.attr 'placeholder', 'Please enter title'
      return false

    if @$nameInput.val() is ''
      @$nameInput.attr 'placeholder', 'Please enter name'
      return false

    return true


  showPreview: ->
    TweenLite.to @$form, @FORM_TWEEN_TIME,
      autoAlpha: 0
      x: -300
      ease: Expo.easeIn

      onComplete: =>
        @$form.hide()

        data = @sharedTrackModel.toJSON()
        data.isDesktop = ! @isMobile

        # Render preview template and share then display
        @$preview.html previewTemplate data

        @$backBtn = @$preview.find '.btn-back'
        @$copyBtn = @$preview.find '.btn-copy-url'

        TweenLite.fromTo @$preview, .4, autoAlpha: 0, x: 300,
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

    TweenLite.to @$preview, @FORM_TWEEN_TIME,
      autoAlpha: 0
      x: 300
      ease: Expo.easeIn

      onComplete: =>
        @$form.show()

        TweenLite.fromTo @$form, .4, autoAlpha: 0, x: -300,
          autoAlpha: 1
          x: 0
          ease: Expo.easeOut


  # Renders out the share selection options after the track has
  # been posted to Parse

  renderServiceOptions: =>
    shareLink = window.location.origin + '/#share/' + @appModel.get 'shareId'
    @sharedTrackModel.set 'shareLink', shareLink
    @showPreview()
    @shareData = @sharedTrackModel.toJSON()
    @appModel.set 'shareId', null

    $.getScript '//platform.tumblr.com/v1/share.js'

    _.delay =>
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

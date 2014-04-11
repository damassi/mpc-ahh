###*
 * Create view which the user can build beats within
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

PubSub                  = require '../../utils/PubSub'
View                    = require '../../supers/View.coffee'
AppEvent                = require '../../events/AppEvent.coffee'
PubEvent                = require '../../events/PubEvent.coffee'
SharedTrackModel        = require '../../models/SharedTrackModel.coffee'
KitSelector             = require './components/KitSelector.coffee'
PlayPauseBtn            = require './components/PlayPauseBtn.coffee'
Toggle                  = require './components/Toggle.coffee'
PatternSelector         = require './components/PatternSelector.coffee'
InstrumentSelectorPanel = require './components/instruments/InstrumentSelectorPanel.coffee'
Sequencer               = require './components/sequencer/Sequencer.coffee'
LivePad                 = require './components/pad/LivePad.coffee'
ShareModal              = require './components/share/ShareModal.coffee'
BPMIndicator            = require './components/BPMIndicator.coffee'
template                = require './templates/create-template.hbs'


class CreateView extends View


   # The class name for the class
   # @type {String}

   className: 'container-create'


   # The template
   # @type {Function}

   template: template



   events:
      'touchend .btn-share':    'onShareBtnClick'
      'touchend .btn-export':   'onExportBtnClick'
      'touchend .btn-clear':    'onResetBtnClick'
      'touchend .btn-jam-live': 'onJamLiveBtnClick' # Mobile only




   # Renders the view and all of the individual components.  Also checks
   # for a `shareId` on the AppModel and hides elements appropriately
   # @param {Object} options

   render: (options) ->
      super options

      @playPauseBtn = new PlayPauseBtn
         appModel: @appModel

      @toggle = new Toggle
         appModel: @appModel

      @$body = $('body')

      @$mainContainer            = @$body.find '#container-main'
      @$bottomContainer          = @$body.find '#container-bottom'
      @$wrapper                  = @$el.find '.wrapper'
      @$kitSelectorContainer     = @$el.find '.container-kit-selector'
      @$toggleContainer          = @$el.find '.container-toggle'
      @$playPauseContainer       = @$el.find '.container-play-pause'
      @$sequencerContainer       = @$el.find '.container-sequencer'
      @$livePadContainer         = @$el.find '.container-live-pad'
      @$patternSelectorContainer = @$el.find '.column-2'
      @$bpmContainer             = @$el.find '.column-3'

      @$instrumentSelector     = @$sequencerContainer.find '.instrument-selector'
      @$sequencer              = @$sequencerContainer.find '.sequencer'
      @$livePad                = @$sequencerContainer.find '.live-pad'
      @$patternSelector        = @$sequencerContainer.find '.pattern-selector'
      @$bpm                    = @$sequencerContainer.find '.bpm'
      @$shareBtn               = @$sequencerContainer.find '.btn-share'

      @$playPauseContainer.html  @playPauseBtn.render().el

      # Fix viewport if on Tablet
      TweenMax.to @$body, 0,
         scrollTop:  0
         scrollLeft: 0

      # No toggle on mobile
      unless @isMobile
         @$toggleContainer.html @toggle.render().el

      # Build out rows for new layout
      if @isMobile

         # Pause btn, BPM, Share btn
         @$row1 = @$el.find '.row-1'

         # Kit selector, pattern selector
         @$row2 = @$el.find '.row-2'

         # Instrument Selector, Livepad toggle
         @$row3 = @$el.find '.row-3'

         # Sequencer
         @$row4 = @$el.find '.row-4'

         @renderInstrumentSelector()

         _.defer =>
            @appModel.set 'showSequencer', true
            @instrumentSelector.instrumentViews[0].onClick()


      TweenMax.set @$bottomContainer, y: 300

      @renderKitSelector()
      @renderSequencer()
      @renderLivePad()
      @renderPatternSelector()
      @renderBPM()

      @$kitSelector = @$el.find '.kit-selector'

      @




   # Show the view and open the sequencer

   show: =>
      @showUI()
      @appModel.set 'showSequencer', true

      if @isMobile
         TweenMax.to $('.top-bar'), .3, autoAlpha: 1

         TweenMax.fromTo @$mainContainer, .4, y: 1000,
            immediateRender: true
            y: 0
            ease: Expo.easeOut
            delay: 1




   # Hide the view and remove it from the DOM

   hide: (options) =>
      TweenMax.fromTo @$el, .3, autoAlpha: 1,
         autoAlpha: 0

      @kitSelector.hide()

      if @isMobile
         TweenMax.to $('.top-bar'), .3, autoAlpha: 0

      if @$bottomContainer.length

         TweenMax.fromTo @$bottomContainer, .4, y: 0,
            y: 300
            ease: Expo.easeOut
            onComplete: =>

               @appModel.set
                  'showSequencer': null
                  'showPad': null

               if options?.remove
                  @remove()




   # Desktop only.  Triggered when showing / hiding view or expanding
   # visualization on share

   showUI: ->
      @kitSelector.show()

      TweenMax.fromTo @$el, .3, autoAlpha: 0,
         autoAlpha: 1
         delay: .3

      TweenMax.fromTo @$bottomContainer, .4, y: 300,
         autoAlpha: 1
         y: 0
         ease: Expo.easeOut
         delay: .3




   # Desktop only.  Triggered when showing / hiding view or expanding
   # visualization on share

   hideUI: ->
      @kitSelector.hide()

      TweenMax.fromTo @$el, .3, autoAlpha: 1,
         autoAlpha: 0

      TweenMax.fromTo @$bottomContainer, .4, y: 0,
         y: 300
         ease: Expo.easeOut




   # Removes the view

   remove: ->
      @playPauseBtn.remove()
      @playPauseBtn = null

      @toggle.remove()
      @toggle = null

      @kitSelector.remove()
      @kitSelector = null

      @sequencer.remove()
      @sequencer = null

      @livePad.remove()
      @livePad = null

      @patternSelector.remove()
      @patternSelector = null

      @bpm.remove()
      @bpm = null

      @instrumentSelector?.remove()
      @instrumentSelector = null

      @shareModal?.remove()
      @shareModal = null

      @appModel.set 'playing', false

      $('.container-kit-selector').remove()

      super()



   # Adds listeners related to exporting the track pattern

   addEventListeners: ->
      @listenTo @appModel, AppEvent.CHANGE_SHOW_SEQUENCER, @onShowSequencerChange




   # Removes listeners

   removeEventListeners: ->
      super()




   # Renders the kit selector carousel

   renderKitSelector: ->
      @kitSelector = new KitSelector
         appModel: @appModel
         kitCollection: @kitCollection

      html = @kitSelector.render().el

      if @isMobile
         @$row2.append html
      else
         @$mainContainer.prepend html




   # Renders the instrument selector which, on desktop, does nothing, but on
   # mobile focuses the track within the view

   renderInstrumentSelector: ->
      @instrumentSelector = new InstrumentSelectorPanel
         appModel: @appModel
         kitCollection: @kitCollection

      @$row3.prepend @instrumentSelector.render().el




   # Renders out the pattern square sequencer

   renderSequencer: ->
      @sequencer = new Sequencer
         appModel: @appModel
         kitCollection: @kitCollection
         collection: @kitCollection.at(0).get('instruments')

      html = @sequencer.render().el

      if @isMobile
         @$row4.html html
      else
         @$sequencer.prepend html

      @listenTo @sequencer, PubEvent.BEAT, @onBeat




   # Renders out the live pad player

   renderLivePad: ->
      @livePad = new LivePad
         appModel: @appModel
         kitCollection: @kitCollection

      html = @livePad.render().el

      if @isMobile
         @$livePadContainer.html html
      else
         @$livePad.html html




   # Render the pre-populated pattern selector

   renderPatternSelector: ->
      @patternSelector = new PatternSelector
         appModel: @appModel
         sequencer: @sequencer

      html = @patternSelector.render().el

      if @isMobile
         @$row2.append html
      else
         @$patternSelector.html html




   # Renders out the BPM interface for controlling tempo

   renderBPM: ->
      @bpm = new BPMIndicator
         appModel: @appModel

      html = @bpm.render().el

      if @isMobile
         @$row1.append html
      else
         @$bpm.html html




   # Renders out the share modal which then posts to Parse

   renderShareModal: ->
      @shareModal = new ShareModal
         appModel: @appModel
         sharedTrackModel: @sharedTrackModel

      if @isMobile
         @$mainContainer.append @shareModal.render().el

         # Slide main container up and then open share
         TweenMax.to @$sequencerContainer, .6,
            y: -window.innerHeight
            ease: Expo.easeInOut

      else
         @$body.prepend @shareModal.render().el

      @shareModal.show()

      @listenTo @shareModal, AppEvent.SAVE_TRACK,  @onSaveTrack
      @listenTo @shareModal, AppEvent.CLOSE_SHARE, @onCloseShare







   # --------------------------------------------------------------------------------
   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for beats which are piped down from PatternSquare to VisualizationView
   # @param {Object} params Which consist of PatternSquareModel for handling velocity, etc

   onBeat: (params) =>
      @trigger PubEvent.BEAT, params





   # Handler for saving, sharing and posting a track

   onSaveTrack: =>
      @trigger AppEvent.SAVE_TRACK, sharedTrackModel: @sharedTrackModel





   # Handler for share button clicks.  Creates the modal and prompts the user
   # to enter info related to their creation
   # @param {MouseEvent} event

   onShareBtnClick: (event) =>
      @trigger AppEvent.OPEN_SHARE
      @renderShareModal()




   # Handler for resetting the pattern track to default, blank state
   # @param {MouseEvent|TouchEvent} event

   onResetBtnClick: (event) =>
      @appModel.set
         'bpm':              320
         'sharedTrackModel': null

      # Remove preset if currently selected
      @patternSelector.$el.find('.selected').removeClass 'selected'
      @sequencer.renderTracks()





   # Handler for close btn event on the share modal, as dispatched from the ShareModal
   # @param {MouseEvent} event

   onCloseShare: (event) =>
      @trigger AppEvent.CLOSE_SHARE
      @stopListening @shareModal

      if @isMobile
         TweenMax.to @$sequencerContainer, .6,
            y: 0
            ease: Expo.easeInOut




   # Handler for showing sequencer / pad.  If seq is false, then pad is shown
   # @param {AppModel} model

   onShowSequencerChange: (model) =>
      if model.changed.showSequencer
         @showSequencer()

      else
         @showLivePad()




   # MOBILE ONLY.  Handler for showing the live pad from mobile view
   # @param {TouchEvent} event

   onJamLiveBtnClick: (event) =>
      @appModel.set 'showSequencer', false





   # --------------------------------------------------------------------------------
   # PRIVATE METHODS
   # --------------------------------------------------------------------------------



   # Swaps the live pad out with the sequencer

   showSequencer: ->

      tweenTime = .6

      if @isMobile

         TweenMax.to @$sequencerContainer, tweenTime,
            x: 0
            autoAlpha: 1
            ease: Expo.easeInOut

         TweenMax.to @$livePadContainer, tweenTime,
            x: window.innerWidth
            autoAlpha: 0
            ease: Expo.easeInOut


      else

         TweenMax.to @$sequencer, tweenTime,
            autoAlpha: 1
            x: 0
            ease: Expo.easeInOut

         TweenMax.to @$livePad, tweenTime,
            autoAlpha: 0
            x: 2000
            ease: Expo.easeInOut



   # Swaps the sequencer area out with the live pad

   showLivePad: ->

      tweenTime = .6

      if @isMobile

         TweenMax.to @$sequencerContainer, tweenTime,
            autoAlpha: 0
            x: -window.innerWidth
            ease: Expo.easeInOut

         TweenMax.fromTo @$livePadContainer, tweenTime, x: window.innerWidth,
            autoAlpha: 1
            x: 0
            ease: Expo.easeInOut

      else

         TweenMax.to @$sequencer, tweenTime,
            autoAlpha: 0
            x: -2000
            ease: Expo.easeInOut


         TweenMax.to @$livePad, tweenTime,
            autoAlpha: 1
            x: 0
            ease: Expo.easeInOut





module.exports = CreateView
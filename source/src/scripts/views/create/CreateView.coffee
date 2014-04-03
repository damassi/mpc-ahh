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


   className: 'container-create'

   # The template
   # @type {Function}

   template: template


   events:
      'touchend .btn-share':  'onShareBtnClick'
      'touchend .btn-export': 'onExportBtnClick'


   initialize: (options) ->
      super options



   # Renders the view and all of the individual components.  Also checks
   # for a `shareId` on the AppModel and hides elements appropriately
   # @param {Object} options

   render: (options) ->
      super options

      @playPauseBtn = new PlayPauseBtn
         appModel: @appModel

      @toggle = new Toggle
         appModel: @appModel

      @$mainContainer            = $('body').find '#container-main'
      @$bottomContainer          = $('body').find '#container-bottom'
      @$wrapper                  = @$el.find '.wrapper'
      @$kitSelectorContainer     = @$el.find '.container-kit-selector'
      @$toggleContainer          = @$el.find '.container-toggle'
      @$playPauseContainer       = @$el.find '.container-play-pause'
      @$sequencerContainer       = @$el.find '.container-sequencer'
      @$patternSelectorContainer = @$el.find '.column-2'
      @$bpmContainer             = @$el.find '.column-3'

      @$instrumentSelector     = @$sequencerContainer.find '.instrument-selector'
      @$sequencer              = @$sequencerContainer.find '.sequencer'
      @$livePad                = @$sequencerContainer.find '.live-pad'
      @$patternSelector        = @$sequencerContainer.find '.pattern-selector'
      @$bpm                    = @$sequencerContainer.find '.bpm'
      @$shareBtn               = @$sequencerContainer.find '.btn-share'

      @$toggleContainer.html     @toggle.render().el
      @$playPauseContainer.html  @playPauseBtn.render().el

      TweenMax.set @$bottomContainer, y: 300

      @renderKitSelector()
      @renderSequencer()
      @renderLivePad()
      @renderPatternSelector()
      @renderBPM()


      @$kitSelector = @$el.find '.kit-selector'

      @




   show: =>
      TweenMax.fromTo @$el, .3, autoAlpha: 0,
         autoAlpha: 1
         delay: .3

      @kitSelector.show()

      @showSequencer()
      _.defer =>
         @toggle.$stepsBtn.trigger 'touchend'

      @appModel.set 'showSequencer', true

      TweenMax.fromTo @$bottomContainer, .4, y: 300,
         autoAlpha: 1
         y: 0
         ease: Expo.easeOut
         delay: .3




   hide: (options) =>
      TweenMax.fromTo @$el, .3, autoAlpha: 1,
         autoAlpha: 0

      @kitSelector.hide()


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

      # Reset model if leaving the view but keep the view prop
      #@resetModel()

      super()



   # Adds listeners related to exporting the track pattern

   addEventListeners: ->
      @listenTo @appModel, AppEvent.CHANGE_SHOW_SEQUENCER, @onShowSequencerChange
      @listenTo @appModel, AppEvent.CHANGE_SHOW_PAD,       @onShowPadChange




   # Removes listeners

   removeEventListeners: ->
      super()




   # Renders the kit selector carousel

   renderKitSelector: ->
      @kitSelector = new KitSelector
         appModel: @appModel
         kitCollection: @kitCollection

      @$mainContainer.prepend @kitSelector.render().el




   # Renders the instrument selector which, on desktop, does nothing, but on
   # mobile focuses the track within the view

   renderInstrumentSelector: ->
      @instrumentSelector = new InstrumentSelectorPanel
         appModel: @appModel
         kitCollection: @kitCollection

      @$instrumentSelector.html @instrumentSelector.render().el




   # Renders out the pattern square sequencer

   renderSequencer: ->
      @sequencer = new Sequencer
         appModel: @appModel
         collection: @kitCollection.at(0).get('instruments')

      @$sequencer.prepend @sequencer.render().el




   # Renders out the live pad player

   renderLivePad: ->
      @livePad = new LivePad
         appModel: @appModel
         kitCollection: @kitCollection

      @$livePad.html @livePad.render().el




   # Render the pre-populated pattern selector

   renderPatternSelector: ->
      @patternSelector = new PatternSelector
         appModel: @appModel
         sequencer: @sequencer

      @$patternSelector.html @patternSelector.render().el




   # Renders out the BPM interface for controlling tempo

   renderBPM: ->
      @bpm = new BPMIndicator
         appModel: @appModel

      @$bpm.html @bpm.render().el




   # Renders out the share modal which then posts to Parse

   renderShareModal: ->
      @shareModal = new ShareModal
         appModel: @appModel
         sharedTrackModel: @sharedTrackModel

      $('body').prepend @shareModal.render().el

      @shareModal.show()

      @listenTo @shareModal, AppEvent.SAVE_TRACK,  @onSaveTrack
      @listenTo @shareModal, AppEvent.CLOSE_SHARE, @onCloseShare





   resetModel: ->
      defaults = @appModel.defaults
      defaults.view = @appModel.get 'view'
      @appModel.set(defaults)




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for saving, sharing and posting a track

   onSaveTrack: =>
      @trigger AppEvent.SAVE_TRACK, sharedTrackModel: @sharedTrackModel





   # Handler for share button clicks.  Creates the modal and prompts the user
   # to enter info related to their creation
   # @param {MouseEvent} event

   onShareBtnClick: (event) =>
      @trigger AppEvent.OPEN_SHARE
      @renderShareModal()




   # Handler for close btn event on the share modal, as dispatched from the ShareModal
   # @param {MouseEvent} event

   onCloseShare: (event) =>
      @trigger AppEvent.CLOSE_SHARE
      @stopListening @shareModal





   onShowSequencerChange: (model) =>
      if model.changed.showSequencer
         @showSequencer()





   onShowPadChange: (model) =>
      if model.changed.showPad
         @showLivePad()



   # PRIVATE METHODS
   # --------------------------------------------------------------------------------



   # Swaps the live pad out with the sequencer

   showSequencer: ->
      tweenTime = .6

      @$sequencer.removeClass 'hide'

      TweenMax.to @$sequencer, tweenTime,
         autoAlpha: 1
         x: 0
         ease: Expo.easeInOut
         #delay: .2

      TweenMax.to @$livePad, tweenTime,
         autoAlpha: 0
         x: 2000
         ease: Expo.easeInOut
         onComplete: =>
            #@$livePad.addClass 'hide'



   # Swaps the sequencer area out with the live pad

   showLivePad: ->
      tweenTime = .6

      @$livePad.removeClass 'hide'

      TweenMax.to @$sequencer, tweenTime,
         autoAlpha: 0
         x: -2000
         ease: Expo.easeInOut
         onComplete: =>
            #@$sequencer.addClass 'hide'


      TweenMax.to @$livePad, tweenTime,
         autoAlpha: 1
         x: 0
         ease: Expo.easeInOut





module.exports = CreateView
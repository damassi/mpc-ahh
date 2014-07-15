###*
 * Share the user created beat
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

PubSub           = require '../../utils/PubSub'
PubEvent         = require '../../events/PubEvent.coffee'
SharedTrackModel = require '../../models/SharedTrackModel.coffee'
CreateView       = require '../create/CreateView.coffee'
PlayPauseBtn     = require '../create/components/PlayPauseBtn.coffee'
Sequencer        = require '../create/components/sequencer/Sequencer.coffee'
View             = require '../../supers/View.coffee'
template         = require './templates/share-template.hbs'


class ShareView extends View


   # @type {String}

   className: 'container-share'


   # The template
   # @type {Function}

   template: template


   # "Hidden" view which allows for playback of shared audio
   # @type {CreateView}

   createView: null



   events:
      'mouseover .btn-start':  'onMouseOver'
      'mouseout  .btn-start':  'onMouseOut'
      'touchend  .btn-start':  'onStartBtnClick'



   # Renders the view
   # @param {Object} options

   render: (options) ->
      super options


      @$textContainer = @$el.find '.container-text'
      @$mainContainer = $('#container-main')

      @$name     = @$el.find '.name'
      @$title    = @$el.find '.title'
      @$message  = @$el.find '.message'
      @$playBtn  = @$el.find '.btn-play'
      @$startBtn = @$el.find '.btn-start'

      TweenLite.set @$textContainer, y: -300,  autoAlpha: 0
      TweenLite.set @$startBtn,      y:  300,  autoAlpha: 0

      @$mainContainer.show()

      @createView = new CreateView
         appModel: @appModel
         sharedTrackModel: @sharedTrackModel
         kitCollection: @kitCollection

      if @isMobile
         @playPauseBtn = new PlayPauseBtn
            appModel: @appModel

         @$el.find('.container-btn').append @playPauseBtn.render().el
         @playPauseBtn.$el.find('.label-btn').hide()
         TweenLite.set @playPauseBtn.$el, scale: 1, autoAlpha: 0

      @$el.append @createView.render().el
      @createView.$el.hide()
      @createView.kitSelector.remove()

      @importTrack @appModel.get('shareId')

      @




   # Show the view, and hide the message if on mobile

   show: ->
      delay = .5

      if @isMobile

         @$message.hide()

         TweenLite.fromTo @$textContainer, .4, y: -300, autoAlpha: 0,
            autoAlpha: 1
            y: 10
            ease: Expo.easeOut,
            delay: delay + .3

         TweenLite.fromTo @$startBtn, .4, y: 1000, autoAlpha: 0,
            autoAlpha: 1
            y: 160
            ease: Expo.easeOut,
            delay: delay + .3
            onComplete: =>
               TweenLite.to @playPauseBtn.$el, .3,
                  autoAlpha: 1
                  ease: Back.easeOut
                  delay: 0

      else


         TweenLite.fromTo @$textContainer, .4, y: -300, autoAlpha: 0,
            autoAlpha: 1
            y: 0
            ease: Expo.easeOut,
            delay: delay + .3

         TweenLite.fromTo @$startBtn, .4, y: 300, autoAlpha: 0,
            autoAlpha: 1
            y: -80
            ease: Expo.easeOut,
            delay: delay + .3




   # Hide the view

   hide: (options) ->

      if @isMobile

         TweenLite.to @$el, .4, autoAlpha: 0,
            onComplete: =>
               if options?.remove
                  _.delay =>
                     @remove()
                  , 300


      else

         TweenLite.to @$startBtn, .3,
            scale: 0
            autoAlpha: 0
            ease: Back.easeIn

         TweenLite.to @$el, .4, autoAlpha: 0,
            onComplete: =>
               if options?.remove

                  _.delay =>
                     @remove()
                  , 300




   # Adds listeners related to sharing tracks.  When changed, the view
   # is populated with the users shared data

   addEventListeners: ->
      @listenTo @appModel, 'change:sharedTrackModel', @onSharedTrackModelChange





   # Import the shared track by requesting the data from parse
   # Once imported

   importTrack: (shareId, callback) =>

      query = new Parse.Query SharedTrackModel

      # Create request to fetch data from the Parse DB
      query.get shareId,

         error: (object, error) =>
            console.error object, error


         # Handler for success events.  Returns the saved model which is then
         # dispatched, via PubSub, to the Sequencer view for playback and render
         # @param {SharedTrackModel}

         success: (sharedTrackModel) =>

            console.log JSON.stringify sharedTrackModel.toJSON()

            @appModel.set
               'bpm':              sharedTrackModel.get 'bpm'
               'sharedTrackModel': sharedTrackModel
               'shareId':          null

            @listenTo @createView, PubEvent.BEAT, @onBeat

            # Import into sequencer
            @createView.sequencer.importTrack

               kitType:             sharedTrackModel.get 'kitType'
               instruments:         sharedTrackModel.get 'instruments'
               patternSquareGroups: sharedTrackModel.get 'patternSquareGroups'


               # Handler for callbacks once the track has been imported and
               # rendered.  Displays the Share view and begins playback
               # @param {Object} response

               callback: (response) ->




   # Handler for when the Parse data is returned from the service
   # @param {SharedTrackModel} model

   onSharedTrackModelChange: (model) =>
      sharedTrackModel = model.changed.sharedTrackModel

      # Check against resets
      unless sharedTrackModel is null

         @$name.html    sharedTrackModel.get 'shareName'
         @$title.html   sharedTrackModel.get 'shareTitle'
         @$message.html sharedTrackModel.get 'shareMessage'

         TweenLite.set @$el, autoAlpha: 1

         @appModel.set 'playing', (if @isMobile then false else true)

         @show()




   # Handler for start button clicks, which sends the user to the CreateView.
   # Resets the AppModel to its default state
   # @param {MouseEvent} event

   onStartBtnClick: (event) ->
      @removeEventListeners()
      @createView.remove()
      $('.container-kit-selector').remove()

      @appModel.set
         'bpm':              120
         'sharedTrackModel': null
         'showSequencer':    false

      window.location.hash = 'create'




   # Handler for mouse events on desktop
   # @param {MouseEvent} event

   onMouseOver: (event) =>
      TweenLite.to @$startBtn, .2,
         border: '3px solid black'
         scale: 1.1
         color: 'black'




   # Handler for mouse events on desktop
   # @param {MouseEvent} event

   onMouseOut: (event) =>
      TweenLite.to @$startBtn, .2,
         border: '3px solid white'
         scale: 1
         color: 'white'




   onBeat: (params) =>
      @trigger PubEvent.BEAT, params




module.exports = ShareView
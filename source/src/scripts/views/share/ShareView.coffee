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
Sequencer        = require '../create/components/sequencer/Sequencer.coffee'
View             = require '../../supers/View.coffee'
template         = require './templates/share-template.hbs'


class ShareView extends View


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

      @$name     = @$el.find '.name'
      @$title    = @$el.find '.title'
      @$message  = @$el.find '.message'
      @$playBtn  = @$el.find '.btn-play'
      @$startBtn = @$el.find '.btn-start'

      TweenMax.set @$textContainer, y: -300, autoAlpha: 0
      TweenMax.set @$startBtn,      y:  300, autoAlpha: 0

      @createView = new CreateView
         appModel: @appModel
         sharedTrackModel: @sharedTrackModel
         kitCollection: @kitCollection

      @$el.append @createView.render().el
      @createView.$el.hide()
      @createView.kitSelector.remove()

      @importTrack @appModel.get('shareId')

      @



   show: ->

      delay = .5

      TweenMax.fromTo @$textContainer, .4, y: -300, autoAlpha: 0,
         autoAlpha: 1
         y: 0
         ease: Expo.easeOut,
         delay: delay + .3

      TweenMax.fromTo @$startBtn, .4, y: 300, autoAlpha: 0,
         autoAlpha: 1
         y: 0
         ease: Expo.easeOut,
         delay: delay + .3




   hide: (options) ->
      TweenMax.to @$startBtn, .3,
         scale: 0
         autoAlpha: 0
         ease: Back.easeIn

      TweenMax.to @$el, .4,
         autoAlpha: 0

         onComplete: =>
            if options?.remove

               _.delay =>
                  @remove()
               , 300



   remove: ->
      super()




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

            console.log sharedTrackModel.get 'kitType'

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

         TweenMax.set @$el, autoAlpha: 1

         @appModel.set 'playing', true

         @show()




   onStartBtnClick: (event) ->
      @removeEventListeners()
      @createView.remove()
      $('.container-kit-selector').remove()

      window.location.hash = 'create'
      #@hide remove: true




   onMouseOver: (event) =>
      TweenMax.to @$startBtn, .2,
         border: '3px solid black'
         scale: 1.1
         color: 'black'




   onMouseOut: (event) =>
      TweenMax.to @$startBtn, .2,
         border: '3px solid white'
         scale: 1
         color: 'white'



module.exports = ShareView
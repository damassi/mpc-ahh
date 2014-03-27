###*
 * Share the user created beat
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

CreateView = require '../create/CreateView.coffee'
View       = require '../../supers/View.coffee'
template   = require './templates/share-template.hbs'


class ShareView extends View


   # The template
   # @type {Function}

   template: template


   # "Hidden" view which allows for playback of shared audio
   # @type {CreateView}

   createView: null


   # Renders the view
   # @param {Object} options

   render: (options) ->
      super options

      @$name    = @$el.find '.name'
      @$title   = @$el.find '.title'
      @$playBtn = @$el.find '.btn-play'

      @createView = new CreateView
         appModel: @appModel
         kitCollection: @kitCollection

      @$el.append @createView.render().el

      @




   # Removes the view

   remove: ->
      @createView.remove()
      super()



   # Adds listeners related to sharing tracks.  When changed, the view
   # is populated with the users shared data

   addEventListeners: ->
      @listenTo @appModel, 'change:sharedTrackModel', @onSharedTrackModelChange




   # Handler for when the Parse data is returned from the service
   # @param {SharedTrackModel} model

   onSharedTrackModelChange: (model) =>
      sharedTrackModel = model.changed.sharedTrackModel

      console.log sharedTrackModel

      @$name.html sharedTrackModel.get 'shareName'
      @$title.html sharedTrackModel.get 'shareTitle'



module.exports = ShareView
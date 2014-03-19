###*
 * Kit selector for switching between drum-kit sounds
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

AppEvent = require '../../../events/AppEvent.coffee'
View     = require '../../../supers/View.coffee'
template = require './templates/kit-selection-template.hbs'


class KitSelection extends View


   # @type {AppModel}
   appModel: null


   # @type {KitCollection}
   kitCollection: null


   # The current kit
   # @type {KitModel}

   kitModel: null


   # @type {Function}
   template: template



   events:
      'touchend .btn-left':   'onLeftBtnClick'
      'touchend .btn-right':  'onRightBtnClick'



   initialize: (options) ->
      super options




   render: (options) ->
      super options

      @$kitLabel = @$el.find '.label-kit'

      # Set the appModel if arriving for the first time
      if @appModel.get('kitModel') is null
         @appModel.set
            'kitModel': @kitCollection.at(0)

      # Update the button text with the current kit
      @$kitLabel.text @appModel.get('kitModel').get 'label'

      @



   addEventListeners: ->
      @listenTo @appModel, AppEvent.CHANGE_KIT, @onChangeKit




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   onLeftBtnClick: (event) ->
      @appModel.set 'kitModel', @kitCollection.previousKit()





   onRightBtnClick: (event) ->
      @appModel.set 'kitModel', @kitCollection.nextKit()





   onChangeKit: (model) ->
      @kitModel = model.changed.kitModel
      @$kitLabel.text @kitModel.get 'label'





   # PRIVATE METHODS
   # --------------------------------------------------------------------------------





module.exports = KitSelection
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


   # Ref to the main AppModel
   # @type {AppModel}

   appModel: null


   # Ref to the KitCollection for updating sounds
   # @type {KitCollection}

   kitCollection: null


   # The current kit
   # @type {KitModel}

   kitModel: null


   # View template
   # @type {Function}

   template: template



   events:
      'touchend .btn-left':   'onLeftBtnClick'
      'touchend .btn-right':  'onRightBtnClick'




   # Render the view and update the kit if not already
   # set via a previous session
   # @param {Object} options

   render: (options) ->
      super options

      @$kitLabel = @$el.find '.label-kit'

      if @appModel.get('kitModel') is null
         @appModel.set 'kitModel', @kitCollection.at(0)

      @$kitLabel.text @appModel.get('kitModel').get 'label'

      @




   # Add event listeners for handing changes related to
   # switching drum kits

   addEventListeners: ->
      @listenTo @appModel, AppEvent.CHANGE_KIT, @onChangeKit




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for left button clicks.  Updates the collection and
   # sets a new kitModel on the main AppModel

   onLeftBtnClick: (event) ->
      @appModel.set 'kitModel', @kitCollection.previousKit()




   # Handler for left button clicks.  Updates the collection and
   # sets a new kitModel on the main AppModel

   onRightBtnClick: (event) ->
      @appModel.set 'kitModel', @kitCollection.nextKit()




   # Handler for kit change events.  Updates the label on the
   # kit selector

   onChangeKit: (model) ->
      @kitModel = model.changed.kitModel
      @$kitLabel.text @kitModel.get 'label'





   # PRIVATE METHODS
   # --------------------------------------------------------------------------------





module.exports = KitSelection
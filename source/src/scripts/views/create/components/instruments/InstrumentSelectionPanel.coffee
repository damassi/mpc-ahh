###*
 * Panel which houses each individual selectable sound
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

AppEvent    = require '../../../../events/AppEvent.coffee'
View        = require '../../../../supers/View.coffee'
Instrument  = require './Instrument.coffee'
template    = require './templates/instrument-panel-template.hbs'


class InstrumentSelectionPanel extends View


   # View template
   # @type {Function}

   template: template


   # Ref to the application model
   # @type {AppModel}

   appModel: null


   # Ref to kit collection
   # @type {KitModel}

   kitCollection: null


   # Ref to the currently selected kit
   # @type {KitModel}

   kitModel: null


   # Ref to instrument views
   # @type {Array}

   instrumentViews: null


   index: 0



   events:
      'click': 'onClick'



   # Initializes the instrument selector and sets a local ref
   # to the current kit model for easy access
   # @param {Object} options

   initialize: (options) ->
      super options

      @kitModel = @appModel.get('kitModel')




   render: (options) ->
      super options

      @$container = @$el.find '.container-instruments'

      @renderInstruments()

      @



   renderInstruments: ->
      @instrumentViews = []

      @kitModel.get('instruments').each (model) =>
         instrument = new Instrument { model: model }

         @$container.append instrument.render().el
         @instrumentViews.push instrument



   addEventListeners: ->
      console.log 'here?'
      @listenTo @kitModel, AppEvent.CHANGE_KIT, @onKitChange




   removeEventListeners: ->
      @stopListening()




   # EVENT LISTENERS
   # --------------------------------------------------------------------------------


   onKitChange: (model) ->
      console.log 'change'
      _.each @instrumentViews, (instrument) ->
         instrument.remove()

      @renderInstruments()



   onClick: (event) ->
      @index = @index + 1

      @appModel.set 'kitModel', @kitCollection.at(@index)

      console.log @appModel.get('kitModel').get 'label'












module.exports = InstrumentSelectionPanel
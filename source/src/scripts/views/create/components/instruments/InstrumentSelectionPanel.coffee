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


   events:
      'click .test': 'onTestClick'


   # Initializes the instrument selector and sets a local ref
   # to the current kit model for easy access
   # @param {Object} options

   initialize: (options) ->
      super options

      @kitModel = @appModel.get('kitModel')




   # Renders the view as well as the associated kit instruments
   # @param {Object} options

   render: (options) ->
      super options

      @$container = @$el.find '.container-instruments'

      @renderInstruments()

      @




   # Renders each individual kit model into an Instrument

   renderInstruments: ->
      @instrumentViews = []

      @kitModel.get('instruments').each (model) =>
         instrument = new Instrument
            kitModel: @kitModel
            model: model

         @$container.append instrument.render().el
         @instrumentViews.push instrument




   # Adds event listeners related to kit changes

   addEventListeners: ->
      @listenTo @appModel, AppEvent.CHANGE_KIT, @onKitChange
      @listenTo @kitModel, AppEvent.CHANGE_INSTRUMENT, @onInstrumentChange



   # Removes event listeners

   removeEventListeners: ->
      @stopListening()





   # EVENT LISTENERS
   # --------------------------------------------------------------------------------



   # Handler for kit change events.  Cleans up the view and re-renders
   # the instruments to the DOM
   # @param {KitModel} model

   onKitChange: (model) =>
      @removeEventListeners()

      @kitModel = model.changed.kitModel

      _.each @instrumentViews, (instrument) ->
         instrument.remove()

      @renderInstruments()
      @addEventListeners()




   onInstrumentChange: (model) =>
      @$container.find('.instrument').removeClass 'selected'





   onTestClick: (event) ->
      @appModel.set 'kitModel', @kitCollection.nextKit()





module.exports = InstrumentSelectionPanel
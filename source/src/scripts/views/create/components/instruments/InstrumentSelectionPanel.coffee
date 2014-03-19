###*
 * Panel which houses each individual selectable sound
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

Instrument  = require './Instrument.coffee'
View        = require '../../../../supers/View.coffee'
template    = require './templates/instrument-panel-template.hbs'


class InstrumentSelectionPanel extends View


   # View template
   # @type {Function}

   template: template


   # A ref to the application model
   # @type {AppModel}

   appModel: null


   # A local ref to the currently selected kit
   # @type {KitModel}

   kitModel: null


   # Ref to instrument views
   # @type {Array}

   instrumentViews: null



   # Initializes the instrument selector and sets a local ref
   # to the current kit model for easy access
   # @param {Object} options

   initialize: (options) ->
      super options

      @kitModel = @appModel.get('kitModel')




   render: (options) ->
      super options

      @$container = @$el.find '.container-instruments'

      @instrumentViews = []

      @kitModel.get('instruments').each (model) =>
         instrument = new Instrument
            model: model

         @$container.append instrument.render().el

         @instrumentViews.push instrument

      @










module.exports = InstrumentSelectionPanel
###*
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

AppEvent            = require '../../../../events/AppEvent.coffee'
PadSquareCollection = require '../../../../models/pad/PadSquareCollection.coffee'
PadSquareModel      = require '../../../../models/pad/PadSquareModel.coffee'
View                = require '../../../../supers/View.coffee'
PadSquare           = require './PadSquare.coffee'
template            = require './templates/live-pad-template.hbs'


class LivePad extends View


   # The classname for the Live Pad
   # @type {String}

   className: 'container-live-pad'


   # The template
   # @type {Function}

   template: template


   # Appmodel for listening to show / hide events
   # @type {AppModel}

   appModel: null


   # Collection of kits to be rendered to the instrument container
   # @type {KitCollection}

   kitCollection: null


   # Collection of instruments.  Used to listen to `dropped` status
   # on individual instrument models, as set from the PadSquare
   # @type {InstrumentCollection}

   instrumentCollection: null


   # Collection of individual pad square models
   # @type {PadSquareCollection}

   collection: null


   # An array of individual PadSquareViews
   # @type {Array}

   padSquareViews: null


   # Key command keymap for live kit playback
   # @type {Array}

   keymap: ['1','2','3','4','q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v']



   # Render the view and and parse the collection into a displayable
   # instrument / pad table
   # @param {Object} options
   # @return {LivePad}

   render: (options) ->

      # Render the table to the DOM
      super {
         padTable: @returnPadTableData()
         instrumentTable: @returnInstrumentTableData()
      }

      # Render squares to the DOM
      _.each @padSquareViews, (padSquare) =>
         id = padSquare.model.get 'id'
         @$el.find("##{id}").html padSquare.render().el


      @$padContainer        = @$el.find '.container-pads'
      @$instrumentContainer = @$el.find '.container-instruments'
      @$instrument          = @$el.find '.instrument'

      @setDragAndDrop()

      @



   # Add collection listeners to listen for instrument drops

   addEventListeners: ->




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------




   # Handler for drop change events.  Checks to see if the instrument
   # className exists on the element and, if so, re-renders the
   # instrument and pad tables
   # @param {InstrumentModel} model

   onDroppedChange: (model) =>
      $instrument = @$el.find ".#{model.get('id')}"
      console.log model.get('id'), $instrument.length




   onInstrumentDrop: (dragged, dropped) =>
      id = $(dragged).attr 'id'
      model = @kitCollection.findInstrumentModel id
      console.log 'DROPPED!', model




   # PRIVATE METHODS
   # --------------------------------------------------------------------------------



   setDragAndDrop: ->
      self = @

      $droppables = @$el.find '.container-pad'

      @draggable = Draggable.create @$instrument,
         bounds: window

         onDrag: (event) ->
            i = $droppables.length

            while(--i > -1)
               if @hitTest($droppables[i], '50%')
                  $($droppables[i]).addClass 'highlight'
               else
                  $($droppables[i]).removeClass 'highlight'

         onDragEnd: (event) ->
            i = $droppables.length

            while(--i > -1)
               if @hitTest($droppables[i], '50%')
                  self.onInstrumentDrop(this.target, $droppables[i])






   # Render out the table for the live pad grid and push
   # it into an array of table rows and tds
   # @return {Object}

   returnPadTableData: ->

      @collection = new PadSquareCollection()
      @padSquareViews = []
      padTable = {}
      rows = []
      iterator = 0

      # Render out rows
      _(4).times (index) =>
         tds  = []

         # Render out columns
         _(4).times (index) =>

            # Instantiate each pad view and tie the id
            # to the DOM element

            model = new PadSquareModel
               keycode: @keymap[iterator]

            padSquare = new PadSquare
               model: model
               collection: @kitCollection

            @collection.add model
            @padSquareViews.push padSquare
            iterator++

            tds.push {
               id: padSquare.model.get('id')
            }

         rows.push {
            id: "pad-row-#{index}"
            tds: tds
         }

      padTable.rows = rows

      padTable




   # Render out the instrument table and push it into
   # and array of individual instruments
   # @return {Object}

   returnInstrumentTableData: ->
      instrumentTable = @kitCollection.map (kit) =>
         instrumentCollection = kit.get('instruments')

         # Begin listening to drop events
         @listenTo instrumentCollection, AppEvent.CHANGE_DROPPED, @onDroppedChange

         instruments = instrumentCollection.map (instrument) =>
            instrument.toJSON()

         return {
            label: kit.get 'label'
            instruments: instruments
         }

      instrumentTable








module.exports = LivePad
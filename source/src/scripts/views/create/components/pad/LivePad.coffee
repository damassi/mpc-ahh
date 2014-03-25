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
padsTemplate        = require './templates/pads-template.hbs'
instrumentsTemplate = require './templates/instruments-template.hbs'
template            = require './templates/live-pad-template.hbs'


class LivePad extends View


   # Key command keymap for live kit playback
   # @type {Array}

   KEYMAP: ['1','2','3','4','q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v']


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

   padSquareCollection: null


   # An array of individual PadSquareViews
   # @type {Array}

   padSquareViews: null



   # Render the view and and parse the collection into a displayable
   # instrument / pad table
   # @param {Object} options
   # @return {LivePad}

   render: (options) ->
      super options

      @$padsContainer        = @$el.find '.container-pads'
      @$instrumentsContainer = @$el.find '.container-instruments'

      @renderPads()
      @renderInstruments()

      # Render squares to the DOM
      _.each @padSquareViews, (padSquare) =>
         id = padSquare.model.get 'id'
         @$el.find("##{id}").html padSquare.render().el

      @setDragAndDrop()

      @



   renderPads: ->
      @$padsContainer.html padsTemplate {
         padTable: @returnPadTableData()
      }



   renderInstruments: ->
      @$instrumentsContainer.html instrumentsTemplate {
         instrumentTable: @returnInstrumentTableData()
      }



   # Add collection listeners to listen for instrument drops

   addEventListeners: ->




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------




   # Handler for drop change events.  Checks to see if the instrument
   # className exists on the element and, if so, re-renders the
   # instrument and pad tables
   # @param {InstrumentModel} instrumentModel

   onDroppedChange: (instrumentModel) =>
      instrumentId       = instrumentModel.get('id')
      $padSquare         = @$el.find ".#{instrumentId}"
      padSquareId        = $padSquare.attr 'id'
      padSquareModel     = @padSquareCollection.findWhere { id: padSquareId }

      # Checks against tests and draggable, which is less testable
      unless padSquareModel is undefined
         padSquareModel.set 'currentInstrument', instrumentModel




   onInstrumentDrop: (dragged, dropped) =>
      $dragged = $(dragged)
      $dropped = $(dropped)

      id = $dragged.attr 'id'
      $dropped.addClass id

      $dropped.attr 'data-instrument', "#{id}"

      instrumentModel = @kitCollection.findInstrumentModel id

      instrumentModel.set
         'dropped': true

      _.defer =>
         @renderInstruments()
         @setDragAndDrop()



   onPreventInstrumentDrop: (dragged, dropped) =>
      console.log 'oops!'




   onPadSquareDraggingStart: (params) =>
      {$padSquare} = params

      console.log $padSquare




   # PRIVATE METHODS
   # --------------------------------------------------------------------------------



   setDragAndDrop: ->
      self = @

      @$instrument = @$el.find '.instrument'
      $droppables  = @$el.find '.container-pad'

      @draggable = Draggable.create @$instrument,
         bounds: window


         # Handler for drag events.  Iterates over all droppable square areas
         # and checks to see if an instrument currently occupies the position

         onDrag: (event) ->

            i = $droppables.length

            while( --i > -1 )

               if @hitTest($droppables[i], '50%')

                  instrument = $($droppables[i]).attr('data-instrument')

                  # Prevent droppables on squares that already have instruments
                  if instrument is null or instrument is undefined
                     $($droppables[i]).addClass 'highlight'

               # Remove if not over square
               else
                  $($droppables[i]).removeClass 'highlight'


         # Check to see if instrument is droppable; otherwise
         # trigger a "cant drop" animation

         onDragEnd: (event) ->

            i = $droppables.length

            while( --i > -1 )

               if @hitTest($droppables[i], '50%')
                  instrument = $($droppables[i]).attr('data-instrument')

                  # Prevent droppables on squares that already have instruments
                  if instrument is null or instrument is undefined
                     self.onInstrumentDrop( this.target, $droppables[i] )

                  else
                     self.onPreventInstrumentDrop( this.target, $droppables[i] )






   # Render out the table for the live pad grid and push
   # it into an array of table rows and tds
   # @return {Object}

   returnPadTableData: ->

      @padSquareCollection = new PadSquareCollection()
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
               keycode: @KEYMAP[iterator]

            padSquare = new PadSquare
               model: model
               collection: @kitCollection

            @padSquareCollection.add model
            @padSquareViews.push padSquare
            iterator++

            # Begin listening to drag / release / remove events from
            # each pad square and re-render pad squares

            @listenTo padSquare, AppEvent.CHANGE_DRAGGING, @onPadSquareDraggingStart


            tds.push {
               'id': padSquare.model.get('id')
            }

         rows.push {
            'id': "pad-row-#{index}"
            'tds': tds
         }

      padTable.rows = rows

      padTable




   # Render out the instrument table and push it into
   # and array of individual instruments
   # @return {Object}

   returnInstrumentTableData: ->
      instrumentTable = @kitCollection.map (kit) =>
         instrumentCollection = kit.get('instruments')

         # Begin listening to drop events for each instrument
         # in the Instrument collection

         @listenTo instrumentCollection, AppEvent.CHANGE_DROPPED, @onDroppedChange

         instruments = instrumentCollection.map (instrument) =>
            instrument.toJSON()

         return {
            'label':       kit.get 'label'
            'instruments': instruments
         }

      instrumentTable








module.exports = LivePad
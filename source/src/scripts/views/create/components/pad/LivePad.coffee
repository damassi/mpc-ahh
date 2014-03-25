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


   # Key command keymap for live kit playback
   # @type {Array}

   keymap: ['1','2','3','4','q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v']



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
      instrumentId = instrumentModel.get('id')
      $padSquare   = @$el.find ".#{instrumentId}"
      padSquareId  = $padSquare.attr 'id'
      padSquareModel = @padSquareCollection.findWhere { id: padSquareId }

      # Checks against tests and draggable, which is less testable
      unless padSquareModel is undefined
         padSquareModel.set 'currentInstrument', instrumentModel




   onInstrumentDrop: (dragged, dropped) =>
      $dragged = $(dragged)
      $dropped = $(dropped)

      id = $dragged.attr 'id'
      $dropped.addClass id

      instrumentModel = @kitCollection.findInstrumentModel id
      instrumentModel.set 'dropped', true

      _.defer =>
         @renderInstruments()
         @setDragAndDrop()




   # PRIVATE METHODS
   # --------------------------------------------------------------------------------



   setDragAndDrop: ->
      self = @

      @$instrument = @$el.find '.instrument'
      $droppables  = @$el.find '.container-pad'

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
               keycode: @keymap[iterator]

            padSquare = new PadSquare
               model: model
               collection: @kitCollection

            @padSquareCollection.add model
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

         instruments = _.where instruments, { dropped: false }

         return {
            label: kit.get 'label'
            instruments: instruments
         }

      instrumentTable








module.exports = LivePad
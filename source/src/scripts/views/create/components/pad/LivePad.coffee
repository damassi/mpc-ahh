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

   id: 'container-live-pad'


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


   # Mouse tracker which constantly updates mouse / touch position via .x and .y
   # @type {Object}

   mousePosition: x: 0, y: 0





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
      @addEventListeners()

      @



   # Renders out the instrument pad squares

   renderPads: ->
      @$padsContainer.html padsTemplate {
         padTable: @returnPadTableData()
      }



   # Renders out the instrument racks by iterating through
   # each of the instrument sets in the KitCollection

   renderInstruments: ->
      @$instrumentsContainer.html instrumentsTemplate {
         instrumentTable: @returnInstrumentTableData()
      }



   # Add collection listeners to listen for instrument drops

   addEventListeners: ->
      $(document).on 'mousemove', @onMouseMove



   # Removes event listeners

   removeEventListeners: ->
      $(document).off 'mousemove', @onMouseMove
      @stopListening()







   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # TODO: Update mouse move to support touch events
   # @param {MouseEvent} event

   onMouseMove: (event) =>
      @mousePosition =
         x: event.pageX
         y: event.pageY



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




   # Handler for drop events.  Passes in the item dragged, the item it was
   # dropped upon, and the original event to store in memory for when
   # the user wants to "detach" the dropped item and move it back into the
   # instrument queue
   #
   # @param {HTMLDomElement} dragged
   # @param {HTMLDomElement} dropped
   # @param {MouseEvent} event

   onInstrumentDrop: (dragged, dropped, event) =>
      {$dragged, $dropped, id, instrumentModel} = @parseDraggedAndDropped( dragged, dropped )

      $dropped.addClass id
      $dropped.attr 'data-instrument', "#{id}"

      instrumentModel.set
         'dropped': true
         'droppedEvent': event

      _.defer =>
         @renderInstruments()
         @setDragAndDrop()




   # Handler for situations where the user attempts to drop the instrument incorrectly
   # @param {HTMLDomElement} dragged
   # @param {HTMLDomElement} dropped

   onPreventInstrumentDrop: (dragged, dropped) =>
      {$dragged, $dropped, id, instrumentModel} = @parseDraggedAndDropped( dragged, dropped )

      instrumentModel.set
         'dropped': false
         'droppedEvent': null

      _.defer =>
         @renderInstruments()
         @setDragAndDrop()




   # Handler for press and hold events, as dispatched from the pad square the user
   # is interacting with.  Releases the instrument and allows the user to drag to
   # a new square or deposit it back within the instrument rack
   # @param {Object} params

   onPadSquareDraggingStart: (params) =>
      {instrumentId, $padSquare, originalDroppedEvent} = params

      $droppedInstrument = $(document.getElementById(instrumentId))

      # Return the draggable instance associated with the pad square
      draggable = _.find @draggable, (draggableElement) =>
         if $(draggableElement._eventTarget).attr('id') is $droppedInstrument.attr('id')
            return draggableElement

      offset = $droppedInstrument.offset()

      # Silently update the position of the instrument
      $droppedInstrument.css 'position', 'absolute'

      instrumentModel = @kitCollection.findInstrumentModel $droppedInstrument.attr('id')
      #console.log instrumentModel

      # TODO: If Bounds are set on the original draggable then there's a weird
      # boundry offset that needs to be solved.  Reset in Draggable constructor

      TweenMax.set $droppedInstrument,
         left: @mousePosition.x - ($droppedInstrument.width()  * .5)
         top:  @mousePosition.y - ($droppedInstrument.height() * .5)

      # Renable dragging
      draggable.startDrag originalDroppedEvent
      draggable.update(true)

      # And show it
      $droppedInstrument.show()







   # PRIVATE METHODS
   # --------------------------------------------------------------------------------



   # Sets up drag and drop on each of the instruments rendered from the KitCollection
   # Adds highlights and determines hit-tests, or defers to onPreventInstrumentDrop
   # in situations where dropping isn't possible

   setDragAndDrop: ->
      self = @

      @$instrument = @$el.find '.instrument'
      $droppables  = @$el.find '.container-pad'

      @draggable = Draggable.create @$instrument,
         #bounds: window


         # Handler for drag events.  Iterates over all droppable square areas
         # and checks to see if an instrument currently occupies the position

         onDrag: (event) ->

            i = $droppables.length

            while( --i > -1 )

               if @hitTest($droppables[i], '50%')

                  instrument = $($droppables[i]).attr('data-instrument')

                  # Prevent droppables on squares that already have instruments
                  if instrument is null or instrument is undefined
                     TweenMax.to self.padSquareViews[i].$border, .2,
                        autoAlpha: 1

                     #$($droppables[i]).addClass 'highlight'

               # Remove if not over square
               else
                  TweenMax.to self.padSquareViews[i].$border, .2,
                     autoAlpha: 0

                  #$($droppables[i]).removeClass 'highlight'


         # Check to see if instrument is droppable; otherwise
         # trigger a "cant drop" animation

         onDragEnd: (event) ->

            i = $droppables.length

            droppedProperly = false

            while( --i > -1 )

               if @hitTest($droppables[i], '50%')
                  instrument = $($droppables[i]).attr('data-instrument')

                  # Prevent droppables on squares that already have instruments
                  if instrument is null or instrument is undefined
                     droppedProperly = true
                     self.onInstrumentDrop( this.target, $droppables[i], event )

                     # Hide Border
                     TweenMax.to self.padSquareViews[i].$border, .2,
                        autoAlpha: 0


                  # Send instrument back
                  else
                     self.onPreventInstrumentDrop( this.target, $droppables[i] )

               # Send instrument back
               if droppedProperly is false
                  self.onPreventInstrumentDrop( this.target, $droppables[i] )




   # Helper method for parsing the drag and drop event responses
   # @param {HTMLDomElement} dragged
   # @param {HTMLDomElement} dropped

   parseDraggedAndDropped: (dragged, dropped) =>
      $dragged        = $(dragged)
      $dropped        = $(dropped)
      id              = $dragged.attr 'id'
      instrumentModel = @kitCollection.findInstrumentModel id

      return {
         $dragged: $dragged
         $dropped: $dropped
         id: id
         instrumentModel: instrumentModel
      }




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
               index: iterator + 1

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
            'id':    "pad-row-#{index}"
            'tds':    tds
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
            'icon':        kit.get 'icon'
            'instruments': instruments
         }

      instrumentTable



module.exports = LivePad

###*
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

AppEvent            = require '../../../../events/AppEvent.coffee'
PubEvent            = require '../../../../events/PubEvent.coffee'
PadSquareCollection = require '../../../../models/pad/PadSquareCollection.coffee'
PadSquareModel      = require '../../../../models/pad/PadSquareModel.coffee'
View                = require '../../../../supers/View.coffee'
PadSquare           = require './PadSquare.coffee'
PlayPauseBtn        = require '../PlayPauseBtn.coffee'
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

  # Mouse tracker which constantly updates mouse / touch position via .x and .y
  # @type {Object}

  mousePosition: x: 0, y: 0

  events:
    'touchend .btn-edit': 'onEditBtnClick'
    'touchend .tab': 'onTabClick'
    'touchstart .btn-back': 'onBackBtnPress' # Mobile only
    'touchend .btn-back': 'onBackBtnClick' # Mobile only


  # Render the view and and parse the collection into a displayable
  # instrument / pad table
  # @param {Object} options
  # @return {LivePad}

  render: (options) ->
    super options

    @$padsContainer = @$el.find '.container-pads'
    @$instrumentsContainer = @$el.find '.container-instruments'

    @renderPads()
    @renderInstruments()

    # Render squares to the DOM
    _.each @padSquareViews, (padSquare) =>
      id = padSquare.model.get 'id'
      @$el.find("##{id}").html padSquare.render().el


    # Setup mobile layout
    if @isMobile
      @playPauseBtn = new PlayPauseBtn
        appModel: @appModel

      @$playPauseContainer = @$el.find '.container-play-pause'
      @$playLabel = @$playPauseContainer.find '.label-btn'
      @$instructions = @$el.find '.instructions'
      @$tabs = @$el.find '.tab'
      @$kits = @$el.find '.container-kit'

      @$playPauseContainer.html @playPauseBtn.render().el
      @$playLabel.text 'PAUSE SEQUENCE'

      _.delay =>
        $(@$tabs[0]).trigger 'touchend'
      , 100

    @initDragAndDrop()
    @


  remove: (options) ->
    _.each @padSquareViews, (view) =>
      view.remove()

    @$padsContainer.remove()
    super()


  # Add collection listeners to listen for instrument drops

  addEventListeners: ->
    $(document).on 'mousemove', @onMouseMove

    # Setup livepad keys
    _.each @KEYMAP, (key) =>
      $(document).on 'keydown', null, key, @onKeyPress


  # Removes event listeners

  removeEventListeners: ->
    $(document).off 'mousemove', @onMouseMove

    # Remove livepad keys
    _.each @KEYMAP, (key) =>
      $(document).off 'keydown', null, key, @onKeyPress

    @stopListening()


  # Renders out the instrument pad squares

  renderPads: ->
    @$padsContainer.html padsTemplate {
      padTable: @returnPadTableData()
      isDesktop: ! @isMobile
    }


  # Renders out the instrument racks by iterating through
  # each of the instrument sets in the KitCollection

  renderInstruments: ->
    @$instrumentsContainer.html instrumentsTemplate {
      instrumentTable: @returnInstrumentTableData()
      isDesktop: ! @isMobile
    }

    if @isMobile
      @$kits = @$el.find '.container-kit'
      @$tabs = @$el.find '.tab'


  # Clears the live pad of all assigned instruments

  clearLivePad: ->

    # Iterate over app pad squares
    _.each @padSquareViews, (padSquare, index) =>

      # Only modify pad squares which have a dropped instrument
      if padSquare.model.get('currentInstrument')
        padSquare.model.set 'dropped', false
        padSquare.model.get('currentInstrument').set 'dropped', false
        padSquare.model.set 'currentInstrument', null
        padSquare.removeSoundAndClearPad()

    @renderInstruments()
    @initDragAndDrop()


  # Event handlers
  # --------------

  onKeyPress: (event) =>
    key = event.handleObj.data
    index = _.indexOf @KEYMAP, key
    @padSquareViews[index].onPress()


  onEditBtnClick: (event) ->
    @$instructions.hide()
    @$instrumentsContainer.show()


  onTabClick: (event) =>
    @$kits.hide()
    @$tabs.removeClass 'selected'
    $tab = $(event.currentTarget)
    @selectedIndex = $tab.index()

    $tab.addClass 'selected'
    $(@$kits[@selectedIndex]).show()


  # Mobile only. Add press state on btn
  # @param {MouseEvent} event

  onBackBtnPress: (event) =>
    $(event.currentTarget).addClass 'press'


  # Mobile only. Trigger sequencer show back on CreateView
  # @param {MouseEvent} event

  onBackBtnClick: (event) =>
    $(event.currentTarget).removeClass 'press'
    @appModel.set 'showSequencer', true


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
    instrumentId = instrumentModel.get('id')
    $padSquare = @$el.find ".#{instrumentId}"
    padSquareId = $padSquare.attr 'id'
    padSquareModel = @padSquareCollection.findWhere { id: padSquareId }

    # Checks against tests and draggable, which is less testable
    unless padSquareModel is undefined
      padSquareModel.set 'currentInstrument', instrumentModel


  # Handler for press and hold events, as dispatched from the pad square the user
  # is interacting with.  Releases the instrument and allows the user to drag to
  # a new square or deposit it back within the instrument rack
  # @param {Object} params

  onDraggingChange: (params) =>
    {instrumentId, padSquare, $padSquare, event} = params

    $droppedInstrument = $(document.getElementById(instrumentId))

    # Return the draggable instance associated with the pad square
    draggable = _.find @draggable, (draggableElement) =>
      if $(draggableElement._eventTarget).attr('id') is $droppedInstrument.attr('id')
        return draggableElement

    # Set the model to null so that it can be reassigned
    padSquare.model.set 'dropped', false
    padSquare.model.set 'currentInstrument', null

    # If mobile or tablet, just send it back to the dock
    if @isMobile
      repeat = 0

      tween = TweenLite.to padSquare.$el, .05,
        backgroundColor: '#E41E2B'

        onComplete: =>
          tween.reverse()

          if repeat is 1
            draggable.disable()

        onReverseComplete: =>
          if repeat < 1
            repeat++
            tween.restart()


    # Allow the user to click and re-assign
    else

      # Silently update the position of the hidden instrument
      $droppedInstrument.css 'position', 'absolute'
      $droppedInstrument.show()
      position = $padSquare.position()

      # Set the position before it appears
      TweenLite.set $droppedInstrument,
        scale: .8
        top: position.top + ($padSquare.height() * .5)
        left: position.left + ($padSquare.width() * .5)

      # Scale it up so that the user knows they can drag
      TweenLite.to $droppedInstrument, .2,
        scale: 1.1
        color: '#E41E2B'
        ease: Expo.easeOut
        onComplete: ->
          TweenLite.to $droppedInstrument, .2,
            scale: 1


    # Renable dragging
    draggable.enable()
    draggable.update()
    draggable.startDrag event


  # Handler for beat events originating from the PadSquare.  Is
  # passed down to the VisualizationView to trigger animation
  # @param {Object} params

  onBeat: (params) =>
    @trigger PubEvent.BEAT, params


  # Private
  # -------

  # Sets up drag and drop on each of the instruments rendered from the KitCollection
  # Adds highlights and determines hit-tests, or defers to returnInstrumentToDock
  # in situations where dropping isn't possible

  initDragAndDrop: ->
    self = @

    @$instrument = @$el.find '.instrument'
    $droppables = @$el.find '.container-pad'

    @draggable = Draggable.create @$instrument,

      # Handler for drag events.  Iterates over all droppable square areas
      # and checks to see if an instrument currently occupies the position

      onDrag: (event) ->

        i = $droppables.length

        while( --i > -1 )

          if @hitTest($droppables[i], '50%')

            instrument = $($droppables[i]).attr('data-instrument')

            # Prevent droppables on squares that already have instruments
            if instrument is null or instrument is undefined
              TweenLite.to self.padSquareViews[i].$border, .2,
                autoAlpha: 1

          # Remove if not over square
          else
            TweenLite.to self.padSquareViews[i].$border, .2,
              autoAlpha: 0


      # Check to see if instrument is droppable; otherwise
      # trigger a "cant drop" animation

      onDragEnd: (event) ->
        i = $droppables.length

        droppedProperly = false
        $dragged = null
        $dropped = null

        while( --i > -1 )

          $dragged = this.target
          $dropped = $droppables[i]

          if @hitTest($droppables[i], '50%')
            instrument = $($droppables[i]).attr('data-instrument')

            # Prevent droppables on squares that already have instruments
            if instrument is null or instrument is undefined
              droppedProperly = true

              # Setup sound and init pad
              self.dropInstrument( $dragged, $dropped, event )

              # Hide Border
              TweenLite.to self.padSquareViews[i].$border, .2,
                autoAlpha: 0

              break

            # Send instrument back if overlaping on other square
            else
              self.returnInstrumentToDock( $dragged, $dropped )
              break

        # Send instrument back if out of bounds
        if droppedProperly is false
          self.returnInstrumentToDock( $dragged, $dropped )


  # Handler for drop events.  Passes in the item dragged, the item it was
  # dropped upon, and the original event to store in memory for when
  # the user wants to "detach" the dropped item and move it back into the
  # instrument queue
  #
  # @param {HTMLDomElement} dragged
  # @param {HTMLDomElement} dropped
  # @param {MouseEvent} event

  dropInstrument: (dragged, dropped, event) =>
    {$dragged, $dropped, id, instrumentModel} = @parseDraggedAndDropped( dragged, dropped )

    $dropped.addClass id
    $dropped.attr 'data-instrument', "#{id}"

    instrumentModel.set
      'dropped': true
      'droppedEvent': event

    _.defer =>
      @renderInstruments()
      @initDragAndDrop()

      # Hide everything and reselect tab
      if @isMobile
        @reselectMobileTab()


  # Handler for situations where the user attempts to drop the instrument incorrectly
  # @param {HTMLDomElement} dragged
  # @param {HTMLDomElement} dropped

  returnInstrumentToDock: (dragged, dropped) =>
    {$dragged, $dropped, id, instrumentModel} = @parseDraggedAndDropped( dragged, dropped )

    instrumentModel.set
      'dropped': false

    _.defer =>
      @renderInstruments()
      @initDragAndDrop()

      if @isMobile
        @reselectMobileTab()


  # Helper method for parsing the drag and drop event responses
  # @param {HTMLDomElement} dragged
  # @param {HTMLDomElement} dropped

  parseDraggedAndDropped: (dragged, dropped) =>
    $dragged = $(dragged)
    $dropped = $(dropped)
    id = $dragged.attr 'id'
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
      tds = []

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

        @listenTo padSquare, AppEvent.CHANGE_DRAGGING, @onDraggingChange
        @listenTo padSquare, PubEvent.BEAT, @onBeat

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
        'label': kit.get 'label'
        'icon': kit.get 'icon'
        'instruments': instruments
      }

    instrumentTable


  reselectMobileTab: ->
    @$kits.hide()
    $(@$kits[@selectedIndex]).show()
    $(@$tabs[@selectedIndex]).addClass 'selected'

module.exports = LivePad

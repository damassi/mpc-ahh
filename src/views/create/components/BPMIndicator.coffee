###*
 * Beats per minute view for handling tempo
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

AppConfig = require '../../../config/AppConfig.coffee'
AppEvent  = require '../../../events/AppEvent.coffee'
View      = require '../../../supers/View.coffee'
template  = require './templates/bpm-template.hbs'

class BPMIndicator extends View

  # Animation rotation time for bottlecap
  # @type {Number}

  ROTATE_TWEEN_TIME: .4

  # Class name of container
  # @type {String}

  className: 'container-bpm'

  # Ref to the main AppModel
  # @type {AppModel}

  appModel: null

  # View template
  # @type {Function}

  template: template

  # The setInterval update interval for increasing and
  # decreasing BPM on press / touch
  # @type {Number}

  intervalUpdateTime: 70

  # The setInterval updater
  # @type {SetInterval}

  updateInterval: null

  # The amount to increase the BPM by on each tick
  # @type {Number}

  bpmIncreaseAmount: 10

  # The current bpm before its set on the model.  Used to buffer
  # updates and to provide for smooth animation
  # @type {Number}

  currBPM: null


  events:
    'touchstart .btn-increase': 'onIncreaseBtnDown'
    'touchstart .btn-decrease': 'onDecreaseBtnDown'
    'touchend   .btn-increase': 'onBtnUp'
    'touchend   .btn-decrease': 'onBtnUp'
    'touchend   .wrapper': 'onBtnUp'
    'mouseup    .wrapper': 'onBtnUp'


  # Render the view and update the kit if not already
  # set via a previous session
  # @param {Object} options

  render: (options) ->
    super options

    @$bpmLabel = @$el.find '.bpm-value'
    @increaseBtn = @$el.find '.btn-increase'
    @decreaseBtn = @$el.find '.btn-decrease'
    @$bgCircle = @$el.find '.bg-circle'

    @currBPM = @appModel.get('bpm')
    @$bpmLabel.text @currBPM

    unless @isMobile
      TweenLite.set @$bgCircle, rotation: 0

    @


  # Add event listeners for handing changes related to
  # switching BPM

  addEventListeners: ->
    @listenTo @appModel, AppEvent.CHANGE_BPM, @onBPMChange


  # Sets an interval to increase the BPM monitor.  Clears
  # when the user releases the mouse

  increaseBPM: ->
    clearInterval @updateInterval

    @updateInterval = setInterval =>
      bpm = @currBPM

      if bpm < AppConfig.BPM_MAX
        bpm += @bpmIncreaseAmount

      else
        bpm = AppConfig.BPM_MAX

      @currBPM = bpm
      @$bpmLabel.text @currBPM

      unless @isMobile
        TweenLite.to @$bgCircle, @ROTATE_TWEEN_TIME, rotation: GreenProp.rotation(@$bgCircle) + 90

    , @intervalUpdateTime


  # Sets an interval to decrease the BPM monitor.  Clears
  # when the user releases the mouse

  decreaseBPM: ->
    clearInterval @updateInterval

    @updateInterval = setInterval =>
      bpm = @currBPM

      if bpm > 1
        bpm -= @bpmIncreaseAmount

      else
        bpm = 1

      @currBPM = bpm
      @$bpmLabel.text @currBPM

      unless @isMobile
        TweenLite.to @$bgCircle, @ROTATE_TWEEN_TIME, rotation: GreenProp.rotation(@$bgCircle) - 90

    , @intervalUpdateTime


  # Event handlers
  # --------------

  # Handler for left button clicks.  Updates the collection and
  # sets a new kitModel on the main AppModel
  # @param {Event}

  onIncreaseBtnDown: (event) =>
    @increaseBPM()


  # Handler for left button clicks.  Updates the collection and
  # sets a new kitModel on the main AppModel
  # @param {Event}

  onDecreaseBtnDown: (event) ->
    @decreaseBPM()


  # Handler for mouse / touchup events.  Clears the interval
  # @param {Event}

  onBtnUp: (event) ->
    clearInterval @updateInterval
    @updateInterval = null

    @appModel.set 'bpm', (Math.floor(60000 / @currBPM) * .5)


  # Handler for kit change events.  Updates the label on the
  # kit selector

  onBPMChange: (model) ->
    bpm = model.changed.bpm


module.exports = BPMIndicator

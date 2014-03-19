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


   # Ref to the main AppModel
   # @type {AppModel}

   appModel: null



   # View template
   # @type {Function}

   template: template



   # The setInterval update interval for increasing and
   # decreasing BPM on press / touch
   # @type {Number}

   intervalUpdateTime: 1



   # The setInterval updater
   # @type {SetInterval}

   updateInterval: null



   # The amount to increase the BPM by on each tick
   # @type {Number}

   bpmIncreaseAmount: 1




   events:
      'touchstart .btn-increase': 'onIncreaseBtnDown'
      'touchstart .btn-decrease': 'onDecreaseBtnDown'
      'touchend   .btn-increase': 'onBtnUp'
      'touchend   .btn-decrease': 'onBtnUp'



   # Render the view and update the kit if not already
   # set via a previous session
   # @param {Object} options

   render: (options) ->
      super options

      @$bpmLabel   = @$el.find '.label-bpm'
      @increaseBtn = @$el.find '.btn-increase'
      @decreaseBtn = @$el.find '.btn-decrease'

      @$bpmLabel.text @appModel.get('bpm')

      @



   # Add event listeners for handing changes related to
   # switching BPM

   addEventListeners: ->
      @listenTo @appModel, AppEvent.CHANGE_BPM, @onBPMChange




   # Sets an interval to increase the BPM monitor.  Clears
   # when the user releases the mouse

   increaseBPM: ->
      @updateInterval = setInterval =>
         bpm = @appModel.get 'bpm'

         if bpm < AppConfig.BPM_MAX
            bpm += @bpmIncreaseAmount

         else
            bpm = AppConfig.BPM_MAX

         @appModel.set 'bpm', bpm

      , @intervalUpdateTime




   # Sets an interval to decrease the BPM monitor.  Clears
   # when the user releases the mouse

   decreaseBPM: ->
      @updateInterval = setInterval =>
         bpm = @appModel.get 'bpm'

         if bpm > 0
            bpm -= @bpmIncreaseAmount

         else
            bpm = 0

         @appModel.set 'bpm', bpm

      , @intervalUpdateTime





   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



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




   # Handler for kit change events.  Updates the label on the
   # kit selector

   onBPMKit: (model) ->
      @$bpmLabel.text model.changed.bpm




module.exports = BPMIndicator
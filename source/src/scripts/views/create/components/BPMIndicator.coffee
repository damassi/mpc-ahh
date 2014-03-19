###*
 * Beats per minute view for handling tempo
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

View     = require '../../../supers/View.coffee'
template = require './templates/bpm-template.hbs'


class BPMIndicator extends View


   # Ref to the main AppModel
   # @type {AppModel}

   appModel: null


   # View template
   # @type {Function}

   template: template


   # the setInterval update interval for increasing and
   # decreasing BPM on press / touch
   # @type {Number}

   intervalUpdateTime: 10



   # Render the view and update the kit if not already
   # set via a previous session
   # @param {Object} options

   render: (options) ->
      super options

      @$bpmLabel = @$el.find '.label-bpm'

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
            @appModel.set 'bpm', bpm + 1

      , @intervalUpdateTime




   # Sets an interval to decrease the BPM monitor.  Clears
   # when the user releases the mouse

   decreaseBPM: ->


      @updateInterval = setInterval =>
         bpm = @appModel.get 'bpm'

         if bpm > 0
            @appModel.set 'bpm', bpm - 1

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




   # Handler for kit change events.  Updates the label on the
   # kit selector

   onBPMKit: (model) ->
      @$bpmLabel.text model.changed.bpm




module.exports = BPMIndicator
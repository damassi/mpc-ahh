###*
 * Sequencer parent view for track sequences
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

PatternTrack = require './PatternTrack.coffee'
AppEvent     = require '../../../../events/AppEvent.coffee'
View         = require '../../../../supers/View.coffee'
helpers      = require '../../../../helpers/handlebars-helpers'
template     = require './templates/sequencer-template.hbs'


class Sequencer extends View


   className: 'sequencer-container'
   template: template
   patternTrackViews: null
   bpmInterval: null

   updateIntervalTime: 200
   currCellId: -1
   numCells: 7


   appModel: null


   collection: null


   render: (options) ->
      super options

      @$thStepper = @$el.find 'th.stepper'
      @$sequencer = @$el.find '.sequencer'

      @renderTracks()
      @play()

      @


   remove: ->
      super()

      @pause()



   addEventListeners: ->
      @listenTo @appModel, AppEvent.CHANGE_PLAYING, @onPlayingChange
      @listenTo @appModel, AppEvent.CHANGE_KIT, @onKitChange




   renderTracks: =>
      @patternTrackViews = []

      @collection.each (model) =>

         patternTrack = new PatternTrack
            collection: model.get 'patternSquares'
            model: model

         @patternTrackViews.push patternTrack
         @$sequencer.append patternTrack.render().el



   updateTime: =>
      @$thStepper.removeClass 'step'
      @currCellId = if @currCellId < @numCells then @currCellId += 1 else @currCellId = 0
      $(@$thStepper[@currCellId]).addClass 'step'




   convertBPM: ->
      return 200




   play: ->
      @appModel.set 'playing', true




   pause: ->
      @appModel.set 'playing', false




   mute: ->
      @appModel.set 'mute', true




   unmute: ->
       @appModel.set 'mute', false




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   onPlayingChange: (model) =>
      playing = model.changed.playing

      if playing
         @bpmInterval = setInterval @updateTime, @updateIntervalTime

      else
         clearInterval @bpmInterval
         @bpmInterval = null




   onMuteChange: (model) =>




   onKitChange: (model) =>
      console.log model.changed.kitModel.get('instruments')
      @collection = model.changed.kitModel.get('instruments')
      @renderTracks()








module.exports = Sequencer
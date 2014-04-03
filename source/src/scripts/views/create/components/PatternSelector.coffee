###*
 * Pattern selector for prepopulating tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   4.1.14
###

AppConfig        = require '../../../config/AppConfig.coffee'
AppEvent         = require '../../../events/AppEvent.coffee'
SharedTrackModel = require '../../../models/SharedTrackModel.coffee'
View             = require '../../../supers/View.coffee'
presets          = require '../../../config/Presets'
template         = require './templates/pattern-selector-template.hbs'


class PatternSelector extends View


   className: 'container-pattern-selector'

   template: template

   @selectedIndex: -1

   events:
      'touchend .btn': 'onBtnClick'


   initialize: (options) ->
      super options

      @presetModels = _.map presets, (preset) ->
         new SharedTrackModel preset.track

      console.log @presetModels


   render: (options) ->
      super options

      @$btns = @$el.find '.btn'

      @



   onBtnClick: (event) =>
      self = @

      $btn = $(event.currentTarget)

      # Deselect current buttons
      @$btns.each (index) ->
         if $btn.text() isnt $(@).text()
            $(this).removeClass 'selected'
         else
            self.selectedIndex = index

      # Allow for selection and de-selection
      if $btn.hasClass('selected') is false
         $btn.addClass 'selected'

      # Deselect and clear current pattern
      else
         $btn.removeClass 'selected'
         self.selectedIndex = -1


      @importTrack()



   importTrack: ->
      console.log @selectedIndex

      if @selectedIndex isnt -1

         sharedTrackModel = @presetModels[@selectedIndex]

         @appModel.set
            'bpm':              sharedTrackModel.get 'bpm'
            'sharedTrackModel': sharedTrackModel

         # Import into sequencer
         @sequencer.importTrack

            kitType:             sharedTrackModel.get 'kitType'
            instruments:         sharedTrackModel.get 'instruments'
            patternSquareGroups: sharedTrackModel.get 'patternSquareGroups'


      else
         @appModel.set
            'bpm':              187
            'sharedTrackModel': null

         @sequencer.renderTracks()



module.exports = PatternSelector
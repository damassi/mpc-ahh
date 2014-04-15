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
      'touchstart .btn':   'onBtnPress'
      'touchend .btn':     'onBtnClick'


   initialize: (options) ->
      super options

      @presetModels = _.map presets, (preset) ->
         new SharedTrackModel preset.track


   render: (options) ->
      super options

      @$btns = @$el.find '.btn'

      @


   onBtnPress: (event) ->
      $(event.currentTarget).addClass 'press'



   onBtnClick: (event) =>
      self = @

      $btn = $(event.currentTarget)
      $btn.removeClass 'press'

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
            'bpm':              120
            'sharedTrackModel': null

         @sequencer.renderTracks()



module.exports = PatternSelector
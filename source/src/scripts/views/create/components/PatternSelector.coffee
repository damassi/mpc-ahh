###*
 * Pattern selector for prepopulating tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   4.1.14
###

AppConfig = require '../../../config/AppConfig.coffee'
AppEvent  = require '../../../events/AppEvent.coffee'
View      = require '../../../supers/View.coffee'
template  = require './templates/pattern-selector-template.hbs'


class PatternSelector extends View


   className: 'container-pattern-selector'

   template: template

   events:
      'touchend .btn': 'onBtnClick'



   render: (options) ->
      super options

      @$btns = @$el.find '.btn'

      @



   onBtnClick: (event) =>
      $btn = $(event.currentTarget)

      @$btns.each (index) ->
         if $btn.text() isnt $(@).text()
            $(this).removeClass 'selected'


      # Allow for selection and de-selection
      if $btn.hasClass('selected') is false
         $btn.addClass 'selected'

      else $btn.removeClass 'selected'

      # @appModel.set
      #          'bpm':              sharedTrackModel.get 'bpm'
      #          'sharedTrackModel': sharedTrackModel

      #       # Import into sequencer
      #       @createView.sequencer.importTrack

      #          kitType:             sharedTrackModel.get 'kitType'
      #          instruments:         sharedTrackModel.get 'instruments'
      #          patternSquareGroups: sharedTrackModel.get 'patternSquareGroups'



module.exports = PatternSelector
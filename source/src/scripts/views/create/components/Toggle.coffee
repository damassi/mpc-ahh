###*
 * Kit / Pad toggle button
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.28.14
###

AppConfig = require '../../../config/AppConfig.coffee'
AppEvent  = require '../../../events/AppEvent.coffee'
View      = require '../../../supers/View.coffee'
template  = require './templates/toggle-template.hbs'


class Toggle extends View


   className: 'toggle'


   template: template


   events:
      'touchend .btn-steps':  'onStepsBtnClick'
      'touchend .btn-pads':   'onPadBtnClick'


   render: (options) ->
      super options

      @$stepsBtn = @$el.find '.btn-steps'
      @$padBtn   = @$el.find '.btn-pads'

      @


   addEventListeners: ->
      @appModel.on 'change:showSequencer',   @onShowSequencerChange
      @appModel.on 'change:showPad',         @onShowPadChange




   onStepsBtnClick: (event) =>
      @appModel.set
         'showSequencer':  true
         'showPad':        false



   onPadBtnClick: (event) =>
      @appModel.set
         'showSequencer':  false
         'showPad':        true




   onShowSequencerChange: (model) =>
      if model.changed.showSequencer
         @$stepsBtn.addClass  'selected'
         @$padBtn.removeClass 'selected'




   onShowPadChange: (model) =>
      if model.changed.showPad
         @$stepsBtn.removeClass  'selected'
         @$padBtn.addClass       'selected'



module.exports = Toggle
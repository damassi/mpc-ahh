###*
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

AppConfig   = require '../../../../config/AppConfig.coffee'
View        = require '../../../../supers/View.coffee'
template    = require './templates/pattern-square-template.hbs'


class PatternSquare extends View


   className: 'pattern-square'


   template: template


   events:
      'touchend': 'onClick'


   enable: ->
      @model.enable()


   disable: ->
      @model.disable()


   flashOn: ->
      @$el.addClass 'flash'



   flashOff: ->
      @$el.removeClass 'flash'



   onClick: (event) ->
      @model.cycle()


module.exports = PatternSquare
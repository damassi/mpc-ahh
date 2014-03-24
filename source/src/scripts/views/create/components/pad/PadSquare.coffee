###*
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

View     = require '../../../../supers/View.coffee'
template = require './templates/pad-square-template.hbs'


class PadSquare extends View

   tagName: 'td'
   className: 'pad-square'
   template: template


   events:
      'touchend': 'onClick'


   setSound: ->


   removeSound: ->


   onClick: (event) =>


   onDrag: (event) ->


   onDrop: (event) ->





module.exports = PadSquare
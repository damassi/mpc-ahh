###*
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

View     = require '../../../supers/View.coffee'
template = require './templates/pad-square-template.hbs'


class PadSquare extends View

   template: template


module.exports = PadSquare
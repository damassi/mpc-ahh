###*
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

View     = require '../../../supers/View.coffee'
template = require './templates/pad-template.hbs'


class LivePad extends View

   template: template


module.exports = LivePad
###*
 * Sound type selector for choosing which sound should
 * play on each track
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

View     = require '../../../../supers/View.coffee'
template = require './templates/instrument-template.hbs'


class Instrument extends View

   template: template


module.exports = Instrument
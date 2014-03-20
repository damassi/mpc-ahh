###*
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

View     = require '../../../../supers/View.coffee'
template = require './templates/pattern-square-template.hbs'


class PatternSquare extends View

   template: template


module.exports = PatternSquare
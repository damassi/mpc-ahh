###*
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

View     = require '../../../../supers/View.coffee'
template = require './templates/sequencer-square-template.hbs'


class SequencerSquare extends View

   template: template


module.exports = SequencerSquare
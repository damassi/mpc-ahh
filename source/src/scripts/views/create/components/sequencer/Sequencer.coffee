###*
 * Sequencer parent view for track sequences
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

View     = require '../../../supers/View.coffee'
template = require './templates/sequencer-template.hbs'


class Sequencer extends View

   template: template


module.exports = Sequencer
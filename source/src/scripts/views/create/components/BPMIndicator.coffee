###*
 * Beats per minute view for handling tempo
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

View     = require '../../../supers/View.coffee'
template = require './templates/bpm-template.hbs'


class BPMIndicator extends View

   template: template


module.exports = BPMIndicator
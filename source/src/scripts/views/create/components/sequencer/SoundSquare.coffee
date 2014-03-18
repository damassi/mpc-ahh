###*
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

View     = require '../../../supers/View.coffee'
template = require './templates/sound-square-template.hbs'


class SoundSquare extends View

   template: template


module.exports = SoundSquare
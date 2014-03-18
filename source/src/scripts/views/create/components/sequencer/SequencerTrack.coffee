###*
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

View     = require '../../../supers/View.coffee'
template = require './templates/sequencer-track-template.hbs'


class SequencerTrack extends View

   template: template


module.exports = SequencerTrack
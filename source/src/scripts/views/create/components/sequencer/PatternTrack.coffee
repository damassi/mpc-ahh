###*
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

View     = require '../../../../supers/View.coffee'
template = require './templates/pattern-track-template.hbs'


class PatternTrack extends View

   template: template


module.exports = PatternTrack
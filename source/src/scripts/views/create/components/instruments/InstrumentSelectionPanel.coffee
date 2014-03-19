###*
 * Panel which houses each individual selectable sound
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

View     = require '../../../../supers/View.coffee'
template = require './templates/instrument-panel-template.hbs'


class InstrumentSelectionPanel extends View

   template: template


module.exports = InstrumentSelectionPanel
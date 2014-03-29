###*
 * Background visualization view
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.27.14
###

PubSub   = require '../../utils/PubSub'
PubEvent = require '../../events/PubEvent.coffee'
View     = require '../../supers/View.coffee'
template = require './templates/visualizer-template.hbs'


class VisualizerView extends View

   id: 'container-visualizer'

   template: template


module.exports = VisualizerView
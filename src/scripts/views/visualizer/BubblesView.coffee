###*
 * Background visualization view
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   4.13.14
###

View     = require '../../supers/View.coffee'
template = require './templates/bubbles-template.hbs'

class BubblesView extends View

  className: 'container-bubbles'
  template: template

  render: (options) ->
    super options

    @startBubbles()
    @

  startBubbles: ->


module.exports = BubblesView

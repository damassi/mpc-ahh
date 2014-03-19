###*
 * Landing view with start button and initial animation
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

PubSub   = require '../../utils/PubSub'
PubEvent = require '../../events/PubEvent.coffee'
View     = require '../../supers/View.coffee'
template = require './templates/landing-template.hbs'


class LandingView extends View

   # @type {Function}
   template: template


   events:
      'touchend .start-btn': 'onStartBtnClick'


   onStartBtnClick: (event) ->
      PubSub.trigger PubEvent.ROUTE,
         route: 'create'



module.exports = LandingView
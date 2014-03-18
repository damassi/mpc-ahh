###*
 * Landing view with start button and initial animation
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

View = require '../../supers/View.coffee'
template = require './templates/landing-template.hbs'


class LandingView extends View

   template: template



module.exports = LandingView
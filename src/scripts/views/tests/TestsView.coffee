###*
 * Landing view with start button and initial animation
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

View     = require '../../supers/View.coffee'
template = require './tests-template.hbs'


class TestsView extends View

   template: template


module.exports = TestsView
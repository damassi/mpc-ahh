###*
 * Kit / Pad toggle button
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.28.14
###

AppConfig = require '../../../config/AppConfig.coffee'
AppEvent  = require '../../../events/AppEvent.coffee'
View      = require '../../../supers/View.coffee'
template  = require './templates/toggle-template.hbs'


class Toggle extends View


   className: 'toggle'


   template: template


   events:
      'touchend .steps': 'onStepsBtnClick'
      'touchend .pad':   'onPadBtnClick'


   onStepsBtnClick: (event) =>
      console.log 'steps click'


   onPadBtnClick: (event) =>


module.exports = Toggle
###*
 * Mobile view if capabilities are not met
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   4.9.14
###

View     = require '../../supers/View.coffee'
template = require './templates/not-supported-template.hbs'

class NotSupportedView extends View

  className: 'container-not-supported'
  template: template

  events:
    'touchend .btn-listen': 'onListenBtnClick'


  render: (options) ->
    super options

    @$notification = @$el.find '.notification'
    @$samples = @$el.find '.samples'

    @


  onListenBtnClick: (event) ->
    TweenLite.to @$notification, .6,
      autoAlpha: 0
      x: -window.innerWidth
      ease: Expo.easeInOut

    TweenLite.fromTo @$samples, .6, x: window.innerWidth, autoAlpha: 0,
      display: 'block'
      autoAlpha: 1
      x: 0
      ease: Expo.easeInOut


module.exports = NotSupportedView

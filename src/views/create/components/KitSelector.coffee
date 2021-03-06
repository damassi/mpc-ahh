###*
 * Kit selector for switching between drum-kit sounds
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

AppEvent = require '../../../events/AppEvent.coffee'
View     = require '../../../supers/View.coffee'
template = require './templates/kit-selection-template.hbs'

class KitSelector extends View

  className: 'container-kit-selector'

  # Ref to the main AppModel
  # @type {AppModel}

  appModel: null

  # Ref to the KitCollection for updating sounds
  # @type {KitCollection}

  kitCollection: null

  # The current kit
  # @type {KitModel}

  kitModel: null

  # View template
  # @type {Function}

  template: template


  events:
    'touchstart .btn': 'onBtnPress'
    'touchend .btn-left': 'onLeftBtnClick'
    'touchend .btn-right': 'onRightBtnClick'


  # Render the view and update the kit if not already
  # set via a previous session
  # @param {Object} options

  render: (options) ->
    super options

    @$kitLabel = @$el.find('.label-kit').find 'div'

    if @appModel.get('kitModel') is null
      @appModel.set 'kitModel', @kitCollection.at(0)

    @$kitLabel.text @appModel.get('kitModel').get 'label'

    @


  show: ->
    unless @isMobile

      TweenLite.fromTo @$el, .4, y: -100,
        y: 0
        ease: Expo.easeOut
        delay: .3


  hide: ->
    unless @isMobile
      TweenLite.fromTo @$el, .4, y: 0,
        y: -100
        ease: Expo.easeOut


  # Add event listeners for handing changes related to
  # switching drum kits

  addEventListeners: ->
    @listenTo @appModel, AppEvent.CHANGE_KIT, @onChangeKit


  # Event handlers
  # --------------

  onBtnPress: (event) ->
    $(event.currentTarget).addClass 'press'


  # Handler for left button clicks.  Updates the collection and
  # sets a new kitModel on the main AppModel

  onLeftBtnClick: (event) ->
    $(event.currentTarget).removeClass 'press'
    @appModel.set 'kitModel', @kitCollection.previousKit()


  # Handler for left button clicks.  Updates the collection and
  # sets a new kitModel on the main AppModel

  onRightBtnClick: (event) ->
    $(event.currentTarget).removeClass 'press'
    @appModel.set 'kitModel', @kitCollection.nextKit()


  # Handler for kit change events.  Updates the label on the
  # kit selector

  onChangeKit: (model) ->
    @kitModel = model.changed.kitModel

    delay = if @isMobile then .5 else 0

    TweenLite.to @$kitLabel, .2,
      y: -20
      ease: Expo.easeIn
      delay: delay

      onComplete: =>
        @$kitLabel.text @kitModel.get 'label'
        TweenLite.fromTo @$kitLabel, .2, { y: 20 },
          y: 0
          ease: Expo.easeOut


module.exports = KitSelector

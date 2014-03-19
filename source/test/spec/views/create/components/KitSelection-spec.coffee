KitSelection  = require  '../../../../../src/scripts/views/create/components/KitSelection.coffee'
AppModel      = require '../../../../../src/scripts/models/AppModel.coffee'
KitModel      = require '../../../../../src/scripts/models/KitModel.coffee'
KitCollection = require '../../../../../src/scripts/models/KitCollection.coffee'


describe 'Kit Selection', ->


   beforeEach =>
      models = []

      _(4).times (index) ->
         models.push new KitModel {label: "kit #{index}"}


      @view = new KitSelection
         appModel: new AppModel()
         kitCollection: new KitCollection models

      @view.render()


   afterEach =>
      @view.remove()




   it 'Should render', =>
      @view.$el.should.exist




   it 'Should have a label', =>

      $label = @view.$el.find '.label-kit'
      $label.text @view.kitCollection.at(0).get 'label'
      $label.text().should.equal 'kit 0'




   it 'Should update the AppModel a kit is changed', =>

      $label = @view.$el.find '.label-kit'
      firstLabel = @view.kitCollection.at(0).get 'label'
      lastLabel  = @view.kitCollection.at(@view.kitCollection.length-1).get 'label'

      appModel = @view.appModel

      appModel.should.trigger('change:kitModel').when =>
         @view.onLeftBtnClick()
         $label.text().should.equal lastLabel

      appModel.should.trigger('change:kitModel').when =>
         @view.onRightBtnClick()
         $label.text().should.equal firstLabel













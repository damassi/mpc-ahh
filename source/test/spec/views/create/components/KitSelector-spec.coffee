AppConfig = require '../../../../../src/scripts/config/AppConfig.coffee'
KitSelector  = require  '../../../../../src/scripts/views/create/components/KitSelector.coffee'
AppModel      = require '../../../../../src/scripts/models/AppModel.coffee'
KitModel      = require '../../../../../src/scripts/models/kits/KitModel.coffee'
KitCollection = require '../../../../../src/scripts/models/kits/KitCollection.coffee'


describe 'Kit Selection', ->


   before =>
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'

      @appModel = new AppModel
      @appModel.set 'kitModel', @kitCollection.at(0)


   beforeEach =>

      @view = new KitSelector
         appModel: @appModel
         kitCollection: @kitCollection

      @view.render()


   afterEach =>
      @view.remove()




   it 'Should render', =>

      @view.$el.should.exist




   it 'Should have a label', =>

      $label = @view.$el.find '.label-kit'
      $label.should.exist




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













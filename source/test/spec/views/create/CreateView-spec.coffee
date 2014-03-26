AppConfig = require  '../../../../src/scripts/config/AppConfig.coffee'
AppModel = require  '../../../../src/scripts/models/AppModel.coffee'
KitCollection = require  '../../../../src/scripts/models/kits/KitCollection.coffee'
CreateView = require  '../../../../src/scripts/views/create/CreateView.coffee'


describe 'Create View', ->

   beforeEach =>
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'

      @appModel = new AppModel
      @appModel.set 'kitModel', @kitCollection.at(0)

      @view  = new CreateView
         appModel: @appModel
         kitCollection: @kitCollection

      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', =>
      expect(@view.el).to.exist
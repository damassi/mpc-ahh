InstrumentSelectorPanel = require  '../../../../../../src/scripts/views/create/components/instruments/InstrumentSelectorPanel.coffee'
AppConfig                = require  '../../../../../../src/scripts/config/AppConfig.coffee'
AppModel                 = require  '../../../../../../src/scripts/models/AppModel.coffee'
KitCollection            = require  '../../../../../../src/scripts/models/kits/KitCollection.coffee'


describe 'Instrument Selection Panel', ->


   before =>
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'


   beforeEach =>
      @appModel = new AppModel()
      @appModel.set 'kitModel', @kitCollection.at(0)

      @view = new InstrumentSelectorPanel
         appModel: @appModel

      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', =>
      @view.should.exist



   it 'Should refer to the current KitModel when instantiating sounds', =>

      expect(@view.kitModel).to.exist



   it 'Should iterate over all of the sounds in the SoundCollection to build out instruments', =>

      @view.kitModel.toJSON().instruments.length.should.be.above(0)

      $instruments = @view.$el.find('.container-instruments').find('.instrument')
      $instruments.length.should.be.above(0)



   it 'Should rebuild view when the kitModel changes', =>

      kitModel = @view.appModel.get 'kitModel'
      length = kitModel.get('instruments').toJSON().length

      $instruments = @view.$el.find('.container-instruments').find('.instrument')
      $instruments.length.should.be.equal(length)

      @view.appModel.set 'kitModel', @kitCollection.nextKit()

      kitModel = @view.appModel.get 'kitModel'
      length = kitModel.get('instruments').toJSON().length

      $instruments = @view.$el.find('.container-instruments').find('.instrument')
      $instruments.length.should.be.equal(length)



   it 'Should listen for selections from Instrument instances and update the model', =>

      @view.kitModel.should.trigger('change:currentInstrument').when =>
         @view.instrumentViews[0].onClick()

         $selected = @view.$el.find('.container-instruments').find('.selected')
         $selected.length.should.equal 1




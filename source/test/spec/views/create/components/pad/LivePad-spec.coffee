AppConfig = require '../../../../../../src/scripts/config/AppConfig.coffee'
AppModel = require  '../../../../../../src/scripts/models/AppModel.coffee'
KitCollection = require  '../../../../../../src/scripts/models/kits/KitCollection.coffee'
InstrumentModel = require '../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee'
PadSquareCollection = require '../../../../../../src/scripts/models/pad/PadSquareCollection.coffee'
PadSquare = require '../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee'
LivePad = require '../../../../../../src/scripts/views/create/components/pad/LivePad.coffee'


describe 'Live Pad', ->

   before =>
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'

      @appModel = new AppModel
      @appModel.set 'kitModel', @kitCollection.at(0)


   beforeEach =>
      @view = new LivePad
         kitCollection: @kitCollection
         collection: new PadSquareCollection()
         appModel: @appModel

      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', =>
      @view.$el.should.exist


   it 'Should render out pad squares', =>
      @view.$el.find('.pad-square').length.should.equal 16


   it 'Should render out the entire kit collection', =>
      len = 0

      @view.kitCollection.each (kit, index) ->
         index = index + 1
         len = kit.get('instruments').length * index

      @view.$el.find('.instrument').length.should.equal len + 1


   it 'Should listen to drops from the kits to the pads', =>
      @view.collection.should.trigger('change:dropped').when =>
         @view.padSquareViews[0].onDrop()


   it 'Should update the PadSquareCollection with the current kit when dropped', =>
      @view.collection.should.trigger('change:instrument').when =>
         @view.padSquareViews[0].setSound()


   it 'Should listen for changes to instrument dropped status', (done) =>
      @view.kitCollection.at(0).get('instruments').at(0).should.trigger('change:dropped').when =>
         @view.padSquareViews[0].setSound()









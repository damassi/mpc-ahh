AppConfig = require '../../../../../../src/scripts/config/AppConfig.coffee'
AppModel = require  '../../../../../../src/scripts/models/AppModel.coffee'
KitCollection = require  '../../../../../../src/scripts/models/kits/KitCollection.coffee'
PadSquareModel = require '../../../../../../src/scripts/models/pad/PadSquareModel.coffee'
PadSquareCollection = require '../../../../../../src/scripts/models/pad/PadSquareCollection.coffee'
PadSquare = require '../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee'
LivePad = require '../../../../../../src/scripts/views/create/components/pad/LivePad.coffee'


describe 'Live Pad', ->


   beforeEach =>
      @view = new LivePad

      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', =>
      @view.$el.should.exist


   it 'Should render out 16 pad squares', =>
      @view.$el.find('.pad-square').length.should.equal 16


   it 'Should render out the entire kit collection', =>
      @view.$el.find('.instrument').length.should.equal 24


   it 'Should listen to drops from the kits to the pads', =>
      @view.collection.should.trigger('change:dropped').when =>
         @view.padSquareViews[0].onDrop()


   it 'Should update the PadSquareCollection with the current kit when dropped', =>
      @view.collection.should.trigger('change:sound').when =>
         @view.padSquareViews[0].setSound()
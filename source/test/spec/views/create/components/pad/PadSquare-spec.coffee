AppConfig = require '../../../../../../src/scripts/config/AppConfig.coffee'
AppModel = require  '../../../../../../src/scripts/models/AppModel.coffee'
KitCollection = require  '../../../../../../src/scripts/models/kits/KitCollection.coffee'
PadSquareModel = require '../../../../../../src/scripts/models/pad/PadSquareModel.coffee'
PadSquareCollection = require '../../../../../../src/scripts/models/pad/PadSquareCollection.coffee'
PadSquare = require '../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee'


describe 'Pad Square', ->

   beforeEach =>
      @view = new PadSquare

      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', =>
      @view.$el.should.exist


   it 'Should render out the appropriate key-code trigger', =>
      @view.$el.find('.key-code').length.should.equal 1


   it 'Should trigger a play action on tap', =>
      @view.model.should.trigger('change:playing').when =>
         @view.onClick()


   it 'Should accept a droppable visual element', =>
      @view.model.should.trigger('change:dropped').when =>
         @view.onDrop()


   it 'Should render out a sound icon when dropped', =>
      @view.$el.find('.icon').length.should.equal 1


   it 'Should release the droppable visual element on press-hold', =>
      @view.model.should.trigger('change:dragging').when =>
         @view.onHold()


   it 'Should set the sound based upon the dropped visual element', =>
      @view.model.should.trigger('change:instrument').when =>
         @view.setSound()


   it 'Should clear the sound when the droppable element is disposed of', =>
      @view.model.should.trigger('change:instrument').when =>
         @view.removeSound()

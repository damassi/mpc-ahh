AppConfig = require '../../../../../../src/scripts/config/AppConfig.coffee'
AppModel = require  '../../../../../../src/scripts/models/AppModel.coffee'
KitCollection = require  '../../../../../../src/scripts/models/kits/KitCollection.coffee'
PadSquareCollection = require '../../../../../../src/scripts/models/pad/PadSquareCollection.coffee'
PadSquareModel = require '../../../../../../src/scripts/models/pad/PadSquareModel.coffee'
PadSquare = require '../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee'


describe 'Pad Square', ->

   before =>
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'

      @appModel = new AppModel
      @appModel.set 'kitModel', @kitCollection.at(0)


   beforeEach =>
      @view = new PadSquare
         collection: @kitCollection
         model: new PadSquareModel()

      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', =>
      @view.$el.should.exist



   it 'Should render out the appropriate key-code trigger', =>
      @view.$el.find('.key-code').length.should.equal 1



   it 'Should trigger a play action on tap', =>
      @view.model.should.trigger('change:trigger').when =>
         @view.onClick()



   it 'Should accept a droppable visual element', =>
      @view.model.should.trigger('change:dropped').when =>
         id = @kitCollection.at(0).get('instruments').at(0).get('id')

         @view.onDrop id



   it 'Should trigger instrument change on drop', =>
       @view.model.should.trigger('change:currentInstrument').when =>
         id = @kitCollection.at(0).get('instruments').at(0).get('id')

         @view.onDrop id



   it 'Should render out a sound icon when dropped', =>
      id = @kitCollection.at(0).get('instruments').at(0).get('id')
      @view.onDrop id

      icon = @kitCollection.at(0).get('instruments').at(0).get('icon')

      @view.$el.find('.' + icon).length.should.equal 1



   it 'Should update the td with the corresponding instrument id when dropped', =>
      id = @kitCollection.at(0).get('instruments').at(0).get('id')
      @view.onDrop id

      @view.$el.hasClass("#{id}").should.be.true




   it 'Should release the droppable visual element on press-hold', =>
      @view.model.should.trigger('change:dragging').when =>
         @view.onHold()



   it 'Should set the sound based upon the dropped visual element', =>
      id = @kitCollection.at(0).get('instruments').at(0).get('id')
      @view.onDrop id

      expect(@view.audioPlayback).to.not.equal undefined


   it 'Should clear the sound when the droppable element is disposed of', (done) =>
      id = @kitCollection.at(0).get('instruments').at(0).get('id')
      @view.onDrop id

      @view.model.once 'change:currentInstrument', =>
         done()

      @view.removeSound()


   it 'Should clear the icon when the droppable element is disposed of', =>
      id = @kitCollection.at(0).get('instruments').at(0).get('id')
      @view.onDrop id

      icon = @kitCollection.at(0).get('instruments').at(0).get('icon')
      @view.$el.find('.' + icon).length.should.equal 1

      @view.removeSound()
      console.log @view.el
      @view.$el.find('.' + icon).length.should.equal 0









InstrumentSelectionPanel = require  '../../../../../../src/scripts/views/create/components/instruments/InstrumentSelectionPanel.coffee'


describe 'Instrument Selection Panel', ->


   beforeEach =>
      @view = new InstrumentSelectionPanel
      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', =>
      @view.should.exist


   it 'Should refer to the current KitModel when instantiating sounds', =>


   it 'Should iterate over all of the sounds in the SoundCollection to build out instruments', =>


   it 'Should listen for selections from SoundType instances and update the model', =>


   it 'Should allow user to select and deselect instruments', =>


   it 'Should dispatch an event indicating which sound has been selected', =>


   it 'Should update the selected state if the user is interfacing with the sequence', =>
Instrument = require  '../../../../../../src/scripts/views/create/components/instruments/Instrument.coffee'


describe 'Instrument', ->


   beforeEach =>
      @view = new SoundType


   it 'Should render', =>


   it 'Should allow user to select and deselect instruments', =>


   it 'Should dispatch an event indicating which sound has been selected', =>


   it 'Should update the selected state if the user is interfacing with the sequence', =>


   it 'Should listen to the SequencerModel for updates', =>
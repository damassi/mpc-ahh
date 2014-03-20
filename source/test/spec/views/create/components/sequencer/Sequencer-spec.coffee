Sequencer = require '../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee'


describe 'Sequencer', ->


   beforeEach =>
      @view = new Sequencer()


   afterEach =>
      @view.remove()


   it 'Should render', ->


   it 'Should render out each pattern track', =>


   it 'Should update each pattern track when the kit changes', =>


   it 'Should play', =>


   it 'Should notifiy each track where its playstate is', =>


   it 'Should listen for tempo changes', =>


   it 'Should be mutable', =>


   it 'Should be able to globally update its volume', =>


   it 'Should be labeled properly', =>
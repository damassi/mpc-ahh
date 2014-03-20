PatternTrack = require  '../../../../../../src/scripts/views/create/components/sequencer/PatternTrack.coffee'


describe 'Pattern Track', ->


   beforeEach =>
      @view = new PatternTrack()


   afterEach =>
      @view.remove()


   it 'Should render', =>


   it 'Should render out child squares', =>


   it 'Should update each PatternSquare model when the kit changes', =>


   it 'Should listen for changes to the pattern squares', =>


   it 'Should dispatch changes back to the parent', =>
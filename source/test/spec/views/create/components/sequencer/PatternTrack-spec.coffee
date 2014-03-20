
PatternSquareModel = require  '../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee'
PatternSquareCollection = require  '../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee'
PatternTrackModel = require  '../../../../../../src/scripts/models/sequencer/PatternTrackModel.coffee'
PatternTrack = require  '../../../../../../src/scripts/views/create/components/sequencer/PatternTrack.coffee'


describe 'Pattern Track', ->


   beforeEach =>
      squares = []

      _(8).times =>
         squares.push new PatternSquareModel()

      @view = new PatternTrack
         collection: new PatternSquareCollection squares

      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', =>
      @view.$el.should.exist


   it 'Should render out child squares', =>
      @view.$el.find('.pattern-square').length.should.equal 8


   it 'Should listen for changes to the pattern squares', =>
      @view.collection.should.trigger('change:velocity').when =>
         @view.patternSquareViews[0].onClick()


   it 'Should dispatch changes back to the parent', =>


   it 'Should update each PatternSquare model when the kit changes', =>
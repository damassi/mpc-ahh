
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
         patternSquareCollection: new PatternSquareCollection squares
         patternTrackModel: new PatternTrackModel()

      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', =>
      @view.$el.should.exist


   it 'Should render out child squares', =>
      @view.$el.find('.pattern-square').length.should.equal 8


   it 'Should listen for changes to the pattern squares', =>
      @view.patternSquareCollection.should.trigger('change:velocity').when =>
         @view.patternSquareViews[0].onClick()


   it 'Should be mutable', =>
      @view.patternTrackModel.should.trigger('change:mute').when =>
         @view.mute()

      @view.patternTrackModel.should.trigger('change:mute').when =>
         @view.unmute()


   it 'Should add visual notification that track is muted', (done) =>
      @view.patternTrackModel.once 'change:mute', (model) =>
         @view.$el.hasClass('mute').should.be.true

      @view.mute()

      @view.patternTrackModel.once 'change:mute', =>
         @view.$el.hasClass('mute').should.be.false
         done()

      @view.unmute()




   it 'Should update each PatternSquare model when the kit changes', =>
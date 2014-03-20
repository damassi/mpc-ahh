AppModel = require '../../../../../../src/scripts/models/AppModel.coffee'
Sequencer = require '../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee'
PatternSquareModel = require '../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee'
PatternSquareCollection = require '../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee'
PatternTrackModel = require '../../../../../../src/scripts/models/sequencer/PatternTrackModel.coffee'
PatternTrackCollection = require '../../../../../../src/scripts/models/sequencer/PatternTrackCollection.coffee'


describe 'Sequencer', ->


   beforeEach =>
      tracks = []
      trackModels = []
      squareCollections = []

      _(6).times =>
         squares = []

         _(8).times =>
            squares.push new PatternSquareModel()

         trackModels.push new PatternTrackModel
            patternSquares: new PatternSquareCollection squares

      ptCollection = new PatternTrackCollection trackModels

      @view = new Sequencer
         appModel: new AppModel()
         patternTrackCollection: ptCollection

      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', =>
      @view.$el.should.exist


   it 'Should render out each pattern track', =>
      @view.$el.find('.pattern-track').length.should.equal 6


   it 'Should create a bpm interval', =>
      @view.bpmInterval.should.not.be null


   it 'Should listen for play / pause changes on the AppModel', =>
      @view.appModel.should.trigger('change:playing').when =>
         @view.togglePlay()


   it 'Should listen for bpm changes', =>
      @view.appModel.set('bpm', 200)
      @bpmInterval.should.equal 200


   it 'Should be mutable', =>
      @view.appModel.should.trigger('change:mute').when =>
         @view.mute()

      @view.appModel.should.trigger('change:mute').when =>
         @view.unmute()



   it 'Should update each pattern track when the kit changes', =>
Sequencer = require '../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee'


describe 'Sequencer', ->


   beforeEach =>
      @view = new Sequencer
         appModel: new AppModel()

      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', ->
      @view.$el.should.exist


   it 'Should render out each pattern track', =>
      @view.$el.find('.track').length.should.equal 6


   it 'Should play', =>
      @view.appModel.should.trigger('change:playing').when =>
         @view.togglePlay()


   it 'Should notifiy each track where its playstate is', =>
      #@view.patternTrackViews[0].


   it 'Should listen for tempo changes', =>


   it 'Should be mutable', =>


   it 'Should be able to globally update its volume', =>


   it 'Should be labeled properly', =>


   it 'Should update each pattern track when the kit changes', =>
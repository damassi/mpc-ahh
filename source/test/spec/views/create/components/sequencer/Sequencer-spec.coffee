AppModel = require '../../../../../../src/scripts/models/AppModel.coffee'
Sequencer = require '../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee'


describe 'Sequencer', ->


   beforeEach =>
      @view = new Sequencer
         appModel: new AppModel()

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
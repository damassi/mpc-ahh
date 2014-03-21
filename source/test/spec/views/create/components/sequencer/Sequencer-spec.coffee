AppConfig = require '../../../../../../src/scripts/config/AppConfig.coffee'
AppModel = require '../../../../../../src/scripts/models/AppModel.coffee'
Sequencer = require '../../../../../../src/scripts/views/create/components/sequencer/Sequencer.coffee'
KitCollection = require '../../../../../../src/scripts/models/kits/KitCollection.coffee'
InstrumentModel = require '../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee'
InstrumentCollection = require '../../../../../../src/scripts/models/sequencer/InstrumentCollection.coffee'
PatternSquareModel = require '../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee'
PatternSquareCollection = require '../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee'
helpers = require '../../../../../../src/scripts/helpers/handlebars-helpers'


describe 'Sequencer', ->


   beforeEach =>
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'

      @appModel = new AppModel
      @appModel.set 'kitModel', @kitCollection.at(0)

      @view = new Sequencer
         appModel: @appModel
         collection: @kitCollection.at(0).get('instruments')

      @view.render()


   afterEach =>
      @view.pause()
      @view.remove()



   it 'Should render', =>
      @view.$el.should.exist



   it 'Should render out each pattern track', =>
      @view.$el.find('.pattern-track').length.should.equal @kitCollection.at(0).get('instruments').length



   it 'Should create a bpm interval', =>
      expect(@view.bpmInterval).to.not.be null



   it 'Should listen for play / pause changes on the AppModel', =>
      @view.appModel.should.trigger('change:playing').when =>
         @view.pause()

      @view.appModel.should.trigger('change:playing').when =>
         @view.play()



   it 'Should listen for bpm changes', =>
      @view.appModel.set('bpm', 200)
      expect(@view.updateIntervalTime).to.equal 200



   it 'Should be mutable', =>
      @view.appModel.should.trigger('change:mute').when =>
         @view.mute()

      @view.appModel.should.trigger('change:mute').when =>
         @view.unmute()



   it 'Should listen for InstrumentTrackModel focus events', =>
      @view.collection.should.trigger('change:focus').when =>
         @view.patternTrackViews[0].onLabelClick()




   it 'Should update each pattern track when the kit changes', =>
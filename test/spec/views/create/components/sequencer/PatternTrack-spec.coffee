
AppConfig = require  '../../../../../../src/scripts/config/AppConfig.coffee'
AppModel = require  '../../../../../../src/scripts/models/AppModel.coffee'
KitCollection = require  '../../../../../../src/scripts/models/kits/KitCollection.coffee'
PatternSquareModel = require  '../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee'
PatternSquareCollection = require  '../../../../../../src/scripts/models/sequencer/PatternSquareCollection.coffee'
PatternTrack = require  '../../../../../../src/scripts/views/create/components/sequencer/PatternTrack.coffee'
InstrumentModel = require  '../../../../../../src/scripts/models/sequencer/InstrumentModel.coffee'

describe 'Pattern Track', ->


   beforeEach =>
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'

      @appModel = new AppModel
      @appModel.set 'kitModel', @kitCollection.at(0)

      @view = new PatternTrack
         appModel: @appModel
         model: @kitCollection.at(0).get('instruments').at(0)

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


   it 'Should be mutable', =>
      @view.model.should.trigger('change:mute').when =>
         @view.mute()

      @view.model.should.trigger('change:mute').when =>
         @view.unmute()


   it 'Should add visual notification that track is muted', (done) =>
      @view.model.once 'change:mute', (model) =>
         @view.$el.hasClass('mute').should.be.true

      @view.mute()

      @view.model.once 'change:mute', =>
         @view.$el.hasClass('mute').should.be.false
         done()

      @view.unmute()


   it 'Should be able to focus and unfocus', =>
      @view.model.should.trigger('change:focus').when =>
         @view.onLabelClick()




   it 'Should update each PatternSquare model when the kit changes', =>
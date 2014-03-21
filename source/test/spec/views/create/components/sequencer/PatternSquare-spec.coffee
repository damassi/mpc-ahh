AppConfig = require '../../../../../../src/scripts/config/AppConfig.coffee'
AppModel = require  '../../../../../../src/scripts/models/AppModel.coffee'
KitCollection = require  '../../../../../../src/scripts/models/kits/KitCollection.coffee'
PatternSquareModel = require  '../../../../../../src/scripts/models/sequencer/PatternSquareModel.coffee'
PatternSquare = require  '../../../../../../src/scripts/views/create/components/sequencer/PatternSquare.coffee'


describe 'Pattern Square', ->

   before =>
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'

      @appModel = new AppModel
      @appModel.set 'kitModel', @kitCollection.at(0)


   beforeEach =>
      @view = new PatternSquare
         appModel: @appModel
         patternSquareModel: new PatternSquareModel()

      @view.render()


   afterEach =>
      @view.remove()



   it 'Should render', =>
      @view.$el.should.exist



   it 'Should cycle through velocity volumes', =>

      @view.onClick()
      @view.patternSquareModel.get('velocity').should.equal 1
      @view.$el.hasClass('velocity-low').should.be.true

      @view.onClick()
      @view.patternSquareModel.get('velocity').should.equal 2
      @view.$el.hasClass('velocity-medium').should.be.true

      @view.onClick()
      @view.patternSquareModel.get('velocity').should.equal 3
      @view.$el.hasClass('velocity-high').should.be.true

      @view.onClick()
      @view.patternSquareModel.get('velocity').should.equal 0
      @view.$el.hasClass('velocity-high').should.be.false



   it 'Should toggle off', =>

      @view.disable()
      @view.patternSquareModel.get('velocity').should.equal 0



   it 'Should toggle on', =>

      @view.onClick()
      @view.onClick()
      @view.onClick()


      @view.disable()
      @view.enable()
      @view.patternSquareModel.get('velocity').should.equal 1



   it 'Should should flash when playing', =>

      @view.flashOn()
      @view.$el.hasClass('flash').should.be.true
      @view.flashOff()
      @view.$el.hasClass('flash').should.be.false

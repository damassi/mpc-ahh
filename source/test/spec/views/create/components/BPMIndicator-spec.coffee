BPMIndicator = require '../../../../../src/scripts/views/create/components/BPMIndicator.coffee'
AppModel     = require '../../../../../src/scripts/models/AppModel.coffee'
AppEvent     = require '../../../../../src/scripts/events/AppEvent.coffee'
AppConfig    = require '../../../../../src/scripts/config/AppConfig.coffee'

describe 'BPM Indicator', ->


   beforeEach =>
      @view = new BPMIndicator
         appModel: new AppModel()

      @view.render()


   afterEach =>
      if @view.updateInterval then clearInterval @view.updateInterval
      @view.remove()



   it 'Should render', =>

      @view.should.exist



   it 'Should display the current BPM in the label', =>

      $label = @view.$el.find '.label-bpm'
      $label.text().should.equal String(@view.appModel.get('bpm'))



   it 'Should auto-advance the bpm via setInterval on press', (done) =>

      @view.bpmIncreaseAmount = 50
      @view.intervalUpdateTime = 1
      appModel = @view.appModel
      appModel.set 'bpm', 1

      setTimeout =>
         bpm = appModel.get 'bpm'

         if bpm >= 120
            @view.onBtnUp()
            done()
      , 100

      @view.onIncreaseBtnDown()



   it 'Should clear the interval on release', =>

      @view.onIncreaseBtnDown()
      @view.updateInterval.should.exist
      @view.onBtnUp()
      expect(@view.updateInterval).to.be.null


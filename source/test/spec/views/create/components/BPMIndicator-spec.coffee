BPMIndicator = require  '../../../../../src/scripts/views/create/components/BPMIndicator.coffee'
AppModel     = require '../../../../../src/scripts/models/AppModel.coffee'

describe 'BPM Indicator', ->


   beforeEach =>
      @view = new BPMIndicator
         appModel: new AppModel()

      @view.render()


   afterEach =>
      @view.remove()



   it 'Should render', =>

      @view.should.exist



   it 'Should display the current BPM in the label', =>

      $label = @view.$el.find '.label-bpm'
      $label.text().should.equal @view.appModel.get 'bpm'



   it 'Should update the BPM on + and - button clicks', =>

      $label = @view.$el.find '.label-bpm'
      appModel = @view.appModel

      appModel.should.trigger('change:bpm').when =>
         @view.onIncreaseBtnClick()

      appModel.should.trigger('change:bpm').when =>
         @view.onDecreaseBtnClick()



   it 'Should auto-advance the bpm via setInterval on press', (done) =>

      $increaseBtn = @view.$el.find '.btn-increase'

      appModel = @view.appModel
      appModel.set 'bpm', 1

      inverval = setInterval =>
         bpm = appModel.get 'bpm'

         if bpm is 120
            $increseBtn.mouseup()
            clearInterval interval
            done()
      , 10

      $increseBtn.mousedown()




   it 'Should clear the interval on release', =>

      $increaseBtn = @view.$el.find '.btn-increase'
      $increaseBtn.mousedown()

      @view.updateInterval.should.exist

      $increaseBtn.mouseup()

      @view.updateInterval.should.be.null


Instrument = require  '../../../../../../src/scripts/views/create/components/instruments/Instrument.coffee'
KitModel   = require  '../../../../../../src/scripts/models/kits/KitModel.coffee'


describe 'Instrument', ->


   beforeEach =>
      @view = new Instrument
         kitModel: new KitModel()

      @view.render()


   afterEach =>
      @view.remove()



   it 'Should render', =>
      @view.should.exist


   it 'Should allow user to select instruments', =>
      @view.onClick()
      expect(@view.$el.hasClass('selected')).to.be.true
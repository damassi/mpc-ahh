CreateView = require  '../../src/scripts/views/create/CreateView.coffee'


describe 'Create View', ->

   beforeEach =>
      @view = new CreateView
      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', =>
      expect(@view.el).to.exist
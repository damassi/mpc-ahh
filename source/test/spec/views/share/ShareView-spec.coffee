ShareView = require  '../../../../src/scripts/views/share/ShareView.coffee'


describe 'Share View', ->

   beforeEach =>
      @view = new ShareView
      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', =>
      expect(@view.el).to.exist
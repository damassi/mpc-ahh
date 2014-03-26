ShareView = require  '../../../../src/scripts/views/share/ShareView.coffee'


describe 'Share View', ->

   beforeEach =>
      @view = new ShareView
      @view.render()


   afterEach =>
      @view.remove()


   it 'Should render', =>
      expect(@view.el).to.exist


   it 'Should accept a SoundShare object', =>


   it 'Should render the visualization layer', =>


   it 'Should pause playback of the audio track on init', =>


   it 'Should toggle the play / pause button', =>


   it 'Should display the users song title and username', =>

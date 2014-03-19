AppController = require  '../../../../src/scripts/AppController.coffee'
LandingView   = require  '../../../../src/scripts/views/landing/LandingView.coffee'

describe 'Landing View', ->

   beforeEach =>
      @view = new LandingView
      @view.render()


   afterEach =>
      @view.remove()

      if @appController then @appController.remove()



   it 'Should render', =>
      expect(@view.el).to.exist



   it 'Should redirect to create page on click', (done) =>

      @appController = new AppController()
      router = @appController.appRouter
      $startBtn = @view.$el.find '.start-btn'

      $startBtn.on 'click', (event) =>
         'create'.should.route.to router, 'createRoute'
         done()

      $startBtn.click()









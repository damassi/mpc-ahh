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
      $startBtn = @view.$el.find '.start-btn'

      $startBtn.on 'click', (event) =>
         $btn = $(event.currentTarget)

         expect($btn.attr 'href').to.equal '#/create'
         done()

      $startBtn.click()







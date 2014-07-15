AppConfig = require  '../../../../src/scripts/config/AppConfig.coffee'
KitCollection = require  '../../../../src/scripts/models/kits/KitCollection.coffee'
AppController = require  '../../../../src/scripts/AppController.coffee'
LandingView   = require  '../../../../src/scripts/views/landing/LandingView.coffee'

describe 'Landing View', ->

   beforeEach =>
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'

      @view = new LandingView
      @view.render()


   afterEach =>
      @view.remove()

      if @appController then @appController.remove()



   it 'Should render', =>
      expect(@view.el).to.exist



   it 'Should redirect to create page on click', (done) =>

      @appController = new AppController
         kitCollection: @kitCollection

      router = @appController.appRouter
      $startBtn = @view.$el.find '.start-btn'

      $startBtn.on 'click', (event) =>
         'create'.should.route.to router, 'createRoute'
         done()

      $startBtn.click()









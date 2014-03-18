KitSelection = require  '../../../../../src/scripts/views/create/components/KitSelection.coffee'
KitModel      = require '../../../../../src/scripts/models/KitModel.coffee'
KitCollection = require '../../../../../src/scripts/models/KitCollection.coffee'


describe 'Kit Selection', ->


   beforeEach =>
      models = []

      _(4).times (index) ->
         models.push new KitModel {label: "kit #{index}"}


      @view = new KitSelection
         collection: new KitCollection models

      console.log @view.collection


   afterEach =>
      @view.remove()



   it 'Should render', =>

      @view.$el.should.exist



   it 'Should have a label', =>

      $label = @view.$el.find '.label-kit'
      $label.text @view.collection.at(0).get 'label'

      $label.text().should.equal 'kit 0'



   it 'Should toggle between labels', (done) =>

      $leftBtn = @view.$el.find '.btn-left'
      $rightBtn = @view.$el.find '.btn-right'
      $label = @view.$el.find '.label-kit'

      firstLabel = @view.collection.at(0).get 'label'
      lastLabel = @view.collection.at(@view.collection.length-1).get 'label'

      $leftBtn.on 'click', =>
         $label.text().should.equal lastLabel

      $rightBtn.on 'click', =>
         $label.text().should.equal firstLabel
         done()

      if $leftBtn.length
         $leftBtn.click()
         $rightBtn.click()

      else
         throw new Error()
         done()



   it 'Should call appropriate arrow methods when clicked', =>

      $leftBtn = @view.$el.find '.btn-left'
      $rightBtn = @view.$el.find '.btn-right'


      @view.should.call('nextKit').when =>
         $leftBtn.trigger 'click'


      @view.should.call('previousKit').when =>
         $leftBtn.trigger 'click'
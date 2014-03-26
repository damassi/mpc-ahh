AppConfig     = require '../../../src/scripts/config/AppConfig.coffee'
KitCollection = require '../../../src/scripts/models/kits/KitCollection.coffee'

describe 'Kit Collection', ->

   beforeEach =>
      @kitCollection = new KitCollection
         parse: true

      @kitCollection.fetch
         async: false
         url: AppConfig.returnTestAssetPath('data') + '/' + 'sound-data.json'


   it 'Should parse the response and append an assetPath to each kit model', =>
      @kitCollection.at(0).get('path').should.exist


   it 'Should return the next kit', =>
      kitData = @kitCollection.toJSON()
      kit = @kitCollection.nextKit()
      kit.get('label').should.equal kitData[1].label


   it 'Should return the previous kit', =>
      kitData = @kitCollection.toJSON()
      kit = @kitCollection.previousKit()
      kit.get('label').should.equal kitData[kitData.length-1].label
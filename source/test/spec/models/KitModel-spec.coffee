AppConfig     = require '../../../src/scripts/config/AppConfig.coffee'
KitModel      = require '../../../src/scripts/models/kits/KitModel.coffee'
InstrumentCollection = require '../../../src/scripts/models/sequencer/InstrumentCollection.coffee'

describe 'Kit Model', ->

   beforeEach =>

      data = {
         "label": "Hip Hop",
         "folder": "hip-hop",
         "instruments": [
            {
               "label": "Closed HiHat",
               "src": "HAT_2.mp3",
               "icon": "icon-hihat-closed"
            },
            {
               "label": "Kick Drum",
               "src": "KIK_2.mp3",
               "icon": "icon-kickdrum"
            }
         ]
      }

      @kitModel = new KitModel data, { parse: true }


   it 'Should parse the model data and convert instruments to an InstrumentsCollection', =>
      @kitModel.get('instruments').should.be.an.instanceof InstrumentCollection
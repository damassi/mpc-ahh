AppConfig = require '../../../../../../src/scripts/config/AppConfig.coffee'
AppModel = require  '../../../../../../src/scripts/models/AppModel.coffee'
KitCollection = require  '../../../../../../src/scripts/models/kits/KitCollection.coffee'
PadSquareModel = require '../../../../../../src/scripts/models/pad/PadSquareModel.coffee'
PadSquareCollection = require '../../../../../../src/scripts/models/pad/PadSquareCollection.coffee'
PadSquare = require '../../../../../../src/scripts/views/create/components/pad/PadSquare.coffee'
PadSquare = require '../../../../../../src/scripts/views/create/components/pad/LivePad.coffee'


describe 'Live Pad', ->


   it 'Should render', =>


   it 'Should render out 16 pad squares'


   it 'Should render out the entire kit collection'


   it 'Should listen to drops from the kits to the pads'


   it 'Should update the PadSquareCollection with the current kit when dropped'
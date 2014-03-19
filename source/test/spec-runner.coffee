
describe 'Models', =>

   require './spec/models/KitCollection-spec.coffee'
   require './spec/models/KitModel-spec.coffee'


describe 'Views', =>

   require './spec/views/landing/LandingView-spec.coffee'
   require './spec/views/create/components/KitSelection-spec.coffee'
   require './spec/views/create/components/BPMIndicator-spec.coffee'
   require './spec/views/create/components/instruments/InstrumentSelectionPanel-spec.coffee'
   require './spec/views/create/components/instruments/Instrument-spec.coffee'

   require './spec/views/create/components/sequencer/SequencerSquare-spec.coffee'
   require './spec/views/create/components/sequencer/SequencerTrack-spec.coffee'
   require './spec/views/create/components/sequencer/Sequencer-spec.coffee'

return

require './spec/views/share/ShareView-spec.coffee'

# Create
require './spec/views/create/CreateView-spec.coffee'






require './spec/models/SoundCollection-spec.coffee'
require './spec/models/SoundModel-spec.coffee'

# Controllers
require './spec/AppController-spec.coffee'

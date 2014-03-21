
describe 'Models', =>

   require './spec/models/KitCollection-spec.coffee'
   require './spec/models/KitModel-spec.coffee'


describe 'Views', =>

   require './spec/views/landing/LandingView-spec.coffee'
   require './spec/views/create/components/KitSelection-spec.coffee'
   require './spec/views/create/components/BPMIndicator-spec.coffee'


   describe 'Instrument Selector', =>

      require './spec/views/create/components/instruments/InstrumentSelectionPanel-spec.coffee'
      require './spec/views/create/components/instruments/Instrument-spec.coffee'


   describe 'Sequencer', =>

      require './spec/views/create/components/sequencer/PatternSquare-spec.coffee'
      require './spec/views/create/components/sequencer/PatternTrack-spec.coffee'
      require './spec/views/create/components/sequencer/Sequencer-spec.coffee'



require './spec/views/share/ShareView-spec.coffee'
require './spec/views/create/CreateView-spec.coffee'



require './spec/models/SoundCollection-spec.coffee'
require './spec/models/SoundModel-spec.coffee'

# Controllers
require './spec/AppController-spec.coffee'

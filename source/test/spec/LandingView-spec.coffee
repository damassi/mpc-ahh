
ReactTestUtils = React.addons.TestUtils
LandingView = require( '../../src/scripts/views/landing/LandingView.coffee')

describe 'Landing View', ->


   it 'Should Render', ->
      model = new Backbone.Model({ name: 'chris' })
      landingView = LandingView({ model: model, name: 'bob'})

      ReactTestUtils.renderIntoDocument(landingView);
      #ReactTestUtils.Simulate.click(label.refs.p);

      expect(landingView.props.name).to.equal 'bob'

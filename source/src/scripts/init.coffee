###*
  @jsx React.DOM
###

HelloMessage = require './views/landing/LandingView.coffee'

user = new Backbone.Model({ name: 'Chris' })

setTimeout ->
   user.set 'name', 'BOBBBB'
, 2000

React.renderComponent( HelloMessage({ model: user}), document.getElementById('wrapper')
)
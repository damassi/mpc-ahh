###*
  @jsx React.DOM
###

HelloMessage = React.createClass
   onClick: (event) ->
      console.log 'hey you'

   render: ->
      `<div className='test' onMouseOver={this.onClick}>{'Hello ' + this.props.name}</div>`

React.renderComponent(
   `<HelloMessage name='Hey Dude' />,
   document.getElementById('wrapper')`
)
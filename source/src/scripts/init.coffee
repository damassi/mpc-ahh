###*
  @jsx React.DOM
###

HelloMessage = React.createClass
   render: ->
      `<div>{'Hello ' + this.props.name}</div>`
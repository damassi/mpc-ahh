###*
  @jsx React.DOM
###

HelloMessage = React.createBackboneClass
   changeOptions: 'change:name'

   render: ->
      `<div className='test' onMouseOver={this.onClick}>{'Hello ' + this.getModel().get("name")}</div>`

   onClick: (event) ->
      console.log 'hey!'

module.exports = HelloMessage
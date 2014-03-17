###*
  @jsx React.DOM

  Sonic application bootstrapper
  @author Christopher Pappas <chris@wintr.us>
  @date   2.6.14
###


HelloMessage = React.createBackboneClass
   changeOptions: 'change:name'

   render: ->
      `<div className='test' onMouseOver={this.onClick}>{'Hello ' + this.getModel().get("name")}</div>`

   onClick: (event) ->
      console.log 'hey!'

module.exports = HelloMessage
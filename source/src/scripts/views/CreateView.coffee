###*
  @jsx React.DOM

  Primary app view which allows the user to create tracks

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###


CreateView = React.createBackboneClass


   render: ->
      return `(
         <div className='create-view' onClick={this.onClick}>CREATE BEAT</div>
      )`


   onClick: ->
      console.log 'creating beat'


module.exports = CreateView
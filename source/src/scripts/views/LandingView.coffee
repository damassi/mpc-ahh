###*
  @jsx React.DOM

  Landing view with start button

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###


LandingView = React.createBackboneClass


   render: ->
      return `(
         <div className='landing-view' onClick={this.onClick}>START</div>
      )`


   onClick: ->
      window.location.hash = '#/create'


module.exports = LandingView
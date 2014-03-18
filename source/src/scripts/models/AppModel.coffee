###*
  Primary application model which coordinates state

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###


AppRouter = Backbone.Model.extend


   defaults:
      'view': null
      'kitModel':  null


module.exports = AppRouter
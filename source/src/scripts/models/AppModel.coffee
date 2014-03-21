###*
  Primary application model which coordinates state

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###

AppConfig = require '../config/AppConfig.coffee'


AppRouter = Backbone.Model.extend


   defaults:
      'view':        null
      'playing':     null
      'mute':        null

      'kitModel':    null

      # Settings
      'bpm':         AppConfig.BPM


module.exports = AppRouter
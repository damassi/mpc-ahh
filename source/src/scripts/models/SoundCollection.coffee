###*
 * Collection representing each sound from a kit set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

SoundModel = require './SoundModel.coffee'


class SoundCollection extends Backbone.Collection

   model: SoundModel


module.exports = SoundCollection
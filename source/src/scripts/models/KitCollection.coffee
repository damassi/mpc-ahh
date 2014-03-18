###*
 * Collection of sound kits
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

KitModel = require './KitModel.coffee'


class KitCollection extends Backbone.Collection

   model: KitModel


module.exports = KitCollection
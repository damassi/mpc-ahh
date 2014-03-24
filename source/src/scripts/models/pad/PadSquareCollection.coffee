###*
 * Collection of individual PadSquareModels
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

PadSquareModel = require './PadSquareModel.coffee'


class PadSquareCollection extends Backbone.Collection

   model: PadSquareModel


module.exports = PadSquareCollection
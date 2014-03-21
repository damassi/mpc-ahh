###*
 * Create view which the user can build beats within
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

View     = require '../../supers/View.coffee'
template = require './templates/create-template.hbs'


class CreateView extends View

   template: template


   initialize: (options) ->
      super options


   render: (options) ->
      super options


      @


module.exports = CreateView
###*
  @jsx React.DOM

  View for sharing / displaying final beat / animation

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###

View     = require '../../supers/View.coffee'
template = require './share-template.hbs'


class ShareView extends View

   template: template



module.exports = ShareView
###*
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

PadSquareModel = require '../../../../models/pad/PadSquareModel.coffee'
View           = require '../../../../supers/View.coffee'
PadSquare      = require './PadSquare.coffee'
template       = require './templates/live-pad-template.hbs'


class LivePad extends View


   # The classname for the Live Pad
   # @type {String}

   className: 'container-live-pad'


   # The template
   # @type {Function}

   template: template


   # Collection of kits to be rendered to the instrument container
   # @type {KitCollection}

   kitCollection: null


   # Appmodel for listening to show / hide events
   # @type {AppModel}

   appModel: null


   # An array of individual PadSquareViews
   # @type {Array}

   padSquareViews: null


   # Key command keymap for live kit playback
   keymap: ['1','2','3','4','q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v']



   # Render the view and and parse the collection into a displayable
   # instrument / pad table
   # @param {Object} options
   # @return {LivePad}

   render: (options) ->

      @padSquareViews = []
      tableData = {}
      rows = []
      iterator = 0

      # Render out rows
      _(4).times (index) =>
         tds  = []

         # Render out columns
         _(4).times (index) =>

            # Instantiate each pad view and tie the id
            # to the DOM element

            model = new PadSquareModel
               keycode: @keymap[iterator]

            padSquare = new PadSquare
               model: model
               collection: @kitCollection

            @padSquareViews.push padSquare
            iterator++

            tds.push {
               id: padSquare.model.get('id')
            }

         rows.push {
            id: "pad-row-#{index}"
            tds: tds
         }

      tableData.rows = rows

      # Render the table to the DOM
      super tableData

      # Render squares to the DOM
      _.each @padSquareViews, (padSquare) =>
         id = padSquare.model.get 'id'
         @$el.find("##{id}").html padSquare.render().el


      @$padContainer        = @$el.find '.container-pads'
      @$instrumentContainer = @$el.find '.container-instruments'

      @




   # Add collection listeners to listen for instrument drops

   addEventListeners: ->







module.exports = LivePad
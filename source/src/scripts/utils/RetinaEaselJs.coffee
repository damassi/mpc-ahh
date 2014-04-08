

# Thanks! http://www.unfocus.com/2014/03/03/hidpiretina-for-createjs-flash-pro-html5-canvas/

module.exports =


    # Reset the canvas to support DevicePixelRatio and scale up
    # @param {HTMLDOMElement} canvas The canvas to transform

    init: (canvas, stage) ->

        if window.devicePixelRatio
            height = canvas.getAttribute('height')
            width  = canvas.getAttribute('width')

            # Reset the canvas width and height with window.devicePixelRatio applied
            canvas.setAttribute('width', Math.round(width * window.devicePixelRatio))
            canvas.setAttribute('height', Math.round( height * window.devicePixelRatio))

            # Force the canvas back to the original size using css
            canvas.style.width = width + "px"
            canvas.style.height = height + "px"

            # Set CreateJS to render scaled
            stage.scaleX = stage.scaleY = window.devicePixelRatio
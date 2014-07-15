/**
 * Touch related utilities
 *
 */

var Touch = {


  /**
   * Delegate touch events to mouse if not on a touch device
   */

  translateTouchEvents: function () {

    if (! ('ontouchstart' in window )) {
      $(document).on( 'mousedown', 'body', function(e) {
        $(e.target).trigger( 'touchstart' )
      })

      $(document).on( 'mouseup', 'body',  function(e) {
        $(e.target).trigger( 'touchend' )
      })
    }
  }

}

module.exports = Touch
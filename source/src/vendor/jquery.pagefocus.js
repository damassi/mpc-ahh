/*    Begin Plugin    */
;;(function($){$.winFocus||($.extend({winFocus:function(){var a=!0;$(document).data("winFocus")||$(document).data("winFocus",$.winFocus.init());for(x in arguments)"object"==typeof arguments[x]?(arguments[x].blur&&($.winFocus.methods.blur=arguments[x].blur),arguments[x].focus&&($.winFocus.methods.focus=arguments[x].focus),arguments[x].blurFocus&&($.winFocus.methods.blurFocus=arguments[x].blurFocus),arguments[x].initRun&&(a=arguments[x].initRun)):"function"==typeof arguments[x]?
void 0===$.winFocus.methods.blurFocus?$.winFocus.methods.blurFocus=arguments[x]:($.winFocus.methods.blur=$.winFocus.methods.blurFocus,$.winFocus.methods.blurFocus=void 0,$.winFocus.methods.focus=arguments[x]):"boolean"==typeof arguments[x]&&(a=arguments[x]);if(a)$.winFocus.methods.onChange()}}),$.winFocus.init=function(){$.winFocus.props.hidden in document?document.addEventListener("visibilitychange",$.winFocus.methods.onChange):($.winFocus.props.hidden=
"mozHidden")in document?document.addEventListener("mozvisibilitychange",$.winFocus.methods.onChange):($.winFocus.props.hidden="webkitHidden")in document?document.addEventListener("webkitvisibilitychange",$.winFocus.methods.onChange):($.winFocus.props.hidden="msHidden")in document?document.addEventListener("msvisibilitychange",$.winFocus.methods.onChange):($.winFocus.props.hidden="onfocusin")in document?document.onfocusin=document.onfocusout=$.winFocus.methods.onChange:
window.onpageshow=window.onpagehide=window.onfocus=window.onblur=$.winFocus.methods.onChange;return $.winFocus},$.winFocus.methods={blurFocus:void 0,blur:void 0,focus:void 0,exeCB:function(a){$.winFocus.methods.blurFocus?$.winFocus.methods.blurFocus(a,!a.hidden):a.hidden?$.winFocus.methods.blur&&$.winFocus.methods.blur(a):$.winFocus.methods.focus&&$.winFocus.methods.focus(a)},onChange:function(a){var b={focus:!1,focusin:!1,pageshow:!1,blur:!0,focusout:!0,
pagehide:!0};if(a=a||window.event)a.hidden=a.type in b?b[a.type]:document[$.winFocus.props.hidden],$(window).data("visible",!a.hidden),$.winFocus.methods.exeCB(a);else try{$.winFocus.methods.onChange.call(document,new Event("visibilitychange"))}catch(c){}}},$.winFocus.props={hidden:"hidden"})})(jQuery);
/*    End Plugin      */

// Simple example
$(function() {
  $.winFocus(function(event, isVisible) {
    //console.log("Combo\t\t", isVisible, event);

    $('td tbody').empty();
    $.each(event, function(i) {
      $('td tbody').append(
        $('<tr />').append(
          $('<th />', { text: i }),
          $('<td />', { text: this.toString() })
        )
      )
    });

    if (isVisible)
      $("#isVisible").stop().delay(100).fadeOut('fast', function(e) {
        $('body').addClass('visible');
        $(this).stop().text('TRUE').fadeIn('slow');
      });
    else {
      $('body').removeClass('visible');
      $("#isVisible").text('FALSE');
    }
  });
})


/*    Alternate ways to use this plugin */
/*

$.winFocus({
  blur: function(event) {
    console.log("Blur\t\t", event);
  },
  focus: function(event) {
    console.log("Focus\t\t", event);
  }
});

$.winFocus(function(event) {
  console.log("Blur\t\t", event);
},
function(event) {
  console.log("Focus\t\t", event);
});

*/
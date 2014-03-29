(function($) {

  $.fn.column = function() {
    return $(this)
      .filter('th, td')
      .filter(':not([colspan])')
      .closest('table')
      .find('tr')
      .filter(':not(:has([colspan]))')
      .children(':nth-child(' + ($(this).index()+1) + ')');
  }

})(jQuery);
var IntervalManager = {
  intervals : {},

  make : function ( fun, delay ) {
    //see explanation after the code
    var newInterval = setInterval.apply(
      window,
      [ fun, delay ].concat( [].slice.call(arguments, 2) )
    );

    this.intervals[ newInterval ] = true;

    return newInterval;
  },

  clear : function ( id ) {
    return clearInterval( this.intervals[id] );
  },

  clearAll : function () {
    var all = Object.keys( this.intervals ), len = all.length;

    while ( len --> 0 ) {
      clearInterval( all.shift() );
    }
  }
};

module.exports = IntervalManager

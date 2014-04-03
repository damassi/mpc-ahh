###*
 * Application related events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###


AppEvent =

   BREAKPOINT_MATCH      : 'breakpoint:match'
   BREAKPOINT_UNMATCH    : 'breakpoint:unmatch'

   CHANGE_ACTIVE         : 'change:active'
   CHANGE_BPM            : 'change:bpm'
   CHANGE_DRAGGING       : 'change:dragging'
   CHANGE_DROPPED        : 'change:dropped'
   CHANGE_FOCUS          : 'change:focus'
   CHANGE_INSTRUMENT     : 'change:currentInstrument'
   CHANGE_ISMOBILE       : 'change:isMobile'
   CHANGE_KIT            : 'change:kitModel'
   CHANGE_MUTE           : 'change:mute'
   CHANGE_PLAYING        : 'change:playing'
   CHANGE_SHARE_ID       : 'change:shareId'
   CHANGE_SHOW_SEQUENCER : 'change:showSequencer'
   CHANGE_SHOW_PAD       : 'change:showPad'
   CHANGE_TRIGGER        : 'change:trigger'
   CHANGE_VELOCITY       : 'change:velocity'
   CHANGE_VIEW           : 'change:view'

   SAVE_TRACK:             'onSaveTrack'

   OPEN_SHARE            : 'onOpenShare'
   CLOSE_SHARE           : 'onCloseShare'

module.exports = AppEvent
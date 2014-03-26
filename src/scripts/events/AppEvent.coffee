###*
 * Application related events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###


AppEvent =

   CHANGE_ACTIVE:     'change:active'
   CHANGE_BPM:        'change:bpm'
   CHANGE_DRAGGING:   'change:dragging'
   CHANGE_DROPPED:    'change:dropped'
   CHANGE_FOCUS:      'change:focus'
   CHANGE_INSTRUMENT: 'change:currentInstrument'
   CHANGE_KIT:        'change:kitModel'
   CHANGE_MUTE:       'change:mute'
   CHANGE_PLAYING:    'change:playing'
   CHANGE_TRIGGER:    'change:trigger'
   CHANGE_VELOCITY:   'change:velocity'

   IMPORT_TRACK:      'onImportTrack'
   EXPORT_TRACK:      'onExportTrack'

module.exports = AppEvent
###*
 * Global PubSub events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

PubSub =

  BEAT         : 'onBeat'
  EXPORT_TRACK : 'onExportTrack'
  IMPORT_TRACK : 'onImportTrack'
  ROUTE        : 'onRouteChange'
  SAVE_TRACK   : 'onSaveTrack'

module.exports = PubSub

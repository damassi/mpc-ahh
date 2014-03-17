
template   = require './test-template.hbs'


class MobileTest extends Backbone.View


   className: 'view'
   currCellId: -1


   events:
      'click #sequencer td':   'onCellClick'
      'touchstart #pad td':    'onPadCellClick'
      'touchstart #start-btn': 'onMobileStart'



   initialize: ->

      @soundData =
         beats: 8
         sounds: [
            { id: "KIK_1.mp3" }
            { id: "KIK_3.mp3" }
            { id: "SN4.mp3" }
            { id: "OP_HAT_3.mp3" }
            { id: "TAMB.mp3" }
            { id: "HAT_5.mp3" }
            { id: "SHAKER_2.mp3" }
            { id: "RIM__2.mp3" }

         ]

      @soundData.numSounds = @soundData.sounds.length
      @numCells = @soundData.beats - 1

      @render()



   render: ->
      $('body').append @$el.html template @soundData
      @$th = @$el.find 'th'

      @initializeAudio()
      @startSequencer()



   initializeAudio: =>
      path = 'assets/audio'

      @soundArray = []

      for i in [0...@soundData.sounds.length]
         beatArray = []

         for j in [0..@soundData.beats-1]
            beatArray.push {
               active: false
            }

         soundId  = @soundData.sounds[i].id
         soundSrc = path + '/' + soundId

         #createjs.Sound.registerSound soundSrc, soundId

         @soundArray.push {
            src: soundSrc
            soundId: soundId
            beats: beatArray
         }




   startSequencer: ->
      @interval = setInterval @onTick, 200





   playAudio: ->
      @soundArray.forEach (sound, index) =>
         {soundId, src} = sound

         beat = sound.beats[@currCellId]

         $tr = $("#sequencer tr[data-sound=#{index+1}]")
         $td = $tr.find("[data-beat=#{@currCellId+1}]");

         if beat.active
            @$activeSquare = $td

            TweenMax.to $td, .2,
               backgroundColor: Math.random() * 0xFF0000
               ease: Back.easeIn
               scale: .5
               onComplete: ->
                  TweenMax.to $td, .2,
                     backgroundColor: "#000000"
                     scale: 1
                     ease: Back.easeOut



            #createjs.Sound.play(soundId)
            new Howl({ urls: [src] }).play()





   onTick: =>
      @$th.removeClass 'step'
      @currCellId = if @currCellId < @numCells then @currCellId += 1 else @currCellId = 0
      $(@$th[@currCellId]).addClass 'step'

      @playAudio()




   onCellClick: (event) ->
      $cell = $(event.currentTarget)
      $parent = $cell.parent()

      soundId = $parent.data('sound') - 1
      beatId  = $cell.data('beat') - 1
      beat = @soundArray[soundId].beats[beatId]

      if $cell.hasClass 'active'
         $cell.removeClass 'active'
         TweenMax.killTweensOf @$activeSquare
         $cell.attr 'style', ''
         beat.active = false
      else
         $cell.addClass 'active'
         beat.active = true



   onPadCellClick: (event) ->
      $target = $(event.currentTarget)
      id = $target.text()

      TweenMax.to $target, .2,
         backgroundColor: Math.random() * 0xFF0000
         ease: Back.easeOut
         scale: .9
         onComplete: ->
            TweenMax.to $target, .2,
               backgroundColor: "#fff"
               scale: 1
               ease: Back.easeIn

      path = 'assets/audio'

      sound = path + '/' + switch +id
         when 1 then 'TAMB.mp3'
         when 2 then 'CLAP.mp3'
         when 3 then 'RIDE_CYM.mp3'
         when 4 then 'KIK_8.mp3'

      new Howl({ urls: [sound] }).play()



   onMobileStart: (event) ->
      #createjs.Sound.play('SHAKER_2.mp3')
      new Howl({ urls: ['assets/audio/SHAKER_2.mp3'] }).play()





module.exports = MobileTest
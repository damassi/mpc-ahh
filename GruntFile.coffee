###*
 * Development tasks
 *
 * @author  Christopher Pappas
 * @date    2.3.14
 *
 * Primary Tasks:
 *    grunt dev   : Development mode, file-watcher
 *    grunt build : Minify all sources and deploy for distribution
 *
###

"use strict"

handleify = require 'handleify'
coffeeify = require 'coffeeify'
uglifyify = require 'uglifyify'
reactify  = require 'reactify'

module.exports = (grunt) ->

  # Root application path
  basePath = '.'

  # Directory where source files live
  sources = "#{basePath}/src"

  # Directory where vendor files live
  vendor = "#{sources}/vendor"

  # Path to compile to during development
  output = "#{basePath}/public"

  # Test specs directory and html
  test = "#{basePath}/test"

  # Path to build final deploy files
  dist = "../"

  # Browser port during development
  port = 3000


  grunt.initConfig

    'bower':
      vendor:
        dest: "#{vendor}"


    'browserify':
      dev:
        src: ["#{sources}/scripts/initialize.coffee"]
        dest: "#{output}/assets/scripts/app.js"

        options:
          transform: [
            handleify
            coffeeify
          ]
          debug: true

      test:
        src: ["#{test}/spec-runner.coffee"]
        dest: "#{test}/html/spec/spec-runner.js"

        options:
          transform: "<%= browserify.dev.options.transform %>"
          debug: "<%= browserify.dev.options.debug %>"

      dist:
        src: "<%= browserify.dev.src %>"
        dest: "<%= browserify.dev.dest %>"

        options:
          transform: [
            handleify
            coffeeify
            uglifyify
          ]
          debug: false


    'coffeelint':
      test: [
        "#{sources}/**/*.coffee"
        "#{test}/**/*.coffee"
      ]


    'concat':
      options:
        separator: ';'

      vendor:
        src: [
          "#{vendor}/jquery.js"
          "#{vendor}/lodash.js"
          "#{vendor}/backbone.js"
          "#{vendor}/greensock.js"
          "#{vendor}/Draggable.js"
          "#{vendor}/backbone-relational.js"
          "#{vendor}/howler.js"
          "#{vendor}/shims/requestAnimFrame.js"
          "#{vendor}/betterInterval.js"
        ]
        dest: "#{output}/assets/scripts/vendor.js"


    'connect':
      dev:
        options:
          hostname: null
          port: "#{port}"
          base: "#{output}"
          livereload: true


    'copy':
      assets:
        files: [
          {
            expand: true
            cwd: "#{sources}/assets"
            src: ['**']
            dest: "#{output}/assets"
          },
          {
            expand: true
            cwd: "#{sources}/assets"
            src: ['**']
            dest: "#{test}/html/assets"
          },
          {
            expand: true
            cwd: "#{sources}/statics"
            src: ['**']
            dest: "#{output}/statics"
          }
        ]

      html:
        files: [{
          expand: true
          cwd: "#{sources}/html"
          src: ['**']
          dest: "#{output}"
        }]

      dist:
        files: [{
          expand: true
          cwd: "#{output}"
          src:['**']
          dest: "#{dist}"
        }]


    'clean':
      dev:
        files: [{
          expand: true
          cwd: "#{output}"
          src: ['**']
        }]

      dist:
        files: [{
          expand: true
          cwd: "#{dist}/assets"
          src: ['**']
        }]


    'imagemin':
      dist:
        options:
          pngquant: true
          optimizationLevel: 5

        files: [{
          expand: true
          cwd: "#{output}/assets/images/"
          src: ['**/*.{png,jpg,gif}']
          dest: "#{output}/assets/images/"
        }]


    'mocha':
      test:
        options:
          reporter: 'Spec'
          run: true
          require: 'coffee-script'

        mocha:
          ignoreLeaks: true

        src: ["#{test}/**/*.html"]


    'sass':
      dev:
        options:
          style: "expanded"
          compass: true
          sourcemap: true

        files: [{
          src: ["#{sources}/styles/main.scss"]
          dest: "#{output}/assets/styles/app.css"
        }]
      dist:
        options:
          style: "compressed"
          compass: true
          sourcemap: false

        files: [{
          src: "#{sources}/styles/main.scss"
          dest: "#{output}/assets/styles/app.css"
        }]


    'watch':
      options:
        livereload: true
        spawn: false

      assets:
        files: "#{sources}/assets/**/*.*"
        tasks: ['copy:assets']

      html:
        files: "#{sources}/html/**/*.*"
        tasks: ['copy:html']

      scripts:
        files: "#{sources}/scripts/**/*.{js,coffee,hbs}"
        tasks: [
          'browserify:dev',
          'browserify:test'
        ]

      styles:
        files: "#{sources}/styles/**/*.{scss,sass}"
        tasks: ['sass:dev']

      test:
        files: [ 'test/**/*.*' ]
        tasks: [ 'browserify:test' ]

      vendor:
        files: "#{vendor}/**/*.js"
        tasks: ['concat:vendor']


    'uglify':
      source:
        src: "#{output}/assets/scripts/app.js"
        dest: "#{output}/assets/scripts/app.js"

      vendor:
        src: "#{output}/assets/scripts/vendor.js"
        dest: "#{output}/assets/scripts/vendor.js"


  # + ----------------------------------------------------------


  grunt.registerTask 'dev', [
    'clean:dev'
    'copy:assets'
    'copy:html'
    'browserify:dev'
    'sass:dev'
    'bower:vendor'
    'concat:vendor'
    'test'
    'connect'
    'watch'
  ]

  grunt.registerTask 'build', [
    'clean:dist'
    'copy:assets'
    'copy:html'
    'browserify:dist'
    'sass:dist'
    'bower:vendor'
    'concat:vendor'
    'uglify'
    'imagemin'
    'copy:dist'
  ]

  grunt.registerTask 'test', [
    'browserify:dev'
    'browserify:test'
    'concat:vendor'
  ]

  grunt.registerTask 'default', ['dev']


  # + ----------------------------------------------------------

  require('load-grunt-tasks')(grunt)

  # Print stack traces on error
  grunt.option 'stack', true

  # Continue running grunt on error
  grunt.option 'force', true

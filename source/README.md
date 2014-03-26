MPC AHH Frontend Project (coke-teen-ahh-38h)
================================================================

Built on top of Backbone.js and CoffeeScript


Technologies
-----------
Backbone.js - Application state
Howler.js - Audio playback
Easel.js - Canvas visualization
Parse - Remote data storage / sharing


Project Setup
-------------
- Install Node
 - [Node.js Installer](http://nodejs.org/)
- Install Grunt command line interface
 - `sudo npm install -g grunt-cli`
- For sourcemap and Compass support, SASS and Compass gems need to be installed with the --pre flag
 - `gem install sass --pre && gem install compass --pre`
- Clone the repo and cd into the `source` folder
- Then install Grunt task dependencies
 - `npm install`


To commit to Wieden Github and S3 staging
----------------------
- While in development environment run `grunt build`
- Commit your changes to beanstalk mpc repo
- In a seperate folder outside of the Beanstalk repo, run
  - `git clone git@github.com:wieden-kennedy/coke-teen-ahh-38h.git`
-



Development Tasks
-----------------
- For development: `grunt dev` then navigate to `http://localhost:3000` (or IP address).
- For deploy: `grunt build`

This concatinates and minifies all CoffeeScripts and SASS and moves the project into 'dist' for production deploy.


Bower
-----
Bower is used for client-side package management.  Packages installed via bower are then copied over to `vendor` via `grunt bower` and each time you run `grunt dev`.

- To search for packages
 - `bower search {package name}`
- To install a package
 - `bower install {package name} --save`
 - `grunt bower`


Unit Testing
------------
Mocha is used as the default for unit tests.  Via grunt-mocha, unit tests can be run in both the terminal as well as the browser.

- Install httpster:  `sudo npm install -g httpster`
- Cd into the `source` folder
- Execute `httpster`
- Open new console tab, cd into `source
- To execute Mocha tests
 - Run `grunt test`
 - Navigate to `localhost:3333/test/html/index.html`
- When running `grunt dev`, tests are automatically re-run on save of either your source or your spec files and should trigger a reload in the browser.


A Few Notes on Folder Structure
-------------------------------

- **Assets** like **images**, **audio**, **webfonts**, **etc** are created in `src/assets` and will automatically be moved over to the **public** folder, mirroring the folder structure where they came from.
- **Html** in `html` will be copied over to the `public` root.  **The public directory never needs to be touched.**
- **Scripts** such as **CoffeeScript** and **JavaScript** are placed here and compiled over to public via **Browserify**.  For those not familiar, Browserify allows for "CommonJS" style modules to be required inside internal files.  Attachments to the global namespace are no longer needed, and dependencies are traced at compile-time. (Example:  `var MyClass = require('./path/to/MyClass')`)  See the Browserify website for more information.
- **Styles** is where **SASS** files go, and are compiled over to **public** on save.
- **Vendor** is where are vendor sources go, from both **Bower** (via `bower install {package}` and then `grunt bower`) as well as manually.  When changes are made to this directory, the **GruntFile** `concat` task should be updated to include the newly added files
- **Tests** is where your **Mocha** tests and their accompanying html are located.  When developing, test files are **continually evaluated** and, if need be, compiled into `test/spec/spec-runner.js` to be run in the **browser**.

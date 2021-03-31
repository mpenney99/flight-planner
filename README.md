# Flight Planner

Flight-planner is a tool for quickly creating and vizualizing flight simulations using a map-based GUI.

# Getting started

* Use the correct node version (v15). We recommend using [nvm](https://github.com/creationix/nvm) (`nvm install` or `nvm use`).
* Install yarn: https://classic.yarnpkg.com/en/docs/install#windows-stable
* Install project dependencies - `yarn install`
* Start the app - `yarn start`

The browser should automatically open. The app will be running on port 3000.

## Windows

Ensure that https://www.npmjs.com/package/windows-build-tools is installed

# Configuration

You can configure the environment the app will run against by changing the "proxy" entry in `package.json` (by default it will be running against https://portal.uniflydemo31-dev.unifly.tech).

Note that when you change the proxy, you might also need to change the API key (in config.json).

For other configuration options, see `src/config.json`


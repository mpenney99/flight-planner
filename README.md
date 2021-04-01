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

For configuration options, see `src/config.json`

# Docker

This project has a docker file for creating a Docker image containing an expressJS server which serves up the Flight Planner UI and deals with proxying.

To test the container the following command from the root of this project

```
docker-compose up --build
```

Will run at http://localhost:3001


# vnf-asterisk-controller

[![Build Status](https://travis-ci.org/dougbtv/vnf-asterisk-controller.svg?branch=master)](https://travis-ci.org/dougbtv/vnf-asterisk-controller)

A controller for vnf-asterisk. This readme is generally a big fat stub for now.

## API Specification

All the API endpoints are documented with an [API blueprint on Apiary.io](http://docs.vnfasteriskcontroller.apiary.io)

## Building & Running it (for development)

This git repo includes a `docker-compose.yml` file, which requires docker-compose v1.9.0 or later, and docker 1.12.0+. 

You can build the image for this with:

```
docker-compose build
```

And you can run it with:

```
docker-compose up
```

Note that the first time you run this, with the default way that the `docker-compose.yml` file is setup, it will mount the current working directory into the controller container.

Which means that you won't have the local `./node_modules/` folder populated, so you can install the node modules with:

```
docker exec -it controller npm install
```

## nodemon in dev

Nodemon can be used while in development to automatically restart the controller application with each change in the files in your clone.

You can run it with:

```
nodemon vnf-asterisk-controller.js
```

## Unit tests

This project includes unit tests. [stub!]

With a running server...

```
export NOSERVER=1
grunt nodeunit
```

Without a running server, just use `grunt nodeunit`

## Application structure, namespaces, and naming conventions.

The `./vnf-asterisk-controller.js` is generally an initialization script. Anything required before the main singleton instance of the application which is `./library/vnf-asterisk-controller.js`. Generally, all other scripts which are children of the main application singleton.

The main application is nicknamed "vac" (*V*nf-*A*sterisk-*C*ontroller), a reference to this is passed to each child instance. And then referenced by accessing parent and child namespaces (e.g. `vac.childname`), and the sibling from that namespace. Classes are named with camel-case, and instances are named with all lower case.

E.g. If you're operating from an instance of the `pushConfig` module, and wish to access a method from the `discoverAsterisk` module, you would reference it as:

```javascript

// Main application: vac
// Sibling module instance: discoverasterisk
// Method-name (camel case) (or property as lower case)

vac.discoverasterisk.getBoxIP('asterisk1',function(err,ip){
    // ...
});

```

### Application class diagram

Sample of how parent / children relate, especially the modules to the singleton main application.

```
   +----------------------------------+
   |                                  |
   |  vnf-asterisk-controller         |
   |  Main application / parent       |
   |  (nicknamed: "vac")              |
   |                                  |
   |                                  |
   |                                  |
   |                                  |
   |                                  +---------+
   +---------+------------------+-----+         |
             |                  |               |
      +------v-------+   +------v--------+  +---v------------+
      |              |   |               |  |                |
      | restServer   |   | pushConfig    |  |  ...           |
      |              |   |               |  |                |
      |              |   |               |  |                |
      |              |   |               |  |                |
      +--------------+   +---------------+  +----------------+

```


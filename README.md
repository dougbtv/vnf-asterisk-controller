# vnf-asterisk-controller

[![Build Status](https://travis-ci.org/dougbtv/vnf-asterisk-controller.svg?branch=master)](https://travis-ci.org/dougbtv/vnf-asterisk-controller) ![nfvpe-bdage](https://img.shields.io/badge/nfvpe-approved-green.svg) ![apache-badge](https://img.shields.io/badge/license-Apache%20v2-blue.svg)

![vac_logo][vac_logo]

A controller for vnf-asterisk.

## API Specification

All the API endpoints are documented with an [API blueprint on Apiary.io](http://docs.vnfasteriskcontroller.apiary.io)

## Quickstart

The machine you intend to run it on should have git, docker, docker-compose, npm, and the grunt-cli installed globally.

```
git clone https://github.com/dougbtv/vnf-asterisk-controller.git
cd vnf-asterisk-controller
sudo npm install -g grunt-cli
docker-compose build
docker-compose pull
docker-compose up
docker exec -it controller npm install
docker exec -it controller nodemon vnf-asterisk-controller.js
```

Then point your browser @ `http://localhost:80` to view the UI

But wait, you'd like to connect these two instances and make a call, right? Let's do that.

Go ahead and use the `/discover` endpoint, you can use it by issuing:

```
curl localhost:8001/discover && echo
```

That will output a list of two objects (each one representing an Asterisk instance), each object in the list containing a UUID. We can string these together to connect the two asterisk instances with trunks from each one to the other.

Pick out the UUIDs and string them together on the `/connect` endpoint (and followed by a context call 'inbound' which is built into the dialplan on these instances) like so:

```
curl localhost:8001/connect/446a6e29-acf2-4a4a-ad75-faaacf50b3df/6f662dbd-cde2-4ac6-b79e-6fe74fad125e/inbound && echo
```

At this point you can refresh the "Discovery" tab on the web UI to see the trunks created.

Now, let's originate a call from Asterisk1 instance to the Asterisk2 instance, we'll do this using `docker exec`, you can originate the call with:

```
docker exec -it asterisk1 asterisk -rx 'channel originate PJSIP/333@asterisk2 application playback tt-monkeys'
```

And we can verify that there's a call that has happened by looking at some results on Asterisk2. The gist is that there's both CSV CDRs, and also a recording of the call, we can see the CDR with:

```
docker exec -it asterisk2 tail -n1 /var/log/asterisk/cdr-csv/Master.csv
```

And we can see the call recording exists with:

```
docker exec -it asterisk2 ls -l /var/spool/asterisk/monitor
```

And there you go, two Asterisk instances service discovered and trunk configurations pushed to them, and a call made between the two.

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

## Back-end nodemon in dev

Nodemon can be used while in development to automatically restart the controller application with each change in the files in your clone.

You can run it with:

```
nodemon vnf-asterisk-controller.js
```

## Unit tests

This project includes unit tests for the backend.

With a running server...

```
export NOSERVER=1 && export KEEPCONFIG=1
grunt nodeunit
```

(the `NOSERVER` environment variable runs the script against and already running server, and the `KEEPCONFIG` environment variable leaves the configuration created by the unit tests around for your own personal use/inspection should you wish)

Without a running server, just use `grunt nodeunit`

## Developing the front-end

The front-end resides entirely within the `./www` folder. It's an AngularJS app that's been scaffolded with Yeoman's [generator-angular](https://github.com/yeoman/generator-angular).

First, make sure you have the back-end dependencies installed (particularly, grunt). To initialize the front-end, cd to the `./www` folder and run...

```
npm install -g 
npm install
bower install
```

You can then serve the front-end (and refresh the page automatically when code changes) using the `serve` command with grunt, e.g.

```
grunt serve
```

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


## Dispatcher.

```
            Asterisk stasis client creation happens
            dynamically, given discovered instances
            which are handled by a dispatcher, which
            creates "asteriskInstance" objects
            which handle the stasis apps for each
            instance.


 +--------------------+
 |asteriskDiscovered()|
 +------+-------------+
        |                +-----------------+
        |                |                 |
        +---------------->   dispatcher    |
                         |   (singleton)   |
                         |                 |
                         +--------+--------+
                                  |
                         +--------v--------+
                         | instanceExists? |
                         +--------+--------+
                                  |
               +------------------v---------------------+
               |                                        |
               |      dispatcher.asterisk[uuid] =       |
               |   new AsteriskInstance(192.168.1.100)  |
               |                                        |
               +----------------------------------------+


From the main application, these instances can be controlled
by calling, for example:

vac.dispatcher.asterisk[uuid].originate("asterisk2","1234",param_n,function(){});

```

[vac_logo]: docs/vnf-asterisk-controller-logo.png
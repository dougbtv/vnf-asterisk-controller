module.exports = function(vac, opts, log) {

  // user, release, manager, dockerRegistry

  // --------------------------------------------------------------------
  // -- myConstructor : Throws the constructor into a method.
  // ...Because javascript wants the methods to be defined before referencing them.

  // So you want to interoperate with Apache?
  // Try a directive like so:
  // ProxyPass /api/ http://localhost:8001/api/

  var fs = require('fs');
  var path = require('path');
  var async = require('async');

  var restify = require('restify');
  var server = restify.createServer();
  server.use(restify.bodyParser({
    // someStuff: opts.something,
  }));

  // The infamous... server.
  this.server = server;

  this.myConstructor = function() {

    // Set an error handler for the server
    // This helps when there's a deeper error.

    server.on('uncaughtException', function (req, res, route, err) {
      log.error("api_crash",{ stack: err.stack, route: route.spec.path });
      // We wanna see that crash in development
      // console.log("!tracerround API ERROR: ",err.stack);
      // console.log("!trace uncaughtException route: ",route);
      
      res.send(500, err);
      // return next();
    });

    // When a client request is sent for a URL that does not exist, restify will emit this event. 
    // Note that restify checks for listeners on this event, and if there are none, responds with a default 404 handler. 
    // It is expected that if you listen for this event, you respond to the client.
    server.on('NotFound', function (req, res, callback) {

      // Always handy if you don't know the URL.
      //console.log("!trace API CALL NOT FOUND, url: ",req.url);

      //console.log("!trace API CALL NOT FOUND, headers: ",req.headers);
      //console.log("!trace API CALL NOT FOUND, method: ",req.method);
      //console.log("!trace API CALL NOT FOUND, input: ",req.params);

      // res.contentType = 'json';
      // res.send({foo: "bar"});

      res.contentType = 'text';
      res.send(404, "this isn't the droid you're looking for.");

    });


    // Tell the server to send a CORS request.
    // refernce: http://stackoverflow.com/questions/14338683/how-can-i-support-cors-when-using-restify

    server.use(
      function crossOrigin(req,res,next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        return next();
      }
    );

    var endpoints = [
      { route: '/foo',                                                    method: this.testFunction },
      { route: '/pushconfig/:boxid/:username/:address/:mask/:context',    method: this.pushConfig },
      { route: '/getconfig/:boxid/:username',                             method: this.getConfig },
      { route: '/deleteconfig/:boxid/:username',                          method: this.deleteConfig },
      { route: '/connect/:instance_a/:instance_b/:context',               method: this.connectInstances },
      { route: '/gettrunk/:boxid/:trunkname',                             method: this.getTrunk },
      { route: '/originate/:boxid_from/:trunk_to/application/:app/:data', method: this.originateCall },
      { route: '/discover',                                               method: this.discoverAll },
      { route: '/version',                                                method: this.version },
      { route: '/list/:query',                                            method: this.list },
    ];

    endpoints.forEach(function(point){

      server.get(point.route, point.method);
      server.post(point.route, point.method);
      server.head(point.route, point.method);

    }.bind(this));

  };

  this.originateCall = function(req, res, next) {

    vac.dispatcher.originateCall(req.params.boxid_from,req.params.trunk_to,req.params.app,req.params.data,function(err,returns_info){
        if (!err) {
          // Return a JSON result.
          res.contentType = 'json';
          res.send(result);
        } else {
          res.send(500, err);
        }
    });

  }


  this.discoverAll = function(req, res, next) {

    vac.discoverasterisk.discoverAll(function(err,boxes){

      if (!err) {
        // Return a JSON result.
        res.contentType = 'json';
        res.send(boxes);
      } else {
        res.send(500, err);
      }

    });

  }


  this.pushConfig = function(req, res, next) {

    vac.pushconfig.createEndPoint(req.params.boxid,req.params.username,req.params.address,req.params.mask,req.params.context,function(err,result){

      if (!err) {
        // Return a JSON result.
        res.contentType = 'json';
        res.send({
          created_username: req.params.username, 
          info: {
            uuid: req.params.boxid,
            address: req.params.address,
            mask: req.params.mask,
          },
          result_data: result
        });
      } else {
        res.send(500, err);
      }

    });

  }

  this.connectInstances = function(req, res, next) {

    vac.pushconfig.connectInstances(req.params.instance_a,req.params.instance_b,req.params.context,function(err,info){

      if (!err) {
        // Return a JSON result.
        res.contentType = 'json';
        res.send(info);

      } else {
        res.send(500, err);
      }

    });

  }

  this.getConfig = function(req, res, next) {

    vac.pushconfig.listEndPoint(req.params.boxid,req.params.username,function(err,info){

      if (!err) {
        // Return a JSON result.
        res.contentType = 'json';
        res.send(info);

      } else {
        res.send(500, err);
      }

    });

  }

  this.getTrunk = function(req, res, next) {

    vac.discoverasterisk.getStoredTrunk(req.params.boxid,req.params.trunkname,function(err,info){

      if (!err) {
        // Return a JSON result.
        res.contentType = 'json';
        res.send(info);

      } else {
        res.send(500, err);
      }

    });

  }
  
  this.deleteConfig = function(req, res, next) {

    vac.pushconfig.deleteEndPoint(req.params.boxid,req.params.username,function(err){

      if (!err) {
        // Return a JSON result.
        res.contentType = 'json';
        res.send({deleted_username: req.params.username, box_deleted: req.params.boxid});

      } else {
        res.send(500, err);
      }

    });

  }

  this.list = function(req, res, next) {

    // var some_thing = req.params.some_thing;
    // log.it("listing_some_thing",{some_thing: some_thing});
    
    res.contentType = 'json';
    res.send(['stub','list']);

  }

  this.version = function(req, res, next) {
   
    log.it("version_request",{version: version});

    // Return a JSON result.
    res.contentType = 'text';
    res.send("0.0.1 - this is a stub function.");

  }.bind(this);
  
  this.testFunction = function(req, res, next) {
        
    // console.log(req.params);

    log.it("test log: ",req.params);

    var return_json = [
      {text: "this and that"},
      {text: "the other thing"},
      {text: "final"}
    ];
    
    // Return a JSON result.
    res.contentType = 'json';
    res.send(return_json);

  }.bind(this);

  // Call the constructor (after defining all of the above.)

  this.myConstructor();

  this.serverStart = function() {

    // And then fire up the server.
    server.listen(opts.SERVER_PORT, function() {
      log.it(server.name + ' listening at ' + server.url);
    });

  }

  
}
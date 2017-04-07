module.exports = function(opts,log) {

  var RestServer = require("./restServer.js"); 
  this.restserver = new RestServer(this,opts,log);
  this.restserver.serverStart();

  var PushConfig = require("./PushConfig.js"); 
  this.pushconfig = new PushConfig(this,opts,log);

  var discoverAsterisk = require("./discoverAsterisk.js"); 
  this.discoverasterisk = new discoverAsterisk(this,opts,log);
 
  var Dispatcher = require("./dispatcher.js"); 
  this.dispatcher = new Dispatcher(this,opts,log);
   
}
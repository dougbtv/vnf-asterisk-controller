module.exports = function(opts,log) {

  var RestServer = require("./restServer.js"); 
  this.restserver = new RestServer(this,opts,log);
  this.restserver.serverStart();

}
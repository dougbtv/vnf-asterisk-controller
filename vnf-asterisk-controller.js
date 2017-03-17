// ----------------------------------------------------------------------------------------
// Controller for an asterisk VNF
// ----------------------------------------------------------------------------------------

// Parse our options with nomnom. We centralize this here.
var Options = require("./library/Options.js");
var options = new Options();

options.parse(function(err,opts){

  // console.log("!trace opts: ",opts);
  // -- Connect to mongo.

  if (err) {
    throw "Configuration LOAD ERROR: " + err;
  }

  // we start logging quite early.
  var Log = require('./library/Log.js');
  var log = new Log(opts);

  // This is the meat of the matter.
  var vac = require("./library/vnf-asterisk-controller.js"); 
  var vac = new vac(opts,log);

});
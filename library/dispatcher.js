module.exports = function(vac, opts, log) {

  // Let's include the local library we need which is asterisk instance.
  // We create multiple instances of this, as we discover machines.
  var AsteriskInstance = require("./asteriskInstance.js"); 

  // Our asterisk instances.
  this.asterisk = {};
  var asterisk = this.asterisk;

  // ---------------------------------------------------
  // Pick up routing information
  // that is, cycle through the known instance
  // and ship back the meta data.
  this.getRouting = function(callback) {

    // Default what we learned about each.
    var routing = [];

    log.it("trace_dispatcher_asteriskinstances",asterisk);

    asterisk_keys = Object.keys(asterisk);
    // Object.keys(target).forEach(function (key) { target[key]; });

    if (asterisk_keys.length) {
  
      // Cycle through the known instances.
      asterisk_keys.forEach(function (key) {
        
        var ast = asterisk[key];

        // Keeping each instance.
        routing.push({
          uuid: ast.uuid,
          role: ast.inbound_behavior.role,
          destination: ast.inbound_behavior.destination,
          discovery: ast.discovery,
        });
      });

      // Ship it back.
      callback(false,routing);

    } else {
   
      // warn there there's nothing here to report on.
      log.warn("dispatcher_getrouting_noinstances",{note: "There's no instances to return."});
      callback("dispatcher_getrouting_noinstances",[]);

    }


  }

  // ----------------------------------
  // Create a new box.

  this.createInstance = function(uuid,callback) {

    // Alright, so do we know about this?
    if (!uuid_exists(uuid)) {
      // create it.
      asterisk[uuid] = new AsteriskInstance(uuid, vac, opts, log);
    } else {
      // we already know about it, so we can just move on
      // No error here, as we might run this from discovery a lot.
    }

    if (typeof callback === 'function') {
      callback(false);
    }

  }

  // Utility methods.

  // Do we know about this UUID?
  this.uuid_exists = function(uuid) {

    if (typeof asterisk[uuid] !== 'undefined') {
      return true;
    } else {
      // log.warn("dispatcher_error_uuid_undefined",{uuid: uuid});
      return false;
    }

  }
  var uuid_exists = this.uuid_exists;

  // -------------------------------------------------
  // -------------------- Abstraction map.          -
  // -------------------------------------------------

  this.originateCall = function(uuid,trunk_to,asterisk_app,asterisk_app_data,callback) {
    if (uuid_exists(uuid)) {

      asterisk[uuid].originateCall(trunk_to,asterisk_app,asterisk_app_data,function(err,result){
        callback(err,result);
      });

    } else {
      log.error("dispatcher_originatecall_error_uuid_notfound",{uuid: uuid});
      callback("uuid_doesnt_exist");
    }

  }


}
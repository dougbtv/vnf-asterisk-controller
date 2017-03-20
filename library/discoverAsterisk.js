
module.exports = function(vac, opts, log) {

  // etcd deps.
  // store.set('hello', 'world', function(err, result) {
  //   store.get('hello', function(err, result) {
  //     console.log('hello:', result.node.value)
  //   })
  // })
  var etcdjs = require('etcdjs');
  var store = etcdjs(opts.etcd_host + ':4001');
  log.it("pushconfig_etcd","push config, etcd host @ " + opts.etcd_host + ':4001');

  // Given an identifier, gets an IP for a specific asterisk instance.
  this.getBoxIP = function(boxidentifier,callback) {

    store.get('asterisk/ip', function(err, etcdresult) {
    if (!err) {
      
        log.it("discoverasterisk_test_asteriskip", 'asterisk/ip: ' + etcdresult.node.value);
        callback(false,etcdresult.node.value);

      } else {
        log.it("discoverasterisk_etcd_error",err);
        callback(err);
      }
    });

  }

  var getBoxIP = this.getBoxIP;

  

}
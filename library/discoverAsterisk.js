
module.exports = function(vac, opts, log) {

  var async = require('async');

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

    store.get('asterisk/' + boxidentifier + '/ip', function(err, etcdresult) {
    if (!err) {
      
        log.it("discoverasterisk_test_asteriskip", 'asterisk/' + boxidentifier + '/ip: ' + etcdresult.node.value);
        callback(false,etcdresult.node.value);

      } else {
        log.it("discoverasterisk_etcd_ip_error",err);
        callback(err);
      }
    });


  }

  var getBoxIP = this.getBoxIP;

  // TODO: This could be refactored to have a get property main method, and then handlers to call that.
  // e.g. shared with getBoxIP.
  this.getBoxNickname = function(boxidentifier,callback) {

    store.get('asterisk/' + boxidentifier + '/nickname', function(err, etcdresult) {
    if (!err) {
      
        var node_value;
        if (etcdresult) {
          node_value = etcdresult.node.value;
        } else {
          // There's no properties for this.
          node_value = null;
        }

        log.it("!!!!!!!!!!!!!!!!!!bangerer",{etcdresult: etcdresult, boxidentifier: boxidentifier, key: 'asterisk/' + boxidentifier + '/nickname'});
        log.it("discoverasterisk_test_asterisknickname", 'asterisk/' + boxidentifier + '/nickname: ' + node_value);
        callback(false,node_value);

      } else {
        log.it("discoverasterisk_etcd_nickname_error",err);
        callback(err);
      }
    });


  }

  var getBoxNickname = this.getBoxNickname;

  
  // Discover all asterisk boxes that have reported in.
  this.discoverAll = function(callback) {

    store.get('asterisk',function(err, etcdresult){

      if (!err) {

        // log.it("discoverasterisk_discoverall_debug", {etcdresult: etcdresult.node.nodes});
        
        if (etcdresult.node.nodes.length) {

          // Ok now cycle through and we'll get all the IPs.
          var uuids = [];

          etcdresult.node.nodes.forEach(function(keyinfo){

            var eachuuid = keyinfo.key.replace(/^.+\/([a-z0-9\-]+$)/,'$1');
            // log.it("discoverasterisk_keyinfo_debug",{key: keyinfo.key, pretty: eachuuid});
            uuids.push(eachuuid);

          });

          var allinfo = [];

          // Now we can cycle those and get all the IPs
          async.eachSeries(uuids,function(uuid,callback){

            // TODO: This could be refactored to use async.series to avoid this pyramid o' deth.
            getBoxIP(uuid,function(err,ip){

              if (!err) {

                getBoxNickname(uuid,function(err,nickname){

                  if (!err) {

                    allinfo.push({
                      uuid: uuid,
                      ip: ip,
                      nickname: nickname,
                    });
                    
                    callback(false);

                  } else {
                    callback(err);
                  }

                });

              } else {
                callback(err);
              }

            });

          },function(err){

            // All complete, should have all the known IP addresses.
            callback(false,allinfo);

          });

        } else {
          log.warn("discoverasterisk_discoverall_nonefound", {note: "we didn't find any asterisk instance that's reported into etcd."});
          callback(false,[]);
        }

        
      } else {

        log.error("discoverasterisk_discoverall_etcderror",{ err: err });
        callback(err);

      }

    });

  }

  var discoverAll = this.discoverAll;

}
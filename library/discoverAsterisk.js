
module.exports = function(vac, opts, log) {

  var async = require('async');

  // etcd deps.
  // store.set('hello', 'world', function(err, result) {
  //   store.get('hello', function(err, result) {
  //     console.log('hello:', result.node.value)
  //   })
  // })
  var etcdjs = require('etcdjs');
  var store = etcdjs(opts.etcd_host + ':' + opts.etcd_port);
  log.it("pushconfig_etcd","push config, etcd host @ " + opts.etcd_host + ':' + opts.etcd_port);

  // Given an identifier, gets an IP for a specific asterisk instance.
  this.getBoxIP = function(boxidentifier,callback) {

    store.get('asterisk/' + boxidentifier + '/ip', function(err, etcdresult) {
    if (!err) {
      
        // log.it("discoverasterisk_test_asteriskip", 'asterisk/' + boxidentifier + '/ip: ' + etcdresult.node.value);
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

        // log.it("discoverasterisk_test_asterisknickname", 'asterisk/' + boxidentifier + '/nickname: ' + node_value);
        callback(false,node_value);

      } else {
        log.it("discoverasterisk_etcd_nickname_error",err);
        callback(err);
      }
    });


  }

  var getBoxNickname = this.getBoxNickname;

  // Store info about a trunk.
  this.storeTrunk = function(boxid,name,trunkinfo,callback) {

    store.set('asterisk/' + boxid + '/trunks/' + name,trunkinfo,{json: true},function(err){

      if (!err) {
        callback(false);
      } else {
        log.error("discoverasterisk_storetrunk_etcderror",{err: err});
        callback(err);
      }

    });

  }

  var storeTrunk = this.storeTrunk;

  // Delete an already stored trunk.
  this.deleteStoredTrunk = function(boxid,name,callback) {

    store.del('asterisk/' + boxid + '/trunks/' + name,function(err){

      if (!err) {
        callback(false);
      } else {
        log.error("discoverasterisk_deltrunk_etcderror",{err: err});
        callback(err);
      }

    });

  }

  var deleteStoredTrunk = this.deleteStoredTrunk;

  // get the trunk stored in etcd, by boxid and name.
  this.getStoredTrunk = function(boxid,name,callback) {

    store.get('asterisk/' + boxid + '/trunks/' + name,{json: true},function(err,etcdresult){

      if (!err) {
        if (etcdresult) {
          callback(false,etcdresult.node.value);
        } else {
          callback(false,{});
        }
      } else {
        log.error("discoverasterisk_gettrunk_etcderror",{err: err});
        callback(err);
      }

    });

  }

  var getStoredTrunk = this.getStoredTrunk;

  this.getTrunkNames = function(boxid,callback) {

    store.get('asterisk/' + boxid + '/trunks',function(err, etcdresult){


      if (!err) {

        if (etcdresult) {

          // Ok, no get the keys outta there.
          var trunknames = [];

          log.it("!trace",{etcdresult: etcdresult});

          if (typeof etcdresult.node.nodes !== 'undefined') {

            etcdresult.node.nodes.forEach(function(keyinfo){

              var eachtrunk = keyinfo.key.replace(/^.+\/([a-z0-9\-]+$)/,'$1');
              // log.it("discoverasterisk_keyinfo_debug",{key: keyinfo.key, pretty: eachtrunk});
              trunknames.push(eachtrunk);

            });
            
          }

          callback(false,trunknames);

        } else {
          log.warn("discoverasterisk_gettrunks_notrunks",{key: 'asterisk/' + boxid + '/trunks', note: "no trunks found"});
          callback(false,[]);
        }

      } else {
        log.error("discoverasterisk_gettrunknames_etcderror",{err: err});
        callback(err);
      }

    });

  }

  var getTrunkNames = this.getTrunkNames;

  
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

            // Get all the properties we want for this box.
            async.series({
              ip: function(callback) {
                getBoxIP(uuid,function(err,ip){
                  callback(err,ip);
                });
              },
              nickname: function(callback) {
                getBoxNickname(uuid,function(err,nickname){
                  callback(err,nickname);
                });
              },
              trunks: function(callback) {
                getTrunkNames(uuid,function(err,trunks){
                  callback(err,trunks);
                });
              },
            },function(err,result){
              
              if (!err) {
                allinfo.push({
                  uuid: uuid,
                  ip: result.ip,
                  nickname: result.nickname,
                  trunks: result.trunks,
                });
              }
              
              callback(err);

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
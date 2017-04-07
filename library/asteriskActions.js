module.exports = function(vac, opts, log) {

  var async = require("async");

  this.originateCall = function(boxid_from,trunk_to,asterisk_app,asterisk_app_data,callback) {

    // Why not on instantiation? Because...
    // This may be unique given the box.
    var client = require('ari-client');

    vac.discoverasterisk.getBoxIP(boxid_from,function(err,asteriskip){

      if (!err) {

        var url = "http://" + asteriskip + ":" + opts.sourcery_port;

        /*
        async.waterfall([
          function(callback) {

            client.connect(url, opts.ari_user, opts.ari_pass, function (err, ari) {
              if (err) {
                log.error("error_asteriskactions_clientconect",{err: err});
              }
              callback(err,ari);
            });

          },
          function(ari,callback) {

          }
        ],function(err, result){

          if (!err) {
            log.it("asteriskactions_waterfallcomplete",{stuff: "!trace"});
            callback(err,"completed");
          } else {

          }

        });
        */

        client.connect(url, opts.ari_user, opts.ari_pass, function (err, ari) {

          if (!err) {

            ari.applications.subscribe({
              applicationName: 'foobar', 
              eventSource: val
              },
              function (err, application) {

                if (!err) {
      
                  // log.it("trace_originate_call",{ari: ari});
                  var channel = ari.Channel();
                  channel.on('StasisStart', function (event, channel) {
                    log.it("trace_asteriskaction_stasisstart");
                  });
                  channel.on('ChannelDtmfReceived', function (event, channel) {
                    log.it("trace_asteriskaction_dtmf");
                  });
                  channel.originate({
                    endpoint: 'PJSIP/1000@' + trunk_to, 
                    app: 'foobar', 
                    appArgs: 'dialed'
                  },function (err, channel) {

                    if (!err) {

                      callback(false,"seems...ok");

                    } else {
                      log.error("error_asteriskactions_originate",{err: err});
                      callback(err);
                    }

                  });

                } else {
                  log.error("error_asteriskactions_subscribe");
                  callback(err);
                }

              }
            );
  


          } else {
            log.error("error_asteriskactions_clientconect",{err: err});
            callback(err);
          }


        });

      } else {
        callback(err);
      }

    });



  }

};
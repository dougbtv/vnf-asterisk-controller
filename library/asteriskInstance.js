module.exports = function(box_uuid, vac, opts, log) {

  // Our dependencies.
  var client = require('ari-client');
  var async = require("async");
  var util = require('util');

  // Our public properties.


  // Our private properties.
  var initialized = false;
  var ari = null;

  // ----------------------------------------------
  // ------- Initialization -----------------------
  // ----------------------------------------------

  // Alrighty, so first thing first...
  // We have to discover this box, and then connect to it.
  vac.discoverasterisk.getBoxIP(box_uuid,function(err,asteriskip){

      if (!err) {

        // Connect to ARI
        var url = "http://" + asteriskip + ":" + opts.sourcery_port;
        client.connect(url, opts.ari_user, opts.ari_pass, function (err, initial_ari) {

          if (!err) {

            // Alright we have an instance created.
            log.it("asteriskinstance_created",{uuid: box_uuid, ip_address: asteriskip});

            // Save the returned ari
            ari = initial_ari;

            ari.on('StasisStart', stasisStartInbound);
            ari.on('StasisEnd', stasisEndInbound);

            ari.start('inbound');

          } else {
            // This is basically fatal, we discovered it, but couldn't client connect.
            log.error("asteriskinstance_fatalerror_sorceryconnectfailed",{uuid: box_uuid, asteriskip: asteriskip});
          }
        });

        // Wait... should I connect multiple times for multiple apps?


      } else {
        // This is a fatal error, really.
        log.error("asteriskinstance_fatalerror_discoveryfailed",{uuid: box_uuid});
      }

  });

  // ---------------------------------------------- end initialization.


  // ---------------------------------------------------
  // ------------- Applications ------------------------
  // ---------------------------------------------------

  // ----------------------------------- Stasis Inbound
  function stasisStartInbound(event, channel) {

    console.log(util.format(
          'Monkeys! Attack %s!', channel.name));

    var playback = ari.Playback();

    channel.play({media: 'sound:tt-monkeys'}, playback, function(err, newPlayback) {
      if (err) {
        log.error("error_asteriskinstance_playbackfail",{err: err});
        throw err;
      }
    });

    playback.on('PlaybackFinished', function(event, completedPlayback) {
      
      console.log(util.format(
          'Monkeys successfully vanquished %s; hanging them up',
          channel.name));

      channel.hangup(function(err) {
        if (err) {
          log.warn("error_asteriskinstance_channelhangup",{note: "looks like an early hangup", err: err});
        }
      });

    });

    
  }

  // handler for StasisEnd event
  function stasisEndInbound(event, channel) {

    console.log(util.format(
          'Channel %s just left our application', channel.name));
  }

  // ----------------------------------- end Stasis Inbound


  this.originateCall = function(boxid_from,trunk_to,asterisk_app,asterisk_app_data,callback) {

  }
    /*
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

    // Why not on instantiation? Because...
    // This may be unique given the box.

        /*
    vac.discoverasterisk.getBoxIP(boxid_from,function(err,asteriskip){

      if (!err) {

        var url = "http://" + asteriskip + ":" + opts.sourcery_port;

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

        client.connect(url, opts.ari_user, opts.ari_pass, function (err, ari) {

          if (!err) {

            
  


          } else {
            log.error("error_asteriskactions_clientconect",{err: err});
            callback(err);
          }


        });

      } else {
        callback(err);
      }

    });
        */


};
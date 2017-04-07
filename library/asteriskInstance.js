module.exports = function(box_uuid, vac, opts, log) {

  // Our dependencies.
  var client = require('ari-client');
  var async = require("async");

  // ---------------------------
  // Our public properties.

  // What's this box do on an inbound call?
  // enumerated type:
  // next_host
  var BEHAVIOR_PLAYBACK = 'playback';
  var BEHAVIOR_NEXTHOST = 'next_host'

  // this.inbound_behavior = {
  //   role: BEHAVIOR_NEXTHOST,
  //   destination: 'SOME_UUID',
  // };

  // By default -- just playback an RCAN when you pick up.
  // Of course -- default to the best of all RCANs...
  // screaming monkeys \m/
  this.inbound_behavior = {
    role: BEHAVIOR_PLAYBACK,
    destination: 'sound:tt-monkeys',
  };

  var inbound_behavior = this.inbound_behavior;



  // ---------------------------
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


    switch(inbound_behavior.role) {
      case BEHAVIOR_PLAYBACK:
        behavior_playback(inbound_behavior.destination,event,channel);
        break;

      case BEHAVIOR_NEXTHOST:
        log.warn("asteriskinstance_behavior_NEXTHOST_undefined");

      default:
        log.warn("asteriskinstance_behavior_undefined", {inbound_behavior: inbound_behavior, box_uuid: box_uuid});
        channel.hangup(function(err) {
          if (err) {
            log.warn("error_asteriskinstance_channelhangup",{note: "looks like an early hangup", err: err});
          }
        });
        break;

    }

  }

  // handler for StasisEnd event
  function stasisEndInbound(event, channel) {

    log.it("asteriskinstance_channel_leave",{uuid: box_uuid, channel: channel.name});

  }

  // ---------------------- inbound behaviors

  var behavior_playback = function (media,event,channel) {
    
    log.it("asteriskinstance_playbackstarted",{uuid: box_uuid, channel: channel.name, media: media});

    var playback = ari.Playback();

    channel.play({media: media}, playback, function(err, newPlayback) {
      if (err) {
        log.error("error_asteriskinstance_playbackfail",{err: err});
      }
    });

    playback.on('PlaybackFinished', function(event, completedPlayback) {
      
      log.it("asteriskinstance_playbackfinished",{uuid: box_uuid, channel: channel.name});

      channel.hangup(function(err) {
        if (err) {
          log.warn("error_asteriskinstance_channelhangup",{note: "looks like an early hangup", err: err});
        }
      });

    });

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
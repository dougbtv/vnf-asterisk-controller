module.exports = function(vac, opts, log) {

  
  // we use the restify client.
  var restify = require('restify');
  var request = require('request');
  var async = require('async');

  // Dynamically create an endpoint with pjsip.

  // More info @ https://wiki.asterisk.org/wiki/display/AST/ARI+Push+Configuration
  // And the blog: http://blogs.asterisk.org/2016/03/09/pushing-pjsip-configuration-with-ari/

  var createEndPoint = function(boxid,username,password,callback) {

    log.it("trace_listendpoint_create",{boxid: boxid});
    vac.discoverasterisk.getBoxIP(boxid,function(err,asteriskip){

      if (!err) {
        
        listEndPoint(boxid,username,function(err,boxinfo){

          if (!err) {

            if (!boxinfo.exists) {

              var server_url = "http://asterisk:asterisk@" + asteriskip + ":" + opts.sourcery_port;
              log.it("pushconfig_server_url",{server_url: server_url});

              var client = restify.createStringClient({
                version: '*',
                // connectTimeout: 500,
                // requestTimeout: 500,
                url: server_url,
              });

              var auth = {
                user: 'asterisk',
                pass: 'asterisk',
                sendImmediately: 'false',
              };

              async.series([
                  // ------------------------- CREATE ENDPOINTS.
                function(callback){

                  var url = server_url + "/ari/asterisk/config/dynamic/res_pjsip/endpoint/" + username;

                  var formData = {
                    'transport': 'transport-udp',
                    'context': 'endpoints',
                    'disallow': 'all',
                    'allow': 'ulaw',
                  }

                  // client.put(url, fields, function(err, req, res, data) {
                  request.put({url: url, auth: auth, formData: formData}, function (err, res, data) {
                    
                    // console.log('%d -> %j', res.statusCode, res.headers);
                    // console.log('%s', data);

                    if (!err && res.statusCode == 200) {
                      // Ok, do things.
                      callback(false);
                    } else {
                      if (!err) {
                        err = "pushconfig_endpoint_statuscode_error_" + res.statusCode;
                      }
                      log.error("pushconfig_error_endpointurl",{error: err, data: data, statuscode: res.statusCode});
                      callback(err);
                    }
                  });

                  
                },
                // ------------------------- CREATE IDENTITIES.
                function(callback){

                  var url = server_url + "/ari/asterisk/config/dynamic/res_pjsip/identify/" + username;

                  log.warn("pushconfig_wtf_ipaddress",{ note: "using match as 127.0.0.1 --- THIS IS RIDICULOUS?"});

                  var formData = {
                    'endpoint': username,
                    'match' : "127.0.0.1",
                  }

                  // client.put(url, fields, function(err, req, res, data) {
                  request.put({url: url, auth: auth, formData: formData}, function (err, res, data) {
                    
                    // console.log('%d -> %j', res.statusCode, res.headers);
                    // console.log('%s', data);

                    if (!err && res.statusCode == 200) {
                      // Ok, do things.
                      callback(false);
                    } else {
                      if (!err) {
                        err = "pushconfig_identify_statuscode_error_" + res.statusCode;
                      }
                      log.error("pushconfig_error_identifyurl",{error: err, data: data, statuscode: res.statusCode});
                      callback(err);
                    }
                  });
                 
                },
              ],function(err,results){

                log.it("pushconfig_createnedpoint_complete",{username: username, asteriskip: asteriskip,boxid: boxid});
                callback(err);

              });

            } else {
              log.warn("pushconfig_endpoint_exists",{boxid: boxid, username: boxid, note: "tried to create an endpoint, but it already exists"});
              callback("pushconfig_createnedpoint_alreadyexists");
            }

          } else {
            callback(err);
          }

        });

      } else {
        callback(err);
      }

    });

    


  }

  this.createEndPoint = createEndPoint;


  // Checks if an endpoint exists, and returns any data about.

  // -- some references.
  // not great...
  // http://localhost:8088/ari/asterisk/config/dynamic/res_pjsip/auth/%s

  // # This worked.
  // curl http://asterisk:asterisk@172.19.0.3:8088/ari/asterisk/config/dynamic/res_pjsip/endpoint/alice

  var listEndPoint = function(boxid,endpoint,callback) {

    log.it("trace_listendpoint_list",{boxid: boxid});
    vac.discoverasterisk.getBoxIP(boxid,function(err,asteriskip){

      if (!err) {
        
        var server_url = "http://asterisk:asterisk@" + asteriskip + ":" + opts.sourcery_port;

        var url = server_url + "/ari/asterisk/config/dynamic/res_pjsip/endpoint/" + endpoint;

        log.it("requested_URLLLLL",{ url: url});

        request.get({url: url}, function (err, res, data) {
          
          // console.log('%d -> %j', res.statusCode, res.headers);
          // console.log('%s', data);
          log.it("pushconfig_debug_listendpoint", {res: res});

          if (!err) { //  && res.statusCode == 200
            // Alright, so we should determine if it's found or not.
            var exists = false;
            if (res.statusCode == 200) { exists = true; }
            
            callback(false,{exists: exists, data: data});

          } else {
            if (!err) {
              err = "pushconfig_endpoint_statuscode_error_" + res.statusCode;
            }
            log.error("pushconfig_error_endpointurl",{error: err, data: data, statuscode: res.statusCode});
            callback(err);
          }
        });

      } else {
        callback(err);
      }


    });

  }

  this.listEndPoint = listEndPoint;

  // Now delete an endpoint.

  var deleteEndPoint = function(boxid,username,callback) {

     vac.discoverasterisk.getBoxIP(boxid,function(err,asteriskip){

      if (!err) {

        listEndPoint(boxid,username,function(err,boxinfo){

          if (!err) {

            if (boxinfo.exists) {
              var server_url = "http://asterisk:asterisk@" + asteriskip + ":" + opts.sourcery_port;

              var urls = [];
              urls.push(server_url + "/ari/asterisk/config/dynamic/res_pjsip/endpoint/" + username);
              urls.push(server_url + "/ari/asterisk/config/dynamic/res_pjsip/identify/" + username);

              async.forEach(urls,function(url,callback){

                log.it("requested_URLLLLL",{ url: url});

                // Call the endpoint with the delete method to remove it.
                request.delete({url: url}, function (err, res, data) {
                  
                  // console.log('%d -> %j', res.statusCode, res.headers);
                  // console.log('%s', data);
                  log.it("pushconfig_debug_delete_listendpoint", {res: res});

                  if (!err) { //  && res.statusCode == 200
                   
                    // Warn if not 200 OK
                    if (res.statusCode != 200) { 
                      log.warn("pushconfig_delete_non200",{statusCode: res.statusCode, data: data, url: url});
                    }
                    
                    // Everything OK, generally.
                    callback(false);

                  } else {
                    // Couldn't quite do that, so let's debug it, a little.
                    log.error("pushconfig_error_endpointurl",{error: err, data: data, statuscode: res.statusCode, url: url});
                    callback(err);
                  }

                });

              },function(err){

                // Ok, that's all done.
                if (!err) {
                  log.it("pushconfig_delete_complete",{boxid: boxid, username: username});
                }

                callback(err);

              });

            } else {
              log.warn("pushconfig_endpoint_exists",{boxid: boxid, username: boxid, note: "tried to create an endpoint, but it didn't exist"});
              callback("pushconfig_error_delete_endpoint_noexist");
            }

          } else {
            callback(err);
          }
        });
        
      } else {
        callback(err);
      }

    });

  }

  this.deleteEndPoint = deleteEndPoint;

}

/*

#!/usr/bin/env python

# Copyright (c)2016 Digium, Inc.
# Copyright (c)2017 Red Hat, Inc.
# Source: http://blogs.asterisk.org/2016/03/09/pushing-pjsip-configuration-with-ari/
# Original source Written by: Mark Michelson
#
# Additional development by Leif Madsen

import requests
import json
import sys

def resp_check(resp):
    """Return status code of a response from sorcery"""
    if resp.status_code == 200:
        print "Successfully pushed"
        print json.dumps(resp.json(), sort_keys=True, indent=2,
                 separators=(',', ': '))
    else:
        print "Received {0} response".format(resp.status_code)

def resp_push(url, config):
    resp = requests.put(url, auth=('asterisk', 'asterisk'), json=config)
    return resp


# base URL to connect to Asterisk ARI interface for dynamic configuration
url = "http://localhost:8088/ari/asterisk/config/dynamic/res_pjsip/"

# Add pjsip sections / users / endpoints / auths etc
sections = {}
sections['alice'] = { 'username': 'alice', 'password': 'supersecret' }
sections['bob'] = { 'username': 'bob', 'password': 'supersecret' }

# Add Transports
#  -- for now don't do this dynamically as it results in a crash.
#     see https://issues.asterisk.org/jira/browse/ASTERISK-26829
#transport_url = url + "transport/transport-udp"
#
#transport_config = {
#    'fields': [
#        { 'attribute': 'protocol', 'value': 'udp' },
#        { 'attribute': 'bind', 'value': '0.0.0.0' },
#    ]
#}
#
#transport_resp = resp_push(transport_url, transport_config)
#resp_check(transport_resp)

# Add Auths
#  -- for SIPp scenarios, we're going to authenticate via identities
#     which allows for IP based authentication.
#auth_url = url + "auth/"
#
#for k, v in sections.iteritems():
#    auth_config = {
#        'fields': [
#            { 'attribute': 'username', 'value': v['username'] },
#            { 'attribute': 'password', 'value': v['password'] },
#        ]
#    }
#
#    auth_resp = resp_push(auth_url + k, auth_config)
#    resp_check(auth_resp)

# Add Endpoints
endpoint_url = url + "endpoint/"
for k, v in sections.iteritems():
    endpoint_config = {
        'fields': [
            { 'attribute': 'transport', 'value': 'transport-udp' },
            { 'attribute': 'context', 'value': 'endpoints' },
            { 'attribute': 'disallow', 'value': 'all' },
            { 'attribute': 'allow', 'value': 'ulaw' },
        ]
    }

    endpoint_resp = resp_push(endpoint_url + k, endpoint_config)
    resp_check(endpoint_resp)

# Add Identities
identity_url = url + "identify/"

for k, v in sections.iteritems():
    identifies_config = {
        'fields': [
            { 'attribute': 'endpoint', 'value': k },
            { 'attribute': 'match', 'value': '127.0.0.2' },
        ]
    }

    identity_resp = resp_push(identity_url + k, identifies_config)
    resp_check(identity_resp)


# vim: tabstop=4 expandtab shiftwidth=4 softtabstop=4

*/
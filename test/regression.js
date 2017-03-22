// requirements 

var SERVER_URL = 'http://127.0.0.1';
var fs = require('fs');
var request = require('request');
var async = require('async');
var restify = require('restify');
var client; // will later be a restify client.

var requestj = require('request-json');
var clientj; // laster is a request-json client


var fork = require('child_process').fork;

// ----------------------- environment options & configuration

var configfile_path = 'includes/config.json';
var configs = {};

// Let's use an ecosystem, if we have one.
var ecosystem_flag = '';
var ecosystem_argument = '';

if (process.env.ECOSYSTEM) {
  ecosystem_flag = '--ecosystem';
  ecosystem_argument = process.env.ECOSYSTEM;
  configfile_path = 'includes/' + process.env.ECOSYSTEM + '.config.json';
}

// Sometimes you wanna run against an already running server
var startserver = true;
if (process.env.NOSERVER) {
  startserver = false;
}

// Start up vac.
var vac;
var LOGFILE = '/tmp/vac.log';
if (startserver) {
  vac = fork('./vnf-asterisk-controller.js',['--logfile',LOGFILE,'--prettylog',ecosystem_flag,ecosystem_argument]);
}
// ----------------------- end cli environment options.

// Used among tests.

var uuid_firstinstance;
var ipaddr_secondinstance;

var uploadFile = function(query,upload_path,backup_filepath,test,callback) {

  // Here's our file attachment.
  var formData = {

    file: fs.createReadStream(upload_path),

  };

  request.post({url: SERVER_URL + '/' + API_KEY_ROOT + '/upload/' + query, formData: formData}, function (err, httpResponse, body) {
    if (err) {
      throw err;
    }

    test.ok(httpResponse.statusCode == 200,"Upload: Return status OK");

    // console.log('Upload successful!  Server responded with:', body);

    // Now we're going to want to check that there's the proper files in place.
    // Did it make a new backup?
    fs.exists(backup_filepath,function(exists){

      // Mark the test status.
      test.ok(exists,"Upload: Backup file created");

      // Remove the backup
      if (exists) {
        fs.unlinkSync(backup_filepath, 'w');
      }

      callback(false);
      
    });

  });

}

module.exports = {
  setUp: function (callback) {
    // console.log("!trace SETUP");
    callback();
  },
  truncateLog: function(test){
    fs.exists(LOGFILE,function(exists){
      if (exists) {
        fs.truncate(LOGFILE,0,function(err){
          test.ok(!err,'Truncated log file');
          test.done();
        });
      } else {
        test.ok(true,"No log file");
        test.done();
      }
      
    });
  },
  readConfig: function(test) {
    fs.readFile(configfile_path, 'utf8', function (err, data) {
      if (!err) {
        configs = JSON.parse(data);
        
        // Now set the port...
        SERVER_URL = SERVER_URL + ':' + configs.SERVER_PORT;

        // Now we want instantiate our client.
        client = restify.createJsonClient({
          version: '*',
          // connectTimeout: 500,
          // requestTimeout: 500,
          url: SERVER_URL,
        });

        clientj = requestj.createClient(SERVER_URL);

        test.ok(true,"Config OK");
        test.done();
      
      } else {
        throw err;
      }
    });
  },
  waitForServer: function(test) {

    if (startserver) {
      
      setTimeout(function(){
        test.ok(true, "Wait for server to boot.");
        test.done();
      },125);

    } else {
      test.ok(true, "Using running server.");
      test.done();
    }
    
  },
  testEndpointExists: function(test){
  
    client.get('/foo', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(res.statusCode == 200, "Test endpoint returns 200 OK");
      test.done();
    });
  },
  discoverOK: function(test){
  
    client.get('/discover', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(res.statusCode == 200, "discover returns 200 OK");
      test.ok(data.length == 2,"two asterisk instances discovered");
      test.ok(typeof data[0].uuid == 'string', "discover first element uuid is a string (" + data[0].uuid + ")");
      test.ok(data[1].ip.match(/^\d+\.\d+\.\d+\.\d+$/),"second element's IP address looks like an IP (" + data[1].ip + ")");
      uuid_firstinstance = data[0].uuid;
      ipaddr_secondinstance = data[1].ip;
      test.done();

    });
  },
  pushConfigOK: function(test){
  
    client.get('/pushconfig/' + uuid_firstinstance + '/alice/' + ipaddr_secondinstance + '/32/inbound', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(res.statusCode == 200, "pushconfig returns 200 OK");
      test.done();

    });
  },
  listConfigOK: function(test){
  
    client.get('/getconfig/' + uuid_firstinstance + '/alice', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(res.statusCode == 200, "getconfig returns 200 OK");
      test.done();
    });
  },
  getTrunkInfo: function(test){
  
    client.get('/gettrunk/' + uuid_firstinstance + '/alice', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(data.name == 'alice',"returns same name as entered (alice)");
      test.ok(res.statusCode == 200, "gettrunk returns 200 OK");
      test.done();
    });
  },
  deleteConfigOK: function(test){
  
    client.get('/deleteconfig/' + uuid_firstinstance + '/alice', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(res.statusCode == 200, "deleteconfig returns 200 OK");
      test.done();
    });
  },
  getTrunkInfoAfterDelete: function(test){
  
    client.get('/gettrunk/' + uuid_firstinstance + '/alice', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(Object.keys(data).length === 0 && data.constructor === Object,"Trunk info is empty");
      test.ok(res.statusCode == 200, "gettrunk returns 200 OK");
      test.done();
    });
  },
  serverKill: function(test) {
    if (startserver) {
      vac.kill(); 
      test.ok(true, "Server killed");
    } else {
      test.ok(true, "Used running server, left alive.");
    }
    test.done();
  }

};

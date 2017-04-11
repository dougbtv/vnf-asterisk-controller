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

var all_discovery;
var uuid_a;
var uuid_b;
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

      // Sort this by nickname, so we know what we're connecting
      // (e.g. asterisk1 to asterisk2)
      data.sort(function(a, b){
        if(a.nickname < b.nickname) return -1;
        if(a.nickname > b.nickname) return 1;
        return 0; 
      })
    
      test.ok(res.statusCode == 200, "discover returns 200 OK");
      test.ok(data.length == 3,"three asterisk instances discovered");
      test.ok(typeof data[0].uuid == 'string', "discover first element uuid is a string (" + data[0].uuid + ")");
      test.ok(data[1].ip.match(/^\d+\.\d+\.\d+\.\d+$/),"second element's IP address looks like an IP (" + data[1].ip + ")");
      uuid_a = data[0].uuid;
      uuid_b = data[1].uuid;
      ipaddr_secondinstance = data[1].ip;
      test.done();

    });
  },
  pushConfigOK: function(test){
  
    client.get('/pushconfig/' + uuid_a + '/alice/' + ipaddr_secondinstance + '/32/inbound', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(res.statusCode == 200, "pushconfig returns 200 OK");
      test.done();

    });
  },
  listConfigOK: function(test){
  
    client.get('/getconfig/' + uuid_a + '/alice', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(res.statusCode == 200, "getconfig returns 200 OK");
      test.done();
    });
  },
  getTrunkInfo: function(test){
  
    client.get('/gettrunk/' + uuid_a + '/alice', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(data.name == 'alice',"returns same name as entered (alice)");
      test.ok(res.statusCode == 200, "gettrunk returns 200 OK");
      test.done();
    });
  },
  deleteConfigOK: function(test){
  
    client.get('/deleteconfig/' + uuid_a + '/alice', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(res.statusCode == 200, "deleteconfig returns 200 OK");
      test.done();
    });
  },
  getTrunkInfoAfterDelete: function(test){
  
    client.get('/gettrunk/' + uuid_a + '/alice', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(Object.keys(data).length === 0 && data.constructor === Object,"Trunk info is empty");
      test.ok(res.statusCode == 200, "gettrunk returns 200 OK");
      test.done();
    });
  },
  connectTwoInstances: function(test){
  
    client.get('/connect/' + uuid_a + '/' + uuid_b + '/inbound', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(res.statusCode == 200, "connect returns 200 OK");

      if (typeof data.create_trunk_a !== 'undefined') {
        test.ok(data.create_trunk_a.name == 'asterisk1' || data.create_trunk_a.name == 'asterisk2', "Trunk A name matches");
        test.ok(data.create_trunk_b.name == 'asterisk1' || data.create_trunk_b.name == 'asterisk2', "Trunk B name matches");
      } else {
        test.ok(false,"Wonky return (likely trunks already exist)");
      }

      test.done();
      
    });
  },
  getRouting: function(test){
  
    client.get('/get_routing', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(res.statusCode == 200, "gettrunk returns 200 OK");
      test.ok(data.length === 3,"Two items in list");
      test.ok(data[0].role === null,"First instance role is null");
      test.ok(data[1].role === null,"Second instance role is null");
      test.done();
    });
  },
  discoverBeforeDelete: function(test){
  
    client.get('/discover', function(err, req, res, data) {

      if (err) {
        test.ok(false, "Restify error: " + err);
      }
    
      test.ok(res.statusCode == 200, "discover returns 200 OK");
      all_discovery = data;

      test.done();

    });
  },
  deleteAllTrunks: function(test){

    var trunks_deleted = 0;

    async.eachSeries(all_discovery,function(each_discovery,callback){

      async.eachSeries(each_discovery.trunks,function(each_trunk,callback){

        client.get('/deleteconfig/' + each_discovery.uuid + '/' + each_trunk, function(err, req, res, data) {

          if (err) {
            test.ok(false, "Restify error: " + err);
          }
        
          test.ok(res.statusCode == 200, "Trunk deleted");
          
          // For each trunk.
          trunks_deleted++;
          callback(false);
        });

      },function(err,result){
        // For each instance.
        callback(false);
      });


    },function(err,result){

      test.ok(trunks_deleted == 2,"Two trunks deleted.");
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

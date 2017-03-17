module.exports = function() {

	var CONFIG_FILE_DEFAULT = __dirname + '/../includes/config.json';
	var CONFIG_FILE_PATH = __dirname + '/../includes/';

	var fs = require('fs');
	var async = require('async');

	// These are required values? for now.
	var required = [
		"SERVER_PORT",
	];

	// We read our config from a json file.
	this.loadConfig = function(ecosystem,callback) {

		var configfile = CONFIG_FILE_PATH + 'config.json';

		if (ecosystem) {
			configfile = CONFIG_FILE_PATH + ecosystem + '.config.json';
		}

		// Check that it exists.
		fs.exists(configfile,function(exists){

			if (exists) {

				fs.readFile(configfile, 'utf8', function (err, data) {

					var configs = {};

					if (!err) {
						var configs = JSON.parse(data);

						callback(null,configs);


					} else {

						callback(err);
						// throw '!ERROR: FATAL, READING FILE FAILED: ' + err;
					}

				});

			} else {

				// Unconfigured.
				// which is an error.
				throw "CONFIG FILE MISSING: " + configfile;
				
			}

			// console.log("!trace config? ",configfile);

		

		});

	}

	this.parse = function(callback) {


			var opts = require("nomnom")
			.option('ecosystem', {
				abbr: 'e',
				help: 'Overrides ecosystem specific configuration (e.g. "--ecosystem foo" uses includes/foo.config.json)'
			})
			.option('logfile', {
				abbr: 'l',
				help: 'Optionally, log to a file'
			})
			.option('SERVER_PORT', {
				abbr: 'p',
				help: 'Port on which REST API runs'
			})
			.option('prettylog', {
				flag: true,
				help: 'If logging to a file, set this flag to make it more human legible.'
			})
			.option('syslog_server', {
				help: 'In addition to other logging, also log to this syslog server.'
			})
			.option('log_stdout', {
				abbr: 's',
				flag: true,
				help: 'Send logs to stdout'
			})

			.parse();

			this.loadConfig(opts.ecosystem,function(err,configs){
				// console.log("!trace input PRE-CONFIG: ",configs);
				// Alright now that we have those, let's override just what's specified.
				Object.keys(opts).forEach(function (key) {

					// Alright if they're set here, they override the config.
					configs[key] = opts[key];

					// target[key];


				// console.log("!trace input RECONFIG: ",configs);

				// Now, cycle through the required, and see if they're OK.
				Object.keys(required).forEach(function (key) {
					if (typeof configs[required[key]] === 'undefined') {
						// That's an error.
						throw "Hey man, you're missing a required config: " + required[key];
					}
				});

			}); //----
			

			callback(err,configs);

		});

	}.bind(this);	

};

/* 

some examples

.option('gituser', {
				abbr: 'u',
				help: 'Github user',
				// required: true
			})
			.option('gitpassword', {
				abbr: 'p',
				help: 'Github password',
				// required: true
			})
			.option('docker_user', {
				help: 'Dockerhub user.',
				// required: true
			})
			.option('docker_email', {
				help: 'Dockerhub user.',
				// required: true
			})
			.option('docker_password', {
				help: 'Dockerhub password',
				// required: true
			})
			.option('docker_image', {
				// default: "dougbtv/asterisk",
				help: 'The docker image that we update'
			})
			.option('gitrepo', {
				abbr: 'r',
				// default: GITHUB_REPO,
				help: 'Github repo url in format: user/project'
			})
			.option('irc_channel', {
				// default: "##asterisk-autobuilder",
				help: 'The bots chanel on IRC'
			})
			.option('git_setemail', {
				// default: "auto@builder.com",
				help: 'The IRC network to connect to'
			})
			.option('logfile', {
				help: 'Instead of logging to stdout, log to this file'
			})
			.option('git_setname', {
				// default: "Your loyal autobuilder",
				help: 'The IRC network to connect to'
			})
			.option('authdisabled', {
				flag: true,
				help: 'Do not authenticate users to use commands'
			})
			.option('skipclone', {
				flag: true,
				help: 'Skip updating the github repo.'
			})
			.option('skipbuild', {
				flag: true,
				help: 'Skip building docker files'
			})
			.option('skipdockerpush', {
				flag: true,
				help: 'Do not push to dockerhub'
			})
			.option('logdisable', {
				flag: true,
				help: 'Disable logging (for unit tests, usually)'
			})
			.option('skipautostart', {
				flag: true,
				help: 'Skip starting up all releases (for unit tests, usually)'
			})
			.option('forceupdate', {
				flag: true,
				help: 'Force an update automatically.'
			})

*/
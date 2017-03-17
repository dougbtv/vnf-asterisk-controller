module.exports = function(opts) {

	var PrettyStream = require('bunyan-prettystream');
	var fs = require('fs');

	var mystreams = null;
	// var bsyslog = require('bunyan-syslog');

	if (opts.log_stdout) {
	
		mystreams = [{
			stream: process.stdout
		}];

	} else {

		// In dev, just spit pretty json.
		var prettyStdOut = new PrettyStream();
		prettyStdOut.pipe(process.stdout);
		mystreams = [{
			level: 'debug',
			type: 'raw',
			stream: prettyStdOut
		}];
		
	}

	if (opts.logfile) {
		// Set to this logfile.
		if (opts.prettylog) {
			var logFile = fs.createWriteStream(opts.logfile);
			var prettyFile = new PrettyStream();
			prettyFile.pipe(logFile);
			mystreams = [{
				level: 'debug',
				type: 'raw',
				stream: prettyFile
			}];
		} else {
			mystreams = [{
				level: 'debug',
				path: opts.logfile
			}];		
		}
	}

	// If syslog is set, we also log there. In addition to the above.

	// if (opts.syslog_server) {
	// 	mystreams.push({
	// 		level: 'debug',
	// 		type: 'raw',
	// 		stream: bsyslog.createBunyanStream({
	// 			type: 'udp',
	// 			facility: bsyslog.local5,
	// 			host: opts.syslog_server,
	// 			port: 514
	// 		})
	// 	});
	// };

	// disable the log if need be.
	if (opts.logdisable) {
		mystreams = [];
	}

	var bunyan = require('bunyan');
	var log = bunyan.createLogger({
		name: "vnf-asterisk-controller",
		streams: mystreams,
	});

	// Use moment for formatting the date.
	var moment = require('moment');

	// General purpose logging mechanism.
	this.it = function(msg,indata) {

		// Anything above silent shows these.
		log.info({label: msg, content: indata});
		
	}

	// General purpose logging mechanism.
	this.error = function(msg,indata) {

		// Anything above silent shows these.
		log.error({label: msg, content: indata});

	}

	// General purpose logging mechanism.
	this.warn = function(msg,indata) {

		// Anything above silent shows these.
		log.warn({label: msg, content: indata});

	}


	// The doug smith tracing mechanism(TM)
	this.trace = function(msg,indata) {

		log.info({label: msg, content: indata});

	}

	// For tracing a death.
	this.death = function(msg,indata) {

		log.fatal({label: msg, content: indata});
		throw "!trace THOWING ERROR ON PURPOSE, dude: " + msg;

	}

	// Internal Logging mechanism.
	this.coreLog = function(msg,indata) {

		// Default indata, it's optional, after all
		if (typeof indata === 'undefined') {
			indata = "";
		}

		if (typeof msg === 'undefined') {
			msg = "[MESSAGE UNDEFINED]";
		}

		log.info("hi");

		var timenow = new moment().format("YYYY-MM-DD HH:mm:ss.S");
		console.log("[ " + timenow + " ] " + msg,indata);

	}

}
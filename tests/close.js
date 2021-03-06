'use strict';

var ftp = require('../');

var net = require('net');
var util = require('util');
var assert = require('assert');

var common = require('./includes/common.js');

var callbacks = {
	get: 0,
	head: 0
};
var expect = 2;

var url = 'ftp://127.0.0.1:2121/foo.txt';

util.log('running on node.js ' + process.version);

var server = net.createServer(function (conn) {
	conn.setEncoding('utf8');
	
	conn.on('data', function (data) {
		util.log('being rude and closing the command socket');
		conn.end();
	});
	
	util.log('sending the server hello message');
	conn.write('220 Hello random people I do not care about' + ftp.CRLF);
}).listen(2121, function () {
	util.log('server listening on 2121');
	
	var assertions = function (err, res) {
		assert.ok(err instanceof Error);
		assert.strictEqual(err.code, 11);
		
		if (expect === 0) {
			util.log('closing the rude server');
			server.close();
		}
	};
	
	ftp.get({
		url: url,
		bufferType: 'buffer'
	}, function (err, res) {
		util.log('ftp.get');
		callbacks.get++;
		expect--;
		assertions(err, res);
	});
	
	ftp.head(url, function (err, res) {
		util.log('ftp.head');
		callbacks.head++;
		expect--;
		assertions(err, res);
	});
});

common.teardown(callbacks);

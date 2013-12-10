//var io = require('socket.io').listen(8080);
var fs = require('fs');
var throttle = require('throttle');
var StreamBrake = require('streambrake');
var throttled = require('throttled-stream');
var brake = require('brake');
//var dl  = require('delivery');

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8080,host:"127.0.0.1"});

var clients = [];

wss.on('connection', function(ws) {
	clients.push(ws);
});

//wss.on('connection', function(ws) {
function startPlaying() {	
	// NB: If you don't throttle createReadStream and send a single chunk
	// it plays fine. Problem seems to partly be with throttling
	
	// read file and send in one go
	// works but its not streaming!
	/*fs.readFile('test.mp3', function (err, data) {
	  if (err) throw err;
	  ws.send(data, {binary: true, mask: false});
	});*/
	
	// (file_size * 8) / length of song in seconds
	var bit_rate = (4083712 * 8)/230; 
		
	// stream file
	var readStream = 
		//fs.createReadStream("test1.mp3");
		fs.createReadStream("test1.mp3").pipe(new StreamBrake((bit_rate/10) * 2.5));		
		
	var count = 0;
	readStream.on('data', function(data) {
		count++;
        console.log("Type: "+typeof data+", Size: "+data.length);
        console.log('Sending chunk of data: '+count);
		//if(count == 3)
		//if(data.length > 10)
			//ws.send(data, {binary: true, mask: false});
			
		// send to all connected clients
		console.log("Sending to "+clients.length+" clients");
		clients.forEach(function(client) {
			client.send(data, {binary: true, mask: false});
		});
    });
	
	readStream.on('end', function() {
        //response.end();  
		console.log("END");
    });
//});
}

startPlaying();
  
console.log('Server running at http://127.0.0.1:8080/');
/**
 * This is an example of a basic node.js script that performs
 * the Client Credentials oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
 */
////////////////
//requirements//
////////////////
var express = require('express');
var request = require('request');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

/////////////
//functions//
/////////////
function test(song,artist){

	let googleKey = 'AIzaSyCHGj8jZ-dfMhW-Azd-2929TiOdH1ED5Wk';
	let googleCx = '017283871425553781963:4-uvmf3bkzo';

	let url = 'https://www.googleapis.com/customsearch/v1?q=inurl%3Aplaylist+' +
		artist +
		'+' +
		song +
		'&key=' + googleKey +
		'&cx=' + googleCx;

	return new Promise(resolve=>{
		request(url, function (error, response, body) {

			json = JSON.parse(body);

			let playlist_ids = [];

			json.items.forEach(function (thing) {
				playlist_ids.push({link:thing.link, id: thing.link.substr(thing.link.lastIndexOf('/')+1)});
				//playlist_ids[thing.link] = (thing.link.substr(thing.link.lastIndexOf('/') + 1))
			});

			var spotifyClientId 	= 'd8ac09c630e445c2888df526eea6516c'; // Your client id
			var spotifyClientSecret = '5dff2f7a3eb24fd8a632f35ef4f63c6e'; // Your secret

			// your application requests authorization
			var authOptions = {
				url: 'https://accounts.spotify.com/api/token',
				headers: {
					'Authorization': 'Basic ' + (new Buffer(spotifyClientId + ':' + spotifyClientSecret).toString('base64'))
				},
				form: {
					grant_type: 'client_credentials'
				},
				json: true
			};
		  
			let foundPlaylists = [];
			request.post(authOptions, function(error, response, body){
				if (!error && response.statusCode === 200) {
					// use the access token to access the Spotify Web API
					var token = body.access_token;

					for (let link in playlist_ids){
						// console.log('access token: ', token);
						var options = {
							url: 'https://api.spotify.com/v1/playlists/' + playlist_ids[link].id,
							headers: {
								'Authorization': 'Bearer ' + token
							},
							json: true
						};
						request.get(options, function(error, response, body){
							foundPlaylists.push({link: playlist_ids[link].link, followers: body.followers.total});
							if(link==playlist_ids.length-1){
								console.log('finished getting all of the things.',link);
								foundPlaylists.sort((a,b)=>b.followers-a.followers);
								resolve(foundPlaylists);
							}
						});
					}
				} else {
					console.log('error: ', error, response, body);
				}
			});
		})
	});
}

///////////////
//application//
///////////////
var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port',8080);
app.use('/',express.static(__dirname + '/client'));

app.get('/',function(request, response){
	response.sendFile(path.join(__dirname,'index.html'));
});

server.listen(8080, function(){
	console.log('starting the server on port 8080');
});




//socket handlers
io.on('connection', function(socket){
	socket.on('query',function(data){
		console.log('recieved query');
		test(data.title,data.artist).then(data=>socket.emit('response',data));
	});
});
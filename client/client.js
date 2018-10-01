//client.js


//functions
var handleSubmit = function(e){
	e.preventDefault();
	socket.emit('query',{
		title: document.getElementById('inputTitle').value,
		artist: document.getElementById('inputArtist').value
	});
}

function createLinkNode(url, followers){
	var node = document.createElement('li');
	var link = document.createElement('a');
	var span = document.createElement('span');
	var followers = document.createTextNode(followers);
	span.appendChild(followers);
	link.href=url;
	link.appendChild(document.createTextNode(url));
	node.appendChild(span);
	node.appendChild(link);
	return node;
}

//setup connection
var socket = io();
socket.on('response', function(data){
	alert(JSON.stringify(data));
	//empty the output node
	var output = document.getElementById('output');
	output.innerHTML = '';
	console.log(data.length);
	for(let i=0; i<data.length; i++){
		console.log(i);
		output.appendChild(createLinkNode(data[i].link,data[i].followers));
	}
});

//event listeners
var form = document.getElementById('submit');
form.addEventListener('submit',handleSubmit,true);
var sockjs = require('sockjs');
var http = require('http');

var server = sockjs.createServer();

var clients = {};

function broadcast (message, exclude) {
	console.log ("Broadcasting to clients :")	
	for ( var i in clients ) {
		console.log('Client : '+ i);
		try {
			console.log('Broadcasting' + JSON.stringify(message) + ' to ' + i);
			if ( i != exclude ) clients[i].write( JSON.stringify(message) );
		} catch(e) {console.log(e.type);}
	}

}

function whisper (id, message) {
	if ( !clients[id] ) return;
	try {
		clients[id].write( JSON.stringify(message) );
	} catch(e){console.log(e.type);}
}

function getUserList(){
	var userList = {};
	for(client in clients)
	{
		console.log('Listing of clients : ' + client);
		userList[client] = client;
	}
	return userList;
}


server.on('connection', function(conn) {
	// New client
	console.log('Client id ' + conn.id + ' connected');
	//clients.push(conn);
	clients[conn.id] = conn;
	
	broadcast({type:'newUser', content:conn.id}, conn.id);
	whisper(conn.id, {type:'userList', content:getUserList()});
	
	conn.on('data', function(data) {
		data = JSON.parse(data);

		switch(data.type)
		{
			case 'chatMsg':
				broadcast({type:'chatMsg', pseudo:conn.id, content:data.content}, null);
			break;
			case 'nick':
				broadcast({type:'changeNick', oldNick:conn.id, newNick:data.content});
				clients[data.content] = clients[conn.id];
				delete clients[conn.id];
				conn.id = data.content;
			break;		
		}
	});
	conn.on('close', function(){
		delete clients[conn.id];
		broadcast({type:'userLeft', content:conn.id}, conn.id);
	});
});



var httpServer = http.createServer();
server.installHandlers(httpServer, {prefix:'/chat'});
httpServer.listen(8000, '0.0.0.0');

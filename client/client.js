var chat = {};
var connected = false;

var client = new SockJS("https://localhost/chat/", function(err, res) {
    if(err) throw err;
    connected = true;
    console.log("Connected");
});


client.onopen = function () {
  document.getElementById('status-span').innerHTML   = "Connected";
  document.getElementById('status-span').style.color = "green";
}

client.onmessage = function (msg) {
    msg = JSON.parse(msg.data);
    msgBox = document.getElementById('message');
	userList = document.getElementById('users');
	switch(msg.type)
	{
		case 'changeNick':
			parent = document.getElementById('users');
			child = document.getElementById('user_'+msg.oldNick);
			parent.removeChild(child);
			userList.innerHTML += "<div id='user_" + msg.newNick + "'>" + msg.newNick + "</div>";
		break;
		case 'chatMsg':
			date = new Date();
			h = date.getHours();if(h<10)  h = "0"+h;
			m = date.getMinutes();if(m<10)m = "0"+m;
			s = date.getSeconds();if(s<10)s = "0"+s;
				msgBox.innerHTML += "["+h+":"+m+":"+s+"] <span class='pseudo' style='font-weight:bold;'>" + msg.pseudo + "</span> : " + msg.content + "<br />";
		break;
		case 'newUser':
			userList.innerHTML += "<div id='user_" + msg.content + "'>" + msg.content + "</div>";
		break;
		case 'userLeft':
			parent = document.getElementById('users');
			child = document.getElementById('user_'+msg.content);
			parent.removeChild(child);
		break;
		case 'userList':
			for (var user in msg.content){
				userList.innerHTML += "<div id='user_" + user + "'>" + user + "</div>";
			}
		break;	
		default:
			msgBox.innerHTML += "Message d'origine inconnue : "+msg.type +"<br />";		
	}
}

client.onclose = function (e) {
		document.getElementById('status-span').innerHTML = "Connexion perdue :(";
		document.getElementById('status-span').style.color = 'red';
}

chat.send = function(message){
	client.send(JSON.stringify(message));
},

chat.sendMsg = function(){
	client.send(JSON.stringify({type:'chatMsg', content:document.getElementById('sentmsg').value}));
	document.getElementById('sentmsg').value = '';
},

chat.changeNick = function(){
	client.send(JSON.stringify({type:'nick', content:document.getElementById('nick').value}));
},

chat.setNick = function(nick)	{
	setTimeout(function(){client.send(JSON.stringify({type:'nick', content:nick}));}, 500);
}



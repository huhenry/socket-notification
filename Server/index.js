var express = require('express');
var app		= express();
var path	= require("path");
var mysql	= require("mysql");
var http	= require('http').Server(app);
var io		= require('socket.io')(http);
var router	= express.Router();

/* Creating POOL MySQL connection.*/

var pool    =    mysql.createPool({
      connectionLimit   :   100,
      host              :   'localhost',
      user              :   'root',
      password          :   'haizi112358',
      database          :   'MessagePusher',
      debug             :   false
});

var connections = {}

var db      = require("./db");
var message = require("../lib/comments.js").Messages;
var routes  = require("../Routes/")(router,mysql,pool);

app.use('/',router);

http.listen(3000,function(){
    console.log("Listening on 3000");
});

io.on('connection',function(socket){
	socket.auth = false;
	socket.on('authenticate', function(data){
		
    //check the auth data sent by the client
    checkAuthToken(data.token, function(err, success){
      if (!err && success){
        console.log("Authenticated socket ", socket.id);
        socket.auth = true;

		// store the connected socket client on online list
		connections[data.email]= socket;


		reveiveMessage(data.email,function(err,messages){
			if(err) return;
			var sendMessage= [];
			if(messages.length>0)
			{
				socket.emit("receive message",messages);
			}
			for(var i=0;i<message.length;i++)
			{

    			var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
				message.receiveMessage(message[i].messageId,now,function(err,data){
				});
			}
		});


      }
    });
  });

  setTimeout(function(){
    //If the socket didn't authenticate, disconnect it
    if (!socket.auth) {
      console.log("Disconnecting socket ", socket.id);
      socket.disconnect('unauthorized');
    }
  }, 1000);

	// Once client socket connect , it will send a ready status to tell server it's email address.
	// In the feature , maybe more info add there. so message should be like:
	// #{ email:"xx@xx.XXX",otherinfo:"otherinfos"}
	socket.on('ready',function(clientInfo){


		//receive Message stored on server DB
		//receive message
		
	});
	socket.on('send message',function(data){
		 target = connections[data.to]    
  		if (target) {

    			target.emit("receive message", data.message);
    			var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    			message.saveMessage(data.from,data.to,data.message,now,now,function(err,data){

    			});
  		}
  		else{

  			var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    		message.saveMessage(data.from,data.to,data.message,now,null,function(err,data){

    			});

  		}
		})

/*
	socket.on('comment added',function(data){
		db.addComment(data.user,data.comment,mysql,pool,function(error,result){
			if (error) {
				io.emit('error');
			} else {
                socket.broadcast.emit("notify everyone",{user : data.user,comment : data.comment});
			}
		});
	});
	*/
});

var receiveMessage = function (email,callback) {
   message.receiveMessage(email,function(err,messages){
   		if(err){
   			callback(true,null);
   		}
   		else{
   			callback(false,messages);
   		}

   })
}

var checkAuthToken = function(token,cb){
	 if (!token) {
    cb(new Error('Missing credentials'));
  }

  cb(null, data.token === 'fixedtoken');
}

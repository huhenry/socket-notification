var mysql	= require("mysql");


/* Creating POOL MySQL connection.*/

var pool    =    mysql.createPool({
      connectionLimit   :   100,
      host              :   'localhost',
      user              :   'root',
      password          :   '',
      database          :   'socketDemo',
      debug             :   false
});

var Message = function(from,to,message,sendDate,receiveDate) {
	this.messageId = 0;
    this.from = from;
    this.to = to;
    this.message= message;
    this.sendDate = sendDate;
    this.reveiveDate = reveiveDate;
};

Message = function(){

};

Message.prototype.SaveMessage= function(from,to,message,sendDate,receiveDate,callback){
	var self = this;
	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			return callback(true,null);
		} else {
			var sqlQuery = "INSERT into ?? (??,??,??,??,??) VALUES (?,?,?,?,?)";
			var inserts = ["Messages","from","to","message","sendDate","receiveDate",from,to,message,sendDate,receiveDate];
			sqlQuery = mysql.format(sqlQuery,inserts);
			connection.query(sqlQuery,function(err,rows){
				connection.release();
				if (err) {
					return callback(true,null);
				} else {
					callback(false,"comment added");
				}
			});
		}
		connection.on('error', function(err) {
			return callback(true,null);
        });
	});
}

Message.prototype.ReadMessage= function(receiveEmail,callback){
	var self = this;
	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			return callback(true,null);
		} else {
			var sqlQuery = "select ??,??,??,??,??,?? from ?? where ?? = ? and ?? = ?";
			var inserts = ["messageId","from","to","message","sendDate","receiveDate","Messages","to",receiveEmail,"receiveDate",null];
			sqlQuery = mysql.format(sqlQuery,inserts);
			connection.query(sqlQuery,function(err,rows){
				connection.release();
				if (err) {
					return callback(true,null);
				} else {
					callback(false,rows);
				}
			});
		}
		connection.on('error', function(err) {
			return callback(true,null);
        });
	});
}

Message.prototype.ReceiveMessage = function(messageId,receiveDate,callback){
	var self = this;
	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			return callback(true,null);
		} else {
			var sqlQuery = "update ?? set ??=? where ?? = ? and ?? = ?";
			var inserts = ["Messages","receiveDate",receiveDate,"messageId",messageId,"receiveDate",null];
			sqlQuery = mysql.format(sqlQuery,inserts);
			connection.query(sqlQuery,function(err,rows){
				connection.release();
				if (err) {
					return callback(true,null);
				} else {
					callback(false,null);
				}
			});
		}
		connection.on('error', function(err) {
			return callback(true,null);
        });
	});
}

exports.Message = Message;
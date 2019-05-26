var express = require('express'),  //引入express模块
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),  //引入socket.io模块并绑定到服务器
	users=[]; //保存所有在线用户的昵称
app.use('/',express.static(__dirname+'/www')); //指定静态html文件的位置
server.listen(80);

//socket部分
io.on('connection',function(socket){
	//昵称设置
	socket.on('login',function(nickname){
		if(users.indexOf(nickname) > -1){//检测users数组中有没有该用户
			socket.emit('nickExisted');
			
		}else{
			socket.userIndex = users.length;
			socket.nickname = nickname;
			users.push(nickname);
			socket.emit('loginSuccess');  //通知前端登录成功
			io.sockets.emit('system',nickname,users.length,'login');
		};
	});
	
	
	//断开连接的事件
	socket.on('disconnect',function(){
		//将断开连接的用户从users中删除
		users.splice(socket.userIndex,1);
		//通知除自己以外的所有人
		socket.broadcast.emit('system',socket.nickname,users.length,'logout');
	});
	//接收新消息
	socket.on('postMsg',function(msg){
		//将消息发送给服务器 服务器反馈给所有用户
		socket.broadcast.emit('newMsg',socket.nickname,msg);
	});
});
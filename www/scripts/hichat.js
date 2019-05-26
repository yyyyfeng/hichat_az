window.onload= function(){
	//实例并初始化我们的hichat程序
	var hichat = new HiChat();
	hichat.init();
}

//定义我们的hichat类
var HiChat = function(){
	this.socket = null;
};
//向原型添加业务方法
HiChat.prototype = {
	init:function(){//此方法初始化程序
	
		var that = this;
		//建立到服务器的socket连接
		this.socket = io.connect();
		//监听socket的connect事件，此事件表示连接已经成立
		this.socket.on('connect',function(){
		//连接到服务器后，显示昵称输入框
			document.getElementById('info').textContent = 'get yourself a nickname :)';
			document.getElementById('nickWrapper').style.display = 'block';
			document.getElementById('nicknameInput').focus();
			document.getElementById('loginBtn').addEventListener('click',function(){
				var nickName = document.getElementById('nicknameInput').value;
				//检查昵称输入框是否为空
				if(nickName.trim().length!=0)
				{//去处头尾空格的长度不为0  即昵称不为空时，则发起一个login事件并将输入的昵称发送到服务器
					that.socket.emit('login',nickName);
				}else{
					//否则输入框获得焦点
					document.getElementById('nicknameInout').focus(); 
				};
			},false);
		}
		);
		
		this.socket.on('nickExisted',function(){
			document.getElementById('info').textContent = '!nickname is taken,choose another pls';//显示昵称被占用的提示
		});
		
		this.socket.on('loginSuccess',function(){
			document.title = 'hichat | '+document.getElementById('nicknameInput').value;
			document.getElementById('loginWrapper').style.display = 'none'; //隐藏遮罩层显示聊天界面
			document.getElementById('messageInout').focus();//让消息输入框获得焦点
		});
		
		this.socket.on('system',function(nickName,userCount,type){
			//判断用户是连接还是离开以显示不同的信息
			var msg = nickName + (type == 'login' ? ' joined' : ' left');
			that._displayNewMsg('system',msg,'red');
	
			
			
			//将在线人数显示到页面顶部
			document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
		});
		document.getElementById('sendBtn').addEventListener('click', function() {
			var messageInput = document.getElementById('messageInput'),
				msg = messageInput.value;
			messageInput.value = '';
			messageInput.focus();
			if (msg.trim().length != 0) {
				that.socket.emit('postMsg', msg); //把消息发送到服务器
				that._displayNewMsg('me', msg); //把自己的消息显示到自己的窗口中
			};
		}, false);	
        this.socket.on('newMsg', function(user, msg) {
			that._displayNewMsg(user, msg);
		});
	},
	_displayNewMsg:function(user,msg,color){
		var container = document.getElementById('historyMsg'),
			msgToDisplay = document.createElement('p'),
			date = new Date().toTimeString().substr(0,8);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' +msg;
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight; //将消息卷上去
		
	}
	
	
};
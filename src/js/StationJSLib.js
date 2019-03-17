function localStorageArgs(){
    var userId;
    var userToken;
    var retV="";
    userId = localStorage.getItem('userId');
    if(userId && userId!="")
        retV += "$^@^$userId=" + userId;
    userToken = localStorage.getItem('userToken');
    if(userToken && userToken!="")
        retV += "$^@^$userToken=" + userToken;
    return retV;
}

function localStorageArgsIntoFormData(form1){
    if(form1+""!="[object FormData]")
        return;
    var userId;
    var userToken;
    userId = localStorage.getItem('userId');
    if(userId && userId!="")
        form1.append("userId",userId);
    userToken = localStorage.getItem('userToken');
    if(userToken && userToken!="")
        form1.append("userToken",userToken);
}

//invoke a web method, and then pass values to several variables
//in in-parameter, '$^@^$' is used to separate parameters
//in response data, '$_@_$' is used to separate values
function getFromWS(url_str,post_data_,outargs_,callback_){
    var argc = arguments.length;
    if(argc<3){
        alert("no enough arguments in getFromWS()");
        return;
    }
    var post_data = post_data_;
    var outargs = outargs_;
    var callback = callback_;
    if(typeof post_data_ !=="string" && argc==3){
        post_data="";
        outargs = post_data_;
        callback = outargs_;        
    }
    var xmlhttp=null;
    var state_Change=function(){
        if (xmlhttp.readyState==4){// 4 = "loaded"
            if (xmlhttp.status==200){// 200 = OK
                if(outargs){
                    var htmlstr =  xmlhttp.responseText;
                    var q = htmlstr.split('$_@_$');
                    for(var i=0;i<q.length;i++){            
                        outargs[i] = q[i];
                    }
                }
                if(callback)
                    callback();
            }
	    else{
                //alert("in getfromws("+url_str+")");
                //alert("Problem retrieving XML data");
	    }
        }
    };
    if (window.XMLHttpRequest){// code for all new browsers
        xmlhttp=new XMLHttpRequest();
    }
    else if (window.ActiveXObject){// code for IE5 and IE6
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (xmlhttp!=null){
        try{
            xmlhttp.onreadystatechange=state_Change;
            xmlhttp.open("POST", homeAddress()+"one/"+url_str, true);
            if(typeof post_data ==="string")
                post_data += localStorageArgs();
            else
                localStorageArgsIntoFormData(post_data);
            xmlhttp.send(post_data);
        }
        catch(exception){
            alert("xmlHttp Fail");
        }
    }
    else{
        alert("Your browser does not support XMLHTTP.");
    }
}

//invoke a web method, and then pass values to several variables
//in in-parameter, '$^@^$' is used to separate parameters
//in response data, '$_@_$' is used to separate values
function remoteService(url_str,post_data_,callback_){
    var argc = arguments.length;
    if(argc<2 || argc>3){
        alert("Invalid number of arguments in remoteService()");
        return;
    }
    var post_data;
    var callback;
    if(argc==2){
        post_data="";
        callback = post_data_;
    }
    else{
        post_data= post_data_;
        callback = callback_;
    }
    var outargs = new Array();
    var xmlhttp=null;
    var state_Change=function(){
        if (xmlhttp.readyState==4){// 4 = "loaded"
            if (xmlhttp.status==200){// 200 = OK
                if(outargs){
                    var htmlstr =  xmlhttp.responseText;
                    var q = htmlstr.split('$_@_$');
                    for(var i=0;i<q.length;i++){            
                        outargs[i] = q[i];
                    }
                }
                if(callback)
                    callback(outargs);
            }
	    else{
                //alert("in getfromws("+url_str+")");
                //alert("Problem retrieving XML data");
	    }
        }
    };
    if (window.XMLHttpRequest){// code for all new browsers
        xmlhttp=new XMLHttpRequest();
    }
    else if (window.ActiveXObject){// code for IE5 and IE6
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (xmlhttp!=null){
        try{
            xmlhttp.onreadystatechange=state_Change;
            xmlhttp.open("POST", homeAddress()+"one/"+url_str, true);
            if(typeof post_data ==="string")
                post_data += localStorageArgs();
            else
                localStorageArgsIntoFormData(post_data);
            xmlhttp.send(post_data);
        }
        catch(exception){
            alert("xmlHttp Fail");
        }
    }
    else{
        alert("Your browser does not support XMLHTTP.");
    }
}

//之所以要使用回调函数，是因为调用web service本身采用的是异步模式
function logout(id,token,callback){
    if(arguments.length<2){
        alert("no enough arguments in logout()");
        return;
    }
    var obj = new Array();
    var processResult = function(){
        if(obj[0]=="ok"){
            for(var i=1;i<obj.length;i++)
                localStorage.removeItem(obj[i]);
            callback();
        }
    };    
    getFromWS("/CoreService/logout","",obj,processResult);
}


//send loginname and password, to get userid and usertoken and classification
//returning data are:id token classification
function login(loginName,passwd,callback){
    if(arguments.length<3){
        alert("no enough arguments in login()");
        return;
    }
    var obj = new Array();
    var processResult = function(){
        for(var i=0;i<obj.length;i++){
            if(obj[i]){
                var idx = obj[i].indexOf("=");
                var key = obj[i].substring(0,idx);
                var val = obj[i].substring(idx+1);
                localStorage.setItem(key,val);
                obj[i] = val;
            }
        }
        //obj[3]=loginName;
        callback(obj);
    };
    getFromWS("/CoreService/login","loginName="+loginName+"$^@^$passwd="+passwd,obj,processResult);
}



//用随机数产生验证码
function veriCode(retlen){
    var now=new Date();
    var veri="i"+now;
    var len = veri.length;
    var vcode="";
    var vlen=6;
    if(retlen)
        vlen=retlen;
    for(var i=0;i<vlen;i++){
        var posi = Math.floor(Math.random()*len);//0-(len-1)
        var ch = veri.substr(posi,1);
        if(ch!==" " && ch!=="+" && ch!==":" && ch!=="o" && ch!=="O" && ch.charCodeAt(0)<=127 && ch!="(" && ch!=")" ){
            vcode += ch;
        }
        else
            i--;
    }
    return vcode.toUpperCase();
}

function normalContentType(){
    return "text/xml; charset=utf-8";
}


function homeAddress(need_protocol){
    var addressHead = window.location.href;
    var buf;
    buf = addressHead.substr(0,6);
    if(buf=="https:"){
        buf = addressHead.substr(8);
        addressHead="https://";
    }
    else{
        buf = addressHead.substr(7);
        addressHead="http://";
    }
    var index = buf.indexOf("/");
    if(index<0)
        buf = buf+"/";
    else
        buf = buf.substr(0,index+1);
    if(arguments.length==0 || need_protocol)
        return addressHead+buf;
    return buf;
}

// invoke a web method, and then pass html to several DIVs
// in post-data arguments for templates, '$^@^$' is used to separate values. If post-data is empty, we can skip it.
// in response data, '$_@_$' is used to separate html-blocks
// the last parameter can be a callback function
// below are some examples:
// loadFromWS(url, "base_hd");
// loadFromWS("Home/leftsidemenu.template","type=个人中心$^@^$item=主页","sidebar-menu-inner");
// loadFromWS(url, paras, "list", callback);
function loadFromWS(url_str,pst_data,target_id){
    var args = arguments;
    if(args.length<2){
        alert("no enough arguments in loadFromWS()");
        return;
    }
    var fromPos=2;
    var post_data=pst_data;
    if(typeof pst_data ==="string" && pst_data!=""){
        var posi = pst_data.indexOf("=");
        if(posi==-1){
            fromPos=1;
            post_data="";
        }
    }
    var divIds= new Array();
    for(var i=fromPos;i<args.length;i++)
        divIds[i-fromPos]=args[i];
    var xmlhttp=null;
    var state_Change=function(){
        if (xmlhttp.readyState==4){// 4 = "loaded"
            if (xmlhttp.status==200){// 200 = OK
                var htmlstr =  xmlhttp.responseText;     
                var q = htmlstr.split('$_@_$');
                for(var i=0;i<divIds.length;i++){
                    if(typeof divIds[i] === "function")
                        divIds[i]();
                    else{
                        var ctl = $('#'+divIds[i]);
                        if(ctl){
                            ctl = ctl[0];                        
                            if(typeof ctl.value === 'undefined'){
                                if(i<q.length)
                  	            $('#'+divIds[i]).html(q[i]);
                            }
                            else 
                                ctl.value = q[i];
                        }
                        else  if(typeof divIds[i] === "string" && divIds[i].substr(0,3)==="id:"){
                            var idstr=divIds[i].substr(3);
                  	    var enti=document.getElementById(idstr);
                            enti.innerHTML = q[i];
                        }
                    }
                }
            }
	    else{
                //alert("in loadfromws("+url_str+")");
                //alert("Problem retrieving XML data");
	    }
        }
    };
    if (window.XMLHttpRequest){// code for all new browsers
        xmlhttp=new XMLHttpRequest();
    }
    else if (window.ActiveXObject){// code for IE5 and IE6
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (xmlhttp!=null){
        xmlhttp.onreadystatechange=state_Change;
        var target_address = url_str;
        if(target_address.substr(0,1)=="/")
            target_address = target_address.substr(1);
        target_address = homeAddress()+target_address;
        xmlhttp.open("POST", target_address, true);
        if(typeof post_data ==="string")
            post_data += localStorageArgs();
        else
            localStorageArgsIntoFormData(post_data);
        xmlhttp.send(post_data);
    }
    else{
        alert("Your browser does not support XMLHTTP.");
    }
}

//从URL中获取相应参数的值。获取到的参数值存放在arguVal[0]中，而去除这个参数之后的URLstr被返回
function oneArguFromList(arguName,getParameters,arguVal){
    var posi=getParameters.indexOf(arguName+"=");
    if(posi==-1){
        arguVal[0]="";
        return getParameters;
    }
    var retVal="";
    if(posi!==0)
        retVal= getParameters.substr(0,posi-1);
    arguVal[0]=getParameters.substr(posi);
    posi=arguVal[0].indexOf("&");
    if(posi==-1){
        arguVal[0]= arguVal[0].substr(arguName.length+1);
        return retVal;
    }
    retVal += arguVal[0].substr(posi);
    arguVal[0] = arguVal[0].substring(arguName.length+1,posi);
    return retVal;
}

//第三个参数如果不是回调函数，则是某个div的id，可以设置多个div。返回的内容用$_@_$分隔，然后赋予各个div
//form1也可以不是FormData对象，而是一个形如“key1=val1&key2=val2”的字符串
function sendForm(urlstr,form1,callback){
    var xrq = new XMLHttpRequest();
    var divN = arguments.length-2;
    var args = arguments;
    xrq.onreadystatechange=function(){
        if(xrq.readyState==4){// 4 = "loaded"
            if(xrq.status==200){// 200 = OK
                if(typeof args[2]==="function"){
                    alert(xrq.responseText);  
                    callback(xrq.responseText);
                }else{
                    var divcontent=xrq.responseText.split('$_@_$');
                    if(divN>divcontent.length)
                        divN=divcontent.length;
                    for(var i=0;i<divN;i++)
                        $(args[i+2]).html(divcontent[i]);
                }
            }
            else{
                alert("in sendform");
                alert("Problem retrieving XML data:"+xrq.status);
        }}};
    //alert(urlstr);
    xrq.open("POST",encodeURI(urlstr));
    xrq.send(form1);
}

function get_appropriate_ws_url(server_id)
{
	var pcol;
	var u = document.URL;

	/*
	 * We open the websocket encrypted if this page came on an
	 * https:// url itself, otherwise unencrypted
	 */

	if (u.substring(0, 5) == "https") {
		pcol = "wss://";
		u = u.substr(8);
	} else {
		pcol = "ws://";
		if (u.substring(0, 4) == "http")
			u = u.substr(7);
	}

	u = u.split('/');

	/* + "/xxx" bit is for IE10 workaround */

	var urlstr = pcol + u[0] + "/ws"+server_id+"/";
        //alert(urlstr);
	return urlstr;
}




//数据

var getDomID = (function () {
    var ID = 100;
    return function () {
        return (ID++);
    }
})();


//用vue

//rule数据，存储rue
rule = {
    "算数": ["加法", "减法", "乘法", "除法"],
    "逻辑": ["and", "or", "not"],
    "逻辑2": ["and", "or", "not"],
    "逻辑3": ["and", "or", "not"],
};



computer_flow = {
    "level0": {
        "ruleNum": 3, //这个是添加新的rule时候的后缀,算是一个辅助变量
        "rules": {
            1: {
                "id": "r_0_1", //rule的id，cfl里面的key
                "type": "input", //rule的种类
                "parameter": undefined, //有的rule有常量，写在这里
                "connector": [] //负责管理上一层的链接关系，即输入,用全局唯一的值
            },
            2: {
                "id": "r_0_2",
                "type": "input",
                "parameter": 0,
                "connector": []
            },
        },
        "variables": {
            3: {
                "name": "score",//变量的名字
                "value": 0,//显示的变量的数值
                "connector": ["1"]//是哪一个rule的输入,用的是js里面唯一的id
            },
            21: {
                "name": "if",//变量的名字
                "value": 0,//显示的变量的数值
                "connector": ["2"]//是哪一个rule的输入,用的是js里面唯一的id
            }
        },
    },
    "level1": {
        "ruleNum": 5,
        "rules": {
            4: {
                "id": "r_1_1", //rule的id，cfl里面的key
                "type": "input", //rule的种类
                "parameter": 0, //有的rule有常量，写在这里
                "connector": ["3"] //负责管理上一层的链接关系，即输入,用全局唯一的值
            },
            5: {
                "id": "r_1_2",
                "type": "input",
                "parameter": 0,
                "connector": ["21"]
            },
            6: {
                "id": "r_1_3",
                "type": "input",
                "parameter": 0,
                "connector": ["3", "21"]
            },
            22: {
                "id": "r_1_4",
                "type": "input",
                "parameter": undefined,
                "connector": ["3", "21"]
            },
            23: {
                "id": "r_1_2",
                "type": "input",
                "parameter": 0,
                "connector": ["3", "21"]
            },
        },
        "variables": {
            7: {
                "name": "score",//变量的名字
                "value": 0,//显示的变量的数值
                "connector": ["4"]//是哪一个rule的输入,用的是js里面唯一的id
            },
            8: {
                "name": "oo",//变量的名字
                "value": 0,//显示的变量的数值
                "connector": ["5"]//是哪一个rule的输入,用的是js里面唯一的id
            },
            9: {
                "name": "oo",//变量的名字
                "value": 0,//显示的变量的数值
                "connector": ["6"]//是哪一个rule的输入,用的是js里面唯一的id
            },
            10: {
                "name": "oo",//变量的名字
                "value": 0,//显示的变量的数值
                "connector": ["23"]//是哪一个rule的输入,用的是js里面唯一的id
            },
            11: {
                "name": "oo",//变量的名字
                "value": 0,//显示的变量的数值
                "connector": ["6"]//是哪一个rule的输入,用的是js里面唯一的id
            },
        },
    },

}

//对应这rule工具栏的vue

choosed = {
    type: "", //只能是level，node, rule,addline,deleteline,addvariable 六种情况一种,代表被选中的对象。
    level: "", //存着被选中的level的等级
    rule: "", // 添加rule的时候用，确定要添加什么种类的rule
    node: "", // 存着被选中的node的第一个点的id
    _choosedTarget:undefined,
    _nodeTarget:undefined,
    clean: function () {
        this.type = "";
        this.level = "";
        this.rule = "";
        this.node = "";
        this.choosedTarget = undefined;
        this.nodeTarget = undefined;

    },
    set choosedTarget(data) {
        if (data == undefined) {
            $(this._choosedTarget).css({ // 旧的外围去掉
                "outline-color": "black",
                "outline-width": "3px",
                "outline-style": "none",
            });
            this._choosedTarget = data;
        } else {
            $(data).css({
                "outline-color": "black",
                "outline-width": "3px",
                "outline-style": "dashed",
            });
            this._choosedTarget = data;
        }
    },
    get choosedTarget() {
        return _choosedTarget;
    },
    set nodeTarget(data) {
        if (data == undefined) {
            if(this._nodeTarget!=undefined){
                $(this._nodeTarget).css({ // 旧的外围去掉
                    "outline-color": "black",
                    "outline-width": "3px",
                    "outline-style": "none",
                });
            }   
            this._nodeTarget = data;
        } else {
            $(data).css({
                "outline-color": "black",
                "outline-width": "3px",
                "outline-style": "dashed",
            });
            this._nodeTarget = data;
        }
    },
    get nodeTarget() {
        return this._nodeTarget;
    }
}

des = new Vue({
    el: "#desc",
    data:{
        id:0,
    },
})


tool = new Vue({
    el: '#tool',
    data: {
        rules: rule,
    },
    methods: {
        chooseAddVar(event) {
            if (choosed.type == "") {
                choosed.choosedTarget = event.currentTarget;
                choosed.type = "addvariable";
                return;

            } else if (choosed.type == "level") { // 之前已经选中了一个等级阶层，所以可以添加东西了
                workarea.addvariable(choosed.level); // 直接添加一个node,对其他的部分不用变化了
                return;
            } else if (choosed.type == "addvariable") { // 又点了下自己，取消选择
                choosed.clean();
                return;
            } else { // 对于其他的选中，直接把那个选中改成这个就行
                choosed.clean();
                choosed.choosedTarget = event.currentTarget;
                choosed.type = "addvariable";
                return;
            }
        },
        chooseRule(event, rule) {
            if (choosed.type == "") {
                choosed.choosedTarget = event.currentTarget;
                choosed.type = "rule";
                choosed.rule = rule;
                return;

            } else if (choosed.type == "level") { // 之前已经选中了一个等级阶层，所以可以添加东西了
                workarea.addrule(choosed.level, rule); // 直接添加一个node,对其他的部分不用变化了
                return;
            } else if (choosed.type == "rule") { // 又点了下自己，取消选择
                if (rule == choosed.rule) {
                    choosed.clean();
                    return;
                } else {
                    choosed.clean();
                    choosed.choosedTarget = event.currentTarget;
                    choosed.type = "rule";
                    choosed.rule = rule;
                    return;
                }
            } else { // 对于其他的选中，直接把那个选中改成这个就行
                choosed.clean();
                choosed.choosedTarget = event.currentTarget;
                choosed.type = "rule";
                choosed.rule = rule;
                return;
            }
        },
        chooseAddLine(event){
            if (choosed.type == "") {
                choosed.choosedTarget = event.currentTarget;
                choosed.type = "addline";
                return;

            } else if (choosed.type == "addline") { // 又点了下自己，取消选择
                return;
            } else { // 对于其他的选中，直接把那个选中改成这个就行
                choosed.clean();
                choosed.choosedTarget = event.currentTarget;
                choosed.type = "addline";
                return;
            }
        },
        chooseDeleteLine(event){
            if (choosed.type == "") {
                choosed.choosedTarget = event.currentTarget;
                choosed.type = "deleteline";
                return;

            } else if (choosed.type == "deleteline") { // 又点了下自己，取消选择
                choosed.clean();
                return;
            } else { // 对于其他的选中，直接把那个选中改成这个就行
                choosed.clean();
                choosed.choosedTarget = event.currentTarget;
                choosed.type = "deleteline";
                return;
            }
        }
        
    },
});


//对应工作区的那些点
workarea = new Vue({
    el: "#workarea",
    data: {
        data: computer_flow,
    },
    methods: {
        //一些涉及到添加删除data的方法，其他的方法放到外面
        //删除一个节点，要输入这个节点的id
        deletenode(id) {
            for (levelkey in this.data) {
                for (i in this.data[levelkey]["variables"]) {
                    var l = this.data[levelkey]["variables"][i]["connector"];
                    for (var j = 0; j < l.length; j++) {
                        if (l[j] == id) {
                            l.splice(j, 1);
                        }
                    }
                    if (i == id) {
                        this.$delete(this.data[levelkey]["variables"], id);
                    }

                }
                for (i in this.data[levelkey]["rules"]) {
                    var l = this.data[levelkey]["rules"][i]["connector"];
                    for (var j = 0; j < l.length; j++) {

                        if (l[j] == id) {
                            l.splice(j, 1);
                        }
                    }
                    if (i == id) {
                        this.$delete(this.data[levelkey]["rules"], id);
                    }
                }
            }
            setTimeout(draw, 1);
        },
        //添加一个规则，要输入规则的种类
        addrule(level, type) {
            if (this.data[level] == null || this.data[level] == undefined) {
                return;
            }
            var l = level.substring(5);
            var id = "r_" + l + "_" + this.data[level]["ruleNum"];
            this.data[level]["ruleNum"]++;
            var newrule = {
                "id": id, //rule的id，cfl里面的key
                "type": type, //rule的种类
                "parameter": undefined, //有的rule有常量，写在这里
                "connector": [] //负责管理上一层的链接关系，即输入,用全局唯一的值
            };
            this.$set(this.data[level]["rules"], "" + getDomID(), newrule);
            setTimeout(draw, 1);

        },
        // 添加一个变量，要输入层数
        addvariable(level) {
            if (this.data[level] == null || this.data[level] == undefined) {
                return;
            }

            var newVariable = {
                "name": "Value" + getDomID(),// 加一个随机的后缀
                "value": 0,//显示的变量的数值
                "connector": []//是哪一个rule的输入,用的是js里面唯一的id
            }
            this.$set(this.data[level]["variables"], "" + getDomID(), newVariable);
            setTimeout(draw, 1);
        },
        chooseLevel(event) {
            level = event.currentTarget.id
            if (choosed.type == "") {
                choosed.choosedTarget = event.currentTarget;
                choosed.type = "level";
                choosed.level = level;//把选中的level写进去
                return;
            } else if (choosed.type == "level") { // 又选中了一个level，如果层级不同需要改变,如果是又点了下自己就clean
                if (choosed.level == level) {
                    choosed.clean();
                    return;
                } else {
                    choosed.clean();
                    choosed.choosedTarget = event.currentTarget;
                    choosed.type = "level";
                    choosed.level = level;//把选中的level写进去
                    return;
                }
            } else if (choosed.type == "addvariable") {// 之前已经选中了添加模式，所以直接添加变量即可
                this.addvariable(level); // 直接添加一个node,对其他的部分不用变化了
                return;
            }else if(choosed.type == "rule"){
                this.addrule(level,choosed.rule);
                return;
            } 
            else { // 对于其他的选中，直接把那个选中改成这个就行
                choosed.clean();
                choosed.choosedTarget = event.currentTarget;
                choosed.type = "level";
                choosed.level = level;//把选中的level写进去
                return;
            }
        },
        chooseNode(event){
            node = event.currentTarget.id
            if (choosed.type == "") {
                choosed.choosedTarget = event.currentTarget;
                choosed.type = "node";
                choosed.node = node;//把选中的node id 写进去
                return;
            } else if (choosed.type == "node") { 
                if (choosed.node == node) {
                    choosed.clean();
                    return;
                } else {
                    choosed.clean();
                    choosed.choosedTarget = event.currentTarget;
                    choosed.type = "node";
                    choosed.node = node;//把选中的node写进去
                    return;
                }
            } else if (choosed.type == "addline") {
                // node要添加线了
                if(choosed.node==""){ //是第一个被点击的node
                    choosed.node = node;
                    choosed.nodeTarget = event.currentTarget; // 存在第二个target里面
                }else{
                    addline(node,choosed.node);
                    // 清理第一个被选中的点
                    choosed.node = "";
                    choosed.nodeTarget = undefined;
                }
            }else if (choosed.type == "deleteline") {
                // node要添加线了
                if(choosed.node==""){ //是第一个被点击的node
                    choosed.node = node;
                    choosed.nodeTarget = event.currentTarget; // 存在第二个target里面
                }else{
                    deleteline(node,choosed.node);
                    // 清理第一个被选中的点
                    choosed.node = "";
                    choosed.nodeTarget = undefined;
                }
            }
            else { // 对于其他的选中，直接把那个选中改成这个就行
                choosed.clean();
                choosed.choosedTarget = event.currentTarget;
                choosed.type = "node";
                choosed.node = node;//把选中的level写进去
                return;
            }
        },
        // 添加最后一个rule，不需要移动太多
        addLastLevel(){
            // 先获取层数
            max = 0;
            for(level in this.data){
                l = parseInt(level.substring(5));
                if(l>max){
                    max= l;
                }
            }
            maxlevel = "level"+(max+1);
            newlevel = {
                "ruleNum": 0,
                "rules": {},
                "variables":{},
            }
            this.$set(this.data,maxlevel,newlevel);
            setTimeout(draw, 1);
        },
        addNextLevel(level){
            //获取最大层数
            max = 0;
            for(le in this.data){
                l = parseInt(le.substring(5));
                if(l>max){
                    max= l;
                }
            }
            // 先找到这一层，然后保存这一层，移动到下一层
            levelint = parseInt(level.substring(5));// 被插入的那一层的int形
            var levelbuf = this.data[level]; // 保存当前一层的值，缓存
            // 先把本空白层插入,记得清理本层加一层的所有输入，断掉链接
            for(node in this.data["level"+(levelint)]["rules"]){
                this.data["level"+(levelint)]["rules"][node].connector=[];
            }
            newlevel = {
                "ruleNum": 0,
                "rules": {},
                "variables":{},
            }
            this.$set(this.data,level,newlevel);

            // 接下来把后面几层的东西全部后移几位
            for(var i = levelint+1;i<=max+1;i++){
                levelbuff = this.data["level"+i];
                this.$set(this.data,"level"+i,levelbuf);
                levelbuf = levelbuff;
            }
            setTimeout(draw, 1);
            
        },
        deleteLevel(level){
            //获取最大层数
            max = 0;
            for(le in this.data){
                l = parseInt(le.substring(5));
                if(l>max){
                    max= l;
                }
            }
            // 第一步，先清理下一层的输入
            levelint = parseInt(level.substring(5));
            if(levelint<max){ // 保证不是最后一层
                for(node in this.data["level"+(levelint+1)]["rules"]){
                    this.data["level"+(levelint+1)]["rules"][node].connector=[];
                }
            }
            //第二步，把下面的东西按顺序向上移动
            for(var i=levelint;i<=max-1;i++){
                this.$set(this.data,"level"+i,this.data["level"+(i+1)]);// 下一层搬到上一层
            }
            this.$delete(this.data,"level"+max);
            setTimeout(draw, 1);

        }
       

    }

});





// 效果

// 工具栏rule规则里面的上下移动的效果


$(".rulemain").click(function () {
    $(this).nextAll().slideToggle();
});

$(".rulesecond").hover(function () {
    $(this).css("background-color", "#EAE0C1");
}, function () {
    $(this).css("background-color", "#fdf6d3")
});
//缩放
$(window).resize(draw);


//根据id寻找某个节点node，并且返回这个节点node所在的层，以及规则
function findNode(id) {
    var node = {
        level: undefined,
        type: undefined,
        v: undefined,
    }
    for (level in computer_flow) {
        for (idd in computer_flow[level]["rules"]) {
            if (id == idd) {
                node.level = level;
                node.type = "rules";
                node.v = computer_flow[level]["rules"][idd];
                return node;
            }
        }
        for (idd in computer_flow[level]["variables"]) {
            if (id == idd) {
                node.level = level;
                node.type = "variables";
                node.v = computer_flow[level]["variables"][idd];
                return node;
            }
        }

    }
}
//在两个节点之间删除或者添加，默认是添加。因为寻找node节点的属性的部分可以共用
function addline(id1, id2) {
    node1 = findNode(id1);
    node2 = findNode(id2);
    console.log(node1);
    console.log(node2);

    if (node1 == undefined || node2 == undefined) {
        console.log("未找到id");
        return;
    }
    if (node1.type == node2.type) {
        console.log("两个相同的层次或者是同一个node");
        return;
    }
    //同一层，代表着一个是rule，一个是variable,然后判断下哪个上面
    if (node1.level == node2.level) {
        if (node1.type == "rules") { //id1在上面
            node2.v.connector.push(id1);
            lineBetweenDiv(id1, id2);
        } else {
            node1.v.connector.push(id2);
            lineBetweenDiv(id2, id1);
        }
    } else {
        //不同层，先检测下是不是层数是不是差一层
        l1 = parseInt(node1.level.substring(5));
        l2 = parseInt(node2.level.substring(5));
        if (((l1 - l2) == -1) && node1.type == "variables") { // id1在上面
            node2.v.connector.push(id1);
            lineBetweenDiv(id1, id2);
        } else if (((l1 - l2) == 1) && node2.type == "variables") {
            node1.v.connector.push(id2);
            lineBetweenDiv(id2, id1);
        } else {//隔着两层以上，这个不能有
            console.log("不是相邻的");
            return;
        }
    }
}

function deleteline(id1, id2) {
    node1 = findNode(id1);
    node2 = findNode(id2);
    console.log(node1);
    console.log(node2);

    if (node1 == undefined || node2 == undefined) {
        console.log("未找到id");
        return;
    }
    if (node1.type == node2.type) {
        console.log("两个相同类型的层次或者是同一个node");
        return;
    }
    //同一层，代表着一个是rule，一个是variable,然后判断下哪个上面
    if (node1.level == node2.level) {
        if (node1.type == "rules") { //id1在上面
            var i = node2.v.connector.indexOf(id1);
            if (i != -1) {
                node2.v.connector.splice(i, 1);
                draw();
            } else {
                console.log("没有找到对应关系");
                return;
            }
        } else {
            var i = node1.v.connector.indexOf(id2);
            if (i != -1) {
                node1.v.connector.splice(i, 1);
                draw();
            } else {    
                console.log("没有找到对应关系1");
                return;
            }
        }
    } else {
        //不同层，先检测下是不是层数是不是差一层
        l1 = parseInt(node1.level.substring(5));
        l2 = parseInt(node2.level.substring(5));
        if (((l1 - l2) == -1) && node1.type == "variables") { // id1在上面
            var i = node2.v.connector.indexOf(id1);
            if (i != -1) {
                node2.v.connector.splice(i, 1);
                draw();
            } else {
                console.log("没有找到对应关系");
                return;
            }
        } else if (((l1 - l2) == 1) && node2.type == "variables") {
            var i = node1.v.connector.indexOf(id2);
            if (i != -1) {
                node1.v.connector.splice(i, 1);
                draw();
            } else {
                console.log("没有找到对应关系");
                return;
            }
        } else {//隔着两层以上，这个不能有
            console.log("不是相邻的");
            return;
        }
    }
}



//设置canvas的画布大小，让他能和实际上的css样式一样大，改大小之前一定要调用这个
//在两个个点之间画线 

function drawresize() {
    var height = $("#work").height();
    var width = $("#work").width();
    $("#drawing").get(0).setAttribute("width", width.toString());
    $("#drawing").get(0).setAttribute("height", height.toString());


}

//在两个坐标之间画线
function line(x1, y1, x2, y2, color) {
    //画之前确定大小没问题
    var c = document.getElementById("drawing");
    var ctx = c.getContext("2d");
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}


//在两个节点之间画线
function lineBetweenDiv(id1, id2, color = '#d1cbb8') { //id1要求在上面
    var xx = $("#drawing").offset().left;
    var yy = $("#drawing").offset().top;

    var div1 = $("#" + id1);
    var div2 = $("#" + id2);

    var y1 = div1.offset().top;
    var x1 = div1.offset().left;
    var y2 = div2.offset().top;
    var x2 = div2.offset().left;

    var width1 = div1.width();
    var height1 = div1.height();
    var width2 = div1.width();
    var height2 = div2.height();

    line(x1 - xx + width1 / 2, y1 - yy + height1, x2 - xx + width2 / 2, y2 - yy, color);
}


//画出所有的线
function draw() {
    drawresize();
    for (levelkey in computer_flow) {
        for (id in computer_flow[levelkey]["variables"]) {
            var l = computer_flow[levelkey]["variables"][id].connector;
            for (var i = 0; i < l.length; i++) {
                lineBetweenDiv(l[i], id);
            }
        }
        for (id in computer_flow[levelkey]["rules"]) {
            var l = computer_flow[levelkey]["rules"][id].connector;
            for (var i = 0; i < l.length; i++) {
                lineBetweenDiv(l[i], id);
            }
        }
    }
}



draw();
workarea.addrule("level0", "hello");
workarea.addvariable("level0");


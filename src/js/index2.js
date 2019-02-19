// // rule的格式
// var rule = {
//     "id": "rule1", // 内部的id，同时也是div的id，要求全局唯一，格式，rule+唯一后缀.
//     "name":"r_o_1", // 规则的名字
//     "type":"input", // 规则的类型
//     "parameter":"",// 常量表
//     "description":"一个输入的规则",// 一个描述
//     "input":[], //上一层由哪些输入
// }

//variables的格式
// var variable = {
//     "id":"variable2",// 内部的唯一id，方便快速找到
//     "name":"score",// 变量的名字
//     "value":1, // 变量显示的值
//     "description":"一个输入的变量", // 一个描述
//     "input":[], //上一层由哪些输入,暂时考虑线条的关系维护放到这里。不另外设计表格了。
// }

// var level = {
//     "id":"level123",
//     "rule":[],
//     "variable":[],
//     "description":"一层的描述",//一层的描述
// } 

// var levels = [] // 多个层次。


computer_flow = [
    {
        "id": "level0",
        "description": "",
        "rule": [
            {
                "id": "rule1",
                "name": "r_o_1",
                "type": "input",
                "parameter": "",
                "description": "一个输入的规则",
                "input": [],
            },
            {
                "id": "rule2",
                "name": "r_o_2",
                "type": "input",
                "parameter": "",
                "description": "一个输入的规则",
                "input": [],
            },
            {
                "id": "rule3",
                "name": "r_o_3",
                "type": "input",
                "parameter": "",
                "description": "一个输入的规则",
                "input": [],
            },
        ],
        "variable": [
            {
                "id": "variable1",
                "name": "score1",
                "value": 1,
                "description": "一个输入的变量",
                "input": ["rule3", "rule2"],
            },
            {
                "id": "variable2",
                "name": "score2",
                "value": 1,
                "description": "一个输入的变量",
                "input": [],
            },

        ]

    },
    {
        "id": "level1",
        "description": "",
        "rule": [
            {
                "id": "rule4",
                "name": "r_o_4",
                "type": "input",
                "parameter": "",
                "description": "一个输入的规则",
                "input": ["variable2", "variable1"],
            },
            {
                "id": "rule5",
                "name": "r_o_5",
                "type": "input",
                "parameter": "",
                "description": "一个输入的规则",
                "input": [],
            },
            {
                "id": "rule6",
                "name": "r_o_6",
                "type": "input",
                "parameter": "",
                "description": "一个输入的规则",
                "input": [],
            },
        ],
        "variable": [
            {
                "id": "variable7",
                "name": "score4",
                "value": 1,
                "description": "一个输入的变量",
                "input": [],
            },
            {
                "id": "variable8",
                "name": "scoe5",
                "value": 1,
                "description": "一个输入的变量",
                "input": [],
            },
        ]

    }
]
var getRandomID = (function () {
    var ID = 100;
    return function (type) {
        return type + (ID++);
    }
})();
commonFunction = {
    //获取一个独一无二的名字，格式是type和一个数字后缀组成。这个名字用于作为vue的key
    getRandomID: getRandomID,
    //创建一个rule对象
    createRule: function (name) {
        name = name || "NewRule";
        return {
            "id": getRandomID("rule"),
            "name": name,
            "type": "0undefined",
            "parameter": "",
            "description": "",
            "input": [],
        }
    },
    //创建一个value对象
    createVariable: function (name) {
        name = name || "NewValue";
        return {
            "id": getRandomID("value"),
            "name": name,
            "value": 0,
            "description": "",
            "input": [],
        }
    },
    // 创建一个空白层
    createLevel: function () {
        return {
            "id": getRandomID("level"),
            "rule": [],
            "variable": [],
            "description": "",
        }
    }
}
rules = {
    "算数": ["加法", "减法", "除法", "乘法"],
    "逻辑": ["与", "或", "非"],
    "字符串": ["删除", "增加", "减少"],
}

// 整个界面的vue数据和函数
var workarea = new Vue({
    "el": "#main",
    "data": {
        "computer_flow": computer_flow,
        "attrAreaNode": null, // 现在属性栏目显示的node节点
        "isAddLine": false,
        "addLineBuffer": [], // 存着添加线的buff
        "rules": rules,
        "isDragAddNode": "",
        "isMoveNode":"",

    },
    "methods": {
        // 恢复到什么都没选中的状态，右键菜单收回去，这个函数常常用于选中某些节点前
        clear1() {
            $(".rightMenu").css("display", "none");//再次点击时隐藏菜单框
            this.attrAreaNode = null;
        },
        // 清空添加线的状态。
        clear2() {
            this.isAddLine = false;
            this.addLineBuffer = [];
        },
        // 显示右键菜单
        showRM(event, name) {

            // 已经显示的右键菜单隐藏。
            for (let a of document.getElementsByClassName("rightMenu")) {
                a.style.display = 'none';
            }
            event.preventDefault();
            var listBox = document.getElementById(name);//获取自定义右键菜单
            var x = event.clientX;
            var y = event.clientY;
            // // 因为右键菜单是在workarea的后代，所以absolute相对于workarea的位置，要减去
            // var div1 = document.getElementById("workarea");
            // var y1 = div1.offsetTop;
            // var x1 = div1.offsetLeft;
            listBox.style.display = 'block';//右键点击时显示菜单框
            listBox.style.left = x + 'px';
            listBox.style.top = y + 'px';
            // 将哪个位置写入每个button的loc
            for (let a of listBox.getElementsByClassName("rmButton")) {
                a.setAttribute("data-loc", event.currentTarget.getAttribute("data-loc"))
            }
        },
        //在某一层里面添加规则节点,index是第几个位置，level是哪一层，index不能小于0，index大于这层大小的时候，就是最后一位
        addRule(level, index) {

            var newrule = commonFunction.createRule();
            if (this.computer_flow.length <= level || level < 0 || index < 0) {
                console.log("error : error arguements");
                return;
            }
            this.computer_flow[level]["rule"].splice(index, 0, newrule);
            setTimeout(line.drawAllLine, 1);
        },
        // 在index节点前面插入一个变量，如歌index大于该层的节点数量，那么就是在最后面插入
        addVariable(level, index) {

            var newVariable = commonFunction.createVariable();
            if (this.computer_flow.length <= level || level < 0 || index < 0) {
                console.log("error : error arguements");
                return;
            }
            this.computer_flow[level]["variable"].splice(index, 0, newVariable);
            setTimeout(line.drawAllLine, 1);
        },
        addLevel(index) {

            var newLevel = commonFunction.createLevel();
            if (index < 0) {
                console.log("error : error arguements");
                return;
            }
            this.clearLevelInput(index); // 要先尝试把插入层的下一层给删除输入,再尝试插入
            this.computer_flow.splice(index, 0, newLevel);
            setTimeout(line.drawAllLine, 1);
        },

        addRuleButton(event) {

            var loc = event.currentTarget.getAttribute("data-loc");
            //loc应该是一个以level_打头的字符串
            loc = parseInt(loc.split("_")[1]);
            this.addRule(loc, 999999999);


        },
        addVariableButton(event) {
            var loc = event.currentTarget.getAttribute("data-loc");
            //loc应该是一个以level_打头的字符串
            loc = parseInt(loc.split("_")[1]);
            this.addVariable(loc, 999999999);
        },
        addUpLevelButton(event) {
            var loc = event.currentTarget.getAttribute("data-loc");
            //loc应该是一个以level_打头的字符串
            loc = parseInt(loc.split("_")[1]);
            this.addLevel(loc);
        },
        addDownLevelButton(event) {
            var loc = event.currentTarget.getAttribute("data-loc");
            //loc应该是一个以level_打头的字符串
            loc = parseInt(loc.split("_")[1]);
            this.addLevel(loc + 1);
        },
        addLevelButton() {
            this.addLevel(999999999);
        },
        //遍历得到最宽的level层的宽度
        getWidth() {
            maxNum = 0;
            for (var i = 0; i < this.computer_flow.length; i++) {
                if (computer_flow[i]["rule"].length > maxNum) {
                    maxNum = this.computer_flow[i]["rule"].length;
                }
                if (computer_flow[i]["variable"].length > maxNum) {
                    maxNum = this.computer_flow[i]["variable"].length;
                }
            }
            return maxNum * 130 + 100 + 2; // 2是bar的有半变
        },
        // 得到这幅图的最大的高度
        getHeight() {
            return this.computer_flow.length * 300 + 50 + 2;
        },
        //重置computer_flow 的大小,这个在发生插入删除操作这些要进行。
        resize() {
            var windowsHeight = document.getElementById("workarea").clientHeight;
            var windowsWidth = document.getElementById("workarea").clientWidth;
            var innerHeight = this.getHeight();
            var innerWidth = this.getWidth();
            // console.log(windowsHeight+" "+windowsWidth+" "+innerHeight+" "+innerWidth);
            if (innerHeight > windowsHeight) {
                document.getElementById("innerworkarea").style.height = innerHeight + "px";
                document.getElementById("lines").style.height = innerHeight + "px";
            } else {
                document.getElementById("innerworkarea").style.height = windowsHeight + "px";
                document.getElementById("lines").style.height = windowsHeight + "px";
            }
            if (innerWidth > windowsWidth) {
                document.getElementById("innerworkarea").style.width = innerWidth + "px";
                document.getElementById("lines").style.width = innerWidth + "px";
            } else {
                document.getElementById("innerworkarea").style.width = windowsWidth + "px";
                document.getElementById("lines").style.width = windowsWidth + "px";
            }
        },
        deleteLevel(index) {

            if (index < 0) {
                console.log("error : error arguements");
                return;
            }
            // 如果这个level是被选中状态，取消选中状态
            if (this.attrAreaNode != null && this.computer_flow[index].id == this.attrAreaNode.id) {
                this.attrAreaNode = null;
            }
            // 要先清理下一层的输入
            this.clearLevelInput(index + 1);
            this.computer_flow.splice(index, 1);
        },
        deleteLevelButton(event) {
            var loc = event.currentTarget.getAttribute("data-loc");
            // console.log(loc);
            //loc应该是一个以level_打头的字符串
            loc = parseInt(loc.split("_")[1]);
            this.deleteLevel(loc);
            setTimeout(line.drawAllLine, 1);
        },
        // 清理某一层的输入input，一般用于插入和删除的时候.
        clearLevelInput(index) {
            // 可能会超过层数，就不管了
            if (index < 0 || index >= computer_flow.length) {
                return;
            }

            for (var i = 0; i < this.computer_flow[index]["rule"].length; i++) {
                this.computer_flow[index]["rule"][i]["input"] = [];
            }
        },
        clearNodeInput(nodeType, level, index) {
            var id = this.computer_flow[level][nodeType][index]["id"];
            if (nodeType == "rule") {
                // 删除一个rule节点，这个时候意味着本层的variable需要清理
                for (var i = 0; i < this.computer_flow[level]["variable"].length; i++) {
                    inputs = this.computer_flow[level]["variable"][i]["input"];
                    for (var j = inputs.indexOf(id); j >= 0; j = inputs.indexOf(id)) {
                        inputs.splice(j, 1); // 删除这个输入
                    }
                }
            } else if (nodeType == "variable") {
                // 如果level是最后一层，就直接return
                if (level == this.computer_flow.length - 1) {
                    return;
                }
                // 否则，不是最后一层，要检测下一层里面的rule的输入
                for (var i = 0; i < this.computer_flow[level + 1]["rule"].length; i++) {
                    inputs = this.computer_flow[level + 1]["rule"][i]["input"];
                    for (var j = inputs.indexOf(id); j >= 0; j = inputs.indexOf(id)) {
                        inputs.splice(j, 1); // 删除这个输入
                    }
                }
            }
        },
        deleteNodeButton(event) {
            var loc = event.currentTarget.getAttribute("data-loc");
            locs = loc.split("_");
            nodeType = locs[0];
            level = parseInt(locs[1]);
            index = parseInt(locs[2]);
            //如果这个被删除的节点是属性栏中显示的那个，那么就要删除他
            var id = this.computer_flow[level][nodeType][index].id
            if (this.attrAreaNode != null && this.attrAreaNode.id == id) {
                this.attrAreaNode = null;
            }

            this.clearNodeInput(nodeType, level, index);
            this.computer_flow[level][nodeType].splice(index, 1);// 删除
            setTimeout(line.drawAllLine, 1);
        },
        // 根据id寻找node节点，返回这个节点。
        findNodeById(id) {
            var dom = document.getElementById(id);
            if (dom == undefined || dom == null) {
                return null;
            }
            var loc = dom.getAttribute("data-loc");
            locs = loc.split("_");
            nodeType = locs[0];
            level = parseInt(locs[1]);
            index = parseInt(locs[2]);
            return this.computer_flow[level][nodeType][index];
        },
        findNodeByDataloc(dataloc) {
            locs = dataloc.split("_");
            nodeType = locs[0];
            level = parseInt(locs[1]);
            index = parseInt(locs[2]);
            return this.computer_flow[level][nodeType][index];
        },
        findLevelByDataloc(dataloc) {
            locs = dataloc.split("_");
            level = parseInt(locs[1]);
            return this.computer_flow[level];
        },
        choosedNodeButton(event) {

            var loc = event.currentTarget.getAttribute("data-loc");
            var node = this.findNodeByDataloc(loc);
            this.attrAreaNode = node;
        },
        choosedLevelButton(event) {

            var loc = event.currentTarget.getAttribute("data-loc");
            var level = this.findLevelByDataloc(loc);
            this.attrAreaNode = level;
        },
        //根据line的id来寻找这个线，删掉并且把数据里的input删除
        deleteline(id) {
            var x = document.getElementById(id);
            x.parentNode.removeChild(x);  //删掉这个线
            // 清理这个输入
            var ids = id.split('_');
            var upNodeid = ids[0];
            var downNodeid = ids[1];
            var downNode = this.findNodeById(downNodeid);
            var inputs = downNode.input;

            for (var j = inputs.indexOf(upNodeid); j >= 0; j = inputs.indexOf(upNodeid)) {
                inputs.splice(j, 1); // 删除这个输入
            }
        },
        deletelineButton(event) {
            var loc = event.currentTarget.getAttribute("data-loc");
            this.deleteline(loc);
        },
        nodeRight(event) {
            //同时是选中和显示右键菜单
            this.showRM(event, 'noderm');
        },
        levelRight(event) {
            this.showRM(event, 'levelrm');
        },
        addLineButton(event) {
            this.isAddLine = ~this.isAddLine;
            this.addLineBuffer = [];
        },
        addlinefunction(event) {
            if (this.isAddLine == false) {
                return;
            }
            var loc1 = event.currentTarget.getAttribute("data-loc");
            if (this.addLineBuffer.length == 0) {
                this.addLineBuffer.push(loc1);
                return;
            } else {
                node1 = this.findNodeByDataloc(loc1);
                loc2 = this.addLineBuffer[0];
                node2 = this.findNodeByDataloc(loc2);
                level1 = parseInt(loc1.split("_")[1]);
                level2 = parseInt(loc2.split("_")[1]);
                nodeType1 = loc1.split("_")[0];
                nodeType2 = loc2.split("_")[0];
                // 要判断哪个在上面
                realLevel1 = level1 * 2 + (nodeType1 == "rule" ? 1 : 2);
                realLevel2 = level2 * 2 + (nodeType2 == "rule" ? 1 : 2);
                if ((realLevel1 - realLevel2) == 1) {
                    // 2节点在上面
                    node1.input.push(node2.id);
                    line.lineBetweenDiv(node2.id, node1.id);
                } else if ((realLevel1 - realLevel2) == -1) {
                    // 1节点在上面
                    node2.input.push(node1.id);
                    line.lineBetweenDiv(node1.id, node2.id);
                }
                this.addLineBuffer = [];
            }
        },
        addRuleToolButton(event) {
            if (this.attrAreaNode != null && this.attrAreaNode.id[0] == 'l') {
                level = this.computer_flow.indexOf(this.attrAreaNode)
                this.addRule(level, 999999999);
            }
        },
        addVariableToolButton(event) {
            if (this.attrAreaNode != null && this.attrAreaNode.id[0] == 'l') {
                level = this.computer_flow.indexOf(this.attrAreaNode)
                this.addVariable(level, 999999999);
            }
        },
        ruleBoxShow(event) {
            if (event.currentTarget.innerHTML == "↓") {
                event.currentTarget.innerHTML = "↑";
                // 收起来
                document.getElementById("ruleBox").style.display = "block";
                boxs = document.getElementsByClassName("ruleBoxRule");
                for (var i = 0; i < boxs.length; i++) {
                    boxs[i].style.display = "none";
                }
            } else {
                event.currentTarget.innerHTML = "↓";
                document.getElementById("ruleBox").style.display = "none";
            }
        },
        ruleBoxClassShow(event) {
            var childrens = event.currentTarget.parentNode.children;
            for (var i = 1; i < childrens.length; i++) {
                if (childrens[i].style.display == "block") {
                    childrens[i].style.display = "none";
                } else {
                    childrens[i].style.display = "block";
                }
            }
        },
        ruleBoxRuleChange(event) {
            var str = event.currentTarget.innerHTML;
            str = str.replace(/(^\s*)|(\s*$)/g, "");
            this.attrAreaNode.type = str;
        },
        // 按动一个
        dragABox(event, type) {
            if (event.button != 0) {
                return;
            }
            // 第一步，显示出来一个box
            var box = document.getElementById("dragBox");
            box.style.display = "block";
            if (type == "rule") {
                this.isDragAddNode = "rule";
                box.style.borderRadius = '10%';
            } else if (type == "variable") {
                this.isDragAddNode = "variable";
                box.style.borderRadius = '60%';
            }

            var x = event.clientX;
            var y = event.clientY;
            box.style.left = x + "px";
            box.style.top = y + "px";
            document.onmousemove = function (event) {
                if (event.button != 0) {
                    return;
                }
                var x = event.clientX;
                var y = event.clientY;
                box.style.left = x + "px";
                box.style.top = y + "px";
            };
            document.onmouseup = function (event) {
                if (event.button != 0) {
                    return;
                }
                document.onmousemove = null;
                document.onmouseup = null;
                box.style.display = "none";
                workarea.isDragAddNode = "";
                var line = document.getElementById("aLineBetweenNode")
                line.style.display="none";
            };

        },
        dragMouseUp(event) {
            if (event.button != 0) {
                return;
            }

            let loc = event.currentTarget.getAttribute("data-loc");
            let level = parseInt(loc.split("_")[1]);
            let type = loc.split("_")[0];
            if (type != this.isDragAddNode) {
                return; // 大部分的时候，会在这里直接返回掉，不用管
            }
            let num = this.computer_flow[level][type].length; // 这一层节点的数量
            let width = event.currentTarget.scrollWidth; // 这一层的宽度
            let space = width / num;
            // 获取相对的位置
            let dom = document.getElementById("workarea");
            let point = event.clientX-dom.offsetLeft+dom.scrollLeft-102;

            let index = parseInt((point + space / 2) / space); //计算位置
            if (type == "rule") {
                this.addRule(level, index);
            } else if (type == "variable") {
                this.addVariable(level, index);
            }

        },
        //在两个node之间显示一个小小的线条来表示将要添加的位置
        onMouseMove(event) {
            let loc = event.currentTarget.getAttribute("data-loc");
            let level = parseInt(loc.split("_")[1]);
            let type = loc.split("_")[0];
            if (type != this.isDragAddNode) {
                return; // 大部分的时候，会在这里直接返回掉，不用管
            }
            let num = this.computer_flow[level][type].length; // 这一层节点的数量
            let width = event.currentTarget.scrollWidth; // 这一层的宽度
            let space = width / num;
            // 获取相对的位置
            let dom = document.getElementById("workarea");
            let point = event.clientX-dom.offsetLeft+dom.scrollLeft-102;

            let index = parseInt((point + space / 2) / space); //计算位置
            if (index != 0 && index != num) {
                let div1Id = this.computer_flow[level][type][index - 1]["id"];
                let div2Id = this.computer_flow[level][type][index]["id"];
                this.moveBoxBetweenDiv(div1Id, div2Id,type);
            }
            if(index==0){
                let div1Id = this.computer_flow[level][type][index]["id"];
                this.moveBoxLeft(div1Id,type)
            }
            if(index==num){
                let div1Id = this.computer_flow[level][type][index-1]["id"];
                this.moveBoxRight(div1Id,type)
            }

        },
        moveBoxBetweenDiv(d1, d2 ,type) {
            var div1 = document.getElementById(d1);
            var div2 = document.getElementById(d2);

            var y1 = div1.offsetTop;
            var x1 = div1.offsetLeft;
            var y2 = div2.offsetTop;
            var x2 = div2.offsetLeft;

            var width1 = div1.offsetWidth;
            var height1 = div1.offsetHeight;
            var width2 = div2.offsetWidth;
            var height2 = div2.offsetHeight;

            var box = document.getElementById("aLineBetweenNode");
            // 那个东西的宽度,取决于还有多少剩余空间，如果大于130，可以赛一个，小于的画，同步缩小
            if((x2-x1-width1)>=130){
                boxwidth = 100;
            }else{
                boxwidth=100*(x2-x1-width1)/130;
            }
            if (type == "rule") {
                box.style.borderRadius = '10%';
            } else if (type == "variable") {
                box.style.borderRadius = '60%';
            }
            box.style.width=boxwidth+"px";
            box.style.display="block";
            box.style.left=(x1+width1+x2)/2-boxwidth/2+"px";
            box.style.top=y1+"px";
        },
        moveBoxLeft(d1,type){
            var div1 = document.getElementById(d1);
            var y1 = div1.offsetTop;
            var x1 = div1.offsetLeft;
            var width1 = div1.offsetWidth;
            var height1 = div1.offsetHeight;

            var width = document.getElementById("innerworkarea").offsetWidth;
            var box = document.getElementById("aLineBetweenNode");
            // 那个东西的宽度,取决于还有多少剩余空间，如果大于130，可以赛一个，小于的画，同步缩小
            if((x1-107)>=130){
                boxwidth = 100;
            }else{
                boxwidth=100*(x1-107)/130;
            }
            if (type == "rule") {
                box.style.borderRadius = '10%';
            } else if (type == "variable") {
                box.style.borderRadius = '60%';
            }
            box.style.width=boxwidth+"px";
            box.style.display="block";
            box.style.left="107px";
            box.style.top=y1+"px";
        },
        moveBoxRight(d1,type){
            var div1 = document.getElementById(d1);
            var y1 = div1.offsetTop;
            var x1 = div1.offsetLeft;
            var width1 = div1.offsetWidth;
            var height1 = div1.offsetHeight;

            var width = document.getElementById("innerworkarea").offsetWidth;
            box = document.getElementById("aLineBetweenNode");
            // 那个东西的宽度,取决于还有多少剩余空间，如果大于130，可以赛一个，小于的画，同步缩小
            if((width-5-x1-width1)>=130){
                boxwidth = 100;
            }else{
                boxwidth=100*(width-5-x1-width1)/130;
            }
            if (type == "rule") {
                box.style.borderRadius = '10%';
            } else if (type == "variable") {
                box.style.borderRadius = '60%';
            }
            box.style.width=boxwidth+"px";
            box.style.display="block";
            box.style.left= width-5-boxwidth +"px";
            box.style.top=y1+"px";
        },
        // 修改两个node节点之间的位置，把某个node节点插入到某个位置,index
        moveDiv(level,type,indexOld,indexNew){
            console.log(level+" "+type+" "+indexOld+" "+indexNew);
            if((indexNew-indexOld)==1||(indexNew-indexOld)==0){
                return;
            }
            // 先算算删除了old之后，new的位置
            if(indexNew>indexOld){
                indexNew--;
            }
            var node = this.computer_flow[level][type][indexOld];
            this.computer_flow[level][type].splice(indexOld, 1);
            this.computer_flow[level][type].splice(indexNew, 0, node);
            setTimeout(line.drawAllLine, 100);

        },
        // 要移动某个节点，只能在当前层移动，下面三个函数对应点击，移动和松开
        moveDivMouseDown(event){
            if (event.button != 0) {
                return;
            }
            // 第一步，显示出来一个box
            var box = document.getElementById("dragBox");
            box.style.display = "block";
            let oldDateloc = event.currentTarget.getAttribute("data-loc");
            let type = oldDateloc.split("_")[0];
            if (type == "rule") {
                this.isMoveNode = oldDateloc;
                box.style.borderRadius = '10%';
            } else if (type == "variable") {
                this.isMoveNode = oldDateloc;
                box.style.borderRadius = '60%';
            }

            var x = event.clientX;
            var y = event.clientY;
            box.style.left = x + "px";
            box.style.top = y + "px";
            document.onmousemove = function (event) {
                if (event.button != 0) {
                    return;
                }
                var x = event.clientX;
                var y = event.clientY;
                box.style.left = x + "px";
                box.style.top = y + "px";
            };
            document.onmouseup = function (event) {
                if (event.button != 0) {
                    return;
                }
                document.onmousemove = null;
                document.onmouseup = null;
                box.style.display = "none";
                workarea.isMoveNode = "";
                var line = document.getElementById("aLineBetweenNode")
                line.style.display="none";
            };
        },
        moveDivMouseUp(event) {
            if (event.button != 0) {
                return;
            }

            let loc = event.currentTarget.getAttribute("data-loc");
            let level = parseInt(loc.split("_")[1]);
            let type = loc.split("_")[0];

            let oldlevel = parseInt(this.isMoveNode.split("_")[1]);
            let oldtype = this.isMoveNode.split("_")[0];
            let oldindex = this.isMoveNode.split("_")[2];
            if (type != oldtype||level!=oldlevel) {
                return; // 大部分的时候，会在这里直接返回掉，不用管
            }
            let num = this.computer_flow[level][type].length; // 这一层节点的数量
            let width = event.currentTarget.scrollWidth; // 这一层的宽度
            let space = width / num;
            // 获取相对的位置
            let dom = document.getElementById("workarea");
            let point = event.clientX-dom.offsetLeft+dom.scrollLeft-102;

            let index = parseInt((point + space / 2) / space); //计算位置
            this.moveDiv(level,type,oldindex,index);

        },
        //在两个node之间显示一个小小的线条来表示将要添加的位置
        moveDivMouseMove(event) {
            let loc = event.currentTarget.getAttribute("data-loc");
            let level = parseInt(loc.split("_")[1]);
            let type = loc.split("_")[0];

            let oldlevel = parseInt(this.isMoveNode.split("_")[1]);
            let oldtype = this.isMoveNode.split("_")[0];
            if (type != oldtype||level!=oldlevel) {
                return; // 大部分的时候，会在这里直接返回掉，不用管
            }
            let num = this.computer_flow[level][type].length; // 这一层节点的数量
            let width = event.currentTarget.scrollWidth; // 这一层的宽度
            let space = width / num;
            // 获取相对的位置
            let dom = document.getElementById("workarea");
            let point = event.clientX-dom.offsetLeft+dom.scrollLeft-102;

            let index = parseInt((point + space / 2) / space); //计算位置
            if (index != 0 && index != num) {
                let div1Id = this.computer_flow[level][type][index - 1]["id"];
                let div2Id = this.computer_flow[level][type][index]["id"];
                this.moveBoxBetweenDiv(div1Id, div2Id,type);
            }
            if(index==0){
                let div1Id = this.computer_flow[level][type][index]["id"];
                this.moveBoxLeft(div1Id,type)
            }
            if(index==num){
                let div1Id = this.computer_flow[level][type][index-1]["id"];
                this.moveBoxRight(div1Id,type)
            }

        },

        

    },
    "computed": {
        attrIsShow: function () {
            if (this.attrAreaNode != null && this.attrAreaNode.id[0] == "r") {
                return "rule";
            } else if (this.attrAreaNode != null && this.attrAreaNode.id[0] == "v") {
                return "variable";
            } else if (this.attrAreaNode != null && this.attrAreaNode.id[0] == "l") {
                return "level";
            } else {
                return "";
            }
        }
    }



});


// 和绘制线条有关的公共函数库
line = {
    //根据坐标绘制一条叫做id的线
    line: function (x1, y1, x2, y2, id) {
        var main = document.getElementById("lines");
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line", true);
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:3;cursor:pointer");
        line.setAttribute("id", id);
        line.setAttribute("data-loc", id); // 方便后面使用
        line.addEventListener("contextmenu", function (e) {
            e.stopPropagation();
            workarea.clear1();
            workarea.clear2();
            workarea.showRM(e, "linesrm");
        });

        // 添加鼠标放上去变化的属性,改变颜色，代表选中
        line.addEventListener('mouseover', function (e) {
            e.currentTarget.style.setProperty("stroke", "rgb(255,0,0"); //设置改颜色
        })
        line.addEventListener('mouseout', function (e) {
            e.currentTarget.style.setProperty("stroke", "rgb(0,0,0"); //设置改颜色
        })
        main.appendChild(line);
    },
    moveline: function (x1, y1, x2, y2, id) {
        var line = document.getElementById(id);
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
    },
    // 根据两个div的id画出线
    lineBetweenDiv: function (d1, d2) {

        var div1 = document.getElementById(d1);
        var div2 = document.getElementById(d2);

        var y1 = div1.offsetTop;
        var x1 = div1.offsetLeft;
        var y2 = div2.offsetTop;
        var x2 = div2.offsetLeft;

        var width1 = div1.offsetWidth;
        var height1 = div1.offsetHeight;
        var width2 = div2.offsetWidth;
        var height2 = div2.offsetHeight;
        line.line(x1 + width1 / 2, y1 + height1, x2 + width2 / 2, y2, d1 + "_" + d2);
    },
    drawAllLine: function () {
        workarea.resize();
        var main = document.getElementById("lines");
        main.innerHTML = ""; // 删除内部所有的线条，重现开始画。
        for (let alevel of computer_flow) {
            for (let arule of alevel["rule"]) {
                for (let ainput of arule["input"]) {
                    line.lineBetweenDiv(ainput, arule.id);
                }
            }
            for (let avariable of alevel["variable"]) {
                for (let ainput of avariable["input"]) {
                    line.lineBetweenDiv(ainput, avariable.id);
                }
            }

        }
    }

}

$(window).resize(line.drawAllLine);
line.drawAllLine();


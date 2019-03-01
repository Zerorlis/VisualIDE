// // rule的格式
// var rule = {
//     "id": "rule1", // 内部的id，同时也是div的id，要求全局唯一，格式，rule+唯一后缀.同时，通过id可以快速得到这个东西的位置
//     "name":"r_o_1", // 规则的名字
//     "type":"input", // 规则的类型
//     "parameter":"",// 常量表
//     "description":"一个输入的规则",// 一个描述
//     "input":[], //上一层由哪些输入
// }

//variables的格式
// var variable = {
//     "id":"variable2",// 内部的唯一id，
//     "name":"score",// 变量的名字
//     "value":1, // 变量显示的值
//     "description":"一个输入的变量", // 一个描述
//     "input":[], //上一层由哪些输入,暂时考虑线条的关系维护放到这里。不另外设计表格了。
// }

// var level = {
//     "id":"level123",//全局唯一，同过div可以找到位置data-loc
//     "rule":[],
//     "variable":[],
//     "description":"一层的描述",//一层的描述
//     "control":"true", // 循环控制符
//     "controlto":"",// 存着跳转到那一层的层数
// } 

// var levels = [] // 多个层次。


testflow = {
    "name": "flow",
    "flow": [
        {
            "id": "level0", // 保持全局唯一即可，
            "description": "",
            "control": "true",
            "controlto": "",
            "rule": [],
            "variable": [],
        },
    ]
}
var getRandomID = (function () {
    var ID = 1;
    return function (type) {
        return type + (ID++);
    }
})();
commonFunction = {
    //获取一个独一无二的名字，格式是type和一个数字后缀组成。这个名字用于作为vue的key
    getRandomID: getRandomID,
    //创建一个rule对象
    createRule: function (name, type, parameter, description, input) {
        name = name || getRandomID("NewRule");
        type = type || "input";
        parameter = parameter || "";
        description = description || "";
        input = input || [];
        return {
            "id": getRandomID("rule"),
            "name": name,
            "type": type,
            "parameter": parameter,
            "description": description,
            "input": input,
        }
    },
    //创建一个value对象
    createVariable: function (name, description, input) {
        name = name || getRandomID("NewValue");
        description = description || "";
        input = input || [];
        return {
            "id": getRandomID("value"),
            "name": name,
            "value": 0,
            "description": description,
            "input": input,
        }
    },
    // 创建一个空白层
    createLevel: function () {
        return {
            "id": getRandomID("level"),
            "rule": [],
            "variable": [],
            "description": "",
            "control": "true",
            "controlto": "",
        }
    },
    createCompute_flow: function (name) {
        return {
            "name": name,
            "flow": [],
        }
    },
    getLocFromDom: function (dom) {
        if (dom) {
            var loc = div.getAttribute("data-loc")
            if (loc) {
                var type = loc.split("_")[0];
                var level = parseInt(loc.split("_")[1]);
                var index = -1;
                if (type != "level") {
                    index = parseInt(loc.split("_")[2])
                }
                return ({
                    "type": type,
                    "level": level,
                    "index": index,
                })
            } else {
                return null;
            }
        } else {
            return null;
        }
    },
    getLocFromID: function (id) {
        return this.getLocFromDom(document.getElementById(id));
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
        "computer_flow": testflow["flow"],
        "attrAreaNode": null, // 现在属性栏目显示的node节点
        "isAddLine": false,
        "addLineBuffer": [], // 存着添加线的buff
        "rules": rules,
        "isDragAddNode": "",
        "isMoveNode": "",
        "name": testflow["name"],

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
                if (this.computer_flow[i]["rule"].length > maxNum) {
                    maxNum = this.computer_flow[i]["rule"].length;
                }
                if (this.computer_flow[i]["variable"].length > maxNum) {
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
            if (index < 0 || index >= this.computer_flow.length) {
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
                line.style.display = "none";
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
            // 如果当前无节点，直接加
            if (type == "rule") {
                this.addRule(level, 9999999999);
                return;
            } else if (type == "variable") {
                this.addVariable(level, 99999999999);
                return;
            }
            // 否则要算算加在哪个位置
            let num = this.computer_flow[level][type].length; // 这一层节点的数量
            let width = event.currentTarget.scrollWidth; // 这一层的宽度
            let space = width / num;
            // 获取相对的位置
            let dom = document.getElementById("workarea");
            let point = event.clientX - dom.offsetLeft + dom.scrollLeft - 102;

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
            //当节点是0的时候
            if (num == 0) {
                var line = document.getElementById("aLineBetweenNode")
                line.style.display = "none";
                return;
            }
            let width = event.currentTarget.scrollWidth; // 这一层的宽度
            let space = width / num;
            // 获取相对的位置
            let dom = document.getElementById("workarea");
            let point = event.clientX - dom.offsetLeft + dom.scrollLeft - 102;

            let index = parseInt((point + space / 2) / space); //计算位置
            if (index != 0 && index != num) {
                let div1Id = this.computer_flow[level][type][index - 1]["id"];
                let div2Id = this.computer_flow[level][type][index]["id"];
                this.moveBoxBetweenDiv(div1Id, div2Id, type);
            }
            if (index == 0) {
                let div1Id = this.computer_flow[level][type][index]["id"];
                this.moveBoxLeft(div1Id, type)
            }
            if (index == num) {
                let div1Id = this.computer_flow[level][type][index - 1]["id"];
                this.moveBoxRight(div1Id, type)
            }

        },
        moveBoxBetweenDiv(d1, d2, type) {
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
            if ((x2 - x1 - width1) >= 130) {
                boxwidth = 100;
            } else {
                boxwidth = 100 * (x2 - x1 - width1) / 130;
            }
            if (type == "rule") {
                box.style.borderRadius = '10%';
            } else if (type == "variable") {
                box.style.borderRadius = '60%';
            }
            box.style.width = boxwidth + "px";
            box.style.display = "block";
            box.style.left = (x1 + width1 + x2) / 2 - boxwidth / 2 + "px";
            box.style.top = y1 + "px";
        },
        moveBoxLeft(d1, type) {
            var div1 = document.getElementById(d1);
            var y1 = div1.offsetTop;
            var x1 = div1.offsetLeft;
            var width1 = div1.offsetWidth;
            var height1 = div1.offsetHeight;

            var width = document.getElementById("innerworkarea").offsetWidth;
            var box = document.getElementById("aLineBetweenNode");
            // 那个东西的宽度,取决于还有多少剩余空间，如果大于130，可以赛一个，小于的画，同步缩小
            if ((x1 - 107) >= 130) {
                boxwidth = 100;
            } else {
                boxwidth = 100 * (x1 - 107) / 130;
            }
            if (type == "rule") {
                box.style.borderRadius = '10%';
            } else if (type == "variable") {
                box.style.borderRadius = '60%';
            }
            box.style.width = boxwidth + "px";
            box.style.display = "block";
            box.style.left = "107px";
            box.style.top = y1 + "px";
        },
        moveBoxRight(d1, type) {
            var div1 = document.getElementById(d1);
            var y1 = div1.offsetTop;
            var x1 = div1.offsetLeft;
            var width1 = div1.offsetWidth;
            var height1 = div1.offsetHeight;

            var width = document.getElementById("innerworkarea").offsetWidth;
            box = document.getElementById("aLineBetweenNode");
            // 那个东西的宽度,取决于还有多少剩余空间，如果大于130，可以赛一个，小于的画，同步缩小
            if ((width - 5 - x1 - width1) >= 130) {
                boxwidth = 100;
            } else {
                boxwidth = 100 * (width - 5 - x1 - width1) / 130;
            }
            if (type == "rule") {
                box.style.borderRadius = '10%';
            } else if (type == "variable") {
                box.style.borderRadius = '60%';
            }
            box.style.width = boxwidth + "px";
            box.style.display = "block";
            box.style.left = width - 5 - boxwidth + "px";
            box.style.top = y1 + "px";
        },
        // 修改两个node节点之间的位置，把某个node节点插入到某个位置,index
        moveDiv(level, type, indexOld, indexNew) {
            if ((indexNew - indexOld) == 1 || (indexNew - indexOld) == 0) {
                return;
            }
            // 先算算删除了old之后，new的位置
            if (indexNew > indexOld) {
                indexNew--;
            }
            var node = this.computer_flow[level][type][indexOld];
            this.computer_flow[level][type].splice(indexOld, 1);
            this.computer_flow[level][type].splice(indexNew, 0, node);
            setTimeout(line.drawAllLine, 100);

        },
        // 要移动某个节点，只能在当前层移动，下面三个函数对应点击，移动和松开
        moveDivMouseDown(event) {
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
                line.style.display = "none";
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
            if (type != oldtype || level != oldlevel) {
                return; // 大部分的时候，会在这里直接返回掉，不用管
            }
            let num = this.computer_flow[level][type].length; // 这一层节点的数量
            let width = event.currentTarget.scrollWidth; // 这一层的宽度
            let space = width / num;
            // 获取相对的位置
            let dom = document.getElementById("workarea");
            let point = event.clientX - dom.offsetLeft + dom.scrollLeft - 102;

            let index = parseInt((point + space / 2) / space); //计算位置
            this.moveDiv(level, type, oldindex, index);

        },
        //在两个node之间显示一个小小的线条来表示将要添加的位置
        moveDivMouseMove(event) {
            let loc = event.currentTarget.getAttribute("data-loc");
            let level = parseInt(loc.split("_")[1]);
            let type = loc.split("_")[0];

            let oldlevel = parseInt(this.isMoveNode.split("_")[1]);
            let oldtype = this.isMoveNode.split("_")[0];
            if (type != oldtype || level != oldlevel) {
                return; // 大部分的时候，会在这里直接返回掉，不用管
            }
            let num = this.computer_flow[level][type].length; // 这一层节点的数量
            let width = event.currentTarget.scrollWidth; // 这一层的宽度
            let space = width / num;
            // 获取相对的位置
            let dom = document.getElementById("workarea");
            let point = event.clientX - dom.offsetLeft + dom.scrollLeft - 102;

            let index = parseInt((point + space / 2) / space); //计算位置
            if (index != 0 && index != num) {
                let div1Id = this.computer_flow[level][type][index - 1]["id"];
                let div2Id = this.computer_flow[level][type][index]["id"];
                this.moveBoxBetweenDiv(div1Id, div2Id, type);
            }
            if (index == 0) {
                let div1Id = this.computer_flow[level][type][index]["id"];
                this.moveBoxLeft(div1Id, type)
            }
            if (index == num) {
                let div1Id = this.computer_flow[level][type][index - 1]["id"];
                this.moveBoxRight(div1Id, type)
            }

        },
        jsReadFiles() {
            var files = document.getElementById('readFile').files;
            if (files.length) {
                var file = files[0];
                var reader = new FileReader();//new一个FileReader实例
                // var name = selectedFile.name;//读取选中文件的文件名
                // var size = selectedFile.size;//读取选中文件的大小
                reader.onload = function () {
                    console.log(this.result);
                    let flows = toCompute_flow(this.result);
                    console.log(flows);
                    if (flows) {
                        workarea.computer_flow = flows[0]["flow"];
                        workarea.name = flows[0]["name"];
                        setTimeout(line.drawAllLine, 1);
                    }

                }
                reader.readAsText(file);
            }
        },
        download(filename, text) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        },
        save() {
            let fileContent = toCfiFile(workarea.computer_flow, workarea.name);

            this.download(workarea.name + ".cfi", fileContent);
        }

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
        for (let alevel of workarea.computer_flow) {
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


line.drawAllLine();
$(window).resize(line.drawAllLine);

var regWord = /^[a-zA-Z_]\w*$/ // 变量的命名规范
var regNum = /^\d+(\.\d+)?$/ // 数字或者小数的命名规范
var regString = /(^".*"$)|(^'.*'$)/ //String的格式规范
var regRuleType = /(^>=$)|(^<=$)|(^=$)|(^>$)|(^<$)|(^[a-zA-Z_]\w*$)/
var regParameters_noWord = /^(((?:"[^"]*?")|(?:'[^']*?')|(?:\d+(?:\.\d+)?))(?:,((?:"[^"]*?")|(?:'[^']*?')|(?:\d+(?:\.\d+)?)))*)?$/ // parameter参数的格式
var regParameters = /^(((?:"[^"]*?")|(?:'[^']*?')|(?:\d+(?:\.\d+)?)|(?:[a-zA-Z_]\w*))(?:,((?:"[^"]*?")|(?:'[^']*?')|(?:\d+(?:\.\d+)?)|(?:[a-zA-Z_]\w*)))*)?$/ // parameter在文件中的格式
// 返回一个数组，数组里面是一个个computer_flow对象,computer_flow对象由flow和name两个属性，flow是数据流图的结构
function toCompute_flow(flow) {
    // 变量的格式，必须以字母，数字，下划线组成，而且以字母开头的，所以要验证各种格式
    let str = flow.replace(/\s+/g, ""); // 去空格  
    str = str.replace(/\'/g, "\\'");// 转义字符，引号变化
    str = str.replace(/\"/g, "\\\"") // 转义字符
    str = str.replace(/([^:;{}]+)/g, "\"$1\""); //用冒号封号括号来分割，之间的一定是字符串,两边加上""
    // 处理: : ;的问题，:后面一定是个;，里面多了俩”
    str = str.replace(/"([^:;{}]+)":"([^:;{}]+)":"([^:;{}]+)";/g, "\"$1\":\"$2:$3\";");
    str = str.replace(/{/g, ":{"); //左括号全部变成:{
    str = str.replace(/}/g, "},"); // 右括号加上变成},
    str = str.replace(/;/g, ","); // ;全部变成，
    str = "{" + str + "}";// 两边加上}
    str = str.replace(/,}/g, "}"); // 如果是最后一个}前的属性，要去掉一个，这个，不需要

    //经过处理，已经是正确的json

    //接下来就是开始构建computer_flow,注意空格已经全部去掉,线转化为标准json
    let flowJS;
    try {
        flowJS = JSON.parse(str);
    } catch (e) {
        console.log("error to json");
        return;
    }

    compute_flows = []
    for (let aflowIndex in flowJS) {
        aflow = flowJS[aflowIndex];
        let name = aflowIndex.substring(12);
        compute_flow = commonFunction.createCompute_flow(name)
        compute_flows.push(compute_flow);
        for (let alevelIndex in aflow) {
            alevel = aflow[alevelIndex];
            levelNew = commonFunction.createLevel();
            compute_flow["flow"].push(levelNew); //level添加进去
            // 处理control
            if (alevel["control"] == undefined) {
                //  检查规范性能，错误处理
                console.log("error in " + alevelIndex + ":can't find control");
                return;
            } else if (alevel["control"] == "true") {
                levelNew.control = "true";
            } else if (/^(>|<|=|>=|<=)\([a-zA-Z_]\w*(,[a-zA-Z_]\w*)+\):\d+$/.test(alevel["control"])) { //跳转属性，需要用:做分割
                levelNew.control = alevel.control.split(":")[0];
                levelNew.controlto = alevel.control.split(":")[1]; // 先暂时用字符串，后期修正一下
            } else {
                console.log("error in " + alevelIndex + ":error control");
                return;
            }
            // 处理rule
            for (let aruleIndex in alevel["rules"]) {
                let arule = alevel["rules"][aruleIndex];
                let name = aruleIndex;
                //检测name合不合法,检测arule里面是不是有()
                if (!regWord.test(name)) {
                    console.log("error in " + alevelIndex + ":rules name error");
                    return;
                }
                if (!/^[^(),]+\(([^(),]+(,[^(),]+)*)?\)$/.test(arule)) {
                    console.log("error in " + alevelIndex + ":rules error");
                    return;
                }
                // arule 的格式 input(a,b),括号里面是也有可能是一些常量,常量注意放到parameter里面
                let aruleSplit = arule.split(/[(),]/);
                let type = aruleSplit[0];
                if (!(regWord.test(type) || /^(>|<|=|>=|<=)/.test(type))) {
                    console.log("error in " + alevelIndex + ":rule type is error");
                    return;
                }
                let ruleNew = commonFunction.createRule(name, type);
                for (let i = 1; i < aruleSplit.length; i++) {
                    if (aruleSplit[i] != "") { // 过滤.一些不必要的东西
                        if (regWord.test(aruleSplit[i]) || regNum.test(aruleSplit[i]) || regString.test(aruleSplit[i])) {
                            ruleNew.input.push(aruleSplit[i]);
                        } else {
                            console.log("error in " + alevelIndex + ":rule parameter is error");
                            return;
                        }
                    }
                }
                levelNew.rule.push(ruleNew);
            }
            for (let avariableIndex in alevel["variables"]) {
                let avariable = alevel["variables"][avariableIndex];
                let name = avariableIndex;
                if (!regWord.test(name)) {
                    console.log("error in " + alevelIndex + ":variable name is error");
                    return;
                }
                let variableNew = commonFunction.createVariable(name);
                // 验证下是不是r_1_1?r_1_2:r_1_3这样的格式，如果不是这样的格式，需要幻化为三个输入

                if (regWord.test(avariable)) {
                    variableNew.input.push(avariable);
                } else if (/^[^\?:]+\?[^\?:]+:[^\?:]+$/.test(avariable)) {
                    let avariableSplit = avariable.split(/[:\?]/);
                    if (avariableSplit.length != 3) {
                        console.log("error in " + alevelIndex + ":variable ifInput  error");
                        return;
                    }
                    for (let i = 0; i < avariableSplit.length; i++) {
                        if (regWord.test(avariableSplit[i])) {
                            variableNew.input.push(avariableSplit[i]);
                        } else {
                            console.log("error in " + alevelIndex + ":variable ifInput  error");
                            return;
                        }
                    }
                } else {
                    console.log("error in " + alevelIndex + ":variable input error");
                    return;
                }
                levelNew.variable.push(variableNew);
            }
        }
        // 此时，所有的level构建完成，然后可以开始搞层间关系,毕竟现在的input还只是以字符串的形式存进来的
        for (let alevelIndex = 0; alevelIndex < compute_flow["flow"].length; alevelIndex++) {
            // 处理rule，从上一层的variable里面找对应的对象
            if (alevelIndex == 0) {
                // 第一层的rule的index里面的输入直接丢要参数一栏里面。    
                let ruleLevel = compute_flow["flow"][alevelIndex]["rule"]
                for (let aruleIndex = 0; aruleIndex < ruleLevel.length; aruleIndex++) {
                    oldInput = ruleLevel[aruleIndex].input;
                    ruleLevel[aruleIndex].input = [];
                    for (let i = 0; i < oldInput.length; i++) {
                        if (ruleLevel[aruleIndex].parameter == "") {
                            ruleLevel[aruleIndex].parameter += oldInput[i];
                        } else {
                            ruleLevel[aruleIndex].parameter += ",";
                            ruleLevel[aruleIndex].parameter += oldInput[i];
                        }
                    }
                }
            }
            if (alevelIndex > 0) {
                // 第一步，先从上一层把所有的variable里面拿东西，变成一个数组
                let lastVariableNames = []
                let lastVariableLevel = compute_flow["flow"][alevelIndex - 1]["variable"]
                for (let avariableIndex = 0; avariableIndex < lastVariableLevel.length; avariableIndex++) {
                    lastVariableNames.push(lastVariableLevel[avariableIndex].name);
                }
                let ruleLevel = compute_flow["flow"][alevelIndex]["rule"];
                for (let aruleIndex = 0; aruleIndex < ruleLevel.length; aruleIndex++) {
                    // 得到了一个rule，开始处理input
                    oldInput = ruleLevel[aruleIndex].input;
                    ruleLevel[aruleIndex].input = [];
                    for (let inputIndex = 0; inputIndex < oldInput.length; inputIndex++) {
                        let input = oldInput[inputIndex]
                        if (regWord.test(input)) {
                            // input是个变量
                            let lastIndex = lastVariableNames.indexOf(input);
                            // rule的input在上一层里面有很多的类型，要做好判断
                            if (lastIndex < 0) {
                                console.log("error in level " + alevelIndex + ": error rule input " + input);
                                return;
                            } else {
                                ruleLevel[aruleIndex].input.push(lastVariableLevel[lastIndex].id)
                            }
                        } else if (regString.test(input)) {
                            // input是个是个字符串，字符串由冒号隔开
                            if (ruleLevel[aruleIndex].parameter == "") {
                                ruleLevel[aruleIndex].parameter += input;
                            } else {
                                ruleLevel[aruleIndex].parameter += ",";
                                ruleLevel[aruleIndex].parameter += input;
                            }
                        } else if (regNum.test(input)) {
                            // 是个数字
                            if (ruleLevel[aruleIndex].parameter == "") {
                                ruleLevel[aruleIndex].parameter += input;
                            } else {
                                ruleLevel[aruleIndex].parameter += ",";
                                ruleLevel[aruleIndex].parameter += input;
                            }
                        } else {
                            console.log("error in level " + alevelIndex + ": error rule parameter " + input);
                            return;
                        }

                    }
                }
            }
            {
                // rule处理完成了，处理variable，直接本层里面挑选就行了


                // 第一步，先处理上一层的rule，找到对应的输入
                let lastRuleNames = []
                let lastRuleLevel = compute_flow["flow"][alevelIndex]["rule"];
                for (let aruleIndex = 0; aruleIndex < lastRuleLevel.length; aruleIndex++) {
                    lastRuleNames.push(lastRuleLevel[aruleIndex].name);
                }

                let variableLevel = compute_flow["flow"][alevelIndex]["variable"];

                for (let avariableIndex = 0; avariableIndex < variableLevel.length; avariableIndex++) {
                    // 得到了一个variable，开始处理input
                    oldInput = variableLevel[avariableIndex].input;
                    variableLevel[avariableIndex].input = [];

                    for (let inputIndex = 0; inputIndex < oldInput.length; inputIndex++) {
                        let input = oldInput[inputIndex]
                        if (regWord.test(input)) {
                            // input一定是个rule的名字，复合命名规范
                            let lastIndex = lastRuleNames.indexOf(input);
                            if (lastIndex < 0) {
                                console.log("error in level " + alevelIndex + ": error variable input " + input);
                                return;
                            } else {
                                variableLevel[avariableIndex].input.push(lastRuleLevel[lastIndex].id)
                            }
                        } else {
                            console.log("error in level " + alevelIndex + ": error rule parameter " + input);
                            return;
                        }

                    }
                }

            }
        }
    }
    return (compute_flows);
}

function toCfiFile(flow, flowName) {
    // 处理一层里面的ruleLevel，返回rules的字符串
    function processRuleLevel(ruleLevel, levelIndex, lastVariableLevel) {
        ruleString = "        rules{\nxxxxx        }\n";
        for (let ruleIndex = 0; ruleIndex < ruleLevel.length; ruleIndex++) {
            let rule = ruleLevel[ruleIndex];// 拿到一个rule对象
            //rule对象变身字符串，注意对rule对象的所有内容的一个变量合法性进行检测
            if (!regWord.test(rule.name)) {
                console.log("error in level " + levelIndex + ":rule \"" + rule.name + "\" is illegal")
                return;
            }
            if (!regRuleType.test(rule.type)) {
                console.log("error in level " + levelIndex + ":rule \"" + rule.name + "\" type is illegal")
                return;
            }
            if (levelIndex != 0) {
                if (!regParameters_noWord.test(rule.parameter)) {
                    console.log("error in level" + levelIndex + ":rule \"" + rule.name + "\" parameter is illegal")
                    return;
                }
            } else {
                if (!regParameters.test(rule.parameter)) {
                    console.log("error in level" + levelIndex + ":rule \"" + rule.name + "\" parameter is illegal")
                    return;
                }
            }

            // 处理input，input里面存着一群id，需要找到上一层的rule里面对应的名字
            let idList = [];
            let nameList = [];
            let parameter = "";
            if (levelIndex != 0) {
                for (let avariableIndex = 0; avariableIndex < lastVariableLevel.length; avariableIndex++) {
                    idList.push(lastVariableLevel[avariableIndex].id);
                    nameList.push(lastVariableLevel[avariableIndex].name);
                }
                for (let inputIndex = 0; inputIndex < rule.input.length; inputIndex++) {
                    let i = idList.indexOf(rule.input[inputIndex]);
                    if (i >= 0) {
                        // 输入的id有效，转化为名字
                        if (parameter == "") {
                            parameter += nameList[i];
                        } else {
                            parameter = parameter + "," + nameList[i];
                        }
                    } else {
                        console.log("error in level" + levelIndex + ":rule \"" + rule.name + "\" input has some wrong")
                        return;
                    }
                }
            }
            if (rule.parameter != "" && parameter == "") {
                parameter += rule.parameter;
            } else if (rule.parameter != "" && parameter != "") {
                parameter = parameter + ", " + rule.parameter;
            }
            let arulestr = "            " + rule.name + ": " + rule.type + "(" + parameter + ");\nxxxxx";
            ruleString = ruleString.replace("xxxxx", arulestr);
        }
        ruleString = ruleString.replace("xxxxx", "");
        return ruleString;
    }
    function processVariableLevel(variableLevel, levelIndex, lastRuleLevel) {
        let variableString = "        variables{\nxxxxx        }\n";
        for (let variableIndex = 0; variableIndex < variableLevel.length; variableIndex++) {
            let variable = variableLevel[variableIndex];
            if (!regWord.test(variable.name)) {
                console.log("error in level " + levelIndex + ":variable \"" + variable.name + "\" is illegal")
                return;
            }
            // 处理input，input只能有3个输入或者1个输入

            let idList = [];
            let nameList = [];
            let input = "";
            for (let aRuleIndex = 0; aRuleIndex < lastRuleLevel.length; aRuleIndex++) {
                idList.push(lastRuleLevel[aRuleIndex].id);
                nameList.push(lastRuleLevel[aRuleIndex].name);
            }
            if (variable.input.length == 1) {
                let i = idList.indexOf(variable.input[0]);
                if (i >= 0) {
                    input = nameList[i];
                } else {
                    console.log("error in level" + levelIndex + ":variable \"" + variable.name + "\" input has some wrong")
                    return;
                }
            } else if (variable.input.length == 3) {
                // 要做好检测,哪个在前面,在最左边的是第一个位置，否则第二个位置，第三个位置
                function sortNumber(a, b) {
                    return a - b
                }
                let tmpList = [];
                for (let i = 0; i < 3; i++) {
                    let j = idList.indexOf(variable.input[i])
                    if (j < 0) {
                        console.log("error in level" + levelIndex + ":variable \"" + variable.name + "\" input has some wrong")
                        return;
                    }
                    tmpList.push(j);
                }
                tmpList.sort(sortNumber); // 从小到大排序
                input = nameList[0] + "?" + nameList[1] + ":" + nameList[2];

            } else {
                console.log("error in level" + levelIndex + ":variable \"" + variable.name + "\" input has some wrong")
                return;
            }
            let avariablestr = "            " + variable.name + ": " + input + ";\nxxxxx";
            variableString = variableString.replace("xxxxx", avariablestr);
        }
        variableString = variableString.replace("xxxxx", "");
        return variableString;
    }
    function processControl(level, levelIndex) {

        if (level.control == "true") {
            return "        control: true;\n";
        } else if (level.control == "") {
            console.log("error in level " + levelIndex + ": control is illegal");
            return;
        } else if (level.controlto != "") {
            return "        control: " + level.control + ":" + level.controlto + ";\n";
        } else {
            console.log("error in level " + levelIndex + ": control or controlto");
            return;
        }
    }

    let computer_flowStr = "compute_flow " + flowName + "{\nxxxxx}"; //xxxxx代表占位符，到时候替换掉
    for (let levelIndex = 0; levelIndex < flow.length; levelIndex++) {
        let ruleLevel = flow[levelIndex]["rule"]
        let variableLevel = flow[levelIndex]["variable"];
        let lastVariableLevel = null;
        if (levelIndex != 0) {
            lastVariableLevel = flow[levelIndex - 1]["variable"];
        }
        // 第一步，处理rule
        let ruleStr = processRuleLevel(ruleLevel, levelIndex, lastVariableLevel);
        // 第二步，处理variable
        let variableStr = processVariableLevel(variableLevel, levelIndex, ruleLevel);
        // 第三步，处理control，传入整个层
        let controlStr = processControl(flow[levelIndex], levelIndex);
        if (ruleStr == undefined || variableStr == undefined || controlStr == undefined) {
            return;
        }
        let levelStr = "    level " + levelIndex + "{\n" + ruleStr + variableStr + controlStr + "    }\nxxxxx";
        computer_flowStr = computer_flowStr.replace("xxxxx", levelStr);
    }
    computer_flowStr = computer_flowStr.replace("xxxxx", "");
    return computer_flowStr;
}





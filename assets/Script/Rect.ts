// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html



const {ccclass, property} = cc._decorator;

@ccclass
export default class Rect extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Sprite)
    green: cc.Sprite = null;

    @property(cc.Sprite)
    red: cc.Sprite = null;

    private greenNode: cc.Node = null;
    private redNode: cc.Node = null;
    private labelNode: cc.Node = null;

    //类型
    private type: number = 0;
    //自身在地图数组中的下标
    private index_x: number = 0;
    private index_y: number = 0;
    //game脚本
    private game;
    //每找到一个空格子，就往下面的数组里添加上空格子在地图数组中的下标
    private temp: number[][] = [];
    //该方向找到的格子数
    private findNum: number = 0;

    //自身是否可以点击
    private canTouch:boolean = true;
    
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.greenNode = this.green.node;
        this.redNode = this.red.node;
        this.labelNode = this.label.node;
        if (this.type && this.type != -1) {
            this.node.on(cc.Node.EventType.TOUCH_START,this.onTouchStart, this);
            this.node.on(cc.Node.EventType.TOUCH_MOVE,this.onTouchMove, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL,this.onTouchCancel, this);
            this.node.on(cc.Node.EventType.TOUCH_END,this.onTouchEnd, this);
        }
    }

    /**
     * 
     * @param positionX x坐标
     * @param positionY y坐标
     * @param type 方块类型 0：待填充， -1：不显示，  剩余数字：按钮方块
     * @param index_x 在数组中的下标
     * @param index_y 在数组中的下标
     */
    init(positionX: number, positionY: number, type: number, index_x:number, index_y: number) {
        this.node.x = positionX, this.node.y = positionY, this.type = type;
        this.node.scale = 0.01;

        if (!type) {
            this.node.opacity *= 0.5;
        } else {
            this.index_x = index_x, this.index_y = index_y;
            this.label.string = type + '';
        }
        
        //格子生成动画
        if (type != -1) {
            let row = this.game.checkArray.length, column = this.game.checkArray[0].length;
            let bigOne = row > column ? row : column;
            let randomNumer = bigOne;
            let delayTime = Math.floor(Math.random() * randomNumer) * 0.07;
            // console.log(delayTime);
            cc.tween(this.node).delay(delayTime).to(0.5, {scale: 1}, {easing: 'backOut'}).start();
        }
    }


    onTouchStart(e) {
        if(!this.canTouch) return;
        this.greenNode.active = true;
    }

    private isInSquare:boolean = true;

    onTouchMove(e: cc.Event.EventTouch) {
        if (!this.canTouch)     return;

        let point = e.touch['_point'];

        // 向量转换为角度
        function vectorsToDegree(dirVec: cc.Vec2) {
        // 水平向右的对比向量            
        let comVec = cc.v2(1, 0);
        // 求方向向量与对比向量间的弧度
        let radian = dirVec.signAngle(comVec);          //源码中处理了0向量问题，只是会单纯warn一个警告。 所以我不用管了，也不用再写个判断
        // 将弧度转换为角度
        let degree = cc.misc.radiansToDegrees(radian);
        return degree;
        }

        //自身坐标转为世界坐标
        // let worldPos = this.node.convertToWorldSpaceAR(cc.v2(this.node.x, this.node.y));
        //点击的点位转为自身坐标
        let pointToNodeSpaceAr = this.node.convertToNodeSpaceAR(point);
        //点击的点位转化为向量
        let pointV2 = cc.v2(pointToNodeSpaceAr.x , pointToNodeSpaceAr.y);
        let angle = vectorsToDegree(pointV2);
        
        function isPointInSquare(point, square) {
            let [x, y] = [point.x, point.y];
            let [x1, y1, w, h] = square;
            return x >= x1 && x <= x1 + w && y >= y1 && y <= y1 + h;
        }
        
        let square = [0 - this.node.width * 0.5, 0 -this.node.height * 0.5, this.node.width, this.node.height]
        this.isInSquare = isPointInSquare(pointToNodeSpaceAr,square );
        //每次移动前重置找到的格子信息
        this.resetInfo();
        if (this.isInSquare) {                                  //点击点位处在方块本身里面  需要显示绿色背景
            this.greenNode.active = true;
        } else {                                                //点击点位超出方块本身，判断该往哪个方向生成格子
            //总共需要填的格子数
            let needNum = this.type;

            if (angle > -135 && angle <= -45) {             //上方生成
                let idx = this.index_x - 1, idy = this.index_y;     //点击格子上方格子的下标
                let numInCheckArray = this.game.checkArray[idx] ? this.game.checkArray[idx][idy] : undefined;
                while (typeof(numInCheckArray) == 'number' && numInCheckArray != undefined) {
                    //循环找格子      只存在找到的格子在碰到墙之前已经满足 和 没找够格子就碰墙 两种情况
                    if (!this.game.checkArray[idx] ||  this.game.checkArray[idx][idy] == -1) {        //没找够碰到墙了，直接跳出循环
                        break;
                    }
                    if (this.game.checkArray[idx][idy] == 0) {
                        this.findNum ++;
                        this.temp.push([idx, idy]);             //每找到一个格子，就存一个数据
                        if (this.findNum >= needNum) {                   //找够了，跳出循环
                            break;
                        }
                    }
                    idx-- ;
                }
            } else if (angle > -45 && angle <= 45) {        //右
                let idx = this.index_x, idy = this.index_y + 1;
                let numInCheckArray = this.game.checkArray[idx][idy];

                while (typeof(numInCheckArray) == 'number' && numInCheckArray != undefined) {
                    if (this.game.checkArray[idx][idy] == undefined) break;
                    if ( this.game.checkArray[idx][idy] == -1) {        
                        break;
                    }
                    if (this.game.checkArray[idx][idy] == 0) {
                        this.findNum ++;
                        this.temp.push([idx, idy]);            
                        if (this.findNum >= needNum) {                  
                            break;
                        }
                    }
                    idy++ ;
                }
            } else if (angle > 45 && angle < 135) {         //下
                let idx = this.index_x + 1, idy = this.index_y;
                let numInCheckArray = this.game.checkArray[idx] ? this.game.checkArray[idx][idy] : undefined;

                while (typeof(numInCheckArray) == 'number' && numInCheckArray != undefined) {
                    if (!this.game.checkArray[idx] ||   this.game.checkArray[idx][idy] == -1) {        
                        break;
                    }
                    if (this.game.checkArray[idx][idy] == 0) {
                        this.findNum ++;
                        this.temp.push([idx, idy]);            
                        if (this.findNum >= needNum) {                  
                            break;
                        }
                    }
                    idx++ ;
                }
            } else {                                        //左
                let idx = this.index_x, idy = this.index_y - 1;
                let numInCheckArray = this.game.checkArray[idx][idy];

                while (typeof(numInCheckArray) == 'number' && numInCheckArray != undefined) {
                    if (this.game.checkArray[idx][idy] == undefined) break;
                    if (this.game.checkArray[idx][idy] == -1) {        
                        break;
                    }
                    if (this.game.checkArray[idx][idy] == 0) {
                        this.findNum ++;
                        this.temp.push([idx, idy]);             
                        if (this.findNum >= needNum) {                  
                            break;
                        }
                    }
                    idy-- ;
                }
            }

            this.doCheck();
        }
    }

    //取消拖动后开始判断能否生成格子
    onTouchCancel(e) { 
        if (!this.canTouch)     return;

        this.setHalfOpacityRectNodeColor(false, false);         //透明格子颜色清空
        if (this.findNum < this.type) {         //没找够,之前找的格子颜色清空，自己颜色也清空
            this.redNode.active = false;
        } else {
            //生成格子， 自身数字取消显示， 自身绿色取消显示， 自身不可点击， 找到的格子绿色也不显示， checkArray对应的格子数字从0 改为game中fillNumber （用来判断）
            this.canTouch = false;
            this.labelNode.active = false;
            this.greenNode.active = false;


            //先写入信息
            this.writeInfo();
            //记录每次播放填充格子动画所花费时间—— 其实就是生成最后一个格子时tween动画所花费的时间 计算方式： 执行到最后一个tween动画时的delayTime + tween时间
            
            //再生成格子
            for (let i = 0; i < this.temp.length; i++) {
                let indexInFatherChildren = this.temp[i][0] * this.game.checkArray[0].length + this.temp[i][1];
                let halfOpacityRectNode = this.node.parent.children[indexInFatherChildren];
                let gray = halfOpacityRectNode.getChildByName('gray');
                
                //生成格子的动画         目前回弹效果还待改进，实在不行可以不用easing ，多写几个to实现回弹效果
                cc.tween(gray).delay(0.15 * i).call(() => {
                    gray.active = true;
                    gray.scale = 0.1;
                    console.log(indexInFatherChildren);
                }).to(0.5, {scale: 1}, {easing: 'backOut'}).call(() => {
                    //只有执行完成的是最后一个动画时才进行判断是否过关
                    if (i == this.temp.length - 1) {
                        if (this.canPassLevel()) {
                            //可以过关，执行消失动画
                            this.disappear();       
                        }
                    }
                }).start();     //ps:这个tween有bug  所有判断都正确执行了。就是动画不会生成。不影响所有逻辑，只是单纯卡了一个动画。 么得修改  偶现， 一般玩家正常游玩中不会遇到
            }

            //生成格子后
            // console.log(this.game.arr_back);
        }
    }

    //格子消失动画:  1.禁用按钮； 2.执行消失动画
    disappear() {
        //2:先延迟0.5秒在开始执行消失动画        原作好像就延迟了0.2秒
        this.schedule(() => {
            //1:先把所有按钮都禁用
            let uiScript = this.game.node.getChildByName('ui').getComponent("UI");
            uiScript.setButtonsInteractable(false);
            let a = this.game.arr_back.length;
            let time_2 = [];    //存储每个tween所需要的时间。取最大值就是动画结束，在等0.5秒就可以生成下一关
            for (let arr of this.game.arr_back) {
                a--;
                console.log(arr);
                let b = 0, delayTime = 0;
                for (let i = arr.length - 1; i >= 0; i--) {
                    b++;
                    delayTime = b * 0.15 + a * 0.15;
                    let idx = arr[i][0] * this.game.checkArray[0].length + arr[i][1];
                    let node = this.node.parent.children[idx];
                    let action =  cc.tween(node).delay(delayTime).to(0.5, {scale: 0}).start();
                    let duration = action['_finalAction']['_duration'];     //tween持续时间
                    let totalTime = duration + delayTime;       //tween持续时间 + 延迟时间  =  执行完这个tween所需时间
                    time_2.push(totalTime);
                    // console.log(action);
                }
            }
            let maxTime = Math.max(...time_2);
            console.log(time_2, maxTime);
            this.schedule(() => this.game.createNextLevel(), 0.5 + maxTime);
        }, 0.5, 0)
    }

    onTouchEnd(e) {
        if (!this.canTouch)     return;
        this.greenNode.active = this.redNode.active = false;
    }

    canPassLevel() {
        let num = 0;
        for (let i = 0; i < this.game.checkArray.length; i++) {
            for (let j = 0; j < this.game.checkArray[i].length; j++) {
                if (typeof(this.game.checkArray[i][j]) == 'number' && 0 === this.game.checkArray[i][j]) num++;
            }
        }
        return num <= 0;
    }

    /**写入找到的格子信息，透明格子由0 改成fillNumber */
    writeInfo() {
        //用一个数组记录这一步生成的透明格子下标，和自己下标
        let temp_back = [];
        for (let i = 0; i < this.temp.length; i++) {
            //game.checkArray
            let a = this.temp[i][0], b = this.temp[i][1];
            this.game.checkArray[a][b] = this.game.fillNumber;
            //回退按钮 存储信息
            temp_back.push([a, b]);
        }

        //回退按钮   自身下标存进去   点击回退按钮的时候 已透明的格子取消填充。 自身可以点击，显示数字。  这里 temp_back[0]就是自身下标，方便调用
        temp_back.unshift([this.index_x, this.index_y]);  
        this.game.arr_back.push(temp_back);
    }

    /**设置之前找过的透明格子颜色 
     * @param redColor  红色是否显示
     * @param greenColor  绿色是否显示
    */
    setHalfOpacityRectNodeColor(redColor: boolean, greenColor: boolean) {
        for (let i = 0; i < this.temp.length; i++) {
            let indexInFatherChildren = this.temp[i][0] * this.game.checkArray[0].length + this.temp[i][1];
            let halfOpacityRectNode = this.node.parent.children[indexInFatherChildren];
            let red = halfOpacityRectNode.getChildByName('red');
            let green = halfOpacityRectNode.getChildByName('green');
            red.active = redColor; green.active= greenColor;
        }
    }

    /**重置找到的格子信息 */
    resetInfo() {
        //先把之前找到的透明格子颜色清空
        this.setHalfOpacityRectNodeColor(false, false);

        this.temp = [];
        this.findNum = 0;
    }

    /**每次拖动时检查信息，判断该显示红色还是绿色 */ 
    doCheck() {

        //先判断自身显示红色还是绿色
        this.redNode.active = !this.isInSquare && this.findNum < this.type;
        this.greenNode.active = this.isInSquare || this.findNum >= this.type;
        if(this.isInSquare) {       //拖到方块自身以内，重置信息，自身显示绿色
            this.resetInfo();
           
        } else {

            //先找到透明块：  所有方块都由自身父节点添加，根据temp存下标信息，可以找到透明块是父节点的第几个子节点  计算方式为 this.temp[i][0] * 宽度 + this.temp[i][1]  
            //                                                                                                   宽度获取方式很多。其一为this.game.checkArray[0].length
            for (let i = 0; i < this.temp.length; i++) {
                let indexInFatherChildren = this.temp[i][0] * this.game.checkArray[0].length + this.temp[i][1];
                let halfOpacityRectNode = this.node.parent.children[indexInFatherChildren];
                let red = halfOpacityRectNode.getChildByName('red');
                let green = halfOpacityRectNode.getChildByName('green');
                red.active = this.findNum < this.type;
                green.active = !red.active;
            }
    
        }
    }

    // update (dt) {}
}

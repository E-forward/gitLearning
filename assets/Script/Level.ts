// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
const RECT_SCALE = [1, 1, 1, 1, 0.8, 0.7];
const SECRETLEVELINFO = [[-1,-1,-1,-1,3,3,3,3,-1,-1,-1,-1], [-1,-1,-1,-1,0,0,0,0,-1,-1,-1,-1], [-1,0,-1,-1,0,0,0,0,-1,-1,0,-1], [-1,0,3,0,0,0,0,0,0,0,0,-1],
                         [-1,2,7,0,0,0,0,0,0,0,2,-1], [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], [-1,-1,0,1,0,-1,-1,0,1,0,-1,-1], [-1,-1,1,-1,1,-1,-1,1,-1,1,-1,-1], 
                         [-1,-1,0,1,0,-1,-1,0,1,0,-1,-1], [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,3,0,0,0,-1,-1,-1,-1], [0,-1,-1,0,0,0,0,0,5,-1,-1,0], 
                         [1,0,0,0,3,-1,-1,3,0,0,0,1], [-1,0,0,2,-1,-1,-1,-1,2,0,0,-1]];
const SECRETLEVEL_SCALE = 0.45;

const {ccclass, property} = cc._decorator;

@ccclass
export default class Level extends cc.Component {

   

    @property(cc.Prefab)
    rectPrefab: cc.Prefab = null;

    @property(cc.Camera)
    camera: cc.Camera = null;

    /**地图信息 二维数组 */
    private levelList: number[][] = [];

	/**每张地图的宽度 */
	private level_width:number = 0;
	/**每张地图的高度 */
	private level_height:number = 0;

    /**存储坐标数组 */
    private positionsArray = [];
    /**方块 宽高 */
    private rectWidth: number = 80;
    private rectHeight: number = 80;

    //game脚本
    private game;
    //本关方块缩放比例
    private rectScale: number = 1;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        
    }

    initLevel(totalMap: number[][][], currentLevel:number) {
        if (currentLevel === 0) {
            this.levelList = SECRETLEVELINFO;
            this.rectScale = SECRETLEVEL_SCALE;
        } else {
            this.levelList = totalMap[currentLevel - 1];        
            this.rectScale = RECT_SCALE[currentLevel - 1];
        }
        this.level_width = this.levelList[0].length;
        this.level_height = this.levelList.length;

        this.rectWidth = this.rectHeight = this.rectScale * 80;
        //深克隆一下检查数组
        this.game.checkArray = structuredClone(this.levelList);
        
        //先求每个方块的坐标
        this.setPosition(this.levelList);
        for(let i = 0; i < this.level_height; i++) {
            for (let j = 0; j < this.level_width; j ++) {
                let rectType = this.levelList[i][j];

                let rect = cc.instantiate(this.rectPrefab);
                let rectScript =  rect.getComponent('Rect');
                rectScript.game = this.game;            //把game传进rect，方便调用

                rectScript.init(this.positionsArray[i][j].posX, this.positionsArray[i][j].posY, rectType, i , j, this.rectScale);
                this.node.addChild(rect);
                rect.width *= this.rectScale;
                rect.height *= this.rectScale;
                for(let rectChild of rect.children) {
                    rectChild.width *= this.rectScale;
                    rectChild.height *= this.rectScale;
                }
                if (rectType == -1)     rect.active = false;               //-1不显示
                
            }
        }

        
    }

    destroyLevel() {
        this.node.removeAllChildren();
        this.game.checkArray = [];
        this.game.arr_back = [];
    }

    creatMap() {

    }

    /**设置好每一个方块的坐标 */
    setPosition(levelList) {
        this.positionsArray = new Array(this.level_height).fill(0).map((v, k) => new Array(this.level_width).fill(0).map(v =>new Object({posX: 0, posY: 0})));
        // console.log(this.positionsArray);
        //最中间(基准)的方块坐标为（0，0）
        let middle_i = this.level_height / 2;
        let middle_y = this.level_width / 2;
        //基准方块在数组中位置，用下标表示
        let [index_x, index_y] = [0, 0];
        //基准方块坐标
        let [position_x, position_y] = [0, 0];
        //-------------------------------------------------------------------下面设置基准方块坐标                      
        //判断是否是整数
        function isInteger(num) {
            return num === Math.floor(num);
        }

        //如果行列都是偶数，最中间（不能说最中间，应是基准方块）方块x坐标为 0+ 宽度一半，y坐标为0 - 高度一半
        if (isInteger(middle_i) && isInteger(middle_y)) {
            // console.log(this.positionsArray[middle_i][middle_y], middle_i, middle_y) ;
            [index_x,index_y] = [middle_i,middle_y];                                //先求下标，再求位置，这里就分两行写。以免写一行以后看不懂
            [position_x, position_y] = [this.rectWidth * 0.5, -this.rectHeight * 0.5]
        } else if (!isInteger(middle_i) && isInteger(middle_y)) {   //行为奇数，列为偶数，基准方块x坐标为0，y坐标为0 - 高度一半
            [index_x,index_y] = [Math.floor(middle_i),middle_y];
            [position_x, position_y] = [0, -this.rectHeight * 0.5];
        } else if (isInteger(middle_i) && !isInteger(middle_y)) {   //行为偶数，列为奇数，基准方块x坐标为0+ 宽度一半，y坐标为0 
            [index_x,index_y] = [middle_i,Math.floor(middle_y)];
            [position_x, position_y] = [this.rectWidth * 0.5, 0];
        } else {                                                    //行列都是奇数，基准方块坐标为0，0     默认即为0，0 故不用赋值
            [index_x,index_y] = [Math.floor(middle_i),Math.floor(middle_y)];
        }
        [this.positionsArray[index_x][index_y].posX, this.positionsArray[index_x][index_y].posY] = [position_x, position_y];

        //根据基准方块坐标求出每一个方块的坐标 
        for (let i = 0; i < this.level_height; i++) {
            for (let j = 0; j < this.level_width; j++) {
                this.positionsArray[i][j].posX = position_x + (j - index_y) * this.rectWidth;
                this.positionsArray[i][j].posY = position_y - (i - index_x) * this.rectHeight;
            }
        }
        // console.log(this.positionsArray);
    }
    // update (dt) {}
}

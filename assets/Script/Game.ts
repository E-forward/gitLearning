// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.macro.ENABLE_MULTI_TOUCH = false;

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    @property(cc.JsonAsset)
    jsonAsset: cc.JsonAsset = null;

    @property(cc.Node)
    coverSheetNode: cc.Node = null;

    @property(cc.Node)
    levelNode: cc.Node = null;

    @property(cc.Node)
    uiNode: cc.Node = null;

    @property(cc.Node)
    levelsViewNode: cc.Node = null;

    @property(cc.Node)
    authorViewNode: cc.Node = null;

    private totalMapInfomation: number[][][] = [];

    public levelList:number[] = [];

    public currentMaximumLevelNumber: number = 0;

	
	/**当前关卡 */
	public currentLevel:number = 0;
	/**最大关卡数 */
	public maxLevel:number = 6;

    /**判断数组 */
    public checkArray: number[][] = [];
    /**填充标志数 */
    public fillNumber: number = 9999;
    /**回退按钮用数组 */
    public arr_back: number[][][] = [];

	public setCurLevel(a:number) {
		this.currentLevel = a;
	}
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.totalMapInfomation = this.jsonAsset.json;
        this.initGameInfomations();
        // console.log(this.totalMapInfomation);

        this.coverSheetNode.getComponent('CoverSheet').game = this;
        this.levelsViewNode.getComponent('LevelsView').game = this;
    }

    start () {

    } 

    //从存储中拿出游戏信息——包括音乐是否静音，玩家游玩的最大关卡数等
    initGameInfomations() {
        this.currentMaximumLevelNumber = cc.sys.localStorage.getItem('maxLevel') || 1;
        
    }



    //生成一个关卡
    createALevel(currentLevel:number) {
        this.coverSheetNode.active = this.levelsViewNode.active = false;
        this.uiNode.active = this.levelNode.active = true;
        this.setCurLevel(currentLevel);
        //先把按钮取消禁用
        let uiScript = this.uiNode.getComponent('UI');
        uiScript.game = this;
        uiScript.setButtonsInteractable(true);
        uiScript.showLevelInfo(currentLevel);

        let levelScrpit = this.levelNode.getComponent("Level");
        levelScrpit.game = this;
        
        //把之前关卡先销毁
        levelScrpit.destroyLevel();
        //再生成当前关卡
        levelScrpit.initLevel(this.totalMapInfomation, currentLevel);
    }

    //生成上一关
    createPrevLevel() {
        if (this.currentLevel >= 2) {
            this.currentLevel --;
            this.createALevel(this.currentLevel);
        }
    }

    //生成下一关
    createNextLevel() {
        if (this.currentLevel + 1 <= this.maxLevel) {
            this.currentLevel ++;
            this.createALevel(this.currentLevel);
        }
    }
    //销毁一个关卡
    destroyALevel() {
        
    }

    /***************下面是制作人信息界面用到的东西，有点少就不单开一个类了，直接写在这里*************
     ***************隐藏关地图写在Level.ts中了，还是那句话，我都做了这么多了，让我写在josn里然后改代码逻辑是不存在的，省事要紧 */

    //隐藏关
    onClickSecretButton() {
        this.authorViewNode.active = false;
        this.createALevel(0);
    }
    //点击按钮回封页
    onClickCoverSheetButton() {
        this.authorViewNode.active = false;
        this.coverSheetNode.active = true;
    }



    // update (dt) {}
}

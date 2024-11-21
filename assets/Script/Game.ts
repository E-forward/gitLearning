// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Level from "./Level";
cc.macro.ENABLE_MULTI_TOUCH = false;

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    @property(cc.JsonAsset)
    jsonAsset: cc.JsonAsset = null;

    @property
    text: string = 'hello';

    private totalMapInfomation: number[][][] = [];

    public levelList:number[] = [];

	
	/**当前关卡 */
	public currentLevel:number = 2;
	/**最大关卡数 */
	public maxLevel:number = 50;

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
        console.log(this.totalMapInfomation);
        this.createALevel(this.currentLevel);
    }

    start () {

    } 



    //生成一个关卡
    createALevel(currentLevel:number) {
        //先把按钮取消禁用
        let uiScript = this.node.getChildByName('ui').getComponent('UI');
        uiScript.setButtonsInteractable(true);

        let levelNode = this.node.getChildByName('level');
        let levelScrpit = levelNode.getComponent("Level");
        levelScrpit.game = this;
        
        //把之前关卡先销毁
        levelScrpit.destroyLevel();
        //再生成当前关卡
        levelScrpit.initLevel(this.totalMapInfomation, currentLevel);
    }

    //生成下一关
    createNextLevel() {
        if (this.currentLevel + 1 < this.maxLevel) {
            this.currentLevel ++;
            this.createALevel(this.currentLevel);
        }
    }
    //销毁一个关卡
    destroyALevel() {
        
    }

    // update (dt) {}
}

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class LevelManager {

    private static instance:LevelManager = null;

	public static getInstance()
	{
		if(this.instance == null)
		{
			this.instance = new LevelManager();
		}
		return this.instance;
	}

    public totalmap:object = {};

    public levelList:number[] = [];

	public level_width:string = "";
	public level_height:string = "";
	
	/**当前关卡 */
	public curLevel:number = 1;
	/**最大关卡数 */
	public maxLevel:number = 1;

	public setCurLevel(a:number)
	{
		this.curLevel = a;
	}

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}

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

    @property(cc.Node)
    optionsViewNode: cc.Node = null;

    @property(cc.Node)
    congratulationsViewnNode: cc.Node = null;

    @property(cc.Sprite)
    bgSprite: cc.Sprite = null;

    @property(cc.AudioClip)
    audioClips: cc.AudioClip[] = [];

    @property(cc.AudioClip)
    bgm: cc.AudioClip = null;

    //玩家数据
    public userData = null;

    //shader用
    private material: cc.Material = null;
    private time_shader;

    private totalMapInfomation: number[][][] = [];
    // public levelList:number[] = [];
    public currentMaximumLevelNumber: number = 0;
	
	/**当前关卡 */
	public currentLevel:number = 0;
	/**最大关卡数 */
	public maxLevel:number = 20;
    /**判断数组 */
    public checkArray: number[][] = [];         //这个用来找格子
    public checkArray_1: number[][] = [];       //这个用来判断能否过关
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
        this.playMusic();
        // console.log(this.totalMapInfomation);

        this.coverSheetNode.getComponent('CoverSheet').game = this;
        this.levelsViewNode.getComponent('LevelsView').game = this;
        this.optionsViewNode.getComponent('OptionsView').game = this;
    }

    start () {
        // window.bgSprite = this.bgSprite;
        this.material = this.bgSprite.getMaterial(0);
        this.time_shader = 0;
        // this.changeBGColor();
    } 

    //从存储中拿出游戏信息——包括音乐是否静音，玩家游玩的最大关卡数等
    initGameInfomations() {
        this.userData = JSON.parse(cc.sys.localStorage.getItem('userData'));
        if (!this.userData) {
            this.userData = {maxLevel : 1, music: true, soundEffect: true};
            cc.sys.localStorage.setItem('userData',JSON.stringify(this.userData));
        }
        this.currentMaximumLevelNumber = this.userData.maxLevel;
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
        } else {
            //全部通关后，展示致谢页面
            this.uiNode.active = this.levelsViewNode.active = false;
            this.congratulationsViewnNode.active = true;
        }
    }

    /***************下面是制作人信息界面用到的东西，有点少(其实就俩按钮)就不单开一个类了，直接写在这里*************
     ***************隐藏关地图写在Level.ts中了，还是那句话，我都做了这么多了，让我写在josn里然后改代码逻辑是不存在的，省事要紧 */

    //点击后隐藏关
    onClickSecretButton() {
        this.authorViewNode.active = false;
        this.createALevel(0);
        this.playEffect(1);
    }
    //点击按钮回封页
    onClickCoverSheetButton() {
        this.authorViewNode.active = false;
        this.optionsViewNode.active = false;
        this.congratulationsViewnNode.active = false;
        this.coverSheetNode.active = true;
        this.playEffect(1);
    }

    /**********************************************制作人页面结束************************************************************** */

    playEffect(clipIndex: number) {
        if (this.userData.soundEffect) {
            cc.audioEngine.playEffect(this.audioClips[clipIndex], false);
        }
    }

    private musicID: number = null; 

    playMusic() {
        if (this.userData.music && this.musicID == null) {
            this.musicID = cc.audioEngine.playMusic(this.bgm, true);
            cc.audioEngine.setMusicVolume(0.2);
        } else if (this.userData.music && this.musicID != undefined) {
            cc.audioEngine.resumeMusic();
        }
    }

    pauseMusic() {
        if (this.musicID != null) {
            cc.audioEngine.pauseMusic();
        }
    }

    update (dt) {
        this.time_shader += dt * 0.2;
        this.material.setProperty('u_time', this.time_shader);
        // console.log(dt,this.time_shader);
    
        const bgR = Math.sin(this.time_shader) * 0.5 + 0.5; // 红色通道随时间变化
        const bgG = Math.cos(this.time_shader) * 0.5 + 0.7; // 绿色通道随时间变化
        const bgB = Math.cos(this.time_shader) * 0.5 + 0.7; // 蓝色通道随时间变化
        const bgColorVec4 = new cc.Vec4(bgR, bgG, bgB, 0.8); // 蓝色通道固定为0.5
        this.material.setProperty('colorStart', bgColorVec4);

        const bgR_2 = Math.cos(this.time_shader) * 0.5 + 0.7; // 红色通道随时间变化
        const bgG_2 = Math.cos(this.time_shader) * 0.5 + 0.7; // 绿色通道随时间变化
        const bgB_2 = Math.sin(this.time_shader) * 0.5 + 0.5; // 蓝色通道随时间变化
        const bgColorVec4_2 = new cc.Vec4(bgR_2, bgG_2, bgB_2, 0.8); // 蓝色通道固定为0.5
        this.material.setProperty('colorEnd', bgColorVec4_2);
    }
}

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    currentLevelLabel: cc.Label = null;

    private game;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    protected onEnable(): void {
        this.currentLevelLabel.string = `PLAY\n${this.game.currentMaximumLevelNumber}`;
    }

    clickPlay() {
        this.game.createALevel(this.game.currentMaximumLevelNumber);
        this.game.playEffect(1);
    }

    clickSettings () {
        //打开设置界面
        this.game.optionsViewNode.active = true;
        this.node.active = false;
        this.game.playEffect(1);
    }

    clickInfomations() {
        //打开制作人信息
        this.game.authorViewNode.active = true;
        this.node.active = false;
        this.game.playEffect(1);
    }

    clickSelectLevel() {
        //打开选关界面
        this.game.levelsViewNode.active = true;
        this.node.active = false;
        this.game.playEffect(1);
    }

    // update (dt) {}
}

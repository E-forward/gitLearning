// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class OptionsView extends cc.Component {

    @property(cc.Node)
    musicCtrlNode: cc.Node = null;

    @property(cc.Node)
    soundEffectCtrlNode: cc.Node = null;

    private game;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.musicCtrlNode.getComponent('RadioButton').game = this.game;
        this.soundEffectCtrlNode.getComponent('RadioButton').game = this.game;
    }

    start () {

    }

    // update (dt) {}
}

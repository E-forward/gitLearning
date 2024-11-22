// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class LevelButton extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    levelNumber: number = 0;

    private game;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.label.string = `${this.levelNumber + 1}`;
        this.setSelfInteractable();
    }

    setLevelNumber(num: number) {
        this.levelNumber = num;
    }

    setSelfInteractable() {
        let currentMaxLevelNum = this.game.currentMaximumLevelNumber;
        this.node.getComponent(cc.Button).interactable = this.levelNumber < currentMaxLevelNum ? true : false;           
    }

    onClick() {
        this.game.createALevel(this.levelNumber + 1);
    }

    // update (dt) {}
}

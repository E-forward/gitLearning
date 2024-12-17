// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


const {ccclass, property} = cc._decorator;

@ccclass
export default class LevelsView extends cc.Component {

    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;

    @property(cc.Node) 
    content: cc.Node = null;

    @property(cc.Prefab)
    buttonPrefab: cc.Prefab = null;

    private game;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let maxLevel = this.game.maxLevel;
        for (let i = 0; i < maxLevel; i++) {
            let buttonNode = cc.instantiate(this.buttonPrefab);
            let buttonNodeScript = buttonNode.getComponent('LevelButton');
            buttonNodeScript.game = this.game;
            buttonNodeScript.setLevelNumber(i);
            this.content.addChild(buttonNode);
        }
    }

    protected onEnable(): void {
        for (let buttonNode of this.content.children) {
            buttonNode.getComponent('LevelButton').setSelfInteractable();
        }
    }

    start () {

    }

    onClickCoverSheetButton() {
        this.node.active = false;
        this.game.coverSheetNode.active = true;
        this.game.playEffect(1);
    }

    // update (dt) {}
}

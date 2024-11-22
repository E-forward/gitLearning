// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class UI extends cc.Component {

    @property(cc.Button)
    backButton: cc.Button = null;

    @property(cc.Button)
    restartButton: cc.Button = null;

    @property(cc.Button)
    coverSheetButton: cc.Button = null;

    @property(cc.Button)
    nextLevelButton: cc.Button = null;

    @property(cc.Button)
    prevLevelButton: cc.Button = null;

    @property(cc.Label)
    levelLabel: cc.Label = null;

    @property(cc.Label)
    levelInofLabel: cc.Label = null;

    private infomations = ['Swipe to fill the grid.', , 'The order in which you swipe matters.', , 'Enjoy.'];

    private game;


    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // this.game = this.node.parent.getComponent('Game');
    }

    start () {

    }

    //展示关卡信息： 1.第1、3、5关时有提示文字；2.显示当前是第几关；3.控制上下一关按钮是否可点击
    showLevelInfo (level: number) {
        this.levelLabel.string = level + '';
        this.levelInofLabel.string = this.infomations[level - 1] || '';
        this.prevLevelButton.interactable = level <= 1 ? false : true;
        this.nextLevelButton.interactable = level >= this.game.currentMaximumLevelNumber ? false : true;
    }

    setButtonsInteractable(bool: boolean) {
        this.backButton.interactable = bool;
        this.restartButton.interactable = bool;
        this.prevLevelButton.interactable = bool;
        this.nextLevelButton.interactable = bool;
        this.coverSheetButton.interactable = bool;
    }

    onClickPrev() {
        this.game.createPrevLevel();
    }

    onClickNext() {
        this.game.createNextLevel();
    }

    onClickCoverSheet() {
        this.game.uiNode.active = this.game.levelNode.active = false;
        this.game.coverSheetNode.active = true;
    }

    onClickBack() {
        if (!this.game.arr_back.length) return;
        let len = this.game.arr_back.length;

        //拿出当前回退按钮需要的数据
        let backInfoArr = this.game.arr_back[len - 1];
        let len_2 = backInfoArr.length;
        //level节点
        let levelNode = this.node.parent.getChildByName('level');
        
        //先把填充的透明方块还原
        let a = 0;              //这里的变量a 为了控制 点击按钮后填充的灰格子直接开始消失，与数字格子转圈的动画同步
        
        for (let i =len_2 - 1; i >= 1; i--) {
            let id_x = backInfoArr[i][0], id_y = backInfoArr[i][1];
            let rectIndexInFatherChildren = id_x * this.game.checkArray[0].length + id_y;
            let rect: cc.Node = levelNode.children[rectIndexInFatherChildren];
            let gray: cc.Node = rect.getChildByName('gray');
            //点击回退按钮后先停止所有tween
            cc.Tween.stopAllByTarget(gray);
            //已经生成的格子才有消失动画
            if (gray.active ) {
                cc.tween(gray).delay(0.15 * a).to(0.15, {scale: 0.01}).call(() =>{gray.active = false; console.log(rectIndexInFatherChildren);}).start();
                a++;
            }

            //game中checkArray对应数字改为0
            this.game.checkArray[id_x][id_y] = 0;         
        }

        //数字格子还原
        let numberRect_idx = backInfoArr[0][0] * this.game.checkArray[0].length + backInfoArr[0][1];
        let numberRect = levelNode.children[numberRect_idx];
        let numberRectScript = numberRect.getComponent('Rect');
        numberRectScript.canTouch = true;
        numberRectScript.labelNode.active = true;
        cc.tween(numberRect).by(0.8, {angle: 360}, {easing: 'sineOut'}).start();       //数字格子自身转圈动画

        //回退一步后，撤销存储信息
        this.game.arr_back.splice(len - 1, 1);
    }

    onClickRestart() {
        let levelNode = this.node.parent.getChildByName('level');
        for (let i = 0; i < levelNode.children.length; i++) {
            let gray: cc.Node = levelNode.children[i].getChildByName('gray');
            cc.Tween.stopAllByTarget(gray);
        }
        this.game.createALevel(this.game.currentLevel);
    }

    // update (dt) {}
}

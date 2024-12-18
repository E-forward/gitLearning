// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class RadioButton extends cc.Component {

    @property(cc.Button)
    button: cc.Button = null;

    @property(cc.Node)
    Node_on: cc.Node = null;

    @property(cc.Node)
    Node_off: cc.Node = null;

    @property(cc.Sprite)
    bgSprite: cc.Sprite = null;

    @property(cc.Node)
    sliderNode: cc.Node = null;

    @property
    position_left =  cc.v3(0, 0, 0);    //这俩是滑动块的左右坐标
    @property
    position_right =  cc.v3(0, 0, 0);

    @property
    text: string = '';      //string为 music表示为控制背景音乐的按钮，string为 soundEffect表示控制音效的按钮

    private game;
    private isSliderOn = true;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.game.userData
        if (this.text == 'music') {
            this.isSliderOn = this.game.userData.music;
        } else if (this.text == 'soundEffect') {
            this.isSliderOn = this.game.userData.soundEffect;
        } else {
            cc.warn('未正确设置文本，请转到creator进行设置后再进行调试！');
        }

        this.sliderNode.position = this.isSliderOn ? this.position_right : this.position_left;
        let GradientCtrl = this.bgSprite.node.getComponent('GradientCtrl');
        GradientCtrl.initMaterial(this.isSliderOn);
    }

    start () {

    }

    onClick() {
        this.button.interactable = false;
        this.isSliderOn = !this.isSliderOn;

        if (this.text == 'music') {
            this.game.userData.music = this.isSliderOn;
            if (!this.isSliderOn) {
                this.game.pauseMusic();
            } else {
                this.game.playMusic();
            }
        } else {
            this.game.userData.soundEffect = this.isSliderOn;
        }
        cc.sys.localStorage.setItem('userData',JSON.stringify(this.game.userData));

        let GradientCtrl = this.bgSprite.node.getComponent('GradientCtrl');
        let tweenTime = GradientCtrl.duration;
        cc.tween(this.sliderNode).to(tweenTime, {position: this.isSliderOn ? this.position_right : this.position_left}).call(() => {
            this.button.interactable = true;
            this.game.playEffect(1);
        }).start();
        GradientCtrl.resetMaterial(this.isSliderOn);
    }

    // update (dt) {}
}

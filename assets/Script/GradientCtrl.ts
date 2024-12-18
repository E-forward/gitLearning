// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class GradientShaderControl extends cc.Component {

    @property(cc.Material)
    material: cc.Material = null; // 需要绑定的材质

    // 用于控制渐变的变量
    @property(cc.Color)
    colorStart: cc.Color = cc.Color.RED; // 初始颜色（红色）

    @property(cc.Color)
    colorEnd: cc.Color = cc.Color.GREEN; // 目标颜色（绿色）

    @property
    duration: number = 0.5; // 渐变的持续时间，单位为秒

    private time: number = 1; // 累计的时间

    // 初始化
    onLoad() {
        if (this.material) {
            // this.material.setProperty('colorStart', this.colorStart); // 设置起始颜色
            // this.material.setProperty('colorEnd', this.colorEnd); // 设置目标颜色
            this.material.setProperty('u_duration', this.duration); // 设置渐变持续时间
        }
    }

    initMaterial(isRadioButtonOn: boolean) {
        this.material.setProperty('colorEnd', isRadioButtonOn ? this.colorEnd : this.colorStart);
    }

    // 更新渐变时间
    update(dt: number) {
        if (this.material) {
            if (this.time < this.duration) {
                this.time += dt;
            }
            this.material.setProperty('u_time', this.time); // 更新时间变量
        }
    }

    //点击后重新设置材质来进行渐变动画
    resetMaterial(isRadioButtonOn: boolean) {
        this.material.setProperty('colorStart',  isRadioButtonOn ? this.colorStart : this.colorEnd); // 设置起始颜色
        this.material.setProperty('colorEnd', isRadioButtonOn? this.colorEnd : this.colorStart); // 设置目标颜色
        this.time = 0;
    }
}


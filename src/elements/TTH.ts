import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";

export class TTH extends LMent {
    private destroyed: boolean;
    hideDelay: number;
    target: string | undefined;
    private targetBody: BodyHandle | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<TTH> = {}) {
        super(body, id, params);
        this.destroyed = false;
        this.hideDelay = params.hideDelay === undefined ? 0 : params.hideDelay;
        this.target = params.target;
    }

    onInit(): void {

    }

    onStart(): void {
        if (this.target !== undefined) {
            for (let i of this.body.bodyGroup)
                if (i.body.name === this.target)
                    this.targetBody = i;
            GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doHide(this.targetBody) }, this.hideDelay);
        }
        else {
            GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doHide() }, this.hideDelay);
        }
    }

    doHide(body: BodyHandle | undefined = this.body) {
        body.body.setVisible(false);
    }


}
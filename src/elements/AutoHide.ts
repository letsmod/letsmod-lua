import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";
import { UpdateHandler } from "engine/MessageHandlers";

export class AutoHide extends LMent implements UpdateHandler {
    hideDelay: number;
    targets: string[] | undefined;
    private targetBody: BodyHandle[];
    private isHidden: boolean;

    constructor(body: BodyHandle, id: number, params: Partial<AutoHide> = {}) {
        super(body, id, params);
        this.hideDelay = params.hideDelay === undefined ? 0 : params.hideDelay;
        this.targets = this.convertArray(params.targets) || undefined;
        this.targetBody = [];
        this.isHidden = false;
    }
    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
    }

    onStart(): void {
    }

    onUpdate(dt: number): void {
        if (!this.isHidden) {
            GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doHide() }, this.hideDelay);
            this.isHidden = true;
        }
    }

    doHide() {
        if (this.targets !== undefined) {
            for (let i of this.body.bodyGroup)
                if (this.targets.includes(i.body.name))
                    i.body.setVisible(false);
        } else {
            this.body.body.setVisible(false);
        }
    }
}
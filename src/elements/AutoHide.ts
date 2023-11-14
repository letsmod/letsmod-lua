import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";
import { UpdateHandler } from "engine/MessageHandlers";

export class AutoHide extends LMent implements UpdateHandler {
    hideDelay: number;
    targets: string[] | undefined;
    initiallyEnabled: boolean;
    private isHidden: boolean;

    constructor(body: BodyHandle, id: number, params: Partial<AutoHide> = {}) {
        super(body, id, params);
        this.hideDelay = params.hideDelay === undefined ? 0 : params.hideDelay;
        this.targets = this.convertArray(params.targets) || undefined;
        this.initiallyEnabled = params.initiallyEnabled === undefined ? true : params.initiallyEnabled;
        this.isHidden = false;
    }
    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        if (!this.initiallyEnabled) {
            this.enabled = false;
        }
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
            for (let i = this.body.bodyGroup.length; i > 0; i--)
                if (this.targets.includes(this.body.bodyGroup[i - 1].body.name))
                    this.body.bodyGroup[i - 1].body.setVisible(false);
        } else
            this.body.body.setVisible(false);
    }
}
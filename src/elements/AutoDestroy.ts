import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";
import { UpdateHandler } from "engine/MessageHandlers";

export class AutoDestroy extends LMent implements UpdateHandler {
    destructionDelay: number;
    targets: string[] | undefined;
    initiallyEnabled: boolean;
    private isDestroyed: boolean;

    constructor(body: BodyHandle, id: number, params: Partial<AutoDestroy> = {}) {
        super(body, id, params);
        this.destructionDelay = params.destructionDelay === undefined ? 0 : params.destructionDelay;
        this.targets = this.convertArray(params.targets) || undefined;
        this.initiallyEnabled = params.initiallyEnabled === undefined ? true : params.initiallyEnabled;
        this.isDestroyed = false;
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
        if (!this.isDestroyed) {
            GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doDestroy() }, this.destructionDelay);
            this.isDestroyed = true;
        }
    }

    doDestroy() {
        if (this.targets !== undefined) {
            for (let i = this.body.bodyGroup.length; i > 0; i--)
                if (this.targets.includes(this.body.bodyGroup[i - 1].body.name)) 
                    GameplayScene.instance.destroyBody(this.body.bodyGroup[i - 1]);
        } else
            GameplayScene.instance.destroyBody(this.body);
    }
}
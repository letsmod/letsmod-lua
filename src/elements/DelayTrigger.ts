import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";

export class DelayTrigger extends LMent {

    triggerId: string;
    triggerContext: "local" | "group" | "global";
    delay: number;

    onInit(): void {
    }

    onStart(): void {
        this.sendTrigger();
    }

    onEnable(): void {
        this.sendTrigger();
    }

    constructor(body: BodyHandle, id: number, params: Partial<DelayTrigger> = {}) {
        super(body, id, params);
        this.triggerId = params.triggerId === undefined ? Helpers.NA : params.triggerId;
        this.triggerContext = params.triggerContext === undefined ? "local" : params.triggerContext;
        this.delay = params.delay === undefined ? 0 : params.delay;
    }

    sendTrigger() {
        GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {

            if (Helpers.ValidateParams(this.triggerId, this, "triggerId")) {
                GameplayScene.instance.dispatcher.onTrigger(this, this.triggerId, this.triggerContext);
            }
            this.enabled = false;
        }, this.delay)
    }

}
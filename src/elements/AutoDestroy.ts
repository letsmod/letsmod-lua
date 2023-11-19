import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";
import { Helpers } from "engine/Helpers";

export class AutoDestroy extends LMent implements UpdateHandler, TriggerHandler {
    triggerId: string;
    destructionDelay: number;
    targets: string[] | undefined;
    receivesTriggersWhenDisabled: boolean | undefined;
    private isDestroyed: boolean;

    constructor(body: BodyHandle, id: number, params: Partial<AutoDestroy> = {}) {
        super(body, id, params);
        this.destructionDelay = params.destructionDelay === undefined ? 0 : params.destructionDelay;
        this.triggerId = params.triggerId === undefined ? Helpers.NA : params.triggerId;
        this.targets = this.convertArray(params.targets) || undefined;
        this.receivesTriggersWhenDisabled = params.receivesTriggersWhenDisabled === undefined ? true : params.receivesTriggersWhenDisabled;
        this.isDestroyed = false;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        GameplayScene.instance.dispatcher.addListener("trigger", this);
        if (this.triggerId !== Helpers.NA)
            this.enabled = false;
    }

    onStart(): void {
    }

    validateElement() {
        return Helpers.ValidateParams(this.triggerId, this, "triggerId");
    }

    onUpdate(dt: number): void {
        if (!this.isDestroyed) {
            GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doDestroy() }, this.destructionDelay);
            this.isDestroyed = true;
        }
    }

    hasSubtype(trigger: string): boolean {
        return trigger == this.triggerId;
    }

    onTrigger(source: LMent, triggerId: string): void {
        if (!this.validateElement())
            return;
            GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doDestroy() }, this.destructionDelay);
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

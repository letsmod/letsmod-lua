import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";
import { Helpers } from "engine/Helpers";

export class AutoShow extends LMent implements UpdateHandler, TriggerHandler {
    triggerId: string;
    showDelay: number;
    targets: string[] | undefined;
    receivesTriggersWhenDisabled: boolean | undefined;
    private isShown: boolean;

    constructor(body: BodyHandle, id: number, params: Partial<AutoShow> = {}) {
        super(body, id, params);
        this.showDelay = params.showDelay === undefined ? 0 : params.showDelay;
        this.triggerId = params.triggerId === undefined ? Helpers.NA : params.triggerId;
        this.receivesTriggersWhenDisabled = params.receivesTriggersWhenDisabled === undefined ? true : params.receivesTriggersWhenDisabled;
        this.targets = this.convertArray(params.targets) || undefined;
        this.isShown = false;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        GameplayScene.instance.dispatcher.addListener("trigger", this);
        if (this.triggerId !== Helpers.NA) {
            this.enabled = false;
        }
    }

    onStart(): void {
    }

    validateElement(): boolean {
        return Helpers.ValidateParams(this.triggerId, this, "triggerId");
    }

    hasSubtype(trigger: string): boolean {
        return trigger === this.triggerId;
    }

    onTrigger(source: LMent, triggerId: string): void {
        if (!this.validateElement()) {
            return;
        }
        GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doShow() }, this.showDelay);
    }

    onUpdate(dt: number): void {
        if (!this.isShown) {
            GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doShow() }, this.showDelay);
            this.isShown = true;
        }
    }

    doShow(): void {
        if (this.targets !== undefined) {
            for (let i = this.body.bodyGroup.length; i > 0; i--) {
                if (this.targets.includes(this.body.bodyGroup[i - 1].body.name)) {
                    this.body.bodyGroup[i - 1].body.setVisible(true);
                }
            }
        } else {
            this.body.body.setVisible(true);
        }
    }
}

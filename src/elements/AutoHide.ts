import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";
import { Helpers } from "engine/Helpers";

export class AutoHide extends LMent implements UpdateHandler, TriggerHandler {
    triggerId: string;
    hideDelay: number;
    targets: string[] | undefined;
    receivesTriggersWhenDisabled: boolean | undefined;
    private isHidden: boolean;

    constructor(body: BodyHandle, id: number, params: Partial<AutoHide> = {}) {
        super(body, id, params);
        this.hideDelay = params.hideDelay === undefined ? 0 : params.hideDelay;
        this.triggerId = params.triggerId === undefined ? Helpers.NA : params.triggerId;
        this.receivesTriggersWhenDisabled = params.receivesTriggersWhenDisabled === undefined ? true : params.receivesTriggersWhenDisabled;
        this.targets = this.convertArray(params.targets) || undefined;
        this.isHidden = false;
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
        GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doHide() }, this.hideDelay);
    }

    onUpdate(dt: number): void {
        if (!this.isHidden) {
            GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doHide() }, this.hideDelay);
            this.isHidden = true;
        }
    }

    doHide(): void {
        if (this.targets !== undefined) {
            for (let i = this.body.bodyGroup.length; i > 0; i--) {
                if (this.targets.includes(this.body.bodyGroup[i - 1].body.name)) {
                    this.body.bodyGroup[i - 1].body.setVisible(false);
                }
            }
        } else {
            this.body.body.setVisible(false);
        }
    }
}

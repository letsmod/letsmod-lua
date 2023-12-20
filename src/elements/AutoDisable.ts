import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";
import { Helpers } from "engine/Helpers";

export class AutoDisable extends LMent implements UpdateHandler, TriggerHandler {
    triggerId: string;
    disableDelay: number;
    targets: string[] | undefined;
    elementName: string;
    elementChipName: string;
    receivesTriggersWhenDisabled: boolean | undefined;
    private isDisabled: boolean;

    constructor(body: BodyHandle, id: number, params: Partial<AutoDisable> = {}) {
        super(body, id, params);
        this.disableDelay = params.disableDelay === undefined ? 0 : params.disableDelay;
        this.triggerId = params.triggerId === undefined ? Helpers.NA : params.triggerId;
        this.targets = this.convertArray(params.targets) || undefined;
        this.receivesTriggersWhenDisabled = params.receivesTriggersWhenDisabled === undefined ? true : params.receivesTriggersWhenDisabled;
        this.isDisabled = false;
        this.elementName = params.elementName === undefined ? "" : params.elementName;
        this.elementChipName = params.elementChipName === undefined ? "" : params.elementChipName;
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
        GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doDisable() }, this.disableDelay);
    }

    onUpdate(dt: number): void {
        if (!this.isDisabled) {
            GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doDisable() }, this.disableDelay);
            this.isDisabled = true;
        }
    }

    doDisable(): void {
        if (this.targets !== undefined) {
            for (let i = this.body.bodyGroup.length; i > 0; i--) {
                const elements = this.body.bodyGroup[i - 1].getAllElementsByTypeName(this.elementName);
                for (let j = 0; j < elements.length; j++) {
                    if (elements[j].name === this.elementChipName || this.elementChipName === "") {
                        elements[j].enabled = false;
                    }
                }
            }
        } else {
            const elements = this.body.getAllElementsByTypeName(this.elementName);
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].name === this.elementChipName || this.elementChipName === "") {
                    elements[i].enabled = false;
                }
            }
        }
    }
}

import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { TriggerHandler } from "engine/MessageHandlers";

export class EnableOnTrigger extends LMent implements TriggerHandler {
    triggerId: string;
    elementName: string;
    elementChipName: string;
    receivesTriggersWhenDisabled: boolean | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<EnableOnTrigger> = {}) {
        super(body, id, params);
        this.triggerId = params.triggerId === undefined ? Helpers.NA : params.triggerId;
        this.receivesTriggersWhenDisabled = params.receivesTriggersWhenDisabled === undefined ? false : params.receivesTriggersWhenDisabled;
        this.elementName = params.elementName === undefined ? "" : params.elementName;
        this.elementChipName = params.elementChipName === undefined ? "" : params.elementChipName;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("trigger", this);
    }

    onStart(): void {
    }

    validateElement() {
        return Helpers.ValidateParams(this.triggerId, this, "triggerId");
    }

    hasSubtype(trigger: string): boolean {
        return trigger == this.triggerId;
    }

    onTrigger(source: LMent, triggerId: string): void {
        if (!this.validateElement())
            return;
        this.doEnable();
    }

    doEnable() {
        let element = this.body.getElementByTypeName(this.elementName);
        if (element !== undefined && element.name === this.elementChipName)
            element.enabled = true;
    }
}
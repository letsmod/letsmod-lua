import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { TriggerHandler } from "engine/MessageHandlers";

export class SetEnabledOnTrigger extends LMent implements TriggerHandler {
    triggerId: string;
    elementName: string;
    elementChipName: string;
    setEnabled: boolean;
    receivesTriggersWhenDisabled: boolean | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<SetEnabledOnTrigger> = {}) {
        super(body, id, params);
        this.triggerId = params.triggerId === undefined ? Helpers.NA : params.triggerId;
        this.receivesTriggersWhenDisabled = params.receivesTriggersWhenDisabled === undefined ? false : params.receivesTriggersWhenDisabled;
        this.elementName = params.elementName === undefined ? "" : params.elementName;
        this.elementChipName = params.elementChipName === undefined ? "" : params.elementChipName;
        this.setEnabled = params.setEnabled === undefined ? true : params.setEnabled;
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
        let elements = this.body.getAllElementsByTypeName(this.elementName);
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].name === this.elementChipName || this.elementChipName === "")
                elements[i].enabled = this.setEnabled;
        }
    }
}
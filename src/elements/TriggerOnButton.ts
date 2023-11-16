import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { ButtonHandler } from "engine/MessageHandlers";

export class TriggerOnButton extends LMent implements ButtonHandler {

    triggerId: string;
    triggerContext: "local" | "group" | "global";
    buttonType: string; //"press" | "hold" | "release";
    button: string;


    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("button", this);
        this.enabled = Helpers.ValidateParams(this.triggerId,this,"triggerId");
    }

    onStart(): void {
        
    }

    constructor(body: BodyHandle, id: number, params: Partial<TriggerOnButton> = {}) {
        super(body, id, params);
        this.triggerId = params.triggerId === undefined?Helpers.NA:params.triggerId;
        this.triggerContext = params.triggerContext === undefined ? "local" : params.triggerContext;
        this.buttonType = params.buttonType === undefined ? "press" : params.buttonType;
        this.button = params.button === undefined ? "AButton" : params.button;
    }

    onButtonPress(button: string): void {
        if (this.button === button && this.buttonType.toLowerCase() === "press")
            this.sendTrigger();
    }

    onButtonHold(button: string): void {
        if (this.button == button && this.buttonType.toLowerCase() === "hold")
            this.sendTrigger();
    }

    onButtonRelease(button: string): void {
        if (this.button == button && this.buttonType.toLowerCase() === "release")
            this.sendTrigger();
    }

    hasSubtype(button: string): boolean {
        return button == button;
    }

    sendTrigger() {
        if (Helpers.ValidateParams(this.triggerId,this,"triggerId")) {
            GameplayScene.instance.dispatcher.onTrigger(this, this.triggerId, this.triggerContext);
        }
    }

}
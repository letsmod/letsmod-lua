import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { ActorTappedHandler } from "engine/MessageHandlers";

export class TriggerOnTap extends LMent implements ActorTappedHandler {

    triggerId: string;
    triggerContext: "local" | "group" | "global";


    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("actorTapped", this);
    }

    onStart(): void {
        
    }

    constructor(body: BodyHandle, id: number, params: Partial<TriggerOnTap> = {}) {
        super(body, id, params);
        this.triggerId = params.triggerId === undefined?Helpers.NA:params.triggerId;
        this.triggerContext = params.triggerContext === undefined ? "local" : params.triggerContext;
    }

    onActorTapped(actor: BodyHandle): void {
        this.sendTrigger();
    }

    sendTrigger() {
        if (Helpers.ValidateParams(this.triggerId,this,"triggerId")) {
            GameplayScene.instance.dispatcher.onTrigger(this, this.triggerId, this.triggerContext);
        }
    }

}
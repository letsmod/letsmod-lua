import { EventHandler } from "MODScript/EventHandler";
import { CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class SayAction extends GenericAction {
    sentence: string;
    audioHasPlayed: boolean = false;
    eventHandler: EventHandler | undefined;

    constructor(parentEvent: MODscriptEvent, args: Partial<SayAction>) {
        super(parentEvent, CATs.Say);
        this.sentence = args.sentence ?? "";
        const eventHandler = GameplayScene.instance.eventHandler;
        this.eventHandler = eventHandler;
        if(this.eventHandler)
            this.eventHandler.registerAudioAction(this.ActionId);
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if(!this.eventHandler) {
            this.actionFailed();
            return;
        }
        this.audioHasPlayed = this.eventHandler.playAudioAction(this.ActionId,this.sentence)
        if(!this.audioHasPlayed)
            this.actionFailed();
    }

    monitorAction(): void {
        if(!this.eventHandler) 
        {
            this.actionFailed();
            return;
        }
        console.log("Talking ...");
        if(this.audioHasPlayed && !this.eventHandler.isAudioPlaying(this.ActionId))
            this.actionFinished();
    }
}
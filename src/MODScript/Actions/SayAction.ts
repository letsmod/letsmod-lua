import { EventHandler } from "MODScript/EventHandler";
import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class SayAction extends GenericAction {
    sentence: string;
    constructor(parentEvent: MODscriptEvent, args: Partial<SayAction>) {
        super(parentEvent);
        this.sentence = args.sentence ?? "";
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        console.log(this.sentence);
        this.actionFinished();
    }

    monitorAction(): void {
        
    }
}
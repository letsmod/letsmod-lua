import { EventHandler } from "MODScript/EventHandler";
import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class SayAction extends GenericAction {
    say: string;
    constructor(parentEvent: MODscriptEvent, args: Partial<SayAction>) {
        super(parentEvent);
        this.say = args.say ?? "";
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        console.log(this.say);
        this.actionFinished();
    }

    actionFinishedCallback(): void {

    }

    actionFailedCallback(): void {

    }
}
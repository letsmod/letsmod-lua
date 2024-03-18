import { CATs } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { GenericAction } from "MODScript/MODscriptGenericCATs";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class WaitAction extends GenericAction {
    timeToWait: number;
    eventIdToWaitFor: number;
    event: MODscriptEvent | undefined;

    constructor(parentEvent: MODscriptEvent, args: Partial<WaitAction>) {
        super(parentEvent, CATs.Wait);
        this.timeToWait = args.timeToWait ?? 0;
        this.eventIdToWaitFor = args.eventIdToWaitFor === undefined ? -1 : args.eventIdToWaitFor;
        
        this.event = this.parentEvent.plotlet?.getEvent(this.eventIdToWaitFor);
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (this.eventIdToWaitFor)
            return;

        GameplayScene.instance.dispatcher.queueDelayedFunction(undefined, () => { this.actionFinished(); }, this.timeToWait);
    }

    monitorAction(): void {
        if (this.event && this.event.IsFinished)
            this.actionFinished();
    }
}
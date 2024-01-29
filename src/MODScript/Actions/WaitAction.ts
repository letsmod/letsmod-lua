import { EventHandler } from "MODScript/EventHandler";
import { CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class WaitAction extends GenericAction {
    timeToWait: number;
    
    constructor(parentEvent: MODscriptEvent, args: Partial<WaitAction>) {
        super(parentEvent, CATs.Wait);
        this.timeToWait = args.timeToWait ?? 0;
        
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {      
        GameplayScene.instance.dispatcher.queueDelayedFunction(undefined, () => { this.actionFinished(); }, this.timeToWait);
    }

    monitorAction(): void {
        
    }
}
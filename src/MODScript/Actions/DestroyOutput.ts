import { GenericAction } from "MODScript/MODscriptGenericCATs";
import { CATs } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";

import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class DestroyOutput extends GenericAction {

    constructor(parentEvent: MODscriptEvent, args: Partial<DestroyOutput>) {
        super(parentEvent, CATs.DestroyOutput);
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor)
            return;


        if (triggerOutput) {
            GameplayScene.instance.destroyBody(triggerOutput);
            this.actionFinished();
        }
        else {
            console.log('Cannot find triggerOutput in scene');
            this.actionFailed();
        }

    }

    monitorAction(): void {

    }
}
import { CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class DestroyOther extends GenericAction {
    actorId: number = -1;
    actorName: string = '';
    targetActor: BodyHandle | undefined;

    constructor(parentEvent: MODscriptEvent, args: Partial<DestroyOther>) {
        super(parentEvent, CATs.DestroyOther);
        if (args.actorName)
            this.actorName = args.actorName;
        for (const actor of this.parentEvent.InvolvedActorBodies)
            if (actor.body.name === this.actorName) {
                this.actorId = actor.body.id;
                this.targetActor = actor;
            }
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) return;

        if (this.targetActor) {
            GameplayScene.instance.destroyBody(this.targetActor);
            this.actionFinished();
        }
        else {
            console.log('Cannot find actor with id ' + this.actorId + ' in scene');
            this.actionFailed();
        }

    }
    monitorAction(): void {

    }
}
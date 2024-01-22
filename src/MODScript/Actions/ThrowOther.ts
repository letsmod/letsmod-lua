import { GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";

export class ThrowOther extends GenericAction {
    prefabId: string; //our prefabs are strings?
    actorId: number;

    constructor(eventId:MODscriptEvent, args:Partial<ThrowOther>) {
        super(eventId);
        this.prefabId = args.prefabId ?? "";
        this.actorId = args.actorId ?? 0;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if(!triggerOutput || !this.parentEvent || !this.parentEvent.EventActor) 
            return;

        const targetActor = this.parentEvent.getInvolvedActor(this.actorId);
        if (!targetActor) 
            return;

            let projectile = GameplayScene.instance.clonePrefab(this.prefabId);
            if (projectile === undefined) {
                console.log("No prefab named: " + this.prefabId + " exists in the library.");
                return;
            }
    
            const actor = GameplayScene.instance.getBodyById(this.actorId);
            if (actor === undefined) {
                console.log("No actor with ID: " + this.actorId + " exists.");
                return;
            }

                let position = actor.body.getPosition()?.clone();//.add(offset);

                let spread = Helpers.NewVector3(
                    (Math.random() - 0.5) * 0,
                    (Math.random() - 0.5) * 0,
                    (Math.random() - 0.5) * 0);
                let velocity = 5;
                //let speedFactor = 1 + (Math.random() - 0.5) * 2 * this.speedRandomFactor;
                //velocity.multiplyScalar(speedFactor);
                projectile.body.setVelocity(Helpers.NewVector3(velocity, 0, 0));
                
            this.actionFinished();
    }
    
    actionFinishedCallback(): void {
        
    }

    actionFailedCallback(): void {
        
    }
}
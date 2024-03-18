import { CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { Vector3 } from "three";

export class Instantiate extends GenericAction {
    prefabName: string;
    position: Vector3;

    constructor(parentEvent: MODscriptEvent, args: Partial<Instantiate>) {
        super(parentEvent, CATs.Instantiate);
        this.prefabName = args.prefabName ?? "";
        this.position = args.position === undefined? Helpers.NewVector3(1,1,1): Helpers.ParamToVec3(args.position);
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!this.parentEvent || !this.parentEvent.EventActor) return;

        this.position = this.position.add(this.parentEvent.EventActor.body.getPosition());
         
            let obj = GameplayScene.instance.clonePrefab(this.prefabName);
            if (obj){
                this.parentEvent.InvolvedActorBodies.push(obj);
                this.parentEvent.InvolvedActorIDs.push(obj.body.id);
                obj.body.setPosition(this.position);
                console.log('Instantiated prefab with name ' + this.prefabName + ' in scene at position ' + this.position.x + ', ' + this.position.y + ', ' + this.position.z);
                this.actionFinished();
            }
            else {
                console.log('Cannot find prefab with name ' + this.prefabName + ' in scene');
                this.actionFailed();
            }

        
    }
    monitorAction(): void {

    }
}
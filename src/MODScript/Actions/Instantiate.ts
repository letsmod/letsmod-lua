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
        super(parentEvent, CATs.DestroyOther);
        this.prefabName = args.prefabName ?? "";
        this.position = args.position ?? Helpers.NewVector3(5,5,5);
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
            console.log(this.prefabName+"b6a6a");
        if (!this.parentEvent || !this.parentEvent.EventActor) return;
         
            let obj = GameplayScene.instance.clonePrefab(this.prefabName);
            console.log(obj);
            if (obj){
                obj.body.setPosition(this.position);
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
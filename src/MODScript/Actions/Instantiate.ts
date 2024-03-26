import { CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Constants, Helpers } from "engine/Helpers";
import { Vector3 } from "three";

export class Instantiate extends GenericAction {
    prefabName: string;
    direction: string;
    offset: number;
    position: Vector3 = Helpers.zeroVector;

    constructor(parentEvent: MODscriptEvent, args: Partial<Instantiate>) {
        super(parentEvent, CATs.Instantiate);
        this.prefabName = args.prefabName ?? "";
        this.direction = args.direction ?? Constants.Front;
        this.offset = args.offset ?? 1;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!this.parentEvent || !this.parentEvent.EventActor) return;

        this.position = this.position.add(this.parentEvent.EventActor.body.getPosition());
         
            let obj = GameplayScene.instance.clonePrefab(this.prefabName);
            if (obj){
                obj.body.setPosition(this.getDirectionVector());
                this.actionFinished();
            }
            else {
                console.log('Cannot find prefab with name ' + this.prefabName + ' in scene');
                this.actionFailed();
            }
    }

    getDirectionVector(): Vector3 {
        if(this.parentEvent === undefined || this.parentEvent.EventActor === undefined)
            return Helpers.zeroVector;
        const position = this.parentEvent.EventActor.body.getPosition().clone();
        const orientation = this.parentEvent.EventActor.body.getRotation();
        if(this.direction === Constants.Front) 
            return position.add(Helpers.forwardVector.multiplyScalar(this.offset).applyQuaternion(orientation));
        if(this.direction === Constants.Back)
            return position.add(Helpers.backwardVector.multiplyScalar(this.offset).applyQuaternion(orientation));
        if(this.direction === Constants.Left)
            return position.add(Helpers.leftVector.multiplyScalar(this.offset).applyQuaternion(orientation));
        if(this.direction === Constants.Right)
            return position.add(Helpers.rightVector.multiplyScalar(this.offset).applyQuaternion(orientation));
        if(this.direction === Constants.Up)
            return position.add(Helpers.upVector.multiplyScalar(this.offset).applyQuaternion(orientation));
        if(this.direction === Constants.Down)
            return position.add(Helpers.downVector.multiplyScalar(this.offset).applyQuaternion(orientation));
        
        console.log('Invalid direction ' + this.direction + ' for Instantiate action, using front direction instead.');
        return Helpers.forwardVector.multiplyScalar(this.offset).applyQuaternion(orientation);
    }

    monitorAction(): void {

    }
}
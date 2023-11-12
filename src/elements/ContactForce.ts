import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { global, js_new } from "js";
import { Vector3 } from "three";


export class ContactForce extends LMent implements CollisionHandler
{
    forceValue: number;
    scaleWithMass: boolean;
    forceDirection: Vector3;
    DotMinimum : number | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<ContactForce> = {})
    {
        super(body, id, params);
        this.forceValue = params.forceValue === undefined? 1 : params.forceValue;
        this.scaleWithMass = params.scaleWithMass === undefined ? false : params.scaleWithMass;
        this.forceDirection = params.forceDirection === undefined? js_new(global.THREE.Vector3, 1,0,0): params.forceDirection;
        this.DotMinimum = params.DotMinimum;
    }


    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("collision", this);
    }
    onStart(): void {
        this.forceDirection = js_new(global.THREE.Vector3,this.forceDirection.x,this.forceDirection.y,this.forceDirection.z);
    }
    onCollision(info: CollisionInfo): void {
        let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        if (other !== undefined) {
            
            let forceMagnitude = this.forceValue;
            
    
            let collisionDirection = info.getDeltaVOther().normalize();
            let myUp = js_new(global.THREE.Vector3,0,1,0).applyQuaternion(this.body.body.getRotation()).normalize();
            
            let dotProduct = collisionDirection.dot(myUp);
            let mass = other.body.getMass();
            
            let forceToApply = this.forceDirection.clone().multiplyScalar(forceMagnitude).applyQuaternion(this.body.body.getRotation());
            if (this.DotMinimum == undefined) {
                if (this.scaleWithMass) {
                    other.body.applyCentralForce(forceToApply);
                } else {
                    other.body.applyCentralForce(forceToApply.multiplyScalar(mass));
                }
            }
            else if(dotProduct >= this.DotMinimum){
                if (this.scaleWithMass) {
                    other.body.applyCentralForce(forceToApply);
                } else {
                    other.body.applyCentralForce(forceToApply.multiplyScalar(mass));
                }
            }
        }
    }
}
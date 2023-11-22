import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { HemisphereLightProbe, Vector3 } from "three";
import { Helpers } from "engine/Helpers";
import { GameplayScene } from "engine/GameplayScene";
import { LookAt } from "./LookAt";
import {AlertState, ChaseState,PatrolState} from "./EnemyStates";

class BouncerPatrol extends PatrolState{
    
    bounceTimer:number = 0;
    bounceAfter:number = 0.4;
    bounceForce:number = 250;

    override moveAnimation(dt:number): void {
        this.bounceTimer+= dt;
        if(this.bounceTimer>= this.bounceAfter)
        {
            this.bounceTimer = 0;
            this.stateMachine.body.body.applyCentralForce(Helpers.upVector.multiplyScalar(this.bounceForce*this.stateMachine.body.body.getMass()));
        }
    }

    override idleAnimation(): void {
        this.bounceTimer = 0;
    }
}

class BouncerChase extends ChaseState{
    bounceTimer:number = 0;
    bounceAfter:number = 0.4;
    bounceForce:number = 250;

    override chaseAnimation(dt:number): void {
        this.bounceTimer+= dt;
        if(this.bounceTimer>= this.bounceAfter)
        {
            this.bounceTimer = 0;
            this.stateMachine.body.body.applyCentralForce(Helpers.upVector.multiplyScalar(this.bounceForce*this.stateMachine.body.body.getMass()));
        }
    }
}

class BouncerAlert extends AlertState{

}

export class BouncerEnemy extends StateMachineLMent {
    patrolDistance: number;
    patrolSpeed: number;
    patrolDelay: number;
    chaseSpeed: number;
    detectionRadius: number;
    alertCooldown:number;

    private lookAtElement: LookAt | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<BouncerEnemy> = {}) {
        super(body, id, params);
        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.patrolSpeed = params.patrolSpeed === undefined ? 1 : params.patrolSpeed;
        this.chaseSpeed = params.chaseSpeed === undefined ? 1 : params.chaseSpeed;
        this.patrolDelay = params.patrolDelay === undefined ? 1 : params.patrolDelay;
        this.detectionRadius = params.detectionRadius === undefined ? 3 : params.detectionRadius;
        this.alertCooldown = params.alertCooldown === undefined?3:params.alertCooldown;
    }

    onInit() {

        this.lookAtElement = this.body.getElement(LookAt);
        if (this.lookAtElement === undefined)
            console.log("No LookAt Element is found, it's needed for slime to work.");

        if(this.lookAtElement===undefined) return;
        let point1 = this.body.body.getPosition().clone();
        let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()))

        this.states = {
            "patrolForward": new BouncerPatrol("patrolForward", this, point1, point2, this.patrolSpeed, this.patrolDelay, this.detectionRadius, this.lookAtElement),
            "patrolBackward": new BouncerPatrol("patrolBackward", this, point2, point1, this.patrolSpeed, this.patrolDelay, this.detectionRadius,this.lookAtElement),
            "chase": new BouncerChase("chase", this, this.chaseSpeed,this.detectionRadius, this.lookAtElement),
            "alert": new BouncerAlert("alert",this,0,this.detectionRadius,this.alertCooldown,this.lookAtElement)
        }

        this.switchState("patrolForward");
    }

    onStart() {
    }
}

import { BodyHandle } from "engine/BodyHandle";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { Helpers } from "engine/Helpers";
import { LookAt } from "./LookAt";
import { ChaseState, PatrolState,AlertState } from "./EnemyStates";
import { ShapeStateController } from "./ShapeStateController";
import { FloatType, Vector3 } from "three";

class WalkerPatrol extends PatrolState {

    override moveAnimation(dt: number): void {
        if (this.anim !== undefined)
            this.anim.playState("walk");
    }

    override idleAnimation(): void {
        if (this.anim !== undefined)
            this.anim.playState("idle");
    }
}

class WalkerChase extends ChaseState {

    override chaseAnimation(dt: number): void {
        if (this.anim !== undefined)
            this.anim.playState("chase");
    }
}


class WalkerAlert extends AlertState{

    override alertAnimation(dt: number): void {
        if(this.anim !== undefined)
            this.anim.playState("idle")
    }
}

export class WalkerEnemy extends StateMachineLMent {
    patrolDistance: number;
    patrolSpeed: number;
    patrolDelay: number;
    chaseSpeed: number;
    detectionRadius: number;
    alertCooldown: number;

    private lookAtElement: LookAt | undefined;
    constructor(body: BodyHandle, id: number, params: Partial<WalkerEnemy> = {}) {
        super(body, id, params);
        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.patrolSpeed = params.patrolSpeed === undefined ? 1 : params.patrolSpeed;
        this.chaseSpeed = params.chaseSpeed === undefined ? 1 : params.chaseSpeed;
        this.patrolDelay = params.patrolDelay === undefined ? 1 : params.patrolDelay;
        this.detectionRadius = params.detectionRadius === undefined ? 3 : params.detectionRadius;
        this.alertCooldown = params.alertCooldown === undefined ? 3 : params.alertCooldown;
    }

    onInit() {

        this.lookAtElement = this.body.getElement(LookAt);
        if (this.lookAtElement === undefined)
        {
            console.log("No LookAt Element is found, it's needed for a walker enemy to work.");
            return;
        }

        let point1 = this.body.body.getPosition().clone();
        let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()))

        this.states = {
            "patrolForward": new WalkerPatrol("patrolForward", this, point1, point2, this.patrolSpeed, this.patrolDelay, this.detectionRadius),
            "patrolBackward": new WalkerPatrol("patrolBackward", this, point2, point1, this.patrolSpeed, this.patrolDelay, this.detectionRadius),
            "chase": new WalkerChase("chase", this, this.chaseSpeed, this.detectionRadius),
            "alert": new WalkerAlert("alert",this,0,this.detectionRadius,this.alertCooldown)
        }

        this.switchState("patrolForward");
    }

    onStart() {
        this.body.body.setAngularVelocity(Helpers.zeroVector);
        this.body.body.setVelocity(Helpers.zeroVector);
    }
}

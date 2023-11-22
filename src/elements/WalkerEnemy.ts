import { BodyHandle } from "engine/BodyHandle";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { Helpers } from "engine/Helpers";
import { LookAt } from "./LookAt";
import { ChaseState, PatrolState,AlertState } from "./EnemyStates";
import { ShapeStateController } from "./ShapeStateController";
import { FloatType, Vector3 } from "three";

class WalkerPatrol extends PatrolState {

    private anim: ShapeStateController | undefined;

    constructor(name: string, stateMachine: StateMachineLMent,
        startPosition: Vector3, endPosition: Vector3, speed: number,
        patrolDelay: number, detectionRadius: number, lookAt: LookAt,
        animator: ShapeStateController | undefined) {

        super(name, stateMachine, startPosition, endPosition, speed, patrolDelay, detectionRadius, lookAt);
        this.anim = animator;
    }

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
    private anim: ShapeStateController | undefined;

    constructor(name:string, stateMachine: StateMachineLMent, speed: number,
        chaseRange: number, lookAt: LookAt, 
        animator: ShapeStateController | undefined) {

        super(name, stateMachine, speed, chaseRange, lookAt);
        this.anim = animator;
    }

    override chaseAnimation(dt: number): void {
        if (this.anim !== undefined)
            this.anim.playState("chase");
    }
}


class WalkerAlert extends AlertState{

    private anim: ShapeStateController | undefined;

    constructor(name:string, stateMachine: StateMachineLMent, speed: number, chaseRange: number, alertCooldown: number, lookAt: LookAt, animator: ShapeStateController | undefined) {
        super(name, stateMachine, speed,chaseRange,alertCooldown,lookAt)
        this.anim = animator;
    }

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
    private animator: ShapeStateController | undefined;

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
            console.log("No LookAt Element is found, it's needed for enemy to work.");

        this.animator = this.body.getElement(ShapeStateController);
        if (this.animator === undefined)
            console.log("No ShapeStateController Element is found, this would prevent animations from playing.");

        if (this.lookAtElement === undefined) return;

        let point1 = this.body.body.getPosition().clone();
        let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()))

        this.states = {
            "patrolForward": new WalkerPatrol("patrolForward", this, point1, point2, this.patrolSpeed, this.patrolDelay, this.detectionRadius, this.lookAtElement, this.animator),
            "patrolBackward": new WalkerPatrol("patrolBackward", this, point2, point1, this.patrolSpeed, this.patrolDelay, this.detectionRadius, this.lookAtElement, this.animator),
            "chase": new WalkerChase("chase", this, this.chaseSpeed, this.detectionRadius, this.lookAtElement, this.animator),
            "alert": new WalkerAlert("alert",this,0,this.detectionRadius,this.alertCooldown,this.lookAtElement,this.animator)
        }

        this.switchState("patrolForward");
    }

    onStart() {
    }
}

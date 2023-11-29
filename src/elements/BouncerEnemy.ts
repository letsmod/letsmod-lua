import { BodyHandle } from "engine/BodyHandle";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { Helpers } from "engine/Helpers";
import { LookAt } from "./LookAt";
import { EnemyAlertState, EnemyChaseState, EnemyIdleState, EnemyPatrolState, EnemyStates } from "./EnemyStates";

class BouncerPatrol extends EnemyPatrolState {

    bounceTimer: number = 0;
    bounceAfter: number = 0.4;
    bounceForce: number = 250;

    override playStateAnimation(dt: number): void {
        this.bounceTimer += dt;
        if (this.bounceTimer >= this.bounceAfter) {
            this.bounceTimer = 0;
            this.stateMachine.body.body.applyCentralForce(Helpers.upVector.multiplyScalar(this.bounceForce * this.stateMachine.body.body.getMass()));
        }
    }
}

class BouncerChase extends EnemyChaseState {
    bounceTimer: number = 0;
    bounceAfter: number = 0.4;
    bounceForce: number = 250;

    override playStateAnimation(dt: number): void {
        this.bounceTimer += dt;
        if (this.bounceTimer >= this.bounceAfter) {
            this.bounceTimer = 0;
            this.stateMachine.body.body.applyCentralForce(Helpers.upVector.multiplyScalar(this.bounceForce * this.stateMachine.body.body.getMass()));
        }
    }
}

export class BouncerEnemy extends StateMachineLMent {
    patrolDistance: number;
    patrolSpeed: number;
    idleDelay: number;
    chaseSpeed: number;
    alertZoneRadius: number;
    alertCooldown: number;
    alertWarmUp:number;
    movementForce:number;

    private lookAtElement: LookAt | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<BouncerEnemy> = {}) {
        super(body, id, params);
        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.patrolSpeed = params.patrolSpeed === undefined ? 1 : params.patrolSpeed;
        this.chaseSpeed = params.chaseSpeed === undefined ? 1 : params.chaseSpeed;
        this.idleDelay = params.idleDelay === undefined ? 1 : params.idleDelay;
        this.alertZoneRadius = params.alertZoneRadius === undefined ? 3 : params.alertZoneRadius;
        this.alertCooldown = params.alertCooldown === undefined ? 2 : params.alertCooldown;
        this.alertWarmUp = params.alertWarmUp === undefined ? 0.2 : params.alertWarmUp;
        this.movementForce = params.movementForce === undefined ? 25 : params.movementForce;
    }

    onInit() {

        let point1 = this.body.body.getPosition().clone();
        let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()))

        this.states = {
            [EnemyStates.patrol]: new BouncerPatrol(this, [point1, point2], this.patrolSpeed,this.alertZoneRadius,this.movementForce),
            [EnemyStates.chase]: new BouncerChase(this, this.chaseSpeed, this.alertZoneRadius,this.movementForce),
            [EnemyStates.alert]: new EnemyAlertState(this,this.alertZoneRadius,this.alertCooldown,this.alertWarmUp,EnemyStates.chase),
            [EnemyStates.idle]: new EnemyIdleState(this,this.alertZoneRadius,this.idleDelay)
        }

        this.switchState(EnemyStates.patrol);
    }

    onStart() {
    }
}

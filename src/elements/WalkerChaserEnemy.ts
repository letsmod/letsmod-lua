import { BodyHandle } from "engine/BodyHandle";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { Helpers } from "engine/Helpers";
import { LookAt } from "./LookAt";
import { EnemyChaseState, EnemyPatrolState,EnemyAlertState, EnemyIdleState, EnemyStates } from "./EnemyStates";

class WalkerPatrol extends EnemyPatrolState {

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("walk");
    }
}

class WalkerChase extends EnemyChaseState {

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("chase");
    }
}


class WalkerAlert extends EnemyAlertState{

    override playStateAnimation(dt: number): void {
        if(this.anim)
            this.anim.playState("idle")
    }
}

class WalkerIdle extends EnemyIdleState{
    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("idle");
    }
}

export class WalkerChaserEnemy extends StateMachineLMent {
    idleCooldown: number;
    patrolDistance: number;
    patrolSpeed: number;
    chaseSpeed: number;
    alertZoneRadius: number;
    alertCooldown: number;
    alertWarmUp:number;

    private lookAtElement: LookAt | undefined;
    constructor(body: BodyHandle, id: number, params: Partial<WalkerChaserEnemy> = {}) {
        super(body, id, params);
        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.patrolSpeed = params.patrolSpeed === undefined ? 1 : params.patrolSpeed;
        this.chaseSpeed = params.chaseSpeed === undefined ? 1.2 : params.chaseSpeed;
        this.idleCooldown = params.idleCooldown === undefined ? 1 : params.idleCooldown;
        this.alertZoneRadius = params.alertZoneRadius === undefined ? 5 : params.alertZoneRadius;
        this.alertCooldown = params.alertCooldown === undefined ? 3 : params.alertCooldown;
        this.alertWarmUp = params.alertWarmUp === undefined ? 0 : params.alertWarmUp;
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
            [EnemyStates.patrol]: new WalkerPatrol(this, [point1, point2], this.patrolSpeed,this.alertZoneRadius),
            [EnemyStates.chase]: new WalkerChase(this, this.chaseSpeed, this.alertZoneRadius),
            [EnemyStates.alert]: new WalkerAlert(this,this.alertZoneRadius,this.alertCooldown,this.alertWarmUp,EnemyStates.chase),
            [EnemyStates.idle]: new WalkerIdle(this,this.alertZoneRadius,this.idleCooldown)
        }

        this.switchState(EnemyStates.patrol);
    }

    onStart() {
        this.body.body.lockRotation(true,false,true);
        this.body.body.setAngularVelocity(Helpers.zeroVector);
        this.body.body.setVelocity(Helpers.zeroVector);
    }
}

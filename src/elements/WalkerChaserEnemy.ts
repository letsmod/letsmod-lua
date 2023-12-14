import { BodyHandle } from "engine/BodyHandle";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { Helpers } from "engine/Helpers";
import { LookAt } from "./LookAt";
import {EnemyChaseState, EnemyAlertState, CharacterStates, characterIdleState, characterPatrolState, CharacterStateMachineLMent } from "./CharacterStates";

class WalkerPatrol extends characterPatrolState {

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("walk");
    }

    override alertCondition(): boolean {
        return super.alertCondition() && this.playerInSight();
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

    override alertCondition(): boolean {
        return super.alertCondition() && this.playerInSight();
    }
}

class WalkerIdle extends characterIdleState{
    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("idle");
    }

    override alertCondition(): boolean {
        return super.alertCondition() && this.playerInSight();
    }
}

export class WalkerChaserEnemy extends CharacterStateMachineLMent {
    idleCooldown: number;
    patrolDistance: number;
    patrolSpeed: number;
    chaseSpeed: number;
    alertCooldown: number;
    alertWarmUp:number;
    movementForce:number;

    constructor(body: BodyHandle, id: number, params: Partial<WalkerChaserEnemy> = {}) {
        super(body, id, params);
        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.patrolSpeed = params.patrolSpeed === undefined ? 1 : params.patrolSpeed;
        this.chaseSpeed = params.chaseSpeed === undefined ? 1.2 : params.chaseSpeed;
        this.idleCooldown = params.idleCooldown === undefined ? 1 : params.idleCooldown;
        this.alertCooldown = params.alertCooldown === undefined ? 3 : params.alertCooldown;
        this.alertWarmUp = params.alertWarmUp === undefined ? 0 : params.alertWarmUp;
        this.movementForce = params.movementForce === undefined ? 100 : params.movementForce;

        //zombie zone radius = 5
    }

    onInit() {
        super.onInit();
        
        let point1 = this.body.body.getPosition().clone();
        let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()))

        this.states = {
            [CharacterStates.patrol]: new WalkerPatrol(this, [point1, point2], this.patrolSpeed,this.movementForce),
            [CharacterStates.chase]: new WalkerChase(this, this.chaseSpeed, this.movementForce),
            [CharacterStates.alert]: new WalkerAlert(this,this.alertCooldown,this.alertWarmUp,CharacterStates.chase),
            [CharacterStates.idle]: new WalkerIdle(this,this.idleCooldown)
        }

        this.switchState(CharacterStates.patrol);
    }

    onStart() {
        this.body.body.lockRotation(true,false,true);
        this.body.body.setAngularVelocity(Helpers.zeroVector);
        this.body.body.setVelocity(Helpers.zeroVector);
    }
}

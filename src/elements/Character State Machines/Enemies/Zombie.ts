import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";

import { CharacterStates, EnemyAlertState, EnemyChaseState, StateTransitionManager, StateTransitionRule, characterPatrolState } from "elements/Character State Machines/CharacterStates";
import { UpdateHandler } from "engine/MessageHandlers";
import { Enemy } from "./Enemy";
import { MODscriptThrowState } from "../MODscriptStates";


class ZombiePatrol extends characterPatrolState {

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState(this.inSubIdle?"idle":"walk");
    }
}

class ZombieChase extends EnemyChaseState {

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState("chase");
    }
}

class ZombieAlert extends EnemyAlertState{

    override playCustomAnimation(dt: number): void {
        if(this.customAnimator)
            this.customAnimator.playState("idle")
    }
}


export class Zombie extends Enemy implements UpdateHandler {

    throwForce: number;
    patrolWait: number;
    patrolDistance: number;

    //NOTE: The parent class has more properties as below:
    /*
        movementForce
        maxNormalSpeed
        maxFastSpeed
        alertZoneRadius
        interactZoneRadius
        sightDotValue
        normalMoveAnim
        fastMoveAnim
        idleAnim
        alertAnim
        alertCooldown
        alertWarmUp
    */

    constructor(body: BodyHandle, id: number, params: Partial<Zombie> = {}) {
        super(body, id, params);
        this.throwForce = params.throwForce === undefined ? 400 : params.throwForce;
        this.patrolWait = params.patrolWait === undefined ? 1 : params.patrolWait;
        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.movementForce = params.movementForce === undefined ? 100 : params.movementForce;

        const rules: StateTransitionRule[] = [
            {
                fromState: CharacterStates.alert,
                toState: CharacterStates.patrol,
                condition: () => {return !this.playerInAlertRange() && !this.alertIsCoolingDown;}
            },
            {
                fromState: CharacterStates.alert,
                toState: CharacterStates.chase,
                condition: () => {return this.playerInAlertRange() && !this.alertIsWarmingUp;}
            },
            {
                fromState: CharacterStates.patrol,
                toState: CharacterStates.alert,
                condition: () => {return this.playerInAlertRange() && this.playerInSight()}
            },
            {
                fromState: CharacterStates.patrol,
                toState: CharacterStates.chase,
                condition: () => {return this.playerInAlertRange() && this.alertCooldownTimer>0}
            },
            {
                fromState: CharacterStates.chase,
                toState: CharacterStates.alert,
                condition: () => {return !this.playerInAlertRange() && !this.alertIsCoolingDown}
            }
        ];

        this.transitionManager = new StateTransitionManager(rules);
    }

    onInit() {
        super.onInit();

        let point1 = this.body.body.getPosition().clone();
        let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()))

        this.states = {
            [CharacterStates.throw]: new MODscriptThrowState(this, this.throwForce),
            [CharacterStates.patrol]: new ZombiePatrol(this, [point1, point2], this.patrolWait,this.normalMoveAnim, this.idleAnim),
            [CharacterStates.chase]: new ZombieChase(this,this.fastMoveAnim),
            [CharacterStates.alert]: new ZombieAlert(this,this.idleAnim),
        }

        this.switchState(CharacterStates.patrol);
    }

    onStart() {
        this.body.body.lockRotation(true, false, true);
        this.body.body.setAngularVelocity(Helpers.zeroVector);
        this.body.body.setVelocity(Helpers.zeroVector);
    }
    
}

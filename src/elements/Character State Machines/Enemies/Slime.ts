import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";

import { CharacterStates, EnemyAlertState, EnemyChaseState, StateTransitionManager, StateTransitionRule, characterPatrolState } from "elements/Character State Machines/CharacterStates";
import { UpdateHandler } from "engine/MessageHandlers";
import { Enemy } from "./Enemy";
import { MODscriptThrowState } from "../MODscriptStates";


class SlimePatrol extends characterPatrolState {

    bounceTimer: number = 0;
    bounceAfter: number = 0.4;
    bounceForce: number = 250;

    override playCustomAnimation(dt: number): void {
        if (this.inSubIdle) return;
        this.bounceTimer += dt;
        if (this.bounceTimer >= this.bounceAfter) {
            this.bounceTimer = 0;
            this.stateMachine.body.body.applyCentralForce(Helpers.upVector.multiplyScalar(this.bounceForce * this.stateMachine.body.body.getMass()));
            this.stateMachine.body.body.setAngularVelocity(Helpers.zeroVector);
        }
    }
}

class SlimeChase extends EnemyChaseState {
    bounceTimer: number = 0;
    bounceAfter: number = 0.4;
    bounceForce: number = 250;
    
    override playCustomAnimation(dt: number): void {
        this.bounceTimer += dt;
        if (this.bounceTimer >= this.bounceAfter) {
            this.bounceTimer = 0;
            this.stateMachine.body.body.applyCentralForce(Helpers.upVector.multiplyScalar(this.bounceForce * this.stateMachine.body.body.getMass()));
            this.stateMachine.body.body.setAngularVelocity(Helpers.zeroVector);
        }
    }
}


export class Slime extends Enemy implements UpdateHandler {

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

    constructor(body: BodyHandle, id: number, params: Partial<Slime> = {}) {
        super(body, id, params);
        this.throwForce = params.throwForce === undefined ? 400 : params.throwForce;
        this.patrolWait = params.patrolWait === undefined ? 1 : params.patrolWait;
        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.movementForce = params.movementForce === undefined ? 100 : params.movementForce;
        this.moveReachThreshold = 0.5;

        const rules: StateTransitionRule[] = [
            {
                fromState: CharacterStates.alert,
                toState: CharacterStates.patrol,
                condition: () => { return !this.playerInAlertRange() && !this.alertIsCoolingDown; }
            },
            {
                fromState: CharacterStates.alert,
                toState: CharacterStates.chase,
                condition: () => { return this.playerInAlertRange() && !this.alertIsWarmingUp; }
            },
            {
                fromState: CharacterStates.patrol,
                toState: CharacterStates.alert,
                condition: () => { return this.playerInAlertRange() }
            },
            {
                fromState: CharacterStates.patrol,
                toState: CharacterStates.chase,
                condition: () => { return this.playerInAlertRange() && this.alertCooldownTimer > 0 }
            },
            {
                fromState: CharacterStates.chase,
                toState: CharacterStates.alert,
                condition: () => { return !this.playerInAlertRange() && !this.alertIsCoolingDown }
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
            [CharacterStates.patrol]: new SlimePatrol(this, [point1, point2], this.patrolWait, this.normalMoveAnim, this.idleAnim),
            [CharacterStates.chase]: new SlimeChase(this, this.fastMoveAnim),
            [CharacterStates.alert]: new EnemyAlertState(this, this.idleAnim),
        }

        this.switchState(CharacterStates.patrol);
    }
}

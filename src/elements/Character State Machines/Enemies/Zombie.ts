import { BodyHandle } from "engine/BodyHandle";
import { Constants, Helpers } from "engine/Helpers";

import { CharacterStateNames, StateTransitionManager, StateTransitionRule, characterPatrolState } from "elements/Character State Machines/CharacterStates";
import { UpdateHandler } from "engine/MessageHandlers";
import { AbstractEnemyLMent } from "./AbstractEnemyLMent";
import { EnemyAlertState, EnemyChaseState } from "../EnemyStates";

class ZombiePatrol extends characterPatrolState {

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState(this.inSubIdle ? "idle" : "walk");

        if (this.sound !== undefined)
            this.sound.playAudio();
    }
}

class ZombieChase extends EnemyChaseState {

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState("chase");

        if (this.sound !== undefined)
            this.sound.playAudio();
    }
}

class ZombieAlert extends EnemyAlertState {

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState("idle")
    }
}


export class Zombie extends AbstractEnemyLMent implements UpdateHandler {

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
        this.patrolWait = params.patrolWait === undefined ? 1 : params.patrolWait;
        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.moveReachThreshold = 1;

        const rules: StateTransitionRule[] = [
            {
                fromState: CharacterStateNames.alert,
                toState: CharacterStateNames.patrol,
                condition: () => { return !this.playerInAlertRange() && !this.alertIsCoolingDown; }
            },
            {
                fromState: CharacterStateNames.alert,
                toState: CharacterStateNames.chase,
                condition: () => { return this.playerInAlertRange() && !this.alertIsWarmingUp; }
            },
            {
                fromState: CharacterStateNames.patrol,
                toState: CharacterStateNames.alert,
                condition: () => { return this.playerInAlertRange() && this.playerInSight() }
            },
            {
                fromState: CharacterStateNames.patrol,
                toState: CharacterStateNames.chase,
                condition: () => { return this.playerInAlertRange() && this.alertCooldownTimer > 0 }
            },
            {
                fromState: CharacterStateNames.chase,
                toState: CharacterStateNames.alert,
                condition: () => { return !this.playerInAlertRange() && !this.alertIsCoolingDown }
            }
        ];

        this.transitionManager = new StateTransitionManager(rules);
    }

    onInit() {
        super.onInit();

        let point1 = this.body.body.getPosition().clone();
        let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()));

        this.states = {
            ...this.MODscriptStates,
            [CharacterStateNames.patrol]: new ZombiePatrol(this, [point1, point2], this.patrolWait, this.normalMoveAnim, this.idleAnim),
            [CharacterStateNames.chase]: new ZombieChase(this, this.fastMoveAnim),
            [CharacterStateNames.alert]: new ZombieAlert(this, this.idleAnim),
        }

        this.switchState(CharacterStateNames.patrol);
    }

}

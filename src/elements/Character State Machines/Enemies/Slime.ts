import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";
import { CharacterStateNames, StateTransitionManager, StateTransitionRule, characterPatrolState } from "elements/Character State Machines/CharacterStates";
import { UpdateHandler } from "engine/MessageHandlers";
import { AbstractEnemyLMent } from "./AbstractEnemyLMent";
import { EnemyChaseState, EnemyAlertState } from "../EnemyStates";


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

            if(this.sound !== undefined)
                this.sound.playAudio();
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

            if(this.sound !== undefined)
                this.sound.playAudio();
        }
    }
}


export class Slime extends AbstractEnemyLMent implements UpdateHandler {

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
        this.patrolWait = params.patrolWait === undefined ? 1 : params.patrolWait;
        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.moveReachThreshold = 0.5;

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
                condition: () => { return this.playerInAlertRange() }
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
        let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()))

        this.states = {
            ...this.MODscriptStates,
            [CharacterStateNames.patrol]: new SlimePatrol(this, [point1, point2], this.patrolWait, this.normalMoveAnim, this.idleAnim),
            [CharacterStateNames.chase]: new SlimeChase(this, this.fastMoveAnim),
            [CharacterStateNames.alert]: new EnemyAlertState(this, this.idleAnim),
        }

        this.switchState(CharacterStateNames.patrol);
    }
}

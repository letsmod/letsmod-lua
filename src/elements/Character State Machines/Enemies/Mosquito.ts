import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";
import { characterPatrolState, CharacterStateNames, StateTransitionManager, StateTransitionRule } from "../CharacterStates";
import { CollisionInfo } from "engine/MessageHandlers";
import { AbstractEnemyLMent } from "./AbstractEnemyLMent";
import { EnemyAlertState, EnemyChargeState } from "../EnemyStates";

class FlyingPatrol extends characterPatrolState {

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState("fly");
    }
}

class FlyingAlert extends EnemyAlertState{

    override playCustomAnimation(dt: number): void {
        if(this.customAnimator)
            this.customAnimator.playState("alert")
    }
}

class FlyingCharge extends EnemyChargeState{

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState("charge");
    }

    onCollision(info: CollisionInfo): void {
        this.stateMachine.switchState(CharacterStateNames.alert);
    }
}

export class Mosquito extends AbstractEnemyLMent {
    
    patrolDistance: number;
    patrolWait: number;
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
        attackAnim
        alertCooldown
        alertWarmUp
    */

    constructor(body: BodyHandle, id: number, params: Partial<Mosquito> = {}) {
        super(body, id, params);
        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.patrolWait = params.patrolWait === undefined ? 1 : params.patrolWait;
        this.has3DMovement = true;
        this.moveReachThreshold = 0.8;

        const rules: StateTransitionRule[] = [
            {
                fromState: CharacterStateNames.alert,
                toState: CharacterStateNames.patrol,
                condition: () => { return !this.playerInAlertRange() && !this.alertIsCoolingDown; }
            },
            {
                fromState: CharacterStateNames.alert,
                toState: CharacterStateNames.charge,
                condition: () => { return this.playerInAlertRange() && !this.alertIsWarmingUp; }
            },
            {
                fromState: CharacterStateNames.patrol,
                toState: CharacterStateNames.alert,
                condition: () => { return this.playerInAlertRange() }
            },
            {
                fromState: CharacterStateNames.patrol,
                toState: CharacterStateNames.charge,
                condition: () => { return this.playerInAlertRange() && this.alertCooldownTimer > 0 }
            },
            {
                fromState: CharacterStateNames.charge,
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
            [CharacterStateNames.patrol]: new FlyingPatrol(this, [point1, point2], this.patrolWait,this.normalMoveAnim,this.idleAnim),
            [CharacterStateNames.alert]: new FlyingAlert(this,this.alertAnim),
            [CharacterStateNames.charge]: new FlyingCharge(this, this.attackAnim)
        }

        this.switchState(CharacterStateNames.patrol);
    }

    onStart() {
        super.onStart();
        this.body.body.setCustomGravity(Helpers.zeroVector);
    }
}

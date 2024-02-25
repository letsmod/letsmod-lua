import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";
import { characterPatrolState, CharacterStates, StateTransitionManager, StateTransitionRule } from "../CharacterStates";
import { CollisionInfo } from "engine/MessageHandlers";
import { Enemy } from "./Enemy";
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
        this.stateMachine.switchState(CharacterStates.alert);
    }
}

export class Mosquito extends Enemy {
    
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
                fromState: CharacterStates.alert,
                toState: CharacterStates.patrol,
                condition: () => { return !this.playerInAlertRange() && !this.alertIsCoolingDown; }
            },
            {
                fromState: CharacterStates.alert,
                toState: CharacterStates.charge,
                condition: () => { return this.playerInAlertRange() && !this.alertIsWarmingUp; }
            },
            {
                fromState: CharacterStates.patrol,
                toState: CharacterStates.alert,
                condition: () => { return this.playerInAlertRange() }
            },
            {
                fromState: CharacterStates.patrol,
                toState: CharacterStates.charge,
                condition: () => { return this.playerInAlertRange() && this.alertCooldownTimer > 0 }
            },
            {
                fromState: CharacterStates.charge,
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
            [CharacterStates.patrol]: new FlyingPatrol(this, [point1, point2], this.patrolWait,this.normalMoveAnim,this.idleAnim),
            [CharacterStates.alert]: new FlyingAlert(this,this.alertAnim),
            [CharacterStates.charge]: new FlyingCharge(this, this.attackAnim)
        }

        this.switchState(CharacterStates.patrol);
    }

    onStart() {
        super.onStart();
        this.body.body.setCustomGravity(Helpers.zeroVector);
    }
}

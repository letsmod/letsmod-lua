import { BodyHandle } from "engine/BodyHandle";
import { CharacterStates, EnemyAlertState, EnemyChaseState, StateTransitionManager, StateTransitionRule, characterPatrolState } from "../CharacterStates";
import { Enemy } from "./Enemy";
import { Slime } from "elements/Character State Machines/Enemies/Slime";
import { MODscriptThrowState } from "../MODscriptStates";

export class SkullEnemy extends Enemy {

    throwForce: number;

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
        this.movementForce = 100;
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
        let initQuat = this.body.body.getRotation().clone();
        this.states = {
            [CharacterStates.throw]: new MODscriptThrowState(this, this.throwForce),
            [CharacterStates.patrol]: new characterPatrolState(this, [point1],0,this.normalMoveAnim,this.idleAnim),
            [CharacterStates.chase]: new EnemyChaseState(this,this.fastMoveAnim),
            [CharacterStates.alert]: new EnemyAlertState(this,this.idleAnim)
        }

        this.switchState(CharacterStates.patrol);
    }
}

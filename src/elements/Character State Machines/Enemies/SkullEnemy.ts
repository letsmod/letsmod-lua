import { BodyHandle } from "engine/BodyHandle";
import { CharacterStateNames, StateTransitionManager, StateTransitionRule, characterPatrolState } from "../CharacterStates";
import { AbstractEnemyLMent } from "./AbstractEnemyLMent";
import { Slime } from "elements/Character State Machines/Enemies/Slime";
import { EnemyAlertState, EnemyChaseState } from "../EnemyStates";

export class SkullEnemy extends AbstractEnemyLMent {

    //NOTE: The parent class has more properties as below:
    /*
        movementForce
        maxNormalSpeed
        maxFastSpeed
        throwForce
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
        this.movementForce = 100;
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
        let initQuat = this.body.body.getRotation().clone();

        this.states = {
            ...this.MODscriptStates,
            [CharacterStateNames.patrol]: new characterPatrolState(this, [point1], 0, this.normalMoveAnim, this.idleAnim),
            [CharacterStateNames.chase]: new EnemyChaseState(this, this.fastMoveAnim),
            [CharacterStateNames.alert]: new EnemyAlertState(this, this.idleAnim)
        }

        this.switchState(CharacterStateNames.patrol);
    }
}

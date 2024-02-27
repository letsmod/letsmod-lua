import { BodyHandle } from "engine/BodyHandle";
import { State } from "engine/StateMachineLMent";
import { LookAt } from "../../LookAt";
import { Helpers } from "engine/Helpers";
import { Vector3 } from "three";
import { characterPatrolState, characterAlertState, characterInteractState, CharacterStateNames, StateTransitionRule, StateTransitionManager } from "../CharacterStates";
import { CharacterStateMachineLMent } from "../CharacterStateMachineLMent";

class RoamerPatrol extends characterPatrolState {
    private patrolAreaBounds: { min: Vector3, max: Vector3 };
    private idleDurationRange: { min: number, max: number };
    private initialPoint: Vector3;

    constructor(stateMachine: CharacterStateMachineLMent, patrolAreaBounds: { min: Vector3, max: Vector3 }, idleDurationRange: { min: number, max: number }, patrolSpeed: number, roamForce: number, initialposition: Vector3, patrolAnim: string = "custom", waitPatrolAnim: string = "custom") {
        super(stateMachine, [], patrolSpeed, patrolAnim,waitPatrolAnim);
        patrolAreaBounds.min = Helpers.ParamToVec3(patrolAreaBounds.min);
        patrolAreaBounds.max = Helpers.ParamToVec3(patrolAreaBounds.max);
        this.initialPoint = initialposition;
        this.patrolAreaBounds = patrolAreaBounds;
        this.idleDurationRange = idleDurationRange;
        this.patrolWait = this.getRandomIdleDuration(this.idleDurationRange);
        this.setRandomPatrolPoint(this.patrolAreaBounds);
    }

    setRandomPatrolPoint(bounds: { min: Vector3, max: Vector3 }) {

        const point1 = Helpers.NewVector3(
            this.initialPoint.x + Helpers.randomRange(bounds.min.x, bounds.max.x),
            this.initialPoint.y + Helpers.randomRange(bounds.min.y, bounds.max.y),
            this.initialPoint.z + Helpers.randomRange(bounds.min.z, bounds.max.z)
        );

        const point2 = Helpers.NewVector3(
            this.initialPoint.x + Helpers.randomRange(bounds.min.x, bounds.max.x),
            this.initialPoint.y + Helpers.randomRange(bounds.min.y, bounds.max.y),
            this.initialPoint.z + Helpers.randomRange(bounds.min.z, bounds.max.z)
        );

        this.points = [point1, point2];
        this.onEnterState(undefined);
    }

    getRandomIdleDuration(range: { min: number, max: number }) {
        return Helpers.randomRange(range.min, range.max);
    }

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator) {
            if (this.inSubIdle) {
                this.customAnimator.playState("idle");
            } else {
                this.customAnimator.playState("walk");
            }
        }
    }

    override onUpdate(dt: number): void {
        super.onUpdate(dt);
    }
    subIdleAction(): void {
        super.subIdleAction();
        this.patrolWait = this.getRandomIdleDuration(this.idleDurationRange);
        if (this.currentPointIndex == this.points.length - 1)
            this.setRandomPatrolPoint(this.patrolAreaBounds);
    }
}

class RoamerAlert extends characterAlertState {

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState("alert");
    }

}

class RoamerInteract extends characterInteractState {
    constructor(character: CharacterStateMachineLMent, patrolspeed: number, roamForce: number, interactAnim: string = "custom") {
        super(character, interactAnim);

        this.currentMaxSpeed = patrolspeed;
        this.moveForce = roamForce;
    }
    override  onEnterState(previousState: State | undefined): void {
        super.onEnterState(previousState);
        if (this.lookAtElement)
            this.lookAtElement.lookAway = true;
    }

    override onExitState(nextState: State | undefined): void {
        super.onExitState(nextState);
        if (this.lookAtElement)
            this.lookAtElement.lookAway = false;
    }

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState("interact");
    }

    override interactAction(): void {
        super.interactAction();
        this.moveForwradFast();
    }
}

export class Chicken extends CharacterStateMachineLMent {
    patrolAreaBounds: { min: Vector3, max: Vector3 };
    idleDurationRange: { min: number, max: number };
    private initialPosition: Vector3;

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
        interactAnim
        idleAnim
        alertAnim
        alertCooldown
        alertWarmUp
    */

    constructor(body: BodyHandle, id: number, params: Partial<Chicken> = {}) {
        super(body, id, params);

        this.patrolAreaBounds = params.patrolAreaBounds || { min: Helpers.NewVector3(-10, 0, -10), max: Helpers.NewVector3(10, 0, 10) };
        this.idleDurationRange = params.idleDurationRange || { min: 1, max: 5 };
        this.initialPosition = Helpers.NewVector3(0, 0, 0);

        const rules: StateTransitionRule[] = [
            {
                fromState: CharacterStateNames.alert,
                toState: CharacterStateNames.patrol,
                condition: () => { return !this.playerInAlertRange(); }
            },
            {
                fromState: CharacterStateNames.patrol,
                toState: CharacterStateNames.alert,
                condition: () => { return this.playerInAlertRange() }
            },
            {
                fromState: CharacterStateNames.alert,
                toState: CharacterStateNames.interactWithPlayer,
                condition: () => { return this.playerInInteractRange() }
            },
            {
                fromState: CharacterStateNames.interactWithPlayer,
                toState: CharacterStateNames.alert,
                condition: () => { return !this.playerInInteractRange() }
            },
        ];
        this.transitionManager = new StateTransitionManager(rules);
    }

    onInit(): void {
        super.onInit();
        this.initialPosition = this.body.body.getPosition().clone();

        this.states = {
            [CharacterStateNames.patrol]: new RoamerPatrol(this, this.patrolAreaBounds, this.idleDurationRange, this.maxNormalSpeed, this.movementForce, this.initialPosition),
            [CharacterStateNames.alert]: new RoamerAlert(this, "custom"),
            [CharacterStateNames.interactWithPlayer]: new RoamerInteract(this, this.maxNormalSpeed, this.maxFastSpeed)
        }

        this.switchState(CharacterStateNames.patrol);
    }
}
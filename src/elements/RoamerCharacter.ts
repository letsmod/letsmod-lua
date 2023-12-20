import { BodyHandle } from "engine/BodyHandle";
import { CharacterStateMachineLMent, CharacterStates, characterAlertState, characterIdleState, characterInteractState, characterPatrolState } from "./CharacterStates";
import { State, StateMachineLMent } from "engine/StateMachineLMent";
import { LookAt } from "./LookAt";
import { Helpers } from "engine/Helpers";
import { Vector3 } from "three";

class RoamerPatrol extends characterPatrolState {
    private randomIdleTimer: number;
    private isIdle: boolean;
    private patrolAreaBounds: { min: Vector3, max: Vector3 };
    private idleDurationRange: { min: number, max: number };
    private initialPoint: Vector3;

    constructor(stateMachine: CharacterStateMachineLMent, patrolAreaBounds: { min: Vector3, max: Vector3 }, idleDurationRange: { min: number, max: number }, patrolSpeed: number, roamForce: number, initialposition: Vector3) {
        super(stateMachine, [], patrolSpeed, roamForce);
        patrolAreaBounds.min = Helpers.ParamToVec3(patrolAreaBounds.min);
        patrolAreaBounds.max = Helpers.ParamToVec3(patrolAreaBounds.max);
        this.initialPoint = initialposition;
        this.patrolAreaBounds = patrolAreaBounds;
        this.isIdle = false;
        this.idleDurationRange = idleDurationRange;
        this.randomIdleTimer = this.getRandomIdleDuration(this.idleDurationRange);
        this.setRandomPatrolPoint(this.patrolAreaBounds);
    }

    setRandomPatrolPoint(bounds: { min: Vector3, max: Vector3 }) {

        const point1 = Helpers.NewVector3(
            this.initialPoint.x + this.randomInRange(bounds.min.x, bounds.max.x),
            this.initialPoint.y + this.randomInRange(bounds.min.y, bounds.max.y),
            this.initialPoint.z + this.randomInRange(bounds.min.z, bounds.max.z)
        );

        const point2 = Helpers.NewVector3(
            this.initialPoint.x + this.randomInRange(bounds.min.x, bounds.max.x),
            this.initialPoint.y + this.randomInRange(bounds.min.y, bounds.max.y),
            this.initialPoint.z + this.randomInRange(bounds.min.z, bounds.max.z)
        );

        this.points = [point1, point2];
        this.onEnterState(undefined);
    }

    randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    getRandomIdleDuration(range: { min: number, max: number }) {
        return Math.random() * (range.max - range.min) + range.min;
    }

    override playStateAnimation(dt: number): void {
        if (this.isIdle) {
            if (this.anim) this.anim.playState("idle");
        } else {
            if (this.anim) this.anim.playState("walk");
        }
    }

    override onUpdate(dt: number): void {
        if (this.isIdle) {
            this.randomIdleTimer -= dt;
            if (this.randomIdleTimer <= 0) {
                this.isIdle = false;
                if(this.currentPointIndex == this.points.length - 1)
                    this.setRandomPatrolPoint(this.patrolAreaBounds);
                this.randomIdleTimer = this.getRandomIdleDuration(this.idleDurationRange);
            }
        } else {
            super.onUpdate(dt);
            let distance = this.myPosition.distanceTo(this.activePoint);
            if (distance <= this.reachDestinationThreshold) {
                this.isIdle = true;
                this.randomIdleTimer = this.getRandomIdleDuration(this.idleDurationRange);
            }
        }
    }
}

class RoamerIdle extends characterIdleState {
    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("idle");
    }

}

class RoamerAlert extends characterAlertState {

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("alert");
    }
}

class RoamerInteract extends characterInteractState {
    constructor(character: CharacterStateMachineLMent, patrolspeed: number, roamForce: number) {
        super(character);

        this.movementSpeed = patrolspeed;
        this.moveForce = roamForce;
    }
    override  onEnterState(previousState: State | undefined): void {
        super.onEnterState(previousState);
        if (this.lookAt)
            this.lookAt.lookAway = true;
    }

    override onExitState(nextState: State | undefined): void {
        super.onExitState(nextState);
        if (this.lookAt)
            this.lookAt.lookAway = false;
    }

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("interact");
    }

    override onUpdate(dt: number): void {
        super.onUpdate(dt);
        if (this.alertCondition()) {

            this.moveForward();
            this.playStateAnimation(dt);
        }
        else this.stateMachine.switchState(CharacterStates.alert);
    }
}

export class RoamerCharacter extends CharacterStateMachineLMent {
    idleCooldown: number;
    patrolDistance: number;
    patrolSpeed: number;
    roamForce: number;
    movementForce: number;
    patrolAreaBounds: { min: Vector3, max: Vector3 };
    idleDurationRange: { min: number, max: number };
    private initialPosition: Vector3;

    private lookAtElement: LookAt | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<RoamerCharacter> = {}) {
        super(body, id, params);

        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.patrolSpeed = params.patrolSpeed === undefined ? 1 : params.patrolSpeed;
        this.roamForce = params.roamForce === undefined ? 1.2 : params.roamForce;
        this.idleCooldown = params.idleCooldown === undefined ? 1 : params.idleCooldown;
        this.movementForce = params.movementForce === undefined ? 100 : params.movementForce;
        this.patrolAreaBounds = params.patrolAreaBounds || { min: Helpers.NewVector3(-10, 0, -10), max: Helpers.NewVector3(10, 0, 10) };
        this.idleDurationRange = params.idleDurationRange || { min: 1, max: 5 };
        this.initialPosition = Helpers.NewVector3(0, 0, 0);
    }



    onInit(): void {
        super.onInit();
        this.initialPosition = this.body.body.getPosition().clone();

        this.states = {
            [CharacterStates.patrol]: new RoamerPatrol(this, this.patrolAreaBounds, this.idleDurationRange, this.patrolSpeed, this.movementForce, this.initialPosition),
            [CharacterStates.alert]: new RoamerAlert(this),
            [CharacterStates.idle]: new RoamerIdle(this, this.idleCooldown),
            [CharacterStates.interactWithPlayer]: new RoamerInteract(this, this.patrolSpeed, this.roamForce)
        }

        this.switchState(CharacterStates.patrol);
    }

    onStart(): void {
        this.body.body.lockRotation(true, false, true);
        this.body.body.setAngularVelocity(Helpers.zeroVector);
        this.body.body.setVelocity(Helpers.zeroVector);
    }
}
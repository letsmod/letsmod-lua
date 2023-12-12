import { BodyHandle } from "engine/BodyHandle";
import { CharacterStates, characterAlertState, characterIdleState, characterInteractState, characterPatrolState } from "./CharacterStates";
import { State, StateMachineLMent } from "engine/StateMachineLMent";
import { LookAt } from "./LookAt";
import { Helpers } from "engine/Helpers";

class RoamerPatrol extends characterPatrolState {

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("walk");
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
    constructor(character: StateMachineLMent, patrolspeed: number, roamForce: number, interactRadius: number, alertZoneRadius: number) {
        super(character, interactRadius, alertZoneRadius);

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

export class RoamerCharacter extends StateMachineLMent {
    idleCooldown: number;
    patrolDistance: number;
    patrolSpeed: number;
    alertZoneRadius: number;
    interactRadius: number;
    roamForce: number;
    movementForce: number;

    private lookAtElement: LookAt | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<RoamerCharacter> = {}) {
        super(body, id, params);

        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.patrolSpeed = params.patrolSpeed === undefined ? 1 : params.patrolSpeed;
        this.roamForce = params.roamForce === undefined ? 1.2 : params.roamForce;
        this.idleCooldown = params.idleCooldown === undefined ? 1 : params.idleCooldown;
        this.alertZoneRadius = params.alertZoneRadius === undefined ? 5 : params.alertZoneRadius;
        this.interactRadius = params.interactRadius === undefined ? 3 : params.interactRadius;
        this.movementForce = params.movementForce === undefined ? 100 : params.movementForce;
    }



    onInit(): void {
        this.lookAtElement = this.body.getElement(LookAt);
        if (this.lookAtElement === undefined) {
            console.log("No LookAt Element is found, it's needed for a roamer character to work.");
            return;
        }

        let point1 = this.body.body.getPosition().clone();
        let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()))

        this.states = {
            [CharacterStates.patrol]: new RoamerPatrol(this, [point1, point2], this.patrolSpeed, this.movementForce, this.alertZoneRadius),
            [CharacterStates.alert]: new RoamerAlert(this, this.alertZoneRadius, this.interactRadius),
            [CharacterStates.idle]: new RoamerIdle(this, this.alertZoneRadius, this.idleCooldown),
            [CharacterStates.interactWithPlayer]: new RoamerInteract(this, this.patrolSpeed, this.roamForce, this.interactRadius, this.alertZoneRadius)
        }

        this.switchState(CharacterStates.patrol);
    }

    onStart(): void {
        this.body.body.lockRotation(true, false, true);
        this.body.body.setAngularVelocity(Helpers.zeroVector);
        this.body.body.setVelocity(Helpers.zeroVector);
    }
}
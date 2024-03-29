import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { State } from "engine/StateMachineLMent";
import { Vector3 } from "three";
import { CharacterStateBase, CharacterStateNames } from "./CharacterStates";
import { CharacterStateMachineLMent } from "./CharacterStateMachineLMent";

export abstract class MODscriptState extends CharacterStateBase {

    override playStateSound(): void {
        //Do nothing here as we don't want to play any sound to avoid contradiction with SAY action.
    }
}

export class MODscriptNavigateState extends MODscriptState {

    navTarget: Vector3 = Helpers.zeroVector;
    targetRadius: number = 0;
    repeatable: boolean = false;

    constructor(stateMachine: CharacterStateMachineLMent, animName: string = "walk", animBlendTime: number = 0.25) {
        super(CharacterStateNames.navigate, stateMachine, animName, animBlendTime);
    }

    onEnterState(previousState: State | undefined) {
        super.onEnterState(previousState);
        this.enableLookAt();
        this.refreshLookAtTarget();
    }

    onExitState(nextState: State | undefined) {
        this.stopMoving();
    }


    onUpdate(dt: number): void {
        super.onUpdate(dt);
        let distance = this.stateMachine.body.body.getPosition().clone().multiply(Helpers.xzVector).distanceTo(this.navTarget.clone().multiply(Helpers.xzVector));
        if (this.stateMachine.has3DMovement)
            distance = this.stateMachine.body.body.getPosition().distanceTo(this.navTarget);
        if (distance <= this.targetRadius + this.stateMachine.moveReachThreshold) {
            if(!this.repeatable)
                this.stateMachine.markComplete();
            else
                this.fakeIdle();
        }
        else if (this.lookAtElement && this.lookAtElement.lookAtComplete(0.1))
            this.moveForwardNormally();
    }

    fakeIdle(){
        this.shape?.playAnimation(this.stateMachine.idleAnim, 0.25);
    }

    override moveForwardNormally(): void {
        super.moveForwardNormally();
        this.playShapeAnimation();
    }

    setNavigateSpecs(target: Vector3, radius: number, repeatable: boolean) {
        this.navTarget = target;
        this.targetRadius = radius;
        this.repeatable = repeatable;
    }
}

export class MODscriptLookAtState extends MODscriptState {

    constructor(stateMachine: CharacterStateMachineLMent, animBlendTime: number = 0.25) {
        super(CharacterStateNames.idle, stateMachine, "idle", animBlendTime);
    }

    onEnterState(previousState: State | undefined): void {
        super.onEnterState(previousState);
        this.stopMoving();
        this.enableLookAt();
        this.refreshLookAtTarget();
    }

    onExitState(nextState: State | undefined): void {
        this.disableLookAt();
    }


    onUpdate(dt: number): void {
        super.onUpdate(dt);
        if (this.lookAtElement && this.lookAtElement.lookAtComplete(0.1))
            this.stateMachine.markComplete();
        this.lookAtPlayer();
    }
}

export class MODscriptThrowState extends MODscriptState {

    throwForce: number = 0;
    throwablePrefabId: string = "";

    constructor(stateMachine: CharacterStateMachineLMent, throwForce: number, animName: string = "throw", animBlendTime: number = 0.25) {
        super(CharacterStateNames.throw, stateMachine, animName, animBlendTime);
        this.throwForce = throwForce;
    }

    onEnterState(previousState: State | undefined): void {
        super.onEnterState(previousState);
        this.stopMoving();
        this.enableLookAt();
        this.refreshLookAtTarget();
        this.preformThrow();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
    }

    preformThrow() {
        let projectile = GameplayScene.instance.clonePrefab(this.throwablePrefabId);
        if (projectile === undefined) {
            console.log("No prefab named: " + this.throwablePrefabId + " exists in the library.");
            this.stateMachine.markFailed();
            return;
        }

        let offset = Helpers.forwardVector.clone().applyQuaternion(this.stateMachine.body.body.getRotation());

        let position = this.stateMachine.body.body.getPosition().clone().add(offset);
        projectile.body.setPosition(position);

        let forceValue = Helpers.NewVector3(0, 0.3, 0.7).clone().applyQuaternion(this.stateMachine.body.body.getRotation());
        forceValue.multiplyScalar(this.throwForce);
        projectile.body.applyCentralForce(forceValue);
        this.stateMachine.markComplete();

    }

    setThrowablePrefab(prefabId: string) {
        this.throwablePrefabId = prefabId;
    }

}

export class MODscriptTalkState extends MODscriptState {

    constructor(stateMachine: CharacterStateMachineLMent, animName: string = "talk", animBlendTime: number = 0.25) {
        super(CharacterStateNames.idle, stateMachine, animName, animBlendTime);
    }

    onEnterState(previousState: State | undefined): void {
        super.onEnterState(previousState);
        this.stopMoving();
        this.enableLookAt();
        this.refreshLookAtTarget();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        this.lookAtPlayer();
    }
}
import { GameplayScene } from "engine/GameplayScene";
import { Constants, Helpers } from "engine/Helpers";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { State } from "engine/StateMachineLMent";
import { Vector3 } from "three";
import { characterAlertState, CharacterStateBase, CharacterStateNames } from "./CharacterStates";
import { SfxPlayer } from "elements/SfxPlayer";
import { CharacterStateMachineLMent } from "./CharacterStateMachineLMent";

export class EnemyAlertState extends characterAlertState {

    constructor(stateMachine: CharacterStateMachineLMent, animName: string = "alert", animBlendTime: number = 0.25) {
        super(stateMachine, animName, animBlendTime);
    }

    onEnterState(previousState: State | undefined): void {
        super.onEnterState(previousState);
        this.stateMachine.initiateAlertWarmup();
    }
}

export class EnemyChaseState extends CharacterStateBase {

    constructor(stateMachine: CharacterStateMachineLMent, animName: string = "jog", animBlendTime: number = 0.25) {
        super(CharacterStateNames.chase, stateMachine, animName, animBlendTime,Constants.ChaseAudio);
    }

    onEnterState(previousState: State | undefined) {
        super.onEnterState(previousState);
        this.stopMoving();
    }

    onExitState(nextState: State | undefined) {
        this.stopMoving();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        this.moveForwradFast();
        this.lookAtPlayer();
    }
}

export class EnemyChargeState extends CharacterStateBase implements CollisionHandler {

    targetPosition: Vector3 = Helpers.zeroVector;

    constructor(stateMachine: CharacterStateMachineLMent, animName: string = "run", animBlendTime: number = 0.25) {
        super(CharacterStateNames.chase, stateMachine, animName, animBlendTime);

    }

    onEnterState(previousState: State | undefined) {
        super.onEnterState(previousState);
        this.stopMoving();
        let player = GameplayScene.instance.memory.player;
        if (player)
            this.targetPosition = player.body.getPosition().clone();
        this.setLookAtTarget(this.targetPosition);
        this.disableLookAt();
    }

    onExitState(nextState: State | undefined) {
        this.stopMoving();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        let distance = this.myPosition.distanceTo(this.targetPosition);
        let dotCheck = Helpers.forwardVector.applyQuaternion(this.stateMachine.characterBody.getRotation()).dot(this.targetPosition.clone().sub(this.myPosition).normalize());
        if (distance > this.stateMachine.moveReachThreshold && dotCheck > 0) {
            this.moveForwradFast();
            this.playCustomAnimation(dt);
        }
        else this.stateMachine.switchState(CharacterStateNames.alert);

    }

    onCollision(info: CollisionInfo): void {
        const myFwd = Helpers.forwardVector.applyQuaternion(this.stateMachine.body.body.getRotation());
        const dotVal = info.getDeltaVSelf().normalize().dot(myFwd);
        if (dotVal < -.5)
            this.stateMachine.switchState(CharacterStateNames.alert);
    }
}
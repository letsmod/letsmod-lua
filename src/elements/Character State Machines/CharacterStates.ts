import { LookAt } from "elements/LookAt";
import { ShapeStateController } from "elements/ShapeStateController";
import { BodyHandle, BodyPointer } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Constants, Helpers } from "engine/Helpers";
import { CollisionHandler, CollisionInfo, UpdateHandler } from "engine/MessageHandlers";
import { AnimatedState, State, StateMachineLMent } from "engine/StateMachineLMent";
import { Vector3 } from "three";
import { GroundCheck } from "elements/GroundCheck";
import { SfxPlayer } from "elements/SfxPlayer";
import { CharacterStateMachineLMent } from "./CharacterStateMachineLMent";

export enum CharacterStateNames {
    idle = "idle",
    interactWithPlayer = "interactWithPlayer",
    patrol = "patrol",
    alert = "alert",
    chase = "chase",
    charge = "charge",

    /// The following are for MODscript
    lookAt = "lookAt",
    navigate = "navigate",
    throw = "throw",
    talk = "talk",
}

export interface StateTransitionRule {
    fromState: CharacterStateNames;
    toState: CharacterStateNames;
    condition: () => boolean;
}

export class StateTransitionManager {
    private rules: StateTransitionRule[] = [];

    constructor(rules: StateTransitionRule[]) {
        this.rules = rules;
    }

    evaluate(stateMachine: CharacterStateMachineLMent) {
        for (const rule of this.rules) {
            if (stateMachine.currentState?.name === rule.fromState && rule.condition()) {
                stateMachine.switchState(rule.toState);
                break;
            }
        }
    }
}

export abstract class CharacterStateBase extends AnimatedState implements UpdateHandler {

    protected currentMaxSpeed: number = 0;

    protected alertZoneRadius: number = 0;
    protected interactWithPlayerRadius: number = 0;

    protected sightDotValue: number = 0;
    protected customAnimator: ShapeStateController | undefined;

    protected lookAtElement: LookAt | undefined;
    protected sound: SfxPlayer | undefined;
    protected groundCheckElement: GroundCheck | undefined;
    protected moveForce: number = 0;

    protected get myPosition() { return this.stateMachine.body.body.getPosition(); }
    override stateMachine: CharacterStateMachineLMent;

    constructor(name: string, stateMachine: CharacterStateMachineLMent, animName: string, animBlendTime: number, soundName: string = "") {
        super(name, stateMachine, undefined, animName, animBlendTime);
        this.stateMachine = stateMachine;


        this.alertZoneRadius = this.stateMachine.alertZoneRadius;
        this.interactWithPlayerRadius = this.stateMachine.interactZoneRadius;
        this.sightDotValue = this.stateMachine.sightDotValue;

        this.lookAtElement = this.stateMachine.body.getElement(LookAt);
        if (!this.lookAtElement)
            console.warn("LookAt component not found on Character");

        this.groundCheckElement = this.stateMachine.body.getElement(GroundCheck);

        this.customAnimator = this.stateMachine.body.getElement(ShapeStateController);

        this.moveForce = this.stateMachine.movementForce;

        this.sound = this.stateMachine.body.getElementByName(soundName) as SfxPlayer;
    }

    stopMoving() {
        const thisBody = this.stateMachine.characterBody;
        const planeVector = Helpers.xzVector.applyQuaternion(thisBody.getRotation());

        //let currentVelo = thisBody.getVelocity().clone().projectOnVector(planeVector).length();
        //const threshold = 1;

        // if (currentVelo > this.currentMaxSpeed + 1)
        //     return;

        let newVelo = Helpers.zeroVector;

        if (!this.stateMachine.has3DMovement)
            newVelo = this.stateMachine.characterBody.getVelocity().clone().multiply(Helpers.upVector);

        this.stateMachine.body.body.setVelocity(newVelo);
        this.stateMachine.body.body.setAngularVelocity(Helpers.zeroVector);
    }

    moveForwradFast() {
        this.moveForward(this.stateMachine.maxFastSpeed);
    }

    moveForwardNormally() {
        this.moveForward(this.stateMachine.maxNormalSpeed);
    }

    moveForward(speed: number) {

        if (!this.stateMachine.has3DMovement && this.groundCheckElement && !this.groundCheckElement.isOnGround) {
            return;
        }

        this.currentMaxSpeed = speed;
        let thisBody = this.stateMachine.characterBody;
        let forwardDirection = Helpers.forwardVector.applyQuaternion(thisBody.getRotation());
        let currentVelo = thisBody.getVelocity().clone().projectOnVector(forwardDirection);

        if (currentVelo.length() < speed) {
            let force = forwardDirection.multiplyScalar(this.moveForce);
            thisBody.applyCentralForce(force)
            thisBody.setAngularVelocity(Helpers.zeroVector);
        }
    }


    disableLookAt() {
        if (this.lookAtElement)
            this.lookAtElement.enabled = false;
    }

    enableLookAt() {
        if (!this.lookAtElement) return;
        this.lookAtElement.enabled = true;
    }

    setLookAtTarget(target: Vector3) {
        this.stateMachine.lookAtTarget = target;
        if (this.lookAtElement)
            this.lookAtElement.changeTargetByVector(target);
    }

    refreshLookAtTarget() {
        if (this.lookAtElement)
            this.lookAtElement.changeTargetByVector(this.stateMachine.lookAtTarget);
    }

    lookAtPlayer() {
        if (GameplayScene.instance.memory.player)
            this.stateMachine.lookAtTarget = GameplayScene.instance.memory.player.body.getPosition();
        if (this.lookAtElement)
            this.lookAtElement.changeTargetByVector(this.stateMachine.lookAtTarget);
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        /* Override by children if needed */
    }

    onEnterState(previousState: State | undefined): void { 
        super.onEnterState(previousState);
        if(this.sound !== undefined)
            this.sound.playAudio();
     }

    onExitState(nextState: State | undefined): void { }
}

export class characterIdleState extends CharacterStateBase {

    private idleTimer: number = 0;

    constructor(stateMachine: CharacterStateMachineLMent, animName: string = "idle", animBlendTime: number = 0.25) {
        super(CharacterStateNames.idle, stateMachine, animName, animBlendTime);
    }

    onEnterState(previousState: State | undefined): void {
        super.onEnterState(previousState);
        this.stopMoving();
        if (this.lookAtElement)
            this.lookAtElement.enabled = false;
    }

    onExitState(nextState: State | undefined): void {
        if (this.lookAtElement)
            this.lookAtElement.enabled = true;
    }
}

export class characterAlertState extends CharacterStateBase {

    constructor(stateMachine: CharacterStateMachineLMent, animName: string = "alert", animBlendTime: number = 0.25) {
        super(CharacterStateNames.alert, stateMachine, animName, animBlendTime);
    }

    onEnterState(previousState: State | undefined): void {
        super.onEnterState(previousState);
        this.stopMoving();
        this.enableLookAt();
    }

    onExitState(nextState: State | undefined): void {
        this.stopMoving();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        this.lookAtPlayer();
        this.alertAction();
    }

    protected alertAction() {
        /* Override by children if needed */
        this.stopMoving();
    }
}

export class characterInteractState extends CharacterStateBase {


    constructor(stateMachine: CharacterStateMachineLMent, animName: string = "interact", animBlendTime: number = 0.25) {
        super(CharacterStateNames.interactWithPlayer, stateMachine, animName, animBlendTime);
    }

    onEnterState(previousState: State | undefined): void {
        super.onEnterState(previousState);
        this.stopMoving();
        this.enableLookAt();
    }

    onExitState(nextState: State | undefined): void {
        this.stopMoving();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        this.lookAtPlayer();
        this.interactAction();
    }

    protected interactAction() {
        /* Override by children if needed */
        this.stopMoving();
    }
}

export class characterPatrolState extends CharacterStateBase implements CollisionHandler {
    points: Vector3[] = [];
    currentPointIndex: number = 0;
    patrolWait: number = 0;
    waitAnimName: string = "idle";
    patrolAnimName: string = "jog";


    public get inSubIdle(): boolean { return this._inSubIdle; }
    private _inSubIdle: boolean = false;
    private subIdleFunc: any | undefined;
    get activePoint() { return this.points[this.currentPointIndex] };

    constructor(stateMachine: CharacterStateMachineLMent, points: Vector3[], patrolWait: number, patrolAnimName: string = "walk", waitAnimName: string = "idle", animBlendTime: number = 0.25  ) {
        super(CharacterStateNames.patrol, stateMachine, patrolAnimName, animBlendTime,Constants.MoveAudio);
        this.points = points;
        this.patrolWait = patrolWait;
        this.waitAnimName = waitAnimName;
        this.patrolAnimName = patrolAnimName;
    }

    onEnterState(previousState: State | undefined) {
        super.onEnterState(previousState);
        this.animName = this.patrolAnimName;
        this.currentPointIndex = 1;
        if (this.currentPointIndex >= this.points.length) {
            this.currentPointIndex = 0;
            this.patrolWait = 999999;
        }
        if (this.lookAtElement)
            this.lookAtElement.changeTargetByVector(this.activePoint);
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        let distance = this.stateMachine.body.body.getPosition().clone().multiply(Helpers.xzVector).distanceTo(this.activePoint.clone().multiply(Helpers.xzVector));
        if (this.stateMachine.has3DMovement)
            distance = this.stateMachine.body.body.getPosition().distanceTo(this.activePoint);
        
        if (distance <= this.stateMachine.moveReachThreshold)
            this.enterSubIdle();
        else if (this.lookAtElement && this.lookAtElement.lookAtComplete(0.1))
            this.moveForwardNormally();
    }

    onCollision(info: CollisionInfo): void {
        const myFwd = Helpers.forwardVector.applyQuaternion(this.stateMachine.body.body.getRotation());
        const myRight = Helpers.rightVector.applyQuaternion(this.stateMachine.body.body.getRotation());
        const dotVal = info.getDeltaVSelf().normalize().dot(myFwd);
        let nextPoint = this.points[(this.currentPointIndex + 1) % this.points.length];

        if (dotVal >= -.5) return;

        const currentPos = this.stateMachine.body.body.getPosition();
        this.stateMachine.body.body.setPosition(currentPos.clone().add(myFwd.multiplyScalar(-0.3)));
        this.points[this.currentPointIndex] = currentPos.clone();
        if (currentPos.distanceTo(nextPoint) <= 2)
            this.points[(this.currentPointIndex + 1) % this.points.length] = currentPos.clone().add(myRight.multiplyScalar(Math.random() + 3));
        this.enterSubIdle();
    }

    enterSubIdle() {
        if (this._inSubIdle) return;
        this._inSubIdle = true;
        this.stopMoving();
        this.animName = this.waitAnimName;
        this.playShapeAnimation();
        this.disableLookAt();

        if (this.subIdleFunc)
            GameplayScene.instance.dispatcher.removeQueuedFunction(this.subIdleFunc);
        this.subIdleFunc = GameplayScene.instance.dispatcher.queueDelayedFunction(this.stateMachine, () => {
            this.subIdleAction();
            this._inSubIdle = false;
        }, this.patrolWait);
    }

    subIdleAction() {
        //Override by children if needed
        this.currentPointIndex++;
        this.animName = this.patrolAnimName;
        this.playShapeAnimation();

        this.enableLookAt();
        if (this.currentPointIndex >= this.points.length)
            this.currentPointIndex = 0;
        if (this.lookAtElement)
            this.lookAtElement.changeTargetByVector(this.activePoint);
    }

    onExitState(nextState: State | undefined): void {
        super.onExitState(nextState);
        if (this.subIdleFunc)
            GameplayScene.instance.dispatcher.removeQueuedFunction(this.subIdleFunc);
        this._inSubIdle = false;
        this.stopMoving();

    }
}

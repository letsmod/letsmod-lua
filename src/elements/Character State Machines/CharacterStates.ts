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

export enum CharacterStates {
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
    fromState: CharacterStates;
    toState: CharacterStates;
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

export class CharacterStateMachineLMent extends StateMachineLMent {

    /*** Args ****/
    movementForce: number;
    maxNormalSpeed: number;
    maxFastSpeed: number;
    alertZoneRadius: number;
    interactZoneRadius: number;
    sightDotValue: number;
    moveReachThreshold: number;
    has3DMovement: boolean = false;
    normalMoveAnim: string;
    fastMoveAnim: string;
    interactAnim: string;
    idleAnim: string;
    alertAnim: string;
    throwAnim: string;
    talkAnim: string;
    alertCooldown: number;
    alertWarmUp: number;

    transitionManager: StateTransitionManager | undefined;
    characterBody: BodyPointer;

    /*** MODscript Related Fields ***/
    lookAtTarget: Vector3 = Helpers.zeroVector;
    FinishedActionsMap: Map<string, boolean> = new Map();
    activeActionId: string = "";

    /*** Alert Time Management ***/
    protected alertIsWarmingUp: boolean = false;
    protected alertWarmUpTimer: number = 0;
    protected alertIsCoolingDown: boolean = false;
    protected alertCooldownTimer: number = 0;

    constructor(body: BodyHandle, id: number, params: Partial<CharacterStateMachineLMent> = {}) {
        super(body, id, params);
        this.alertZoneRadius = params.alertZoneRadius === undefined ? 6 : params.alertZoneRadius;
        this.interactZoneRadius = params.interactZoneRadius === undefined ? 2 : params.interactZoneRadius;
        this.sightDotValue = params.sightDotValue === undefined ? 0.5 : params.sightDotValue;
        this.moveReachThreshold = params.moveReachThreshold === undefined ? 0.5 : params.moveReachThreshold;
        this.characterBody = this.body.body;
        this.normalMoveAnim = params.normalMoveAnim === undefined ? "custom" : params.normalMoveAnim;
        this.fastMoveAnim = params.fastMoveAnim === undefined ? "custom" : params.fastMoveAnim;
        this.interactAnim = params.interactAnim === undefined ? "custom" : params.interactAnim;
        this.idleAnim = params.idleAnim === undefined ? "custom" : params.idleAnim;
        this.alertAnim = params.alertAnim === undefined ? "custom" : params.alertAnim;
        this.throwAnim = params.throwAnim === undefined ? "custom" : params.throwAnim;
        this.talkAnim = params.talkAnim === undefined ? "custom" : params.talkAnim;
        this.alertCooldown = params.alertCooldown === undefined ? 3 : params.alertCooldown;
        this.alertWarmUp = params.alertWarmUp === undefined ? 0.25 : params.alertWarmUp;

        /*** MODscript Fields ***/
        this.lookAtTarget = params.lookAtTarget === undefined ? Helpers.oneVector.applyQuaternion(this.body.body.getRotation()) : params.lookAtTarget;
        this.movementForce = params.movementForce === undefined ? 30 : params.movementForce;
        this.maxNormalSpeed = params.maxNormalSpeed === undefined ? 5 : params.maxNormalSpeed;
        this.maxFastSpeed = params.maxFastSpeed === undefined ? 7.5 : params.maxFastSpeed;
    }

    onInit(): void {

    }

    onStart(): void {
        this.body.body.lockRotation(true, false, true);
        this.body.body.setAngularVelocity(Helpers.zeroVector);
        this.body.body.setVelocity(Helpers.zeroVector);
    }

    protected playerInSight(): boolean {
        const player = GameplayScene.instance.memory.player;
        if (player === undefined)
            return false;
        const enemyFwd = Helpers.forwardVector.applyQuaternion(this.characterBody.getRotation());
        const dotCheck = enemyFwd.dot(player.body.getPosition().clone().sub(this.characterBody.getPosition()).normalize());
        return dotCheck > this.sightDotValue;
    }

    protected playerInAlertRange(): boolean {
        const player = GameplayScene.instance.memory.player;
        if (player === undefined)
            return false;
        return this.characterBody.getPosition().distanceTo(player.body.getPosition()) < this.alertZoneRadius;
    }

    protected playerInInteractRange(): boolean {
        const player = GameplayScene.instance.memory.player;
        if (player === undefined)
            return false;
        return this.characterBody.getPosition().distanceTo(player.body.getPosition()) < this.interactZoneRadius;
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        if (this.characterBody.getPosition().y < -1) {
            for (let body of this.body.bodyGroup)
                GameplayScene.instance.destroyBody(body);
        }
        if (this.transitionManager !== undefined)
            this.transitionManager.evaluate(this);

        if (this.currentState !== undefined && this.currentState.name === CharacterStates.alert
            && !this.alertIsCoolingDown && this.alertCooldownCriteria()) {
            this.initiateAlertCooldown();
        }
        this.manageAlertTimers(dt);
    }

    alertCooldownCriteria(): boolean {
        return !this.playerInAlertRange();
    }

    initiateAlertWarmup(): void {
        this.alertWarmUpTimer = this.alertWarmUp;
        this.alertIsWarmingUp = true;
        this.alertIsCoolingDown = false;

    }

    initiateAlertCooldown(): void {
        this.alertCooldownTimer = this.alertCooldown;
        this.alertIsCoolingDown = true;
        this.alertIsWarmingUp = false;

    }

    manageAlertTimers(dt: number): void {
        if (this.alertIsWarmingUp) {

            this.alertWarmUpTimer -= dt;
            if (this.alertWarmUpTimer <= 0) {
                this.alertIsWarmingUp = false;
            }
        }
        if (this.alertIsCoolingDown) {
            this.alertCooldownTimer -= dt;
            if (this.alertCooldownTimer <= 0) {
                this.alertIsCoolingDown = false;
            }
        }
    }

    /*** MODscript Functions ***/
    startState(actionId: string, state: CharacterStates, lookAtTarget: Vector3 | undefined): void {
        if (lookAtTarget !== undefined)
            this.lookAtTarget = lookAtTarget;

        this.activeActionId = actionId;

        this.switchState(state);
    }

    markComplete() {
        this.FinishedActionsMap.set(this.activeActionId, true);
        this.switchState(CharacterStates.idle);
    }

    markFailed() {
        this.FinishedActionsMap.set(this.activeActionId, false);
    }

    stateIsComplete(actionId: string): boolean {
        return this.FinishedActionsMap.has(actionId) && this.FinishedActionsMap.get(actionId) === true;
    }

    stateIsFailed(actionId: string): boolean {
        return this.FinishedActionsMap.has(actionId) && this.FinishedActionsMap.get(actionId) === false;
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

        console.log("Sound Name: ", soundName);

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
        super(CharacterStates.idle, stateMachine, animName, animBlendTime);
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
        super(CharacterStates.alert, stateMachine, animName, animBlendTime);
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
        super(CharacterStates.interactWithPlayer, stateMachine, animName, animBlendTime);
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
        super(CharacterStates.patrol, stateMachine, patrolAnimName, animBlendTime,Constants.MoveAudio);
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
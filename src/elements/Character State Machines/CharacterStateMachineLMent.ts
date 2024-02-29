import { BodyPointer, BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { State, StateMachineLMent } from "engine/StateMachineLMent";
import { Vector3 } from "three";
import { StateTransitionManager, CharacterStateNames, characterIdleState } from "./CharacterStates";
import { MODscriptNavigateState, MODscriptLookAtState, MODscriptThrowState, MODscriptTalkState } from "./MODscriptStates";

export class CharacterStateMachineLMent extends StateMachineLMent {

    /*** Args ****/
    movementForce: number;
    maxNormalSpeed: number;
    maxFastSpeed: number;
    throwForce: number;
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
    defaultState: string;

    protected MODscriptStates: { [key: string]: State | undefined };
    protected transitionManager: StateTransitionManager | undefined;
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
        this.defaultState = params.defaultState === undefined ? CharacterStateNames.idle : params.defaultState;

        /*** MODscript Fields ***/
        this.lookAtTarget = params.lookAtTarget === undefined ? Helpers.oneVector.applyQuaternion(this.body.body.getRotation()) : params.lookAtTarget;
        this.movementForce = params.movementForce === undefined ? 30 : params.movementForce;
        this.maxNormalSpeed = params.maxNormalSpeed === undefined ? 5 : params.maxNormalSpeed;
        this.maxFastSpeed = params.maxFastSpeed === undefined ? 7.5 : params.maxFastSpeed;
        this.throwForce = params.throwForce === undefined ? 400 : params.throwForce;
        this.MODscriptStates = {};
    }

    onInit(): void {
        this.MODscriptStates = {
            [CharacterStateNames.navigate]: new MODscriptNavigateState(this, this.normalMoveAnim),
            [CharacterStateNames.lookAt]: new MODscriptLookAtState(this),
            [CharacterStateNames.idle]: new characterIdleState(this, this.idleAnim),
            [CharacterStateNames.throw]: new MODscriptThrowState(this, this.throwForce),
            [CharacterStateNames.talk]: new MODscriptTalkState(this, this.talkAnim)
        }
    }

    onStart(): void {
        this.body.body.lockRotation(true, false, true);
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

        if (this.currentState !== undefined && this.currentState.name === CharacterStateNames.alert
            && !this.alertIsCoolingDown && this.alertCooldownCriteria()) {
            this.initiateAlertCooldown();
        }
        this.manageAlertTimers(dt);
        this.body.body.setAngularVelocity(Helpers.zeroVector);
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
    startState(actionId: string, state: CharacterStateNames, lookAtTarget: Vector3 | undefined): void {
        if (lookAtTarget !== undefined)
            this.lookAtTarget = lookAtTarget;

        this.activeActionId = actionId;

        this.switchState(state);
    }

    markComplete() {
        this.FinishedActionsMap.set(this.activeActionId, true);
        this.switchState(CharacterStateNames.idle);
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
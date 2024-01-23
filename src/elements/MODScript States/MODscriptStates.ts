import { LookAt } from "elements/LookAt";
import { PrefabSpawner } from "elements/PrefabSpawner";
import { ShapeStateController } from "elements/ShapeStateController";
import { BodyHandle, BodyPointer } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { CollisionHandler, CollisionInfo, UpdateHandler } from "engine/MessageHandlers";
import { State, StateMachineLMent } from "engine/StateMachineLMent";
import { Vector, Vector3 } from "three";

export enum MODscriptStates {
    idle = "idle",
    lookAt = "lookAt",
    navigate = "navigate",
    throw = "throw",
}

export class MODscriptStateMachineLMent extends StateMachineLMent {

    onStart(): void {

    }

    /***These are temporary until the animation engine is ready ****/
    characterBodyName: string;
    characterBody: BodyPointer;
    characterHead: BodyPointer;


    navTarget: Vector3 = Helpers.zeroVector;
    lookAtTarget: Vector3 = Helpers.zeroVector;
    movementForce: number = 0;
    maxSpeed: number = 0;
    FinishedActionsMap: Map<string, boolean> = new Map();
    activeActionId: string = "";
    
    constructor(body: BodyHandle, id: number, params: Partial<MODscriptStateMachineLMent> = {}) {
        super(body, id, params);
        this.characterBodyName = params.characterBodyName === undefined ? "CharacterBody" : params.characterBodyName;
        this.navTarget = params.navTarget === undefined ? Helpers.zeroVector : params.navTarget;
        this.lookAtTarget = params.lookAtTarget === undefined ? Helpers.oneVector.applyQuaternion(this.body.body.getRotation()) : params.lookAtTarget;
        this.movementForce = params.movementForce === undefined ? 30 : params.movementForce;
        this.maxSpeed = params.maxSpeed === undefined ? 5 : params.maxSpeed;
        this.characterHead = this.body.body;
        this.characterBody = this.characterHead;
    }

    onInit(): void {
        //The body/head thing is because current NPCs are not rigged, so the head is a separate body
        const characterBodyHandle = Helpers.findBodyWithinGroup(this.body, this.characterBodyName);
        if (characterBodyHandle === undefined)
            console.log("No character body is found, setting the main body as the character body.")
        else this.characterBody = characterBodyHandle.body;
    }


    //Call this whenever an action wants to change a state
    startState(actionId: string, state: MODscriptStates, navTarget: Vector3 | undefined, lookAtTarget: Vector3 | undefined): void {
        if (navTarget !== undefined)
            this.navTarget = navTarget;

        if (lookAtTarget !== undefined)
            this.lookAtTarget = lookAtTarget;

        this.activeActionId = actionId;
        this.switchState(state);
    }

    markComplete() {
        this.FinishedActionsMap.set(this.activeActionId, true);
        this.switchState(MODscriptStates.idle);
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

export abstract class MODscriptStateBase extends State implements UpdateHandler {

    protected reachDestinationThreshold: number = 3;
    protected movementSpeed: number = 0;
    protected anim: ShapeStateController | undefined;
    protected lookAtElement: LookAt | undefined;
    protected has3DMovement: boolean = false;
    protected moveForce: number = 0;
    protected get myPosition() { return this.stateMachine.body.body.getPosition(); }
    override stateMachine: MODscriptStateMachineLMent;

    constructor(name: string, stateMachine: MODscriptStateMachineLMent) {
        super(name, stateMachine);
        this.stateMachine = stateMachine;

        this.lookAtElement = this.stateMachine.body.getElement(LookAt);
        if (!this.lookAtElement)
            console.warn("LookAt component not found on Character");

        this.anim = this.stateMachine.body.getElement(ShapeStateController);
        if (!this.anim)
            console.warn("ShapeStateController component not found on Character");

        this.moveForce = this.stateMachine.movementForce;
        this.movementSpeed = this.stateMachine.maxSpeed;

    }

    stopMoving() {

        const thisBody = this.stateMachine.body.body;
        const planeVector = Helpers.xzVector.applyQuaternion(thisBody.getRotation());
        let currentVelo = thisBody.getVelocity().clone().projectOnVector(planeVector).length();
        const threshold = 1;

        if (currentVelo > this.movementSpeed + threshold)
            return;

        let newVelo = Helpers.zeroVector;

        if (!this.has3DMovement)
            newVelo = this.stateMachine.body.body.getVelocity().clone().multiply(Helpers.upVector);

        this.stateMachine.body.body.setVelocity(newVelo);
        this.stateMachine.body.body.setAngularVelocity(Helpers.zeroVector);
    }

    moveForward() {
        let thisBody = this.stateMachine.body.body;
        let forwardDirection = Helpers.forwardVector.applyQuaternion(thisBody.getRotation());
        let currentVelo = thisBody.getVelocity().clone().projectOnVector(forwardDirection);
        if (currentVelo.length() < this.movementSpeed) {
            let force = forwardDirection.multiplyScalar(this.moveForce);
            thisBody.applyCentralForce(force)
        }
        thisBody.setAngularVelocity(Helpers.zeroVector);
    }

    disableLookAt() {
        if (this.lookAtElement)
            this.lookAtElement.enabled = false;
    }

    enableLookAt() {
        if (!this.lookAtElement) return;
        this.lookAtElement.changeTargetByVector(this.stateMachine.lookAtTarget);
        this.lookAtElement.enabled = true;
    }

    protected playStateAnimation(dt: number) {
        /* Override by children */
    }

    onUpdate(dt: number): void {
        if (this.stateMachine.characterBody.getPosition().y < -1) {
            for (let body of this.stateMachine.body.bodyGroup)
                GameplayScene.instance.destroyBody(body);
        }

        /* Override by children if needed */
    }

    onEnterState(previousState: State | undefined): void { }

    onExitState(nextState: State | undefined): void { }

}

export class MODscriptIdleState extends MODscriptStateBase {

    constructor(stateMachine: MODscriptStateMachineLMent) {
        super(MODscriptStates.idle, stateMachine);
    }

    onEnterState(previousState: State | undefined): void {
        this.stopMoving();
    }

    onExitState(nextState: State | undefined): void {
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        this.playStateAnimation(dt);
    }
}

export class MODscriptNavigateState extends MODscriptStateBase implements CollisionHandler {

    constructor(stateMachine: MODscriptStateMachineLMent) {
        super(MODscriptStates.navigate, stateMachine);
    }

    onEnterState(previousState: State | undefined) {
        this.enableLookAt();
    }

    onExitState(nextState: State | undefined) {
        this.stopMoving();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        let distance = this.stateMachine.body.body.getPosition().clone().multiply(Helpers.xzVector).distanceTo(this.stateMachine.navTarget.clone().multiply(Helpers.xzVector));
        if (this.has3DMovement)
            distance = this.stateMachine.body.body.getPosition().distanceTo(this.stateMachine.navTarget);

        if (distance <= this.reachDestinationThreshold)
            this.stateMachine.markComplete();
        else {
            if (this.lookAtElement && this.lookAtElement.lookAtComplete(0.1)) {
                this.moveForward();
                this.playStateAnimation(dt);
            }
        }
    }

    onCollision(info: CollisionInfo): void {

    }
}

export class MODscriptLookAtState extends MODscriptStateBase {

    constructor(stateMachine: MODscriptStateMachineLMent) {
        super(MODscriptStates.idle, stateMachine);
    }

    onEnterState(previousState: State | undefined): void {
        this.stopMoving();
        this.enableLookAt();
    }

    onExitState(nextState: State | undefined): void {
        this.disableLookAt();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        if (this.lookAtElement && this.lookAtElement.lookAtComplete(0.1))
            this.stateMachine.markComplete();
        else
            this.playStateAnimation(dt);
    }
}

export class MODscriptThrowState extends MODscriptStateBase {

    constructor(stateMachine: MODscriptStateMachineLMent) {
        super(MODscriptStates.throw, stateMachine);
    }

    onEnterState(previousState: State | undefined): void {
        this.stopMoving();
        this.enableLookAt();
        this.preformThrow();       
    }
    
    onExitState(nextState: State | undefined): void {
        this.disableLookAt();
    }
    
    onUpdate(dt: number): void {
        super.onUpdate(dt);
    }
    
    preformThrow() {
        const PS = this.stateMachine.body.getElement(PrefabSpawner);
        if (!PS){
            this.stateMachine.markFailed();
            return;
        }
            PS.spawn();
            this.stateMachine.markComplete();
    }

}
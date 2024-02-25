import { LookAt } from "elements/LookAt";
import { ShapeStateController } from "elements/ShapeStateController";
import { BodyHandle, BodyPointer } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Constants, Helpers } from "engine/Helpers";
import { CollisionHandler, CollisionInfo, UpdateHandler } from "engine/MessageHandlers";
import { State, StateMachineLMent } from "engine/StateMachineLMent";
import { Quaternion, Vector3 } from "three";
import { SfxPlayer } from "./SfxPlayer";

export enum CharacterStates {
    idle = "idle",
    interactWithPlayer = "interactWithPlayer",
    patrol = "patrol",
    dialogue = "dialogue",
    alert = "alert",
    chase = "chase",
    charge = "charge",
}

export class CharacterStateMachineLMent extends StateMachineLMent {

    characterBodyName: string;
    characterBody: BodyPointer;
    characterHead: BodyPointer;
    alertZoneRadius: number;
    interactZoneRadius: number;
    sightDotValue: number;

    constructor(body: BodyHandle, id: number, params: Partial<CharacterStateMachineLMent> = {}) {
        super(body, id, params);
        this.characterBodyName = params.characterBodyName === undefined ? "CharacterBody" : params.characterBodyName;
        this.alertZoneRadius = params.alertZoneRadius === undefined ? 6 : params.alertZoneRadius;
        this.interactZoneRadius = params.interactZoneRadius === undefined ? 2 : params.interactZoneRadius;
        this.sightDotValue = params.sightDotValue === undefined ? 0.5 : params.sightDotValue;
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

    onStart(): void {

    }
}


export abstract class CharacterStateBase extends State implements UpdateHandler {

    protected reachDestinationThreshold: number = 0.5;
    protected movementSpeed: number = 0;
    protected alertZoneRadius: number = 0;
    protected interactWithPlayerRadius: number = 0;
    protected sightDotValue: number = 0;
    protected anim: ShapeStateController | undefined;
    protected lookAt: LookAt | undefined;
    protected has3DMovement: boolean = false;
    protected moveForce: number = 0;
    protected get myPosition() { return this.stateMachine.body.body.getPosition(); }
    override stateMachine: CharacterStateMachineLMent;

    constructor(name: string, stateMachine: CharacterStateMachineLMent) {
        super(name, stateMachine);
        this.stateMachine = stateMachine;


        this.alertZoneRadius = this.stateMachine.alertZoneRadius;
        this.interactWithPlayerRadius = this.stateMachine.interactZoneRadius;
        this.sightDotValue = this.stateMachine.sightDotValue;

        this.lookAt = this.stateMachine.body.getElement(LookAt);
        if (!this.lookAt)
            console.warn("LookAt component not found on Character");

        this.anim = this.stateMachine.body.getElement(ShapeStateController);
        if (!this.anim)
            console.warn("ShapeStateController component not found on Character");
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

    protected playerInSight(): boolean {
        const player = GameplayScene.instance.memory.player;
        if (player === undefined)
            return false;
        const enemyFwd = Helpers.forwardVector.applyQuaternion(this.stateMachine.characterBody.getRotation());
        const dotCheck = enemyFwd.dot(player.body.getPosition().clone().sub(this.stateMachine.characterBody.getPosition()).normalize());
        return dotCheck > this.sightDotValue;
    }

    protected playerInAlertRange(): boolean {
        const player = GameplayScene.instance.memory.player;
        if (player === undefined)
            return false;
        return this.stateMachine.characterBody.getPosition().distanceTo(player.body.getPosition()) < this.alertZoneRadius;
    }

    protected playerInInteractRange(): boolean {
        const player = GameplayScene.instance.memory.player;
        if (player === undefined)
            return false;
        return this.stateMachine.characterBody.getPosition().distanceTo(player.body.getPosition()) < this.interactWithPlayerRadius;
    }

    protected alertCondition(): boolean {
        return this.playerInAlertRange(); // This can have && playerInSight() if needed in children
    }

    protected interactCondition(): boolean {
        return this.playerInInteractRange(); // This can have && playerInSight() if needed in children
    }

    setLookAtTarget(target: Vector3) {
        if (this.lookAt)
            this.lookAt.changeTargetByVector(target);
    }

    lookAtPlayer() {
        if (this.lookAt)
            this.lookAt.changeTargetByBodyName(Constants.Player);
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

export class characterIdleState extends CharacterStateBase {

    idleCooldown: number;
    idleQuat: Quaternion | undefined;
    private idleTimer: number = 0;

    constructor(stateMachine: CharacterStateMachineLMent, idleCooldown: number, idleQuat: Quaternion | undefined = undefined) {
        super(CharacterStates.idle, stateMachine);
        this.idleQuat = idleQuat;
        this.idleCooldown = idleCooldown;
    }

    onEnterState(previousState: State | undefined): void {
        this.stopMoving();
        if (this.lookAt)
            this.lookAt.enabled = false;
        this.idleTimer = this.idleCooldown;
    }

    onExitState(nextState: State | undefined): void {
        if (this.lookAt)
            this.lookAt.enabled = true;
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        this.idleTimer -= dt;
        if (this.idleTimer <= 0) {
            this.stateMachine.switchState(CharacterStates.patrol);
        }
        else this.playStateAnimation(dt);

        let characterHead = this.stateMachine.body.body;
        let characterBody = this.stateMachine.characterBody
        if (characterBody.name != characterHead.name) {
            characterBody.setAngularVelocity(Helpers.zeroVector);
            characterHead.setRotation(characterHead.getRotation().slerp(characterBody.getRotation(), 0.15));
        }
        else {
            characterHead.setAngularVelocity(Helpers.zeroVector);
            if (this.idleQuat)
                characterHead.setRotation(characterHead.getRotation().slerp(this.idleQuat, 0.15));
        }

        if (this.alertCondition())
            this.stateMachine.switchState(CharacterStates.alert);
    }
}

export class characterAlertState extends CharacterStateBase {

    constructor(stateMachine: CharacterStateMachineLMent) {
        super(CharacterStates.alert, stateMachine);
    }

    onEnterState(previousState: State | undefined): void {
        this.stopMoving();
        this.lookAtPlayer();
    }

    onExitState(nextState: State | undefined): void {
        this.stopMoving();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        this.playStateAnimation(dt);
        this.alertAction();
        this.handleSwitchingToNextState(dt);
    }

    protected handleSwitchingToNextState(dt: number) {
        /* Override by children if needed */
        if (!this.alertCondition())
            this.stateMachine.switchState(CharacterStates.idle);
        else if (this.interactCondition())
            this.stateMachine.switchState(CharacterStates.interactWithPlayer);
    }

    protected alertAction() {
        /* Override by children if needed */
        this.stopMoving();
    }
}

export class characterInteractState extends CharacterStateBase {


    constructor(stateMachine: CharacterStateMachineLMent) {
        super(CharacterStates.interactWithPlayer, stateMachine);
    }

    onEnterState(previousState: State | undefined): void {
        this.stopMoving();
        this.lookAtPlayer();
    }

    onExitState(nextState: State | undefined): void {
        this.stopMoving();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        this.playStateAnimation(dt);
        this.handleSwitchingToNextState();
        this.interactAction();
    }

    protected handleSwitchingToNextState() {
        /* Override by children if needed */
        if (!this.interactCondition())
            if (this.alertCondition())
                this.stateMachine.switchState(CharacterStates.alert);
            else this.stateMachine.switchState(CharacterStates.idle);
    }

    protected interactAction() {
        /* Override by children if needed */
        this.stopMoving();
    }
}

export class characterPatrolState extends CharacterStateBase implements CollisionHandler {
    points: Vector3[] = [];
    currentPointIndex: number = 0;
    sound : SfxPlayer | undefined;
    private blockedRoadCounter: number = 0;
    get activePoint() { return this.points[this.currentPointIndex] };
    
    constructor(stateMachine: CharacterStateMachineLMent, points: Vector3[], patrolSpeed: number, movementForce: number, sound: SfxPlayer) {
        super(CharacterStates.patrol, stateMachine);
        this.points = points;
        this.movementSpeed = patrolSpeed;
        this.moveForce = movementForce;
        this.sound = sound;
    }

    onEnterState(previousState: State | undefined) {
        this.currentPointIndex++;
        if (this.currentPointIndex >= this.points.length)
            this.currentPointIndex = 0;
        if (this.lookAt)
            this.lookAt.changeTargetByVector(this.activePoint);
    }

    onExitState(nextState: State | undefined) {
        this.stopMoving();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        let distance = this.stateMachine.body.body.getPosition().clone().multiply(Helpers.xzVector).distanceTo(this.activePoint.clone().multiply(Helpers.xzVector));
        if (this.has3DMovement)
            distance = this.stateMachine.body.body.getPosition().distanceTo(this.activePoint);

        if (distance <= this.reachDestinationThreshold) {
            this.stateMachine.switchState(CharacterStates.idle);
        }
        else {
            if (this.lookAt && this.lookAt.lookAtComplete(0.1)) {
                this.moveForward();
                this.playStateAnimation(dt);
            }
        }

        if (this.alertCondition())
            this.stateMachine.switchState(CharacterStates.alert);
    }

    onCollision(info: CollisionInfo): void {
        const myFwd = Helpers.forwardVector.applyQuaternion(this.stateMachine.body.body.getRotation());
        const myRight = Helpers.rightVector.applyQuaternion(this.stateMachine.body.body.getRotation());
        const dotVal = info.getDeltaVSelf().normalize().dot(myFwd);
        let nextPoint = this.points[(this.currentPointIndex + 1) % this.points.length];

        if (dotVal < -.5) {
            const currentPos = this.stateMachine.body.body.getPosition();
            this.stateMachine.body.body.setPosition(currentPos.clone().add(myFwd.multiplyScalar(-0.3)));
            this.points[this.currentPointIndex] = currentPos.clone();
            if (currentPos.distanceTo(nextPoint) <= 2)
                this.points[(this.currentPointIndex + 1) % this.points.length] = currentPos.clone().add(myRight.multiplyScalar(Math.random() + 3));

            this.stateMachine.switchState(CharacterStates.idle);
        }
    }
}


export class EnemyAlertState extends characterAlertState {

    alertCooldown: number;
    alertWarmUp: number;
    attackState: CharacterStates;
    private alertCooldownTimer: number = 0;

    constructor(stateMachine: CharacterStateMachineLMent, alertCooldown: number, alertWarmUp: number, attackState: CharacterStates) {
        super(stateMachine);

        this.alertCooldown = alertCooldown;
        this.alertWarmUp = alertWarmUp;
        this.attackState = attackState;
    }

    override handleSwitchingToNextState(dt: number) {
        if (this.alertCondition())
            this.warmUp(dt);
        else this.coolDown(dt);
    }

    isWarmingUp: boolean = false;
    warmUp(dt: number) {
        if (!this.isWarmingUp) {
            this.alertCooldownTimer = this.alertWarmUp;
            this.isWarmingUp = true;
            this.isCoolingDown = false;
        }
        this.alertCooldownTimer -= dt;
        if (this.alertCooldownTimer <= 0) {
            this.alertCooldownTimer = this.alertWarmUp;
            this.stateMachine.switchState(this.attackState);
        }
    }

    isCoolingDown: boolean = false;
    coolDown(dt: number) {
        if (!this.isCoolingDown) {
            this.alertCooldownTimer = this.alertCooldown;
            this.isCoolingDown = true;
            this.isWarmingUp = false;
        }
        this.alertCooldownTimer -= dt;
        if (this.alertCooldownTimer <= 0) {
            this.alertCooldownTimer = this.alertCooldown;
            this.stateMachine.switchState(CharacterStates.patrol);
        }
    }

}

export class EnemyChaseState extends CharacterStateBase {

    sound: SfxPlayer | undefined;

    constructor(stateMachine: CharacterStateMachineLMent, chaseSpeed: number, movementForce: number, sound: SfxPlayer) {
        super(CharacterStates.chase, stateMachine);
        
        this.movementSpeed = chaseSpeed;
        this.moveForce = movementForce;
        this.sound = sound;
    }

    onEnterState(previousState: State | undefined) {
        this.stopMoving();
        this.lookAtPlayer();
    }

    onExitState(nextState: State | undefined) {
        this.stopMoving();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        if (this.alertCondition()) {
            this.moveForward();
            this.playStateAnimation(dt);
        }
        else this.stateMachine.switchState(CharacterStates.alert);

    }

    
}

export class EnemyChargeState extends CharacterStateBase implements CollisionHandler {

    targetPosition: Vector3 = Helpers.zeroVector;

    constructor(stateMachine: CharacterStateMachineLMent, chargeSpeed: number, movementForce: number) {
        super(CharacterStates.chase, stateMachine);

        this.movementSpeed = chargeSpeed;
        this.moveForce = movementForce;
    }

    onEnterState(previousState: State | undefined) {
        this.stopMoving();
        let player = GameplayScene.instance.memory.player;
        if (player)
            this.targetPosition = player.body.getPosition().clone();
        this.setLookAtTarget(this.targetPosition);
    }

    onExitState(nextState: State | undefined) {
        this.stopMoving();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        let distance = this.myPosition.distanceTo(this.targetPosition);
        let dotCheck = Helpers.forwardVector.applyQuaternion(this.stateMachine.characterBody.getRotation()).dot(this.targetPosition.clone().sub(this.myPosition).normalize());
        if (distance > this.reachDestinationThreshold && dotCheck > 0) {
            this.moveForward();
            this.playStateAnimation(dt);
        }
        else this.stateMachine.switchState(CharacterStates.alert);

    }

    onCollision(info: CollisionInfo): void {
        const myFwd = Helpers.forwardVector.applyQuaternion(this.stateMachine.body.body.getRotation());
        const dotVal = info.getDeltaVSelf().normalize().dot(myFwd);
        if(dotVal < -.5)
            this.stateMachine.switchState(CharacterStates.alert);
    }
}

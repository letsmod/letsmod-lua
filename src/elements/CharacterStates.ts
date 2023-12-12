import { LookAt } from "elements/LookAt";
import { ShapeStateController } from "elements/ShapeStateController";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { UpdateHandler } from "engine/MessageHandlers";
import { State, StateMachineLMent } from "engine/StateMachineLMent";
import { Quaternion, Vector3 } from "three";

export enum CharacterStates {
    idle = "idle",
    interactWithPlayer = "interactWithPlayer",
    patrol = "patrol",
    dialogue = "dialogue",
    alert = "alert",
    chase = "chase",
    charge = "charge",
}

export abstract class CharacterStateBase extends State implements UpdateHandler {

    protected reachDestinationThreshold: number = 0.5;
    protected movementSpeed: number = 0;
    protected alertZoneRadius: number = 0;
    protected interactWithPlayerRadius: number = 0;
    protected anim: ShapeStateController | undefined;
    protected lookAt: LookAt | undefined;
    protected isFlying: boolean = false;
    protected moveForce: number = 0;
    protected get myPosition() { return this.stateMachine.body.body.getPosition(); }

    constructor(name: string, stateMachine: StateMachineLMent, alertZoneRadius: number, interactWithPlayerRadius?: number) {
        super(name, stateMachine);
        
        this.alertZoneRadius = alertZoneRadius;
        if(interactWithPlayerRadius)
            this.interactWithPlayerRadius = interactWithPlayerRadius;
        else this.interactWithPlayerRadius = alertZoneRadius;

        this.lookAt = this.stateMachine.body.getElement(LookAt);
        if (!this.lookAt)
            console.warn("LookAt component not found on Character");

        this.anim = this.stateMachine.body.getElement(ShapeStateController);
        if (!this.anim)
            console.warn("ShapeStateController component not found on Character");
    }

    stopMoving() {
        let newVelo = Helpers.zeroVector;

        if (!this.isFlying)
            newVelo = this.stateMachine.body.body.getVelocity().clone().multiply(Helpers.upVector);

        this.stateMachine.body.body.setVelocity(newVelo);
        this.stateMachine.body.body.setAngularVelocity(Helpers.zeroVector);
    }

    flyForward() {
        // TODO [Ahmad]: This has to use applyCentralForce instead of setVelocity
        let fwdVelo = Helpers.forwardVector.multiplyScalar(this.movementSpeed).applyQuaternion(this.stateMachine.body.body.getRotation());
        this.stateMachine.body.body.setVelocity(fwdVelo);
    }

    walkForward() {
        let currentVelo = this.stateMachine.body.body.getVelocity().clone().multiply(Helpers.xzVector).length();
        if (currentVelo < this.movementSpeed) {
            let force = Helpers.forwardVector.multiplyScalar(this.moveForce).applyQuaternion(this.stateMachine.body.body.getRotation());
            this.stateMachine.body.body.applyCentralForce(force)
        }
        this.stateMachine.body.body.setAngularVelocity(Helpers.zeroVector);
    }

    moveForward() {
        if (this.isFlying)
            this.flyForward();
        else this.walkForward();
    }

    protected playerInSight(): boolean {
        const player = GameplayScene.instance.memory.player;
        if (player === undefined)
            return false;
        const enemyFwd = Helpers.forwardVector.applyQuaternion(this.stateMachine.body.body.getRotation());
        const dotCheck = enemyFwd.dot(player.body.getPosition().clone().sub(this.stateMachine.body.body.getPosition()).normalize());
        return dotCheck > 0.5;
    }

    protected playerInAlertRange(): boolean {
        const player = GameplayScene.instance.memory.player;
        if (player === undefined)
            return false;
        return this.stateMachine.body.body.getPosition().distanceTo(player.body.getPosition()) < this.alertZoneRadius;
    }

    protected playerInInteractRange(): boolean {
        const player = GameplayScene.instance.memory.player;
        if (player === undefined)
            return false;
        return this.stateMachine.body.body.getPosition().distanceTo(player.body.getPosition()) < this.interactWithPlayerRadius;
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
            this.lookAt.changeTargetByBodyName("player");
    }

    protected playStateAnimation(dt: number) {
        /* Override by children */
    }

    onUpdate(dt: number): void {
        if (this.stateMachine.body.body.getPosition().y < -1)
            GameplayScene.instance.destroyBody(this.stateMachine.body);

        /* Override by children */
    }

    onEnterState(previousState: State | undefined): void {    }

    onExitState(nextState: State | undefined): void {    }
}

export class characterIdleState extends CharacterStateBase {

    idleCooldown: number;
    idleQuat: Quaternion | undefined;
    private idleTimer: number = 0;

    constructor(stateMachine: StateMachineLMent,alertRadius: number, idleCooldown: number,  interactRadius?: number, idleQuat: Quaternion | undefined = undefined) {
        super(CharacterStates.idle, stateMachine, alertRadius, interactRadius);
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

        if (this.idleQuat) {
            let thisBody = this.stateMachine.body.body;
            thisBody.setRotation(thisBody.getRotation().slerp(this.idleQuat, 0.15));
        }

        if (this.alertCondition())
            this.stateMachine.switchState(CharacterStates.alert);
    }
}

export class characterAlertState extends CharacterStateBase {

    constructor(stateMachine: StateMachineLMent, alertRadius: number, interactRadius?: number) {
        super(CharacterStates.alert, stateMachine, alertRadius, interactRadius);
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

    protected handleSwitchingToNextState(dt:number) {
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


    constructor(stateMachine: StateMachineLMent, alertRadius: number, interactRadius?: number) {
        super(CharacterStates.interactWithPlayer, stateMachine, alertRadius, interactRadius);
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

export class characterPatrolState extends CharacterStateBase {
    points: Vector3[] = [];
    currentPointIndex: number = 0;
    get activePoint() { return this.points[this.currentPointIndex] };

    constructor(stateMachine: StateMachineLMent, points: Vector3[], patrolSpeed: number, movementForce: number,alertRadius: number, interactRadius?: number) {
        super(CharacterStates.patrol, stateMachine, alertRadius, interactRadius);
        this.points = points;
        this.movementSpeed = patrolSpeed;
        this.moveForce = movementForce;
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
        if (this.isFlying)
            distance = this.stateMachine.body.body.getPosition().distanceTo(this.activePoint);

        if (distance <= this.reachDestinationThreshold) {
            this.stateMachine.switchState(CharacterStates.idle);
        }
        else {
            this.moveForward();
            this.playStateAnimation(dt);
        }

        if (this.alertCondition())
            this.stateMachine.switchState(CharacterStates.alert);
    }
}


export class EnemyAlertState extends characterAlertState {

    alertCooldown: number;
    alertWarmUp: number;
    attackState: CharacterStates;
    private alertCooldownTimer: number = 0;

    constructor(stateMachine: StateMachineLMent, alertZoneRadius: number, alertCooldown: number, alertWarmUp: number, attackState: CharacterStates) {
        super(stateMachine, alertZoneRadius);

        this.alertCooldown = alertCooldown;
        this.alertWarmUp = alertWarmUp;
        this.attackState = attackState;
    }

    override handleSwitchingToNextState(dt:number) {
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

    constructor(stateMachine: StateMachineLMent, chaseSpeed: number, alertZoneRadius: number, movementForce: number) {
        super(CharacterStates.chase, stateMachine, alertZoneRadius);

        this.movementSpeed = chaseSpeed;
        this.moveForce = movementForce;
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

export class EnemyChargeState extends CharacterStateBase {

    targetPosition: Vector3 = Helpers.zeroVector;

    constructor(stateMachine: StateMachineLMent, chargeSpeed: number, alertZoneRadius: number, movementForce: number) {
        super(CharacterStates.chase, stateMachine, alertZoneRadius);

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
        if (distance > this.reachDestinationThreshold) {
            this.moveForward();
            this.playStateAnimation(dt);
        }
        else this.stateMachine.switchState(CharacterStates.alert);

    }
}
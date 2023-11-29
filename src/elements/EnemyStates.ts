import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { UpdateHandler } from "engine/MessageHandlers";
import { State, StateMachineLMent } from "engine/StateMachineLMent";
import { Quaternion, Vector3 } from "three";
import { LookAt } from "./LookAt";
import { ShapeStateController } from "./ShapeStateController";

export enum EnemyStates {
    idle = "enemyIdle",
    patrol = "enemyPatrol",
    alert = "enemyAlert",
    chase = "enemyChase",
    charge = "enemyCharge"
}

export abstract class EnemyStateBase extends State implements UpdateHandler {

    onEnterState(previousState: State | undefined): void {

    }

    onExitState(nextState: State | undefined): void {

    }

    protected reachDestinationThreshold: number = 0.5;
    protected movementSpeed: number = 0;
    protected alertZoneRadius: number = 0;
    protected anim: ShapeStateController | undefined;
    protected lookAt: LookAt | undefined;
    protected isFlyingEnemy: boolean = false;
    protected moveForce: number = 0;


    protected get playerIsClose() {
        let player = GameplayScene.instance.memory.player;
        return player !== undefined && this.stateMachine.body.body.getPosition().distanceTo(player.body.getPosition()) < this.alertZoneRadius;
    }

    protected get myPosition() { return this.stateMachine.body.body.getPosition(); }

    constructor(name: string, stateMachine: StateMachineLMent, alertZoneRadius: number) {
        super(name, stateMachine);

        this.alertZoneRadius = alertZoneRadius;

        this.lookAt = this.stateMachine.body.getElement(LookAt);
        if (!this.lookAt)
            console.log("No LookAt element is found on enemy state: " + name);

        this.anim = this.stateMachine.body.getElement(ShapeStateController);
        if (!this.anim)
            console.log("No ShapeStateController Element is found on enemy state: " + name + ", this would prevent animations from playing.");
    }

    stopMoving() {
        let newVelo = Helpers.zeroVector;

        if (!this.isFlyingEnemy)
            newVelo = this.stateMachine.body.body.getVelocity().clone().multiply(Helpers.upVector);

        this.stateMachine.body.body.setVelocity(newVelo);
        this.stateMachine.body.body.setAngularVelocity(Helpers.zeroVector);
    }

    flyForward() {
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
        if (this.isFlyingEnemy)
            this.flyForward();
        else this.walkForward();
    }

    onUpdate(dt: number): void {
        /* Override by children */
    }

    setLookAtTarget(target: Vector3) {
        if (this.lookAt)
            this.lookAt.changeTargetByVector(target);
    }

    lookAtPlayer() {
        if (this.lookAt)
            this.lookAt.changeTargetByBodyName("player");
    }

    playStateAnimation(dt: number) {
        /* Override by children */
    }

    switchToAlert() {
        this.stateMachine.switchState(EnemyStates.alert);
    }

    switchToIdle() {
        this.stateMachine.switchState(EnemyStates.idle);
    }

    switchToPatrol() {
        this.stateMachine.switchState(EnemyStates.patrol);
    }

    switchToAttack(attackState: EnemyStates) {
        this.stateMachine.switchState(attackState);
    }
}

export class EnemyPatrolState extends EnemyStateBase implements UpdateHandler {

    points: Vector3[] = [];
    currentPointIndex: number = 0;
    get activePoint() { return this.points[this.currentPointIndex] };

    constructor(stateMachine: StateMachineLMent, points: Vector3[], patrolSpeed: number, alertZone: number, movementForce: number) {
        super(EnemyStates.patrol, stateMachine, alertZone);

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

        let distance = this.stateMachine.body.body.getPosition().clone().multiply(Helpers.xzVector).distanceTo(this.activePoint.clone().multiply(Helpers.xzVector));
        if (this.isFlyingEnemy)
            distance = this.stateMachine.body.body.getPosition().distanceTo(this.activePoint);

        if (distance <= this.reachDestinationThreshold) {
            this.switchToIdle();
        }
        else {
            this.moveForward();
            this.playStateAnimation(dt);
        }

        if (this.playerIsClose)
            this.switchToAlert();
    }

}

export class EnemyAlertState extends EnemyStateBase implements UpdateHandler {

    alertZoneRadius: number;
    alertCooldown: number;
    alertWarmUp: number;
    attackState: EnemyStates;
    private alertCooldownTimer: number = 0;

    constructor(stateMachine: StateMachineLMent, alertZoneRadius: number, alertCooldown: number, alertWarmUp: number, attackState: EnemyStates) {
        super(EnemyStates.alert, stateMachine, alertZoneRadius);
        this.alertZoneRadius = alertZoneRadius;
        this.alertCooldown = alertCooldown;
        this.alertWarmUp = alertWarmUp;
        this.attackState = attackState;
    }

    onEnterState(previousState: State | undefined) {
        this.stopMoving();
        this.lookAtPlayer();
    }

    onExitState(nextState: State | undefined) {
        this.stopMoving();
    }

    onUpdate(dt: number): void {

        if (this.playerIsClose)
            this.warmUp(dt);
        else this.coolDown(dt);

        this.alertMovement(dt);
        this.playStateAnimation(dt);
    }

    alertMovement(dt: number) {
        /* Override by children if needed */
        /* Default is stopping in place */
        this.stopMoving();
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
            this.switchToAttack(this.attackState);
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
            this.switchToPatrol();
        }
    }

}

export class EnemyChaseState extends EnemyStateBase implements UpdateHandler {

    constructor(stateMachine: StateMachineLMent, chaseSpeed: number, alertZoneRadius: number, movementForce:number) {
        super(EnemyStates.chase, stateMachine, alertZoneRadius);

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
        if (this.playerIsClose) {
            this.moveForward();
            this.playStateAnimation(dt);
        }
        else this.switchToAlert();

    }
}

export class EnemyChargeState extends EnemyStateBase implements UpdateHandler {

    targetPosition: Vector3 = Helpers.zeroVector;

    constructor(stateMachine: StateMachineLMent, chargeSpeed: number, alertZoneRadius: number, movementForce:number) {
        super(EnemyStates.chase, stateMachine, alertZoneRadius);

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

        let distance = this.myPosition.distanceTo(this.targetPosition);
        if (distance > this.reachDestinationThreshold) {
            this.moveForward();
            this.playStateAnimation(dt);
        }
        else this.switchToAlert();

    }
}

export class EnemyIdleState extends EnemyStateBase implements UpdateHandler {

    idleCooldown: number;
    idleQuat: Quaternion | undefined;
    private idleTimer: number = 0;

    constructor(stateMachine: StateMachineLMent, alertZoneRadius: number, idleCooldown: number, idleQuat: Quaternion | undefined = undefined) {
        super(EnemyStates.idle, stateMachine, alertZoneRadius);
        this.idleQuat = idleQuat;
        this.idleCooldown = idleCooldown;
    }

    onEnterState(previousState: State | undefined) {
        this.stopMoving();
        if (this.lookAt)
            this.lookAt.enabled = false;
        this.idleTimer = this.idleCooldown;
    }

    onExitState(nextState: State | undefined) {
        if (this.lookAt)
            this.lookAt.enabled = true;
    }

    onUpdate(dt: number): void {
        this.idleTimer -= dt;
        if (this.idleTimer <= 0) {
            this.switchToPatrol();
        }
        else this.playStateAnimation(dt);

        if (this.idleQuat) {
            let thisBody = this.stateMachine.body.body;
            thisBody.setRotation(thisBody.getRotation().slerp(this.idleQuat, 0.15));
        }

        if (this.playerIsClose)
            this.switchToAlert();
    }
}
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { UpdateHandler } from "engine/MessageHandlers";
import { State, StateMachineLMent } from "engine/StateMachineLMent";
import { Vector3 } from "three";
import { LookAt } from "./LookAt";



export class PatrolState extends State implements UpdateHandler {

    startPosition: Vector3;
    endPosition: Vector3;
    detectionRadius: number;
    speed: number;
    patrolDelay;
    lookAt: LookAt;
    isStationary: boolean = false;
    private isFlying: boolean = false;

    private turnBackDelayFunc: any | undefined;
    private turnedBack: boolean = false;
    constructor(name: string, stateMachine: StateMachineLMent, startPosition: Vector3, endPosition: Vector3, speed: number, patrolDelay: number, detectionRadius: number, lookAt: LookAt, flying: boolean = false) {
        super(name, stateMachine);
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.speed = speed;
        this.patrolDelay = patrolDelay;
        this.detectionRadius = detectionRadius;
        this.lookAt = lookAt;
        this.isFlying = flying;

        this.isStationary = this.startPosition.distanceTo(this.endPosition) <= 0.1;
    }

    onEnterState(previousState: State | undefined) {
        this.turnedBack = false;
        this.lookAt.changeTargetByVector(this.endPosition);
    }

    onExitState(nextState: State | undefined) {
        // Nothing so far.
    }

    onUpdate(dt: number): void {
        if (this.isStationary)
            return;

        let distance = this.stateMachine.body.body.getPosition().distanceTo(this.endPosition);
        let turnThreshold = 0.2;

        if (distance < turnThreshold) {
            this.stop();
            this.turnBack();
        }
        else this.move(dt);

        this.chaseCheck();
    }

    chaseCheck() {
        let player = GameplayScene.instance.memory.player;

        if (player === undefined || this.stateMachine.body.body.getPosition().distanceTo(player.body.getPosition()) > this.detectionRadius)
            return;

        GameplayScene.instance.dispatcher.removeQueuedFunction(this.turnBackDelayFunc);
        this.stateMachine.switchState("chase");
    }

    move(dt: number) {
        let gravity = this.stateMachine.body.body.getVelocity().clone().multiply(Helpers.upVector);
        let fwdVelo = Helpers.forwardVector.multiplyScalar(this.speed).applyQuaternion(this.stateMachine.body.body.getRotation());

        if (!this.isFlying)
            fwdVelo.add(gravity);

        this.stateMachine.body.body.setVelocity(fwdVelo);
        this.moveAnimation(dt);
    }

    stop() {

        let newVelo = Helpers.zeroVector;
        if (!this.isFlying)
            newVelo = this.stateMachine.body.body.getVelocity().clone().multiply(Helpers.upVector);

        this.stateMachine.body.body.setVelocity(newVelo);
        this.idleAnimation();
    }

    turnBack() {
        if (this.turnedBack) return;
        this.turnedBack = true;
        this.turnBackDelayFunc = GameplayScene.instance.dispatcher.queueDelayedFunction(this.stateMachine, () => {
            if (this.name == "patrolForward")
                this.stateMachine.switchState("patrolBackward");
            else this.stateMachine.switchState("patrolForward");
        }, this.patrolDelay);

    }

    moveAnimation(dt: number) {
        /* To be overridden by children */
    }

    idleAnimation() {
        /* To be overridden by children */
    }
}

export class ChaseState extends State implements UpdateHandler {

    speed: number;
    lookAt: LookAt;
    chaseRange: number;
    delayedPatrolFunc: any | undefined;
    private isFlying: boolean = false;

    constructor(name: string, stateMachine: StateMachineLMent, speed: number, chaseRange: number, lookAt: LookAt, flying: boolean = false) {
        super(name, stateMachine);
        this.speed = speed;
        this.chaseRange = chaseRange;
        this.lookAt = lookAt;
        this.isFlying = flying;
    }

    onEnterState(previousState: State | undefined) {
        this.lookAt.changeTargetByBodyName("player");
    }

    onExitState(nextState: State | undefined) {

    }

    onUpdate(dt: number): void {
        let player = GameplayScene.instance.memory.player;
        if (player === undefined) return;
        let distance = this.stateMachine.body.body.getPosition().distanceTo(player.body.getPosition());
        if (distance > this.chaseRange)
            this.setAlert();
        else {
            if (this.delayedPatrolFunc !== undefined)
                GameplayScene.instance.dispatcher.removeQueuedFunction(this.delayedPatrolFunc);
            this.move(dt);
        }
    }

    stop() {
        let newVelo = Helpers.zeroVector;
        
        if (!this.isFlying) 
            newVelo = this.stateMachine.body.body.getVelocity().clone().multiply(Helpers.upVector);

        this.stateMachine.body.body.setVelocity(newVelo);
    }

    move(dt: number) {
        let gravity = this.stateMachine.body.body.getVelocity().clone().multiply(Helpers.upVector);
        let fwdVelo = Helpers.forwardVector.multiplyScalar(this.speed).applyQuaternion(this.stateMachine.body.body.getRotation());
        if (!this.isFlying)
            fwdVelo.add(gravity);
        this.stateMachine.body.body.setVelocity(fwdVelo);
        this.chaseAnimation(dt);
    }

    setAlert() {
        this.stop();
        this.stateMachine.switchState("alert");
    }

    chaseAnimation(dt: number) {
        /* Override by children */
    }
}

export class AlertState extends State implements UpdateHandler {

    lookAt: LookAt;
    chaseRange: number;
    delayedPatrolFunc: any | undefined;
    alertCooldown: number;
    private isFlying: boolean = false;

    constructor(name: string, stateMachine: StateMachineLMent, speed: number, chaseRange: number, alertCooldown: number, lookAt: LookAt, flying:boolean=false) {
        super(name, stateMachine);
        this.chaseRange = chaseRange;
        this.lookAt = lookAt;
        this.alertCooldown = alertCooldown;
        this.isFlying = flying;
    }

    onEnterState(previousState: State | undefined) {
        this.setLookAtTarget();
        this.backToPatrol();
    }

    onExitState(nextState: State | undefined) {

    }

    onUpdate(dt: number): void {
        let player = GameplayScene.instance.memory.player;
        if (player === undefined) return;
        let distance = this.stateMachine.body.body.getPosition().distanceTo(player.body.getPosition());
        if (distance <= this.chaseRange) {
            if (this.delayedPatrolFunc !== undefined)
                GameplayScene.instance.dispatcher.removeQueuedFunction(this.delayedPatrolFunc);
            this.backToChase();
        } else {
            this.alertMovement(dt);
            this.alertAnimation(dt);
        }

    }

    backToChase() {
        this.stateMachine.switchState("chase");
    }

    backToPatrol() {
        this.delayedPatrolFunc = GameplayScene.instance.dispatcher.queueDelayedFunction(this.stateMachine, () => {
            this.stateMachine.switchState("patrolForward");
        }, this.alertCooldown);
    }


    alertMovement(dt: number) {
        /* Override by children if needed */
        /* Default is stopping in place */
        let newVelo = Helpers.zeroVector;
        if(!this.isFlying)
            newVelo = this.stateMachine.body.body.getVelocity().clone().multiply(Helpers.upVector);
        this.stateMachine.body.body.setVelocity(newVelo);
    }

    setLookAtTarget() {
        /* Override by children if needed */
    }

    alertAnimation(dt: number) {
        /* Override by children */
    }
}
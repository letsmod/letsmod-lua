import { Helpers } from "engine/Helpers";
import { CharacterStateMachineLMent, CharacterStates, EnemyAlertState, EnemyChargeState, EnemyChaseState, characterIdleState, characterPatrolState } from "./CharacterStates";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { WalkerChaserEnemy } from "./WalkerChaserEnemy";
import { State } from "engine/StateMachineLMent";

class CircularAttackState extends EnemyChargeState {

    constructor(stateMachine: CharacterStateMachineLMent, chargeSpeed: number, movementForce: number) {
        super(stateMachine, chargeSpeed, movementForce);
    }

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("charge");
    }
    override onEnterState(previousState: State | undefined): void {
        this.has3DMovement = true;
        super.onEnterState(previousState);
        if (this.lookAt)
            this.lookAt.enabled = true;
        this.reachDestinationThreshold = 1;
    }

    getPlayerPosition() {
        return GameplayScene.instance.memory.player?.body.getPosition();
    }

}

class WalkerPatrol extends characterPatrolState {

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("walk");
    }

    override alertCondition(): boolean {
        return super.alertCondition();
    }
    override onEnterState(previousState: State | undefined): void {
        super.onEnterState(previousState);
        if (this.lookAt)
            this.lookAt.speed = 0.2;
    }
}

class WalkerChase extends EnemyChaseState {

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("chase");
    }
    override alertCondition(): boolean {
        return super.alertCondition();
    }
}


class WalkerAlert extends EnemyAlertState {

    circularForce: number;
    approachingSpeed: number;
    private random: boolean = false;

    constructor(stateMachine: CharacterStateMachineLMent, circularForce: number, alertCooldown: number, alertWarmUp: number, attackState: CharacterStates, approachingSpeed: number) {
        super(stateMachine, alertCooldown, alertWarmUp, attackState);
        this.circularForce = circularForce;
        this.approachingSpeed = approachingSpeed;
    }

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("alert")
    }

    performCircularMotion() {
        let playerPosition = this.getPlayerPosition();
        let enemyPosition = this.stateMachine.body.body.getPosition();
        if (!playerPosition) return;

        
        let directionToPlayer = playerPosition.clone().sub(enemyPosition).normalize();
        
        let perpendicularDirection = directionToPlayer.cross(Helpers.upVector).normalize()

        let forceMagnitude = this.circularForce ;

        let orbitForce = perpendicularDirection.multiplyScalar(-forceMagnitude);

        this.stateMachine.body.body.setVelocity(orbitForce);
        this.faceVelocityDirection();
    }

    faceVelocityDirection() {
        let velocity = this.stateMachine.body.body.getVelocity();
        if (velocity.lengthSq() > 0.0001) {
            let newOrientation = Helpers.NewQuaternion().setFromUnitVectors(Helpers.forwardVector, velocity.normalize());
            this.stateMachine.body.body.setRotation(newOrientation);
        }
    }

    approachSlowly() {
        let playerPosition = this.getPlayerPosition();
        if (!playerPosition) return;
        let directionToPlayer = playerPosition.clone().sub(this.stateMachine.body.body.getPosition()).normalize();

        let movementForce = directionToPlayer.multiplyScalar(this.approachingSpeed);
        this.stateMachine.body.body.applyCentralForce(movementForce);
    }


    getPlayerPosition() {
        return GameplayScene.instance.memory.player?.body.getPosition();
    }

    onEnterState(previousState: State | undefined): void {
        super.onEnterState(previousState);

        this.random = Math.random() < 0.5;

        if (this.random)
            if (this.lookAt){
                this.lookAt.speed = 1;
                this.lookAt.enabled = false;
            }
    }
    onExitState(nextState: State | undefined): void {
        super.onExitState(nextState);
        if (this.lookAt)
            this.lookAt.enabled = true;
    }


    override alertCondition(): boolean {
        return super.alertCondition();
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        if (this.random)
            this.performCircularMotion();
        else
            this.approachSlowly();
    }
}


class WalkerIdle extends characterIdleState {
    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("idle");
    }

    override alertCondition(): boolean {
        return super.alertCondition() && this.playerInSight();
    }
}

export class CircularChargingEnemy extends WalkerChaserEnemy {
    chargeSpeed: number;
    movementForce: number;
    alertCooldown: number;
    alertWarmUp: number;
    attackState: CharacterStates;
    circularForce: number;
    approachingSpeed: number;

    constructor(body: BodyHandle, id: number, params: Partial<CircularChargingEnemy> = {}) {
        super(body, id, params);

        this.chargeSpeed = params.chargeSpeed === undefined ? 1.5 : params.chargeSpeed;
        this.movementForce = params.movementForce === undefined ? 5 : params.movementForce;
        this.alertCooldown = params.alertCooldown === undefined ? 0 : params.alertCooldown;
        this.alertWarmUp = params.alertWarmUp === undefined ? Math.random() * (6 - 3) + 3 : params.alertWarmUp;
        this.attackState = params.attackState === undefined ? CharacterStates.charge : params.attackState;
        this.circularForce = params.circularForce === undefined ? 100 : params.circularForce;
        this.approachingSpeed = params.approachingSpeed === undefined ? 100 : params.approachingSpeed;
        this.alertZoneRadius = params.alertZoneRadius === undefined ? 10 : params.alertZoneRadius;
    }

    onInit() {
        super.onInit();

        let point1 = this.body.body.getPosition().clone();
        let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()))

        this.states = {
            [CharacterStates.charge]: new CircularAttackState(this, this.chargeSpeed, this.movementForce),
            [CharacterStates.patrol]: new WalkerPatrol(this, [point1, point2], this.patrolSpeed, this.movementForce),
            [CharacterStates.chase]: new WalkerChase(this, this.chaseSpeed, this.movementForce),
            [CharacterStates.alert]: new WalkerAlert(this, this.circularForce, this.alertCooldown, this.alertWarmUp, this.attackState, this.approachingSpeed),
            [CharacterStates.idle]: new WalkerIdle(this, this.idleCooldown)
        }
    }
}
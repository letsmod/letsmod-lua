import { Helpers } from "engine/Helpers";
import { CharacterStateNames, characterIdleState, characterPatrolState } from "../CharacterStates";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { State } from "engine/StateMachineLMent";
import { AbstractEnemyLMent } from "./AbstractEnemyLMent";
import { EnemyAlertState, EnemyChargeState, EnemyChaseState } from "../EnemyStates";
import { CharacterStateMachineLMent } from "../CharacterStateMachineLMent";


////TODO: ANAS PLEASE UPDATE THIS TO USE THE NEW STATE MACHINE SYSTEM

class CircularAttackState extends EnemyChargeState {

    constructor(stateMachine: CharacterStateMachineLMent, chargeSpeed: number, movementForce: number) {
        super(stateMachine);
    }

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState("charge");
    }
    override onEnterState(previousState: State | undefined): void {
        this.stateMachine.has3DMovement = true;
        super.onEnterState(previousState);
        if (this.lookAtElement)
            this.lookAtElement.enabled = true;
        this.stateMachine.moveReachThreshold = 1;
    }

    getPlayerPosition() {
        return GameplayScene.instance.memory.player?.body.getPosition();
    }

}

class WalkerPatrol extends characterPatrolState {

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState("walk");
    }

    override onEnterState(previousState: State | undefined): void {
        super.onEnterState(previousState);
        if (this.lookAtElement)
            this.lookAtElement.speed = 0.2;
    }
}

class WalkerChase extends EnemyChaseState {

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState("chase");
    }
}


class WalkerAlert extends EnemyAlertState {

    circularForce: number;
    approachingSpeed: number;
    private random: boolean = false;

    constructor(stateMachine: CharacterStateMachineLMent, circularForce: number, alertCooldown: number, alertWarmUp: number, attackState: CharacterStateNames, approachingSpeed: number) {
        super(stateMachine);
        this.circularForce = circularForce;
        this.approachingSpeed = approachingSpeed;
    }

    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState("alert")
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
            if (this.lookAtElement){
                this.lookAtElement.speed = 1;
                this.lookAtElement.enabled = false;
            }
    }
    onExitState(nextState: State | undefined): void {
        super.onExitState(nextState);
        if (this.lookAtElement)
            this.lookAtElement.enabled = true;
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
    override playCustomAnimation(dt: number): void {
        if (this.customAnimator)
            this.customAnimator.playState("idle");
    }
}

export class CircularChargingEnemy extends AbstractEnemyLMent {
    chargeSpeed: number;
    movementForce: number;
    alertCooldown: number;
    alertWarmUp: number;
    attackState: CharacterStateNames;
    circularForce: number;
    approachingSpeed: number;

    constructor(body: BodyHandle, id: number, params: Partial<CircularChargingEnemy> = {}) {
        super(body, id, params);

        this.chargeSpeed = params.chargeSpeed === undefined ? 1.5 : params.chargeSpeed;
        this.movementForce = params.movementForce === undefined ? 5 : params.movementForce;
        this.alertCooldown = params.alertCooldown === undefined ? 0 : params.alertCooldown;
        this.alertWarmUp = params.alertWarmUp === undefined ? Math.random() * (6 - 3) + 3 : params.alertWarmUp;
        this.attackState = params.attackState === undefined ? CharacterStateNames.charge : params.attackState;
        this.circularForce = params.circularForce === undefined ? 100 : params.circularForce;
        this.approachingSpeed = params.approachingSpeed === undefined ? 100 : params.approachingSpeed;
        this.alertZoneRadius = params.alertZoneRadius === undefined ? 10 : params.alertZoneRadius;
    }

    onInit() {
        super.onInit();

        let point1 = this.body.body.getPosition().clone();
        //let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()))

        this.states = {
            // [CharacterStates.charge]: new CircularAttackState(this, this.chargeSpeed, this.movementForce),
            // [CharacterStates.patrol]: new WalkerPatrol(this, [point1, point2], this.patrolSpeed),
            // //[CharacterStates.chase]: new WalkerChase(this, this.chaseSpeed),
            // [CharacterStates.alert]: new WalkerAlert(this, this.circularForce, this.alertCooldown, this.alertWarmUp, this.attackState, this.approachingSpeed),
            // [CharacterStates.idle]: new WalkerIdle(this)
        }
    }
}
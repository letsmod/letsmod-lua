import { BodyHandle } from "engine/BodyHandle";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { Helpers } from "engine/Helpers";
import { LookAt } from "./LookAt";
import { EnemyChaseState,EnemyAlertState, characterIdleState, EnemyChargeState, characterPatrolState, CharacterStates, CharacterStateMachineLMent } from "./CharacterStates";
import { Vector3 } from "three";
import { CollisionInfo } from "engine/MessageHandlers";

class FlyingPatrol extends characterPatrolState {

    constructor(stateMachine: CharacterStateMachineLMent, points: Vector3[], patrolSpeed: number)
    {
        super(stateMachine,points,patrolSpeed,5);
        this.reachDestinationThreshold = .8;
    }

    override onEnterState(previousState: State | undefined): void {
        this.has3DMovement = true;
        super.onEnterState(previousState);
    }

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("fly");
    }
}

class FlyingAlert extends EnemyAlertState{

    override onEnterState(previousState: State | undefined): void {
        this.has3DMovement = true;
        super.onEnterState(previousState);
    }

    override playStateAnimation(dt: number): void {
        if(this.anim)
            this.anim.playState("alert")
    }
}

class FlyingIdle extends characterIdleState{

    override onEnterState(previousState: State | undefined): void {
        this.has3DMovement = true;
        super.onEnterState(previousState);
    }

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("fly");
    }
}

class FlyingCharge extends EnemyChargeState{

    constructor(stateMachine: CharacterStateMachineLMent, chargeSpeed: number) {
        super(stateMachine,chargeSpeed,100);
    }
    
    override onEnterState(previousState: State | undefined): void {
        this.has3DMovement = true;
        super.onEnterState(previousState);
    }

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("charge");
    }

    onCollision(info: CollisionInfo): void {
        this.stateMachine.switchState(CharacterStates.alert);
    }
}

export class FlyingChargingEnemy extends CharacterStateMachineLMent {
    idleCooldown: number;
    patrolDistance: number;
    patrolSpeed: number;
    chargeSpeed: number;
    alertCooldown: number;
    alertWarmUp:number;

    private lookAtElement: LookAt | undefined;
    constructor(body: BodyHandle, id: number, params: Partial<FlyingChargingEnemy> = {}) {
        super(body, id, params);
        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.patrolSpeed = params.patrolSpeed === undefined ? 1 : params.patrolSpeed;
        this.chargeSpeed = params.chargeSpeed === undefined ? 1.2 : params.chargeSpeed;
        this.idleCooldown = params.idleCooldown === undefined ? 1 : params.idleCooldown;
        this.alertCooldown = params.alertCooldown === undefined ? 3 : params.alertCooldown;
        this.alertWarmUp = params.alertWarmUp === undefined ? 3 : params.alertWarmUp;
    }

    onInit() {
        super.onInit();
        let point1 = this.body.body.getPosition().clone();
        let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()))

        this.states = {
            [CharacterStates.patrol]: new FlyingPatrol(this, [point1, point2], this.patrolSpeed),
            [CharacterStates.alert]: new FlyingAlert(this,this.alertCooldown,this.alertWarmUp,CharacterStates.charge),
            [CharacterStates.idle]: new FlyingIdle(this,this.idleCooldown),
            [CharacterStates.charge]: new FlyingCharge(this,this.chargeSpeed)
        }

        this.switchState(CharacterStates.idle);
    }

    onStart() {
        this.body.body.setCustomGravity(Helpers.zeroVector);
        
        //TODO: Replace with an Element on the body.
        this.body.body.lockRotation(true,false,true);
        
        this.body.body.setAngularVelocity(Helpers.zeroVector);
        this.body.body.setVelocity(Helpers.zeroVector);
    }
}

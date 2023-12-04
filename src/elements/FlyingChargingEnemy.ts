import { BodyHandle } from "engine/BodyHandle";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { Helpers } from "engine/Helpers";
import { LookAt } from "./LookAt";
import { EnemyChaseState, EnemyPatrolState,EnemyAlertState, EnemyIdleState, EnemyStates, EnemyChargeState } from "./EnemyStates";
import { Vector3 } from "three";

class FlyingPatrol extends EnemyPatrolState {

    constructor(stateMachine: StateMachineLMent, points: Vector3[], patrolSpeed: number, alertZone: number)
    {
        super(stateMachine,points,patrolSpeed,alertZone,0);
    }

    override onEnterState(previousState: State | undefined): void {
        this.isFlyingEnemy = true;
        super.onEnterState(previousState);
    }

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("fly");
    }
}

class FlyingAlert extends EnemyAlertState{

    override onEnterState(previousState: State | undefined): void {
        this.isFlyingEnemy = true;
        super.onEnterState(previousState);
    }

    override playStateAnimation(dt: number): void {
        if(this.anim)
            this.anim.playState("alert")
    }
}

class FlyingIdle extends EnemyIdleState{

    override onEnterState(previousState: State | undefined): void {
        this.isFlyingEnemy = true;
        super.onEnterState(previousState);
    }

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("fly");
    }
}

class FlyingCharge extends EnemyChargeState{

    constructor(stateMachine: StateMachineLMent, chargeSpeed: number, alertZoneRadius: number) {
        super(stateMachine,chargeSpeed,alertZoneRadius,0);
    }
    
    override onEnterState(previousState: State | undefined): void {
        this.isFlyingEnemy = true;
        super.onEnterState(previousState);
    }

    override playStateAnimation(dt: number): void {
        if (this.anim)
            this.anim.playState("charge");
    }
}

export class FlyingChargingEnemy extends StateMachineLMent {
    idleCooldown: number;
    patrolDistance: number;
    patrolSpeed: number;
    chargeSpeed: number;
    alertZoneRadius: number;
    alertCooldown: number;
    alertWarmUp:number;

    private lookAtElement: LookAt | undefined;
    constructor(body: BodyHandle, id: number, params: Partial<FlyingChargingEnemy> = {}) {
        super(body, id, params);
        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.patrolSpeed = params.patrolSpeed === undefined ? 1 : params.patrolSpeed;
        this.chargeSpeed = params.chargeSpeed === undefined ? 1.2 : params.chargeSpeed;
        this.idleCooldown = params.idleCooldown === undefined ? 1 : params.idleCooldown;
        this.alertZoneRadius = params.alertZoneRadius === undefined ? 5 : params.alertZoneRadius;
        this.alertCooldown = params.alertCooldown === undefined ? 3 : params.alertCooldown;
        this.alertWarmUp = params.alertWarmUp === undefined ? 3 : params.alertWarmUp;
    }

    onInit() {

        this.lookAtElement = this.body.getElement(LookAt);
        if (this.lookAtElement === undefined)
        {
            console.log("No LookAt Element is found, it's needed for a walker enemy to work.");
            return;
        }

        let point1 = this.body.body.getPosition().clone();
        let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()))

        this.states = {
            [EnemyStates.patrol]: new FlyingPatrol(this, [point1, point2], this.patrolSpeed,this.alertZoneRadius),
            [EnemyStates.alert]: new FlyingAlert(this,this.alertZoneRadius,this.alertCooldown,this.alertWarmUp,EnemyStates.charge),
            [EnemyStates.idle]: new FlyingIdle(this,this.alertZoneRadius,this.idleCooldown),
            [EnemyStates.charge]: new FlyingCharge(this,this.chargeSpeed,this.idleCooldown)
        }

        this.switchState(EnemyStates.patrol);
    }

    onStart() {
        this.body.body.setCustomGravity(Helpers.zeroVector);
        this.body.body.lockRotation(true,false,true);
        this.body.body.setAngularVelocity(Helpers.zeroVector);
        this.body.body.setVelocity(Helpers.zeroVector);
    }
}

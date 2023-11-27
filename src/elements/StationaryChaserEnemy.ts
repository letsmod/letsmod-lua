import { BodyHandle } from "engine/BodyHandle";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { LookAt } from "./LookAt";
import { EnemyAlertState, EnemyChaseState, EnemyIdleState, EnemyPatrolState, EnemyStates } from "./EnemyStates";


export class StationaryChaserEnemy extends StateMachineLMent {
    backSpeed: number;
    chaseSpeed: number;
    alertZoneRadius: number;
    alertCooldown: number;
    alertWarmUp:number;

    private lookAtElement: LookAt | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<StationaryChaserEnemy> = {}) {
        super(body, id, params);
        this.backSpeed = params.backSpeed === undefined ? 1 : params.backSpeed;
        this.chaseSpeed = params.chaseSpeed === undefined ? 1 : params.chaseSpeed;
        this.alertZoneRadius = params.alertZoneRadius === undefined ? 3 : params.alertZoneRadius;
        this.alertCooldown = params.alertCooldown === undefined ? 2 : params.alertCooldown;
        this.alertWarmUp = params.alertWarmUp === undefined ? 0.2 : params.alertWarmUp;
    }

    onInit() {

        let point1 = this.body.body.getPosition().clone();
        let initQuat = this.body.body.getRotation().clone();
        this.states = {
            [EnemyStates.patrol]: new EnemyPatrolState(this, [point1], this.backSpeed,this.alertZoneRadius),
            [EnemyStates.chase]: new EnemyChaseState(this, this.chaseSpeed, this.alertZoneRadius),
            [EnemyStates.alert]: new EnemyAlertState(this,this.alertZoneRadius,this.alertCooldown,this.alertWarmUp,EnemyStates.chase),
            [EnemyStates.idle]: new EnemyIdleState(this,this.alertZoneRadius,999999,initQuat)
        }

        this.switchState(EnemyStates.patrol);
    }

    onStart() {
    }
}

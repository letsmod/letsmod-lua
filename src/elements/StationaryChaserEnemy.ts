import { BodyHandle } from "engine/BodyHandle";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { LookAt } from "./LookAt";
import { CharacterStates, EnemyAlertState, EnemyChaseState, characterIdleState, characterPatrolState } from "./CharacterStates";


export class StationaryChaserEnemy extends StateMachineLMent {
    backSpeed: number;
    chaseSpeed: number;
    alertZoneRadius: number;
    alertCooldown: number;
    alertWarmUp:number;
    movementForce:number;

    private lookAtElement: LookAt | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<StationaryChaserEnemy> = {}) {
        super(body, id, params);
        this.backSpeed = params.backSpeed === undefined ? 1 : params.backSpeed;
        this.chaseSpeed = params.chaseSpeed === undefined ? 1 : params.chaseSpeed;
        this.alertZoneRadius = params.alertZoneRadius === undefined ? 3 : params.alertZoneRadius;
        this.alertCooldown = params.alertCooldown === undefined ? 2 : params.alertCooldown;
        this.alertWarmUp = params.alertWarmUp === undefined ? 0.2 : params.alertWarmUp;
        this.movementForce = params.movementForce === undefined ? 50 : params.movementForce;
        
    }

    onInit() {

        let point1 = this.body.body.getPosition().clone();
        let initQuat = this.body.body.getRotation().clone();
        this.states = {
            [CharacterStates.patrol]: new characterPatrolState(this, [point1], this.backSpeed,this.movementForce,this.alertZoneRadius),
            [CharacterStates.chase]: new EnemyChaseState(this, this.chaseSpeed, this.alertZoneRadius,this.movementForce),
            [CharacterStates.alert]: new EnemyAlertState(this,this.alertZoneRadius,this.alertCooldown,this.alertWarmUp,CharacterStates.chase),
            [CharacterStates.idle]: new characterIdleState(this,this.alertZoneRadius,999999,undefined,initQuat)
        }

        this.switchState(CharacterStates.patrol);
    }

    onStart() {
    }
}

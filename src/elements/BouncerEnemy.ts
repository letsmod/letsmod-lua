import { BodyHandle } from "engine/BodyHandle";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { Helpers } from "engine/Helpers";
import { LookAt } from "./LookAt";
import { CharacterStateMachineLMent, EnemyAlertState, EnemyChaseState } from "./CharacterStates";
import { CharacterStates, characterIdleState, characterPatrolState } from "./CharacterStates";
import { SfxPlayer } from "./SfxPlayer";
import { GameplayScene } from "engine/GameplayScene";

class BouncerPatrol extends characterPatrolState {

    bounceTimer: number = 0;
    bounceAfter: number = 0.4;
    bounceForce: number = 250;

    override playStateAnimation(dt: number): void {
        this.bounceTimer += dt;
        if (this.bounceTimer >= this.bounceAfter) {
            this.bounceTimer = 0;
            this.stateMachine.body.body.applyCentralForce(Helpers.upVector.multiplyScalar(this.bounceForce * this.stateMachine.body.body.getMass()));
            const sound = this.stateMachine.body.getElementByName("Move") as SfxPlayer;
            if (sound) {
                const player = GameplayScene.instance.memory.player;

                if (!player) return;
                const playerPos = player.body.getPosition();
                const distance = playerPos.distanceTo(sound.body.body.getPosition());

                if (distance < sound.playDistance)
                    sound.playAudio();
            }
        }
    }
}

class BouncerChase extends EnemyChaseState {
    bounceTimer: number = 0;
    bounceAfter: number = 0.4;
    bounceForce: number = 250;

    override playStateAnimation(dt: number): void {
        this.bounceTimer += dt;
        if (this.bounceTimer >= this.bounceAfter) {
            this.bounceTimer = 0;
            this.stateMachine.body.body.applyCentralForce(Helpers.upVector.multiplyScalar(this.bounceForce * this.stateMachine.body.body.getMass()));
            const sound = this.stateMachine.body.getElementByName("Move") as SfxPlayer;
            if (sound) {
                sound.playAudio();
            }
        }
    }
}

export class BouncerEnemy extends CharacterStateMachineLMent {
    patrolDistance: number;
    patrolSpeed: number;
    idleDelay: number;
    chaseSpeed: number;
    alertCooldown: number;
    alertWarmUp: number;
    movementForce: number;

    private lookAtElement: LookAt | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<BouncerEnemy> = {}) {
        super(body, id, params);
        this.patrolDistance = params.patrolDistance === undefined ? 5 : params.patrolDistance;
        this.patrolSpeed = params.patrolSpeed === undefined ? 1 : params.patrolSpeed;
        this.chaseSpeed = params.chaseSpeed === undefined ? 1 : params.chaseSpeed;
        this.idleDelay = params.idleDelay === undefined ? 1 : params.idleDelay;
        this.alertCooldown = params.alertCooldown === undefined ? 2 : params.alertCooldown;
        this.alertWarmUp = params.alertWarmUp === undefined ? 0.2 : params.alertWarmUp;
        this.movementForce = params.movementForce === undefined ? 25 : params.movementForce;

        //slime zone radius: 3
    }

    onInit() {
        super.onInit();
        let point1 = this.body.body.getPosition().clone();
        let point2 = point1.clone().add(Helpers.forwardVector.multiplyScalar(this.patrolDistance).applyQuaternion(this.body.body.getRotation()))

        this.states = {
            [CharacterStates.patrol]: new BouncerPatrol(this, [point1, point2], this.patrolSpeed, this.movementForce),
            [CharacterStates.chase]: new BouncerChase(this, this.chaseSpeed, this.movementForce),
            [CharacterStates.alert]: new EnemyAlertState(this, this.alertCooldown, this.alertWarmUp, CharacterStates.chase),
            [CharacterStates.idle]: new characterIdleState(this, this.idleDelay)
        }

        this.switchState(CharacterStates.patrol);
    }

    onStart() {
    }
}

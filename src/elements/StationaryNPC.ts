import { BodyHandle } from "engine/BodyHandle";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { LookAt } from "./LookAt";
import { CharacterStates, EnemyAlertState, EnemyChaseState, characterAlertState, characterIdleState, characterInteractState, characterPatrolState } from "./CharacterStates";
import { Helpers } from "engine/Helpers";
import { Quaternion } from "three";
import { GameplayScene } from "engine/GameplayScene";

class NPCInteract extends characterInteractState {

    npcBody: BodyHandle | undefined;

    constructor(stateMachine: StateMachineLMent, alertZoneRadius: number, interactZoneRadius: number, npcBody: BodyHandle | undefined) {
        super(stateMachine, alertZoneRadius, interactZoneRadius);
        this.npcBody = npcBody;
    }

    override interactCondition(): boolean {
        return super.interactCondition() && this.playerInSight();
    }

    override playerInSight(): boolean {
        const player = GameplayScene.instance.memory.player;
        if (player === undefined || this.npcBody === undefined)
            return false;
        const enemyFwd = Helpers.forwardVector.applyQuaternion(this.npcBody.body.getRotation());
        const dotCheck = enemyFwd.dot(player.body.getPosition().clone().sub(this.stateMachine.body.body.getPosition()).normalize());
        return dotCheck > 0.2;
    }

    override interactAction(): void {
        console.log("Interacting with Player");
    }
}

class NPCAlert extends characterAlertState {

    npcBody: BodyHandle | undefined;

    constructor(stateMachine: StateMachineLMent, alertZoneRadius: number, interactZoneRadius: number, npcBody: BodyHandle | undefined) {
        super(stateMachine, alertZoneRadius, interactZoneRadius);
        this.npcBody = npcBody;
    }

    override playerInSight(): boolean {
        const player = GameplayScene.instance.memory.player;
        if (player === undefined || this.npcBody === undefined)
            return false;
        const enemyFwd = Helpers.forwardVector.applyQuaternion(this.npcBody.body.getRotation());
        const dotCheck = enemyFwd.dot(player.body.getPosition().clone().sub(this.stateMachine.body.body.getPosition()).normalize());
        return dotCheck > 0.2;
    }

    override alertCondition(): boolean {
        return super.alertCondition() && this.playerInSight();
    }
}

class NPCIdle extends characterIdleState {

    npcBody: BodyHandle | undefined;

    constructor(stateMachine: StateMachineLMent, alertZoneRadius: number, interactZoneRadius: number, initQuat: Quaternion, npcBody: BodyHandle | undefined) {
        super(stateMachine, alertZoneRadius,999999, interactZoneRadius, initQuat);
        this.npcBody = npcBody;
    }


    override playerInSight(): boolean {
        const player = GameplayScene.instance.memory.player;
        if (player === undefined || this.npcBody === undefined)
            return false;
        const enemyFwd = Helpers.forwardVector.applyQuaternion(this.npcBody.body.getRotation());
        const dotCheck = enemyFwd.dot(player.body.getPosition().clone().sub(this.stateMachine.body.body.getPosition()).normalize());
        return dotCheck > 0.2;
    }

    override alertCondition(): boolean {
        return super.alertCondition() && this.playerInSight();
    }
}


export class StationaryNPC extends StateMachineLMent {

    alertZoneRadius: number;
    interactZoneRadius: number;
    npcBodyName: string;
    private lookAtElement: LookAt | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<StationaryNPC> = {}) {
        super(body, id, params);
        this.alertZoneRadius = params.alertZoneRadius === undefined ? 6 : params.alertZoneRadius;
        this.interactZoneRadius = params.interactZoneRadius === undefined ? 2 : params.interactZoneRadius;
        this.npcBodyName = params.npcBodyName === undefined ? "NPCBody" : params.npcBodyName;
    }

    onInit() {
        const npcBody = Helpers.findBodyWithinGroup(this.body, this.npcBodyName);
        let initQuat = this.body.body.getRotation().clone();
        this.states = {
            [CharacterStates.idle]: new NPCIdle(this, this.alertZoneRadius, this.interactZoneRadius, initQuat, npcBody),
            [CharacterStates.alert]: new NPCAlert(this, this.alertZoneRadius, this.interactZoneRadius, npcBody),
            [CharacterStates.interactWithPlayer]: new NPCInteract(this, this.alertZoneRadius, this.interactZoneRadius, npcBody)
        }

        this.switchState(CharacterStates.idle);
    }

    onStart() {

    }
}

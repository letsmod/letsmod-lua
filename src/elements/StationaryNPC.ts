import { BodyHandle } from "engine/BodyHandle";
import { StateMachineLMent, State } from "engine/StateMachineLMent";
import { LookAt } from "./LookAt";
import { CharacterStateMachineLMent, CharacterStates, EnemyAlertState, EnemyChaseState, characterAlertState, characterIdleState, characterInteractState, characterPatrolState } from "./CharacterStates";
import { Helpers } from "engine/Helpers";
import { Quaternion } from "three";
import { GameplayScene } from "engine/GameplayScene";

class NPCInteract extends characterInteractState {

    constructor(stateMachine: CharacterStateMachineLMent) {
        super(stateMachine);
    }

    override interactCondition(): boolean {
        return super.interactCondition() && this.playerInSight();
    }

    override interactAction(): void {
        
    }
}

class NPCAlert extends characterAlertState {

    constructor(stateMachine: CharacterStateMachineLMent) {
        super(stateMachine);
    }

    override alertCondition(): boolean {
        return super.alertCondition() && this.playerInSight();
    }
}

class NPCIdle extends characterIdleState {

    constructor(stateMachine: CharacterStateMachineLMent, initQuat: Quaternion) {
        super(stateMachine,999999, initQuat);
    }

    override alertCondition(): boolean {
        return super.alertCondition() && this.playerInSight();
    }
}


export class StationaryNPC extends CharacterStateMachineLMent {

    constructor(body: BodyHandle, id: number, params: Partial<StationaryNPC> = {}) {
        super(body, id, params);
        this.characterBodyName = "NPCBody";
        this.sightDotValue = 0.2;
    }

    onInit() {
        super.onInit();
        let initQuat = this.body.body.getRotation().clone();
        this.states = {
            [CharacterStates.idle]: new NPCIdle(this, initQuat),
            [CharacterStates.alert]: new NPCAlert(this),
            [CharacterStates.interactWithPlayer]: new NPCInteract(this)
        }
        this.switchState(CharacterStates.idle);
    }

    onStart() {

    }
}


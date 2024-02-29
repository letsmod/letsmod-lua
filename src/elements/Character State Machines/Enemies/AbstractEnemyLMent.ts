import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";
import { CharacterStateNames } from "elements/Character State Machines/CharacterStates";
import { CharacterStateMachineLMent } from "../CharacterStateMachineLMent";


export abstract class AbstractEnemyLMent extends CharacterStateMachineLMent {

    attackAnim: string;

    constructor(body: BodyHandle, id: number, params: Partial<AbstractEnemyLMent> = {}) {
        super(body, id, params);
        this.attackAnim = params.attackAnim === undefined ? "custom" : params.attackAnim;
        this.defaultState = CharacterStateNames.patrol;
    }

    onInit() {
        super.onInit();
        this.switchState(CharacterStateNames.idle);
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        
        this.body.body.setAngularVelocity(Helpers.zeroVector);
    }

}

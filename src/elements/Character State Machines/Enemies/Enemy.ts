import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";
import { CharacterStateMachineLMent, CharacterStates, characterIdleState } from "elements/Character State Machines/CharacterStates";
import { MODscriptNavigateState, MODscriptLookAtState, MODscriptTalkState } from "../MODscriptStates";


export abstract class Enemy extends CharacterStateMachineLMent {

    attackAnim: string;

    constructor(body: BodyHandle, id: number, params: Partial<Enemy> = {}) {
        super(body, id, params);
        
        this.attackAnim = params.attackAnim === undefined ? "custom" : params.attackAnim;
    }

    onInit() {
        super.onInit();
        this.states = {
            [CharacterStates.navigate]: new MODscriptNavigateState(this, this.normalMoveAnim),
            [CharacterStates.idle]: new characterIdleState(this,this.idleAnim),
            [CharacterStates.lookAt]: new MODscriptLookAtState(this),
            [CharacterStates.talk]: new MODscriptTalkState(this,this.talkAnim)
        }

        this.switchState(CharacterStates.idle);
    }

    onUpdate(dt: number): void {
        super.onUpdate(dt);
        
        this.body.body.setAngularVelocity(Helpers.zeroVector);
    }

}

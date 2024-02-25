import { BodyHandle } from "engine/BodyHandle";
import { CharacterStateMachineLMent, CharacterStates, characterIdleState } from "./CharacterStates";
import { MODscriptNavigateState, MODscriptLookAtState, MODscriptThrowState, MODscriptTalkState } from "./MODscriptStates";


export class IdleNPC extends CharacterStateMachineLMent {
    throwForce: number;
    
    /*  You can also use the following properties from the parent class:
        ----------------------------------------------------------------
        movementForce
        maxNormalSpeed
        maxFastSpeed
        alertZoneRadius
        interactZoneRadius
        sightDotValue
        normalMoveAnim
        fastMoveAnim
        idleAnim
        alertAnim
        alertCooldown
        alertWarmUp
    */

    constructor(body: BodyHandle, id: number, params: Partial<IdleNPC> = {}) {
        super(body, id, params);
        this.sightDotValue = 0.2;
        this.throwForce = params.throwForce === undefined ? 400 : params.throwForce;
        this.moveReachThreshold = 2;
    }

    onInit() {
        super.onInit();
        let initQuat = this.body.body.getRotation().clone();
        this.states = {
            [CharacterStates.navigate]: new MODscriptNavigateState(this, this.normalMoveAnim),
            [CharacterStates.lookAt]: new MODscriptLookAtState(this),
            [CharacterStates.idle]: new characterIdleState(this,this.idleAnim),
            [CharacterStates.throw]: new MODscriptThrowState(this, this.throwForce),
            [CharacterStates.talk]: new MODscriptTalkState(this,this.talkAnim)
        }
        this.switchState(CharacterStates.idle);
    }

    onStart() {

    }
}


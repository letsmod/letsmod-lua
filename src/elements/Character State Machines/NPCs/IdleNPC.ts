import { BodyHandle } from "engine/BodyHandle";
import { CharacterStateNames, characterIdleState } from "../CharacterStates";
import { MODscriptNavigateState, MODscriptLookAtState, MODscriptThrowState, MODscriptTalkState } from "../MODscriptStates";
import { CharacterStateMachineLMent } from "../CharacterStateMachineLMent";


export class IdleNPC extends CharacterStateMachineLMent {

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
        this.moveReachThreshold = 2;
    }

    onInit() {
        super.onInit();
        this.states = {...this.MODscriptStates}
        this.switchState(CharacterStateNames.idle);
    }

    onStart() {

    }
}


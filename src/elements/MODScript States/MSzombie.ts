import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";
import { MODscriptIdleState,
         MODscriptLookAtState, 
         MODscriptNavigateState, 
         MODscriptStateMachineLMent, 
         MODscriptStates } from "./MODscriptStates";

class MS_ZombieNavigate extends MODscriptNavigateState {

    // override playStateAnimation(dt: number): void {
    //     if (this.anim)
    //         this.anim.playState("walk");
    // }
}

class MS_ZombieIdle extends MODscriptIdleState {

    // override playStateAnimation(dt: number): void {
    //     if (this.anim)
    //         this.anim.playState("idle");
    // }
}

class MS_ZombieLookAt extends MODscriptLookAtState{
    //Override anything here
}

export class MSzombie extends MODscriptStateMachineLMent{

    constructor(body: BodyHandle, id: number, params: Partial<MSzombie> = {}) {
        super(body, id, params);
    }

    onInit() {
        super.onInit();
        
        this.states = {
            [MODscriptStates.navigate]: new MS_ZombieNavigate(this),
            [MODscriptStates.idle]: new MS_ZombieIdle(this),
            [MODscriptStates.lookAt]: new MS_ZombieLookAt(this)
        }

        this.switchState(MODscriptStates.idle);
    }

    onStart() {
        this.body.body.lockRotation(true,false,true);
        this.body.body.setAngularVelocity(Helpers.zeroVector);
        this.body.body.setVelocity(Helpers.zeroVector);
    }
}

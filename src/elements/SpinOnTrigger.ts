import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";

export class SpinOnTrigger extends LMent implements TriggerHandler,UpdateHandler {

    maxSpin: number;
    angularVelocity: Vector3;
    lockPosition: boolean;
    triggerId: string;
    receivesTriggersWhenDisabled?: boolean | undefined;

    private _spin: number = 0;

    constructor(body: BodyHandle, id: number, params: Partial<SpinOnTrigger> = {}) {
        super(body, id, params);
        this.maxSpin = params.maxSpin === undefined ? 0 : params.maxSpin;
        this.lockPosition = params.lockPosition === undefined ? true : params.lockPosition;
        this.triggerId = params.triggerId ?? Helpers.NA;
        this.angularVelocity = params.angularVelocity ?? Helpers.NewVector3(0,0,0);
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("trigger", this);
        if(this.lockPosition){
            this.body.body.lockRotation(true, true, true);
        }
    }

    onStart(): void {
    }

    onUpdate(dt?: number | undefined): void {
        if(this._spin >= this.maxSpin){
            this.body.body.setAngularVelocity(this.angularVelocity.multiplyScalar(this.maxSpin));
        }
    }

    validateElement(): boolean {
        return Helpers.ValidateParams(this.triggerId, this, "triggerId");
    }

    hasSubtype(trigger: string): boolean {
        return trigger === this.triggerId;
    }

    onTrigger(source: LMent, triggerId: string): void {
        this.body.body.setAngularVelocity(Helpers.NewVector3(0, 0, 0).addVectors(this.body.body.getAngularVelocity(), this.angularVelocity.multiplyScalar(this.maxSpin)));
        this._spin++;
    }


}
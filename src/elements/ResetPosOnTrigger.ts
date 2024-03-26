import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";

// just to clarify this resets after getting a trigger
export class ResetPosOnTrigger extends LMent implements UpdateHandler,TriggerHandler{
    resetAfterSeconds: number;
    loop: boolean = true;
    triggerId: string;
    
    private Triggered: boolean = false;
    private startingPosition: Vector3;
    private loopTimer: number = 0;

    constructor(body: BodyHandle, id: number, params: Partial<ResetPosOnTrigger> = {}) {
        super(body, id, params);
        this.resetAfterSeconds = params.resetAfterSeconds ?? 0;
        this.loop = params.loop ?? true;
        this.startingPosition = this.body.body.getPosition().clone();
        this.loopTimer = this.resetAfterSeconds;
        this.triggerId = params.triggerId ?? Helpers.NA;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        GameplayScene.instance.dispatcher.addListener("trigger", this);
        if(!this.loop){
            GameplayScene.instance.dispatcher.queueDelayedFunction(this, this.resetPosition, this.resetAfterSeconds);
        }
    }

    onStart(): void {
        
    }
    
    hasSubtype(trigger: string): boolean {
        return trigger === this.triggerId;
    }

    onTrigger(source: LMent, triggerId: string): void {
        if (triggerId === this.triggerId) {
            this.Triggered = true;
        }
    }

    onUpdate(dt?: number | undefined): void {
        if(dt === undefined || !this.loop || !this.Triggered) return;
        this.loopTimer -=dt;
        if(this.loopTimer <= 0){
            this.resetPosition();
        }
    }

    resetPosition(): void {
        this.body.body.setAngularVelocity(Helpers.NewVector3(0,0,0));
        this.body.body.setVelocity(Helpers.NewVector3(0,0,0));
        this.body.body.setPosition(this.startingPosition);
        //TODO: should reset as the starting rotation not new quaternion
        this.body.body.setRotation(Helpers.NewQuaternion());
        this.loopTimer = this.resetAfterSeconds;
        this.Triggered = false;
        GameplayScene.instance.dispatcher.onTrigger(this, "reset","global");
    }

}
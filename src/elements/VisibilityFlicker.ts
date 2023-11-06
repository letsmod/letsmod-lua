import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";

export class VisibilityFlicker extends LMent implements UpdateHandler
{
    frequency: number; 
    initiallyEnabled: boolean;
    cooldown: number;
    duration: number;
    endTime: number;
    constructor(body: BodyHandle, id: number, params: Partial<VisibilityFlicker> = {})
    {
        super(body, id, params);
        this.frequency = params.frequency === undefined? 0.25 : params.frequency;
        this.initiallyEnabled = params.initiallyEnabled === undefined? false : params.initiallyEnabled;
        this.cooldown = 0;
        this.duration = params.duration === undefined? 2: params.duration;
        this.endTime = 0;
    }

    onInit(): void {
        GameplayScene._instance.dispatcher.addListener("update",this);
        this.endTime = GameplayScene.instance.memory.timeSinceStart + this.duration;
    }
    onStart(): void {

    }

    onUpdate(): void {
        const now = GameplayScene.instance.memory.timeSinceStart;

        if (now > this.endTime) {
            this.body.body.setVisible(this.initiallyEnabled);
            return;
        }

        if(this.cooldown === 0 || now - this.cooldown >= this.frequency){
            this.body.body.setVisible(!this.body.body.getVisible());
            this.cooldown = now;
        } 
    }

    
}
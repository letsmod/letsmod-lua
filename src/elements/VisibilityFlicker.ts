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
    }
    onStart(): void {
        this.enabled = this.initiallyEnabled;
        this.timer = this.duration;
    }
    private timer = 0;
    private freqTimer = 0;
    private isVisible = false;
    onUpdate(): void {
        let deltaTime = 1/GameplayScene.instance.memory.frameRate;
        this.timer -= deltaTime;
        this.freqTimer -= deltaTime;

        if (this.timer <= 0) {
            this.timer = this.duration;
            this.freqTimer = this.frequency;
            this.body.body.setVisible(true);
            this.enabled = false;
        } else if (this.freqTimer <= 0) {

            this.freqTimer = this.frequency;
            this.isVisible = !this.isVisible;
            this.body.body.setVisible(this.isVisible);
        }
    }
}
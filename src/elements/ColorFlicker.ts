import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";
import { global, js_new } from "js";
import { Color } from "three";


export class ColorFlicker extends LMent implements UpdateHandler
{
    frequency: number; 
    cooldown: number;
    color: Color;
    duration: number;
    endTime: number;
    bodyColor: Color;
    isFlickerColorActive: boolean;
    flickerDuration: number;
    constructor(body: BodyHandle, id: number, params: Partial<ColorFlicker> = {})
    {
        super(body, id, params);
        this.frequency = params.frequency === undefined? 0.25 : params.frequency;
        this.cooldown = 0;
        this.color = params.color === undefined? js_new(global.THREE.Color,232, 5, 5): params.color;
        this.duration = params.duration === undefined? 2: params.duration;
        this.endTime = 0;
        this.bodyColor = this.body.body.getShapes()[0].getColor();
        this.flickerDuration = params.flickerDuration === undefined ? 0.3 : params.flickerDuration;
        this.isFlickerColorActive = false;
    }

    onInit(): void {
        GameplayScene._instance.dispatcher.addListener("update",this);
        
    }
    onStart(): void {
        this.endTime = GameplayScene.instance.memory.timeSinceStart + this.duration;
    }

    onUpdate(): void {
        const now = GameplayScene.instance.memory.timeSinceStart;
        let originalColor = js_new(global.THREE.Color, this.bodyColor.r, this.bodyColor.g, this.bodyColor.b);
        let secondColor = js_new(global.THREE.Color, this.color.r, this.color.g, this.color.b);

        if (now > this.endTime) {
            this.body.body.getShapes()[0].setColor(originalColor)
            return;
        }

        if(this.cooldown === 0 || (now - this.cooldown >= this.frequency) && !this.isFlickerColorActive){
            this.body.body.getShapes()[0].setColor(secondColor);
            this.isFlickerColorActive = true;
            this.cooldown = now;
        } 
        else if(this.isFlickerColorActive && now - this.cooldown >= this.flickerDuration){
            this.body.body.getShapes()[0].setColor(originalColor);
            this.isFlickerColorActive = false;
            this.cooldown = now;
        }
    }

    
}
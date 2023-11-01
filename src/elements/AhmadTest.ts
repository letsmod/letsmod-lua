import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { ButtonHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";

export class AhmadTest extends LMent implements ButtonHandler
{
    jumpVelo:number;
    constructor(body: BodyHandle, id: number, params: Partial<AhmadTest> = {})
    {
      super(body, id);
      this.jumpVelo = params.jumpVelo === undefined?10:params.jumpVelo;

    }
  
    onInit(): void {
      GameplayScene.instance.dispatcher.addListener("button", this);
    }
  
    onStart(): void {
      
    }

    onButtonPress(button: string): void {
        if (button == "AButton")
        {
            let velocity = this.body.body.getVelocity();
            velocity.x += this.jumpVelo;
            this.body.body.setVelocity(velocity);
        }
    }
    onButtonHold(button: string): void {
    }
    onButtonRelease(button: string): void {
    }
    hasSubtype(button: string): boolean {
        return button == "AButton";
    }

}
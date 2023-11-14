import { Collectible } from "./Collectible";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { PlatformerControls } from "./PlatformerControls";

export class PlatformerShooter extends PlatformerControls
{
    constructor(body: BodyHandle, id: number, params: Partial<PlatformerShooter> = {})
    {
        super(body, id, params);
    }

    override onButtonPress(button: string): void {
        super.onButtonPress(button);
        if(button === "BButton")
            this.shoot();
    }

    shoot(){
        this.playTopAnimation("Shoot");
    }
}
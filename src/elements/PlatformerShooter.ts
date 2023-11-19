import { BodyHandle } from "engine/BodyHandle";
import { PlatformerControls } from "./PlatformerControls";

export class PlatformerShooter extends PlatformerControls {
    constructor(body: BodyHandle, id: number, params: Partial<PlatformerShooter> = {}) {
        super(body, id, params);
    }

    override onButtonPress(button: string): void {
        super.onButtonPress(button);
        if (button === "BButton")
            this.shoot();
    }

    shoot() {
        this.playTopAnimation("Shoot");
    }
}

import { BodyHandle } from "engine/BodyHandle";
import { PlatformerControls } from "./PlatformerControls";
import { Constants } from "engine/Helpers";

export class PlatformerShooter extends PlatformerControls {
    constructor(body: BodyHandle, id: number, params: Partial<PlatformerShooter> = {}) {
        super(body, id, params);
    }

    override onButtonPress(button: string): void {
        super.onButtonPress(button);
        if (button === Constants.BButton)
            this.shoot();
    }

    shoot() {
        this.playTopAnimation("Shoot");
    }

    override hasSubtype(button: string): boolean {
        return button == Constants.BButton || button == Constants.BButton;
    }
}

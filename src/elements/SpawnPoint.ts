import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";

export class SpawnPoint extends LMent {

    onInit(): void {
        GameplayScene.instance.memory.player = this.body;
    }

    onStart(): void {
        this.spawn();
    }

    spawn(): void {
        let avatarType = GameplayScene.instance.gamePreferences?.avatarType;
        let avatar = GameplayScene.instance.clonePrefab(avatarType);
        if (avatar === undefined) {
            console.log("No prefab named: " + avatarType + " exists in the library.");
            return;
        }
        avatar.body.setPosition(this.body.body.getPosition());
        this.body.body.destroyBody();
    }

    constructor(body: BodyHandle, id: number, params: Partial<SpawnPoint> = {}) {
        super(body, id, params);
    }
}

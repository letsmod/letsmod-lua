import { Collectible } from "./Collectible";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export type AvatarType = "base" | "rollerball" | "slingshot" | "wingsuit";
export class Equipment extends Collectible {
    equipment: AvatarType;
    followSpeed: number;
    constructor(body: BodyHandle, id: number, params: Partial<Equipment> = {}) {
        super(body, id, params);
        this.equipment = params.equipment === undefined ? "base" : params.equipment;
        this.followSpeed = params.followSpeed === undefined ? 0.15 : params.followSpeed;
    }

    override collect() {
        if (this.isCollected)
            return;
        super.collect();
        this.cloneAvatar();
    }

    checkLerp: boolean = false;
    override onCollectAnimation(): void {
        let player = GameplayScene.instance.memory.player;
        if (player !== undefined) {
            let playerPos = player.body.getPosition();
            this.body.body.getScale().multiplyScalar(1 - this.followSpeed);
            this.body.body.getPosition().lerp(playerPos, this.followSpeed);
        }
        GameplayScene.instance.dispatcher.removeQueuedFunction
    }

    cloneAvatar() {
        switch (this.equipment) {
            case "wingsuit":
                this.createNewAvatar("Wing Suit");
                break;
            case "slingshot":
                this.createNewAvatar("SlingStone");
                break;
            case "rollerball":
                this.createNewAvatar("Rollerball");
                break;
            default:
                this.createNewAvatar("Player");
                break;
        }
    }

    createNewAvatar(prefabName: string) {
        let player = GameplayScene.instance.memory.player;
        if (player === undefined) return;

        let newPlayer = GameplayScene.instance.clonePrefab(prefabName);
        if (newPlayer === undefined)
            console.log("No prefab named " + prefabName + " is found.");
        else {
            newPlayer.body.setPosition(player.body.getPosition());
            newPlayer.body.setRotation(player.body.getRotation());
            GameplayScene.instance.destroyBody(player);
        }
    }
}

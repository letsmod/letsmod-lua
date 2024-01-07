import { Collectible } from "./Collectible";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { AvatarBase } from "./AvatarBase";
import { Constants } from "engine/Helpers";


export class Equipment extends Collectible {
    equipment: String;
    followSpeed: number;
    constructor(body: BodyHandle, id: number, params: Partial<Equipment> = {}) {
        super(body, id, params);
        this.equipment = params.equipment === undefined ? Constants.BaseEquip : params.equipment;
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
        switch (this.equipment.toLowerCase()) {
            case Constants.WingSuitEquip:
                this.createNewAvatar(Constants.WingSuitAvatar);
                break;
            case Constants.SlingshotEquip:
                this.createNewAvatar(Constants.SlingshotAvatar);
                break;
            case Constants.RollerBallEquip:
                this.createNewAvatar(Constants.RollerballAvatar);
                break;
            default:
                console.log("equipment '"+this.equipment+"' is not found, will spawn the default player.");
                this.createNewAvatar(Constants.BaseAvatar);
                break;
        }
    }

    createNewAvatar(prefabName: string) {
        let player = GameplayScene.instance.memory.player;
        if (player === undefined) return;
        let playerAvatarElement = player.getElement(AvatarBase);
        if (!playerAvatarElement) {
            console.log("No Avatar LMent is attached to the player");
            return;

        }
        let newPlayer = GameplayScene.instance.clonePrefab(prefabName);
        if (newPlayer === undefined)
            console.log("No prefab named " + prefabName + " is found.");
        else {
            newPlayer.body.setPosition(player.body.getPosition());
            newPlayer.body.setRotation(player.body.getRotation());
            playerAvatarElement.UnequipAvatar();
        }
    }
}

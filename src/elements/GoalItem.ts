import { GameplayScene } from "engine/GameplayScene";
import { Collectible } from "./Collectible";
import { BodyHandle } from "engine/BodyHandle";

export class GoalItem extends Collectible {
    scoreValue: number;
    followSpeed: number;
    constructor(body: BodyHandle, id: number, params: Partial<GoalItem> = {}) {
        super(body, id, params);
        this.scoreValue = params.scoreValue === undefined ? 1 : params.scoreValue;
        this.followSpeed = params.followSpeed === undefined ? 0.15 : params.followSpeed;
    }
    
    override collect(){
        this.isCollected = true;
        GameplayScene.instance.clientInterface?.winMod();
    }

    checkLerp: boolean = false;
    override onCollectAnimation(): void {
        let player = GameplayScene.instance.memory.player;
        if (player !== undefined) {
            let playerPos = player.body.getPosition();
            this.body.body.getScale().multiplyScalar(1 - this.followSpeed);
            this.body.body.getPosition().lerp(playerPos, this.followSpeed);
        }
    }
}
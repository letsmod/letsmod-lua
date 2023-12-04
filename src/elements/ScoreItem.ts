import { Collectible } from "./Collectible";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class ScoreItem extends Collectible {
    scoreValue: number;
    followSpeed: number;
    constructor(body: BodyHandle, id: number, params: Partial<ScoreItem> = {}) {
        super(body, id, params);
        this.scoreValue = params.scoreValue === undefined ? 1 : params.scoreValue;
        this.followSpeed = params.followSpeed === undefined ? 0.15 : params.followSpeed;
    }

    override collect() {
        if (this.isCollected)
            return;
        super.collect();
        let clientInterface = GameplayScene.instance.clientInterface;
        if (clientInterface !== undefined)
            clientInterface.addScore(this.scoreValue);
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

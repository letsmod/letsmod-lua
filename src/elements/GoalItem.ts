import { GameplayScene } from "engine/GameplayScene";
import { Collectible } from "./Collectible";
import { BodyHandle } from "engine/BodyHandle";
import { SfxPlayer } from "./SfxPlayer";

export class GoalItem extends Collectible {
    followSpeed: number;
    audioHasPlayed: boolean = false;

    constructor(body: BodyHandle, id: number, params: Partial<GoalItem> = {}) {
        super(body, id, params);
        this.followSpeed = params.followSpeed === undefined ? 0.15 : params.followSpeed;
    }

    override collect() {
        super.collect();
        const sound = this.body.getElement(SfxPlayer) as SfxPlayer;
        if (sound && !this.audioHasPlayed) {
            this.audioHasPlayed = true;
            sound.playAudio();
        }
        GameplayScene.instance.clientInterface?.winMod();
    }

    checkLerp = false;

    override onCollectAnimation() {
        const player = GameplayScene.instance.memory.player;
        if (player) {
            const playerPos = player.body.getPosition();
            this.body.body.getScale().multiplyScalar(1 - this.followSpeed);
            this.body.body.getPosition().lerp(playerPos, this.followSpeed);
        }
    }
}
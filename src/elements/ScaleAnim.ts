import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";

export class ScaleAnim extends LMent implements UpdateHandler {
    style: string;
    maxScale: number;
    minScale: number;
    speed: number;
    speedRandomFactror: number;
    startShrinking: boolean;
    triggerOnZeroScale: boolean;
    triggerId: string;
    triggerContext: "local" | "group" | "global";
    private speedRandom: number;

    constructor(body: BodyHandle, id: number, params: Partial<ScaleAnim> = {}) {
        super(body, id, params);
        this.style = params.style ?? "linear";
        this.maxScale = params.maxScale ?? 1;
        this.minScale = params.minScale ?? 0;
        this.speed = params.speed ?? 1;
        this.speedRandomFactror = params.speedRandomFactror ?? 0;
        this.startShrinking = params.startShrinking ?? false;
        this.speedRandom = 0;
        this.triggerOnZeroScale = params.triggerOnZeroScale ?? false;
        this.triggerId = params.triggerId ?? Helpers.NA;
        this.triggerContext = params.triggerContext ?? "local";
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        if (this.startShrinking) {
            this.body.body.setScale(Helpers.NewVector3(this.maxScale, this.maxScale, this.maxScale));
            [this.maxScale, this.minScale] = [this.minScale, this.maxScale];
        } else {
            this.body.body.setScale(Helpers.NewVector3(this.minScale, this.minScale, this.minScale));
        }
    }

    onStart(): void {}

    onUpdate(dt: number): void {
        if (Math.random() > 0.5) {
            this.speedRandomFactror = -this.speedRandomFactror;
        }
        this.speedRandom = this.speed + Math.random() * this.speedRandomFactror;
        switch (this.style) {
            case "sine":
                this.sineAnim(dt);
                break;
            case "linear":
                this.linearAnim(dt);
                break;
            default:
                break;
        }
    }

    sendTrigger(): void {
        if (Helpers.ValidateParams(this.triggerId, this, "triggerId")) {
            GameplayScene.instance.dispatcher.onTrigger(this, this.triggerId, this.triggerContext);
        }
    }

    sineAnim(dt: number): void {
        const sineValue = (Math.sin(GameplayScene.instance.memory.timeSinceStart * this.speed) + 1) / 2;
        const scaleVector = Helpers.NewVector3(
            sineValue * (this.maxScale - this.minScale) + this.minScale,
            sineValue * (this.maxScale - this.minScale) + this.minScale,
            sineValue * (this.maxScale - this.minScale) + this.minScale
        );
        this.body.body.setScale(scaleVector);
    }

    linearAnim(dt: number): void {
        let scale = this.body.body.getScale().x;
        if (this.startShrinking) {
            if (scale !== undefined && scale <= this.maxScale) {
                if (this.triggerOnZeroScale) {
                    this.sendTrigger();
                }
                return;
            }
            scale = this.body.body.getScale().x - (0.01 * this.speedRandom);
        } else {
            if (scale !== undefined && scale >= this.maxScale) {
                if (this.triggerOnZeroScale) {
                    this.sendTrigger();
                }
                return;
            }
            scale = this.body.body.getScale().x + (0.01 * this.speedRandom);
        }

        const scaleVector = Helpers.NewVector3(scale, scale, scale);
        this.body.body.setScale(scaleVector);
    }
}

import { BodyHandle } from "engine/BodyHandle";
import { Helpers, InterpolationType } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";
import { GameplayScene } from "engine/GameplayScene";

export class ScaleLoop extends LMent implements UpdateHandler {
    public minScale: number;
    public maxScale: number;
    public duration: number;
    public interpolationType: InterpolationType;
    public loop: boolean;

    private endTime: number;
    private elapsedTime: number = 0;
    private direction: number = 1;

    constructor(body: BodyHandle, id: number, params: Partial<ScaleLoop>) {
        super(body, id, params);
        this.minScale = params.minScale === undefined ? 1 : params.minScale;
        this.maxScale = params.maxScale === undefined ? 2 : params.maxScale;
        this.duration = params.duration === undefined ? 1 : params.duration;
        this.interpolationType = params.interpolationType === undefined ? 'linear' : params.interpolationType;
        this.loop = params.loop === undefined ? true : params.loop;
        this.endTime = 0;
    }

    onInit() {
        GameplayScene.instance.dispatcher.addListener("update", this);
    }

    onStart() {
        // Initial setup when starting
    }

    onEnable() {
        // Reset properties each time element is enabled
        this.elapsedTime = 0;
        this.direction = 1;
        this.endTime = GameplayScene.instance.memory.timeSinceStart + this.duration;
    }

    onUpdate(dt: number) {
        // Skip update if not enabled
        if (!this.enabled) {
            return;
        }

        // Check if the animation should stop
        const now = GameplayScene.instance.memory.timeSinceStart;
        if (!this.loop && now > this.endTime) {
            this.body.body.setScale(Helpers.NewVector3(this.minScale, this.minScale, this.minScale));
            this.enabled = false;
            return;
        }

        // Update elapsed time and calculate progress
        this.elapsedTime += dt * this.direction;
        let progress = this.elapsedTime / this.duration;

        // Adjust for bounds and change direction if needed
        if (progress > 1 || progress < 0) {
            this.direction *= -1; // Reverse the direction
            this.elapsedTime += dt * this.direction; // Adjust elapsed time after reversing
            progress = Math.max(0, Math.min(this.elapsedTime / this.duration, 1));
        }

        // Calculate and apply interpolated scale
        let interpolatedScale = Helpers.NewVector3(
            Helpers.NumLerp(this.minScale, this.maxScale, Helpers.getInterpolatedProgress(progress, this.interpolationType)),
            Helpers.NumLerp(this.minScale, this.maxScale, Helpers.getInterpolatedProgress(progress, this.interpolationType)),
            Helpers.NumLerp(this.minScale, this.maxScale, Helpers.getInterpolatedProgress(progress, this.interpolationType))
        );
        this.body.body.setScale(interpolatedScale);
    }
}

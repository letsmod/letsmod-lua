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

    private elapsedTime: number = 0;
    private direction: number = 1;

    constructor(body: BodyHandle, id: number, params: Partial<ScaleLoop>) {
        super(body, id, params);
        this.minScale = params.minScale === undefined ? 1 : params.minScale;
        this.maxScale = params.maxScale === undefined ? 2 : params.maxScale;
        this.duration = params.duration === undefined ? 1 : params.duration;
        this.interpolationType = params.interpolationType === undefined ? 'linear' : params.interpolationType;
    }

    onInit() {
        GameplayScene.instance.dispatcher.addListener("update", this);
    }

    onStart() {
        // Initialization code for starting the pulsating effect
    }

    onUpdate(dt: number) {
        this.elapsedTime += dt * this.direction;

        // Calculate progress
        let progress = this.elapsedTime / this.duration;
        if (progress > 1 || progress < 0) {
            this.direction *= -1; // Reverse the direction
            this.elapsedTime += dt * this.direction; // Adjust elapsed time after reversing
            progress = this.elapsedTime / this.duration;
        }

        // Interpolate scale
        let interpolatedScale = Helpers.NewVector3(
            Helpers.NumLerp(this.minScale, this.maxScale, Helpers.getInterpolatedProgress(progress, this.interpolationType)),
            Helpers.NumLerp(this.minScale, this.maxScale, Helpers.getInterpolatedProgress(progress, this.interpolationType)),
            Helpers.NumLerp(this.minScale, this.maxScale, Helpers.getInterpolatedProgress(progress, this.interpolationType))
        );

        // Apply the scale
        this.body.body.setScale(interpolatedScale);
    }
}

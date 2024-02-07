import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers, InterpolationType, MotionPattern } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { PhysicsSubstepHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";

type ScalePointType = {
    scale: Vector3;
    duration: number;
    delay: number;
    interpolate: InterpolationType;
};

export class ScaleWaypoint extends LMent implements PhysicsSubstepHandler {

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("physicsSubstep", this);
        this.validatePattern();
        this.validateScalePoints();
    }

    onStart(): void {
        this.startingScale = this.body.body.getScale().clone();
    }

    points: ScalePointType[];
    pattern: MotionPattern

    private currentScalePointIndex: number = 0;
    private timeSinceLastScalePoint: number = 0;
    private forwardDirection: boolean = true; // Used for Ping-Pong pattern
    private startingScale: Vector3;

    constructor(body: BodyHandle, id: number, params: Partial<ScaleWaypoint> = {}) {
        super(body, id, params);
        this.points = this.convertArray(params.points) || [];
        this.pattern = params.pattern === undefined ? "loop" : params.pattern.toLowerCase() as MotionPattern;
        this.startingScale = Helpers.oneVector;
    }

    validateScalePoints() {
        this.points.forEach(point => {
            point.interpolate = point.interpolate !== undefined ? point.interpolate.toLowerCase() as InterpolationType : "linear";
            if (!Helpers.validateInterpolateType(point.interpolate)) {
                point.interpolate = "linear";
                console.log("Interpolate type " + this.points[0].interpolate + " not found, setting to linear");
            }

            point.duration = point.duration > 0 ? point.duration : 0.1;
            point.delay = point.delay >= 0 ? point.delay : 0;
            point.scale = point.scale || Helpers.oneVector;
        });
    }

    validatePattern() {
        if (!Helpers.validateMotionPattern(this.pattern)) {
            console.log("Pattern " + this.pattern + " is not found, resetting to loop");
            this.pattern = "loop";
        }
    }

    onPhysicsSubstep(dt: number): void {
        if (!this.enabled || this.points.length === 0)
            return;
        this.handleScaleChange(dt);
    }

    onEnable(): void {
        this.startingScale = this.body.body.getScale().clone();
        this.currentScalePointIndex = 0;
        this.timeSinceLastScalePoint = 0;
    }

    private handleScaleChange(dt: number): void {
        const currentPoint = this.points[this.currentScalePointIndex];
        this.timeSinceLastScalePoint += dt;
    
        if (this.timeSinceLastScalePoint >= currentPoint.duration + currentPoint.delay) {
            this.moveToNextScalePoint();
        } else if (this.timeSinceLastScalePoint >= currentPoint.duration) {
            return; // in delay period
        } else {
            const progress = Helpers.getInterpolatedProgress(this.timeSinceLastScalePoint / currentPoint.duration, currentPoint.interpolate);
            const targetScale = Helpers.ParamToVec3(currentPoint.scale); // Convert the scale point to a Vector3 using Helpers
            const newScale = Helpers.NewVector3(0, 0, 0).lerpVectors(this.startingScale, targetScale, progress);
            this.body.body.setScale(newScale);
        }
    }

    private moveToNextScalePoint(): void {
        if (this.currentScalePointIndex === this.points.length - 1 && this.pattern === "once") {
            this.enabled = false;
            return;
        }
        this.startingScale = this.body.body.getScale().clone();
        this.currentScalePointIndex = this.getNextScalePointIndex();
        this.timeSinceLastScalePoint = 0;
    }

    private getNextScalePointIndex(): number {
        switch (this.pattern) {
            case "loop":
                return (this.currentScalePointIndex + 1) % this.points.length;
            case "ping-pong":
                if (this.currentScalePointIndex === 0 || this.currentScalePointIndex === this.points.length - 1) {
                    this.forwardDirection = !this.forwardDirection;
                }
                return this.forwardDirection ? Math.min(this.currentScalePointIndex + 1, this.points.length - 1) : Math.max(this.currentScalePointIndex - 1, 0);
            case "once":
                return Math.min(this.currentScalePointIndex + 1, this.points.length - 1);
            default:
                return (this.currentScalePointIndex + 1) % this.points.length;
        }
    }
}

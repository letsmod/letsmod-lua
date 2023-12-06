import { Vector3 } from "three";
import { BodyHandle } from "../engine/BodyHandle";
import { GameplayScene } from "../engine/GameplayScene";
import { LMent } from "../engine/LMent";
import { PhysicsSubstepHandler } from "../engine/MessageHandlers";
import { Helpers } from "engine/Helpers";

type waypoints = {
    offset: Vector3,
    speed: number,
    delay: number,
    interpolationFunction: string,
};

export class Waypoint extends LMent implements PhysicsSubstepHandler {
    points: waypoints[];
    pattern: string;
    private totalDistanceToNextPoint: number;
    private nextIndex: number;
    private delayPlusTime: number;
    private now: number;
    private indexAddvalue: number;

    constructor(body: BodyHandle, id: number, params: Partial<Waypoint> = {}) {
        super(body, id, params);

        this.points = this.convertArray(params.points) || [];
        this.pattern = params.pattern === undefined ? "loop" : params.pattern;
        this.totalDistanceToNextPoint = 0;
        this.nextIndex = 0;
        this.delayPlusTime = 0;
        this.now = 0;
        this.indexAddvalue = 1;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("physicsSubstep", this);
        this.validatePattern();
    }

    onStart(): void {
        this.adjustOffsets();
        this.adjustPatterns();

        this.totalDistanceToNextPoint = this.body.body.getPosition().distanceTo(this.points[0].offset);
    }

    adjustPatterns() {
        const InitWayPoint: waypoints = {
            offset: this.body.body.getPosition().clone(),
            speed: this.points[0].speed,
            delay: this.points[0].delay,
            interpolationFunction: this.points[0].interpolationFunction
        };

        if (this.pattern === "pingpong") {
            this.points.unshift(InitWayPoint);
            this.indexAddvalue = -1;
        } else if (this.pattern === "loop")
            this.points.push(InitWayPoint);
    }

    adjustOffsets() {
        for (let i = 0; i < this.points.length; i++) {
            let offset = Helpers.NewVector3(this.points[i].offset.x, this.points[i].offset.y, this.points[i].offset.z);
            offset.applyQuaternion(this.body.body.getRotation());
            if (i == 0)
                this.points[i].offset = this.body.body.getPosition().clone().add(offset);
            else this.points[i].offset = this.points[i-1].offset.clone().add(offset);
        }
    }

    validatePattern() {
        if (this.pattern !== "loop" && this.pattern !== "pingpong" && this.pattern !== "once") {
            console.log("Pattern " + this.pattern + " is not found, resetting to loop");
            this.pattern = "loop";
        }
    }

    onPhysicsSubstep(substepDt: number): void {
        this.now = GameplayScene.instance.memory.timeSinceStart;
        if (this.points[this.nextIndex] != undefined) {
            if (this.now - this.delayPlusTime >= this.points[this.nextIndex].delay)
                this.moveOneStep(this.points[this.nextIndex], substepDt);
        }
    }

    moveOneStep(target: waypoints, dt: number): void {
        const position = this.body.body.getPosition();
        const distanceToTarget = position.distanceTo(target.offset);
        const normalizedDistance = distanceToTarget / this.totalDistanceToNextPoint;
        const moveFactor = this.movementStepFactor(normalizedDistance, target.interpolationFunction);

        if (distanceToTarget < target.speed * dt * moveFactor) {
            this.body.body.setPosition(target.offset);
            this.updateNextIndex();
        } else {
            const direction = target.offset.clone().sub(position).normalize();

            const movement = direction.clone().multiplyScalar(target.speed * dt * moveFactor);

            position.add(movement);
            this.body.body.setPosition(position);
        }
    }

    updateNextIndex() {
        if (this.pattern === "pingpong" && (this.nextIndex === 0 || this.nextIndex === this.points.length - 1)) {
            this.indexAddvalue *= -1;
        }
        this.nextIndex += this.indexAddvalue;

        while (this.nextIndex < 0 || this.nextIndex >= this.points.length) {
            if (this.pattern.toLowerCase() === "once") {
                this.nextIndex = this.points.length - 1;
            } else if (this.pattern.toLowerCase() === "pingpong") {
                this.nextIndex = this.nextIndex < 0 ? 1 : this.points.length - 2;
            } else {
                this.nextIndex = 0; // Default is "loop"
            }
        }

        this.totalDistanceToNextPoint = this.body.body.getPosition().distanceTo(this.points[this.nextIndex].offset);
        this.delayPlusTime = this.now + this.points[this.nextIndex].delay;
    }

    movementStepFactor(t: number, interpolation: string): number {
        switch (interpolation) {
            case "sine":
                return 0.1 + Math.sin(Math.PI * t) * 0.9;
            case "smooth":
                return 0.1 + Helpers.NumLerp(Math.sqrt(t), Math.sqrt(1 - t), t);
            case "elastic":
                return 0.1 + this.elasticEase(t);
            default:
                return 1;
        }
    }

    elasticEase(t: number): number {
        const amplitude = 1.0;
        const period = 0.3;
        const overshoot = 1.70158; // Adjust for desired overshoot behavior

        if (t === 0 || t === 1) {
            return t;
        } else {
            const s = period / (2 * Math.PI) * Math.asin(1);
            return (
                amplitude *
                Math.pow(2, -10 * t) *
                Math.sin(((t - s) * (2 * Math.PI)) / period) *
                overshoot
            );
        }
    }
}

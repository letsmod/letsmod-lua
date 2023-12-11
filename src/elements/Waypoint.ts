import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers, InterpolationType, MotionPattern } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { PhysicsSubstepHandler, UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";

type WaypointType = {
    offset: Vector3;
    duration: number;
    delay: number;
    interpolate: InterpolationType;
    targetPos: Vector3;
};

export class Waypoint extends LMent implements PhysicsSubstepHandler {

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("physicsSubstep", this);
        this.validatePattern();
        this.validateWaypoints();
    }

    onStart(): void {
        this.adjustTargets();
        this.startingPosition = this.body.body.getPosition().clone();
    }

    points: WaypointType[];
    pattern: MotionPattern

    private currentWaypointIndex: number = 0;
    private timeSinceLastWaypoint: number = 0;
    private forwardDirection: boolean = true; //--> Used for Ping-Pong pattern
    private startingPosition: Vector3;
    constructor(body: BodyHandle, id: number, params: Partial<Waypoint> = {}) {
        super(body, id, params);
        this.points = this.convertArray(params.points) || [];
        this.pattern = params.pattern === undefined ? "loop" : params.pattern.toLowerCase() as MotionPattern;
        this.startingPosition = Helpers.zeroVector;

    }

    validateWaypoints() {
        for (let i = 0; i < this.points.length; i++) {
            let interpolate = this.points[i].interpolate;
            if (interpolate) {
                this.points[i].interpolate = interpolate.toLowerCase() as InterpolationType;
                if (!Helpers.validateInterpolateType(interpolate)) {
                    this.points[i].interpolate = "linear";
                    console.log("Interpolate type " + interpolate + " not found, setting to linear");
                }
            }
            else this.points[i].interpolate = "linear";

            let duration = this.points[i].duration;
            if (duration === undefined || duration <= 0)
                this.points[i].duration = 0.1;

            let delay = this.points[i].delay;
            if (delay === undefined || delay < 0)
                this.points[i].delay = 0;

            let offset = this.points[i].offset;
            if (offset === undefined)
                this.points[i].offset = Helpers.forwardVector;

            let interpolateType = this.points[i].interpolate;
            if (interpolateType === undefined)
                this.points[i].interpolate = "linear";

        }
    }

    validatePattern() {
        if (!Helpers.validateMotionPattern(this.pattern)) {
            console.log("Pattern " + this.pattern + " is not found, resetting to loop");
            this.pattern = "loop";
        }
    }

    adjustTargets() {
        let firstItem = this.points[0];
        firstItem.targetPos = this.body.body.getPosition().clone().add(Helpers.ParamToVec3(firstItem.offset).applyQuaternion(this.body.body.getRotation()));
        this.timeSinceLastWaypoint = firstItem.duration+firstItem.delay;
        for (let i = 1; i < this.points.length; i++) {
            const myOffset = Helpers.ParamToVec3(this.points[i].offset).applyQuaternion(this.body.body.getRotation());
            const prevTarget = this.points[i - 1].targetPos;
            const myTarget = myOffset.clone().add(prevTarget);
            this.points[i].targetPos = myTarget;
        }
    }

    onPhysicsSubstep(dt: number): void {
        if (!this.enabled || this.points.length === 0)
            return;
        this.handleWaypointMovement(dt);
    }

    private handleWaypointMovement(dt: number): void {

        const currentWaypoint = this.points[this.currentWaypointIndex];
        this.timeSinceLastWaypoint += dt;

        if (this.timeSinceLastWaypoint >= currentWaypoint.duration) {
            this.handleDelay(dt);
            return;
        }

        const progress = Helpers.getInterpolatedProgress(this.timeSinceLastWaypoint / currentWaypoint.duration, currentWaypoint.interpolate);
        const addedOffset = Helpers.ParamToVec3(currentWaypoint.targetPos).clone().sub(this.startingPosition);
        const nextPosition = this.startingPosition.clone().add(addedOffset.multiplyScalar(progress));

        this.body.body.setPosition(nextPosition);
    }

    private handleDelay(dt: number): void {
        const currentWaypoint = this.points[this.currentWaypointIndex];
        this.timeSinceLastWaypoint += dt;

        if (this.timeSinceLastWaypoint - currentWaypoint.duration >= currentWaypoint.delay) {
            this.moveToNextWaypoint();
            this.timeSinceLastWaypoint = 0;
        }
    }

    private moveToNextWaypoint(): void {
        if (this.currentWaypointIndex === this.points.length - 1 && this.pattern === "once") {
            this.enabled = false;
            return;
        }
        this.startingPosition = this.body.body.getPosition().clone();
        this.currentWaypointIndex = this.getNextWaypointIndex();
        this.timeSinceLastWaypoint = 0;
    }

    private getNextWaypointIndex(): number {
        switch (this.pattern) {
            case "loop":
                return (this.currentWaypointIndex + 1) % this.points.length;
            case "ping-pong":
                if (this.currentWaypointIndex === 0) {
                    this.forwardDirection = true;
                } else if (this.currentWaypointIndex === this.points.length - 1) {
                    this.forwardDirection = false;
                }
                return this.forwardDirection ? this.currentWaypointIndex + 1 : this.currentWaypointIndex - 1;
            case "once":
                return Math.min(this.currentWaypointIndex + 1, this.points.length - 1);
        }
    }
}
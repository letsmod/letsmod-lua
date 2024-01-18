import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers, InterpolationType, MotionPattern } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { PhysicsSubstepHandler, UpdateHandler } from "engine/MessageHandlers";
import { Quaternion, Vector3 } from "three";

type RotationWaypointType = {
    angle: number;
    duration: number;
    delay: number;
    interpolate: InterpolationType;
    axis: Vector3;
    targetRotation: Quaternion;
};

export class RotationalWaypoint extends LMent implements PhysicsSubstepHandler {
    points: RotationWaypointType[];
    pattern: MotionPattern;

    private currentWaypointIndex: number = 0;
    private timeSinceLastWaypoint: number = 0;
    private forwardDirection: boolean = true;
    private startingRotation: Quaternion;

    constructor(body: BodyHandle, id: number, params: Partial<RotationalWaypoint> = {}) {
        super(body, id, params);
        this.points = this.convertArray(params.points) || [];
        this.pattern = params.pattern === undefined ? "loop" : params.pattern;
        this.startingRotation = Helpers.NewQuaternion();
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("physicsSubstep", this);
        this.validateRotationWaypoints();
        this.startingRotation.copy(this.body.body.getRotation());
    }

    onStart(): void {
        this.adjustTargets();
    }

    validateRotationWaypoints(): void {
        for (let i = 0; i < this.points.length; i++) {
            let waypoint = this.points[i];
    
            if (waypoint.duration === undefined || waypoint.duration <= 0) {
                waypoint.duration = 1; 
                console.warn("Invalid duration at waypoint " + i + ", setting to default 1 second.");
            }
    
            if (waypoint.delay === undefined || waypoint.delay < 0) {
                waypoint.delay = 0; 
                console.warn("Invalid delay at waypoint " + i + ", setting to default 0 second.");
            }
    
            if (!waypoint.interpolate || !Helpers.validateInterpolateType(waypoint.interpolate)) {
                waypoint.interpolate = "linear"; 
                console.warn("Invalid or undefined interpolation at waypoint " + i + ", setting to linear.");
            }
    
            if (!waypoint.axis) {
                waypoint.axis = Helpers.forwardVector; 
                console.warn("Invalid or undefined axis at waypoint " + i + ", setting to forward vector.");
            }
    
            if (waypoint.angle === undefined) {
                waypoint.angle = 0;
                console.warn("Invalid or undefined angle at waypoint " + i + ", setting to 0.");
            }
        }
    }

    adjustTargets(): void {
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            const axis = Helpers.ParamToVec3(point.axis).normalize();
            const angle = Helpers.Rad(point.angle); // Converting angle to radians
            const targetRotation = Helpers.NewQuaternion().setFromAxisAngle(axis, angle);
            point.targetRotation = this.startingRotation.clone().multiply(targetRotation);
        }
    }

    onPhysicsSubstep(dt: number): void {
        if (this.enabled !== true || this.points.length === 0)
            return;
        this.handleWaypointRotation(dt);
    }

    private handleWaypointRotation(dt: number): void {
        const currentWaypoint = this.points[this.currentWaypointIndex];
        this.timeSinceLastWaypoint += dt;
    
        if (this.timeSinceLastWaypoint >= currentWaypoint.duration) {
            this.handleDelay(dt);
            return;
        }
    
        const progress = Helpers.getInterpolatedProgress(this.timeSinceLastWaypoint / currentWaypoint.duration, currentWaypoint.interpolate);
    
        const nextRotation = Helpers.NewQuaternion().slerpQuaternions(this.startingRotation, currentWaypoint.targetRotation, progress);
        this.body.body.setRotation(nextRotation);
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
        this.startingRotation.copy(this.body.body.getRotation());
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
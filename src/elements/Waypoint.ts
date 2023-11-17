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
    private index: number;
    private delayPlusTime: number;
    private now: number;
    private timeFunctionStart: number;
    private indexAddvalue: number;

    constructor(body: BodyHandle, id: number, params: Partial<Waypoint> = {}) {
        super(body, id, params);

        this.points = this.convertArray(params.points) || [];
        this.pattern = params.pattern === undefined ? "loop" : params.pattern;
        this.totalDistanceToNextPoint = 0;
        this.index = 0;
        this.delayPlusTime = 0;
        this.now = 0;
        this.timeFunctionStart = 0;
        this.indexAddvalue = 1;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("physicsSubstep", this);
    }

    onStart(): void {
        for (let i = 0; i < this.points.length; i++) {
            let offset = Helpers.NewVector3(this.points[i].offset.x, this.points[i].offset.y, this.points[i].offset.z);
            offset.applyQuaternion(this.body.body.getRotation());
            if (i == 0) {
                this.points[i].offset = Helpers.NewVector3(
                    this.body.body.getPosition().x + offset.x, this.body.body.getPosition().y + offset.y, this.body.body.getPosition().z + offset.z);
            } else {
                this.points[i].offset = Helpers.NewVector3(
                    this.points[i - 1].offset.x + offset.x, this.points[i - 1].offset.y + offset.y, this.points[i - 1].offset.z + offset.z);
            }
        }
        if (this.pattern !== "once") {
            let InitWayPoint: waypoints = { offset: this.body.body.getPosition().clone(), speed: this.points[0].speed, delay: this.points[0].delay, interpolationFunction: this.points[0].interpolationFunction };
            if (this.pattern === "pingpong") {
                this.points.unshift(InitWayPoint);
                this.indexAddvalue = -1;
            }
            else if (this.pattern === "loop")
                this.points.push(InitWayPoint);
        }
        this.totalDistanceToNextPoint = this.body.body.getPosition().distanceTo(this.points[0].offset);
    }

    onPhysicsSubstep(substepDt: number): void {
        this.now = GameplayScene.instance.memory.timeSinceStart;
        if (this.points[this.index] != undefined) {
            if (this.now - this.delayPlusTime >= this.points[this.index].delay) {
                if (this.points[this.index].interpolationFunction === "linear") {
                    this.linearMovement(this.points[this.index], substepDt);
                } else if (this.points[this.index].interpolationFunction === "sine") {
                    this.sineMovement(this.points[this.index], substepDt);
                } else {
                    console.log("Wrong interpolationFunction");
                }
            }
        }
    }

    linearMovement(target: waypoints, dt: number): void {
        let direction = Helpers.zeroVector.subVectors(target.offset, this.body.body.getPosition()).normalize();
        let movement = direction.clone().multiplyScalar(target.speed * dt);

        this.body.body.setPosition(this.body.body.getPosition().clone().add(movement));

        if (this.body.body.getPosition().clone().distanceTo(target.offset) < target.speed * dt) {
            this.body.body.setPosition(target.offset);
            if (this.pattern === "pingpong" && (this.index === 0 || this.index === this.points.length - 1))
                this.indexAddvalue *= -1;
            this.index += this.indexAddvalue;

            while (this.points[this.index] === undefined) {
                this.index += 1;
                if (this.index > this.points.length) {
                    if (this.pattern === "once")
                        this.index = this.points.length - 1;
                    else if (this.pattern === "pingpong")
                        this.index = this.points.length - 2;
                    else if (this.pattern === "loop")
                        this.index = 0;
                    else console.log("Wrong pattern");
                    break;
                }
            }

            this.totalDistanceToNextPoint = this.body.body.getPosition().distanceTo(this.points[this.index].offset);
            this.delayPlusTime = this.now + this.points[this.index].delay;
        }
    }

    sineMovement(target: waypoints, dt: number): void {
    }
}

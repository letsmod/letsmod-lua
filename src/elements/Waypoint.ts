import { Vector3 } from "three";
import { BodyHandle } from "../engine/BodyHandle";
import { GameplayScene } from "../engine/GameplayScene";
import { LMent } from "../engine/LMent";
import { UpdateHandler } from "../engine/MessageHandlers";
import { global, js_new } from "../js";

type waypoints = {
    offset: Vector3,
    speed: number,
    delay: number,
    interpolationFunction: string
};

export class Waypoint extends LMent implements UpdateHandler
{
    points: waypoints[];
    totalDistanceToNextPoint: number;
    index: number;
    delayPlusTime: number;
    now: number;

    constructor(body: BodyHandle, id: number, params: Partial<Waypoint> = {}) {
        super(body, id, params);

        this.points = this.convertArray(params.points) || [];
        this.totalDistanceToNextPoint = 0;
        this.index = 0;
        this.delayPlusTime = 0;
        this.now = 0;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
    }

    onStart(): void {
        let InitWayPoint: waypoints = { offset: this.body.body.getPosition().clone(), speed: this.points[0].speed, delay: this.points[0].delay, interpolationFunction: this.points[0].interpolationFunction };
        this.points.push(InitWayPoint);
        this.totalDistanceToNextPoint = this.body.body.getPosition().distanceTo(this.points[0].offset);
    }

    onUpdate(): void {
        this.now = GameplayScene.instance.memory.timeSinceStart;
        if (this.points[this.index] != undefined) {
            if (this.now - this.delayPlusTime >= this.points[this.index].delay) {
                if (this.points[this.index].interpolationFunction === "linear") {
                    this.linearMovement(this.points[this.index]);
                } else if (this.points[this.index].interpolationFunction === "sine") {
                    this.sineMovement(this.points[this.index]);
                } else {
                    console.log("Wrong interpolationFunction");
                }
            }
        } 
    }

    linearMovement(target: waypoints): void {
        let direction = js_new(global.THREE.Vector3).subVectors(target.offset, this.body.body.getPosition()).normalize();
        let movement = direction.clone().multiplyScalar(target.speed / 20);

        this.body.body.setPosition(this.body.body.getPosition().clone().add(movement));

        if (this.body.body.getPosition().clone().add(movement).distanceTo(target.offset) < target.speed / 20) {
            this.body.body.setPosition(target.offset);
            this.index += 1;

            while (this.points[this.index] === undefined) {
                this.index += 1;
                if (this.index > this.points.length) {
                    this.index = 0;
                    break;
                }
            }

            this.totalDistanceToNextPoint = this.body.body.getPosition().distanceTo(this.points[this.index].offset);
            this.delayPlusTime = this.now + this.points[this.index].delay;
        }
    }

    sineMovement(target: waypoints): void {
        let currentDistance = this.body.body.getPosition().distanceTo(target.offset);
        let distanceFactor = 1 - currentDistance / this.totalDistanceToNextPoint;
        let sineEaseInOut =(1 - Math.cos(Math.PI * distanceFactor));
        this.body.body.setPosition(this.body.body.getPosition().clone().lerp(target.offset, 0.003 + sineEaseInOut * target.speed / 20));

        if (this.body.body.getPosition().distanceTo(target.offset) < target.speed / 20) {
            this.body.body.setPosition(target.offset);
            this.index += 1;

            while (this.points[this.index] === undefined) {
                this.index += 1;
                if (this.index > this.points.length) {
                    this.index = 0;
                    break;
                }
            }

            this.totalDistanceToNextPoint = this.body.body.getPosition().distanceTo(this.points[this.index].offset);
            this.delayPlusTime = this.now + this.points[this.index].delay;
        }
    }
}
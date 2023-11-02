import { BodyHandle } from "../engine/BodyHandle";
import { GameplayScene } from "../engine/GameplayScene";
import { LMent } from "../engine/LMent";
import { UpdateHandler } from "../engine/MessageHandlers";
import { global, js_new } from "../js";

export class Drag extends LMent implements UpdateHandler
{
    dragCoefficient: number;
    constructor(body: BodyHandle, id: number, params: Partial<Drag> = {}) {
        super(body, id, params);
        this.dragCoefficient = params.dragCoefficient === undefined ? 0.3 : params.dragCoefficient;
    }
    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
    }
    onStart(): void {
    }
    onUpdate(): void {
        let zeroVector = js_new(global.THREE.Vector3, 0, 0, 0);
        this.body.body.setVelocity(js_new(global.THREE.Vector3).lerpVectors(this.body.body.getVelocity(), zeroVector, this.dragCoefficient));
    }

}
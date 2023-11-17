import { Helpers } from "engine/Helpers";
import { BodyHandle } from "../engine/BodyHandle";
import { GameplayScene } from "../engine/GameplayScene";
import { LMent } from "../engine/LMent";
import { UpdateHandler } from "../engine/MessageHandlers";

export class Drag extends LMent implements UpdateHandler {
    dragConefficient: number;
    constructor(body: BodyHandle, id: number, params: Partial<Drag> = {}) {
        super(body, id, params);
        this.dragConefficient = params.dragConefficient === undefined ? 0.3 : params.dragConefficient;
    }
    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
    }
    onStart(): void {
    }
    onUpdate(): void {
        this.body.body.setVelocity(Helpers.zeroVector.lerpVectors(this.body.body.getVelocity(), Helpers.zeroVector, this.dragConefficient));
    }
}

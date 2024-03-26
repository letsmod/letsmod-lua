import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";

export class ApplyForceOnTrigger extends LMent implements TriggerHandler, UpdateHandler {

    force: Vector3;
    triggerId: string;
    receivesTriggersWhenDisabled?: boolean | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<ApplyForceOnTrigger> = {}) {
        super(body, id, params);
        this.force = params.force ?? Helpers.NewVector3(0, 0, 0);
        this.triggerId = params.triggerId ?? Helpers.NA;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("trigger", this);
        GameplayScene.instance.dispatcher.addListener("update", this);
        this.force = Helpers.ParamToVec3(this.force);
    }

    onStart(): void {
    }

    onUpdate(dt?: number | undefined): void {
    }

    hasSubtype(trigger: string): boolean {
        return trigger === this.triggerId;
    }

    onTrigger(source: LMent, triggerId: string): void {
        if (triggerId === this.triggerId) {
            const randomForce = Helpers.NewVector3(
                Math.random() * (1 - 0.5) + 0.5,
                Math.random() * (1 - 0.5) + 0.5,
                Math.random() * (1 - 0.5) + 0.5
            );
            randomForce.multiply(this.force);
            this.body.body.applyCentralForce(randomForce);
        }
    }
}
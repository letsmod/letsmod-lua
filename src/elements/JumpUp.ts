import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo, UpdateHandler } from "engine/MessageHandlers";

export class JumpUp extends LMent implements CollisionHandler,UpdateHandler {
    
    jumpHeight: number;
    private isOnGround: boolean = true;
    constructor(body: BodyHandle, id: number, params: Partial<JumpUp> = {}) {
        super(body, id, params);
        this.jumpHeight = params.jumpHeight ?? 400;
    }
    
    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("collision", this);
        GameplayScene.instance.dispatcher.addListener("update", this);

    }
    onStart(): void {
    }

    onUpdate(dt?: number | undefined): void {
        this.onGroundReset();
    }
    
    jump(): boolean {
        if (this.isOnGround) {
            this.body.body.applyCentralForce(Helpers.NewVector3(0, this.jumpHeight, 0));
            return true;
        }
        else return false;
    }

    onCollision(info: CollisionInfo): void {

        if (info.getDeltaVSelf().normalize().dot(Helpers.upVector) > 0.7) {

            this.isOnGround = true;
        }
        this.body.body.setAngularVelocity(Helpers.zeroVector);
    }

    onGroundReset(dt?: number) {
        GameplayScene.instance.dispatcher.queueDelayedFunction(undefined, () => {
            this.isOnGround = false;
        }, dt ?? 1 / 30);
    }
}
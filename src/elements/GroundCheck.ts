import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo, UpdateHandler } from "engine/MessageHandlers";

export class GroundCheck extends LMent implements CollisionHandler, UpdateHandler {
    private _isOnGround = false;
    private lastOnGround: number = 0;

    public get isOnGround(): boolean {
        return this._isOnGround;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        GameplayScene.instance.dispatcher.addListener("collision", this);
    }

    onStart(): void {

    }

    constructor(body: BodyHandle, id: number, params: Partial<GroundCheck> = {}) {
        super(body, id, params);
    }

    onCollision(info: CollisionInfo): void {
        let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());

        if (other === undefined || !other.body.isHologram()) {
            let direction = info.getDeltaVSelf().normalize();
            if (direction.dot(Helpers.upVector) > 0.7) {
                this.lastOnGround = 0;
                this._isOnGround = true;
            }
        }
    }

    onUpdate(dt: number): void {
        this.lastOnGround += dt;
        if (this.lastOnGround > dt) {
            this._isOnGround = false;
        }
    }
}

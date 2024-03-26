import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { GameplayScene } from "engine/GameplayScene";

export class PlayAnimationOnCollision extends LMent implements CollisionHandler {
    targetObjectName: string;
    animationName: string;
    
    constructor(body: BodyHandle, id: number, params: Partial<PlayAnimationOnCollision>) {
        super(body, id, params);
        this.targetObjectName = params.targetObjectName ?? ""; // Default to an empty string if not provided
        this.animationName = params.animationName ?? ""; // Default to an empty string if not provided
    }
    onStart(): void {
        this.body.body.getShapes()[0].playAnimation("temp_idle", 1);
    }
    
    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("collision", this);
    }

    onCollision(info: CollisionInfo): void {
        const other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        if (other && other.body.name === this.targetObjectName) {
            // Assuming shapes[0] is the shape you want to target
            // and playAnimation is a valid method for a shape object
            this.body.body.getShapes()[0].playAnimation(this.animationName,1);

            console.log("Playing animation " + this.animationName + " on " + this.targetObjectName);
        }
    }
}

//to be deleted

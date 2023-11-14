import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";


export class EnableElementOnCollision extends LMent implements CollisionHandler
{
    elementName : string;
    collisionMinImpulse: number;
    collisionMinDeltaV: number;
    elementToEnable: any;
    constructor(body: BodyHandle, id: number, params: Partial<EnableElementOnCollision> = {})
    {
        super(body, id, params);
        this.elementName = params.elementName === undefined? "" : params.elementName;
        this.elementToEnable = undefined;
        this.collisionMinDeltaV = params.collisionMinDeltaV === undefined? 1 : params.collisionMinDeltaV;
        this.collisionMinImpulse = params.collisionMinImpulse === undefined? 1 : params.collisionMinImpulse;

    }
    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("collision", this);
        this.elementToEnable = this.body.getElementByTypeName(this.elementName) as LMent;

    }
    onStart(): void {
        
    }
    onCollision(info: CollisionInfo): void {
        const impulseSufficient = this.collisionMinImpulse === undefined || info.getImpulse().length() >= this.collisionMinImpulse;
        const deltaVSufficient = this.collisionMinDeltaV === undefined || info.getDeltaVOther().length() >= this.collisionMinDeltaV;

        if (this.elementToEnable !== undefined && impulseSufficient && deltaVSufficient || this.body.body.getPhysicsBodyType() === 2) {
            this.elementToEnable.enabled = true;
        }
    }

}
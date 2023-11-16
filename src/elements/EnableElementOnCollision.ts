import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";

export class EnableElementOnCollision extends LMent implements CollisionHandler {
    elementNames: string[] | undefined;
    collisionMinImpulse: number;
    collisionMinDeltaV: number;
    elementToEnable: any[];
    constructor(body: BodyHandle, id: number, params: Partial<EnableElementOnCollision> = {}) {
        super(body, id, params);
        this.elementNames = this.convertArray(params.elementNames) || undefined;
        this.elementToEnable = [];
        this.collisionMinDeltaV = params.collisionMinDeltaV === undefined ? 1 : params.collisionMinDeltaV;
        this.collisionMinImpulse = params.collisionMinImpulse === undefined ? 1 : params.collisionMinImpulse;

    }
    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("collision", this);
        if (this.elementNames !== undefined) {
            for (let i = 0; i < this.elementNames.length; i++) {
                let element = this.body.getElementByTypeName(this.elementNames[i]);
                if (element !== undefined) {
                    this.elementToEnable.push(element as LMent);
                    element.enabled = false;
                }
            }
        }
        else {
            console.log("Element not found");
        }
    }
    onStart(): void {

    }
    onCollision(info: CollisionInfo): void {
        const impulseSufficient = this.collisionMinImpulse === undefined || info.getImpulse().length() >= this.collisionMinImpulse;
        const deltaVSufficient = this.collisionMinDeltaV === undefined || info.getDeltaVOther().length() >= this.collisionMinDeltaV;
        let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        let inBodyGroup = false;
        for (let i of this.body.bodyGroup) {
            if (other !== undefined && i == other)
                inBodyGroup = true;
        }
        if (!inBodyGroup) {
            if (impulseSufficient && deltaVSufficient || this.body.body.getPhysicsBodyType() === 2) {
                for (let i = 0; this.elementToEnable !== undefined && i < this.elementToEnable.length; i++) {
                    if (this.elementToEnable[i] !== undefined) {
                        this.elementToEnable[i].enabled = true;
                    }
                }
            }
        }
    }

}

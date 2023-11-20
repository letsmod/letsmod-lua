import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";

export class SetEnabledOnCollision extends LMent implements CollisionHandler {
    elementName: string;
    collisionMinImpulse: number | undefined;
    collisionMinDeltaV: number | undefined;
    elementChipName: string;
    setEnabled: boolean;
    constructor(body: BodyHandle, id: number, params: Partial<SetEnabledOnCollision> = {}) {
        super(body, id, params);
        this.elementName = params.elementName === undefined ? "" : params.elementName;
        this.elementChipName = params.elementChipName === undefined ? "" : params.elementChipName;
        this.collisionMinDeltaV = params.collisionMinDeltaV;
        this.collisionMinImpulse = params.collisionMinImpulse;
        this.setEnabled = params.setEnabled === undefined ? true : params.setEnabled;
    }
    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("collision", this);
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
        if (!inBodyGroup && other?.body.name !=="MainCamera_Lua") {
            if (impulseSufficient && deltaVSufficient || this.body.body.getPhysicsBodyType() === 2) {
                let elements = this.body.getAllElementsByTypeName(this.elementName);
                for (let i = 0; i < elements.length; i++) {
                    if (elements[i].name === this.elementChipName || this.elementChipName === "")
                        elements[i].enabled = this.setEnabled;
                }
            }
        }
    }

}

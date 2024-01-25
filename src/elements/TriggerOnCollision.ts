import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { Vector3 } from "three";

export class TriggerOnCollision extends LMent implements CollisionHandler {
  triggerId: string | undefined;
  triggerContext: "local" | "group" | "global";
  triggerOnCollisionWithElementType: string | undefined;
  triggerOnCollisionWithBodyType: number | undefined;
  contactDirection: Vector3;
  dotMinimum: number | undefined;
  triggerOnCollisionWithBodyType: number | undefined;

  constructor(body: BodyHandle, id: number, params: Partial<TriggerOnCollision> = {}) {
    super(body, id, params);
    this.triggerId = params.triggerId;
    this.triggerContext = params.triggerContext === undefined ? "group" : params.triggerContext;
    this.triggerOnCollisionWithElementType = params.triggerOnCollisionWithElementType;
    this.triggerOnCollisionWithBodyType = params.triggerOnCollisionWithBodyType;
    this.contactDirection = params.contactDirection === undefined ? Helpers.upVector : params.contactDirection;
    this.dotMinimum = params.dotMinimum;
  }

  onInit() {
    GameplayScene.instance.dispatcher.addListener("collision", this);
  }

  onStart() {
  }

  onCollision(info: CollisionInfo) {
    let other = GameplayScene.instance.getBodyById(info.getOtherObjectId());
    let inBodyGroup = false;
    if (other !== undefined)
    {
      for (let i of this.body.bodyGroup) {
        if (i == other)
        {
          inBodyGroup = true;
        }
      }
    }

    let otherType = other ? other.body.getPhysicsBodyType() : undefined;

    if (!inBodyGroup && other &&
        (
          (this.triggerOnCollisionWithBodyType === undefined && otherType !== 2) ||
          (this.triggerOnCollisionWithBodyType !== undefined && this.triggerOnCollisionWithBodyType === otherType)
        )
      ) {
      let collisionDirection = info.getDeltaVOther().normalize();
      let adjustedContactDirection = this.contactDirection.clone().applyQuaternion(this.body.body.getRotation());

        let dotProduct = collisionDirection.dot(adjustedContactDirection);
        if (this.dotMinimum === undefined || dotProduct >= this.dotMinimum) {
          if (this.triggerOnCollisionWithElementType === undefined || other.getElementByTypeName(this.triggerOnCollisionWithElementType) !== undefined) {
            this.sendTrigger();
          }
        }
      }
    }
  }


  sendTrigger() {
    if (this.triggerId !== undefined) {
      GameplayScene.instance.dispatcher.onTrigger(this, this.triggerId, this.triggerContext);
    }
  }
}

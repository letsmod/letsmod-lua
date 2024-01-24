import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { InteractHandler } from "engine/MessageHandlers";
import { AdventurerAvatar } from "./AdventurerAvatar";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";

export class Throwable extends LMent implements InteractHandler {
  interactionNameOrIcon : string;
  interactionPriority : number;
  maxInteractionDistance : number;
  minInteractionDotProduct : number;
  throwSpeedHorizontal : number;
  throwSpeedVertical : number;
  autoAimMinDotProduct : number;

  constructor(body: BodyHandle, id: number, params: Partial<Throwable> = {})
  {
    super(body, id, params);
    this.interactionNameOrIcon = params.interactionNameOrIcon ?? "Pick Up";
    this.interactionPriority = params.interactionPriority ?? 0;
    this.maxInteractionDistance = params.maxInteractionDistance ?? 1.5;
    this.minInteractionDotProduct = params.minInteractionDotProduct ?? 0.707106781186547;
    this.throwSpeedHorizontal = params.throwSpeedHorizontal ?? 9;
    this.throwSpeedVertical = params.throwSpeedVertical ?? 5;
    this.autoAimMinDotProduct = params.autoAimMinDotProduct ?? 0.85;
  }

  onInit(): void {
    GameplayScene.instance.dispatcher.addListener("interact", this);
  }

  onStart(): void {
    
  }

  isInInteractionRange(interactor: BodyHandle): boolean {
    let delta = this.body.body.getPosition().clone().sub(interactor.body.getPosition());
    let distance = delta.length();
    if (distance < this.maxInteractionDistance)
    {
      let direction = delta.normalize();
      let facing = Helpers.forwardVector.clone().applyQuaternion(interactor.body.getRotation());
  
      if (direction.dot(facing) >= this.minInteractionDotProduct)
      {
        return true;
      }
    }

    return false;
  }

  onInteract(interactor: BodyHandle): boolean {
    let playerElem = interactor.getElementByTypeName("AdventurerAvatar") as AdventurerAvatar | undefined;

    if (playerElem && playerElem.canInteract())
    {
      playerElem.pickUpItem(this);
      return true;
    }

    return false;
  }

  doThrow() {
    let playerBody = GameplayScene.instance.memory.player;
    if (playerBody)
    {
      let direction = Helpers.forwardVector.applyQuaternion(playerBody.body.getRotation());
      direction.multiplyScalar(this.throwSpeedHorizontal);
      direction.y = this.throwSpeedVertical;

      this.body.body.setVelocity(direction);
    }
  }
}
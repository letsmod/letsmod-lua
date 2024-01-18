import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { InteractHandler } from "engine/MessageHandlers";
import { AdventurerAvatar } from "./AdventurerAvatar";
import { GameplayScene } from "engine/GameplayScene";

export class Throwable extends LMent implements InteractHandler {
  interactionNameOrIcon : string;
  interactionPriority : number;
  maxInteractionDistance : number;

  constructor(body: BodyHandle, id: number, params: Partial<Throwable> = {})
  {
    super(body, id, params);
    this.interactionNameOrIcon = params.interactionNameOrIcon ?? "Pick Up";
    this.interactionPriority = params.interactionPriority ?? 0;
    this.maxInteractionDistance = params.maxInteractionDistance ?? 1;
  }

  onInit(): void {
    GameplayScene.instance.dispatcher.addListener("interact", this);
  }

  onStart(): void {
    
  }

  isInInteractionRange(interactor: BodyHandle): boolean {
    let distance = interactor.body.getPosition().distanceTo(this.body.body.getPosition());
    return distance < this.maxInteractionDistance;
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
}
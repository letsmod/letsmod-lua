import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { InteractHandler, UpdateHandler } from "engine/MessageHandlers";
import { AdventurerAvatar } from "../AdventurerAvatar";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { Vector, Vector3 } from "three";

export class AbstractGadget extends LMent implements InteractHandler, UpdateHandler {
  interactionNameOrIcon : string;
  interactionPriority : number;
  maxInteractionDistance : number;
  minInteractionDotProduct : number;
  activationCooldown : number;
  activationBufferTime : number;

  // internal
  protected lastActivationTime : number;
  protected lastActivationBuffer : number;
  protected isPickedUp : boolean = false;

  constructor(body: BodyHandle, id: number, params: Partial<AbstractGadget> = {})
  {
    super(body, id, params);
    this.interactionNameOrIcon = params.interactionNameOrIcon ?? "Pick Up";
    this.interactionPriority = params.interactionPriority ?? 0;
    this.maxInteractionDistance = params.maxInteractionDistance ?? 1.5;
    this.minInteractionDotProduct = params.minInteractionDotProduct ?? 0.5;
    this.activationCooldown = params.activationCooldown ?? 0.5;
    this.activationBufferTime = params.activationBufferTime ?? 0.2;

    this.lastActivationTime = Infinity;
    this.lastActivationBuffer = Infinity;
  }

  onInit(): void {
    GameplayScene.instance.dispatcher.addListener("interact", this);
    GameplayScene.instance.dispatcher.addListener("update", this);
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

  highlightInteractable(): void {
    this.body.body.showHighlight();
  }

  activate() : Vector3 | undefined
  {
    if (this.lastActivationTime >= this.activationCooldown)
    {
      let direction = this.doActivate();
      this.lastActivationTime = 0;
      this.lastActivationBuffer = Infinity;
      return direction;
    }
    else
    {
      this.lastActivationBuffer = 0;
      return undefined;
    }
  }

  doActivate() : Vector3 | undefined
  {
    // intentionally left blank; this is a hook for derived classes
    return undefined;
  }

  pickup() : void
  {
    this.isPickedUp = true;
  }

  drop() : void
  {
    this.isPickedUp = false;
  }

  onUpdate(dt : number): void {
    this.lastActivationTime += dt;
    this.lastActivationBuffer += dt;

    if (this.lastActivationBuffer <= this.activationBufferTime && this.lastActivationTime >= this.activationCooldown)
    {
      this.activate();
    }
  }
}
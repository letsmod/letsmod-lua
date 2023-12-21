import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { ActorDestructionHandler, CollisionHandler, CollisionInfo, HitPointChangeHandler, UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";
import { HazardZone } from "./HazardZone";
import { HitPoints } from "./HitPoints";
import { CameraTarget } from "./CameraTarget";
import { VisibilityFlicker } from "./VisibilityFlicker";
import { StateMachineLMent } from "engine/StateMachineLMent";

export class AvatarBase extends StateMachineLMent {

  public static safeSteps: Vector3[] = [];
  private maxSafeSteps: number = 300;
  public isOnGround = false;
  private revivingCooldown: number = 0.5;
  protected isReviving = false;
  private safeStepDelay: number = 1;
  public dragDx = 0;
  public dragDy = 0;
  dragDelayFunc: any | undefined;
  protected camTarget: CameraTarget | undefined;
  private enableDelayedFunc: any | undefined
  public respawnDelay: number = 1;
  constructor(body: BodyHandle, id: number, params: Partial<AvatarBase> = {}) {
    super(body, id, params);
  }

  onInit(): void {
    this.alwaysOnListeners.add("update");
    this.alwaysOnListeners.add("hitPointsChanged");
    this.alwaysOnListeners.add("collision");
    this.alwaysOnListeners.add("actorDestroyed");
    this.alwaysOnListeners.add("drag");
    GameplayScene.instance.dispatcher.addListener("update", this);
    GameplayScene.instance.dispatcher.addListener("hitPointsChanged", this);
    GameplayScene.instance.dispatcher.addListener("collision", this);
    GameplayScene.instance.dispatcher.addListener("actorDestroyed", this);
    GameplayScene.instance.dispatcher.addListener("drag", this);
    GameplayScene.instance.memory.player = this.body;
  }

  initRotation() {
    let rotation = this.body.body.getRotation().clone();
    rotation.setFromAxisAngle(Helpers.upVector, Helpers.GetYaw(rotation));
    this.body.body.setRotation(rotation);
  }

  onStart(): void {
    this.initRotation();
    this.body.body.setAngularVelocity(Helpers.zeroVector);
    AvatarBase.safeSteps.push(this.body.body.getPosition().clone());
    this.addSafeStep();
    this.camTarget = this.body.getElement(CameraTarget);
  }

  onUpdate(dt: number): void {
    super.onUpdate(dt);
    this.sinkCheck();
  }

  onActorDestroyed(actor: BodyHandle): void {
    super.onActorDestroyed(actor);
    if (actor === this.body)
    {
      this.lose();
    }
  }

  sinkCheck() {
    if (this.body.body.getPosition().y < 0)
    {
      this.lose();
    }
  }

  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number): void {
    super.onHitPointChange(source, previousHP, currentHP);
    //Update healthbar goes here.
    if (source === this.body && currentHP <= 0) {
      this.lose();
    }
  }

  onDrag(dx: number, dy: number): void {
    super.onDrag(dx, dy);
    this.dragDx = dx;
    this.dragDy = dy;
    if (this.dragDelayFunc)
      GameplayScene.instance.dispatcher.removeQueuedFunction(this.dragDelayFunc);
    this.dragDelayFunc = GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.dragDx = this.dragDy = 0; }, 0.05);
  }

  lose() {
    // death effect goes here
    this.body.body.setVisible(false);
    this.body.body.setAngularVelocity(Helpers.zeroVector);
    this.body.body.setVelocity(Helpers.zeroVector);
    this.revive();
    this.enabled = false;
  }

  addSafeStep() {
    GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
      if (this.isOnGround) {
        if (AvatarBase.safeSteps.length > this.maxSafeSteps)
        {
          AvatarBase.safeSteps.splice(1, 1);
        }
        AvatarBase.safeSteps.push(this.body.body.getPosition().clone());
      }
      this.addSafeStep();
    }, this.safeStepDelay)
  }

  revive() {
    let isSafe = false;
    for (let i = AvatarBase.safeSteps.length - 1; i >= 0; i--) {

      let step = AvatarBase.safeSteps[i];

      for (let h of HazardZone.AllZones)
        if (step.distanceTo(h.body.body.getPosition()) < h.radius) {
          console.log("not safe .. ");
          break;
        }

        else {
          isSafe = true;
        }
      if (isSafe) {
        GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
          this.respawnAt(step,i);
        }, this.respawnDelay);
        break;
      }
    }

    if (!isSafe)
      GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
        this.respawnAt(AvatarBase.safeSteps[0],0);
      }, this.respawnDelay);
  }

  postReviveCallback() {
    this.isReviving = false;
    if (this.camTarget) {
      this.camTarget.enabled = true;
      console.log("Camera Target re-enabled.");
    }
  }

  respawnAt(pos: Vector3, index:number) {
    this.body.body.setRotation(Helpers.NewQuatFromEuler(0, 0, 0));
    this.body.body.setVisible(true);

    let visibilityFlicker = this.body.getElement(VisibilityFlicker);
    if (visibilityFlicker) {
      visibilityFlicker.enabled = true;
      if (this.enableDelayedFunc)
        GameplayScene.instance.dispatcher.removeQueuedFunction(this.enableDelayedFunc);
      this.enableDelayedFunc = GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.enabled  = true; }, visibilityFlicker.duration);
    }

    
    this.isReviving = true;

    let hp = this.body.getElement(HitPoints);
    if (hp !== undefined)
      hp.reset();


    if (this.camTarget !== undefined) {
      this.camTarget.reset();
      this.camTarget.enabled = false;
    }
    this.body.body.setAngularVelocity(Helpers.zeroVector);
    this.body.body.setVelocity(Helpers.zeroVector);
    this.body.body.setPosition(pos.clone().add(Helpers.NewVector3(0, 0.5, 0)));
    GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.postReviveCallback(); }, this.revivingCooldown)
    AvatarBase.safeSteps.splice(index,AvatarBase.safeSteps.length-index);

  }

  UnequipAvatar() {
    GameplayScene.instance.destroyBody(this.body);
  }
}

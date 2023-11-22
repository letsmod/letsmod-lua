import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { ActorDestructionHandler, CollisionHandler, CollisionInfo, HitPointChangeHandler, UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";
import { HazardZone } from "./HazardZone";
import { HitPoints } from "./HitPoints";
import { CameraTarget } from "./CameraTarget";

export class AvatarBase extends LMent implements UpdateHandler, HitPointChangeHandler, CollisionHandler, ActorDestructionHandler {

  public static safeSteps: Vector3[] = [];
  private maxSafeSteps: number = 100;
  public isOnGround = false;

  private safeStepDelay: number = 2;

  constructor(body: BodyHandle, id: number, params: Partial<AvatarBase> = {}) {
    super(body, id, params);
  }

  onInit(): void {
    GameplayScene.instance.dispatcher.addListener("update", this);
    GameplayScene.instance.dispatcher.addListener("hitPointsChanged", this);
    GameplayScene.instance.dispatcher.addListener("collision", this);
    GameplayScene.instance.dispatcher.addListener("actorDestroyed", this);
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
  }

  onUpdate(): void {
    this.sinkCheck();
  }

  onActorDestroyed(actor: BodyHandle): void {
    this.lose();
  }

  onCollision(info: CollisionInfo): void {
  }

  sinkCheck() {
    if (this.body.body.getPosition().y < 0)
      this.lose();
  }

  onHitPointChange(source: BodyHandle, previousHP: number, currentHP: number): void {
    //Update healthbar goes here.
    if (source === this.body && currentHP <= 0) {
      this.lose();
    }
  }

  lose() {
    // death effect goes here
    this.revive();
  }

  addSafeStep() {
    GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
      if (this.isOnGround) {
        if (AvatarBase.safeSteps.length > this.maxSafeSteps)
          AvatarBase.safeSteps.splice(1, 1);
        AvatarBase.safeSteps.push(this.body.body.getPosition().clone());
      }
      this.addSafeStep();
    }, this.safeStepDelay)
  }

  revive() {
    let isSafe = false;
    for (let i=AvatarBase.safeSteps.length-1;i >=0 ; i--) {
      
      let step = AvatarBase.safeSteps[i];
      
      for (let h of HazardZone.AllZones)
        if (step.distanceTo(h.body.body.getPosition()) < h.radius)
        {
          console.log("not safe .. ");
          break;
        }
          
        else {
          isSafe = true;
        }
      if (isSafe) {
        this.respawnAt(step)
        break;
      }
    }

    if (!isSafe)
      this.respawnAt(AvatarBase.safeSteps[0]);
  }


  respawnAt(pos: Vector3) {
    AvatarBase.safeSteps = [AvatarBase.safeSteps[0]];

    let hp = this.body.getElement(HitPoints);
    if (hp !== undefined)
      hp.reset();

    let camTarget = this.body.getElement(CameraTarget);
    if (camTarget !== undefined)
      camTarget.reset();
    this.body.body.setAngularVelocity(Helpers.zeroVector);
    this.body.body.setVelocity(Helpers.zeroVector);
    this.body.body.setPosition(pos.clone().add(Helpers.NewVector3(0, 0.5, 0)));
  }
}
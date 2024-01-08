import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import {
  ActorDestructionHandler,
  CollisionHandler,
  CollisionInfo,
  HitPointChangeHandler,
  UpdateHandler,
} from "engine/MessageHandlers";
import { Vector3 } from "three";
import { HazardZone } from "./HazardZone";
import { HitPoints } from "./HitPoints";
import { CameraTarget } from "./CameraTarget";
import { VisibilityFlicker } from "./VisibilityFlicker";
import { ScaleLoop } from "./ScaleLoop";
import { GuideBody } from "./GuideBody";
import { SfxPlayer } from "./SfxPlayer";

export class AvatarBase
  extends LMent
  implements
    UpdateHandler,
    HitPointChangeHandler,
    CollisionHandler,
    ActorDestructionHandler
{
  public static safeSteps: Vector3[] = [];
  private maxSafeSteps: number = 500;
  private reviveMinDistance: number = 0;
  private reviveCounter: number = 3;
  private gameplayIsDifficult: boolean = true;
  public isOnGround = false;
  private revivingCooldown: number = 0.5;
  private safeStepDelay: number = 1;
  protected dragDx = 0;
  protected dragDy = 0;
  dragDelayFunc: any | undefined;
  protected camTarget: CameraTarget | undefined;
  protected camGuide: GuideBody | undefined;
  private hpDelayedFunc: any | undefined;
  public respawnDelay: number = 1;
  constructor(body: BodyHandle, id: number, params: Partial<AvatarBase> = {}) {
    super(body, id, params);
  }

  onInit(): void {
    GameplayScene.instance.dispatcher.addListener("update", this);
    GameplayScene.instance.dispatcher.addListener("hitPointsChanged", this);
    GameplayScene.instance.dispatcher.addListener("collision", this);
    GameplayScene.instance.dispatcher.addListener("actorDestroyed", this);
    GameplayScene.instance.dispatcher.addListener("drag", this);
    GameplayScene.instance.memory.player = this.body;
    AvatarBase.safeSteps = [];

    this.gameplayIsDifficult =
      GameplayScene.instance.gamePreferences.defaultPlayDifficulty ===
      "hardcore";

    this.reviveMinDistance = this.gameplayIsDifficult ? 20 : 1;
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
    this.camGuide = this.body
      .getAllElements(GuideBody)
      .find((g) => g.guideName === "MainCamera_Lua");
  }

  onUpdate(dt?: number): void {
    this.sinkCheck();
  }

  onActorDestroyed(actor: BodyHandle): void {
    //if (actor === this.body)
    //this.lose();
  }

  onCollision(info: CollisionInfo): void {}

  sinkCheck() {
    if (this.body.body.getPosition().y < 0) this.lose();
  }

  onHitPointChange(
    source: BodyHandle,
    previousHP: number,
    currentHP: number
  ): void {
    //Update healthbar goes here.
    if (source === this.body && currentHP <= 0) {
      this.lose();
    }
  }

  onDrag(dx: number, dy: number): void {
    this.dragDx = dx;
    this.dragDy = dy;
    if (this.dragDelayFunc)
      GameplayScene.instance.dispatcher.removeQueuedFunction(
        this.dragDelayFunc
      );
    this.dragDelayFunc = GameplayScene.instance.dispatcher.queueDelayedFunction(
      this,
      () => {
        this.dragDx = this.dragDy = 0;
      },
      0.05
    );
  }

  lose() {
    // death effect goes here
    this.deathAnim();
    
    this.body.body.setAngularVelocity(Helpers.zeroVector);
    this.body.body.setVelocity(Helpers.zeroVector);
    this.revive();
    const sound = this.body.getElementByName("DeathAudio") as SfxPlayer;
    if (sound) {
      sound.playAudio();
    }
    //To disable movement
    this.enabled = false;

    //Disable camera target element and reset it to center the player in the screen.
    if (this.camTarget) {
      this.camTarget.reset();
      this.camTarget.enabled = false;
    }

    //Disable camera guide element to stop the camera from following the player.
    if (this.camGuide) this.camGuide.enabled = false;

    let hp = this.body.getElement(HitPoints);
    if (hp) hp.enabled = false;
  }

  deathAnim(){
    let scaleanim = this.body.getElement(ScaleLoop);
    if (scaleanim) {
      scaleanim.enabled = true;
      if (this.enableDelayedFunc)
        GameplayScene.instance.dispatcher.removeQueuedFunction(this.enableDelayedFunc);
      this.enableDelayedFunc = GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.body.body.setVisible(false); }, scaleanim.duration);
    }
  }

  addSafeStep() {
    GameplayScene.instance.dispatcher.queueDelayedFunction(
      this,
      () => {
        this.checkSafeStep();
        this.addSafeStep();
      },
      this.safeStepDelay
    );
  }

  checkSafeStep() {
    if (!this.isOnGround) return;

    for (let h of HazardZone.AllZones)
      if (
        this.body.body.getPosition().distanceTo(h.body.body.getPosition()) <
        h.radius
      )
        return;

    if (AvatarBase.safeSteps.length > this.maxSafeSteps)
      AvatarBase.safeSteps.splice(1, 1);
    AvatarBase.safeSteps.push(this.body.body.getPosition().clone());
  }

  revive() {
    let stepPickedUp = false;
    for (let i = AvatarBase.safeSteps.length - 1; i >= 0; i--) {
      let step = AvatarBase.safeSteps[i];

      for (let h of HazardZone.AllZones) {
        if (step.distanceTo(h.body.body.getPosition()) < h.radius) break;
        else if (
          step.distanceTo(this.body.body.getPosition()) < this.reviveMinDistance
        )
          break;
        else stepPickedUp = true;
      }

      if (stepPickedUp) {
        GameplayScene.instance.dispatcher.queueDelayedFunction(
          this,
          () => {
            this.respawnAtIndex(i);
          },
          this.respawnDelay
        );
        break;
      }
    }

    if (!stepPickedUp)
      GameplayScene.instance.dispatcher.queueDelayedFunction(
        this,
        () => {
          this.respawnAtIndex(0);
        },
        this.respawnDelay
      );
  }

  postReviveCallback() {
    if (this.camTarget) {
      this.camTarget.enabled = true;
    }

    //Enable movement again.
    this.enabled = true;
  }

  respawnAtIndex(index: number) {
    this.body.body.setRotation(Helpers.NewQuatFromEuler(0, 0, 0));
    this.body.body.setVisible(true);

    let visibilityFlicker = this.body.getElement(VisibilityFlicker);
    if (visibilityFlicker) {
      //Turn on flickering
      visibilityFlicker.enabled = true;

      //Enabling HP when flickering is done
      if (this.hpDelayedFunc)
        GameplayScene.instance.dispatcher.removeQueuedFunction(
          this.hpDelayedFunc
        );
      this.hpDelayedFunc =
        GameplayScene.instance.dispatcher.queueDelayedFunction(
          this,
          () => {
            let hp = this.body.getElement(HitPoints);
            if (hp) {
              hp.reset();
              hp.enabled = true;
            }
          },
          visibilityFlicker.duration
        );
    }

    //Enable the camera guide to follow the player again.
    if (this.camGuide) this.camGuide.enabled = true;

    //enable the player movement after the cooldown is done.
    GameplayScene.instance.dispatcher.queueDelayedFunction(
      this,
      () => {
        this.postReviveCallback();
      },
      this.revivingCooldown
    );

    //Reset the player's position and velocity.
    this.body.body.setAngularVelocity(Helpers.zeroVector);
    this.body.body.setVelocity(Helpers.zeroVector);

    //Set the player's position to the safe step.
    let pos = AvatarBase.safeSteps[index];
    if (this.gameplayIsDifficult) {
      this.reviveCounter--;
      if (this.reviveCounter < 1) {
        this.reviveCounter = 3;
        pos = AvatarBase.safeSteps[0];
        index = 0;
      }
      /* TODO[Ahmad]: UPDATE UI for the hearts here */
    }

    this.body.body.setPosition(pos.clone().add(Helpers.NewVector3(0, 0.5, 0)));

    //Remove all safe steps after the current one.
    if (AvatarBase.safeSteps.length > 1)
      AvatarBase.safeSteps.splice(index, AvatarBase.safeSteps.length - index);
  }

  UnequipAvatar() {
    GameplayScene.instance.destroyBody(this.body);
  }
}

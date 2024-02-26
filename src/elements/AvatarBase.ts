import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Constants, Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import {
  ActorDestructionHandler,
  CollisionHandler,
  CollisionInfo,
  HitPointChangeHandler,
  UpdateHandler,
} from "engine/MessageHandlers";
import { Vector3, Quaternion } from "three";
import { HazardZone } from "./HazardZone";
import { HitPoints } from "./HitPoints";
import { CameraTarget } from "./CameraTarget";
import { VisibilityFlicker } from "./VisibilityFlicker";
import { StateMachineLMent } from "engine/StateMachineLMent";
import { ScaleWaypoint } from "./ScaleWaypoint";
import { GuideBody } from "./GuideBody";
import { SfxPlayer } from "./SfxPlayer";

export class AvatarBase extends StateMachineLMent implements UpdateHandler, HitPointChangeHandler, CollisionHandler {
  public static safeSteps: { pos: Vector3, rotation: Quaternion }[] = [];
  private maxSafeSteps: number = 500;
  private reviveMinDistance: number = 0;
  private reviveCounter: number = 3;
  private gameplayIsDifficult: boolean = true;
  public isOnGround = false;
  public revivingCooldown: number = 0.5;
  private safeStepDelay: number = 1;
  public dragDx = 0;
  public dragDy = 0;
  dragDelayFunc: any | undefined;
  protected camTarget: CameraTarget | undefined;
  protected camGuide: GuideBody | undefined;
  private hpDelayedFunc: any | undefined;
  public respawnDelay: number = 1;
  public lastHazardousBodyId: number = -1;
  public deathCountByHazard: number = 0;
  public isVulnerable: boolean = true;
  gender: string;

  constructor(body: BodyHandle, id: number, params: Partial<AvatarBase> = {}) {
    super(body, id, params);
    this.gender = params.gender == undefined ? Constants.Male : params.gender?.toLowerCase();
    this.validateGender();
    this.revivingCooldown = params.revivingCooldown === undefined ? 0.5 : params.revivingCooldown;
    this.respawnDelay = params.respawnDelay === undefined ? 1 : params.respawnDelay;
  }

  validateGender() {
    if (!this.gender) return;
    if (this.gender !== Constants.Male && this.gender !== Constants.Female) {
      console.log("Gender can be either Male or Female, male will be used by default.");
      this.gender = Constants.Male;
    }
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
    AvatarBase.safeSteps = [];

    this.gameplayIsDifficult = GameplayScene.instance.gamePreferences.defaultPlayDifficulty === Constants.DifficultyHard;
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
    AvatarBase.safeSteps.push({ pos: this.body.body.getPosition().clone(), rotation: this.body.body.getRotation().clone() });
    this.addSafeStep();
    this.camGuide = GameplayScene.instance.findAllElements(GuideBody).find((g) => g.guideName === Constants.MainCamera);
    if (this.camGuide) {
      this.camTarget = this.camGuide.body.getElement(CameraTarget);
    }
  }

  onUpdate(dt: number): void {
    super.onUpdate(dt);
    this.sinkCheck();
  }

  onActorDestroyed(actor: BodyHandle): void {
    super.onActorDestroyed(actor);
    if (actor === this.body) {
      this.lose();
    }
  }

  sinkCheck() {
    if (this.body.body.getPosition().y < 0) {
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
    this.dragDelayFunc = GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
      this.dragDx = this.dragDy = 0;
    }, 0.05
    );
  }

  lose() {
    // death effect goes here
    this.deathAnim();

    this.body.body.setAngularVelocity(Helpers.zeroVector);
    this.body.body.setVelocity(Helpers.zeroVector);
    this.revive();
    const sound = this.body.getElementByName("DeathAudio") as SfxPlayer;
    if (sound !== undefined) {
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
    if (this.camGuide) {
      this.camGuide.enabled = false;
    }

    let hp = this.body.getElement(HitPoints);
    if (hp)
      hp.enabled = false;
    this.isVulnerable = false;
  }

  deathAnim() {
    let scaleanim = this.body.getElement(ScaleWaypoint);
    if (scaleanim) {
      scaleanim.enabled = true;
      GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.body.body.setVisible(false); }, scaleanim.points[0].duration + scaleanim.points[0].delay);
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
    if (!this.isOnGround) {
      return;
    }

    for (let h of HazardZone.AllZones) {
      if (this.body.body.getPosition().distanceTo(h.body.body.getPosition()) < h.radius) {
        return;
      }
    }

    if (AvatarBase.safeSteps.length > this.maxSafeSteps)
      AvatarBase.safeSteps.splice(1, 1);
    AvatarBase.safeSteps.push({ pos: this.body.body.getPosition().clone(), rotation: this.body.body.getRotation().clone() });
  }

  revive() {
    let stepPickedUp = false;
    for (let i = AvatarBase.safeSteps.length - 1; i >= 0; i--) {
      let step = AvatarBase.safeSteps[i].pos;

      for (let h of HazardZone.AllZones) {
        if (step.distanceTo(h.body.body.getPosition()) < h.radius) break;
        else if (step.distanceTo(this.body.body.getPosition()) < this.reviveMinDistance)
          break;
        else stepPickedUp = true;
      }

      if (stepPickedUp) {
        GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.respawnAtIndex(i); }, this.respawnDelay);
        break;
      }
    }

    if (!stepPickedUp)
      GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.respawnAtIndex(0); }, this.respawnDelay);
  }

  postReviveCallback() {
    if (this.camTarget) {
      this.camTarget.enabled = true;
    }

    //Enable movement again.
    this.enabled = true;
  }

  respawnAtIndex(index: number) {
    this.body.body.setVisible(true);

    let visibilityFlicker = this.body.getElement(VisibilityFlicker);
    if (visibilityFlicker) {
      //Turn on flickering
      visibilityFlicker.enabled = true;

      //Enabling HP when flickering is done
      if (this.hpDelayedFunc) {
        GameplayScene.instance.dispatcher.removeQueuedFunction(this.hpDelayedFunc);
      }

      this.hpDelayedFunc = GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
        let hp = this.body.getElement(HitPoints);
        if (hp) {
          hp.reset();
          hp.enabled = true;
          this.isVulnerable = true;

        }
      }, visibilityFlicker.duration);
    }

    //Enable the camera guide to follow the player again.
    if (this.camGuide) {
      this.camGuide.enabled = true;
      this.camGuide.body.getAllElements(GuideBody).forEach((g) => {
        g.shouldSnap = true;
      });
    }

    //enable the player movement after the cooldown is done.
    GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.postReviveCallback(); }, this.revivingCooldown);

    //Reset the player's position and velocity.
    this.body.body.setAngularVelocity(Helpers.zeroVector);
    this.body.body.setVelocity(Helpers.zeroVector);

    //Set the player's position to the safe step.
    let step = AvatarBase.safeSteps[index];
    if (this.gameplayIsDifficult) {
      this.reviveCounter--;
      if (this.reviveCounter < 1) {
        this.reviveCounter = 3;
        step = AvatarBase.safeSteps[0];
        index = 0;
      }
      /* TODO[Ahmad]: UPDATE UI for the hearts here */
    }

    this.body.body.setPosition(step.pos.clone().add(Helpers.NewVector3(0, 0.5, 0)));
    this.body.body.setRotation(step.rotation.clone());

    //Remove all safe steps after the current one.
    if (AvatarBase.safeSteps.length > 1) {
      AvatarBase.safeSteps.splice(index, AvatarBase.safeSteps.length - index - 1);
    }
  }

  UnequipAvatar() {
    GameplayScene.instance.destroyBody(this.body);
  }

  RepetitiveEnemyCheck(body: BodyHandle) {
    if(!this.isVulnerable) return;
    if (body.body.id !== this.lastHazardousBodyId) {
      this.lastHazardousBodyId = body.body.id;
      this.deathCountByHazard = 0;
    }
    else {
      this.deathCountByHazard++;
      if (this.deathCountByHazard >= 2)
        GameplayScene.instance.destroyBody(body);
    }
  }
}

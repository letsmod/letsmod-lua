import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo, PhysicsSubstepHandler } from "engine/MessageHandlers";
import { GameplayScene } from "engine/GameplayScene";

export class SlowDownEffect extends LMent implements CollisionHandler, PhysicsSubstepHandler {
  public slowDownFactor: number;
  public effectDuration: number; // Duration the effect lasts after leaving the area (in seconds)

  private affectedBodies: Map<number, { endTime: number }> = new Map(); // Track affected bodies and when the effect should end

  constructor(body: BodyHandle, id: number, params: Partial<SlowDownEffect>) {
    super(body, id, params);
    this.slowDownFactor = params.slowDownFactor === undefined ? 0.5 : params.slowDownFactor;
    this.effectDuration = params.effectDuration === undefined ? 3 : params.effectDuration;
  }

  onInit() {
    // Register this element to listen for collision events and substep updates
    GameplayScene.instance.dispatcher.addListener("collision", this);
    GameplayScene.instance.dispatcher.addListener("physicsSubstep", this);
  }

  onStart() {
    // Initialization code
  }

  onCollision(info: CollisionInfo) {
    const otherBodyId = info.getOtherObjectId();
    const otherBody = GameplayScene.instance.getBodyById(otherBodyId);
    if (otherBody) {
      // Mark the body as affected and set the end time for the effect
      this.affectedBodies.set(otherBodyId, { endTime: GameplayScene.instance.memory.timeSinceStart + this.effectDuration });
    }
  }

  onPhysicsSubstep(substepDt: number) {
    // Update and apply the slow down effect for each affected body during each physics substep
    this.affectedBodies.forEach((value, bodyId) => {
      const body = GameplayScene.instance.getBodyById(bodyId);
      if (body) {
        const currentTime = GameplayScene.instance.memory.timeSinceStart;
        if (currentTime <= value.endTime) {
          // Apply the slow down effect
          const currentVelocity = body.body.getVelocity();
          const slowedVelocity = currentVelocity.multiplyScalar(this.slowDownFactor);
          body.body.setVelocity(slowedVelocity);
        } else {
          // Effect duration has ended, remove the body from the affected list
          this.affectedBodies.delete(bodyId);
        }
      } else {
        // Body no longer exists, remove it from the affected list
        this.affectedBodies.delete(bodyId);
      }
    });
  }
}

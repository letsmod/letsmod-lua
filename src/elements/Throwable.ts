import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { AbstractGadget } from "./Gadgets/AbstractGadget";
import { DamageTeam, HitPoints } from "./HitPoints";

export class Throwable extends AbstractGadget {
  throwSpeedHorizontal : number;
  throwSpeedVertical : number;
  autoAimMinDotProduct : number;
  gravityConstant : number;

  constructor(body: BodyHandle, id: number, params: Partial<Throwable> = {})
  {
    super(body, id, params);
    this.throwSpeedHorizontal = params.throwSpeedHorizontal ?? 9;
    this.throwSpeedVertical = params.throwSpeedVertical ?? 5;
    this.autoAimMinDotProduct = params.autoAimMinDotProduct ?? 0.85;
    this.gravityConstant = params.gravityConstant ?? -9.81 * 2.5;
  }

  onInit(): void {
    super.onInit();
  }

  onStart(): void {
    super.onStart();
  }

  doActivate() {
    let playerBody = GameplayScene.instance.memory.player;
    if (playerBody)
    {
      let direction = Helpers.forwardVector.applyQuaternion(playerBody.body.getRotation());
      direction.multiplyScalar(this.throwSpeedHorizontal);

      let closestTargetScore = Infinity;
      let closestTarget : BodyHandle | undefined = undefined;

      let hpElements = GameplayScene.instance.findAllElements(HitPoints);
      for (let hp of hpElements)
      {
        if (hp.team !== DamageTeam.player && hp.body !== this.body)
        {
          let delta = hp.body.body.getPosition().clone().sub(this.body.body.getPosition());
          let distance = delta.length();
          if (distance < this.throwSpeedHorizontal)
          {
            let dot = delta.setY(0).normalize().dot(direction);
            if (dot >= this.autoAimMinDotProduct)
            {
              let score = distance;
              if (score < closestTargetScore)
              {
                closestTargetScore = score;
                closestTarget = hp.body;
              }  
            }
          }
        }
      }

      if (closestTarget)
      {
        let targetPosition = closestTarget.body.getPosition();
        let myPosition = this.body.body.getPosition();

        let delta = targetPosition.clone().sub(myPosition);
        direction.copy(delta).normalize().multiplyScalar(this.throwSpeedHorizontal);

        let timeToTarget = delta.length() / this.throwSpeedHorizontal;

        direction.y += -0.5 * this.gravityConstant * timeToTarget;
        
        if (direction.y > this.throwSpeedVertical)
        {
          direction.y = this.throwSpeedVertical;
        }
      }
      else
      {
        direction.y = this.throwSpeedVertical;
      }

      this.body.body.setVelocity(direction);
      return direction.setY(0).normalize();
    }
    return undefined;
  }
}
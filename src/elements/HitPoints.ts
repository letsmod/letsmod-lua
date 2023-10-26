import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";

export type DamageType = "blunt" | "slash" | "pierce" | "heat" | "cold" | "electric" | "poison";
export enum DamageTeam {
  neutral = 0,
  player = 1,
  enemy = 2
}

export class HitPoints extends LMent
{
  maxHitpoints : number;
  hitpoints : number;
  damageTypeMultipliers: {[D in DamageType]?: number};
  team: DamageTeam;

  constructor(body: BodyHandle, id: number, params: Partial<HitPoints> = {})
  {
    super(body, id);
    this.maxHitpoints = params.maxHitpoints === undefined? 1: params.maxHitpoints;
    this.hitpoints = params.hitpoints === undefined? this.maxHitpoints : params.hitpoints;
    this.damageTypeMultipliers = params.damageTypeMultipliers === undefined? {} : params.damageTypeMultipliers;
    this.team = params.team === undefined? 0 : params.team;
  }

  onInit()
  {
  }

  onStart()
  {
  }

  damage(amount : number, type?: DamageType, teamFlags : number = 0)
  {
    let prevHitpoints = this.hitpoints;
    let multiplier = 1;

    // some objects may have multipliers that increase or decrease the damage taken from certain damage types
    if (type !== undefined)
    {
      let maybeMultiplier = this.damageTypeMultipliers[type];
      if (maybeMultiplier !== undefined)
      {
        multiplier = maybeMultiplier;
      }
    }
    let damage = amount * multiplier;

    // some damage may only affect certain teams. team 0 is always affected, and flags 0 affects everything
    if (teamFlags != 0 && this.team != 0 && (teamFlags & this.team) == 0)
    {
      damage = 0;
    }

    if (damage != 0)
    {
      this.hitpoints -= amount;
      if (this.hitpoints < 0)
      {
        this.hitpoints = 0;
      }
      if (this.hitpoints > this.maxHitpoints)
      {
        this.hitpoints = this.maxHitpoints;
      }

      if (prevHitpoints != this.hitpoints)
      {
        GameplayScene.instance.dispatcher.onHitPointChange(this.body, prevHitpoints, this.hitpoints);
      }
    }
  }

  heal (amount : number)
  {
    this.damage(-amount);
  }
}
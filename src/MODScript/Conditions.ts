import { GenericCondition } from "MODScript/MODscriptDefs";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { MODscriptEvent } from "./MODscriptEvent";
import { Helpers } from "engine/Helpers";
import { Vector3 } from "three";
import { Tag } from "elements/Tag";
import { HitPoints } from "elements/HitPoints";
import { EventHandler } from "./EventHandler";

export class Element implements GenericCondition {
    elementId: string; // number or string??
    constructor(args: Partial<Element>) {
        this.elementId = args.elementId ?? "";
    }

    checkConditionOnActor(actor: BodyHandle): boolean {

        if (actor.getElementByTypeName(this.elementId)) {
            return true;
        }

        return false;
    }
}

export class HasTag implements GenericCondition {
    tagId: string;
    constructor(args: Partial<HasTag>) {
        this.tagId = args.tagId ?? "";
    }

    checkConditionOnActor(actor: BodyHandle): boolean {

        //const hasTag = actor.getElement(Tag);
        for (let i of actor.getAllElements(Tag))
            if (i.tag === this.tagId)
                return true;

        return false;
    }
}

export class IsPlayer implements GenericCondition {

    checkConditionOnActor(actor: BodyHandle): boolean {

        return GameplayScene.instance.memory.player !== undefined && actor.body.id === GameplayScene.instance.memory.player.body.id;
    }
}

export class IsPhysical implements GenericCondition {

    checkConditionOnActor(actor: BodyHandle): boolean {

        return actor.body.getPhysicsBodyType() === 0;
    }
}

export class IsKinematic implements GenericCondition {

    checkConditionOnActor(actor: BodyHandle): boolean {

        return actor.body.getPhysicsBodyType() === 1;
    }
}

export class IsHologram implements GenericCondition {

    checkConditionOnActor(actor: BodyHandle): boolean {
        return actor.body.getPhysicsBodyType() === 2;
    }
}

export class IsOnTeam implements GenericCondition {
    teamId: number;
    constructor(args: Partial<IsOnTeam>) {
        this.teamId = args.teamId ?? -1;
    }

    checkConditionOnActor(actor: BodyHandle): boolean {

        const x = actor.getElement(HitPoints);
        return x !== undefined && x.team === this.teamId;

    }
}

export class MinMass implements GenericCondition {
    minMass: number;
    constructor(args: Partial<MinMass>) {
        this.minMass = args.minMass ?? 0;
    }

    checkConditionOnActor(actor: BodyHandle): boolean {

        const actorMass = actor.body.getMass();
        return actorMass >= this.minMass;

    }
}

export class MaxMass implements GenericCondition {
    MaxMass: number;
    constructor(args: Partial<MaxMass>) {
        this.MaxMass = args.MaxMass ?? 1;
    }

    checkConditionOnActor(actor: BodyHandle): boolean {

        const actorMass = actor.body.getMass();
        return actorMass <= this.MaxMass;

    }
}

export class MinSize implements GenericCondition {
    minSize: Vector3;
    constructor(args: Partial<MinSize>) {
        this.minSize = args.minSize ?? Helpers.NewVector3(0, 0, 0);
    }

    checkConditionOnActor(actor: BodyHandle): boolean {
        return actor.body.getScale() >= this.minSize;
    }
}

export class MaxSize implements GenericCondition {
    maxSize: Vector3;
    constructor(args: Partial<MaxSize>) {
        this.maxSize = args.maxSize ?? Helpers.NewVector3(1, 1, 1);
    }

    checkConditionOnActor(actor: BodyHandle): boolean {
        return actor.body.getScale() <= this.maxSize;
    }
}

export class AndCond implements GenericCondition {
    condition1: GenericCondition | undefined;
    condition2: GenericCondition | undefined;
    constructor(args: Partial<AndCond>) {
        this.condition1 = args.condition1;
        this.condition2 = args.condition2;
    }

    checkConditionOnActor(actor: BodyHandle): boolean {


        if (this.condition1 && this.condition2) {
            return true;
        }

        return false;
    }
}

export class OrCond implements GenericCondition {
    condition1: GenericCondition | undefined;
    condition2: GenericCondition | undefined;
    constructor(args: Partial<OrCond>) {
        this.condition1 = args.condition1;
        this.condition2 = args.condition2;
    }

    checkConditionOnActor(actor: BodyHandle): boolean {


        if (this.condition1 || this.condition2) {
            return true;
        }

        return false;
    }
}

export class NotCond implements GenericCondition {
    condition: GenericCondition | undefined;
    constructor(args: Partial<NotCond>) {
        this.condition = args.condition;
    }

    checkConditionOnActor(actor: BodyHandle): boolean {
        return !this.condition;
    }
}

export class IsOther implements GenericCondition {
    actorId: number;
    constructor(args: Partial<IsOther>) {
        this.actorId = args.actorId ?? -1;
    }

    checkConditionOnActor(actor: BodyHandle): boolean {
        const targetActor = GameplayScene.instance.getBodyById(this.actorId);
        return targetActor ? actor.body.id === targetActor.body.id : false;
    }
}

export class SeenOther implements GenericCondition {
    actorId: number;
    constructor(args: Partial<SeenOther>) {
        this.actorId = args.actorId ?? -1;
    }

    checkConditionOnActor(actor: BodyHandle): boolean {
        const targetActor = GameplayScene.instance.getBodyById(this.actorId);
        if (!targetActor)
            return false;
        const myFwd = Helpers.forwardVector.applyQuaternion(actor.body.getRotation());
        const dotCheck = myFwd.dot(targetActor.body.getPosition().clone().sub(actor.body.getPosition()).normalize());
        return dotCheck > 0.75;
    }
}

export class IsTrue implements GenericCondition {

    checkConditionOnActor(actor: BodyHandle): boolean {

        return true;
    }
}
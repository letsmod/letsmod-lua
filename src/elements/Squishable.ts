import { Collectible } from "./Collectible";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo, UpdateHandler } from "engine/MessageHandlers";
import { Vector3 } from "three";
import { Tag } from "./Tag";

export class Squishable extends LMent implements CollisionHandler, UpdateHandler {
    private collidedBodies: BodyHandle[] = [];
    private bodyVelos: Vector3[] = [];

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        GameplayScene.instance.dispatcher.addListener("collision", this);
    }
    
    onStart(): void {

    }

    constructor(body: BodyHandle, id: number, params: Partial<Squishable> = {}) {
        super(body, id, params);
    }

    onCollision(info: CollisionInfo): void {
        let otherBody = GameplayScene.instance.getBodyById(info.getOtherObjectId());
        if (otherBody !== undefined) {
            this.collidedBodies.push(otherBody)
            this.bodyVelos.push(info.getDeltaVSelf());
        }
    }

    onUpdate(dt?: number | undefined): void {
        for (let bi = 0; bi < this.collidedBodies.length; bi++) { //body index

            let squisherBody = this.collidedBodies[bi];

            let canSquish = false;
            for (let i of squisherBody.getAllElements(Tag))
                if (i.tag === "CanSquish") {
                    canSquish = true;
                    break;
                }

            if (canSquish) /// Squish can be applied
                for (let vi = 0; vi < this.bodyVelos.length; vi++) //velocity index
                {
                    if (vi === bi) continue;
                    let squisherVelo = this.bodyVelos[bi];
                    let otherVelo = this.bodyVelos[vi];
                    if (squisherVelo.dot(otherVelo) < -0.5)
                        this.squishMe();
                }

        }

        this.collidedBodies = [];
        this.bodyVelos = [];

    }

    squishMe() {
        GameplayScene.instance.destroyBody(this.body);
        this.enabled = false;
    }
}
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { HitPoints } from "./HitPoints";

export class EnableElementOnDamage extends LMent implements CollisionHandler {
    elementNames: string[] | undefined;
    minDamage: number;
    maxDamage: number;
    elementToEnable: any[];
    currentHP: number;
    hpElement: HitPoints | undefined;
    constructor(body: BodyHandle, id: number, params: Partial<EnableElementOnDamage> = {}) {
        super(body, id, params);
        this.elementNames = this.convertArray(params.elementNames) || [];
        this.elementToEnable = [];
        this.maxDamage = params.maxDamage === undefined ? 20 : params.maxDamage;
        this.minDamage = params.minDamage === undefined ? 1 : params.minDamage;
        this.currentHP = 0;

    }

    onInit(): void {
        GameplayScene._instance.dispatcher.addListener("collision", this);
        if (this.elementNames !== undefined) {
            for (let i = 0; i < this.elementNames.length; i++) {
                let element = this.body.getElementByTypeName(this.elementNames[i]);
                if (element !== undefined) {
                    this.elementToEnable.push(element as LMent);
                    element.enabled = false;
                }
            }
        }
        else {
            console.log("Element not found");
        }
    }
    onStart(): void {
        this.hpElement = this.body.getElement(HitPoints);
        if (this.hpElement !== undefined) {
            this.currentHP = this.hpElement.hitpoints;
        }
    }

    onCollision(info: CollisionInfo): void {
        if (this.hpElement !== undefined) {
            if (this.hpElement.hitpoints < this.currentHP) {
                for (let i = 0; this.elementToEnable !== undefined && i < this.elementToEnable.length; i++) {
                    if (this.elementToEnable[i] !== undefined) {
                        this.elementToEnable[i].enabled = true;
                    }
                }
            }
            this.currentHP = this.hpElement.hitpoints;
        }
    }
}

import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { HitPoints } from "./HitPoints";

export class SetEnabledOnDamage extends LMent implements CollisionHandler {
    elementNames: string[] | undefined;
    minDamage: number;
    maxDamage: number;
    elementToEnable: LMent[];
    currentHP: number;
    hpElement: HitPoints | undefined;
    setEnabled: boolean;

    constructor(body: BodyHandle, id: number, params: Partial<SetEnabledOnDamage> = {}) {
        super(body, id, params);
        this.elementNames = this.convertArray(params.elementNames) || [];
        this.elementToEnable = [];
        this.maxDamage = params.maxDamage === undefined ? 20 : params.maxDamage;
        this.minDamage = params.minDamage === undefined ? 1 : params.minDamage;
        this.currentHP = 0;
        this.setEnabled = params.setEnabled === undefined ? true : params.setEnabled;
    }

    onInit(): void {
        GameplayScene._instance.dispatcher.addListener("collision", this);
        if (this.elementNames !== undefined) {
            for (const elementName of this.elementNames) {
                const element = this.body.getElementByTypeName(elementName);
                if (element !== undefined) {
                    this.elementToEnable.push(element as LMent);
                    element.enabled = false;
                }
            }
        } else {
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
                for (const element of this.elementToEnable) {
                    if (element !== undefined) {
                        element.enabled = this.setEnabled;
                    }
                }
            }
            this.currentHP = this.hpElement.hitpoints;
        }
    }
}

import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { CollisionHandler, CollisionInfo } from "engine/MessageHandlers";
import { HitPoints } from "./HitPoints";


export class EnableElementOnDamage extends LMent implements CollisionHandler
{
    elementName: string;
    minDamage: number;
    maxDamage: number;
    elementToEnable: any;
    currentHP: number;
    hpElement: HitPoints | undefined;
    constructor(body: BodyHandle, id: number, params: Partial<EnableElementOnDamage> = {})
    {
        super(body, id, params);
        this.elementName = params.elementName === undefined? "" : params.elementName;
        this.elementToEnable = undefined;
        this.maxDamage = params.maxDamage === undefined? 20 : params.maxDamage;
        this.minDamage = params.minDamage === undefined? 1 : params.minDamage;
        this.currentHP = 0;
        
    }
    
    onInit(): void {
        GameplayScene._instance.dispatcher.addListener("collision",this);
        this.elementToEnable = this.body.getElementByTypeName(this.elementName) as LMent;
    }
    onStart(): void {
        this.hpElement = this.body.getElement(HitPoints);
        if(this.hpElement !== undefined){
            this.currentHP = this.hpElement.hitpoints;
        }
        
    }
    
    onCollision(info: CollisionInfo): void {
        if(this.hpElement !== undefined){
            if(this.hpElement.hitpoints < this.currentHP){
                if(this.elementToEnable !== undefined){
                    this.elementToEnable.enabled = true;
                }
            }
            this.currentHP = this.hpElement.hitpoints;
        }
        
    }

}
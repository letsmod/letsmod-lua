import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";
import { UpdateHandler } from "engine/MessageHandlers";

export class AutoDestroy extends LMent implements UpdateHandler {
    destructionDelay: number;
    targets: string[] | undefined;
    private targetBody: BodyHandle[];
    private isDestroyed: boolean;

    constructor(body: BodyHandle, id: number, params: Partial<AutoDestroy> = {}) {
        super(body, id, params);
        this.destructionDelay = params.destructionDelay === undefined ? 0 : params.destructionDelay;
        this.targets = this.convertArray(params.targets) || undefined;
        this.targetBody = [];
        this.isDestroyed = false;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
    }

    onStart(): void {
    }
    
    onUpdate(dt: number): void {
        if(!this.isDestroyed){
                GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doDestroy() }, this.destructionDelay);
                this.isDestroyed = true;
        }
    }

    doDestroy() {
        if(this.targets !== undefined){
            for (let i of this.body.bodyGroup)
                    if (this.targets.includes(i.body.name))
                    GameplayScene.instance.destroyBody(i);
        } else {
            GameplayScene.instance.destroyBody(this.body);
        }
    }
}
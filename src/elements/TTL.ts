import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";
import { GameplayScene } from "engine/GameplayScene";

export class TTL extends LMent {
    private destroyed: boolean;
    destructionDelay: number;
    target: string | undefined;
    private targetBody: BodyHandle | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<TTL> = {}) {
        super(body, id, params);
        this.destroyed = false;
        this.destructionDelay = params.destructionDelay === undefined ? 0 : params.destructionDelay;
        this.target = params.target;
    }

    onInit(): void {

    }

    onStart(): void {
        if (this.target !== undefined) {
            for (let i of this.body.bodyGroup)
                if (i.body.name === this.target)
                    this.targetBody = i;
            GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doDestroy(this.targetBody) }, this.destructionDelay);
        }
        else {
            GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => { this.doDestroy() }, this.destructionDelay);
        }
    }

    doDestroy(body: BodyHandle | undefined = this.body) {
        GameplayScene.instance.destroyBody(body);
    }


}
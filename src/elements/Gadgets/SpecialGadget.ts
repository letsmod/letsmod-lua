import { AbstractGadget } from "./AbstractGadget";
import { GameplayScene } from "engine/GameplayScene";
import { BodyHandle } from "engine/BodyHandle";

export abstract class SpecialGadget extends AbstractGadget {

    private flashingTimer: number = 0;
    private flashingInterval: number = 0.1;
    private isHighlighted: boolean = false;

    playerBody: BodyHandle | undefined;
    constructor(body: BodyHandle, id: number, params: Partial<SpecialGadget> = {}) {
        super(body, id, params);
//        this.flashingTimer = this.flashingInterval;
    }

    // override highlightInteractable() {
    //     const dt = 1 / GameplayScene.instance.memory.frameRate
    //     this.flashingTimer -= dt;
    //     if (this.flashingTimer <= 0)
    //         this.toggleHighlight();
    //     if (this.isHighlighted)
    //         this.body.body.showHighlight();
    // }

    // toggleHighlight() {
    //     this.isHighlighted = !this.isHighlighted;
    //     if (this.isHighlighted)
    //         this.flashingTimer = this.flashingInterval;
    //     else
    //         this.flashingTimer = this.flashingInterval * 2;
    // }

    override pickup(): void {
        super.pickup();
        GameplayScene.instance.dispatcher.onTrigger(this,"HidePlus","group");
    }

    override drop(): void {
        super.drop();
        GameplayScene.instance.dispatcher.onTrigger(this,"ShowPlus","group");
    }

}
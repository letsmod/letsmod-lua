import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";
import { ResetPosOnTrigger } from "./ResetPosOnTrigger";
import { TriggerOnTap } from "./TriggerOnTap";
import { Helpers } from "engine/Helpers";

export class BottleVictoryTemp extends LMent implements UpdateHandler {
    isEnabled: boolean = false;
    constructor(body: BodyHandle, id: number, params: Partial<BottleVictoryTemp> = {}) {
        super(body, id, params);
    }
    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
    }
    onStart(): void {
    }

    onEnable(): void {
        this.isEnabled = true;
        this.body.body.setAngularVelocity(Helpers.NewVector3(0, 0, 0));
        this.body.body.setVelocity(Helpers.NewVector3(0, 0, 0));
        const resChip = this.body.getElement(ResetPosOnTrigger);
        if (resChip !== undefined)
            resChip.enabled = false;
        const trigggerOnTap = this.body.getElement(TriggerOnTap);
        if (trigggerOnTap !== undefined)
            trigggerOnTap.enabled = false;
        const clientInterface = GameplayScene.instance.clientInterface;
        if (!clientInterface) return;
        clientInterface.playAudio("10fm/6_waterbottle/successsong");
    }
    onUpdate(dt?: number | undefined): void {
        if (!this.isEnabled) return;
        this.body.body.showHighlight();
    }


}
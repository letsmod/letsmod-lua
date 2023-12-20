import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";

export class SfxPlayer extends LMent implements UpdateHandler, TriggerHandler {

    playDistance: number;
    audio: string;
    loop: boolean = true;
    delay: number = 0;
    triggerId: string;
    receivesTriggersWhenDisabled?: boolean | undefined;
    private loopTimer: number = 0;

    constructor(body: BodyHandle, id: number, params: Partial<SfxPlayer> = {}) {
        super(body, id, params);
        this.playDistance = params.playDistance === undefined ? 3 : params.playDistance;
        this.audio = params.audio === undefined ? Helpers.NA : params.audio;
        this.loop = params.loop === undefined ? true : params.loop;
        this.delay = params.delay === undefined ? 1 : params.delay;
        this.enabled = Helpers.ValidateParams(this.audio, this, "audio");
        this.triggerId = params.triggerId === undefined ? Helpers.NA : params.triggerId;
        this.receivesTriggersWhenDisabled = true;
    }

    hasSubtype(trigger: string): boolean {
        return trigger === this.triggerId;
    }

    onTrigger(source: LMent, triggerId: string): void {

    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
    }

    onStart(): void {

    }

    onUpdate(dt?: number): void {

        this.loopTimer -= this.loopTimer > 0 ? dt || 0 : 0;

        if (!this.loop) return;

        const player = GameplayScene.instance.memory.player;

        if (!player) return;
        const playerPos = player.body.getPosition();
        const distance = playerPos.distanceTo(this.body.body.getPosition());

        if (distance < this.playDistance && this.loopTimer <= 0)
            this.playAudio();
    }


    playAudio() {
        const clientInterface = GameplayScene.instance.clientInterface;
        if (!clientInterface || this.loopTimer > 0) return;
        clientInterface.playAudio(this.audio, this.body.body.id.toString());
        this.loopTimer = this.delay;
    }
}

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
    randomMax: number | undefined;
    randomMin: number | undefined;
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
        this.randomMax = params.randomMax;
        this.randomMin = params.randomMin;
    }

    hasSubtype(trigger: string): boolean {
        return trigger === this.triggerId;
    }

    onTrigger(source: LMent, triggerId: string): void {
        this.playAudio();
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        GameplayScene.instance.dispatcher.addListener("trigger", this);
    }

    onStart(): void {

    }

    onUpdate(dt?: number): void {

        this.loopTimer -= this.loopTimer > 0 ? dt || 0 : 0;

        if (!this.loop) return;


        this.playAudio();
    }


    playAudio() {
        const player = GameplayScene.instance.memory.player;

        if (!player) return;
        const playerPos = player.body.getPosition();
        const distance = playerPos.distanceTo(this.body.body.getPosition());

        if (distance < this.playDistance && this.loopTimer <= 0) {
            const clientInterface = GameplayScene.instance.clientInterface;
            if (!clientInterface || this.loopTimer > 0) return;
            if (this.randomMax && this.randomMin)
                this.randomizeAudio();
            else
                clientInterface.playAudio(this.audio);
            console.log(this.audio);
            this.loopTimer = this.delay;
        }
    }

    randomizeAudio() {
        const clientInterface = GameplayScene.instance.clientInterface;
        if (!clientInterface) return;
        if (!this.randomMax || !this.randomMin) return;
        const random = Math.floor(Math.random() * (this.randomMax) + (this.randomMin));
        clientInterface.playAudio(this.audio + random);
        //console.log(this.audio + random);   
    }
}

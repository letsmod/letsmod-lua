import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { TriggerHandler, UpdateHandler } from "engine/MessageHandlers";

export class SfxPlayer extends LMent implements UpdateHandler, TriggerHandler {

    playDistance: number;
    audio: string;
    audioId: string = "";
    loop: boolean = true;
    delay: number = 0;
    triggerId: string;
    stopTriggerId: string;
    randomMax: number | undefined;
    randomMin: number | undefined;
    receivesTriggersWhenDisabled?: boolean | undefined;
    playerProximity: boolean;
    private loopTimer: number = 0;

    constructor(body: BodyHandle, id: number, params: Partial<SfxPlayer> = {}) {
        super(body, id, params);
        this.playDistance = params.playDistance === undefined ? 3 : params.playDistance;
        this.audio = params.audio === undefined ? Helpers.NA : params.audio;
        this.loop = params.loop === undefined ? true : params.loop;
        this.delay = params.delay === undefined ? 1 : params.delay;
        this.enabled = Helpers.ValidateParams(this.audio, this, "audio");
        this.triggerId = params.triggerId === undefined ? Helpers.NA : params.triggerId;
        this.stopTriggerId = params.stopTriggerId === undefined ? Helpers.NA : params.stopTriggerId;
        this.receivesTriggersWhenDisabled = true;
        this.randomMax = params.randomMax;
        this.randomMin = params.randomMin;
        this.playerProximity = params.playerProximity === undefined ? true : params.playerProximity;

        if (params.audioId !== undefined)
            this.audioId = params.audioId;
    }

    hasSubtype(trigger: string): boolean {
        return trigger === this.triggerId || trigger === this.stopTriggerId;
    }

    onTrigger(source: LMent, triggerId: string): void {
        if (triggerId === this.triggerId)
            this.playAudio();
        else if (triggerId === this.stopTriggerId)
            this.stopAudio();
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        GameplayScene.instance.dispatcher.addListener("trigger", this);
    }

    onStart(): void {
        if(this.audioId !== "")
            {
                this.audioId = this.audioId +  this.id;
            }
    }

    onUpdate(dt?: number): void {

        this.loopTimer -= this.loopTimer > 0 ? dt || 0 : 0;

        if (!this.loop) return;


        this.playAudio();
    }


    playAudio() {
        const player = GameplayScene.instance.memory.player;
        //had to define those for it not to crash when !playerproximity
        let playerPos, distance=99;
        if(this.playerProximity){

            if (!player) return;
            playerPos = player.body.getPosition();
            distance = playerPos.distanceTo(this.body.body.getPosition());
        }

        if (distance < this.playDistance && this.loopTimer <= 0 || !this.playerProximity) {
            const clientInterface = GameplayScene.instance.clientInterface;
            if (!clientInterface || this.loopTimer > 0) return;
            if (this.randomMax && this.randomMin)
                this.randomizeAudio();
            else if (this.audioId !== ""){
                console.log(this.audioId)
                clientInterface.playAudio(this.audio, this.audioId);
            }
            else
                clientInterface.playAudio(this.audio);
            this.loopTimer = this.delay;
        }
        else if (distance > this.playDistance) {
            this.stopAudio();
        }
    }

    stopAudio() {
        const clientInterface = GameplayScene.instance.clientInterface;
        if (!clientInterface) return;
        if (this.audioId === "") return;

        clientInterface.stopAudio(this.audioId);
        this.loopTimer = 0;

    }

    randomizeAudio() {
        const clientInterface = GameplayScene.instance.clientInterface;
        if (!clientInterface) return;
        if (!this.randomMax || !this.randomMin) return;
        const random = Math.floor(Math.random() * (this.randomMax) + (this.randomMin));

        if (this.audioId !== "")
            clientInterface.playAudio(this.audio + random, this.audioId);
        else
            clientInterface.playAudio(this.audio + random);
    }
}

import { EventHandler } from "MODScript/EventHandler";
import { AudioDefinition, CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class SayAction extends GenericAction {
    sentence: string;
    audioHasPlayed: boolean = false;
    eventHandler: EventHandler | undefined;


    audioDuration: number;
    audioFilePath: string;
    actorThumbPath: string;
    audioGap: number;

    private audioObject: AudioDefinition | undefined;

    constructor(parentEvent: MODscriptEvent, args: Partial<SayAction>) {
        super(parentEvent, CATs.Say);
        this.sentence = args.sentence ?? "";
        this.audioDuration = args.audioDuration ?? 1;
        this.audioFilePath = args.audioFilePath ?? "";
        this.actorThumbPath = args.actorThumbPath ?? "";
        this.audioGap = args.audioGap ?? 0.5;

        const eventHandler = GameplayScene.instance.eventHandler;
        this.eventHandler = eventHandler;
        if (this.eventHandler) {
            this.audioObject = {
                audioActionId: this.ActionId,
                audioDuration: this.audioDuration,
                filePath: this.audioFilePath,
                actorThumbPath: this.actorThumbPath,
                audioGap: this.audioGap,
                isPlaying: false
            };
            this.eventHandler.registerAudioAction(this.audioObject);
        }
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!this.eventHandler) {
            this.actionFailed();
            return;
        }
        this.audioHasPlayed = this.eventHandler.playAudioAction(this.ActionId, this.sentence)
        if (!this.audioHasPlayed)
            this.actionFailed();
    }

    monitorAction(): void {
        if (!this.eventHandler) {
            this.actionFailed();
            return;
        }
        console.log("Talking ...");
        if (this.audioHasPlayed && !this.eventHandler.isAudioPlaying(this.ActionId))
            this.actionFinished();
    }
}
import { EventHandler } from "MODScript/EventHandler";
import { AudioDefinition, CATs, GenericAction } from "MODScript/MODscriptDefs";
import { MODscriptEvent } from "MODScript/MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class SayAction extends GenericAction {
    sentence: string;
    audioHasPlayed: boolean = false;
    eventHandler: EventHandler | undefined;


    durationMs: number;
    get duration(){return this.durationMs/1000}

    audioId: string;
    image: string;
    
    audioGapMs: number;
    get audioGap(){return this.audioGapMs/1000}

    isPlaying: boolean = false;
    audioObject: AudioDefinition | undefined;

    constructor(parentEvent: MODscriptEvent, args: Partial<SayAction>) {
        super(parentEvent, CATs.Say);
        this.sentence = args.sentence ?? "";
        this.durationMs = args.durationMs ?? 1;
        this.audioId = args.audioId ?? "";
        this.image = args.image ?? "";
        this.audioGapMs = args.audioGapMs ?? 0.5;

        const eventHandler = GameplayScene.instance.eventHandler;
        this.eventHandler = eventHandler;
    }

    performAction(triggerOutput?: BodyHandle | undefined): void {
        if (!this.eventHandler) {
            this.actionFailed();
            return;
        }
        this.audioHasPlayed = this.eventHandler.playAudioAction(this)
    
        if(!this.audioHasPlayed)
            this.actionFailed();
    }

    monitorAction(): void {
        if (!this.eventHandler) {
            this.actionFailed();
            return;
        }
         
        if(this.audioHasPlayed && !this.isPlaying)
            {
                console.log("Say action finished for event: " + this.parentEvent.EventId);
                this.actionFinished();
            }
    }
}
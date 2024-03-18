import { SayAction } from "MODScript/Actions/SayAction";
import { GameplayScene } from "../engine/GameplayScene";
import { AudioDefinition } from "MODScript/MODscriptDefs";

export class MODscriptAudioManager {

    audioList: AudioDefinition[] = [];
    audioPlayerBusy: boolean = false;
    audioDelayedFunction: any;

    constructor() {
        this.audioPlayerBusy = false;
        this.audioList = [];
        this.audioDelayedFunction = undefined;
    }

    playAudioAction(sayAction: SayAction): boolean {

        if (this.audioPlayerBusy) return false;

        this.audioPlayerBusy = true;
        sayAction.isPlaying = true;

        GameplayScene.instance.speak(sayAction.sentence, sayAction.parentEvent.action?.args as any);

        if (this.audioDelayedFunction)
            GameplayScene.instance.dispatcher.removeQueuedFunction(this.audioDelayedFunction);

        this.audioDelayedFunction =
            GameplayScene.instance.dispatcher.queueDelayedFunction(undefined, () => {
                this.audioPlayerBusy = false;
                sayAction.isPlaying = false;
            }, sayAction.duration + sayAction.audioGap);

        return true;
    }

    isAudioPlaying(actionId: string): boolean {
        const index = this.audioList.findIndex(
            (audio) => audio.audioActionId === actionId
        );
        if (index === -1) return false;
        return this.audioList[index].isPlaying;
    }

    registerAudioAction(audioObject: AudioDefinition): void {
        this.audioList.push(audioObject);
    }

}
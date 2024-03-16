import { CollisionInfoFactory, UpdateHandler } from "engine/MessageHandlers";
import { AudioDefinition, EventDefinition } from "./MODscriptDefs";
import { MODscriptEvent } from "./MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { SayAction } from "./Actions/SayAction";
import { JSONparser } from "./JSONparser";
import { Helpers } from "engine/Helpers";

export class EventHandler implements UpdateHandler {
    jsonData: string = "";
    events: MODscriptEvent[] = [];

    audioList: AudioDefinition[] = [];
    audioPlayerBusy: boolean = false;
    audioDelayedFunction: any;

    private collisionEventBodyMap: { event: MODscriptEvent; bodyId: number }[] =
        [];
    private taggedBodiesList: BodyHandle[] = [];
    private catsInitialized: boolean = false;
    static _instance: EventHandler;

    public get TaggedBodiesList(): BodyHandle[] {
        return this.taggedBodiesList;
    }

    public static get instance(): EventHandler {
        if (!EventHandler._instance) EventHandler._instance = new EventHandler();
        return EventHandler._instance;
    }

    initialize(): void {
        this.audioPlayerBusy = false;
        this.audioList = [];
        this.audioDelayedFunction = undefined;
        this.collisionEventBodyMap = [];
        this.taggedBodiesList = [];
        this.events = [];
        this.catsInitialized = false;
    }

    initCATs(): void {
        if (this.catsInitialized) return;
        this.catsInitialized = true;
        //In case jsonData is not empty, it means that the MODscriptOverride Element is present in the scene which will parse the JSON inside the element instead of the real MODscript.
        if(this.jsonData != ""){
            console.log("           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! NOT A JOKE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            console.log("WARNING 3 :: JSON data is overridden by the MODscriptOverride Element, Make sure to delete that element from the scene to use the real MODscript.")
            console.log("WARNING 2 :: JSON data is overridden by the MODscriptOverride Element, Make sure to delete that element from the scene to use the real MODscript.")
            console.log("WARNING 1 :: JSON data is overridden by the MODscriptOverride Element, Make sure to delete that element from the scene to use the real MODscript.")
            console.log("                                                              **********")
            this.events = this.parseDummyJson();
        } else this.events = this.buildMODScriptFromEvents(GameplayScene.instance.story);
        
        for (let event of this.events) {
            event.setCATs();
        }
    }

    /**************** These are for CATs Team to be able to debug MODscript issues ****************/
    parseDummyJson(): MODscriptEvent[] {

        const eventDefs = JSONparser.parseEventDefinitions(this.jsonData.split("'").join('"'));
        let events: MODscriptEvent[] = [];
        for (let i = 0; i < eventDefs.length; i++) {
            events.push(new MODscriptEvent(i, eventDefs[i]));
            //this.printEventDefinition(eventDefs[i]);
        }
        return events;
    }

    //For debugging purposes.
    printEventDefinition(eventDef: EventDefinition) {
        Helpers.printObject(eventDef, "");
    }

    /*******************************************************************************************/

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

    buildMODScriptFromEvents(eventDefs: EventDefinition[]): MODscriptEvent[] {
        const events: MODscriptEvent[] = [];
        for (let i = 0; i < eventDefs.length; i++) {
            events.push(new MODscriptEvent(i, eventDefs[i]));
        }
        return events;
    }

    public getEvent(eventId: number): MODscriptEvent | undefined {
        return this.events.find((event) => event.EventId === eventId);
    }

    public onUpdate(dt: number): void {
        for (let event of this.events) event.checkEvent();
    }

    public cacheTaggedBody(body: BodyHandle) {
        this.taggedBodiesList.push(body);
    }

    public addEventBodyMapEntry(event: MODscriptEvent, bodyId: number) {
        this.collisionEventBodyMap.push({ event: event, bodyId: bodyId });
    }

    public onCollision(infoFactory: CollisionInfoFactory) {
        const body1id = infoFactory.aId;
        const body2id = infoFactory.bId;

        for (let mapItem of this.collisionEventBodyMap) {
            const event = mapItem.event;
            if (mapItem.bodyId === body1id) {
                event.checkEvent(infoFactory.makeCollisionInfo("a"));
            } else if (mapItem.bodyId === body2id) {
                event.checkEvent(infoFactory.makeCollisionInfo("b"));
            }
        }
    }

    registerAudioAction(audioObject: AudioDefinition): void {
        this.audioList.push(audioObject);
    }
    public GetActiveEvents(): MODscriptEvent[] {
        return this.events.filter((event) => event.IsActive);
    }

    public GetCompletedEvents(): MODscriptEvent[] {
        return this.events.filter((event) => event.IsFinished);
    }

    public EventIsCompleted(eventId: number): boolean {
        const event = this.getEvent(eventId);
        return event !== undefined && event.IsFinished;
    }

    public EventIsActive(eventId: number): boolean {
        const event = this.getEvent(eventId);
        return event !== undefined && event.IsActive;
    }

    public EnableEvent(eventId: number): void {
        const event = this.getEvent(eventId);
        if (event !== undefined) event.enableEvent();
    }

    public DisableEvent(eventId: number): void {
        const event = this.getEvent(eventId);
        if (event !== undefined) event.disableEvent();
    }

    public HasEvent(eventId: number): boolean {
        return this.getEvent(eventId) !== undefined;
    }
}

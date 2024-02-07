import { CollisionInfoFactory, UpdateHandler } from "engine/MessageHandlers";
import { AudioDefinition, EventDefinition } from "./MODscriptDefs";
import { MODscriptEvent } from "./MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { SayAction } from "./Actions/SayAction";

export class EventHandler implements UpdateHandler {
    jsonData: string = ""; //'[{"actorName":"zombie","trigger":{"triggerType":"Nearby","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"wolf"}},"maxDistance":3}},"action":{"actionType":"Say","args":{"sentence":"Hey buddy lets eat some brains!"}},"repeatable":false,"enabled":true},{"actorName":"zombie","trigger":{"triggerType":"Nearby","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"wolf"}},"maxDistance":2}},"action":{"actionType":"NavigateOther","args":{"actorName":"human"}},"repeatable":false,"enabled":true},{"actorName":"human","trigger":{"triggerType":"Nearby","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"zombie"}},"maxDistance":7}},"action":{"actionType":"JumpUpAction","args":{}},"repeatable":true,"enabled":true},{"actorName":"human","trigger":{"triggerType":"Nearby","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"zombie"}},"maxDistance":7}},"action":{"actionType":"Say","args":{"sentence":"HEEEEELP .. A ZOOMBIE!!"}},"repeatable":false,"enabled":true},{"actorName":"zombie","trigger":{"triggerType":"Nearby","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"hero"}},"maxDistance":3}},"action":{"actionType":"DestroyOther","args":{"actorName":"zombie"}},"repeatable":false,"enabled":true},{"actorName":"human","trigger":{"triggerType":"OtherDestroyed","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"zombie"}}}},"action":{"actionType":"Say","args":{"sentence":"My hero! You saved me!"}},"repeatable":false,"enabled":true},{"actorName":"human","trigger":{"triggerType":"Nearby","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"zombie"}},"maxDistance":3}},"action":{"actionType":"DestroyOther","args":{"actorName":"human"}},"repeatable":false,"enabled":true},{"actorName":"zombie","trigger":{"triggerType":"OtherDestroyed","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"human"}}}},"action":{"actionType":"Say","args":{"sentence":"Yummi BRAINZ!"}},"repeatable":false,"enabled":true}]';
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
        this.catsInitialized = false;
    }

    initCATs(): void {
        if (this.catsInitialized) return;
        this.catsInitialized = true;
        this.events = this.buildMODScriptFromEvents(GameplayScene.instance.story);//this.events = this.buildMODScriptFromEvents(JSONparser.parseEventDefinitions(EventHandler.instance.jsonData));
        for (let event of this.events) {
            event.setCATs();
        }
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

    buildMODScriptFromEvents(eventDefs: EventDefinition[]): MODscriptEvent[] {
        const events: MODscriptEvent[] = [];
        for (let i = 0; i < eventDefs.length; i++) {
            events.push(new MODscriptEvent(i, eventDefs[i]));
        }
        return events;
    }

    //For debugging purposes.
    printEventDefinition(eventDef: EventDefinition) {
        this.printObject(eventDef, "");
    }

    //For debugging purposes.
    printObject(obj: any, indent: string) {
        for (const key in obj) {
            if (!obj.hasOwnProperty(key)) continue;

            if (typeof obj[key] === "object" && obj[key] !== null) {
                console.log(`${indent}${key}:`);
                this.printObject(obj[key], indent + "  ");
            } else {
                console.log(`${indent}${key}: ${obj[key]}`);
            }
        }
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

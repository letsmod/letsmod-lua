import { UpdateHandler } from "engine/MessageHandlers";
import { CATs, EventDefinition } from "./MODscriptDefs";
import { MODscriptEvent } from "./MODscriptEvent";
import { JSONparser } from "./JSONparser";

export class EventHandler implements UpdateHandler {

    jsonData: string = '';//'[{"actorName":"zombie","trigger":{"triggerType":"Nearby","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"wolf"}},"maxDistance":3}},"action":{"actionType":"Say","args":{"sentence":"Hey buddy lets eat some brains!"}},"repeatable":false,"enabled":true},{"actorName":"zombie","trigger":{"triggerType":"Nearby","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"wolf"}},"maxDistance":2}},"action":{"actionType":"NavigateOther","args":{"actorName":"human"}},"repeatable":false,"enabled":true},{"actorName":"human","trigger":{"triggerType":"Nearby","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"zombie"}},"maxDistance":7}},"action":{"actionType":"JumpUpAction","args":{}},"repeatable":true,"enabled":true},{"actorName":"human","trigger":{"triggerType":"Nearby","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"zombie"}},"maxDistance":7}},"action":{"actionType":"Say","args":{"sentence":"HEEEEELP .. A ZOOMBIE!!"}},"repeatable":false,"enabled":true},{"actorName":"zombie","trigger":{"triggerType":"Nearby","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"hero"}},"maxDistance":3}},"action":{"actionType":"DestroyOther","args":{"actorName":"zombie"}},"repeatable":false,"enabled":true},{"actorName":"human","trigger":{"triggerType":"OtherDestroyed","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"zombie"}}}},"action":{"actionType":"Say","args":{"sentence":"My hero! You saved me!"}},"repeatable":false,"enabled":true},{"actorName":"human","trigger":{"triggerType":"Nearby","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"zombie"}},"maxDistance":3}},"action":{"actionType":"DestroyOther","args":{"actorName":"human"}},"repeatable":false,"enabled":true},{"actorName":"zombie","trigger":{"triggerType":"OtherDestroyed","args":{"condition":{"conditionType":"IsOther","args":{"actorName":"human"}}}},"action":{"actionType":"Say","args":{"sentence":"Yummi BRAINZ!"}},"repeatable":false,"enabled":true}]';
    events: MODscriptEvent[] = [];
    private catsInitialized:boolean = false;
    static _instance: EventHandler

    public static get instance(): EventHandler {
        if (!EventHandler._instance)
            EventHandler._instance = new EventHandler();
        return EventHandler._instance;
    }

    initialize(): void {
        this.catsInitialized = false;
    }

    initCATs(): void {
        if (this.catsInitialized) return;
        this.catsInitialized = true;
        this.events = this.parseDummyJson();
        for (let event of this.events) {
            event.setCATs();
        }
    }

    parseDummyJson(): MODscriptEvent[] {
        
        const eventDefs = JSONparser.parseEventDefinitions(this.jsonData.split("'").join('"'));
        let events: MODscriptEvent[] = [];
        for (let i=0; i<eventDefs.length; i++) {
            //this.printEventDefinition(eventDefs[i]);
            events.push(new MODscriptEvent(i, eventDefs[i]));
        }
        return events;
    }

    printEventDefinition(eventDef: EventDefinition) {
        this.printObject(eventDef, '');
    }
    
    printObject(obj: any, indent: string) {
        for (const key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
    
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                console.log(`${indent}${key}:`);
                this.printObject(obj[key], indent + '  ');
            } else {
                console.log(`${indent}${key}: ${obj[key]}`);
            }
        }
    }

    public getEvent(eventId: number): MODscriptEvent | undefined {
        return this.events.find(event => event.EventId === eventId);
    }

    public onUpdate(dt: number): void {
        for (let event of this.events)
            event.checkEvent();
    }

    public GetActiveEvents(): MODscriptEvent[] {
        return this.events.filter(event => event.IsActive);
    }

    public GetCompletedEvents(): MODscriptEvent[] {
        return this.events.filter(event => event.IsFinished);
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
        if (event !== undefined)
            event.enableEvent();
    }

    public DisableEvent(eventId: number): void {
        const event = this.getEvent(eventId);
        if (event !== undefined)
            event.disableEvent();
    }

    public HasEvent(eventId: number): boolean {
        return this.getEvent(eventId) !== undefined;
    }
}
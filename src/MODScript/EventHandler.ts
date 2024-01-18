import { UpdateHandler } from "engine/MessageHandlers";
import { EventDefinition } from "./MODscriptDefs";
import { MODscriptEvent } from "./MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";

export class EventHandler implements UpdateHandler {

    dummyData: string = "";
    events: MODscriptEvent[] = [];

    private static _instance: EventHandler
    public static get instance(): EventHandler {
        if (!EventHandler._instance)
            EventHandler._instance = new EventHandler();
        return EventHandler._instance;
    }

    initialize(): void {
        //Filling in Dummy Data 
        console.log("Initializing Event Handler");
        this.events = this.createDummyData();
        for(let event of this.events)
            event.setCATs();
    }

    createDummyData(): MODscriptEvent[] {
        const event1: EventDefinition = {
            actorId: 24792,
            trigger: {
                triggerType: "Nearby",
                args: {
                    condition: {
                        conditionType: "IsOther",
                        args: { actorId: 24817 }
                    },
                    maxDistance: 2
                }
            },
            action: {
                actionType: "JumpUp",
                args: { jumpHeight: 4000 }
            },
            repeatable: false,
            enabled: true
        };
        
        const event2: EventDefinition = {
            actorId: 24792,
            trigger: {
                triggerType: "CompletedEvent",
                args: { eventId: 0 }
            },
            action: {
                actionType: "NavigateOther",
                args: { actorId: 24828, speed: -0.3}
            },
            repeatable: false,
            enabled: true
        };
        
        const event3: EventDefinition = {
            actorId: 24792,
            trigger: {
                triggerType: "Nearby",
                args: {
                    condition: {
                        conditionType: "IsOther",
                        args: { actorId: 24828 }
                    },
                    maxDistance: 2
                }
            },
            action: {
                actionType: "Say",
                args: { say: "My hero! You saved me!" }
            },
            repeatable: false,
            enabled: true
        };

        return [new MODscriptEvent(0,event1),new MODscriptEvent(1,event2),new MODscriptEvent(2,event3)];
    }

    public getEvent(eventId: number): MODscriptEvent | undefined {
        return this.events.find(event => event.eventId === eventId);
    }

    public onUpdate(dt: number): void {
        for (let event of this.events) {
            event.checkEvent();
        }
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
}
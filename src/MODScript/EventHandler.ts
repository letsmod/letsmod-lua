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
        this.events = this.createDummyData();
        for(let event of this.events)
            event.setCATs();
    }

    createDummyData(): MODscriptEvent[] {
        const event1: EventDefinition = {
            actorId: 789,
            trigger: {
                triggerType: "Nearby",
                args: {
                    condition: {
                        conditionType: "IsOther",
                        args: { actorId: 456 }
                    },
                    maxDistance: 10
                }
            },
            action: {
                actionType: "JumpUp",
                args: { jumpHeight: 10 }
            },
            repeatable: false,
            enabled: true
        };
        
        const event2: EventDefinition = {
            actorId: 789,
            trigger: {
                triggerType: "CompletedEvent",
                args: { eventId: 0 }
            },
            action: {
                actionType: "NavigateOther",
                args: { actorId: 123 }
            },
            repeatable: false,
            enabled: true
        };
        
        const event3: EventDefinition = {
            actorId: 789,
            trigger: {
                triggerType: "OtherDestroyed",
                args: {
                    condition: {
                        conditionType: "IsOther",
                        args: { actorId: 456 }
                    }
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
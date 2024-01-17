import { UpdateHandler } from "engine/MessageHandlers";
import { MODscriptEvent, EventDefinition } from "./MODscriptCore";

export class EventHandler implements UpdateHandler {

    private static _instance: EventHandler;

    dummyData: string = "";
    events: MODscriptEvent[];
    private constructor() {
        this.dummyData = `[
            {
                "actorId": 789,
                "trigger": {
                    "triggerType": "Nearby",
                    "args": {
                        "condition": {
                            "conditionType": "IsOther",
                            "args": {"actorId": 456}
                        },
                        "maxDistance": 10
                    }
                },
                "action": {
                    "actionType": "JumpUp",
                    "args": {"jumpHeight": 10}
                },
                "repeatable": false,
                "enabled": true
            },
            {
                "actorId": 789,
                "trigger": {
                    "triggerType": "CompletedEvent",
                    "args": {"eventId": 0}
                },
                "action": {
                    "actionType": "NavigateOther",
                    "args": {"actorId": 123}
                },
                "repeatable": false,
                "enabled": true
            },
            {
                "actorId": 789,
                "trigger": {
                    "triggerType": "OtherDestroyed",
                    "args": {
                        "condition": {
                            "conditionType": "IsOther",
                            "args": {"actorId": 456}
                        }
                    }
                },
                "action": {
                    "actionType": "Say",
                    "args": {"say": "My hero! You saved me!"}
                },
                "repeatable": false,
                "enabled": true
            }
        ]`;
        this.events = JSON.parse(this.dummyData).Map((eventDef: EventDefinition) => new MODscriptEvent(eventDef));
    }

    public static get instance(): EventHandler { return this._instance; }

    public static initialize(): void {
        if (!this._instance) {
            this._instance = new EventHandler();
        }
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
        const event = EventHandler.instance.getEvent(eventId);
        if (event) return event.IsFinished;
        return false;
    }

    public EventIsActive(eventId: number): boolean {
        const event = EventHandler._instance.getEvent(eventId);
        if (event) return event.IsActive;
        return false;
    }
}
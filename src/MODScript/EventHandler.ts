import { UpdateHandler } from "engine/MessageHandlers";
import { CATs, EventDefinition } from "./MODscriptDefs";
import { MODscriptEvent } from "./MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";

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
        
        const ladyId = 28604;
        const heroId = 28643;
        const wolfId = 28685;

        //Lady will scream: HELP.
        const event1: EventDefinition = {
            actorId: ladyId,
            trigger: {
                triggerType: CATs.Nearby,
                args: {
                    condition: {
                        conditionType: CATs.IsOther,
                        args: { actorId: heroId }
                    },
                    maxDistance: 3
                }
            },
            action: {
                actionType: CATs.Say,
                args: { say: "HELP! A Wolf!" }
            },
            repeatable: false,
            enabled: true
        };

        //Lady will run to the hero.
        const event2: EventDefinition = {
            actorId: ladyId,
            trigger: {
                triggerType: CATs.Nearby,
                args: {
                    condition: {
                        conditionType: CATs.IsOther,
                        args: { actorId: wolfId }
                    },
                    maxDistance: 3
                }
            },
            action: {
                actionType: CATs.NavigateOther,
                args: { actorId: heroId }
            },
            repeatable: false,
            enabled: true
        };
        
        //Destroying wolf when hero is close by.
        const event3: EventDefinition = {
            actorId: wolfId,
            trigger: {
                triggerType: CATs.Nearby,
                args: {
                    condition: {
                        conditionType: CATs.IsOther,
                        args: { actorId: heroId }
                    },
                    maxDistance: 3
                }
            },
            action: {
                actionType: CATs.DestroyOther,
                args: { actorId:wolfId }
            },
            repeatable: false,
            enabled: true
        };

        //Lady will thank the hero when the wolf is destroyed.
        const event4: EventDefinition = {
            actorId: ladyId,
            trigger: {
                triggerType: CATs.OtherDestroyed,
                args: {
                    condition: {
                        conditionType: CATs.IsOther,
                        args: { actorId: wolfId }
                    },
                }
            },
            action: {
                actionType: CATs.Say,
                args: { say: "My hero! You saved me!" }
            },
            repeatable: false,
            enabled: true
        };

        return [new MODscriptEvent(0,event1),new MODscriptEvent(1,event2),new MODscriptEvent(2,event3),new MODscriptEvent(2,event4)];
    }

    public getEvent(eventId: number): MODscriptEvent | undefined {
        return this.events.find(event => event.EventId === eventId);
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
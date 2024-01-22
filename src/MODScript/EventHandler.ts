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

    }

    //Dummy Data
    lady: BodyHandle | undefined;
    hero: BodyHandle | undefined;
    wolf: BodyHandle | undefined;
    initializedDummyData: boolean = false;

    createDummyData(): MODscriptEvent[] {

        if (this.lady === undefined || this.hero === undefined || this.wolf === undefined) {

            console.log("Lady, Hero or Wolf not found");
            console.log("Lady: " + this.lady);
            console.log("Hero: " + this.hero);
            console.log("Wolf: " + this.wolf);

            return [];
        }
        const event1: EventDefinition = {
            actorId: this.wolf.body.id,
            trigger: {
                triggerType: CATs.Nearby,
                args: {
                    condition: {
                        conditionType: CATs.IsOther,
                        args: { actorId: this.wolf.body.id }
                    },
                    maxDistance: 0
                }
            },
            action: {
                actionType: CATs.NavigateOther,
                args: {actorid: this.lady.body.id}
            },
            repeatable: false,
            enabled: true
        }

        const event2: EventDefinition = {
            actorId: this.lady.body.id,
            trigger: {
                triggerType: CATs.Nearby,
                args: {
                    condition: {
                        conditionType: CATs.IsOther,
                        args: { actorId: this.wolf.body.id }
                    },
                    maxDistance: 2
                }
            },
            action: {
                //Anas: We need simultaneousActions(Say,SimultaneousActions(Jump,Wait))
                actionType: CATs.Say,
                args: { say: "HELP! A Wolf!" }
            },
            repeatable: true,
            enabled: true
        };

        const event3: EventDefinition = {
            actorId: this.hero.body.id,
            trigger: {
                triggerType: CATs.CompletedEvent,
                args: { eventId: 1 }
            },
            action: {
                actionType: CATs.NavigateOther,
                args: {actorid: this.wolf.body.id}
            },
            repeatable: false,
            enabled: true
        };
        

        const event4: EventDefinition = {
            actorId: this.hero.body.id,
            trigger: {
                triggerType: CATs.Nearby,
                args: {
                    condition: {
                        conditionType: CATs.IsOther,
                        args: { actorId: this.wolf.body.id }
                    },
                    maxDistance: 1
                }
            },
            action: {
                actionType: CATs.DestroyOutput,
                args: {}
            },
            repeatable: false,
            enabled: true
        };

        const event5: EventDefinition = {
            actorId: this.lady.body.id,
            trigger: {
                triggerType: CATs.OtherDestroyed,
                args: {
                    condition: {
                        conditionType: CATs.IsOther,
                        args: { actorId: this.wolf.body.id }
                    }
                }
            },
            action: {
                actionType: CATs.Say,
                args: { say: "My hero! You saved me!" }
            },
            repeatable: false,
            enabled: true
        };

        return [new MODscriptEvent(0, event1), new MODscriptEvent(1, event2), new MODscriptEvent(2, event3), new MODscriptEvent(3, event4), new MODscriptEvent(4, event5)];
    }

    public getEvent(eventId: number): MODscriptEvent | undefined {
        return this.events.find(event => event.EventId === eventId);
    }

    public onUpdate(dt: number): void {
        //for dummy data delete later(only for testing puroses)
        this.lady = Helpers.findBodyInScene("Lady");
        this.hero = Helpers.findBodyInScene("Hero");
        this.wolf = Helpers.findBodyInScene("Wolf");
        //Filling in Dummy Data 
        if (!this.wolf&& !this.hero && !this.lady) {
            console.log("Lady, Hero or Wolf not found");
            console.log("Lady: " + this.lady);
            console.log("Hero: " + this.hero);
            console.log("Wolf: " + this.wolf);
            return;
        }
            if (!this.initializedDummyData) {
                this.events = this.createDummyData();
                for (let event of this.events){
                    event.setCATs();
                }
                this.initializedDummyData = true;
            }
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
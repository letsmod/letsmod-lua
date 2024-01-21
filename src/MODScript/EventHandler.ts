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
        
        const lady = Helpers.findBodyInScene("Lady");
        const hero = Helpers.findBodyInScene("Hero");
        const wolf = Helpers.findBodyInScene("Wolf");

        if(lady === undefined || hero === undefined || wolf === undefined){
            
            console.log("Lady, Hero or Wolf not found");
            console.log("Lady: " + lady);
            console.log("Hero: " + hero);
            console.log("Wolf: " + wolf);

            return [];
        } 

        const event1: EventDefinition = {
            actorId: lady.body.id,
            trigger: {
                triggerType: CATs.Nearby,
                args: {
                    condition: {
                        conditionType: CATs.IsOther,
                        args: { actorId: wolf.body.id }
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
        
        const event2: EventDefinition = {
            actorId: hero.body.id,
            trigger: {
                triggerType: CATs.Nearby,
                args: {
                    condition: {
                        conditionType: CATs.IsOther,
                        args: { actorId: wolf.body.id }
                    },
                    maxDistance: 1
                }
            },
            action: {
                actionType: CATs.DestroyOutput,
                args: {  }
            },
            repeatable: false,
            enabled: true
        };

        const event3: EventDefinition = {
            actorId: lady.body.id,
            trigger: {
                triggerType: CATs.OtherDestroyed,
                args: {
                    condition: {
                        conditionType: CATs.IsOther,
                        args: { actorId: wolf.body.id }
                    },
                    maxDistance: 2
                }
            },
            action: {
                actionType: CATs.Say,
                args: { say: "My hero! You saved me!" }
            },
            repeatable: false,
            enabled: true
        };

        return [new MODscriptEvent(0,event1),new MODscriptEvent(1,event2),new MODscriptEvent(2,event3)];
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
}
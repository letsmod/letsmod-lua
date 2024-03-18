import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { UpdateHandler } from "engine/MessageHandlers";
import { PlotletOutcome, PlotletDefinition, Scriptlets, EventDefinition, PlotletArgs } from "./MODscriptDefs";
import { MODscriptEvent } from "./MODscriptEvent";

export class MODscriptPlotlet implements UpdateHandler {
    events: MODscriptEvent[] = [];

    public id = 0;
    public plotletType = "";
    public enabled: boolean = true;
    public scriptlet: string = "";
    private catsInitialized: boolean = false;

    public get IsFinished(): boolean { return false; }
    public get IsActive(): boolean { return false; }

    private outcomes: PlotletOutcome[] = [];
    private args: PlotletArgs = {};


    constructor(plotletDef: PlotletDefinition) {
        this.events = [];
        this.catsInitialized = false;
        this.id = plotletDef.id;
        this.plotletType = plotletDef.type;
        this.enabled = plotletDef.enabled;
        this.outcomes = plotletDef.outcomes;
        this.args = plotletDef.args;
        
        //Hack: This is to allow overriding.
        if(this.plotletType !== Scriptlets.scriptletTest)
            this.scriptlet = this.refreshScriptlet(Scriptlets[this.plotletType]);
    }

    initCATs(): void {
        if (this.catsInitialized) return;
        this.catsInitialized = true;

        let eventDefs = Helpers.convertArray(GameplayScene.instance.clientInterface?.jsonParse<EventDefinition[]>(this.scriptlet))||[];
        
        if (GameplayScene.instance.modscriptManager?.ScriptletOverrideData !== "")
            eventDefs = this.overrideEventDefs();

        this.events = this.generateEventObjects(eventDefs);
        
        for (let event of this.events) {
            event.setCATs();
        }

    }

    refreshScriptlet(scriptlet:string) : string {
        for(let key in this.args) {
            while(scriptlet.includes("<" + key + ">"))
                scriptlet = scriptlet.replace("<" + key + ">", this.args[key].toString());
        }
        
        return scriptlet;
    }

    overrideEventDefs(): EventDefinition[] {
        if(!GameplayScene.instance.modscriptManager) return [];

        console.log("           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! NOT A JOKE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        console.log("WARNING 3 :: JSON data is overridden by the MODscriptOverride Element, Make sure to delete that element from the scene to use the real MODscript.")
        console.log("WARNING 2 :: JSON data is overridden by the MODscriptOverride Element, Make sure to delete that element from the scene to use the real MODscript.")
        console.log("WARNING 1 :: JSON data is overridden by the MODscriptOverride Element, Make sure to delete that element from the scene to use the real MODscript.")
        console.log("                                                              **********")



        GameplayScene.instance.modscriptManager.ScriptletOverrideData = this.refreshScriptlet(GameplayScene.instance.modscriptManager.ScriptletOverrideData);
        const overrideEventDefs = Helpers.convertArray(GameplayScene.instance.clientInterface?.jsonParse<EventDefinition[]>(GameplayScene.instance.modscriptManager.ScriptletOverrideData));
        if (overrideEventDefs === undefined) {
            console.log("JSON parse failed for the event definitions.");
            return [];
        } else return overrideEventDefs;
    }

    generateEventObjects(eventDefs: EventDefinition[]): MODscriptEvent[] {
        const events: MODscriptEvent[] = [];
        for (let i = 0; i < eventDefs.length; i++) {
            events.push(new MODscriptEvent(eventDefs[i], this));
        }
        return events;
    }

    public onUpdate(dt: number): void {
        this.initCATs();

        if (!this.enabled) return;

        for (let event of this.events)
            event.checkEvent();
    }

    public getEvent(eventId: number): MODscriptEvent | undefined {
        return this.events.find((event) => event.EventId === eventId);
    }

    public GetActiveEvents(): MODscriptEvent[] {
        return this.events.filter((event) => event.IsActive);
    }

    public GetCompletedEvents(): MODscriptEvent[] {
        return this.events.filter((event) => event.IsFinished);
    }

    hasEvent(eventId: number) {
        return this.getEvent(eventId) !== undefined;
    }

    enableEvent(eventId: number) {
        const event = this.getEvent(eventId);
        if (event) event.enableEvent();
    }

    disableEvent(eventId: number) {
        const event = this.getEvent(eventId);
        if (event) event.disableEvent();
    }

    enablePlotlet() {
        this.enabled = true;
    }

    disablePlotlet() {
        this.enabled = false;
    }
}
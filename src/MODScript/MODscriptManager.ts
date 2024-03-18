import { CollisionInfoFactory, UpdateHandler } from "engine/MessageHandlers";
import { AudioDefinition } from "./MODscriptDefs";
import { MODscriptEvent } from "./MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { SayAction } from "./Actions/SayAction";
import { PlotletGraph } from "./PlotletGraph";
import { MODscriptAudioManager } from "MODScript/MODscriptAudioManager";
import { MODscriptPlotlet } from "./MODscriptPlotlet";

export class MODscriptManager implements UpdateHandler {

    plotletGraph: PlotletGraph | undefined;
    audioManager: MODscriptAudioManager | undefined;

    private collisionEventBodyMap: { event: MODscriptEvent; bodyId: number }[] = [];
    private taggedBodiesList: BodyHandle[] = [];
    public ScriptletOverrideData: string = "";
    public graphJsonOverride: string = "";

    static _instance: MODscriptManager;
    static get instance() {
        if (this._instance == undefined) {
            this._instance = new MODscriptManager();
        }
        return this._instance;
    }

    public get TaggedBodiesList(): BodyHandle[] {
        return this.taggedBodiesList;
    }

    constructor() {
        
    }

    initialize(): void {
        this.plotletGraph = new PlotletGraph();
        this.audioManager = new MODscriptAudioManager();
        this.collisionEventBodyMap = [];
        this.taggedBodiesList = [];
    }

    public onUpdate(dt: number): void {
        this.plotletGraph?.onUpdate(dt);
    }

    //#region collision management
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
    //#endregion

    //#region Audio encapsulation
    playAudioAction(sayAction: SayAction): boolean {
        return this.audioManager?.playAudioAction(sayAction) || false;
    }

    isAudioPlaying(actionId: string): boolean {
        return this.audioManager?.isAudioPlaying(actionId) || false;
    }

    registerAudioAction(audioObject: AudioDefinition): void {
        this.audioManager?.registerAudioAction(audioObject);
    }
    //#endregion

    //#region events encapsulation

    public GetActiveEvents(plotletId: number): MODscriptEvent[] {
        return this.plotletGraph?.getPlotlet(plotletId)?.GetActiveEvents() || [];
    }

    public GetCompletedEvents(plotletId: number): MODscriptEvent[] {
        return this.plotletGraph?.getPlotlet(plotletId)?.GetCompletedEvents() || [];
    }
    //#endregion

    //#region plotlet encapsulation
    public GetActivePlotlets(): MODscriptPlotlet[] {
        return this.plotletGraph?.plotlets.filter((plotlet) => plotlet.IsActive) || [];
    }

    public GetCompletedPlotlets(): MODscriptPlotlet[] {
        return this.plotletGraph?.plotlets.filter((plotlet) => plotlet.IsFinished) || [];
    }

    public PlotletIsCompleted(plotletId: number): boolean {
        const plotlet = this.plotletGraph?.getPlotlet(plotletId);
        return plotlet !== undefined && plotlet.IsFinished;
    }

    public PlotletIsActive(plotletId: number): boolean {
        const plotlet = this.plotletGraph?.getPlotlet(plotletId);
        return plotlet !== undefined && plotlet.IsActive;
    }

    public EnablePlotlet(plotletId: number): void {
        const plotlet = this.plotletGraph?.getPlotlet(plotletId);
        if (plotlet !== undefined) plotlet.enablePlotlet();
    }

    public DisablePlotlet(plotletId: number): void {
        const plotlet = this.plotletGraph?.getPlotlet(plotletId);
        if (plotlet !== undefined) plotlet.disablePlotlet();
    }

    public HasPlotlet(eventId: number): boolean {
        return this.plotletGraph?.getPlotlet(eventId) !== undefined;
    }
    //#endregion

}

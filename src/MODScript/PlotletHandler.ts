import { UpdateHandler } from "engine/MessageHandlers";
import { AudioDefinition, PlotletDefinition } from "./MODscriptDefs";
import { MODscriptEvent } from "./MODscriptEvent";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { JSONparser } from "./JSONparser";
import { MODscriptPlotlet } from "./MODscriptPlotlet";

export class PlotletHandler implements UpdateHandler {
    overridePlotletGraph: string = "";
    plotlets: MODscriptPlotlet[] = [];

    audioList: AudioDefinition[] = [];
    audioPlayerBusy: boolean = false;
    audioDelayedFunction: any;

    private plotletsInitialized: boolean = false;
    static _instance: PlotletHandler;


    public static get instance(): PlotletHandler {
        if (!PlotletHandler._instance) PlotletHandler._instance = new PlotletHandler();
        return PlotletHandler._instance;
    }

    initialize(): void {
        this.plotlets = [];
        this.plotletsInitialized = false;
    }

    initCATs(): void {
        if (this.plotletsInitialized) return;
        this.plotletsInitialized = true;

        //In case jsonData is not empty, it means that the MODscriptOverride Element is present in the scene which will parse the JSON inside the element instead of the real MODscript.
        if (this.overridePlotletGraph != "") {
            console.log("           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! NOT A JOKE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            console.log("WARNING 3 :: JSON data is overridden by the MODscriptOverride Element, Make sure to delete that element from the scene to use the real MODscript.")
            console.log("WARNING 2 :: JSON data is overridden by the MODscriptOverride Element, Make sure to delete that element from the scene to use the real MODscript.")
            console.log("WARNING 1 :: JSON data is overridden by the MODscriptOverride Element, Make sure to delete that element from the scene to use the real MODscript.")
            console.log("                                                              **********")
        } else /* Parse plotlets from the input.*/;

    }

    /**************** These are for CATs Team to be able to debug MODscript issues ****************/
    parseDummyJson(): MODscriptPlotlet[] {

        const plotletDefs =  GameplayScene.instance.clientInterface?.jsonParse<PlotletDefinition[]>(this.overridePlotletGraph);
        if (plotletDefs === undefined) {
            console.log("JSON parse failed for the plotlet graph.");
            return [];
        }
        
        let plotlets: MODscriptPlotlet[] = [];
        for (let i = 0; i < plotletDefs.length; i++) {
            plotlets.push(new MODscriptPlotlet(i, plotletDefs[i]));
            //this.printEventDefinition(eventDefs[i]);
        }
        return plotlets;
    }

    public getPlotlet(plotletId: number): MODscriptPlotlet | undefined {
        return this.plotlets.find((plotlet) => plotlet.id === plotletId);
    }

    public onUpdate(dt: number): void {
        //Update each eventHandler, and use this in the GameplayScene.update instead of the eventHandler.
    }

    public GetActivePlotlets(): MODscriptPlotlet[] {
        return this.plotlets.filter((plotlet) => plotlet.IsActive);
    }

    public GetCompletedPlotlets(): MODscriptPlotlet[] {
        return this.plotlets.filter((event) => event.IsFinished);
    }

    public PlotletIsCompleted(plotletId: number): boolean {
        const plotlet = this.getPlotlet(plotletId);
        return plotlet !== undefined && plotlet.IsFinished;
    }

    public PlotletIsActive(plotletId: number): boolean {
        const plotlet = this.getPlotlet(plotletId);
        return plotlet !== undefined && plotlet.IsActive;
    }

    public EnablePlotlet(plotletId: number): void {
        const plotlet = this.getPlotlet(plotletId);
        if (plotlet !== undefined) plotlet.enablePlotlet();
    }

    public DisablePlotlet(plotletId: number): void {
        const plotlet = this.getPlotlet(plotletId);
        if (plotlet !== undefined) plotlet.disablePlotlet();
    }

    public HasPlotlet(eventId: number): boolean {
        return this.getPlotlet(eventId) !== undefined;
    }
}

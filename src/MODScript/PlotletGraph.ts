import { UpdateHandler } from "engine/MessageHandlers";
import { PlotletDefinition } from "./MODscriptDefs";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";

import { MODscriptPlotlet } from "./MODscriptPlotlet";

export class PlotletGraph implements UpdateHandler {
    public static overridePlotletGraph: string = "";
    plotlets: MODscriptPlotlet[] = [];

    private plotletsInitialized: boolean = false;

    constructor() {
        this.plotlets = [];
        this.plotletsInitialized = false;
        PlotletGraph.overridePlotletGraph = '';
        
    }

    initPlotlets(): void {
        if (this.plotletsInitialized) return;
        this.plotletsInitialized = true;
        let plotletDefs: PlotletDefinition[] = GameplayScene.instance.plotletDefs;
        if (PlotletGraph.overridePlotletGraph !== "")
            plotletDefs = this.overridePlotletDefs();

        this.plotlets = this.generatePlotlets(plotletDefs);
    }

    overridePlotletDefs(): PlotletDefinition[] {
        console.log("           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! NOT A JOKE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        console.log("WARNING 3 :: JSON data is overridden by the PlotletOverride Element, Make sure to delete that element from the scene to use the real Plotlet Graph.")
        console.log("WARNING 2 :: JSON data is overridden by the PlotletOverride Element, Make sure to delete that element from the scene to use the real Plotlet Graph.")
        console.log("WARNING 1 :: JSON data is overridden by the PlotletOverride Element, Make sure to delete that element from the scene to use the real Plotlet Graph.")
        console.log("                                                              **********")

        const overridePlotletDefs = Helpers.convertArray(GameplayScene.instance.clientInterface?.jsonParse<PlotletDefinition[]>(PlotletGraph.overridePlotletGraph));
        
        if (overridePlotletDefs === undefined) {
            console.log("JSON parse failed for the plotlet graph.");
            return [];
        } else return overridePlotletDefs;
    }

    generatePlotlets(plotletDefs: PlotletDefinition[]): MODscriptPlotlet[] {
        const plotlets: MODscriptPlotlet[] = [];
        for (let i = 0; i < plotletDefs.length; i++) {
            const plotlet = new MODscriptPlotlet(plotletDefs[i]);
            if (plotlet !== undefined) {
                plotlets.push(plotlet);
            }

        }
        return plotlets;
    }

    public getPlotlet(plotletId: number): MODscriptPlotlet | undefined {
        return this.plotlets.find((plotlet) => plotlet.id === plotletId);
    }

    public onUpdate(dt: number): void {
        this.initPlotlets();
        for (let plotlet of this.plotlets) {
            plotlet.onUpdate(dt);
        }
    }
}

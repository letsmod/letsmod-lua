import { MODscriptPlotlet } from "MODScript/MODscriptPlotlet";
import { PlotletGraph } from "MODScript/PlotletGraph";
import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";

export class MODscriptOverride extends LMent {
    scriptlet: string;
    graph: string;

    onInit(): void {
        MODscriptPlotlet.scriptletOverrideData = this.scriptlet.split("'").join('"');
        PlotletGraph.overridePlotletGraph = this.graph.split("'").join('"');
    }

    onStart(): void {

    }

    constructor(body: BodyHandle, id: number, params: Partial<MODscriptOverride> = {}) {
        super(body, id, params);
        this.scriptlet = params.scriptlet === undefined?"":params.scriptlet;
        this.graph = params.graph === undefined?"":params.graph;
    }

}

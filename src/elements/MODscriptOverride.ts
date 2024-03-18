import { MODscriptPlotlet } from "MODScript/MODscriptPlotlet";
import { PlotletGraph } from "MODScript/PlotletGraph";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";

export class MODscriptOverride extends LMent {
    scriptlet: string;
    graph: string;

    onInit(): void {
        
        if(GameplayScene.instance.modscriptManager === undefined) return;
        GameplayScene.instance.modscriptManager.ScriptletOverrideData = this.scriptlet.split("'").join('"');
        GameplayScene.instance.modscriptManager.PlotletOverrideData = this.graph.split("'").join('"');

        console.log("Scriptlet Override: " + GameplayScene.instance.modscriptManager.ScriptletOverrideData);
        console.log("Plotlet Override: " + GameplayScene.instance.modscriptManager.PlotletOverrideData);

    }

    onStart(): void {
        
    }

    constructor(body: BodyHandle, id: number, params: Partial<MODscriptOverride> = {}) {
        super(body, id, params);
        this.scriptlet = params.scriptlet === undefined?"":params.scriptlet;
        this.graph = params.graph === undefined?"":params.graph;
    }

}

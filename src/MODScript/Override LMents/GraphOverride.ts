import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";

export class GraphOverride extends LMent {
    graph: string;
    
    onInit(): void {

    }

    onStart(): void {
        if (GameplayScene.instance.modscriptManager === undefined) return;
        
        GameplayScene.instance.modscriptManager.graphJsonOverride = this.graph.split("'").join('"');
    }

    constructor(body: BodyHandle, id: number, params: Partial<GraphOverride> = {}) {
        super(body, id, params);
        this.graph = params.graph === undefined ? "" : params.graph;
    }

}

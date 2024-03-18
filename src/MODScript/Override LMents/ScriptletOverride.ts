import { PlotletTypes, Scriptlets } from "MODScript/MODscriptDefs";
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";

export class ScriptletOverride extends LMent {
    scriptlet: string;
    plotletType: string;
    forceOverride: boolean = false;
    
    onInit(): void {
        if (GameplayScene.instance.modscriptManager === undefined) return;
        
        GameplayScene.instance.modscriptManager.graphJsonOverride = '[{"id":0,"type":"' + this.plotletType + '","enabled":true,"args":{},"outcomes":[]}]';
        
        if (this.forceOverride || !Scriptlets.hasOwnProperty(this.plotletType))
            Scriptlets[this.plotletType] = this.scriptlet.split("'").join('"');
        else console.log("ScriptletOverride Error: " + this.plotletType + " already exists in the Scriptlets. Unable to override.");

        console.log(Scriptlets[this.plotletType]);
        console.log("----------------------")
        console.log(Scriptlets[PlotletTypes.talkToNPC]);
    }

    onStart(): void {

    }

    constructor(body: BodyHandle, id: number, params: Partial<ScriptletOverride> = {}) {
        super(body, id, params);
        this.scriptlet = params.scriptlet === undefined ? "" : params.scriptlet;
        this.plotletType = params.plotletType === undefined ? "scriptletOverride" : params.plotletType;
        this.forceOverride = params.forceOverride === undefined ? false : params.forceOverride;
    }

}

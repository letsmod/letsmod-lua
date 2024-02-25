import { EventHandler } from "MODScript/EventHandler";
import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";

export class MODscriptOverride extends LMent {
    json: string

    onInit(): void {
        EventHandler.instance.jsonData = this.json;
        //console.log("JSON data: "+this.json)
    }

    onStart(): void {
    }

    constructor(body: BodyHandle, id: number, params: Partial<MODscriptOverride> = {}) {
        super(body, id, params);
        this.json = params.json === undefined?"":params.json;
    }

}

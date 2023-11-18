import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";

export class Tag extends LMent 
{
    tag:string
    
    onInit(): void {
        
    }
    onStart(): void {
    }

    constructor(body: BodyHandle, id: number, params: Partial<Tag> = {})
    {
        super(body, id, params);
        this.tag = params.tag === undefined?Helpers.NA:params.tag;
        Helpers.ValidateParams(this.tag,this,"tag");
    }

}
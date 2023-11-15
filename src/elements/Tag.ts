import { BodyHandle } from "engine/BodyHandle";
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
        if(params.tag === undefined)
            {
                this.tag = "N/A";
                console.error("TAG LMent must have \"tag\" param assigned.");
            }
        else this.tag = params.tag;
    }

}

/************* This is for commit-PR testing stuff etc etc etc ***********/
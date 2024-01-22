import { BodyHandle } from "engine/BodyHandle";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";

export class IdPrinter extends LMent {

    onInit(): void {
    }
    onStart(): void {
        console.log("My Name: " + this.body.body.name + ", My Id: " + this.body.body.id);
    }

    constructor(body: BodyHandle, id: number, params: Partial<IdPrinter> = {}) {
        super(body, id, params);
    }
}

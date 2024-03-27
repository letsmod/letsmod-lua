import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";

export class RandomShapeShow extends LMent {

    constructor(body: BodyHandle, id: number, params: Partial<RandomShapeShow> = {}) {
        super(body, id, params);
    }

    onInit(): void {
    }
    
    onStart(): void {
        const shapes = this.convertArray(this.body.body.getShapes());
        if(!shapes) return;
        console.log(shapes.length);
        const randomIndex = Math.floor(Math.random() * shapes.length);
        for (let i = 0; i < shapes.length; i++) {
            if (i === randomIndex) {
            shapes[i].setVisible(true);
            } else {
            shapes[i].setVisible(false);
            }
        }
    }
}
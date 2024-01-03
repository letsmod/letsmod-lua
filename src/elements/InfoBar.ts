import { BodyHandle, ShapePointer } from "engine/BodyHandle";
import { LMent } from "engine/LMent";

export class InfoBar extends LMent {
    private bodyShapes: ShapePointer[];
    private hiddenIndex: number = 0;

    constructor(body: BodyHandle, id: number, params: Partial<InfoBar> = {}) {
        super(body, id, params);
        this.bodyShapes = [];
    }

    onInit(): void {
        this.bodyShapes = this.convertArray(this.body.body.getShapes()) || [];
        this.hiddenIndex = this.bodyShapes.length - 1;

        this.bodyShapes.sort((a, b) => {
            let numberA = parseInt(a.name.slice(-2));
            let numberB = parseInt(b.name.slice(-2));
            return numberA - numberB;
        });
    
    }

    onStart(): void {
    }

    DecreaseBar(): void {
        if (this.hiddenIndex >= 0) {
            this.bodyShapes[this.hiddenIndex].setVisible(false);
            this.hiddenIndex -= 1;
        } else {
            console.log("No more bars to hide");
        }
    }

    ResetBar(): void {
        for (let i = 0; i < this.bodyShapes.length; i++) {
            this.bodyShapes[i].setVisible(true);
        }
        this.hiddenIndex = this.bodyShapes.length - 1;
    }
}
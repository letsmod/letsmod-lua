import { BodyHandle, ShapePointer } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";
import { ShapeStateController } from "./ShapeStateController";

export class ShapeStateAnimator extends LMent implements UpdateHandler {
    /*** THIS LMENT REQUIRES A ShapeStateController ELEMENT TO BE ATTACHED TO THE SAME BODY ***/

    // PARAMS
    stateName: string;
    frameRate: number;
    priority: number;
    loop: boolean;
    animFrames: { shapeName: string, frameSpan: number }[];
    controller: string;
    get FinishedPlaying() { return this.finishedPlaying; };
    private finishedPlaying = false;;
    //Element Local Variables
    private shapePointers: ShapePointer[] = [];
    private shapeSpans: number[] = [];
    private activeFrameIndex: number = 0;
    private fpsCounter: number = 0;
    private frameSpanCounter: number = 0;
    constructor(body: BodyHandle, id: number, params: Partial<ShapeStateAnimator> = {}) {
        super(body, id, params);
        this.stateName = params.stateName === undefined ? "default" : params.stateName;
        this.animFrames = this.convertArray(params.animFrames) || [];
        this.frameRate = params.frameRate === undefined ? 30 : params.frameRate;
        this.priority = params.priority === undefined ? 1.1 : params.priority;
        this.priority = Math.round(this.priority);
        this.loop = params.loop === undefined ? true : params.loop;
        this.controller = params.controller === undefined ? "default" : params.controller;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
    }

    onStart(): void {
        this.fillFrames();

        let controllerLments = this.body.getAllElements(ShapeStateController);
        let cFound = false;
        for (let c of controllerLments)
            if (c.name === this.controller) {
                cFound = true;
                c.addState(this);
            }

        if (!cFound)
            console.error("No ShapeStateController of the name \"" + this.controller + "\" is found on body.");
    }


    fillFrames() {
        let allShapes = this.body.body.getShapes();

        this.animFrames.forEach(fr => {
            if (fr !== undefined)
                allShapes.find(shape => {
                    if (shape !== undefined)
                        if (shape.name == fr.shapeName) {
                            this.shapePointers.push(shape);
                            this.shapeSpans.push(fr.frameSpan);
                        }
                });
        });

        this.hideAllFrames();
        this.enabled = false;
    }

    hideAllFrames() {
        if (this.NoShapesFound())
            return;
        this.shapePointers.forEach(shape => {
            shape.setVisible(false);
        })
    }

    showShapeByName(frameName: string) {
        let shape = this.shapePointers.find(frame => { frame.name === frameName })
        if (shape !== undefined)
            shape.setVisible(true);
    }


    onUpdate(): void {
        this.fpsCounter--;
        if (this.fpsCounter <= 0) {
            this.fpsCounter = GameplayScene.instance.memory.frameRate / this.frameRate;
            this.swapFrames();
        }
    }

    swapFrames(): void {
        if (this.NoShapesFound())
            return;
        let onLastFrame = this.activeFrameIndex == this.shapePointers.length - 1;

        let activeFrameSpan = this.shapeSpans[this.activeFrameIndex];
        this.frameSpanCounter++;

        if (this.frameSpanCounter >= activeFrameSpan) {
            if (!this.loop && onLastFrame) {
                this.finishedPlaying = true;
            }
            else {
                this.shapePointers[this.activeFrameIndex].setVisible(false);
                this.activeFrameIndex = onLastFrame ? 0 : this.activeFrameIndex + 1;
                this.shapePointers[this.activeFrameIndex].setVisible(true);
                this.frameSpanCounter = 0;
            }
        }
    }

    startState() {
        if (this.NoShapesFound())
            return;
        this.shapePointers[0].setVisible(true);
        this.fpsCounter = 0;
        this.frameSpanCounter = 0;
        this.activeFrameIndex = 0;
        this.finishedPlaying = false;
        this.enabled = true;
    }

    stopState() {
        this.hideAllFrames();
        this.enabled = false;
    }

    NoShapesFound(): boolean {
        if (this.shapePointers.length === 0) {
            console.log("No shapes to play for state: " + this.stateName);
            return true;
        }
        return false;
    }
}
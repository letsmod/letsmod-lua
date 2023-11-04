import { BodyHandle, ShapePointer } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";
import { ShapeStateController } from "./ShapeStateController";

export class ShapeStateAnimator extends LMent implements UpdateHandler
{

    // PARAMS
    stateName:string;
    frameRate:number;
    animFrames:[{shapeName:string,frameSpan:number}];

    //Element Local Variables
    private shapePointers: ShapePointer [] = [];
    private shapeSpans:number[] = [];
    private activeFrameIndex:number=0;
    private fpsCounter:number = 0;
    private frameSpanCounter:number=0;
    constructor(body: BodyHandle, id: number, params: Partial<ShapeStateAnimator> = {})
    {
        super(body, id,params);
        this.stateName = params.stateName === undefined?"default":params.stateName;
        this.animFrames = params.animFrames === undefined?[{shapeName:this.body.body.getShapes()[0].name,frameSpan:1}]:params.animFrames;
        this.frameRate = params.frameRate === undefined?30:params.frameRate;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        let controller = this.body.getElement(ShapeStateController);
        if(controller === undefined)
            console.error("No ShapeStateController LMent is found on body.");
        else controller.addState(this);
    }

    onStart(): void {
        this.fillFrames();
    }


    fillFrames(){
        let allShapes = this.body.body.getShapes();
        this.animFrames.forEach(fr => {
            if(fr !== undefined)
                allShapes.find(shape => {
                    if(shape !== undefined)
                        if(shape.name == fr.shapeName)
                        {
                            this.shapePointers.push(shape);
                            this.shapeSpans.push(fr.frameSpan);
                        }
            });
        });  
        
        this.hideAllFrames();
        this.enabled = false;

        //TODO: This is not needed because all shapes should be included in their own animator LMents.
        //allShapes.forEach(item =>{item.setVisible(false);});
    }

    hideAllFrames()
    {
        this.shapePointers.forEach(shape => {
            shape.setVisible(false);
        })
    }

    showShapeByName(frameName:string)
    {
        let shape = this.shapePointers.find(frame =>{frame.name === frameName})
        if(shape !== undefined)
            shape.setVisible(true);
    }


    onUpdate(): void {
        this.fpsCounter --;
        if(this.fpsCounter <= 0)
        {
            this.fpsCounter = GameplayScene.instance.memory.frameRate/this.frameRate;
            this.swapFrames();
        }
    }

    swapFrames():void
    {
        let activeFrameSpan = this.shapeSpans[this.activeFrameIndex];
        this.frameSpanCounter++;
        if(activeFrameSpan >this.frameSpanCounter)
        {
            this.frameSpanCounter++;
        }else
        {
            this.shapePointers[this.activeFrameIndex].setVisible(false);
            this.activeFrameIndex++;
            if(this.activeFrameIndex>=this.shapePointers.length)
                this.activeFrameIndex = 0;
            this.shapePointers[this.activeFrameIndex].setVisible(true);
        }
    }
    startState()
    {
        this.shapePointers[0].setVisible(true);
        this.fpsCounter = 0;
        this.frameSpanCounter=0;
        this.activeFrameIndex=0;
        this.enabled = true;
    }

    stopState()
    {
        this.hideAllFrames();
        this.enabled = false;
    }
}
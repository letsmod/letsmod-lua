import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { DragGestureHandler, UpdateHandler } from "engine/MessageHandlers";
import { Quaternion, Vector3 } from "three";

export class DragTurner extends LMent implements UpdateHandler, DragGestureHandler
{
    turnSpeed:number;

    constructor(body: BodyHandle, id: number, params: Partial<DragTurner> = {})
    {
        super(body, id,params);
        this.turnSpeed = params.turnSpeed === undefined?1:params.turnSpeed;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update",this);
        GameplayScene.instance.dispatcher.addListener("drag",this);
    }

    onStart(): void {
    }
    
    onUpdate(): void {
        
    }
    
    onDrag(dx: number, dy: number): void {
        
        this.turn(-dx*this.turnSpeed);
    }

    turn(value:number)
    {
        this.body.body.applyRotation(Helpers.NewQuatFromEuler(0,value,0));

    }
}
import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";
import { global, js_new } from "js";
import { Quaternion, Vector3 } from "three";

export class GuideBody extends LMent implements UpdateHandler
{

    // PARAMS
    guideName:string; /* HACK: There's no way to access the chip's name, so I'm using this temporarily until an update is applied */
    
    target:string; /* The target body _this_ needs to follow */
    private targetBody:BodyHandle|undefined = undefined;
    
    offset:{x:number,y:number,z:number}; /* The position offset from target */
    private offsetVector; /* To generate a Vector3 from the previous param*/
    
    rotationOffsetAxis:{x:number,y:number,z:number}; /* The axis where quaternion offset will be applied */
    private rotationOffsetAxisVector; /* To generate a Vector3 from the previous param*/
    rotationOffsetAngle:number; /* The angle of rotation offset */
    private rotationOffsetQuaternion; /* To contain the quaternion value of the given axis angle */

    offsetSpace: string; /*To set whether offset is in local or global space*/

    followSpeed:number; /* The maximum follow speed */
    rotationSpeed:number; /*The maximum follow-orientation speed */

    mode:string; /*To tell whether to leade the target or follow the target*/

    constructor(body: BodyHandle, id: number, params: Partial<GuideBody> = {})
    {
        super(body, id,params);
        this.target = params.target === undefined?"N/A":params.target;
        this.guideName = params.guideName === undefined?"N/A":params.guideName;
        this.mode = params.mode === undefined?"follow":params.mode;
        this.offset = params.offset === undefined?{x:0,y:0,z:0}:params.offset;
        this.offsetVector = js_new(global.THREE.Vector3,this.offset.x,this.offset.y,this.offset.z);

        this.rotationOffsetAxis = params.rotationOffsetAxis === undefined?{x:1,y:0,z:0}:params.rotationOffsetAxis;
        this.rotationOffsetAxisVector = js_new(global.THREE.Vector3,this.rotationOffsetAxis.x,this.rotationOffsetAxis.y,this.rotationOffsetAxis.z);
        this.rotationOffsetAngle = params.rotationOffsetAngle === undefined?0:params.rotationOffsetAngle;
        this.rotationOffsetQuaternion = js_new(global.THREE.Quaternion).setFromAxisAngle(this.rotationOffsetAxisVector,this.rotationOffsetAngle*Math.PI/180);

        this.offsetSpace = params.offsetSpace === undefined?"local":params.offsetSpace;

        this.followSpeed = params.followSpeed===undefined?1:params.followSpeed;
        this.rotationSpeed = params.rotationSpeed===undefined?1:params.rotationSpeed;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
    }

    initTargetBody(){
        GameplayScene.instance.dispatcher.queueDelayedFunction(this,()=>{
        this.targetBody = undefined;
        if(this.target.toLowerCase() === "player")
            this.targetBody = GameplayScene.instance.memory.player;
        else if(this.target.toLowerCase() === "maincamera")
            this.targetBody = GameplayScene.instance.memory.mainCamera;
        else {
            for(let i of this.body.bodyGroup)
            if(i.body.name === this.target)
                this.targetBody = i;
        }},Helpers.deltaTime);
    }

    onStart(): void {
        this.initTargetBody();
    }
    
    updateOffsetVector(x:number,y:number,z:number,additive:boolean|false)
    {
        if(additive)
            this.offsetVector.set(this.offset.x+x,this.offset.y+y,this.offset.z+z);
        else this.offsetVector.set(x,y,z);
    }

    updateTargetPosition()
    {
        if(this.targetBody === undefined)
            return;

        let offset = this.offsetVector.clone();
        
        let leader = this.targetBody;
        let follower = this.body;
        if(this.mode.toLowerCase() == "lead")
        {
            leader = this.body;
            follower = this.targetBody;
        }

        if(this.offsetSpace.toLowerCase() === "local")
            offset.copy(this.offsetVector.clone().applyQuaternion(leader.body.getRotation()));
        let targetVector = leader.body.getPosition().clone().add(offset);
        follower.body.setPosition(follower.body.getPosition().clone().lerp(targetVector,this.followSpeed*Helpers.deltaTime));
    }

    updateTargetOrientation()
    {
        if(this.targetBody === undefined)
            return;

        let leader = this.targetBody;
        let follower = this.body;
        if(this.mode.toLowerCase() == "lead")
        {
            leader = this.body;
            follower = this.targetBody;
        }

        let offset = this.rotationOffsetQuaternion;
        
        let targetOrientation = leader.body.getRotation().clone().multiply(offset).normalize();
        if(this.rotationSpeed===0) //meaning that rotation is not guided
        {
            targetOrientation = offset;
            follower.body.setRotation(targetOrientation);
        }else follower.body.setRotation(follower.body.getRotation().clone().slerp(targetOrientation,this.rotationSpeed*Helpers.deltaTime));
    }
 
    onUpdate(): void {
        this.updateTargetPosition();
        this.updateTargetOrientation();
    }

}
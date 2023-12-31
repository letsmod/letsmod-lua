import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { Constants, Helpers } from "engine/Helpers";
import { LMent } from "engine/LMent";
import { UpdateHandler } from "engine/MessageHandlers";

export class GuideBody extends LMent implements UpdateHandler {

    // PARAMS
    guideName: string; /* HACK: There's no way to access the chip's name, so I'm using this temporarily until an update is applied */

    target: string; /* The target body _this_ needs to follow */
    private targetBody: BodyHandle | undefined = undefined;

    targetContext: "group" | "global"; /* To tell whether to look for the target in the entire scene or just the body group */

    offset: { x: number, y: number, z: number }; /* The position offset from target */
    private offsetVector; /* To generate a Vector3 from the previous param*/

    rotationOffset: { x: number, y: number, z: number };
    private rotationOffsetQuaternion; /* To contain the quaternion value of the given axis angle */

    offsetSpace: "local" | "world"; /*To set whether offset is in local or global space*/

    followSpeed: number; /* The maximum follow speed */
    rotationSpeed: number; /*The maximum follow-orientation speed */
    rotate: boolean; /*Default to TRUE, which allows it to update rotation to match target every frame*/
    move: boolean; /*Defaults to TRUE, which allows it to update position to match target every frame*/
    mode: string; /*To tell whether to leade the target or follow the target*/
    makeInvisible: boolean; /*To make the body invisible*/

    private leader: BodyHandle | undefined;
    private follower: BodyHandle | undefined;

    constructor(body: BodyHandle, id: number, params: Partial<GuideBody> = {})
    {
        super(body, id,params);
        this.target = params.target === undefined?Helpers.NA:params.target;
        this.guideName = params.guideName === undefined?Helpers.NA:params.guideName;
        this.mode = params.mode === undefined?"follow":params.mode;
        this.offset = params.offset === undefined?{x:0,y:0,z:0}:params.offset;
        this.offsetVector = Helpers.NewVector3(this.offset.x,this.offset.y,this.offset.z);
        this.move = params.move === undefined?true:params.move;

        this.rotationOffset = params.rotationOffset === undefined ? { x: 0, y: 0, z: 0 } : params.rotationOffset;
        this.rotationOffsetQuaternion = Helpers.NewQuatFromEuler(Helpers.Rad(this.rotationOffset.x), Helpers.Rad(this.rotationOffset.y), Helpers.Rad(this.rotationOffset.z));
        this.rotate = params.rotate === undefined ? true : params.rotate;

        this.offsetSpace = params.offsetSpace === undefined ? "local" : params.offsetSpace;

        this.followSpeed = params.followSpeed === undefined ? GameplayScene.instance.memory.frameRate : params.followSpeed;
        this.rotationSpeed = params.rotationSpeed === undefined ? 1 : params.rotationSpeed;

        this.makeInvisible = params.makeInvisible === undefined ? false : params.makeInvisible;

        this.targetContext = params.targetContext === undefined ? "group" : params.targetContext;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        if (this.makeInvisible)
        {
            this.body.body.setVisible(false);
        }
    }

    initTargetBody(){
        GameplayScene.instance.dispatcher.queueDelayedFunction(this,()=>{
        this.targetBody = undefined;
        if(this.target.toLowerCase() === Constants.Player)
            this.targetBody = GameplayScene.instance.memory.player;
        else if(this.target === Constants.MainCamera)
            this.targetBody = GameplayScene.instance.memory.mainCamera;
        else {
            if(this.targetContext.toLowerCase() === "global")
                this.targetBody = Helpers.findBodyInScene(this.target);
            else if(this.targetContext.toLowerCase() === "group")
                this.targetBody = Helpers.findBodyWithinGroup(this.body,this.target);
            else console.log("Invalid target context: "+this.targetContext);
        }},Helpers.deltaTime);
    }

    getTargetBody()
    {
        return this.targetBody;
    }

    onStart(): void {
        this.initTargetBody();
        this.initLeadership();
        if (!this.rotate && this.follower !== undefined)
            this.follower.body.setRotation(this.rotationOffsetQuaternion);
    }

    initLeadership() {
        GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
            this.leader = this.targetBody;
            this.follower = this.body;
            if (this.mode.toLowerCase() === "lead") {
                this.leader = this.body;
                this.follower = this.targetBody;
            }
        }, 2 * Helpers.deltaTime)
    }

    updateOffsetVector(x: number, y: number, z: number, additive: boolean = true) {
        if (additive) ///---> Adding to the original offset OR set a completely new offset.
            this.offsetVector.set(this.offset.x + x, this.offset.y + y, this.offset.z + z);
        else this.offsetVector.set(x, y, z);
    }

    updateTargetPosition() {
        if (this.targetBody === undefined || this.leader === undefined || this.follower === undefined)
            return;

        let offset = this.offsetVector.clone();

        if (this.offsetSpace.toLowerCase() === "local")
            offset.copy(this.offsetVector.clone().applyQuaternion(this.leader.body.getRotation()));
        let targetVector = this.leader.body.getPosition().clone().add(offset);
        this.follower.body.setPosition(this.follower.body.getPosition().clone().lerp(targetVector, this.followSpeed * Helpers.deltaTime));
    }

    updateTargetOrientation() {
        if (this.targetBody === undefined || this.leader === undefined || this.follower === undefined)
            return;

        if (this.rotationSpeed == 0)
            this.follower.body.setRotation(this.rotationOffsetQuaternion);
        let targetOrientation = this.leader.body.getRotation().clone().multiply(this.rotationOffsetQuaternion).normalize();
        this.follower.body.setRotation(this.follower.body.getRotation().clone().slerp(targetOrientation, this.rotationSpeed * Helpers.deltaTime));
    }

    onUpdate(): void {
        if (this.move)
            this.updateTargetPosition();

        if (this.rotate)
            this.updateTargetOrientation();
    }
}

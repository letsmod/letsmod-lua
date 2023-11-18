import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { ButtonHandler, CollisionInfo, DragGestureHandler } from "engine/MessageHandlers";
import { AvatarBase } from "./AvatarBase";
import { Helpers } from "engine/Helpers";
import { DragTurner } from "./DragTurner";

export class BallControls extends AvatarBase implements DragGestureHandler {
    maxSpeed: number;
    acceleration:number;
    deceleration: number;
    turningSpeed: number;

    private dragDx = 0;
    private dragDy = 0;
    private isOnGround = false;

    private ballGuide: BodyHandle | undefined = undefined;
    private ballDragTurner: DragTurner | undefined = undefined;
    constructor(body: BodyHandle, id: number, params: Partial<BallControls> = {}) {
        super(body, id, params);
        this.maxSpeed = params.maxSpeed === undefined ? 5 : params.maxSpeed;
        this.deceleration = this.acc_dec_init("deceleration",params.deceleration);
        this.acceleration = this.acc_dec_init("acceleration",params.acceleration);
        this.turningSpeed = params.turningSpeed===undefined?1:params.turningSpeed;
    }

    acc_dec_init(name:string,param:number|undefined):number
    {
        if(param === undefined)
            return 1;
        if(param <0)
        {
            console.log(name+" should be between 0 and 1, it will automatically set to 0.");
            return 0;
        }
        if(param > 1)
        {
            console.log(name+" should be between 0 and 1, it will automatically set to 1.");
            return 1;
        }
        return param;
    }

    override onInit(): void {
        super.onInit();      
        GameplayScene.instance.dispatcher.addListener("drag", this);
    }

    initBallGuide() {
        this.ballGuide = GameplayScene.instance.clonePrefab("RollerCamGuide_Lua");
        if (this.ballGuide === undefined)
        {
            console.error("No ball guide found in prefabs.");
            return;
        }
        
        this.ballDragTurner =  this.ballGuide.getElement(DragTurner);
        if (this.ballDragTurner === undefined)
        {
            console.error("Ball Guide has no 'DragTurner' element with guideName = Player.");
            return;
        }


    }

    override onCollision(info: CollisionInfo): void {
        super.onCollision(info);

        if (info.getDeltaVSelf().normalize().dot(Helpers.upVector) > 0.3)
            this.isOnGround = true;
    }

    override onStart(): void {
        super.onStart();
        this.initBallGuide();
    }

    override onUpdate(): void {
        super.onUpdate();

        this.onGroundReset();

        this.Roll();
    }

    onGroundReset() {
        GameplayScene.instance.dispatcher.queueDelayedFunction(this, () => {
            this.isOnGround = false;
        }, Helpers.deltaTime);
    }

    Roll() {

        if (this.dragDy != 0) {
            this.accelerate();
        }else this.deccelerate();

        this.dragDx = 0;
        this.dragDy = 0;
    }

    deccelerate()
    {
        if (this.ballGuide === undefined) return;
        if(Math.abs((this.body.body.getVelocity().clone().multiply(Helpers.upVector)).length()) > 1) return;
        let angularVelo = this.body.body.getAngularVelocity();
        angularVelo.lerp(Helpers.zeroVector,this.deceleration);
        this.body.body.setAngularVelocity(angularVelo);
        
        this.body.body.applyTorque((Helpers.forwardVector.applyQuaternion(this.ballGuide.body.getRotation())).multiplyScalar(angularVelo.length()*this.dragDx));
    }

    accelerate()
    {
        if (this.ballGuide === undefined) return;
        let dragDistance = Math.sqrt(Math.pow(this.dragDx,2)+Math.pow(this.dragDy,2));

        let torqueFwd = Helpers.rightVector.applyQuaternion(this.ballGuide.body.getRotation()).multiplyScalar(-Math.sign(this.dragDy)*dragDistance);
        //let dxModified = this.dragDy<0?this.dragDx:-this.dragDx;
        
        if(this.dragDy>0)
            this.ballDragTurner?.invert();
        else this.ballDragTurner?.uninvert();

        let torqueTurn = Helpers.forwardVector.applyQuaternion(this.ballGuide.body.getRotation()).multiplyScalar(this.dragDx*this.turningSpeed);
        
        let angularVelo = this.body.body.getAngularVelocity();
        let targetVelo = (torqueFwd.add(torqueTurn)).normalize().multiplyScalar(this.maxSpeed);
        angularVelo.lerp(targetVelo,this.acceleration);
        
        this.body.body.setAngularVelocity(angularVelo);
    }

    onDrag(dx: number, dy: number): void {
        this.dragDx = dx;
        this.dragDy = dy;
    }
}

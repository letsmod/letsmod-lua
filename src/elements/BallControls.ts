import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { ButtonHandler, CollisionInfo, DragGestureHandler } from "engine/MessageHandlers";
import { AvatarBase } from "./AvatarBase";
import { Helpers } from "engine/Helpers";
import { DragTurner } from "./DragTurner";
import { CameraTarget } from "./CameraTarget";

export class BallControls extends AvatarBase {
    maxSpeed: number;
    acceleration:number;
    deceleration: number;
    turningSpeed: number;

    private ballGuide: BodyHandle | undefined = undefined;
    private ballDragTurner: DragTurner | undefined = undefined;
    constructor(body: BodyHandle, id: number, params: Partial<BallControls> = {}) {
        super(body, id, params);
        this.maxSpeed = params.maxSpeed === undefined ? 5 : params.maxSpeed;
        this.deceleration = params.deceleration === undefined?5:params.deceleration;
        this.acceleration = params.acceleration === undefined?5:params.acceleration;
        this.turningSpeed = params.turningSpeed===undefined?1:params.turningSpeed;
    }

    initBallGuide() {
        this.ballGuide = GameplayScene.instance.clonePrefab("RollerCamGuide_Lua");
        if (this.ballGuide === undefined)
        {
            console.error("No ball guide found in prefabs.");
            return;
        }
        this.ballGuide.body.setPosition(this.body.body.getPosition());
        this.ballGuide.body.setRotation(this.body.body.getRotation());
        this.camTarget = this.ballGuide.getElement(CameraTarget);

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

    override onUpdate(dt: number): void {
        super.onUpdate(dt);

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
    
        // Adjusted sensitivity factors for mobile devices
        const mobileSensitivityFactor = 0.5;
        let dragDxAdjusted = this.dragDx * mobileSensitivityFactor;
        let dragDyAdjusted = this.dragDy * mobileSensitivityFactor;
    
        let dragDistance = Math.sqrt(Math.pow(dragDxAdjusted, 2) + Math.pow(dragDyAdjusted, 2));
    
        let torqueFwd = Helpers.rightVector.applyQuaternion(this.ballGuide.body.getRotation()).multiplyScalar(-dragDyAdjusted * dragDistance);
        let torqueTurn = Helpers.forwardVector.applyQuaternion(this.ballGuide.body.getRotation()).multiplyScalar(dragDxAdjusted*Math.abs(dragDyAdjusted));

        console.log("DX, DY: "+dragDxAdjusted+", "+dragDyAdjusted);
    
        let angularVelo = this.body.body.getAngularVelocity();
        let targetVelo = (torqueFwd.add(torqueTurn)).normalize().multiplyScalar(this.maxSpeed);
    
        let accelerationFactor = 5 * (1 / GameplayScene.instance.memory.frameRate);
        angularVelo.lerp(targetVelo, accelerationFactor);
    
        if (angularVelo.length() > 100) {
            angularVelo.normalize().multiplyScalar(100);
        }
    
        this.body.body.setAngularVelocity(angularVelo);
    }

    override UnequipAvatar(): void {
        if(this.ballGuide)
            GameplayScene.instance.destroyBody(this.ballGuide);
        super.UnequipAvatar();
    }
}

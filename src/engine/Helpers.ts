import { global, js_new } from "js";
import { Quaternion, Vector3 } from "three";
import { GameplayScene } from "./GameplayScene";
import { LMent } from "./LMent";
import { BodyHandle } from "./BodyHandle";

export type InterpolationType = "easein" | "easeout" | "ease" | "linear" | "elastic" | "overshoot" | "bounce" | "easesqrt" | "easeinsqrt" | "easeoutsqrt";
export type MotionPattern = "loop" | "ping-pong" | "once";

export class Helpers{

    static get zeroVector() {return js_new(global.THREE.Vector3,0,0,0);}
    static get oneVector() {return js_new(global.THREE.Vector3,1,1,1);}
    static get upVector() {return js_new(global.THREE.Vector3,0,1,0);}
    static get downVector() {return js_new(global.THREE.Vector3,0,-1,0);}
    static get rightVector() {return js_new(global.THREE.Vector3,1,0,0);}
    static get leftVector() {return js_new(global.THREE.Vector3,-1,0,0);}
    static get forwardVector(){return js_new(global.THREE.Vector3,0,0,1);}
    static get backwardVector(){return js_new(global.THREE.Vector3,0,0,-1);}
    static get xzVector() {return js_new(global.THREE.Vector3,1,0,1);}
    static get xyVector() {return js_new(global.THREE.Vector3,1,1,0);}
    static get yzVector() {return js_new(global.THREE.Vector3,0,1,1);}
    static readonly NA = "N/A";

    //static get deltaTime() {return 1/GameplayScene.instance.memory.frameRate;}

    static NumLerp(a:number,b:number,t:number):number
    {
        return a + (b - a) * t;
    }

    static NewVector3(x:number,y:number,z:number)
    {
        return js_new(global.THREE.Vector3,x,y,z);
    }

    static ParamToVec3(param:{x:number,y:number,z:number})
    {
        return js_new(global.THREE.Vector3,param.x,param.y,param.z);
    }

    static NewQuaternion()
    {
        return js_new(global.THREE.Quaternion);
    }

    static NewQuatFromEuler(x:number,y:number,z:number)
    {
        return js_new(global.THREE.Quaternion).setFromEuler(js_new(global.THREE.Euler,x,y,z));
    }

    static Rad(degreeAngle:number):number
    {
        return degreeAngle*Math.PI/180;
    }

    static Deg(radianAngle:number):number
    {
        return this.RoundToDecimal(radianAngle*180/Math.PI,2);
    }

    static RoundToDecimal(num:number,decimal:number)
    {
        return parseFloat(num.toFixed(decimal));
    }

    static GetYaw(q:Quaternion)
    {
        let siny_cosp = 2 * (q.w * q.y + q.z * q.x)
        let cosy_cosp = 1 - 2 * (q.x * q.x + q.y * q.y)
        return Math.atan2(siny_cosp, cosy_cosp);

    }

    static GetRoll(q:Quaternion)
    {

        const sinr_cosp = 2 * (q.w * q.z + q.x * q.y);
        const cosr_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
        const roll = Math.atan2(sinr_cosp, cosr_cosp);
        return roll;
    }

    static GetPitch(q:Quaternion)
    {
        let sinp = 2 * (q.w * q.x - q.z * q.y);
        let pitch: number;
        if (Math.abs(sinp) >= 1) {
            pitch = Math.PI / 2 * Math.sign(sinp); // use 90 degrees if out of range
        } else {
            pitch = Math.asin(sinp);
        }
        return pitch;
    }

    static ValidateParams(paramVal:any|undefined,element:LMent,param:string=""):boolean
    {
        param = param == ""?"":" \""+param+"\"";
        if(paramVal !== undefined && paramVal !== Helpers.NA) return true;
        console.log(element.constructor.name+" requires a param"+param+" to be included in the params list.");
        return false;
    }

    static LogVector(v:Vector3)
    {
        console.log("x: "+v.x+", y:"+v.y+", z:"+v.z);
    }

    static findBodyWithinGroup(sibling: BodyHandle,name: string): BodyHandle | undefined {
        let body = sibling.bodyGroup.find(b => b.body.name == name);
        if (body === undefined) {
            console.log("No body named: " + name + " was found in the body group of "+sibling.body.name+".")
            return undefined;
        }
        return body;
    }

    static validateInterpolateType(fx: InterpolationType): boolean {
        const typesArray = ["easein", "easeout", "ease", "linear", "elastic", "overshoot", "bounce", "easesqrt", "easeinsqrt", "easeoutsqrt"];
        return typesArray.includes(fx);
    }

    static validateMotionPattern(pattern: MotionPattern): boolean {
        const typesArray = ["loop", "ping-pong", "once"];
        return typesArray.includes(pattern);
    }

    public static getInterpolatedProgress(progress: number, fx: InterpolationType): number {

        switch (fx) {
            case "easein":
                return 1 - Math.cos((progress * Math.PI) / 2);
            case "easeout":
                return Math.sin((progress * Math.PI) / 2);
            case "ease":
                return -(Math.cos(Math.PI * progress) - 1) / 2;
            case "easeinsqrt":
                return 1 - Math.sqrt(1 - Math.pow(progress, 2));
            case "easeoutsqrt":
                return Math.sqrt(1 - Math.pow(progress, 2));
            case "easesqrt":
                if (progress < 0.5)
                    return (1 - Math.sqrt(1 - Math.pow(2 * progress, 2))) / 2;
                return (Math.sqrt(1 - Math.pow(-2 * progress + 2, 2)) + 1) / 2;
            case "linear":
                return progress;
            case "bounce":
                return this.bounceInterpolate(progress);
            case "elastic":
                return this.elasticInterpolate(progress);
            case "overshoot":
                return this.overshootInterpolate(progress);
        }
    }

    private static elasticInterpolate(t: number): number {
        const sinePeriod = (2 * Math.PI) / 3;

        if (t === 0 || t === 1) return t;

        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * sinePeriod) + 1;
    }

    private static bounceInterpolate(t: number): number {
        const strength = 7.5625;
        const phase = 2.75;

        if (t < 1 / phase)
            return strength * t * t;
        else if (t < 2 / phase)
            return strength * (t -= 1.5 / phase) * t + 0.75;
        else if (t < 2.5 / phase)
            return strength * (t -= 2.25 / phase) * t + 0.9375;
        else return strength * (t -= 2.625 / phase) * t + 0.984375;
    }

    private static overshootInterpolate(t: number): number {
        const intensity = 1.70158;
        const overshootfactor = intensity * 1.525;

        if (t < 0.5)
            return (Math.pow(2 * t, 2) * ((overshootfactor + 1) * 2 * t - overshootfactor)) / 2;
        return (Math.pow(2 * t - 2, 2) * ((overshootfactor + 1) * (t * 2 - 2) + overshootfactor) + 2) / 2;
    }
    
}


export const Constants = {
    /*** Engine Constants ***/
    AButton: "AButton",
    BButton: "BButton",

    /*** Common Constants ****/
    Player: "player",
    MainCamera: "MainCamera_Lua",
    RollerballGuide: "RollerCamGuide_Lua",
    DifficultyHard: "hardcore",
    Male: "male",
    Female: "female",
    FemaleAvatarSuffix: " Girl",
    
    /*** Avatar Prefabs ***/
    WingSuitAvatar: "Wingsuit",
    SlingshotAvatar: "Slingshot",
    RollerballAvatar: "Rollerball",
    BaseAvatar: "Player",

    /*** Equipment ***/
    BaseEquip: "base",
    RollerBallEquip: "rollerball",
    SlingshotEquip: "slingshot",
    WingSuitEquip: "wingsuit",

    /*** Audio Constants ***/
    DeathAudio: "Death",

    
  };
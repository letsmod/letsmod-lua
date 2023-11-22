import { global, js_new } from "js";
import { Quaternion, Vector3 } from "three";
import { GameplayScene } from "./GameplayScene";
import { LMent } from "./LMent";
import { BodyHandle } from "./BodyHandle";

export class Helpers{

    static get zeroVector() {return js_new(global.THREE.Vector3,0,0,0);}
    static get oneVector() {return js_new(global.THREE.Vector3,1,1,1);}
    static get upVector() {return js_new(global.THREE.Vector3,0,1,0);}
    static get rightVector() {return js_new(global.THREE.Vector3,1,0,0);}
    static get forwardVector(){return js_new(global.THREE.Vector3,0,0,1);}
    static get xzVector() {return js_new(global.THREE.Vector3,1,0,1);}
    static get xyVector() {return js_new(global.THREE.Vector3,1,1,0);}
    static get yzVector() {return js_new(global.THREE.Vector3,0,1,1);}
    static get NA(){return "N/A";}

    static get deltaTime() {return 1/GameplayScene.instance.memory.frameRate;}

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

        //return Math.atan2(2 * (q.w * q.y + q.x * q.z), q.x * q.x + q.w * q.w - q.y * q.y - q.z * q.z);
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

    //This is not recommended to be used continuously ...
    static findBodyByName(name: string): BodyHandle | undefined {
        let body = GameplayScene.instance.bodies.find(b => b.body.name == name);
        if (body === undefined) {
            console.log("No body named: " + name + "was found.")
            return undefined;
        }
        return body;
    }
    
}
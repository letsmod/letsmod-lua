import { global, js_new } from "js";
import { Quaternion, Vector3 } from "three";
import { GameplayScene } from "./GameplayScene";

export class Helpers{

    static get zeroVector() {return js_new(global.THREE.Vector3,0,0,0);}
    static get oneVector() {return js_new(global.THREE.Vector3,1,1,1);}
    static get upVector() {return js_new(global.THREE.Vector3,0,1,0);}
    static get rightVector() {return js_new(global.THREE.Vector3,1,0,0);}
    static get forwardVector(){return js_new(global.THREE.Vector3,0,0,1);}
    static get xzVector() {return js_new(global.THREE.Vector3,1,0,1);}
    static get xyVector() {return js_new(global.THREE.Vector3,1,1,0);}
    static get yzVector() {return js_new(global.THREE.Vector3,0,1,1);}


    static get deltaTime() {return 1/GameplayScene.instance.memory.frameRate;}

    static NumLerp(a:number,b:number,t:number):number
    {
        return a + (b - a) * t;
    }

    static NewVector3(x:number,y:number,z:number)
    {
        return js_new(global.THREE.Vector3,x,y,z);
    }

    static NewQuaternion()
    {
        return js_new(global.THREE.Quaternion);
    }

    static NewQuatFromEuler(x:number,y:number,z:number)
    {
        return js_new(global.THREE.Quaternion).setFromEuler(js_new(global.THREE.Euler,this.Rad(x),this.Rad(y),this.Rad(z)));
    }

    static Rad(degreeAngle:number):number
    {
        return degreeAngle*Math.PI/180;
    }

    static Deg(radianAngle:number):number
    {
        return radianAngle*180/Math.PI;
    }

    static GetYaw(q:Quaternion)
    {
        return Math.atan2(2 * (q.w * q.y + q.x * q.z), q.x * q.x + q.w * q.w - q.y * q.y - q.z * q.z);
    }
}
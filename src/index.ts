import { js_new, global } from "js";
import { BodyHandle } from "engine/bodyHandle";

console.log("Hello World");

let q = js_new(global.THREE.Quaternion);
q.set(1, 2, 3, 4);
q.normalize();

console.log(q.x, q.y, q.z, q.w);

let c = js_new(global.THREE.Color, 0x00ff00);
console.log(c.r, c.g, c.b);

let bh = new BodyHandle(<any>null, <any>null);

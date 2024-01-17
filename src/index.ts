import { EventHandler } from "MODScript/EventHandler";
import { GameplayScene } from "engine/GameplayScene";

export * as Elements from "elements/_ElementTypes";

export { BodyHandle } from "engine/BodyHandle";

export const scene = GameplayScene.instance;

export const eventHandler = EventHandler.instance;

// export const testArray = [1, 2, 3];

// console.log(scene);

// console.log(scene.bodies);

// console.log(scene.bodies.length);

console.log("loaded lua engine");


// import { js_new, global } from "js";
// console.log("Hello World");

// let q = js_new(global.THREE.Quaternion);
// q.set(1, 2, 3, 4);
// q.normalize();

// console.log(q.x, q.y, q.z, q.w);

// let c = js_new(global.THREE.Color, 0x00ff00);
// console.log(c.r, c.g, c.b);

// let bh = new BodyHandle(<any>undefined, <any>undefined);

import * as THREE from "three";
// import * as ElementTypes from "elements/ElementTypes";

/** @noSelf */
export declare function js_new<T> (constructor: T, ...args : any[]) : T;

export declare const global : {
  THREE: {
    Quaternion: THREE.Quaternion,
    Vector3: THREE.Vector3,
    Vector2: THREE.Vector2
    Matrix3: THREE.Matrix3,
    Matrix4: THREE.Matrix4,
    Color: THREE.Color,
    Object3D: THREE.Object3D
  }
};
import * as THREE from "three";

/** @noSelf */
declare function js_new<T> (constructor: T, ...args : any[]) : T;

declare var global : {
  THREE: {
    Quaternion: THREE.Quaternion,
    Vector3: THREE.Vector3,
    Matrix3: THREE.Matrix3,
    Matrix4: THREE.Matrix4,
    Color: THREE.Color,
    Object3D: THREE.Object3D
  }
};
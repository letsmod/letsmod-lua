global type Vector3
global type Matrix4

local _quaternion = {}

global record Quaternion
    x: number
    y: number
    z: number
    w: number

    set:function(self: Quaternion, x: number, y: number, z: number, w: number): Quaternion
    clone:function(self: Quaternion): Quaternion
    copy:function(self: Quaternion, q: Quaternion): Quaternion
    --setFromEuler:function(euler: Euler, update?: boolean): Quaternion
    setFromAxisAngle:function(self: Quaternion, axis: Vector3, angle: number): Quaternion
    setFromRotationMatrix:function(m: Matrix4): Quaternion
    setFromUnitVectors:function(self: Quaternion, vFrom: Vector3, vTo: Vector3): Quaternion
    angleTo:function(self: Quaternion, q: Quaternion): number
    rotateTowards:function(self: Quaternion, q: Quaternion, step: number): Quaternion

    identity:function(self: Quaternion): Quaternion

    invert:function(self: Quaternion): Quaternion

    conjugate:function(self: Quaternion): Quaternion
    dot:function(self: Quaternion, v: Quaternion): number
    lengthSq:function(self: Quaternion): number
    length:function(self: Quaternion): number
    normalize:function(self: Quaternion): Quaternion

    multiply:function(self: Quaternion, q: Quaternion): Quaternion
    premultiply:function(self: Quaternion, q: Quaternion): Quaternion
    multiplyQuaternions:function(self: Quaternion, a: Quaternion, b: Quaternion): Quaternion

    slerp:function(self: Quaternion, qb: Quaternion, t: number): Quaternion
    slerpQuaternions:function(self: Quaternion, qa: Quaternion, qb: Quaternion, t: number): Quaternion

    equals:function(self: Quaternion, v: Quaternion): boolean

    random:function(self: Quaternion): Quaternion
end

function Quaternion.new() : Quaternion
    local self : Quaternion = js.new(js.global.THREE.Quaternion)
    return self
end
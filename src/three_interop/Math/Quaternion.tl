global type Vector3

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
    --setFromRotationMatrix:function(m: Matrix4): Quaternion
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
    -- multiplyQuaternions:function(a: Quaternion, b: Quaternion): Quaternion -- static; no self

    slerp:function(self: Quaternion, qb: Quaternion, t: number): Quaternion
    -- slerpQuaternions:function(qa: Quaternion, qb: Quaternion, t: number): Quaternion -- static; no self

    equals:function(self: Quaternion, v: Quaternion): boolean

    --fromArray:function(array: number[], offset?: number): Quaternion
    --toArray:function(array?: number[], offset?: number): number[]

    random:function(self: Quaternion): Quaternion

    -- new: function(x: number, y: number, z: number, w: number) : Quaternion
end

function Quaternion.new(x: number, y: number, z: number, w: number) : Quaternion
    local self : Quaternion = js.new(js.global.THREE.Quaternion, x, y, z, w)
    return self
end

--[[
export class Quaternion {
    /**
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     * @param w w coordinate
     */
    constructor(x?: number, y?: number, z?: number, w?: number);

    _onChange(callback: () => void): Quaternion;
    _onChangeCallback: () => void;

    static slerpFlat(
        dst: number[],
        dstOffset: number,
        src0: number[],
        srcOffset: number,
        src1: number[],
        stcOffset1: number,
        t: number,
    ): void;

    static multiplyQuaternionsFlat(
        dst: number[],
        dstOffset: number,
        src0: number[],
        srcOffset: number,
        src1: number[],
        stcOffset1: number,
    ): number[];
}

]]--
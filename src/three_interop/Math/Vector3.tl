global type Quaternion
global type Matrix3
global type Matrix4
global type Color

local _vector3 = {}

global record Vector3
  x: number
  y: number
  z: number

  set: function(self: Vector3, x: number, y: number, z: number): Vector3
  setScalar: function(self: Vector3, scalar: number): Vector3
  setX: function(self: Vector3, x: number): Vector3
  setY: function(self: Vector3, y: number): Vector3
  setZ: function(self: Vector3, z: number): Vector3
  setFromColor: function(self: Vector3, color: Color): Vector3

  clone: function(self: Vector3): Vector3
  copy: function(self: Vector3, v: Vector3): Vector3

  add: function(self: Vector3, v: Vector3): Vector3
  addScalar: function(self: Vector3, s: number): Vector3
  --addScaledVector: function(self: Vector3, v: Vector3, s: number): Vector3
  addVectors: function(self: Vector3, a: Vector3, b: Vector3): Vector3

  sub: function(self: Vector3, a: Vector3): Vector3
  subScalar: function(self: Vector3, s: number): Vector3
  subVectors: function(self: Vector3, a: Vector3, b: Vector3): Vector3

  multiply: function(self: Vector3, v: Vector3): Vector3
  multiplyScalar: function(self: Vector3, s: number): Vector3
  multiplyVectors: function(self: Vector3, a: Vector3, b: Vector3): Vector3

  -- applyEuler: function(self: Vector3, euler: Euler): Vector3
  applyAxisAngle: function(self: Vector3, axis: Vector3, angle: number): Vector3
  applyMatrix3: function(self: Vector3, m: Matrix3): Vector3
  applyNormalMatrix: function(self: Vector3, m: Matrix3): Vector3
  applyMatrix4: function(self: Vector3, m: Matrix4): Vector3
  applyQuaternion: function(self: Vector3, q: Quaternion): Vector3
  -- project: function(self: Vector3, camera: Camera): Vector3
  -- unproject: function(self: Vector3, camera: Camera): Vector3
  transformDirection: function(self: Vector3, m: Matrix4): Vector3

  divide: function(self: Vector3, v: Vector3): Vector3
  divideScalar: function(self: Vector3, s: number): Vector3
  
  min: function(self: Vector3, v: Vector3): Vector3
  max: function(self: Vector3, v: Vector3): Vector3
  clamp: function(self: Vector3, min: Vector3, max: Vector3): Vector3
  clampScalar: function(self: Vector3, min: number, max: number): Vector3
  clampLength: function(self: Vector3, min: number, max: number): Vector3
  floor: function(self: Vector3): Vector3
  ceil: function(self: Vector3): Vector3
  round: function(self: Vector3): Vector3
  roundToZero: function(self: Vector3): Vector3
  
  negate: function(self: Vector3): Vector3
  lengthSq: function(self: Vector3): number
  length: function(self: Vector3): number
  manhattanLength: function(self: Vector3): number
  manhattanDistanceTo: function(self: Vector3, v: Vector3): number
  normalize: function(self: Vector3): Vector3
  setLength: function(self: Vector3, length: number): Vector3

  lerp: function(self: Vector3, v: Vector3, alpha: number): Vector3
  lerpVectors: function(self: Vector3, v1: Vector3, v2: Vector3, alpha: number): Vector3

  dot: function(self: Vector3, v: Vector3): number
  cross: function(self: Vector3, v: Vector3): Vector3
  crossVectors: function(self: Vector3, a: Vector3, b: Vector3): Vector3
  projectOnVector: function(self: Vector3, v: Vector3): Vector3
  projectOnPlane: function(self: Vector3, planeNormal: Vector3): Vector3
  reflect: function(self: Vector3, vector: Vector3): Vector3

  angleTo: function(self: Vector3, v: Vector3): number
  distanceTo: function(self: Vector3, v: Vector3): number
  distanceToSquared: function(self: Vector3, v: Vector3): number
  distanceToManhattan: function(self: Vector3, v: Vector3): number

  -- setFromSpherical: function(self: Vector3, s: Spherical): Vector3
  -- setFromSphericalCoords: function(self: Vector3, r: number, phi: number, theta: number): Vector3
  -- setFromCylindrical: function(self: Vector3, s: Cylindrical): Vector3
  -- setFromCylindricalCoords: function(self: Vector3, radius: number, theta: number, y: number): Vector3

  setFromMatrixPosition: function(self: Vector3, m: Matrix4): Vector3
  setFromMatrixScale: function(self: Vector3, m: Matrix4): Vector3
  setFromMatrixColumn: function(self: Vector3, m: Matrix4, index: number): Vector3
  setFromMatrix3Column: function(self: Vector3, m: Matrix3, index: number): Vector3
  --setFromEuler: function(self: Vector3, euler: Euler): Vector3

  equals: function(self: Vector3, v: Vector3): boolean

  random: function(self: Vector3): Vector3
  randomDirection: function(self: Vector3): Vector3
end

function Vector3.new() : Vector3
    local self : Vector3 = js.new(js.global.THREE.Vector3)
    return self
end
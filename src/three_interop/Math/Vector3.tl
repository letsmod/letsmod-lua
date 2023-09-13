global type Quaternion

local _vector3 = {}

global record Vector3
  x: number
  y: number
  z: number

  set: function(x: number, y: number, z: number): Vector3
  setScalar: function(scalar: number): Vector3
  setX: function(x: number): Vector3
  setY: function(y: number): Vector3
  setZ: function(z: number): Vector3
  -- setComponent: function(index: number, value: number): Vector3
  -- setFromColor: function(color: Color): Vector3
  -- getComponent: function(index: number): number

  clone: function(): Vector3
  copy: function(v: Vector3): Vector3

  add: function(v: Vector3): Vector3
  addScalar: function(s: number): Vector3
  --addScaledVector: function(v: Vector3, s: number): Vector3
  addVectors: function(a: Vector3, b: Vector3): Vector3

  sub: function(a: Vector3): Vector3
  subScalar: function(s: number): Vector3
  subVectors: function(a: Vector3, b: Vector3): Vector3

  multiply: function(v: Vector3): Vector3
  multiplyScalar: function(s: number): Vector3
  multiplyVectors: function(a: Vector3, b: Vector3): Vector3

  -- applyEuler: function(euler: Euler): Vector3
  -- applyAxisAngle: function(axis: Vector3, angle: number): Vector3
  -- applyMatrix3: function(m: Matrix3): Vector3
  -- applyNormalMatrix: function(m: Matrix3): Vector3
  -- applyMatrix4: function(m: Matrix4): Vector3
  applyQuaternion: function(q: Quaternion): Vector3
  -- project: function(camera: Camera): Vector3
  -- unproject: function(camera: Camera): Vector3
  -- transformDirection: function(m: Matrix4): Vector3

  divide: function(v: Vector3): Vector3
  divideScalar: function(s: number): Vector3
  
  min: function(v: Vector3): Vector3
  max: function(v: Vector3): Vector3
  clamp: function(min: Vector3, max: Vector3): Vector3
  clampScalar: function(min: number, max: number): Vector3
  clampLength: function(min: number, max: number): Vector3
  floor: function(): Vector3
  ceil: function(): Vector3
  round: function(): Vector3
  roundToZero: function(): Vector3
  
  negate: function(): Vector3
  lengthSq: function(): number
  length: function(): number
  manhattanLength: function(): number
  manhattanDistanceTo: function(v: Vector3): number
  normalize: function(): Vector3
  setLength: function(length: number): Vector3

  lerp: function(v: Vector3, alpha: number): Vector3
  lerpVectors: function(v1: Vector3, v2: Vector3, alpha: number): Vector3

  dot: function(v: Vector3): number
  cross: function(v: Vector3): Vector3
  crossVectors: function(a: Vector3, b: Vector3): Vector3
  projectOnVector: function(v: Vector3): Vector3
  projectOnPlane: function(planeNormal: Vector3): Vector3
  reflect: function(vector: Vector3): Vector3

  angleTo: function(v: Vector3): number
  distanceTo: function(v: Vector3): number
  distanceToSquared: function(v: Vector3): number
  distanceToManhattan: function(v: Vector3): number

  --setFromSpherical: function(s: Spherical): Vector3
  -- setFromSphericalCoords: function(r: number, phi: number, theta: number): Vector3
  --setFromCylindrical: function(s: Cylindrical): Vector3
  -- setFromCylindricalCoords: function(radius: number, theta: number, y: number): Vector3

  --setFromMatrixPosition: function(m: Matrix4): Vector3
  --setFromMatrixScale: function(m: Matrix4): Vector3
  --setFromMatrixColumn: function(m: Matrix4, index: number): Vector3
  --setFromMatrix3Column: function(m: Matrix3, index: number): Vector3
  --setFromEuler: function(euler: Euler): Vector3

  equals: function(v: Vector3): boolean

  --fromArray: function(array: number[], offset: number): Vector3
  --toArray: function(array: number[], offset: number): number[]
  --fromBufferAttribute: function(attribute: BufferAttribute, index: number): Vector3

  random: function(): Vector3
  randomDirection: function(): Vector3
end

function Vector3.new(x: number, y: number, z: number) : Vector3
    local self : Vector3 = js.new(js.global.THREE.Vector3, x, y, z)
    return self
end
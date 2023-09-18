global type Vector3
global type Quaternion
global type Matrix3

local _matrix4 = {}

global record Matrix4
  elements: {number}

  set: function(self: Matrix4, n11: number, n12: number, n13: number, n14: number,
                               n21: number, n22: number, n23: number, n24: number,
                               n31: number, n32: number, n33: number, n34: number,
                               n41: number, n42: number, n43: number, n44: number)

  identity: function(self: Matrix4) : Matrix4
  clone: function(self: Matrix4) : Matrix4
  copy: function(self: Matrix4, m: Matrix4) : Matrix4
  copyPosition: function(self: Matrix4, m: Matrix4) : Matrix4
  extractBasis: function(self: Matrix4, xAxis: Vector3, yAxis: Vector3, zAxis: Vector3) : Matrix4
  makeBasis: function(self: Matrix4, xAxis: Vector3, yAxis: Vector3, zAxis: Vector3) : Matrix4

  extractRotation: function(self: Matrix4, m: Matrix4) : Matrix4
  -- makeRotationFromEuler: function(self: Matrix4, euler: Euler) : Matrix4
  makeRotationFromQuaternion: function(self: Matrix4, q: Quaternion) : Matrix4
  lookAt: function(self: Matrix4, eye: Vector3, target: Vector3, up: Vector3) : Matrix4

  multiply: function(self: Matrix4, m: Matrix4) : Matrix4
  premultiply: function(self: Matrix4, m: Matrix4) : Matrix4
  multiplyMatrices: function(self: Matrix4, a: Matrix4, b: Matrix4) : Matrix4

  multiplyScalar: function(self: Matrix4, s: number) : Matrix4
  determinant: function(self: Matrix4) : number
  transpose: function(self: Matrix4) : Matrix4

  setPosition: function(self: Matrix4, v: Vector3) : Matrix4
  invert: function(self: Matrix4) : Matrix4
  scale: function(self: Matrix4, v: Vector3) : Matrix4

  getMaxScaleOnAxis: function(self: Matrix4) : number

  makeTranslation: function(self: Matrix4, v: Vector3) : Matrix4

  makeRotationX: function(self: Matrix4, theta: number) : Matrix4
  makeRotationY: function(self: Matrix4, theta: number) : Matrix4
  makeRotationZ: function(self: Matrix4, theta: number) : Matrix4

  makeRotationAxis: function(self: Matrix4, axis: Vector3, angle: number) : Matrix4
  makeScale: function(self: Matrix4, x: number, y: number, z: number) : Matrix4
  makeShear: function(self: Matrix4, xy: number, xz: number, yx: number, yz: number, zx: number, zy: number) : Matrix4

  compose: function(self: Matrix4, translation: Vector3, rotation: Quaternion, scale: Vector3) : Matrix4
  decompose: function(self: Matrix4, translation: Vector3, rotation: Quaternion, scale: Vector3) : Matrix4

  makePerspective: function(self: Matrix4, left: number, right: number, top: number, bottom: number, near: number, far: number) : Matrix4
  makeOrthographic: function(self: Matrix4, left: number, right: number, top: number, bottom: number, near: number, far: number) : Matrix4

  equals: function(self: Matrix4, m: Matrix4) : boolean

  setFromMatrix3: function(self: Matrix4, m: Matrix3) : Matrix4
end

function Matrix4.new() : Matrix4
  local self : Matrix4 = js.new(js.global.THREE.Matrix4)
  return self
end

global type Vector3
global type Quaternion
global type Matrix4

local _matrix3 = {}

global record Matrix3
  elements: {number}

  set: function(self: Matrix3, n11: number, n12: number, n13: number, n21: number, n22: number, n23: number, n31: number, n32: number, n33: number): Matrix3
  identity: function(self: Matrix3): Matrix3
  clone: function(self: Matrix3): Matrix3
  copy: function(self: Matrix3, m: Matrix3): Matrix3
  extractBasis: function(self: Matrix3, xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): Matrix3
  setFromMatrix4: function(self: Matrix3, m: Matrix4): Matrix3
  multiplyScalar: function(self: Matrix3, s: number): Matrix3
  determinant: function(self: Matrix3): number

  invert: function(self: Matrix3): Matrix3
  transpose: function(self: Matrix3): Matrix3
  getNormalMatrix: function(self: Matrix3, matrix4: Matrix4): Matrix3

  -- transposeIntoArray: function(self: Matrix3, r: number[]): Matrix3
  -- setUvTransform: function(self: Matrix3, tx: number, ty: number, sx: number, sy: number, rotation: number, cx: number, cy: number): Matrix3

  -- scale: function(self: Matrix3, sx: number, sy: number): Matrix3

  -- makeTranslation: function(self: Matrix3, v: Vector2): Matrix3
  -- makeTranslation: function(self: Matrix3, x: number, y: number): Matrix3
  -- makeRotation: function(self: Matrix3, theta: number): Matrix3
  -- makeScale: function(self: Matrix3, sx: number, sy: number): Matrix3

  -- rotate: function(self: Matrix3, theta: number): Matrix3
  -- translate: function(self: Matrix3, tx: number, ty: number): Matrix3

  equals: function(self: Matrix3, matrix: Matrix3): boolean

  -- fromArray: function(self: Matrix3, array: number[], offset: number): Matrix3
  -- toArray: function(self: Matrix3, array: number[], offset: number): Matrix3

  multiply: function(self: Matrix3, m: Matrix3): Matrix3
  premultiply: function(self: Matrix3, m: Matrix3): Matrix3

  multiplyMatrices: function(self: Matrix3, a: Matrix3, b: Matrix3): Matrix3
end

function Matrix3.new(): Matrix3
  local self : Matrix3 = js.new(js.global.THREE.Matrix3)
  return self
end
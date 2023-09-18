



local _matrix4 = {}

Matrix4 = {}






















































function Matrix4.new()
   local self = js.new(js.global.THREE.Matrix4)
   return self
end

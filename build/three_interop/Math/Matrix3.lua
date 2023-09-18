




local _matrix3 = {}

Matrix3 = {}







































function Matrix3.new()
   local self = js.new(js.global.THREE.Matrix3)
   return self
end
